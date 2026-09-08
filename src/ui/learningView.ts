import learningHtml from "./learning.html?raw";
import "./learning.css";
import { LearningLessonRepository } from "../learning/learningLessonRepository.js";
import { TypingEngine } from "../core/engine.js";
import { type LearningLesson, type PracticeLesson, helperText, type TypedEntry } from "../types/models.js";
import { isLearningViewHidden } from "../index.js";

export async function initView(container: HTMLElement): Promise<void> {
    try {
        container.innerHTML = learningHtml;

        renderLearningView(container);
    } catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Lessons</h2><p>Could not load view.</p><p>${err}</p></div>`;
    }
}

function getElements(container: HTMLElement) {
    const lessonOutput = container.querySelector("#lesson");
    const titleOutput = container.querySelector("#title");
    const lessonLabel = container.querySelector("#lessonLabel");
    const descriptionOutput = container.querySelector("#description");
    const wpmOutput = container.querySelector("#wpm");
    const accuracyOutput = container.querySelector("#accuracy");
    const elapsedTimeOutput = container.querySelector("#elapsedTime");
    const helperTextOutput = container.querySelector("#helperText");
    const resetSessionBtn = container.querySelector("#resetSessionBtn") as HTMLButtonElement | null;
    const resetDropdown = container.querySelector("#resetSessionDropdown");

    if (!lessonOutput) {
        throw new Error("Lesson element not found");
    }

    return {
        lessonOutput,
        titleOutput,
        lessonLabel,
        descriptionOutput,
        wpmOutput,
        accuracyOutput,
        elapsedTimeOutput,
        helperTextOutput,
        resetSessionBtn,
        resetDropdown,
    };
}

function renderLearningView(container: HTMLElement): void {
    const elements = getElements(container);

    const learningLessonRepository = new LearningLessonRepository();
    let lesson = learningLessonRepository.loadLesson();

    const engine = new TypingEngine(lesson);

    let lessonChars: HTMLSpanElement[] = [];
    let resetDropdownTimer: number | undefined;

    if (elements.lessonLabel) {
        elements.lessonLabel.textContent = lesson.category;
    }

    function updateStats(): void {
        if (elements.wpmOutput) {
            elements.wpmOutput.textContent = engine.wpm.toFixed(2);
        }

        if (elements.accuracyOutput) {
            elements.accuracyOutput.textContent = engine.accuracy.toFixed(2);
        }
    }

    function buildLessonDom(currentLesson: LearningLesson | PracticeLesson): void {
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

        if (elements.descriptionOutput) {
            elements.descriptionOutput.textContent = "category" in currentLesson ? currentLesson.description : "undefined";
        }

        if (elements.helperTextOutput) {
            elements.helperTextOutput.textContent = helperText.start;
        }

        if (elements.lessonLabel) {
            elements.lessonLabel.textContent = "category" in currentLesson ? currentLesson.category : "undefined";
        }
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

    function updateHelperText(): void {
        if (!elements.helperTextOutput) {
            return;
        }

        const status = engine.getSession().status;

        if (status === "running") {
            elements.helperTextOutput.textContent = helperText.pause;
        } else if (status === "paused") {
            elements.helperTextOutput.textContent = helperText.resume;
        } else if (status === "idle") {
            elements.helperTextOutput.textContent = helperText.start;
        } else if (status === "finished") {
            elements.helperTextOutput.textContent = helperText.finished;
        }
    }

    function updateUI(): void {
        updateHelperText();
        renderLesson();
        updateStats();
    }

    function goToNextLesson(): void {
        const newLesson = learningLessonRepository.next();
        engine.changeLesson(newLesson);
        buildLessonDom(newLesson);
        updateUI();
    }

    function goToPreviousLesson(): void {
        const newLesson = learningLessonRepository.previous();
        engine.changeLesson(newLesson);
        buildLessonDom(newLesson);
        updateUI();
    }

    function resetSession(): void {
        // To prevent redundant DOM changes
        if (engine.elapsedTime !== 0) {
            try {
                const currentLesson = engine.lesson;
                engine.changeLesson(currentLesson);
                buildLessonDom(currentLesson);
                updateUI();
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error(err);
                showErrorDropdown(msg);
            }
        }
    }

    function showErrorDropdown(message: string): void {
        if (!elements.resetDropdown) return;

        elements.resetDropdown.textContent = message;
        elements.resetDropdown.removeAttribute('hidden');
        elements.resetDropdown.setAttribute('aria-hidden', 'false');
        elements.resetDropdown.classList.add('show');

        if (resetDropdownTimer) {
            window.clearTimeout(resetDropdownTimer);
        }

        resetDropdownTimer = window.setTimeout(() => {
            elements.resetDropdown?.classList.remove('show');
            elements.resetDropdown?.setAttribute('aria-hidden', 'true');
            elements.resetDropdown?.setAttribute('hidden', '');
            resetDropdownTimer = undefined;
        }, 3000);
    }

    buildLessonDom(lesson);

    if (elements.resetSessionBtn) {
        elements.resetSessionBtn.addEventListener("click", () => {
            resetSession();
        })
    }

    window.addEventListener("keydown", async (event) => {
        if (isLearningViewHidden()) {
            return;
        }

        if (event.key === "Escape") {

            if (engine.getSession().status === "running") {
                engine.pause();
                updateUI();
            }

            return;
        }

        if (event.key === "Backspace") {
            event.preventDefault();

            if (engine.getTypedText().length > 0) {
                engine.removeCharacter();
                updateUI();
            }

            return;
        }

        if (event.key === "ArrowRight") {
            try {
                goToNextLesson();
                return;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                showErrorDropdown(msg);
            }
        }

        if (event.key === "ArrowLeft") {
            try {
                goToPreviousLesson();
                return;
            } catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                showErrorDropdown(msg);
            }
        }

        if (event.key.length !== 1) {
            return;
        }

        event.preventDefault();

        const status = engine.getSession().status;

        if (status === "idle") {
            engine.start();
        } else if (status === "paused") {
            engine.resume();
        }

        engine.processKey(event.key);

        updateUI();

    });

    setInterval(() => {
        if (elements.elapsedTimeOutput) {
            elements.elapsedTimeOutput.textContent = (engine.elapsedTime / 1000).toFixed(1);
        }
    }, 100);
}
