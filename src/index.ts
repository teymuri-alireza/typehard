import { TypingEngine } from "./typing/engine.js";
import type { TypingLesson, TypedEntry } from "./types/session.js";
import { LessonRepository } from "./lessons/lessonRepository.js";

const lessonRepository = new LessonRepository();
const lesson = lessonRepository.loadLesson();

const engine = new TypingEngine(lesson);

const lessonOutput = document.getElementById("lesson");
const titleOutput = document.getElementById("title");
const difficultyLabel = document.getElementById("lessonDifficulty");
const wpmOutput = document.getElementById("wpm");
const accuracyOutput = document.getElementById("accuracy");
const elapsedTimeOutput = document.getElementById("elapsedTime");
const output = document.getElementById("keys");
const nextLessonBtn = document.getElementById("nextLessonBtn") as HTMLButtonElement | null;
const themeToggleBtn = document.getElementById("themeToggleBtn") as HTMLButtonElement | null;
let keysActive = false;

if (!lessonOutput) {
    throw new Error("Lesson element not found");
}

if (difficultyLabel) {
    difficultyLabel.textContent += lesson.difficulty;
}

function updateStats() {
    if (wpmOutput) {
        wpmOutput.textContent = engine.wpm.toFixed(2);
    }

    if (accuracyOutput) {
        accuracyOutput.textContent = engine.accuracy.toFixed(2);
    }
};

let lessonChars: HTMLSpanElement[] = [];

function buildLessonDom(lesson: TypingLesson) {
    if (!lessonOutput) {
        throw new Error("Lesson element not found");
    }

    // clear existing DOM
    lessonOutput.innerHTML = "";
    lessonChars = [];

    const words = lesson.text.split(" ");

    words.forEach((word, wordIndex) => {
        const wordElement = document.createElement("span");
        wordElement.classList.add("word");

        for (const character of word) {
            const charElement = document.createElement("span");
            charElement.textContent = character;

            wordElement.appendChild(charElement);
            lessonChars.push(charElement);
        }

        lessonOutput.appendChild(wordElement);

        // Preserve the space as an actual character position.
        if (wordIndex < words.length - 1) {
            const spaceElement = document.createElement("span");
            spaceElement.classList.add("space");
            spaceElement.textContent = "\u00A0";

            lessonOutput.appendChild(spaceElement);
            lessonChars.push(spaceElement);
        }
    });

    if (titleOutput) {
        titleOutput.textContent = lesson.title;
    }

    if (difficultyLabel) {
        difficultyLabel.textContent = lesson.difficulty;
    }

    if (output) {
        output.textContent = "";
        output.classList.remove("active");
        keysActive = false;
    }
}

buildLessonDom(lesson);

function goToNextLesson(): void {
    const newLesson = lessonRepository.next();

    engine.changeLesson(newLesson);
    buildLessonDom(newLesson);
}

function renderLesson(): void {
    lessonChars.forEach((span, index) => {
        span.classList.remove("current", "correct", "incorrect");

        if (index === engine.currentPosition) {
            span.classList.add("current");
            return;
        }

        const entry: TypedEntry | undefined = engine.getTypedEntry(index);

        if (entry) {
            span.classList.add(
                entry.isCorrect ? "correct" : "incorrect"
            );
        }
    });
}

function updateUI(): void {
    if (!output) {
        throw new Error("Lesson element not found");
    }

    output.textContent = engine.getTypedText();

    renderLesson();

    updateStats();
}

if (output) {
    output.tabIndex = output.tabIndex || 0;

    output.addEventListener("click", (e) => {
        keysActive = true;

        if (engine.getSession().status === "idle") {
            engine.start();
        } else if (engine.getSession().status === "paused") {
            engine.resume();
        }

        output.classList.add("active");
        output.focus();
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        if (!output.contains(e.target as Node)) {
            engine.pause();
            keysActive = false;
            output.classList.remove("active");
        }
    });

    window.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && keysActive) {
            engine.pause();
            keysActive = false;
            output.classList.remove("active");
            output.blur();
        }
    });
}

if (nextLessonBtn) {
    nextLessonBtn.addEventListener("click", () => {
        nextLessonBtn.disabled = true;

        if (!output) {
            return;
        }
        goToNextLesson();
        updateUI();

        nextLessonBtn.disabled = false;
    })
}

window.addEventListener("keydown", (event) => {
    if (!output || !keysActive) {
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();

        if (output.textContent && output.textContent.length > 0) {
            engine.removeCharacter();
            updateUI();
        }
        return;
    }

    if (event.key.length !== 1) {
        return;
    }

    event.preventDefault();
    engine.processKey(event.key);
    updateUI();
});

setInterval( () => {
    if (elapsedTimeOutput) {
        elapsedTimeOutput.textContent = (engine.elapsedTime / 1000).toString();
    }
}, 500)

function applyTheme(theme: string) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark");
        if (themeToggleBtn) themeToggleBtn.textContent = "☀️";
    } else {
        document.documentElement.classList.remove("dark");
        if (themeToggleBtn) themeToggleBtn.textContent = "🌙";
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        const isDark = document.documentElement.classList.contains("dark");
        applyTheme(isDark ? "light" : "dark");
    });
}
