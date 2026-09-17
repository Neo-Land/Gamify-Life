# Gamify.Life — Character-Centered Homepage & Modular Scene Handoff

**Document type:** Codex implementation directive  
**Project checkpoint:** `v0.2-retro-desktop-checkpoint`  
**Checkpoint branch:** `design/character-centered-home`  
**Purpose:** Refactor the homepage into a cleaner, character-first pixel scene with modular seasonal environments, body types, theme-aware controls, and expandable hobby-progress branches.

This handoff complements:

- `GamifyLife_Codex_Build_Spec.md`
- `GamifyLife_Retro_OS_Design_Handoff.md`
- `GamifyLife_Responsive_Seasons_Character_Polish_Report.md`

Where homepage layout guidance conflicts, this document takes priority. Preserve the existing progression engine, XP, authentication, session-only guest behavior, quests, hobby content, app windows, and saved checkpoint.

---

## 1. Product decision

The homepage should no longer feel like a dashboard containing many competing cards. It should feel like the player has entered a living pixel scene inside the retro computer.

The visual priority is:

```text
1. Player character
2. Current hobby progress / next action
3. Seasonal environment
4. Compact Life Level and quest status
5. Application launcher/dock
```

The character is the focal point. Hobby progress branches outward from the character only when the player asks for it. Other information remains available through the dock, small HUD elements, or collapsible panels.

### Homepage rule

If an element does not answer one of these questions, remove it from the default homepage:

- Who is my character becoming?
- What am I currently learning?
- What should I do next?
- How do I open another app?

---

## 2. What to remove or collapse

Do not display the following as large permanent homepage cards:

- Full app grid.
- Large duplicate My Hobbies card.
- Large duplicate Quest Log card.
- Large Character/Loadout launcher card.
- Large Achievements card.
- Full recent-activity list.
- Multiple competing Continue buttons.
- Complete skill trees.
- Long educational text.

Applications remain available in the dock and OS menu.

Convert useful homepage information into a compact HUD:

- Player name and Life Level.
- Thin/segmented Life XP bar.
- Current quest summary.
- Save/cloud status.
- One contextual `CONTINUE` action.

The HUD may collapse into small tabs or icon buttons. It must not cover the character or the hobby constellation.

---

## 3. Default homepage composition

### Wide desktop

```text
┌─────────────────────────────────────────────────────────────┐
│ OS MENU       LIFE LV / XP                 SAVE / SETTINGS │
│                                                             │
│                  seasonal pixel scene                       │
│                                                             │
│                   [character focal point]                   │
│                           ◉                                 │
│                                                             │
│             [CURRENT QUEST — compact ribbon]                │
│                                                             │
│                    movable application dock                 │
└─────────────────────────────────────────────────────────────┘
```

The character should occupy approximately 28–42% of usable screen height depending on viewport proportions. Leave intentional negative space around the character for expandable hobby branches.

### Default collapsed state

- Character visible and gently animated.
- Seasonal environment visible.
- A single central progress medallion/node near the character.
- Compact quest ribbon.
- Hobby branches hidden.
- Dock visible according to saved preference.

### Expanded hobby state

Clicking the character or central progress medallion expands the player’s active hobbies as nodes around the character. This behaves like a spatial dropdown/constellation, not a traditional vertical menu.

```text
                    [Swimming]
                         │
      [Cycling] ── [YOU / PROGRESS] ── [Tennis]
                         │
                    [Journaling]
```

The layout may use an arc, diamond, or radial arrangement depending on available space. It must not appear as a perfect circle when that would obscure the character.

---

## 4. Hobby constellation interaction

### Level 0 — collapsed

Show one central progress node close to the character:

- Label: `YOUR PATH`, `PROGRESS`, or a compact Life Level emblem.
- Small idle pulse only when motion is enabled.
- Tooltip: `View your hobbies`.

### Level 1 — hobby branches

On click/tap/Enter:

- Reveal active hobby nodes around the character.
- Each node shows hobby icon, current level, and a small progress ring.
- Draw pixel-art branch connectors from the central node.
- Stagger the reveal animation by 40–80ms.
- Keep all nodes within the scene safe area.
- Escape, clicking empty space, or pressing the center again collapses the menu.

### Level 2 — selected hobby progress

