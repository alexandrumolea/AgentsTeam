// Refă imaginile PNG din culorile temei (content/tema.yml): static/og.png (previzualizarea
// de pe rețele, 1200×630) și static/apple-touch-icon.png (180×180).
// Rulează după o schimbare de paletă: npm run imagini (în folderul site/). Doar pe macOS:
// folosește qlmanage și sips, care vin cu sistemul (fără dependențe noi).
// Cu paleta de acum, rezultatul e identic, octet cu octet, cu imaginile din repo.
import { readFileSync, writeFileSync, mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir, platform } from 'node:os';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { loadTema } from './tema.mjs';
import { parse as parseYaml } from 'yaml';

const HERE = dirname(fileURLToPath(import.meta.url));
if (platform() !== 'darwin'){ console.error('imagini.mjs merge doar pe macOS (qlmanage, sips). Site-ul funcționează și fără: imaginile vechi rămân.'); process.exit(1); }

let tema;
try { tema = loadTema(resolve(HERE, '..')); } catch (e) { console.error(`Eroare: ${e.message}`); process.exit(1); }
// semnătura din colț vine din content/site.yml (intro.marca), ca pe site
const site = parseYaml(readFileSync(resolve(HERE, '../content/site.yml'), 'utf8')) || {};
const marca = String(site.intro?.marca || site.titlu || '').toUpperCase().replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
const tmp = mkdtempSync(join(tmpdir(), 'imagini-'));
const run = (cmd, ...args) => execFileSync(cmd, args, { stdio: 'ignore' });
try {
  // og.png: SVG-ul e pătrat (pentru qlmanage), apoi tăiem banda din mijloc la 1200×630
  writeFileSync(join(tmp, 'og.svg'), tema.fill(readFileSync(join(HERE, 'src/og.svg'), 'utf8').replace('{{site.marca}}', marca), 'site/src/og.svg'));
  run('qlmanage', '-t', '-s', '1200', '-o', tmp, join(tmp, 'og.svg'));
  run('sips', '-c', '630', '1200', join(tmp, 'og.svg.png'), '--out', join(HERE, 'static/og.png'));
  // apple-touch-icon.png: favicon-ul fără colțuri rotunjite (iOS le rotunjește singur)
  writeFileSync(join(tmp, 'icon.svg'), tema.fill(readFileSync(join(HERE, 'src/favicon.svg'), 'utf8'), 'site/src/favicon.svg').replace(' rx="14"', ''));
  run('qlmanage', '-t', '-s', '180', '-o', tmp, join(tmp, 'icon.svg'));
  copyFileSync(join(tmp, 'icon.svg.png'), join(HERE, 'static/apple-touch-icon.png'));
  console.log('Gata: site/static/og.png și site/static/apple-touch-icon.png, din content/tema.yml.');
} finally { rmSync(tmp, { recursive: true, force: true }); }
