#!/usr/bin/env node
// Editorul local al cursului (1.11, Alex, 2026-11-17): materialul trainerului, cu butonul „Editează” pe fiecare ecran.
//   node editor.mjs [<folderul cursului>] [--port 4747] [--fara-browser]
//   npm run editor -- <folder>          (implicit: privat/cursuri/change-agility)
// Serverul ascultă doar pe 127.0.0.1, cere un token aleator (în linkul deschis la pornire) și scrie doar în folderul cursului.
// Fișierul HTML normal (offline) rămâne exact cum e: editarea se adaugă doar în paginile servite de aici.
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { build } from './build.mjs';
import { citesteCurs } from './lib/sursa.mjs';
import { ecranul } from './lib/trainer.mjs';
import { creeazaRandare, escapeHtml } from './lib/randare.mjs';
import { citesteBloc, scrieBloc, EroareEditor, citesteRef, caleSigura, copieIstoric } from './lib/editor-sursa.mjs';
import { citesteMasa, scrieMasa, agendaDinMasa, textAgenda, inlocuiesteAgenda, textMasa, propunere, FISIER as MASA, FISIER_VECHI as MASA_VECHI } from './lib/masa.mjs';
import { mkdirSync, rmSync } from 'node:fs';

const AICI = dirname(fileURLToPath(import.meta.url));
const IMPLICIT = join(AICI, '..', 'privat', 'cursuri', 'change-agility');
const MAX_CORP = 256 * 1024;

export async function pornesteEditor({ folder = IMPLICIT, port = 4747, deschide = false, log = console.log } = {}) {
  folder = resolve(folder);
  if (!existsSync(join(folder, 'curs.yml'))) throw new Error(`${folder} nu e folderul unui curs (lipsește curs.yml)`);
  const token = randomBytes(18).toString('hex');
  const out = join(folder, 'dist');
  let ultim = construieste();
  let ocupat = false;

  function construieste() {
    const linii = [];
    const r = build(folder, { out, log: (x) => linii.push(x) });
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
    const config = JSON.stringify({ token, folder: folder.split('/').slice(-2).join('/') }).replace(/</g, '\\u003c');
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
  const MASA_API = { '/api/masa': masaSchimba, '/api/masa/creeaza': masaCreeaza, '/api/masa/agenda': masaAgenda };

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
      return trimite(200, pagina(), 'text/html; charset=utf-8');
    }
    if (!u.pathname.startsWith('/api/')) return trimite(404, { eroare: 'nu există' });
    if (!tokenBun(req.headers['x-editor-token'])) return trimite(403, { eroare: 'token lipsă sau greșit' });
    if (req.method === 'GET' && u.pathname === '/api/stare') return trimite(200, { schimbate: schimbate(), build: { ok: ultim.ok, erori: ultim.erori ?? [] } });
    if (req.method === 'GET' && u.pathname === '/api/bloc') {
      try { return trimite(200, citesteBloc(folder, u.searchParams.get('ref'))); } catch (e) { return trimite(e.cod ?? 500, { eroare: e.message }); }
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
          try { const r = MASA_API[u.pathname](date ?? {}); return trimite(r.cod, r.corp); } finally { ocupat = false; }
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
  return { url, token, server, folder, inchide: () => new Promise((ok) => server.close(ok)), ultim: () => ultim };
}

// Linia de comandă
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const val = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
  const folder = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--port') ?? IMPLICIT;
  try {
    const e = await pornesteEditor({ folder: resolve(process.cwd(), folder), port: val('--port') ? +val('--port') : 4747, deschide: !args.includes('--fara-browser') });
    const ok = e.ultim().ok;
    console.log(`\nEditorul cursului rulează pentru ${e.folder}${ok ? '' : ' (ATENȚIE: build-ul e oprit; pagina arată de ce)'}.`);
    console.log(`Deschide: ${e.url}`);
    console.log('Fereastra asta trebuie să rămână deschisă cât editezi. Ca să oprești editorul: Ctrl+C sau închide fereastra.\n');
    process.on('SIGINT', () => { e.inchide().then(() => process.exit(0)); });
  } catch (err) {
    console.error(`Nu pot porni editorul: ${err.message}`);
    process.exit(1);
  }
}
