# /build-engine

Implement the pure Sudoku engine.

Scope:
- `src/engine/types.ts`
- `src/engine/grid.ts`
- `src/engine/validator.ts`
- `src/engine/candidates.ts`
- `src/engine/solver.ts`
- `src/engine/serializer.ts`
- Tests for each module.

Rules:
- No React imports.
- No browser APIs.
- No Capacitor APIs.
- Deterministic functions.
- Strict TypeScript.
- Add tests before or alongside implementation.

Run:
```bash
pnpm typecheck
pnpm test
pnpm lint
```
