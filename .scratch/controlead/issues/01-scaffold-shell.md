# 01: Scaffold + shell de navegação

**What to build:** Projeto Vite (React + TypeScript) funcionando com Tailwind v4, React Router e Vitest configurados, porta fixa, e um `AppShell` com Sidebar navegável entre as rotas vazias do app (Dashboard, Leads, Clientes, Projetos, Financeiro, Configurações). Nenhuma lógica de dados ainda — só a base verificável no navegador.

**Blocked by:** None (can start immediately)

**Status:** done

- [x] `npm run dev` sobe o app em porta fixa (config em `vite.config.ts`, `server.port` + `strictPort`, idem `preview`)
- [x] Tailwind v4 configurado via `@tailwindcss/vite`, com tokens semânticos em `@theme` no `index.css`
- [x] React Router configurado (`router.tsx`) com rotas: `/`, `/leads`, `/clients`, `/projects`, `/finance`, `/settings`
- [x] `AppShell` com Sidebar fixa (240px) listando os 6 itens de navegação e destacando a rota ativa
- [x] Cada página é um placeholder navegável (sem lógica de dados)
- [x] `npm test` roda com Vitest configurado (um teste trivial passando)
- [x] `npm run build` sem erros
