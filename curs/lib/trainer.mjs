// 2. Materialul trainerului: UN fișier HTML care merge fără internet (fonturi de sistem, CSS, script și imagini incluse).
// Vederile: Ziua, Modulul, Schița (direcția 1) și Prezintă (ecranul de comandă + fereastra sălii).
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { creeazaRandare, escapeHtml as e } from './randare.mjs';
import { imaginiDin, ora } from './sursa.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const LUME = { teorie: 'intunecat', exercitiu: 'luminos', reflectie: 'luminos', pauza: 'luminos', mesaj: 'accent' };
const TIP = { teorie: 'teorie', exercitiu: 'exercițiu', reflectie: 'reflecție', mesaj: 'mesaj', pauza: 'pauză' };
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

export function caleTema(brand) {
  const t = join(AICI, '..', 'tema', `${brand}.css`);
  return existsSync(t) ? t : join(AICI, '..', 'tema', 'sobru.css');
}

/** Ecranele din sală, în ordine: titlul fiecărui modul (făcut singur) + câte unul pe bloc :::sala / :::sala-si-curs. */
export function construiesteEcrane(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const randeazaNota = creeazaRandare({ atribut: 'data-img' });
  const ecrane = [];
  let nr = 0;
  c.module.forEach((m, mi) => {
    if (m.sarit) return;
    nr++;
    const lume = LUME[m.tip] ?? 'luminos';
    const titlu = m.tip === 'pauza'
      ? `<h1>${e(m.titlu)}</h1><p class="ecran-sub">${m.durata} min</p>`
      : `<p class="ecran-numar">${String(nr).padStart(2, '0')}</p><h1>${e(m.titlu)}</h1>`;
    ecrane.push({ modul: mi, lume, html: titlu, cronometru: m.tip === 'pauza' ? m.durata : 0, note: [], titlu: true });
    for (const s of m.segmente) {
      if (s.strat === 'sala' || s.strat === 'sala-si-curs') {
        ecrane.push({ modul: mi, lume, html: randeaza(s.md), cronometru: s.atribute.cronometru ?? 0, note: [] });
      } else if (s.strat === 'trainer') {
        ecrane.at(-1).note.push(randeazaNota(s.md)); // nota merge la ecranul de dinaintea ei
      }
    }
  });
  return ecrane;
}

function harta(c) {
  const imagini = {};
  for (const m of c.module) for (const s of m.segmente) for (const src of imaginiDin(s.md)) {
    if (imagini[src]) continue;
    const date = readFileSync(join(c.folder, src));
    imagini[src] = `data:${MIME[extname(src).toLowerCase()] ?? 'application/octet-stream'};base64,${date.toString('base64')}`;
  }
  return imagini;
}

const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
const oraM = (m) => (m.sarit || m.start == null ? '–' : `${ora(m.start)}–${ora(m.sfarsit)}`);

function vedereaZiua(c) {
  const randuri = c.module.map((m, i) => `<tr data-modul="${i}" class="${m.sarit ? 'sarit' : ''}">
  <td class="ora">${oraM(m)}</td><td><b>${e(m.titlu)}</b>${m.sarit ? ' <span class="sters">(sărit la această ediție)</span>' : ''}</td>
  <td><span class="tip">${TIP[m.tip] ?? e(m.tip)}</span></td><td>${m.durata} min</td><td>${e(m.ancora)}</td>
  <td>${m.materiale.map(e).join('<br>') || '<span class="sters">–</span>'}</td></tr>`).join('\n');
  const nota = c.editie.nota_trainer ? `<p class="nota-editie"><span class="eticheta">Despre acest grup</span><br>${e(c.editie.nota_trainer)}</p>` : '';
  return `<h2>Ziua</h2>${nota}
<table class="ziua"><thead><tr><th>Ora</th><th>Modulul</th><th>Tip</th><th>Durata</th><th>Ancora</th><th>Materiale</th></tr></thead><tbody>
${randuri}</tbody></table>`;
}

