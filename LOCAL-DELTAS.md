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
npm run check:deltas    # which deltas survived the re-derivation
```

Anything reported MISSING was reverted by the import and must be re-applied from its
"How to re-apply" note before pushing. Re-run until clean, then build and verify.

A delta should not live here forever. Each one is a small divergence that has to be
carried by hand, so the moment a change can be made in Claude Design instead, make it
there and delete the entry.

---

## D1 — Invalid CSS dropped from the Partners stylesheet

| | |
|---|---|
| **File** | `src/styles/partners.css` |
| **Source** | `For Recruitment Partners.html` |
| **Status** | Active — worth fixing in Claude Design, which would retire this entry |

**What.** Four separate pieces of malformed CSS are removed from the extracted sheets — three
in `partners.css`, one in `homepage.css`:

1. An orphan `}` after the `@property` block, before `.net{`.
2. Three dangling `.swdeck,` fragments — a selector list ending in a comma with no
   declaration block, one inside each of three `@media` blocks.
3. An orphan `}` where a `.foil` rule used to be, right after the comment describing it.
4. `homepage.css` — an orphan `}` after `.cring text.cdia`, new in the 10 Sep export.

All three are deletion scars: a rule was removed and part of its syntax left behind. None
of the classes involved (`.swdeck`, the foil) appears anywhere in the markup, so dropping
the remnants loses nothing.

**Why it matters.** PostCSS rejects the whole sheet, so the build fails outright — but this
is not only strictness. An orphan `}` browsers skip. A dangling `selector,` with no `{` is
worse: the parser keeps consuming tokens looking for a `{`, so the rules that follow can be
swallowed into the prelude and silently lost. That is a real bug in the design file, not a
tooling difference.

**The fourth one cost a feature.** On 8 Sep `.cring` carried
`animation:cringspin 44s linear infinite` with a matching
`@keyframes cringspin{to{rotate:360deg}}`. The 10 Sep export dropped both and left the
closing brace behind, so **the passport seal legend no longer turns** — while the comment
above it still describes it turning and the `prefers-reduced-motion` rule below still tries
to switch off an animation that no longer exists. Only the brace is removed here; the
animation is deliberately NOT restored, because dropping a slow infinite rotation is a
plausible call for mobile. Restoring it is one line in the design file.

**How to re-apply.** After extracting, delete: in `partners.css`, the lone `}` between
`@property --r{...}` and `.net{`, the three `.swdeck,` lines, and the lone `}` after the
"the foil" comment; in `homepage.css`, the lone `}` after `.cring text.cdia`. Nothing else
changes.

**Retire this entry** by fixing all three in the design file. The handoff's own CSS audits
catch this class of bug: *classes used in markup with no rule anywhere*, and *classes whose
only rules sit inside `@media` blocks*.

---

## D2 — `--hdr` raised to the header's real height

| | |
|---|---|
| **File** | `src/components/chrome/Header.astro` |
| **Source** | `For Recruitment Partners.html` declares `--hdr:60px` |
| **Status** | Active — fix the declared value in Claude Design and this stops having any effect |

**What.** A `ResizeObserver` publishes `--hdr` as the header's measured height, but only when
that is **larger** than the value the page declared. It never lowers it, and writes nothing
at all on a page that declares no value.

**Why.** The Partners page declares `--hdr:60px` while the header actually measures more at
every width, and the gap widens on small screens — 69px at 1440, **76px at 768 and 390**, so
the declared value is 16px short exactly where it matters most. `--hdr` feeds `scroll-margin-top` on `.artsec` and the hero's top padding,
so a declared value smaller than the real header leaves roughly 9px of an anchored section
sitting underneath it. For Companies declares 83px against the same 69px header — larger,
so deliberately roomier spacing, and the guard leaves it alone.

This is the one delta that changes rendering rather than just letting the build succeed. The
Partners page sits 9px lower than the prototype at 1440 and 1024, and **16px lower at 768 and
390** — that offset is the correction, and it is the only difference between the build and the
prototype at any width.

**How to re-apply.** It lives in `Header.astro` and survives a re-derivation, since the
chrome is a component rather than sliced markup. Verify it is still guarded both ways: only
raises, and no-ops when `--hdr` is undeclared.

**Retire this entry** by declaring the real height in the design file, per breakpoint —
69px at desktop, 76px at the mobile breakpoints. Then the observer never fires and the
implementation matches the prototype pixel for pixel.

---

## D3 — Mobile graphics-memory budget

| | |
|---|---|
| **Files** | `src/scripts/homepage.js`, `src/styles/homepage.css`, `public/uploads/Crowd-6ce23065-1280.webp` |
| **Source** | `index.html` |
| **Status** | Active — belongs in Claude Design; see *How to retire* |

**The symptom.** On a phone the homepage does not merely stutter: text, gradients, CSS
animations and whole background regions blank out or draw half-finished. That breadth is the
tell. A slow asset degrades that asset; when *everything* fails to paint, the compositor is
discarding rasterised tiles because it has run out of graphics memory.

**The measurement.** As authored, one page asks a phone for roughly 115 MB:

| | |
|---|---|
| 40 baked hero frames @ 515x955, retained as canvases | 75 MB |
| Crowd plate 2528x1696, decoded | 16.4 MB |
| Fixed composited layers (`.paper` 150% of viewport, `.rose` 180%, `.stage`) | 23.8 MB |

The hero frames dominate. `bakeHeroFrames()` pushes a full canvas per frame into `hvFrames`
and they stay resident for the life of the page — the size is a constant, so a phone pays
exactly what a desktop does.

**What changed, all scoped to `innerWidth < 1025`:**

1. **Hero bake budget** — 20 frames at 258px instead of 40 at 515px: 75 MB to 9.4 MB. The
   hero is drawn small on a phone, so the resolution is not missed.
2. **Right-sized crowd plate** — a 1280px copy ships alongside the original: 16.4 MB to
   4.2 MB decoded. Still finer than a DPR-3 phone resolves. Desktop keeps the full plate.
   Both now ship as WebP, which cuts the *download* (0.23 MB against 0.92) but not the
   decoded figures above — those follow from the pixel dimensions and are the same in any
   format. The saving that mattered here is the resize, not the re-encode.
3. **`.paper` / `.rose` pulled back to `inset:0`** — their overscan exists only so the
   desktop driver can translate and rotate them without exposing an edge, and the sheet
   already stops animating them on mobile. Invisible there; cuts the layer area to about a
   third.

Asset paths are also restored to root-absolute. The 10 Sep export reverted them to the
authoring-environment `window.__resources` fallback, whose relative paths only happened to
work because the crowd is homepage-only.

**Measured, 4x CPU throttle at DPR 3:** decoded image memory 17.4 -> 5.2 MB, long tasks
11 (640 ms) -> 6 (344 ms), median frame 31 -> 27 ms, worst frame 83 -> 67 ms. The hero-bake
saving is **not** in those numbers — headless Chromium cannot decode the H.264 source, so
the bake never runs here. On a real phone it does, and it is the largest of the three.

**How to retire.** Port all three into Claude Design, where they belong: the bake budget and
crowd source as viewport-conditional values, the `inset:0` into the existing mobile block
that already neutralises `.paper` / `.rose`. Better still, ship a pre-keyed hero video with
an alpha channel — then `bakeHeroFrames` and its 40 retained canvases disappear entirely, on
every device. The handoff recommended exactly that (*Known gaps*, item 7).

---

## D4 — The waitlist row is allowed to shrink

| | |
|---|---|
| **Files** | `src/styles/homepage.css` |
| **Source** | `index.html` carries the same `.wait input{flex:1;min-width:0}` |
| **Status** | Active — one word in the design file retires it |

**The symptom.** On a phone the whole closing fold ran off the right edge: the heading lost
its last word, the paragraph read "A professional identity read", the JOIN THE WAITLIST
button hung past the screen and the fine print ended on "to". Every block in the fold was
clipped by the same amount.

**The cause is one un-shrinkable input.** `.wait` is a pill holding an email field and a
button. The field has `min-width:0`, which lets it *shrink once it is being given a width* —
but it does not change what the field **contributes when the browser asks `.wait` how narrow
it can be**. An `<input>` answers with its default 20-character intrinsic width, about 155px.
Add the button's un-shrinkable 177px, the gap and the padding, and `.wait` answers **351px**.

`#outro` centres its children rather than stretching them, so `.ocopy` is sized to that 351px
answer instead of the 320px actually available at 360px wide — and every one of its children,
the heading, the lede, the waitlist row and the fine print, is stretched to match and clipped
by the viewport. Measured: `.ocopy` computed to `width:351.031px` at a 360px viewport *and*
at 390px — identical, because the number never came from the viewport at all.

