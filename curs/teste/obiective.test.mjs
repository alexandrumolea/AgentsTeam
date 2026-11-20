// Harvest de obiective (Alex, 2026-11-20): harvest-obiective.yml → obiectivele zilei (cele cu „da”), legături pe id,
// numerele vechi pe compatibilitate, scrierile din editor (verdict, viziune, obiectiv nou, fișa, bifele din fișa piesei), core.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { citesteCurs } from '../lib/sursa.mjs';
import { citesteMasa } from '../lib/masa.mjs';
import { indexZi, idDin } from '../lib/obiective.mjs';
import { build } from '../build.mjs';
import { OBIECTIVE } from './obiective-exemplu.mjs';
import { pornesteEditor } from '../editor.mjs';

const EXEMPLU = join(dirname(fileURLToPath(import.meta.url)), '..', 'exemple', 'change-agility-exemplu');
function curs({ obiective = OBIECTIVE, schimba } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'curs-ob-'));
  cpSync(EXEMPLU, d, { recursive: true, filter: (f) => !f.includes('/dist') });
  if (obiective != null) writeFileSync(join(d, 'harvest-obiective.yml'), obiective);
  if (schimba) schimba((f, fn) => writeFileSync(join(d, f), fn(readFileSync(join(d, f), 'utf8'))));
  return d;
}
const citeste = (d, f) => readFileSync(join(d, f), 'utf8');
const construieste = (d) => build(d, { out: join(d, 'iesire'), log: () => {}, biblioteca: null });

test('obiectivele zilei = cele cu „da” din harvest-obiective.yml, în ordinea din fișier (Schița, cursul participanților)', () => {
  const d = curs(), r = construieste(d);
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.deepEqual(r.export.obiective, ['[EXEMPLU] Fiecare își știe locul pe curba schimbării', '[EXEMPLU] Fiecare pleacă cu un pas mic, cu zi și oră']);
  const html = readFileSync(r.fisiere[1], 'utf8');
  assert.match(html, /<span class="ob-nr">2<\/span><span class="ob-text">\[EXEMPLU\] Fiecare pleacă cu un pas mic, cu zi și oră<\/span>/);
  assert.ok(!html.includes('data-text="[EXEMPLU] Un obiectiv nou'), '„nou” nu intră în schiță');
  assert.ok(r.avertismente.some((a) => /curs\.yml: „obiective” nu se mai folosește/.test(a)), 'lista din curs.yml, diferită, e semnalată');
  assert.ok(r.avertismente.some((a) => /fișiere leagă obiectivele prin număr .*1 = primul obiectiv cu „da”, adică ob-curba/.test(a)), r.avertismente.join('\n'));
  assert.ok(r.avertismente.some((a) => /harvest\.yml: 1 piesă leagă obiectivele prin număr/.test(a)), 'și în harvest.yml');
});

test('fără harvest-obiective.yml: curs.yml rămâne sursa, fără avertismente de migrare', () => {
  const r = construieste(curs({ obiective: null }));
  assert.equal(r.ok, true);
  assert.equal(r.export.obiective.length, 4);
  assert.ok(!r.avertismente.some((a) => /prin număr|nu se mai folosește/.test(a)));
});

test('peste 4 cu „da”: avertisment (procesul: cel mult 4); 0 cu „da”: ziua nu are obiective (curs.yml nu revine)', () => {
  const multe = OBIECTIVE.replace(/verdict: (nou|nu)/g, 'verdict: da') + '  - id: ob-cinci\n    text: "[EXEMPLU] Al cincilea"\n    verdict: da\n';
  const r = construieste(curs({ obiective: multe }));
  assert.equal(r.ok, true);
  assert.ok(r.avertismente.some((a) => /5 obiective au „da”; în curs rămân cel mult 4/.test(a)));
  const z = construieste(curs({ obiective: OBIECTIVE.replace(/verdict: da/g, 'verdict: poate') }));
  assert.equal(z.ok, true); assert.deepEqual(z.export.obiective, []);
});

