# Development Build — Run on Phone & When to Rebuild

A practical guide for the **Grip On Trip** app (Expo SDK 57). It covers how to run
the app on your phone after building, and — importantly — when you need to make a
new build versus when you can just reload.

---

## TL;DR

- **Build once, run many times.** After the first build is installed on your phone,
  you normally **never rebuild** for day-to-day work.
- Editing JavaScript / TypeScript / styles / images / API code → **no rebuild.**
  Just run the dev server and your changes hot-reload instantly.
- Only **adding or changing native code** (a new native module, an `app.json`
  native config change) needs a **new build**.

---

## 1. After the build finishes — how to run it on your phone

When `eas build --profile development --platform android` completes, EAS gives you a
**build page URL + QR code** and the APK (Android app file).

### First time: install the app on your phone

1. On your Android phone, open the build URL (or scan the QR from the build result).
2. Download the **APK** and tap it to install.
   - If prompted, allow **"Install from unknown sources"** for your browser.
3. You now have an app called **Grip On Trip** on your phone. This is your custom
   dev client — it replaces Expo Go for this project.

> You only do this install step again if you make a *new* build (see Section 3).

### Every time you want to work: start the dev server

On your PC, in `C:\Users\QCS\Desktop\App`:

```bash
npx expo start --dev-client
```

Then on your phone:

- Open the **Grip On Trip** app.
- It shows the running dev server → tap it to connect (or scan the QR in the terminal).
- Your app loads. Edit code on your PC and it **hot-reloads** on the phone.

If your phone and PC are **not on the same Wi‑Fi** (or it won't connect):

```bash
npx expo start --dev-client --tunnel
```

---

## 2. Do I have to rebuild every time I make changes? — NO

This is the most important thing to understand. A development build is split into two parts:

| Part | What it is | Changes here need... |
|------|------------|----------------------|
| **Native shell** (the installed app) | Compiled native code + list of native modules | A **new build** |
| **JavaScript bundle** (your app code) | Everything you write in `src/` | Just a **reload** — no build |

Almost all your work is JavaScript/TypeScript, so **most changes need no rebuild.**

### ✅ Changes that DO NOT need a rebuild (just reload)

- Editing any `.ts` / `.tsx` / `.js` / `.jsx` file in `src/`
- Screens, components, navigation/routing (`src/app/…`)
- Styling with NativeWind / Tailwind (`className`)
- API calls, React Query hooks, Zustand stores
- Text, logic, images, fonts already bundled
- Installing a **JS-only** npm package (e.g. a date library, `zod`, `axios`)

For these: save the file → the app hot-reloads automatically. If it doesn't,
shake the phone (or press `r` in the terminal) to reload manually.

### 🔁 Changes that DO need a NEW build

You must run `eas build --profile development --platform android` again only when:

- You **add a native module** (a package with native code), e.g.
  `expo-camera`, `expo-location`, `react-native-maps`, `expo-notifications`.
- You change **native configuration** in `app.json`, e.g. the app `name`,
  `package`/`bundleIdentifier`, icon, splash screen, permissions, or a config
  plugin.
- You change the **Expo SDK version** or upgrade native dependencies.

A quick rule of thumb: **if a change would alter the compiled app itself, rebuild.
If it only changes the JS you write, just reload.**

> Tip: after installing a new native module, Expo often warns you that a new
> development build is required. That's your signal to rebuild.

---

## 3. Making a new build (when you actually need one)

```bash
# 1. (only if not logged in)
npx eas-cli login

# 2. build a fresh dev APK in the cloud (~10–20 min)
npx eas-cli build --profile development --platform android

# 3. install the new APK on your phone (same as Section 1, first-time steps)
```

Then go back to the normal `npx expo start --dev-client` workflow.

---

## 4. Quick command reference

| Task | Command |
|------|---------|
| Start dev server (daily) | `npx expo start --dev-client` |
| Start with tunnel (different network) | `npx expo start --dev-client --tunnel` |
| Reload the app | Press `r` in terminal, or shake phone |
| Open dev menu on phone | Shake the phone |
| Make a new dev build (only when native changes) | `npx eas-cli build --profile development --platform android` |
| Log in to Expo | `npx eas-cli login` |

---

## 5. Common questions

**Q: I added a screen / changed a button. Rebuild?**
No. That's JavaScript — just save and it reloads.

**Q: I ran `npm install some-library`. Rebuild?**
Only if the library has native code. Pure-JS libraries: no. If unsure, try running
the app — if it errors about a missing native module, rebuild.

**Q: The app won't connect to the dev server.**
Make sure phone + PC are on the same Wi‑Fi, or use `--tunnel`. Check the PC's
firewall isn't blocking Node.

**Q: Can I still use Expo Go instead?**
Not reliably for this project — it's on SDK 57 and the store Expo Go often lags,
which caused the "incompatible" error. The dev build avoids that permanently.

**Q: Is this build for the Play Store?**
No. The `development` build is for testing only. For a release you'd make a
`production` build (`eas build --profile production --platform android`).
