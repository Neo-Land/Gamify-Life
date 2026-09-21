# Gamify.Life — continuation handoff

## September 21, 2026 update: side hair, three builds, cast shadow, real animation

- **Side and back hair cover the skull.** Side views used to be a cap plus a front block, leaving the
  back half of the head bare. `sideShort` (temple, behind-ear, tapered nape, sideburn) and `sideLong`
  (hides the ear, stops at the jaw) in `lib/hair.ts` are the shared coverage; `backShort` carries the
  back view down to the nape. The side-view ear moved from the back of the skull to x120–134 and is
  drawn with a faint shade, because it sits on skin and is invisible otherwise.
- **Shaved hair is `stub`**, the hair colour at .38 opacity over skin. Putting it in `light` made the
  shaved sides of a blond mohawk brighter than the mohawk.
- **Hair casts a shadow on the face**: the front hair boxes offset by 3 down/left/right in darker
  skin, clipped to `headSkull` so it never lands on clothes. Stronger when hair and skin are within
  .14 luminance. The clip id comes from `useId()`, so markup comparisons must normalise it.
- **Three builds, one height**: `average-slim`, `average-average`, `average-broad`, labelled Slim,
  Medium, Broad. Old short/tall saves map through `legacyBodyRig` onto the same build. Each rig has
  `arm` and `leg` widths and every limb garment (sleeves, hands, legs, cuffs, socks, shoes, coat
  sleeves) derives from them; Medium reduces to exactly the old numbers. Shoes are capped so the slim
  pair never merges in front/back views. The picker (`BodySelector`) is in the creator and the
  appearance editor, showing the player's own outfit on each build.
- **Animation**: idle is a breath with the head a beat late; gesture is a bounce, two nods and a
  raised prop; celebration is crouch, jump, head lag, landing squash, second hop, prop overhead and
  a shrinking ground shadow. All via the `translate`/`scale` properties so they compose with each
  layer's transform attribute, and all paused/removed by the existing motion rules.
- Contact sheets without the dev server: render `<Avatar>` with `react-dom/server` under tsx
  (`NODE_PATH=node_modules`, import React explicitly) and screenshot the HTML with Playwright.

## September 18, 2026 update: SVG character, chibi proportions (read this first)

The sprite-pack experiment is **reverted**. The character is the original SVG paper doll again
(`components/avatar.tsx`, `lib/body-rigs.ts`, `components/rig-layers.tsx`) with its full 157-item
modular wardrobe, all 13 slots, all four poses, and every earned cosmetic rendering its own art.
Reason: the pack needed per-item offset tuning, had no art for shoes or straps, its sleeve sets were
drawn at the wrong scale, and going back removed the whole authoring loop.

- **There is no neck.** `seat` in `avatar.tsx` drops the head until its chin meets the shoulder line,
  and `HEAD_SCALE` absorbed the height the neck used to hold, so the head is now ~65% of the figure.
  `rig-layers.tsx` no longer draws a neck rect at all.
- **Chibi proportions.** `avatar.tsx` scales the head up (`HEAD_SCALE=2.18`) about the neck and the body
  down about the feet, non-uniformly (`BODY_W=.8`, `BODY_H=.48`) so the body reads stubby rather than
  merely small. Both halves meet at the same neck point. No clothing path was rewritten — every rig,
  clothing pattern and attachment follows because they all derive from rig anchors. Tune those three
  constants to change the whole look; the head is currently ~60% of the figure's height, which is
  `90*HEAD_SCALE / (96*HEAD_SCALE + 224*BODY_H)`.
- **Held props are placed by their grip, not by the body transform.** `propGrips` in `avatar.tsx`
  names the authored point of each prop that has to land in the hand, and `heldTransform` puts it
  there at a uniform `PROP_SCALE`. Props used to ride `bodyTransform`, which both squashed them
  (.8 across, .48 down) and let them drift off the hand every time the proportions changed. Adding a
  prop means adding its grip; the fallback is the middle of the old authored area.
