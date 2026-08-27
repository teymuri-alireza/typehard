import type { FontPreference, FontSize } from "../settings/font.js";

export interface SettingsPreferences {
    theme: string;
    fontFamily: FontPreference;
    fontSize: FontSize;
    isKeyboardSoundEnabled: boolean;
}
