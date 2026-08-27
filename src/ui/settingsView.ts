import settingsHtml from "./settings.html?raw";
import type { FontPreference, FontSize } from "../settings/font.js";
import { applyFont, applyFontSize } from "../settings/font.js";
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
	const fontSizeSelect = container.querySelector<HTMLSelectElement>("#fontSizeSelect");

	if (!fontSelect) {
		throw new Error("Font select element not found");
	}

	if (!fontSizeSelect) {
		throw new Error("Font size select element not found");
	}

	return {
		fontSelect,
		fontSizeSelect
	};
}

function renderSettings(container: HTMLElement) {
	const elements = getElements(container);

	elements.fontSelect.addEventListener("change", () => {
		const font = elements.fontSelect.value as FontPreference;

		applyFont(font);
	});

	elements.fontSizeSelect.addEventListener("change", () => {
		const size = elements.fontSizeSelect.value as FontSize;

		applyFontSize(size);
	});
}