test('legătura pe id: piesă și modul; numerele vechi = locul între cele cu „da”; ediția cu propriile obiective se potrivește după text', () => {
  const d = curs({ schimba: (e) => {
    e('piese/ridica-te-daca.md', (s) => s.replace(/^---\n/, '---\nobiective: [ob-pas, ob-nou]\n'));
    e('04-pasul-de-luni.md', (s) => s.replace('obiective: [3]', 'obiective: [ob-curba, necunoscut]'));
  } });
  const c = citesteCurs(d);
  assert.deepEqual(c.erori, []);
  assert.deepEqual(c.piese.get('ridica-te-daca').obiective, [2], 'ob-pas e al doilea „da”; ob-nou nu e în zi');
  assert.deepEqual(c.module.find((m) => m.id === 'pasul-de-luni').obiective, [1]);
  assert.deepEqual(c.module.find((m) => m.id === 'curba').obiective, [1, 2], '[1, 2] vechi rămân valide');
  assert.deepEqual(c.piese.get('apreciere-ceilalti').obiective, [], '[4] e peste cele 2 obiective ale zilei');
  assert.ok(c.avertismente.some((a) => /04-pasul-de-luni\.md: obiectivul „necunoscut” nu există în harvest-obiective\.yml/.test(a)));
  const html = readFileSync(construieste(d).fisiere[1], 'utf8');
  assert.match(html, /Pasul de luni · 40 min <span class="ob-leg"[^>]*>→ ob\. 1<\/span>/);
  // Ediția cu obiectivele ei: un id se potrivește după textul obiectivului din harvest.
  writeFileSync(join(d, 'editii', '2026-11-23.yml'), citeste(d, 'editii/2026-11-23.yml') + 'obiective: ["Ce a cerut clientul", "[EXEMPLU] Fiecare pleacă cu un pas mic, cu zi și oră"]\n');
  const e2 = citesteCurs(d);
  assert.equal(e2.obiectiveFel, 'editie');
  assert.deepEqual(e2.piese.get('ridica-te-daca').obiective, [2]);
  assert.equal(indexZi('ob-pas', e2.obiectiveZi, e2.harvestObiective), 2);
  assert.equal(idDin(1, citesteCurs(curs()).obiectiveZi), 'ob-curba');
});

test('harvest.yml: legăturile candidatelor (rând, fișierul piesei, lista „piese” a obiectivului) și id-urile greșite', () => {
  const d = curs({ schimba: (e) => e('harvest.yml', (s) => s.replace('obiective: [3]', 'obiective: [ob-pas, ob-lipsa]')) });
  const c = citesteCurs(d), av = [], m = citesteMasa(c, [], av);
  const x = (id) => m.candidate.find((y) => y.id === id);
  assert.deepEqual(x('pasul-de-luni').obIds, ['ob-pas', 'ob-lipsa']); assert.deepEqual(x('pasul-de-luni').obZi, [2]);
  assert.deepEqual(x('harta-emotiilor').obIds, ['ob-curba'], 'din lista „piese” a obiectivului');
  assert.deepEqual(x('curba').obIds.sort(), ['ob-curba', 'ob-nou', 'ob-pas'], 'modulul: [1, 2] din fișier + lista lui ob-nou');
  assert.ok(av.some((a) => /„pasul-de-luni”: obiectivul „ob-lipsa” nu există/.test(a)));
  const rau = curs({ schimba: (e) => e('harvest.yml', (s) => s.replace('obiective: [3]', 'obiective: [Trei]')) });
  const r = construieste(rau);
  assert.equal(r.ok, false); assert.ok(r.erori.some((e) => /„obiective” e o listă de id-uri de obiective/.test(e)));
});

test('harvest-obiective.yml greșit oprește build-ul (verdict, id dublat, text lipsă)', () => {
  for (const [rau, regula] of [
    [OBIECTIVE.replace('verdict: nou', 'verdict: poate-da'), /verdict „poate-da” necunoscut/],
    [OBIECTIVE.replace('id: ob-pas', 'id: ob-curba'), /id „ob-curba” apare de două ori/],
    [OBIECTIVE.replace('id: ob-pas', 'id: Ob Pas'), /„id” poate avea doar litere mici/],
    [OBIECTIVE.replace('    text: "[EXEMPLU] Ceva respins"\n', ''), /lipsește „text”/],
    ['obiective: {}\n', /„obiective” e o listă/],
  ]) {
    const r = construieste(curs({ obiective: rau }));
    assert.equal(r.ok, false, String(regula)); assert.ok(r.erori.some((e) => regula.test(e)), `${regula}: ${r.erori.join(' | ')}`);
  }
});

