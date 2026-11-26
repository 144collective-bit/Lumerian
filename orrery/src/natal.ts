// Natal chart mathematics: angles, houses, placements, transits.
import * as A from 'astronomy-engine';
import { geo, speed, norm360, ASPECT_TYPES, type AspectType, type BodyId } from './ephemeris';

export interface Birth {
  id: string; name: string;
  date: string;            // YYYY-MM-DD, local to the birthplace
  time: string | null;     // HH:MM local, or null when unknown (noon is used, no houses)
  place: string; lat: number; lon: number; tz: string;
  utc: number;             // the birth moment, ms since epoch
}

export type HouseSystem = 'placidus' | 'whole';

export const NATAL_BODIES: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node', 'lilith'];

export interface Placement { id: BodyId; lon: number; retro: boolean; house: number | null }
export interface Chart {
  birth: Birth; system: HouseSystem; systemNote: string | null;
  asc: number | null; mc: number | null; cusps: number[] | null; // cusps[0] = 1st house
  placements: Placement[];
}

const D2R = Math.PI / 180, R2D = 180 / Math.PI;

// ---- time zones ----

function tzOffsetMs(tz: string, at: Date): number {
  const f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  const p: Record<string, number> = {};
  for (const part of f.formatToParts(at)) if (part.type !== 'literal') p[part.type] = Number(part.value);
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(at.getTime() / 1000) * 1000;
}

/** A wall-clock date and time in an IANA zone, as a UTC instant. */
export function zonedToUtc(date: string, time: string, tz: string): number {
  const [y, m, d] = date.split('-').map(Number), [h, min] = time.split(':').map(Number);
  const local = Date.UTC(y, m - 1, d, h, min);
  let utc = local - tzOffsetMs(tz, new Date(local));
  utc = local - tzOffsetMs(tz, new Date(utc));
  return utc;
}

// ---- angles and houses ----

function obliquity(date: Date): number {
  const T = (date.getTime() / 86400000 + 2440587.5 - 2451545) / 36525;
  return (23.4392911 - 0.0130042 * T) * D2R;
}

/** Ecliptic longitude of the ecliptic point with the given right ascension. */
const lonOfRa = (ra: number, eps: number) => norm360(Math.atan2(Math.sin(ra), Math.cos(ra) * Math.cos(eps)) * R2D);

export function angles(date: Date, lat: number, lon: number): { asc: number; mc: number; ramc: number; eps: number } {
  const eps = obliquity(date);
  const ramc = norm360(A.SiderealTime(date) * 15 + lon) * D2R;
  const mc = lonOfRa(ramc, eps);
  let asc = norm360(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(lat * D2R) * Math.sin(eps))) * R2D);
  if (norm360(asc - mc) > 180) asc = norm360(asc + 180); // the Ascendant is always east of the Midheaven
  return { asc, mc, ramc, eps };
}

/** Placidus cusps by iteration on the semi-arc; null where the system breaks down (polar latitudes). */
function placidus(ramc: number, eps: number, lat: number, asc: number, mc: number): number[] | null {
  const phi = lat * D2R;
  const cusp = (offset: number, frac: number): number | null => {
    let ra = ramc + offset * D2R;
    for (let k = 0; k < 40; k++) {
      const lam = lonOfRa(ra, eps) * D2R;
      const x = Math.tan(phi) * Math.tan(Math.asin(Math.sin(eps) * Math.sin(lam)));
      if (Math.abs(x) > 1) return null;
      ra = ramc + offset * D2R + Math.asin(x) * frac;
    }
    return lonOfRa(ra, eps);
  };
  const c11 = cusp(30, 1 / 3), c12 = cusp(60, 2 / 3), c2 = cusp(120, 2 / 3), c3 = cusp(150, 1 / 3);
  if (c11 === null || c12 === null || c2 === null || c3 === null) return null;
  const opp = (x: number) => norm360(x + 180);
  const cusps = [asc, c2, c3, opp(mc), opp(c11), opp(c12), opp(asc), opp(c2), opp(c3), mc, c11, c12];
  // cusps must advance through the zodiac in order
  for (let i = 0; i < 12; i++) if (norm360(cusps[(i + 1) % 12] - cusps[i]) > 180) return null;
  return cusps;
}

export function houseOf(lon: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const span = norm360(cusps[(i + 1) % 12] - cusps[i]);
    if (norm360(lon - cusps[i]) < span) return i + 1;
  }
  return 1;
}

