// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use tauri_plugin_sql::{Migration, MigrationKind};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let migrations = vec![
        Migration {
            version: 1,
            description: "create settings and typing history tables",
            sql: "
                CREATE TABLE IF NOT EXISTS settings (
                    id INTEGER PRIMARY KEY CHECK (id = 1),
                    theme TEXT NOT NULL,
                    font_family TEXT NOT NULL,
                    font_size TEXT NOT NULL,
                    keyboard_sound_enabled INTEGER NOT NULL
                );

                CREATE TABLE IF NOT EXISTS typing_history (
                    id TEXT PRIMARY KEY,
                    lesson_id TEXT NOT NULL,
                    wpm REAL NOT NULL,
                    accuracy REAL NOT NULL,
                    duration INTEGER NOT NULL,
                    completed_at TEXT NOT NULL
                );
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:typehard.db", migrations)
                .build(),
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
