import { AtSign, Globe, MessageCircle } from 'lucide-react'

import { instagramUrl, websiteUrl, whatsappUrl } from '@/domain/links'

import { IconButton } from '../ui/IconButton'

interface ContactLinksProps {
  whatsapp?: string
  instagram?: string
  website?: string
  size?: 'sm' | 'md'
}

/** Atalhos de contato (WhatsApp/Instagram/site), abrindo em nova aba. Sem integração com APIs externas. */
export function ContactLinks({ whatsapp, instagram, website }: ContactLinksProps) {
  const wa = whatsapp ? whatsappUrl(whatsapp) : null
  const ig = instagram ? instagramUrl(instagram) : null
  const site = website ? websiteUrl(website) : null

  if (!wa && !ig && !site) return null

  return (
    <div className="flex items-center gap-1">
      {wa ? (
        <IconButton
          icon={<MessageCircle size={16} />}
          label="Abrir WhatsApp"
          onClick={() => window.open(wa, '_blank', 'noopener,noreferrer')}
        />
      ) : null}
      {ig ? (
        <IconButton
          icon={<AtSign size={16} />}
          label="Abrir Instagram"
          onClick={() => window.open(ig, '_blank', 'noopener,noreferrer')}
        />
      ) : null}
      {site ? (
        <IconButton
          icon={<Globe size={16} />}
          label="Abrir site"
          onClick={() => window.open(site, '_blank', 'noopener,noreferrer')}
        />
      ) : null}
    </div>
  )
}
