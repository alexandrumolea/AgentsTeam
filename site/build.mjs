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
import { parse as parseYaml } from 'yaml';
import { marked } from 'marked';
import { loadTema, checkUsage } from './tema.mjs';

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
  for (const k of ['live', 'despre']) if (!seen.has(k)) fail(`content/categorii.yml: lipsește categoria „${k}”.`);
}
const famOrder = [...familii.map(f => f.cheie), 'titlu'];
CATS.sort((a, b) => famOrder.indexOf(a.familie) - famOrder.indexOf(b.familie) || (a.ordine || 0) - (b.ordine || 0));
const C = Object.fromEntries(CATS.map(c => [c.cheie, c]));

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
const centru = site.in_centru && site.in_centru.titlu ? site.in_centru : null;
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
const tickerDays = L.ticker_zile ?? 7;
const tickerEvents = taskEvents.filter(e => NOW - e._t < tickerDays * 864e5).slice(0, 5);
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
const tickText = e => `${fDay(e._t)} · ${pname(e.de_la)} → ${pname(e.pentru)} · ${e.titlu} · ${e.stadiu}`;

/* ---------- șabloane comune ---------- */
const famTitle = k => (familii.find(f => f.cheie === k) || {}).titlu || '';
const pageUrl = c => u(c.url + '/');
const stateHtml = c => c.stare === 'in-pregatire' ? `<p class="state"><span class="dot" aria-hidden="true"></span>${esc(site.in_pregatire || '')}</p>` : '';
const podHtml = c => c.pod ? `<p class="pod">${esc(c.pod)}</p>` : '';
// Câmpul opțional `detalii` din categorii.yml: perechi eticheta / text, ca listă (ex.: coaching).
const detaliiHtml = c => Array.isArray(c.detalii) && c.detalii.length ? `<ul class="list facts">${c.detalii.filter(d => d && d.eticheta && d.text).map(d => `<li><b>${esc(d.eticheta)}</b><span>${esc(d.text)}</span></li>`).join('')}</ul>` : '';
const bookBtn = cls => rezervare ? `<a class="btn book ${cls || ''}" href="${esc(rezervare)}" rel="noopener">Rezervă<span class="pv-long"> o sesiune</span></a>` : '';
const businessList = () => BUSINESS.length ? `<ul class="list biz">${BUSINESS.map(b => `<li><b>${b.link ? `<a href="${esc(b.link)}" rel="noopener">${esc(b.nume)}</a>` : esc(b.nume)}</b>${b.nevoie ? `<span>${esc(b.nevoie)}</span>` : ''}${b.rol ? `<small>${esc(b.rol)}</small>` : ''}${b.pod ? `<small class="pod">${esc(b.pod)}</small>` : ''}</li>`).join('')}</ul>` : '';
const despreHtml = marked.parse(despre.body || '');
const misiune = (site.intro && site.intro.inscriptie) || [];

