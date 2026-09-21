import type {
  ContactChannel,
  EventType,
  LeadStatus,
  PaymentMethod,
  ProjectItemType,
  ProjectStatus,
  TaskStatus,
  TaskType,
} from './constants'

/** Data de calendário no formato `YYYY-MM-DD` (sem hora, sem fuso). */
export type DateString = string

/** Timestamp completo em ISO 8601 (`new Date().toISOString()`). */
export type IsoTimestamp = string

// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

export interface Lead {
  id: string
  name: string
  company?: string
  instagram?: string
  whatsapp?: string
  website?: string
  niche?: string
  city?: string
  source?: string
  tags: string[]
  estimatedValueCents?: number
  notes?: string
  status: LeadStatus
  createdAt: IsoTimestamp
  updatedAt: IsoTimestamp
  /** Cache reconstruível a partir de `events`; atualizado pelos serviços. */
  lastInteractionAt?: IsoTimestamp
  /** Primeira vez que o lead fechou negócio (métricas futuras). */
  firstClosedAt?: IsoTimestamp
  /** Lead arquivado (mantido por ter histórico) mas fora das listagens padrão. */
  archivedAt?: IsoTimestamp
}

// ---------------------------------------------------------------------------
// Task (próxima ação)
// ---------------------------------------------------------------------------

export interface Task {
  id: string
  leadId: string
  projectId?: string
  type: TaskType
  dueDate: DateString
  note?: string
  status: TaskStatus
  createdAt: IsoTimestamp
  completedAt?: IsoTimestamp
}

// ---------------------------------------------------------------------------
// Event (histórico, append-only)
// ---------------------------------------------------------------------------

export interface EventData {
  from?: string
  to?: string
  amountCents?: number
  channel?: ContactChannel
  taskType?: TaskType
  projectId?: string
  [key: string]: unknown
}

export interface Event {
  id: string
  leadId: string
  projectId?: string
  type: EventType
  at: IsoTimestamp
  text?: string
  data?: EventData
  createdAt: IsoTimestamp
}

// ---------------------------------------------------------------------------
// Project
// ---------------------------------------------------------------------------

export interface Project {
  id: string
  leadId: string
  service: string
  status: ProjectStatus
  closedAt: DateString
  startDate?: DateString
  dueDate?: DateString
  deliveredAt?: DateString
  previewUrl?: string
  finalUrl?: string
  paymentTerms?: string
  notes?: string
  createdAt: IsoTimestamp
  updatedAt: IsoTimestamp
}

// ---------------------------------------------------------------------------
// ProjectItem (o que foi combinado, fonte do preço)
// ---------------------------------------------------------------------------

export interface ProjectItem {
  id: string
  projectId: string
  description: string
  type: ProjectItemType
  amountCents: number
  date: DateString
  note?: string
  createdAt: IsoTimestamp
}

// ---------------------------------------------------------------------------
// Payment
// ---------------------------------------------------------------------------

export interface Payment {
  id: string
  projectId: string
  amountCents: number
  date: DateString
  method: PaymentMethod
  note?: string
  createdAt: IsoTimestamp
}

// ---------------------------------------------------------------------------
// Settings (linha única, id = 'app')
// ---------------------------------------------------------------------------

export interface Settings {
  id: 'app'
  followUpDays: Partial<Record<LeadStatus, number>>
  staleDays: number
  deadlineWarningDays: number
  backupReminderDays: number
  lastBackupAt?: IsoTimestamp
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'app',
  followUpDays: {
    approached: 3,
    replied: 2,
    talking: 3,
    preview_sent: 2,
    proposal_sent: 3,
  },
  staleDays: 5,
  deadlineWarningDays: 3,
  backupReminderDays: 7,
}
