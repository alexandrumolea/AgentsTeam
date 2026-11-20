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
  // Obiectivele zilei în Flow (Alex, 2026-11-20): deasupra Blocului 1, aceleași ca în rezumat, fără durată.
  ok(await v('(() => { const z = document.getElementById("obz"), b1 = document.querySelector(\'.masa-bloc[data-bloc="1"]\'); return z && z.closest(\'[data-col="agenda"]\') && z.compareDocumentPosition(b1) & Node.DOCUMENT_POSITION_FOLLOWING; })()'), 'Flow: cutia „Obiectivele zilei” stă deasupra Blocului 1');
  ok(await v('[...document.querySelectorAll("#obz .obz-carte")].map(x => x.dataset.ob + "=" + x.querySelector(".obh-nr").textContent).join(" ") === "ob-curba=1 ob-pas=2" && /2 din 4/.test(document.querySelector("#obz .masa-bloc-total").textContent)'), 'cutia: cele 2 cu „Da”, numerotate ca în zi, „2 din 4”');
  ok(await v('[...document.querySelectorAll("#obz .obz-carte")].every((x, i) => { const r = document.querySelectorAll("#masa-rezumat .rz[data-rz=obiective]")[i]; const k = x.querySelector(".obh-piese").textContent; return /neacoperit/.test(r.title) ? k === "neacoperit" : r.title.includes(k); })'), 'cutia: numărul de piese din agendă e cel din rezumat');
  ok(await v('!document.querySelector("#obz button") && !document.querySelector(".obh-pune")'), 'offline: cutia doar se citește (fără butoane, fără „Pune în zi”)');
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
  // Obiectivele zilei în Flow, în editor: Pune în zi, ↑, tragerea, limita de 4, Scoate.
  await fe('document.getElementById("fisa-dialog").close(); 1'); await pauza(300);
  const totalB1 = await fe('document.querySelector(\'.masa-bloc[data-bloc="1"] .masa-bloc-total\').textContent');
  const ziY = () => yml('harvest-obiective.yml').obiective.filter((o) => o.verdict === 'da').map((o) => o.id).join(' ');
  const cutie = () => fe('[...document.querySelectorAll("#obz .obz-carte")].map(x => x.dataset.ob).join(" ")');
  await b.click(e, '.obh-carte[data-ob="ob-nou"] .obh-pune'); await pauza(900);
  ok(ziY() === 'ob-curba ob-pas ob-nou' && await cutie() === 'ob-curba ob-pas ob-nou', '„+ Pune în zi”: verdict „da”, la finalul zilei (fișier și cutie)');
  await b.click(e, '.obz-carte[data-ob="ob-nou"] button[data-obz="sus"]'); await pauza(900);
  ok(ziY() === 'ob-curba ob-nou ob-pas' && await cutie() === 'ob-curba ob-nou ob-pas', '↑ mută obiectivul în zi (și în fișier)');
  ok(await fe('document.activeElement && document.activeElement.dataset.obz === "sus" && document.activeElement.closest(".obz-carte").dataset.ob === "ob-nou"'), 'focusul rămâne pe ↑');
  await fe('scrollTo(0, 0); 1'); await pauza(200);
  await b.trage(e, '.obh-carte[data-ob="ob-respins"] .obh-text', '#obz .masa-bloc-cap'); await pauza(900);
  ok(ziY() === 'ob-respins ob-curba ob-nou ob-pas' && await cutie() === 'ob-respins ob-curba ob-nou ob-pas', 'tras din Obiective deasupra primului: „da”, primul în zi');
  const nouId = yml('harvest-obiective.yml').obiective.find((o) => o.verdict === 'nou').id;
  await b.click(e, `.obh-carte[data-ob="${nouId}"] .obh-pune`); await pauza(900);
  ok(await fe('document.getElementById("obz").classList.contains("depasire") && /5 din 4/.test(document.querySelector("#obz .masa-bloc-total").textContent) && /cel mult 4/.test(document.getElementById("obz-mesaj").textContent) && document.getElementById("obz-mesaj").classList.contains("eroare")'), 'al 5-lea: avertismentul (cel mult 4)');
  await b.click(e, '.obz-carte[data-ob="ob-respins"] button[data-obz="scoate"]'); await pauza(900);
  ok(yml('harvest-obiective.yml').obiective.find((o) => o.id === 'ob-respins').verdict === 'poate' && !(await fe('document.getElementById("obz").classList.contains("depasire")')), 'Scoate: verdict „poate”, înapoi la 4');
  ok(await fe('document.querySelector(\'.masa-bloc[data-bloc="1"] .masa-bloc-total\').textContent') === totalB1, 'totalul Blocului 1 nu se schimbă (obiectivele nu au durată)');
  // Obiectivul blocului (Alex, 2026-11-20): în cutia zilei sau într-un bloc; „Unde”, tragerea între cutie și blocuri, din Obiective direct într-un bloc.
  const totaluri = () => fe('[...document.querySelectorAll(\'.masa-bloc[data-bloc] .masa-bloc-total\')].map(x => x.textContent).join(" | ")');
  // Toată coloana Flow în fereastră: tragerea merge doar între puncte vizibile.
  await b.send('Emulation.setDeviceMetricsOverride', { width: 1360, height: 2600, deviceScaleFactor: 1, mobile: false }, e.sessionId); await pauza(300);
  const t0 = await totaluri();
  const loc = (id) => yml('harvest-obiective.yml').obiective.find((o) => o.id === id).bloc ?? null;
  const inBloc = (k) => fe(`[...document.querySelectorAll('.masa-bloc[data-bloc="${k}"] .obb-carte')].map(x => x.dataset.ob + "=" + x.querySelector(".obh-nr").textContent).join(" ")`);
  const unde = (id, val) => fe(`(() => { const s = document.querySelector('.obz-carte[data-ob="${id}"] select[data-obz="unde"]'); s.value = "${val}"; s.dispatchEvent(new Event("change", { bubbles: true })); return 1; })()`);
  // Numerele (Alex, 2026-11-20: „Numerele obiectivelor ar trebui să se schimbe în funcție de ordinea lor în total.”): de sus în jos în Flow, 1…n, aceleași în Obiective.
  const sus = () => fe(`(() => { const f = [...document.querySelectorAll('.obz-carte')]; const ok = f.every((x, i) => x.querySelector('.obh-nr').textContent === String(i + 1) && (document.querySelector('.obh-carte[data-ob="' + x.dataset.ob + '"] .obh-nr') || {}).textContent === String(i + 1)); return ok ? f.map(x => x.dataset.ob).join(' ') : 'gresit'; })()`);
  ok(await fe('!document.querySelector(".obb")'), 'fără obiective în blocuri, blocurile nu au zonă (nu ocupă loc)');
  await unde('ob-pas', 2); await pauza(900);
  ok(loc('ob-pas') === 2 && await inBloc(2) === 'ob-pas=4' && !(await fe('!!document.querySelector(\'#obz .obz-carte[data-ob="ob-pas"]\')')), '„Unde: Blocul 2”: bloc: 2 în fișier; cartonașul stă în Blocul 2, ultimul ca număr (4)');
  ok(ziY() === `ob-curba ob-nou ob-pas ${nouId}`, 'rândurile din fișier nu se mută');
  ok(await sus() === `ob-curba ob-nou ${nouId} ob-pas`, 'numerele: 1…4 de sus în jos, aceleași în Flow și în Obiective');
  ok(/4 din 4 · 1 în blocuri/.test(await fe('document.querySelector("#obz .masa-bloc-total").textContent')), 'cutia: „4 din 4 · 1 în blocuri” (limita e pe toate)');
  ok(await fe('document.activeElement && document.activeElement.dataset.obz === "unde" && document.activeElement.closest(".obz-carte").dataset.ob === "ob-pas"'), 'focusul rămâne pe „Unde”, în noul loc');
  ok(await fe('(() => { const c = document.querySelector(\'.masa-bloc[data-bloc="2"]\'); return !!(c.querySelector(".obb").compareDocumentPosition(c.querySelector(".masa-lista")) & Node.DOCUMENT_POSITION_FOLLOWING); })()'), 'obiectivul blocului stă deasupra pieselor');
  ok(/în agendă · \d+ în bloc$|^neacoperit$/.test(await fe('document.querySelector(\'.obb-carte[data-ob="ob-pas"] .obh-piese\').textContent')), 'cartonașul din bloc: piese în agendă și câte din bloc');
  ok(/Blocul 2/.test(await fe('document.querySelector(\'.obh-carte[data-ob="ob-pas"]\').textContent')), 'în Obiective, cartonașul spune „Blocul 2”');
  await fe('scrollTo(0, 0); 1'); await pauza(200);
  await b.trage(e, '#obz .obz-carte[data-ob="ob-nou"] .obh-text', '.masa-bloc[data-bloc="1"] .masa-bloc-cap'); await pauza(900);
  ok(loc('ob-nou') === 1 && /^ob-nou=\d$/.test(await inBloc(1)), 'tras din cutia zilei într-un bloc gol: bloc: 1');
  ok(ziY() === `ob-curba ob-nou ob-pas ${nouId}` && await sus() === `ob-curba ${nouId} ob-nou ob-pas` && await inBloc(1) === 'ob-nou=3', 'mutat în Blocul 1: numerele se recalculează (1…4 de sus în jos)');
  await b.trage(e, '.obb-carte[data-ob="ob-nou"] .obh-text', '.masa-bloc[data-bloc="2"] .masa-bloc-cap'); await pauza(900);
  ok(loc('ob-nou') === 2 && (await inBloc(2)).startsWith('ob-nou=') && (await inBloc(2)).includes('ob-pas=') && !(await inBloc(1)), 'dintr-un bloc în altul, deasupra celui de acolo');
  await b.trage(e, '.obb-carte[data-ob="ob-pas"] .obh-text', '#obz .masa-bloc-cap'); await pauza(900);
  ok(loc('ob-pas') === null && await fe('document.querySelector("#obz .obz-carte").dataset.ob') === 'ob-pas', 'din bloc înapoi în cutia zilei (câmpul bloc dispare), primul');
  ok(/^ob-pas ob-curba /.test(await sus()), 'înapoi în cutie: numărul 1');
  ok(yml('harvest-obiective.yml').obiective.find((o) => o.id === 'ob-respins').verdict === 'poate', 'ob-respins e „poate” înainte de tragere');
  await fe('scrollTo(0, 0); 1'); await pauza(200);
  await b.trage(e, '.obh-carte[data-ob="ob-respins"] .obh-text', '.masa-bloc[data-bloc="1"] .masa-bloc-cap'); await pauza(900);
  ok(loc('ob-respins') === 1 && yml('harvest-obiective.yml').obiective.find((o) => o.id === 'ob-respins').verdict === 'da' && (await inBloc(1)).startsWith('ob-respins='), 'din Obiective direct într-un bloc: „da” + bloc: 1');
  ok(await fe('document.getElementById("obz").classList.contains("depasire") && /5 din 4/.test(document.querySelector("#obz .masa-bloc-total").textContent)'), 'limita de 4 numără și obiectivele din blocuri');
  await b.click(e, '.obb-carte[data-ob="ob-respins"] button[data-obz="scoate"]'); await pauza(900);
  const dupaScoate = yml('harvest-obiective.yml').obiective.find((o) => o.id === 'ob-respins');
  ok(dupaScoate.verdict === 'poate' && !('bloc' in dupaScoate) && !(await inBloc(1)), 'Scoate din bloc: „poate”, fără bloc');
  ok(await totaluri() === t0, 'totalurile blocurilor nu se schimbă (obiectivele nu au durată)');
  ok(await fe('!document.querySelector(".masa-bloc.tinta") && !document.body.classList.contains("obz-tragere")'), 'după tragere nu rămâne nicio țintă marcată');
  ok(/sursa: daria # propunerea Dariei/.test(readFileSync(join(dirEd, 'harvest-obiective.yml'), 'utf8')), 'comentariile din fișier rămân');
  await unde('ob-curba', 2); await pauza(900);
  ok(loc('ob-curba') === 2 && (await inBloc(2)).replace(/=\d/g, '') === 'ob-nou ob-curba', '„Unde: Blocul 2” într-un bloc cu obiective: la finalul lor');
  await b.click(e, '.obb-carte[data-ob="ob-nou"] button[data-obz="jos"]'); await pauza(900);
  ok((await inBloc(2)).replace(/=\d/g, '') === 'ob-curba ob-nou' && await fe('document.querySelector(\'.obb-carte[data-ob="ob-curba"] button[data-obz="sus"]\').disabled'), '↓ în bloc: ordinea se schimbă doar între obiectivele blocului');
  for (const w of [1360, 800, 375, 320]) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 700 }, e.sessionId); await pauza(200);
    const rau = await fe(`[...document.querySelectorAll(".obz-carte")].filter(x => { const r = x.getBoundingClientRect(), l = x.parentNode.getBoundingClientRect(); return r.left < l.left - .5 || r.right > l.right + .5 || x.scrollWidth > x.clientWidth + 1; }).length`);
    ok(!rau && await fe('document.documentElement.scrollWidth <= innerWidth'), `${w}px: cutia încape, fără derulare orizontală`);
    if (poze && (w === 1360 || w === 375)) await b.screenshot(e, join(poze, `obiective-zi-${w}.png`));
  }
  ok(!b.exceptii.length, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
} finally { await ed.inchide(); await b.close(); }
console.log(esecuri ? `\n${esecuri} verificări au eșuat.` : '\nToate verificările au trecut.');
process.exit(esecuri ? 1 : 0);
