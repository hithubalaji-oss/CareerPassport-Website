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
