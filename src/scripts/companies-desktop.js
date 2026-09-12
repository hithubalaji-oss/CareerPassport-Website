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

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hero);
  else setTimeout(hero, 0);
})();
