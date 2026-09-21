import type { DateString } from '@/domain/types'

import { Input } from './Input'

interface DateInputProps {
  id?: string
  value: DateString | undefined
  onChange: (value: DateString | undefined) => void
  invalid?: boolean
  disabled?: boolean
  min?: DateString
  max?: DateString
}

/** Input nativo `type="date"`, já operando diretamente em strings `YYYY-MM-DD`. */
export function DateInput({ id, value, onChange, invalid, disabled, min, max }: DateInputProps) {
  return (
    <Input
      id={id}
      type="date"
      invalid={invalid}
      disabled={disabled}
      min={min}
      max={max}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value || undefined)}
    />
  )
}
