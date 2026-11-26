import './style.css';
import { Orrery, ALL_IDS, type Mode } from './scene';
import { Panel } from './panel';
import { geo, speed, aspects, moonInfo, voidOfCourse, planetaryHour, type BodyId, type VoidInfo } from './ephemeris';
import { BODIES, SIGNS, signOf, formatDegree } from './correspondences';
import { ChartView, spread } from './chart';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const DAY = 86400000;

const orrery = new Orrery($('#scene'));
const panel = new Panel($('#panel'));

// ---- simulated clock: live, paused, or running at a chosen rate ----
let live = true;
let rate = 1;          // simulated seconds per real second
let simTime = Date.now();
let anchor = simTime;  // centre of the scrub slider
const now = () => new Date(simTime);

const narrow = window.matchMedia('(max-width: 720px)');
function shiftView(open: boolean) {
  if (!open) orrery.setViewShift(0, 0);
  else if (narrow.matches) orrery.setViewShift(0, 0.26);
  else orrery.setViewShift(Math.min(0.2, 200 / window.innerWidth), 0);
}
orrery.onSelect = (id) => { panel.open(id, now()); shiftView(!!id); };
panel.onClose = () => { orrery.home(); panel.open(null, now()); shiftView(false); };
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (!menu.hidden) setMenu(false); else if (chartView.open) chartView.toggle(false); else panel.onClose(); } });

// ---- view toggle and layers ----
const modeButtons = document.querySelectorAll<HTMLButtonElement>('#view-toggle button');
modeButtons.forEach((b) => b.addEventListener('click', () => {
  orrery.setMode(b.dataset.mode as Mode);
  modeButtons.forEach((x) => x.classList.toggle('active', x === b));
}));
// ---- menu: style, layers, reset ----
const THEMES = [
  { id: 'observatory', name: 'Observatory', note: 'Modern glass', accent: 0x9bd0ff, bg: 0x04060b, swatch: ['#0c111b', '#9bd0ff', '#e8edf5'] },
  { id: 'alchemical', name: 'Alchemical', note: 'Gold, serif', accent: 0xc9a45c, bg: 0x05040a, swatch: ['#0c0a12', '#c9a45c', '#e9dfc8'] },
  { id: 'neon', name: 'Neon', note: 'Violet, cyan', accent: 0xc79bff, bg: 0x06030d, swatch: ['#120a22', '#c084fc', '#5ef2ff'] },
  { id: 'mono', name: 'Mono', note: 'Greyscale', accent: 0xd8d8d8, bg: 0x050505, swatch: ['#0b0b0b', '#f2f2f2', '#8a8a8a'] },
];
const prefs: { theme: string; layers: Record<string, boolean> } = { theme: 'observatory', layers: {} };
try { Object.assign(prefs, JSON.parse(localStorage.getItem('orrery.prefs') ?? '{}')); } catch { /* storage unavailable */ }
const savePrefs = () => { try { localStorage.setItem('orrery.prefs', JSON.stringify(prefs)); } catch { /* storage unavailable */ } };

const themeList = $('#theme-list');
function applyTheme(id: string) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  prefs.theme = t.id;
  document.documentElement.dataset.theme = t.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#' + t.bg.toString(16).padStart(6, '0'));
  orrery.setTheme(t);
  themeList.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.theme === t.id)));
}
themeList.innerHTML = THEMES.map((t) => `<button role="radio" data-theme="${t.id}" aria-checked="false">
  <span class="swatch" style="background:${t.swatch[0]}"><i style="background:${t.swatch[1]}"></i><i style="background:${t.swatch[2]}"></i></span>
  <span class="tn">${t.name}</span><span class="td">${t.note}</span></button>`).join('');
themeList.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-theme]');
  if (b) { applyTheme(b.dataset.theme!); savePrefs(); }
});
applyTheme(prefs.theme);

