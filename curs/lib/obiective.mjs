// Harvest de obiective (Alex, 2026-11-20): „Aș vrea să facem harvest și de obiective. Acestea nu au timp alocat.”
// Sursa: harvest-obiective.yml în folderul cursului (viziune + listă de obiective cu verdict), fișele în harvest/obiective/<id>.md.
// Obiectivele cu „da”, în ordinea din fișier, sunt obiectivele zilei (Schița, rezumatul, cursul participanților).
// Fără fișier: curs.yml „obiective” (rezervă, ca la exemple). Ediția le poate înlocui, ca înainte.
// Legătura piesă → obiectiv: `obiective: [obiectiv-1, …]` (id-uri). Numerele vechi rămân valide: 1 = primul obiectiv cu „da”.
// Obiectivul blocului (Alex, 2026-11-20): `bloc: N` opțional pe rândul unui obiectiv cu „da” = stă în Blocul N din Flow, nu în cutia zilei.
// Rămâne obiectiv al zilei (numărul, limita de 4, legăturile nu se schimbă); Schița și cursul participanților ignoră câmpul.
// Modulul ăsta nu importă nimic din curs/lib (sursa.mjs îl citește), ca să nu facă cicluri.
import { readFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml, parseDocument } from 'yaml';
import { hash, EroareEditor, copieIstoric } from './editor-sursa.mjs';

export const FISIER_OB = 'harvest-obiective.yml';
export const DOSAR_OB = 'harvest/obiective';
export const MAX_OB = 4; // docs/procese/curs-nou.md, pasul 3: în curs rămân cel mult 4
export const VERDICTE_OB = ['nou', 'da', 'poate', 'nu'];
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const CAMPURI = ['id', 'text', 'sursa', 'verdict', 'piese', 'nota', 'bloc'];
const MAX_TEXT = 400;

const unRand = (t, ce, max = MAX_TEXT) => {
  const s = String(t ?? '').trim();
  if (!s) throw new EroareEditor(`${ce} nu poate rămâne gol.`);
  if (s.length > max || /[\r\n\0]/.test(s)) throw new EroareEditor(`${ce} e un singur rând, de cel mult ${max} de caractere.`);
  return s;
};

/** Verifică conținutul (deja citit ca YAML). Întoarce { viziune, obiective }; erorile opresc build-ul, restul sunt avertismente. */
export function verificaObiective(v, erori, avertismente, unde = FISIER_OB) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) { erori.push(`${unde}: are forma „viziune: …” și „obiective: [ … ]”`); return { viziune: null, obiective: [] }; }
  let viziune = null;
  if (v.viziune != null) {
    const z = typeof v.viziune === 'string' ? { text: v.viziune } : v.viziune;
    if (typeof z !== 'object' || Array.isArray(z) || typeof z.text !== 'string') erori.push(`${unde}: „viziune” are forma { text, sursa, stare }`);
    else viziune = { text: z.text.trim(), sursa: z.sursa == null ? '' : String(z.sursa), stare: z.stare == null ? 'propunere' : String(z.stare) };
  }
  const lista = v.obiective ?? [];
  if (!Array.isArray(lista)) { erori.push(`${unde}: „obiective” e o listă`); return { viziune, obiective: [] }; }
  const vazute = new Set(), obiective = [];
  lista.forEach((x, i) => {
    const loc = `${unde}, obiectivul ${i + 1}${x && x.id ? ` („${x.id}”)` : ''}`;
    if (!x || typeof x !== 'object' || Array.isArray(x)) { erori.push(`${loc}: un obiectiv are forma { id, text, verdict, … }`); return; }
    const id = x.id == null ? '' : String(x.id);
    if (!ID_OK.test(id)) { erori.push(`${loc}: „id” poate avea doar litere mici, cifre și cratimă (devine harvest/obiective/<id>.md)`); return; }
    if (vazute.has(id)) { erori.push(`${loc}: id „${id}” apare de două ori`); return; }
    vazute.add(id);
    if (typeof x.text !== 'string' || !x.text.trim()) erori.push(`${loc}: lipsește „text”`);
    const verdict = x.verdict == null || x.verdict === '' ? 'nou' : String(x.verdict);
    if (!VERDICTE_OB.includes(verdict)) erori.push(`${loc}: verdict „${x.verdict}” necunoscut (${VERDICTE_OB.join(' / ')})`);
    const necunoscute = Object.keys(x).filter((k) => !CAMPURI.includes(k));
    if (necunoscute.length) avertismente.push(`${loc}: câmp necunoscut („${necunoscute.join('”, „')}”); îl ignor`);
    let piese = x.piese == null ? [] : Array.isArray(x.piese) ? x.piese.map(String) : null;
    if (piese == null) { erori.push(`${loc}: „piese” e o listă de id-uri, de exemplu [ contract, curba ]`); piese = []; }
    const rele = piese.filter((p) => !ID_OK.test(p));
    if (rele.length) avertismente.push(`${loc}: „piese” are id-uri greșite (${rele.join(', ')}); le ignor`);
    let bloc = null;
    if (x.bloc != null && x.bloc !== '') {
      if (!Number.isInteger(x.bloc) || x.bloc < 1) erori.push(`${loc}: „bloc” e numărul blocului din Flow (1, 2, 3…) sau lipsește (= în cutia zilei)`);
      else if (verdict !== 'da') avertismente.push(`${loc}: „bloc” contează doar la verdict „da”; îl ignor`);
      else bloc = x.bloc;
    }
    obiective.push({ id, text: typeof x.text === 'string' ? x.text.trim() : id, sursa: x.sursa == null ? '' : String(x.sursa),
      verdict: VERDICTE_OB.includes(verdict) ? verdict : 'nou', piese: piese.filter((p) => ID_OK.test(p)), nota: x.nota == null ? '' : String(x.nota), bloc });
  });
  return { viziune, obiective };
}

