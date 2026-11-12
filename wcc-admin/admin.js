let entries = [], key = '', demo = false, editing = null;
const COLORS = ['#FBAD18','#FFFFFF','#FF5C7A','#4FD1FF','#9BFF7A'], SHAPES = ['burst','ring','heart','star'];
const NAMES = ['maria','juan','ana','leo','sofia','carlo','bea','miguel','joy','paolo','lia','ken'];
const RES = ['I will read one book every month.','I will help my family more at home.','I will never give up on my dreams.','I will be kinder to my classmates.','I will study a little every day.','I will save money for my future.','I will try new things without fear.','I will say thank you more often.','I will take care of my health.','I will finish what I start.','I will make new friends.','I will pray and stay grateful.'];
const ICONS = ['🎄','🎁','🎅','⭐','❤️','🕊️','🎉','🙏','✨','🥳','📚','🌈'];
const DEMO = NAMES.map((u, i) => ({ username:u, message:RES[i], emoji:ICONS[i], image:'', color:COLORS[i % 5], shape:SHAPES[i % 4], hidden:false }));
const say = (t, c = '') => { $('status').textContent = t; $('status').className = c; };
const esay = (t, c = '') => { $('eStatus').textContent = t; $('eStatus').className = c; };

/* ---------- Read: the table ---------- */
function render() {
  const body = $('rows'); body.replaceChildren();
  entries.forEach(e => {
    const tr = document.createElement('tr'); tr.className = e.hidden ? 'hid' : '';
    const cell = () => tr.appendChild(document.createElement('td'));
    const ic = cell(); if (e.image) { const im = new Image(); im.src = e.image; im.alt = ''; ic.append(im); } else ic.textContent = e.emoji;
    cell().textContent = e.username; cell().textContent = e.message;
    const st = cell(), d = document.createElement('span'); d.className = 'dot'; d.style.background = e.color; st.append(d, e.shape);
    const act = cell(), btn = (label, fn, cls = 'ghost') => { const b = document.createElement('button'); b.type = 'button'; b.className = cls + ' sm'; b.textContent = label; b.onclick = fn; act.append(b); };
    btn('Edit', () => openEditor(e));
    btn(e.hidden ? 'Show' : 'Hide', () => toggleHidden(e));
    btn('Delete', () => removeEntry(e), 'ghost danger');
    body.append(tr);
  });
  const n = entries.filter(e => !e.hidden).length, gap = showGap(n);
  $('cnt').textContent = entries.length;
  $('info').textContent = n + ' public. One launches every ' + (gap / 1000).toFixed(2) + ' s, then the sky pauses ' + (SHOW.pause / 1000) + ' s and repeats. Hidden entries never launch. Every round opens with the school greeting (logo icon).';
}
function setEntries(list) { entries = list; $('list').hidden = false; $('play').disabled = false; render(); }

$('go').onclick = async () => {
  key = $('key').value; demo = false; say('Loading…');
  try { setEntries((await api({ action:'adminList', key })).entries); say('Loaded ' + entries.length + ' entries.', 'ok'); }
  catch (err) { say(err.message, 'err'); }
};
$('demo').onclick = () => { demo = true; setEntries(DEMO.map(e => ({ ...e }))); say('Showing demo entries. Nothing is saved.', 'ok'); };

/* ---------- Hide / Delete ---------- */
async function toggleHidden(e) {
  try { if (!demo) await api({ action:'hide', key, username:e.username, hidden:!e.hidden }); e.hidden = !e.hidden; render(); }
  catch (err) { say(err.message, 'err'); }
}
async function removeEntry(e) {
  if (!confirm('Delete "' + e.username + '" permanently? This cannot be undone.')) return;
  try { if (!demo) await api({ action:'adminDelete', key, username:e.username }); entries = entries.filter(x => x !== e); render(); say('Deleted ' + e.username + '.', 'ok'); }
  catch (err) { say(err.message, 'err'); }
}

/* ---------- Create / Update: the editor ---------- */
const E = { emoji:ICONS[0], color:COLORS[0], shape:'burst', image:'' };
function pick(box, items, key, render) {
  items.forEach(v => { const b = document.createElement('button'); b.type = 'button'; render(b, v); b.dataset.v = v; b.onclick = () => { E[key] = v; mark(); }; box.append(b); });
}
function mark() {
  [['eEmojis', 'emoji'], ['eColors', 'color'], ['eShapes', 'shape']].forEach(([id, k]) =>
    $(id).querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === E[k])));
}
pick($('eEmojis'), ICONS, 'emoji', (b, v) => { b.textContent = v; b.setAttribute('aria-label', 'Emoji ' + v); });
pick($('eColors'), COLORS, 'color', (b, v) => { b.className = 'sw'; b.style.background = v; b.setAttribute('aria-label', 'Color ' + v); });
pick($('eShapes'), SHAPES, 'shape', (b, v) => { b.className = 'shape'; b.textContent = v[0].toUpperCase() + v.slice(1); });

