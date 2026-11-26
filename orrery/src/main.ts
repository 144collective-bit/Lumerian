import './style.css';
import { Orrery, ALL_IDS, type Mode } from './scene';
import { Panel } from './panel';
import { geo, speed, type BodyId } from './ephemeris';
import { BODIES, signOf, formatDegree } from './correspondences';

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;

const orrery = new Orrery($('#scene'));
const panel = new Panel($('#panel'));

// ---- simulated clock: live by default, or running at a chosen rate ----
let live = true;
let rate = 1;
let simTime = Date.now();
const now = () => new Date(simTime);

const narrow = window.matchMedia('(max-width: 720px)');
function shiftView(open: boolean) {
  if (!open) orrery.setViewShift(0, 0);
  else if (narrow.matches) orrery.setViewShift(0, 0.26);
  else orrery.setViewShift(Math.min(0.2, 200 / window.innerWidth), 0);
}
orrery.onSelect = (id) => { panel.open(id, now()); shiftView(!!id); };
panel.onClose = () => { orrery.home(); panel.open(null, now()); shiftView(false); };
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') panel.onClose(); });

// ---- view toggle ----
const modeButtons = document.querySelectorAll<HTMLButtonElement>('#view-toggle button');
modeButtons.forEach((b) => b.addEventListener('click', () => {
  orrery.setMode(b.dataset.mode as Mode);
  modeButtons.forEach((x) => x.classList.toggle('active', x === b));
}));

// ---- time bar ----
const rateButtons = document.querySelectorAll<HTMLButtonElement>('#time-bar button');
rateButtons.forEach((b) => b.addEventListener('click', () => {
  rate = Number(b.dataset.rate);
  live = rate === 1;
  if (live) simTime = Date.now();
  rateButtons.forEach((x) => x.classList.toggle('active', x === b));
}));

// ---- "The Sky Now" list ----
const skyList = $('#sky-list');
const skyIds = ALL_IDS.filter((id) => id !== 'earth');
const skyRows = new Map<BodyId, HTMLElement>();
for (const id of skyIds) {
  const li = document.createElement('li');
  li.innerHTML = `<button><span class="g">${BODIES[id].glyph}</span><span class="n">${BODIES[id].name}</span><span class="p"></span></button>`;
  li.querySelector('button')!.addEventListener('click', () => orrery.select(id));
  skyList.appendChild(li);
  skyRows.set(id, li.querySelector('.p')!);
}
const sky = $('#sky'), skyToggle = $('#sky-toggle');
if (narrow.matches) sky.classList.add('collapsed');
skyToggle.addEventListener('click', () => {
  const c = sky.classList.toggle('collapsed');
  skyToggle.setAttribute('aria-expanded', String(!c));
});

function refreshSky(date: Date) {
  for (const id of skyIds) {
    const lon = geo(id, date).lon, s = signOf(lon);
    const retro = id !== 'node' && id !== 'snode' && id !== 'sun' && id !== 'moon' && speed(id, date) < 0;
    const html = `<span class="sg el-${s.element}">${s.glyph}</span> ${formatDegree(lon)}${retro ? ' <span class="rx">℞</span>' : ''}`;
    const el = skyRows.get(id)!;
    if (el.innerHTML !== html) el.innerHTML = html;
  }
}

const clock = $('#clock');
function refreshClock(date: Date) {
  const d = date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  const t = date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: live ? '2-digit' : undefined });
  clock.innerHTML = `${d} · ${t} <span class="tag ${live ? 'live' : ''}">${live ? 'live' : 'time travelling'}</span>`;
}

// ---- main loop ----
let last = performance.now(), lastUi = 0;
function frame(t: number) {
  const dt = Math.min(0.1, (t - last) / 1000);
  last = t;
  simTime = live ? Date.now() : simTime + rate * dt * 1000;
  const date = now();
  orrery.update(date, dt);
  orrery.render();
  if (t - lastUi > (live ? 1000 : 200)) {
    lastUi = t;
    refreshClock(date);
    refreshSky(date);
    panel.refresh(date);
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// handle for debugging and automated checks
(window as unknown as Record<string, unknown>).orrery = orrery;