Selecting a hobby node expands only that hobby’s nearest progress nodes:

- Previous completed node.
- Current/recommended node.
- Up to two available next nodes.
- One faint locked future node if space allows.

All other hobby nodes reduce in emphasis but remain reachable.

```text
                         [Serve I 🔒]
                              │
 [Tennis Lv.2] ── [Forehand ✓] ── [Five-shot rally →]
                              │
                       [Footwork available]
```

Selecting a progress node opens the existing Node Detail or Skill Map application. Do not duplicate its full content on the homepage.

### Information visible on hover/focus

- Node title.
- Status: Completed, Available, In Progress, or Locked.
- XP reward if incomplete.
- One-line quest description.
- `Open node` action.

### State rules

- Only one hobby progress branch may be expanded at once.
- Remember the last selected hobby for the current session.
- Authenticated users may persist the last selected hobby.
- Collapsing the constellation does not modify progress.
- Locked nodes explain prerequisites when opened/focused.

### Accessible alternative

Provide a keyboard-accessible `HOBBY PROGRESS` button that opens a normal list/tree view. The constellation is a visual navigation method, never the sole method.

---

## 5. Responsive constellation layout

Do not hardcode node coordinates only for one screen size. Generate candidate positions relative to the character and choose positions that fit the safe area.

### Suggested algorithm

1. Obtain character anchor rectangle.
2. Define an exclusion rectangle around the character silhouette.
3. Define safe viewport boundaries excluding menu bar, dock, and quest ribbon.
4. Generate candidate points on arcs around the character.
5. Score points by distance from exclusions, edge clearance, and connector overlap.
6. Place active hobby nodes at the highest-scoring positions.
7. If insufficient room, switch from radial to side arc or horizontal strip.

### Layout modes

| Scene width | Hobby navigation |
|---|---|
| ≥1200px | Radial/diamond constellation around character |
| 900–1199px | Two side arcs or four-corner arrangement |
| 640–899px | Horizontal arc below character |
| <640px | Scroll-snap hobby strip/bottom sheet after center-node tap |

On mobile, preserve the metaphor by animating branches into a bottom panel, but prioritize readability and touch targets over geometry.

### Node sizing

- Minimum pointer target: 44×44 CSS px.
- Visible pixel medallion can be smaller inside the target.
- Use `clamp()` for node sizing.
- Do not scale text below readable sizes.

---

## 6. Modular character-centered scene system

### Core requirement

The background must compose itself around the character’s actual position. The character should not appear pasted on top of a static wallpaper whose path, street, or perspective points somewhere else.

Every theme receives a shared scene anchor:

```ts
type SceneAnchor = {
  x: number; // normalized 0..1 horizontal position
  y: number; // normalized 0..1 ground/baseline position
  facing: 'left' | 'right' | 'forward';
  characterWidth: number;
  characterHeight: number;
};
```

Expose it as CSS custom properties when possible:

```css
.scene {
  --character-x: 0.5;
  --character-ground-y: 0.78;
  --character-scale: 1;
}
```

Scene layers, vanishing points, trail openings, shadows, foreground foliage, and particles derive from this anchor.

### Layer model

```text
sky / far color field
distant architecture or landscape
perspective geometry layer
midground environment
character ground plane and shadow
character
foreground framing elements
ambient effects / particles
UI constellation and HUD
```

Keep UI nodes above environmental art. Decorative layers must use `pointer-events: none`.

### Asset recommendation

Use original layered pixel PNG/WebP sprites or carefully constructed pixel SVG where crisp pixel alignment can be guaranteed. Avoid one giant background image for the entire scene.

Each theme should supply:

- Left framing tile/layer.
- Right framing tile/layer.
- Stretchable or tileable center environment.
- Perspective/path layer centered on the scene anchor.
- Foreground framing elements.
- Ambient animation sprites.
- Theme palette tokens.
- Button/window accent assets.

---

## 7. City street perspective theme

The city scene should use the character as the visual vanishing-point subject.

### Composition

- Character’s ground point sits near the street centerline or sidewalk focal opening.
- Building edges and road/sidewalk perspective lines converge near `--character-x`.
- Street furniture balances the opposite side of any open HUD panel.
- Warm window lights retain the cozy retro feeling.
- Foreground curb, lamp, bicycle rack, or tree can frame the lower corners.

