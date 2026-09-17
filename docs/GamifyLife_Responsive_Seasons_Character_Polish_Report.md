# Gamify.Life — Responsive Desktop, Seasonal Themes & Character Polish Report

**Document type:** Codex implementation and bug-fix handoff  
**Priority:** High-impact UX polish after current working build  
**Companion documents:** `GamifyLife_Codex_Build_Spec.md` and `GamifyLife_Retro_OS_Design_Handoff.md`  
**Instruction:** Preserve the existing working progression system. This report extends and corrects the current UI; where it conflicts with older visual-layout guidance, this report takes priority.

---

## 1. Objective

The current build is functioning well, but testing exposed several experience problems:

1. The character disappears at smaller viewport sizes.
2. The desktop repeats the same apps already available in the dashboard/dock, wasting space.
3. The character should be a larger visual focus and live opposite the dashboard.
4. The selected hobby nodes/progress should occupy the space between the dashboard and character.
5. Seasonal desktop backgrounds need richer original pixel art and subtle animation.
6. Character art needs substantially more detail, smaller visible pixels, and at least twice the current clothing selection.
7. Hovering over a character body/clothing region should identify it and allow direct editing in Loadout.
8. Beginning a hobby currently requires too much reading and too many screens.
9. Maximized application windows remain too small to display their content comfortably.
10. Every layout must adapt when the screen grows, shrinks, or changes orientation.

The target is a cleaner retro-computer desktop whose main visual story is:

```text
Dashboard summary  ←→  Active hobby nodes/progress  ←→  Player character
```

The application dock remains the place for launching apps. Do not duplicate dock apps as large desktop/dashboard buttons.

---

## 2. Implementation strategy

Treat this as five separate passes:

1. **Responsive layout and disappearing-character bug.**
2. **Desktop information architecture and true maximize.**
3. **Seasonal themes and animation system.**
4. **Higher-detail character, expanded wardrobe, and direct editing.**
5. **Simplified hobby quick-start flow.**

After every pass, run lint, typecheck, tests, production build, and visual checks at the viewport matrix in Section 15. Do not combine all changes into one unreviewed rewrite.

---

## 3. Critical bug: character disappears at smaller sizes

### Expected behavior

The character must never be hidden solely because the screen becomes smaller. It may scale, move to a new grid area, or appear inside a compact character panel, but it must remain visible and selectable at every supported size.

### Likely causes to investigate

- A breakpoint applies `display: none`, `visibility: hidden`, or zero opacity.
- The character is absolutely positioned outside a shrinking container.
- A parent uses `overflow: hidden` and clips the sprite.
- Fixed pixel dimensions exceed the available grid track.
- Character art is anchored with viewport coordinates rather than container coordinates.
- A flex child is allowed to shrink to zero.
- Incorrect z-index places the character behind wallpaper, dashboard, or window layers.

Do not merely remove one media query. Fix the layout architecture.

### Required responsive solution

Create a stable `CharacterStage` component with its own aspect ratio and minimum dimensions:

```css
.characterStage {
  position: relative;
  inline-size: min(100%, 28rem);
  min-inline-size: 10rem;
  aspect-ratio: 3 / 4;
  contain: layout paint;
  overflow: visible;
}

.characterSprite {
  position: absolute;
  inset-inline-start: 50%;
  inset-block-end: 0;
  transform: translateX(-50%);
  inline-size: clamp(8rem, 22cqi, 20rem);
  max-block-size: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}
```

Use container queries where supported and sensible. The character should scale relative to its stage, not directly to the browser viewport.

### Breakpoint behavior

| Available desktop width | Character behavior |
|---|---|
| ≥1200px | Full-height character stage opposite dashboard |
| 900–1199px | Slightly smaller character; three-zone layout retained |
| 640–899px | Two-row layout; character remains in a dedicated side or lower panel |
| <640px | Compact character card at top, minimum ~140px tall; never hidden |

