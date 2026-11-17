// Verificarea tehnică din 4.2, automată, în Google Chrome (fără server, din file://).
//   node teste/chrome-prezinta.mjs [--vizibil] [--poze <folder>]
// Construiește cursul-exemplu, deschide materialul trainerului, deschide fereastra sălii și o comandă cu tastele
// pe care le trimit telecomenzile, din ambele ferestre. Verifică și că pagina nu cere nimic de pe internet.
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';
import { build } from '../build.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const out = mkdtempSync(join(tmpdir(), 'curs-test-'));
const r = build(join(AICI, '..', 'exemple', 'change-agility-exemplu'), { out, log: () => {} });
if (!r.ok) { console.error('build-ul exemplului a eșuat', r.erori); process.exit(1); }
const url = pathToFileURL(r.fisiere[1]).href;

const b = await launch({ headless: !args.includes('--vizibil') });
let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
try {
  const ctrl = await b.open(url);
  const stare = () => b.evaluate(ctrl, '__curs.stare()');
  const ecrane = await b.evaluate(ctrl, 'JSON.parse(document.getElementById("date-curs").textContent).ecrane.map(e=>({c:e.cronometru,t:!!e.titlu}))');
  ok(ecrane.length === 15, `materialul are ${ecrane.length} ecrane în sală (aștept 15)`);
  ok(/Total: 2 h 35 min/.test(await b.evaluate(ctrl, 'document.querySelector("#ziua .total-zi").textContent')) && /rămân 55 min/.test(await b.evaluate(ctrl, 'document.querySelector("#schita .total-zi").textContent')), 'Ziua și Schița arată totalul zilei și cât rămâne');
  if (poze) for (const v of ['ziua', 'schita', 'modul', 'banca']) { await b.click(ctrl, `[data-vedere="${v}"]`); await b.screenshot(ctrl, join(poze, `vedere-${v}.png`)); }

  // Biblioteca de piese (Banca v2 a Ioanei + familie și tip, v1.2): listă compactă, căutare, filtre-chip.
  await b.click(ctrl, '[data-vedere="banca"]');
  const vizibile = () => b.evaluate(ctrl, '[...document.querySelectorAll("details.ex")].filter(a => !a.hidden).length');
  const chip = (f, v) => b.click(ctrl, `.chip[data-filtru="${f}"][data-valoare="${v}"]`);
  ok((await vizibile()) === 6, 'Biblioteca arată toate cele 6 piese');
  await chip('familie', 'continut');
  ok((await vizibile()) === 2, 'chipul „conținut” lasă modelul și povestea');
  await chip('tip', 'energizant');
  ok((await vizibile()) === 3, '+ tipul „energizant” (același rând de chip-uri se adună)');
  await b.click(ctrl, '#banca-sterge');
  ok(await b.evaluate(ctrl, '[...document.querySelectorAll("details.ex")].every(d => !d.open)'), 'exercițiile pornesc închise (lista se scanează dintr-o privire)');
  ok(await b.evaluate(ctrl, 'document.querySelector(".banca-grup details.ex").id === "ex-model-curba" && /din zi/.test(document.querySelector("#ex-model-curba .azi").textContent)'), 'piesa din agenda de azi e prima, cu eticheta „Azi” și cât din zi ocupă');
  await chip('energie', 'activ');
  ok((await vizibile()) === 2, 'chipul „activ” lasă 2 activități (piesele fără energie ies)');
  ok(!(await b.evaluate(ctrl, 'document.getElementById("banca-sterge").hidden')), 'apare „Șterge filtrele”');
  await chip('durata', '10');
  ok((await vizibile()) === 1, '+ „≤ 10 min” lasă 1');
  await chip('durata', '20');
  ok((await vizibile()) === 2 && (await b.evaluate(ctrl, 'document.querySelectorAll(".chip[data-filtru=durata][aria-pressed=true]").length')) === 1, 'durata e un singur prag: „≤ 20 min” îl înlocuiește pe „≤ 10 min”');
  await b.click(ctrl, '#banca-sterge');
  ok((await vizibile()) === 6, '„Șterge filtrele” le arată din nou pe toate');
  await chip('format', 'perechi'); await chip('format', 'grup');
  ok((await vizibile()) === 2, 'două chipuri din același grup se adună (perechi sau grup)');
  await b.click(ctrl, '#banca-sterge');
  await chip('modul', 'curba');
  ok((await vizibile()) === 6, 'filtrul pe modul: cele 4 potrivite la „curba” + cele 2 bune oriunde');
  await b.click(ctrl, '#banca-sterge');
  await b.evaluate(ctrl, 'document.activeElement.blur()');
  await b.key(ctrl, '/');
  ok(await b.evaluate(ctrl, 'document.activeElement.id === "banca-cauta"'), 'tasta „/” duce în căutare');
  await b.evaluate(ctrl, '{ const c=document.getElementById("banca-cauta"); c.value="banda adeziva"; c.dispatchEvent(new Event("input")); }');
  ok((await vizibile()) === 1 && !(await b.evaluate(ctrl, 'document.getElementById("ex-plimbare-curba").hidden')), 'căutarea găsește după materiale, fără diacritice („banda adeziva”)');
  await b.evaluate(ctrl, '{ const c=document.getElementById("banca-cauta"); c.value="nu exista nicaieri"; c.dispatchEvent(new Event("input")); }');
  ok((await vizibile()) === 0 && !(await b.evaluate(ctrl, 'document.getElementById("banca-gol").hidden')), 'fără rezultate: mesaj și buton de ștergere');
  await b.key(ctrl, 'Escape');
  ok((await vizibile()) === 6, 'Esc golește căutarea');
  await b.key(ctrl, 'ArrowDown');
  ok(await b.evaluate(ctrl, 'document.activeElement === document.querySelector("#ex-model-curba > summary")'), 'săgeata jos din căutare duce la prima piesă (Enter o deschide, nativ)');
  await b.key(ctrl, 'ArrowDown');
  ok(await b.evaluate(ctrl, 'document.activeElement === document.querySelectorAll("details.ex > summary")[1]'), 'săgeata jos trece la exercițiul următor');
  await b.click(ctrl, '#ex-perechi-curba > summary');
  ok(await b.evaluate(ctrl, 'document.getElementById("ex-perechi-curba").open'), 'un click pe rând deschide exercițiul');
  await b.evaluate(ctrl, 'document.getElementById("ex-perechi-curba").open = false');
  await chip('format', 'individual');
  await b.click(ctrl, '[data-vedere="modul"]');
  await b.evaluate(ctrl, 'document.querySelector("#modul a[data-banca]").click()');
  ok(await b.evaluate(ctrl, '!document.getElementById("banca").hidden && !document.getElementById("ex-plimbare-curba").hidden && document.getElementById("ex-plimbare-curba").open'), 'linkul spre alternativă din Modul deschide Banca la exercițiu, deschis, chiar dacă un filtru îl ascundea');
  await b.click(ctrl, '#banca-sterge');

  // Obiectivele zilei (Alex, 2026-11-17): bife în Schiță, salvate local, sincronizate cu schița din ecranul de comandă.
  await b.click(ctrl, '[data-vedere="schita"]');
  const bife = () => b.evaluate(ctrl, '[...document.querySelectorAll("input[data-obiectiv]")].map(i => i.checked ? 1 : 0).join("")');
  const contor = () => b.evaluate(ctrl, 'document.querySelector("#schita [data-obiective-nr]").textContent');
  ok((await contor()) === '0 din 4', 'Schița arată 4 obiective, „0 din 4”');
  await b.click(ctrl, '#schita input[data-obiectiv="0"] + .ob-cutie');
  await b.click(ctrl, '#schita input[data-obiectiv="2"] + .ob-cutie');
  ok((await bife()) === '10101010' && (await contor()) === '2 din 4', 'bifa (click pe căsuță) apare și în schița din ecranul de comandă; contorul: „2 din 4”');
  await b.send('Page.reload', {}, ctrl.sessionId); await pauza(1000);
  ok((await bife()) === '10101010', 'bifele rezistă la refresh');
  await b.click(ctrl, '[data-vedere="schita"]');
  await b.click(ctrl, '#schita [data-obiective-reset]');
  ok((await bife()) === '00000000' && (await contor()) === '0 din 4', '„Debifează tot” le golește');
  await b.click(ctrl, '#schita input[data-obiectiv="3"] + .ob-cutie');

  // Tastele nu schimbă ecranul în afara modului Prezintă.
  await b.click(ctrl, '[data-vedere="ziua"]');
  await b.key(ctrl, 'ArrowRight');
  ok((await stare()).i === 0, 'în vederea Ziua, săgeata nu schimbă ecranul');

  await b.click(ctrl, '[data-vedere="prezinta"]');
  await b.click(ctrl, '#deschide-sala');
  await pauza(400);
  const sala = b.pages.find((p) => p.popup);
  ok(!!sala, 'butonul deschide o a doua fereastră (ecranul din sală)');
  ok((await stare()).salaDeschisa, 'fereastra sălii (același fișier, #sala) răspunde ecranului de comandă prin postMessage, din file://');

  const textSala = () => b.evaluate(sala, 'document.getElementById("sala-cadru").innerText.trim()');
  ok(await b.evaluate(sala, '!document.querySelector("[data-obiectiv], .obiective") && !/Obiectivele zilei|EXEMPLU\\] Un cuvânt/.test(document.body.innerText)'), 'obiectivele și bifele nu ajung în fereastra sălii');
  await b.click(ctrl, '#schita-mica input[data-obiectiv="1"] + .ob-cutie');
  ok((await b.evaluate(ctrl, 'document.querySelector("#schita-mica [data-obiective-nr]").textContent')) === '2 din 4', 'bifa din schița ecranului de comandă: „2 din 4”');
  const iBifa = (await stare()).i;
  await b.key(ctrl, 'PageDown');
  ok((await stare()).i === iBifa + 1, 'după o bifă în schița de comandă, telecomanda (PageDown) merge mai departe');
  await b.key(ctrl, 'PageUp');
  ok(await b.evaluate(sala, '!document.querySelector("[data-obiectiv], .obiective")'), 'nici după o bifă din ecranul de comandă');
  for (const k of ['ArrowRight', 'PageDown']) await b.key(sala, k);
  ok((await stare()).i === 2, 'săgeată + PageDown trimise ÎN fereastra sălii avansează (telecomanda, când sala are focus)');
  for (const k of ['PageUp']) await b.key(sala, k);
  ok((await stare()).i === 1, 'PageUp în fereastra sălii dă înapoi');
  for (const k of [' ', 'ArrowDown']) await b.key(ctrl, k);
  ok((await stare()).i === 3, 'Spațiu + săgeată jos în ecranul de comandă avansează');
  await b.key(ctrl, 'ArrowLeft'); await b.key(ctrl, 'ArrowUp');
  ok((await stare()).i === 1, 'săgeată stânga / sus în ecranul de comandă dă înapoi');
  ok((await textSala()).includes('Schimbarea nu e o problemă'), 'fereastra sălii arată ecranul corect');
  const acum = await b.evaluate(ctrl, 'document.getElementById("cadru-acum").innerText.trim()');
  ok(acum === (await textSala()), 'previzualizarea „Acum” e identică cu ecranul din sală');

  // Cronometrul: primul ecran cu cronometru.
  const iCron = ecrane.findIndex((e) => e.c && !e.t);
  await b.evaluate(ctrl, `document.querySelectorAll('#schita-mica li[data-modul]')[1].click()`);
  ok(/Curba de pe podea/.test(await b.evaluate(ctrl, 'document.getElementById("alternative").textContent')), 'la modulul „curba”, ecranul de comandă arată alternativa');
  await b.evaluate(ctrl, `document.querySelectorAll('#schita-mica li[data-modul]')[0].click()`);
  for (let i = 0; i < iCron; i++) await b.key(sala, 'ArrowRight');
  ok((await stare()).i === iCron, `am ajuns la ecranul cu cronometru (${iCron})`);
  await b.key(sala, 'c'); await pauza(1300);
  let s = await stare();
  ok(s.cron.pornit && s.cron.ramas < s.cron.total - 900, `C pornește cronometrul (rămas ${Math.round(s.cron.ramas / 1000)} s din ${s.cron.total / 1000})`);
  const cronSala = await b.evaluate(sala, 'document.querySelector("[data-cron]").textContent');
  ok(/^\d+:\d\d$/.test(cronSala), `cronometrul apare pe ecranul din sală (${cronSala})`);
  await b.key(ctrl, 'c'); s = await stare();
  ok(!s.cron.pornit, 'C din ecranul de comandă îl oprește');

  await b.key(sala, 'n');
  ok((await stare()).negru && await b.evaluate(sala, 'document.getElementById("sala-cadru").classList.contains("negru")'), 'N înnegrește ecranul din sală');
  await b.key(sala, '.');
  ok(!(await stare()).negru, '„.” (butonul de ecran negru al telecomenzilor) îl aprinde la loc');
  await b.key(sala, 'b'); await b.key(sala, 'b');
  ok(!(await stare()).negru, '„B” comută și el ecranul negru');

  await b.key(ctrl, 's');
  ok(await b.evaluate(ctrl, 'document.getElementById("comanda").classList.contains("schita-mare")'), 'S deschide schița mare în ecranul de comandă');
  await b.key(ctrl, 's');

  const iInainteF5 = (await stare()).i;
  await b.key(sala, 'F5'); await pauza(500);
  ok((await stare()).salaDeschisa && (await stare()).i === iInainteF5, 'F5 (butonul „start” al telecomenzii) nu reîncarcă și nu strică nimic');

  if (poze) { await b.screenshot(ctrl, join(poze, 'comanda.png')); await b.screenshot(sala, join(poze, 'sala.png')); }

  // Refresh al ecranului de comandă: fereastra sălii rămâne; „Deschide” o refolosește, iar poziția se păstrează.
  const iInainte = (await stare()).i;
  await b.evaluate(sala, 'window.__marca = 1');
  await b.send('Page.reload', {}, ctrl.sessionId); await pauza(1000);
  ok((await stare()).i === iInainte, `după refresh, ecranul de comandă își amintește poziția (${iInainte})`);
  const ferestre = b.pages.filter((p) => p.popup).length;
  await b.click(ctrl, '[data-vedere="prezinta"]');
  await b.click(ctrl, '#deschide-sala'); await pauza(400);
  ok(b.pages.filter((p) => p.popup).length === ferestre, 'după refresh, „Deschide ecranul din sală” refolosește aceeași fereastră, nu deschide alta');
  ok((await stare()).salaDeschisa, 'și o comandă din nou');
  ok(await b.evaluate(sala, 'window.__marca === 1'), 'fereastra sălii nu s-a reîncărcat (deci rămâne pe tot ecranul pe proiector)');
  await b.key(sala, 'ArrowRight');
  ok((await stare()).i === iInainte + 1, 'tastele din fereastra sălii merg și după refresh');

  // Fereastra sălii închisă din greșeală
  await b.send('Target.closeTarget', { targetId: sala.targetId }); await pauza(1200);
  const mesaj = await b.evaluate(ctrl, 'document.getElementById("mesaj-start").textContent');
  ok(!(await stare()).salaDeschisa && /s-a închis/.test(mesaj), 'dacă fereastra sălii se închide, ecranul de comandă o spune');

  // Un singur ecran
  await b.click(ctrl, '#prezinta-aici'); await pauza(300);
  await b.key(ctrl, 'ArrowRight');
  s = await stare();
  ok(s.aici && await b.evaluate(ctrl, '!document.getElementById("aici").hidden && !!document.querySelector("#aici-cadru .ecran")'), '„Prezintă aici” arată ecranul sălii în aceeași fereastră, cu taste');

  const externe = b.cereri.filter((u) => !/^(file|data|about|blob):/.test(u));
  ok(externe.length === 0, `nicio cerere spre internet (${externe.length}${externe.length ? ': ' + externe.slice(0, 3).join(', ') : ''})`);
  ok(b.exceptii.length === 0, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
  const versiune = await b.send('Browser.getVersion');
  console.log(`\n${versiune.product}, ${args.includes('--vizibil') ? 'cu fereastră' : 'headless'}. ${esecuri ? esecuri + ' verificări au picat.' : 'Toate verificările au trecut.'}`);
} finally { b.close(); }
process.exit(esecuri ? 1 : 0);
