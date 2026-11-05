'use strict';
/* ==========================================================================
   Club&Co — démo front-end (aucun backend : l'état vit dans le navigateur).
   Le bar et le DJ sont simulés ; l'espace pro permet de jouer leur rôle.
   ========================================================================== */

const STORE = 'clubco-demo-v1';
const PREP_DELAY = 6000;    // reçue -> en préparation (accéléré pour la démo)
const READY_DELAY = 24000;  // reçue -> prête
const TRACK_DUR = 150000;   // durée d'un titre "en cours"

const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 9);
const euro = n => (Math.round(n * 100) / 100).toFixed(2).replace('.', ',') + ' €';
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const hhmm = t => new Date(t).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const ago = t => { const m = Math.round((now() - t) / 60000); return m < 1 ? "à l'instant" : m < 60 ? `il y a ${m} min` : `il y a ${Math.floor(m / 60)} h`; };
const me = () => (S.user && S.user.name) || 'Client';
const pick = a => a[Math.floor(Math.random() * a.length)];

/* ---------- Données ---------- */
const CLUB = {
  name: 'Nébula', area: 'Paris 11e', event: 'Midnight Pulse', closes: '06:00', dj: 'NOVA',
  bars: { main: { name: 'Bar principal', wait: 2 }, roof: { name: 'Bar Rooftop', wait: 4 } },
  lineup: [
    { t: '23:00', n: 'Léa K', s: 'Warm-up house' },
    { t: '01:00', n: 'NOVA', s: 'Techno mélodique', now: true },
    { t: '03:30', n: 'NOVA b2b Kito', s: 'Closing jusqu’à 6h' },
  ],
};

const CATS = [
  { id: 'cocktails', name: 'Cocktails' }, { id: 'beers', name: 'Bières' }, { id: 'shots', name: 'Shots' },
  { id: 'softs', name: 'Softs' }, { id: 'bottles', name: 'Bouteilles' },
];

const MENU = [
  { id: 'c1', cat: 'cocktails', name: 'Néon Mojito', desc: 'Rhum blanc, citron vert, menthe fraîche, sirop de yuzu', price: 12, emoji: '🍸', h: 85, tag: 'Signature', premium: true, ice: true },
  { id: 'c2', cat: 'cocktails', name: 'Espresso Martini', desc: 'Vodka, liqueur de café, espresso serré', price: 13, emoji: '☕', h: 28, tag: 'Populaire', premium: true },
  { id: 'c3', cat: 'cocktails', name: 'Passion Star', desc: 'Vodka vanille, fruit de la passion, bulles à côté', price: 13, emoji: '🥂', h: 45, premium: true },
  { id: 'c4', cat: 'cocktails', name: 'Spritz Nébula', desc: 'Bitter orange, prosecco, soda, orange sanguine', price: 11, emoji: '🍹', h: 12, ice: true },
  { id: 'c5', cat: 'cocktails', name: 'Moscow Mule', desc: 'Vodka, ginger beer, citron vert', price: 12, emoji: '🫚', h: 150, premium: true, ice: true },
  { id: 'c6', cat: 'cocktails', name: 'Gin Tonic', desc: 'Gin, tonic premium, concombre & poivre rose', price: 11, emoji: '🧊', h: 190, premium: true, ice: true },
  { id: 'b1', cat: 'beers', name: 'Pression 25cl', desc: 'Blonde de la maison, bien fraîche', price: 6, emoji: '🍺', h: 42 },
  { id: 'b2', cat: 'beers', name: 'Pinte 50cl', desc: 'Blonde de la maison', price: 10, emoji: '🍺', h: 38, tag: 'Populaire' },
  { id: 'b3', cat: 'beers', name: 'Blonde mexicaine', desc: '33cl, quartier de citron vert', price: 8, emoji: '🍋', h: 58 },
  { id: 's1', cat: 'shots', name: 'Tequila', desc: 'Sel & citron', price: 6, emoji: '🥃', h: 60 },
  { id: 's2', cat: 'shots', name: 'Liqueur aux herbes', desc: 'Servie glacée', price: 6, emoji: '🌿', h: 110 },
  { id: 's3', cat: 'shots', name: 'Tournée x6', desc: '6 shooters maison à partager avec ta team', price: 30, emoji: '🔥', h: 5, tag: 'Groupe' },
  { id: 'f4', cat: 'softs', name: 'Eau 50cl', desc: 'Plate ou gazeuse — offerte, hydrate-toi', price: 0, emoji: '💧', h: 200, tag: 'Offerte', soft: true },
  { id: 'f1', cat: 'softs', name: 'Virgin Mule', desc: 'Ginger beer, citron vert, menthe — 0% alcool', price: 8, emoji: '🌱', h: 130, soft: true, ice: true },
  { id: 'f2', cat: 'softs', name: 'Energy drink', desc: '25cl', price: 6, emoji: '⚡', h: 225, soft: true },
  { id: 'f3', cat: 'softs', name: 'Cola', desc: '33cl', price: 5, emoji: '🥤', h: 355, soft: true, ice: true },
  { id: 'v1', cat: 'bottles', name: 'Champagne Brut', desc: '75cl, servi en seau directement à ta table', price: 140, emoji: '🍾', h: 48, table: true },
  { id: 'v2', cat: 'bottles', name: 'Vodka Premium', desc: '70cl + 6 softs, servie à ta table', price: 180, emoji: '💎', h: 265, table: true, tag: 'VIP' },
  { id: 'v3', cat: 'bottles', name: 'Gin Premium', desc: '70cl + 6 tonics, servi à ta table', price: 170, emoji: '🫧', h: 172, table: true },
];
const byId = id => MENU.find(m => m.id === id);

const TRACKS = [
  ['Losing It', 'FISHER', 'Tech house'], ['Cola', 'CamelPhat & Elderbrook', 'House'], ['Innerbloom', 'RÜFÜS DU SOL', 'Mélodique'],
  ['Strobe', 'deadmau5', 'Progressive'], ['Rumble', 'Skrillex, Fred again.. & Flowdan', 'Bass'], ['Turn On The Lights again..', 'Fred again.. & Swedish House Mafia', 'House'],
  ['One More Time', 'Daft Punk', 'French touch'], ['Get Lucky', 'Daft Punk', 'Disco'], ['Alors on danse', 'Stromae', 'Électro'],
  ['Djadja', 'Aya Nakamura', 'Afropop'], ['Pookie', 'Aya Nakamura', 'Afropop'], ['Freed From Desire', 'Gala', 'Eurodance'],
  ['Blue (Da Ba Dee)', 'Eiffel 65', 'Eurodance'], ['Levels', 'Avicii', 'EDM'], ['Titanium', 'David Guetta ft. Sia', 'EDM'],
  ['Houdini', 'Dua Lipa', 'Pop'], ['Padam Padam', 'Kylie Minogue', 'Pop'], ['Espresso', 'Sabrina Carpenter', 'Pop'],
  ['Mr. Brightside', 'The Killers', 'Rock'], ['Gasolina', 'Daddy Yankee', 'Reggaeton'], ['Tití Me Preguntó', 'Bad Bunny', 'Reggaeton'],
  ['Sweet Dreams', 'Eurythmics', 'Classique'], ['Music Sounds Better With You', 'Stardust', 'French touch'], ['Lady (Hear Me Tonight)', 'Modjo', 'French touch'],
  ['Show Me Love', 'Robin S', 'House'], ['Sandstorm', 'Darude', 'Trance'], ['Children', 'Robert Miles', 'Trance'],
  ['Pjanoo', 'Eric Prydz', 'House'], ['Sweet Disposition', 'The Temper Trap', 'Indie'], ['Tout va bien', 'Alonzo, Ninho & Naps', 'Rap FR'],
].map(([t, a, g], i) => ({ id: 't' + i, t, a, g }));

const NOW_PLAYING = [
  { t: 'Innerbloom (NOVA edit)', a: 'RÜFÜS DU SOL' }, { t: 'Pjanoo', a: 'Eric Prydz' },
  { t: 'Cola', a: 'CamelPhat & Elderbrook' }, { t: 'Strobe', a: 'deadmau5' },
];

const DECLINE_REASONS = ['Pas le style du set', 'Déjà joué ce soir', 'Plutôt pour le closing', 'Pas dans ma bibliothèque'];

function seed() {
  const t = now();
  return {
    v: 3, user: null, account: null, checkedIn: null, proUser: null, wallet: true, cards: [{ id: 'c4242', brand: 'VISA', last4: '4242', exp: '08/28' }],
    outings: [
      { id: 'o1', club: 'Nébula', event: 'Techno Thursday', date: 'jeu. 29 oct.', spent: 35, songs: 2, coat: true, ticket: 'Shotgun', orders: [{ code: 'K21', time: '00:42', lines: '2× Pinte 50cl', total: 20 }, { code: 'P37', time: '02:10', lines: '1× Néon Mojito · 1× Eau 50cl', total: 12 }] },
      { id: 'o2', club: 'Le Hangar 9', event: 'Afro Nights', date: 'sam. 17 oct.', spent: 30, songs: 1, coat: false, ticket: 'Entrée sur place', orders: [{ code: 'A12', time: '01:15', lines: '1× Tournée x6', total: 30 }] },
    ],
    tab: 'home', screen: null, cat: 'cocktails', bar: 'main', pay: 'wallet',
    cart: [], tip: 0, orders: [], points: 40, coat: null, pro: null, budget: null, extras: [], ticket: null, barPaused: false, djHide: false, battWarned: false,
    notifs: [], takeover: null, notifOn: false, entryAt: t - 47 * 60000, np: { start: t - 40000 }, npOverride: null,
    requests: [
      { id: 'r1', t: 'Freed From Desire', a: 'Gala', by: 'Tom', votes: 23, status: 'pending', boost: true, at: t - 9 * 60000 },
      { id: 'r2', t: 'Losing It', a: 'FISHER', by: 'Inès', votes: 17, status: 'accepted', at: t - 18 * 60000 },
      { id: 'r3', t: 'Alors on danse', a: 'Stromae', by: 'Yanis', votes: 11, status: 'pending', at: t - 6 * 60000 },
      { id: 'r4', t: 'Djadja', a: 'Aya Nakamura', by: 'Sarah', votes: 8, status: 'pending', at: t - 4 * 60000, msg: 'Pour l’anniv de Clara 🎂' },
      { id: 'r5', t: 'Music Sounds Better With You', a: 'Stardust', by: 'Hugo', votes: 5, status: 'pending', at: t - 2 * 60000 },
      { id: 'r6', t: 'Mr. Brightside', a: 'The Killers', by: 'Léo', votes: 3, status: 'declined', reason: 'Plutôt pour le closing', at: t - 30 * 60000 },
    ].map(r => ({ mine: false, voted: false, ...r })),
    fakeOrders: [
      { id: 'f1', code: 'B12', who: 'Hugo', lines: [{ name: 'Pinte 50cl', qty: 2 }, { name: 'Tequila', qty: 2 }], bar: 'main', status: 'preparing', at: t - 3 * 60000 },
      { id: 'f2', code: 'K07', who: 'Inès', lines: [{ name: 'Espresso Martini', qty: 1 }, { name: 'Néon Mojito', qty: 1 }], bar: 'main', status: 'received', at: t - 60000 },
      { id: 'f3', code: 'T44', who: 'Table 4', lines: [{ name: 'Champagne Brut', qty: 1 }], bar: 'main', status: 'received', at: t - 30000, table: '4' },
      { id: 'f4', code: 'M31', who: 'Sami', lines: [{ name: 'Gin Tonic', qty: 3 }], bar: 'roof', status: 'ready', at: t - 5 * 60000 },
    ],
    fakeCoats: [
      { id: 'k1', num: 118, initials: 'HB', desc: 'Veste en jean', items: 1, status: 'stored' },
      { id: 'k2', num: 131, initials: 'IM', desc: 'Manteau camel + écharpe', items: 2, status: 'fetching' },
      { id: 'k3', num: 142, initials: 'SR', desc: 'Doudoune noire', items: 1, status: 'paid' },
      { id: 'k4', num: 97, initials: 'LT', desc: 'Blouson cuir marron', items: 1, status: 'stored' },
    ],
  };
}

let S = load();
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE));
    if (raw && raw.v === 3) return { ...seed(), ...raw, takeover: null };
  } catch (e) { /* stockage indisponible */ }
  return seed();
}
function save() { try { localStorage.setItem(STORE, JSON.stringify(S)); } catch (e) { /* ignore */ } }

/* ---------- Icônes ---------- */
const P = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  glass: '<path d="M5 4h14l-7 8z"/><path d="M12 12v8M8 20h8"/>',
  music: '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>', check: '<path d="M20 6 9 17l-5-5"/>', x: '<path d="M18 6 6 18M6 6l12 12"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  hanger: '<path d="M10 6a2 2 0 1 1 2 2c-.6 0-1 .4-1 1v1"/><path d="m11 10 9.2 6.4c.9.6.4 2-.6 2H3.4c-1 0-1.5-1.4-.6-2z"/>',
  ticket: '<path d="M2 9a3 3 0 0 0 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 0 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2M13 17v2M13 11v2"/>',
  back: '<path d="m15 18-6-6 6-6"/>', chev: '<path d="m9 18 6-6-6-6"/>',
  car: '<path d="M5 17h14M6 17v2M18 17v2M3 13l2-6h14l2 6v4H3z"/><path d="M7 13h.01M17 13h.01"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
  star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
  send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  users: '<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0M16 4a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3"/>',
  card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
  drop: '<path d="M12 2.7s-7 7.3-7 12.3a7 7 0 0 0 14 0c0-5-7-12.3-7-12.3z"/>',
  pin: '<path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
  refresh: '<path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/>',
  qr: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM21 14v.01M14 21h.01M17 21h4v-4"/>',
  headphones: '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z"/>',
  wallet: '<path d="M19 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0 0 4h14a2 2 0 0 1 2 2v4h-4a2 2 0 0 0 0 4h4v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5"/>',
  share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  wave: '<path d="M2 12h2M6 8v8M10 4v16M14 7v10M18 10v4M22 12h0"/>',
};
const ic = (n, s = 20, extra = '') => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${P[n]}</svg>`;

/* QR de démonstration (déterministe, décoratif) */
function qr(seedStr) {
  let h = 2166136261;
  for (const c of seedStr) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const n = 25, inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  let d = '';
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rnd() < .48) d += `M${x} ${y}h1v1h-1z`;
  const f = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" fill="#fff"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
  return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" fill="#0a0a0a"><path d="${d}"/>${f(0, 0)}${f(n - 7, 0)}${f(0, n - 7)}</svg>`;
}

