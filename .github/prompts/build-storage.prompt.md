# /build-storage

Implement local persistence.

Scope:
- IndexedDB repository through `idb`.
- Zod schemas.
- Save migrations.
- Auto-save active game.
- Load active games.
- Save settings.
- Save statistics.
- Tests for serialization/migration/conflict logic.

Rules:
- All records need `schemaVersion` and `updatedAt`.
- Never trust persisted JSON without validation.
- Do not add cloud backend.

Run:
```bash
pnpm typecheck
pnpm test
pnpm lint
```
