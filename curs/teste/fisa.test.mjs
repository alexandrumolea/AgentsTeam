// Fișa piesei din Harvest (2026-11-19): sursa (harvest/ → piese/ → nimic), randarea sigură, id-urile interzise, build-ul și editorul.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, mkdirSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { request } from 'node:http';
import { fisaPiesei } from '../lib/fisa.mjs';
import { build } from '../build.mjs';
import { pornesteEditor } from '../editor.mjs';

const EXEMPLU = join(dirname(fileURLToPath(import.meta.url)), '..', 'exemple', 'change-agility-exemplu');
const copie = () => { const d = mkdtempSync(join(tmpdir(), 'curs-fisa-')); cpSync(EXEMPLU, d, { recursive: true, filter: (f) => !f.includes('/dist') }); return d; };
const FISA = `# Harta emoțiilor
- **ID:** harta-emotiilor

## Ce mi-a dat Alex
> O idee din sală.

## Pentru trainer
Sursa: [studiul](https://example.com/studiu?a=1&b=2), o adresă goală https://example.org/x și una relativă [aici](materiale/x.md).
<script>alert(1)</script>
<img src=x onerror="alert(2)">

[rău](javascript:alert(3)) [rău2](data:text/html,<b>x</b>)
`;
const scrie = (d, id, text) => { mkdirSync(join(d, 'harvest'), { recursive: true }); writeFileSync(join(d, 'harvest', `${id}.md`), text); };

