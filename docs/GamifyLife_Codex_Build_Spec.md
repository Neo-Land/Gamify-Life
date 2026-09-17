# Gamify.Life — Codex-Ready Product & Technical Specification

**Document status:** Build specification for v0.1 MVP  
**Product:** Gamify.Life  
**Tagline:** *Discover. Learn. Practice. Progress.*  
**Primary user for v0.1:** Nicholas, using the app to track Tennis, Cycling/Fixed Gear, Swimming, and Journaling  
**Core inspiration:** RPG skill trees, Minecraft-style achievements, Warframe-style progression/loadouts, and a character stat screen—reinterpreted as a friendly retro Macintosh desktop.

---

## 1. Instructions to the coding LLM

Build a polished, responsive, accessible full-stack web app using this document as the source of truth. Do not replace the designed progression trees with dynamically generated AI content. Seed the four listed hobbies and make all progress interactions functional. Prioritize the core loop over optional features:

1. Choose a hobby.
2. See what is available, locked, in progress, or completed.
3. Open a node and understand what to learn or do.
4. Complete a real-world challenge.
5. Earn XP, unlock connected nodes, and update the avatar/profile.
6. See a satisfying but brief completion animation.

If a requirement is ambiguous, choose the simplest implementation that preserves data integrity and this loop. Avoid adding social media, subscriptions, an open-ended AI chat, or a marketplace to v0.1.

### Definition of “done”

- The app can run locally from a fresh clone with documented setup steps.
- Demo mode works without external credentials and persists in browser storage.
- Supabase mode supports account creation, sign-in, cloud persistence, and row-level data isolation.
- All four hobby trees render with prerequisites and unlock rules.
- XP, levels, quests, achievements, activity logs, gear, and avatar customization work end to end.
- Desktop and mobile layouts are usable.
- Automated tests cover progression calculations and the main completion flow.
- Seed data is separate from UI code and can later be replaced by a content editor.

---

## 2. Product vision

Gamify.Life helps someone become “the kind of person who does X.” It replaces scattered searches, random tutorials, and premature equipment purchases with a curated path that reveals the right information when it becomes useful.

The app is not a generic article library and not ChatGPT with a skill-tree skin. The durable product is a progression engine with structured content and persistent user state. AI may later explain or adapt a curated node, but the canonical tree, prerequisites, safety guidance, and completion requirements remain editorially controlled.

### Product principles

- **Doing earns more than consuming.** Reading is low XP; practice is medium XP; demonstrated challenges and milestones are high XP.
- **Curiosity without punishment.** Show active days and personal momentum; do not shame users for broken streaks.
- **Reveal complexity gradually.** Beginners see only the concepts relevant to starting safely.
- **Milestones, not completion.** A hobby has no final “100% complete” state. Advanced progress grows wider through specializations.
- **Useful purchases, not consumerism.** Gear guidance must distinguish required, recommended, optional, and “do not buy yet.”
- **Personal progress over competition.** v0.1 contains no leaderboard or public comparison.
- **Safety is a prerequisite.** Water safety, traffic safety, injury prevention, and equipment warnings cannot be bypassed when applicable.

### MVP goals

- Make the user want to return and take a real-world action.
- Prove that one progression engine can support four very different hobbies.
- Make hobby state visually understandable in under five seconds.
- Make adding a fifth hobby mostly a content-data task rather than a UI rewrite.

### Explicit non-goals for v0.1

- No expert marketplace, payments, public profiles, followers, comments, or leaderboards.
- No automatic verification through wearables, camera analysis, or GPS.
- No live product-price scraping or affiliate purchasing.
- No AI-generated canonical skill trees at runtime.
- No complex 3D avatar. The avatar is a composited 2D paper-doll system.
- No punitive daily streak mechanics.
- No native mobile app; build a responsive PWA-ready web app.

---

## 3. Target user and key jobs

### Primary persona

A curious beginner who frequently becomes interested in a new hobby, researches intensely, and then struggles with information overload, unclear learning order, and deciding what equipment is actually necessary.

### User jobs

- “Tell me what I need before my first session.”
- “Show me the next useful thing to learn.”
- “Give me a small practice task I can do today.”
- “Explain why this skill matters and what common mistakes look like.”
- “Help me avoid wasting money on gear I do not need yet.”
- “Let me see that my real-life effort is building a character over time.”

---

## 4. Information architecture

### Primary navigation

Use a Macintosh-style top menu bar on desktop and a compact bottom dock on mobile.

| Destination | Purpose |
|---|---|
| Home | Life level, avatar, continue cards, current quests, recent activity |
| Hobbies | Four hobby cards, level/XP, next recommended node |
| Skill Tree | Interactive tree for the selected hobby |
| Quest Log | Active, available, and completed quests |
| Character | Avatar builder, life stats, hobby levels, unlock closet |
| Loadout | Owned gear, wishlist, readiness indicators by hobby |
| Achievements | Major milestones and earned badges |
| Settings | Name, reduced motion, sound, theme, export/reset, account |

### Routes

```text
/
/onboarding
/home
/hobbies
/hobbies/[hobbySlug]
/hobbies/[hobbySlug]/nodes/[nodeSlug]
/quests
/character
/loadout
/achievements
/settings
/auth/sign-in
/auth/sign-up
/auth/callback
```

Use intercepting/modal routing for node details on wide screens if convenient, but every node must also have a direct URL and work after refresh.

---

## 5. Core screens

### 5.1 Onboarding

Four short steps, skippable in demo mode:

1. **Welcome:** “What do you want to become better at?”
2. **Choose hobbies:** Tennis, Cycling/Fixed Gear, Swimming, Journaling. Select one or more.
3. **Create character:** name, skin tone, hair, hair color, shirt, bottoms, shoes, and one optional accessory.
4. **Pick first quest:** app recommends the first available orientation node for a chosen hobby.

Completion creates enrollments, initializes progress, equips default avatar items, and opens Home.

### 5.2 Home desktop

Arrange the dashboard like overlapping but orderly Macintosh windows on a warm desktop background:

