// Biblioteca core în Chrome (2026-11-20): „Trimite în core” din Fișa, bifa „Salvează și în core” (nebifată la fiecare deschidere),
// semnul „◇ core” pe cartonaș, „diferă” → alegerea alăturată, „Adaugă din core” în alt curs (id ocupat → <id>-core), telefon.
//   node teste/chrome-core.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { launch } from './cdp.mjs';
import { pornesteEditor } from '../editor.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const R = mkdtempSync(join(tmpdir(), 'curs-core-chrome-'));
for (const n of ['a', 'b']) cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), join(R, 'cursuri', n), { recursive: true, filter: (f) => !f.includes('/dist') });
const A = join(R, 'cursuri', 'a'), B = join(R, 'cursuri', 'b'), CORE = join(R, 'biblioteca');
const ea = await pornesteEditor({ folder: A, port: 0, log: () => {} });
const eb = await pornesteEditor({ folder: B, port: 0, log: () => {} });

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const citeste = (d, f) => readFileSync(join(d, f), 'utf8');
const b = await launch();
const pregateste = async (p, w = 1360) => {
  await b.send('Page.addScriptToEvaluateOnNewDocument', { source: 'window.confirm = () => true;' }, p.sessionId);
  await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: 1100, deviceScaleFactor: 1, mobile: w < 700 }, p.sessionId);
  await b.send('Page.reload', {}, p.sessionId); await pauza(900);
};
try {
  const a = await b.open(ea.url.replace('#ecrane', '#masa')); await pregateste(a);
  const ev = (expr) => b.evaluate(a, expr);
  console.log('Cursul a: trimite în core din Fișa');
  ok(await ev('!!document.getElementById("core-deschide") && document.getElementById("fe-noua").nextSibling.id === "core-deschide"'), '„Adaugă din core” stă lângă „Piesă nouă”');
  await b.click(a, '#core-deschide'); await pauza(400);
  ok(await ev('document.getElementById("core-dialog").open && /Core e încă gol/.test(document.getElementById("core-gol").textContent)'), 'core gol: lista spune cum intră piesele');
  await b.key(a, 'Escape'); await pauza(200);
  ok(!(await ev('document.getElementById("core-dialog").open')) && (await ev('document.activeElement.id === "core-deschide"')), 'Esc închide lista, focusul revine pe buton');
  await b.click(a, '.mc-fisa[data-fisa="apreciere-ceilalti"]'); await pauza(500);
  ok(await ev('!document.getElementById("fe-core").hidden && /Doar în acest curs/.test(document.getElementById("fe-core").textContent) && !!document.getElementById("fe-core-trimite")'), 'fișa nelegată: „Doar în acest curs” + „Trimite în core”, fără să editezi');
  await b.click(a, '#fe-core-trimite'); await pauza(2200);
  ok(existsSync(join(CORE, 'piese', 'apreciere-ceilalti.md')) && /id: apreciere-ceilalti/.test(citeste(CORE, 'biblioteca.yml')), 'piesa e în core (piese/ + biblioteca.yml)');
  ok(await ev('document.getElementById("fisa-dialog").open && /Din core comun\\/apreciere-ceilalti · la zi/.test(document.getElementById("fe-core").textContent)'), 'după reîncărcare: fișa redeschisă, „Din core · la zi”');
  ok(await ev('/E și în core: comun\\/apreciere-ceilalti/.test(document.getElementById("fe-core-mesaj").textContent)'), 'mesajul spune ce s-a întâmplat');
  ok(await ev('document.querySelector(\'.masa-carte[data-id="apreciere-ceilalti"] .mc-core\').textContent === "◇ core"'), 'cartonașul are „◇ core” (la zi: fără stare)');
  if (poze) await b.screenshot(a, join(poze, 'core-fisa.png'));
  await b.key(a, 'Escape'); await pauza(200);

  console.log('Bifa „Salvează și în core”');
  await b.click(a, '.mc-fisa[data-fisa="studiu-adaptare"]'); await pauza(400);
  await b.click(a, '#fe-editeaza'); await pauza(600);
  ok(await ev('!document.getElementById("fe-core-eticheta").hidden && !document.getElementById("fe-core-bifa").checked && document.getElementById("fe-core-bifa-text").textContent === "Salvează și în core"'), 'bifa e lângă „Salvează”, nebifată');
  ok(await ev('document.getElementById("fe-core").hidden'), 'cât editezi, rândul core e ascuns (alegerea e bifa)');
  await b.send('Input.insertText', { text: 'Scris de Alex. ' }, a.sessionId); await pauza(100);
  await b.click(a, '#fe-core-bifa');
  await b.key(a, 's', 4); await pauza(2800);
  ok(/^Scris de Alex/.test(citeste(A, 'harvest/studiu-adaptare.md')) && /^Scris de Alex/.test(citeste(CORE, 'harvest/studiu-adaptare.md')), '⌘S cu bifa: fișa e în curs și în core');
  ok(/id: studiu-adaptare[\s\S]*?din: comun\/studiu-adaptare\n\s+baza: "?[0-9a-f]{8}"?/.test(citeste(A, 'harvest.yml')), 'rândul din harvest.yml are din și baza');
  ok(await ev('!!document.querySelector(\'.masa-carte[data-id="studiu-adaptare"] .mc-core\') && document.getElementById("fisa-dialog").open'), 'cartonașul are „◇ core”, fișa e deschisă');
  await b.click(a, '#fe-editeaza'); await pauza(600);
  ok(await ev('!document.getElementById("fe-core-bifa").checked && document.getElementById("fe-core-bifa-text").textContent === "Actualizează și în core"'), 'la următoarea deschidere: iar nebifată, „Actualizează și în core”');
  await b.click(a, '#fe-renunta'); await pauza(200);
  await b.key(a, 'Escape'); await pauza(200);

  console.log('Diferă: alegerea alăturată');
  writeFileSync(join(CORE, 'harvest', 'studiu-adaptare.md'), '# Versiunea din alt curs\n');
  writeFileSync(join(A, 'harvest', 'studiu-adaptare.md'), '# Versiunea cursului a\n');
  await b.send('Page.reload', {}, a.sessionId); await pauza(1500);
  ok(await ev('/◇ core · diferă/.test(document.querySelector(\'.masa-carte[data-id="studiu-adaptare"] .mc-core\').textContent)'), 'reîncărcarea vede schimbarea din core: „◇ core · diferă”');
  await b.click(a, '.mc-fisa[data-fisa="studiu-adaptare"]'); await pauza(500);
  await b.click(a, '#fe-core-compara'); await pauza(600);
  ok(await ev('!document.getElementById("fe-cmp").hidden && document.getElementById("fisa-corp").hidden && document.querySelectorAll(".fe-cmp-col").length === 2 && /Versiunea cursului a/.test(document.querySelectorAll(".fe-cmp-col")[0].textContent) && /Versiunea din alt curs/.test(document.querySelectorAll(".fe-cmp-col")[1].textContent)'), '„Compară și alege”: cele două fișe alăturat');
  ok(await ev('["fe-cmp-curs", "fe-cmp-core", "fe-cmp-trimit"].every((id) => !!document.getElementById(id))'), 'trei alegeri: Păstrez a cursului / Iau din core / Trimit a cursului în core');
  if (poze) await b.screenshot(a, join(poze, 'core-compara.png'));
  await b.click(a, '#fe-cmp-core'); await pauza(2200);
  ok(citeste(A, 'harvest/studiu-adaptare.md') === '# Versiunea din alt curs\n', '„Iau din core”: copia din curs e cea din core');
  ok(await ev('/· la zi/.test(document.getElementById("fe-core").textContent)'), 'apoi „la zi”');
  await b.key(a, 'Escape'); await pauza(200);

  console.log('Cursul b: Adaugă din core');
  const c = await b.open(eb.url.replace('#ecrane', '#masa')); await pregateste(c);
  const evb = (expr) => b.evaluate(c, expr);
  await b.click(c, '#core-deschide'); await pauza(500);
  ok(await evb('document.querySelectorAll("#core-lista .core-rand").length === 2'), 'lista are cele două piese din core');
  await b.evaluate(c, '{ const q = document.getElementById("core-q"); q.value = "studii"; q.dispatchEvent(new Event("input")); }'); await pauza(150);
  ok(await evb('document.querySelectorAll("#core-lista .core-rand").length === 1'), 'căutarea filtrează (fără diacritice)');
  await b.evaluate(c, '{ const q = document.getElementById("core-q"); q.value = ""; q.dispatchEvent(new Event("input")); }'); await pauza(150);
  ok(await evb('document.querySelectorAll("#core-filtre button").length === 3'), 'filtrele-buton după tip: Toate + 2 tipuri');
  await b.click(c, '#core-filtre button[data-tip="inchidere"]'); await pauza(150);
  ok(await evb('[...document.querySelectorAll("#core-lista .core-rand")].map(x => x.dataset.id).join() === "apreciere-ceilalti"'), 'filtrul „închidere” lasă doar piesa de închidere');
  await b.click(c, '.core-adauga[data-id="apreciere-ceilalti"]'); await pauza(600);
  ok(await evb('!document.querySelector(\'.core-rand[data-id="apreciere-ceilalti"] .core-id\').hidden && document.querySelector(\'.core-rand[data-id="apreciere-ceilalti"] .core-id input\').value === "apreciere-ceilalti-core" && /are deja o piesă/.test(document.getElementById("core-eroare").textContent)'), 'id ocupat în curs: propune apreciere-ceilalti-core');
  if (poze) await b.screenshot(c, join(poze, 'core-adauga.png'));
  await b.click(c, '.core-rand[data-id="apreciere-ceilalti"] .core-adauga[data-cu-id]'); await pauza(2200);
  ok(/id: apreciere-ceilalti-core[\s\S]*?verdict: nou[\s\S]*?din: comun\/apreciere-ceilalti/.test(citeste(B, 'harvest.yml')) && existsSync(join(B, 'piese', 'apreciere-ceilalti-core.md')), 'rândul nou (verdict nou, din: comun/…) și piesa copiată');
  ok(await evb('!!document.querySelector(\'.masa-carte[data-id="apreciere-ceilalti-core"] .mc-core\') && /Am adus comun\\/apreciere-ceilalti/.test(document.getElementById("masa-mesaj").textContent)'), 'cartonașul apare în Harvest cu „◇ core”, cu mesaj');
  await b.click(c, '#core-deschide'); await pauza(500);
  ok(await evb('/e deja în curs/.test(document.querySelector(\'.core-rand[data-id="apreciere-ceilalti"]\').textContent)'), 'a doua oară: „e deja în curs”, fără buton');

  console.log('Pe telefon (375 px)');
  for (const w of [375, 320]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: 800, deviceScaleFactor: 1, mobile: true }, c.sessionId); await pauza(300);
    ok(await evb('[...document.querySelectorAll("#core-lista .core-rand")].every(li => { const r = li.getBoundingClientRect(), d = document.getElementById("core-dialog").getBoundingClientRect(); return r.left >= d.left - .5 && r.right <= d.right + .5 && li.scrollWidth <= li.clientWidth + 1; })'), `${w}px: rândurile din core stau în dialog`);
  }
  if (poze) await b.screenshot(c, join(poze, 'core-adauga-375.png'));
  await b.key(c, 'Escape'); await pauza(200);
  await b.click(c, '.mc-fisa[data-fisa="apreciere-ceilalti-core"]'); await pauza(500);
  ok(await evb('{ const r = document.getElementById("fe-core").getBoundingClientRect(); !document.getElementById("fe-core").hidden && r.right <= innerWidth + .5 && document.documentElement.scrollWidth <= innerWidth }'), '320px: rândul „Din core” încape, fără derulare orizontală');
  ok(!b.exceptii.length, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
} finally { await ea.inchide(); await eb.inchide(); await b.close(); }
console.log(esecuri ? `\n${esecuri} verificări au eșuat.` : '\nToate verificările au trecut.');
process.exit(esecuri ? 1 : 0);
