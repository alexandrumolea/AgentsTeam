// Orbita din primul card al paginii Despre: lentila cu poza în centru, rolurile ca puncte pe un inel,
// lumina care trece de la primul an până azi. Mostra: team/ioana/documente/despre-compozitie-v2.html (varianta A,
// „Orbita în jurul lentilei”), aprobată de Alex pe 2026-11-18. Datele vin din content/despre.md (parcurs, formare).
//
// Geometria se calculează aici, la build: un unghi pe an, din primul an până la finalul anului curent.
// CSS-ul generat (la finalul site.css) dă fiecărui punct unghiul (--o), culoarea de pe inel (--c), momentul în care
// îl atinge lumina (--d) și o mică deplasare a etichetei (--dy), ca etichetele apropiate să nu se suprapună.
// Pagina pune punctele cu sin() / cos() în site/src/site.css. JavaScript (site/src/despre.js) doar arată rolul jos.

const A0 = 220, SPAN = 280;                 // unghiul primului an (ceas: 0 = sus) și deschiderea inelului; golul de jos ține „19 ani de învățare”
const R = { tel: 108, mare: 196 };          // raza inelului pe telefon și de la 761 px în sus (la fel în site.css)
const LINIE = 22, SPATIU = 3;               // înălțimea unei etichete și spațiul minim dintre două etichete
const TRECERE = 6.96;                       // câte secunde îi ia luminii să ajungă la „azi” (58 % din tura de 12 s)
// culorile inelului, de la primul an la azi (rolurile din content/tema.yml): ca în conic-gradient-ul din site.css
const OPRIRI = [[0, 'cer'], [0.4, 'lavanda'], [0.75, 'piersica'], [1, 'portocaliu']];

const f = n => +n.toFixed(2);
const rad = a => a * Math.PI / 180;

// Validează și normalizează datele. Orice greșeală aruncă o eroare cu mesaj clar (build-ul se oprește).
export function citesteParcurs(data, now = Date.now()){
  const F = 'content/despre.md';
  const p = data.parcurs || {}, fm = data.formare || {};
  const an = new Date(now).getUTCFullYear();
  const start = Date.UTC(an, 0, 1), urm = Date.UTC(an + 1, 0, 1);
  const AZI = an + (now - start) / (urm - start);
  const prezent = v => String(v ?? '').trim().toLowerCase() === 'prezent';
  const gol = v => v === undefined || v === null || v === '';
  const anValid = (v, unde) => {
    if (!Number.isInteger(v) || v < 1950 || v > an) throw new Error(`${F}: ${unde} trebuie să fie un an între 1950 și ${an} (acum e „${v}”).`);
    return v;
  };
  const roluri = (Array.isArray(p.roluri) ? p.roluri : []).map((r, i) => {
    const unde = `parcurs.roluri[${i + 1}]`;
    if (!r || !String(r.rol || '').trim()) throw new Error(`${F}: ${unde} are nevoie de „rol”.`);
    if (gol(r.de_la)) throw new Error(`${F}: ${unde} („${r.rol}”) are nevoie de „de_la”, anul în care a început: din el se pune punctul pe orbită.`);
    const deLa = anValid(r.de_la, `${unde}.de_la`);
    const acum = prezent(r.pana_la);
    const panaLa = acum ? null : gol(r.pana_la) ? deLa : anValid(r.pana_la, `${unde}.pana_la`);
    if (panaLa !== null && panaLa < deLa) throw new Error(`${F}: ${unde} („${r.rol}”) se termină înainte să înceapă.`);
    const ani = acum ? `${deLa} – prezent` : panaLa === deLa ? String(deLa) : `${deLa} – ${panaLa}`;
    const organizatie = String(r.organizatie || '').trim(), rol = String(r.rol).trim();
    return { rol, organizatie, descriere: String(r.descriere || '').trim(), scurt: String(r.scurt || organizatie || rol).trim(),
      de_la: deLa, pana_la: acum ? 'prezent' : panaLa, ani, acum, ordine: i };
  });
  if (!roluri.length) throw new Error(`${F}: parcurs.roluri are nevoie de cel puțin un rol.`);
  // în listă: cel mai nou primul; în același an, în ordinea din fișier
  roluri.sort((x, y) => y.de_la - x.de_la || x.ordine - y.ordine);
  const formare = (Array.isArray(fm.lista) ? fm.lista : []).map((e, i) => {
    if (!e || !String(e.titlu || '').trim()) throw new Error(`${F}: formare.lista[${i + 1}] are nevoie de „titlu”.`);
    return { titlu: String(e.titlu).trim(), unde: String(e.unde || '').trim() };
  });
  const Y0 = Math.min(...roluri.map(r => r.de_la));
  return {
    titlu: String(p.titlu || 'Parcursul meu profesional'), intro: String(p.intro || ''), eticheta_ani: String(p.eticheta_ani || 'ani de învățare'),
    formareTitlu: String(fm.titlu || 'Formare'), roluri, formare, Y0, AZI, an
  };
}

