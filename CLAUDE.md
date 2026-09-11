# CareerPassport — working notes

Read this first. It is the standing context for the project: how it is built, the rules that
were learned the hard way, and where things stand.

---

## What this is

Three marketing pages — homepage, For Companies, For Recruitment Partners — designed in
**Claude Design**, implemented in **Astro** (static output), deployed on **Vercel** from
`main`.

```
src/pages/*.astro          three pages
src/components/**          chrome/ homepage/ companies/ partners/
src/layouts/Base.astro     document shell, fonts, viewport meta, build stamp
src/styles/                see the table below
src/scripts/               the drivers
scripts/check-deltas.mjs   npm run check:deltas
scripts/check-design-files.mjs   npm run check:design
```

### The stylesheets, and which are safe to edit

| file | derived from the design export? | notes |
|---|---|---|
| `homepage.css` `companies.css` `partners.css` `cp-shared.css` | **YES — rewritten on every export** | anything hand-tuned here is lost |
| `mobile-passport.css` | no | homepage mobile. Everything inside `@media (max-width:1024px)` |
| `mobile-pages.css` | no | the two interior pages' mobile. Same contract |
| `local-overrides.css` | no | code-side decisions that are **not** mobile-only |
| `cp-header.css` | no | the shared bar, all three pages |
| `ds/tokens.bundle.css` | design system | `--ink`, `--void`, `--emerald` … |

**Re-derivation is destructive.** Every change made in code that has no counterpart on the
canvas is silently reverted by the next export. That is what `LOCAL-DELTAS.md` and
`scripts/check-deltas.mjs` exist for: **D1–D7**, each with a machine check. Run
`npm run check:deltas` after every import; anything MISSING must be re-applied before pushing.
`DESIGN-BRIEF.md` is the other half — what Claude Design should change on the canvas so a
delta can be retired.

---

## The rules that were paid for

**Mobile only, desktop untouched.** This has been the standing constraint for the whole
mobile effort. The way it is kept provable: every mobile rule lives inside
`@media (max-width:1024px)` in a file the export does not own, and every JS override falls
through to the authored value when nothing is published. Prove it before pushing — build
`origin/main` into a worktree, serve both, and diff. **Always run the control** (baseline
against itself): the homepage and For Companies run rAF animations and diff ~2% against
themselves, so a raw 2% means nothing. Partners has no live animation and should be 0.000%.

**The measured band.** The core idea behind the mobile layout: do not guess where art goes.
Measure where the copy column actually landed, hand the art everything above it, express the
art as a fraction of that band. `mobile-passport.js` `measure()` publishes `--art-top`,
`--art-h`, `--art-fit`, `--art-dy`; `mobile-pages.js` `fitPanel()` does the same for the
For Companies demo panel as `--ai-h`. Before this, fold 4 cleared by 46px at 412×915 and
overlapped by 68px at 360×640.

**Astro does not honour script tag order.** It bundles a page's module scripts and orders
them by its own import graph. `companies.js` landed *before* `mobile-pages.js` despite the
tag order, so the section lengths published by the latter arrived too late and the page
stayed 26 screens long while every other part of the override worked. Anything that must run
first goes in an `is:inline` script in the `.astro` file — `window.__cpManual` on the
homepage, `window.__cpSVH` on For Companies.

**Verify the phone is on the new build.** `<html data-build="…">` carries the short SHA
(`Base.astro`). A stale alias is indistinguishable from a fix that did not work; this cost a
day once.

**Read edits back.** A `str.replace()` that silently no-matched once produced a commit
message describing a change that was never in the code.

**Other things measured, not guessed:**
- `.outro` and `.ftr` are **siblings** of `<main>`, not children. `main[data-mfold] .outro`
  matches nothing. The state attribute goes on four hosts.
- `getComputedStyle` returns a custom property as its **token sequence**, not resolved px.
- `offsetLeft`/`offsetWidth` ignore transforms — do not mix them with `translate:-50%`.
- Scaling a **fixed-height** box scales box and content equally; overflow survives. Needs
  `height:auto`. (Scaling *does* work when the contents are sized to the box.)
- `body{overflow-x:hidden}` is the one rule iOS Safari ignores for touch panning. Use
  `html,body{overflow-x:clip}` — it never creates a scroll container, so sticky pins survive.
- `(100lvh - 100svh)` **is** the browser chrome height. Keyboard-safe copy anchor:
  `bottom: calc(100lvh - 100svh + 5svh)`.
