# Changelog

All notable changes to this project will be documented in this file.

---

## [unreleased]

### Added

- Added `HelperTextType` to preserve the helper text contents.
- Added `HelperText` key-value using `HelperTextType` and descriptions.
- Implemented `updateHelperText()` and inject it inside `updateUI()`.
- Added `onThemeChange` callback in **settingsView.ts** to handle theme changes.
- Added `themeSelect` element for changing theme in UI.
- Added `ThemeType` to preserve type for themes, and use `ThemeType` for variable types.
- Added `dark yellow` and `dark pink` themes.

### Changed

- Renamed the `id` name in **index.html** from `keys` to `helperText`.
- Updated the style for `helperText` element.
- Updated the `keydown` event listener to handle `helperText` element.
- Changed the navbar display from `felx` to `grid` to preserve the navbar structure after removing the button responsible for toggling theme.
- Moved the `applyTheme()` function from **index.ts** to **src/settings/theme.ts**.

### Fixed

- Added color style for element with `elapsedTime` id.
- Set fixed height to prevent words go past the container.

### Removed

- Removed the button responsible for toggling theme in the navbar and its `top-actions` class.
- Removed event listener for changing theme after implementing `onThemeChange` callback in **settingsView.ts**.

---

## [0.1.0] - 28-08-2026

Initial public release of TypeHard.

### Added
- Typing lessons with multiple difficulty levels
- WPM and accuracy tracking
- Persistent typing history
- Font and font-size preferences
- Light/dark theme
- Optional keyboard sound
- SQLite-based local data storage