const CSS_HASHLESS = 'assets/site.css';
let cssV = '';
// Politica de securitate: doar resurse de pe site; import map-ul inline e permis prin hash.
const csp = scriptHash => `default-src 'self'; script-src 'self'${scriptHash ? ` '${scriptHash}'` : ''}; style-src 'self'; img-src 'self' data:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'`;
function head({ title, description, path, extra = '', scriptHash = '' }){
  const t = title ? `${title} · ${site.titlu}` : site.titlu;
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
<meta property="og:image:alt" content="Atelierul lui Alex: obiecte de sticlă pe orbită, pe o planșă întunecată.">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="${TEMA.get('bg')}">
<meta name="color-scheme" content="dark">
<link rel="icon" href="${u('favicon.svg')}" type="image/svg+xml">
<link rel="apple-touch-icon" href="${u('apple-touch-icon.png')}">
<link rel="preload" href="${u('assets/fonts/onest-latin-wght-normal.woff2')}" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${u(CSS_HASHLESS)}?v=${cssV}">
${extra}
</head>`;
}

function topNav(current){
  const links = CATS.map((c, i) => {
    const sep = i > 0 && CATS[i - 1].familie !== c.familie ? '<span class="sep" aria-hidden="true"></span>' : '';
    return `${sep}<a href="${pageUrl(c)}"${current === c.cheie ? ' aria-current="page"' : ''}>${esc(c.scurt || c.eticheta)}</a>`;
  }).join('');
  return `<a class="skip" href="#main">Sari la conținut</a>
<header class="top">
  <a class="mark" href="${u()}">${esc(site.intro?.marca || site.titlu)}</a>
  <nav aria-label="Atelierul">${links}</nav>
  ${bookBtn('top-book')}
</header>`;
}
const footer = () => `<footer class="foot">
  <p>Site construit de Alex cu o echipă de agenți AI, la vedere. Codul și tot ce lucrăm: <a href="${esc(GH)}" rel="noopener">repo-ul public pe GitHub</a>.</p>
  <p class="small">Actualizat ${esc(fLongDay(NOW))}, ${esc(fTime(NOW))}. Datele: <a href="${u('api/continut.json')}">continut.json</a> · <a href="${u('api/live.json')}">live.json</a></p>
</footer>`;

function page({ cheie, title, description, path, bodyHtml }){
  return `${head({ title, description, path })}
<body class="page">
${topNav(cheie)}
<main id="main" class="wrap">
${bodyHtml}
</main>
${footer()}
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
  <h3>${esc(C.companie ? C.companie.eticheta : 'Business')}</h3>${businessList()}
  <h3>Atelierul, la vedere</h3>
  <ul class="list"><li><a href="${u('live/echipa/')}">Echipa mea de agenți AI</a><span>roluri și procese</span></li><li><a href="${pageUrl(C.live)}">Live</a><span>ce construim acum</span></li><li><a href="${esc(GH)}" rel="noopener">GitHub</a><span>contact și cod</span></li></ul>
  <a class="btn" href="${pageUrl(c)}">${esc(c.buton || 'Pagina Despre')} →</a>`;
  const extra = c.cheie === 'companie' ? businessList() : c.cheie === 'coaching' && rezervare ? `<p><a class="btn" href="${esc(rezervare)}" rel="noopener">Alege o oră →</a></p>` : '';
  if (c.cheie === 'povesti') return `<div class="story"><p class="eyebrow">${esc(c.eticheta)} · ${fam}</p><h2 id="pH">${esc(c.eticheta)}</h2>
  <p class="season">${esc(c.fraza)}</p>${podHtml(c)}
  <p class="note">${esc(site.in_pregatire || '')}</p>
  <p class="actions"><a class="btn ink" href="${pageUrl(C.live)}" data-go="live">Vezi ce se lucrează acum →</a></p></div>`;
  return `<p class="eyebrow">${esc(c.eticheta)} · ${fam}</p><h2 id="pH">${esc(c.eticheta)}</h2>
  <p class="lead">${esc(c.fraza)}</p>${podHtml(c)}${detaliiHtml(c)}${stateHtml(c)}${extra}
  <p class="actions"><a class="btn" href="${pageUrl(C.live)}" data-go="live">Vezi ce se lucrează acum →</a><a class="btn ghost" href="${pageUrl(c)}">Deschide pagina</a></p>`;
}

/* ---------- pagina principală: scena ---------- */
function indexHtml(importmap){
  const imHash = 'sha256-' + createHash('sha256').update(importmap).digest('base64');
  const intro = site.intro || {};
  const dockBtns = CATS.map((c, i) => {
    const sep = i > 0 && CATS[i - 1].familie !== c.familie ? '<span class="sep" aria-hidden="true"></span>' : '';
    const fam = (i === 0 || CATS[i - 1].familie !== c.familie) && famTitle(c.familie) ? `<span class="fam" aria-hidden="true">${esc(famTitle(c.familie))}</span>` : '';
    return `${sep}${fam}<button type="button" class="f-${esc(c.familie)}" data-k="${esc(c.cheie)}" aria-pressed="false"><span class="l">${esc(c.eticheta)}</span><span class="s">${esc(c.scurt || c.eticheta)}</span></button>`;
  }).join('');
  const cards = familii.map(f => `<h2>${esc(f.titlu)}</h2><div class="grid">${CATS.filter(c => c.familie === f.cheie).map(c =>
    `<article class="card${c.familie === 'atelier' ? ' room' : ''}"><h3><a href="${pageUrl(c)}">${esc(c.eticheta)}</a></h3><p>${esc(c.fraza)}</p>${c.stare === 'in-pregatire' ? '<p class="soon">În pregătire</p>' : ''}<button type="button" data-open="${esc(c.cheie)}">Deschide</button></article>`).join('')}</div>`).join('');
  const templates = CATS.map(c => `<template id="tpl-${esc(c.cheie)}">${panelBody(c)}</template>`).join('\n');
  const data = {
    base: BASE,
    categorii: CATS.map(c => ({ k: c.cheie, label: c.eticheta, fam: c.familie, orbit: c.pe_orbita !== false, room: c.familie === 'atelier', url: pageUrl(c) })),
    echipa: [{ slug: 'alex', nume: 'Alex', tip: 'alex', aprins: true }, ...AGENTS.map(a => ({ slug: a.slug, nume: a.nume, tip: 'agent', aprins: lit.has(a.slug) }))],
    puls: pulses,
    ticker: tickerEvents.map(e => ({ t: tickText(e), id: e.id })),
    centru: !!centru,
    culori: TEMA.culori, scena: TEMA.scena // scena 3D își ia culorile de aici (content/tema.yml)
  };
  const json = JSON.stringify(data).replace(/</g, '\\u003c');
  const ticker = tickerEvents.length ? `<div class="ticker" id="ticker">
    <button class="tk" id="tk" type="button" aria-label="Deschide Live: ultimul task al echipei"><span class="dot" aria-hidden="true"></span><span class="tkL">Live</span><span class="tkT" id="tick">${esc(tickText(tickerEvents[0]))}</span></button>
    ${tickerEvents.length > 1 ? '<button class="pz" type="button" data-pause aria-pressed="false" aria-label="Oprește actualizările">❚❚</button>' : ''}
  </div>` : '';
  const feature = centru ? `<aside class="feature" aria-labelledby="fH">
    <p class="eyebrow"><span class="pill">${esc((centru.eticheta || '').split('·').pop().trim() || 'nou')}</span><span class="pv-long">${esc((centru.eticheta || '').split('·')[0].trim())}</span></p>
    <h2 id="fH">${esc(centru.titlu)}</h2>
    <p>${esc(centru.text || '')}</p>
    <button class="btn" id="explode" type="button" aria-expanded="false" aria-controls="parts">${esc(centru.buton || 'Desfă inovația')}</button>
  </aside>
  <div class="closebar">
    <h2>${esc(centru.titlu)}, strat cu strat</h2>
    ${GH ? `<a class="btn" href="${esc(GH)}" rel="noopener">${esc(centru.link_text || 'Vezi codul')}</a>` : ''}
    <button class="btn ghost" id="collapse" type="button">Strânge</button>
  </div>
  <ol class="parts" id="parts" aria-label="${esc(centru.titlu)}, strat cu strat">${centru.straturi.map(s => `<li><b>${esc(s.nume)}</b>${esc(s.text)}</li>`).join('')}</ol>` : '';

  return `${head({ title: '', path: '', scriptHash: imHash, extra: `<script type="importmap">${importmap}</script>\n<link rel="modulepreload" href="${u('assets/scena.js')}?v=${cssV}">` })}
<body class="home no-js${rezervare ? ' has-book' : ''}">
<div class="fallback" aria-hidden="true">
  <svg viewBox="0 0 800 600" fill="none">
    <g stroke="${rgba('accent', '.22')}"><ellipse cx="400" cy="320" rx="330" ry="110"/><ellipse cx="400" cy="320" rx="250" ry="80"/><ellipse cx="400" cy="300" rx="380" ry="150" stroke="${rgba('line', '.08')}"/></g>
    <g><circle cx="400" cy="300" r="78" fill="${rgba('scena.glass-disc', '.06')}" stroke="${rgba('scena.glass-disc', '.5')}"/><circle cx="400" cy="300" r="56" stroke="${TEMA.get('accent')}" stroke-width="2"/><path d="M400 262 L428 300 L400 338 L372 300 Z" fill="${rgba('accent', '.35')}" stroke="${TEMA.get('accent')}"/></g>
    <g fill="${TEMA.get('accent')}"><circle cx="90" cy="300" r="5"/><circle cx="185" cy="390" r="4"/><circle cx="640" cy="230" r="5"/><circle cx="730" cy="330" r="4"/><circle cx="520" cy="410" r="4"/><circle cx="270" cy="225" r="4"/><circle cx="560" cy="200" r="3"/><circle cx="330" cy="420" r="3"/></g>
  </svg>
</div>
<canvas id="gl" aria-hidden="true"></canvas>
<div class="ui">
  <section class="hero" aria-labelledby="h1">
    <span class="mark">${esc(intro.marca || site.titlu)}</span>
    <h1 id="h1">${esc(intro.titlu || '')} <b>${esc(intro.titlu_accent || '')}</b></h1>
    <p class="who"><a href="${pageUrl(C.despre)}" id="about"><b>${esc(intro.cine || '')}</b></a></p>
    ${misiune.length ? `<p class="inscription">${misiune.map(esc).join('<br>')}</p>` : ''}
    <p class="how">${esc(intro.cum || '')}</p>
  </section>
  <div id="tags" aria-hidden="true"></div>
  <div id="nodeTags" aria-hidden="true"></div>
  <div class="agent-tag" id="agentTag" aria-hidden="true"></div>
  ${bookBtn()}
  <section class="cards" id="cards" aria-label="Tot atelierul, fără 3D">${cards}</section>
  ${ticker}
  ${feature}
  <div class="livebar">
    <h2>Live</h2><small>jurnalul atelierului · date reale</small>
    <button class="btn ghost" id="liveOut" type="button">Ieși din Live</button>
  </div>
  <nav class="dock" aria-label="${esc(famTitle(familii[0]?.cheie) || 'Atelierul')}">
    <p>${esc(famTitle(familii[0]?.cheie) || '')}</p>
    <div class="row" id="dock">${dockBtns}</div>
  </nav>
  <aside class="panel" id="panel" aria-labelledby="pH">
    <button class="x" id="px" type="button" aria-label="Închide">✕</button>
    <div id="pBody"></div>
  </aside>
  <p class="sr" id="sr" aria-live="polite"></p>
</div>
${templates}
<script type="application/json" id="data">${json}</script>
<script type="module" src="${u('assets/scena.js')}?v=${cssV}"></script>
</body>
</html>
`;
}

/* ---------- paginile ---------- */
function categoryPage(c){
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
  } else if (c.cheie === 'despre'){
    const poza = despre.data.poza ? `<figure class="me"><img src="${u(despre.data.poza)}" alt="${esc(despre.data.poza_alt || 'Alex')}" width="900" height="1200" loading="eager" decoding="async"><figcaption>${esc(despre.data.rol || '')}</figcaption></figure>` : '';
    inner = `${poza}<div class="prose">${despreHtml}</div>
<h2>Atelierul, la vedere</h2>
<p>Lucrez cu o echipă de agenți AI, iar munca noastră e publică. <a href="${u('live/echipa/')}">Vezi echipa și procesele</a> sau <a href="${pageUrl(C.live)}">ce construim acum</a>.</p>
<h2>Contact</h2><p>Mă găsești pe <a href="${esc(GH)}" rel="noopener">GitHub</a>.</p>`;
  } else {
    inner = `${podHtml(c)}${detaliiHtml(c)}${stateHtml(c)}${c.cheie === 'companie' ? businessList() : ''}${c.cheie === 'coaching' && rezervare ? `<p><a class="btn" href="${esc(rezervare)}" rel="noopener">Alege o oră →</a></p>` : ''}
<p class="actions"><a class="btn" href="${pageUrl(C.live)}">Vezi ce se lucrează acum →</a></p>`;
  }
  const lead = c.cheie === 'despre' ? '' : `<p class="kicker">${esc(c.fraza)}</p>`;
  return page({ cheie: c.cheie, title: c.eticheta, description: c.cheie === 'despre' ? site.descriere : `${c.eticheta}: ${c.fraza}`, path: c.url + '/', bodyHtml: `<h1>${esc(c.cheie === 'despre' ? c.eticheta : c.eticheta)}</h1>${lead}\n${inner}` });
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
const REDIRECTS = { tools: 'innovations', creatii: 'innovations', atelier: 'innovations', inventii: 'innovations', speaking: 'workshops', invata: 'knowledge-base', carte: 'knowledge-base', jurnal: 'knowledge-base', knowledge: 'knowledge-base', acum: 'live', now: 'live', povesti: 'my-journey', 'ce-m-a-crescut': 'my-journey', journey: 'my-journey', misiune: 'despre' };

/* ---------- scriere ---------- */
rmSync(OUT, { recursive: true, force: true });
const write = (p, s) => { const f = join(OUT, p); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, s); };

// resurse: CSS, JS, three.js și fonturile, toate găzduite aici (fără cereri către terți din browser)
const js = readFileSync(join(HERE, 'src/scena.js'), 'utf8');
const cssSrc = readFileSync(join(HERE, 'src/site.css'), 'utf8');
try { checkUsage(TEMA, { css: cssSrc, js }); } catch (e) { fail(e.message); }
const css = TEMA.css() + cssSrc; // :root cu culorile din content/tema.yml, apoi restul stilului
cssV = createHash('sha256').update(css + js).digest('hex').slice(0, 10);
write('assets/site.css', css);
write('assets/scena.js', js);
const NM = join(HERE, 'node_modules');
if (!existsSync(join(NM, 'three'))) fail('Lipsesc dependențele. Rulează întâi: npm ci (în folderul site/).');
cpSync(join(NM, 'three/build/three.module.min.js'), join(OUT, 'assets/three/three.module.min.js'));
cpSync(join(NM, 'three/examples/jsm/environments/RoomEnvironment.js'), join(OUT, 'assets/three/addons/environments/RoomEnvironment.js'));
cpSync(join(NM, 'three/LICENSE'), join(OUT, 'assets/three/LICENSE'));
const FONTS = [['unbounded', 'unbounded-{s}-wght-normal'], ['onest', 'onest-{s}-wght-normal'], ['jetbrains-mono', 'jetbrains-mono-{s}-wght-normal'], ['fraunces', 'fraunces-{s}-opsz-normal'], ['fraunces', 'fraunces-{s}-opsz-italic']];
for (const [pkg, pat] of FONTS) for (const s of ['latin', 'latin-ext']){
  const f = pat.replace('{s}', s) + '.woff2';
  cpSync(join(NM, '@fontsource-variable', pkg, 'files', f), join(OUT, 'assets/fonts', f));
}
for (const f of ['onest', 'unbounded', 'jetbrains-mono', 'fraunces']) cpSync(join(NM, '@fontsource-variable', f, 'LICENSE'), join(OUT, 'assets/fonts', `LICENSE-${f}.txt`));
cpSync(join(HERE, 'static'), OUT, { recursive: true });
write('favicon.svg', TEMA.fill(readFileSync(join(HERE, 'src/favicon.svg'), 'utf8'), 'site/src/favicon.svg'));

const importmap = JSON.stringify({ imports: { three: u('assets/three/three.module.min.js'), 'three/addons/': u('assets/three/addons/') } });
write('index.html', indexHtml(importmap));
for (const c of CATS) write(`${c.url}/index.html`, categoryPage(c));
write('live/echipa/index.html', teamPage());
for (const [from, to] of Object.entries(REDIRECTS)) if (!CATS.some(c => c.url === from)) write(`${from}/index.html`, redirect(u(to + '/')));
write('404.html', page({ title: 'Pagina nu există', path: '404.html', bodyHtml: `<h1>Drumul ăsta nu duce nicăieri.</h1><p class="kicker">Pagina nu există sau s-a mutat.</p><p class="actions"><a class="btn" href="${u()}">Înapoi în atelier →</a></p>` }));
write('.nojekyll', '');
if (domeniu) write('CNAME', domeniu + '\n');
write('robots.txt', `User-agent: *\nAllow: /\n${SITE_URL ? `Sitemap: ${abs('sitemap.xml')}\n` : ''}`);
if (SITE_URL) write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${['', ...CATS.map(c => c.url + '/'), 'live/echipa/'].map(p => `  <url><loc>${esc(abs(p))}</loc></url>`).join('\n')}\n</urlset>\n`);

