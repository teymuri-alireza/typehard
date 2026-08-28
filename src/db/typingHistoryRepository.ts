import type { TypingHistoryEntry } from "../types/history.js";
import { getDatabase } from "./database.js";

interface TypingHistoryRow {
    id: string;
    lesson_id: string;
    wpm: number;
    accuracy: number;
    duration: number;
    completed_at: number;
}

export class TypingHistoryRepository {

    async addEntry(entry: TypingHistoryEntry): Promise<void> {
        const db = await getDatabase();

        await db.execute(
            `
            INSERT INTO typing_history (
                id,
                lesson_id,
                wpm,
                accuracy,
                duration,
                completed_at
            )
            VALUES (?, ?, ?, ?, ?, ?)
            `,
            [
                entry.id,
                entry.lessonId,
                entry.wpm,
                entry.accuracy,
                entry.duration,
                entry.completedAt.toISOString(),
            ]
        );
    }

    async getAll(): Promise<TypingHistoryEntry[]> {
        const db = await getDatabase();

        const rows = await db.select<TypingHistoryRow[]>(
            `
            SELECT
                id,
                lesson_id,
                wpm,
                accuracy,
                duration,
                completed_at
            FROM typing_history
            ORDER BY completed_at DESC
            `
        );

        return rows.map((row) => ({
            id: row.id,
            lessonId: row.lesson_id,
            wpm: row.wpm,
            accuracy: row.accuracy,
            duration: row.duration,
            completedAt: new Date(row.completed_at),
        }));
    }
}
