import { practiceLessons } from "../lessons/practiceLessons.js";
import { learningLessons } from "../learning/learningLessons.js";
import type { PracticeLesson, Difficulty, LearningLesson } from "../types/models.js";
import lessonsHtml from "./lessons.html?raw";
import "./lessons.css";

type DifficultyFilter = Difficulty | "all";

let searchQuery = "";
let selectedDifficulty: DifficultyFilter = "all";

export async function initView(container: HTMLElement, onSelect?: (lesson: PracticeLesson | LearningLesson) => void): Promise<void> {
	try {
		container.innerHTML = lessonsHtml;

		renderLessonsList(container, onSelect);

		const elements = getElements(container);

        elements.lessonSearch.addEventListener("input", () => {
            searchQuery = elements.lessonSearch.value.trim();
            renderPracticeLessonsList(container, onSelect);
        });

        elements.difficultyFilter.addEventListener("change", () => {
            selectedDifficulty = elements.difficultyFilter.value as DifficultyFilter;
            renderPracticeLessonsList(container, onSelect);
        });

		elements.learningLessonBtn.addEventListener("click", () => {
			switchStatsView(
				elements.practiceLessonsView,
				elements.practiceLessonBtn,
				elements.learningLessonsView,
				elements.learningLessonBtn
			);
		});

		elements.practiceLessonBtn.addEventListener("click", () => {
			switchStatsView(
				elements.learningLessonsView,
				elements.learningLessonBtn,
				elements.practiceLessonsView,
				elements.practiceLessonBtn
			);
		});

	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Lessons</h2><p>Could not load view.</p><p>${err}</p></div>`;
	}
}

function getElements(container: HTMLElement) {
	const practiceLessonsList = container.querySelector<HTMLDivElement>("#practiceLessonsList");
	const learningLessonsList = container.querySelector<HTMLDivElement>("#learningLessonsList");
	const lessonSearch = container.querySelector<HTMLInputElement>("#lessonSearch");
	const difficultyFilter = container.querySelector<HTMLSelectElement>("#difficultyFilter");
	const practiceLessonBtn = container.querySelector<HTMLButtonElement>("#practiceLessonBtn");
	const practiceLessonsView = container.querySelector<HTMLElement>("#practiceLessonsView");
	const learningLessonBtn = container.querySelector<HTMLButtonElement>("#learningLessonBtn");
	const learningLessonsView = container.querySelector<HTMLElement>("#learningLessonsView");

	if (!practiceLessonsList) throw new Error("Practice lessons element not found");
	if (!learningLessonsList) throw new Error("Learning lessons element not found");
	if (!lessonSearch) throw new Error("Lesson search element not found");
	if (!difficultyFilter) throw new Error("Difficulty filter element not found");
	if (!practiceLessonBtn) throw new Error("Practice lesson button not found");
	if (!practiceLessonsView) throw new Error("Practice lesson section not found");
	if (!learningLessonBtn) throw new Error("learning lesson button not found");
	if (!learningLessonsView) throw new Error("learning lesson section not found");

	return {
		practiceLessonsList,
		learningLessonsList,
		lessonSearch,
		difficultyFilter,
		practiceLessonBtn,
		practiceLessonsView,
		learningLessonBtn,
		learningLessonsView,
	};
}

function getFilteredLesson(): PracticeLesson[] {
	return practiceLessons.filter((lesson) => {
		const matchesTitle = lesson.title.toLowerCase()
			.includes(searchQuery.toLowerCase());

		const matchesAuthor = lesson.author?.toLowerCase()
			.includes(searchQuery.toLowerCase());

		const matchesSearch = matchesTitle || matchesAuthor;

		const matchesDifficulty = selectedDifficulty === "all" ||
			lesson.difficulty === selectedDifficulty;

		return matchesSearch && matchesDifficulty;
	})
}

function switchStatsView(currentView: HTMLElement, currentBtn: HTMLButtonElement, newView: HTMLElement, newBtn: HTMLButtonElement): void {
		currentView.classList.remove("is-active");
		currentBtn.classList.remove("is-active");
		currentView.hidden = true;
		newView.classList.add("is-active");
		newBtn.classList.add("is-active");
		newView.hidden = false;
	}

function renderLessonsList(container: HTMLElement, onSelect?: (lesson: PracticeLesson | LearningLesson) => void) {
	renderPracticeLessonsList(container, onSelect);

	renderLearningLessonsList(container, onSelect);
}

function renderPracticeLessonsList(container: HTMLElement, onSelect?: (lesson: PracticeLesson) => void) {
	const elements = getElements(container);
	elements.practiceLessonsList.innerHTML = "";

	if (getFilteredLesson().length === 0) {
		const emptySearch = document.createElement("div");
		emptySearch.innerHTML = "The search did not match any entries.";
		emptySearch.classList.add("placeholder");

		elements.practiceLessonsList.appendChild(emptySearch);
		return;
	}

	getFilteredLesson().forEach((lesson) => {
		const card = document.createElement("article");
		card.className = "lesson-card";
		card.dataset.lessonId = lesson.id;
		card.tabIndex = 0;

		const header = document.createElement("div");
		header.className = "lesson-card-header";

		const lessonId = document.createElement("p");
		lessonId.className = "lesson-id";
		lessonId.textContent = lesson.id;

		const difficulty = document.createElement("span");
		difficulty.className = "lesson-difficulty";
		difficulty.textContent = lesson.difficulty;

		if (lesson.difficulty == "beginner") {
			difficulty.classList.add("beginner");
		} else if (lesson.difficulty == "intermediate") {
			difficulty.classList.add("intermediate");
		} else if (lesson.difficulty == "advanced") {
			difficulty.classList.add("advanced");
		}

		header.append(lessonId, difficulty);

		const title = document.createElement("h4");
		title.textContent = lesson.title;

		const preview = document.createElement("p");
		preview.className = "lesson-preview";
		preview.textContent = lesson.text.slice(0, 120) + (lesson.text.length > 120 ? "…" : "");

		const meta = document.createElement("div");
		meta.className = "lesson-meta";

		const author = document.createElement("p");
		author.className = "lesson-author";
		author.textContent = lesson.author ?? "Unknown author";

		const source = document.createElement("a");
		source.className = "lesson-link";
		source.textContent = lesson.source ? "Source" : "No source";
		if (lesson.source) {
			source.href = lesson.source;
			source.target = "_blank";
			source.rel = "noreferrer";
		}

		meta.append(author, source);

		const button = document.createElement("button");
		button.type = "button";
		button.className = "lesson-select-btn";
		button.textContent = "Practice";
		button.addEventListener("click", () => {
			if (onSelect) {
				onSelect(lesson);
			}
		});

		card.append(header, title, preview, meta, button);
		card.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				if (onSelect) {
					onSelect(lesson);
				}
			}
		});

		elements.practiceLessonsList.appendChild(card);
	});
}

function renderLearningLessonsList(container: HTMLElement, onSelect?: (lesson: LearningLesson) => void) {
	const elements = getElements(container);
	elements.learningLessonsList.textContent = "";
	
	learningLessons.forEach((lesson) => {
		const card = document.createElement("article");
		card.className = "lesson-card";
		card.dataset.lessonId = lesson.id;
		card.tabIndex = 0;

		const header = document.createElement("div");
		header.className = "lesson-card-header";

		const lessonId = document.createElement("p");
		lessonId.className = "lesson-id";
		lessonId.textContent = lesson.id;

		const difficulty = document.createElement("span");
		difficulty.className = "lesson-difficulty";
		difficulty.textContent = lesson.category;

		if (lesson.category == "introduction") {
			difficulty.classList.add("beginner");
		} else if (lesson.category == "home-row" || lesson.category == "bottom-row" || lesson.category == "top-row") {
			difficulty.classList.add("intermediate");
		} else if (lesson.category == "numbers" || lesson.category == "symbols") {
			difficulty.classList.add("advanced");
		}

		header.append(lessonId, difficulty);

		const title = document.createElement("h4");
		title.textContent = lesson.title;

		const preview = document.createElement("p");
		preview.className = "lesson-preview";
		preview.textContent = lesson.description.slice(0, 120) + (lesson.text.length > 120 ? "…" : "");

		const meta = document.createElement("div");
		meta.className = "lesson-meta";

		const button = document.createElement("button");
		button.type = "button";
		button.className = "lesson-select-btn";
		button.textContent = "Practice";
		button.addEventListener("click", () => {
			if (onSelect) {
				onSelect(lesson);
			}
		});

		card.append(header, title, preview, meta, button);
		card.addEventListener("keydown", (event) => {
			if (event.key === "Enter" || event.key === " ") {
				event.preventDefault();
				if (onSelect) {
					onSelect(lesson);
				}
			}
		});

		elements.learningLessonsList.appendChild(card);
	});
}