// 2. Materialul trainerului: UN fișier HTML care merge fără internet (fonturi de sistem, CSS, script și imagini incluse).
// Vederile: Ziua, Modulul, Schița (direcția 1), Biblioteca de piese și Prezintă (ecranul de comandă + fereastra sălii).
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { creeazaRandare, escapeHtml as e, normal } from './randare.mjs';
import { imaginiDin, ora, desfasoara, FORMATE, ENERGII, FAMILIE, FAMILII } from './sursa.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
// Lumea Ive a ecranelor: la module, după tip; la piese, după familie (1.9: conținut = întunecat, activitate = luminos, punte = accent).
const LUME = { teorie: 'intunecat', exercitiu: 'luminos', reflectie: 'luminos', pauza: 'luminos', mesaj: 'accent' };
const LUME_FAMILIE = { continut: 'intunecat', activitate: 'luminos', punte: 'accent' };
const TIP = {
  teorie: 'teorie', exercitiu: 'exercițiu', reflectie: 'reflecție', mesaj: 'mesaj', pauza: 'pauză',
  model: 'model', poveste: 'poveste', energizant: 'energizant', deschidere: 'deschidere', inchidere: 'închidere',
};
const NUME_FAMILIE = { continut: 'conținut', activitate: 'activitate', punte: 'punte' };
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

export function caleTema(brand) {
  const t = join(AICI, '..', 'tema', `${brand}.css`);
  return existsSync(t) ? t : join(AICI, '..', 'tema', 'sobru.css');
}

const ENERGIE = { calm: 'energie calmă', mediu: 'energie medie', activ: 'energie activă' };
const lumePiesa = (x) => (x.tip === 'pauza' ? 'luminos' : LUME_FAMILIE[x.familie] ?? 'luminos');
const lumeDe = (r, s) => (s && s.piesa ? lumePiesa(s.piesa) : r.fel === 'piesa' ? lumePiesa(r.piesa) : LUME[r.fel === 'pauza' ? 'pauza' : r.modul.tip]) ?? 'luminos';
/** „15 min · perechi · energie medie” la activități; „20 min · model” la restul. */
const despre = (x) => `${x.durata} min · ${x.familie === 'activitate' ? `${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}` : TIP[x.tip] ?? e(x.tip)}`;
/** „1 h 25 min” */
export const timp = (min) => { const a = Math.abs(min); return a >= 60 ? `${Math.floor(a / 60)} h${a % 60 ? ` ${a % 60} min` : ''}` : `${a} min`; };
const ePauza = (r) => r.fel === 'pauza' || (r.fel === 'piesa' && r.piesa.tip === 'pauza') || (r.fel === 'modul' && r.modul.tip === 'pauza');

/** Ecranele din sală, din agenda ediției: titlul fiecărui modul (făcut singur), apoi câte unul pe bloc :::sala / :::sala-si-curs,
 *  cu piesele alese puse în locul lor. O pauză (rând sau piesă) e un ecran cu cronometru. O piesă singură fără ecrane primește unul cu titlul ei. */
