import { TypingEngine } from "./core/engine.js";
import type { TypingLesson, TypedEntry } from "./types/models.js";
import { helperText } from "./types/models.js";
import { LessonRepository } from "./lessons/repository.js";
import { playKeyboardSound } from "./settings/audio.js";
import { SettingsRepository } from "./db/settingsRepository.js";
import { TypingHistoryRepository } from "./db/typingHistoryRepository.js";
import type { SettingsPreferences } from "./types/preferences.js";
import type { TypingHistoryEntry } from "./types/history.js";
import { applyFont, applyFontSize } from "./settings/font.js";
import { applyTheme } from "./settings/theme.js";
// import * as typingView from "./ui/typingView.js";
import * as lessonView from "./ui/lessonView.js";
import * as statsView from "./ui/statsView.js";
import * as settingsView from "./ui/settingsView.js";

function getAppElements() {
    const lessonOutput = document.getElementById("lesson");
    const titleOutput = document.getElementById("title");
    const difficultyLabel = document.getElementById("lessonDifficulty");
    const wpmOutput = document.getElementById("wpm");
    const accuracyOutput = document.getElementById("accuracy");
    const elapsedTimeOutput = document.getElementById("elapsedTime");
    const helperTextOutput = document.getElementById("helperText");
    const resetSessionBtn = document.getElementById("resetSessionBtn") as HTMLButtonElement | null;
    const resetDropdown = document.getElementById("resetSessionDropdown");
    const themeToggleBtn = document.getElementById("themeToggleBtn") as HTMLButtonElement | null;
    const navButtons = Array.from(document.querySelectorAll('.main-nav button')) as HTMLButtonElement[];
    const sections: Record<string, HTMLElement | null> = {
        typing: document.getElementById('typingView'),
        lessons: document.getElementById('lessonsView'),
        statistics: document.getElementById('statisticsView'),
        settings: document.getElementById('settingsView'),
    };


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
        helperTextOutput,
        resetSessionBtn,
        themeToggleBtn,
        resetDropdown,
        navButtons,
        sections
    };
}

function initApp(): void {
    const lessonRepository = new LessonRepository();
    const lesson = lessonRepository.loadLesson();

    const settingsRepository = new SettingsRepository();
    const typingHistoryRepository = new TypingHistoryRepository();

    const engine = new TypingEngine(lesson);
    const elements = getAppElements();
    const viewState = { initialized: { typing: true, lessons: false, statistics: false, settings: false } };

    let lessonChars: HTMLSpanElement[] = [];
    let resetDropdownTimer: number | undefined;

    let settings: SettingsPreferences = {
        theme: "light",
        fontFamily: "system",
        fontSize: "medium",
        isKeyboardSoundEnabled: false,
    };

    if (elements.difficultyLabel) {
        elements.difficultyLabel.textContent = lesson.difficulty;
    }

    async function loadSettings(): Promise<void> {

        const savedSettings =
            await settingsRepository.getSettings();

        if (!savedSettings) {

            await settingsRepository.saveSettings(settings);

            return;

        }

        settings = savedSettings;

        applyFont(settings.fontFamily);

        applyFontSize(settings.fontSize);

        applyTheme(settings.theme)

    }

    async function saveSettings(): Promise<void> {
        await settingsRepository.saveSettings(settings);
    }

    async function saveTypingHistory(): Promise<void> {

        const entry: TypingHistoryEntry = {
            id: crypto.randomUUID(),
            lessonId: engine.lesson.id,
            wpm: engine.wpm,
            accuracy: engine.accuracy,
            duration: engine.elapsedTime,
            completedAt: new Date(),
        };

        await typingHistoryRepository.addEntry(entry);
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

        if (elements.helperTextOutput) {
            elements.helperTextOutput.textContent = helperText.start;
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
        const newLesson = lessonRepository.next();
        engine.changeLesson(newLesson);
        buildLessonDom(newLesson);
        updateUI();
    }

    function goToPreviousLesson(): void {
        const newLesson = lessonRepository.previous();
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

    loadSettings();

    buildLessonDom(lesson);

    /* --- View switching / top nav --- */

    function hideAllViews() {
        Object.values(elements.sections).forEach(s => { if (s) s.hidden = true; });
        elements.navButtons.forEach(b => b.classList.remove('active'));
    }

    async function showView(name: string) {
        hideAllViews();
        const section = elements.sections[name];
        if (!section) return;
        section.hidden = false;

        const btn = elements.navButtons.find(b => b.dataset.view === name);
        if (btn) btn.classList.add('active');

        if (name === 'statistics') {
            const history = await typingHistoryRepository.getAll();
            statsView.initView(section, history, async () => {
                await typingHistoryRepository.deleteAll();

                statsView.refresh(section, await typingHistoryRepository.getAll());
            });
            viewState.initialized.statistics = true;
        }

        if (!viewState.initialized[name as keyof typeof viewState.initialized]) {
            if (name === 'lessons') {
                await lessonView.initView(section, (selectedLesson) => {
                    const currentLesson = lessonRepository.selectLessonById(selectedLesson.id);
                    engine.changeLesson(currentLesson);
                    buildLessonDom(currentLesson);
                    updateUI();
                    void showView('typing');
                });
            }
            if (name === 'settings') await settingsView.initView(section, settings, {

                onFontChange: (font) => {
                    settings.fontFamily = font;
                    void saveSettings();
                },

                onFontSizeChange: (size) => {
                    settings.fontSize = size;
                    void saveSettings();
                },

                onKeyboardSoundChange: (enabled) => {
                    settings.isKeyboardSoundEnabled = enabled;
                    void saveSettings();
                },

                onThemeChange: (theme) => {
                    settings.theme = theme;
                    void saveSettings();
                }

            });
            viewState.initialized[name as keyof typeof viewState.initialized] = true;
        }
    }

    // Attach nav listeners
    elements.navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            if (view) void showView(view);
        });
    });

    // Show typing view by default (typing UI is already present in the DOM)
    hideAllViews();
    const typingSection = elements.sections.typing;
    if (typingSection) typingSection.hidden = false;
    const firstBtn = elements.navButtons.find(b => b.dataset.view === 'typing');
    if (firstBtn) firstBtn.classList.add('active');

    if (elements.resetSessionBtn) {
        elements.resetSessionBtn.addEventListener("click", () => {
            resetSession();
        })
    }

    window.addEventListener("keydown", async (event) => {
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

            if (settings.isKeyboardSoundEnabled) {
                playKeyboardSound();
            }

            return;
        }

        if (event.key === "ArrowRight") {
            if (engine.getSession().status !== "running") {
                goToNextLesson();
                return;
            }
        }

        if (event.key === "ArrowLeft") {
            if (engine.getSession().status !== "running") {
                goToPreviousLesson();
                return;
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

        const wasRunning = engine.getSession().status === "running";
        engine.processKey(event.key);
        const isFinished = engine.getSession().status === "finished";

        updateUI();

        if (wasRunning && isFinished) {
            await saveTypingHistory();
        }

        if (settings.isKeyboardSoundEnabled) {
            playKeyboardSound();
        }

    });

    setInterval(() => {
        if (elements.elapsedTimeOutput) {
            elements.elapsedTimeOutput.textContent = (engine.elapsedTime / 1000).toFixed(1);
        }
    }, 100);

}

initApp();
