/* ---- the scroll progress bar, driven as it is on Homepage ---- */
(function(){
  var bar=document.querySelector('.prog'); if(!bar) return;
  var de=document.documentElement;
  var tick=function(){
    var span=de.scrollHeight - (de.clientHeight || innerHeight);
    /* a frame sized to the whole document has nothing to scroll: keep the bar at zero
       rather than dividing by it */
    var p = span > 0 ? Math.min(1,Math.max(0,(scrollY||pageYOffset)/span)) : 0;
    bar.style.setProperty('--pw',(p*100).toFixed(2)+'%');
  };
  tick();
  addEventListener('scroll',tick,{passive:true});
  addEventListener('resize',tick,{passive:true});
})();

/* ---- the hero plate's crop ----
   Portrait footage fills the slot's width, so it is taller than the slot. --vy picks which
   band is seen: FRAME_TOP lands on the occupied-desk field (the atrium occupies the top
   third of the source) and LIFT_PX raises it further. The video plays on its own loop;
   nothing here touches playback. */

/* ---- the comparison arrives row by row ----
   The grid is flat markup (one label cell + four value cells per row), so the rows are
   recovered by counting columns. Each row's five elements share one --i, which makes them
   land together while the rows themselves cascade. */
(function(){
  var grid=document.querySelector('.cmpg'); if(!grid) return;
  var kids=[].slice.call(grid.children), COLS=5;
  kids.forEach(function(el,n){
    el.classList.add('rv');
    el.style.setProperty('--i', Math.floor(n / COLS));
  });
})();

/* ---- the ground's parallax: the rule grid drifts at a fraction of the page's speed ---- */
(function(){
  var grid=document.querySelector('.grid-bg'); if(!grid) return;
  if(matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var queued=false;
  var write=function(){
    queued=false;
    grid.style.setProperty('--gridY',(-(scrollY*0.06)%120).toFixed(1)+'px');
  };
  addEventListener('scroll',function(){
    if(queued) return; queued=true; requestAnimationFrame(write);
  },{passive:true});
  write();
})();

/* ---- fold 01: the brief is written and sent, scroll-driven ----
   Act 1 lives here. The sentence starts at a tenth of its opacity and fills word by word
   as the fold is scrolled; when it is complete the send button arms, the hiring manager's
   cursor enters from off-stage, presses it, and leaves. Only then does the pin release
   into fold 02, which opens on the blueprint being prepared. */
(function(){
  var sec=document.getElementById('herofold'); if(!sec) return;
  var pin=sec.querySelector('.heropin');
  var comp=document.getElementById('hComp');
  var textEl=document.getElementById('hCompText');
  var sendBtn=document.getElementById('hCompSend');
  var pill=document.getElementById('hCompPill');
  var cur=document.getElementById('heroCur');
  if(!pin||!textEl||!sendBtn||!cur) return;

  var clamp=function(v,a,b){ return Math.min(b,Math.max(a,v)) };
  var seg=function(v,a,b){ return clamp((v-a)/(b-a),0,1) };

  var SVH=420;
  var setH=function(){ sec.style.height=SVH+'svh' };
  setH(); addEventListener('resize',setH,{passive:true});

  var QUERY="I need a senior product leader who has built enterprise products, worked through ambiguity and can operate across engineering, sales and customers";
  textEl.innerHTML=QUERY.split(' ').map(function(w){ return '<span>'+w+'</span>' }).join(' ');
  var wordEls=[].slice.call(textEl.querySelectorAll('span'));
  var caret=document.createElement('span');
  caret.className='aicaret'; caret.setAttribute('aria-hidden','true');
  textEl.insertBefore(caret,textEl.firstChild);

  /* the cursor parks on whatever element it is given, in the pin's own coordinates */
  var tx=0,ty=0,cx=0,cy=0,seeded=false,wasOn=false;
  function offstage(){ return {x:pin.offsetWidth+150, y:pin.offsetHeight*0.62} }
  function park(el,ox,oy){
    if(!el) return;
    var s=pin.getBoundingClientRect(), r=el.getBoundingClientRect();
    tx=r.left-s.left+r.width*0.5+(ox||0);
    ty=r.top-s.top+r.height*0.5+(oy||0);
    if(!seeded){ var o=offstage(); cx=o.x; cy=o.y; seeded=true }
    cur.classList.toggle('left',tx>pin.offsetWidth*0.55);
  }
  function setVisible(on){
    if(on===wasOn) return;
    if(on){ var o=offstage(); cx=o.x; cy=o.y }
    wasOn=on;
  }
  function glide(){
    cx+=(tx-cx)*0.09;
    cy+=(ty-cy)*0.09;
    cur.style.transform='translate3d('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px,0)';
    requestAnimationFrame(glide);
  }
  requestAnimationFrame(glide);

  var frame=function(){
    var r=sec.getBoundingClientRect();
    var vh=pin.getBoundingClientRect().height||innerHeight;
    var span=r.height-vh;
    var q=span>0 ? clamp(-r.top/span,0,1) : 0;

    /* the brief fills in, word by word */
    var fillT=seg(q,.08,.60);
    var n=Math.round(fillT*wordEls.length);
    wordEls.forEach(function(w,i){
      w.classList.toggle('hot',i<n);
      w.classList.toggle('lead',i===n-1&&n<wordEls.length);
    });
    /* the caret rides immediately after the word that just filled */
    if(caret._n!==n){
      caret._n=n;
      if(n<=0) textEl.insertBefore(caret,textEl.firstChild);
      else wordEls[Math.min(n,wordEls.length)-1].after(caret);
    }
    caret.classList.toggle('on',q>.04&&q<.66);

    /* everything but the box steps back while the brief is being written */
    pin.style.setProperty('--rest',
      (1-0.5*seg(q,.04,.16)*(1-seg(q,.80,.90))).toFixed(3));

    var done=n>=wordEls.length;
    /* the rim charges with the fill itself (not the rounded word count), so it starts
       moving the instant the karaoke begins rather than waiting on the first word */
    comp.style.setProperty('--charge',fillT.toFixed(3));
    sendBtn.classList.toggle('armed',done);
    pill.classList.toggle('hot',done);
    comp.classList.toggle('armed',done);

    /* the press holds long enough to register even at speed */
    var press=q>=.72&&q<.80;
    sendBtn.classList.toggle('pressed',press);
    comp.classList.toggle('sending',q>=.72);

    /* the manager is on stage only for the send */
    var on=q>=.52&&q<.90;
    cur.classList.toggle('on',on);
    cur.classList.toggle('away',!on);
    setVisible(on);
    cur.classList.toggle('click',press);
    park(sendBtn,2,2);
  };
  frame();
  var queued=false;
  addEventListener('scroll',function(){
    if(queued) return; queued=true;
    requestAnimationFrame(function(){ queued=false; frame() });
  },{passive:true});
  addEventListener('resize',frame,{passive:true});
})();

