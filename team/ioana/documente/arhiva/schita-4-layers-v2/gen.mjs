// Schița „The 4 Layers of How a Team Works”, v2 în limbajul vizual Wise Teams (Ioana, 2026-11-25).
// Rulare: node gen.mjs   → a-stiva.svg, b-linia-apei.svg, c-doua-drumuri.svg
// Textele (din articolul v4) și culorile stau mai jos, într-un singur loc (T, C).
// Font: Wise Teams folosește Poppins. Poppins nu e pe acest calculator, așa că PNG-urile ies în Avenir Next
// (geometric, cel mai apropiat dintre fonturile de sistem). Când avem Poppins (OFL), îl punem primul în FONT_STACK
// și verificăm din nou lățimile (Poppins e puțin mai lat).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AICI = dirname(fileURLToPath(import.meta.url));
const FONT_STACK = '"Avenir Next", "Poppins", Avenir, "Helvetica Neue", Arial, sans-serif';

// Culorile Wise Teams pe capabilitate (luate aproximativ din materialele lor), plus variante mai închise
// acolo unde pe ele stă text (contrast AA, calculat).
const C = {
  bg: '#F6F3EE', ink: '#1C1C1E', muted: '#5E5A55', card: '#FFFFFF', line: '#E4DDD2',
  coral: '#DD4F3B', coralFill: '#CF4430', coralText: '#B83A28',   // Delivery
  orange: '#F4A533', orangeText: '#9A5A00',                        // Anticipation (pe portocaliu stă text închis)
  teal: '#2E9496', tealFill: '#1B7779', tealText: '#1B7779',       // Flow
  indigo: '#3A4FC6',                                               // Trust (text alb pe el: 6,7:1)
  amberLight: '#FFD38A',
  sand: '#ECE5D9', sandLine: '#D3C9B8',
};

const T = {
  brand: 'Wise Teams',
  title: ['The 4 Layers of', 'How a Team Works'],
  layers: [
    { name: 'Delivery', eyebrow: 'LAYER 1 · MOST VISIBLE', phrase: 'The effect: where results show up', bar: C.coral, eyebrowInk: C.coralText, fill: C.coralFill, fillInk: '#FFFFFF' },
    { name: 'Anticipation', eyebrow: 'LAYER 2 · ONCE RESULTS ARE STEADY', phrase: 'Room for the future, not always firefighting', short: 'Room for the future', bar: C.orange, eyebrowInk: C.orangeText, fill: C.orange, fillInk: C.ink },
    { name: 'Flow', eyebrow: 'LAYER 3', phrase: 'Coordination that’s designed, not ossified', short: 'Designed, not ossified', bar: C.teal, eyebrowInk: C.tealText, fill: C.tealFill, fillInk: '#FFFFFF' },
    { name: 'Trust', eyebrow: 'LAYER 4 · HOLDS THE MOST', phrase: 'The hidden culprit behind every layer above', bar: C.indigo, eyebrowInk: C.indigo, fill: C.indigo, fillInk: '#FFFFFF' },
  ],
  container: 'The Container',
  containerItems: ['Why we exist', 'Who we exist for', ['What we want to inspire', 'in each other'], 'Roles and rules'],
  effect: 'the effect',
  culprit: 'the hidden culprit',
};

const W = 1456, PAD = 104;
const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function text(x, y, s, { size = 48, weight = 400, fill = C.ink, anchor = 'start', max = 0, ls = 0 } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${ls ? ` letter-spacing="${ls}"` : ''}${max ? ` data-max="${max}"` : ''}>${esc(s)}</text>`;
}
const eyebrow = (x, y, s, fill, max, anchor = 'start') => text(x, y, s, { size: 40, weight: 700, fill, ls: 4, max, anchor });
const rect = (x, y, w, h, fill, rx = 28, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;

function chip(x, y, s, { fill, ink, size = 42, anchor = 'start' }) {
  const w = Math.round(s.length * size * 0.56 + 60), h = size + 30;
  const x0 = anchor === 'end' ? x - w : anchor === 'middle' ? x - w / 2 : x;
  return `<g data-chip="1">${rect(x0, y, w, h, fill, h / 2)}${text(x0 + w / 2, y + h / 2 + size * 0.35, s, { size, weight: 600, fill: ink, anchor: 'middle', max: w - 36 })}</g>`;
}
function arrowDown(x, y1, y2, color, sw = 10) {
  return `<path d="M${x} ${y1} V${y2 - 22}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/><path d="M${x - 22} ${y2 - 30} L${x} ${y2} L${x + 22} ${y2 - 30}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}
function arrowUp(x, y1, y2, color, sw = 8) {
  return `<path d="M${x} ${y1} V${y2 + 20}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" fill="none"/><path d="M${x - 20} ${y2 + 28} L${x} ${y2} L${x + 20} ${y2 + 28}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
}

function svg(H, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
<style>text{font-family:${FONT_STACK}}</style>
<rect width="${W}" height="${H}" fill="${C.bg}"/>
${body}
</svg>`;
}

