import type { LearningLesson } from "../types/models.js";
import { learningLessons } from "./learningLessons.js";

export class LearningLessonRepository {
    private currentLesson: number = 0;

    loadLesson(): LearningLesson {
        const lesson = learningLessons[this.currentLesson];

        if (!lesson) throw new Error("Current learning lesson does not exist");

        return lesson;
    }

    selectLessonById(id: string): LearningLesson {
        const index = learningLessons.findIndex((lesson) => lesson.id === id);

        if (index === -1) {
            throw new Error(`Lesson not found: ${id}`);
        }

        this.currentLesson = index;
        return this.loadLesson();
    }

    next(): LearningLesson {
        if (this.currentLesson < learningLessons.length - 1) {
            this.currentLesson++;
        } else {
            this.currentLesson = 0;
        }

        return this.loadLesson();
    }

    previous(): LearningLesson {
        if (this.currentLesson > 0) {
            this.currentLesson--;
        } else {
            this.currentLesson = learningLessons.length - 1;
        }

        return this.loadLesson();
    }
}