/* ---- fold 02: the blueprint, scroll-driven ---- */
(function(){
  var sec=document.getElementById('aidemo'); if(!sec) return;
  var pin=sec.querySelector('.aidemopin');
  var eyebrow=document.getElementById('aiEyebrow');
  var stage=document.getElementById('aiStage');
  var submitBtn=document.getElementById('aiSubmit');
  var box=document.getElementById('aiBox');
  var prep=document.getElementById('aiPrep');
  var bp=document.getElementById('aiBp');
  var ready=document.getElementById('aiReady');
  var cur=document.getElementById('hmCur');
  var fin1=document.getElementById('aiFin1');
  var fin2=document.getElementById('aiFin2');
  var bpGroups=[].slice.call(document.querySelectorAll('.bpgrp'));
  var chips=[].slice.call(document.querySelectorAll('#bpChips .bpchip:not(.add)'));
  var addChip=document.getElementById('bpAdd');
  var LVL_N=5;
  var sFill=document.getElementById('bpFill'), sThumb=document.getElementById('bpThumb');
  var lvlOut=document.getElementById('bpLvlOut'), mxOut=document.getElementById('bpMxOut');
  var mxCells=[].slice.call(document.querySelectorAll('.bpmxc'));
  var LVL_NAMES=['Beginner','Intermediate','Advanced','Pro','Expert'];
  /* the manager's edits: two more technologies, one more level, two more evaluations */
  var CHIP_ADD=[4,5], MX_ADD=[4,7];
  var CHIP_BASE=[0,3], MX_BASE=[0,3,6];
  /* The processing screen must not be a resting place. Once act 2 is entered the screen is
     armed, and it completes on its own clock as well as on scroll — so a reader who stops
     mid-thought still sees the form assemble rather than being left on a spinner. */
  var prepArmed=0, prepPump=0;
  var chip=document.getElementById('actChip');
  var title=document.getElementById('actTitle');
  var desc=document.getElementById('actDesc');
  var dots=[].slice.call(document.querySelectorAll('#actDots i'));
  var ex=document.getElementById('aiEx'), ev=document.getElementById('aiEv'), dc=document.getElementById('aiDc');
  var wires=[].slice.call(ex.querySelectorAll('.wire:not(.reach)'));
  var reach=[].slice.call(ex.querySelectorAll('.wire.reach'));
  var srcs=[].slice.call(ex.querySelectorAll('.exnode.src'));
  var chans=[].slice.call(ex.querySelectorAll('.exnode.chn'));
  var hub=document.getElementById('exHub');
  var exTicker=document.getElementById('exTicker');
  var exDots=[].slice.call(ex.querySelectorAll('.exdotg'));
  var exSvg=ex.querySelector('.exwires');
  /* the viewBox is 100x100 with preserveAspectRatio="none", so its two axes scale by
     different amounts. Handing that ratio to the packets lets them cancel it out. */
  function sizeExDots(){
    if(!exSvg) return;
    var r=exSvg.getBoundingClientRect();
    if(!r.width||!r.height) return;
    exSvg.style.setProperty('--exAspect',(r.width/r.height).toFixed(4));
  }
  sizeExDots();
  addEventListener('resize',sizeExDots,{passive:true});
  if(window.ResizeObserver&&exSvg) new ResizeObserver(sizeExDots).observe(exSvg);
  var exDivs=[].slice.call(ex.querySelectorAll('.exdiv'));
  var evStack=document.getElementById('evStack');
  var evBtn=document.getElementById('evBtn');
  var dcGrid=document.getElementById('dcGrid');
  var dcTiles=[].slice.call(document.querySelectorAll('.dctile'));
  var dcLive=dcTiles.filter(function(t){return t.classList.contains('live')});
  var dcPass=document.getElementById('dcPass');
  var dcPp=document.getElementById('dcPp');
  var dcBook=document.getElementById('dcBook');
  var dcActs=[].slice.call(document.querySelectorAll('.dcact'));
  var dcConf=document.getElementById('dcConf');
  /* page 04's stamps: the homepage's own six dies, struck into this passport too */
  var dcStampGrid=document.getElementById('dcStampGrid');
  if(dcStampGrid){
    var STAMPS=[
     ["SYSTEM\nDESIGN","EARNED","14.07.2026","oval dbl","rgba(47,91,255,.72)",-7,"\u2708"],
     ["DECISION\nMAKING","VERIFIED","02.08.2026","dbl","rgba(200,85,106,.8)",5,"\u2605"],
     ["AGENT\nBUILDER","EARNED","19.08.2026","round","rgba(150,112,42,.9)",-3,"\u2605"],
     ["INCIDENT\nRESPONSE","VERIFIED","27.08.2026","oval","rgba(23,48,95,.78)",8,"\u2708"],
     ["TECHNICAL\nWRITING","EARNED","03.09.2026","pill dbl","rgba(150,112,42,.85)",-6,""],
     ["SPACE FOR\nMORE","","","round dash","rgba(23,48,95,.34)",2,""]];
    dcStampGrid.innerHTML=STAMPS.map(function(s,i){
      return '<div class="st" data-i="'+i+'"><div class="sbox '+s[3]+'" style="--sc:'+s[4]+';rotate:'+s[5]+'deg">'+
        (s[6]?'<i class="sg l">'+s[6]+'</i><i class="sg r">'+s[6]+'</i>':'')+
        (s[1]?'<span class="stt">'+s[1]+'</span>':'')+
        '<b class="snm">'+s[0]+'</b>'+
        (s[2]?'<span class="sdt">'+s[2]+'</span>':'')+
      '</div></div>';
    }).join('');
  }
  /* the book's own parts, exactly as the homepage drives them */
  var dcVerso=document.getElementById('dcVerso');
  var dcSpine=document.getElementById('dcSpine');
  var dcLeaves=[document.getElementById('dcCover'),document.getElementById('dcLeaf1'),
    document.getElementById('dcLeaf2'),document.getElementById('dcLeaf3'),
    document.getElementById('dcLeaf4')];
  var dcCurls=dcLeaves.map(function(lf){
    if(!lf) return null;
    /* the homepage gives every leaf face a curl shadow; the port keeps it */
    [].slice.call(lf.children).forEach(function(face){
      if(face.querySelector&&!face.querySelector('.curl')){
        var c=document.createElement('span'); c.className='curl'; face.appendChild(c);
      }
    });
    return lf.querySelector('.curl');
  });
  /* The book is authored at 920x640 and rotated on two axes. At the final tilt
     (rotateY -9deg through a 2400px perspective) the near edge magnifies by ~1.03 while
     cos(9deg) shrinks the span by ~0.99, so the painted box lands a shade UNDER 920 — and
     during the cover's swing the leaf rotates about the spine and stays inside the box. A
     fixed 1.08 of horizontal headroom therefore covers every angle. It is deliberately a
     constant: this factor used to be refined from measurements each frame, which meant the
     scale could change mid-animation, which is a visible size step. */
  var dcPad=1.08;
  var dcStage=dcPp?dcPp.parentElement:null;
  function sizeBook(){
    if(!dcPp||!dcStage) return;
    var r=dcStage.getBoundingClientRect();
    if(!r.width||!r.height) return;
    dcPp.style.setProperty('--pps',
      Math.max(0.12, Math.min(r.width/(920*dcPad), r.height/700)).toFixed(4));
  }
  function resizeBook(){ sizeBook() }
  resizeBook();
  addEventListener('resize',resizeBook,{passive:true});
  /* the instance is held: an observer reachable only through its own observation list can
     be collected, which ends the callbacks without any error */
  var dcRO=null;
  if(window.ResizeObserver&&dcStage){
    dcRO=new ResizeObserver(resizeBook);
    dcRO.observe(dcStage);
  }
  /* a short burst of paper for the offer */
  if(dcConf){
    /* 44 pieces thrown across the whole frame, not a pill's worth around a label */
    for(var ci=0;ci<44;ci++){
      var cp=document.createElement('i');
      var ca=(ci/44)*Math.PI*2 + Math.random()*0.3;
      var cd=90+Math.random()*230;
      cp.style.setProperty('--cx',(Math.cos(ca)*cd).toFixed(1)+'px');
      cp.style.setProperty('--cy',(Math.sin(ca)*cd*0.62-40).toFixed(1)+'px');
      cp.style.setProperty('--cr',(Math.random()*900-450).toFixed(0)+'deg');
      cp.style.background = ci%3===0?'var(--emerald)':(ci%3===1?'var(--mint,#e9d6aa)':'var(--emerald-tint,#fdfaf1)');
      cp.style.animationDelay=(Math.random()*0.3).toFixed(2)+'s';
      cp.style.animationDuration=(1.5+Math.random()*0.8).toFixed(2)+'s';
      dcConf.appendChild(cp);
    }
  }
  var dcSent=document.getElementById('dcSent');

  /* the agent's running total, so the panel reports scale rather than one anecdote */
  var EXLOG=[
    'Agent matched 504 profiles against the blueprint',
    '156 candidates approached by email',
    '39 responses received',
    '24 candidate journeys shared',
    '88 follow-ups sent on WhatsApp',
    '17 assessments coordinated',
    '12 evaluations returned and scored',
    '9 interview slots proposed',
    '6 calendar invites accepted',
    '4 candidates cleared pre-screen'];
  /* The line advances every 3s, read straight off the clock rather than from a timer.
     setInterval plus a setTimeout for the fade was the freeze: a browser throttles both
     while this section is off-screen, and when the throttle landed between the two the
     .turn class stayed applied — a blank line — then the backlog fired at once, which
     was the sudden shuffle. A derived slot cannot desync or burst. */
  var EX_SLOT_MS=3000;
  function exTickNow(){
    if(!exTicker) return;
    var slot=Math.floor(Date.now()/EX_SLOT_MS)%EXLOG.length;
    if(exTicker._i===slot) return;
    exTicker._i=slot;
    exTicker.querySelector('span').textContent=EXLOG[slot];
    /* re-trigger the entrance animation without a timer */
    exTicker.classList.remove('turn');
    void exTicker.offsetWidth;
    exTicker.classList.add('turn');
  }
  /* its own frame loop, so the line advances whether or not the page is being scrolled.
     rAF pauses off-screen and resumes cleanly, and because the slot is derived from the
     clock rather than counted, a pause can never leave a backlog to rush through. */
  (function exTickLoop(){
    exTickNow();
    requestAnimationFrame(exTickLoop);
  })();
  /* One line at a time, swapped in place — a ticker reads calmer than a stacked log.
     The swap is synchronous and the fade is a re-triggered entrance animation: the old
     version added .turn (which blanks the line) and removed it from a setTimeout, so a
     throttled timer left the activity text missing until it was finally serviced. */
  function tick(el,list,i){
    if(!el||el._i===i||!list[i]) return;
    el._i=i;
    el.querySelector('b').textContent=list[i][0];
    el.querySelector('span').textContent=list[i][1];
    el.classList.remove('turn');
    void el.offsetWidth;
    el.classList.add('turn');
  }

  var ACTS=[
    ['DESIGN','Decide what you need to know before you meet them',
      'CareerPassport drafts the role, competencies, journey, evaluation and communications from your brief'],
    ['EXECUTE','Once the role is live, our agents move the process without you operating it',
      'The blueprint goes to work: sourcing, outreach and scheduling run across every channel at once'],
    ['EVIDENCE','See why someone is worth meeting',
      'Every reply becomes a record — what was said, what it means, and why it matters for this role'],
    ['DECIDE','Meet fewer candidates.<br>Know more about the ones you do',
      'By the time you step in, the role is structured, the process has moved and the evidence is assembled. The conversation starts where judgment actually matters']
  ];
  var actNow=-1;
  var textCol=document.querySelector('.aitextcol');
  function setAct(i){
    if(i===actNow) return;
    actNow=i;
    chip.textContent=ACTS[i][0];
    title.innerHTML=ACTS[i][1];
    desc.textContent=ACTS[i][2];
    dots.forEach(function(s,k){
      s.classList.toggle('on',k===i); s.classList.toggle('done',k<i);
    });
    /* trigger a CSS reflow for the enter animation */
    textCol.classList.add('swap');
    void textCol.offsetWidth;
    textCol.classList.remove('swap');
  }


  /* ---- the departures board behind everything ---- */
  var board=document.getElementById('flapBg');
  var glow=sec.querySelector('.flapglow');
  var ROLES=['SENIOR PRODUCT LEAD','STAFF ENGINEER','HEAD OF DESIGN','DATA PLATFORM LEAD',
    'ENTERPRISE AE','SOLUTIONS ARCHITECT','GROUP PRODUCT MGR','SECURITY ENGINEER',
    'FINANCE BUSINESS PTR','CUSTOMER SUCCESS LEAD','PLATFORM SRE','RESEARCH LEAD',
    'BACKEND ENGINEER','REVENUE OPERATIONS','PRINCIPAL DESIGNER','ANALYTICS MANAGER'];
  var CH='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -';
  var STATUS=['BOARDING','VERIFIED','ON TIME','CLAIMED','MATCHED','OPEN'];
  var TITLE_LEN=15, ID_LEN=5, ST_LEN=8, rows=[];
  var cellW=Math.max(24,Math.min(34,innerWidth*0.025));
  var cellH=Math.max(32,Math.min(44,innerWidth*0.033));
  var gapW=Math.max(14,Math.min(26,innerWidth*0.019));
  var grpW=(TITLE_LEN+ID_LEN+ST_LEN)*(cellW+3)+gapW*2+6;
  var ROWS=Math.ceil(innerHeight/(cellH+3))+1;
  var GROUPS=Math.max(1,Math.ceil(innerWidth/grpW)+1);

  function makeCell(cls){
    var c=document.createElement('span'); c.className='flapc'+(cls?' '+cls:''); return c;
  }
  function newId(){
    var s='CP'; for(var i=0;i<3;i++) s+=Math.floor(Math.random()*10); return s;
  }
  for(var r=0;r<ROWS;r++){
    var row=document.createElement('div'); row.className='flaprow';
    var groups=[];
    for(var gI=0;gI<GROUPS;gI++){
      var grp=document.createElement('div'); grp.className='flapgrp';
      var tc=[],ic=[],i;
      for(i=0;i<TITLE_LEN;i++){ var c=makeCell(); grp.appendChild(c); tc.push(c) }
      var gap=document.createElement('span'); gap.className='flapgap'; grp.appendChild(gap);
      for(i=0;i<ID_LEN;i++){ var c2=makeCell('num'); grp.appendChild(c2); ic.push(c2) }
      var gap2=document.createElement('span'); gap2.className='flapgap'; grp.appendChild(gap2);
      var sc=[];
      for(i=0;i<ST_LEN;i++){ var c3=makeCell('st'); grp.appendChild(c3); sc.push(c3) }
      row.appendChild(grp);
      groups.push({title:tc,id:ic,st:sc});
    }
    board.appendChild(row);
    rows.push({el:row,groups:groups});
  }
  function paintGroup(grp,title,id,animate){
    var t=(title+'                 ').slice(0,TITLE_LEN);
    var d=(id+'     ').slice(0,ID_LEN);
    var s=(STATUS[Math.floor(Math.random()*STATUS.length)]+'        ').slice(0,ST_LEN);
    grp.title.forEach(function(cell,i){ set(cell,t[i],i) });
    grp.id.forEach(function(cell,i){ set(cell,d[i],i+TITLE_LEN) });
    grp.st.forEach(function(cell,i){ set(cell,s[i],i+TITLE_LEN+ID_LEN) });
    function set(cell,ch,idx){
      if(!animate){ cell.textContent=ch===' '?'':ch; return }
      setTimeout(function(){
        cell.classList.remove('flip'); void cell.offsetWidth; cell.classList.add('flip');
        setTimeout(function(){ cell.textContent=ch===' '?'':ch },140);
      }, idx*10);
    }
  }
  var pick=function(){ return ROLES[Math.floor(Math.random()*ROLES.length)] };
  rows.forEach(function(row){
    row.groups.forEach(function(g){ paintGroup(g,pick(),newId(),false) });
  });

  var nextRow=0, lastShuffle=0, lastDrift=null;
  function shuffle(){
    var row=rows[nextRow%ROWS]; nextRow++;
    row.groups.forEach(function(g,i){
      setTimeout(function(){ paintGroup(g,pick(),newId(),true) }, i*90);
    });
  }

  /* Act 1 now plays in the hero, so this fold opens on act 2. Its clock is OFFSET rather
     than rescaled — g starts at G0, exactly where act 2 began — so every beat below keeps
     the number it was authored with. */
  var G0=0.478*0.43; /* = act 2's opening beat expressed on this fold's clock */
  var SVH_TOTAL=1750;
  var A2=0.43;
  /* ---- the composed frames, for keyboard readers ----------------------------------
     A pinned fold is one section but nineteen states, so a reader on the arrow keys was
     paying ~349 presses to cross it against ~140 wheel notches. These are the moments
     where something has LANDED — never mid-transition — and the keyboard engine below
     steps between them. Expressed in g, beside the clock they belong to. */
  sec.__stops=[
    0,      /* the panel opens, reading the prompt */
    .234,   /* the three inputs assembled      (p .545) */
    .284,   /* technologies chosen             (p .660) */
    .310,   /* expertise raised                (p .720) */
    .353,   /* evaluations chosen              (p .820) */
    .383,   /* accepted                        (p .892) */
    .404,   /* the journey launched            (p .940) */
    .494,   /* the sources lit */
    .550,   /* the Companion wired out */
    .600,   /* the channels and their reach */
    .630,   /* the agent operating */
    .658,   /* the records stacked */
    .740,   /* one record chosen */
    .804,   /* the deck fanned */
    .876,   /* the cleared candidates read */
    .918,   /* the record comes forward */
    .952,   /* the cover turned */
    .986    /* the offer sent */
  ];
  sec.__toY=function(gv){
    var vh=pin.getBoundingClientRect().height||innerHeight;
    var sp=sec.offsetHeight-vh;
    return Math.round(sec.offsetTop + sp*clamp((gv-G0)/(1-G0),0,1));
  };
  var setH=function(){ sec.style.height=SVH_TOTAL+'svh' };
  setH(); addEventListener('resize',setH,{passive:true});

  var clamp=function(v,a,b){ return Math.min(b,Math.max(a,v)) };
  var seg=function(v,a,b){ return clamp((v-a)/(b-a),0,1) };
  /* The homepage's own easing. The leaf-flip geometry in act 5 was ported from there, so
     the motion has to run on the same curve — on the homepage this sits beside clamp
     and seg for the same reason. */
  var ease=function(t){ return t<.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2 };

  /* ---- the hiring manager's cursor parks on whatever element it is given ---- */
  /* the cursor chases a target with critically-damped easing, so direction changes never snap */
  /* a pointer moved by a person: it accelerates, overshoots a little, settles, and never
     travels in a perfectly straight line. Entry and exit are journeys from off-stage right. */
  var tx=0, ty=0, cx=0, cy=0, vx=0, vy=0, seeded=false, tilt=0, tclock=0, wasOn=false;
  function offstage(){ return {x:stage.offsetWidth+150, y:stage.offsetHeight*0.42} }
  function park(el,ox,oy){
    if(!el) return;
    var r=el.getBoundingClientRect();
    /* A display:none target reports an all-zero rect, which used to send the cursor to the
       panel's top-left corner and back — the random flight. An unrendered target is simply
       ignored, so the cursor holds its last real position instead. */
    if(!r.width||!r.height) return;
    var s=stage.getBoundingClientRect();
    tx=r.left-s.left+r.width*0.5+(ox||0);
    ty=r.top-s.top+r.height*0.5+(oy||0);
    if(!seeded){ var o=offstage(); cx=o.x; cy=o.y; seeded=true }
    cur.classList.toggle('left',tx>stage.offsetWidth*0.55);
  }
  function setVisible(on){
    if(on===wasOn) return;
    if(on){ var o=offstage(); cx=o.x; cy=o.y; vx=0; vy=0 }
    wasOn=on;
  }
  function glide(){
    /* plain easing toward the target — no arc, no tremor, no overshoot */
    cx+=(tx-cx)*0.09;
    cy+=(ty-cy)*0.09;
    cur.style.transform='translate3d('+cx.toFixed(2)+'px,'+cy.toFixed(2)+'px,0)';
    requestAnimationFrame(glide);
  }
  requestAnimationFrame(glide);

  var frame=function(){
    var r=sec.getBoundingClientRect();
    var vh=pin.getBoundingClientRect().height||document.documentElement.clientHeight||innerHeight;
    var span=r.height-vh;
    var g=G0+(span>0 ? clamp(-r.top/span,0,1) : 0)*(1-G0);

    /* the board drifts and reshuffles as the fold is scrolled. Its per-row transforms are
       the most expensive work in this function, so they are written only when the drift has
       actually changed enough to see — the rest of the fold stays responsive at speed. */
    if(lastDrift===null||Math.abs(g-lastDrift)>0.004){
      lastDrift=g;
      var dr=(g-0.5)*52;
      rows.forEach(function(row,i){
        var d=(i-(ROWS-1)/2)/((ROWS-1)/2);
        var away=Math.abs(d);
        row.el.style.translate='0 '+(dr*(1+away*0.55)).toFixed(1)+'px';
        if(!row.set){
          row.set=true;
          row.el.style.transform='perspective(760px) rotateX('+(-d*7).toFixed(2)+'deg) scale('+
            (1-away*0.05).toFixed(3)+')';
          row.el.style.opacity=(0.5+0.5*away).toFixed(2);
        }
      });
      board.style.opacity=(0.46-0.15*Math.abs(g-0.5)*2).toFixed(3);
      glow.style.translate=(-14+g*28).toFixed(1)+'% '+(10-g*20).toFixed(1)+'%';
      glow.style.rotate=(-8+g*16).toFixed(1)+'deg';
      glow.style.scale=(1+Math.sin(g*Math.PI)*0.14).toFixed(3);
    }
    if(Math.abs(g-lastShuffle)>0.012){ lastShuffle=g; shuffle() }

    /* acts 1 and 2 keep their own 0..1 clock inside the first 43% of the fold */
    var p=clamp(g/A2,0,1);
    setAct(g<0.452?0:g<0.652?1:g<0.852?2:3);

    /* act 2's approve press holds long enough to register even at speed */
    var subPress=p>=.858&&p<.892&&g<A2;
    submitBtn.classList.toggle('pressed',subPress);

    /* act 2 — the prompt is read, then the three inputs are set
         .478–.545  reading the prompt (latched: also completes on its own clock)
         .545       the three groups assemble, staggered in CSS
         .600–.655  two more technologies are added
         .655–.720  the expertise level is raised to Pro
         .720–.820  two more evaluations are chosen
         .830       Accept is offered, .845 armed and the blueprint reads ready
         .858–.892  the press
         .900       the panel recedes, .912 finalised, .940 launched                  */
    box.classList.toggle('big',p>=.478);

    /* The processing screen resolves on the clock as well as on scroll, so stopping
       mid-scroll cannot leave a reader parked on a spinner — the form assembles anyway. */
    var now=Date.now();
    if(p>=.478&&g<.452&&r.top<=0){ if(!prepArmed) prepArmed=now }
    else prepArmed=0;
    var prepDone=p>=.545||(prepArmed&&now-prepArmed>1150);
    /* while it is still reading, it drives its own frames — so stopping mid-scroll still
       resolves into the form instead of resting on a spinner */
    if(prepArmed&&!prepDone&&!prepPump){
      prepPump=requestAnimationFrame(function(){ prepPump=0; frame() });
    }
    prep.classList.toggle('on',p>=.478&&!prepDone);
    bp.classList.toggle('on',prepDone&&g<.452);
    /* one class for all three groups: the stagger is a CSS transition-delay, so it plays
       out on time rather than needing scroll to advance it */
    bpGroups.forEach(function(el){ el.classList.toggle('vis',prepDone) });

    /* — the technologies — */
    var chipStep=-1;
    if(p>=.600&&p<.655) chipStep=Math.min(1,Math.floor(seg(p,.600,.655)*2));
    var CHIP_AT=[.620,.648];
    var chipHov=chipStep<0?-1:CHIP_ADD[chipStep];
    var nChips=CHIP_BASE.length;
    chips.forEach(function(el,i){
      var add=CHIP_ADD.indexOf(i);
      var on=CHIP_BASE.indexOf(i)>=0||(add>=0&&p>=CHIP_AT[add]);
      if(on&&CHIP_BASE.indexOf(i)<0) nChips++;
      el.classList.toggle('pick',on);
      el.classList.toggle('hov',i===chipHov);
    });
    var chipOut=bpGroups[0]&&bpGroups[0].querySelector('.bpglbl em');
    if(chipOut) chipOut.textContent=nChips+' selected';

    /* — the expertise level — the thumb sits at the head of its own label, as in the
         reference, so the fill and the label read as one control — */
    var onSlider=p>=.655&&p<.720;
    var lvl=p>=.690?3:2;
    var lvlPct=(lvl/LVL_N)*100;
    if(sFill) sFill.style.width='calc('+lvlPct.toFixed(2)+'% + 9px)';
    if(sThumb) sThumb.style.left='calc('+lvlPct.toFixed(2)+'% + 9px)';
    if(lvlOut) lvlOut.textContent=LVL_NAMES[lvl];

    /* — the evaluation matrix — */
    var mxStep=-1;
    if(p>=.720&&p<.820) mxStep=Math.min(1,Math.floor(seg(p,.720,.820)*2));
    var MX_AT=[.755,.800];
    var mxHov=mxStep<0?-1:MX_ADD[mxStep];
    var nMx=MX_BASE.length;
    mxCells.forEach(function(el,i){
      var add=MX_ADD.indexOf(i);
      var on=MX_BASE.indexOf(i)>=0||(add>=0&&p>=MX_AT[add]);
      if(on&&MX_BASE.indexOf(i)<0) nMx++;
      el.classList.toggle('pick',on);
      el.classList.toggle('hov',i===mxHov);
    });
    if(mxOut) mxOut.textContent=nMx+' of 9';

    ready.classList.toggle('on',p>=.845&&g<.452);
    submitBtn.classList.toggle('on',p>=.830);
    submitBtn.classList.toggle('armed',p>=.845);

    /* the handover — the blueprint recedes, two lines land, the agent takes the role */
    bp.classList.toggle('done',p>=.900&&g<.452);
    fin1.classList.toggle('on',p>=.912&&g<.452);
    fin2.classList.toggle('on',p>=.940&&g<.452);

    /* ---------- act 3 · one role, wired to every source and channel ---------- */
    ex.classList.toggle('on',g>=.452&&g<.655);
    hub.classList.toggle('on',g>=.466);
    srcs.forEach(function(el){ el.classList.toggle('on',g>=.494) });
    chans.forEach(function(el){ el.classList.toggle('on',g>=.576) });
    wires.forEach(function(w,i){
      w.classList.toggle('lit', g >= (i<3 ? .522 : .550));
    });
    exTickNow();

    /* a packet appears only after its own line has been drawn, never before */
    exDots.forEach(function(d){
      var i=+d.getAttribute('data-w');
      var lineAt = i<3 ? .522 : .550;
      d.classList.toggle('on', g>=lineAt+0.02 && g<.655);
    });
    exDivs.forEach(function(d){ d.classList.toggle('on',g>=.494&&g<.655) });
    reach.forEach(function(w){ w.classList.toggle('lit',g>=.600) });


    /* ---------- act 4 · the pool narrows to one record worth reading ---------- */
    /* .652  the panel opens with the records already in it
       .658  the four covers land, staggered by the .05s-per-card transition delay
       .700  the manager arrives and reads down the stack
       .740  Open record is offered
       .776  the press
       .804  the deck fans — and holds for 51 thousandths, not 18 */
    ev.classList.toggle('on',g>=.652&&g<.855);
    evStack.classList.toggle('on',g>=.658);
    var evPress=g>=.776&&g<.812;
    evBtn.classList.toggle('on',g>=.740);
    evBtn.classList.toggle('armed',g>=.762);
    evBtn.classList.toggle('pressed',evPress);
    /* the press opens the deck */
    evStack.classList.toggle('spread',g>=.804);

    /* ---------- act 5 · one record read in full, then the decision ----------
       g .852 .. 1, in contiguous beats, each naming one cursor target:
         .852–.876  the twenty candidates arrive
         .876–.912  the three cleared ones are read
         .910–.918  one is opened
         .918–.930  the grid clears and the record comes forward
         .930–.952  the cover turns
         .952–.968  the first leaf turns
         .968–.986  Share offer
         .986–1     the offer lands                                              */
    dc.classList.toggle('on',g>=.852);
    /* the panel's height changes with the act, and a reader scrolling in fires no resize */
    sizeBook();
    dcTiles.forEach(function(el,i){ el.classList.toggle('vis',g>=.856+i*0.0016) });

    var dcOpen=g>=.918;
    dcGrid.classList.toggle('gone',dcOpen);
    dcPass.classList.toggle('on',dcOpen);

    /* the three cleared candidates are read one at a time */
    var dcHov=-1;
    if(g>=.876&&g<.910) dcHov=Math.min(2,Math.floor(seg(g,.876,.910)*3));
    dcLive.forEach(function(el,i){
      el.classList.toggle('hov',i===dcHov&&!dcOpen);
      el.classList.toggle('pressed',i===0&&g>=.910&&g<.918);
      el.classList.toggle('chosen',i===0&&g>=.914);
    });

    /* the leaves turn on the same easing and the same geometry the homepage uses, and
       the book shuts again as the offer goes out — the record closes on the decision */
    var dcFlips=[[.930,.952],[.952,.968],[9,9],[9,9],[9,9]];
    var dcShut=ease(seg(g,.980,.992));
    var dcCoverOpen=0;
    for(var li=0;li<dcLeaves.length;li++){
      var dlf=dcLeaves[li]; if(!dlf) continue;
      var lp=dcOpen?ease(seg(g,dcFlips[li][0],dcFlips[li][1]))*(1-dcShut):0;
      if(li===0) dcCoverOpen=lp;
      var zw=(1-lp)*(4-li)*1.8 + lp*(li+1)*1.8 + Math.sin(Math.PI*lp)*14;
      dlf.style.transform='translateZ('+zw.toFixed(2)+'px) rotateY('+(-180*lp).toFixed(2)+'deg)';
      var turned=lp>0.5;
      if(dlf.children[0]) dlf.children[0].style.visibility=turned?'hidden':'visible';
      if(dlf.children[1]) dlf.children[1].style.visibility=turned?'visible':'hidden';
      if(dcCurls[li]) dcCurls[li].style.opacity=(Math.sin(Math.PI*lp)*0.85).toFixed(3);
    }
    /* Nothing sits ahead of a cover, so the left page and the gutter exist only once the
       cover has swung essentially flat — and they leave again on the way back, because
       dcCoverOpen returns to 0 as the book shuts. */
    var dcO=ease(seg(dcCoverOpen,0.70,0.86));
    if(dcVerso) dcVerso.style.setProperty('--vop',dcO.toFixed(3));
    if(dcSpine) dcSpine.style.setProperty('--sop',(ease(seg(dcCoverOpen,0.70,0.88))*0.9).toFixed(3));
    if(dcBook){
      /* THE PLACEMENT IS SOLVED, NOT SEARCHED.

         What was here was a closed-loop controller: it wrote --bx, measured the painted
         page, computed the error, accumulated it into --bxc at gain 1.0, and wrote --bx
         again — every frame, while the rotation it was measuring against changed every
         frame. A unity-gain corrector chasing a moving target through a one-frame delay
         oscillates, and it also ratcheted dcPad upward mid-swing, which re-ran sizeBook()
         and stepped the scale. Worse, the correction branch re-wrote --bx with (1-dcO)
         while the line above wrote it with (1-dcCen) — two different positions for the
         same frame, flip-flopping as the error crossed the half-pixel threshold. Those
         are the glitches.

         None of it was necessary. The geometry is fully known: the book is a 920x640 box
         whose centre sits at the panel centre plus --bx (a layout offset, hence unscaled,
         hence the *dcS). A shut cover occupies book-space x 460..920, centre 690 — that
         is 230 units right of the box centre, so the box shifts 230 units left to read
         centred. An open spread occupies 0..920, centre 460, and needs no shift. The
         perspective projection displaces this by well under a pixel at these scales, and
         a static sub-pixel offset is invisible where an oscillation is not. */
      var dcS=parseFloat(getComputedStyle(dcPp).getPropertyValue('--pps'))||0.3;
      var dcCen=dcCoverOpen;
      dcBook.style.setProperty('--bx',(-230*dcS*(1-dcCen)).toFixed(2)+'px');
      dcBook.style.transform='rotateY('+(-15+6*dcCen).toFixed(2)+'deg) rotateX(5deg)';
    }
    /* the four actions, and the one the manager takes */
    dcActs.forEach(function(el,i){ el.classList.toggle('vis',dcOpen&&g>=.934+i*0.004) });
    var dcShare=dcActs[1];
    var dcOnShare=g>=.968&&g<.992;
    var dcPress=g>=.976&&g<.986;
    dcActs.forEach(function(el,i){
      el.classList.toggle('hov',i===1&&dcOnShare);
      el.classList.toggle('armed',i===1&&g>=.972);
      el.classList.toggle('pressed',i===1&&dcPress);
    });
    if(dcSent) dcSent.classList.toggle('on',g>=.988);
    dcConf.classList.toggle('on',g>=.988);

    /* ---------- who is on stage, and where their hand is ---------- */
    var curOn2 = (p>=.590&&p<.995&&g<A2) ||
                 (g>=.700&&g<.852) || (g>=.872&&g<.992);
    cur.classList.toggle('on',curOn2);
    cur.classList.toggle('away',!curOn2);
    setVisible(curOn2);
    cur.classList.toggle('click',subPress||evPress||dcPress);

    if(g<A2){
      /* one target per beat, in the order the beats run */
      if(chipHov>=0) park(chips[chipHov],0,2);
      else if(onSlider) park(sThumb,0,1);
      else if(mxHov>=0) park(mxCells[mxHov],0,3);
      else park(submitBtn,2,2);
    }else if(g<.86){
      if(g<.740) park(evStack.querySelector('.evpass'),0,10);
      else park(evBtn,2,2);
    }else{
      /* one target per beat; park() skips anything not rendered */
      if(dcHov>=0) park(dcLive[dcHov],0,4);
      else if(g>=.910&&g<.918) park(dcLive[0],0,4);
      else if(dcOpen) park(dcShare,0,2);
      else park(dcLive[0],0,4);
    }
  };
  frame();
  var queued=false;
  var onScroll=function(){
    if(queued) return;
    queued=true;
    requestAnimationFrame(function(){ queued=false; frame() });
  };
  addEventListener('scroll',onScroll,{passive:true});
  addEventListener('resize',function(){ lastDrift=null; frame() },{passive:true});
})();


