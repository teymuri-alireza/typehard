type Difficulty =
    | "beginner"
    | "intermediate"
    | "advanced";

type SessionStatus =
    | "idle"
    | "running"
    | "paused"
    | "finished";

export interface TypingLesson {
    readonly text: string;
    readonly difficulty: Difficulty;
}

export interface TypingSession {
    readonly lesson: TypingLesson;
    status: SessionStatus;
    wpm: number;
    completedAt?: Date;
}