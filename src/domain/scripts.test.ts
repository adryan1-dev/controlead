import { describe, expect, it } from 'vitest'

import { buildDefaultScripts } from './defaultScripts'
import { firstName, renderScript, salutation, SCRIPT_VARIABLES } from './scripts'
import type { Competitor, Lead } from './types'

const lead: Lead = {
  id: 'l1',
  name: 'Dra. Mariele Borges',
  company: 'MB Odontologia Integrada',
  instagram: 'marielebsilva',
  city: 'Uberlândia/MG',
  state: 'MG',
  specialty: 'ortodontia',
  googleRating: 5,
  googleReviews: 54,
  followers: 1344,
  tags: [],
  status: 'to_contact',
  createdAt: '2026-09-24T00:00:00.000Z',
  updatedAt: '2026-09-24T00:00:00.000Z',
}

const competitor: Competitor = { id: 'c1', leadId: 'l1', name: 'Dra. Mariel Paschoal', createdAt: '2026-09-24T00:00:00.000Z' }

describe('salutation / firstName', () => {
  it('keeps the Dr./Dra. title with the first name', () => {
    expect(salutation('Dra. Mariele Borges')).toBe('Dra. Mariele')
    expect(salutation('dr Ewerton Bem')).toBe('Dr. Ewerton')
    expect(salutation('João Silva')).toBe('João')
    expect(firstName('Dra. Letícia Peixoto')).toBe('Letícia')
  })
})

describe('renderScript', () => {
  it('fills variables from the lead and its competitors', () => {
    const { text, missing } = renderScript(
      'Oi, {tratamento}! {avaliacoes} avaliações, nota {nota}, {seguidores} seguidores em {cidade}. {instagram} vs {concorrente}.',
      lead,
      [competitor],
    )
    expect(text).toBe('Oi, Dra. Mariele! 54 avaliações, nota 5,0, 1.344 seguidores em Uberlândia. @marielebsilva vs Dra. Mariel Paschoal.')
    expect(missing).toEqual([])
  })

  it('marks variables the lead has no data for, and leaves unknown ones alone', () => {
    const { text, missing } = renderScript('{gancho} / {concorrente} / {link}', lead)
    expect(text).toBe('[gancho] / [concorrente] / {link}')
    expect(missing).toEqual(['gancho', 'concorrente'])
  })
})

describe('buildDefaultScripts', () => {
  it('uses stable unique ids and only known variables', () => {
    const scripts = buildDefaultScripts()
    expect(new Set(scripts.map((s) => s.id)).size).toBe(scripts.length)
    expect(buildDefaultScripts().map((s) => s.id)).toEqual(scripts.map((s) => s.id))

    const known = new Set(SCRIPT_VARIABLES.map((v) => v.key))
    for (const script of scripts) {
      for (const [, key] of script.body.matchAll(/\{([a-z_]+)\}/g)) {
        expect(known.has(key), `${script.id} usa {${key}}`).toBe(true)
      }
    }
  })
})