/** harvest-obiective.yml citit de pe disc; null dacă fișierul nu există (cursul folosește curs.yml). */
export function citesteObiectiveHarvest(folder, erori, avertismente) {
  const cale = join(folder, FISIER_OB);
  if (!existsSync(cale)) return null;
  const text = readFileSync(cale, 'utf8');
  let v;
  try { v = parseYaml(text) ?? {}; } catch (e) { erori.push(`${FISIER_OB}: YAML greșit (${e.message.split('\n')[0]})`); return { exista: true, fisier: FISIER_OB, hash: hash(text), viziune: null, obiective: [] }; }
  return { exista: true, fisier: FISIER_OB, hash: hash(text), ...verificaObiective(v, erori, avertismente) };
}

/** Lista legăturilor: numere (indexuri în obiectivele zilei, de la 1) sau id-uri. null = formă greșită. */
export function referinte(v) {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || !v.every((n) => (Number.isInteger(n) && n > 0) || (typeof n === 'string' && ID_OK.test(n)))) return null;
  return v;
}

/**
 * Rezolvarea unei legături față de obiectivele zilei (`zi` = [{ id, text }]) și harvest-ul de obiective (`ho`).
 * Întoarce indexul de la 1 în obiectivele zilei, sau 0 (obiectivul există, dar nu e azi în zi / nu există deloc).
 * Un id găsește obiectivul după id; dacă ziua vine din ediție (fără id-uri), după textul lui din harvest.
 */
export function indexZi(ref, zi, ho) {
  if (Number.isInteger(ref)) return ref <= zi.length ? ref : 0;
  const k = zi.findIndex((o) => o.id === ref);
  if (k >= 0) return k + 1;
  const o = ho?.obiective.find((x) => x.id === ref);
  const t = o ? zi.findIndex((z) => z.text === o.text) : -1;
  return t >= 0 ? t + 1 : 0;
}
/** Id-ul unei legături: un id rămâne id; un număr devine id-ul obiectivului zilei de pe acel loc (dacă are). */
export const idDin = (ref, zi) => (Number.isInteger(ref) ? zi[ref - 1]?.id ?? null : ref);

// ---------- scrierea, din editorul local ----------
function citesteDoc(folder, hashCitit) {
  const cale = join(folder, FISIER_OB);
  if (!existsSync(cale)) throw new EroareEditor(`Cursul nu are încă ${FISIER_OB}. Apasă întâi „Creează ${FISIER_OB}”.`, 404);
  const inainte = readFileSync(cale, 'utf8');
  if (!hashCitit || hash(inainte) !== hashCitit) throw new EroareEditor(`${FISIER_OB} s-a schimbat pe disc între timp (probabil un agent). Nu l-am suprascris: reîncarcă pagina.`, 409);
  const doc = parseDocument(inainte);
  if (doc.errors?.length) throw new EroareEditor(`${FISIER_OB}: YAML greșit`, 422);
  return { cale, inainte, doc };
}
function scrieDoc(folder, cale, inainte, doc) {
  const dupa = doc.toString({ lineWidth: 0 });
  if (dupa === inainte) return { hash: hash(dupa), inainte, copie: null, fisier: FISIER_OB, neschimbat: true };
  const erori = [];
  verificaObiective(parseYaml(dupa) ?? {}, erori, []);
  if (erori.length) throw new EroareEditor(erori.join('; '), 422);
  const copie = copieIstoric(folder, FISIER_OB);
  writeFileSync(cale, dupa);
  return { hash: hash(dupa), inainte, copie, fisier: FISIER_OB };
}
const gaseste = (lista, id) => lista.items.find((n) => n && typeof n.get === 'function' && String(n.get('id')) === String(id));

/**
 * Schimbările din vederea Harvest: [{ id, verdict?, text?, bloc?, inainteDe? | dupa?, scoatePiesa? }] și/sau viziune (textul nou).
 * bloc: N = obiectivul blocului N; null = în cutia zilei. Un verdict care nu e „da” scoate și blocul.
 * Păstrează comentariile și restul câmpurilor; conflict (409) dacă fișierul s-a schimbat pe disc.
 */
