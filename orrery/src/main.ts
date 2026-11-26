import './style.css';
import { Orrery, ALL_IDS, type Mode } from './scene';
import { Panel } from './panel';
import { geo, speed, aspects, moonInfo, voidOfCourse, planetaryHour, type BodyId, type VoidInfo } from './ephemeris';
import { BODIES, SIGNS, signOf, formatDegree } from './correspondences';
import { ChartView, spread } from './chart';
import { ui, hc } from './fmt';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const DAY = 86400000;
const narrow = window.matchMedia('(max-width: 720px)');

const orrery = new Orrery($('#scene'));
const panel = new Panel($('#panel'));

// ---- saved preferences (this device only) ----
interface Prefs { theme: string; layers: Record<string, boolean>; h24: boolean; toured: boolean }
const prefs: Prefs = { theme: 'observatory', layers: {}, h24: false, toured: false };
try { Object.assign(prefs, JSON.parse(localStorage.getItem('orrery.prefs') ?? '{}')); } catch { /* storage unavailable */ }
const savePrefs = () => { try { localStorage.setItem('orrery.prefs', JSON.stringify(prefs)); } catch { /* storage unavailable */ } };
ui.h24 = prefs.h24;

// ---- simulated clock: live, paused, or running at a chosen rate ----
let live = true;
let rate = 1;          // simulated seconds per real second
let simTime = Date.now();
let anchor = simTime;  // centre of the scrub slider
let forceUi = true;
const now = () => new Date(simTime);

// ---- sheets and dock ----
type SheetName = 'sky' | 'aspects' | 'moment' | 'natal' | 'settings';
const sheetEls: Record<SheetName, HTMLElement> = {
  sky: $('#sheet-sky'), aspects: $('#sheet-aspects'), moment: $('#sheet-moment'), natal: $('#natal'), settings: $('#sheet-settings'),
};
const dock = $('#dock'), dockInd = $('.dock-ind'), timeBtn = $('#time-btn'), timeBar = $('#time-bar');
const dockButtons = [...dock.querySelectorAll<HTMLButtonElement>('button[data-sheet]')];
let sheet: SheetName | null = null;

function moveIndicator() {
  const b = dockButtons.find((x) => x.dataset.sheet === sheet);
  dockInd.classList.toggle('on', !!b);
  if (b) { dockInd.style.width = `${b.offsetWidth}px`; dockInd.style.transform = `translateX(${b.offsetLeft}px)`; }
}

function setSheet(name: SheetName | null) {
  if (name && narrow.matches && panel.isOpen) panel.onClose();
  sheet = name;
  for (const [k, el] of Object.entries(sheetEls)) if (k !== 'natal') el.classList.toggle('open', k === name);
  chartView.toggle(name === 'natal');
  dockButtons.forEach((b) => { const on = b.dataset.sheet === name; b.classList.toggle('active', on); b.setAttribute('aria-pressed', String(on)); });
  document.body.classList.toggle('sheet-open', !!name);
  moveIndicator();
  forceUi = true;
}
dockButtons.forEach((b) => b.addEventListener('click', () => setSheet(sheet === b.dataset.sheet ? null : (b.dataset.sheet as SheetName))));
document.querySelectorAll<HTMLElement>('[data-close]').forEach((b) => b.addEventListener('click', () => setSheet(null)));
window.addEventListener('resize', moveIndicator);

function setTimeBar(open: boolean) {
  timeBar.classList.toggle('open', open);
  timeBtn.classList.toggle('active', open);
  timeBtn.setAttribute('aria-pressed', String(open));
}
timeBtn.addEventListener('click', () => setTimeBar(!timeBar.classList.contains('open')));
setTimeBar(!narrow.matches);

