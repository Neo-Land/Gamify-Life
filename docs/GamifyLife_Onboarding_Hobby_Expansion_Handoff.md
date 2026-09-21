# Gamify.Life — Onboarding, Hobby Expansion & Start-Kit Handoff

**Document type:** Claude Code implementation directive
**Repo:** `~/code/Gamify-Life` (Next.js 16 App Router · React 19 · Supabase · pnpm · Vitest + Playwright)
**Companion docs:** `docs/CONTINUE_HERE.md`, `docs/GamifyLife_Codex_Build_Spec.md`, `docs/GamifyLife_Character_Centered_Homepage_Handoff.md`
**Priority:** Where this document conflicts with earlier handoffs on onboarding, hobby content, or gear, this document wins. Everything else — the progression engine, XP ledger, auth, guest session behavior, window/desktop system, seasonal scene — is preserved unchanged.

---

## 0. Read this first

This is a five-part feature, and the parts depend on each other in order. Do not start at Part 3 because it looks easiest. Phase 0 is a refactor with no user-visible change, and skipping it will make Parts 2–5 roughly three times more painful, because the codebase currently hard-codes "there are exactly four hobbies, and they are tennis, cycling, swimming, journaling" in at least nine places.

The product goal, in one paragraph: a new player signs in and immediately meets their character. They can customize it or skip (skipping gives them a randomly colored placeholder they will want to replace). They then browse a larger hobby catalog where every hobby honestly states what it costs to start and what can be borrowed. They pick their hobbies, answer a short questionnaire per hobby so the app knows whether they are brand new or returning, then triage the equipment list into what they have, what they want, and what they still need. The app's job is not only to track progress — it is to remove every excuse not to start.

---

## 1. Non-negotiable invariants

Violating any of these breaks correctness guarantees the existing test suite and the Supabase layer depend on.

**XP is earned, never granted by onboarding.** `lib/progression.ts` awards XP exclusively through the `award()` helper, which writes an idempotent entry into `state.ledger`. `commit_progress` in `supabase/migrations/002_retro_rewards.sql` replays that ledger into `xp_ledger` with `unique(user_id, idempotency_key)`. Nothing in the questionnaire, the skip button, or the equipment checklist may add a ledger entry. A placement result adjusts *what the app recommends*; it never mints XP.

**Safety-critical nodes are never bypassed.** `safetyRequirements()` and `practicePrerequisites()` in `lib/progression.ts` gate practice logging behind `swi-safety`, `cyc-safety`, `cyc-check`, etc. A self-reported "I'm advanced at swimming" must not mark `swi-safety` complete. This rule extends to every new hobby: anything with a real injury path (PC building has electrical/ESD steps, running has load-management, volleyball has warm-up) gets a safety node that placement can never skip.

**State stays backward compatible.** `stateSchema` in `lib/domain.ts` is `version: z.literal(1)` and existing guest/cloud snapshots parse against it. Every new field you add must have `.default(...)` so an old snapshot still parses — this is exactly the pattern `tests/preferences.test.ts` asserts for legacy UI preferences. Do not bump the version literal. Add a matching case to that test for the new fields.

**All writes are domain commands.** `lib/repositories/types.ts` intentionally forbids a client-authored snapshot. New behavior means a new entry in `commandSchema` plus a branch in `applyCommand()` — never a direct `setState`.

**`supabase/seed.sql` is generated.** It is produced by `pnpm seed:sql` from `lib/content.ts`. Never hand-edit it. Regenerate and commit it whenever content changes.

**Every node needs a lesson.** `lib/content.ts` does `lessons[n.id].split('|')` with no guard. A node in `content/nodes.json` without a matching key in `content/lessons.ts` is a hard crash at import time, which means a blank app. `pnpm seed:validate` catches missing instructions, mistakes, and resources — run it after every content change.

**Match the house code style.** This codebase is deliberately dense: single-line exported functions, minimal whitespace, comments reserved for non-obvious decisions. Match the file you are editing rather than reformatting it. Do not reflow existing lines — it makes the diff unreadable.

---

## 2. Current architecture, in the places you will touch

