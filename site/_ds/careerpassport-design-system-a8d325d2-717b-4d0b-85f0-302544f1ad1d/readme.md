# CareerPassport Design System

CareerPassport is a verified-career-record product: a candidate claims their employment and
education history once, the organisations named on it confirm the facts, and the resulting record
travels with them from application to application. Two surfaces are represented here — the public
marketing site and the candidate app — plus the developer-facing snippets that appear on both.

## Sources given

| Source | What it was | Access |
|---|---|---|
| Brand & UI spec (pasted into chat, 233 lines) | Ground truth for type, layout, elevation, shape and the component inventory. Derived from Vercel's **Geist** system; its light ink-on-white palette has since been **replaced** at the user's direction. | Pasted text only — no file, repo or Figma link |
| Brand board screenshot (`uploads/pasted-1787311322686-0.png`) | "Emerald Transit — trust · growth · calm authority": a dark board with the four-swatch emerald palette, an app-icon lockup and a plane-in-viewfinder mark. Source of the current palette and the dark-first direction. | Image only — no vector assets supplied |
| Company description | The single line "CareerPassport" | — |

No codebase, Figma file, deck, screenshot or asset archive was supplied. Everything visual in this
project traces to the pasted spec; all **product content** (page structure, copy, screen flows,
customer names) is written for this system and should be replaced with real product material when it
exists. The spec's own component inventory — nav bar, nav link, four button shapes, category pill,
circular icon button, text input, feature card (flat + elevated), pricing card, code block, logo
strip, hero band, CTA band, footer — is built in full and nothing outside it was invented, with two
exceptions listed under *Intentional additions*.

### Attribution note
The pasted spec describes Vercel's Geist visual language. This project reproduces the **spec's
generic foundations** (ink-on-white palette, tight-tracked Geist type, hairline cards, pill-vs-square
button logic) under the CareerPassport name. It contains no Vercel logo, wordmark, product copy or
proprietary illustration. If CareerPassport is not licensed to run this closely to Geist, treat the
palette and the mesh gradient as the first things to change.

### Missing: logo
No logo or brand mark was provided, and none was drawn. Everywhere a mark would go, the system sets
the word **CareerPassport** in Geist 600 with −0.6px to −1.4px tracking (see `guidelines/brand-wordmark.card.html`,
`NavBar`, `Footer`, `thumbnail.html`). Supply an SVG and it drops into those three places.

### Font substitution
The spec names **Geist Sans** and **Geist Mono**; no binaries were supplied. `tokens/fonts.css`
loads both from Google Fonts over the network rather than shipping local `@font-face` files, so the
compiler reports **0 fonts**. **Please send the Geist `.woff2` files** (or confirm the CDN is fine)
and this becomes a real self-hosted font stack. `Arial` is the declared sans fallback, per spec.

---

## Content fundamentals

The spec covers visuals only; the voice below is set by this system and is open to correction.

- **Person.** Second person for the reader, first-person plural only for commitments the company
  makes: "Your work history, proven once." / "We only use this to arrange the call." Never "I".
- **Register.** Plain, declarative, specific. Sentences state a fact and stop: "Free for candidates,
  always." Claims carry a number when one exists ("nine days out of every offer"), and none when it
  doesn't.
- **Casing.** Sentence case everywhere — headlines, buttons, nav, table headers. The only uppercase
  is the mono eyebrow (`HOW VERIFICATION WORKS`) and status tags (`VERIFIED`, `PENDING`).
  No Title Case Buttons.
- **Punctuation.** Full stops in body copy and subheads; none on buttons, labels, eyebrows or table
  cells. Em dashes sparingly, en dashes for ranges ("2019 — 2022"). No exclamation marks.
- **Button copy.** Verb + object, two to four words: "Get your passport", "Book a demo",
  "Request verification", "Send request", "Copy link". Not "Learn more", not "Submit".
- **Eyebrows** read like spec-sheet labels: `VERIFIED CAREERS`, `STEP 01`, `RECORD DETAIL`,
  `COMMON QUESTIONS`. Two to four words, no punctuation.
- **Numerals.** Digits always, including under ten ("5 recruiter seats", "3 / 4 VERIFIED"). Dates as
  "14 Aug 2026". Money without decimals ("$40").