export function listaSchita(c) {
  return `<ol class="schita">${c.module.map((m, i) => `<li data-modul="${i}" class="${m.tip === 'pauza' ? 'pauza' : ''} ${m.sarit ? 'sarit' : ''}">
  <span class="ora">${m.sarit || m.start == null ? '–' : ora(m.start)}</span>
  <div class="ancora">${e(m.ancora)}</div><div class="titlu-mic">${e(m.titlu)} · ${m.durata} min</div>
  ${m.tip === 'pauza' ? '' : `<ul>${m.schita.map((p) => `<li>${e(p)}</li>`).join('')}</ul>`}</li>`).join('\n')}</ol>`;
}

function vedereaModul(c, ecrane) {
  const randeaza = creeazaRandare({ atribut: 'data-img' });
  let k = 0; // indexul ecranului din sală, în aceeași ordine ca în construiesteEcrane
  return `<h2>Modulele</h2>` + c.module.map((m) => {
    if (!m.sarit) k++; // ecranul de titlu al modulului
    const continut = m.segmente.map((s) => {
      if (s.strat === 'text') return `<div class="strat strat-text">${randeaza(s.md)}</div>`;
      if (s.strat === 'trainer') return `<div class="strat strat-trainer"><span class="eticheta">Trainer</span>${randeaza(s.md)}</div>`;
      if (s.strat === 'participant') return `<div class="strat strat-participant"><span class="eticheta">Doar în cursul online</span>${randeaza(s.md)}</div>`;
      const eticheta = s.strat === 'sala' ? 'Ecran în sală' : 'Ecran în sală și în curs';
      const cron = s.atribute.cronometru ? ` · cronometru ${s.atribute.cronometru} min` : '';
      const ecran = m.sarit ? randeaza(s.md) : `<div class="cadru" data-previzualizare="${k++}"></div>`;
      return `<div class="strat strat-ecran"><span class="eticheta">${eticheta}${cron}</span>${ecran}</div>`;
    }).join('\n');
    return `<article class="modul ${m.sarit ? 'sarit' : ''}" id="modul-${e(m.id)}">
<header><span class="eticheta">${oraM(m)} · ${TIP[m.tip] ?? e(m.tip)} · ${m.durata} min${m.sarit ? ' · sărit la această ediție' : ''}</span>
<h3>${e(m.titlu)}</h3>${m.materiale.length ? `<p class="sters">Materiale: ${m.materiale.map(e).join(', ')}</p>` : ''}</header>
${continut}</article>`;
  }).join('\n');
}

export function construiesteTrainer(c) {
  const ecrane = construiesteEcrane(c);
  const css = readFileSync(caleTema(c.curs.brand), 'utf8') + '\n' + readFileSync(join(AICI, 'stil.css'), 'utf8');
  const script = readFileSync(join(AICI, 'prezinta.js'), 'utf8');
  const modul = vedereaModul(c, ecrane);
  const date = {
    curs: { titlu: c.curs.titlu, slug: c.curs.slug, brand: c.curs.brand, limba: c.curs.limba },
    editie: { data: c.editie.data, start: c.editie.start },
    module: c.module.map((m) => ({ id: m.id, titlu: m.titlu, tip: m.tip, durata: m.durata, start: m.start ?? null, sfarsit: m.sfarsit ?? null, ancora: m.ancora, sarit: m.sarit })),
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
    <button data-vedere="prezinta" class="principal">Prezintă</button>
  </nav>
</header>
<main>
<section id="ziua">${vedereaZiua(c)}</section>
<section id="schita" hidden><h2>Schița zilei</h2>${listaSchita(c)}</section>
<section id="modul" hidden>${modul}</section>
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
    </div>
    <div>
      <div class="stare">
        <div><span class="eticheta">Ora</span><b id="ceas">–</b></div>
        <div><span class="eticheta">Rămas din modul</span><b id="ramas">–</b></div>
        <div><span class="eticheta">Față de plan</span><b id="abatere">–</b></div>
        <div><span class="eticheta">Cronometru</span><b id="cron">–</b></div>
      </div>
      <div class="urmeaza"><p class="eticheta">Urmează</p><div class="cadru" id="cadru-urmeaza"></div></div>
      <div class="schita-mica" id="schita-mica"><p class="eticheta">Schița zilei</p>${listaSchita(c)}</div>
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
