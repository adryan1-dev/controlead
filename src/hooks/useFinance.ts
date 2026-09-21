import { useMemo } from 'react'

import type { FinanceStatus } from '@/domain/constants'
import { isSameMonth } from '@/domain/dates'
import { getProjectFinance } from '@/domain/finance'
import type { Project } from '@/domain/types'

import { useLeads } from './useLeads'
import { useAllPayments } from './usePayments'
import { useAllProjectItems } from './useProjectItems'
import { useProjects } from './useProjects'

export interface FinanceRow {
  project: Project
  leadName: string
  totalCents: number
  receivedCents: number
  balanceCents: number
  status: FinanceStatus
}

export interface FinanceData {
  /** Vendido no mês: soma de itens contratado+adicional−desconto cuja data cai no mês. */
  soldCents: number
  /** Recebido no mês: soma dos pagamentos cuja data cai no mês. */
  receivedCents: number
  /** A receber: soma dos saldos positivos de todos os projetos não cancelados (sem filtro de mês). */
  receivableCents: number
  pendingCount: number
  rows: FinanceRow[]
}

export function useFinance(monthKey: string): FinanceData {
  const projects = useProjects() ?? []
  const leads = useLeads({ includeArchived: true }) ?? []
  const itemsByProject = useAllProjectItems()
  const paymentsByProject = useAllPayments()

  return useMemo(() => {
    const leadNameById = new Map(leads.map((l) => [l.id, l.name]))

    let soldCents = 0
    let receivedCents = 0
    let receivableCents = 0
    let pendingCount = 0
    const rows: FinanceRow[] = []

    for (const project of projects) {
      const items = itemsByProject.get(project.id) ?? []
      const payments = paymentsByProject.get(project.id) ?? []
      const finance = getProjectFinance(items, payments)

      for (const item of items) {
        if (!isSameMonth(item.date, monthKey)) continue
        if (item.type === 'contracted' || item.type === 'additional') soldCents += item.amountCents
        if (item.type === 'discount') soldCents -= item.amountCents
      }

      for (const payment of payments) {
        if (isSameMonth(payment.date, monthKey)) receivedCents += payment.amountCents
      }

      if (project.status !== 'cancelled' && finance.balanceCents > 0) {
        receivableCents += finance.balanceCents
        pendingCount += 1
      }

      rows.push({
        project,
        leadName: leadNameById.get(project.leadId) ?? '—',
        totalCents: finance.totalCents,
        receivedCents: finance.receivedCents,
        balanceCents: finance.balanceCents,
        status: finance.status,
      })
    }

    rows.sort((a, b) => b.balanceCents - a.balanceCents)

    return { soldCents, receivedCents, receivableCents, pendingCount, rows }
  }, [projects, leads, itemsByProject, paymentsByProject, monthKey])
}
