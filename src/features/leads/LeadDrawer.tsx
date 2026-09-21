import { useState } from 'react'

import { Mail, MessageCircle, Phone, Plus, User } from 'lucide-react'

import { ContactLinks } from '@/components/shared/ContactLinks'
import { MoneyText } from '@/components/shared/MoneyText'
import { TaskItem } from '@/components/shared/TaskItem'
import { Timeline } from '@/components/shared/Timeline'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateInput } from '@/components/ui/DateInput'
import { Drawer } from '@/components/ui/Drawer'
import { Field } from '@/components/ui/Field'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import {
  CONTACT_CHANNEL_LABELS,
  LEAD_FINAL_STATUSES,
  LEAD_PIPELINE_ORDER,
  LEAD_STATUS_LABELS,
  type ContactChannel,
  type LeadStatus,
} from '@/domain/constants'
import { addDays, formatDate, today } from '@/domain/dates'
import type { Lead } from '@/domain/types'
import { useIsClient } from '@/hooks/useClients'
import { useLeadEvents } from '@/hooks/useLeadEvents'
import { useSettings } from '@/hooks/useSettings'
import { useLeadTasks } from '@/hooks/useTasks'
import { addNote, changeStatus, logContact } from '@/services/leadService'
import { cancelOpenTasksForLead, cancelTask, createTask, postponeTask } from '@/services/taskService'

import { CompleteTaskDialog } from '../tasks/CompleteTaskDialog'
import { TaskForm } from '../tasks/TaskForm'

interface LeadDrawerProps {
  lead: Lead
  open: boolean
  onClose: () => void
  onEdit: () => void
  onCloseDeal: () => void
}

const ALL_STATUSES: LeadStatus[] = [...LEAD_PIPELINE_ORDER, ...LEAD_FINAL_STATUSES.filter((s) => s !== 'closed')]

const QUICK_CONTACT_CHANNELS: { channel: ContactChannel; icon: typeof Phone }[] = [
  { channel: 'whatsapp', icon: MessageCircle },
  { channel: 'phone', icon: Phone },
  { channel: 'email', icon: Mail },
  { channel: 'in_person', icon: User },
]

