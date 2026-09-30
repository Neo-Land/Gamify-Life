# Retro reskin — report

Branch `design/retro-reskin`, from `v0.8-tree-focus` (`ccd270e`). Brief: `docs/GamifyLife_Retro_Reskin_Handoff.md`. Audit and inventory: `docs/design/audit.md`.
Screenshots: `docs/design/screens/before/` and `docs/design/screens/after/`, 14 surfaces × 375 / 1280, both made by `pnpm exec tsx scripts/screens.mts before|after` against `pnpm dev`.

## How it is built

- **One stylesheet, loaded last.** `app/reskin.css` restyles the existing class names (`.mac-window`, `.app-window`, `.modal`, `.titlebar`, `.button`, inputs, `.closet-tabs`, `.segmented`, `.xp-track`, `.os-dock`, …). Markup and test selectors stay put.
- **Tokens.** The brief's palette became the `sage` colourway in `retro.css`. The other four colourways keep their own `--os-*` values and pick up the new frames automatically.
- **Font.** VT323 comes through `next/font`, self-hosted. `font-size-adjust: ex-height .6` makes every hard-coded size about 1.25× larger than it was in Pixelify, so the type ramp scaled without touching hundreds of rules. Long lesson prose stays in `system-ui`.
- **Sprites.** The art lives in `lib/sprites.ts` as letter maps with the reference palette, and renders as SVG, one path per colour. That keeps it server-safe with no canvas. `<PixelSprite>` draws the icons. `scripts/ui-frames.mts` writes the 9-slice frame files to `public/ui/*.svg` plus the app icon, which works as the "build-time frames" option.
- **CRT.** The existing `scanlinesEnabled` preference ("Disable screen texture") is the CRT switch. `html[data-texture]` drives it in pure CSS: scanlines, shadow mask, vignette, flicker and the roll bar. The `#crtGlow` SVG filter sits on the scene at 1024px and wider. The menu-bar TV button toggles it. No schema change.
- **Wallpaper (brief v2, §2.6).** The old seasonal scene is replaced by the reference's four Pixi v7 scenes, ported from `docs/design/retro-reference.html` into `lib/wallpapers/*.ts`: Spring Meadow, Autumn Hills, City Nights and Summer Beach. Each is a builder taking a shared kit with the same seeded RNG, helpers, colours and updaters. `components/scene-wallpaper.tsx` runs them behind the home desktop, with the scene under the CRT/dither shader and Neo's chrome surfboard (`lib/wallpapers/surfboard.ts`) outside it. The DOM character rides the board's bob and roll. See the wallpaper section below.

## Checklist

| Surface | Status |
|---|---|
| Tokens, VT323, frames, sprites | Done |
| Window, button, inputs, select, checkbox, radio, tabs, progress, badge, empty, dialog backdrop | Done, restyled in place (no new component layer; see decisions) |
| Taskbar (dock) with pixel icons and a `!` badge for an open pinned quest | Done; all four dock edges kept |
| CRT overlay, glow, screen-effects toggle (menu bar and Settings) | Done |
| Reference wallpapers (4 scenes, seeded, dither shader) replacing the seasonal scene | Done |
| Chrome surfboard under the character, crisp outside the shader | Done; anchored to the character's layout position (see below) |
| Display Properties window (preview, list, OK / Cancel / Apply) in the tray, `wallpaper` preference | Done |
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
- **Tooltip component.** The app has no custom tooltips, only `title` attributes, so there was nothing to restyle. The yellow sticky-note style is used on the home greeting and on START HERE.
- **Emoji left in place.**
  - Hobby emoji inside page-heading strings (`PageHeading` takes a string title).
  - Achievement icons, which are content data.
  - Glyphs inside real text such as "✓ Complete this week", which a test matches on.
- **Lesson prose font.** Multi-paragraph lesson bodies use `system-ui` for readability, as the brief allowed.

## Wallpaper replacement (brief v2 §2.6)

**How it works**

