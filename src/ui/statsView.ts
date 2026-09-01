import type { TypingHistoryEntry } from "../types/history.js";
import {
    getSessionCount,
    getAverageWpm,
    getAverageAccuracy,
    getBestWpm,
    getBestAccuracy,
    getTotalTypingTime,
	formatDuration,
} from "../stats/statistics.js";

import statsHtml from "./statistics.html?raw"
import "./statistics.css"

export async function initView(container: HTMLElement, history: TypingHistoryEntry[], onDeleteStats?: () => Promise<void>): Promise<void> {
    try {
		container.innerHTML = statsHtml;

    	renderStats(container, history, onDeleteStats);

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

	if (!sessionCountOutput) throw new Error("Session count element not found");
	if (!averageWpmOutput) throw new Error("Average WPM element not found");
	if (!averageAccuracyOutput) throw new Error("Average accuracy element not found");
	if (!bestWpmOutput) throw new Error("Best WPM element not found");
	if (!bestAccuracyOutput) throw new Error("Best accuracy element not found");
	if (!totalTypingTimeOutput) throw new Error("Total typing time element not found");
	if (!clearStatsBtn) throw new Error("Delete stats button not found");

	return {
		sessionCountOutput,
		averageWpmOutput,
		averageAccuracyOutput,
		bestWpmOutput,
		bestAccuracyOutput,
		totalTypingTimeOutput,
		clearStatsBtn,
	};
}

function renderStats(container: HTMLElement, history: TypingHistoryEntry[], onDeleteStats?: () => Promise<void>): void {
	const elements = getElements(container);

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

	if (elements.clearStatsBtn) {
		elements.clearStatsBtn.addEventListener("click", async () => {
			if (onDeleteStats) await onDeleteStats();
		})
	}
}

export function refresh(container: HTMLElement, history: TypingHistoryEntry[]): void {
	renderStats(container, history);
}