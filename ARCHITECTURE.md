# Control Center: App Architecture (app-store ready)

**Requirement (from Anil):** one system that is very fast, uses current technology, and can become an **Android app (APK / Play Store)**, an **iPhone app (App Store)**, a **web app**, and a **laptop/PC app** at any time, without rebuilding.

## Decision: one codebase → every platform

```
                 ┌─────────────────────────────────────────────┐
                 │   ONE CODEBASE (TypeScript + React Native)  │
                 │   Expo  ·  Expo Router  ·  react-native-web │
                 └───────┬───────────┬───────────┬─────────────┘
                         │           │           │
                  Android app    iPhone app    Web app ──► Desktop (installable PWA;
                  APK / AAB      IPA            browser      .exe/.dmg via Tauri if needed)
                  Play Store     App Store
                         │           │           │
                 ┌───────┴───────────┴───────────┴─────────────┐
                 │  Offline-first local store (SQLite on device)│
                 └───────────────────────┬─────────────────────┘
                                         │ sync when online
                 ┌───────────────────────┴─────────────────────┐
                 │ Supabase: Postgres DB · Auth (PIN/phone) ·   │
                 │ Realtime · File storage (proof photos) ·     │
                 │ Edge Functions (WhatsApp, eFacto import,     │
                 │ 9 PM summary, AI drafts) · Audit log         │
                 └─────────────────────────────────────────────┘
```

| Layer | Choice | Why |
|---|---|---|
| App framework | **Expo (React Native) + TypeScript**, latest stable SDK | One code → Android, iOS and web. Real native apps (not a website in a frame): fast, camera, push notifications |
| Navigation | **Expo Router** (file-based) | Same screens and URLs on phone and web |
| Design system | Own tokens from `design/index.html` (colours, radius, type), shared components | The approved Apple-style look, identical on every device |
| Data on device | **SQLite (expo-sqlite)** + TanStack Query | Works on weak store Wi-Fi: counts, ticks and shift forms save offline, then sync |
| Backend | **Supabase** (Postgres, Auth, Realtime, Storage, Edge Functions) | Fast, scalable, row-level security per role, live Floor Board updates |
| Device features | expo-camera (proof photos), expo-notifications (push), expo-local-authentication (fingerprint/face on own phones), PIN on shared tablets | Everything the blueprint needs |
| Messaging | WhatsApp Business API via Edge Functions | Red-shift alerts, task reminders, 9 PM summary |
| eFacto | Read-only import (export/CSV) via Edge Function | As agreed in the blueprint guardrails |
| Builds | **EAS Build** | One command makes an **APK** (install directly), **AAB** (Play Store), **IPA** (App Store / TestFlight) |
| Updates | **EAS Update** (over-the-air) | Fixes and new screens reach every phone in minutes, without a new store release |
| Desktop | Installable web app (PWA) on Windows/Mac; Tauri wrapper for `.exe`/`.dmg` if wanted | Same code |

## "Give me the app file now": what it takes
| You ask for | Command | Time | Needs |
|---|---|---|---|
| Android APK (install on any Android phone directly) | `eas build -p android --profile preview` | ~10–20 min | Free Expo account |
| Play Store app | `eas build -p android` + `eas submit -p android` | Same day, then Google review | Google Play developer account (one-time US$25) |
| iPhone app | `eas build -p ios` + `eas submit -p ios` → TestFlight / App Store | Same day, then Apple review | Apple Developer account (US$99/year). Apple does not allow installing an app file directly like an APK; iPhones install through TestFlight or the App Store |
| Laptop/PC | Open the web link → "Install app"; or Tauri build for `.exe` / `.dmg` | Minutes | Nothing extra |

## Speed rules
- Screens open from local data first, then refresh in the background, so they show instantly.
- Photos are compressed on the phone before upload (~50 KB).
- Lists are virtualised, so 18 departments and thousands of shifts still scroll smoothly.
- Only the screens a role uses are loaded.
- Database indexes on date, person, department and counter; heavy reports run on the server.

## Security
- Role-based access in the database (row-level security): a cashier can only read and write their own shifts.
- Locked records (closed shifts, accepted reds) cannot be edited except by the owner, and every change is in the audit log.
- PIN for shared tablets; fingerprint/face on personal phones.

## Project layout (planned)
```
app/                  # Expo Router screens: (owner) (manager) (cashier) (staff) per role
  (auth)/pin.tsx
  home.tsx  cash/  floor/  tasks/  fv/  reports/  settings/
components/           # Design system: Card, StatTile, Pill, BigButton, Stepper, Table…
lib/                  # rules: shiftCalc, escalation, scoring, reorder (ported from the prototype)
db/                   # local SQLite schema + sync
supabase/             # SQL migrations, row-level security policies, edge functions
design/               # approved design samples
```

## Migration from the current prototype
The current `control-center/index.html` is a single-file pilot. It proves the logic: shift maths, red-shift rules, escalation, scoring and the 9 PM summary. That logic moves into `lib/` almost line for line. The screens are rebuilt with the approved design. Pilot data can be imported from its JSON backup.

## Accounts needed (owner's name, not the developer's)
1. Supabase project (free to start; paid plan when live)
2. Expo account (free)
3. Google Play developer (US$25 one-time), when publishing to the Play Store
4. Apple Developer (US$99/year), when publishing to iPhone
5. WhatsApp Business API provider
