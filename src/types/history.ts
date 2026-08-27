export interface TypingHistoryEntry {
    id: string;
    lessonId: string;
    wpm: number;
    accuracy: number;
    duration: number;
    completedAt: Date;
}
