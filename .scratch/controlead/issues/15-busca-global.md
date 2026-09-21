# 15: Busca global Ctrl+K

**What to build:** Um seletor de busca acionado por `Ctrl+K` em qualquer página, buscando leads e projetos por múltiplos campos, sem depender de bibliotecas externas de busca.

**Blocked by:** 11

**Status:** done

- [x] `components/layout/GlobalSearch.tsx`: modal acionado por `Ctrl+K`, campo de busca com foco automático, navegação por teclado (setas + Enter)
- [x] Busca em memória sobre leads (nome, empresa, instagram, whatsapp, cidade, nicho, tags) e projetos (serviço, nome do lead associado), usando `domain/search.ts` (normalização sem acento/caixa)
- [x] Enter no resultado selecionado navega para `/leads/:id` ou `/projects/:id`
- [x] Verificação manual: lead encontrado sem acento ("conceicao" → "João da Conceição"), por instagram ("estudio.conceicao"), projeto pelo serviço ("atrasado" → "Site atrasado"), Enter navegando corretamente
- [x] `npm run build` sem erros
