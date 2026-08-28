import settingsHtml from "./settings.html?raw";
import type { FontPreference, FontSize } from "../settings/font.js";
import { applyFont, applyFontSize } from "../settings/font.js";
import "./settings.css";

export interface SettingsCallbacks {
    onFontChange?: (font: FontPreference) => void;
    onFontSizeChange?: (size: FontSize) => void;
    onKeyboardSoundChange?: (enabled: boolean) => void;
}

export async function initView(container: HTMLElement, callbacks?: SettingsCallbacks): Promise<void> {
	try {
		container.innerHTML = settingsHtml;

		renderSettings(container, callbacks);

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

function renderSettings(container: HTMLElement, callbacks?: SettingsCallbacks) {
	const elements = getElements(container);

	elements.fontSelect.addEventListener("change", () => {
		const font = elements.fontSelect.value as FontPreference;

		applyFont(font);

		callbacks?.onFontChange?.(font);
	});

	elements.fontSizeSelect.addEventListener("change", () => {
		const size = elements.fontSizeSelect.value as FontSize;

		applyFontSize(size);

		callbacks?.onFontSizeChange?.(size);
	});

	elements.toggleKeyboardSound.addEventListener("change", () => {

		callbacks?.onKeyboardSoundChange?.(elements.toggleKeyboardSound.checked);

	});
}
