# Handoff: CareerPassport — marketing site (3 pages)

## Overview

The public marketing site for **CareerPassport**, a verified-career-record product. Three pages,
one shared argument: *when anyone can claim anything, proof is what sets you apart.*

| Page | Audience | Core argument |
|---|---|---|
| **Homepage** | Candidates | Your lived experience, turned into evidence |
| **For Companies** | Hiring managers / talent teams | Intent in, evidence out — meet fewer people, know more |
| **For Recruitment Partners** | Agencies, headhunters | More leverage from the network you already own |

Each page is a single scroll narrative rather than a stack of independent marketing sections. All
three run on the bound **CareerPassport Design System** (navy & gold foil on near-black).

---

## The implementation

The design references below have been implemented as a **static Astro site**. `npm install`
then:

```bash
npm run dev       # dev server
npm run build     # static output to dist/
npm run preview   # serve the build
```

### What was implemented

The two files selected for this pass:

| Route | Source artboard | Component |
|---|---|---|
| `/` | `Homepage.dc.html` -> `site/Homepage.html` | `src/pages/index.astro` |
| `/for-companies` | `site/For Companies.html` | `src/pages/for-companies.astro` |

`/for-recruitment-partners` is **not built**. It was outside this selection, so the nav
links to it resolve to a route that does not exist yet. It is the next page to do, and the
handoff recommends rebuilding it on the Companies page's flow grid rather than porting the
old pinned-fold model (see *Known gaps*, item 5).

### How it is put together

```
src/
  layouts/Base.astro          document shell; loads the bound design system
  pages/                      one file per route
  components/
    chrome/                   header, footer, the shared nav list
    homepage/                 ground, the passport, the five folds, the outro
    companies/                ground, hero, strip, process, testimonials, comparison, close
  styles/
    ds/                       the bound design system, copied verbatim
    homepage.css              each page's own stylesheet, carried over verbatim
    companies.css
  scripts/
    homepage.js               each page's driver, carried over verbatim
    companies.js
public/                       hero-lift.mp4, the crowd plate, image-slot.js
```

**Markup was componentised; CSS and the scroll drivers were not rewritten.** The handoff
asks for two things to be carried over near-verbatim because they encode measurements that
took real iteration to settle - the scroll-progress maths and the `:root` token override
layer - and both live in files that are byte-for-byte the prototype's. The markup around
them is split into components; the class names they select on are unchanged. This is also
why there is no framework runtime between the drivers and the DOM: the loops read
`getBoundingClientRect` every frame and write CSS custom properties, which is exactly what
they did before.

Nothing was regex-swept out of the stylesheets. The handoff records two occasions where
that silently removed live rules, and both audits it recommends still return clean.

### Deliberate differences from the prototypes

1. **Routes replace filenames.** `Homepage.html` -> `/`, `For Companies.html` ->
   `/for-companies`. The three nav links are declared once in
   `src/components/chrome/nav-links.ts`, so the header, mobile drawer and footer cannot
   drift apart, and the current page is marked from the URL rather than a hand-set class.
2. **`--hdr` is now floored, not fixed.** The stylesheet authors it as `83px` while the
   header actually measures ~60px at the design width, so the authored value is deliberate
   spacing rather than a stale guess - and it errs in the safe direction. A `ResizeObserver`
   now only ever *raises* it, which keeps the authored spacing pixel-accurate while making
   the documented failure (a hard-coded value smaller than the real header, sliding headings
   underneath it) impossible.
3. **Asset paths are root-absolute.** The homepage's crowd plate and hero video are served
   from `public/` at `/uploads/` and `/assets/`, so they resolve identically from any route.
   The `window.__resources` indirection was an authoring-environment hook and is gone.
   Both stay same-origin, which the hero needs: it is chroma-keyed on a canvas, and a
   cross-origin source would taint it and make `getImageData` throw.
4. **Only referenced assets ship.** The current pages use `hero-lift.mp4` and
   `Crowd-6ce23065.png`; the superseded plates listed under *Assets* stay in `site/` and are
   not served.
5. **An empty `.image-slots.state.json` is served.** `image-slot.js` fetches its sidecar on
   load; without the file every page load logged a 404. The prototypes 404 here too.

