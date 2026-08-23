import { TypingEngine } from "./typing/engine.js";
import type { TypingLesson } from "./types/session.js";

const lesson: TypingLesson = {
    text: "The quick brown fox jumps over the lazy dog.",
    difficulty: "beginner"
};

const engine = new TypingEngine(lesson);
engine.start();

const lessonOutput = document.getElementById("lesson");
const wpmOutput = document.getElementById("wpm");
const accuracyOutput = document.getElementById("accuracy");
const output = document.getElementById("keys");
let keysActive = false;

if (!lessonOutput) {
    throw new Error("Lesson element not found");
}

function updateStats() {
    if (wpmOutput) {
        wpmOutput.textContent = engine.wpm.toFixed(2).toString();
    }

    if (accuracyOutput) {
        accuracyOutput.textContent = engine.accuracy.toFixed(2).toString();
    }
};

const lessonChars = Array.from(lesson.text).map((character) => {
    const span = document.createElement("span");
    span.textContent = character;
    lessonOutput.appendChild(span);
    return span;
});

function highlightActiveCharacter() {
    lessonChars.forEach((span, index) => {
        span.classList.toggle("current", index === engine.currentPosition);
    });
}

if (output) {
    (output as HTMLElement).tabIndex = (output as HTMLElement).tabIndex || 0;

    output.addEventListener("click", (e) => {
        keysActive = true;
        output.classList.add("active");
        (output as HTMLElement).focus();
        e.stopPropagation();
    });

    document.addEventListener("click", (e) => {
        if (!output.contains(e.target as Node)) {
            keysActive = false;
            output.classList.remove("active");
        }
    });

    window.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape" && keysActive) {
            keysActive = false;
            output.classList.remove("active");
            (output as HTMLElement).blur();
        }
    });
}

window.addEventListener("keydown", (event) => {
    if (!output || !keysActive) {
        return;
    }

    if (event.key === "Backspace") {
        event.preventDefault();

        if (output.textContent && output.textContent.length > 0) {
            engine.removeCharacter();
            output.textContent = engine.getTypedText();
            highlightActiveCharacter();
            updateStats();
        }
        return;
    }

    if (event.key.length !== 1) {
        return;
    }

    event.preventDefault();
    engine.processKey(event.key);
    output.textContent = engine.getTypedText();
    highlightActiveCharacter();
    updateStats();
});
