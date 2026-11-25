// Schița „The 4 Layers of How a Team Works”, v3: ORDINEA din metodologia Wise Teams, nu o stivă (Ioana, 2026-11-25).
// Alex: „contrazice puțin metodologia noastră, care zice că există o ordine.”
// Ordinea: the Container (terenul) → 1 Aligned (Delivery) → 2 Moving efficiently (Flow + Trust)
//          → 3 Delivering consistently (Delivery) → 4 Building the future (Anticipation) → An emergent team.
// Rulare: node gen.mjs   → a-drumul.svg, b-treptele.svg, c-harta.svg
// Textele și culorile stau mai jos, într-un singur loc (T, C). Numele etapelor în engleză sunt propunere.
// Font: Poppins (Wise Teams) nu e pe acest calculator; PNG-urile ies în Avenir Next.
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AICI = dirname(fileURLToPath(import.meta.url));
const FONT_STACK = '"Avenir Next", "Poppins", Avenir, "Helvetica Neue", Arial, sans-serif';

const C = {
  bg: '#F6F3EE', ink: '#1C1C1E', muted: '#5E5A55', card: '#FFFFFF', line: '#E4DDD2',
  road: '#E7DFD3', roadDots: '#B3A896',
  coral: '#DD4F3B', coralFill: '#CF4430', coralText: '#B83A28',   // Delivery
  orange: '#F4A533', orangeText: '#9A5A00',                        // Anticipation
  teal: '#2E9496', tealFill: '#1B7779', tealText: '#1B7779',       // Flow
  indigo: '#3A4FC6',                                               // Trust
  amberLight: '#FFD38A', halo: '#F4A533',
  sand: '#ECE5D9', sandLine: '#D3C9B8',
};

const T = {
  brand: 'Wise Teams',
  title: ['The 4 Layers of', 'How a Team Works'],
  stages: [
    { n: 1, name: 'Aligned', layer: 'DELIVERY', phrase: 'Priorities understood the same way', colors: [C.coral], text: C.coralText, fill: C.coralFill, fillInk: '#FFFFFF' },
    { n: 2, name: 'Moving efficiently', layer: 'FLOW + TRUST', phrase: 'Work flows, hard things get said', colors: [C.teal, C.indigo], text: C.tealText, fill: C.tealFill, fillInk: '#FFFFFF' },
    { n: 3, name: 'Delivering consistently', layer: 'DELIVERY', phrase: 'Results come steadily', colors: [C.coral], text: C.coralText, fill: C.coralFill, fillInk: '#FFFFFF' },
    { n: 4, name: 'Building the future', layer: 'ANTICIPATION', phrase: 'Seeing change early', colors: [C.orange], text: C.orangeText, fill: C.orange, fillInk: C.ink },
  ],
  dest: { eyebrow: 'DESTINATION', name: 'An emergent team', phrase: 'More than the sum of its parts' },
  container: 'The Container',
  containerEyebrow: 'WHERE IT STARTS',
  containerItems: ['Why we exist', 'Who we exist for', ['What we want to inspire', 'in each other'], 'Roles and rules'],
  culprit: 'Trust: the hidden culprit',
};

const W = 1456, PAD = 104;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
function text(x, y, s, { size = 48, weight = 400, fill = C.ink, anchor = 'start', max = 0, ls = 0 } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${max ? ` data-max="${max}"` : ''}>${esc(s)}</text>`;
}
const eyebrow = (x, y, s, fill, max, anchor = 'start') => text(x, y, s, { size: 38, weight: 700, fill, ls: 4, max, anchor });
const rect = (x, y, w, h, fill, rx = 28, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
function chip(x, y, s, { fill, ink, size = 40, anchor = 'start' }) {
  const w = Math.round(s.length * size * 0.56 + 56), h = size + 28;
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  return `<g data-chip="1">${rect(x0, y, w, h, fill, h / 2)}${text(x0 + w / 2, y + h / 2 + size * 0.35, s, { size, weight: 600, fill: ink, anchor: 'middle', max: w - 32 })}</g>`;
}
function svg(H, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<style>text{font-family:${FONT_STACK}}</style>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
${body}
</svg>`;
}
function header(sub) {
  return text(PAD, 128, T.brand, { size: 46, weight: 700, fill: C.orangeText, max: 600 })
    + text(PAD, 254, T.title[0], { size: 88, weight: 700, max: W - 2 * PAD, ls: -1 })
    + text(PAD, 352, T.title[1], { size: 88, weight: 700, max: W - 2 * PAD, ls: -1 })
    + text(PAD, 438, sub, { size: 48, weight: 400, fill: C.muted, max: W - 2 * PAD });
}
function containerBlock(x, y, w) {
  const h = 400, colW = (w - 96) / 2;
  let s = rect(x, y, w, h, C.sand, 32, `stroke="${C.sandLine}" stroke-width="3"`);
  s += eyebrow(x + 48, y + 70, T.containerEyebrow, C.muted, 700);
  s += text(x + 48, y + 146, T.container, { size: 64, weight: 700, max: w - 96 });
  T.containerItems.forEach((it, i) => {
    const cx = x + 48 + (i % 2) * colW, cy = y + 222 + Math.floor(i / 2) * 74;
    const lines = Array.isArray(it) ? it : [it];
    s += `<circle cx="${cx + 9}" cy="${cy - 14}" r="8" fill="${C.ink}"/>`;
    lines.forEach((l, k) => { s += text(cx + 34, cy + k * 56, l, { size: 46, weight: 500, max: colW - 50 }); });
  });
  return { svg: s, h };
}

