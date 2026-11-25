// Build-ul site-ului v1 (direcția Spațiu, arhitectura v2).
// Citește content/, docs/taskuri.md, team/*/profil.md, docs/procese/ și istoricul git.
// Scrie un site static în site/dist (sau în OUT), plus api/live.json și api/continut.json.
//
// Variabile de mediu (toate opționale):
//   SITE_BASE  calea de bază a site-ului, cu „/” la final. Implicit „/” (domeniu propriu sau alexandrumolea.github.io).
//   SITE_URL   adresa publică completă (ex.: https://alex.ro/). Dacă `domeniu` din content/site.yml e completat, el are prioritate.
//   OUT        folderul de ieșire. Implicit site/dist.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, cpSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { deflateSync } from 'node:zlib';
import { parse as parseYaml } from 'yaml';
import { marked } from 'marked';
import { loadTema, checkUsage } from './tema.mjs';
import { citesteParcurs, orbita } from './orbita.mjs';
import { citestePagina } from './pagina-html.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const OUT = resolve(process.env.OUT || join(HERE, 'dist'));
const NOW = Date.now();
const TZ = 'Europe/Bucharest';
const warnings = [];
const warn = msg => { warnings.push(msg); console.warn(process.env.GITHUB_ACTIONS ? `::warning::${msg}` : `Atenție: ${msg}`); };
const fail = msg => { console.error(process.env.GITHUB_ACTIONS ? `::error::${msg}` : `Eroare: ${msg}`); process.exit(1); };

/* ---------- citire ---------- */
const read = p => readFileSync(join(ROOT, p), 'utf8');
const yamlFile = p => { try { return parseYaml(read(p)) || {}; } catch (e) { fail(`${p}: YAML invalid (${e.message})`); } };
function mdFile(p){
  const raw = read(p);
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: raw.trim() };
  try { return { data: parseYaml(m[1]) || {}, body: m[2].trim() }; } catch (e) { fail(`${p}: antet YAML invalid (${e.message})`); }
}

const site = yamlFile('content/site.yml');
const cat = yamlFile('content/categorii.yml');
const nevoi = (yamlFile('content/nevoi.yml').nevoi || []);
const despre = mdFile('content/despre.md');
// Culorile: un singur loc, content/tema.yml (vezi site/README.md, „Cum schimbi culorile”).
let TEMA; try { TEMA = loadTema(ROOT); } catch (e) { fail(e.message); }
const rgba = (name, a) => TEMA.rgba(name, a);

