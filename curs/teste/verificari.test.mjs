// Verificările din 1.6, 1.8 și 1.9 (v1.2, D-053): fiecare greșeală trebuie să oprească build-ul și să nu scrie nimic.
//   npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cpSync, mkdtempSync, readFileSync, writeFileSync, existsSync, rmSync, renameSync } from 'node:fs';
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
  assert.match(html(r), /depășire 1 h 5 min/);
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
const FARA_PAUZE = (e) => e('editii/2026-11-23.yml', (s) => s + 'pauze: []\n');

// Agenda exemplului: deschidere 20, curba 10 + 20 + 15 = 45, pauza-cafea 15, ridica-te-daca 5 (blocul 1: 85 din 90),
// pauza fixă 10:30–10:45, pasul-de-luni 40, pauza 10, inchidere 20 (blocul 2: 70 din 105) = 9:00–11:55, 175 din 210.
test('totalurile: pe modul, pe zi și cât rămâne din durata_zi', () => {
  const r = cu(() => {}); ok(r);
  const d = date(r), h = html(r);
  assert.equal(d.module[1].durata, 45);
  assert.deepEqual(d.module.map((m) => m.start), [540, 560, 605, 620, 630, 645, 685, 695]);
  assert.match(h, /Total: 2 h 55 min<\/b> din 3 h 30 min/);
  assert.match(h, /rămân <b>35 min<\/b> până la 12:30/);
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
  assert.equal(date(r).module.filter((m) => m.id).length, 4);
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
// Challenge (D-075, Alex, 2026-11-20): tip nou de piesă, familia activitate; în sală are ecranele exercițiului, în Harvest și Bibliotecă semnul ◆.
test('challenge: piesa și candidata trec validarea, cu eticheta și semnul lor', () => {
  const r = cu((e, f) => {
    writeFileSync(f('piese/planul-meu.md'), '---\ntitlu: "Planul meu pentru AI"\ndurata: 10\ntip: challenge\nformat: perechi\nenergie: mediu\nobiectiv: "Fiecare spune un plan concret"\n---\n\n:::sala cronometru=8\n**Care e planul tău pentru AI Literacy?**\n:::\n');
    e('harvest.yml', (s) => s + '  - id: provocarea-zilei\n    titlu: "Provocarea zilei"\n    durata: 10\n    tip: challenge\n    sursa: Alex\n    verdict: nou\n');
    AG('  - planul-meu\n  - deschidere')(e);
  }); ok(r);
  assert.ok(!r.avertismente.some((a) => /challenge/.test(a)), r.avertismente.join('\n'));
  const d = date(r);
  assert.equal(d.masa.candidate.find((c) => c.id === 'provocarea-zilei').tip, 'challenge');
  const h = html(r);
  assert.match(h, /semn-mic fel-exercitiu semn-challenge/, 'semnul ◆ în agendă și Bibliotecă');
  assert.match(h, /Challenge · Planul meu pentru AI/, 'ecranul din sală poartă eticheta „Challenge”');
  assert.match(h, /class="ecran fel-exercitiu/, 'și stilul exercițiului (familia activitate)');
});
test('challenge: fără format, energie, obiectiv se oprește, ca orice activitate', () => opreste((e, f) => writeFileSync(f('piese/planul-meu.md'), '---\ntitlu: "x"\ndurata: 5\ntip: challenge\n---\nx\n'), /lipsește „format”.*activități/));
test('marcajul ::piese într-o piesă', () => opreste((e) => e('piese/perechi-curba.md', (s) => s + '\n::piese\n'), /doar într-un modul/));
test('avertisment: piesă aleasă la un modul care nu e în lista ei', () => {
  const r = cu(AG('  - deschidere\n  - modul: pasul-de-luni\n    piese: [perechi-curba]')); ok(r);
  assert.ok(r.avertismente.some((a) => /nu e în lista ei „module”/.test(a)));
});
test('avertisment: modul de peste 90 de minute fără pauză după', () => {
  const r = cu((e) => { e('02-curba-schimbarii.md', (s) => s.replace(/durata: 10 .*\n/, 'durata: 30\n')); AG('  - modul: curba\n    piese: [model-curba, perechi-curba, plimbare-curba, poveste-fuziune]\n  - inchidere')(e); FARA_PAUZE(e); }); ok(r);
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
test('obiectivele: „obiective” la modul sunt numere sau id-uri', () => opreste((e) => e('04-pasul-de-luni.md', (s) => s.replace('obiective: [3]', 'obiective: [Trei pași]')), /listă de id-uri de obiective/));
test('obiectivele: un id fără harvest-obiective.yml dă avertisment și e ignorat', () => {
  const r = cu((e) => e('04-pasul-de-luni.md', (s) => s.replace('obiective: [3]', 'obiective: [trei]'))); ok(r);
  assert.ok(r.avertismente.some((a) => /obiectivul „trei” nu există \(cursul nu are harvest-obiective\.yml\)/.test(a)), r.avertismente.join('\n'));
  assert.doesNotMatch(html(r), /Pasul de luni · 40 min <span class="ob-leg"/);
});
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

// Etichetele (Alex, 2026-11-17): organizare internă în bibliotecă
test('etichetele: rând de filtre cu numărul de piese, chip-uri pe rânduri, căutare', () => {
  const r = cu(() => {}); ok(r);
  const h = html(r);
  assert.match(h, /data-filtru="eticheta" data-valoare="change curve"[^>]*>Change Curve <span class="chip-nr">4<\/span>/);
  assert.match(h, /id="ex-apreciere-ceilalti"[^>]*data-etichete="\|positive outlook\|closing\|"/);
  assert.match(h, /<button type="button" class="et-chip" data-eticheta="positive outlook"[^>]*>Positive Outlook<\/button>/);
  assert.match(h.match(/id="ex-apreciere-ceilalti"[^>]*data-cauta="([^"]*)"/)[1], /positive outlook/);
});
test('etichetele: majusculele și diacriticele nu contează; rămâne prima formă, cu avertisment', () => {
  const r = cu((e) => e('piese/plimbare-curba.md', (s) => s.replace('etichete: [Energizing, Change Curve]', 'etichete: [energizing, Change curve]'))); ok(r);
  assert.ok(r.avertismente.some((a) => /„Change curve” diferă doar prin majuscule sau diacritice de „Change Curve”/.test(a)));
  const h = html(r);
  assert.match(h, />Change Curve <span class="chip-nr">4<\/span>/);
  assert.ok(!/>Change curve</.test(h), 'pe ecran apare doar forma folosită prima');
});
test('etichetele: diacriticele nu despart o etichetă', () => {
  const r = cu((e) => { e('piese/model-curba.md', (s) => s.replace('Foundations', 'Bază teoretică')); e('piese/poveste-fuziune.md', (s) => s.replace('Storytelling', 'Baza teoretica')); }); ok(r);
  assert.match(html(r), />Bază teoretică <span class="chip-nr">2<\/span>/);
});
test('etichetele nu ajung în sală și nici în cursul participanților', () => {
  const r = cu(AG('  - deschidere\n  - modul: inchidere\n    piese: [apreciere-ceilalti]')); ok(r);
  const d = date(r);
  assert.ok(d.ecrane.some((x) => x.html.includes('Un lucru bun')), 'piesa e în sală');
  assert.ok(!d.ecrane.some((x) => /Positive Outlook|Closing/.test(x.html + x.note.join(''))), 'eticheta nu e pe ecrane');
  const j = exportul(r);
  assert.ok(j.includes('Aprecierea celorlalți') && !/Positive Outlook|"etichete"/.test(j), 'eticheta nu e în export');
});
test('etichetele apar discret în Ziua și în Modul', () => {
  const r = cu(AG('  - deschidere\n  - modul: inchidere\n    piese: [apreciere-ceilalti]')); ok(r);
  const h = html(r);
  assert.match(h, /Aprecierea celorlalți<\/a> <span class="etichete-mici">Positive Outlook · Closing<\/span>/);
  assert.match(h, /<h3>Ce iei cu tine<\/h3><p> <span class="etichete-mici">Closing<\/span><\/p>/);
});
test('etichetele: format greșit oprește build-ul', () => opreste((e) => e('piese/model-curba.md', (s) => s.replace('etichete: [Change Curve, Foundations]', 'etichete: [{a: 1}]')), /„etichete” e o listă de texte/));

// Ecranele din sală: id stabil, ordinea și ascunderea din ediție (1.10, Alex, 2026-11-17)
const ECR = (bloc) => (e) => e('editii/2026-11-23.yml', (s) => s.replace(/ecrane:\n(  .*\n|    .*\n)*/, bloc));
const ordine = (r) => date(r).ecrane.map((x) => x.id + (x.ascuns ? '!' : ''));
test('ecranele au id stabil: <piesă sau modul>#<n>, #titlu, #pauza, pauza#<k>', () => {
  const r = cu(ECR('')); ok(r);
  assert.deepEqual(ordine(r), ['deschidere#titlu', 'deschidere#1', 'deschidere#2', 'curba#titlu', 'curba#1', 'model-curba#1', 'perechi-curba#1', 'pauza-cafea#pauza', 'ridica-te-daca#1', 'pauza-10-30#pauza', 'pasul-de-luni#titlu', 'pasul-de-luni#1', 'pasul-de-luni#2', 'pauza#1', 'inchidere#titlu', 'inchidere#1']);
});
test('id-urile nu se schimbă când se reordonează agenda', () => {
  const a = new Set(ordine(cu(ECR(''))));
  const r = cu((e) => { ECR('')(e); AG('  - inchidere\n  - pasul-de-luni\n  - ridica-te-daca\n  - pauza-cafea\n  - modul: curba\n    piese: [model-curba, perechi-curba]\n  - pauza: 10\n  - deschidere')(e); }); ok(r);
  assert.deepEqual(new Set(ordine(r)), a);
});
test('o piesă folosită de două ori: a doua apariție are @2', () => {
  const r = cu((e) => { ECR('')(e); AG('  - ridica-te-daca\n  - deschidere\n  - ridica-te-daca')(e); }); ok(r);
  assert.ok(ordine(r).includes('ridica-te-daca#1') && ordine(r).includes('ridica-te-daca@2#1'));
});
test('exemplul: o mutare și o ascundere din ediție', () => {
  const r = cu(() => {}); ok(r);
  const o = ordine(r);
  assert.equal(o[3], 'ridica-te-daca#1');
  assert.ok(o.includes('pasul-de-luni#1!'));
});
test('ecrane: „la început” și mutări pe rând', () => {
  const r = cu(ECR('ecrane:\n  muta: ["inchidere#1 la început", "curba#1 după inchidere#1"]\n')); ok(r);
  assert.deepEqual(ordine(r).slice(0, 3), ['inchidere#1', 'curba#1', 'deschidere#titlu']);
});
test('ecrane: un ecran nou (care nu e în muta) intră la locul lui firesc', () => {
  const r = cu((e) => { ECR('ecrane:\n  muta: ["inchidere#1 la început"]\n')(e); e('piese/perechi-curba.md', (s) => s + '\n:::sala\nEcran nou\n:::\n'); }); ok(r);
  const o = ordine(r);
  assert.equal(o[0], 'inchidere#1');
  assert.equal(o[o.indexOf('perechi-curba#1') + 1], 'perechi-curba#2');
});
test('ecrane: id inexistent oprește build-ul', () => opreste(ECR('ecrane:\n  ascunse: ["curba#9"]\n'), /„curba#9” .*nu e un ecran din curs/));
test('ecrane: id inexistent în muta oprește build-ul', () => opreste(ECR('ecrane:\n  muta: ["nimic#1 după curba#1"]\n'), /nu e un ecran din curs/));
test('ecrane: același ecran mutat de două ori', () => opreste(ECR('ecrane:\n  muta: ["curba#1 la început", "curba#1 după inchidere#1"]\n'), /mutat de două ori/));
test('ecrane: același ecran de două ori în ascunse', () => opreste(ECR('ecrane:\n  ascunse: ["curba#1", "curba#1"]\n'), /de două ori în ascunse/));
test('ecrane: rând de neînțeles', () => opreste(ECR('ecrane:\n  muta: ["curba#1 înainte de inchidere#1"]\n'), /nu se înțelege/));
test('ecrane: câmp necunoscut', () => opreste(ECR('ecrane:\n  ordine: []\n'), /„ordine” necunoscut/));
test('ecrane: un ecran din curs care nu e azi în agendă dă doar avertisment', () => {
  const r = cu(ECR('ecrane:\n  ascunse: ["plimbare-curba#1"]\n')); ok(r);
  assert.ok(r.avertismente.some((a) => /„plimbare-curba#1” .*nu e în agenda de azi/.test(a)));
});
test('ecrane: toate ecranele unei piese ascunse → avertisment, durata rămâne în total', () => {
  const r = cu(ECR('ecrane:\n  ascunse: ["ridica-te-daca#1"]\n')); ok(r);
  assert.ok(r.avertismente.some((a) => /toate ecranele lui „Ridică-te dacă” sunt ascunse; durata \(5 min\) rămâne/.test(a)));
  assert.match(html(r), /Total: 2 h 55 min/);
});
test('ecrane: cursul online nu se schimbă', () => {
  const a = exportul(cu(ECR(''))), b = exportul(cu(ECR('ecrane:\n  muta: ["inchidere#1 la început"]\n  ascunse: ["curba#1", "model-curba#1"]\n')));
  assert.equal(a, b);
});

// Marca „BEMORE Learning Studio” (D-061, Ioana, 2026-11-17): pe toate ecranele bemore, în bara și pe tiparul trainerului; nu pe innersis.
const ecraneDin = (r) => JSON.parse(readFileSync(r.fisiere[1], 'utf8').match(/<script type="application\/json" id="date-curs">([\s\S]*?)<\/script>/)[1].replace(/\\u003c/g, '<')).ecrane;
const bemore = (edit, extra = '') => edit('curs.yml', (s) => s.replace(/^brand: .*$/m, 'brand: bemore') + extra);
test('marca: apare pe fiecare ecran bemore, mai mare pe titluri, în bara și la tipar', () => {
  const r = cu((e) => bemore(e));
  assert.equal(r.ok, true, r.erori?.join('\n'));
  const html = readFileSync(r.fisiere[1], 'utf8'), ecrane = ecraneDin(r);
  assert.ok(ecrane.length > 5 && ecrane.every((x) => x.html.includes('class="marca ecran-marca') && x.html.includes('aria-label="BEMORE Learning Studio"')), 'un ecran bemore fără marcă');
  assert.ok(ecrane.filter((x) => x.titlu && x.fel !== 'pauza').every((x) => x.html.includes('ecran-marca mare')), 'titlurile de modul au marca mare');
  assert.ok(ecrane.filter((x) => !x.titlu && x.fel !== 'reflectie').every((x) => !x.html.includes('ecran-marca mare')), 'ecranele obișnuite au marca mică');
  assert.ok(html.includes('class="marca bara-marca"') && html.includes('class="marca tipar-marca"'), 'lipsește marca din bara sau de pe tipar');
});
test('marca: nu apare pe innersis (exemplul) și nici când e scrisă acolo', () => {
  for (const extra of ['', 'marca: "BEMORE Learning Studio"\n']) {
    const r = cu((e) => e('curs.yml', (s) => s + extra));
    assert.equal(r.ok, true, r.erori?.join('\n'));
    const html = readFileSync(r.fisiere[1], 'utf8');
    assert.ok(!html.includes('class="marca ') && !html.includes('Learning Studio</span>'), 'innersis nu primește marca');
    assert.ok(ecraneDin(r).every((x) => !x.html.includes('ecran-marca')));
  }
});
test('marca: alt nume de studio din curs.yml, sau "" ca s-o scoți', () => {
  const alt = cu((e) => bemore(e, 'marca: "BEMORE Kids Studio"\n'));
  assert.ok(ecraneDin(alt).every((x) => x.html.includes('aria-label="BEMORE Kids Studio"')));
  const fara = cu((e) => bemore(e, 'marca: ""\n'));
  assert.equal(fara.ok, true, fara.erori?.join('\n'));
  assert.ok(ecraneDin(fara).every((x) => !x.html.includes('ecran-marca')));
});
test('marca: un text prea lung oprește build-ul', () => opreste((e) => bemore(e, 'marca: "Un studio cu un nume mult prea lung ca să încapă în colț"\n'), /„marca” are peste 40/));

// „Prezintă” din Bibliotecă (1.12, Alex, 2026-11-17)
test('biblioteca are ecranele fiecărei piese, cu id-uri ~live, separate de agendă', () => {
  const r = cu(() => {}); ok(r);
  const d = date(r);
  assert.deepEqual(Object.keys(d.biblioteca).sort(), ['apreciere-ceilalti', 'model-curba', 'pauza-cafea', 'perechi-curba', 'plimbare-curba', 'poveste-fuziune', 'ridica-te-daca']);
  assert.deepEqual(d.biblioteca['plimbare-curba'].ecrane.map((x) => x.id), ['plimbare-curba~live#1']);
  assert.equal(d.biblioteca['plimbare-curba'].durata, 20);
  assert.equal(d.biblioteca['pauza-cafea'].ecrane[0].id, 'pauza-cafea~live#pauza');
  assert.ok(d.biblioteca['plimbare-curba'].ecrane.every((x) => x.piesa === 'plimbare-curba' && x.modul === undefined));
  assert.equal(d.ecrane.find((x) => x.id === 'perechi-curba#1').piesa, 'perechi-curba', 'ecranele din agendă știu din ce piesă vin');
  assert.ok(!d.ecrane.some((x) => /~live/.test(x.id)), 'agenda nu are ecrane live');
});
test('formatul copiat: agenda ediției, rând cu rând, gata de lipit (și cu o piesă adăugată live)', () => {
  const r = cu(() => {}); ok(r);
  const d = date(r);
  assert.deepEqual(d.agendaYaml, ['- deschidere', '- curba', '- pauza-cafea', '- ridica-te-daca', '- bloc: 2   # după pauza fixă de la 10:30', '- pasul-de-luni', '- pauza: 10', '- inchidere']);
  const r2 = cu(AG('  - modul: curba\n    piese: [plimbare-curba]\n  - pauza: 30\n    titlu: "Prânz"')); ok(r2);
  assert.deepEqual(date(r2).agendaYaml, ['- modul: curba\n    piese: [plimbare-curba]', '- pauza: 30\n    titlu: "Prânz"']);
  // Ce scrie „Copiază pentru ediție” când adaugi live „plimbare-curba” în modulul curba: agenda întreagă, cu rândul nou după curba.
  const bloc = ['agenda:', ...d.agendaYaml.flatMap((x) => [`  ${x}`, ...(x === '- curba' ? ['  - plimbare-curba   # adăugată live (în sală: după curba#1)'] : [])])].join('\n');
  const r3 = cu((e) => e('editii/2026-11-23.yml', (s) => s.replace(/agenda:[\s\S]*?\n(?=ecrane:|nume_interzise)/, bloc + '\n'))); ok(r3);
  const m = date(r3).module.map((x) => x.id);
  assert.deepEqual(m.slice(0, 3), ['deschidere', 'curba', 'plimbare-curba']);
  // Blocul 1 trece la 105 din 90, deci pauza fixă începe la 10:45 în loc de 10:30: cele 5 minute libere se pierd, ziua crește cu 15.
  assert.match(html(r3), /Total: 3 h 10 min/, 'ziua crește cu piesa (minus cele 5 minute libere din blocul 1)');
});

// Programul zilei: pauzele la ore fixe și blocurile dintre ele (Alex, 2026-11-18)
const PAUZE = (rand) => (e) => e('curs.yml', (s) => s.replace(/pauze:\n(  .*\n)*/, rand));
const ZI = (zi) => (e) => e('curs.yml', (s) => s.replace('durata_zi: "9:00–12:30"', `durata_zi: "${zi}"`));
test('pauze implicite: 11:00 (15), 12:45 Prânz (60), 15:15 (15), deci 4 blocuri în 9:30–17:30', () => {
  const r = cu((e) => { PAUZE('')(e); ZI('9:30–17:30')(e); e('editii/2026-11-23.yml', (s) => s.replace('ora_start: "9:00"', 'ora_start: "9:30"').replace(/  - bloc: 2 .*\n/, '')); }); ok(r);
  const b = date(r).blocuri;
  assert.deepEqual(b.map((x) => [x.start, x.sfarsit, x.disponibil]), [[570, 660, 90], [675, 765, 90], [825, 915, 90], [930, 1050, 120]]);
  assert.deepEqual(b.slice(0, 3).map((x) => [x.pauzaDupa.la, x.pauzaDupa.min, x.pauzaDupa.titlu]), [[660, 15, 'Pauză'], [765, 60, 'Prânz'], [915, 15, 'Pauză']]);
  // Agenda: 9:30 deschidere 20, curba 45, pauza-cafea 15, ridica 5 = 85 (10:55), pasul 40 trece peste 11:00 → avertisment, pauza la 11:35
  assert.ok(r.avertismente.some((a) => /blocul 1 \(9:30–11:00\): 125 din 90 min; „Pasul de luni” trece peste pauza de la 11:00, deci pauza începe la 11:35 \(depășire 35 min\)/.test(a)), r.avertismente.join('\n'));
  const d = date(r), p = d.ecrane.find((x) => x.id === 'pauza-11-00#pauza');
  assert.ok(p && p.cronometru === 15 && p.fel === 'pauza', 'pauza fixă e un ecran de pauză, cu cronometru');
  assert.equal(d.module.find((m) => m.titlu === 'Pauză' && m.start === 695)?.durata, 15, 'pauza fixă e un rând în agendă (11:35, după piesa care a trecut peste)');
  assert.ok(!d.ecrane.some((x) => x.id === 'pauza-12-30#pauza'), 'o pauză fixă de după agendă nu are ecran');
  const h = html(r);
  assert.match(h, /<tr class="bloc-cap depasire" data-bloc="1"><td colspan="6"><b>Blocul 1<\/b> · 9:30–11:00 · <span class="bloc-total">125 din 90 min<\/span> · <b>depășire 35 min<\/b>/);
  assert.match(h, /<tr class="pauza fixa reper">.*Prânz/, 'Ziua arată și pauzele de după agendă, ca reper');
  assert.match(h, /<li class="bloc-cap ramas" data-bloc="2">/, 'Schița are blocurile');
});
test('pauze: ediția le suprascrie, [] = niciuna', () => {
  const r = cu((e) => e('editii/2026-11-23.yml', (s) => s.replace(/  - bloc: 2 .*\n/, '') + 'pauze: []\n')); ok(r);
  assert.equal(date(r).blocuri.length, 1);
  assert.ok(!date(r).ecrane.some((x) => /^pauza-\d/.test(x.id)));
  assert.ok(!/class="bloc-cap/.test(html(r)), 'fără pauze fixe, fără capete de bloc');
  const r2 = cu((e) => e('editii/2026-11-23.yml', (s) => s.replace(/  - bloc: 2 .*\n/, '') + 'pauze:\n  - { la: "10:00", min: 20, titlu: "Cafea" }\n')); ok(r2);
  assert.deepEqual(date(r2).blocuri.map((b) => b.disponibil), [60, 130]);
});
test('bloc: N lasă restul blocului liber; o pauză fixă e verificată', () => {
  const r = cu(() => {}); ok(r);
  const b = date(r).blocuri;
  assert.deepEqual(b.map((x) => [x.folosit, x.disponibil, x.depasire]), [[85, 90, 0], [70, 105, 0]]);
  assert.match(html(r), /85 din 90 min<\/span> · liber 5 min/);
  opreste(AG('  - deschidere\n  - bloc: 3'), /„bloc: 3” nu există; ziua are 2 blocuri/);
  opreste(AG('  - deschidere\n  - bloc: doi'), /„bloc” e numărul blocului/);
  opreste(PAUZE('pauze:\n  - { la: 10.30, min: 15 }\n'), /„la” e ora pauzei, între ghilimele/);
  opreste(PAUZE('pauze:\n  - { la: "10:30", min: 45 }\n  - { la: "11:00", min: 10 }\n'), /se suprapune/);
  opreste(PAUZE('pauze:\n  - { la: "10:30", durata: 15 }\n'), /câmp necunoscut/);
  const r2 = cu(AG('  - pasul-de-luni\n  - bloc: 1\n  - deschidere')); ok(r2);
  assert.ok(!r2.avertismente.some((a) => /bloc: 1/.test(a)), '„bloc: 1” în blocul 1 nu schimbă nimic');
  const r3 = cu((e) => { PAUZE('pauze:\n  - { la: "13:00", min: 15 }\n')(e); e('editii/2026-11-23.yml', (s) => s.replace(/  - bloc: 2 .*\n/, '')); }); ok(r3);
  assert.ok(r3.avertismente.some((a) => /pauza de la 13:00 e în afara zilei/.test(a)));
});
test('pauze fixe: id-urile celorlalte ecrane nu se schimbă; ecranul pauzei se poate muta și ascunde', () => {
  const fara = new Set(ordine(cu((e) => { ECR('')(e); e('editii/2026-11-23.yml', (s) => s.replace(/  - bloc: 2 .*\n/, '') + 'pauze: []\n'); })));
  const cu_ = ordine(cu(ECR('')));
  assert.deepEqual(cu_.filter((x) => !x.startsWith('pauza-10-30')), [...fara], 'doar ecranul pauzei fixe e în plus');
  const r = cu(ECR('ecrane:\n  muta: ["pauza-10-30#pauza după pasul-de-luni#1"]\n  ascunse: ["pauza-15-00#pauza"]\n')); ok(r);
  assert.ok(ordine(r).indexOf('pauza-10-30#pauza') === ordine(r).indexOf('pasul-de-luni#1') + 1);
  assert.ok(r.avertismente.some((a) => /„pauza-15-00#pauza” .*nu e în agenda de azi/.test(a)), 'o pauză fixă care azi nu există: doar avertisment');
});

// Masa (etapa A, Alex, 2026-11-18)
import { agendaDinMasa, inlocuiesteAgenda, textAgenda, textMasa } from '../lib/masa.mjs';
import { parse as parseYaml } from 'yaml';
const MASA = (f) => (e) => e('harvest.yml', f);
test('masa.yml: candidatele ajung în material, cu „produsă” și blocul lor', () => {
  const r = cu(() => {}); ok(r);
  const m = date(r).masa;
  assert.equal(m.exista, true); assert.equal(m.propunere, false); assert.equal(m.candidate.length, 13, '11 din harvest.yml + 2 piese vechi din Bibliotecă');
  const x = Object.fromEntries(m.candidate.map((c) => [c.id, c]));
  assert.deepEqual([x.curba.produsa, x['ridica-te-daca'].produsa, x['harta-emotiilor'].produsa], [true, true, false], 'modul sau piesă = produsă');
  assert.deepEqual(['nou', 'da', 'poate', 'nu'].map((v) => m.candidate.filter((c) => c.verdict === v).length), [2, 8, 2, 1]);
  assert.deepEqual(m.candidate.filter((c) => c.virtuala).map((c) => [c.id, c.verdict, c.bloc]), [['model-curba', 'da', null], ['perechi-curba', 'da', null]], 'piesele cu fișier care nu sunt pe masă intră cu „da” (o singură listă)');
  assert.match(html(r), /<button data-vedere="masa">Harvest<\/button>/);
  assert.ok(!exportul(r).includes('Harta emoțiilor'), 'masa nu ajunge în cursul participanților');
});
test('masa.yml: lipsa lui nu e eroare; Masa propune din agenda de azi', () => {
  const r2 = cu(MASA(() => 'candidate: []\n')); ok(r2);
  assert.ok(date(r2).masa.candidate.every((c) => c.virtuala && c.verdict === 'da') && date(r2).masa.candidate.length === 6, 'o masă goală are doar piesele din Bibliotecă (fără pauze), nu o propunere');
  const r3 = cu((e, f) => rmSync(f('harvest.yml'))); ok(r3);
  const m = date(r3).masa;
  assert.equal(m.propunere, true);
  assert.deepEqual(m.candidate.filter((c) => c.verdict === 'da' && c.bloc).map((c) => [c.id, c.bloc, c.ordine]),
    [['deschidere', 1, 1], ['curba', 1, 2], ['ridica-te-daca', 1, 3], ['pasul-de-luni', 2, 1], ['inchidere', 2, 2]]);
  assert.ok(m.candidate.some((c) => c.id === 'plimbare-curba' && c.verdict === 'da' && c.bloc == null), 'restul bibliotecii stă în Bibliotecă (da, fără bloc)');
  assert.ok(m.candidate.some((c) => c.id === 'model-curba' && c.verdict === 'da'), 'și piesele din module');
  assert.ok(!m.candidate.some((c) => c.id === 'pauza-cafea'), 'pauzele nu sunt candidate');
});
test('masa.yml: id-uri unice, verdict valid, durata un număr', () => {
  opreste(MASA((s) => s.replace('id: curba\n', 'id: deschidere\n')), /id „deschidere” apare de două ori/);
  opreste(MASA((s) => s.replace('verdict: poate\n    bloc: 2', 'verdict: poatee\n    bloc: 2')), /verdict „poatee” necunoscut/);
  opreste(MASA((s) => s.replace('durata: 15\n    tip: exercitiu', 'durata: "15 min"\n    tip: exercitiu')), /„durata” e un număr/);
  opreste(MASA((s) => s.replace('id: curba\n', 'id: Curba Mare\n')), /„id” poate avea doar/);
  opreste(MASA(() => 'candidate: [\n'), /harvest.yml: YAML greșit/);
  const r = cu(MASA((s) => s.replace('bloc: 2\n    ordine: 1', 'bloc: 7\n    ordine: 1'))); ok(r);
  assert.ok(r.avertismente.some((a) => /bloc „7” nu există/.test(a)));
  assert.equal(date(r).masa.candidate.find((c) => c.id === 'pasul-de-luni').bloc, null);
});
// harvest.yml (Alex, 2026-11-18); un masa.yml vechi se citește mai departe, cu avertisment
test('masa.yml vechi: se citește mai departe, cu avertisment, fără eroare', () => {
  const r = cu((e, f) => renameSync(f('harvest.yml'), f('masa.yml'))); ok(r);
  assert.equal(date(r).masa.exista, true); assert.equal(date(r).masa.fisier, 'masa.yml'); assert.equal(date(r).masa.candidate.length, 13);
  assert.ok(r.avertismente.some((a) => /redenumește masa\.yml în harvest\.yml/.test(a)), r.avertismente.join('\n'));
  // o greșeală din masa.yml vechi oprește build-ul, cu numele lui
  opreste((e, f) => { renameSync(f('harvest.yml'), f('masa.yml')); writeFileSync(f('masa.yml'), 'candidate: [\n'); }, /masa\.yml: YAML greșit/);
  const ambele = cu((e, f) => writeFileSync(f('masa.yml'), 'candidate: []\n')); ok(ambele);
  assert.equal(date(ambele).masa.fisier, 'harvest.yml'); assert.equal(date(ambele).masa.candidate.length, 13, 'harvest.yml câștigă');
  assert.ok(ambele.avertismente.some((a) => /are și harvest\.yml, deci îl ignor/.test(a)));
});
test('Trimite în agendă: da + produsă intră, bloc cu bloc; celelalte sunt listate', () => {
  const r = cu(() => {}); ok(r);
  const d = date(r), a = agendaDinMasa(d.masa.candidate, d.blocuri);
  assert.deepEqual(a.linii, ['- deschidere', '- curba', '- ridica-te-daca', '- bloc: 2   # după pauza de la 10:30', '- pasul-de-luni', '- inchidere']);
  assert.deepEqual(a.deProdus.map((x) => x.id), ['harta-emotiilor']);
  assert.deepEqual(a.nehotarate.map((x) => x.id), ['poveste-fuziune']);
  // Scris în ediție: doar agenda se schimbă, restul (ecrane, nume interzise, comentarii) rămâne; build-ul trece
  const r2 = cu((e) => e('editii/2026-11-23.yml', (s) => {
    const nou = inlocuiesteAgenda(s, textAgenda(a.linii, '2026-11-18'));
    const A = s.split('\n'), B = nou.split('\n');
    assert.deepEqual(B.slice(0, A.findIndex((l) => l.startsWith('agenda:'))), A.slice(0, A.findIndex((l) => l.startsWith('agenda:'))), 'antetul ediției rămâne');
    assert.ok(nou.includes('# Ecranele din sală (1.10') && nou.includes('nume_interzise: ["Firma Exemplu", "Ion Exemplescu"]'));
    assert.deepEqual(parseYaml(nou).agenda, ['deschidere', 'curba', 'ridica-te-daca', { bloc: 2 }, 'pasul-de-luni', 'inchidere']);
    return nou;
  })); ok(r2);
  assert.deepEqual(date(r2).module.map((m) => m.id ?? m.titlu), ['deschidere', 'curba', 'ridica-te-daca', 'Pauză', 'pasul-de-luni', 'inchidere']);
  assert.throws(() => inlocuiesteAgenda('data: 2026-11-23\nagenda:\n# comentariu la margine\n  - x\nnume_interzise: []\n', textAgenda(['- y'])), /Nu pot înlocui agenda/);
  assert.match(inlocuiesteAgenda('data: 2026-11-23\n', textAgenda(['- y'])), /^data: 2026-11-23\n\nagenda: .*\n  - y\n$/);
});
test('textMasa: scris și citit înapoi dă aceleași candidate', () => {
  const r = cu(() => {}); ok(r);
  const c = date(r).masa.candidate, t = textMasa(c);
  const r2 = cu(MASA(() => t)); ok(r2);
  const fara = (l) => l.map(({ produsa, virtuala, ...x }) => x);
  assert.deepEqual(fara(date(r2).masa.candidate), fara(c));
});

// Masa → Biblioteca → Agenda (Alex, 2026-11-18)
test('Biblioteca arată și piesele „de produs” de pe masă: fără ecrane, fără „Prezintă”', () => {
  const r = cu(() => {}); ok(r);
  const h = html(r);
  const rand = h.match(/<details class="ex ex-de-produs" id="ex-harta-emotiilor"[\s\S]*?<\/details>/);
  assert.ok(rand, 'harta-emotiilor (da, fără fișier) e în Bibliotecă');
  assert.match(rand[0], /data-stare="de-produs"/); assert.match(rand[0], /de produs/); assert.match(rand[0], /Harta emoțiilor din echipă/);
  assert.match(rand[0], /Ce simte grupul, pe un perete/, 'cu scopul');
  assert.ok(!/prezinta-piesa|class="cadru/.test(rand[0]), 'fără „Prezintă” și fără ecrane');
  assert.ok(!h.includes('id="ex-studiu-adaptare"'), '„nou” nu e în Bibliotecă');
  assert.ok(!h.includes('id="ex-test-personalitate"'), '„nu” nu e în Bibliotecă');
  assert.match(h, /data-filtru="stare" data-valoare="de-produs"/, 'filtrul „de produs”');
  assert.equal(date(r).biblioteca['harta-emotiilor'], undefined, 'nimic de prezentat');
});
test('Masa e vederea implicită și are rezumatul; obiectivele intră în date', () => {
  const r = cu(() => {}); ok(r);
  const h = html(r), d = date(r);
  assert.match(h, /<section id="masa" hidden>[\s\S]*id="masa-rezumat"/);
  assert.match(h, /\$\('masa'\) \? 'masa' : 'ziua'/, 'fără hash, pagina deschide Masa');
  assert.equal(d.obiective.length, 4);
  assert.deepEqual(d.module.filter((m) => m.fixa).map((m) => m.bloc), [1]);
  assert.ok(d.masa.candidate.find((c) => c.id === 'curba').obFisier.includes(1), 'obiectivele din fișier ajung la candidată');
  const fara = cu((e, f) => rmSync(f('harvest.yml'))); ok(fara);
  assert.ok(html(fara).includes('<section id="masa"'), 'și fără harvest.yml, Harvest (propunerea) e acolo');
});