At very short heights, reduce decorative empty space before reducing the character below a recognizable size.

### Acceptance tests

- Character remains visible at 320×568, 375×667, 390×844, 768×1024, 1024×768, 1366×768, and 1920×1080.
- Resizing continuously does not make the character flicker, jump off-screen, or collapse to zero.
- Opening the dock on any edge does not cover the character’s face or primary equipment.
- The character remains clickable/tappable after reflow.
- No horizontal page scrollbar appears because of the character.

---

## 4. Desktop layout: remove duplication and establish three zones

### Problem

The desktop currently appears to repeat the same applications already found in the dashboard or launcher. This uses valuable space without adding information and crowds out the character.

### New rule

- **Dock:** launches applications.
- **Dashboard:** shows condensed status and immediate next actions.
- **Desktop center:** shows active hobby progression nodes.
- **Character area:** shows the player and equipped rewards.
- Do not show duplicate application-launch cards in the dashboard body.

### Desktop content

The dashboard summary should contain only:

- Player name and Life Level.
- Total XP/next Life Level.
- Up to three active quests.
- One `CONTINUE` recommendation.
- Today/recent activity summary.
- Compact save/cloud status.

Applications remain exclusively in the dock/menu:

- My Hobbies
- Skill Map
- Quest Log
- Character
- Loadout
- Achievements
- Calendar
- Settings

### Three-zone desktop component

Create a `DesktopHeroLayout` with named areas:

```text
┌────────────────────────────────────────────────────────────┐
│ DASHBOARD SUMMARY │ ACTIVE HOBBY NODES │ CHARACTER STAGE   │
└────────────────────────────────────────────────────────────┘
```

The active-node area should feel integrated with the wallpaper rather than like another large app window. Use 3–7 visible nodes from the selected hobby:

- Previous completed node.
- Current/recommended node.
- One to three nearby available nodes.
- Faint locked next node(s).
- Short hobby level/XP strip.

Clicking a node opens its full Skill Map or Node Detail app. This area is a progress preview, not a second complete skill tree.

---

## 5. Opposite-side positioning for dashboard and character

The user may position the dashboard on any edge. The character must automatically occupy the opposite edge, with the hobby-node preview between them.

### Pairing rules

| Dashboard position | Character position | Node-preview flow |
|---|---|---|
| Left | Right | Horizontal, left → right |
| Right | Left | Horizontal, right → left |
| Top | Bottom | Vertical, top → bottom |
| Bottom | Top | Vertical, bottom → top |

This setting is separate from dock position. A user may place the dock at the bottom and dashboard on the left, for example.

### State

```ts
type DesktopLayoutPreferences = {
  dashboardEdge: 'left' | 'right' | 'top' | 'bottom';
  dockPosition: 'left' | 'right' | 'top' | 'bottom';
  themeId: SeasonalThemeId;
  animationIntensity: 'off' | 'low' | 'normal';
};
```

### CSS layout recommendation

Use CSS Grid named areas. Avoid creating four entirely separate DOM trees.

```css
.desktopHero[data-dashboard-edge='left'] {
  grid-template-areas: 'dashboard nodes character';
  grid-template-columns: minmax(16rem, 23%) minmax(18rem, 1fr) minmax(15rem, 29%);
}

.desktopHero[data-dashboard-edge='right'] {
  grid-template-areas: 'character nodes dashboard';
  grid-template-columns: minmax(15rem, 29%) minmax(18rem, 1fr) minmax(16rem, 23%);
}

.desktopHero[data-dashboard-edge='top'] {
  grid-template-areas: 'dashboard' 'nodes' 'character';
  grid-template-rows: auto minmax(10rem, 1fr) minmax(13rem, 36%);
}

.desktopHero[data-dashboard-edge='bottom'] {
  grid-template-areas: 'character' 'nodes' 'dashboard';
  grid-template-rows: minmax(13rem, 36%) minmax(10rem, 1fr) auto;
}
```