- **Scenes.** `lib/wallpapers/{meadow,fall,city,beach}.ts` hold the reference's builder code, colours and animation, and `lib/wallpapers/kit.ts` holds its helpers and seeded RNG, so each scene looks the same on every load and resize. `lib/wallpapers/index.ts` is the registry: labels, CSS preview gradients, surfboard styles, and the season mapping.
- **Auto.** "Auto" follows the season the player already chooses under Desktop themes (`profile.themeId`), not the calendar: spring → meadow, summer → beach, fall → fall, winter → city. The season picker keeps working and now sets both the wallpaper (under Auto) and the character lighting and control accents it always set.
- **Preference.** `wallpaper: z.enum(['auto','meadow','fall','city','beach']).default('auto')` sits in the profile next to the existing preferences, is optional in the profile command so a partial edit never resets it, and has a legacy-parse test. Display Properties is a tray button next to the TV toggle.
- **Surfboard.** The board sits at the character's anchor from `lib/home-scene.ts`, not a fixed `(W/2, H*.66)`. The character-position setting (left / center / right) and every layout clearance test depend on that anchor. At the default position it is the screen centre. The bob and roll go on the inner sprite button (`translate` and `rotate`, origin at the feet), so the layout box the tests measure stays still.
- **Where Pixi loads.** Only on the desktop (brief §5). Boot, login and setup show the chosen scene's CSS gradient, the same one Display Properties uses as its preview.

**Performance changes to the port.** None of these is meant to change what you see.
- Blurred layers are rendered to textures once after building, instead of re-blurring every frame. Pixi 7's `cacheAsBitmap` drops filtered objects, so this is an explicit bake.
- Clouds are blurred one by one rather than through their shared parent.
- Runs of static layers are merged into one texture each.
- The meadow's nebula and cumulus sit just behind the cloud layer instead of inside it, so they merge into the static sky.
- Baking yields between textures.
- The ticker is capped at 12fps.
- Where WebGL has no GPU behind it (SwiftShader, llvmpipe, or no WebGL), the scene doesn't run and the CSS gradient stays. In software it cost several seconds per page load, and it tripled the e2e run time.

**Checked at:** 375×812, 768×1024, 1280×800 and 1920×1080, all four scenes. Nothing stretches; the scenes rebuild on resize.

**Known:** at every size the "YOUR PATH" button overlaps the board's deck like a nameplate. Moving it lower would break the home layout's clearance tests.

**Deleted after the new scene passed e2e and axe:**
- `components/seasonal-scene.tsx`
- `components/seasonal-wallpaper.tsx`
- `components/wallpaper.tsx`, the interim entry wallpaper
- `scripts/create-season-art.py`
- `public/themes/*.svg` (12 files)
- The old scene's CSS in `app/retro.css` and `app/home-scene.css`
- The dead `palette`, `backgroundLayers` and `animationLayers` fields in `lib/themes.ts`

The season names now match their scenes (Spring Meadow, Summer Beach, Autumn Hills, City Nights). `lib/scene-manifest.ts` points at the new renderer and builders, and `scripts/validate-scene.ts` checks that the builders exist.

**Test changes.** All of these follow from the replaced DOM, or are new tests.
- `polish.spec.ts`, season previews: the old checks counted 24 `.scene-particle` DOM nodes and read their CSS animation. Particles now live in the canvas, so the test checks the same intent through `data-scene="fall"`, `data-intensity="normal"`, `data-still` flipping to `true` under reduced motion, and `data-paused` when the tab is hidden.
- `polish.spec.ts`, representative scenes: the old check counted 9 `[data-scene-layer]` SVG groups; it now checks each season shows its mapped `data-scene`.
- `polish.spec.ts`: a new test covers Display Properties (open from the tray, axe audit, pick City Nights, OK, persisted after reload).
- `retro.spec.ts`, calendar: the plan-removal check read storage once, straight after the click. The save takes about 50ms both before and after this change; the lighter page just exposed the race. It now polls for the same result.
- New unit tests: `tests/wallpapers.test.ts` and a `wallpaper` case in `tests/preferences.test.ts`.

