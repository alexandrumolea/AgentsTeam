// Brandul Wise Teams, v1 (Ioana, 2026-11-26): elementele grafice și mock-up-urile.
// Rulare (din acest folder):  node gen.mjs        → elemente/*.svg + mockups/sursa.html + mockups/*.png
//                             node gen.mjs --fara-png   → doar fișierele sursă
// Culorile și textele stau într-un singur loc (C, F, T). Culorile sunt APROXIMATIVE, citite din rapoartele Wise Teams,
// până primim valorile oficiale. Fontul: Poppins nu e pe acest calculator, deci PNG-urile ies în Avenir Next.
// Wordmark-ul „wise” e RECONSTRUIT aproximativ (literele + graful cu trei noduri), până primim fișierul sursă.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AICI = dirname(fileURLToPath(import.meta.url));
const F = '"Poppins","Avenir Next",Avenir,"Helvetica Neue",Arial,sans-serif';

export const C = {
  crem: '#F7F4EE', hartie: '#FFFFFF', nisip: '#EDE8DF', linie: '#E4DDD2', puncte: '#B3A896',
  cerneala: '#1C1B19', grafit: '#5E5A55',
  wise: '#F7AE2E', wiseText: '#8F5500',          // wordmark + Anticipare
  flux: '#1E9A9E', fluxText: '#16777A',           // Flow
  incredere: '#4B67CF', incredereText: '#3A4FC6', // Trust
  livrare: '#E2593C', livrareText: '#B83A28',     // Delivery
};
const CAP = [C.flux, C.incredere, C.livrare, C.wise];

// ---------- piese SVG ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Wordmark-ul: „wise” + graful (3 noduri). viewBox strâns în jurul semnului.
export function wordmark({ h = 60, text = C.wise, nod = C.cerneala, cls = '' } = {}) {
  const w = Math.round(h * 620 / 265);
  return `<svg class="wm ${cls}" width="${w}" height="${h}" viewBox="30 10 620 265" role="img" aria-label="wise">
<text x="38" y="262" font-family='${F}' font-size="222" font-weight="700" letter-spacing="-4" textLength="487" lengthAdjust="spacing" fill="${text}">wise</text>
<path d="M424 91 L540 36 L617 151" fill="none" stroke="${nod}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="424" cy="91" r="20" fill="${nod}"/><circle cx="540" cy="36" r="22" fill="${nod}"/><circle cx="617" cy="151" r="28" fill="${nod}"/>
</svg>`;
}

// Rețeaua: n noduri pe cerc; muchii = lista [i,j] sau 'toate'. culori = o culoare sau o listă, pe rând.
export function retea(cx, cy, r, n, muchii, culori, { nodR = 10, linie = C.cerneala, gros = 2, rot = -90, punctate = [] } = {}) {
  const P = Array.from({ length: n }, (_, i) => { const a = (rot + i * 360 / n) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const E = muchii === 'toate' ? P.flatMap((_, i) => P.map((_, j) => [i, j]).filter(([a, b]) => a < b)) : muchii;
  const col = i => Array.isArray(culori) ? culori[i % culori.length] : culori;
  let s = E.map(([a, b], k) => `<line x1="${P[a][0].toFixed(1)}" y1="${P[a][1].toFixed(1)}" x2="${P[b][0].toFixed(1)}" y2="${P[b][1].toFixed(1)}" stroke="${linie}" stroke-width="${gros}"${punctate.includes(k) ? ` stroke-dasharray="${gros * 2.5} ${gros * 2.5}"` : ''}/>`).join('');
  s += P.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodR}" fill="${col(i)}"/>`).join('');
  return s;
}
// Rețeaua destinației: inel de 8 noduri + centru, toate legate între ele.
export function reteaEmergenta(cx, cy, r, { nodR = 12, gros = 1.6 } = {}) {
  const ring = Array.from({ length: 8 }, (_, i) => { const a = (-90 + i * 45) * Math.PI / 180; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
  const P = [...ring, [cx, cy]];
  const cols = [C.flux, C.incredere, C.livrare, C.wise, C.flux, C.wise, C.livrare, C.incredere, C.flux];
  let s = '';
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) s += `<line x1="${P[i][0].toFixed(1)}" y1="${P[i][1].toFixed(1)}" x2="${P[j][0].toFixed(1)}" y2="${P[j][1].toFixed(1)}" stroke="${C.cerneala}" stroke-width="${gros}" opacity=".75"/>`;
  s += P.map(([x, y], i) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${nodR}" fill="${cols[i]}"/>`).join('');
  return s;
}
// Cum se leagă rețeaua de-a lungul drumului (pentagon): etapa 1 → 4.
export const MUCHII_ETAPA = [
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 3]],
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [0, 3]],
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [1, 3]],
  [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [0, 2], [0, 3], [1, 4]],
];