That is also why **fold 5 was the one fold with nothing wrong with it**: it is plain centred
text with no flex row that refuses to shrink, so nothing forces a minimum on it.

**The fix.** `width:0` on the field, which drops its contribution to zero: `.wait` min-content
falls **351px -> 144px**. Plus `min-width:0` on `.ocopy` as a guard, so a future un-shrinkable
child cannot repeat this. Verified at 360 and 390: every block sits inside the viewport, and
the design is unchanged — same pill, same height, the field just yields the width it was
always supposed to.

**Retire this entry** by adding `width:0` beside the existing `min-width:0` on `.wait input`
in the design file. `min-width:0` alone looks like it already covers this and does not.

---

## D5 — Fold geometry derived instead of measured

| | |
|---|---|
| **Files** | `src/scripts/homepage.js` |
| **Source** | `index.html` measures every fold with `getBoundingClientRect()` each frame |
| **Status** | Active — but see the honest note below before treating this as the fix |

**What.** `.fold` is `height:calc(var(--h) * 1vh)` and nothing writes a fold's style at
runtime, so a fold's box in document space only changes when the viewport does. It is now
measured once, re-measured on resize / orientation change / load / `fonts.ready`, and its
viewport box derived as `top - scrollY`. `#f4` and `#f5` read from the same cache instead of
being queried and measured again.

