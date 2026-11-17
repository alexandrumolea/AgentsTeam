// 2. Materialul trainerului: UN fișier HTML care merge fără internet (fonturi de sistem, CSS, script și imagini incluse).
// Vederile: Ziua, Modulul, Schița (direcția 1), Banca (exercițiile cursului) și Prezintă (ecranul de comandă + fereastra sălii).
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { creeazaRandare, escapeHtml as e, normal } from './randare.mjs';
import { imaginiDin, ora, desfasoara, FORMATE, ENERGII } from './sursa.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const LUME = { teorie: 'intunecat', exercitiu: 'luminos', reflectie: 'luminos', pauza: 'luminos', mesaj: 'accent' };
const TIP = { teorie: 'teorie', exercitiu: 'exercițiu', reflectie: 'reflecție', mesaj: 'mesaj', pauza: 'pauză' };
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

export function caleTema(brand) {
  const t = join(AICI, '..', 'tema', `${brand}.css`);
  return existsSync(t) ? t : join(AICI, '..', 'tema', 'sobru.css');
}

const LUME_EX = { exercitiu: 'luminos', reflectie: 'luminos', energizant: 'accent' };
const TIP_EX = { exercitiu: 'exercițiu', reflectie: 'reflecție', energizant: 'energizant' };
const ENERGIE = { calm: 'energie calmă', mediu: 'energie medie', activ: 'energie activă' };
const lumeDe = (r, s) => (s && s.exercitiu ? LUME_EX[s.exercitiu.tip] : LUME[r.fel === 'pauza' ? 'pauza' : r.modul.tip]) ?? 'luminos';
const despreEx = (x) => `${x.durata} min · ${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}`;

/** Ecranele din sală, din agenda ediției: titlul fiecărui modul (făcut singur), apoi câte unul pe bloc :::sala / :::sala-si-curs,
 *  cu exercițiile alese puse în locul lor. O pauză din agendă e un ecran cu cronometru. */
export function construiesteEcrane(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const randeazaNota = creeazaRandare({ atribut: 'data-img' });
  const ecrane = [];
  let nr = 0;
  c.agenda.forEach((r, ri) => {
    if (r.fel === 'pauza' || r.modul.tip === 'pauza') {
      const titlu = r.fel === 'pauza' ? r.titlu : r.modul.titlu;
      ecrane.push({ modul: ri, lume: 'luminos', html: `<h1>${e(titlu)}</h1><p class="ecran-sub">${r.durata} min</p>`, cronometru: r.durata, note: [], titlu: true });
      if (r.fel === 'pauza') return;
    } else {
      nr++;
      ecrane.push({ modul: ri, lume: lumeDe(r), html: `<p class="ecran-numar">${String(nr).padStart(2, '0')}</p><h1>${e(r.modul.titlu)}</h1>`, cronometru: 0, note: [], titlu: true });
    }
    for (const s of desfasoara(r)) {
      if (s.strat === 'sala' || s.strat === 'sala-si-curs') {
        ecrane.push({ modul: ri, lume: lumeDe(r, s), html: randeaza(s.md), cronometru: s.atribute.cronometru ?? 0, note: [] });
      } else if (s.strat === 'trainer') {
        ecrane.at(-1).note.push(randeazaNota(s.md)); // nota merge la ecranul de dinaintea ei
      } else if (s.strat === 'exercitiu-inceput') {
        ecrane.at(-1).note.push(`<p class="nota-exercitiu">Urmează exercițiul <b>${e(s.exercitiu.titlu)}</b> · ${despreEx(s.exercitiu)}</p>`);
      }
    }
  });
  return ecrane;
}

function harta(c) {
  const imagini = {};
  for (const f of [...c.module, ...c.exercitii.values()]) for (const s of f.segmente) for (const src of imaginiDin(s.md)) {
    if (imagini[src]) continue;
    const date = readFileSync(join(c.folder, src));
    imagini[src] = `data:${MIME[extname(src).toLowerCase()] ?? 'application/octet-stream'};base64,${date.toString('base64')}`;
  }
  return imagini;
}

