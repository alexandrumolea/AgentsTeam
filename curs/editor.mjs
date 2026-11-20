#!/usr/bin/env node
// Editorul local al cursului (1.11, Alex, 2026-11-17): materialul trainerului, cu butonul „Editează” pe fiecare ecran.
//   node editor.mjs [<folderul cursului>] [--port 4747] [--fara-browser] [--biblioteca <folderul core>]
//   npm run editor -- <folder>          (implicit: privat/cursuri/change-agility)
// Serverul ascultă doar pe 127.0.0.1, cere un token aleator (în linkul deschis la pornire) și scrie doar în folderul cursului
// și în biblioteca core (implicit <curs>/../../biblioteca, dacă cursul e în cursuri/; altfel --biblioteca <cale>).
// Fișierul HTML normal (offline) rămâne exact cum e: editarea se adaugă doar în paginile servite de aici.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { build } from './build.mjs';
import { citesteCurs } from './lib/sursa.mjs';
import { ecranul } from './lib/trainer.mjs';
import { creeazaRandare, escapeHtml } from './lib/randare.mjs';
import { citesteBloc, scrieBloc, EroareEditor, citesteRef, caleSigura, copieIstoric } from './lib/editor-sursa.mjs';
import { citesteMasa, scrieMasa, adaugaCandidata, agendaDinMasa, textAgenda, inlocuiesteAgenda, textMasa, propunere, CAMPURI_FISA, FISIER as MASA, FISIER_VECHI as MASA_VECHI } from './lib/masa.mjs';
import { TIPURI_PIESA } from './lib/sursa.mjs';
import { mkdirSync, rmSync } from 'node:fs';
import { fisaPiesei, fisaObiectivului, fisaDeEditat, scrieFisa, sablonFisa, idDinTitlu, fiseExistente, DOSAR as HARVEST } from './lib/fisa.mjs';
import { citesteObiectiveHarvest, scrieObiective, adaugaObiectiv, textObiectiveNou, FISIER_OB, DOSAR_OB } from './lib/obiective.mjs';
import { gasesteCore, citesteCore, amprenta as amprentaPiesei, stare as stareCore, STARI, idDinLegatura, trimiteInCore, iaDinCore, adaugaDinCore, PREFIX, Scrieri } from './lib/core.mjs';

const AICI = dirname(fileURLToPath(import.meta.url));
const IMPLICIT = join(AICI, '..', 'privat', 'cursuri', 'change-agility');
const MAX_CORP = 256 * 1024;
const scurt = (p) => p.split('/').slice(-2).join('/');

