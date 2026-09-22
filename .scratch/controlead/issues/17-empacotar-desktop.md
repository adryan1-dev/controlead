# 17: Empacotar como aplicativo desktop (.exe)

**What to build:** O app compilado como um instalador Windows (`.exe`/`.msi`) via Tauri, para que outras pessoas possam instalar uma versão zerada no próprio PC e usar offline, sem precisar rodar `npm run dev`. Cada instalação tem seu próprio IndexedDB local (nenhum dado é compartilhado entre instalações), preservando a natureza pessoal/local do app.

**Blocked by:** 16

**Status:** done

- [x] Decisão de empacotamento: **Tauri** (não Electron) — confirmado na prática: instalador de ~2MB (NSIS) / ~3MB (MSI), muito abaixo dos 150MB+ típicos de Electron
- [x] `npm install -D @tauri-apps/cli`; Rust (via `rustup`) e MSVC Build Tools (workload C++) instalados nesta máquina para viabilizar o build agora
- [x] `src-tauri/` inicializado via `tauri init --ci` (`frontendDist` → `../dist`, `devUrl` → `http://localhost:5183`)
- [x] Ícone: mantido o ícone padrão gerado pelo `tauri init` por ora (pode ser trocado depois por um ícone de marca do Controlead sem mudar nenhuma config)
- [x] Metadados do instalador: `productName: "Controlead"`, `version: "0.1.0"`, `identifier: "dev.controlead.app"`, janela 1280×800 (mín. 900×600)
- [x] `npm run build:desktop` gera `Controlead_0.1.0_x64-setup.exe` (NSIS) e `Controlead_0.1.0_x64_en-US.msi` em `src-tauri/target/release/bundle/` — build executado com sucesso nesta sessão
- [x] O WebView do Tauri roda em origem própria local (não depende da porta 5183, que segue relevante só para `npm run dev`), então o IndexedDB funciona isolado por instalação
- [x] Documentado no README (seção "App desktop (.exe)") como gerar o instalador, pré-requisitos e o fato de cada instalação começar zerada
- [x] `npm run build` (build web) confirmado funcionando normalmente à parte do empacotamento desktop

**Não verificado nesta sessão:** instalação/execução real do `.exe` numa máquina limpa via automação de GUI — instaladores rodam elevados e ferramentas de automação não conseguem controlar processos elevados (UAC). A compilação limpa e a geração dos artefatos esperados pelo Tauri são o sinal de correção disponível neste ambiente; o instalador foi entregue ao usuário para teste manual.