// ---- planet panel ----
function shiftView(open: boolean) {
  if (!open) orrery.setViewShift(0, 0);
  else if (narrow.matches) orrery.setViewShift(0, 0.24);
  else orrery.setViewShift(Math.min(0.2, 200 / window.innerWidth), 0);
}
orrery.onSelect = (id) => {
  if (id && narrow.matches && sheet) setSheet(null);
  panel.open(id, now());
  shiftView(!!id);
};
panel.onClose = () => { orrery.home(); panel.open(null, now()); shiftView(false); };
window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  if (!$('#coach').hidden) endTour(); else if (sheet) setSheet(null); else panel.onClose();
});

/** On phones, sheets can be dragged down by their header to dismiss. */
function draggable(el: HTMLElement, close: () => void) {
  let startY = 0, dy = 0, active = false;
  el.addEventListener('pointerdown', (e) => {
    if (!narrow.matches || !(e.target as HTMLElement).closest('header') || (e.target as HTMLElement).closest('button, select, input')) return;
    active = true; startY = e.clientY; dy = 0; el.style.transition = 'none';
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!active) return;
    dy = Math.max(0, e.clientY - startY);
    el.style.transform = `translateY(${dy}px)`;
  });
  const end = () => {
    if (!active) return;
    active = false; el.style.transition = ''; el.style.transform = '';
    if (dy > 80) close();
  };
  el.addEventListener('pointerup', end);
  el.addEventListener('pointercancel', end);
}
for (const el of Object.values(sheetEls)) draggable(el, () => setSheet(null));
draggable($('#panel'), () => panel.onClose());

// ---- view toggle ----
const modeButtons = document.querySelectorAll<HTMLButtonElement>('#view-toggle button');
modeButtons.forEach((b) => b.addEventListener('click', () => {
  orrery.setMode(b.dataset.mode as Mode);
  modeButtons.forEach((x) => x.classList.toggle('active', x === b));
}));

// ---- settings: style, layers, time, location ----
const THEMES = [
  { id: 'observatory', name: 'Observatory', note: 'Modern glass', accent: 0x9bd0ff, bg: 0x04060b, swatch: ['#0c111b', '#9bd0ff', '#e8edf5'] },
  { id: 'alchemical', name: 'Alchemical', note: 'Gold, serif', accent: 0xc9a45c, bg: 0x05040a, swatch: ['#0c0a12', '#c9a45c', '#e9dfc8'] },
  { id: 'neon', name: 'Neon', note: 'Violet, cyan', accent: 0xc79bff, bg: 0x06030d, swatch: ['#120a22', '#c084fc', '#5ef2ff'] },
  { id: 'mono', name: 'Mono', note: 'Greyscale', accent: 0xd8d8d8, bg: 0x050505, swatch: ['#0b0b0b', '#f2f2f2', '#8a8a8a'] },
];
const themeList = $('#theme-list');
function applyTheme(id: string, animate = false) {
  const t = THEMES.find((x) => x.id === id) ?? THEMES[0];
  prefs.theme = t.id;
  const root = document.documentElement;
  if (animate) { root.classList.add('theme-anim'); window.setTimeout(() => root.classList.remove('theme-anim'), 500); }
  root.dataset.theme = t.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#' + t.bg.toString(16).padStart(6, '0'));
  orrery.setTheme(t);
  themeList.querySelectorAll('button').forEach((b) => b.setAttribute('aria-checked', String(b.dataset.theme === t.id)));
  requestAnimationFrame(moveIndicator);
}
themeList.innerHTML = THEMES.map((t) => `<button role="radio" data-theme="${t.id}" aria-checked="false">
  <span class="swatch" style="background:${t.swatch[0]}"><i style="background:${t.swatch[1]}"></i><i style="background:${t.swatch[2]}"></i></span>
  <span class="tn">${t.name}</span><span class="td">${t.note}</span></button>`).join('');
themeList.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-theme]');
  if (b) { applyTheme(b.dataset.theme!, true); savePrefs(); }
});
applyTheme(prefs.theme);