test('fișa din harvest/<id>.md: Markdown randat, HTML brut escapat, linkurile externe în tab nou', () => {
  const d = copie(); scrie(d, 'harta-emotiilor', FISA);
  const f = fisaPiesei(d, 'harta-emotiilor');
  assert.equal(f.sursa, 'harvest'); assert.equal(f.fisier, 'harvest/harta-emotiilor.md');
  assert.match(f.html, /<h2[^>]*>Ce mi-a dat Alex<\/h2>/);
  assert.match(f.html, /<blockquote>/);
  assert.match(f.html, /<strong>ID:<\/strong>/);
  assert.match(f.html, /<a href="https:\/\/example\.com\/studiu\?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">studiul<\/a>/);
  assert.match(f.html, /<a href="https:\/\/example\.org\/x" target="_blank" rel="noopener noreferrer">/, 'adresa goală devine link în tab nou');
  assert.match(f.html, /<a href="materiale\/x\.md">aici<\/a>/, 'linkul relativ rămâne în aceeași fereastră');
  assert.ok(!/<script|<img|<b>|href="(javascript|data):/i.test(f.html), f.html);
  assert.match(f.html, /&lt;img src=x onerror=&quot;alert\(2\)&quot;&gt;/, 'HTML-ul brut apare ca text');
  assert.match(f.html, /<p>rău rău2<\/p>/, 'linkurile javascript: și data: rămân doar text');
  assert.match(f.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
});

test('fără fișă: piesa produsă (antetul ca listă, apoi blocurile); fără nimic: sursa null', () => {
  const d = copie();
  const p = fisaPiesei(d, 'perechi-curba');
  assert.equal(p.sursa, 'piesa'); assert.equal(p.fisier, 'piese/perechi-curba.md'); assert.equal(p.titlu, 'Unde sunt eu pe curbă');
  assert.match(p.html, /<dl class="fisa-antet">[\s\S]*<dt>Durată<\/dt><dd>15 min<\/dd>[\s\S]*<dt>Format<\/dt><dd>perechi<\/dd>/);
  assert.match(p.html, /<dt>Materiale<\/dt><dd>post-it-uri în 3 culori, worksheet Curba mea<\/dd>/);
  assert.match(p.html, /Ecran în sală · cronometru 10 min[\s\S]*Nota trainerului[\s\S]*Pentru participant/);
  assert.ok(!/:::/.test(p.html), 'marcajele blocurilor nu apar ca text');
  assert.equal(fisaPiesei(d, 'curba').sursa, 'piesa', 'un modul cu acest id contează ca piesă produsă');
  const n = fisaPiesei(d, 'harta-emotiilor');
  assert.equal(n.sursa, null); assert.equal(n.html, '');
  scrie(d, 'perechi-curba', '# Fișa\nText nou.');
  assert.equal(fisaPiesei(d, 'perechi-curba').sursa, 'harvest', 'fișa din harvest/ are întâietate');
});

test('id-uri interzise: fără path traversal, fără căi absolute, fără litere mari', () => {
  const d = copie();
  for (const id of ['../curs', '..', '../../etc/passwd', 'harvest/../curs', '/etc/passwd', 'piese/model-curba', 'Curba', '', 'a..b', 'x%2f..', 'curba\0', 'curba.md', null, undefined]) {
    assert.throws(() => fisaPiesei(d, id), (e) => e.cod === 400, String(id));
  }
});

test('o legătură simbolică în harvest/ spre afara cursului nu e citită ca fișă', () => {
  const d = copie(), afara = mkdtempSync(join(tmpdir(), 'curs-afara-'));
  writeFileSync(join(afara, 'secret.md'), 'SECRET');
  mkdirSync(join(d, 'harvest'));
  symlinkSync(join(afara, 'secret.md'), join(d, 'harvest', 'harta-emotiilor.md'));
  assert.throws(() => fisaPiesei(d, 'harta-emotiilor'), (e) => e.cod === 403);
});

test('fișierul offline include fișele la build, are dialogul și nu conține codul editorului', () => {
  const d = copie(); scrie(d, 'harta-emotiilor', FISA);
  const r = build(d, { log: () => {} }); assert.equal(r.ok, true, r.erori?.join('\n'));
  const h = readFileSync(r.fisiere[1], 'utf8');
  const fise = JSON.parse(h.match(/<script type="application\/json" id="fise">([\s\S]*?)<\/script>/)[1]);
  assert.equal(fise['harta-emotiilor'].sursa, 'harvest');
  assert.equal(fise['perechi-curba'].sursa, 'piesa');
  assert.ok(!('nu-exista' in fise));
  assert.ok(!/<\/script>/i.test(h.match(/id="fise">([\s\S]*?)<\/script>/)[1]), 'textul fișelor nu poate închide scriptul');
  assert.match(h, /<dialog class="fisa-dialog" id="fisa-dialog"/);
  assert.ok(!h.includes('__EDITOR') && !h.includes('editor-client'));
});

function cere(e, cale, token) {
  const port = e.server.address().port;
  return new Promise((ok, rau) => {
    const r = request({ host: '127.0.0.1', port, path: cale, headers: { Host: `127.0.0.1:${port}`, ...(token ? { 'X-Editor-Token': token } : {}) } },
      (res) => { let t = ''; res.setEncoding('utf8'); res.on('data', (x) => { t += x; }); res.on('end', () => ok({ cod: res.statusCode, json: JSON.parse(t) })); });
    r.on('error', rau); r.end();
  });
}
test('editorul: /api/fisa cere token, validează id-ul și recitește fișa de pe disc la fiecare deschidere', async () => {
  const d = copie(), e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    assert.equal((await cere(e, '/api/fisa?id=perechi-curba')).cod, 403, 'fără token');
    assert.equal((await cere(e, '/api/fisa?id=perechi-curba', 'gresit')).cod, 403, 'token greșit');
    for (const id of ['..%2Fcurs', '../../etc/passwd', '%2Fetc%2Fpasswd', 'harvest%2F..%2Fcurs']) {
      assert.equal((await cere(e, `/api/fisa?id=${id}`, e.token)).cod, 400, id);
    }
    assert.equal((await cere(e, '/api/fisa', e.token)).cod, 400, 'fără id');
    assert.equal((await cere(e, '/api/fisa?id=harta-emotiilor', e.token)).json.sursa, null);
    scrie(d, 'harta-emotiilor', '# Scrisă acum de Irina'); // fără build
    const j = (await cere(e, '/api/fisa?id=harta-emotiilor', e.token)).json;
    assert.equal(j.sursa, 'harvest'); assert.match(j.html, /Scrisă acum de Irina/);
  } finally { await e.inchide(); }
});

// ---------- Editarea fișei (Alex, 2026-11-20) ----------
import { parse as parseYaml } from 'yaml';
import { scrieFisa, fisaDeEditat, sablonFisa, idDinTitlu, MAX_FISA } from '../lib/fisa.mjs';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { createHash } from 'node:crypto';
const sha = (t) => createHash('sha256').update(t).digest('hex');
const citeste = (d, rel) => readFileSync(join(d, rel), 'utf8');
function posteaza(e, cale, corp, token = e.token) {
  const port = e.server.address().port, text = JSON.stringify(corp);
  return new Promise((ok, rau) => {
    const r = request({ host: '127.0.0.1', port, path: cale, method: 'POST', headers: { Host: `127.0.0.1:${port}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(text), ...(token ? { 'X-Editor-Token': token } : {}) } },
      (res) => { let t = ''; res.setEncoding('utf8'); res.on('data', (x) => { t += x; }); res.on('end', () => ok({ cod: res.statusCode, json: JSON.parse(t || '{}') })); });
    r.on('error', rau); r.end(text);
  });
}

test('șablonul are secțiunile D-078, în ordine', () => {
  const t = sablonFisa({ id: 'x', titlu: 'Titlul', durata: 15, tip: 'exercitiu' }, '2026-11-20');
  const s = [...t.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.deepEqual(s, ['Input-ul lui Alex', 'Pe scurt', 'Obiectivul piesei', 'Knowledge', 'Micro-comportamentul', 'Experiența', 'Integrarea', 'Materiale necesare', 'Research-ul pentru trainer', 'Întrebare pentru Alex']);
  assert.match(t, /^# Titlul\n- \*\*ID:\*\* x\n/); assert.match(t, /\*\*Fel:\*\* exercițiu · \*\*Durată:\*\* 15 min/);
});

test('scrieFisa: fișă nouă, apoi suprascriere cu copie în istoric; conflict la hash vechi sau la fișă apărută între timp', () => {
  const d = copie();
  const f0 = fisaDeEditat(d, 'harta-emotiilor', { titlu: 'Harta' });
  assert.equal(f0.exista, false); assert.equal(f0.hash, null); assert.match(f0.md, /^# Harta/);
  const s1 = scrieFisa(d, 'harta-emotiilor', 'Prima\r\nvariantă   \n\n', null);
  assert.equal(s1.copie, null); assert.equal(citeste(d, 'harvest/harta-emotiilor.md'), 'Prima\nvariantă\n');
  assert.throws(() => scrieFisa(d, 'harta-emotiilor', 'Altceva', null), (e) => e.cod === 409 && e.conflict.fisa && e.conflict.hash === s1.hash, 'a apărut între timp');
  assert.throws(() => scrieFisa(d, 'harta-emotiilor', 'Altceva', 'vechi'), (e) => e.cod === 409);
  writeFileSync(join(d, 'harvest', 'harta-emotiilor.md'), 'Scris de Daria\n'); // un agent scrie între timp
  assert.throws(() => scrieFisa(d, 'harta-emotiilor', 'Al meu', s1.hash), (e) => e.cod === 409 && e.conflict.md === 'Scris de Daria\n');
  assert.equal(citeste(d, 'harvest/harta-emotiilor.md'), 'Scris de Daria\n', 'nu a suprascris');
  const s2 = scrieFisa(d, 'harta-emotiilor', 'Al meu', sha('Scris de Daria\n'));
  assert.match(s2.copie, /^\.editor-istoric\/.+__harvest__harta-emotiilor\.md$/);
  assert.equal(citeste(d, s2.copie), 'Scris de Daria\n'); assert.equal(citeste(d, 'harvest/harta-emotiilor.md'), 'Al meu\n');
  assert.equal(scrieFisa(d, 'harta-emotiilor', 'Al meu\n', s2.hash).neschimbat, true);
  rmSync(join(d, 'harvest', 'harta-emotiilor.md'));
  assert.throws(() => scrieFisa(d, 'harta-emotiilor', 'x', s2.hash), (e) => e.cod === 409, 'ștearsă între timp');
});

test('scrieFisa: fără path traversal, fără legături simbolice, fără texte uriașe sau goale', () => {
  const d = copie(), afara = mkdtempSync(join(tmpdir(), 'curs-afara-'));
  for (const id of ['../curs', '..', '../../etc/passwd', '/etc/passwd', 'harvest/../curs', 'Curba', '', 'a.md', null]) {
    assert.throws(() => scrieFisa(d, id, 'x', null), (e) => e.cod === 400, String(id));
  }
  assert.throws(() => scrieFisa(d, 'x', 'a'.repeat(MAX_FISA + 1), null), (e) => e.cod === 413);
  assert.throws(() => scrieFisa(d, 'x', '   \n', null), (e) => e.cod === 400);
  assert.throws(() => scrieFisa(d, 'x', 'a\0b', null), (e) => e.cod === 400);
  assert.throws(() => scrieFisa(d, 'x', 42, null), (e) => e.cod === 400);
  mkdirSync(join(d, 'harvest'));
  writeFileSync(join(afara, 'secret.md'), 'SECRET');
  symlinkSync(join(afara, 'secret.md'), join(d, 'harvest', 'leg.md'));
  assert.throws(() => scrieFisa(d, 'leg', 'x', null), (e) => e.cod === 403);
  assert.equal(readFileSync(join(afara, 'secret.md'), 'utf8'), 'SECRET');
  const d2 = copie(); symlinkSync(afara, join(d2, 'harvest'));
  assert.throws(() => scrieFisa(d2, 'nou', 'x', null), (e) => e.cod === 403, 'harvest/ e o legătură spre afară');
  assert.ok(!existsSync(join(afara, 'nou.md')));
});

test('idDinTitlu: fără diacritice, unic, scurt', () => {
  assert.equal(idDinTitlu('Ce ține de mine?'), 'ce-tine-de-mine');
  assert.equal(idDinTitlu('Ce ține de mine', new Set(['ce-tine-de-mine', 'ce-tine-de-mine-2'])), 'ce-tine-de-mine-3');
  assert.equal(idDinTitlu('../../etc/passwd'), 'etc-passwd');
  assert.equal(idDinTitlu('—'), 'piesa');
  assert.ok(idDinTitlu('cuvânt '.repeat(30)).length <= 60);
});

test('editorul: salvează fișa și câmpurile rândului (comentariile rămân), conflicte, token, piesă nouă', async () => {
  const d = copie(), e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    const src = (await cere(e, '/api/fisa/sursa?id=harta-emotiilor', e.token)).json;
    assert.equal(src.exista, false); assert.match(src.md, /## Input-ul lui Alex/);
    assert.deepEqual(src.campuri, { titlu: 'Harta emoțiilor din echipă', scop: '[EXEMPLU] Ce simte grupul, pe un perete', durata: 15, tip: 'exercitiu' });
    assert.equal((await cere(e, '/api/fisa/sursa?id=..%2Fcurs', e.token)).cod, 400);
    assert.equal((await posteaza(e, '/api/fisa/salveaza', { id: 'harta-emotiilor', md: 'x', hash: null }, null)).cod, 403, 'fără token');
    assert.equal((await posteaza(e, '/api/fisa/salveaza', { id: '../curs', md: 'x', hash: null })).cod, 400);
    const yml0 = citeste(d, 'harvest.yml');
    const s = await posteaza(e, '/api/fisa/salveaza', { id: 'harta-emotiilor', md: src.md.replace('## Pe scurt\n', '## Pe scurt\nScris de Alex.\n'), hash: null,
      campuri: { titlu: 'Harta emoțiilor', durata: 20, scop: '', tip: 'challenge' }, campuriInainte: src.campuri });
    assert.equal(s.cod, 200, JSON.stringify(s.json));
    assert.match(citeste(d, 'harvest/harta-emotiilor.md'), /Scris de Alex/);
    assert.match(s.json.fisa.html, /Scris de Alex/);
    const yml = citeste(d, 'harvest.yml');
    assert.match(yml, /^# \[EXEMPLU\] Harvest/, 'comentariile de sus rămân');
    assert.match(yml, /id: harta-emotiilor\n\s+titlu: "Harta emoțiilor"\n\s+durata: 20\n\s+tip: challenge\n/, 'scopul gol iese din rând; ghilimelele rămân');
    assert.match(yml, /nota: "\[EXEMPLU\] De scris piesa; Irina are două variante\."/, 'restul rândului rămâne');
    const alte = (t) => JSON.stringify(parseYaml(t).candidate.filter((x) => x.id !== 'harta-emotiilor'));
    assert.equal(alte(yml), alte(yml0), 'celelalte rânduri au aceleași valori');
    assert.ok(s.json.copieMasa && existsSync(join(d, s.json.copieMasa)));
    assert.equal(s.json.sursa.hashMasa, sha(yml));
    assert.ok(readFileSync(e.ultim().fisiere[1], 'utf8').includes('Harta emoțiilor'), 'materialul e refăcut');
    // conflict pe fișă: hash vechi
    const c1 = await posteaza(e, '/api/fisa/salveaza', { id: 'harta-emotiilor', md: 'Altceva', hash: null });
    assert.equal(c1.cod, 409); assert.equal(c1.json.conflict.fisa, true); assert.equal(c1.json.conflict.hash, s.json.sursa.hash);
    // conflict pe rând: un agent a schimbat durata între timp
    writeFileSync(join(d, 'harvest.yml'), yml.replace('titlu: "Harta emoțiilor"\n    durata: 20', 'titlu: "Harta emoțiilor"\n    durata: 25'));
    const c2 = await posteaza(e, '/api/fisa/salveaza', { id: 'harta-emotiilor', md: 'Al meu', hash: s.json.sursa.hash, campuri: { durata: 30 }, campuriInainte: s.json.sursa.campuri });
    assert.equal(c2.cod, 409); assert.equal(c2.json.conflict.campuri.durata, 25);
    assert.match(citeste(d, 'harvest/harta-emotiilor.md'), /Scris de Alex/, 'la conflictul pe rând, nici fișa nu se scrie');
    // câmp greșit: refuzat, nimic scris
    const g = await posteaza(e, '/api/fisa/salveaza', { id: 'harta-emotiilor', md: 'Al meu', hash: s.json.sursa.hash, campuri: { tip: 'dans' }, campuriInainte: { tip: 'challenge' } });
    assert.equal(g.cod, 400); assert.match(citeste(d, 'harvest/harta-emotiilor.md'), /Scris de Alex/);
    assert.equal((await posteaza(e, '/api/fisa/salveaza', { id: 'harta-emotiilor', md: 'x', hash: s.json.sursa.hash, campuri: { titlu: '' }, campuriInainte: { titlu: 'Harta emoțiilor' } })).cod, 400);
    // piesă nouă
    const n = await posteaza(e, '/api/fisa/noua', { titlu: 'Harta emoțiilor', durata: 10, tip: 'exercitiu', scop: 'Un perete' });
    assert.equal(n.cod, 200, JSON.stringify(n.json)); assert.equal(n.json.id, 'harta-emotiilor-2', 'id unic, fără să atingă piesa existentă');
    assert.match(citeste(d, 'harvest.yml'), /- id: harta-emotiilor-2\n\s+titlu: Harta emoțiilor\n\s+scop: Un perete\n\s+durata: 10\n\s+tip: exercitiu\n\s+sursa: Alex\n\s+verdict: nou/);
    assert.match(citeste(d, 'harvest/harta-emotiilor-2.md'), /^# Harta emoțiilor\n- \*\*ID:\*\* harta-emotiilor-2[\s\S]*## Întrebare pentru Alex/);
    assert.equal((await posteaza(e, '/api/fisa/noua', { titlu: 'Fără durată' })).cod, 400);
    assert.equal((await posteaza(e, '/api/fisa/noua', { titlu: '  ', durata: 5 })).cod, 400);
    assert.equal(fiseNr(d), 2, 'cererile refuzate nu lasă fișe');
  } finally { await e.inchide(); }
});
const fiseNr = (d) => readdirSync(join(d, 'harvest')).length;

test('editorul: fără harvest.yml, fișa se poate scrie, câmpurile și „Piesă nouă” nu', async () => {
  const d = copie(); rmSync(join(d, 'harvest.yml'));
  const e = await pornesteEditor({ folder: d, port: 0, log: () => {} });
  try {
    const src = (await cere(e, '/api/fisa/sursa?id=perechi-curba', e.token)).json;
    assert.equal(src.areMasa, false);
    assert.equal((await posteaza(e, '/api/fisa/salveaza', { id: 'perechi-curba', md: '# Fișa\n', hash: null })).cod, 200);
    assert.equal((await posteaza(e, '/api/fisa/salveaza', { id: 'perechi-curba', md: '# Fișa\n', hash: sha('# Fișa\n'), campuri: { durata: 3 }, campuriInainte: { durata: src.campuri?.durata } })).cod, 404);
    assert.equal((await posteaza(e, '/api/fisa/noua', { titlu: 'X', durata: 5 })).cod, 404);
    assert.ok(!existsSync(join(d, 'harvest.yml')));
  } finally { await e.inchide(); }
});
