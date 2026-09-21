# 08: Tarefas/próxima ação + sugestão de follow-up

**What to build:** O conceito de "próxima ação" ganha vida: criar, concluir, adiar tarefas ligadas a um lead, com sugestão automática de follow-up ao mudar o status do lead e uma tela de Configurações para ajustar os dias de cada sugestão.

**Blocked by:** 06

**Status:** done

- [x] `services/taskService.ts`: `create`, `complete` (com opção `andNext` para já criar a próxima), `cancel`, `postpone` (+1 dia)
- [x] `complete` grava evento `task_completed` e atualiza `lastInteractionAt` do lead
- [x] `hooks/useTasks.ts` (tarefas de um lead) e leitura da "próxima ação" derivada (tarefa `open` com menor `dueDate`)
- [x] `features/tasks/TaskForm.tsx`: criar tarefa (tipo, data, nota) a partir do Drawer do lead
- [x] `features/tasks/CompleteTaskDialog.tsx`: ao concluir, oferece tipo+data da próxima tarefa pré-preenchidos
- [x] Ao chamar `leadService.changeStatus`, se `settings.followUpDays[novoStatus]` existir, exibir prompt compacto "Criar follow-up para dd/mm (+N dias)?" com data editável e um clique para criar a tarefa (sugestão, não criação silenciosa)
- [x] Ao marcar lead como "Não interessado"/"Perdido", perguntar se cancela as tarefas abertas do lead
- [x] `features/settings/SettingsPage.tsx`: formulário editando `followUpDays` (por status), `staleDays`, `deadlineWarningDays`, `backupReminderDays` via `settingsService`
- [x] Verificação manual: mudar lead para "Abordagem feita" → sugestão de follow-up em +3 dias (valor configurável em Configurações)
- [x] `npm run build` sem erros
