# Local deltas

Changes that live **only in `src/`** and have no counterpart in the Claude Design files
under `site/`.

## Why this file exists

The project has two sources of truth:

- **Claude Design** owns the design. Exporting from it overwrites `site/`.
- **`src/`** is derived from `site/` — the page CSS and scroll drivers are carried over
  byte-for-byte, and the section markup is sliced from source programmatically.

So the normal import is *destructive to anything tuned in code*: re-deriving `src/` from a
fresh `site/` silently reverts it. Every such change is registered below, and
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

## D1 — Halved "Hiring blueprint is being prepared" dwell

| | |
|---|---|
| **File** | `src/scripts/companies.js` |
| **Design file still says** | `prep.classList.toggle('on',p>=.478&&p<.625)` |
| **Commit** | `cf324ff` |
| **Status** | Active — not reflected in Claude Design |

**What.** The prep shimmer's window was `p` .478–.625. It is now .478–.5515, half the
original .147 span. The whole entrance cluster below it — blueprint panel, tabs, `+ Add
lever`, question load and fill — moves earlier by the same `PREP_CUT = .0735`.

**Why.** The shimmer held alone from .478 to ~.60, roughly a thousand pixels of scroll,
before the first tab appeared. Cutting the prep short *without* also moving the entrance
cluster would open a hole where the shimmer used to be.

**Deliberately not changed.** The review timeline from `.700` onward — the cursor
choreography that reads the questions, walks the tabs, opens the lever picker and accepts.
Each of its windows names exactly one cursor target, and shifting it would only move the
freed slack to the end of the act, where the blueprint sits accepted and idle.

**How to re-apply.** In the `act 2` block, replace the literals with the named constants:

```js
var PREP_IN=.478, PREP_OUT=.5515, PREP_CUT=.0735;
box.classList.toggle('big',p>=PREP_IN);
prep.classList.toggle('on',p>=PREP_IN&&p<PREP_OUT);
bp.classList.toggle('on',p>=.605-PREP_CUT&&g<.452);

var tabsOn=p>=.60-PREP_CUT;
tabs.forEach(function(el,i){ el.classList.toggle('vis',tabsOn&&p>=.60-PREP_CUT+i*0.018) });
if(addTab) addTab.classList.toggle('vis',tabsOn&&p>=.654-PREP_CUT);
var qLoading=p>=.64-PREP_CUT&&p<.72-PREP_CUT;
var qFilled=p>=.72-PREP_CUT;
questions.forEach(function(el,i){
  el.classList.toggle('vis',p>=.63-PREP_CUT+i*0.024);
  el.classList.toggle('filled',qFilled);
});
```

Leave `ready.classList.toggle('on',p>=.73&&p<.82)` and everything after it alone.

**How to verify.** Sweep the fold and read the live DOM: prep should run .478–.553, the
first tab appear at ~.528, the panel crossfade at ~.540, and questions fill by ~.665 — with
no scroll position where the prep is gone and nothing has arrived.

---

## D2 — Stray `}` dropped from the Partners stylesheet

| | |
|---|---|
| **File** | `src/styles/partners.css` |
| **Design file still says** | an orphan `}` after the `@property` block, before `.net{` |
| **Commit** | `7b1c3e6` |
| **Status** | Active — worth fixing in Claude Design, which would retire this entry |

**What.** `site/For Recruitment Partners.html` has a stray `}` that closes nothing,
introduced alongside the `@property` block in the last design pass. It is dropped from the
extracted CSS.

**Why.** Browsers skip an orphan brace and carry on, which is why the design file still
renders — but it is invalid CSS and PostCSS rejects the whole sheet, failing the build.

**How to re-apply.** After extracting `partners.css`, delete the lone `}` that sits between
`@property --r{...}` and `.net{`. Nothing else changes; it has no visual effect.

**Retire this entry** by deleting that brace in the design file — then the extraction is
clean and no delta is needed.
