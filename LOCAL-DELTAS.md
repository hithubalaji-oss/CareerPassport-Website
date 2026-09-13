# Local deltas

Changes that live **only in `src/`** and have no counterpart in the Claude Design files
at the repository root.

## Why this file exists

The project has two sources of truth:

- **Claude Design** owns the design. Exporting from it overwrites the root `.html` files
  and their shared `cp-*.css` / `cp-*.js`.
- **`src/`** is derived from those — the page CSS and scroll drivers are carried over
  byte-for-byte, and the section markup is sliced from source programmatically.

So the normal import is *destructive to anything tuned in code*: re-deriving `src/` from a
fresh export silently reverts it. Every such change is registered below, and
`npm run check:deltas` proves each one is still present.

## The loop after a design import

```bash
npm run check:design    # the export is internally consistent
npm run check:deltas    # which deltas survived the re-derivation
```

Anything reported MISSING was reverted by the import and must be re-applied from its
"How to re-apply" note before pushing. Re-run until clean, then build and verify.

A delta should not live here forever. Each one is a small divergence that has to be
carried by hand, so the moment a change can be made in Claude Design instead, make it
there and delete the entry.

---

## D1 — Root-absolute asset paths

| | |
|---|---|
| **File** | `src/scripts/homepage.js` |
| **Source** | `index.html` writes them relative |
| **Status** | Active, and expected to stay that way — see below |

**What.** The crowd plate and hero video are referenced as `/uploads/…` and `/assets/…`
rather than `uploads/…` and `assets/…`.

**Why it cannot be fixed upstream.** This is the one delta that is *correct* in both places
and still has to differ. The Claude Design canvas serves the project from a sub-path, so
root-absolute paths break its preview — which is the thing the design file exists to be.
The shipped site is served from the domain root and its three pages live at `/`,
`/for-companies` and `/for-recruitment-partners`, so a relative path resolves differently
depending on the route. Both are right for their own environment.

Claude Design raised exactly this when the change was requested and recommended keeping the
design file relative and rewriting on the way in. That is what happens here.

**How to re-apply.** After extracting the driver, prefix the two literals in the
`CROWD_SRC` / `LIFT_SRC` block with `/`. Nothing else changes. The `window.__resources`
fallbacks are left alone — the shipped site never defines that object, so only the literals
load.

**Retire this entry** only if the site ever moves to a sub-path itself, or if Claude Design
gains a way to declare a deploy-time base. Neither is likely; this one is permanent.

---

## D2 — A pre-keyed hero, so the phone never runs the chroma-key

| | |
|---|---|
| **Files** | `src/scripts/homepage.js`, `public/assets/hero-lift-alpha.webm` |
| **Source** | `index.html` keys the green screen at runtime |
| **Status** | Active — the design's own handoff asked for this (*Known gaps*, item 7) |

**The blind spot this closes.** Every performance measurement taken in this repository before
now excluded the single most expensive thing the page does, because headless Chromium cannot
decode H.264 — so `bakeHeroFrames()` never ran in any test here. It runs on every real phone.
Re-encoding the source to VP9 purely so the test browser could execute that path, at 4x CPU
throttle:

| | |
|---|---|
| wall clock to bake 20 frames | 3,230 ms |
| **main thread blocked** | **802–1,369 ms** |
| worst single freeze | 94–117 ms |

For scale, the entire rest of the page's scroll blocking measured 719 ms. This one operation
was the larger half of the problem, it lands in the first seconds of a visit, and it had never
appeared in a single measurement.

**What it was doing.** Twenty times over: seek the video, draw a frame, call `getImageData`
(a synchronous GPU→CPU readback, among the slowest operations available on a phone), walk
~123,000 pixels in JavaScript to strip the green screen, upload the result back.

**What replaced it.** `hero-lift-alpha.webm` is that same key applied **once, at build time**,
by ffmpeg — a literal port of `keyGreen()`: green excess over `max(r,b)`, the same 34 and 4
thresholds, the same `1.5x` spill correction, pre-cropped to the `HV_SX/SY/SW/SH` window.
The bake then reduces to `drawImage` alone.

**Measured, same conditions:** `getImageData` 20 calls / 169 ms → **1 call / 0 ms** (the
verification probe below), main thread blocked at load **1,369 ms → 51 ms**. Verified visually:
the figure composites into the crowd with no green fringe and no black block.

**It fails safe, twice.**

1. `canPlayType('video/webm; codecs="vp09.00.10.08"')` gates the swap, so a browser that
   cannot play VP9 keeps the original `.mp4` and the original bake. Both files ship; a visitor
   fetches exactly one.
2. Some browsers decode VP9 in WebM but ignore its alpha side-channel, which would paint the
   figure on a black block rather than failing outright. So the first baked frame samples four
   corner pixels; a fully opaque corner means no alpha, and the driver swaps `src` back to the
   `.mp4` and re-bakes. Costs one `getImageData` of 4 pixels, once.

**How to re-apply.** After extracting the driver: add `LIFT_ALPHA_SRC` and the `hvAlpha`
capability check beside `LIFT_SRC`; point the injected `<video>` at it when `hvAlpha`; branch
`onSeeked` so the alpha path draws the full frame and skips `keyGreen`, keeping the corner
probe; and clear `hvFrames` in the `loadedmetadata` handler so a source swap re-bakes cleanly.

