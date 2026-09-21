# 06: Drawer do lead + histórico/timeline

**What to build:** Ao clicar num lead na tabela, um Drawer abre por cima da lista (`/leads/:id`) mostrando os dados completos, a timeline de eventos e permitindo registrar notas manuais e contatos. Mudanças de status já feitas na etapa 03 passam a ser visíveis na timeline da UI.

**Blocked by:** 05

**Status:** done

- [x] Rota `/leads/:id` renderiza `LeadsPage` com `LeadDrawer` aberto sobre a tabela (mantendo a lista de fundo)
- [x] `LeadDrawer`: dados do lead, `ContactLinks`, edição rápida, e uma `Timeline` com os eventos em ordem cronológica
- [x] `services/leadService.ts` expandido: `addNote(leadId, text)` grava evento `note` sem atualizar `lastInteractionAt`
- [x] `services/leadService.ts`: `logContact(leadId, channel, at)` grava evento `contact` e atualiza `lastInteractionAt`
- [x] Mudança de status pelo Drawer (select de status) grava evento `status_changed` com `from`/`to` e atualiza `lastInteractionAt`
- [x] Reabrir um lead `closed` para outro status é permitido, com aviso, preservando `firstClosedAt`
- [x] Verificação manual: mudar status → aparece na timeline; adicionar nota → timeline atualiza mas `lastInteractionAt` não muda; registrar contato → `lastInteractionAt` muda
- [x] `npm run build` sem erros