const layerSetters: Record<string, (on: boolean) => void> = {
  aspects: (on) => orrery.setAspectsVisible(on), figures: (on) => orrery.setFiguresVisible(on),
  paths: (on) => orrery.setPathsVisible(on), labels: (on) => orrery.setLabelsVisible(on),
};
document.querySelectorAll<HTMLInputElement>('#menu input[data-layer]').forEach((box) => {
  const key = box.dataset.layer!;
  if (key in prefs.layers) box.checked = prefs.layers[key];
  layerSetters[key](box.checked);
  box.addEventListener('change', () => { prefs.layers[key] = box.checked; layerSetters[key](box.checked); savePrefs(); });
});

const menu = $('#menu'), menuBtn = $('#menu-btn');
function setMenu(open: boolean) { menu.hidden = !open; menuBtn.setAttribute('aria-expanded', String(open)); menuBtn.classList.toggle('open', open); }
menuBtn.addEventListener('click', (e) => { e.stopPropagation(); setMenu(menu.hidden === true); });
document.addEventListener('pointerdown', (e) => { if (!menu.hidden && !menu.contains(e.target as Node) && !menuBtn.contains(e.target as Node)) setMenu(false); });
$('#home-btn').addEventListener('click', () => { panel.onClose(); setMenu(false); });

// ---- time machine ----
const rateButtons = document.querySelectorAll<HTMLButtonElement>('#time-bar button');
const scrub = $<HTMLInputElement>('#scrub'), datePick = $<HTMLInputElement>('#date-pick');
function setRate(r: number) {
  rate = r;
  live = r === 1;
  if (live) { simTime = Date.now(); anchor = simTime; }
  rateButtons.forEach((x) => x.classList.toggle('active', Number(x.dataset.rate) === r));
  forceUi = true;
}
rateButtons.forEach((b) => b.addEventListener('click', () => setRate(Number(b.dataset.rate))));
scrub.addEventListener('input', () => {
  if (rate !== 0) setRate(0);
  simTime = anchor + Number(scrub.value) * DAY;
  forceUi = true;
});
datePick.addEventListener('change', () => {
  const t = new Date(datePick.value).getTime();
  if (isNaN(t)) return;
  setRate(0);
  simTime = t; anchor = t;
});
const pad = (n: number) => String(n).padStart(2, '0');
const toLocalInput = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

// ---- natal charts ----
const chartView = new ChartView($('#natal'), {
  goTo(ms) { setRate(0); simTime = ms; anchor = ms; if (narrow.matches) chartView.toggle(false); },
  overlay(chart) {
    if (!chart) { orrery.setNatal(null); return; }
    const shown = spread(chart.placements.map((p) => p.lon), 3.2);
    orrery.setNatal({
      points: chart.placements.map((p, i) => ({ glyph: BODIES[p.id].glyph, lon: p.lon, shown: shown[i] })),
      cusps: chart.cusps,
      axes: chart.asc !== null && chart.mc !== null ? [{ label: 'AC', lon: chart.asc }, { label: 'MC', lon: chart.mc }] : [],
    });
  },
});
$('#natal-btn').addEventListener('click', () => { if (!chartView.open) panel.onClose(); chartView.toggle(); });

// ---- left panel: tabs ----
const sky = $('#sky'), skyToggle = $('#sky-toggle');
const tabs = document.querySelectorAll<HTMLButtonElement>('#sky-tabs button[data-tab]');
const bodies: Record<string, HTMLElement> = { sky: $('#sky-list'), aspects: $('#aspect-list'), moment: $('#moment') };
let tab = 'sky';
tabs.forEach((b) => b.addEventListener('click', () => {
  tab = b.dataset.tab!;
  tabs.forEach((x) => x.classList.toggle('active', x === b));
  for (const [k, el] of Object.entries(bodies)) el.hidden = k !== tab;
  sky.classList.remove('collapsed');
  forceUi = true;
}));
if (narrow.matches) sky.classList.add('collapsed');
skyToggle.addEventListener('click', () => {
  const c = sky.classList.toggle('collapsed');
  skyToggle.setAttribute('aria-expanded', String(!c));
});

