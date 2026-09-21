# 05: Leads — CRUD completo + tabela + filtros na URL

**What to build:** A página `/leads` funcional em visão de tabela: cadastrar, editar e arquivar leads, com filtros persistidos na URL e atalhos de contato. Esta é a primeira feature ponta a ponta do app (UI → hook → service → Dexie → tela atualizada via `useLiveQuery`).

**Blocked by:** 03, 04

**Status:** done

- [x] `hooks/useLeads.ts` / `useLead.ts` usando `useLiveQuery` sobre `leadService`
- [x] `hooks/useUrlFilters.ts` sincronizando filtros com a query string
- [x] `features/leads/LeadsPage.tsx` + `LeadsTable.tsx`: listagem com colunas relevantes (nome, empresa, status, nicho, origem, próximo contato)
- [x] `LeadFilters`: status, nicho, origem, tags, período de cadastro — todos refletidos em `?status=…&niche=…` etc., sobrevivendo a reload
- [x] `LeadForm` (em Modal ou Drawer): criar/editar lead com todos os campos do modelo (nome, empresa, instagram, whatsapp, site, nicho, cidade, origem, valor estimado, observações, tags). Apenas `nome` é obrigatório — todo o resto é opcional, para não travar o cadastro rápido
- [x] Aviso (não bloqueante) ao cadastrar lead com Instagram ou WhatsApp já existente em outro lead
- [x] `ContactLinks` na listagem/formulário abrindo WhatsApp/Instagram/site em nova aba com normalização correta
- [x] Mudança de status inline direto na linha da tabela (select compacto), sem precisar abrir o Drawer
- [x] Ação de arquivar lead com confirmação (`ConfirmDialog`)
- [x] Verificação manual: cadastrar, editar, arquivar um lead; recarregar a página com filtros na URL e confirmar que persistem
- [x] `npm run build` sem erros
