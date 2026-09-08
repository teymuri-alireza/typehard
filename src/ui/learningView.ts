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
    const virtualKeyboardOutput = container.querySelector<HTMLDivElement>("#keyboard");

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
        virtualKeyboardOutput,
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

    function renderVirtualKeyboard() {
        const layout = [
            [
            { display: "`", code: "Backquote" },
            { display: "1", code: "Digit1" },
            { display: "2", code: "Digit2" },
            { display: "3", code: "Digit3" },
            { display: "4", code: "Digit4" },
            { display: "5", code: "Digit5" },
            { display: "6", code: "Digit6" },
            { display: "7", code: "Digit7" },
            { display: "8", code: "Digit8" },
            { display: "9", code: "Digit9" },
            { display: "0", code: "Digit0" },
            { display: "-", code: "Minus" },
            { display: "=", code: "Equal" },
            { display: "Backspace", code: "Backspace", className: "backspace" }
            ],
            [
            { display: "Tab", code: "Tab", className: "wide" },
            { display: "Q", code: "KeyQ" },
            { display: "W", code: "KeyW" },
            { display: "E", code: "KeyE" },
            { display: "R", code: "KeyR" },
            { display: "T", code: "KeyT" },
            { display: "Y", code: "KeyY" },
            { display: "U", code: "KeyU" },
            { display: "I", code: "KeyI" },
            { display: "O", code: "KeyO" },
            { display: "P", code: "KeyP" },
            { display: "[", code: "BracketLeft" },
            { display: "]", code: "BracketRight" },
            { display: "\\", code: "Backslash" }
            ],
            [
            { display: "Caps", code: "CapsLock", className: "wide" },
            { display: "A", code: "KeyA" },
            { display: "S", code: "KeyS" },
            { display: "D", code: "KeyD" },
            { display: "F", code: "KeyF" },
            { display: "G", code: "KeyG" },
            { display: "H", code: "KeyH" },
            { display: "J", code: "KeyJ" },
            { display: "K", code: "KeyK" },
            { display: "L", code: "KeyL" },
            { display: ";", code: "Semicolon" },
            { display: "'", code: "Quote" },
            { display: "Enter", code: "Enter", className: "extra-wide" }
            ],
            [
            { display: "Shift", code: "ShiftLeft", className: "extra-wide" },
            { display: "Z", code: "KeyZ" },
            { display: "X", code: "KeyX" },
            { display: "C", code: "KeyC" },
            { display: "V", code: "KeyV" },
            { display: "B", code: "KeyB" },
            { display: "N", code: "KeyN" },
            { display: "M", code: "KeyM" },
            { display: ",", code: "Comma" },
            { display: ".", code: "Period" },
            { display: "/", code: "Slash" },
            { display: "Shift", code: "ShiftRight", className: "extra-wide" }
            ],
            [
            { display: "Ctrl", code: "ControlLeft", className: "wide" },
            { display: "Alt", code: "AltLeft", className: "wide" },
            { display: "Space", code: "Space", className: "space" },
            { display: "Alt", code: "AltRight", className: "wide" },
            { display: "Ctrl", code: "ControlRight", className: "wide" }
            ]
        ];

        const keyElements: Record<string, HTMLDivElement> = {}; // code -> DOM element
        let capsOn = false;
        let text = "";

        // Build the keyboard DOM
        layout.forEach(rowKeys => {
            const rowEl = document.createElement("div");
            rowEl.className = "row";

            rowKeys.forEach(keyData => {
            const keyEl = document.createElement("div");
            keyEl.className = "key" + (keyData.className ? " " + keyData.className : "");
            keyEl.textContent = keyData.display;
            keyEl.dataset.code = keyData.code;

            // Support mouse/touch clicks directly on the on-screen keyboard
            keyEl.addEventListener("mousedown", () => {
                activateKey(keyData.code);
                handleInput(keyData);
            });
            keyEl.addEventListener("mouseup", () => deactivateKey(keyData.code));
            keyEl.addEventListener("mouseleave", () => deactivateKey(keyData.code));

            rowEl.appendChild(keyEl);
            keyElements[keyData.code] = keyEl;
            });

            if (elements.virtualKeyboardOutput) elements.virtualKeyboardOutput.appendChild(rowEl);
        });

        function activateKey(code: string): void {
            const el = keyElements[code];
            if (el) el.classList.add("active");
        }

        function deactivateKey(code: string): void {
            const el = keyElements[code];
            if (el) el.classList.remove("active");
        }

        function handleInput(keyData: { code: string; display: string | null }): void {
            if (keyData.code === "Backspace") {
            text = text.slice(0, -1);
            } else if (keyData.code === "Enter") {
            text += "\n";
            } else if (keyData.code === "Space") {
            text += " ";
            } else if (
            keyData.code === "CapsLock"
            ) {
            capsOn = !capsOn;
            } else if (
            keyData.code.startsWith("Shift") ||
            keyData.code.startsWith("Control") ||
            keyData.code.startsWith("Alt") ||
            keyData.code === "Tab"
            ) {
            // Non-printable modifier keys: no text change
            } else {
            let char = (keyData.display as string);
            text += capsOn ? char.toUpperCase() : char.toLowerCase();
            }
        }

        // Listen to real physical keyboard input
        document.addEventListener("keydown", e => {
            // Prevent default for Space/Tab/Backspace so the page doesn't scroll or lose focus
            if (["Space", "Tab", "Backspace"].includes(e.code)) {
            e.preventDefault();
            }

            activateKey(e.code);

            if (keyElements[e.code] && !e.repeat) {
            const keyData = { code: e.code, display: (keyElements[e.code] as HTMLElement).textContent };
            if (e.code === "CapsLock") {
                capsOn = !capsOn;
                return;
            }
            handleInput(keyData);
            }
        });

        document.addEventListener("keyup", e => {
            deactivateKey(e.code);
        });
    }

    buildLessonDom(lesson);

    renderVirtualKeyboard();

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
