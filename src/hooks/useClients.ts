import { useMemo } from 'react'

import { getProjectFinance } from '@/domain/finance'
import type { Lead, Project } from '@/domain/types'

import { useLeads } from './useLeads'
import { useAllPayments } from './usePayments'
import { useAllProjectItems } from './useProjectItems'
import { useProjects } from './useProjects'

export interface ClientRow {
  lead: Lead
  projectCount: number
  totalCents: number
  receivedCents: number
  balanceCents: number
}

/** "Cliente" é derivado: um lead com pelo menos um projeto. Não existe tabela própria (ver plano §2). */
export function useClients(): ClientRow[] {
  const leads = useLeads({ includeArchived: true }) ?? []
  const projects = useProjects() ?? []
  const itemsByProject = useAllProjectItems()
  const paymentsByProject = useAllPayments()

  return useMemo(() => {
    const projectsByLead = new Map<string, Project[]>()
    for (const project of projects) {
      const arr = projectsByLead.get(project.leadId)
      if (arr) arr.push(project)
      else projectsByLead.set(project.leadId, [project])
    }

    const rows: ClientRow[] = []
    for (const lead of leads) {
      const leadProjects = projectsByLead.get(lead.id)
      if (!leadProjects || leadProjects.length === 0) continue

      let totalCents = 0
      let receivedCents = 0
      for (const project of leadProjects) {
        const finance = getProjectFinance(itemsByProject.get(project.id) ?? [], paymentsByProject.get(project.id) ?? [])
        totalCents += finance.totalCents
        receivedCents += finance.receivedCents
      }

      rows.push({ lead, projectCount: leadProjects.length, totalCents, receivedCents, balanceCents: totalCents - receivedCents })
    }

    return rows.sort((a, b) => b.totalCents - a.totalCents)
  }, [leads, projects, itemsByProject, paymentsByProject])
}

/** Um lead específico é "cliente" se já tiver pelo menos um projeto. */
export function useIsClient(leadId: string | undefined): boolean {
  const projects = useProjects() ?? []
  return !!leadId && projects.some((p) => p.leadId === leadId)
}
