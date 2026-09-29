# Location Wrapped

**Track → Explore → Remember → Wrapped → Share**

Location Wrapped is a React Native / Expo mobile app that quietly records the places you visit, turns that history into meaningful visits and places, and presents it as a Spotify Wrapped–style story. All location history stays on your device.

## Stack

- Expo SDK 57 + React Native 0.86
- Expo Router, Expo Location, Expo Task Manager
- SQLite (`expo-sqlite`) for on-device persistence
- React Native Maps, sharing, backup export/import

## Development

```bash
npm install
npm start
```

Use a **development build** for real location tracking and maps — not Expo Go:

```bash
npx expo prebuild
npx expo run:android
# iOS requires macOS or the GitHub Actions workflow below
```

Other checks:

```bash
npm run typecheck
npm run verify:stats
npx expo-doctor
```

### Demo mode

Open **Profile → Demo Data** to load a realistic multi-month sample journey (Home, university, gym, restaurants, airport, Houston, Austin, etc.). Demo rows are tagged separately from real GPS history.

---

# Install Location Wrapped on Android

1. Download **`LocationWrapped.apk`** from GitHub Actions (workflow **Build Android APK**) or build locally:
   ```bash
   npx expo prebuild --platform android
   cd android && ./gradlew assembleRelease
   ```
   APK path: `android/app/build/outputs/apk/release/app-release.apk`
2. Copy the APK to your Android phone.
3. Enable **Install unknown apps** for your browser or Files app if prompted.
4. Open the APK and install.
5. Open Location Wrapped and complete onboarding.
6. Grant **location** permissions; for background tracking, also allow **Allow all the time** (wording varies by device).

---

# Install Location Wrapped on iPhone for Free

This app is designed for **personal sideloading** with a **free Apple ID** — no App Store, no TestFlight, and no paid Apple Developer Program membership.

Because you are on **Windows**, the normal workflow is:

**Push code → GitHub Actions builds an unsigned IPA on macOS → download `LocationWrapped.ipa` → AltStore re-signs with your free Apple ID → install on your iPhone**

### 1. Prerequisites

- Windows PC with **AltServer** installed
- iPhone and USB cable (for initial AltStore setup)
- Free **Apple ID**
- GitHub account (to download the workflow artifact)

### 2. Install AltServer on Windows

1. Download AltServer from [altstore.io](https://altstore.io).
2. Install and run AltServer on Windows.
3. Install **iCloud** and **iTunes** from Microsoft Store if AltServer asks for them.

### 3. Install AltStore on your iPhone

1. Connect your iPhone to the PC.
2. From the AltServer tray icon, choose **Install AltStore** → your device.
3. Sign in with your **free Apple ID** when prompted.

### 4. Enable Developer Mode (iOS 16+)

On the iPhone: **Settings → Privacy & Security → Developer Mode → On** (restart if required).

### 5. Download the Location Wrapped IPA

1. Open your repo on GitHub → **Actions**.
2. Run **Build iOS IPA (unsigned)** (or use the latest successful run).
3. Download the **`LocationWrapped-ipa`** artifact (`LocationWrapped.ipa`).

### 6. Install through AltStore

1. Send the IPA to your iPhone (AirDrop, Files, etc.).
2. Open **AltStore → My Apps → +** and select the IPA, **or** open the IPA and choose AltStore.
3. AltStore signs the app with your free Apple ID and installs it.

### 7. Trust the developer profile (if iOS asks)

**Settings → General → VPN & Device Management** → trust your Apple ID developer profile.

### 8. Grant location permissions

1. Open Location Wrapped and finish onboarding.
2. Allow **While Using** first, then **Always** for background visit detection.
3. Confirm **Location Services** are enabled for the app in iOS Settings.

### 9. Free Apple ID signing limits (~7 days)

Apps signed with a free Apple ID typically expire after about **7 days**. Before expiry:

1. Connect the phone to the same Wi‑Fi as AltServer (or refresh via AltStore’s refresh mechanism).
2. Open **AltStore** and refresh **Location Wrapped**.

Your **SQLite database lives in the app sandbox**. Refreshing/re-signing usually **keeps data** if the bundle ID stays the same (`com.locationwrapped.app`). Reinstalling from scratch may wipe data — use **Profile → Export backup** first.

### 10. Updating to a newer build

1. Export a backup in the app (recommended).
2. Install the newer IPA via AltStore (same bundle ID).
3. Import backup if iOS replaced the app container.

### Background location on free provisioning

Always/background location is a real iOS capability, but free personal provisioning can be stricter than paid teams. The app still works with **foreground tracking** if background is denied. The UI explains what is missing and never pretends permissions are granted.

---

## Cloud build artifacts

| Platform | Workflow | Artifact |
|----------|----------|----------|
| Android | `.github/workflows/build-android.yml` | `app-release.apk` |
| iOS | `.github/workflows/build-ios.yml` | `LocationWrapped.ipa` (unsigned; sign with AltStore) |

No Apple IDs, passwords, or signing certificates are stored in the repo.

---

## Privacy

- **Your location history stays on your device.**
- Pause/resume tracking, delete history, reset app, inspect counts, export/import JSON backup.
- Demo data is clearly labeled and can be toggled off.

---

## Project layout

```
src/
  app/           Expo Router screens
  components/    UI building blocks
  constants/     theme, categories, tracking
  data/          demo dataset generator
  hooks/         app data + tracking lifecycle
  services/      tracking, backup, demo, processing
  storage/       SQLite access
  tasks/         background location task (TaskManager)
  types/         shared TypeScript types
  utils/         geo, visits, stats, formatting
```

---

## License

See `LICENSE`.
