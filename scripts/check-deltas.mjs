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
  {
    id: 'D7',
    title: 'For Companies: the two pinned sections can be shortened and driven by a clock',
    file: 'src/scripts/companies.js',
    design: 'For Companies.html',
    // four hooks: each pinned section reads a mobile length override, takes a progress
    // override in place of its scroll position, and publishes its frame function so the
    // mobile layer can tick it. Two lines per section; everything else lives in
    // mobile-pages.js, which the export never touches.
    present: [
      "(window.__cpSVH&&window.__cpSVH.hero)||SVH",
      "(window.__cpSVH&&window.__cpSVH.demo)||SVH_TOTAL",
      'if(window.__cpAutoQ!=null) q=window.__cpAutoQ;',
      'if(window.__cpAutoG!=null) g=window.__cpAutoG;',
      'window.__cpHeroFrame=frame;',
      'window.__cpDemoFrame=frame;',
    ],
    // the unhooked forms. Their return means the import won and For Companies is back to
    // 26 screens of scroll on a phone with no way to shorten it.
    reverted: [
      /sec\.style\.height=SVH\+'svh'/,
      /sec\.style\.height=SVH_TOTAL\+'svh'/,
    ],
    // the mobile layer itself, and the inline declaration that has to beat Astro's bundler
    extraFiles: ['src/scripts/mobile-pages.js', 'src/pages/for-companies.astro',
                 'src/styles/mobile-pages.css'],
    // the mobile arm of the per-viewport ternary; D10 asserts the desktop one
    extraPresent: ['function autoplay(', '{ hero: 150, demo: 520 }',
                   '--ai-h'],
  },
  {
    id: 'D8',
    title: 'For Companies: the content edits, and the hooks the four-fold demo needs',
    file: 'src/scripts/companies.js',
    design: 'For Companies.html',
    // the guard, the three driver hooks, and the stacked comparison's three columns
    present: [
      'if(pill) pill.classList.toggle',
      'window.__cpBookPane=function(on)',
      'if(window.__cpCursorOn) curOn2=',
      'var aim=window.__cpCursorAim;',
      "cp.getAttribute('data-m') || cp.textContent",
      'var cols=heads.slice(1,4);',
    ],
    // the unhooked forms. `pill.classList` returning unguarded is the dangerous one: with
    // the pill gone from the markup it throws and takes the whole hero driver with it.
    reverted: [
      /\n    pill\.classList\.toggle\('hot',done\);/,
      /var cols=heads\.slice\(1\);/,
    ],
    // the pill is a DELETION: what is watched for is its return to the markup
    deleted: [['src/components/companies/Hero.astro', 'class="aipill"']],
    extraFiles: [
      'src/components/companies/ProcessDemo.astro',
      'src/components/chrome/Footer.astro',
      'src/components/companies/Comparison.astro',
      'src/components/chrome/Header.astro',
      'src/scripts/mobile-pages.js',
    ],
    extraPresent: [
      '>Design the journey<',
      '>Sign up<',
      '<p data-m="',   // the mechanism; D9 asserts the copy itself
      'DRAWER_LINKS',
      'function demoFolds(',
    ],
  },
  {
    id: 'D9',
    title: 'For Companies: the cursor origin, the frozen book scale, and the comparison grid',
    file: 'src/scripts/companies.js',
    design: 'For Companies.html',
    present: [
      'var origin=cur.offsetParent||stage;',
      'var s=origin.getBoundingClientRect();',
      "cur.classList.toggle('left',tx>origin.offsetWidth*0.55)",
      'window.__cpBookFreeze=function(on)',
      'if(dcFrozen) return;',
      "'<div class=\"cmpgrid\">'+",
    ],
    // the forms that were wrong. The first is the one that matters: measured against the
    // stage rather than the cursor's own offset parent, every target is drawn 212px high
    // on a phone, and exactly right on desktop, which is why it went unnoticed.
    reverted: [
      /var s=stage\.getBoundingClientRect\(\);/,
      /cur\.classList\.toggle\('left',tx>stage\.offsetWidth\*0\.55\)/,
      /return \{x:stage\.offsetWidth\+150, y:stage\.offsetHeight\*0\.42\}/,
    ],
    extraFiles: [
      'src/components/companies/Comparison.astro',
      'src/components/chrome/Header.astro',
      'src/styles/mobile-pages.css',
      'src/scripts/mobile-pages.js',
    ],
    extraPresent: [
      'data-m="Competencies mapped"',
      '<a class="nbtn" href="#outro">Sign up</a>',
      '.cmpgrid{',
      'ACT = [[G0, 0.385]',
    ],
    // the two strings removed from the drawer
    deleted: [
      ['src/components/chrome/Header.astro', 'Evidence, not CVs'],
      ['src/components/chrome/Header.astro', '>Get started<'],
    ],
  },
  {
    id: 'D10',
    title: 'For Companies: the desktop layer — autofilled brief, five stops, one progress bar',
    file: 'src/scripts/companies.js',
    design: 'For Companies.html',
    present: [
      'if(window.__cpHeroCursorOn) on=!!window.__cpHeroCursorOn(q);',
      'var aim = window.__cpHeroAim ? window.__cpHeroAim(q) : undefined;',
      "var actBar=document.getElementById('actBar');",
      "actBar.style.setProperty('--sp',sp)",
    ],
    // the unhooked forms: the cursor pinned to the button and shown on the authored window
    reverted: [
      /\n    cur\.classList\.toggle\('click',press\);\n    park\(sendBtn,2,2\);/,
    ],
    extraFiles: [
      'src/scripts/companies-desktop.js',
      'src/components/companies/ProcessDemo.astro',
      'src/styles/local-overrides.css',
      'src/pages/for-companies.astro',
      'src/pages/for-companies.astro',
    ],
    extraPresent: [
      'function demoStops(',
      'class="actbar"',
      '.actbar {',
      "import '../styles/local-overrides.css';",
      '{ hero: 200, demo: 620 }',   // the desktop arm of the per-viewport ternary
    ],

  },
  {
    id: 'D11',
    title: 'For Companies: the passport shuts in order, and mobile stops rastering six leaves',
    file: 'src/scripts/companies.js',
    design: 'For Companies.html',
    present: [
      "var dcLeafShut=ease(seg(g,.976,.988));",
      "var dcShut=ease(seg(g,.988,1));",
      "*(1-(li===0?dcShut:dcLeafShut))",
    ],
    // the single ramp that drove the cover and the leaf down together, which put them at the
    // same rotateY 0.88px apart and tore the two planes into each other
    reverted: [
      /var dcShut=ease\(seg\(g,\.980,\.992\)\);/,
      /dcFlips\[li\]\[1\]\)\)\*\(1-dcShut\)/,
    ],
    extraFiles: [
      'src/styles/mobile-pages.css',
    ],
    extraPresent: [
      '.dcpp #dcLeaf5 { display: none }',
      '.dcpp #dcCover, .dcpp #dcLeaf1 { will-change: transform }',
      '.dcpp { contain: paint }',
      'background-color:transparent;',              // .aibox.big, the demo card
      '.aibp, .aiex, .aiev, .aidc{ padding-inline:0 }',
    ],
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
  /* Some deltas are deletions — the eyebrows, the Companion pill — and for those the thing
     to watch for is the markup COMING BACK, in a file other than d.file. `reverted` only
     reads d.file, so deletions need their own list. */
  for (const [file, marker] of d.deleted ?? []) {
    const fs2 = read(file);
    if (fs2 !== null && hit(fs2, marker)) returned.push(`${marker}  (back in ${file})`);
  }

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
