# 07: Backup export/import + migrações

**What to build:** A funcionalidade de exportar todos os dados para um arquivo JSON e restaurá-los a partir dele, com validação completa (zod + integridade referencial), tratamento de arquivo corrompido/incompatível, e confirmação explícita antes de substituir os dados atuais. Essencial para poder usar o app com dados reais com segurança a partir daqui.

**Blocked by:** 03

**Status:** done

- [x] `domain/schemas.ts` expandido com o schema zod completo do arquivo de backup (`app`, `format`, `schemaVersion`, `exportedAt`, `counts`, `data` com todas as tabelas)
- [x] `domain/migrations.ts`: funções puras `migrate_v{n-1}_to_v{n}` (mesmo com schema v1 único por enquanto, a estrutura fica pronta para a próxima versão)
- [x] `services/backupService.ts`: `exportBackup()` lê todas as tabelas em uma transação e gera o Blob/download; atualiza `settings.lastBackupAt`
- [x] `services/backupService.ts`: `validateBackupFile(json)` — checa `app === 'controlead'`, `format`, rejeita `schemaVersion` mais nova que a atual, aplica migrações se mais antiga, valida com zod e checa integridade referencial (projeto→lead existe, pagamento→projeto existe, IDs únicos)
- [x] `services/backupService.ts`: `importBackup(file)` — antes de substituir, baixa automaticamente um backup dos dados atuais (se houver dados); substitui em transação (`clear()` + `bulkAdd()` em todas as tabelas); falha faz rollback
- [x] `features/settings/BackupSection.tsx`: botão exportar, seletor de arquivo para importar, preview de contagens (backup × dados atuais), `ConfirmDialog` exigindo digitar "SUBSTITUIR"
- [x] Testes de serviço: JSON inválido, app errado, `schemaVersion` futura, referência quebrada, IDs duplicados — cada caso rejeitado com mensagem clara e sem alterar os dados atuais
- [x] Teste end-to-end: exportar → limpar DB → importar → dados idênticos
- [x] `npm test` e `npm run build` verdes
