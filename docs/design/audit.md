# Retro reskin — §0 audit

Branch `design/retro-reskin` from `v0.8-tree-focus` (`ccd270e`). Baseline: 102 passed / 1 skipped.
Before screenshots: `docs/design/screens/before/` (14 surfaces × 375 / 1280, made by `scripts/screens.mts`).

## Styling setup

- Three global stylesheets imported by `app/layout.tsx`, in override order: `globals.css` (Tailwind import + base tokens `--canvas`, `--ink`, hobby colours), `retro.css` (the Mac OS skin: `--os-*` palette, five colourways, Pixelify Sans font, most component rules), `home-scene.css` (home desktop).
- No CSS modules, almost no Tailwind utilities in markup. Styling is by semantic class names.
- Tokens: `--os-*` in `retro.css :root`, redefined per `[data-colorway=blue|rose|pink|butter]`. Per-season control accents come from `lib/themes.ts → themeControlAccents` as inline `--control-*` vars on `.os-desktop-shell`.
- Font: `Pixelify` via `@font-face` from `public/fonts/PixelifySans.ttf`; body text is system sans.

## Screens / routes (all rendered by `app/[[...path]]/page.tsx` → `components/app.tsx`)

| Surface | Route | Component |
|---|---|---|
| Boot | any, first load | `BootSequence` in `entry.tsx` |
| Login | `/` (no session) | `LoginDialog`, `EntrySparkle` in `entry.tsx` |
| Setup wizard (4 steps) | `/` (onboarding incomplete) | `onboarding/wizard.tsx`, `character-step`, `hobby-step`, `kit-step`, `placement-step`, `character-creator.tsx` |
| Home desktop | `/home` | `desktop.tsx` (`DesktopShell`), `character-centered-home.tsx`, `character-stage.tsx`, `hobby-constellation.tsx`, `seasonal-scene.tsx`, `quick-start.tsx`, `calendar.tsx` (PLAN A SESSION dialog) |
| Hobbies list | `/hobbies` | `dashboard.tsx` (`HobbiesPage`), `more-hobbies.tsx` |
| Hobby path (tree) | `/hobbies/:id` | `skills.tsx` (`TreePage`), `skill-canvas.tsx`, `skill-card.tsx` (React Flow) |
| This week (quests) | `/hobbies/:id/week` | `HobbyQuests` in `screens.tsx` |
| Gear (was Loadout) | `/hobbies/:id/gear` | `HobbyGear` in `screens.tsx` |
| Node detail | `/hobbies/:id/nodes/:node` | `skill-map.tsx`, `practice-modal.tsx` |
| Character + achievements | `/character` | `CharacterPage` in `screens.tsx` |
| Appearance editor | `/character/appearance/:slot` | `appearance-editor.tsx`, `item-preview.tsx`, `body-selector.tsx` |
| Settings | `/settings` | `SettingsPage` in `screens.tsx`, `desktop-preferences.tsx`, `theme-settings.tsx` |
| Auth | `/auth/sign-in`, `/auth/sign-up`, `/auth/callback` | `AuthPage` in `screens.tsx` |
| Reward / level-up toast | overlay | `reward-overlay.tsx` (`.reward-toast`) |
| Retired routes | `/quests`, `/loadout*`, `/achievements`, `/calendar` | redirect via `lib/window-layout.ts` |
| 404 | none | catch-all route renders the desktop for every path; there is no not-found or `error.tsx` |

## Choke points

