// v2 (Ioana, 2026-11-26): PDF-ul „The 4 Layers” + postarea de workshop, după manualul Wise Teams v1
// (team/ioana/documente/brand-wise/manual-wise-v1.html). Textele vin DIRECT din draft-uri, fără nicio schimbare de literă:
//   articolul v7: team/sofia/documente/drafts/wise-teams-articol-1-2026-11-20.md, „Textul pentru Substack (EN)”
//   postarea v6:  team/sofia/documente/drafts/linkedin-workshop-wise-2026-11-25.md, „Postarea (RO)”
// Rulare: ./randare-v2.sh (generează HTML-ul, verifică textul cuvânt cu cuvânt, randează PDF-ul headless).
// Font: Poppins (Wise Teams) nu e instalat; rezerva din manual: Avenir Next.
// Piesele grafice (C, wordmark, rețea, benzi, container, oprire) sunt COPIATE din brand-wise/gen.mjs (manualul),
// nu importate: acel fișier își regenerează PNG-urile la import.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AICI = dirname(fileURLToPath(import.meta.url));
const RADACINA = join(AICI, '../../../..');
const F = '"Poppins","Avenir Next",Avenir,"Helvetica Neue",Arial,sans-serif';
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------- din manual (brand-wise/gen.mjs), neschimbat ----------
const C = {
  crem: '#F7F4EE', hartie: '#FFFFFF', nisip: '#EDE8DF', linie: '#E4DDD2', puncte: '#B3A896',
  cerneala: '#1C1B19', grafit: '#5E5A55',
  wise: '#F7AE2E', wiseText: '#8F5500',          // wordmark + Anticipare
  flux: '#1E9A9E', fluxText: '#16777A',           // Flow
  incredere: '#4B67CF', incredereText: '#3A4FC6', // Trust
  livrare: '#E2593C', livrareText: '#B83A28',     // Delivery
};
const CAP = [C.flux, C.incredere, C.livrare, C.wise];

// ---------- piese SVG ----------

// Wordmark-ul: „wise” + graful (3 noduri). viewBox strâns în jurul semnului.
function wordmark({ h = 60, text = C.wise, nod = C.cerneala, cls = '' } = {}) {
  const w = Math.round(h * 620 / 265);
  return `<svg class="wm ${cls}" width="${w}" height="${h}" viewBox="30 10 620 265" role="img" aria-label="wise">
<text x="38" y="262" font-family='${F}' font-size="222" font-weight="700" letter-spacing="-4" textLength="487" lengthAdjust="spacing" fill="${text}">wise</text>
<path d="M424 91 L540 36 L617 151" fill="none" stroke="${nod}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="424" cy="91" r="20" fill="${nod}"/><circle cx="540" cy="36" r="22" fill="${nod}"/><circle cx="617" cy="151" r="28" fill="${nod}"/>
</svg>`;
}

// Rețeaua: n noduri pe cerc; muchii = lista [i,j] sau 'toate'. culori = o culoare sau o listă, pe rând.
function retea(cx, cy, r, n, muchii, culori, { nodR = 10, linie = C.cerneala, gros = 2, rot = -90, punctate = [] } = {}) {
  const P = Array.from({ length: n }, (_, i) => { const a = (rot + i * 360 / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const E = muchii === 'toate' ? P.flatMap((_, i) => P.map((_, j) => [i, j]).filter(([a, b]) => a < b)) : muchii;
  const col = i => Array.isArray(culori) ? culori[i % culori.length] : culori;
  let s = E.map(([a, b], k) => `<line x1="${P[a][0].toFixed(1)}" y1="${P[a][1].toFixed(1)}" x2="${P[b][0].toFixed(1)}" y2="${P[b][1].toFixed(1)}" stroke="${linie}" stroke-width="${gros}"${punctate.includes(k) ? ` stroke-dasharray="${gros * 2.5} ${gros * 2.5}"` : ''}/>`).join('');
  s += P.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodR}" fill="${col(i)}"/>`).join('');
  return s;
}
// Rețeaua destinației: inel de 8 noduri + centru, toate legate între ele.
function reteaEmergenta(cx, cy, r, { nodR = 12, gros = 1.6 } = {}) {
  const ring = Array.from({ length: 8 }, (_, i) => { const a = (-90 + i * 45) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const P = [...ring, [cx, cy]];
  const cols = [C.flux, C.incredere, C.livrare, C.wise, C.flux, C.wise, C.livrare, C.incredere, C.flux];
  let s = '';
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) s += `<line x1="${P[i][0].toFixed(1)}" y1="${P[i][1].toFixed(1)}" x2="${P[j][0].toFixed(1)}" y2="${P[j][1].toFixed(1)}" stroke="${C.cerneala}" stroke-width="${gros}" opacity=".75"/>`;
  s += P.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodR}" fill="${cols[i]}"/>`).join('');
  return s;
}
// Cum se leagă rețeaua de-a lungul drumului (pentagon): etapa 1 → 4.
const MUCHII_ETAPA = [
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 3]],
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [0, 3]],
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3]],
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [0, 3], [1, 4]],
];

