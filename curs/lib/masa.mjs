// Masa (etapa A, Alex, 2026-11-18): conținutul înainte de producție. „Piesele să fie toate colectate, apoi filtrate
// (are they good enough?), apoi ordonate.” O sursă mică pe curs, `masa.yml`: o listă de piese candidate, fără text de slide.
// Vederea Masa (materialul trainerului și editorul local) o citește; „Trimite în agendă” face din blocurile ordonate agenda ediției.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, parseDocument } from 'yaml';
import { TIPURI_PIESA, ora } from './sursa.mjs';
import { hash, EroareEditor, copieIstoric } from './editor-sursa.mjs';

export const FISIER = 'harvest.yml';
// Numele vechi (până pe 2026-11-18). Un curs care are doar masa.yml merge mai departe, cu avertisment.
export const FISIER_VECHI = 'masa.yml';
/** Fișierul pe care îl citește și îl scrie cursul: harvest.yml; masa.yml doar dacă e singurul. */
export const fisierMasa = (folder) => (existsSync(join(folder, FISIER)) || !existsSync(join(folder, FISIER_VECHI)) ? FISIER : FISIER_VECHI);
export const VERDICTE = ['nou', 'da', 'poate', 'nu'];
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CAMPURI = ['id', 'titlu', 'scop', 'durata', 'tip', 'sursa', 'verdict', 'bloc', 'ordine', 'obiective', 'nota'];

/** O piesă e „produsă” când are deja fișierul ei (piese/<id>.md) sau e un modul al cursului. */
const produsa = (c, id) => c.piese.has(id) || c.module.some((m) => m.id === id);

/** Verifică și normalizează lista de candidate. Erorile opresc build-ul; restul sunt avertismente. */
export function verificaCandidate(lista, c, erori, avertismente, unde = FISIER) {
  if (!Array.isArray(lista)) { erori.push(`${unde}: „candidate” e o listă de piese candidate`); return []; }
  const vazute = new Set(), out = [], nBlocuri = c.blocuri?.length ?? 1;
  lista.forEach((x, i) => {
    const loc = `${unde}, candidata ${i + 1}${x && x.id ? ` („${x.id}”)` : ''}`;
    if (!x || typeof x !== 'object' || Array.isArray(x)) { erori.push(`${loc}: o candidată are forma { id, titlu, durata, … }`); return; }
    const id = x.id == null ? '' : String(x.id);
    if (!ID_OK.test(id)) { erori.push(`${loc}: „id” poate avea doar litere mici, cifre și cratimă (devine piese/<id>.md)`); return; }
    if (vazute.has(id)) { erori.push(`${loc}: id „${id}” apare de două ori`); return; }
    vazute.add(id);
    if (typeof x.titlu !== 'string' || !x.titlu.trim()) erori.push(`${loc}: lipsește „titlu”`);
    if (typeof x.durata !== 'number' || !Number.isFinite(x.durata) || x.durata < 0) erori.push(`${loc}: „durata” e un număr de minute`);
    const verdict = x.verdict == null || x.verdict === '' ? 'nou' : String(x.verdict);
    if (!VERDICTE.includes(verdict)) erori.push(`${loc}: verdict „${x.verdict}” necunoscut (${VERDICTE.join(' / ')})`);
    const necunoscute = Object.keys(x).filter((k) => !CAMPURI.includes(k));
    if (necunoscute.length) avertismente.push(`${loc}: câmp necunoscut („${necunoscute.join('”, „')}”); îl ignor`);
    if (x.tip != null && !TIPURI_PIESA.includes(String(x.tip))) avertismente.push(`${loc}: tip „${x.tip}” necunoscut (${TIPURI_PIESA.join(' / ')})`);
    let bloc = x.bloc == null || x.bloc === '' ? null : x.bloc;
    if (bloc != null && !(Number.isInteger(bloc) && bloc >= 1 && bloc <= nBlocuri)) {
      avertismente.push(`${loc}: bloc „${x.bloc}” nu există (ziua are ${nBlocuri} ${nBlocuri === 1 ? 'bloc' : 'blocuri'}); o arăt la Filtrate`);
      bloc = null;
    }
    if (verdict === 'nu' && bloc != null) bloc = null; // respinsă: nu stă într-un bloc
    if (x.ordine != null && typeof x.ordine !== 'number') erori.push(`${loc}: „ordine” e un număr`);
    if (x.obiective != null && !(Array.isArray(x.obiective) && x.obiective.every((n) => Number.isInteger(n) && n > 0))) erori.push(`${loc}: „obiective” e o listă de numere, de exemplu [1, 3]`);
    out.push({
      id, titlu: String(x.titlu ?? id), scop: x.scop == null ? '' : String(x.scop), durata: typeof x.durata === 'number' ? x.durata : 0,
      tip: x.tip == null ? '' : String(x.tip), sursa: x.sursa == null ? '' : String(x.sursa), verdict: VERDICTE.includes(verdict) ? verdict : 'nou',
      bloc, ordine: typeof x.ordine === 'number' ? x.ordine : null, obiective: Array.isArray(x.obiective) ? x.obiective : [],
      nota: x.nota == null ? '' : String(x.nota), produsa: produsa(c, id),
    });
  });
  return out;
}