- **Trust language.** Say what is confirmed and by whom; never imply more. "Dates, title and
  institution. No documents, no salary." Avoid "trusted", "seamless", "revolutionise", "empower".
- **Emoji: never.** Not in UI, not in marketing copy, not in empty states. Status is carried by a
  Lucide glyph plus a word.
- **Vibe.** Documentation that happens to be selling something — engineered, exact, unhurried.

---

## Visual foundations

**Palette — dark first.** The system runs on a near-black canvas `--void` #0a0c0b with panels at
`--panel` #121514 and `--panel-raised` #181c1a. Text steps down the ladder `--ink` #f4f7f5 →
`--body` #a6afab → `--mute` #7a8480 → `--faint` #5b6562; ink is never pure white. The single accent
is **Emerald Transit**: `--emerald-deep` #0c3c2e · `--emerald-mid` #15664b · `--emerald` #49de80 ·
`--mint` #a7f3c8 · `--emerald-tint` #f2fcf5. `--emerald` is the action colour — primary buttons fill
with it and set their label in `--emerald-deep` — and also the link, focus and verified signal
(`--success` aliases it). Semantics are lifted for dark surfaces: error #f2544a on a #2b1614 wash,
warning #e8a93a on #2a2113. No second hue exists anywhere in the system.

**Type.** Geist Sans for everything, Geist Mono for exactly two roles — code, and uppercase section
eyebrows. Weight is binary-plus-one: 600 headings, 500 labels and buttons, 400 body. No italic, no
light, no black. Display tracking is aggressively negative and scales with size: −2.4px at 48px,
−1.28px at 32px, −0.4px at 20px, −0.28px on `label-sm`; body sits at 0. Line heights are tight
(48/48 at hero).

**Spacing and layout.** 4px base; 4 · 8 · 12 · 16 · 24 · 32 · 40 · 64 · 96 · 128. Card interiors
24–32px, section bands 96–128px vertical. Centred 1200px container with 24px gutters. Feature grids
run 2-, 3- and 4-up and collapse to one column under 640px. Whitespace is structural — the canvas
and band padding do the separating, not background colour. Button padding is horizontal only; height
comes from the box (48px pills, 32px chrome squares). The nav is the only fixed element (`sticky`,
z-index 20); nothing else pins.

