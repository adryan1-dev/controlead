import { isLeadStatusActive } from './constants'
import { diffDays, isBefore } from './dates'
import type { DateString, Lead, Task } from './types'

export type DeadlineState = 'overdue' | 'soon' | 'ok' | 'none'

/**
 * Estado do prazo de um projeto em relação a hoje. `undefined`/sem prazo
 * retorna 'none' (sem alerta). Projetos entregues/cancelados devem ser
 * filtrados pelo chamador antes de checar isso (ver PROJECT_STATUS_EXCLUDED_FROM_TRACKING).
 */
export function deadlineState(dueDate: DateString | undefined, todayStr: DateString, warnDays: number): DeadlineState {
  if (!dueDate) return 'none'
  if (isBefore(dueDate, todayStr)) return 'overdue'
  if (diffDays(todayStr, dueDate) <= warnDays) return 'soon'
  return 'ok'
}

/** A tarefa aberta mais próxima (menor dueDate) de uma lista. */
export function nextOpenTask(tasks: Task[]): Task | undefined {
  return tasks
    .filter((t) => t.status === 'open')
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0))[0]
}

/**
 * Um lead está "parado" quando: está em status ativo (não fechado/final),
 * não há interação registrada há `staleDays` dias ou mais, e não existe
 * nenhuma tarefa aberta com vencimento hoje ou no futuro (ou seja,
 * ninguém já planejou o próximo passo).
 */
export function isStale(lead: Lead, openTasksForLead: Task[], todayStr: DateString, staleDays: number): boolean {
  if (!isLeadStatusActive(lead.status)) return false

  const referenceIso = lead.lastInteractionAt ?? lead.createdAt
  const referenceDate = referenceIso.slice(0, 10) as DateString
  const daysSince = diffDays(referenceDate, todayStr)

  const hasUpcomingOpenTask = openTasksForLead.some((t) => t.status === 'open' && !isBefore(t.dueDate, todayStr))

  return daysSince >= staleDays && !hasUpcomingOpenTask
}

export function daysStale(lead: Lead, todayStr: DateString): number {
  const referenceIso = lead.lastInteractionAt ?? lead.createdAt
  const referenceDate = referenceIso.slice(0, 10) as DateString
  return diffDays(referenceDate, todayStr)
}

/** Lead ativo com uma tarefa de follow-up aberta vencida (hoje ou antes). */
export function isFollowUpPending(lead: Lead, tasksForLead: Task[], todayStr: DateString): boolean {
  if (!isLeadStatusActive(lead.status)) return false
  return tasksForLead.some((t) => t.status === 'open' && t.type === 'follow_up' && !isBefore(todayStr, t.dueDate))
}