/** Citește masa.yml. Lipsa fișierului nu e eroare: întoarce o propunere din agenda și biblioteca de azi (nesalvată). */
export function citesteMasa(c, erori, avertismente) {
  const fisier = fisierMasa(c.folder), cale = join(c.folder, fisier);
  if (fisier === FISIER_VECHI) avertismente.push(`${FISIER_VECHI}: redenumește masa.yml în ${FISIER} (vederea se numește Harvest din 2026-11-18). Îl citesc mai departe până atunci`);
  else if (existsSync(join(c.folder, FISIER_VECHI))) avertismente.push(`${FISIER_VECHI}: cursul are și ${FISIER}, deci îl ignor. Șterge-l după ce verifici că nu mai ai nevoie de el`);
  if (!existsSync(cale)) return { exista: false, propunere: true, hash: null, fisier, candidate: propunere(c) };
  const text = readFileSync(cale, 'utf8');
  let v;
  try { v = parseYaml(text) ?? {}; } catch (e) { erori.push(`${fisier}: YAML greșit (${e.message.split('\n')[0]})`); return { exista: true, propunere: false, hash: hash(text), fisier, candidate: [] }; }
  if (typeof v !== 'object' || Array.isArray(v)) { erori.push(`${fisier}: are forma „candidate: [ … ]”`); return { exista: true, propunere: false, hash: hash(text), fisier, candidate: [] }; }
  return { exista: true, propunere: false, hash: hash(text), fisier, candidate: completeaza(verificaCandidate(v.candidate ?? [], c, erori, avertismente, fisier), c) };
}

/** Obiectivele din fișierul piesei sau al modulului (pentru rezumat; nu se scriu în masa.yml). */
function obiectiveDin(c, id) {
  const f = c.piese.get(id) ?? c.module.find((m) => m.id === id);
  return f?.obiective ?? [];
}
/**
 * Fluxul (Alex, 2026-11-18): Masa → Biblioteca → Agenda, o singură listă. Piesele care au deja fișier în piese/, dar nu sunt
 * pe masă (piesele vechi), apar pe masă cu „da”, adică în Bibliotecă. Sunt „virtuale”: intră în masa.yml abia când le schimbi
 * ceva în editor (sau cu „Copiază masa.yml”). Pauzele nu sunt candidate.
 */
export function completeaza(candidate, c) {
  const are = new Set(candidate.map((x) => x.id));
  const out = candidate.map((x) => ({ ...x, obFisier: obiectiveDin(c, x.id) }));
  for (const p of c.piese.values()) {
    if (are.has(p.id) || p.tip === 'pauza') continue;
    out.push({ id: p.id, titlu: p.titlu, scop: p.obiectiv || p.ancora || '', durata: p.durata, tip: p.tip, sursa: 'bibliotecă', verdict: 'da', bloc: null, ordine: null, obiective: [], nota: '', produsa: true, virtuala: true, obFisier: p.obiective ?? [] });
  }
  return out;
}

/** Propunerea de pornire: ce e azi în agendă (da, cu blocul și ordinea lui), apoi restul bibliotecii (da, fără bloc: e în Bibliotecă).
 *  Piesele alese într-un modul vin cu modulul; pauzele (rânduri sau piese) nu sunt candidate. */
