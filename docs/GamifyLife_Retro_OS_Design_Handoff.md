# Gamify.Life — Retro OS Design Implementation Brief

**Purpose:** Paste this document into the active Codex project as the design and interaction directive for the next implementation pass.  
**Relationship to the main specification:** This brief refines the visual design, entry flow, avatar onboarding, hobby progression, and desktop navigation described in `GamifyLife_Codex_Build_Spec.md`. Preserve working functionality unless this document explicitly changes the experience.

---

## 1. High-level directive to Codex

Redesign Gamify.Life so it feels like the user is turning on and logging into a warm, fictional late-1990s Macintosh-style computer built specifically for their real-life hobbies.

This is not merely a website with a pixel font. The operating-system metaphor should organize the entire experience:

- The first screen is a computer login screen.
- New users create their pixel character before reaching the desktop.
- The dashboard is the desktop.
- Major features are applications represented by pixel icons.
- Applications open inside movable retro windows.
- Users can place the application dock on the top, bottom, left, or right edge.
- Skill trees feel like programs/maps loaded inside the computer.
- Completing real-life quests unlocks nodes, XP, and cosmetic items.
- The character becomes a visual record of the hobbies the player has developed.

Keep the current application logic and data architecture when possible. Treat this as a deliberate UI/UX refactor, not an excuse to rewrite working progression code. Implement in small verified stages.

---

## 2. Non-negotiable product flow

```text
Boot screen
    ↓
Login / Continue as Guest
    ↓
First-time character creation
    ↓
Choose one or more hobbies
    ↓
Retro desktop dashboard
    ↓
Open hobby app
    ↓
GET STARTED node
    ↓
Learn → accept quest → complete quest → earn XP
    ↓
Next connected node unlocks
    ↓
Character cosmetics and hobby props unlock over time
```

Returning authenticated users skip character creation and resume at the desktop. Returning users with an incomplete onboarding profile resume at the first unfinished onboarding step.

### Guest behavior — updated decision

- “Continue as Guest” must allow access to the real application, not a limited slideshow.
- Guests can create a character, choose hobbies, complete nodes, gain temporary XP, and explore all ordinary MVP features.
- Guest progress lasts for the current browser tab/session only and is not durable.
- Store guest state in memory or `sessionStorage`, not durable `localStorage`.
- Before beginning guest mode, show a short message: “Guest progress disappears when this session ends. Create an account anytime to save your character and progress.”
- Do not repeatedly nag the guest. Show one subtle “SAVE PROGRESS” desktop action after meaningful progress is earned.
- If account conversion is not implemented yet, the save action may open a clear “Coming next” dialog; do not falsely imply migration exists.

Authenticated users save profile, avatar, hobbies, XP, quests, gear, achievements, window positions, and dock placement.

---

## 3. Reference-image interpretation

Use the uploaded references for principles, not copied art or copyrighted assets.

### Old computer/calendar references

Extract these ideas:

- A dark physical monitor bezel frames the experience.
- The screen has a faint pixel grid, scanline, or CRT texture.
- Application chrome is gray with muted green title bars.
- Windows have square corners, bevels, one-pixel borders, inset panels, and tactile buttons.
- Icons are tiny, colorful, and visibly pixelated.
- A centered bottom launcher holds the main applications.
- A power symbol has a strong, memorable location.
- The desktop wallpaper can be seen around or behind the active window.
- Information-heavy panels still feel playful because of sprite icons and game rewards.

### Map reference

Use the concept of a navigable system/map inside a computer window. Hobby skill trees should feel like opening a map program: connected locations, visible destinations, locked routes, and a detail panel for the selected location.

### Pixel-art world and character references

Extract these ideas:

- Original hand-pixelled characters with strong silhouettes.
- Small color palettes and clean nearest-neighbor scaling.
- Equipment is visibly carried or worn.
- A character can look progressively more interesting through items without changing core body identity.
- Use these only as inspiration; do not reproduce the shown characters, poses, names, or copyrighted game assets.

---

## 4. Visual identity

### Design sentence

**“A cozy hobby RPG running on an old household computer.”**

