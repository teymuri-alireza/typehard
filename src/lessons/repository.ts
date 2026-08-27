import type { TypingLesson } from "../types/models.js";
import { lessons } from "./lessons.js";


export class LessonRepository {
    private currentLesson: number = 0;

    loadLesson(): TypingLesson {
        const lesson = lessons[this.currentLesson];

        if (!lesson) {
            throw new Error("Current lesson does not exist.");
        }

        return lesson;
    }

    selectLessonById(id: string): TypingLesson {
        const index = lessons.findIndex((lesson) => lesson.id === id);

        if (index === -1) {
            throw new Error(`Lesson not found: ${id}`);
        }

        this.currentLesson = index;
        return this.loadLesson();
    }

    next(): TypingLesson {
        if (this.currentLesson < lessons.length - 1) {
            this.currentLesson++;
        } else {
            this.currentLesson = 0;
        }

        return this.loadLesson();
    }

    previous(): TypingLesson {
        if (this.currentLesson > 0) {
            this.currentLesson--;
        } else {
            this.currentLesson = lessons.length - 1;
        }

        return this.loadLesson();
    }
}
