import { PageHeader } from '@/components/layout/PageHeader'

import { AutomationSettingsSection } from './AutomationSettingsSection'
import { BackupSection } from './BackupSection'

export function SettingsPage() {
  return (
    <>
      <PageHeader title="Configurações" />
      <div className="flex max-w-2xl flex-col gap-4">
        <AutomationSettingsSection />
        <BackupSection />
      </div>
    </>
  )
}
