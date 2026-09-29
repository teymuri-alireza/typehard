import type { PracticeLesson } from "../types/models.js";
import { beginnerPracticeLessons } from "./beginnerLessons.js";
import { intermediatePracticeLessons } from "./intermediateLessons.js";
import { advancedPracticeLessons } from "./advancedLessons.js";


export const practiceLessons: PracticeLesson[] = [
    ...beginnerPracticeLessons, ...intermediatePracticeLessons, ...advancedPracticeLessons
];