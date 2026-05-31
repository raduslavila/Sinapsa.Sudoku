# Testing Strategy

## Unit testing

Use Vitest.

Mandatory engine test files:

```text
src/engine/grid.test.ts
src/engine/validator.test.ts
src/engine/candidates.test.ts
src/engine/solver.test.ts
src/engine/generator.test.ts
src/engine/difficulty.test.ts
src/engine/serializer.test.ts
```

## Required fixtures

Create `src/test/fixtures.ts` with:
- Known easy puzzle.
- Known hard puzzle.
- Invalid puzzle.
- Puzzle with multiple solutions.
- Solved grid.

## Generator tests

Generator tests must use fixed seeds.

Test:
- Generated puzzle has 81 cells.
- Generated puzzle is valid.
- Generated puzzle has exactly one solution.
- Solution matches givens.
- Difficulty ID matches requested target or documented tolerance.

## State tests

Test:
- Apply value.
- Reject invalid move if setting requires it.
- Count mistakes.
- Game over after mistake limit.
- Notes mode.
- Undo.
- Redo.
- Win detection.

## E2E tests

Use Playwright for:
- Start new game.
- Fill a cell.
- Toggle notes.
- Resume saved game.
- Change difficulty setting.
