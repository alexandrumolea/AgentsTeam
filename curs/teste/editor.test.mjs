// Editorul local (1.11): scrierea exactă a blocului, concurența, căile interzise, tokenul, build-ul după salvare.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';
import { citesteBloc, scrieBloc, caleSigura, citesteRef, hash } from '../lib/editor-sursa.mjs';
import { pornesteEditor } from '../editor.mjs';

const EXEMPLU = join(dirname(fileURLToPath(import.meta.url)), '..', 'exemple', 'change-agility-exemplu');
const copie = () => { const d = mkdtempSync(join(tmpdir(), 'curs-editor-')); cpSync(EXEMPLU, d, { recursive: true, filter: (f) => !f.includes('/dist') }); return d; };
const citeste = (d, f) => readFileSync(join(d, f), 'utf8');

test('scrie exact blocul cerut; restul fișierului rămâne neatins', () => {
  const d = copie(), f = 'piese/perechi-curba.md', inainte = citeste(d, f);
  const b = citesteBloc(d, 'perechi-curba#1');
  assert.equal(b.fisier, f);
  assert.match(b.md, /^\*\*În perechi, 10 minute\*\*/);
  const s = scrieBloc(d, 'perechi-curba#1', '## În perechi\n- unu\n- doi', b.hash);
  const dupa = citeste(d, f);
  const A = inainte.split('\n'), B = dupa.split('\n');
  const i = A.findIndex((l) => l.startsWith(':::sala cronometru=10'));
  assert.equal(B[i], ':::sala cronometru=10', 'deschiderea (cu cronometrul) rămâne');
  assert.deepEqual(B.slice(0, i + 1), A.slice(0, i + 1), 'tot ce e înainte de bloc e identic');
  const j = A.indexOf(':::', i + 1), k = B.indexOf(':::', i + 1);
  assert.deepEqual(B.slice(i + 1, k), ['## În perechi', '- unu', '- doi']);
  assert.deepEqual(B.slice(k), A.slice(j), 'tot ce e după bloc e identic');
  assert.ok(existsSync(join(d, s.copie)) && readFileSync(join(d, s.copie), 'utf8') === inainte, 'copia de siguranță are versiunea veche');
  assert.equal(readFileSync(join(d, '.editor-istoric', '.gitignore'), 'utf8'), '*\n', 'istoricul nu intră în git');
});
test('al doilea bloc din același fișier, nota trainerului și id-ul cu @2', () => {
  const d = copie();
  assert.match(citesteBloc(d, 'deschidere#2').md, /Prezentări, câte 30 de secunde/);
  const n = citesteBloc(d, 'model-curba#nota1');
  assert.equal(n.fel, 'trainer');
  scrieBloc(d, 'model-curba#nota1', 'Notă nouă.', n.hash);
  assert.match(citeste(d, 'piese/model-curba.md'), /:::trainer\nNotă nouă\.\n:::/);
  assert.equal(citesteBloc(d, 'ridica-te-daca@2#1').fisier, 'piese/ridica-te-daca.md');
});
test('concurența: dacă fișierul s-a schimbat pe disc, nu suprascrie', () => {
  const d = copie(), b = citesteBloc(d, 'curba#1');
  writeFileSync(join(d, '02-curba-schimbarii.md'), citeste(d, '02-curba-schimbarii.md') + '\nAltcineva a scris aici.\n');
  const inainte = citeste(d, '02-curba-schimbarii.md');
  assert.throws(() => scrieBloc(d, 'curba#1', 'Text nou', b.hash), (e) => e.cod === 409 && /s-a schimbat pe disc/.test(e.message));
  assert.equal(citeste(d, '02-curba-schimbarii.md'), inainte);
});
test('căi și referințe interzise', () => {
  const d = copie();
  for (const rel of ['../curs.yml', '/etc/passwd', 'piese/../../x.md']) assert.throws(() => caleSigura(d, rel), (e) => e.cod === 403, rel);
  for (const ref of ['../curba#1', 'curba', 'curba#titlu', '/etc/passwd#1', 'Curba#1', 'curba#1/../x']) assert.throws(() => citesteRef(ref), ref);
  assert.throws(() => citesteBloc(d, 'nu-exista#1'), (e) => e.cod === 404);
  assert.throws(() => citesteBloc(d, 'curba#9'), (e) => e.cod === 404);
});
test('textul nu poate strica structura fișierului și nu poate lăsa ecranul gol', () => {
  const d = copie(), b = citesteBloc(d, 'curba#1');
  assert.throws(() => scrieBloc(d, 'curba#1', 'text\n:::\n:::trainer\nfurat', b.hash), /începe cu „::”/);
  assert.throws(() => scrieBloc(d, 'curba#1', '::piese', b.hash), /începe cu „::”/);
  assert.throws(() => scrieBloc(d, 'curba#1', '   \n', b.hash), /nu poate rămâne gol/);
  assert.equal(hash(citeste(d, '02-curba-schimbarii.md')), b.hash, 'fișierul a rămas neatins');
});

