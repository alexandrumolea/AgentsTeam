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
