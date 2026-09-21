import { useState } from 'react'

import { FileQuestion, Filter, TrendingUp, Users2, Wallet } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Combobox } from '@/components/ui/Combobox'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { DateInput } from '@/components/ui/DateInput'
import { Drawer } from '@/components/ui/Drawer'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { Menu } from '@/components/ui/Menu'
import { Modal } from '@/components/ui/Modal'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { Select } from '@/components/ui/Select'
import { StatCard } from '@/components/ui/StatCard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Table } from '@/components/ui/Table'
import { Tabs } from '@/components/ui/Tabs'
import { TagInput } from '@/components/ui/TagInput'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import { ContactLinks } from '@/components/shared/ContactLinks'
import { DueLabel } from '@/components/shared/DueLabel'
import { MoneyText } from '@/components/shared/MoneyText'
import { TaskItem } from '@/components/shared/TaskItem'
import { Timeline } from '@/components/shared/Timeline'
import { PageHeader } from '@/components/layout/PageHeader'

const SAMPLE_EVENTS = [
  {
    id: '1',
    leadId: 'l1',
    type: 'lead_created' as const,
    at: '2026-09-17T13:00:00.000Z',
    createdAt: '2026-09-17T13:00:00.000Z',
  },
  {
    id: '2',
    leadId: 'l1',
    type: 'status_changed' as const,
    at: '2026-09-18T09:30:00.000Z',
    createdAt: '2026-09-18T09:30:00.000Z',
    data: { from: 'to_contact', to: 'approached' },
  },
  {
    id: '3',
    leadId: 'l1',
    type: 'note' as const,
    at: '2026-09-19T15:00:00.000Z',
    createdAt: '2026-09-19T15:00:00.000Z',
    text: 'Cliente pediu para retornar na próxima semana.',
  },
]