// Serverul
function cere(e, { metoda = 'GET', cale = '/', token, host, corp } = {}) {
  const port = e.server.address().port;
  return new Promise((ok, rau) => {
    const r = request({ host: '127.0.0.1', port, method: metoda, path: cale, headers: {
      Host: host ?? `127.0.0.1:${port}`, ...(token ? { 'X-Editor-Token': token } : {}), ...(corp ? { 'Content-Type': 'application/json' } : {}),
    } }, (res) => { let t = ''; res.setEncoding('utf8'); res.on('data', (x) => { t += x; }); res.on('end', () => ok({ cod: res.statusCode, text: t, json: (() => { try { return JSON.parse(t); } catch { return null; } })() })); });
    r.on('error', rau); if (corp) r.write(JSON.stringify(corp)); r.end();
  });
}
test('serverul: doar 127.0.0.1, doar cu token, doar gazda lui', async () => {
  const d = copie(), e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    assert.equal(e.server.address().address, '127.0.0.1');
    assert.equal((await cere(e, { cale: '/' })).cod, 403, 'pagina fără token');
    assert.equal((await cere(e, { cale: '/?t=gresit' })).cod, 403, 'pagina cu token greșit');
    const p = await cere(e, { cale: `/?t=${e.token}` });
    assert.equal(p.cod, 200);
    assert.ok(p.text.includes('window.__EDITOR') && p.text.includes('ed-btn'), 'pagina servită are editorul');
    assert.equal((await cere(e, { cale: '/api/bloc?ref=curba%231' })).cod, 403, 'API fără token');
    assert.equal((await cere(e, { cale: '/api/bloc?ref=curba%231', token: 'x'.repeat(36) })).cod, 403, 'API cu token greșit');
    assert.equal((await cere(e, { cale: '/api/bloc?ref=curba%231', token: e.token, host: 'atacator.example:80' })).cod, 403, 'altă gazdă (DNS rebinding)');
    const b = await cere(e, { cale: '/api/bloc?ref=curba%231', token: e.token });
    assert.equal(b.cod, 200);
    const html = readFileSync(join(d, 'dist', 'change-agility-exemplu-trainer.html'), 'utf8');
    assert.ok(!html.includes('__EDITOR') && !html.includes('editor-client'), 'fișierul HTML offline rămâne fără editor');
  } finally { await e.inchide(); }
});
test('serverul: salvare → build refăcut; build oprit → fișierul revine, textul primește eroarea', async () => {
  const d = copie(), e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    const b = (await cere(e, { cale: '/api/bloc?ref=curba%231', token: e.token })).json;
    const s = await cere(e, { metoda: 'POST', cale: '/api/bloc', token: e.token, corp: { ref: 'curba#1', md: 'Întrebarea nouă, din editor?', hash: b.hash } });
    assert.equal(s.cod, 200, s.text);
    assert.match(citeste(d, '02-curba-schimbarii.md'), /:::sala-si-curs\nÎntrebarea nouă, din editor\?\n:::/);
    assert.ok(readFileSync(join(d, 'dist', 'change-agility-exemplu-trainer.html'), 'utf8').includes('Întrebarea nouă, din editor?'), 'materialul e refăcut');
    // Același hash vechi: concurență
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/bloc', token: e.token, corp: { ref: 'curba#1', md: 'Alt text', hash: b.hash } })).cod, 409);
    // Un nume interzis (ediția) într-un bloc care merge și în curs: build-ul refuză, fișierul revine
    const b2 = (await cere(e, { cale: '/api/bloc?ref=curba%231', token: e.token })).json;
    const inainte = citeste(d, '02-curba-schimbarii.md');
    const r = await cere(e, { metoda: 'POST', cale: '/api/bloc', token: e.token, corp: { ref: 'curba#1', md: 'Salut, Firma Exemplu!', hash: b2.hash } });
    assert.equal(r.cod, 422);
    assert.ok(r.json.erori.some((x) => /nume interzis/.test(x)));
    assert.equal(citeste(d, '02-curba-schimbarii.md'), inainte, 'fișierul a revenit');
    assert.ok(readdirSync(join(d, '.editor-istoric')).length >= 2, 'copiile de siguranță există');
    // Previzualizarea
    const p = await cere(e, { metoda: 'POST', cale: '/api/previzualizare', token: e.token, corp: { ref: 'perechi-curba#1', md: '## Titlu\n- a' } });
    assert.equal(p.cod, 200);
    assert.equal(p.json.fel, 'exercitiu');
    assert.match(p.json.html, /<h2>Titlu<\/h2>/);
  } finally { await e.inchide(); }
});

