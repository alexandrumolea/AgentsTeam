// PDF „The 4 Layers” + postarea LinkedIn pentru workshop, în stilul The Wise (Ioana, 2026-11-26).
// Textele vin DIRECT din draft-urile Sofiei (textul lui Alex), fără nicio schimbare de literă:
//   articolul: team/sofia/documente/drafts/wise-teams-articol-1-2026-11-20.md, „Textul pentru Substack (EN)”
//   postarea:  team/sofia/documente/drafts/linkedin-workshop-wise-2026-11-25.md, „Postarea (RO)”
// Rulare: node gen.mjs → articol-postare.html; apoi Chrome headless --print-to-pdf (vezi randare.sh).
// Font: Poppins (Wise Teams) nu e pe acest calculator; folosim Avenir Next, cel mai apropiat font de sistem.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AICI = dirname(fileURLToPath(import.meta.url));
const RADACINA = join(AICI, '../../../..');
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

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const inline = s => esc(s)
  .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
  .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  .replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');

// Culoarea fiecărei etape (din schița v3): container nisip, Delivery coral, Flow teal, Trust indigo, Anticipation portocaliu.
function felul(titlu) {
  if (/^Before the journey/.test(titlu)) return 'container';
  if (/^[13]\. Delivery/.test(titlu)) return 'delivery';
  if (/^2\. Flow and Trust/.test(titlu)) return 'flowtrust';
  if (/^4\. Anticipation/.test(titlu)) return 'anticipation';
  if (/^Beyond the four layers/.test(titlu)) return 'emergent';
  if (/^A question/.test(titlu)) return 'question';
  return 'plain';
}
// Titlul etapei: partea „1. Delivery:” colorată, restul în cerneală. Literele rămân aceleași.
function titluEtapa(t) {
  const m = t.match(/^(.*?:)( .*)?$/);
  if (!m || !m[2]) return inline(t);
  return `<span><span class="pre">${inline(m[1])}</span>${inline(m[2])}</span>`;
}

