// Biblioteca core (biblioteca de bază, spec Radu 2026-11-20, team/radu/documente/biblioteca-de-baza.md).
// „Aș vrea să pot alege dacă le salvez și în părintele principal.” (Alex). Un folder ca un curs, fără ediții:
//   privat/biblioteca/  biblioteca.yml (piese: …), harvest/<id>.md, piese/<id>.md, materiale/, .editor-istoric/
// Semantica: copie cu legătură. Cursul are mereu copia lui; rândul din harvest.yml ține `din: comun/<id>` și `baza: <amprentă>`.
// Nimic nu se sincronizează singur: fiecare copiere e un buton apăsat de Alex, cu copie în .editor-istoric/ și verificare de conflict.
import { readFileSync, existsSync, writeFileSync, mkdirSync, lstatSync, realpathSync, rmSync } from 'node:fs';
import { join, resolve, dirname, basename, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { parse as parseYaml, parseDocument } from 'yaml';
import { EroareEditor, caleSigura, copieIstoric } from './editor-sursa.mjs';

export const PREFIX = 'comun/';
export const FISIER_CORE = 'biblioteca.yml';
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const DIN_OK = /^comun\/[a-z0-9]+(-[a-z0-9]+)*$/;
const BAZA_OK = /^[0-9a-f]{8}$/;
const SEG = '[A-Za-z0-9][A-Za-z0-9._-]*';
const MATERIAL_OK = new RegExp(`^materiale/${SEG}(/${SEG})*$`);
const CAMPURI_CORE = ['titlu', 'scop', 'durata', 'tip', 'etichete'];
/** Textele stărilor, aceleași în editor și pe cartonaș. */
export const STARI = { 'la-zi': 'la zi', modificata: 'modificată aici', noua: 'nouă în core', difera: 'diferă', lipsa: 'lipsește din core' };

/** Unde e biblioteca core pentru un curs: `--biblioteca <cale>`, altfel `<curs>/../../biblioteca`, dar doar dacă
 *  cursul stă într-un folder `cursuri/` (privat/cursuri/<curs>). Un curs aflat în altă parte n-are core: nu ghicim foldere. */
export function gasesteCore(folderCurs, explicit) {
  if (explicit) return resolve(explicit);
  const f = resolve(folderCurs);
  return basename(dirname(f)) === 'cursuri' ? join(dirname(dirname(f)), 'biblioteca') : null;
}
export const idDinLegatura = (din) => (typeof din === 'string' && DIN_OK.test(din) ? din.slice(PREFIX.length) : null);
const verificaId = (id, ce = 'id') => { if (!ID_OK.test(String(id ?? ''))) throw new EroareEditor(`${ce} greșit: „${String(id ?? '').slice(0, 60)}”`, 400); return String(id); };

/**
 * Calea unui fișier din `root` (curs sau core), verificată: doar harvest/<id>.md, piese/<id>.md, materiale/… sau fișierul de rânduri;
 * niciun segment nu e legătură simbolică, iar ținta e în root. Merge și pentru fișiere care nu există încă.
 */
export function caleInterna(root, rel) {
  const bun = /^(harvest|piese)\/[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(rel) || MATERIAL_OK.test(rel) || rel === FISIER_CORE || rel === 'harvest.yml';
  if (!bun || rel.split('/').includes('..')) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  caleSigura(root, rel);
  let radacina; try { radacina = realpathSync(root); } catch { throw new EroareEditor(`folderul ${root} nu există`, 404); }
  let p = radacina;
  for (const s of rel.split('/')) {
    p = join(p, s);
    let st; try { st = lstatSync(p); } catch { break; } // nu există încă: nimic de verificat mai jos
    if (st.isSymbolicLink()) throw new EroareEditor(`cale interzisă (legătură simbolică): ${rel}`, 403);
  }
  if (!resolve(radacina, rel).startsWith(radacina + sep)) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  return join(radacina, rel);
}
const citesteOpt = (root, rel, enc = 'utf8') => {
  let c; try { c = caleInterna(root, rel); } catch (e) { if (e.cod === 404) return null; throw e; } // folderul lipsește: nimic de citit
  try { return lstatSync(c).isFile() ? readFileSync(c, enc) : null; } catch { return null; } };

/** Amprenta unei piese: primele 8 caractere din SHA-256 peste harvest/<id>.md și piese/<id>.md (cele care există, în ordinea asta).
 *  Doar conținutul contează, nu numele: aceeași piesă cu alt id în curs are aceeași amprentă. null = nimic scris. */
export function amprenta(root, id) {
  if (!root) return null;
  verificaId(id);
  const f = citesteOpt(root, `harvest/${id}.md`), p = citesteOpt(root, `piese/${id}.md`);
  if (f == null && p == null) return null;
  return createHash('sha256').update(`harvest\n${f ?? ''}\0piese\n${p ?? ''}`).digest('hex').slice(0, 8);
}

/** Starea calculată (nu se scrie nicăieri): B = baza din rând, L = core acum, C = copia din curs acum. */
export function stare(B, L, C) {
  if (L == null) return 'lipsa';
  if (C === B && L === B) return 'la-zi';
  if (L === B) return 'modificata';
  if (C === B) return 'noua';
  return 'difera';
}

/** Materialele pe care le cer textele piesei: `materiale/…` din imagini, linkuri sau antet, doar cele care există în `root`. */
export function materialeDin(root, ...texte) {
  const out = new Set();
  for (const t of texte) {
    for (const m of String(t ?? '').matchAll(/materiale\/[A-Za-z0-9][A-Za-z0-9._\/-]*/g)) {
      const rel = m[0].replace(/[.\/-]+$/, '');
      if (!MATERIAL_OK.test(rel) || rel.split('/').includes('..')) continue;
      try { if (citesteOpt(root, rel, null) != null) out.add(rel); } catch { /* cale interzisă: o ignorăm */ }
    }
  }
  return [...out].sort();
}

/** Citește biblioteca.yml. Lipsa folderului sau a fișierului nu e eroare (exista: false). */
export function citesteCore(root) {
  const gol = { root, exista: false, piese: [], erori: [] };
  if (!root) return gol;
  let text; try { text = citesteOpt(root, FISIER_CORE); } catch { return gol; }
  if (text == null) return gol;
  let v; try { v = parseYaml(text) ?? {}; } catch (e) { return { ...gol, exista: true, erori: [`${FISIER_CORE}: YAML greșit (${e.message.split('\n')[0]})`] }; }
  const lista = Array.isArray(v?.piese) ? v.piese : [];
  const erori = [], vazute = new Set(), piese = [];
  for (const x of lista) {
    const id = x && typeof x === 'object' ? String(x.id ?? '') : '';
    if (!ID_OK.test(id) || vazute.has(id)) { erori.push(`${FISIER_CORE}: rând fără id bun sau cu id dublat („${id.slice(0, 40)}”)`); continue; }
    vazute.add(id);
    piese.push({
      id, titlu: String(x.titlu ?? id), scop: x.scop == null ? '' : String(x.scop), durata: typeof x.durata === 'number' ? x.durata : 0,
      tip: x.tip == null ? '' : String(x.tip), etichete: Array.isArray(x.etichete) ? x.etichete.map(String) : [], din_curs: x.din_curs == null ? '' : String(x.din_curs),
      amprenta: amprenta(root, id), areFisa: citesteOpt(root, `harvest/${id}.md`) != null, areProdusa: citesteOpt(root, `piese/${id}.md`) != null,
    });
  }
  return { root, exista: true, piese, erori };
}

const README = `# Biblioteca core

Piesele care se refolosesc între cursuri (deschideri, închideri, instrumente care nu țin de o temă).
Spec: \`team/radu/documente/biblioteca-de-baza.md\` (AgentsTeam). Generatorul: \`curs/README.md\`, secțiunea „Biblioteca core”.

- \`biblioteca.yml\`: rândurile pieselor (id, titlu, scop, durata, tip, etichete, din_curs). Fără verdict, bloc, ordine.
- \`harvest/<id>.md\`: fișa piesei. \`piese/<id>.md\`: piesa produsă, dacă există. \`materiale/\`: imaginile lor.
- Piesele intră aici doar din editorul cursului: bifa „Salvează și în core” sau butonul „Trimite în core” din Fișa.
- Un curs care ia o piesă de aici primește o copie cu legătură (\`din: comun/<id>\`, \`baza: <amprentă>\`). Nimic nu se schimbă singur.
- \`.editor-istoric/\`: copiile de siguranță de dinainte de fiecare suprascriere.
`;
/** Creează folderul core (biblioteca.yml gol și un README scurt), dacă lipsește. Nu copiază nicio piesă. */
export function creeazaCore(root) {
  mkdirSync(root, { recursive: true });
  const yml = caleInterna(root, FISIER_CORE);
  if (!existsSync(yml)) writeFileSync(yml, '# Biblioteca core: piesele care se refolosesc între cursuri. Le trimite Alex din editor („Salvează și în core”).\npiese: []\n');
  const r = join(realpathSync(root), 'README.md');
  if (!existsSync(r)) writeFileSync(r, README);
}

/** Copia de siguranță, dar doar dacă .editor-istoric/ nu e o legătură simbolică spre altundeva. */
function istoric(root, rel) {
  const r = realpathSync(root);
  try { if (lstatSync(join(r, '.editor-istoric')).isSymbolicLink()) throw new EroareEditor('cale interzisă: .editor-istoric/ e o legătură simbolică', 403); } catch (e) { if (e instanceof EroareEditor) throw e; }
  return copieIstoric(r, rel);
}

/** Scrieri cu întoarcere: fiecare fișier ține minte ce era înainte, ca o operație care se oprește la jumătate să revină cu totul. */
export class Scrieri {
  constructor() { this.l = []; }
  /** Scrie `date` la calea `abs` (deja verificată); înainte, copie în .editor-istoric/ al lui `root` dacă fișierul există și diferă. */
  scrie(root, rel, date) {
    const abs = caleInterna(root, rel);
    const inainte = existsSync(abs) ? readFileSync(abs) : null;
    if (inainte && Buffer.compare(inainte, Buffer.from(date)) === 0) return false;
    const copie = inainte ? istoric(root, rel) : null;
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, date);
    this.l.push({ abs, inainte, rel, root, copie });
    return true;
  }
  sterge(root, rel) {
    const abs = caleInterna(root, rel);
    if (!existsSync(abs)) return false;
    const inainte = readFileSync(abs);
    const copie = istoric(root, rel);
    rmSync(abs);
    this.l.push({ abs, inainte, rel, root, copie });
    return true;
  }
  /** Ce s-a scris deja de altcineva (de exemplu scrieMasa): doar pentru întoarcere. */
  adaugaScris(abs, inainte) { this.l.push({ abs, inainte: inainte == null ? null : Buffer.from(inainte), rel: basename(abs) }); }
  inapoi() {
    for (const { abs, inainte } of this.l.reverse()) { if (inainte == null) rmSync(abs, { force: true }); else { mkdirSync(dirname(abs), { recursive: true }); writeFileSync(abs, inainte); } }
    this.l = [];
  }
  get fisiere() { return this.l.map((x) => x.rel); }
}

/** Rândul din biblioteca.yml: îl adaugă sau îi schimbă câmpurile (titlu, scop, durata, tip, etichete); din_curs doar la creare. */
function scrieRandCore(s, root, idc, rand, dinCurs) {
  const abs = caleInterna(root, FISIER_CORE);
  const text = existsSync(abs) ? readFileSync(abs, 'utf8') : 'piese: []\n';
  const doc = parseDocument(text);
  let lista = doc.get('piese');
  if (lista == null || !Array.isArray(lista.items)) { doc.set('piese', doc.createNode([])); lista = doc.get('piese'); }
  let item = lista.items.find((n) => n && typeof n.get === 'function' && String(n.get('id')) === idc);
  const v = Object.fromEntries(CAMPURI_CORE.filter((k) => rand[k] != null && rand[k] !== '' && !(Array.isArray(rand[k]) && !rand[k].length)).map((k) => [k, rand[k]]));
  if (!item) { item = doc.createNode({ id: idc, ...v, ...(dinCurs ? { din_curs: dinCurs } : {}) }); lista.items.push(item); lista.flow = false; }
  else for (const k of CAMPURI_CORE) { if (k in v) item.set(k, v[k]); else if (k !== 'etichete') item.delete(k); }
  s.scrie(root, FISIER_CORE, doc.toString({ lineWidth: 0 }));
}

/** Fișierele piesei care se copiază: fișa și piesa produsă (cele care există), plus materialele cerute de ele. */
function fisierePiesa(root, id) {
  const f = citesteOpt(root, `harvest/${id}.md`), p = citesteOpt(root, `piese/${id}.md`);
  return { fisa: f, piesa: p, materiale: materialeDin(root, f, p) };
}
/** Copiază piesa `idDin` din `din` în `spre` cu id-ul `idSpre`: fișa, piesa produsă (sau o scoate, cu copie, dacă sursa n-o are) și materialele. */
function copiazaPiesa(s, din, idDin, spre, idSpre, { materialeStrict = false } = {}) {
  const x = fisierePiesa(din, idDin);
  if (x.fisa == null && x.piesa == null) throw new EroareEditor(`Piesa „${idDin}” nu are încă nimic scris (nici fișă în harvest/, nici piese/${idDin}.md).`, 422);
  for (const [dosar, text] of [['harvest', x.fisa], ['piese', x.piesa]]) {
    const rel = `${dosar}/${idSpre}.md`;
    if (text != null) s.scrie(spre, rel, text); else s.sterge(spre, rel);
  }
  for (const rel of x.materiale) {
    const date = readFileSync(caleInterna(din, rel)), acolo = citesteOpt(spre, rel, null);
    if (acolo && Buffer.compare(acolo, date) !== 0 && materialeStrict) throw new EroareEditor(`${rel} există deja în curs, cu alt conținut. Redenumește-l într-una din părți, apoi încearcă din nou.`, 409);
    s.scrie(spre, rel, date);
  }
  return x;
}

/**
 * „Trimite în core” / bifa „Salvează și în core”. `legatura` = din-ul rândului (sau null). `asteptat` = amprenta din core pe care o știe
 * cursul (implicit baza); dacă core s-a schimbat între timp (alt curs), nu suprascrie: 409 cu conflict { stare: 'difera' }.
 * Piesă nelegată, iar core are deja id-ul: 409 cu conflict { ocupat, propus }. Întoarce { s (scrierile), din, baza, idc }.
 */
export function trimiteInCore({ curs, core, id, rand, legatura = null, baza = null, idCore, asteptat, dinCurs }) {
  if (!core) throw new EroareEditor('Cursul nu are biblioteca core lângă el (privat/biblioteca/). Pornește editorul cu --biblioteca <cale>.', 404);
  verificaId(id);
  const legat = idDinLegatura(legatura);
  const idc = verificaId(legat ?? idCore ?? id, 'id-ul din core');
  if (!existsSync(join(core, FISIER_CORE))) creeazaCore(core);
  const L = amprenta(core, idc), randuri = citesteCore(core).piese;
  if (!legat) {
    if (L != null || randuri.some((x) => x.id === idc)) {
      const ocupate = new Set(randuri.map((x) => x.id));
      let n = 2, propus = `${idc}-${n}`; while (ocupate.has(propus) || amprenta(core, propus) != null) propus = `${idc}-${++n}`;
      const e = new EroareEditor(`Există deja ${PREFIX}${idc} în core, de altă proveniență. Dă alt id.`, 409);
      e.conflict = { ocupat: true, idCore: idc, propus }; throw e;
    }
  } else {
    const cunoscut = asteptat === undefined ? baza : asteptat;
    if ((L ?? null) !== (cunoscut ?? null)) {
      const e = new EroareEditor('Core s-a schimbat de când ai luat piesa (probabil din alt curs). Nu am suprascris-o: alege mai jos.', 409);
      e.conflict = { stare: 'difera', L, B: baza, C: amprenta(curs, id) }; throw e;
    }
  }
  const s = new Scrieri();
  try {
    copiazaPiesa(s, curs, id, core, idc);
    scrieRandCore(s, core, idc, rand ?? {}, legat ? null : dinCurs);
  } catch (e) { s.inapoi(); throw e; }
  return { s, idc, din: `${PREFIX}${idc}`, baza: amprenta(core, idc) };
}

/** „Ia versiunea din core”: copia din curs devine cea din core. Doar dacă și cursul, și core sunt cum le-a văzut Alex (C, L). */
export function iaDinCore({ curs, core, id, legatura, vazut = {} }) {
  const idc = idDinLegatura(legatura);
  if (!core || !idc) throw new EroareEditor('Piesa nu e legată de core.', 422);
  verificaId(id);
  const L = amprenta(core, idc), C = amprenta(curs, id);
  if (L == null) throw new EroareEditor(`${legatura} nu mai e în core.`, 404);
  if (L !== vazut.L || C !== vazut.C) { const e = new EroareEditor('Piesa s-a schimbat între timp, în curs sau în core. Redeschide fișa și încearcă din nou.', 409); e.conflict = { stare: 'schimbata', L, C }; throw e; }
  const s = new Scrieri();
  try { copiazaPiesa(s, core, idc, curs, id); } catch (e) { s.inapoi(); throw e; }
  return { s, baza: L };
}

/** „Adaugă din core”: piesa intră în curs cu id-ul `idNou` (implicit același). Materialele cu același nume și alt conținut opresc copierea. */
export function adaugaDinCore({ curs, core, idCore, idNou }) {
  const idc = verificaId(idCore, 'id-ul din core'), id = verificaId(idNou ?? idCore);
  const r = citesteCore(core).piese.find((x) => x.id === idc);
  if (!r) throw new EroareEditor(`Nu găsesc ${PREFIX}${idc} în core.`, 404);
  const s = new Scrieri();
  try { copiazaPiesa(s, core, idc, curs, id, { materialeStrict: true }); } catch (e) { s.inapoi(); throw e; }
  return { s, rand: r, din: `${PREFIX}${idc}`, baza: amprenta(core, idc), id };
}

/** Pentru build și pentru cartonașe: fiecare candidată legată primește core = { din, stare }. Avertismente pentru legături stricate. */
export function marcheazaCore(candidate, folderCurs, core, avertismente = []) {
  const are = core && existsSync(join(core, FISIER_CORE));
  for (const x of candidate) {
    if (!x.din) continue;
    const idc = idDinLegatura(x.din);
    let L = null;
    if (are && idc) { try { L = amprenta(core, idc); } catch { L = null; } }
    if (are && idc && L == null) avertismente.push(`harvest.yml, „${x.id}”: ${x.din} nu (mai) e în biblioteca core`);
    let C = null; try { C = amprenta(folderCurs, x.id); } catch { C = null; }
    x.core = { din: x.din, stare: are && idc ? stare(x.baza, L, C) : null };
  }
  return candidate;
}