- **Character window:** large 2D avatar, life level, total XP, “Customize” button.
- **Continue window:** one strongest recommended next action, chosen using the recommendation rules below.
- **Hobbies window:** four compact rows with icon, title, hobby level, XP bar, and next node.
- **Quest Log window:** up to three active quests.
- **Activity window:** recent earned XP and completions.

On mobile, stack these as cards and keep a five-item bottom dock.

### 5.3 Hobby overview / skill tree

Header contains hobby name, level, XP, current tier, active quest, and completion summary. Below is a pannable/zoomable tree with semantic HTML fallback.

Node states:

- **Locked:** dim, lock icon, shows unmet prerequisites on selection.
- **Available:** colored outline and subtle pulse; may be started.
- **In progress:** half-filled status ring.
- **Completed:** solid fill and checkmark.
- **Mastered:** star/burst frame. Mastery is separate from completion.

Connection states:

- Locked connection: dotted gray.
- Available path: pastel hobby color.
- Completed path: darker green.
- Optional path: thinner line.

Controls: zoom in/out, center, fit tree, list/tree toggle, filters by tier/category/status. On phones default to a vertical “journey” list; tree view remains optional.

### 5.4 Node detail

The node opens as a large system window or full mobile sheet. Required sections:

- Title, icon, tier, node type, expected time, XP.
- Why this matters.
- What you will learn (3–6 concise bullets).
- Step-by-step lesson or drill.
- Common mistakes.
- Safety callout when relevant.
- Gear needed, with owned/wishlist status.
- Completion challenge and evidence mode.
- Curated resources with source name and link.
- Prerequisites and what this unlocks.
- “Start,” “Mark practice,” “Complete challenge,” or “Mark mastered” action.

For v0.1 completion is honor-based. Optional note, duration, quantity, and confidence inputs may be captured; photo/video proof is not required.

### 5.5 Completion modal

Keep under three seconds and honor reduced-motion preferences:

- Node icon stamps into place.
- “+100 Tennis XP” counts upward.
- Hobby and life XP bars update.
- Newly unlocked nodes appear as small chips.
- Any avatar item or achievement unlock appears.
- Buttons: “View next skill” and “Back to tree.”

### 5.6 Character screen

Inspired by a game character stat sheet, but warm and non-combat-oriented.

Left: avatar preview. Right: life level and category stats. Beneath: customizable tabs for Body, Hair, Tops, Bottoms, Shoes, Accessories, and Hobby Props.

Avatar choices must not affect gameplay. Unlocks are cosmetic rewards such as:

- Tennis Level 2: mint visor.
- Cycling Level 2: pastel helmet.
- Swimming Level 2: teal goggles.
- Journaling Level 2: warm ochre satchel/notebook.
- Life Level 5: Macintosh-inspired cream sweatshirt.

The MVP avatar system uses transparent SVG/PNG layers with an identical canvas and anchor points:

```text
background
body/skin
eyes/face
hair-back
bottoms
top
shoes
hair-front
accessory
hobby-prop
foreground-effect (rare; off by default)
```

Store selections as item IDs, not image paths. Include inclusive skin tones, several hair textures, and non-gendered clothing categories. Do not label bodies “male/female”; allow any combination.

### 5.7 Loadout

Per hobby, separate **Owned**, **Wishlist**, and **Not needed yet**. A readiness panel states what the user can currently do, never a manipulative “equipment score.” Example: “Ready for your first tennis session: racquet and balls recorded; court shoes optional for now.”

### 5.8 Quest log

Skills are permanent progression; quests are current actions. Users may pin at most three active quests to avoid overload.

Quest types:

- One-time node challenge.
- Repeatable practice target.
- Weekly flexible goal.
- Milestone quest.

No quest expires with punishment. A weekly quest may roll into “unfinished” and be restarted.

---

## 6. Progression system

### XP rules

| Action | Typical XP | Purpose |
|---|---:|---|
| Orientation/learn node | 20–35 | Understand a rule or concept |
| Gear/readiness node | 25–40 | Make a safe, informed start |
| Practice node | 50–80 | Perform a real session |
| Challenge node | 100–175 | Demonstrate a measurable ability |
| Milestone | 200–300 | Meaningful real-world event |
| Repeatable practice | 10–40 | Maintain momentum without farming |

Canonical XP values live on nodes and quests. Completion transactions must be idempotent: the same one-time node cannot award XP twice. Repeatables enforce `max_completions_per_period`.

### Hobby levels

Use cumulative thresholds:

| Level | Name | Total hobby XP |
|---:|---|---:|
| 0 | Curious | 0 |
| 1 | Newcomer | 100 |
| 2 | Beginner | 300 |
| 3 | Capable Beginner | 650 |
| 4 | Recreational | 1,100 |
| 5 | Developing | 1,700 |
| 6 | Skilled | 2,500 |
| 7 | Experienced | 3,500 |
| 8 | Advanced | 4,800 |
| 9 | Specialist | 6,400 |
| 10 | Mentor | 8,500 |

Use a lookup table, not a fragile formula, so balancing can change later.

### Life level

Life XP is the sum of all unique XP ledger entries across hobbies and global achievements. Display a life level using this formula for v0.1:

```ts
lifeLevel = Math.floor(Math.sqrt(totalLifeXp / 250)) + 1
```

Life level is presentation only and does not lock learning content.

### Completion versus mastery

- **Complete:** user met the node’s basic challenge once and receives its XP.
- **Mastered:** optional higher standard completed later; awards a badge or modest bonus XP and a star state.
- Mastery never blocks the main beginner path.

### Unlock algorithm

A node is available when:

1. It is published.
2. Every required prerequisite is completed.
3. At least one prerequisite is completed for any explicitly defined OR-group.
4. Any mandatory safety prerequisite is completed.
5. The node is not completed.

Do not rely only on coordinates or connector lines to determine availability.

### Recommended-next algorithm

Select in this order:

1. Pinned active quest with incomplete steps.
2. Started but incomplete node.
3. Available required node in the lowest current tier.
4. Available node tagged `recommended`.
5. Any available node with the shortest estimated duration.