export async function pornesteEditor({ folder = IMPLICIT, port = 4747, deschide = false, log = console.log, biblioteca } = {}) {
  folder = resolve(folder);
  if (!existsSync(join(folder, 'curs.yml'))) throw new Error(`${folder} nu e folderul unui curs (lipsește curs.yml)`);
  // Biblioteca core (2026-11-20). biblioteca: null = fără core (testele). Folderul se creează abia la prima trimitere.
  const core = biblioteca === null ? null : gasesteCore(folder, biblioteca);
  const token = randomBytes(18).toString('hex');
  const out = join(folder, 'dist');
  let amprenta = null; // fișierele cursului la ultimul build (2026-11-19: Daria și Irina scriu și direct pe disc)
  let ultim = construieste();
  let ocupat = false;

  /** Amprenta fișierelor cursului: căile și mtime-ul lor (fără dist/, .editor-istoric/, .git și alte foldere ascunse).
   *  O piesă nouă, una ștearsă sau una schimbată dau altă amprentă. */
  function amprentaAcum() {
    const parti = [];
    // Și core: o piesă schimbată din alt curs schimbă starea cartonașelor de aici („nouă în core”).
    for (const [radacina, eticheta] of [[folder, ''], ...(core ? [[core, 'core:']] : [])]) {
      (function umbla(rel) {
        let intrari; try { intrari = readdirSync(join(radacina, rel), { withFileTypes: true }); } catch { return; }
        for (const x of intrari) {
          if (x.name.startsWith('.') || (!rel && x.name === 'dist') || x.name === 'node_modules') continue;
          const r = rel ? `${rel}/${x.name}` : x.name;
          if (x.isDirectory()) umbla(r);
          else if (x.isFile()) { try { const st = statSync(join(radacina, r)); parti.push(`${eticheta}${r}:${st.mtimeMs}:${st.size}`); } catch { /* șters între timp */ } }
        }
      })('');
    }
    return parti.sort().join('|');
  }
  /** La deschiderea paginii: dacă un fișier al cursului s-a schimbat pe disc de la ultimul build, build din nou. */
  function laZi() {
    if (ocupat || amprentaAcum() === amprenta) return false;
    ultim = construieste();
    log(`  am refăcut materialul: fișierele cursului s-au schimbat pe disc${ultim.ok ? '' : ' (build-ul s-a oprit; pagina arată de ce)'}`);
    return true;
  }

  function construieste() {
    amprenta = amprentaAcum(); // înainte de build: o scriere din timpul build-ului cere încă un build data viitoare
    const linii = [];
    const r = build(folder, { out, log: (x) => linii.push(x), biblioteca: core });
    return { ...r, log: linii.join('\n') };
  }
  function tokenBun(t) {
    const a = Buffer.from(String(t ?? '')), b = Buffer.from(token);
    return a.length === b.length && timingSafeEqual(a, b);
  }
  // „X fișiere schimbate”: ce n-a intrat încă într-un commit, în folderul cursului (dacă e într-un repo git).
  function schimbate() {
    const r = spawnSync('git', ['-C', folder, 'status', '--porcelain', '--', '.'], { encoding: 'utf8' });
    if (r.status !== 0) return null;
    return r.stdout.split('\n').filter((l) => l.trim() && !/\b(dist|\.editor-istoric)\//.test(l)).map((l) => l.slice(3));
  }
  function pagina() {
    const fisier = ultim.ok ? ultim.fisiere.find((f) => f.endsWith('-trainer.html')) : null;
    if (!fisier || !existsSync(fisier)) {
      return `<!doctype html><meta charset="utf-8"><title>Editor: build oprit</title><body style="font:16px system-ui;margin:2rem;max-width:50rem">
<h1>Build-ul cursului s-a oprit</h1><p>Repară problemele de mai jos în fișiere și pornește din nou editorul.</p><pre style="white-space:pre-wrap">${escapeHtml(ultim.log)}</pre>`;
    }
    const css = readFileSync(join(AICI, 'lib', 'editor.css'), 'utf8');
    const js = readFileSync(join(AICI, 'lib', 'editor-client.js'), 'utf8');
    const config = JSON.stringify({ token, folder: folder.split('/').slice(-2).join('/'), core: core ? scurt(core) : null }).replace(/</g, '\\u003c');
    return readFileSync(fisier, 'utf8').replace(/<\/body>\s*<\/html>\s*$/, `<style id="editor-css">${css}</style>
<script>window.__EDITOR = ${config};</script>
<script>${js}</script>
</body>
</html>
`);
  }
  // Previzualizarea: același HTML ca ecranul din sală (felul, eticheta, cronometrul), din textul încă nesalvat.
  function previzualizare(ref, md) {
    const r = citesteRef(ref);
    const c = citesteCurs(folder);
    const piesa = c.piese?.get(r.id), modul = c.module?.find((m) => m.id === r.id);
    const f = piesa ?? modul; if (!f) throw new EroareEditor(`nu găsesc „${r.id}”`, 404);
    const seg = f.segmente.find((s) => s.nr === r.n && (r.fel === 'trainer' ? s.strat === 'trainer' : s.strat === 'sala' || s.strat === 'sala-si-curs'));
    if (r.fel === 'trainer') return { fel: 'nota', html: creeazaRandare({ atribut: 'data-img' })(md) };
    const sursa = piesa ? { tip: piesa.tip, titlu: piesa.titlu, format: piesa.format } : { tip: modul.tip, titlu: modul.titlu };
    const x = ecranul(sursa, creeazaRandare({ atribut: 'data-img', randuriNoi: true })(md), seg?.atribute.cronometru ?? 0, false, c.curs.marca);
    return { fel: x.fel, html: x.html.replace(' data-cron>', '>') };
  }

  // Masa (etapa A, Alex, 2026-11-18). Fiecare scriere: copie în .editor-istoric/, build; dacă build-ul refuză, fișierul revine.
  function cuBuild(fisierRel, inainte, nou) {
    const r = construieste();
    if (r.ok) { ultim = r; return null; }
    if (inainte == null) rmSync(caleSigura(folder, fisierRel), { force: true }); else writeFileSync(caleSigura(folder, fisierRel), inainte);
    ultim = construieste();
    return { cod: 422, corp: { eroare: `Build-ul a refuzat schimbarea, așa că ${fisierRel} a rămas cum era.`, erori: r.erori } };
  }
  function cursAcum() {
    const c = citesteCurs(folder);
    if (!c.piese) throw new EroareEditor('Cursul nu se poate citi (curs.yml).', 422);
    return c;
  }
  function masaSchimba(date) {
    const c = cursAcum();
    const s = scrieMasa(c, date.schimbari, date.hash);
    if (s.neschimbat) return { cod: 200, corp: { ok: true, hash: s.hash, fisier: s.fisier, neschimbat: true } };
    const rau = cuBuild(s.fisier, s.inainte); if (rau) return rau;
    log(`  masa: ${date.schimbari.length} ${date.schimbari.length === 1 ? 'schimbare' : 'schimbări'}; copie: ${s.copie}`);
    return { cod: 200, corp: { ok: true, hash: s.hash, fisier: s.fisier, copie: s.copie } };
  }
  function masaCreeaza() {
    const cale = caleSigura(folder, MASA);
    const are = [MASA, MASA_VECHI].find((f) => existsSync(caleSigura(folder, f)));
    if (are) throw new EroareEditor(`${are} există deja. Reîncarcă pagina.`, 409);
    writeFileSync(cale, textMasa(propunere(cursAcum())));
    const rau = cuBuild(MASA, null); if (rau) return rau;
    log(`  masa: am creat ${MASA} din agenda și biblioteca de azi`);
    return { cod: 200, corp: { ok: true } };
  }
  function masaAgenda(date) {
    const c = cursAcum();
    const m = citesteMasa(c, [], []);
    if (!m.exista) throw new EroareEditor(`Cursul nu are încă ${MASA}.`, 404);
    if (!date.hash || m.hash !== date.hash) throw new EroareEditor(`${m.fisier} s-a schimbat pe disc între timp. Reîncarcă pagina și încearcă din nou.`, 409);
    const a = agendaDinMasa(m.candidate, c.blocuri);
    const randuri = a.linii.filter((l) => !l.startsWith('- bloc:')).length;
    if (!randuri) throw new EroareEditor('Nicio piesă cu „Da” și fișier produs în blocurile din Flow; agenda a rămas cum era.', 422);
    const d = new Date(), azi = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const fisier = `editii/${c.editie.fisier ?? `${azi}.yml`}`;
    const cale = caleSigura(folder, fisier);
    const inainte = existsSync(cale) ? readFileSync(cale, 'utf8') : null;
    const nou = inlocuiesteAgenda(inainte ?? `data: ${azi}\n`, textAgenda(a.linii, azi));
    const copie = inainte != null ? copieIstoric(folder, fisier) : null;
    mkdirSync(caleSigura(folder, 'editii'), { recursive: true });
    writeFileSync(cale, nou);
    const rau = cuBuild(fisier, inainte); if (rau) return rau;
    log(`  masa → agenda: ${fisier} (${randuri} rânduri)${copie ? `; copie: ${copie}` : ''}`);
    const scurt = (l) => l.map((x) => ({ id: x.id, titlu: x.titlu }));
    return { cod: 200, corp: { ok: true, fisier, copie, randuri, linii: a.linii, deProdus: scurt(a.deProdus), nehotarate: scurt(a.nehotarate) } };
  }

  // Fișa piesei, editabilă (Alex, 2026-11-20): harvest/<id>.md și câmpurile rândului din harvest.yml (titlu, scop, durata, tip, obiective).
  const campuriDin = (x) => (x ? { titlu: x.titlu, scop: x.scop ?? '', durata: x.durata, tip: x.tip ?? '', obiective: x.obiective ?? [] } : null);
  function candidataAcum(c, id) {
    const m = citesteMasa(c, [], []);
    return { m, x: m.candidate.find((y) => y.id === id) ?? null };
  }
  /** Bifele de obiective din fișa piesei: toate obiectivele din harvest-obiective.yml; „legat” = piesa îl servește acum
   *  (din rând sau din lista „piese” a obiectivului); „dinFisier” = legătura stă în antetul piese/<id>.md (nu se schimbă de aici). */
  function obiectiveFisa(c, x, id) {
    const ho = c.harvestObiective;
    if (!ho) return null;
    const zi = c.obiectiveZi ?? [];
    const dinFisier = new Set((x?.obFisier ?? []).map((r) => (Number.isInteger(r) ? zi[r - 1]?.id : r)).filter(Boolean));
    const legate = new Set(x?.obIds ?? []);
    const dinRand = new Set((x?.obiective ?? []).map((r) => (Number.isInteger(r) ? zi[r - 1]?.id : r)).filter(Boolean));
    return ho.obiective.map((o) => ({ id: o.id, text: o.text, verdict: o.verdict, legat: legate.has(o.id), legatRand: dinRand.has(o.id), dinFisier: dinFisier.has(o.id), dinLista: o.piese.includes(id) }));
  }
  function fisaSursa(id, fel) {
    if (fel === 'obiectiv') return fisaSursaOb(id);
    const c = cursAcum();
    const { m, x } = candidataAcum(c, String(id ?? ''));
    const f = fisaDeEditat(folder, id, campuriDin(x) ?? {});
    return { ...f, campuri: campuriDin(x), areMasa: m.exista, fisierMasa: m.fisier, hashMasa: m.hash, tipuri: TIPURI_PIESA,
      obiective: obiectiveFisa(c, x, String(id ?? '')), hashOb: c.harvestObiective?.hash ?? null };
  }
  // Fișa obiectivului (2026-11-20): harvest/obiective/<id>.md și textul obiectivului din harvest-obiective.yml.
  function obiectivAcum(id) {
    const ho = citesteObiectiveHarvest(folder, [], []);
    return { ho, o: ho?.obiective.find((y) => y.id === String(id ?? '')) ?? null };
  }
  function fisaSursaOb(id) {
    const { ho, o } = obiectivAcum(id);
    const f = fisaDeEditat(folder, id, o ? { text: o.text } : {}, { fel: 'obiectiv' });
    return { ...f, fel: 'obiectiv', campuri: o ? { text: o.text } : null, areOb: !!ho, fisierOb: FISIER_OB, hashOb: ho?.hash ?? null };
  }
  function fisaSalveazaOb(date) {
    const id = String(date.id ?? '');
    const { ho, o } = obiectivAcum(id);
    const text = date.campuri && typeof date.campuri.text === 'string' ? date.campuri.text : null;
    if (text != null) {
      if (!ho) throw new EroareEditor(`Cursul nu are încă ${FISIER_OB}.`, 404);
      if (!o) throw new EroareEditor(`nu găsesc obiectivul „${id.slice(0, 60)}” în ${FISIER_OB}`, 404);
      if (String(o.text) !== String(date.campuriInainte?.text ?? '')) {
        const e = new EroareEditor(`Obiectivul din ${FISIER_OB} s-a schimbat între timp (probabil un agent). Nu l-am suprascris.`, 409);
        e.conflict = { campuri: { text: o.text }, hashOb: ho.hash }; throw e;
      }
    }
    const scrise = [];
    let f = null, s = null;
    try {
      if (typeof date.md === 'string') { f = scrieFisa(folder, id, date.md, date.hash ?? null, { fel: 'obiectiv' }); if (!f.neschimbat) scrise.push({ rel: f.fisier, inainte: f.inainte }); }
      if (text != null && text.trim() !== o.text) { s = scrieObiective(folder, { schimbari: [{ id, text }] }, ho.hash); if (!s.neschimbat) scrise.push({ rel: s.fisier, inainte: s.inainte }); }
    } catch (e) {
      for (const { rel, inainte } of scrise.reverse()) { if (inainte == null) rmSync(caleSigura(folder, rel), { force: true }); else writeFileSync(caleSigura(folder, rel), inainte); }
      throw e;
    }
    if (scrise.length) { const rau = cuBuildMulte(scrise); if (rau) return rau; log(`  fișa obiectivului: ${scrise.map((x) => x.rel).join(', ')}`); }
    return { cod: 200, corp: { ok: true, neschimbat: !scrise.length, fisa: fisaObiectivului(folder, id), sursa: fisaSursaOb(id), copie: f?.copie ?? null } };
  }
  // Harvest de obiective (2026-11-20): verdict, viziune, obiectiv nou, fișierul de pornire.
  function obiectiveSchimba(date) {
    const s = scrieObiective(folder, { schimbari: date.schimbari ?? [], ...(typeof date.viziune === 'string' ? { viziune: date.viziune } : {}) }, date.hash);
    if (s.neschimbat) return { cod: 200, corp: { ok: true, hash: s.hash, neschimbat: true } };
    const rau = cuBuild(s.fisier, s.inainte); if (rau) return rau;
    log(`  obiective: ${s.fisier}; copie: ${s.copie}`);
    return { cod: 200, corp: { ok: true, hash: s.hash, fisier: s.fisier, copie: s.copie, avertismente: ultim.avertismente ?? [] } };
  }
  function obiectivNou(date) {
    const ho = citesteObiectiveHarvest(folder, [], []);
    if (!ho) throw new EroareEditor(`Cursul nu are încă ${FISIER_OB}. Apasă întâi „Creează ${FISIER_OB}”.`, 404);
    const text = String(date.text ?? '').trim();
    const ocupate = new Set([...ho.obiective.map((o) => o.id), ...fiseExistente(folder, 'obiectiv')]);
    const id = idDinTitlu(`obiectiv ${text.split(/\s+/).slice(0, 4).join(' ')}`, ocupate);
    const s = adaugaObiectiv(folder, { id, text }, date.hash ?? ho.hash);
    const scrise = [{ rel: s.fisier, inainte: s.inainte }];
    try { const f = scrieFisa(folder, id, fisaDeEditat(folder, id, { text }, { fel: 'obiectiv' }).md, null, { fel: 'obiectiv' }); scrise.push({ rel: f.fisier, inainte: null }); }
    catch (e) { writeFileSync(caleSigura(folder, s.fisier), s.inainte); throw e; }
    const rau = cuBuildMulte(scrise); if (rau) return rau;
    log(`  obiectiv nou: ${id} (${FISIER_OB} + ${DOSAR_OB}/${id}.md)`);
    return { cod: 200, corp: { ok: true, id, fisier: `${DOSAR_OB}/${id}.md` } };
  }
  function obiectiveCreeaza() {
    if (existsSync(caleSigura(folder, FISIER_OB))) throw new EroareEditor(`${FISIER_OB} există deja. Reîncarcă pagina.`, 409);
    const c = cursAcum();
    writeFileSync(caleSigura(folder, FISIER_OB), textObiectiveNou(c.obiectiveFel === 'curs' ? c.obiective : []));
    const rau = cuBuild(FISIER_OB, null); if (rau) return rau;
    log(`  obiective: am creat ${FISIER_OB}${c.obiectiveFel === 'curs' ? ' din obiectivele din curs.yml' : ''}`);
    return { cod: 200, corp: { ok: true } };
  }
  /** Scrie fișierele în ordine; dacă build-ul refuză, toate revin la ce erau. */
  function cuBuildMulte(scrise) {
    const r = construieste();
    if (r.ok) { ultim = r; return null; }
    for (const { rel, inainte } of scrise.reverse()) { if (inainte == null) rmSync(caleSigura(folder, rel), { force: true }); else writeFileSync(caleSigura(folder, rel), inainte); }
    ultim = construieste();
    return { cod: 422, corp: { eroare: `Build-ul a refuzat schimbarea, așa că ${scrise.map((s) => s.rel).join(' și ')} ${scrise.length === 1 ? 'a rămas cum era' : 'au rămas cum erau'}.`, erori: r.erori } };
  }
  function fisaSalveaza(date) {
    if (date.fel === 'obiectiv') return fisaSalveazaOb(date);
    const id = String(date.id ?? '');
    const c = cursAcum();
    const { m, x } = candidataAcum(c, id);
    // Câmpurile: se trimit doar cele schimbate, cu valoarea de la deschidere; conflict dacă pe disc nu mai e aceea.
    const cerute = date.campuri && typeof date.campuri === 'object' ? Object.fromEntries(Object.entries(date.campuri).filter(([k]) => CAMPURI_FISA.includes(k))) : {};
    const deLa = date.campuriInainte && typeof date.campuriInainte === 'object' ? date.campuriInainte : {};
    if (Object.keys(cerute).length) {
      if (!m.exista) throw new EroareEditor(`Cursul nu are încă ${MASA}: titlul, durata și tipul se pot schimba după „Creează ${MASA}”.`, 404);
      if (!x) throw new EroareEditor(`nu găsesc piesa „${id}” în ${m.fisier}`, 404);
      const acum = campuriDin(x);
      if (Object.keys(cerute).some((k) => String(acum[k] ?? '') !== String(deLa[k] ?? ''))) {
        const e = new EroareEditor(`Rândul piesei din ${m.fisier} s-a schimbat între timp (probabil un agent). Nu l-am suprascris.`, 409);
        e.conflict = { campuri: acum, hashMasa: m.hash }; throw e;
      }
    }
    const scrise = [];
    let f = null, s = null;
    try {
      if (typeof date.md === 'string') { f = scrieFisa(folder, id, date.md, date.hash ?? null); if (!f.neschimbat) scrise.push({ rel: f.fisier, inainte: f.inainte }); }
      if (Object.keys(cerute).length) {
        s = scrieMasa(c, [{ id, ...cerute }], m.hash);
        if (!s.neschimbat) scrise.push({ rel: s.fisier, inainte: s.inainte });
      }
      // O bifă scoasă de pe un obiectiv care avea piesa în lista lui „piese” (harvest-obiective.yml): o scoatem și de acolo.
      const scoase = Array.isArray(date.scoateDinObiective) ? date.scoateDinObiective.map(String) : [];
      const ho = c.harvestObiective, din = scoase.filter((o) => ho?.obiective.find((y) => y.id === o)?.piese.includes(id));
      if (din.length) {
        const o = scrieObiective(folder, { schimbari: din.map((x) => ({ id: x, scoatePiesa: id })) }, date.hashOb ?? null);
        if (!o.neschimbat) scrise.push({ rel: o.fisier, inainte: o.inainte });
      }
    } catch (e) { // a doua scriere a eșuat: prima revine
      for (const { rel, inainte } of scrise.reverse()) { if (inainte == null) rmSync(caleSigura(folder, rel), { force: true }); else writeFileSync(caleSigura(folder, rel), inainte); }
      throw e;
    }
    if (scrise.length) { const rau = cuBuildMulte(scrise); if (rau) return rau; }
    const dupa = fisaSursa(id);
    if (scrise.length) log(`  fișa: ${scrise.map((x) => x.rel).join(', ')}${f?.copie ? `; copie: ${f.copie}` : ''}${s?.copie ? `; copie: ${s.copie}` : ''}`);
    return { cod: 200, corp: { ok: true, neschimbat: !scrise.length, fisa: fisaPiesei(folder, id), sursa: dupa, copie: f?.copie ?? null, copieMasa: s?.copie ?? null } };
  }
  function fisaNoua(date) {
    const c = cursAcum();
    const m = citesteMasa(c, [], []);
    if (!m.exista) throw new EroareEditor(`Cursul nu are încă ${MASA}. Apasă întâi „Creează ${MASA}”.`, 404);
    const ocupate = new Set([...m.candidate.map((x) => x.id), ...c.piese.keys(), ...c.module.map((x) => x.id).filter(Boolean), ...fiseExistente(folder)]);
    const id = idDinTitlu(date.titlu, ocupate);
    const s = adaugaCandidata(c, { id, titlu: date.titlu, scop: date.scop, durata: date.durata, tip: date.tip }, null);
    const scrise = [{ rel: s.fisier, inainte: s.inainte }];
    try {
      const f = scrieFisa(folder, id, sablonFisa({ id, titlu: String(date.titlu).trim(), durata: +date.durata, tip: date.tip || '' }), null);
      scrise.push({ rel: f.fisier, inainte: null });
    } catch (e) { writeFileSync(caleSigura(folder, s.fisier), s.inainte); throw e; }
    const rau = cuBuildMulte(scrise); if (rau) return rau;
    log(`  piesă nouă: ${id} (${s.fisier} + ${HARVEST}/${id}.md)`);
    return { cod: 200, corp: { ok: true, id, fisier: `${HARVEST}/${id}.md` } };
  }
  // ---------- Biblioteca core (spec Radu, 2026-11-20): copie cu legătură; nimic nu se sincronizează singur ----------
  function farCore() { if (!core) throw new EroareEditor('Editorul nu are biblioteca core (cursul nu e în privat/cursuri/). Pornește-l cu --biblioteca <cale>.', 404); }
  function legaturaPe(id) {
    const c = cursAcum(), { m, x } = candidataAcum(c, String(id ?? ''));
    if (!m.exista) throw new EroareEditor(`Cursul nu are încă ${MASA}. Apasă întâi „Creează ${MASA}”.`, 404);
    if (!x) throw new EroareEditor(`nu găsesc piesa „${String(id).slice(0, 60)}” în ${m.fisier}`, 404);
    return { c, m, x };
  }
  /** Rândul din harvest.yml primește (sau pierde) din/baza; scrierea intră în aceleași scrieri, ca să revină la nevoie. */
  function scrieLegatura(c, m, id, campuri, s) {
    try { const r = scrieMasa(c, [{ id, ...campuri }], m.hash); if (!r.neschimbat) s.adaugaScris(caleSigura(folder, r.fisier), r.inainte); }
    catch (e) { s.inapoi(); throw e; }
  }
  function buildSauInapoi(s, ce) {
    const r = construieste();
    if (r.ok) { ultim = r; log(`  core: ${ce} (${s.fisiere.join(', ')})`); return null; }
    s.inapoi(); ultim = construieste();
    return { cod: 422, corp: { eroare: 'Build-ul cursului a refuzat schimbarea, așa că fișierele au rămas cum erau (și în curs, și în core).', erori: r.erori } };
  }
  function coreStare(id) {
    if (!core) return { activ: false };
    id = String(id ?? '');
    const c = cursAcum(), { m, x } = candidataAcum(c, id);
    const C = amprentaPiesei(folder, id), idc = idDinLegatura(x?.din), L = idc ? amprentaPiesei(core, idc) : null;
    const st = idc ? stareCore(x.baza ?? null, L, C) : null;
    const randuri = citesteCore(core).piese;
    return { activ: true, core: scurt(core), areMasa: m.exista, areRand: !!x, legata: !!idc, din: x?.din ?? null, idCore: idc, B: x?.baza ?? null, L, C,
      stare: st, text: st ? STARI[st] : null, areCeva: C != null, ocupat: !idc && (randuri.some((r) => r.id === id) || amprentaPiesei(core, id) != null) };
  }
  function coreLista() {
    if (!core) return { activ: false, piese: [] };
    const k = citesteCore(core), c = cursAcum(), m = citesteMasa(c, [], []);
    const legate = new Set(m.candidate.map((x) => idDinLegatura(x.din)).filter(Boolean));
    return { activ: true, core: scurt(core), exista: k.exista, erori: k.erori, piese: k.piese.map(({ amprenta: _a, ...r }) => ({ ...r, inCurs: legate.has(r.id) })) };
  }
  function coreCompara(id) {
    farCore();
    const { x } = legaturaPe(id), idc = idDinLegatura(x.din);
    if (!idc) throw new EroareEditor('Piesa nu e legată de core.', 422);
    return { curs: fisaPiesei(folder, x.id), core: existsSync(core) ? fisaPiesei(core, idc) : { sursa: null, html: '' }, din: x.din };
  }
  function coreTrimite(date) {
    farCore();
    const { c, m, x } = legaturaPe(date.id);
    const t = trimiteInCore({ curs: folder, core, id: x.id, rand: { titlu: x.titlu, scop: x.scop, durata: x.durata, tip: x.tip, etichete: (c.piese.get(x.id)?.etichete ?? []).map((e) => (typeof e === 'string' ? e : e.text)) },
      legatura: x.din ?? null, baza: x.baza ?? null, idCore: date.idCore == null || date.idCore === '' ? undefined : String(date.idCore),
      asteptat: 'asteptat' in date ? date.asteptat : undefined, dinCurs: basename(folder) });
    scrieLegatura(c, m, x.id, { din: t.din, baza: t.baza }, t.s);
    const rau = buildSauInapoi(t.s, `${x.id} → ${t.din}`); if (rau) return rau;
    return { cod: 200, corp: { ok: true, din: t.din, baza: t.baza, fisiere: t.s.fisiere } };
  }
  function coreIa(date) {
    farCore();
    const { c, m, x } = legaturaPe(date.id);
    const t = iaDinCore({ curs: folder, core, id: x.id, legatura: x.din, vazut: { C: date.C ?? null, L: date.L ?? null } });
    scrieLegatura(c, m, x.id, { baza: t.baza }, t.s);
    const rau = buildSauInapoi(t.s, `${x.din} → ${x.id}`); if (rau) return rau;
    return { cod: 200, corp: { ok: true, baza: t.baza, fisiere: t.s.fisiere } };
  }
  function coreRaman(date) {
    farCore();
    const { c, m, x } = legaturaPe(date.id), idc = idDinLegatura(x.din);
    if (!idc) throw new EroareEditor('Piesa nu e legată de core.', 422);
    const L = amprentaPiesei(core, idc);
    if (L == null || L !== date.L) throw new EroareEditor('Core s-a schimbat între timp. Redeschide fișa.', 409);
    const s = new Scrieri();
    scrieLegatura(c, m, x.id, { baza: L }, s);
    const rau = buildSauInapoi(s, `${x.id}: rămân la versiunea cursului`); if (rau) return rau;
    return { cod: 200, corp: { ok: true, baza: L } };
  }
  function coreDezleaga(date) {
    const { c, m, x } = legaturaPe(date.id);
    if (!x.din) return { cod: 200, corp: { ok: true, neschimbat: true } };
    const s = new Scrieri();
    scrieLegatura(c, m, x.id, { din: null, baza: null }, s);
    const rau = buildSauInapoi(s, `${x.id}: dezlegată de ${x.din}`); if (rau) return rau;
    return { cod: 200, corp: { ok: true } };
  }
  function coreAdauga(date) {
    farCore();
    const c = cursAcum(), m = citesteMasa(c, [], []);
    if (!m.exista) throw new EroareEditor(`Cursul nu are încă ${MASA}. Apasă întâi „Creează ${MASA}”.`, 404);
    const idc = String(date.idCore ?? '');
    if (m.candidate.some((x) => x.din === `${PREFIX}${idc}`)) throw new EroareEditor(`${PREFIX}${idc} e deja în curs.`, 409);
    const idNou = date.idNou == null || date.idNou === '' ? idc : String(date.idNou);
    const ocupate = new Set([...m.candidate.map((x) => x.id), ...c.piese.keys(), ...c.module.map((x) => x.id).filter(Boolean), ...fiseExistente(folder)]);
    if (ocupate.has(idNou)) {
      let propus = `${idc}-core`, n = 2; while (ocupate.has(propus)) propus = `${idc}-core-${n++}`;
      const e = new EroareEditor(`Cursul are deja o piesă „${idNou}”. Dă alt id piesei din core.`, 409);
      e.conflict = { ocupat: true, propus }; throw e;
    }
    const t = adaugaDinCore({ curs: folder, core, idCore: idc, idNou });
    try {
      const r = t.rand, s = adaugaCandidata(cursAcum(), { id: t.id, titlu: r.titlu, scop: r.scop, durata: r.durata, tip: r.tip, sursa: 'core', din: t.din, baza: t.baza }, m.hash);
      t.s.adaugaScris(caleSigura(folder, s.fisier), s.inainte);
    } catch (e) { t.s.inapoi(); throw e; }
    const rau = buildSauInapoi(t.s, `${t.din} → ${t.id}`); if (rau) return rau;
    return { cod: 200, corp: { ok: true, id: t.id, din: t.din, fisiere: t.s.fisiere } };
  }

  const MASA_API = { '/api/core/trimite': coreTrimite, '/api/core/ia': coreIa, '/api/core/raman': coreRaman, '/api/core/dezleaga': coreDezleaga, '/api/core/adauga': coreAdauga,
    '/api/masa': masaSchimba, '/api/masa/creeaza': masaCreeaza, '/api/masa/agenda': masaAgenda, '/api/fisa/salveaza': fisaSalveaza, '/api/fisa/noua': fisaNoua,
    '/api/obiective': obiectiveSchimba, '/api/obiective/nou': obiectivNou, '/api/obiective/creeaza': obiectiveCreeaza };

  const server = createServer((req, res) => {
    const trimite = (cod, corp, tip = 'application/json; charset=utf-8') => {
      res.writeHead(cod, { 'Content-Type': tip, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' });
      res.end(typeof corp === 'string' ? corp : JSON.stringify(corp));
    };
    // Doar cereri adresate chiar acestui server (apără de „DNS rebinding”): Host trebuie să fie 127.0.0.1:<port> sau localhost:<port>.
    const p = server.address().port;
    if (![`127.0.0.1:${p}`, `localhost:${p}`].includes(req.headers.host)) return trimite(403, { eroare: 'gazdă nepermisă' });
    const u = new URL(req.url, `http://127.0.0.1:${p}`);
    if (req.method === 'GET' && u.pathname === '/') {
      if (!tokenBun(u.searchParams.get('t'))) return trimite(403, '<!doctype html><meta charset="utf-8"><p style="font:16px system-ui;margin:2rem">Linkul nu e bun. Deschide-l pe cel afișat în fereastra Terminal în care rulează editorul.</p>', 'text/html; charset=utf-8');
      laZi();
      return trimite(200, pagina(), 'text/html; charset=utf-8');
    }
    if (!u.pathname.startsWith('/api/')) return trimite(404, { eroare: 'nu există' });
    if (!tokenBun(req.headers['x-editor-token'])) return trimite(403, { eroare: 'token lipsă sau greșit' });
    if (req.method === 'GET' && u.pathname === '/api/stare') return trimite(200, { schimbate: schimbate(), build: { ok: ultim.ok, erori: ultim.erori ?? [] } });
    if (req.method === 'GET' && u.pathname === '/api/bloc') {
      try { return trimite(200, citesteBloc(folder, u.searchParams.get('ref'))); } catch (e) { return trimite(e.cod ?? 500, { eroare: e.message }); }
    }
    // Fișa piesei din Harvest (2026-11-19): citită acum de pe disc, ca să se vadă ce scriu Irina și Daria între timp.
    if (req.method === 'GET' && u.pathname === '/api/fisa') {
      try { return trimite(200, u.searchParams.get('fel') === 'obiectiv' ? fisaObiectivului(folder, u.searchParams.get('id')) : fisaPiesei(folder, u.searchParams.get('id'))); } catch (e) { return trimite(e.cod ?? 500, { eroare: e.message }); }
    }
    const CORE_GET = { '/api/core': () => coreLista(), '/api/core/stare': () => coreStare(u.searchParams.get('id')), '/api/core/compara': () => coreCompara(u.searchParams.get('id')) };
    if (req.method === 'GET' && CORE_GET[u.pathname]) {
      try { return trimite(200, CORE_GET[u.pathname]()); } catch (e) { return trimite(e.cod ?? 500, { eroare: e.message }); }
    }
    if (req.method === 'GET' && u.pathname === '/api/fisa/sursa') {
      try { return trimite(200, fisaSursa(u.searchParams.get('id'), u.searchParams.get('fel'))); } catch (e) { return trimite(e.cod ?? 500, { eroare: e.message }); }
    }
    if (req.method !== 'POST' || !['/api/bloc', '/api/previzualizare', ...Object.keys(MASA_API)].includes(u.pathname)) return trimite(404, { eroare: 'nu există' });
    if (!/^application\/json\b/.test(req.headers['content-type'] ?? '')) return trimite(415, { eroare: 'se trimite JSON' });
    let corp = '';
    req.setEncoding('utf8');
    req.on('data', (d) => { corp += d; if (corp.length > MAX_CORP) { trimite(413, { eroare: 'prea mare' }); req.destroy(); } });
    req.on('end', () => {
      if (res.writableEnded) return;
      let date; try { date = JSON.parse(corp); } catch { return trimite(400, { eroare: 'JSON greșit' }); }
      try {
        if (u.pathname === '/api/previzualizare') return trimite(200, previzualizare(date.ref, String(date.md ?? '')));
        if (ocupat) return trimite(409, { eroare: 'Se salvează altceva chiar acum. Mai încearcă o dată.' });
        ocupat = true;
        if (MASA_API[u.pathname]) {
          try { const r = MASA_API[u.pathname](date ?? {}); return trimite(r.cod, r.corp); }
          catch (e) { return trimite(e.cod ?? 500, { eroare: e.message, ...(e.conflict ? { conflict: e.conflict } : {}) }); }
          finally { ocupat = false; }
        }
        try {
          const s = scrieBloc(folder, date.ref, date.md, date.hash);
          if (s.neschimbat) return trimite(200, { ok: true, neschimbat: true, schimbate: schimbate() });
          const nou = construieste();
          if (!nou.ok) {
            // Build-ul a refuzat textul (de exemplu un nume interzis): fișierul revine la ce era, textul rămâne în pagină.
            writeFileSync(caleSigura(folder, s.fisier), s.inainte);
            ultim = construieste();
            return trimite(422, { eroare: 'Build-ul a refuzat schimbarea, așa că fișierul a rămas cum era.', erori: nou.erori });
          }
          ultim = nou;
          log(`  salvat: ${s.fisier} (${date.ref}); copie: ${s.copie}`);
          return trimite(200, { ok: true, fisier: s.fisier, copie: s.copie, schimbate: schimbate(), avertismente: nou.avertismente });
        } finally { ocupat = false; }
      } catch (e) { return trimite(e.cod ?? 500, { eroare: e.message }); }
    });
  });

  await new Promise((ok, rau) => {
    server.once('error', (e) => {
      if (e.code === 'EADDRINUSE' && port !== 0) { server.listen(0, '127.0.0.1', ok); } else rau(e);
    });
    server.listen(port, '127.0.0.1', ok);
  });
  const url = `http://127.0.0.1:${server.address().port}/?t=${token}#ecrane`;
  if (deschide && process.platform === 'darwin') spawn('open', [url], { stdio: 'ignore', detached: true }).unref();
  return { url, token, server, folder, core, inchide: () => new Promise((ok) => server.close(ok)), ultim: () => ultim, laZi };
}

// Linia de comandă
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const folder = args.find((a, i) => !a.startsWith('--') && !['--port', '--biblioteca'].includes(args[i - 1])) ?? IMPLICIT;
  try {
    const e = await pornesteEditor({ folder: resolve(process.cwd(), folder), port: val('--port') ? +val('--port') : 4747, deschide: !args.includes('--fara-browser'),
      biblioteca: val('--biblioteca') ? resolve(process.cwd(), val('--biblioteca')) : undefined });
    const ok = e.ultim().ok;
    console.log(`\nEditorul cursului rulează pentru ${e.folder}${ok ? '' : ' (ATENȚIE: build-ul e oprit; pagina arată de ce)'}.`);
    console.log(e.core ? `Biblioteca core: ${e.core}${existsSync(e.core) ? '' : ' (se creează la prima piesă trimisă)'}` : 'Biblioteca core: niciuna (cursul nu e în privat/cursuri/; pornește cu --biblioteca <cale>)');
    console.log(`Deschide: ${e.url}`);
    console.log('Fereastra asta trebuie să rămână deschisă cât editezi. Ca să oprești editorul: Ctrl+C sau închide fereastra.\n');
    process.on('SIGINT', () => { e.inchide().then(() => process.exit(0)); });
  } catch (err) {
    console.error(`Nu pot porni editorul: ${err.message}`);
    process.exit(1);
  }
}