// Benzile: cele patru capabilități care se adună într-un punct (o echipă emergentă).
export function benzi(x0, yTop, bandH, px, py, { a = .38, b = .62 } = {}) {
  return CAP.map((col, i) => {
    const yt = yTop + i * bandH, yb = yt + bandH, ka = x0 + (px - x0) * a, kb = x0 + (px - x0) * b;
    return `<path d="M${x0} ${yt} C${ka} ${yt} ${kb} ${py} ${px} ${py} C${kb} ${py} ${ka} ${yb} ${x0} ${yb} Z" fill="${col}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>`;
  }).join('') + `<circle cx="${px}" cy="${py}" r="${bandH * .34}" fill="#fff" opacity=".7" stroke="#fff" stroke-width="3"/><circle cx="${px}" cy="${py}" r="${bandH * .14}" fill="${C.cerneala}"/>`;
}

// Drumul: o curbă netedă prin puncte (Catmull-Rom), nisip + linie punctată.
export function drum(pts, { lat = 46, punct = 5 } = {}) {
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
export function container(cx, cy, l) {
  const r = l * .26;
  return `<rect x="${cx - l / 2}" y="${cy - l / 2}" width="${l}" height="${l}" rx="${l * .22}" fill="${C.nisip}" stroke="${C.cerneala}" stroke-width="${Math.max(2, l * .018)}" stroke-dasharray="${l * .05} ${l * .04}"/>`
    + retea(cx, cy, r, 5, [], C.cerneala, { nodR: l * .055 });
}

// Oprirea de pe drum: disc alb, inel de nisip, arc colorat, rețeaua etapei, numărul.
export function oprire(cx, cy, R, n, culori) {
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

// ---------- textele mock-up-urilor (din modelele lui Alex; ce e propunere e marcat în manual) ----------
const T = {
  articol: { eb: 'WISE TEAMS', t1: 'The 4 Layers of', t2: 'How a Team Works', sub: 'The path from where a team starts to what it can become.', dest: 'An emergent team' },
  etape: [
    { n: 0, nume: 'Containerul', pre: 'Înainte de drum', fraza: 'De ce existăm și pentru cine.' },
    { n: 1, nume: 'Suntem aliniați', cap: 'Livrare', fraza: 'Prioritățile sunt înțelese la fel.', col: [C.livrare], txt: C.livrareText },
    { n: 2, nume: 'Avansăm eficient', cap: 'Flux și Încredere', fraza: 'Munca circulă ușor, lucrurile grele se pot spune.', col: [C.flux, C.incredere], txt: C.fluxText },
    { n: 3, nume: 'Livrăm consecvent', cap: 'Livrare', fraza: 'Progresul se vede, rezultatele vin constant.', col: [C.livrare], txt: C.livrareText },
    { n: 4, nume: 'Construim viitorul', cap: 'Anticipare', fraza: 'Vedem schimbarea din timp.', col: [C.wise], txt: C.wiseText },
    { n: 5, nume: 'O echipă emergentă', pre: 'Destinația', fraza: 'Mai mult decât suma contribuțiilor.' },
  ],
};

// ---------- elementele pentru manual ----------
function svgFile(w, h, body, label) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>\n`;
}
function elemente() {
  const dir = join(AICI, 'elemente'); mkdirSync(dir, { recursive: true });
  const wmInner = (text, nod) => wordmark({ text, nod }).replace(/^<svg[^>]*>|<\/svg>$/g, '');
  writeFileSync(join(dir, 'wordmark.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="265" viewBox="30 10 620 265" role="img" aria-label="wise">${wmInner(C.wise, C.cerneala)}</svg>\n`);
  // PROPUNERI (nu există încă la Wise Teams): varianta pe fundal închis și monograma pentru avatar.
  writeFileSync(join(dir, 'propunere-wordmark-pe-inchis.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="620" height="265" viewBox="30 10 620 265" role="img" aria-label="wise pe fundal închis (propunere)">${wmInner(C.wise, '#FFFFFF')}</svg>\n`);
  writeFileSync(join(dir, 'propunere-monograma.svg'), svgFile(400, 400, `<rect width="400" height="400" rx="88" fill="${C.crem}"/>
<path d="M104 236 L210 130 L300 262" fill="none" stroke="${C.cerneala}" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/>
<circle cx="104" cy="236" r="34" fill="${C.wise}"/><circle cx="210" cy="130" r="38" fill="${C.cerneala}"/><circle cx="300" cy="262" r="46" fill="${C.cerneala}"/>`, 'Monograma wise (propunere)'));
  writeFileSync(join(dir, 'benzi.svg'), svgFile(900, 420, `<rect width="900" height="420" fill="${C.crem}"/>${benzi(0, 40, 85, 760, 210)}`, 'Cele patru capabilități care se adună într-o echipă emergentă'));
  // Rețeaua care se leagă tot mai mult: semnul (3 noduri) → etapele 1–4 → echipa emergentă.
  let ev = `<rect width="1100" height="240" fill="${C.crem}"/>`;
  ev += `<path d="M50 150 L100 95 L150 160" fill="none" stroke="${C.cerneala}" stroke-width="5" stroke-linecap="round"/><circle cx="50" cy="150" r="11" fill="${C.cerneala}"/><circle cx="100" cy="95" r="12" fill="${C.cerneala}"/><circle cx="150" cy="160" r="15" fill="${C.cerneala}"/>`;
  const evc = [[C.livrare], [C.flux, C.incredere], [C.livrare], [C.wise]];
  evc.forEach((cols, i) => { ev += retea(300 + i * 175, 120, 58, 5, MUCHII_ETAPA[i], cols.length > 1 ? cols : cols[0], { nodR: 11, gros: 2.4, punctate: [MUCHII_ETAPA[i].length - 1] }); });
  ev += `<circle cx="1000" cy="120" r="92" fill="#fff" stroke="${C.nisip}" stroke-width="4"/>` + reteaEmergenta(1000, 120, 66, { nodR: 10, gros: 1.3 });
  writeFileSync(join(dir, 'retea-evolutie.svg'), svgFile(1100, 240, ev, 'Rețeaua se leagă tot mai mult de la semn la echipa emergentă'));
  // Drumul, pe scurt: Container → 4 opriri → destinația.
  let dr = `<rect width="1200" height="330" fill="${C.crem}"/>`;
  const xs = [90, 300, 500, 700, 900, 1100], ys = [230, 170, 230, 170, 230, 150];
  dr += drum([[-30, 250], ...xs.map((x, i) => [x, ys[i]]), [1260, 120]], { lat: 34, punct: 4 });
  dr += container(90, 230, 92);
  T.etape.slice(1, 5).forEach((e, i) => { dr += oprire(xs[i + 1], ys[i + 1], 54, e.n, e.col); });
  dr += `<circle cx="1100" cy="150" r="96" fill="${C.wise}" opacity=".14"/><circle cx="1100" cy="150" r="70" fill="#fff" stroke="${C.nisip}" stroke-width="4"/>` + reteaEmergenta(1100, 150, 48, { nodR: 8, gros: 1.1 });
  writeFileSync(join(dir, 'drum.svg'), svgFile(1200, 330, dr, 'Drumul echipei: Containerul, cele patru etape și echipa emergentă'));
}

// ---------- mock-up-urile (HTML → PNG) ----------
const M = []; // {id, w, h, scale, html}
const css = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:#ddd;font-family:${F};color:${C.cerneala};-webkit-font-smoothing:antialiased}
.m{position:relative;overflow:hidden;background:${C.crem};margin:0 0 40px}
.eb{font-weight:600;text-transform:uppercase;letter-spacing:.2em;color:${C.grafit}}
.chip{display:inline-block;background:${C.cerneala};color:#fff;font-weight:600;border-radius:999px}
.chip.o{background:transparent;color:${C.cerneala};box-shadow:inset 0 0 0 2px ${C.cerneala}}
.card{background:#fff;border-radius:28px}
.abs{position:absolute}
svg{display:block}
.aura{position:absolute;inset:0;background:
 radial-gradient(38% 46% at 74% 40%,rgba(30,154,158,.42) 0%,rgba(30,154,158,0) 70%),
 radial-gradient(34% 44% at 92% 34%,rgba(75,103,207,.40) 0%,rgba(75,103,207,0) 70%),
 radial-gradient(36% 40% at 90% 78%,rgba(226,89,60,.40) 0%,rgba(226,89,60,0) 70%),
 radial-gradient(40% 40% at 66% 92%,rgba(247,174,46,.45) 0%,rgba(247,174,46,0) 70%)}
.sticla{background:rgba(255,255,255,.86);border:1.5px solid rgba(255,255,255,.95);box-shadow:inset 0 1px 0 #fff,0 30px 60px -36px rgba(60,50,40,.35);-webkit-backdrop-filter:blur(24px) saturate(140%);backdrop-filter:blur(24px) saturate(140%)}
.subsol{position:absolute;left:0;right:0;display:flex;justify-content:space-between;align-items:center;color:${C.grafit}}
`;

// 1. Copertă de articol Substack (1456 × 816)
M.push({ id: 'substack-coperta', w: 1456, h: 816, html: `
<div class="aura" style="clip-path:inset(0 0 0 38%)"></div>
<svg class="abs" style="left:0;top:0" width="1456" height="816">${benzi(0, 530, 64, 1130, 658)}</svg>
<div class="abs" style="right:96px;top:72px">${wordmark({ h: 64 })}</div>
<div class="abs" style="left:96px;top:68px;width:1000px">
  <p class="eb" style="font-size:30px;letter-spacing:.22em">${T.articol.eb}</p>
  <h1 style="font-size:104px;line-height:1;letter-spacing:-.035em;margin-top:24px;font-weight:200">${T.articol.t1}</h1>
  <h1 style="font-size:104px;line-height:1.02;letter-spacing:-.035em;font-weight:700">${T.articol.t2}</h1>
  <p style="font-size:46px;line-height:1.2;color:${C.grafit};margin-top:20px;width:900px;letter-spacing:-.01em">${T.articol.sub}</p>
</div>
<p class="abs" style="left:1070px;top:716px;font-weight:700;font-size:34px;width:340px;text-align:center">${T.articol.dest}</p>
` });

// 2. Carusel LinkedIn (1080 × 1350, trei cadre). Textele: modelele lui Alex (postarea 1).
const subsolCar = (i) => `<div class="subsol" style="bottom:64px;padding:0 80px;font-size:26px">${wordmark({ h: 46 })}<span>${i} / 3</span></div>`;
M.push({ id: 'linkedin-carusel-1', w: 1080, h: 1350, html: `
<div class="abs" style="left:80px;top:96px;width:920px">
  <p class="eb" style="font-size:26px">Ce observăm</p>
  <h1 style="font-size:104px;line-height:1.02;letter-spacing:-.035em;font-weight:700;margin-top:34px">Ce se întâmplă, de fapt, în echipele de manageri?</h1>
</div>
<svg class="abs" style="left:0;top:600px" width="1080" height="420">
  <circle cx="800" cy="200" r="190" fill="${C.wise}" opacity=".12"/><circle cx="800" cy="200" r="150" fill="#fff" stroke="${C.nisip}" stroke-width="6"/>
  ${retea(800, 200, 100, 5, [[0, 1], [1, 2], [3, 4], [0, 3]], [C.flux, C.incredere, C.livrare, C.wise, C.flux], { nodR: 17, gros: 4, punctate: [3] })}
</svg>
<p class="abs" style="left:80px;top:700px;width:520px;font-size:38px;line-height:1.3;color:${C.grafit}">Am cartografiat mai multe echipe de conducere pe 16 comportamente de echipă.</p>
${subsolCar(1)}` });
M.push({ id: 'linkedin-carusel-2', w: 1080, h: 1350, html: `
<div class="abs" style="left:80px;top:96px;width:920px">
  <p class="eb" style="font-size:26px;color:${C.incredereText}">Tiparul 1 · Încredere</p>
  <p style="font-size:68px;line-height:1.14;letter-spacing:-.025em;font-weight:500;margin-top:40px">În multe echipe, munca e bine organizată, iar <b style="color:${C.incredereText};font-weight:700">încrederea</b> rămâne puțin în urmă.</p>
  <p style="font-size:40px;line-height:1.35;color:${C.grafit};margin-top:40px;width:860px">Oamenii livrează, dar unele lucruri se spun mai greu între ei.</p>
</div>
<div class="abs card" style="left:80px;top:740px;width:920px;height:300px;padding:44px 52px">
  <svg width="816" height="212">
    <line x1="10" y1="96" x2="806" y2="96" stroke="${C.linie}" stroke-width="6" stroke-linecap="round"/>
    ${[[C.wise, 'Anticipare', 480, C.wiseText, 0], [C.flux, 'Flux', 600, C.fluxText, 1], [C.livrare, 'Livrare', 710, C.livrareText, 0], [C.incredere, 'Încredere', 200, C.incredereText, 1]].map(([c, n, x, tc, jos]) => `<circle cx="${x}" cy="96" r="${n === 'Încredere' ? 26 : 20}" fill="${c}"/><text x="${x}" y="${jos ? 176 : 40}" text-anchor="middle" font-family='${F}' font-size="30" font-weight="${n === 'Încredere' ? 700 : 500}" fill="${tc}">${n}</text>`).join('')}
  </svg>
</div>
${subsolCar(2)}` });
M.push({ id: 'linkedin-carusel-3', w: 1080, h: 1350, html: `
<div class="abs" style="left:80px;top:96px;width:920px">
  <p class="eb" style="font-size:26px;color:${C.wiseText}">Workshop · 10 locuri</p>
  <p style="font-size:64px;line-height:1.12;letter-spacing:-.025em;font-weight:700;margin-top:34px">Un workshop pentru 10 manageri de manageri care își doresc echipe autonome.</p>
</div>
<div class="abs" style="left:80px;top:560px;width:920px;display:grid;gap:22px">
  ${['Noi vă arătăm insight-urile noastre, din date și din echipele cu care am lucrat.', 'Voi ne spuneți cum arată echipele voastre.', 'Împreună cartografiem nevoile reale pe care le au echipele în perioada asta.'].map((s, i) => `<div class="card" style="display:flex;gap:30px;align-items:center;padding:30px 40px"><span style="flex:none;width:72px;height:72px;border-radius:50%;box-shadow:inset 0 0 0 4px ${C.cerneala};display:grid;place-items:center;font-weight:700;font-size:38px">${i + 1}</span><span style="font-size:36px;line-height:1.3">${s}</span></div>`).join('')}
</div>
<p class="abs" style="left:80px;top:1112px;font-size:38px;font-weight:600">Dacă doriți să participați, scrieți-mi un mesaj.</p>
${subsolCar(3)}` });

// 3. Imagine LinkedIn pentru workshop (1200 × 627): aură + sticlă (singurul loc cu sticlă).
M.push({ id: 'linkedin-workshop', w: 1200, h: 627, html: `
<div class="aura" style="clip-path:inset(0 0 0 30%)"></div>
<svg class="abs" style="left:780px;top:90px" width="400" height="400">
  <circle cx="200" cy="200" r="176" fill="#fff" opacity=".9"/>
  ${retea(200, 200, 128, 10, [[0, 1], [1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9], [9, 0], [0, 5], [2, 7], [3, 8]], [C.flux, C.incredere, C.livrare, C.wise], { nodR: 15, gros: 3, punctate: [8, 9, 10] })}
</svg>
<div class="abs" style="left:56px;top:56px">${wordmark({ h: 50 })}</div>
<div class="abs sticla" style="left:56px;top:140px;width:700px;border-radius:32px;padding:38px 48px">
  <p class="eb" style="font-size:20px;color:${C.wiseText}">Workshop restrâns · 10 locuri</p>
  <p style="font-size:62px;line-height:1.04;letter-spacing:-.03em;font-weight:700;margin-top:20px">Căutăm 10 manageri de manageri.</p>
  <p style="font-size:26px;line-height:1.35;color:${C.grafit};margin-top:20px">Un schimb de perspective despre echipele de conducere.</p>
  <p style="font-size:21px;color:${C.grafit};margin-top:10px">Alexandru Molea &nbsp;·&nbsp; Andreea Cimpoesu</p>
  <div style="display:flex;gap:12px;margin-top:26px;font-size:22px"><span class="chip" style="padding:10px 22px">[data]</span><span class="chip o" style="padding:10px 22px">[locul / online]</span></div>
</div>` });

// 4. Slide de workshop (1920 × 1080): drumul, cu întrebarea „unde sunteți?”.
const SX = [170, 480, 800, 1120, 1440, 1740], SY = [640, 560, 650, 560, 650, 520];
M.push({ id: 'slide-workshop', w: 1920, h: 1080, html: `
<div class="abs" style="left:120px;top:96px;width:1400px">
  <p class="eb" style="font-size:24px">Wise Teams · Drumul echipei</p>
  <h1 style="font-size:88px;line-height:1.02;letter-spacing:-.035em;font-weight:700;margin-top:24px">Unde sunteți pe drum acum?</h1>
</div>
<div class="abs" style="right:120px;top:96px">${wordmark({ h: 56 })}</div>
<svg class="abs" style="left:0;top:0" width="1920" height="1080">
  ${drum([[-40, 680], ...SX.map((x, i) => [x, SY[i]]), [1990, 470]], { lat: 54, punct: 6 })}
  ${container(SX[0], SY[0], 150)}
  ${T.etape.slice(1, 5).map((e, i) => oprire(SX[i + 1], SY[i + 1], 84, e.n, e.col)).join('')}
  <circle cx="${SX[5]}" cy="${SY[5]}" r="150" fill="${C.wise}" opacity=".14"/><circle cx="${SX[5]}" cy="${SY[5]}" r="112" fill="#fff" stroke="${C.nisip}" stroke-width="6"/>
  ${reteaEmergenta(SX[5], SY[5], 78, { nodR: 13, gros: 1.6 })}
</svg>
${T.etape.map((e, i) => `<div class="abs" style="left:${SX[i] - 145}px;top:790px;width:300px;text-align:center;text-wrap:balance">
  <p class="eb" style="font-size:17px;letter-spacing:.16em;color:${e.txt || C.grafit}">${e.cap || e.pre}</p>
  <p style="font-size:31px;font-weight:700;letter-spacing:-.015em;margin-top:8px;line-height:1.1">${e.nume}</p>
  <p style="font-size:23px;line-height:1.3;color:${C.grafit};margin-top:8px;text-wrap:balance">${e.fraza}</p></div>`).join('')}
<div class="subsol" style="bottom:44px;padding:0 120px;font-size:20px;border-top:2px solid ${C.linie};padding-top:18px;margin:0 120px;left:0;right:0;padding-left:0;padding-right:0"><span>Wise Teams &nbsp;/&nbsp; Drumul echipei</span><span>3</span></div>
` });

// 5. Pagină de raport (A4 la 150 dpi: 1240 × 1754), generică, fără date.
const capCard = (eb, nume, col, txt, titlu, def, plin) => `<div class="card" style="padding:44px 46px;display:flex;flex-direction:column">
  <p style="font-size:21px;color:${txt}">${eb}</p>
  <p style="font-size:48px;font-weight:700;color:${txt};letter-spacing:-.02em;margin-top:8px">${nume}</p>
  <p style="font-size:29px;font-weight:600;line-height:1.25;margin-top:22px">${titlu}</p>
  <p style="font-size:25px;line-height:1.45;color:${C.grafit};margin-top:14px;flex:1">${def}</p>
  <div style="display:flex;gap:8px;margin-top:30px">${[0, 1, 2, 3].map(k => `<span style="width:46px;height:14px;border-radius:7px;background:${k < plin ? col : C.nisip}"></span>`).join('')}<span style="font-size:20px;color:${C.grafit};margin-left:10px;line-height:14px">4 comportamente</span></div>
</div>`;
M.push({ id: 'raport-pagina', w: 1240, h: 1754, html: `
<div class="abs" style="left:110px;top:96px">${wordmark({ h: 48 })}</div>
<div class="abs" style="left:110px;top:200px;width:1020px">
  <p class="eb" style="font-size:20px">Drum critic &nbsp;/&nbsp; Echipa exemplu</p>
  <h1 style="font-size:76px;line-height:1.04;letter-spacing:-.035em;font-weight:700;margin-top:18px">Cele patru capabilități</h1>
  <p style="font-size:29px;line-height:1.4;color:${C.grafit};margin-top:22px;width:940px">Ce urmărește fiecare capabilitate și la ce etapă a drumului contribuie.</p>
</div>
<div class="abs" style="left:96px;top:520px;width:1048px;display:grid;grid-template-columns:1fr 1fr;gap:26px">
  ${capCard('Contribuie la etapa 2', 'Flux', C.flux, C.fluxText, 'Cum circulă munca prin echipă', 'Cum trec informațiile, deciziile și responsabilitățile de la un om la altul.', 3)}
  ${capCard('Contribuie la etapa 2', 'Încredere', C.incredere, C.incredereText, 'Cât adevăr poate duce echipa', 'Capacitatea de a trece prin diferențe fără să strice relațiile care fac colaborarea posibilă.', 2)}
  ${capCard('Contribuie la etapele 1 și 3', 'Livrare', C.livrare, C.livrareText, 'Aliniere, apoi consecvență', 'Prioritățile înțelese la fel, angajamentele duse la capăt, progresul vizibil.', 3)}
  ${capCard('Contribuie la etapa 4', 'Anticipare', C.wise, C.wiseText, 'Loc pentru ce urmează', 'Observăm schimbările din timp, punem la îndoială ce știm și facem loc pentru idei noi.', 2)}
</div>
<div class="abs card" style="left:96px;top:1444px;width:1048px;padding:34px 46px;display:flex;gap:40px;align-items:center">
  <p class="eb" style="font-size:18px;flex:none">O notă</p>
  <p style="font-size:24px;line-height:1.4;color:${C.grafit}">Pagină de exemplu pentru manualul de brand. Nu conține date reale.</p>
</div>
<div class="subsol" style="bottom:70px;left:110px;right:110px;border-top:2px solid ${C.linie};padding-top:22px;font-size:20px"><span>Wise Teams &nbsp;/&nbsp; Drum critic, echipa exemplu</span><span>5</span></div>
` });

// 6. Banner pentru pagina LinkedIn (1128 × 191, randat la 2x) și semnătura de email (600 × 170, la 2x).
M.push({ id: 'linkedin-banner', w: 1128, h: 191, scale: 2, html: `
<div class="aura" style="clip-path:inset(0 0 0 50%);opacity:.9"></div>
<svg class="abs" style="left:660px;top:0" width="468" height="191">${benzi(0, 26, 34, 380, 95, { a: .4, b: .66 })}</svg>
<p class="abs" style="left:220px;top:62px;width:420px;font-size:22px;line-height:1.3;font-weight:600;letter-spacing:-.01em">Results are what everyone sees.<br>How a team works is what you build.</p>
` });
M.push({ id: 'semnatura-email', w: 600, h: 170, scale: 2, html: `
<div class="abs" style="inset:0;background:#fff"></div>
<div class="abs" style="left:28px;top:34px">${wordmark({ h: 40 })}</div>
<div class="abs" style="left:150px;top:28px;width:2px;height:112px;background:${C.linie}"></div>
<div class="abs" style="left:174px;top:26px;width:400px">
  <p style="font-size:19px;font-weight:700">Alexandru Molea</p>
  <p style="font-size:15px;color:${C.grafit};margin-top:2px">Fondator, Wise Teams</p>
  <p style="font-size:14px;color:${C.grafit};margin-top:12px">[telefon] &nbsp;·&nbsp; [email]</p>
  <p style="font-size:14px;color:${C.grafit};margin-top:2px">wiseteams.substack.com</p>
  <div style="display:flex;gap:5px;margin-top:12px">${CAP.map(c => `<span style="width:30px;height:6px;border-radius:3px;background:${c}"></span>`).join('')}</div>
</div>` });

function sursa() {
  const dir = join(AICI, 'mockups'); mkdirSync(dir, { recursive: true });
  const html = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Wise Teams: mock-up-uri (sursă)</title><style>${css}</style></head><body>
${M.map(m => `<section class="m" id="${m.id}" style="width:${m.w}px;height:${m.h}px">${m.html}</section>`).join('\n')}
</body></html>`;
  const f = join(dir, 'sursa.html'); writeFileSync(f, html); return f;
}

async function png(f) {
  const { launch } = await import(pathToFileURL(join(AICI, '../../../../curs/teste/cdp.mjs')).href);
  const b = await launch({ port: 9347 });
  try {
    const p = await b.open(pathToFileURL(f).href);
    await b.send('Emulation.setDeviceMetricsOverride', { width: 2000, height: 1200, deviceScaleFactor: 1, mobile: false }, p.sessionId);
    await new Promise(r => setTimeout(r, 900));
    const raport = await b.evaluate(p, `(()=>{const out=[];document.querySelectorAll('.m').forEach(s=>{const R=s.getBoundingClientRect();
      // text ieșit din cadru sau tăiat în cutia lui
      s.querySelectorAll('p,h1,span').forEach(e=>{const r=e.getBoundingClientRect(); if(r.width&&(r.right>R.right+1||r.bottom>R.bottom+1||r.left<R.left-1)) out.push(s.id+': iese din cadru: '+e.textContent.slice(0,40)); if(e.scrollWidth>e.clientWidth+1&&getComputedStyle(e).display!=='inline') out.push(s.id+': text tăiat: '+e.textContent.slice(0,40));});});return out})()`);
    if (raport.length) console.log('VERIFICARE:\n' + raport.join('\n')); else console.log('Verificare: niciun text ieșit din cadru.');
    for (const m of M) {
      const box = await b.evaluate(p, `(()=>{const r=document.getElementById(${JSON.stringify(m.id)}).getBoundingClientRect();return {x:r.left+scrollX,y:r.top+scrollY}})()`);
      const { data } = await b.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: box.x, y: box.y, width: m.w, height: m.h, scale: m.scale || 1 } }, p.sessionId);
      writeFileSync(join(AICI, 'mockups', `${m.id}.png`), Buffer.from(data, 'base64'));
      console.log('PNG', m.id, `${m.w * (m.scale || 1)}×${m.h * (m.scale || 1)}`);
    }
  } finally { b.close(); }
}

elemente();
const f = sursa();
if (!process.argv.includes('--fara-png')) await png(f);
