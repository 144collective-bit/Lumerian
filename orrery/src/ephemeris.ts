// Positions for every body, computed in the browser.
// Frame used throughout: true ecliptic and equinox of date (tropical zodiac), units AU.
import * as A from 'astronomy-engine';

export type BodyId =
  | 'sun' | 'moon' | 'mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn'
  | 'uranus' | 'neptune' | 'pluto' | 'chiron' | 'ceres' | 'pallas' | 'juno' | 'vesta'
  | 'node' | 'snode' | 'lilith';

export type Vec = [number, number, number];

const MAJOR: Partial<Record<BodyId, A.Body>> = {
  mercury: A.Body.Mercury, venus: A.Body.Venus, earth: A.Body.Earth, mars: A.Body.Mars,
  jupiter: A.Body.Jupiter, saturn: A.Body.Saturn, uranus: A.Body.Uranus,
  neptune: A.Body.Neptune, pluto: A.Body.Pluto,
};

// Osculating heliocentric elements (ecliptic J2000). Two-body propagation:
// good to a fraction of a degree within a few years of the epoch, drifting beyond that.
interface Elements { epochJD: number; a: number; e: number; i: number; node: number; peri: number; M: number }
const SMALL: Partial<Record<BodyId, Elements>> = {
  ceres:  { epochJD: 2460200.5, a: 2.7672, e: 0.0789, i: 10.587, node: 80.26,  peri: 73.47,  M: 60.08 },
  pallas: { epochJD: 2460200.5, a: 2.7702, e: 0.2302, i: 34.93,  node: 172.92, peri: 310.87, M: 40.60 },
  juno:   { epochJD: 2460200.5, a: 2.6709, e: 0.2558, i: 12.99,  node: 169.84, peri: 247.84, M: 37.02 },
  vesta:  { epochJD: 2460200.5, a: 2.3619, e: 0.0894, i: 7.14,   node: 103.80, peri: 151.66, M: 169.35 },
  chiron: { epochJD: 2460200.5, a: 13.692, e: 0.3790, i: 6.93,   node: 209.30, peri: 339.25, M: 197.0 },
};

export const PERIOD_DAYS: Record<BodyId, number> = {
  sun: 365.256, moon: 27.3217, mercury: 87.969, venus: 224.701, earth: 365.256, mars: 686.98,
  jupiter: 4332.59, saturn: 10759.22, uranus: 30688.5, neptune: 60182, pluto: 90560,
  chiron: 18500, ceres: 1681.4, pallas: 1684.9, juno: 1594.6, vesta: 1325.9,
  node: 6798.38, snode: 6798.38, lilith: 3232.6,
};

const D2R = Math.PI / 180;
const OBL_J2000 = 23.4392911 * D2R;
export const norm360 = (x: number) => ((x % 360) + 360) % 360;
const jd = (d: Date) => d.getTime() / 86400000 + 2440587.5;

function keplerEqj(el: Elements, date: Date): Vec {
  const n = 0.9856076686 / Math.pow(el.a, 1.5); // deg/day
  const M = norm360(el.M + n * (jd(date) - el.epochJD)) * D2R;
  let E = M;
  for (let k = 0; k < 12; k++) E = E - (E - el.e * Math.sin(E) - M) / (1 - el.e * Math.cos(E));
  const xv = el.a * (Math.cos(E) - el.e);
  const yv = el.a * Math.sqrt(1 - el.e * el.e) * Math.sin(E);
  const w = el.peri * D2R, O = el.node * D2R, i = el.i * D2R;
  const cw = Math.cos(w), sw = Math.sin(w), cO = Math.cos(O), sO = Math.sin(O), ci = Math.cos(i), si = Math.sin(i);
  const x = (cw * cO - sw * sO * ci) * xv + (-sw * cO - cw * sO * ci) * yv;
  const y = (cw * sO + sw * cO * ci) * xv + (-sw * sO + cw * cO * ci) * yv;
  const z = sw * si * xv + cw * si * yv;
  // ecliptic J2000 -> equatorial J2000
  const ce = Math.cos(OBL_J2000), se = Math.sin(OBL_J2000);
  return [x, y * ce - z * se, y * se + z * ce];
}

function helioEqj(id: BodyId, t: A.AstroTime): Vec {
  if (id === 'sun') return [0, 0, 0];
  const major = MAJOR[id];
  if (major) { const v = A.HelioVector(major, t); return [v.x, v.y, v.z]; }
  if (id === 'moon') {
    const e = A.HelioVector(A.Body.Earth, t), m = A.GeoMoon(t);
    return [e.x + m.x, e.y + m.y, e.z + m.z];
  }
  const el = SMALL[id];
  if (el) return keplerEqj(el, t.date);
  throw new Error('no heliocentric position for ' + id);
}

function toEct(v: Vec, t: A.AstroTime): Vec {
  const r = A.RotateVector(A.Rotation_EQJ_ECT(t), new A.Vector(v[0], v[1], v[2], t));
  return [r.x, r.y, r.z];
}

export const isPoint = (id: BodyId) => id === 'node' || id === 'snode' || id === 'lilith';

