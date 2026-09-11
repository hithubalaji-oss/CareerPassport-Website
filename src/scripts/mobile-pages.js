/* ==============================================================================================
   MOBILE — For Companies: the two pinned sections
   ==============================================================================================

   The counterpart of mobile-passport.js, for the one interior page that needed it. Three jobs,
   all of them below 1025px and none of them above it.

   1 · SCROLL LENGTH.  For Companies ran to 26-27 screens on a phone. Two sections account for
       21.7 of them: the hero pins for 420svh while the brief types itself, and the process demo
       pins for 1750svh while thirteen acts play out. Both are scroll-linked, so the length IS
       the animation — you cannot shorten one without losing the other. So on a phone the length
       comes down and the clock changes hands.

   2 · AUTO-PLAY.  The acts run on a timer while the section is in view, which is what the
       homepage's fold 4 already does with its Companion loop. The two drivers in companies.js
       are each a pure function of one progress scalar, so this needs nothing from them but a
       way in: they read an override if one is set, and publish their frame function so it can
       be ticked. That is the whole change on that side — two lines each.

       It plays forward once per entry and holds on the last act rather than looping. The demo
       is a narrative that ends on the offer being sent; looping a twenty-second story back to
       its first frame reads as a glitch rather than as life. Scrolling away and back replays it.

   3 · THE PANEL FITS THE FRAME.  `.aibox.big` is `min(clamp(452px,63vh,572px), 100svh - hdr)`.
       On a 640px-high phone the 452px floor wins over the 403px that 63vh would give, and the
       panel plus its text column come to 687px inside 557px of pinned space — overflowing by
       130px, which `.aidemopin`'s overflow:hidden crops top and bottom. Measured at 360x640:
       the panel's bottom edge landed 65px below the fold.

       So the band is measured rather than guessed, exactly as the homepage measures the space
       its art gets: ask what the text column actually took, hand the panel the rest, publish it
       as --ai-h. The panel's internals are already keyed to vh clamps and follow it down.
   ---------------------------------------------------------------------------------------- */
