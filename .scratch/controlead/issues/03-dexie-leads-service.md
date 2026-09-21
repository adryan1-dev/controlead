# 03: Camada Dexie + serviço de Leads básico

**What to build:** O banco local (IndexedDB via Dexie) criado com o schema v1 completo (todas as tabelas do modelo de dados), mais o primeiro serviço de escrita real (`leadService`) e `settingsService`, ambos testáveis fora do navegador. Ao final desta etapa é possível criar e atualizar um lead programaticamente e ver o registro persistido no IndexedDB.

**Blocked by:** 02

**Status:** done

- [x] `db/schema.ts` + `db/db.ts`: instância Dexie com `db.version(1).stores(...)` cobrindo `leads, tasks, events, projects, projectItems, payments, settings` com os índices definidos no plano (incluindo `[status+dueDate]` e `[leadId+at]`)
- [x] `navigator.storage.persist()` chamado na inicialização do app
- [x] `services/settingsService.ts`: leitura/escrita da linha única de configurações (`followUpDays`, `staleDays`, `deadlineWarningDays`, `backupReminderDays`), criando valores padrão se não existir
- [x] `services/leadService.ts`: `create`, `update`, `changeStatus`, `archive`, `delete` (bloqueando delete se houver projetos — ainda sem UI, mas a regra já existe no serviço), cada escrita relevante rodando em `db.transaction(...)` e gravando um evento em `events` (`lead_created`, `status_changed`)
- [x] `changeStatus` atualiza `lastInteractionAt`; `update`/criação de nota não atualiza (a função de nota pode ficar como stub simples aqui, será expandida na etapa 6)
- [x] Testes de serviço com `fake-indexeddb` cobrindo create, changeStatus gerando evento, archive, e delete bloqueado quando há projeto associado
- [x] Verificação manual: criar um lead via console/teste e inspecionar o registro em DevTools → Application → IndexedDB
- [x] `npm test` e `npm run build` verdes