// Antet ca în materialele Wise Teams: semnătura sus, titlu mare pe două rânduri, o frază.
function header(sub) {
  return text(PAD, 128, T.brand, { size: 46, weight: 700, fill: C.orangeText, max: 600 })
    + text(PAD, 254, T.title[0], { size: 88, weight: 700, max: W - 2 * PAD, ls: -1 })
    + text(PAD, 352, T.title[1], { size: 88, weight: 700, max: W - 2 * PAD, ls: -1 })
    + text(PAD, 438, sub, { size: 48, weight: 400, fill: C.muted, max: W - 2 * PAD });
}

function containerBlock(x, y, w) {
  const h = 400, colW = (w - 96) / 2;
  let s = rect(x, y, w, h, C.sand, 32, `stroke="${C.sandLine}" stroke-width="3"`);
  s += eyebrow(x + 48, y + 70, 'UNDERNEATH', C.muted, 600);
  s += text(x + 48, y + 146, T.container, { size: 64, weight: 700, max: w - 96 });
  T.containerItems.forEach((it, i) => {
    const cx = x + 48 + (i % 2) * colW, cy = y + 222 + Math.floor(i / 2) * 74;
    const lines = Array.isArray(it) ? it : [it];
    s += `<circle cx="${cx + 9}" cy="${cy - 14}" r="8" fill="${C.ink}"/>`;
    lines.forEach((l, k) => { s += text(cx + 34, cy + k * 56, l, { size: 46, weight: 500, max: colW - 50 }); });
  });
  return { svg: s, h: h + 0 };
}

// ── A · Stiva: carduri albe cu bara culorii, Trust plin ─────────────────────
function A() {
  const x = PAD, w = 1180, h = 232, gap = 22, top = 500;
  let b = header('What you see at the top has its roots below.');
  let defs = '';
  T.layers.forEach((L, i) => {
    const y = top + i * (h + gap), trust = i === 3;
    if (trust) {
      b += rect(x, y, w, h, C.indigo, 28);
    } else {
      defs += `<clipPath id="k${i}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28"/></clipPath>`;
      b += rect(x, y, w, h, C.card, 28, `stroke="${C.line}" stroke-width="2"`);
      b += `<rect x="${x}" y="${y}" width="18" height="${h}" fill="${L.bar}" clip-path="url(#k${i})"/>`;
    }
    const tx = x + 58, ink = trust ? '#FFFFFF' : C.ink;
    b += eyebrow(tx, y + 62, L.eyebrow, trust ? C.amberLight : L.eyebrowInk, w - 100);
    b += text(tx, y + 142, L.name, { size: 70, weight: 700, fill: ink, max: w - 100, ls: -1 });
    b += text(tx, y + 200, L.phrase, { size: 46, weight: 500, fill: ink, max: w - 100 });
  });
  // Trust atinge fiecare nivel de deasupra
  const lx = x + w + 60, yT = top + 3 * (h + gap) + h / 2, yD = top + h / 2;
  b += `<g stroke="${C.indigo}" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round">`
    + `<path d="M${x + w} ${yT} H${lx} V${yD + 26}"/><path d="M${lx - 20} ${yD + 34} L${lx} ${yD + 6} L${lx + 20} ${yD + 34}"/>`
    + [1, 2].map(i => `<path d="M${lx} ${top + i * (h + gap) + h / 2} H${x + w + 2}"/>`).join('')
    + `<path d="M${lx} ${yD} H${x + w + 14}"/></g>`;
  const cy = top + 4 * (h + gap) + 20;
  const cb = containerBlock(PAD - 32, cy, W - 2 * PAD + 64);
  b += cb.svg;
  const H = cy + cb.h + 96;
  return svg(H, `<defs>${defs}</defs>` + b, 'Wise Teams. The 4 layers of how a team works: Delivery, Anticipation, Flow and Trust, on top of the Container. Trust affects every layer above.');
}

