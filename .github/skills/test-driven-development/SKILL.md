---
name: test-driven-development
description: Use when implementing core logic, reducers, persistence, conflict resolution, or bug fixes.
---

# Test-Driven Development Skill

## Process

1. Identify expected behavior.
2. Add or update tests.
3. Run tests and confirm failure if practical.
4. Implement the smallest correct change.
5. Run tests again.
6. Refactor without changing behavior.
7. Run typecheck and lint.

## Rules

- Do not skip tests for engine logic.
- Use deterministic fixtures.
- Prefer small tests over broad brittle tests.
- Tests should describe behavior, not implementation details.
- Avoid mocking pure engine functions.

## Required checks

```bash
pnpm typecheck
pnpm test
pnpm lint
```

For UI flows:

```bash
pnpm test:e2e
```