// Drumul: curbă netedă prin puncte (Catmull-Rom → Bézier), lată, cu punctele pe mijloc, ca în materialele Wise.
function smooth(pts) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return d;
}
const road = d => `<path d="${d}" stroke="${C.road}" stroke-width="46" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`
  + `<path d="${d}" stroke="${C.roadDots}" stroke-width="7" fill="none" stroke-linecap="round" stroke-dasharray="0 20"/>`;

// Stația: cerc alb, inel în culoarea capabilității, în interior o rețea de 5 noduri
// care are tot mai multe legături de la o etapă la alta (echipa devine tot mai conectată).
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3], [2, 4], [3, 0], [4, 1]];
function station(cx, cy, st, r = 84) {
  const n = { 1: 3, 2: 5, 3: 7, 4: 9 }[st.n];
  let s = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.card}"/>`;
  if (st.colors.length === 2) {
    const rr = r - 9;
    s += `<path d="M${cx} ${cy - rr} A${rr} ${rr} 0 0 0 ${cx} ${cy + rr}" stroke="${st.colors[0]}" stroke-width="18" fill="none"/>`;
    s += `<path d="M${cx} ${cy - rr} A${rr} ${rr} 0 0 1 ${cx} ${cy + rr}" stroke="${st.colors[1]}" stroke-width="18" fill="none"/>`;
  } else s += `<circle cx="${cx}" cy="${cy}" r="${r - 9}" stroke="${st.colors[0]}" stroke-width="18" fill="none"/>`;
  const pr = r * 0.42, P = [...Array(5)].map((_, k) => [cx + pr * Math.cos((-90 + k * 72) * Math.PI / 180), cy + pr * Math.sin((-90 + k * 72) * Math.PI / 180)]);
  EDGES.slice(0, n).forEach(([a, b2]) => { s += `<path d="M${P[a][0].toFixed(1)} ${P[a][1].toFixed(1)} L${P[b2][0].toFixed(1)} ${P[b2][1].toFixed(1)}" stroke="${C.ink}" stroke-width="3"/>`; });
  P.forEach((p, k) => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="9" fill="${st.colors[k % st.colors.length]}"/>`; });
  s += `<circle cx="${cx - r * 0.72}" cy="${cy - r * 0.72}" r="27" fill="${C.ink}"/>`;
  s += text(cx - r * 0.72, cy - r * 0.72 + 11, String(st.n), { size: 32, weight: 700, fill: '#FFFFFF', anchor: 'middle' });
  return s;
}
// Destinația: rețea complet conectată, cu nodurile în toate cele patru culori.
function destination(cx, cy, r = 108) {
  let s = `<circle cx="${cx}" cy="${cy}" r="${r + 70}" fill="${C.halo}" opacity="0.14"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${C.card}" stroke="${C.line}" stroke-width="3"/>`;
  const cols = [C.coral, C.orange, C.teal, C.indigo], pr = r * 0.62;
  const P = [...Array(8)].map((_, k) => [cx + pr * Math.cos((-90 + k * 45) * Math.PI / 180), cy + pr * Math.sin((-90 + k * 45) * Math.PI / 180)]);
  for (let a = 0; a < 8; a++) for (let b2 = a + 1; b2 < 8; b2++) s += `<path d="M${P[a][0].toFixed(1)} ${P[a][1].toFixed(1)} L${P[b2][0].toFixed(1)} ${P[b2][1].toFixed(1)}" stroke="${C.ink}" stroke-width="1.6" opacity="0.7"/>`;
  P.forEach(p => { s += `<path d="M${cx} ${cy} L${p[0].toFixed(1)} ${p[1].toFixed(1)}" stroke="${C.ink}" stroke-width="1.6" opacity="0.7"/>`; });
  P.forEach((p, k) => { s += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="10" fill="${cols[k % 4]}"/>`; });
  s += `<circle cx="${cx}" cy="${cy}" r="11" fill="${C.teal}"/>`;
  return s;
}
function label(x, y, st, { anchor = 'start', max = 760, phrase = true, chipText = '' } = {}) {
  let s = eyebrow(x, y - 52, `${st.n} · ${st.layer}`, st.text, max, anchor);
  s += text(x, y + 14, st.name, { size: 56, weight: 700, max, anchor, ls: -0.5 });
  if (phrase) s += text(x, y + 70, st.phrase, { size: 44, weight: 500, fill: C.muted, max, anchor });
  if (chipText) s += chip(x, y + 96, chipText, { fill: C.amberLight, ink: C.ink, anchor });
  return s;
}
function destLabel(x, y, { anchor = 'start', max = 760 } = {}) {
  return eyebrow(x, y - 52, T.dest.eyebrow, C.orangeText, max, anchor)
    + text(x, y + 14, T.dest.name, { size: 60, weight: 700, max, anchor, ls: -0.5 })
    + text(x, y + 70, T.dest.phrase, { size: 44, weight: 500, fill: C.muted, max, anchor });
}

// ── A · Drumul: de la Container, prin cele patru etape, la echipa emergentă ─
function A() {
  const S = [[420, 1800], [300, 1520], [420, 1240], [300, 960]], D = [400, 680], LX = 580;
  const cTop = 2000;
  let b = header('');
  b += road(smooth([[420, cTop + 10], ...S, D]));
  b += destination(D[0], D[1]);
  b += destLabel(LX, D[1], { max: W - PAD - LX });
  T.stages.forEach((st, i) => {
    b += station(S[i][0], S[i][1], st);
    b += label(LX, S[i][1], st, { max: W - PAD - LX, chipText: st.n === 2 ? T.culprit : '' });
  });
  const cb = containerBlock(PAD - 32, cTop, W - 2 * PAD + 64);
  b += cb.svg;
  return svg(cTop + cb.h + 96, b, 'Wise Teams. How a team works, as a path: from the Container, 1 Aligned (Delivery), 2 Moving efficiently (Flow and Trust), 3 Delivering consistently (Delivery), 4 Building the future (Anticipation), to an emergent team.');
}

// ── B · Treptele: fiecare treaptă se sprijină pe cea de dinainte ────────────
function B() {
  const stepH = 220, off = 200, ground = 1740, R = W - PAD;
  let b = header('');
  const tops = [];
  T.stages.forEach((st, i) => {
    const x = PAD + i * off, top = ground - (i + 1) * stepH, w = R - x;
    tops.push([x, top]);
    if (st.colors.length === 2) {
      const tw = 300, xt = x + w - tw;
      b += `<clipPath id="t2"><rect x="${x}" y="${top}" width="${w}" height="${stepH}" rx="20"/></clipPath>`;
      b += `<g clip-path="url(#t2)"><rect x="${x}" y="${top}" width="${w - tw}" height="${stepH}" fill="${C.tealFill}"/><rect x="${xt}" y="${top}" width="${tw}" height="${stepH}" fill="${C.indigo}"/></g>`;
      b += eyebrow(xt + 36, top + 62, 'TRUST', C.amberLight, tw - 60);
      b += text(xt + 36, top + 128, 'the hidden', { size: 42, weight: 600, fill: '#FFFFFF', max: tw - 60 });
      b += text(xt + 36, top + 180, 'culprit', { size: 42, weight: 600, fill: '#FFFFFF', max: tw - 60 });
    } else b += rect(x, top, w, stepH, st.fill, 20);
    const ink = st.fillInk, tx = x + 40;
    b += eyebrow(tx, top + 62, `STEP ${st.n} · ${st.layer}`, ink, w - 80);
    b += text(tx, top + 132, st.name, { size: 52, weight: 700, fill: ink, max: w - 80, ls: -0.5 });
    b += text(tx, top + 186, st.phrase, { size: 42, weight: 500, fill: ink, max: w - 80 });
  });
  // linia urcușului, pe muchiile treptelor, până la destinație
  const D = [R - 150, tops[3][1] - 210];
  const climb = [[PAD, ground - 8], ...tops.map(([x, t]) => [x, t - 2])];
  let d = `M${climb[0][0]} ${climb[0][1]}`;
  climb.slice(1).forEach(([x, y]) => { d += ` L${x} ${y}`; });
  b += `<path d="${d}" stroke="${C.ink}" stroke-width="5" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>`;
  b += `<path d="M${tops[3][0]} ${tops[3][1] - 2} L${D[0] - 96} ${D[1] + 40}" stroke="${C.ink}" stroke-width="5" fill="none" stroke-dasharray="2 14" stroke-linecap="round"/>`;
  b += destination(D[0], D[1], 100);
  b += destLabel(D[0] - 200, D[1] - 50, { anchor: 'end', max: 900 });
  const cb = containerBlock(PAD - 32, ground + 24, W - 2 * PAD + 64);
  b += cb.svg;
  return svg(ground + 24 + cb.h + 96, b, 'Wise Teams. How a team works, as stairs: on the Container, step 1 Aligned (Delivery), step 2 Moving efficiently (Flow and Trust), step 3 Delivering consistently (Delivery), step 4 Building the future (Anticipation), up to an emergent team.');
}

// ── C · Harta: axele metodologiei (Prezent → Viitor, Sarcină ↔ Relație) ─────
function Cv() {
  const cx = W / 2, yS = 1690, yMid = 1280, yN = 960, yD = 660, xW = 250, xE = W - 250;
  let b = header('From present to future, through task and relationship.');
  const st = T.stages;
  // drumul: din 1 se desparte spre Flow și Trust, se reunește în 3, urcă în 4 și în destinație
  b += road(`M${cx} ${yS} L${xW} ${yMid} L${cx} ${yMid} L${xE} ${yMid} L${cx} ${yS} M${cx} ${yMid} L${cx} ${yD}`);
  // etichetele axelor
  b += eyebrow(cx - 120, yS + 14, 'PRESENT', C.muted, 300, 'end');
  b += eyebrow(cx - 120, yN + 14, 'FUTURE', C.muted, 300, 'end');
  // 1
  b += station(cx, yS, st[0]);
  b += eyebrow(cx + 120, yS - 18, '1 · DELIVERY', st[0].text, 500);
  b += text(cx + 120, yS + 46, st[0].name, { size: 56, weight: 700, max: 500, ls: -0.5 });
  // 2: două noduri, Flow (sarcina) și Trust (relația), aceeași etapă
  const flow = { ...st[1], colors: [C.teal] }, trust = { ...st[1], colors: [C.indigo] };
  b += station(xW, yMid, flow, 80); b += station(xE, yMid, trust, 80);
  b += text(xW, yMid + 140, 'Flow', { size: 52, weight: 700, fill: C.tealText, anchor: 'middle', max: 300 });
  b += text(xE, yMid + 140, 'Trust', { size: 52, weight: 700, fill: C.indigo, anchor: 'middle', max: 300 });
  b += eyebrow(xW, yMid + 196, 'TASK', C.muted, 300, 'middle');
  b += eyebrow(xE, yMid + 196, 'RELATIONSHIP', C.muted, 420, 'middle');
  b += chip(xE, yMid + 226, 'the hidden culprit', { fill: C.amberLight, ink: C.ink, anchor: 'middle', size: 34 });
  b += eyebrow(cx, yMid + 128, '2 · FLOW + TRUST', C.muted, 560, 'middle');
  b += text(cx, yMid + 192, st[1].name, { size: 52, weight: 700, anchor: 'middle', max: 560, ls: -0.5 });
  // 3: în mijloc, unde se întâlnesc Flow și Trust
  b += station(cx, yMid, st[2]);
  b += eyebrow(cx - 110, yMid - 210, '3 · DELIVERY', st[2].text, 400, 'end');
  b += text(cx - 110, yMid - 150, 'Delivering', { size: 52, weight: 700, max: 320, anchor: 'end', ls: -0.5 });
  b += text(cx - 110, yMid - 94, 'consistently', { size: 52, weight: 700, max: 320, anchor: 'end', ls: -0.5 });
  // 4
  b += station(cx, yN, st[3]);
  b += eyebrow(cx + 120, yN - 18, '4 · ANTICIPATION', st[3].text, 560);
  b += text(cx + 120, yN + 46, st[3].name, { size: 56, weight: 700, max: 560, ls: -0.5 });
  // destinația
  b += destination(cx, yD, 100);
  b += eyebrow(cx + 150, yD - 18, T.dest.eyebrow, C.orangeText, 500);
  b += text(cx + 150, yD + 46, T.dest.name, { size: 52, weight: 700, max: W - PAD - cx - 150, ls: -0.5 });
  const cb = containerBlock(PAD - 32, yS + 140, W - 2 * PAD + 64);
  b += cb.svg;
  return svg(yS + 140 + cb.h + 96, b, 'Wise Teams. The order on the methodology map, present to future and task to relationship: from the Container, 1 Aligned (Delivery) splits into 2 Flow and Trust, which meet again in 3 Delivering consistently, then 4 Building the future (Anticipation), to an emergent team.');
}

writeFileSync(join(AICI, 'a-drumul.svg'), A());
writeFileSync(join(AICI, 'b-treptele.svg'), B());
writeFileSync(join(AICI, 'c-harta.svg'), Cv());
console.log('ok');
