// Vederea Ecrane (1.10, Alex, 2026-11-17): mutare (tragere, ↑ ↓, tastatură), ascundere, sărirea la prezentare,
// persistența după refresh, sincronizarea cu fereastra sălii, „Copiază pentru ediție” (dus-întors prin build) și resetarea.
//   node teste/chrome-ecrane.mjs [--poze <folder>]
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
const dir = mkdtempSync(join(tmpdir(), 'curs-ecrane-'));
cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), dir, { recursive: true, filter: (f) => !f.includes('/dist') });
const r = build(dir, { out: join(dir, 'iesire'), log: () => {} });
if (!r.ok) { console.error('build-ul a eșuat', r.erori); process.exit(1); }
const url = pathToFileURL(r.fisiere[1]).href;

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const b = await launch();
try {
  const c = await b.open(url + '#ecrane');
  // Fereastră înaltă: toată grila încape, ca tragerea să nu depindă de derulare.
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 1500, deviceScaleFactor: 1, mobile: false }, c.sessionId); await pauza(200);
  const carti = () => b.evaluate(c, '[...document.querySelectorAll("#grila-ecrane .ec-carte")].map(l => l.dataset.id + (l.classList.contains("ascuns") ? "!" : ""))');
  const prez = () => b.evaluate(c, '__curs.stare().ordine');
  const editie = await carti();
  ok(editie.length === 15, `grila are ${editie.length} cărți (toate ecranele, și cel ascuns)`);
  ok(editie[3] === 'ridica-te-daca#1' && editie.includes('pasul-de-luni#1!'), 'grila pornește din ordinea ediției: mutarea și ascunderea din exemplu');
  ok(!(await prez()).includes('pasul-de-luni#1') && (await prez()).length === 14, 'ecranul ascuns în ediție nu e în prezentare');
  ok(await b.evaluate(c, 'getComputedStyle(document.querySelector(\'[data-id="pasul-de-luni#1"]\')).opacity') < 1, 'ecranul ascuns rămâne în grilă, estompat');
  if (poze) await b.screenshot(c, join(poze, 'ecrane.png'));

  // ↑ ↓
  await b.click(c, '[data-id="curba#1"] button[data-ec="sus"]');
  let o = await carti();
  ok(o.indexOf('curba#1') === o.indexOf('curba#titlu') - 1, '↑ mută ecranul cu un loc mai devreme');
  await b.click(c, '[data-id="curba#1"] button[data-ec="jos"]');
  o = await carti();
  ok(o.indexOf('curba#1') === o.indexOf('curba#titlu') + 1, '↓ îl duce înapoi');
  // Tastatura: Alt + săgeată pe cartea selectată, H ascunde
  await b.evaluate(c, 'document.querySelector(\'[data-id="model-curba#1"]\').focus()');
  await b.key(c, 'ArrowLeft', 1);
  o = await carti();
  ok(o.indexOf('model-curba#1') === o.indexOf('curba#1') - 1 && await b.evaluate(c, 'document.activeElement.dataset.id') === 'model-curba#1', 'Alt+← mută cartea selectată, focusul rămâne pe ea');
  await b.key(c, 'ArrowRight', 1);
  // Tragerea cu mouse-ul: ultimul ecran ajunge primul
  await b.trage(c, '[data-id="inchidere#1"] .ec-mini', '[data-id="deschidere#titlu"] .ec-mini', -60);
  o = await carti();
  ok(o[0] === 'inchidere#1', `tragerea cu mouse-ul mută ecranul (primul e acum ${o[0]})`);
  ok((await prez())[0] === 'inchidere#1', 'și prezentarea îl are primul');
  // Ascunde / arată
  await b.click(c, '[data-id="curba#titlu"] button[data-ec="ascunde"]');
  ok((await carti()).includes('curba#titlu!') && !(await prez()).includes('curba#titlu'), '„Ascunde” scoate ecranul din prezentare, nu din grilă');
  await b.evaluate(c, 'document.querySelector(\'[data-id="deschidere#1"]\').focus()');
  await b.key(c, 'h');
  ok((await carti()).includes('deschidere#1!'), 'H ascunde cartea selectată');
  await b.key(c, 'h');
  ok((await carti()).includes('deschidere#1'), 'H o arată la loc');
  const local = await carti();

  // Persistența după refresh
  await b.send('Page.reload', {}, c.sessionId); await pauza(900);
  await b.click(c, '[data-vedere="ecrane"]');
  ok(JSON.stringify(await carti()) === JSON.stringify(local), 'ordinea și ascunderea rezistă la refresh');

  // Prezentarea: sare ecranele ascunse; sala arată exact ce decide ecranul de comandă; banda are doar ecranele vizibile
  const vizibile = local.filter((x) => !x.endsWith('!'));
  await b.click(c, '[data-vedere="prezinta"]');
  await b.click(c, '#deschide-sala'); await pauza(700);
  const sala = b.pages.find((p) => p.popup);
  ok(!!sala, 'fereastra sălii s-a deschis');
  ok((await b.evaluate(c, 'document.querySelectorAll("#banda [data-i]").length')) === vizibile.length, `banda zilei are ${vizibile.length} semne (fără cele ascunse)`);
  await b.key(c, 'Home'); await pauza(200);
  const vazut = [], inSala = [];
  for (let i = 0; i < vizibile.length; i++) {
    vazut.push(await b.evaluate(c, '__curs.stare().id'));
    inSala.push(await b.evaluate(sala, 'document.getElementById("sala-cadru")._id'));
    await b.key(sala, 'PageDown'); await pauza(60);
  }
  ok(JSON.stringify(vazut) === JSON.stringify(vizibile), 'PageDown trece prin ecrane în ordinea nouă și sare peste cele ascunse');
  ok(JSON.stringify(inSala) === JSON.stringify(vizibile), 'fereastra sălii arată la fiecare pas același ecran ca ecranul de comandă');
  // În sală: ascunde ecranul următor, apoi arată-l din nou
  await b.key(c, 'Home'); await pauza(150);
  const urm = (await prez())[1];
  await b.click(c, '#btn-ascunde-urm');
  ok(!(await prez()).includes(urm) && /ascuns urmează aici/.test(await b.evaluate(c, 'document.getElementById("ascunse-aici").textContent')), `„Ascunde-l” scoate ecranul următor (${urm}) și apare „1 ecran ascuns urmează aici”`);
  await b.click(c, '#ascunse-aici [data-arata]');
  ok((await prez())[1] === urm, '„Arată” îl pune la loc');
  await b.click(c, '#btn-ascunde-acum');
  ok((await b.evaluate(c, '__curs.stare().id')) === urm && (await b.evaluate(sala, 'document.getElementById("sala-cadru")._id')) === urm, '„Ascunde ecranul” (cel de acum) trece la următorul, și în sală');
  if (poze) await b.screenshot(c, join(poze, 'comanda.png'));

  // „Copiază pentru ediție” → build → aceeași ordine (dus-întors)
  await b.click(c, '[data-vedere="ecrane"]');
  await b.click(c, '#ec-copiaza'); await pauza(300);
  const yaml = await b.evaluate(c, 'document.getElementById("ec-yaml").value');
  ok(/^ecrane:\n  muta:\n    - "/.test(yaml) && /ascunse:/.test(yaml), 'blocul YAML apare (și în textarea, ca rezervă)');
  const stare = await carti();
  const f = join(dir, 'editii', '2026-11-23.yml');
  writeFileSync(f, readFileSync(f, 'utf8').replace(/ecrane:\n(  .*\n|    .*\n)*/, yaml.replace(/^#.*\n/, '')));
  const r2 = build(dir, { out: join(dir, 'iesire2'), log: () => {} });
  const d2 = r2.ok && JSON.parse(readFileSync(r2.fisiere[1], 'utf8').match(/id="date-curs">([\s\S]*?)<\/script>/)[1]);
  ok(r2.ok && JSON.stringify(d2.ecrane.map((x) => x.id + (x.ascuns ? '!' : ''))) === JSON.stringify(stare), `blocul copiat, pus în ediție, dă la build exact ordinea din grilă${r2.ok ? '' : ': ' + r2.erori.join('; ')}`);

  // Resetarea
  await b.click(c, '#ec-reset');
  ok(JSON.stringify(await carti()) === JSON.stringify(editie), '„Resetează la ordinea din curs” revine la ordinea ediției');
  ok((await b.evaluate(c, 'Object.keys(localStorage).filter(k => k.endsWith(":ecrane")).length')) === 0, 'și șterge ordinea salvată în browser');
  // Tiparul ecranelor sare peste cele ascunse
  const t = await b.open(url + '#tipar-ecrane'); await pauza(400);
  ok((await b.evaluate(t, 'document.querySelectorAll("#tipar-ecrane-lista .ecran").length')) === 14, 'PDF-ul ecranelor (#tipar-ecrane) nu include ecranul ascuns');
  ok(b.exceptii.length === 0, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
  console.log(`\n${esecuri ? esecuri + ' verificări au picat.' : 'Toate verificările au trecut.'}`);
} finally { b.close(); }
process.exit(esecuri ? 1 : 0);