const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
const oraR = (r) => (r.start == null ? '–' : `${ora(r.start)}–${ora(r.sfarsit)}`);
const titluR = (r) => (r.fel === 'pauza' ? r.titlu : r.modul.titlu);
const ecranStatic = (lume, html) => `<div class="cadru"><div class="ecran lume-${lume}"><div class="ecran-continut">${html}</div></div></div>`;

function vedereaZiua(c) {
  const randuri = c.agenda.map((r, i) => {
    if (r.fel === 'pauza') return `<tr data-modul="${i}" class="pauza"><td class="ora">${oraR(r)}</td><td>${e(r.titlu)}</td><td><span class="tip">pauză</span></td><td>${r.durata} min</td><td></td><td></td></tr>`;
    const m = r.modul;
    const ex = r.exercitii.map((x) => `<tr class="exercitiu-rand" data-modul="${i}"><td></td><td>↳ ${e(x.titlu)}</td><td><span class="tip">${TIP_EX[x.tip] ?? e(x.tip)}</span></td><td>${x.durata} min</td><td class="sters">${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}</td><td>${x.materiale.map(e).join('<br>')}</td></tr>`).join('');
    return `<tr data-modul="${i}"><td class="ora">${oraR(r)}</td><td><b>${e(m.titlu)}</b>${r.exercitii.length ? ` <span class="sters">(${m.durata} min + exerciții)</span>` : ''}</td>
  <td><span class="tip">${TIP[m.tip] ?? e(m.tip)}</span></td><td>${r.durata} min</td><td>${e(m.ancora)}</td>
  <td>${m.materiale.map(e).join('<br>') || '<span class="sters">–</span>'}</td></tr>${ex}`;
  }).join('\n');
  const nota = c.editie.nota_trainer ? `<p class="nota-editie"><span class="eticheta">Despre acest grup</span><br>${e(c.editie.nota_trainer)}</p>` : '';
  const afara = c.module.filter((m) => !m.inAgenda);
  return `<h2>Ziua</h2>${nota}
<table class="ziua"><thead><tr><th>Ora</th><th>Modulul</th><th>Tip</th><th>Durata</th><th>Ancora</th><th>Materiale</th></tr></thead><tbody>
${randuri}</tbody></table>
${afara.length ? `<p class="sters">Nu sunt în agenda acestei ediții: ${afara.map((m) => e(m.titlu)).join(', ')}.</p>` : ''}`;
}

export function listaSchita(c) {
  return `<ol class="schita">${c.agenda.map((r, i) => {
    if (r.fel === 'pauza' || r.modul.tip === 'pauza') return `<li data-modul="${i}" class="pauza"><span class="ora">${ora(r.start)}</span><div class="ancora">${e(r.fel === 'pauza' ? r.titlu : r.modul.ancora)}</div><div class="titlu-mic">${e(titluR(r))} · ${r.durata} min</div></li>`;
    return `<li data-modul="${i}"><span class="ora">${ora(r.start)}</span>
  <div class="ancora">${e(r.modul.ancora)}</div><div class="titlu-mic">${e(r.modul.titlu)} · ${r.durata} min</div>
  <ul>${r.modul.schita.map((p) => `<li>${e(p)}</li>`).join('')}</ul>${r.exercitii.length ? `<div class="titlu-mic">Exercițiu: ${r.exercitii.map((x) => e(x.titlu)).join(', ')}</div>` : ''}</li>`;
  }).join('\n')}</ol>`;
}

