# Character sprite template & animation spec

Draw over `character-template-104x150.png` (1×, import it as a reference layer and delete the guides).
`character-template-annotated.png` is the same thing enlarged with labels, for reading.

## Canvas

| | |
|---|---|
| Canvas | **104 × 150**, transparent PNG |
| Body bounds | **(6, 6) → (96, 146)**, i.e. 91 × 141 |
| Ground line | **Y = 131** |
| Centre | X = 52 |
| Head anchor | **(52, 48)** |
| Pelvis anchor | **(52, 88)** |
| Style | 1px dark outline, three-tone shading, no anti-aliasing |

Draw at 1×. The app upscales 2× with `image-rendering: pixelated`, so a half-pixel is not a thing.

> **Y = 131 is the standard for all new art** — draw the soles on it.
>
> The one exception is the legacy pack body (`/sprites/body/body_front.png`), whose soles sit at
> Y ≈ 137. The generated shoe sprites align to *that* body because they have to sit on the feet that
> exist today. When the 15 drawn frames land with soles on 131, the shoes move up with them (or get
> drawn into the frames directly) and the exception disappears.

## Frames

15 full-canvas frames, one PNG each, in `public/sprites/body/frames/` as `f01.png` … `f15.png`.

| # | Tag | Pose | ms | head | pelvis |
|---|---|---|---|---|---|
| 1 | idle | stand base *(reference pose)* | 200 | 52, 48 | 52, 88 |
| 2 | idle | inhale | 200 | 52, 46 | 52, 88 |
| 3 | idle | peak rest | 200 | 52, 46 | 52, 86 |
| 4 | idle | exhale | 200 | 52, 48 | 52, 88 |
| 5 | walk | contact | 120 | 52, 48 | 52, 88 |
| 6 | walk | recoil (lowest) | 120 | 52, 50 | 52, 90 |
| 7 | walk | passing | 120 | 52, 46 | 52, 86 |
| 8 | walk | contact (opposite) | 120 | 52, 48 | 52, 88 |
| 9 | walk | recoil (opposite) | 120 | 52, 50 | 52, 90 |
| 10 | walk | passing (opposite) | 120 | 52, 46 | 52, 86 |
| 11 | action | windup | 100 | 48, 48 | 48, 90 |
| 12 | action | hold / anticipation | 80 | 46, 46 | 46, 88 |
| 13 | action | impact / strike | 60 | 60, 52 | 58, 92 |
| 14 | action | follow-through | 120 | 58, 50 | 56, 90 |
| 15 | action | recovery | 150 | 52, 48 | 52, 88 |

## How anchors are used

Clothes and hats are drawn **once**, not fifteen times. Each frame's anchors are compared to
frame 1's, and every modular layer is translated by that delta:

- `head` → hair, headwear, face accessories
- `pelvis` → bottoms, held props
- `torso` → tops, outerwear, bags (the mean of the two deltas, since a shirt spans both)

So on frame 2 (inhale) the head anchor rises 2px and the pelvis does not: hair and hats lift, trousers
stay, shirts lift 1px. An item can override its anchor with `anchor:` in `lib/sprites.ts`.

The body frames themselves are already posed, so they are never offset.

## Turning animation on

`BODY_FRAMES` in `lib/sprites.ts` is empty, which keeps the single static body and the old CSS bob.
Fill it once the 15 PNGs exist:

```ts
export const BODY_FRAMES:readonly string[]=Array.from({length:15},(_,i)=>`/sprites/body/frames/f${String(i+1).padStart(2,'0')}.png`);
```

The runtime then advances frames on their own authored durations and the CSS bob switches itself off.
Verified working with placeholder frames on 2026-09-18: walking and idle each produced the expected
number of distinct composites, reduced motion froze to frame 1, and clearing it resumed.

An individual item can also carry its own frame array (`layers[].frames`), for a prop that animates
independently. A layer drawn on the full 104 × 150 canvas sets `full: true` and needs no x/y offset,
and a layer can override its item's `z` (the backpack does this: pack behind the body, straps in front).

## Earned cosmetics

The skill tree awards 19 cosmetics that predate the pack. `spriteAliases` in `lib/sprites.ts` maps each
one onto the nearest existing art so an unlock is always visible — held tools to the wrench, carried
items to the backpack, the three companion effects to their own generated sprites. Replacing any of
them is a one-line change: draw the real thing, add it to `spriteItems`, repoint the alias.

Sprites marked `hidden: true` exist only as alias art and are never equippable on their own.

## Generated, not drawn

These were produced by script (`image-rendering: pixelated`, pack palette) because the pack has no
equivalent, and are the first candidates for replacement with hand-drawn art:
`backpack_straps`, `shoe_cream`, `shoe_brown`, `shoe_navy`, `companion_ball`, `companion_droplets`,
`companion_pages`.

The pack's two **sleeve sets** are still unused: their arm pieces are drawn at a noticeably larger
scale than `body_front`, so they land on the chest rather than the arms. They need redrawing on this
template rather than offset tuning.
