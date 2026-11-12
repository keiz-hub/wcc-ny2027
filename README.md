# Countdown to 2027: School Fireworks

A static site (HTML, CSS, JavaScript) on **GitHub Pages**, with **Google Sheets** as the database through a Google Apps Script.

Students create a firework under a unique username: a **New Year Resolution**, an **icon** (emoji or picture), a color and a shape. At **12:00 AM, January 1, 2027** every entry launches in the order it was first made. Each firework releases its icon, and anyone who taps an icon sees that student's resolution pop up.

## Files
| File | Purpose |
|---|---|
| `index.html`, `style.css`, `app.js` | Public site: fixed header, countdown, welcome guide, builder |
| `fireworks.js` | Shared engine: fireworks, built-in sound effects, music, catchable icons, the show loop, API config |
| `admin/index.html`, `admin/admin.js` | Admin page at `/admin`: preview the January 1 show now, hide entries |
| `apps-script/Code.gs` | Backend that reads and writes the Google Sheet |
| `sky.js` | Night-sky background: stars, skyline and low-opacity filler fireworks (not from entries) |
| `assets/logo.png` | The World Citi Colleges logo (header, welcome guide and the school greeting icon) |
| `assets/audio/` | Your background music (`music.mp3`) |

## Setup
1. Create a new Google Sheet (keep it private). The script makes the `Entries` tab itself.
2. *Extensions → Apps Script*: paste `apps-script/Code.gs`. **Change `ADMIN_KEY`** to a long secret phrase.
3. *Deploy → New deployment → Web app*. Execute as **Me**, access **Anyone**. Copy the Web app URL.
4. Paste the URL into `CFG.API` at the top of `fireworks.js` (the admin page uses the same one).
5. Push to GitHub, then *Settings → Pages → Deploy from branch (main, root)*.
6. The school name and logo are already set. Edit `SCHOOL_NAME` and `GREETING` at the top of `fireworks.js` to change the school greeting.

## Admin page
Open `https://<your-user>.github.io/<repo>/admin/`. Enter your `ADMIN_KEY` and press **Load entries**, then **Play January 1 show** to watch the real sky now. **Use demo entries** works without a backend. Each entry has a **Hide** button; hidden entries never launch publicly (stored in the `hidden` column).
The page address is unlisted, but the real protection is the admin key, which the script checks. Never put the key in the repo.

## Background and school greeting
- `sky.js` draws a night sky with twinkling stars, a small city skyline and **filler fireworks** at low opacity. They are decoration only: no icons, no sound, never from entries, and they stay still for visitors who prefer reduced motion.
- Every round of the New Year show opens with the **school greeting**: a firework whose catchable icon is the school logo. Tapping it opens the greeting from `CFG.GREETING`.

## How the show works
- The public list is locked by the script until `OPEN`, and entries close at the same moment.
- Gap between launches = `12 s ÷ number of entries`, kept between 0.15 s and 1 s. Then a 3 s pause and the sky repeats. Tune `SHOW` near the bottom of `fireworks.js` (`total`, `min`, `max`, `pause`).
- **Sound:** background music plays on every page (public site and admin), not only during the show. Put your track at `assets/audio/music.mp3`; without it a built-in melody plays. The three firework effects (Bang, Soft pop, Sparkle chimes) are built in. The 🔊 button opens settings with on/off switches and **separate volume sliders for music (default 40%) and sound effects (default 100%)**, plus the effect style. Choices are remembered per device. Browsers block sound until the visitor taps once, so music starts on the first tap.
- Icons drift down slowly for about 14 seconds. Tap or click one to open its New Year Resolution.

## Testing
Set `TARGET` in `fireworks.js` and `OPEN` in `Code.gs` to the past, then redeploy the script (*Manage deployments → Edit → New version*). Set both back to `2027-01-01T00:00:00+08:00` afterward. The admin page needs neither change.

## Good to know
- Time zone is Philippine time (UTC+8). Change the `+08:00` offset if needed.
- A 4–8 digit PIN is light protection for a school project.
- Apps Script has daily quotas, so test with many entries first.
- If you used the earlier version, add a `hidden` header in column J of your sheet.