export function LeadDrawer({ lead, open, onClose, onEdit, onCloseDeal }: LeadDrawerProps) {
  const events = useLeadEvents(lead.id)
  const tasks = useLeadTasks(lead.id)
  const settings = useSettings()
  const isClient = useIsClient(lead.id)
  const { showToast } = useToast()

  const [tab, setTab] = useState<'details' | 'history'>('details')
  const [note, setNote] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [taskFormOpen, setTaskFormOpen] = useState(false)
  const [completingTaskId, setCompletingTaskId] = useState<string | undefined>(undefined)
  const [followUpSuggestion, setFollowUpSuggestion] = useState<string | undefined>(undefined)
  const [confirmCancelTasks, setConfirmCancelTasks] = useState(false)

  const openTasks = (tasks ?? []).filter((t) => t.status === 'open')
  const completingTask = openTasks.find((t) => t.id === completingTaskId)

  async function handleStatusChange(newStatus: LeadStatus) {
    const wasClosed = lead.status === 'closed'
    await changeStatus(lead.id, newStatus)

    if (wasClosed && newStatus !== 'closed') {
      showToast('Lead reaberto: voltou a ficar ativo no pipeline', 'info')
    }

    const followUpDays = settings.followUpDays[newStatus]
    if (followUpDays) {
      setFollowUpSuggestion(addDays(today(), followUpDays))
    } else {
      setFollowUpSuggestion(undefined)
    }

    if (newStatus === 'not_interested' || newStatus === 'lost') {
      setConfirmCancelTasks(true)
    }
  }

  async function handleAddNote() {
    if (!note.trim()) return
    setSavingNote(true)
    try {
      await addNote(lead.id, note.trim())
      setNote('')
      showToast('Nota adicionada')
    } finally {
      setSavingNote(false)
    }
  }

  async function handleQuickContact(channel: ContactChannel) {
    await logContact(lead.id, channel)
    showToast(`Contato via ${CONTACT_CHANNEL_LABELS[channel]} registrado`)
  }

  return (
    <Drawer open={open} onClose={onClose} title={lead.name}>
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div>
            {lead.company ? <p className="text-sm text-[var(--color-text-secondary)]">{lead.company}</p> : null}
            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              Cadastrado em {formatDate(lead.createdAt.slice(0, 10))}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button variant="secondary" size="sm" onClick={onEdit}>
              Editar dados
            </Button>
            <Button variant="primary" size="sm" onClick={onCloseDeal}>
              {isClient ? 'Novo projeto' : 'Fechar negócio'}
            </Button>
          </div>
        </div>

        <Field label="Status">
          <Select value={lead.status} onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}>
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {LEAD_STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </Field>

        {followUpSuggestion ? (
          <div className="flex items-center justify-between gap-2 rounded-md border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)] px-3 py-2 text-sm">
            <span className="text-[var(--color-text-primary)]">Criar follow-up para</span>
            <DateInput value={followUpSuggestion} onChange={(v) => setFollowUpSuggestion(v)} />
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant="primary"
                onClick={async () => {
                  if (!followUpSuggestion) return
                  await createTask({ leadId: lead.id, type: 'follow_up', dueDate: followUpSuggestion })
                  showToast('Follow-up criado')
                  setFollowUpSuggestion(undefined)
                }}
              >
                Criar
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setFollowUpSuggestion(undefined)}>
                Dispensar
              </Button>
            </div>
          </div>
        ) : null}

        <ContactLinks whatsapp={lead.whatsapp} instagram={lead.instagram} website={lead.website} />

        <div className="flex flex-wrap gap-3 text-sm">
          {lead.niche ? (
            <span className="text-[var(--color-text-secondary)]">
              Nicho: <span className="text-[var(--color-text-primary)]">{lead.niche}</span>
            </span>
          ) : null}
          {lead.city ? (
            <span className="text-[var(--color-text-secondary)]">
              Cidade: <span className="text-[var(--color-text-primary)]">{lead.city}</span>
            </span>
          ) : null}
          {lead.source ? (
            <span className="text-[var(--color-text-secondary)]">
              Origem: <span className="text-[var(--color-text-primary)]">{lead.source}</span>
            </span>
          ) : null}
          {lead.estimatedValueCents !== undefined ? (
            <span className="text-[var(--color-text-secondary)]">
              Valor estimado: <MoneyText cents={lead.estimatedValueCents} />
            </span>
          ) : null}
        </div>

        {lead.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {lead.tags.map((tag) => (
              <Badge key={tag}>{tag}</Badge>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Próxima ação</span>
            <Button variant="ghost" size="sm" icon={<Plus size={14} />} onClick={() => setTaskFormOpen(true)}>
              Nova tarefa
            </Button>
          </div>
          {openTasks.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Nenhuma tarefa em aberto.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {openTasks.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  subjectName={lead.name}
                  actions={
                    <>
                      <Button size="sm" variant="secondary" onClick={() => postponeTask(t.id)}>
                        +1d
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => cancelTask(t.id)}>
                        Cancelar
                      </Button>
                      <Button size="sm" variant="primary" onClick={() => setCompletingTaskId(t.id)}>
                        Concluir
                      </Button>
                    </>
                  }
                />
              ))}
            </div>
          )}
        </div>

        <Tabs
          items={[
            { value: 'details', label: 'Detalhes' },
            { value: 'history', label: 'Histórico' },
          ]}
          value={tab}
          onChange={(v) => setTab(v as 'details' | 'history')}
        />

        {tab === 'details' ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[var(--color-text-primary)]">Observações</span>
            <p className="text-sm whitespace-pre-wrap text-[var(--color-text-secondary)]">
              {lead.notes || 'Nenhuma observação registrada.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Registrar contato</span>
              <div className="flex gap-1.5">
                {QUICK_CONTACT_CHANNELS.map(({ channel, icon: Icon }) => (
                  <Button key={channel} variant="secondary" size="sm" onClick={() => handleQuickContact(channel)}>
                    <Icon size={14} />
                    {CONTACT_CHANNEL_LABELS[channel]}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">Adicionar nota</span>
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ex.: cliente pediu para retornar semana que vem" />
              <Button
                variant="secondary"
                size="sm"
                className="self-end"
                disabled={!note.trim() || savingNote}
                onClick={handleAddNote}
              >
                Salvar nota
              </Button>
            </div>

            <div>
              <span className="mb-2 block text-xs font-medium text-[var(--color-text-secondary)]">Linha do tempo</span>
              <Timeline events={events ?? []} />
            </div>
          </div>
        )}
      </div>

      <TaskForm open={taskFormOpen} onClose={() => setTaskFormOpen(false)} leadId={lead.id} />
      <CompleteTaskDialog task={completingTask} onClose={() => setCompletingTaskId(undefined)} />
      <ConfirmDialog
        open={confirmCancelTasks}
        onCancel={() => setConfirmCancelTasks(false)}
        onConfirm={async () => {
          await cancelOpenTasksForLead(lead.id)
          showToast('Tarefas abertas canceladas')
          setConfirmCancelTasks(false)
        }}
        title="Cancelar tarefas abertas?"
        description={`"${lead.name}" tem tarefas em aberto. Já que o lead não vai mais avançar, cancelar essas tarefas?`}
        confirmLabel="Cancelar tarefas"
      />
    </Drawer>
  )
}
