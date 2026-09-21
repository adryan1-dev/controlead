/**
 * Definição do schema Dexie por versão. Cada nova versão do app deve
 * adicionar um novo `SCHEMA_V{n}` aqui (e uma migração em
 * `domain/migrations.ts` quando houver transformação de dados), nunca
 * editar uma versão já publicada.
 *
 * Índices: `instagram`/`whatsapp` existem para detectar leads duplicados.
 * `[status+dueDate]` e `[leadId+at]` são índices compostos porque o
 * IndexedDB não indexa `null`/`undefined` (necessários para consultas por
 * status+prazo de tarefas e timeline de um lead ordenada por data).
 */
export const SCHEMA_V1 = {
  leads: 'id, status, createdAt, lastInteractionAt, *tags, instagram, whatsapp',
  tasks: 'id, leadId, projectId, [status+dueDate]',
  events: 'id, [leadId+at], [projectId+at]',
  projects: 'id, leadId, status, dueDate',
  projectItems: 'id, projectId',
  payments: 'id, projectId, date',
  settings: 'id',
} as const

export const CURRENT_SCHEMA_VERSION = 1
