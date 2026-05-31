---
name: sudoku-engine
description: Use when implementing or reviewing Sudoku validation, candidates, solving, generation, hints, or difficulty scoring.
---

# Sudoku Engine Skill

## Boundary

The Sudoku engine must be pure TypeScript.

It must not import:
- React
- Zustand
- Capacitor
- Browser APIs
- Android APIs

## Board representation

Use 81 row-major cells.

```ts
index = row * 9 + col
row = Math.floor(index / 9)
col = index % 9
box = Math.floor(row / 3) * 3 + Math.floor(col / 3)
```

Empty cells are `0`.

Digits are `1` through `9`.

## Solver requirements

The solver must:
- Validate input.
- Respect givens.
- Find at least one solution.
- Detect multiple solutions.
- Support an early exit after two solutions for uniqueness checks.
- Prefer deterministic traversal for reproducible tests.

## Candidate requirements

Candidate calculation must remove digits already present in:
- Same row.
- Same column.
- Same 3x3 box.

## Generator requirements

Generator must:
- Generate a valid complete solution.
- Remove clues while preserving unique solution.
- Use a seeded RNG.
- Attach difficulty metadata.
- Be tested with fixed seeds.

## Difficulty

Do not use clue count alone.

Use a combination of:
- Clue count.
- Singles.
- Pairs.
- Box-line interactions.
- Advanced techniques.
- Backtracking requirement.

Start simple if necessary, but preserve the API so the difficulty engine can be improved later.

## Testing

Add fixtures for:
- Easy puzzle.
- Hard puzzle.
- Invalid puzzle.
- Multiple-solution puzzle.
- Solved grid.

Every public function should have tests.