// Sky tab
const skyIds = ALL_IDS.filter((id) => id !== 'earth');
const skyRows = new Map<BodyId, HTMLElement>();
for (const id of skyIds) {
  const li = document.createElement('li');
  li.innerHTML = `<button><span class="g">${BODIES[id].glyph}</span><span class="n">${BODIES[id].name}</span><span class="p"></span></button>`;
  li.querySelector('button')!.addEventListener('click', () => orrery.select(id));
  bodies.sky.appendChild(li);
  skyRows.set(id, li.querySelector('.p')!);
}
function refreshSky(date: Date) {
  for (const id of skyIds) {
    const lon = geo(id, date).lon, s = signOf(lon);
    const retro = id !== 'node' && id !== 'snode' && id !== 'sun' && id !== 'moon' && speed(id, date) < 0;
    setHtml(skyRows.get(id)!, `<span class="sg el-${s.element}">${s.glyph}</span> ${formatDegree(lon)}${retro ? ' <span class="rx">℞</span>' : ''}`);
  }
}
function setHtml(el: HTMLElement, html: string) { if (el.innerHTML !== html) el.innerHTML = html; }
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

// Aspects tab (the 3D lines use the same list)
function refreshAspects(date: Date) {
  const list = aspects(date);
  // only the tighter aspects are drawn in 3D, so the scene stays readable; the list shows them all
  orrery.setAspects(list.filter((a) => a.orb <= a.type.orb * 0.5).map((a) => ({ a: a.a, b: a.b, color: a.type.color, strength: 1 - a.orb / (a.type.orb * 0.5) })));
  if (tab !== 'aspects') return;
  setHtml(bodies.aspects, list.length ? list.map((a) =>
    `<li><button data-a="${a.a}"><span class="g">${BODIES[a.a].glyph}</span><span class="ag" style="color:${hex(a.type.color)}" title="${a.type.name}">${a.type.glyph}</span><span class="g">${BODIES[a.b].glyph}</span>
      <span class="n">${BODIES[a.a].name} ${a.type.name.toLowerCase()} ${BODIES[a.b].name}</span><span class="p">${a.orb.toFixed(1)}° ${a.applying ? 'a' : 's'}</span></button></li>`).join('')
    + `<li class="legend">a = applying · s = separating</li>` : '<li class="legend">No major aspects within orb.</li>');
}
bodies.aspects.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-a]');
  if (b) orrery.select(b.dataset.a as BodyId);
});