| Concern | Location | Notes |
| --- | --- | --- |
| Sign-in → onboarding gate | `components/entry.tsx` (`EntryGate`, `LoginDialog`, `Setup`) | `Setup` is already a two-step wizard: character, then hobbies. Character creation is *already* first; what is missing is a skip path. |
| Character customizer | `components/character-creator.tsx` | Tab per slot, cycles `avatarItems` filtered to `level===0`. Has RANDOMIZE and RESET. |
| Character rendering | `components/avatar.tsx`, `components/rig-layers.tsx`, `lib/body-rigs.ts`, `lib/hair.ts`, `lib/headwear.ts` | SVG paper doll on a 256×384 canvas. Colors come from `avatarItems[].color` through the local helper `color(slot, fallback)`. There is already a `shade(hex, amount)` helper in `avatar.tsx`. |
| Wardrobe data | `lib/wardrobe.ts` (`extraWardrobe`, `avatarSlots`) + the `avatarItems` array in `lib/content.ts` | 14 slots; `avatarSlots` drives the creator tabs. |
| Hobby catalog | `content/hobbies.json` | Currently four entries: `id`, `name`, `icon`, `color`, `description`, `prefix`. |
| Hobby ID type | `lib/content.ts` → `export const hobbyIds = [...] as const` | Feeds `z.enum(hobbyIds)` in `lib/domain.ts` for enrollments, plans, practice, and `selectedPreviewHobbyId`. |
| Skill trees | `content/nodes.json` (72 nodes) + `content/lessons.ts` | Node IDs use the hobby `prefix`, e.g. `ten-start`, `cyc-check`. |
| Per-hobby prose that is hard-coded | `lib/content.ts` (safety text and resource links, as chained ternaries), `components/entry.tsx` (the cost/gear blurb map inside the hobby picker), `lib/quick-start.ts` (`firstQuests`), `lib/progression.ts` (`practicePrerequisites`) | **This is the tax Phase 0 removes.** |
| Gear | `gear` array in `lib/content.ts`; user state in `state.gear` as `Record<gearId, 'owned'\|'wishlist'\|'not_needed'>`; UI in `LoadoutPage` in `components/screens.tsx` | Gear items have `id`, `hobbyId`, `name`, `necessity`, `guidance`. No cost data yet. |
| Reducer | `lib/progression.ts` → `applyCommand()` | Also computes achievements at the bottom, with `s.enrollments.length===4` and `levels.every(l=>l>=2)` hard-coded to four hobbies. |
| Schema/commands | `lib/domain.ts` | `stateSchema`, `profileSchema`, `commandSchema`. |
| DB | `supabase/migrations/001…sql`, `002…sql` | Content tables store a `content jsonb` blob, so new gear/hobby fields need **no migration**. `user_gear.status` is `text`, so new status values need **no migration** either. |

---

## 3. Phase 0 — Make "add a hobby" a data-only change

**Goal:** after this phase, adding a hobby means editing `content/hobbies.json`, `content/nodes.json`, `content/lessons.ts`, and the `gear` array — and nothing else. No behavior change is visible to the user. Ship this as its own commit.

### 3.1 Widen the hobby record

Extend each entry in `content/hobbies.json` with the fields that are currently scattered through code, and add a Zod schema for it in `lib/content.ts` (there is a `nodeSchema` to model it on — do the same for hobbies so bad content fails at build, not at runtime):

```jsonc
{
  "id": "tennis",
  "name": "Tennis",
  "icon": "🎾",
  "color": "#D98C8C",
  "description": "Find your rhythm. One rally at a time.",
  "prefix": "ten",
  "safetyNote": "Check the court, warm up gently, keep clear of others and stop if you feel pain.",
  "resource": { "title": "USTA learning resources", "url": "https://www.usta.com/en/home/improve.html" },
  "practicePrerequisites": ["ten-safety"],
  "startSummary": "Borrow a racquet · TECHNIQUE-HEAVY"
}
```

Then delete the corresponding hard-coded maps:

- In `lib/content.ts`, replace the `safety` and `resources` ternary chains inside the `nodes` mapper with lookups on the hobby record.
- In `lib/progression.ts`, `practicePrerequisites(hobbyId)` becomes a lookup on the hobby record.
- In `components/entry.tsx`, the inline `({tennis:'Borrow a racquet · TECHNIQUE-HEAVY', …})[h.id]` map is replaced by `h.startSummary` (Phase 3 replaces this again with real cost data — that is fine and expected).

### 3.2 Derive `hobbyIds` from the JSON

```ts
// lib/content.ts
export const hobbies = hobbyListSchema.parse(rawHobbies);
export const hobbyIds = hobbies.map(h => h.id) as [string, ...string[]];
```

`z.enum` needs a non-empty tuple type, which the cast above provides. Confirm `pnpm typecheck` stays clean at `z.enum(hobbyIds)` in `lib/domain.ts`; if TypeScript 6 objects to the widened type, keep a `as const` tuple in `lib/content.ts` as the single source of truth and assert at module load that it matches the JSON ids exactly:

