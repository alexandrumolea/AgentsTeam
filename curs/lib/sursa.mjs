// Citește folderul unui curs și verifică tot ce cere arhitectura (Radu, v1.1: 1.3–1.8).
// Nu scrie nimic. Întoarce { curs, editie, module, exercitii, agenda, erori, avertismente }.
// Agenda (ordinea zilei, exercițiile alese, pauzele) vine din ediție; restul codului lucrează doar cu `agenda`.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, normalize } from 'node:path';
import { parse as parseYaml } from 'yaml';

export const STRATURI = ['sala', 'sala-si-curs', 'trainer', 'participant'];
export const TIPURI = ['teorie', 'exercitiu', 'reflectie', 'mesaj', 'pauza'];
export const TIPURI_EX = ['exercitiu', 'reflectie', 'energizant'];
export const FORMATE = ['individual', 'perechi', 'grup', 'plen'];
export const ENERGII = ['calm', 'mediu', 'activ'];
const BRANDURI = ['innersis', 'bemore-ls'];
const LIMBI = ['ro', 'en'];
const PUBLIC = ['nu', 'link', 'da'];
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const MARCAJ = '::exercitii';

export const cuvinte = (s) => String(s).replace(/[*_`#>\[\]()!]/g, ' ').split(/\s+/).filter(Boolean).length;

/** „9:00” → 540. Întoarce null dacă nu e o oră. */
export function minute(ora) {
  const m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(String(ora ?? ''));
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return +m[1] * 60 + +m[2];
}
export const ora = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;
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
 * Linia „::exercitii” (doar în module) devine segmentul { strat: 'exercitii' }: locul exercițiilor alese.
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
      if (++marcaje > 1) { erori.push(`${fisier}:${nr}: „${MARCAJ}” apare de două ori; exercițiile intră într-un singur loc`); return; }
      inchide();
      segmente.push({ strat: 'exercitii', md: '', atribute: {}, linia: nr, fisier });
      curent = { strat: 'text', linii: [], linia: nr + 1, atribute: {} };
      return;
    }
    if (/^::[A-Za-z]/.test(t)) { erori.push(`${fisier}:${nr}: „${t}” nu e cunoscut. Se poate doar „${MARCAJ}”`); return; }
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
    if (a.durata !== undefined && !(Number.isInteger(a.durata) && a.durata > 0)) e(`durata „${a.durata}” trebuie să fie un număr de minute`);
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
    const ex = a.exercitii ?? {};
    if (typeof ex !== 'object' || Array.isArray(ex)) e('„exercitii” trebuie să aibă forma { implicite: [...], alternative: [...] }');
    for (const k of Object.keys(typeof ex === 'object' && !Array.isArray(ex) ? ex : {})) if (!['implicite', 'alternative'].includes(k)) e(`„exercitii.${k}” necunoscut (se pot: implicite, alternative)`);
    verificaSegmente(folder, f, mod.segmente, a.durata, erori, avertismente);
    module.push({
      fisier: f, id: a.id, titlu: a.titlu, durata: a.durata, tip: a.tip, ancora: a.ancora ?? '',
      schita: Array.isArray(a.schita) ? a.schita : [], materiale: Array.isArray(a.materiale) ? a.materiale : [],
      implicite: lista(ex.implicite).map(String), alternative: lista(ex.alternative).map(String),
      segmente: mod.segmente,
    });
  }
  return module;
}

function citesteBanca(folder, erori, avertismente) {
  const dir = join(folder, 'exercitii');
  const exercitii = new Map();
  if (!existsSync(dir)) return exercitii;
  const vazute = new Map();
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.md')).sort()) {
    const id = f.replace(/\.md$/, '');
    const nume = `exercitii/${f}`;
    const e = (msg) => erori.push(`${nume}: ${msg}`);
    if (!ID_OK.test(id)) { e(`numele fișierului e id-ul exercițiului și poate avea doar litere mici, cifre și cratimă`); continue; }
    const cheie = id.toLowerCase();
    if (vazute.has(cheie)) { e(`id „${id}” mai e folosit de ${vazute.get(cheie)}`); continue; }
    vazute.set(cheie, nume);
    const x = citesteFisier(join(dir, f), nume, erori, { marcaj: false });
    if (!x) continue;
    const a = x.antet;
    for (const c of ['titlu', 'durata', 'format', 'tip', 'energie', 'obiectiv']) if (a[c] === undefined || a[c] === null || a[c] === '') e(`lipsește „${c}” din antet`);
    if (a.durata !== undefined && !(Number.isInteger(a.durata) && a.durata > 0)) e(`durata „${a.durata}” trebuie să fie un număr de minute`);
    if (a.format !== undefined && !FORMATE.includes(a.format)) e(`format „${a.format}” necunoscut (${FORMATE.join(' / ')})`);
    if (a.tip !== undefined && !TIPURI_EX.includes(a.tip)) e(`tip „${a.tip}” necunoscut (${TIPURI_EX.join(' / ')})`);
    if (a.energie !== undefined && !ENERGII.includes(a.energie)) e(`energie „${a.energie}” necunoscută (${ENERGII.join(' / ')})`);
    if (a.id !== undefined && String(a.id) !== id) e(`antetul spune id „${a.id}”, dar id-ul e numele fișierului („${id}”). Scoate „id” din antet`);
    if (a.materiale !== undefined && !Array.isArray(a.materiale)) e('„materiale” trebuie să fie o listă');
    if (a.module !== undefined && !Array.isArray(a.module)) e('„module” trebuie să fie o listă de id-uri');
    const inCurs = a.in_curs === undefined ? 'da' : a.in_curs === true ? 'da' : a.in_curs === false ? 'nu' : String(a.in_curs);
    if (!['da', 'nu'].includes(inCurs)) e(`in_curs „${a.in_curs}” trebuie să fie da sau nu`);
    verificaSegmente(folder, nume, x.segmente, a.durata, erori, avertismente);
    exercitii.set(id, {
      id, fisier: nume, titlu: a.titlu, durata: a.durata, format: a.format, tip: a.tip, energie: a.energie, obiectiv: a.obiectiv ?? '',
      module: Array.isArray(a.module) ? a.module.map(String) : [], materiale: Array.isArray(a.materiale) ? a.materiale : [],
      in_curs: inCurs === 'da', segmente: x.segmente,
    });
  }
  return exercitii;
}

/** Agenda ediției → listă de rânduri { fel: 'modul', modul, exercitii } | { fel: 'pauza', titlu, durata }. */
function citesteAgenda(editie, module, exercitii, erori) {
  const dupaId = new Map(module.map((m) => [m.id, m]));
  const loc = `ediția ${editie.fisier ?? ''}`.trim();
  const alege = (m, ids, unde) => ids.map((id) => {
    const ex = exercitii.get(String(id));
    if (!ex) erori.push(`${unde}: exercițiul „${id}” nu există în exercitii/`);
    return ex;
  }).filter(Boolean);
  if (editie.agenda === undefined || editie.agenda === null) {
    return module.map((m) => ({ fel: 'modul', modul: m, exercitii: alege(m, m.implicite, m.fisier) }));
  }
  if (!Array.isArray(editie.agenda)) { erori.push(`${loc}: „agenda” trebuie să fie o listă`); return []; }
  const folosite = new Set();
  const randuri = [];
  editie.agenda.forEach((r, i) => {
    const unde = `${loc}, agenda, rândul ${i + 1}`;
    let id, ids;
    if (typeof r === 'string') id = r;
    else if (r && typeof r === 'object' && !Array.isArray(r) && 'pauza' in r && !('modul' in r)) {
      const necunoscute = Object.keys(r).filter((k) => !['pauza', 'titlu'].includes(k));
      if (necunoscute.length) erori.push(`${unde}: câmp necunoscut la pauză („${necunoscute.join('”, „')}”)`);
      if (!(Number.isInteger(r.pauza) && r.pauza > 0)) { erori.push(`${unde}: „pauza” trebuie să fie un număr de minute`); return; }
      randuri.push({ fel: 'pauza', titlu: r.titlu ? String(r.titlu) : 'Pauză', durata: r.pauza });
      return;
    } else if (r && typeof r === 'object' && !Array.isArray(r) && 'modul' in r && !('pauza' in r)) {
      id = r.modul;
      const necunoscute = Object.keys(r).filter((k) => !['modul', 'exercitii'].includes(k));
      if (necunoscute.length) erori.push(`${unde}: câmp necunoscut („${necunoscute.join('”, „')}”)`);
      if ('exercitii' in r) {
        if (r.exercitii !== null && !Array.isArray(r.exercitii)) { erori.push(`${unde}: „exercitii” trebuie să fie o listă (sau [] pentru niciunul)`); return; }
        ids = (r.exercitii ?? []).map(String);
      }
    } else { erori.push(`${unde}: un rând din agendă e fie un id de modul, fie „modul: …”, fie „pauza: <minute>”`); return; }
    const m = dupaId.get(String(id));
    if (!m) { erori.push(`${unde}: modulul „${id}” nu există`); return; }
    if (folosite.has(m.id)) { erori.push(`${unde}: modulul „${m.id}” apare de două ori în agendă`); return; }
    folosite.add(m.id);
    if (ids && new Set(ids).size !== ids.length) erori.push(`${unde}: un exercițiu apare de două ori la modulul „${m.id}”`);
    randuri.push({ fel: 'modul', modul: m, exercitii: alege(m, ids ?? m.implicite, ids ? unde : `${m.fisier} (implicite)`) });
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
  const exercitii = citesteBanca(folder, erori, avertismente);
  const iduriModule = new Set(module.map((m) => m.id));

  // Legăturile din bancă: modulele propun exerciții care trebuie să existe; un exercițiu nu e și implicit, și alternativă.
  for (const m of module) {
    for (const id of [...m.implicite, ...m.alternative]) if (!exercitii.has(id)) erori.push(`${m.fisier}: exercițiul „${id}” (din exercitii) nu există în exercitii/`);
    for (const id of m.implicite) if (m.alternative.includes(id)) erori.push(`${m.fisier}: exercițiul „${id}” e și în implicite, și în alternative`);
  }
  for (const x of exercitii.values()) for (const id of x.module) if (!iduriModule.has(id)) erori.push(`${x.fisier}: modulul „${id}” (din module) nu există`);

  // Agenda și orele: ora_start + duratele, în ordinea din agendă. Un modul durează cât el plus exercițiile alese.
  const agenda = citesteAgenda(editie, module, exercitii, erori);
  let t = oraStart ?? 0;
  for (const r of agenda) {
    if (r.fel === 'modul') {
      for (const x of r.exercitii) if (x.module.length && !x.module.includes(r.modul.id)) avertismente.push(`${x.fisier}: e ales la modulul „${r.modul.id}”, care nu e în lista lui „module”`);
      r.durata = (Number.isInteger(r.modul.durata) ? r.modul.durata : 0) + r.exercitii.reduce((s, x) => s + (Number.isInteger(x.durata) ? x.durata : 0), 0);
    }
    r.start = t; r.sfarsit = t + r.durata; t = r.sfarsit;
  }
  agenda.forEach((r, i) => {
    const urm = agenda[i + 1];
    if (r.fel === 'modul' && r.durata > 90 && urm && urm.fel !== 'pauza' && r.modul.tip !== 'pauza') avertismente.push(`agenda: „${r.modul.id}” ține ${r.durata} min și nu are o pauză după`);
  });
  if (ziStart != null && ziSfarsit != null && oraStart != null && t > ziSfarsit) {
    erori.push(`agenda nu încape în ziua cursului: începe la ${ora(oraStart)}, se termină la ${ora(t)}, iar ziua (durata_zi) se termină la ${ora(ziSfarsit)}. Scurtează, scoate un modul din agendă sau alege un exercițiu mai scurt`);
  }
  if (oraStart != null && ziStart != null && oraStart < ziStart) avertismente.push(`ora_start ${ora(oraStart)} e înainte de începutul zilei (${ora(ziStart)})`);
  const inAgenda = new Set(agenda.filter((r) => r.fel === 'modul').map((r) => r.modul.id));
  for (const m of module) m.inAgenda = inAgenda.has(m.id);

  return { folder, curs: { ...curs, zi_start: ziStart, zi_sfarsit: ziSfarsit }, editie: { ...editie, start: oraStart }, module, exercitii, agenda, erori, avertismente };
}

/**
 * Conținutul unui rând de agendă, în ordine: segmentele modulului, cu exercițiile alese puse în locul lui „::exercitii”
 * (sau la final, dacă linia lipsește). Fiecare exercițiu e încadrat de { strat: 'exercitiu-inceput' / 'exercitiu-sfarsit', exercitiu }.
 */
export function desfasoara(r) {
  const piese = [];
  const puneExercitii = () => {
    for (const x of r.exercitii) {
      piese.push({ strat: 'exercitiu-inceput', exercitiu: x });
      for (const s of x.segmente) piese.push({ ...s, exercitiu: x });
      piese.push({ strat: 'exercitiu-sfarsit', exercitiu: x });
    }
  };
  let pus = false;
  for (const s of r.modul.segmente) {
    if (s.strat === 'exercitii') { puneExercitii(); pus = true; } else piese.push(s);
  }
  if (!pus) puneExercitii();
  return piese;
}
