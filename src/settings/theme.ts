export type ThemeType = 
    | "light" | "light_blue"
    | "dark" | "dark_yellow"
    | "dark_pink" | "green_nature"
    | "warm_purple" | "brown_vintage"
    | "summer_sea" | "green_vintage";

export function applyTheme(theme: ThemeType): void {
    document.documentElement.classList.remove(
        "light", "light_blue", "dark", "dark_yellow", "dark_pink", "green_nature", "warm_purple", "brown_vintage", "summer_sea",
        "green_vintage"
    );

    document.documentElement.classList.add(theme);
}