/* ---- the stacked reading of the comparison, generated FROM the table ----
   One source of truth: edit a cell in the markup above and the stacked version follows,
   so the two readings can never drift apart. */
(function(){
  var grid=document.querySelector('.cmpg'), out=document.getElementById('cmpStack');
  if(!grid||!out) return;
  var kids=[].slice.call(grid.children);
  /* head: [Compare][liftcol][us][3 others] then repeating [rowlabel][4 cells] */
  var heads=kids.filter(function(k){ return k.classList.contains('cmph') })
                .map(function(k){ return k.querySelector('b').textContent });
  var cols=heads.slice(1);                       /* CareerPassport + the three others */
  var rows=[],cur=null;
  kids.forEach(function(k){
    if(k.classList.contains('cmpr')){
      cur={label:k.querySelector('b').textContent,cells:[]};
      rows.push(cur);
    } else if(k.classList.contains('cell') && cur){
      cur.cells.push(k.querySelector('p').textContent);
    }
  });
  out.innerHTML=rows.map(function(r){
    var others=r.cells.slice(1).map(function(c,i){
      return '<div class="mo"><em>'+(cols[i+1]||'').toUpperCase()+'</em><p>'+c+'</p></div>';
    }).join('');
    return '<div class="cmpb"><b>'+r.label+'</b>'+
      '<div class="mus"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>'+
      '<div><em>CAREERPASSPORT</em><p>'+r.cells[0]+'</p></div></div>'+others+'</div>';
  }).join('');
})();

