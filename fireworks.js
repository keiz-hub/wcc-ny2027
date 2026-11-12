/* Shared by the public site and /admin: config, API, firework engine, catchable icons. */
const CFG = {
  API: 'https://script.google.com/macros/s/AKfycbzPvbtCzZB_G7OZ2sQCT1gaFSbJ-rAaMza8aKRU4KxrO-I7unV7W8VrJFMLEs_eQ37n/exec',      // see README
  TARGET: new Date('2027-01-01T00:00:00+08:00'),  // midnight, Philippine time (UTC+8)
  SCHOOL_NAME: 'World Citi Colleges',
  GREETING: 'Happy New Year 2027 from all of us at World Citi Colleges! Wishing you a bright, blessed and successful year ahead.'
};
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

async function api(body) {
  if (CFG.API.startsWith('PASTE')) throw new Error('Backend not connected yet. Follow the README setup.');
  const get = body.action === 'count' || body.action === 'list';
  const res = get ? await fetch(CFG.API + '?' + new URLSearchParams(body))
                  : await fetch(CFG.API, { method:'POST', body:JSON.stringify(body) });
  const j = await res.json();
  if (j.error) throw new Error(j.error);
  return j;
}

/* ---------- Canvas fireworks ---------- */
const cv = $('sky'), cx = cv.getContext('2d');
let W, H, rockets = [], parts = [], raf = 0;
function fit() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * d; cv.height = H * d; cx.setTransform(d,0,0,d,0,0);
}
addEventListener('resize', fit); fit();

function launch(e, opt = {}) {
  rockets.push({ x:opt.x ?? W * (.15 + Math.random() * .7), y:H + 10, ty:opt.ty ?? H * (.2 + Math.random() * .3), e });
  sfx('launch');
  if (!raf) raf = requestAnimationFrame(frame);
}
function explode(r) {
  const { e } = r, n = 90, pal = [e.color, e.color, e.color, '#FFFFFF', '#FBAD18'];
  for (let i = 0; i < n; i++) {
    const t = i / n * Math.PI * 2; let vx, vy;
    if (e.shape === 'ring')       { vx = Math.cos(t) * 4.5; vy = Math.sin(t) * 4.5; }
    else if (e.shape === 'heart') { vx = 16 * Math.sin(t) ** 3 / 4;
      vy = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t)) / 4; }
    else if (e.shape === 'star')  { const s = 3 + 2.5 * Math.abs(Math.cos(2.5 * t)); vx = Math.cos(t) * s; vy = Math.sin(t) * s; }
    else { const a = Math.random() * 6.283, s = 1 + Math.random() * 5; vx = Math.cos(a) * s; vy = Math.sin(a) * s; }
    parts.push({ x:r.x, y:r.y, vx, vy, life:1, dec:.007 + Math.random() * .009, c:pal[i % pal.length] });
  }
  sfx('burst'); icon(e, r.x, r.y);
}
function frame() {
  cx.globalCompositeOperation = 'destination-out';
  cx.fillStyle = 'rgba(0,0,0,.2)'; cx.fillRect(0, 0, W, H);
  cx.globalCompositeOperation = 'lighter';
  rockets = rockets.filter(r => {
    r.y -= Math.max(6, (H - r.ty) / 50);
    parts.push({ x:r.x, y:r.y, vx:(Math.random() - .5) * .6, vy:.6, life:.6, dec:.05, c:'#FBAD18' });
    if (r.y <= r.ty) { explode(r); return false; }
    return true;
  });
  parts = parts.filter(p => {
    p.x += p.vx; p.y += p.vy; p.vx *= .985; p.vy = p.vy * .985 + .045; p.life -= p.dec;
    if (p.life <= 0) return false;
    cx.globalAlpha = p.life; cx.fillStyle = p.c;
    cx.beginPath(); cx.arc(p.x, p.y, 2, 0, 6.283); cx.fill();
    return true;
  });
  cx.globalAlpha = 1;
  raf = (rockets.length || parts.length) ? requestAnimationFrame(frame) : (cx.clearRect(0,0,W,H), 0);
}