/* ---------- Calculs ---------- */
const payOk = () => (S.pay === 'wallet' && S.wallet) || S.cards.some(c => c.id === S.pay);
const cartCount = () => S.cart.reduce((a, l) => a + l.qty, 0);
const cartSub = () => S.cart.reduce((a, l) => a + l.qty * l.unit, 0);
const tipAmt = () => Math.round(cartSub() * S.tip) / 100;
const spent = () => S.orders.reduce((a, o) => a + o.total, 0) + S.extras.reduce((a, e) => a + e.amount, 0);
const activeOrders = () => S.orders.filter(o => !['picked', 'cancelled'].includes(o.status));
const myPending = () => S.requests.filter(r => r.mine && r.status === 'pending');
const unread = () => S.notifs.filter(n => !n.read).length;
const alcoholCount = () => S.orders.reduce((a, o) => a + o.lines.reduce((b, l) => b + (l.alcohol ? l.qty : 0), 0), 0);
const lastWaterIdx = () => S.orders.findIndex(o => o.lines.some(l => l.id === 'f4'));
const drinksSinceWater = () => {
  const i = lastWaterIdx(); const list = i === -1 ? S.orders : S.orders.slice(0, i);
  return list.reduce((a, o) => a + o.lines.reduce((b, l) => b + (l.alcohol ? l.qty : 0), 0), 0);
};
const pickupLabel = o => o.table ? `Servi à la table ${esc(o.table)}` : CLUB.bars[o.bar].name;
const STATUS = {
  received: { t: 'Commande reçue', s: 'Le bar a bien reçu ta commande', n: 1 },
  preparing: { t: 'En préparation', s: 'Ton barman s’en occupe', n: 2 },
  ready: { t: 'C’est prêt !', s: 'Présente ton code au comptoir', n: 3 },
  picked: { t: 'Récupérée', s: 'Bonne soirée 🥂', n: 4 },
  cancelled: { t: 'Annulée', s: 'Remboursée', n: 0 },
};
function currentTrack() {
  const t = now();
  if (S.npOverride && t - S.npOverride.start < TRACK_DUR) return { ...S.npOverride, p: (t - S.npOverride.start) / TRACK_DUR };
  const base = S.npOverride ? S.npOverride.start + TRACK_DUR : S.np.start;
  const el = Math.max(0, t - base), i = Math.floor(el / TRACK_DUR) % NOW_PLAYING.length;
  const tr = { ...NOW_PLAYING[i], p: (el % TRACK_DUR) / TRACK_DUR };
  return S.djHide ? { ...tr, t: 'ID — titre secret 🤫', a: 'Le DJ garde ce morceau pour lui' } : tr;
}
const BANNED = ['connard', 'connasse', 'pute', 'salope', 'encul', 'nique', 'fdp', 'batard', 'bâtard'];
const clean = m => BANNED.reduce((a, w) => a.replace(new RegExp(w + '\\w*', 'gi'), '***'), m);
const trackHue = s => [...s].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
const initials = s => s.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, '').split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '♪';

/* ---------- Son & notifications ---------- */
let audio = null;
function chime(soft) {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    const notes = soft ? [523.25] : [659.25, 987.77, 1318.5];
    notes.forEach((f, i) => {
      const o = audio.createOscillator(), g = audio.createGain(), t0 = audio.currentTime + i * .11;
      o.type = 'sine'; o.frequency.value = f; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(.18, t0 + .02); g.gain.exponentialRampToValueAtTime(.001, t0 + .5);
      o.start(t0); o.stop(t0 + .55);
    });
  } catch (e) { /* audio indisponible */ }
}
let battery = null;
if (navigator.getBattery) navigator.getBattery().then(b => {
  battery = b;
  const onChange = () => {
    if (S.user && b.level <= .2 && !b.charging && !S.battWarned) { S.battWarned = true; notify('Batterie faible 🔋', 'Ta fiche de secours (vestiaire, commandes) est dans Ma soirée', { go: 'night', soft: true }); save(); }
    render();
  };
  b.addEventListener('levelchange', onChange); b.addEventListener('chargingchange', onChange); onChange();
}).catch(() => {});
window.addEventListener('online', () => render());
window.addEventListener('offline', () => render());
let swReg = null;
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').then(r => { swReg = r; }).catch(() => {});

function notify(title, body, opts = {}) {
  const n = { id: uid(), title, body, at: now(), go: opts.go || null, read: false };
  S.notifs.unshift(n); S.notifs = S.notifs.slice(0, 40);
  toast(n);
  chime(opts.soft);
  if (navigator.vibrate) navigator.vibrate(opts.soft ? 60 : [140, 70, 140]);
  if (S.notifOn && 'Notification' in window && Notification.permission === 'granted' && document.visibilityState !== 'visible') {
    const o = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: n.id };
    try { swReg ? swReg.showNotification(title, o) : new Notification(title, o); } catch (e) { /* ignore */ }
  }
}
function toast(n) {
  const el = document.createElement('button');
  el.className = 'toast';
  el.innerHTML = `<span class="app-ico">&amp;</span><span class="grow"><b>${esc(n.title)}</b><p>${esc(n.body)}</p></span><span class="xs dim">maint.</span>`;
  el.onclick = () => { n.read = true; if (n.go) go(n.go); el.remove(); };
  $('#toasts').prepend(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 400); }, 5200);
}
function flash(msg) { toast({ title: msg, body: '', go: null }); }
async function askNotif() {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'default') { try { await Notification.requestPermission(); } catch (e) { /* ignore */ } }
  S.notifOn = Notification.permission === 'granted';
  save();
  return S.notifOn;
}

/* ---------- Logique métier ---------- */
function setOrderStatus(o, status) {
  if (o.status === status) return;
  o.status = status;
  if (S.orders.includes(o)) {
    if (status === 'preparing') notify('Commande en préparation', `${o.code} · ton barman est dessus`, { go: 'order:' + o.id, soft: true });
    if (status === 'ready') {
      o.readyTime = now();
      notify('Ta commande est prête 🍸', `Code ${o.code} · ${o.table ? 'en route vers ta table' : CLUB.bars[o.bar].name}`, { go: 'order:' + o.id });
      if (!S.pro) S.takeover = { type: 'order', id: o.id };
    }
  }
}
function setReq(r, status, reason) {
  r.status = status; r.reason = reason || null; r.manual = true;
  if (status === 'accepted') {
    r.playAt = now() + 35000;
    if (r.mine) notify(`🎧 ${CLUB.dj} a accepté ton son`, `${r.t} — ${r.a} passe dans quelques minutes`, { go: 'music' });
  }
  if (status === 'declined' && r.mine) notify('Demande non retenue', `${r.t} · « ${reason} »${r.boost ? ' — boost remboursé' : ''}`, { go: 'music', soft: true });
  if (status === 'declined' && r.mine && r.boost) S.extras = S.extras.filter(e => e.ref !== r.id);
  if (status === 'played') {
    S.npOverride = { t: r.t, a: r.a, by: r.by, start: now() };
    if (r.mine) { notify('🔊 C’est ton son !', `${r.t} passe maintenant. Fonce sur la piste.`, { go: 'music' }); if (!S.pro) S.takeover = { type: 'song', id: r.id }; }
  }
}
function setCoat(c, st) {
  c.status = st;
  if (st === 'stored') c.storedAt = now();
  if (c !== S.coat) return;
  if (st === 'stored') notify('Affaires déposées 🧥', `#${c.num} · ${c.initials} — retiens ce numéro et tes initiales`, { go: 'night', soft: true });
  if (st === 'ready') notify('Ton vestiaire est prêt 🧥', `#${c.num} · ${c.initials} — tes affaires t’attendent au comptoir`, { go: 'night' });
}
function genCode() {
  const L = 'ABCDEFHKMNPRTVXZ'; let c;
  do { c = pick([...L]) + String(Math.floor(Math.random() * 90) + 10); } while (S.orders.some(o => o.code === c));
  return c;
}

let liveVoteAt = now();
function tick() {
  const t = now(); let changed = false;
  for (const o of S.orders) {
    if (o.status === 'ready' && !o.reminded && o.readyTime && t - o.readyTime > 120000) {
      o.reminded = true; changed = true;
      notify('Ta commande t’attend toujours 🍸', `${o.code} · ${o.table ? 'table ' + o.table : CLUB.bars[o.bar].name} — on la garde au frais`, { go: 'order:' + o.id });
    }
    if (o.manual || ['picked', 'ready', 'cancelled'].includes(o.status)) continue;
    if (o.status === 'received' && t >= o.prepAt) { setOrderStatus(o, 'preparing'); changed = true; }
    if (o.status === 'preparing' && t >= o.readyAt) { setOrderStatus(o, 'ready'); changed = true; }
  }
  for (const r of S.requests) {
    if (r.mine && !r.manual && r.status === 'pending' && t >= r.respondAt) {
      if (r.boost || Math.random() < .75) setReq(r, 'accepted'); else setReq(r, 'declined', pick(DECLINE_REASONS));
      changed = true;
    }
    if (r.status === 'accepted' && r.playAt && t >= r.playAt) { setReq(r, 'played'); changed = true; }
  }
  if (S.coat && S.coat.status === 'fetching' && t >= S.coat.readyAt) {
    setCoat(S.coat, 'ready'); changed = true;
  }
  // La salle vote en direct
  if (t - liveVoteAt > 7000 && S.tab === 'music' && !S.screen) {
    liveVoteAt = t;
    const pool = S.requests.filter(r => r.status === 'pending' || (r.mine && r.status === 'accepted'));
    if (pool.length) { pick(pool).votes++; changed = true; }
  }
  if (changed) { save(); render(); }
  updateLive();
}
function updateLive() {
  const tr = currentTrack();
  $$('[data-np-p]').forEach(el => { el.style.width = (tr.p * 100).toFixed(1) + '%'; });
  $$('[data-np-t]').forEach(el => { if (el.textContent !== tr.t) el.textContent = tr.t; });
  $$('[data-np-a]').forEach(el => { if (el.textContent !== tr.a) el.textContent = tr.a; });
  $$('[data-eta]').forEach(el => {
    const s = Math.max(0, Math.ceil((+el.dataset.eta - now()) / 1000));
    el.textContent = s > 0 ? `≈ ${s} s` : 'd’une seconde à l’autre';
  });
}

/* ---------- Vues : client ---------- */
const bell = () => `<button class="icon-btn" data-a="notifs" aria-label="Notifications">${ic('bell')}${unread() ? '<i class="dot"></i>' : ''}</button>`;
const topbar = (title, sub) => `<header class="topbar"><div><p class="eyebrow">${sub}</p><h1 class="h1">${title}</h1></div><div class="row" style="gap:8px">${bell()}${avatarBtn()}</div></header>`;


function orderLive(o) {
  const st = STATUS[o.status];
  return `<button class="order-live st-${o.status}" data-a="openOrder" data-id="${o.id}">
    <span class="ol-code">${o.code}</span>
    <span class="grow"><span class="ol-title">${st.t}</span><span class="muted small" style="display:block">${pickupLabel(o)} · ${o.lines.reduce((a, l) => a + l.qty, 0)} article(s)</span>
      <span class="mini-steps">${[1, 2, 3].map(i => `<i class="${st.n >= i ? 'on' : ''}"></i>`).join('')}</span></span>
    ${ic('chev')}
  </button>`;
}


function vOnboarding() {
  return `<div class="onb fade-in">
    <div class="logo-big">Club<span>&amp;</span><br>Co</div>
    <p class="tagline"><b>La nuit, sans la file.</b><br>Commande, paie, danse. On te prévient.</p>
    <ul class="onb-feats">
      <li><span class="fi">${ic('glass')}</span>Commande & paie depuis la piste</li>
      <li><span class="fi">${ic('bell')}</span>Notifié dès que ton verre est prêt</li>
      <li><span class="fi">${ic('music')}</span>Propose tes sons au DJ en direct</li>
    </ul>
    <p class="opt-label" style="margin-top:0">Crée ton compte</p>
    <input id="onb-name" class="field" placeholder="Prénom" autocomplete="given-name" maxlength="20">
    <input id="onb-email" class="field" style="margin-top:8px" type="email" placeholder="E-mail (pour retrouver tes billets)" autocomplete="email" maxlength="60">
    <label class="check"><input type="checkbox" id="onb-age"><span>J’ai 18 ans ou plus — l’alcool n’est pas vendu aux mineurs</span></label>
    <button class="btn lime block" style="margin-top:14px" data-a="enter">Créer mon compte ${ic('chev', 18)}</button>
    <button class="pro-link" data-a="proLogin">${ic('lock', 13)} Je suis un club · Espace pro</button>
  </div>`;
}

const avatarBtn = () => `<button class="icon-btn avatar-btn" data-a="account" aria-label="Mon compte">${esc(me()[0].toUpperCase())}</button>`;

