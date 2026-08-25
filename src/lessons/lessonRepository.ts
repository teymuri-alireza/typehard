import type { TypingLesson } from "../types/session.js";
import { lessons } from "./allLessons.js";


export class LessonRepository {
    private currentLesson: number = 0;

    loadLesson(): TypingLesson {
        const lesson = lessons[this.currentLesson];

        if (!lesson) {
            throw new Error("Current lesson does not exist.");
        }

        return lesson;
    }

    next(): TypingLesson {
        if (this.currentLesson < lessons.length - 1) {
            this.currentLesson++;
        } else {
            this.currentLesson = 0;
        }

        return this.loadLesson();
    }
}