**Retire this entry** by making the pre-keyed video the design's own hero source, which is what
the handoff recommended in the first place. Then `keyGreen`, `bakeHeroFrames` and the twenty
retained canvases can all be deleted outright, on every device.

**Regenerating the asset**, if the hero footage ever changes:

```bash
KEY="format=rgba,geq=r='r(X,Y)':g='if(gt(g(X,Y)-max(r(X,Y),b(X,Y)),4),max(0,g(X,Y)-(g(X,Y)-max(r(X,Y),b(X,Y)))*1.5),g(X,Y))':b='b(X,Y)':a='if(gt(g(X,Y)-max(r(X,Y),b(X,Y)),34),0,if(gt(g(X,Y)-max(r(X,Y),b(X,Y)),4),255*(1-(g(X,Y)-max(r(X,Y),b(X,Y))-4)/30),255))'"
ffmpeg -i hero-lift.mp4 -vf "crop=515:955:180:125,${KEY},scale=515:-2,format=yuva420p" \
  -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 700k -auto-alt-ref 0 -an hero-lift-alpha.webm
```

`-auto-alt-ref 0` is required: VP9 alt-ref frames and the alpha side-channel are incompatible,
and without it the alpha is silently dropped.

---

## D3 — Per-frame animation writes direct properties, not custom properties

| | |
|---|---|
| **File** | `src/scripts/homepage.js` |
| **Source** | `index.html` animates via `style.setProperty('--x', …)` |
| **Status** | Active — belongs upstream; it is a mechanical change with a visible payoff |

**What was wrong.** The driver animated eleven values per frame by writing CSS **custom
properties**. A custom property inherits, so Chrome must re-resolve style for the element it
is set on **and every descendant** — it cannot know which of them reads it. Measured over one
scroll at 412x915 / DPR 3.5 (a Samsung S23 Ultra in Chrome, the device this was reported on):

| writes | x descendants | = element style resolutions | property | on |
|---|---|---|---|---|
| 478 | 424 | **203,150** | `--stageOp` | `#stage` |
| 478 | 259 | **124,280** | `--s` | `#bookwrap` |
| 478 | 81 | 39,196 | `--tally` | `#cover` |
| 2,868 | 6 | 20,076 | `--o` | `.st` |
| 478 | 26 | 12,906 | `--cbgTop` | `#crowd` |
| | | **415,564 total** | | |

`--stageOp` is read by exactly one rule — `.stage{opacity:var(--stageOp,1)}`, the element's
own opacity. It was re-resolving style for 424 elements, 478 times, to set one opacity.

**Why this was the thing that mattered.** Style recalculation measured **372 ms** per scroll
against 44 ms of layout and 85 ms of script. It was four times the script cost and eight
times layout — and every previous round of work here targeted script or layout. That is why
nothing a reader could see ever changed.

**The fix.** Every one of these is now the element's **own** property, set on the element that
reads it: `--stageOp` -> `stage.style.opacity`, `--s` -> `wrap.style.scale`, `--o` ->
`el.style.opacity`, `--clo`, `--vo`, `--vop`, `--sop` likewise; `--hw`/`--hbot` ->
`hero.style.width`/`bottom`; and the two consumed by a descendant move **down** to that
descendant — `--cbgTop` -> `cbg.style.marginTop`, `--tally` -> `.ctally`'s own opacity.
`--rise` was written 478 times per scroll and is read by no rule in any stylesheet; dropped.

Opacity and scale are compositor properties, so those writes no longer touch style at all.

**Measured, median of four runs:** style recalculation **372 ms -> 118 ms**. The recalc *count*
is unchanged (1,015 vs 1,020) — each one now touches a fraction of the elements, which is
exactly the mechanism.

**It also fixed a visible bug.** The passport's seal legend was rendering as garbled
overlapping fragments instead of "SEAL OF TRUST / EVIDENCE OF YOUR CLAIMS". Invalidating
`#bookwrap`'s 259-element subtree hundreds of times per scroll was corrupting the SVG
`textPath` layout. With the subtree left alone it renders correctly. Verified by screenshot,
against a same-build control run to separate it from the time-based breathing animation.

**How to re-apply.** Replace each `setProperty('--x', v)` in the frame loop with the
equivalent direct property on the element that consumes it. The full mapping is above; no
stylesheet changes are needed, because an inline property beats the `var()` rule it replaces
and no media query overrides any of them (checked).

**Retire this entry** by making the same change in the design file. Nothing about it is
implementation-specific — the design prototype pays exactly the same cost in a browser.

---

## D3b — The driver's startup frame is guarded

| | |
|---|---|
| **File** | `src/scripts/homepage.js` — one line |
| **Source** | `index.html` kicks the loop off unconditionally |
| **Status** | Active, and deliberately tiny |

**What.** `requestAnimationFrame(frame)` at the end of the driver becomes
`if(!window.__cpManual) requestAnimationFrame(frame);`.

