// Vederea „Masa” (etapa A, Alex, 2026-11-18), în Chrome: verdictul, tragerea într-un bloc, totalul pe loc, tastatura,
// refresh-ul; offline (salvare în browser, „Copiază masa.yml”, „Trimite în agendă” ca text) și prin editorul local (scrie în masa.yml).
//   node teste/chrome-masa.mjs [--poze <folder>]
import { cpSync, mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { launch } from './cdp.mjs';
import { build } from '../build.mjs';
import { pornesteEditor } from '../editor.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });
const copie = (p) => { const d = mkdtempSync(join(tmpdir(), p)); cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), d, { recursive: true, filter: (f) => !f.includes('/dist') }); return d; };
const dir = copie('curs-masa-');
// Un obiectiv pe care nu-l servește nicio piesă, ca rezumatul să aibă ce marca
writeFileSync(join(dir, 'curs.yml'), readFileSync(join(dir, 'curs.yml'), 'utf8').replace(/(obiective:\n(  - .*\n)+)/, '$1  - "[EXEMPLU] Un obiectiv fără piesă încă"\n'));
const r = build(dir, { out: join(dir, 'iesire'), log: () => {} });
if (!r.ok) { console.error('build-ul a eșuat', r.erori); process.exit(1); }
const url = pathToFileURL(r.fisiere[1]).href;

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
const b = await launch();
const dirEd = copie('curs-masa-ed-');
const ed = await pornesteEditor({ folder: dirEd, port: 0, log: () => {} });
try {
  // ---------- offline ----------
  console.log('Offline (fișierul din dist/):');
  const c = await b.open(url);
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 1700, deviceScaleFactor: 1, mobile: false }, c.sessionId); await pauza(300);
  const st = async () => Object.fromEntries((await b.evaluate(c, '__masa.stare()')).map((x) => [x.id, x]));
  const col = (id) => b.evaluate(c, `(() => { const li = document.querySelector('.masa-carte[data-id="${id}"]'); if (!li) return null; const s = li.closest('.masa-col'); const ol = li.closest('.masa-lista'); return s.dataset.col + (ol.dataset.bloc ? ':' + ol.dataset.bloc : ol.dataset.lista !== s.dataset.col && ol.dataset.lista !== 'biblioteca' ? '/' + ol.dataset.lista : ''); })()`);
  const rz = () => b.evaluate(c, 'document.getElementById("masa-rezumat").innerText.replace(/\\s+/g, " ")');
  const total = (k) => b.evaluate(c, `document.querySelector('.masa-bloc[data-bloc="${k}"] .masa-bloc-total').textContent`);
  ok(!(await b.evaluate(c, 'document.getElementById("masa").hidden')) && (await b.evaluate(c, '__curs.stare().vedere')) === 'masa', 'Harvest (#masa) e vederea de la deschidere (fără #)');
  ok(await b.evaluate(c, '[...document.querySelectorAll(".masa-col > h3")].map(h => h.firstChild.textContent.trim()).join("|")') === '1 · Harvest|2 · Curate|3 · Flow', 'coloanele sunt cele trei etape: Harvest, Curate, Flow');
  ok((await col('studiu-adaptare')) === 'brainstorming/nou' && (await col('plimbare-curba')) === 'brainstorming/poate' && (await col('model-curba')) === 'biblioteca' && (await col('curba')) === 'agenda:1', '„nou” și „poate” stau pe masă, „da” în Bibliotecă (și piesele vechi, cu fișier), blocurile în Agendă');
  // Rezumatul: panoul de control
  let z = await rz();
  ok(/Harvest 2 noi 2 poate 1 nu/i.test(z) && /Bibliotecă 8 piese 7 produse 1 de produs/i.test(z) && /Agendă 7 piese · 155 din 195 min B1 85\/90 B2 70\/105/i.test(z), `rezumatul: masa, Biblioteca, agenda pe blocuri (${z})`);
  ok(/Obiective 1 neacoperit 1: 1 2: 1 3: 1 4: 1 5: 0/i.test(z) && await b.evaluate(c, 'document.querySelectorAll(".rz.lipsa").length === 1 && /neacoperit/.test(document.querySelector(".rz.lipsa").title)'), 'obiectivele: câte piese din agendă servesc fiecare; cel neacoperit e marcat');
  ok(/agenda e la zi cu firul roșu/.test(z) && !(await b.evaluate(c, '!!document.querySelector(\'[data-rz="trimite"]\')')), 'agenda ediției e la zi cu ordinea de pe masă');
  ok((await col('test-personalitate')) === null, '„Nu” e ascuns');
  ok((await total(1)) === '85 din 90 min' && (await total(2)) === '70 din 105 min', `totalul pe bloc față de timpul disponibil (${await total(1)}; ${await total(2)})`);
  ok(await b.evaluate(c, '/10:30 · Pauză · 15 min/.test(document.querySelector(".masa-pauza").textContent)'), 'pauza fixă stă între blocuri');
  ok(await b.evaluate(c, '!!document.querySelector(\'.masa-carte[data-id="curba"] .mc-produsa\') && !document.querySelector(\'.masa-carte[data-id="harta-emotiilor"] .mc-produsa\')'), 'cartonașul cu piesă produsă e marcat „produsă”');
  if (poze) await b.screenshot(c, join(poze, 'masa.png'));
  // Verdictul
  await b.click(c, '.masa-carte[data-id="studiu-adaptare"] button[data-v="da"]');
  ok((await col('studiu-adaptare')) === 'biblioteca' && (await st())['studiu-adaptare'].verdict === 'da', '„Da” trece cartonașul din Brainstorming în Bibliotecă');
  ok(/Bibliotecă 9 piese 7 produse 2 de produs/i.test(await rz()), 'rezumatul se recalculează pe loc');
  await b.click(c, '#masa-respinse');
  ok((await col('test-personalitate')) === 'brainstorming/nu', '„Arată și Nu” arată respinsele');
  await b.click(c, '#masa-respinse');
  // Tragerea în bloc: totalul se recalculează pe loc
  await b.trage(c, '.masa-carte[data-id="studiu-adaptare"] .mc-titlu', '.masa-carte[data-id="ridica-te-daca"] .mc-titlu');
  let s = await st();
  ok(s['studiu-adaptare'].bloc === 1 && (await col('studiu-adaptare')) === 'agenda:1', `tragerea pune cartonașul în blocul 1 (bloc ${s['studiu-adaptare'].bloc}, ordine ${s['studiu-adaptare'].ordine})`);
  ok((await total(1)) === '95 din 90 min' && await b.evaluate(c, 'document.querySelector(\'.masa-bloc[data-bloc="1"]\').classList.contains("depasire")'), `totalul blocului 1 crește și arată depășirea (${await total(1)})`);
  ok([1, 2, 3, 4, 5].every((n) => Object.values(s).filter((x) => x.bloc === 1).map((x) => x.ordine).sort().includes(n)), 'ordinea din bloc e renumerotată 1…5');
  // Tastatura
  await b.evaluate(c, 'document.querySelector(\'.masa-carte[data-id="apreciere-ceilalti"]\').focus()');
  await b.key(c, '2');
  s = await st();
  ok(s['apreciere-ceilalti'].bloc === 2 && s['apreciere-ceilalti'].verdict === 'da' && s['apreciere-ceilalti'].ordine === 4, '„2” pune cartonașul la finalul blocului 2 (și îi dă „Da”)');
  ok(await b.evaluate(c, 'document.activeElement.dataset.id') === 'apreciere-ceilalti', 'focusul rămâne pe cartonaș');
  await b.key(c, 'ArrowUp');
  ok((await st())['apreciere-ceilalti'].ordine === 3, '↑ îl urcă un loc în bloc');
  await b.evaluate(c, 'document.querySelector(\'.masa-carte[data-id="pasul-de-luni"]\').focus()');
  await b.key(c, 'ArrowUp');
  s = await st();
  ok(s['pasul-de-luni'].bloc === 1 && s['pasul-de-luni'].ordine === 6, '↑ pe primul din bloc îl trece la finalul blocului de dinainte');
  await b.key(c, 'ArrowDown');
  ok((await st())['pasul-de-luni'].bloc === 2 && (await st())['pasul-de-luni'].ordine === 1, '↓ îl aduce înapoi');
  await b.key(c, 'p');
  ok((await st())['pasul-de-luni'].verdict === 'poate', '„P” = poate');
  await b.key(c, 'd');
  await b.evaluate(c, 'document.querySelector(\'.masa-carte[data-id="poveste-fuziune"]\').focus()');
  await b.key(c, '0');
  ok((await col('poveste-fuziune')) === 'brainstorming/poate', '„0” îl scoate din bloc: un „poate” rămâne pe masă');
  await b.evaluate(c, 'document.querySelector(\'.masa-carte[data-id="poveste-fuziune"]\').focus()');
  await b.key(c, 'n');
  ok((await col('poveste-fuziune')) === null && (await st())['poveste-fuziune'].verdict === 'nu', '„N” îl respinge (se ascunde)');
  // Refresh
  const inainte = await st();
  await b.send('Page.reload', {}, c.sessionId); await pauza(900);
  ok(JSON.stringify(await st()) === JSON.stringify(inainte) && /salvate în acest browser/.test(await b.evaluate(c, 'document.getElementById("masa-stare").textContent')), 'după refresh, masa e cum ai lăsat-o (salvată în browser)');
  z = await rz();
  ok(/agenda diferă de firul roșu/.test(z) && await b.evaluate(c, '!!document.querySelector(\'[data-rz="trimite"]\')'), 'după schimbări, rezumatul spune că agenda diferă și oferă „Trimite în agendă”');
  // Cifrele sunt linkuri
  await b.click(c, '[data-rz="de-produs"]');
  ok((await b.evaluate(c, '__curs.stare().vedere')) === 'banca' && (await b.evaluate(c, '[...document.querySelectorAll("details.ex")].filter(a => !a.hidden).map(a => a.id).join()')) === 'ex-harta-emotiilor', '„de produs” duce la Bibliotecă, filtrată pe piesele de produs (cele din build)');
  ok(await b.evaluate(c, '!document.querySelector("#ex-harta-emotiilor .prezinta-piesa") && /de produs/.test(document.querySelector("#ex-harta-emotiilor").textContent)'), 'piesa de produs: marcată, fără „Prezintă”');
  await b.click(c, '[data-vedere="masa"]');
  await b.click(c, '[data-rz="bloc-2"]');
  ok((await b.evaluate(c, '__curs.stare().vedere')) === 'ziua', 'un bloc din rezumat duce la Ziua');
  await b.click(c, '[data-vedere="masa"]');
  await b.click(c, '[data-rz="obiective"]');
  ok((await b.evaluate(c, '__curs.stare().vedere')) === 'schita', 'obiectivele duc la Schiță');
  await b.click(c, '[data-vedere="masa"]');
  // Copiază masa.yml
  await b.click(c, '#masa-copiaza'); await pauza(200);
  const text = await b.evaluate(c, 'document.getElementById("masa-text").value');
  const dinText = Object.fromEntries(parseYaml(text).candidate.map((x) => [x.id, { verdict: x.verdict, bloc: x.bloc ?? null, ordine: x.bloc != null ? x.ordine : null }]));
  ok(Object.keys(inainte).every((id) => JSON.stringify(dinText[id]) === JSON.stringify({ verdict: inainte[id].verdict, bloc: inainte[id].bloc, ordine: inainte[id].ordine })) && /nota: "\[EXEMPLU\] De scris piesa/.test(text), '„Copiază masa.yml” dă fișierul întreg, cu starea de acum (și notele)');
  // Trimite în agendă (offline: textul)
  await b.click(c, '#masa-agenda'); await pauza(200);
  const ag = await b.evaluate(c, 'document.getElementById("masa-text").value');
  ok(/^agenda: .*\n  - deschidere\n  - curba\n  - ridica-te-daca\n  - bloc: 2   # după pauza de la 10:30\n  - pasul-de-luni\n  - apreciere-ceilalti\n  - inchidere\n# De produs: (harta-emotiilor, studiu-adaptare|studiu-adaptare, harta-emotiilor)\n/.test(ag), '„Trimite în agendă” (offline) dă agenda, bloc cu bloc, și ce e de produs');
  ok(/De produs/.test(await b.evaluate(c, 'document.getElementById("masa-mesaj").textContent')), 'mesajul spune ce e de produs');
  await b.click(c, '#masa-reset');
  ok((await col('studiu-adaptare')) === 'brainstorming/nou', '„Resetează” revine la masa.yml');

  // Filtrele (Alex, 2026-11-20: „ca la bibliotecă”): ascund cartonașe, nu schimbă fișierul, nu strică ordinea
  console.log('Filtrele din Harvest:');
  const vazute = () => b.evaluate(c, '[...document.querySelectorAll("#masa-coloane .masa-carte")].filter(li => !li.hidden).map(li => li.dataset.id)');
  const numar = () => b.evaluate(c, 'document.getElementById("masa-numar").textContent');
  const cauta = (t) => b.evaluate(c, `(() => { const i = document.getElementById('masa-cauta'); i.value = ${JSON.stringify(t)}; i.dispatchEvent(new Event('input', { bubbles: true })); })()`);
  const chipH = (k, v) => b.click(c, `#masa-chipuri .chip[data-hf="${k}"][data-valoare="${v}"]`);
  const toate = (await vazute()).length;
  const t1 = await total(1), t2 = await total(2);
  ok(await b.evaluate(c, '[...document.querySelectorAll("#masa-chipuri .filtre-eticheta")].map(x => x.textContent).join("|")') === 'Fel și tip|Verdict|Obiectiv|Stare' && (await numar()) === '' && await b.evaluate(c, 'document.getElementById("masa-sterge").hidden'), 'bara de filtre: Fel și tip, Verdict, Obiectiv, Stare; fără filtre, fără contor și fără „Șterge filtrele”');
  await cauta('EMOTIILOR');
  ok(JSON.stringify(await vazute()) === '["harta-emotiilor"]' && /^1 din \d+ piese/.test(await numar()) && !(await b.evaluate(c, 'document.getElementById("masa-sterge").hidden')), `căutarea merge fără diacritice și majuscule; contorul „N din M piese” (${await numar()})`);
  ok((await total(1)) === t1 && (await total(2)) === t2, 'totalurile blocurilor rămân pe tot Harvest-ul, nu doar pe ce se vede');
  await cauta('');
  await chipH('verdict', 'poate');
  let v = await vazute();
  ok(v.length > 0 && v.every((id) => ['plimbare-curba', 'poveste-fuziune'].includes(id)), `verdictul „Poate” lasă doar piesele cu „Poate” (${v.join(', ')})`);
  await chipH('verdict', 'nou');
  v = await vazute();
  ok(v.includes('studiu-adaptare') && v.includes('plimbare-curba') && !v.includes('curba'), 'în același rând chipurile se adună (Nou SAU Poate)');
  ok(await b.evaluate(c, 'document.activeElement.matches(\'.chip[data-hf="verdict"][data-valoare="nou"]\')'), 'focusul rămâne pe chip după redesen');
  await chipH('verdict', 'nou'); await chipH('verdict', 'poate');
  await chipH('verdict', 'nu');
  ok(JSON.stringify(await vazute()) === '["test-personalitate"]' && await b.evaluate(c, 'document.getElementById("masa-respinse").getAttribute("aria-pressed")') === 'true', 'filtrul „Nu” arată și respinsele');
  await chipH('verdict', 'nu'); await b.click(c, '#masa-respinse');
  // Obiectivul: aceleași piese ca în contorul lui (fără „Nu”)
  const ob1 = await b.evaluate(c, 'document.querySelector(\'#masa-chipuri .chip[data-hf="ob"]\').dataset.valoare');
  await chipH('ob', ob1);
  v = await vazute();
  ok(v.length > 0 && v.length < toate && String(v.length) === await b.evaluate(c, 'document.querySelector(\'#masa-chipuri .chip[data-hf="ob"] .chip-nr\').textContent'), `obiectivul 1 lasă piesele care îl servesc (${v.length})`);
  await chipH('ob', ob1);
  // ↑ cu filtru: sare peste cartonașele ascunse, iar ele își păstrează ordinea
  const bloc1 = () => b.evaluate(c, '[...document.querySelectorAll(\'.masa-lista[data-bloc="1"] .masa-carte\')].map(li => li.dataset.id)');
  const b1 = await bloc1();
  ok(b1[0] === 'deschidere' && b1[1] === 'curba' && b1[2] === 'ridica-te-daca', `blocul 1 începe cu deschidere, curba, ridica-te-daca (${b1.join(', ')})`);
  await chipH('tip', 'mesaj'); await chipH('tip', 'energizant');
  await b.evaluate(c, 'document.querySelector(\'.masa-carte[data-id="ridica-te-daca"]\').focus()');
  await b.key(c, 'ArrowUp');
  const b1b = await bloc1();
  ok(b1b[0] === 'ridica-te-daca' && b1b[1] === 'deschidere' && b1b[2] === 'curba' && b1b.length === b1.length, `↑ cu filtru trece peste piesa ascunsă (curba rămâne după deschidere: ${b1b.join(', ')})`);
  await chipH('tip', 'mesaj'); await chipH('tip', 'energizant');
  // Tragerea cu filtru: din Harvest în Curate
  await chipH('fel', 'continut');
  ok((await vazute()).includes('studiu-adaptare') && !(await vazute()).includes('ridica-te-daca'), 'familia „conținut” lasă teoria, modelele și poveștile');
  await b.trage(c, '.masa-carte[data-id="studiu-adaptare"] .mc-titlu', '.masa-carte[data-id="model-curba"] .mc-titlu');
  ok((await col('studiu-adaptare')) === 'biblioteca' && (await st())['studiu-adaptare'].verdict === 'da', 'tragerea merge și cu filtre active (Harvest → Curate)');
  // Starea filtrelor ține la refresh (în tab), „Șterge filtrele” le scoate pe toate
  await cauta('curba');
  await b.send('Page.reload', {}, c.sessionId); await pauza(900);
  ok(await b.evaluate(c, 'document.getElementById("masa-cauta").value') === 'curba' && await b.evaluate(c, '!!document.querySelector(\'#masa-chipuri .chip[data-hf="fel"][data-valoare="continut"][aria-pressed="true"]\')') && (await vazute()).every((id) => /curba/.test(id) || id === 'plimbare-curba'), 'după refresh, filtrele sunt tot acolo');
  await b.click(c, '#masa-sterge');
  ok((await numar()) === '' && (await vazute()).length === toate && await b.evaluate(c, 'document.getElementById("masa-cauta").value === "" && document.activeElement.id === "masa-cauta"'), '„Șterge filtrele” arată iar toate piesele');
  await b.key(c, 'Escape');
  await b.evaluate(c, 'document.body.focus()');
  await b.key(c, '/');
  ok(await b.evaluate(c, 'document.activeElement.id') === 'masa-cauta', '„/” duce în căutare');
  // Biblioteca își păstrează filtrele ei (chip-urile din Harvest nu intră în calculul ei)
  await chipH('verdict', 'da');
  await b.click(c, '[data-vedere="banca"]');
  ok(/piese$/.test(await b.evaluate(c, 'document.getElementById("banca-numar").textContent')) && await b.evaluate(c, '[...document.querySelectorAll("details.ex")].every(a => !a.hidden)'), 'Biblioteca nu e afectată de filtrele din Harvest');
  await b.click(c, '[data-vedere="masa"]');
  await b.click(c, '#masa-sterge');
  await b.click(c, '#masa-reset');
  // Telefon: o coloană, fără derulare pe orizontală
  await b.send('Emulation.setDeviceMetricsOverride', { width: 390, height: 900, deviceScaleFactor: 1, mobile: true }, c.sessionId); await pauza(300);
  ok(await b.evaluate(c, 'document.documentElement.scrollWidth <= innerWidth + 1'), 'pe telefon nu derulează pe orizontală');
  if (poze) await b.screenshot(c, join(poze, 'masa-telefon.png'));

  // ---------- editorul local ----------
  console.log('Editorul local (scrie în masa.yml):');
  const e = await b.open(ed.url.replace('#ecrane', '#masa'));
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 1700, deviceScaleFactor: 1, mobile: false }, e.sessionId); await pauza(400);
  const disc = () => Object.fromEntries(parseYaml(readFileSync(join(dirEd, 'harvest.yml'), 'utf8')).candidate.map((x) => [x.id, x]));
  ok(await b.evaluate(e, '!!window.__masaEditor && document.getElementById("masa-copiaza").hidden'), 'în editor, Harvest scrie singur (fără „Copiază harvest.yml”)');
  await b.click(e, '.masa-carte[data-id="studiu-adaptare"] button[data-v="poate"]'); await pauza(600);
  ok(disc()['studiu-adaptare'].verdict === 'poate', 'verdictul se scrie direct în masa.yml');
  await b.trage(e, '.masa-carte[data-id="studiu-adaptare"] .mc-titlu', '.masa-carte[data-id="inchidere"] .mc-titlu'); await pauza(700);
  let dd = disc();
  ok(dd['studiu-adaptare'].bloc === 2 && [dd['pasul-de-luni'].ordine, dd['poveste-fuziune'].ordine, dd.inchidere.ordine].concat(dd['studiu-adaptare'].ordine).sort().join() === '1,2,3,4', `tragerea în blocul 2 scrie blocul și ordinea în masa.yml (ordine ${dd['studiu-adaptare'].ordine})`);
  ok(readFileSync(join(dirEd, 'harvest.yml'), 'utf8').startsWith('# [EXEMPLU] Harvest'), 'comentariile din harvest.yml rămân');
  ok(/salvat în harvest\.yml/.test(await b.evaluate(e, 'document.getElementById("masa-stare").textContent')), 'starea spune că e salvat');
  await b.send('Page.reload', {}, e.sessionId); await pauza(900);
  ok((await b.evaluate(e, `document.querySelector('.masa-carte[data-id="studiu-adaptare"]').closest('.masa-lista').dataset.bloc`)) === '2', 'după refresh, pagina citește masa din fișier');
  // Trimite în agendă: scrie în ediție, pagina se reîncarcă cu mesajul
  await b.evaluate(e, 'window.confirm = () => true');
  await b.click(e, '#masa-agenda'); await pauza(1500);
  const edi = readFileSync(join(dirEd, 'editii', '2026-11-23.yml'), 'utf8');
  ok(/agenda: .*# din Masa.*\n  - deschidere\n  - curba\n  - ridica-te-daca\n  - bloc: 2   # după pauza de la 10:30\n  - pasul-de-luni\n  - inchidere\n/.test(edi) && edi.includes('nume_interzise: ["Firma Exemplu"'), 'agenda din ediție vine din blocurile Ordonate; restul ediției rămâne');
  ok(/Agenda e în editii\/2026-11-23\.yml/.test(await b.evaluate(e, 'document.getElementById("masa-mesaj").textContent')) && /harta-emotiilor/.test(await b.evaluate(e, 'document.getElementById("masa-mesaj").textContent')), 'după reîncărcare, mesajul spune unde a scris și ce e de produs');
  ok(!(await b.evaluate(e, 'document.getElementById("masa").hidden')), 'pagina revine la vederea Masa');
  ok(b.exceptii.length === 0, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
  console.log(`\n${esecuri ? esecuri + ' verificări au picat.' : 'Toate verificările au trecut.'}`);
} finally { b.close(); await ed.inchide(); }
process.exit(esecuri ? 1 : 0);
