// Fișa piesei din Harvest (Alex, 2026-11-19): „să pot deschide fiecare piesă și să-i văd toată logica”.
// Sursa, în ordine: harvest/<id>.md (fișa scrisă de Irina și Daria), apoi piesa produsă (piese/<id>.md sau modulul cu acest id).
// Markdown → HTML cu aceeași randare ca restul materialului: HTML-ul brut e afișat ca text, linkurile javascript:/data: devin text,
// linkurile externe se deschid în tab nou. Id-ul e validat (litere mici, cifre, cratimă), deci nu poate ieși din folderul cursului.
import { readFileSync, existsSync, realpathSync, lstatSync, mkdirSync, writeFileSync, readdirSync } from 'node:fs';
import { sep, join } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { creeazaRandare, escapeHtml as e } from './randare.mjs';
import { imparteInStraturi } from './sursa.mjs';
import { caleSigura, fisierPentru, EroareEditor, hash, copieIstoric } from './editor-sursa.mjs';
import { DOSAR_OB } from './obiective.mjs';

const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const DOSAR = 'harvest';
const randeaza = creeazaRandare({ atribut: 'data-img', linkuriNoi: true });

const STRAT = {
  sala: 'Ecran în sală', 'sala-si-curs': 'Ecran în sală și în cursul online', trainer: 'Nota trainerului', participant: 'Pentru participant',
};
const ANTET = [
  ['durata', 'Durată', (v) => `${v} min`], ['tip', 'Tip'], ['format', 'Format'], ['energie', 'Energie'],
  ['obiectiv', 'Obiectiv'], ['ancora', 'Ancora'], ['materiale', 'Materiale', (v) => (Array.isArray(v) ? v.join(', ') : v)],
];

/** Citește un fișier al cursului doar dacă și ținta lui reală (după legăturile simbolice) e în folderul cursului. */
function citesteSigur(folder, rel) {
  const cale = caleSigura(folder, rel), radacina = realpathSync(folder), real = realpathSync(cale);
  if (!real.startsWith(radacina + sep)) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  return readFileSync(real, 'utf8');
}

/** Piesa produsă: antetul ca listă scurtă, apoi textul, bloc cu bloc (ecranele din sală, nota trainerului, participantul). */
function dinPiesa(text) {
  const t = text.replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(t);
  let antet = {};
  if (m) { try { antet = parseYaml(m[1]) ?? {}; } catch { antet = {}; } }
  if (typeof antet !== 'object' || Array.isArray(antet)) antet = {};
  const corp = m ? t.slice(m[0].length) : t;
  const segmente = imparteInStraturi(corp, '', 1, [], { marcaj: true });
  const lista = ANTET.filter(([k]) => antet[k] != null && antet[k] !== '' && !(Array.isArray(antet[k]) && !antet[k].length))
    .map(([k, eticheta, f]) => `<div><dt>${eticheta}</dt><dd>${e(f ? f(antet[k]) : antet[k])}</dd></div>`).join('');
  const parti = segmente.filter((s) => s.strat !== 'piese' && s.md.trim()).map((s) => {
    const cron = s.atribute?.cronometru ? ` · cronometru ${e(s.atribute.cronometru)} min` : '';
    return s.strat === 'text' ? randeaza(s.md) : `<section class="fisa-bloc fisa-${e(s.strat)}"><p class="eticheta">${STRAT[s.strat] ?? e(s.strat)}${cron}</p>${randeaza(s.md)}</section>`;
  }).join('\n');
  return { titlu: antet.titlu == null ? '' : String(antet.titlu), html: (lista ? `<dl class="fisa-antet">${lista}</dl>\n` : '') + parti };
}

/**
 * Fișa unei piese, citită acum de pe disc. Întoarce { id, sursa: 'harvest' | 'piesa' | null, fisier, titlu, html }.
 * sursa null = nu există nimic scris încă. Un id greșit e eroare 400 (fără să atingă discul).
 */
export function fisaPiesei(folder, id) {
  id = String(id ?? '');
  if (!ID_OK.test(id)) throw new EroareEditor(`id greșit: „${id.slice(0, 60)}”`, 400);
  const harvest = `${DOSAR}/${id}.md`, cale = caleSigura(folder, harvest);
  if (existsSync(cale)) return { id, sursa: 'harvest', fisier: harvest, titlu: '', html: randeaza(citesteSigur(folder, harvest)) };
  let fisier = null;
  try { fisier = fisierPentru(folder, id); } catch (err) { if (err.cod !== 404) throw err; }
  if (!fisier) return { id, sursa: null, fisier: null, titlu: '', html: '' };
  return { id, sursa: 'piesa', fisier, ...dinPiesa(citesteSigur(folder, fisier)) };
}

