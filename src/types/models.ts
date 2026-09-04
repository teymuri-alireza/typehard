export type Difficulty =
    | "beginner"
    | "intermediate"
    | "advanced";

type SessionStatus =
    | "idle"
    | "running"
    | "paused"
    | "finished";

type HelperTextType =
    | "start"
    | "resume"
    | "pause"
    | "finished";

export const helperText: Record<HelperTextType, string> = {
    start: "Press any key to start.",
    resume: "Press any key to continue",
    pause: "Press ESC to pause",
    finished: "Lesson completed",
}

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