/** Só existe em desenvolvimento: vitrine dos componentes do kit de UI. */
export function DevUIPage() {
  const { showToast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [tab, setTab] = useState('a')
  const [tags, setTags] = useState<string[]>(['landing page', 'urgente'])
  const [money, setMoney] = useState<number | undefined>(150000)
  const [date, setDate] = useState<string | undefined>('2026-09-25')
  const [niche, setNiche] = useState('')

  return (
    <>
      <PageHeader title="UI Kit (dev)" />

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Botões</h2>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="primary">Primário</Button>
          <Button variant="secondary">Secundário</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Perigo</Button>
          <Button variant="primary" disabled>
            Desabilitado
          </Button>
          <IconButton icon={<Filter size={16} />} label="Filtrar" />
          <Menu
            trigger={<Button variant="secondary">Mover para…</Button>}
            items={[
              { label: 'Em conversa', onSelect: () => showToast('Movido para Em conversa') },
              { label: 'Perdido', onSelect: () => showToast('Movido para Perdido'), danger: true },
            ]}
          />
        </div>
      </section>

      <section className="mb-8 grid max-w-xl grid-cols-2 gap-4">
        <h2 className="col-span-2 text-sm font-semibold text-[var(--color-text-secondary)]">Formulário</h2>
        <Field label="Nome" required>
          <Input placeholder="Nome do lead" />
        </Field>
        <Field label="Status">
          <Select defaultValue="to_contact">
            <option value="to_contact">A chamar</option>
            <option value="approached">Abordagem feita</option>
          </Select>
        </Field>
        <Field label="Valor estimado">
          <MoneyInput value={money} onChange={setMoney} />
        </Field>
        <Field label="Próxima ação em">
          <DateInput value={date} onChange={setDate} />
        </Field>
        <Field label="Nicho" helperText="Sugestões vêm dos leads já cadastrados">
          <Combobox value={niche} onChange={setNiche} options={['Odontologia', 'Advocacia', 'Estética']} />
        </Field>
        <Field label="Tags" className="col-span-2">
          <TagInput value={tags} onChange={setTags} />
        </Field>
        <Field label="Observações" error="Campo de exemplo com erro" className="col-span-2">
          <Textarea placeholder="Notas sobre o lead" />
        </Field>
      </section>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Badges e status</h2>
        <div className="flex flex-wrap gap-2">
          <Badge tone="neutral">Neutro</Badge>
          <Badge tone="info">Info</Badge>
          <Badge tone="success">Sucesso</Badge>
          <Badge tone="warning">Aviso</Badge>
          <Badge tone="danger">Perigo</Badge>
          <StatusBadge kind="lead" status="proposal_sent" />
          <StatusBadge kind="project" status="in_progress" />
          <StatusBadge kind="finance" status="partial" />
          <DueLabel date="2026-09-20" />
          <DueLabel date="2026-09-22" />
          <DueLabel date="2026-12-01" />
        </div>
      </section>

      <section className="mb-8 grid max-w-3xl grid-cols-4 gap-3">
        <h2 className="col-span-4 text-sm font-semibold text-[var(--color-text-secondary)]">Cards</h2>
        <StatCard
          label="Leads ativos"
          value={12}
          icon={<Users2 size={16} />}
          chip="violet"
          onClick={() => showToast('Navegar para leads ativos')}
        />
        <StatCard label="Atrasados" value={2} tone="danger" icon={<TrendingUp size={16} />} chip="rose" />
        <StatCard label="Próximos" value={4} tone="warning" icon={<TrendingUp size={16} />} chip="amber" />
        <StatCard label="Recebido no mês" value={<MoneyText cents={150000} tone="success" />} icon={<Wallet size={16} />} chip="teal" />
      </section>

      <section className="mb-8 flex max-w-xl flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Tarefa e contatos</h2>
        <TaskItem
          task={{
            id: 't1',
            leadId: 'l1',
            type: 'follow_up',
            dueDate: '2026-09-20',
            status: 'open',
            createdAt: '2026-09-17T00:00:00.000Z',
          }}
          subjectName="Cliente A"
          actions={<Button size="sm">Concluir</Button>}
        />
        <ContactLinks whatsapp="11987654321" instagram="@studio.abc" website="studio.abc" />
      </section>

      <section className="mb-8 max-w-md">
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">Timeline</h2>
        <Card>
          <Timeline events={SAMPLE_EVENTS} />
        </Card>
      </section>

      <section className="mb-8 flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)]">Tabs</h2>
        <Tabs
          items={[
            { value: 'a', label: 'Detalhes' },
            { value: 'b', label: 'Histórico' },
          ]}
          value={tab}
          onChange={setTab}
        />
      </section>

      <section className="mb-8 max-w-lg">
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">Tabela</h2>
        <Table
          rowKey={(r) => r.id}
          rows={[{ id: '1', name: 'Cliente A', status: 'Fechado' }]}
          columns={[
            { key: 'name', header: 'Nome', render: (r) => r.name },
            { key: 'status', header: 'Status', render: (r) => r.status },
          ]}
        />
      </section>

      <section className="mb-8 max-w-md">
        <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-secondary)]">Estado vazio</h2>
        <EmptyState
          icon={<FileQuestion size={28} />}
          title="Nenhum lead encontrado"
          description="Ajuste os filtros ou cadastre um novo lead."
          action={<Button variant="primary">Novo lead</Button>}
        />
      </section>

      <section className="mb-8 flex flex-wrap gap-2">
        <h2 className="w-full text-sm font-semibold text-[var(--color-text-secondary)]">Modal, Drawer, Confirm, Toast</h2>
        <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
        <Button onClick={() => setDrawerOpen(true)}>Abrir drawer</Button>
        <Button variant="danger" onClick={() => setConfirmOpen(true)}>
          Abrir confirmação
        </Button>
        <Button onClick={() => showToast('Lead salvo com sucesso')}>Disparar toast</Button>
      </section>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Exemplo de modal">
        <p className="text-sm text-[var(--color-text-secondary)]">Conteúdo do modal.</p>
      </Modal>

      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} title="Exemplo de drawer">
        <p className="text-sm text-[var(--color-text-secondary)]">Conteúdo do drawer.</p>
      </Drawer>

      <ConfirmDialog
        open={confirmOpen}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          showToast('Confirmado')
        }}
        title="Excluir lead?"
        description="Essa ação não pode ser desfeita."
        danger
        confirmLabel="Excluir"
      />
    </>
  )
}
