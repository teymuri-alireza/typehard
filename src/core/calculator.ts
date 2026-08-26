const CHARS_PER_WORD_FOR_WPM = 5;

export function calculateWpm(
    characters: number,
    seconds: number
): number {
    return characters / CHARS_PER_WORD_FOR_WPM / (seconds / 60);
}
