# Gamify.Life — continuation handoff

## September 18, 2026 update: sprite-pack character (read this first)

The character is now rendered from the author's own AI-generated sprite pack, not the SVG paper doll described below. The SVG system (`components/avatar.tsx`, `lib/body-rigs.ts`, `components/rig-layers.tsx`, 157 items, 9 body rigs, painted editing) is still in the repo but **nothing mounts it**; its tests are skipped, not deleted. Body types are removed from the UI by design.

- Renderer: `components/sprite-avatar.tsx` composites PNG layers from `public/sprites/` onto a 104×150 canvas (2× intrinsic, `image-rendering: pixelated`). Front view only; "face left" is a CSS mirror. Idle/gesture/celebration are CSS bobs.
- Catalog: `lib/sprites.ts` (`spriteItems`, body-relative offsets, per-layer `scale`, `covers` for full outfits). Items are also registered in `avatarItems` via `spriteWardrobe` so the progression engine accepts equipping them. Closet tabs come from `spriteSlots`; old `-none` ids and the `skin-*` / `color-*` catalogs are reused.
- Recolor: `recolorPixels` assigns each pixel to the sprite's own base skin or hair color by nearest hue/saturation/lightness (`Palette` per item; body uses `all:'skin'`; `keep` colors are left alone, e.g. the bandana red) and carries shading as a luminance offset. Every head sprite has a different base skin, so palettes are measured per file, not assumed.
- Pack contents used: 6 heads (hair + face), 3 tees, 4 pants, 3 clothing sets + 3 work suits (full outfits), cap, mask, backpack, wrench. Not used: the 3 overalls and 8 character bases (complete characters, can't mix with skin/hair choices), side/three-quarter bodies (no matching clothes), and the 2 sleeve sets (arms drawn at a larger scale than `body_front`, so they land on the chest — they need redrawing on the template, not offset tuning).
- Generated to fill gaps the pack has no art for: backpack straps (the pack alone is fully hidden behind a front-facing body), three shoe colours (the body is barefoot), and three companion effects. All are script-drawn in the pack palette and listed in `docs/reference/character-template.md` as the first candidates for hand-drawn replacements.
- Earned cosmetics: all 19 skill-tree/achievement rewards predate the pack, so `spriteAliases` maps each onto the nearest existing art. A unit test asserts none of them render as nothing. Sprites with `hidden:true` are alias art only and are not equippable on their own.
- Closet thumbnails (`components/item-preview.tsx`) render the item on the player's own character, cropped per slot.
- Verification technique that works: Playwright element screenshots of `.appearance-preview .sprite-avatar` with `reducedMotion` on and `animations:'disabled'`; full-page shots are not deterministic (menubar clock).
- Reference copy of the pack with provenance note: `docs/reference/gamify_sprites/`.
- Animation: the authored 15-frame table (idle 1–4, walk 5–10, action 11–15) with per-frame durations and head/pelvis anchors lives in `lib/sprites.ts` (`spriteFrames`, `spriteTags`, `anchorDelta`). Modular layers are drawn once and translated by each frame's anchor delta. `BODY_FRAMES` is empty, so the static body and CSS bob are still in use; fill it with 15 full-canvas PNGs to switch on. Spec and drawing template: `docs/reference/character-template.md` + `character-template-104x150.png`.
- Still open from the design direction: hobby nodes collapsing to a side rail on small screens (use the unused `dashboardEdge` preference), richer seasonal backgrounds, reward toasts. The Home character now fills 52% of the workspace height (`characterSceneAnchor`), up from 40%.
- Dormant slots: `face` and `accessory` are still saved on every profile but appear in no UI and have no sprite art, so the Character page's equipped list is driven by `spriteSlots` rather than raw state. Re-adding either slot means drawing art for it first.

The sections below describe the earlier SVG checkpoint and remain accurate for everything except the character.

Updated September 17, 2026. The user is transferring to another Codex/AI account because of usage limits. **This is a work-in-progress checkpoint, not a completed handoff release.** Read this first, then inspect the code and design directive. All current source code is in this repository; no previous chat is needed to start.

## Start here

Repository: https://github.com/Neo-Land/Gamify-Life
Branch: `design/character-centered-home`
Workspace on the original Mac: `/Users/nehemiaslandav/Documents/ChatGPT/Gamify.Life`
Preview: http://127.0.0.1:3000/home

```sh
git clone --branch design/character-centered-home https://github.com/Neo-Land/Gamify-Life.git
cd Gamify-Life
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

Use Node 24 (minimum 22.12+) and pnpm 11. Guest mode works without credentials. Use a separate test browser context; the user's guest character is sessionStorage data in their existing tab and is NOT included in Git. Do not erase or reset it.

On the existing Mac, the bundled Node binaries are at:
`/Users/nehemiaslandav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin`
Add that directory to PATH if node/pnpm cannot be found. This machine used direct `./node_modules/.bin/…` commands when convenient. Browser/server/tsx commands may require the sandbox's normal network/process permission mechanism.

Read `AGENTS.md`. It requires reading relevant installed Next.js docs in `node_modules/next/dist/docs/` before writing code. This project uses Next 16.3.5, React 19.3, TypeScript 6, Tailwind 4, React Flow 12, Radix Dialog, Zod and optional Supabase. Do not assume older Next APIs. There are no instructions requiring agent delegation; continue locally unless the user requests it.

## User intent and document priority

Finish `docs/GamifyLife_Character_Centered_Homepage_Handoff.md`. That document supersedes earlier homepage layout guidance. Preserve working progression, safety gates, XP, authentication, session-only guests, quests, hobby content and retro application windows.

The other three original documents remain in `docs/`:
- `GamifyLife_Codex_Build_Spec.md`
- `GamifyLife_Retro_OS_Design_Handoff.md`
- `GamifyLife_Responsive_Seasons_Character_Polish_Report.md`

The previous stable recovery point is commit `0a54f4bfdec4844d9e79c2edf208b110ec265549`, message `Checkpoint retro OS desktop and progression design`, tagged **v0.2-retro-desktop-checkpoint**. That branch state and annotated tag were pushed and verified before the current work. DO NOT move that tag to this unfinished work. Current work is saved as a later WIP commit on the same branch. The user explicitly authorized this transfer commit/push.

## What the app already does

Four hobbies (Tennis, Cycling / Fixed Gear, Swimming, Journaling), 72 canonical skills, AND/OR prerequisites, mandatory safety gates, evidence forms, completion/mastery, XP ledger, hobby/life levels, weekly quests, private practice logs, achievements and cosmetic unlocks. Eight dock apps: hobbies, map, quests, character, loadout, achievements, calendar, settings. Draggable/resizable/minimizable windows with measured maximize/restore, compact full-screen applications, bottom dock on mobile. Calendar practice plans. Guest onboarding and character creation. Cloud repository and auth integration exist; live hosted verification remains outstanding.

Previously fixed: tennis/practice Add/Done failure, in-modal validation and saving feedback, whole-minute input, idempotent rapid submissions, draft retention after storage failures, and the route/window reopening race. Existing regression tests cover these. Do not undo the desktop `open()` behavior: for a different pathname it pushes the route and lets the route effect open the window; for the same pathname it opens directly. Doing both creates a close/minimize race.

## Current implementation and file map

### Pass 1: character-centered home — implemented, focused tests pass

`components/character-centered-home.tsx`, `app/home-scene.css`, `components/desktop.tsx`:
- Replaced old three-zone dashboard with a focal avatar, YOUR PATH toggle, compact life HUD, one quest ribbon/next action, two small utilities and the existing dock.
- Character or center click opens hobbies. EDIT CHARACTER opens Appearance. Full hobby progress is available in an accessible modal list.
- A pinned quest's CONTINUE opens the quest application; otherwise the next skill/Quick Start is offered.
- Existing `desktop-hero.tsx` and some older dashboard/style code remain unused; cleanup is optional after regressions.
- Desktop passes the dock-safe workspace dimensions and uses matching 8px inset padding.

### Pass 2: hobby constellation — implemented, focused tests pass; polish remains

`lib/home-scene.ts`, `components/hobby-constellation.tsx`:
- Explicit collapsed / hobbies / progress(selected hobby) reducer.
- Candidate-position layout rejects unsafe/overlapping rectangles, scores placements, falls back to a scrolling strip when space is insufficient.
- Only enrolled hobbies show. Selecting one shows a small slice of actual progression: previous completed, current/available, nearby available and a locked node (up to 5 wide, 3 narrower).
- Pixel connectors, selected state, XP/status, focus/hover prerequisite inspector, Escape and empty-background collapse, existing node routes.
- Last selected hobby persists as profile.selectedPreviewHobbyId; home starts collapsed.
- Under 900px, expanded character is 140px and branches share one horizontal strip. This fixed an observed overlap on 320×568.
- Follow-up: after selecting a hobby on a small screen, its progress nodes are further along the horizontal strip, sometimes offscreen. Improve discoverability or scroll the selected branch into view without covering the avatar. Clear stale inspector state when switching hobbies. Ensure tooltip text is reachable on touch and keyboard.

### Pass 3: anchor system — functional prototypes, NOT final environment art

`components/seasonal-scene.tsx`, `lib/home-scene.ts`, `components/desktop-preferences.tsx`:
- Shared normalized SceneAnchor; left/center/right/auto preference on wide screens, mobile centered.
- Character, path and scene vanishing point use the same x coordinate; left/center/right alignment verified for fall and winter.
- Original native SVG layers: sky, distant, perspective, midground, ground, foreground, ambient. Four-pixel scene coordinate grid; no stretched landscape bitmap.
- Fall trail and winter street prototypes, plus basic spring and summer variants. Foreground and particles use safe-zone masks. Current expanded-state mask conservatively excludes almost the entire constellation area rather than each node separately.
- Dynamically imported renderer; only selected theme geometry renders on Home. Settings retains the older four SVG miniature previews.
- **Artwork remains simple/blocky prototype scenery.** Finish layered city facades, street furniture, richer woodland depth, proper lake/valley/reflection, spring flower rows/bees, winter park details, and portrait framing. Ensure right path boundary/fill stays pixel-stepped and all perspective geometry remains coherent. Do not describe these prototypes as final art.

### Pass 4: theme controls — implemented, needs complete contrast/accessibility audit

`lib/themes.ts` has ThemeControlAccents; `desktop.tsx` places CSS variables on the shell. Borders, highlights, pressed state, focus, progress caps, titlebar pattern and node corners vary by season. Danger buttons are excluded from normal recoloring. Check readability in every theme, especially active titlebar pattern, selected controls and high-contrast mode. Decorative corners currently use CSS pixels/colors rather than separate raster files.

### Pass 5: nine bodies — initial implementation, focused tests pass

`lib/body-rigs.ts`, `components/rig-layers.tsx`, `components/body-selector.tsx`, `components/avatar.tsx`:
- Nine separately specified torso silhouettes, side silhouettes and anchor sets on a 128×192 grid: short/average/tall × slim/average/broad. UI calls average “Medium.”
- Head/face/neck/shoulders/hands/waist/back/feet/ground anchors. Body shape uses authored geometry, not CSS width/height scaling.
- Clothing patterns use shoulder/hem/hip/foot coordinates with fixed-size pixel details. Head/face/hair are translated intact for height.
- `profile.bodyRigId` defaults to average-average; migration does not reset equipment. `profile.characterPosition` defaults to auto.
- Body selection in creator and Appearance; front/left/right/back views, comparison of at most three variants.
- Appearance preview moved into a separate sticky column so changing body does not scroll the avatar out of view; compact preview has a mobile sticky layout.
- Existing avatar callers receive profile.bodyRigId. Renderer remains usable without Provider for component tests.
- Partial profile command overrides explicitly make new defaults optional. Preserve this pattern: otherwise unrelated profile edits can reset preferences with Zod defaults.

### Pass 6: character/wardrobe — PARTIAL, needs visual review and animation work

- Original 16-layer avatar compositor retained. RigLayer now supplies body, top, bottoms, socks, shoes, outerwear; other layers use the previous original art with anchor translations.
- Painted pixels select matching Appearance closet category; native SVG hit testing, hover highlighting, touch second-tap behavior and keyboard category tabs.
- Original wardrobe still has 157 items; current renderer/manifest declares support for all nine rigs. This is **NOT proof of visual compatibility**. Inspect every style/pose, particularly coats/vests, side-view clothes, wrist accessories, bags, long hair, headwear and held props. Fix or explicitly restrict unsupported combinations. If restrictions are introduced, hide unsupported items and ask confirmation before replacing equipped items; never silently reset them.
- Hand/prop and back-item offsets need scrutiny. Existing hand grips were approximate; a translated held item may remain detached. Toolbelt/foreground effects still use older coordinates. Shoe geometry was adjusted but needs visual review across builds/side poses.
- Idle/gesture/celebration metadata uses 6/6/10 frames; CSS currently implements mostly small integer vertical motions, with a small held-item movement. **These are preliminary procedural loops, not finished expressive authored animation sequences.** Finish distinct body/hand/head key poses and keep attachments coherent. No combat animations.
- Rig `hitRegions` currently lists slot names, not geometric AvatarHitRegion objects as suggested by the handoff. Painted SVG provides actual hit masks, but formalize the manifest contract if needed.

### Pass 7: polish/performance — incomplete

Bounded seasonal pools exist (normal winter 24, fall 16, other 10; low 8/4; off 0). Scene and avatar pause on document.hidden; reduced-motion CSS exists. Maximized/compact windows pause the Home scene. Remaining work includes full motion audit, selected-theme loading and memory/low-power checks, semantic accessibility, all dock/viewport combinations, full mobile/browser regressions and production build.

Known follow-ups:
1. The compact life HUD is hidden under 768px; restore a readable name/level/XP summary in the small-screen menubar without crowding save/power controls.
2. Home central pulse does not yet subscribe to document.hidden itself (scene/avatar do). Animation Off pauses Home avatar/pulse and removes its particles, but audit all app/editor avatar animations and branch transitions for Off/reduced-motion behavior.
3. Recent rewards currently use the existing skill completion modal; add brief reward toasts if required by the handoff, without duplicate awards or permanent homepage cards.
4. Improve precise safe-zone masks and foreground prop redistribution rather than only a broad expanded-state mask.
5. 900–1199 side arcs and 640–899 arc/strip are currently handled by the generic spatial/fallback algorithm; judge composition quality, not only bounding-box tests.
6. Do not claim “all buttons stress tested” based on the focused suite. Run the existing actions/journey/retro suites too, particularly original practice-session and persistence regressions.

## Manifest and validation

`lib/scene-manifest.ts`, `scripts/validate-scene.ts`, `pnpm scene:validate`.
Build now starts with `tsx scripts/validate-scene.ts && next build`.
Checks: 9 rigs, 128×192 frame declarations, complete integer anchors, animation frame counts, item variants, renderer/preview paths, layer/composition declarations, theme token fields, hobby icons.

Current validator passed: **9 rigs, 157 wardrobe items, 4 themes, 4 hobby icons**.
Caveat: these are code-native SVG renderers, not sprite sheets. Current validation verifies declarations/path existence; it does not render every item or verify fit, validate actual animation frame art, or prove color contrast. Tighten it to the final asset model. Avatar manifest currently points all items at RigLayer even though some slots render in Avatar; accurately split renderer provenance and implement stronger rendering checks.

## Actual test evidence at this checkpoint

Completed on this WIP source:
- `tsc --noEmit`: passed after current source changes.
- `eslint .`: passed.
- `vitest run`: **55 passed, 1 skipped**, 7 passing files and 1 skipped file. External hosted Supabase RLS is the skipped test.
- `playwright test centered-home polish --project=desktop --workers=2`: **16 passed, 1 skipped**. Skip is the touch-only test in desktop project.
- `tsx scripts/validate-scene.ts`: passed.
- `git diff --check`: passed before handoff documentation.

Focused browser coverage includes nine viewport sizes, center/list navigation, one branch at a time, locked prerequisites/opening detail, fall/winter left-center-right alignment, nine rig changes with equipment/XP preservation, compare limit, painted editing, compact strip clearance, all wide-screen dock/position combinations and maximize/restore, theme preview/apply/cancel/persistence, reduced motion/hidden scene, 200% CSS zoom reachability and Quick Start for all four hobbies.

New tests: `tests/home-scene.test.ts`, `tests/body-rigs.test.tsx`, `tests/e2e/centered-home.spec.ts`. Updated `tests/e2e/polish.spec.ts` intentionally removes obsolete three-zone/opposite-dashboard expectations and tests the new centered layout. Old home painted-edit test now tests editing in Appearance; home character click opens hobbies per new directive.

**NOT yet run on this checkpoint:** full browser suite including mobile project, complete new appearance/theme axe audit, fresh production build, hosted Supabase auth/save/delete/isolation, memory profiling or physical low-power device testing. The old stable checkpoint's results in `docs/VERIFICATION.md` do not certify new changes. Historical stable coverage was 80 unique passing browser cases, but do not report that as current WIP coverage.

Use at most 2 browser workers initially. Heavy multi-page axe checks can time out under simultaneous build/browser load. Don't run a production build concurrently with browser tests. Use existing dev server if present.

A test nuance: focused tests seed all four enrollments directly. The next profile mutation can award the zero-XP “Curious Mind” achievement. Therefore a nonempty ledger after changing appearance is not necessarily awarded XP; compare XP totals/meaningful progression or normalize seed through commands instead of asserting ledger.length===0.

## State, backend and safety invariants

- `lib/progression.ts` is the pure authoritative command engine. UI never directly awards XP.
- Local adapter uses sessionStorage key `gamify-life:v1`, `gamify-life:guest-active`, `gamify-life:booted`; Web Locks serialize writes. Never move guests to persistent localStorage.
- Cloud `/api/progress` verifies auth, parses commands, evaluates engine and uses revision compare-and-swap / advisory locks. Private `progress_snapshots` JSONB aggregate is authoritative; SQL tables are projections. New visual preferences live in aggregate profile; no new SQL migration has been added for this work. Confirm round trips with tests.
- Existing migrations and seed are in `supabase/`; seed need not change unless content/catalog changes. All originals, original code-native artwork, fonts/license, lockfile and `.env.example` are tracked.
- Hosted email auth, account deletion and true two-user isolation require a disposable configured Supabase project. Credentials have not been provided for live verification. Guest-to-account merge remains unimplemented; SAVE PROGRESS correctly explains that.
- Do not commit `.env`, credentials, node_modules, .next, temporary screenshots/traces, or unowned reference art. Tests use isolated characters. Existing docs/screenshots are intentional historical assets.

## Recommended next session order

1. Read this file + the full Character Centered Homepage Handoff; inspect working tree and latest commit. Start preview and inspect both 1440×900 and 320×568.
2. Fix narrow-strip branch discoverability, stale inspector, mobile HUD and motion-off/hidden gaps. Add targeted tests for the actual fixes.
3. Review all nine bodies front/side with representative starter and reward clothing. Correct hand/back/toolbelt attachments and clipping. Establish truthful compatibility records and confirmation behavior where needed.
4. Finish expressive 6–8 / 6–8 / 8–12 frame animations with stable attachments and actual source-frame validation. Review pixel sharpness.
5. Finish modular seasonal art using the now-tested shared anchor. Add precise safe-zone/portrait treatment. Avoid arbitrary bitmap skew/scaling.
6. Audit seasonal controls and keyboard/touch accessibility. Run full regression suite and mobile tests, production build, content/asset validation. Preserve practice-session fixes.
7. Update current feature documentation, create intentionally documented new screenshots, and add a new verification report separating local evidence from outstanding hosted checks.
8. Report remaining limitations honestly. Commit/push when asked; preserve stable tag. Do not overwrite user's active guest session while testing.

## Copy/paste prompt for the next AI

> Continue the Gamify.Life project from branch `design/character-centered-home` at https://github.com/Neo-Land/Gamify-Life. Read `AGENTS.md`, `docs/CONTINUE_HERE.md`, and `docs/GamifyLife_Character_Centered_Homepage_Handoff.md` first. The latest commit is an unfinished continuation checkpoint, not a finished release. Preserve the stable `v0.2-retro-desktop-checkpoint` tag and all working progression, practice-session fixes, auth and session-only guest behavior. Complete the remaining tasks in CONTINUE_HERE, inspect the preview and verify with meaningful tests. Continue implementing rather than restarting or only proposing a plan. Do not erase my current guest session. Keep the original art and avoid distorted body scaling. Tell me what is complete, what is tested, and any remaining limitations.