const layerSetters: Record<string, (on: boolean) => void> = {
  aspects: (on) => orrery.setAspectsVisible(on), figures: (on) => orrery.setFiguresVisible(on),
  paths: (on) => orrery.setPathsVisible(on), labels: (on) => orrery.setLabelsVisible(on),
};
document.querySelectorAll<HTMLInputElement>('input[data-layer]').forEach((box) => {
  const key = box.dataset.layer!;
  if (key in prefs.layers) box.checked = prefs.layers[key];
  layerSetters[key](box.checked);
  box.addEventListener('change', () => { prefs.layers[key] = box.checked; layerSetters[key](box.checked); savePrefs(); });
});
const h24 = $<HTMLInputElement>('#h24');
h24.checked = prefs.h24;
h24.addEventListener('change', () => { prefs.h24 = ui.h24 = h24.checked; savePrefs(); forceUi = true; });
$('#home-btn').addEventListener('click', () => { panel.onClose(); setSheet(null); });

// location (shared by Settings and the Moment sheet)
let loc: { lat: number; lon: number } | null = null;
try { loc = JSON.parse(localStorage.getItem('orrery.loc') ?? 'null'); } catch { /* storage unavailable */ }
let locMsg = '';
const locLabel = () => (loc ? `${Math.abs(loc.lat).toFixed(2)}°${loc.lat >= 0 ? 'N' : 'S'}, ${Math.abs(loc.lon).toFixed(2)}°${loc.lon >= 0 ? 'E' : 'W'}` : 'No location set');
function setLoc(next: { lat: number; lon: number } | null) {
  loc = next; locMsg = '';
  try { if (next) localStorage.setItem('orrery.loc', JSON.stringify(next)); else localStorage.removeItem('orrery.loc'); } catch { /* storage unavailable */ }
  renderLoc();
}
function renderLoc() {
  setHtml($('#loc-box'), `<p class="loc-now">${locLabel()}</p>${locMsg ? `<p class="note warn">${locMsg}</p>` : ''}
    <div class="btn-row"><button data-act="locate">Use my location</button><button data-act="manual">Enter coordinates</button>${loc ? '<button data-act="clearloc">Clear</button>' : ''}</div>`);
  forceUi = true;
}
document.addEventListener('click', (e) => {
  const act = (e.target as HTMLElement).closest<HTMLElement>('[data-act]')?.dataset.act;
  if (act === 'locate') {
    if (!navigator.geolocation) { locMsg = 'This browser cannot share a location. Enter coordinates instead.'; renderLoc(); return; }
    locMsg = 'Finding your location…'; renderLoc();
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => { locMsg = 'Location was not shared. You can enter coordinates instead.'; renderLoc(); },
      { timeout: 15000 });
  } else if (act === 'manual') {
    const input = window.prompt('Latitude, longitude in degrees (north and east positive), e.g. 51.5, -0.13');
    if (!input) return;
    const [lat, lon] = input.split(',').map((x) => parseFloat(x));
    if (Math.abs(lat) <= 90 && Math.abs(lon) <= 180) setLoc({ lat, lon });
    else { locMsg = 'Those coordinates were not understood.'; renderLoc(); }
  } else if (act === 'clearloc') setLoc(null);
});

