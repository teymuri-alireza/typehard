export type FontPreference = "system" | "sans" | "serif" | "monospace";
export type FontSize = "small" | "medium" | "large";

export const fontFamilies: Record<FontPreference, string> = {
    system: `system-ui, -apple-system, "Segoe UI", sans-serif`,

    sans: `Arial, Helvetica, sans-serif`,

    serif: `Georgia, "Times New Roman", serif`,

    monospace: `"Courier New", monospace`,
};

export const fontSizes: Record<FontSize, string> = {
    small: "16px",
    medium: "18px",
    large: "22px",
}

export function applyFont(font: FontPreference): void {
    document.documentElement.style.setProperty("--ui", fontFamilies[font]);
}

export function applyFontSize(size: FontSize): void {
    document.documentElement.style.setProperty("--lesson-font-size", fontSizes[size]);
}