- **Back items are drawn per view.** From the front a pack is two shoulder straps plus a sliver at
  each side, from the side it is the pack behind the shoulder, from the back it is the pack itself.
  The single front-facing slab it used to draw sat half off the ribs.
- **The body is wider than it is tall, so authored detail is not square.** A detail only looks square
  on screen when it is authored half again as tall as it is wide (`BODY_W/BODY_H` = 1.67). Buttons,
  stripes, pockets and hands in `rig-layers.tsx` are authored to that ratio on purpose.
- **Keep head art within x∈[70,186].** At `HEAD_SCALE=2.18` the canvas is 256 wide and the head
  scales about x=128, so anything outside that range is clipped. There is a scratch script pattern
  for checking this: walk every box in `hair.ts`/`headwear.ts` through `128+(x-128)*HEAD_SCALE` and
  assert it lands in 0..256. Worth re-running whenever `HEAD_SCALE` changes.
- **The head is its own layer.** `RigLayer` used to draw the head inside `body`; it is now a separate
  `head` layer so it scales with the face and hair instead of with the torso. Layer count is 17.
- **The chibi character base.** The head is a rounded square built from four stacked rects so the
  corners step instead of anti-aliasing — `shapeRendering:crispEdges` means real arcs would look
  wrong. Small ears sit at eye level. The neck is 44 units wide so it does not look spindly under the
  larger head. Back-of-head hair uses the same rounded-square stepping.
- **Eyes are structured, not dots.** Each eye is a cream sclera, a coloured iris with a lighter lower
  band, a small near-black pupil, then an **upper lash** and a glint on top. The dark line covers only
  the top edge and upper corners with a flick at the outer corner; there is deliberately no outline
  under the lower lid. Solid dark dots were the first attempt and read as spooky; a full dark ring
  was the second and read as a domino. Only `calm`/`tired` get closed
  lash-line eyes; brows appear only for `focused`/`curious`/`brows`. The mouth is a three-step curve;
  two steps read as a staple.
- **Brows and blush are on every face**, not just the variants that name them. `browShape` picks one
  of five shapes from the expression (neutral, raised, focused, curious, soft) and that carries most
  of the character's mood. Brows live in the narrow band between the hairline at y56 and the upper
  lash at y73 — the hairline used to sit at y62, which left no forehead and buried them.
- **Brow and blush colour adapt to the skin tone.** When hair and skin sit within 0.14 of each other
  in luminance the brow is pushed away from both — lighter on dark skin, darker on light — because
  espresso hair on ebony skin rendered the whole upper face as one mass. Blush opacity rises on dark
  skin for the same reason.
- **The chin shadow is its own layer after `outerwear`** so it falls on whatever is worn rather than
  under it. It is the depth cue the head lost when the neck was removed. Layer count is 19.
- **Eye colour is its own wardrobe slot** (`eyeColor`, 8 items in `lib/wardrobe.ts`). Characters saved
  before it existed have no value stored, so `avatar.tsx` derives an iris colour from their hair
  colour instead. Do not remove that fallback — it is what keeps old guest sessions from rendering
  black eyes.
- **Blinking closes a lid, it does not hide the eye.** `.avatar-lid` is a skin-coloured rect plus a
  lash line, normally `opacity:0`, flashed in by `@keyframes avatar-blink` in `retro.css`. The old
  keyframe faded `.avatar-eyes` out, which only worked while the eye was a solid dot.
## Modular head art (`lib/hair.ts`, `lib/headwear.ts`)

Added September 18, 2026. Every hairstyle, hat and pair of glasses is a data table of axis-aligned
boxes, not a hand-written `d` string.

- **Boxes, not paths.** `boxPath()` turns `[x,y,w,h]` lists into a `d`. Authoring as boxes keeps
  every edge orthogonal; a diagonal in a `d` attribute renders as a visibly wrong stair under
  `shapeRendering:crispEdges`, which is how the old hair paths kept going wrong.
- **`hair-back` is ordered behind the head**, between `body` and `head`. It used to sit after `face`,
  which meant a full back sheet — the thing that makes long hair read as long — painted straight over
  the face. Canonical layer order and count (18) are asserted in two unit tests.