// ---- time machine ----
const rateButtons = document.querySelectorAll<HTMLButtonElement>('#time-bar button');
const scrub = $<HTMLInputElement>('#scrub'), datePick = $<HTMLInputElement>('#date-pick');
function setRate(r: number) {
  rate = r;
  live = r === 1;
  if (live) { simTime = Date.now(); anchor = simTime; }
  rateButtons.forEach((x) => x.classList.toggle('active', Number(x.dataset.rate) === r));
  timeBtn.classList.toggle('away', !live);
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
  goTo(ms) { setRate(0); simTime = ms; anchor = ms; setTimeBar(true); if (narrow.matches) setSheet(null); },
  close() { setSheet(null); },
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

// ---- sheet contents ----
/** Replace content only when it changed; a soft flash marks values that just moved. */
function setHtml(el: HTMLElement, html: string, flash = false) {
  if (el.innerHTML === html) return;
  const first = el.innerHTML === '';
  el.innerHTML = html;
  if (flash && !first && rate <= 1) el.animate([{ opacity: 0.35 }, { opacity: 1 }], { duration: 500, easing: 'ease-out' });
}
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');

const skyList = $('#sky-list'), aspectList = $('#aspect-list'), moment = $('#moment');
const skyIds = ALL_IDS.filter((id) => id !== 'earth');
const skyRows = new Map<BodyId, HTMLElement>();
for (const id of skyIds) {
  const li = document.createElement('li');
  li.innerHTML = `<button><span class="g">${BODIES[id].glyph}</span><span class="n">${BODIES[id].name}</span><span class="p"></span></button>`;
  li.querySelector('button')!.addEventListener('click', () => orrery.select(id));
  skyList.appendChild(li);
  skyRows.set(id, li.querySelector('.p')!);
}
function refreshSky(date: Date) {
  for (const id of skyIds) {
    const lon = geo(id, date).lon, s = signOf(lon);
    const retro = id !== 'node' && id !== 'snode' && id !== 'sun' && id !== 'moon' && speed(id, date) < 0;
    setHtml(skyRows.get(id)!, `<span class="sg el-${s.element}">${s.glyph}</span> ${formatDegree(lon)}${retro ? ' <span class="rx">℞</span>' : ''}`, true);
  }
}

function refreshAspects(date: Date) {
  const list = aspects(date);
  // only the tighter aspects are drawn in 3D, so the scene stays readable; the list shows them all
  orrery.setAspects(list.filter((a) => a.orb <= a.type.orb * 0.5).map((a) => ({ a: a.a, b: a.b, color: a.type.color, strength: 1 - a.orb / (a.type.orb * 0.5) })));
  if (sheet !== 'aspects') return;
  setHtml(aspectList, list.length ? list.map((a) =>
    `<li><button data-a="${a.a}"><span class="g">${BODIES[a.a].glyph}</span><span class="ag" style="color:${hex(a.type.color)}" title="${a.type.name}">${a.type.glyph}</span><span class="g">${BODIES[a.b].glyph}</span>
      <span class="n">${BODIES[a.a].name} ${a.type.name.toLowerCase()} ${BODIES[a.b].name}</span><span class="p">${a.orb.toFixed(1)}° ${a.applying ? 'applying' : 'separating'}</span></button></li>`).join('')
    : '<li class="legend">No major aspects within orb.</li>');
}
aspectList.addEventListener('click', (e) => {
  const b = (e.target as HTMLElement).closest<HTMLElement>('button[data-a]');
  if (b) orrery.select(b.dataset.a as BodyId);
});

let voc: { from: number; until: number; info: VoidInfo | null } | null = null;
const fmtTime = (d: Date) => d.toLocaleString(undefined, { weekday: 'short', hour: '2-digit', minute: '2-digit', ...hc() });
const fmtDay = (d: Date) => d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', ...hc() });
const fmtClock = (d: Date) => d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', ...hc() });
const ordinal = (n: number) => n + (['th', 'st', 'nd', 'rd'][n % 100 > 10 && n % 100 < 14 ? 0 : n % 10] ?? 'th');

function refreshMoment(date: Date) {
  if (sheet !== 'moment') return;
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
    hourHtml = `<p>Planetary hours run from your local sunrise and sunset, so they need a location. It stays on this device.</p>
      <div class="btn-row"><button data-act="locate">Use my location</button><button data-act="manual">Enter coordinates</button></div>${locMsg ? `<p class="note warn">${locMsg}</p>` : ''}`;
  } else {
    const h = planetaryHour(date, loc.lat, loc.lon);
    hourHtml = h
      ? `<p class="state">${BODIES[h.hourRuler].glyph} Hour of ${BODIES[h.hourRuler].name}</p>
         <p>${ordinal((h.index % 12) + 1)} hour of the ${h.isDay ? 'day' : 'night'}, until ${fmtClock(h.end)}. Next: ${BODIES[h.nextRuler].glyph} ${BODIES[h.nextRuler].name}.</p>
         <p>${BODIES[h.dayRuler].glyph} Day of ${BODIES[h.dayRuler].name} · sunrise ${fmtClock(h.sunrise)}, sunset ${fmtClock(h.sunset)}</p><p class="legend-line">${locLabel()} · change in Settings</p>`
      : `<p>The Sun does not rise or set at this latitude today, so there are no planetary hours.</p>`;
  }
  setHtml(moment, `
    <section><h3>Moon</h3><p class="state">☽ ${m.name} in ${ms.glyph} ${ms.name}</p>
      <div class="meter" aria-hidden="true"><i style="width:${(m.illum * 100).toFixed(0)}%"></i></div>
      <p>${(m.illum * 100).toFixed(0)}% lit · New ${m.nextNew ? fmtDay(m.nextNew) : '—'} · Full ${m.nextFull ? fmtDay(m.nextFull) : '—'}</p></section>
    <section><h3>Moon’s course</h3>${vocHtml}</section>
    <section><h3>Planetary hour</h3>${hourHtml}</section>`);
}

