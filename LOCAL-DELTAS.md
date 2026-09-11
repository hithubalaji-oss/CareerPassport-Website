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