(function () {
  var MOBILE = window.matchMedia('(max-width: 1024px)');
  if (!MOBILE.matches) return;

  /* window.__cpSVH — the two pinned sections' lengths — is NOT set here. companies.js reads it
     as it runs, and Astro bundles this file and that one together and orders them by its own
     import graph rather than by tag order: companies.js landed first, so anything published
     here arrived after both sections had already been sized. It is declared inline in
     for-companies.astro instead, where it runs exactly where it is written.

     The values there are 150 and 520 against the authored 420 and 1750. The demo is the
     longer of the two because it is four folds now rather than one: 100svh for the pin plus
     four stops of 105svh each, so every act takes about two thumb-scrolls to leave — the
     rhythm asked for, and close to the homepage's 1.25 screens per fold. */

  var raf = window.requestAnimationFrame;

  /* --------------------------------------------------------------------------------------
     One auto-player per section. It owns a clock, not a position: the section's own frame
     function is called with a progress value this ramps from 0 to 1 over `dur`, and the
     override is cleared the moment the section leaves so nothing is left pinned to a stale
     value if the breakpoint changes under it.
     -------------------------------------------------------------------------------------- */
  function autoplay(el, dur, set, tick) {
    if (!el) return;
    var t0 = 0, live = false, id = 0;

    function step() {
      if (!live) return;
      var t = (Date.now() - t0) / dur;
      if (t > 1) t = 1;
      set(t);
      if (typeof tick === 'function') tick();
      if (t < 1) id = raf(step);
      else id = 0;
    }

    function start() {
      if (live) return;
      live = true; t0 = Date.now();
      if (!id) id = raf(step);
    }
    function stop() {
      live = false;
      if (id) { window.cancelAnimationFrame(id); id = 0; }
      set(null);
      if (typeof tick === 'function') tick();
    }

    /* A pinned section is taller than the viewport, so it can never be 50% visible and a
       ratio threshold would never fire. The centre line is the test the homepage uses for
       the same reason: the section is "in view" when the middle of the screen is inside it. */
    new IntersectionObserver(function (entries) {
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) start(); else stop();
      }
    }, { rootMargin: '-50% 0px -50% 0px' }).observe(el);
  }

  /* --------------------------------------------------------------------------------------
     The measured band for the demo panel.
     -------------------------------------------------------------------------------------- */
  function fitPanel() {
    var pin = document.querySelector('.aidemopin');
    var wrap = document.querySelector('.aiwrap');
    var text = document.querySelector('.aitextcol');
    var box = document.getElementById('aiBox');
    if (!pin || !wrap || !text || !box) return;

    var cs = getComputedStyle(pin);
    var padT = parseFloat(cs.paddingTop) || 0;
    var padB = parseFloat(cs.paddingBottom) || 0;
    var gap = parseFloat(getComputedStyle(wrap).rowGap) || 0;

    /* the pin is 100svh by construction, but read it rather than assume it — a browser that
       is mid-chrome-collapse reports something else and the panel would be sized for a
       viewport that is not on screen */
    /* 3px of slack: the three measured boxes each round to a subpixel and the errors stack in
       whichever direction the layout happens to land. Without it a 390px phone sat 2px proud. */
    var avail = pin.getBoundingClientRect().height - padT - padB - text.getBoundingClientRect().height - gap - 3;
    if (!(avail > 0)) return;

    /* never larger than the panel was ever drawn at, and never so small it stops reading as a
       screen: below 240px the act text inside it is illegible whatever the clamp says, and it
       is better to let the last few pixels crop than to render a stamp */
    var h = Math.max(240, Math.min(avail, 572));
    pin.style.setProperty('--ai-h', h.toFixed(0) + 'px');
  }

  /* --------------------------------------------------------------------------------------
     THE DEMO, AS FOUR FOLDS
     --------------------------------------------------------------------------------------
     The section's four acts were one timed carousel: enter the section and twenty-two
     seconds later it had all happened, whether you were reading or not. On a phone they are
     four folds stacked one below the other instead — scrolling moves you from act to act, and
     each act plays itself once when you arrive. Which is the homepage's model exactly: the
     fold you are on comes from the scroll position, and the animation inside it runs on its
     own clock.

     The act boundaries are the driver's own, read off `setAct`: g < .452 is the blueprint,
     then .652, then .852, then the rest. Each act's range is played from its start to a hair
     under its end — landing exactly on .452 would tip setAct into the next act while the
     scroll still says you are in this one, and the panel would flicker between two states.
     -------------------------------------------------------------------------------------- */
  var G0 = 0;
  var ACT = [];
  var DUR = [7600, 5200, 5200, 6400];   /* the blueprint has the most to do */

  function buildActs() {
    G0 = window.__cpDemoG0 || 0.2055;
    var E = 0.0008;
    ACT = [[G0, 0.452 - E], [0.452, 0.652 - E], [0.652, 0.852 - E], [0.852, 1]];
  }

  function demoFolds(sec) {
    if (!sec) return;
    var act = -1, t0 = 0, id = 0, live = false;

    function actFromScroll() {
      var r = sec.getBoundingClientRect();
      var span = r.height - (window.innerHeight || 1);
      var p = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 0;
      /* four equal stops; the last one keeps the tail of the section so the final act is not
         cut off a fraction early by rounding */
      return Math.min(3, Math.floor(p * 4));
    }

    function step() {
      if (!live) return;
      var a = ACT[act] || ACT[0];
      var t = (Date.now() - t0) / (DUR[act] || 5000);
      if (t > 1) t = 1;
      window.__cpAutoG = a[0] + (a[1] - a[0]) * t;
      if (window.__cpDemoFrame) window.__cpDemoFrame();
      id = t < 1 ? raf(step) : 0;
    }

    function sync() {
      if (!live) return;
      var a = actFromScroll();
      if (a === act) return;
      act = a; t0 = Date.now();
      if (!id) id = raf(step);
    }

    function start() { if (live) return; live = true; act = -1; sync(); }
    function stop() {
      live = false;
      if (id) { window.cancelAnimationFrame(id); id = 0; }
      window.__cpAutoG = null;
      if (window.__cpDemoFrame) window.__cpDemoFrame();
    }

    new IntersectionObserver(function (es) {
      for (var i = 0; i < es.length; i++) { if (es[i].isIntersecting) start(); else stop(); }
    }, { rootMargin: '0px' }).observe(sec);

    addEventListener('scroll', sync, { passive: true });
    addEventListener('resize', sync, { passive: true });
  }

  /* --------------------------------------------------------------------------------------
     THE CURSOR, NARROWED TO ITS CLICKS
     --------------------------------------------------------------------------------------
     On desktop the hiring manager's pointer crosses the panel to hover a chip, then the
     slider, then a matrix cell, then the submit — a person working through a form. At phone
     scale those targets are a few millimetres apart and the same choreography reads as a
     pointer skittering around the screen.

     So on a phone it does one thing per act: it arrives, it presses the one button that
     matters, and it leaves. Three moments in the whole section — Design the journey, the
     evidence, the invite — and nothing in between.
     -------------------------------------------------------------------------------------- */
  function cursorPolicy() {
    var A2 = 0.43;
    /* each window is [from, to) on the driver's own clock, sized to arrive a beat before the
       press and leave a beat after it */
    window.__cpCursorOn = function (g, p) {
      if (g < A2) return p >= 0.800 && p < 0.940;   /* the submit */
      if (g < 0.852) return g >= 0.726 && g < 0.812; /* the evidence */
      return g >= 0.958 && g < 0.996;                /* the invite */
    };
    window.__cpCursorAim = function (g, p, els) {
      if (g < A2) return els.submit;
      if (g < 0.852) return els.ev;
      return els.share || els.live;
    };
  }

  function boot() {
    buildActs();
    cursorPolicy();

    /* the book is fitted to its own pane rather than the pane's parent — see __cpBookPane */
    if (window.__cpBookPane) window.__cpBookPane(true);

    /* ---- the hero: the brief types itself ---------------------------------------------
       Seven seconds end to end. The scroll-linked version spends 0.08-0.60 of its progress
       filling in 24 words and the rest on the send, so the same ramp gives roughly four
       seconds of typing and three of the manager arriving and pressing send. */
    autoplay(document.getElementById('herofold'), 7000,
      function (t) { window.__cpAutoQ = t; },
      function () { if (window.__cpHeroFrame) window.__cpHeroFrame(); });

    demoFolds(document.getElementById('aidemo'));

    fitPanel();
  }

  /* companies.js publishes its frame functions as it runs, and it runs after this file, so
     the observers are wired on the next task rather than now. The panel is measured again
     once the fonts are in, because the act title's height is what the band is measured
     against and a fallback face is a different number of lines. */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else setTimeout(boot, 0);

  addEventListener('resize', fitPanel, { passive: true });
  addEventListener('orientationchange', fitPanel);
  addEventListener('load', fitPanel);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitPanel);
})();