/** Heliocentric position, ecliptic of date, AU. Not defined for calculated points. */
export function helio(id: BodyId, date: Date): Vec {
  const t = A.MakeTime(date);
  return toEct(helioEqj(id, t), t);
}

// Mean lunar node and mean lunar apogee (Black Moon Lilith), Meeus ch. 47.
function meanPoint(id: BodyId, date: Date): number {
  const T = (jd(date) - 2451545.0) / 36525;
  const node = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
  if (id === 'node') return norm360(node);
  if (id === 'snode') return norm360(node + 180);
  return norm360(83.3532465 + 4069.0137287 * T - 0.01032 * T * T + 180);
}

export interface GeoPos { lon: number; lat: number; dist: number }

/** Apparent geocentric ecliptic position (tropical longitude in degrees, distance in AU). */
export function geo(id: BodyId, date: Date): GeoPos {
  const t = A.MakeTime(date);
  if (isPoint(id)) return { lon: meanPoint(id, date), lat: 0, dist: 0 };
  if (id === 'sun') { const s = A.SunPosition(t); return { lon: s.elon, lat: s.elat, dist: s.vec.Length() }; }
  if (id === 'moon') { const m = A.EclipticGeoMoon(t); return { lon: m.lon, lat: m.lat, dist: m.dist }; }
  const major = MAJOR[id];
  let v: A.Vector;
  if (major && id !== 'earth') {
    v = A.GeoVector(major, t, true);
  } else {
    const e = A.HelioVector(A.Body.Earth, t);
    let p = helioEqj(id, t);
    // one light-time iteration
    const d0 = Math.hypot(p[0] - e.x, p[1] - e.y, p[2] - e.z);
    p = helioEqj(id, t.AddDays(-d0 / 173.1446));
    v = new A.Vector(p[0] - e.x, p[1] - e.y, p[2] - e.z, t);
  }
  const ec = A.Ecliptic(v);
  return { lon: ec.elon, lat: ec.elat, dist: v.Length() };
}

/** Longitude speed in degrees per day (negative = retrograde). */
export function speed(id: BodyId, date: Date): number {
  const h = id === 'moon' ? 0.05 : 0.5;
  const a = geo(id, new Date(date.getTime() - h * 86400000)).lon;
  const b = geo(id, new Date(date.getTime() + h * 86400000)).lon;
  let d = b - a;
  if (d > 180) d -= 360; else if (d < -180) d += 360;
  return d / (2 * h);
}

const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

function bisect(f: (d: Date) => boolean, lo: Date, hi: Date): Date {
  // f(lo) is false, f(hi) is true
  let a = lo.getTime(), b = hi.getTime();
  while (b - a > 30000) { const m = (a + b) / 2; if (f(new Date(m))) b = m; else a = m; }
  return new Date(b);
}

/** Next change of zodiac sign (in either direction). */
export function nextIngress(id: BodyId, date: Date): { date: Date; sign: number } | null {
  const sign0 = Math.floor(geo(id, date).lon / 30);
  const step = id === 'moon' ? 0.25 : PERIOD_DAYS[id] > 4000 ? 3 : 1;
  let prev = date;
  for (let k = 0; k < 4000; k++) {
    const next = addDays(prev, step);
    if (Math.floor(geo(id, next).lon / 30) !== sign0) {
      const when = bisect((d) => Math.floor(geo(id, d).lon / 30) !== sign0, prev, next);
      return { date: when, sign: Math.floor(geo(id, new Date(when.getTime() + 60000)).lon / 30) };
    }
    prev = next;
  }
  return null;
}

/** Next station: the moment the body turns retrograde or direct. */
export function nextStation(id: BodyId, date: Date): { date: Date; retrograde: boolean } | null {
  if (id === 'sun' || id === 'moon' || id === 'earth' || isPoint(id)) return null;
  const retro0 = speed(id, date) < 0;
  let prev = date;
  for (let k = 0; k < 420; k++) {
    const next = addDays(prev, 2);
    if ((speed(id, next) < 0) !== retro0) {
      return { date: bisect((d) => (speed(id, d) < 0) !== retro0, prev, next), retrograde: !retro0 };
    }
    prev = next;
  }
  return null;
}

export interface MoonInfo { angle: number; name: string; illum: number; nextNew: Date | null; nextFull: Date | null }
export function moonInfo(date: Date): MoonInfo {
  const angle = A.MoonPhase(date);
  const names = ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Waning Gibbous', 'Last Quarter', 'Waning Crescent'];
  const name = names[Math.floor(norm360(angle + 22.5) / 45)];
  return {
    angle, name,
    illum: A.Illumination(A.Body.Moon, date).phase_fraction,
    nextNew: A.SearchMoonPhase(0, date, 40)?.date ?? null,
    nextFull: A.SearchMoonPhase(180, date, 40)?.date ?? null,
  };
}

/** Galilean moons relative to Jupiter (ecliptic of date, AU). */
export function jupiterMoons(date: Date): Vec[] {
  const t = A.MakeTime(date);
  const j = A.JupiterMoons(t);
  return [j.io, j.europa, j.ganymede, j.callisto].map((s) => toEct([s.x, s.y, s.z], t));
}