It should feel warm, tactile, curious, and personal—not cyberpunk, hacker-themed, sterile SaaS, or horror/VHS.

### Core palette

```css
:root {
  --os-boot-green: #71806B;
  --os-desktop-green: #87927A;
  --os-title-green: #607263;
  --os-deep-green: #3F5145;

  --os-window: #C9C8BE;
  --os-panel: #DEDDD4;
  --os-highlight: #F1EEE2;
  --os-shadow: #77786F;
  --os-bezel: #393B37;

  --os-ink: #242923;
  --os-muted-ink: #555C54;
  --os-focus: #244F3A;

  --level-beginner: #6FA66F;
  --level-intermediate: #D2B95B;
  --level-advanced: #C8665D;

  --hobby-tennis: #D58E8A;
  --hobby-cycling: #D0AE5C;
  --hobby-swimming: #70AFA5;
  --hobby-journaling: #A996C5;
}
```

Beginner/intermediate/advanced color indicates difficulty. Hobby pastel color indicates category/identity. Do not use the same visual channel for both. A tennis beginner node, for example, may have a dusty-rose hobby icon inside a green difficulty frame.

### Typography

- Use a readable pixel font for titles, labels, buttons, node names, XP numbers, and short interface copy.
- Use a clean system sans or mono font for paragraphs and long instructions.
- Never render long lessons in a hard-to-read bitmap font.
- Use uppercase selectively for OS labels: `LOGIN`, `GET STARTED`, `QUEST LOG`, `SAVE PROGRESS`.
- Keep body copy at least 16px equivalent and metadata at least 13–14px.

### Pixel rendering rules

- Pixel art assets use integer dimensions and `image-rendering: pixelated`.
- Scale sprites by whole-number factors whenever possible.
- Avoid smoothing/filtering that blurs pixels.
- Icons should share a common grid, preferably 24×24 or 32×32 source pixels.
- Character sprites should use a consistent base canvas, preferably 64×64 or 96×96 source pixels rendered larger.
- Use a limited palette per asset and strong silhouette.

### Texture

- Add extremely subtle scanlines/pixel-grid overlay inside the simulated screen only.
- Add 1–2% noise/dither to large flat areas.
- Do not place texture over text at a strength that hurts legibility.
- Make effects switchable under Accessibility/Display settings.

---

## 5. The computer frame

At desktop and tablet widths, wrap the main application inside a simulated old computer display:

- Thick dark graphite/gray bezel.
- Slightly rounded outer hardware corners but square inner screen corners.
- Small embossed `GAMIFY.LIFE` wordmark beneath or above the display.
- Optional tiny power indicator LED.
- Screen surface has a very gentle inset shadow.
- Keep the frame responsive; it must not waste excessive space on laptops.

At narrow mobile widths, simplify the physical bezel to a 4–8px frame so content remains usable. The metaphor must never shrink the usable interface below comfortable touch sizes.

Do not distort the entire UI with an aggressive CRT curve. A very slight vignette is acceptable. Text must remain crisp.

---

## 6. Screen 1 — boot sequence

The application initially displays a short boot sequence:

1. Near-black screen.
2. Small pixel computer/leaf/star icon appears.
3. `GAMIFY.LIFE OS` and a short progress indicator.
4. Fade or hard-cut into the login screen.

Rules:

- Total boot sequence should last roughly 1.0–1.8 seconds on first visit.
- Clicking, pressing Enter, or reduced-motion preference skips it immediately.
- Returning users may have a “Skip boot animation” setting.
- Never delay actual data loading just to finish the animation.

Optional copy:

```text
GAMIFY.LIFE OS
LOADING PROFILE MODULES...
DISCOVER • LEARN • PRACTICE • PROGRESS
```

---

## 7. Screen 2 — login

The login screen is the first interactive screen.

### Composition

- Full muted-green screen inside the computer bezel.
- Centered login panel constructed like an inset gray system dialog.
- Small pixel portrait/profile slot near the username field.
- `WELCOME TO GAMIFY.LIFE` title.
- Username field first.
- Password field may be visually present only if authentication supports it; otherwise omit it rather than building a fake field.
- Primary button: `LOG IN`.
- Secondary button: `CONTINUE AS GUEST`.
- Small link/action: `CREATE PROFILE`.
- Bottom helper text explains saved vs temporary progress.