function vLobby() {
  const last = S.outings[0];
  return `<header class="topbar"><div class="brand">Club<span>&amp;</span>Co</div>${avatarBtn()}</header>
  <div class="fade-in">
    <p class="eyebrow">Salut ${esc(me())} 👋</p>
    <h1 class="h1" style="font-size:34px;margin-top:6px">Prêt·e pour<br>ce soir ?</h1>
    <button class="scan-cta" data-a="scan">
      <span class="scan-ico">${ic('qr', 32)}</span>
      <span class="grow"><b>Scanner le QR du club</b><span>À l’entrée, scanne le QR affiché pour débloquer ta soirée</span></span>
      ${ic('chev', 22)}
    </button>
    <button class="action" style="margin-top:10px" data-a="ticketLink"><span class="ai lime">${ic('ticket')}</span><span class="grow"><b>Lier mon billet Shotgun</b><span class="xs muted" style="display:block">Billet pris sur Shotgun ? On le retrouve avec ton e-mail</span></span><span class="chev">${ic('chev')}</span></button>
    <div class="section"><p class="eyebrow" style="margin-bottom:10px">Débloqué une fois dans le club</p>
      <div class="locked">${[['glass', 'Commander au bar'], ['music', 'Proposer des sons'], ['hanger', 'Vestiaire'], ['clock', 'Suivi des commandes']].map(([i, t]) => `<div class="lk">${ic(i, 18)}<span class="grow">${t}</span>${ic('lock', 13)}</div>`).join('')}</div></div>
    <div class="section quick">
      <button class="tile" data-a="outings"><span class="ti">${ic('moon', 22)}</span><span><b>Mes sorties</b><span>${S.outings.length} soirée${S.outings.length > 1 ? 's' : ''}${last ? ' · ' + esc(last.club) : ''}</span></span></button>
      <button class="tile" data-a="account"><span class="ti">${ic('user', 22)}</span><span><b>Mon compte</b><span>Infos & paiements</span></span></button>
    </div>
    <button class="pro-link" data-a="proLogin">${ic('lock', 13)} Je suis un club · Espace pro</button>
  </div>`;
}

function vHome() {
  const act = activeOrders(), saved = S.orders.length * 17;
  const paid = S.orders.filter(o => o.status !== 'cancelled');
  return `<header class="topbar"><div class="brand">Club<span>&amp;</span>Co</div><div class="row" style="gap:8px">${bell()}${avatarBtn()}</div></header>
  <section class="hero fade-in">
    <span class="chip live">Dans le club</span>
    <h1 class="h1">${CLUB.name}</h1>
    <p class="muted">Salut ${esc(me())} 👋 Profite, on gère le reste.</p>
    <div class="hero-meta"><span class="chip ghost">${ic('pin', 13)} ${CLUB.area}</span><span class="chip ghost">${CLUB.event}</span><span class="chip ghost">${ic('clock', 13)} jusqu’à ${CLUB.closes}</span></div>
  </section>
  ${act.length ? `<div class="section"><div class="section-head"><h2 class="h2">En cours</h2></div>${act.map(orderLive).join('')}</div>` : ''}
  <div class="section quick">
    <button class="tile lime" data-a="tab" data-tab="bar"><span class="ti">${ic('glass', 22)}</span><span><b>Commander un verre</b><span>~${CLUB.bars[S.bar].wait} min · zéro file</span></span></button>
    <button class="tile violet" data-a="tab" data-tab="music"><span class="ti">${ic('music', 22)}</span><span><b>Proposer un son</b><span>${myPending().length ? myPending().length + ' en attente du DJ' : 'Le DJ t’écoute'}</span></span></button>
    <button class="tile" data-a="tab" data-tab="night"><span class="ti">${ic('hanger', 22)}</span><span><b>Vestiaire</b><span>${S.coat && S.coat.status !== 'done' ? '#' + S.coat.num + ' · ' + esc(S.coat.initials || '') : 'Déposer · 3 €'}</span></span></button>
    <button class="tile" data-a="tab" data-tab="orders"><span class="ti">${ic('clock', 22)}</span><span><b>Mes commandes</b><span>${paid.length ? paid.length + ' ce soir · ' + euro(paid.reduce((a, o) => a + o.total, 0)) : 'Historique de la soirée'}</span></span></button>
  </div>
  <div class="section stats">
    <div class="card stat"><p class="eyebrow">Attente au comptoir</p><p class="v">18<small> min</small></p><p class="xs muted">Avec Club&amp;Co : <b class="lime">${CLUB.bars[S.bar].wait} min</b></p></div>
    <div class="card stat"><p class="eyebrow">Affluence</p><p class="v">82<small> %</small></p><div class="meter"><i style="width:82%"></i></div></div>
  </div>
  ${saved ? `<div class="card" style="margin-top:10px"><div class="row"><span class="lime">${ic('clock', 22)}</span><p class="small"><b>${saved} min de queue évitées</b> ce soir. Autant de temps en plus sur la piste.</p></div></div>` : ''}
  <div class="section"><button class="safe-banner" data-a="safety">${ic('shield', 26)}<span class="grow"><b>Rentrer en sécurité</b><span class="xs muted" style="display:block">VTC, partage de trajet, alerte discrète au staff</span></span>${ic('chev')}</button></div>`;
}

const statusChip = o => ({ received: '<span class="chip warn">Reçue</span>', preparing: '<span class="chip warn">En prépa</span>', ready: '<span class="chip lime">Prête</span>', picked: '<span class="chip ghost">Récupérée</span>', cancelled: '<span class="chip bad">Remboursée</span>' })[o.status];
function vOrders() {
  const act = activeOrders(), paid = S.orders.filter(o => o.status !== 'cancelled');
  const total = paid.reduce((a, o) => a + o.total, 0), items = paid.reduce((a, o) => a + o.lines.reduce((b, l) => b + l.qty, 0), 0);
  return `${topbar('Commandes', `${CLUB.name} · ce soir`)}
  <div class="stats fade-in"><div class="card stat"><p class="eyebrow">Dépensé au bar</p><p class="v">${euro(total)}</p></div><div class="card stat"><p class="eyebrow">Articles</p><p class="v">${items}</p></div></div>
  ${act.length ? `<div class="section"><div class="section-head"><h2 class="h2">En cours</h2></div>${act.map(orderLive).join('')}</div>` : ''}
  <div class="section"><div class="section-head"><h2 class="h2">Historique de la soirée</h2><span class="xs muted">${S.orders.length} commande${S.orders.length > 1 ? 's' : ''}</span></div>
  ${S.orders.length ? S.orders.map(o => `<button class="hist" data-a="openOrder" data-id="${o.id}"><span class="hist-code">${o.code}</span><span class="grow" style="min-width:0"><b class="small">${o.lines.map(l => `${l.qty}× ${esc(l.name)}`).join(', ')}</b><span class="xs muted" style="display:block">${hhmm(o.at)} · ${o.table ? 'Table ' + esc(o.table) : CLUB.bars[o.bar].name}</span></span><span class="hist-r"><b class="small">${euro(o.status === 'cancelled' ? o.refunded : o.total)}</b>${statusChip(o)}</span></button>`).join('')
    : `<div class="empty">Aucune commande pour l’instant.<br><button class="btn sm lime" style="margin-top:12px" data-a="tab" data-tab="bar">Commander un verre</button></div>`}
  </div>`;
}

function vOutings() {
  return `<button class="back-btn" data-a="back">${ic('back', 18)} Retour</button>
  <h1 class="h1">Mes sorties</h1><p class="small muted" style="margin:6px 0 18px">Tes soirées passées avec Club&amp;Co</p>
  ${S.outings.length ? S.outings.map(o => `<button class="outing" data-a="outing" data-id="${o.id}"><span class="outing-date">${esc(o.date)}</span><span class="grow" style="min-width:0"><b>${esc(o.club)}</b><span class="xs muted" style="display:block">${esc(o.event)} · ${o.orders.length} commande${o.orders.length > 1 ? 's' : ''} · ${o.songs} son${o.songs > 1 ? 's' : ''}</span></span><b class="small">${euro(o.spent)}</b></button>`).join('')
    : '<div class="empty">Pas encore de sortie. Scanne le QR d’un club pour commencer !</div>'}`;
}
function vOuting(id) {
  const o = S.outings.find(x => x.id === id);
  if (!o) { S.screen = { name: 'outings' }; return vOutings(); }
  return `<button class="back-btn" data-a="outings">${ic('back', 18)} Mes sorties</button>
  <section class="hero fade-in"><span class="chip ghost">${esc(o.date)}</span><h1 class="h1" style="font-size:32px">${esc(o.club)}</h1><p class="muted">${esc(o.event)}${o.ticket ? ' · ' + esc(o.ticket) : ''}</p></section>
  <div class="section stats"><div class="card stat"><p class="eyebrow">Dépensé</p><p class="v">${euro(o.spent)}</p></div><div class="card stat"><p class="eyebrow">Sons proposés</p><p class="v">${o.songs}</p></div></div>
  <div class="section"><div class="section-head"><h2 class="h2">Commandes</h2></div>
  ${o.orders.length ? o.orders.map(x => `<div class="hist"><span class="hist-code">${x.code}</span><span class="grow" style="min-width:0"><b class="small">${esc(x.lines)}</b><span class="xs muted" style="display:block">${x.time}</span></span><b class="small">${euro(x.total)}</b></div>`).join('') : '<div class="empty">Aucune commande</div>'}</div>
  ${o.coat ? `<p class="xs muted" style="margin-top:14px">${ic('hanger', 13, 'style="display:inline;vertical-align:-2px"')} Vestiaire utilisé</p>` : ''}`;
}

function vAccount() {
  const a = S.account || {}, pts = S.points, goal = 150;
  return `<button class="back-btn" data-a="back">${ic('back', 18)} Retour</button>
  <div class="profile-head fade-in"><span class="avatar">${esc(me()[0].toUpperCase())}</span><div><p class="h2">${esc(me())}</p><p class="small muted">Membre Club&amp;Co · ${S.outings.length} sortie${S.outings.length > 1 ? 's' : ''}</p></div></div>
  <div class="loyalty"><div class="row between"><div><p class="eyebrow">Points fidélité</p><p class="h1" style="margin-top:6px">${pts} <span class="small muted">pts</span></p></div><span class="lime">${ic('star', 30)}</span></div>
    <div class="meter"><i style="width:${Math.min(100, pts / goal * 100)}%"></i></div>
    <p class="xs muted" style="margin-top:8px">${pts >= goal ? '🎉 Un cocktail offert t’attend au bar !' : `Encore ${goal - pts} pts pour un cocktail offert · 1 € = 1 pt`}</p></div>
  <div class="section"><div class="section-head"><h2 class="h2">Mes informations</h2></div>
    <div class="card stack">
      <label class="lbl">Prénom<input class="field" id="ac-name" value="${esc(me())}" data-in="acName" maxlength="20" autocomplete="given-name"></label>
      <label class="lbl">E-mail<input class="field" id="ac-email" type="email" value="${esc(a.email || '')}" data-in="acEmail" placeholder="toi@email.com" autocomplete="email"></label>
      <label class="lbl">Téléphone<input class="field" id="ac-phone" type="tel" value="${esc(a.phone || '')}" data-in="acPhone" placeholder="06 12 34 56 78" autocomplete="tel"></label>
      <p class="xs dim">Ton e-mail sert à retrouver tes billets Shotgun. Ton téléphone, à te prévenir par SMS si un ami t’offre un verre.</p>
    </div></div>
  <div class="section"><div class="section-head"><h2 class="h2">Moyens de paiement</h2></div>
    <div class="action-list">
      <button class="action ${S.wallet ? 'on' : ''}" data-a="toggleWallet"><span class="ai">${ic('wallet')}</span><span class="grow"><b>Paiement mobile</b><span class="xs muted" style="display:block">Validation biométrique${S.pay === 'wallet' ? ' · par défaut' : ''}</span></span><span class="switch lime-switch"></span></button>
      ${S.cards.map(c => `<div class="action"><span class="card-ico">${c.brand}</span><span class="grow"><b>•••• ${c.last4}</b><span class="xs muted" style="display:block">Expire ${c.exp}${S.pay === c.id ? ' · par défaut' : ''}</span></span>${S.pay !== c.id ? `<button class="btn xs" data-a="defCard" data-id="${c.id}">Par défaut</button>` : ''}<button class="icon-btn" style="width:36px;height:36px" data-a="delCard" data-id="${c.id}" aria-label="Supprimer la carte">${ic('x', 16)}</button></div>`).join('')}
      <button class="action" data-a="addCard"><span class="ai lime">${ic('plus')}</span><span class="grow"><b>Ajouter une carte</b><span class="xs muted" style="display:block">Démo : une carte de test est ajoutée</span></span></button>
    </div></div>
  <div class="section"><div class="section-head"><h2 class="h2">Réglages</h2></div>
    <div class="action-list">
      <button class="action ${S.notifOn ? 'on' : ''}" data-a="toggleNotif"><span class="ai">${ic('bell')}</span><span class="grow"><b>Notifications</b><span class="xs muted" style="display:block">${'Notification' in window ? 'Commande prête, réponse du DJ, vestiaire' : 'Installe l’app sur l’écran d’accueil pour les activer'}</span></span><span class="switch lime-switch"></span></button>
      <button class="action" data-a="outings"><span class="ai">${ic('moon')}</span><span class="grow"><b>Mes sorties</b><span class="xs muted" style="display:block">Historique de tes soirées</span></span><span class="chev">${ic('chev')}</span></button>
    </div></div>
  <div class="section"><button class="btn danger block" data-a="reset">${ic('refresh', 18)} Réinitialiser la démo</button>
    <p class="fine">Club&amp;Co · prototype v0.3 — les données restent sur ton téléphone.</p></div>`;
}

