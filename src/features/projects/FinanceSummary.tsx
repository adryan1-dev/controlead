import { MoneyText } from '@/components/shared/MoneyText'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { ProjectFinance } from '@/domain/finance'

interface FinanceSummaryProps {
  finance: ProjectFinance
}

export function FinanceSummary({ finance }: FinanceSummaryProps) {
  return (
    <Card className="flex flex-wrap items-center gap-6">
      <div>
        <p className="text-xs text-[var(--color-text-secondary)]">Total</p>
        <MoneyText cents={finance.totalCents} className="text-lg font-semibold" />
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-secondary)]">Recebido</p>
        <MoneyText cents={finance.receivedCents} tone="success" className="text-lg font-semibold" />
      </div>
      <div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {finance.balanceCents < 0 ? 'Excedente' : 'Restante'}
        </p>
        <MoneyText
          cents={Math.abs(finance.balanceCents)}
          tone={finance.balanceCents > 0 ? 'danger' : 'muted'}
          className="text-lg font-semibold"
        />
      </div>
      {finance.courtesyCents > 0 ? (
        <div>
          <p className="text-xs text-[var(--color-text-secondary)]">Em cortesias</p>
          <MoneyText cents={finance.courtesyCents} tone="muted" className="text-lg font-semibold" />
        </div>
      ) : null}
      <div className="ml-auto">
        <StatusBadge kind="finance" status={finance.status} />
      </div>
    </Card>
  )
}
