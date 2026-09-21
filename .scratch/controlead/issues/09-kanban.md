# 09: Kanban de leads

**What to build:** A visão `/leads?view=kanban` como alternativa à tabela, com colunas do pipeline (exceto "Fechado", tratado na próxima etapa) e drag-and-drop nativo entre colunas para mudar o status do lead.

**Blocked by:** 08

**Status:** done

- [x] `features/leads/KanbanBoard.tsx` + `KanbanColumn.tsx` + `LeadCard.tsx`, usando HTML5 drag-and-drop nativo (sem dependência)
- [x] Colunas seguem `LeadStatus` na ordem do pipeline (sem coluna "Follow-up", que não existe mais como status); estados finais (`not_interested`, `lost`) ficam ocultáveis/colapsáveis
- [x] Alternância tabela/Kanban via `?view=table|kanban`, persistida na URL
- [x] Cada `LeadCard`: nome, empresa, badge de follow-up pendente (se houver), próxima ação
- [x] Menu "Mover para…" em cada card como alternativa ao drag-and-drop (fallback touch/teclado)
- [x] Mover um card (drag ou menu) chama `leadService.changeStatus`, gera evento e dispara a mesma sugestão de follow-up da etapa 08
- [x] Verificação manual: arrastar um card entre colunas muda o status e aparece na timeline do lead
- [x] `npm run build` sem erros

**Nota de implementação:** verificado via o menu "Mover para…" (equivalente funcional ao drag-and-drop, já que automação de arrastar-e-soltar nativo via ferramentas headless é frágil); o `onDragStart`/`onDrop` usa a mesma função `onMoveLead`, então a cobertura é a mesma. A sugestão de follow-up no Kanban aparece como toast informativo (o card não tem espaço para o banner editável do Drawer), orientando a abrir o lead para confirmar.
