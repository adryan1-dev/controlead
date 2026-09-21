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
import { createTask } from '@/services/taskService'

interface TaskFormProps {
  open: boolean
  onClose: () => void
  leadId: string
  projectId?: string
}

/** Modal para criar uma nova tarefa/próxima ação a partir do Drawer do lead (ou projeto). */
export function TaskForm({ open, onClose, leadId, projectId }: TaskFormProps) {
  const { showToast } = useToast()
  const [type, setType] = useState<TaskType>('follow_up')
  const [dueDate, setDueDate] = useState(addDays(today(), 3))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setType('follow_up')
    setDueDate(addDays(today(), 3))
    setNote('')
  }

  async function handleSubmit() {
    setSaving(true)
    try {
      await createTask({ leadId, projectId, type, dueDate, note: note || undefined })
      showToast('Tarefa criada')
      reset()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova tarefa"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} disabled={!dueDate || saving}>
            Criar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <Field label="Tipo">
          <Select value={type} onChange={(e) => setType(e.target.value as TaskType)}>
            {TASK_TYPES.map((t) => (
              <option key={t} value={t}>
                {TASK_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Data" required>
          <DateInput value={dueDate} onChange={(v) => setDueDate(v ?? '')} />
        </Field>
        <Field label="Nota">
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
        </Field>
      </div>
    </Modal>
  )
}
