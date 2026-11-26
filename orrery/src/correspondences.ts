// Golden Dawn correspondences: planets, signs, decans, tarot, alchemy.
import type { BodyId } from './ephemeris';

const T = '︎'; // force text (non-emoji) glyph rendering

export type Element = 'Fire' | 'Earth' | 'Air' | 'Water';
export const ELEMENT_GLYPH: Record<Element, string> = { Fire: '🜂', Earth: '🜃', Air: '🜁', Water: '🜄' };
export const ELEMENT_QUALITIES: Record<Element, string> = {
  Fire: 'hot & dry', Earth: 'cold & dry', Air: 'hot & moist', Water: 'cold & moist',
};
const SUIT: Record<Element, string> = { Fire: 'Wands', Water: 'Cups', Air: 'Swords', Earth: 'Pentacles' };

export interface TarotCard { slug: string; numeral: string; title: string; subtitle?: string; glyph: string; meaning: string }

export interface Sign {
  name: string; glyph: string; element: Element; modality: 'Cardinal' | 'Fixed' | 'Mutable';
  ruler: BodyId; modernRuler?: BodyId; exalt?: BodyId; process: string; card: TarotCard; letter: string;
}

const MAJOR_MEANINGS = [
  'Beginnings · a leap of faith · innocence', 'Will · skill · manifestation', 'Intuition · mystery · inner knowing',
  'Abundance · nurture · fertility', 'Authority · structure · order', 'Tradition · teaching · belief',
  'Union · choice · harmony', 'Drive · victory · self-mastery', 'Courage · patience · gentle power',
  'Solitude · search · inner light', 'Cycles · fate · a turning point', 'Balance · truth · consequence',
  'Surrender · pause · a new view', 'Ending · transformation · release', 'Blending · moderation · alchemy',
  'Bondage · appetite · shadow', 'Upheaval · revelation · breakthrough', 'Hope · renewal · guidance',
  'Dreams · illusion · the unconscious', 'Vitality · joy · clarity', 'Awakening · reckoning · rebirth',
  'Completion · wholeness · arrival',
];
const major = (n: number, numeral: string, title: string, glyph: string): TarotCard =>
  ({ slug: `major-${String(n).padStart(2, '0')}`, numeral, title, glyph, meaning: MAJOR_MEANINGS[n] });

export const SIGNS: Sign[] = [
  { name: 'Aries', glyph: '♈' + T, element: 'Fire', modality: 'Cardinal', ruler: 'mars', exalt: 'sun', process: 'Calcination', letter: 'Heh', card: major(4, 'IV', 'The Emperor', '♈' + T) },
  { name: 'Taurus', glyph: '♉' + T, element: 'Earth', modality: 'Fixed', ruler: 'venus', exalt: 'moon', process: 'Congelation', letter: 'Vav', card: major(5, 'V', 'The Hierophant', '♉' + T) },
  { name: 'Gemini', glyph: '♊' + T, element: 'Air', modality: 'Mutable', ruler: 'mercury', process: 'Fixation', letter: 'Zayin', card: major(6, 'VI', 'The Lovers', '♊' + T) },
  { name: 'Cancer', glyph: '♋' + T, element: 'Water', modality: 'Cardinal', ruler: 'moon', exalt: 'jupiter', process: 'Dissolution', letter: 'Cheth', card: major(7, 'VII', 'The Chariot', '♋' + T) },
  { name: 'Leo', glyph: '♌' + T, element: 'Fire', modality: 'Fixed', ruler: 'sun', process: 'Digestion', letter: 'Teth', card: major(8, 'VIII', 'Strength', '♌' + T) },
  { name: 'Virgo', glyph: '♍' + T, element: 'Earth', modality: 'Mutable', ruler: 'mercury', exalt: 'mercury', process: 'Distillation', letter: 'Yod', card: major(9, 'IX', 'The Hermit', '♍' + T) },
  { name: 'Libra', glyph: '♎' + T, element: 'Air', modality: 'Cardinal', ruler: 'venus', exalt: 'saturn', process: 'Sublimation', letter: 'Lamed', card: major(11, 'XI', 'Justice', '♎' + T) },
  { name: 'Scorpio', glyph: '♏' + T, element: 'Water', modality: 'Fixed', ruler: 'mars', modernRuler: 'pluto', process: 'Separation', letter: 'Nun', card: major(13, 'XIII', 'Death', '♏' + T) },
  { name: 'Sagittarius', glyph: '♐' + T, element: 'Fire', modality: 'Mutable', ruler: 'jupiter', process: 'Incineration', letter: 'Samekh', card: major(14, 'XIV', 'Temperance', '♐' + T) },
  { name: 'Capricorn', glyph: '♑' + T, element: 'Earth', modality: 'Cardinal', ruler: 'saturn', exalt: 'mars', process: 'Fermentation', letter: 'Ayin', card: major(15, 'XV', 'The Devil', '♑' + T) },
  { name: 'Aquarius', glyph: '♒' + T, element: 'Air', modality: 'Fixed', ruler: 'saturn', modernRuler: 'uranus', process: 'Multiplication', letter: 'Tzaddi', card: major(17, 'XVII', 'The Star', '♒' + T) },
  { name: 'Pisces', glyph: '♓' + T, element: 'Water', modality: 'Mutable', ruler: 'jupiter', modernRuler: 'neptune', exalt: 'venus', process: 'Projection', letter: 'Qoph', card: major(18, 'XVIII', 'The Moon', '♓' + T) },
];