Avoid recommending the same ignored item more than three visits in a row; then rotate among equally valid options.

### Category stats

The character stat sheet shows non-combat dimensions derived from completed node tags:

- Athletics
- Creativity
- Knowledge
- Practical
- Wellness

These are descriptive XP totals, not claims of objective ability. Tennis, cycling, and swimming primarily contribute to Athletics; journaling primarily contributes to Creativity and Wellness.

---

## 7. Universal content model

### Node types

| Type | Meaning |
|---|---|
| orientation | Terminology, rules, etiquette, safety concepts |
| gear | Required gear, budget tiers, buying and fitting guidance |
| lesson | Technique or conceptual instruction |
| practice | Repeatable drill or exercise |
| challenge | Measurable demonstration |
| milestone | Real-world event such as first match or first open-water session with supervision |
| specialization | Branch choice or advanced focus |
| maintenance | Care, repair, setup, or troubleshooting |
| resource | Curated reference collection; low XP or no XP |

### Required content fields

```ts
type SkillNode = {
  id: string;
  hobbyId: string;
  slug: string;
  title: string;
  shortDescription: string;
  whyItMatters: string;
  nodeType: NodeType;
  tier: 'start' | 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  xpReward: number;
  masteryXpReward?: number;
  estimatedMinutes: number;
  isRequired: boolean;
  isSafetyCritical: boolean;
  isRecommended: boolean;
  sortOrder: number;
  position: { x: number; y: number };
  learningObjectives: string[];
  instructions: ContentBlock[];
  commonMistakes: string[];
  safetyNotes: string[];
  completion: CompletionDefinition;
  mastery?: CompletionDefinition;
  gearRequirementIds: string[];
  resourceIds: string[];
  status: 'draft' | 'published' | 'archived';
  contentVersion: number;
};

type CompletionDefinition = {
  prompt: string;
  evidenceMode: 'honor' | 'count' | 'duration' | 'note';
  targetValue?: number;
  targetUnit?: string;
};
```

### Content trust metadata

Every resource or substantive instructional node supports:

- `source_urls`
- `last_reviewed_at`
- `review_status`: draft, researched, community-reviewed, expert-reviewed
- `reviewer_name` and `reviewer_credentials` when applicable
- `safety_disclaimer` where appropriate

For v0.1, display “Curated draft” rather than implying professional review. Never fabricate expert approval.

---

## 8. Seed hobby trees

The seed content should contain the following nodes. Each node needs a short lesson, practical instructions, mistakes, completion prompt, and 1–3 curated resource placeholders. The dependency arrows below are canonical.

### 8.1 Tennis

**Theme:** dusty rose `#D98C8C`; icon 🎾  
**Primary categories:** Orientation, Gear, Technique, Practice, Strategy, Fitness

| ID | Tier | Node | Type | XP | Requires | Completion |
|---|---|---|---|---:|---|---|
| ten-start | Start | Welcome to Tennis | orientation | 20 | — | Read overview and choose a first goal |
| ten-gear | Start | First Racquet & Balls | gear | 30 | ten-start | Record owned/borrowed racquet and balls |
| ten-safety | Start | Court Safety & Etiquette | orientation | 30 | ten-start | Complete safety checklist |
| ten-scoring | Start | Court, Rules & Scoring | orientation | 30 | ten-start | Correctly log a sample game score |
| ten-grip | Beginner | Grip & Ready Position | lesson | 50 | ten-gear, ten-safety | Demonstrate/confirm ready position for 10 reps |
| ten-contact | Beginner | Contact & Ball Tracking | practice | 60 | ten-grip | Self-drop and contact 20 balls under control |
| ten-forehand | Beginner | Forehand Fundamentals | challenge | 100 | ten-contact | Land 10 controlled forehands in court |
| ten-backhand | Beginner | Backhand Fundamentals | challenge | 100 | ten-contact | Land 10 controlled backhands in court |
| ten-footwork | Beginner | Split Step & Recovery | practice | 75 | ten-grip | Complete three 60-second shadow-footwork rounds |
| ten-rally5 | Beginner | Five-Shot Rally | milestone | 150 | ten-forehand, ten-backhand, ten-footwork | Sustain five cooperative shots |
| ten-serve1 | Intermediate | Serve Fundamentals | lesson | 100 | ten-rally5, ten-scoring | Land 10 of 30 controlled serves |
| ten-return | Intermediate | Return of Serve | practice | 100 | ten-rally5 | Return 10 cooperative serves |
| ten-volley | Intermediate | Net Play & Volley | challenge | 110 | ten-rally5 | Land 10 controlled volleys |
| ten-spin | Intermediate | Topspin & Slice | lesson | 120 | ten-forehand, ten-backhand | Produce intentional topspin and slice in practice |
| ten-position | Intermediate | Court Positioning | lesson | 100 | ten-rally5 | Complete a positioning scenario quiz/drill |
| ten-match | Intermediate | First Full Match | milestone | 250 | ten-serve1, ten-return, ten-position | Play and log one full match |
| ten-consistency | Advanced | Rally Consistency | challenge | 175 | ten-match, ten-spin | Sustain a 20-shot cooperative rally |
| ten-patterns | Advanced | Point Construction | specialization | 150 | ten-match, ten-position | Use and journal three planned patterns |
| ten-conditioning | Advanced | Tennis Movement Plan | practice | 125 | ten-footwork | Complete a four-week movement plan |

Gear seed: racquet, tennis balls, athletic shoes; optional court shoes, overgrip, water bottle. “Do not buy yet”: polyester strings, multiple expensive racquets, large tournament bag.

### 8.2 Cycling / Fixed Gear

**Theme:** muted mustard `#D6B65C`; icon 🚲  
**Safety rule:** traffic safety and bike check are mandatory before ride challenges.

