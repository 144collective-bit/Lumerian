import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { helio, geo, jupiterMoons, isPoint, PERIOD_DAYS, type BodyId, type Vec } from './ephemeris';
import { BODIES, SIGNS } from './correspondences';
import { planetTexture, ringTexture, glowTexture, sunTexture, glyphTexture, textTexture, type SurfaceSpec } from './textures';

export type Mode = 'helio' | 'geo';

const GOLD = 0xc9a45c;
const DAY = 86400000;
/** Distances are compressed so the whole system fits on screen; directions are true. */
const scaleAU = (d: number) => 14 * Math.pow(d, 0.45);
const toScene = (v: Vec, out = new THREE.Vector3()) => out.set(v[0], v[2], -v[1]);
const MOON_DIST = 2.4, POINT_DIST = 3.7, RING_R = 94;

interface Visual { r: number; tilt?: number; spin?: number; surface?: SurfaceSpec; image?: string; color: number }
const VISUALS: Partial<Record<BodyId, Visual>> = {
  sun: { r: 3.2, color: 0xffd27a, spin: 0.02 },
  mercury: { r: 0.45, color: 0x9c9388, spin: 0.01, surface: { seed: 11, kind: 'rocky', palette: [[70, 66, 62], [120, 112, 104], [165, 156, 146], [200, 192, 182]] } },
  venus: { r: 0.75, color: 0xe6c88a, spin: -0.005, tilt: 3, surface: { seed: 21, kind: 'banded', bands: 5, turbulence: 0.25, palette: [[190, 150, 90], [226, 196, 130], [240, 220, 170], [250, 238, 205]] } },
  earth: { r: 0.8, color: 0x4f7fd0, spin: 0.25, tilt: 23.4, image: 'textures/earth.jpg' },
  moon: { r: 0.26, color: 0xbdbdbd, spin: 0.01, image: 'textures/moon.jpg' },
  mars: { r: 0.55, color: 0xc1552f, spin: 0.24, tilt: 25.2, surface: { seed: 31, kind: 'rocky', palette: [[92, 40, 22], [160, 72, 38], [200, 110, 62], [226, 160, 110]] } },
  jupiter: { r: 1.9, color: 0xd9b38c, spin: 0.6, tilt: 3.1, surface: { seed: 41, kind: 'banded', bands: 16, turbulence: 0.05, palette: [[150, 100, 66], [205, 160, 115], [236, 214, 180], [176, 118, 80], [240, 226, 200]] } },
  saturn: { r: 1.55, color: 0xe3cf9c, spin: 0.55, tilt: 26.7, surface: { seed: 51, kind: 'banded', bands: 12, turbulence: 0.03, palette: [[176, 150, 100], [214, 190, 136], [236, 220, 170], [200, 176, 124]] } },
  uranus: { r: 1.1, color: 0x9fdde0, spin: -0.35, tilt: 97.8, surface: { seed: 61, kind: 'smooth', bands: 6, palette: [[130, 200, 206], [160, 222, 226], [190, 236, 238]] } },
  neptune: { r: 1.05, color: 0x4a6fe0, spin: 0.37, tilt: 28.3, surface: { seed: 71, kind: 'smooth', bands: 8, turbulence: 0.1, palette: [[40, 70, 190], [62, 100, 220], [110, 150, 240]] } },
  pluto: { r: 0.34, color: 0xc7a98c, spin: 0.04, tilt: 120, surface: { seed: 81, kind: 'rocky', palette: [[90, 62, 48], [170, 136, 108], [222, 200, 176], [240, 230, 216]] } },
  chiron: { r: 0.22, color: 0x8f8a82, surface: { seed: 91, kind: 'rocky', palette: [[60, 58, 56], [120, 114, 108], [170, 164, 156]] } },
  ceres: { r: 0.26, color: 0xa39c92, surface: { seed: 92, kind: 'rocky', palette: [[70, 68, 64], [130, 124, 116], [184, 178, 168]] } },
  pallas: { r: 0.2, color: 0x9a968f, surface: { seed: 93, kind: 'rocky', palette: [[66, 64, 62], [126, 122, 116], [176, 172, 164]] } },
  juno: { r: 0.2, color: 0xa8998a, surface: { seed: 94, kind: 'rocky', palette: [[76, 66, 58], [140, 124, 108], [190, 174, 156]] } },
  vesta: { r: 0.21, color: 0xb5ada2, surface: { seed: 95, kind: 'rocky', palette: [[80, 76, 70], [150, 144, 134], [204, 198, 186]] } },
};

