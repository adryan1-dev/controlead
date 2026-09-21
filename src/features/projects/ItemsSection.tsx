import { useState } from 'react'

import { Plus, Trash2 } from 'lucide-react'

import { MoneyText } from '@/components/shared/MoneyText'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateInput } from '@/components/ui/DateInput'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { PROJECT_ITEM_TYPE_LABELS, PROJECT_ITEM_TYPES, type ProjectItemType } from '@/domain/constants'
import { formatDate, today } from '@/domain/dates'
import { projectItemFormSchema } from '@/domain/schemas'
import type { ProjectItem } from '@/domain/types'
import { addProjectItem, removeProjectItem } from '@/services/projectService'

interface ItemsSectionProps {
  projectId: string
  items: ProjectItem[]
}

const TYPE_TONE: Record<ProjectItemType, 'neutral' | 'info' | 'success' | 'warning'> = {
  contracted: 'info',
  additional: 'success',
  courtesy: 'warning',
  discount: 'neutral',
}

export function ItemsSection({ projectId, items }: ItemsSectionProps) {
  const { showToast } = useToast()
  const [formOpen, setFormOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<ProjectItem | undefined>(undefined)

  const [description, setDescription] = useState('')
  const [type, setType] = useState<ProjectItemType>('additional')
  const [amountCents, setAmountCents] = useState<number | undefined>(undefined)
  const [date, setDate] = useState(today())
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  function resetForm() {
    setDescription('')
    setType('additional')
    setAmountCents(undefined)
    setDate(today())
    setNote('')
    setError(undefined)
  }

  async function handleSubmit() {
    const parsed = projectItemFormSchema.safeParse({
      description,
      type,
      amountCents: amountCents ?? 0,
      date,
      note: note || undefined,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message)
      return
    }
    await addProjectItem(projectId, parsed.data)
    showToast('Item adicionado')
    resetForm()
    setFormOpen(false)
  }

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Itens combinados</h2>
        <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setFormOpen(true)}>
          Item
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)]">Nenhum item registrado ainda.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate font-medium text-[var(--color-text-primary)]">{item.description}</span>
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
                      TYPE_TONE[item.type] === 'info'
                        ? 'bg-[var(--color-info-bg)] text-[var(--color-info)]'
                        : TYPE_TONE[item.type] === 'success'
                          ? 'bg-[var(--color-success-bg)] text-[var(--color-success)]'
                          : TYPE_TONE[item.type] === 'warning'
                            ? 'bg-[var(--color-warning-bg)] text-[var(--color-warning)]'
                            : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {PROJECT_ITEM_TYPE_LABELS[item.type]}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {formatDate(item.date)}
                  {item.note ? ` · ${item.note}` : ''}
                </p>
              </div>
              <MoneyText cents={item.type === 'discount' ? -item.amountCents : item.amountCents} />
              <IconButton icon={<Trash2 size={14} />} label="Remover item" onClick={() => setRemoveTarget(item)} />
            </div>
          ))}
        </div>
      )}

      <Modal
        open={formOpen}
        onClose={() => {
          resetForm()
          setFormOpen(false)
        }}
        title="Novo item"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              Adicionar
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Field label="Descrição" required error={error}>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ex.: Página adicional" />
          </Field>
          <Field label="Tipo">
            <Select value={type} onChange={(e) => setType(e.target.value as ProjectItemType)}>
              {PROJECT_ITEM_TYPES.map((t) => (
                <option key={t} value={t}>
                  {PROJECT_ITEM_TYPE_LABELS[t]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Valor" helperText={type === 'courtesy' ? 'valor de referência (não entra no total)' : undefined}>
            <MoneyInput value={amountCents} onChange={setAmountCents} />
          </Field>
          <Field label="Data">
            <DateInput value={date} onChange={(v) => setDate(v ?? today())} />
          </Field>
          <Field label="Observação">
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!removeTarget}
        onCancel={() => setRemoveTarget(undefined)}
        onConfirm={async () => {
          if (!removeTarget) return
          await removeProjectItem(removeTarget.id)
          showToast('Item removido')
          setRemoveTarget(undefined)
        }}
        title="Remover item?"
        description={`"${removeTarget?.description}" será removido do projeto.`}
        confirmLabel="Remover"
        danger
      />
    </Card>
  )
}
