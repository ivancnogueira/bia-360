(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.querySelector('#counter');
  const menu = document.querySelector('#menu');
  const menuBtn = document.querySelector('#menuBtn');
  const list = document.querySelector('#slideList');
  const video = document.querySelector('#biaVideo');
  let index = 0;
  const clamp = n => Math.max(0, Math.min(slides.length - 1, n));
  function show(n, update = true) {
    index = clamp(n);
    slides.forEach((s, i) => { s.classList.toggle('active', i === index); s.setAttribute('aria-hidden', i !== index); });
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    if (video && !slides[index].contains(video)) { video.pause(); if (document.fullscreenElement === video) document.exitFullscreen?.(); }
    if (update) history.replaceState(null, '', `#${index + 1}`);
    document.title = `${slides[index].dataset.title} | Rose Barone`;
  }
  function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  slides.forEach((slide, i) => {
    const li = document.createElement('li'); const b = document.createElement('button');
    b.textContent = slide.dataset.title; b.addEventListener('click', () => { show(i); closeMenu(); });
    li.appendChild(b); list.appendChild(li);
  });
  document.querySelector('#prev').addEventListener('click', () => show(index - 1));
  document.querySelector('#next').addEventListener('click', () => show(index + 1));
  menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.querySelector('#closeMenu').addEventListener('click', closeMenu);
  document.querySelectorAll('[data-go], [data-target]').forEach(b => b.addEventListener('click', () => { const target=b.dataset.target ? slides.findIndex(s => s.dataset.title === b.dataset.target) : Number(b.dataset.go); if(target >= 0) show(target); closeMenu(); }));
  document.querySelector('#fullscreen').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.target.closest('input,textarea,select') || document.fullscreenElement === video || (e.target.closest('button') && [' ', 'Enter'].includes(e.key))) return;
    if (['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); show(index + 1); }
    if (['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)) { e.preventDefault(); show(index - 1); }
    if (e.key === 'Home') { e.preventDefault(); show(0); }
    if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
  });
  window.addEventListener('hashchange', () => show((parseInt(location.hash.slice(1), 10) || 1) - 1, false));
  let startX = 0, startY = 0;
  document.querySelector('#deck').addEventListener('touchstart', e => { startX=e.changedTouches[0].clientX; startY=e.changedTouches[0].clientY; }, {passive:true});
  document.querySelector('#deck').addEventListener('touchend', e => { if (e.target.closest('video')) return; const dx=e.changedTouches[0].clientX-startX, dy=e.changedTouches[0].clientY-startY; if (Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.4) show(index + (dx<0?1:-1)); }, {passive:true});
  document.querySelector('#videoFull').addEventListener('click', () => { const msg=document.querySelector('#videoMessage'); if (video.readyState === 0 || video.error) { msg.textContent='Vídeo indisponível. Confira o arquivo e a conexão.'; return; } const request=video.requestFullscreen ? video.requestFullscreen() : Promise.reject(); request.catch(() => { msg.textContent='Tela cheia indisponível neste navegador. Use os controles do vídeo.'; }); video.play().catch(() => { msg.textContent='Use o botão de reprodução do vídeo.'; }); });
  video.addEventListener('loadeddata', () => video.parentElement.classList.add('ready'));
  video.addEventListener('error', () => { video.hidden = true; document.querySelector('#videoFull').hidden = true; }, true);
  show((parseInt(location.hash.slice(1), 10) || 1) - 1, false);
})();