### Visual styling

- Black/dark-gray text and borders.
- Gray recessed text boxes with visible focus outline.
- Green primary button; cream secondary button.
- Pixel cursor may blink in the username field.
- Do not use neon terminal green or command-line aesthetics.

### Behavior

- Enter submits when inputs are valid.
- Show errors inside the dialog in plain language.
- Preserve normal labels, autocomplete semantics, and password-manager compatibility.
- Do not create fake account functionality; connect to existing auth or clearly label unavailable work.

---

## 8. First-time character creation

Character creation occurs after login/guest selection and before hobby selection or desktop access.

### Purpose

The character is the player's visual representation, not a gameplay class. Options are inclusive and not separated into male/female categories.

### Layout

Open a full-screen retro “Character Setup” program:

- Large sprite preview on the left/center.
- Tabs or icon categories on the right/bottom.
- Back/forward arrows for each option.
- Palette swatches for applicable items.
- Name field above the preview.
- `RANDOMIZE`, `RESET`, and `CREATE CHARACTER` controls.
- A locked-items preview area labeled: “More styles unlock as your skills grow.”

### Basic options at creation

- Skin tone.
- Hair style.
- Hair color.
- Eyes or small face detail.
- Plain top.
- Plain bottoms.
- Basic shoes.
- One neutral accessory such as glasses, cap, or small backpack.

Provide enough variety to feel personal, but keep onboarding fast. A reasonable first pass is 6 skin tones, 8 hairstyles, 6 hair colors, 6 tops, 5 bottoms, 4 shoes, and 4 accessories.

### Locked cosmetics

Display a few silhouette/locked item slots so the user immediately understands the reward system. Do not expose hundreds of empty slots.

Examples:

- Journaling: giant fountain-pen sword, large feather quill, ink-stained satchel, page/aura effect.
- Tennis: racket carried over shoulder, pastel visor, wristbands, ball-particle companion.
- Cycling/Fixed Gear: helmet, frame-shaped backpack, messenger bag, bike-tool belt.
- Swimming: goggles, cap, towel cape, water-droplet trail.
- Cross-hobby/Life Level: retro computer sweatshirt, star cursor companion, patch-covered jacket.

These are cosmetic only. Never imply that equipping an item makes real-life progress easier.

### Asset architecture

Use a layered sprite/paper-doll system with consistent origin and canvas:

```text
shadow
body/skin
face
hair-back
bottom
top
shoes
hair-front
head-accessory
back-accessory
held-item
foreground-effect
```

Persist item IDs and palette IDs, never direct file paths. All assets must be original or properly licensed.

---

## 9. Hobby selection

After character creation, display a program titled `CHOOSE YOUR PATH`.

Initial hobby cards:

- Tennis
- Cycling / Fixed Gear
- Swimming
- Journaling

Each card includes:

- Pixel icon.
- One-line description.
- Estimated minimum gear/cost category.
- `EASY TO START`, `TECHNIQUE-HEAVY`, or another honest label.
- Hobby pastel accent.

Allow one or multiple selections. Clearly state: “You can add or pause hobbies later.” Continue to the desktop after at least one is selected.

---

## 10. Desktop dashboard

The dashboard should look and behave like a small desktop operating system.

### Wallpaper

Use an original pixel-art landscape or a muted patterned wallpaper. A cozy outdoor environment can hint at hobbies without depicting a specific copyrighted world. Keep contrast low behind windows.

### Desktop icons / applications

Minimum applications:

- `MY HOBBIES`
- `SKILL MAP`
- `QUEST LOG`
- `CHARACTER`
- `INVENTORY` or `LOADOUT`
- `ACHIEVEMENTS`
- `CALENDAR`
- `SETTINGS`

Optional future applications:

- `RESOURCE LIBRARY`
- `AI COACH`
- `DISCOVER`

Each uses an original pixel icon and opens a retro application window. Double-click should open on desktop, while a single click selects. For touch/mobile, single tap opens.

### Status elements

The desktop menu/status bar may show:

