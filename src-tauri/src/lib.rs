use std::{fs, io, path::Path};

use tauri::Manager;

/// Identificador usado até a v0.1.0. O WebView2 guarda os dados (IndexedDB)
/// numa pasta com o nome do identificador, então ao trocar para
/// `dev.controlead.desktop` a v1.0.1 abriria vazia. Na primeira execução,
/// copiamos os dados antigos para a pasta nova (a antiga fica intacta).
const LEGACY_IDENTIFIER: &str = "dev.controlead.app";

fn copy_dir_recursive(from: &Path, to: &Path) -> io::Result<()> {
  fs::create_dir_all(to)?;
  for entry in fs::read_dir(from)? {
    let entry = entry?;
    let target = to.join(entry.file_name());
    if entry.file_type()?.is_dir() {
      copy_dir_recursive(&entry.path(), &target)?;
    } else {
      fs::copy(entry.path(), &target)?;
    }
  }
  Ok(())
}

fn migrate_legacy_webview_data(app: &tauri::App) {
  let path = app.path();
  let (Ok(local), Ok(current)) = (path.local_data_dir(), path.app_local_data_dir()) else {
    return;
  };
  let legacy_webview = local.join(LEGACY_IDENTIFIER).join("EBWebView");
  let current_webview = current.join("EBWebView");
  let has_current_data = current_webview.join("Default").join("IndexedDB").exists();

  if legacy_webview.exists() && !has_current_data {
    match copy_dir_recursive(&legacy_webview, &current_webview) {
      Ok(()) => log::info!("dados migrados de {}", legacy_webview.display()),
      Err(err) => log::error!("falha ao migrar dados de {}: {err}", legacy_webview.display()),
    }
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }

      // A migração precisa rodar antes do WebView abrir a pasta de dados,
      // por isso a janela tem `create: false` no tauri.conf.json e nasce aqui.
      migrate_legacy_webview_data(app);
      tauri::WebviewWindowBuilder::from_config(app.handle(), &app.config().app.windows[0])?.build()?;
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
