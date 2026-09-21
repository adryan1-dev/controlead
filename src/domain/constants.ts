/**
 * Statuses, tipos e rótulos em PT-BR. Fonte única de verdade para o
 * pipeline de leads, status de projeto e tipos de tarefa/evento — usada
 * tanto pela UI (labels, cores) quanto pelas regras de negócio.
 */

// ---------------------------------------------------------------------------
// Leads
// ---------------------------------------------------------------------------

export const LEAD_STATUSES = [
  'to_contact',
  'approached',
  'replied',
  'talking',
  'preview_sent',
  'proposal_sent',
  'closed',
  'not_interested',
  'lost',
] as const

export type LeadStatus = (typeof LEAD_STATUSES)[number]

/** Ordem das colunas do pipeline no Kanban (sem os estados finais). */
export const LEAD_PIPELINE_ORDER: LeadStatus[] = [
  'to_contact',
  'approached',
  'replied',
  'talking',
  'preview_sent',
  'proposal_sent',
  'closed',
]

/** Estados finais que não fazem parte do fluxo comercial ativo. */
export const LEAD_FINAL_STATUSES: LeadStatus[] = ['closed', 'not_interested', 'lost']

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  to_contact: 'A chamar',
  approached: 'Abordagem feita',
  replied: 'Respondeu',
  talking: 'Em conversa',
  preview_sent: 'Prévia enviada',
  proposal_sent: 'Proposta enviada',
  closed: 'Fechado',
  not_interested: 'Não interessado',
  lost: 'Perdido',
}

/** Classes de cor (badge) por status, sem depender de biblioteca externa. */
export const LEAD_STATUS_COLOR: Record<LeadStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  to_contact: 'neutral',
  approached: 'info',
  replied: 'info',
  talking: 'info',
  preview_sent: 'warning',
  proposal_sent: 'warning',
  closed: 'success',
  not_interested: 'danger',
  lost: 'danger',
}

export function isLeadStatusActive(status: LeadStatus): boolean {
  return !LEAD_FINAL_STATUSES.includes(status)
}

// ---------------------------------------------------------------------------
// Projetos
// ---------------------------------------------------------------------------

export const PROJECT_STATUSES = [
  'not_started',
  'in_progress',
  'waiting_client',
  'adjustments',
  'done',
  'delivered',
  'cancelled',
] as const

export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_ORDER: ProjectStatus[] = [
  'not_started',
  'in_progress',
  'waiting_client',
  'adjustments',
  'done',
  'delivered',
]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: 'A iniciar',
  in_progress: 'Produzindo',
  waiting_client: 'Aguardando cliente',
  adjustments: 'Ajustes',
  done: 'Finalizado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
}

export const PROJECT_STATUS_COLOR: Record<ProjectStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  not_started: 'neutral',
  in_progress: 'info',
  waiting_client: 'warning',
  adjustments: 'warning',
  done: 'success',
  delivered: 'success',
  cancelled: 'danger',
}

/** Projetos nesses status não entram em alertas de prazo nem em "a receber". */
export const PROJECT_STATUS_EXCLUDED_FROM_TRACKING: ProjectStatus[] = ['delivered', 'cancelled']

// ---------------------------------------------------------------------------
// Itens do projeto (preço)
// ---------------------------------------------------------------------------

export const PROJECT_ITEM_TYPES = ['contracted', 'additional', 'courtesy', 'discount'] as const

export type ProjectItemType = (typeof PROJECT_ITEM_TYPES)[number]

export const PROJECT_ITEM_TYPE_LABELS: Record<ProjectItemType, string> = {
  contracted: 'Contratado',
  additional: 'Adicional',
  courtesy: 'Cortesia',
  discount: 'Desconto',
}

// ---------------------------------------------------------------------------
// Pagamentos
// ---------------------------------------------------------------------------

export const PAYMENT_METHODS = ['pix', 'cash', 'card', 'boleto', 'transfer', 'other'] as const

export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: 'Pix',
  cash: 'Dinheiro',
  card: 'Cartão',
  boleto: 'Boleto',
  transfer: 'Transferência',
  other: 'Outro',
}

// ---------------------------------------------------------------------------
// Status financeiro (derivado, ver domain/finance.ts)
// ---------------------------------------------------------------------------

export const FINANCE_STATUSES = ['no_charge', 'unpaid', 'partial', 'paid'] as const

export type FinanceStatus = (typeof FINANCE_STATUSES)[number]

export const FINANCE_STATUS_LABELS: Record<FinanceStatus, string> = {
  no_charge: 'Sem cobrança',
  unpaid: 'Não pago',
  partial: 'Parcial',
  paid: 'Pago',
}

export const FINANCE_STATUS_COLOR: Record<FinanceStatus, 'neutral' | 'info' | 'success' | 'warning' | 'danger'> = {
  no_charge: 'neutral',
  unpaid: 'danger',
  partial: 'warning',
  paid: 'success',
}

// ---------------------------------------------------------------------------
// Tarefas (próxima ação)
// ---------------------------------------------------------------------------

export const TASK_TYPES = [
  'approach',
  'follow_up',
  'send_preview',
  'send_proposal',
  'chase_reply',
  'deliver',
  'chase_payment',
  'other',
] as const

export type TaskType = (typeof TASK_TYPES)[number]

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  approach: 'Fazer abordagem',
  follow_up: 'Follow-up',
  send_preview: 'Enviar prévia',
  send_proposal: 'Enviar proposta',
  chase_reply: 'Cobrar resposta',
  deliver: 'Entregar projeto',
  chase_payment: 'Cobrar pagamento',
  other: 'Outro',
}

export const TASK_STATUSES = ['open', 'done', 'cancelled'] as const

export type TaskStatus = (typeof TASK_STATUSES)[number]

// ---------------------------------------------------------------------------
// Eventos (histórico)
// ---------------------------------------------------------------------------

export const EVENT_TYPES = [
  'lead_created',
  'status_changed',
  'note',
  'contact',
  'task_completed',
  'deal_closed',
  'project_status_changed',
  'payment_added',
  'payment_removed',
  'item_added',
  'project_deleted',
] as const

export type EventType = (typeof EVENT_TYPES)[number]

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  lead_created: 'Lead cadastrado',
  status_changed: 'Status alterado',
  note: 'Nota',
  contact: 'Contato registrado',
  task_completed: 'Ação concluída',
  deal_closed: 'Negócio fechado',
  project_status_changed: 'Status do projeto alterado',
  payment_added: 'Pagamento registrado',
  payment_removed: 'Pagamento removido',
  item_added: 'Item adicionado',
  project_deleted: 'Projeto excluído',
}

/** Tipos de evento que contam como "interação" e atualizam lastInteractionAt. */
export const INTERACTION_EVENT_TYPES: EventType[] = ['status_changed', 'contact', 'task_completed', 'deal_closed']

// ---------------------------------------------------------------------------
// Canais de contato
// ---------------------------------------------------------------------------

export const CONTACT_CHANNELS = ['whatsapp', 'instagram', 'email', 'phone', 'in_person', 'other'] as const

export type ContactChannel = (typeof CONTACT_CHANNELS)[number]

export const CONTACT_CHANNEL_LABELS: Record<ContactChannel, string> = {
  whatsapp: 'WhatsApp',
  instagram: 'Instagram',
  email: 'E-mail',
  phone: 'Ligação',
  in_person: 'Presencial',
  other: 'Outro',
}
