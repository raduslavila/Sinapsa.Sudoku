# AGENTS.md — Repository Instructions for Coding Agents

This repository is for a Sudoku app built with React, TypeScript, Vite, Capacitor, and a pure TypeScript Sudoku engine.

## Agent operating rules

- Use TypeScript.
- Do not use Java.
- Kotlin is allowed only for Android-native Capacitor plugin work.
- Keep Sudoku engine code platform-independent.
- Add unit tests for all engine changes.
- Run `pnpm typecheck`, `pnpm test`, and `pnpm lint` before finishing.
- Do not add cloud backend code unless explicitly requested.
- Treat Google Play Games cloud save as Android-only.
- Use IndexedDB for first local persistence implementation.
- Keep changes small and verifiable.

## Build commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
```

## Architecture boundary

The engine must not import:
- React
- Zustand
- Capacitor
- Browser APIs
- Android APIs

UI/state/storage/sync layers may import the engine.

## Required testing standard

Every non-trivial logic change needs tests.

Minimum expected test types:
- Unit tests for engine logic.
- Store/reducer tests for game state transitions.
- Repository tests for save serialization/migrations.
- E2E tests for core user flows.

## Definition of done

A task is done only when:
- The code compiles.
- Unit tests pass.
- Lint passes.
- Relevant docs are updated.
- The agent reports exactly which checks were run.
