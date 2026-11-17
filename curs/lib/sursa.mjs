// Citește folderul unui curs și verifică tot ce cere arhitectura (Radu, v1, 1.3–1.7).
// Nu scrie nimic. Întoarce { curs, editie, module, erori, avertismente }.
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, basename, normalize } from 'node:path';
import { parse as parseYaml } from 'yaml';

export const STRATURI = ['sala', 'sala-si-curs', 'trainer', 'participant'];
export const TIPURI = ['teorie', 'exercitiu', 'reflectie', 'mesaj', 'pauza'];
const BRANDURI = ['innersis', 'bemore-ls'];
const LIMBI = ['ro', 'en'];
const PUBLIC = ['nu', 'link', 'da'];
const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export const cuvinte = (s) => String(s).replace(/[*_`#>\[\]()!]/g, ' ').split(/\s+/).filter(Boolean).length;

/** „9:00” → 540. Întoarce null dacă nu e o oră. */
export function minute(ora) {
  const m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(String(ora ?? ''));
  if (!m || +m[1] > 23 || +m[2] > 59) return null;
  return +m[1] * 60 + +m[2];
}
export const ora = (min) => `${Math.floor(min / 60)}:${String(min % 60).padStart(2, '0')}`;

function citesteYaml(fisier, erori) {
  try {
    const v = parseYaml(readFileSync(fisier, 'utf8'));
    return v && typeof v === 'object' ? v : {};
  } catch (e) {
    erori.push(`${fisier}: YAML greșit (${e.message.split('\n')[0]})`);
    return {};
  }
}

/** Împarte corpul unui modul în segmente pe straturi. Orice bloc greșit devine eroare. */
export function imparteInStraturi(corp, fisier, liniaStart, erori) {
  const segmente = [];
  let curent = { strat: 'text', linii: [], linia: liniaStart, atribute: {} };
  let deschis = null;
  const inchide = () => {
    const md = curent.linii.join('\n').trim();
    if (md || curent.strat !== 'text') segmente.push({ strat: curent.strat, md, atribute: curent.atribute, linia: curent.linia });
  };
  corp.split('\n').forEach((rand, i) => {
    const nr = liniaStart + i;
    const t = rand.trim();
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

function citesteModul(fisier, erori) {
  const text = readFileSync(fisier, 'utf8').replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(text);
  if (!m) { erori.push(`${fisier}: lipsește antetul (--- … ---) de la început`); return null; }
  let antet = {};
  try { antet = parseYaml(m[1]) ?? {}; } catch (e) { erori.push(`${fisier}: antet YAML greșit (${e.message.split('\n')[0]})`); return null; }
  const liniaCorp = m[0].split('\n').length;
  const segmente = imparteInStraturi(text.slice(m[0].length), fisier, liniaCorp, erori);
  return { fisier, antet, segmente };
}

/** Imaginile dintr-un text markdown: ![alt](cale). */
export const imaginiDin = (md) => [...md.matchAll(/!\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g)].map((x) => x[1]);

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
  let editie = { data: null, ora_start: null, sari_peste: [], nume_interzise: [], nota_trainer: '' };
  const dirEditii = join(folder, 'editii');
  const editii = existsSync(dirEditii) ? readdirSync(dirEditii).filter((f) => /\.ya?ml$/.test(f)).sort() : [];
  const aleasa = numeEditie ? editii.find((f) => f.replace(/\.ya?ml$/, '') === numeEditie) : editii.at(-1);
  if (numeEditie && !aleasa) erori.push(`editii/: nu găsesc ediția „${numeEditie}” (am: ${editii.join(', ') || 'niciuna'})`);
  if (aleasa) editie = { ...editie, ...citesteYaml(join(dirEditii, aleasa), erori), fisier: aleasa };
  else avertismente.push('nicio ediție în editii/: folosesc ora de început din durata_zi și nu am listă de nume interzise');
  editie.data = editie.data instanceof Date ? editie.data.toISOString().slice(0, 10) : editie.data ? String(editie.data) : null;
  for (const c of ['sari_peste', 'nume_interzise']) if (!Array.isArray(editie[c])) { erori.push(`ediția ${aleasa}: „${c}” trebuie să fie o listă, de exemplu []`); editie[c] = []; }
  const oraStart = editie.ora_start != null ? minute(editie.ora_start) : ziStart;
  if (editie.ora_start != null && oraStart == null) erori.push(`ediția ${aleasa}: ora_start „${editie.ora_start}” nu e o oră (9:00)`);

  // Modulele: fișierele .md, în ordinea din nume.
  const fisiere = readdirSync(folder).filter((f) => f.endsWith('.md') && !/^readme\.md$/i.test(f)).sort();
  if (!fisiere.length) erori.push(`${folder}: niciun modul (.md)`);
  const module = [];
  const iduri = new Set();
  for (const f of fisiere) {
    const cale = join(folder, f);
    const mod = citesteModul(cale, erori);
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

    for (const s of mod.segmente) {
      if (s.atribute.cronometru && Number.isInteger(a.durata) && s.atribute.cronometru > a.durata) {
        erori.push(`${f}:${s.linia}: cronometru=${s.atribute.cronometru} e mai lung decât modulul (${a.durata} min)`);
      }
      if ((s.strat === 'sala' || s.strat === 'sala-si-curs') && !s.md) erori.push(`${f}:${s.linia}: blocul „:::${s.strat}” e gol`);
      if ((s.strat === 'sala' || s.strat === 'sala-si-curs') && cuvinte(s.md) > 30) {
        avertismente.push(`${f}:${s.linia}: ecranul din sală are ${cuvinte(s.md)} cuvinte; pe proiector, mai puțin e mai bine (sub 30)`);
      }
      // Prezentarea trebuie să meargă fără internet: imaginile doar din materiale/ și doar dacă există.
      for (const src of imaginiDin(s.md)) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(src) || src.startsWith('//')) { erori.push(`${f}:${s.linia}: imaginea „${src}” e pe internet; pune-o în materiale/ (prezentarea merge fără internet)`); continue; }
        const n = normalize(src);
        if (!n.startsWith('materiale/') || n.includes('..')) { erori.push(`${f}:${s.linia}: imaginea „${src}” trebuie să fie în materiale/`); continue; }
        if (!existsSync(join(folder, n)) || !statSync(join(folder, n)).isFile()) erori.push(`${f}:${s.linia}: imaginea „${src}” nu există în materiale/`);
      }
    }
    module.push({
      fisier: f, id: a.id, titlu: a.titlu, durata: a.durata, tip: a.tip, ancora: a.ancora ?? '',
      schita: Array.isArray(a.schita) ? a.schita : [], materiale: Array.isArray(a.materiale) ? a.materiale : [],
      segmente: mod.segmente,
    });
  }

  for (const id of editie.sari_peste) if (!iduri.has(id)) erori.push(`ediția ${aleasa}: sari_peste conține „${id}”, care nu e id-ul niciunui modul`);

  // Programul zilei: ora fiecărui modul, din ora de start a ediției.
  let t = oraStart ?? 0;
  for (const m of module) {
    m.sarit = editie.sari_peste.includes(m.id);
    if (m.sarit || !Number.isInteger(m.durata)) continue;
    m.start = t; m.sfarsit = t + m.durata; t = m.sfarsit;
  }
  if (ziStart != null && ziSfarsit != null && oraStart != null && t > ziSfarsit) {
    erori.push(`modulele nu încap în ziua cursului: încep la ${ora(oraStart)}, se termină la ${ora(t)}, iar ziua (durata_zi) se termină la ${ora(ziSfarsit)}. Scurtează sau sari peste un modul (sari_peste)`);
  }
  if (oraStart != null && ziStart != null && oraStart < ziStart) avertismente.push(`ora_start ${ora(oraStart)} e înainte de începutul zilei (${ora(ziStart)})`);

  return { folder, curs: { ...curs, zi_start: ziStart, zi_sfarsit: ziSfarsit }, editie: { ...editie, start: oraStart }, module, erori, avertismente };
}

export const numeFolder = (f) => basename(f);