- Player name.
- Life Level.
- Total XP.
- Current date/time.
- Sound setting.
- Save/cloud status.

### Power button

A power icon may open a small menu:

- Switch profile.
- Return to login.
- Settings.
- Close guest session (with warning that temporary progress will be lost).

Do not actually close the browser or use alarming system language.

---

## 11. Movable application dock

The row of application icons acts as the OS dock/launcher.

### Requirements

- Default position: bottom center.
- User can move it to top, bottom, left, or right.
- Provide a clear dock context menu or Settings option: `Dock Position → Top / Bottom / Left / Right`.
- Dragging the dock to an edge may be added if straightforward, but do not make drag the only way to reposition it.
- Persist dock placement for signed-in users.
- Guest placement lasts only for the session.
- Horizontal layout on top/bottom; vertical layout on left/right.
- Tooltips show app names.
- Active/open application has a small indicator pixel beneath/beside its icon.
- On mobile, keep the dock bottom-positioned and horizontally scrollable; do not allow side docks that consume the screen.

### Window behavior

- Desktop application windows may be dragged by their title bars.
- Windows may minimize to the dock, close, and come to front.
- Limit complexity: one instance of each app at a time.
- On mobile, applications open full-screen and are not draggable.
- Persist window size/position only after the core experience is stable.
- Always include a `RESET WINDOW LAYOUT` action in Settings so windows cannot become permanently lost off-screen.

---

## 12. Skill Map application

Opening a hobby should launch `SKILL MAP — [HOBBY NAME]`.

### First node

Every hobby begins with a large, unmistakable node labeled:

```text
GET STARTED
```

The first node introduces:

- What the hobby is.
- What equipment is truly required.
- What can be borrowed or skipped.
- Basic safety.
- Rules/etiquette when the hobby has them.
- The first small real-world quest.

Do not scatter this essential information across unrelated menus. The start node should make the user feel ready to attempt the hobby.

### Tree presentation

- Present nodes as pixel icons/medallions connected by visible routes.
- Tree is pannable and zoomable on desktop.
- Keep the existing accessible list/journey view as an equal alternative.
- Locked branches should still be faintly visible to create curiosity.
- Selecting a node opens a details panel inside the same window, similar to selecting a destination on a map.

### Difficulty colors

- Beginner nodes: green frame/highlight.
- Intermediate nodes: yellow/gold frame/highlight.
- Advanced nodes: red/coral frame/highlight.
- Locked nodes: desaturated gray, regardless of difficulty.
- Completed nodes: checkmark plus filled route.
- Mastered nodes: small star/burst overlay.

Difficulty color must never be the sole state indicator. Include state icon/text and maintain adequate contrast.

### Recommended visual hierarchy

```text
Hobby title + level + segmented XP bar
        ↓
Current/selected tier label
        ↓
Connected node map
        ↓
Selected-node information/quest panel
        ↓
Quest action and rewards
```

---

## 13. Nodes and quests

Every progression node must connect knowledge to action.

### Node contents

- Node title and difficulty.
- Why it matters.
- What the user needs.
- Short lesson/instructions.
- Common beginner mistakes.
- Safety warning where applicable.
- Quest required for completion.
- XP reward.
- Nodes/cosmetics it can unlock.

### Quest model

The quest is the proof-of-action component of the node. Examples:

- Tennis: identify rules, practice ready position, land 10 controlled forehands.
- Cycling: complete an ABC bike check, practice 10 controlled stops, ride five safe miles.
- Swimming: complete supervised exhale drill, perform streamlined glides, swim a controlled 25.
- Journaling: use existing materials, write for five minutes, complete three reflection entries.

The user starts the quest, performs it in real life, and reports completion honestly. v0.1 does not require camera proof.

### Completion interaction

When completed:

1. Node stamps/checks into place.
2. Route animates toward newly available node(s).
3. XP counter increases.
4. New node(s) flash briefly.
5. Cosmetic reward appears if earned.
6. The user may select `GO TO NEXT NODE` or `RETURN TO MAP`.

Keep celebration under roughly three seconds and respect reduced-motion settings.

---

## 14. Difficulty and progression rules