export const ALL_IDS = Object.keys(BODIES) as BodyId[];

interface BodyObj {
  id: BodyId; group: THREE.Group; mesh?: THREE.Mesh; radius: number;
  target: THREE.Vector3; from: THREE.Vector3; label: CSS2DObject; labelEl: HTMLElement;
  path?: THREE.Line; ringMark?: THREE.Sprite; spin: number;
}

export class Orrery {
  onSelect: (id: BodyId | null) => void = () => {};
  mode: Mode = 'helio';
  private renderer: THREE.WebGLRenderer;
  private labels: CSS2DRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private controls: OrbitControls;
  private bodies = new Map<BodyId, BodyObj>();
  private sunLight = new THREE.PointLight(0xfff2dd, 3.2, 0, 0);
  private belt!: THREE.Points;
  private moons: THREE.Mesh[] = [];
  private titan!: THREE.Mesh;
  private moonOrbit!: THREE.LineLoop;
  private transition = 1;
  private lastPosTime = NaN;
  private pathTime = NaN;
  private pathBuiltAt = 0;
  private selected: BodyId | null = null;
  private fly: { t: number; fromDist: number; toDist: number } | null = null;
  private idleSince = 0;
  private shift = { x: 0, y: 0 };
  private sky = new THREE.Group();
  private figures = new THREE.Group();
  private aspectLines!: THREE.LineSegments;
  private natal = new THREE.Group();
  private aspectList: { a: BodyId; b: BodyId; color: number; strength: number }[] = [];

  constructor(private host: HTMLElement) {
    const w = host.clientWidth, h = host.clientHeight;
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(w, h);
    this.renderer.setClearColor(0x05040a);
    host.appendChild(this.renderer.domElement);

    this.labels = new CSS2DRenderer();
    this.labels.setSize(w, h);
    this.labels.domElement.className = 'label-layer';
    host.appendChild(this.labels.domElement);

    this.camera = new THREE.PerspectiveCamera(45, w / h, 0.05, 3000);
    const portrait = Math.max(1, (h / w) * 0.95);
    this.camera.position.set(0, 68 * portrait, 122 * portrait);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.07;
    this.controls.minDistance = 1.2;
    this.controls.maxDistance = 520;
    this.controls.autoRotate = true;
    this.controls.autoRotateSpeed = 0.12;
    this.controls.addEventListener('start', () => { this.controls.autoRotate = false; this.fly = null; this.idleSince = performance.now(); });

    this.scene.add(new THREE.AmbientLight(0x8890b0, 0.28));
    this.scene.add(this.sunLight);
    void this.buildStars();
    this.scene.add(this.natal);
    this.buildAspectLines();
    this.buildZodiac();
    this.buildBodies();
    this.buildBelt();
    this.attachPicking();
    window.addEventListener('resize', () => this.resize());
  }

  // ---------- construction ----------