/* ---------- Catchable icon: tap it to read the New Year Resolution ---------- */
function icon(e, x, y) {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'icon';
  b.setAttribute('aria-label', 'Catch the icon from ' + e.username);
  b.style.left = clamp(x, 40, W - 40) + 'px'; b.style.top = clamp(y, 100, H - 60) + 'px';
  b.style.setProperty('--c', e.color);
  b.style.setProperty('--dx', (Math.random() * 160 - 80) + 'px');
  b.style.setProperty('--dy', (80 + Math.random() * 120) + 'px');
  if (e.image) { const im = new Image(); im.src = e.image; im.alt = ''; b.append(im); }
  else b.textContent = e.emoji || '🎆';
  if (e.school) b.classList.add('school');
  b.onclick = () => { b.remove(); openResolution(e); };
  $('gifts').append(b); setTimeout(() => b.remove(), 14000);
}
const reso = document.createElement('div');
reso.id = 'reso'; reso.className = 'modal'; reso.hidden = true;
reso.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-labelledby="rt"><button class="x" data-close aria-label="Close">×</button><div class="ico"></div><h3 id="rt">New Year Resolution</h3><p class="rtext"></p><i class="rby"></i></div>';
document.body.append(reso);
function openResolution(e) {
  const ico = reso.querySelector('.ico'); ico.textContent = '';
  ico.classList.toggle('school', !!e.school); reso.querySelector('h3').textContent = e.school ? 'Our greeting to everyone' : 'New Year Resolution';
  if (e.image) { const im = new Image(); im.src = e.image; im.alt = ''; ico.append(im); } else ico.textContent = e.emoji || '🎆';
  reso.querySelector('.rtext').textContent = e.message || '';
  reso.querySelector('.rby').textContent = '— ' + e.username;
  reso.hidden = false; reso.querySelector('.x').focus();
}
reso.onclick = ev => { if (ev.target === reso || ev.target.closest('[data-close]')) reso.hidden = true; };
document.addEventListener('keydown', ev => {
  if (ev.key === 'Escape') document.querySelectorAll('.modal:not([hidden])').forEach(m => m.querySelector('[data-close]')?.click());
});

const SHOW = { total:12000, min:150, max:800, pause:3000 };   // ms: shorter gaps and a shorter pause
const showGap = n => clamp(SHOW.total / Math.max(n, 1), SHOW.min, SHOW.max);
let showOn = false, runId = 0, timers = [];

/* ---------- Sound: the 3 firework effects are built in; the music can be your own file ---------- */
const A = { music:true, sfx:true, musVol:.4, sfxVol:1, style:'bang', ctx:null };   // defaults: music 40%, effects 100%
try { Object.assign(A, JSON.parse(localStorage.getItem('ny27audio2') || '{}')); } catch {}
if (!['bang', 'pop', 'sparkle'].includes(A.style)) A.style = 'bang';

/* Your background music: put it at assets/audio/music.mp3 (see the README there).
   If the file is missing, a built-in melody plays instead. */
const AUDIO = { music:'music.mp3' };
const ROOT = typeof document.currentScript?.src === 'string' ? document.currentScript.src : '';
const assetUrl = p => { try { return new URL(p, ROOT || location.href).href; } catch { return p; } };
const audioUrl = f => assetUrl('assets/audio/' + f);
const schoolFirework = () => ({ username:CFG.SCHOOL_NAME, message:CFG.GREETING, image:assetUrl('assets/logo.png'), school:true, color:'#FBAD18', shape:'star' });
function ac() {
  if (A.ctx) return A.ctx;
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
  const c = A.ctx = new C();
  const comp = c.createDynamicsCompressor(); comp.connect(c.destination);        // keeps busy skies from clipping
  A.master = c.createGain(); A.master.gain.value = 1; A.master.connect(comp);
  A.sfxBus = c.createGain(); A.sfxBus.gain.value = A.sfxVol; A.sfxBus.connect(A.master);
  const rev = c.createConvolver(), n = Math.floor(c.sampleRate * 1.5), ir = c.createBuffer(2, n, c.sampleRate);   // echo of the open sky
  for (let ch = 0; ch < 2; ch++) { const d = ir.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 3; }
  rev.buffer = ir; const wet = c.createGain(); wet.gain.value = .3; A.sfxBus.connect(rev); rev.connect(wet); wet.connect(A.master);
  A.musBus = c.createGain(); A.musBus.gain.value = 0; A.musBus.connect(A.master);
  return c;
}
const audioLocked = () => !A.ctx || A.ctx.state !== 'running';
['pointerdown', 'keydown'].forEach(t => addEventListener(t, () => {          // browsers need one tap before sound
  const c = ac(); if (c && c.state === 'suspended') c.resume();
  musicEnsure();                                                       // music that was waiting for a tap
  document.querySelectorAll('.snd').forEach(n => n.remove());
}, { passive:true }));

