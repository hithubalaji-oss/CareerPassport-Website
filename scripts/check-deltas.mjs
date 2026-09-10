#!/usr/bin/env node
/**
 * Verifies every change registered in LOCAL-DELTAS.md is still present in src/.
 *
 * Re-deriving src/ from a fresh Claude Design export is destructive to anything tuned in
 * code — the page CSS and scroll drivers are carried over byte-for-byte, so a change with
 * no counterpart in site/ is silently reverted. Run this after every import; anything
 * reported MISSING must be re-applied from its note in LOCAL-DELTAS.md before pushing.
 *
 * Each delta asserts two things where it can:
 *   present — a marker that exists only in the implemented version
 *   reverted — the design file's original, which appearing in src/ proves the import won
 *
 * `upstreamFixed` is the opposite signal: the design file no longer carries the problem,
 * so the delta has done its job and its entry can be deleted.
 */
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => (existsSync(join(root, p)) ? readFileSync(join(root, p), 'utf8') : null);

const DELTAS = [
  {
    id: 'D1',
    title: 'Invalid CSS dropped from the Partners stylesheet',
    file: 'src/styles/partners.css',
    design: 'For Recruitment Partners.html',
    // homepage.css carries a fourth fragment; asserted separately below
    extraFiles: ['src/styles/homepage.css'],
    extraPresent: ['NOTE: the prototype leaves a stray "}" here'],
    present: [
      'NOTE: the prototype has a stray "}" here',
      'NOTE: the prototype has three dangling ".swdeck," fragments here',
      'NOTE: the foil rule this comment describes is gone',
    ],
    // each malformed fragment, whose reappearance means the import won
    reverted: [/initial-value:0\}\s*\n\s*\n\s*\}\s*\n/, /\.swdeck,\}/],
    upstreamFixed: (designSrc) =>
      !/initial-value:0\}\s*\n\s*\n\s*\}\s*\n/.test(designSrc) && !/\.swdeck,\}/.test(designSrc),
  },
  {
    id: 'D2',
    title: '--hdr raised to the header\'s real height',
    file: 'src/components/chrome/Header.astro',
    design: 'For Recruitment Partners.html',
    present: ['if (measured > declared) root.style.setProperty', 'Number.isFinite(declared)'],
    // the design declaring its real height would make the guard a no-op
    upstreamFixed: (designSrc) => !/--hdr:60px/.test(designSrc),
  },
  {
    id: 'D3',
    title: 'Mobile graphics-memory budget',
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    present: ['HV_N=MOB?20:40', "var cw=MOB?258:515", 'Crowd-6ce23065-1280.png'],
    extraFiles: ['src/styles/homepage.css'],
    extraPresent: ['PERF: both are sized past the viewport'],
    // the export budgeting these itself would make the delta unnecessary
    upstreamFixed: (designSrc) => /HV_N\s*=\s*[^4]/.test(designSrc),
  },
];

const hit = (src, needle) =>
  needle instanceof RegExp ? needle.test(src) : src.includes(needle);

let failed = 0;
let retirable = 0;
console.log('Checking local deltas against src/\n');

for (const d of DELTAS) {
  const src = read(d.file);
  const designSrc = read(d.design);

  if (src === null) {
    console.log(`  MISSING  ${d.id}  ${d.title}\n           ${d.file} does not exist`);
    failed++;
    continue;
  }

  const absent = d.present.filter((m) => !hit(src, m));
  for (const [i, extra] of (d.extraFiles ?? []).entries()) {
    const es = read(extra);
    const marker = d.extraPresent[i];
    if (es === null || !hit(es, marker)) absent.push(`${marker}  (in ${extra})`);
  }
  const returned = (d.reverted ?? []).filter((m) => hit(src, m));

  if (absent.length || returned.length) {
    failed++;
    console.log(`  MISSING  ${d.id}  ${d.title}`);
    for (const m of absent) console.log(`           not found in ${d.file}: ${m}`);
    for (const m of returned) console.log(`           design original is back in ${d.file}: ${m}`);
    console.log(`           re-apply from LOCAL-DELTAS.md, section ${d.id}`);
  } else {
    console.log(`  ok       ${d.id}  ${d.title}`);
  }

  if (designSrc && d.upstreamFixed?.(designSrc)) {
    retirable++;
    console.log(`           note: ${d.design} no longer carries the original — this delta can be retired`);
  }
}

console.log('');
if (failed) {
  console.log(`${failed} of ${DELTAS.length} delta(s) missing. Re-apply before pushing.`);
  process.exit(1);
}
console.log(`All ${DELTAS.length} delta(s) present.${retirable ? ` ${retirable} can be retired.` : ''}`);