// ---- articolul ----
const linii = artMd.split('\n');
let titlu = '', subtitlu = '', intro = [], sectiuni = [], imagine = null, dupaImagine = [];
let cur = null, faza = 'intro';
for (const raw of linii) {
  const l = raw.trim();
  if (!l) continue;
  if (l.startsWith('# ')) { titlu = l.slice(2); continue; }
  if (!subtitlu && /^\*[^*].*\*$/.test(l)) { subtitlu = l.slice(1, -1); continue; }
  const img = l.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (img) { imagine = { alt: img[1], src: '../' + img[2].replace(/^(\.\.\/)+ioana\/documente\//, '') }; faza = 'dupa'; continue; }
  if (l.startsWith('### ')) { cur = { titlu: l.slice(4), fel: felul(l.slice(4)), blocuri: [] }; sectiuni.push(cur); faza = 'sect'; continue; }
  if (faza === 'intro') { intro.push(l); continue; }
  if (faza === 'dupa') { dupaImagine.push(l); continue; }
  if (l.startsWith('#### ')) { cur.blocuri.push({ tip: 'h4', t: l.slice(5) }); continue; }
  if (/^\*\*Key insight:/.test(l)) { cur.blocuri.push({ tip: 'insight', t: l.replace(/^\*\*|\*\*$/g, '') }); continue; }
  if (/^\*\*[^*]+\*\*$/.test(l)) { cur.blocuri.push({ tip: 'inchidere', t: l.slice(2, -2) }); continue; }
  cur.blocuri.push({ tip: 'p', t: l });
}

function h4(t) {
  const fel = /^Flow/.test(t) ? 'flow' : /^Trust/.test(t) ? 'trust' : '';
  const m = t.match(/^(.*?:)( .*)$/);
  return `<h4 class="${fel}"><span class="pre">${inline(m ? m[1] : t)}</span>${m ? inline(m[2]) : ''}</h4>`;
}
function bloc(b) {
  if (b.tip === 'h4') return h4(b.t);
  if (b.tip === 'insight') {
    const [et, ...rest] = b.t.split(':');
    return `<div class="insight"><span class="et">${esc(et)}:</span> <span class="ins">${inline(rest.join(':').trim())}</span></div>`;
  }
  if (b.tip === 'inchidere') return `<p class="inchidere">${inline(b.t)}</p>`;
  return `<p>${inline(b.t)}</p>`;
}
function sectiuneHtml(s) {
  const b = s.blocuri;
  // Capul secțiunii (titlu + key insight + primul paragraf) nu se rupe între pagini.
  let k = 0, cap = '';
  if (b[0]?.tip === 'insight') { cap += bloc(b[0]); k = 1; }
  if (b[k]?.tip === 'p') { cap += bloc(b[k]); k++; }
  let corp = '';
  for (let i = k; i < b.length; i++) {
    // subtitlul (h4) rămâne lângă primul lui paragraf
    if (b[i].tip === 'h4' && b[i + 1]?.tip === 'p') { corp += `<div class="tine">${bloc(b[i])}${bloc(b[i + 1])}</div>`; i++; }
    else corp += bloc(b[i]);
  }
  const titluH = ['plain', 'question', 'container', 'emergent'].includes(s.fel) ? `<span>${inline(s.titlu)}</span>` : titluEtapa(s.titlu);
  return `<section class="etapa ${s.fel}">
  <div class="cap"><h3><span class="semn" aria-hidden="true"></span>${titluH}</h3>${cap}</div>
  ${corp}
</section>`;
}

// ---- postarea ----
const postLinii = postMd.split('\n').map(l => l.trim());
let postHtml = '', lista = [], para = [];
const golPara = () => { if (para.length) { postHtml += `<p>${para.map(inline).join('<br>')}</p>`; para = []; } };
const golLista = () => { if (lista.length) { postHtml += `<ul class="buline">${lista.map(x => `<li>${inline(x)}</li>`).join('')}</ul>`; lista = []; } };
for (const l of postLinii) {
  if (!l) { golPara(); golLista(); continue; }
  if (l.startsWith('* ')) { golPara(); lista.push(l.slice(2)); continue; }
  golLista(); para.push(l);
}
golPara(); golLista();
const lipsa = lipsaMd.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));

// Benzile de pe prima pagină: cele patru capabilități care se adună într-un punct (limbajul vizual Wise).
const benzi = `<svg class="benzi" viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
  <defs><filter id="bl" x="-20%" y="-50%" width="140%" height="200%"><feGaussianBlur stdDeviation="38"/></filter></defs>
  <g filter="url(#bl)" opacity=".55">
    <circle cx="820" cy="90" r="120" fill="#9AA6E8"/><circle cx="900" cy="230" r="110" fill="#F7C77E"/><circle cx="700" cy="250" r="90" fill="#9FD3CF"/>
  </g>
  <path d="M0 18 C 380 18, 560 120, 860 146 L 860 150 C 560 138, 380 92, 0 92 Z" fill="#2E9496"/>
  <path d="M0 92 C 380 92, 560 138, 860 150 L 860 152 C 560 150, 380 160, 0 160 Z" fill="#3A4FC6"/>
  <path d="M0 160 C 380 160, 560 150, 860 152 L 860 154 C 560 164, 380 226, 0 226 Z" fill="#DD4F3B"/>
  <path d="M0 226 C 380 226, 560 164, 860 154 L 860 158 C 560 182, 380 292, 0 292 Z" fill="#F4A533"/>
  <circle cx="872" cy="152" r="20" fill="#FFFFFF" stroke="#D3C9B8" stroke-width="3"/><circle cx="872" cy="152" r="8" fill="#1C1C1E"/>
</svg>`;

// Semnătura de la final: aceleași patru benzi, mici, care se adună în punct, apoi „Wise Teams”.
const benziMici = `<svg viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
  <path d="M0 6 C 420 6, 640 44, 960 48 L 960 49 C 640 47, 420 30, 0 30 Z" fill="#2E9496"/>
  <path d="M0 30 C 420 30, 640 47, 960 49 L 960 50 C 640 50, 420 54, 0 54 Z" fill="#3A4FC6"/>
  <path d="M0 54 C 420 54, 640 50, 960 50 L 960 51 C 640 53, 420 76, 0 76 Z" fill="#DD4F3B"/>
  <path d="M0 76 C 420 76, 640 53, 960 51 L 960 52 C 640 60, 420 98, 0 98 Z" fill="#F4A533"/>
</svg>`;

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The 4 Layers · Wise Teams</title>
<!-- Generat de gen.mjs. Nu edita de mână: textele vin din draft-urile Sofiei (textul lui Alex). -->
<!-- Font: Poppins nu e instalat; Avenir Next e fontul de sistem cel mai apropiat. -->
<style>
:root{
  --bg:#F6F3EE; --ink:#1C1C1E; --muted:#5E5A55; --card:#FFFFFF; --line:#E4DDD2; --sand:#ECE5D9; --sandLine:#D3C9B8;
  --coral:#DD4F3B; --coralText:#B83A28; --orange:#F4A533; --orangeText:#9A5A00;
  --teal:#2E9496; --tealText:#1B7779; --indigo:#3A4FC6;
  --font:"Avenir Next","Poppins",Avenir,"Helvetica Neue",Arial,sans-serif;
}
@page{ size:A4; margin:18mm 20mm 20mm; background:var(--bg);
  @bottom-left{ content:"Wise Teams  /  The 4 Layers of How a Team Works"; font:500 8pt var(--font); color:#5E5A55; letter-spacing:.02em }
  @bottom-right{ content:counter(page); font:600 8pt var(--font); color:#5E5A55 } }
@page post{ @bottom-left{ content:"Wise Teams  /  Postare LinkedIn · workshop"; font:500 8pt var(--font); color:#5E5A55 } }
*{ box-sizing:border-box }
html,body{ margin:0; background:var(--bg); color:var(--ink); -webkit-print-color-adjust:exact; print-color-adjust:exact }
body{ font:400 11.2pt/1.58 var(--font); hyphens:none; orphans:3; widows:3 }
a{ color:var(--tealText); text-decoration:underline; text-decoration-thickness:.06em; text-underline-offset:.15em }
p{ margin:0 0 2.6mm }
.eticheta{ font:700 7.6pt/1.2 var(--font); letter-spacing:.16em; text-transform:uppercase; color:var(--muted) }

/* Prima pagină */
.prima{ position:relative }
.marca{ display:flex; justify-content:space-between; align-items:baseline; margin-bottom:14mm }
.marca .wt{ font:700 13pt var(--font); color:var(--orangeText) }
h1{ font:700 40pt/1.04 var(--font); letter-spacing:-.015em; margin:0 0 3.5mm }
.sub{ font:italic 400 14.5pt/1.4 var(--font); color:var(--muted); margin:0 0 8mm }
.benzi{ display:block; width:100%; height:38mm; margin:0 0 10mm }
.intro p{ font-size:12.2pt; line-height:1.58; margin-bottom:2.8mm }
.intro p:first-child{ font:600 15pt/1.38 var(--font); margin-bottom:3.4mm }

/* Imaginea: o pagină a ei, cât pagina de înaltă, ca să nu lase goluri */
figure.drum{ break-before:page; margin:0; text-align:center }
figure.drum img{ height:236mm; width:auto; display:block; margin:0 auto; border-radius:3mm; border:1px solid var(--line) }
.dupa{ text-align:center; font:600 12pt var(--font); margin:5mm 0 0 }

/* Etapele */
.etapa{ margin:0 0 6mm }
.etapa.container{ break-before:page }
.cap{ break-inside:avoid }
h3{ font:700 17pt/1.2 var(--font); letter-spacing:-.005em; margin:0 0 3.5mm; display:flex; gap:3mm; align-items:baseline }
h3 .semn{ flex:none; width:3.2mm; height:3.2mm; border-radius:50%; background:var(--ink); transform:translateY(-.4mm) }
.container h3 .semn{ background:var(--sandLine) } .container h3{ color:var(--ink) }
.delivery .pre{ color:var(--coralText) } .delivery h3 .semn{ background:var(--coral) }
.flowtrust .pre{ color:var(--tealText) } .flowtrust h3 .semn{ background:conic-gradient(var(--teal) 0 50%, var(--indigo) 0) }
.anticipation .pre{ color:var(--orangeText) } .anticipation h3 .semn{ background:var(--orange) }
.emergent h3 .semn{ background:conic-gradient(var(--coral) 0 25%, var(--teal) 0 50%, var(--indigo) 0 75%, var(--orange) 0) }
h4{ font:700 12.5pt/1.3 var(--font); margin:5mm 0 2mm }
h4.flow .pre{ color:var(--tealText) } h4.trust .pre{ color:var(--indigo) }
.tine{ break-inside:avoid }

.insight{ background:var(--card); border:1px solid var(--line); border-left:1.4mm solid var(--ink); border-radius:2.5mm;
  padding:4mm 5mm 4.2mm; margin:0 0 4.5mm; break-inside:avoid }
.insight .et{ display:block; font:700 7.6pt/1.2 var(--font); letter-spacing:.16em; text-transform:uppercase; margin-bottom:1.8mm; color:var(--muted) }
.insight .ins{ font:600 12.2pt/1.42 var(--font) }
.container .insight{ border-left-color:var(--sandLine) }
.delivery .insight{ border-left-color:var(--coral) } .delivery .insight .et{ color:var(--coralText) }
.flowtrust .insight{ border-image:none; border-left-color:var(--teal) } .flowtrust .insight .et{ color:var(--tealText) }
.anticipation .insight{ border-left-color:var(--orange) } .anticipation .insight .et{ color:var(--orangeText) }

p.inchidere{ font:600 11.4pt/1.45 var(--font); border-left:.8mm solid var(--line); padding:.6mm 0 .6mm 4mm; margin:4mm 0 3mm; break-inside:avoid; break-before:avoid }
.flowtrust p.inchidere{ border-left-color:var(--teal) }
.emergent p.inchidere{ border-left-color:var(--orange); font-size:14pt; margin-top:6mm }

.etapa.question{ background:var(--sand); border:1px solid var(--sandLine); border-radius:4mm; padding:7mm 8mm 5mm; break-inside:avoid; margin-top:10mm }
.question h3{ font-size:16pt } .question p{ font-size:12.4pt; margin-bottom:3.2mm } .question h3 .semn{ background:var(--orange) }

.semnatura{ margin:12mm 0 0; break-inside:avoid; display:flex; align-items:center; gap:6mm }
.semnatura svg{ flex:1; height:16mm }
.semnatura .wt{ font:700 14pt var(--font); color:var(--orangeText); white-space:nowrap }

/* Postarea */
.post{ page:post; break-before:page }
.post h2{ font:700 22pt/1.15 var(--font); margin:2mm 0 2mm }
.post .lead{ color:var(--muted); margin:0 0 7mm }
.card{ background:var(--card); border:1px solid var(--line); border-radius:4mm; padding:7mm 8mm 6mm; break-inside:avoid }
.autor{ display:flex; gap:3.5mm; align-items:center; margin-bottom:5mm }
.avatar{ width:12mm; height:12mm; border-radius:50%; flex:none;
  background:conic-gradient(var(--teal) 0 25%, var(--indigo) 0 50%, var(--coral) 0 75%, var(--orange) 0) }
.autor b{ display:block; font:700 11pt/1.2 var(--font) } .autor span{ font-size:9pt; color:var(--muted) }
.card p{ font-size:11.6pt; line-height:1.55; margin:0 0 3.6mm }
ul.buline{ list-style:none; padding:0; margin:0 0 3.6mm }
ul.buline li{ position:relative; padding-left:7mm; margin:0 0 2.6mm; font-size:11.6pt; line-height:1.55 }
ul.buline li::before{ content:""; position:absolute; left:.6mm; top:2.1mm; width:2.6mm; height:2.6mm; border-radius:50% ; background:var(--teal) }
ul.buline li:nth-child(2)::before{ background:var(--coral) } ul.buline li:nth-child(3)::before{ background:var(--orange) }
.nota{ margin-top:8mm; border:1px dashed var(--sandLine); border-radius:3mm; padding:4.5mm 6mm; color:var(--muted); font-size:9.6pt; break-inside:avoid }
.nota .eticheta{ display:block; margin-bottom:2mm }
.nota ul{ margin:0; padding-left:5mm } .nota li{ margin:0 0 1mm }
.colofon{ margin-top:5mm; font-size:8.4pt; color:var(--muted) }
</style>
</head>
<body>
<article>
  <header class="prima">
    <div class="marca"><span class="wt">Wise Teams</span><span class="eticheta">Article · Substack draft</span></div>
    <h1>${inline(titlu).replace(/ (How a Team)/, '<br>$1')}</h1>
    <p class="sub">${inline(subtitlu)}</p>
    ${benzi}
    <div class="intro">${intro.map(p => `<p>${inline(p)}</p>`).join('\n')}</div>
  </header>
  <figure class="drum"><img src="${imagine.src}" alt="${esc(imagine.alt)}"></figure>
  ${dupaImagine.map(p => `<p class="dupa">${inline(p)}</p>`).join('')}
  ${sectiuni.map(sectiuneHtml).join('\n')}
  <footer class="semnatura">${benziMici}<span class="wt">Wise Teams</span></footer>
</article>
<section class="post" lang="ro">
  <span class="eticheta">Postare LinkedIn · workshop Wise Teams</span>
  <h2>Previzualizare postare</h2>
  <p class="lead">Textul lui Alex, așa cum ar apărea în feed. Draft, nepublicat.</p>
  <div class="card">
    <div class="autor"><span class="avatar" aria-hidden="true"></span><div><b>Alexandru Molea</b><span>Wise Teams</span></div></div>
    ${postHtml}
  </div>
  <div class="nota"><span class="eticheta">Notă de lucru · nu face parte din postare</span>
    Ce lipsește pentru publicare:
    <ul>${lipsa.map(x => `<li>${inline(x)}</li>`).join('')}</ul>
  </div>
  <p class="colofon">Font: Avenir Next, în locul Poppins (fontul Wise Teams nu e instalat pe acest calculator). Imaginea: „A · Drumul”, aleasă de Alex.</p>
</section>
</body>
</html>`;
writeFileSync(join(AICI, 'articol-postare.html'), html);
console.log('ok', sectiuni.length, 'secțiuni,', intro.length, 'paragrafe de intro');