**Why.** The mobile rebuild replaces the scroll-driven animation with six CSS states below
1025px, and switches the desktop driver off by setting `window.__cpManual` during head
parsing. The driver's own loop already checks that flag on every iteration — but not on the
initial kick. Left unguarded it runs exactly one frame on a phone, and that one frame writes
inline `translate` / `scale` / `opacity` onto `.bookwrap` and `.zone`, which outrank the
mobile stylesheet and pin the passport in one place for the whole visit. Measured: it was
the reason the first build of the mobile layer appeared to do nothing at all.

**Everything else the rebuild needs is additive** and carries no delta:
`src/styles/mobile-passport.css`, `src/scripts/mobile-passport.js`, and the imports plus the
head script in `src/pages/index.astro`. The re-derivation only rewrites `homepage.css` and
`homepage.js` from `index.html`'s own blocks; it never touches a file that does not exist in
the design, and it never touches `index.astro`. So a design export cannot revert the mobile
behaviour — only this one line.

**How to re-apply.** Add the guard to the final `requestAnimationFrame(frame);` in the
extracted driver. Nothing else.

**Retire this entry** by making the same guard in the design file, which costs desktop
nothing — `__cpManual` is undefined there, so the driver starts exactly as it does today.

---

## D3c — The mobile passport state machine, and the measured art band

**Files:** `src/styles/mobile-passport.css`, `src/scripts/mobile-passport.js`,
`src/pages/index.astro` (three lines: two imports and the `__cpManual` flag)

Additive. The design file has no mobile layer of its own, so nothing in an export can revert
this — but nothing in an export produces it either, and the page is broken on a phone without
it. The one line that CAN be reverted is `index.astro`'s inline flag, which is why the check
asserts that specifically.

**What it replaces.** The scroll driver animates the passport from `requestAnimationFrame`,
reading layout and writing styles several times per frame. On a phone that cost 825ms of style
recalculation and 207ms of layout over one scroll, and blocked the main thread for two seconds.
The mobile layer switches the driver off below 1025px and drives the same choreography from
seven CSS states, changed by one IntersectionObserver — six attribute writes for the whole page.

**The art band, added 11 Sep, is the part worth reading.** Before it, the copy column and the
passport were positioned by two systems that could not see each other: the column is fixed,
anchored to the viewport bottom, and sizes itself to its own text; the passport was placed by a
hand-tuned scale and offset per fold. The gap between them was therefore an accident. Measured
across six viewports, fold 4 sat 46px clear at 412x915 and overlapped its own headline by 68px
at 360x640 — the same code producing four different compositions, which is exactly what was
reported from two phones side by side.