/** Fișa unui obiectiv din harvest-ul de obiective (2026-11-20): harvest/obiective/<id>.md, sau nimic (sursa null). */
export function fisaObiectivului(folder, id) {
  id = String(id ?? '');
  if (!ID_OK.test(id)) throw new EroareEditor(`id greșit: „${id.slice(0, 60)}”`, 400);
  const rel = `${DOSAR_OB}/${id}.md`;
  if (!existsSync(caleSigura(folder, rel))) return { id, sursa: null, fisier: null, titlu: '', html: '' };
  return { id, sursa: 'obiectiv', fisier: rel, titlu: '', html: randeaza(citesteSigur(folder, rel)) };
}

/** Fișele tuturor candidatelor și ale obiectivelor, pentru fișierul offline (se includ la build). Doar cele care au ceva scris.
 *  Obiectivele au cheia „obiectiv:<id>” (două puncte nu apar într-un id de piesă). */
export function fiseleMasa(c) {
  const out = {};
  for (const x of c.masa?.candidate ?? []) {
    try { const f = fisaPiesei(c.folder, x.id); if (f.sursa) out[x.id] = f; } catch { /* id-urile candidatelor sunt deja verificate */ }
  }
  for (const o of c.harvestObiective?.obiective ?? []) {
    try { const f = fisaObiectivului(c.folder, o.id); if (f.sursa) out[`obiectiv:${o.id}`] = f; } catch { /* id-urile sunt verificate */ }
  }
  return out;
}

// ---------- Editarea fișei în editorul local (Alex, 2026-11-20): „să pot edita piesele din Harvest, ca să nu trebuiască să trec prin voi”. ----------
export const MAX_FISA = 150000; // caractere; cea mai lungă fișă de azi are ~17 000
const TIP_RO = { teorie: 'teorie', model: 'model', poveste: 'poveste', exercitiu: 'exercițiu', challenge: 'challenge', reflectie: 'reflecție', energizant: 'energizant', deschidere: 'deschidere', inchidere: 'închidere', mesaj: 'mesaj', pauza: 'pauză' };

/** Fișa nouă, cu secțiunile din D-086 (docs/procese/curs-nou.md, „Lecțiile după prima livrare…”), în ordinea lor. */
export function sablonFisa({ id, titlu = '', durata = null, tip = '' } = {}, azi = new Date().toISOString().slice(0, 10)) {
  const fel = [tip ? `**Fel:** ${TIP_RO[tip] ?? tip}` : '**Fel:** ', durata != null ? `**Durată:** ${durata} min` : '**Durată:** '].join(' · ');
  return `# ${titlu || id}
- **ID:** ${id}
- **Adăugată:** ${azi}, de Alex
- ${fel}
- **Format:** D-086

## Input-ul lui Alex

## Tip
exercițiu / prezentare

## Ideea principală
(doar la prezentare)

## Ce spune research-ul
(doar la prezentare)

## Mecanica pe scurt
(doar la exercițiu)

## Întrebări
(de critical thinking la prezentare, de debriefing la exercițiu)
`;
}

/** Fișa nouă a unui obiectiv, cu secțiunile din fișele Dariei (harvest/obiective/, 2026-11-20). */
export function sablonObiectiv({ id, text = '' } = {}, azi = new Date().toISOString().slice(0, 10)) {
  return `# ${text || id}
- **ID:** ${id}
- **Sursa:** Alex, ${azi}
- **Verdict:** nou

## Input-ul lui Alex
> 

## Obiectivul
${text}

## De ce contează


## Cum arată succesul
- 

## Piesele care îl servesc

`;
}

/** Dosarul fișelor: harvest/ pentru piese, harvest/obiective/ pentru obiective. */
const dosarDe = (fel) => (fel === 'obiectiv' ? DOSAR_OB : DOSAR);

/** Calea de scriere a fișei: doar harvest/<id>.md (sau harvest/obiective/<id>.md), cu folderele în curs (nu legături spre altundeva), fișierul nu e legătură. */
function caleScriere(folder, id, fel) {
  if (!ID_OK.test(String(id ?? ''))) throw new EroareEditor(`id greșit: „${String(id ?? '').slice(0, 60)}”`, 400);
  const DOS = dosarDe(fel);
  const rel = `${DOS}/${id}.md`, cale = caleSigura(folder, rel), dosar = caleSigura(folder, DOS);
  const radacina = realpathSync(folder);
  const parti = DOS.split('/');
  for (let i = 1; i <= parti.length; i++) {
    const d = caleSigura(folder, parti.slice(0, i).join('/'));
    if (existsSync(d) && (lstatSync(d).isSymbolicLink() || !realpathSync(d).startsWith(radacina + sep))) throw new EroareEditor(`cale interzisă: ${parti.slice(0, i).join('/')}/`, 403);
  }
  let st = null; try { st = lstatSync(cale); } catch { /* nu există încă */ }
  if (st && (st.isSymbolicLink() || !st.isFile())) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  return { rel, cale, dosar };
}

