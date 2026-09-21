# 11: Projetos — lista, detalhe, itens e pagamentos

**What to build:** A área de Projetos completa: lista em `/projects`, página de detalhe em `/projects/:id` com status, prazos, URLs, itens combinados (contratado/adicional/cortesia/desconto), pagamentos individuais e o resumo financeiro totalmente derivado.

**Blocked by:** 10

**Status:** done

- [x] `services/projectService.ts`: CRUD de projeto, `changeStatus` (gravando evento `project_status_changed`), CRUD de `projectItems` (evento `item_added`), delete de projeto com confirmação e cascata (itens, pagamentos, tarefas e eventos do projeto; evento `project_deleted` no lead)
- [x] `services/paymentService.ts`: `add`/`update`/`remove` pagamento, gravando eventos `payment_added`/`payment_removed`
- [x] `hooks/useProjects.ts` / `useProject.ts`
- [x] `features/projects/ProjectsPage.tsx`: lista com filtros de status, status financeiro e prazo (atrasado/próximo), usando `domain/rules.ts` (`deadlineState`)
- [x] `features/projects/ProjectDetailPage.tsx`: cabeçalho com status/datas/URLs editáveis, `ItemsSection` (itens combinados com tipo e valor), `PaymentsSection` (lista de pagamentos), `FinanceSummary` (total/recebido/saldo/status financeiro via `domain/finance.ts`), timeline de eventos do projeto
- [x] Pagamento que excede o saldo: aviso não bloqueante, exibindo o excedente
- [x] Projeto 100% cortesia (total 0): status financeiro "Sem cobrança", fora de qualquer alerta de "a receber"
- [x] Status `cancelled` disponível e excluído dos alertas de prazo e "a receber"
- [x] Verificação manual: adicionar pagamentos até saldo 0 → status muda para "Pago" automaticamente; adicionar item cortesia não altera o total
- [x] `npm run build` sem erros

**Nota:** tarefas do projeto (item opcional do ticket) não foram incluídas na página — o hook `useLeadTasks`/`TaskItem` já cobrem tarefas por lead; tarefas específicas de projeto podem ser adicionadas depois sem mudança de schema (o campo `Task.projectId` já existe).