// Masa (etapa A, Alex, 2026-11-18): scrierea în masa.yml și „Trimite în agendă”, prin același server și același token
test('serverul: Masa scrie în masa.yml (comentariile rămân), cu concurență și copie', async () => {
  const d = copie(), e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    const h0 = hash(citeste(d, 'masa.yml'));
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/masa', corp: { schimbari: [], hash: h0 } })).cod, 403, 'fără token');
    const s = await cere(e, { metoda: 'POST', cale: '/api/masa', token: e.token, corp: { hash: h0, schimbari: [{ id: 'studiu-adaptare', verdict: 'da', bloc: 2, ordine: 4 }, { id: 'poveste-fuziune', bloc: null, ordine: null }] } });
    assert.equal(s.cod, 200, s.text);
    const t = citeste(d, 'masa.yml');
    assert.ok(t.startsWith('# [EXEMPLU] Masa (etapa A'), 'comentariile de sus rămân');
    assert.match(t, /- id: studiu-adaptare\n(    .*\n)*?    verdict: da\n    bloc: 2\n    ordine: 4/);
    const item = (id) => t.split(`  - id: ${id}\n`)[1].split('  - id:')[0];
    assert.ok(/verdict: poate/.test(item('poveste-fuziune')) && !/bloc:|ordine:/.test(item('poveste-fuziune')), 'blocul scos dispare din fișier, verdictul rămâne');
    assert.equal(s.json.hash, hash(t));
    assert.ok(readdirSync(join(d, '.editor-istoric')).some((f) => f.endsWith('__masa.yml')), 'copia de siguranță există');
    assert.ok(readFileSync(join(d, 'dist', 'change-agility-exemplu-trainer.html'), 'utf8').includes('"id":"studiu-adaptare","titlu":"Ce spun studiile despre adaptare","scop":"[EXEMPLU] Două date care surprind","durata":10,"tip":"model","sursa":"Irina","verdict":"da","bloc":2'), 'materialul e refăcut');
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/masa', token: e.token, corp: { hash: h0, schimbari: [{ id: 'curba', verdict: 'nu' }] } })).cod, 409, 'hash vechi: nu suprascrie');
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/masa', token: e.token, corp: { hash: s.json.hash, schimbari: [{ id: 'curba', verdict: 'poatee' }] } })).cod, 400, 'verdict greșit');
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/masa', token: e.token, corp: { hash: s.json.hash, schimbari: [{ id: 'nu-exista', verdict: 'da' }] } })).cod, 404);
    assert.equal(citeste(d, 'masa.yml'), t, 'cererile refuzate nu ating fișierul');
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/masa/creeaza', token: e.token, corp: {} })).cod, 409, 'masa.yml există deja');
  } finally { await e.inchide(); }
});
test('serverul: „Trimite în agendă” scrie doar agenda ediției, cu copie; „Creează masa.yml” pornește din agenda de azi', async () => {
  const d = copie(), e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    const ed = 'editii/2026-11-23.yml', inainte = citeste(d, ed);
    assert.equal((await cere(e, { metoda: 'POST', cale: '/api/masa/agenda', token: e.token, corp: { hash: 'vechi' } })).cod, 409);
    const a = await cere(e, { metoda: 'POST', cale: '/api/masa/agenda', token: e.token, corp: { hash: hash(citeste(d, 'masa.yml')) } });
    assert.equal(a.cod, 200, a.text);
    assert.deepEqual([a.json.fisier, a.json.randuri, a.json.deProdus.map((x) => x.id), a.json.nehotarate.map((x) => x.id)], [ed, 5, ['harta-emotiilor'], ['poveste-fuziune']]);
    const dupa = citeste(d, ed);
    assert.match(dupa, /agenda: .*# din Masa.*\n  - deschidere\n  - curba\n  - ridica-te-daca\n  - bloc: 2   # după pauza de la 10:30\n  - pasul-de-luni\n  - inchidere\n# Ecranele din sală/);
    assert.equal(dupa.split('\nagenda:')[0], inainte.split('\nagenda:')[0], 'ce e înainte de agendă rămâne');
    assert.equal(dupa.split('# Ecranele din sală')[1], inainte.split('# Ecranele din sală')[1], 'ce e după agendă rămâne');
    assert.ok(readdirSync(join(d, '.editor-istoric')).some((f) => f.endsWith('__editii__2026-11-23.yml')));
    assert.ok(!readFileSync(join(d, 'dist', 'change-agility-exemplu-trainer.html'), 'utf8').includes('pauza-cafea#pauza'), 'materialul e refăcut din agenda nouă');
    // Fără nicio piesă produsă cu „Da” în blocuri: agenda rămâne
    writeFileSync(join(d, 'masa.yml'), 'candidate:\n  - { id: idee-noua, titlu: "Idee", durata: 10, verdict: da, bloc: 1 }\n');
    const g = await cere(e, { metoda: 'POST', cale: '/api/masa/agenda', token: e.token, corp: { hash: hash(citeste(d, 'masa.yml')) } });
    assert.equal(g.cod, 422); assert.equal(citeste(d, ed), dupa);
    // Creează masa.yml
    rmSync(join(d, 'masa.yml'));
    const c = await cere(e, { metoda: 'POST', cale: '/api/masa/creeaza', token: e.token, corp: {} });
    assert.equal(c.cod, 200, c.text);
    assert.match(citeste(d, 'masa.yml'), /^# Masa \(etapa A\)[\s\S]*- id: deschidere\n    titlu: De ce suntem aici\n/);
  } finally { await e.inchide(); }
});
