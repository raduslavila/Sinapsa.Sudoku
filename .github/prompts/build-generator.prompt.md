# /build-generator

Implement Sudoku generation and difficulty rating.

Scope:
- Seeded RNG.
- Solved grid generation.
- Puzzle value removal.
- Unique solution check.
- Difficulty config.
- Difficulty scorer.
- Generator tests.

Rules:
- Use deterministic seeds in tests.
- Do not rate difficulty only by empty cell count.
- Generated puzzles must have exactly one solution.
- Add tests for all 10 difficulty levels, with documented tolerance if generation is slow.

Run:
```bash
pnpm typecheck
pnpm test
pnpm lint
```