// API: același conținut pentru site și pentru o viitoare aplicație (D-030)
write('api/live.json', JSON.stringify(liveJson, null, 2) + '\n');
write('api/continut.json', JSON.stringify({
  generat: new Date(NOW).toISOString(),
  site: { titlu: site.titlu, descriere: site.descriere, github: GH, rezervare: rezervare || null, intro: site.intro, in_pregatire: site.in_pregatire, in_centru: centru },
  familii, categorii: CATS.map(c => ({ ...c, url: pageUrl(c) })),
  business: BUSINESS, nevoi,
  despre: { titlu: despre.data.titlu || 'Despre mine', markdown: despre.body },
  echipa: { ...(site.echipa || {}), agenti: AGENTS.map(({ status, ...a }) => a), procese: PROCESE }
}, null, 2) + '\n');

console.log(`Gata: ${OUT}`);
console.log(`  bază: ${BASE}${SITE_URL ? `  adresă: ${SITE_URL}` : ''}${domeniu ? `  CNAME: ${domeniu}` : ''}`);
console.log(`  Live: ${events.length} evenimente (${taskEvents.length} taskuri), pe banc: ${bench.length}, luminițe aprinse: ${lit.size}`);
console.log(`  oprite de filtru: ${JSON.stringify(skipped)}`);
if (warnings.length) console.log(`  ${warnings.length} avertismente`);