export interface BodyLore {
  name: string; glyph: string; kind: 'luminary' | 'planet' | 'modern' | 'minor' | 'point' | 'earth';
  blurb: string;
  card?: TarotCard; cardNote?: string;
  metal?: string; principle?: string; day?: string; colour?: string;
  sephirah?: string; letter?: string; deities?: string;
}

export const BODIES: Record<BodyId, BodyLore> = {
  sun: { name: 'Sun', glyph: '☉', kind: 'luminary', blurb: 'The vital spirit, the self and its will.',
    card: major(19, 'XIX', 'The Sun', '☉'), metal: 'Gold', principle: 'Sulphur — the soul', day: 'Sunday', colour: 'Orange',
    sephirah: 'Tiphareth (6) — Beauty', letter: 'Resh', deities: 'Helios · Sol · Ra · Shamash' },
  moon: { name: 'Moon', glyph: '☽', kind: 'luminary', blurb: 'The reflecting soul: memory, tides and instinct.',
    card: major(2, 'II', 'The High Priestess', '☽'), metal: 'Silver', principle: 'Salt — the body', day: 'Monday', colour: 'Blue',
    sephirah: 'Yesod (9) — Foundation', letter: 'Gimel', deities: 'Selene · Luna · Khonsu · Sin' },
  mercury: { name: 'Mercury', glyph: '☿', kind: 'planet', blurb: 'Mind, speech and the messenger between worlds.',
    card: major(1, 'I', 'The Magician', '☿'), metal: 'Quicksilver', principle: 'Mercury — the spirit', day: 'Wednesday', colour: 'Yellow',
    sephirah: 'Hod (8) — Splendour', letter: 'Beth', deities: 'Hermes · Mercurius · Thoth · Nabu' },
  venus: { name: 'Venus', glyph: '♀' + T, kind: 'planet', blurb: 'Attraction, harmony and the pleasure of form.',
    card: major(3, 'III', 'The Empress', '♀' + T), metal: 'Copper', day: 'Friday', colour: 'Emerald green',
    sephirah: 'Netzach (7) — Victory', letter: 'Daleth', deities: 'Aphrodite · Venus · Hathor · Ishtar' },
  earth: { name: 'Earth', glyph: '🜨', kind: 'earth', blurb: 'The observer’s ground. Every sign in this orrery is measured from here.',
    sephirah: 'Malkuth (10) — Kingdom', deities: 'Gaia · Terra · Geb · Ki' },
  mars: { name: 'Mars', glyph: '♂' + T, kind: 'planet', blurb: 'Force, severance and the courage to act.',
    card: major(16, 'XVI', 'The Tower', '♂' + T), metal: 'Iron', day: 'Tuesday', colour: 'Scarlet',
    sephirah: 'Geburah (5) — Severity', letter: 'Peh', deities: 'Ares · Mars · Horus · Nergal' },
  jupiter: { name: 'Jupiter', glyph: '♃', kind: 'planet', blurb: 'Expansion, law, fortune and generosity.',
    card: major(10, 'X', 'Wheel of Fortune', '♃'), metal: 'Tin', day: 'Thursday', colour: 'Violet',
    sephirah: 'Chesed (4) — Mercy', letter: 'Kaph', deities: 'Zeus · Iuppiter · Amun · Marduk' },
  saturn: { name: 'Saturn', glyph: '♄', kind: 'planet', blurb: 'Limit, time, structure and the weight of matter.',
    card: major(21, 'XXI', 'The World', '♄'), metal: 'Lead', day: 'Saturday', colour: 'Indigo',
    sephirah: 'Binah (3) — Understanding', letter: 'Tau', deities: 'Kronos · Saturnus · Sobek · Ninurta' },
  uranus: { name: 'Uranus', glyph: '♅', kind: 'modern', blurb: 'Rupture, invention and sudden awakening.',
    card: major(0, '0', 'The Fool', '♅'), cardNote: 'Modern attribution (the Golden Dawn gave this card to elemental Air).', letter: 'Aleph', deities: 'Ouranos · Caelus' },
  neptune: { name: 'Neptune', glyph: '♆', kind: 'modern', blurb: 'Dissolution, dream and the boundless.',
    card: major(12, 'XII', 'The Hanged Man', '♆'), cardNote: 'Modern attribution (the Golden Dawn gave this card to elemental Water).', letter: 'Mem', deities: 'Poseidon · Neptunus' },
  pluto: { name: 'Pluto', glyph: '♇', kind: 'modern', blurb: 'Death, the underworld and regeneration.',
    card: major(20, 'XX', 'Judgement', '♇'), cardNote: 'Modern attribution (the Golden Dawn gave this card to elemental Fire).', letter: 'Shin', deities: 'Hades · Pluto · Osiris' },
  chiron: { name: 'Chiron', glyph: '⚷', kind: 'minor', blurb: 'The wounded healer; the bridge between Saturn and Uranus.', deities: 'Kheiron the centaur' },
  ceres: { name: 'Ceres', glyph: '⚳', kind: 'minor', blurb: 'Nurture, grain, loss and return.', deities: 'Demeter · Ceres' },
  pallas: { name: 'Pallas', glyph: '⚴', kind: 'minor', blurb: 'Strategy, craft and pattern-seeing wisdom.', deities: 'Pallas Athena · Minerva' },
  juno: { name: 'Juno', glyph: '⚵', kind: 'minor', blurb: 'Covenant, partnership and fidelity.', deities: 'Hera · Iuno' },
  vesta: { name: 'Vesta', glyph: '⚶', kind: 'minor', blurb: 'The hearth flame: devotion and focus.', deities: 'Hestia · Vesta' },
  node: { name: 'North Node', glyph: '☊', kind: 'point', blurb: 'Caput Draconis — the Dragon’s Head, where the Moon rises across the Sun’s path.' },
  snode: { name: 'South Node', glyph: '☋', kind: 'point', blurb: 'Cauda Draconis — the Dragon’s Tail, where the Moon descends.' },
  lilith: { name: 'Black Moon Lilith', glyph: '⚸', kind: 'point', blurb: 'The mean lunar apogee: the Moon’s farthest, empty focus.' },
};