At widths below 900px, choose a safe automatic arrangement rather than forcing three narrow columns. Preserve the user’s preference for the next wide-screen visit, but temporarily render:

```text
Character card
Active hobby nodes
Dashboard summary
```

On mobile, allow the user to swipe/tap between these three sections or stack them; do not hide any section.

### Controls

Add `Desktop Layout` settings with clear buttons for dashboard edge and dock edge. Keyboard and touch users must be able to change placement without dragging.

---

## 6. Seasonal desktop theme system

### Goal

Users can personally choose a detailed animated seasonal pixel-art desktop: Fall, Summer, Winter, or Spring. Themes are permanent preferences for authenticated users and session-only for guests.

Each theme is a layered scene, not a single flat image:

```text
sky/background gradient
distant scenery
midground environment
foreground framing
ambient animated particles/creatures
lighting/color overlay
```

Keep all art original or properly licensed. The uploaded images are quality/detail references only.

### Fall — warm woodland

- Golden-hour sky in muted peach/orange.
- Detailed amber, red, and brown trees.
- Leaf-covered path or meadow.
- Warm cabin/window lights in the distance.
- Animated leaves falling and occasionally drifting sideways.
- Optional small squirrel/bird ambient sprite.

Animation:

- 10–20 leaf particles at normal intensity.
- Varied fall speed and gentle rotation.
- Particles recycle off-screen without accumulating DOM nodes.

### Summer — lake/beach/mountains

- Bright blue sky and saturated but harmonious colors.
- Mountain lake or beach shoreline.
- Trees/grass framing the lower edges.
- Animated water shimmer or small shoreline waves.
- Slowly moving clouds.
- Optional butterfly or distant bird.

Animation:

- Wave/shimmer sprites use CSS steps or a small canvas layer.
- Avoid moving the entire background image.

### Winter — snowy city

- Cozy city block or park at dusk.
- Snow-covered trees, rooftops, benches, and streetlights.
- Warm yellow window lights contrast with blue-gray snow.
- Layered snowfall: small distant flakes and a few larger foreground flakes.
- Optional visible breath puff near character in idle animation.

Animation:

- Cap snow particles.
- Use two or three depth layers with different speeds.

### Spring — flower fields

- Soft blue/cream sky.
- Flower field with detailed grass and flowering trees.
- Bees moving between flowers.
- Occasional petals drifting.
- Gentle brightness; avoid overly neon greens.

Animation:

- Bees follow short bounded paths rather than random full-screen movement.
- Petals move slowly and sparsely.

### Theme selector

Add a `DESKTOP THEMES` section in Settings and optionally a small wallpaper icon on the desktop. Show four live miniature previews. Choosing one updates immediately; provide `APPLY`, `CANCEL`, and animation-intensity controls.

### Theme data contract

```ts
type SeasonalThemeId = 'fall' | 'summer' | 'winter' | 'spring';

type SeasonalTheme = {
  id: SeasonalThemeId;
  name: string;
  palette: Record<string, string>;
  backgroundLayers: ThemeLayer[];
  animationLayers: ThemeAnimationLayer[];
  characterLighting: {
    shadowColor: string;
    highlightColor: string;
  };
};
```

### Animation performance rules

- Target smooth animation on ordinary laptops and phones.
- Prefer CSS transforms and opacity; avoid layout-changing animation.
- Reuse a small particle pool; do not continuously append DOM nodes.
- Pause animation when the tab is hidden.
- Reduce or disable animation when `prefers-reduced-motion` is active.
- Provide Off/Low/Normal controls.
- Do not animate behind maximized opaque windows when it cannot be seen.
- Do not let background animation intercept pointer events.
- Keep theme bundle sizes controlled; lazy-load theme assets after initial desktop entry.

---

## 7. Character art upgrade: more detail with smaller pixels

### Artistic target

The character should remain clearly pixel art, but use a higher internal pixel resolution so clothing, hair, accessories, body shape, and facial details read better. The goal is not a smooth vector/cartoon character.