// „19 ani”, dar „20 de ani” (în română, de la 20 în sus apare „de”, cu excepția lui 1–19 din fiecare sută)
const deAni = n => { const r = n % 100; return n !== 0 && (r === 0 || r >= 20) ? 'de ' : ''; };

// Etichetele de pe aceeași parte a cercului, așezate pe verticală: le depărtăm cât e nevoie, cât mai puțin.
function departeaza(et){
  const s = [...et].sort((a, b) => a.y - b.y);
  s.forEach(e => { e.dy = 0; });
  for (let k = 0; k < 200; k++){
    let mutat = false;
    for (let i = 0; i < s.length - 1; i++){
      const a = s[i], b = s[i + 1], min = (a.h + b.h) / 2 + SPATIU, d = (b.y + b.dy) - (a.y + a.dy);
      if (d < min - 0.01){ const m = (min - d) / 2; a.dy -= m; b.dy += m; mutat = true; }
    }
    if (!mutat) break;
  }
}

export function orbita(P, esc, lentila){
  const { roluri, formare, Y0, AZI, an } = P;
  const DEG = SPAN / (an + 1 - Y0);            // un unghi pe an: inelul se termină la finalul anului curent
  const aziO = (AZI - Y0) * DEG;
  const culoare = o => {
    const t = Math.min(1, Math.max(0, o / aziO));
    const k = OPRIRI.findIndex(([x]) => x >= t), [t1, c1] = OPRIRI[Math.max(0, k - 1)], [t2, c2] = OPRIRI[Math.max(0, k)];
    const w = t2 === t1 ? 1 : (t - t1) / (t2 - t1);
    return w <= 0.005 ? `var(--${c1})` : w >= 0.995 ? `var(--${c2})` : `color-mix(in srgb,var(--${c1}),var(--${c2}) ${Math.round(w * 100)}%)`;
  };

  // un punct pe an: rolurile începute în același an îl împart (inel dublu, eticheta le numește pe toate)
  const ani = [...new Set(roluri.map(r => r.de_la))].sort((a, b) => a - b);
  const puncte = ani.map((y, i) => {
    const rs = roluri.filter(r => r.de_la === y).sort((a, b) => a.ordine - b.ordine), o = (y - Y0) * DEG, a = A0 + o;
    return { cls: `p${i + 1}`, y, rs, o, parte: Math.sin(rad(a)) < 0 ? 'l' : 'r', now: rs.some(r => r.acum) };
  });
  const azi = { cls: 'p-azi', o: aziO, parte: Math.sin(rad(A0 + aziO)) < 0 ? 'l' : 'r', rs: [] };
  const toate = [...puncte, azi];

  // deplasarea etichetelor, separat pentru telefon (doar anul) și pentru ecranele mari (anul și numele, pe rânduri)
  const dy = {};
  for (const [k, raza] of Object.entries(R)){
    for (const parte of ['l', 'r']){
      const et = toate.filter(p => p.parte === parte).map(p => ({ p, y: -raza * Math.cos(rad(A0 + p.o)), h: LINIE * (k === 'mare' ? Math.max(1, p.rs.length) : 1) }));
      departeaza(et);
      et.forEach(e => { (dy[e.p.cls] ||= {})[k] = f(e.dy); });
    }
  }

  const btn = p => {
    const yrs = [...new Set(p.rs.map(r => r.ani))].join(' · ');
    const role = p.rs.map(r => [r.rol, r.organizatie].filter(Boolean).join(', ')).join(' · ');
    const nume = p.rs.map(r => esc(r.scurt)).join('<br>');
    const aria = `${p.y}: ${p.rs.map(r => r.scurt).join(' și ')}`;
    return `<button type="button" class="pt ${p.parte} ${p.cls}${p.now ? ' now' : ''}${p.rs.length > 1 ? ' two' : ''}" data-yrs="${esc(yrs)}" data-role="${esc(role)}" aria-label="${esc(aria)}" aria-pressed="false"><i></i><span class="lb" aria-hidden="true"><b>${p.y}</b><span class="n">${nume}</span></span></button>`;
  };
  const nAni = an - Y0;
  const figure = `<figure class="orbit" aria-label="${esc(`Parcursul pe scurt: ${roluri.length} roluri, din ${Y0} până azi`)}">
  ${lentila}
  <div class="core">
    <div class="track" aria-hidden="true"></div><div class="ring" aria-hidden="true"></div><div class="comet" aria-hidden="true"></div>
    ${puncte.map(btn).join('\n    ')}
    <span class="pt ${azi.parte} end p-azi" aria-hidden="true"><span class="lb"><b>azi</b></span></span>
  </div>
  <p class="badge" aria-live="polite"><span class="def"><b>${nAni}</b> ${esc(deAni(nAni) + P.eticheta_ani)}</span><span class="role"></span></p>
</figure>`;

  // parcursul ca listă, cel mai nou primul; punctul are culoarea de pe orbită
  const cls = new Map(puncte.map(p => [p.y, p.cls]));
  const lista = `<ol class="roles">${roluri.map(r => `<li class="${cls.get(r.de_la)}${r.acum ? ' now' : ''}"><span class="yrs">${esc(r.ani)}${r.acum ? '<em>acum</em>' : ''}</span><b>${esc(r.rol)}</b>${r.organizatie ? `<span class="org">${esc(r.organizatie)}</span>` : ''}${r.descriere ? `<p>${esc(r.descriere)}</p>` : ''}</li>`).join('')}</ol>`;
  const edu = formare.length ? `<div class="edu"><h3 class="cap">${esc(P.formareTitlu)}</h3><ul>${formare.map(e => `<li><b>${esc(e.titlu)}</b>${e.unde ? `<span>${esc(e.unde)}</span>` : ''}</li>`).join('')}</ul></div>` : '';
  const parcurs = `<section class="path w glass-read" id="parcurs" aria-labelledby="parcursH">
  <header><h2 id="parcursH">${esc(P.titlu)}</h2>${P.intro ? `<p>${esc(P.intro)}</p>` : ''}</header>
  ${lista}
  ${edu}
</section>`;

  const css = [
    `.despre .orbit{--A0:${A0}deg;--azi:${f(aziO)}deg}`,
    `@keyframes despre-trece{0%{transform:rotate(${A0}deg);opacity:0}4%{opacity:1}58%{transform:rotate(${f(A0 + aziO)}deg);opacity:1}66%,100%{transform:rotate(${f(A0 + aziO)}deg);opacity:0}}`,
    ...toate.map(p => `.despre .pt.${p.cls}{--o:${f(p.o)}deg;--dy:${dy[p.cls].tel}px${p.rs.length ? `;--n:${p.rs.length};--c:${culoare(p.o)};--d:${f(p.o / aziO * TRECERE)}s` : ''}}`),
    ...puncte.map(p => `.despre .roles .${p.cls}{--c:${culoare(p.o)}}`), // lista: același punct colorat ca pe orbită
    `@media (min-width:761px){${toate.map(p => `.despre .pt.${p.cls}{--dy:${dy[p.cls].mare}px}`).join('')}}`
  ];
  return { figure, parcurs, css: `/* Orbita din primul card al paginii Despre: unghiuri, culori și etichete, generate de site/orbita.mjs din content/despre.md */\n${css.join('\n')}\n` };
}
