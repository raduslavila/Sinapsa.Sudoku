# GitHub Copilot Instructions — Sudoku App

## Project summary

Build a Sudoku app with:
- React + TypeScript + Vite.
- Capacitor Android wrapper.
- Pure TypeScript Sudoku engine.
- Unit tests with Vitest.
- E2E tests with Playwright.
- Local saves through IndexedDB.
- Future Android cloud saves through Google Play Games via Kotlin Capacitor plugin.

## Hard constraints

- Do not write Java.
- Do not move Sudoku logic into React components.
- Do not make Google Play Games sync part of the browser build.
- Do not add Firebase until explicitly requested.
- Do not use `any` unless there is a strong reason.
- Do not disable TypeScript strict mode.

## Primary instruction files

Read these before working:

1. `AGENTS.md`
2. `CLAUDE.md`
3. `docs/SPECIFICATION.md`
4. `docs/ROADMAP.md`
5. `docs/TESTING.md`

## Prompt files

Reusable task prompts are stored in `.github/prompts`.

For the first implementation pass, use:

- `.github/prompts/initial-setup.prompt.md`

## Agent skills

Specialized skills are stored in `.github/skills`.

Use:

- `.github/skills/sudoku-engine/SKILL.md` for Sudoku logic
- `.github/skills/test-driven-development/SKILL.md` for unit-tested implementation
- `.github/skills/react-ui/SKILL.md` for UI work
- `.github/skills/persistence-sync/SKILL.md` for saves and sync
- `.github/skills/capacitor-android/SKILL.md` for Android/Capacitor work

## Implementation guidance

Prefer this dependency set:
- `react`
- `vite`
- `typescript`
- `zustand`
- `idb`
- `zod`
- `nanoid`
- `vitest`
- `playwright`
- `@capacitor/core`
- `@capacitor/cli`
- `@capacitor/android`

## Testing

For every engine change:
- Add Vitest tests.
- Use deterministic fixtures.
- Use fixed seeds for generator tests.

For every UI flow:
- Add or update Playwright tests where practical.

## Code structure

Use this structure:

```text
src/engine
src/config
src/state
src/storage
src/sync
src/components
src/screens
src/test
```

The engine layer must remain pure and reusable.
