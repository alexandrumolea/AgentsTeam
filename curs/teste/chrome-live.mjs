// „Prezintă” din Bibliotecă (1.12, Alex, 2026-11-17): piesa intră după ecranul de acum, sala o arată, prezentarea continuă
// după ea, se vede „adăugat live”, totalul crește, se poate scoate, rezistă la refresh, iar „Copiază pentru ediție” dă agenda.
//   node teste/chrome-live.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';
import { build } from '../build.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const dir = mkdtempSync(join(tmpdir(), 'curs-live-'));
cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), dir, { recursive: true, filter: (f) => !f.includes('/dist') });
const r = build(dir, { out: join(dir, 'iesire'), log: () => {} });
if (!r.ok) { console.error('build-ul a eșuat', r.erori); process.exit(1); }
const url = pathToFileURL(r.fisiere[1]).href;

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const b = await launch();
try {
  const c = await b.open(url + '#prezinta');
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1400, deviceScaleFactor: 1, mobile: false }, c.sessionId); await pauza(200);
  const stare = () => b.evaluate(c, '__curs.stare()');
  await b.click(c, '#deschide-sala'); await pauza(700);
  const sala = b.pages.find((p) => p.popup);
  const inSala = () => b.evaluate(sala, 'document.getElementById("sala-cadru")._id');
  // Mergem la curba#1 (în prezentare)
  await b.evaluate(c, `document.querySelectorAll('#schita-mica li[data-modul]')[1].click()`); await pauza(150);
  await b.key(c, 'ArrowRight'); await pauza(100);
  const pornire = (await stare()).id;
  ok(pornire === 'curba#1', `pornim de la ${pornire}`);
  const totalInainte = await b.evaluate(c, 'document.querySelector("#ziua .total-zi").textContent');

  // Prezintă „Curba de pe podea” (alternativă, nu e în agendă) din Bibliotecă
  await b.click(c, '[data-vedere="banca"]');
  ok(await b.evaluate(c, 'document.querySelectorAll("details.ex .prezinta-piesa").length === document.querySelectorAll("details.ex").length'), 'fiecare piesă din Bibliotecă are „Prezintă”');
  await b.click(c, '#ex-plimbare-curba .prezinta-piesa'); await pauza(300);
  let s = await stare();
  ok(s.vedere === 'prezinta' && s.id === 'plimbare-curba~live#1', `„Prezintă” sare la primul ecran al piesei (${s.id})`);
  ok(!(await b.evaluate(c, 'document.getElementById("ex-plimbare-curba").open')), 'și nu deschide rândul din Bibliotecă');
  ok(s.ordine[s.ordine.indexOf('curba#1') + 1] === 'plimbare-curba~live#1', 'ecranele piesei stau imediat după ecranul de acum');
  ok((await inSala()) === 'plimbare-curba~live#1' && /Toată lumea, în picioare/.test(await b.evaluate(sala, 'document.getElementById("sala-cadru").innerText')), 'fereastra sălii arată piesa pe loc');
  ok(!(await b.evaluate(c, 'document.getElementById("live-acum").hidden')), 'ecranul de comandă o marchează „adăugat live”');
  ok(await b.evaluate(c, '!!document.querySelector(\'#banda [data-live]\')'), 'banda zilei o arată, marcată');
  await b.key(sala, 'PageDown'); await pauza(150);
  ok((await stare()).id === 'model-curba#1' && (await inSala()) === 'model-curba#1', 'după ultimul ecran al piesei, prezentarea continuă de unde a rămas');
  const totalDupa = await b.evaluate(c, 'document.querySelector("#ziua .total-zi").textContent');
  ok(/Total: 2 h 55 min/.test(totalDupa) && /rămân 35 min/.test(totalDupa) && /20 min adăugate live: Curba de pe podea/.test(totalDupa), `totalul zilei crește cu durata piesei și spune că e adăugată live (${totalInainte.match(/Total: [^d]+/)[0].trim()} → ${totalDupa.match(/Total: [^d]+/)[0].trim()})`);

  // O piesă deja în agendă: fără duplicat, doar salt
  const n = (await stare()).ordine.length;
  await b.click(c, '[data-vedere="banca"]');
  await b.click(c, '#ex-perechi-curba .prezinta-piesa'); await pauza(200);
  s = await stare();
  ok(s.id === 'perechi-curba#1' && s.ordine.length === n, 'o piesă deja în agendă: „Prezintă” sare la ea, fără duplicat');
  // O piesă deja adăugată live: tot salt
  await b.click(c, '[data-vedere="banca"]');
  await b.click(c, '#ex-plimbare-curba .prezinta-piesa'); await pauza(200);
  ok((await stare()).id === 'plimbare-curba~live#1' && (await stare()).ordine.length === n, 'o piesă adăugată deja live: tot salt, fără duplicat');

  // Refresh
  await b.send('Page.reload', {}, c.sessionId); await pauza(1000);
  s = await stare();
  ok(s.ordine.includes('plimbare-curba~live#1') && /adăugate live/.test(await b.evaluate(c, 'document.querySelector("#ziua .total-zi").textContent')), 'inserarea și totalul rezistă la refresh');
  await b.click(c, '[data-vedere="prezinta"]'); await b.click(c, '#deschide-sala'); await pauza(500);
  ok((await inSala()) === s.id, 'după refresh, sala e din nou sincronizată');

  // Vederea Ecrane: marcată, cu „Scoate”; „Copiază pentru ediție” dă agenda cu piesa
  await b.click(c, '[data-vedere="ecrane"]');
  ok(await b.evaluate(c, '!!document.querySelector(\'.ec-carte.live[data-id="plimbare-curba~live#1"] [data-ec="scoate"]\') && /adăugat live/.test(document.querySelector(\'.ec-carte[data-id="plimbare-curba~live#1"]\').textContent)'), 'în vederea Ecrane, ecranul e marcat „adăugat live” și are „Scoate”');
  if (poze) await b.screenshot(c, join(poze, 'ecrane-live.png'));
  await b.click(c, '#ec-copiaza'); await pauza(300);
  const yaml = await b.evaluate(c, 'document.getElementById("ec-yaml").value');
  ok(/agenda:\n  - deschidere\n  - curba\n  - plimbare-curba   # adăugată live \(în sală: după curba#1\)\n  - pauza-cafea/.test(yaml), '„Copiază pentru ediție” dă agenda, cu piesa ca rând nou după curba');
  // Dus-întors: blocul pus în ediție → build → piesa e în agendă
  const f = join(dir, 'editii', '2026-11-23.yml');
  let ed = readFileSync(f, 'utf8').replace(/agenda:[\s\S]*?\n(?=ecrane:|nume_interzise)/, '').replace(/ecrane:\n(  .*\n|    .*\n)*/, '');
  writeFileSync(f, ed + '\n' + yaml.split('\n').filter((l) => !l.startsWith('#')).join('\n'));
  const r2 = build(dir, { out: join(dir, 'iesire2'), log: () => {} });
  ok(r2.ok && JSON.parse(readFileSync(r2.fisiere[1], 'utf8').match(/id="date-curs">([\s\S]*?)<\/script>/)[1]).module.map((x) => x.id).slice(1, 3).join(',') === 'curba,plimbare-curba', `blocul copiat, pus în ediție, dă la build piesa în agendă după curba${r2.ok ? '' : ': ' + r2.erori.join('; ')}`);

  // Scoaterea, din ecranul de comandă
  await b.click(c, '[data-vedere="prezinta"]');
  await b.click(c, '[data-vedere="banca"]'); await b.click(c, '#ex-plimbare-curba .prezinta-piesa'); await pauza(200);
  await b.click(c, '#btn-scoate-live'); await pauza(200);
  s = await stare();
  ok(!s.ordine.some((x) => /~live/.test(x)) && s.id === 'curba#1' && (await inSala()) === 'curba#1', '„Scoate piesa” o scoate și te întoarce la ecranul după care fusese pusă (și în sală)');
  ok(!/adăugate live/.test(await b.evaluate(c, 'document.querySelector("#ziua .total-zi").textContent')), 'totalul revine');
  // Resetarea le scoate și pe ele
  await b.click(c, '[data-vedere="banca"]'); await b.click(c, '#ex-poveste-fuziune .prezinta-piesa'); await pauza(200);
  await b.click(c, '[data-vedere="ecrane"]'); await b.click(c, '#ec-reset'); await pauza(200);
  ok(!(await stare()).ordine.some((x) => /~live/.test(x)), '„Resetează la ordinea din curs” scoate și piesele adăugate live');
  // Fără fereastra sălii deschisă: piesa e pregătită, iar ecranul de comandă propune sala sau „Prezintă aici”
  const c2 = await b.open(url + '#banca'); await pauza(300);
  await b.evaluate(c2, 'localStorage.clear()');
  await b.click(c2, '#ex-poveste-fuziune .prezinta-piesa'); await pauza(300);
  ok(/Deschide ecranul din sală sau alege „Prezintă aici”/.test(await b.evaluate(c2, 'document.getElementById("mesaj-start").textContent')) && (await b.evaluate(c2, '__curs.stare().id')) === 'poveste-fuziune~live#1', 'fără sală deschisă: piesa e pregătită și pagina propune „Deschide ecranul din sală” sau „Prezintă aici”');
  ok(b.exceptii.length === 0, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
  console.log(`\n${esecuri ? esecuri + ' verificări au picat.' : 'Toate verificările au trecut.'}`);
} finally { b.close(); }
process.exit(esecuri ? 1 : 0);