export function propunere(c) {
  const out = [], pus = new Set(), ordine = new Map();
  for (const r of c.agenda) {
    if (r.fel !== 'modul' && r.fel !== 'piesa') continue;
    const f = r.fel === 'modul' ? r.modul : r.piesa;
    if (r.fel === 'modul') r.piese.forEach((x) => pus.add(x.id)); // piesele din modul vin cu el, nu sunt candidate separate
    if (f.tip === 'pauza' || pus.has(f.id)) continue;
    pus.add(f.id);
    const n = (ordine.get(r.bloc) ?? 0) + 1; ordine.set(r.bloc, n);
    out.push({ id: f.id, titlu: f.titlu, scop: f.ancora || f.obiectiv || '', durata: r.durata, tip: f.tip, sursa: 'curs', verdict: 'da', bloc: r.bloc, ordine: n, obiective: f.obiective ?? [], nota: '', produsa: true });
  }
  for (const p of c.piese.values()) {
    if (out.some((x) => x.id === p.id) || p.tip === 'pauza') continue; // și piesele din module: sunt în Bibliotecă
    out.push({ id: p.id, titlu: p.titlu, scop: p.obiectiv || p.ancora || '', durata: p.durata, tip: p.tip, sursa: 'bibliotecă', verdict: 'da', bloc: null, ordine: null, obiective: p.obiective ?? [], nota: '', produsa: true });
  }
  return out.map((x) => ({ ...x, obFisier: obiectiveDin(c, x.id) }));
}

const q = (t) => (/^[\p{L}\p{N} .,;()–-]*$/u.test(t) && !/^[\s-]|\s$|^(da|nu|true|false|null|yes|no)$/i.test(t) && t !== '' && !/^\d/.test(t) ? t : JSON.stringify(t));
/** masa.yml scris de la zero (propunerea de pornire, „Copiază masa.yml”). Același format îl scrie și vederea din browser. */
export function textMasa(candidate) {
  const linii = ['# Harvest (etapa C): piesele candidate, înainte de producție. Vederea „Harvest” din materialul trainerului le alege (Curate) și le ordonează (Flow).',
    '# verdict: nou / da / poate / nu · bloc: 1, 2, 3… (blocurile dintre pauzele fixe) sau gol · fără text de slide aici.', 'candidate:'];
  for (const x of candidate) {
    linii.push(`  - id: ${x.id}`, `    titlu: ${q(x.titlu)}`);
    if (x.scop) linii.push(`    scop: ${q(x.scop)}`);
    linii.push(`    durata: ${x.durata}`);
    if (x.tip) linii.push(`    tip: ${x.tip}`);
    if (x.sursa) linii.push(`    sursa: ${q(x.sursa)}`);
    linii.push(`    verdict: ${x.verdict}`);
    if (x.bloc != null) linii.push(`    bloc: ${x.bloc}`);
    if (x.ordine != null && x.bloc != null) linii.push(`    ordine: ${x.ordine}`);
    if (x.obiective?.length) linii.push(`    obiective: [${x.obiective.join(', ')}]`);
    if (x.nota) linii.push(`    nota: ${q(x.nota)}`);
  }
  return linii.join('\n') + '\n';
}

/** Ordonatele, bloc cu bloc, în ordinea lor. */
export function ordonate(candidate) {
  return candidate.map((x, i) => ({ x, i })).filter(({ x }) => x.bloc != null && x.verdict !== 'nu')
    .sort((a, b) => a.x.bloc - b.x.bloc || (a.x.ordine ?? 1e9) - (b.x.ordine ?? 1e9) || a.i - b.i).map(({ x }) => x);
}

/**
 * „Trimite în agendă”: piesele cu „da” care au fișier produs intră în agendă, bloc cu bloc („- bloc: N” între blocuri);
 * celelalte din blocuri sunt listate: „de produs” (da, fără fișier) și „nehotărâte” (poate).
 */
