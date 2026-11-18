// Orbita drumului (pagina Despre, D-063). Portat din generatorul Ioanei:
// team/ioana/documente/despre-compozitie/orbita-mock.mjs. Datele vin din content/despre.md (parcurs, formare).
// Geometria se calculează aici, la build: pagina nu are nevoie de JavaScript ca să o deseneze.
// Cadranul e la scară: primul an jos în stânga, azi jos în dreapta, în sensul acelor de ceas.
// Fiecare rol e un arc cât a durat; când două roluri se suprapun, al doilea trece pe culoarul următor.

const S = 540, C = S / 2, A0 = 210, SW = 300;           // mărimea desenului, unghiul de start (ceas: 0 = sus), deschiderea
const LANES = [222, 199, 176];                           // culoarele rolurilor, din exterior spre interior
const R_PUNCT = 152;                                     // un rol fără an de început: doar un punct „azi”
const R_FORMARE = 104, LITERE = 'ABCDEFGHIJ';
const GOL = 2.2;                                         // un mic gol la capete, ca arcele să nu se lipească

const f = n => +n.toFixed(1);
const pc = n => +(n / S * 100).toFixed(2);
const pad = i => String(i + 1).padStart(2, '0');

// Validează și normalizează datele. Orice greșeală aruncă o eroare cu mesaj clar (build-ul se oprește).
export function citesteParcurs(data, now = Date.now()){
  const F = 'content/despre.md';
  const p = data.parcurs || {}, fm = data.formare || {};
  const an = new Date(now).getUTCFullYear();
  const start = Date.UTC(an, 0, 1), urm = Date.UTC(an + 1, 0, 1);
  const AZI = an + (now - start) / (urm - start);
  const prezent = v => String(v ?? '').trim().toLowerCase() === 'prezent';
  const anValid = (v, unde) => {
    if (!Number.isInteger(v) || v < 1950 || v > an) throw new Error(`${F}: ${unde} trebuie să fie un an între 1950 și ${an} (acum e „${v}”).`);
    return v;
  };
  const roluri = (Array.isArray(p.roluri) ? p.roluri : []).map((r, i) => {
    const unde = `parcurs.roluri[${i + 1}]`;
    if (!r || !String(r.rol || '').trim()) throw new Error(`${F}: ${unde} are nevoie de „rol”.`);
    const deLa = r.de_la === undefined || r.de_la === null || r.de_la === '' ? null : anValid(r.de_la, `${unde}.de_la`);
    const acum = prezent(r.pana_la);
    const panaLa = acum ? null : r.pana_la === undefined || r.pana_la === null || r.pana_la === '' ? deLa : anValid(r.pana_la, `${unde}.pana_la`);
    if (deLa === null && !acum) throw new Error(`${F}: ${unde} („${r.rol}”) nu are „de_la”. Fără an de început, rolul trebuie să fie „pana_la: prezent”.`);
    if (deLa !== null && panaLa !== null && panaLa < deLa) throw new Error(`${F}: ${unde} („${r.rol}”) se termină înainte să înceapă.`);
    const ani = deLa === null ? 'prezent' : acum ? `${deLa} – prezent` : panaLa === deLa ? String(deLa) : `${deLa} – ${panaLa}`;
    return { rol: String(r.rol).trim(), organizatie: String(r.organizatie || '').trim(), descriere: String(r.descriere || '').trim(), de_la: deLa, pana_la: acum ? 'prezent' : panaLa, ani, acum,
      a: deLa === null ? AZI : deLa, b: deLa === null ? null : acum ? AZI : Math.min(panaLa + 1, AZI) }; // sfârșitul unui an = începutul anului următor
  });
  // de la cel mai vechi la cel mai nou; rolurile fără an de început la final
  roluri.sort((x, y) => (x.de_la === null) - (y.de_la === null) || x.a - y.a || (x.b ?? AZI) - (y.b ?? AZI));
  const formare = (Array.isArray(fm.lista) ? fm.lista : []).map((e, i) => {
    if (!e || !String(e.titlu || '').trim()) throw new Error(`${F}: formare.lista[${i + 1}] are nevoie de „titlu”.`);
    return { titlu: String(e.titlu).trim(), unde: String(e.unde || '').trim() };
  });
  if (formare.length > LITERE.length) throw new Error(`${F}: formare.lista are cel mult ${LITERE.length} rânduri.`);
  const ani = roluri.filter(r => r.de_la !== null).map(r => r.de_la);
  if (roluri.length && !ani.length) throw new Error(`${F}: parcurs.roluri are nevoie de cel puțin un rol cu „de_la”.`);
  const Y0 = ani.length ? Math.min(...ani) : an, Y1 = an + 1;
  // culoarul: primul pe care rolul nu se suprapune cu altul
  const capat = [];
  for (const r of roluri){
    if (r.b === null) { r.culoar = null; continue; }
    let k = capat.findIndex(e => e <= r.a);
    if (k < 0) k = capat.length;
    if (k >= LANES.length) throw new Error(`${F}: prea multe roluri în paralel în jurul anului ${r.de_la} (cel mult ${LANES.length}).`);
    capat[k] = r.b; r.culoar = k;
  }
  return {
    titlu: String(p.titlu || 'Parcursul meu profesional'), intro: String(p.intro || ''), centru: String(p.centru || 'ani de drum'),
    formareTitlu: String(fm.titlu || 'Formare'), formareNota: String(fm.nota || ''),
    roluri, formare, Y0, Y1, AZI, an
  };
}

