import type { PracticeLesson } from "../types/models.js";
import { practiceLessons } from "./practiceLessons.js";


export class PracticeLessonRepository {
    private currentLesson: number = 0;

    loadLesson(): PracticeLesson {
        const lesson = practiceLessons[this.currentLesson];

        if (!lesson) {
            throw new Error("Current lesson does not exist.");
        }

        return lesson;
    }

    selectLessonById(id: string): PracticeLesson {
        const index = practiceLessons.findIndex((lesson) => lesson.id === id);

        if (index === -1) {
            throw new Error(`Lesson not found: ${id}`);
        }

        this.currentLesson = index;
        return this.loadLesson();
    }

    next(): PracticeLesson {
        if (this.currentLesson < practiceLessons.length - 1) {
            this.currentLesson++;
        } else {
            this.currentLesson = 0;
        }

        return this.loadLesson();
    }

    previous(): PracticeLesson {
        if (this.currentLesson > 0) {
            this.currentLesson--;
        } else {
            this.currentLesson = practiceLessons.length - 1;
        }

        return this.loadLesson();
    }

    findLessonById(id: string): PracticeLesson {
        const lesson = practiceLessons.find((PracticeLesson) => PracticeLesson.id === id);

        if (!lesson) {
            throw new Error(`Lesson not found: ${id}`);
        }

        return lesson;
    }
}