### Verification

Both pages were driven in Chromium against the prototypes served over HTTP, and compared:

- **Document height matches exactly** - Homepage 11145px, For Companies 23567px, both equal.
- **Box geometry matches exactly** at rest and at a fixed scroll offset: header, ground,
  grid, hero, strip, the pinned section and its sticky pin, the comparison, closing and
  footer all agree to the pixel.
- **Responsive behaviour matches at 1440 / 1199 / 900 / 767 / 560 / 390** - burger swap,
  the comparison collapsing to six generated blocks, and 7 logo slots duplicated to 14.
- **Behaviour matches** - email capture (rejects invalid, swaps to its `data-done` label,
  input goes read-only), the homepage handle field and waitlist, and the mobile drawer.
- **Screenshot diff**: the residual difference between the build and the prototype is
  *smaller than the prototype's difference from itself across two loads* (4.6% vs 5.9%).
  The page has genuinely non-deterministic motion - the departures board flips on a random
  clock, the crowd's claim cards run on their own five-second timer - so a nonzero diff is
  expected, and this is the control that says it is not a porting regression.

**Not verified here:** the homepage's chroma-keyed hero figure. The container's headless
Chromium cannot decode the H.264 source, so the video never reaches `readyState > 0` and
the code drops the hero layer - which is the clean failure it is designed to have. The
prototype behaves identically under the same browser, so there is no difference between
them to detect, but neither was seen rendering. Check it in a browser that can decode the
file, and see *Known gaps* item 7: production should ship a pre-keyed video with alpha
rather than keying every frame on a canvas.

The **Known gaps** at the end of this document are unchanged and still apply - the
testimonials are still `[Placeholder]`, the seven logo slots and the product slots are
still empty, there is still no logo file and no backend behind the email capture.

---

## About the design files

**The files in this bundle are design references created in HTML.** They are working prototypes
showing intended look, motion and behaviour — not production code to lift directly.

The task is to **recreate these designs in the target codebase's environment** (React, Vue, Svelte,
Astro, whatever is established) using its existing patterns, component library and build pipeline. If
no environment exists yet, choose the framework that fits the project and implement there.

Two things are worth carrying over near-verbatim rather than re-deriving, because they encode
measurements that took real iteration to settle:

1. **The scroll-progress maths** in each page's driver script (documented under *Interactions*).
2. **The design-token override layer** in each page's `:root` block, which maps the design system's
   semantic tokens onto page-local names.

Everything else — markup structure, class names, the `<style>` blocks — should be rebuilt in the
target codebase's idiom.

### Fidelity: high

Final colours, typography, spacing, motion and copy. Recreate pixel-accurately. Every value in this
README was read from the shipped files or measured in a live browser, not recalled.

### How to run the prototypes

**Serve the `site/` folder over HTTP. Do not double-click the HTML files.**

```bash
cd site
python3 -m http.server 8000      # or: npx serve .
# then open http://localhost:8000/Homepage.html
```

No build step and no npm install — but the `file://` protocol degrades two things, because
browsers treat every `file://` document as an opaque origin:

| On `file://` | Why |
|---|---|
| The homepage's hero figure disappears in fold 1 | The figure is a green-screen video chroma-keyed on a canvas. A `file://` video taints the canvas, so `getImageData` throws. **The code catches this and drops the hero layer** rather than showing an unkeyed green rectangle — so it fails cleanly, but the figure is missing |
| Dropped images in `<image-slot>` do not load | The sidecar is read with `fetch()`, which is blocked for local files |

Over HTTP both work. **One network dependency remains either way:** Geist is loaded from
`fonts.googleapis.com`. Offline, the pages fall back to Arial and the tight negative tracking will
look wrong. Self-hosting the `.woff2` files removes this.

---

## Files

