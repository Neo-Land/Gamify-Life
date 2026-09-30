# Gamify.Life — Retro Messenger Reskin Handoff

**Document type:** Claude Code implementation directive
**Repo:** `Neo-Land/Gamify-Life`, branch `v0.8-tree-focus` (tag), working clone on Neo's MacBook Air at `~/code/GamifyLifeRetro`, work branch `design/retro-reskin` (created from tag `v0.8-tree-focus` @ `ccd270e`)
**Stack:** Next.js 16 App Router · React 19 · TypeScript · Supabase · pnpm · Vitest + Playwright
**Visual reference:** `docs/design/retro-reference.html` (copy of `retro_messenger_v2.html`, delivered with this doc — open it in a browser before writing any code)
**Companion docs:** `docs/CONTINUE_HERE.md`, `docs/GamifyLife_Codex_Build_Spec.md`, `docs/GamifyLife_Character_Centered_Homepage_Handoff.md`, `GamifyLife_Onboarding_Hobby_Expansion_Handoff.md`
**Scope:** Visual only. Every screen, button, window, background, icon and transition changes. Behavior, data, routes, state schema and XP rules do not.

---

## Part A — For Neo: setting this up on the MacBook Air

### A1. One-time Mac setup

The easiest way is to run `setup_gamifylife_mac.sh` (delivered with this doc). It does every step below. If you'd rather do it by hand:

```sh
# 1. Apple command-line tools (git, compilers). Click "Install" in the popup.
xcode-select --install

# 2. Homebrew (package manager). Follow the "Next steps" it prints to add brew to your PATH.
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 3. Tools
brew install git node pnpm gh

# 4. Sign in to GitHub (the repo is private). Choose GitHub.com > HTTPS > login with a web browser.
gh auth login
gh auth setup-git

# 5. Claude Code: see https://code.claude.com/docs/en/quickstart (currently the line below)
curl -fsSL https://claude.ai/install.sh | bash
```

### A2. Create the project folder

```sh
mkdir -p ~/code && cd ~/code
gh repo clone Neo-Land/Gamify-Life GamifyLifeRetro -- --branch v0.8-tree-focus
cd GamifyLifeRetro
git switch -c design/retro-reskin      # the tag checks out detached; this puts you on a real branch
cp .env.example .env.local             # guest mode needs no credentials
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
```

Put the two files from the chat into the repo (they land in `~/Downloads` when you download them):

```sh
mkdir -p docs/design
cp ~/Downloads/GamifyLife_Retro_Reskin_Handoff.md docs/
cp ~/Downloads/retro_messenger_v2.html docs/design/retro-reference.html
git add docs && git commit -m "docs: retro reskin handoff + visual reference"
```

### A3. Confirm the baseline is green

```sh
pnpm seed:validate && pnpm typecheck && pnpm lint && pnpm test
```

Expected: **102 passed, 1 skipped**. If it's different, stop and sort that out first, so the reskin isn't blamed for an existing failure.

### A4. Start the work

Terminal tab 1: `pnpm dev`, then open http://localhost:3000.
Terminal tab 2 (Cmd+T):

```sh
cd ~/code/GamifyLifeRetro && claude
```

First message to paste:

> Read `docs/GamifyLife_Retro_Reskin_Handoff.md` in full, then `docs/CONTINUE_HERE.md`, then open `docs/design/retro-reference.html` and study it. Start with Part B §0 (the audit), show me the audit and your plan, and wait for my OK before Phase 1. After that, work phase by phase and commit after each phase with the gate passing.

**Alternative: Cowork instead of Claude Code.** In the Claude desktop app on the Mac, open this task, choose "Link to this computer", then "Add folder" → `~/code/GamifyLifeRetro`. Claude Code in the terminal is the smoother option for a codebase this size.

### A5. Tips while it works

- Press Shift+Tab for plan mode if you want to review the audit before any file changes.
- If it asks whether to change behavior or data, the answer is no. This pass is visual only.
- Back up or share progress with `git push -u origin design/retro-reskin`. Open a PR into your main branch when you're happy.
- The MacBook Air has no fan. The Pixi wallpaper and glow filter are the heaviest parts, so if it runs hot in dev, toggle CRT off from the taskbar.

---

## Part B — Directive for Claude Code

### 0. Read this first: audit before you paint

The app **already has a window/desktop system and a seasonal scene** (see the other handoffs). This reskin **restyles that system**; it does not build a parallel one. Before editing anything:

1. Read `app/` (layout, globals, route pages), `components/` in full, and the styling setup (Tailwind vs CSS modules vs global CSS, where colors live, and whether a design-token file exists).
2. Produce an **inventory table**: every screen/route, every window/panel component, every button variant, every input/select, every icon source (emoji, SVG, lucide or similar), and every background/scene layer, with file paths.
3. Identify the **choke points**: the one window component, the one button component, the token/global CSS file. Most of the reskin should land there. If there is no shared button or window component, create one and migrate call sites to it.
4. Take **"before" screenshots** with Playwright of every route at 375px and 1280px (guest mode needs no credentials). Save them to `docs/design/screens/before/`.

Show the inventory and plan to Neo, then proceed.

### 1. Non-negotiable invariants

- **Visual only.** No changes to `lib/progression.ts` logic, `lib/domain.ts` schemas (except the one UI preference below), commands, the XP ledger, Supabase migrations, `seed.sql`, routes or content text.
- **One allowed state change:** add the CRT preference to the existing UI preferences with a `.default(...)`, so legacy snapshots still parse. Add the matching case to `tests/preferences.test.ts`. Do not bump `version: z.literal(1)`. If UI preferences are local-only, keep it local-only.
- **Tests stay green and meaningful.** Don't delete or weaken assertions to make a restyle pass. If an e2e test selects by visible text or role and the text doesn't change, it should keep passing. Update selectors only where DOM structure genuinely had to change, and say which in the commit.
- **Accessibility holds.** The axe checks in `tests/e2e/polish.spec.ts` must stay green. Body text contrast must be at least 4.5:1 against its panel, including on the scanline texture. Every decorative pixel image gets `alt=""` or `aria-hidden`. Every icon-only button keeps an accessible name. Focus rings stay visible: use a 2px dotted pixel outline in the title-bar dark green, never `outline: none`.
- **Reduced motion.** Under `prefers-reduced-motion: reduce`, the CRT flicker, roll bar, cloud drift and window pop animations are off, and the CRT defaults to off.
- **No copied IP.** The reference was inspired by an in-game UI from Warframe. Do not use its logos, sigils, character art or names. All art is original pixel maps (as in the reference file).
- **Match the house code style.** The codebase is deliberately dense. Match the file you're in. Don't reflow unrelated lines.

### 2. The design system (build this first)

Everything below exists in working form in `docs/design/retro-reference.html`. Port it; don't reinvent it.

#### 2.1 Tokens (CSS custom properties on `:root`)

| Token | Value | Use |
|---|---|---|
| `--title-a` / `--title-b` | `#6f9888` / `#9cc0b2` | title bar gradient (dark → light sage) |
| `--panel` / `--panel-2` | `#d6d6d6` / `#e6e6e6` | window body / inset panels |
| `--hi` / `--lo` | `#ffffff` / `#707070` | bevel highlight / shadow |
| `--outline` | `#2c3833` | 1px outer frame line |
| `--ink` | `#161616` | body text |
| `--link` | `#3434e0` | usernames, links |
| `--accent-red` | `#b02030` | "me" lines, destructive |
| `--alert` | `#f2c94a` | "!" badges, attention |
| `--taskbar` | `#8db0a3` | taskbar / dock |
| `--sky-top` / `--sky-bottom` | `#2f68cc` / `#b9dcf6` | wallpaper fallback gradient |

If the app has existing hobby colors (`content/hobbies.json` → `color`), keep them as accents inside the new frames (icon tiles, XP bars, tree node rims). Don't replace them.

#### 2.2 Typography

- **VT323** via `next/font/google` (self-hosted by Next, no runtime Google request), exposed as `--font-pixel`.
- Base 20–22px. VT323 runs small, so scale the whole type ramp up about 1.25× from current sizes. Headings 26–32px. Never below 18px.
- `text-rendering: optimizeSpeed; -webkit-font-smoothing: none` on pixel text for crisp edges.
- Title bars: white text with `text-shadow: 1px 1px 0 #2c4a3e`.
- If long-form lesson text becomes hard to read in VT323, use a clean fallback (for example `system-ui`) **only** for multi-paragraph lesson bodies, and flag it in the report.

#### 2.3 Sprites (`lib/sprites.ts`)

