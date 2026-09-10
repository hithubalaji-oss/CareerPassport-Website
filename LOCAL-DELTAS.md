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