```
site/                          everything at one level, because every page resolves its
                               assets relative to itself — this mirrors the project layout
                               exactly, so nothing needs a path rewrite

  Homepage.html                the three live pages — the source of truth
  For Companies.html
  For Recruitment Partners.html

  For Companies v1.html        superseded variants — see Version history
  For Companies v2 - pinned folds.html
  For Companies v3.html
  Claim Field.html

  cp-shared.css                shared chrome + fold system (Partners page + v1)
  cp-page.js                   shared fold engine          (Partners page + v1)
  image-slot.js                drag-and-drop image placeholder web component
  .image-slots.state.json      dropped-image sidecar (hidden file — keep it)

  _ds/                         the bound design system: styles.css, 8 token files,
                               the React component bundle and its manifest
  assets/                      video and stills
  uploads/                     Crowd-6ce23065.png — the homepage crowd plate

content/                       source copy, extracted from the supplied documents
  content-companies.txt
  content-partners.txt
  content-freeze.txt
```

**The three live pages are the source of truth.** The variants are frozen history; where they
disagree with a live page, the live page wins.

Every local reference in all seven HTML files has been resolved against this tree — nothing is
missing and nothing points outside the bundle.

---

## Design tokens

All three pages consume the bound design system at
`_ds/careerpassport-design-system-a8d325d2-717b-4d0b-85f0-302544f1ad1d/`. **Use these tokens; do not
re-derive the palette.** Values below are read from `tokens/colors.css` and `tokens/typography.css`.

### Surfaces and ink

| Token | Value | Role |
|---|---|---|
| `--void` | `#0a0c0b` | page ground |
| `--panel` | `#121514` | card / panel |
| `--panel-raised` | `#181c1a` | raised panel, input |
| `--hairline-soft` | `#1c211f` | hover lift, well |
| `--hairline` | `#262c29` | **the structural 1px border** |
| `--ink` | `#f4f7f5` | headings (never pure white) |
| `--body` | `#a6afab` | body copy |
| `--mute` | `#7a8480` | secondary |
| `--faint` | `#5b6562` | meta, mono labels |

### Accent — navy & gold foil

| Token | Value | Role |
|---|---|---|
| `--emerald` | `#fdb23c` | **the action colour** — gold. Buttons, focus ring, active states |
| `--emerald-deep` | `#10203f` | navy ink — the label on a gold button |
| `--emerald-mid` | `#1b3564` | passport cover navy |
| `--mint` | `#f7deba` | pale foil |
| `--emerald-tint` | `#fdfaf1` | paper |
| `--link` / `--link-deep` | `#7ba4ff` / `#b9cdff` | stamp-blue link tier |
| `--link-soft` | `#0f1a33` | wash behind verified chips |
| `--error` | `#f2544a` | one stamp only |

The token is named `--emerald` for historical reasons; **its value is gold `#fdb23c`.** Do not rename
it in the design system, and do not assume green anywhere.

### Composite values used across pages

```css
--cover: linear-gradient(155deg,#1b3564 0%,#0d1c3a 55%,#091530 100%);  /* passport cover */
--gradient-mesh: /* five radial blooms — one per page, in the hero only */
--gradient-transit: linear-gradient(90deg,#091530,#1b3564);
--gradient-growth:  linear-gradient(90deg,#1b3564,#fdb23c);
```

Paper surfaces (evidence pack, passport interior): recto
`linear-gradient(200deg,#fdfaf1,#e8e2d2)`, verso `linear-gradient(160deg,#f2ede0,#ded7c6)`, ink
`#10203f`, meta `rgba(23,48,95,.55)`.

### Type

`--font-sans: "Geist","Geist Sans",Arial,Helvetica,sans-serif` · `--font-mono: "Geist Mono",...`

**Geist is loaded from Google Fonts, not self-hosted.** If the real product ships Geist `.woff2`
files, swap `tokens/fonts.css` for local `@font-face` rules.

| Role | Size | Weight | Tracking |
|---|---|---|---|
| Hero `h1` | `clamp(38px,5vw,74px)` | 600 | `-.05em` |
| Section `h2` | `clamp(28px,3.5vw,50px)` | 600 | `-.045em` |
| Step `h3` | `clamp(26px,3.2vw,46px)` | 600 | `-.045em` |
| Lede | `clamp(16px,1.2vw,17.5px)` / 1.62 | 400 | 0 |
| Body | 15px / 1.6 | 400 | 0 |
| Mono eyebrow | `clamp(10px,.78vw,11px)` | 400 | `.28em`, uppercase |

