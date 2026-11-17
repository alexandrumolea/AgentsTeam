// Verificările din 1.6: fiecare greșeală trebuie să oprească build-ul și să nu scrie nimic.
//   npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../build.mjs';

const EXEMPLU = join(dirname(fileURLToPath(import.meta.url)), '..', 'exemple', 'change-agility-exemplu');

/** Copiază exemplul, aplică o schimbare, rulează build-ul. */
function cu(schimba) {
  const dir = mkdtempSync(join(tmpdir(), 'curs-'));
  cpSync(EXEMPLU, dir, { recursive: true, filter: (f) => !f.includes('/dist') });
  const fis = (n) => join(dir, n);
  const edit = (n, f) => writeFileSync(fis(n), f(readFileSync(fis(n), 'utf8')));
  schimba(edit, fis);
  const out = join(dir, 'iesire');
  return { ...build(dir, { out, log: () => {} }), out };
}
function opreste(schimba, regula) {
  const r = cu(schimba);
  assert.equal(r.ok, false, 'build-ul trebuia să se oprească');
  assert.ok(r.erori.some((e) => regula.test(e)), `nicio eroare potrivită cu ${regula}:\n${r.erori.join('\n')}`);
  assert.equal(existsSync(r.out), false, 'un build oprit nu scrie nimic');
}

test('exemplul trece, iar exportul nu conține :::trainer, :::sala sau ediția', () => {
  const r = cu(() => {});
  assert.equal(r.ok, true, r.erori?.join('\n'));
  const json = readFileSync(r.fisiere[0], 'utf8');
  for (const interzis of ['Salută fiecare om la ușă', 'Pune un post-it pe curbă', 'Dacă grupul tace', 'Grup de 14 oameni', 'cronometru', 'ancora', 'schita']) {
    assert.ok(!json.includes(interzis), `exportul conține „${interzis}”`);
  }
  for (const permis of ['Ce simți în prima săptămână', 'materiale/curba.png', 'worksheet-ul „Curba mea”']) assert.ok(json.includes(permis), `lipsește „${permis}”`);
  assert.ok(!JSON.parse(json).module.some((m) => m.tip === 'pauza'), 'pauza nu e pagină în curs');
});

