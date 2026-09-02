import { LessonRepository } from "../lessons/repository.js";
import type { TypingHistoryEntry } from "../types/history.js";
import type { TypingLesson } from "../types/models.js";

export function getSessionCount(history: TypingHistoryEntry[]): number {
    return history.length;
}

export function getAverageWpm(history: TypingHistoryEntry[]): number {
    if (history.length === 0) {
        return 0;
    }

    const total = history.reduce((sum, entry) => sum + entry.wpm, 0);

    return total / history.length;
}

export function getAverageAccuracy(history: TypingHistoryEntry[]): number {
    if (history.length === 0) {
        return 0;
    }

    const total = history.reduce((sum, entry) => sum + entry.accuracy, 0);

    return total / history.length;
}

export function getBestWpm(history: TypingHistoryEntry[]): number {
    if (history.length === 0) {
        return 0;
    }

    return Math.max(
        ...history.map((entry) => entry.wpm)
    );
}

export function getBestAccuracy(history: TypingHistoryEntry[]): number {
    if (history.length === 0) {
        return 0;
    }

    return Math.max(
        ...history.map((entry) => entry.accuracy)
    );
}

export function getTotalTypingTime(history: TypingHistoryEntry[]): number {
    return history.reduce((total, entry) => total + entry.duration, 0);
}

export function formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${minutes}m ${seconds}s`;
}

export function getLessonsHistory(history: TypingHistoryEntry[], lessonRepository: LessonRepository): Array<{ lesson: TypingLesson, entry: TypingHistoryEntry }> {
    const result: Array<{ lesson: TypingLesson, entry: TypingHistoryEntry }> = [];

    for (const entry of history) {
        const lesson = lessonRepository.findLessonById(entry.lessonId);

        if (lesson) {
            result.push({ lesson, entry });
        }
    }

    return result;
}