/** Un segment, cum apare în vederile Modul și Banca. */
function piesa(s, lume, randeaza) {
  if (s.strat === 'text') return `<div class="strat strat-text">${randeaza(s.md)}</div>`;
  if (s.strat === 'trainer') return `<div class="strat strat-trainer"><span class="eticheta">Trainer</span>${randeaza(s.md)}</div>`;
  if (s.strat === 'participant') return `<div class="strat strat-participant"><span class="eticheta">Doar în cursul online</span>${randeaza(s.md)}</div>`;
  if (s.strat === 'exercitii') return `<p class="strat sters">Aici intră exercițiile alese în agendă.</p>`;
  if (s.strat === 'exercitiu-inceput') { const x = s.exercitiu; return `<div class="exercitiu-incadrat"><p class="eticheta">Exercițiu · ${e(x.titlu)} · ${despreEx(x)}${x.in_curs ? '' : ' · nu apare în cursul online'}</p><p>${e(x.obiectiv)}</p>`; }
  if (s.strat === 'exercitiu-sfarsit') return '</div>';
  const randeazaEcran = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const eticheta = s.strat === 'sala' ? 'Ecran în sală' : 'Ecran în sală și în curs';
  const cron = s.atribute.cronometru ? ` · cronometru ${s.atribute.cronometru} min` : '';
  return `<div class="strat strat-ecran"><span class="eticheta">${eticheta}${cron}</span>${ecranStatic(lume, randeazaEcran(s.md))}</div>`;
}

function alternativeHtml(c, m, alese) {
  const alt = [...m.implicite, ...m.alternative].filter((id) => !alese.some((x) => x.id === id)).map((id) => c.exercitii.get(id)).filter(Boolean);
  return alt.length ? `<p class="sters">Poți alege și: ${alt.map((x) => `<a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a> (${despreEx(x)})`).join('; ')}</p>` : '';
}

function vedereaModul(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img' });
  const articol = (m, r) => {
    const piese = r ? desfasoara(r) : m.segmente;
    const continut = piese.map((s) => piesa(s, r ? lumeDe(r, s) : (LUME[m.tip] ?? 'luminos'), randeaza)).join('\n');
    const durata = r ? `${r.durata} min` : `${m.durata} min fără exerciții`;
    return `<article class="modul ${r ? '' : 'sarit'}" id="modul-${e(m.id)}">
<header><span class="eticheta">${r ? oraR(r) + ' · ' : ''}${TIP[m.tip] ?? e(m.tip)} · ${durata}${r ? '' : ' · nu e în agenda acestei ediții'}</span>
<h3>${e(m.titlu)}</h3>${m.materiale.length ? `<p class="sters">Materiale: ${m.materiale.map(e).join(', ')}</p>` : ''}${alternativeHtml(c, m, r ? r.exercitii : [])}</header>
${continut}</article>`;
  };
  const dinAgenda = c.agenda.filter((r) => r.fel === 'modul').map((r) => articol(r.modul, r)).join('\n');
  const afara = c.module.filter((m) => !m.inAgenda).map((m) => articol(m, null)).join('\n');
  return `<h2>Modulele</h2>${dinAgenda}${afara ? `<h2 class="sub">Nu sunt în agenda acestei ediții</h2>${afara}` : ''}`;
}

/** Banca de exerciții (v2, Ioana 2026-11-17): o listă compactă de rânduri care se deschid la cerere (<details>),
 *  cu căutare și filtre ca butoane-chip. Sus stau exercițiile din agenda de azi, dedesubt restul, de la cele scurte la cele lungi.
 *  Filtrele lucrează în prezinta.js (filtreaza), pe atributele data-* de pe fiecare rând. */