### Adaptive behavior

Do not skew a finished bitmap with arbitrary transforms. Build the street using modular perspective assets:

- Left building/sidewalk wedge.
- Right building/sidewalk wedge.
- Center road/path strip.
- Repeatable skyline or building facade.
- Foreground props with anchor-aware placement.

The center road/path strip positions itself under the character. Side wedges expand or contract to meet it.

```ts
streetVanishingX = clamp(sceneAnchor.x, 0.30, 0.70)
```

When the character moves left or right, foreground props redistribute into available space rather than simply sliding every element equally.

---

## 8. Fall trail perspective theme

### Composition

- Character stands at the readable opening of a woodland trail.
- Trail narrows toward the distant background and widens at the character’s feet.
- Trees create a natural frame while leaving constellation safe zones.
- Warm oranges, rust, ochre, burgundy, and muted evergreen dominate.
- Leaves accumulate near the ground plane but never hide character shoes or nodes.

### Adaptive trail

Construct the trail using:

- Distant trail opening.
- Left trail boundary.
- Right trail boundary.
- Tileable central ground fill.
- Foreground leaf clusters.

Move the distant opening and near-path center using `--character-x`. Use masks or predesigned stepped variants rather than smoothly warping pixels.

Recommended discrete compositions:

- Character left-biased.
- Character centered.
- Character right-biased.

Interpolate only placement between these variants; do not stretch the pixel artwork into blur.

---

## 9. Summer, winter, and spring anchor behavior

### Summer shore or lake

- Shoreline or lake reflection creates an opening around the character.
- Mountain valley may converge behind the character.
- Animated waves remain behind the character baseline.
- Foreground grass/rocks frame empty corners.

### Winter city/park

- Snowy walkway or street converges toward the character.
- Streetlights balance the composition around their position.
- Snowbanks avoid covering shoes and held items.
- Snowfall moves across the whole scene but slows/clears slightly around critical UI.

### Spring flower field

- Flower rows or a subtle footpath guide the eye toward the character.
- Bees and petals avoid the character’s face and open nodes.
- Flower density may increase in unused space and decrease inside UI safe zones.

---

## 10. Scene-safe zones and character positioning

Allow the character to be positioned left, center, or right on wide screens. Top/bottom placement from prior experiments should be treated as responsive layout modes, not as a literal upside-down or floating character.

```ts
type CharacterScenePosition = 'left' | 'center' | 'right' | 'auto';
```

`auto` chooses the position offering the clearest composition based on dock edge, open HUD panels, and screen aspect ratio.

### Safe-zone contract

```ts
type SceneSafeZones = {
  character: DOMRect;
  face: DOMRect;
  constellation: DOMRect[];
  dock: DOMRect;
  hud: DOMRect[];
};
```

Environmental effects and foreground props must not cover these zones above defined opacity thresholds.

### Mobile behavior

- Character remains centered or slightly above center.
- Background switches to portrait composition.
- Large foreground framing assets simplify or disappear.
- Character remains at least ~140px tall when space permits.
- Hobby strip appears below rather than on top of the character.

---

## 11. Character style direction

Use the previously supplied detailed side-view and animation sprite references for visual principles only. Create original assets.

### Desired qualities

- Human proportions more detailed than a chibi or 32px sprite.
- Clearly visible hands, shoes, hair silhouette, clothing layers, and hobby props.
- Small crisp pixels, limited palettes, and strong outlines.
- Subtle idle movement rather than exaggerated bouncing.
- Equipment feels attached to the body with correct hand/back anchors.
- Clothing meaningfully changes silhouette.

### Recommended source scale

- Source frame around 128×192 pixels, or another consistent 2:3 canvas.
- Nearest-neighbor scaling only.
- Whole-number rendering scales where possible.
- No CSS smoothing.

### Required initial animations

- Idle: 6–8 frames.
- Dialogue/gesture: 6–8 frames.
- Celebration: 8–12 frames.
- Optional walk preview in Loadout only.

Do not build combat animations. Hobby props may look fantastical, but this is not a combat game.

---

## 12. Body-type system

### Professional constraint

Do not implement body type using continuous CSS width/height scaling. It will distort pixel density, faces, clothing, hand anchors, and animation timing.

