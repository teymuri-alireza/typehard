# Changelog

All notable changes to this project will be documented in this file.

---

## [0.3.1] - 04-09-2026

This release is published to validate the `v0.3.0`'s auto-update feature.

---

## [0.3.0] - 04-09-2026

### Added

- Added `findLessonById()` to `LessonRepository`.
- Added `getLessonsHistory()` to provide an array of lessons and history entries.
- Pass `lessonRepository` to stats view handler.
- Implemented `switchStatsView()`, `buildOverallView()`, `buildLessonsHistoryView()` inside stats view.
- Added event listener for `overallStatsBtn` and `lessonsHistoryBtn` buttons.
- Accepted `lessonRepository` as arguments inside stats view functions.
- Added `about` and `credits` section in the settings view.
- Added export to the `Difficulty` type.
- Added event listeners for `lessonSearch`, and `difficultyFilter` elements.
- Implemented `getFilteredLesson()` instead of the global lessons array to filter lessons by title or author.
- Added `lessonSearch` and `difficultyFilter` elements in the HTML file, and added style.
- Added helper text for empty search results.
- Installed the `plugin-updater`, and `plugin-process`.
- Added `checkForUpdates()` and `installUpdate()` functions and inject them inside the settings view.
- Implemented event listener to track the installation flow

### Changed

- Divided the statistics page into two sections: **overall stats** and **lessons history stats**.
- Changed the lessons source to the main entry URL.
- Prevented typing listener when typing view is hidden.

---

## [0.2.0] - 01-09-2026

### Added

- Added `HelperTextType` to preserve the helper text contents.
- Added `HelperText` key-value using `HelperTextType` and descriptions.
- Implemented `updateHelperText()` and inject it inside `updateUI()`.
- Added `onThemeChange` callback in **settingsView.ts** to handle theme changes.
- Added `themeSelect` element for changing theme in UI.
- Added `ThemeType` to preserve type for themes, and use `ThemeType` for variable types.
- Added `dark yellow` and `dark pink` themes.
- Added `resetSession()` and event listener for `resetSessionBtn`.
- Added helper text for navigating between lessons.
- Implemented `deleteAll()` to `TypingHistoryRepository` to delete all saved rows.
- Implemented `refresh()` to refresh `StatsView` after `clearStatsBtn` change.
- Implemented `clearStatsBtn` element and add style.
- Implemented tauri dialog to confirm clearing statistics.
- Added dropdown element to show error message for reset session btn.
- Implemented `showErrorDropdown()` to handle `resetSession()` errors.

### Changed

- Renamed the `id` name in **index.html** from `keys` to `helperText`.
- Updated the style for `helperText` element.
- Updated the `keydown` event listener to handle `helperText` element.
- Changed the navbar display from `felx` to `grid` to preserve the navbar structure after removing the button responsible for toggling theme.
- Moved the `applyTheme()` function from **index.ts** to **src/settings/theme.ts**.
- Replaced the navigation buttons with the `resetSessionBtn`.
- Updated the `goToNextLesson()` and `goToPreviousLesson()` functions to navigate between lessons using right and left arrow keys.

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