Use the references for these principles:

- Distinct silhouettes and body proportions.
- Multiple clothing layers.
- Visible belts, pockets, cuffs, collars, folds, and equipment.
- Front, three-quarter, side, and back design consistency.
- A small facial-expression set.
- Hobby props that look integrated rather than pasted on.

Do not reproduce the exact referenced packs, fantasy characters, faces, or equipment.

### Sprite resolution

Audit the current source resolution. Increase internal sprite detail approximately 1.5×–2× while keeping screen size similar. Recommended target:

- Source canvas: 128×192 pixels per character pose, or another consistent 2:3 canvas.
- Render size: controlled with `clamp()`; nearest-neighbor/pixelated rendering.
- Use actual tiny pixels rather than scaling a low-detail 32px sprite excessively.

### Required views and animation

MVP polish target:

- Front or three-quarter idle view for desktop.
- Left/right side view.
- Back view for loadout inspection.
- Idle animation: 4–8 frames.
- Optional small victory animation after major unlock.
- Expression variants: neutral, happy, focused, curious, tired, victory.

Do not build combat animations. Props such as the fountain-pen sword are visual achievements, not weapons used in gameplay.

### Layer order

```text
ground shadow
body/skin
face/eyes/expression
hair back
underlayer/top
bottoms
socks/leg accessory
shoes
outerwear
hair front
headwear
face accessory
neck accessory
back item
held hobby prop
foreground aura/effect
```

Every layer uses the same canvas, origin, baseline, and anchor metadata.

---

## 8. Double the character customization options

First audit the current option counts. For each existing clothing category, ship at least twice as many selectable options as currently exist. Also meet these minimum targets where possible:

| Category | Minimum target |
|---|---:|
| Skin tones | 8 |
| Hair styles | 16 |
| Hair colors | 10 |
| Eye/face details | 8 |
| Basic tops | 12 |
| Bottoms | 10 |
| Outerwear | 8 |
| Shoes | 10 |
| Head accessories | 10 |
| Face accessories | 6 |
| Bags/back items | 8 |
| Hobby props | 3+ per initial hobby over progression |

Basic identity representation remains unlocked at creation. Progression should unlock special styles and hobby-specific items, not ordinary skin tones or common hair textures.

### Clothing design variety

Include visibly different silhouettes rather than only recolors:

- T-shirts, sweater, hoodie, button-up, tank, long-sleeve, retro computer sweatshirt.
- Jeans, joggers, shorts, skirt, wide-leg pants, athletic pants.
- Light jacket, cardigan, raincoat, varsity jacket, utility vest.
- Sneakers, boots, sandals, court shoes, cycling shoes, swim sandals.

Color variants may supplement but must not substitute for actual option variety.

### Hobby unlock examples

- Journaling: fountain-pen sword, feather quill, ink satchel, notebook holster, page-particle aura.
- Tennis: racket, visor, wristbands, racket bag, tennis-ball companion.
- Cycling: helmet, messenger bag, tool roll, gloves, miniature frame-shaped back prop.
- Swimming: goggles, cap, towel cape, kickboard back item, droplet trail.

---

## 9. Hover/tap character to edit Loadout

### Desktop behavior

When the pointer moves over the character, detect the topmost visible editable layer under the pointer. Highlight that item with a subtle one-pixel outline or palette-safe glow and show a small label:

```text
HOODIE — CLICK TO EDIT
HAIR — CLICK TO EDIT
GLASSES — CLICK TO EDIT
HELD ITEM — CLICK TO EDIT
```

Clicking opens the Loadout app directly to the corresponding category and current item.

### Mobile/touch behavior

- First tap highlights the part and shows its label.
- Second tap or an `EDIT` button opens the correct Loadout category.
- Tapping empty space clears selection.
- Also provide a conventional `EDIT CHARACTER` button; direct selection cannot be the only route.

### Implementation options