- `interactive-widget=resizes-visual` in the viewport meta stops Android browsers shrinking
  the layout viewport when the keyboard opens (the DuckDuckGo field-jumps-to-top bug).
- `will-change` permanently promotes a layer and forces full-quality rasterisation. Budget it.

---

## The mobile type ladder

Five steps, ~1.25 ratio. `--m-body` (15px) and `--m-label` (11px) are **floors, not
parameters**. Declared twice — `homepage.css:673` and `mobile-pages.css` — because the
homepage's copy sits in a design-derived file and cannot be imported from. If they move, they
move in both.

```
--m-display 30px   (28 / 26 / 24 as the viewport shortens: 700 / 660 / 620)
--m-head    23px
--m-body    15px
--m-label   11px
--m-ctl     52px   control height;  CTA text 14px
--gut       clamp(20px,4.4vw,72px)
--sec       clamp(48px,7vh,88px)  on mobile
```

**Two deliberate exclusions.** The simulated product screens on both interior pages keep
their miniature type — it stands in for a dense UI seen at a distance, and 15px would break
the illusion and overflow the panels. Same call the homepage makes for the passport interior.
And `.fine` is secondary prose separated by **colour**, not size.

---

## Settled decisions — do not "fix" these

- **The passport seal does not rotate.** Removed on request, both viewports, all three pages.
- **The eyebrows are gone** from every fold, both viewports, with exactly two exceptions:
  "Tell us who you need" (For Companies hero, both) and "Built on real experiences"
  (homepage hero, **mobile only** — hence `local-overrides.css`).
- **No loader.** Advised against it and the user agreed: first paint is ~1.1s, which is not
  the indeterminate wait a ChatGPT/ixigo-style loader covers, and any loader worth looking at
  costs 600–900ms. A staged entrance was offered instead and not yet built.
- **The For Companies demo plays forward once per entry and holds** — it does not loop. It is
  a narrative ending on the offer being sent.
- **The scramble-in text** on the "Better Opportunities / Better Conversations" fold is that
  fold's animation working correctly. It reads as corrupted text in a screen recording.

---

## Where things stand (11 Sep)

`main` = `8d3ec93`. Working tree clean, nothing unpushed. All 9 deltas pass, design export
consistent.

Mobile is **done and verified** on all three pages:

| | before | after |
|---|---|---|
| For Companies scroll | 26–27 screens | 7.7–8.9 |
| Homepage scroll | — | 8.6–8.9 (1.25 screens per fold, both directions) |
| Burger contrast | 1.53:1 worst | ~17:1 across 84 samples |
| Menu sheet under the bar | 18px on every page | 0px on all 39 combinations |
| Load event | 5338ms | 1753ms |

24 mobile combinations (3 pages × 8 sizes, 320×568 → 768×1024, scrolled both ways): no page
errors, no horizontal scroll, burger present on all.

### Open, flagged to the user, not started

1. **The `<image-slot>` placeholders are still unfilled** on both interior pages — the "Drop
   a product screen grab" boxes. One overlaps the ring on the Partners outro. Waiting on real
   artwork. Their ids say what belongs in each.
2. **Two demo act layers never appear** on For Companies — `.verifying` and `.ctally`. Not on
   mobile and **not on the scroll-driven desktop path either**, so it is pre-existing and
   possibly dead states. Flagged, deliberately not changed.
3. **`README.md` is stale.** It describes the old flat deploy bundle — `index.html` at the
   root, `_redirects`, no build step. None of that is true since the Astro move. Worth a
   rewrite when there is a reason to touch it.
4. **The staged hero entrance** offered in place of a loader — never built, user has not asked.

### Session mechanics

- Branch: `claude/design-mcp-project-import-5efezy`. When its PR is merged, restart it from
  `origin/main` rather than stacking on merged history.
- No `gh` CLI — use the `mcp__github__*` tools.
- `vercel.app` is **blocked** by this environment's network policy; the live site cannot be
  fetched from a session. Build locally and serve with `npx serve dist -l <port>` —
  **without `-s`**, which rewrites every route to `index.html` and silently serves the
  homepage for all three pages (this produced a whole round of identical measurements once).
- Playwright: `executablePath: '/opt/pw-browsers/chromium'`, import from
  `node_modules/playwright/index.mjs`. Google Fonts is blocked — stub it or first paint reads
  13s: `p.route('**fonts.googleapis.com**', r => r.fulfill({status:200,contentType:'text/css',body:''}))`.
- `sharp` is available for pixel analysis.
