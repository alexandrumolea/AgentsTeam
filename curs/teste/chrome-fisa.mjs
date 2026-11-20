// Fișa piesei din Harvest (2026-11-19), în Chrome: butonul „Fișa”, dialogul (Esc, ×, focusul înapoi), conținutul din harvest/
// sau din piesa produsă, „nu e scrisă încă”, recitirea în editorul local. Plus butonul „Prezintă” din Bibliotecă la mai multe lățimi.
//   node teste/chrome-fisa.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';
import { build } from '../build.mjs';
import { pornesteEditor } from '../editor.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const copie = (p) => { const d = mkdtempSync(join(tmpdir(), p)); cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), d, { recursive: true, filter: (f) => !f.includes('/dist') }); return d; };
const FISA = '# Harta emoțiilor\n\n## Ce mi-a dat Alex\n> O idee din sală.\n\n## Pentru trainer\n- Sursa: [studiul](https://example.com/studiu)\n- **Bold** și *italic*\n';
const puneFisa = (d, id, text) => { mkdirSync(join(d, 'harvest'), { recursive: true }); writeFileSync(join(d, 'harvest', `${id}.md`), text); };

const dir = copie('curs-fisa-');
puneFisa(dir, 'harta-emotiilor', FISA);
const r = build(dir, { out: join(dir, 'iesire'), log: () => {} });
if (!r.ok) { console.error('build-ul a eșuat', r.erori); process.exit(1); }

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const b = await launch();
const dirEd = copie('curs-fisa-ed-');
const ed = await pornesteEditor({ folder: dirEd, port: 0, log: () => {} });
const deschis = (c) => b.evaluate(c, 'document.getElementById("fisa-dialog").open');
try {
  console.log('Offline (fișierul din dist/):');
  const c = await b.open(pathToFileURL(r.fisiere[1]).href);
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 1200, deviceScaleFactor: 1, mobile: false }, c.sessionId); await pauza(300);
  ok(await b.evaluate(c, '[...document.querySelectorAll(".masa-carte")].every(li => li.querySelector(".mc-fisa[data-fisa]"))'), 'fiecare cartonaș are butonul „Fișa”');
  ok(await b.evaluate(c, '!document.querySelector(\'.mc-fisa[data-fisa="harta-emotiilor"]\').classList.contains("fara") && document.querySelector(\'.mc-fisa[data-fisa="studiu-adaptare"]\').classList.contains("fara")'), '„Fișa” fără fișă scrisă e marcată (punctat)');
  await b.click(c, '.mc-fisa[data-fisa="harta-emotiilor"]');
  ok(await deschis(c), 'clic pe „Fișa” deschide dialogul');
  ok(await b.evaluate(c, '/harvest\\/harta-emotiilor\\.md/.test(document.getElementById("fisa-sursa").textContent) && !!document.querySelector("#fisa-corp blockquote") && !!document.querySelector("#fisa-corp strong")'), 'fișa din harvest/ e randată (citat, bold)');
  ok(await b.evaluate(c, 'const a = document.querySelector("#fisa-corp a"); a.target === "_blank" && /noopener/.test(a.rel)'), 'linkul extern se deschide în tab nou');
  if (poze) await b.screenshot(c, join(poze, 'fisa-harvest.png'));
  await b.key(c, 'Escape'); await pauza(150);
  ok(!(await deschis(c)), 'Esc închide fișa');
  ok(await b.evaluate(c, 'document.activeElement && document.activeElement.dataset.id === "harta-emotiilor"'), 'focusul revine pe cartonaș');
  await b.key(c, 'f');
  ok(await deschis(c), 'tasta F pe cartonaș deschide fișa');
  await b.click(c, '#fisa-inchide');
  ok(!(await deschis(c)), '× închide fișa');
  await b.click(c, '.mc-fisa[data-fisa="perechi-curba"]');
  ok(await b.evaluate(c, '/Piesa produsă · piese\\/perechi-curba\\.md/.test(document.getElementById("fisa-sursa").textContent) && /Durată/.test(document.querySelector("#fisa-corp .fisa-antet").textContent) && /Nota trainerului/.test(document.getElementById("fisa-corp").textContent)'), 'fără fișă în harvest/: piesa produsă, cu antetul ca listă și nota trainerului');
  await b.key(c, 'Escape'); await pauza(150);
  await b.click(c, '.mc-fisa[data-fisa="studiu-adaptare"]');
  ok(await b.evaluate(c, '/Fișa nu e scrisă încă/.test(document.getElementById("fisa-corp").textContent)'), 'fără nimic: „Fișa nu e scrisă încă.”');
  await b.key(c, 'Escape'); await pauza(150);
  const v0 = await b.evaluate(c, '__masa.stare().find(x => x.id === "studiu-adaptare").verdict');
  await b.click(c, '.masa-carte[data-id="studiu-adaptare"] button[data-v="poate"]');
  ok(v0 === 'nou' && (await b.evaluate(c, '__masa.stare().find(x => x.id === "studiu-adaptare").verdict')) === 'poate' && !(await deschis(c)), 'butoanele de verdict merg ca înainte și nu deschid fișa');
  await b.trage(c, '.masa-carte[data-id="studiu-adaptare"] .mc-cap', '.masa-lista[data-bloc="2"]');
  ok((await b.evaluate(c, '__masa.stare().find(x => x.id === "studiu-adaptare").bloc')) === 2 && !(await deschis(c)), 'tragerea merge ca înainte');

  console.log('„Prezintă” din Bibliotecă, la mai multe lățimi:');
  await b.evaluate(c, 'document.querySelector(\'[data-vedere="banca"]\').click()'); await pauza(200);
  for (const w of [1440, 1024, 800, 761, 760, 600, 375, 320]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 700 }, c.sessionId); await pauza(200);
    const rau = await b.evaluate(c, `[...document.querySelectorAll("#banca .prezinta-piesa")].filter(x => x.offsetParent).map(x => {
      const r = x.getBoundingClientRect(), d = x.closest("details").getBoundingClientRect();
      return (x.scrollWidth > x.clientWidth + 1 || r.left < d.left || r.right > d.right + .5 || r.width < 40) ? x.dataset.prezinta + " " + Math.round(r.width) + "px" : null; }).filter(Boolean)`);
    const tot = await b.evaluate(c, 'document.documentElement.scrollWidth <= innerWidth');
    ok(!rau.length && tot, `${w}px: fiecare „Prezintă” își cuprinde textul și stă în card${rau.length ? ' (' + rau.join(', ') + ')' : ''}${tot ? '' : ', pagina are derulare orizontală'}`);
    if (poze && (w === 1440 || w === 375)) await b.screenshot(c, join(poze, `biblioteca-${w}.png`));
  }

  console.log('Editorul local (fișa se recitește de pe disc):');
  const e = await b.open(ed.url.replace('#ecrane', '#masa'));
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 1200, deviceScaleFactor: 1, mobile: false }, e.sessionId); await pauza(400);
  await b.click(e, '.mc-fisa[data-fisa="harta-emotiilor"]'); await pauza(300);
  ok(/Fișa nu e scrisă încă/.test(await b.evaluate(e, 'document.getElementById("fisa-corp").textContent')), 'la început nu are fișă');
  await b.key(e, 'Escape'); await pauza(150);
  puneFisa(dirEd, 'harta-emotiilor', '# Scrisă acum\n\nDe Irina, în timp ce Alex lucrează.');
  await b.click(e, '.mc-fisa[data-fisa="harta-emotiilor"]'); await pauza(400);
  ok(/Scrisă acum/.test(await b.evaluate(e, 'document.getElementById("fisa-corp").textContent')), 'fișa scrisă între timp apare fără rebuild și fără reîncărcare');
  ok(!(await b.evaluate(e, 'document.querySelector(\'.mc-fisa[data-fisa="harta-emotiilor"]\').classList.contains("fara")')), 'butonul nu mai e punctat');
  await b.key(e, 'Escape'); await pauza(150);

  console.log('Editarea fișei în editorul local (2026-11-20):');
  const tasteaza = async (p, text) => { await b.send('Input.insertText', { text }, p.sessionId); await pauza(100); };
  const fe = (expr) => b.evaluate(e, expr);
  ok(await fe('!document.getElementById("fe-noua").disabled && document.querySelector(".masa-bara-dreapta").firstChild.id === "fe-noua"'), '„Piesă nouă” e în bara Harvest');
  await b.click(e, '.mc-fisa[data-fisa="studiu-adaptare"]'); await pauza(300);
  await b.click(e, '#fe-editeaza'); await pauza(500);
  ok(await fe('document.getElementById("fisa-dialog").classList.contains("fe-activ") && !document.getElementById("fe").hidden && document.getElementById("fisa-corp").hidden'), '„Editează” deschide modul de editare');
  ok(await fe('/## Input-ul lui Alex[\\s\\S]*## Pe scurt[\\s\\S]*## Întrebare pentru Alex/.test(document.getElementById("fe-text").value)'), 'fără fișă: textarea pornește din șablonul D-078');
  ok(await fe('document.getElementById("fe-titlu").value === "Ce spun studiile despre adaptare" && document.getElementById("fe-durata").value === "10" && document.getElementById("fe-tip").value === "model"'), 'câmpurile rândului din harvest.yml sunt completate');
  ok(await fe('getComputedStyle(document.getElementById("fe-text")).fontFamily.includes("monospace") && document.getElementById("fe-text").getBoundingClientRect().height >= 280'), 'textarea e monospace și înaltă');
  ok(await fe('document.activeElement.id === "fe-text"'), 'focusul e în text');
  await tasteaza(e, 'Scris de Alex în editor. ');
  await fe('window.__intrebat = 0; window.confirm = () => { window.__intrebat++; return false; }; 1');
  await b.key(e, 'Escape'); await pauza(200);
  ok((await fe('__intrebat')) === 1 && (await fe('document.getElementById("fisa-dialog").open && __fisaEditor.stare().murdar')), 'Esc cu text nesalvat întreabă; „nu” lasă textul în câmp');
  await b.key(e, 'Escape'); await pauza(200);
  ok((await fe('__intrebat')) === 2 && (await fe('document.getElementById("fisa-dialog").open')), 'Esc de două ori la rând nu închide fișa pe nevăzute');
  await b.click(e, '#fisa-inchide'); await pauza(200);
  ok((await fe('__intrebat')) === 3 && (await fe('document.getElementById("fisa-dialog").open')), '× întreabă și el');
  await fe('document.getElementById("fe-durata").value = "12"; document.getElementById("fe-titlu").value = "Ce spun studiile"; 1');
  await b.key(e, 's', 4); await pauza(1500); // ⌘S
  ok(await fe('!document.getElementById("fisa-dialog").classList.contains("fe-activ") && /Scris de Alex în editor/.test(document.getElementById("fisa-corp").textContent)'), '⌘S salvează și arată din nou fișa randată');
  ok(readFileSync(join(dirEd, 'harvest', 'studiu-adaptare.md'), 'utf8').startsWith('Scris de Alex în editor. # Ce spun'), 'fișa e pe disc, în harvest/');
  ok(/id: studiu-adaptare\n\s+titlu: "?Ce spun studiile"?\n[\s\S]*?durata: 12/.test(readFileSync(join(dirEd, 'harvest.yml'), 'utf8')), 'titlul și durata sunt în harvest.yml');
  ok(await fe('document.getElementById("fisa-titlu").textContent === "Ce spun studiile" && /Ce spun studiile/.test(document.querySelector(\'.masa-carte[data-id="studiu-adaptare"] .mc-titlu\').textContent) && /12/.test(document.querySelector(\'.masa-carte[data-id="studiu-adaptare"] .mc-durata\').textContent)'), 'cartonașul și titlul fișei arată noile valori');
  // verdictul merge mai departe după salvarea din fișă (hash-ul harvest.yml e la zi)
  await b.key(e, 'Escape'); await pauza(200);
  await b.click(e, '.masa-carte[data-id="studiu-adaptare"] button[data-v="poate"]'); await pauza(700);
  ok(/id: studiu-adaptare[\s\S]*?verdict: poate/.test(readFileSync(join(dirEd, 'harvest.yml'), 'utf8')), 'un verdict dat după salvarea din fișă se scrie (fără conflict)');
  // conflict: un agent scrie fișa cât timp Alex o editează
  await b.click(e, '.mc-fisa[data-fisa="studiu-adaptare"]'); await pauza(300);
  await b.click(e, '#fe-editeaza'); await pauza(500);
  await tasteaza(e, 'Textul lui Alex. ');
  writeFileSync(join(dirEd, 'harvest', 'studiu-adaptare.md'), '# Scris de Daria între timp\n');
  await b.click(e, '#fe-salveaza'); await pauza(800);
  ok(await fe('!document.getElementById("fe-conflict").hidden && /Fișa s-a schimbat între timp \\(probabil un agent\\)/.test(document.getElementById("fe-conflict").textContent)'), 'conflict: „Fișa s-a schimbat între timp (probabil un agent)”');
  ok(readFileSync(join(dirEd, 'harvest', 'studiu-adaptare.md'), 'utf8') === '# Scris de Daria între timp\n', 'conflict: versiunea agentului nu e suprascrisă');
  await b.send('Browser.grantPermissions', { permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'], origin: new URL(ed.url).origin }).catch(() => {});
  await b.click(e, '#fe-pastreaza'); await pauza(500);
  ok(await fe('document.getElementById("fe-conflict").hidden && /Textul lui Alex/.test(document.getElementById("fe-text").value) && /Salvează” înlocuiește/.test(document.getElementById("fe-info").textContent)'), '„Păstrează textul meu”: textul rămâne, cu explicația');
  await b.click(e, '#fe-salveaza'); await pauza(1500);
  ok(/^Textul lui Alex/.test(readFileSync(join(dirEd, 'harvest', 'studiu-adaptare.md'), 'utf8')), 'apoi „Salvează” scrie textul lui Alex');
  ok(readdirSync(join(dirEd, '.editor-istoric')).some((f) => f.endsWith('__harvest__studiu-adaptare.md') && readFileSync(join(dirEd, '.editor-istoric', f), 'utf8') === '# Scris de Daria între timp\n'), 'versiunea agentului e în .editor-istoric/');
  // Reîncarcă
  await b.click(e, '#fe-editeaza'); await pauza(500);
  await tasteaza(e, 'Ciornă. ');
  writeFileSync(join(dirEd, 'harvest', 'studiu-adaptare.md'), '# Irina a rescris\n');
  await b.click(e, '#fe-salveaza'); await pauza(800);
  await b.click(e, '#fe-reincarca'); await pauza(600);
  ok(await fe('document.getElementById("fe-text").value === "# Irina a rescris\\n" && document.getElementById("fe-conflict").hidden'), '„Reîncarcă” aduce versiunea de pe disc');
  await fe('window.confirm = () => true; 1');
  await b.click(e, '#fe-renunta'); await pauza(200);
  await b.key(e, 'Escape'); await pauza(200);
  // Piesă nouă
  await b.click(e, '#fe-noua'); await pauza(500);
  ok(await fe('document.getElementById("fisa-dialog").open && document.getElementById("fe-text").hidden && document.activeElement.id === "fe-titlu"'), '„Piesă nouă” cere titlu, durată, tip');
  await tasteaza(e, 'Ce ține de mine');
  await fe('document.getElementById("fe-durata").value = "25"; document.getElementById("fe-tip").value = "exercitiu"; 1');
  await b.click(e, '#fe-salveaza'); await pauza(2500);
  ok(/- id: ce-tine-de-mine\n\s+titlu: Ce ține de mine\n\s+durata: 25\n\s+tip: exercitiu\n\s+sursa: Alex\n\s+verdict: nou/.test(readFileSync(join(dirEd, 'harvest.yml'), 'utf8')) && existsSync(join(dirEd, 'harvest', 'ce-tine-de-mine.md')), 'piesa nouă: rândul în harvest.yml și fișa din șablon');
  ok(await fe('!!document.querySelector(\'.masa-carte[data-id="ce-tine-de-mine"]\') && document.getElementById("fisa-dialog").open && __fisaEditor.stare() && __fisaEditor.stare().id === "ce-tine-de-mine"'), 'după reîncărcare: cartonașul e în Harvest, iar fișa e deschisă pentru editare');
  if (poze) await b.screenshot(e, join(poze, 'fisa-editare.png'));
  ok(!b.exceptii.length, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
} finally { await ed.inchide(); await b.close(); }
console.log(esecuri ? `\n${esecuri} verificări au eșuat.` : '\nToate verificările au trecut.');
process.exit(esecuri ? 1 : 0);