export function agendaDinMasa(candidate, blocuri = []) {
  const linii = [], deProdus = [], nehotarate = [];
  let bloc = 1;
  for (const x of ordonate(candidate)) {
    if (x.verdict === 'poate') { nehotarate.push(x); continue; }
    if (!x.produsa) { deProdus.push(x); continue; }
    if (x.bloc > bloc) {
      const p = blocuri[x.bloc - 2]?.pauzaDupa;
      linii.push(`- bloc: ${x.bloc}${p ? `   # după pauza de la ${ora(p.la)}` : ''}`);
      bloc = x.bloc;
    }
    linii.push(`- ${x.id}`);
  }
  return { linii, deProdus, nehotarate };
}

/** Blocul YAML al agendei, gata de lipit în ediție. */
export const textAgenda = (linii, data) => `agenda:                 # din Masa${data ? `, ${data}` : ''}\n${linii.map((l) => `  ${l}`).join('\n')}\n`;

/**
 * Înlocuiește doar cheia „agenda:” din textul ediției (sau o adaugă la final); restul fișierului rămâne identic.
 * Verifică rezultatul: agenda nouă e cea cerută, iar celelalte câmpuri n-au fost atinse.
 */
export function inlocuiesteAgenda(text, bloc) {
  const crlf = text.includes('\r\n');
  const linii = text.replace(/\r\n?/g, '\n').split('\n');
  const i = linii.findIndex((l) => /^agenda\s*:/.test(l));
  let nou;
  if (i < 0) {
    while (linii.length && linii.at(-1) === '') linii.pop();
    nou = [...linii, '', ...bloc.replace(/\n$/, '').split('\n'), ''];
  } else {
    let j = i + 1;
    while (j < linii.length && (linii[j].trim() === '' || /^[\s-]/.test(linii[j]))) j++;
    while (j - 1 > i && linii[j - 1].trim() === '') j--;
    nou = [...linii.slice(0, i), ...bloc.replace(/\n$/, '').split('\n'), ...linii.slice(j)];
  }
  let rezultat = nou.join('\n');
  const vechi = parseYaml(text) ?? {}, dupa = parseYaml(rezultat) ?? {}, cerut = parseYaml(bloc).agenda;
  const alte = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).filter(([k]) => k !== 'agenda')));
  if (JSON.stringify(dupa.agenda) !== JSON.stringify(cerut) || alte(vechi) !== alte(dupa)) {
    throw new EroareEditor('Nu pot înlocui agenda fără să ating restul ediției (are o formă neobișnuită). Folosește „Copiază agenda” și lipește-o de mână.', 422);
  }
  if (crlf) rezultat = rezultat.replace(/\n/g, '\r\n');
  return rezultat;
}

/**
 * Editorul local: aplică schimbările (verdict, bloc, ordine) în masa.yml, păstrând comentariile și restul câmpurilor.
 * Verificare de concurență (hash), copie în .editor-istoric/, validare înainte de scriere.
 */
export function scrieMasa(c, schimbari, hashCitit) {
  const fisier = fisierMasa(c.folder), cale = join(c.folder, fisier);
  if (!existsSync(cale)) throw new EroareEditor(`Cursul nu are încă ${FISIER}. Apasă întâi „Creează ${FISIER}”.`, 404);
  const inainte = readFileSync(cale, 'utf8');
  if (!hashCitit || hash(inainte) !== hashCitit) throw new EroareEditor(`${fisier} s-a schimbat pe disc între timp. Nu l-am suprascris: reîncarcă pagina.`, 409);
  if (!Array.isArray(schimbari) || !schimbari.length) return { hash: hashCitit, neschimbat: true, fisier };
  const doc = parseDocument(inainte);
  const lista = doc.get('candidate');
  if (!lista || !Array.isArray(lista.items)) throw new EroareEditor(`${fisier} nu are lista „candidate”.`, 422);
  for (const s of schimbari) {
    let item = lista.items.find((n) => n && typeof n.get === 'function' && String(n.get('id')) === String(s?.id));
    if (!item) {
      // O piesă din Bibliotecă care nu era încă pe masă (virtuală): intră acum în masa.yml, la final.
      const p = c.piese.get(String(s?.id));
      if (!p || p.tip === 'pauza') throw new EroareEditor(`nu găsesc candidata „${s?.id}” în ${fisier}`, 404);
      item = doc.createNode({ id: p.id, titlu: p.titlu, ...(p.obiectiv || p.ancora ? { scop: p.obiectiv || p.ancora } : {}), durata: p.durata, tip: p.tip, sursa: 'bibliotecă', verdict: 'da' });
      lista.items.push(item);
    }
    if ('verdict' in s) { if (!VERDICTE.includes(s.verdict)) throw new EroareEditor(`verdict „${s.verdict}” necunoscut`); item.set('verdict', s.verdict); }
    if ('bloc' in s) { if (s.bloc == null) item.delete('bloc'); else if (Number.isInteger(s.bloc) && s.bloc > 0) item.set('bloc', s.bloc); else throw new EroareEditor(`bloc „${s.bloc}” greșit`); }
    if ('ordine' in s) { if (s.ordine == null) item.delete('ordine'); else if (Number.isInteger(s.ordine) && s.ordine > 0) item.set('ordine', s.ordine); else throw new EroareEditor(`ordine „${s.ordine}” greșită`); }
  }
  const dupa = doc.toString({ lineWidth: 0 });
  const erori = [];
  verificaCandidate(parseYaml(dupa)?.candidate ?? [], c, erori, []);
  if (erori.length) throw new EroareEditor(erori.join('; '), 422);
  const copie = copieIstoric(c.folder, fisier);
  writeFileSync(cale, dupa);
  return { hash: hash(dupa), inainte, copie, fisier };
}
