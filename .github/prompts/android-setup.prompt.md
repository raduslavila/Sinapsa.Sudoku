# /android-setup

Set up Android packaging with Capacitor.

Scope:
- Add/update Capacitor config.
- Sync Android project.
- Verify Android project builds as far as possible.
- Do not add Java.
- Prepare Kotlin plugin skeleton only if needed.

Run:
```bash
pnpm build
npx cap sync android
```

Report:
- Android package name.
- Capacitor config.
- Any manual Android Studio steps needed.
