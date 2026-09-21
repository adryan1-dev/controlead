# 17: Empacotar como aplicativo desktop (.exe)

**What to build:** O app compilado como um instalador Windows (`.exe`/`.msi`) via Tauri, para que outras pessoas possam instalar uma versão zerada no próprio PC e usar offline, sem precisar rodar `npm run dev`. Cada instalação tem seu próprio IndexedDB local (nenhum dado é compartilhado entre instalações), preservando a natureza pessoal/local do app.

**Blocked by:** 16

**Status:** ready-for-agent

- [ ] Decisão de empacotamento: **Tauri** (não Electron) — o WebView2 nativo do Windows já existe no SO (não embarca um Chromium inteiro), gerando um instalador de poucos MB em vez de ~150MB+; como o app não usa nenhuma API Node (só IndexedDB/Dexie no navegador), não há motivo para pagar o custo do Electron
- [ ] `npm install -D @tauri-apps/cli` + `cargo`/toolchain Rust como pré-requisito documentado no README (instruções de instalação do Rust/MSVC Build Tools para quem for compilar)
- [ ] `src-tauri/` inicializado (`tauri.conf.json` apontando `distDir` para `dist/` do Vite, `devPath` para o servidor de dev na porta fixa 5183)
- [ ] Ícone do app (`.ico`) gerado a partir de um ícone simples do Controlead
- [ ] Metadados do instalador: nome do app, versão inicial (`0.1.0`), identificador único, autor
- [ ] `npm run build:desktop` (ou similar) gerando o `.exe`/`.msi` em `src-tauri/target/release/bundle/`
- [ ] Confirmar que o WebView do Tauri tem sua própria origem local (não `http://localhost`), então o IndexedDB funciona normalmente dentro do app empacotado sem depender da porta fixa do Vite (a porta fixa continua importante só para o fluxo de desenvolvimento)
- [ ] Testar em uma máquina/perfil de usuário "limpo": instalar o `.exe`, abrir o app, confirmar que começa zerado (sem dados de desenvolvimento) e que o backup/restore (etapa 7) funciona normalmente dentro do app empacotado
- [ ] Documentar no README como gerar o instalador e como um usuário final instala e desinstala o app
- [ ] `npm run build` (build web) continua funcionando normalmente à parte do empacotamento desktop
