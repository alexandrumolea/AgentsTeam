// Schița „The 4 Layers of How a Team Works” (Ioana, 2026-11-25).
// Generează cele 3 variante ca SVG (fontul Inter Tight inclus în fișier, ca SVG-ul să arate la fel oriunde).
// Rulare: node gen.mjs   → a-stiva.svg, b-linia-apei.svg, c-doua-drumuri.svg
// Textele și culorile stau mai jos, într-un singur loc (T, C).
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AICI = dirname(fileURLToPath(import.meta.url));
const FONT = readFileSync(join(AICI, '../../../../site/dist/assets/fonts/inter-tight-latin-wght-normal.woff2')).toString('base64');

// Culori. Cu cât cobori, cu atât mai adânc (mai puțin vizibil, ține mai mult).
const C = {
  bg: '#F7F5F0', ink: '#1B2240', muted: '#5A6178',
  delivery: '#D6E6F5', anticipation: '#A3C3E6', flow: '#3C69A6', trust: '#1E2D58',
  container: '#ECE5D8', containerLine: '#C9BFAE',
  amber: '#F0A53C', coral: '#D65A4A', coralInk: '#A3362C', white: '#FFFFFF',
};

// Textele (engleză, numele exact ca la Sofia).
const T = {
  title: 'The 4 Layers of How a Team Works',
  layers: [
    { name: 'Delivery', phrase: 'Shared priorities, kept promises', fill: C.delivery, ink: C.ink },
    { name: 'Anticipation', phrase: 'Preparing ahead, not always firefighting', short: 'Preparing, not firefighting', fill: C.anticipation, ink: C.ink },
    { name: 'Flow', phrase: 'Coordination that’s designed, not ossified', short: 'Designed, not ossified', fill: C.flow, ink: C.white },
    { name: 'Trust', phrase: 'Truth at the table, not in the hallway', fill: C.trust, ink: C.white },
  ],
  container: 'The Container',
  containerItems: ['Why the team exists', 'What it delivers, to whom', 'Who plays which role', 'The rules it works by'],
  effect: 'the effect',
  culprit: 'the hidden culprit',
  signature: 'A Wise Teams model · Alexandru Molea',
};

const W = 1456, PAD = 104;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

// text: max = lățimea maximă permisă (verificată în randare), id = pentru verificarea coliziunilor
function text(x, y, s, { size = 50, weight = 500, fill = C.ink, anchor = 'start', max = 0, ls = 0 } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${max ? ` data-max="${max}"` : ''}>${esc(s)}</text>`;
}
const rect = (x, y, w, h, fill, rx = 28, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;

function chip(x, y, s, { fill, ink, size = 44, anchor = 'start' }) {
  // lățimea aproximativă; textul real e verificat în randare (data-chip)
  const w = Math.round(s.length * size * 0.5 + 56), h = size + 30;
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  return `<g data-chip="${w - 56}">${rect(x0, y, w, h, fill, h / 2)}${text(x0 + w / 2, y + h / 2 + size * 0.36, s, { size, weight: 600, fill: ink, anchor: 'middle', max: w - 40 })}</g>`;
}

function arrowDown(x, y1, y2, color, sw = 10) {
  return `<path d="M${x} ${y1} V${y2 - 22}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/><path d="M${x - 22} ${y2 - 30} L${x} ${y2} L${x + 22} ${y2 - 30}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}
function arrowUp(x, y1, y2, color, sw = 8) { // y1 jos, y2 sus
  return `<path d="M${x} ${y1} V${y2 + 20}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/><path d="M${x - 20} ${y2 + 28} L${x} ${y2} L${x + 20} ${y2 + 28}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function svg(H, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<style>@font-face{font-family:"Inter Tight";src:url(data:font/woff2;base64,${FONT}) format("woff2");font-weight:100 900}
text{font-family:"Inter Tight",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif}</style>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
${body}
</svg>`;
}

function header(sub) {
  return text(PAD, 168, T.title, { size: 68, weight: 700, max: W - 2 * PAD, ls: -1 })
    + text(PAD, 246, sub, { size: 50, weight: 500, fill: C.muted, max: W - 2 * PAD });
}
const footer = H => text(W - PAD, H - 72, T.signature, { size: 40, weight: 500, fill: C.muted, anchor: 'end', max: 900 });

function containerBlock(x, y, w, h) {
  const colW = (w - 96) / 2;
  let s = rect(x, y, w, h, C.container, 32, `stroke="${C.containerLine}" stroke-width="3"`);
  s += text(x + 48, y + 92, T.container, { size: 64, weight: 700, max: w - 96 });
  T.containerItems.forEach((it, i) => {
    const cx = x + 48 + (i % 2) * (colW + 0), cy = y + 172 + Math.floor(i / 2) * 70;
    s += `<circle cx="${cx + 9}" cy="${cy - 15}" r="8" fill="${C.ink}"/>`;
    s += text(cx + 34, cy, it, { size: 46, weight: 500, max: colW - 48 });
  });
  return s;
}

