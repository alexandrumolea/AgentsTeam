// Masa (etapa A, Alex, 2026-11-18): conținutul înainte de producție. „Piesele să fie toate colectate, apoi filtrate
// (are they good enough?), apoi ordonate.” O sursă mică pe curs, `masa.yml`: o listă de piese candidate, fără text de slide.
// Vederea Masa (materialul trainerului și editorul local) o citește; „Trimite în agendă” face din blocurile ordonate agenda ediției.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, parseDocument } from 'yaml';
import { TIPURI_PIESA, ora } from './sursa.mjs';
import { hash, EroareEditor, copieIstoric } from './editor-sursa.mjs';
import { referinte, indexZi, idDin, FISIER_OB } from './obiective.mjs';

export const FISIER = 'harvest.yml';
// Numele vechi (până pe 2026-11-18). Un curs care are doar masa.yml merge mai departe, cu avertisment.
export const FISIER_VECHI = 'masa.yml';
/** Fișierul pe care îl citește și îl scrie cursul: harvest.yml; masa.yml doar dacă e singurul. */
export const fisierMasa = (folder) => (existsSync(join(folder, FISIER)) || !existsSync(join(folder, FISIER_VECHI)) ? FISIER : FISIER_VECHI);
export const VERDICTE = ['nou', 'da', 'poate', 'nu'];
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CAMPURI = ['id', 'titlu', 'scop', 'durata', 'tip', 'sursa', 'verdict', 'bloc', 'ordine', 'obiective', 'nota', 'din', 'baza'];
// Legătura cu biblioteca core (2026-11-20): din = comun/<id>, baza = amprenta versiunii luate (8 caractere hex). Vezi lib/core.mjs.
const DIN_OK = /^comun\/[a-z0-9]+(-[a-z0-9]+)*$/, BAZA_OK = /^[0-9a-f]{8}$/;
/** Câmpurile rândului care se editează din fișa piesei (Alex, 2026-11-20). „obiective”: bifele cu obiectivele, ca id-uri. */
export const CAMPURI_FISA = ['titlu', 'scop', 'durata', 'tip', 'obiective'];