Preferred: each sprite layer includes a transparent hit-mask or simplified polygon. Do not depend on rectangular DOM boxes for every layer because they overlap heavily.

```ts
type AvatarHitRegion = {
  itemId: string;
  slot: AvatarSlot;
  maskAsset?: string;
  polygon?: Array<{ x: number; y: number }>;
  priority: number;
};
```

Hit testing rules:

1. Convert pointer coordinates into source-sprite coordinates.
2. Test equipped visible regions highest priority/top layer first.
3. Ignore fully transparent pixels.
4. Highlight only one item at a time.
5. Expose the same parts through a keyboard-accessible list beside/below the character.

Avoid highlighting the whole body when the pointer is clearly over a shirt, jacket, hair, or accessory.

---

## 10. Active hobby-node preview beside the character

### Purpose

The desktop should immediately show what the player is learning without requiring them to launch the Skill Map first.

### Content

Show one compact path per active hobby, or a selected-hobby path with hobby-switch tabs if space is limited.

Each preview includes:

- Hobby icon/name and level.
- Current XP segmented bar.
- Current node, visually strongest.
- Last completed node.
- Next available node(s).
- One faint locked future node.
- Tiny quest-progress indicator.

Clicking a node opens its details. Clicking the hobby title opens the full Skill Map.

### Adaptive behavior

- Wide horizontal layout: a curved/horizontal chain across the space between dashboard and character.
- Top/bottom dashboard layout: vertical chain.
- Medium layout: 3-node compact chain.
- Mobile: horizontal scroll-snap strip beneath the character.

Do not render the entire hobby tree on the desktop. That would recreate the clutter this change is intended to fix.

---

## 11. Simplify “Get Started” and reduce reading

### Problem

The current start experience asks the user to click Get Started, choose a hobby on another full screen, then read too much before performing a first action.

### New quick-start rule

The user should reach a clear first action in no more than two decisions:

1. Click `GET STARTED`.
2. Choose a hobby, or accept the highlighted hobby if already chosen.

Immediately show a concise `FIRST QUEST` card. Do not require a long introductory lesson first.

### Quick-start chooser

Open as a lightweight desktop dialog or overlay—not a separate empty page—with the four hobby choices. Each tile shows only:

- Name and pixel icon.
- One-line description.
- Estimated time to first session.
- Estimated minimum starting cost or `USE WHAT YOU OWN`.

If the player selected hobbies during onboarding, highlight those first and offer `CONTINUE [HOBBY]`.

### First Quest card

Above the fold, display:

```text
[HOBBY] — FIRST QUEST

YOU NEED
• 1–3 essential items only

TIME TO START
• About 10 / 20 / 30 minutes

DO THIS FIRST
• One clear real-world action

[START QUEST]   [MORE DETAILS]
```

Limit the default card to approximately 80–120 words. Put explanations, rules, buying advice, and common mistakes behind expandable sections:

- What to buy
- Rules & safety
- How to do it
- Common mistakes
- Resources

### Example first quests

**Tennis**

- Need: borrowed/basic racket, a few balls, safe shoes, access to a wall or court.
- Time: 20 minutes.
- First action: learn ready position and make 20 controlled self-drop contacts.

**Cycling**

- Need: working bike and properly fitted helmet.
- Time: 15 minutes.
- First action: complete the ABC check and practice five smooth starts/stops in a safe area.

**Swimming**

- Need: supervised pool access and safe swimwear; goggles optional.
- Time: 20 minutes.
- First action: review safety, then practice relaxed exhaling in shallow water with supervision.

**Journaling**

- Need: any paper/notebook and any pen already owned.
- Time: 5 minutes.
- First action: write continuously for five minutes; no formatting required.

### Progressive disclosure

Never remove important safety information. Place the essential safety rule directly on the first card and the expanded explanation under `RULES & SAFETY`.

---

## 12. True maximize for desktop application windows

### Problem

The current “maximized” state remains too small and prevents information-heavy apps from using the available computer screen.

