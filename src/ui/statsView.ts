import { confirm } from "@tauri-apps/plugin-dialog";
import type { TypingHistoryEntry } from "../types/history.js";
import { LessonRepository } from "../lessons/repository.js";
import {
    getSessionCount,
    getAverageWpm,
    getAverageAccuracy,
    getBestWpm,
    getBestAccuracy,
    getTotalTypingTime,
	formatDuration,
	getLessonsHistory,
} from "../stats/statistics.js";

import statsHtml from "./statistics.html?raw"
import "./statistics.css"

export async function initView(container: HTMLElement, history: TypingHistoryEntry[], lessonRepository: LessonRepository, onDeleteStats?: () => Promise<void>): Promise<void> {
    try {
		container.innerHTML = statsHtml;

    	renderStats(container, history, lessonRepository, onDeleteStats);

	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Statistics</h2><p>Could not load view.</p><p>${err}</p></div>`;
	}
}

function getElements(container: HTMLElement) {
	const sessionCountOutput = container.querySelector<HTMLSelectElement>("#sessionCount");
	const averageWpmOutput = container.querySelector<HTMLSelectElement>("#averageWpm");
	const averageAccuracyOutput = container.querySelector<HTMLSelectElement>("#averageAccuracy");
	const bestWpmOutput = container.querySelector<HTMLSelectElement>("#bestWpm");
	const bestAccuracyOutput = container.querySelector<HTMLSelectElement>("#bestAccuracy");
	const totalTypingTimeOutput = container.querySelector<HTMLSelectElement>("#totalTypingTime");
	const clearStatsBtn = container.querySelector<HTMLButtonElement>("#clearStatsBtn");
	const overallStatsBtn = container.querySelector<HTMLButtonElement>("#overallStatsBtn");
	const overallStatsView = container.querySelector<HTMLElement>("#overallStatsView");
	const lessonsHistoryBtn = container.querySelector<HTMLButtonElement>("#lessonsHistoryBtn");
	const lessonsHistoryView = container.querySelector<HTMLElement>("#lessonsHistoryView");
	const lessonsHistoryOutput = container.querySelector<HTMLDivElement>("#lessonsHistoryOutput");

	if (!sessionCountOutput) throw new Error("Session count element not found");
	if (!averageWpmOutput) throw new Error("Average WPM element not found");
	if (!averageAccuracyOutput) throw new Error("Average accuracy element not found");
	if (!bestWpmOutput) throw new Error("Best WPM element not found");
	if (!bestAccuracyOutput) throw new Error("Best accuracy element not found");
	if (!totalTypingTimeOutput) throw new Error("Total typing time element not found");
	if (!clearStatsBtn) throw new Error("Delete stats button not found");
	if (!overallStatsBtn) throw new Error("Overall stats button not found");
	if (!overallStatsView) throw new Error("Overall stats section not found");
	if (!lessonsHistoryBtn) throw new Error("Lessons history button not found");
	if (!lessonsHistoryView) throw new Error("Lessons history section not found");
	if (!lessonsHistoryOutput) throw new Error("lessons history element not found");

	return {
		sessionCountOutput,
		averageWpmOutput,
		averageAccuracyOutput,
		bestWpmOutput,
		bestAccuracyOutput,
		totalTypingTimeOutput,
		clearStatsBtn,
		overallStatsBtn,
		overallStatsView,
		lessonsHistoryBtn,
		lessonsHistoryView,
		lessonsHistoryOutput,
	};
}

function renderStats(container: HTMLElement, history: TypingHistoryEntry[], lessonRepository: LessonRepository, onDeleteStats?: () => Promise<void>): void {
	const elements = getElements(container);

	function switchStatsView(currentView: HTMLElement, currentBtn: HTMLButtonElement, newView: HTMLElement, newBtn: HTMLButtonElement): void {
		currentView.classList.remove("is-active");
		currentBtn.classList.remove("is-active");
		currentView.hidden = true;
		newView.classList.add("is-active");
		newBtn.classList.add("is-active");
		newView.hidden = false;
	}

	function buildOverallView() {
		switchStatsView(
			elements.lessonsHistoryView,
			elements.lessonsHistoryBtn,
			elements.overallStatsView,
			elements.overallStatsBtn,
		)

		const sessionCount = getSessionCount(history);
		const averageWpm = getAverageWpm(history);
		const averageAccuracy = getAverageAccuracy(history);
		const bestWpm = getBestWpm(history);
		const bestAccuracy = getBestAccuracy(history);
		const totalTypingTime = getTotalTypingTime(history);

		elements.sessionCountOutput.textContent = sessionCount.toString();
		elements.averageWpmOutput.textContent = averageWpm.toFixed(2);
		elements.averageAccuracyOutput.textContent = `${averageAccuracy.toFixed(2)}%`;
		elements.bestWpmOutput.textContent = bestWpm.toFixed(2);
		elements.bestAccuracyOutput.textContent = `${bestAccuracy.toFixed(2)}%`;
		elements.totalTypingTimeOutput.textContent = formatDuration(totalTypingTime);
	}

	function buildLessonsHistoryView() {
		switchStatsView(
			elements.overallStatsView,
			elements.overallStatsBtn,
			elements.lessonsHistoryView,
			elements.lessonsHistoryBtn,
		)

		const lessonsHistory = getLessonsHistory(history, lessonRepository);

		elements.lessonsHistoryOutput.innerHTML = "";

		lessonsHistory.forEach((lesson) => {
			const lessonEntry = document.createElement("div");
			lessonEntry.classList.add("lesson-history-item");

			const divContainer = document.createElement("div");
			divContainer.classList.add("lesson-history-meta");

			const titleParagraph = document.createElement("p");
			titleParagraph.classList.add("lesson-history-title");
			const titleStrong = document.createElement("strong");
			titleStrong.textContent = lesson.lesson.title;
			titleParagraph.appendChild(titleStrong);
			divContainer.appendChild(titleParagraph);

			const wpmParagraph = document.createElement("p");
			wpmParagraph.classList.add("lesson-history-detail");
			wpmParagraph.textContent = `WPM: ${lesson.entry.wpm.toFixed(2)}`;
			divContainer.appendChild(wpmParagraph);

			const accuracyParagraph = document.createElement("p");
			accuracyParagraph.classList.add("lesson-history-detail");
			accuracyParagraph.textContent = `Accuracy: ${lesson.entry.accuracy.toFixed(2)}%`;
			divContainer.appendChild(accuracyParagraph);

			const completedParagraph = document.createElement("p");
			completedParagraph.classList.add("lesson-history-detail");
			completedParagraph.textContent = `Completed: ${lesson.entry.completedAt}`;
			divContainer.appendChild(completedParagraph);

			const timeBadge = document.createElement("span");
			timeBadge.classList.add("lesson-history-time");
			timeBadge.textContent = formatDuration(lesson.entry.duration);

			lessonEntry.appendChild(divContainer);
			lessonEntry.appendChild(timeBadge);
			elements.lessonsHistoryOutput.appendChild(lessonEntry);
		});
	}

	// Create the default view
	buildOverallView();

	if (elements.clearStatsBtn) {
		elements.clearStatsBtn.addEventListener("click", async () => {

			const confirmed = await confirm(
				"This will permanently delete all of your typing history and statistics. This action cannot be undone.",
				{
					title: "Reset Statistics",
					kind: "warning",
					okLabel: "Reset",
					cancelLabel: "Cancel",
				}
			);

			if (!confirmed) {
				return;
			}

			if (onDeleteStats) await onDeleteStats();
		})
	}

	elements.overallStatsBtn.addEventListener("click", () => {
		buildOverallView();
	})

	elements.lessonsHistoryBtn.addEventListener("click", () => {
		buildLessonsHistoryView();
	})
}

export function refresh(container: HTMLElement, history: TypingHistoryEntry[], lessonRepository: LessonRepository): void {
	renderStats(container, history, lessonRepository);
}