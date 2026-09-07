/* ---- the homepage's composed frames -------------------------------------------------
   This page's clock is cumulative: each of the five folds contributes 0..1 to g, so
   g 2.28 means "fold 3, 28% in". That maps straight back to a scroll position, which is
   what makes a stop table possible here.

   The values are the page's own beat thresholds where it has them (folds 2-4 drive their
   acts off g directly) plus a reading division for folds 1 and 5, which animate from
   their own rects and publish none. Every one is a frame where something has landed. */
(function(){
  var main=document.querySelector('main');
  var folds=[].slice.call(document.querySelectorAll('main .fold'));
  if(!main||!folds.length) return;
  main.__stops=[
    0,    0.55,                             /* the crowd, then the one with proof */
    1,    1.34, 1.60, 1.70,                 /* fold 2 */
    2,    2.08, 2.28, 2.50, 2.76, 2.92,     /* fold 3's acts */
    3,    3.20, 3.40, 3.60, 3.85,           /* the flow chart assembling */
    4,    4.50                              /* fold 5 */
  ];
  /* g = k + frac -> fold k, frac of the way through its pinned range */
  main.__toY=function(v){
    var vh=innerHeight;
    var k=Math.max(0,Math.min(folds.length-1,Math.floor(v)));
    var frac=Math.max(0,Math.min(1,v-k));
    var f=folds[k];
    return Math.round(f.offsetTop + frac*Math.max(0,f.offsetHeight-vh));
  };
})();
