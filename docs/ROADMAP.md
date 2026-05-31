# Implementation Roadmap

## ✅ Milestone 0 — Repository setup

- ✅ Initialize Vite React TypeScript app.
- ✅ Add pnpm.
- ✅ Add ESLint/Prettier.
- ✅ Add Vitest.
- ✅ Add Playwright.
- ✅ Add Capacitor.
- ✅ Add instruction files.

## ✅ Milestone 1 — Pure Sudoku engine

- ✅ Types.
- ✅ Grid helpers.
- ✅ Validator.
- ✅ Candidate calculator.
- ✅ Solver.
- ✅ Uniqueness checker.
- ✅ Serializer.
- ✅ Unit tests.

## ✅ Milestone 2 — Generator and difficulty

- ✅ Full-grid generator.
- ✅ Puzzle reducer.
- ✅ Seeded RNG.
- ✅ Difficulty scoring.
- ✅ 10 configurable levels.
- ✅ Generator tests.

## ✅ Milestone 3 — Game state

- ✅ Game state model.
- ✅ Move application.
- ✅ Notes.
- ✅ Mistakes.
- ✅ Undo/redo.
- ✅ Win/game-over detection.
- ✅ Store tests.

## ✅ Milestone 4 — Basic playable UI

- ✅ Home screen.
- ✅ Difficulty selector.
- ✅ Game screen.
- ✅ Sudoku grid.
- ✅ Number pad.
- ✅ Notes toggle.
- ✅ Timer.
- ✅ Mistake counter.

## ✅ Milestone 4.1 — Bug Fixes & UX Refinements

- ✅ Notes toggle on/off fix.
- ✅ Conflict-aware note digit coloring (red for digits already in peers).
- ✅ Control panel and banners horizontal alignment fix.
- ✅ Grid overflow fix (grid no longer exceeds container width).
- ✅ Split Hint into Hint (highlight cell) and Hint+ (highlight + place digit).
- ✅ `hintedIndex` tracked in game state; cleared on any player action.
- ✅ Ad placeholder strip at bottom of game screen.
- ✅ Smart 4-tier hint algorithm (Full House → Naked Single → Hidden Single → MRV Fallback).

## ✅ Milestone 5 — Persistence

- ✅ IndexedDB repository (`src/storage/indexedDbRepository.ts`).
- ✅ Zod schema validation for all persisted records (`src/storage/schemas.ts`).
- ✅ Schema versioning and migrations infrastructure (`src/storage/migrations.ts`).
- ✅ Auto-save on every board-changing move.
- ✅ Completed game summary saved on win/over; active save deleted.
- ✅ Continue game on app launch (`loadActiveGame` in App.tsx).
- ✅ Repository serialization tests (24 tests).

## ✅ Milestone 6 — Statistics and settings

- ✅ Settings screen (theme, per-difficulty mistake/hint limits).
- ✅ Statistics screen (totals, win rate, best/avg time per difficulty).
- ✅ Configurable mistake limits per difficulty (with override; default from config).
- ✅ Configurable hint limit per difficulty (hintsUsed tracked in game state).
- ✅ Theme setting (Light / Dark / System) with CSS custom-property dark mode.
- ✅ `settingsStore` with IndexedDB persistence (Zod-validated, DB v2 migration).
- ✅ `computeStatistics` pure function with 8 unit tests.

## ✅ Milestone 7 — Android packaging

- ✅ Add Capacitor Android (`cap add android`).
- ✅ Configure app metadata (`capacitor.config.ts` — appId, appName, webDir).
- ✅ Build web app and sync assets into Android project (`cap sync android`).
- ✅ GitHub Actions release workflow — signed APK + AAB on tag push.

## ✅ Milestone 7.1 — App identity and visual polish

- ✅ App icon (adaptive icon — foreground + background layers).
- ✅ Splash screen not needed — `Theme.SplashScreen` shows `ic_launcher` on `colorBackground` automatically.
- ✅ App name and short description localisation (`strings.xml`).
- ✅ Android status bar transparent, navigation bar matches `colorBackground`.
- ✅ Web app favicon and `<title>` (Sudoku Synapse).
- ✅ `manifest.webmanifest` for PWA (name, icons, theme_color, background_color).
- ✅ Meta tags (`og:title`, `og:description`, `og:type`) for link previews.
- ✅ 7-palette color system (electric-blue, midnight-purple, forest-green, sunset-orange, rose-gold, obsidian, arctic) with light/dark variants.
- ✅ Orientation locked to portrait (`android:screenOrientation="portrait"`).

## Milestone 8 — Play Games bridge stub

- Define TypeScript adapter.
- Create Kotlin Capacitor plugin skeleton.
- Add no-op/mock web implementation.
- Add sync manager tests.

## Milestone 9 — Google Play Games implementation

- Sign-in.
- Save snapshot.
- Load snapshot.
- Conflict resolution.
- Manual restore.

## Milestone 10 — Polish

- Accessibility.
- Keyboard navigation.
- Responsive layout.
- E2E tests.
- PWA manifest.