- Port the `P` palette, the `S` sprite maps and the `draw()` function. Each letter in a map is one pixel, `.` is transparent.
- Render sprites **once at module load on the client** into data URLs (memoized map). Guard `document` for SSR: frames go in a client-side `SpriteStyles` component that sets the CSS variables in an effect, with a static CSS-border fallback so the first paint isn't unstyled. Alternative: pre-render the frame PNGs at build time with a small script into `public/ui/` and reference them from CSS. **Prefer the build-time PNGs** for frames (no flash, cacheable). Use runtime drawing for avatars/icons if the icon set is data-driven.
- Export a `<PixelSprite name size alt />` component (renders `<img>` with `image-rendering: pixelated`).
- **Icon replacement:** every emoji or line icon in the UI chrome (dock, window title bars, nav, close buttons, status badges, hobby tiles) becomes a pixel sprite. Author 12×12 or 16×16 sprites for each hobby icon (tennis, cycling, swimming, journaling, plus any hobbies added since), plus: close, minimize, back, check, lock, XP star, streak flame, gear/loadout, character, skills/tree, quests, settings, sign-out/power, CRT toggle (TV). Keep emoji only where they're user content, not chrome.

#### 2.4 9-slice frames (`border-image`)

| Class | Sprite | Slice / width | Use |
|---|---|---|---|
| `.px-window` | `win` (7×7 @2×) | `6 fill / 6px` | every window/dialog |
| `.px-sunken` | `sunk` (5×5 @2×) | `4 / 4px`, `background-clip: padding-box` | lists, inputs, logs, tree canvas |
| `.px-button` | `btn` → `btnp` on `:active` | `4 fill / 4px` | all buttons |
| `.px-lines` | CSS `repeating-linear-gradient` | — | faint scanline texture inside panels |

Title bar: `title` sprite repeated horizontally, 26px tall, with a pixel icon on the left and a pixel close button on the right.

#### 2.5 Components (`components/ui/retro/`)

Create or restyle, reusing existing components wherever they exist:

- `Window`: title, icon, optional close/back, draggable **only on desktop**, stacking via z-index, step-animated open (`steps(4)`). On mobile (<640px) windows are full-width and stacked, not draggable.
- `Button`: variants `default | primary (sage) | danger (red text) | ghost`, sizes `sm | md`. Pressed = inverted bevel + 1px translate. Disabled = 50% text with a dithered overlay, bevel kept.
- `TextInput`, `Select`, `Textarea`: sunken frame and lined background. `Select` gets a pixel ▼ button.
- `Checkbox` and `Radio`: 12px pixel boxes.
- `Tabs`: raised pixel tabs, selected tab joins the panel (no bottom border). This replaces `HobbyTabs` styling; keep its horizontal-scroll behavior from the hobby-expansion handoff.
- `ListRow`: sunken row with avatar/icon, title, status line (like buddy-list rows).
- `Badge`: yellow "!" bubble sprite (unread, attention); gray dot (inactive); XP pill.
- `ProgressBar`: sunken track, segmented block fill (10–20 discrete blocks, not smooth), hobby color fill.
- `Dialog` / `Toast`: modal = window + darkened, dithered backdrop. Toasts = small windows in the corner like "MALWARE FOUND!" (use for achievement unlocks and level-ups).
- `Tooltip`: yellow sticky-note box, 1px black border.
- `Taskbar`: bottom dock with pixel app icons, unread badges, a tray with the CRT toggle, and a clock. **Map the existing app launcher/nav into it.** Don't add new destinations.

#### 2.6 Screen effects

