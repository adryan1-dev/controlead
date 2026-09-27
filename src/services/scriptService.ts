import type { ControleadDB } from '@/db/db'
import { db as defaultDb } from '@/db/db'
import type { LeadStatus, ScriptKind } from '@/domain/constants'
import { buildDefaultScripts } from '@/domain/defaultScripts'
import type { Script } from '@/domain/types'

export interface ScriptInput {
  kind: ScriptKind
  stage?: LeadStatus
  title: string
  body: string
}

/** Scripts do mesmo grupo (uma etapa, ou todas as objeções), já ordenados. */
async function groupOf(kind: ScriptKind, stage: LeadStatus | undefined, database: ControleadDB): Promise<Script[]> {
  const all = await database.scripts.where('kind').equals(kind).toArray()
  return all.filter((s) => kind === 'objection' || s.stage === stage).sort((a, b) => a.order - b.order)
}

export async function createScript(input: ScriptInput, database: ControleadDB = defaultDb): Promise<Script> {
  const stage = input.kind === 'stage' ? input.stage : undefined
  const group = await groupOf(input.kind, stage, database)
  const now = new Date().toISOString()
  const script: Script = {
    id: crypto.randomUUID(),
    kind: input.kind,
    stage,
    title: input.title,
    body: input.body,
    order: group.length === 0 ? 0 : group[group.length - 1].order + 1,
    createdAt: now,
    updatedAt: now,
  }
  await database.scripts.add(script)
  return script
}

export async function updateScript(
  id: string,
  patch: Partial<Pick<Script, 'title' | 'body' | 'stage'>>,
  database: ControleadDB = defaultDb,
): Promise<void> {
  await database.scripts.update(id, { ...patch, updatedAt: new Date().toISOString() })
}

export async function deleteScript(id: string, database: ControleadDB = defaultDb): Promise<void> {
  await database.scripts.delete(id)
}

/** Troca o script de posição com o vizinho de cima (-1) ou de baixo (+1) no mesmo grupo. */
export async function moveScript(id: string, direction: -1 | 1, database: ControleadDB = defaultDb): Promise<void> {
  await database.transaction('rw', database.scripts, async () => {
    const script = await database.scripts.get(id)
    if (!script) return
    const group = await groupOf(script.kind, script.stage, database)
    const index = group.findIndex((s) => s.id === id)
    const neighbor = group[index + direction]
    if (!neighbor) return
    // Reindexa o grupo inteiro para não depender de `order` estar sem buracos ou empates.
    const reordered = [...group]
    reordered[index] = neighbor
    reordered[index + direction] = script
    await Promise.all(reordered.map((s, order) => database.scripts.update(s.id, { order })))
  })
}

/** Recoloca os modelos originais (apagados ou editados), sem mexer nos scripts que você criou. */
export async function restoreDefaultScripts(database: ControleadDB = defaultDb): Promise<void> {
  await database.scripts.bulkPut(buildDefaultScripts())
}
