// Imaginile din sală încap în ecran (T-031, Ioana: schema de pe ecranul de model ieșea tăiată jos).
//   node teste/chrome-imagini.mjs [--poze <folder>]
// Construiește o copie a cursului-exemplu cu o schemă 16:9 pe toate felurile de ecran (teorie, exercițiu cu panou,
// reflecție, mesaj cheie, pauză), în trei așezări: titlu + imagine, doar imagine, titlu + două rânduri de text + imagine.
// Verifică ecranele la mărime reală (#tipar-ecrane), previzualizările din Modul și ecranul de comandă.
import { cpSync, mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from './cdp.mjs';
import { build } from '../build.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const poze = args.includes('--poze') ? args[args.indexOf('--poze') + 1] : null;
if (poze) mkdirSync(poze, { recursive: true });

const dir = mkdtempSync(join(tmpdir(), 'curs-imagini-'));
cpSync(join(AICI, '..', 'exemple', 'change-agility-exemplu'), dir, { recursive: true, filter: (f) => !f.includes('/dist') });
writeFileSync(join(dir, 'materiale', 'schema.svg'), `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<rect width="1600" height="900" fill="#ffffff" stroke="#c96a1e" stroke-width="12"/><path d="M100 300 C 400 300, 500 750, 800 750 S 1200 200, 1500 180" fill="none" stroke="#14161f" stroke-width="10"/>
<rect x="0" y="860" width="1600" height="40" fill="#c96a1e"/></svg>`);
const blocuri = (cron) => [
  '## Curba schimbării\n![schema](materiale/schema.svg)',
  '![schema](materiale/schema.svg)',
  '## Curba schimbării\nUn rând de text despre schemă.\nÎncă un rând, ca să fie strâmt.\n![schema](materiale/schema.svg)',
].map((b) => `:::sala${cron ? ' cronometru=3' : ''}\n${b}\n:::\n`).join('\n');
const piese = {
  'img-teorie': 'tip: model',
  'img-exercitiu': 'tip: exercitiu\nformat: perechi\nenergie: mediu\nobiectiv: "Test"',
  'img-reflectie': 'tip: reflectie\nformat: individual\nenergie: calm\nobiectiv: "Test"',
  'img-mesaj': 'tip: mesaj',
  'img-pauza': 'tip: pauza',
};
for (const [id, antet] of Object.entries(piese)) {
  writeFileSync(join(dir, 'piese', `${id}.md`), `---\ntitlu: "Imagine ${id}"\ndurata: 5\n${antet}\n---\n\n${blocuri(id === 'img-exercitiu')}`);
}
const ed = join(dir, 'editii', '2026-11-23.yml');
writeFileSync(ed, readFileSync(ed, 'utf8').replace(/agenda:[\s\S]*?\nnume_interzise/, `agenda:\n${Object.keys(piese).map((id) => `  - ${id}`).join('\n')}\nnume_interzise`));
const r = build(dir, { out: join(dir, 'iesire'), log: () => {} });
if (!r.ok) { console.error('build-ul a eșuat', r.erori); process.exit(1); }
const url = pathToFileURL(r.fisiere[1]).href;

let esecuri = 0;
const ok = (cond, ce) => { console.log(`${cond ? '  ✓' : '  ✗'} ${ce}`); if (!cond) esecuri++; };
const pauza = (ms) => new Promise((res) => setTimeout(res, ms));
// Pentru fiecare imagine din `radacina`: încărcată, întreagă în cutia ei (ecranul, fără padding, sau cadrul), proporția 16:9 păstrată,
// nu prea mică (minim px pe ecranul de 1600×900), iar textul de deasupra încape și el.
const VERIFICA = (radacina, cutie, minim) => `(async () => {
  const imgs = [...document.querySelectorAll(${JSON.stringify(radacina)})];
  await Promise.all(imgs.map((i) => i.decode().catch(() => {})));
  return imgs.map((i) => {
    const c = i.closest(${JSON.stringify(cutie)}), e = i.closest('.ecran'), ri = i.getBoundingClientRect(), rc = c.getBoundingClientRect();
    const cs = getComputedStyle(e), z = rc.width / 1600 || 1;
    const panou = e.querySelector('.ecran-panou'), dreapta = panou ? panou.getBoundingClientRect().left : rc.right;
    const jos = ${cutie === '.ecran' ? 'rc.bottom - parseFloat(cs.paddingBottom) * z' : 'rc.bottom'};
    const rt = i.closest('.ecran-continut').getBoundingClientRect();
    return { textInauntru: rt.top >= rc.top - 0.5 && rt.bottom <= jos + 0.5, fel: e.className, titlu: !!i.closest('.ecran-continut').querySelector('h2'), text: !!i.closest('.ecran-continut').querySelector('p:not(.doar-imagine)'),
      incarcata: i.complete && i.naturalWidth > 0, inauntru: ri.top >= rc.top - 0.5 && ri.bottom <= jos + 0.5 && ri.left >= rc.left - 0.5 && ri.right <= dreapta + 0.5,
      proportie: Math.abs(ri.width / ri.height - 16 / 9) < 0.03, inaltime: ri.height / z, mare: ri.height / z >= ${minim} };
  });
})()`;

const b = await launch();
try {
  // 1. Ecranele la mărime reală: 5 feluri × 3 așezări.
  const t = await b.open(url + '#tipar-ecrane');
  await pauza(500);
  const reale = await b.evaluate(t, VERIFICA('#tipar-ecrane-lista .ecran img', '.ecran', 150));
  ok(reale.length === 15, `${reale.length} imagini pe ecranele la mărime reală (aștept 15: 5 feluri × 3 așezări)`);
  const feluri = [...new Set(reale.map((x) => x.fel.match(/fel-(\w+)/)[1]))].sort().join(', ');
  ok(feluri === 'exercitiu, mesaj, pauza, reflectie, teorie', `toate felurile de ecran: ${feluri}`);
  ok(reale.every((x) => x.incarcata), 'toate imaginile se încarcă (din fișier, fără internet)');
  for (const x of reale) {
    const ce = `${x.fel.match(/fel-(\w+)/)[1]}, ${x.titlu ? (x.text ? 'titlu + 2 rânduri' : 'titlu') : 'fără titlu'}`;
    ok(x.inauntru && x.proportie && x.mare && x.textInauntru, `${ce}: imaginea încape întreagă, 16:9, ${Math.round(x.inaltime)} px înălțime; textul încape și el`);
  }
  if (poze) {
    await b.send('Emulation.setDeviceMetricsOverride', { width: 1600, height: 900, deviceScaleFactor: 0.5, mobile: false }, t.sessionId);
    for (const [k, i] of [[0, 0], [3, 3], [5, 5], [8, 8], [10, 10], [13, 13]]) {
      await b.evaluate(t, `document.querySelectorAll('#tipar-ecrane-lista .ecran img')[${i}].closest('.ecran').scrollIntoView()`);
      await b.screenshot(t, join(poze, `ecran-${k}.png`));
    }
  }

  // 2. Previzualizările din vederea Modul (zoom 0,3). Piesa-pauză singură nu are articol în Modul: 4 feluri × 3.
  const p = await b.open(url + '#modul');
  await pauza(400);
  const mici = await b.evaluate(p, VERIFICA('#modul .strat-ecran img', '.cadru', 300));
  ok(mici.length === 12 && mici.every((x) => x.incarcata && x.inauntru && x.proportie), `previzualizările din Modul: ${mici.filter((x) => x.inauntru).length} din ${mici.length} încap`);

  // 3. Ecranul de comandă („Acum” și „Urmează”) și „Prezintă aici”, pe fiecare ecran cu imagine.
  await b.click(p, '[data-vedere="prezinta"]');
  await b.click(p, '#prezinta-aici'); await pauza(300);
  const n = await b.evaluate(p, 'JSON.parse(document.getElementById("date-curs").textContent).ecrane.length');
  let toate = true, vazute = 0;
  for (let i = 0; i < n; i++) {
    const v = await b.evaluate(p, VERIFICA('#cadru-acum img, #cadru-urmeaza img, #aici-cadru img', '.cadru', 0));
    vazute += v.length;
    if (!v.every((x) => x.incarcata && x.inauntru && x.proportie)) { toate = false; console.log('    ecranul', i, JSON.stringify(v)); }
    await b.key(p, 'ArrowRight');
  }
  ok(toate && vazute > 0, `ecranul de comandă și „Prezintă aici”: imaginile încap pe toate cele ${n} ecrane (${vazute} verificări)`);
  ok(b.exceptii.length === 0, `nicio eroare JavaScript${b.exceptii.length ? ': ' + b.exceptii.join(' | ') : ''}`);
  console.log(`\n${esecuri ? esecuri + ' verificări au picat.' : 'Toate verificările au trecut.'}`);
} finally { b.close(); }
process.exit(esecuri ? 1 : 0);
