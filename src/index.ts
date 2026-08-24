import { TypingEngine } from "./typing/engine.js";
import type { TypingLesson, TypedEntry } from "./types/session.js";

const lesson: TypingLesson = {
    text: "The quick brown fox jumps over the lazy dog.",
    difficulty: "beginner"
};

const engine = new TypingEngine(lesson);
engine.start();
engine.pause();

const lessonOutput = document.getElementById("lesson");
const difficultyLabel = document.getElementById("lessonDifficulty");
const wpmOutput = document.getElementById("wpm");
const accuracyOutput = document.getElementById("accuracy");
const elapsedTimeOutput = document.getElementById("elapsedTime");
const output = document.getElementById("keys");
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

function removeCharacterCorrectness(index: number): void {
    const spanElement: HTMLSpanElement | undefined = lessonChars[index];

    if (!spanElement) {
        return;
    }

    spanElement.classList.remove("correct", "incorrect");
}

function highlightCharacterCorrectness(index: number): void {
    const span: HTMLSpanElement | undefined = lessonChars[index];

    if (!span) {
        return ;
    }

    const entry: TypedEntry | undefined = engine.getTypedEntry(index);

    if (entry) {
        span.classList.add(entry.isCorrect ? "correct" : "incorrect");
    }
}

if (output) {
    output.tabIndex = output.tabIndex || 0;

    output.addEventListener("click", (e) => {
        keysActive = true;
        engine.resume();
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

window.addEventListener("keydown", (event) => {
    if (!output || !keysActive) {
        return;
    }

    const position = engine.currentPosition;

    if (event.key === "Backspace") {
        event.preventDefault();

        if (output.textContent && output.textContent.length > 0) {
            engine.removeCharacter();
            output.textContent = engine.getTypedText();
            removeCharacterCorrectness(position-1);
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
    highlightCharacterCorrectness(position);
    output.textContent = engine.getTypedText();
    highlightActiveCharacter();
    updateStats();
});

setInterval( () => {
    if (elapsedTimeOutput) {
        elapsedTimeOutput.textContent = (engine.elapsedTime / 1000).toString();
    }
}, 500)
