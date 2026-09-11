/* ============================================================================================
   ?d=N — a bisect you run on the phone that actually has the problem
   ============================================================================================

   TEMPORARY. Delete this file, its <script> tag in index.astro and the [data-diag] block at
   the foot of mobile-passport.css once the S23 Ultra question is settled.

   WHY IT EXISTS. Every candidate for the flickering is a GPU-side, resolution-dependent cost:
   a live backdrop blur behind the header, large blur() radii on the decorative glows, the
   passport's own surfaces. None of them shows up in anything this environment can measure —
   a headless Chromium rasterises in software, so its frame pacing is not a model of a phone's
   compositor. Two rounds of measurement here produced numbers that contradicted each other.

   So the measurement moves to the device. Each step switches off one more candidate. Load
   them in order on the phone and scroll; the FIRST one that renders cleanly names the cause,
   and no step past that needs running.

     ?d=0   everything as shipped                      the control
     ?d=1   + header backdrop-filter off               a live blur of the whole page, per frame
     ?d=2   + every decorative blur() off              radius^2 x area, both scale with DPR
     ?d=3   + the passport's surfaces cut down         one flat layer instead of a 3D stack
     ?d=4   + no passport at all                       if THIS flickers, none of it is the cause

   Step 4 is the one that matters most. It is the control that can rule the passport out
   entirely, which nothing measured from here has been able to do.

   The badge in the corner is not decoration: it is what makes a screen recording legible
   afterwards, and it names the build, so a stale cache can never be mistaken for a fix again.
   -------------------------------------------------------------------------------------------- */
(function () {
  var BUILD = (typeof __CP_BUILD__ === 'string' ? __CP_BUILD__ : 'dev');

  /* Always expose the build id, even with no ?d= — it costs nothing and it is the answer to
     "am I actually looking at the new version?", which has cost us a round trip already. */
  try { document.documentElement.setAttribute('data-build', BUILD); } catch (e) {}

  var m = /[?&]d=(\d)/.exec(location.search);
  if (!m) return;

  var step = Math.max(0, Math.min(4, +m[1]));
  document.documentElement.setAttribute('data-diag', String(step));

  var LABEL = [
    'control — everything on',
    'header blur off',
    '+ decorative blurs off',
    '+ passport flattened',
    '+ passport removed'
  ];

  function badge() {
    var el = document.createElement('div');
    el.className = 'cpdiag';
    el.textContent = 'd=' + step + ' · ' + LABEL[step] + ' · ' + BUILD;
    document.body.appendChild(el);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', badge);
  else badge();
})();
