# Retro reskin — handout for the next session

Written 2026-09-30 at the end of the reskin session. Read this, then `docs/design/REPORT.md` (full report) and `docs/GamifyLife_Retro_Reskin_Handoff.md` (the brief, v2).

## Where things stand

- **Repo:** `~/code/Gamify-Life`, remote `Neo-Land/Gamify-Life`.
- **Branch:** `design/retro-reskin`, pushed, working tree clean. It started from tag `v0.8-tree-focus` (`ccd270e`), and the last commit is `aaeeef0`.
- **No PR yet.** The target branch is undecided: the repo default is `design/character-centered-home`, but the brief says "your main branch". Ask Neo before opening one.
- **The brief is done**, including v2's wallpaper replacement. Every surface is in the checklist in `docs/design/REPORT.md`.
- **Additions after the brief:**
  - The wallpaper fills the whole desktop.
  - "Jack of all trades, master of none…" motto: the last line of the boot log, and the full saying as the login tagline.
  - Checkbox and radio checked states fixed.
  - Phone menu bar and Display Properties layout fixes.

## How it's built (where to look)

| What | Where |
|---|---|
| All reskin styling. Loaded last and restyles the existing class names, so markup and e2e selectors didn't change. | `app/reskin.css` |
| Palette. The sage colourway holds the brief's tokens; the other four colourways still work. | `app/retro.css` `:root` and `[data-colorway]` |
| Pixel art: icons, hobby icons, frames, app icon. Letter maps rendered as SVG. | `lib/sprites.ts`, `components/pixel-sprite.tsx` |
| 9-slice frame files and `public/icon.svg`. Regenerate with `pnpm exec tsx scripts/ui-frames.mts`. | `scripts/ui-frames.mts` → `public/ui/*.svg` |
| Wallpaper scenes: meadow, fall, city, beach. Exact port of `docs/design/retro-reference.html`. | `lib/wallpapers/*.ts` |
| Chrome "NEO" surfboard the character rides | `lib/wallpapers/surfboard.ts` |
| The Pixi canvas: build, bake, 12fps ticker, rider transform, fallbacks | `components/scene-wallpaper.tsx` |
| Wallpaper picker (tray button next to the TV) | `components/display-properties.tsx` |
| Preferences. `profile.wallpaper` is `auto` \| `meadow` \| `fall` \| `city` \| `beach`; `auto` follows `profile.themeId`. The CRT switch is the existing `profile.scanlinesEnabled`. | `lib/domain.ts` |
| Boot, login, motto | `components/entry.tsx` |
| Before and after screenshots, 14 surfaces × 375 / 1280 | `scripts/screens.mts before\|after` → `docs/design/screens/` |

## Running and checking

- **Dev server.** `pnpm dev`, or the Browser pane with `.claude/launch.json` → `gamify-dev` on :3000.
- **Full gate.** `pnpm seed:validate && pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build`. e2e takes about 7 minutes and reuses a dev server on :3000.
- **Expected results:**
  - Unit: 110 passed, 1 skipped.
  - e2e: 126 passed, 2 skipped.
  - Under load, a few tests sometimes fail but pass on their own: the polish clearance and avatar-layer tests, and `actions.spec.ts` tree timeouts.
- **Lighthouse.**
  1. `pnpm build`.
  2. `next start -p 3001` in the background, and note its PID.
  3. `node scripts/lighthouse.mjs`.
  4. Kill the server by that PID. `pkill -f "next start"` does **not** match, because the process renames itself `next-server`. That once left a stale server up, and it silently served old numbers.
- **Lighthouse baseline and budget.**

  | Route | Baseline | Now |
  |---|---|---|
  | `/home` | 0.90–0.92 | 0.88–0.89 |
  | `/hobbies/tennis` | 0.92–0.93 | 0.89 |

  The budget is at most a 5-point drop. Without a session, both routes show the login screen.
