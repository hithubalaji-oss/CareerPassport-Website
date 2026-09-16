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
    /* THE ATTRIBUTE HAS TO GO ON ALL FOUR.
       .outro and .ftr are siblings of <main>, not children of it — so every rule written as
       `main[data-mfold] .outro ...` matched nothing at all, and the whole closing-frame
       behaviour (pinning the ring and the copy together, the opaque footer, the outro's exit)
       was inert while looking perfectly correct in the stylesheet. That is why the passport
       sat still while the ring scrolled past it.
       Four narrow subtrees rather than one attribute on <html> or <body>, for the reason in
       the mobile-passport.css header: a root attribute invalidates style for the whole
       document and costs more than the driver it replaced. */
    var main = document.querySelector('main');
    var outroEl = document.querySelector('.outro');
    var ftrEl = document.querySelector('.ftr');
    var hosts = [stage, main, outroEl, ftrEl].filter(Boolean);
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
    function setVar(k, v) { for (var i = 0; i < hosts.length; i++) hosts[i].style.setProperty(k, v); }
    function clearVar(k) { for (var i = 0; i < hosts.length; i++) hosts[i].style.removeProperty(k); }
    function setState(n) { for (var i = 0; i < hosts.length; i++) hosts[i].setAttribute('data-mfold', n); }

    /* ============================================================================================
       THE ART BAND — measured, not guessed
       ============================================================================================
       This is the thing that makes every fold arrange itself the same way on every phone.

       The fault it replaces: the copy column and the passport were positioned by two systems
       that could not see each other. The column rests at the foot of its fold's pin (it was
       a fixed box until 15 Sep; now it scrolls, and is measured at rest) and sizes itself to
       its own text — so its top edge moves with the screen AND with how the text rewraps. The passport was placed by a hand-tuned scale and offset per fold. The gap
       between them was therefore an accident, and it came out at 152px on one phone and -2px on
       another. Measured across six viewports before this change, fold 4 overlapped its own
       headline by 34px at 412x730, 43px at 390x700 and 68px at 360x640, while sitting 46px
       clear at 412x915. Same code, four different compositions.

       What happens instead: at each state change we measure where the copy actually ended up,
       and hand the art everything above it. The art then FILLS that band rather than being
       positioned into a gap, so the proportions are identical everywhere and only the band's
       absolute size changes — which is exactly "the relative positions stay the same, only the
       padding changes with the screen".

       Cost: four layout reads per state change. Seven state changes in a visit. Not per frame.

       Fold 1 is the one inversion — eyebrow, then art, then copy — so its band starts under the
       eyebrow rather than under the header. Every other fold is art, then copy. */
    var hdrEl = document.querySelector('.hdr');
    var GAP = 14;   /* air between the art and the first line of copy */
    var GUT = 20;   /* the page's own side gutter, for width-limited art */

    /* The copy is in flow at the foot of its fold's sticky .pin (mobile-passport.css), so it
       is measured where it RESTS — the pin stuck to the top of the viewport — not where it
       happens to be when the state changes, which is half a screen lower and still rising.
       The distance from the column's top to the pin's bottom never changes as it scrolls, so
       its resting top is the pin's own height minus that distance. Same for the outro, whose
       section is its own 100svh frame. */
    function restingTop(el, host) {
      var h = host.getBoundingClientRect(), r = el.getBoundingClientRect();
      return h.height - (h.bottom - r.top);
    }
    function restingBottom(el, host) {
      var h = host.getBoundingClientRect(), r = el.getBoundingClientRect();
      return r.bottom - h.top;
    }
    function copyTopFor(n) {
      /* fold 1's copy begins at the handle row, not at the eyebrow: the eyebrow is ABOVE the
         passport there, and is the band's top edge rather than its bottom. */
      if (n === 1) {
        var first = document.querySelector('#f1 .metarow') || document.querySelector('#f1 .field');
        var pin1 = document.querySelector('#f1 .pin');
        return first && pin1 ? restingTop(first, pin1) : innerHeight;
      }
      if (n >= 6) {
        var oc = document.querySelector('.outro .ocopy'), ou = document.querySelector('.outro');
        return oc && ou ? restingTop(oc, ou) : innerHeight;
      }
      var col = document.querySelector('#f' + n + ' .col');
      var pin = document.querySelector('#f' + n + ' .pin');
      return col && pin ? restingTop(col, pin) : innerHeight;
    }

    function bandTopFor(n) {
      var hdrB = hdrEl ? hdrEl.getBoundingClientRect().bottom : 76;
      if (n === 1) {
        var eb = document.querySelector('#f1 .eyebrow'), pin1 = document.querySelector('#f1 .pin');
        return (eb && pin1 ? restingBottom(eb, pin1) : hdrB) + GAP;
      }
      return hdrB + GAP;
    }

    function measure(n) {
      /* the art layer is a 100svh box at the current fold's top (see .stage[data-mfold] in
         the stylesheet); every value below is relative to THAT box, not the viewport, so the
         measurement is the same whether or not the fold is at rest when it is taken */
      var sr = stage.getBoundingClientRect();
      var vh = sr.height || innerHeight, vw = innerWidth;
      var top = bandTopFor(n);
      var bot = copyTopFor(n) - GAP;
      if (bot - top < 80) bot = top + 80;       /* a floor, so nothing ever inverts */
      var h = bot - top;

      setVar('--art-top', top.toFixed(1) + 'px');
      setVar('--art-bot', bot.toFixed(1) + 'px');
      setVar('--art-h',   h.toFixed(1) + 'px');
      /* the band's centre, expressed the way .bookwrap needs it: as an offset from the
         viewport centre, which is where the wrap's own origin sits */
      setVar('--art-dy',  ((top + bot) / 2 - vh / 2).toFixed(1) + 'px');
      /* a book page is 640 tall, so this is "scale 1 = exactly fills the band's height".
         Every state then asks for a FRACTION of the band rather than an absolute size. */
      setVar('--art-fit', (h / 640).toFixed(4));
      /* and the same for width, for the one state that is wider than it is tall: the open
         spread is the full 920, and on a phone the width runs out before the height does */
      setVar('--fit-w',   ((vw - 2 * GUT) / 920).toFixed(4));
      /* THE CROWD PLATE IS SIZED BY WIDTH, NOT BY THE BAND. Fold 2's copy is short and sits
         low, so its band is the tallest on the page — 592px at 412x915. A plate stretched to
         fill that is a 1.5:1 photograph blown up to 882px wide: the hall stops being a room
         and becomes three enormous silhouettes. It takes 125% of the viewport width (enough
         to bleed past both gutters and hide its feathered edges) and only falls back to the
         band when the band is the tighter of the two. */
      var PLATE_AR = 2528 / 1696;
      var plateW = Math.min(vw * 1.25, h * PLATE_AR);
      var plateH = plateW / PLATE_AR;
      setVar('--cbg-w',   plateW.toFixed(1) + 'px');
      setVar('--cbg-top', (top + (h - plateH) / 2).toFixed(1) + 'px');
      /* LEFT AS A NUMBER, not left:50% + translate:-50%. The driver clamps each claim card's
         lane to keep it on screen using the callout layer's offsetLeft — and offsetLeft is a
         layout value that knows nothing about transforms, so a translated layer reports the
         position it would have had untranslated and every card is clamped against the wrong
         edge. That is the cards colliding in the middle and hanging off the left edge. */
      setVar('--cbg-left', ((vw - plateW) / 2).toFixed(1) + 'px');
      /* and the passport in fold 2 is scaled against the PLATE, not the band — it is standing
         in front of the hall, so its size is a relationship with the hall */
      setVar('--plate-fit', (plateH / 640).toFixed(4));

      /* fold 2: the callout layer only just got its real box, so the cards are re-placed now.
         Their lanes are clamped against that box's width, and until this measurement ran there
         was nothing to clamp against. */
      if (n === 2 && typeof window.__cpPlaceClaims === 'function') window.__cpPlaceClaims();

      /* fold 4: the passport's bottom-right corner sits ON the Companion box's bottom-right
         corner. That is a relationship between two measured boxes, so it is computed here in
         full — scale included — rather than split between a fraction in CSS and arithmetic
         here, which would drift the moment either side changed. Read AFTER the band is
         written, because .flow is positioned from it. */
      if (n === 4) {
        var flow  = document.getElementById('flow');
        var box   = document.querySelector('#orbSrc .fbot');
        if (flow && box) {
          /* The chart's content is a fixed 231px — five source tiles, a gap, and the Companion
             node — and it does not reflow. On a tall phone the band is 437px and it fits with
             room to spare; at 360x640 the band is 201px and it overruns by 30, which is how the
             Companion box ended up below the band with the passport corner-aligned to it and
             therefore sitting on the headline.
             It shrinks to fit and NEVER grows: unlike the passport, the chart is type and it has
             an intrinsic legible size. Scaling it up to fill a tall band would just make a
             diagram of 10px labels into a diagram of 19px labels. */
          setVar('--flow-fit', '1');
          /* the BOX's height, not the tiles-to-node span: the box carries a little more than
             its two visible children, and fitting the span left the node 4px past the band */
          var natural = flow.getBoundingClientRect().height;
          var fit = natural > 0 ? Math.min(1, h / natural) : 1;
          setVar('--flow-fit', fit.toFixed(4));
          /* .flow's box hugs its content (height:auto) and is POSITIONED here rather than
             stretched between the band's two edges. Stretching it and scaling was the obvious
             thing and it does not work: the transform shrinks the box and the content by the
             same factor, so content that overran a fixed-height box still overruns it after
             scaling, exactly as far in proportion. Measured at 360x640: 231px of content in a
             201px box stayed 30px over, scaled or not. With height:auto the box IS the content,
             so the scale genuinely reduces it, and this centres the result in the band. */
          setVar('--flow-top', (top + (h - natural * fit) / 2).toFixed(1) + 'px');

          /* the corner, read AFTER the fit — the box has just moved */
          var r = box.getBoundingClientRect();
          /* SIZED AGAINST THE NODE, not the band. The passport's corner is pinned to the
             node's corner, so the two are one object and its size is a relationship with the
             node — not with the band, which is a different height in every fold. Against the
             band it came out 175px tall on a big phone (taller than the 131px node it hangs
             off) and 60px on a small one, where it stopped reading as a passport at all.
             At 0.92 of the node's height it is the same card, in the same place, everywhere. */
          /* 0.92 of the node's height was the size that made it read as the same card in the
             same place on every phone. It is now 30% smaller on request — 0.644 — and the two
             offsets below are derived from `s`, so the bottom-right corner stays pinned to the
             node's bottom-right corner without any other change. */
          var s = (r.height * 0.92 * 0.7) / 640;
          var cw = 460 * s, ch = 640 * s;
          setVar('--f4-scale', s.toFixed(4));
          setVar('--f4-dx', ((r.right  - sr.left) - vw / 2 - cw / 2).toFixed(1) + 'px');
          setVar('--f4-dy', ((r.bottom - sr.top)  - vh / 2 - ch / 2).toFixed(1) + 'px');
        }
      }
    }

    var SNAP_ABOVE = 2.2;                    /* px/ms — a deliberate flick, not a read */

    /* ---- hold still while someone is typing ----
       Focusing a field makes the browser scroll it into view, and on a phone the keyboard
       takes half the screen doing it. Either one moves the centre line this observer watches,
       so the passport would change state — open, travel, fade — while the reader is in the
       middle of typing their handle into fold 1. It looked like the page had lost its place.
       The viewport meta stops the layout viewport resizing; this stops the scroll doing the
       same thing by a different route. The state that WOULD have been applied is remembered
       and lands on blur, so nothing is skipped, it is only deferred. */
    var typing = false, pending = null;

    /* The layout half of this is fixed by interactive-widget=resizes-visual in the viewport
       meta, not here. Freezing fold 1's column in JS was tried and reverted: pinning it to its
       pre-keyboard position leaves the handle field at y=527 in a 420px viewport — below the
       keyboard, on a position:fixed element that scrolling cannot reach. The browser's own
       reflow is ugly but leaves the field tappable, and a broken layout beats an unusable one.
       What stays here is the half the meta cannot cover: the scroll. */
    document.addEventListener('focusin', function (e) {
      var t = e.target;
      if (!t || (t.tagName !== 'INPUT' && t.tagName !== 'TEXTAREA' && !t.isContentEditable)) return;
      typing = true;
    });
    document.addEventListener('focusout', function () {
      typing = false;
      if (pending !== null) { var n = pending; pending = null; apply(n); }
    });

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

    /* ---- the art layer's anchor ----
       #stage is absolutely positioned at the top of the current section, in document
       coordinates, so it scrolls with that section. Re-read on resize and font arrival with
       the rest of the measurement, since section tops move when text rewraps. */
    function placeStage(n) {
      var el = sections[n - 1]; if (!el) return;
      stage.style.setProperty('--stage-top', Math.round(el.getBoundingClientRect().top + (window.scrollY || 0)) + 'px');
    }

    var moveT = 0;
    function apply(n) {
      if (n === current) return;
      if (typing) { pending = n; return; }
      /* The layer moves a whole section in one step, so it fades across the step: out where
         it was, in where it now belongs. 140ms out, then the move, then 200ms back. A second
         change inside that window simply retargets the pending move. */
      if (moveT) clearTimeout(moveT);
      stage.classList.add('moving');
      moveT = setTimeout(function () {
        moveT = 0;
        commit(n);
        requestAnimationFrame(function () { stage.classList.remove('moving'); });
      }, 140);
    }
    function commit(n) {
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
      setState(String(n));
      placeStage(n);
      /* after the attribute and the move, so the new fold's copy is the one measured */
      measure(n);
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
      /* Collapsing the root to a 1px line asks the right question: which section is under
         that line? Exactly one at a time, so the callback is unambiguous. The line sits at
         55% down the screen rather than the centre: a section becomes current once its top
         has risen past 45svh, by which point the previous section's art band (which ends at
         most ~65svh below its own top) has already cleared the header. So when the art layer
         steps to the new section, nothing was on screen where it left from. */
      rootMargin: '-55% 0px -45% 0px',
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
    setState('1');
    placeStage(1);
    measure(1);

    /* The band depends on where the text ended up, so it has to be re-taken whenever the text
       could have moved: a rotation, a resize, and web fonts arriving — that last one changes
       every line's metrics and therefore the column's height, and it lands well after the
       first paint. */
    var remeasure = function () { placeStage(current || 1); measure(current || 1); };
    addEventListener('resize', remeasure);
    addEventListener('orientationchange', remeasure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(remeasure);
    addEventListener('load', remeasure);
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
