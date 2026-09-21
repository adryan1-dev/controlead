import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { PaymentMethod } from '@/domain/constants'
import { today } from '@/domain/dates'
import type { CloseDealFormInput } from '@/domain/schemas'
import type { DateString, Lead, Project } from '@/domain/types'

export interface CloseDealInput {
  service: string
  originalCents: number
  discountCents: number
  depositCents: number
  depositMethod?: PaymentMethod
  dueDate?: DateString
  paymentTerms?: string
  notes?: string
}

/**
 * Converte um lead em cliente: cria o projeto, o item de preço combinado
 * (e o desconto, se houver), o pagamento da entrada (se houver), cancela
 * as tarefas comerciais abertas do lead e registra tudo no histórico —
 * numa única transação (ver plano §8).
 */
export async function closeDeal(
  leadId: string,
  input: CloseDealInput | CloseDealFormInput,
  database: ControleadDB = defaultDb,
): Promise<Project> {
  const now = new Date().toISOString()
  const closedAt = today()
  const projectId = crypto.randomUUID()

  return database.transaction(
    'rw',
    [database.leads, database.projects, database.projectItems, database.payments, database.tasks, database.events],
    async () => {
      const lead = await database.leads.get(leadId)
      if (!lead) throw new Error(`Lead ${leadId} não encontrado`)

      const fromStatus = lead.status
      const leadPatch: Partial<Lead> = { status: 'closed', updatedAt: now, lastInteractionAt: now }
      if (!lead.firstClosedAt) leadPatch.firstClosedAt = now
      await database.leads.update(leadId, leadPatch)

      const project: Project = {
        id: projectId,
        leadId,
        service: input.service,
        status: 'not_started',
        closedAt,
        dueDate: input.dueDate,
        paymentTerms: input.paymentTerms,
        notes: input.notes,
        createdAt: now,
        updatedAt: now,
      }
      await database.projects.add(project)

      await database.projectItems.add({
        id: crypto.randomUUID(),
        projectId,
        description: input.service,
        type: 'contracted',
        amountCents: input.originalCents,
        date: closedAt,
        createdAt: now,
      })

      if (input.discountCents > 0) {
        await database.projectItems.add({
          id: crypto.randomUUID(),
          projectId,
          description: 'Desconto no fechamento',
          type: 'discount',
          amountCents: input.discountCents,
          date: closedAt,
          createdAt: now,
        })
      }

      if (input.depositCents > 0 && input.depositMethod) {
        await database.payments.add({
          id: crypto.randomUUID(),
          projectId,
          amountCents: input.depositCents,
          date: closedAt,
          method: input.depositMethod,
          note: 'Entrada',
          createdAt: now,
        })
      }

      const openTasks = await database.tasks
        .where('leadId')
        .equals(leadId)
        .filter((t) => t.status === 'open')
        .toArray()
      await database.tasks.bulkPut(
        openTasks.map((t) => ({
          ...t,
          status: 'cancelled' as const,
          note: t.note ? `${t.note} (encerrada no fechamento)` : 'Encerrada no fechamento',
        })),
      )

      await database.events.add({
        id: crypto.randomUUID(),
        leadId,
        projectId,
        type: 'status_changed',
        at: now,
        data: { from: fromStatus, to: 'closed' },
        createdAt: now,
      })
      await database.events.add({
        id: crypto.randomUUID(),
        leadId,
        projectId,
        type: 'deal_closed',
        at: now,
        data: { amountCents: input.originalCents - input.discountCents },
        createdAt: now,
      })
      if (input.depositCents > 0) {
        await database.events.add({
          id: crypto.randomUUID(),
          leadId,
          projectId,
          type: 'payment_added',
          at: now,
          data: { amountCents: input.depositCents },
          createdAt: now,
        })
      }

      return project
    },
  )
}