| ID | Tier | Node | Type | XP | Requires | Completion |
|---|---|---|---|---:|---|---|
| cyc-start | Start | Welcome to Cycling | orientation | 20 | — | Choose riding goal and environment |
| cyc-types | Start | Bike Types & Use Cases | orientation | 25 | cyc-start | Identify current/preferred bike type |
| cyc-anatomy | Start | Bike Anatomy | lesson | 35 | cyc-start | Identify 10 major parts |
| cyc-safety | Start | Helmet, Visibility & Traffic Safety | orientation | 40 | cyc-start | Complete mandatory safety checklist |
| cyc-fit | Start | Basic Bike Fit | gear | 40 | cyc-anatomy | Record saddle height check and reach comfort |
| cyc-check | Beginner | Pre-Ride ABC Check | maintenance | 50 | cyc-safety, cyc-anatomy | Perform air/brakes/chain check |
| cyc-control | Beginner | Starting, Stopping & Steering | practice | 60 | cyc-fit, cyc-check | Complete 20-minute low-traffic control session |
| cyc-brake | Beginner | Controlled Braking | challenge | 75 | cyc-control | Complete 10 smooth controlled stops |
| cyc-first5 | Beginner | First Five-Mile Ride | milestone | 150 | cyc-brake | Log a safe five-mile ride |
| cyc-flat | Intermediate | Fix a Flat | maintenance | 125 | cyc-anatomy, cyc-first5 | Remove/reinstall wheel and repair/replace tube |
| cyc-clean | Intermediate | Clean the Drivetrain | maintenance | 75 | cyc-first5 | Complete and log a cleaning |
| cyc-cadence | Intermediate | Cadence & Efficient Pedaling | practice | 100 | cyc-first5 | Complete cadence-focused session |
| cyc-10 | Intermediate | Ten-Mile Ride | milestone | 200 | cyc-cadence | Log a safe ten-mile ride |
| fixie-intro | Intermediate | Fixed Gear Fundamentals | specialization | 75 | cyc-types, cyc-safety, cyc-first5 | Explain fixed vs freewheel and safe stopping options |
| fixie-ratio | Intermediate | Gear Ratios & Skid Patches | lesson | 100 | fixie-intro, cyc-anatomy | Calculate current gear ratio and skid patches |
| fixie-retention | Intermediate | Foot Retention | gear | 75 | fixie-intro | Fit and practice safe entry/exit |
| fixie-control | Advanced | Fixed-Gear Control | challenge | 150 | fixie-ratio, fixie-retention, cyc-brake | Complete controlled cadence/stopping drill |
| cyc-route | Advanced | Route Planning & Repair Kit | challenge | 150 | cyc-10, cyc-flat | Plan and complete a supported route with kit |
| cyc-25 | Advanced | Twenty-Five-Mile Ride | milestone | 300 | cyc-route, cyc-cadence | Log a safe 25-mile ride |

Gear seed: certified helmet, lights/reflectors, pump, tire levers, spare tube, hex keys. Fixed-gear branch must recommend a functional front brake for road use and must never teach brakeless street riding as the beginner default.

### 8.3 Swimming

**Theme:** seafoam `#72B7A4`; icon 🏊  
**Safety rule:** never encourage unsupervised learning, breath-holding contests, or solo open-water practice.

| ID | Tier | Node | Type | XP | Requires | Completion |
|---|---|---|---|---:|---|---|
| swi-start | Start | Welcome to Swimming | orientation | 20 | — | Choose comfort level and pool access |
| swi-safety | Start | Water Safety & Pool Rules | orientation | 40 | swi-start | Confirm supervised/swim-safe environment |
| swi-gear | Start | Suit, Goggles & Cap | gear | 25 | swi-start | Record available gear; none beyond safe attire required |
| swi-comfort | Start | Water Comfort & Exhaling | practice | 60 | swi-safety | Complete supervised face-in-water exhale drill |
| swi-float | Beginner | Front & Back Float | challenge | 75 | swi-comfort | Hold relaxed front/back float with supervision |
| swi-streamline | Beginner | Body Line & Streamline | lesson | 60 | swi-float | Complete 10 controlled wall glides |
| swi-kick | Beginner | Flutter Kick from the Hip | practice | 75 | swi-streamline | Complete short kick sets without excessive knee bend |
| swi-freestyle | Beginner | Freestyle Pull | lesson | 90 | swi-streamline, swi-kick | Swim controlled short lengths focusing on pull |
| swi-breathe | Beginner | Side Breathing | challenge | 100 | swi-freestyle, swi-comfort | Complete repeatable side-breathing drill |
| swi-25 | Beginner | Continuous 25 | milestone | 150 | swi-breathe | Swim 25 yards/meters continuously and safely |
| swi-rotation | Intermediate | Rotation & Timing | practice | 100 | swi-25 | Complete rotation-focused set |
| swi-back | Intermediate | Backstroke Basics | lesson | 100 | swi-float, swi-25 | Swim a controlled 25 backstroke |
| swi-breast | Intermediate | Breaststroke Basics | lesson | 110 | swi-25 | Swim a controlled 25 breaststroke |
| swi-turn | Intermediate | Wall Turns | practice | 100 | swi-25 | Complete 10 safe touch/push or flip-turn attempts |
| swi-200 | Intermediate | Continuous 200 | milestone | 250 | swi-rotation, swi-turn | Swim 200 continuously at sustainable effort |
| swi-endurance | Advanced | Structured Endurance Set | challenge | 175 | swi-200 | Complete a designed interval set |
| swi-butterfly | Advanced | Butterfly Foundations | specialization | 150 | swi-200, swi-breast | Complete supervised body-dolphin and single-arm drills |
| swi-openwater | Advanced | Open-Water Readiness | specialization | 200 | swi-200, swi-safety | Complete checklist and supervised group session; never solo |

Gear seed: safe swimwear, goggles, cap optional. Fins and kickboard are optional training tools, not required. Include explicit guidance that bands restricting the knees are not a default correction tool for freestyle kicking.

### 8.4 Journaling

**Theme:** lavender `#AE9BC8`; icon 📔