async function editor(d) {
  const e = await pornesteEditor({ folder: d, port: 0, log: () => {}, biblioteca: null });
  const baza = e.url.split('/?')[0];
  e.api = async (cale, corp, token = e.token) => {
    const r = await fetch(baza + cale, { method: corp ? 'POST' : 'GET', headers: { ...(token ? { 'X-Editor-Token': token } : {}), ...(corp ? { 'Content-Type': 'application/json' } : {}) }, body: corp ? JSON.stringify(corp) : undefined });
    return { cod: r.status, json: await r.json() };
  };
  return e;
}
const hashOb = (d) => citesteCurs(d).harvestObiective.hash;

test('editorul: verdict și viziune (comentariile rămân, copie în istoric), conflict, token', async () => {
  const d = curs(), e = await editor(d);
  try {
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-nou', verdict: 'da' }], hash: hashOb(d) }, null)).cod, 403);
    const r = await e.api('/api/obiective', { schimbari: [{ id: 'ob-nou', verdict: 'da' }], hash: hashOb(d) });
    assert.equal(r.cod, 200, JSON.stringify(r.json));
    const t = citeste(d, 'harvest-obiective.yml');
    assert.match(t, /- id: ob-nou\n\s+text: "\[EXEMPLU\] Un obiectiv nou, încă fără verdict"\n\s+sursa: daria # propunerea Dariei\n\s+verdict: da/);
    assert.match(t, /stare: propunere # Alex o formulează/, 'comentariile rămân');
    assert.ok(readdirSync(join(d, '.editor-istoric')).some((f) => f.endsWith('__harvest-obiective.yml')));
    assert.equal(e.ultim().export.obiective.length, 3, 'build-ul refăcut are 3 obiective cu „da”');
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-nou', verdict: 'nu' }], hash: 'vechi' })).cod, 409, 'hash vechi: conflict');
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-nou', verdict: 'poate-da' }], hash: hashOb(d) })).cod, 400);
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'nu-exista', verdict: 'da' }], hash: hashOb(d) })).cod, 404);
    const v = await e.api('/api/obiective', { viziune: 'Viziunea lui Alex [EXEMPLU]', hash: hashOb(d) });
    assert.equal(v.cod, 200);
    assert.deepEqual(parseYaml(citeste(d, 'harvest-obiective.yml')).viziune, { text: 'Viziunea lui Alex [EXEMPLU]', sursa: 'alex', stare: 'propunere' });
    assert.equal((await e.api('/api/obiective', { viziune: 'două\nrânduri', hash: hashOb(d) })).cod, 400);
  } finally { await e.inchide(); }
});