- **`bottoms-cuff` is a second bottoms pass after `shoes`**, so a wide leg falls over the shoe instead
  of being cut off by it. It renders only for wide-leg trousers.
- **Each hairstyle carries front, side and back art.** Left and right are the same side art mirrored
  in CSS, so there are three views per style, not four. Twenty styles plus bald; pigtails, space
  buns, mohawk, curtains and puff were added on September 20. Back views matter:
  the bun, the ponytail's fall and the braids are only legible from behind.
- **Hats and glasses are individually drawn.** Before this, bandana and rain hood both fell through
  to the baseball cap, bucket and sun hat shared one shape, and all six pairs of glasses were the
  same frame with a different lens tint.
- **Glasses rims must be rings, not filled discs.** A filled disc hides the eye it sits in front of
  and no lens opacity brings it back. `ring()` and `rectRing()` exist for this.
- **Keep everything inside x∈[66,190].** At `HEAD_SCALE=2` anything past that leaves the 256-wide
  canvas. The pom on the beanie and the ponytail's tail both had to be pulled back in.
- Contact sheets are the fast way to review a change: render each variant's avatar `outerHTML` into
  one `page.setContent` grid and screenshot it once. Add `.avatar-lid{opacity:0}` to that page's CSS
  or every eye renders shut — the blink lid relies on app CSS that `setContent` throws away.

- **All face/head art is authored in the pre-scale coordinate space** (head box x86–170, y44–134),
  so hair, headwear and face accessories keep aligning automatically — they scale by the same
  `HEAD_SCALE` about the same point. Do not author head art in final canvas coordinates.
- **The left profile is a CSS mirror on the `<svg>`** (`.avatar[data-pose=left]`). It cannot live on
  `.avatar-idle`, which sets `transform-box:fill-box; transform-origin:center bottom` for the idle
  bob — that re-anchors an SVG `transform` attribute and the flip comes out translated, not mirrored.
  Symptom if this regresses: the character renders unmirrored and 256 units to the right, spilling
  outside its panel.
- **Still open on the character:** hair and headwear have no side-specific art, so in left/right
  profile they keep their front silhouette on a profile head. That is the "awkward hair" to fix next,
  and it wants side variants per hairstyle family rather than a global tweak. Some hair/skin colour
  pairs also read as one flat mass now that the head is large (e.g. auburn hair on mahogany skin) —
  worth a contrast pass over the palettes. Skin-derived tones now come from a `shade()` helper in
  `avatar.tsx` rather than one hard-coded mid-brown, so the nose and blush read on every skin tone.

## The reward moment (`lib/rewards.ts`, `components/reward-overlay.tsx`)

Added September 20, 2026. `applyCommand` had always returned `{xpAwarded, unlockedNodeIds,
newAchievementIds, newAvatarItemIds}` and nothing consumed it; level-ups were computed nowhere.

- **`rewardFor(before, after, result)`** is a pure function turning a command's outcome into a
  `RewardEvent`. Level-ups are not in `CompletionResult`, so they are derived by comparing the two
  states. It returns `null` when a command earned nothing, which is how the UI stays quiet.
- **One surface per piece of information.** Completing a node opens a dialog that reports XP,
  level-ups, unlocked nodes, achievements and cosmetics, so the provider raises no toast there —
  a toast under the dialog's overlay is unreachable as well as redundant. Logging practice reports
  only its own XP, so the toast keeps the level-ups and unlocks and drops the number. Everything
  else (quests, achievements that land as a side effect of gear or enrolment) gets the full toast.
- **The provider reads the previous state through a ref**, because `run` is memoised with no deps
  and would otherwise close over a stale state and mis-report what was earned.
- **The home character celebrates** for 2.6s on any reward, via the `celebration` animation that
  already existed in `home-scene.css` and had never been triggered by anything.
- Watch out when writing tests: achievements award XP too, so a seeded state reaches a level
  threshold earlier than the node XP alone suggests. `tests/rewards.test.ts` and
  `tests/e2e/reward.spec.ts` both depend on that arithmetic.

## The seasonal scene (`components/seasonal-scene.tsx`)