export function construiesteEcrane(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const randeazaNota = creeazaRandare({ atribut: 'data-img' });
  const ecrane = [];
  const pauza = (ri, titlu, durata) => ecrane.push({ modul: ri, lume: 'luminos', html: `<h1>${e(titlu)}</h1><p class="ecran-sub">${durata} min</p>`, cronometru: durata, note: [], titlu: true });
  let nr = 0;
  c.agenda.forEach((r, ri) => {
    if (r.fel === 'pauza') { pauza(ri, r.titlu, r.durata); return; }
    if (r.fel === 'modul') {
      if (r.modul.tip === 'pauza') pauza(ri, r.modul.titlu, r.durata);
      else { nr++; ecrane.push({ modul: ri, lume: lumeDe(r), html: `<p class="ecran-numar">${String(nr).padStart(2, '0')}</p><h1>${e(r.modul.titlu)}</h1>`, cronometru: 0, note: [], titlu: true }); }
    }
    const inainte = ecrane.length, noteInainte = [];
    for (const s of desfasoara(r)) {
      if (s.strat === 'sala' || s.strat === 'sala-si-curs') {
        ecrane.push({ modul: ri, lume: lumeDe(r, s), html: randeaza(s.md), cronometru: s.atribute.cronometru ?? 0, note: [] });
      } else if (s.strat === 'piesa-inceput' && s.piesa.tip === 'pauza') {
        pauza(ri, s.piesa.titlu, s.piesa.durata);
      } else if (s.strat === 'piesa-inceput' && r.fel === 'piesa' && !s.piesa.segmente.some((x) => x.strat === 'sala' || x.strat === 'sala-si-curs')) {
        ecrane.push({ modul: ri, lume: lumePiesa(s.piesa), html: `<h1>${e(s.piesa.titlu)}</h1>`, cronometru: 0, note: [], titlu: true });
      } else if (s.strat === 'trainer') {
        // Nota merge la ecranul de dinaintea ei; la o piesă singură, cea scrisă înaintea primului ecran merge pe primul ecran.
        if (r.fel === 'piesa' && ecrane.length === inainte) noteInainte.push(randeazaNota(s.md));
        else ecrane.at(-1).note.push(randeazaNota(s.md));
      } else if (s.strat === 'piesa-inceput' && r.fel === 'modul' && ecrane.length) {
        ecrane.at(-1).note.push(`<p class="nota-exercitiu">Urmează piesa <b>${e(s.piesa.titlu)}</b> · ${despre(s.piesa)}</p>`);
      }
    }
    // Notele de dinaintea primului ecran al unei piese singure merg pe primul ei ecran.
    if (noteInainte.length && ecrane.length > inainte) ecrane[inainte].note.unshift(...noteInainte);
  });
  return ecrane;
}

function harta(c) {
  const imagini = {};
  for (const f of [...c.module, ...c.piese.values()]) for (const s of f.segmente) for (const src of imaginiDin(s.md)) {
    if (imagini[src]) continue;
    const date = readFileSync(join(c.folder, src));
    imagini[src] = `data:${MIME[extname(src).toLowerCase()] ?? 'application/octet-stream'};base64,${date.toString('base64')}`;
  }
  return imagini;
}

const json = (x) => JSON.stringify(x).replace(/</g, '\\u003c');
const oraR = (r) => (r.start == null ? '–' : `${ora(r.start)}–${ora(r.sfarsit)}`);
const titluR = (r) => (r.fel === 'pauza' ? r.titlu : r.fel === 'piesa' ? r.piesa.titlu : r.modul.titlu);
const ecranStatic = (lume, html) => `<div class="cadru"><div class="ecran lume-${lume}"><div class="ecran-continut">${html}</div></div></div>`;

/** Totalul zilei și diferența față de durata_zi, în Ziua și în Schiță (D-053). */
function totalZi(c) {
  const t = c.total;
  if (t.ramas == null) return `<p class="total-zi"><b>Total: ${timp(t.agenda)}</b></p>`;
  const stare = t.ramas > 0 ? `rămân <b>${timp(t.ramas)}</b> până la ${ora(c.curs.zi_sfarsit)}` : t.ramas === 0 ? 'ziua e plină exact' : `<b>depășire ${timp(t.ramas)}</b>`;
  const clasa = t.ramas > 0 ? 'ramas' : t.ramas === 0 ? 'plin' : 'depasire';
  return `<p class="total-zi ${clasa}" role="status"><b>Total: ${timp(t.agenda)}</b> din ${timp(t.zi)} (${e(String(c.curs.durata_zi))}) · ${stare}. Se termină la ${ora(t.sfarsit)}.</p>`;
}

