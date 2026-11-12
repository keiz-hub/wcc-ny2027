const EMOJIS = ['🎄','🎁','🎅','⭐','❤️','🕊️','🎉','🙏','✨','🥳'];
const COLORS = ['#FBAD18','#FFFFFF','#FF5C7A','#4FD1FF','#9BFF7A'];
const SHAPES = { burst:'Burst', ring:'Ring', heart:'Heart', star:'Star' };
const S = { emoji:'🎄', color:COLORS[0], shape:'burst', image:'' };

/* ---------- Countdown + New Year show ---------- */
function show() {
  if (showOn) return;
  document.body.classList.add('show'); $('finale').hidden = false;
  runShow(async () => (await api({ action:'list' })).entries);
}
function tick() {
  const ms = CFG.TARGET - Date.now();
  if (ms <= 0) { ['d','h','m','s'].forEach(k => $(k).textContent = '00'); show(); return; }
  const v = { d:Math.floor(ms / 864e5), h:Math.floor(ms / 36e5) % 24, m:Math.floor(ms / 6e4) % 60, s:Math.floor(ms / 1e3) % 60 };
  for (const k in v) $(k).textContent = String(v[k]).padStart(2, '0');
}
setInterval(tick, 250); tick();
api({ action:'count' }).then(r => $('total').textContent = r.count).catch(() => {});

/* ---------- Builder UI ---------- */
function pressGroup(box, items, key, render) {
  items.forEach(([val, label]) => {
    const b = document.createElement('button'); b.type = 'button'; render(b, val, label);
    b.onclick = () => { S[key] = val; sync(); preview(); }; b.dataset.v = val; box.append(b);
  });
}
pressGroup($('emojis'), EMOJIS.map(e => [e, e]), 'emoji', (b, v) => { b.textContent = v; b.setAttribute('aria-label', 'Emoji ' + v); });
pressGroup($('colors'), COLORS.map(c => [c, c]), 'color', (b, v) => { b.className = 'sw'; b.style.background = v; b.setAttribute('aria-label', 'Color ' + v); });
pressGroup($('shapes'), Object.entries(SHAPES), 'shape', (b, v, l) => { b.className = 'shape'; b.textContent = l; });
function sync() {
  document.querySelectorAll('[data-v]').forEach(b => b.setAttribute('aria-pressed', S[b.parentElement.id.slice(0, -1)] === b.dataset.v));
  $('card').querySelector('.bubble').style.setProperty('--pc', S.color);
}
function entry() {
  return { username:$('user').value.trim().toLowerCase(), pin:$('pin').value, message:$('msg').value.trim(), emoji:S.emoji, image:S.image, color:S.color, shape:S.shape };
}
function preview() {
  const e = entry();
  $('pEmoji').hidden = !!e.image; $('pEmoji').textContent = e.emoji;
  $('pImg').hidden = !e.image; if (e.image) $('pImg').src = e.image;
  $('pMsg').textContent = e.message || 'Your resolution will appear here.';
  $('pUser').textContent = '— ' + (e.username || 'username');
}
['user','msg'].forEach(id => $(id).addEventListener('input', () => { $('left').textContent = 140 - $('msg').value.length; preview(); }));
$('preview').onclick = () => { launch(entry(), { x:W / 2, ty:H * .28 }); };
$('card').onclick = () => $('preview').click();

$('img').onchange = ev => {                         // shrink to 120x120 JPEG so it fits in a sheet cell
  const f = ev.target.files[0]; if (!f) return;
  const im = new Image(); im.onload = () => {
    const c = document.createElement('canvas'); c.width = c.height = 120;
    const s = Math.min(im.width, im.height);
    c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 120, 120);
    S.image = c.toDataURL('image/jpeg', .7); $('thumb').src = S.image; $('imgrow').hidden = false; preview();
  }; im.src = URL.createObjectURL(f);
};
$('rmimg').onclick = () => { S.image = ''; $('img').value = ''; $('imgrow').hidden = true; preview(); };

function say(t, cls = '') { const s = $('status'); s.textContent = t; s.className = cls; }
$('save').onclick = async () => {
  const e = entry();
  if (!/^[a-z0-9_]{3,20}$/.test(e.username)) return say('Username must be 3–20 letters, numbers or underscores.', 'err');
  if (!/^\d{4,8}$/.test(e.pin)) return say('PIN must be 4–8 digits.', 'err');
  if (!e.message) return say('Write your New Year Resolution first.', 'err');
  $('save').disabled = true; say('Saving…');
  try {
    const r = await api({ action:'save', ...e });
    say(r.created ? 'Saved! Your firework is waiting for midnight.' : 'Updated! Your changes are saved.', 'ok');
    launch(e, { x:W / 2, ty:H * .28 });
    api({ action:'count' }).then(c => $('total').textContent = c.count).catch(() => {});
  } catch (err) { say(err.message, 'err'); }
  $('save').disabled = false;
};
$('load').onclick = async () => {
  const username = $('fuser').value.trim().toLowerCase(), pin = $('fpin').value;
  try {
    const { entry: e } = await api({ action:'get', username, pin });
    Object.assign(S, { emoji:e.emoji || S.emoji, color:e.color, shape:e.shape, image:e.image || '' });
    $('user').value = e.username; $('pin').value = pin; $('msg').value = e.message;
    $('left').textContent = 140 - e.message.length; $('imgrow').hidden = !e.image; $('thumb').src = e.image || '';
    sync(); preview(); $('create').scrollIntoView(); say('Entry loaded. Edit it and save again.', 'ok');
  } catch (err) { alert(err.message); }
};
sync(); preview();

/* ---------- Welcome guide (closable) ---------- */
const wm = $('welcome');
function openWelcome() { wm.hidden = false; $('wgo').focus(); }
function closeWelcome() { wm.hidden = true; try { localStorage.setItem('ny27welcome', '1'); } catch {} }
wm.onclick = ev => { if (ev.target === wm || ev.target.closest('[data-close]')) closeWelcome(); };
$('wgo').addEventListener('click', () => $('create').scrollIntoView());
$('how').onclick = openWelcome;
$('finale').querySelector('.x').onclick = () => $('finale').hidden = true;
let seen = false; try { seen = !!localStorage.getItem('ny27welcome'); } catch {}
if (!seen && Date.now() < CFG.TARGET) openWelcome();
