import { TypingEngine } from "./core/engine.js";
import type { TypingLesson, TypedEntry } from "./types/models.js";
import { LessonRepository } from "./lessons/repository.js";

function getAppElements() {
    const lessonOutput = document.getElementById("lesson");
    const titleOutput = document.getElementById("title");
    const difficultyLabel = document.getElementById("lessonDifficulty");
    const wpmOutput = document.getElementById("wpm");
    const accuracyOutput = document.getElementById("accuracy");
    const elapsedTimeOutput = document.getElementById("elapsedTime");
    const output = document.getElementById("keys");
    const nextLessonBtn = document.getElementById("nextLessonBtn") as HTMLButtonElement | null;
    const previousLessonBtn = document.getElementById("previousLessonBtn") as HTMLButtonElement | null;
    const themeToggleBtn = document.getElementById("themeToggleBtn") as HTMLButtonElement | null;

    if (!lessonOutput) {
        throw new Error("Lesson element not found");
    }

    return {
        lessonOutput,
        titleOutput,
        difficultyLabel,
        wpmOutput,
        accuracyOutput,
        elapsedTimeOutput,
        output,
        nextLessonBtn,
        previousLessonBtn,
        themeToggleBtn,
    };
}

function initApp(): void {
    const lessonRepository = new LessonRepository();
    const lesson = lessonRepository.loadLesson();

    const engine = new TypingEngine(lesson);
    const elements = getAppElements();

    let keysActive = false;
    let lessonChars: HTMLSpanElement[] = [];

    if (elements.difficultyLabel) {
        elements.difficultyLabel.textContent += lesson.difficulty;
    }

    function updateStats(): void {
        if (elements.wpmOutput) {
            elements.wpmOutput.textContent = engine.wpm.toFixed(2);
        }

        if (elements.accuracyOutput) {
            elements.accuracyOutput.textContent = engine.accuracy.toFixed(2);
        }
    }

    function buildLessonDom(currentLesson: TypingLesson): void {
        elements.lessonOutput.innerHTML = "";
        lessonChars = [];

        const words = currentLesson.text.split(" ");

        words.forEach((word, wordIndex) => {
            const wordElement = document.createElement("span");
            wordElement.classList.add("word");

            for (const character of word) {
                const charElement = document.createElement("span");
                charElement.textContent = character;

                wordElement.appendChild(charElement);
                lessonChars.push(charElement);
            }

            elements.lessonOutput.appendChild(wordElement);

            if (wordIndex < words.length - 1) {
                const spaceElement = document.createElement("span");
                spaceElement.classList.add("space");
                spaceElement.textContent = "\u00A0";

                elements.lessonOutput.appendChild(spaceElement);
                lessonChars.push(spaceElement);
            }
        });

        if (elements.titleOutput) {
            elements.titleOutput.textContent = currentLesson.title;
        }

        if (elements.difficultyLabel) {
            elements.difficultyLabel.textContent = currentLesson.difficulty;
        }

        if (elements.output) {
            elements.output.textContent = "";
            elements.output.classList.remove("active");
            keysActive = false;
        }
    }

    function goToNextLesson(): void {
        const newLesson = lessonRepository.next();
        engine.changeLesson(newLesson);
        buildLessonDom(newLesson);
    }

    function goToPreviousLesson(): void {
        const newLesson = lessonRepository.previous();
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
                span.classList.add(entry.isCorrect ? "correct" : "incorrect");
            }
        });
    }

    function updateUI(): void {
        if (!elements.output) {
            throw new Error("Lesson element not found");
        }

        elements.output.textContent = engine.getTypedText();
        renderLesson();
        updateStats();
    }

    function applyTheme(theme: string): void {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
            if (elements.themeToggleBtn) {
                elements.themeToggleBtn.textContent = "☀️";
            }
        } else {
            document.documentElement.classList.remove("dark");
            if (elements.themeToggleBtn) {
                elements.themeToggleBtn.textContent = "🌙";
            }
        }
    }

    buildLessonDom(lesson);

    if (elements.output) {
        const output = elements.output;

        output.tabIndex = output.tabIndex || 0;

        output.addEventListener("click", (event) => {
            keysActive = true;

            if (engine.getSession().status === "idle") {
                engine.start();
            } else if (engine.getSession().status === "paused") {
                engine.resume();
            }

            output.classList.add("active");
            output.focus();
            event.stopPropagation();
        });

        document.addEventListener("click", (event) => {
            if (!output.contains(event.target as Node)) {
                engine.pause();
                keysActive = false;
                output.classList.remove("active");
            }
        });

        window.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && keysActive) {
                engine.pause();
                keysActive = false;
                output.classList.remove("active");
                output.blur();
            }
        });
    }

    if (elements.nextLessonBtn) {
        const nextLessonBtn = elements.nextLessonBtn;

        nextLessonBtn.addEventListener("click", () => {
            nextLessonBtn.disabled = true;

            if (!elements.output) {
                return;
            }

            goToNextLesson();
            updateUI();
            nextLessonBtn.disabled = false;
        });
    }

    if (elements.previousLessonBtn) {
        const previousLessonBtn = elements.previousLessonBtn;

        previousLessonBtn.addEventListener("click", () => {
            previousLessonBtn.disabled = true;

            if (!elements.output) {
                return;
            }

            goToPreviousLesson();
            updateUI();
            previousLessonBtn.disabled = false;
        });
    }

    window.addEventListener("keydown", (event) => {
        if (!elements.output || !keysActive) {
            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();

            if (elements.output.textContent && elements.output.textContent.length > 0) {
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

    setInterval(() => {
        if (elements.elapsedTimeOutput) {
            elements.elapsedTimeOutput.textContent = (engine.elapsedTime / 1000).toFixed(1);
        }
    }, 100);

    if (elements.themeToggleBtn) {
        elements.themeToggleBtn.addEventListener("click", () => {
            const isDark = document.documentElement.classList.contains("dark");
            applyTheme(isDark ? "light" : "dark");
        });
    }
}

initApp();