`measure()` now takes the band between the header (or fold 1's eyebrow) and wherever the copy
actually ended up, and publishes it as custom properties. Every piece of art — passport, crowd
plate, callout layer, flow chart, closing ring — is then expressed as a fraction of that band
rather than as an absolute size. Four layout reads per state change, seven state changes per
visit.

---

## D3d — The driver exposes two hooks to the mobile layer

**File:** `src/scripts/homepage.js` — `window.__cpBuildOnce`, `window.__cpPlaceClaims`

Two one-line exports. Both exist because the mobile layer replaced the rAF loop that used to
call them internally, and neither has any effect on desktop.

- `__cpBuildOnce` builds fold 4's flow chart. The driver did it on its first frame; without the
  call the Companion flow simply does not exist on a phone.
- `__cpPlaceClaims` re-places fold 2's callout cards. `place()` clamps each card's lane using
  the callout layer's own `offsetWidth`/`offsetLeft`, and at parse time on mobile that layer
  has no box yet — it is sized from the measured art band. Without the call the first placement
  a reader can see puts a card about 7,000px off screen until the 2.5s refresh corrects it.

---

## D6 — No hero video on a phone, and the crowd plate does not go first

**Files:** `src/scripts/homepage.js` (the `<video>` element and its `loadedmetadata` guard),
`src/pages/index.astro` (two preload hints)

Three changes, all about what a phone downloads before it can paint. Measured on a simulated
mid-range phone — 1.6 Mbps, 150ms RTT, 4x CPU throttle:

| | before | after |
|---|---|---|
| first paint | 1,480 ms | **1,110 ms** |
| load event | 5,338 ms | **1,753 ms** |
| transferred | 299 KB | 277 KB |

1. **The hero video is not emitted at all below 1025px.** The mobile layer hides `.heroFig` —
   there is no hero figure in the mobile composition — but a `display:none` `<video
   preload="auto">` still downloads in full, and it was the whole of the 3.6s between
   DOMContentLoaded and the load event. `heroVideo` is therefore null on mobile, so the
   top-level `loadedmetadata` listener is guarded; everything else that touches it lives
   inside the driver, which does not run there.
2. **Its preload hint is `media="(min-width: 1025px)"`**, for the same reason.
3. **The crowd plate's preload is `fetchpriority="low"`.** It is 227 KB of a 277 KB page — 82%
   of everything the browser downloads — and the reader does not see it until fold 2, several
   screens down. At default priority it competed with the stylesheet for the pipe. Low still
   fetches it immediately, so it is warm long before fold 2; it just stops it going first.

Nothing here can be reverted by an export in a way the check would miss, because the marker is
the `window.__cpManual` guard in the emitted markup — an export restores the unconditional
`<video>` and the check fails.

---

## D5 — Eyebrows removed from every fold but two

**Files:** thirteen deletions across `src/components/**`, plus one rule in
`src/styles/local-overrides.css`

Removed on request, 11 Sep, from every fold on all three pages and on both viewports. Two are
kept: **"Tell us who you need"** (For Companies hero, both viewports) and **"Built on real
experiences"** (homepage hero, *mobile only*).

Thirteen are gone from the markup outright. The fourteenth is the homepage hero's, which has to
survive on one side of the breakpoint and not the other, so it is a rule rather than a deletion
— and it is the reason `local-overrides.css` exists at all: it is a desktop-side rule, and
`mobile-passport.css`'s entire contract is that nothing in it applies above 1024px.

The design file still carries all fifteen, so every export brings them back and the deletions
have to be re-applied by hand until Claude Design removes them from the canvas. The check's
`reverted` signal watches for "The problem" returning to `index.html`.

---

## D7 — For Companies: the two pinned sections can be shortened and driven by a clock

**Files:** four hooks in `src/scripts/companies.js`, plus `src/scripts/mobile-pages.js`,
`src/styles/mobile-pages.css` and one inline script in `src/pages/for-companies.astro`

For Companies ran to **26-27 screens** of scroll on a phone. Two sections account for 21.7 of
them: the hero pins for `420svh` while the brief types itself, and the process demo pins for
`1750svh` while thirteen acts play out. Both are scroll-linked, so on that page the length *is*
the animation — shortening one loses the other. On a phone the length comes down and the clock
changes hands, which is what the homepage's fold 4 already does with its Companion loop.

Both drivers in `companies.js` are pure functions of a single progress scalar, so the delta on
that side is only a way in — **two lines per section**:

```js
var setH=function(){ sec.style.height=((window.__cpSVH&&window.__cpSVH.hero)||SVH)+'svh' };
if(window.__cpAutoQ!=null) q=window.__cpAutoQ;     /* hero */
if(window.__cpAutoG!=null) g=window.__cpAutoG;     /* demo */
window.__cpHeroFrame=frame;  window.__cpDemoFrame=frame;
```

With nothing published, every expression falls through to the authored value, which is why
desktop is untouched: `__cpSVH` unset, `__cpAutoQ`/`__cpAutoG` undefined, both sections at
`420svh` and `1750svh`. Verified at 1440x900 and 1280x800 on all three pages — document
heights byte-identical to `main`, and Partners (the one page with no live animation) renders
**0.000%** different. Everything else lives in `mobile-pages.js`, which the export never
touches.

Result, with the rest of the mobile pass: **27.0 -> 8.9 screens** at 360x640, 26.0 -> 7.9 at
390x844, 25.8 -> 7.7 at 412x915, against the homepage's 8.6-8.7.

Three things worth knowing before touching this:

**`__cpSVH` is declared inline in the page, not in `mobile-pages.js`.** Astro bundles a page's
module scripts together and orders them by its own import graph rather than by tag order.
Verified: `companies.js` landed **first** in the bundle, so it had already sized both sections
before `mobile-pages.js` could publish anything — the page stayed 26 screens long while every
other part of the override worked, which is a quiet enough failure to be worth the sentence.
An inline `is:inline` script runs where it is written. Same pattern as `window.__cpManual`.

**The demo plays forward once per entry and holds.** It does not loop. The demo is a narrative
that ends on the offer being sent; looping a twenty-second story back to its first frame reads
as a glitch rather than as life. Scrolling away and back replays it.

**The panel is measured, not guessed.** `.aibox.big` is authored
`min(clamp(452px,63vh,572px), 100svh - hdr)`. On a 640px-high phone the 452px floor beats the
403px that 63vh would give, and the panel plus its text column came to 687px inside 557px of
pinned space — cropped, not shown, because `.aidemopin` is `overflow:hidden`. Measured at
360x640 the panel's bottom edge landed 65px below the fold. `--ai-h` is the space the text
column actually left, measured the way the homepage measures its art band. The CSS fallback is
the authored expression with the floor removed, so the panel still fits if the script never
runs.

The design file carries the unhooked forms, so every export reverts this. The check's
`reverted` signal watches for `sec.style.height=SVH_TOTAL+'svh'` returning.

---

## D8 — For Companies: the content edits, and the four-fold demo's hooks

**Files:** four hooks in `src/scripts/companies.js`, markup in `Hero.astro`, `ProcessDemo.astro`,
`Comparison.astro`, `Header.astro` and `Footer.astro`, plus `src/scripts/mobile-pages.js`

### The content edits

Asked for on the canvas' terms, so all of them are reverted by the next export.

| | |
|---|---|
| The Companion pill | removed from the hero composer, **both viewports** |
| `Accept blueprint` | now **`Design the journey`**, both viewports |
| The evaluation matrix | nine single-title cells — Reasoning, Prioritization, Judgment, Expertise, Execution, Initiative, Communication, Collaboration, Alignment — both viewports |
| The footer CTA | now **`Sign up`** |
| The drawer | lists home as well as the two interior pages |

**The pill could not simply be deleted.** `companies.js` called
`pill.classList.toggle('hot',done)` unguarded, so removing the markup threw and took the whole
hero driver — the typing, the send, the cursor — with it. The line is now guarded, which also
means an export that brings the pill back works unchanged rather than breaking. The check
watches for `class="aipill"` returning to `Hero.astro` through the new `deleted` list, since
what is being asserted is an absence and `reverted` only reads the delta's own file.

The matrix cells each had a `<b>` title over an `<em>` method ("Multiple choice", "Rank
order"); at phone widths the two lines overlapped each other and the cell below. The driver
reads cells by their `data-m` index and never touched the `<em>`, so dropping it is safe.

### The four hooks

The demo is four scroll folds on a phone rather than one timed carousel, the cursor is
narrowed to three deliberate clicks, and the passport is fitted to its own pane. All of it
lives in `mobile-pages.js`; `companies.js` gains only the way in.

```js
if(pill) pill.classList.toggle('hot',done);          /* the guard */
window.__cpBookPane=function(on){ ... }               /* fit the pane, not its parent */
if(window.__cpCursorOn) curOn2=!!window.__cpCursorOn(g,p);
var aim=window.__cpCursorAim; if(aim){ ... }          /* one target per act */
```

Every one falls through to the authored behaviour when nothing is published, which is what
keeps desktop identical — verified below.

**`__cpBookPane` exists because of a real bug.** `sizeBook` fits the passport to `dcStage`, the
pane's *parent*, and a ResizeObserver watches that same parent. Past `g=.988` the pane itself
narrows — the sent-confirmation takes room beside it — while the parent does not, so no
callback fires and the book keeps a scale computed for a wider box. Measured at 390x844: the
pane went from 351px to 220px and the book held a 314px spread, hanging 95px past the panel's
left edge. Fitting the pane is correct in both cases but would re-scale the desktop book, so
the mobile layer asks for it. After: 0px past the panel at 360, 390 and 412.

**The cursor hooks exist because the desktop choreography does not survive the scale change.**
On desktop the pointer crosses the panel to hover a chip, then the slider, then a matrix cell,
then the submit — a person working through a form, eleven distinct positions across the act. At
phone scale those targets are millimetres apart and the same path reads as skittering. On a
phone it does one thing per act: arrives, presses the one button that matters, leaves. Three
moments in the section — Design the journey, the evidence, the invite.

### The stacked comparison

Three columns on a phone, not four, and each cell has a short form carried in an inert
`data-m` attribute. Four paragraphs per capability, six times over, stopped reading as a
comparison. CV screening is the column dropped. The desktop table is untouched and still
carries all four columns, 24 cells and its full sentences.

### What desktop was checked against

Not pixels — the animated pages diff ~1.7% against themselves. Behaviour, compared to
`origin/main` at 1440x900:

```
hero 420svh · demo 1750svh · __cpSVH unset · __cpAutoG undefined
cursor hooks undefined · --pps 0.5710 · table 4 columns · burger none
11 distinct cursor positions across the act   ← identical on both
```

Document heights byte-identical on all three pages at 1440x900 and 1280x800.

---

## D9 — For Companies: the cursor's origin, the frozen book scale, the comparison grid

**Files:** three changes in `src/scripts/companies.js`, plus `Comparison.astro`, `Header.astro`,
`mobile-pages.css` and `mobile-pages.js`

### The cursor was pointing 212px above whatever it was clicking

`park()` resolved a target into coordinates measured against `#aiStage` and wrote them to
`.hmcur`, which is `position:absolute` — so the browser resolves them against its **offset
parent**, and that is `.aiwrap`.

On desktop the two share a top-left corner (both at 100,208 at 1440x900), because the wrap is a
two-column grid whose visual column starts at its origin. The error is 0,0 and nothing has ever
looked wrong. On a phone `.aitextcol` takes `order:-1`, the copy stacks above the panel, and the
wrap begins 212px higher than the stage — so every target was drawn 212px above the thing it
pointed at. Measured at 390x844 before: cursor tip y=581, submit centre y=792. After: 309,793
against 307,792.

```js
var origin=cur.offsetParent||stage;     /* not stage */
var s=origin.getBoundingClientRect();
cur.classList.toggle('left',tx>origin.offsetWidth*0.55);
function offstage(){ var o=cur.offsetParent||stage; return {x:o.offsetWidth+150, …}; }
```

**One desktop-visible consequence was checked and is nil.** The `.left` flip threshold now uses
the wrap's width (1240) rather than the stage's (629), so `.left` stops toggling on desktop —
and the ONLY rule in any stylesheet that consumes `.hmcur.left` is inside
`@media (max-width:1024px)`. The class is inert there, so the change cannot render.

### The passport shrank to 58% of itself while it was opening

`.dcsent.on` is `flex:0 0 42%` in a flex row with `.dcpp`, so the moment the invite lands the
passport's pane goes from 312px to 181px — and `sizeBook` re-fits the book to it. Measured:
`--pps` stepping 0.314 to 0.182 **mid-animation**, which is the visible size step this project
already learned about once on the homepage.

Fixed twice over, because it is the kind of thing that comes back: the confirmation is an
overlay on mobile so it takes neither width nor height from the pane, and `window.__cpBookFreeze`
holds the scale for the act. `--pps` is now constant through act 4 at every size.

### The act rested on its own aftermath

Act 1's clock is `p = g/.43` and its last fifth is what happens AFTER the blueprint — recede at
p=.900, "trip finalised" .912, "launched" .940. Played to g=.452 the act ended at p=1.05, so a
reader who came to watch the blueprint being drafted was left with an empty panel and the form
ghosted at 28% behind a confirmation. `ACT[0]` now ends at `.385` — p=.895, just past the press.

### The panel moved 47px between acts

The act copy is 190 / 218 / 190 / 263px tall for the four acts, and the panel sits under it.
`.aitextcol{min-height:268px}` reserves the tallest, so the panel's top is constant at 368px and
Decide no longer runs 23px past the fold and cuts off its own buttons.

### The comparison is a grid

Three columns, seven bands, every cell two or three words, built by the same generator. 723px
against 1654px. The desktop table is untouched: four columns, 24 cells, full sentences, verified
at 1440x900.

### Also here

`#exTicker` is an ID rule — `font-size:12px; white-space:nowrap; overflow:visible`, with a
comment saying it must never crop — so the class-level fix did nothing and it had to be matched
at the same specificity. The cursor's label moved above the pointer, since every target it gets
on a phone is a button at the bottom of the panel. The drawer dropped "Get started" and
"Evidence, not CVs" and swapped its two button styles. And `--hdr` is 76px on mobile, the bar's
real height, rather than the desktop 83px it was inheriting.

### What desktop was checked against

Behaviour, against `origin/main` at 1440x900 — identical on every reading:

```
hero 420svh · demo 1750svh · __cpSVH unset · __cpAutoG undefined · cursor hooks undefined
--hdr 83px · hero padding-top 0px · .aitextcol min-height auto · --pps 0.5710
flapbg flex · actdots flex · #exTicker 12px · table 4col/24cells · .cmp block / .cmpm none
```

Document heights byte-identical on all three pages at 1440x900 and 1280x800, and the pixel diff
sits inside the band the control (baseline against itself) establishes.

---

## D10 — For Companies: the desktop layer

**Files:** three hooks in `src/scripts/companies.js`, plus the new
`src/scripts/companies-desktop.js`, `ProcessDemo.astro`, `local-overrides.css` and the page's
own inline script

**The standing rule flips for this page.** "Mobile only, desktop untouched" held for every pass
up to this one; these desktop behaviours were asked for. What is still proven is that nothing
ELSE moved — see the readings below.

### What changed

**The hero's brief writes itself.** The whole animation is one scalar mapped straight from
scroll, so every beat of the sentence being typed was a slice of scroll distance. `q` now runs
0 → .62 on a timer as soon as the page is up, and the scroll is remapped into `.62 → 1`, so it
can only carry the manager arriving, pressing send and leaving. Scrolling cannot un-type the
sentence.

The manager's window moved with it. Authored it opens at `q=.52` — before the words finish at
`.60` — so with the typing on its own clock he would have been standing there on arrival. He
appears at `.655`, presses at `.72–.80`, and is gone by `.815`. Past the press `__cpHeroAim`
returns `null` and he walks off-stage rather than blinking out, because the glide keeps running.

**Fold 2 is five stops, not a 1750svh scrub.**

| | |
|---|---|
| 1 | DESIGN — the form assembles and the manager modifies the selection (`G0 → .363`, p=.845) |
| 2 | DESIGN — the click and what follows (`.363 → .4515`) |
| 3 | EXECUTE — the whole graph at once (`.452 → .6515`) |
| 4 | EVIDENCE — straight to "See candidate" and press (`.652 → .8515`) |
| 5 | DECIDE — the record opened, the invite sent (`.852 → 1`) |

**The section had to come down with them**, and this is the one thing not literally asked for.
Five stops inside 1750svh is three and a half screens between events, which is worse than the
scrub it replaces. 620svh desktop, and the hero 200svh since it now carries one event. Both
numbers are in the page's inline `__cpSVH`, which branches by viewport.

**The four act dots became one bar**, the Partners story band's treatment verbatim. Desktop
only: on a phone the acts are four scroll folds and the scrollbar already says where you are.

### The three hooks

```js
if(window.__cpHeroCursorOn) on=!!window.__cpHeroCursorOn(q);
var aim = window.__cpHeroAim ? window.__cpHeroAim(q) : undefined;   /* null = off-stage */
if(actBar){ …actBar.style.setProperty('--sp',sp); }                  /* written on change only */
```

### One thing worth knowing

`local-overrides.css` was imported by the HOMEPAGE ONLY. Its contract is "code-side decisions
that are not mobile-only", and For Companies had no such file at all — `companies.css` is
design-derived and `mobile-pages.css` is mobile by construction, so a both-viewports decision
for that page had nowhere to live. It is loaded there now. Nothing already in it can reach the
page: the eyebrow rule is scoped to `#f1` and the fold-4 type rules to `.fbot` / `.frl`.

### What was proven not to move

| | doc height | pixels vs control |
|---|---|---|
| Partners desktop | identical | 0.013–0.023% against a 0.000–0.017% control |
| Partners mobile | identical | 0.039–0.043% against 0.000–0.038% |
| Homepage desktop | identical | 0.42–0.55% against 0.55–0.59% |
| Homepage mobile | identical | differs in fold 4 only — the intended type and passport change |
| Companies mobile | identical | differs in ONE frame, the send button's post-press colour, which is the intended both-viewports change |
| Companies desktop | 21783 → 9633 | **deliberately changed** |

Mobile behaviour re-checked in the same run: hero 150svh, demo 520svh, four folds, `__cpSVH`
reading `{150,520}`, and both desktop hooks `undefined`.

---

## D11 — For Companies: the passport shuts in order, and stops rastering six leaves

**Files:** `src/scripts/companies.js` (the Decide act's close), `src/styles/mobile-pages.css`
(the layer budget and the panel)

Reported as "for those folds where we have the passport there are some glitches — we can see
through the coverpage" on a phone recording. Two independent causes, one of them the homepage's
old S23 bug arriving on a second page.

### 1 · One shut ramp drove the cover and the leaf, so they met at the same angle

`var lp = ease(seg(g,dcFlips[li]))*(1-dcShut)` applied a single `dcShut` to every leaf. The
cover and leaf 1 had both reached `lp=1`, so both came back down the same ramp at the same
rate. Measured mid-shut at 390×844:

```
#dcCover  translateZ(15.85px) rotateY(-45.74deg)
#dcLeaf1  translateZ(14.97px) rotateY(-45.74deg)
```

Two 460×640 planes at the same angle, **0.88px apart in z** — 0.26px at the 0.3 scale they are
drawn at. The `sin(PI*lp)*14` lift that is supposed to separate a turning leaf from the stack
was identical for both and cancelled. Inside a `preserve-3d` context that is resolved
per-fragment, and the dark cover and the white page tear into each other: on a phone it reads
exactly as reported, as seeing the pages through the cover, and as a smear while it moves.

It now closes in the order a book closes. Leaf 1 returns over `.976–.988` while the cover holds
flat at −180°; the cover returns over `.988–1` with the leaf already down. Neither half shares
an angle, and the moving one always carries the lift while the still one does not, so the
separation stays ~14px. Verified frame by frame at `g` = .940 … 1.000: on `origin/main` the
g=.990 frame shows a white page and the EXPERIENCE VISA spine standing out of the left edge of
a shut cover; it is gone.

The leaf has to come back, which is not obvious — leaving it turned is more like a real book.
This book has no back cover: a shut passport is the right half alone, and `--bx` slides the box
230 units left to centre it. A leaf left at −180° is an opaque page standing beside the shut
passport with the verso beneath it already faded out.

Applies to both viewports, because it is the same driver. Desktop had it worse — the act is
4400ms there against 6400ms on mobile.

### 2 · Six promoted leaves, three of them never visible

`.dcpp .leaf{will-change:transform}` promotes all six of `#dcCover` and `#dcLeaf1..5`
permanently AND rasters each at full quality, so a 460×640 leaf is rastered at the device pixel
ratio and scaled down rather than rastered at the ~0.3 it is drawn at. This is the homepage's
S23 finding word for word, and the remedy is the same:

- `#dcLeaf3/4/5 { display:none }` on mobile. `dcFlips` pins leaves 2–4 at `[9,9]`, a range `g`
  cannot enter, and leaf 5 is not in `dcLeaves` at all. Leaf 2 is kept — after leaf 1 turns its
  `.lf` is the right page of the spread and it hosts `#dcStampGrid` and `#dcVerifying`. Leaves
  3–5 sit behind that opaque page for the whole visit.
- `will-change:auto` on `.dcpp .leaf` and `.dcpp .book`, restored only on `#dcCover` and
  `#dcLeaf1`, which are written every frame. Two layers instead of six.
- `contain:paint` on `.dcpp`.

Mobile only.

### 3 · The demo's card, on mobile

Asked for separately: "from Design till Decide we can see a dark solid colour BG — remove
that". `.aibox.big` is `background-color:var(--panel)` (#121514) over the page's own #0a0c0b,
plus a hairline, a float shadow and the passport's laid hatch. Removed whole rather than
lightened — fill, border, shadow, hatch and the emerald top hairline are all one card, and
leaving any of them reads as a card that failed to paint.

Its inset went with it: the four act layers carry 18px of padding, which put the panel's
content at x=38 while the copy column starts at x=20. `padding-inline:0` on `.aibp/.aiex/.aiev/
.aidc`, block padding kept.

And the Execute map's `.wire.reach` paths, which deliberately run from viewBox x=88 to x=101 to
say the network continues past the frame, needed an ending. With the card they ran into its
rounded edge; without it they stop in open space at x=372 of a 390px viewport, which reads as
the channel columns having been cut off — which is how it was reported once already. A mask
fades them from 84% out to the gutter. The channel nodes are spans outside the SVG and are
untouched, as is every wire a packet travels.

---

## D12 — The header brand is the supplied logo lockup

**Files:** `src/components/chrome/Header.astro`, `src/styles/cp-header.css`, and the asset pair
`assets/Careerpassport.png` → `public/assets/careerpassport-logo.webp`

A logo was finally supplied. Everything the header carried before it — a 20x27 gradient passport
chip and CAREERPASSPORT set in `var(--display)` — was a stand-in for exactly this, and the export
still ships the stand-in, so this has to be re-applied after every re-derivation.

```
- <a class="brand" href="/"><i></i><span>CAREERPASSPORT</span></a>
+ <a class="brand" href="/"><img src="/assets/careerpassport-logo.webp" width="444" height="186"
+    alt="CareerPassport" decoding="async" fetchpriority="high"></a>
```

**The conversion.** `sharp(...).webp({lossless:true, effort:6})`, which is both the best quality
and the smallest of the three encodings tried — 3412 bytes against 5886 at q82 and 7274 at q90.
Flat vector-style artwork is what lossless WebP is good at; a lossy pass costs bytes to add
ringing around the letterforms. Alpha is preserved (4 channels, 444x186), and the source PNG
stays in `assets/` beside `fingerprint.png`, which is the convention this repo already uses:
sources in the repo root's `assets/`, what ships in `public/assets/`.

**The sizing.** Height, not width: `height:27px; width:auto`, 27px being exactly what the chip it
replaces was. The image's own 2.387:1 then gives ~64.4px of width, so the number is never written
down twice and cannot go stale if the artwork is recut. The `width`/`height` attributes give the
box its ratio before the file arrives, so the header never reflows around it. Measured 64.4x27 on
all six page/viewport combinations, and `--hdr` still reads 69px desktop / 76px mobile.

**One rule died with the wordmark.** `@media (max-width:1024px){ .hdr .brand span{font-size:11px} }`
existed because this sheet is linked after each page's inline `<style>` and its 13.5px was
beating the pages' mobile scale at equal specificity. The lockup is an image now and the chip
beside it never stepped, so the brand keeps one height on both viewports.

**The footer is deliberately untouched.** Its giant stacked CAREER / PASSPORT is live SVG text
with `#fmedge` walking a light across the letterforms on an 11s loop; a raster cannot do that,
and there is no small brand lockup in the footer to swap.

---

## Retired

Everything below was fixed in Claude Design and re-derived cleanly on 10 Sep. Kept as a
record of what the divergences were, so a regression is recognisable.

**Invalid CSS in the Partners and homepage sheets** (was D1) — four deletion scars: three
dangling `.swdeck,` fragments and an orphan `}` in Partners, an orphan `}` after
`.cring text.cdia` in the homepage. All four gone upstream. Fixing them recovered lost CSS,
not just syntax: the Partners sheet now parses 582 rules against 581 before, because the
dangling preludes had been swallowing the rules that followed.

**`--hdr` under-declared** (was D2) — Partners declared `60px` against a header measuring
69px desktop and 76px mobile. Now declared properly, and Claude Design corrected the brief
on two points worth keeping in mind: the header's own breakpoint is **900, not 1024** (the
burger swaps there; between 901 and 1024 the header keeps its desktop 69px form), and the
declaration has to come **last in the sheet**, because Partners' first
`@media (max-width:900px)` block precedes `:root` and would otherwise lose at equal
specificity. The `ResizeObserver` guard in `Header.astro` stays as a safety net but should
now be a no-op on every page.

**Mobile graphics-memory budget** (was D3) — `HV_N` 40→20, hero canvas 515→258, a 1280px
crowd plate chosen by viewport, and `.paper`/`.rose` back to `inset:0`. All upstream now.
Only the path rewrite survives, as D1 above.

**The waitlist row is allowed to shrink** (was D4) — `width:0` on `.wait input`, applied
upstream at **both** the desktop and mobile rules, and at the equivalent row in
`For Companies.html`. This was the closing fold's text running off the right edge: an
`<input>` contributes its default 20-character intrinsic width (~155px) when the browser
asks the row how narrow it can be, `min-width:0` does not change that, and `.wait` therefore
answered 351px inside a 320px box — stretching the heading, lede and fine print out with it.

A `min-width:0` guard on `.ocopy` was carried here briefly and has been **dropped**: the
root cause is fixed at both breakpoints, and carrying an unproven guard forever costs more
than it protects. Suggested upstream as optional hardening instead.

**Fold geometry derived instead of measured** (was D5) — implemented upstream as
`remeasure()` / `foldTop()` / `foldH()`, superseding the local `foldRects()`. Claude Design's
version is the better one: it caches per fold index and guards the cache with `geoOk()`,
which re-measures whenever it is empty, zero-height, or stamped against a different viewport.
That guard matters — an empty cache here does not merely go stale, it makes
`sp = (vh-0)/(vh+0) = 1`, collapses `dock` to 0, and switches the crowd, progress bar and
callouts off for a whole scroll.

**Halved "blueprint is being prepared" dwell** (was the original D1, commit `cf324ff`) —
retired at the 8 Sep import; the design now resolves the prep itself with a 1150 ms clock cap.

### Settled, not a delta

**The passport seal no longer rotates, and that is deliberate.** The `cringspin` animation
was removed on request on 9 Sep for both viewports — the "Seal of trust / Evidence of your
claims" legend is meant to be static. The stale comment and the dead
`prefers-reduced-motion` rule that referenced it have been cleaned up upstream. Do not
restore any of it.
