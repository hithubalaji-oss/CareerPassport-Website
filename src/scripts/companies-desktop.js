/* ==============================================================================================
   DESKTOP — For Companies
   ==============================================================================================

   The counterpart of mobile-pages.js, above the breakpoint rather than below it. Everything in
   here is guarded by the same media query in reverse, so a phone never runs a line of it.

   Why it exists: the page's two pinned sections were authored so that scroll position IS the
   animation — every beat of the brief being typed, of the blueprint being filled in, of the
   manager's hand, is a slice of scroll distance. That reads well when you scroll slowly and
   badly when you do not, and it means the page cannot be shorter than the sum of its beats.
   Asked for on desktop: the parts that are exposition play themselves, and scrolling is left to
   carry the things a reader should feel they caused.
   ---------------------------------------------------------------------------------------- */
(function () {
  var DESKTOP = window.matchMedia('(min-width: 1025px)');
  if (!DESKTOP.matches) return;

  var raf = window.requestAnimationFrame;

  /* --------------------------------------------------------------------------------------
     THE HERO — the brief writes itself, and scroll is only the send
     --------------------------------------------------------------------------------------
     The hero's whole animation is one scalar, q. The authored mapping is scroll 0..1 -> q 0..1,
     with the words filling between .08 and .60 and the send pressed at .72.

     Now: q runs 0 -> FILLED on a timer as soon as the page is up, so the brief is already
     written when a reader has finished reading the headline. From then on the scroll drives
     only what is left, remapped into FILLED..1 — so scrolling cannot un-type the sentence, and
     the only thing it carries is the manager arriving, pressing send, and leaving.
     -------------------------------------------------------------------------------------- */
  var FILLED = 0.62;          /* the words complete at .60; a little past it, and no further */
  var FILL_MS = 4200;

  function hero() {
    var sec = document.getElementById('herofold');
    if (!sec || !window.__cpHeroFrame) return;

    /* The manager arrives a beat after the reader starts scrolling, presses at .72-.80, and is
       gone by .82 — rather than lingering to .90 with nothing left to do. */
    window.__cpHeroCursorOn = function (q) { return q >= 0.655 && q < 0.815; };
    /* null = walk off-stage. Past the press there is nothing to point at. */
    window.__cpHeroAim = function (q) { return q >= 0.80 ? null : undefined; };

    var t0 = 0, filling = true, id = 0;

    function scrollQ() {
      var r = sec.getBoundingClientRect();
      var span = r.height - (window.innerHeight || 1);
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      return FILLED + (1 - FILLED) * p;
    }

    function tick() {
      var t = (Date.now() - t0) / FILL_MS;
      if (t >= 1) { t = 1; filling = false; }
      /* while filling, never fall behind where the scroll already is — a reader who scrolls
         immediately should not see the sentence typing backwards */
      window.__cpAutoQ = Math.max(FILLED * t, filling ? 0 : scrollQ());
      window.__cpHeroFrame();
      id = filling ? raf(tick) : 0;
    }

    function onScroll() {
      if (filling) return;
      window.__cpAutoQ = scrollQ();
      window.__cpHeroFrame();
    }

    t0 = Date.now();
    id = raf(tick);
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
  }

  /* --------------------------------------------------------------------------------------
     FOLD 2 — five scroll stops instead of a continuous scrub
     --------------------------------------------------------------------------------------
     Every beat of the four acts was a slice of scroll distance: the blueprint filling in, each
     chip being added, the level being raised, each evaluation being chosen, the press, the
     deck, the invite. 1750svh of section — seventeen and a half screens — because that is what
     it takes to give every beat its own scroll.

     The acts now play themselves, and scroll is left to carry only the two moments a reader
     should feel they caused. Five stops:

       1  DESIGN   the brief is read, the form assembles, the chips and the level and the
                   evaluations are set, and the manager arrives and modifies the selection
       2  DESIGN   the click, and what follows from it
       3  EXECUTE  the whole graph, at once
       4  EVIDENCE the manager goes straight to "See candidate" and presses it
       5  DECIDE   the record is opened and the invite sent

     The ranges are the driver's own act boundaries, read off setAct, with stop 1 ending at
     g=.363 — p=.845, which is the beat where Accept is offered and armed, immediately after
     the last evaluation is chosen. Stop 2 takes the press (p .858-.892) and its aftermath.

     The section has to come down with them. Five stops inside 1750svh would be three and a
     half screens of scrolling between events, which is worse than the scrub it replaces: the
     point of removing scroll-driven beats is lost if the distance stays. 620svh is 100 for the
     pin plus five stops of ~104.
     -------------------------------------------------------------------------------------- */
  var STOP = [], SDUR = [6200, 2800, 1500, 4000, 4400];

  function buildStops() {
    var G0 = window.__cpDemoG0 || 0.2055;
    var E = 0.0008;
    STOP = [
      [G0, 0.363],          /* to the selection being modified, Accept armed */
      [0.363, 0.452 - E],   /* the press, the recede, finalised, launched     */
      [0.452, 0.652 - E],   /* EXECUTE                                        */
      [0.652, 0.852 - E],   /* EVIDENCE, including the press at .776-.812     */
      [0.852, 1]            /* DECIDE                                         */
    ];
  }

  function demoStops(sec) {
    if (!sec || !window.__cpDemoFrame) return;
    var stop = -1, t0 = 0, id = 0, live = false;

    function stopFromScroll() {
      var r = sec.getBoundingClientRect();
      var span = r.height - (window.innerHeight || 1);
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      return Math.min(STOP.length - 1, Math.floor(p * STOP.length));
    }

    function step() {
      if (!live) return;
      var a = STOP[stop] || STOP[0];
      var t = (Date.now() - t0) / (SDUR[stop] || 3000);
      if (t > 1) t = 1;
      window.__cpAutoG = a[0] + (a[1] - a[0]) * t;
      window.__cpDemoFrame();
      id = t < 1 ? raf(step) : 0;
    }

    function sync() {
      if (!live) return;
      var a = stopFromScroll();
      if (a === stop) return;
      stop = a; t0 = Date.now();
      if (!id) id = raf(step);
    }

    function start() { if (live) return; live = true; stop = -1; sync(); }
    function stopAll() {
      live = false;
      if (id) { window.cancelAnimationFrame(id); id = 0; }
      window.__cpAutoG = null;
      window.__cpDemoFrame();
    }

    new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) { if (es[i].isIntersecting) start(); else stopAll(); }
    }, { rootMargin: '0px' }).observe(sec);

    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync, { passive: true });
  }

  function boot() {
    hero();
    buildStops();
    demoStops(document.getElementById('aidemo'));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);
})();