export function scrieObiective(folder, { schimbari = [], viziune } = {}, hashCitit) {
  const { cale, inainte, doc } = citesteDoc(folder, hashCitit);
  if (!Array.isArray(schimbari)) throw new EroareEditor('„schimbari” e o listă');
  const lista = doc.get('obiective');
  if (schimbari.length && (!lista || !Array.isArray(lista.items))) throw new EroareEditor(`${FISIER_OB} nu are lista „obiective”.`, 422);
  for (const s of schimbari) {
    const item = gaseste(lista, s?.id);
    if (!item) throw new EroareEditor(`nu găsesc obiectivul „${String(s?.id).slice(0, 60)}” în ${FISIER_OB}`, 404);
    if ('verdict' in s) { if (!VERDICTE_OB.includes(s.verdict)) throw new EroareEditor(`verdict „${String(s.verdict).slice(0, 20)}” necunoscut`); item.set('verdict', s.verdict); }
    if ('bloc' in s) {
      if (s.bloc == null) item.delete('bloc');
      else if (Number.isInteger(s.bloc) && s.bloc >= 1 && s.bloc <= 20) item.set('bloc', s.bloc);
      else throw new EroareEditor(`bloc „${String(s.bloc).slice(0, 10)}” greșit (1, 2, 3… sau null = cutia zilei)`);
    }
    if (String(item.get('verdict') ?? '') !== 'da' && item.has('bloc')) item.delete('bloc');
    if ('text' in s) item.set('text', unRand(s.text, 'Textul obiectivului'));
    // Ordinea zilei = ordinea din fișier (Obiectivele zilei din Flow, 2026-11-20): mută rândul înaintea / după alt obiectiv.
    if (s.inainteDe != null || s.dupa != null) {
      const ref = s.inainteDe != null ? s.inainteDe : s.dupa, tinta = gaseste(lista, ref);
      if (!tinta) throw new EroareEditor(`nu găsesc obiectivul „${String(ref).slice(0, 60)}” în ${FISIER_OB}`, 404);
      if (tinta !== item) {
        lista.items.splice(lista.items.indexOf(item), 1);
        lista.items.splice(lista.items.indexOf(tinta) + (s.inainteDe != null ? 0 : 1), 0, item);
      }
    }
    if ('scoatePiesa' in s) {
      const p = item.get('piese');
      if (p && Array.isArray(p.items)) p.items = p.items.filter((n) => String(n?.value ?? n) !== String(s.scoatePiesa));
    }
  }
  if (viziune !== undefined) {
    const t = unRand(viziune, 'Viziunea', 600);
    if (doc.get('viziune') == null || typeof doc.get('viziune') !== 'object') doc.set('viziune', doc.createNode({ text: t, sursa: 'alex', stare: 'propunere' }));
    else { doc.setIn(['viziune', 'text'], t); doc.setIn(['viziune', 'sursa'], 'alex'); }
  }
  return scrieDoc(folder, cale, inainte, doc);
}

/** „Obiectiv nou” (Alex, 2026-11-20): un rând la final, verdict „nou”, sursa alex. */
export function adaugaObiectiv(folder, { id, text, sursa = 'alex' }, hashCitit) {
  const { cale, inainte, doc } = citesteDoc(folder, hashCitit);
  if (!ID_OK.test(String(id ?? ''))) throw new EroareEditor(`id greșit: „${String(id).slice(0, 60)}”`);
  const t = unRand(text, 'Textul obiectivului');
  let lista = doc.get('obiective');
  if (lista == null) { doc.set('obiective', doc.createNode([])); lista = doc.get('obiective'); }
  if (!Array.isArray(lista.items)) throw new EroareEditor(`${FISIER_OB} nu are lista „obiective”.`, 422);
  if (gaseste(lista, id)) throw new EroareEditor(`id „${id}” există deja în ${FISIER_OB}`, 409);
  lista.items.push(doc.createNode({ id, text: t, sursa, verdict: 'nou' }));
  return scrieDoc(folder, cale, inainte, doc);
}

/** Fișierul de pornire: obiectivele de azi din curs.yml devin obiectiv-1…n cu „da”, deci legăturile vechi [1, 2] rămân aceleași. */
export function textObiectiveNou(obiective = []) {
  const q = (t) => JSON.stringify(String(t));
  const l = ['# Harvest de obiective: obiectivele candidate ale cursului, fără durată (Alex, 2026-11-20).',
    '# verdict: nou / da / poate / nu · sursa: alex / daria · piese: id-urile din harvest.yml care servesc obiectivul.',
    '# bloc: N (opțional, doar la „da”) = obiectivul Blocului N din Flow; fără bloc = în cutia „Obiectivele zilei”.',
    `# Fișele: ${DOSAR_OB}/<id>.md. Obiectivele cu „da”, în ordinea de aici, sunt obiectivele zilei; în curs rămân cel mult ${MAX_OB}.`,
    'obiective:'];
  if (!obiective.length) l[l.length - 1] = 'obiective: []';
  obiective.forEach((t, i) => l.push(`  - id: obiectiv-${i + 1}`, `    text: ${q(t)}`, '    sursa: curs.yml', '    verdict: da'));
  return l.join('\n') + '\n';
}
