(function(){
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var clamp=function(v,a,b){return v<a?a:v>b?b:v};
var seg=function(v,a,b){return clamp((v-a)/(b-a),0,1)};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
/* opacity window: up over `f` after a, down over `f` before b */
var win=function(g,a,b,f){return Math.min(seg(g,a,a+f),1-seg(g,b-f,b))};

/* ---------- build the orbiting groups ---------- */

var seed=20260822;
function rnd(){seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296}
var dust='';
for(var dd=0;dd<8;dd++){
  var ds=(1+rnd()*1.4).toFixed(1);
  dust+='<i style="left:'+(rnd()*100).toFixed(1)+'%;top:'+(18+rnd()*70).toFixed(1)+'%;width:'+ds+'px;height:'+ds+
   'px;animation-duration:'+(8+rnd()*10).toFixed(1)+'s;animation-delay:-'+(rnd()*14).toFixed(1)+'s"></i>';
}
/* Served from public/ at the site root, so both resolve the same on every route.
   Same-origin matters for the hero: the video is chroma-keyed on a canvas, and a
   cross-origin source would taint it and make getImageData throw. */
var CROWD_SRC='/uploads/Crowd-6ce23065.png';
var LIFT_SRC='/assets/hero-lift.mp4';
$('#crowd').innerHTML='<div class="cbg" id="cbg"><img id="cbgImg" src="'+CROWD_SRC+'" alt=""></div>'+
  '<div class="hglow" id="hglow"></div>'+
  '<div class="heroFig" id="hero"><div class="hbloom"></div>'+
    '<video id="heroVideo" src="'+LIFT_SRC+'" muted playsinline preload="auto" style="position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;left:-9999px"></video>'+
    '<canvas class="heroCv" id="heroCv"></canvas><span class="hand" id="hand"></span>'+
    '<div class="hbloom f" id="hpalm"></div></div>'+
  '<div class="dust">'+dust+'</div><div class="claims" id="claims"></div><div class="vig"></div>';

/* Callouts sit on people in the crowd, at the depth their host stands in: the nearer
   the anchor, the larger and crisper the card. They are on their own five-second
   clock, so the field keeps shifting whether or not you scroll. */
var CLAIMS=[
 'Built a $200M business in 2 months','AI product development leader',
 'Results-driven professional','10x growth, every quarter',
 'Visionary. Builder. Operator.','Scaled teams from 4 to 400',
 'Award-winning innovator','Ex-FAANG. Serial founder.',
 'Turned around a failing division','Top 1% performer, 5 years running',
 'Thought leader in GenAI','Delivered $50M in savings',
 'Trusted advisor to the C-suite','Product visionary & storyteller',
 'Growth hacker. Revenue machine.','Transformational change agent'];
/* anchor slots: x%, y%, depth 0 = nearest */
var SLOTS=[[16,30,.9],[31,24,.72],[47,20,.95],[63,25,.66],[80,31,.88],
           [23,45,.42],[41,40,.5],[59,39,.34],[77,46,.46],
           [13,62,.12],[34,58,.2],[68,57,.16],[87,63,.08]];
(function(){
  var host=$('#claims'); if(!host) return;
  var N=2, html='';
  for(var i=0;i<N;i++) html+='<figure class="clb"><figcaption>THE CLAIM</figcaption><b></b><span class="ctail"></span></figure>';
  host.innerHTML=html;
  var cards=[].slice.call(host.querySelectorAll('.clb'));
  var pool=CLAIMS.slice(), used=[];
  function pick(){
    if(!pool.length){ pool=used; used=[]; }
    var k=(Math.random()*pool.length)|0, v=pool.splice(k,1)[0];
    used.push(v); return v;
  }
  /* Each cycle draws a fresh spread of five anchors, then keeps only the five that sit
     furthest down the frame — so the callouts always land on the nearer, larger figures
     rather than floating up in the empty depth. x is re-rolled every time. */
  /* Five rows and five columns, each used exactly once per cycle. Rows are far enough
     apart that two cards cannot meet vertically, and a card's column is its own, so
     they cannot meet horizontally either — overlap is impossible by construction rather
     than filtered out afterwards. x and y are re-rolled inside each cell every cycle. */
  /* Lanes skip the centre band: the hero stands there, and a card behind him reads as a
     mistake. Cards are centred on their lane, so a lane must sit at least a half-card
     in from the plate's edge or the card hangs off the image. HALF is that half-width
     as a share of the plate, and lanes are clamped inside [HALF, 100-HALF]. */
  /* The two shaded regions marked on the plate, as shares of the image box. They sit on
     the two standing groups; the bright centre aisle, the ceiling and the empty floor
     are outside them, so a card can only ever land on people.
     Two cards at a time, one per region — card 0 owns the left region, card 1 the right,
     so the pair can never meet and never share a side. RISE lifts the whole setup off
     the marked band; it is in px because it is an optical nudge, not a share of the
     plate, and must not scale with the image. */
  /* The 14 marked anchor points, one above each crowd member's head, as shares of the
     plate box — left group and right group. A card is centred on its anchor, so an
     anchor nearer the plate edge than a half-card cannot host one; the two outermost
     dots (x 8 and x 93) are therefore not in these pools. The hero stands between the
     groups, so no anchor can put a card behind him. */
  var ANCHORS=[
    [[17.1,67.7],[19.9,69.2],[24.3,68.1],[29.4,67.9],[33.3,68.3]],
    [[62.0,69.6],[64.4,68.1],[69.0,67.1],[74.1,68.1],[79.9,68.1]]
  ];
  var HALF=13, VHALF=5.5;
  function shuffle(a){for(var i=a.length-1;i>0;i--){var j=(Math.random()*(i+1))|0,t=a[i];a[i]=a[j];a[j]=t}return a}
  /* A card lands on one of its side's anchor points, never between them. Each side
     remembers the anchor it just used and picks a different one, so a card never
     reappears where it just was. */
  var lastIdx=[-1,-1];
  function place(zi){
    var pool=ANCHORS[zi], i, tries=0;
    do{ i=(Math.random()*pool.length)|0; tries++; }
    while(i===lastIdx[zi] && tries<12);
    lastIdx[zi]=i;
    var a=pool[i], y=a[1];
    /* lower in the frame reads as nearer, so the card is larger and crisper */
    var d=Math.max(0,Math.min(0.9,(1-(y-56)/24)*0.7));
    return [a[0],y,d.toFixed(2)];
  }
  /* Cards are refreshed one at a time, alternating sides, so the field never blinks as a
     whole — one card is always on screen holding the scene. */
  function refresh(zi,first){
    var c=cards[zi]; if(!c) return;
    var apply=function(){
      var p=place(zi);
      c.style.left=p[0].toFixed(2)+'%';
      c.style.top='calc('+p[1].toFixed(2)+'% - var(--rise,90px))';
      c.style.setProperty('--d',p[2]);
      c.querySelector('b').textContent=pick();
      c.classList.add('in');
    };
    if(first) return apply();
    c.classList.remove('in');
    setTimeout(apply,420);
  }
  refresh(0,true); refresh(1,true);
  /* alternate sides: each card is replaced every 5s, but 2.5s out of phase with the
     other, so the two never change together */
  var turn=0;
  setInterval(function(){ refresh(turn,false); turn=1-turn; }, 2500);
})();

/* fold 4: a three-layer flow — sources into the Companion, Companion into the passport */
var SRC=["CV.pdf","LinkedIn","GitHub","Writing","Projects"];
$('#orbSrc').innerHTML='<div class="flow" id="flow">'+
  '<svg class="fsvg" preserveAspectRatio="none"></svg>'+
  '<div class="ftiles">'+SRC.map(function(s){return '<span class="ftile">'+s+'</span>'}).join('')+'</div>'+
  '<div class="fbot">'+
    '<div class="fbh"><span class="fbot-ai" aria-hidden="true"><i></i><i></i></span>'+
      '<b>COMPANION</b><small>WORK AUTHENTICATION LOOP</small></div>'+
    '<div class="froll" id="froll"><div class="frl" id="frl"></div></div>'+
    '<div class="fstage" id="fstage" data-beat="sources" aria-hidden="true">'+
      '<div class="fst sources"><div class="srcw">'+
        '<i class="sdot" style="--sx:-74px;--sy:-26px;--pd:0s"></i><i class="sdot" style="--sx:-58px;--sy:16px;--pd:.25s"></i>'+
        '<i class="sdot" style="--sx:-30px;--sy:-34px;--pd:.5s"></i><i class="sdot" style="--sx:66px;--sy:-22px;--pd:.75s"></i>'+
        '<i class="sdot" style="--sx:52px;--sy:20px;--pd:1s"></i><i class="sdot" style="--sx:24px;--sy:-36px;--pd:1.25s"></i>'+
        '<span class="sdb"><b></b><b></b><b></b></span></div></div>'+
      '<div class="fst memory"><div class="srcw mem"><span class="sdb"><b></b><b></b><b></b></span></div></div>'+
      '<div class="fst talk">'+
        '<div class="tk"><span></span><span class="you"></span><span></span></div></div>'+
      '<div class="fst scan">'+
        '<div class="scanbox"><b></b><b></b><b></b><b></b><i></i><small>SCANNING</small></div></div>'+
      '<div class="fst live">'+
        '<div class="vf"><u></u><u></u><u></u><u></u><s></s>'+
          '<span class="vfrec"><i></i>REC</span>'+
          '<span class="lvl"><i></i><i></i><i></i><i></i></span></div></div>'+
      '<div class="fst stamp"><div class="stampb">'+
        '<div class="sbox dbl" style="--sc:rgba(253,178,60,.85)">'+
          '<i class="sg l">\u2605</i><i class="sg r">\u2605</i>'+
          '<span class="stt">VERIFIED</span>'+
          '<span class="snm">PRODUCT\nDESIGNER</span>'+
          '<span class="sdt">29.08.2026</span>'+
        '</div></div></div>'+
      '<div class="fst loop"><div class="loopw"><span>One loop completed</span></div></div>'+
    '</div>'+
  '</div>'+
'</div>';


/* connectors are built from measured element positions, so the curves always meet the
   tiles and the Companion node. The node-to-passport connector is a measured DOM line
   (.fline) instead, because the passport ducks as the fold advances. */
function buildFlow(){
  var fl=document.getElementById('flow'); if(!fl) return;
  var r=fl.getBoundingClientRect(); if(r.width<20||r.height<20) return;
  var svg=fl.querySelector('.fsvg'), bot=fl.querySelector('.fbot');
  var br=bot.getBoundingClientRect();
  var bx=br.left+br.width/2-r.left, byT=br.top-r.top, byB=br.bottom-r.top;
  var paths='',dots='';
  Array.prototype.forEach.call(fl.querySelectorAll('.ftile'),function(t,i){
    var tr=t.getBoundingClientRect();
    var x=tr.left+tr.width/2-r.left, y=tr.bottom-r.top, m=(y+byT)/2;
    paths+='<path id="fp'+i+'" d="M'+x.toFixed(1)+' '+y.toFixed(1)+' C'+x.toFixed(1)+' '+m.toFixed(1)+','+bx.toFixed(1)+' '+m.toFixed(1)+','+bx.toFixed(1)+' '+byT.toFixed(1)+'"/>';
    dots+='<circle class="fdot d1" r="2.1"><animateMotion dur="2.8s" begin="'+(i*0.5).toFixed(2)+'s" repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="linear"><mpath href="#fp'+i+'"/></animateMotion></circle>';
  });

  svg.setAttribute('viewBox','0 0 '+r.width.toFixed(1)+' '+r.height.toFixed(1));
  svg.innerHTML='<g class="fl1">'+paths+'</g>'+dots;
}
/* The Companion's log keeps its own time — it is a process that runs whether or not you
   are watching, so it is deliberately not tied to scroll. Six lines; the last one is the
   point of the whole cycle, so it is set in gold and held longer. */
var CLOG=[
 ['Connecting to your existing sources',0],
 ['Growing your Companion memory',0],
 ['Talking, listening, nudging',0],
 ['Suggesting a journey to show what you can do',0],
 ['Collecting the evidence you produce',0],
 ['Verifying it with live interaction',0],
 ['Earning the stamp for the skill you proved',1],
 ['Writing the evidence back into memory',1]];
/* each log line is performed by one beat in the node's stage slot */
var CBEAT=['sources','memory','talk','talk','scan','live','stamp','loop'];
(function(){
  var frl=$('#frl'), roll=$('#froll');
  if(!frl||!roll) return;
  var N=CLOG.length, i=0, t=null, run=false;
  var html='';
  for(var k=0;k<N;k++) html+='<p'+(CLOG[k][1]?' class="key"':'')+'><b>'+(k+1)+'</b><span>'+CLOG[k][0]+'</span></p>';
  frl.innerHTML=html;
  var ps=frl.children;
  function sizeRoll(){ roll.style.width=''; roll.style.width=frl.scrollWidth+'px'; }
  sizeRoll();
  window.addEventListener('resize',sizeRoll);
  function show(){
    for(var k=0;k<ps.length;k++) ps[k].classList.toggle('cur',k===i);
    /* the window shows exactly one line, so the strip lifts by i rows — measured, because
       the row height differs between the desktop and stacked type scales */
    var rh=ps[0]?ps[0].offsetHeight:24;
    frl.style.translate='0 '+(-i*rh)+'px';
  }
  var bot=$('.fbot'), st=$('#fstage'), cur=-1;
  /* the single entry point: sets the live line, the lap mark and the stage's beat together,
     so text and visual can never disagree */
  window.__cpStep=function(idx){
    idx=idx<0?0:idx>N-1?N-1:idx;
    if(idx===cur) return;
    cur=i=idx; show();
    if(bot) bot.classList.toggle('lap', !!CLOG[i][1]);
    if(st){ var bt=CBEAT[i]||'talk'; if(st.getAttribute('data-beat')!==bt) st.setAttribute('data-beat',bt); }
  };
  window.__cpStepCount=N;
  show();
})();

window.addEventListener('resize',buildFlow);
setTimeout(buildFlow,60);

/* six stamps, each its own die: shape, ink and angle, like a real passport page */
var STAMPS=[
 ["SYSTEM\nDESIGN","EARNED","14.07.2026","oval dbl","rgba(47,91,255,.72)",-7,"\u2708"],
 ["DECISION\nMAKING","VERIFIED","02.08.2026","dbl","rgba(200,85,106,.8)",5,"\u2605"],
 ["AGENT\nBUILDER","EARNED","19.08.2026","round","rgba(150,112,42,.9)",-3,"\u2605"],
 ["INCIDENT\nRESPONSE","VERIFIED","27.08.2026","oval","rgba(23,48,95,.78)",8,"\u2708"],
 ["TECHNICAL\nWRITING","EARNED","03.09.2026","pill dbl","rgba(150,112,42,.85)",-6,""],
 ["SPACE FOR\nMORE","","","round dash","rgba(23,48,95,.34)",2,""]];
$('#stampGrid').innerHTML=STAMPS.map(function(s,i){
  return '<div class="st" data-i="'+i+'"><div class="sbox '+s[3]+'" style="--sc:'+s[4]+';rotate:'+s[5]+'deg">'+
    (s[6]?'<i class="sg l">'+s[6]+'</i><i class="sg r">'+s[6]+'</i>':'')+
    (s[1]?'<span class="stt">'+s[1]+'</span>':'')+
    '<b class="snm">'+s[0]+'</b>'+
    (s[2]?'<span class="sdt">'+s[2]+'</span>':'')+
  '</div></div>';
}).join('');

var BEATS=[["01","Connect what already exists","Your CV, LinkedIn, GitHub, writing, projects, documents and demos flow in."],
 ["02","Talk about what you're living","Your Companion listens, remembers, asks and nudges."],
 ["03","Follow a curated journey","Revisit something you built. Explain a decision. Solve something. Create something."],
 ["04","Evidence, then a Stamp","The moment becomes an artifact — and real depth earns a signal that carries forward."]];
$('#beatList').innerHTML=BEATS.map(function(b){
  return '<div class="bt"><b>'+b[0]+'</b><div><h3>'+b[1]+'</h3><p>'+b[2]+'</p></div></div>';
}).join('');

/* ---------- element handles ---------- */
var stage=$('#stage'),zone=$('.zone'),book=$('#book'),wrap=$('#bookwrap'),cover=$('#cover'),
    verso=$('#verso'),prog=$('.prog'),
    folds=$$('.fold'),
    leaves=[$('#cover'),$('#leaf1'),$('#leaf2'),$('#leaf3'),$('#leaf4')],
    pgids=$$('.pgid .hnd'), curls=[], spine=$('#spine'), oslot=$('#oslot'), oart=$('.oart'),
    foldCols=$$('.fold').map(function(f){return f.querySelector('.col')}),
    outroEl=$('.outro'),    btEls=$$('.bt'), stEls=$$('.st'), verifying=$('#verifying'),

    crowd=$('#crowd'),hero=$('#hero'),hand=$('#hand'),claimsEl=$('#claims'),
    cbg=$('#cbg'),
    hpalm=$('#hpalm'), heroVideo=$('#heroVideo'), heroCv=$('#heroCv'), heroCx=heroCv.getContext('2d'),
    mesh=$('#f1 .mesh'), paper=$('#paper'), rose=$('#rose'),
    orbSrc=$('#orbSrc'),flow=$('#flow'),flowBuilt=0,f4el=$('#f4');


/* a shading pass on each leaf, driven only by opacity while it swings */
leaves.forEach(function(lf,i){
  if(!lf) return;
  var c=document.createElement('div'); c.className='curl';
  (lf.children[0]||lf).appendChild(c); curls[i]=c;
});

/* ---------- fold 5: three lines that draw themselves on scroll ---------- */
var DL=[];
(function(){
  var nodes=$$('.drawline');
  nodes.forEach(function(n,i){
    var svg=n.querySelector('svg'), st=n.querySelector('[data-stroke]'),
        fl=n.querySelector('[data-fill]'), wp=n.querySelector('[data-wipe]');
    DL.push({n:n,svg:svg,st:st,fl:fl,wp:wp,box:null,len:0});
  });
  function measure(){
    var vw=innerWidth, fs=Math.round(Math.max(38,Math.min(150,vw*0.082)));
    DL.forEach(function(d){
      d.st.style.fontSize=fs+'px'; d.fl.style.fontSize=fs+'px';
      var b;
      try{ b=d.st.getBBox() }catch(e){ return }
      if(!b||!b.width) return;
      var pad=fs*0.14;
      d.box={x:b.x-pad,y:b.y-pad,w:b.width+pad*2,h:b.height+pad*2};
      d.svg.setAttribute('viewBox',d.box.x+' '+d.box.y+' '+d.box.w+' '+d.box.h);
      d.n.style.setProperty('--dh',Math.round(fs*1.22)+'px');
      d.wp.setAttribute('x',d.box.x); d.wp.setAttribute('y',d.box.y);
      d.wp.setAttribute('height',d.box.h);
      /* the dash has to exceed the longest glyph path, not the text width */
      d.len=Math.max(d.box.w*3.4,600);
      d.st.style.strokeDasharray=d.len; d.st.style.strokeDashoffset=d.len;
    });
  }
  measure();
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(measure).catch(function(){});
  addEventListener('resize',measure);
})();
function drawLines(g){
  if(!DL.length) return;
  /* fold 5 spans g 4..5 */
  var p=clamp(g-4,0,1);
  for(var i=0;i<DL.length;i++){
    var d=DL[i]; if(!d.box) continue;
    var a=0.02+i*0.26;
    var draw=ease(seg(p,a,a+0.22));
    var fillP=ease(seg(p,a+0.16,a+0.32));
    d.st.style.strokeDashoffset=(d.len*(1-draw)).toFixed(1);
    d.wp.setAttribute('width',(d.box.w*fillP).toFixed(1));
    d.n.style.opacity=(0.22+0.78*Math.min(1,draw*4)).toFixed(3);
  }
}

/* ---------- the passport answers the cursor ---------- */
var tx=0,ty=0,cx=0,cy=0;
addEventListener('pointermove',function(e){
  tx=(e.clientX/innerWidth)*2-1;
  ty=(e.clientY/innerHeight)*2-1;
},{passive:true});

/* one leaf turn per fold hand-over */
/* the whole opening sequence lands inside fold 3: cover opens, one leaf turns to the
   stamp collection on page 04, then the passport shuts. Everything must finish before
   g reaches 3.0 — progress freezes there while fold 3's pin releases and fold 4's begins,
   and any transition straddling that boundary visibly locks mid-motion. */
var FLIPS=[[2.08,2.24],[2.28,2.44],[9,9],[9,9],[9,9]];

function frame(){
try{
  /* ---- READ (batched) ---- */
  var vh=innerHeight, vw=innerWidth, mob=vw<1025;
  var g=0,i,r;
  for(i=0;i<folds.length;i++){
    r=folds[i].getBoundingClientRect();
    g+=clamp(-r.top/Math.max(1,r.height-vh),0,1);
  }

  /* ---- WRITE ---- */
  /* Mobile handover: each fold's copy slides in from the right and out to the left,
     driven by that fold's own rect. Nothing moves vertically, so copy and passport
     can never cross. On desktop the transforms are cleared and layout is untouched. */
  var apprOf=[];
  if(mob){
    for(i=0;i<folds.length;i++){
      var fr2=folds[i].getBoundingClientRect();
      apprOf[i]=ease(clamp(((vh-fr2.top)/(vh*0.80)-0.42)/0.58,0,1));
    }
    var orr=outroEl?outroEl.getBoundingClientRect():null;
    apprOf[folds.length]=orr?ease(clamp(((vh-orr.top)/(vh*0.80)-0.06)/0.42,0,1)):1;
    var artBot=0;
    if(+getComputedStyle(zone).opacity>0.25 && +getComputedStyle(wrap).opacity>0.25){
      var ab=book.getBoundingClientRect();
      if(ab.width>2) artBot=ab.bottom;
    }
    /* the ceiling has to clear the art on wider screens, where the passport renders
       taller — otherwise the band starts above the art's lower edge and they overlap */
    var bandTop=clamp(artBot+20, vh*0.24, vh*0.68);
    for(i=0;i<folds.length;i++){
      var fc=foldCols[i]; if(!fc) continue;
      var inE=apprOf[i], outE=apprOf[i+1], vis=inE*(1-outE);
      fc.style.transform='translateX('+((1-inE)*114-outE*114).toFixed(2)+'vw)';
      fc.style.opacity=vis.toFixed(3);
      fc.style.pointerEvents=vis>0.6?'auto':'none';
      /* fold 1 keeps the copy above the passport; the middle folds follow the art's
         lower edge; the last fold has no passport at all, so it takes the whole frame */
      if(i===folds.length-1) fc.style.top=(vh*0.17).toFixed(0)+'px';
      else if(i>0) fc.style.top=(vis>0.02?bandTop:vh*0.52).toFixed(0)+'px';
    }
  } else if(foldCols[0] && foldCols[0].style.transform){
    for(i=0;i<foldCols.length;i++){ if(foldCols[i]){ foldCols[i].style.transform=''; foldCols[i].style.opacity=''; foldCols[i].style.pointerEvents=''; } }
  }
  cx += (tx-cx)*0.07; cy += (ty-cy)*0.07;
  /* leaf and cover shut on the same curve, so it closes in one motion with no
     pause on pages 01-02 along the way — and lands well clear of the g=3.0 freeze */
  var closeLeaves = ease(seg(g,2.92,2.99));
  var closeP = closeLeaves;
  var open = ease(seg(g,FLIPS[0][0],FLIPS[0][1])) * (1-closeP);
  var ry   = -15 + 9*ease(seg(g,1.60,2.80)) - 9*ease(seg(g,5.10,5.80));
  var rx   = 5;

  /* ONE choreography: assemble (0.42-1.0) -> descend (1.0-2.05) -> release (2.05-2.42) */
  /* scene progress runs continuously from fold 2 entering the viewport to the end of its pin,
     so there is no dead stretch while fold 1's pin releases */
  var r2 = folds[1].getBoundingClientRect();
  var sp = clamp((vh - r2.top)/(vh + r2.height),0,1);
  var asm = ease(seg(sp,0.02,0.56));
  var cam = ease(seg(sp,0.56,0.93));
  var out = ease(seg(sp,0.62,1.00));
  var dock = ease(clamp(seg(sp,0.04,0.54) - seg(sp,0.64,0.98),0,1));
  crowd.style.opacity=dock.toFixed(3);
  /* the callouts arrive after the crowd has formed, and clear before it leaves */
  claimsEl.style.setProperty('--clo', (ease(clamp((asm-0.42)/0.5,0,1))*(1-ease(clamp(out*1.5,0,1)))).toFixed(3));

  if(mesh) mesh.style.opacity=(1-asm).toFixed(3);
  if(!mob) zone.style.left=(44-12*dock).toFixed(2)+'%';
  /* the hall itself is untouched art; it only breathes, very slightly */
  var ms = performance.now()/1000;
  var breathe = Math.sin(ms*0.45)*0.0022;                 /* +/- 0.22% scale */
  var driftY  = Math.sin(ms*0.31)*0.16;                   /* +/- 0.16% vertical */
  /* one continuous, slow pull-back across the whole scene */
  var zoom = 1.20 - 0.19*ease(clamp(sp,0,1));
  cbg.style.translate='0 '+((1-asm)*4.0-out*1.6+driftY*dock).toFixed(3)+'%';
  cbg.style.scale=(zoom+breathe*dock).toFixed(5);

  /* forward through the take, a beat of stillness, then back down in reverse */
  drawCrowdFrame(Math.max(0, ease(seg(sp,0.02,0.62)) - ease(seg(sp,0.635,1.00))));
  /* the hero shifts his weight and the light on his palm pulses */
  var sway = Math.sin(ms*0.52)*0.42*dock;
  /* the lift is the video itself: scroll scrubs into the take as the passport arrives,
     then a slow idle loop once docked, chroma-keyed onto the crowd live */
  /* the lift is the video itself: delayed a beat so more of the hall has revealed
     before it becomes the thing your eye is tracking */
  var heroLift = ease(seg(sp,0.20,0.58));
  drawHeroFrame(heroLift, out, ms);
  var bob  = Math.sin(ms*0.71+1.2)*1.15*dock;
  hpalm.style.opacity=(0.84+0.16*(0.5+0.5*Math.sin(ms*0.83))).toFixed(3);
  /* ---- composition lock ----
     The reference composition is one geometric relationship: the hero is a fixed share of
     the plate's width and his feet sit on a fixed line down the plate. Both are derived
     from the plate's measured box every frame, so the composition holds at any viewport
     size. Animation offsets are multiplied by k, the plate's scale against the reference
     width, so the walk-on and camera moves stay in proportion too. LIFT and HDROP are
     optical nudges, so they stay in px. */
  var REF_W=1800, HERO_W=0.292, FEET=0.94, LIFT=160, HDROP=75;
  var pr=cbg.getBoundingClientRect(), cr=crowd.getBoundingClientRect();
  var pw=pr.width||REF_W, ph=pr.height||pw*0.86, k=pw/REF_W;
  crowd.style.setProperty('--cbgTop',(pw*-0.205-LIFT).toFixed(1)+'px');
  hero.style.setProperty('--hw',(pw*HERO_W).toFixed(1)+'px');
  hero.style.setProperty('--hbot',(cr.bottom-(pr.top+ph*FEET)-HDROP).toFixed(1)+'px');
  hero.style.translate='-50% '+(((1-asm)*54+cam*96-out*36+bob+100)*k).toFixed(2)+'px';
  /* the callout layer becomes the plate's box exactly, so its percentage coordinates are
     percentages of the crowd image at any screen size */
  claimsEl.style.left=(pr.left-cr.left).toFixed(1)+'px';
  claimsEl.style.top=(pr.top-cr.top).toFixed(1)+'px';
  claimsEl.style.width=pw.toFixed(1)+'px';
  claimsEl.style.height=ph.toFixed(1)+'px';
  claimsEl.style.setProperty('--rise',(ph*0.0584).toFixed(1)+'px');
  hero.style.scale=((0.88+0.12*asm)*(1+cam*0.16)).toFixed(4);
  hero.style.rotate=sway.toFixed(3)+'deg';

  var zoneW = mob ? vw : vw*0.56;
  var zoneH = vh;
  if(mob){
    zoneH = vh*(0.32 + 0.12*ease(seg(g,1.70,2.35)) + 0.18*dock);
    zone.style.height = zoneH.toFixed(1)+'px';
    /* row order: fold 1 = copy top / passport bottom, fold 2+ = passport top / copy bottom */
    /* the passport waits for fold 1's copy to be most of the way out before it rises
       into the top row, so the two never share the same band of the screen */
    var rowT = apprOf.length>1 ? ease(clamp((apprOf[1]-0.20)/0.62,0,1)) : 1;
    zone.style.top = ((1-rowT)*(vh*0.53) + rowT*56).toFixed(1)+'px';
    /* a flat-topped dip: the passport is essentially absent for the whole crossing,
       not just its midpoint, so it never slides through either band of copy */
    var dipT=clamp(rowT,0,1);
    zone.style.opacity = (1-0.98*Math.pow(Math.sin(Math.PI*dipT),0.32)).toFixed(3);
  }
  else if(zone.style.height){ zone.style.height=''; zone.style.top=''; zone.style.opacity=''; }
  /* the two-page spread drives both the frame width and the horizontal shift, so it gets
     its own gentle curve — tying it to the fast close snapped the scale and slid the book
     sideways. It collapses just behind the cover, once no pages are visible anyway. */
  var spread = ease(seg(g,2.08,2.28)) * (1 - ease(seg(g,2.92,2.99)));
  /* the frame width (and so the scale) rides a wider, later curve than the cover itself,
     so the passport grows back to full size gradually instead of snapping once it shuts */
  var spreadW = ease(seg(g,2.02,2.34)) * (1 - ease(seg(g,2.90,2.99)));
  var contentW = 460 + 460*spreadW;
  var shift = -230*(1-spread);
  var s = Math.min(zoneW*0.83/contentW, zoneH*0.84/640, 0.95);
  /* the spread's easing curve can lag the cover's actual angle, so on a phone the
     scale is hard-capped against the full two-page width whenever the book is open —
     the spread then physically cannot run past either edge */
  if(mob && open>0.06) s = Math.min(s, vw*0.92/920);
  /* fold 4 hands the upper half of the zone to the flow chart, so the passport
     shrinks and drops to sit under the Companion node as its final layer */
  /* the duck into fold 4 rides a longer curve, with a slow hover so the passport keeps
     breathing instead of sitting stiff while the flow chart builds around it */
  /* the duck runs on fold 4's own approach progress, not the global fold counter:
     g freezes at 3.0 while fold 3 unpins and fold 4 pins, and any ramp crossing that
     boundary rushes then stalls. This advances continuously. */
  var r4 = f4el.getBoundingClientRect();
  var d4 = clamp((vh - r4.top)/(vh + r4.height),0,1);
  /* the passport's work is done after fold 4 — it slides out to the right and fades
     just before fold 5 arrives, and stays gone through fold 6 */
  var exitP = ease(seg(d4,0.80,0.99));
  var duck = ease(seg(d4,0.10,0.42)) * (1-ease(seg(d4,0.60,0.88)));
  var hover = Math.sin(ms*0.42)*0.006*duck;
  /* the whole fold-4 group — sources, Companion and passport — shifts and grows together */
  zone.style.translate=(-50*duck).toFixed(1)+'px '+(50*duck).toFixed(1)+'px';
  zone.style.scale=(1+0.10*duck).toFixed(4);
  s *= (1 - 0.78*duck + hover);
  var duckY = 470*duck + Math.sin(ms*0.34+1.1)*9*duck;
  /* the dock (hand), the fold-4 exit and the outro fly-in all write into these, so the
     three phases add rather than overwrite one another */
  var dockTX=0, dockTY=0, dockRot=0;
  if(dock>0.001){
    /* the docked size is set by the viewport, not by the hero — the hero has to stay
       small to stand among the crowd, and the passport still has to be readable */
    var dockS = Math.max(0.17, Math.min(0.30, (zoneH*0.30)/640))*0.8;
    /* settle with a slight overshoot on arrival */
    /* dock is already eased, so this only adds a gentle lead-in/overshoot rather than
       squaring the curve a second time */
    var dE = dock + 0.06*Math.sin(Math.PI*dock);
    /* two different journeys: in on a low arc from the right, out rising and rolling away */
    var swIn  = Math.sin(Math.PI*clamp(asm,0,1))*(1-out);
    var swOut = Math.sin(Math.PI*clamp(out,0,1));
    var lift  = ease(clamp(out,0,1));
    s = s*(1-dE) + dockS*dE*(1+0.16*swOut);
    var hr=hand.getBoundingClientRect(), zr=zone.getBoundingClientRect();
    var rawY = ((hr.top+hr.height/2-(zr.top+zr.height/2)-318*s-5)*dE) + swIn*70 - swOut*210;
    dockTX = (hr.left+hr.width/2-(zr.left+zr.width/2)+150*s)*dE + swIn*46 + swOut*46 + lift*18*(1-lift) + 30;
    dockTY = rawY - 10;
    dockRot = swIn*2 - swOut*9;
    ry += swIn*68 - swOut*22;
  } else if(wrap.style.translate){ wrap.style.translate=''; wrap.style.rotate=''; }
  /* NOTE(hand-anchor): kept identical after the video swap — .hand is still positioned by
     CSS percentage, not by the canvas content, so this block needs no change. */
  /* the closed passport flies from the stage into its slot in the last fold */
  var os = oslot.getBoundingClientRect();
  var fly = ease(clamp((vh*1.15 - os.top)/(vh*0.78),0,1));
  /* the fold-4 exit slide and the outro fly-in are always computed, then cross-faded
     continuously on `fly` — switching between them at a threshold snapped opacity 0->1
     and teleported the position in one frame. */
  var zr2 = zone.getBoundingClientRect();
  /* the resting pose is tilted, so its projected box is ~4.5% larger than the flat card */
  var ts = (oslot.offsetWidth/460)*0.957;
  s = s*(1-fly) + ts*fly;
  /* it enters from the left, gliding into the closing frame */
  var bx = (os.left+os.width/2)-(zr2.left+zr2.width/2);
  var by = (os.top+os.height/2)-(zr2.top+zr2.height/2);
  /* it swings in from beyond the left edge, overshoots a touch, then settles */
  var over=Math.sin(Math.PI*clamp(fly,0,1));
  var ftx = bx - (1-fly)*(zr2.width+os.width) + over*54;
  var fty = by - (1-fly)*120 - over*38;
  if(fly>0.001){
    oart.style.setProperty('--bookH',oslot.offsetHeight+'px');
    /* keep the vanishing point on the passport, otherwise the off-axis landing shears it */
    zone.style.perspectiveOrigin=(zr2.width/2+ftx).toFixed(1)+'px '+(zr2.height/2+fty).toFixed(1)+'px';
  } else if(zone.style.perspectiveOrigin){ zone.style.perspectiveOrigin=''; }
  var lean = (1-dock)*(1-fly*0.55);
  ry += cx*9*lean; rx -= cy*6*lean;
  ry = ry*(1-fly) + (-13+cx*5)*fly; rx = rx*(1-fly) + (4-cy*3)*fly;

  wrap.style.setProperty('--s',s);
  var exitTX = exitP*520, exitOp = 1-exitP;
  /* position never blends between the exit (off-screen right) and fly-in (off-screen left)
     targets — that produced a visible sweep across the whole frame. Once the fly-in starts,
     position snaps straight to its own off-left trajectory; only opacity fades in gradually,
     so the handover happens while the passport is parked out of view on the left. */
  var w = ease(clamp(fly/0.14,0,1));
  var wrapOp = exitOp*(1-w)+w;
  /* on a phone the last fold owns the whole frame, so the passport is fully out of the
     way there rather than sliding across the copy on its way off screen */
  if(mob && apprOf.length) wrapOp *= (1 - apprOf[folds.length-1]*(1-w));
  wrap.style.opacity=wrapOp.toFixed(3);
  wrap.style.translate=(dockTX*(1-fly)+(fly>0.001?ftx:exitTX)).toFixed(1)+'px '+(dockTY*(1-fly)+(fly>0.001?fty:0)).toFixed(1)+'px';
  wrap.style.rotate=(dockRot*(1-fly)+(fly>0.001?(-11*(1-fly)+over*3.4):0)).toFixed(2)+'deg';
  book.style.transform='translateX('+shift.toFixed(1)+'px) translateY('+duckY.toFixed(1)+'px) rotateY('+ry.toFixed(2)+'deg) rotateX('+rx.toFixed(2)+'deg)';
  verso.style.setProperty('--vop',ease(seg(open,0.70,0.86)).toFixed(3));
  cover.style.setProperty('--tally',win(g,2.92,6.10,0.10).toFixed(3));
  spine.style.setProperty('--sop',(ease(seg(open,0.7,0.88))*0.9).toFixed(3));
  stage.style.setProperty('--stageOp','1');

  /* ---- the leaves turn: one per fold hand-over ---- */
  for(i=0;i<leaves.length;i++){
    var lf=leaves[i]; if(!lf) continue;
    var p = i===0 ? ease(seg(g,FLIPS[0][0],FLIPS[0][1]))*(1-closeP)
                  : ease(seg(g,FLIPS[i][0],FLIPS[i][1]))*(1-closeLeaves);
    /* the leaf lifts out of the stack as it swings, then settles on the other side */
    var zw = (1-p)*(4-i)*1.8 + p*(i+1)*1.8 + Math.sin(Math.PI*p)*14;
    lf.style.transform='translateZ('+zw.toFixed(2)+'px) rotateY('+(-180*p).toFixed(2)+'deg)';
    var turned = p>0.5;
    if(lf.children[0]) lf.children[0].style.visibility = turned?'hidden':'visible';
    if(lf.children[1]) lf.children[1].style.visibility = turned?'visible':'hidden';
    if(curls[i]) curls[i].style.opacity=(Math.sin(Math.PI*p)*0.85).toFixed(3);
  }

  /* fold 4: the four beats light one at a time, evenly across this fold's own range.
     Strictly sequential windows (no lead-in overlap) so only one is ever lit, and the
     last one holds to the end of the fold instead of going dark early. */
  var BT=[[3.02,3.22],[3.22,3.42],[3.42,3.62],[3.62,4.02]];
  for(i=0;i<btEls.length;i++) btEls[i].classList.toggle('on', g>=BT[i][0] && g<BT[i][1]);
  /* the record is checked first — the line pulses three times — then the stamps land */
  var vp=seg(g,2.50,2.76);
  verifying.style.setProperty('--vo', vp>0&&vp<1 ? Math.pow(Math.sin(Math.PI*vp*3),2).toFixed(3) : '0');
  /* stamps fill in only once the check has finished */
  var fill=ease(seg(g,2.80,2.90))*5;
  for(i=0;i<stEls.length;i++) stEls[i].style.setProperty('--o', i<5 ? clamp(fill-i,0,1).toFixed(2) : clamp(fill-4.6,0,1).toFixed(2));

  /* fold 4: the flow chart builds a layer per beat, and the passport steps back to make room */
  var f4 = duck;
  orbSrc.style.opacity=f4.toFixed(3);
  orbSrc.style.translate='';
  /* the Companion's eight steps are stepped by scroll across the fold: step 1 as the node
     arrives, step 8 as it leaves. The reader owns the clock. */
  if(window.__cpStep){
    var lp=clamp((g-3.00)/(3.96-3.00),0,1);
    window.__cpStep(Math.floor(lp*(window.__cpStepCount-0.0001)));
  }
  var fstage = g>=3.60?4 : g>=3.40?3 : g>=3.20?2 : g>=3.00?1 : 0;
  if(fstage&&!flowBuilt){ flowBuilt=1; buildFlow(); }
  var fcls='flow'+(fstage?' s'+fstage:'');
  if(flow.className!==fcls) flow.className=fcls;
  /* the connector spans the measured gap between the node's bottom and the cover's top */
  if(fstage){
    var nod=flow.querySelector('.fbot');
    var fline=nod.querySelector('.fline');
    if(!fline){ fline=document.createElement('div'); fline.className='fline'; nod.appendChild(fline); }
    /* the line hangs from the node (top:100% in CSS), so only its length is computed: the
       drop to the cover, run into the cover's middle. The passport paints above this
       layer, so the overshoot is hidden and the tilt of the cover cannot leave a gap. */
    var nr=nod.getBoundingClientRect(), bkr=cover.getBoundingClientRect();
    var len=(bkr.top-nr.bottom)+bkr.height*0.5;
    if(len>10){ fline.style.height=len.toFixed(1)+'px'; fline.style.opacity=''; }
    else { fline.style.height='0px'; fline.style.opacity='0'; }
  }
  paper.style.translate='0 '+(-g*22).toFixed(1)+'px';
  rose.style.rotate=(g*4.5).toFixed(2)+'deg';
  rose.style.scale=(1+g*0.03).toFixed(4);
  prog.style.setProperty('--pw',(g/folds.length*100).toFixed(2)+'%');
  drawLines(g);
  if(!window.__cpManual) requestAnimationFrame(frame);
}catch(e){ if(!window.__cpErrLogged){window.__cpErrLogged=1;console.error('frame:',e);} if(!window.__cpManual) setTimeout(function(){requestAnimationFrame(frame)},250); }
}
window.__cpFrame=function(y){ if(y!=null) scrollTo(0,y); window.__cpManual=1; try{frame()}finally{window.__cpManual=0} };
requestAnimationFrame(frame);

/* ---------- pre-baked crowd video (the hall's own formation, no chroma-key needed) ---------- */
var cwReady=false;

/* the hall is a single static plate now — nothing to scrub */
function drawCrowdFrame(){}

/* ---------- pre-baked, chroma-keyed hero frames (no live seeking = no jank) ---------- */
var hvReady=false, hvTainted=false, hvDur=0, hvFrames=[], HV_N=40, HV_SX=180, HV_SY=125, HV_SW=515, HV_SH=955;
function keyGreen(cx,w,h){
  var d=cx.getImageData(0,0,w,h), p=d.data;
  for(var i=0;i<p.length;i+=4){
    var r=p[i],g=p[i+1],b=p[i+2];
    /* soft matte: grade alpha by how green the pixel is relative to the strongest
       of r/b, so the silhouette edge feathers instead of stair-stepping */
    var gr=g-Math.max(r,b);
    if(gr>34){ p[i+3]=0; continue; }
    if(gr>4){
      p[i+3]=Math.round(p[i+3]*(1-(gr-4)/30));
      p[i+1]=Math.max(0,g-gr*1.5);
    }
  }
  cx.putImageData(d,0,0);
}
function bakeHeroFrames(){
  var i=0;
  function onSeeked(){
    heroVideo.removeEventListener('seeked',onSeeked);
    var cv=document.createElement('canvas'); cv.width=heroCv.width; cv.height=heroCv.height;
    var cx=cv.getContext('2d');
    cx.drawImage(heroVideo,HV_SX,HV_SY,HV_SW,HV_SH,0,0,cv.width,cv.height);
    /* A cross-origin or file:// video taints the canvas, so getImageData throws and the
       un-keyed green frame would stay on screen. In that case drop the hero layer
       entirely — the crowd plate already carries a lit figure. */
    try{ keyGreen(cx,cv.width,cv.height); }
    catch(e){ hvTainted=true; hero.style.display='none'; hvReady=false; return; }
    hvFrames.push(cv);
    i++; step();
  }
  function step(){
    if(i>=HV_N){ hvReady=true; return; }
    var t=Math.min(hvDur-0.03, i/(HV_N-1)*hvDur);
    heroVideo.addEventListener('seeked',onSeeked);
    try{ heroVideo.currentTime=t; }catch(e){ i++; step(); }
  }
  step();
}
heroVideo.addEventListener('loadedmetadata',function(){
  hvDur=heroVideo.duration||5;
  var cw=515; heroCv.width=cw; heroCv.height=Math.round(cw*HV_SH/HV_SW);
  bakeHeroFrames();
});
function drawHeroFrame(liftP,outP,ms){
  if(!hvReady || !hvFrames.length) return;
  var t = hvDur*(0.10+0.55*liftP*(1-outP)) + Math.sin(ms*0.30)*0.35*(1-outP*0.6);
  t = Math.max(0,Math.min(hvDur-0.03,t));
  var N=hvFrames.length, pos=t/hvDur*(N-1);
  var i0=Math.max(0,Math.min(N-1,Math.floor(pos))), i1=Math.min(N-1,i0+1), f=pos-i0;
  heroCx.clearRect(0,0,heroCv.width,heroCv.height);
  heroCx.globalAlpha=1; heroCx.drawImage(hvFrames[i0],0,0);
  if(f>0.02){ heroCx.globalAlpha=f; heroCx.drawImage(hvFrames[i1],0,0); heroCx.globalAlpha=1; }
}

/* ---------- handle entry writes onto the cover ---------- */
var input=$('#handle'),field=$('#field'),chnd=$('#chnd'),avail=$('#avail'),pgH=$('#pgHandle');
input.addEventListener('input',function(){
  if(reserveMode!=='handle') return;
  var v=(input.value||'').toLowerCase().replace(/[^a-z0-9._-]/g,'').slice(0,22);
  chnd.textContent='careerpassport.ai/'+(v||'yourname');
  pgH.textContent='/'+(v||'yourname');
  chnd.classList.toggle('on',!!v);
  pgids.forEach(function(n){n.textContent='/'+(v||'yourname')});
  field.classList.toggle('on',!!v);
  if(reserveMode==='handle') reserve.disabled=!v;
  avail.classList.toggle('on',!!v);
});
var fbox=$('#fbox'),fpre=$('#fpre'),reserve=$('#reserve'),reserveMode='handle';
reserve.addEventListener('click',function(){
  if(reserveMode==='handle'){
    if(!input.value) return;
    reserveMode='email';
    field.classList.add('mode-email');
    fpre.textContent='email:'; fpre.classList.add('email');
    input.type='email'; input.placeholder='you@work.com'; input.value=''; input.setAttribute('aria-label','Your email');
    reserve.textContent='JOIN THE WAITLIST';
    reserve.disabled=false;
    input.focus();
    return;
  }
  if(reserveMode==='email'){
    if(!input.value || !input.checkValidity()){ input.focus(); input.reportValidity&&input.reportValidity(); return; }
    reserveMode='done';
    field.classList.add('done');
    fbox.innerHTML='<span class="pre" style="color:var(--emerald)">✓ you\'re on the list</span>';
    reserve.textContent='RESERVED';
  }
});

/* ---------- outro reveals ---------- */
var waitEl=$('#wait'), waitEmail=$('#waitEmail'), waitBtn=$('#waitBtn');
waitBtn.addEventListener('click',function(){
  if(waitEl.classList.contains('done')) return;
  if(!waitEmail.value || !waitEmail.checkValidity()){ waitEmail.focus(); waitEmail.reportValidity&&waitEmail.reportValidity(); return; }
  waitEl.classList.add('done');
  waitEmail.value="you're on the list"; waitEmail.disabled=true;
  waitBtn.textContent='CONFIRMED \u2713';
});
var io=new IntersectionObserver(function(es){
  es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}});
},{rootMargin:'0px 0px -10% 0px',threshold:.1});
$$('.reveal').forEach(function(el,i){el.style.transitionDelay=(i%4)*70+'ms';io.observe(el)});
setTimeout(function(){$$('.reveal').forEach(function(el){el.classList.add('in')})},3500);

/* ---------- mobile nav ---------- */
var burger=$('#burger'),mnav=$('#mnav');
burger.addEventListener('click',function(){
  var o=mnav.classList.toggle('open');
  burger.setAttribute('aria-expanded',o?'true':'false');
});
$$('#mnav a').forEach(function(a){a.addEventListener('click',function(){
  mnav.classList.remove('open');burger.setAttribute('aria-expanded','false')})});
})();