Do not confuse difficulty tier with user level.

- **Node difficulty:** Beginner (green), Intermediate (yellow), Advanced (red).
- **Hobby level:** numeric XP-derived level and title.
- **Node state:** Locked, Available, In Progress, Completed, Mastered.

The beginning of every hobby should contain multiple beginner nodes—not only a single tutorial. Intermediate unlocks after the important beginner prerequisites are completed. Advanced nodes should represent specialization, consistency, or significant milestones, not merely longer articles.

Safety-critical prerequisites cannot be bypassed. Examples include water safety before swimming drills and road/bike safety before cycling ride quests.

Preserve the principle:

```text
Learn = low XP
Practice = medium XP
Challenge = high XP
Milestone = highest XP
```

---

## 15. Character progression

The Character app should communicate how real-life hobbies shape the player's fictional equipment and appearance.

### Character screen

- Large animated idle sprite or gently bobbing still sprite.
- Name, Life Level, total XP.
- Segmented hobby stat bars.
- Current equipment slots.
- Closet/inventory grid.
- Locked reward preview with unlock condition.

### Cosmetic reward design rules

- Rewards correspond to the hobby that earned them.
- Early rewards are simple clothing/accessories.
- Later rewards are more fantastical props or visual effects.
- Props can be humorous and game-like, such as the fountain-pen sword, while the actual lessons remain grounded and accurate.
- Rewards never change XP rates or grant real-world skill.
- Avoid locking basic identity representation behind progression; skin tones, common hair textures, basic clothes, and accessibility-related options are available initially.

### Suggested reward ladder

| Tier | Reward style | Example |
|---|---|---|
| Start | Small badge/patch | Notebook patch on shirt |
| Beginner | Practical hobby item | Goggles, helmet, racket |
| Intermediate | Stylized equipment | Quill staff, bike-tool belt |
| Advanced | Dramatic cosmetic | Fountain-pen sword, water trail, ball companion |
| Cross-hobby | Unique blended item | Patch jacket featuring all active hobbies |

---

## 16. Calendar application

Use the calendar references as direct structural inspiration while creating original UI and art.

### Calendar window

- Traditional month grid with beveled cells.
- Small pixel quest icons on active/completed dates.
- Selected date opens a right-side panel.
- Right-side panel shows planned practices, quest progress, and earned rewards.
- Bottom strip shows the most relevant “TO DO” item.
- Use hobby colors sparingly for event identification.

Do not make calendar participation mandatory or punish missed days. The calendar records activity and helps plan flexible quests.

---

## 17. Detailed component guidance

Create or refactor these reusable components instead of styling pages independently:

```text
RetroComputerFrame
BootSequence
LoginDialog
CharacterCreator
PixelAvatar
DesktopShell
DesktopIcon
Dock
DockPositionMenu
RetroWindow
WindowTitleBar
WindowManager
PixelButton
InsetPanel
SegmentedProgressBar
SkillMap
SkillNode
SkillConnection
NodeDetailPanel
QuestPanel
CompletionCelebration
CalendarWindow
CharacterWindow
PixelTooltip
PowerMenu
```

### Window manager state

```ts
type WindowState = {
  appId: AppId;
  isOpen: boolean;
  isMinimized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
};

type DesktopPreferences = {
  dockPosition: 'top' | 'bottom' | 'left' | 'right';
  scanlinesEnabled: boolean;
  bootAnimationEnabled: boolean;
  soundEnabled: boolean;
};
```

Clamp every window position to the visible desktop when the viewport changes. Never allow the title bar to become unreachable.

---

## 18. Responsive and accessible behavior

### Desktop

- Full hardware frame.
- Movable/resizable windows.
- User-selected dock edge.
- Skill-map canvas with side detail panel.

### Tablet

- Reduced bezel.
- Draggable windows only if touch behavior remains reliable; otherwise use centered modal windows.
- Top or bottom dock preferred.

### Mobile

- Thin frame only.
- No free-floating windows; open apps full-screen.
- Fixed bottom dock.
- Skill tree defaults to vertical journey/list.
- Character creator uses swipeable/tappable category tabs.

### Accessibility