Use nine authored body rigs:

| Height | Slim | Average | Broad |
|---|---|---|---|
| Short | short-slim | short-average | short-broad |
| Average | average-slim | average-average | average-broad |
| Tall | tall-slim | tall-average | tall-broad |

User-facing language should be respectful and neutral:

- Height: Short, Medium, Tall.
- Build: Slim, Medium, Broad.

Do not assign abilities, XP bonuses, gender, personality, or health claims to body type.

### Body-rig contract

```ts
type BodyRigId =
  | 'short-slim'
  | 'short-average'
  | 'short-broad'
  | 'average-slim'
  | 'average-average'
  | 'average-broad'
  | 'tall-slim'
  | 'tall-average'
  | 'tall-broad';

type PixelAnchorMap = {
  head: Point;
  face: Point;
  neck: Point;
  leftShoulder: Point;
  rightShoulder: Point;
  leftHand: Point;
  rightHand: Point;
  waist: Point;
  back: Point;
  leftFoot: Point;
  rightFoot: Point;
  ground: Point;
};

type BodyRig = {
  id: BodyRigId;
  frameSize: { width: number; height: number };
  anchors: PixelAnchorMap;
  hitRegions: AvatarHitRegion[];
  supportedAnimations: string[];
};
```

### Clothing compatibility

Every clothing item must either:

1. Provide a body-specific layer for all nine rigs, or
2. Explicitly list supported rigs and remain hidden from unsupported combinations until completed.

Do not scale one shirt layer horizontally to simulate every build. Create silhouette-aware variants.

```ts
type AvatarItemVariant = {
  bodyRigId: BodyRigId;
  animationId: string;
  spriteSheet: string;
  frameMap: FrameMap;
  paletteMap?: PaletteMap;
};
```

### Practical release strategy

Nine bodies multiply asset workload. Deliver in stages without exposing broken combinations:

1. Implement all nine base-body rigs and idle silhouettes.
2. Adapt the basic starter wardrobe to all nine.
3. Adapt high-priority hobby rewards.
4. Add the extended wardrobe category by category.

The app should never show an item that clips badly on the selected body.

---

## 13. Character creator changes

Add a dedicated `BODY` category before Hair and Clothing:

```text
BODY
Height:  [Short] [Medium] [Tall]
Build:   [Slim]  [Medium] [Broad]
```

### Preview behavior

- Update character immediately.
- Preserve compatible equipped items.
- If an equipped item is not yet compatible, show a clear dialog and substitute its starter equivalent only after user confirmation.
- Preview front/three-quarter and side views.
- Include `Compare` mode showing up to three body variants side by side.
- Never label one body as the default, ideal, normal, or better body.

### Data migration

Existing characters migrate to `average-average` unless current body data maps reliably to another rig. Do not reset their clothing or unlocked items.

---

## 14. Theme-aware button and window accents

Seasonal theme should affect the interface without destroying the consistent retro OS language.

### Base control remains stable

- Same button dimensions.
- Same typography.
- Same focus behavior.
- Same semantic colors for destructive actions, warnings, and difficulty.
- Same accessible contrast.

Themes add decorative accents through tokens and tiny pixel assets.

```ts
type ThemeControlAccents = {
  buttonBorder: string;
  buttonHighlight: string;
  buttonPressed: string;
  focusRing: string;
  cornerSprite?: string;
  hoverSprite?: string;
  progressCapSprite?: string;
  windowTitlePattern?: string;
};
```

### Accent examples

**Fall**

- Amber highlight.
- Tiny leaf in one corner.
- Rust pressed state.
- Leaf-sweep hover effect limited to the border.

**Winter**

- Ice-blue highlight.
- Two-pixel frost corner.
- Snowflake focus marker.
- Avoid pale text on white snow.

**Spring**

- Soft green/pink highlight.
- Small petal or sprout corners.
- Bee-wing hover sparkle used sparingly.

**Summer**

- Lake blue and sun-gold accents.
- Ripple underline or shell corner.
- Warm highlight without neon saturation.

### Implementation

Use CSS variables and pseudo-elements rather than separate button components per season.

```css
.pixelButton::before,
.pixelButton::after {
  content: '';
  position: absolute;
  image-rendering: pixelated;
  background-image: var(--button-corner-sprite);
}
```

