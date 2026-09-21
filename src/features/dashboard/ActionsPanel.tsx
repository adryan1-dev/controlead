import { useMemo, useState } from 'react'

import { ContactLinks } from '@/components/shared/ContactLinks'
import { TaskItem } from '@/components/shared/TaskItem'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { useToast } from '@/components/ui/Toast'
import { addDays, isBefore, today } from '@/domain/dates'
import type { Lead, Task } from '@/domain/types'
import { useLeads } from '@/hooks/useLeads'
import { useOpenTasks } from '@/hooks/useOpenTasks'
import { completeTask, postponeTask } from '@/services/taskService'

import { CompleteTaskDialog } from '../tasks/CompleteTaskDialog'

interface TaskGroupProps {
  title: string
  tone: 'danger' | 'warning' | 'neutral'
  tasks: Task[]
  leadById: Map<string, Lead>
  onComplete: (task: Task) => void
  onCompleteAndNext: (task: Task) => void
  onPostpone: (task: Task) => void
}

const TONE_TEXT: Record<TaskGroupProps['tone'], string> = {
  danger: 'text-[var(--color-danger)]',
  warning: 'text-[var(--color-warning)]',
  neutral: 'text-[var(--color-text-secondary)]',
}

function TaskGroup({ title, tone, tasks, leadById, onComplete, onCompleteAndNext, onPostpone }: TaskGroupProps) {
  if (tasks.length === 0) return null

  return (
    <div className="flex flex-col gap-1.5">
      <h3 className={`text-xs font-semibold uppercase tracking-wide ${TONE_TEXT[tone]}`}>
        {title} ({tasks.length})
      </h3>
      {tasks.map((task) => {
        const lead = leadById.get(task.leadId)
        return (
          <div key={task.id} className="flex items-center gap-2">
            <div className="flex-1">
              <TaskItem task={task} subjectName={lead?.name ?? 'Lead removido'} />
            </div>
            {lead ? <ContactLinks whatsapp={lead.whatsapp} instagram={lead.instagram} website={lead.website} /> : null}
            <div className="flex shrink-0 gap-1">
              <Button size="sm" variant="secondary" onClick={() => onPostpone(task)}>
                +1d
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onCompleteAndNext(task)}>
                Concluir e próxima
              </Button>
              <Button size="sm" variant="primary" onClick={() => onComplete(task)}>
                Concluir
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Tarefas abertas de todos os leads, agrupadas por urgência. O coração acionável do Dashboard. */
export function ActionsPanel() {
  const tasks = useOpenTasks() ?? []
  const leads = useLeads({ includeArchived: true }) ?? []
  const { showToast } = useToast()
  const [completingTaskId, setCompletingTaskId] = useState<string | undefined>(undefined)

  const leadById = useMemo(() => new Map(leads.map((l) => [l.id, l])), [leads])

  const { overdue, dueToday, upcoming } = useMemo(() => {
    const todayStr = today()
    const in7Days = addDays(todayStr, 7)
    const overdue: Task[] = []
    const dueToday: Task[] = []
    const upcoming: Task[] = []
    for (const t of tasks) {
      if (isBefore(t.dueDate, todayStr)) overdue.push(t)
      else if (t.dueDate === todayStr) dueToday.push(t)
      else if (!isBefore(in7Days, t.dueDate)) upcoming.push(t)
    }
    const byDate = (a: Task, b: Task) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0)
    return { overdue: overdue.sort(byDate), dueToday: dueToday.sort(byDate), upcoming: upcoming.sort(byDate) }
  }, [tasks])

  const completingTask = tasks.find((t) => t.id === completingTaskId)

  async function handleComplete(task: Task) {
    await completeTask(task.id)
    showToast('Ação concluída')
  }

  async function handlePostpone(task: Task) {
    await postponeTask(task.id, 1)
    showToast('Adiada em 1 dia')
  }

  const hasAny = overdue.length + dueToday.length + upcoming.length > 0

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Ações pendentes</h2>

      {!hasAny ? (
        <EmptyState title="Tudo em dia" description="Nenhuma ação pendente para os próximos 7 dias." />
      ) : (
        <>
          <TaskGroup
            title="Atrasadas"
            tone="danger"
            tasks={overdue}
            leadById={leadById}
            onComplete={handleComplete}
            onCompleteAndNext={(t) => setCompletingTaskId(t.id)}
            onPostpone={handlePostpone}
          />
          <TaskGroup
            title="Hoje"
            tone="warning"
            tasks={dueToday}
            leadById={leadById}
            onComplete={handleComplete}
            onCompleteAndNext={(t) => setCompletingTaskId(t.id)}
            onPostpone={handlePostpone}
          />
          <TaskGroup
            title="Próximos 7 dias"
            tone="neutral"
            tasks={upcoming}
            leadById={leadById}
            onComplete={handleComplete}
            onCompleteAndNext={(t) => setCompletingTaskId(t.id)}
            onPostpone={handlePostpone}
          />
        </>
      )}

      <CompleteTaskDialog task={completingTask} onClose={() => setCompletingTaskId(undefined)} />
    </Card>
  )
}
