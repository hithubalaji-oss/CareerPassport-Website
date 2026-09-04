#!/usr/bin/env node
/**
 * Sanity-checks the Claude Design export in site/ before it is re-derived into src/.
 *
 * Two things go wrong when pages are renamed in Claude Design:
 *
 *   1. A live page arrives under a new name (Homepage.html -> index.html). The import
 *      reads these by path, so it needs to know which name each page came in under.
 *   2. The rename lands but the links pointing at that page do not, leaving the design
 *      prototypes with broken navigation when served directly — and the .dc.html artboard
 *      wrapper showing an empty iframe.
 *
 * The shipped site is insulated from (1): routes come from src/pages/ filenames and the
 * nav is generated from src/components/chrome/nav-links.ts, so no design filename reaches
 * the build. This check exists to catch (2), and to report the current names so the
 * re-derivation reads the right files.
 */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, basename } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = join(root, 'site');

/* Each live page, with the names it is known to travel under. Add an alias here if
   Claude Design renames one again; the resolver takes the first that exists. */
const PAGES = [
  { key: 'homepage', aliases: ['Homepage.html', 'index.html'] },
  { key: 'companies', aliases: ['For Companies.html'] },
  { key: 'partners', aliases: ['For Recruitment Partners.html'] },
];

let failed = 0;
const resolved = {};

console.log('Design export in site/\n');

for (const { key, aliases } of PAGES) {
  const found = aliases.find((a) => existsSync(join(SITE, a)));
  if (!found) {
    console.log(`  MISSING  ${key}: none of ${aliases.join(', ')} exist in site/`);
    failed++;
    continue;
  }
  resolved[key] = found;
  const renamed = found !== aliases[0];
  console.log(`  ok       ${key.padEnd(10)} ${found}${renamed ? '   (renamed from ' + aliases[0] + ')' : ''}`);
}

/* Every internal .html link in the live pages must point at a file that exists. This is
   what a rename-without-relinking breaks, and it breaks silently. */
console.log('\nInternal links\n');
const present = new Set(readdirSync(SITE).filter((f) => f.endsWith('.html')));
for (const [key, file] of Object.entries(resolved)) {
  const src = readFileSync(join(SITE, file), 'utf8');
  const targets = [...src.matchAll(/href="([^"]+\.html)"/g)].map((m) => decodeURIComponent(m[1]));
  const broken = [...new Set(targets)].filter((t) => !present.has(basename(t)));
  if (broken.length) {
    failed++;
    console.log(`  BROKEN   ${file}`);
    for (const b of broken) console.log(`           -> ${b} does not exist in site/`);
  } else {
    console.log(`  ok       ${file.padEnd(32)} ${new Set(targets).size} distinct target(s), all resolve`);
  }
}

/* The .dc.html artboard wrappers each iframe one live page. A rename orphans them. */
console.log('\nArtboard wrappers\n');
for (const f of readdirSync(root).filter((f) => f.endsWith('.dc.html'))) {
  const src = readFileSync(join(root, f), 'utf8');
  const m = src.match(/<iframe[^>]*src="\.\/site\/([^"]+)"/);
  if (!m) { console.log(`  ok       ${f} (no site/ iframe)`); continue; }
  const target = decodeURIComponent(m[1]);
  if (present.has(basename(target))) {
    console.log(`  ok       ${f.padEnd(36)} -> site/${target}`);
  } else {
    failed++;
    console.log(`  BROKEN   ${f} -> site/${target} does not exist`);
  }
}

console.log('');
if (failed) {
  console.log(`${failed} problem(s) in the design export. Fix in Claude Design, or add the new name to PAGES above.`);
  process.exit(1);
}
console.log('Design export is consistent.');