Rules: **mono is code and eyebrows only.** Negative tracking on anything above 20px. No italic — the
`.serif` class is a semantic accent that resolves to the same sans face at a lighter weight, kept as a
hook in case a display face is added later. Sentence case everywhere except mono eyebrows and status
tags.

### Spacing, radius, motion

4px base: `4 · 8 · 12 · 16 · 24 · 32 · 40 · 64 · 96 · 128`.

Radius is bimodal by intent: **6px** functional chrome (nav buttons, inputs) · **12–16px** content
cards · **100px** marketing CTA pills · **50%** icon buttons and avatars. *A pill in the nav or a 6px
square in a hero is a bug.*

Motion: `cubic-bezier(.4,0,.2,1)` at 120–180ms for colour and border. The house curve for scroll-
driven interpolation is `cubic-bezier(.16,1,.3,1)`. No parallax, no bounce, no entrance animation
beyond the reveal-on-enter described below.

Elevation: hairline before shadow, flat by default. Whisper `0 1px 1px rgba(0,0,0,.5)`; floating
`0 2px 2px, 0 12px 28px -6px` plus an inset hairline. **Never a gold glow as elevation.**

---

## Shared chrome

All three pages carry the same header, footer and CTA vocabulary.

### Header

Sticky, `z-index: 60`, `1px solid --hairline` bottom border, `rgba(10,12,11,.86)` +
`backdrop-filter: blur(14px)`. Padding `20px var(--gut)`.

- **Left:** brand lockup — a 22×30px passport chip (`--gradient-transit`, radius `3px 8px 8px 3px`,
  `1px solid rgba(253,178,60,.55)`) plus the wordmark **CAREERPASSPORT** at 15px/700/`.1em`.
  *No logo file was ever supplied.* Supply an SVG and it replaces the chip in three places: header,
  footer, and the bundler thumbnail.
- **Right:** nav links at 12.5px/600/`.09em` in `--mute`, hovering to `--ink`; the current page in
  `--emerald`. Then a gold pill CTA at 42px height.
- **Below 900px:** links collapse to a 44×44px burger; the drawer is a sticky panel offset by the
  header's *measured* height.

**The header height is a runtime measurement, not a constant.** A `ResizeObserver` writes
`--hdr` on `:root`; the mobile drawer's `top` and `scroll-padding-top` both derive from it. An
earlier build hard-coded `71px` against a real `83px` and headings slid under the header on anchor
jumps.

### Footer

Brand lockup and four social icon buttons (34px circles, hairline border, gold on hover) over a
giant `CAREERPASSPORT` wordmark rendered as SVG text with a top-down opacity gradient
(`.14 → .03 → 0`), `textLength="1000"` so it always spans the measure exactly. Copyright line at
12.5px `--faint`.

### Buttons

```
.btn      48–50px height, 100px radius, --emerald fill, --emerald-deep label,
          13.5px/700/.09em uppercase; hover #ffc46a
.btn.sec  transparent, --body label, 1px --hairline border;
          hover --panel-raised + gold border
```

Copy is verb + object, 2–4 words: "Book a demo", "Post a role", "Join CareerPassport". Never
"Learn more", never "Submit".

### Email capture

A 64px pill (`--panel-raised`, hairline border) holding a bare input and a gold button. Validates
`/^[^@\s]+@[^@\s]+\.[^@\s]+$/` on click or Enter; on success the button swaps to its `data-done`
label, the input goes read-only and its text turns gold. **No backend is wired** — this is a
front-end state change only. Point it at the real endpoint.

---

## Page 1 — Homepage

`site/Homepage.html` · candidate-facing · **the most motion-heavy page in the set**

### Structure

Five tall folds plus a closing act. Fold heights are set in `vh` via a `--h` custom property:

| Fold | `--h` | Heading |
|---|---|---|
| f1 | 130 | The professional identity for ambitious people |
| f2 | 250 | Standing out isn't about saying more; it's about showing better. |
| f3 | 320 | When anyone can claim anything, proof is what sets you apart. |
| f4 | 260 | Your lived experience, turned into evidence packs |
| f5 | 150 | Let the experiences you've lived showcase who you really are. |

### The central device