| ID | Tier | Node | Type | XP | Requires | Completion |
|---|---|---|---|---:|---|---|
| jou-start | Start | Why Journal? | orientation | 20 | — | Pick one personal reason to journal |
| jou-tools | Start | Choose a Notebook & Pen | gear | 25 | jou-start | Use something already owned or record a simple choice |
| jou-first | Start | First Five-Minute Entry | challenge | 60 | jou-tools | Write uninterrupted for five minutes |
| jou-friction | Beginner | Make Starting Easy | lesson | 40 | jou-first | Choose a visible place and minimum entry size |
| jou-daily | Beginner | Daily Log | practice | 75 | jou-first | Complete three daily logs |
| jou-reflect | Beginner | Guided Reflection | practice | 75 | jou-first | Complete three reflection prompts |
| jou-gratitude | Beginner | Gratitude Without Repetition | practice | 75 | jou-first | Complete three specific gratitude entries |
| jou-week | Beginner | Seven-Day Experiment | milestone | 150 | jou-friction, any of jou-daily/jou-reflect/jou-gratitude | Journal on five of seven days |
| jou-style | Intermediate | Find Your Style | specialization | 75 | jou-week | Review entries and choose a preferred approach |
| jou-bullet | Intermediate | Bullet Journal Basics | specialization | 100 | jou-style | Create index, future log, and one daily page |
| jou-long | Intermediate | Long-Form Diary | specialization | 100 | jou-style | Complete one 20-minute long-form entry |
| jou-common | Intermediate | Commonplace Book | specialization | 100 | jou-style | Capture and annotate five ideas |
| jou-review | Intermediate | Monthly Review | milestone | 175 | jou-week | Complete one structured monthly review |
| jou-tags | Advanced | Themes, Tags & Retrieval | lesson | 100 | jou-review | Create and use a personal tagging/index system |
| jou-project | Advanced | Project Journal | challenge | 175 | jou-review, one specialization | Track a project across four entries |
| jou-90 | Advanced | Ninety-Day Practice | milestone | 300 | jou-review | Complete personally chosen cadence over 90 days; no perfect streak required |

Gear seed: any notebook and writing tool already owned. Provide budget tiers but explicitly discourage buying premium stationery before the user knows their preferences.

---

## 9. Achievements and initial quests

### Global achievements

| Achievement | Requirement | Reward |
|---|---|---:|
| First Step | Complete any node | 25 life XP |
| Curious Mind | Enroll in all four hobbies | Cream desktop badge |
| Real-World Action | Complete first practice node | 50 life XP |
| Well Rounded | Reach Level 2 in two hobbies | Avatar accessory unlock |
| Renaissance Beginner | Reach Level 2 in all four hobbies | Special Macintosh sweater |
| Ten Sessions | Log ten practice sessions total | 100 life XP |

### Initial quest templates

- Tennis: Complete one 20-minute court or wall session. Reward 60 XP.
- Cycling: Perform two ABC pre-ride checks. Reward 40 XP.
- Swimming: Complete two supervised technique sessions. Reward 75 XP.
- Journaling: Write three entries this week. Reward 60 XP.

Quest completion must create ledger records and activity events. Progress can be incremented manually from the Quest Log or relevant node.

---

## 10. Visual design system

### Art direction

Imagine an early Macintosh desktop designed in a cozy studio: cream plastic, paper, dark olive ink, warm amber highlights, soft shadows, pixel-scale details, and pastel hobby colors. Avoid pure black/white, glossy cyberpunk visuals, or a cold enterprise dashboard.

### Design tokens

```css
:root {
  --canvas: #D8CDBB;
  --desktop: #B9AD98;
  --surface: #F4EBDD;
  --surface-raised: #FFF7EA;
  --ink: #30372F;
  --ink-muted: #6F7469;
  --line: #62685E;
  --shadow: #857966;
  --accent-green: #6E8B68;
  --accent-green-dark: #496247;
  --amber: #C98945;
  --danger: #B96059;
  --tennis: #D98C8C;
  --cycling: #D6B65C;
  --swimming: #72B7A4;
  --journaling: #AE9BC8;
  --locked: #AAA99F;
  --focus: #2F6F62;
  --radius-sm: 3px;
  --radius-md: 7px;
  --pixel-shadow: 4px 4px 0 rgba(71, 65, 56, .35);
}
```

### Typography

- Display/window titles: a legible pixel or bitmap-inspired font such as Geist Mono with styling, or a bundled/open-licensed pixel font.
- Body: a highly readable humanist sans or system font.
- Do not use a pixel font for paragraphs or small accessibility text.
- Default body size 16px, minimum 14px for metadata.

### Macintosh UI motifs

- Windows have a cream title bar, horizontal pinstripes or subtle pattern, 1–2px dark border, square close/minimize controls, and offset shadow.
- Buttons appear tactile with a one-pixel pressed translation.
- Icons are simple 1-bit/limited-palette shapes but may use the hobby pastel.
- Progress bars are segmented like the character-reference image, but each hobby uses its pastel color.
- Tooltips and menus resemble classic system menus but retain modern keyboard/focus behavior.
- Use a subtle dither/noise texture at very low opacity; never reduce text contrast.

### Motion and sound

- 120–220ms interactions; 500–900ms completion celebration.
- Optional soft click/chime sound, off by default until the user enables sound.
- Reduced-motion mode removes pan/zoom easing, pulses, count-ups, and confetti.

### Responsive behavior

- Desktop ≥1024px: multi-window dashboard and full canvas tree.
- Tablet 768–1023px: two-column cards, tree canvas.
- Mobile <768px: stacked cards, bottom dock, vertical skill journey by default.
- Node details become a full-screen sheet on mobile.

### Accessibility

- WCAG AA color contrast for text and essential controls.
- Never communicate node state by color alone; include icon, label, and shape.
- All tree nodes reachable by keyboard; arrows move spatially, Enter opens, Escape closes.
- Provide a linear list view with identical functionality.
- Every avatar option has text labels and alt descriptions.
- Use `aria-live="polite"` for XP/unlock updates, not assertive announcements.

---

## 11. Recommended technical architecture

### Stack

