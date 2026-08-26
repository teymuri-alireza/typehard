type Difficulty =
    | "beginner"
    | "intermediate"
    | "advanced";

type SessionStatus =
    | "idle"
    | "running"
    | "paused"
    | "finished";

export type TypedEntry = {
  value: string;
  expected: string | undefined;
  isCorrect: boolean;
};

export interface TypingLesson {
    readonly id: string
    readonly title: string;
    readonly text: string;
    readonly difficulty: Difficulty;
    readonly author?: string;
    readonly source?: string;
}

export interface TypingSession {
    lesson: TypingLesson;
    status: SessionStatus;
    wpm: number;
    completedAt?: Date;
}