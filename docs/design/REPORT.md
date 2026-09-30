# Retro reskin — report

Branch `design/retro-reskin`, from `v0.8-tree-focus` (`ccd270e`). Brief: `docs/GamifyLife_Retro_Reskin_Handoff.md`. Audit and inventory: `docs/design/audit.md`.
Screenshots: `docs/design/screens/before/` and `docs/design/screens/after/`, 14 surfaces × 375 / 1280, both made by `pnpm exec tsx scripts/screens.mts before|after` against `pnpm dev`.

## How it is built

- **One stylesheet, loaded last.** `app/reskin.css` restyles the existing class names (`.mac-window`, `.app-window`, `.modal`, `.titlebar`, `.button`, inputs, `.closet-tabs`, `.segmented`, `.xp-track`, `.os-dock`, …). Markup and test selectors stay put.
- **Tokens.** The brief's palette became the `sage` colourway in `retro.css`. The other four colourways keep their own `--os-*` values and pick up the new frames automatically.
- **Font.** VT323 comes through `next/font`, self-hosted. `font-size-adjust: ex-height .6` makes every hard-coded size about 1.25× larger than it was in Pixelify, so the type ramp scaled without touching hundreds of rules. Long lesson prose stays in `system-ui`.
- **Sprites.** The art lives in `lib/sprites.ts` as letter maps with the reference palette, and renders as SVG, one path per colour. That keeps it server-safe with no canvas. `<PixelSprite>` draws the icons. `scripts/ui-frames.mts` writes the 9-slice frame files to `public/ui/*.svg` plus the app icon, which works as the "build-time frames" option.
- **CRT.** The existing `scanlinesEnabled` preference ("Disable screen texture") is the CRT switch. `html[data-texture]` drives it in pure CSS: scanlines, shadow mask, vignette, flicker and the roll bar. The `#crtGlow` SVG filter sits on the scene at 1024px and wider. The menu-bar TV button toggles it. No schema change.
- **Wallpaper.** `components/wallpaper.tsx` uses Pixi v7, the reference's API. It sits behind boot, login, setup and auth, tinted per season, and is built at idle time. Blurred layers are baked into textures once, so each frame is nine sprites plus one dither pass, capped at 12fps.

## Checklist

| Surface | Status |
|---|---|
| Tokens, VT323, frames, sprites | Done |
| Window, button, inputs, select, checkbox, radio, tabs, progress, badge, empty, dialog backdrop | Done, restyled in place (no new component layer; see decisions) |
| Taskbar (dock) with pixel icons and a `!` badge for an open pinned quest | Done; all four dock edges kept |
| CRT overlay, glow, screen-effects toggle (menu bar and Settings) | Done |
| Pixi wallpaper with dither shader and seasonal tint | Done for the entry screens; the home keeps its SVG seasonal scene (see deferred) |
| Boot (typed BIOS text), login | Done |
| Setup as an installer | Done |
| Character creator, appearance editor | Done; the paper doll is untouched, only framed |
| Home desktop, HUD, constellation (hobby-colour rims) | Done |
| Skill tree: sunken canvas, grid, mini-window nodes, stepped edges (dotted when locked), pixel controls | Done |
| Quests as messenger (This week), `!` on the hobby switcher | Done |
| Gear as inventory (Loadout no longer exists) | Done |
| Settings and character as a control panel, achievements | Done |
| Reward and level-up toasts as small windows | Done |
| Loading, error, empty states | Done |
| Favicon, `theme-color`, manifest | Done |
| 404 page | Deferred (see below) |
| Sound | Uses the existing `sound` preference (default off); the XP beep became the reference's two-note chime |

## Decisions and deviations from the brief

- **No `components/ui/retro/*` layer.** About 40 e2e selectors target the existing classes, and `.button` alone appears in 65 places. Restyling the classes reskins everything without churning markup or tests. Agreed at the audit.
- **No `crtEffects` field.** `scanlinesEnabled` already existed, already persisted through the profile command, and already had a Settings checkbox that the tests click. Its preference test is in `tests/preferences.test.ts`.
- **Window positions are still persisted.** The brief suggested session-only positions, but persistence is an existing feature, and the pass is visual only.
- **Seasonal control accents are kept.** They now show as the title-bar underline, the pressed-button colour and the focus ring.
- **Title bars step darker where the text sits,** so white text holds 4.5:1 against its background.

## Deferred

