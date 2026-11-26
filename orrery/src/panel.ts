import { geo, helio, speed, nextIngress, nextStation, moonInfo, isPoint, PERIOD_DAYS, type BodyId } from './ephemeris';
import { BODIES, SIGNS, ELEMENT_GLYPH, ELEMENT_QUALITIES, signOf, decanOf, formatDegree, dignity, type TarotCard } from './correspondences';

const AU_KM = 149597870.7;
const fmtDate = (d: Date) => d.toLocaleString(undefined, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const row = (k: string, v: string | undefined) => (v ? `<div class="row"><dt>${k}</dt><dd>${v}</dd></div>` : '');

// Card scans are optional: drop files into public/tarot/<slug>.jpg and they appear over the drawn card.
const scanState = new Map<string, 'pending' | 'ok' | 'missing'>();
function probeScan(slug: string, onReady: () => void) {
  if (scanState.has(slug)) return;
  scanState.set(slug, 'pending');
  const img = new Image();
  img.onload = () => { scanState.set(slug, img.naturalWidth > 0 ? 'ok' : 'missing'); onReady(); };
  img.onerror = () => scanState.set(slug, 'missing');
  img.src = `tarot/${slug}.jpg`;
}

function cardHtml(card: TarotCard, role: string, onReady: () => void): string {
  probeScan(card.slug, onReady);
  const scan = scanState.get(card.slug) === 'ok' ? `<img src="tarot/${card.slug}.jpg" alt="${card.title}">` : '';
  return `<figure class="card">
    <div class="card-face"><span class="num">${card.numeral}</span><span class="cg">${card.glyph}</span>
      <span class="ct">${card.title}</span>${card.subtitle ? `<span class="cs">${card.subtitle}</span>` : ''}${scan}</div>
    <figcaption>${role}</figcaption></figure>`;
}

function period(id: BodyId): string {
  const d = PERIOD_DAYS[id];
  return d < 800 ? `${d.toFixed(1)} days` : `${(d / 365.25).toFixed(1)} years`;
}

export class Panel {
  private id: BodyId | null = null;
  private cache: Record<string, string> = {};
  private events: { at: number; html: string } | null = null;
  private eventsTimer = 0;
  onClose: () => void = () => {};

  constructor(private el: HTMLElement) {}

  open(id: BodyId | null, date: Date) {
    this.id = id; this.cache = {}; this.events = null;
    clearTimeout(this.eventsTimer);
    this.el.hidden = !id;
    document.body.classList.toggle('panel-open', !!id);
    if (!id) return;
    const lore = BODIES[id];
    this.el.innerHTML = `
      <button class="close" aria-label="Close">×</button>
      <header><span class="big-glyph">${lore.glyph}</span><div><h2>${lore.name}</h2><p class="blurb">${lore.blurb}</p></div></header>
      <section data-s="position"></section>
      <section data-s="tarot"></section>
      <section data-s="alchemy"></section>
      <section data-s="lore"></section>
      <section data-s="astro"></section>
      <section data-s="events"></section>`;
    this.el.querySelector('.close')!.addEventListener('click', () => this.onClose());
    this.el.scrollTop = 0;
    this.refresh(date);
  }

  private set(section: string, html: string) {
    if (this.cache[section] === html) return;
    this.cache[section] = html;
    const s = this.el.querySelector(`[data-s="${section}"]`);
    if (s) s.innerHTML = html;
  }

  refresh(date: Date) {
    const id = this.id;
    if (!id) return;
    const lore = BODIES[id];
    const redraw = () => { delete this.cache.tarot; };

    if (id === 'earth') {
      const d = Math.hypot(...helio('earth', date));
      this.set('position', `<p class="note">Astrology is drawn from Earth’s point of view, so Earth itself holds no sign. Switch to the geocentric view to stand here and watch the sky turn.</p>`);
      this.set('lore', `<h3>Correspondences</h3><dl>${row('Element', `${ELEMENT_GLYPH.Earth} Earth — ${ELEMENT_QUALITIES.Earth}`)}${row('Sephirah', lore.sephirah)}${row('Deities', lore.deities)}</dl>`);
      this.set('astro', `<h3>Astronomy</h3><dl>${row('Distance from Sun', `${d.toFixed(4)} AU · ${(d * AU_KM / 1e6).toFixed(1)} million km`)}${row('Orbital period', period(id))}</dl>`);
      return;
    }

    const g = geo(id, date);
    const sign = signOf(g.lon), signIndex = SIGNS.indexOf(sign), decan = decanOf(g.lon);
    const v = speed(id, date);
    const retro = v < 0 && id !== 'node' && id !== 'snode';
    const dig = dignity(id, signIndex);

    this.set('position', `
      <div class="placement"><span class="sign-glyph">${sign.glyph}</span>
        <div><div class="deg">${formatDegree(g.lon)} <b>${sign.name}</b>${retro ? ' <span class="rx" title="Retrograde">℞</span>' : ''}</div>
        <div class="sub">${sign.modality} ${sign.element} · ${retro ? 'retrograde' : id === 'node' || id === 'snode' ? 'mean motion, always backward' : 'direct'} · ${Math.abs(v).toFixed(v > 2 || v < -2 ? 2 : 3)}°/day</div></div></div>
      ${dig ? `<p class="dignity">${dig}</p>` : ''}`);

    const cards = [
      lore.card ? cardHtml(lore.card, `${lore.name}`, redraw) : '',
      cardHtml(sign.card, `${sign.name}`, redraw),
      cardHtml(decan.card, `${decan.ordinal} decan`, redraw),
    ].join('');
    this.set('tarot', `<h3>Tarot</h3><div class="cards">${cards}</div>
      <p class="note">${decan.ordinal} decan of ${sign.name}, ruled by ${BODIES[decan.ruler].glyph} ${BODIES[decan.ruler].name}.${lore.cardNote ? ' ' + lore.cardNote : ''}${lore.card ? '' : ' No Golden Dawn trump is assigned to this body; the cards shown are those of its sign and decan.'}</p>`);

    this.set('alchemy', `<h3>Alchemy</h3><dl>
      ${row('Element', `<span class="el el-${sign.element}">${ELEMENT_GLYPH[sign.element]}</span> ${sign.element} — ${ELEMENT_QUALITIES[sign.element]}`)}
      ${row('Operation', `${sign.process} <i>(the work of ${sign.name})</i>`)}
      ${row('Metal', lore.metal)}${row('Principle', lore.principle)}
      ${row('Sign ruler', `${BODIES[sign.ruler].glyph} ${BODIES[sign.ruler].name}${sign.modernRuler ? ` · modern ${BODIES[sign.modernRuler].glyph} ${BODIES[sign.modernRuler].name}` : ''}`)}</dl>`);

    const loreRows = row('Day', lore.day) + row('Colour', lore.colour) + row('Sephirah', lore.sephirah) + row('Hebrew letter', lore.letter) + row('Deities', lore.deities);
    this.set('lore', loreRows ? `<h3>Correspondences</h3><dl>${loreRows}</dl>` : '');

    if (isPoint(id)) {
      this.set('astro', `<h3>Astronomy</h3><p class="note">A calculated point of the Moon’s orbit, not a physical body. Mean position; one circuit of the zodiac takes ${period(id)}.</p>`);
    } else {
      const hs = id === 'sun' ? 0 : Math.hypot(...helio(id, date));
      const lightMin = g.dist * 8.316746;
      let moonRows = '';
      if (id === 'moon') {
        const m = moonInfo(date);
        moonRows = row('Phase', `${m.name} · ${(m.illum * 100).toFixed(0)}% lit`) + row('Next New Moon', m.nextNew ? fmtDate(m.nextNew) : '') + row('Next Full Moon', m.nextFull ? fmtDate(m.nextFull) : '');
      }
      this.set('astro', `<h3>Astronomy</h3><dl>${moonRows}
        ${row('From Earth', id === 'moon' ? `${Math.round(g.dist * AU_KM).toLocaleString()} km` : `${g.dist.toFixed(3)} AU · ${(g.dist * AU_KM / 1e6).toFixed(1)} million km`)}
        ${id === 'sun' || id === 'moon' ? '' : row('From Sun', `${hs.toFixed(3)} AU`)}
        ${row('Light travel time', lightMin < 1 ? `${(lightMin * 60).toFixed(2)} s` : lightMin < 90 ? `${lightMin.toFixed(1)} min` : `${(lightMin / 60).toFixed(2)} h`)}
        ${row(id === 'sun' ? 'Zodiac circuit' : 'Orbital period', period(id))}</dl>`);
    }

    // Upcoming events take a moment to search for, so they are computed off the main path and cached.
    const t = date.getTime();
    if (!this.events || Math.abs(t - this.events.at) > 86400000) {
      if (!this.events) this.set('events', `<h3>Ahead</h3><p class="note">Searching the ephemeris…</p>`);
      this.events = { at: t, html: this.events?.html ?? '' };
      clearTimeout(this.eventsTimer);
      this.eventsTimer = window.setTimeout(() => {
        if (this.id !== id) return;
        const ing = nextIngress(id, date), st = nextStation(id, date);
        const html = `<h3>Ahead</h3><dl>
          ${ing ? row('Next sign change', `${SIGNS[ing.sign].glyph} ${SIGNS[ing.sign].name} · ${fmtDate(ing.date)}`) : ''}
          ${st ? row(st.retrograde ? 'Turns retrograde' : 'Turns direct', fmtDate(st.date)) : ''}</dl>`;
        this.events = { at: t, html };
        this.set('events', html);
      }, 60);
    }
  }
}