/** Verifică titlu / scop / durata / tip venite din editor (doar cele prezente). Întoarce valorile curățate. */
export function verificaCampuri(s) {
  const v = {};
  if ('titlu' in s) {
    const t = String(s.titlu ?? '').trim();
    if (!t) throw new EroareEditor('Titlul nu poate rămâne gol.');
    if (t.length > 200 || /[\r\n\0]/.test(t)) throw new EroareEditor('Titlul e un singur rând, de cel mult 200 de caractere.');
    v.titlu = t;
  }
  if ('scop' in s) {
    const t = String(s.scop ?? '').trim();
    if (t.length > 600 || /[\r\n\0]/.test(t)) throw new EroareEditor('Obiectivul piesei e un singur rând, de cel mult 600 de caractere.');
    v.scop = t;
  }
  if ('durata' in s) {
    const n = typeof s.durata === 'string' && /^\d+$/.test(s.durata.trim()) ? +s.durata : s.durata;
    if (!Number.isInteger(n) || n < 0 || n > 600) throw new EroareEditor('Durata e un număr întreg de minute, între 0 și 600.');
    v.durata = n;
  }
  if ('tip' in s) {
    const t = String(s.tip ?? '').trim();
    if (t && !TIPURI_PIESA.includes(t)) throw new EroareEditor(`tip „${t.slice(0, 40)}” necunoscut (${TIPURI_PIESA.join(' / ')})`);
    v.tip = t;
  }
  if ('obiective' in s) {
    const l = s.obiective == null ? [] : s.obiective;
    if (!Array.isArray(l) || l.length > 30 || !l.every((x) => typeof x === 'string' && ID_OK.test(x))) throw new EroareEditor('Obiectivele piesei sunt o listă de id-uri de obiective.');
    v.obiective = [...new Set(l)];
  }
  return v;
}

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
    const din = x.din == null || x.din === '' ? null : String(x.din), baza = x.baza == null || x.baza === '' ? null : String(x.baza);
    if (din != null && !DIN_OK.test(din)) avertismente.push(`${loc}: „din” e de forma comun/<id> (biblioteca core); „${din.slice(0, 60)}” nu e`);
    if (baza != null && din == null) erori.push(`${loc}: „baza” fără „din”: scoate-o sau pune și legătura comun/<id>`);
    else if (baza != null && !BAZA_OK.test(baza)) erori.push(`${loc}: „baza” e amprenta din core, 8 caractere 0-9a-f`);
    const refs = referinte(x.obiective);
    if (refs == null) erori.push(`${loc}: „obiective” e o listă de id-uri de obiective (din ${FISIER_OB}) sau de numere, de exemplu [obiectiv-1] sau [1, 3]`);
    out.push({
      id, titlu: String(x.titlu ?? id), scop: x.scop == null ? '' : String(x.scop), durata: typeof x.durata === 'number' ? x.durata : 0,
      tip: x.tip == null ? '' : String(x.tip), sursa: x.sursa == null ? '' : String(x.sursa), verdict: VERDICTE.includes(verdict) ? verdict : 'nou',
      bloc, ordine: typeof x.ordine === 'number' ? x.ordine : null, obiective: refs ?? [],
      nota: x.nota == null ? '' : String(x.nota), produsa: produsa(c, id),
      ...(din != null && DIN_OK.test(din) ? { din, baza } : {}),
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
  const candidate = completeaza(verificaCandidate(v.candidate ?? [], c, erori, avertismente, fisier), c);
  if (c.harvestObiective) {
    const numerice = candidate.filter((x) => x.obiective.some(Number.isInteger)).length;
    const prim = c.obiectiveZi?.[0]?.id;
    if (numerice) avertismente.push(`${fisier}: ${numerice} ${numerice === 1 ? 'piesă leagă' : 'piese leagă'} obiectivele prin număr (obiective: [1]). Merge mai departe (1 = primul obiectiv cu „da”${prim ? `, adică ${prim}` : ''}), dar numărul se mută când schimbi verdictele: bifează obiectivele din fișa piesei sau scrie obiective: [${prim ?? 'obiectiv-1'}]`);
    const ids = new Set(c.harvestObiective.obiective.map((o) => o.id));
    for (const x of candidate) for (const r of x.obiective) if (typeof r === 'string' && !ids.has(r)) avertismente.push(`${fisier}, „${x.id}”: obiectivul „${r}” nu există în ${FISIER_OB}; îl ignor`);
  }
  return { exista: true, propunere: false, hash: hash(text), fisier, candidate };
}

/** Obiectivele din fișierul piesei sau al modulului (legăturile scrise acolo, ca în fișier; nu se scriu în harvest.yml). */
function obiectiveDin(c, id) {
  const f = c.piese.get(id) ?? c.module.find((m) => m.id === id);
  return f?.obiectiveRef ?? f?.obiective ?? [];
}
/**
 * Legăturile unei candidate cu obiectivele (2026-11-20): obIds = id-urile obiectivelor servite (din rând, din fișierul piesei
 * și din lista „piese” a obiectivului), obZi = indexurile în obiectivele zilei (pentru rezumat). Numerele vechi: 1 = primul „da”.
 */
function cuLegaturi(x, c) {
  const zi = c.obiectiveZi ?? [], ho = c.harvestObiective;
  const refs = [...(x.obiective ?? []), ...(x.obFisier ?? [])];
  const ids = new Set(refs.map((r) => idDin(r, zi)).filter(Boolean));
  for (const o of ho?.obiective ?? []) if (o.piese.includes(x.id)) ids.add(o.id);
  const k = new Set(refs.map((r) => indexZi(r, zi, ho)).filter(Boolean));
  for (const id of ids) { const n = indexZi(id, zi, ho); if (n) k.add(n); }
  return { ...x, obIds: [...ids], obZi: [...k].sort((a, b) => a - b) };
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
    out.push({ id: p.id, titlu: p.titlu, scop: p.obiectiv || p.ancora || '', durata: p.durata, tip: p.tip, sursa: 'bibliotecă', verdict: 'da', bloc: null, ordine: null, obiective: [], nota: '', produsa: true, virtuala: true, obFisier: obiectiveDin(c, p.id) });
  }
  return out.map((x) => cuLegaturi(x, c));
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
    out.push({ id: f.id, titlu: f.titlu, scop: f.ancora || f.obiectiv || '', durata: r.durata, tip: f.tip, sursa: 'curs', verdict: 'da', bloc: r.bloc, ordine: n, obiective: f.obiectiveRef ?? f.obiective ?? [], nota: '', produsa: true });
  }
  for (const p of c.piese.values()) {
    if (out.some((x) => x.id === p.id) || p.tip === 'pauza') continue; // și piesele din module: sunt în Bibliotecă
    out.push({ id: p.id, titlu: p.titlu, scop: p.obiectiv || p.ancora || '', durata: p.durata, tip: p.tip, sursa: 'bibliotecă', verdict: 'da', bloc: null, ordine: null, obiective: p.obiectiveRef ?? p.obiective ?? [], nota: '', produsa: true });
  }
  return out.map((x) => cuLegaturi({ ...x, obFisier: obiectiveDin(c, x.id) }, c));
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
    // Câmpurile rândului, din fișa piesei (2026-11-20): titlu, scop, durata, tip. Un scop sau un tip gol se scoate din rând.
    const v = verificaCampuri(s);
    for (const k of CAMPURI_FISA) {
      if (!(k in v)) continue;
      if (k === 'obiective') { if (!v.obiective.length) item.delete(k); else { const n = doc.createNode(v.obiective); n.flow = true; item.set(k, n); } continue; }
      if (v[k] === '') item.delete(k); else item.set(k, v[k]);
    }
    // Legătura cu core (2026-11-20): null o scoate (Dezleagă de core).
    for (const k of ['din', 'baza']) if (k in s) { if (s[k] == null) item.delete(k); else if ((k === 'din' ? DIN_OK : BAZA_OK).test(String(s[k]))) item.set(k, String(s[k])); else throw new EroareEditor(`${k} „${String(s[k]).slice(0, 40)}” greșit`); }
  }
  const dupa = doc.toString({ lineWidth: 0 });
  const erori = [];
  verificaCandidate(parseYaml(dupa)?.candidate ?? [], c, erori, []);
  if (erori.length) throw new EroareEditor(erori.join('; '), 422);
  const copie = copieIstoric(c.folder, fisier);
  writeFileSync(cale, dupa);
  return { hash: hash(dupa), inainte, copie, fisier };
}

