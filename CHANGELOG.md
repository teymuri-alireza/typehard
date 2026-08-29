# Changelog

All notable changes to this project will be documented in this file.

---

## [unreleased]

### Added

- Added `HelperTextType` to preserve the helper text contents.
- Added `HelperText` key-value using `HelperTextType` and descriptions.
- Implemented `updateHelperText()` and inject it inside `updateUI()`.

### Changed

- Renamed the `id` name in **index.html** from `keys` to `helperText`.
- Updated the style for `helperText` element.
- Updated the `keydown` event listener to handle `helperText` element.

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