// Benzile: cele patru capabilități care se adună într-un punct (o echipă emergentă).
function benzi(x0, yTop, bandH, px, py, { a = .38, b = .62 } = {}) {
  return CAP.map((col, i) => {
    const yt = yTop + i * bandH, yb = yt + bandH, ka = x0 + (px - x0) * a, kb = x0 + (px - x0) * b;
    return `<path d="M${x0} ${yt} C${ka} ${yt} ${kb} ${py} ${px} ${py} C${kb} ${py} ${ka} ${yb} ${x0} ${yb} Z" fill="${col}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
  }).join('') + `<circle cx="${px}" cy="${py}" r="${bandH * .34}" fill="#fff" opacity=".7" stroke="#fff" stroke-width="3"/><circle cx="${px}" cy="${py}" r="${bandH * .14}" fill="${C.cerneala}"/>`;
}

// Drumul: o curbă netedă prin puncte (Catmull-Rom), nisip + linie punctată.
function drum(pts, { lat = 46, punct = 5 } = {}) {
  let d = `M${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0]} ${p2[1]}`;
  }
  return `<path d="${d}" fill="none" stroke="${C.nisip}" stroke-width="${lat}" stroke-linecap="round"/>`
    + `<path d="${d}" fill="none" stroke="${C.puncte}" stroke-width="${punct}" stroke-linecap="round" stroke-dasharray="0 ${punct * 3.2}"/>`;
}

// Containerul: terenul de dinainte de drum. Un cadru de nisip cu oamenii încă nelegați între ei.
function container(cx, cy, l) {
  const r = l * .26;
  return `<rect x="${cx - l / 2}" y="${cy - l / 2}" width="${l}" height="${l}" rx="${l * .22}" fill="${C.nisip}" stroke="${C.cerneala}" stroke-width="${Math.max(2, l * .018)}" stroke-dasharray="${l * .05} ${l * .04}"/>`
    + retea(cx, cy, r, 5, [], C.cerneala, { nodR: l * .055 });
}

// Oprirea de pe drum: disc alb, inel de nisip, arc colorat, rețeaua etapei, numărul.
function oprire(cx, cy, R, n, culori) {
  const cols = Array.isArray(culori) ? culori : [culori];
  let s = `<circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="${C.crem}"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="${C.nisip}" stroke-width="${R * .16}"/>`;
  cols.forEach((col, k) => {
    const rr = R - k * R * .17, L = 2 * Math.PI * rr;
    s += `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(1)}" fill="none" stroke="${col}" stroke-width="${(R * .1).toFixed(1)}" stroke-dasharray="${(L * .78).toFixed(1)} ${L.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;
  });
  s += retea(cx, cy + R * .04, R * .38, 5, MUCHII_ETAPA[n - 1], cols.length > 1 ? [cols[0], cols[1]] : cols[0], { nodR: R * .085, gros: Math.max(1.4, R * .022), punctate: [MUCHII_ETAPA[n - 1].length - 1] });
  const bx = cx - R * .78, by = cy - R * .78, br = R * .24;
  s += `<circle cx="${bx}" cy="${by}" r="${br}" fill="${C.cerneala}"/><text x="${bx}" y="${by + br * .36}" text-anchor="middle" font-family='${F}' font-weight="700" font-size="${br * 1.05}" fill="#fff">${n}</text>`;
  return s;
}

