export type ThemeType = "light" | "light_blue" | "dark" | "dark_yellow" | "dark_pink" | "green_nature" | "warm_purple";

export function applyTheme(theme: ThemeType): void {
    document.documentElement.classList.remove("light", "light_blue", "dark", "dark_yellow", "dark_pink", "green_nature", "warm_purple");

    document.documentElement.classList.add(theme);
}