let _noise, _last = {};
function noise() {
  if (_noise) return _noise;
  const c = A.ctx, b = c.createBuffer(1, c.sampleRate, c.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return _noise = b;
}
function sfx(kind) {
  if (!A.sfx) return; const c = ac(); if (!c) return;
  const t = c.currentTime; if (t - (_last[kind] ?? -1) < .06) return; _last[kind] = t;   // keep big shows from clipping
  const env = (v, a, d, at) => { const g = c.createGain(); g.gain.setValueAtTime(.0001, at); g.gain.linearRampToValueAtTime(v, at + a); g.gain.exponentialRampToValueAtTime(.0001, at + d); g.connect(A.sfxBus); return g; };
  const hiss = (at, d, v, f0, f1, type = 'lowpass') => {                    // filtered noise
    const s = c.createBufferSource(); s.buffer = noise(); s.playbackRate.value = .7 + Math.random() * .6;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.setValueAtTime(f0, at); f.frequency.exponentialRampToValueAtTime(f1, at + d);
    s.connect(f); f.connect(env(v, .004, d, at)); s.start(at, Math.random() * .4); s.stop(at + d + .05);
  };
  const osc = (at, f0, f1, d, v) => {
    const o = c.createOscillator(); o.frequency.setValueAtTime(f0, at); o.frequency.exponentialRampToValueAtTime(f1, at + d);
    o.connect(env(v, .004, d, at)); o.start(at); o.stop(at + d + .05);
  };
  const crackle = (at, n, span, v) => { for (let i = 0; i < n; i++) hiss(at + Math.random() * span, .015 + Math.random() * .03, v * (.3 + Math.random() * .7), 5000 + Math.random() * 3000, 2500, 'highpass'); };
  const st = A.style;
  if (kind === 'launch') {
    if (st === 'sparkle') osc(t, 500, 1500, .35, .08);
    else if (st === 'pop') osc(t, 160, 60, .12, .25);
    else { osc(t, 170, 55, .16, .5); hiss(t, .15, .3, 1200, 300); osc(t + .03, 700, 2400, .6, .04); }   // mortar thump + rising whistle
  } else if (st === 'sparkle') {
    const sc = [784, 988, 1175, 1319, 1568, 1976];
    for (let i = 0; i < 4; i++) { const f = sc[Math.random() * 6 | 0]; osc(t + i * .07, f, f, .9, .12); }
    crackle(t, 10, .8, .12);
  } else if (st === 'pop') { hiss(t, .18, .5, 3000, 300); osc(t, 110, 45, .25, .4); crackle(t + .05, 6, .4, .15); }
  else {                                                                      // realistic bang
    hiss(t, .4, .9, 7000, 250); hiss(t, .1, .5, 9000, 2500, 'highpass');     // the crack
    osc(t, 85 + Math.random() * 30, 32, .55, .75);                            // the boom in your chest
    crackle(t + .1, 14 + (Math.random() * 10 | 0), 1.1, .25);                 // sparkling crackle
  }
}

/* Background music: a soft "Auld Lang Syne" loop (traditional, public domain) */
const BEAT = 60 / 78, mf = m => 440 * 2 ** ((m - 69) / 12);
const PCH = { G:[55,59,62], D:[50,54,57], C:[48,52,55] };
const NT = { D4:62, E4:64, G4:67, A4:69, B4:71, D5:74, E5:76 };
const SONG = [
  { n:[['D4',1]] },
  { c:'G', n:[['G4',1.5],['G4',.5],['G4',1],['B4',1]] }, { c:'D', n:[['A4',1.5],['G4',.5],['A4',1],['B4',1]] },
  { c:'G', n:[['G4',1.5],['G4',.5],['B4',1],['D5',1]] }, { c:'G', n:[['D5',3],['E5',1]] },
  { c:'G', n:[['D5',1.5],['B4',.5],['B4',1],['G4',1]] }, { c:'D', n:[['A4',1.5],['G4',.5],['A4',1],['B4',1]] },
  { c:'C', n:[['G4',1.5],['E4',.5],['E4',1],['D4',1]] }, { c:'G', n:[['G4',3]] }
];
const EV = []; let _b = 0;
SONG.forEach(bar => {
  let t = _b; if (bar.c) EV.push({ b:t, chord:PCH[bar.c], d:bar.n.reduce((a, n) => a + n[1], 0) });
  bar.n.forEach(([n, d]) => { EV.push({ b:t, m:NT[n], d }); t += d; }); _b = t;
});
const LOOP = _b + 1, mus = { timer:0, i:0, base:0, el:null };      // +1 beat: the pickup note of the next loop
function tone(f, t, d, type, g) {
  const c = A.ctx, o = c.createOscillator(), v = c.createGain(); o.type = type; o.frequency.value = f;
  v.gain.setValueAtTime(.0001, t); v.gain.linearRampToValueAtTime(g, t + .03); v.gain.exponentialRampToValueAtTime(.0001, t + d);
  o.connect(v); v.connect(A.musBus); o.start(t); o.stop(t + d + .05);
}
function musicPump() {
  const c = A.ctx;
  for (;;) {
    const e = EV[mus.i], t = mus.base + e.b * BEAT; if (t > c.currentTime + 1.2) break;
    if (t >= c.currentTime - .05) {
      if (e.chord) e.chord.forEach(m => tone(mf(m), t, e.d * BEAT, 'sine', .09));
      else tone(mf(e.m), t, e.d * BEAT * .95, 'triangle', .28);
    }
    if (++mus.i >= EV.length) { mus.i = 0; mus.base += (LOOP - 1) * BEAT; }
  }
}
function musicStart() {
  if (!A.music || mus.timer || mus.el) return;
  if (AUDIO.music) {                                                          // real music file
    const el = mus.el = new Audio(audioUrl(AUDIO.music)); el.loop = true; el.volume = A.musVol;
    const fallback = () => { if (mus.el === el) { mus.el = null; synthStart(); } };
    el.onerror = fallback; el.play().catch(err => { if (err.name !== 'NotAllowedError') fallback(); });
    return;
  }
  synthStart();
}
function synthStart() {
  if (!A.music || mus.timer) return; const c = ac(); if (!c) return;
  A.musBus.gain.setTargetAtTime(A.musVol * 1.5, c.currentTime, .3);
  mus.i = 0; mus.base = c.currentTime + .2; mus.timer = setInterval(musicPump, 300); musicPump();
}
function musicEnsure() {                                                      // start (or resume) music when allowed
  if (!A.music) return;
  if (mus.el) { if (mus.el.paused) mus.el.play().catch(() => {}); } else if (!mus.timer) musicStart();
}
function musicStop() {
  if (mus.el) { mus.el.pause(); mus.el = null; }
  clearInterval(mus.timer); mus.timer = 0;
  if (A.ctx) A.musBus.gain.setTargetAtTime(0, A.ctx.currentTime, .08);
}

/* ---------- Sound settings (button in the header + panel) ---------- */
const sbtn = document.createElement('button');
sbtn.type = 'button'; sbtn.className = 'navbtn'; sbtn.id = 'sndBtn'; sbtn.setAttribute('aria-label', 'Sound settings');
sbtn.innerHTML = '<span class="ic">🔊</span><span class="lb"> Sound</span>';
document.querySelector('.top nav')?.append(sbtn);
const sm = document.createElement('div'); sm.className = 'modal'; sm.hidden = true;
sm.innerHTML = '<div class="box" role="dialog" aria-modal="true" aria-labelledby="st"><button class="x" data-close type="button" aria-label="Close">×</button><h2 id="st">Sound settings</h2>' +
  '<label class="sw2"><input type="checkbox" id="sMusic"> Background music</label>' +
  '<label><span>Music volume: <b id="vM">20%</b></span><input type="range" id="sMVol" min="0" max="100"></label>' +
  '<label class="sw2"><input type="checkbox" id="sSfx"> Firework sounds</label>' +
  '<label><span>Sound effects volume: <b id="vS">100%</b></span><input type="range" id="sSVol" min="0" max="100"></label>' +
  '<label>Firework sound style <select id="sStyle"><option value="bang">Bang</option><option value="pop">Soft pop</option><option value="sparkle">Sparkle chimes</option></select></label>' +
  '<small>Music plays while you browse the site. Your browser needs one tap on the page before it allows any sound.</small>' +
  '<p><button class="btn" data-close type="button">Done</button></p></div>';
document.body.append(sm);
function applyAudio() {
  try { localStorage.setItem('ny27audio2', JSON.stringify({ music:A.music, sfx:A.sfx, musVol:A.musVol, sfxVol:A.sfxVol, style:A.style })); } catch {}
  if (A.ctx) { A.sfxBus.gain.setTargetAtTime(A.sfxVol, A.ctx.currentTime, .05); if (mus.timer) A.musBus.gain.setTargetAtTime(A.musVol * 1.5, A.ctx.currentTime, .05); }
  if (mus.el) mus.el.volume = A.musVol;
  A.music ? musicEnsure() : musicStop();
  sbtn.querySelector('.ic').textContent = (A.music && A.musVol > 0) || (A.sfx && A.sfxVol > 0) ? '🔊' : '🔇';
}
sbtn.onclick = () => {
  $('sMusic').checked = A.music; $('sSfx').checked = A.sfx; $('sMVol').value = A.musVol * 100; $('sSVol').value = A.sfxVol * 100; $('sStyle').value = A.style;
  $('vM').textContent = Math.round(A.musVol * 100) + '%'; $('vS').textContent = Math.round(A.sfxVol * 100) + '%';
  sm.hidden = false; $('sMusic').focus();
};
sm.onclick = ev => { if (ev.target === sm || ev.target.closest('[data-close]')) sm.hidden = true; };
$('sMusic').onchange = ev => { A.music = ev.target.checked; applyAudio(); };
$('sSfx').onchange = ev => { A.sfx = ev.target.checked; applyAudio(); if (A.sfx) sfx('burst'); };   // short test sound
$('sStyle').onchange = ev => { A.style = ev.target.value; applyAudio(); sfx('launch'); setTimeout(() => sfx('burst'), 700); };
$('sMVol').oninput = ev => { A.musVol = ev.target.value / 100; $('vM').textContent = ev.target.value + '%'; applyAudio(); };
$('sSVol').oninput = ev => { A.sfxVol = ev.target.value / 100; $('vS').textContent = ev.target.value + '%'; applyAudio(); };
$('sSVol').onchange = () => { if (A.sfx) sfx('burst'); };               // test sound when you let go of the slider
applyAudio();

/* ---------- The show: all entries launch in order, then repeat ---------- */
async function runShow(getList) {
  if (showOn) return; showOn = true; const id = ++runId;
  musicEnsure();
  const t = $('finale');
  if (t && audioLocked() && (A.music || A.sfx) && !t.querySelector('.snd')) { const s = document.createElement('small'); s.className = 'snd'; s.textContent = 'Tap anywhere to turn on the sound.'; t.append(s); }
  while (showOn && id === runId) {
    let list = [];
    try { list = await getList(); } catch (err) { console.warn(err.message); }
    const gap = showGap(list.length), lead = 1600;        // more entries = faster launches
    launch(schoolFirework(), { x:W / 2, ty:H * .3 });     // the school's greeting to everyone opens every round
    list.forEach((e, i) => timers.push(setTimeout(() => launch(e), lead + i * gap)));
    await sleep(lead + list.length * gap + SHOW.pause);   // short pause, then the whole sky repeats
  }
}
function stopShow() {
  showOn = false; timers.forEach(clearTimeout); timers = [];
  rockets = []; parts = []; $('gifts').replaceChildren();
}