/* ---------- adrese ---------- */
let BASE = process.env.SITE_BASE || '/';
if (!BASE.startsWith('/')) BASE = '/' + BASE;
if (!BASE.endsWith('/')) BASE += '/';
const domeniu = String(site.domeniu || '').trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
// Domeniul din site.yml are prioritate: GitHub dă base_url cu http:// până se activează HTTPS.
let SITE_URL = (domeniu ? `https://${domeniu}/` : (process.env.SITE_URL || '')).trim();
if (SITE_URL && !SITE_URL.endsWith('/')) SITE_URL += '/';
const u = (p = '') => BASE + String(p).replace(/^\//, '');          // cale internă, cu baza
const abs = (p = '') => SITE_URL ? SITE_URL + String(p).replace(/^\//, '') : u(p);
const GH = String(site.github || '').replace(/\/$/, '');
const ghFile = p => GH ? `${GH}/blob/main/${p}` : '';
const ghCommit = sha => GH ? `${GH}/commit/${sha}` : '';

/* ---------- validare (o greșeală oprește build-ul, ca să nu se strice nimic în tăcere) ---------- */
const STARI = ['deschis', 'in-pregatire'];
const familii = cat.familii || [];
const famKeys = new Set(familii.map(f => f.cheie));
const CATS = (cat.categorii || []).map(c => ({ ...c, url: String(c.url || '').replace(/^\/|\/$/g, '') }));
{
  const seen = new Set();
  for (const c of CATS){
    for (const f of ['cheie', 'eticheta', 'fraza', 'url', 'familie', 'stare']) if (!c[f]) fail(`content/categorii.yml: categoria „${c.cheie || '?'}” nu are câmpul „${f}”.`);
    if (seen.has(c.cheie)) fail(`content/categorii.yml: cheia „${c.cheie}” apare de două ori.`);
    seen.add(c.cheie);
    if (c.familie !== 'titlu' && !famKeys.has(c.familie)) fail(`content/categorii.yml: „${c.cheie}” are familia „${c.familie}”, care nu e în lista familii.`);
    if (!STARI.includes(c.stare)) fail(`content/categorii.yml: „${c.cheie}” are starea „${c.stare}”. Permise: ${STARI.join(', ')}.`);
  }
  for (const k of ['live', 'despre']) if (!seen.has(k)) fail(`content/categorii.yml: lipsește categoria „${k}” (poate fi ascunsă cu vizibil: false, dar rămâne în listă).`);
  for (const c of CATS){
    if (c.vizibil === undefined){ warn(`content/categorii.yml: „${c.cheie}” nu are câmpul „vizibil”. O consider vizibilă.`); c.vizibil = true; }
    if (typeof c.vizibil !== 'boolean') fail(`content/categorii.yml: „${c.cheie}” are vizibil: ${c.vizibil}. Scrie true sau false.`);
  }
}
const famOrder = [...familii.map(f => f.cheie), 'titlu'];
CATS.sort((a, b) => famOrder.indexOf(a.familie) - famOrder.indexOf(b.familie) || (a.ordine || 0) - (b.ordine || 0));
// D-056: o secțiune ascunsă (vizibil: false) nu apare nicăieri. Mai jos, CATS și C au doar secțiunile vizibile.
const HIDDEN = CATS.filter(c => !c.vizibil);
CATS.splice(0, CATS.length, ...CATS.filter(c => c.vizibil));
if (!CATS.length) fail('content/categorii.yml: nicio secțiune nu e vizibilă. Pune vizibil: true la cel puțin una.');
// numerele de reper ale obiectelor din scenă (și din legendă), în ordinea legendei
{ let n = 0; for (const c of CATS) if (c.pe_orbita !== false) c.nr = ++n; }
const C = Object.fromEntries(CATS.map(c => [c.cheie, c]));

// Elementele unei secțiuni (câmpul `elemente` din categorii.yml), ex.: Innovations → „Procesul de training design cu AI”.
// Fiecare are pagina lui, la <secțiune>/<slug>/. Cu `pagina`, conținutul vine direct dintr-un fișier HTML din repo
// (o singură sursă: ce se schimbă acolo apare pe site la următorul build). Fără `pagina`, `link` duce în altă parte.
for (const c of CATS){
  if (c.elemente === undefined) continue;
  if (!Array.isArray(c.elemente)) fail(`content/categorii.yml: „${c.cheie}” are elemente care nu sunt o listă.`);
  const slugs = new Set();
  c.elemente = c.elemente.map((e, i) => {
    const w = `content/categorii.yml: „${c.cheie}”, elementul ${i + 1}`;
    if (!e || !e.titlu || !e.fraza) fail(`${w}: are nevoie de titlu și fraza.`);
    if (!e.pagina === !e.link) fail(`${w}: completează fie „pagina” (un fișier .html din repo), fie „link”.`);
    if (e.link && !/^https:\/\//.test(e.link)) fail(`${w}: „link” trebuie să înceapă cu https://.`);
    if (e.pagina){
      if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.slug || '')) fail(`${w}: „slug” lipsește sau are alte caractere decât litere mici, cifre și cratimă.`);
      if (slugs.has(e.slug)) fail(`${w}: slug-ul „${e.slug}” apare de două ori.`);
      slugs.add(e.slug);
      if (!/\.html$/.test(e.pagina) || !existsSync(join(ROOT, e.pagina))) fail(`${w}: nu găsesc pagina ${e.pagina}.`);
      if (e.cadru !== undefined && typeof e.cadru !== 'boolean') fail(`${w}: „cadru” e true sau false.`);
      // <title> din fișier = titlul din tab; titlul din categorii.yml rămâne cel din listă
      try { const { titlu: titluTab, ...p } = citestePagina(read(e.pagina), { scope: '.proces', where: e.pagina }); e = { ...e, ...p, titluTab }; } catch (er) { fail(er.message); }
      // locul paginii între antet și subsol. Cu cadru (implicit): pagina stă pe un card de sticlă, ca celelalte pagini
      // (lățimea ei de lucru e 980 px, plus marginile). Cu `cadru: false`: pagina își aduce singură sticla (șablonul paginii de curs).
      e.css = (e.cadru === false
        ? `main.proces{width:min(1080px,calc(100% - 2 * var(--gut)));margin:20px auto 0}\n`
        : `main.proces{width:min(1060px,calc(100% - 2 * var(--gut)));margin:28px auto 0;overflow:hidden}\n`) + e.css;
      e.url = `${c.url}/${e.slug}/`;
    }
    return e;
  });
}

const nevoiSlugs = new Set(nevoi.map(n => n.slug));
const BUSINESS = existsSync(join(ROOT, 'content/business')) ? readdirSync(join(ROOT, 'content/business')).filter(f => f.endsWith('.md')).map(f => {
  const { data } = mdFile(`content/business/${f}`);
  if (!data.nume) fail(`content/business/${f}: lipsește câmpul „nume”.`);
  for (const n of data.nevoi || []) if (!nevoiSlugs.has(n)) fail(`content/business/${f}: nevoia „${n}” nu există în content/nevoi.yml.`);
  if (data.link && !/^https:\/\//.test(data.link)) fail(`content/business/${f}: „link” trebuie să înceapă cu https://.`);
  return { slug: f.replace(/\.md$/, ''), nume: data.nume, ordine: data.ordine || 99, nevoie: data.nevoie || '', rol: data.rol || '', link: data.link || '', pod: data.pod || '', nevoi: data.nevoi || [] };
}).sort((a, b) => a.ordine - b.ordine) : [];

const rezervare = String(site.rezervare || '').trim();
if (rezervare && !/^https:\/\//.test(rezervare)) fail('content/site.yml: „rezervare” trebuie să fie un link https://.');
// „Desfă inovația” ține de Innovations: fără Innovations vizibil, centrul scenei rămâne liber.
// `in_centru.vizibil: false` îl ține ascuns și când Innovations e vizibil (Innovations are elemente, nucleul nu e încă reproiectat).
const centru = site.in_centru && site.in_centru.titlu && site.in_centru.vizibil !== false && C.inventii ? site.in_centru : null;
if (centru && (centru.straturi || []).length !== 5) fail('content/site.yml: in_centru.straturi are nevoie de exact 5 straturi (obiectul 3D actual are 5).');

// ---------- echipa (I-001): din team/<agent>/profil.md ----------
const ORDER = ['tudor', 'radu', 'ioana', 'mike', 'maria', 'sofia', 'victor', 'elena'];
const AGENTS = readdirSync(join(ROOT, 'team'), { withFileTypes: true }).filter(d => d.isDirectory() && existsSync(join(ROOT, 'team', d.name, 'profil.md'))).map(d => {
  const txt = read(`team/${d.name}/profil.md`);
  const h = (txt.match(/^#\s+(.+?)\s+[—–-]\s+(.+)$/m) || []);
  const field = k => ((txt.match(new RegExp(`\\*\\*${k}:\\*\\*\\s*(.+)`)) || [])[1] || '').trim();
  if (!h[1]) warn(`team/${d.name}/profil.md: primul rând nu are forma „# Nume — Rol”.`);
  return { slug: d.name, nume: h[1] || d.name, rol: h[2] || '', categorie: field('Categorie'), raporteaza: field('Raportează către'), status: field('Status'), profil: ghFile(`team/${d.name}/profil.md`) };
}).filter(a => !a.status || /activ/i.test(a.status))
  .sort((a, b) => (ORDER.indexOf(a.slug) + 1 || 99) - (ORDER.indexOf(b.slug) + 1 || 99) || a.slug.localeCompare(b.slug));

const PROCESE = readdirSync(join(ROOT, 'docs/procese')).filter(f => f.endsWith('.md') && f !== 'README.md').map(f => {
  const t = (read(`docs/procese/${f}`).match(/^#\s+(.+)$/m) || [])[1] || f;
  const clean = t.replace(/^Proces( automat)?:\s*/i, '');
  return { titlu: clean.charAt(0).toUpperCase() + clean.slice(1), link: ghFile(`docs/procese/${f}`) };
}).sort((a, b) => a.titlu.localeCompare(b.titlu, 'ro'));

/* ---------- Live: Jurnalul atelierului (arhitectura v2, 4.2–4.6; filtrul D-032) ---------- */
const L = site.live || {};
const HIDE = (L.ascunde_daca_contine || []).map(s => String(s).toLowerCase()).filter(Boolean);
const DELAY = (L.intarziere_oameni_ore ?? 24) * 36e5;
const OAMENI = Object.fromEntries((L.oameni_cu_acord || []).map(o => [String(o.slug).toLowerCase(), { nume: o.nume, tip: 'om' }]));
const PART = { ...Object.fromEntries(AGENTS.map(a => [a.slug, { nume: a.nume, tip: 'agent', rol: a.rol }])), ...OAMENI, colaborator: { nume: 'un colaborator', tip: 'om' } };
const byName = Object.fromEntries([...AGENTS.map(a => [a.nume.toLowerCase(), a.slug]), ...Object.entries(OAMENI).map(([s, o]) => [o.nume.toLowerCase(), s])]);
const who = name => byName[String(name).trim().toLowerCase()] || 'colaborator';
const isAgent = s => PART[s] && PART[s].tip === 'agent';

// text care arată a date private: email, telefon, sume de bani, chei. Rândul e oprit și apare un avertisment.
const PRIVATE = [/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/, /(\+40|\b0)7\d{2}[ .-]?\d{3}[ .-]?\d{3}\b/, /\d[\d.,]*\s?(lei|ron|eur|euro|usd)\b/i, /[€$£]\s?\d/, /\d\s?[€$£]/, /gh[pousr]_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9-]{20,}|AKIA[0-9A-Z]{16}/];
const looksPrivate = s => PRIVATE.some(r => r.test(s));
const hidden = s => { const l = String(s).toLowerCase(); return HIDE.some(h => l.includes(h)); };
const plain = s => String(s).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').replace(/\s+/g, ' ').trim();
const cut = (s, n = 120) => s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s;

const STATUS = [ // ordinea contează: potrivire după început
  ['nou', 'propus', 'nou'], ['de făcut', 'de făcut', 'facut'], ['în lucru', 'în lucru', 'lucru'], ['gata', 'gata', 'gata'],
  ['blocat', 'blocat', 'blocat'], ['la alex', 'așteaptă decizia lui Alex', 'alex'], ['anulat', null, null]
];
const statusOf = raw => { const l = plain(raw).toLowerCase(); const s = STATUS.find(([k]) => l.startsWith(k)); return s ? { cheie: s[0], text: s[1], cls: s[2] } : null; };

function parseTasks(md, where){
  const lines = md.split('\n');
  const hi = lines.findIndex(l => /^\|\s*ID\s*\|/.test(l));
  if (hi < 0) return null;
  const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
  const head = cells(lines[hi]).map(h => h.toLowerCase());
  const col = n => head.indexOf(n);
  const need = ['id', 'data', 'de la', 'pentru', 'task', 'status'];
  if (need.some(n => col(n) < 0)){ warn(`${where}: tabelul de taskuri nu are coloanele ${need.join(', ')}. Live ignoră versiunea asta.`); return null; }
  const rows = [];
  for (let i = hi + 2; i < lines.length && lines[i].trim().startsWith('|'); i++){
    const c = cells(lines[i]);
    const id = c[col('id')];
    if (!/^T-\d+$/.test(id)) continue;
    const rez = col('rezultat') >= 0 ? c[col('rezultat')] || '' : '';
    rows.push({ id, data: c[col('data')], de_la: c[col('de la')], pentru: c[col('pentru')], task: c[col('task')], status: c[col('status')], rezultat: rez });
  }
  return rows;
}
// Rezultatul devine link doar dacă e un fișier din repo (deci deja public).
function resultLink(cell){
  const m = String(cell).match(/\]\(([^)\s]+)\)/);
  if (!m || /^[a-z]+:/i.test(m[1])) return '';
  const p = resolve(ROOT, 'docs', m[1].split('#')[0]);
  if (!p.startsWith(ROOT + '/') || !existsSync(p)) return '';
  return ghFile(p.slice(ROOT.length + 1));
}

const git = (...args) => execFileSync('git', ['-C', ROOT, ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
let gitOk = true;
try { git('rev-parse', '--git-dir'); } catch { gitOk = false; warn('git nu e disponibil: Live se construiește doar din docs/taskuri.md, fără ore.'); }
if (gitOk && git('rev-parse', '--is-shallow-repository').trim() === 'true') warn('Istoric git incomplet (clone shallow): Live arată doar o parte din jurnal. În workflow, checkout-ul are nevoie de fetch-depth: 0.');

const events = [];
const taskCommits = new Set();
const skipped = { ascuns: 0, privat: 0, anulat: 0, oameni_in_asteptare: 0 };
const latestStatus = {}; // id -> ultima stare cunoscută (din HEAD)
const lastTouch = {};    // id -> ultima dată când s-a schimbat

function taskEvent(row, prev, sha, iso){
  const st = statusOf(row.status);
  latestStatus[row.id] = { row, st };
  if (!st || !st.text){ skipped.anulat++; return; }
  const text = plain(row.task);
  if (hidden(row.task) || hidden(row.de_la) || hidden(row.pentru)){ skipped.ascuns++; return; }
  if (looksPrivate(row.task)){ skipped.privat++; warn(`${row.id}: textul arată a date private (email, telefon sau sumă). Rândul nu apare în Live.`); return; }
  const de_la = who(row.de_la), pentru = who(row.pentru);
  const human = !isAgent(de_la) || !isAgent(pentru);
  const t = Date.parse(iso);
  if (human && NOW - t < DELAY){ skipped.oameni_in_asteptare++; return; }
  lastTouch[row.id] = t;
  const p = prev ? statusOf(prev.status) : null;
  events.push({
    id: `${sha.slice(0, 7)}-${row.id}`, tip: 'task', linie: 'echipa', ref: row.id,
    cand: human ? dayKey(t) : iso, ora_reala: !human,
    titlu: cut(text), stadiu: st.text, stadiu_cheie: st.cheie,
    detaliu: p && p.text && p.text !== st.text ? `${p.text} → ${st.text}` : '',
    de_la, pentru,
    rezultat: st.cheie === 'gata' ? resultLink(row.rezultat) : '',
    link: ghFile('docs/taskuri.md'), _t: t
  });
}

function dayKey(t){ return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(t); }

if (gitOk){
  // 1) taskurile: compară tabelul între commit-uri, după ID
  const hist = git('log', '--reverse', '--format=%H%x09%cI', '--', 'docs/taskuri.md').trim().split('\n').filter(Boolean);
  let prev = {};
  for (const line of hist){
    const [sha, iso] = line.split('\t');
    let md; try { md = git('show', `${sha}:docs/taskuri.md`); } catch { continue; }
    const rows = parseTasks(md, `docs/taskuri.md @ ${sha.slice(0, 7)}`);
    if (!rows) continue;
    const now = {};
    for (const r of rows){
      now[r.id] = r;
      const before = prev[r.id];
      if (!before || plain(before.status).toLowerCase() !== plain(r.status).toLowerCase()){ taskEvent(r, before, sha, iso); taskCommits.add(sha); }
      else latestStatus[r.id] = { row: r, st: statusOf(r.status) };
    }
    prev = now;
  }
  for (const id of Object.keys(latestStatus)) if (!prev[id]) delete latestStatus[id]; // rânduri scoase din tabel
  // 2) celelalte commit-uri: subiectul, dacă nu e ascuns. Fără autori, fără emailuri.
  const all = git('log', '--format=%H%x09%cI%x09%P%x09%s').trim().split('\n').filter(Boolean);
  for (const line of all){
    const [sha, iso, parents, ...rest] = line.split('\t');
    const subj = rest.join('\t');
    if (taskCommits.has(sha) || parents.split(' ').length > 1) continue;
    if (hidden(subj)){ skipped.ascuns++; continue; }
    if (looksPrivate(subj)){ skipped.privat++; warn(`commit ${sha.slice(0, 7)}: subiectul arată a date private. Nu apare în Live.`); continue; }
    events.push({ id: sha.slice(0, 7), tip: 'commit', linie: 'echipa', ref: sha.slice(0, 7), cand: iso, ora_reala: true, titlu: cut(plain(subj)), link: ghCommit(sha), _t: Date.parse(iso) });
  }
} else {
  const rows = parseTasks(read('docs/taskuri.md'), 'docs/taskuri.md') || [];
  for (const r of rows){ const t = Date.parse(r.data + 'T12:00:00Z') || NOW; taskEvent(r, null, '0000000', new Date(t).toISOString()); }
  events.forEach(e => { e.ora_reala = false; e.cand = dayKey(e._t); });
}
events.sort((a, b) => b._t - a._t || (b.ref > a.ref ? 1 : -1));

// Pe banc acum: ce e „în lucru” în versiunea curentă, doar între agenți, max. 3, cele mai recente.
const bench = Object.values(latestStatus).filter(({ row, st }) => st && st.cheie === 'în lucru' && !hidden(row.task) && !looksPrivate(row.task) && isAgent(who(row.de_la)) && isAgent(who(row.pentru)))
  .sort((a, b) => (lastTouch[b.row.id] || 0) - (lastTouch[a.row.id] || 0)).slice(0, 3)
  .map(({ row }) => ({ ref: row.id, titlu: cut(plain(row.task)), pentru: who(row.pentru) }));

const taskEvents = events.filter(e => e.tip === 'task');
const recent = taskEvents.filter(e => e.ora_reala && NOW - e._t < 864e5);
const lit = new Set(recent.flatMap(e => [e.de_la, e.pentru]).filter(isAgent));
const pulses = taskEvents.filter(e => e.ora_reala && isAgent(e.de_la) && isAgent(e.pentru) && e.de_la !== e.pentru).slice(0, 6).reverse().map(e => ({ de_la: e.de_la, pentru: e.pentru, id: e.id }));

const pub = e => { const { _t, ...rest } = e; return Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== '' && v !== undefined)); };
const liveJson = {
  generat: new Date(NOW).toISOString(),
  nota: L.nota || '',
  reguli: 'Doar munca din repo, după verificarea de date private. Agenții sunt agenți AI. Oamenii apar doar cu acordul lor, după 24 de ore, doar cu ziua. Fără „online acum”.',
  participanti: Object.fromEntries(Object.entries(PART).map(([s, p]) => [s, { nume: p.nume, tip: p.tip, ...(p.rol ? { rol: p.rol } : {}) }])),
  pe_banc: bench,
  evenimente: events.slice(0, 300).map(pub)
};

/* ---------- formatare ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fDay = t => new Intl.DateTimeFormat('ro-RO', { timeZone: TZ, day: 'numeric', month: 'short' }).format(t);
const fTime = t => new Intl.DateTimeFormat('ro-RO', { timeZone: TZ, hour: '2-digit', minute: '2-digit' }).format(t);
const fLongDay = t => new Intl.DateTimeFormat('ro-RO', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(t);
const pname = s => (PART[s] || PART.colaborator).nume;
const pcls = s => isAgent(s) ? '' : s === 'alex' ? 'alex' : 'om';
const whoHtml = s => `<b class="${pcls(s)}">${esc(pname(s))}</b>`;
const ext = href => /^https?:/.test(href) ? ' rel="noopener"' : '';

function feedRow(e, timeOnly = false){
  const when = timeOnly ? (e.ora_reala ? esc(fTime(e._t)) : '') : `${esc(fDay(e._t))}${e.ora_reala ? `<br>${esc(fTime(e._t))}` : ''}`;
  const text = e.rezultat ? `<a href="${esc(e.rezultat)}"${ext(e.rezultat)}>${esc(e.titlu)}</a>` : esc(e.titlu);
  return `<li data-ev="${esc(e.id)}"><span class="id">${when}</span><span class="who">${whoHtml(e.de_la)} <i>→</i> ${whoHtml(e.pentru)}</span><span class="st ${STATUS.find(s => s[0] === e.stadiu_cheie)?.[2] || ''}">${esc(e.stadiu)}</span><span class="task">${text}</span></li>`;
}
const benchHtml = () => bench.length ? bench.map(b => `<li><b>${esc(pname(b.pentru))}</b> ${esc(b.titlu)}</li>`).join('') : '<li>Nimic pe banc acum.</li>';

/* ---------- șabloane comune ---------- */
const famTitle = k => (familii.find(f => f.cheie === k) || {}).titlu || '';
const pageUrl = c => u(c.url + '/');
const stateHtml = c => c.stare === 'in-pregatire' ? `<p class="state"><span class="dot" aria-hidden="true"></span>${esc(site.in_pregatire || '')}</p>` : '';
const podHtml = c => c.pod ? `<p class="pod">${esc(c.pod)}</p>` : '';
// Câmpul opțional `detalii` din categorii.yml: perechi eticheta / text, ca listă (ex.: coaching).
const detaliiHtml = c => Array.isArray(c.detalii) && c.detalii.length ? `<ul class="list facts">${c.detalii.filter(d => d && d.eticheta && d.text).map(d => `<li><b>${esc(d.eticheta)}</b><span>${esc(d.text)}</span></li>`).join('')}</ul>` : '';
const bookBtn = cls => rezervare ? `<a class="btn book ${cls || ''}" href="${esc(rezervare)}" rel="noopener">Rezervă<span class="pv-long"> o sesiune</span></a>` : '';
// Contactul (content/site.yml → contact): capsula „Contact” și panoul ei, aceleași pe toate paginile.
// Mostra: team/ioana/documente/contact-propuneri-v1.html, varianta A „Capsula” (aleasă de Alex pe 2026-11-18).
// Panoul e un popover nativ: se deschide și se închide fără JavaScript (Esc și clicul în afară îl închid),
// focusul intră pe „Închide” (autofocus) și revine pe capsulă. Iconițele sunt SVG în linie: nimic extern.
const ICON = {
  bubble: '<path d="M7.5 4h9A3.5 3.5 0 0 1 20 7.5v5a3.5 3.5 0 0 1-3.5 3.5H12l-4.5 3.5V16A3.5 3.5 0 0 1 4 12.5v-5A3.5 3.5 0 0 1 7.5 4z"/><circle cx="8.6" cy="10" r=".6"/><circle cx="12" cy="10" r=".6"/><circle cx="15.4" cy="10" r=".6"/>',
  whatsapp: '<path d="M12 3.6a8.4 8.4 0 0 0-7.2 12.7L3.6 20.4l4.2-1.1A8.4 8.4 0 1 0 12 3.6z"/><path d="M9.3 8.3c.4-.4.9-.3 1.1.2l.6 1.4c.1.3 0 .6-.2.8l-.5.5a5.6 5.6 0 0 0 2.6 2.6l.5-.5c.2-.2.5-.3.8-.2l1.4.6c.5.2.6.8.2 1.1l-.6.6c-.6.6-1.6.8-2.4.4a9 9 0 0 1-4.1-4.1c-.4-.8-.2-1.8.4-2.4z" stroke-width="1.4"/>',
  email: '<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M4.6 7.6 12 13l7.4-5.4"/>',
  linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3.5"/><path d="M8 10.6v5.9M12 16.5v-5.9M12 13.3c0-1.7 1-2.8 2.5-2.8S17 11.6 17 13.3v3.2"/><circle cx="8" cy="7.7" r=".55"/>',
  instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="3.9"/><circle cx="17.1" cy="6.9" r=".55"/>',
  substack: '<path d="M5.5 4.5h13M5.5 8.5h13M5.5 12.5h13V20L12 16.4 5.5 20z"/>'
};
const svgIcon = k => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICON[k]}</svg>`;
// canalele cunoscute: numele scurt (apare la hover și la Tab) și, pentru WhatsApp și email, secretul din care vine linkul.
// Doar aceste două variabile de mediu pot ajunge în pagină; site.yml nu poate cere altele.
const CANALE = {
  whatsapp: { scurt: 'WhatsApp', mediu: 'CONTACT_WHATSAPP', link: v => { if (!/^\d{8,15}$/.test(v)) fail('CONTACT_WHATSAPP: numărul trebuie scris doar cu cifre, în format internațional, fără „+” (8–15 cifre).'); return `https://wa.me/${v}`; } },
  email: { scurt: 'Email', mediu: 'CONTACT_EMAIL', link: v => { if (!/^[^\s@<>"'()]+@[^\s@<>"'()]+\.[a-z]{2,}$/i.test(v)) fail('CONTACT_EMAIL: adresa nu arată ca un email (de forma nume@example.com).'); return `mailto:${v}`; } },
  linkedin: { scurt: 'LinkedIn' }, instagram: { scurt: 'Instagram' }, substack: { scurt: 'Substack' }
};
const CONTACT = (() => {
  const k = site.contact, F = 'content/site.yml: contact';
  if (!k) return null;
  const grupuri = (Array.isArray(k.grupuri) ? k.grupuri : []).map((g, gi) => {
    const canale = (Array.isArray(g?.canale) ? g.canale : []).map((c, ci) => {
      const unde = `${F}.grupuri[${gi + 1}].canale[${ci + 1}]`, def = CANALE[c?.canal];
      if (!def) fail(`${unde}: canalul „${c?.canal}” nu există. Canalele cunoscute: ${Object.keys(CANALE).join(', ')}.`);
      let link = '';
      if (def.mediu){
        if (c.link) fail(`${unde}: ${c.canal} nu se scrie în repo (e public). Linkul vine din secretul ${def.mediu}.`);
        const v = String(process.env[def.mediu] || '').trim();
        link = v ? def.link(v) : '';
      } else {
        link = String(c.link || '').trim();
        if (link && !/^https:\/\//.test(link)) fail(`${unde}: linkul trebuie să înceapă cu https://.`);
      }
      const nume = String(c.nume || def.scurt).trim();
      if (!nume.toLowerCase().includes(def.scurt.toLowerCase()) && !(c.canal === 'email' && /email/i.test(nume))) warn(`${unde}: „nume” ar trebui să conțină „${def.scurt}”, numele care apare la hover (WCAG 2.5.3).`);
      return link ? { canal: c.canal, scurt: def.scurt, nume, link, profil: !def.mediu } : null;
    }).filter(Boolean);
    return canale.length ? { titlu: String(g.titlu || ''), canale } : null;
  }).filter(Boolean);
  if (!grupuri.length) return null;
  const t = (key, dflt) => String(k[key] || dflt);
  return { grupuri, buton: t('buton', 'Contact'), titlu: t('titlu', 'Hai să vorbim'), text: String(k.text || ''), rezervare: t('rezervare', 'Rezervă o sesiune'),
    peCoaching: t('pe_coaching', 'Scrie-mi pentru prima conversație'), peCoachingDupa: t('pe_coaching_dupa_rezervare', 'Sau scrie-mi'), peDespre: t('pe_despre', 'Scrie-mi') };
})();
const contactBtn = (label, cls = 'btn') => CONTACT ? `<button class="${cls}" type="button" popovertarget="contact">${esc(label)}</button>` : '';
const capsula = (cls = '') => CONTACT ? `<button class="capsula glass${cls}" type="button" popovertarget="contact"><span class="disc" aria-hidden="true">${svgIcon('bubble')}</span><span>${esc(CONTACT.buton)}</span></button>` : '';
const contactPanel = () => CONTACT ? `<div class="contact glass-read" id="contact" popover role="dialog" aria-labelledby="contactH">
  <div class="c-top"><h2 id="contactH">${esc(CONTACT.titlu)}</h2><button class="x" type="button" popovertarget="contact" popovertargetaction="hide" aria-label="Închide" autofocus>✕</button></div>
  ${CONTACT.text ? `<p class="c-lead">${esc(CONTACT.text)}</p>` : ''}
  ${rezervare ? `<a class="btn bk" href="${esc(rezervare)}" rel="noopener">${esc(CONTACT.rezervare)} <span aria-hidden="true">→</span></a>` : ''}
  <div class="grps">${CONTACT.grupuri.map(g => `<div class="grp">${g.titlu ? `<p class="cap">${esc(g.titlu)}</p>` : ''}<ul class="ico-row">${g.canale.map(c => `<li><a class="ico" href="${esc(c.link)}" aria-label="${esc(c.nume)}" rel="${c.profil ? 'me noopener' : 'noopener'}">${svgIcon(c.canal)}<span class="tip" aria-hidden="true">${esc(c.scurt)}</span></a></li>`).join('')}</ul></div>`).join('')}</div>
</div>` : '';
// butoanele de pe Coaching (pagina și panoul de pe prima pagină): rezervarea, dacă are link, apoi contactul
const coachingCta = () => rezervare
  ? `<p class="actions"><a class="btn" href="${esc(rezervare)}" rel="noopener">Alege o oră <span aria-hidden="true">→</span></a>${CONTACT ? contactBtn(CONTACT.peCoachingDupa, 'btn ghost') : ''}</p>`
  : CONTACT ? `<p class="actions">${contactBtn(CONTACT.peCoaching)}</p>` : '';
// lista elementelor unei secțiuni: același rând ca în „Atelierul, la vedere” (ul.list), titlul ca link și fraza
const elementeHtml = c => Array.isArray(c.elemente) && c.elemente.length ? `<ul class="list items">${c.elemente.map(e => `<li><a href="${esc(e.url ? u(e.url) : e.link)}"${e.link ? ' rel="noopener"' : ''}>${esc(e.titlu)}</a><span>${esc(e.fraza)}</span></li>`).join('')}</ul>` : '';
const businessList = () => BUSINESS.length ? `<ul class="list biz">${BUSINESS.map(b => `<li><b>${b.link ? `<a href="${esc(b.link)}" rel="noopener">${esc(b.nume)}</a>` : esc(b.nume)}</b>${b.nevoie ? `<span>${esc(b.nevoie)}</span>` : ''}${b.rol ? `<small>${esc(b.rol)}</small>` : ''}${b.pod ? `<small class="pod">${esc(b.pod)}</small>` : ''}</li>`).join('')}</ul>` : '';
// Despre (compoziția v2 a Ioanei, varianta A „Orbita în jurul lentilei”, aprobată de Alex pe 2026-11-18):
// corpul din content/despre.md dă prima propoziție și misiunea; antetul dă propoziția de sub linie (cine), cărțile, parcursul și formarea.
// Orbita din primul card și lista parcursului le face site/orbita.mjs.
const despreParti = (() => {
  const toks = marked.lexer(despre.body || '').filter(t => t.type !== 'space');
  const k = toks.findIndex(t => t.type === 'heading');
  const intro = k < 0 ? toks : toks.slice(0, k), rest = k < 0 ? [] : toks.slice(k + 1);
  const bq = rest.find(t => t.type === 'blockquote');
  const paras = (bq ? bq.tokens : rest).filter(t => t.type === 'paragraph').map(t => t.text);
  if (toks.filter(t => t.type === 'heading').length > 1 || rest.some(t => t !== bq && t.type !== 'paragraph')) warn('content/despre.md: după „## Misiunea mea” pagina arată doar citatul. Parcursul și formarea stau în antet (parcurs, formare).');
  const statement = paras.length > 1 ? paras[0].replace(/^\*\*([\s\S]*)\*\*$/, '$1') : '';
  return {
    lead: intro.filter(t => t.type === 'paragraph').map(t => marked.parseInline(t.text)).join(' '),
    eticheta: k < 0 ? '' : toks[k].text,
    statement: statement ? marked.parseInline(statement) : '',
    text: (paras.length > 1 ? paras.slice(1) : paras).map(p => `<p>${marked.parseInline(p)}</p>`).join('')
  };
})();
let PARCURS; try { PARCURS = citesteParcurs(despre.data, NOW); } catch (e) { fail(e.message); }
// lentila cu poza (D-060), în centrul orbitei
const lentila = despre.data.poza ? `<div class="lens"><span class="halo" aria-hidden="true"></span><div class="bezel"><div class="ph"><img src="${u(despre.data.poza)}" alt="${esc(despre.data.poza_alt || 'Alex')}" width="560" height="560" loading="eager" decoding="async"></div></div><span class="dot sig" aria-hidden="true"></span></div>` : '';
const ORBITA = orbita(PARCURS, esc, lentila);
// valorile: pachetul de trei cărți de sticlă, cu cuvântul scris pe fiecare, care se rotește încontinuu (ca pe vechiul site).
// Se oprește doar cu „reduce motion” din sistem (și fără JavaScript); atunci stă la −24°.
const valori = (Array.isArray(despre.data.valori) ? despre.data.valori : []).slice(0, 3).map(String);
const valoriHtml = valori.length ? `<div class="stage" role="img" aria-label="${esc(`Valorile mele: ${valori.join(', ')}`)}"><div class="deck" aria-hidden="true">${valori.map((v, i) => `<div class="vc vc${i + 1}"><span class="gl"></span><span class="f">${esc(v)}</span><span class="b">${esc(v)}</span></div>`).join('')}</div></div>` : '';
const misiune = (site.intro && site.intro.inscriptie) || [];

const CSS_HASHLESS = 'assets/site.css';
let cssV = '';
// Politica de securitate: doar resurse de pe site; import map-ul inline e permis prin hash.
const csp = scriptHash => `default-src 'self'; script-src 'self'${[].concat(scriptHash || []).map(h => ` '${h}'`).join('')}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`;
function head({ title, description, path, extra = '', scriptHash = '' }){
  const t = title ? `${title} · ${site.titlu_scurt || site.titlu}` : site.titlu; // pagina întâi, ca să se vadă în tab-urile înguste
  const canon = SITE_URL ? `<link rel="canonical" href="${esc(abs(path))}">` : '';
  return `<!doctype html>
<html lang="ro">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="${csp(scriptHash)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${esc(t)}</title>
<meta name="description" content="${esc(description || site.descriere)}">
${canon}
<meta property="og:type" content="website">
<meta property="og:locale" content="ro_RO">
<meta property="og:site_name" content="${esc(site.titlu)}">
<meta property="og:title" content="${esc(t)}">
<meta property="og:description" content="${esc(description || site.descriere)}">
${SITE_URL ? `<meta property="og:url" content="${esc(abs(path))}">` : ''}
<meta property="og:image" content="${esc(abs('og.png'))}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Atelierul lui Alex: obiecte de sticlă colorată pe orbită, pe un fundal luminos.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${TEMA.get('bg')}">
<meta name="color-scheme" content="light">
<link rel="icon" href="${u('favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="${u('favicon-32.png')}" type="image/png" sizes="32x32">
<link rel="apple-touch-icon" href="${u('apple-touch-icon.png')}">
${Object.values(TEMA.fonturi).map(f => `<link rel="preload" href="${u(`assets/fonts/${f.pachet}-latin-wght-normal.woff2`)}" as="font" type="font/woff2" crossorigin>`).join('\n')}
<link rel="stylesheet" href="${u(CSS_HASHLESS)}?v=${cssV}">
${extra}
</head>`;
}

function topNav(current){
  const links = CATS.map((c, i) => {
    const sep = i > 0 && CATS[i - 1].familie !== c.familie ? '<span class="sep" aria-hidden="true"></span>' : '';
    return `${sep}<a href="${pageUrl(c)}"${current === c.cheie ? ' aria-current="page"' : ''}>${esc(c.scurt || c.eticheta)}</a>`;
  }).join('');
  // două meniuri cu aceleași linkuri: în rând (ecran lat) și „Meniu” (telefon). Doar unul se vede; merge fără JavaScript.
  return `<a class="skip" href="#main">Sari la conținut</a>
<header class="top glass${CATS.length <= 4 ? ' few' : ''}">
  <a class="brand" href="${u()}"><span class="dot" aria-hidden="true"></span>${brandText()}</a>
  <nav class="nav-wide" aria-label="Atelierul">${links}</nav>
  <details class="nav-menu"><summary>Meniu</summary><nav class="glass-read" aria-label="Atelierul">${links}</nav></details>
  ${bookBtn('top-book')}
</header>`;
}
// semnătura din colț: forma lungă, iar pe telefon forma scurtă (content/site.yml → intro.marca, intro.marca_scurta)
const brandText = () => { const lung = site.intro?.marca || site.titlu, scurt = site.intro?.marca_scurta || '';
  return scurt && scurt !== lung ? `<span class="m-long">${esc(lung)}</span><span class="m-short">${esc(scurt)}</span>` : esc(lung); };
// subsolul a fost scos la cererea lui Alex (2026-11-25): fără textul despre repo, data actualizării și continut.json
const footer = () => '';

function page({ cheie, title, description, path, bodyHtml, mainClass = 'wrap glass-read', bodyClass = '', scripts = '', extraHead = '' }){
  return `${head({ title, description, path, extra: extraHead })}
<body class="page${bodyClass ? ' ' + bodyClass : ''}">
<div class="bg" aria-hidden="true"></div>
${topNav(cheie)}
<main id="main" class="${mainClass}">
${bodyHtml}
</main>
${footer()}
${capsula()}${contactPanel()}${scripts}
</body>
</html>
`;
}

/* ---------- conținutul panourilor (același pentru scenă și pentru pagini) ---------- */
const liveFeedHtml = n => taskEvents.length ? `<div class="cols" aria-hidden="true"><span>Data</span><span>Cine → cui</span><span>Stadiu</span></div><ol class="feed" id="feed" aria-label="Jurnalul atelierului, cele mai noi primele">${taskEvents.slice(0, n).map(e => feedRow(e)).join('')}</ol>` : '<p class="lead">Liniște în atelier acum.</p>';
const legend = '<p class="legend"><span class="a">agent AI · în timp real</span><span class="h">om · după 24 h, cu ziua</span></p>';

function panelBody(c){
  const fam = c.familie === 'atelier' ? 'cameră din atelier' : c.familie === 'direct' ? 'drum direct' : 'despre';
  if (c.cheie === 'live') return `<p class="eyebrow">${esc(c.eticheta)} · ${fam} · date reale</p><h2 id="pH">${esc(c.fraza)}</h2>
  <p class="lead">${esc(L.nota || '')}</p>${podHtml(c)}
  ${legend}
  <h3>Pe banc acum</h3><ul class="bench" id="bench">${benchHtml()}</ul>
  <div class="feedhead"><h3>Jurnalul atelierului</h3>${taskEvents.length ? '<button class="pz2" type="button" data-pause aria-pressed="false">Pauză</button>' : ''}</div>
  <div id="feedWrap">${liveFeedHtml(12)}</div>
  <p class="actions"><a class="btn" href="${pageUrl(c)}">${esc(c.buton || 'Tot jurnalul')} →</a><a class="btn ghost" href="${u('live/echipa/')}">Echipa</a></p>`;
  if (c.cheie === 'despre') return `<p class="eyebrow">Despre</p><h2 id="pH">${esc(c.eticheta)}</h2>
  <p class="lead">${esc(site.intro?.cine || '')}</p>
  ${C.companie && BUSINESS.length ? `<h3>${esc(C.companie.eticheta)}</h3>${businessList()}` : ''}
  <h3>Atelierul, la vedere</h3>
  <ul class="list">${C.live ? `<li><a href="${u('live/echipa/')}">Echipa mea de agenți AI</a><span>roluri și procese</span></li><li><a href="${pageUrl(C.live)}">Live</a><span>ce construim acum</span></li>` : ''}<li><a href="${esc(GH)}" rel="noopener">GitHub</a><span>contact și cod</span></li></ul>
  <a class="btn" href="${pageUrl(c)}">${esc(c.buton || 'Pagina Despre')} →</a>`;
  const extra = c.cheie === 'companie' ? businessList() : c.cheie === 'coaching' ? coachingCta() : '';
  if (c.cheie === 'povesti') return `<div class="story"><p class="eyebrow">${esc(c.eticheta)} · ${fam}</p><h2 id="pH">${esc(c.eticheta)}</h2>
  <p class="season">${esc(c.fraza)}</p>${podHtml(c)}
  <p class="note">${esc(site.in_pregatire || '')}</p>
  ${C.live ? `<p class="actions"><a class="btn ink" href="${pageUrl(C.live)}" data-go="live">Vezi ce se lucrează acum →</a></p>` : ''}</div>`;
  return `<p class="eyebrow">${esc(c.eticheta)} · ${fam}</p><h2 id="pH">${esc(c.eticheta)}</h2>
  <p class="lead">${esc(c.fraza)}</p>${podHtml(c)}${detaliiHtml(c)}${elementeHtml(c)}${stateHtml(c)}${extra}
  <p class="actions"><a class="btn" href="${pageUrl(c)}">Deschide pagina →</a>${C.live ? `<a class="btn ghost" href="${pageUrl(C.live)}" data-go="live">Vezi ce se lucrează acum</a>` : ''}</p>`;
}

/* ---------- pagina principală: scena („1 · Sticlă colorată”, design v3.1) ---------- */
// Desenul 2D al scenei: varianta fără WebGL și fără JavaScript (T-035). Aceleași forme ca scena 3D (build din src/scena.js),
// desenate ca în planșa Ioanei (design v3.1, obiectul SH): același număr = aceeași formă peste tot.
// Fiecare formă e centrată în (0, 0) și încape cam în ±75 × ±50.
const SHAPES = {
  coaching: '<ellipse class="s" rx="74" ry="40"/><ellipse class="s" rx="24" ry="12" cy="-4"/>',
  companie: '<path class="s" d="M-50-28l50-24 50 24-50 24z"/><path class="s" d="M-50-28v56l50 24v-56z"/><path class="s" d="M50-28v56l-50 24v-56z"/>',
  speaking: '<ellipse class="s" cy="24" rx="62" ry="10"/><path class="s" d="M-56 22a56 56 0 0 1 112 0z"/>',
  inventii: '<ellipse class="s" cy="18" rx="62" ry="15"/><ellipse class="s" cy="6" rx="66" ry="16"/><ellipse class="s" cy="-6" rx="70" ry="17"/><ellipse class="s" cy="-18" rx="74" ry="18"/>',
  live: '<circle class="s" r="34"/><circle class="m" cx="-10" cy="-8" r="3.5"/><circle class="m" cx="12" cy="-2" r="3.5"/><circle class="m" cx="-2" cy="12" r="3.5"/>',
  povesti: '<ellipse class="f" cy="32" rx="48" ry="8"/><ellipse class="s" rx="58" ry="30"/>',
  knowledge: '<path class="s" d="M-56 16.5l56-17.5 56 17.5-56 17.5z"/><path class="s" d="M-56 5.5l56-17.5 56 17.5-56 17.5z"/><path class="s" d="M-56 -5.5l56-17.5 56 17.5-56 17.5z"/><path class="s" d="M-56 -16.5l56-17.5 56 17.5-56 17.5z"/>', // plăci de 0,5 cu pasul 0,07, ca în 3D (T-036)
  despre: '<ellipse class="s" cx="8" rx="34" ry="46" opacity=".55"/><ellipse class="s" rx="34" ry="46"/><ellipse class="f" rx="27.5" ry="39"/>' // lentila, fără punct (Alex, 2026-11-17) (manualul §7)
};
function fallbackSvg(){
  // cu „Desfă inovația”, Innovations e nucleul din centru, nu încă un obiect pe orbită (ca în scena 3D)
  const orb = CATS.filter(c => c.pe_orbita !== false && SHAPES[c.cheie] && !(centru && c.cheie === 'inventii'));
  const cx = 980, cy = 520, rx = 380, ry = 96;
  const grad = (id, pair) => `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${pair[0]}"/><stop offset="1" stop-color="${pair[1]}"/></linearGradient>`;
  const defs = orb.map(c => grad(`fg-${c.cheie}`, TEMA.scena[`obj-${c.cheie}`])).join('') + (centru ? grad('fg-centru', TEMA.scena['obj-centru']) : '');
  // numărul de reper, cu linia lui, deasupra obiectului, spre exterior (în stânga orbitei, spre stânga)
  const nr = (x, y, n, sx = 1) => n ? `<line class="l" x1="${x}" y1="${y}" x2="${x + sx * 22}" y2="${y - 26}"/><g class="nr" transform="translate(${x + sx * 34} ${y - 40})"><circle r="16"/><text y="6">${n}</text></g>` : '';
  // adâncimea: obiectele din spate sunt puțin mai mici și se desenează înaintea nucleului, cele din față după.
  // Nucleul plutește deasupra orbitei (ca în mostră), ca obiectele din spate să se vadă sub el.
  const objs = orb.map((c, j) => {
    // niciun obiect drept în spatele nucleului sau drept în fața butonului: pornim de la o jumătate (sau un sfert) de pas
    const a = Math.PI / orb.length * (orb.length % 2 ? 0.5 : 1) + j * Math.PI * 2 / orb.length, x = Math.round(cx + Math.sin(a) * rx), y = Math.round(cy + Math.cos(a) * ry);
    const k = (0.86 + 0.14 * (Math.cos(a) + 1) / 2).toFixed(2), sx = x < cx - 40 ? -1 : 1;
    return { back: Math.cos(a) < 0, y, svg: `<ellipse class="sh" cx="${x}" cy="${y + 58}" rx="${Math.round(56 * k)}" ry="10"/><g transform="translate(${x} ${y - 20}) scale(${k})" fill="url(#fg-${esc(c.cheie)})">${SHAPES[c.cheie]}</g>${nr(x + sx * 40, y - 50, c.nr, sx)}` };
  }).sort((p, q) => p.y - q.y);
  const core = centru ? `<ellipse class="sh" cx="${cx}" cy="${cy + 6}" rx="118" ry="15"/><g transform="translate(${cx} ${cy - 175}) scale(.8)" fill="url(#fg-centru)">${[4, 3, 2, 1, 0].map(i => `<ellipse class="s" cy="${(i - 2) * 7}" rx="${150 - i * 8}" ry="${38 - i * 2}"/>`).join('')}<ellipse class="f" cy="-14" rx="114" ry="22"/><circle class="m" r="6" cy="-14"/></g>${nr(cx + 84, cy - 194, C.inventii.nr)}`
    : `<circle class="m" cx="${cx}" cy="${cy - 30}" r="7"/>`;
  return `<svg class="fb" viewBox="${centru ? "520 262 920 468" : "520 330 920 400"}" preserveAspectRatio="xMidYMid meet" role="presentation">
  <defs>${defs}</defs>
  <ellipse class="o" cx="${cx}" cy="${cy}" rx="${rx - 70}" ry="${ry - 20}"/><ellipse class="o" cx="${cx}" cy="${cy}" rx="${rx + 40}" ry="${ry + 12}"/>
  ${objs.filter(o => o.back).map(o => o.svg).join('')}${core}${objs.filter(o => !o.back).map(o => o.svg).join('')}
</svg>`;
}

function indexHtml(importmap){
  const imHash = 'sha256-' + createHash('sha256').update(importmap).digest('base64');
  // Scoate „no-js” înainte de prima randare: altfel desenul de rezervă (orbitele mov) clipește până se încarcă scena (Alex, 2026-11-18).
  const jsOn = "document.body.classList.remove('no-js')";
  const jsOnHash = 'sha256-' + createHash('sha256').update(jsOn).digest('base64');
  const intro = site.intro || {};
  const first = familii[0]?.cheie;
  const road = c => `<li><a href="${pageUrl(c)}" data-k="${esc(c.cheie)}"><span class="nn" aria-hidden="true">${c.nr || ''}</span><span>${esc(c.eticheta)}</span></a></li>`;
  // cu puține drumuri (cel mult 4), o singură listă; altfel două coloane, ca în mostră
  const split = CATS.length > 4;
  const g1 = split ? CATS.filter(c => c.familie === first) : CATS, g2 = split ? CATS.filter(c => c.familie !== first) : [];
  // pe telefon se văd doar drumurile directe, plus „Toate cele N drumuri” (dacă mai sunt altele)
  const g2Title = famTitle(g2.find(c => famTitle(c.familie))?.familie) || '';
  const roads = `<nav class="roads glass${g2.length ? '' : ' all one'}" id="roads" aria-label="Drumuri">
    <div class="g g1">${famTitle(first) ? `<h2 class="cap">${esc(famTitle(first))}</h2>` : ''}<ul>${g1.map(road).join('')}</ul>${g2.length ? `<button class="more" id="more" type="button" aria-expanded="false" aria-controls="g2">Toate cele ${CATS.length} drumuri →</button>` : ''}</div>
    ${g2.length ? `<div class="g g2" id="g2">${g2Title ? `<h2 class="cap">${esc(g2Title)}</h2>` : '<h2 class="cap" aria-hidden="true">&nbsp;</h2>'}<ul>${g2.map(road).join('')}</ul></div>` : ''}
  </nav>`;
  const templates = CATS.filter(c => c.panou !== false).map(c => `<template id="tpl-${esc(c.cheie)}">${panelBody(c)}</template>`).join('\n');
  const data = {
    base: BASE,
    categorii: CATS.map(c => ({ k: c.cheie, label: c.eticheta, fam: c.familie, orbit: c.pe_orbita !== false, nr: c.nr || 0, url: pageUrl(c), direct: c.panou === false })),
    // luminițele echipei țin de Live: cât timp Live e ascuns, nu apar
    echipa: C.live ? [{ slug: 'alex', nume: 'Alex', tip: 'alex', aprins: true }, ...AGENTS.map(a => ({ slug: a.slug, nume: a.nume, tip: 'agent', aprins: lit.has(a.slug) }))] : [],
    puls: C.live ? pulses : [],
    centru: !!centru,
    culori: TEMA.culori, scena: TEMA.scena // scena 3D își ia culorile de aici (content/tema.yml)
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const closebar = centru ? `<div class="closebar glass" id="closebar">
      <p class="cap">${esc(centru.eticheta || '')}</p>
      <h2>${esc(centru.titlu)}, strat cu strat</h2>
      <p class="actions">${GH ? `<a class="btn" href="${esc(GH)}" rel="noopener">${esc(centru.link_text || 'Vezi codul')}</a>` : ''}<button class="btn ghost" id="collapse" type="button">Strânge</button></p>
    </div>` : '';
  const parts = centru ? `<button class="explode" id="explode" type="button" aria-expanded="false" aria-controls="parts">${esc(centru.buton || 'Desfă inovația')}</button>
  <ol class="parts" id="parts" aria-label="${esc(centru.titlu)}, strat cu strat">${centru.straturi.map(s => `<li><b>${esc(s.nume)}</b>${esc(s.text)}</li>`).join('')}</ol>` : '';

  return `${head({ title: '', path: '', scriptHash: [imHash, jsOnHash], extra: `<script type="importmap">${importmap}</script>\n<link rel="modulepreload" href="${u('assets/scena.js')}?v=${cssV}">` })}
<body class="home no-js${rezervare ? ' has-book' : ''}">
<script>${jsOn}</script>
<div class="bg" aria-hidden="true"><i></i></div>
<div class="fallback" aria-hidden="true">${fallbackSvg()}</div>
<canvas id="gl" aria-hidden="true"></canvas>
<div class="ui">
  <div class="col">
    <section class="hero glass" aria-labelledby="h1">
      <div class="row"><span class="brand"><span class="dot" aria-hidden="true"></span>${brandText()}</span><span class="row-r">${bookBtn()}${C.live ? `<a class="live-link" id="liveLink" href="${pageUrl(C.live)}"><i aria-hidden="true"></i>${esc(C.live.eticheta)}</a>` : ''}</span></div>
      <h1 id="h1">${esc(intro.titlu || '')} <b>${esc(intro.titlu_accent || '')}</b></h1>
      <p class="who"><a href="${pageUrl(C.despre || CATS[0])}" id="about">${esc(intro.cine || '')}</a></p>
      <p class="how">${esc(intro.cum || '')}</p>
    </section>
    <aside class="panel glass-read" id="panel" aria-labelledby="pH">
      <button class="x" id="px" type="button" aria-label="Închide">✕</button>
      <div id="pBody"></div>
    </aside>
    ${closebar}
    ${CONTACT ? `<div class="cslot">${capsula()}</div>` : ''}
    ${roads}
  </div>
  <div class="br">${misiune.length ? `<p class="inscription glass">${misiune.map(esc).join('<br>')}</p>` : ''}${capsula()}</div>
  <div id="tags" aria-hidden="true"></div>
  <div id="nodeTags" aria-hidden="true"></div>
  ${parts}
  <p class="sr" id="sr" aria-live="polite"></p>
</div>
${templates}
${contactPanel()}
<script type="application/json" id="data">${json}</script>
<script type="module" src="${u('assets/scena.js')}?v=${cssV}"></script>
</body>
</html>
`;
}

/* ---------- paginile ---------- */
function categoryPage(c){
  if (c.cheie === 'despre') return desprePage(c);
  let inner = '';
  if (c.cheie === 'live'){
    const days = new Map();
    for (const e of events.slice(0, 120)){ const k = dayKey(e._t); if (!days.has(k)) days.set(k, []); days.get(k).push(e); }
    inner = `<p class="lead">${esc(L.nota || '')}</p>${podHtml(c)}${legend}
<section aria-labelledby="banc"><h2 id="banc">Pe banc acum</h2><ul class="bench">${benchHtml()}</ul></section>
<section aria-labelledby="jurnal"><h2 id="jurnal">Jurnalul atelierului</h2>
${events.length ? [...days].map(([, list]) => `<h3 class="day">${esc(fLongDay(list[0]._t))}</h3><ol class="feed log">${list.map(e => e.tip === 'task' ? feedRow(e, true) :
  `<li class="commit"><span class="id">${e.ora_reala ? esc(fTime(e._t)) : ''}</span><span class="who"><i>salvat în repo</i></span><span class="st"></span><span class="task">${e.link ? `<a href="${esc(e.link)}" rel="noopener">${esc(e.titlu)}</a>` : esc(e.titlu)}</span></li>`).join('')}</ol>`).join('') : '<p>Liniște în atelier acum.</p>'}
</section>
<p class="actions"><a class="btn" href="${u('live/echipa/')}">Echipa de agenți →</a><a class="btn ghost" href="${u('api/live.json')}">Datele, ca JSON</a></p>`;
  } else {
    inner = `${podHtml(c)}${detaliiHtml(c)}${elementeHtml(c)}${stateHtml(c)}${c.cheie === 'companie' ? businessList() : ''}${c.cheie === 'coaching' ? coachingCta() : ''}
${C.live ? `<p class="actions"><a class="btn" href="${pageUrl(C.live)}">Vezi ce se lucrează acum →</a></p>` : ''}`;
  }
  return page({ cheie: c.cheie, title: c.eticheta, description: `${c.eticheta}: ${c.fraza}`, path: c.url + '/', bodyHtml: `<h1>${esc(c.eticheta)}</h1><p class="kicker">${esc(c.fraza)}</p>\n${inner}` });
}

// Despre: primul card (cine sunt, propoziția de sub linie, orbita în jurul lentilei), misiunea cu cărțile, parcursul cu formarea, pasul următor.
// Mostra: team/ioana/documente/despre-compozitie-v2.html (deschisă cu ?solo=a). Același spațiu între toate blocurile.
function desprePage(c){
  const d = despre.data, P = despreParti;
  const hero = `<section class="prim w glass-read" aria-labelledby="despreH">
  <div class="cine">
    ${d.rol ? `<p class="eyebrow">${esc(d.rol)}</p>` : ''}
    <h1 id="despreH">${esc(c.eticheta)}</h1>
    ${P.lead ? `<p class="lede">${P.lead}</p>` : ''}
    ${d.cine ? `<p class="semn">${esc(d.cine)}</p>` : ''}
    <div class="actions">${C.coaching ? `<a class="btn" href="${pageUrl(C.coaching)}">${esc(C.coaching.eticheta)} <span aria-hidden="true">→</span></a>` : ''}<a href="#parcurs">Tot parcursul</a></div>
  </div>
  ${ORBITA.figure}
</section>`;
  const mission = P.statement || P.text ? `<section class="mission w glass-read" aria-labelledby="misiuneH">
  <div>${P.eticheta ? `<h2 class="eyebrow" id="misiuneH">${esc(P.eticheta)}</h2>` : ''}${P.statement ? `<p class="statement">${P.statement}</p>` : ''}${P.text}</div>
  ${valoriHtml}
</section>` : '';
  const next = `<section class="next w glass" aria-labelledby="atelierH">
  <div><h2 id="atelierH">Atelierul, la vedere</h2><p>${esc(despre.data.atelier || '')}${C.live ? ` <a href="${u('live/echipa/')}">Vezi echipa și procesele</a> sau <a href="${pageUrl(C.live)}">ce construim acum</a>.` : ''}</p></div>
  <div class="actions">${C.coaching ? `<a class="btn" href="${pageUrl(C.coaching)}">${esc(C.coaching.eticheta)} <span aria-hidden="true">→</span></a>` : ''}${CONTACT ? contactBtn(CONTACT.peDespre, 'btn ghost') : ''}${GH ? `<a href="${esc(GH)}" rel="noopener">Mă găsești pe GitHub</a>` : ''}</div>
</section>`;
  const bodyHtml = `${hero}\n${mission}\n${ORBITA.parcurs}\n${next}`;
  return page({ cheie: c.cheie, title: c.eticheta, description: site.descriere, path: c.url + '/', bodyHtml, mainClass: 'despre', bodyClass: 'no-js', scripts: `\n<script src="${u('assets/despre.js')}?v=${cssV}" defer></script>` });
}

// Pagina unui element cu `pagina`: antetul și subsolul site-ului, iar între ele pagina din repo, cu designul ei.
// Stilul ei e în assets/pagini/<slug>.css, închis sub .proces (vezi site/pagina-html.mjs).
function elementPage(c, e){
  return page({ cheie: c.cheie, title: e.titluTab || e.titlu, description: e.descriere || `${e.titlu}: ${e.fraza}`, path: e.url,
    mainClass: e.cadru === false ? 'proces' : 'proces glass-read',
    extraHead: `<link rel="stylesheet" href="${u(`assets/pagini/${e.slug}.css`)}?v=${createHash('sha256').update(e.css).digest('hex').slice(0, 10)}">`,
    bodyHtml: whatsappLinks(e.html, e.pagina) });
}

// Butonul WhatsApp dintr-o pagină din repo: <a href="#whatsapp" data-whatsapp="mesajul pregătit">…</a>.
// Numărul vine doar din secretul CONTACT_WHATSAPP (același ca în capsula Contact) și nu se scrie în niciun fișier din repo.
// Fără secret (de exemplu un build local), butonul nu apare, cu un avertisment.
function whatsappLinks(html, where){
  const nr = String(process.env[CANALE.whatsapp.mediu] || '').trim();
  const dec = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return html.replace(/<a\b([^>]*?)\sdata-whatsapp\s*=\s*"([^"]*)"([^>]*)>([\s\S]*?)<\/a>/gi, (_, a, msg, b, inner) => {
    if (!nr){ warn(`${where}: butonul WhatsApp („${inner.replace(/<[^>]+>/g, '').trim()}”) lipsește, pentru că secretul ${CANALE.whatsapp.mediu} nu e setat.`); return ''; }
    const attrs = `${a}${b}`.replace(/\shref\s*=\s*"[^"]*"/i, '');
    return `<a${attrs} href="${esc(`${CANALE.whatsapp.link(nr)}?text=${encodeURIComponent(dec(msg).trim())}`)}">${inner}</a>`;
  });
}

function teamPage(){
  const e = site.echipa || {};
  return page({ cheie: 'live', title: e.titlu || 'Echipa', description: 'Echipa de agenți AI cu care lucrează Alex: roluri, procese, totul public.', path: 'live/echipa/', bodyHtml: `<h1>${esc(e.titlu || 'Echipa')}</h1>
<div class="prose">${(e.text || []).map(p => `<p>${esc(p)}</p>`).join('')}</div>
<h2>Agenții</h2>
<ul class="team">${AGENTS.map(a => `<li><span class="badge">agent AI</span><b>${esc(a.nume)}</b><span>${esc(a.rol)}</span>${a.profil ? `<a href="${esc(a.profil)}" rel="noopener">profil</a>` : ''}</li>`).join('')}</ul>
<h2>Cum lucrăm</h2>
<ul class="list">${PROCESE.map(p => `<li><a href="${esc(p.link)}" rel="noopener">${esc(p.titlu)}</a></li>`).join('')}</ul>
<p class="actions">${GH ? `<a class="btn" href="${esc(ghFile('docs/taskuri.md'))}" rel="noopener">Panoul de taskuri</a><a class="btn ghost" href="${esc(ghFile('docs/decizii.md'))}" rel="noopener">Deciziile</a><a class="btn ghost" href="${esc(GH)}" rel="noopener">Tot repo-ul</a>` : ''}</p>` });
}

const redirect = to => `<!doctype html><html lang="ro"><head><meta charset="utf-8"><title>Mutat</title><meta name="robots" content="noindex"><meta http-equiv="refresh" content="0; url=${esc(to)}"><link rel="canonical" href="${esc(to)}"></head><body><p><a href="${esc(to)}">Pagina s-a mutat aici.</a></p></body></html>\n`;
// Adresele vechi. Dacă ținta e o secțiune ascunsă (vizibil: false), duc la prima pagină (D-056).
const REDIRECTS = { tools: 'innovations', creatii: 'innovations', atelier: 'innovations', inventii: 'innovations', speaking: 'workshops', invata: 'knowledge-base', carte: 'knowledge-base', jurnal: 'knowledge-base', knowledge: 'knowledge-base', acum: 'live', now: 'live', povesti: 'my-journey', 'ce-m-a-crescut': 'my-journey', journey: 'my-journey', misiune: 'despre' };

// Granulația fundalului: un PNG mic (128 × 128), negru cu transparență aleatoare, repetat peste gradient.
// Generat aici, determinist (aceeași sămânță = același fișier), fără dependențe.
function grainPng(size = 128){
  let seed = 20261117; const rnd = () => (seed = (Math.imul(seed, 1103515245) + 12345) >>> 0) / 4294967296;
  const stride = 1 + size * 2, raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++){
    const n = (rnd() + rnd() + rnd()) / 3;                    // în jur de 0,5, ca zgomotul din mostră
    raw[y * stride + 2 + x * 2] = Math.round(Math.round(n * 0.7 * 7) / 7 * 255); // 8 trepte de transparență
  }
  const T = Array.from({ length: 256 }, (_, n) => { for (let k = 0; k < 8; k++) n = n & 1 ? 0xEDB88320 ^ (n >>> 1) : n >>> 1; return n >>> 0; });
  const crc = b => { let c = ~0; for (const x of b) c = T[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; };
  const chunk = (type, data) => { const td = Buffer.concat([Buffer.from(type), data]), out = Buffer.alloc(8 + td.length + 4);
    out.writeUInt32BE(data.length, 0); td.copy(out, 4); out.writeUInt32BE(crc(td), 4 + td.length); return out; };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 4; // gri + alfa, 8 biți
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

/* ---------- scriere ---------- */
rmSync(OUT, { recursive: true, force: true });
const write = (p, s) => { const f = join(OUT, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s); };

// resurse: CSS, JS, three.js și fonturile, toate găzduite aici (fără cereri către terți din browser)
const js = readFileSync(join(HERE, 'src/scena.js'), 'utf8');
const cssSrc = readFileSync(join(HERE, 'src/site.css'), 'utf8');
try { checkUsage(TEMA, { css: cssSrc + ORBITA.css, js }); } catch (e) { fail(e.message); }
// @font-face din pachetele fonturilor alese în content/tema.yml (fonturi), doar latin și latin-ext (cu ș și ț)
const NM = join(HERE, 'node_modules');
if (!existsSync(join(NM, 'three'))) fail('Lipsesc dependențele. Rulează întâi: npm ci (în folderul site/).');
const FONT_SUBSETS = ['latin', 'latin-ext'];
const fontFaces = Object.values(TEMA.fonturi).filter((f, i, all) => all.findIndex(g => g.pachet === f.pachet) === i).map(f => {
  const dir = join(NM, '@fontsource-variable', f.pachet);
  if (!existsSync(dir)) fail(`content/tema.yml: fontul „${f.nume}” are nevoie de pachetul @fontsource-variable/${f.pachet}. Rulează: npm ci (în site/).`);
  const src = readFileSync(join(dir, 'index.css'), 'utf8');
  return FONT_SUBSETS.map(sub => {
    const file = `${f.pachet}-${sub}-wght-normal.woff2`;
    const block = (src.match(/@font-face\s*\{[^}]*\}/g) || []).find(b => b.includes(`/${file})`));
    if (!block) fail(`@fontsource-variable/${f.pachet}: nu găsesc ${file}.`);
    return block.replace(/font-family:\s*'[^']*'/, `font-family:"${f.nume}"`).replace(/url\(\.\/files\//, 'url(fonts/').replace(/format\('woff2-variations'\)/, 'format("woff2")').replace(/\s*\n\s*/g, '');
  }).join('\n');
}).join('\n');
const css = TEMA.css() + fontFaces + '\n' + cssSrc + ORBITA.css; // :root cu culorile și fonturile din content/tema.yml, apoi restul stilului
const despreJs = readFileSync(join(HERE, 'src/despre.js'), 'utf8');
cssV = createHash('sha256').update(css + js + despreJs).digest('hex').slice(0, 10);
write('assets/site.css', css);
write('assets/scena.js', js);
write('assets/despre.js', despreJs);
cpSync(join(NM, 'three/build/three.module.min.js'), join(OUT, 'assets/three/three.module.min.js'));
cpSync(join(NM, 'three/examples/jsm/environments/RoomEnvironment.js'), join(OUT, 'assets/three/addons/environments/RoomEnvironment.js'));
cpSync(join(NM, 'three/LICENSE'), join(OUT, 'assets/three/LICENSE'));
for (const { pachet } of Object.values(TEMA.fonturi)){
  for (const sub of FONT_SUBSETS){ const f = `${pachet}-${sub}-wght-normal.woff2`; cpSync(join(NM, '@fontsource-variable', pachet, 'files', f), join(OUT, 'assets/fonts', f)); }
  cpSync(join(NM, '@fontsource-variable', pachet, 'LICENSE'), join(OUT, 'assets/fonts', `LICENSE-${pachet}.txt`));
}
write('assets/grain.png', grainPng());
cpSync(join(HERE, 'static'), OUT, { recursive: true });
write('favicon.svg', TEMA.fill(readFileSync(join(HERE, 'src/favicon.svg'), 'utf8'), 'site/src/favicon.svg'));

const importmap = JSON.stringify({ imports: { three: u('assets/three/three.module.min.js'), 'three/addons/': u('assets/three/addons/') } });
write('index.html', indexHtml(importmap));
for (const c of CATS) write(`${c.url}/index.html`, categoryPage(c));
const PAGINI = CATS.flatMap(c => (c.elemente || []).filter(e => e.pagina).map(e => [c, e]));
for (const [c, e] of PAGINI){ write(`${e.url}index.html`, elementPage(c, e)); write(`assets/pagini/${e.slug}.css`, e.css); }
write('live/echipa/index.html', teamPage());
const visibleUrl = to => CATS.some(c => c.url === to) ? u(to + '/') : u();
for (const c of HIDDEN) if (!CATS.some(v => v.url === c.url)) write(`${c.url}/index.html`, redirect(u()));
for (const [from, to] of Object.entries(REDIRECTS)) if (!CATS.some(c => c.url === from) && !HIDDEN.some(c => c.url === from)) write(`${from}/index.html`, redirect(visibleUrl(to)));
write('404.html', page({ title: 'Pagina nu există', path: '404.html', bodyHtml: `<h1>Drumul ăsta nu duce nicăieri.</h1><p class="kicker">Pagina nu există sau s-a mutat.</p><p class="actions"><a class="btn" href="${u()}">Înapoi în atelier →</a></p>` }));
write('.nojekyll', '');
if (domeniu) write('CNAME', domeniu + '\n');
write('robots.txt', `User-agent: *\nAllow: /\n${SITE_URL ? `Sitemap: ${abs('sitemap.xml')}\n` : ''}`);
if (SITE_URL) write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...CATS.map(c => c.url + '/'), ...PAGINI.map(([, e]) => e.url), 'live/echipa/'].map(p => `  <url><loc>${esc(abs(p))}</loc></url>`).join('\n')}\n</urlset>\n`);

// API: același conținut pentru site și pentru o viitoare aplicație (D-030)
if (C.live) write('api/live.json', JSON.stringify(liveJson, null, 2) + '\n'); // Live ascuns: fără jurnal public
write('api/continut.json', JSON.stringify({
  generat: new Date(NOW).toISOString(),
  site: { titlu: site.titlu, descriere: site.descriere, github: GH, rezervare: rezervare || null, intro: site.intro, in_pregatire: site.in_pregatire, in_centru: centru },
  familii, categorii: CATS.map(c => ({ ...c, url: pageUrl(c), ...(c.elemente ? { elemente: c.elemente.map(({ titlu, fraza, url, link, pagina }) => ({ titlu, fraza, url: url ? u(url) : link, ...(pagina ? { sursa: pagina } : {}) })) } : {}) })),
  ...(C.companie ? { business: BUSINESS } : {}), nevoi,
  despre: { titlu: despre.data.titlu || 'Despre mine', markdown: despre.body, valori,
    cine: despre.data.cine || null,
    parcurs: PARCURS.roluri.map(({ rol, organizatie, de_la, pana_la, ani, descriere }) => ({ rol, organizatie, de_la, pana_la, ani, descriere })),
    formare: PARCURS.formare },
  echipa: { ...(site.echipa || {}), agenti: AGENTS.map(({ status, ...a }) => a), procese: PROCESE }
}, null, 2) + '\n');

console.log(`Gata: ${OUT}`);
console.log(`  bază: ${BASE}${SITE_URL ? `  adresă: ${SITE_URL}` : ''}${domeniu ? `  CNAME: ${domeniu}` : ''}`);
console.log(`  secțiuni vizibile: ${CATS.map(c => c.cheie).join(', ')}${HIDDEN.length ? `; ascunse: ${HIDDEN.map(c => c.cheie).join(', ')}` : ''}`);
console.log(`  Live: ${events.length} evenimente (${taskEvents.length} taskuri), pe banc: ${bench.length}, luminițe aprinse: ${lit.size}`);
console.log(`  oprite de filtru: ${JSON.stringify(skipped)}`);
if (warnings.length) console.log(`  ${warnings.length} avertismente`);
