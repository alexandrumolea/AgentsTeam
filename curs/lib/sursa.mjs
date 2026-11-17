// Citește folderul unui curs și verifică tot ce cere arhitectura (Radu, v1.2: 1.3–1.9, D-053).
// Nu scrie nimic. Întoarce { curs, editie, module, piese, agenda, erori, avertismente }.
// Piesa de workshop (piese/<id>.md) e unitatea de bază; modulul e o secvență cu titlu care propune piese.
// Agenda (ordinea zilei: module, piese singure, pauze) vine din ediție; restul codului lucrează doar cu `agenda`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { normal } from './randare.mjs';

export const STRATURI = ['sala', 'sala-si-curs', 'trainer', 'participant'];
export const TIPURI = ['teorie', 'exercitiu', 'reflectie', 'mesaj', 'pauza'];
// Piesele: tipul alege familia, iar familia alege lumea Ive a ecranelor (1.9). Pauza e o piesă din familia punte.
export const FAMILIE = {
  teorie: 'continut', model: 'continut', poveste: 'continut',
  exercitiu: 'activitate', reflectie: 'activitate', energizant: 'activitate',
  deschidere: 'punte', inchidere: 'punte', mesaj: 'punte', pauza: 'punte',
};
export const TIPURI_PIESA = Object.keys(FAMILIE);
export const FAMILII = ['continut', 'activitate', 'punte'];
export const FORMATE = ['individual', 'perechi', 'grup', 'plen'];
export const ENERGII = ['calm', 'mediu', 'activ'];
const BRANDURI = ['bemore', 'innersis', 'bemore-ls']; // bemore = noul branding BEMORE (Alex, 2026-11-17); până la curs/tema/bemore.css se folosește sobru.css
const LIMBI = ['ro', 'en'];
const PUBLIC = ['nu', 'link', 'da'];
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MARCAJ = '::piese';

