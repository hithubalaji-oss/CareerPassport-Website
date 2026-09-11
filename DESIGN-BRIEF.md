# Brief for Claude Design — bring the design files up to date with the shipped site

**Why this file exists.** Nothing flows from the repository back into Claude Design. The
project canvas is the source; exporting overwrites the repository's root `.html` files; the
shipped site in `src/` is then re-derived from those. So there is no sync to run — the only
way Claude Design learns about a fix made in code is for someone to make the same fix in the
design file. Until that happens, every export silently reverts it and it has to be re-applied
by hand.

This brief is that list. Each item is a change to make **in the Claude Design project**, with
the exact rule to change. After they are applied and the project is re-exported to GitHub,
`npm run check:deltas` will report each one as retirable and the two copies are back in step.

Ordered by what it costs you to leave broken.

---

## 1. The scroll driver forces four full page layouts every frame — this is the glitching

**Priority: highest. This is the only item on the list that users can see going wrong right now.**

On a phone the homepage does not merely stutter: glyphs draw halfway, gradients and background
textures blank out, CSS animations freeze mid-state. It looks like everything on the page is
failing at once, which is exactly what it is.

Measured on the shipped build at 390px / DPR 3 / 4× CPU throttle, over one full scroll of the
homepage, with the driver's `requestAnimationFrame` loop switched off and **nothing else changed**:

| | driver running | driver off |
|---|---|---|
| median frame | 50 ms | **26 ms** |
| slowest 5% of frames | 95 ms | **36 ms** |
| main thread blocked, total | 2023 ms | **0 ms** |

The driver accounts for *all* of the main-thread blocking. A CPU profile of the same scroll puts
43% of the time in `(program)` — layout, style recalculation and paint — and 20% in
`getBoundingClientRect` alone.

**The mechanism.** `frame()` interleaves reads and writes: it measures elements, writes styles,
then measures again. Every measurement that follows a style write cannot be answered from cached
layout — the browser must re-run layout for the whole 11,000px page, synchronously, before it can
return a number. That happens **four times per frame**. While the main thread sits inside a forced
layout the compositor receives no new tiles, so it draws whatever it already has: text drawn
halfway, blank bands, frozen animation.

**The fix: make `frame()` read once, then write.** All measurement at the top, all style writes
after, nothing measured in between. Two of the four sites are already handled in the shipped code
and can be copied straight across (see item 2). The other two are the work:

- **The crowd composition lock.** It writes `cbg.style.scale`, then reads
  `cbg.getBoundingClientRect()` to recover the plate's rendered width. It does not need to measure:
  it already knows the width it wrote and the scale it wrote, and the rendered width is their
  product. Restate `pw` in terms of those values.
- **The flow-node block.** Same shape — it writes `cover.style.setProperty('--tally', …)` and then
  reads `nod`/`cover` rects below it.

Please do this in Claude Design rather than in code. The composition constants (`REF_W`, `HERO_W`,
`FEET`, `LIFT`, `HDROP`) live here and the handoff notes they took real iteration to settle —
restating the maths around them is a design-side judgement, and doing it in code would make it a
sixth hand-carried divergence that has to be re-applied after every single export.

---

## 2. Fold geometry can be derived instead of measured

Two of the four forced layouts above are already gone in the shipped code. Worth copying back so
the design file starts from the same place.

`.fold` is `height:calc(var(--h) * 1vh)` and nothing writes a fold's style at runtime, so a fold's
box in **document** space only changes when the viewport does. Its box in **viewport** space is
then just that minus the scroll position, with no layout involved.

Measure the folds once, re-measure on `resize` / `orientationchange` / `load` / `fonts.ready`, and
derive `top` as `cachedTop - scrollY`. `#f4` and `#f5` should read from the same cache rather than
being queried by id and measured again. Layout reads per frame fall **31.9 → 18.8**.

Be aware of what this does and does not buy, so it is not mistaken for the cure: on its own it did
**not** improve frame time (median 49 → 47 ms, all inside run-to-run noise). Removing one read does
not remove a forced layout — the writes have already invalidated it, so whichever read comes next
pays the same bill. It only pays off once item 1 is done.

