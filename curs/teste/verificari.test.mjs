// Verificările din 1.6, 1.8 și 1.9 (v1.2, D-053): fiecare greșeală trebuie să oprească build-ul și să nu scrie nimic.
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
test('bloc scris greșit (:::sal)', () => opreste((e) => e('piese/perechi-curba.md', (s) => s.replace(':::sala cronometru', ':::sal cronometru')), /bloc necunoscut/));
test('atribut necunoscut', () => opreste((e) => e('piese/perechi-curba.md', (s) => s.replace('cronometru=10', 'timp=10')), /atribut necunoscut/));
test('nota trainerului copiată în textul de citit', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s + '\nLasă mâinile să se ridice. Nu cere povești încă.\n'), /exportul conține text din .*:::trainer/));
test('nota trainerului dintr-o piesă copiată în modul', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s + '\nDesenează curba fără nume de etape.\n'), /exportul conține text din piese\/model-curba.md.*:::trainer/));
test('instrucțiunile din sală copiate în textul de citit', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s + '\nScrie un pas care durează sub 30 de minute.\n'), /exportul conține text din .*:::sala/));
test('schița are 4 puncte', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('  - "Întrebarea: unde ești tu acum?"', '  - "Întrebarea: unde ești tu acum?"\n  - "Al patrulea"')), /cel mult 3/));
test('un punct din schiță are peste 8 cuvinte', () => opreste((e) => e('01-deschidere.md', (s) => s.replace('"Cine suntem, ce facem azi"', '"Cine suntem noi și ce facem azi toată ziua aici"')), /cel mult 8/));
test('agenda nu încape în zi (modul prea lung): avertisment și depășirea în material', () => {
  const r = cu((e) => e('04-pasul-de-luni.md', (s) => s.replace('durata: 40', 'durata: 140'))); ok(r);
  assert.ok(r.avertismente.some((a) => /nu încape/.test(a)));
  assert.match(html(r), /total-zi depasire/);
  assert.match(html(r), /depășire 45 min/);
});
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
const html = (r) => readFileSync(r.fisiere[1], 'utf8');
const exportul = (r) => readFileSync(r.fisiere[0], 'utf8');
const ok = (r) => assert.equal(r.ok, true, r.erori?.join('\n'));