test('editorul: obiectivele zilei din Flow (pune în zi la final / înaintea altuia, ↑ ↓, scoate = poate); comentariile merg cu rândul', async () => {
  const d = curs(), e = await editor(d);
  const zi = () => citesteCurs(d).obiectiveZi.map((o) => o.id);
  const pune = async (s) => { const r = await e.api('/api/obiective', { schimbari: [s], hash: hashOb(d) }); assert.equal(r.cod, 200, JSON.stringify(r.json)); return r; };
  try {
    assert.deepEqual(zi(), ['ob-curba', 'ob-pas']);
    await pune({ id: 'ob-nou', verdict: 'da', dupa: 'ob-pas' });
    assert.deepEqual(zi(), ['ob-curba', 'ob-pas', 'ob-nou'], 'pus în zi: la final');
    assert.match(citeste(d, 'harvest-obiective.yml'), /- id: ob-pas[\s\S]*- id: ob-nou\n\s+text: [^\n]+\n\s+sursa: daria # propunerea Dariei/, 'rândul se mută cu tot cu comentariu');
    await pune({ id: 'ob-nou', inainteDe: 'ob-pas' });
    assert.deepEqual(zi(), ['ob-curba', 'ob-nou', 'ob-pas'], '↑');
    await pune({ id: 'ob-curba', dupa: 'ob-nou' });
    assert.deepEqual(zi(), ['ob-nou', 'ob-curba', 'ob-pas'], '↓');
    await pune({ id: 'ob-respins', verdict: 'da', inainteDe: 'ob-nou' });
    assert.deepEqual(zi(), ['ob-respins', 'ob-nou', 'ob-curba', 'ob-pas'], 'tras înaintea primului');
    await pune({ id: 'ob-nou', verdict: 'poate' });
    assert.deepEqual(zi(), ['ob-respins', 'ob-curba', 'ob-pas'], 'scoate = poate');
    assert.equal(parseYaml(citeste(d, 'harvest-obiective.yml')).obiective.length, 4, 'niciun rând pierdut');
    assert.equal((await pune({ id: 'ob-pas', dupa: 'ob-pas' })).json.neschimbat, true, 'mutat lângă el însuși: neschimbat');
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-pas', inainteDe: 'nu-exista' }], hash: hashOb(d) })).cod, 404);
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-pas', dupa: 'ob-curba' }], hash: 'vechi' })).cod, 409, 'conflict, ca la verdict');
  } finally { await e.inchide(); }
});

test('editorul: obiectiv nou (rând + fișă), fișa obiectivului (text + Markdown), fișierul de pornire din curs.yml', async () => {
  const d = curs(), e = await editor(d);
  try {
    const n = await e.api('/api/obiective/nou', { text: 'Fiecare își numește o resursă [EXEMPLU]', hash: hashOb(d) });
    assert.equal(n.cod, 200, JSON.stringify(n.json)); assert.equal(n.json.id, 'obiectiv-fiecare-isi-numeste-o');
    const o = parseYaml(citeste(d, 'harvest-obiective.yml')).obiective.at(-1);
    assert.deepEqual(o, { id: 'obiectiv-fiecare-isi-numeste-o', text: 'Fiecare își numește o resursă [EXEMPLU]', sursa: 'alex', verdict: 'nou' });
    assert.match(citeste(d, `harvest/obiective/${n.json.id}.md`), /^# Fiecare își numește o resursă \[EXEMPLU\]\n- \*\*ID:\*\* obiectiv-fiecare-isi-numeste-o[\s\S]*## Cum arată succesul/);
    const s = (await e.api(`/api/fisa/sursa?fel=obiectiv&id=${n.json.id}`)).json;
    assert.equal(s.exista, true); assert.deepEqual(s.campuri, { text: 'Fiecare își numește o resursă [EXEMPLU]' });
    const w = await e.api('/api/fisa/salveaza', { fel: 'obiectiv', id: n.json.id, md: '# Resursa mea\n\nScris de Alex.', hash: s.hash, campuri: { text: 'Fiecare își numește o resursă' }, campuriInainte: s.campuri });
    assert.equal(w.cod, 200, JSON.stringify(w.json));
    assert.equal(citeste(d, `harvest/obiective/${n.json.id}.md`), '# Resursa mea\n\nScris de Alex.\n');
    assert.equal(parseYaml(citeste(d, 'harvest-obiective.yml')).obiective.at(-1).text, 'Fiecare își numește o resursă');
    assert.match(w.json.fisa.html, /<h1[^>]*>Resursa mea<\/h1>/);
    const vechi = await e.api('/api/fisa/salveaza', { fel: 'obiectiv', id: n.json.id, campuri: { text: 'Altceva' }, campuriInainte: s.campuri });
    assert.equal(vechi.cod, 409, 'textul s-a schimbat de la deschidere: conflict');
    assert.equal((await e.api('/api/fisa?fel=obiectiv&id=ob-curba')).json.sursa, null, 'fără fișă: sursa null');
    assert.equal((await e.api('/api/fisa?fel=obiectiv&id=..%2Fx')).cod, 400);
  } finally { await e.inchide(); }
  // Fișierul de pornire: obiectivele din curs.yml devin obiectiv-1…4 cu „da”, deci [1, 2] de azi înseamnă tot primele două.
  const f = curs({ obiective: null }), e2 = await editor(f);
  try {
    const inainte = JSON.stringify(e2.ultim().export.obiective);
    assert.equal((await e2.api('/api/obiective/creeaza', {})).cod, 200);
    assert.equal((await e2.api('/api/obiective/creeaza', {})).cod, 409);
    const c = citesteCurs(f);
    assert.deepEqual(c.obiectiveZi.map((o) => o.id), ['obiectiv-1', 'obiectiv-2', 'obiectiv-3', 'obiectiv-4']);
    assert.equal(JSON.stringify(e2.ultim().export.obiective), inainte, 'aceleași obiective ale zilei');
    assert.deepEqual(c.module.find((m) => m.id === 'curba').obiective, [1, 2]);
  } finally { await e2.inchide(); }
});

test('editorul: bifele din fișa piesei scriu id-uri în harvest.yml; o bifă scoasă o scoate și din lista „piese” a obiectivului', async () => {
  const d = curs(), e = await editor(d);
  try {
    const s = (await e.api('/api/fisa/sursa?id=harta-emotiilor')).json;
    assert.deepEqual(s.obiective.map((o) => [o.id, o.legat, o.dinLista]), [['ob-curba', true, true], ['ob-nou', false, false], ['ob-pas', false, false], ['ob-respins', false, false]]);
    const w = await e.api('/api/fisa/salveaza', { id: 'harta-emotiilor', hash: s.hash, campuri: { obiective: ['ob-pas', 'ob-nou'] }, campuriInainte: s.campuri, scoateDinObiective: ['ob-curba'], hashOb: s.hashOb });
    assert.equal(w.cod, 200, JSON.stringify(w.json));
    assert.match(citeste(d, 'harvest.yml'), /- id: harta-emotiilor[\s\S]*?obiective: \[ ob-pas, ob-nou \]/);
    assert.deepEqual(parseYaml(citeste(d, 'harvest-obiective.yml')).obiective[0].piese, [], 'scoasă și din lista lui ob-curba');
    assert.deepEqual(w.json.sursa.obiective.filter((o) => o.legat).map((o) => o.id), ['ob-nou', 'ob-pas']);
    // Migrarea pe loc: o piesă cu [3] (număr) primește id-uri la prima bifă.
    const p = (await e.api('/api/fisa/sursa?id=pasul-de-luni')).json;
    assert.deepEqual(p.campuri.obiective, [3]);
    assert.equal((await e.api('/api/fisa/salveaza', { id: 'pasul-de-luni', campuri: { obiective: ['ob-pas'] }, campuriInainte: p.campuri })).cod, 200);
    assert.deepEqual(parseYaml(citeste(d, 'harvest.yml')).candidate.find((x) => x.id === 'pasul-de-luni').obiective, ['ob-pas']);
    assert.equal((await e.api('/api/fisa/salveaza', { id: 'pasul-de-luni', campuri: { obiective: ['Rau Id'] }, campuriInainte: { ...p.campuri, obiective: ['ob-pas'] } })).cod, 400);
    // O listă goală scoate câmpul.
    const p2 = (await e.api('/api/fisa/sursa?id=pasul-de-luni')).json;
    assert.equal((await e.api('/api/fisa/salveaza', { id: 'pasul-de-luni', campuri: { obiective: [] }, campuriInainte: p2.campuri })).cod, 200);
    assert.equal(parseYaml(citeste(d, 'harvest.yml')).candidate.find((x) => x.id === 'pasul-de-luni').obiective, undefined);
  } finally { await e.inchide(); }
});

test('core: obiectivele nu se trimit în core (sunt ale cursului)', async () => {
  const R = mkdtempSync(join(tmpdir(), 'curs-ob-core-')), a = join(R, 'cursuri', 'a');
  cpSync(EXEMPLU, a, { recursive: true, filter: (f) => !f.includes('/dist') });
  writeFileSync(join(a, 'harvest-obiective.yml'), OBIECTIVE);
  writeFileSync(join(a, 'harvest.yml'), citeste(a, 'harvest.yml').replace(/(- id: studiu-adaptare\n(?:\s{4}.*\n)*?\s+verdict: nou\n)/, '$1    obiective: [ ob-curba ]\n'));
  mkdirSync(join(a, 'harvest'), { recursive: true }); writeFileSync(join(a, 'harvest', 'studiu-adaptare.md'), '# Studiu\n');
  assert.match(citeste(a, 'harvest.yml'), /obiective: \[ ob-curba \]/);
  const e = await pornesteEditor({ folder: a, port: 0, log: () => {} });
  try {
    const r = await fetch(e.url.split('/?')[0] + '/api/core/trimite', { method: 'POST', headers: { 'X-Editor-Token': e.token, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: 'studiu-adaptare' }) });
    assert.equal(r.status, 200, JSON.stringify(await r.json()));
    const core = join(R, 'biblioteca');
    assert.ok(!/obiectiv/.test(readFileSync(join(core, 'biblioteca.yml'), 'utf8')), 'rândul din core nu are obiective');
    assert.ok(!existsSync(join(core, 'harvest-obiective.yml')) && !existsSync(join(core, 'harvest', 'obiective')));
  } finally { await e.inchide(); }
});

test('obiectivul blocului (bloc: N): rămâne obiectiv al zilei cu același număr; Schița îl ignoră; validare și avertismente', () => {
  const cuBloc = OBIECTIVE.replace('    verdict: da\n    piese: [ harta-emotiilor ]', '    verdict: da\n    bloc: 2\n    piese: [ harta-emotiilor ]');
  const d = curs({ obiective: cuBloc }), r = construieste(d);
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.deepEqual(citesteCurs(d).obiectiveZi.map((o) => o.id), ['ob-curba', 'ob-pas'], 'numerotarea: toate cele cu „da”, oriunde stau');
  assert.equal(citesteCurs(d).harvestObiective.obiective[0].bloc, 2);
  assert.equal(r.export.obiective.length, 2, 'cursul participanților: tot 2');
  assert.ok(!JSON.stringify(r.export).includes('"bloc":2'), 'câmpul bloc nu ajunge în cursul participanților');
  assert.ok(!r.avertismente.some((a) => /câmp necunoscut/.test(a)));
  const departe = construieste(curs({ obiective: cuBloc.replace('bloc: 2', 'bloc: 9') }));
  assert.equal(departe.ok, true);
  assert.ok(departe.avertismente.some((a) => /„ob-curba” are bloc: 9, dar ziua are \d+ blocuri; îl arăt în cutia zilei/.test(a)), departe.avertismente.join('\n'));
  const fara = construieste(curs({ obiective: OBIECTIVE.replace('    verdict: nou\n', '    verdict: nou\n    bloc: 1\n') }));
  assert.ok(fara.avertismente.some((a) => /„bloc” contează doar la verdict „da”/.test(a)));
  assert.equal(construieste(curs({ obiective: cuBloc.replace('bloc: 2', 'bloc: doi') })).ok, false, 'bloc greșit oprește build-ul');
});

test('editorul: obiectivul blocului (bloc: N / null), mutat cu ordinea; verdictul fără „da” scoate blocul; comentariile rămân', async () => {
  const d = curs(), e = await editor(d);
  const ob = () => parseYaml(citeste(d, 'harvest-obiective.yml')).obiective;
  const pune = async (s) => { const r = await e.api('/api/obiective', { schimbari: [s], hash: hashOb(d) }); assert.equal(r.cod, 200, JSON.stringify(r.json)); return r; };
  try {
    await pune({ id: 'ob-pas', bloc: 2 });
    assert.equal(ob().find((o) => o.id === 'ob-pas').bloc, 2);
    assert.deepEqual(citesteCurs(d).obiectiveZi.map((o) => o.id), ['ob-curba', 'ob-pas'], 'numărul nu se schimbă');
    await pune({ id: 'ob-nou', verdict: 'da', bloc: 2, dupa: 'ob-pas' });
    assert.deepEqual(ob().filter((o) => o.bloc === 2).map((o) => o.id), ['ob-pas', 'ob-nou'], 'din Obiective direct într-un bloc: „da” + bloc, după cel de acolo');
    assert.match(citeste(d, 'harvest-obiective.yml'), /sursa: daria # propunerea Dariei/, 'comentariul rămâne');
    await pune({ id: 'ob-nou', bloc: 3, inainteDe: 'ob-curba' });
    assert.deepEqual(citesteCurs(d).obiectiveZi.map((o) => o.id), ['ob-nou', 'ob-curba', 'ob-pas']);
    assert.equal(ob().find((o) => o.id === 'ob-nou').bloc, 3, 'dintr-un bloc în altul');
    await pune({ id: 'ob-pas', bloc: null });
    assert.ok(!('bloc' in ob().find((o) => o.id === 'ob-pas')), 'înapoi în cutia zilei: câmpul dispare');
    await pune({ id: 'ob-nou', verdict: 'poate' });
    assert.ok(!('bloc' in ob().find((o) => o.id === 'ob-nou')), 'Scoate (poate): fără bloc');
    assert.equal(ob().length, 4, 'niciun rând pierdut');
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-pas', bloc: 'doi' }], hash: hashOb(d) })).cod, 400);
    assert.equal((await e.api('/api/obiective', { schimbari: [{ id: 'ob-pas', bloc: 1 }], hash: 'vechi' })).cod, 409, 'conflict');
    assert.ok(readdirSync(join(d, '.editor-istoric')).some((f) => f.endsWith('__harvest-obiective.yml')), 'copie în istoric');
  } finally { await e.inchide(); }
});
