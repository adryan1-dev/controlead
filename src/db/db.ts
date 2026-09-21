import Dexie, { type EntityTable } from 'dexie'

import type { Event, Lead, Payment, Project, ProjectItem, Settings, Task } from '@/domain/types'

import { SCHEMA_V1 } from './schema'

export class ControleadDB extends Dexie {
  leads!: EntityTable<Lead, 'id'>
  tasks!: EntityTable<Task, 'id'>
  events!: EntityTable<Event, 'id'>
  projects!: EntityTable<Project, 'id'>
  projectItems!: EntityTable<ProjectItem, 'id'>
  payments!: EntityTable<Payment, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor(name: string) {
    super(name)
    this.version(1).stores(SCHEMA_V1)
  }
}

/** Fábrica usada pelos testes para criar bancos isolados por caso de teste. */
export function createDb(name: string): ControleadDB {
  return new ControleadDB(name)
}

/** Instância única usada pela aplicação em runtime. */
export const db = createDb('controlead')