Decorative accents use `aria-hidden="true"` and do not capture pointer events.

---

## 15. Compact HUD and quest ribbon

### Top/status HUD

Show only:

- Name.
- Life Level.
- Compact XP bar.
- Save state.
- Settings/power access.

### Current quest ribbon

One line by default:

```text
🎾 CURRENT QUEST: Land 10 controlled forehands   6/10   [CONTINUE]
```

Clicking expands a small details panel. Do not keep multiple quest cards open on the homepage.

If no quest is active:

```text
CHOOSE YOUR NEXT STEP   [OPEN HOBBIES]
```

### Recent rewards

New achievement/cosmetic notifications appear briefly as toasts, then move to their applications. Do not permanently add them to the homepage.

---

## 16. Interaction and motion

### Homepage motion budget

At normal intensity, allow:

- One character idle animation.
- Seasonal ambient loop.
- One subtle central-node pulse.
- Short branch expansion animation.

Avoid simultaneously animating every node, button, HUD element, particle, and character accessory.

### Constellation animation

- Connectors draw outward using stepped or masked pixel animation.
- Nodes scale from 90% to 100% or fade/step into place.
- Total expansion completes in approximately 350–600ms.
- Collapsing is slightly faster.
- Reduced-motion mode reveals instantly or with simple opacity.

### Character reaction

The character may glance/gesture toward the selected hobby node if animation assets exist. This is optional polish and must not block initial implementation.

---

## 17. Responsive behavior

### Wide landscape

- Character may be left, center, or right.
- Full anchored environmental composition.
- Spatial hobby constellation.
- Dock on any edge.

### Compact landscape/tablet

- Character centered or offset away from visible dock.
- Fewer simultaneously visible progress nodes.
- HUD becomes icon-first.

### Mobile portrait

- Character upper-middle.
- Quest ribbon below character.
- Central progress node remains tappable.
- Hobby branches expand into a bottom sheet or horizontal scroll strip.
- Dock fixed to bottom.
- Seasonal art uses portrait-specific crops/layers.

### Short-height screens

- Reduce sky/decorative vertical area.
- Keep character face, held item, center progress node, and quest action visible.
- Do not hide the character.

---

## 18. Implementation architecture

Suggested component structure:

```text
CharacterCenteredHome
├── SeasonalScene
│   ├── SceneLayerRenderer
│   ├── PerspectivePath
│   ├── AmbientEffects
│   └── SceneSafeZoneManager
├── CharacterStage
│   ├── PixelAvatar
│   ├── CharacterShadow
│   └── AvatarHitRegionOverlay
├── HobbyConstellation
│   ├── CentralProgressNode
│   ├── HobbyBranchNode
│   ├── ProgressBranchNode
│   └── PixelConnector
├── CompactLifeHud
├── CurrentQuestRibbon
└── DesktopDock
```

### State machine

Use a small explicit state machine instead of scattered booleans:

```ts
type HomeConstellationState =
  | { mode: 'collapsed' }
  | { mode: 'hobbies' }
  | { mode: 'progress'; hobbyId: string };
```

Events:

- `TOGGLE_CENTER`
- `SELECT_HOBBY`
- `SELECT_PROGRESS_NODE`
- `CLICK_OUTSIDE`
- `ESCAPE`
- `VIEWPORT_CHANGED`

### Scene state

```ts
type CharacterSceneState = {
  themeId: SeasonalThemeId;
  characterPosition: CharacterScenePosition;
  sceneAnchor: SceneAnchor;
  bodyRigId: BodyRigId;
  constellation: HomeConstellationState;
  animationIntensity: 'off' | 'low' | 'normal';
};
```

Keep visual scene state separate from progression data.

---

## 19. Asset manifest and validation

Add a build-time asset manifest so missing body/clothing/theme combinations fail during development rather than rendering broken layers.

```ts
type SceneAssetManifest = {
  themes: Record<SeasonalThemeId, ThemeAssetSet>;
  bodyRigs: Record<BodyRigId, BodyRig>;
  avatarItems: Record<string, AvatarItemVariant[]>;
};
```

Validation script must verify:

