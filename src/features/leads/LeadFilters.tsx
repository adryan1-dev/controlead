import { Search } from 'lucide-react'

import { Combobox } from '@/components/ui/Combobox'
import { DateInput } from '@/components/ui/DateInput'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { LEAD_PIPELINE_ORDER, LEAD_STATUS_LABELS } from '@/domain/constants'
import { useLeadFieldSuggestions } from '@/hooks/useLeads'

export interface LeadFiltersValue {
  status: string
  niche: string
  source: string
  search: string
  tag: string
  createdFrom: string
  createdTo: string
  [key: string]: string
}

interface LeadFiltersProps {
  value: LeadFiltersValue
  onChange: (patch: Partial<LeadFiltersValue>) => void
}

export function LeadFilters({ value, onChange }: LeadFiltersProps) {
  const { niches, sources } = useLeadFieldSuggestions()

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <div className="relative w-64">
        <Search size={15} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
        <Input
          className="pl-8"
          placeholder="Buscar por nome, empresa, contato…"
          value={value.search}
          onChange={(e) => onChange({ search: e.target.value })}
        />
      </div>
      <Select
        className="w-44"
        value={value.status}
        onChange={(e) => onChange({ status: e.target.value })}
      >
        <option value="">Todos os status</option>
        {LEAD_PIPELINE_ORDER.map((status) => (
          <option key={status} value={status}>
            {LEAD_STATUS_LABELS[status]}
          </option>
        ))}
        <option value="not_interested">{LEAD_STATUS_LABELS.not_interested}</option>
        <option value="lost">{LEAD_STATUS_LABELS.lost}</option>
      </Select>
      <div className="w-40">
        <Combobox value={value.niche} onChange={(v) => onChange({ niche: v })} options={niches} placeholder="Nicho" />
      </div>
      <div className="w-40">
        <Combobox value={value.source} onChange={(v) => onChange({ source: v })} options={sources} placeholder="Origem" />
      </div>
      <div className="w-32">
        <Input placeholder="Tag" value={value.tag} onChange={(e) => onChange({ tag: e.target.value })} />
      </div>
      <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
        <span>Cadastro:</span>
        <DateInput value={value.createdFrom || undefined} onChange={(v) => onChange({ createdFrom: v ?? '' })} />
        <span>até</span>
        <DateInput value={value.createdTo || undefined} onChange={(v) => onChange({ createdTo: v ?? '' })} />
      </div>
    </div>
  )
}