// ── A · Stiva: cardurile, de la ce se vede la ce ține ────────────────────────
function A() {
  const H = 1780, x = PAD, w = 1196, h = 196, gap = 20, top = 380;
  let b = header('What you see at the top has its roots below.');
  b += text(x, top - 30, '▲  Most visible', { size: 46, weight: 600, fill: C.muted, max: 600 });
  T.layers.forEach((L, i) => {
    const y = top + i * (h + gap);
    b += rect(x, y, w, h, L.fill, 28);
    b += text(x + 48, y + 90, L.name, { size: 76, weight: 700, fill: L.ink, max: 640, ls: -1 });
    b += text(x + 48, y + 158, L.phrase, { size: 50, weight: 500, fill: L.ink, max: w - 96 });
    if (i === 0) b += chip(x + w - 40, y + 36, T.effect, { fill: C.white, ink: C.ink, anchor: 'end' });
    if (i === 3) b += chip(x + w - 40, y + 36, T.culprit, { fill: C.amber, ink: C.ink, anchor: 'end' });
  });
  // Trust atinge fiecare nivel de deasupra: linia de chihlimbar, în dreapta stivei
  const lx = x + w + 56, yTrust = top + 3 * (h + gap) + h / 2, yDel = top + h / 2;
  b += `<path d="M${x + w} ${yTrust} H${lx} V${yDel + 26}" stroke="${C.amber}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  b += `<path d="M${lx - 20} ${yDel + 34} L${lx} ${yDel + 6} L${lx + 20} ${yDel + 34}" stroke="${C.amber}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  for (let i = 1; i < 3; i++) { const yy = top + i * (h + gap) + h / 2; b += `<path d="M${lx} ${yy} H${x + w}" stroke="${C.amber}" stroke-width="8" stroke-linecap="round"/>`; }
  b += `<path d="M${lx} ${yDel} H${x + w + 14}" stroke="${C.amber}" stroke-width="8" stroke-linecap="round"/>`;
  const after = top + 4 * (h + gap) - gap;
  b += text(x, after + 76, '▼  Less visible, holds the most', { size: 46, weight: 600, fill: C.muted, max: 900 });
  b += containerBlock(PAD - 32, after + 124, W - 2 * PAD + 64, 290);
  b += footer(H);
  return svg(H, b, 'The 4 layers of how a team works: Delivery, Anticipation, Flow, Trust, on top of the Container. Trust affects every layer above.');
}

// ── B · Linia apei: piramida, presiunea pe vârf ─────────────────────────────
function B() {
  const H = 1940, cx = W / 2, yTop = 560, yBot = 1500, wTop = 520, wBot = 1300;
  const wAt = y => wTop + (wBot - wTop) * (y - yTop) / (yBot - yTop);
  const bands = [[560, 740], [758, 958], [976, 1196], [1214, 1500]];
  let b = header('Delivery is the effect. Its roots are below.');
  // presiunea
  b += text(cx, 340, 'Pressure works for a moment.', { size: 52, weight: 700, fill: C.coralInk, anchor: 'middle', max: 1200 });
  b += text(cx, 408, 'Then it becomes allostatic load.', { size: 50, weight: 500, fill: C.ink, anchor: 'middle', max: 1200 });
  for (const dx of [-150, 0, 150]) b += arrowDown(cx + dx, 444, 536, C.coral, 10);
  bands.forEach(([y1, y2], i) => {
    const L = T.layers[i], a = wAt(y1) / 2, z = wAt(y2) / 2;
    b += `<path d="M${cx - a} ${y1} H${cx + a} L${cx + z} ${y2} H${cx - z} Z" fill="${L.fill}" stroke-linejoin="round"/>`;
    const mid = (y1 + y2) / 2, maxW = wAt(y1) - 80;
    if (i === 3) {
      b += `<path d="M${cx - a} ${y1} H${cx + a}" stroke="${C.amber}" stroke-width="10"/>`;
      b += text(cx, y1 + 88, L.name, { size: 72, weight: 700, fill: L.ink, anchor: 'middle', max: 400, ls: -1 });
      b += text(cx, y1 + 156, L.phrase, { size: 48, weight: 500, fill: L.ink, anchor: 'middle', max: maxW });
      b += chip(cx, y1 + 190, T.culprit, { fill: C.amber, ink: C.ink, anchor: 'middle' });
    } else {
      b += text(cx, mid - 6, L.name, { size: i === 0 ? 72 : 70, weight: 700, fill: L.ink, anchor: 'middle', max: maxW, ls: -1 });
      b += text(cx, mid + 58, i === 0 ? T.effect : (L.short || L.phrase), { size: 48, weight: 500, fill: L.ink, anchor: 'middle', max: maxW });
    }
  });
  // linia apei, între Delivery și restul
  const yw = 749;
  b += `<path d="M${PAD - 40} ${yw} H${W - PAD + 40}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="4 16" stroke-linecap="round"/>`;
  b += text(W - PAD + 40, yw - 22, 'seen', { size: 46, weight: 600, fill: C.muted, anchor: 'end', max: 240 });
  b += text(W - PAD + 40, yw + 58, 'unseen', { size: 46, weight: 600, fill: C.muted, anchor: 'end', max: 240 });
  b += containerBlock(PAD - 32, 1524, W - 2 * PAD + 64, 290);
  b += footer(H);
  return svg(H, b, 'The 4 layers as a pyramid: pressure lands on Delivery at the top, which is the only visible layer. Below the surface: Anticipation, Flow and Trust, on top of the Container.');
}