const PRO_ACCOUNTS = { 'bar@nebula': 'bar', 'dj@nebula': 'dj', 'vestiaire@nebula': 'coat' };
const PRO_CODE = '2580';
const sProLogin = () => `<p class="sheet-title">Espace pro</p><p class="small muted" style="margin-top:4px">Réservé au staff des clubs partenaires : barmans, DJ, vestiaire.</p>
  <p class="opt-label">Identifiant</p><input class="field" id="pro-id" autocomplete="username" autocapitalize="none" spellcheck="false" placeholder="poste@club" value="${esc(draft.id)}" data-in="proId">
  <p class="opt-label">Code</p><input class="field" id="pro-code" type="password" inputmode="numeric" maxlength="6" autocomplete="current-password" placeholder="••••" data-in="proCode">
  ${draft.err ? `<div class="warn-box err">${ic('x', 16)} ${draft.err}</div>` : ''}
  <button class="btn lime block" style="margin-top:16px" data-a="proGo">Se connecter</button>
  <div class="demo-creds"><p class="eyebrow">Accès démo</p><p class="small" style="margin-top:6px">bar@nebula · dj@nebula · vestiaire@nebula</p><p class="small">Code : <b>2580</b></p></div>`;

const sShotgun = () => `<p class="sheet-title">Lier mon billet Shotgun</p><p class="small muted" style="margin-top:4px">On retrouve ton billet grâce à l’e-mail de ton compte Shotgun.</p>
  <p class="opt-label">E-mail Shotgun</p><input class="field" id="sg-mail" type="email" value="${esc(draft.email)}" data-in="sgMail" placeholder="toi@email.com" autocomplete="email">
  <button class="btn lime block" style="margin-top:14px" data-a="sgSearch">${ic('search', 18)} Rechercher mon billet</button>
  <p class="fine">Démo : la connexion à Shotgun est simulée.</p>`;

function vBar() {
  const items = MENU.filter(m => m.cat === S.cat);
  const inCart = id => S.cart.filter(l => l.id === id).reduce((a, l) => a + l.qty, 0);
  return `${topbar('Le bar', `${CLUB.name} · sans attente`)}
  <div class="seg">${Object.entries(CLUB.bars).map(([k, b]) => `<button class="${S.bar === k ? 'on' : ''}" data-a="setBar" data-bar="${k}">${b.name} <small>${b.wait} min</small></button>`).join('')}</div>
  ${S.barPaused ? `<div class="warn-box">${ic('clock', 18)} Rush au bar : commandes en pause quelques minutes. Ton panier est gardé.</div>` : ''}
  <div class="chips">${CATS.map(c => `<button class="${S.cat === c.id ? 'on' : ''}" data-a="cat" data-cat="${c.id}">${c.name}</button>`).join('')}</div>
  ${S.cat === 'bottles' ? `<div class="card small muted" style="margin-top:10px">${ic('star', 16, 'style="display:inline;vertical-align:-3px;color:var(--lime)"')} Les bouteilles sont servies directement à ta table par un hôte.</div>` : ''}
  <div class="items fade-in">${items.map(m => {
    const q = inCart(m.id);
    return `<button class="item" data-a="item" data-id="${m.id}">
      <span class="thumb" style="--h:${m.h}">${m.emoji}</span>
      <span class="grow"><span class="item-name">${m.name}${m.tag ? `<span class="tag ${m.price === 0 ? 'free' : ''}">${m.tag}</span>` : ''}</span>
      <span class="item-desc">${m.desc}</span><span class="item-price" style="display:block">${m.price ? euro(m.price) : 'Offert'}</span></span>
      <span class="add ${q ? 'has' : ''}" data-a="quickAdd" data-id="${m.id}">${q || ic('plus', 18)}</span>
    </button>`;
  }).join('')}</div>`;
}

function trackRow(tr, action) {
  return `<button class="track" data-a="${action}" data-id="${tr.id}">
    <span class="cover" style="--h:${trackHue(tr.t)}">${initials(tr.t)}</span>
    <span class="grow"><span class="t-name" style="display:block">${esc(tr.t)}</span><span class="t-sub" style="display:block">${esc(tr.a)}${tr.g ? ' · ' + tr.g : ''}</span></span>
    <span class="chip violet">${ic('send', 13)} Proposer</span>
  </button>`;
}
let query = '';
function resultsHTML() {
  const q = query.trim().toLowerCase();
  if (!q) return `<p class="eyebrow" style="margin:14px 0 4px">Tendances ce soir</p>` + TRACKS.filter((_, i) => [0, 6, 9, 11, 26].includes(i)).map(t => trackRow(t, 'propose')).join('');
  const res = TRACKS.filter(t => (t.t + ' ' + t.a + ' ' + t.g).toLowerCase().includes(q)).slice(0, 8);
  return res.map(t => trackRow(t, 'propose')).join('') +
    `<button class="track" data-a="proposeCustom"><span class="cover" style="--h:80">+</span><span class="grow"><span class="t-name" style="display:block">Proposer « ${esc(query.trim())} »</span><span class="t-sub" style="display:block">Titre hors catalogue — le DJ vérifiera</span></span></button>`;
}
function reqRow(r) {
  const chip = { pending: '<span class="chip warn">En attente</span>', accepted: '<span class="chip ok">Acceptée</span>', declined: '<span class="chip bad">Refusée</span>', played: '<span class="chip lime">Jouée</span>' }[r.status];
  return `<div class="track">
    <span class="cover" style="--h:${trackHue(r.t)}">${initials(r.t)}</span>
    <span class="grow"><span class="t-name" style="display:block">${esc(r.t)}${r.boost ? ` <span class="tag">Boost</span>` : ''}</span>
      <span class="t-sub" style="display:block">${esc(r.a)} · ${r.mine ? 'toi' : esc(r.by)} · ${chip}</span>
      ${r.status === 'declined' && r.reason ? `<span class="req-reason" style="display:block">« ${esc(r.reason)} » — ${CLUB.dj}</span>` : ''}
      ${r.msg ? `<span class="req-reason" style="display:block">💬 ${esc(r.msg)}</span>` : ''}</span>
    <button class="vote ${r.voted ? 'on' : ''}" data-a="vote" data-id="${r.id}" ${r.mine || r.status === 'declined' || r.status === 'played' ? 'disabled' : ''} aria-label="Voter">${ic('heart', 18)}${r.votes}</button>
  </div>`;
}
function vMusic() {
  const mine = S.requests.filter(r => r.mine), act = myPending().length;
  const room = S.requests.filter(r => !r.mine && r.status !== 'played').sort((a, b) => (b.status === 'pending') - (a.status === 'pending') || (b.boost | 0) - (a.boost | 0) || b.votes - a.votes);
  return `${topbar('Sons', `${CLUB.name} · demandes au DJ`)}
  <section class="card dj-row fade-in"><span class="avatar">${CLUB.dj[0]}</span><div class="grow"><b>DJ ${CLUB.dj} aux platines</b><p class="xs muted">Propose un son, vote pour ceux des autres : le DJ voit tout en direct.</p></div></section>
  <div class="section">
    <div class="section-head"><h2 class="h2">Proposer un son</h2><span class="row xs muted" style="gap:8px">${act}/3 <span class="limit">${[0, 1, 2].map(i => `<i class="${i < act ? 'on' : ''}"></i>`).join('')}</span></span></div>
    <label class="search">${ic('search')}<input id="q" class="field" type="search" placeholder="Titre, artiste, style…" value="${esc(query)}" data-in="query" autocomplete="off"></label>
    <div class="results" id="results">${resultsHTML()}</div>
  </div>
  ${mine.length ? `<div class="section"><div class="section-head"><h2 class="h2">Mes demandes</h2></div><div class="results">${mine.map(reqRow).join('')}</div></div>` : ''}
  <div class="section"><div class="section-head"><h2 class="h2">Demandes de la salle</h2><span class="xs muted">Vote ❤️</span></div>
    <div class="results">${room.map(reqRow).join('')}</div></div>`;
}

