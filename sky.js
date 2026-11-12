/* Night-sky background for every page: twinkling stars, a city skyline and
   low-opacity FILLER fireworks. These are decoration only; they never come from entries. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches, rnd = (a, b) => a + Math.random() * (b - a);
  const layer = (id, css) => { const d = document.createElement('div'); d.id = id; d.setAttribute('aria-hidden', 'true'); Object.assign(d.style, css); return d; };
  const uri = svg => 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")';

  /* stars: two tiled layers that twinkle at different speeds */
  const starLayer = (id, n, size) => {
    let s = '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700">';
    for (let i = 0; i < n; i++) s += `<circle cx="${rnd(0, 900) | 0}" cy="${rnd(0, 700) | 0}" r="${rnd(.5, size).toFixed(1)}" fill="${Math.random() < .2 ? '#FBAD18' : '#fff'}" opacity="${rnd(.4, 1).toFixed(2)}"/>`;
    return layer(id, { backgroundImage: uri(s + '</svg>') });
  };

  /* skyline: dark buildings with a few lit windows */
  let sk = '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="160" viewBox="0 0 1200 160">', x = 0;
  while (x < 1200) {
    const w = rnd(36, 90) | 0, h = rnd(40, 150) | 0;
    sk += `<rect x="${x}" y="${160 - h}" width="${w - 3}" height="${h}" fill="#071a45"/>`;
    for (let wy = 160 - h + 8; wy < 150; wy += 14) for (let wx = x + 6; wx < x + w - 12; wx += 12)
      if (Math.random() < .13) sk += `<rect x="${wx}" y="${wy}" width="4" height="6" fill="#FBAD18" opacity=".75"/>`;
    x += w;
  }
  const skyline = layer('skyline', { backgroundImage: uri(sk + '</svg>') });

  const cv = document.createElement('canvas'); cv.id = 'bg'; cv.setAttribute('aria-hidden', 'true');
  document.body.prepend(starLayer('stars', 130, 1.6), starLayer('stars2', 70, 2.2), skyline, cv);
  if (reduce) return;                                           // stars and skyline only

  /* filler fireworks */
  const cx = cv.getContext('2d'), PAL = ['#FBAD18', '#FFFFFF', '#7CC4FF', '#FF8FB1', '#B6FF9B', '#FFD36B'], SH = ['burst', 'ring', 'heart', 'star'];
  let W, H, rockets = [], parts = [], raf = 0;
  const fit = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; };
  addEventListener('resize', fit); fit();
  const small = () => W < 640;

  function spawn() {
    rockets.push({ x:rnd(W * .1, W * .9), y:H, ty:rnd(H * .12, H * .5), c:PAL[Math.random() * PAL.length | 0], shape:SH[Math.random() * 4 | 0] });
    if (!raf) raf = requestAnimationFrame(frame);
  }
  function explode(r) {
    const n = small() ? 50 : 80;
    for (let i = 0; i < n; i++) {
      const t = i / n * 6.283; let vx, vy;
      if (r.shape === 'ring') { vx = Math.cos(t) * 4; vy = Math.sin(t) * 4; }
      else if (r.shape === 'heart') { vx = 16 * Math.sin(t) ** 3 / 4.2; vy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 4.2; }
      else if (r.shape === 'star') { const s = 2.6 + 2.2 * Math.abs(Math.cos(2.5 * t)); vx = Math.cos(t) * s; vy = Math.sin(t) * s; }
      else { const s = rnd(1, 4.6); vx = Math.cos(t * 7) * s; vy = Math.sin(t * 7) * s; }
      parts.push({ x:r.x, y:r.y, vx, vy, life:1, dec:rnd(.007, .015), c:i % 4 ? r.c : '#FFFFFF' });
    }
  }
  function frame() {
    cx.globalCompositeOperation = 'destination-out'; cx.fillStyle = 'rgba(0,0,0,.18)'; cx.fillRect(0, 0, W, H);
    cx.globalCompositeOperation = 'lighter';
    rockets = rockets.filter(r => {
      r.y -= Math.max(5, (H - r.ty) / 60);
      if (r.y <= r.ty) { explode(r); return false; } return true;
    });
    parts = parts.filter(p => {
      p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy = p.vy * .985 + .04; p.life -= p.dec;
      if (p.life <= 0) return false;
      cx.globalAlpha = p.life; cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, 1.8, 0, 6.283); cx.fill(); return true;
    });
    cx.globalAlpha = 1;
    raf = (rockets.length || parts.length) ? requestAnimationFrame(frame) : (cx.clearRect(0, 0, W, H), 0);
  }
  /* every ~2 s, one to three fillers go up together */
  setInterval(() => {
    if (document.hidden || parts.length > 900) return;
    const n = 1 + (Math.random() * (small() ? 2 : 3) | 0);
    for (let i = 0; i < n; i++) setTimeout(spawn, rnd(0, 700));
  }, 2000);
  setTimeout(spawn, 300);
})();
