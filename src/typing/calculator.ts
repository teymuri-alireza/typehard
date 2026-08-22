const INTERNAL_CONSTANT = 5;

export function calculateWpm(
    characters: number,
    seconds: number
): number {
    return characters / INTERNAL_CONSTANT / (seconds / 60);
}