**Backgrounds.** No photography, no textures, no repeating patterns, no full-bleed imagery. The page
is flat #0a0c0b with #121514 panels on it. Alternating panels use `--hairline-soft` #1c211f, not a
tint of the accent. The **hero mesh gradient** — deep-emerald, emerald and mint radial blooms at
~40px blur, reading as a glow rather than a wash on black — is the entire decorative system, and
appears **once per page**, in the hero (plus the app's sign-in screen). Interior pages pass
`mesh={false}`. The two-stop trio (transit / growth / signal) walks the same emerald ramp and is for
illustration washes only.

**Borders, cards and shadow.** The 1px hairline `--hairline` #262c29 is the structural workhorse:
every card, input, divider, table row and band separator. Cards are `--panel`, 12px radius (16px for
pricing), 24px padding, flat by default. On black, depth reads from the surface step and the hairline
far more than from shadow: flat hairline; whisper `0 1px 1px rgba(0,0,0,.5)`; floating
`0 2px 2px` + `0 12px 28px -6px` plus an inset hairline, for menus, modals and one featured tile.
Never a heavy drop shadow, never an emerald glow, never a coloured left border.

**Radii.** Bimodal by intent: 6px for functional chrome (nav/app buttons, inputs), 12–16px for
content cards, 64px for category tabs, 100px for marketing CTA pills, full circles for icon buttons
and avatars. A pill in the nav or a 6px square in a hero is a bug.

**Transparency and blur.** Used in exactly one place — the mesh gradient's blurred radial stops.
No frosted panels, no scrim overlays, no protection gradients over imagery (there is no imagery).
Modals dim with a low-alpha ink wash if needed; otherwise transparency is absent.

**Motion.** The spec documents no states, so motion is deliberately near-invisible: 120–180ms
`cubic-bezier(.4,0,.2,1)` on colour and border only. No entrance animation, no parallax, no bounce,
no easing showmanship.

**Hover and press.** Emerald fills brighten to #5ff293; panels lift one step to #1c211f;
nav links gain that same lift behind a fully-rounded hit area; links move to `--link-deep` (mint,
lighter on press — the inverse of a light theme) and gain an underline. Nothing scales or lifts on
hover — `--press-scale` 0.99 exists for touch feedback and is used sparingly. Focus is a 2px emerald
ring at 2px offset. Disabled is 40% opacity, no colour change.

**Imagery.** None supplied and none faked. Where a product image would sit, the system uses a
hairline card holding real interface content (a record list, a code block) — the spec's own device.
If photography is added later it should be dark, cool-toned and desaturated so the emerald stays the
brightest thing on the page.

---

## Iconography

- **Lucide** (`unpkg.com/lucide@0.454.0`), loaded from CDN and rendered at **16px in app chrome,
  18px in nav, 20px in specimen cards**, `stroke-width: 1.5`, `currentColor`. **This is a flagged
  substitution** — the source spec names no icon set and no icon files were supplied. Lucide was
  chosen for its thin, geometric, ink-on-white stroke, which matches the spec's line-weight
  illustrations. Swap the set if the real product uses another.
- No icon font, no sprite sheet, no PNG icons. No SVGs were drawn by hand for this system.
- Icons are always paired with a word except inside `IconButton`, which requires a `label`.
- Icons never carry brand colour; they inherit the text tier they sit in (`--text-mute` in lists,
  `--text-link` for verified states).
- Working glyph set in use: `badge-check`, `clock`, `file-text`, `building-2`, `graduation-cap`,
  `inbox`, `share-2`, `search`, `lock`, `log-out`, `more-horizontal`, `arrow-left`, `arrow-right`,
  `user-round`.
- **Emoji and unicode-as-icon: never.** The one non-Lucide glyph is the em dash used as a list
  bullet in `PricingCard`.
- `assets/` is empty by design: no logo, illustration or image files existed to copy in.

---

## Intentional additions

Two things exist that the spec does not name:

- **`Eyebrow`** (`components/typography/`) — the spec defines a `mono-eyebrow` type token and uses
  it as a section label everywhere, but names no component. One wrapper keeps the mono/uppercase/mute
  triple from drifting.
- **`StatusTag`** (inside `ui_kits/app/AppShell.jsx`, not exported as a primitive) — the app needs a
  verified/pending/expired chip. Left in the kit rather than promoted to `components/`, since the
  spec defines no badge or tag.

---

## Index

| Path | What |
|---|---|
| `styles.css` | Global entry point — `@import` list only. Consumers link this file. |
| `tokens/` | `fonts.css` · `colors.css` · `typography.css` · `spacing.css` · `radius.css` · `elevation.css` · `motion.css` · `base.css` |
| `guidelines/` | 19 specimen cards: Colors (7), Type (5), Spacing (2), Brand (5) |
| `components/buttons/` | `Button` (primary · secondary · primary-sm · ghost-sm), `CategoryPill`, `IconButton` |
| `components/navigation/` | `NavBar`, `NavLink` |
| `components/forms/` | `TextInput` |
| `components/surfaces/` | `Card` (flat + elevated), `PricingCard`, `CodeBlock` |
| `components/bands/` | `HeroBand`, `CtaBand`, `LogoStrip`, `Footer` |
| `components/typography/` | `Eyebrow` |
| `ui_kits/website/` | Marketing site — home, pricing, employers (click-through). See its README. |
| `ui_kits/app/` | Candidate app — sign-in, passport, requests, sharing. See its README. |
| `thumbnail.html` | Homepage tile |
| `SKILL.md` | Agent-Skills front matter for use outside this project |

Starting points registered: `Button`, `Card`, `NavBar`, `HeroBand`, plus both UI kit index pages.

## Rules of thumb

1. Light ink on near-black, with emerald as the only hue. If a surface needs a second colour to
   work, the layout is wrong.
2. Hairline before shadow. Flat is the default.
3. Pills for marketing CTAs, 6px squares for chrome. Never mixed in one context.
4. One mesh gradient per page, in the hero, behind nothing but a headline.
5. Mono is code and eyebrows. Nothing else.
6. Tight negative tracking on anything above 20px.