- **CRT overlay** (`components/ui/retro/crt-overlay.tsx`): fixed, `pointer-events:none`, top z-index. Scanlines, RGB shadow mask, vignette, glare, flicker, roll bar. Pure CSS, from the reference `.crt` block.
- **Glow filter:** the SVG `#crtGlow` filter (RGB split + bloom) applied to the desktop root **only when the CRT preference is on**. It is expensive; never apply it on mobile widths.
- **Wallpaper** (`components/ui/retro/wallpaper.tsx`): PixiJS canvas behind the desktop. Add `pixi.js` as a dependency. The reference uses the **v7** API (`new PIXI.Application({...})`). If you install v8, init is async (`await app.init({...})`) and filters use `Filter.from({gl:{...}})`. Pick one and port the shader accordingly. Load it with `next/dynamic` and `ssr:false`. Destroy the app on unmount. Pause the ticker when `document.hidden`. Fall back to the CSS gradient when WebGL is unavailable or reduced motion is on.
- **Seasonal scene → replaced.** Neo has approved replacing the app's existing seasonal scene with the four reference wallpapers, **ported exactly**: same builder code, colors, seeded RNG and animation. Don't redraw or "improve" them. "Auto" replaces the old season logic; if the app has a season source of truth (for example a `season()` helper), map it: spring→meadow, summer→beach, autumn→fall, winter→city. Remove the old scene components only after the new ones pass the e2e and axe checks, and list the deleted files in the report.
- **Wallpaper picker:** the reference has four scenes, each a builder function in the `SCENES` registry: **Spring Meadow**, **Autumn Hills** (golden hour, tree line, falling leaves), **City Nights** (striped synthwave sun, 3-layer skyline, blinking windows, traffic) and **Summer Beach** (animated surf, sparkles, palm, umbrella, gulls). There's also **Auto (match season)**: Mar–May meadow, Jun–Aug beach, Sep–Nov autumn, Dec–Feb city. Port them as `lib/wallpapers/*.ts`. Each scene is `(ctx) => void` and pushes per-frame updaters. Add the classic **Display Properties** window (monitor preview, scene list, OK/Cancel/Apply) as a taskbar tray app. Persist the choice as `wallpaper: z.enum(['auto','meadow','fall','city','beach']).default('auto')` in UI preferences, next to `crtEffects`, with the same legacy-parse test. "Auto" should reuse the app's existing seasonal logic if it has one, instead of the month table. A good future hook: unlock extra wallpapers as achievement rewards.
- **Aspect ratio:** the scenes are procedural (drawn from `W`/`H` fractions and rebuilt on resize), so there's no fixed ratio and nothing stretches. Keep the reference's rules: horizon and ground by `H` fraction; prop size by `min(W,H)`; seeded RNG (`seed(sceneName)`) so a scene looks the same on every load and resize. Keep the canvas at resolution 1 (the chunky pixels are intentional). Check at 375×812, 768×1024, 1280×800 and 1920×1080.
- **Character rides a chrome surfboard (centre stage):** after each scene, `surfboard(W,H,SURF[scene])` draws Neo's personal board. It's a hovering **silver/chrome shortboard** centred at `(W/2, H*.66)`, length `min(W<700 ? W*.72 : W*.34, 420)`. Detail list, ported exactly: round-pin tail and pointed nose with rocker; rail thickness lit by the scene's ground colour; banded chrome deck with the scene's sky reflected in the upper half; brushed-metal micro-lines; diagonal specular streaks; grooved traction pad with arch bar and kick; pinstripe inlay; stringer with highlight; leash plug and coiled leash; swept fin; engraved "NEO" monogram near the nose; hover glow in the scene colour; tail sparkle trail; a shine that sweeps across every 5s; and a twinkling glint at the nose. The board is drawn once to a 2× offscreen canvas (texture), and its layer (`fg`) sits **outside** the dither shader (`world.filters`, not `stage.filters`) so it stays crisp like the avatar. The **SVG avatar stays a DOM element above the canvas**. Each frame, the board's updater writes the avatar wrapper's `transform` (translate + the board's slight roll, `transform-origin: 50% 100%`) so the feet stay planted as it bobs. The reference's `#hero` sprite is only a stand-in for `<Avatar>`. Replace the positioning in `character-stage.tsx` / `character-centered-home.tsx` with this anchor. Keep the centre ~35% of the width free of big scene props. Under reduced motion: no bob, roll, shine, trail or glint.
- **Sound** (optional, default off): the WebAudio `sfx` helper from the reference, behind a preference. Never autoplay.

#### 2.7 The CRT preference

`crtEffects: z.boolean().default(true)` in UI preferences (default `false` when `prefers-reduced-motion`). Toggle it from the taskbar TV icon and from Settings. Persist it through the existing preference command/path. Don't add a new mechanism.

### 3. Screen-by-screen

Use the audit inventory as the checklist. The known surfaces:

| Surface | Files | Treatment |
|---|---|---|
| Entry / login | `components/entry.tsx` (`EntryGate`, `LoginDialog`) | Boot sequence: a black screen with a 1–2 second typed BIOS-style boot text (skippable, skipped entirely under reduced motion), then a login window on the wallpaper. "Welcome to Gamify.Life!" title bar. |
| Setup wizard | `Setup` (and `components/onboarding/*` if the wizard split landed) | Single installer-style window. Title bar shows `Setup — Step N / M`. BACK / NEXT / SKIP as pixel buttons, bottom-right like a 90s installer. Hobby picker cards = raised tiles with pixel icons. Cost badges become pixel badges, text-first. |
| Character creator | `components/character-creator.tsx`, `item-preview.tsx` | "Character" app window. Slot tabs as pixel tabs. The preview sits in a sunken frame. RANDOMIZE / RESET as buttons. **Don't restyle the SVG paper doll itself** (`avatar.tsx`, `rig-layers.tsx`): it's authored art, so frame it, don't pixelate it. |
| Home / desktop | `character-centered-home.tsx`, `character-stage.tsx`, `hobby-constellation.tsx` | Wallpaper + character on the "desktop". HUD elements become small windows or taskbar tray items. The single contextual CONTINUE action stays the only primary call to action (per the homepage handoff), styled as a primary pixel button. Hobby constellation nodes become pixel icon tiles with hobby-color rims. |
| Skill tree | `components/skills.tsx`, `skill-card.tsx` (React Flow) | Tree canvas in a sunken panel with a subtle pixel grid background. Nodes = mini windows (title bar in hobby color, pixel lock/check/star states). Edges = 2px stepped lines (React Flow `step` or `smoothstep` edge type, no curves), dotted when locked. Controls/minimap restyled as pixel buttons. Node detail = window with lesson steps as a checklist. |
| Quests | quest views in `screens.tsx` | Styled as the **messenger**: each hobby is a "contact" row with the "!" badge when a weekly quest is open, and quest details show as a chat window ("Coach: your swim quest resets Sunday"). Content text is unchanged; only the presentation changes. |
| Loadout / gear | `LoadoutPage` in `screens.tsx` | "Inventory" window: grouped sunken lists, pixel status select, readiness shown as a segmented bar. |
| Achievements / level-up | wherever they're shown | Toast windows like the "MALWARE FOUND!" popup (e.g. "ACHIEVEMENT UNLOCKED!" with an OK button), step-animated in. |
| Settings / profile | settings screens | Control-panel window: preferences as pixel checkboxes, including CRT, sound and reduced motion. |
| Empty, loading, error states | everywhere | Loading = hourglass sprite + "Loading...". Error = classic dialog with a pixel warning icon. Empty = friendly one-liner in a sunken panel. |
| `not-found`, `error.tsx`, favicon, metadata | `app/` | 404 as an "Application not found" dialog. Pixel favicon from a 16×16 sprite. `theme-color` = `--taskbar`. |

### 4. Responsive rules

- ≥1024px: full desktop metaphor, draggable windows, taskbar, CRT glow allowed.
- 640–1023px: windows fixed in a grid, no dragging, taskbar kept.
- <640px: one window at a time, full width. The taskbar becomes a bottom tab bar with the same pixel icons. No SVG glow filter; scanline overlay only.
- Tap targets are at least 44px everywhere. No horizontal page scroll at 375px.

### 5. Performance budget

- No new layout shift on first paint (frames from static PNG/CSS, font via `next/font`).
- Pixi wallpaper: at most 1 canvas, no per-frame allocations, ticker paused when hidden. Lighthouse performance on `/` must not drop more than 5 points versus the before-baseline. Measure both and report them.
- `pixi.js` is loaded only on routes that show the desktop, never in the server bundle.

### 6. Suggested commit sequence

Run the full gate after each commit: `pnpm seed:validate && pnpm typecheck && pnpm lint && pnpm test && pnpm test:e2e && pnpm build`. Run `pnpm exec playwright install chromium` the first time.

1. `chore(design): audit + before screenshots` (docs only)
2. `feat(ui): retro tokens, VT323 font, pixel frames, sprite system`
3. `feat(ui): retro Window/Button/inputs/tabs/badges/progress components` + migrate the shared window and button choke points
4. `feat(ui): taskbar, CRT overlay, glow filter, crtEffects preference` (+ preference test)
5. `feat(ui): pixi wallpaper with dither shader + seasonal tint` (dynamic import, fallbacks)
6. `style(entry): boot screen, login, setup wizard`
7. `style(character): creator + home desktop + constellation`
8. `style(skills): tree canvas, nodes, edges, node detail`
9. `style(screens): quests as messenger, loadout, settings, achievements toasts`
10. `style(app): 404/error/loading/empty states, favicon, metadata`
11. `chore(design): after screenshots + report`

Each commit leaves the branch green. Don't squash visual and behavioral changes together. There shouldn't be behavioral changes.

### 7. Decisions: defaults to use without blocking

1. **Wallpaper tech:** PixiJS as in the reference. If it fights the existing seasonal scene, keep the scene and apply CSS/SVG treatment only, and report.
2. **Lesson body font:** VT323 unless readability suffers; then a system font for long lesson text only.
3. **CRT default:** on for desktop, off for reduced motion, glow never on mobile.
4. **Sound:** implemented but default off.
5. **Boot screen:** once per session (sessionStorage), skippable with any key or tap.
6. **Draggable windows:** desktop only, positions not persisted (session memory only). Persistence would be a follow-up.

### 8. Report back with

- The audit inventory and the final checklist with every surface marked done or deferred.
- Before/after screenshots for every route at 375px and 1280px (`docs/design/screens/{before,after}/`).
- Gate output (seed:validate, typecheck, lint, test counts versus the 102/1 baseline, e2e, build) and Lighthouse before/after.
- Every test selector you changed and why.
- Anything deferred, with the reason.