function vedereaZiua(c) {
  const randPiesa = (x, i, cls) => `<tr class="${cls}" data-modul="${i}"><td></td><td>↳ <a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a></td><td><span class="tip">${TIP[x.tip] ?? e(x.tip)}</span></td><td>${x.durata} min</td><td class="sters">${x.familie === 'activitate' ? `${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}` : e(x.ancora)}</td><td>${x.materiale.map(e).join('<br>')}</td></tr>`;
  const randuri = c.agenda.map((r, i) => {
    if (r.fel === 'pauza') return `<tr data-modul="${i}" class="pauza"><td class="ora">${oraR(r)}</td><td>${e(r.titlu)}</td><td><span class="tip">pauză</span></td><td>${r.durata} min</td><td></td><td></td></tr>`;
    if (r.fel === 'piesa') {
      const x = r.piesa;
      return `<tr data-modul="${i}" class="${x.tip === 'pauza' ? 'pauza' : 'piesa-singura'}"><td class="ora">${oraR(r)}</td><td><a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a> <span class="sters">(piesă)</span></td><td><span class="tip">${TIP[x.tip] ?? e(x.tip)}</span></td><td>${r.durata} min</td><td>${e(x.ancora)}</td><td>${x.materiale.map(e).join('<br>') || '<span class="sters">–</span>'}</td></tr>`;
    }
    const m = r.modul;
    const calcul = r.piese.length ? `<span class="calcul">${r.durataModul} + ${r.piese.map((x) => x.durata).join(' + ')}</span>` : '';
    return `<tr data-modul="${i}"><td class="ora">${oraR(r)}</td><td><b>${e(m.titlu)}</b></td>
  <td><span class="tip">${TIP[m.tip] ?? e(m.tip)}</span></td><td><b>${r.durata} min</b>${calcul}</td><td>${e(m.ancora)}</td>
  <td>${m.materiale.map(e).join('<br>') || '<span class="sters">–</span>'}</td></tr>${r.piese.map((x) => randPiesa(x, i, 'exercitiu-rand')).join('')}`;
  }).join('\n');
  const nota = c.editie.nota_trainer ? `<p class="nota-editie"><span class="eticheta">Despre acest grup</span><br>${e(c.editie.nota_trainer)}</p>` : '';
  const afara = c.module.filter((m) => !m.inAgenda);
  return `<h2>Ziua</h2>${nota}${totalZi(c)}
<table class="ziua"><thead><tr><th>Ora</th><th>Modulul / piesa</th><th>Tip</th><th>Durata</th><th>Ancora</th><th>Materiale</th></tr></thead><tbody>
${randuri}</tbody><tfoot><tr><td class="ora">${ora(c.editie.start ?? 0)}–${ora(c.total.sfarsit)}</td><td colspan="2"><b>Total</b></td><td><b>${c.total.agenda} min</b></td><td colspan="2" class="sters">${c.total.ramas == null ? '' : c.total.ramas >= 0 ? `rămân ${timp(c.total.ramas)}` : `depășire ${timp(c.total.ramas)}`}</td></tr></tfoot></table>
${afara.length ? `<p class="sters">Nu sunt în agenda acestei ediții: ${afara.map((m) => e(m.titlu)).join(', ')}.</p>` : ''}`;
}

/** Obiectivele zilei cu bife (Alex, 2026-11-17). Apar în Schiță și în schița din ecranul de comandă, niciodată în sală.
 *  Bifele trăiesc doar în browser (prezinta.js); la tipar, căsuțele ies goale. */
export function blocObiective(c) {
  if (!c.obiective.length) return '';
  return `<section class="obiective" aria-label="Obiectivele zilei">
<div class="obiective-cap"><h3 class="eticheta">Obiectivele zilei</h3><span class="obiective-nr sters" data-obiective-nr>0 din ${c.obiective.length}</span><button type="button" class="obiective-reset ascuns-la-tipar" data-obiective-reset>Debifează tot</button></div>
<ol class="obiective-lista">${c.obiective.map((o, i) => `<li><label><input type="checkbox" data-obiectiv="${i}" data-text="${e(o)}"><span class="ob-cutie" aria-hidden="true"></span><span class="ob-nr">${i + 1}</span><span class="ob-text">${e(o)}</span></label></li>`).join('')}</ol>
</section>`;
}
/** „→ ob. 1, 3”: obiectivele servite de un rând din agendă (modulul și piesele lui). */
function legendaObiective(c, r) {
  const surse = r.fel === 'modul' ? [r.modul, ...r.piese] : r.fel === 'piesa' ? [r.piesa] : [];
  const n = [...new Set(surse.flatMap((x) => x.obiective))].filter((k) => k <= c.obiective.length).sort((a, b) => a - b);
  return n.length ? ` <span class="ob-leg" title="${n.map((k) => e(c.obiective[k - 1])).join(' · ')}">→ ob. ${n.join(', ')}</span>` : '';
}

