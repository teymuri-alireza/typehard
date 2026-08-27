import { lessons } from "../lessons/lessons.js";
import type { TypingLesson } from "../types/models.js";
import lessonsHtml from "./lessons.html?raw";

function ensureLessonStyles(): void {
	if (document.querySelector('link[data-lessons-style="true"]')) {
		return;
	}

	const link = document.createElement("link");
	link.rel = "stylesheet";
	link.href = "/src/ui/lessons.css";
	link.dataset.lessonsStyle = "true";
	document.head.appendChild(link);
}

export async function initView(container: HTMLElement, onSelect?: (lesson: TypingLesson) => void): Promise<void> {
	try {
		ensureLessonStyles();

		container.innerHTML = lessonsHtml;

		renderLessonsList(container, onSelect);
	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Lessons</h2><p>Could not load view.</p></div>`;
	}
}

function getElements(container: HTMLElement) {
	const lessonsList = container.querySelector("#lessonsList");

	if (!lessonsList) {
		throw new Error("Lesson element not found");
	}

	return {
		lessonsList
	};
}

function renderLessonsList(container: HTMLElement, onSelect?: (lesson: TypingLesson) => void) {
	const elements = getElements(container);
	elements.lessonsList.innerHTML = "";

	lessons.forEach((lesson) => {
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

		elements.lessonsList.appendChild(card);
	});
}