- **Framework:** Next.js App Router + React + TypeScript.
- **Styling:** Tailwind CSS plus CSS custom properties for theme tokens; use CSS Modules for complex avatar/window styling if clearer.
- **Components:** build product-specific UI; use accessible primitives from Radix UI or shadcn/ui only where useful, then restyle completely.
- **Skill tree:** React Flow (`@xyflow/react`) with custom nodes/edges, fit-view controls, and a separate accessible list mode.
- **State/query:** server components for initial data; TanStack Query or small client hooks for mutations/cache. Avoid a large global store unless required; Zustand is acceptable for transient UI state.
- **Forms/validation:** React Hook Form + Zod.
- **Database/auth:** Supabase Postgres + Supabase Auth + Row Level Security.
- **Testing:** Vitest + React Testing Library; Playwright for the critical journey.
- **Deployment:** Vercel for the app and Supabase for backend services.
- **Package manager:** pnpm.

Do not pin speculative version numbers in this spec. At implementation time use mutually compatible current stable releases and commit the lockfile. Reference official documentation: https://nextjs.org/docs, https://supabase.com/docs, and https://reactflow.dev/learn.

### Two persistence adapters

Define a `ProgressRepository` interface with two implementations:

1. `LocalProgressRepository`: IndexedDB preferred, localStorage acceptable for v0.1. Used when Supabase variables are absent or demo mode is selected.
2. `SupabaseProgressRepository`: production/cloud implementation.

The UI and progression service must not directly call localStorage or Supabase. This keeps demo and cloud modes behaviorally consistent.

```ts
interface ProgressRepository {
  getProfile(): Promise<UserProfile>;
  updateProfile(input: ProfileUpdate): Promise<UserProfile>;
  listEnrollments(): Promise<HobbyEnrollment[]>;
  getNodeProgress(hobbyId: string): Promise<NodeProgress[]>;
  startNode(nodeId: string): Promise<NodeProgress>;
  completeNode(input: CompleteNodeInput): Promise<CompletionResult>;
  updateQuest(input: QuestProgressInput): Promise<QuestProgress>;
  listGear(hobbyId?: string): Promise<UserGear[]>;
  upsertGear(input: GearInput): Promise<UserGear>;
  saveAvatar(input: AvatarSelection): Promise<void>;
}
```

### Application layers

```text
UI components / routes
        ↓
use cases: startNode, completeNode, updateQuest, equipAvatarItem
        ↓
progression engine: prerequisites, XP, levels, unlocks, achievements
        ↓
repository interface
        ↓
Local adapter OR Supabase adapter
```

Keep progression calculations in pure TypeScript functions. Database functions/transactions protect idempotency, but business rules must also be testable without a database.

---

## 12. Database schema

Use UUID primary keys, `created_at`, and `updated_at` where applicable. Canonical content is global/readable; user state is private.

### Content tables

```sql
hobbies(
  id uuid pk, slug text unique, name text, description text,
  icon text, theme_color text, sort_order int,
  status text, content_version int
)

skill_nodes(
  id uuid pk, hobby_id uuid fk, slug text,
  title text, short_description text, why_it_matters text,
  node_type text, tier text, category text, tags jsonb,
  xp_reward int, mastery_xp_reward int,
  estimated_minutes int, is_required boolean,
  is_safety_critical boolean, is_recommended boolean,
  sort_order int, position_x numeric, position_y numeric,
  learning_objectives jsonb, instructions jsonb,
  common_mistakes jsonb, safety_notes jsonb,
  completion_definition jsonb, mastery_definition jsonb,
  status text, content_version int,
  unique(hobby_id, slug)
)

node_prerequisites(
  node_id uuid fk, prerequisite_node_id uuid fk,
  group_key text default 'all', requirement_type text default 'all',
  primary key(node_id, prerequisite_node_id)
)

resources(
  id uuid pk, title text, resource_type text, url text,
  creator text, description text, is_free boolean,
  review_status text, last_reviewed_at timestamptz
)

node_resources(node_id uuid fk, resource_id uuid fk, sort_order int)

gear_items(
  id uuid pk, hobby_id uuid fk, slug text, name text,
  category text, necessity text, description text,
  beginner_guidance text, avoid_until text,
  budget_low numeric, budget_high numeric, currency text
)

node_gear_requirements(node_id uuid fk, gear_item_id uuid fk, requirement text)

avatar_items(
  id uuid pk, slug text unique, name text, slot text,
  asset_path text, palette_key text, unlock_rule jsonb,
  is_default boolean, sort_order int
)

achievements(
  id uuid pk, slug text unique, name text, description text,
  icon text, xp_reward int, unlock_rule jsonb
)

quest_templates(
  id uuid pk, hobby_id uuid fk null, slug text unique,
  title text, description text, quest_type text,
  target_value numeric, target_unit text, xp_reward int,
  repeat_period text null, max_completions_per_period int null
)
```

### User-state tables

```sql
profiles(
  user_id uuid pk references auth.users,
  display_name text, onboarding_complete boolean,
  reduced_motion boolean, sound_enabled boolean,
  last_active_at timestamptz
)

hobby_enrollments(
  user_id uuid, hobby_id uuid, enrolled_at timestamptz,
  is_active boolean, primary key(user_id, hobby_id)
)

node_progress(
  id uuid pk, user_id uuid, node_id uuid,
  status text, started_at timestamptz, completed_at timestamptz,
  mastered_at timestamptz, confidence int,
  completion_count int default 0,
  evidence jsonb, content_version_completed int,
  unique(user_id, node_id)
)

xp_ledger(
  id uuid pk, user_id uuid, hobby_id uuid null,
  source_type text, source_id uuid, amount int,
  idempotency_key text unique, metadata jsonb,
  created_at timestamptz
)

user_quests(
  id uuid pk, user_id uuid, quest_template_id uuid,
  status text, progress_value numeric,
  period_start date null, started_at timestamptz,
  completed_at timestamptz,
  unique(user_id, quest_template_id, period_start)
)

practice_logs(
  id uuid pk, user_id uuid, hobby_id uuid,
  node_id uuid null, quest_id uuid null,
  duration_minutes int null, quantity numeric null,
  unit text null, notes text null, practiced_at timestamptz
)

user_gear(
  id uuid pk, user_id uuid, gear_item_id uuid,
  status text, nickname text null, details jsonb,
  unique(user_id, gear_item_id)
)

avatar_profiles(
  user_id uuid pk, selected_items jsonb,
  background_key text, pose_key text, updated_at timestamptz
)

user_avatar_unlocks(
  user_id uuid, avatar_item_id uuid, unlocked_at timestamptz,
  source_type text, source_id uuid null,
  primary key(user_id, avatar_item_id)
)

user_achievements(
  user_id uuid, achievement_id uuid, earned_at timestamptz,
  primary key(user_id, achievement_id)
)

activity_events(
  id uuid pk, user_id uuid, event_type text,
  hobby_id uuid null, entity_id uuid null,
  payload jsonb, occurred_at timestamptz
)
```