```ts
if (hobbies.length !== hobbyIds.length || hobbies.some(h => !hobbyIds.includes(h.id)))
  throw new Error('hobbies.json and hobbyIds are out of sync');
```

Either approach is acceptable. Pick one, and say which in the commit message.

### 3.3 De-hard-code the four-hobby achievements

In `lib/progression.ts`:

- `curious-mind` — "Enroll in all four hobbies" becomes **"Enroll in three hobbies"**: `s.enrollments.length >= 3`. Update the description in the `achievements` array in `lib/content.ts` to match.
- `renaissance` — "Reach level 2 in all four hobbies" becomes **"Reach level 2 in three hobbies"**: `levels.filter(l => l >= 2).length >= 3`. With ten hobbies, "all of them" is not a goal, it is a wall.
- `levels` is computed over `hobbyIds` — that keeps working once `hobbyIds` grows, but confirm the `earned` array indices still line up with the `achievements` array order. That pairing is positional and fragile; consider keying it by achievement id while you are in there.

### 3.4 Update the tests that assert "four" and "72"

`tests/progression.test.ts` asserts `expect(nodes).toHaveLength(72)` and distinct lesson count 72. Change both to derive from the content (`nodes.length`) while keeping the *distinctness* assertion, which is the part that has real value:

```ts
expect(new Set(nodes.map(n => n.whyItMatters)).size).toBe(nodes.length);
```

Add a new test asserting every node id has a lessons entry, and every hobby has at least one node, at least one required gear item, and a quest — the crash-prevention net for Phase 2.

**Phase 0 acceptance:** `pnpm seed:validate && pnpm typecheck && pnpm lint && pnpm test` all pass; `pnpm seed:sql` produces a `supabase/seed.sql` whose diff versus the committed one is empty or trivially reordered; the app looks and behaves identically.

---

## 4. Phase 1 — Character creation first, with a skippable random-tint fallback

### 4.1 What exists today

`EntryGate` in `components/entry.tsx` already routes a signed-in user with `onboardingComplete === false` into `Setup`, and `Setup` shows character creation as step 1 of 2. So the ordering requirement is already met. What is missing is the skip, the placeholder character, and the nudge back toward customizing.

### 4.2 New profile fields

In `lib/domain.ts`, add to `profileSchema`:

```ts
characterTint: z.enum(['red','orange','yellow','green','blue','indigo','violet']).nullable().default(null),
characterSkipped: z.boolean().default(false),
```

Add both to the `.partial()` extension in the `profile` command so they can be written. Both have defaults, so old snapshots keep parsing.

`characterTint` is an **enum, not a free hex string** — the tint is an authored palette, it round-trips through Supabase as a known token, and it cannot be used to inject arbitrary values into SVG fill attributes.

Define the palette next to the avatar code, not in the schema:

```ts
// lib/tints.ts
export const tints = {
  red:'#C4514B', orange:'#D1793A', yellow:'#C9A93F',
  green:'#5F8F5B', blue:'#4B7BA8', indigo:'#5B5A94', violet:'#8A5F96'
} as const;
export type TintId = keyof typeof tints;
export const randomTint = (rng = Math.random): TintId =>
  Object.keys(tints)[Math.floor(rng() * 7)] as TintId;
```

Take an injectable `rng` so the reducer test can assert deterministically.

### 4.3 Rendering the monochrome character

In `components/avatar.tsx`, the single choke point is:

```ts
const color=(slot:string,fallback:string)=>item(slot)?.color||fallback;
```

Add a `tint` prop (`TintId | null`) and override there. A flat one-color figure is unreadable — the silhouette disappears. Use the existing `shade()` helper to step luminance per band, so the character reads as *one color, many values*:

| Slot | Value |
| --- | --- |
| `body` (skin) | `shade(tint, -0.25)` — lightest; add a `tint(hex, amount)` sibling to `shade` if a negative amount does not lighten |
| `top` | `tint` |
| `outerwear` | `shade(tint, 0.10)` |
| `bottoms` | `shade(tint, 0.22)` |
| `shoes`, `backItem` | `shade(tint, 0.40)` |
| `hair`, `hairColor` | `shade(tint, 0.48)` — darkest, so the head still reads |
| `face`, `eyeColor`, line work | **unchanged** — keep the authored near-black lash/pupil values or the face becomes a smudge |

