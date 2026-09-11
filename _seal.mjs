import { chromium } from 'playwright';
const port = process.argv[2], out = process.argv[3];
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });

// Every animation on the page is paused at frame 0, so the ONLY thing that could differ
// between the two builds is something other than the rotation itself — which is exactly
// what this needs to prove is zero.
const FREEZE = '*,*::before,*::after{animation-play-state:paused!important;animation-delay:0s!important;transition:none!important}';

for (const [page, path] of [['companies','/for-companies/'], ['partners','/for-recruitment-partners/']]) {
  for (const [tag, w, h, rm] of [
    ['desktop', 1440, 900, false],
    ['mobile',   412, 915, false],
    ['reduced',  412, 915, true],      // the block that was re-declaring the spin
  ]) {
    const ctx = await b.newContext({ viewport:{width:w,height:h}, deviceScaleFactor:1,
      isMobile: w < 1025, hasTouch: w < 1025,
      reducedMotion: rm ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    const errs=[]; p.on('pageerror',e=>errs.push(String(e)));
    await p.goto(`http://localhost:${port}${path}`, {waitUntil:'networkidle'});
    await p.addStyleTag({ content: FREEZE });
    await p.waitForTimeout(1200);
    // the crest lives near the foot of both pages
    const y = await p.evaluate(()=>{ const e=document.querySelector('.cpface'); if(!e) return 0;
      const r=e.getBoundingClientRect(); return Math.max(0, Math.round(r.top+scrollY+r.height/2-innerHeight/2)); });
    await p.evaluate(v=>scrollTo(0,v), y);
    await p.waitForTimeout(1400);
    await p.screenshot({ path: `${out}/${page}-${tag}.png`, fullPage: false });
    if (errs.length) console.log('  ERR', page, tag, errs[0]);
    await ctx.close();
  }
}
await b.close();
