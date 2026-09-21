import { useEffect, useState } from 'react'

import { formatCents, parseCents } from '@/domain/money'

import { Input } from './Input'

interface MoneyInputProps {
  id?: string
  value: number | undefined
  onChange: (cents: number | undefined) => void
  placeholder?: string
  invalid?: boolean
  disabled?: boolean
}

/** Input de dinheiro: aceita digitação livre ("1.500", "1500,50"), formata como BRL ao perder o foco. */
export function MoneyInput({ id, value, onChange, placeholder = 'R$ 0,00', invalid, disabled }: MoneyInputProps) {
  const [text, setText] = useState(value !== undefined ? formatCents(value) : '')

  useEffect(() => {
    setText(value !== undefined ? formatCents(value) : '')
  }, [value])

  return (
    <Input
      id={id}
      inputMode="decimal"
      placeholder={placeholder}
      invalid={invalid}
      disabled={disabled}
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const cents = parseCents(text)
        onChange(cents ?? undefined)
        setText(cents !== null ? formatCents(cents) : '')
      }}
    />
  )
}
