import settingsHtml from "./settings.html?raw";
import type { FontPreference, FontSize } from "../settings/font.js";
import { applyFont, applyFontSize } from "../settings/font.js";
import "./settings.css";

export async function initView(container: HTMLElement, onKeyboardSoundChange: (isEnabled: boolean) => void): Promise<void> {
	try {
		container.innerHTML = settingsHtml;

		renderSettings(container, onKeyboardSoundChange);

	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Settings</h2><p>Could not load view.</p></div>`;
	}
}

function getElements(container: HTMLElement) {
	const fontSelect = container.querySelector<HTMLSelectElement>("#fontSelect");
	const fontSizeSelect = container.querySelector<HTMLSelectElement>("#fontSizeSelect");
	const toggleKeyboardSound = container.querySelector<HTMLInputElement>("#toggleKeyboardSound");

	if (!fontSelect) {
		throw new Error("Font select element not found");
	}

	if (!fontSizeSelect) {
		throw new Error("Font size select element not found");
	}

	if (!toggleKeyboardSound) {
		throw new Error("Toggle keyboard sound element not found");
	}

	return {
		fontSelect,
		fontSizeSelect,
		toggleKeyboardSound,
	};
}

function renderSettings(container: HTMLElement, onKeyboardSoundChange?: (isEnabled: boolean) => void) {
	const elements = getElements(container);

	elements.fontSelect.addEventListener("change", () => {
		const font = elements.fontSelect.value as FontPreference;

		applyFont(font);
	});

	elements.fontSizeSelect.addEventListener("change", () => {
		const size = elements.fontSizeSelect.value as FontSize;

		applyFontSize(size);
	});

	elements.toggleKeyboardSound.addEventListener("change", () => {
		if (onKeyboardSoundChange) {
			onKeyboardSoundChange(elements.toggleKeyboardSound.checked);
		}
	});
}