### Security and data rules

- Enable RLS on every user-state table.
- A user may select/insert/update/delete only rows where `user_id = auth.uid()`.
- Published content tables are readable by authenticated and demo clients; writes require an admin/service role and are not exposed in the regular app.
- Never expose the service-role key to the browser.
- Node completion should call a server action or Postgres function that locks/checks the row, inserts an idempotent ledger entry, updates progress, evaluates achievements, and returns all unlocks in one transaction.
- Validate every mutation with Zod on the server even if the client validated it.

---

## 13. Server actions / API contracts

Prefer typed server actions for the Next.js app. If REST handlers are easier, preserve these logical contracts.

### `completeNode`

Input:

```json
{
  "nodeId": "uuid",
  "evidence": { "mode": "count", "value": 10, "unit": "forehands", "note": "optional" },
  "idempotencyKey": "userId:nodeId:complete"
}
```

Output:

```json
{
  "nodeProgress": { "status": "completed" },
  "xpAwarded": 100,
  "hobbyXp": 520,
  "hobbyLevelBefore": 2,
  "hobbyLevelAfter": 2,
  "lifeXp": 2750,
  "lifeLevelBefore": 4,
  "lifeLevelAfter": 4,
  "unlockedNodeIds": ["uuid"],
  "newAchievementIds": [],
  "newAvatarItemIds": []
}
```

Reject if prerequisites are unmet, safety prerequisites are incomplete, node is unpublished, or the evidence value fails a numeric requirement. Repeated calls with the same key return the existing result without duplicate XP.

Other use cases:

- `startNode(nodeId)`
- `masterNode(nodeId, evidence)`
- `enrollInHobby(hobbyId)`
- `logPractice(input)`
- `pinQuest(questTemplateId)`
- `updateQuestProgress(userQuestId, delta)`
- `setGearStatus(gearItemId, owned|wishlist|not_needed)`
- `saveAvatarSelection(selectedItems)`
- `exportUserData()`
- `resetDemoData()` with explicit confirmation

---

## 14. Frontend component map

```text
app/
  (auth)/
  (app)/
    layout.tsx
    home/page.tsx
    hobbies/page.tsx
    hobbies/[hobbySlug]/page.tsx
    hobbies/[hobbySlug]/nodes/[nodeSlug]/page.tsx
    quests/page.tsx
    character/page.tsx
    loadout/page.tsx
    achievements/page.tsx
    settings/page.tsx
components/
  mac/
    MacWindow, MacTitleBar, MacButton, MacMenuBar, MacDialog, SegmentedBar
  skill-tree/
    SkillTreeCanvas, SkillNodeCard, SkillEdge, TreeControls, SkillListView
  nodes/
    NodeDetail, LessonBlocks, CompletionForm, PrerequisiteList
  progress/
    XpBar, LevelBadge, UnlockToast, CompletionCelebration
  character/
    AvatarCanvas, AvatarLayer, AvatarCloset, CharacterStats
  quests/
    QuestCard, QuestProgress, QuestPinButton
  gear/
    GearCard, ReadinessPanel, GearStatusControl
  dashboard/
    ContinuePanel, HobbySummary, RecentActivity
lib/
  progression/
    levels.ts, prerequisites.ts, recommendations.ts, achievements.ts
  repositories/
    types.ts, local.ts, supabase.ts
  validation/
  supabase/
content/
  hobbies/*.json
  avatar-items.json
  achievements.json
```

### Important implementation detail: skill tree layout

Store deliberate seed coordinates in content for a designed look. Use a layout engine only as a content-authoring helper later. On small screens render a tier-grouped ordered list instead of trying to squeeze the graph.

### Avatar asset strategy

For the first coded version, create simple original SVG layers with rounded pixel-art geometry. Avoid using copyrighted game characters or traced reference art. Every asset uses a 512×512 viewBox, same body anchor, and palette variables. The character should feel like a friendly paper-doll hero, not a realistic portrait.

---

## 15. Demo mode and seed behavior

On first visit, show “Try demo” and “Create account.” Demo mode should be fully usable and not a fake slideshow.

- Seed profile name: Nicholas (editable).
- Start at Life Level 1, 0 XP unless a “sample progress” toggle is selected.
- Optional sample progress demonstrates completed/available/locked states and can be reset.
- Persist demo data locally across refreshes.
- Offer data export as JSON.
- Later account migration is optional for v0.1; do not promise automatic merging unless implemented.

---

## 16. AI coach: future interface, not MVP dependency

Design the domain interface now but hide the feature behind `FEATURE_AI_COACH=false`.

The coach receives structured context, never the entire database:

```ts
type CoachContext = {
  hobby: { name: string; currentLevel: number };
  currentNode: SkillNodeSummary;
  completedNodeTitles: string[];
  ownedGear: string[];
  recentPractice: { date: string; duration?: number; note?: string }[];
  userQuestion: string;
};
```

Allowed future tasks:

- Explain a curated node in simpler words.
- Adapt its drill to available time/equipment.
- Troubleshoot a user-described problem.
- Suggest one next practice session using only unlocked content.

Disallowed behavior:

- Inventing safety claims or overriding safety prerequisites.
- Marking challenges complete.
- Replacing canonical prerequisites.
- Giving medical diagnosis.
- Generating shopping endorsements without clear criteria/source/date.