// ---------- textele, din sursă ----------
const ART = readFileSync(join(RADACINA, 'team/sofia/documente/drafts/wise-teams-articol-1-2026-11-20.md'), 'utf8');
const POST = readFileSync(join(RADACINA, 'team/sofia/documente/drafts/linkedin-workshop-wise-2026-11-25.md'), 'utf8');
function sectiune(md, start, stop) {
  const i = md.indexOf(start); if (i < 0) throw new Error('lipsește ' + start);
  const rest = md.slice(i + start.length);
  const j = rest.search(stop); if (j < 0) throw new Error('lipsește sfârșitul după ' + start);
  return rest.slice(0, j).trim();
}
const artMd = sectiune(ART, '## Textul pentru Substack (EN)', /\n---\s*\n/);
const postMd = sectiune(POST, '## Postarea (RO)', /\n## /);
const lipsaMd = sectiune(POST + '\n## ', '## Ce lipsește încă pentru publicare', /\n## /);

// Manualul: fără italic decorativ și fără sublinieri, deci *…* rămâne text simplu, iar linkul e semibold.
const inline = s => esc(s)
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*/g, '$1<span class="it">$2</span>');

// Culoarea pe capabilitate (manual §4): o culoare = o capabilitate.
const FEL = [
  [/^Before the journey/, 'container'], [/^[13]\. Delivery/, 'delivery'], [/^2\. Flow and Trust/, 'flowtrust'],
  [/^4\. Anticipation/, 'anticipation'], [/^Beyond the four layers/, 'emergent'], [/^A question/, 'question'],
];
const felul = t => (FEL.find(([r]) => r.test(t)) || [0, 'plain'])[1];

// Semnul fiecărei etape: elementele din manual (Containerul, oprirea cu numărul, rețeaua emergentă).
function semn(fel, titlu) {
  const n = Number((titlu.match(/^(\d)\./) || [])[1]);
  let body = '';
  if (fel === 'container') body = container(60, 60, 84);
  else if (fel === 'delivery') body = oprire(60, 60, 44, n, C.livrare);
  else if (fel === 'flowtrust') body = oprire(60, 60, 44, n, [C.flux, C.incredere]);
  else if (fel === 'anticipation') body = oprire(60, 60, 44, n, C.wise);
  else if (fel === 'emergent') body = `<circle cx="60" cy="60" r="58" fill="${C.wise}" opacity=".16"/><circle cx="60" cy="60" r="44" fill="#fff" stroke="${C.nisip}" stroke-width="5"/>` + reteaEmergenta(60, 60, 30, { nodR: 5.2, gros: .9 });
  else return '';
  return `<svg class="semn" viewBox="0 0 120 120" aria-hidden="true">${body}</svg>`;
}
const titluEtapa = t => { const m = t.match(/^(.*?:)( .*)$/); return m ? `<span class="pre">${inline(m[1])}</span>${inline(m[2])}` : inline(t); };

// ---------- articolul ----------
let titlu = '', subtitlu = '', intro = [], sectiuni = [], imagine = null, dupaImagine = [], cur = null, faza = 'intro';
for (const raw of artMd.split('\n')) {
  const l = raw.trim();
  if (!l) continue;
  if (l.startsWith('# ')) { titlu = l.slice(2); continue; }
  if (!subtitlu && /^\*[^*].*\*$/.test(l)) { subtitlu = l.slice(1, -1); continue; }
  const img = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (img) { imagine = { alt: img[1] }; faza = 'dupa'; continue; }
  if (l.startsWith('### ')) { cur = { titlu: l.slice(4), fel: felul(l.slice(4)), blocuri: [] }; sectiuni.push(cur); faza = 'sect'; continue; }
  if (faza === 'intro') { intro.push(l); continue; }
  if (faza === 'dupa') { dupaImagine.push(l); continue; }
  if (l.startsWith('#### ')) { cur.blocuri.push({ tip: 'h4', t: l.slice(5) }); continue; }
  if (/^\*\*Key insight:/.test(l)) { cur.blocuri.push({ tip: 'insight', t: l.replace(/^\*\*|\*\*$/g, '') }); continue; }
  if (/^\*\*[^*]+\*\*$/.test(l)) { cur.blocuri.push({ tip: 'inchidere', t: l.slice(2, -2) }); continue; }
  cur.blocuri.push({ tip: 'p', t: l });
}
function bloc(b) {
  if (b.tip === 'h4') {
    const fel = /^Flow/.test(b.t) ? 'flow' : /^Trust/.test(b.t) ? 'trust' : '';
    return `<h4 class="${fel}"><span class="nod" aria-hidden="true"></span><span>${titluEtapa(b.t)}</span></h4>`;
  }
  if (b.tip === 'insight') {
    const i = b.t.indexOf(':');
    return `<div class="insight"><span class="et">${esc(b.t.slice(0, i + 1))}</span> <span class="ins">${inline(b.t.slice(i + 1).trim())}</span></div>`;
  }
  if (b.tip === 'inchidere') return `<p class="inchidere">${inline(b.t)}</p>`;
  return `<p>${inline(b.t)}</p>`;
}
function sectiuneHtml(s) {
  const b = s.blocuri; let k = 0, cap = '', corp = '';
  if (b[0]?.tip === 'insight') { cap += bloc(b[0]); k = 1; }
  const nCap = k ? 1 : 3; // fără key insight, titlul ține cu el primele trei paragrafe (scurte)
  for (let m = 0; m < nCap && b[k]?.tip === 'p'; m++) { cap += bloc(b[k]); k++; }
  for (let i = k; i < b.length; i++) {
    if (b[i].tip === 'h4') { // subtitlul ține cu el primele două paragrafe
      let t = bloc(b[i]);
      for (let m = 0; m < 2 && b[i + 1]?.tip === 'p'; m++) t += bloc(b[++i]);
      corp += `<div class="tine">${t}</div>`;
    }
    else corp += bloc(b[i]);
  }
  const colorat = ['delivery', 'flowtrust', 'anticipation'].includes(s.fel);
  return `<section class="etapa ${s.fel}">
  <div class="cap"><h3>${semn(s.fel, s.titlu)}<span>${colorat ? titluEtapa(s.titlu) : inline(s.titlu)}</span></h3>${cap}</div>
  ${corp}
</section>`;
}

// ---------- imaginea „A · Drumul”: aceeași structură și aceleași texte, recolorată în paleta manualului ----------
const RECOLOR = {
  '#F6F3EE': C.crem, '#1C1C1E': C.cerneala, '#5E5A55': C.grafit, '#E4DDD2': C.linie, '#ECE5D9': C.nisip, '#E7DFD3': C.nisip,
  '#DD4F3B': C.livrare, '#B83A28': C.livrareText, '#F4A533': C.wise, '#9A5A00': C.wiseText,
  '#2E9496': C.flux, '#1B7779': C.fluxText, '#3A4FC6': C.incredere, '#FFD38A': '#FCE3B3',
};
let drumSvg = readFileSync(join(AICI, '../schita-4-layers-v3/a-drumul.svg'), 'utf8');
drumSvg = drumSvg.replace(/#[0-9A-Fa-f]{6}\b/g, h => RECOLOR[h.toUpperCase()] || h);
writeFileSync(join(AICI, 'a-drumul-paleta-manual.svg'), drumSvg);

// ---------- postarea ----------
let postHtml = '', lista = [], para = [];
const golPara = () => { if (para.length) { postHtml += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
const golLista = () => { if (lista.length) { postHtml += `<ul class="buline">${lista.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`; lista = []; } };
for (const l of postMd.split('\n').map(x => x.trim())) {
  if (!l) { golPara(); golLista(); continue; }
  if (l.startsWith('* ')) { golPara(); lista.push(l.slice(2)); continue; }
  golLista(); para.push(l);
}
golPara(); golLista();
const lipsa = lipsaMd.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));

// Wordmark-ul pentru antetul paginilor interioare (stânga sus, 10 mm = mărimea minimă pe hârtie din manual).
const wmInner = wordmark().replace(/^<svg[^>]*>|<\/svg>$/g, '');
writeFileSync(join(AICI, 'wordmark-10mm.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="23.4mm" height="10mm" viewBox="30 10 620 265">${wmInner}</svg>\n`);

// Aura (manual §6): pete moi în culorile capabilităților, doar pe copertă și în spatele rețelei. SVG, ca să iasă lin la tipar.
function aura(id, pete, { w = 600, h = 400 } = {}) {
  const el = pete.map(([col, cx, cy, r, op]) => `<ellipse cx="${cx * w / 100}" cy="${cy * h / 100}" rx="${r * w / 100}" ry="${r * h / 100}" fill="${col}" opacity="${op}"/>`).join('');
  return `<svg class="aura" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" aria-hidden="true"><defs><filter id="${id}" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="${Math.round(w / 16)}"/></filter></defs><g filter="url(#${id})">${el}</g></svg>`;
}
const auraCoperta = aura('ac', [[C.flux, 36, 42, 13, .50], [C.incredere, 66, 40, 13, .46], [C.livrare, 66, 60, 13, .38], [C.wise, 38, 60, 13, .52]]);
const auraPost = aura('ap', [[C.flux, 36, 32, 12, .32], [C.incredere, 66, 30, 12, .32], [C.livrare, 66, 62, 12, .26], [C.wise, 38, 66, 12, .34]], { w: 600, h: 700 });

// Benzile de pe copertă (o singură dată în material): ordinea Flux, Încredere, Livrare, Anticipare.
const benziCoperta = `<svg class="benzi" viewBox="0 0 900 300" aria-hidden="true">${benzi(0, 22, 64, 700, 150)}</svg>`;
// Rețeaua de pe pagina postării: zece oameni, nu toți legați încă (ca în mock-up-ul de workshop).
const zece = [[0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[8,9],[9,0],[0,5],[2,7],[4,9]];
const reteaPost = `<svg class="retea" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="140" fill="#fff" opacity=".9"/>${retea(150, 150, 100, 10, zece, CAP, { nodR: 13, gros: 3, punctate: [9, 10, 11] })}</svg>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The 4 Layers · Wise Teams</title>
<!-- Generat de gen-v2.mjs. Nu edita de mână. Font: Poppins nu e instalat; rezerva din manual e Avenir Next. -->
<style>
:root{
  --crem:${C.crem}; --hartie:${C.hartie}; --nisip:${C.nisip}; --linie:${C.linie}; --cerneala:${C.cerneala}; --grafit:${C.grafit};
  --wise:${C.wise}; --wiseText:${C.wiseText}; --flux:${C.flux}; --fluxText:${C.fluxText};
  --incredere:${C.incredere}; --incredereText:${C.incredereText}; --livrare:${C.livrare}; --livrareText:${C.livrareText};
  --f:${F};
}
@page{ size:A4; margin:30mm 20mm 22mm; background:var(--crem);
  @top-left{ content:url(wordmark-10mm.svg); vertical-align:middle }
  @bottom-left{ content:"Wise Teams  /  The 4 Layers of How a Team Works"; font:400 8.5pt var(--f); color:#5E5A55; border-top:.3mm solid #E4DDD2; vertical-align:middle }
  @bottom-center{ content:""; border-top:.3mm solid #E4DDD2 }
  @bottom-right{ content:counter(page); font:400 8.5pt var(--f); color:#5E5A55; border-top:.3mm solid #E4DDD2; vertical-align:middle } }
@page :first{ @top-left{ content:none } @top-right{ content:url(wordmark-10mm.svg); vertical-align:middle } }
@page post{ @bottom-left{ content:"Wise Teams  /  Postare LinkedIn, workshop"; font:400 8.5pt var(--f); color:#5E5A55; border-top:.3mm solid #E4DDD2; vertical-align:middle } }
*{ box-sizing:border-box }
svg.aura{ overflow:visible }
html,body{ margin:0; background:var(--crem); color:var(--cerneala); -webkit-print-color-adjust:exact; print-color-adjust:exact }
body{ font:400 11.2pt/1.5 var(--f); hyphens:none; orphans:3; widows:3 }
p{ margin:0 0 2.8mm }
strong{ font-weight:600 }
a{ color:var(--cerneala); font-weight:600; text-decoration:none }
.it{ font-style:normal }
.eticheta{ font:600 7.8pt/1.2 var(--f); letter-spacing:.2em; text-transform:uppercase; color:var(--grafit) }

/* Coperta (manual: mock-up-ul Substack) */
.coperta{ position:relative; margin-bottom:8mm }
.banda .aura{ position:absolute; left:28%; top:-22mm; width:72%; height:calc(100% + 34mm); z-index:0 }
.banda .benzi, .banda .dest{ z-index:1 }
h1{ margin:3mm 0 4mm; letter-spacing:-.035em; line-height:1.02 }
h1 .subtire{ display:block; font:200 37pt/1.06 var(--f) }
h1 .bold{ display:block; font:700 40pt/1.04 var(--f) }
.sub{ font:400 14.5pt/1.4 var(--f); color:var(--grafit); margin:0 0 6mm; max-width:140mm }
.banda{ position:relative; margin-bottom:2mm }
.benzi{ position:relative; display:block; width:100%; height:auto }
.banda .dest{ position:absolute; right:0; top:62%; font:700 11pt var(--f) }
.intro p{ font-size:12pt; margin-bottom:2.8mm }
.intro p:first-child{ font:600 14.5pt/1.36 var(--f); letter-spacing:-.01em; margin-bottom:3.4mm }

/* Imaginea A · Drumul, pe pagina ei */
figure.drum{ break-before:page; margin:0 }
figure.drum img{ display:block; height:226mm; width:auto; margin:0 auto }
.dupa{ text-align:center; font:600 12.5pt var(--f); margin:4mm 0 0 }

/* Etapele */
.etapa{ margin:0 0 7mm }
.etapa.container{ break-before:page }
.cap{ break-inside:avoid }
h3{ display:flex; align-items:center; gap:3.5mm; margin:0 0 4mm; font:700 17.5pt/1.15 var(--f); letter-spacing:-.02em }
h3 .semn{ flex:none; width:17mm; height:17mm }
.delivery .pre{ color:var(--livrareText) } .flowtrust .pre{ color:var(--fluxText) } .anticipation .pre{ color:var(--wiseText) }
h4{ display:flex; align-items:baseline; gap:2.5mm; font:700 12.8pt/1.3 var(--f); letter-spacing:-.01em; margin:5.5mm 0 2mm }
h4 .nod{ flex:none; width:2.8mm; height:2.8mm; border-radius:50%; background:var(--cerneala); transform:translateY(-.3mm) }
h4.flow .nod{ background:var(--flux) } h4.flow .pre{ color:var(--fluxText) }
h4.trust .nod{ background:var(--incredere) } h4.trust .pre{ color:var(--incredereText) }
.tine{ break-inside:avoid }

/* Key insight: card alb plat, colțuri mari, fără contur și fără umbră (manual §6) */
.insight{ background:var(--hartie); border-radius:7mm; padding:5mm 6.5mm 5.4mm; margin:0 0 5mm; break-inside:avoid }
.insight .et{ display:block; font:600 7.8pt/1.2 var(--f); letter-spacing:.2em; text-transform:uppercase; color:var(--grafit); margin-bottom:2mm }
.insight .ins{ font:600 12.6pt/1.42 var(--f); letter-spacing:-.005em }
.delivery .insight .et{ color:var(--livrareText) } .flowtrust .insight .et{ color:var(--fluxText) } .anticipation .insight .et{ color:var(--wiseText) }

/* Rândurile care închid un capitol: discret, o linie fină în culoarea capitolului */
p.inchidere{ font:600 11.8pt/1.45 var(--f); border-left:.9mm solid var(--linie); padding:.5mm 0 .5mm 4.5mm; margin:4.5mm 0 3mm; break-inside:avoid }
.flowtrust p.inchidere{ border-left-color:var(--flux) }
.emergent p.inchidere{ font-size:13.5pt; letter-spacing:-.01em; border-left-color:var(--wise); margin-top:5mm }

.etapa.question{ background:var(--hartie); border-radius:7mm; padding:6mm 8mm 3.5mm; margin:6mm 0 0; break-inside:avoid }
.question h3{ font-size:15pt; margin-bottom:3mm } .question p{ font-size:11.4pt; margin-bottom:2.4mm }

/* Postarea (manual: mock-up-ul de workshop; singurul card de sticlă din material, peste aură) */
.post{ page:post; break-before:page; position:relative }
.post h2{ font:700 24pt/1.1 var(--f); letter-spacing:-.035em; margin:2.5mm 0 2.5mm }
.post .lead{ color:var(--grafit); font-size:12pt; margin:0 }
.post .antet{ display:grid; grid-template-columns:1fr 40mm; gap:6mm; align-items:center; position:relative; z-index:1 }
.post .scena{ position:relative; z-index:1; margin-top:5mm }
.post > .aura{ position:absolute; left:26%; top:0; width:74%; height:170mm; z-index:0 }
.post .retea{ display:block; width:40mm; height:40mm }
.card{ position:relative; z-index:2; background:rgba(255,255,255,.9); border:.4mm solid rgba(255,255,255,.95); border-radius:7mm; padding:8mm 9mm 6mm; break-inside:avoid }
.autor{ display:flex; gap:3.5mm; align-items:center; margin-bottom:5mm }
.avatar{ width:12mm; height:12mm; border-radius:50%; background:var(--nisip); flex:none; display:grid; place-items:center }
.avatar svg{ width:7.6mm; height:auto }
.autor b{ display:block; font:600 11pt/1.2 var(--f) } .autor span{ font-size:9pt; color:var(--grafit) }
.card p{ font-size:11.6pt; line-height:1.52; margin:0 0 3.4mm }
ul.buline{ list-style:none; padding:0; margin:0 0 3.8mm }
ul.buline li{ position:relative; padding-left:7mm; margin:0 0 2.4mm; font-size:11.6pt; line-height:1.52 }
ul.buline li::before{ content:""; position:absolute; left:.8mm; top:2.2mm; width:2.6mm; height:2.6mm; border-radius:50%; background:var(--cerneala) }
.nota{ display:grid; grid-template-columns:34mm 1fr; gap:5mm; background:var(--hartie); border-radius:7mm; padding:5.5mm 7mm; margin-top:6mm; font-size:9.8pt; color:var(--grafit); break-inside:avoid }
.nota ul{ margin:1.5mm 0 0; padding-left:4.5mm } .nota li{ margin:0 0 1mm }
.colofon{ margin-top:5mm; font-size:8.6pt; color:var(--grafit) }
</style>
</head>
<body>
<article>
  <header class="coperta">
    <span class="eticheta">Wise Teams</span>
    <h1><span class="subtire">${inline(titlu.slice(0, titlu.indexOf(' How')))}</span> <span class="bold">${inline(titlu.slice(titlu.indexOf(' How') + 1))}</span></h1>
    <p class="sub">${inline(subtitlu)}</p>
    <div class="banda">${auraCoperta}${benziCoperta}<span class="dest">An emergent team</span></div>
  </header>
  <div class="intro">${intro.map(p => `<p>${inline(p)}</p>`).join('\n')}</div>
  <figure class="drum"><img src="a-drumul-paleta-manual.svg" alt="${esc(imagine.alt)}"></figure>
  ${dupaImagine.map(p => `<p class="dupa">${inline(p)}</p>`).join('')}
  ${sectiuni.map(sectiuneHtml).join('\n')}
</article>
<section class="post" lang="ro">
  ${auraPost}
  <div class="antet"><div>
    <span class="eticheta">Postare LinkedIn · workshop</span>
    <h2>Previzualizare postare</h2>
    <p class="lead">Textul lui Alex, așa cum ar apărea în feed. Draft, nepublicat.</p>
  </div>${reteaPost}</div>
  <div class="scena">
    <div class="card">
      <div class="autor"><span class="avatar" aria-hidden="true"><svg viewBox="390 0 262 190"><path d="M424 91 L540 36 L617 151" fill="none" stroke="${C.cerneala}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><circle cx="424" cy="91" r="26" fill="${C.cerneala}"/><circle cx="540" cy="36" r="28" fill="${C.cerneala}"/><circle cx="617" cy="151" r="34" fill="${C.cerneala}"/></svg></span><div><b>Alexandru Molea</b><span>Wise Teams</span></div></div>
      ${postHtml}
    </div>
  </div>
  <div class="nota"><span class="eticheta">Notă de lucru, nu face parte din postare</span>
    <div>Ce lipsește pentru publicare:<ul>${lipsa.map(x => `<li>${inline(x)}</li>`).join('')}</ul></div>
  </div>
  <p class="colofon">După manualul Wise Teams v1 (draft). Font: Avenir Next, rezerva pentru Poppins. Wordmark-ul și culorile sunt reconstruite aproximativ, până la fișierele sursă.</p>
</section>
</body>
</html>`;
writeFileSync(join(AICI, 'articol-postare-v2.html'), html);
console.log('ok', sectiuni.length, 'secțiuni,', intro.length, 'paragrafe de intro');
