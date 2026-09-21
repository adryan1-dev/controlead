import { useState } from 'react'

import { ExternalLink, Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { Timeline } from '@/components/shared/Timeline'
import { Card } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateInput } from '@/components/ui/DateInput'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES, type ProjectStatus } from '@/domain/constants'
import { getProjectFinance } from '@/domain/finance'
import { websiteUrl } from '@/domain/links'
import { useLead } from '@/hooks/useLead'
import { useProject } from '@/hooks/useProjects'
import { useProjectEvents } from '@/hooks/useProjectEvents'
import { useProjectItems } from '@/hooks/useProjectItems'
import { useProjectPayments } from '@/hooks/usePayments'
import { changeProjectStatus, deleteProject, updateProject } from '@/services/projectService'

import { FinanceSummary } from './FinanceSummary'
import { ItemsSection } from './ItemsSection'
import { PaymentsSection } from './PaymentsSection'

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const project = useProject(id)
  const lead = useLead(project?.leadId)
  const items = useProjectItems(id) ?? []
  const payments = useProjectPayments(id) ?? []
  const events = useProjectEvents(id) ?? []

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [notesDraft, setNotesDraft] = useState<string | undefined>(undefined)

  if (!project) {
    return (
      <>
        <PageHeader title="Projeto" />
        <p className="text-sm text-[var(--color-text-secondary)]">Projeto não encontrado.</p>
      </>
    )
  }

  const finance = getProjectFinance(items, payments)

  return (
    <>
      <PageHeader
        title={project.service}
        actions={
          <IconButton
            icon={<Trash2 size={16} />}
            label="Excluir projeto"
            onClick={() => setConfirmDelete(true)}
          />
        }
      />

      <div className="flex flex-col gap-4">
        <Card className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {lead ? (
              <button
                onClick={() => navigate(`/leads/${lead.id}`)}
                className="text-sm font-medium text-[var(--color-accent)] hover:underline"
              >
                {lead.name}
              </button>
            ) : null}
            <StatusBadge kind="project" status={project.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Status">
              <Select
                value={project.status}
                onChange={(e) => changeProjectStatus(project.id, e.target.value as ProjectStatus)}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Início">
              <DateInput value={project.startDate} onChange={(v) => updateProject(project.id, { startDate: v })} />
            </Field>
            <Field label="Prazo">
              <DateInput value={project.dueDate} onChange={(v) => updateProject(project.id, { dueDate: v })} />
            </Field>
            <Field label="Entregue em">
              <DateInput value={project.deliveredAt} onChange={(v) => updateProject(project.id, { deliveredAt: v })} />
            </Field>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="URL da prévia">
              <div className="flex gap-1.5">
                <Input
                  value={project.previewUrl ?? ''}
                  onChange={(e) => updateProject(project.id, { previewUrl: e.target.value || undefined })}
                  placeholder="https://…"
                />
                {project.previewUrl ? (
                  <IconButton
                    icon={<ExternalLink size={14} />}
                    label="Abrir prévia"
                    onClick={() => window.open(websiteUrl(project.previewUrl!) ?? '#', '_blank', 'noopener,noreferrer')}
                  />
                ) : null}
              </div>
            </Field>
            <Field label="URL final">
              <div className="flex gap-1.5">
                <Input
                  value={project.finalUrl ?? ''}
                  onChange={(e) => updateProject(project.id, { finalUrl: e.target.value || undefined })}
                  placeholder="https://…"
                />
                {project.finalUrl ? (
                  <IconButton
                    icon={<ExternalLink size={14} />}
                    label="Abrir site final"
                    onClick={() => window.open(websiteUrl(project.finalUrl!) ?? '#', '_blank', 'noopener,noreferrer')}
                  />
                ) : null}
              </div>
            </Field>
          </div>

          <Field label="Condições de pagamento">
            <Input
              value={project.paymentTerms ?? ''}
              onChange={(e) => updateProject(project.id, { paymentTerms: e.target.value || undefined })}
              placeholder="Ex.: 50% entrada + 50% na entrega"
            />
          </Field>

          <Field label="Observações">
            <Textarea
              value={notesDraft ?? project.notes ?? ''}
              onChange={(e) => setNotesDraft(e.target.value)}
              onBlur={() => {
                if (notesDraft !== undefined) updateProject(project.id, { notes: notesDraft || undefined })
              }}
            />
          </Field>
        </Card>

        <FinanceSummary finance={finance} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ItemsSection projectId={project.id} items={items} />
          <PaymentsSection projectId={project.id} payments={payments} balanceCents={finance.balanceCents} />
        </div>

        <Card>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">Histórico</h2>
          <Timeline events={events} />
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onCancel={() => setConfirmDelete(false)}
        onConfirm={async () => {
          await deleteProject(project.id)
          showToast('Projeto excluído')
          navigate('/projects')
        }}
        title="Excluir projeto?"
        description={`"${project.service}" e todos os seus itens, pagamentos e tarefas serão excluídos permanentemente.`}
        confirmLabel="Excluir"
        danger
      />
    </>
  )
}