Verify against `docs/CONTINUE_HERE.md` §"Eyes are structured, not dots" before touching face rendering. Pass the tint down from every `<Avatar>` call site (`character-stage.tsx`, `character-centered-home.tsx`, `character-creator.tsx`, `item-preview.tsx`, `screens.tsx`) — a `useGame()`-derived default inside `Avatar` is *not* acceptable, because `ItemPreview` renders swatches that must stay untinted.

### 4.4 The skip flow

In `Setup`, alongside `CREATE CHARACTER`, add a secondary button:

> **SKIP FOR NOW** — "We'll give you a placeholder. You can design your character any time from the Character app."

On click, issue one command:

```ts
run({ type:'profile', input:{ name: name.trim() || 'Player', characterCreated:true, characterSkipped:true, characterTint: randomTint() } });
```

The avatar selection itself stays at `initialState().avatar` defaults — the tint is a render-time override, so no unlock validation is involved and `avatarUnlocked()` is untouched.

### 4.5 Clearing the tint

The tint is a placeholder, so the first real customization must dissolve it. In `applyCommand()`, in the `avatar` and `avatar-preset` branches, after the item validation succeeds:

```ts
s.profile={...s.profile,characterTint:null,characterSkipped:false};
```

Two consequences to handle deliberately:

1. A user who skipped and later opens the creator sees their true (default) colors the moment they change one slot. That is correct — but the creator should show a one-line banner first: *"You're using a placeholder color. Pick anything below to make this character yours."*
2. Add a persistent, dismissible nudge on the home scene while `characterSkipped === true`, linking to `/loadout/appearance/top`. One line, in the HUD, not a modal. Do not nag more than that.

### 4.6 Tests for Phase 1

- Reducer: skip command sets tint + `characterCreated`; a subsequent `avatar` command clears the tint; `characterTint` survives a `stateSchema.parse` round trip; an old snapshot without the fields parses to `null`/`false`.
- Component: `Avatar` with a tint renders no fill outside the tint's value ramp (except the authored face line colors); with `tint={null}` output is byte-identical to today.
- E2E (`tests/e2e/journey.spec.ts` sibling): guest → skip → lands on hobby selection → home scene shows the customize nudge.

---

## 5. Phase 2 — Six new hobbies

Add: **PC Building, Drawing, Painting, Running, Volleyball, Reading.** Suggested prefixes (three letters, must be unique — they namespace every node id):

| Hobby | id | prefix | icon | notes |
| --- | --- | --- | --- | --- |
| PC Building | `pc-building` | `pcb` | 🖥️ | Neo's own domain — the safety node is ESD, power supply handling, and not working on a live system. |
| Drawing | `drawing` | `drw` | ✏️ | Cheapest possible entry: pencil and any paper. |
| Painting | `painting` | `pnt` | 🎨 | Ventilation/solvent safety for oils; acrylic is the recommended start. |
| Running | `running` | `run` | 🏃 | Safety node covers load progression, traffic, and heat. |
| Volleyball | `volleyball` | `vol` | 🏐 | Mostly borrowed/shared equipment; finger and ankle safety. |
| Reading | `reading` | `rdg` | 📖 | Free by default — library card is the "gear". |

### 5.1 What each new hobby requires

For each of the six, produce **8–12 nodes** mirroring the existing tier shape. Look at the tennis set in `content/nodes.json` as the template. The minimum viable spine:

1. `<prefix>-start` — tier `start`, nodeType `orientation`, `requires: []`, xp 20, evidence `note`.
2. `<prefix>-gear` — tier `beginner`, nodeType `gear`, evidence `honor`. Mirrors `ten-gear`: its completion should require the required gear to be recorded (see 5.4).
3. `<prefix>-safety` — tier `beginner`, nodeType `safety`, `isSafetyCritical: true`.
4. Two to four `beginner` skills — the first real techniques.
5. Two to three `intermediate` skills gated on the beginners.
6. One `advanced` milestone or specialization.

Each node needs: unique `id`/`slug`, correct `hobbyId`, `tier`, `nodeType`, `xpReward`, `requires`, `orGroups` (usually `[]`), `completion.{prompt,evidenceMode,targetValue?,targetUnit?}`, `estimatedMinutes`, `isRequired`, `isSafetyCritical`, `isRecommended`, `status:'published'`, `contentVersion:1`, `sortOrder`, `tags` (from the existing set: Athletics, Creativity, Knowledge, Practical, Wellness — `lib/progression.ts` `stats()` depends on these), `category`, and `position.{x,y}` for the React Flow map. Keep positions in the same coordinate scale as existing hobbies (x roughly 0–900, y increasing by tier in steps of ~150).