function coatChip(c) {
  return { paid: '<span class="chip warn">À déposer</span>', stored: `<span class="chip ok">Déposé · ${hhmm(c.storedAt || c.at)}</span>`, fetching: '<span class="chip warn">On le prépare…</span>', ready: '<span class="chip lime">Prêt au comptoir</span>', done: '<span class="chip ghost">Rendu</span>' }[c.status];
}
function coatTicket(c) {
  return `<div class="coat-ticket"><span class="coat-num">#${c.num}</span><span class="ini-badge">${esc(c.initials || '—')}</span></div>`;
}
function vCoatBlock() {
  const c = S.coat;
  if (!c || c.status === 'done') return `<div class="card"><div class="row"><span class="ai-box">${ic('hanger', 22)}</span><div class="grow"><b>Vestiaire digital</b><p class="xs muted">Paie ici, donne ton numéro + tes initiales. Rien à perdre, même si ton téléphone s’éteint.</p></div></div>
    <button class="btn lime block" style="margin-top:14px" data-a="coatDeposit">${ic('hanger', 18)} Déposer mes affaires · 3 €</button></div>`;
  const action = {
    paid: `<div class="instr">${ic('users', 18)}<span>Au comptoir, donne <b>#${c.num}</b> et tes initiales <b>${esc(c.initials)}</b>. Le vestiaire les écrit sur l’étiquette de ta veste.</span></div><button class="btn block" style="margin-top:12px" data-a="coatStored">${ic('check', 18)} C’est déposé</button>`,
    stored: `<button class="btn block" data-a="coatFetch">${ic('hanger', 18)} Je pars bientôt — préparer mes affaires</button>`,
    fetching: `<p class="small muted">Le vestiaire prépare tes affaires, on te notifie dès qu’elles sont prêtes.</p>`,
    ready: `<p class="small" style="margin-bottom:10px">Présente <b>#${c.num} · ${esc(c.initials)}</b> au comptoir.</p><button class="btn lime block" data-a="coatDone">${ic('check', 18)} J’ai récupéré mes affaires</button>`,
  }[c.status];
  return `<div class="card"><div class="row between"><p class="eyebrow">Ticket vestiaire · ${c.items} article${c.items > 1 ? 's' : ''}</p>${coatChip(c)}</div>
    ${coatTicket(c)}${c.desc ? `<p class="small muted">${esc(c.desc)}</p>` : ''}
    <div style="margin-top:14px">${action}</div></div>`;
}
function vSecours() {
  const act = activeOrders(), c = S.coat && S.coat.status !== 'done' ? S.coat : null;
  if (!act.length && !c) return '';
  const low = battery && battery.level <= .2 && !battery.charging;
  return `<div class="section"><div class="secours ${low ? 'low' : ''}">
    <div class="row between"><b>${ic('bolt', 16, 'style="display:inline;vertical-align:-3px"')} Si ton téléphone s’éteint</b>${low ? `<span class="chip bad">Batterie ${Math.round(battery.level * 100)} %</span>` : ''}</div>
    <p class="xs muted" style="margin:4px 0 10px">Retiens ça (ou fais une capture) — le staff peut tout retrouver sans ton téléphone.</p>
    ${c ? `<div class="sec-row"><span>Vestiaire</span><b>#${c.num} · ${esc(c.initials)}${c.desc ? ' · ' + esc(c.desc) : ''}</b></div>` : ''}
    ${act.map(o => `<div class="sec-row"><span>Commande</span><b>${o.code} · au nom de ${esc(me())}</b></div>`).join('')}
    <div class="sec-row"><span>Entrée</span><b>${esc(me())} · sur la liste du soir</b></div>
  </div></div>`;
}
function vTicketCard() {
  const tk = S.ticket;
  if (!tk) return `<div class="ticket fade-in"><div class="ticket-top"><span class="chip warn">Billet non lié</span>
      <p class="h1" style="font-size:24px;margin-top:14px">${CLUB.event}</p><p class="small muted">${CLUB.name} · ${CLUB.area} · Jeu. 5 nov.</p>
      <p class="small" style="margin-top:12px">Tu as pris ta place sur Shotgun ? Lie-la pour la retrouver ici avec ton pass de sortie/retour.</p>
      <button class="btn lime block" style="margin-top:14px" data-a="ticketLink">${ic('ticket', 18)} Lier mon billet</button></div></div>`;
  return `<div class="ticket fade-in">
    <div class="ticket-top"><div class="row between"><span class="chip ok">${ic('check', 12)} Scanné à l’entrée</span><span class="xs muted">${hhmm(S.entryAt)}</span></div>
      <p class="h1" style="font-size:24px;margin-top:14px">${CLUB.event}</p><p class="small muted">${CLUB.name} · ${CLUB.area} · Jeu. 5 nov.</p>
      <p class="xs muted" style="margin-top:8px">Billet ${esc(tk.src)} · ${esc(tk.type)} · réf. ${esc(tk.ref)}</p></div>
    <div class="ticket-cut"></div>
    <div class="ticket-bottom"><div class="qr">${qr('entry' + me())}</div><div><p class="eyebrow">Pass sortie / retour</p><p><b>${esc(me())}</b></p><p class="xs muted" style="margin-top:6px">Valable jusqu’à 03:00.</p>
      ${tk.src === 'Shotgun' ? `<a class="xs lime" style="display:inline-block;margin-top:8px;font-weight:700" href="https://shotgun.live" target="_blank" rel="noopener">Ouvrir dans Shotgun ↗</a>` : ''}</div></div>
  </div>`;
}

function vNight() {
  const sp = spent(), since = drinksSinceWater();
  return `${topbar('Ma soirée', `${CLUB.name} · ${CLUB.event}`)}
  ${vTicketCard()}
  ${vSecours()}
  <div class="section">${vCoatBlock()}</div>
  ${since >= 3 ? `<div class="section"><div class="hydra">${ic('drop', 26)}<div class="grow"><b>Petite pause eau ?</b><p class="xs muted">${since} verres depuis ta dernière eau. Elle est offerte.</p></div><button class="btn sm" data-a="addWater">Ajouter</button></div></div>` : ''}
  <div class="section"><div class="section-head"><h2 class="h2">Budget de la soirée</h2><span class="small"><b>${euro(sp)}</b>${S.budget ? ` / ${S.budget} €` : ''}</span></div>
    <div class="card">${S.budget ? `<div class="meter"><i style="width:${Math.min(100, sp / S.budget * 100)}%;background:${sp > S.budget ? 'var(--bad)' : 'var(--lime)'}"></i></div><p class="xs muted" style="margin-top:8px">${sp > S.budget ? 'Budget dépassé — on te prévient avant chaque paiement.' : `Il te reste ${euro(S.budget - sp)}.`}</p>` : `<p class="small muted">Fixe-toi une limite, on t’alerte avant de la dépasser.</p>`}
      <div class="budget-chips">${[null, 40, 60, 100, 200].map(b => `<button class="${S.budget === b ? 'on' : ''}" data-a="budget" data-v="${b ?? ''}">${b ? b + ' €' : 'Aucun'}</button>`).join('')}</div>
      <p class="xs dim" style="margin-top:10px">${S.orders.length} commande(s) · ${alcoholCount()} verre(s) avec alcool</p></div></div>
  <div class="section"><div class="section-head"><h2 class="h2">Sécurité</h2></div>
    <div class="action-list">
      <button class="action" data-a="safeRide"><span class="ai">${ic('car')}</span><span><b>Rentrer en VTC</b><span class="xs muted" style="display:block">Prise en charge devant le club</span></span><span class="chev">${ic('chev')}</span></button>
      <button class="action" data-a="shareTrip"><span class="ai">${ic('share')}</span><span><b>Partager mon trajet</b><span class="xs muted" style="display:block">Un proche suit ton retour en direct</span></span><span class="chev">${ic('chev')}</span></button>
      <button class="action alert" data-a="help"><span class="ai">${ic('shield')}</span><span><b>Besoin d’aide, discrètement</b><span class="xs muted" style="display:block">Alerte la sécurité du club sans attirer l’attention</span></span><span class="chev">${ic('chev')}</span></button>
    </div></div>
  <div class="section"><button class="btn block" data-a="endNight">${ic('moon', 18)} Terminer ma soirée</button><p class="fine">Ta soirée sera rangée dans « Mes sorties ».</p></div>`;
}


function vOrder(id) {
  const o = S.orders.find(x => x.id === id);
  if (!o) { S.screen = null; return vHome(); }
  const st = STATUS[o.status], ready = o.status === 'ready';
  const steps = [['received', 'Commande reçue', 'Payée · ' + hhmm(o.at)], ['preparing', 'En préparation', 'Ton barman s’en occupe'], ['ready', o.table ? 'En route vers ta table' : 'Prête au comptoir', pickupLabel(o)]];
  return `<button class="back-btn" data-a="back">${ic('back', 18)} Retour</button>
  <section class="order-hero ${ready ? 'ready' : ''} fade-in">
    <p class="eyebrow">${st.t}</p>
    <p class="code-big">${o.code}</p>
    <p class="${ready ? '' : 'muted'} small"><b>${pickupLabel(o)}</b></p>
    ${['picked', 'cancelled'].includes(o.status) ? '' : `<div class="qr">${qr(o.id)}</div><p class="xs ${ready ? '' : 'muted'}">Montre ce code au barman</p>`}
  </section>
  ${!['picked', 'cancelled'].includes(o.status) ? `<div class="card section"><div class="steps">${steps.map(([k, t, s]) => {
    const n = STATUS[k].n, cls = st.n > n ? 'done' : st.n === n ? (k === 'ready' ? 'done' : 'cur') : 'todo';
    return `<div class="step ${cls}"><span class="sdot">${cls === 'done' ? ic('check', 16) : ''}</span><div><b>${t}</b><span class="xs muted">${s}${cls === 'cur' && !o.manual ? ` · <span data-eta="${k === 'received' ? o.prepAt : o.readyAt}"></span>` : ''}</span></div></div>`;
  }).join('')}</div>
  ${!ready ? `<p class="xs dim" style="margin-top:14px">${ic('bell', 13, 'style="display:inline;vertical-align:-2px"')} Retourne danser — ton téléphone vibre quand c’est prêt. (Démo : préparation accélérée)</p>` : ''}</div>` : ''}
  <div class="card section"><p class="eyebrow" style="margin-bottom:6px">Détail</p>
    ${o.lines.map(l => `<div class="row between small" style="padding:6px 0"><span>${l.qty}× ${esc(l.name)}${l.gift ? ` <span class="tag">🎁 pour ${esc(l.gift)}</span>` : ''}${l.note ? `<span class="xs muted" style="display:block">${esc(l.note)}</span>` : ''}</span><span>${l.unit ? euro(l.qty * l.unit) : 'Offert'}</span></div>`).join('')}
    ${o.tip ? `<div class="row between small muted" style="padding:6px 0"><span>Pourboire</span><span>${euro(o.tip)}</span></div>` : ''}
    <div class="row between" style="padding-top:10px;margin-top:6px;border-top:1px solid var(--line)"><b>Total payé</b><b>${euro(o.total)}</b></div></div>
  ${ready ? `<button class="btn lime block section" data-a="picked" data-id="${o.id}">${ic('check', 18)} J’ai récupéré ma commande</button>` : ''}
  ${o.status === 'picked' ? `<button class="btn block section" data-a="reorder" data-id="${o.id}">${ic('refresh', 18)} Recommander la même chose</button>` : ''}
  ${o.status === 'received' ? `<button class="btn danger block section" data-a="cancelOrder" data-id="${o.id}">${ic('x', 18)} Annuler — remboursement immédiat</button><p class="fine">Possible tant que le bar n’a pas commencé.</p>` : ''}
  ${o.issue ? `<div class="warn-box">${ic('bell', 18)} Signalé : ${esc(o.issue)} — ${o.issueFix}</div>` : ''}
  ${['ready', 'picked'].includes(o.status) && !o.issue ? `<button class="back-btn" style="margin:20px auto 0;display:flex" data-a="orderIssue" data-id="${o.id}">${ic('shield', 16)} Un problème avec ta commande ?</button>` : ''}
  ${o.status === 'cancelled' ? `<div class="card section small">Commande annulée · ${euro(o.refunded)} remboursés sur ton moyen de paiement.</div>` : ''}`;
}

/* ---------- Vues : espace pro ---------- */
function proBanner(kind) {
  const k = { bar: ['glass', 'BARMAN'], dj: ['headphones', 'DJ'], coat: ['hanger', 'VESTIAIRE'] }[kind];
  return `<div class="pro-banner ${kind === 'dj' ? '' : 'bar'}"><span>${ic(k[0], 16, 'style="display:inline;vertical-align:-3px"')}&nbsp; ${k[1]} · ${esc(S.proUser || '')}</span><button data-a="proLogout">Déconnexion</button></div>`;
}
function vProBar() {
  const all = [...S.orders.filter(o => o.status !== 'picked').map(o => ({ ...o, mine: true, who: me() })), ...S.fakeOrders.filter(o => o.status !== 'picked')];
  const col = (st, title) => {
    const list = all.filter(o => o.status === st);
    return `<div class="col-title"><h2 class="h2">${title}</h2><span class="n">${list.length}</span></div>${list.length ? list.map(o => `
      <div class="ticket-order ${o.mine ? 'mine' : ''}"><div class="row between"><span class="code">${o.code}</span><span class="xs muted">${esc(o.who)} · ${o.table ? 'Table ' + esc(o.table) : CLUB.bars[o.bar].name} · ${ago(o.at)}</span></div>
        <ul>${o.lines.map(l => `<li><b>${l.qty}×</b> ${esc(l.name)}${l.note ? ` <span class="muted">— ${esc(l.note)}</span>` : ''}</li>`).join('')}</ul>
        ${st === 'received' ? `<button class="btn sm block" data-a="proOrder" data-id="${o.id}" data-st="preparing">Lancer la préparation</button>` : st === 'preparing' ? `<button class="btn sm lime block" data-a="proOrder" data-id="${o.id}" data-st="ready">${ic('bell', 16)} Prête — notifier le client</button>` : `<button class="btn sm block" data-a="proOrder" data-id="${o.id}" data-st="picked">${ic('qr', 16)} Code scanné — remise</button>`}
      </div>`).join('') : `<div class="empty">Rien ici</div>`}`;
  };
  const rev = S.orders.reduce((a, o) => a + o.total, 0) + 412;
  return `${proBanner('bar')}
  <h1 class="h1">Commandes</h1><p class="small muted" style="margin:6px 0 16px">${CLUB.name} · tous les bars</p>
  <button class="action ${S.barPaused ? 'on' : ''}" style="margin-bottom:10px" data-a="barPause"><span class="ai">${ic('clock')}</span><span class="grow"><b>Mettre les commandes en pause</b><span class="xs muted" style="display:block">En cas de rush : les clients gardent leur panier</span></span><span class="switch lime-switch"></span></button>
  <div class="kpis"><div class="kpi"><p class="eyebrow">En cours</p><p class="v">${all.filter(o => ['received', 'preparing'].includes(o.status)).length}</p></div><div class="kpi"><p class="eyebrow">Temps moy.</p><p class="v">2:40</p></div><div class="kpi"><p class="eyebrow">CA soirée</p><p class="v">${Math.round(rev)}€</p></div></div>
  ${col('received', 'Nouvelles')}${col('preparing', 'En préparation')}${col('ready', 'Prêtes à remettre')}`;
}
function vProDJ() {
  const pending = S.requests.filter(r => r.status === 'pending').sort((a, b) => (b.boost | 0) - (a.boost | 0) || b.votes - a.votes);
  const queue = S.requests.filter(r => r.status === 'accepted');
  const tips = S.requests.filter(r => r.boost && r.status !== 'declined').length * 3;
  return `${proBanner('dj')}
  <h1 class="h1">Demandes</h1><p class="small muted" style="margin:6px 0 16px">Triées par boost puis par votes de la salle</p>
  <div class="action-list" style="margin-top:10px">
    <div class="action"><span class="ai violet">${ic('wave')}</span><span class="grow"><b>Platines connectées</b><span class="xs muted" style="display:block">Titres détectés auto → demandes marquées « Jouée »</span></span><span class="chip ok">Live</span></div>
  </div>
  <div class="kpis" style="margin-top:10px"><div class="kpi"><p class="eyebrow">En attente</p><p class="v">${pending.length}</p></div><div class="kpi"><p class="eyebrow">Dans la file</p><p class="v">${queue.length}</p></div><div class="kpi"><p class="eyebrow">Pourboires</p><p class="v">${tips}€</p></div></div>
  <div class="col-title"><h2 class="h2">À traiter</h2><span class="n">${pending.length}</span></div>
  ${pending.length ? pending.map(r => `<div class="ticket-order ${r.mine ? 'mine' : ''}">
    <div class="row"><span class="cover" style="--h:${trackHue(r.t)}">${initials(r.t)}</span><div class="grow" style="min-width:0"><p class="t-name">${esc(r.t)} ${r.boost ? '<span class="tag">Boost</span>' : ''}</p><p class="t-sub">${esc(r.a)} · ${r.mine ? esc(me()) : esc(r.by)} · ${ago(r.at)}</p></div><span class="vote on">${ic('heart', 16)}${r.votes}</span></div>
    ${r.msg ? `<p class="req-reason" style="margin:8px 0 0">💬 ${esc(r.msg)}</p>` : ''}
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn sm danger grow" data-a="djDecline" data-id="${r.id}">${ic('x', 16)} Refuser</button><button class="btn sm violet grow" data-a="djAccept" data-id="${r.id}">${ic('check', 16)} Accepter</button></div>
  </div>`).join('') : `<div class="empty">Aucune demande en attente</div>`}
  <div class="col-title"><h2 class="h2">Ma file</h2><span class="n">${queue.length}</span></div>
  ${queue.length ? queue.map(r => `<div class="ticket-order"><div class="row"><span class="cover" style="--h:${trackHue(r.t)}">${initials(r.t)}</span><div class="grow" style="min-width:0"><p class="t-name">${esc(r.t)}</p><p class="t-sub">${esc(r.a)} · ${r.mine ? esc(me()) : esc(r.by)}</p></div><button class="btn xs lime" data-a="djPlay" data-id="${r.id}">${ic('wave', 14)} Jouer</button></div></div>`).join('') : `<div class="empty">File vide</div>`}`;
}

let coatQ = '';
function coatListHTML() {
  const all = [...(S.coat && S.coat.status !== 'done' ? [{ ...S.coat, mine: true, id: 'mine' }] : []), ...S.fakeCoats.filter(c => c.status !== 'done')];
  const q = coatQ.trim().toLowerCase();
  const list = all.filter(c => !q || String(c.num).includes(q) || (c.initials || '').toLowerCase().includes(q));
  const btn = c => ({
    paid: `<button class="btn sm block" data-a="proCoat" data-id="${c.id}" data-st="stored">${ic('check', 16)} Initiales notées sur l’étiquette — déposé</button>`,
    stored: `<button class="btn sm block" data-a="proCoat" data-id="${c.id}" data-st="ready">Client au comptoir — sortir ses affaires</button>`,
    fetching: `<button class="btn sm lime block" data-a="proCoat" data-id="${c.id}" data-st="ready">${ic('bell', 16)} Prêt — notifier le client</button>`,
    ready: `<button class="btn sm block" data-a="proCoat" data-id="${c.id}" data-st="done">Rendu au client</button>`,
  })[c.status];
  return list.length ? list.map(c => `<div class="ticket-order ${c.mine ? 'mine' : ''}"><div class="row between"><span class="code">#${c.num} · ${esc(c.initials || '—')}</span>${coatChip(c)}</div>
    <p class="small muted" style="margin:6px 0 12px">${c.items} article${c.items > 1 ? 's' : ''}${c.desc ? ' · ' + esc(c.desc) : ''}${c.mine ? ' · ' + esc(me()) : ''}</p>${btn(c)}</div>`).join('')
    : '<div class="empty">Aucun ticket ne correspond</div>';
}
function vProCoat() {
  return `${proBanner('coat')}
  <h1 class="h1">Vestiaire</h1><p class="small muted" style="margin:6px 0 16px">Cherche par numéro ou initiales — ça marche même si le téléphone du client est éteint.</p>
  <label class="search">${ic('search')}<input id="cq" class="field" type="search" placeholder="Ex : 214 ou AK" value="${esc(coatQ)}" data-in="coatQ" autocomplete="off"></label>
  <div id="coat-list" style="margin-top:12px">${coatListHTML()}</div>`;
}

/* ---------- Sheets ---------- */
let sheetFn = null, draft = null;
function openSheet(fn) { sheetFn = fn; $('.sheet-body').innerHTML = fn(); $('#sheet').classList.add('open'); $('#sheet').setAttribute('aria-hidden', 'false'); $('.sheet').scrollTop = 0; }
let camStream = null, scanTimer = null, scanning = false;
function startCam() {
  scanning = true;
  if (!navigator.mediaDevices?.getUserMedia) return;
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(st => {
    if (!scanning) return st.getTracks().forEach(t => t.stop());
    camStream = st; const v = $('#cam'); if (v) { v.srcObject = st; v.play().catch(() => {}); v.classList.add('on'); }
  }).catch(() => {});
}
function stopCam() { scanning = false; clearTimeout(scanTimer); if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; } }
function checkIn(via) {
  stopCam();
  const t = now();
  S.checkedIn = { via, at: t }; S.entryAt = t; S.tab = 'home'; S.screen = null;
  if (!S.ticket) S.ticket = { src: 'Entrée sur place', type: 'Billet porte', ref: 'NB-' + Math.random().toString(36).slice(2, 8).toUpperCase() };
  if (navigator.vibrate) navigator.vibrate([60, 40, 60]);
  closeSheet(); save(); render();
  notify(`Bienvenue au ${CLUB.name} ✨`, 'Bar, sons, vestiaire : tout est débloqué.', { go: 'home', soft: true });
}
function closeSheet() { stopCam(); sheetFn = null; $('#sheet').classList.remove('open'); $('#sheet').setAttribute('aria-hidden', 'true'); }
function refreshSheet() { if (sheetFn) keepFocus(() => { $('.sheet-body').innerHTML = sheetFn(); }); }

function sItem() {
  const m = byId(draft.id), unit = m.price + (draft.premium ? 3 : 0);
  return `<div class="thumb xl" style="--h:${m.h}">${m.emoji}</div>
  <div class="row between" style="margin-top:18px;align-items:flex-start"><div><p class="sheet-title">${m.name}</p><p class="small muted" style="margin-top:4px">${m.desc}</p></div><b style="font-size:18px;white-space:nowrap">${m.price ? euro(m.price) : 'Offert'}</b></div>
  ${m.premium ? `<p class="opt-label">Alcool</p><div class="options"><button class="opt ${!draft.premium ? 'on' : ''}" data-a="d" data-k="premium" data-v="">Standard<span class="radio"></span></button><button class="opt ${draft.premium ? 'on' : ''}" data-a="d" data-k="premium" data-v="1">Premium <span class="muted small" style="margin-left:auto;margin-right:10px">+3,00 €</span><span class="radio"></span></button></div>` : ''}
  ${m.ice ? `<p class="opt-label">Glaçons</p><div class="options cols">${['Normal', 'Peu', 'Sans'].map(v => `<button class="opt ${draft.ice === v ? 'on' : ''}" data-a="d" data-k="ice" data-v="${v}">${v}</button>`).join('')}</div>` : ''}
  ${m.table ? `<p class="opt-label">Numéro de table</p><input class="field" id="d-table" inputmode="numeric" maxlength="3" placeholder="Ex : 4 (indiqué sur ta table)" value="${esc(draft.table)}" data-in="dTable">` : ''}
  <p class="opt-label">Pour qui ?</p>
  <div class="options cols" style="grid-template-columns:1fr 1fr"><button class="opt ${!draft.giftOn ? 'on' : ''}" data-a="d" data-k="giftOn" data-v="">Pour moi</button><button class="opt ${draft.giftOn ? 'on' : ''}" data-a="d" data-k="giftOn" data-v="1">${ic('gift', 16)} Offrir</button></div>
  ${draft.giftOn ? `<input class="field" id="d-gift" style="margin-top:8px" maxlength="20" placeholder="Prénom de ton ami·e" value="${esc(draft.gift)}" data-in="dGift"><p class="xs muted" style="margin-top:6px">Il/elle reçoit le code de retrait sur son téléphone.</p>` : ''}
  <div class="sheet-actions"><div class="stepper lg"><button data-a="dQty" data-v="-1" aria-label="Moins">${ic('minus')}</button><span>${draft.qty}</span><button data-a="dQty" data-v="1" aria-label="Plus">${ic('plus')}</button></div>
    <button class="btn lime grow" data-a="addToCart">Ajouter <span class="price">${unit ? euro(unit * draft.qty) : 'Offert'}</span></button></div>`;
}
function sCart() {
  if (!S.cart.length) return `<p class="sheet-title">Ton panier</p><div class="empty" style="margin-top:16px">Ton panier est vide</div><button class="btn block" style="margin-top:16px" data-a="closeSheet">Retour au bar</button>`;
  const sub = cartSub(), tip = tipAmt(), tot = sub + tip, over = S.budget && spent() + tot > S.budget;
  const table = S.cart.find(l => l.table)?.table;
  return `<div class="row between"><p class="sheet-title">Ton panier</p><span class="chip ghost">${table ? 'Table ' + esc(table) : CLUB.bars[S.bar].name}</span></div>
  <div style="margin-top:8px">${S.cart.map(l => { const m = byId(l.id); return `<div class="line"><span class="thumb" style="--h:${m.h}">${m.emoji}</span><div class="grow" style="min-width:0"><b class="small">${esc(l.name)}${l.premium ? ' · premium' : ''}</b><p class="xs muted">${[l.ice && l.ice !== 'Normal' ? l.ice + ' glaçons' : '', l.gift ? '🎁 pour ' + esc(l.gift) : ''].filter(Boolean).join(' · ') || (l.unit ? euro(l.unit) : 'Offert')}</p></div><div class="stepper"><button data-a="lineQty" data-k="${l.key}" data-v="-1" aria-label="Moins">${ic('minus', 16)}</button><span>${l.qty}</span><button data-a="lineQty" data-k="${l.key}" data-v="1" aria-label="Plus">${ic('plus', 16)}</button></div></div>`; }).join('')}</div>
  <p class="opt-label">Pourboire pour l’équipe</p>
  <div class="options cols">${[0, 5, 10].map(p => `<button class="opt ${S.tip === p ? 'on' : ''}" data-a="tip" data-v="${p}">${p ? p + ' %' : 'Non merci'}</button>`).join('')}</div>
  <p class="opt-label">Paiement</p>
  <div class="options">
    ${S.wallet ? `<button class="pay-method ${S.pay === 'wallet' ? 'on' : ''}" data-a="payM" data-v="wallet"><span class="card-ico wallet">${ic('wallet', 14)}</span><span class="grow"><b class="small">Paiement mobile</b><span class="xs muted" style="display:block">Validation biométrique</span></span><span class="radio"></span></button>` : ''}
    ${S.cards.map(c => `<button class="pay-method ${S.pay === c.id ? 'on' : ''}" data-a="payM" data-v="${c.id}"><span class="card-ico">${c.brand}</span><span class="grow"><b class="small">Carte •••• ${c.last4}</b><span class="xs muted" style="display:block">Expire ${c.exp}</span></span><span class="radio"></span></button>`).join('')}
    ${!S.wallet && !S.cards.length ? `<button class="pay-method" data-a="account"><span class="ai lime">${ic('plus', 16)}</span><span class="grow"><b class="small">Ajouter un moyen de paiement</b></span></button>` : ''}
  </div>
  <div class="totals"><div class="row"><span class="muted">Sous-total</span><span>${euro(sub)}</span></div>${tip ? `<div class="row"><span class="muted">Pourboire</span><span>${euro(tip)}</span></div>` : ''}<div class="row"><span class="muted">Frais de service</span><span class="lime">Offerts</span></div><div class="row grand"><span>Total</span><span>${euro(tot)}</span></div></div>
  ${over ? `<div class="warn-box">${ic('wallet', 18)} Cette commande te fait dépasser ton budget de ${S.budget} €.</div>` : ''}
  <p class="xs muted" style="margin-top:12px">+${Math.floor(tot)} pts fidélité · ${table ? 'servi à ta table' : `à retirer au ${CLUB.bars[S.bar].name}`}</p>
  ${S.barPaused ? `<div class="warn-box">${ic('clock', 18)} Le bar fait une courte pause (rush). Réessaie dans quelques minutes.</div>` : ''}
  <button class="btn lime block" style="margin-top:14px;height:60px" data-a="pay" ${S.barPaused || !payOk() ? 'disabled' : ''}>${ic(S.pay === 'wallet' ? 'wallet' : 'card', 20)} Payer ${euro(tot)}</button>`;
}
const sPaying = (done, msg = 'Ta commande part au bar') => `<div class="paying"><div>${done ? `<div class="done-check">${ic('check', 54)}</div><p class="sheet-title">Paiement accepté</p><p class="small muted" style="margin-top:6px">${msg}</p>` : `<div class="ring"></div><p class="sheet-title">Validation…</p><p class="small muted" style="margin-top:6px">Paiement sécurisé (simulation)</p>`}</div></div>`;

function sPropose() {
  const tr = draft.track;
  return `<p class="eyebrow">Proposer au DJ</p>
  <div class="track" style="margin-top:12px"><span class="cover" style="--h:${trackHue(tr.t)}">${initials(tr.t)}</span><span class="grow"><span class="t-name" style="display:block">${esc(tr.t)}</span><span class="t-sub" style="display:block">${esc(tr.a)}</span></span></div>
  <p class="opt-label">Un mot pour ${CLUB.dj} ? <span class="dim">(optionnel)</span></p>
  <textarea class="field" id="d-msg" maxlength="80" placeholder="Ex : C’est l’anniv de Clara 🎂" data-in="dMsg">${esc(draft.msg)}</textarea>
  <button class="boost-box ${draft.boost ? 'on' : ''}" data-a="d" data-k="boost" data-v="${draft.boost ? '' : '1'}"><span class="bi">${ic('bolt', 20)}</span><span class="grow"><b>Booster · 3 €</b><span class="xs muted" style="display:block">Ta demande passe en tête de liste et le DJ reçoit un pourboire. Remboursé si refusé.</span></span><span class="switch"></span></button>
  <button class="btn violet block" style="margin-top:20px" data-a="sendReq">${ic('send', 18)} Envoyer au DJ${draft.boost ? ' · 3,00 €' : ''}</button>
  <p class="fine">3 demandes actives max par personne, pour laisser la place à tout le monde.</p>`;
}
function sNotifs() {
  S.notifs.forEach(n => { n.read = true; });
  return `<p class="sheet-title">Notifications</p>
  <div style="margin-top:12px">${S.notifs.length ? S.notifs.map(n => `<button class="action" style="margin-bottom:8px" data-a="goNotif" data-id="${n.id}"><span class="ai" style="color:var(--lime)">${ic('bell', 18)}</span><span class="grow"><b class="small">${esc(n.title)}</b><span class="xs muted" style="display:block">${esc(n.body)}</span></span><span class="xs dim">${hhmm(n.at)}</span></button>`).join('') : '<div class="empty">Rien pour l’instant. Commande un verre ou propose un son !</div>'}</div>`;
}
function sCoat() {
  return `<p class="sheet-title">Vestiaire</p><p class="small muted" style="margin-top:4px">3 € par article, payé ici. Pas de ticket papier à perdre.</p>
  <div class="how">${['Paie et indique tes initiales', 'Au comptoir, donne ton numéro + tes initiales', 'Le vestiaire les écrit sur l’étiquette de ta veste'].map((t, i) => `<div class="how-step"><span>${i + 1}</span>${t}</div>`).join('')}</div>
  <p class="opt-label">Tes initiales (prénom + nom)</p>
  <input class="field initials" id="c-ini" maxlength="3" placeholder="AK" value="${esc(draft.initials)}" data-in="cIni" autocapitalize="characters" autocomplete="off">
  <p class="opt-label">Description <span class="dim">(recommandé)</span></p>
  <input class="field" id="c-desc" maxlength="40" placeholder="Ex : doudoune noire + sac beige" value="${esc(draft.desc)}" data-in="cDesc">
  <p class="xs muted" style="margin-top:8px">Téléphone éteint en fin de soirée ? Numéro + initiales + description suffisent pour récupérer tes affaires.</p>
  <div class="sheet-actions"><div class="stepper lg"><button data-a="cItems" data-v="-1" aria-label="Moins">${ic('minus')}</button><span>${draft.items}</span><button data-a="cItems" data-v="1" aria-label="Plus">${ic('plus')}</button></div>
    <button class="btn lime grow" data-a="coatPay">Payer <span class="price">${euro(3 * draft.items)}</span></button></div>`;
}
const ISSUES = [['Il manque un article', 'le bar te le prépare en priorité'], ['Ce n’est pas ma boisson', 'on te refait la bonne en priorité'], ['Boisson renversée / ratée', 'on te la refait, offerte'], ['Je n’ai rien reçu', 'un responsable bar arrive, remboursement si besoin']];
const sIssue = id => `<p class="sheet-title">Un souci ?</p><p class="small muted" style="margin:4px 0 14px">Le bar reçoit ton signalement avec le détail de ta commande.</p>
  <div class="options">${ISSUES.map(([r], i) => `<button class="opt" data-a="issueGo" data-id="${id}" data-v="${i}">${r}${ic('chev', 18)}</button>`).join('')}</div>`;
const sTicket = () => `<p class="sheet-title">Mon entrée</p><p class="small muted" style="margin-top:4px">${CLUB.event} · ${CLUB.name}</p>
  <div class="qr" style="width:220px;height:220px;margin:22px auto">${qr('entry' + me())}</div>
  <p class="center small" style="text-align:center"><b>${esc(me())}</b> · Entrée validée à ${hhmm(S.entryAt)}</p>
  <p class="fine">Présente ce QR à la sécurité pour sortir et revenir (jusqu’à 03:00).</p>`;
const sSafety = () => `<p class="sheet-title">Rentrer en sécurité</p><p class="small muted" style="margin:4px 0 16px">Parce qu’une bonne soirée se termine bien.</p>
  <div class="action-list">
    <button class="action" data-a="safeRide"><span class="ai">${ic('car')}</span><span><b>Commander un VTC</b><span class="xs muted" style="display:block">Prise en charge devant le club · ~6 min</span></span></button>
    <button class="action" data-a="shareTrip"><span class="ai">${ic('share')}</span><span><b>Partager mon trajet</b><span class="xs muted" style="display:block">Envoie un lien de suivi à un proche</span></span></button>
    <button class="action" data-a="help"><span class="ai" style="color:#ff8b97">${ic('shield')}</span><span><b>Besoin d’aide, discrètement</b><span class="xs muted" style="display:block">La sécurité vient te trouver</span></span></button>
    <a class="action" href="tel:112" style="color:inherit;text-decoration:none"><span class="ai">${ic('phone')}</span><span><b>Urgences · 112</b><span class="xs muted" style="display:block">Appel direct</span></span></a>
  </div>`;
const sHelp = () => `<p class="sheet-title">Alerte discrète</p><p class="small muted" style="margin:4px 0 4px">Un agent de sécurité vient te retrouver, sans que personne ne le remarque. Où es-tu ?</p>
  <div class="options" style="margin-top:14px">${['Piste principale', 'Près du bar principal', 'Toilettes', 'Rooftop', 'Entrée / fumoir'].map(z => `<button class="opt" data-a="sendHelp" data-v="${z}">${z}${ic('chev', 18)}</button>`).join('')}</div>
  <p class="fine">Démo : aucune alerte réelle n’est envoyée.</p>`;
const sDecline = id => `<p class="sheet-title">Refuser la demande</p><p class="small muted" style="margin:4px 0 14px">Le client verra ta raison — reste sympa 😉</p>
  <div class="options">${DECLINE_REASONS.map(r => `<button class="opt" data-a="djDeclineGo" data-id="${id}" data-v="${r}">${r}${ic('chev', 18)}</button>`).join('')}</div>`;

/* ---------- Takeover ---------- */
function renderTakeover() {
  const el = $('#takeover'), tk = S.takeover;
  if (!tk) { el.classList.remove('open'); el.innerHTML = ''; return; }
  if (tk.type === 'order') {
    const o = S.orders.find(x => x.id === tk.id); if (!o) { S.takeover = null; return renderTakeover(); }
    el.innerHTML = `<div class="tko"><p class="eyebrow" style="color:rgba(16,20,10,.6)">Club&amp;Co · ${CLUB.name}</p><p class="big" style="margin-top:14px">C’est prêt !</p>
      <p class="code-big">${o.code}</p><p><b>${pickupLabel(o)}</b></p><p class="small" style="opacity:.7;margin-top:4px">${o.lines.map(l => `${l.qty}× ${esc(l.name)}`).join(' · ')}</p>
      <div style="display:grid;gap:10px;width:100%;margin-top:34px"><button class="btn block" data-a="tkoOrder" data-id="${o.id}">${ic('qr', 18)} Afficher mon code</button><button class="btn ghost block" data-a="tkoClose">J’y vais</button></div></div>`;
  } else {
    const r = S.requests.find(x => x.id === tk.id);
    el.innerHTML = `<div class="tko violet"><span class="eq" style="height:40px;transform:scale(1.6)"><i></i><i></i><i></i><i></i></span><p class="big" style="margin-top:30px">C’est ton son !</p>
      <p class="h2" style="margin-top:22px;font-size:22px">${esc(r?.t || '')}</p><p style="opacity:.75">${esc(r?.a || '')}</p>
      <div style="display:grid;gap:10px;width:100%;margin-top:40px"><button class="btn block" data-a="tkoClose">Je fonce sur la piste 🕺</button></div></div>`;
  }
  el.classList.add('open');
}

/* ---------- Rendu ---------- */
function keepFocus(fn) {
  const a = document.activeElement, id = a && a.id, s = a && a.selectionStart;
  fn();
  if (id) { const el = document.getElementById(id); if (el && el !== a) { el.focus({ preventScroll: true }); try { el.setSelectionRange(s, s); } catch (e) { /* ignore */ } } }
}
let lastKey = '';
function render() {
  keepFocus(() => {
    const view = $('#view');
    let html, key;
    const sc = S.screen;
    if (S.pro) { html = ({ bar: vProBar, dj: vProDJ, coat: vProCoat }[S.pro] || vProBar)(); key = 'pro' + S.pro; }
    else if (!S.user) { html = vOnboarding(); key = 'onb'; }
    else if (sc) { html = sc.name === 'order' ? vOrder(sc.id) : sc.name === 'account' ? vAccount() : sc.name === 'outings' ? vOutings() : vOuting(sc.id); key = sc.name + (sc.id || ''); }
    else if (!S.checkedIn) { html = vLobby(); key = 'lobby'; }
    else { html = ({ home: vHome, bar: vBar, music: vMusic, orders: vOrders, night: vNight }[S.tab] || vHome)(); key = S.tab; }
    view.innerHTML = html;
    const showNav = !!(S.user && !S.pro && S.checkedIn && (!sc || sc.name === 'order'));
    const showCart = showNav && !S.screen && S.tab === 'bar' && S.cart.length > 0;
    view.className = !showNav ? 'no-nav' : showCart ? 'with-cart' : '';
    if (key !== lastKey) { $('#scroll').scrollTop = 0; lastKey = key; }
    renderNav(showNav); renderCart(showCart);
    $('#offline').classList.toggle('show', !navigator.onLine);
  });
  renderTakeover();
  updateLive();
}
function renderNav(show) {
  const nav = $('#nav'); nav.classList.toggle('hide', !show);
  if (!show) return;
  const act = activeOrders().length, tabs = [['home', 'Club', 'home'], ['bar', 'Bar', 'glass'], ['music', 'Sons', 'music', myPending().length], ['orders', 'Commandes', 'clock', act], ['night', 'Soirée', 'moon']];
  nav.innerHTML = tabs.map(([k, l, i, b]) => `<button class="${S.tab === k && !S.screen ? 'on' : ''}" data-a="tab" data-tab="${k}"><span class="ni">${ic(i, 21)}</span>${l}${b ? `<span class="badge">${b}</span>` : ''}</button>`).join('');
}
let lastCount = 0;
function renderCart(show) {
  const el = $('#cartbar'), n = cartCount();
  el.classList.toggle('hide', !show);
  if (!show) return;
  el.innerHTML = `<button class="cart-pill ${n !== lastCount ? 'bump' : ''}" data-a="cart"><span class="count">${n}</span>Voir le panier<span class="go">${euro(cartSub())} ${ic('chev', 18)}</span></button>`;
  lastCount = n;
}
function go(target) {
  S.pro = null; closeSheet();
  if (target.startsWith('order:')) S.screen = { name: 'order', id: target.slice(6) };
  else { S.screen = null; S.tab = target; }
  save(); render();
}

/* ---------- Actions ---------- */
const A = {
  enter() {
    const name = ($('#onb-name').value || '').trim();
    if (!name) { flash('Indique ton prénom'); return $('#onb-name').focus(); }
    if (!$('#onb-age').checked) return flash('Coche la case : Club&Co est réservé aux 18 ans et plus');
    S.user = { name: name.charAt(0).toUpperCase() + name.slice(1) };
    S.account = { email: ($('#onb-email').value || '').trim(), phone: '' };
    S.screen = null; save(); render();
  },
  scan() {
    openSheet(() => `<p class="sheet-title">Scanner le QR du club</p><p class="small muted" style="margin-top:4px">Vise le QR code affiché à l’entrée du club.</p>
      <div class="viewfinder"><video id="cam" playsinline muted></video><div class="vf-qr">${qr('club-nebula')}</div><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="laser"></span></div>
      <p class="fine">Démo : la détection du QR est simulée.</p>`);
    startCam();
    scanTimer = setTimeout(() => checkIn('qr'), 3000);
  },
  ticketLink: () => { draft = { email: (S.account && S.account.email) || '' }; openSheet(sShotgun); },
  sgSearch() {
    if (!/^\S+@\S+\.\S+$/.test(draft.email.trim())) { flash('Entre l’e-mail de ton compte Shotgun'); return $('#sg-mail')?.focus(); }
    sheetFn = null;
    $('.sheet-body').innerHTML = `<div class="paying"><div><div class="ring"></div><p class="sheet-title">Recherche de ton billet…</p><p class="small muted" style="margin-top:6px">${esc(draft.email)}</p></div></div>`;
    setTimeout(() => {
      $('.sheet-body').innerHTML = `<p class="sheet-title">Billet trouvé 🎉</p>
        <div class="found"><div class="row between"><span class="chip ok">${ic('check', 12)} Shotgun</span><span class="xs muted">Ce soir</span></div>
          <p class="h2" style="margin-top:12px">${CLUB.event}</p><p class="small muted">${CLUB.name} · ${CLUB.area}</p>
          <div class="sec-row" style="margin-top:12px"><span>Billet</span><b>Early Bird · 15 €</b></div><div class="sec-row"><span>Statut</span><b class="lime">Scanné à l’entrée · ${hhmm(now())}</b></div></div>
        <button class="btn lime block" style="margin-top:16px" data-a="sgEnter">Entrer dans la soirée ${ic('chev', 18)}</button>`;
    }, 1500);
  },
  sgEnter() {
    S.ticket = { src: 'Shotgun', type: 'Early Bird · 15 €', ref: 'SG-' + Math.random().toString(36).slice(2, 8).toUpperCase() };
    if (S.account && !S.account.email) S.account.email = draft.email.trim();
    checkIn('shotgun');
  },
  account: () => { closeSheet(); S.screen = { name: 'account' }; save(); render(); },
  outings: () => { S.screen = { name: 'outings' }; save(); render(); },
  outing: d => { S.screen = { name: 'outing', id: d.id }; save(); render(); },
  toggleWallet() { S.wallet = !S.wallet; if (!S.wallet && S.pay === 'wallet') S.pay = S.cards[0]?.id || null; if (S.wallet && !payOk()) S.pay = 'wallet'; save(); render(); },
  addCard() {
    const brand = pick(['VISA', 'MC', 'AMEX']), id = 'c' + uid();
    S.cards.push({ id, brand, last4: String(1000 + Math.floor(Math.random() * 9000)), exp: `0${1 + Math.floor(Math.random() * 9)}/2${8 + Math.floor(Math.random() * 2)}` });
    if (!payOk()) S.pay = id;
    save(); render(); flash('Carte de test ajoutée');
  },
  delCard: d => { if (!confirm('Supprimer cette carte ?')) return; S.cards = S.cards.filter(c => c.id !== d.id); if (!payOk()) S.pay = S.wallet ? 'wallet' : (S.cards[0]?.id || null); save(); render(); },
  defCard: d => { S.pay = d.id; save(); render(); },
  proLogin: () => { draft = { id: '', code: '', err: '' }; openSheet(sProLogin); },
  proGo() {
    const id = draft.id.trim().toLowerCase(), role = PRO_ACCOUNTS[id];
    if (!role || draft.code !== PRO_CODE) { draft.err = 'Identifiant ou code incorrect'; draft.code = ''; refreshSheet(); return; }
    S.pro = role; S.proUser = id; closeSheet(); save(); render(); flash(`Connecté · ${id}`);
  },
  proLogout: () => { S.pro = null; S.proUser = null; save(); render(); },
  endNight() {
    if (activeOrders().length) return flash('Tu as encore une commande en cours au bar');
    if (S.coat && S.coat.status !== 'done') return flash(`N’oublie pas ton vestiaire : #${S.coat.num} · ${S.coat.initials || ''}`);
    if (!confirm('Terminer ta soirée ? Elle sera rangée dans « Mes sorties ».')) return;
    S.outings.unshift({
      id: uid(), club: CLUB.name, event: CLUB.event, spent: spent(), songs: S.requests.filter(r => r.mine).length, coat: !!S.coat, ticket: S.ticket?.src || '',
      date: new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
      orders: S.orders.filter(o => o.status !== 'cancelled').map(o => ({ code: o.code, time: hhmm(o.at), lines: o.lines.map(l => `${l.qty}× ${l.name}`).join(' · '), total: o.total })),
    });
    const keep = ['user', 'account', 'cards', 'wallet', 'pay', 'outings', 'points', 'notifOn', 'budget'].reduce((o, k) => ({ ...o, [k]: S[k] }), {});
    S = { ...seed(), ...keep }; save(); render(); flash('Soirée terminée — rentre bien 🌙');
  },
  tab: d => { S.tab = d.tab; S.screen = null; save(); render(); },
  cat: d => { S.cat = d.cat; save(); render(); },
  setBar: d => { S.bar = d.bar; save(); render(); },
  item: d => { const m = byId(d.id); draft = { id: d.id, qty: 1, premium: false, ice: m.ice ? 'Normal' : null, table: '', giftOn: false, gift: '' }; openSheet(sItem); },
  quickAdd: (d, e) => { e.stopPropagation(); addLine({ id: d.id, qty: 1, premium: false, ice: byId(d.id).ice ? 'Normal' : null }); if (byId(d.id).table) { A.item(d); } },
  d: d => { draft[d.k] = d.v === '' ? false : d.v === '1' ? true : d.v; refreshSheet(); },
  dQty: d => { draft.qty = Math.max(1, Math.min(20, draft.qty + +d.v)); refreshSheet(); },
  addToCart() {
    const m = byId(draft.id);
    if (m.table && !String(draft.table).trim()) { flash('Indique ton numéro de table'); $('#d-table')?.focus(); return; }
    addLine({ ...draft, gift: draft.giftOn ? (draft.gift.trim() || 'un·e ami·e') : null });
    closeSheet();
  },
  cart: () => openSheet(sCart),
  lineQty: d => { const l = S.cart.find(x => x.key === d.k); if (!l) return; l.qty += +d.v; if (l.qty <= 0) S.cart = S.cart.filter(x => x !== l); save(); render(); refreshSheet(); if (!S.cart.length) closeSheet(); },
  tip: d => { S.tip = +d.v; save(); refreshSheet(); },
  payM: d => { S.pay = d.v; save(); refreshSheet(); },
  pay() {
    if (!navigator.onLine) return flash('Pas de réseau — connecte-toi au Wi-Fi du club pour payer');
    askNotif();
    $('.sheet-body').innerHTML = sPaying(false); sheetFn = null;
    setTimeout(() => {
      $('.sheet-body').innerHTML = sPaying(true); if (navigator.vibrate) navigator.vibrate(40); chime(true);
      setTimeout(() => {
        const t = now(), table = S.cart.find(l => l.table)?.table || null, tip = tipAmt();
        const o = { id: uid(), code: genCode(), lines: S.cart.map(l => ({ id: l.id, name: l.name + (l.premium ? ' (premium)' : ''), qty: l.qty, unit: l.unit, gift: l.gift, alcohol: l.alcohol, note: [l.ice && l.ice !== 'Normal' ? l.ice + ' glaçons' : '', l.gift ? 'Offert à ' + l.gift : ''].filter(Boolean).join(' · ') })),
          total: cartSub() + tip, tip, bar: S.bar, table, status: 'received', at: t, prepAt: t + PREP_DELAY, readyAt: t + READY_DELAY + (table ? 6000 : 0) };
        S.orders.unshift(o); S.points += Math.floor(o.total); S.cart = []; S.tip = 0; S.screen = { name: 'order', id: o.id };
        save(); closeSheet(); render();
        if (o.lines.some(l => l.gift)) setTimeout(() => flash(`🎁 ${o.lines.find(l => l.gift).gift} a reçu le code ${o.code}`), 1500);
      }, 900);
    }, 1400);
  },
  openOrder: d => { S.screen = { name: 'order', id: d.id }; save(); render(); },
  back: () => { S.screen = null; save(); render(); },
  picked: d => { const o = S.orders.find(x => x.id === d.id); if (o) { o.status = 'picked'; o.manual = true; } S.screen = null; save(); render(); flash('Santé ! 🥂 Bonne soirée'); },
  reorder: d => { const o = S.orders.find(x => x.id === d.id); o.lines.forEach(l => { const m = byId(l.id); if (m) addLine({ id: l.id, qty: l.qty, premium: /premium/.test(l.name), ice: m.ice ? 'Normal' : null, table: o.table || '' }, true); }); S.screen = null; S.tab = 'bar'; save(); render(); openSheet(sCart); },
  addWater: () => { addLine({ id: 'f4', qty: 1 }, true); S.tab = 'bar'; S.cat = 'softs'; save(); render(); openSheet(sCart); },
  propose: d => { if (myPending().length >= 3) return flash('3 demandes en attente max — attends une réponse du DJ'); draft = { track: TRACKS.find(t => t.id === d.id), msg: '', boost: false }; openSheet(sPropose); },
  proposeCustom: () => { if (myPending().length >= 3) return flash('3 demandes en attente max — attends une réponse du DJ'); draft = { track: { id: 'c' + uid(), t: query.trim(), a: 'Titre libre' }, msg: '', boost: false }; openSheet(sPropose); },
  sendReq() {
    const tr = draft.track;
    if (S.requests.some(r => r.t.toLowerCase() === tr.t.toLowerCase() && ['pending', 'accepted'].includes(r.status))) { closeSheet(); return flash('Déjà demandé — vote pour lui dans la liste ❤️'); }
    const r = { id: uid(), t: tr.t, a: tr.a, by: me(), mine: true, votes: 1, voted: false, status: 'pending', boost: !!draft.boost, msg: clean(draft.msg.trim()), at: now(), respondAt: now() + (draft.boost ? 9000 : 14000 + Math.random() * 8000) };
    S.requests.unshift(r);
    if (r.boost) S.extras.push({ ref: r.id, label: 'Boost DJ', amount: 3 });
    askNotif(); query = ''; closeSheet(); save(); render();
    flash(r.boost ? '⚡ Demande boostée envoyée au DJ' : '🎧 Demande envoyée au DJ');
  },
  vote: (d, e) => { e.stopPropagation(); const r = S.requests.find(x => x.id === d.id); if (!r || r.mine) return; r.voted = !r.voted; r.votes += r.voted ? 1 : -1; if (navigator.vibrate) navigator.vibrate(15); save(); render(); },
  notifs: () => { openSheet(sNotifs); save(); render(); },
  goNotif: d => { const n = S.notifs.find(x => x.id === d.id); closeSheet(); if (n && n.go) go(n.go); },
  ticket: () => openSheet(sTicket),
  cancelOrder(d) {
    const o = S.orders.find(x => x.id === d.id);
    if (!o || o.status !== 'received') return flash('Trop tard, le bar a déjà commencé ta commande');
    if (!confirm(`Annuler la commande ${o.code} et être remboursé ?`)) return;
    o.refunded = o.total; S.points = Math.max(0, S.points - Math.floor(o.total)); o.total = 0; o.status = 'cancelled'; o.manual = true;
    save(); render(); flash(`${euro(o.refunded)} remboursés`);
  },
  orderIssue: d => openSheet(() => sIssue(d.id)),
  issueGo(d) {
    const o = S.orders.find(x => x.id === d.id), [issue, fix] = ISSUES[+d.v];
    if (!o) return;
    o.issue = issue; o.issueFix = fix; closeSheet(); save(); render();
    notify('Signalement envoyé', `${o.code} · ${fix}`, { go: 'order:' + o.id, soft: true });
  },
  barPause: () => { S.barPaused = !S.barPaused; save(); render(); flash(S.barPaused ? 'Commandes en pause — les clients sont prévenus' : 'Commandes réouvertes'); },
  proCoat(d) { const c = d.id === 'mine' ? S.coat : S.fakeCoats.find(x => x.id === d.id); if (!c) return; setCoat(c, d.st); save(); render(); },
  safety: () => openSheet(sSafety),
  safeRide: () => { closeSheet(); flash('🚗 Ouverture de ton appli VTC (démo)'); },
  shareTrip: async () => {
    closeSheet();
    const data = { title: 'Club&Co', text: `Je rentre du ${CLUB.name}, suis mon trajet en direct 🚕` };
    if (navigator.share) { try { await navigator.share(data); } catch (e) { /* annulé */ } } else flash('🔗 Lien de suivi copié (démo)');
  },
  help: () => openSheet(sHelp),
  sendHelp: d => { closeSheet(); if (navigator.vibrate) navigator.vibrate(30); notify('Alerte envoyée 🛡️', `Un agent arrive · ${d.v} · ≈ 2 min. Reste où tu es.`, { soft: true }); },
  coatDeposit() { draft = { initials: me().replace(/[^A-Za-z]/g, '').slice(0, 1).toUpperCase(), desc: '', items: 1 }; openSheet(sCoat); },
  cItems: d => { draft.items = Math.max(1, Math.min(4, draft.items + +d.v)); refreshSheet(); },
  coatPay() {
    if (!/^[A-Z]{2,3}$/.test(draft.initials)) { flash('Indique 2 ou 3 initiales (prénom + nom)'); $('#c-ini')?.focus(); return; }
    if (!navigator.onLine) return flash('Pas de réseau — connecte-toi au Wi-Fi du club pour payer');
    askNotif(); const d = draft; sheetFn = null;
    $('.sheet-body').innerHTML = sPaying(false);
    setTimeout(() => {
      $('.sheet-body').innerHTML = sPaying(true, 'Ton numéro de vestiaire arrive'); chime(true);
      setTimeout(() => {
        S.coat = { num: 150 + Math.floor(Math.random() * 300), initials: d.initials, desc: d.desc.trim(), items: d.items, status: 'paid', at: now() };
        S.extras.push({ label: 'Vestiaire', amount: 3 * d.items });
        closeSheet(); save(); render();
      }, 800);
    }, 1200);
  },
  coatStored: () => { setCoat(S.coat, 'stored'); save(); render(); },
  coatFetch() { setCoat(S.coat, 'fetching'); S.coat.readyAt = now() + 10000; save(); render(); flash('On prépare ton manteau, on te prévient'); },
  coatDone() { S.coat.status = 'done'; save(); render(); flash('Bon retour 👋'); },
  budget: d => { S.budget = d.v ? +d.v : null; save(); render(); },
  async toggleNotif() {
    if (S.notifOn) { S.notifOn = false; save(); render(); return; }
    const ok = await askNotif();
    if (!ok) flash('Notifications système indisponibles ici — les alertes in-app restent actives');
    render();
  },
  pro: d => { S.pro = d.mode; save(); render(); },
  exitPro: () => A.proLogout(),
  proOrder(d) {
    const o = S.orders.find(x => x.id === d.id) || S.fakeOrders.find(x => x.id === d.id);
    if (!o) return;
    if (S.orders.includes(o)) o.manual = true;
    setOrderStatus(o, d.st);
    if (d.st === 'ready' && S.orders.includes(o)) flash(`📲 ${me()} vient d’être notifié·e`);
    save(); render();
  },
  djAccept: d => { const r = S.requests.find(x => x.id === d.id); setReq(r, 'accepted'); if (!r.mine) flash('Ajouté à ta file'); save(); render(); },
  djDecline: d => openSheet(() => sDecline(d.id)),
  djDeclineGo: d => { const r = S.requests.find(x => x.id === d.id); setReq(r, 'declined', d.v); closeSheet(); save(); render(); },
  djPlay: d => { const r = S.requests.find(x => x.id === d.id); setReq(r, 'played'); flash(`▶︎ ${r.t} sur les platines`); save(); render(); },
  tkoOrder: d => { S.takeover = null; S.screen = { name: 'order', id: d.id }; save(); render(); },
  tkoClose: () => { S.takeover = null; render(); },
  closeSheet,
  reset() { if (!confirm('Réinitialiser toute la démo ?')) return; try { localStorage.removeItem(STORE); } catch (e) { /* ignore */ } S = seed(); query = ''; closeSheet(); render(); },
};

