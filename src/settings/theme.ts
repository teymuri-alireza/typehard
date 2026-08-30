export type ThemeType = "light" | "dark";

export function applyTheme(theme: ThemeType): void {
    document.documentElement.classList.remove("light", "dark");

    document.documentElement.classList.add(theme);
}
