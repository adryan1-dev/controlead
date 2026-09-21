import { sumCents } from './money'
import type { FinanceStatus } from './constants'
import type { Payment, ProjectItem } from './types'

export interface ProjectFinance {
  /** Soma dos itens "contratado". */
  originalCents: number
  /** Soma dos itens "adicional". */
  additionalCents: number
  /** Soma dos itens "desconto". */
  discountCents: number
  /** Soma dos itens "cortesia" (valor de referência, não entra no total). */
  courtesyCents: number
  /** originalCents + additionalCents - discountCents. */
  totalCents: number
  /** Soma dos pagamentos. */
  receivedCents: number
  /** totalCents - receivedCents (pode ser negativo = excedente). */
  balanceCents: number
  status: FinanceStatus
}

/**
 * Calcula tudo que é financeiro em um projeto a partir dos itens e
 * pagamentos. Nada disso é armazenado: itens e pagamentos são a fonte de
 * verdade, este cálculo roda sempre que a UI precisa exibir o resumo.
 */
export function getProjectFinance(items: ProjectItem[], payments: Payment[]): ProjectFinance {
  const originalCents = sumCents(items.filter((i) => i.type === 'contracted').map((i) => i.amountCents))
  const additionalCents = sumCents(items.filter((i) => i.type === 'additional').map((i) => i.amountCents))
  const discountCents = sumCents(items.filter((i) => i.type === 'discount').map((i) => i.amountCents))
  const courtesyCents = sumCents(items.filter((i) => i.type === 'courtesy').map((i) => i.amountCents))

  const totalCents = originalCents + additionalCents - discountCents
  const receivedCents = sumCents(payments.map((p) => p.amountCents))
  const balanceCents = totalCents - receivedCents

  let status: FinanceStatus
  if (totalCents <= 0) {
    status = 'no_charge'
  } else if (receivedCents <= 0) {
    status = 'unpaid'
  } else if (balanceCents > 0) {
    status = 'partial'
  } else {
    status = 'paid'
  }

  return {
    originalCents,
    additionalCents,
    discountCents,
    courtesyCents,
    totalCents,
    receivedCents,
    balanceCents,
    status,
  }
}

/** Soma o total vendido (contratado + adicional - desconto) de vários projetos. */
export function sumSold(itemsByProject: ProjectItem[][]): number {
  return sumCents(itemsByProject.map((items) => getProjectFinance(items, []).totalCents))
}
