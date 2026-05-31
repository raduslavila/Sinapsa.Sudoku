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

## Milestone 4.1 — Bug Fixes & UX Refinements

- Notes toggle on/off fix.
- Conflict-aware note digit coloring (red for digits already in peers).
- Control panel and banners horizontal alignment fix.
- Grid overflow fix (grid no longer exceeds container width).
- Split Hint into Hint (highlight cell) and Hint+ (highlight + place digit).
- `hintedIndex` tracked in game state; cleared on any player action.
- Ad placeholder strip at bottom of game screen.

## Milestone 5 — Persistence

- IndexedDB repository.
- Schema validation.
- Migrations.
- Auto-save.
- Continue game.

## Milestone 6 — Statistics and settings

- Settings screen.
- Statistics screen.
- Configurable mistake limits per difficulty (with IAP extension hook for buying extra mistakes).
- Configurable hint limits per difficulty (with IAP extension hook for buying extra hints or watching ads).
- Theme setting.

## Milestone 7 — Android packaging

- Add Capacitor Android.
- Configure app metadata.
- Test Android build.
- Prepare signed AAB later.

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
