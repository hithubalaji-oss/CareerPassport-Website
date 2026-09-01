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

/* ---- fold 02: one sentence becomes a hiring blueprint, scroll-driven ---- */
(function(){
  var sec=document.getElementById('aidemo'); if(!sec) return;
  var pin=sec.querySelector('.aidemopin');
  var eyebrow=document.getElementById('aiEyebrow');
  var stage=document.getElementById('aiStage');
  var chat=document.getElementById('aiChat');
  var textEl=document.getElementById('aiText');
  var searchBtn=document.getElementById('aiSearchBtn');
  var submitBtn=document.getElementById('aiSubmit');
  var box=document.getElementById('aiBox');
  var prep=document.getElementById('aiPrep');
  var bp=document.getElementById('aiBp');
  var ready=document.getElementById('aiReady');
  var pill=document.getElementById('aiPill');
  var cur=document.getElementById('hmCur');
  var fin1=document.getElementById('aiFin1');
  var fin2=document.getElementById('aiFin2');
  var cards=[].slice.call(bp.querySelectorAll('.bpk'));
  var chip=document.getElementById('actChip');
  var title=document.getElementById('actTitle');
  var dots=[].slice.call(document.querySelectorAll('#actDots i'));
  var ex=document.getElementById('aiEx'), ev=document.getElementById('aiEv'), dc=document.getElementById('aiDc');
  var wires=[].slice.call(ex.querySelectorAll('.wire:not(.reach)'));
  var reach=[].slice.call(ex.querySelectorAll('.wire.reach'));
  var srcs=[].slice.call(ex.querySelectorAll('.exnode.src'));
  var chans=[].slice.call(ex.querySelectorAll('.exnode.chn'));
  var hub=document.getElementById('exHub');
  var exTicker=document.getElementById('exTicker');
  var funs=[].slice.call(ev.querySelectorAll('.evf'));
  var evStack=document.getElementById('evStack');
  var evBtn=document.getElementById('evBtn');
  var dcTicker=document.getElementById('dcTicker');
  var dcEnd=document.getElementById('dcEnd');
  var slots=[document.getElementById('dcSlot0'),document.getElementById('dcSlot1'),document.getElementById('dcSlot2')];

  var EXLOG=[['09:42','Approached via email'],['11:18','Response received'],
    ['11:19','Candidate Journey shared'],['14:32','Assessment coordinated'],
    ['16:07','Interview slot proposed']];
  var DCLOG=[['16 SEP','Conversation held, notes recorded'],
    ['16 SEP','Evidence attached to the record'],
    ['17 SEP','Every candidate told where they stand']];
  /* one line at a time, swapped in place — a ticker reads calmer than a stacked log */
  function tick(el,list,i){
    if(el._i===i||!list[i]) return;
    el._i=i; el.classList.add('turn');
    setTimeout(function(){
      el.querySelector('b').textContent=list[i][0];
      el.querySelector('span').textContent=list[i][1];
      el.classList.remove('turn');
    },220);
  }

  var ACTS=[
    ['DEFINE','One intent becomes a hiring blueprint.'],
    ['DESIGN','Decide what you need to know before you meet them.'],
    ['EXECUTE','Once the role is live, our agents move the process without you operating it.'],
    ['EVIDENCE','See why someone is worth meeting.'],
    ['DECIDE','Meet fewer candidates.<br>Know more about the ones you do.']
  ];
  var actNow=-1;
  function setAct(i){
    if(i===actNow) return;
    actNow=i;
    chip.textContent=ACTS[i][0];
    title.innerHTML=ACTS[i][1];
    dots.forEach(function(s,k){
      s.classList.toggle('on',k===i); s.classList.toggle('done',k<i);
    });
  }
  var loaders=[].slice.call(bp.querySelectorAll('.bpload'));

  var QUERY="I need a senior product leader who has built enterprise products, worked through ambiguity and can operate across engineering, sales and customers.";
  textEl.innerHTML=QUERY.split(' ').map(function(w){ return '<span>'+w+'</span>' }).join(' ');
  var wordEls=[].slice.call(textEl.querySelectorAll('span'));
  var caret=document.createElement('span');
  caret.className='aicaret'; caret.setAttribute('aria-hidden','true');
  textEl.insertBefore(caret,textEl.firstChild);

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

  var SVH_TOTAL=2200;
  var A2=0.43; /* acts 1 and 2 occupy the first 43% */
  var setH=function(){ sec.style.height=SVH_TOTAL+'svh' };
  setH(); addEventListener('resize',setH,{passive:true});

  var clamp=function(v,a,b){ return Math.min(b,Math.max(a,v)) };
  var seg=function(v,a,b){ return clamp((v-a)/(b-a),0,1) };

  /* ---- the hiring manager's cursor parks on whatever element it is given ---- */
  /* the cursor chases a target with critically-damped easing, so direction changes never snap */
  /* a pointer moved by a person: it accelerates, overshoots a little, settles, and never
     travels in a perfectly straight line. Entry and exit are journeys from off-stage right. */
  var tx=0, ty=0, cx=0, cy=0, vx=0, vy=0, seeded=false, tilt=0, tclock=0, wasOn=false;
  function offstage(){ return {x:stage.offsetWidth+150, y:stage.offsetHeight*0.42} }
  function park(el,ox,oy){
    if(!el) return;
    var s=stage.getBoundingClientRect(), r=el.getBoundingClientRect();
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
    var g=span>0 ? clamp(-r.top/span,0,1) : 0;

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
          row.el.style.filter=away>0.55?'none':'blur('+((0.55-away)*2.1).toFixed(2)+'px)';
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
    setAct(g<0.2055?0:g<0.452?1:g<0.652?2:g<0.852?3:4);

    /* act 1 — the brief fills in, word by word */
    var wp=seg(p,.05,.36);
    var n=Math.round(wp*wordEls.length);
    wordEls.forEach(function(w,i){
      w.classList.toggle('hot',i<n);
      w.classList.toggle('lead',i===n-1&&n<wordEls.length);
    });
    /* the caret sits immediately after the word that just filled */
    if(caret._n!==n){
      caret._n=n;
      if(n<=0) textEl.insertBefore(caret,textEl.firstChild);
      else wordEls[Math.min(n,wordEls.length)-1].after(caret);
    }
    caret.classList.toggle('on',p>.03&&p<.44);

    var done=n>=wordEls.length;
    searchBtn.classList.toggle('armed',done);
    pill.classList.toggle('hot',done);
    chat.classList.toggle('searching',p>=.36);

    /* the presses hold long enough to register even at speed */
    var sendPress=p>=.415&&p<.475&&g<A2, subPress=p>=.895&&p<.945&&g<A2;
    searchBtn.classList.toggle('pressed',sendPress);
    submitBtn.classList.toggle('pressed',subPress);

    /* act 2 — the box grows, prepares, then draws the blueprint */
    chat.classList.toggle('off',p>=.478);
    box.classList.toggle('big',p>=.478);
    prep.classList.toggle('on',p>=.478&&p<.625);
    bp.classList.toggle('on',p>=.605&&g<.452);

    /* every card loads at once, then every card fills at once */
    var loading = p>=.62 && p<.70;
    var filled = p>=.70;
    cards.forEach(function(el){
      el.classList.toggle('on',p>=.61);
      el.classList.toggle('filled',filled);
    });
    loaders.forEach(function(el){ el.classList.toggle('on',loading) });
    ready.classList.toggle('on',p>=.71&&p<.86);

    /* the hiring manager reviews each card, then submits */
    var hover=-1;
    if(p>=.72&&p<.865) hover=Math.min(4,Math.floor(seg(p,.72,.865)*5));
    cards.forEach(function(el,i){ el.classList.toggle('hov',i===hover) });
    submitBtn.classList.toggle('on',p>=.865);
    submitBtn.classList.toggle('armed',p>=.885);

    /* the handover — the blueprint recedes, two lines land, the agent takes the role */
    bp.classList.toggle('done',p>=.95&&g<.452);
    fin1.classList.toggle('on',p>=.955&&g<.452);
    fin2.classList.toggle('on',p>=.978&&g<.452);

    /* ---------- act 3 · one role, wired to every source and channel ---------- */
    ex.classList.toggle('on',g>=.452&&g<.655);
    hub.classList.toggle('on',g>=.462);
    srcs.forEach(function(el,i){ el.classList.toggle('on',g>=.474+i*0.014) });
    chans.forEach(function(el,i){ el.classList.toggle('on',g>=.545+i*0.016) });
    wires.forEach(function(w,i){
      w.classList.toggle('lit', i<3 ? g>=.482+i*0.014 : g>=.552+(i-3)*0.016);
    });
    reach.forEach(function(w){
      var c=+w.getAttribute('data-r');
      w.classList.toggle('lit',g>=.566+c*0.016);
    });
    tick(exTicker,EXLOG,Math.min(EXLOG.length-1,Math.floor(seg(g,.50,.648)*EXLOG.length)));

    /* ---------- act 4 · the pool narrows to one record worth reading ---------- */
    ev.classList.toggle('on',g>=.652&&g<.855);
    funs.forEach(function(el,i){ el.classList.toggle('on',g>=.668+i*0.022) });
    evStack.classList.toggle('on',g>=.748);
    var evPress=g>=.806&&g<.842;
    evBtn.classList.toggle('on',g>=.778);
    evBtn.classList.toggle('armed',g>=.796);
    evBtn.classList.toggle('pressed',evPress);
    /* the press opens the deck */
    evStack.classList.toggle('spread',g>=.834);

    /* ---------- act 5 · three conversations, and a record of each ---------- */
    dc.classList.toggle('on',g>=.852);
    slots.forEach(function(el,i){ if(el) el.classList.toggle('on',g>=.866+i*0.014) });
    var pick=-1;
    if(g>=.892) pick=Math.min(2,Math.floor(seg(g,.892,.952)*3));
    var dcPress=(g>=.906&&g<.920)||(g>=.926&&g<.940)||(g>=.946&&g<.960);
    slots.forEach(function(el,i){
      if(!el) return;
      /* once a conversation is booked it stays booked — the closing frame shows all three */
      el.classList.toggle('picked',g>=.906+i*0.02);
      el.classList.toggle('pressed',dcPress&&i===pick);
      /* the actions open on whichever conversation the manager is on */
      el.classList.toggle('hov',i===pick&&g<.962);
    });
    tick(dcTicker,DCLOG,Math.min(DCLOG.length-1,Math.floor(seg(g,.905,.985)*DCLOG.length)));
    dcEnd.classList.toggle('on',g>=.966);

    /* ---------- who is on stage, and where their hand is ---------- */
    var curOn2 = (p>=.35&&p<.485&&g<A2) || (p>=.685&&p<.955&&g<A2) ||
                 (g>=.762&&g<.852) || (g>=.876&&g<.968);
    cur.classList.toggle('on',curOn2);
    cur.classList.toggle('away',!curOn2);
    setVisible(curOn2);
    cur.classList.toggle('click',sendPress||subPress||evPress||dcPress);

    if(g<A2){
      if(p<.72) park(searchBtn,2,2);
      else if(hover>=0) park(cards[hover],0,6);
      else park(submitBtn,2,2);
    }else if(g<.86){
      if(g<.786) park(evStack.querySelector('.evpass'),0,10);
      else park(evBtn,2,2);
    }else{
      park(slots[Math.max(0,pick)],2,2);
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
