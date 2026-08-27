export type FontPreference = "system" | "sans" | "serif" | "monospace";

export const fontFamilies: Record<FontPreference, string> = {
    system: `system-ui, -apple-system, "Segoe UI", sans-serif`,

    sans: `Arial, Helvetica, sans-serif`,

    serif: `Georgia, "Times New Roman", serif`,

    monospace: `"Courier New", monospace`,
};

export function applyFont(font: FontPreference): void {
    document.documentElement.style.setProperty("--ui", fontFamilies[font]);
}
