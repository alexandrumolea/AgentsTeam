// Editorul local în Chrome (1.11): Editează → previzualizare → Salvează → pagina se reîncarcă la aceeași vedere, cu textul nou.
//   node teste/chrome-editor.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
import { pornesteEditor } from '../editor.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const dir = mkdtempSync(join(tmpdir(), 'curs-editor-chrome-'));
cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), dir, { recursive: true, filter: (f) => !f.includes('/dist') });
const ed = await pornesteEditor({ folder: dir, port: 0, log: () => {} });

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const b = await launch();
try {
  const c = await b.open(ed.url);
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1500, deviceScaleFactor: 1, mobile: false }, c.sessionId); await pauza(300);
  ok(await b.evaluate(c, 'location.hash === "#ecrane" && !!document.querySelector(\'.ec-carte[data-id="curba#1"] .ed-btn\')'), 'vederea Ecrane are „Editează” pe ecranele care se pot edita');
  ok(!(await b.evaluate(c, '!!document.querySelector(\'.ec-carte[data-id="curba#titlu"] .ed-btn\')')), 'titlul de modul nu are buton (se schimbă în antet)');
  ok(!(await b.evaluate(c, '!!document.querySelector(\'.ec-carte[data-id="pauza#1"] .ed-btn\')')), 'nici pauza din agendă (pauza#1)');
  await b.click(c, '.ec-carte[data-id="curba#1"] .ed-btn'); await pauza(400);
  ok(await b.evaluate(c, 'document.querySelector(".ed-dialog").open && document.getElementById("ed-text").value.includes("prima săptămână")'), 'se deschide sursa blocului');
  await b.evaluate(c, '{ const t = document.getElementById("ed-text"); t.value = "## O întrebare nouă\\nCe ai observat **azi**?"; t.dispatchEvent(new Event("input")); }');
  await pauza(700);
  ok(await b.evaluate(c, '/O întrebare nouă/.test(document.querySelector("#ed-previz h2")?.textContent || "")'), 'previzualizarea live arată ecranul cu titlul nou');
  if (poze) await b.screenshot(c, join(poze, 'editor.png'));
  await b.click(c, '#ed-salveaza'); await pauza(2500);
  ok(await b.evaluate(c, 'location.hash === "#ecrane" && !document.getElementById("ecrane").hidden'), 'după salvare, pagina revine la vederea Ecrane');
  ok(/O întrebare nouă/.test(await b.evaluate(c, 'document.querySelector(\'.ec-carte[data-id="curba#1"] .ec-mini\').textContent')), 'miniatura arată textul nou');
  ok(/salvat în 02-curba-schimbarii\.md/.test(await b.evaluate(c, 'document.querySelector(".ed-bara").textContent')), 'bara spune ce fișier s-a salvat');
  ok(/:::sala-si-curs\n## O întrebare nouă\nCe ai observat \*\*azi\*\*\?\n:::/.test(readFileSync(join(dir, '02-curba-schimbarii.md'), 'utf8')), 'fișierul de pe disc are blocul nou');
  // Eroare de build: textul rămâne, eroarea apare lângă ecran
  await b.click(c, '.ec-carte[data-id="curba#1"] .ed-btn'); await pauza(400);
  await b.evaluate(c, '{ const t = document.getElementById("ed-text"); t.value = "Mulțumim, Firma Exemplu!"; t.dispatchEvent(new Event("input")); }');
  await b.click(c, '#ed-salveaza'); await pauza(1500);
  ok(await b.evaluate(c, 'document.querySelector(".ed-dialog").open && /nume interzis/.test(document.getElementById("ed-eroare").textContent) && document.getElementById("ed-text").value === "Mulțumim, Firma Exemplu!"'), 'un nume interzis: eroarea apare lângă ecran, textul nu se pierde');
  await b.evaluate(c, 'document.querySelector(".ed-dialog").close()');
  // Modul: ecrane și note; ecranul de comandă
  await b.click(c, '[data-vedere="modul"]');
  ok(await b.evaluate(c, '!!document.querySelector(\'#modul [data-sursa="model-curba#nota1"] .ed-btn\') && !!document.querySelector(\'#modul [data-sursa="perechi-curba#1"] .ed-btn\')'), 'vederea Modul are „Editează” pe ecrane și pe notele trainerului');
  await b.click(c, '[data-vedere="prezinta"]'); await b.click(c, '#prezinta-aici'); await pauza(300);
  await b.key(c, 'Escape'); await pauza(300);
  ok(await b.evaluate(c, '!!document.getElementById("ed-acum")'), 'ecranul de comandă are „Editează” pentru ecranul de acum');
  // Fereastra sălii: fără editor
  const s = await b.open(ed.url.replace('#ecrane', '#sala')); await pauza(500);
  ok(await b.evaluate(s, '!document.querySelector(".ed-btn, .ed-bara, .ed-dialog")'), 'fereastra sălii nu are nimic de editare');
  ok(b.exceptii.length === 0, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
  console.log(`\n${esecuri ? esecuri + ' verificări au picat.' : 'Toate verificările au trecut.'}`);
} finally { b.close(); await ed.inchide(); }
process.exit(esecuri ? 1 : 0);
