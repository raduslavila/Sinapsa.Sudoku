# Sinapsa Sudoku

A production-quality, offline-first Sudoku app built with React, TypeScript, and Vite. Packaged for Android via Capacitor. Designed for future Google Play Games cloud saves.

---

## Features

- **10 difficulty levels** — Beginner through Nightmare, each with distinct solving technique requirements
- **Smart hint system** — 4-tier algorithm (Full House → Naked Single → Hidden Single → MRV Fallback) that mirrors how a human solver thinks
- **Notes / pencil marks** — toggle per cell, auto-cleared on correct placement
- **Undo / redo** — full move history
- **Pause / resume** — timer pauses cleanly
- **Configurable mistake limits** — per difficulty, with per-player overrides in Settings
- **Configurable hint limits** — per difficulty
- **Continue game** — auto-saves on every move and on Home; restore from the home screen
- **Statistics** — games played, win rate, best time and average time per difficulty
- **Dark mode** — Light / Dark / System theme via CSS custom properties
- **Offline-first** — all data stored locally in IndexedDB, no account required
- **Android-ready** — Capacitor wrapper included; Google Play Games integration planned

---

## Stack

| Layer | Technology |
|---|---|
| UI | React 19 + TypeScript |
| Build | Vite 8 |
| State | Zustand 5 |
| Persistence | IndexedDB via `idb` |
| Schema validation | Zod |
| ID generation | nanoid |
| Android wrapper | Capacitor 8 |
| Unit tests | Vitest |
| E2E tests | Playwright |

---

## Architecture

```
src/
  engine/          # Pure TypeScript Sudoku engine — no React, no browser APIs
    types.ts
    grid.ts
    candidates.ts
    validator.ts
    solver.ts
    generator.ts
    difficulty.ts
    hints.ts
    serializer.ts

  config/
    difficulties.ts   # 10 difficulty configs (givens range, default limits)

  state/
    gameState.ts      # Pure reducer — all game transitions
    gameStore.ts      # Zustand store — wires reducer to persistence
    settingsStore.ts  # Theme + per-difficulty limit overrides
    statistics.ts     # computeStatistics() — pure aggregation function

  storage/
    types.ts                  # PersistedGame, PersistedSettings, PersistedCompletedGame
    schemas.ts                # Zod validation schemas
    migrations.ts             # IndexedDB version migrations
    indexedDbRepository.ts    # All read/write operations

  screens/
    HomeScreen.tsx        # Difficulty selector + Continue Game card
    GameScreen.tsx        # Main game view
    SettingsScreen.tsx    # Theme + limit overrides
    StatisticsScreen.tsx  # Win rates, best times, averages

  components/
    SudokuGrid.tsx
    SudokuCell.tsx
    NumberPad.tsx
    Timer.tsx
    MistakeCounter.tsx
```

The engine layer is **platform-independent** — it never imports React, Zustand, Capacitor, or any browser API.

---

## Sudoku Engine

The engine supports:

- 9×9 board as a flat 81-element `readonly CellValue[]`
- Row / column / 3×3 box validation and candidate calculation
- Backtracking solver with uniqueness checking
- Seed-based reproducible puzzle generation
- Difficulty scoring based on solving techniques, not just given count
- Hint generation using human-oriented techniques in priority order

### Hint algorithm tiers

| Priority | Technique | Description |
|---|---|---|
| 1 | Full House | Only one empty cell remains in a row, column, or box |
| 2 | Naked Single | Only one candidate digit is possible in a cell |
| 3 | Hidden Single | A digit has only one possible cell in a unit |
| 4 | MRV Fallback | Cell with fewest candidates (minimum remaining values) |

---

## Getting Started

### Prerequisites

- Node.js LTS
- pnpm (`npm install -g pnpm`)

### Install

```bash
pnpm install
```

### Run in browser

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Build

```bash
pnpm build
```

---

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start Vite dev server |
| `pnpm build` | TypeScript compile + Vite production build |
| `pnpm preview` | Preview the production build locally |
| `pnpm typecheck` | Run `tsc --noEmit` |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run all Vitest unit tests |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm test:e2e` | Run Playwright end-to-end tests |
| `pnpm cap:sync` | Sync web build to Android project |
| `pnpm android` | Open the Android project in Android Studio |

---

## Tests

196 unit tests across 11 test files:

| File | Coverage area |
|---|---|
| `engine/grid.test.ts` | Indexing, peer extraction |
| `engine/validator.test.ts` | Row/col/box duplicate detection |
| `engine/candidates.test.ts` | Candidate calculation |
| `engine/solver.test.ts` | Known puzzles, uniqueness, invalid inputs |
| `engine/generator.test.ts` | Puzzle generation, seed reproducibility |
| `engine/difficulty.test.ts` | Difficulty band classification |
| `engine/hints.test.ts` | All 4 hint tiers |
| `engine/serializer.test.ts` | Round-trip serialization |
| `state/gameState.test.ts` | All game state transitions |
| `state/statistics.test.ts` | Statistics aggregation |
| `storage/repository.test.ts` | Zod schema validation, board serialization |

```bash
pnpm test
```

---

## Persistence

All data is stored in an IndexedDB database named `sinapsa-sudoku` (schema version 2).

| Store | Contents |
|---|---|
| `activeGame` | The current in-progress game (singleton) |
| `completedGames` | Completed game summaries for statistics |
| `settings` | Theme and per-difficulty limit overrides |

Every record includes `schemaVersion` and `updatedAt`. Zod schemas validate all records on read. Migrations are applied in version order and never mutated.

---

## Android

The project includes a Capacitor 8 wrapper for Android.

```bash
pnpm build
pnpm cap:sync
pnpm android        # opens Android Studio
```

Google Play Games integration (sign-in, cloud save snapshots, achievements, leaderboards) is planned for a future milestone via a Kotlin-only Capacitor plugin. No Java is used.

---

## Roadmap

- [x] M0 — Repository and tooling setup
- [x] M1 — Pure Sudoku engine
- [x] M2 — Puzzle generator and difficulty scoring
- [x] M3 — Game state (moves, mistakes, undo/redo, win/over)
- [x] M4 — Playable browser UI
- [x] M4.1 — UX refinements and smart hint algorithm
- [x] M5 — IndexedDB persistence (auto-save, continue game)
- [x] M6 — Statistics, settings, dark mode, configurable limits
- [ ] M7 — Android packaging and Play Store preparation
- [ ] M8 — Google Play Games bridge stub (Kotlin Capacitor plugin)
- [ ] M9 — Google Play Games implementation (sign-in, snapshots, achievements)
- [ ] M10 — Accessibility, E2E tests, PWA manifest, polish

---

## License

Copyright © 2026 Radu Slăvilă

This project is licensed under the **GNU General Public License v3.0**.

You are free to use, study, modify, and distribute this software, provided that any derivative work is also distributed under the same GPL v3 terms. Commercial use (including ad-supported or IAP-monetised builds) is permitted under GPL v3, but any distributed modifications must remain open source.

See [LICENSE](LICENSE) for the full license text.

