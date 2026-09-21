import type { ReactNode } from 'react'

import { TASK_TYPE_LABELS } from '@/domain/constants'
import type { Task } from '@/domain/types'

import { DueLabel } from './DueLabel'

interface TaskItemProps {
  task: Task
  /** Nome do lead ou do projeto associado, usado para compor o título derivado. */
  subjectName: string
  actions?: ReactNode
}

/** Uma linha de tarefa com título derivado (nunca armazenado), prazo e ações. */
export function TaskItem({ task, subjectName, actions }: TaskItemProps) {
  const title =
    task.type === 'other' && task.note
      ? task.note
      : `${TASK_TYPE_LABELS[task.type]} · ${subjectName}`

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="truncate text-sm font-medium text-[var(--color-text-primary)]">{title}</span>
        <DueLabel date={task.dueDate} />
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </div>
  )
}
