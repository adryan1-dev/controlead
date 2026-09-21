import { useMemo } from 'react'

import { PROJECT_STATUS_EXCLUDED_FROM_TRACKING, isLeadStatusActive } from '@/domain/constants'
import { currentMonthKey, isSameMonth, today } from '@/domain/dates'
import { getProjectFinance } from '@/domain/finance'
import { deadlineState, isFollowUpPending, isStale } from '@/domain/rules'
import type { Lead, Project } from '@/domain/types'

import { useLeads } from './useLeads'
import { useOpenTasks } from './useOpenTasks'
import { useAllPayments } from './usePayments'
import { useAllProjectItems } from './useProjectItems'
import { useProjects } from './useProjects'
import { useSettings } from './useSettings'

export interface DashboardData {
  activeLeadsCount: number
  followUpPendingCount: number
  newLeadsThisMonth: number
  closedDealsThisMonth: number
  projectsInProgress: number
  deadlineSoonCount: number
  deadlineOverdueCount: number
  awaitingPaymentCount: number
  soldThisMonthCents: number
  receivedThisMonthCents: number
  receivableCents: number

  staleLeads: Lead[]
  overdueProjects: Project[]
  soonProjects: Project[]
  deliveredWithBalance: Project[]
}

export function useDashboard(): DashboardData {
  const leads = useLeads({ includeArchived: false }) ?? []
  const projects = useProjects() ?? []
  const openTasks = useOpenTasks() ?? []
  const itemsByProject = useAllProjectItems()
  const paymentsByProject = useAllPayments()
  const settings = useSettings()

  return useMemo(() => {
    const todayStr = today()
    const monthKey = currentMonthKey()

    const tasksByLead = new Map<string, typeof openTasks>()
    for (const t of openTasks) {
      const arr = tasksByLead.get(t.leadId)
      if (arr) arr.push(t)
      else tasksByLead.set(t.leadId, [t])
    }

    const activeLeads = leads.filter((l) => isLeadStatusActive(l.status))
    const followUpPendingCount = activeLeads.filter((l) =>
      isFollowUpPending(l, tasksByLead.get(l.id) ?? [], todayStr),
    ).length
    const newLeadsThisMonth = leads.filter((l) => isSameMonth(l.createdAt.slice(0, 10), monthKey)).length
    const closedDealsThisMonth = projects.filter((p) => isSameMonth(p.closedAt, monthKey)).length
    const staleLeads = activeLeads.filter((l) => isStale(l, tasksByLead.get(l.id) ?? [], todayStr, settings.staleDays))

    const projectsInProgress = projects.filter((p) => p.status === 'in_progress').length

    const trackedProjects = projects.filter((p) => !PROJECT_STATUS_EXCLUDED_FROM_TRACKING.includes(p.status))
    const overdueProjects = trackedProjects.filter((p) => deadlineState(p.dueDate, todayStr, settings.deadlineWarningDays) === 'overdue')
    const soonProjects = trackedProjects.filter((p) => deadlineState(p.dueDate, todayStr, settings.deadlineWarningDays) === 'soon')

    let soldThisMonthCents = 0
    let receivedThisMonthCents = 0
    let receivableCents = 0
    let awaitingPaymentCount = 0
    const deliveredWithBalance: Project[] = []

    for (const project of projects) {
      const items = itemsByProject.get(project.id) ?? []
      const payments = paymentsByProject.get(project.id) ?? []
      const finance = getProjectFinance(items, payments)

      for (const item of items) {
        if (!isSameMonth(item.date, monthKey)) continue
        if (item.type === 'contracted' || item.type === 'additional') soldThisMonthCents += item.amountCents
        if (item.type === 'discount') soldThisMonthCents -= item.amountCents
      }
      for (const payment of payments) {
        if (isSameMonth(payment.date, monthKey)) receivedThisMonthCents += payment.amountCents
      }

      if (project.status !== 'cancelled' && finance.balanceCents > 0) {
        receivableCents += finance.balanceCents
        awaitingPaymentCount += 1
        if (project.status === 'delivered') deliveredWithBalance.push(project)
      }
    }

    return {
      activeLeadsCount: activeLeads.length,
      followUpPendingCount,
      newLeadsThisMonth,
      closedDealsThisMonth,
      projectsInProgress,
      deadlineSoonCount: soonProjects.length,
      deadlineOverdueCount: overdueProjects.length,
      awaitingPaymentCount,
      soldThisMonthCents,
      receivedThisMonthCents,
      receivableCents,
      staleLeads,
      overdueProjects,
      soonProjects,
      deliveredWithBalance,
    }
  }, [leads, projects, openTasks, itemsByProject, paymentsByProject, settings.staleDays, settings.deadlineWarningDays])
}
