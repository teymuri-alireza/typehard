import type { SettingsPreferences } from "../types/preferences.js";
import { getDatabase } from "./database.js";
import type { FontPreference, FontSize } from "../settings/font.js";
import type { ThemeType } from "../settings/theme.js";

interface SettingsRow {
    theme: string;
    font_family: string;
    font_size: string;
    keyboard_sound_enabled: number;
}

export class SettingsRepository {

    async getSettings(): Promise<SettingsPreferences | null> {
        const db = await getDatabase();

        const rows = await db.select<SettingsRow[]>(
            `
            SELECT
                theme,
                font_family,
                font_size,
                keyboard_sound_enabled
            FROM settings
            WHERE id = 1
            `
        );

        const row = rows[0];

        if (!row) {
            return null;
        }

        return {
            theme: row.theme as ThemeType,
            fontFamily: row.font_family as FontPreference,
            fontSize: row.font_size as FontSize,
            isKeyboardSoundEnabled:
                row.keyboard_sound_enabled === 1,
        };

    }

    async saveSettings(settings: SettingsPreferences): Promise<void> {
        const db = await getDatabase();

        await db.execute(
            `
            INSERT INTO settings (
                id,
                theme,
                font_family,
                font_size,
                keyboard_sound_enabled
            )
            VALUES (1, ?, ?, ?, ?)

            ON CONFLICT(id) DO UPDATE SET
                theme = excluded.theme,
                font_family = excluded.font_family,
                font_size = excluded.font_size,
                keyboard_sound_enabled =
                    excluded.keyboard_sound_enabled
            `,
            [
                settings.theme,
                settings.fontFamily,
                settings.fontSize,
                settings.isKeyboardSoundEnabled ? 1 : 0,
            ]
        );
    }
}