// Agenda exemplului: deschidere 20, curba 10 + 20 + 15 = 45, pauza-cafea 15, ridica-te-daca 5, pasul-de-luni 40, pauza 10, inchidere 20 = 155 din 210.
test('totalurile: pe modul, pe zi și cât rămâne din durata_zi', () => {
  const r = cu(() => {}); ok(r);
  const d = date(r), h = html(r);
  assert.equal(d.module[1].durata, 45);
  assert.deepEqual(d.module.map((m) => m.start), [540, 560, 605, 620, 625, 665, 675]);
  assert.match(h, /Total: 2 h 35 min<\/b> din 3 h 30 min/);
  assert.match(h, /rămân <b>55 min<\/b> până la 12:30/);
  assert.match(h, /<span class="calcul">10 \+ 20 \+ 15<\/span>/);
  assert.match(h, /Azi · .*? · 5 min, 2% din zi/);
});
test('o zi plină exact e marcată', () => {
  const r = cu(AG('  - deschidere\n  - pauza: 190')); ok(r);
  assert.match(html(r), /total-zi plin/);
});
test('un modul scos din agendă nu are ecrane și nu ocupă timp', () => {
  const r = cu(AG('  - deschidere\n  - curba\n  - pauza: 15\n  - inchidere')); ok(r);
  const d = date(r);
  assert.equal(d.ecrane.length, 3 + 4 + 1 + 2);
  assert.equal(d.module.at(-1).start, 9 * 60 + 20 + 45 + 15);
  assert.ok(!exportul(r).includes('Pasul de luni'), 'un modul din afara agendei nu intră în cursul online');
});
test('agenda lipsă = toate modulele, cu piesele implicite', () => {
  const r = cu((e) => e('editii/2026-11-23.yml', (s) => s.replace(/agenda:[\s\S]*?\nnume_interzise/, 'nume_interzise'))); ok(r);
  assert.equal(date(r).module.length, 4);
  assert.ok(exportul(r).includes('Unde sunt eu pe curbă'));
});
test('alternativa aleasă în ediție înlocuiește implicitele, iar orele se recalculează', () => {
  const r = cu(AG('  - deschidere\n  - modul: curba\n    piese: [poveste-fuziune, plimbare-curba]\n  - pauza: 15\n  - inchidere')); ok(r);
  const d = date(r), j = exportul(r);
  assert.equal(d.module[1].durata, 10 + 10 + 20);
  assert.equal(d.module[2].start, 9 * 60 + 20 + 40);
  assert.ok(j.includes('Curba de pe podea') && j.includes('Povestea unei fuziuni') && !j.includes('Unde sunt eu pe curbă'));
  assert.ok(j.indexOf('Povestea unei fuziuni') < j.indexOf('Curba de pe podea'), 'ordinea din listă e ordinea din sală');
  assert.ok(!j.includes('Mergi pe curba de pe podea'), ':::sala din piesă nu ajunge în curs');
});
test('piese: [] = modulul fără piese (doar corpul lui)', () => {
  const r = cu(AG('  - deschidere\n  - modul: curba\n    piese: []\n  - inchidere')); ok(r);
  assert.equal(date(r).module[1].durata, 10);
});
test('o piesă singură în agendă: oră, ecrane, pagină în curs', () => {
  const r = cu(AG('  - poveste-fuziune\n  - deschidere')); ok(r);
  const d = date(r);
  assert.deepEqual([d.module[0].id, d.module[0].durata, d.module[1].start], ['poveste-fuziune', 10, 550]);
  assert.ok(d.ecrane[0].html.includes('Luna 1') && d.ecrane[0].note.length === 1, 'primul ecran e al piesei, cu nota ei');
  assert.equal(JSON.parse(exportul(r)).module[0].titlu, 'Povestea unei fuziuni');
});
test('o piesă singură fără ecrane primește un ecran cu titlul ei', () => {
  const r = cu((e, f) => { writeFileSync(f('piese/tacere.md'), '---\ntitlu: "Un minut de liniște"\ndurata: 2\ntip: reflectie\nformat: individual\nenergie: calm\nobiectiv: "Fiecare respiră"\n---\n\nRespiră.\n'); AG('  - tacere\n  - deschidere')(e); });
  ok(r);
  assert.ok(date(r).ecrane[0].html.includes('Un minut de liniște'));
});
test('pauza ca piesă: ecran cu cronometru, nu intră în curs, nu cere format/energie', () => {
  const r = cu(() => {}); ok(r);
  const d = date(r);
  const e = d.ecrane.find((x) => x.html.includes('Pauză de cafea'));
  assert.equal(e.cronometru, 15);
  assert.ok(!exportul(r).includes('Pauză de cafea'));
});
test('o piesă cu in_curs: nu e în sală, dar nu în cursul online', () => {
  const r = cu(() => {}); ok(r);
  assert.ok(date(r).ecrane.some((x) => x.html.includes('Ridică-te dacă')));
  assert.ok(!exportul(r).includes('Ridică-te'));
});
test('toată biblioteca e în materialul trainerului, cu familia și tipul; nu în export', () => {
  const r = cu(() => {}); ok(r);
  const h = html(r);
  for (const id of ['model-curba', 'perechi-curba', 'plimbare-curba', 'poveste-fuziune', 'pauza-cafea', 'ridica-te-daca']) assert.ok(h.includes(`id="ex-${id}"`), id);
  assert.match(h, /id="ex-model-curba" data-familie="continut" data-tip="model"/);
  assert.match(h, /id="ex-pauza-cafea" data-familie="punte" data-tip="pauza" data-format="" data-energie=""/);
  assert.ok(!exportul(r).includes('Povestea unei fuziuni'));
});
test('fără durata: build-ul se oprește (la orice piesă, și la pauză)', () => opreste((e) => e('piese/pauza-cafea.md', (s) => s.replace('durata: 15\n', '')), /lipsește „durata”/));
test('modulul fără durata se oprește', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace(/durata: 10 .*\n/, '')), /lipsește „durata”/));
test('agenda: id inexistent', () => opreste(AG('  - deschidere\n  - nu-exista'), /„nu-exista” nu e nici modul, nici piesă/));
test('agenda: modul de două ori', () => opreste(AG('  - deschidere\n  - curba\n  - deschidere'), /de două ori/));
test('agenda: piesă inexistentă la un modul', () => opreste(AG('  - modul: curba\n    piese: [nu-exista]'), /piesa „nu-exista” nu există/));
test('agenda: rând care nu e nici modul, nici piesă, nici pauză', () => opreste(AG('  - deschidere\n  - prânz: 60'), /un rând din agendă/));
test('agenda: pauza nu e un număr', () => opreste(AG('  - deschidere\n  - pauza: zece'), /număr de minute/));
test('agenda nu încape în zi (pauză prea lungă): avertisment, materialul se generează', () => {
  const r = cu(AG('  - deschidere\n  - pauza: 200')); ok(r);
  assert.ok(r.avertismente.some((a) => /nu încape/.test(a)));
  assert.match(html(r), /total-zi depasire/);
});
test('agenda: comun/… înainte să existe biblioteca comună', () => opreste(AG('  - deschidere\n  - comun/energizant'), /biblioteca comună/));
test('agenda: comun/… în piesele unui modul', () => opreste(AG('  - modul: curba\n    piese: [comun/model-curba]'), /biblioteca comună/));
test('agenda: „exercitii” rămas de la v1.1', () => opreste(AG('  - modul: curba\n    exercitii: [perechi-curba]'), /a devenit „piese”/));
test('modul: și „exercitii”, și „piese”', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('piese:\n', 'exercitii:\n  implicite: []\npiese:\n')), /rămas de la v1.1/));
test('folderul exercitii/ rămas de la v1.1', () => opreste((e, f) => writeFileSync(f('exercitii'), ''), /redenumit folderul în piese/));
test('marcajul vechi ::exercitii', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('::piese', '::exercitii')), /a devenit „::piese”/));
test('id folosit și de un modul, și de o piesă', () => opreste((e, f) => writeFileSync(f('piese/curba.md'), '---\ntitlu: "x"\ndurata: 5\ntip: model\n---\nx\n'), /unice în tot cursul/));
test('modul: implicit inexistent', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('implicite: [model-curba, perechi-curba]', 'implicite: [model-curba, perechi-curb]')), /„perechi-curb” .*nu există/));
test('modul: aceeași piesă și implicită, și alternativă', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('alternative: [plimbare-curba, poveste-fuziune]', 'alternative: [plimbare-curba, perechi-curba]')), /și în implicite, și în alternative/));
test('piesă: tip necunoscut', () => opreste((e) => e('piese/model-curba.md', (s) => s.replace('tip: model', 'tip: teorema')), /tip „teorema” necunoscut/));
test('activitate fără format', () => opreste((e) => e('piese/plimbare-curba.md', (s) => s.replace('format: grup\n', '')), /lipsește „format”.*activități/));
test('activitate fără energie', () => opreste((e) => e('piese/plimbare-curba.md', (s) => s.replace('energie: activ\n', '')), /lipsește „energie”/));
test('o piesă de conținut nu cere format, energie, obiectiv', () => ok(cu(() => {})));
test('piesă: format necunoscut', () => opreste((e) => e('piese/plimbare-curba.md', (s) => s.replace('format: grup', 'format: echipe')), /format „echipe”/));
test('piesă: energie necunoscută', () => opreste((e) => e('piese/plimbare-curba.md', (s) => s.replace('energie: activ', 'energie: mare')), /energie „mare”/));
test('piesă: „module” cu un id inexistent', () => opreste((e) => e('piese/plimbare-curba.md', (s) => s.replace('module: [curba]', 'module: [curbaa]')), /modulul „curbaa” .*nu există/));
test('piesă: cronometru mai lung decât piesa', () => opreste((e) => e('piese/perechi-curba.md', (s) => s.replace('cronometru=10', 'cronometru=16')), /mai lung decât durata/));
test('piesă: nota trainerului copiată în textul ei', () => opreste((e) => e('piese/perechi-curba.md', (s) => s + '\nFormează perechi între oameni care nu lucrează zilnic împreună.\n'), /exportul conține text din/));
test('marcaj scris greșit (::piesa)', () => opreste((e) => e('02-curba-schimbarii.md', (s) => s.replace('::piese', '::piesa')), /nu e cunoscut/));
test('marcajul ::piese într-o piesă', () => opreste((e) => e('piese/perechi-curba.md', (s) => s + '\n::piese\n'), /doar într-un modul/));
test('avertisment: piesă aleasă la un modul care nu e în lista ei', () => {
  const r = cu(AG('  - deschidere\n  - modul: pasul-de-luni\n    piese: [perechi-curba]')); ok(r);
  assert.ok(r.avertismente.some((a) => /nu e în lista ei „module”/.test(a)));
});
test('avertisment: modul de peste 90 de minute fără pauză după', () => {
  const r = cu((e) => { e('02-curba-schimbarii.md', (s) => s.replace(/durata: 10 .*\n/, 'durata: 30\n')); AG('  - modul: curba\n    piese: [model-curba, perechi-curba, plimbare-curba, poveste-fuziune]\n  - inchidere')(e); }); ok(r);
  assert.ok(r.avertismente.some((a) => /nu are o pauză după/.test(a)));
});
test('fără avertisment când după modulul lung vine o piesă-pauză', () => {
  const r = cu((e) => { e('02-curba-schimbarii.md', (s) => s.replace(/durata: 10 .*\n/, 'durata: 30\n')); AG('  - modul: curba\n    piese: [model-curba, perechi-curba, plimbare-curba, poveste-fuziune]\n  - pauza-cafea\n  - inchidere')(e); }); ok(r);
  assert.equal(date(r).module[0].durata, 95);
  assert.ok(!r.avertismente.some((a) => /nu are o pauză după/.test(a)));
});
test('un ecran lung dă doar avertisment', () => {
  const r = cu((e) => e('04-pasul-de-luni.md', (s) => s.replace('**Ce faci luni, între 9 și 10?**', 'unu doi trei patru cinci șase șapte opt nouă zece '.repeat(4))));
  assert.equal(r.ok, true);
  assert.ok(r.avertismente.some((a) => /sub 30/.test(a)));
});

