import type { FontPreference, FontSize } from "../settings/font.js";
import type { ThemeType } from "../settings/theme.js";

export interface SettingsPreferences {
    theme: ThemeType;
    fontFamily: FontPreference;
    fontSize: FontSize;
    isKeyboardSoundEnabled: boolean;
}