| What | Where | Call sites |
|---|---|---|
| Content window | `Window` in `components/ui.tsx` → `.mac-window .titlebar` | 21 |
| App window (draggable, resizable, min/max/close) | `RetroWindow` in `desktop.tsx` → `.app-window .window-titlebar` | 1 (all apps) |
| Dialog | `Modal` in `ui.tsx` (Radix) → `.modal .modal-overlay` | 9 |
| Button | CSS class `.button` (+ `primary`, `danger`, `small`, `full`), plus `.text-button`, `.icon-button` | 65 / 14 / 3 |
| Progress bar | `XpBar` in `ui.tsx` → `.xp-track` | 13 |
| Empty state | `Empty` in `ui.tsx` | 14 |
| Page header | `PageHeading` in `ui.tsx` | 10 |
| Dock | `.os-dock` in `desktop.tsx` (top/bottom/left/right, bottom on <900px) | 1 |
| Menu bar | `.os-menubar` in `desktop.tsx` (power menu, HUD, clock) | 1 |
| Monitor bezel | `RetroComputerFrame` in `computer-frame.tsx` | 1 |
| Tabs | `.closet-tabs` (creator/appearance), `.segmented` (Path / This week / Gear), hobby tab row in `skills.tsx` | 2 / 3 / 1 |
| Inputs | bare `<input>` ×19, `<select>` ×10, `<textarea>` ×2, checkboxes ×14 (styled globally in `retro.css`) | — |

## Icon sources

- `PixelIcon` (`pixel-icon.tsx`): 24px SVG app icons for home, hobbies, character, settings (dock + window title).
- lucide-react in `ui.tsx` (X), `skills.tsx`, `skill-card.tsx`, `dashboard.tsx`, `screens.tsx`: Check, Lock, Star, ArrowLeft/Right/UpRight, Network, List, ShieldCheck, Clock, BookOpen, Pin, Download, Monitor.
- Text glyphs as icons: ✦ ×12, ✓ ×10, × ×7, □ ×5, ■ ×4, ✧ ×3, ☆ ◇ ○ ▶ ▣ ×2, ◢ ⏻ ‹ ▼.
- Emoji hobby icons (🎾 🚲 🏊 📔) from `content/hobbies.json`, shown in hobby tabs and chips.

## Background / scene layers

- `seasonal-scene.tsx`: full-bleed, deterministic SVG pixel landscape per season (spring/summer/fall/winter), with particles; this *is* the home desktop.
- `seasonal-wallpaper.tsx`: layered SVG files from `public/themes/*` for the theme picker minis.
- `EntrySparkle`: drifting motes behind login.
- `.computer-screen` scanline texture, controlled by `profile.scanlinesEnabled`.

## Preferences that already exist (`lib/domain.ts` profileSchema)

`scanlinesEnabled` ("Disable screen texture"), `sound`, `reducedMotion`, `bootAnimationEnabled`, `largerText`, `colorway`, `themeId`, `animationIntensity`, `dockPosition`. Window positions are already persisted per app in `state.windows`.

## Tests that pin the DOM

The e2e suites select by about 40 existing class names (`.os-dock`, `.desktop-surface`, `.reward-toast`, `.skill-card`, `.react-flow__node`, `.settings-section > summary`, `.quest-grid .mac-window`, `.computer-frame`, `.closet-item`, …) and by the labels "Disable screen texture", "Skip boot animation", "Larger text". No test asserts colours or fonts; no visual snapshots.

## Lighthouse baseline (production build, `node scripts/lighthouse.mjs`, 3 runs)

| Route | Performance | Accessibility |
|---|---|---|
| `/home` (login screen, no session) | 0.90 / 0.92 / 0.92 | 0.98 (`landmark-one-main`) |
| `/hobbies/tennis` | 0.92 / 0.92 / 0.93 | 0.98 (`landmark-one-main`) |

## Decisions (agreed with Neo)

- Restyle the existing class choke points in place; keep class names so e2e selectors hold.
- The existing `scanlinesEnabled` preference is the CRT switch; the taskbar TV button toggles it. No schema change.
- Keep every existing feature: five colourways (sage becomes the brief's palette, the others tint it), dock on any edge, persisted window positions, the seasonal scene, the boot toggle.
- PixiJS wallpaper goes where nothing covers it: behind the boot, login and setup screens, tinted by season. The home desktop keeps its SVG seasonal scene with a CSS/SVG dither and glow treatment.
- Type ramp scaled up as far as the 320×568 home test allows.
- No 404 page: the catch-all route renders the desktop for every path, and adding one would change routing.