- Preserve semantic form labels and keyboard navigation beneath the retro presentation.
- Every pixel icon has a text label or accessible name.
- Minimum touch target approximately 44×44 CSS pixels.
- Offer “Reduce motion,” “Disable screen texture,” and “Larger text.”
- Show focus visibly with a strong dark-green/cream double outline.
- Node status must use icon + text + color.
- Do not autoplay sound.

---

## 19. Implementation order

Codex should implement in this order and keep the app runnable after each step.

### Pass 1 — design foundation

- Add palette/tokens, typography, pixel rendering rules, buttons, panels, and retro windows.
- Add computer bezel and responsive screen area.
- Restyle the currently working dashboard without altering data behavior.

### Pass 2 — entry flow

- Add boot sequence.
- Build login/guest screen connected to current auth capabilities.
- Update guest repository to session-only persistence.
- Add onboarding route guards.

### Pass 3 — character onboarding

- Build basic layered pixel-avatar creator.
- Add starting options and locked reward preview.
- Persist authenticated avatar and keep guest avatar session-only.

### Pass 4 — desktop OS

- Build desktop icons, dock, dock-position setting, window manager, minimize/close/front behavior.
- Open existing features inside reusable windows.
- Add Reset Window Layout.

### Pass 5 — skill map redesign

- Restyle nodes and connections.
- Add `GET STARTED` entry node treatment.
- Apply beginner/intermediate/advanced frames.
- Add integrated node detail/quest panel and unlock animation.

### Pass 6 — progression rewards

- Map hobby milestones to cosmetic unlocks.
- Add closet/inventory display and locked conditions.
- Add fountain-pen sword/quill and equivalent rewards as original pixel assets.

### Pass 7 — calendar and polish

- Create calendar app and activity markers.
- Add optional UI sounds, screen texture, reduced-motion behavior, and mobile adaptations.
- Run accessibility and visual regression checks.

Do not attempt every pass in one unreviewed code change. Stop after each pass to run lint, typecheck, tests, production build, and visual inspection at desktop and mobile widths.

---

## 20. Acceptance criteria

The design pass is successful when:

- A first-time visitor immediately understands they are entering a fictional retro computer.
- Login and Guest are clearly distinguished by saved versus temporary progress.
- A new player creates a basic character before seeing the desktop.
- The desktop contains recognizable pixel application icons and a movable dock.
- Opening a hobby launches a skill map with a clear `GET STARTED` node.
- Beginner, intermediate, and advanced nodes are distinguishable as green, yellow, and red without relying only on color.
- Every completable node contains a real-world quest and an XP reward.
- Completing quests unlocks connected nodes and can unlock character cosmetics.
- The character visibly equips basic and earned hobby-related items.
- The fountain-pen sword or large quill appears as an attainable journaling reward.
- Signed-in progress persists; guest progress disappears after the session ends.
- The site remains keyboard-accessible, readable, and functional on mobile.
- Existing hobby/progression functionality is not lost during the redesign.

---

## 21. Avoid these mistakes

- Do not apply only a pixel font and call the redesign complete.
- Do not make the UI neon green, hacker-themed, or cyberpunk.
- Do not copy copyrighted characters, maps, icons, or UI art from the references.
- Do not place a CRT filter over text strongly enough to blur it.
- Do not require account creation to understand the product.
- Do not pretend guest progress is saved.
- Do not lock basic skin tones, hair representation, or plain clothing.
- Do not let draggable windows become inaccessible off-screen.
- Do not use red/yellow/green as the only indication of difficulty or status.
- Do not make advanced nodes simply contain more text; make them represent advanced actions and milestones.
- Do not let cosmetic rewards affect real-life progression or XP rates.
- Do not discard currently working functionality solely to simplify the visual refactor.

---

## 22. Final experience target

The player should feel as if they found an old family computer with one strange, wonderful purpose: it knows what they want to learn. They log in, create a small pixel version of themselves, open a hobby from the desktop, and see a map that makes beginning feel manageable. They leave the computer to perform a real action, return to mark the quest complete, watch the next path light up, and slowly build a character whose clothes and equipment tell the story of the life they are actually living.

