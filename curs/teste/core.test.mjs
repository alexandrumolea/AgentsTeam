// Biblioteca core (spec Radu, 2026-11-20): copie cu legătură, cele patru stări, conflict din două cursuri, siguranța scrierii.
// Totul în copii temporare: <tmp>/cursuri/a, <tmp>/cursuri/b și <tmp>/biblioteca (găsită singură, ca privat/biblioteca).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, mkdirSync, symlinkSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse as parseYaml } from 'yaml';
import { gasesteCore, amprenta, stare, creeazaCore, citesteCore, caleInterna, materialeDin, marcheazaCore } from '../lib/core.mjs';
import { citesteCurs } from '../lib/sursa.mjs';
import { citesteMasa } from '../lib/masa.mjs';
import { build } from '../build.mjs';
import { pornesteEditor } from '../editor.mjs';

const EXEMPLU = join(dirname(fileURLToPath(import.meta.url)), '..', 'exemple', 'change-agility-exemplu');
function lume() {
  const R = mkdtempSync(join(tmpdir(), 'curs-core-'));
  for (const n of ['a', 'b']) cpSync(EXEMPLU, join(R, 'cursuri', n), { recursive: true, filter: (f) => !f.includes('/dist') });
  return { R, a: join(R, 'cursuri', 'a'), b: join(R, 'cursuri', 'b'), core: join(R, 'biblioteca') };
}
const citeste = (d, f) => readFileSync(join(d, f), 'utf8');
const rand = (d, id) => parseYaml(citeste(d, 'harvest.yml')).candidate.find((x) => x.id === id);
const FISA = '# Aprecierea celorlalți\n- **ID:** apreciere-ceilalti\n\n## Pe scurt\nO închidere caldă, în cerc. ![](materiale/curba.png)\n';
function arbore(d) {
  const out = [];
  (function u(r) { for (const x of readdirSync(join(d, r), { withFileTypes: true })) { const p = r ? `${r}/${x.name}` : x.name; if (x.isDirectory()) { if (!['dist', '.editor-istoric'].includes(x.name)) u(p); } else out.push(p); } })('');
  return out.sort();
}
async function editor(folder, opt = {}) {
  const e = await pornesteEditor({ folder, port: 0, log: () => {}, ...opt });
  const baza = e.url.split('/?')[0];
  e.api = async (cale, corp, token = e.token) => {
    const r = await fetch(baza + cale, { method: corp ? 'POST' : 'GET', headers: { ...(token ? { 'X-Editor-Token': token } : {}), ...(corp ? { 'Content-Type': 'application/json' } : {}) }, body: corp ? JSON.stringify(corp) : undefined });
    return { cod: r.status, json: await r.json() };
  };
  return e;
}

test('core se găsește lângă cursuri/ (sau cu --biblioteca); altfel nu se ghicește nimic', () => {
  const { a, core } = lume();
  assert.equal(gasesteCore(a), core);
  assert.equal(gasesteCore(EXEMPLU), null, 'cursul din exemple/ nu e în cursuri/');
  assert.equal(gasesteCore(EXEMPLU, '/tmp/x'), '/tmp/x');
});

test('amprenta: 8 hex, doar conținutul (nu numele), se schimbă cu fișa sau cu piesa; stările', () => {
  const { a } = lume();
  const p0 = amprenta(a, 'apreciere-ceilalti');
  assert.match(p0, /^[0-9a-f]{8}$/);
  assert.equal(amprenta(a, 'nu-exista'), null);
  mkdirSync(join(a, 'harvest')); writeFileSync(join(a, 'harvest', 'apreciere-ceilalti.md'), FISA);
  const p1 = amprenta(a, 'apreciere-ceilalti'); assert.notEqual(p1, p0);
  writeFileSync(join(a, 'harvest', 'alt-nume.md'), FISA); mkdirSync(join(a, 'piese'), { recursive: true });
  writeFileSync(join(a, 'piese', 'alt-nume.md'), citeste(a, 'piese/apreciere-ceilalti.md'));
  assert.equal(amprenta(a, 'alt-nume'), p1, 'același conținut, alt id: aceeași amprentă');
  assert.throws(() => amprenta(a, '../x'), (e) => e.cod === 400);
  assert.equal(stare('x', 'x', 'x'), 'la-zi'); assert.equal(stare('x', 'x', 'y'), 'modificata');
  assert.equal(stare('x', 'y', 'x'), 'noua'); assert.equal(stare('x', 'y', 'z'), 'difera'); assert.equal(stare('x', null, 'x'), 'lipsa');
  assert.deepEqual(materialeDin(a, FISA, 'materiale/../curs.yml materiale/lipsa.png'), ['materiale/curba.png']);
});

