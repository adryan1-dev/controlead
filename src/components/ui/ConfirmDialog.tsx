import { useState } from 'react'

import { Button } from './Button'
import { Input } from './Input'
import { Modal } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmLabel?: string
  danger?: boolean
  /** Se definido, exige que o usuário digite exatamente este texto para habilitar a confirmação. */
  requireTypedConfirmation?: string
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirmar',
  danger = false,
  requireTypedConfirmation,
}: ConfirmDialogProps) {
  const [typed, setTyped] = useState('')

  const canConfirm = !requireTypedConfirmation || typed === requireTypedConfirmation

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={!canConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm text-[var(--color-text-secondary)]">{description}</p>
      {requireTypedConfirmation ? (
        <div className="mt-3">
          <Input
            autoFocus
            placeholder={`Digite "${requireTypedConfirmation}" para confirmar`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
        </div>
      ) : null}
    </Modal>
  )
}