function vedereaBanca(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img' });
  const toate = [...c.exercitii.values()];
  if (!toate.length) return '<h2>Banca de exerciții</h2><p class="sters">Cursul nu are încă exerciții în exercitii/.</p>';
  // Unde e folosit azi: rândul din agendă (pentru oră și titlul modulului), în ordinea agendei.
  const azi = new Map();
  c.agenda.forEach((r) => { if (r.fel === 'modul') r.exercitii.forEach((x) => { if (!azi.has(x.id)) azi.set(x.id, r); }); });
  // La ce module se potrivește: câmpul „module” din exercițiu + implicite/alternative din module. Gol = oriunde.
  const rolLa = (x, m) => (m.implicite.includes(x.id) ? 'implicit' : m.alternative.includes(x.id) ? 'alternativă' : x.module.includes(m.id) ? 'se potrivește' : null);
  const moduleDe = (x) => c.module.filter((m) => rolLa(x, m));
  const ordine = new Map(c.agenda.filter((r) => r.fel === 'modul').map((r, i) => [r.modul.id, i]));
  const moduleChip = c.module.filter((m) => toate.some((x) => rolLa(x, m)))
    .sort((a, b) => (ordine.get(a.id) ?? 99) - (ordine.get(b.id) ?? 99));
  const N_ENERGIE = { calm: 1, mediu: 2, activ: 3 };

  const rand = (x) => {
    const r = azi.get(x.id), mod = moduleDe(x);
    const cauta = normal([x.titlu, x.obiectiv, x.format, TIP_EX[x.tip] ?? x.tip, x.energie, ...x.materiale, ...mod.map((m) => m.titlu), ...x.segmente.map((s) => s.md)].join(' '));
    const energie = `<span class="energie" data-n="${N_ENERGIE[x.energie] ?? 0}" title="${ENERGIE[x.energie] ?? e(x.energie)}"><i></i><i></i><i></i> ${e(x.energie)}</span>`;
    const badgeAzi = r ? `<span class="azi">Azi · ${r.start == null ? '' : ora(r.start) + ' · '}${e(r.modul.titlu)}</span>` : '';
    const unde = mod.length
      ? `<ul class="unde">${mod.map((m) => `<li>${e(m.titlu)} <span class="sters">· ${rolLa(x, m)}${azi.get(x.id)?.modul === m ? ', ales azi' : ''}</span></li>`).join('')}</ul>`
      : '<p>Oriunde în zi.</p>';
    return `<details class="ex" id="ex-${e(x.id)}" data-format="${e(x.format)}" data-energie="${e(x.energie)}" data-durata="${x.durata}" data-folosit="${r ? 1 : 0}" data-module="${mod.map((m) => e(m.id)).join(' ')}" data-cauta="${e(cauta)}">
<summary><span class="ex-rand"><span class="ex-durata"><b>${x.durata}</b> min</span>
<span class="ex-cap"><span class="ex-titlu">${e(x.titlu)}</span><span class="ex-obiectiv">${e(x.obiectiv)}</span>${badgeAzi}</span>
<span class="ex-meta"><span class="ex-format">${e(x.format)}</span>${energie}${x.tip !== 'exercitiu' ? `<span class="ex-tip">${TIP_EX[x.tip] ?? e(x.tip)}</span>` : ''}</span><span class="ex-semn" aria-hidden="true"></span></span></summary>
<div class="ex-detalii">
<p class="ex-obiectiv-tot">${e(x.obiectiv)}</p>
<div class="ex-fise">
<div><p class="eticheta">Se potrivește la</p>${unde}</div>
<div><p class="eticheta">Materiale</p><p>${x.materiale.length ? x.materiale.map(e).join(', ') : '<span class="sters">nimic special</span>'}</p></div>
<div><p class="eticheta">Detalii</p><p>${TIP_EX[x.tip] ?? e(x.tip)} · ${despreEx(x)}${x.in_curs ? '' : '<br><b>Nu apare în cursul online</b>'}</p></div>
</div>
${x.segmente.map((s) => piesa(s, LUME_EX[x.tip] ?? 'luminos', randeaza)).join('\n')}
</div></details>`;
  };
  const deAzi = toate.filter((x) => azi.has(x.id)).sort((a, b) => c.agenda.indexOf(azi.get(a.id)) - c.agenda.indexOf(azi.get(b.id)));
  const rest = toate.filter((x) => !azi.has(x.id)).sort((a, b) => a.durata - b.durata || a.titlu.localeCompare(b.titlu, 'ro'));
  const grup = (titlu, lista) => (lista.length ? `<div class="banca-grup"><h3 class="eticheta">${titlu} <span class="banca-grup-nr">${lista.length}</span></h3>${lista.map(rand).join('\n')}</div>` : '');
  const chip = (filtru, valoare, eticheta, extra = '') => `<button type="button" class="chip" data-filtru="${filtru}" data-valoare="${e(valoare)}" aria-pressed="false"${extra}>${eticheta}</button>`;
  const rand_filtre = (eticheta, chipuri) => `<div class="filtre-rand" role="group" aria-label="${eticheta}"><span class="filtre-eticheta">${eticheta}</span><div class="chipuri">${chipuri}</div></div>`;

  return `<div class="banca-cap"><h2>Banca de exerciții</h2><p class="sters banca-numar" id="banca-numar" role="status"></p></div>
<div class="banca-filtre">
<div class="cautare"><input type="search" id="banca-cauta" placeholder="Caută: titlu, obiectiv, materiale…" aria-label="Caută în bancă" autocomplete="off" enterkeyhint="search"><kbd aria-hidden="true">/</kbd></div>
${rand_filtre('Format', FORMATE.map((v) => chip('format', v, e(v))).join(''))}
${rand_filtre('Energie', ENERGII.map((v) => chip('energie', v, `<span class="energie" data-n="${N_ENERGIE[v]}"><i></i><i></i><i></i></span> ${e(v)}`)).join(''))}
${rand_filtre('Durata', [10, 15, 20, 30].map((v) => chip('durata', v, `≤ ${v} min`)).join(''))}
${moduleChip.length ? rand_filtre('Modulul', moduleChip.map((m) => chip('modul', m.id, e(m.titlu), ` title="${e(m.titlu)}"`)).join('')) : ''}
<button type="button" class="sterge-filtre" id="banca-sterge" hidden>Șterge filtrele</button>
</div>
<div class="banca-lista">
${grup('Azi în agendă', deAzi)}
${grup(deAzi.length ? 'Restul băncii' : 'Toate exercițiile', rest)}
<p class="banca-gol" id="banca-gol" hidden>Niciun exercițiu nu se potrivește. <button type="button" id="banca-gol-sterge">Șterge filtrele</button></p>
</div>
<p class="sters banca-nota">Ca să schimbi un exercițiu în agendă: editează „agenda” din ediție și rulează din nou build-ul. Orele se recalculează singure.</p>`;
}