**One passport object persists for the entire page.** It is not six sections that each happen to show
a passport — it is one object in one continuous scroll, moving through six states: it docks into the
hero figure's hand, opens to reveal an Experience Visa and collected stamps, flows through the
verification chart, and finally flies into a glowing ring in the closing frame.

The visual argument: **empty identity → lived experience → evidence → accumulated identity.**

### Motion architecture — read before changing anything

One `requestAnimationFrame` loop, one `frame()` function. It reads every fold's
`getBoundingClientRect()` in a batch at the top, **then** writes. *Keep that split* — interleaving
reads and writes causes layout thrash on every frame.

Global progress `g` is the sum of each fold's own pin progress:

```js
p_i = clamp(-rect.top / (rect.height - vh), 0, 1)
g   = Σ p_i                       // 0 → 5
```

Folds above the viewport contribute exactly 1, so the sum **is** `fold index + progress within that
fold`. Every animated value on the page is a pure function of `g`. Nothing runs on its own timer.

Helpers: `clamp` · `seg(v,a,b)` remap to 0–1 · `ease` in/out cubic ·
`win(g,a,b,f)` opacity window, up over `f` after `a`, down over `f` before `b`.

### Fold 2 — the crowd scene

A static crowd image (`assets/crowd-cp.jpg`) with the hero figure composited in front, and floating
**claim cards** — the near-identical assertions everyone makes.

Rules that took several rounds to settle, worth preserving:

- **Two cards at a time**, one left, one right.
- They occupy two defined regions of the crowd image only, never the full frame.
- They **replace one at a time**, never both together.
- A new card's position must be **≥10px** from the position it replaces.
- Never directly behind the hero figure — offset left or right.
- Positions are held as **percentages of the crowd image**, not the viewport, so the composition is
  identical at any screen size.

### Fold 4 — the Companion loop

A flow chart (sources → Companion node → passport) with a connector line whose length is
**measured every frame**, because the passport ducks as the fold advances. An earlier build drew it
as a fixed SVG path at 132% of the box height; it overshot into empty space. Do not reintroduce a
constant here.

Inside the Companion box, an 8-step loop runs on scroll:

```
1 Connecting to your existing sources          → memory   (dots feed a database icon)
2 Growing your Companion memory                → memory   (icon centres and pulses)
3 Talking, listening, nudging                  → talk     (empty chat bubbles rise)
4 Suggesting a journey to show what you can do → talk
5 Collecting the evidence you produce          → scan     (sweep line down a document)
6 Verifying it with live interaction           → live     (viewfinder, REC dot, level meter)
7 Earning the stamp for the skill you proved   → stamp    ("Product designer", held longer)
8 Writing the evidence back into memory        → "One loop completed"
```

The chat visual behaves like a real chat: newest message enters from the bottom and pushes earlier
ones up; the newest is never cropped; the topmost fades at the upper edge.

---

## Page 2 — For Companies

`site/For Companies.html` · hiring managers · **the most recently reworked page**

### Architecture — different from the other two, deliberately

Every section is an **ordinary block in the document flow**. Nothing is viewport-pinned except one
section, and no band heights are computed.

This is a correction. An earlier build (kept as `site/For Companies v2 - pinned folds.html`)
pinned every fold to the viewport and computed per-fold bands. The result: headings slid under the
header, panels disagreed about their available space, and each section behaved by its own rules —
because it did. The rebuild follows the design-handoff artboards, where the header sits in normal flow
and content starts a fixed distance below it.

One grid governs the page:

```css
--gut:     clamp(20px,5vw,72px)     /* gutters */
--measure: 1296px                   /* content width = 1440 − 2×72 */
--copy:    664px                    /* hero copy column */
--sec:     clamp(96px,13vh,152px)   /* vertical rhythm between sections */
--hdr:     83px                     /* measured at runtime, see Shared chrome */
```

### Sections

**01 · Hero** — eyebrow "Tell us who you need.", `h1` "Meet the people **worth your time.**"
Beside it, a looping video of an open-plan office of identical occupied desks with one empty chair lit
by a spotlight.

The video is portrait (1248×1656) in a landscape slot, so **cropping is explicit**:

