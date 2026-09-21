# 02: Domínio puro (tipos, cálculos, regras)

**What to build:** A camada `domain/` completa e testada, sem nenhuma dependência de UI ou banco: tipos das entidades, constantes de status/labels, utilitários de dinheiro e datas, geração de links de contato, cálculos financeiros de projeto e regras de automação (lead parado, prazo de projeto, próxima ação). Essa camada é a fonte de verdade de todas as regras de negócio do app e será reusada por services e UI nas próximas etapas.

**Blocked by:** 01

**Status:** done

- [x] `domain/types.ts`: tipos de `Lead`, `Task`, `Event`, `Project`, `ProjectItem`, `Payment`, `Settings` conforme o modelo de dados do plano
- [x] `domain/constants.ts`: `LeadStatus`, `ProjectStatus`, `TaskType`, ordem do pipeline, labels em PT-BR, cores de badge
- [x] `domain/money.ts`: parse/format de valores em centavos, aceitando "1.500", "1500,50", "R$ 1.500,00"
- [x] `domain/dates.ts`: `today()`, `addDays`, `diffDays`, `isSameMonth` operando em strings `YYYY-MM-DD` sem bug de fuso
- [x] `domain/links.ts`: `whatsappUrl`, `instagramUrl`, `websiteUrl` com normalização (WhatsApp prefixa 55 se 10–11 dígitos; Instagram aceita @ ou URL colada e extrai handle)
- [x] `domain/finance.ts`: `getProjectFinance(items, payments)` retornando total, recebido, saldo e status financeiro (Não pago/Parcial/Pago/Sem cobrança/excedente), cobrindo cortesia (não soma ao total) e desconto
- [x] `domain/rules.ts`: `isStale`, `deadlineState` (overdue/soon/ok), próxima ação derivada de tarefas abertas
- [x] `domain/search.ts`: normalização de texto (remove acento/caixa) para busca
- [x] `domain/schemas.ts`: schemas zod para os formulários principais (lead, fechar negócio, item, pagamento) — ainda sem o schema de backup completo
- [x] Testes Vitest cobrindo: finanças (parcial/pago/excedente/cortesia/desconto>original bloqueado), datas, links, `isStale`, `deadlineState`
- [x] `npm test` e `npm run build` verdes
