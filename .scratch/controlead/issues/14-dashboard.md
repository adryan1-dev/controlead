# 14: Dashboard acionável

**What to build:** A tela inicial (`/`) que centraliza o que precisa de atenção hoje: KPIs clicáveis, a seção "Ações pendentes" (atrasadas/hoje/próximos 7 dias) e "Alertas" (prazos, leads parados, saldo em aberto), sem gráficos decorativos.

**Blocked by:** 08, 11, 13

**Status:** done

- [x] `hooks/useDashboard.ts`: agrega leads ativos, follow-up pendente, novos no mês, fechados no mês, projetos em produção, prazo próximo/atrasado, aguardando pagamento, vendido no mês, recebido no mês, a receber
- [x] `features/dashboard/KpiGrid.tsx`: KPIs compactos, cada um clicável levando à lista já filtrada correspondente (ex.: clicar em "Follow-up pendente" abre `/leads?followup=1`) — implementado também `/leads?stale=1` para reaproveitar o mesmo mecanismo de filtro por leads parados
- [x] `features/dashboard/ActionsPanel.tsx`: tarefas abertas agrupadas em Atrasadas / Hoje / Próximos 7 dias, cada item com título derivado, lead associado, atalhos de contato, botões "Concluir", "Concluir e próxima" e "Adiar +1d" (reusando `taskService` da etapa 08)
- [x] `features/dashboard/AlertsPanel.tsx`: projetos atrasados/perto do prazo (`domain/rules.ts`), leads parados (`isStale`), projetos entregues com saldo em aberto
- [x] Banner de lembrete de backup se `settings.lastBackupAt` estiver há mais de `backupReminderDays` (ou nunca tiver sido feito)
- [x] Verificação manual: dados de exemplo cobrindo lead parado, projeto atrasado, tarefa atrasada/hoje/futura e projeto entregue com saldo — cada item apareceu exatamente na seção esperada, KPIs conferidos manualmente
- [x] `npm run build` sem erros
