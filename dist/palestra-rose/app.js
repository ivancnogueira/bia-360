(() => {
  const slides = [...document.querySelectorAll('.slide')];
  const counter = document.querySelector('#counter');
  const menu = document.querySelector('#menu');
  const menuBtn = document.querySelector('#menuBtn');
  const list = document.querySelector('#slideList');
  const video = document.querySelector('#biaVideo');
  let index = 0;
  let navigationRequest = 0;
  // Load and decode slide artwork early so text and image appear together.
  const artwork = [
    'rose-retrato.png', 'familia-ambiente.png', 'familia-ambiente-43.png',
    'rose-metafora-polvo.png', 'rose-acrobata.png', 'rose-reflexao.png',
    'rose-palestrante.png', 'bia.png', 'bia-barbeira.png', 'bia-educadora.png',
    'tempo.png', 'qr-planos.png', 'visagismo-antes-depois.png', 'colorimetria-antes-depois.png', 'rose-varios-lugares.png'
  ];
  const images = new Map(artwork.map(name => {
    const img = new Image();
    const state = { img, ready: false, done: null };
    state.done = new Promise(resolve => {
      img.onload = () => {
        const decoded = typeof img.decode === 'function' ? img.decode().catch(() => {}) : Promise.resolve();
        decoded.then(() => { state.ready = true; resolve(); });
      };
      img.onerror = () => { state.ready = true; resolve(); };
    });
    img.src = `assets/${name}`;
    return [name, state];
  }));
  function slideArtwork(slide) {
    const title = slide.dataset.title;
    if (title === 'Abertura') return 'rose-retrato.png';
    if (title === 'Muitos papéis' || title === 'Sonhos realizados') return window.matchMedia('(min-width: 701px) and (max-aspect-ratio: 3/2)').matches ? 'familia-ambiente-43.png' : 'familia-ambiente.png';
    return ({ 'Mulher polvo': 'rose-metafora-polvo.png', 'Equilibrar': 'rose-acrobata.png', 'A virada': 'rose-reflexao.png', 'Não cabe tudo': 'rose-varios-lugares.png', 'Minha escolha': 'rose-palestrante.png', 'Conheça a BIA': 'bia.png', 'BIA para barbearias': 'bia-barbeira.png', 'BIA para escolas': 'bia-educadora.png', 'Visagismo': 'visagismo-antes-depois.png', 'Colorimetria': 'colorimetria-antes-depois.png', 'Encerramento': 'qr-planos.png' })[title];
  }
  const clamp = n => Math.max(0, Math.min(slides.length - 1, n));
  function show(n, update = true, fromGesture = false) {
    const target = clamp(n);
    const request = ++navigationRequest;
    const image = images.get(slideArtwork(slides[target]));
    if (image && !image.ready) {
      image.done.then(() => { if (request === navigationRequest) show(target, update, false); });
      return;
    }
    const previous = index;
    index = target;
    slides.forEach((s, i) => { s.classList.toggle('active', i === index); s.setAttribute('aria-hidden', i !== index); });
    counter.textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    if (video && !slides[index].contains(video)) { video.pause(); if (document.fullscreenElement === video) document.exitFullscreen?.(); }
    if (update) history.replaceState(null, '', `#${index + 1}`);
    document.title = `${slides[index].dataset.title} | Rose Barone`;
    if (fromGesture && previous !== index && slides[index].contains(video)) openVideo();
  }
  function closeMenu() { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); }
  slides.forEach((slide, i) => {
    const li = document.createElement('li'); const b = document.createElement('button');
    b.textContent = slide.dataset.title; b.addEventListener('click', () => { show(i, true, true); closeMenu(); });
    li.appendChild(b); list.appendChild(li);
  });
  document.querySelector('#prev').addEventListener('click', () => show(index - 1, true, true));
  document.querySelector('#next').addEventListener('click', () => show(index + 1, true, true));
  menuBtn.addEventListener('click', () => { menu.hidden = !menu.hidden; menuBtn.setAttribute('aria-expanded', String(!menu.hidden)); });
  document.querySelector('#closeMenu').addEventListener('click', closeMenu);
  document.querySelectorAll('[data-go], [data-target]').forEach(b => b.addEventListener('click', () => { const target=b.dataset.target ? slides.findIndex(s => s.dataset.title === b.dataset.target) : Number(b.dataset.go); if(target >= 0) show(target, true, true); closeMenu(); }));
  document.querySelector('#fullscreen').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen?.(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.target.closest('input,textarea,select') || document.fullscreenElement === video || (e.target.closest('button') && [' ', 'Enter'].includes(e.key))) return;
    if (['ArrowRight','ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); show(index + 1, true, true); }
    if (['ArrowLeft','ArrowUp','PageUp','Backspace'].includes(e.key)) { e.preventDefault(); show(index - 1, true, true); }
    if (e.key === 'Home') { e.preventDefault(); show(0, true, true); }
    if (e.key === 'End') { e.preventDefault(); show(slides.length - 1, true, true); }
  });
  window.addEventListener('hashchange', () => show((parseInt(location.hash.slice(1), 10) || 1) - 1, false));
  let startX = 0, startY = 0;
  document.querySelector('#deck').addEventListener('touchstart', e => { startX=e.changedTouches[0].clientX; startY=e.changedTouches[0].clientY; }, {passive:true});
  document.querySelector('#deck').addEventListener('touchend', e => { if (e.target.closest('video')) return; const dx=e.changedTouches[0].clientX-startX, dy=e.changedTouches[0].clientY-startY; if (Math.abs(dx)>70 && Math.abs(dx)>Math.abs(dy)*1.4) show(index + (dx<0?1:-1), true, true); }, {passive:true});
  function openVideo() {
    const msg = document.querySelector('#videoMessage');
    msg.textContent = '';
    if (video.error) { msg.textContent = 'Vídeo indisponível. Confira o arquivo e a conexão.'; return; }
    // Both actions must start synchronously within the user's click or key event.
    if (video.requestFullscreen) {
      video.requestFullscreen().catch(() => { msg.textContent = 'Para abrir em tela cheia, use o botão abaixo.'; });
    } else {
      msg.textContent = 'Tela cheia indisponível neste navegador. Use os controles do vídeo.';
    }
    video.play().catch(() => { msg.textContent = 'Para reproduzir, use o botão do vídeo.'; });
  }
  document.querySelector('#videoFull').addEventListener('click', openVideo);
  video.addEventListener('loadeddata', () => video.parentElement.classList.add('ready'));
  video.addEventListener('error', () => { video.hidden = true; document.querySelector('#videoFull').hidden = true; }, true);
  show((parseInt(location.hash.slice(1), 10) || 1) - 1, false);
})();
