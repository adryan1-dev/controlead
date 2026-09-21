# 12: Clientes (derivado) + novo projeto para cliente existente

**What to build:** A página `/clients`, que não é uma tabela própria mas uma visão derivada dos leads que já possuem pelo menos um projeto, mais a capacidade de criar um segundo projeto para um cliente já existente sem duplicar cadastro.

**Blocked by:** 11

**Status:** done

- [x] `hooks`/consulta derivada: lead é "cliente" se possui ≥1 projeto (sem nova tabela) — `hooks/useClients.ts` (`useClients`, `useIsClient`)
- [x] `features/clients/ClientsPage.tsx`: tabela com nome, nº de projetos, total, recebido, saldo (agregando `domain/finance.ts` sobre os projetos do lead); clicar abre `/leads/:id`
- [x] No `LeadDrawer` de um lead que já é cliente, botão "Novo projeto" reutiliza o `CloseDealModal` sem exigir mudança de status do lead (já está `closed`) — o mesmo botão/modal já existia da etapa 10 (genérico o bastante), aqui só ficou condicionalmente rotulado
- [x] Verificação manual: fechar negócio de um lead → aparece em `/clients`; criar um segundo projeto para o mesmo lead → `/clients` mostra 2 projetos e valores agregados corretos
- [x] `npm run build` sem erros
