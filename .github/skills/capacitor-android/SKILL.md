---
name: capacitor-android
description: Use when working on Android packaging, Capacitor config, Kotlin plugin bridge, or Google Play Games integration.
---

# Capacitor Android Skill

## Rules

- Do not write Java.
- Kotlin is allowed for native Android bridge code.
- Keep Android-specific code outside the Sudoku engine.
- The web app should call Android features through TypeScript adapter interfaces.
- Provide a web/mock implementation for browser builds.

## Capacitor bridge design

Expose native features through a small TypeScript interface.

Example:

```ts
export interface PlayGamesAdapter {
  signIn(): Promise<{ success: boolean; playerId?: string }>;
  isSignedIn(): Promise<{ signedIn: boolean }>;
  saveGame(snapshotName: string, payload: string): Promise<void>;
  loadGame(snapshotName: string): Promise<{ payload?: string }>;
}
```

## Google Play Games

Treat Google Play Games cloud saves as Android-only.

Do not claim Saved Games/Snapshots are browser-native.

## Checks

After Android changes:

```bash
pnpm build
npx cap sync android
```

If Gradle or Android Studio steps are required, document them clearly.