export function buildChart(birth: Birth, system: HouseSystem): Chart {
  const date = new Date(birth.utc);
  let asc: number | null = null, mc: number | null = null, cusps: number[] | null = null, systemNote: string | null = null;
  let used = system;
  if (birth.time) {
    const a = angles(date, birth.lat, birth.lon);
    asc = a.asc; mc = a.mc;
    if (system === 'placidus') {
      cusps = placidus(a.ramc, a.eps, birth.lat, asc, mc);
      if (!cusps) { used = 'whole'; systemNote = 'Placidus houses cannot be drawn at this latitude, so Whole Sign houses are shown.'; }
    }
    if (!cusps) { const first = Math.floor(asc / 30) * 30; cusps = Array.from({ length: 12 }, (_, i) => norm360(first + i * 30)); }
  } else {
    systemNote = 'Birth time unknown: positions are for local noon, and the Ascendant, Midheaven and houses are left out. The Moon may be several degrees off.';
  }
  const placements = NATAL_BODIES.map((id) => {
    const lon = geo(id, date).lon;
    return { id, lon, retro: id !== 'sun' && id !== 'moon' && id !== 'node' && speed(id, date) < 0, house: cusps ? houseOf(lon, cusps) : null };
  });
  return { birth, system: used, systemNote, asc, mc, cusps, placements };
}

// ---- aspects ----

export interface ChartAspect { a: string; b: string; aLon: number; bLon: number; type: AspectType; orb: number }
const sep = (x: number, y: number) => { const d = norm360(x - y); return d > 180 ? 360 - d : d; };

function match(s: number, scale: number): { type: AspectType; orb: number } | null {
  for (const type of ASPECT_TYPES) { const orb = Math.abs(s - type.angle); if (orb <= type.orb * scale) return { type, orb }; }
  return null;
}

/** Aspects among the natal placements themselves. */
export function natalAspects(chart: Chart): ChartAspect[] {
  const p = chart.placements.filter((x) => x.id !== 'lilith'), out: ChartAspect[] = [];
  for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
    const m = match(sep(p[i].lon, p[j].lon), 1);
    if (m) out.push({ a: p[i].id, b: p[j].id, aLon: p[i].lon, bLon: p[j].lon, ...m });
  }
  return out.sort((x, y) => x.orb - y.orb);
}

export const TRANSIT_BODIES: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron'];

/** Aspects from the moving sky (a) to natal points (b), with tighter orbs. 'asc' and 'mc' may appear as b. */
export function transitAspects(chart: Chart, date: Date): { transits: { id: BodyId; lon: number }[]; aspects: ChartAspect[] } {
  const transits = TRANSIT_BODIES.map((id) => ({ id, lon: geo(id, date).lon }));
  const targets: { id: string; lon: number }[] = chart.placements.filter((x) => x.id !== 'lilith' && x.id !== 'node');
  if (chart.asc !== null && chart.mc !== null) targets.push({ id: 'asc', lon: chart.asc }, { id: 'mc', lon: chart.mc });
  const out: ChartAspect[] = [];
  for (const t of transits) for (const n of targets) {
    const m = match(sep(t.lon, n.lon), t.id === 'moon' ? 0.35 : 0.5);
    if (m) out.push({ a: t.id, b: n.id, aLon: t.lon, bLon: n.lon, ...m });
  }
  return { transits, aspects: out.sort((x, y) => x.orb - y.orb) };
}

// ---- storage (this browser only) ----

const KEY = 'orrery.charts';
export interface Store { charts: Birth[]; active: string | null; system: HouseSystem }
export function loadStore(): Store {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) ?? 'null');
    if (s && Array.isArray(s.charts)) return { charts: s.charts, active: s.active ?? null, system: s.system === 'whole' ? 'whole' : 'placidus' };
  } catch { /* storage unavailable */ }
  return { charts: [], active: null, system: 'placidus' };
}
export function saveStore(s: Store): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch { return false; }
}

// ---- place search ----

export interface Place { label: string; lat: number; lon: number; tz: string }
export async function searchPlaces(query: string): Promise<Place[]> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=6&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('lookup failed');
  const data = await res.json();
  return (data.results ?? []).filter((r: { timezone?: string }) => r.timezone).map((r: { name: string; admin1?: string; country?: string; latitude: number; longitude: number; timezone: string }) => ({
    label: [r.name, r.admin1, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude, tz: r.timezone,
  }));
}
