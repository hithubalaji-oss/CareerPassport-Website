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
    title: 'Root-absolute asset paths',
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    present: ["'/uploads/Crowd-6ce23065-1280.webp'", "'/uploads/Crowd-6ce23065.webp'", "'/assets/hero-lift.mp4'"],
    // the design file's relative forms, whose return means the import won
    reverted: [/\|\|'uploads\/Crowd-6ce23065/, /\|\|'assets\/hero-lift/],
    // this one cannot be fixed upstream — root-absolute paths break the Claude Design
    // canvas preview, so there is no upstreamFixed signal to watch for
  },
  {
    id: 'D2',
    title: 'Pre-keyed hero video (no runtime chroma-key)',
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    present: ["var LIFT_ALPHA_SRC='/assets/hero-lift-alpha.webm'", 'if(hvAlpha){', 'hvFrames.length=0; hvReady=false;'],
    // the unguarded key, whose return means every phone runs the pixel loop again
    reverted: [/\n    try\{ keyGreen\(cx,cv\.width,cv\.height\); \}\n    catch/],
    upstreamFixed: (designSrc) => !/function keyGreen/.test(designSrc),
  },
  {
    id: 'D3',
    title: 'Per-frame animation writes direct properties, not custom properties',
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    present: ["stage.style.opacity = '1'", 'wrap.style.scale =', 'tallyEl.style.opacity', 'cbgEl.style.marginTop'],
    // the custom-property writes, whose return re-invalidates whole subtrees every frame
    reverted: [/setProperty\('--stageOp'/, /setProperty\('--s'/, /setProperty\('--cbgTop'/],
    upstreamFixed: (designSrc) => !/setProperty\('--stageOp'/.test(designSrc),
  },
  {
    id: 'D3b',
    title: "The driver's startup frame is guarded",
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    present: ['if(!window.__cpManual) requestAnimationFrame(frame);'],
    // the design's unguarded kick, whose return lets one frame pin the passport on mobile
    reverted: [/\n(?!.*__cpManual)requestAnimationFrame\(frame\);/],
    /* the design already guards the loop's own recursion, so a bare test for the guarded
       line matches that and reports a false retirement. The kick is guarded upstream only
       when the phrase appears TWICE: once in the recursion, once at the kickoff. */
    upstreamFixed: (d) =>
      (d.match(/if\(!window\.__cpManual\) requestAnimationFrame\(frame\);/g) || []).length >= 2,
  },
  {
    id: 'D3c',
    title: 'Mobile passport state machine is wired into the page',
    file: 'src/pages/index.astro',
    design: 'index.html',
    present: ['mobile-passport.css', 'mobile-passport.js', "window.matchMedia('(max-width: 1024px)').matches) window.__cpManual"],
    extraFiles: ['src/styles/mobile-passport.css'],
    extraPresent: ['THE SEVEN STATES'],
    // additive: nothing in the design can revert it, so there is no upstreamFixed signal
  },
  {
    id: 'D3d',
    title: 'The driver exposes its build and claim-placement hooks to the mobile layer',
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    // Both exist because the mobile layer replaced the rAF loop that used to call them.
    // __cpBuildOnce builds the fold-4 flow chart, which otherwise never exists; and
    // __cpPlaceClaims re-places the fold-2 callout cards once the measured art band has
    // given their layer a real box to be clamped against — at parse time it has none, and
    // a card lands ~7,000px off screen.
    present: ['window.__cpBuildOnce', 'window.__cpPlaceClaims'],
  },
  {
    id: 'D6',
    title: 'No hero video is emitted on mobile',
    file: 'src/scripts/homepage.js',
    design: 'index.html',
    // A display:none <video preload="auto"> still downloads in full. The mobile composition
    // has no hero figure at all, so the element is omitted rather than hidden — load event
    // 5.34s -> 1.75s on a throttled 4G phone. The null guard on loadedmetadata goes with it.
    present: ['window.__cpManual ?', 'if(heroVideo) heroVideo.addEventListener'],
  },
  {
    id: 'D5',
    title: 'Eyebrows removed from every fold but two',
    file: 'src/styles/local-overrides.css',
    design: 'index.html',
    present: ['#f1 .eyebrow { display: none }'],
    // the design file still carries all fifteen; when Claude Design removes them, the
    // markup deletions stop being re-applied by hand and this entry can go
    reverted: [/class="eyebrow"><i><\/i>The problem/],
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
