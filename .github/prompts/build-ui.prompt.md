# /build-ui

Build the first playable UI.

Scope:
- Home screen.
- Game screen.
- Sudoku grid.
- Sudoku cell.
- Number pad.
- Notes toggle.
- Timer.
- Mistake counter.
- Basic settings.

Rules:
- Keep Sudoku logic in `src/engine`.
- UI calls state/actions only.
- Mobile portrait layout first.
- Add keyboard support if practical.
- Add basic Playwright smoke test.

Run:
```bash
pnpm typecheck
pnpm test
pnpm lint
pnpm test:e2e
```