const CHALDEAN: BodyId[] = ['mars', 'sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter'];
const MINOR_TITLES: Record<string, string[]> = {
  Wands: ['Dominion', 'Established Strength', 'Perfected Work', 'Strife', 'Victory', 'Valour', 'Swiftness', 'Great Strength', 'Oppression'],
  Cups: ['Love', 'Abundance', 'Blended Pleasure', 'Loss in Pleasure', 'Pleasure', 'Illusionary Success', 'Abandoned Success', 'Material Happiness', 'Perfected Success'],
  Swords: ['Peace Restored', 'Sorrow', 'Rest from Strife', 'Defeat', 'Earned Success', 'Unstable Effort', 'Shortened Force', 'Despair and Cruelty', 'Ruin'],
  Pentacles: ['Harmonious Change', 'Material Works', 'Earthly Power', 'Material Trouble', 'Material Success', 'Success Unfulfilled', 'Prudence', 'Material Gain', 'Wealth'],
};
const ROMAN = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
const SUIT_GLYPH: Record<string, string> = { Wands: '🜂', Cups: '🜄', Swords: '🜁', Pentacles: '🜃' };

export interface Decan { index: number; ordinal: string; ruler: BodyId; card: TarotCard }

export function decanOf(lon: number): Decan {
  const index = Math.floor(lon / 10) % 36;
  const sign = SIGNS[Math.floor(index / 3)];
  const within = index % 3;
  const base = sign.modality === 'Cardinal' ? 2 : sign.modality === 'Fixed' ? 5 : 8;
  const num = base + within;
  const suit = SUIT[sign.element];
  return {
    index, ordinal: ['First', 'Second', 'Third'][within], ruler: CHALDEAN[index % 7],
    card: {
      slug: `${suit.toLowerCase()}-${String(num).padStart(2, '0')}`, numeral: ROMAN[num],
      title: `${num} of ${suit}`, subtitle: `Lord of ${MINOR_TITLES[suit][num - 2]}`, glyph: SUIT_GLYPH[suit],
      meaning: `${MINOR_TITLES[suit][num - 2]} · ${sign.element} of ${sign.name} · ${['first', 'second', 'third'][within]} decan`,
    },
  };
}

export const signOf = (lon: number) => SIGNS[Math.floor((((lon % 360) + 360) % 360) / 30)];

export function formatDegree(lon: number): string {
  const within = (((lon % 360) + 360) % 360) % 30;
  let d = Math.floor(within), m = Math.floor((within - d) * 60);
  return `${d}°${String(m).padStart(2, '0')}′`;
}

/** Essential dignity of a body in a sign, if any. */
export function dignity(id: BodyId, signIndex: number): string | null {
  const s = SIGNS[signIndex], opp = SIGNS[(signIndex + 6) % 12];
  if (s.ruler === id || s.modernRuler === id) return 'Domicile — at home, at full strength';
  if (s.exalt === id) return 'Exaltation — honoured, elevated';
  if (opp.ruler === id || opp.modernRuler === id) return 'Detriment — away from home, strained';
  if (opp.exalt === id) return 'Fall — humbled, weakened';
  return null;
}
