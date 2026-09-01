export type ThemeType = "light" | "dark" | "dark_yellow" | "dark_pink";

export function applyTheme(theme: ThemeType): void {
    document.documentElement.classList.remove("light", "dark", "dark_yellow", "dark_pink");

    document.documentElement.classList.add(theme);
}
