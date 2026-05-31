# Sudoku App Specification

## Goal

Create an offline-first Sudoku app for browser and Android.

## Platforms

- Browser/PWA first.
- Android via Capacitor.
- Android cloud save later via Google Play Games.
- Optional Firebase sync later for browser.

## Core features

- New game.
- Continue game.
- Daily puzzle.
- 10 configurable difficulty levels.
- Configurable mistake limits.
- Notes mode.
- Hints.
- Undo/redo.
- Timer.
- Pause/resume.
- Game statistics.
- Local save.
- Android cloud save later.

## Difficulty levels

| ID | Name | Default mistake limit |
|---:|---|---:|
| 1 | Beginner | unlimited |
| 2 | Easy | 5 |
| 3 | Casual | 5 |
| 4 | Normal | 4 |
| 5 | Medium | 4 |
| 6 | Tricky | 3 |
| 7 | Hard | 3 |
| 8 | Expert | 3 |
| 9 | Master | 2 |
| 10 | Nightmare | 1 |

Difficulty is based on human solving techniques, not only number of givens.

## Engine requirements

The engine must provide:
- Board validation.
- Candidate calculation.
- Solver.
- Uniqueness checker.
- Generator.
- Difficulty scorer.
- Hint engine.
- Serialization.

## Persistence

Use schema-versioned IndexedDB records.

Persist:
- Active games.
- Completed games.
- Statistics.
- Settings.

## Sync

Phase 1:
- Local only.

Phase 2:
- Android Google Play Games Saved Games/Snapshots.

Phase 3:
- Optional Firebase Auth + Firestore.

## Testing

Use Vitest for logic. Use Playwright for user flows.
