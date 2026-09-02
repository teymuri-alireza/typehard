# TypeHard

A desktop touch-typing application built with **TypeScript** and **Tauri**.

TypeHard allows users to practice typing with structured lessons while tracking typing speed, accuracy, session history, and overall statistics. User preferences and typing history are stored locally using SQLite.

## Features

- Typing lessons with different difficulties.
- Typing session statistics such as average WPM, best performance, and total practice time.
- Persistent settings for theme, font family, font size, and mechanical keyboard sound.
- Local SQLite database storage.

## Roadmap

Future improvements include:

- More typing lessons
- Lesson search and filtering
- Additional themes
- More customization options
- Improved lesson management
- Achievements and progress tracking
- Cross-platform release automation
- Windows and macOS builds

## Installation

### Linux (Debian/Ubuntu)

Download the `.deb` package from the latest release and install it using:

```bash
sudo apt install ./typehard_0.1.0_amd64.deb
```

After installation, TypeHard can be launched from your system's application menu.

### Windows

Download the `.exe` file from the latest release and double-click it to run the installer. Follow the instructions to complete the installation. TypeHard can then be launched from your Start menu.

### Development Setup

If you want to run or modify TypeHard from source, you will need:

- Node.js
- npm
- Rust
- Cargo

You will also need the system dependencies required by Tauri for your operating system.

#### Clone the Repository

```bash
git clone https://github.com/teymuri-alireza/typehard
cd typehard
```

#### Install Dependencies

```bash
npm install
```

#### Run in Development Mode

```bash
npm run tauri dev
```

## Tech Stack

### Frontend

- TypeScript
- HTML
- CSS
- Vite

### Desktop Application

- Tauri
- Rust

### Database

- SQLite
- Tauri SQL Plugin

## Project Structure

```text
src/
├── assets/
├── core/
├── db/
├── lessons/
├── settings/
├── stats/
├── types/
├── ui/
└── index.ts

src-tauri/
├── assets/
├── icons/
├── src/
├── Cargo.toml
└── tauri.conf.json
```

## Notes

The lesson library is sourced from public-domain literary texts.

## Contributing

Contributions, suggestions, and bug reports are welcome.

If you find a bug or have an idea for improving TypeHard, feel free to open an issue or submit a pull request.
