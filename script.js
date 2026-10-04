(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG = 'assets/images/';

  /* ---------- Navigation ---------- */
  const views = $$('.view');
   function go(id) {
  views.forEach(v => v.classList.toggle('on', v.id === id));

  // Keep the dreamy night-sky atmosphere everywhere
  document.body.classList.add('dark');
  document.body.classList.remove('warm');

  window.scrollTo(0, 0);

  // Stars stay alive on every screen
  setStars(true);
}
  document.addEventListener('click', e => {
    const t = e.target.closest('[data-go]');
    if (t) go(t.dataset.go);
  });

  /* ---------- Photos (graceful placeholders) ---------- */
  $$('.polaroid').forEach(fig => {
    const box = $('.ph', fig), file = fig.dataset.src;
    box.innerHTML = `<span>📷<br>${IMG}${file}</span>`;
    const img = new Image();
    img.alt = '';
    img.onload = () => { box.innerHTML = ''; box.appendChild(img); };
    img.src = IMG + file;
  });

  /* ---------- Lightbox ---------- */
  const lb = $('#lightbox');
  $$('.gallery .polaroid').forEach(f => {
    f.tabIndex = 0;
    const open = () => {
      $('#lbPhoto').innerHTML = '';
      $('#lbPhoto').appendChild($('.ph', f).cloneNode(true));
      const cap = $('#lbCap');
      cap.textContent = f.dataset.cap;
      cap.style.animation = 'none'; cap.offsetWidth; cap.style.animation = '';
      lb.hidden = false;
    };
    f.addEventListener('click', open);
    f.addEventListener('keydown', e => { if (e.key === 'Enter') open(); });
  });
  const closeLb = () => (lb.hidden = true);
  $('#lbClose').onclick = closeLb;
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });

  /* ---------- Trust files reveal ---------- */
  $('#secretBtn').onclick = e => {
    $('#secret').hidden = false;
    e.target.style.display = 'none';
  };

  /* ---------- Stars (intro + "Here's to more") ---------- */
  const sc = $('#stars'), sx = sc.getContext('2d');
  let stars = [], raf = 0, running = false;
  function sizeCanvas(c) {
    const d = Math.min(devicePixelRatio || 1, 2);
    c.width = innerWidth * d; c.height = innerHeight * d;
    c.getContext('2d').setTransform(d, 0, 0, d, 0, 0);
  }
  function initStars() {
    sizeCanvas(sc);
    const n = innerWidth < 600 ? 70 : 130;
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      r: Math.random() * 1.3 + .3, p: Math.random() * 6.28, s: Math.random() * .015 + .005,
      v: Math.random() * .08 + .02, glow: Math.random() < .15
    }));
  }
  function drawStars(t) {
    sx.clearRect(0, 0, innerWidth, innerHeight);
    for (const s of stars) {
      const a = .35 + .5 * Math.sin(s.p + t * s.s * .06);
      sx.globalAlpha = a;
      sx.fillStyle = s.glow ? '#f3c9cc' : '#fff';
      sx.beginPath(); sx.arc(s.x, s.y, s.r, 0, 6.28); sx.fill();
      if (!reduce) { s.y -= s.v; if (s.y < -5) { s.y = innerHeight + 5; s.x = Math.random() * innerWidth; } }
    }
  }
  function loop(t) { if (!running) return; drawStars(t); raf = requestAnimationFrame(loop); }
  function setStars(on) {
    if (on && !reduce && !running) { running = true; raf = requestAnimationFrame(loop); }
    else if (!on) { running = false; cancelAnimationFrame(raf); }
    else if (on) drawStars(0);
  }
  initStars(); setStars(true);
  addEventListener('resize', () => { initStars(); sizeCanvas(fx); });

  /* ---------- Final celebration ---------- */
  const fx = $('#fx'), fc = fx.getContext('2d');
  sizeCanvas(fx);
  let bits = [], fxRaf = 0;
  const colors = ['#d9a5a8', '#f3d9c4', '#fff4e0', '#b9777c', '#e8c27a'];
  function spawn(n) {
    for (let i = 0; i < n; i++) {
      const heart = Math.random() < .25;
      bits.push({
        x: Math.random() * innerWidth, y: -20 - Math.random() * innerHeight * .4,
        vx: (Math.random() - .5) * 1.6, vy: Math.random() * 2 + 1.2, rot: Math.random() * 6, vr: (Math.random() - .5) * .15,
        w: Math.random() * 7 + 5, c: colors[(Math.random() * colors.length) | 0], heart
      });
    }
  }
  function fxLoop() {
    fc.clearRect(0, 0, innerWidth, innerHeight);
    bits.forEach(b => {
      b.x += b.vx + Math.sin(b.y / 40) * .5; b.y += b.vy; b.rot += b.vr;
      fc.save(); fc.translate(b.x, b.y); fc.rotate(b.rot); fc.fillStyle = b.c;
      if (b.heart) { fc.font = b.w * 2.2 + 'px serif'; fc.fillText('♥', 0, 0); }
      else fc.fillRect(-b.w / 2, -b.w / 4, b.w, b.w / 2);
      fc.restore();
    });
    bits = bits.filter(b => b.y < innerHeight + 30);
    if (bits.length) fxRaf = requestAnimationFrame(fxLoop);
    else fc.clearRect(0, 0, innerWidth, innerHeight);
  }
  $('#boom').onclick = () => {
    const f = $('#finale');
    f.hidden = false;
    setTimeout(() => f.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' }), 100);
    if (reduce) return;
    spawn(innerWidth < 600 ? 70 : 140);
    setTimeout(() => spawn(50), 1500);
    cancelAnimationFrame(fxRaf); fxRaf = requestAnimationFrame(fxLoop);
  };
})();