  /** Real stars and constellation figures (J2000 catalogue), placed on the ecliptic frame. */
  private async buildStars() {
    this.scene.add(this.sky);
    const R = 900, eps = THREE.MathUtils.degToRad(23.4392911), ce = Math.cos(eps), se = Math.sin(eps);
    const place = (raDeg: number, decDeg: number, r = R) => {
      const a = THREE.MathUtils.degToRad(raDeg), d = THREE.MathUtils.degToRad(decDeg);
      const x = Math.cos(d) * Math.cos(a), y = Math.cos(d) * Math.sin(a), z = Math.sin(d);
      return new THREE.Vector3(x, -y * se + z * ce, -(y * ce + z * se)).multiplyScalar(r);
    };
    let data: { stars: number[]; lines: Record<string, number[][][]> };
    try {
      data = await (await fetch('data/sky.json')).json();
    } catch {
      return;
    }
    const buckets = [{ max: 2.2, size: 3.4 }, { max: 3.6, size: 2.4 }, { max: 4.8, size: 1.7 }, { max: 9, size: 1.1 }];
    const pos: number[][] = buckets.map(() => []), col: number[][] = buckets.map(() => []);
    for (let i = 0; i < data.stars.length; i += 4) {
      const [ra, dec, mag, bv] = data.stars.slice(i, i + 4);
      const b = buckets.findIndex((k) => mag <= k.max), v = place(ra, dec);
      const t = THREE.MathUtils.clamp((bv + 0.3) / 1.8, 0, 1);
      const lum = THREE.MathUtils.clamp(1.15 - mag * 0.13, 0.3, 1);
      pos[b].push(v.x, v.y, v.z);
      col[b].push(lum * (0.72 + 0.28 * t), lum * (0.82 + 0.06 * t - 0.2 * t * t), lum * (1 - 0.5 * t));
    }
    buckets.forEach((k, b) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos[b], 3));
      g.setAttribute('color', new THREE.Float32BufferAttribute(col[b], 3));
      this.sky.add(new THREE.Points(g, new THREE.PointsMaterial({ size: k.size, sizeAttenuation: false, vertexColors: true })));
    });

    try { await document.fonts.load('44px Cinzel'); } catch { /* fall back to a system serif */ }
    const zodiac: Record<string, string> = { Ari: 'Aries', Tau: 'Taurus', Gem: 'Gemini', Cnc: 'Cancer', Leo: 'Leo', Vir: 'Virgo', Lib: 'Libra', Sco: 'Scorpius', Sgr: 'Sagittarius', Cap: 'Capricornus', Aqr: 'Aquarius', Psc: 'Pisces' };
    const faint: number[] = [], bright: number[] = [];
    for (const [id, segs] of Object.entries(data.lines)) {
      const out = zodiac[id] ? bright : faint;
      const centre = new THREE.Vector3(); let n = 0;
      for (const seg of segs) {
        for (let k = 0; k + 1 < seg.length; k++) {
          const a = place(seg[k][0], seg[k][1], R - 2), b = place(seg[k + 1][0], seg[k + 1][1], R - 2);
          out.push(a.x, a.y, a.z, b.x, b.y, b.z);
          centre.add(a); n++;
        }
      }
      if (zodiac[id] && n) {
        const label = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture(zodiac[id].toUpperCase()), transparent: true, depthWrite: false, opacity: 0.75 }));
        label.position.copy(centre.normalize().multiplyScalar(R - 4));
        label.scale.set(150, 37.5, 1);
        this.figures.add(label);
      }
    }
    const lines = (arr: number[], color: number, opacity: number) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
      return new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false }));
    };
    this.figures.add(lines(faint, 0x7f93c9, 0.16), lines(bright, 0xd9c08a, 0.5));
    this.sky.add(this.figures);
  }

  private buildAspectLines() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(80 * 6), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(80 * 6), 3));
    g.setDrawRange(0, 0);
    this.aspectLines = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    this.aspectLines.frustumCulled = false;
    this.scene.add(this.aspectLines);
  }

  /** Aspects to draw as lines between bodies; strength 0..1 sets brightness. */
  setAspects(list: { a: BodyId; b: BodyId; color: number; strength: number }[]) { this.aspectList = list.slice(0, 80); }
  /**
   * Mark a natal chart on the zodiac ring: placements outside the band, house cusps across it.
   * Pass null to clear.
   */
  setNatal(data: { points: { glyph: string; lon: number; shown: number }[]; cusps: number[] | null; axes: { label: string; lon: number }[] } | null) {
    for (const child of [...this.natal.children]) {
      this.natal.remove(child);
      const o = child as THREE.Sprite | THREE.LineSegments;
      const m = o.material as THREE.SpriteMaterial | THREE.LineBasicMaterial;
      (m as THREE.SpriteMaterial).map?.dispose(); m.dispose();
      if ('geometry' in o) o.geometry.dispose();
    }
    if (!data) return;
    const at = (lon: number, r: number) => { const a = THREE.MathUtils.degToRad(lon); return new THREE.Vector3(Math.cos(a) * r, 0, -Math.sin(a) * r); };
    const sprite = (tex: THREE.Texture, lon: number, r: number, w: number, h = w) => {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      s.position.copy(at(lon, r)); s.scale.set(w, h, 1); this.natal.add(s);
    };
    const seg: number[] = [];
    const push = (lon: number, r1: number, r2: number) => { const a = at(lon, r1), b = at(lon, r2); seg.push(a.x, a.y, a.z, b.x, b.y, b.z); };
    for (const p of data.points) { push(p.lon, RING_R + 4, RING_R + 6.5); sprite(glyphTexture(p.glyph, '#8fd3d8'), p.shown, RING_R + 10, 5.6); }
    if (data.cusps) data.cusps.forEach((c, i) => {
      push(c, RING_R - 4, RING_R + 4);
      const span = (((data.cusps![(i + 1) % 12] - c) % 360) + 360) % 360;
      sprite(textTexture(String(i + 1), '#8fd3d8'), c + span / 2, RING_R + 16, 20, 5);
    });
    for (const a of data.axes) { push(a.lon, RING_R - 12, RING_R + 14); sprite(textTexture(a.label, '#d6f3f5'), a.lon, RING_R + 17, 26, 6.5); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3));
    this.natal.add(new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x8fd3d8, transparent: true, opacity: 0.8, depthWrite: false })));
  }
  setAspectsVisible(v: boolean) { this.aspectLines.visible = v; }
  setFiguresVisible(v: boolean) { this.figures.visible = v; }

  private updateAspectLines() {
    if (!this.aspectLines.visible) return;
    const pos = this.aspectLines.geometry.attributes.position as THREE.BufferAttribute;
    const col = this.aspectLines.geometry.attributes.color as THREE.BufferAttribute;
    const c = new THREE.Color();
    this.aspectList.forEach((asp, i) => {
      const a = this.bodies.get(asp.a)!.group.position, b = this.bodies.get(asp.b)!.group.position;
      pos.setXYZ(i * 2, a.x, a.y, a.z); pos.setXYZ(i * 2 + 1, b.x, b.y, b.z);
      c.set(asp.color).multiplyScalar(0.25 + 0.75 * asp.strength);
      col.setXYZ(i * 2, c.r, c.g, c.b); col.setXYZ(i * 2 + 1, c.r, c.g, c.b);
    });
    pos.needsUpdate = true; col.needsUpdate = true;
    this.aspectLines.geometry.setDrawRange(0, this.aspectList.length * 2);
  }

  private buildZodiac() {
    const group = new THREE.Group();
    const elementTint: Record<string, number> = { Fire: 0xd9603a, Earth: 0x7d9a4e, Air: 0xd9c56a, Water: 0x4a7fc0 };
    const seg = (2 * Math.PI) / 12;
    SIGNS.forEach((sign, i) => {
      // RingGeometry lies in XY; rotating -90deg about X puts theta counter-clockwise seen from north
      const band = new THREE.Mesh(
        new THREE.RingGeometry(RING_R - 4, RING_R + 4, 24, 1, i * seg + 0.004, seg - 0.008),
        new THREE.MeshBasicMaterial({ color: elementTint[sign.element], transparent: true, opacity: 0.11, side: THREE.DoubleSide, depthWrite: false }),
      );
      band.rotation.x = -Math.PI / 2;
      group.add(band);
      const mid = (i + 0.5) * seg;
      const glyph = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(sign.glyph, '#e6c987'), transparent: true, depthWrite: false }));
      glyph.position.set(Math.cos(mid) * RING_R, 0, -Math.sin(mid) * RING_R);
      glyph.scale.setScalar(5.2);
      group.add(glyph);
    });
    const pts: number[] = [];
    for (let d = 0; d < 360; d += 10) {
      const a = (d * Math.PI) / 180, inner = d % 30 === 0 ? RING_R - 4 : RING_R + 3;
      pts.push(Math.cos(a) * inner, 0, -Math.sin(a) * inner, Math.cos(a) * (RING_R + 4), 0, -Math.sin(a) * (RING_R + 4));
    }
    const ticks = new THREE.BufferGeometry();
    ticks.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    group.add(new THREE.LineSegments(ticks, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.55 })));
    for (const r of [RING_R - 4, RING_R + 4]) {
      const circle = new THREE.BufferGeometry().setFromPoints(
        Array.from({ length: 181 }, (_, k) => new THREE.Vector3(Math.cos((k / 180) * 2 * Math.PI) * r, 0, Math.sin((k / 180) * 2 * Math.PI) * r)));
      group.add(new THREE.Line(circle, new THREE.LineBasicMaterial({ color: GOLD, transparent: true, opacity: 0.5 })));
    }
    this.scene.add(group);
  }

  private buildBodies() {
    const loader = new THREE.TextureLoader();
    for (const id of ALL_IDS) {
      const lore = BODIES[id], vis = VISUALS[id];
      const group = new THREE.Group();
      let mesh: THREE.Mesh | undefined;
      let radius = 0.3;
      if (vis) {
        radius = vis.r;
        const geom = new THREE.SphereGeometry(vis.r, 48, 32);
        let mat: THREE.Material;
        if (id === 'sun') {
          mat = new THREE.MeshBasicMaterial({ map: sunTexture() });
          const glow = new THREE.Sprite(new THREE.SpriteMaterial({
            map: glowTexture('rgba(255,236,190,1)', 'rgba(255,170,60,0.45)'), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
          glow.scale.setScalar(vis.r * 7);
          group.add(glow);
        } else {
          const m = new THREE.MeshStandardMaterial({ roughness: 0.95, metalness: 0, color: 0xffffff });
          if (vis.image) {
            m.color.set(vis.color);
            loader.load(vis.image, (t) => { t.colorSpace = THREE.SRGBColorSpace; m.map = t; m.color.set(0xffffff); m.needsUpdate = true; });
          } else if (vis.surface) m.map = planetTexture(vis.surface);
          mat = m;
        }
        mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.order = 'ZYX';
        mesh.rotation.z = THREE.MathUtils.degToRad(vis.tilt ?? 0);
        group.add(mesh);
        if (id === 'saturn') {
          const inner = vis.r * 1.25, outer = vis.r * 2.3;
          const rg = new THREE.RingGeometry(inner, outer, 96, 1);
          const p = rg.attributes.position, uv = rg.attributes.uv;
          for (let i = 0; i < p.count; i++) uv.setXY(i, (Math.hypot(p.getX(i), p.getY(i)) - inner) / (outer - inner), 0.5);
          const ring = new THREE.Mesh(rg, new THREE.MeshBasicMaterial({ map: ringTexture(), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
          ring.rotation.x = -Math.PI / 2;
          const tiltG = new THREE.Group(); tiltG.rotation.z = mesh.rotation.z; tiltG.add(ring);
          group.add(tiltG);
        }
      } else {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(lore.glyph, '#d8c9f0'), transparent: true, depthWrite: false, opacity: 0.0 }));
        group.add(sp); // invisible anchor; the label carries the glyph
      }

      const el = document.createElement('button');
      el.className = `label kind-${lore.kind}${['sun', 'mercury', 'venus', 'earth', 'moon', 'mars'].includes(id) ? ' inner' : ''}`;
      el.innerHTML = `<span class="g">${lore.glyph}</span><span class="n">${lore.name}</span>`;
      el.addEventListener('click', (e) => { e.stopPropagation(); this.select(id); });
      const label = new CSS2DObject(el);
      label.center.set(0.5, 1);
      label.position.set(0, radius * 1.15 + 0.15, 0);
      if (!vis) { label.center.set(0.5, 0.5); label.position.set(0, 0, 0); }
      group.add(label);

      const obj: BodyObj = { id, group, mesh, radius, target: new THREE.Vector3(), from: new THREE.Vector3(), label, labelEl: el, spin: vis?.spin ?? 0 };
      if (id !== 'earth') {
        obj.ringMark = new THREE.Sprite(new THREE.SpriteMaterial({ map: glyphTexture(lore.glyph, '#f3e3b8'), transparent: true, depthWrite: false }));
        obj.ringMark.scale.setScalar(3);
        obj.ringMark.visible = false;
        this.scene.add(obj.ringMark);
      }
      if (vis && id !== 'moon') {
        const mat = new THREE.LineBasicMaterial({ color: vis.color, transparent: true, opacity: lore.kind === 'minor' ? 0.28 : 0.5, vertexColors: true });
        obj.path = new THREE.Line(new THREE.BufferGeometry(), mat);
        obj.path.frustumCulled = false;
        this.scene.add(obj.path);
      }
      this.scene.add(group);
      this.bodies.set(id, obj);
    }

    // Moon's orbit ring, carried with Earth
    const circle = new THREE.BufferGeometry().setFromPoints(
      Array.from({ length: 96 }, (_, k) => new THREE.Vector3(Math.cos((k / 96) * 2 * Math.PI) * MOON_DIST, 0, Math.sin((k / 96) * 2 * Math.PI) * MOON_DIST)));
    this.moonOrbit = new THREE.LineLoop(circle, new THREE.LineBasicMaterial({ color: 0xbdbdbd, transparent: true, opacity: 0.35 }));
    this.scene.add(this.moonOrbit);

    // Major moons: visual detail only
    const moonMat = (c: number) => new THREE.MeshStandardMaterial({ color: c, roughness: 1 });
    [0xd8c36a, 0xcfc4ad, 0x9c8f80, 0x6f665c].forEach((c, i) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry([0.13, 0.11, 0.17, 0.16][i], 16, 12), moonMat(c));
      this.moons.push(m); this.scene.add(m);
    });
    this.titan = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), moonMat(0xd9a45a));
    this.scene.add(this.titan);
  }

  private buildBelt() {
    const n = 2600, pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = 2.1 + Math.random() * 1.2 + (Math.random() - 0.5) * 0.3, th = Math.random() * 2 * Math.PI, r = scaleAU(a);
      pos.set([Math.cos(th) * r, (Math.random() - 0.5) * 1.6, Math.sin(th) * r], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.belt = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x9a8a72, size: 1.4, sizeAttenuation: false, transparent: true, opacity: 0.5, depthWrite: false }));
    this.scene.add(this.belt);
  }

  private attachPicking() {
    const dom = this.renderer.domElement;
    let down: { x: number; y: number } | null = null;
    dom.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
    dom.addEventListener('pointerup', (e) => {
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 6) return;
      const rect = dom.getBoundingClientRect();
      const ndc = new THREE.Vector2(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
      const ray = new THREE.Raycaster(); ray.setFromCamera(ndc, this.camera);
      let best: BodyId | null = null, bestD = Infinity;
      for (const b of this.bodies.values()) {
        const p = b.group.position, camD = p.distanceTo(this.camera.position);
        const hit = Math.max(b.radius * 1.25, camD * 0.016);
        if (ray.ray.distanceSqToPoint(p) < hit * hit && camD < bestD) { best = b.id; bestD = camD; }
      }
      if (best) this.select(best);
    });
  }

  // ---------- positions ----------

  private computeTargets(date: Date) {
    const earthH = helio('earth', date);
    const centre: Vec = this.mode === 'helio' ? [0, 0, 0] : earthH;
    const place = (h: Vec, out: THREE.Vector3) => {
      const rel: Vec = [h[0] - centre[0], h[1] - centre[1], h[2] - centre[2]];
      const d = Math.hypot(rel[0], rel[1], rel[2]);
      if (d < 1e-9) return out.set(0, 0, 0);
      return toScene(rel, out).multiplyScalar(scaleAU(d) / d);
    };
    const earthPos = place(earthH, new THREE.Vector3());
    for (const b of this.bodies.values()) {
      if (isPoint(b.id)) {
        const a = THREE.MathUtils.degToRad(geo(b.id, date).lon);
        b.target.set(Math.cos(a) * POINT_DIST, 0, -Math.sin(a) * POINT_DIST).add(earthPos);
      } else if (b.id === 'moon') {
        const m = helio('moon', date);
        toScene([m[0] - earthH[0], m[1] - earthH[1], m[2] - earthH[2]], b.target).normalize().multiplyScalar(MOON_DIST).add(earthPos);
      } else place(helio(b.id, date), b.target);
    }
  }

  private pathPoint(id: BodyId, date: Date, out: THREE.Vector3) {
    const h = helio(id, date, true);
    if (this.mode === 'geo') {
      const e = helio('earth', date);
      h[0] -= e[0]; h[1] -= e[1]; h[2] -= e[2];
    }
    const d = Math.hypot(h[0], h[1], h[2]);
    return d < 1e-9 ? out.set(0, 0, 0) : toScene(h, out).multiplyScalar(scaleAU(d) / d);
  }

  /** Helio: one full orbit. Geo: the recent apparent path, which shows retrograde loops. */
  private buildPaths(date: Date) {
    const v = new THREE.Vector3(), c = new THREE.Color();
    for (const b of this.bodies.values()) {
      if (!b.path) continue;
      const helioMode = this.mode === 'helio';
      b.path.visible = !(b.id === 'sun' && helioMode) && !(b.id === 'earth' && !helioMode);
      if (!b.path.visible) continue;
      const P = PERIOD_DAYS[b.id];
      const span = helioMode ? P : Math.min(Math.max(P, 365.25), 730);
      const n = helioMode ? (P > 20000 ? 160 : 220) : 260;
      const pos = new Float32Array((n + 1) * 3), col = new Float32Array((n + 1) * 3);
      for (let k = 0; k <= n; k++) {
        const f = k / n;
        // k = n is "now"; earlier samples trail behind
        this.pathPoint(b.id, new Date(date.getTime() - (1 - f) * span * DAY), v);
        pos.set([v.x, v.y, v.z], k * 3);
        const fade = helioMode ? 0.35 + 0.65 * f : Math.pow(f, 1.5);
        c.setRGB(fade, fade, fade);
        col.set([c.r, c.g, c.b], k * 3);
      }
      b.path.geometry.dispose();
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      g.setAttribute('color', new THREE.BufferAttribute(col, 3));
      b.path.geometry = g;
    }
    this.pathTime = date.getTime();
    this.pathBuiltAt = performance.now();
  }

  // ---------- public API ----------

  setMode(mode: Mode) {
    if (mode === this.mode) return;
    this.mode = mode;
    for (const b of this.bodies.values()) b.from.copy(b.group.position);
    this.transition = 0;
    this.lastPosTime = NaN;
    this.pathTime = NaN;
    this.belt.visible = mode === 'helio';
    for (const b of this.bodies.values()) if (b.ringMark) b.ringMark.visible = mode === 'geo';
  }

  select(id: BodyId | null) {
    this.selected = id;
    for (const b of this.bodies.values()) b.labelEl.classList.toggle('selected', b.id === id);
    if (id) {
      const b = this.bodies.get(id)!;
      const dist = this.camera.position.distanceTo(this.controls.target);
      this.fly = { t: 0, fromDist: dist, toDist: Math.max(b.radius * 7, 4.5) };
      this.controls.autoRotate = false;
      this.idleSince = performance.now();
    }
    this.onSelect(id);
  }

  /** Step back to the whole-system view. */
  home() {
    this.selected = null;
    for (const b of this.bodies.values()) b.labelEl.classList.remove('selected');
    this.fly = { t: 0, fromDist: this.camera.position.distanceTo(this.controls.target), toDist: 140 * Math.max(1, (this.host.clientHeight / this.host.clientWidth) * 0.95) };
  }

  update(date: Date, dt: number) {
    const t = date.getTime();
    const moving = this.transition < 1;
    if (isNaN(this.lastPosTime) || Math.abs(t - this.lastPosTime) > 400) {
      this.computeTargets(date);
      this.lastPosTime = t;
      this.updateSatellites(date);
    }
    if (moving) this.transition = Math.min(1, this.transition + dt / 1.4);
    const e = this.transition, ease = e * e * (3 - 2 * e);
    for (const b of this.bodies.values()) {
      if (moving) b.group.position.lerpVectors(b.from, b.target, ease); else b.group.position.copy(b.target);
      if (b.mesh) b.mesh.rotation.y += b.spin * dt;
      if (b.ringMark?.visible) {
        const p = b.group.position, earth = this.bodies.get('earth')!.group.position;
        const a = Math.atan2(-(p.z - earth.z), p.x - earth.x);
        b.ringMark.position.set(Math.cos(a) * (RING_R - 7), 0, -Math.sin(a) * (RING_R - 7));
      }
    }
    const sun = this.bodies.get('sun')!, earth = this.bodies.get('earth')!;
    const sunScale = this.mode === 'geo' ? 0.6 : 1;
    sun.group.scale.setScalar(THREE.MathUtils.lerp(sun.group.scale.x, sunScale, Math.min(1, dt * 3)));
    this.labels.domElement.classList.toggle('far', this.camera.position.distanceTo(this.controls.target) > 45);
    this.sunLight.position.copy(sun.group.position);
    this.moonOrbit.position.copy(earth.group.position);
    this.belt.rotation.y = ((t / DAY) / 1680) * 2 * Math.PI;
    // precession: the stars drift against the tropical zodiac by about 1.4 degrees a century
    this.sky.rotation.y = THREE.MathUtils.degToRad(1.3969713 * ((t / DAY + 2440587.5 - 2451545) / 36525));
    this.updateAspectLines();

    // paths: rebuild after a mode change, or when simulated time has moved far enough
    const drift = Math.abs(t - this.pathTime) / DAY;
    const limit = this.mode === 'geo' ? 2 : 3650;
    if (isNaN(this.pathTime) ? this.transition > 0.5 || !moving : drift > limit && performance.now() - this.pathBuiltAt > 250) this.buildPaths(date);
    for (const b of this.bodies.values()) if (b.path) (b.path.material as THREE.LineBasicMaterial).opacity = (BODIES[b.id].kind === 'minor' ? 0.28 : 0.5) * (isNaN(this.pathTime) ? 0.0 : 1);

    this.updateCamera(dt);
  }

  private updateSatellites(date: Date) {
    const jm = jupiterMoons(date), v = new THREE.Vector3();
    const jup = this.bodies.get('jupiter')!.target, sat = this.bodies.get('saturn')!.target;
    jm.forEach((m, i) => { this.moons[i].position.copy(toScene(m, v).normalize().multiplyScalar(2.7 + i * 0.6)).add(jup); });
    const a = ((date.getTime() / DAY) / 15.945) * 2 * Math.PI;
    this.titan.position.set(Math.cos(a) * 4.4, 0, -Math.sin(a) * 4.4).add(sat);
  }

  private updateCamera(dt: number) {
    const targetPos = this.selected ? this.bodies.get(this.selected)!.group.position : new THREE.Vector3();
    // follow: shift camera and target together so the framing is kept
    const delta = targetPos.clone().sub(this.controls.target);
    const k = this.fly ? Math.min(1, dt * 4) : this.selected ? 1 : Math.min(1, dt * 3);
    delta.multiplyScalar(k);
    this.controls.target.add(delta);
    this.camera.position.add(delta);
    if (this.fly) {
      this.fly.t = Math.min(1, this.fly.t + dt / 1.6);
      const e = this.fly.t, ease = e * e * (3 - 2 * e);
      const want = THREE.MathUtils.lerp(this.fly.fromDist, this.fly.toDist, ease);
      const off = this.camera.position.clone().sub(this.controls.target);
      this.camera.position.copy(this.controls.target).add(off.setLength(want));
      if (this.fly.t >= 1) this.fly = null;
    }
    if (!this.selected && !this.controls.autoRotate && performance.now() - this.idleSince > 30000) this.controls.autoRotate = true;
    this.controls.update();
  }

  /** Keep the focused body clear of an open panel: shift the picture by a fraction of the viewport. */
  setViewShift(xFrac: number, yFrac: number) {
    this.shift = { x: xFrac, y: yFrac };
    this.applyShift();
  }

  private applyShift() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (this.shift.x === 0 && this.shift.y === 0) this.camera.clearViewOffset();
    else this.camera.setViewOffset(w, h, w * this.shift.x, h * this.shift.y, w, h);
  }

  render() {
    this.renderer.render(this.scene, this.camera);
    this.labels.render(this.scene, this.camera);
  }

  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h); this.labels.setSize(w, h);
    this.applyShift();
  }
}
