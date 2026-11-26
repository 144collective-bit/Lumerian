// Natal chart screen: entry form, 2D wheel with transits, and lists.
import { BODIES, SIGNS, signOf, formatDegree } from './correspondences';
import { norm360, type BodyId } from './ephemeris';
import {
  buildChart, natalAspects, transitAspects, loadStore, saveStore, searchPlaces, zonedToUtc,
  type Birth, type Chart, type ChartAspect, type Place, type Store,
} from './natal';

interface Hooks { goTo(ms: number): void; overlay(chart: Chart | null): void }

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const hex = (c: number) => '#' + c.toString(16).padStart(6, '0');
const POINT_NAMES: Record<string, { glyph: string; name: string }> = { asc: { glyph: 'AC', name: 'Ascendant' }, mc: { glyph: 'MC', name: 'Midheaven' } };
const label = (id: string) => POINT_NAMES[id] ?? BODIES[id as BodyId];

/** Nudge crowded glyphs apart so they stay readable; returns display longitudes. */
export function spread(lons: number[], minGap: number): number[] {
  const order = lons.map((lon, i) => ({ lon, i })).sort((a, b) => a.lon - b.lon);
  const out = order.map((o) => o.lon);
  for (let pass = 0; pass < 60; pass++) {
    let moved = false;
    for (let k = 0; k < out.length; k++) {
      const j = (k + 1) % out.length;
      const gap = norm360(out[j] - out[k]);
      if (out.length > 1 && gap < minGap) { const push = (minGap - gap) / 2; out[k] = norm360(out[k] - push); out[j] = norm360(out[j] + push); moved = true; }
    }
    if (!moved) break;
  }
  const result: number[] = [];
  order.forEach((o, k) => { result[o.i] = out[k]; });
  return result;
}

function wheelSvg(chart: Chart, transits: { id: BodyId; lon: number }[], aspects: ChartAspect[]): string {
  const base = chart.asc ?? 0, C = 250;
  const pt = (lon: number, r: number) => {
    const th = ((180 + lon - base) * Math.PI) / 180;
    return [C + r * Math.cos(th), C - r * Math.sin(th)] as const;
  };
  const line = (lon: number, r1: number, r2: number, cls: string) => {
    const [x1, y1] = pt(lon, r1), [x2, y2] = pt(lon, r2);
    return `<line class="${cls}" x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>`;
  };
  const text = (lon: number, r: number, cls: string, s: string) => {
    const [x, y] = pt(lon, r);
    return `<text class="${cls}" x="${x.toFixed(1)}" y="${y.toFixed(1)}">${s}</text>`;
  };
  let g = `<circle class="w-ring" cx="250" cy="250" r="240"/><circle class="w-ring" cx="250" cy="250" r="216"/><circle class="w-ring" cx="250" cy="250" r="186"/><circle class="w-inner" cx="250" cy="250" r="100"/>`;
  SIGNS.forEach((s, i) => { g += line(i * 30, 186, 216, 'w-div') + text(i * 30 + 15, 201, `w-sign el-${s.element}`, s.glyph); });
  for (let d = 0; d < 360; d += 5) g += line(d, 186, d % 10 === 0 ? 191 : 189, 'w-tick');
  if (chart.cusps) {
    chart.cusps.forEach((c, i) => {
      g += line(c, 100, 186, 'w-cusp');
      const span = norm360(chart.cusps![(i + 1) % 12] - c);
      g += text(c + span / 2, 112, 'w-house', String(i + 1));
    });
  }
  if (chart.asc !== null && chart.mc !== null) {
    for (const [lon, name] of [[chart.asc, 'AC'], [chart.asc + 180, 'DC'], [chart.mc, 'MC'], [chart.mc + 180, 'IC']] as const) {
      g += line(lon, 100, 240, 'w-angle') + text(lon, 254, 'w-axis', name);
    }
  }
  for (const a of aspects) {
    const [x1, y1] = pt(a.aLon, 100), [x2, y2] = pt(a.bLon, 100);
    g += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${hex(a.type.color)}" stroke-opacity="${(0.25 + 0.6 * (1 - a.orb / a.type.orb)).toFixed(2)}" stroke-width="1"/>`;
  }
  const natalShown = spread(chart.placements.map((p) => p.lon), 8.5);
  chart.placements.forEach((p, i) => {
    g += line(p.lon, 180, 186, 'w-mark') + text(natalShown[i], 160, 'w-natal', BODIES[p.id].glyph) + (p.retro ? text(natalShown[i], 140, 'w-rx', '℞') : '');
  });
  const transitShown = spread(transits.map((t) => t.lon), 7);
  transits.forEach((t, i) => { g += line(t.lon, 216, 220, 'w-tmark') + text(transitShown[i], 229, 'w-transit', BODIES[t.id].glyph); });
  return `<svg class="wheel" viewBox="-22 -22 544 544" role="img" aria-label="Natal chart wheel with current transits on the outer ring">${g}</svg>`;
}

