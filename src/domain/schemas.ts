import { z } from 'zod'

import {
  EVENT_TYPES,
  LEAD_STATUSES,
  PAYMENT_METHODS,
  PROJECT_ITEM_TYPES,
  PROJECT_STATUSES,
  TASK_STATUSES,
  TASK_TYPES,
} from './constants'

// ---------------------------------------------------------------------------
// Lead
// ---------------------------------------------------------------------------

export const leadFormSchema = z.object({
  name: z.string().trim().min(1, 'Informe o nome'),
  company: z.string().trim().optional(),
  instagram: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  website: z.string().trim().optional(),
  niche: z.string().trim().optional(),
  city: z.string().trim().optional(),
  source: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  estimatedValueCents: z.number().int().nonnegative().optional(),
  notes: z.string().trim().optional(),
})

export type LeadFormInput = z.infer<typeof leadFormSchema>

// ---------------------------------------------------------------------------
// Fechar negócio
// ---------------------------------------------------------------------------

export const closeDealFormSchema = z
  .object({
    service: z.string().trim().min(1, 'Informe o serviço contratado'),
    originalCents: z.number().int().positive('Informe o valor original'),
    discountCents: z.number().int().nonnegative().default(0),
    depositCents: z.number().int().nonnegative().default(0),
    depositMethod: z.enum(PAYMENT_METHODS).optional(),
    dueDate: z.string().optional(),
    paymentTerms: z.string().trim().optional(),
    notes: z.string().trim().optional(),
  })
  .refine((data) => data.discountCents <= data.originalCents, {
    message: 'O desconto não pode ser maior que o valor original',
    path: ['discountCents'],
  })
  .refine((data) => data.depositCents === 0 || data.depositMethod !== undefined, {
    message: 'Informe a forma de pagamento da entrada',
    path: ['depositMethod'],
  })

export type CloseDealFormInput = z.infer<typeof closeDealFormSchema>

// ---------------------------------------------------------------------------
// Item do projeto
// ---------------------------------------------------------------------------

export const projectItemFormSchema = z.object({
  description: z.string().trim().min(1, 'Informe a descrição'),
  type: z.enum(PROJECT_ITEM_TYPES),
  amountCents: z.number().int().nonnegative(),
  date: z.string().min(1, 'Informe a data'),
  note: z.string().trim().optional(),
})

export type ProjectItemFormInput = z.infer<typeof projectItemFormSchema>

// ---------------------------------------------------------------------------
// Pagamento
// ---------------------------------------------------------------------------

export const paymentFormSchema = z.object({
  amountCents: z.number().int().positive('Informe o valor'),
  date: z.string().min(1, 'Informe a data'),
  method: z.enum(PAYMENT_METHODS),
  note: z.string().trim().optional(),
})

export type PaymentFormInput = z.infer<typeof paymentFormSchema>

// ---------------------------------------------------------------------------
// Backup — schemas dos registros armazenados (não confundir com os schemas
// de formulário acima: aqui validamos o formato exato persistido no Dexie,
// incluindo id/timestamps).
// ---------------------------------------------------------------------------

const leadRecordSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  company: z.string().optional(),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  website: z.string().optional(),
  niche: z.string().optional(),
  city: z.string().optional(),
  source: z.string().optional(),
  tags: z.array(z.string()),
  estimatedValueCents: z.number().optional(),
  notes: z.string().optional(),
  status: z.enum(LEAD_STATUSES),
  createdAt: z.string(),
  updatedAt: z.string(),
  lastInteractionAt: z.string().optional(),
  firstClosedAt: z.string().optional(),
  archivedAt: z.string().optional(),
})

const taskRecordSchema = z.object({
  id: z.string().min(1),
  leadId: z.string().min(1),
  projectId: z.string().optional(),
  type: z.enum(TASK_TYPES),
  dueDate: z.string(),
  note: z.string().optional(),
  status: z.enum(TASK_STATUSES),
  createdAt: z.string(),
  completedAt: z.string().optional(),
})

const eventRecordSchema = z.object({
  id: z.string().min(1),
  leadId: z.string().min(1),
  projectId: z.string().optional(),
  type: z.enum(EVENT_TYPES),
  at: z.string(),
  text: z.string().optional(),
  data: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.string(),
})

const projectRecordSchema = z.object({
  id: z.string().min(1),
  leadId: z.string().min(1),
  service: z.string(),
  status: z.enum(PROJECT_STATUSES),
  closedAt: z.string(),
  startDate: z.string().optional(),
  dueDate: z.string().optional(),
  deliveredAt: z.string().optional(),
  previewUrl: z.string().optional(),
  finalUrl: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

const projectItemRecordSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  description: z.string(),
  type: z.enum(PROJECT_ITEM_TYPES),
  amountCents: z.number(),
  date: z.string(),
  note: z.string().optional(),
  createdAt: z.string(),
})

const paymentRecordSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  amountCents: z.number(),
  date: z.string(),
  method: z.enum(PAYMENT_METHODS),
  note: z.string().optional(),
  createdAt: z.string(),
})

const settingsRecordSchema = z.object({
  id: z.literal('app'),
  followUpDays: z.record(z.string(), z.number()),
  staleDays: z.number(),
  deadlineWarningDays: z.number(),
  backupReminderDays: z.number(),
  lastBackupAt: z.string().optional(),
})

export const backupDataSchema = z.object({
  leads: z.array(leadRecordSchema),
  tasks: z.array(taskRecordSchema),
  events: z.array(eventRecordSchema),
  projects: z.array(projectRecordSchema),
  projectItems: z.array(projectItemRecordSchema),
  payments: z.array(paymentRecordSchema),
  settings: z.array(settingsRecordSchema),
})

export type BackupData = z.infer<typeof backupDataSchema>

/** Envelope do arquivo de backup. `schemaVersion` é validado à parte (contra a versão atual) antes deste schema rodar. */
export const backupFileSchema = z.object({
  app: z.literal('controlead'),
  format: z.literal(1),
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  counts: z.record(z.string(), z.number()).optional(),
  data: backupDataSchema,
})

export type BackupFile = z.infer<typeof backupFileSchema>