// Obiectivele zilei (Alex, 2026-11-17)
const blocSchita = (h) => h.match(/<section id="schita"[\s\S]*?<\/section>\s*<\/section>|<section id="schita"[\s\S]*?<ol class="schita">/)[0];
test('obiectivele: din curs.yml, în Schiță și în schița de comandă, cu bife nebifate în fișier', () => {
  const r = cu(() => {}); ok(r);
  const h = html(r);
  assert.equal((h.match(/<section class="obiective"/g) || []).length, 2, 'Schița + schița din ecranul de comandă');
  assert.equal((h.match(/data-obiectiv="\d"/g) || []).length, 8);
  assert.ok(!/data-obiectiv="\d"[^>]*checked/.test(h), 'în fișier nicio bifă nu e pusă');
  assert.match(blocSchita(h), /0 din 4/);
});
test('obiectivele: legenda „→ ob.” la module și piese (modulul + piesele alese)', () => {
  const r = cu(() => {}); ok(r);
  const h = html(r);
  assert.match(h, /Ce se întâmplă cu noi când se schimbă ceva · 45 min \(10 \+ 20 \+ 15\) <span class="ob-leg"[^>]*>→ ob\. 1, 2<\/span>/);
  assert.match(h, /Pasul de luni · 40 min <span class="ob-leg"[^>]*>→ ob\. 3<\/span>/);
});
test('obiectivele: ediția le înlocuiește pe cele ale cursului', () => {
  const r = cu((e) => e('editii/2026-11-23.yml', (s) => s + 'obiective: ["Ce a cerut clientul"]\n')); ok(r);
  assert.deepEqual(JSON.parse(exportul(r)).obiective, ['Ce a cerut clientul']);
  assert.ok(r.avertismente.some((a) => /obiective conține 2, dar ziua are 1 obiectiv/.test(a)), 'indexurile peste listă dau avertisment');
});
test('obiectivele: în cursul participanților, ca listă simplă', () => {
  const r = cu(() => {}); ok(r);
  const j = JSON.parse(exportul(r));
  assert.equal(j.obiective.length, 4);
  assert.ok(j.obiective.every((o) => typeof o === 'string'));
});
test('obiectivele: un nume interzis în ele oprește cursul public', () => opreste((e) => e('curs.yml', (s) => s.replace('"[EXEMPLU] Un cuvânt pentru felul în care pleacă"', '"Echipa Firma Exemplu pleacă cu un plan"')), /nume interzis/));
test('obiectivele: un obiectiv lung dă doar avertisment', () => {
  const r = cu((e) => e('curs.yml', (s) => s.replace('"[EXEMPLU] Un cuvânt pentru felul în care pleacă"', '"unu doi trei patru cinci șase șapte opt nouă zece unsprezece doisprezece treisprezece"'))); ok(r);
  assert.ok(r.avertismente.some((a) => /sub 12/.test(a)));
});
test('obiectivele: format greșit oprește build-ul', () => opreste((e) => e('curs.yml', (s) => s.replace(/obiective:\n(  - .*\n)+/, 'obiective: "unul singur"\n')), /listă de texte scurte/));
test('obiectivele: „obiective” la modul trebuie să fie numere', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('obiective: [3]', 'obiective: [trei]')), /listă de numere/));
test('obiectivele la tipar: căsuțe goale (bifele nu se tipăresc)', () => {
  const r = cu(() => {}); ok(r);
  const css = html(r).match(/@media print \{\s*\.obiective-lista input:checked \+ \.ob-cutie \{[^}]*\}\s*\.obiective-lista input:checked \+ \.ob-cutie::after \{ content: none; \}/);
  assert.ok(css, 'regula de tipar care golește căsuțele lipsește');
});
test('fără obiective: nicio secțiune goală', () => {
  const r = cu((e) => e('curs.yml', (s) => s.replace(/# Obiectivele zilei[\s\S]*$/, ''))); ok(r);
  assert.ok(!html(r).includes('<section class="obiective"'));
  assert.deepEqual(JSON.parse(exportul(r)).obiective, []);
});
