# CareerPassport marketing site — deploy bundle

Three static pages. No build step, no dependencies to install. Upload the contents of
this folder to the repository root (or drop the folder into Netlify) and the site runs.

## Contents

```
index.html                        homepage           (must stay named index.html)
For Companies.html
For Recruitment Partners.html
_redirects                        clean URLs for Netlify — see below
cp-shared.css                     shared layout (linked by Partners)
cp-header.css                     the header + footer chrome, all three pages
cp-page.js                        the fold/scroll engine (Partners)
cp-keys.js                        keyboard + spacebar scroll stops
image-slot.js                     drag-and-drop image placeholders
assets/fingerprint.png            passport chip
assets/hero-lift.mp4              homepage hero video
uploads/Crowd-6ce23065.png        homepage crowd scene
_ds/careerpassport-design-system-.../tokens.bundle.css   design tokens
```

## Two things that matter on deploy

**Serve over HTTP.** Opening the files from disk (`file://`) degrades two things, because
browsers treat `file://` as an opaque origin: the homepage's crowd scene can fail to
composite, and dropped placeholder images do not load. Any static host is fine.

**Fonts come from Google Fonts** (Poppins, Inter, Geist Mono) over the CDN. Offline they
fall back to Helvetica/Arial and the tight negative tracking will look wrong. To self-host
later, drop the `.woff2` files in `assets/fonts/` and replace the `@import` at the top of
`tokens.bundle.css` with local `@font-face` rules — no other change is needed.

## Clean URLs

`_redirects` is Netlify's format and maps:

```
/for-companies             → /For%20Companies.html
/for-recruitment-partners  → /For%20Recruitment%20Partners.html
```

The pages link to each other by filename, so they work with or without it. On a host that
is not Netlify (GitHub Pages, S3, nginx) `_redirects` is ignored and the filename URLs
still work — translate it to that host's own rewrite syntax if you want the short paths.

## Not included, deliberately

`Claim Field.html` and the three `For Companies v1/v2/v3` variants are frozen explorations,
not live pages. Nine unused files in `site/assets/` (older crowd and hero plates) are also
left out. They remain in the project if you need them.

## Image placeholders

The `<image-slot>` elements are authoring placeholders: dropping an image works for the
session but does not persist outside the design tool. Replace each with a real `<img>` when
you have final artwork — the slot ids say what belongs in each one.

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

All three pages, so navigation between them works as designed:

| Route | Source | Component |
|---|---|---|
| `/` | `index.html` | `src/pages/index.astro` |
| `/for-companies` | `For Companies.html` | `src/pages/for-companies.astro` |
| `/for-recruitment-partners` | `For Recruitment Partners.html` | `src/pages/for-recruitment-partners.astro` |

The Partners page was rebuilt in the 8 Sep pass, resolving the architectural inconsistency
the handoff flagged: its six pinned folds over one persistent panel are gone. It still loads
`cp-shared.css` and `cp-page.js` for the shared fold engine and reveal behaviour, alongside
the new `cp-header.css` and `cp-keys.js`.

Typography changed in that pass too: **Poppins** for display and **Inter** for body, with
Geist Mono retained for code and eyebrows. Tokens arrive as one bundled `tokens.bundle.css`
rather than nine render-blocking requests.

### How it is put together

```
src/
  layouts/Base.astro          document shell; loads the bound design system
  pages/                      one file per route
  components/
    chrome/                   header, footer, the shared nav list
    homepage/                 ground, the passport, the five folds, outro, video overlay
    companies/                ground, hero (the logo strip lives inside it), process,
                              comparison, close
    partners/                 ground, main, outro
  styles/
    ds/                       the bound design system, copied verbatim
    homepage.css              each page's own stylesheet, carried over verbatim
    companies.css
  scripts/
    homepage.js               each page's driver, carried over verbatim
    companies.js
    cp-page.js                the shared fold engine the Partners page runs on
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

### Keeping the repo in step with Claude Design

Claude Design owns the design; exporting from it overwrites the root `.html` files and the
shared `cp-*.css` / `cp-*.js`, and `src/` is derived from those — page CSS and scroll drivers
carried over byte-for-byte, section markup sliced programmatically. That makes an import **destructive to anything tuned in code**: a change
with no counterpart in `site/` is silently reverted.

Anything in that category is registered in [`LOCAL-DELTAS.md`](LOCAL-DELTAS.md), with why it
exists, how to re-apply it and how to verify it. After every import:

```bash
npm run check          # both checks below
```

`npm run check:design` first, on the export itself. Pages get renamed in Claude Design —
`Homepage.html` may arrive as `index.html` — and two things then go wrong: the import reads
these by path, and a rename whose links do not follow leaves the design prototypes with
broken navigation and an artboard wrapper pointing at nothing. The shipped site is insulated
(routes come from `src/pages/` filenames and the nav from `nav-links.ts`, so no design
filename reaches the build), but the design side breaks silently. The check reports the name
each page arrived under and verifies every internal link and `.dc.html` wrapper resolves. To
teach it a new name, add an alias to `PAGES` in `scripts/check-design-files.mjs`.

Then `npm run check:deltas`, on the re-derived `src/`.

Each delta asserts both a marker that exists only in the implemented version and the design
file's original, whose reappearance proves the import won. Anything reported MISSING must be
re-applied before pushing. The checker also flags a delta whose problem has since been fixed
upstream, so the entry can be retired rather than carried forever.

The import loop is: export from Claude Design → commit to the repo → diff against the
previous commit → `npm run check:design` → re-derive `src/` → `npm run check:deltas` →
re-verify against the new prototypes → push.

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

- **Document height matches exactly** - Homepage 11589px, For Companies 21829px, Partners 9210px at 1440px.
- **Box geometry matches exactly**: the fixed atmosphere layers, header, the pinned hero
  and its sticky pin, the Companion composer, the logo track, the process section and its
  pin, the comparison, closing, footer and the wordmark all agree to the pixel.
- **Verified at 1440 / 1024 / 768 / 390** - burger swap,
  the comparison collapsing to six generated blocks, 7 logo slots duplicated to 14, the
  footer nav staying a row, and document height at every width.
- **Behaviour matches** - email capture, the homepage handle field and waitlist, and the
  mobile drawer.
- **Screenshot diff**: the Homepage is **pixel-identical** (0.000%). For Companies differs
  by 2.28% against a control of 2.31% - the prototype's difference from *itself* across two
  loads - because the departures board behind the process stage flips on a random clock.
  Measuring that control is what distinguishes non-determinism from a porting regression.

**One real bug found in the prototypes.** Neither `site/Homepage.html` nor
`site/For Companies.html` declares `<meta charset>`. Served without a charset header they
render `resume` as mojibake and mangle the middle dot in "05 STAMPS - 34 ARTIFACTS". The
Astro build declares UTF-8, so it renders correctly; the first screenshot comparison
flagged the difference and it turned out to be the prototype at fault, not the build. Worth
adding the meta tag to the design files so they are correct when opened directly.

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

