# Gamify.Life — handoff

Written 2026-09-24, updated at `v0.6.1-settings-themes`. Everything needed is in this repository; nothing lives only on the old machine
except two exported artifacts listed at the very end.

---

## 1. Get it running

```sh
git clone --branch design/character-centered-home https://github.com/Neo-Land/Gamify-Life.git
cd Gamify-Life
pnpm install --frozen-lockfile
cp .env.example .env.local     # guest mode needs no credentials
pnpm dev                        # http://127.0.0.1:3000
```

Node 24+ (26 works), pnpm 11. `corepack` does not exist in Node 25+; install pnpm directly.

Checks, and the order to run them:

```sh
pnpm exec tsc --noEmit     # types
pnpm lint                  # eslint
pnpm exec vitest run       # 101 unit tests, 1 skipped (hosted RLS)
pnpm seed:validate         # content integrity, must pass before committing content
pnpm scene:validate        # avatar/scene manifest
pnpm exec playwright test  # 124 browser tests, desktop + mobile projects
pnpm build                 # production build (runs scene validation first)
```

**Never run `pnpm build` and the browser suite at the same time**, and never on a memory-starved
machine: Playwright launches browsers per worker and the run degrades into timeouts that look like
failures. Two workers is the default in `playwright.config.ts` (`PW_WORKERS` overrides). Pass
`--global-timeout=900000` so a starved run aborts instead of burning hours.

### Read first
`AGENTS.md` — this repo pins **Next 16.3.5**, whose APIs differ from older Next. Read the relevant
page in `node_modules/next/dist/docs/` before writing framework code.
`docs/CONTINUE_HERE.md` — running design log, newest section at the top. It explains *why* the art
and layout are the way they are, including the mistakes already made and reverted.

---

## 2. Where everything is

### The engine (pure, no React)
| Path | What it holds |
| --- | --- |
| `lib/domain.ts` | Zod schemas for state and every command; `initialState()`. `stateSchema` is `version: z.literal(1)` — do not bump it. |
| `lib/progression.ts` | `applyCommand()`, the one authority for state changes: XP, unlocks, levels, quests, gear, placement, windows. Also `myHobbies`/`otherHobbies`. |
| `lib/rewards.ts` | `rewardFor(before, after, result)` → what to celebrate, or null. |
| `lib/readiness.ts` | Is a hobby's required kit recorded. |
| `lib/content.ts` | Parses content JSON, gear, quests, achievements, wardrobe; `startupCost`, `costBadge`, `usd`, `byStartupCost`. |
| `lib/quick-start.ts` | First quest per hobby (two decisions from home to a real action). |
| `lib/window-layout.ts` | App ids, retired-route redirects (`redirectFor`), window clamping. |
| `lib/themes.ts`, `lib/home-scene.ts`, `lib/scene-manifest.ts` | Seasons, scene anchor/constellation reducer, asset manifest the validator checks. |
| `lib/repositories/` | `local.ts` (guest, sessionStorage), `supabase.ts` (cloud), `types.ts` (the interface; a client may never submit a whole snapshot). |

### Content (data, not code)
| Path | What it holds |
| --- | --- |
| `content/hobbies.json` | 10 hobbies: colour, icon, prefix, safety note, verified `resources[]`, `upgrade` range. |
| `content/nodes.json` | 121 skills: tier, type, XP, prerequisites, completion definition. |
| `content/lessons.ts` | `why|steps|mistake` per skill id. **A missing key crashes the app at import.** |
| `content/gear.json` | 51 gear items with cost ranges, borrowable, usedOk, free alternatives. |
| `content/placement.ts` | Check-in questions per hobby and `scorePlacement()`. |

### UI
| Path | What it holds |
| --- | --- |
| `components/desktop.tsx` | The shell: dock, windows, routing (`AppView`), redirects, phone header. |
| `components/character-centered-home.tsx` | Home: character, greeting, weekly chips, quest ribbon, planner dialog. |
| `components/skills.tsx` | `TreePage` (Path / This week / Gear sections) and `NodePage` (skill detail). |
| `components/screens.tsx` | `CharacterPage`, `Closet`, `HobbyQuests`, `HobbyGear`, `Achievements`, `SettingsPage`, `AuthPage`. |
| `components/avatar.tsx` | The paper doll: proportions, poses, layer order, arm clipping, hair shadow. |
| `components/rig-layers.tsx` | Body and clothing geometry per build. |
| `lib/hair.ts`, `lib/headwear.ts` | Hair and hat art as box tables, per view. |
| `components/seasonal-scene.tsx` | The four seasonal scenes. |
| `components/onboarding/` | Four-step wizard: character, hobbies, check-in, start kit. |
| `app/globals.css`, `app/retro.css`, `app/home-scene.css` | Styling. Retro holds the OS chrome. |

### Backend
`app/api/progress/route.ts` (GET state, POST one command, compare-and-swap write),
`app/api/account/route.ts` (DELETE account), `supabase/migrations/*.sql`,
`supabase/seed.sql` (**generated** — run `pnpm seed:sql`, never hand-edit).

