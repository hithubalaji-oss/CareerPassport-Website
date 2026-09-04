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
    title: 'Halved "blueprint is being prepared" dwell',
    file: 'src/scripts/companies.js',
    design: 'site/For Companies.html',
    // the implemented version names its constants; the original inlined the literals
    present: ['PREP_OUT=.5515', 'PREP_CUT=.0735', 'p>=PREP_IN&&p<PREP_OUT'],
    reverted: ["prep.classList.toggle('on',p>=.478&&p<.625)"],
    upstreamFixed: (designSrc) => !designSrc.includes("p>=.478&&p<.625"),
  },
  {
    id: 'D2',
    title: 'Stray "}" dropped from the Partners stylesheet',
    file: 'src/styles/partners.css',
    design: 'site/For Recruitment Partners.html',
    present: ['NOTE: the prototype has a stray "}" here'],
    // the orphan brace sits between the @property block and .net{
    reverted: [/initial-value:0\}\s*\n\s*\n\s*\}\s*\n/],
    upstreamFixed: (designSrc) => !/initial-value:0\}\s*\n\s*\n\s*\}\s*\n/.test(designSrc),
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