// ── B · Linia apei: piramida în culorile capabilităților ────────────────────
function B() {
  const cx = W / 2, yTop = 700, wTop = 520, wBot = 1300;
  const bands = [[700, 880], [898, 1098], [1116, 1336], [1354, 1620]];
  const yBot = bands[3][1];
  const wAt = y => wTop + (wBot - wTop) * (y - yTop) / (yBot - yTop);
  let b = header('Delivery is the effect. Its roots are below.');
  b += text(cx, 534, 'Pressure works for a moment.', { size: 50, weight: 700, fill: C.coralText, anchor: 'middle', max: 1200 });
  b += text(cx, 598, 'Then it becomes allostatic load.', { size: 48, weight: 500, fill: C.ink, anchor: 'middle', max: 1200 });
  for (const dx of [-150, 0, 150]) b += arrowDown(cx + dx, 618, 684, C.coral, 10);
  bands.forEach(([y1, y2], i) => {
    const L = T.layers[i], a = wAt(y1) / 2, z = wAt(y2) / 2, maxW = wAt(y1) - 80;
    b += `<path d="M${cx - a} ${y1} H${cx + a} L${cx + z} ${y2} H${cx - z} Z" fill="${L.fill}"/>`;
    if (i === 3) {
      b += text(cx, y1 + 92, L.name, { size: 70, weight: 700, fill: L.fillInk, anchor: 'middle', max: maxW, ls: -1 });
      b += chip(cx, y1 + 136, T.culprit, { fill: C.amberLight, ink: C.ink, anchor: 'middle' });
    } else {
      const mid = (y1 + y2) / 2;
      b += text(cx, mid - 4, L.name, { size: 68, weight: 700, fill: L.fillInk, anchor: 'middle', max: maxW, ls: -1 });
      b += text(cx, mid + 56, i === 0 ? T.effect : L.short, { size: 46, weight: 500, fill: L.fillInk, anchor: 'middle', max: maxW });
    }
  });
  const yw = 889;
  b += `<path d="M${PAD - 40} ${yw} H${W - PAD + 40}" stroke="${C.ink}" stroke-width="4" stroke-dasharray="4 16" stroke-linecap="round"/>`;
  b += eyebrow(W - PAD + 40, yw - 24, 'SEEN', C.muted, 300, 'end');
  b += eyebrow(W - PAD + 40, yw + 58, 'UNSEEN', C.muted, 300, 'end');
  const cb = containerBlock(PAD - 32, yBot + 24, W - 2 * PAD + 64);
  b += cb.svg;
  const H = yBot + 24 + cb.h + 96;
  return svg(H, b, 'Wise Teams. The 4 layers as a pyramid: pressure lands on Delivery at the top, the only visible layer. Below the surface: Anticipation, Flow and Trust, the hidden culprit, on top of the Container.');
}

// ── C · Două drumuri: unde apăsăm vs. de unde vine rezultatul ───────────────
function Cv() {
  const lx = PAD, rx = 772, colW = 580;
  let b = header('Where we push, and where results come from.');
  b += text(lx, 548, 'If we push', { size: 54, weight: 700, fill: C.coralText, max: colW });
  b += text(lx, 612, 'on Delivery', { size: 54, weight: 700, fill: C.coralText, max: colW });
  b += text(rx, 548, 'If we build', { size: 54, weight: 700, fill: C.indigo, max: colW });
  b += text(rx, 612, 'the layers below', { size: 54, weight: 700, fill: C.indigo, max: colW });
  // stânga
  const dl = 790;
  for (const dx of [130, 290, 450]) b += arrowDown(lx + dx, 666, 774, C.coral, 10);
  b += rect(lx, dl, colW, 140, C.coralFill, 28);
  b += text(lx + colW / 2, dl + 92, 'Delivery', { size: 68, weight: 700, fill: '#FFFFFF', anchor: 'middle', max: colW - 60, ls: -1 });
  ['Works for a moment', 'Becomes allostatic load', 'Willpower erodes'].forEach((s, i) => {
    const y = dl + 250 + i * 180;
    b += `<g opacity="${[1, 0.8, 0.6][i]}">${arrowDown(lx + colW / 2, y - 118, y - 46, C.coral, 8)}</g>`;
    b += text(lx + colW / 2, y + 20, s, { size: 50, weight: i === 2 ? 700 : 500, fill: i === 2 ? C.coralText : C.ink, anchor: 'middle', max: colW });
  });
  // dreapta
  const sw = 500, bh = 116, g = 14, y0 = 666;
  const rows = [...T.layers, { name: T.container, fill: C.sand, fillInk: C.ink }];
  let y = y0;
  rows.forEach((L, i) => {
    const hh = i === 3 ? bh + 70 : bh;
    if (i === 4) y += 10;
    b += rect(rx, y, sw, hh, L.fill, 24, i === 4 ? `stroke="${C.sandLine}" stroke-width="3"` : '');
    b += text(rx + 36, y + 76, L.name, { size: 56, weight: 700, fill: L.fillInk, max: sw - 72, ls: -1 });
    if (i === 3) b += chip(rx + 36, y + 104, T.culprit, { fill: C.amberLight, ink: C.ink, size: 38 });
    y += hh + g;
  });
  const yBottom = y - g;
  b += arrowUp(rx + sw + 46, yBottom - 30, y0 + 20, C.ink, 8);
  b += text(rx, yBottom + 92, 'Delivery follows', { size: 52, weight: 700, fill: C.indigo, max: colW });
  b += text(rx, yBottom + 156, 'what holds it.', { size: 52, weight: 500, fill: C.indigo, max: colW });
  b += `<path d="M${W / 2 + 8} 500 V${yBottom + 170}" stroke="${C.sandLine}" stroke-width="3"/>`;
  const H = yBottom + 170 + 96;
  return svg(H, b, 'Wise Teams. Two paths. Pushing on Delivery works for a moment, becomes allostatic load, and willpower erodes. Building the layers below (Anticipation, Flow, Trust, the Container) makes Delivery follow.');
}

writeFileSync(join(AICI, 'a-stiva.svg'), A());
writeFileSync(join(AICI, 'b-linia-apei.svg'), B());
writeFileSync(join(AICI, 'c-doua-drumuri.svg'), Cv());
console.log('ok');