The working implementation is in `src/scripts/homepage.js` (`foldRects`, `foldIndex`).

---

## 3. `.wait input` needs `width:0` — the closing fold's text ran off the screen

Already fixed in the shipped site; still wrong in `index.html`, so it will come back on the next
export.

```css
/* index.html today */
.wait input{flex:1;min-width:0;height:auto;padding:0 10px;border:0;background:transparent;font-size:15px}

/* change to */
.wait input{flex:1;width:0;min-width:0;height:auto;padding:0 10px;border:0;background:transparent;font-size:15px}
```

**Why one word matters this much.** `min-width:0` lets the field shrink once it is *being handed*
a width. It does not change what the field **contributes when the browser asks `.wait` how narrow
it can be** — an `<input>` answers with its default 20-character intrinsic width, about 155px. Add
the button's un-shrinkable 177px plus gap and padding, and `.wait` answers **351px**.

`#outro` centres its children rather than stretching them, so `.ocopy` was sized to that 351px
answer instead of the 320px actually available on a 360px screen — and the heading, the lede, the
waitlist row and the fine print were all stretched to match and clipped by the viewport. On a phone
the heading lost its last word, the paragraph read "A professional identity read", the button hung
past the edge and the fine print ended on "to".

The tell that it was never responsive: `.ocopy` computed to `width:351.031px` at a 360px viewport
**and** at 390px. Identical, because the number never came from the viewport at all.

`width:0` drops the contribution to zero; `.wait` min-content falls **351px → 144px**. Nothing else
changes — same pill, same height, the field simply yields the width it was always meant to.

Worth checking the same pattern anywhere else a field and a button share a pill.

---

## 4. Four pieces of malformed CSS

Still present in the design files. They break a real CSS build outright, and one of them has
already cost a feature.

1. **`For Recruitment Partners.html` — three dangling `.swdeck,` fragments** (still there; one
   inside each of three `@media` blocks). A selector list ending in a comma with no `{` is the
   dangerous kind: the parser keeps consuming tokens looking for a brace, so the rules that follow
   can be swallowed into the prelude and silently lost. `.swdeck` appears nowhere in any markup.
2. **`For Recruitment Partners.html` — an orphan `}`** after the `@property` block, before `.net{`.
3. **`For Recruitment Partners.html` — an orphan `}`** where a `.foil` rule used to be, directly
   after the comment describing it.
4. **`index.html` — an orphan `}`** after `.cring text.cdia`.

All four are deletion scars: a rule was removed and part of its syntax left behind.

**Number 4 is next to where the passport seal lost its rotation — and that part is settled.**
On 8 Sep `.cring` carried `animation:cringspin 44s linear infinite` with a matching
`@keyframes cringspin{to{rotate:360deg}}`. The 10 Sep export dropped both and left the closing
brace behind.

**Stopping the rotation was deliberate — confirmed 11 Sep. Please do not restore it.** The seal
legend is static by design. The shipped homepage already matches, and carries a comment saying so
in case anyone reads the missing animation as a regression later.

The orphan `}` is still a syntax fix and still needs deleting. It is only adjacent to the
rotation, not the cause of it.

**And it applies to all three pages, at every width.** Decided 11 Sep. `For Companies.html` and
`For Recruitment Partners.html` still carry `animation:cringspin 44s linear infinite` on
`.cpface .cring` — three declarations between them, one inside a `prefers-reduced-motion` block —
plus a `@keyframes cringspin` in each file. **Delete all of them, and the keyframes with them.**
For Companies draws six seals on the page; every one of them was turning.

Delete rather than override: `@media (prefers-reduced-motion:reduce){.cpface .cring{animation:none}}`
in `For Companies.html` exists only to switch off an animation that should not be declared in the
first place, so it goes too.

The shipped site already has this (all three pages, desktop, mobile and reduced-motion, verified
by computed style). Until the design files match, every export brings the rotation back.

---

