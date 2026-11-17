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
test('bloc scris greșit (:::sal)', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace(':::sala cronometru', ':::sal cronometru')), /bloc necunoscut/));
test('atribut necunoscut', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('cronometru=10', 'timp=10')), /atribut necunoscut/));
test('nota trainerului copiată în textul de citit', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s + '\nDesenează curba pe flipchart, fără nume de etape la început.\n'), /exportul conține text din .*:::trainer/));
test('instrucțiunile din sală copiate în textul de citit', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s + '\nScrie un pas care durează sub 30 de minute.\n'), /exportul conține text din .*:::sala/));
test('schița are 4 puncte', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('  - "Întrebarea: unde ești tu acum?"', '  - "Întrebarea: unde ești tu acum?"\n  - "Al patrulea"')), /cel mult 3/));
test('un punct din schiță are peste 8 cuvinte', () => opreste((e) => e('01-deschidere.md', (s) => s.replace('"Cine suntem, ce facem azi"', '"Cine suntem noi și ce facem azi toată ziua aici"')), /cel mult 8/));
test('modulele nu încap în zi', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('durata: 40', 'durata: 140')), /nu încap/));
test('cronometru mai lung decât modulul', () => opreste((e) => e('01-deschidere.md', (s) => s.replace('cronometru=5', 'cronometru=25')), /mai lung decât modulul/));
test('imagine de pe internet', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', '![x](https://exemplu.ro/x.png)')), /e pe internet/));
test('imagine care lipsește', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', '![x](materiale/lipsa.png)')), /nu există/));
test('numele clientului în cursul participanților', () => opreste((e) => e('05-inchidere.md', (s) => s + '\nMulțumim echipei de la Firma Exemplu.\n'), /nume interzis/));
test('numele clientului fără diacritice / cu alte majuscule e prins', () => opreste((e) => e('05-inchidere.md', (s) => s + '\nCu drag, ion exemplescu.\n'), /nume interzis/));
test('sari_peste cu un id greșit', () => opreste((e) => e('editii/2026-11-23.yml', (s) => s.replace('sari_peste: []', 'sari_peste: [nu-exista]')), /sari_peste/));
test('lipsește un câmp obligatoriu', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace(/ancora: .*\n/, '')), /lipsește „ancora”/));
test('id dublat', () => opreste((e) => e('05-inchidere.md', (s) => s.replace('id: inchidere', 'id: curba')), /mai e folosit/));

test('numele clientului poate sta în nota trainerului', () => {
  const r = cu((e) => e('05-inchidere.md', (s) => s.replace(':::trainer\n', ':::trainer\nSpune-i lui Ion Exemplescu mulțumesc.\n')));
  assert.equal(r.ok, true, r.erori?.join('\n'));
});
test('un modul sărit la ediție nu are ecrane și nu ocupă timp', () => {
  const r = cu((e) => e('editii/2026-11-23.yml', (s) => s.replace('sari_peste: []', 'sari_peste: [pasul-de-luni]')));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  const html = readFileSync(r.fisiere[1], 'utf8');
  const date = JSON.parse(html.match(/<script type="application\/json" id="date-curs">([\s\S]*?)<\/script>/)[1]);
  assert.equal(date.ecrane.length, 10);
  assert.equal(date.module.find((m) => m.id === 'inchidere').start, 10 * 60 + 25);
});
test('un ecran lung dă doar avertisment', () => {
  const r = cu((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', 'unu doi trei patru cinci șase șapte opt nouă zece '.repeat(4))));
  assert.equal(r.ok, true);
  assert.ok(r.avertismente.some((a) => /sub 30/.test(a)));
});
