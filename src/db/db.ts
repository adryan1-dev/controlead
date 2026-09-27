import Dexie, { type EntityTable } from 'dexie'

import { buildDefaultScripts } from '@/domain/defaultScripts'
import type { Competitor, Event, Lead, Payment, Project, ProjectItem, Script, Settings, Task } from '@/domain/types'

import { SCHEMA_V1, SCHEMA_V2 } from './schema'

export class ControleadDB extends Dexie {
  leads!: EntityTable<Lead, 'id'>
  tasks!: EntityTable<Task, 'id'>
  events!: EntityTable<Event, 'id'>
  projects!: EntityTable<Project, 'id'>
  projectItems!: EntityTable<ProjectItem, 'id'>
  payments!: EntityTable<Payment, 'id'>
  settings!: EntityTable<Settings, 'id'>
  scripts!: EntityTable<Script, 'id'>
  competitors!: EntityTable<Competitor, 'id'>

  constructor(name: string) {
    super(name)
    this.version(1).stores(SCHEMA_V1)
    this.version(2)
      .stores(SCHEMA_V2)
      .upgrade((tx) => tx.table('scripts').bulkAdd(buildDefaultScripts()))
    // Banco novo: o upgrade não roda, então os modelos são semeados aqui.
    this.on('populate', (tx) => tx.table('scripts').bulkAdd(buildDefaultScripts()))
  }
}

/** Fábrica usada pelos testes para criar bancos isolados por caso de teste. */
export function createDb(name: string): ControleadDB {
  return new ControleadDB(name)
}

/** Instância única usada pela aplicação em runtime. */
export const db = createDb('controlead')
