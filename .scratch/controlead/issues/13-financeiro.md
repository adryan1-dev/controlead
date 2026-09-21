# 13: Financeiro (KPIs do mês + tabela)

**What to build:** A página `/finance` com o controle financeiro operacional simples pedido no escopo: KPIs do mês selecionado e uma tabela Cliente/Projeto/Total/Recebido/Restante/Status.

**Blocked by:** 11

**Status:** done

- [x] `hooks/useFinance.ts`: agrega, para um mês (`?month=YYYY-MM`), vendido no mês (Σ itens contracted+additional−discount com `date` no mês), recebido no mês (Σ payments com `date` no mês), a receber (Σ saldos positivos de projetos não cancelados), lista de projetos com pagamento pendente
- [x] `features/finance/FinancePage.tsx`: seletor de mês, KPIs no topo, tabela Cliente | Projeto | Total | Recebido | Restante | Status abaixo
- [x] Linha da tabela clicável, levando a `/projects/:id`
- [x] Verificação manual: conferido no navegador contra os 2 projetos de exemplo — vendido R$1.800 (1.500+300), recebido R$1.500, a receber R$300, 1 pagamento pendente — todos batendo exatamente
- [x] `npm run build` sem erros
