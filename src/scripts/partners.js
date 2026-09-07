/* the funnel packets: the wire svg is preserveAspectRatio="none", so x and y scale by
   different factors and every circle in it would render as an oval. The dots take the
   inverse on y; the paths keep the stretch. */
(function(){
  var svg=document.querySelector('#dia2 .dwire'); if(!svg) return;
  function sync(){
    var r=svg.getBoundingClientRect();
    if(!r.width||!r.height) return;
    svg.style.setProperty('--dsy',((r.width/300)/(r.height/60)).toFixed(4));
  }
  sync();
  if(window.ResizeObserver) new ResizeObserver(sync).observe(svg);
  addEventListener('resize',sync,{passive:true});
})();

/* ---- the partners strip: user-filled slots, duplicated for a seamless loop ---- */
(function(){
  var track=document.getElementById('logoTrack'); if(!track) return;
  var N=7, html='';
  for(var pass=0;pass<2;pass++){
    for(var i=1;i<=N;i++){
      html+='<div class="lg"><image-slot id="rp-logo-'+i+'" shape="rect" '+
        (pass?'aria-hidden="true" ':'')+'placeholder="Logo '+i+'"></image-slot></div>';
    }
  }
  track.innerHTML=html;
})();

/* ---- the pinned narrative -----------------------------------------------------------
   One 0..1 progress for the fold, divided into four equal acts with a short cross-fade at
   each boundary. Ticked from the scroll event directly (rAF is throttled to nothing while
   the document is hidden, and this page's other drivers already tick this way). */
(function(){
  var band=document.getElementById('story'); if(!band) return;
  var acts=[].slice.call(band.querySelectorAll('.storyact'));
  var stgs=[].slice.call(band.querySelectorAll('.stg'));
  var bar=band.querySelector('.storybar i');
  var N=acts.length; if(!N) return;
  var cur=-1;
  var pin=band.querySelector('.storypin');
  function frame(){
    /* no pin, no sequence: the acts and scenes are ordinary stacked sections there */
    if(pin&&getComputedStyle(pin).position!=='sticky'){
      if(cur!==-2){
        cur=-2;
        acts.forEach(function(c){ c.classList.add('on') });
        stgs.forEach(function(c){ c.classList.add('on') });
      }
      return;
    }
    var r=band.getBoundingClientRect();
    var span=r.height-innerHeight;
    var p=span>0?Math.max(0,Math.min(1,-r.top/span)):0;
    if(bar) bar.parentNode.style.setProperty('--sp',p.toFixed(4));
    /* the last act holds to the end of the band rather than flicking past */
    var i=Math.min(N-1,Math.floor(p*N*1.02));
    if(i===cur) return;
    cur=i;
    acts.forEach(function(c,k){ c.classList.toggle('on',k===i) });
    stgs.forEach(function(c,k){ c.classList.toggle('on',k===i) });
  }
  frame();
  var last=0;
  addEventListener('scroll',function(){
    var now=Date.now(); if(now-last<12) return; last=now; frame();
  },{passive:true});
  addEventListener('resize',frame,{passive:true});
})();

/* ---- the counter slab ---------------------------------------------------------------
   Each number counts up once, when its slab first enters. Numbers are the report's way of
   carrying a claim, so they must land as an event rather than being there on arrival. */
(function(){
  var vals=[].slice.call(document.querySelectorAll('.statv')); if(!vals.length) return;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  function run(el){
    var to=parseFloat(el.getAttribute('data-to')), dec=(to%1)?1:0;
    var unit=el.querySelector('em');
    if(reduced){ el.firstChild.nodeValue=to.toFixed(dec); return }
    var t0=null, D=1150;
    function step(now){
      if(t0===null) t0=now;
      var t=Math.min(1,(now-t0)/D);
      var e=1-Math.pow(1-t,3);
      el.firstChild.nodeValue=(to*e).toFixed(dec);
      if(t<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if(!('IntersectionObserver' in window)){ vals.forEach(run); return }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target) } });
  },{threshold:.6});
  vals.forEach(function(el){ io.observe(el) });
})();

/* ---- 05 · the scroll stack -----------------------------------------------------------
   Each card owns a window in the band's scroll progress: it rises into place, then steps
   back and scales down for every card that lands on top of it, which is what keeps the
   whole stack readable at the end. Ticked from the scroll event directly rather than rAF,
   because rAF is throttled to nothing while the document is hidden. */
(function(){
  var stk=document.getElementById('stk'); if(!stk) return;
  var band=document.getElementById('s5');
  var cards=[].slice.call(stk.querySelectorAll('.stkc'));
  if(!cards.length) return;
  var N=cards.length, ITEM_SCALE=0.045;
  var reduced=matchMedia('(prefers-reduced-motion:reduce)');

  function step(){ return parseFloat(getComputedStyle(stk).getPropertyValue('--stk-step'))||24 }
  function ease(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2 }
  function clamp01(v){ return v<0?0:v>1?1:v }

  function frame(){
    if(reduced.matches){
      cards.forEach(function(c){ c.style.removeProperty('--ty');
        c.style.removeProperty('--sc'); c.style.removeProperty('--op');
        c.removeAttribute('data-wait'); c.classList.remove('lead');
        c.classList.add('drawn') });
      return;
    }
    var r=band.getBoundingClientRect();
    var span=r.height-innerHeight;
    var p=span>0?clamp01(-r.top/span):0;
    var STEP=step();
    /* card 0 is present from the first frame, so the band opens with copy AND a card;
       cards 1..N-1 share the scroll that follows */
    var slice=1/(N-1+0.3);
    cards.forEach(function(c,i){
      var enter=i===0 ? 1 : ease(clamp01((p-(i-1)*slice)/(slice*0.7)));
      var depth=0;
      for(var j=i+1;j<N;j++) depth+=ease(clamp01((p-(j-1)*slice)/(slice*0.7)));
      var ty=(1-enter)*150 + i*STEP;
      c.style.setProperty('--ty',ty.toFixed(1)+'px');
      c.style.setProperty('--sc',(1-depth*ITEM_SCALE).toFixed(3));
      c.style.setProperty('--op',enter.toFixed(3));
      c.style.zIndex=i+1;
      /* unpainted until it starts rising — visibility also takes it out of hit-testing */
      if(enter<=0.001) c.setAttribute('data-wait',''); else c.removeAttribute('data-wait');
      c.classList.toggle('lead',depth<0.5&&enter>0.5);
      c.classList.toggle('drawn',enter>0.3);
    });
  }

  var last=0;
  function onScroll(){
    var now=Date.now();
    if(now-last<12) return;
    last=now; frame();
  }
  frame();
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',frame,{passive:true});
  reduced.addEventListener('change',frame);
})();
