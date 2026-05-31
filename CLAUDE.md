# CLAUDE.md — Sudoku App Project Instructions

## Project mission

Build a production-ready Sudoku app from scratch.

The app must be:
- A browser-first TypeScript app.
- Packaged as an Android app through Capacitor.
- Written without Java.
- Allowed to use Kotlin only for the Android-native bridge.
- Test-driven for Sudoku logic.
- Offline-first.
- Designed for future Google Play Games cloud saves on Android.
- Designed for optional Firebase/browser sync later.

The first goal is not visual polish. The first goal is a correct, testable, maintainable Sudoku engine and playable local web app.

---

## Non-negotiable technical decisions

Use this stack unless the human explicitly changes it:

- Runtime/package manager: Node.js LTS, pnpm preferred.
- Language: TypeScript.
- Web framework: React.
- Build tool: Vite.
- State management: Zustand.
- Local persistence: IndexedDB through `idb`.
- Runtime validation: Zod.
- Unit tests: Vitest.
- Browser/E2E tests: Playwright.
- Android wrapper: Capacitor.
- Android native bridge language: Kotlin.
- Do not write Java.
- Do not use React Native unless the human explicitly decides to switch stacks.
- Do not add a backend until browser cloud sync is explicitly requested.

---

## Architecture

Keep the Sudoku logic independent from UI and platform APIs.

Preferred layout:

```text
src/
  engine/
    types.ts
    grid.ts
    candidates.ts
    validator.ts
    solver.ts
    generator.ts
    difficulty.ts
    hints.ts
    serializer.ts
    index.ts

  config/
    difficulties.ts
    achievements.ts

  state/
    gameStore.ts
    settingsStore.ts

  storage/
    localSaveRepository.ts
    indexedDbRepository.ts
    migrations.ts

  sync/
    syncManager.ts
    conflictResolver.ts
    playGamesAdapter.ts

  components/
    SudokuGrid.tsx
    SudokuCell.tsx
    NumberPad.tsx
    Timer.tsx
    MistakeCounter.tsx

  screens/
    HomeScreen.tsx
    GameScreen.tsx
    SettingsScreen.tsx
    StatisticsScreen.tsx

  tests/
    testFixtures.ts
```

The engine must not import React, Zustand, Capacitor, browser APIs, or Android APIs.

---

## Quality gate

Before considering any task done, run:

```bash
pnpm typecheck
pnpm test
pnpm lint
```

For UI changes, also run:

```bash
pnpm test:e2e
```

For Android changes, also run:

```bash
pnpm build
npx cap sync android
```

If a command fails, fix the failure before continuing. Do not declare success while checks are failing.

---

## Implementation priorities

Build in this order:

1. Repository/tooling setup.
2. Pure Sudoku engine.
3. Engine unit tests.
4. Basic playable web UI.
5. Local save/load.
6. Settings and configurable difficulty.
7. Statistics.
8. Capacitor Android packaging.
9. Kotlin Capacitor bridge stub.
10. Google Play Games integration later.
11. Achievements/leaderboards later.
12. Firebase/browser cloud sync only later.

---

## Sudoku engine requirements

The engine must support:

- 9x9 board represented as 81 row-major cells.
- Digits 1–9 and empty value 0.
- Validation of rows, columns, and boxes.
- Candidate calculation.
- Solver.
- Uniqueness checker.
- Puzzle generator.
- Difficulty rating.
- Hint generation.
- Serialization/deserialization.
- Seed-based reproducibility.

Use these base types:

```ts
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type CellValue = Digit | 0;
export type SudokuGrid = readonly CellValue[];

export type DifficultyId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
```

All public engine functions must validate inputs and return deterministic results.

---

## Difficulty model

Do not rate difficulty only by number of givens.

Difficulty must be based on:
- Number of givens.
- Solving techniques required.
- Search/backtracking requirement, if any.
- Human-solvability score.

Initial 10 levels:

1. Beginner
2. Easy
3. Casual
4. Normal
5. Medium
6. Tricky
7. Hard
8. Expert
9. Master
10. Nightmare

Each difficulty must be configurable in `src/config/difficulties.ts`.

---

## Puzzle generation rules

Generator flow:

1. Generate a complete solved grid.
2. Remove values according to target difficulty.
3. Preserve exactly one solution.
4. Rate the puzzle.
5. Accept only if it matches target difficulty band.
6. Return puzzle with seed and solution.