// ── C · Două drumuri: unde apăsăm vs. de unde vine rezultatul ───────────────
function Cv() {
  const H = 1560, lx = PAD, rx = 772, colW = 580;
  let b = header('Where we push, and where results come from.');
  // titlurile coloanelor
  b += text(lx, 360, 'If we push', { size: 54, weight: 700, fill: C.coralInk, max: colW });
  b += text(lx, 424, 'on Delivery', { size: 54, weight: 700, fill: C.coralInk, max: colW });
  b += text(rx, 360, 'If we build', { size: 54, weight: 700, fill: C.trust, max: colW });
  b += text(rx, 424, 'the layers below', { size: 54, weight: 700, fill: C.trust, max: colW });
  b += `<path d="M${W / 2 + 8} 320 V1370" stroke="${C.containerLine}" stroke-width="3"/>`;
  // stânga: presiune → sarcină → voință erodată
  const dl = 600;
  for (const dx of [130, 290, 450]) b += arrowDown(lx + dx, 476, 586, C.coral, 10);
  b += rect(lx, dl, colW, 140, C.delivery, 28);
  b += text(lx + colW / 2, dl + 92, 'Delivery', { size: 70, weight: 700, anchor: 'middle', max: colW - 60, ls: -1 });
  const steps = ['Works for a moment', 'Becomes allostatic load', 'Willpower erodes'];
  steps.forEach((s, i) => {
    const y = dl + 250 + i * 180;
    b += `<g opacity="${[1, 0.8, 0.6][i]}">${arrowDown(lx + colW / 2, y - 118, y - 46, C.coral, 8)}</g>`;
    b += text(lx + colW / 2, y + 20, s, { size: 52, weight: i === 2 ? 700 : 500, fill: i === 2 ? C.coralInk : C.ink, anchor: 'middle', max: colW });
  });
  // dreapta: stiva mică, cauza urcă
  const sw = 500, bh = 116, g = 14, y0 = 476;
  const rows = [...T.layers.map(L => ({ ...L })), { name: T.container, fill: C.container, ink: C.ink }];
  rows.forEach((L, i) => {
    const y = y0 + i * (bh + g) + (i === 4 ? 10 : 0);
    const hh = i === 3 ? bh + 70 : bh;
    const yy = i === 4 ? y + 70 : y;
    b += rect(rx, yy, sw, hh, L.fill, 24, i === 4 ? `stroke="${C.containerLine}" stroke-width="3"` : '');
    b += text(rx + 36, yy + 76, L.name, { size: 58, weight: 700, fill: L.ink, max: sw - 72, ls: -1 });
    if (i === 3) b += chip(rx + 36, yy + 104, T.culprit, { fill: C.amber, ink: C.ink, size: 40 });
  });
  const yBottom = y0 + 4 * (bh + g) + 80 + bh; // baza Containerului
  b += arrowUp(rx + sw + 46, yBottom - 40, y0 + 20, C.ink, 8);
  b += text(rx, yBottom + 92, 'Delivery follows', { size: 52, weight: 700, fill: C.trust, max: colW });
  b += text(rx, yBottom + 156, 'what holds it.', { size: 52, weight: 500, fill: C.trust, max: colW });
  b += footer(H);
  return svg(H, b, 'Two paths. Pushing on Delivery works for a moment, becomes allostatic load, and willpower erodes. Building the layers below (Anticipation, Flow, Trust, the Container) makes Delivery follow.');
}

writeFileSync(join(AICI, 'a-stiva.svg'), A());
writeFileSync(join(AICI, 'b-linia-apei.svg'), B());
writeFileSync(join(AICI, 'c-doua-drumuri.svg'), Cv());
console.log('ok');
