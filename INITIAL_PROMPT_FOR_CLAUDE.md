# Initial prompt to give Claude Code

You are inside a new empty repository. Read `CLAUDE.md`, `AGENTS.md`, and the files under `.claude/skills`.

Build the Sudoku app according to the repository instructions.

Start with Milestone 0 and Milestone 1 only:
1. Initialize a Vite React TypeScript app using pnpm.
2. Add Vitest, Playwright, ESLint, Capacitor Android dependencies.
3. Create the folder structure from `CLAUDE.md`.
4. Implement the pure Sudoku engine foundation:
   - types
   - grid helpers
   - validator
   - candidates
   - solver
   - serializer
5. Add unit tests for the engine foundation.
6. Do not build the full UI yet.
7. Do not add Google Play Games yet.
8. Do not write Java.
9. Run:
   - pnpm typecheck
   - pnpm test
   - pnpm lint

After finishing, summarize the files created and the checks run.