export function listaSchita(c) {
  return `<ol class="schita">${c.agenda.map((r, i) => {
    if (ePauza(r)) return `<li data-modul="${i}" class="pauza"><span class="ora">${ora(r.start)}</span><div class="ancora">${e(titluR(r))}</div><div class="titlu-mic">${r.durata} min</div></li>`;
    if (r.fel === 'piesa') return `<li data-modul="${i}" class="piesa-singura"><span class="ora">${ora(r.start)}</span><div class="ancora">${e(r.piesa.ancora || r.piesa.titlu)}</div><div class="titlu-mic">${e(r.piesa.titlu)} · ${TIP[r.piesa.tip] ?? e(r.piesa.tip)} · ${r.durata} min${legendaObiective(c, r)}</div></li>`;
    return `<li data-modul="${i}"><span class="ora">${ora(r.start)}</span>
  <div class="ancora">${e(r.modul.ancora)}</div><div class="titlu-mic">${e(r.modul.titlu)} · ${r.durata} min${r.piese.length ? ` (${r.durataModul} + ${r.piese.map((x) => x.durata).join(' + ')})` : ''}${legendaObiective(c, r)}</div>
  <ul>${r.modul.schita.map((p) => `<li>${e(p)}</li>`).join('')}</ul>${r.piese.length ? `<div class="titlu-mic">Piese: ${r.piese.map((x) => e(x.titlu)).join(', ')}</div>` : ''}</li>`;
  }).join('\n')}</ol>`;
}

/** Un segment, cum apare în vederile Modul și Bibliotecă. */
function piesa(s, lume, randeaza) {
  if (s.strat === 'text') return `<div class="strat strat-text">${randeaza(s.md)}</div>`;
  if (s.strat === 'trainer') return `<div class="strat strat-trainer"><span class="eticheta">Trainer</span>${randeaza(s.md)}</div>`;
  if (s.strat === 'participant') return `<div class="strat strat-participant"><span class="eticheta">Doar în cursul online</span>${randeaza(s.md)}</div>`;
  if (s.strat === 'piese') return `<p class="strat sters">Aici intră piesele alese în agendă.</p>`;
  if (s.strat === 'piesa-inceput') { const x = s.piesa; return `<div class="exercitiu-incadrat"><p class="eticheta">Piesă · ${e(x.titlu)} · ${despre(x)}${x.in_curs ? '' : ' · nu apare în cursul online'}</p>${x.obiectiv ? `<p>${e(x.obiectiv)}</p>` : ''}`; }
  if (s.strat === 'piesa-sfarsit') return '</div>';
  const randeazaEcran = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const eticheta = s.strat === 'sala' ? 'Ecran în sală' : 'Ecran în sală și în curs';
  const cron = s.atribute.cronometru ? ` · cronometru ${s.atribute.cronometru} min` : '';
  return `<div class="strat strat-ecran"><span class="eticheta">${eticheta}${cron}</span>${ecranStatic(lume, randeazaEcran(s.md))}</div>`;
}

function alternativeHtml(c, m, alese) {
  const alt = [...m.implicite, ...m.alternative].filter((id) => !alese.some((x) => x.id === id)).map((id) => c.piese.get(id)).filter(Boolean);
  return alt.length ? `<p class="sters">Poți alege și: ${alt.map((x) => `<a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a> (${despre(x)})`).join('; ')}</p>` : '';
}