Never ship generated puzzles that have:
- Zero solutions.
- Multiple solutions.
- Invalid givens.
- Missing solution.
- Difficulty metadata that does not match the config.

---

## Game rules

The app must support:

- New game.
- Continue game.
- 10 difficulty levels.
- Configurable mistake limits.
- Timer.
- Notes/pencil marks.
- Undo/redo.
- Hints.
- Pause/resume.
- Game over.
- Win detection.
- Statistics.

Mistake limit can be:
- `null` for unlimited mistakes.
- Positive integer for limited mistakes.

---

## Local persistence

Use IndexedDB initially.

Persist:
- Active games.
- Completed game summaries.
- Statistics.
- Settings.
- Save schema version.

All persisted records must have:
- `schemaVersion`
- `updatedAt`

Never overwrite saves blindly. Use repository functions.

---

## Cloud sync model

Treat sync as staged:

Phase 1:
- Local-only save.

Phase 2:
- Android cloud save through Google Play Games Saved Games/Snapshots.

Phase 3:
- Optional Firebase Auth + Firestore for browser/cloud sync.

Do not assume Google Play Games cloud save works in a normal browser. It is an Android-native integration.

---

## Google Play Games bridge

The web app talks only to an adapter interface.

Expected TypeScript interface:

```ts
export interface PlayGamesAdapter {
  signIn(): Promise<{ success: boolean; playerId?: string }>;
  isSignedIn(): Promise<{ signedIn: boolean }>;
  saveGame(snapshotName: string, payload: string): Promise<void>;
  loadGame(snapshotName: string): Promise<{ payload?: string }>;
  showAchievements(): Promise<void>;
  unlockAchievement(achievementId: string): Promise<void>;
  submitScore(leaderboardId: string, score: number): Promise<void>;
}
```

Native implementation must be Kotlin through a Capacitor plugin. Do not write Java.

---

## Testing requirements

Every engine module must have unit tests.

Minimum test coverage areas:

- Grid indexing.
- Row/column/box extraction.
- Duplicate detection.
- Candidate calculation.
- Solver solves known puzzles.
- Solver rejects invalid puzzles.
- Solver detects unique solution.
- Solver detects multiple solutions.
- Generator creates valid puzzles.
- Generator creates puzzles with unique solution.
- Difficulty rating returns expected bands for fixtures.
- Serializer round-trips.
- Game reducer/state transitions.
- Mistake counting.
- Undo/redo.
- Win detection.
- Save conflict resolver.

Prefer deterministic tests with fixed seeds.

---

## Coding style

- TypeScript strict mode must remain enabled.
- Avoid `any`. If unavoidable, explain with a comment.
- Prefer pure functions in the engine.
- Keep side effects in storage/sync/UI layers.
- Use named exports.
- Keep functions small and testable.
- Avoid large components.
- Avoid hidden global state.
- Use `readonly` arrays and immutable updates for engine data.
- Use Zod for deserializing external/persisted data.

---

## UI design rules

The first UI should be clean and functional.

Prioritize:
- Touch-friendly cells.
- Large number pad.
- Clear selected cell.
- Clear row/column/box highlights.
- Conflict highlighting.
- Readable timer and mistake counter.
- Mobile portrait layout first.
- Keyboard support for browser.

Avoid:
- Heavy animation.
- Overdesigned UI.
- Complex themes before gameplay is complete.

---

## Accessibility

Implement:
- Keyboard navigation.
- ARIA labels for cells.
- Color-independent conflict indicators.
- Sufficient contrast.
- Reduced-motion compatibility.
- Visible focus states.

---

## Security and privacy

Do not store personal data unless required for sync.

Cloud save payloads should contain:
- Settings.
- Game state.
- Stats.
- Completed game summaries.

Do not store:
- Email address.
- Real name.
- Raw OAuth tokens.
- Secrets in repo.

---

## Development behavior for the AI agent

When implementing:
1. Read this file first.
2. Inspect existing code before editing.
3. Make a short plan.
4. Implement in small commits/patches.
5. Add or update tests.
6. Run checks.
7. Summarize changed files and test results.

Do not:
- Replace the architecture without asking.
- Add new dependencies casually.
- Skip tests for engine logic.
- Claim Google Play Games browser support.
- Use Java.
- Put Sudoku logic inside React components.