/** „Piesă nouă” (Alex, 2026-11-20): un rând nou la finalul listei, cu verdict „nou”. Păstrează comentariile; validează înainte. */
export function adaugaCandidata(c, rand, hashCitit) {
  const fisier = fisierMasa(c.folder), cale = join(c.folder, fisier);
  if (!existsSync(cale)) throw new EroareEditor(`Cursul nu are încă ${FISIER}. Apasă întâi „Creează ${FISIER}”.`, 404);
  const inainte = readFileSync(cale, 'utf8');
  if (hashCitit != null && hash(inainte) !== hashCitit) throw new EroareEditor(`${fisier} s-a schimbat pe disc între timp. Nu l-am suprascris: reîncarcă pagina.`, 409);
  if (!ID_OK.test(String(rand.id ?? ''))) throw new EroareEditor(`id greșit: „${String(rand.id).slice(0, 60)}”`);
  const v = verificaCampuri({ titlu: rand.titlu, scop: rand.scop, durata: rand.durata, tip: rand.tip });
  const doc = parseDocument(inainte);
  let lista = doc.get('candidate');
  if (lista == null) { doc.set('candidate', doc.createNode([])); lista = doc.get('candidate'); }
  if (!Array.isArray(lista.items)) throw new EroareEditor(`${fisier} nu are lista „candidate”.`, 422);
  if (lista.items.some((n) => n && typeof n.get === 'function' && String(n.get('id')) === rand.id)) throw new EroareEditor(`id „${rand.id}” există deja în ${fisier}`, 409);
  if (rand.din != null && !(DIN_OK.test(rand.din) && BAZA_OK.test(String(rand.baza ?? '')))) throw new EroareEditor('legătura cu core e greșită');
  lista.items.push(doc.createNode({ id: rand.id, titlu: v.titlu, ...(v.scop ? { scop: v.scop } : {}), durata: v.durata, ...(v.tip ? { tip: v.tip } : {}), sursa: rand.sursa || 'Alex', verdict: 'nou',
    ...(rand.din != null ? { din: rand.din, baza: String(rand.baza) } : {}) }));
  const dupa = doc.toString({ lineWidth: 0 });
  const erori = [];
  verificaCandidate(parseYaml(dupa)?.candidate ?? [], c, erori, []);
  if (erori.length) throw new EroareEditor(erori.join('; '), 422);
  const copie = copieIstoric(c.folder, fisier);
  writeFileSync(cale, dupa);
  return { hash: hash(dupa), inainte, copie, fisier };
}