export class ChartView {
  private store: Store = loadStore();
  private chart: Chart | null = null;
  private editing: Birth | 'new' | null = null;
  private place: Place | null = null;
  private results: Place[] = [];
  private message = '';
  private lastLive = '';
  open = false;

  constructor(private el: HTMLElement, private hooks: Hooks) {
    this.rebuild();
    el.addEventListener('click', (e) => this.onClick(e));
    el.addEventListener('change', (e) => this.onChange(e));
    el.addEventListener('submit', (e) => { e.preventDefault(); this.save(); });
  }

  private get active(): Birth | null { return this.store.charts.find((c) => c.id === this.store.active) ?? null; }

  private rebuild() {
    const b = this.active;
    this.chart = b ? buildChart(b, this.store.system) : null;
    this.hooks.overlay(this.chart);
  }

  toggle(open = !this.open) {
    this.open = open;
    this.el.hidden = !open;
    document.body.classList.toggle('natal-open', open);
    if (open) { if (!this.store.charts.length) this.editing = 'new'; this.render(); }
  }

  private persist() {
    if (!saveStore(this.store)) this.message = 'This browser is not allowing storage, so charts will not be kept after you leave.';
  }

  // ---------- rendering ----------

  private render() {
    const head = `<header><h2>Natal Chart</h2><button class="close" data-act="close" aria-label="Close">×</button></header>`;
    if (this.editing) { this.el.innerHTML = head + this.formHtml(); return; }
    const c = this.chart!;
    const options = this.store.charts.map((b) => `<option value="${b.id}" ${b.id === this.store.active ? 'selected' : ''}>${esc(b.name)}</option>`).join('');
    const when = new Date(c.birth.utc).toLocaleString(undefined, { timeZone: c.birth.tz, day: 'numeric', month: 'long', year: 'numeric', ...(c.birth.time ? { hour: '2-digit', minute: '2-digit' } : {}) });
    this.el.innerHTML = head + `
      <div class="chart-bar">
        <select data-act="pick" aria-label="Saved charts">${options}</select>
        <button data-act="new">New</button><button data-act="edit">Edit</button><button data-act="delete">Delete</button>
      </div>
      <p class="born">${esc(when)}${c.birth.time ? '' : ' (time unknown)'} · ${esc(c.birth.place)}</p>
      <div class="seg" role="group" aria-label="House system">
        <button data-act="sys" data-sys="placidus" class="${this.store.system === 'placidus' ? 'active' : ''}">Placidus</button>
        <button data-act="sys" data-sys="whole" class="${this.store.system === 'whole' ? 'active' : ''}">Whole Sign</button>
        <button data-act="birthsky" class="link">View the birth sky in 3D</button>
      </div>
      ${c.systemNote ? `<p class="note">${c.systemNote}</p>` : ''}${this.message ? `<p class="note warn">${this.message}</p>` : ''}
      <div data-s="wheel"></div>
      <p class="key"><span class="k-natal">●</span> natal, inner · <span class="k-transit">●</span> sky at the orrery’s current time, outer</p>
      <section><h3>Placements</h3>${this.placementsHtml(c)}</section>
      <section data-s="transits"></section>
      <section><h3>Natal aspects</h3>${this.aspectsHtml(natalAspects(c).slice(0, 16), false)}</section>`;
    this.lastLive = '';
  }