function openEditor(e) {                       // e = entry to edit, or nothing to add a new one
  editing = e || null;
  $('et').textContent = e ? 'Edit entry' : 'Add entry';
  $('eUser').value = e ? e.username : ''; $('eUser').readOnly = !!e; $('ePin').value = '';
  $('ePinNote').textContent = e ? 'Leave empty to keep the current PIN. Type a new one to reset it.' : 'Optional. Without a PIN, the student cannot edit this entry later.';
  $('eMsg').value = e ? e.message : '';
  Object.assign(E, e ? { emoji:e.emoji || ICONS[0], color:e.color, shape:e.shape, image:e.image || '' } : { emoji:ICONS[0], color:COLORS[0], shape:'burst', image:'' });
  $('eThumb').src = E.image; $('eImgRow').hidden = !E.image; $('eImg').value = '';
  $('eHidden').checked = !!(e && e.hidden); esay(''); mark();
  $('editor').hidden = false; (e ? $('eMsg') : $('eUser')).focus();
}
async function saveEntry() {
  const d = { username:$('eUser').value.trim().toLowerCase(), message:$('eMsg').value.trim(), emoji:E.emoji, image:E.image, color:E.color, shape:E.shape, hidden:$('eHidden').checked }, pin = $('ePin').value;
  if (!/^[a-z0-9_]{3,20}$/.test(d.username)) return esay('Username must be 3–20 letters, numbers or underscores.', 'err');
  if (!d.message) return esay('Write the New Year Resolution first.', 'err');
  if (pin && !/^\d{4,8}$/.test(pin)) return esay('PIN must be 4–8 digits, or leave it empty.', 'err');
  if (!editing && entries.some(x => x.username === d.username)) return esay('That username already exists. Edit it from the list instead.', 'err');
  $('eSave').disabled = true; esay('Saving…');
  try {
    if (!demo) await api({ action:'adminSave', key, pin, ...d });
    const i = entries.findIndex(x => x.username === d.username);
    i < 0 ? entries.push(d) : entries[i] = d;
    render(); $('editor').hidden = true; say((i < 0 ? 'Added ' : 'Updated ') + d.username + '.', 'ok');
  } catch (err) { esay(err.message, 'err'); }
  $('eSave').disabled = false;
}
$('add').onclick = () => openEditor();
$('eSave').onclick = saveEntry;
$('editor').onclick = ev => { if (ev.target === $('editor') || ev.target.closest('[data-close]')) $('editor').hidden = true; };
$('eImg').onchange = ev => {                   // shrink to 120x120 JPEG so it fits in a sheet cell
  const f = ev.target.files[0]; if (!f) return;
  const im = new Image(); im.onload = () => {
    const c = document.createElement('canvas'); c.width = c.height = 120; const s = Math.min(im.width, im.height);
    c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 120, 120);
    E.image = c.toDataURL('image/jpeg', .7); $('eThumb').src = E.image; $('eImgRow').hidden = false;
  }; im.src = URL.createObjectURL(f);
};
$('eRm').onclick = () => { E.image = ''; $('eImg').value = ''; $('eImgRow').hidden = true; };

/* ---------- Play the January 1 show ---------- */
const setPlay = on => { $('play').innerHTML = on ? '<span class="full">Stop show</span><span class="short">■ Stop</span>' : '<span class="full">Play January 1 show</span><span class="short">▶ Play</span>'; };
$('play').onclick = () => {
  if (showOn) { stopShow(); document.body.classList.remove('show'); $('finale').hidden = true; setPlay(false); return; }
  document.body.classList.add('show'); $('finale').hidden = false; setPlay(true);
  runShow(async () => entries.filter(e => !e.hidden));
};
$('finale').querySelector('.x').onclick = () => $('finale').hidden = true;
try { const k = sessionStorage.getItem('ny27key'); if (k) $('key').value = k; } catch {}
$('key').addEventListener('change', () => { try { sessionStorage.setItem('ny27key', $('key').value); } catch {} });
