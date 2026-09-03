/* CareerPassport — shared page engine.
   Drives: progress bar, mobile nav, reveal-on-enter, and the one persistent
   product surface whose contents cross-fade fold by fold. Same scroll model as
   the homepage: each .fold is a tall section with a sticky pin; the fold's own
   0..1 progress stages the panel's contents. */
(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var clamp=function(v,a,b){return v<a?a:v>b?b:v};
var seg=function(v,a,b){return clamp((v-a)/(b-a),0,1)};
var win=function(g,a,b,f){return Math.min(seg(g,a,a+f),1-seg(g,b-f,b))};

/* ---- mobile nav ---- */
var burger=$('#burger'),mnav=$('#mnav');
if(burger){burger.addEventListener('click',function(){
  var o=mnav.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false');});}
if(mnav){$$('a',mnav).forEach(function(a){a.addEventListener('click',function(){
  mnav.classList.remove('open');burger.setAttribute('aria-expanded','false');});});}

/* ---- reveal ---- */
if('IntersectionObserver' in window){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.2});
  $$('.reveal').forEach(function(el){io.observe(el);});
}else{$$('.reveal').forEach(function(el){el.classList.add('in');});}

/* ---- the fold engine ---- */
var folds=$$('main .fold');
var scenes={};
$$('.scene').forEach(function(s){scenes[s.getAttribute('data-fold')]=s;});
var stage=$('#stage'),prog=$('.prog'),bar=$('#devbar'),outro=$('#outro');
var steps=$$('[data-step]');
var sceneFolds={};
$$('.scene').forEach(function(s){sceneFolds[s.getAttribute('data-fold')]=1;});
var vh=innerHeight;
var stacked=matchMedia('(max-width:1024px)');
addEventListener('resize',function(){vh=innerHeight;},{passive:true});

function frame(){
  try{ tickFrame(); }catch(e){ if(!frame._e){frame._e=1;console.error('cp-page frame error:',e);} }
  requestAnimationFrame(frame);
}
/* rAF is throttled to nothing while the document is hidden (backgrounded tab, offscreen
   preview, pre-paint capture), which would leave every fold stuck at its rest state. Scroll
   and resize therefore tick the same body directly, coalesced so a burst costs one pass. */
var pending=false;
function nudge(){
  if(pending) return;
  pending=true;
  var run=function(){ pending=false; try{ tickFrame(); }catch(e){} };
  if(document.hidden) run(); else requestAnimationFrame(run);
}
addEventListener('scroll',nudge,{passive:true});
addEventListener('resize',nudge,{passive:true});
addEventListener('load',nudge);
document.addEventListener('visibilitychange',nudge);
function tickFrame(){
  /* read the viewport here, not once at parse time: in a hidden or pre-layout document
     innerHeight is 0 and no resize ever fires, which would leave the divisor at 1 and every
     fold's progress wrong for the whole session */
  vh=innerHeight||document.documentElement.clientHeight||1;
  var y=scrollY||pageYOffset;
  var doc=document.documentElement.scrollHeight-vh;
  if(prog){
    var pw=(doc>0?(y/doc*100):0).toFixed(2)+'%';
    if(prog._pw!==pw){prog._pw=pw;prog.style.setProperty('--pw',pw);}
  }

  var active=null,ap=0,best=-1,panelOcc=0;
  folds.forEach(function(f){
    var r=f.getBoundingClientRect();
    /* no layout yet (first tick of a hidden document): every branch below would compute a
       plausible-but-wrong value and the cache would keep it, since rAF is throttled */
    if(r.height===0) return;
    var span=r.height-vh;
    /* fold progress: 0 as the pin engages, 1 as it releases */
    /* on the very first tick of a hidden or pre-layout document both innerHeight and the
       fold's own height are 0, so the else branch would evaluate 0/0 and poison the cache
       with NaN — which @property then rejects, leaving the fold dead until a real scroll */
    var p=span>0?clamp(-r.top/span,0,1):clamp((vh*.5-r.top)/Math.max(vh,1),0,1);
    if(!isFinite(p))p=0;
    /* how centred this fold is in the viewport right now */
    var occ=win((vh*.5-r.top)/Math.max(r.height,1),0,1,.06);
    var sc=scenes[f.id];
    if(sc)sc.style.opacity=occ.toFixed(3);
    /* folds are free to opt out of the shared panel: the panel's own opacity follows the
       best-occupied fold that HAS a scene, so a full-bleed fold shows no empty frame */
    if(sceneFolds[f.id]&&occ>panelOcc)panelOcc=occ;
    /* every fold publishes its own progress, so a fold can drive bespoke art from CSS
       alone without another scroll listener */
    /* --p and --occ are unregistered-ish custom properties feeding a lot of rules, so a
       write invalidates everything that substitutes them. Only write on real change. */
    var ps=p.toFixed(3), os=occ.toFixed(3);
    if(f._p!==ps){f._p=ps;f.style.setProperty('--p',ps);}
    if(f._o!==os){f._o=os;f.style.setProperty('--occ',os);}
    /* stacked layout: the copy rows are taken out of flow, so they hand over
       sideways on the same clock the panel uses */
    var col=f.querySelector('.col');
    if(col){
      if(stacked.matches){
        col.style.opacity=occ.toFixed(3);
        col.style.transform='translateX('+((1-occ)*(p<.5?26:-26)).toFixed(1)+'px)';
        col.style.pointerEvents=occ>.5?'auto':'none';
      }else if(col.style.opacity){col.style.opacity='';col.style.transform='';col.style.pointerEvents='';}
    }
    if(occ>best){best=occ;active=f;ap=p;}
  });

  if(active){
    if(bar){
      var t=active.getAttribute('data-bar');
      if(t&&bar.getAttribute('data-cur')!==t){bar.setAttribute('data-cur',t);$('b',bar).textContent=t;}
      var m=active.getAttribute('data-meta');
      if(m&&bar.querySelector('small'))bar.querySelector('small').textContent=m;
    }
    steps.forEach(function(el){
      var host=el.closest('.scene')||el.closest('.fold');
      var id=host?(host.getAttribute('data-fold')||host.id):null;
      var mine=id===active.id;
      var th=parseFloat(el.getAttribute('data-step'))||0;
      var off=el.getAttribute('data-off');
      var on=mine&&ap>=th&&(off===null||ap<parseFloat(off));
      el.classList.toggle('on',on);
    });
  }

  /* the surface leaves as the closing act arrives */
  if(stage&&outro){
    var or=outro.getBoundingClientRect();
    stage.style.setProperty('--stageOp',(clamp(or.top/(vh*.72),0,1)*panelOcc).toFixed(3));
  }
}
requestAnimationFrame(frame);
nudge();

/* ---- rolling logs inside the panel ---- */
$$('.slist').forEach(function(list){
  var rows=$$('p',list);if(rows.length<4)return;
  var h=rows[0].offsetHeight||30,i=0,vis=Math.max(1,Math.round(list.parentNode.offsetHeight/h));
  function step(){
    rows.forEach(function(r,n){r.classList.toggle('cur',n===i);});
    var shift=Math.max(0,Math.min(i-Math.floor(vis/2),rows.length-vis));
    list.style.translate='0 '+(-shift*h)+'px';
    i=(i+1)%rows.length;
  }
  step();setInterval(step,1900);
});

/* ---- waitlist / demo capture ---- */
$$('[data-capture]').forEach(function(form){
  var input=$('input',form),btn=$('button',form);if(!input||!btn)return;
  var done=btn.getAttribute('data-done')||'REQUEST SENT';
  btn.addEventListener('click',function(){
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value.trim()))return input.focus();
    form.classList.add('done');btn.textContent=done;input.readOnly=true;
  });
  input.addEventListener('keydown',function(e){if(e.key==='Enter')btn.click();});
});
})();
