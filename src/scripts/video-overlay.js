/* ---- the video overlay -------------------------------------------------------------
   Paste the real URL here. A youtube.com / youtu.be / vimeo.com link is mounted as an
   iframe; anything else is treated as a file and mounted as a <video controls>. Left
   empty, the overlay shows its placeholder panel. */
(function(){
  var VIDEO_URL = '';

  var m=document.getElementById('vmodal'), slot=document.getElementById('vmslot'),
      close=document.getElementById('vmclose');
  if(!m||!slot||!close) return;
  var opener=null, mounted=false;

  function embed(){
    if(mounted||!VIDEO_URL) return;
    var u=VIDEO_URL, el;
    if(/youtube\.com|youtu\.be|vimeo\.com/.test(u)){
      el=document.createElement('iframe');
      el.src=u+(u.indexOf('?')<0?'?':'&')+'autoplay=1&rel=0';
      el.allow='accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture';
      el.allowFullscreen=true;
      el.title='How CareerPassport works';
    } else {
      el=document.createElement('video');
      el.src=u; el.controls=true; el.autoplay=true; el.playsInline=true;
    }
    slot.innerHTML=''; slot.appendChild(el); mounted=true;
  }

  function open(e){
    if(e){ e.preventDefault(); opener=e.currentTarget }
    embed();
    m.hidden=false;
    /* a frame between unhide and .on, or the opacity transition has nothing to run from */
    requestAnimationFrame(function(){ m.classList.add('on') });
    document.documentElement.style.overflow='hidden';
    close.focus();
  }

  function shut(){
    m.classList.remove('on');
    document.documentElement.style.overflow='';
    /* stop playback rather than leaving audio running behind a hidden overlay */
    var v=slot.querySelector('video'); if(v) v.pause();
    var f=slot.querySelector('iframe'); if(f) f.src=f.src;
    setTimeout(function(){ m.hidden=true }, 200);
    if(opener&&opener.focus) opener.focus();
  }

  [].forEach.call(document.querySelectorAll('a.ghost,[data-video]'),function(a){
    a.addEventListener('click',open);
  });
  close.addEventListener('click',shut);
  m.addEventListener('click',function(e){ if(e.target===m) shut() });
  addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!m.hidden) shut();
  });
})();
