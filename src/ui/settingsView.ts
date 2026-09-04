import { getVersion } from "@tauri-apps/api/app";
import settingsHtml from "./settings.html?raw";
import type { FontPreference, FontSize } from "../settings/font.js";
import { applyFont, applyFontSize } from "../settings/font.js";
import { applyTheme, type ThemeType } from "../settings/theme.js";
import type { SettingsPreferences } from "../types/preferences.js";
import { checkForUpdates, installUpdate } from "../updater.js";
import "./settings.css";

export interface SettingsCallbacks {
    onFontChange?: (font: FontPreference) => void;
    onFontSizeChange?: (size: FontSize) => void;
    onKeyboardSoundChange?: (enabled: boolean) => void;
    onThemeChange?: (theme: ThemeType) => void;
}

export async function initView(container: HTMLElement, settings: SettingsPreferences, callbacks?: SettingsCallbacks): Promise<void> {
	try {
		container.innerHTML = settingsHtml;

		await renderSettings(container, settings, callbacks);

	} catch (err) {
		container.innerHTML = `<div class="placeholder"><h2>Settings</h2><p>Could not load view.</p></div>`;
	}
}

function getElements(container: HTMLElement) {
	const fontSelect = container.querySelector<HTMLSelectElement>("#fontSelect");
	const fontSizeSelect = container.querySelector<HTMLSelectElement>("#fontSizeSelect");
	const toggleKeyboardSound = container.querySelector<HTMLInputElement>("#toggleKeyboardSound");
	const themeSelect = container.querySelector<HTMLSelectElement>("#themeSelect");
	const appVersionOutput = container.querySelector<HTMLSpanElement>("#appVersionOutput");
	const checkForUpdatesBtn = container.querySelector<HTMLButtonElement>("#checkForUpdates");
	const updateStatus = container.querySelector<HTMLParagraphElement>("#updateStatus");
	const updateActions = container.querySelector<HTMLDivElement>("#updateActions");

	if (!fontSelect) throw new Error("Font select element not found");
	if (!fontSizeSelect) throw new Error("Font size select element not found");
	if (!toggleKeyboardSound) throw new Error("Toggle keyboard sound element not found");
	if (!themeSelect) throw new Error("Theme select element not found");
	if (!appVersionOutput) throw new Error("App version element not found");
	if (!checkForUpdatesBtn) throw new Error("Check for updates button not found");
	if (!updateStatus) throw new Error("Update status element not found");
	if (!updateActions) throw new Error("Update actions element not found");

	return {
		fontSelect,
		fontSizeSelect,
		toggleKeyboardSound,
		themeSelect,
		appVersionOutput,
		checkForUpdatesBtn,
		updateStatus,
		updateActions,
	};
}

async function renderSettings(container: HTMLElement, settings: SettingsPreferences, callbacks?: SettingsCallbacks) {
	const elements = getElements(container);

	elements.fontSelect.value = settings.fontFamily;
	elements.fontSizeSelect.value = settings.fontSize;
	elements.toggleKeyboardSound.checked = settings.isKeyboardSoundEnabled;
	elements.themeSelect.value = settings.theme;

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

	elements.themeSelect.addEventListener("change", () => {
		const theme = elements.themeSelect.value as ThemeType;

		applyTheme(theme);

		callbacks?.onThemeChange?.(theme);
	})

	elements.appVersionOutput.textContent = await getVersion();

	// Check for update section
	elements.checkForUpdatesBtn.addEventListener("click", async () => {
		elements.checkForUpdatesBtn.disabled = true;
		elements.updateStatus.textContent = "Checking for updates...";

		try {
			const update = await checkForUpdates();

			if (update === null) {
				elements.updateStatus.textContent = "You're using the latest version.";
				return;
			}

			elements.updateStatus.textContent = `Version ${update.version} is available.`;

			elements.updateActions.innerHTML = "";

			const installButton = document.createElement("button");
			installButton.setAttribute("id", "installBtn");
			installButton.textContent = "Install Update";

			elements.updateActions.appendChild(installButton);

			installButton.addEventListener("click", async () => {
				installButton.disabled = true;
				elements.updateStatus.textContent = "Downloading update...";

				try {
					await installUpdate(update, (progress) => {
						elements.updateStatus.textContent = `Downloading update... ${Math.round(progress)}%`;
					});
				} catch (error) {
					elements.updateStatus.textContent = `Failed to install update: ${error}`;

					installButton.disabled = false;
				}
			});

		} catch (error) {
			elements.updateStatus.textContent = `Failed to check for updates: ${error}`;
		} finally {
			elements.checkForUpdatesBtn.disabled = false;
		}
	});
}