// Moment tab: Moon, void of course, planetary hour
let loc: { lat: number; lon: number } | null = null;
try { loc = JSON.parse(localStorage.getItem('orrery.loc') ?? 'null'); } catch { /* storage unavailable */ }
let locMsg = '';
let voc: { from: number; until: number; info: VoidInfo | null } | null = null;
const fmtTime = (d: Date) => d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit' });
const fmtDay = (d: Date) => d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function refreshMoment(date: Date) {
  if (tab !== 'moment') return;
  const t = date.getTime();
  const m = moonInfo(date), ms = signOf(geo('moon', date).lon);
  if (!voc || t < voc.from || t > voc.until) {
    const info = voidOfCourse(date);
    voc = { from: t, until: info ? (info.voidNow ? info.ends : info.begins!).getTime() : t + 3600000, info };
  }
  const v = voc.info;
  const vocHtml = !v ? '' : v.voidNow
    ? `<p class="state on">Void of course</p><p>until the Moon enters ${SIGNS[v.nextSign].glyph} ${SIGNS[v.nextSign].name}, ${fmtTime(v.ends)}</p>`
    : `<p class="state">Not void</p><p>Last aspect: ${v.lastAspect!.type.glyph} ${v.lastAspect!.type.name.toLowerCase()} ${BODIES[v.lastAspect!.body].glyph} ${BODIES[v.lastAspect!.body].name}, ${fmtTime(v.begins!)}.<br>Then void until ${SIGNS[v.nextSign].glyph} ${SIGNS[v.nextSign].name}, ${fmtTime(v.ends)}.</p>`;

  let hourHtml: string;
  if (!loc) {
    hourHtml = `<p>Planetary hours run from your local sunrise and sunset, so they need a location. It stays on this device.</p>`;
  } else {
    const h = planetaryHour(date, loc.lat, loc.lon);
    hourHtml = h
      ? `<p class="state">${BODIES[h.hourRuler].glyph} Hour of ${BODIES[h.hourRuler].name}</p>
         <p>${ordinal((h.index % 12) + 1)} hour of the ${h.isDay ? 'day' : 'night'}, until ${h.end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}. Next: ${BODIES[h.nextRuler].glyph} ${BODIES[h.nextRuler].name}.</p>
         <p>${BODIES[h.dayRuler].glyph} Day of ${BODIES[h.dayRuler].name} · sunrise ${h.sunrise.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}, sunset ${h.sunset.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</p>`
      : `<p>The Sun does not rise or set at this latitude today, so there are no planetary hours.</p>`;
  }
  const locLine = `<p class="loc">${loc ? `${Math.abs(loc.lat).toFixed(2)}°${loc.lat >= 0 ? 'N' : 'S'}, ${Math.abs(loc.lon).toFixed(2)}°${loc.lon >= 0 ? 'E' : 'W'} · ` : ''}<button data-act="locate">Use my location</button> · <button data-act="manual">Enter coordinates</button></p>${locMsg ? `<p class="loc warn">${locMsg}</p>` : ''}`;

  setHtml(bodies.moment, `
    <section><h3>Moon</h3><p class="state">☽ ${m.name} in ${ms.glyph} ${ms.name}</p>
      <p>${(m.illum * 100).toFixed(0)}% lit · New ${m.nextNew ? fmtDay(m.nextNew) : '—'} · Full ${m.nextFull ? fmtDay(m.nextFull) : '—'}</p></section>
    <section><h3>Moon’s course</h3>${vocHtml}</section>
    <section><h3>Planetary hour</h3>${hourHtml}${locLine}</section>`);
}
const ordinal = (n: number) => n + (['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th');
function setLoc(lat: number, lon: number) {
  loc = { lat, lon }; locMsg = '';
  try { localStorage.setItem('orrery.loc', JSON.stringify(loc)); } catch { /* storage unavailable */ }
  forceUi = true;
}
bodies.moment.addEventListener('click', (e) => {
  const act = (e.target as HTMLElement).dataset.act;
  if (act === 'locate') {
    if (!navigator.geolocation) { locMsg = 'This browser cannot share a location. Enter coordinates instead.'; forceUi = true; return; }
    locMsg = 'Finding your location…'; forceUi = true;
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc(p.coords.latitude, p.coords.longitude),
      () => { locMsg = 'Location was not shared. You can enter coordinates instead.'; forceUi = true; },
      { timeout: 15000 });
  } else if (act === 'manual') {
    const input = window.prompt('Latitude, longitude in degrees (north and east positive), e.g. 51.5, -0.13');
    if (!input) return;
    const [lat, lon] = input.split(',').map((x) => parseFloat(x));
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) setLoc(lat, lon);
    else { locMsg = 'Those coordinates were not understood.'; forceUi = true; }
  }
});

// ---- clock ----
const clock = $('#clock');
function refreshClock(date: Date) {
  const d = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const t = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: live ? '2-digit' : undefined });
  setHtml(clock, `${d} · ${t} <span class="tag ${live ? 'live' : ''}">${live ? 'live' : rate === 0 ? 'paused' : 'time travelling'}</span>`);
  if (document.activeElement !== datePick) datePick.value = toLocalInput(date);
  if (Math.abs(simTime - anchor) > 365 * DAY) anchor = simTime;
  if (document.activeElement !== scrub || rate !== 0) scrub.value = String((simTime - anchor) / DAY);
}

// ---- main loop ----
let last = performance.now(), lastUi = 0, forceUi = true;
function frame(t: number) {
  const dt = Math.min(0.1, (t - last) / 1000);
  last = t;
  simTime = live ? Date.now() : simTime + rate * dt * 1000;
  const date = now();
  orrery.update(date, dt);
  orrery.render();
  if (forceUi || t - lastUi > (live || rate === 0 ? 1000 : 200)) {
    lastUi = t; forceUi = false;
    refreshClock(date);
    if (tab === 'sky') refreshSky(date);
    refreshAspects(date);
    refreshMoment(date);
    panel.refresh(date);
    chartView.refresh(date);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// handle for debugging and automated checks
(window as unknown as Record<string, unknown>).orrery = orrery;