### Tests
`tests/*.test.ts(x)` unit; `tests/e2e/*.spec.ts` browser (`actions`, `retro`, `polish`,
`centered-home`, `journey`, `onboarding`, `reward`).

---

## 3. Rules that must not break

1. **XP is earned, never granted.** Onboarding, the check-in, gear choices and skipping award nothing.
2. **Awards are idempotent** — one ledger entry per idempotency key; the SQL mirrors that with a
   unique constraint.
3. **Safety gates cannot be bypassed.** Safety-critical skills gate practice logging; no self-report
   or placement may skip them.
4. **All writes are commands** through `applyCommand`. No `setState` on progress, no client snapshots.
5. **Old saves keep loading.** New fields get `.default(...)`, and **any field with a default must be
   re-declared as a plain optional on the `profile` command** — `.partial()` keeps defaults and will
   silently overwrite real values. This bug has happened twice (character tint, `lastSeenOn`).
6. **Guests are session-only** (`sessionStorage`), never durable storage.
7. **Every skill needs a lesson**, or the app is blank. `pnpm seed:validate` catches it.
8. **No fabricated trust:** content says "curated draft"; costs say "estimates, checked 2026-09".
9. **Cosmetics never affect gameplay**; basic identity options are never locked.
10. **Match the dense house style** — single-line exports, comments only for non-obvious decisions.

---

## 4. What exists today

Four tabs: **Home · Hobbies · Character · Settings** (`v0.5-four-tab-navigation`).
A hobby owns its Path, This week and Gear. Character owns the avatar, stats, equipped items,
achievements and the appearance editor. Planning is a dialog on Home. Retired routes
(`/quests`, `/loadout`, `/achievements`, `/calendar`) redirect, and window state for removed tabs is
dropped on load rather than failing the snapshot.

10 hobbies · 121 skills · 51 gear items · 10 weekly quests · 6 achievements · 170 wardrobe items ·
3 builds (Slim/Medium/Broad) · 4 views · 4 seasonal scenes.

Checkpoint tags: `v0.2-retro-desktop-checkpoint`, `v0.3-hobby-scoped-desktop`,
`v0.4-character-polish`, `v0.5-four-tab-navigation`, `v0.6-mobile-simplification`,
`v0.6.1-settings-themes` (latest, commit `a4018da`).

---

## 5. Verification status, honestly

Passing: types, lint, 101 unit tests, content and scene validation, production build, and each e2e
file when run directly (retro 18, actions 21, onboarding, reward, journey).

**Not achieved on the origin machine:** one clean full-suite run after the last commit. That machine
(8 GB RAM, 2+ days uptime) had ~42 MB free RAM and 3.4 GB in the compressor; browsers paged so badly
that 2 tests took 15 minutes. Earlier the same day the full suite passed in 5.1 minutes on the same
code path after a restart. **First job for whoever picks this up: run the full suite on a healthy
machine and fix anything real that it finds.**

Never verified at all: Supabase against a live project (auth, cloud save, account deletion, two-user
isolation), any deployment, and any real device.

---

## 6. What I would do next, in order

1. Full browser suite on a healthy machine; treat any failure as real until proven otherwise.
2. Deploy somewhere and open it on a phone. Nothing has ever run outside localhost.
3. Guest-to-account saving. Guests lose everything when the tab closes — the single biggest gap for
   showing this to people at the SHPE convention. SAVE PROGRESS currently says so honestly.
4. Verify the cloud path against a throwaway Supabase project.
5. Finish the Gear screen: replace the status dropdown with the three-button control from
   onboarding (Have / Borrow / Need). It is the last text-heavy screen (291 words at 375px).
6. Re-check the RAM price in `content/gear.json` before launch; it was shortage-inflated in 2026.
7. Decide the fate of the `warm` / `contrast` "Desktop theme" select in `SettingsPage`. It only
   redefines six variables in `app/globals.css`; the retro chrome in `app/retro.css` uses its own
   hard-coded palette and ignores them, so the control does almost nothing. Either remove it, or
   build a real high-contrast mode that restyles the OS chrome and holds AA across all four seasons.
   Nothing in the tests depends on it.

### A caution learned the hard way
Disclosure hides things from you too. Folding the display panel behind one summary buried the
seasonal theme picker — the setting people open Settings to find — while leaving a near-inert
control visible. When collapsing a section, check what is left showing above it.

---

## 7. Outside the repository

- `~/Downloads/GamifyLife_Avatar_PNGs.zip` — 918 PNGs exported from the SVG renderer (every item,
  four views, transparent, one canvas). A snapshot: regenerate if the art changes. The export
  scripts were scratch files and were not kept.
- `~/Downloads/GamifyLife_Codex_Product_Brief.md` — the product brief for building this from scratch,
  no code. Only needed for a clean-room rebuild, not for continuing this codebase.

Guest progress lives in `sessionStorage` and is never in git; there is nothing to migrate.