When added, call the model only from the server, rate-limit it, moderate input, bound output length, and log minimal non-sensitive analytics. It should cite the curated node/resources used.

---

## 17. Error, empty, and edge states

- Offline/cloud error: keep read content available where cached; queue no XP mutation unless replay can be idempotent.
- Locked node: show exactly which prerequisite(s) remain with navigation links.
- Missing gear: suggest borrowing or adding to wishlist; do not block unless the item is safety-critical.
- No active quests: offer three suitable templates based on available nodes.
- All visible nodes complete: recommend a specialization, mastery challenge, or repeatable practice—not “100% complete.”
- Content version updated: preserve completion and show “Guide updated” without revoking earned XP.
- Corrupt local data: offer JSON export before reset if possible.
- Empty activity: explain that completed practice appears here.
- Invalid node URL: return friendly themed 404 with “Back to hobby.”

---

## 18. Analytics and privacy

Keep analytics optional and privacy-light. Useful events:

- onboarding_completed
- hobby_enrolled
- node_opened
- node_started
- node_completed
- quest_pinned
- quest_completed
- gear_status_changed
- avatar_item_equipped
- next_recommendation_clicked

Do not record journal entry text. Practice notes are private user data, not analytics. Provide account deletion/export when accounts are enabled.

---

## 19. Testing requirements

### Unit tests

- Every hobby level boundary.
- Life-level formula.
- AND and OR prerequisite evaluation.
- Mandatory safety prerequisite behavior.
- Idempotent one-time XP awards.
- Repeatable quest period caps.
- Recommended-next priority ordering.
- Achievement and avatar unlock rules.

### Component tests

- Each node state has correct text/icon/ARIA attributes.
- Locked node explains unmet prerequisites.
- Completion form validates count/duration evidence.
- Avatar layers render in the defined order.
- Reduced-motion preference disables celebration animation.

### End-to-end tests

1. Enter demo mode, select Tennis, create avatar, complete Welcome node, see XP and next node unlock.
2. Locked Swimming node cannot be completed before Water Safety.
3. Complete a quest and confirm only one ledger award after refresh/retry.
4. Change avatar clothing, refresh, selection persists.
5. Mobile viewport can reach and complete a node through list view.
6. Authenticated users cannot read another user’s progress through direct requests.

### Quality gates

- TypeScript strict mode passes.
- ESLint passes.
- No serious axe accessibility violations on primary screens.
- Lighthouse targets: performance ≥85, accessibility ≥95 on a production build, allowing for the graph screen.

---

## 20. Build phases and acceptance criteria

### Phase 1 — Foundation

- Create Next.js app, theme tokens, Macintosh components, navigation, responsive shell.
- Create content types, seed loader, local repository, and progression pure functions.
- Acceptance: Home and hobby pages render from seed data; refresh preserves local profile.

### Phase 2 — Core loop

- Skill tree/list, node details, prerequisites, start/complete actions, XP ledger, levels, completion modal.
- Acceptance: a user can progress from first node through an unlock without manual data edits.

### Phase 3 — Personal systems

- Avatar builder, unlock closet, quests, activity log, achievements, loadout.
- Acceptance: milestone completion can unlock an avatar item and achievement in one flow.

### Phase 4 — Cloud backend

- Supabase schema/migrations, Auth, RLS, cloud repository, transactional completion function.
- Acceptance: two test users have isolated progress and identical content.

### Phase 5 — Polish

- Seed full lessons, mobile tree/list, sound toggle, reduced motion, empty/error states, tests, README, deploy config.
- Acceptance: all definition-of-done items pass.

### Later phases

- Content editor and review workflow.
- Contextual AI coach.
- Expert-reviewed content labels.
- More hobbies.
- Wearable integrations and optional evidence.
- Community-created trees only after moderation/versioning exists.

---

## 21. Repository setup and environment

Expected scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "seed:validate": "tsx scripts/validate-content.ts"
}
```

Environment template:

```bash
NEXT_PUBLIC_APP_MODE=demo
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
FEATURE_AI_COACH=false
```

The app must boot in demo mode without Supabase variables. Service-role variables may only be used server-side. Include `.env.example`, migrations, seed scripts, and a README with local setup and deployment instructions.

---

## 22. Codex implementation checklist

- [ ] Scaffold app with strict TypeScript and pnpm.
- [ ] Add responsive retro Macintosh app shell.
- [ ] Define domain/content schemas with Zod.
- [ ] Add all four seed trees and validate graph integrity (no missing IDs or cycles).
- [ ] Implement pure XP, level, prerequisite, recommendation, and achievement functions.
- [ ] Implement repository interface and local adapter.
- [ ] Implement hobby cards, tree canvas, and accessible list view.
- [ ] Implement node detail and completion flow with idempotency.
- [ ] Implement quests and practice logging.
- [ ] Implement loadout/readiness.
- [ ] Create original layered SVG avatar assets and builder.
- [ ] Implement achievements and cosmetic unlocks.
- [ ] Add Supabase migrations, RLS, Auth, and cloud adapter.
- [ ] Add completion transaction/RPC.
- [ ] Add loading, empty, offline, and error states.
- [ ] Add reduced-motion and sound settings.
- [ ] Add unit, component, E2E, and RLS tests.
- [ ] Add README, environment example, seed validation, and deployment notes.
- [ ] Run lint, typecheck, tests, production build, and visual check at desktop/mobile widths.

---

## 23. Final product voice

Copy should sound like an encouraging coach and curious friend—never childish, militaristic, or guilt-driven.

Good:

- “You’re ready for your first controlled rally.”
- “No fancy notebook needed. Use what you already have.”
- “A break doesn’t erase your progress.”
- “Complete Water Safety before starting this drill.”

Avoid:

- “You failed your streak.”
- “Only 72% productive today.”
- “Buy this premium item to level faster.”
- “Mastered” after merely opening an article.

The final feeling should be: **a tiny warm computer that remembers what the user wants to become, shows the next manageable step, and celebrates when they actually do it.**

