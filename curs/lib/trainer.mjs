// 2. Materialul trainerului: UN fișier HTML care merge fără internet (fonturi de sistem, CSS, script și imagini incluse).
// Vederile: Ziua, Modulul, Schița (direcția 1), Biblioteca de piese și Prezintă (ecranul de comandă + fereastra sălii).
import { readFileSync, existsSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { creeazaRandare, escapeHtml as e, normal } from './randare.mjs';
import { fiseleMasa } from './fisa.mjs';
import { imaginiDin, ora, desfasoara, FORMATE, ENERGII, FAMILIE, FAMILII } from './sursa.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
// Felul ecranului din sală (Ioana, slide-tipuri v1, 2026-11-17): patru feluri care se recunosc dintr-o privire, plus pauza.
// Fiecare fel are alt fond, alt semn (pătrat, cerc, linie, triunghi, două bare), altă așezare și eticheta lui. Vezi
// team/ioana/documente/slide-tipuri-v1.md. Tipul modulului sau al piesei alege felul; un ecran cu cronometru dintr-un
// modul de teorie sau de mesaj e, de fapt, o activitate, deci devine exercițiu.
export const FEL = {
  teorie: 'teorie', model: 'teorie', poveste: 'teorie',
  reflectie: 'reflectie', deschidere: 'reflectie', inchidere: 'reflectie',
  mesaj: 'mesaj',
  exercitiu: 'exercitiu', energizant: 'exercitiu', challenge: 'exercitiu', // challenge: ecranele exercițiului până propune Ioana altele (D-075)
  pauza: 'pauza',
};
const ETICHETA_TIP = {
  teorie: 'Teorie', model: 'Model', poveste: 'Poveste', reflectie: 'Reflecție', deschidere: 'Deschidere', inchidere: 'Închidere',
  mesaj: 'Mesaj cheie', exercitiu: 'Exercițiu', challenge: 'Challenge', energizant: 'Energizant', pauza: 'Pauză',
};
const FORMAT_SALA = { individual: 'singur', perechi: 'în perechi', grup: 'în grup', plen: 'toată sala' };
const TIP = {
  teorie: 'teorie', exercitiu: 'exercițiu', challenge: 'challenge', reflectie: 'reflecție', mesaj: 'mesaj', pauza: 'pauză',
  model: 'model', poveste: 'poveste', energizant: 'energizant', deschidere: 'deschidere', inchidere: 'închidere',
};
const NUME_FAMILIE = { continut: 'conținut', activitate: 'activitate', punte: 'punte' };
const MIME = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp' };

export function caleTema(brand) {
  const t = join(AICI, '..', 'tema', `${brand}.css`);
  return existsSync(t) ? t : join(AICI, '..', 'tema', 'sobru.css');
}

const ENERGIE = { calm: 'energie calmă', mediu: 'energie medie', activ: 'energie activă' };
/** De unde vine un ecran: tipul, titlul și formatul piesei sau ale modulului. */
const sursaPiesa = (x) => ({ tip: x.tip, titlu: x.titlu, format: x.format, pid: x.id });
const sursaModul = (m) => ({ tip: m.tip, titlu: m.titlu });
const sursaDe = (r, s) => (s && s.piesa ? sursaPiesa(s.piesa) : r.fel === 'piesa' ? sursaPiesa(r.piesa) : r.fel === 'pauza' ? { tip: 'pauza', titlu: r.titlu } : sursaModul(r.modul));

/** Textul mare (mesaj cheie, reflecție/deschidere/închidere) se micșorează după lungime, ca să încapă
 *  și să nu pară strigat (Alex, 2026-11-17: „prea mare textul” la deschidere și închidere). */
const PRAGURI = { mesaj: [14, 22], reflectie: [10, 22] };
function lungime(fel, html) {
  const p = PRAGURI[fel]; if (!p) return '';
  const n = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  return n > p[1] ? ' foarte-lung' : n > p[0] ? ' lung' : '';
}

/** Un ecran din sală: felul, eticheta și interiorul (eticheta cu semnul felului, conținutul, panoul sau cronometrul).
 *  Același HTML în sală, în previzualizări, în ecranul de comandă și la tipar. */
/** Marca studioului (D-061, Ioana, 2026-11-17): un wordmark tipografic, fără logo. Primul cuvânt în Sora (ca semnătura din manual,
 *  secțiunea 4), restul în Inter Tight; amândouă cu majuscule spațiate, ca „INNERSIS” din colțul slide-urilor Ive.
 *  Același HTML în colțul ecranelor, în bara trainerului și pe PDF. Fără marcă (alt brand sau `marca: ""`) nu se scrie nimic. */
export function marcaHtml(marca, clasa) {
  if (!marca) return '';
  const [nume, ...rest] = String(marca).trim().split(/\s+/);
  return `<p class="marca ${clasa}" aria-label="${e(marca)}"><span class="marca-nume" aria-hidden="true">${e(nume)}</span>${rest.length ? ` <span class="marca-rest" aria-hidden="true">${e(rest.join(' '))}</span>` : ''}</p>`;
}
/** Marca e mai vizibilă pe ecranele care deschid ceva: titlul unui modul sau al unei piese, deschiderea și închiderea zilei. */
const MARCA_MARE = new Set(['deschidere', 'inchidere']);

export function ecranul(sursa, continut, cronometru = 0, titlu = false, marca = '') {
  let fel = FEL[sursa.tip] ?? 'teorie';
  const activitate = cronometru > 0 && (fel === 'teorie' || fel === 'mesaj');
  if (activitate) fel = 'exercitiu';
  const nume = activitate ? 'Exercițiu' : ETICHETA_TIP[sursa.tip] ?? 'Teorie';
  const eticheta = titlu || fel === 'pauza' || !sursa.titlu ? nume : `${nume} · ${sursa.titlu}`;
  const cron = cronometru ? `<div class="ecran-cronometru" data-cron>${cronometru}:00</div>` : ''; // în sală, prezinta.js îl ține la zi
  const format = FORMAT_SALA[sursa.format] ?? '';
  // Exercițiul are panoul lui: cronometrul mare (sau semnul ▶) și formatul. Celelalte feluri pun cronometrul jos, în dreapta.
  const panou = fel === 'exercitiu'
    ? `<div class="ecran-panou">${cron || '<span class="panou-semn" aria-hidden="true"></span>'}${format ? `<p class="panou-format">${e(format)}</p>` : ''}</div>`
    : cron;
  const html = `<p class="ecran-eticheta"><span class="ecran-semn" aria-hidden="true"></span><span class="ecran-eticheta-text">${e(eticheta)}</span></p>`
    + `<div class="ecran-continut${lungime(fel, continut)}">${continut}</div>${panou}`
    + marcaHtml(marca, `ecran-marca${(titlu && fel !== 'pauza') || MARCA_MARE.has(sursa.tip) ? ' mare' : ''}`);
  return { fel, eticheta, html };
}
/** Etichetele (Alex, 2026-11-17): organizare internă. Nu ajung în sală și nici în cursul participanților. */
const eticheteMici = (x) => (x.etichete?.length ? ` <span class="etichete-mici">${x.etichete.map((t) => e(t.text)).join(' · ')}</span>` : '');
/** „15 min · perechi · energie medie” la activități; „20 min · model” la restul. */
const despre = (x) => `${x.durata} min · ${x.familie === 'activitate' ? `${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}` : TIP[x.tip] ?? e(x.tip)}`;
/** „1 h 25 min” */
export const timp = (min) => { const a = Math.abs(min); return a >= 60 ? `${Math.floor(a / 60)} h${a % 60 ? ` ${a % 60} min` : ''}` : `${a} min`; };
const ePauza = (r) => r.fel === 'pauza' || (r.fel === 'piesa' && r.piesa.tip === 'pauza') || (r.fel === 'modul' && r.modul.tip === 'pauza');

/** Id-ul ecranului unei pauze fixe (Alex, 2026-11-18): după ora ei, „pauza-11-00#pauza”. Nu mută id-urile „pauza#k”. */
export const idPauzaFixa = (la) => `pauza-${ora(la).replace(':', '-')}#pauza`;

/** Ecranele din sală, din agenda ediției: titlul fiecărui modul (făcut singur), apoi câte unul pe bloc :::sala / :::sala-si-curs,
 *  cu piesele alese puse în locul lor. O pauză (rând sau piesă) e un ecran cu cronometru. O piesă singură fără ecrane primește unul cu titlul ei. */
export function construiesteEcrane(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const randeazaNota = creeazaRandare({ atribut: 'data-img' });
  const ecrane = [];
  // Id-ul stabil al fiecărui ecran (1.10, Alex, 2026-11-17): <piesă sau modul>#<n> (al n-lea bloc :::sala / :::sala-si-curs din fișier),
  // <modul>#titlu, <piesă>#titlu (piesa singură fără ecrane), <piesă>#pauza, pauza#<k> (al k-lea rând „pauza: N”).
  // O piesă folosită de două ori în agendă primește la a doua apariție <piesă>@2. Id-ul nu depinde de ordinea agendei.
  const pune = (ri, id, sursa, continut, cronometru = 0, titlu = false) => {
    const x = ecranul(sursa, continut, cronometru, titlu, c.curs.marca);
    // piesa: id-ul piesei din care vine ecranul (1.12: „Prezintă” din Bibliotecă sare la ea dacă e deja în agendă)
    ecrane.push({ id, modul: ri, sursa: sursa.titlu ?? '', fel: x.fel, eticheta: x.eticheta, html: x.html, cronometru, note: [], ...(sursa.pid ? { piesa: sursa.pid } : {}), ...(titlu ? { titlu: true } : {}) });
  };
  const pauza = (ri, id, titlu, durata, pid) => pune(ri, id, { tip: 'pauza', titlu, pid }, `<h1>${e(titlu)}</h1><p class="ecran-sub">${durata} min</p>`, durata, true);
  const aparitii = new Map();
  let nr = 0, pauze = 0;
  c.agenda.forEach((r, ri) => {
    if (r.fel === 'pauza') { pauza(ri, r.fixa ? idPauzaFixa(r.la) : `pauza#${++pauze}`, r.titlu, r.durata); return; }
    if (r.fel === 'modul') {
      if (r.modul.tip === 'pauza') pauza(ri, `${r.modul.id}#titlu`, r.modul.titlu, r.durata);
      else { nr++; pune(ri, `${r.modul.id}#titlu`, sursaModul(r.modul), `<p class="ecran-numar">${String(nr).padStart(2, '0')}</p><h1>${e(r.modul.titlu)}</h1>`, 0, true); }
    }
    const chei = new Map(), blocuri = new Map();
    const cheie = (s) => {
      const p = s.piesa; if (!p) return r.modul.id;
      if (!chei.has(p)) { const k = (aparitii.get(p.id) ?? 0) + 1; aparitii.set(p.id, k); chei.set(p, k > 1 ? `${p.id}@${k}` : p.id); }
      return chei.get(p);
    };
    const urmatorul = (s) => { const k = cheie(s); blocuri.set(k, (blocuri.get(k) ?? 0) + 1); return `${k}#${blocuri.get(k)}`; };
    const inainte = ecrane.length, noteInainte = [];
    for (const s of desfasoara(r)) {
      if (s.strat === 'sala' || s.strat === 'sala-si-curs') {
        pune(ri, urmatorul(s), sursaDe(r, s), randeaza(s.md), s.atribute.cronometru ?? 0);
      } else if (s.strat === 'piesa-inceput' && s.piesa.tip === 'pauza') {
        pauza(ri, `${cheie(s)}#pauza`, s.piesa.titlu, s.piesa.durata, s.piesa.id);
      } else if (s.strat === 'piesa-inceput' && r.fel === 'piesa' && !s.piesa.segmente.some((x) => x.strat === 'sala' || x.strat === 'sala-si-curs')) {
        pune(ri, `${cheie(s)}#titlu`, sursaPiesa(s.piesa), `<h1>${e(s.piesa.titlu)}</h1>`, 0, true);
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
  ecrane.forEach((x, i) => { x.nat = i; });
  return ecrane;
}

/**
 * Ordinea și ascunderea ecranelor din ediție (1.10, Alex, 2026-11-17):
 *   ecrane:
 *     muta: ["curba#2 după deschidere#1", "inchidere#1 la început"]
 *     ascunse: [pasul-de-luni#1]
 * Mutările se aplică pe rând, peste ordinea firească (agenda). Un ecran nou intră singur la locul lui firesc.
 * Întoarce { ecrane, erori, avertismente }: ecranele în ordinea ediției, cu `ascuns` pus.
 */
export function pregatesteEcrane(c) {
  const ecrane = construiesteEcrane(c);
  const erori = [], avertismente = [];
  const cfg = c.editie.ecrane;
  const loc = `ediția ${c.editie.fisier ?? ''}, ecrane`;
  if (cfg === undefined || cfg === null) return { ecrane, erori, avertismente };
  if (typeof cfg !== 'object' || Array.isArray(cfg)) return { ecrane, erori: [`${loc}: are forma { muta: [...], ascunse: [...] }`], avertismente };
  for (const k of Object.keys(cfg)) if (!['muta', 'ascunse'].includes(k)) erori.push(`${loc}: „${k}” necunoscut (se pot: muta, ascunse)`);
  const lista = (v, nume) => { if (v === undefined || v === null) return []; if (!Array.isArray(v)) { erori.push(`${loc}: „${nume}” trebuie să fie o listă`); return []; } return v.map((x) => String(x).trim()); };
  // Id-urile posibile în curs (nu doar azi): un id care nu există nicăieri e o greșeală; unul din curs care nu e azi în agendă e doar ignorat.
  const blocuriIn = (f) => f.segmente.filter((s) => s.strat === 'sala' || s.strat === 'sala-si-curs').length;
  const posibil = (id) => {
    const m = /^(.+?)(?:@\d+)?#(titlu|pauza|\d+)$/.exec(id); if (!m) return false;
    if (m[1] === 'pauza' && /^\d+$/.test(m[2])) return true;
    if (/^pauza-\d{1,2}-\d{2}$/.test(m[1]) && m[2] === 'pauza') return true; // pauză fixă (poate fi azi în afara agendei)
    const f = c.module.find((x) => x.id === m[1]) ?? c.piese.get(m[1]);
    if (!f) return false;
    return m[2] === 'titlu' || m[2] === 'pauza' || (+m[2] >= 1 && +m[2] <= blocuriIn(f));
  };
  const deAzi = new Map(ecrane.map((x) => [x.id, x]));
  const verifica = (id, unde) => {
    if (deAzi.has(id)) return true;
    if (posibil(id)) avertismente.push(`${loc}: „${id}” (${unde}) nu e în agenda de azi; îl ignor`);
    else erori.push(`${loc}: „${id}” (${unde}) nu e un ecran din curs. Id-urile arată ca „curba#2”, „curba#titlu” sau „pauza#1” (vezi vederea Ecrane)`);
    return false;
  };
  const ordine = ecrane.slice();
  const vazute = new Set();
  for (const rand of lista(cfg.muta, 'muta')) {
    const m = /^(\S+)\s+(?:după|dupa)\s+(\S+)$/.exec(rand) ?? /^(\S+)\s+la\s+(?:început|inceput)$/.exec(rand);
    if (!m) { erori.push(`${loc}: „${rand}” nu se înțelege. Se scrie „<ecran> după <ecran>” sau „<ecran> la început”`); continue; }
    const [, id, dupa] = m;
    if (vazute.has(id)) { erori.push(`${loc}: „${id}” e mutat de două ori`); continue; }
    vazute.add(id);
    if (!verifica(id, 'muta')) continue;
    if (dupa !== undefined && !verifica(dupa, `muta, după`)) continue;
    if (dupa === id) { erori.push(`${loc}: „${id}” nu se poate muta după el însuși`); continue; }
    const x = deAzi.get(id);
    ordine.splice(ordine.indexOf(x), 1);
    ordine.splice(dupa === undefined ? 0 : ordine.indexOf(deAzi.get(dupa)) + 1, 0, x);
  }
  const ascunse = new Set();
  for (const id of lista(cfg.ascunse, 'ascunse')) {
    if (ascunse.has(id)) { erori.push(`${loc}: „${id}” apare de două ori în ascunse`); continue; }
    ascunse.add(id);
    if (verifica(id, 'ascunse')) deAzi.get(id).ascuns = true;
  }
  if (ordine.length && ordine.every((x) => x.ascuns)) erori.push(`${loc}: toate ecranele sunt ascunse`);
  // Timpul rămâne pe piese (1.10): un rând din agendă cu toate ecranele ascunse rămâne în total, cu avertisment.
  c.agenda.forEach((r, ri) => {
    const ale = ecrane.filter((x) => x.modul === ri);
    if (ale.length && ale.every((x) => x.ascuns)) avertismente.push(`${loc}: toate ecranele lui „${titluR(r)}” sunt ascunse; durata (${r.durata} min) rămâne în ziua de azi. Ca s-o scoți din zi, scoate-l din agendă`);
  });
  return { ecrane: ordine, erori, avertismente };
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
// Previzualizare: cronometrul arată durata și nu se leagă de cronometrul din Prezintă (fără data-cron).
const ecranStatic = (x) => `<div class="cadru"><div class="ecran fel-${x.fel}">${x.html.replace(' data-cron>', '>')}</div></div>`;
/** Tipul, cu semnul felului lui (același semn ca pe ecranele din sală și în banda din ecranul de comandă). */
// Semnul mic din Harvest și Bibliotecă: al felului; challenge-ul are semnul lui (◆), deși în sală e încă exercițiu (D-075).
const semnMic = (tip) => `semn-mic fel-${FEL[tip] ?? 'teorie'}${tip === 'challenge' ? ' semn-challenge' : ''}`;
// În Bibliotecă, eticheta de tip e text; doar challenge-ul primește și rombul, ca să se vadă printre exerciții.
const semnChallenge = (tip) => (tip === 'challenge' ? `<span class="${semnMic(tip)}" aria-hidden="true"></span> ` : '');
const tipSemn = (tip) => `<span class="tip"><span class="${semnMic(tip)}" aria-hidden="true"></span>${TIP[tip] ?? e(tip)}</span>`;

/** Totalul zilei și diferența față de durata_zi, în Ziua și în Schiță (D-053). */
function totalZi(c) {
  const t = c.total;
  if (t.ramas == null) return `<p class="total-zi"><b>Total: ${timp(t.agenda)}</b></p>`;
  const stare = t.ramas > 0 ? `rămân <b>${timp(t.ramas)}</b> până la ${ora(c.curs.zi_sfarsit)}` : t.ramas === 0 ? 'ziua e plină exact' : `<b>depășire ${timp(t.ramas)}</b>`;
  const clasa = t.ramas > 0 ? 'ramas' : t.ramas === 0 ? 'plin' : 'depasire';
  return `<p class="total-zi ${clasa}" role="status"><b>Total: ${timp(t.agenda)}</b> din ${timp(t.zi)} (${e(String(c.curs.durata_zi))}) · ${stare}. Se termină la ${ora(t.sfarsit)}.</p>`;
}

/** Blocurile zilei (Alex, 2026-11-18): „X din Y min” pe fiecare bloc dintre pauzele fixe, cu depășirea marcată. */
export const areBlocuri = (c) => c.blocuri.length > 1;
function stareBloc(b) {
  if (b.disponibil == null) return { clasa: '', text: `${b.folosit} min` };
  const clasa = b.depasire ? 'depasire' : b.folosit === b.disponibil ? 'plin' : 'ramas';
  const stare = b.depasire ? `<b>depășire ${timp(b.depasire)}</b>` : b.folosit === b.disponibil ? 'plin' : `liber ${timp(b.disponibil - b.folosit)}`;
  return { clasa, text: `<b>Blocul ${b.nr}</b> · ${ora(b.start)}–${ora(b.sfarsit)} · <span class="bloc-total">${b.folosit} din ${b.disponibil} min</span> · ${stare}` };
}
/** Rândurile agendei, așezate pe blocuri: capul blocului, rândurile lui, apoi pauza fixă de după el. O pauză fixă care azi nu e
 *  în agendă (agenda se termină înainte de ea) apare doar ca reper, fără ecran. */
function peBlocuri(c, rand, cap, reper) {
  if (!areBlocuri(c)) return c.agenda.map(rand).join('\n');
  return c.blocuri.map((b) => {
    const ale = c.agenda.map((r, i) => [r, i]).filter(([r]) => !r.fixa && r.bloc === b.nr).map(([r, i]) => rand(r, i)).join('\n');
    const pi = c.agenda.findIndex((r) => r.fixa && r.bloc === b.nr);
    return cap(b) + ale + (b.pauzaDupa ? (pi >= 0 ? rand(c.agenda[pi], pi) : reper(b.pauzaDupa, b.pauzaDupa.la + b.depasire)) : '');
  }).join('\n');
}
const notaFixa = (r) => (r.fixa ? ` <span class="sters">· pauză fixă${r.intarziere ? `, începe cu ${r.intarziere} min mai târziu` : ''}</span>` : '');

function vedereaZiua(c) {
  const randPiesa = (x, i, cls) => `<tr class="${cls}" data-modul="${i}"><td></td><td>↳ <a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a>${eticheteMici(x)}</td><td>${tipSemn(x.tip)}</td><td>${x.durata} min</td><td class="sters">${x.familie === 'activitate' ? `${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}` : e(x.ancora)}</td><td>${x.materiale.map(e).join('<br>')}</td></tr>`;
  const rand = (r, i) => {
    if (r.fel === 'pauza') return `<tr data-modul="${i}" class="pauza${r.fixa ? ' fixa' : ''}"><td class="ora">${oraR(r)}</td><td>${e(r.titlu)}${notaFixa(r)}</td><td>${tipSemn('pauza')}</td><td>${r.durata} min</td><td></td><td></td></tr>`;
    if (r.fel === 'piesa') {
      const x = r.piesa;
      return `<tr data-modul="${i}" class="${x.tip === 'pauza' ? 'pauza' : 'piesa-singura'}"><td class="ora">${oraR(r)}</td><td><a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a> <span class="sters">(piesă)</span>${eticheteMici(x)}</td><td>${tipSemn(x.tip)}</td><td>${r.durata} min</td><td>${e(x.ancora)}</td><td>${x.materiale.map(e).join('<br>') || '<span class="sters">–</span>'}</td></tr>`;
    }
    const m = r.modul;
    const calcul = r.piese.length ? `<span class="calcul">${r.durataModul} + ${r.piese.map((x) => x.durata).join(' + ')}</span>` : '';
    return `<tr data-modul="${i}"><td class="ora">${oraR(r)}</td><td><b>${e(m.titlu)}</b>${eticheteMici(m)}</td>
  <td>${tipSemn(m.tip)}</td><td><b>${r.durata} min</b>${calcul}</td><td>${e(m.ancora)}</td>
  <td>${m.materiale.map(e).join('<br>') || '<span class="sters">–</span>'}</td></tr>${r.piese.map((x) => randPiesa(x, i, 'exercitiu-rand')).join('')}`;
  };
  const cap = (b) => { const s = stareBloc(b); return `<tr class="bloc-cap ${s.clasa}" data-bloc="${b.nr}"><td colspan="6">${s.text}</td></tr>`; };
  const reper = (p, start) => `<tr class="pauza fixa reper"><td class="ora">${ora(start)}–${ora(start + p.min)}</td><td>${e(p.titlu)} <span class="sters">· pauză fixă, după agenda de azi</span></td><td>${tipSemn('pauza')}</td><td>${p.min} min</td><td></td><td></td></tr>`;
  const randuri = peBlocuri(c, rand, cap, reper);
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
  const rand = (r, i) => {
    if (ePauza(r)) return `<li data-modul="${i}" class="pauza${r.fixa ? ' fixa' : ''}"><span class="ora">${ora(r.start)}</span><div class="ancora">${e(titluR(r))}</div><div class="titlu-mic">${r.durata} min${r.fixa ? ' · pauză fixă' : ''}</div></li>`;
    if (r.fel === 'piesa') return `<li data-modul="${i}" class="piesa-singura"><span class="ora">${ora(r.start)}</span><div class="ancora">${e(r.piesa.ancora || r.piesa.titlu)}</div><div class="titlu-mic">${e(r.piesa.titlu)} · ${TIP[r.piesa.tip] ?? e(r.piesa.tip)} · ${r.durata} min${legendaObiective(c, r)}</div></li>`;
    return `<li data-modul="${i}"><span class="ora">${ora(r.start)}</span>
  <div class="ancora">${e(r.modul.ancora)}</div><div class="titlu-mic">${e(r.modul.titlu)} · ${r.durata} min${r.piese.length ? ` (${r.durataModul} + ${r.piese.map((x) => x.durata).join(' + ')})` : ''}${legendaObiective(c, r)}</div>
  <ul>${r.modul.schita.map((p) => `<li>${e(p)}</li>`).join('')}</ul>${r.piese.length ? `<div class="titlu-mic">Piese: ${r.piese.map((x) => e(x.titlu)).join(', ')}</div>` : ''}</li>`;
  };
  const cap = (b) => { const s = stareBloc(b); return `<li class="bloc-cap ${s.clasa}" data-bloc="${b.nr}"><span class="titlu-mic">${s.text}</span></li>`; };
  const reper = (p, start) => `<li class="pauza fixa reper"><span class="ora">${ora(start)}</span><div class="ancora">${e(p.titlu)}</div><div class="titlu-mic">${p.min} min · pauză fixă, după agenda de azi</div></li>`;
  return `<ol class="schita">${peBlocuri(c, rand, cap, reper)}</ol>`;
}

/** Un segment, cum apare în vederile Modul și Bibliotecă. */
// cheie: id-ul fișierului din care vine segmentul (modul sau piesă). Dă `data-sursa`, după care editorul local (1.11) găsește blocul.
function piesa(s, sursa, randeaza, cheie, marca = '') {
  const ref = (fel) => (cheie && s.nr ? ` data-sursa="${e(cheie)}#${fel}${s.nr}"` : '');
  if (s.strat === 'text') return `<div class="strat strat-text">${randeaza(s.md)}</div>`;
  if (s.strat === 'trainer') return `<div class="strat strat-trainer"${ref('nota')}><span class="eticheta">Trainer</span>${randeaza(s.md)}</div>`;
  if (s.strat === 'participant') return `<div class="strat strat-participant"><span class="eticheta">Doar în cursul online</span>${randeaza(s.md)}</div>`;
  if (s.strat === 'piese') return `<p class="strat sters">Aici intră piesele alese în agendă.</p>`;
  if (s.strat === 'piesa-inceput') { const x = s.piesa; return `<div class="exercitiu-incadrat"><p class="eticheta">Piesă · ${e(x.titlu)} · ${despre(x)}${x.in_curs ? '' : ' · nu apare în cursul online'}</p>${x.etichete.length ? `<p>${eticheteMici(x)}</p>` : ''}${x.obiectiv ? `<p>${e(x.obiectiv)}</p>` : ''}`; }
  if (s.strat === 'piesa-sfarsit') return '</div>';
  const randeazaEcran = creeazaRandare({ atribut: 'data-img', randuriNoi: true });
  const eticheta = s.strat === 'sala' ? 'Ecran în sală' : 'Ecran în sală și în curs';
  const cron = s.atribute.cronometru ? ` · cronometru ${s.atribute.cronometru} min` : '';
  return `<div class="strat strat-ecran"${ref('')}><span class="eticheta">${eticheta}${cron}</span>${ecranStatic(ecranul(sursa, randeazaEcran(s.md), s.atribute.cronometru ?? 0, false, marca))}</div>`;
}

function alternativeHtml(c, m, alese) {
  const alt = [...m.implicite, ...m.alternative].filter((id) => !alese.some((x) => x.id === id)).map((id) => c.piese.get(id)).filter(Boolean);
  return alt.length ? `<p class="sters">Poți alege și: ${alt.map((x) => `<a href="#ex-${e(x.id)}" data-banca>${e(x.titlu)}</a> (${despre(x)})`).join('; ')}</p>` : '';
}

function vedereaModul(c) {
  const randeaza = creeazaRandare({ atribut: 'data-img' });
  const articol = (m, r) => {
    const piese = r ? desfasoara(r) : m.segmente;
    const continut = piese.map((s) => piesa(s, r ? sursaDe(r, s) : sursaModul(m), randeaza, s.piesa ? s.piesa.id : m.id, c.curs.marca)).join('\n');
    const durata = r ? `${r.durata} min${r.piese.length ? ` (modul ${r.durataModul} + piese ${r.durataPiese})` : ''}` : `${m.durata} min fără piese`;
    return `<article class="modul ${r ? '' : 'sarit'}" id="modul-${e(m.id)}">
<header><span class="eticheta">${r ? oraR(r) + ' · ' : ''}${TIP[m.tip] ?? e(m.tip)} · ${durata}${r ? '' : ' · nu e în agenda acestei ediții'}</span>
<h3>${e(m.titlu)}</h3>${m.etichete.length ? `<p>${eticheteMici(m)}</p>` : ''}${m.materiale.length ? `<p class="sters">Materiale: ${m.materiale.map(e).join(', ')}</p>` : ''}${alternativeHtml(c, m, r ? r.piese : [])}</header>
${continut}</article>`;
  };
  const singura = (r) => `<article class="modul piesa-singura" id="rand-${e(r.piesa.id)}">
<header><span class="eticheta">${oraR(r)} · piesă singură · ${despre(r.piesa)}</span><h3>${e(r.piesa.titlu)}</h3>${r.piesa.etichete.length ? `<p>${eticheteMici(r.piesa)}</p>` : ''}${r.piesa.materiale.length ? `<p class="sters">Materiale: ${r.piesa.materiale.map(e).join(', ')}</p>` : ''}</header>
${desfasoara(r).filter((s) => s.strat !== 'piesa-inceput' && s.strat !== 'piesa-sfarsit').map((s) => piesa(s, sursaDe(r, s), randeaza, r.piesa.id, c.curs.marca)).join('\n')}</article>`;
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
  // Fluxul Masa → Biblioteca → Agenda (Alex, 2026-11-18): ce are „Da” pe masă e în Bibliotecă, produs sau nu.
  const deProdus = (c.masa?.candidate ?? []).filter((x) => x.verdict === 'da' && !x.produsa);
  if (!toate.length && !deProdus.length) return '<h2>Biblioteca de piese</h2><p class="sters">Cursul nu are încă piese în piese/ și nicio piesă cu „Da” în Harvest.</p>';
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
    const cauta = normal([x.titlu, x.obiectiv, x.ancora, ...x.etichete.map((t) => t.text), x.format ?? '', TIP[x.tip] ?? x.tip, NUME_FAMILIE[x.familie] ?? '', x.energie ?? '', ...x.materiale, ...mod.map((m) => m.titlu), ...x.segmente.map((s) => s.md)].join(' '));
    const energie = x.energie ? `<span class="energie" data-n="${N_ENERGIE[x.energie] ?? 0}" title="${ENERGIE[x.energie] ?? e(x.energie)}"><i></i><i></i><i></i> ${e(x.energie)}</span>` : '';
    const minuteAzi = randuriAzi.length * x.durata;
    const badgeAzi = randuriAzi.length ? `<span class="azi">Azi · ${randuriAzi.map((r) => `${r.start == null ? '' : ora(r.start) + ' · '}${e(titluR(r))}`).join('; ')} · ${minuteAzi} min, ${Math.round((minuteAzi / ziua) * 100)}% din zi</span>` : '';
    const unde = mod.length
      ? `<ul class="unde">${mod.map((m) => `<li>${e(m.titlu)} <span class="sters">· ${rolLa(x, m)}${randuriAzi.some((r) => r.modul === m) ? ', aleasă azi' : ''}</span></li>`).join('')}</ul>`
      : '<p>Oriunde în zi.</p>';
    const detalii = `${NUME_FAMILIE[x.familie] ?? ''} · ${TIP[x.tip] ?? e(x.tip)} · ${x.durata} min${x.familie === 'activitate' ? ` · ${e(x.format)} · ${ENERGIE[x.energie] ?? e(x.energie)}` : ''}`;
    return `<details class="ex" id="ex-${e(x.id)}" data-familie="${e(x.familie ?? '')}" data-tip="${e(x.tip)}" data-format="${e(x.format ?? '')}" data-energie="${e(x.energie ?? '')}" data-durata="${x.durata}" data-stare="produsa" data-folosit="${randuriAzi.length ? 1 : 0}" data-module="${mod.map((m) => e(m.id)).join(' ')}" data-etichete="|${x.etichete.map((t) => e(t.cheie)).join('|')}|" data-cauta="${e(cauta)}">
<summary><span class="ex-rand"><span class="ex-durata"><b>${x.durata}</b> min</span>
<span class="ex-cap"><span class="ex-titlu">${e(x.titlu)}</span>${x.obiectiv || x.ancora ? `<span class="ex-obiectiv">${e(x.obiectiv || x.ancora)}</span>` : ''}${badgeAzi}${x.etichete.length ? `<span class="ex-etichete">${x.etichete.map((t) => `<button type="button" class="et-chip" data-eticheta="${e(t.cheie)}" title="Arată toate piesele cu eticheta „${e(t.text)}”">${e(t.text)}</button>`).join('')}</span>` : ''}</span>
<span class="ex-meta">${x.format ? `<span class="ex-format">${e(x.format)}</span>` : ''}${energie}${x.tip !== 'exercitiu' ? `<span class="ex-tip ex-tip-${e(x.familie ?? '')}">${semnChallenge(x.tip)}${TIP[x.tip] ?? e(x.tip)}</span>` : ''}</span><button type="button" class="prezinta-piesa" data-prezinta="${e(x.id)}" aria-label="Prezintă piesa ${e(x.titlu)}" title="Pune ecranele piesei după ecranul de acum și sari la ele">Prezintă</button><span class="ex-semn" aria-hidden="true"></span></span></summary>
<div class="ex-detalii">
${x.obiectiv ? `<p class="ex-obiectiv-tot">${e(x.obiectiv)}</p>` : ''}
<div class="ex-fise">
<div><p class="eticheta">Se potrivește la</p>${unde}</div>
<div><p class="eticheta">Materiale</p><p>${x.materiale.length ? x.materiale.map(e).join(', ') : '<span class="sters">nimic special</span>'}</p></div>
<div><p class="eticheta">Detalii</p><p>${detalii}${x.in_curs ? '' : '<br><b>Nu apare în cursul online</b>'}</p></div>
</div>
${x.segmente.map((s) => piesa(s, sursaPiesa(x), randeaza, x.id, c.curs.marca)).join('\n')}
</div></details>`;
  };
  const primaAzi = (x) => c.agenda.indexOf(azi.get(x.id)[0]);
  const deAzi = toate.filter((x) => azi.has(x.id)).sort((a, b) => primaAzi(a) - primaAzi(b));
  const rest = toate.filter((x) => !azi.has(x.id)).sort((a, b) => a.durata - b.durata || a.titlu.localeCompare(b.titlu, 'ro'));
  const grup = (titlu, lista, dupa = '', f = rand) => (lista.length ? `<div class="banca-grup"><h3 class="eticheta">${titlu} <span class="banca-grup-nr">${lista.length}</span>${dupa}</h3>${lista.map(f).join('\n')}</div>` : '');
  // O piesă „de produs”: doar ce e pe masă (titlu, scop, durată). Fără ecrane și fără „Prezintă”, până are piese/<id>.md.
  const randDeProdus = (x) => {
    const familie = FAMILIE[x.tip] ?? '';
    const cauta = normal([x.titlu, x.scop, x.sursa, x.nota, TIP[x.tip] ?? x.tip, NUME_FAMILIE[familie] ?? '', 'de produs'].join(' '));
    return `<details class="ex ex-de-produs" id="ex-${e(x.id)}" data-familie="${e(familie)}" data-tip="${e(x.tip)}" data-format="" data-energie="" data-durata="${x.durata}" data-stare="de-produs" data-folosit="0" data-module="" data-etichete="||" data-cauta="${e(cauta)}">
<summary><span class="ex-rand"><span class="ex-durata"><b>${x.durata}</b> min</span>
<span class="ex-cap"><span class="ex-titlu">${e(x.titlu)}</span>${x.scop ? `<span class="ex-obiectiv">${e(x.scop)}</span>` : ''}</span>
<span class="ex-meta"><span class="de-produs-semn">de produs</span>${x.tip ? `<span class="ex-tip ex-tip-${e(familie)}">${semnChallenge(x.tip)}${TIP[x.tip] ?? e(x.tip)}</span>` : ''}</span><span class="ex-semn" aria-hidden="true"></span></span></summary>
<div class="ex-detalii"><div class="ex-fise">
<div><p class="eticheta">În Harvest</p><p>Sursa: ${x.sursa ? e(x.sursa) : '<span class="sters">–</span>'}${x.bloc ? ` · blocul ${x.bloc}` : ''}</p></div>
<div><p class="eticheta">De produs</p><p>Nu are încă fișierul <code>piese/${e(x.id)}.md</code>, deci nici ecrane.</p></div>
${x.nota ? `<div><p class="eticheta">Notă</p><p>${e(x.nota)}</p></div>` : ''}
</div></div></details>`;
  };
  const chip = (filtru, valoare, eticheta, extra = '') => `<button type="button" class="chip" data-filtru="${filtru}" data-valoare="${e(valoare)}" aria-pressed="false"${extra}>${eticheta}</button>`;
  const rand_filtre = (eticheta, chipuri) => `<div class="filtre-rand" role="group" aria-label="${eticheta}"><span class="filtre-eticheta">${eticheta}</span><div class="chipuri">${chipuri}</div></div>`;
  // Familia și tipul: doar valorile care există în bibliotecă, în ordinea din 1.9.
  const familii = FAMILII.filter((f) => toate.some((x) => x.familie === f));
  const tipuri = Object.keys(FAMILIE).filter((t) => toate.some((x) => x.tip === t));
  const eticheteFiltru = c.etichete.filter((t) => t.piese > 0);
  const minAzi = deAzi.reduce((s, x) => s + azi.get(x.id).length * x.durata, 0);

  return `<div class="banca-cap"><h2>Biblioteca de piese</h2><p class="sters banca-numar" id="banca-numar" role="status"></p></div>
<div class="banca-filtre">
<div class="cautare"><input type="search" id="banca-cauta" placeholder="Caută: titlu, obiectiv, etichetă, materiale…" aria-label="Caută în bibliotecă" autocomplete="off" enterkeyhint="search"><kbd aria-hidden="true">/</kbd></div>
${rand_filtre('Familie și tip', familii.map((f) => chip('familie', f, `<b>${NUME_FAMILIE[f]}</b>`, ' data-familie-chip')).join('') + '<span class="chip-sep" aria-hidden="true"></span>' + tipuri.map((t) => chip('tip', t, TIP[t] ?? e(t))).join(''))}
${rand_filtre('Format', FORMATE.map((v) => chip('format', v, e(v))).join(''))}
${rand_filtre('Energie', ENERGII.map((v) => chip('energie', v, `<span class="energie" data-n="${N_ENERGIE[v]}"><i></i><i></i><i></i></span> ${e(v)}`)).join(''))}
${rand_filtre('Durata', [10, 15, 20, 30].map((v) => chip('durata', v, `≤ ${v} min`)).join(''))}
${deProdus.length ? rand_filtre('Stare', chip('stare', 'produsa', `produse <span class="chip-nr">${toate.length}</span>`) + chip('stare', 'de-produs', `de produs <span class="chip-nr">${deProdus.length}</span>`)) : ''}
${eticheteFiltru.length ? rand_filtre('Etichete', eticheteFiltru.map((t) => chip('eticheta', t.cheie, `${e(t.text)} <span class="chip-nr">${t.piese}</span>`)).join('')) : ''}
${moduleChip.length ? rand_filtre('Modulul', moduleChip.map((m) => chip('modul', m.id, e(m.titlu), ` title="${e(m.titlu)}"`)).join('')) : ''}
<p class="filtre-nota sters">Format și energie privesc doar activitățile.</p>
<button type="button" class="sterge-filtre" id="banca-sterge" hidden>Șterge filtrele</button>
</div>
<div class="banca-lista">
${grup('Azi în agendă', deAzi, `<span class="banca-grup-timp"> · ${minAzi} min, ${Math.round((minAzi / ziua) * 100)}% din zi</span>`)}
${grup(deAzi.length ? 'Restul bibliotecii' : 'Toate piesele', rest)}
${grup('De produs (din Harvest)', deProdus, '', randDeProdus)}
<p class="banca-gol" id="banca-gol" hidden>Nicio piesă nu se potrivește. <button type="button" id="banca-gol-sterge">Șterge filtrele</button></p>
</div>
<p class="sters banca-nota">Ca să schimbi o piesă în agendă: editează „agenda” din ediție și rulează din nou build-ul. Orele se recalculează singure.</p>`;
}

/** Masa (Alex, 2026-11-18): panoul de control al cursului și prima vedere. Scheletul; rezumatul și cartonașele le face lib/masa.js
 *  din DATA.masa, ca totul să se recalculeze pe loc. Trei coloane, cele trei etape: Brainstorming, Bibliotecă, Agendă. */
function vedereaMasa(c) {
  return `<div class="banca-cap"><h2>Harvest</h2><p class="sters" id="masa-stare" role="status"></p></div>
<p class="sters masa-ajutor">Panoul de control al cursului. Fluxul: <b>Harvest → Curate → Flow</b>. Harvest: tot ce iese din Laborator (exerciții, knowledge bites, experiences). Curate: ce e suficient de actual și cu sens rămâne în Bibliotecă. Flow: firul roșu al zilei, pe blocuri.
Trage un cartonaș (pe tabletă, de mânerul ⠿) sau, pe cartonașul selectat: <kbd>D</kbd> da · <kbd>P</kbd> poate · <kbd>N</kbd> nu · <kbd>1</kbd>–<kbd>${c.blocuri.length}</kbd> în blocul ales · <kbd>0</kbd> scoate din bloc · <kbd>↑</kbd> <kbd>↓</kbd> mută în Agendă.</p>
<div class="masa-rezumat" id="masa-rezumat" aria-label="Rezumatul cursului"></div>
<p class="masa-propunere" id="masa-propunere" hidden></p>
<div class="masa-bara">
  <button type="button" id="masa-respinse" aria-pressed="false">Arată și „Nu”</button>
  <span class="masa-bara-dreapta"><button type="button" id="masa-copiaza">Copiază harvest.yml</button><button type="button" id="masa-reset" hidden>Resetează</button><button type="button" id="masa-agenda" class="principal">Trimite în agendă</button></span>
</div>
<p class="mesaj" id="masa-mesaj" role="status"></p>
<div id="masa-text-cutie" hidden><label class="eticheta" for="masa-text" id="masa-text-eticheta"></label><textarea id="masa-text" rows="8" readonly spellcheck="false"></textarea></div>
<div class="masa-coloane" id="masa-coloane"></div>`;
}

/**
 * „Prezintă” din Bibliotecă (1.12, Alex, 2026-11-17): ecranele fiecărei piese, gata de pus în prezentare chiar dacă piesa
 * nu e în agenda de azi. Aceleași ecrane ca pentru o piesă singură în agendă; id-urile au „~live” (<piesă>~live#1), ca să nu
 * se amestece cu ecranele din agendă.
 */
function bibliotecaPrezinta(c) {
  const out = {};
  for (const p of c.piese.values()) {
    const ecrane = construiesteEcrane({ ...c, agenda: [{ fel: 'piesa', piesa: p, durata: p.durata, start: null, sfarsit: null }] })
      .map(({ modul, nat, ...x }) => ({ ...x, id: x.id.replace('#', '~live#'), piesa: p.id }));
    out[p.id] = { titlu: p.titlu, tip: p.tip, durata: p.durata, ecrane };
  }
  return out;
}

/** Rândurile agendei, scrise ca în ediție (pentru „Copiază pentru ediție” cu piesele adăugate live, 1.12). */
function agendaYaml(c) {
  const q = (t) => (/^[a-z0-9-]+$/.test(t) ? t : JSON.stringify(t));
  return c.agenda.map((r) => {
    if (r.fixa) return `- bloc: ${r.bloc + 1}   # după pauza fixă de la ${ora(r.la)}`;
    if (r.fel === 'pauza') return `- pauza: ${r.durata}${r.titlu && r.titlu !== 'Pauză' ? `\n    titlu: ${JSON.stringify(r.titlu)}` : ''}`;
    if (r.fel === 'piesa') return `- ${q(r.piesa.id)}`;
    const ids = r.piese.map((x) => x.id), impl = r.modul.implicite;
    return ids.length === impl.length && ids.every((x, i) => x === impl[i]) ? `- ${q(r.modul.id)}` : `- modul: ${q(r.modul.id)}\n    piese: [${ids.map(q).join(', ')}]`;
  });
}

export function construiesteTrainer(c, ecrane = pregatesteEcrane(c).ecrane) {
  const css = readFileSync(caleTema(c.curs.brand), 'utf8') + '\n' + readFileSync(join(AICI, 'stil.css'), 'utf8');
  const script = readFileSync(join(AICI, 'prezinta.js'), 'utf8');
  const scriptMasa = readFileSync(join(AICI, 'masa.js'), 'utf8');
  const modul = vedereaModul(c);
  const date = {
    curs: { titlu: c.curs.titlu, slug: c.curs.slug, brand: c.curs.brand, marca: c.curs.marca, limba: c.curs.limba },
    editie: { data: c.editie.data, start: c.editie.start },
    // „module” = rândurile din agenda ediției (module, piese singure și pauze), în ordine, cu orele calculate.
    module: c.agenda.map((r) => ({
      id: r.fel === 'modul' ? r.modul.id : r.fel === 'piesa' ? r.piesa.id : null, titlu: titluR(r),
      tip: r.fel === 'pauza' ? 'pauza' : r.fel === 'piesa' ? r.piesa.tip : r.modul.tip, durata: r.durata, start: r.start, sfarsit: r.sfarsit, bloc: r.bloc ?? null, ...(r.fixa ? { fixa: true } : {}),
      alternative: r.fel === 'modul' ? alternativeHtml(c, r.modul, r.piese) : '',
    })),
    ecrane,
    biblioteca: bibliotecaPrezinta(c),
    agendaYaml: agendaYaml(c),
    total: { ...c.total, start: c.editie.start, ziSfarsit: c.curs.zi_sfarsit, durataZi: String(c.curs.durata_zi ?? '') },
    blocuri: c.blocuri,
    obiective: c.obiective,
    // Masa (etapa A, Alex, 2026-11-18): candidatele din masa.yml (sau propunerea, dacă fișierul lipsește). Doar în materialul trainerului.
    masa: c.masa ? { ...c.masa, fisier: c.masa.fisier ?? 'harvest.yml', editie: c.editie.fisier ?? null, data: c.editie.data } : null,
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
  <div class="bara-titlu">${marcaHtml(c.curs.marca, 'bara-marca')}<h1>${e(c.curs.titlu)} <span class="sters">${c.editie.data ? e(c.editie.data) : ''}</span></h1></div>
  <nav aria-label="Vederi">
    ${c.masa ? '<button data-vedere="masa">Harvest</button>' : ''}
    <button data-vedere="ziua">Ziua</button>
    <button data-vedere="modul">Modulul</button>
    <button data-vedere="schita">Schița</button>
    <button data-vedere="banca">Biblioteca</button>
    <button data-vedere="ecrane">Ecrane</button>
    <button data-vedere="prezinta" class="principal">Prezintă</button>
  </nav>
</header>
<main>
${marcaHtml(c.curs.marca, 'tipar-marca')}
${c.masa ? `<section id="masa" hidden>${vedereaMasa(c)}</section>` : ''}
<section id="ziua">${vedereaZiua(c)}</section>
<section id="schita" hidden><h2>Schița zilei</h2>${totalZi(c)}${blocObiective(c)}${listaSchita(c)}</section>
<section id="modul" hidden>${modul}</section>
<section id="banca" hidden>${vedereaBanca(c)}</section>
<section id="ecrane" hidden>
  <div class="banca-cap"><h2>Ecranele din sală</h2><p class="sters" id="ec-stare" role="status"></p></div>
  <div class="ec-bara">
    <p class="sters ec-ajutor">Trage o carte ca s-o muți (pe tabletă, de mâner ⠿), sau ↑ ↓; <kbd>Alt</kbd>+săgeți și <kbd>H</kbd> pe o carte selectată. Ecranele ascunse se sar la prezentare.</p>
    <div class="ec-actiuni"><button type="button" id="ec-copiaza" class="principal">Copiază pentru ediție</button><button type="button" id="ec-reset">Resetează la ordinea din curs</button></div>
  </div>
  <p class="mesaj" id="ec-mesaj" role="status"></p>
  <div id="ec-yaml-cutie" hidden><label class="eticheta" for="ec-yaml">Blocul pentru editii/${e(c.editie.fisier ?? 'ediție.yml')}</label><textarea id="ec-yaml" rows="6" readonly spellcheck="false"></textarea></div>
  <ol class="grila-ecrane" id="grila-ecrane" aria-label="Ecranele, în ordinea de prezentare"></ol>
</section>
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
      <p class="eticheta">Acum · <span id="pozitie"></span> · <span id="modul-acum"></span> <span class="live-semn" id="live-acum" hidden>adăugat live <button type="button" class="ec-mic" id="btn-scoate-live">Scoate piesa</button></span> <button type="button" class="ec-mic" id="btn-ascunde-acum">Ascunde ecranul</button></p>
      <div class="cadru" id="cadru-acum"></div>
      <div class="banda-cutie"><div class="banda" id="banda" role="group" aria-label="Ecranele zilei, după fel"></div>
        <p class="banda-legenda" aria-hidden="true"><span><span class="semn-mic fel-teorie"></span>teorie</span><span><span class="semn-mic fel-exercitiu"></span>exercițiu</span><span><span class="semn-mic fel-reflectie"></span>reflecție</span><span><span class="semn-mic fel-mesaj"></span>mesaj cheie</span><span><span class="semn-mic fel-pauza"></span>pauză</span></p></div>
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
      <div class="urmeaza"><p class="eticheta">Urmează <span class="live-semn" id="live-urm" hidden>adăugat live</span> <button type="button" class="ec-mic" id="btn-ascunde-urm">Ascunde-l</button></p><div class="cadru" id="cadru-urmeaza"></div><p class="ascunse-aici" id="ascunse-aici"></p></div>
      <div class="schita-mica" id="schita-mica"><button type="button" class="inchide-schita" id="inchide-schita">Închide schița (S / Esc)</button><p class="eticheta">Schița zilei</p>${blocObiective(c)}${listaSchita(c)}</div>
    </div>
  </div>
</section>
</main>
${c.masa ? `<dialog class="fisa-dialog" id="fisa-dialog" aria-labelledby="fisa-titlu">
  <header class="fisa-cap"><div><p class="eticheta" id="fisa-sursa"></p><h2 id="fisa-titlu"></h2></div><button type="button" class="fisa-inchide" id="fisa-inchide" aria-label="Închide fișa">×</button></header>
  <div class="fisa-corp" id="fisa-corp"></div>
</dialog>` : ''}
<div id="aici" hidden></div>
<div id="tipar-ecrane-lista"></div>
<script type="application/json" id="date-curs">${json(date)}</script>
<script type="application/json" id="imagini">${json(harta(c))}</script>
${c.masa ? `<script type="application/json" id="fise">${json(fiseleMasa(c))}</script>` : ''}
<script>${script}</script>
<script>${scriptMasa}</script>
</body>
</html>
`;
}
