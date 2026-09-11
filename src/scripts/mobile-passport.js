/* ============================================================================================
   MOBILE PASSPORT — the driver replacement, in about sixty lines
   ============================================================================================

   ADDITIVE and separate, for the same reason as mobile-passport.css: the re-derivation after a
   Claude Design export rewrites homepage.css and homepage.js from index.html's own blocks and
   never touches a file that does not exist in the design. This survives exports untouched.

   Loaded BEFORE homepage.js, because it has to set window.__cpManual while the desktop driver
   is still parsing — see below.

   What runs during a scroll: nothing. The observer fires roughly once per fold crossed, six
   times over a whole visit, and sets one attribute. CSS does the rest, on compositor
   properties only.
   -------------------------------------------------------------------------------------------- */
(function () {
  var MOBILE = window.matchMedia('(max-width: 1024px)').matches;

  /* Stop the desktop driver before it starts. Its rAF loop already checks this flag on every
     iteration; the one thing it does not guard is the initial kick, which is why homepage.js
     carries a single-line guard alongside this (registered as delta D4).
     Above 1024px this is never set and the driver runs exactly as it does today. */
  if (!MOBILE) return;
  window.__cpManual = 1;

  function start() {
    var stage = document.getElementById('stage');
    var main = document.querySelector('main');
    var folds = [].slice.call(document.querySelectorAll('.fold'));
    var outro = document.querySelector('.outro');
    var footer = document.querySelector('.ftr');
    if (!stage || !folds.length) return;

    /* 6 is the outro, which is not a .fold; 7 is the footer, which exists so the passport
       has somewhere to GO once the outro is read. Without it the passport parked in state 6
       and the whole footer scrolled over the top of it. */
    var sections = folds.concat(outro ? [outro] : []).concat(footer ? [footer] : []);
    var current = 0;

    /* ---- scroll velocity, sampled only when the observer fires ----
       The prototype guessed "fast" by counting how many folds had been skipped. That is a
       proxy and it misreads an anchor jump or a short fold as a flick. This measures the real
       thing, and costs one scrollY read per fold crossed — not per frame. */
    var lastY = window.scrollY || 0, lastT = performance.now();
    function velocity() {
      var y = window.scrollY || 0, t = performance.now();
      var dt = Math.max(16, t - lastT);
      var v = Math.abs(y - lastY) / dt;      /* px per ms */
      lastY = y; lastT = t;
      return v;
    }

    /* Landing instantly instead of gliding, when the reader is moving faster than the glide
       could follow. Without it the passport starts toward one position, gets redirected
       mid-flight, and arrives late having traced a path through positions it never settled
       in — it reads as the passport chasing you. */
    /* the glide durations are read by rules inside both subtrees, so they are set on both
       rather than inherited from a common ancestor — same reasoning as the attribute */
    function setVar(k, v) { stage.style.setProperty(k, v); if (main) main.style.setProperty(k, v); }
    function clearVar(k) { stage.style.removeProperty(k); if (main) main.style.removeProperty(k); }

    var SNAP_ABOVE = 2.2;                    /* px/ms — a deliberate flick, not a read */

    /* ---- fold 4's Companion loop ----
       The chart's eight steps are stepped by the driver from scroll position, so with the
       driver off the log never advanced past step 1 and the stage never changed beat: the
       node was there, lit (see the s4 rules in the stylesheet), and completely static.
       On mobile the reader does not own that clock any more, so it runs on its own — but
       only while fold 4 is on screen, so it is not a timer burning through the whole visit.
       One text swap and one attribute per tick, eight ticks, then it loops. */
    var loopT = 0;
    function companionLoop(on) {
      if (loopT) { clearInterval(loopT); loopT = 0; }
      if (!on || typeof window.__cpStep !== 'function') return;
      var i = 0, n = window.__cpStepCount || 8;
      window.__cpStep(0);
      loopT = setInterval(function () { i = (i + 1) % n; window.__cpStep(i); }, 1700);
    }

    function apply(n) {
      if (n === current) return;
      var fast = velocity() > SNAP_ABOVE || Math.abs(n - current) > 1;
      if (fast) {
        setVar('--m-glide', '0ms'); setVar('--m-open', '0ms'); setVar('--m-copy', '0ms');
        /* restore after the browser has committed the jump, so the next move glides again */
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            clearVar('--m-glide'); clearVar('--m-open'); clearVar('--m-copy');
          });
        });
      }
      current = n;
      /* On the two subtrees that react, never on <html>. An attribute on the root
         invalidates style for the whole document — measured, and it wiped out the entire
         saving this file exists to produce. */
      stage.setAttribute('data-mfold', String(n));
      if (main) main.setAttribute('data-mfold', String(n));
      companionLoop(n === 4);
    }

    var io = new IntersectionObserver(function (entries) {
      var best = null;
      for (var i = 0; i < entries.length; i++) {
        var e = entries[i];
        if (!e.isIntersecting) continue;
        if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
      }
      if (best) apply(+best.target.getAttribute('data-mfold-index'));
    }, {
      /* A fold is 130-320vh tall, so it can never be 50% visible and a ratio threshold would
         never fire for it. Collapsing the root to a 1px line across the middle of the screen
         asks the right question instead: which fold is under the centre of the viewport?
         Exactly one section satisfies that at a time, so the callback is unambiguous. */
      rootMargin: '-50% 0px -50% 0px',
      threshold: 0
    });

    sections.forEach(function (el, i) {
      el.setAttribute('data-mfold-index', String(i + 1));
      io.observe(el);
    });

    /* The driver builds the fold-4 flow chart on its first frame. It never runs here, so
       build it explicitly — otherwise the Companion flow simply does not exist in the page. */
    if (typeof window.__cpBuildOnce === 'function') window.__cpBuildOnce();

    /* first paint: whichever section is already on screen, with no glide */
    setVar('--m-glide', '0ms'); setVar('--m-copy', '0ms');
    stage.setAttribute('data-mfold', '1');
    if (main) main.setAttribute('data-mfold', '1');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { clearVar('--m-glide'); clearVar('--m-copy'); });
    });

    /* A viewport crossing the breakpoint mid-visit (rotation, or a desktop window resized
       narrow) would leave the wrong regime running. Reloading is blunt but correct, and it
       cannot happen on a phone in normal use. */
    var mq = window.matchMedia('(max-width: 1024px)');
    (mq.addEventListener ? mq.addEventListener.bind(mq, 'change') : mq.addListener.bind(mq))(
      function (e) { if (!e.matches) location.reload(); }
    );
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
