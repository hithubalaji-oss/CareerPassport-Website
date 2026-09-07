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

**What.** Three separate pieces of malformed CSS are removed from the extracted sheet:

1. An orphan `}` after the `@property` block, before `.net{`.
2. Three dangling `.swdeck,` fragments — a selector list ending in a comma with no
   declaration block, one inside each of three `@media` blocks.
3. An orphan `}` where a `.foil` rule used to be, right after the comment describing it.

All three are deletion scars: a rule was removed and part of its syntax left behind. None
of the classes involved (`.swdeck`, the foil) appears anywhere in the markup, so dropping
the remnants loses nothing.

**Why it matters.** PostCSS rejects the whole sheet, so the build fails outright — but this
is not only strictness. An orphan `}` browsers skip. A dangling `selector,` with no `{` is
worse: the parser keeps consuming tokens looking for a `{`, so the rules that follow can be
swallowed into the prelude and silently lost. That is a real bug in the design file, not a
tooling difference.

**How to re-apply.** After extracting `partners.css`, delete: the lone `}` between
`@property --r{...}` and `.net{`; the three `.swdeck,` lines; and the lone `}` after the
"the foil" comment. Nothing else changes.

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

**Why.** The Partners page declares `--hdr:60px` while its header actually measures 69px at
the design width. `--hdr` feeds `scroll-margin-top` on `.artsec` and the hero's top padding,
so a declared value smaller than the real header leaves roughly 9px of an anchored section
sitting underneath it. For Companies declares 83px against the same 69px header — larger,
so deliberately roomier spacing, and the guard leaves it alone.

This is the one delta that changes rendering rather than just letting the build succeed: the
Partners page sits ~4px lower than the prototype, and that difference is the correction.

**How to re-apply.** It lives in `Header.astro` and survives a re-derivation, since the
chrome is a component rather than sliced markup. Verify it is still guarded both ways: only
raises, and no-ops when `--hdr` is undeclared.

**Retire this entry** by declaring the real height in the design file — `--hdr:69px`, or
better, whatever the header actually measures. Then the observer never fires and the
implementation matches the prototype pixel for pixel.

---

## Retired

**Halved "blueprint is being prepared" dwell** (was D1, commit `cf324ff`) — retired at the
8 Sep import. The design now resolves the prep itself: `prepDone` is
`p>=.545 || (prepArmed && now-prepArmed>1150)`, which is marginally shorter than the .5515
this delta set *and* adds a 1150 ms clock cap, so stopping mid-scroll can no longer park a
reader on the spinner. Re-applying the patch would have fought that mechanism and
reinstated a hard upper bound the code no longer has.