export const cuvinte = (s) => String(s).replace(/[*_`#>\[\]()!]/g, ' ').split(/\s+/).filter(Boolean).length;

/** „9:00” → 540. Întoarce null dacă nu e o oră. */
export function minute(ora) {
  const m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(String(ora ?? ''));
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return +m[1] * 60 + +m[2];
}
export const ora = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
/** `etichete: [Positive Outlook, Closing]`: texte libere, scrise cum vrea Alex (Alex, 2026-11-17). */
function citesteEtichete(v, nume, erori) {
  if (v === undefined || v === null) return [];
  const l = Array.isArray(v) ? v : [v];
  if (!l.every((x) => (typeof x === 'string' && x.trim()) || typeof x === 'number')) { erori.push(`${nume}: „etichete” e o listă de texte, de exemplu [Positive Outlook, Closing]`); return []; }
  return l.map((x) => String(x).trim().replace(/\s+/g, ' '));
}

/** `obiective: [1, 3]` la un modul sau o piesă: indexuri (de la 1) în lista de obiective a zilei. */
function indexuriObiective(v, nume, erori) {
  if (v === undefined || v === null) return [];
  if (!Array.isArray(v) || !v.every((n) => Number.isInteger(n) && n > 0)) { erori.push(`${nume}: „obiective” e o listă de numere (indexurile obiectivelor din curs.yml, de la 1), de exemplu [1, 3]`); return []; }
  return v;
}
const lista = (x) => (x === undefined || x === null ? [] : Array.isArray(x) ? x : [x]);

function citesteYaml(fisier, erori) {
  try {
    const v = parseYaml(readFileSync(fisier, 'utf8'));
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    erori.push(`${fisier}: YAML greșit (${e.message.split('\n')[0]})`);
    return {};
  }
}

/**
 * Împarte corpul unui fișier în segmente pe straturi. Orice bloc greșit devine eroare.
 * Linia „::piese” (doar în module) devine segmentul { strat: 'piese' }: locul pieselor alese.
 */
export function imparteInStraturi(corp, fisier, liniaStart, erori, { marcaj = true } = {}) {
  const segmente = [];
  let curent = { strat: 'text', linii: [], linia: liniaStart, atribute: {} };
  let deschis = null, marcaje = 0;
  const inchide = () => {
    const md = curent.linii.join('\n').trim();
    if (md || curent.strat !== 'text') segmente.push({ strat: curent.strat, md, atribute: curent.atribute, linia: curent.linia, fisier });
  };
  corp.split('\n').forEach((rand, i) => {
    const nr = liniaStart + i;
    const t = rand.trim();
    if (t === MARCAJ) {
      if (!marcaj) { erori.push(`${fisier}:${nr}: „${MARCAJ}” se poate pune doar într-un modul`); return; }
      if (deschis) { erori.push(`${fisier}:${nr}: „${MARCAJ}” e în interiorul blocului „:::${deschis.strat}” (linia ${deschis.linia})`); return; }
      if (++marcaje > 1) { erori.push(`${fisier}:${nr}: „${MARCAJ}” apare de două ori; piesele intră într-un singur loc`); return; }
      inchide();
      segmente.push({ strat: 'piese', md: '', atribute: {}, linia: nr, fisier });
      curent = { strat: 'text', linii: [], linia: nr + 1, atribute: {} };
      return;
    }
    if (/^::[A-Za-z]/.test(t)) { erori.push(`${fisier}:${nr}: „${t}” nu e cunoscut. Se poate doar „${MARCAJ}”${t === '::exercitii' ? ' (v1.2: „::exercitii” a devenit „::piese”)' : ''}`); return; }
    if (!t.startsWith(':::')) { curent.linii.push(rand); return; }
    if (/^:::\s*$/.test(t)) {
      if (!deschis) { erori.push(`${fisier}:${nr}: „:::” închide un bloc care nu e deschis`); return; }
      inchide(); deschis = null;
      curent = { strat: 'text', linii: [], linia: nr + 1, atribute: {} };
      return;
    }
    const m = /^:::\s*([A-Za-z0-9_-]+)\s*(.*)$/.exec(t);
    const nume = m ? m[1] : t;
    if (!m || !STRATURI.includes(nume)) {
      erori.push(`${fisier}:${nr}: bloc necunoscut „${t}”. Se poate doar: ${STRATURI.map((s) => ':::' + s).join(', ')}`);
      return;
    }
    if (deschis) {
      erori.push(`${fisier}:${nr}: bloc „:::${nume}” deschis în interiorul lui „:::${deschis.strat}” (linia ${deschis.linia}). Închide-l întâi cu „:::”`);
      return;
    }
    const atribute = {};
    for (const tok of m[2].split(/\s+/).filter(Boolean)) {
      const a = /^cronometru=(\d+)$/.exec(tok);
      if (a && (nume === 'sala' || nume === 'sala-si-curs') && +a[1] > 0) atribute.cronometru = +a[1];
      else erori.push(`${fisier}:${nr}: atribut necunoscut „${tok}” la „:::${nume}”. Se poate doar „cronometru=<minute>”, la blocurile din sală`);
    }
    inchide();
    deschis = { strat: nume, linia: nr };
    curent = { strat: nume, linii: [], linia: nr, atribute };
  });
  if (deschis) erori.push(`${fisier}:${deschis.linia}: blocul „:::${deschis.strat}” nu e închis. Adaugă o linie cu „:::” la final`);
  else inchide();
  return segmente;
}

function citesteFisier(cale, nume, erori, opt) {
  const text = readFileSync(cale, 'utf8').replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!m) { erori.push(`${nume}: lipsește antetul (--- … ---) de la început`); return null; }
  let antet = {};
  try { antet = parseYaml(m[1]) ?? {}; } catch (e) { erori.push(`${nume}: antet YAML greșit (${e.message.split('\n')[0]})`); return null; }
  const segmente = imparteInStraturi(text.slice(m[0].length), nume, m[0].split('\n').length, erori, opt);
  return { antet, segmente };
}

/** Imaginile dintr-un text markdown: ![alt](cale). */
export const imaginiDin = (md) => [...md.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((x) => x[1]);

/** Verificările comune pe segmente: cronometru, ecrane goale sau lungi, imagini (prezentarea merge fără internet). */
function verificaSegmente(folder, nume, segmente, durata, erori, avertismente) {
  for (const s of segmente) {
    const loc = `${nume}:${s.linia}`;
    if (s.atribute.cronometru && Number.isInteger(durata) && s.atribute.cronometru > durata) {
      erori.push(`${loc}: cronometru=${s.atribute.cronometru} e mai lung decât durata (${durata} min)`);
    }
    if ((s.strat === 'sala' || s.strat === 'sala-si-curs') && !s.md) erori.push(`${loc}: blocul „:::${s.strat}” e gol`);
    if ((s.strat === 'sala' || s.strat === 'sala-si-curs') && cuvinte(s.md) > 30) {
      avertismente.push(`${loc}: ecranul din sală are ${cuvinte(s.md)} cuvinte; pe proiector, mai puțin e mai bine (sub 30)`);
    }
    for (const src of imaginiDin(s.md)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) { erori.push(`${loc}: imaginea „${src}” e pe internet; pune-o în materiale/ (prezentarea merge fără internet)`); continue; }
      const n = normalize(src);
      if (!n.startsWith('materiale/') || n.includes('..')) { erori.push(`${loc}: imaginea „${src}” trebuie să fie în materiale/`); continue; }
      if (!existsSync(join(folder, n)) || !statSync(join(folder, n)).isFile()) erori.push(`${loc}: imaginea „${src}” nu există în materiale/`);
    }
  }
}

function citesteModule(folder, erori, avertismente) {
  const fisiere = readdirSync(folder).filter((f) => f.endsWith('.md') && !/^readme\.md$/i.test(f)).sort();
  if (!fisiere.length) erori.push(`${folder}: niciun modul (.md)`);
  const module = [], iduri = new Set();
  for (const f of fisiere) {
    const mod = citesteFisier(join(folder, f), f, erori);
    if (!mod) continue;
    const a = mod.antet;
    const e = (msg) => erori.push(`${f}: ${msg}`);
    for (const c of ['id', 'titlu', 'durata', 'tip', 'ancora', 'schita']) if (a[c] === undefined || a[c] === null || a[c] === '') e(`lipsește „${c}” din antet`);
    if (a.id !== undefined) {
      if (!ID_OK.test(String(a.id))) e(`id „${a.id}” poate avea doar litere mici, cifre și cratimă`);
      if (iduri.has(a.id)) e(`id „${a.id}” mai e folosit de alt modul`);
      iduri.add(a.id);
    }
    // Durata modulului = doar ce e scris în corpul lui; poate fi 0 când modulul e doar o listă de piese.
    if (a.durata !== undefined && !(Number.isInteger(a.durata) && a.durata >= 0)) e(`durata „${a.durata}” trebuie să fie un număr de minute (0 dacă modulul are doar piese)`);
    if (a.tip !== undefined && !TIPURI.includes(a.tip)) e(`tip „${a.tip}” necunoscut (${TIPURI.join(' / ')})`);
    if (a.schita !== undefined) {
      if (!Array.isArray(a.schita)) e('„schita” trebuie să fie o listă de puncte');
      else {
        if (a.schita.length > 3) e(`schița are ${a.schita.length} puncte; se pot cel mult 3`);
        a.schita.forEach((p) => { if (cuvinte(p) > 8) e(`punctul din schiță „${p}” are ${cuvinte(p)} cuvinte; se pot cel mult 8`); });
      }
    }
    if (a.ancora && cuvinte(a.ancora) > 3) avertismente.push(`${f}: ancora „${a.ancora}” are peste 3 cuvinte`);
    if (a.materiale !== undefined && !Array.isArray(a.materiale)) e('„materiale” trebuie să fie o listă');
    if (a.exercitii !== undefined) e(a.piese !== undefined ? 'are și „exercitii”, și „piese”; „exercitii” a rămas de la v1.1, șterge-l' : '„exercitii” a devenit „piese” (v1.2): redenumește câmpul');
    const ex = a.piese ?? {};
    if (typeof ex !== 'object' || Array.isArray(ex)) e('„piese” trebuie să aibă forma { implicite: [...], alternative: [...] }');
    for (const k of Object.keys(typeof ex === 'object' && !Array.isArray(ex) ? ex : {})) if (!['implicite', 'alternative'].includes(k)) e(`„piese.${k}” necunoscut (se pot: implicite, alternative)`);
    verificaSegmente(folder, f, mod.segmente, a.durata, erori, avertismente);
    const obiective = indexuriObiective(a.obiective, f, erori);
    module.push({
      obiective, etichete: citesteEtichete(a.etichete, f, erori),
      fisier: f, id: a.id, titlu: a.titlu, durata: a.durata, tip: a.tip, ancora: a.ancora ?? '',
      schita: Array.isArray(a.schita) ? a.schita : [], materiale: Array.isArray(a.materiale) ? a.materiale : [],
      implicite: lista(ex.implicite).map(String), alternative: lista(ex.alternative).map(String),
      segmente: mod.segmente,
    });
  }
  return module;
}

function citestePiese(folder, erori, avertismente) {
  const piese = new Map();
  if (existsSync(join(folder, 'exercitii'))) erori.push(`exercitii/: v1.2 a redenumit folderul în piese/ (D-053). Mută fișierele în piese/`);
  const dir = join(folder, 'piese');
  if (!existsSync(dir)) return piese;
  const vazute = new Map();
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const id = f.replace(/\.md$/, '');
    const nume = `piese/${f}`;
    const e = (msg) => erori.push(`${nume}: ${msg}`);
    if (!ID_OK.test(id)) { e('numele fișierului e id-ul piesei și poate avea doar litere mici, cifre și cratimă'); continue; }
    if (vazute.has(id)) { e(`id „${id}” mai e folosit de ${vazute.get(id)}`); continue; }
    vazute.set(id, nume);
    const x = citesteFisier(join(dir, f), nume, erori, { marcaj: false });
    if (!x) continue;
    const a = x.antet;
    const familie = FAMILIE[a.tip];
    const obligatorii = ['titlu', 'durata', 'tip', ...(familie === 'activitate' ? ['format', 'energie', 'obiectiv'] : [])];
    for (const c of obligatorii) if (a[c] === undefined || a[c] === null || a[c] === '') e(`lipsește „${c}” din antet${['format', 'energie', 'obiectiv'].includes(c) ? ' (obligatoriu la activități)' : ''}`);
    if (a.durata !== undefined && !(Number.isInteger(a.durata) && a.durata > 0)) e(`durata „${a.durata}” trebuie să fie un număr de minute`);
    if (a.tip !== undefined && !familie) e(`tip „${a.tip}” necunoscut (${TIPURI_PIESA.join(' / ')})`);
    if (a.format !== undefined && !FORMATE.includes(a.format)) e(`format „${a.format}” necunoscut (${FORMATE.join(' / ')})`);
    if (a.energie !== undefined && !ENERGII.includes(a.energie)) e(`energie „${a.energie}” necunoscută (${ENERGII.join(' / ')})`);
    if (a.tip === 'pauza' && (a.format !== undefined || a.energie !== undefined)) avertismente.push(`${nume}: o pauză nu are format sau energie; le ignor`);
    if (a.id !== undefined && String(a.id) !== id) e(`antetul spune id „${a.id}”, dar id-ul e numele fișierului („${id}”). Scoate „id” din antet`);
    if (a.materiale !== undefined && !Array.isArray(a.materiale)) e('„materiale” trebuie să fie o listă');
    if (a.module !== undefined && !Array.isArray(a.module)) e('„module” trebuie să fie o listă de id-uri');
    if (a.ancora && cuvinte(a.ancora) > 3) avertismente.push(`${nume}: ancora „${a.ancora}” are peste 3 cuvinte`);
    const inCurs = a.in_curs === undefined ? 'da' : a.in_curs === true ? 'da' : a.in_curs === false ? 'nu' : String(a.in_curs);
    if (!['da', 'nu'].includes(inCurs)) e(`in_curs „${a.in_curs}” trebuie să fie da sau nu`);
    verificaSegmente(folder, nume, x.segmente, a.durata, erori, avertismente);
    const activitate = familie === 'activitate';
    const obiective = indexuriObiective(a.obiective, nume, erori);
    piese.set(id, {
      obiective, etichete: citesteEtichete(a.etichete, nume, erori),
      id, fisier: nume, titlu: a.titlu, durata: a.durata, tip: a.tip, familie: familie ?? null,
      format: activitate ? a.format : null, energie: activitate ? a.energie : null, obiectiv: a.obiectiv ?? '', ancora: a.ancora ?? '',
      module: Array.isArray(a.module) ? a.module.map(String) : [], materiale: Array.isArray(a.materiale) ? a.materiale : [],
      in_curs: inCurs === 'da' && a.tip !== 'pauza', segmente: x.segmente,
    });
  }
  return piese;
}

/** Agenda ediției → rânduri { fel: 'modul', modul, piese } | { fel: 'piesa', piesa } | { fel: 'pauza', titlu, durata }. */
function citesteAgenda(editie, module, piese, erori) {
  const dupaId = new Map(module.map((m) => [m.id, m]));
  const loc = `ediția ${editie.fisier ?? ''}`.trim();
  const alege = (ids, unde) => ids.map((id) => {
    const p = piese.get(String(id));
    if (!p) erori.push(`${unde}: piesa „${id}” nu există în piese/`);
    return p;
  }).filter(Boolean);
  if (editie.agenda === undefined || editie.agenda === null) {
    return module.map((m) => ({ fel: 'modul', modul: m, piese: alege(m.implicite, `${m.fisier} (implicite)`) }));
  }
  if (!Array.isArray(editie.agenda)) { erori.push(`${loc}: „agenda” trebuie să fie o listă`); return []; }
  const folosite = new Set();
  const randuri = [];
  const comun = (id, unde) => { if (String(id).startsWith('comun/')) { erori.push(`${unde}: „${id}” trimite la biblioteca comună, care nu există încă (vine după 25). Pune piesa în piese/ a cursului`); return true; } return false; };
  editie.agenda.forEach((r, i) => {
    const unde = `${loc}, agenda, rândul ${i + 1}`;
    const obiect = r && typeof r === 'object' && !Array.isArray(r);
    if (obiect && 'pauza' in r && !('modul' in r)) {
      const necunoscute = Object.keys(r).filter((k) => !['pauza', 'titlu'].includes(k));
      if (necunoscute.length) erori.push(`${unde}: câmp necunoscut la pauză („${necunoscute.join('”, „')}”)`);
      if (!(Number.isInteger(r.pauza) && r.pauza > 0)) { erori.push(`${unde}: „pauza” trebuie să fie un număr de minute`); return; }
      randuri.push({ fel: 'pauza', titlu: r.titlu ? String(r.titlu) : 'Pauză', durata: r.pauza });
      return;
    }
    let id, ids;
    if (typeof r === 'string') id = r;
    else if (obiect && 'modul' in r && !('pauza' in r)) {
      id = r.modul;
      if ('exercitii' in r) erori.push(`${unde}: „exercitii” a devenit „piese” (v1.2)`);
      const necunoscute = Object.keys(r).filter((k) => !['modul', 'piese', 'exercitii'].includes(k));
      if (necunoscute.length) erori.push(`${unde}: câmp necunoscut („${necunoscute.join('”, „')}”)`);
      if ('piese' in r) {
        if (r.piese !== null && !Array.isArray(r.piese)) { erori.push(`${unde}: „piese” trebuie să fie o listă (sau [] pentru niciuna)`); return; }
        ids = (r.piese ?? []).map(String);
      }
    } else { erori.push(`${unde}: un rând din agendă e un id (modul sau piesă), „modul: …” sau „pauza: <minute>”`); return; }
    if (comun(id, unde)) return;
    const m = dupaId.get(String(id));
    if (!m) {
      // Un id simplu poate fi și o piesă singură (id-urile sunt unice în tot cursul).
      const p = typeof r === 'string' ? piese.get(String(id)) : null;
      if (p) { randuri.push({ fel: 'piesa', piesa: p }); return; }
      erori.push(`${unde}: „${id}” nu e nici modul, nici piesă`); return;
    }
    if (folosite.has(m.id)) { erori.push(`${unde}: modulul „${m.id}” apare de două ori în agendă`); return; }
    folosite.add(m.id);
    if (ids) { ids.filter((x) => comun(x, unde)); ids = ids.filter((x) => !String(x).startsWith('comun/')); }
    if (ids && new Set(ids).size !== ids.length) erori.push(`${unde}: o piesă apare de două ori la modulul „${m.id}”`);
    randuri.push({ fel: 'modul', modul: m, piese: alege(ids ?? m.implicite, ids ? unde : `${m.fisier} (implicite)`) });
  });
  return randuri;
}

export function citesteCurs(folder, { editie: numeEditie } = {}) {
  const erori = [], avertismente = [];
  if (!existsSync(join(folder, 'curs.yml'))) {
    return { erori: [`${folder}: lipsește curs.yml (nu pare folderul unui curs)`], avertismente };
  }
  const curs = citesteYaml(join(folder, 'curs.yml'), erori);
  const cere = (cond, mesaj) => { if (!cond) erori.push(`curs.yml: ${mesaj}`); };
  for (const c of ['titlu', 'promisiune', 'brand', 'limba', 'durata_zi', 'public', 'slug']) cere(curs[c] !== undefined && String(curs[c]).trim() !== '', `lipsește „${c}”`);
  if (curs.brand) cere(BRANDURI.includes(curs.brand), `brand „${curs.brand}” necunoscut (${BRANDURI.join(' / ')})`);
  if (curs.limba) cere(LIMBI.includes(curs.limba), `limba „${curs.limba}” necunoscută (${LIMBI.join(' / ')})`);
  if (curs.public !== undefined) cere(PUBLIC.includes(String(curs.public)), `public „${curs.public}” necunoscut (${PUBLIC.join(' / ')})`);
  if (curs.slug) cere(ID_OK.test(curs.slug), `slug „${curs.slug}” poate avea doar litere mici, cifre și cratimă`);
  const [ziStart, ziSfarsit] = String(curs.durata_zi ?? '').split(/\s*[–—-]\s*/).map(minute);
  if (curs.durata_zi) cere(ziStart != null && ziSfarsit != null && ziSfarsit > ziStart, `durata_zi „${curs.durata_zi}” trebuie să fie de forma 9:00–18:00`);

  // Ediția: cea cerută, altfel cea mai recentă din editii/, altfel niciuna.
  let editie = { data: null, ora_start: null, nume_interzise: [], nota_trainer: '' };
  const dirEditii = join(folder, 'editii');
  const editii = existsSync(dirEditii) ? readdirSync(dirEditii).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const aleasa = numeEditie ? editii.find((f) => f.replace(/\.ya?ml$/, '') === numeEditie) : editii.at(-1);
  if (numeEditie && !aleasa) erori.push(`editii/: nu găsesc ediția „${numeEditie}” (am: ${editii.join(', ') || 'niciuna'})`);
  if (aleasa) editie = { ...editie, ...citesteYaml(join(dirEditii, aleasa), erori), fisier: aleasa };
  else avertismente.push('nicio ediție în editii/: folosesc toate modulele, ora de început din durata_zi și nicio listă de nume interzise');
  editie.data = editie.data instanceof Date ? editie.data.toISOString().slice(0, 10) : editie.data ? String(editie.data) : null;
  if (editie.sari_peste !== undefined) erori.push(`ediția ${aleasa}: „sari_peste” nu mai există (v1.1). Scoate modulul din „agenda”`);
  if (!Array.isArray(editie.nume_interzise)) { erori.push(`ediția ${aleasa}: „nume_interzise” trebuie să fie o listă, de exemplu []`); editie.nume_interzise = []; }
  const oraStart = editie.ora_start != null ? minute(editie.ora_start) : ziStart;
  if (editie.ora_start != null && oraStart == null) erori.push(`ediția ${aleasa}: ora_start „${editie.ora_start}” nu e o oră (9:00)`);

  const module = citesteModule(folder, erori, avertismente);
  const piese = citestePiese(folder, erori, avertismente);
  const iduriModule = new Set(module.map((m) => m.id));

  // Etichetele: grupate fără majuscule și diacritice; pe ecran rămâne forma folosită prima (modulele, apoi piesele, în ordinea fișierelor).
  const forme = new Map(); // cheie → { text, fisier }
  const etichete = new Map(); // cheie → { cheie, text, piese, module }
  for (const f of [...module, ...piese.values()]) {
    const vazute = new Set();
    f.etichete = f.etichete.map((t) => {
      const cheie = normal(t);
      const prima = forme.get(cheie);
      if (!prima) forme.set(cheie, { text: t, fisier: f.fisier });
      else if (prima.text !== t) avertismente.push(`${f.fisier}: eticheta „${t}” diferă doar prin majuscule sau diacritice de „${prima.text}” (${prima.fisier}); folosesc „${prima.text}”`);
      return { cheie, text: forme.get(cheie).text };
    }).filter((x) => x.cheie && !vazute.has(x.cheie) && vazute.add(x.cheie));
    for (const x of f.etichete) {
      if (!etichete.has(x.cheie)) etichete.set(x.cheie, { cheie: x.cheie, text: x.text, piese: 0, module: 0 });
      etichete.get(x.cheie)[piese.has(f.id) && f.fisier.startsWith('piese/') ? 'piese' : 'module']++;
    }
  }

  // Id-urile sunt unice în tot cursul: un id simplu din agendă e fie modul, fie piesă.
  for (const m of module) if (piese.has(m.id)) erori.push(`${m.fisier}: id „${m.id}” e folosit și de piesa piese/${m.id}.md; id-urile sunt unice în tot cursul`);
  // Legăturile: modulele propun piese care trebuie să existe; o piesă nu e și implicită, și alternativă.
  for (const m of module) {
    for (const id of [...m.implicite, ...m.alternative]) if (!piese.has(id)) erori.push(`${m.fisier}: piesa „${id}” (din piese) nu există în piese/`);
    for (const id of m.implicite) if (m.alternative.includes(id)) erori.push(`${m.fisier}: piesa „${id}” e și în implicite, și în alternative`);
  }
  for (const x of piese.values()) for (const id of x.module) if (!iduriModule.has(id)) erori.push(`${x.fisier}: modulul „${id}” (din module) nu există`);

  // Agenda și orele: ora_start + duratele, în ordinea din agendă. Un modul durează cât el plus piesele alese.
  const agenda = citesteAgenda(editie, module, piese, erori);
  const nr = (x) => (Number.isInteger(x) ? x : 0);
  let t = oraStart ?? 0;
  for (const r of agenda) {
    if (r.fel === 'modul') {
      for (const x of r.piese) if (x.module.length && !x.module.includes(r.modul.id)) avertismente.push(`${x.fisier}: e aleasă la modulul „${r.modul.id}”, care nu e în lista ei „module”`);
      r.durataModul = nr(r.modul.durata);
      r.durataPiese = r.piese.reduce((s, x) => s + nr(x.durata), 0);
      r.durata = r.durataModul + r.durataPiese;
    } else if (r.fel === 'piesa') r.durata = nr(r.piesa.durata);
    r.start = t; r.sfarsit = t + r.durata; t = r.sfarsit;
  }
  const ePauza = (r) => r && (r.fel === 'pauza' || (r.fel === 'piesa' && r.piesa.tip === 'pauza') || (r.fel === 'modul' && r.modul.tip === 'pauza'));
  agenda.forEach((r, i) => {
    const urm = agenda[i + 1];
    if (r.fel === 'modul' && r.durata > 90 && urm && !ePauza(urm) && !ePauza(r)) avertismente.push(`agenda: „${r.modul.id}” ține ${r.durata} min și nu are o pauză după`);
  });
  if (ziStart != null && ziSfarsit != null && oraStart != null && t > ziSfarsit) {
    // Alex (2026-11-17): depășirea se vede în material, ca s-o poată corecta în timp ce face agenda. Nu mai oprește build-ul.
    avertismente.push(`agenda nu încape în ziua cursului: începe la ${ora(oraStart)}, se termină la ${ora(t)}, iar ziua (durata_zi) se termină la ${ora(ziSfarsit)}. Scurtează, scoate un modul din agendă sau alege un exercițiu mai scurt`);
  }
  if (oraStart != null && ziStart != null && oraStart < ziStart) avertismente.push(`ora_start ${ora(oraStart)} e înainte de începutul zilei (${ora(ziStart)})`);
  const inAgenda = new Set(agenda.filter((r) => r.fel === 'modul').map((r) => r.modul.id));
  for (const m of module) m.inAgenda = inAgenda.has(m.id);

  // Totalurile zilei (D-053): suma agendei și cât rămâne până la sfârșitul zilei (negativ = depășire, arătată în material și ca avertisment).
  // Obiectivele zilei (Alex, 2026-11-17): lista din curs.yml; ediția o poate înlocui (de exemplu, ce a cerut clientul).
  const obiective = [];
  const citesteObiective = (v, unde) => {
    if (!Array.isArray(v) || !v.every((x) => typeof x === 'string' && x.trim())) { erori.push(`${unde}: „obiective” e o listă de texte scurte`); return null; }
    return v.map((x) => x.trim());
  };
  let sursaOb = null;
  if (editie.obiective !== undefined && editie.obiective !== null) { sursaOb = `ediția ${aleasa}`; obiective.push(...(citesteObiective(editie.obiective, sursaOb) ?? [])); }
  else if (curs.obiective !== undefined && curs.obiective !== null) { sursaOb = 'curs.yml'; obiective.push(...(citesteObiective(curs.obiective, sursaOb) ?? [])); }
  for (const o of obiective) if (cuvinte(o) > 12) avertismente.push(`${sursaOb}: obiectivul „${o}” are ${cuvinte(o)} cuvinte; în schiță merge mai bine sub 12`);
  for (const f of [...module, ...piese.values()]) for (const n of f.obiective) {
    if (n > obiective.length) avertismente.push(`${f.fisier}: obiective conține ${n}, dar ziua are ${obiective.length} ${obiective.length === 1 ? 'obiectiv' : 'obiective'}; îl ignor`);
  }

  const total = { agenda: t - (oraStart ?? 0), zi: ziStart != null && ziSfarsit != null ? ziSfarsit - ziStart : null, ramas: ziSfarsit != null ? ziSfarsit - t : null, sfarsit: t };
  return { folder, curs: { ...curs, zi_start: ziStart, zi_sfarsit: ziSfarsit }, editie: { ...editie, start: oraStart }, module, piese, agenda, total, obiective, etichete: [...etichete.values()].sort((a, b) => a.text.localeCompare(b.text, 'ro')), erori, avertismente };
}

/**
 * Conținutul unui rând de agendă, în ordine. Pentru un modul: segmentele lui, cu piesele alese puse în locul lui „::piese”
 * (sau la final, dacă linia lipsește). Pentru o piesă singură: doar piesa. Fiecare piesă e încadrată de
 * { strat: 'piesa-inceput' / 'piesa-sfarsit', piesa }, iar segmentele ei au câmpul `piesa`.
 */
export function desfasoara(r) {
  const out = [];
  const pune = (lista) => {
    for (const x of lista) {
      out.push({ strat: 'piesa-inceput', piesa: x });
      for (const s of x.segmente) out.push({ ...s, piesa: x });
      out.push({ strat: 'piesa-sfarsit', piesa: x });
    }
  };
  if (r.fel === 'piesa') { pune([r.piesa]); return out; }
  if (r.fel !== 'modul') return out;
  let pus = false;
  for (const s of r.modul.segmente) {
    if (s.strat === 'piese') { pune(r.piese); pus = true; } else out.push(s);
  }
  if (!pus) pune(r.piese);
  return out;
}