function vedereaModul(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img' });
  const articol = (m, r) => {
    const piese = r ? desfasoara(r) : m.segmente;
    const continut = piese.map((s) => piesa(s, r ? lumeDe(r, s) : (LUME[m.tip] ?? 'luminos'), randeaza)).join('\n');
    const durata = r ? `${r.durata} min${r.piese.length ? ` (modul ${r.durataModul} + piese ${r.durataPiese})` : ''}` : `${m.durata} min fără piese`;
    return `<article class="modul ${r ? '' : 'sarit'}" id="modul-${e(m.id)}">
<header><span class="eticheta">${r ? oraR(r) + ' · ' : ''}${TIP[m.tip] ?? e(m.tip)} · ${durata}${r ? '' : ' · nu e în agenda acestei ediții'}</span>
<h3>${e(m.titlu)}</h3>${m.materiale.length ? `<p class="sters">Materiale: ${m.materiale.map(e).join(', ')}</p>` : ''}${alternativeHtml(c, m, r ? r.piese : [])}</header>
${continut}</article>`;
  };
  const singura = (r) => `<article class="modul piesa-singura" id="rand-${e(r.piesa.id)}">
<header><span class="eticheta">${oraR(r)} · piesă singură · ${despre(r.piesa)}</span><h3>${e(r.piesa.titlu)}</h3>${r.piesa.materiale.length ? `<p class="sters">Materiale: ${r.piesa.materiale.map(e).join(', ')}</p>` : ''}</header>
${desfasoara(r).filter((s) => s.strat !== 'piesa-inceput' && s.strat !== 'piesa-sfarsit').map((s) => piesa(s, lumeDe(r, s), randeaza)).join('\n')}</article>`;
  const dinAgenda = c.agenda.filter((r) => r.fel === 'modul' || (r.fel === 'piesa' && r.piesa.tip !== 'pauza')).map((r) => (r.fel === 'modul' ? articol(r.modul, r) : singura(r))).join('\n');
  const afara = c.module.filter((m) => !m.inAgenda).map((m) => articol(m, null)).join('\n');
  return `<h2>Modulele</h2>${dinAgenda}${afara ? `<h2 class="sub">Nu sunt în agenda acestei ediții</h2>${afara}` : ''}`;
}

/** Biblioteca de piese (fosta Bancă; UX Ioana v2, 2026-11-17): o listă compactă de rânduri care se deschid la cerere (<details>),
 *  cu căutare și filtre ca butoane-chip. Primul rând de chip-uri: familia și tipul (1.9). Format și energie privesc doar activitățile.
 *  Sus stau piesele din agenda de azi (cu cât din zi ocupă), dedesubt restul, de la cele scurte la cele lungi.
 *  Filtrele lucrează în prezinta.js (filtreaza), pe atributele data-* de pe fiecare rând. */
