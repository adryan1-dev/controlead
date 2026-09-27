import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Textarea } from '@/components/ui/Textarea'
import { useToast } from '@/components/ui/Toast'
import type { Competitor } from '@/domain/types'
import { addCompetitor, updateCompetitor } from '@/services/competitorService'

interface CompetitorFormProps {
  open: boolean
  onClose: () => void
  leadId: string
  competitor?: Competitor
}

export function CompetitorForm(props: CompetitorFormProps) {
  return props.open ? <CompetitorFormBody {...props} /> : null
}

function CompetitorFormBody({ onClose, leadId, competitor }: CompetitorFormProps) {
  const { showToast } = useToast()
  const [name, setName] = useState(competitor?.name ?? '')
  const [website, setWebsite] = useState(competitor?.website ?? '')
  const [offers, setOffers] = useState(competitor?.offers ?? '')
  const [opportunity, setOpportunity] = useState(competitor?.opportunity ?? '')
  const [error, setError] = useState<string | undefined>(undefined)

  async function handleSave() {
    if (!name.trim()) {
      setError('Informe o nome do concorrente')
      return
    }
    const input = {
      name: name.trim(),
      website: website.trim() || undefined,
      offers: offers.trim() || undefined,
      opportunity: opportunity.trim() || undefined,
    }
    if (competitor) {
      await updateCompetitor(competitor.id, input)
      showToast('Concorrente atualizado')
    } else {
      await addCompetitor(leadId, input)
      showToast('Concorrente adicionado')
    }
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={competitor ? 'Editar concorrente' : 'Novo concorrente'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Salvar
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Field label="Nome" required error={error}>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <Field label="Site" helperText="Link ou descrição, ex.: “botão Website no Maps”">
          <Input value={website} onChange={(e) => setWebsite(e.target.value)} />
        </Field>
        <Field label="O que oferece no site">
          <Textarea rows={2} value={offers} onChange={(e) => setOffers(e.target.value)} />
        </Field>
        <Field label="Oportunidade que isso revela">
          <Textarea rows={2} value={opportunity} onChange={(e) => setOpportunity(e.target.value)} />
        </Field>
      </div>
    </Modal>
  )
}