**Effect, measured at 390px / DPR 3 / 4x CPU throttle, median of five runs:** layout reads
fall **31.9 -> 18.8 per frame**.

**What it did NOT do, stated plainly:** frame time did not improve (median 49 -> 47ms, p95
96 -> 104ms, long tasks 2001 -> 1874ms — all inside run-to-run noise). Forced reflows stayed
at 3.4 per frame. Removing one read does not remove a forced layout: the writes have already
invalidated layout, so whichever read comes *next* pays the same bill. This change removes
real work and is a prerequisite for the fix below, but on its own it is not the cure.

**The actual cause of the glitching, for whoever picks this up.** With the driver's `rAF`
loop switched off (`window.__cpManual = true`) and nothing else changed:

| | driver running | driver off |
|---|---|---|
| median frame | 50 ms | **26 ms** |
| p95 frame | 95 ms | **36 ms** |
| long tasks over one scroll | 2023 ms | **0 ms** |

The driver is responsible for *all* of the main-thread blocking. A CPU profile puts 43% in
`(program)` — layout, style, paint — and 20% in `getBoundingClientRect` alone. While the main
thread is inside a forced layout the compositor gets no new tiles, which is exactly what a
phone shows as half-drawn glyphs and blank bands.

Four forced layouts happen per frame, at four known sites. Two are now gone. The remaining
two genuinely want post-write geometry — the crowd composition lock reads the plate's box
*after* writing its scale, and the flow node block reads after writing `--tally` — so they
cannot simply be hoisted; the maths has to be restated in terms of the values the driver
already wrote rather than re-measured. **That refactor is the real fix, and it belongs in
Claude Design where the composition constants live.**

---

## Retired

**Halved "blueprint is being prepared" dwell** (was D1, commit `cf324ff`) — retired at the
8 Sep import. The design now resolves the prep itself: `prepDone` is
`p>=.545 || (prepArmed && now-prepArmed>1150)`, which is marginally shorter than the .5515
this delta set *and* adds a 1150 ms clock cap, so stopping mid-scroll can no longer park a
reader on the spinner. Re-applying the patch would have fought that mechanism and
reinstated a hard upper bound the code no longer has.