function vedereaBanca(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img' });
  const toate = [...c.piese.values()];
  if (!toate.length) return '<h2>Biblioteca de piese</h2><p class="sters">Cursul nu are încă piese în piese/.</p>';
  // Unde e folosită azi: rândurile din agendă (pentru oră și titlu), în ordinea agendei. O piesă poate apărea de mai multe ori.
  const azi = new Map();
  c.agenda.forEach((r) => {
    const lista = r.fel === 'modul' ? r.piese : r.fel === 'piesa' ? [r.piesa] : [];
    lista.forEach((x) => { if (!azi.has(x.id)) azi.set(x.id, []); azi.get(x.id).push(r); });
  });
  const ziua = c.total.zi ?? c.total.agenda;
  // La ce module se potrivește: câmpul „module” din piesă + implicite/alternative din module. Gol = oriunde.
  const rolLa = (x, m) => (m.implicite.includes(x.id) ? 'implicită' : m.alternative.includes(x.id) ? 'alternativă' : x.module.includes(m.id) ? 'se potrivește' : null);
  const moduleDe = (x) => c.module.filter((m) => rolLa(x, m));
  const ordine = new Map(c.agenda.filter((r) => r.fel === 'modul').map((r, i) => [r.modul.id, i]));
  const moduleChip = c.module.filter((m) => toate.some((x) => rolLa(x, m)))
    .sort((a, b) => (ordine.get(a.id) ?? 99) - (ordine.get(b.id) ?? 99));
  const N_ENERGIE = { calm: 1, mediu: 2, activ: 3 };

  const rand = (x) => {
    const randuriAzi = azi.get(x.id) ?? [], mod = moduleDe(x);
    const cauta = normal([x.titlu, x.obiectiv, x.ancora, x.format ?? '', TIP[x.tip] ?? x.tip, NUME_FAMILIE[x.familie] ?? '', x.energie ?? '', ...x.materiale, ...mod.map((m) => m.titlu), ...x.segmente.map((s) => s.md)].join(' '));
    const energie = x.energie ? `<span class="energie" data-n="${N_ENERGIE[x.energie] ?? 0}" title="${ENERGIE[x.energie] ?? e(x.energie)}"><i></i><i></i><i></i> ${e(x.energie)}</span>` : '';
    const minuteAzi = randuriAzi.length * x.durata;
    const badgeAzi = randuriAzi.length ? `<span class="azi">Azi · ${randuriAzi.map((r) => `${r.start == null ? '' : ora(r.start) + ' · '}${e(titluR(r))}`).join('; ')} · ${minuteAzi} min, ${Math.round((minuteAzi / ziua) * 100)}% din zi</span>` : '';
    const unde = mod.length
      ? `<ul class="unde">${mod.map((m) => `<li>${e(m.titlu)} <span class="sters">· ${rolLa(x, m)}${randuriAzi.some((r) => r.modul === m) ? ', aleasă azi' : ''}</span></li>`).join('')}</ul>`
      : '<p>Oriunde în zi.</p>';
    const detalii = `${NUME_FAMILIE[x.familie] ?? ''} · ${TIP[x.tip] ?? e(x.tip)} · ${x.durata} min${x.familie === 'activitate' ? ` · ${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}` : ''}`;
    return `<details class="ex" id="ex-${e(x.id)}" data-familie="${e(x.familie ?? '')}" data-tip="${e(x.tip)}" data-format="${e(x.format ?? '')}" data-energie="${e(x.energie ?? '')}" data-durata="${x.durata}" data-folosit="${randuriAzi.length ? 1 : 0}" data-module="${mod.map((m) => e(m.id)).join(' ')}" data-cauta="${e(cauta)}">
<summary><span class="ex-rand"><span class="ex-durata"><b>${x.durata}</b> min</span>
<span class="ex-cap"><span class="ex-titlu">${e(x.titlu)}</span>${x.obiectiv || x.ancora ? `<span class="ex-obiectiv">${e(x.obiectiv || x.ancora)}</span>` : ''}${badgeAzi}</span>
<span class="ex-meta">${x.format ? `<span class="ex-format">${e(x.format)}</span>` : ''}${energie}${x.tip !== 'exercitiu' ? `<span class="ex-tip ex-tip-${e(x.familie ?? '')}">${TIP[x.tip] ?? e(x.tip)}</span>` : ''}</span><span class="ex-semn" aria-hidden="true"></span></span></summary>
<div class="ex-detalii">
${x.obiectiv ? `<p class="ex-obiectiv-tot">${e(x.obiectiv)}</p>` : ''}
<div class="ex-fise">
<div><p class="eticheta">Se potrivește la</p>${unde}</div>
<div><p class="eticheta">Materiale</p><p>${x.materiale.length ? x.materiale.map(e).join(', ') : '<span class="sters">nimic special</span>'}</p></div>
<div><p class="eticheta">Detalii</p><p>${detalii}${x.in_curs ? '' : '<br><b>Nu apare în cursul online</b>'}</p></div>
</div>
${x.segmente.map((s) => piesa(s, lumePiesa(x), randeaza)).join('\n')}
</div></details>`;
  };
  const primaAzi = (x) => c.agenda.indexOf(azi.get(x.id)[0]);
  const deAzi = toate.filter((x) => azi.has(x.id)).sort((a, b) => primaAzi(a) - primaAzi(b));
  const rest = toate.filter((x) => !azi.has(x.id)).sort((a, b) => a.durata - b.durata || a.titlu.localeCompare(b.titlu, 'ro'));
  const grup = (titlu, lista, dupa = '') => (lista.length ? `<div class="banca-grup"><h3 class="eticheta">${titlu} <span class="banca-grup-nr">${lista.length}</span>${dupa}</h3>${lista.map(rand).join('\n')}</div>` : '');
  const chip = (filtru, valoare, eticheta, extra = '') => `<button type="button" class="chip" data-filtru="${filtru}" data-valoare="${e(valoare)}" aria-pressed="false"${extra}>${eticheta}</button>`;
  const rand_filtre = (eticheta, chipuri) => `<div class="filtre-rand" role="group" aria-label="${eticheta}"><span class="filtre-eticheta">${eticheta}</span><div class="chipuri">${chipuri}</div></div>`;
  // Familia și tipul: doar valorile care există în bibliotecă, în ordinea din 1.9.
  const familii = FAMILII.filter((f) => toate.some((x) => x.familie === f));
  const tipuri = Object.keys(FAMILIE).filter((t) => toate.some((x) => x.tip === t));
  const minAzi = deAzi.reduce((s, x) => s + azi.get(x.id).length * x.durata, 0);

  return `<div class="banca-cap"><h2>Biblioteca de piese</h2><p class="sters banca-numar" id="banca-numar" role="status"></p></div>
<div class="banca-filtre">
<div class="cautare"><input type="search" id="banca-cauta" placeholder="Caută: titlu, obiectiv, materiale…" aria-label="Caută în bibliotecă" autocomplete="off" enterkeyhint="search"><kbd aria-hidden="true">/</kbd></div>
${rand_filtre('Familie și tip', familii.map((f) => chip('familie', f, `<b>${NUME_FAMILIE[f]}</b>`, ' data-familie-chip')).join('') + '<span class="chip-sep" aria-hidden="true"></span>' + tipuri.map((t) => chip('tip', t, TIP[t] ?? e(t))).join(''))}
${rand_filtre('Format', FORMATE.map((v) => chip('format', v, e(v))).join(''))}
${rand_filtre('Energie', ENERGII.map((v) => chip('energie', v, `<span class="energie" data-n="${N_ENERGIE[v]}"><i></i><i></i><i></i></span> ${e(v)}`)).join(''))}
${rand_filtre('Durata', [10, 15, 20, 30].map((v) => chip('durata', v, `≤ ${v} min`)).join(''))}
${moduleChip.length ? rand_filtre('Modulul', moduleChip.map((m) => chip('modul', m.id, e(m.titlu), ` title="${e(m.titlu)}"`)).join('')) : ''}
<p class="filtre-nota sters">Format și energie privesc doar activitățile.</p>
<button type="button" class="sterge-filtre" id="banca-sterge" hidden>Șterge filtrele</button>
</div>
<div class="banca-lista">
${grup('Azi în agendă', deAzi, `<span class="banca-grup-timp"> · ${minAzi} min, ${Math.round((minAzi / ziua) * 100)}% din zi</span>`)}
${grup(deAzi.length ? 'Restul bibliotecii' : 'Toate piesele', rest)}
<p class="banca-gol" id="banca-gol" hidden>Nicio piesă nu se potrivește. <button type="button" id="banca-gol-sterge">Șterge filtrele</button></p>
</div>
<p class="sters banca-nota">Ca să schimbi o piesă în agendă: editează „agenda” din ediție și rulează din nou build-ul. Orele se recalculează singure.</p>`;
}

