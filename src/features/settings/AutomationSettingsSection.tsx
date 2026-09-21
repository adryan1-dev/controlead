import { useEffect, useState } from 'react'

import { Card } from '@/components/ui/Card'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { LEAD_PIPELINE_ORDER, LEAD_STATUS_LABELS, type LeadStatus } from '@/domain/constants'
import type { Settings } from '@/domain/types'
import { getSettings, updateSettings } from '@/services/settingsService'

/** Statuses onde faz sentido sugerir um follow-up ao entrar neles. */
const FOLLOW_UP_STATUSES: LeadStatus[] = LEAD_PIPELINE_ORDER.filter((s) => s !== 'to_contact' && s !== 'closed')

function toNumber(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) && n >= 0 ? n : fallback
}

export function AutomationSettingsSection() {
  const [settings, setSettings] = useState<Settings | undefined>(undefined)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getSettings().then(setSettings)
  }, [])

  if (!settings) return null

  async function persist(next: Settings) {
    setSettings(next)
    setSaving(true)
    try {
      await updateSettings(next)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="flex flex-col gap-5">
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">Automações</h2>
        <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">
          Controlam as sugestões de follow-up, o alerta de "lead parado" e os avisos de prazo.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {FOLLOW_UP_STATUSES.map((status) => (
          <Field key={status} label={LEAD_STATUS_LABELS[status]} helperText="dias para sugerir follow-up">
            <Input
              type="number"
              min={0}
              value={settings.followUpDays[status] ?? ''}
              onChange={(e) =>
                persist({
                  ...settings,
                  followUpDays: { ...settings.followUpDays, [status]: toNumber(e.target.value, 0) },
                })
              }
            />
          </Field>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Lead parado após" helperText="dias sem interação">
          <Input
            type="number"
            min={1}
            value={settings.staleDays}
            onChange={(e) => persist({ ...settings, staleDays: toNumber(e.target.value, settings.staleDays) })}
          />
        </Field>
        <Field label="Prazo próximo" helperText="dias de antecedência">
          <Input
            type="number"
            min={0}
            value={settings.deadlineWarningDays}
            onChange={(e) =>
              persist({ ...settings, deadlineWarningDays: toNumber(e.target.value, settings.deadlineWarningDays) })
            }
          />
        </Field>
        <Field label="Lembrete de backup" helperText="dias desde o último">
          <Input
            type="number"
            min={1}
            value={settings.backupReminderDays}
            onChange={(e) =>
              persist({ ...settings, backupReminderDays: toNumber(e.target.value, settings.backupReminderDays) })
            }
          />
        </Field>
      </div>

      <p className="text-xs text-[var(--color-text-muted)]">{saving ? 'Salvando…' : 'Alterações salvas automaticamente.'}</p>
    </Card>
  )
}
