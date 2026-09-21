# 04: Kit de UI reutilizável

**What to build:** O conjunto de componentes de interface que todas as features vão consumir, visualmente coerentes com a direção "dashboard SaaS limpo" do plano. Nenhum componente aqui conhece Dexie ou regras de negócio — são componentes de apresentação puros, com uma página de demonstração para conferir todos visualmente.

**Blocked by:** 01

**Status:** done

- [x] `components/ui/`: `Button`, `IconButton`, `Input`, `Textarea`, `Select`, `Field`, `MoneyInput`, `DateInput`, `TagInput`, `Combobox` (via `<datalist>`), `Badge`, `StatusBadge`, `Card`, `StatCard`, `Table`, `Modal`, `Drawer`, `ConfirmDialog`, `Tabs`, `EmptyState`, `Toast`, `Menu`
- [x] `Modal` e `Drawer` implementados sobre `<dialog>` nativo (sem dependência extra), com fechamento por `Esc` e clique fora
- [x] `MoneyInput` usa `domain/money.ts` (etapa 02) para parse/format
- [x] `components/shared/`: `ContactLinks` (WhatsApp/Instagram/site usando `domain/links.ts`), `Timeline`, `TaskItem`, `MoneyText`, `DueLabel`
- [x] Página `/dev/ui` (só acessível em modo dev) renderizando todos os componentes com variações de estado (vazio, erro, desabilitado)
- [x] Paleta neutra + 1 cor de destaque, cores semânticas reservadas para badges de status e alertas, consistente com os tokens `@theme` da etapa 01
- [x] `npm run build` sem erros

**Nota de implementação:** `Instagram` foi removido do `lucide-react` (ícones de marca descontinuados); usamos `AtSign` no `ContactLinks` como substituto neutro. Bug encontrado e corrigido durante a verificação manual: uma classe `flex` incondicional no `Drawer` sobrescrevia o `dialog:not([open]){display:none}` do user-agent stylesheet (CSS de autor sempre vence UA, independente de especificidade), deixando o drawer sempre visível; corrigido com o modificador `hidden open:flex` do Tailwind.