/* ---- the companies strip: user-filled slots, duplicated for a seamless loop ---- */
(function(){
  var track=document.getElementById('logoTrack'); if(!track) return;
  var N=7, html='';
  for(var pass=0;pass<2;pass++){
    for(var i=1;i<=N;i++){
      html+='<div class="lg"><image-slot id="cmp-logo-'+i+'" shape="rect" '+
        (pass?'aria-hidden="true" ':'')+'placeholder="Logo '+i+'"></image-slot></div>';
    }
  }
  track.innerHTML=html;
})();

/* ---- reveal on enter ----
   The animation is an enhancement and is never allowed to hide content, but it also must
   not switch itself off just because the host frame is tall. The earlier version bailed
   whenever scrollHeight was not greater than clientHeight, which is true of any preview
   pane or capture that sizes the frame to the whole document — so on those hosts nothing
   ever animated. Now it always arms, and three separate safety nets guarantee content:

   1. anything already inside the first viewport is shown on the next frame;
   2. an observer plus a scroll/resize sweep reveals the rest as it arrives;
   3. a hard backstop reveals everything after 2.5s, so a frame where nothing can ever
      "enter" (no scrolling, full-height host) still ends up fully painted. */
(function(){
  var els=[].slice.call(document.querySelectorAll('.rv'));
  if(!els.length || !('IntersectionObserver' in window)) return;

  var de=document.documentElement;
  /* The visual viewport is window.innerHeight, NOT documentElement.clientHeight. Preview
     panes and capture hosts size the frame to the whole document, which makes clientHeight
     equal scrollHeight — reading the viewport from it made every element on the page test
     as "already in view", so all 48 revealed at load and nothing could animate. */
  var vp=function(){ return innerHeight || de.clientHeight };
  var scrollable=function(){ return de.scrollHeight > vp() + 80 };

  de.classList.add('rv-armed');
  var show=function(e){ e.classList.add('in') };
  var sweep=function(){
    var h=vp();
    els.forEach(function(e){
      if(e.classList.contains('in')) return;
      var r=e.getBoundingClientRect();
      /* revealed once it has genuinely crossed into the viewport, not before */
      if(r.top < h * 0.94 && r.bottom > -40) show(e);
    });
  };

  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){ if(en.isIntersecting){ show(en.target); io.unobserve(en.target) } });
  },{threshold:0,rootMargin:'0px 0px -6% 0px'});
  els.forEach(function(e){ io.observe(e) });

  requestAnimationFrame(function(){ requestAnimationFrame(sweep) });
  addEventListener('load',sweep);
  addEventListener('scroll',sweep,{passive:true});
  addEventListener('resize',sweep,{passive:true});
  setTimeout(sweep,1000);
  /* The backstop only applies where scrolling can never happen. Firing it unconditionally
     would reveal the whole page a few seconds after load, which defeats the reveal for
     everything below the fold. */
  setTimeout(function(){ if(!scrollable()) els.forEach(show) },2500);
})();

/* ---- mobile nav ---- */
(function(){
  var b=document.getElementById('burger'), m=document.getElementById('mnav');
  if(!b||!m) return;
  b.addEventListener('click',function(){
    var o=m.classList.toggle('open'); b.setAttribute('aria-expanded',o?'true':'false');
  });
  [].slice.call(m.querySelectorAll('a')).forEach(function(a){
    a.addEventListener('click',function(){ m.classList.remove('open'); b.setAttribute('aria-expanded','false'); });
  });
})();

/* ---- demo capture ---- */
(function(){
  [].slice.call(document.querySelectorAll('[data-capture]')).forEach(function(f){
    var i=f.querySelector('input'), b=f.querySelector('button'); if(!i||!b) return;
    var done=b.getAttribute('data-done')||'SENT';
    b.addEventListener('click',function(){
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(i.value.trim())) return i.focus();
      f.classList.add('done'); b.textContent=done; i.readOnly=true;
    });
    i.addEventListener('keydown',function(e){ if(e.key==='Enter') b.click(); });
  });
})();