```js
FRAME_TOP = 0.45   // lands on the occupied-desk field; the atrium fills the top third
LIFT_PX   = 50     // raises it a further 50px
--overscan: 1.34   // draws the plate wider than the slot so the source's own white
                   // feathered vignette falls outside the frame
```

`--vy` is written from a measured box. Two guards matter: the function **returns early** if the box
has no size or if `excess <= 0`, because a degenerate measurement would otherwise cache a wrong value
that nothing recomputes. The first measurement is taken on a `requestAnimationFrame` after layout,
not during script execution. Grade: `brightness(.78) contrast(1.14) saturate(.86)` — the source is a
bright warm-white render and needs sitting down onto the near-black page.

**02 · Companies strip** — a continuous marquee of logo slots, duplicated once for a seamless loop,
paused on hover. **Seven empty `image-slot` placeholders await real partner logos.**

**03 · Chapter opener** — "Five moves from one sentence to one good conversation." Announces the
pinned stage so it does not arrive cold.

**04 · The process, pinned** — the one pinned section. A sticky stage fills the viewport: the
component for the current step on the left, the argument on the right, a step rail on the far edge.
Scrolling advances the step; the stage never moves, only its contents change.

| Step | Verb | Left pane |
|---|---|---|
| 01 | Define | 5 blueprint cards (Role · Competencies · Journey · Evaluation · Communications) |
| 02 | Design | vertical 5-stage journey rail + product-recording slot |
| 03 | Activate | timestamped agent activity log + integration chips |
| 04 | Evidence | claim cards over the cream evidence pack with its VERIFIED stamp |
| 05 | Decide | the interview brief |

```js
SVH_PER_STEP = 165   // section height = N × 165svh
p = clamp(-rect.top / (rect.height - pinHeight), 0, 1)
i = min(N-1, floor(p * N))
```

**Measure the pin, not the window,** for viewport height — the pin is exactly one viewport tall,
which is both self-consistent and correct in hosts that size the frame to the whole document.

Within step 02 the rail runs its own sub-clock, walking a dot from stage to stage. Two subtleties:

- The dot's Y comes from the **active row's measured centre**, and its X from a single `--spine`
  variable that the line, the row markers and the dot all read. Centred by construction, not by a
  tuned offset. Verified: dot centre 5.5px against spine centre 5.5px.
- The five stages finish by **90%** of the step (`t = min(1, sub/0.9)`) with a `1e-6` epsilon on the
  floor. Without the epsilon, `0.36 × 5 − 1` evaluates to `0.7999999999999998` and stage 5 is
  **unreachable**.

**05 · Testimonials as boarding passes** — a quote coupon and a perforated stub carrying role and a
metric, with punched notches. Cards reveal in sequence, 0.11s stagger.
**All three are placeholders** (`[Placeholder]`, `[Name]`) — I decline to invent customer quotes.

**06 · The difference** — 6 capabilities × 4 categories, our column lifted in gold. Below 1199px a
script **generates** a stacked block-per-capability reading *from the table itself*, so the two
presentations cannot drift apart.

**07 · Closing** — the homepage's hero figure standing in a glowing ring with the passport in his
open palm, same navy/gold vocabulary. Everything scales from one `--figH` on the shared ancestor
(`.figwrap`), so figure and passport track together at any width. Palm position: 84.5% across,
31.5% down the figure's own box.

---

## Page 3 — For Recruitment Partners

`site/For Recruitment Partners.html` · agencies and headhunters

### Architecture — the older pinned-fold model

**This page still runs the pinned-fold system** that For Companies moved away from. It loads
`cp-shared.css` and `cp-page.js`; six `.fold` sections each hold a sticky pin, and one persistent
panel on the right cross-fades its contents fold by fold.

**This is the main outstanding inconsistency in the site.** See *Known gaps*.

### Folds

| Fold | Panel label | Heading |
|---|---|---|
| f1 | PRIVATE TALENT NETWORK | Build your recruitment business in the AI era. |
| f2 | TALENT INTELLIGENCE | The best candidate for your next role may already be someone you know. |
| f3 | APPLICANT PROCESSING | Applicant processing, not applicant tracking. |
| f4 | AGENTIC WORKFORCE | Recruiting that keeps moving without you touching every step. |
| f5 | COLLABORATION | Your database is private. Your opportunities don't have to be limited by it. |
| f6 | CLIENT VIEW | Give your clients more than CVs. |