- **Screenshots with the real scenes** need GPU flags. `scripts/screens.mts` already passes them. Plain headless Chromium uses software GL, which gets the CSS gradient fallback.
- **Two harmless side effects:**
  - `next dev` rewrites `next-env.d.ts`. Run `git checkout next-env.d.ts` before committing.
  - Playwright wipes `test-results/`, so keep helper scripts elsewhere.

## Gotchas learned the hard way

- **CSS**
  - The `border` shorthand resets `border-image`. Use border longhands after a frame.
  - The minifier merges `!important` border longhands back into `border`, which kills `border-image`.
  - `retro.css` forces `background:…!important` on every input, so checked states need `!important` backgrounds.
- **Pixi 7:** `cacheAsBitmap` silently drops filtered (blurred) objects. That's why `kit.ts` bakes textures instead. Blurring a container with moving children re-blurs every frame.
- **Software WebGL** (SwiftShader, llvmpipe) costs seconds per page load. It keeps the CSS gradient on purpose; don't remove that guard. The e2e suite went from 7 to 27 minutes without it.
- **Pixi loads only on the desktop** (brief §5). Boot, login and setup use the scene's CSS gradient, which is what keeps Lighthouse in budget.
- **Home layout**
  - The layout (`lib/home-scene.ts`) and about 40 e2e selectors depend on the existing classes and clearances. The board follows the character's anchor.
  - The ride transform goes on the inner `.characterSprite`, never on `.home-character` (the tests measure that one).
  - The wallpaper bleeds under the workspace padding through the `bleed` prop.
- **Anything that makes the home's bottom bar or dock taller** breaks the centered-home and polish clearance tests. Pay extra frame thickness back in padding.
- **Code style:** the code is deliberately dense, one-liners and all. Match the file you're editing.
- **Next.js 16:** read `node_modules/next/dist/docs/` before using Next APIs (see `AGENTS.md`).

## Open items and ideas

1. **Pull request:** decide the target branch, then open it with `docs/design/REPORT.md` as the description.
2. ~~**Journey test**~~: fixed. Its node click could resolve to the tree's screen-reader list (`ul.sr-only`), which renders before the lazy-loaded canvas and can never be clicked. The test now targets `.react-flow__node`.
3. ~~**YOUR PATH button**~~: done. It now sits beside the board (under it on phones); see `pathButtonPlacement` in `lib/home-scene.ts`.
4. **"Jack of All Trades" achievement:** for example, reaching a decent level in several hobbies, next to "Well Rounded" and "Renaissance Beginner". This touches `lib/content.ts` rules and is a behaviour change, so keep it in its own commit.
5. **Wallpaper unlocks:** extra wallpapers as achievement rewards (the brief's future hook). `lib/wallpapers/index.ts` is the registry.
6. **Deferred from the brief:**
   - The 404 page (the catch-all route renders the desktop).
   - A tooltip component (the app has none).
   - Emoji inside `PageHeading` title strings.
7. **Known flake:** `polish.spec.ts` "painted avatar layers" on mobile sometimes fails under full-suite load but never alone.
8. **Correction on record:** commit 5's message claims "performance 1.00". That was wrong: it came from a stale server. The real numbers are in the report.

## Plugins and tools worth trying here

- **PixelLab (pixel-art MCP):** could redraw or extend `lib/sprites.ts` icons, hobby icons for new hobbies, or wallpaper props. Keep the output as letter maps in `lib/sprites.ts` (run `tests/sprites.test.ts` after), or as files under `public/`. Keep the "no Warframe IP" rule.
- **Figma:** the design system (tokens in `app/reskin.css`, frames, sprites) could be mirrored into a Figma library, or checked against one.

## First message to paste into the new session

> Read `docs/RETRO_RESKIN_NEXT_SESSION.md`, then `docs/design/REPORT.md` and `AGENTS.md`. We're on `design/retro-reskin` in `~/code/Gamify-Life`. Confirm the branch is clean and the unit baseline (110 passed, 1 skipped), then ask me which open item to take next. Commit per change with the gate passing, and don't push until I say so.
