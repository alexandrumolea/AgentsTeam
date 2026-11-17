#!/usr/bin/env node
// Generatorul de curs (T-022). O sursă, trei ieșiri (Radu, arhitectura-curs-change-agility-v0.md, v1).
//   node build.mjs <folderul-cursului> [--editie 2026-11-23] [--out <folder>] [--pdf]
// Orice eroare din verificări oprește build-ul ÎNAINTE să scrie ceva.
import { mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { citesteCurs } from './lib/sursa.mjs';
import { construiesteExport, verificaExport } from './lib/export.mjs';
import { construiesteTrainer, caleTema } from './lib/trainer.mjs';

const CHROME = ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'];

export function build(folder, { editie, out, pdf = false, log = console.log } = {}) {
  const c = citesteCurs(resolve(folder), { editie });
  const erori = [...c.erori];
  let exp, html;
  if (!erori.length) {
    exp = construiesteExport(c);
    erori.push(...verificaExport(exp, c));
    html = construiesteTrainer(c);
  }
  for (const a of c.avertismente) log(`  atenție: ${a}`);
  if (erori.length) {
    log(`\nBuild oprit: ${erori.length} ${erori.length === 1 ? 'problemă' : 'probleme'}. Nu am scris nimic.\n`);
    for (const e of erori) log(`  ✗ ${e}`);
    return { ok: false, erori, avertismente: c.avertismente };
  }
  const dir = resolve(out ?? join(folder, 'dist'));
  mkdirSync(dir, { recursive: true });
  const slug = c.curs.slug;
  const fJson = join(dir, `${slug}-participanti.json`);
  const fHtml = join(dir, `${slug}-trainer.html`);
  writeFileSync(fJson, JSON.stringify(exp, null, 2) + '\n');
  writeFileSync(fHtml, html);
  const fisiere = [fJson, fHtml];
  if (pdf) fisiere.push(...pdfuri(fHtml, dir, slug, log));
  const ecrane = (html.match(/"lume":/g) || []).length;
  const n = (fel) => c.agenda.filter((r) => r.fel === fel).length;
  const t = c.total, ramas = t.ramas == null ? '' : t.ramas >= 0 ? `, rămân ${t.ramas} min` : `, depășire ${-t.ramas} min`;
  log(`\nGata: ${c.curs.titlu}${c.editie.data ? `, ediția ${c.editie.data}` : ''}. Agenda: ${n('modul')} module (din ${c.module.length}), ${n('piesa')} piese singure, ${n('pauza')} pauze; total ${t.agenda} min${ramas}. ${c.piese.size} piese în bibliotecă; ${ecrane} ecrane în sală; tema ${caleTema(c.curs.brand).split('/').pop()}.`);
  for (const f of fisiere) log(`  ${f}`);
  return { ok: true, fisiere, export: exp, avertismente: c.avertismente };
}

/** PDF-urile, tipărite de Chrome din același HTML (fără nimic instalat în plus). */
function pdfuri(fHtml, dir, slug, log) {
  const chrome = CHROME.find(existsSync);
  if (!chrome) { log('  atenție: nu găsesc Google Chrome, deci nu fac PDF-urile'); return []; }
  const iesiri = [];
  for (const [mod, nume] of [['tipar-trainer', `${slug}-trainer.pdf`], ['tipar-ecrane', `${slug}-ecrane.pdf`]]) {
    const f = join(dir, nume);
    rmSync(f, { force: true });
    const profil = join(dir, '.chrome-tipar');
    const r = spawnSync(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', `--user-data-dir=${profil}`, '--no-pdf-header-footer',
      '--virtual-time-budget=5000', `--print-to-pdf=${f}`, `${pathToFileURL(fHtml).href}#${mod}`], { encoding: 'utf8', timeout: 60000 });
    rmSync(profil, { recursive: true, force: true });
    if (existsSync(f)) iesiri.push(f); else log(`  atenție: PDF-ul ${nume} nu s-a generat (${(r.stderr || r.error || '').toString().split('\n')[0]})`);
  }
  return iesiri;
}

// Linia de comandă
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = { pdf: args.includes('--pdf') };
  const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  opt.editie = val('--editie'); opt.out = val('--out');
  const folder = args.find((a, i) => !a.startsWith('--') && !['--editie', '--out'].includes(args[i - 1]));
  if (!folder) {
    console.log('Folosire: node build.mjs <folderul-cursului> [--editie AAAA-LL-ZZ] [--out <folder>] [--pdf]');
    process.exit(2);
  }
  process.exit(build(folder, opt).ok ? 0 : 1);
}
