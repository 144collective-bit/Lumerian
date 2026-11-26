// Procedural planet surfaces drawn on canvas (no external image downloads needed).
import * as THREE from 'three';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function noiseGrid(w: number, h: number, seed: number) {
  const r = rng(seed); const g = new Float32Array(w * h);
  for (let i = 0; i < g.length; i++) g[i] = r();
  return (x: number, y: number) => {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const at = (i: number, j: number) => g[(((j % h) + h) % h) * w + (((i % w) + w) % w)];
    return (at(x0, y0) * (1 - sx) + at(x0 + 1, y0) * sx) * (1 - sy) + (at(x0, y0 + 1) * (1 - sx) + at(x0 + 1, y0 + 1) * sx) * sy;
  };
}

function fbm(n: (x: number, y: number) => number, x: number, y: number, oct = 5) {
  let v = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { v += a * n(x * f, y * f); a *= 0.5; f *= 2; }
  return v;
}

type RGB = [number, number, number];
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
function ramp(stops: RGB[], t: number): RGB {
  t = Math.min(0.9999, Math.max(0, t)) * (stops.length - 1);
  const i = Math.floor(t); return mix(stops[i], stops[i + 1], t - i);
}

export interface SurfaceSpec { seed: number; palette: RGB[]; kind: 'rocky' | 'banded' | 'smooth'; bands?: number; turbulence?: number }

export function planetTexture(spec: SurfaceSpec): THREE.CanvasTexture {
  const W = 512, H = 256;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d')!; const img = ctx.createImageData(W, H);
  const n = noiseGrid(64, 64, spec.seed), n2 = noiseGrid(64, 64, spec.seed + 7);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      // wrap horizontally by sampling on a 64-wide repeating grid
      const u = (x / W) * 64, v = (y / H) * 32;
      let t: number;
      if (spec.kind === 'rocky') {
        t = fbm(n, u * 0.5, v * 0.5) * 0.8 + fbm(n2, u * 2, v * 2, 3) * 0.3;
      } else {
        const warp = (fbm(n, u * 0.25, v * 1.5, 4) - 0.5) * (spec.turbulence ?? 0.06);
        const lat = y / H + warp;
        t = fbm(n2, 3.3, lat * (spec.bands ?? 14), 4) * 0.85 + fbm(n, u * 0.5, v * 2, 3) * 0.15;
        if (spec.kind === 'smooth') t = 0.5 + (t - 0.5) * 0.35;
      }
      const [r, g, b] = ramp(spec.palette, (t - 0.25) * 2);
      const i = (y * W + x) * 4;
      img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = b; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = THREE.RepeatWrapping; tex.anisotropy = 4;
  return tex;
}

export function ringTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = 512; c.height = 8;
  const ctx = c.getContext('2d')!; const r = rng(99);
  for (let x = 0; x < 512; x++) {
    const t = x / 512;
    let a = 0.25 + 0.6 * r();
    if (t < 0.08) a *= 0.25;                 // faint inner C ring
    if (t > 0.58 && t < 0.64) a *= 0.04;     // Cassini division
    if (t > 0.97) a *= 0.2;
    const shade = 170 + 60 * r();
    ctx.fillStyle = `rgba(${shade + 20},${shade},${shade - 40},${a})`;
    ctx.fillRect(x, 0, 1, 8);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

export function glowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, inner); g.addColorStop(0.25, outer); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

export function sunTexture(): THREE.CanvasTexture {
  return planetTexture({ seed: 5, kind: 'rocky', palette: [[255, 140, 20], [255, 190, 60], [255, 235, 150], [255, 250, 220]] });
}

export function glyphTexture(text: string, color = '#c9a45c', size = 128): THREE.CanvasTexture {
  const c = document.createElement('canvas'); c.width = c.height = size;
  const ctx = c.getContext('2d')!;
  ctx.font = `${size * 0.7}px "Noto Sans Symbols 2","Noto Sans Symbols","Segoe UI Symbol","Apple Symbols","DejaVu Sans",serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color;
  ctx.fillText(text, size / 2, size / 2 + size * 0.04);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}
