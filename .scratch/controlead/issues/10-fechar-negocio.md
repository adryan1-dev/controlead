# 10: Fechar negócio (Lead → Projeto)

**What to build:** O fluxo de conversão de lead em projeto: botão "Fechar negócio" no Drawer abre um modal que, ao confirmar, cria o projeto, os itens de preço e o pagamento inicial numa única transação — e intercepta o drop na coluna "Fechado" do Kanban para passar pelo mesmo modal.

**Blocked by:** 09

**Status:** done

- [x] `domain/schemas.ts`: schema zod do formulário de fechamento (desconto ≤ valor original, entrada ≥ 0)
- [x] `services/dealService.ts`: `closeDeal(leadId, dealInput)` em transação única sobre `leads, projects, projectItems, payments, tasks, events`:
  - [x] Lead → status `closed`; define `firstClosedAt` se vazio; atualiza `lastInteractionAt`
  - [x] Cria `project` (`status: not_started`, `closedAt: hoje`, `dueDate` do formulário)
  - [x] Cria item `contracted` (serviço + valor original) e, se houver desconto, item `discount`
  - [x] Se entrada > 0, cria `payment`
  - [x] Cancela tarefas comerciais abertas do lead (nota "encerrada no fechamento")
  - [x] Grava eventos `status_changed`, `deal_closed`, `payment_added` (se aplicável)
- [x] `features/deals/CloseDealModal.tsx`: serviço, valor original, desconto **ou** valor final (um calcula o outro via `domain/finance.ts`), entrada recebida + forma de pagamento, prazo, condições de pagamento, observações
- [x] Botão "Fechar negócio" no `LeadDrawer` abre o modal
- [x] No Kanban, soltar/mover um card para "Fechado" nunca chama `changeStatus` diretamente — sempre abre o modal; cancelar não altera nada (o card nunca saiu do status atual, já que a mudança só acontece dentro da transação `closeDeal`)
- [x] Ao confirmar, navega para a página do projeto criado (rota provisória, será detalhada na etapa 11) com toast de sucesso
- [x] Teste de serviço cobrindo a transação completa de `closeDeal` (estado final de lead, projeto, itens, pagamento e eventos)
- [x] `npm test` e `npm run build` verdes

**Verificação manual:** fluxo completo testado no navegador (Drawer → Fechar negócio → preencher → confirmar → navega para `/projects/:id` → projeto/item/pagamento/lead conferidos diretamente no IndexedDB).
