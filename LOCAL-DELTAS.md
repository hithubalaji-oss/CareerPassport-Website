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
