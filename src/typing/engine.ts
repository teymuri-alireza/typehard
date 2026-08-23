import type { TypingLesson, TypingSession, TypedEntry } from "../types/session.js";
import { calculateWpm } from "./calculator.js";

export class TypingEngine {
    private readonly lesson: TypingLesson;
    private session: TypingSession;
    private currentIndex = 0;
    private correctCharacters = 0;
    private mistakes = 0;
    private startedAt: number | undefined;
    private accumulatedTime: number = 0;
    private typed: TypedEntry[] = [];

    constructor(lesson: TypingLesson) {
        this.lesson = lesson;

        this.session = {
            lesson,
            status: "idle",
            wpm: 0,
        };
    }

    start(): void {
        if (this.session.status !== "idle") {
            throw new Error("Session can only be started from idle.");
        }

        this.startedAt = Date.now();
        this.session.status = "running";
    }

    pause(): void {
        if (this.session.status !== "running") {
            throw new Error("Session can only be paused while running");
        }

        if (this.startedAt === undefined) {
            throw new Error("Session is running but startedAt is undefined.");
        }

        this.accumulatedTime += Date.now() - this.startedAt;
        this.startedAt = undefined;
        this.session.status = "paused";
    }

    resume(): void {
        if (this.session.status !== "paused") {
            throw new Error("Session can only be resumed while paused.");
        }

        this.startedAt = Date.now();
        this.session.status = "running";
    }

    finish(): void {
        if (this.session.status !== "running") {
            throw new Error("Session can only be finished while running.");
        }

        if (this.startedAt === undefined) {
            throw new Error("Session is running but startedAt is undefined.");
        }

        this.accumulatedTime += Date.now() - this.startedAt;
        this.startedAt = undefined;
        this.session.status = "finished";
    }

    get elapsedTime(): number {
        if (this.startedAt === undefined) {
            return this.accumulatedTime;
        }

        return this.accumulatedTime + (Date.now() - this.startedAt);
    }

    getSession(): Readonly<TypingSession> {
        return this.session;
    }

    processKey(character: string): void {
        if (this.session.status !== "running") {
            return;
        }

        const expected = this.session.lesson.text[this.currentIndex];
        const isCorrect = expected === character;

        this.typed.push({
            value: character,
            expected,
            isCorrect,
        });

        if (isCorrect) {
            this.correctCharacters++;
        } else {
            this.mistakes++;
        }

        this.currentIndex++;

        if (this.currentIndex >= this.session.lesson.text.length) {
            this.finish();
        }
    }

    removeCharacter(): void {
        if (this.session.status !== "running" || this.currentIndex === 0) {
            return;
        }

        const last = this.typed.pop();
        if (!last) {
            return;
        }

        this.currentIndex--;

        if (last.isCorrect) {
            this.correctCharacters--;
        } else {
            this.mistakes--;
        }
    }

    get accuracy(): number {
        const total = this.correctCharacters + this.mistakes;

        if (total === 0) {
            return 100;
        }

        return (this.correctCharacters / total) * 100;
    }

    get progress(): number {
        if (this.session.lesson.text.length === 0) {
            return 100;
        }

        return (this.currentIndex / this.session.lesson.text.length) * 100;
    }

    get wpm(): number {
        const seconds = this.elapsedTime / 1000;

        if (seconds === 0) {
            return 0;
        }

        return calculateWpm(this.correctCharacters, seconds);
    }

    get currentPosition(): number {
        return this.currentIndex;
    }

    getTypedText(): string {
        return this.typed.map(entry => entry.value).join("")
    }
}