- All nine body rigs exist.
- Starter clothing supports all nine bodies.
- Sprite sheets use declared frame dimensions.
- Anchor names are complete.
- Scene themes include required layers and portrait/landscape behavior.
- Decorative asset paths resolve.
- Seasonal control tokens meet required fields.
- No hobby node references a missing icon.

---

## 20. Implementation sequence

### Pass 1 — declutter without changing art

- Replace homepage card grid with character focal layout.
- Add compact HUD and quest ribbon.
- Keep dock as sole app launcher.
- Add central progress node and simple hobby expansion.
- Verify existing routes and state still work.

### Pass 2 — constellation navigation

- Add hobby branch layout algorithm.
- Add selected-hobby progress expansion.
- Add connectors, hover/focus information, collapse behavior, and list fallback.

### Pass 3 — scene anchor system

- Implement normalized character anchor and safe zones.
- Refactor existing seasonal background into layers.
- Add center/left/right composition behavior.
- Build city-street and fall-trail anchored prototypes first.

### Pass 4 — theme accents

- Add seasonal UI tokens.
- Decorate buttons, progress bars, title bars, and node highlights.
- Confirm semantics and contrast remain stable.

### Pass 5 — body rigs

- Implement nine base silhouettes and anchor maps.
- Migrate existing users to average-average.
- Add body selector and preview.
- Adapt starter wardrobe.

### Pass 6 — character art and wardrobe expansion

- Replace placeholder rigs with detailed original sprites.
- Add idle/gesture/celebration frames.
- Adapt unlocked hobby props and expanded clothing.
- Re-enable hover/tap direct Loadout editing for every rig.

### Pass 7 — polish and performance

- Add spring/summer/winter anchored compositions.
- Tune ambient effects.
- Test loading, memory use, reduced motion, and low-power devices.
- Complete responsive and accessibility test matrix.

Stop and verify after each pass. Do not generate every final art asset before the layout and anchor prototypes prove the system works.

---

## 21. Testing requirements

### Homepage clarity

- Default homepage contains one obvious focal character.
- No duplicate app-launch card grid is visible.
- One clear current quest/next action exists.
- Full applications remain reachable through dock/menu.

### Constellation

- Center click opens hobbies.
- Hobby click opens only that progress branch.
- Escape/outside click collapses.
- Nodes never cover the character face or quest CTA.
- Keyboard users can complete the same navigation.

### Modular scene

- City vanishing point aligns with character at left, center, and right.
- Fall path aligns with character at left, center, and right.
- Resizing recalculates composition without blurred stretching.
- Theme switching does not reset constellation or progression state.

### Body types

- All nine rigs render.
- Starter clothes fit each rig without visible clipping.
- Hand/back/ground anchors remain correct.
- Changing body preserves compatible equipment.
- No body affects XP or gameplay.

### Responsive

- Test 320×568, 375×667, 390×844, 768×1024, 1024×768, 1280×720, 1366×768, 1440×900, and 1920×1080.
- Test every dock edge on wide screens.
- Test 200% zoom.
- Test reduced motion and animation off.

### Performance

- No continuous DOM particle growth.
- No layout animation on every frame.
- Non-selected themes lazy-load.
- Page-hidden animations pause.
- Character remains crisp and stable during resize.

---

## 22. Acceptance criteria

This handoff is complete when:

- The character is unquestionably the homepage focal point.
- The default home view is substantially less cluttered.
- Applications are launched from the dock/menu rather than duplicated as large cards.
- Clicking the central progress node reveals hobby nodes spatially around the character.
- Selecting a hobby reveals a small, useful portion of its real progression path.
- City streets, fall paths, and other environments visually center themselves around the character’s location.
- The scene works with left, center, and right character placement and responsive/mobile fallbacks.
- Users can choose nine respectful body combinations across height and build.
- Clothing uses authored body-aware variants instead of distorted scaling.
- Seasonal accents appear on buttons and windows without harming readability or semantics.
- Existing users retain progress, cosmetics, quests, and authentication state.
- Guest state remains session-only.
- Character, constellation, and next action remain visible and usable at all supported sizes.

The final homepage should feel less like checking a productivity dashboard and more like opening a tiny personal world. The character stands inside a scene that belongs to them, their hobbies emerge from them when requested, and the next real-world action remains one click away.