// „19 ani”, dar „20 de ani” (în română, de la 20 în sus apare „de”, cu excepția lui 1–19 din fiecare sută)
const deAni = n => { const r = n % 100; return n !== 0 && (r === 0 || r >= 20) ? 'de ' : ''; };

export function orbita(P, esc){
  const { roluri, formare, Y0, Y1, AZI } = P;
  const ang = y => A0 + (y - Y0) / (Y1 - Y0) * SW;
  const pt = (a, r) => [C + r * Math.sin(a * Math.PI / 180), C - r * Math.cos(a * Math.PI / 180)];
  const css = [];
  const loc = (sel, [x, y]) => css.push(`.despre .orb .dial ${sel}{left:${pc(x)}%;top:${pc(y)}%}`);
  const raza = r => r.culoar === null ? R_PUNCT : LANES[r.culoar];

  const arce = roluri.map((r, i) => {
    const R = raza(r), cls = `arc a${i + 1} l${r.culoar === null ? 'p' : r.culoar + 1}${r.acum ? ' now' : ''}`;
    if (r.b === null){ const [x, y] = pt(ang(r.a), R); return `<circle class="${cls}" cx="${f(x)}" cy="${f(y)}" r="6"/>`; }
    const g = Math.min(GOL, (ang(r.b) - ang(r.a)) / 3);    // un rol scurt păstrează un arc vizibil
    const [x1, y1] = pt(ang(r.a) + g, R), [x2, y2] = pt(ang(r.b) - g, R), mare = (ang(r.b) - ang(r.a) - 2 * g) > 180 ? 1 : 0;
    return `<path class="${cls}" d="M${f(x1)} ${f(y1)} A${R} ${R} 0 ${mare} 1 ${f(x2)} ${f(y2)}"/>`;
  }).join('');
  const discuri = roluri.map((r, i) => { loc(`.r${i + 1}`, pt(ang(r.a), raza(r))); return `<span class="ref r${i + 1}${r.acum ? ' now' : ''}">${pad(i)}</span>`; }).join('');
  const litere = formare.map((e, i) => { loc(`.e${i + 1}`, pt(i * 360 / formare.length, R_FORMARE)); return `<span class="ref edu-ref e${i + 1}">${LITERE[i]}</span>`; }).join('');
  // reperele: din 5 în 5 ani, cât încap înainte de „azi”; etichetele de la capete sunt trase spre jos, ca să nu stea pe arce
  const repere = [];
  for (let y = Y0; y <= AZI - 2.5; y += 5) repere.push(y);
  const etichete = [...repere.map((y, i) => [String(y), i === 0 ? ang(y) - 8 : ang(y)]), ['azi', ang(AZI) + 10]];
  const tickuri = etichete.map(([t, a], i) => { loc(`.tk${i + 1}`, pt(a, 266)); return `<span class="tick tk${i + 1}${t === 'azi' ? ' azi' : ''}">${t}</span>`; }).join('');
  const linii = [...repere, AZI].map(y => { const a = ang(y), [x1, y1] = pt(a, 234), [x2, y2] = pt(a, 241); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`; }).join('');
  const ani = P.an - Y0;
  const svg = `<svg viewBox="0 0 ${S} ${S}" aria-hidden="true" focusable="false"><circle class="track" cx="${C}" cy="${C}" r="${LANES[0]}"/>${formare.length ? `<circle class="track" cx="${C}" cy="${C}" r="${R_FORMARE}"/>` : ''}<g class="ticks">${linii}</g>${arce}<g class="light"><circle cx="${C}" cy="${C - 238}" r="4"/></g></svg>`;
  const dial = `<div class="dial" aria-hidden="true">${svg}${tickuri}${discuri}${litere}<div class="core"><span class="big">${ani}</span><span class="cap">${esc(deAni(ani) + P.centru)}</span></div></div>`;

  const lista = roluri.map((r, i) => `<li class="s${i + 1}${r.acum ? ' now' : ''}"><span class="ref" aria-hidden="true">${pad(i)}</span><div><b>${esc(r.rol)}</b><span class="meta">${esc([r.organizatie, r.ani].filter(Boolean).join(' · '))}</span>${r.descriere ? `<p>${esc(r.descriere)}</p>` : ''}</div></li>`).join('');
  const listaFormare = formare.map((e, i) => `<li class="t${i + 1}"><span class="ref edu-ref" aria-hidden="true">${LITERE[i]}</span><div><b>${esc(e.titlu)}</b>${e.unde ? `<span class="meta">${esc(e.unde)}</span>` : ''}</div></li>`).join('');
  const html = `<section class="orb w glass-read" aria-labelledby="parcursH">
  <div class="orb-head"><h2 id="parcursH">${esc(P.titlu)}</h2>${P.intro ? `<p class="lede">${esc(P.intro)}</p>` : ''}</div>
  ${dial}
  <ol class="stations" aria-label="${esc(`Rolurile, de la ${Y0} până azi`)}">${lista}</ol>
  ${formare.length ? `<div class="edu-b"><h2 id="formareH">${esc(P.formareTitlu)}</h2>${P.formareNota ? `<p class="hint">${esc(P.formareNota)}</p>` : ''}<ul class="stations" aria-labelledby="formareH">${listaFormare}</ul></div>` : ''}
</section>`;

  // treci cu mouse-ul peste un rând: i se aprinde arcul și discul (CSS :has, fără JavaScript)
  // lumina: stă pe „azi”; cu JavaScript și fără „reduce motion”, pornește de la primul an și face o singură trecere (4,5 s, ease-out)
  css.push(`.despre .orb .light{transform:rotate(${f(ang(AZI))}deg)}`,
    `@keyframes drum{from{transform:rotate(${f(ang(Y0))}deg)}to{transform:rotate(${f(ang(AZI))}deg)}}`,
    `@media (prefers-reduced-motion:no-preference){body:not(.no-js) .despre .orb:not(.drum) .light{transform:rotate(${f(ang(Y0))}deg)}body:not(.no-js) .despre .orb.drum .light{animation:drum 4.5s cubic-bezier(.16,1,.3,1) both}}`);
  css.push('.despre .orb:has(li:hover) .arc{opacity:.3}');
  roluri.forEach((_, i) => css.push(`.despre .orb:has(.s${i + 1}:hover) .a${i + 1}{opacity:1}`, `.despre .orb:has(.s${i + 1}:hover) path.a${i + 1}{stroke-width:13}`, `.despre .orb:has(.s${i + 1}:hover) .r${i + 1}{transform:translate(-50%,-50%) scale(1.18);background:var(--pressed-bg);color:var(--pressed-fg)}`));
  formare.forEach((_, i) => css.push(`.despre .orb:has(.t${i + 1}:hover) .e${i + 1}{transform:translate(-50%,-50%) scale(1.18);background:var(--pressed-bg);color:var(--pressed-fg)}`));
  return { html, css: `/* Orbita drumului: pozițiile și hover-ul, generate de site/orbita.mjs din content/despre.md */\n${css.join('\n')}\n` };
}
