# Control Center app (Sahara Bazaar)

One codebase that runs as an **Android app, an iPhone app, a web app and an installable desktop app**.
Built with Expo SDK 58 (React Native 0.88, React 19, TypeScript) and Expo Router. See `../ARCHITECTURE.md`.

## Phase 1: Cash control (built)
- **PIN sign-in**: pick your name, 4-digit PIN. Each role sees only its own screens.
- **Cashier** (phone/counter tablet): start shift → confirm float handed over → cash out with reason → **Close shift** in steps: count notes (+/−) → POS totals → green **All good** or red **Short ₹x** with a tap-to-choose reason → locked.
- **Supervisor / manager / owner**: red shifts with **Accept / Review bills / Escalate**. Above the ₹ ceiling, escalated, or undecided after the timeout → owner only. WhatsApp message ready for the right person.
- **Owner Home**: today's counter sales, variance, cash to cash room, "Needs your decision", counters right now, week chart.
- **Cash board**: today's shifts, variance board per cashier this month (repeat-red flag), history.
- **Settings** (owner): money limits and rules, team list, activity log of every action.
- Works offline: everything is saved on the device. Hindi under every staff label.

Demo PINs: Anil 0000 · Mohit 1111 · Meena (cash supervisor) 0006 · Sneha 0010 · Farhan 0011 · Ravi 0012.

## Run
```bash
npm install
npx expo start          # scan the QR code with Expo Go, or press w for web
npm run typecheck
npm run build:web       # static web build in dist/
```

## Make the app files
```bash
npm run build:apk       # Android APK you can install directly (needs a free Expo account)
npm run build:ios       # iPhone build for TestFlight / App Store (needs an Apple Developer account)
```

## Layout
```
src/app/            screens (Expo Router): sign-in, (app)/index (Home), (app)/cash, (app)/cash/close, (app)/settings
src/lib/            rules.ts (all business rules), store.ts (state + offline storage), seed.ts (demo data), types.ts
src/ui/             design system (kit.tsx, theme.ts, Icon.tsx), app shell, cash components
supabase/           database schema + access rules for the shared cloud database (next step)
```

## Next
1. Connect Supabase so all phones share live data. The schema is ready in `supabase/migrations`.
2. eFacto import for POS totals (read-only).
3. WhatsApp Business API for automatic red-shift alerts.
4. Phase 2 screens: Tick Card, Floor Board, F&V Day Sheet.
