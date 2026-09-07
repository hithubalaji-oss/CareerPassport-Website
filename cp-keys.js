/* CareerPassport — keyboard reading of scroll-driven folds.
   ----------------------------------------------------------------------------------
   Dwell on these pages is authored in scroll PIXELS, and that is not a stable unit
   across input devices: a wheel notch moves ~100px, the browser's arrow-key step
   ~40px. On For Companies that is ~140 notches against ~349 presses for the same
   content, so a reader on the keyboard was doing two and a half times the work.

   A beat cannot have two dwell times — the timeline is a function of a single scroll
   position. So this does not change dwell. It changes how much distance one gesture
   consumes: a press advances to the next COMPOSED FRAME rather than by a text line.
   Discrete input gets discrete steps; wheel, trackpad, scrollbar and deep links are
   untouched.

   A page opts in by marking its landmarks [data-keystop]. A pinned fold, which is one
   section but many states, additionally publishes:
     el.__stops = [progress values in that page's own clock]
     el.__toY(v) = the document scroll position for one of them
   so the stop table lives next to the constants that define the clock, and retiming a
   beat and retiming a stop happen in one place.

   This file is shared by every page rather than pasted into each, so the behaviour
   cannot drift between them. */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion:reduce)');
  var stops = [], pending = null, raf = 0;

  function build(){
    var list = [], max = document.documentElement.scrollHeight - innerHeight;
    [].slice.call(document.querySelectorAll('[data-keystop]')).forEach(function(el){
      if (el.__stops && el.__toY) el.__stops.forEach(function(v){ list.push(el.__toY(v)) });
      else list.push(el.offsetTop);
    });
    list.push(max);
    stops = list
      .map(function(v){ return Math.max(0, Math.min(max, Math.round(v))) })
      .sort(function(a,b){ return a-b })
      .filter(function(v,i,a){ return i===0 || v-a[i-1] > 8 });
  }

  /* Space types in a field and activates a focused control, so it must yield to both.
     Arrows only have to yield to text entry. */
  function typing(){
    var e = document.activeElement; if(!e) return false;
    var t = (e.tagName||'').toLowerCase();
    return t==='input' || t==='textarea' || t==='select' || e.isContentEditable;
  }
  function activatable(){
    var e = document.activeElement; if(!e) return false;
    var t = (e.tagName||'').toLowerCase();
    return t==='button' || t==='summary' || (t==='a' && e.hasAttribute('href')) ||
      e.getAttribute('role')==='button' || e.getAttribute('role')==='checkbox';
  }

  /* The transit is driven here rather than by behavior:'smooth'. These pages carry
     content-visibility regions that lay out as they enter the viewport, and the
     resulting scroll-anchoring correction ABORTS a native smooth scroll — it was
     landing at positions that were not stops at all. Driving it also gives the transit
     a pace of its own, which native smooth does not expose: distance-proportional, on
     the same easing curve the folds animate with. */
  function tweenTo(y){
    cancelAnimationFrame(raf);
    var from = scrollY || pageYOffset, dist = y - from;
    if (reduce.matches || Math.abs(dist) < 2){ window.scrollTo(0,y); pending = null; return }
    var dur = Math.min(900, Math.max(300, Math.abs(dist)*0.5)), t0 = performance.now();
    raf = requestAnimationFrame(function step(now){
      var p = Math.min(1,(now-t0)/dur);
      var e = p<.5 ? 4*p*p*p : 1-Math.pow(-2*p+2,3)/2;
      window.scrollTo(0, Math.round(from + dist*e));
      if (p<1) raf = requestAnimationFrame(step); else pending = null;
    });
  }

  function go(dir){
    if(!stops.length) build();
    /* stepping from the TARGET, not from mid-transit, so a held key advances one stop
       per repeat instead of stalling wherever the tween happens to be */
    var from = pending!==null ? pending : (scrollY || pageYOffset), next = null, i;
    if (dir>0){ for(i=0;i<stops.length;i++){ if(stops[i] > from+6){ next=stops[i]; break } } }
    else      { for(i=stops.length-1;i>=0;i--){ if(stops[i] < from-6){ next=stops[i]; break } } }
    if (next===null) return false;        /* at an end — the browser can have the key */
    pending = next;
    tweenTo(next);
    return true;
  }

  addEventListener('keydown', function(e){
    if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey) return;
    if (typing()) return;
    var space = e.key===' ' || e.key==='Spacebar' || e.code==='Space';
    var dir = 0;
    if (space){
      if (activatable()) return;          /* a focused control keeps its Space */
      dir = e.shiftKey ? -1 : 1;          /* Shift+Space reads backwards, as it should */
    } else {
      if (e.shiftKey) return;
      dir = e.key==='ArrowDown' ? 1 : e.key==='ArrowUp' ? -1 : 0;
    }
    if (!dir) return;                     /* PageUp/PageDown/Home/End stay the browser's */
    if (go(dir)) e.preventDefault();
  }, {passive:false});

  /* any pointer scroll hands control straight back */
  ['wheel','touchstart','mousedown'].forEach(function(t){
    addEventListener(t, function(){ pending = null; cancelAnimationFrame(raf) }, {passive:true});
  });

  addEventListener('resize', build, {passive:true});
  addEventListener('load', build);
  build();
  window.__keyStops = function(){ return stops };
})();