test('bloc neînchis', () => opreste((e) => e('05-inchidere.md', (s) => s.replace(/:::\n\nCursul/, '\nCursul')), /nu e închis/));
test('bloc în bloc', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace(':::trainer\n', ':::trainer\n:::sala\n')), /în interiorul/));
test('bloc scris greșit (:::traner)', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace(':::trainer', ':::traner')), /bloc necunoscut „:::traner”/));
test('bloc scris greșit (:::sal)', () => opreste((e) => e('exercitii/perechi-curba.md', (s) => s.replace(':::sala cronometru', ':::sal cronometru')), /bloc necunoscut/));
test('atribut necunoscut', () => opreste((e) => e('exercitii/perechi-curba.md', (s) => s.replace('cronometru=10', 'timp=10')), /atribut necunoscut/));
test('nota trainerului copiată în textul de citit', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s + '\nDesenează curba pe flipchart, fără nume de etape la început.\n'), /exportul conține text din .*:::trainer/));
test('instrucțiunile din sală copiate în textul de citit', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s + '\nScrie un pas care durează sub 30 de minute.\n'), /exportul conține text din .*:::sala/));
test('schița are 4 puncte', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('  - "Întrebarea: unde ești tu acum?"', '  - "Întrebarea: unde ești tu acum?"\n  - "Al patrulea"')), /cel mult 3/));
test('un punct din schiță are peste 8 cuvinte', () => opreste((e) => e('01-deschidere.md', (s) => s.replace('"Cine suntem, ce facem azi"', '"Cine suntem noi și ce facem azi toată ziua aici"')), /cel mult 8/));
test('modulele nu încap în zi', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('durata: 40', 'durata: 140')), /nu încap/));
test('cronometru mai lung decât modulul', () => opreste((e) => e('01-deschidere.md', (s) => s.replace('cronometru=5', 'cronometru=25')), /mai lung decât durata/));
test('imagine de pe internet', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', '![x](https://exemplu.ro/x.png)')), /e pe internet/));
test('imagine care lipsește', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', '![x](materiale/lipsa.png)')), /nu există/));
test('numele clientului în cursul participanților', () => opreste((e) => e('05-inchidere.md', (s) => s + '\nMulțumim echipei de la Firma Exemplu.\n'), /nume interzis/));
test('numele clientului fără diacritice / cu alte majuscule e prins', () => opreste((e) => e('05-inchidere.md', (s) => s + '\nCu drag, ion exemplescu.\n'), /nume interzis/));
test('sari_peste din v1 e respins (agenda îl înlocuiește)', () => opreste((e) => e('editii/2026-11-23.yml', (s) => s + 'sari_peste: []\n'), /sari_peste/));
test('lipsește un câmp obligatoriu', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace(/ancora: .*\n/, '')), /lipsește „ancora”/));
test('id dublat', () => opreste((e) => e('05-inchidere.md', (s) => s.replace('id: inchidere', 'id: curba')), /mai e folosit/));

test('numele clientului poate sta în nota trainerului', () => {
  const r = cu((e) => e('05-inchidere.md', (s) => s.replace(':::trainer\n', ':::trainer\nSpune-i lui Ion Exemplescu mulțumesc.\n')));
  assert.equal(r.ok, true, r.erori?.join('\n'));
});
const AG = (rand) => (e) => e('editii/2026-11-23.yml', (s) => s.replace(/agenda:[\s\S]*?\nnume_interzise/, `agenda:\n${rand}\nnume_interzise`));
const date = (r) => JSON.parse(readFileSync(r.fisiere[1], 'utf8').match(/<script type="application\/json" id="date-curs">([\s\S]*?)<\/script>/)[1]);
const exportul = (r) => readFileSync(r.fisiere[0], 'utf8');

test('un modul scos din agendă nu are ecrane și nu ocupă timp', () => {
  const r = cu(AG('  - deschidere\n  - curba\n  - pauza: 15\n  - inchidere'));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  const d = date(r);
  assert.equal(d.ecrane.length, 10);
  assert.equal(d.module.at(-1).start, 10 * 60 + 25);
  assert.ok(!exportul(r).includes('Pasul de luni'), 'un modul din afara agendei nu intră în cursul online');
});
test('agenda lipsă = toate modulele, cu exercițiile implicite', () => {
  const r = cu((e) => e('editii/2026-11-23.yml', (s) => s.replace(/agenda:[\s\S]*?\nnume_interzise/, 'nume_interzise')));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.equal(date(r).module.length, 4);
  assert.ok(exportul(r).includes('Unde sunt eu pe curbă'));
});
test('alternativa aleasă în ediție înlocuiește implicitul, iar orele se recalculează', () => {
  const r = cu(AG('  - deschidere\n  - modul: curba\n    exercitii: [plimbare-curba]\n  - pauza: 15\n  - pasul-de-luni\n  - inchidere'));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  const d = date(r), j = exportul(r);
  assert.equal(d.module[1].durata, 55);
  assert.equal(d.module[2].start, 9 * 60 + 20 + 55);
  assert.ok(j.includes('Curba de pe podea') && !j.includes('Unde sunt eu pe curbă'));
  assert.ok(!j.includes('Mergi pe curba de pe podea'), ':::sala din exercițiu nu ajunge în curs');
});
test('exercitii: [] = modulul fără exercițiu', () => {
  const r = cu(AG('  - deschidere\n  - modul: curba\n    exercitii: []\n  - inchidere'));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.equal(date(r).module[1].durata, 35);
});
test('un exercițiu cu in_curs: nu e în sală, dar nu în cursul online', () => {
  const r = cu(AG('  - deschidere\n  - modul: inchidere\n    exercitii: [ridica-te-daca]'));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.ok(date(r).ecrane.some((x) => x.html.includes('Ridică-te dacă')));
  assert.ok(!exportul(r).includes('Ridică-te'));
});
test('banca întreagă e în materialul trainerului, nu în export', () => {
  const r = cu(() => {});
  const html = readFileSync(r.fisiere[1], 'utf8');
  assert.ok(html.includes('id="ex-plimbare-curba"') && html.includes('id="ex-ridica-te-daca"'));
  assert.ok(!exportul(r).includes('Curba de pe podea'));
});
test('agenda: modul inexistent', () => opreste(AG('  - deschidere\n  - nu-exista'), /modulul „nu-exista” nu există/));
test('agenda: modul de două ori', () => opreste(AG('  - deschidere\n  - curba\n  - deschidere'), /de două ori/));
test('agenda: exercițiu inexistent', () => opreste(AG('  - modul: curba\n    exercitii: [nu-exista]'), /exercițiul „nu-exista” nu există/));
test('agenda: rând care nu e nici modul, nici pauză', () => opreste(AG('  - deschidere\n  - prânz: 60'), /un rând din agendă/));
test('agenda: pauza nu e un număr', () => opreste(AG('  - deschidere\n  - pauza: zece'), /număr de minute/));
test('agenda nu încape în zi', () => opreste(AG('  - deschidere\n  - pauza: 200'), /nu încape/));
test('modul: implicit inexistent', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('implicite: [perechi-curba]', 'implicite: [perechi-curb]')), /„perechi-curb” .*nu există/));
test('modul: același exercițiu și implicit, și alternativă', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('alternative: [plimbare-curba]', 'alternative: [plimbare-curba, perechi-curba]')), /și în implicite, și în alternative/));
test('exercițiu: format necunoscut', () => opreste((e) => e('exercitii/plimbare-curba.md', (s) => s.replace('format: grup', 'format: echipe')), /format „echipe”/));
test('exercițiu: energie necunoscută', () => opreste((e) => e('exercitii/plimbare-curba.md', (s) => s.replace('energie: activ', 'energie: mare')), /energie „mare”/));
test('exercițiu: lipsește obiectivul', () => opreste((e) => e('exercitii/plimbare-curba.md', (s) => s.replace(/obiectiv: .*\n/, '')), /lipsește „obiectiv”/));
test('exercițiu: „module” cu un id inexistent', () => opreste((e) => e('exercitii/plimbare-curba.md', (s) => s.replace('module: [curba]', 'module: [curbaa]')), /modulul „curbaa” .*nu există/));
test('exercițiu: cronometru mai lung decât exercițiul', () => opreste((e) => e('exercitii/perechi-curba.md', (s) => s.replace('cronometru=10', 'cronometru=16')), /mai lung decât durata/));
test('exercițiu: nota trainerului copiată în textul lui', () => opreste((e) => e('exercitii/perechi-curba.md', (s) => s + '\nFormează perechi între oameni care nu lucrează zilnic împreună.\n'), /exportul conține text din/));
test('marcaj scris greșit (::exercitiu)', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('::exercitii', '::exercitiu')), /nu e cunoscut/));
test('marcajul ::exercitii într-un exercițiu', () => opreste((e) => e('exercitii/perechi-curba.md', (s) => s + '\n::exercitii\n'), /doar într-un modul/));
test('avertisment: exercițiu ales la un modul care nu e în lista lui', () => {
  const r = cu(AG('  - deschidere\n  - modul: pasul-de-luni\n    exercitii: [perechi-curba]'));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.ok(r.avertismente.some((a) => /nu e în lista lui „module”/.test(a)));
});
test('avertisment: modul de peste 90 de minute fără pauză după', () => {
  const r = cu((e) => e('04-pasul-de-luni.md', (s) => s.replace('durata: 40', 'durata: 95')));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  assert.ok(r.avertismente.some((a) => /nu are o pauză după/.test(a)));
});
test('un ecran lung dă doar avertisment', () => {
  const r = cu((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', 'unu doi trei patru cinci șase șapte opt nouă zece '.repeat(4))));
  assert.equal(r.ok, true);
  assert.ok(r.avertismente.some((a) => /sub 30/.test(a)));
});
