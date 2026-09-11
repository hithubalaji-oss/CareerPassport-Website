import { chromium } from 'playwright';
const b = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium' });
const PAGES = [['homepage','/'], ['companies','/for-companies/'], ['partners','/for-recruitment-partners/']];
const VIEWS = [['desktop',1440,900,'no-preference'], ['mobile',412,915,'no-preference'], ['reduced-motion',412,915,'reduce']];
for (const [port,label] of [[4330,'BEFORE'],[4331,'AFTER ']]) {
  console.log(`\n${label}`);
  for (const [pg,path] of PAGES) {
    for (const [v,w,h,rm] of VIEWS) {
      const ctx = await b.newContext({ viewport:{width:w,height:h}, isMobile:w<1025, hasTouch:w<1025, reducedMotion:rm });
      const p = await ctx.newPage();
      await p.goto(`http://localhost:${port}${path}`, {waitUntil:'domcontentloaded'});
      await p.waitForTimeout(500);
      const r = await p.evaluate(()=>{
        const els=[...document.querySelectorAll('.cring')];
        if(!els.length) return 'no .cring on page';
        return els.map(e=>{const c=getComputedStyle(e);return c.animationName+'/'+c.animationDuration;}).join(', ');
      });
      console.log(`  ${pg.padEnd(10)} ${v.padEnd(15)} .cring animation: ${r}`);
      await ctx.close();
    }
  }
}
await b.close();