  private placementsHtml(c: Chart): string {
    const row = (glyph: string, name: string, lon: number, house: string, rx = false) => {
      const s = signOf(lon);
      return `<tr><td class="g">${glyph}</td><td>${name}</td><td><span class="sg el-${s.element}">${s.glyph}</span> ${formatDegree(lon)} ${s.name}${rx ? ' <span class="rx">℞</span>' : ''}</td><td class="h">${house}</td></tr>`;
    };
    let rows = '';
    if (c.asc !== null && c.mc !== null) rows += row('AC', 'Ascendant', c.asc, '1') + row('MC', 'Midheaven', c.mc, c.cusps ? String(this.houseNum(c, c.mc)) : '');
    rows += c.placements.map((p) => row(BODIES[p.id].glyph, BODIES[p.id].name, p.lon, p.house ? String(p.house) : '—', p.retro)).join('');
    return `<table><thead><tr><th></th><th></th><th>Position</th><th class="h">House</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  private houseNum(c: Chart, lon: number): number {
    for (let i = 0; i < 12; i++) if (norm360(lon - c.cusps![i]) < norm360(c.cusps![(i + 1) % 12] - c.cusps![i])) return i + 1;
    return 1;
  }

  private aspectsHtml(list: ChartAspect[], transit: boolean): string {
    if (!list.length) return `<p class="note">${transit ? 'No transits within orb at this moment.' : 'No major aspects within orb.'}</p>`;
    return `<ul class="asp">${list.map((a) => `<li><span class="g ${transit ? 'k-transit' : ''}">${label(a.a).glyph}</span><span class="ag" style="color:${hex(a.type.color)}">${a.type.glyph}</span><span class="g">${label(a.b).glyph}</span>
      <span>${label(a.a).name} ${a.type.name.toLowerCase()} ${transit ? 'natal ' : ''}${label(a.b).name}</span><span class="p">${a.orb.toFixed(1)}°</span></li>`).join('')}</ul>`;
  }

  private formHtml(): string {
    const b = this.editing === 'new' ? null : this.editing;
    const place = this.place;
    return `<form class="birth-form" novalidate>
      <p class="note">Charts are kept in this browser only. Searching for a city sends just the place name to the Open-Meteo lookup service.</p>
      <label>Name<input name="name" required maxlength="40" value="${b ? esc(b.name) : ''}" placeholder="Whose chart is this?"></label>
      <div class="two">
        <label>Birth date<input name="date" type="date" required min="1900-01-01" max="2100-12-31" value="${b?.date ?? ''}"></label>
        <label>Local time<input name="time" type="time" value="${b?.time ?? ''}"></label>
      </div>
      <label class="check"><input name="unknown" type="checkbox" ${b && !b.time ? 'checked' : ''}> Birth time unknown</label>
      <label>Birthplace
        <span class="search"><input name="q" type="search" placeholder="City or town" autocomplete="off"><button type="button" data-act="search">Search</button></span>
      </label>
      ${this.results.length ? `<ul class="places">${this.results.map((r, i) => `<li><button type="button" data-act="place" data-i="${i}">${esc(r.label)}</button></li>`).join('')}</ul>` : ''}
      ${place ? `<p class="chosen">✓ ${esc(place.label)} · ${Math.abs(place.lat).toFixed(2)}°${place.lat >= 0 ? 'N' : 'S'}, ${Math.abs(place.lon).toFixed(2)}°${place.lon >= 0 ? 'E' : 'W'} · ${esc(place.tz)}</p>` : ''}
      ${this.message ? `<p class="note warn">${this.message}</p>` : ''}
      <div class="actions"><button type="submit" class="primary">Cast chart</button>${this.store.charts.length ? '<button type="button" data-act="cancel">Cancel</button>' : ''}</div>
    </form>`;
  }

  /** Called on the UI tick: the outer transit ring and the transit list follow the orrery clock. */
  refresh(date: Date) {
    if (!this.open || this.editing || !this.chart) return;
    const t = transitAspects(this.chart, date);
    const key = t.transits.map((x) => x.lon.toFixed(2)).join();
    if (key === this.lastLive) return;
    this.lastLive = key;
    const wheel = this.el.querySelector('[data-s="wheel"]'), list = this.el.querySelector('[data-s="transits"]');
    if (wheel) wheel.innerHTML = wheelSvg(this.chart, t.transits, natalAspects(this.chart).slice(0, 24));
    if (list) list.innerHTML = `<h3>Transits to this chart</h3>${this.aspectsHtml(t.aspects.slice(0, 14), true)}`;
  }

  // ---------- events ----------

  private keepForm(): Record<string, string> {
    const f = this.el.querySelector('form');
    const out: Record<string, string> = {};
    if (f) new FormData(f).forEach((v, k) => { out[k] = String(v); });
    return out;
  }
  private restoreForm(v: Record<string, string>) {
    const f = this.el.querySelector('form');
    if (!f) return;
    for (const [k, val] of Object.entries(v)) {
      const input = f.elements.namedItem(k) as HTMLInputElement | null;
      if (!input) continue;
      if (input.type === 'checkbox') input.checked = true; else input.value = val;
    }
    if (!('unknown' in v)) (f.elements.namedItem('unknown') as HTMLInputElement).checked = false;
  }
  private rerenderForm() { const v = this.keepForm(); this.render(); this.restoreForm(v); }

  private async onClick(e: Event) {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-act]');
    if (!t || t.tagName === 'SELECT') return;
    const act = t.dataset.act;
    if (act === 'close') this.toggle(false);
    else if (act === 'new') { this.editing = 'new'; this.place = null; this.results = []; this.message = ''; this.render(); }
    else if (act === 'edit' && this.active) {
      const b = this.active; this.editing = b; this.place = { label: b.place, lat: b.lat, lon: b.lon, tz: b.tz }; this.results = []; this.message = ''; this.render();
    } else if (act === 'cancel') { this.editing = null; this.message = ''; this.render(); }
    else if (act === 'delete' && this.active) {
      if (!window.confirm(`Delete the chart "${this.active.name}"? This cannot be undone.`)) return;
      this.store.charts = this.store.charts.filter((c) => c.id !== this.store.active);
      this.store.active = this.store.charts[0]?.id ?? null;
      this.persist(); this.rebuild();
      if (!this.store.charts.length) this.editing = 'new';
      this.render();
    } else if (act === 'sys') { this.store.system = t.dataset.sys === 'whole' ? 'whole' : 'placidus'; this.persist(); this.rebuild(); this.render(); }
    else if (act === 'birthsky' && this.chart) this.hooks.goTo(this.chart.birth.utc);
    else if (act === 'search') {
      const q = (this.el.querySelector('input[name="q"]') as HTMLInputElement).value.trim();
      if (q.length < 2) { this.message = 'Type at least two letters of the place name.'; this.rerenderForm(); return; }
      this.message = 'Searching…'; this.rerenderForm();
      try {
        this.results = await searchPlaces(q);
        this.message = this.results.length ? '' : 'No places found with that name. Try a nearby larger town.';
      } catch { this.results = []; this.message = 'The place lookup could not be reached. Check the connection and try again.'; }
      this.rerenderForm();
    } else if (act === 'place') { this.place = this.results[Number(t.dataset.i)]; this.results = []; this.message = ''; this.rerenderForm(); }
  }

  private onChange(e: Event) {
    const t = e.target as HTMLSelectElement;
    if (t.dataset.act === 'pick') { this.store.active = t.value; this.persist(); this.rebuild(); this.render(); }
  }

  private save() {
    const v = this.keepForm();
    const unknown = 'unknown' in v;
    const fail = (m: string) => { this.message = m; this.rerenderForm(); };
    if (!v.name?.trim()) return fail('Give the chart a name.');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date ?? '')) return fail('Enter the birth date.');
    if (!unknown && !/^\d{2}:\d{2}/.test(v.time ?? '')) return fail('Enter the birth time, or tick "Birth time unknown".');
    if (!this.place) return fail('Search for the birthplace and choose it from the list.');
    const time = unknown ? null : v.time.slice(0, 5);
    let utc: number;
    try { utc = zonedToUtc(v.date, time ?? '12:00', this.place.tz); } catch { return fail('That time zone is not known to this browser.'); }
    if (!isFinite(utc)) return fail('That date could not be read.');
    const prior = this.editing !== 'new' ? this.editing : null;
    const birth: Birth = { id: prior?.id ?? Date.now().toString(36), name: v.name.trim(), date: v.date, time, place: this.place.label, lat: this.place.lat, lon: this.place.lon, tz: this.place.tz, utc };
    this.store.charts = prior ? this.store.charts.map((c) => (c.id === birth.id ? birth : c)) : [...this.store.charts, birth];
    this.store.active = birth.id;
    this.editing = null; this.message = '';
    this.persist(); this.rebuild(); this.render();
  }
}