Closing act: "Your candidates. Your relationships. **Your business.**"

### The central device

A **private talent network** persists across all six folds: a constellation of candidate nodes inside
a dashed boundary marked PRIVATE TALENT NETWORK, with client squares and an "outside" region beyond
it. It evolves — conversational search lighting up matching nodes, an ATS board collapsing into a
list of actions, an agent log pausing for recruiter approval, then the private/CareerPassport
boundary with three entry points, a collaboration agreement (role owner, candidate owner, fee, split,
replacement terms) and a Submitted → Interviewing → Joined → Invoice → Payout pipeline.

### Shared fold engine (`cp-page.js`)

Drives the progress bar, mobile nav, reveal-on-enter, the persistent panel's cross-fade, rolling log
lists, and email capture. Each `.fold` declares `data-bar` and `data-meta` for the panel's title bar;
elements inside declare `data-step` (and optionally `data-off`) as fold-progress thresholds for
staged reveals.

---

## Interactions & behaviour

### Reveal on enter

`IntersectionObserver` at `threshold: .14`, `rootMargin: '0px 0px -8% 0px'`. Elements carry `.rv`
and gain `.in`: `opacity 0→1`, `translateY 20px→0` over `.7s/.8s`. Unobserved after firing — reveals
do not replay. Sibling groups stagger via `--i` at `.11s` per position.

**Content is visible by default**; the animation is opt-in. A `prefers-reduced-motion` block disables
all animation and forces `.rv` visible.

### Navigation

Standard `<a href>` between the three pages. All in-page CTAs anchor to the closing section. Smooth
scroll with `scroll-padding-top: calc(var(--hdr) + 20px)`.

### Responsive

| Breakpoint | Behaviour |
|---|---|
| ≥1200px | as drawn |
| ≤1199px | pinned stage stacks (component over copy), step rail becomes a horizontal marker row, two-column rows collapse, comparison table becomes generated blocks, all in-stage components tighten |
| ≤900px | nav → burger, hero stacks, closing act centres |
| ≤767px | further component tightening, boarding-pass stubs go horizontal |
| ≤560px | blueprint cards drop from 3-up to 2-up |

**Media queries must stay in ascending-specificity source order** — 1199 → 900 → 767 → 560. Equal-
specificity rules resolve by source order, so a 560px rule placed before a 767px rule is simply
overridden. This was a live bug.

**Panes in the pinned stage cannot scroll.** Anything that does not fit is lost, so every in-stage
component has explicit tightening at 1199px and 767px. Verified: no pane clips at 540px viewport
height.

### State

Minimal and entirely local — no store, no router, no fetch:

- current step index in the pinned process (derived from scroll, not stored)
- rail sub-stage within step 02 (derived)
- email-capture done/not-done per form
- mobile nav open/closed
- reveal fired per element

---

## Assets

| File | Type | Used by | Notes |
|---|---|---|---|
| `hero-lift.mp4` | video | Homepage hero | **chroma-keyed at runtime on a canvas.** Production should ship a pre-keyed video with alpha to save CPU |
| `hero-hall.mp4` | video 1248×1656 | Companies hero | portrait, autoplay + loop + muted + playsinline |
| `hero-hall-poster.jpg` | image | Companies hero | poster frame; the visible fallback if autoplay is refused |
| `hero-cp.png` | image 517×1280 | Homepage, Companies closing | the hero figure, transparent background, open palm |
| `uploads/Crowd-6ce23065.png` | image | **Homepage fold 2 — the live crowd plate** | referenced from a script string, not an `<img>` tag, which is why it is easy to miss when moving files |
| `crowd-cp.jpg` | image | — | an earlier crowd plate, superseded |
| `crowd-hall.mp4` | video | — | unused, kept |
| `hero-arm.png`, `hero-body.png` | image | — | earlier split-layer hero, superseded by `hero-cp.png` |
| `cowork-hall.png`, `cowork-b.png` | image | — | co-working stills, superseded by `hero-hall.mp4` |

