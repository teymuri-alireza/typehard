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

        Migration {
            version: 2,
            description: "migrate lesson IDs to UUIDs",
            sql: "
                UPDATE typing_history
                SET lesson_id = CASE lesson_id
                    WHEN 'beginner-001' THEN 'a494930b-0e65-4c5f-9473-1ca38dc1a8d3'
                    WHEN 'beginner-002' THEN '2af313f5-7534-4b0b-af7d-8531e38f3967'
                    WHEN 'beginner-003' THEN 'abf28853-d039-46c8-968b-60ec7fbe2431'
                    WHEN 'beginner-004' THEN 'b8e6f8b5-b6bf-477d-a72c-31dcc7605f56'
                    WHEN 'beginner-005' THEN '63c6ac31-0f04-4f39-a1a3-c65e9e632945'

                    WHEN 'intermediate-001' THEN '1f7f24ee-9da1-47dd-98e3-3cb0bd5341d1'
                    WHEN 'intermediate-002' THEN 'e4c1d497-5045-4925-a71a-a3911e16f8ee'
                    WHEN 'intermediate-003' THEN '79b8671d-fa37-493c-8659-4aaa285994f9'
                    WHEN 'intermediate-004' THEN '1f3013f5-59f1-4c7b-a8bd-7bb935c25ac4'
                    WHEN 'intermediate-005' THEN '7cc5bb28-b87d-4e14-8597-c00ab2e181fa'
                    WHEN 'intermediate-006' THEN '912fb74d-f810-4592-952a-812faa2314fc'
                    WHEN 'intermediate-007' THEN '71fb13c6-ecfe-4ae7-a191-dd3338880971'
                    WHEN 'intermediate-008' THEN '46d83895-e998-4ab7-b446-b6fbd7a01bc8'

                    WHEN 'advanced-001' THEN '0d66a6a3-7f91-44c3-a6c6-ecc67420704b'
                    WHEN 'advanced-002' THEN 'c08c38b2-66fa-4033-8bbe-041e7cab8368'
                    WHEN 'advanced-003' THEN '03d82288-b750-4623-b3b0-8f57a0de598a'
                    WHEN 'advanced-004' THEN 'fc8acde3-b7a3-42e1-838e-aaa538bf25a9'
                    WHEN 'advanced-005' THEN '265d7bb5-4f0e-40a7-aaa1-2ad416b32436'
                    WHEN 'advanced-006' THEN 'dae92043-c72c-482a-9038-77f33eed8ffc'

                    ELSE lesson_id
                END
                WHERE lesson_id IN (
                    'beginner-001',
                    'beginner-002',
                    'beginner-003',
                    'beginner-004',
                    'beginner-005',
                    'intermediate-001',
                    'intermediate-002',
                    'intermediate-003',
                    'intermediate-004',
                    'intermediate-005',
                    'intermediate-006',
                    'intermediate-007',
                    'intermediate-008',
                    'advanced-001',
                    'advanced-002',
                    'advanced-003',
                    'advanced-004',
                    'advanced-005',
                    'advanced-006'
                );
            ",
            kind: MigrationKind::Up,
        },
    ];

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations("sqlite:typehard.db", migrations)
                .build(),
        )
        .plugin(
            tauri_plugin_updater::Builder::new().build()
        )
        .invoke_handler(tauri::generate_handler![greet])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
