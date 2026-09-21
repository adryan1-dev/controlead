import { useId } from 'react'

import { Input } from './Input'

interface ComboboxProps {
  id?: string
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  invalid?: boolean
}

/**
 * Input de texto livre com autocomplete via `<datalist>` nativo, sem
 * dependência extra. Usado para nicho/origem/cidade: sugere valores já
 * cadastrados, mas aceita qualquer texto novo.
 */
export function Combobox({ id, value, onChange, options, placeholder, invalid }: ComboboxProps) {
  const listId = useId()

  return (
    <>
      <Input
        id={id}
        list={listId}
        value={value}
        placeholder={placeholder}
        invalid={invalid}
        onChange={(e) => onChange(e.target.value)}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  )
}
