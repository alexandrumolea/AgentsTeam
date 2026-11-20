// Vederea „Masa” (etapa A, Alex, 2026-11-18): piesele candidate din masa.yml, în trei coloane.
// Fluxul (Alex, 2026-11-18): Masa → Biblioteca → Agenda. Coloanele: 1 Brainstorming (nou; „poate” rămâne pe masă; „nu” ascuns),
// 2 Bibliotecă (da, produse sau de produs), 3 Agendă (blocurile zilei, cu pauzele fixe între ele). Sus, rezumatul: panoul de control.
// Offline: schimbările stau în acest browser, iar „Copiază masa.yml” dă fișierul. În editorul local (curs/editor.mjs), fiecare
// schimbare se scrie direct în masa.yml, prin window.__masaEditor, pe care îl pune doar pagina servită de editor. Fără biblioteci, fără internet.
(function () {
  'use strict';
  if (location.hash === '#sala' || /^#tipar-/.test(location.hash)) return;
  var DATA = JSON.parse(document.getElementById('date-curs').textContent);
  var M = DATA.masa;
  if (!M || !document.getElementById('masa')) return;
  var $ = function (id) { return document.getElementById(id); };
  var F = M.fisier || 'harvest.yml'; // fișierul cursului (masa.yml doar la cursurile vechi, cu avertisment la build)
  var BLOCURI = DATA.blocuri && DATA.blocuri.length ? DATA.blocuri : [{ nr: 1, start: DATA.editie.start, sfarsit: null, disponibil: null, pauzaDupa: null }];
  var CHEIE = 'curs:' + DATA.curs.slug + ':masa';
  var CAMPURI = ['verdict', 'bloc', 'ordine'];
  var TIP = { teorie: 'teorie', model: 'model', poveste: 'poveste', exercitiu: 'exercițiu', challenge: 'challenge', reflectie: 'reflecție', energizant: 'energizant', deschidere: 'deschidere', inchidere: 'închidere', mesaj: 'mesaj', pauza: 'pauză' };
  var FEL = { teorie: 'teorie', model: 'teorie', poveste: 'teorie', reflectie: 'reflectie', deschidere: 'reflectie', inchidere: 'reflectie', mesaj: 'mesaj', exercitiu: 'exercitiu', challenge: 'exercitiu', energizant: 'exercitiu', pauza: 'pauza' };
  var VERDICT = { da: 'Da', poate: 'Poate', nu: 'Nu' };
  var json = function (id) { try { return JSON.parse(document.getElementById(id).textContent) || {}; } catch (e) { return {}; } };
  var FISE = json('fise'), IMG = json('imagini'); // fișele incluse la build (offline); în editor se recitesc de pe disc

  var cand = M.candidate.map(function (x) { var y = {}; for (var k in x) y[k] = x[k]; return y; });
  var ID = {}; cand.forEach(function (x) { ID[x.id] = x; });
  var respinse = false, fokus = null, local = null;
  var editor = function () { return window.__masaEditor || null; }; // doar în pagina servită de editorul local
  var blocat = function () { return !!(editor() && M.propunere); }; // în editor, fără masa.yml: întâi „Creează masa.yml”

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var oraDin = function (m) { return m == null ? '' : Math.floor(m / 60) + ':' + pad(m % 60); };
  var timp = function (m) { var a = Math.abs(m); return a >= 60 ? Math.floor(a / 60) + ' h' + (a % 60 ? ' ' + (a % 60) + ' min' : '') : a + ' min'; };

  // ---------- starea: ce coloană, ce bloc, ce ordine ----------
  var inOrdonate = function (x) { return x.bloc != null && x.verdict !== 'nu'; };
  function dinBloc(k) {
    return cand.map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.bloc === k && o.x.verdict !== 'nu'; })
      .sort(function (a, b) { return (a.x.ordine == null ? 1e9 : a.x.ordine) - (b.x.ordine == null ? 1e9 : b.x.ordine) || a.i - b.i; }).map(function (o) { return o.x; });
  }
  function renumeroteaza() {
    cand.forEach(function (x) { if (!inOrdonate(x)) { x.bloc = x.verdict === 'nu' ? null : x.bloc; if (x.bloc == null) x.ordine = null; } });
    BLOCURI.forEach(function (b) { dinBloc(b.nr).forEach(function (x, i) { x.ordine = i + 1; }); });
  }
  function poza() { var p = {}; cand.forEach(function (x) { p[x.id] = { verdict: x.verdict, bloc: x.bloc, ordine: x.ordine }; }); return p; }
  function diferente(inainte) {
    var out = [];
    cand.forEach(function (x) {
      var a = inainte[x.id], s = { id: x.id }, n = 0;
      CAMPURI.forEach(function (k) { if (a[k] !== x[k]) { s[k] = x[k]; n++; } });
      if (n) out.push(s);
    });
    return out;
  }
  /** Orice schimbare trece pe aici: o aplicăm, renumerotăm blocurile, salvăm diferențele, redesenăm. */
  function schimba(fn) {
    if (blocat()) { mesaj('Întâi apasă „Creează harvest.yml”: abia apoi se pot salva verdictele și ordinea.'); return; }
    var inainte = poza();
    fn(); renumeroteaza();
    var d = diferente(inainte);
    if (d.length) salveaza(d);
    randeaza();
  }
  function verdict(id, v) {
    schimba(function () { var x = ID[id]; x.verdict = v; if (v === 'nu') { x.bloc = null; x.ordine = null; } });
  }
  function inBloc(id, k, poz) {
    schimba(function () {
      var x = ID[id], lista = dinBloc(k).filter(function (y) { return y !== x; });
      if (x.verdict === 'nou' || x.verdict === 'nu') x.verdict = 'da';
      lista.splice(poz == null ? lista.length : Math.max(0, Math.min(lista.length, poz)), 0, x);
      x.bloc = k; lista.forEach(function (y, i) { y.ordine = i + 1; });
    });
  }
  function scoate(id) { schimba(function () { var x = ID[id]; x.bloc = null; x.ordine = null; if (x.verdict === 'nou') x.verdict = 'da'; }); }
  /** ↑ ↓ în Agendă: un loc mai sus sau mai jos; la marginea blocului, trece în blocul vecin. */
  function muta(id, pas) {
    var x = ID[id]; if (!inOrdonate(x)) return false;
    var lista = dinBloc(x.bloc), i = lista.indexOf(x), k = x.bloc;
    if (pas < 0 && i === 0) { if (k > 1) inBloc(id, k - 1); return true; }
    if (pas > 0 && i === lista.length - 1) { if (k < BLOCURI.length) inBloc(id, k + 1, 0); return true; }
    inBloc(id, k, i + pas);
    return true;
  }

  // ---------- salvarea ----------
  var coada = [], inZbor = false;
  function salveaza(d) {
    if (editor()) { coada = coada.concat(d); trimiteCoada(); return; }
    local = local || { schimbari: {} };
    d.forEach(function (s) { var o = local.schimbari[s.id] || (local.schimbari[s.id] = {}); CAMPURI.forEach(function (k) { if (k in s) o[k] = s[k]; }); });
    try { localStorage.setItem(CHEIE, JSON.stringify(local)); } catch (e) { /* fără stocare: ține până la închiderea paginii */ }
  }
  function trimiteCoada() {
    if (inZbor || !coada.length) return;
    var lot = {}, ordine = [];
    coada.forEach(function (s) { if (!lot[s.id]) { lot[s.id] = { id: s.id }; ordine.push(s.id); } CAMPURI.forEach(function (k) { if (k in s) lot[s.id][k] = s[k]; }); });
    coada = []; inZbor = true; stare('se salvează…');
    editor().salveaza(ordine.map(function (id) { return lot[id]; }), M.hash).then(function (j) {
      inZbor = false;
      if (j._cod !== 200) { coada = []; mesaj((j.eroare || 'Nu s-a salvat.') + (j.erori && j.erori.length ? ' ' + j.erori.join('; ') : ''), true); stare('nesalvat'); return; }
      M.hash = j.hash; stare('salvat în ' + F); trimiteCoada();
    }, function () { inZbor = false; mesaj('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?', true); stare('nesalvat'); });
  }
  function dupaCoada() {
    return new Promise(function (ok) { (function verifica() { if (!inZbor && !coada.length) ok(); else setTimeout(verifica, 80); })(); });
  }
  function citesteLocal() {
    if (editor()) return;
    try { var v = JSON.parse(localStorage.getItem(CHEIE)); local = v && v.schimbari ? v : null; } catch (e) { local = null; }
    if (!local) return;
    Object.keys(local.schimbari).forEach(function (id) { var x = ID[id], s = local.schimbari[id]; if (x) CAMPURI.forEach(function (k) { if (k in s) x[k] = s[k]; }); });
    renumeroteaza();
  }
  function reseteaza() {
    local = null; try { localStorage.removeItem(CHEIE); } catch (e) { /* nimic */ }
    cand.forEach(function (x, i) { CAMPURI.forEach(function (k) { x[k] = M.candidate[i][k]; }); });
    $('masa-text-cutie').hidden = true;
    renumeroteaza(); randeaza(); mesaj('Harvest e din nou ca în ' + F + '.');
  }

  // ---------- desenul ----------
  function carte(x) {
    var meta = (x.tip ? '<span class="mc-tip"><span class="semn-mic fel-' + (FEL[x.tip] || 'teorie') + (x.tip === 'challenge' ? ' semn-challenge' : '') + '" aria-hidden="true"></span>' + esc(TIP[x.tip] || x.tip) + '</span>' : '') +
      (x.sursa ? '<span class="mc-sursa">' + esc(x.sursa) + '</span>' : '') +
      (x.produsa ? '<span class="mc-produsa" title="Are deja fișierul în piese/">produsă</span>' : '') +
      (x.nota ? '<span class="mc-nota" title="' + esc(x.nota) + '">notă</span>' : '');
    var areFisa = !!FISE[x.id];
    return '<li class="masa-carte v-' + x.verdict + (x.produsa ? ' produsa' : '') + '" data-id="' + esc(x.id) + '" tabindex="0" aria-label="' + esc(x.titlu + ', ' + x.durata + ' min, verdict ' + x.verdict + (x.produsa ? ', produsă' : '')) + '"' + (x.nota ? ' title="' + esc(x.nota) + '"' : '') + '>' +
      '<span class="ec-maner masa-maner" aria-hidden="true" title="Trage ca să muți">⠿</span>' +
      '<div class="mc-rand"><span class="mc-durata"><b>' + x.durata + '</b> min</span><span class="mc-cap"><span class="mc-titlu">' + esc(x.titlu) + '</span>' + (x.scop ? '<span class="mc-scop">' + esc(x.scop) + '</span>' : '') + '</span></div>' +
      '<div class="mc-jos"><span class="mc-meta"><button type="button" class="mc-fisa' + (areFisa ? '' : ' fara') + '" data-fisa="' + esc(x.id) + '" aria-label="Deschide fișa: ' + esc(x.titlu) + '" title="' + (areFisa ? 'Toată logica piesei (tasta F)' : 'Fișa nu e scrisă încă') + '">Fișa</button>' + meta + '</span><span class="mc-verdict" role="group" aria-label="Verdict">' +
      ['da', 'poate', 'nu'].map(function (v) { return '<button type="button" data-v="' + v + '" aria-pressed="' + (x.verdict === v) + '"' + (blocat() ? ' disabled' : '') + '>' + VERDICT[v] + '</button>'; }).join('') +
      '</span></div></li>';
  }
  function totalBloc(b, ids) {
    var folosit = 0; ids.forEach(function (id) { var x = ID[id]; if (x && x.verdict !== 'nu') folosit += +x.durata || 0; });
    if (b.disponibil == null) return { clasa: '', text: folosit + ' min' };
    var dif = b.disponibil - folosit;
    return { clasa: dif < 0 ? 'depasire' : dif === 0 ? 'plin' : 'ramas', text: folosit + ' din ' + b.disponibil + ' min', stare: dif < 0 ? 'depășire ' + timp(-dif) : dif === 0 ? 'plin' : 'liber ' + timp(dif) };
  }
  function capBloc(b, t) {
    return '<span class="masa-bloc-nume"><b>Blocul ' + b.nr + '</b>' + (b.start != null && b.sfarsit != null ? ' <span class="sters">' + oraDin(b.start) + '–' + oraDin(b.sfarsit) + '</span>' : '') + '</span>' +
      '<span class="masa-bloc-total">' + t.text + '</span>' + (t.stare ? '<span class="masa-bloc-stare">' + t.stare + '</span>' : '');
  }
  var grup = function (lista, tip, titlu, ajutor, carti) {
    return '<div class="masa-grup" data-grup="' + tip + '">' + (titlu ? '<p class="masa-sub" id="masa-h-' + tip + '">' + titlu + ' <span class="banca-grup-nr">' + carti.length + '</span></p>' : '') +
      (ajutor ? '<p class="masa-col-ajutor sters">' + ajutor + '</p>' : '') +
      '<ol class="masa-lista" data-lista="' + tip + '"' + (titlu ? ' aria-labelledby="masa-h-' + tip + '"' : '') + '>' + carti.map(carte).join('') + '</ol></div>';
  };
  function randeaza() {
    var col = $('masa-coloane'); if (!col) return;
    var fara = function (v) { return cand.filter(function (x) { return x.verdict === v && x.bloc == null; }); };
    var noi = fara('nou'), poate = fara('poate'), biblioteca = fara('da');
    var nu = cand.filter(function (x) { return x.verdict === 'nu'; });
    var nOrd = 0;
    var blocuri = BLOCURI.map(function (b) {
      var ale = dinBloc(b.nr); nOrd += ale.length;
      var t = totalBloc(b, ale.map(function (x) { return x.id; }));
      var p = b.pauzaDupa;
      return '<div class="masa-bloc ' + t.clasa + '" data-bloc="' + b.nr + '"><p class="masa-bloc-cap" id="masa-cap-' + b.nr + '">' + capBloc(b, t) + '</p>' +
        '<ol class="masa-lista" data-lista="bloc" data-bloc="' + b.nr + '" aria-labelledby="masa-cap-' + b.nr + '">' + ale.map(carte).join('') + '</ol></div>' +
        (p ? '<p class="masa-pauza"><span class="semn-mic fel-pauza" aria-hidden="true"></span>' + oraDin(p.la) + ' · ' + esc(p.titlu) + ' · ' + p.min + ' min</p>' : '');
    }).join('');
    // Cele trei etape (Alex, 2026-11-18): Brainstorming → Bibliotecă → Agendă. „Poate” rămâne pe masă; „Nu” se ascunde.
    col.innerHTML =
      '<section class="masa-col" data-col="brainstorming" aria-labelledby="masa-h-b"><h3 class="eticheta" id="masa-h-b">1 · Harvest <span class="banca-grup-nr">' + (noi.length + poate.length) + '</span></h3>' +
      grup(noi, 'nou', '', 'Tot ce a ieșit din Laborator: exerciții, knowledge bites, experiences. Fără verdict încă.', noi) +
      grup(poate, 'poate', 'Poate', 'Rămân în Harvest, nu intră încă în Bibliotecă.', poate) +
      (respinse ? grup(nu, 'nu', 'Nu', 'Respinse. Nu intră nicăieri.', nu) : '') + '</section>' +
      '<section class="masa-col" data-col="biblioteca" aria-labelledby="masa-h-l"><h3 class="eticheta" id="masa-h-l">2 · Curate <span class="banca-grup-nr">' + biblioteca.length + '</span></h3>' +
      grup(biblioteca, 'biblioteca', '', 'Ce e suficient de actual și cu sens („Da”) rămâne în Bibliotecă, produs sau de produs. Cele puse în zi stau la Flow.', biblioteca) + '</section>' +
      '<section class="masa-col masa-ordonate" data-col="agenda" aria-labelledby="masa-h-o"><h3 class="eticheta" id="masa-h-o">3 · Flow <span class="banca-grup-nr">' + nOrd + '</span></h3>' + blocuri + '</section>';
    var r = $('masa-respinse'); r.setAttribute('aria-pressed', respinse ? 'true' : 'false'); r.textContent = respinse ? 'Ascunde „Nu” (' + nu.length + ')' : 'Arată și „Nu” (' + nu.length + ')'; r.disabled = !nu.length && !respinse;
    $('masa-reset').hidden = !!editor() || !local;
    $('masa-agenda').disabled = blocat();
    rezumat(); stare();
    if (fokus) { var f = col.querySelector('.masa-carte[data-id="' + fokus + '"]'); if (f) f.focus({ preventScroll: false }); }
  }
  var ultimaStare = '';
  function stare(t) {
    if (t != null) ultimaStare = t;
    var s = $('masa-stare'); if (!s) return;
    s.textContent = editor() ? (M.propunere ? 'propunere, încă fără harvest.yml' : ultimaStare || 'se salvează în ' + F) : local ? 'schimbări salvate în acest browser' : 'ca în ' + F;
  }

  // ---------- rezumatul: panoul de control al cursului (Alex, 2026-11-18) ----------
  // Fiecare cifră duce la vederea ei. Agenda „de pe masă” = cartonașele din blocuri; „agenda ediției” = ce e acum în ediție (DATA.module).
  var OBIECTIVE = DATA.obiective || [];
  var obiectiveDe = function (x) { var o = {}; (x.obiective || []).concat(x.obFisier || []).forEach(function (n) { o[n] = 1; }); return o; };
  /** Agenda de pe masă, ca perechi id + bloc (doar ce intră la „Trimite”: Da și produsă), față de agenda ediției. */
  function sincronizata() {
    var masa = [], editie = [];
    BLOCURI.forEach(function (b) { dinBloc(b.nr).forEach(function (x) { if (x.verdict === 'da' && x.produsa) masa.push(x.id + '@' + b.nr); }); });
    DATA.module.forEach(function (m) { if (m.id && m.tip !== 'pauza' && !m.live) editie.push(m.id + '@' + (m.bloc || 1)); });
    return masa.join(' ') === editie.join(' ');
  }
  function rezumat() {
    var z = $('masa-rezumat'); if (!z) return;
    var n = function (f) { return cand.filter(f).length; };
    var da = cand.filter(function (x) { return x.verdict === 'da'; });
    var prod = da.filter(function (x) { return x.produsa; }).length;
    var inZi = cand.filter(inOrdonate), deZi = inZi.filter(function (x) { return x.verdict === 'da'; });
    var min = inZi.reduce(function (a, x) { return a + (+x.durata || 0); }, 0);
    var disp = BLOCURI.reduce(function (a, b) { return a + (b.disponibil || 0); }, 0);
    var b = function (rz, html, titlu, extra) { return '<button type="button" class="rz' + (extra ? ' ' + extra : '') + '" data-rz="' + rz + '"' + (titlu ? ' title="' + esc(titlu) + '"' : '') + '>' + html + '</button>'; };
    var cifra = function (k) { return '<b>' + k + '</b>'; };
    var blocuri = BLOCURI.length > 1 ? BLOCURI.map(function (bl) {
      var t = totalBloc(bl, dinBloc(bl.nr).map(function (x) { return x.id; }));
      return b('bloc-' + bl.nr, 'B' + bl.nr + ' ' + t.text.replace(' din ', '/').replace(' min', ''), 'Blocul ' + bl.nr + ': ' + t.text + (t.stare ? ', ' + t.stare : ''), 'rz-mic ' + t.clasa);
    }).join('') : '';
    var ob = OBIECTIVE.map(function (text, i) {
      var k = deZi.filter(function (x) { return obiectiveDe(x)[i + 1]; }).length;
      return b('obiective', (i + 1) + ': ' + cifra(k), 'Obiectivul ' + (i + 1) + ': ' + text + ' · ' + (k ? k + (k === 1 ? ' piesă' : ' piese') + ' în agendă' : 'neacoperit'), 'rz-mic ' + (k ? 'ramas' : 'lipsa'));
    }).join('');
    var neacoperite = OBIECTIVE.filter(function (t, i) { return !deZi.some(function (x) { return obiectiveDe(x)[i + 1]; }); }).length;
    var sinc = sincronizata();
    z.innerHTML =
      '<div class="rz-grup"><span class="rz-eticheta">Harvest</span>' + b('nou', cifra(n(function (x) { return x.verdict === 'nou' && x.bloc == null; })) + ' noi') + b('poate', cifra(n(function (x) { return x.verdict === 'poate'; })) + ' poate') + b('nu', cifra(n(function (x) { return x.verdict === 'nu'; })) + ' nu') + '</div>' +
      '<div class="rz-grup"><span class="rz-eticheta">Bibliotecă</span>' + b('biblioteca', cifra(da.length) + ' piese') + b('produse', cifra(prod) + ' produse') + b('de-produs', cifra(da.length - prod) + ' de produs', '', da.length - prod ? 'atentie' : '') + '</div>' +
      '<div class="rz-grup"><span class="rz-eticheta">Agendă</span>' + b('agenda', cifra(inZi.length) + ' piese · ' + cifra(min) + ' din ' + disp + ' min', 'Din ' + (DATA.total && DATA.total.durataZi || 'ziua cursului') + ', fără pauzele fixe') + blocuri + '</div>' +
      (OBIECTIVE.length ? '<div class="rz-grup"><span class="rz-eticheta">Obiective' + (neacoperite ? ' <span class="rz-lipsa">' + neacoperite + ' neacoperit' + (neacoperite === 1 ? '' : 'e') + '</span>' : '') + '</span>' + ob + '</div>' : '') +
      '<div class="rz-grup"><span class="rz-eticheta">Ediția</span><span class="rz-stare ' + (sinc ? 'ramas' : 'atentie') + '" id="masa-sinc">' + (sinc ? 'agenda e la zi cu firul roșu' : 'agenda diferă de firul roșu') + '</span>' + (sinc ? '' : b('trimite', 'Trimite în agendă', '', 'rz-principal')) + '</div>';
  }
  function mergiLa(v) { var n = document.querySelector('[data-vedere="' + v + '"]'); if (n) n.click(); window.scrollTo(0, 0); }
  function laRezumat(rz) {
    if (rz === 'trimite') { trimiteInAgenda(); return; }
    if (rz === 'nou' || rz === 'poate' || rz === 'nu') {
      if (rz === 'nu' && !respinse) { respinse = true; randeaza(); }
      var g = document.querySelector('.masa-grup[data-grup="' + rz + '"]'); if (g) g.scrollIntoView({ block: 'start' });
      return;
    }
    if (rz === 'biblioteca' || rz === 'produse' || rz === 'de-produs') {
      mergiLa('banca');
      var sterge = $('banca-sterge'); if (sterge && !sterge.hidden) sterge.click();
      var chip = rz === 'biblioteca' ? null : document.querySelector('.chip[data-filtru="stare"][data-valoare="' + (rz === 'produse' ? 'produsa' : 'de-produs') + '"]');
      if (chip && chip.getAttribute('aria-pressed') !== 'true') chip.click();
      return;
    }
    if (rz === 'obiective') { mergiLa('schita'); return; }
    if (rz === 'agenda' || /^bloc-/.test(rz)) {
      mergiLa('ziua');
      var tr = /^bloc-/.test(rz) ? document.querySelector('#ziua tr.bloc-cap[data-bloc="' + rz.slice(5) + '"]') : null;
      if (tr) tr.scrollIntoView({ block: 'start' });
    }
  }
  function mesaj(t, eroare) { var m = $('masa-mesaj'); if (m) { m.textContent = t; m.classList.toggle('eroare', !!eroare); } }
  /** În timpul tragerii, totalurile blocurilor urmăresc cartonașul. */
  function totaluriDinDom() {
    BLOCURI.forEach(function (b) {
      var ol = document.querySelector('.masa-lista[data-bloc="' + b.nr + '"]'); if (!ol) return;
      var t = totalBloc(b, [].map.call(ol.querySelectorAll('.masa-carte'), function (li) { return li.getAttribute('data-id'); }));
      var cutie = ol.parentNode; cutie.className = 'masa-bloc ' + t.clasa; cutie.querySelector('.masa-bloc-cap').innerHTML = capBloc(b, t);
    });
  }

  // ---------- textul pentru fișiere (offline) ----------
  var q = function (t) { t = String(t); return /^[\p{L}\p{N} .,;()–-]*$/u.test(t) && !/^[\s-]|\s$|^(da|nu|true|false|null|yes|no)$/i.test(t) && t !== '' && !/^\d/.test(t) ? t : JSON.stringify(t); };
  /** Același format ca lib/masa.mjs (textMasa). */
  function textMasa() {
    var l = ['# Harvest (etapa C): piesele candidate, înainte de producție. Vederea „Harvest” din materialul trainerului le alege (Curate) și le ordonează (Flow).',
      '# verdict: nou / da / poate / nu · bloc: 1, 2, 3… (blocurile dintre pauzele fixe) sau gol · fără text de slide aici.', 'candidate:'];
    cand.forEach(function (x) {
      l.push('  - id: ' + x.id, '    titlu: ' + q(x.titlu));
      if (x.scop) l.push('    scop: ' + q(x.scop));
      l.push('    durata: ' + x.durata);
      if (x.tip) l.push('    tip: ' + x.tip);
      if (x.sursa) l.push('    sursa: ' + q(x.sursa));
      l.push('    verdict: ' + x.verdict);
      if (x.bloc != null) l.push('    bloc: ' + x.bloc);
      if (x.ordine != null && x.bloc != null) l.push('    ordine: ' + x.ordine);
      if (x.obiective && x.obiective.length) l.push('    obiective: [' + x.obiective.join(', ') + ']');
      if (x.nota) l.push('    nota: ' + q(x.nota));
    });
    return l.join('\n') + '\n';
  }
  /** Același calcul ca lib/masa.mjs (agendaDinMasa): da + fișier produs intră; restul e listat. */
  function agendaDinMasa() {
    var linii = [], deProdus = [], nehotarate = [], bloc = 1;
    BLOCURI.forEach(function (b) {
      dinBloc(b.nr).forEach(function (x) {
        if (x.verdict === 'poate') { nehotarate.push(x); return; }
        if (!x.produsa) { deProdus.push(x); return; }
        if (x.bloc > bloc) { var p = BLOCURI[x.bloc - 2] && BLOCURI[x.bloc - 2].pauzaDupa; linii.push('- bloc: ' + x.bloc + (p ? '   # după pauza de la ' + oraDin(p.la) : '')); bloc = x.bloc; }
        linii.push('- ' + x.id);
      });
    });
    return { linii: linii, deProdus: deProdus, nehotarate: nehotarate };
  }
  var listaTitluri = function (l) { return l.map(function (x) { return x.titlu + ' (' + x.id + ')'; }).join(', '); };
  function arataText(eticheta, text) {
    $('masa-text-eticheta').textContent = eticheta; $('masa-text').value = text; $('masa-text-cutie').hidden = false;
  }
  function copiaza(text, ok) {
    var t = $('masa-text');
    var rezerva = function () {
      t.focus(); t.select(); var reusit = false;
      try { reusit = document.execCommand('copy'); } catch (e) { /* nimic */ }
      if (reusit) ok(); else mesaj('Nu pot copia singur: textul e selectat mai jos, apasă Cmd+C.');
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, rezerva); else rezerva(); } catch (e) { rezerva(); }
  }
  function copiazaMasa() {
    var text = textMasa();
    arataText('harvest.yml, gata de pus în folderul cursului', text);
    copiaza(text, function () { mesaj('Copiat. Pune textul în harvest.yml, în folderul cursului (înlocuiește tot fișierul' + (F !== 'harvest.yml' ? ' și șterge ' + F : '') + '), apoi rulează build-ul.'); });
  }
  function trimiteInAgenda() {
    var a = agendaDinMasa();
    var rest = (a.deProdus.length ? 'De produs (au „Da”, dar nu au încă fișier în piese/): ' + listaTitluri(a.deProdus) + '. ' : '') +
      (a.nehotarate.length ? 'Nehotărâte („Poate”, nu intră): ' + listaTitluri(a.nehotarate) + '.' : '');
    if (!a.linii.some(function (l) { return l.indexOf('- bloc:') !== 0; })) { mesaj('Nicio piesă cu „Da” și fișier produs în blocurile din Flow, deci nu am ce trimite în agendă. ' + rest, true); return; }
    var ed = editor();
    if (!ed) {
      var d = new Date(), text = 'agenda:                 # din Masa, ' + d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + '\n' + a.linii.map(function (l) { return '  ' + l; }).join('\n') + '\n' +
        (a.deProdus.length ? '# De produs: ' + a.deProdus.map(function (x) { return x.id; }).join(', ') + '\n' : '') +
        (a.nehotarate.length ? '# Nehotărâte (poate): ' + a.nehotarate.map(function (x) { return x.id; }).join(', ') + '\n' : '');
      arataText('Agenda pentru editii/' + (M.editie || (DATA.editie.data || '<data>') + '.yml'), text);
      copiaza(text, function () { mesaj('Copiat. Lipește-l în editii/' + (M.editie || '<data>.yml') + ', în locul blocului „agenda:”, apoi rulează build-ul. ' + rest); });
      return;
    }
    if (blocat()) return;
    if (!confirm('Înlocuiești agenda din editii/' + (M.editie || 'ediția nouă') + ' cu firul roșu din Harvest (' + a.linii.filter(function (l) { return l.indexOf('- bloc:') !== 0; }).length + ' rânduri)? Versiunea veche rămâne în .editor-istoric/.')) return;
    mesaj('Trimit în agendă…');
    dupaCoada().then(function () { return ed.agenda(M.hash); }).then(function (j) {
      if (j._cod !== 200) { mesaj((j.eroare || 'Nu am putut scrie agenda.') + (j.erori && j.erori.length ? ' ' + j.erori.join('; ') : ''), true); return; }
      try { sessionStorage.setItem('masa:mesaj', 'Agenda e în ' + j.fisier + ' (' + j.randuri + ' rânduri); materialul e refăcut.' + (j.copie ? ' Versiunea veche: ' + j.copie + '.' : '') + ' ' + rest); } catch (e) { /* nimic */ }
      location.hash = '#masa'; location.reload();
    }, function () { mesaj('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?', true); });
  }

  // ---------- fișa piesei (Alex, 2026-11-19): toată logica piesei, din harvest/<id>.md sau din piesa produsă ----------
  // HTML-ul vine gata randat și escapat (lib/fisa.mjs, la build sau din editor), deci aici doar îl punem în dialog.
  var fisaDe = null;
  function arataFisa(x, f) {
    var d = $('fisa-dialog'); if (!d) return;
    $('fisa-titlu').textContent = x.titlu;
    $('fisa-sursa').textContent = !f || !f.sursa ? 'Fișa · ' + x.id : f.sursa === 'harvest' ? 'Fișa · ' + f.fisier : 'Piesa produsă · ' + f.fisier + ' (încă fără fișă în harvest/)';
    var corp = $('fisa-corp');
    corp.innerHTML = f && f.sursa ? f.html : '<p class="fisa-gol">Fișa nu e scrisă încă.</p>';
    [].forEach.call(corp.querySelectorAll('img[data-img]'), function (im) {
      var src = IMG[im.getAttribute('data-img')];
      if (src) im.src = src; else { var t = document.createElement('span'); t.className = 'sters'; t.textContent = '[imagine: ' + (im.alt || im.getAttribute('data-img')) + ']'; im.replaceWith(t); }
    });
    corp.scrollTop = 0;
    if (!d.open) d.showModal();
  }
  function deschideFisa(id) {
    var x = ID[id]; if (!x) return;
    fisaDe = id;
    var ed = editor();
    if (!ed || !ed.fisa) { arataFisa(x, FISE[id]); return; }
    arataFisa(x, FISE[id] || { sursa: 'harvest', fisier: 'harvest/' + id + '.md', html: '<p class="sters">Se citește fișa…</p>' });
    ed.fisa(id).then(function (j) {
      if (fisaDe !== id) return;
      if (j._cod !== 200) { arataFisa(x, FISE[id]); mesaj((j.eroare || 'Nu pot citi fișa de pe disc.') + ' Arăt varianta de la ultimul build.', true); return; }
      FISE[id] = j.sursa ? j : null; arataFisa(x, j);
      var b = document.querySelector('.mc-fisa[data-fisa="' + id + '"]'); if (b) b.classList.toggle('fara', !j.sursa);
    }, function () { if (fisaDe === id) arataFisa(x, FISE[id]); });
  }
  function initFisa() {
    var d = $('fisa-dialog'); if (!d) return;
    // În editorul local, fișa poate fi în modul de editare: editorul local pune o pază care întreabă înainte să piardă textul.
    var inchide = function () { if (!window.__fisaPaza || window.__fisaPaza()) d.close(); };
    $('fisa-inchide').addEventListener('click', inchide);
    d.addEventListener('click', function (ev) { if (ev.target === d) inchide(); }); // clic pe fundal
    d.addEventListener('keydown', function (ev) { ev.stopPropagation(); }); // tastele din fișă nu ajung la cartonașe sau la prezentare
    d.addEventListener('close', function () {
      var id = fisaDe; fisaDe = null;
      var li = id && document.querySelector('.masa-carte[data-id="' + id + '"]'); if (li) li.focus();
    });
  }

  // ---------- evenimente ----------
  function init() {
    var col = $('masa-coloane'); if (!col) return;
    citesteLocal();
    var p = $('masa-propunere');
    if (M.propunere) {
      p.hidden = false;
      p.innerHTML = 'Cursul nu are încă <code>harvest.yml</code>. Ce vezi e o propunere: piesele din agenda de azi (cu „Da”, în blocurile lor) și restul bibliotecii (cu „Da”, în Bibliotecă). ' +
        (editor() ? '<button type="button" class="principal" id="masa-creeaza">Creează harvest.yml</button>' : 'Lucrezi în acest browser; „Copiază harvest.yml” îți dă fișierul.');
      if ($('masa-creeaza')) $('masa-creeaza').addEventListener('click', function () {
        this.disabled = true;
        editor().creeaza().then(function (j) {
          if (j._cod !== 200) { mesaj(j.eroare || 'Nu am putut crea harvest.yml.', true); return; }
          try { sessionStorage.setItem('masa:mesaj', 'Am creat harvest.yml. De acum, fiecare schimbare se scrie direct în el.'); } catch (e) { /* nimic */ }
          location.hash = '#masa'; location.reload();
        });
      });
    }
    try { var mm = sessionStorage.getItem('masa:mesaj'); if (mm) { sessionStorage.removeItem('masa:mesaj'); mesaj(mm); } } catch (e) { /* nimic */ }
    $('masa-copiaza').hidden = !!editor(); // în editor, fișierul se scrie singur
    $('masa-respinse').addEventListener('click', function () { respinse = !respinse; randeaza(); });
    $('masa-reset').addEventListener('click', reseteaza);
    $('masa-copiaza').addEventListener('click', copiazaMasa);
    $('masa-agenda').addEventListener('click', trimiteInAgenda);
    $('masa-rezumat').addEventListener('click', function (ev) { var b = ev.target.closest('[data-rz]'); if (b) laRezumat(b.getAttribute('data-rz')); });
    initFisa();
    col.addEventListener('click', function (ev) {
      var fb = ev.target.closest('button[data-fisa]'); if (fb) { deschideFisa(fb.getAttribute('data-fisa')); return; }
      var b = ev.target.closest('button[data-v]'); if (!b) return;
      var li = b.closest('.masa-carte'); fokus = li.getAttribute('data-id');
      verdict(fokus, b.getAttribute('data-v'));
    });
    col.addEventListener('keydown', function (ev) {
      var li = ev.target.classList && ev.target.classList.contains('masa-carte') ? ev.target : null; if (!li || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      var id = li.getAttribute('data-id'), k = ev.key; fokus = id;
      if (k === 'd' || k === 'D') verdict(id, 'da');
      else if (k === 'p' || k === 'P') verdict(id, 'poate');
      else if (k === 'n' || k === 'N') verdict(id, 'nu');
      else if (k === 'f' || k === 'F' || k === 'Enter') deschideFisa(id);
      else if (/^[1-9]$/.test(k) && +k <= BLOCURI.length) inBloc(id, +k);
      else if (k === '0' && ID[id].bloc != null) scoate(id);
      else if (k === 'ArrowUp' || k === 'ArrowDown') {
        if (!muta(id, k === 'ArrowUp' ? -1 : 1)) { var fr = k === 'ArrowUp' ? li.previousElementSibling : li.nextElementSibling; if (fr) fr.focus(); }
      } else return;
      ev.preventDefault();
    });
    // Tragerea: cu mouse-ul de oriunde de pe cartonaș, cu degetul de pe mâner (⠿), ca lista să se poată derula pe tabletă.
    var tr = null;
    col.addEventListener('pointerdown', function (ev) {
      var li = ev.target.closest('.masa-carte'); if (!li || ev.target.closest('button') || ev.button > 0 || blocat()) return;
      if (ev.pointerType !== 'mouse' && !ev.target.closest('.masa-maner')) return;
      tr = { li: li, x: ev.clientX, y: ev.clientY, p: ev.pointerId, activ: false };
      if (ev.pointerType !== 'mouse') ev.preventDefault();
    });
    document.addEventListener('pointermove', function (ev) {
      if (!tr || ev.pointerId !== tr.p) return;
      if (!tr.activ) {
        if (Math.abs(ev.clientX - tr.x) + Math.abs(ev.clientY - tr.y) < 6) return;
        tr.activ = true; tr.li.classList.add('trage'); col.classList.add('in-mutare');
      }
      ev.preventDefault();
      if (ev.clientY < 50) window.scrollBy(0, -12); else if (ev.clientY > window.innerHeight - 50) window.scrollBy(0, 12);
      var sub = document.elementFromPoint(ev.clientX, ev.clientY); if (!sub || !sub.closest) return;
      var lista = sub.closest('.masa-lista');
      if (!lista) { var z = sub.closest('.masa-bloc') || sub.closest('.masa-grup') || sub.closest('.masa-col'); lista = z ? z.querySelector('.masa-lista') : null; }
      if (!lista) return;
      var tinta = sub.closest('.masa-carte');
      if (tinta && tinta !== tr.li && tinta.parentNode === lista) {
        var r = tinta.getBoundingClientRect();
        lista.insertBefore(tr.li, ev.clientY > r.top + r.height / 2 ? tinta.nextSibling : tinta);
      } else if (!tinta) {
        // sub ultimul cartonaș (sau o listă goală): la final; deasupra primului: la început
        var carti = [].filter.call(lista.children, function (x) { return x !== tr.li; });
        var primul = carti[0];
        if (primul && ev.clientY < primul.getBoundingClientRect().top) lista.insertBefore(tr.li, primul);
        else if (tr.li.parentNode !== lista || tr.li !== lista.lastElementChild) lista.appendChild(tr.li);
      }
      totaluriDinDom();
    });
    var gata = function (ev) {
      if (!tr || (ev && ev.pointerId !== tr.p)) return;
      var activ = tr.activ, id = tr.li.getAttribute('data-id');
      tr.li.classList.remove('trage'); col.classList.remove('in-mutare'); tr = null;
      if (!activ) return;
      fokus = id;
      schimba(function () {
        [].forEach.call(col.querySelectorAll('.masa-lista'), function (ol) {
          var tip = ol.getAttribute('data-lista'), k = +ol.getAttribute('data-bloc');
          [].forEach.call(ol.querySelectorAll('.masa-carte'), function (li, i) {
            var x = ID[li.getAttribute('data-id')]; if (!x) return;
            if (tip === 'nou' || tip === 'poate' || tip === 'nu') { x.verdict = tip; x.bloc = null; x.ordine = null; }
            else if (tip === 'biblioteca') { x.verdict = 'da'; x.bloc = null; x.ordine = null; }
            else { if (x.verdict === 'nou' || x.verdict === 'nu') x.verdict = 'da'; x.bloc = k; x.ordine = i + 1; }
          });
        });
      });
    };
    document.addEventListener('pointerup', gata);
    document.addEventListener('pointercancel', gata);
    randeaza();
    window.__masa = { stare: function () { return cand.map(function (x) { return { id: x.id, verdict: x.verdict, bloc: x.bloc, ordine: x.ordine }; }); }, text: textMasa, agenda: agendaDinMasa, hash: function () { return M.hash; },
      // Pentru editarea fișei (editorul local, 2026-11-20): ce piesă e deschisă, randarea fișei și câmpurile rândului după salvare.
      fisa: {
        deschisa: function () { return fisaDe; },
        candidata: function (id) { var x = ID[id]; return x ? { id: x.id, titlu: x.titlu, scop: x.scop || '', durata: x.durata, tip: x.tip || '' } : null; },
        propunere: function () { return !!M.propunere; },
        deschide: deschideFisa,
        arata: function (id, f) { var x = ID[id]; if (!x) return; FISE[id] = f && f.sursa ? f : null; arataFisa(x, f); var b = document.querySelector('.mc-fisa[data-fisa="' + id + '"]'); if (b) b.classList.toggle('fara', !(f && f.sursa)); },
        actualizeaza: function (id, campuri, hashMasa) {
          var x = ID[id]; if (!x || !campuri) return;
          ['titlu', 'scop', 'durata', 'tip'].forEach(function (k) { if (k in campuri) x[k] = campuri[k]; });
          if (hashMasa) M.hash = hashMasa;
          fokus = null; randeaza();
        },
      } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