- **404.** `app/[[...path]]/page.tsx` renders the desktop for every path. A not-found page would change routing, which is out of scope for a visual pass.
- **Pixi on the home desktop.** The home is a full-bleed SVG seasonal scene, and a canvas behind it would be invisible. The scene gets the glow and the CRT overlay, but not the dither shader. It is authored pixel art, and posterising it degraded it. Follow-up if wanted: render the scene into Pixi.
- **Tooltip component.** The app has no custom tooltips, only `title` attributes, so there was nothing to restyle. The yellow sticky-note style is used on the home greeting and on START HERE.
- **Emoji left in place.**
  - Hobby emoji inside page-heading strings (`PageHeading` takes a string title).
  - Achievement icons, which are content data.
  - Glyphs inside real text such as "✓ Complete this week", which a test matches on.
- **Lesson prose font.** Multi-paragraph lesson bodies use `system-ui` for readability, as the brief allowed.

## Gate

| Check | Baseline (`v0.8-tree-focus`) | Final |
|---|---|---|
| `seed:validate` | OK | OK (121 lessons, 10 hobbies) |
| `typecheck` | clean | clean |
| `lint` | 0 errors, 6 warnings | 0 errors, 5 warnings (all pre-existing, in test files) |
| `test` (unit) | 102 passed, 1 skipped | 106 passed, 1 skipped (+3 sprite checks, +1 screen-effects preference) |
| `test:e2e` | 120 passed, 2 failed, 2 skipped | 120 passed, 2 failed, 2 skipped (the same journey test on both projects; its desktop run passed in 5 of the 9 per-commit runs) |
| `build` | OK | OK |

The one e2e failure is `journey.spec.ts` "mobile journey and accessible primary screens". It fails the same way on the untouched tag: `.skill-tree-panel` intercepts the click on the tree node. It always fails on mobile and sometimes on desktop, and a separate task was suggested for it.

`polish.spec.ts` "painted avatar layers…" on mobile failed in 3 of 9 full-suite runs. It never failed on its own (0 of 15 runs, including 4× under doubled workers), so the flake is load-dependent hover timing. The reskin did cause one real, reproducible failure in that test: the hover hint pushed the character down under the pointer. That was fixed by overlaying the hint.

## Lighthouse (production build, `node scripts/lighthouse.mjs`)

Both routes render the login screen without a session, in both the baseline and the final build.

| Route | Before | After |
|---|---|---|
| `/home` | 0.90 / 0.92 / 0.92 | 0.88 / 0.89 / 0.89 / 0.90 |
| `/hobbies/tennis` | 0.92 / 0.92 / 0.93 | 0.89 / 0.89 / 0.89 / 0.89 |
| Accessibility | 0.98 (`landmark-one-main`) | 0.98 (`landmark-one-main`) |

Both routes are within the 5-point budget. The boot screen's old `label-content-name-mismatch` is fixed: the skip control is now a labelled button.

**Correction:** the "performance 1.00" in the commit 5 message is wrong. A stale `next start` from the baseline run was still holding port 3001, so those runs measured the old build. The numbers above come from the real final build. Two fixes brought `/home` back within budget: restoring the 1.4s boot, and building the wallpaper at idle time.

## DOM and selector changes

No test file was edited, apart from one new unit test in `tests/preferences.test.ts` and the new `tests/sprites.test.ts`.

- Window title-bar buttons, the dialog close button, the phone back and close buttons, and the reward dismiss button now hold an `<svg>` sprite instead of a text glyph. Their accessible names are unchanged.
- Boot: the whole-screen `<button>` became a `<div>` holding an `aria-hidden` BIOS log and a real button, "Skip boot animation · any key". Any key now skips, not only Enter or Escape.
- Appearance editor: the hover hint is absolutely positioned instead of pushing the preview down.
- Menu bar: a new "Screen effects" toggle button (`aria-pressed`).
- Reward toast: a new `aria-hidden` title line.
- Skill-tree edges went from `smoothstep` to `step`, and locked edges use a `2 4` dash.

## Files

New:
- `app/reskin.css`
- `lib/sprites.ts`
- `components/pixel-sprite.tsx`
- `components/wallpaper.tsx`
- `scripts/ui-frames.mts`
- `scripts/screens.mts`
- `public/ui/*.svg`
- `tests/sprites.test.ts`

New dependency: `pixi.js@7.4.3`. It is loaded only through a dynamic import on the entry screens.
