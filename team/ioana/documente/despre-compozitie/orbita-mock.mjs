// Varianta nouă de parcurs: „Orbita drumului”. Geometria se calculează aici, la build; pagina nu are nevoie de JavaScript.
const S = 540, C = S / 2, Y0 = 2007, Y1 = 2027, A0 = 210, SW = 300, AZI = 2026.9;
const ang = y => A0 + (y - Y0) / (Y1 - Y0) * SW;               // unghi de ceas: 0 sus, în sensul acelor
const pt = (a, r) => [C + r * Math.sin(a * Math.PI / 180), C - r * Math.cos(a * Math.PI / 180)];
const f = n => +n.toFixed(1), pc = n => +(n / S * 100).toFixed(2);
const LANE = { 1: 222, 2: 199, 3: 152 };
export const roles = [
  { t: 'Fondator', o: 'Youth ONG', y: '2007 – 2012', a: 2007, b: 2013, lane: 1, d: 'O organizație concentrată pe dezvoltarea abilităților antreprenoriale în rândul tinerilor.' },
  { t: 'Sales &amp; Sales Management', o: 'Vodafone', y: '2008 – 2011', a: 2008, b: 2012, lane: 2, d: 'Dezvoltarea echipelor de vânzări performante.' },
  { t: 'HR Learning Solutions Lead', o: 'Vodafone', y: '2012', a: 2012, b: 2013, lane: 2, d: 'Centralizarea și dezvoltarea echipei de traineri în HR și coaching pentru o parte din liderii organizației, ambele în contextul proiectului de schimbare culturală.' },
  { t: 'Founder', o: 'BEMORE Learning Studio', y: '2013 – 2025', a: 2013, b: 2026, lane: 1, d: 'Dezvoltare de specialiști Learning &amp; Development. Training design și coaching pentru mediul corporate.' },
  { t: 'Coach &amp; Team Coach', o: '', y: '2023 – prezent', a: 2023, b: AZI, lane: 2, now: 1, d: 'Lucrez pentru dezvoltarea strategiei și armonizarea echipelor în direcția unui scop comun.' },
  { t: 'Leadership Trainer', o: 'Innersis', y: '2026 – prezent', a: 2026, b: AZI, lane: 1, now: 1, d: 'Inovație în training și calitate în livrarea programelor de training.' },
  { t: 'Colaborator', o: 'LIFT', y: 'prezent', a: AZI, b: null, lane: 3, now: 1, d: '' },
];
export const edu = [
  { t: 'Licență în Management', d: 'ASE București' },
  { t: 'Executive MBA', d: 'BISM (fosta Maastricht School of Management România), cursuri finalizate' },
  { t: 'Formare în coaching', d: 'Metasysteme Coaching' },
  { t: 'Human Synergistics', d: 'acreditare LSI, LI și GSI' },
  { t: 'Scrum &amp; Agile', d: 'Scrum Master, Facilitation și Agile Leadership' },
];
const LET = 'ABCDE', RIN = 104;
export function orbitHtml() {
  const arcs = roles.map((r, i) => {
    const R = LANE[r.lane], [x1, y1] = pt(ang(r.a), R);
    if (r.b === null) return `<circle class="arc a${i + 1} now" cx="${f(x1)}" cy="${f(y1)}" r="6"/>`;
    const g = 2.2, [s1, s2] = pt(ang(r.a) + g, R), [x2, y2] = pt(ang(r.b) - g, R), large = (ang(r.b) - ang(r.a) - 2 * g) > 180 ? 1 : 0; // un mic gol între roluri, ca arcele să nu se lipească
    return `<path class="arc a${i + 1}${r.now ? ' now' : ''}" d="M${f(s1)} ${f(s2)} A${R} ${R} 0 ${large} 1 ${f(x2)} ${f(y2)}"/>`;
  }).join('');
  const discs = roles.map((r, i) => { const [x, y] = pt(ang(r.a), LANE[r.lane]); return `<span class="ref r${i + 1}${r.now ? ' now' : ''}" style="left:${pc(x)}%;top:${pc(y)}%">${String(i + 1).padStart(2, '0')}</span>`; }).join('');
  const inner = edu.map((e, i) => { const [x, y] = pt(i * 72, RIN); return `<span class="ref e${i + 1} edu-ref" style="left:${pc(x)}%;top:${pc(y)}%">${LET[i]}</span>`; }).join('');
  const ticks = [[2007, 202], [2012, ang(2012)], [2017, ang(2017)], [2022, ang(2022)], ['azi', 158]].map(([t, a]) => { const [x, y] = pt(a, 266); return `<span class="tick${t === 'azi' ? ' azi' : ''}" style="left:${pc(x)}%;top:${pc(y)}%">${t}</span>`; }).join('');
  const tickMarks = [2007, 2012, 2017, 2022, AZI].map(y => { const a = ang(y), [x1, y1] = pt(a, 234), [x2, y2] = pt(a, 241); return `<line x1="${f(x1)}" y1="${f(y1)}" x2="${f(x2)}" y2="${f(y2)}"/>`; }).join('');
  const svg = `<svg viewBox="0 0 ${S} ${S}" aria-hidden="true" focusable="false">
    <circle class="track" cx="${C}" cy="${C}" r="${LANE[1]}"/><circle class="track" cx="${C}" cy="${C}" r="${RIN}"/>
    <g class="ticks">${tickMarks}</g>${arcs}
    <g class="light"><circle cx="${C}" cy="${C - 238}" r="4"/></g></svg>`;
  return `<div class="dial" aria-hidden="true">${svg}${ticks}${discs}${inner}<div class="core"><span class="big">19</span><span class="cap">ani de drum</span></div></div>`;
}
export function orbitSection() {
  const li = roles.map((r, i) => `<li class="s${i + 1}${r.now ? ' now' : ''}"><span class="ref">${String(i + 1).padStart(2, '0')}</span><div><b>${r.t}</b><span class="meta">${[r.o, r.y].filter(Boolean).join(' · ')}</span>${r.d ? `<p>${r.d}</p>` : ''}</div></li>`).join('');
  const el = edu.map((e, i) => `<li class="t${i + 1}"><span class="ref edu-ref">${LET[i]}</span><div><b>${e.t}</b><span class="meta">${e.d}</span></div></li>`).join('');
  return `<section class="orb w glass-read">
    <div class="orb-head"><h2>Parcursul meu profesional</h2><p class="lead" style="max-width:52ch">Rolurile care mi-au format modul de a lucra cu oamenii și cu învățarea.</p></div>
    ${orbitHtml()}
    <ol class="stations" aria-label="Rolurile, de la 2007 până azi">${li}</ol>
    <div class="edu-b"><h2>Formare</h2><p class="hint">Orbita din interior: ce stă la baza drumului.</p><ul class="stations eduL">${el}</ul></div>
  </section>`;
}
export function orbitCss() {
  const r = roles.map((_, i) => `.orb:has(.s${i + 1}:hover) .a${i + 1}{opacity:1;stroke-width:13}.orb:has(.s${i + 1}:hover) .r${i + 1}{transform:translate(-50%,-50%) scale(1.18);background:var(--text);color:#fff}`).join('\n');
  const e = edu.map((_, i) => `.orb:has(.t${i + 1}:hover) .e${i + 1}{transform:translate(-50%,-50%) scale(1.18);background:var(--text);color:#fff}`).join('\n');
  return `.orb:has(li:hover) .arc{opacity:.3}\n${r}\n${e}`;
}