export function construiesteTrainer(c) {
  const ecrane = construiesteEcrane(c);
  const css = readFileSync(caleTema(c.curs.brand), 'utf8') + '\n' + readFileSync(join(AICI, 'stil.css'), 'utf8');
  const script = readFileSync(join(AICI, 'prezinta.js'), 'utf8');
  const modul = vedereaModul(c);
  const date = {
    curs: { titlu: c.curs.titlu, slug: c.curs.slug, brand: c.curs.brand, limba: c.curs.limba },
    editie: { data: c.editie.data, start: c.editie.start },
    // „module” = rândurile din agenda ediției (module, piese singure și pauze), în ordine, cu orele calculate.
    module: c.agenda.map((r) => ({
      id: r.fel === 'modul' ? r.modul.id : r.fel === 'piesa' ? r.piesa.id : null, titlu: titluR(r),
      tip: r.fel === 'pauza' ? 'pauza' : r.fel === 'piesa' ? r.piesa.tip : r.modul.tip, durata: r.durata, start: r.start, sfarsit: r.sfarsit,
      alternative: r.fel === 'modul' ? alternativeHtml(c, r.modul, r.piese) : '',
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
    <button data-vedere="banca">Biblioteca</button>
    <button data-vedere="prezinta" class="principal">Prezintă</button>
  </nav>
</header>
<main>
<section id="ziua">${vedereaZiua(c)}</section>
<section id="schita" hidden><h2>Schița zilei</h2>${totalZi(c)}${blocObiective(c)}${listaSchita(c)}</section>
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
      <div class="schita-mica" id="schita-mica"><button type="button" class="inchide-schita" id="inchide-schita">Închide schița (S / Esc)</button><p class="eticheta">Schița zilei</p>${blocObiective(c)}${listaSchita(c)}</div>
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