/** Textul de editat: Markdown-ul de pe disc (cu hash-ul lui) sau, dacă fișa lipsește, șablonul D-086 (exista: false, hash: null). */
export function fisaDeEditat(folder, id, candidata = {}, { fel = 'piesa' } = {}) {
  const { rel, cale } = caleScriere(folder, id, fel);
  if (existsSync(cale)) { const md = citesteSigur(folder, rel); return { id, fisier: rel, exista: true, md, hash: hash(md) }; }
  return { id, fisier: rel, exista: false, md: fel === 'obiectiv' ? sablonObiectiv({ id, ...candidata }) : sablonFisa({ id, ...candidata }), hash: null };
}

/** Verifică textul fișei: un șir, fără caractere nule, cel mult MAX_FISA. Rândurile se normalizează la \n, cu un \n la final. */
export function verificaFisa(md) {
  if (typeof md !== 'string') throw new EroareEditor('Textul fișei lipsește.');
  if (md.length > MAX_FISA) throw new EroareEditor(`Fișa e prea lungă (${md.length} caractere; cel mult ${MAX_FISA}).`, 413);
  if (md.includes('\0')) throw new EroareEditor('Fișa conține un caracter nul.');
  const t = md.replace(/\r\n?/g, '\n').replace(/\s+$/, '');
  if (!t.trim()) throw new EroareEditor('Fișa nu poate rămâne goală.');
  return t + '\n';
}

/**
 * Scrie harvest/<id>.md în `folder` (orice folder cu forma unui curs; nu depinde de curs.yml). Conflict (409, conflict: true) dacă fișierul de pe disc nu mai e cel deschis: alt hash, sau a apărut
 * între timp (hashCitit null), sau a dispărut. Înainte să suprascrie, copie în .editor-istoric/. Întoarce { fisier, inainte, copie }.
 */
export function scrieFisa(folder, id, md, hashCitit, { fel = 'piesa' } = {}) {
  const text = verificaFisa(md);
  const { rel, cale, dosar } = caleScriere(folder, id, fel);
  const exista = existsSync(cale);
  const inainte = exista ? readFileSync(cale, 'utf8') : null;
  if ((hashCitit ?? null) !== (exista ? hash(inainte) : null)) {
    const e = new EroareEditor('Fișa s-a schimbat între timp (probabil un agent). Nu am suprascris-o.', 409);
    e.conflict = { fisa: true, fisier: rel, hash: exista ? hash(inainte) : null, md: inainte }; // per fișier: aceeași formă pentru orice folder-curs (și biblioteca de bază, dacă o aprobă Alex)
    throw e;
  }
  if (inainte === text) return { fisier: rel, inainte, copie: null, neschimbat: true, hash: hash(text) };
  const copie = exista ? copieIstoric(folder, rel) : null;
  mkdirSync(dosar, { recursive: true });
  writeFileSync(cale, text);
  return { fisier: rel, inainte, copie, hash: hash(text) };
}

/** Id-ul unei piese noi, din titlu: litere mici fără diacritice, cifre și cratimă, cel mult 60 de caractere; unic în curs. */
export function idDinTitlu(titlu, ocupate = new Set()) {
  let baza = String(titlu ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (baza.length > 60) baza = baza.slice(0, 60).replace(/-[^-]*$/, '') || baza.slice(0, 60);
  baza = baza.replace(/-+$/, '') || 'piesa';
  let id = baza, n = 2;
  while (ocupate.has(id)) id = `${baza}-${n++}`;
  if (!ID_OK.test(id)) throw new EroareEditor(`nu pot face un id din „${String(titlu).slice(0, 60)}”`);
  return id;
}

/** Fișele care există deja în harvest/ (sau harvest/obiective/), pentru unicitatea id-ului nou. */
export function fiseExistente(folder, fel) {
  try { return readdirSync(join(folder, dosarDe(fel))).filter((f) => f.endsWith('.md')).map((f) => f.slice(0, -3)); } catch { return []; }
}
