import { AlertTriangle } from 'lucide-react'
import { useNavigate } from 'react-router'

import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { diffDays, today } from '@/domain/dates'
import { useDashboard } from '@/hooks/useDashboard'
import { useSettings } from '@/hooks/useSettings'

import { ActionsPanel } from './ActionsPanel'
import { AlertsPanel } from './AlertsPanel'
import { KpiGrid } from './KpiGrid'

export function DashboardPage() {
  const data = useDashboard()
  const settings = useSettings()
  const navigate = useNavigate()

  const daysSinceBackup = settings.lastBackupAt ? diffDays(settings.lastBackupAt.slice(0, 10), today()) : undefined
  const showBackupReminder = daysSinceBackup === undefined || daysSinceBackup >= settings.backupReminderDays

  return (
    <>
      <PageHeader title="Dashboard" />

      {showBackupReminder ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-md border border-[var(--color-warning)]/30 bg-[var(--color-warning-bg)] px-3.5 py-2.5 text-sm text-[var(--color-warning)]">
          <span className="flex items-center gap-2">
            <AlertTriangle size={15} />
            {settings.lastBackupAt
              ? `Você não faz backup há ${daysSinceBackup} dias.`
              : 'Você ainda não fez nenhum backup.'}
          </span>
          <Button size="sm" variant="secondary" onClick={() => navigate('/settings')}>
            Fazer backup
          </Button>
        </div>
      ) : null}

      <div className="mb-4">
        <KpiGrid data={data} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ActionsPanel />
        </div>
        <AlertsPanel data={data} />
      </div>
    </>
  )
}