Each node also needs a `content/lessons.ts` entry in the exact `rationale|step;step;step|common mistake` format, with **at least two steps** (`validate-content.ts` enforces it) and a distinct `whyItMatters` (the first segment) because the test asserts global distinctness.

Add to `lib/content.ts` for each hobby: one entry in the `quests` array (`id`, `hobbyId`, `title`, `description`, `target`, `unit`, `xp`, `requires` — point `requires` at that hobby's safety/gear nodes, `period:'week'`, `max:1`), and gear entries (5.2).

Add to `lib/quick-start.ts` a `firstQuests` entry per hobby: `{name, nodeId:'<prefix>-start', description, minutes, need:[…], action, safety, cost}`. Note `QuickHobby` is `keyof typeof firstQuests` — once all ten exist, consider typing it as the hobby id union instead so a missing entry is a type error.

### 5.2 Content accuracy rules

This app tells people how to start real physical activities. Apply the same standard as the existing content:

- Safety nodes come **before** practice nodes in `requires`, and `isSafetyCritical: true` on anything whose omission can hurt someone.
- No brand names, no "buy this model." Guidance is about function and fit.
- Every claim in a lesson should be something a reasonable coach/mentor would say. Where the existing content cites an authority (USTA, League of American Bicyclists, Red Cross), do the same for new hobbies — e.g. a public library association for reading, a national running body for load progression. Mark them `placeholder: true` exactly as the existing resources are if you are not confident in the specific URL, and list the ones you want Neo to verify in your final report rather than inventing links.

### 5.3 Everything that must be updated in the same commit

If Phase 0 was done correctly, this list is short. Verify each:

- `content/hobbies.json` — six new records, full field set from §3.1.
- `content/nodes.json`, `content/lessons.ts` — as above.
- `lib/content.ts` — `gear` entries and `quests` entries.
- `lib/quick-start.ts` — `firstQuests` entries.
- `components/entry.tsx` hobby picker — should already be fully data-driven; the grid needs a responsive pass at ten cards (it was designed for four). Two columns on mobile, three or four on desktop, and the picker gets its own scroll region rather than growing the window.
- `components/screens.tsx` → `HobbyTabs` — ten tabs will not fit in a row. Convert to a horizontally scrollable tab strip or a select on narrow viewports.
- `components/hobby-constellation.tsx` and the home scene — check the branch layout math for ten hobbies; it was authored for four.
- `pnpm seed:sql` — regenerate and commit `supabase/seed.sql`.

**Phase 2 acceptance:** `pnpm seed:validate` reports the new node and hobby counts with no cycles; `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e` pass; picker and tabs are usable at 375px wide.

---

## 6. Phase 3 — Honest startup cost

### 6.1 Gear item shape

Extend each entry in the `gear` array in `lib/content.ts`. The DB stores gear as `content jsonb`, so **no migration is needed**.

```ts
{
  id:'tennis-0', hobbyId:'tennis', name:'Racquet', necessity:'required',
  guidance:'Borrow or use what you have; fit and condition matter.',
  cost:{ low: 25, high: 80, currency:'USD' },   // typical used/entry-level range
  borrowable: true,                              // realistically borrowable or shared
  freeAlternative: 'Most clubs and many public courts lend racquets for a first session.',
  usedOk: true
}
```

Rules for the data:

- `cost` is a **range**, in whole USD, describing a reasonable entry-level or used purchase — not the cheapest thing that exists and not a good one. Where an item is genuinely free (a library card, paper you own), use `{low:0, high:0}`.
- `borrowable: true` only where borrowing is realistic and safe. A helmet is *not* borrowable in the casual sense — fit and crash history matter — so set `borrowable:false` and put the honest note in `guidance`.
- Add a single exported constant `export const pricesCheckedAt='2026-09';` in `lib/content.ts` and surface it in the UI as "estimates, checked Sept 2026". Do not present estimates as prices.

### 6.2 Derived hobby cost

Add to `lib/content.ts`:

```ts
export function startupCost(hobbyId:string){
  const required=gear.filter(g=>g.hobbyId===hobbyId&&g.necessity==='required');
  const low=required.reduce((a,g)=>a+(g.borrowable?0:g.cost.low),0);
  const high=required.reduce((a,g)=>a+g.cost.high,0);
  const borrowedPath=required.every(g=>g.borrowable||g.cost.high===0);
  return {low,high,borrowedPath,tier:low===0?'free':low<40?'low':low<150?'moderate':'higher'};
}
```

The key idea: **`low` is the cost if you borrow everything borrowable**, so a hobby that can be started for nothing shows `$0`. `high` is the buy-it-all-new ceiling. `borrowedPath` drives a distinct badge.

### 6.3 Where cost appears

- **Hobby picker card** (`components/entry.tsx`): a badge line under the description — `FREE TO TRY` / `$0–$40 · CAN BORROW` / `$60–$180 TO START`. Keep it one line; the card already carries an icon, name, and description.
- **Hobby detail / Loadout** (`components/screens.tsx` `LoadoutPage`): per-item cost range and the borrow note next to the existing `guidance`, plus a running total of what is still needed given the user's recorded statuses (Phase 5).
- Always accompany a number with the estimate disclaimer once per surface, not once per item.

Accessibility: these badges must not be color-only. Text carries the meaning; color is decoration. Follow the existing `.metadata` / `PageHeading` patterns and keep the axe checks in `tests/e2e/polish.spec.ts` green.

---

## 7. Phase 4 — Placement questionnaire

### 7.1 What it is and is not

After the user selects hobbies, they answer a short questionnaire **per selected hobby** (4–6 questions, skippable). The result is a self-reported experience level, 0–3, mapped to the existing `tiers` array (`start`, `beginner`, `intermediate`, `advanced`).

It **is**: a way to stop showing an experienced runner "what is a running shoe," and to set the recommended entry point in the tree.
It **is not**: a source of XP, a way to skip safety, or a graded test. There are no wrong answers and the UI must say so.

### 7.2 State and command

In `lib/domain.ts`:

```ts
// inside stateSchema
placements: z.record(z.string(), z.object({
  level: z.number().int().min(0).max(3),
  answers: z.record(z.string(), z.number().int().min(0).max(4)).default({}),
  skipped: z.boolean().default(false),
  at: z.string()
})).default({}),
```

```ts
// new member of commandSchema
z.object({ type:z.literal('placement'), hobbyId:z.enum(hobbyIds),
  answers:z.record(z.string(),z.number().int().min(0).max(4)), skipped:z.boolean().default(false) }),
```

In `applyCommand()`, the branch computes the level from the answers with the scorer below, writes `s.placements[c.hobbyId]`, and **awards nothing**. It is idempotent by overwrite: re-taking the quiz replaces the record.

`placements` lives in the snapshot only. `commit_progress` persists the whole snapshot to `progress_snapshots.state`, so there is nothing to do in SQL and no new projection table. Say so explicitly in the commit message so nobody goes looking for a missing migration.

### 7.3 Question content

Store questions as data, in a new `content/placement.ts`, keyed by hobby id:

```ts
export const placementQuestions: Record<string, {id:string; prompt:string; options:{label:string; score:number}[]}[]> = {
  running: [
    { id:'run-frequency', prompt:'How often have you run in the last month?',
      options:[{label:'Not at all',score:0},{label:'Once or twice',score:1},
               {label:'Most weeks',score:2},{label:'Several times a week',score:3}] },
    { id:'run-distance', prompt:'What is the furthest you have run comfortably, recently?',
      options:[{label:"Haven't tried",score:0},{label:'Around a mile',score:1},
               {label:'Three miles or so',score:2},{label:'Six miles or more',score:3}] },
    // …
  ],
  // …
};
```

Write 4–6 questions for each of the ten hobbies. Guidance for writing them:

- Ask about **recent, concrete behavior** ("how often in the last month", "furthest you've done comfortably"), not self-rating ("rate your skill 1–10"). Behavior is far better calibrated.
- One question per hobby should be about **equipment access**, because it feeds Phase 5 ("Do you already have a working bike?").
- One should be about **the last time they did it**, because a lapsed intermediate needs the refresher path, not the beginner path.
- Keep prompts under ~90 characters. No jargon a beginner would not know.
- Never ask about health conditions, injuries, weight, or age. If load or readiness matters (running especially), the safety *node* handles it with general guidance; the quiz does not collect it.

### 7.4 Scoring

```ts
export function scorePlacement(hobbyId:string, answers:Record<string,number>){
  const qs=placementQuestions[hobbyId]; if(!qs?.length) return 0;
  const max=qs.reduce((a,q)=>a+Math.max(...q.options.map(o=>o.score)),0);
  const got=qs.reduce((a,q)=>a+(answers[q.id]??0),0);
  const ratio=max?got/max:0;
  return ratio>=.75?3:ratio>=.45?2:ratio>=.2?1:0;  // start · beginner · intermediate · advanced
}
```

Unanswered questions score 0. Skipping entirely stores `{level:0, skipped:true}`, which behaves exactly like today's app.

### 7.5 What placement actually changes

**A. Recommendation ordering (required).** In `recommend()` in `lib/progression.ts`, the `rank()` function currently scores by pinned quest, in-progress, required, tier. Add a placement term so nodes at or just above the user's placement tier sort ahead of ones far below it — without ever hiding or locking anything:

```ts
const placed=(n:SkillNode)=>s.placements[n.hobbyId]?.level??0;
// inside rank(): add a small penalty for tiers well below the user's placement
const distance=Math.max(0,placed(n)-tiers.indexOf(n.tier));
```

Fold `distance` in as a tiebreaker *after* the existing required/recommended ordering, so safety and required nodes still come first. That ordering is the whole safety model; do not reorder around it.

**B. A visible "suggested start" marker (required).** In the tree view (`components/skills.tsx`, `components/skill-card.tsx`), mark the first available node at the placed tier as the suggested entry point. Everything below it stays visible and completable — an experienced person may still want the fundamentals, and they get XP for them.

**C. Fast-forwarding known basics (optional, only if A and B land cleanly).** If implemented, the rules are absolute: only nodes with `isSafetyCritical === false` **and** `nodeType === 'orientation'` or `'knowledge'`, only below the placed tier, they are recorded as `{status:'completed', evidence:{confirmed:true, note:'Recorded from placement', confidence:3}}`, and **no ledger entry is written**, so no XP and no achievement is triggered. Add `via:'placement'` to that progress record and show it in the UI as "marked from your check-in" rather than as a normal completion. If this cannot be done without touching `award()`, do not do it — ship A and B and put C in the follow-up notes.

### 7.6 Flow and UI

New step in `Setup` in `components/entry.tsx`, between hobby selection and finishing. The wizard becomes:

```
1. Character  →  2. Hobbies  →  3. Quick check-in (per hobby)  →  4. Start kit  →  Desktop
```

Update the `N / 2` counter in the titlebar to `N / 4` and keep BACK working across all four. `Setup` is already a large component; extract each step into its own file (`components/onboarding/character-step.tsx`, `hobby-step.tsx`, `placement-step.tsx`, `kit-step.tsx`) with a small `components/onboarding/wizard.tsx` holding the step state. Do this refactor as the first commit of Phase 4 so the feature diff stays readable.

Every step after character creation is skippable, with a visible skip control — the whole point is to reduce friction to starting. Skipping step 3 for one hobby should not force skipping it for the rest.

A "Retake check-in" entry point belongs on each hobby's page so the record can be updated as someone improves.

---

## 8. Phase 5 — Equipment triage and the start kit

### 8.1 Extend the gear status enum

Today: `'owned' | 'wishlist' | 'not_needed'`. The requested model is *have / want / still need*, which the current enum cannot express — `wishlist` conflates "nice someday" with "blocking my first session."

New enum in `lib/domain.ts` (both in `stateSchema.gear` and the `gear` command):

```ts
z.enum(['owned','borrowing','need','wishlist','not_needed'])
```

| Status | Meaning | Counts as ready? |
| --- | --- | --- |
| `owned` | Have it | yes |
| `borrowing` | Have access to it (borrowed, shared, club/library) | yes |
| `need` | Required and not yet obtained — blocks starting | no |
| `wishlist` | Wants it eventually, not blocking | no |
| `not_needed` | Explicitly declined | n/a |

`user_gear.status` is a `text` column with no check constraint, so **no migration is required**. Existing snapshots only contain the three old values, which remain valid members of the new enum — no data migration either. Update the `<select>` in `LoadoutPage` (`components/screens.tsx`) and the grouped sections there to the five statuses.

One existing behavior to preserve: `applyCommand`'s `ten-gear` guard requires `['tennis-0','tennis-1'].every(id => s.gear[id]==='owned')`. Change it to accept `owned` **or** `borrowing` (borrowing is the whole philosophy here) and generalize it so each hobby's `<prefix>-gear` node checks that hobby's required items rather than hard-coding tennis:

```ts
const required=gear.filter(g=>g.hobbyId===n.hobbyId&&g.necessity==='required');
if(n.id===`${hobbyById(n.hobbyId).prefix}-gear` && c.type==='complete'
   && !required.every(g=>['owned','borrowing'].includes(s.gear[g.id])))
  throw new Error('Record what you have or can borrow in Loadout first.');
```

### 8.2 The start-kit onboarding step

Step 4 of the wizard. For each selected hobby, list its **required** gear first, then recommended, then optional. Each row: name, guidance, cost range, borrow note, and a three-way control — **I have this / I can borrow this / I still need this** — plus a smaller "not needed" escape. Default every row to unset; do not pre-select.

Below the list, a live readiness summary per hobby:

- All required rows are `owned`/`borrowing` → **"You can start today."** Link straight to that hobby's `firstQuests` entry from `lib/quick-start.ts`.
- Otherwise → **"Two things to sort out first"**, listing the `need` items with their cost range, the total estimated spend, and, where `borrowable`, the borrow suggestion from `freeAlternative`.

This is the step that delivers the actual product promise, so the copy matters. Follow the existing voice in `LoadoutPage` and `quick-start.ts` — plain, warm, never pushy, borrowing always framed as a legitimate first-class choice rather than a lesser option.

### 8.3 Carrying it into the app

- **Loadout page**: shows the same readiness block per hobby plus the running "still needed" total.
- **Home scene**: if a user is enrolled in a hobby whose required gear is incomplete, the contextual `CONTINUE` action can point at the kit instead of a locked practice node. Keep this to the existing single contextual action — do not add a second competing call to action (see the character-centered homepage handoff, §2).
- **New achievement** (optional): "Kitted Out" — record every required item for one hobby as owned or borrowing. XP 25. If you add it, remember `earned` in `applyCommand` is positional against the `achievements` array.

---

## 9. Verification

Run the full gate after each phase, not just at the end:

```sh
pnpm seed:validate
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e     # pnpm exec playwright install chromium, first time
pnpm build
```

New automated coverage to add, by phase:

- **P0** — every node has a lesson; every hobby has ≥1 node, ≥1 required gear item, a quest, a `firstQuests` entry, and a `placementQuestions` entry (once P4 lands).
- **P1** — tint set/clear reducer tests; legacy-snapshot parse test extended with the new profile fields; `Avatar` tint render test; e2e skip path.
- **P2** — content counts derived rather than hard-coded; no duplicate node ids or prefixes; no cycles (already covered by `validate-content.ts`).
- **P3** — `startupCost` returns `$0 low` for a fully borrowable hobby and sums correctly otherwise; every gear item has a `cost` and a `borrowable` flag.
- **P4** — `scorePlacement` boundaries at each ratio threshold; placement writes no ledger entry and no achievement (assert `xpAwarded === 0` and `ledger.length` unchanged); `recommend()` respects placement without promoting a node above an unmet safety requirement.
- **P5** — `gear` command accepts all five statuses; old three-value snapshots still parse; the `<prefix>-gear` guard passes with `borrowing` and fails with `need`; readiness calculation.

Manual pass before reporting done: guest session at 375px and at desktop width, all the way through skip → ten-hobby picker → check-in → start kit → home, with reduced motion on and off.

---

## 10. Suggested commit sequence

1. `refactor(content): make hobby records self-describing` — Phase 0, no behavior change.
2. `feat(onboarding): skippable character creation with placeholder tint` — Phase 1.
3. `refactor(onboarding): split Setup into wizard steps` — the extraction from §7.6, still four-hobby.
4. `feat(content): add six hobbies with trees, lessons, gear and quests` — Phase 2.
5. `feat(gear): startup cost estimates and borrow guidance` — Phase 3.
6. `feat(onboarding): placement check-in per hobby` — Phase 4 (A and B).
7. `feat(gear): start-kit triage and readiness` — Phase 5.

Each commit leaves `main` green and shippable. If Phase 2's content volume is large, split it by hobby — three hobbies per commit is fine.

---

## 11. Decisions to confirm with Neo before or during the work

Do not block on these; pick the noted default, implement it, and flag it in your report.

1. **Fast-forwarding from placement (§7.5C).** Default: implement A and B only, and write C up as a follow-up.
2. **Cost figures.** Default: author conservative USD ranges from general knowledge, label everything as an estimate with `pricesCheckedAt`, and list in your final report every figure you would like Neo to sanity-check.
3. **Achievement rescoping (§3.3).** Default: three hobbies rather than all of them. It changes the meaning of two existing achievements for anyone who already earned them — they keep them, since achievements are only ever added.
4. **Quiz length.** Default: five questions per hobby, all skippable, one screen per hobby rather than one screen per question.
5. **Ten hobbies in the constellation.** Default: keep the existing radial layout and make it scroll/paginate rather than redesigning the home scene, which is out of scope for this handoff.

## 12. Report back with

A short summary of what shipped per phase, the test-suite output, any content URLs or price figures that need Neo's verification, screenshots of the four onboarding steps at mobile and desktop width, and anything you deliberately deferred with the reason.