test('creeazaCore: biblioteca.yml gol și un README, fără nicio piesă; build-ul nu scrie în core', () => {
  const { a, core } = lume();
  assert.ok(build(a, { out: join(a, 'dist'), log: () => {} }).ok);
  assert.ok(!existsSync(core), 'build-ul doar citește core');
  creeazaCore(core); creeazaCore(core);
  assert.deepEqual(readdirSync(core).sort(), ['README.md', 'biblioteca.yml']);
  assert.deepEqual(parseYaml(citeste(core, 'biblioteca.yml')), { piese: [] });
  assert.deepEqual(citesteCore(core).piese, []);
});

test('trimite în core: fișa, piesa, materialele, rândul din biblioteca.yml și legătura în harvest.yml; apoi „la zi”', async () => {
  const { a, core } = lume();
  mkdirSync(join(a, 'harvest')); writeFileSync(join(a, 'harvest', 'apreciere-ceilalti.md'), FISA);
  const e = await editor(a);
  try {
    assert.equal(e.core, core);
    assert.equal((await e.api('/api/core/stare?id=apreciere-ceilalti')).json.legata, false);
    assert.equal((await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' }, null)).cod, 403, 'fără token');
    const r = await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' });
    assert.equal(r.cod, 200, JSON.stringify(r.json));
    assert.equal(citeste(core, 'harvest/apreciere-ceilalti.md'), FISA);
    assert.equal(citeste(core, 'piese/apreciere-ceilalti.md'), citeste(a, 'piese/apreciere-ceilalti.md'));
    assert.ok(existsSync(join(core, 'materiale', 'curba.png')), 'imaginea din fișă merge și ea');
    const k = parseYaml(citeste(core, 'biblioteca.yml')).piese;
    assert.deepEqual(Object.keys(k[0]).sort(), ['din_curs', 'durata', 'etichete', 'id', 'scop', 'tip', 'titlu']);
    assert.equal(k[0].din_curs, 'a'); assert.ok(k[0].etichete.includes('Closing'));
    const x = rand(a, 'apreciere-ceilalti');
    assert.equal(x.din, 'comun/apreciere-ceilalti'); assert.match(x.baza, /^[0-9a-f]{8}$/); assert.equal(x.verdict, 'nou', 'verdictul rămâne');
    assert.match(citeste(a, 'harvest.yml'), /^# \[EXEMPLU\] Harvest/, 'comentariile din harvest.yml rămân');
    const s = (await e.api('/api/core/stare?id=apreciere-ceilalti')).json;
    assert.equal(s.stare, 'la-zi'); assert.equal(s.B, s.L); assert.equal(s.C, s.L);
    // Cartonașul: starea calculată la build, în datele paginii
    const html = readFileSync(e.ultim().fisiere.find((f) => f.endsWith('-trainer.html')), 'utf8');
    assert.match(html, /"din":"comun\/apreciere-ceilalti","baza":"[0-9a-f]{8}"[^}]*"core":\{"din":"comun\/apreciere-ceilalti","stare":"la-zi"\}/);
    // Lista din core: piesa e „deja în curs”
    const l = (await e.api('/api/core')).json;
    assert.equal(l.piese.length, 1); assert.equal(l.piese[0].inCurs, true);
    // Modificată aici: doar cursul se schimbă, core rămâne
    writeFileSync(join(a, 'harvest', 'apreciere-ceilalti.md'), FISA + '\nExemplu pentru clientul acesta.\n');
    assert.equal((await e.api('/api/core/stare?id=apreciere-ceilalti')).json.stare, 'modificata');
    assert.equal(citeste(core, 'harvest/apreciere-ceilalti.md'), FISA);
    // Actualizează în core: core primește versiunea nouă, cu copie în istoric, iar baza se mută
    assert.equal((await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' })).cod, 200);
    assert.match(citeste(core, 'harvest/apreciere-ceilalti.md'), /clientul acesta/);
    assert.ok(readdirSync(join(core, '.editor-istoric')).some((f) => f.endsWith('__harvest__apreciere-ceilalti.md')), 'versiunea veche din core e în istoric');
    assert.equal((await e.api('/api/core/stare?id=apreciere-ceilalti')).json.stare, 'la-zi');
    // Dezleagă: din și baza dispar, core nu se schimbă
    const inainte = citeste(core, 'harvest/apreciere-ceilalti.md');
    assert.equal((await e.api('/api/core/dezleaga', { id: 'apreciere-ceilalti' })).cod, 200);
    const y = rand(a, 'apreciere-ceilalti'); assert.equal(y.din, undefined); assert.equal(y.baza, undefined);
    assert.equal(citeste(core, 'harvest/apreciere-ceilalti.md'), inainte);
    // Acum e nelegată, iar core are deja id-ul: propune alt id, nu suprascrie
    const o = await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' });
    assert.equal(o.cod, 409); assert.equal(o.json.conflict.ocupat, true); assert.equal(o.json.conflict.propus, 'apreciere-ceilalti-2');
    assert.equal(citeste(core, 'harvest/apreciere-ceilalti.md'), inainte);
    assert.equal((await e.api('/api/core/trimite', { id: 'apreciere-ceilalti', idCore: 'apreciere-ceilalti-2' })).cod, 200);
    assert.equal(rand(a, 'apreciere-ceilalti').din, 'comun/apreciere-ceilalti-2');
    assert.ok(existsSync(join(core, 'harvest', 'apreciere-ceilalti-2.md')));
  } finally { await e.inchide(); }
});

test('două cursuri: adaugă din core (id ocupat → <id>-core), nouă în core, diferă = conflict fără suprascriere, ia / rămân', async () => {
  const { a, b, core } = lume();
  const ea = await editor(a), eb = await editor(b);
  try {
    assert.equal((await ea.api('/api/core/trimite', { id: 'apreciere-ceilalti' })).cod, 200);
    // Cursul b are deja o piesă locală „apreciere-ceilalti”: propune apreciere-ceilalti-core
    const o = await eb.api('/api/core/adauga', { idCore: 'apreciere-ceilalti' });
    assert.equal(o.cod, 409); assert.equal(o.json.conflict.propus, 'apreciere-ceilalti-core');
    const r = await eb.api('/api/core/adauga', { idCore: 'apreciere-ceilalti', idNou: 'apreciere-ceilalti-core' });
    assert.equal(r.cod, 200, JSON.stringify(r.json));
    const x = rand(b, 'apreciere-ceilalti-core');
    assert.equal(x.verdict, 'nou'); assert.equal(x.sursa, 'core'); assert.equal(x.din, 'comun/apreciere-ceilalti'); assert.equal(x.baza, amprenta(core, 'apreciere-ceilalti'));
    assert.equal(citeste(b, 'piese/apreciere-ceilalti-core.md'), citeste(core, 'piese/apreciere-ceilalti.md'));
    assert.equal((await eb.api('/api/core/adauga', { idCore: 'apreciere-ceilalti', idNou: 'alt-id' })).cod, 409, 'a doua oară: e deja în curs');
    assert.equal((await eb.api('/api/core/stare?id=apreciere-ceilalti-core')).json.stare, 'la-zi');
    // a actualizează core → b vede „nouă în core”
    writeFileSync(join(a, 'piese', 'apreciere-ceilalti.md'), citeste(a, 'piese/apreciere-ceilalti.md') + '\nVarianta din cursul a.\n');
    assert.equal((await ea.api('/api/core/trimite', { id: 'apreciere-ceilalti' })).cod, 200);
    let s = (await eb.api('/api/core/stare?id=apreciere-ceilalti-core')).json;
    assert.equal(s.stare, 'noua');
    // b își schimbă și el copia → „diferă”; bifa / Actualizează în core nu suprascrie
    writeFileSync(join(b, 'piese', 'apreciere-ceilalti-core.md'), citeste(b, 'piese/apreciere-ceilalti-core.md') + '\nVarianta din cursul b.\n');
    s = (await eb.api('/api/core/stare?id=apreciere-ceilalti-core')).json;
    assert.equal(s.stare, 'difera');
    const coreInainte = citeste(core, 'piese/apreciere-ceilalti.md');
    const c = await eb.api('/api/core/trimite', { id: 'apreciere-ceilalti-core' });
    assert.equal(c.cod, 409); assert.equal(c.json.conflict.stare, 'difera'); assert.equal(c.json.conflict.L, s.L);
    assert.equal(citeste(core, 'piese/apreciere-ceilalti.md'), coreInainte, 'conflict: core nu e suprascris');
    const cmp = (await eb.api('/api/core/compara?id=apreciere-ceilalti-core')).json;
    assert.match(cmp.curs.html, /Varianta din cursul b/); assert.match(cmp.core.html, /Varianta din cursul a/);
    // „Ia versiunea din core” cere ce a văzut Alex: cu C vechi refuză
    assert.equal((await eb.api('/api/core/ia', { id: 'apreciere-ceilalti-core', C: 'deadbeef', L: s.L })).cod, 409);
    // „Păstrez a cursului” (rămân la a mea): baza = L, apoi starea e „modificată aici”
    assert.equal((await eb.api('/api/core/raman', { id: 'apreciere-ceilalti-core', L: s.L })).cod, 200);
    s = (await eb.api('/api/core/stare?id=apreciere-ceilalti-core')).json;
    assert.equal(s.stare, 'modificata');
    // „Iau din core”: copia din curs devine cea din core, cu istoric
    assert.equal((await eb.api('/api/core/ia', { id: 'apreciere-ceilalti-core', C: s.C, L: s.L })).cod, 200);
    assert.equal(citeste(b, 'piese/apreciere-ceilalti-core.md'), coreInainte);
    assert.ok(readdirSync(join(b, '.editor-istoric')).some((f) => f.endsWith('__piese__apreciere-ceilalti-core.md')));
    assert.equal((await eb.api('/api/core/stare?id=apreciere-ceilalti-core')).json.stare, 'la-zi');
    // „Trimit a cursului în core” la diferă: merge doar cu L-ul văzut
    writeFileSync(join(a, 'piese', 'apreciere-ceilalti.md'), citeste(a, 'piese/apreciere-ceilalti.md') + '\nÎncă o dată, din a.\n');
    assert.equal((await ea.api('/api/core/trimite', { id: 'apreciere-ceilalti' })).cod, 200);
    writeFileSync(join(b, 'piese', 'apreciere-ceilalti-core.md'), citeste(b, 'piese/apreciere-ceilalti-core.md') + '\nȘi din b.\n');
    s = (await eb.api('/api/core/stare?id=apreciere-ceilalti-core')).json;
    assert.equal(s.stare, 'difera');
    assert.equal((await eb.api('/api/core/trimite', { id: 'apreciere-ceilalti-core', asteptat: 'deadbeef' })).cod, 409);
    assert.equal((await eb.api('/api/core/trimite', { id: 'apreciere-ceilalti-core', asteptat: s.L })).cod, 200);
    assert.match(citeste(core, 'piese/apreciere-ceilalti.md'), /Și din b/);
    assert.equal((await ea.api('/api/core/stare?id=apreciere-ceilalti')).json.stare, 'noua', 'acum a vede versiunea lui b ca nouă în core');
  } finally { await ea.inchide(); await eb.inchide(); }
});

test('siguranța: id-uri și căi interzise, legături simbolice, doar curs + core se schimbă, build refuzat = totul revine', async () => {
  const { R, a, b, core } = lume();
  const e = await editor(a);
  try {
    for (const corp of [{ id: '../curs' }, { id: 'apreciere-ceilalti', idCore: '../../etc' }, { id: 'apreciere-ceilalti', idCore: 'A' }]) {
      const r = await e.api('/api/core/trimite', corp);
      assert.ok([400, 404].includes(r.cod), JSON.stringify(corp) + ' ' + r.cod);
    }
    assert.equal((await e.api('/api/core/adauga', { idCore: '../x' })).cod, 400);
    assert.equal((await e.api('/api/core/adauga', { idCore: 'nu-exista' })).cod, 404);
    for (const rel of ['../x.md', 'curs.yml', 'harvest/../curs.yml', 'materiale/../../x', '/etc/passwd', 'piese/A.md']) assert.throws(() => caleInterna(a, rel), (x) => x.cod === 403, rel);
    // core/harvest e o legătură spre afară: refuz, nimic scris afară
    const afara = mkdtempSync(join(tmpdir(), 'curs-core-afara-'));
    creeazaCore(core); symlinkSync(afara, join(core, 'harvest'));
    mkdirSync(join(a, 'harvest')); writeFileSync(join(a, 'harvest', 'apreciere-ceilalti.md'), FISA);
    const s = await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' });
    assert.equal(s.cod, 403, JSON.stringify(s.json));
    assert.deepEqual(readdirSync(afara), []);
    assert.equal(rand(a, 'apreciere-ceilalti').din, undefined, 'harvest.yml neatins');
    assert.ok(!existsSync(join(core, 'piese', 'apreciere-ceilalti.md')), 'nicio scriere pe jumătate');
    rmSync(join(core, 'harvest'));
    // o trimitere bună schimbă doar fișierele piesei în curs (harvest.yml) și în core
    const arboreR = () => arbore(R).filter((f) => !f.startsWith('cursuri/a/') && !f.startsWith('biblioteca/'));
    const restInainte = arboreR(), restB = arbore(b).map((f) => f + citeste(b, f).length);
    assert.equal((await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' })).cod, 200);
    assert.deepEqual(arboreR(), restInainte); assert.deepEqual(arbore(b).map((f) => f + citeste(b, f).length), restB, 'cursul b nu se schimbă');
    // piesa din core e stricată (imagine care lipsește): adăugarea în b e refuzată de build și totul revine
    writeFileSync(join(core, 'piese', 'stricata.md'), '---\ntitlu: Stricată\ndurata: 5\ntip: mesaj\n---\n\n:::sala\n![x](materiale/lipsa.png)\n:::\n');
    writeFileSync(join(core, 'biblioteca.yml'), citeste(core, 'biblioteca.yml') + '  - id: stricata\n    titlu: Stricată\n    durata: 5\n    tip: mesaj\n');
    const eb = await editor(b);
    try {
      const yml = citeste(b, 'harvest.yml');
      const r = await eb.api('/api/core/adauga', { idCore: 'stricata' });
      assert.equal(r.cod, 422, JSON.stringify(r.json));
      assert.equal(citeste(b, 'harvest.yml'), yml); assert.ok(!existsSync(join(b, 'piese', 'stricata.md')));
      assert.ok(eb.ultim().ok, 'materialul cursului b e refăcut cum era');
    } finally { await eb.inchide(); }
  } finally { await e.inchide(); }
});

test('harvest.yml: baza fără din = eroare; din greșit = avertisment; fără core, starea lipsește dar build-ul merge', () => {
  const { a } = lume();
  const pune = (extra) => writeFileSync(join(a, 'harvest.yml'), citeste(a, 'harvest.yml').replace('  - id: studiu-adaptare\n', `  - id: studiu-adaptare\n${extra}`));
  const yml = citeste(a, 'harvest.yml');
  pune('    baza: 3f9a1c2b\n');
  let r = build(a, { out: join(a, 'dist'), log: () => {}, biblioteca: null });
  assert.equal(r.ok, false); assert.ok(r.erori.some((x) => /„baza” fără „din”/.test(x)), r.erori.join('\n'));
  writeFileSync(join(a, 'harvest.yml'), yml); pune('    din: contract\n');
  r = build(a, { out: join(a, 'dist'), log: () => {}, biblioteca: null });
  assert.ok(r.ok); assert.ok(r.avertismente.some((x) => /„din” e de forma comun\/<id>/.test(x)));
  writeFileSync(join(a, 'harvest.yml'), yml); pune('    din: comun/contract\n    baza: 3f9a1c2b\n');
  r = build(a, { out: join(a, 'dist'), log: () => {}, biblioteca: null });
  assert.ok(r.ok, (r.erori ?? []).join('\n'));
  const c = citesteCurs(a); const m = citesteMasa(c, [], []);
  const x = marcheazaCore(m.candidate, a, null).find((y) => y.id === 'studiu-adaptare');
  assert.deepEqual(x.core, { din: 'comun/contract', stare: null });
});

test('editorul fără core (curs în afara cursuri/): butoanele nu apar, API-ul spune clar de ce', async () => {
  const d = mkdtempSync(join(tmpdir(), 'curs-fara-core-')); cpSync(EXEMPLU, d, { recursive: true, filter: (f) => !f.includes('/dist') });
  const e = await editor(d);
  try {
    assert.equal(e.core, null);
    assert.deepEqual((await e.api('/api/core/stare?id=curba')).json, { activ: false });
    const r = await e.api('/api/core/trimite', { id: 'apreciere-ceilalti' });
    assert.equal(r.cod, 404); assert.match(r.json.eroare, /--biblioteca/);
    const p = await fetch(e.url.split('#')[0]).then((x) => x.text());
    assert.match(p, /"core":null/);
  } finally { await e.inchide(); }
});
