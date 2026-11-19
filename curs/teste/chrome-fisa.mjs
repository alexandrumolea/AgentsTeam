// Fișa piesei din Harvest (2026-11-19), în Chrome: butonul „Fișa”, dialogul (Esc, ×, focusul înapoi), conținutul din harvest/
// sau din piesa produsă, „nu e scrisă încă”, recitirea în editorul local. Plus butonul „Prezintă” din Bibliotecă la mai multe lățimi.
//   node teste/chrome-fisa.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
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
  ok(!b.exceptii.length, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
} finally { await ed.inchide(); await b.close(); }
console.log(esecuri ? `\n${esecuri} verificări au eșuat.` : '\nToate verificările au trecut.');
process.exit(esecuri ? 1 : 0);