## Gate

| Check | Baseline (`v0.8-tree-focus`) | Final |
|---|---|---|
| `seed:validate` | OK | OK (121 lessons, 10 hobbies) |
| `typecheck` | clean | clean |
| `lint` | 0 errors, 6 warnings | 0 errors, 4 warnings (all pre-existing, in test files) |
| `test` (unit) | 102 passed, 1 skipped | 110 passed, 1 skipped (+3 sprite checks, +2 preference cases, +3 wallpaper checks) |
| `test:e2e` | 120 passed, 2 failed, 2 skipped | 122 passed, 2 failed, 2 skipped (+1 Display Properties test; the 2 failures are the pre-existing journey test on both projects) |
| `build` | OK | OK |

The one e2e failure is `journey.spec.ts` "mobile journey and accessible primary screens". It fails the same way on the untouched tag: `.skill-tree-panel` intercepts the click on the tree node. It always fails on mobile and sometimes on desktop, and a separate task was suggested for it.

`polish.spec.ts` "painted avatar layers…" on mobile failed in 3 of 9 full-suite runs. It never failed on its own (0 of 15 runs, including 4× under doubled workers), so the flake is load-dependent hover timing. The reskin did cause one real, reproducible failure in that test: the hover hint pushed the character down under the pointer. That was fixed by overlaying the hint.

## Lighthouse (production build, `node scripts/lighthouse.mjs`)

Both routes render the login screen without a session, in both the baseline and the final build.

| Route | Before | After |
|---|---|---|
| `/home` | 0.90 / 0.92 / 0.92 | 0.88 / 0.89 / 0.89 |
| `/hobbies/tennis` | 0.92 / 0.92 / 0.93 | 0.89 / 0.89 / 0.89 |
| Accessibility | 0.98 (`landmark-one-main`) | 0.98 (`landmark-one-main`) |

Both routes are within the 5-point budget. The boot screen's old `label-content-name-mismatch` is fixed: the skip control is now a labelled button.

**Correction:** the "performance 1.00" in the commit 5 message is wrong. A stale `next start` from the baseline run was still holding port 3001, so those runs measured the old build. The numbers above come from the real final build. Two fixes brought `/home` back within budget: restoring the 1.4s boot, and building the wallpaper at idle time.

## DOM and selector changes

The wallpaper replacement's test changes are listed above. Before it, no test file was edited, apart from one new unit test in `tests/preferences.test.ts` and the new `tests/sprites.test.ts`.

- Window title-bar buttons, the dialog close button, the phone back and close buttons, and the reward dismiss button now hold an `<svg>` sprite instead of a text glyph. Their accessible names are unchanged.
- Boot: the whole-screen `<button>` became a `<div>` holding an `aria-hidden` BIOS log and a real button, "Skip boot animation · any key". Any key now skips, not only Enter or Escape.
- Appearance editor: the hover hint is absolutely positioned instead of pushing the preview down.
- Menu bar: a new "Screen effects" toggle button (`aria-pressed`).
- Reward toast: a new `aria-hidden` title line.
- Skill-tree edges went from `smoothstep` to `step`, and locked edges use a `2 4` dash.
- Home: `.anchored-seasonal-scene` is now a `<div>` hosting the Pixi canvas instead of an `<svg>`. It keeps `data-season` and `data-anchor-x`, and adds `data-scene`, `data-still`, `data-paused` and `data-render`.
- Menu bar: a new "Display properties" button that opens the Display Properties dialog.

## Files

New:
- `app/reskin.css`
- `lib/sprites.ts`
- `components/pixel-sprite.tsx`
- `lib/wallpapers/*.ts`
- `components/scene-wallpaper.tsx`
- `components/display-properties.tsx`
- `tests/wallpapers.test.ts`
- `scripts/ui-frames.mts`
- `scripts/screens.mts`
- `public/ui/*.svg`
- `tests/sprites.test.ts`

New dependency: `pixi.js@7.4.3`. It is loaded only through a dynamic import on the home desktop, and only when WebGL runs on a GPU.
