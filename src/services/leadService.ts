import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { ContactChannel, LeadStatus } from '@/domain/constants'
import type { IsoTimestamp, Lead } from '@/domain/types'

export interface CreateLeadInput {
  name: string
  company?: string
  instagram?: string
  whatsapp?: string
  website?: string
  niche?: string
  city?: string
  source?: string
  tags?: string[]
  estimatedValueCents?: number
  notes?: string
  status?: LeadStatus
}

export type UpdateLeadInput = Partial<Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>>

/** Todos os serviços aceitam uma instância de banco opcional (para testes isolados). */
export async function createLead(input: CreateLeadInput, database: ControleadDB = defaultDb): Promise<Lead> {
  const now = new Date().toISOString()
  const lead: Lead = {
    id: crypto.randomUUID(),
    name: input.name,
    company: input.company,
    instagram: input.instagram,
    whatsapp: input.whatsapp,
    website: input.website,
    niche: input.niche,
    city: input.city,
    source: input.source,
    tags: input.tags ?? [],
    estimatedValueCents: input.estimatedValueCents,
    notes: input.notes,
    status: input.status ?? 'to_contact',
    createdAt: now,
    updatedAt: now,
  }

  await database.transaction('rw', database.leads, database.events, async () => {
    await database.leads.add(lead)
    await database.events.add({
      id: crypto.randomUUID(),
      leadId: lead.id,
      type: 'lead_created',
      at: now,
      createdAt: now,
    })
  })

  return lead
}

export async function updateLead(id: string, patch: UpdateLeadInput, database: ControleadDB = defaultDb): Promise<void> {
  const now = new Date().toISOString()
  await database.leads.update(id, { ...patch, updatedAt: now })
}

/**
 * Muda o status do lead, atualiza `lastInteractionAt` (mudança de status
 * conta como interação) e registra o evento `status_changed` na mesma
 * transação. Não faz nada se o status já for o mesmo.
 */
export async function changeStatus(id: string, newStatus: LeadStatus, database: ControleadDB = defaultDb): Promise<void> {
  const now = new Date().toISOString()

  await database.transaction('rw', database.leads, database.events, async () => {
    const lead = await database.leads.get(id)
    if (!lead) throw new Error(`Lead ${id} não encontrado`)
    if (lead.status === newStatus) return

    const patch: Partial<Lead> = {
      status: newStatus,
      updatedAt: now,
      lastInteractionAt: now,
    }
    if (newStatus === 'closed' && !lead.firstClosedAt) {
      patch.firstClosedAt = now
    }

    await database.leads.update(id, patch)
    await database.events.add({
      id: crypto.randomUUID(),
      leadId: id,
      type: 'status_changed',
      at: now,
      data: { from: lead.status, to: newStatus },
      createdAt: now,
    })
  })
}

/**
 * Nota manual no histórico do lead. Diferente de `changeStatus`/`logContact`
 * (etapa 6), uma nota NÃO conta como interação e não atualiza
 * `lastInteractionAt` — evita que só escrever um lembrete "esconda" um
 * lead parado.
 */
export async function addNote(leadId: string, text: string, database: ControleadDB = defaultDb): Promise<void> {
  const now = new Date().toISOString()
  await database.events.add({
    id: crypto.randomUUID(),
    leadId,
    type: 'note',
    at: now,
    text,
    createdAt: now,
  })
}

/**
 * Registra um contato manual (ligação, WhatsApp, etc.) — diferente de
 * `addNote`, isso conta como interação e atualiza `lastInteractionAt`.
 * `at` permite registrar um contato retroativo (ex.: "abordagem enviada
 * ontem"); por padrão usa o momento atual.
 */
export async function logContact(
  leadId: string,
  channel: ContactChannel,
  at?: IsoTimestamp,
  database: ControleadDB = defaultDb,
): Promise<void> {
  const eventAt = at ?? new Date().toISOString()
  const now = new Date().toISOString()

  await database.transaction('rw', database.leads, database.events, async () => {
    await database.leads.update(leadId, { lastInteractionAt: eventAt, updatedAt: now })
    await database.events.add({
      id: crypto.randomUUID(),
      leadId,
      type: 'contact',
      at: eventAt,
      data: { channel },
      createdAt: now,
    })
  })
}

export async function archiveLead(id: string, database: ControleadDB = defaultDb): Promise<void> {
  const now = new Date().toISOString()
  await database.leads.update(id, { archivedAt: now, updatedAt: now })
}

export async function unarchiveLead(id: string, database: ControleadDB = defaultDb): Promise<void> {
  const now = new Date().toISOString()
  await database.leads.update(id, { archivedAt: undefined, updatedAt: now })
}

/**
 * Exclui o lead permanentemente, junto com suas tarefas e eventos.
 * Bloqueado se o lead já tiver projetos (nesse caso, o chamador deve
 * oferecer arquivar em vez de excluir).
 */
export async function deleteLead(id: string, database: ControleadDB = defaultDb): Promise<void> {
  const projectCount = await database.projects.where('leadId').equals(id).count()
  if (projectCount > 0) {
    throw new Error('Não é possível excluir um lead que já possui projetos. Arquive-o em vez disso.')
  }

  await database.transaction('rw', database.leads, database.tasks, database.events, async () => {
    await database.leads.delete(id)
    await database.tasks.where('leadId').equals(id).delete()
    await database.events.where('leadId').equals(id).delete()
  })
}

/** Verifica se já existe outro lead com o mesmo Instagram ou WhatsApp (aviso não bloqueante). */
export async function findPotentialDuplicates(
  input: { instagram?: string; whatsapp?: string },
  excludeId?: string,
  database: ControleadDB = defaultDb,
): Promise<Lead[]> {
  const matches: Lead[] = []
  if (input.instagram) {
    const byInstagram = await database.leads.where('instagram').equals(input.instagram).toArray()
    matches.push(...byInstagram)
  }
  if (input.whatsapp) {
    const byWhatsapp = await database.leads.where('whatsapp').equals(input.whatsapp).toArray()
    matches.push(...byWhatsapp)
  }
  const unique = new Map(matches.map((lead) => [lead.id, lead]))
  if (excludeId) unique.delete(excludeId)
  return [...unique.values()]
}