function addLine(o) {
  const m = byId(o.id), unit = m.price + (o.premium ? 3 : 0);
  const key = [o.id, o.premium ? 'p' : '', o.ice || '', o.table || '', o.gift || ''].join('|');
  const ex = S.cart.find(l => l.key === key);
  if (ex) ex.qty += o.qty;
  else S.cart.push({ key, id: o.id, name: m.name, qty: o.qty, unit, premium: !!o.premium, ice: o.ice || null, table: m.table ? String(o.table || '').trim() || null : null, gift: o.gift || null, alcohol: !m.soft });
  if (m.table && !S.cart.find(l => l.key === key).table) S.cart = S.cart.filter(l => l.key !== key); // bouteille sans table : passe par la fiche
  if (navigator.vibrate) navigator.vibrate(12);
  save(); render();
}

/* ---------- Événements ---------- */
document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el || el.disabled) return;
  const fn = A[el.dataset.a];
  if (fn) { if (el.tagName !== 'A') e.preventDefault(); fn(el.dataset, e); }
});
const IN = {
  query: v => { query = v; const r = $('#results'); if (r) r.innerHTML = resultsHTML(); },
  dTable: v => { draft.table = v.replace(/\D/g, ''); },
  dGift: v => { draft.gift = v; },
  dMsg: v => { draft.msg = v; },
  cIni: (v, el) => { draft.initials = v.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3); if (el.value !== draft.initials) el.value = draft.initials; },
  cDesc: v => { draft.desc = v; },
  acName: v => { if (v.trim()) { S.user.name = v.trim(); save(); } },
  acEmail: v => { S.account = { ...(S.account || {}), email: v.trim() }; save(); },
  acPhone: v => { S.account = { ...(S.account || {}), phone: v.trim() }; save(); },
  sgMail: v => { draft.email = v; },
  proId: v => { draft.id = v; },
  proCode: v => { draft.code = v; },
  coatQ: v => { coatQ = v; const r = $('#coat-list'); if (r) r.innerHTML = coatListHTML(); },
};
document.addEventListener('input', e => { const k = e.target.dataset.in; if (k && IN[k]) IN[k](e.target.value, e.target); });
document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.target.id === 'onb-name') A.enter();
  if (e.key === 'Enter' && e.target.id === 'pro-code') A.proGo();
  if (e.key === 'Enter' && e.target.id === 'sg-mail') A.sgSearch();
  if (e.key === 'Escape') { if (S.takeover) A.tkoClose(); else closeSheet(); }
});
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') tick(); });

render();
setInterval(tick, 1000);