### Required behavior

Maximize means fill the entire usable simulated-screen workspace, excluding only:

- OS menu/status bar.
- Dock when configured to remain visible.
- Required safe-area padding.

It must ignore the app’s normal `max-width` and centered-dialog constraints.

```css
.retroWindow[data-maximized='true'] {
  position: absolute;
  inset: var(--menu-bar-size) 0 0 0;
  inline-size: 100%;
  block-size: calc(100% - var(--menu-bar-size));
  max-inline-size: none;
  max-block-size: none;
  transform: none;
  border-radius: 0;
}

.desktop[data-dock='left'] .retroWindow[data-maximized='true'] {
  inset-inline-start: var(--dock-size);
  inline-size: calc(100% - var(--dock-size));
}
```

Adjust analogous insets for right/top/bottom docks. Use measured CSS variables rather than duplicated magic numbers.

### Window behavior

- Maximize button toggles maximized/restored state.
- Double-clicking the title bar toggles maximize on desktop.
- Remember the previous position and size for restore.
- Fullscreen mobile apps occupy the complete app area automatically.
- Maximized content gets its own internal scroll; the desktop itself should not scroll behind it.
- Node details, Skill Map, Loadout, Calendar, and Character apps must meaningfully reflow to use the extra width rather than remaining a narrow centered column.

### Content-width guidance

Long paragraphs should still have readable line length. A maximized window can use multiple columns/panels:

- Navigation/filter rail.
- Primary content.
- Context/details panel.

Do not stretch a single paragraph to 180 characters per line.

---

## 13. Seasonal and character settings persistence

Authenticated users persist:

- Theme selection.
- Animation intensity.
- Dashboard edge.
- Dock edge.
- Character equipment and cosmetic colors.
- Last selected hobby for node preview.
- Window geometry and maximize state if that is already persisted.

Guests keep these only in the current session, consistent with the latest guest-mode decision.

Provide safe defaults if old stored preferences do not have these fields. Add a schema version and migration rather than crashing on legacy data.

```ts
type UiPreferencesV2 = {
  schemaVersion: 2;
  themeId: SeasonalThemeId;
  animationIntensity: 'off' | 'low' | 'normal';
  dashboardEdge: Edge;
  dockPosition: Edge;
  selectedPreviewHobbyId?: string;
};
```

---

## 14. Accessibility and performance requirements

- Seasonal animation respects `prefers-reduced-motion` and the in-app setting.
- Background animation is decorative and `aria-hidden`.
- Hover-to-edit has keyboard and touch equivalents.
- The character never becomes the only way to access Loadout.
- Nodes use label/icon/state in addition to color.
- Dashboard/character edge controls are real buttons/radio options.
- Character and theme art must not cause cumulative layout shift after loading; reserve aspect-ratio space.
- Lazy-load non-selected themes and advanced wardrobe assets.
- Preload only the currently equipped avatar layers.
- Keep transparent sprite dimensions trimmed where compatible with anchor metadata.
- Pause idle/theme animation when the page is hidden.
- Provide alt text that describes equipped appearance concisely, e.g. “Pixel character wearing a green hoodie, dark jeans, glasses, and carrying a quill.”

---

## 15. Visual test matrix

Test every major change at:

| Viewport | Purpose |
|---|---|
| 320×568 | Minimum narrow phone |
| 375×667 | Small phone |
| 390×844 | Modern phone |
| 768×1024 | Portrait tablet |
| 1024×768 | Landscape tablet/small laptop |
| 1280×720 | Short laptop screen |
| 1366×768 | Common laptop |
| 1440×900 | Desktop/laptop |
| 1920×1080 | Large desktop |

For 1024px and larger, test all 16 dock/dashboard edge combinations at least through automated layout assertions, then visually inspect representative combinations:

- Dock bottom + dashboard left.
- Dock left + dashboard top.
- Dock top + dashboard right.
- Dock right + dashboard bottom.

