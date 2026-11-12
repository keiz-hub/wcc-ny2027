let entries = [], key = '', demo = false;
const COLORS = ['#FBAD18','#FFFFFF','#FF5C7A','#4FD1FF','#9BFF7A'], SHAPES = ['burst','ring','heart','star'];
const NAMES = ['maria','juan','ana','leo','sofia','carlo','bea','miguel','joy','paolo','lia','ken'];
const RES = ['I will read one book every month.','I will help my family more at home.','I will never give up on my dreams.','I will be kinder to my classmates.','I will study a little every day.','I will save money for my future.','I will try new things without fear.','I will say thank you more often.','I will take care of my health.','I will finish what I start.','I will make new friends.','I will pray and stay grateful.'];
const ICONS = ['🎄','🎁','🎅','⭐','❤️','🕊️','🎉','🙏','✨','🥳','📚','🌈'];
const DEMO = NAMES.map((u, i) => ({ username:u, message:RES[i], emoji:ICONS[i], image:'', color:COLORS[i % 5], shape:SHAPES[i % 4], hidden:false }));
const say = (t, c = '') => { $('status').textContent = t; $('status').className = c; };

function render() {
  const body = $('rows'); body.replaceChildren();
  entries.forEach(e => {
    const tr = document.createElement('tr'); tr.className = e.hidden ? 'hid' : '';
    const cell = () => tr.appendChild(document.createElement('td'));
    const ic = cell(); if (e.image) { const im = new Image(); im.src = e.image; im.alt = ''; ic.append(im); } else ic.textContent = e.emoji;
    cell().textContent = e.username; cell().textContent = e.message;
    const st = cell(), d = document.createElement('span'); d.className = 'dot'; d.style.background = e.color; st.append(d, e.shape);
    const b = document.createElement('button'); b.className = 'ghost'; b.type = 'button'; b.textContent = e.hidden ? 'Hidden · Show' : 'Visible · Hide';
    b.onclick = async () => {
      try { if (!demo) await api({ action:'hide', key, username:e.username, hidden:!e.hidden }); e.hidden = !e.hidden; render(); }
      catch (err) { say(err.message, 'err'); }
    };
    cell().append(b); body.append(tr);
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

$('play').onclick = () => {
  if (showOn) { stopShow(); document.body.classList.remove('show'); $('finale').hidden = true; $('play').textContent = 'Play January 1 show'; return; }
  document.body.classList.add('show'); $('finale').hidden = false; $('play').textContent = 'Stop show';
  runShow(async () => entries.filter(e => !e.hidden));
};
$('finale').querySelector('.x').onclick = () => $('finale').hidden = true;
try { const k = sessionStorage.getItem('ny27key'); if (k) $('key').value = k; } catch {}
$('key').addEventListener('change', () => { try { sessionStorage.setItem('ny27key', $('key').value); } catch {} });
