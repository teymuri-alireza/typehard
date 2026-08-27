import settingsHtml from "./settings.html?raw";
import type { FontPreference } from "../settings/font.js";
import { applyFont } from "../settings/font.js";
import "./settings.css";

export async function initView(container: HTMLElement): Promise<void> {
	try {
		container.innerHTML = settingsHtml;

		renderSettings(container);

	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Settings</h2><p>Could not load view.</p></div>`;
	}
}

function getElements(container: HTMLElement) {
	const fontSelect = container.querySelector<HTMLSelectElement>("#fontSelect");

	if (!fontSelect) {
		throw new Error("Font select element not found");
	}

	return {
		fontSelect,
	};
}

function renderSettings(container: HTMLElement) {
	const elements = getElements(container);

	elements.fontSelect.addEventListener("change", () => {
		const font = elements.fontSelect.value as FontPreference;

		applyFont(font);
	});
}