Also test 200% browser zoom and reduced-motion mode.

---

## 16. Automated test requirements

### Responsive tests

- Character stage exists and has a non-zero bounding box at all target viewports.
- Character is within the visible desktop bounds.
- No accidental `display:none` applies to the character at any breakpoint.
- Node preview and dashboard remain reachable.
- No horizontal document overflow.

### Layout tests

- Dashboard left produces character right, and vice versa.
- Dashboard top produces character bottom, and vice versa.
- Preference survives reload for authenticated repository mock.
- Mobile fallback does not overwrite the user’s saved wide-screen preference.

### Theme tests

- All four themes load.
- Reduced motion disables decorative animation.
- Theme switch does not reset app state or progression.
- Hidden document pauses theme animation.

### Character tests

- Equipped layers render in correct z-order.
- Hit testing selects the topmost visible item.
- Click opens Loadout in the matching category.
- Keyboard list can select the same categories.
- Asset failure shows a safe fallback sprite without collapsing layout.

### Window tests

- Maximize fills usable workspace for every dock edge.
- Restore returns the prior geometry.
- Maximized content scrolls internally.
- Resize does not leave a restored title bar off-screen.

### Quick-start tests

- New user reaches First Quest in two decisions or fewer.
- Essential gear, time estimate, first action, safety, and XP are visible without opening More Details.
- Starting the quest updates node/quest state correctly.

---

## 17. Implementation checklist

- [ ] Diagnose and fix character disappearance structurally.
- [ ] Create `CharacterStage` with responsive container scaling.
- [ ] Remove duplicate application tiles/cards from dashboard body.
- [ ] Implement three-zone `DesktopHeroLayout`.
- [ ] Add dashboard-edge preference and opposite character placement.
- [ ] Add adaptive active-hobby node preview.
- [ ] Implement true window maximize/restore for every dock edge.
- [ ] Create seasonal theme data model and settings UI.
- [ ] Create original Fall, Summer, Winter, and Spring layered pixel scenes.
- [ ] Add performant particles/ambient animation with Off/Low/Normal settings.
- [ ] Raise character source resolution and retain crisp nearest-neighbor rendering.
- [ ] At least double all existing clothing categories and meet target counts.
- [ ] Add consistent front/side/back character views and idle frames.
- [ ] Implement character hit regions and hover/tap highlighting.
- [ ] Deep-link highlighted character parts into matching Loadout category.
- [ ] Add keyboard-accessible character-part list.
- [ ] Replace long startup reading with quick-start chooser and concise First Quest card.
- [ ] Place extended information behind progressive-disclosure sections.
- [ ] Migrate old UI preference data safely.
- [ ] Test all viewport and representative dock/dashboard combinations.
- [ ] Run accessibility checks, lint, typecheck, unit tests, E2E tests, and production build.

---

## 18. Definition of done

This update is complete only when:

- The character is always visible, recognizable, and editable across supported sizes.
- The desktop no longer wastes space by repeating the same application launchers.
- Dashboard, hobby-node preview, and character form one coherent main scene.
- Dashboard placement works on all four edges and character placement correctly mirrors it.
- All four seasonal themes are detailed, selectable, animated, performant, and motion-accessible.
- Character pixels are visibly smaller/more detailed without becoming blurry.
- Clothing/customization selection is at least doubled and includes meaningful silhouette variety.
- Hover/tap accurately highlights equipped clothing/accessories and opens the correct Loadout editor.
- A beginner can move from Get Started to a clear first real-world quest in two decisions or fewer.
- First Quest immediately answers: “What do I need?”, “How long will this take?”, and “What do I do?”
- Maximized apps actually use the full available simulated screen.
- No regression occurs in XP, quests, unlocks, guest/session rules, or authenticated persistence.

The final desktop should feel less like a menu of app cards and more like a living pixel world: the player’s progress sits beside them, the weather and season give the computer personality, and the next real-life action is always simple to understand.

