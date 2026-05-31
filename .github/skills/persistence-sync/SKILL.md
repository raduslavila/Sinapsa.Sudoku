---
name: persistence-sync
description: Use when implementing local saves, IndexedDB, save migrations, sync payloads, or conflict resolution.
---

# Persistence and Sync Skill

## Local-first model

Use IndexedDB first.

Persist:
- Active games.
- Completed games.
- Statistics.
- Settings.

## Schema rules

Every persisted object must include:
- `schemaVersion`
- `updatedAt`

Use Zod to validate deserialized data.

Never trust raw IndexedDB or cloud JSON.

## Migration rules

- Add migrations when schema changes.
- Do not silently drop user progress.
- Keep old save fixtures for migration tests.

## Conflict resolution

Default strategy:
1. Prefer newer active game state.
2. Preserve completed game summaries from both sides.
3. Merge statistics conservatively.
4. Never reduce completed count unless data is corrupt.
5. If uncertain, expose manual conflict resolution later.

## Cloud sync phases

Phase 1:
- Local save only.

Phase 2:
- Android Google Play Games snapshot payload.

Phase 3:
- Optional Firebase browser sync.