// ---- clock ----
const clock = $('#clock');
function refreshClock(date: Date) {
  const d = date.toLocaleDateString(undefined, narrow.matches ? { day: 'numeric', month: 'short', year: 'numeric' } : { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const t = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: live ? '2-digit' : undefined, ...hc() });
  setHtml(clock, `${d} · ${t} <span class="tag ${live ? 'live' : ''}">${live ? 'live' : rate === 0 ? 'paused' : 'time travelling'}</span>`);
  if (document.activeElement !== datePick) datePick.value = toLocalInput(date);
  if (Math.abs(simTime - anchor) > 365 * DAY) anchor = simTime;
  if (document.activeElement !== scrub || rate !== 0) scrub.value = String((simTime - anchor) / DAY);
}

// ---- first-visit tips ----
const TOUR: { text: string; target?: string }[] = [
  { text: 'Tap any planet or glyph to open its sign, tarot and alchemy. Drag to orbit, pinch to zoom.' },
  { text: 'The dock opens the live sky, the aspects in force, and this moment’s Moon and planetary hour.', target: '[data-sheet="sky"], [data-sheet="aspects"], [data-sheet="moment"]' },
  { text: 'Cast a natal chart and watch today’s transits move around it.', target: '[data-sheet="natal"]' },
  { text: 'Time travel: scrub, play, or jump to any date.', target: '#time-btn' },
  { text: 'Settings holds the interface styles and scene layers.', target: '[data-sheet="settings"]' },
];
const coach = $('#coach');
let tourStep = 0;
function showTour(step: number) {
  tourStep = step;
  dock.querySelectorAll('.hint').forEach((b) => b.classList.remove('hint'));
  const s = TOUR[step];
  $('#coach-text').textContent = s.text;
  $('#coach-dots').innerHTML = TOUR.map((_, i) => `<i class="${i === step ? 'on' : ''}"></i>`).join('');
  $('#coach-next').textContent = step === TOUR.length - 1 ? 'Done' : 'Next';
  if (s.target) dock.querySelectorAll(s.target).forEach((b) => b.classList.add('hint'));
  coach.hidden = false;
}
function endTour() {
  coach.hidden = true;
  dock.querySelectorAll('.hint').forEach((b) => b.classList.remove('hint'));
  prefs.toured = true; savePrefs();
}
$('#coach-next').addEventListener('click', () => (tourStep === TOUR.length - 1 ? endTour() : showTour(tourStep + 1)));
$('#coach-skip').addEventListener('click', endTour);
$('#tips-btn').addEventListener('click', () => { setSheet(null); showTour(0); });
if (!prefs.toured) window.setTimeout(() => showTour(0), 1400);

renderLoc();
document.body.classList.add('ready');

// ---- main loop ----
let last = performance.now(), lastUi = 0;
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
    if (sheet === 'sky') refreshSky(date);
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
