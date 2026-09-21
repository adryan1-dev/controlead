# 16: Polimento final

**What to build:** Passagem final de qualidade sobre o app completo: estados vazios, atalhos de teclado, responsividade básica, revisão de acessibilidade e documentação de uso (porta fixa, processo de backup) — sem adicionar funcionalidade nova.

**Blocked by:** 14, 15

**Status:** done

- [x] `EmptyState` com call-to-action em toda lista que pode estar vazia (leads, projetos, clientes, resultados de busca/filtro) — já cobertas desde as etapas anteriores; conferido nesta passada
- [x] Atalhos: `Ctrl+K` (busca), `N` para novo lead na página de leads, `Esc` fecha drawer/modal em todas as telas
- [x] Responsividade básica: Sidebar vira menu hambúrguer com overlay em telas pequenas (`AppShell`), Kanban com scroll horizontal, tabelas com scroll horizontal quando necessário
- [x] Revisão de acessibilidade básica: labels em todos os inputs (`Field`), foco visível, `aria-label` em botões só-ícone (`IconButton` exige a prop), ordem de tab dentro do `<dialog>` (focus trap nativo do navegador)
- [x] `README.md` do projeto: como rodar, por que a porta é fixa, como fazer backup/restore, estrutura de pastas resumida
- [x] Passada manual completa do fluxo Lead → Abordagem → Follow-up → Concluir e próxima → Fechamento → Projeto → Pagamento → Dashboard, tudo refletindo corretamente
- [x] `npm test` e `npm run build` verdes

**Bug real encontrado e corrigido nesta etapa:** o fechamento nativo do `<dialog>` ao pressionar Esc não disparava de forma confiável (reproduzido com teclas reais via automação, não só eventos sintéticos). Adicionado um `onKeyDown` explícito em `Modal`, `Drawer` e `GlobalSearch` que chama `onClose()`/`setOpen(false)` diretamente no Esc, sem depender só do comportamento nativo do navegador.
