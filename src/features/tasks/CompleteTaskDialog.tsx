import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { DateInput } from '@/components/ui/DateInput'
import { Field } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { TASK_TYPES, TASK_TYPE_LABELS, type TaskType } from '@/domain/constants'
import { addDays, today } from '@/domain/dates'
import type { Task } from '@/domain/types'
import { completeTask } from '@/services/taskService'

interface CompleteTaskDialogProps {
  task: Task | undefined
  onClose: () => void
}

/** Ao concluir uma tarefa, oferece já cadastrar a próxima (tipo + data pré-preenchidos). */
export function CompleteTaskDialog({ task, onClose }: CompleteTaskDialogProps) {
  const { showToast } = useToast()
  const [createNext, setCreateNext] = useState(true)
  const [nextType, setNextType] = useState<TaskType>('follow_up')
  const [nextDate, setNextDate] = useState(addDays(today(), 3))
  const [nextNote, setNextNote] = useState('')
  const [saving, setSaving] = useState(false)

  if (!task) return null

  async function handleConfirm() {
    if (!task) return
    setSaving(true)
    try {
      await completeTask(
        task.id,
        createNext ? { type: nextType, dueDate: nextDate, note: nextNote || undefined } : undefined,
      )
      showToast(createNext ? 'Ação concluída e próxima criada' : 'Ação concluída')
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={!!task}
      onClose={onClose}
      title="Concluir ação"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={saving}>
            Concluir
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--color-text-primary)]">
          <input type="checkbox" checked={createNext} onChange={(e) => setCreateNext(e.target.checked)} />
          Já cadastrar a próxima ação
        </label>

        {createNext ? (
          <>
            <Field label="Tipo">
              <Select value={nextType} onChange={(e) => setNextType(e.target.value as TaskType)}>
                {TASK_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {TASK_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Data" required>
              <DateInput value={nextDate} onChange={(v) => setNextDate(v ?? '')} />
            </Field>
            <Field label="Nota">
              <Textarea value={nextNote} onChange={(e) => setNextNote(e.target.value)} rows={2} />
            </Field>
          </>
        ) : null}
      </div>
    </Modal>
  )
}