**Provenance:** all imagery was generated for this project. No stock, no third-party assets. **No logo
file exists** — the wordmark is set in type everywhere a mark would go.

`image-slot.js` provides `<image-slot>`, a drag-and-drop placeholder. Live slots awaiting real
material: **7 partner logos** in the Companies strip, and **1 product recording** beside the journey
rail (`cmp-journey`).

Dropped images are stored as base64 in `.image-slots.state.json` beside the HTML. **That file is
included and must be kept** — it is a hidden dotfile, so check your unzip tool did not skip it.
Currently it holds one image, on the v3 variant (`v3-prod-1`); every slot on the three live pages is
still empty.

The component writes through a host API (`window.omelette.writeFile`) that exists only in the
authoring environment. **Outside it, dropping an image works for the session but will not persist.**
In the target codebase these should become ordinary `<img>` tags with real files.

---

## Version history

| File | Status | Why it exists |
|---|---|---|
| `site/For Companies.html` | **current** | Flow-layout rebuild on the artboard grid, with one pinned process stage. Content the client preferred, in a structure that holds together |
| `site/For Companies v1.html` | superseded | First build. Pinned-fold model, shared `cp-shared.css` |
| `site/For Companies v2 - pinned folds.html` | superseded | The version whose viewport pinning caused headings to slide under the header |
| `site/For Companies v3.html` | reference | A getblue.com-inspired direction. **Source of the hero video treatment and the comparison table**, both since lifted into the current page |
| `site/Claim Field.html` | exploration | Standalone claim-field study that informed the homepage crowd scene |

---

## Known gaps and recommended next steps

### A note on CSS hygiene

The Companies page went through several rounds of dead-rule removal as sections were replaced.
Regex-based sweeps over CSS **over-matched twice** and silently removed live rules: once taking the
whole footer block (a lazy `[\s\S]*?` from `.trace{` ran to the next `color:var(--faint)}`, which was
inside `.fcr`), and once taking `.wait`, `.brandline` and `.nav a.here`.

Both are fixed. If you refactor the stylesheet, two audits catch this class of bug cheaply:

```
1. classes used in markup with NO rule anywhere        → fully-deleted rules
2. classes whose ONLY rules sit inside @media blocks   → a responsive override with no
                                                          base rule is a deletion scar
```

Audit 2 is the sharper signal: you do not write `height: auto` in a media query unless something
set a height. Both audits currently return clean on all three pages.

**Content**
1. **Testimonials are placeholders.** Three boarding passes carry `[Placeholder]` quotes and `[Name]`
   attributions. Real quotes, names and companies drop straight in.
2. **Seven logo slots are empty** in the Companies strip.
3. **One product recording slot is empty** beside the journey rail.
4. **No logo file.** The wordmark is type in three places.

**Architecture**
5. **The Partners page still uses the old pinned-fold model.** The Companies page was rebuilt onto
   flow layout precisely because pinning caused the header-overlap and band-disagreement problems.
   The Partners page has the same architecture and likely the same latent issues. **Recommend
   rebuilding it on the current page's grid** — and note that if it is rebuilt, `cp-shared.css` and
   `cp-page.js` become dead files.
6. **Grammar in shipped copy:** "Hiring manager make the judgment." appears in the trust block on the
   Companies page. Kept verbatim from the source document, but it reads as an error.

**Performance**
7. The homepage chroma-keys `hero-lift.mp4` on a canvas every frame. Ship a pre-keyed video with an
   alpha channel instead.
8. Lazy-load the crowd image and defer the homepage's hero baking; the homepage is 112 KB of HTML
   before assets.
9. Geist loads from Google Fonts. Self-host the `.woff2` files.

**Not built**
10. **No backend.** Email capture is a front-end state change only. No form endpoint, no analytics,
    no consent/cookie handling.11. **Accessibility not audited.** Decorative layers carry `aria-hidden`, the video has a descriptive
    `aria-label`, and reduced-motion is handled — but no screen-reader pass, no keyboard-trap audit,
    no contrast audit has been done.
12. **Real-device testing not done.** All measurements are from a desktop browser at various
    viewport sizes. Mobile Safari's autoplay and `svh` behaviour in particular should be checked by
    hand.