## 5. Declare the header's real height

`For Recruitment Partners.html` declares `--hdr:60px`. The header actually measures **69px** at
1440 and **76px** at 768 and 390 — so the declared value is 16px short exactly where it matters
most. `--hdr` feeds `scroll-margin-top` on `.artsec` and the hero's top padding, so an anchored
section sits partly underneath the header.

Declare the real height per breakpoint: **69px at desktop, 76px at the mobile breakpoints.**

(`For Companies.html` declares `83px` against the same 69px header — larger, so deliberately
roomier, and the shipped site leaves it alone. `index.html` declares nothing.)

The shipped site currently corrects this at runtime with a `ResizeObserver` that only ever raises
the value. Declaring it properly makes that guard a no-op and the two match pixel for pixel.

---

## 6. Mobile graphics-memory budget

The homepage asks a phone for roughly 115 MB of graphics memory as authored. Three changes, all
scoped to `innerWidth < 1025`, cut it to about 19 MB. They are in the shipped site and should move
here.

| | as authored | budgeted |
|---|---|---|
| 40 hero frames @ 515×955, retained as canvases | 75 MB | 9.4 MB (20 @ 258px) |
| Crowd plate 2528×1696, decoded | 16.4 MB | 4.2 MB (1280px copy) |
| `.paper` at 150% of viewport, `.rose` at 180% | 23.8 MB | ~8 MB (`inset:0`) |

1. `HV_N` 40 → 20 and the hero canvas width 515 → 258 on mobile. The hero is drawn small on a
   phone; the resolution is not missed.
2. Ship a 1280px crowd plate alongside the full one and pick by viewport. Still finer than a DPR-3
   phone resolves. Desktop keeps the full plate.
3. `.paper` and `.rose` back to `inset:0` on mobile. Their overscan exists only so the desktop
   driver can translate and rotate them without exposing an edge, and the sheet already stops
   animating them on mobile — so it is invisible there.

**Better than all three: ship a pre-keyed hero video with an alpha channel** (VP9 with alpha, or
HEVC with alpha). Then `bakeHeroFrames()` and its retained canvases disappear entirely, on every
device including desktop. The handoff recommended exactly this under *Known gaps*, item 7. If that
happens, item 6.1 becomes unnecessary.

Also: please keep asset paths **root-absolute** (`/uploads/…`, `/assets/…`). The 10 Sep export
reverted them to the authoring-environment `window.__resources` fallback, whose relative paths only
happened to work because the crowd is homepage-only.

---

## 7. Housekeeping — artboards deleted from the repository

These were removed from GitHub because no live page, artboard wrapper or shipped file referenced
them. **They still exist in the Claude Design project**, so the next export will bring them back:

- `Claim Field.html`
- `For Companies v1.html`
- `For Companies v2 - pinned folds.html`
- `For Companies v3.html`

If they are finished explorations, delete them from the canvas too. If any is still wanted, say so
and it stays.

Nine unused crowd and hero plates were removed from `assets/` on the same basis (`cowork-b.png`,
`cowork-hall.png`, `crowd-cp.jpg`, `crowd-hall.mp4`, `hero-arm.png`, `hero-body.png`, `hero-cp.png`,
`hero-hall-poster.jpg`, `hero-hall.mp4`) — referenced by nothing but the asset manifest and the
superseded variants above.

---

## Not a bug — please do not "fix" this

The letters that scramble and resolve on the "Better Opportunities / Better Conversations / Better
Reasons to be discovered" fold are that fold's own scramble-in animation working correctly. Caught
mid-flight in a screen recording it reads as corrupted text. It is not.

---

## What happens after these land

Export the project to GitHub as usual. Then in the repository:

```bash
npm run check:design    # the export is internally consistent
npm run check:deltas    # each fixed item now reports "can be retired"
```

Every item above has a matching entry in `LOCAL-DELTAS.md` (D1–D5) and a machine check that fails
if the fix is missing. As each one is fixed here, its entry gets deleted there and the design file
becomes the single source of truth for that behaviour again.