Rewritten September 18, 2026 for much denser art. Read this before touching it.

- **Detail is cheap because shapes are merged by colour.** Every layer builds arrays of
  `[x,y,w,h]` boxes and `rects()` concatenates each colour's boxes into a single `<path d>`. A
  skyline of forty lit windows costs one DOM node. Do not emit a node per rect.
- **Trees are the exception.** Each tree keeps its own `<g>` so a near tree paints over a far one;
  they are generated far-to-near. Everything else is merged, where depth order does not matter.
- **The scene is deterministic.** `seeded(width*31 + height*7 + season.length)` drives every random
  placement, so the same viewport always draws the same scene and screenshots stay stable. Never use
  `Math.random()` here.
- **Geometry is on a two-pixel grid** (`q()`), down from four. That is what "less blocky" meant.
- `disc()` renders a filled ellipse as stacked horizontal bands — it is what gives canopies, clouds,
  rocks and snow mounds their pixel edge.
- **Per-season shape:** fall and spring get two rolling ridges plus a treeline standing on the nearer
  one; winter gets a procedural city skyline with lit windows, roof snow, antennae and water towers,
  plus lamp posts and bare snow-laden trees; summer is a shoreline — mountains, an opaque sea band
  with swell rows, a wavy foam edge, sand underfoot, palms, a parasol and a towel.
- **The back mountain range is placed edge to edge, not overlapped**, so its snow caps are never
  buried by the next peak. The front range overlaps and is uncapped.
- **Layer order is sky, celestial, distant, ground, scatter, ambient, midground, foreground.** Trees
  paint over the floor texture and the particles; only the big near foreground props sit in front of
  them. Putting midground before scatter is what let beach sand draw over the palm trunks.
- **Conifers are their own generator and their own palette** (`pine`), because an evergreen does not
  follow the season's leaf colour — fall's conifers came out amber the first time.
- **`[data-scene-layer]` count is 9** and `polish.spec.ts` asserts it. `sceneAssetManifest` lists the
  same names. Update both if you add a layer.
- **Particle counts live in `lib/themes.ts`** (`animationLayers`), and `polish.spec.ts` asserts fall's
  normal count exactly. Currently fall 24, winter 28, spring 18, summer 14.
- **The bottom ~108px of the scene is always masked** by the quest-ribbon safe zone, so foreground
  props placed near `height` are invisible. Keep them above `depthY(.9)`.
- The trail keeps the anchored perspective path and `data-anchor-x`; `centered-home.spec.ts` asserts
  the character's centre lines up with it.
- The painted-layer e2e test in `polish.spec.ts` used to hover a hard-coded point to prove clicking a
  jacket opens Outerwear, and broke the moment the body scale changed. It now derives the point from
  the outerwear path's own client rect, so it survives proportion changes.
- Closet thumbnails (`components/item-preview.tsx`) render each item on the player's own character,
  cropped per slot; the crop windows are in authored canvas units **after** the chibi scaling.
- Body types stay out of the UI by choice; the 9 rigs still exist and `bodyRigId` still defaults to
  `average-average`. `tests/e2e/centered-home.spec.ts` keeps its body-type test skipped.
- Verification that works: Playwright element screenshots of `.appearance-preview>.avatar` with
  `reducedMotion` on and `animations:'disabled'`; full-page shots are not deterministic (menubar clock).
- **The sprite pack is stowed, not deleted:** originals in `docs/reference/gamify_sprites/`, the
  script-generated pieces (straps, three shoes, three companions) in
  `docs/reference/sprite-pack-runtime/`. The renderer, catalog and its tests were removed; they are
  recoverable from git history at `ba9402c`. The 104×150 drawing template and the 15-frame animation
  spec in `docs/reference/character-template.md` were written for that pack and do **not** describe
  the current SVG character.
- Still open from the design direction: hobby nodes collapsing to a side rail on small screens (use
  the unused `dashboardEdge` preference), richer seasonal backgrounds, reward toasts. The Home
  character fills 52% of the workspace height (`characterSceneAnchor`), up from 40%.

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
