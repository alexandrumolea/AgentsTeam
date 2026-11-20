// Harvest de obiective (2026-11-20), în Chrome: secțiunea „Obiective” deasupra pieselor (offline și în editorul local),
// verdictul cu tastele D / P / N și butoane, numărul de piese, Fișa (F), Editează, „Obiectiv nou”, viziunea, bifele din fișa piesei.
//   node teste/chrome-obiective.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { launch } from './cdp.mjs';
import { build } from '../build.mjs';
import { pornesteEditor } from '../editor.mjs';
import { OBIECTIVE } from './obiective-exemplu.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const copie = (p) => {
  const d = mkdtempSync(join(tmpdir(), p));
  cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), d, { recursive: true, filter: (f) => !f.includes('/dist') });
  writeFileSync(join(d, 'harvest-obiective.yml'), OBIECTIVE);
  mkdirSync(join(d, 'harvest', 'obiective'), { recursive: true });
  writeFileSync(join(d, 'harvest', 'obiective', 'ob-curba.md'), '# Locul pe curbă\n\n## De ce contează\nFiecare se vede pe curbă.\n');
  return d;
};
const dir = copie('curs-ob-');
const r = build(dir, { out: join(dir, 'iesire'), log: () => {}, biblioteca: null });
if (!r.ok) { console.error('build-ul a eșuat', r.erori); process.exit(1); }

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const b = await launch({ port: 9341 });
const dirEd = copie('curs-ob-ed-');
const ed = await pornesteEditor({ folder: dirEd, port: 0, log: () => {}, biblioteca: null });
const yml = (f) => parseYaml(readFileSync(join(dirEd, f), 'utf8'));
try {
  console.log('Offline (fișierul din dist/):');
  const c = await b.open(pathToFileURL(r.fisiere[1]).href);
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 1200, deviceScaleFactor: 1, mobile: false }, c.sessionId); await pauza(300);
  const v = (x) => b.evaluate(c, x);
  ok(await v('document.querySelectorAll("#obh .obh-carte").length === 4 && document.getElementById("obh").compareDocumentPosition(document.getElementById("masa-coloane")) & Node.DOCUMENT_POSITION_FOLLOWING'), 'secțiunea Obiective are 4 cartonașe și stă deasupra pieselor');
  ok(await v('/Viziune · propunere/.test(document.querySelector(".obh-viziune").textContent) && /De la a rezista la a naviga/.test(document.querySelector(".obh-viziune").textContent)'), 'viziunea apare sus, ca propunere');
  ok(await v('/2 cu „Da”/.test(document.querySelector(".obh-stare").textContent)'), 'numărul celor cu „Da”');
  ok(await v('document.querySelector(\'.obh-carte[data-ob="ob-curba"] .obh-nr\').textContent === "1" && document.querySelector(\'.obh-carte[data-ob="ob-pas"] .obh-nr\').textContent === "2" && !document.querySelector(\'.obh-carte[data-ob="ob-nou"] .obh-nr\')'), 'cele cu „Da” au numărul lor din zi');
  ok(await v('/^2 piese$/.test(document.querySelector(\'.obh-carte[data-ob="ob-nou"] .obh-piese\').textContent)'), 'ob-nou: 2 piese din Harvest (lista lui „piese”)');
  ok(await v('/^3 piese$/.test(document.querySelector(\'.obh-carte[data-ob="ob-curba"] .obh-piese\').textContent)'), 'ob-curba: harta-emotiilor (listă) + curba, model-curba (numerele [1] vechi)');
  ok(await v('[...document.querySelectorAll("#obh button[data-ov]")].every(x => x.disabled)'), 'offline: verdictul nu se schimbă (butoane inactive)');
  ok(await v('!document.getElementById("obh-nou") && !document.getElementById("obh-viz-ed")'), 'offline: fără „Obiectiv nou” și fără Editează');
  ok(await v('[...document.querySelectorAll("#masa-rezumat .rz[data-rz=obiective]")].length === 2'), 'rezumatul are 2 obiective (cele cu „Da”)');
  await b.click(c, '.obh-carte[data-ob="ob-curba"] .mc-fisa');
  ok(await v('document.getElementById("fisa-dialog").open && /Fișa obiectivului · harvest\\/obiective\\/ob-curba\\.md/.test(document.getElementById("fisa-sursa").textContent) && /Fiecare se vede pe curbă/.test(document.getElementById("fisa-corp").textContent)'), '„Fișa” deschide fișa obiectivului din harvest/obiective/');
  await b.key(c, 'Escape'); await pauza(150);
  ok(await v('document.activeElement && document.activeElement.dataset.ob === "ob-curba"'), 'Esc: focusul revine pe cartonașul obiectivului');
  await b.key(c, 'ArrowDown'); await b.key(c, 'f');
  ok(await v('document.getElementById("fisa-dialog").open && /Fișa nu e scrisă încă/.test(document.getElementById("fisa-corp").textContent)'), 'săgeata trece la următorul; F îi deschide fișa (încă nescrisă)');
  await b.key(c, 'Escape'); await pauza(150);
  for (const w of [1360, 800, 375, 320]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 700 }, c.sessionId); await pauza(200);
    const rau = await v(`[...document.querySelectorAll(".obh-carte")].filter(x => { const r = x.getBoundingClientRect(), l = x.parentNode.getBoundingClientRect(); return r.left < l.left - .5 || r.right > l.right + .5 || x.scrollWidth > x.clientWidth + 1; }).length`);
    ok(!rau && await v('document.documentElement.scrollWidth <= innerWidth'), `${w}px: cartonașele încap, fără derulare orizontală`);
    if (poze && (w === 1360 || w === 375)) await b.screenshot(c, join(poze, `obiective-${w}.png`));
  }

  console.log('Editorul local:');
  const e = await b.open(ed.url.replace('#ecrane', '#masa'));
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 1200, deviceScaleFactor: 1, mobile: false }, e.sessionId); await pauza(500);
  const fe = (x) => b.evaluate(e, x);
  ok(await fe('[...document.querySelectorAll("#obh button[data-ov]")].every(x => !x.disabled) && !!document.getElementById("obh-nou")'), 'verdictul și „Obiectiv nou” sunt active');
  await fe('document.querySelector(\'.obh-carte[data-ob="ob-nou"]\').focus(); 1');
  await b.key(e, 'd'); await pauza(900);
  ok(yml('harvest-obiective.yml').obiective.find((o) => o.id === 'ob-nou').verdict === 'da', 'tasta D scrie „da” în harvest-obiective.yml');
  ok(await fe('/3 cu „Da”/.test(document.querySelector(".obh-stare").textContent) && document.querySelectorAll("#masa-rezumat .rz[data-rz=obiective]").length === 3 && document.querySelector(\'.obh-carte[data-ob="ob-nou"] .obh-nr\').textContent === "2"'), 'numărul, rezumatul și locul în zi se refac pe loc');
  ok(await fe('document.activeElement && document.activeElement.dataset.ob === "ob-nou"'), 'focusul rămâne pe cartonaș');
  await b.key(e, 'p'); await pauza(900);
  await b.click(e, '.obh-carte[data-ob="ob-respins"] button[data-ov="poate"]'); await pauza(900);
  const lista = yml('harvest-obiective.yml').obiective;
  ok(lista.find((o) => o.id === 'ob-nou').verdict === 'poate' && lista.find((o) => o.id === 'ob-respins').verdict === 'poate', 'P și butonul „Poate” se scriu, unul după altul, fără conflict');
  // viziunea
  await b.click(e, '#obh-viz-ed'); await pauza(200);
  await fe('document.getElementById("obh-viz-text").value = "Viziunea lui Alex [EXEMPLU]"; 1');
  await b.click(e, '#obh-viz-salveaza'); await pauza(900);
  ok(yml('harvest-obiective.yml').viziune.text === 'Viziunea lui Alex [EXEMPLU]' && /Viziunea lui Alex/.test(await fe('document.querySelector(".obh-viziune").textContent')), 'viziunea se editează și se salvează');
  // fișa obiectivului: Editează
  await b.click(e, '.obh-carte[data-ob="ob-curba"] .mc-fisa'); await pauza(400);
  await b.click(e, '#fe-editeaza'); await pauza(500);
  ok(await fe('!document.getElementById("fe-campuri-ob").hidden && document.getElementById("fe-campuri").hidden && document.getElementById("fe-core").hidden && document.getElementById("fe-ob-text").value === "[EXEMPLU] Fiecare își știe locul pe curba schimbării"'), 'Editează: textul obiectivului, fără câmpurile piesei și fără core');
  await fe('document.getElementById("fe-ob-text").value = "[EXEMPLU] Fiecare își știe locul pe curbă"; document.getElementById("fe-text").value += "\\nAdăugat de Alex.\\n"; 1');
  await b.click(e, '#fe-salveaza'); await pauza(1500);
  ok(yml('harvest-obiective.yml').obiective[0].text === '[EXEMPLU] Fiecare își știe locul pe curbă' && /Adăugat de Alex/.test(readFileSync(join(dirEd, 'harvest', 'obiective', 'ob-curba.md'), 'utf8')), 'salvează textul în harvest-obiective.yml și fișa în harvest/obiective/');
  ok(await fe('/Fiecare își știe locul pe curbă$/.test(document.querySelector(\'.obh-carte[data-ob="ob-curba"] .obh-text\').textContent) && /Adăugat de Alex/.test(document.getElementById("fisa-corp").textContent)'), 'cartonașul și fișa arată noul text');
  await b.key(e, 'Escape'); await pauza(200);
  // fișa piesei: bifele de obiective
  await b.click(e, '.mc-fisa[data-fisa="harta-emotiilor"]'); await pauza(400);
  await b.click(e, '#fe-editeaza'); await pauza(600);
  ok(await fe('!document.getElementById("fe-obiective").hidden && document.querySelectorAll("#fe-ob-lista input[data-ob]").length === 4 && document.querySelector(\'#fe-ob-lista input[data-ob="ob-curba"]\').checked'), 'fișa piesei: bife cu toate obiectivele; ob-curba bifat (din lista lui)');
  await b.click(e, '#fe-ob-lista input[data-ob="ob-curba"]');
  await b.click(e, '#fe-ob-lista input[data-ob="ob-pas"]');
  if (poze) await b.screenshot(e, join(poze, 'obiective-bife.png'));
  await b.key(e, 's', 4); await pauza(1500);
  const rand = yml('harvest.yml').candidate.find((x) => x.id === 'harta-emotiilor');
  ok(JSON.stringify(rand.obiective) === '["ob-pas"]' && yml('harvest-obiective.yml').obiective[0].piese.length === 0, '⌘S: rândul are obiective: [ob-pas]; ob-curba nu o mai are în listă');
  ok(await fe('/^2 piese$/.test(document.querySelector(\'.obh-carte[data-ob="ob-curba"] .obh-piese\').textContent) && /^2 piese$/.test(document.querySelector(\'.obh-carte[data-ob="ob-pas"] .obh-piese\').textContent) && /Harta/.test(document.querySelector(\'.obh-carte[data-ob="ob-pas"] .obh-piese\').title)'), 'numărul de piese al obiectivelor se reface fără reîncărcare');
  await b.key(e, 'Escape'); await pauza(200);
  // obiectiv nou
  await b.click(e, '#obh-nou'); await pauza(200);
  ok(await fe('document.activeElement.id === "obh-nou-text"'), '„Obiectiv nou” cere textul');
  await b.send('Input.insertText', { text: 'Fiecare pleacă cu un om alături [EXEMPLU]' }, e.sessionId);
  await b.key(e, 'Enter'); await pauza(2500);
  const nou = yml('harvest-obiective.yml').obiective.at(-1);
  ok(nou.verdict === 'nou' && nou.sursa === 'alex' && /om alături/.test(nou.text), 'obiectivul nou e în fișier, cu verdict „nou”');
  ok(await fe(`!!document.querySelector('.obh-carte[data-ob="${nou.id}"]') && document.getElementById("fisa-dialog").open && __fisaEditor.stare() && __fisaEditor.stare().fel === "obiectiv" && __fisaEditor.stare().id === "${nou.id}"`), 'după reîncărcare: cartonașul e acolo, iar fișa lui e deschisă pentru editare');
  ok(!b.exceptii.length, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
} finally { await ed.inchide(); await b.close(); }
console.log(esecuri ? `\n${esecuri} verificări au eșuat.` : '\nToate verificările au trecut.');
process.exit(esecuri ? 1 : 0);
