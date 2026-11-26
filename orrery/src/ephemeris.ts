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

// Osculating heliocentric elements (ecliptic J2000) at one epoch. They seed a numerical
// integration under the gravity of the Sun and planets (see SmallBodies below), which keeps
// these bodies accurate across a lifetime of dates; plain two-body motion is only the fallback.
interface Elements { epochJD: number; a: number; e: number; i: number; node: number; peri: number; M: number }
const SMALL: Partial<Record<BodyId, Elements>> = {
  ceres:  { epochJD: 2460200.5, a: 2.7672, e: 0.0789, i: 10.587, node: 80.26,  peri: 73.47,  M: 60.08 },
  pallas: { epochJD: 2460200.5, a: 2.7702, e: 0.2302, i: 34.93,  node: 172.92, peri: 310.87, M: 40.60 },
  juno:   { epochJD: 2460200.5, a: 2.6709, e: 0.2558, i: 12.99,  node: 169.84, peri: 247.84, M: 37.02 },
  vesta:  { epochJD: 2460200.5, a: 2.3619, e: 0.0894, i: 7.14,   node: 103.80, peri: 151.66, M: 169.35 },
  // Chiron's a and M are fitted so the integration reproduces its 2000 and 2024 positions
  chiron: { epochJD: 2460200.5, a: 13.698012, e: 0.3790, i: 6.93,   node: 209.30, peri: 339.25, M: 197.24187 },
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

/**
 * Chiron and the asteroids, integrated numerically from the epoch and cached on a 16-day grid.
 * The grid grows outward from the epoch only as far as dates are actually asked for.
 */
const SMALL_IDS = Object.keys(SMALL) as BodyId[];
const GRID = 16, SUBSTEPS = 8, MAX_NODES = Math.ceil((150 * 365.25) / GRID);
type Node = Float64Array; // 6 numbers per body: position then velocity
class SmallBodies {
  private nodes: [Node[], Node[]] = [[], []]; // forward and backward from the epoch
  private sims: (A.GravitySimulator | null)[] = [null, null];
  private epoch = SMALL[SMALL_IDS[0]]!.epochJD;

  private start(): Node {
    const t0 = new Date((this.epoch - 2440587.5) * 86400000), h = 0.01;
    const n = new Float64Array(SMALL_IDS.length * 6);
    SMALL_IDS.forEach((id, i) => {
      const el = SMALL[id]!;
      const p = keplerEqj(el, t0), a = keplerEqj(el, new Date(t0.getTime() - h * 86400000)), b = keplerEqj(el, new Date(t0.getTime() + h * 86400000));
      n.set([p[0], p[1], p[2], (b[0] - a[0]) / (2 * h), (b[1] - a[1]) / (2 * h), (b[2] - a[2]) / (2 * h)], i * 6);
    });
    return n;
  }

  private node(k: number): Node {
    const dir = k >= 0 ? 0 : 1, list = this.nodes[dir], want = Math.abs(k);
    if (!list.length) list.push(this.start());
    while (list.length <= want) {
      const t0 = A.MakeTime(new Date((this.epoch - 2440587.5) * 86400000));
      if (!this.sims[dir]) {
        const s0 = list[0];
        this.sims[dir] = new A.GravitySimulator(A.Body.Sun, t0, SMALL_IDS.map((_, i) =>
          new A.StateVector(s0[i * 6], s0[i * 6 + 1], s0[i * 6 + 2], s0[i * 6 + 3], s0[i * 6 + 4], s0[i * 6 + 5], t0)));
      }
      const sim = this.sims[dir]!, sign = dir === 0 ? 1 : -1, from = (list.length - 1) * GRID;
      let out: A.StateVector[] = [];
      for (let j = 1; j <= SUBSTEPS; j++) out = sim.Update(t0.AddDays(sign * (from + (j * GRID) / SUBSTEPS)));
      const n = new Float64Array(SMALL_IDS.length * 6);
      out.forEach((v, i) => n.set([v.x, v.y, v.z, v.vx, v.vy, v.vz], i * 6));
      list.push(n);
    }
    return list[want];
  }

  /** Heliocentric J2000 equatorial position, or null when the date is outside the supported span. */
  position(id: BodyId, date: Date): Vec | null {
    const days = date.getTime() / 86400000 + 2440587.5 - this.epoch;
    const k = Math.floor(days / GRID);
    if (Math.abs(k) >= MAX_NODES) return null;
    const a = this.node(k), b = this.node(k + 1), o = SMALL_IDS.indexOf(id) * 6;
    // cubic Hermite interpolation between the two grid nodes
    const u = days / GRID - k, u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = (u3 - 2 * u2 + u) * GRID, h01 = -2 * u3 + 3 * u2, h11 = (u3 - u2) * GRID;
    const f = (i: number) => h00 * a[o + i] + h10 * a[o + 3 + i] + h01 * b[o + i] + h11 * b[o + 3 + i];
    return [f(0), f(1), f(2)];
  }
}
const smallBodies = new SmallBodies();

function helioEqj(id: BodyId, t: A.AstroTime, fast = false): Vec {
  if (id === 'sun') return [0, 0, 0];
  const major = MAJOR[id];
  if (major) { const v = A.HelioVector(major, t); return [v.x, v.y, v.z]; }
  if (id === 'moon') {
    const e = A.HelioVector(A.Body.Earth, t), m = A.GeoMoon(t);
    return [e.x + m.x, e.y + m.y, e.z + m.z];
  }
  const el = SMALL[id];
  if (el) return (fast ? null : smallBodies.position(id, t.date)) ?? keplerEqj(el, t.date);
  throw new Error('no heliocentric position for ' + id);
}

function toEct(v: Vec, t: A.AstroTime): Vec {
  const r = A.RotateVector(A.Rotation_EQJ_ECT(t), new A.Vector(v[0], v[1], v[2], t));
  return [r.x, r.y, r.z];
}

export const isPoint = (id: BodyId) => id === 'node' || id === 'snode' || id === 'lilith';

/**
 * Heliocentric position, ecliptic of date, AU. Not defined for calculated points.
 * `fast` skips the numerical integration for small bodies (used for drawing whole orbits).
 */
export function helio(id: BodyId, date: Date, fast = false): Vec {
  const t = A.MakeTime(date);
  return toEct(helioEqj(id, t, fast), t);
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

// ---------- aspects ----------

export interface AspectType { name: string; glyph: string; angle: number; orb: number; color: number }
export const ASPECT_TYPES: AspectType[] = [
  { name: 'Conjunction', glyph: '☌', angle: 0, orb: 8, color: 0xecd29a },
  { name: 'Sextile', glyph: '⚹', angle: 60, orb: 4, color: 0x6fb7e8 },
  { name: 'Square', glyph: '□', angle: 90, orb: 6, color: 0xe5674e },
  { name: 'Trine', glyph: '△', angle: 120, orb: 6, color: 0x7fd38a },
  { name: 'Opposition', glyph: '☍', angle: 180, orb: 8, color: 0xe58a4e },
];
export const ASPECT_BODIES: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node'];

export interface Aspect { a: BodyId; b: BodyId; type: AspectType; orb: number; applying: boolean }

const sep = (x: number, y: number) => { const d = Math.abs(norm360(x - y)); return d > 180 ? 360 - d : d; };

/** Major aspects in force at a moment, tightest first. */
export function aspects(date: Date): Aspect[] {
  const later = new Date(date.getTime() + 3600000);
  const now = ASPECT_BODIES.map((id) => geo(id, date).lon);
  const next = ASPECT_BODIES.map((id) => geo(id, later).lon);
  const out: Aspect[] = [];
  for (let i = 0; i < ASPECT_BODIES.length; i++) {
    for (let j = i + 1; j < ASPECT_BODIES.length; j++) {
      const s = sep(now[i], now[j]);
      for (const type of ASPECT_TYPES) {
        const orb = Math.abs(s - type.angle);
        if (orb <= type.orb) {
          out.push({ a: ASPECT_BODIES[i], b: ASPECT_BODIES[j], type, orb, applying: Math.abs(sep(next[i], next[j]) - type.angle) < orb });
          break;
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb);
}

// ---------- void-of-course Moon ----------

export interface VoidInfo { voidNow: boolean; begins: Date | null; ends: Date; nextSign: number; lastAspect?: { body: BodyId; type: AspectType } }
const VOC_BODIES: BodyId[] = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
const wrap180 = (x: number) => { x = norm360(x); return x > 180 ? x - 360 : x; };

/**
 * The Moon is void of course from its last exact major aspect to a planet
 * until it leaves its present sign.
 */
export function voidOfCourse(date: Date): VoidInfo | null {
  const ing = nextIngress('moon', date);
  if (!ing) return null;
  const targets = [0, 60, 90, 120, 180, 240, 270, 300];
  const step = 20 * 60000;
  let last: { t: number; body: BodyId; angle: number } | null = null;
  for (const body of VOC_BODIES) {
    const diff = (t: number) => norm360(geo('moon', new Date(t)).lon - geo(body, new Date(t)).lon);
    let t0 = date.getTime(), d0 = diff(t0);
    while (t0 < ing.date.getTime()) {
      const t1 = Math.min(t0 + step, ing.date.getTime()), d1 = diff(t1);
      for (const T of targets) {
        const g0 = wrap180(d0 - T), g1 = wrap180(d1 - T);
        if (Math.abs(g0) < 5 && Math.abs(g1) < 5 && g0 * g1 <= 0 && g0 !== g1) {
          const t = t0 + ((t1 - t0) * g0) / (g0 - g1);
          if (!last || t > last.t) last = { t, body, angle: T > 180 ? 360 - T : T };
        }
      }
      t0 = t1; d0 = d1;
    }
  }
  const type = last ? ASPECT_TYPES.find((a) => a.angle === last!.angle)! : undefined;
  return {
    voidNow: !last, begins: last ? new Date(last.t) : null, ends: ing.date, nextSign: ing.sign,
    lastAspect: last && type ? { body: last.body, type } : undefined,
  };
}

// ---------- planetary hours ----------

const CHALDEAN_HOURS: BodyId[] = ['saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'];
const DAY_RULERS: BodyId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']; // Sunday first

export interface HourInfo { dayRuler: BodyId; hourRuler: BodyId; nextRuler: BodyId; index: number; isDay: boolean; start: Date; end: Date; sunrise: Date; sunset: Date }

/** Classical planetary hour: daylight and darkness are each divided into twelve unequal hours. */
export function planetaryHour(date: Date, lat: number, lon: number): HourInfo | null {
  const obs = new A.Observer(lat, lon, 0);
  const rise = A.SearchRiseSet(A.Body.Sun, obs, +1, date, -1.2);
  if (!rise) return null;
  const set = A.SearchRiseSet(A.Body.Sun, obs, -1, rise.date, 1.2);
  const nextRise = A.SearchRiseSet(A.Body.Sun, obs, +1, rise.AddDays(0.01), 1.5);
  if (!set || !nextRise) return null;
  const t = date.getTime(), r0 = rise.date.getTime(), s = set.date.getTime(), r1 = nextRise.date.getTime();
  const isDay = t < s;
  const len = isDay ? (s - r0) / 12 : (r1 - s) / 12;
  const within = Math.min(11, Math.floor((t - (isDay ? r0 : s)) / len));
  const index = isDay ? within : 12 + within;
  // weekday at the observer, by local mean time at sunrise
  const weekday = new Date(r0 + (lon / 15) * 3600000).getUTCDay();
  const dayRuler = DAY_RULERS[weekday];
  const base = CHALDEAN_HOURS.indexOf(dayRuler);
  const start = (isDay ? r0 : s) + within * len;
  return {
    dayRuler, hourRuler: CHALDEAN_HOURS[(base + index) % 7], nextRuler: CHALDEAN_HOURS[(base + index + 1) % 7],
    index, isDay, start: new Date(start), end: new Date(start + len), sunrise: rise.date, sunset: set.date,
  };
}