export function construiesteTrainer(c) {
  const ecrane = construiesteEcrane(c);
  const css = readFileSync(caleTema(c.curs.brand), 'utf8') + '\n' + readFileSync(join(AICI, 'stil.css'), 'utf8');
  const script = readFileSync(join(AICI, 'prezinta.js'), 'utf8');
  const modul = vedereaModul(c);
  const date = {
    curs: { titlu: c.curs.titlu, slug: c.curs.slug, brand: c.curs.brand, limba: c.curs.limba },
    editie: { data: c.editie.data, start: c.editie.start },
    // „module” = rândurile din agenda ediției (module și pauze), în ordine, cu orele calculate.
    module: c.agenda.map((r) => ({
      id: r.fel === 'modul' ? r.modul.id : null, titlu: titluR(r), tip: r.fel === 'pauza' ? 'pauza' : r.modul.tip, durata: r.durata, start: r.start, sfarsit: r.sfarsit,
      alternative: r.fel === 'modul' ? alternativeHtml(c, r.modul, r.exercitii) : '',
    })),
    ecrane,
  };
  const titlu = `${c.curs.titlu} · materialul trainerului${c.editie.data ? ' · ' + c.editie.data : ''}`;
  return `<!doctype html>
<html lang="${e(c.curs.limba)}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>${e(titlu)}</title>
<style id="css">${css}</style>
</head>
<body>
<header class="bara">
  <h1>${e(c.curs.titlu)} <span class="sters">${c.editie.data ? e(c.editie.data) : ''}</span></h1>
  <nav aria-label="Vederi">
    <button data-vedere="ziua">Ziua</button>
    <button data-vedere="modul">Modulul</button>
    <button data-vedere="schita">Schița</button>
    <button data-vedere="banca">Banca</button>
    <button data-vedere="prezinta" class="principal">Prezintă</button>
  </nav>
</header>
<main>
<section id="ziua">${vedereaZiua(c)}</section>
<section id="schita" hidden><h2>Schița zilei</h2>${listaSchita(c)}</section>
<section id="modul" hidden>${modul}</section>
<section id="banca" hidden>${vedereaBanca(c)}</section>
<section id="prezinta" hidden>
  <div class="comanda-start" id="comanda-start">
    <h2>Prezintă</h2>
    <ol>
      <li>Conectează proiectorul ca <b>ecran extins</b> (nu oglindit).</li>
      <li>Apasă <b>Deschide ecranul din sală</b>. Se deschide o fereastră nouă.</li>
      <li>Trage fereastra pe proiector și apasă <kbd>F</kbd> (tot ecranul).</li>
    </ol>
    <p><button class="principal" id="deschide-sala">Deschide ecranul din sală</button>
       <button id="prezinta-aici">Prezintă aici (un singur ecran)</button></p>
    <p class="mesaj" id="mesaj-start" role="status"></p>
    <p class="taste">Taste: <kbd>→</kbd> <kbd>PageDown</kbd> <kbd>Spațiu</kbd> înainte · <kbd>←</kbd> <kbd>PageUp</kbd> înapoi · <kbd>C</kbd> cronometru · <kbd>N</kbd> ecran negru · <kbd>S</kbd> schița · <kbd>F</kbd> tot ecranul (în fereastra sălii)</p>
  </div>
  <div class="comanda" id="comanda" hidden>
    <div>
      <p class="eticheta">Acum · <span id="pozitie"></span> · <span id="modul-acum"></span></p>
      <div class="cadru" id="cadru-acum"></div>
      <div class="butoane">
        <button id="inapoi">← Înapoi</button><button id="inainte" class="principal">Înainte →</button>
        <button id="btn-cron">Cronometru (C)</button><button id="btn-negru">Negru (N)</button><button id="btn-schita">Schița (S)</button>
        <button id="btn-sala">Ecranul din sală</button><button id="btn-reset" class="ascuns-la-tipar">Repornește ziua</button>
      </div>
      <p class="mesaj" id="mesaj" role="status"></p>
      <p class="eticheta">Nota trainerului</p>
      <div class="note" id="note"></div>
      <div id="alternative"></div>
    </div>
    <div>
      <div class="stare">
        <div><span class="eticheta">Ora</span><b id="ceas">–</b></div>
        <div><span class="eticheta">Rămas din modul</span><b id="ramas">–</b></div>
        <div><span class="eticheta">Față de plan</span><b id="abatere">–</b></div>
        <div><span class="eticheta">Cronometru</span><b id="cron">–</b></div>
      </div>
      <div class="urmeaza"><p class="eticheta">Urmează</p><div class="cadru" id="cadru-urmeaza"></div></div>
      <div class="schita-mica" id="schita-mica"><button type="button" class="inchide-schita" id="inchide-schita">Închide schița (S / Esc)</button><p class="eticheta">Schița zilei</p>${listaSchita(c)}</div>
    </div>
  </div>
</section>
</main>
<div id="aici" hidden></div>
<div id="tipar-ecrane-lista"></div>
<script type="application/json" id="date-curs">${json(date)}</script>
<script type="application/json" id="imagini">${json(harta(c))}</script>
<script>${script}</script>
</body>
</html>
`;
}
