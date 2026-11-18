// Vederea „Masa” (etapa A, Alex, 2026-11-18): piesele candidate din masa.yml, în trei coloane.
// Colectate (verdict nou) → Filtrate (da / poate; „nu” ascuns, cu filtru) → Ordonate (blocurile zilei, cu pauzele fixe între ele).
// Offline: schimbările stau în acest browser, iar „Copiază masa.yml” dă fișierul. În editorul local (curs/editor.mjs), fiecare
// schimbare se scrie direct în masa.yml, prin window.__masaEditor, pe care îl pune doar pagina servită de editor. Fără biblioteci, fără internet.
(function () {
  'use strict';
  if (location.hash === '#sala' || /^#tipar-/.test(location.hash)) return;
  var DATA = JSON.parse(document.getElementById('date-curs').textContent);
  var M = DATA.masa;
  if (!M || !document.getElementById('masa')) return;
  var $ = function (id) { return document.getElementById(id); };
  var BLOCURI = DATA.blocuri && DATA.blocuri.length ? DATA.blocuri : [{ nr: 1, start: DATA.editie.start, sfarsit: null, disponibil: null, pauzaDupa: null }];
  var CHEIE = 'curs:' + DATA.curs.slug + ':masa';
  var CAMPURI = ['verdict', 'bloc', 'ordine'];
  var TIP = { teorie: 'teorie', model: 'model', poveste: 'poveste', exercitiu: 'exercițiu', reflectie: 'reflecție', energizant: 'energizant', deschidere: 'deschidere', inchidere: 'închidere', mesaj: 'mesaj', pauza: 'pauză' };
  var FEL = { teorie: 'teorie', model: 'teorie', poveste: 'teorie', reflectie: 'reflectie', deschidere: 'reflectie', inchidere: 'reflectie', mesaj: 'mesaj', exercitiu: 'exercitiu', energizant: 'exercitiu', pauza: 'pauza' };
  var VERDICT = { da: 'Da', poate: 'Poate', nu: 'Nu' };

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
    if (blocat()) { mesaj('Întâi apasă „Creează masa.yml”: abia apoi se pot salva verdictele și ordinea.'); return; }
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
  /** ↑ ↓ în Ordonate: un loc mai sus sau mai jos; la marginea blocului, trece în blocul vecin. */
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
      M.hash = j.hash; stare('salvat în masa.yml'); trimiteCoada();
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
    renumeroteaza(); randeaza(); mesaj('Masa e din nou cea din masa.yml.');
  }

  // ---------- desenul ----------
  function carte(x) {
    var meta = (x.tip ? '<span class="mc-tip"><span class="semn-mic fel-' + (FEL[x.tip] || 'teorie') + '" aria-hidden="true"></span>' + esc(TIP[x.tip] || x.tip) + '</span>' : '') +
      (x.sursa ? '<span class="mc-sursa">' + esc(x.sursa) + '</span>' : '') +
      (x.produsa ? '<span class="mc-produsa" title="Are deja fișierul în piese/">produsă</span>' : '') +
      (x.nota ? '<span class="mc-nota" title="' + esc(x.nota) + '">notă</span>' : '');
    return '<li class="masa-carte v-' + x.verdict + (x.produsa ? ' produsa' : '') + '" data-id="' + esc(x.id) + '" tabindex="0" aria-label="' + esc(x.titlu + ', ' + x.durata + ' min, verdict ' + x.verdict + (x.produsa ? ', produsă' : '')) + '"' + (x.nota ? ' title="' + esc(x.nota) + '"' : '') + '>' +
      '<span class="ec-maner masa-maner" aria-hidden="true" title="Trage ca să muți">⠿</span>' +
      '<div class="mc-rand"><span class="mc-durata"><b>' + x.durata + '</b> min</span><span class="mc-cap"><span class="mc-titlu">' + esc(x.titlu) + '</span>' + (x.scop ? '<span class="mc-scop">' + esc(x.scop) + '</span>' : '') + '</span></div>' +
      '<div class="mc-jos"><span class="mc-meta">' + meta + '</span><span class="mc-verdict" role="group" aria-label="Verdict">' +
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
  function randeaza() {
    var col = $('masa-coloane'); if (!col) return;
    var colectate = cand.filter(function (x) { return x.verdict === 'nou' && x.bloc == null; });
    var filtrate = cand.filter(function (x) { return (x.verdict === 'da' || x.verdict === 'poate') && x.bloc == null; });
    var nu = cand.filter(function (x) { return x.verdict === 'nu'; });
    var arataNu = respinse ? nu : [];
    var nOrd = 0;
    var blocuri = BLOCURI.map(function (b) {
      var ale = dinBloc(b.nr); nOrd += ale.length;
      var t = totalBloc(b, ale.map(function (x) { return x.id; }));
      var p = b.pauzaDupa;
      return '<div class="masa-bloc ' + t.clasa + '" data-bloc="' + b.nr + '"><p class="masa-bloc-cap" id="masa-cap-' + b.nr + '">' + capBloc(b, t) + '</p>' +
        '<ol class="masa-lista" data-lista="bloc" data-bloc="' + b.nr + '" aria-labelledby="masa-cap-' + b.nr + '">' + ale.map(carte).join('') + '</ol></div>' +
        (p ? '<p class="masa-pauza"><span class="semn-mic fel-pauza" aria-hidden="true"></span>' + oraDin(p.la) + ' · ' + esc(p.titlu) + ' · ' + p.min + ' min</p>' : '');
    }).join('');
    col.innerHTML =
      '<section class="masa-col masa-col-simpla" data-col="colectate" aria-labelledby="masa-h-c"><h3 class="eticheta" id="masa-h-c">Colectate <span class="banca-grup-nr">' + colectate.length + '</span></h3>' +
      '<p class="masa-col-ajutor sters">Tot ce ar putea intra. Fără verdict încă.</p><ol class="masa-lista" data-lista="colectate" aria-labelledby="masa-h-c">' + colectate.map(carte).join('') + '</ol></section>' +
      '<section class="masa-col masa-col-simpla" data-col="filtrate" aria-labelledby="masa-h-f"><h3 class="eticheta" id="masa-h-f">Filtrate <span class="banca-grup-nr">' + filtrate.length + '</span></h3>' +
      '<p class="masa-col-ajutor sters">Bune de pus în zi: da sau poate.' + (nu.length && !respinse ? ' ' + nu.length + ' cu „Nu”, ascunse.' : '') + '</p><ol class="masa-lista" data-lista="filtrate" aria-labelledby="masa-h-f">' + filtrate.concat(arataNu).map(carte).join('') + '</ol></section>' +
      '<section class="masa-col masa-ordonate" data-col="ordonate" aria-labelledby="masa-h-o"><h3 class="eticheta" id="masa-h-o">Ordonate <span class="banca-grup-nr">' + nOrd + '</span></h3>' + blocuri + '</section>';
    var r = $('masa-respinse'); r.setAttribute('aria-pressed', respinse ? 'true' : 'false'); r.textContent = respinse ? 'Ascunde „Nu” (' + nu.length + ')' : 'Arată și „Nu” (' + nu.length + ')'; r.disabled = !nu.length && !respinse;
    $('masa-reset').hidden = !!editor() || !local;
    $('masa-agenda').disabled = blocat();
    stare();
    if (fokus) { var f = col.querySelector('.masa-carte[data-id="' + fokus + '"]'); if (f) f.focus({ preventScroll: false }); }
  }
  var ultimaStare = '';
  function stare(t) {
    if (t != null) ultimaStare = t;
    var n = function (f) { return cand.filter(f).length; };
    var s = $('masa-stare'); if (!s) return;
    s.textContent = cand.length + ' candidate · ' + n(function (x) { return x.verdict === 'nou' && x.bloc == null; }) + ' colectate · ' +
      n(function (x) { return (x.verdict === 'da' || x.verdict === 'poate') && x.bloc == null; }) + ' filtrate · ' + n(inOrdonate) + ' ordonate' +
      (n(function (x) { return x.verdict === 'nu'; }) ? ' · ' + n(function (x) { return x.verdict === 'nu'; }) + ' cu „Nu”' : '') +
      (editor() ? (ultimaStare ? ' · ' + ultimaStare : '') : local ? ' · schimbări salvate în acest browser' : '');
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
    var l = ['# Masa (etapa A): piesele candidate, înainte de producție. Vederea „Masa” din materialul trainerului le filtrează și le ordonează.',
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
    arataText('masa.yml, gata de pus în folderul cursului', text);
    copiaza(text, function () { mesaj('Copiat. Pune textul în masa.yml, în folderul cursului (înlocuiește tot fișierul), apoi rulează build-ul.'); });
  }
  function trimiteInAgenda() {
    var a = agendaDinMasa();
    var rest = (a.deProdus.length ? 'De produs (au „Da”, dar nu au încă fișier în piese/): ' + listaTitluri(a.deProdus) + '. ' : '') +
      (a.nehotarate.length ? 'Nehotărâte („Poate”, nu intră): ' + listaTitluri(a.nehotarate) + '.' : '');
    if (!a.linii.some(function (l) { return l.indexOf('- bloc:') !== 0; })) { mesaj('Nicio piesă cu „Da” și fișier produs în blocurile din Ordonate, deci nu am ce trimite în agendă. ' + rest, true); return; }
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
    if (!confirm('Înlocuiești agenda din editii/' + (M.editie || 'ediția nouă') + ' cu cea din Masa (' + a.linii.filter(function (l) { return l.indexOf('- bloc:') !== 0; }).length + ' rânduri)? Versiunea veche rămâne în .editor-istoric/.')) return;
    mesaj('Trimit în agendă…');
    dupaCoada().then(function () { return ed.agenda(M.hash); }).then(function (j) {
      if (j._cod !== 200) { mesaj((j.eroare || 'Nu am putut scrie agenda.') + (j.erori && j.erori.length ? ' ' + j.erori.join('; ') : ''), true); return; }
      try { sessionStorage.setItem('masa:mesaj', 'Agenda e în ' + j.fisier + ' (' + j.randuri + ' rânduri); materialul e refăcut.' + (j.copie ? ' Versiunea veche: ' + j.copie + '.' : '') + ' ' + rest); } catch (e) { /* nimic */ }
      location.hash = '#masa'; location.reload();
    }, function () { mesaj('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?', true); });
  }

  // ---------- evenimente ----------
  function init() {
    var col = $('masa-coloane'); if (!col) return;
    citesteLocal();
    var p = $('masa-propunere');
    if (M.propunere) {
      p.hidden = false;
      p.innerHTML = 'Cursul nu are încă <code>masa.yml</code>. Ce vezi e o propunere: piesele din agenda de azi (cu „Da”, în blocurile lor) și restul bibliotecii (la Colectate). ' +
        (editor() ? '<button type="button" class="principal" id="masa-creeaza">Creează masa.yml</button>' : 'Lucrezi în acest browser; „Copiază masa.yml” îți dă fișierul.');
      if ($('masa-creeaza')) $('masa-creeaza').addEventListener('click', function () {
        this.disabled = true;
        editor().creeaza().then(function (j) {
          if (j._cod !== 200) { mesaj(j.eroare || 'Nu am putut crea masa.yml.', true); return; }
          try { sessionStorage.setItem('masa:mesaj', 'Am creat masa.yml. De acum, fiecare schimbare se scrie direct în el.'); } catch (e) { /* nimic */ }
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
    col.addEventListener('click', function (ev) {
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
      if (!lista) { var z = sub.closest('.masa-bloc') || sub.closest('.masa-col-simpla'); lista = z ? z.querySelector('.masa-lista') : null; }
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
            if (tip === 'colectate') { x.verdict = 'nou'; x.bloc = null; x.ordine = null; }
            else if (tip === 'filtrate') { if (x.verdict === 'nou') x.verdict = 'da'; x.bloc = null; x.ordine = null; }
            else { if (x.verdict === 'nou' || x.verdict === 'nu') x.verdict = 'da'; x.bloc = k; x.ordine = i + 1; }
          });
        });
      });
    };
    document.addEventListener('pointerup', gata);
    document.addEventListener('pointercancel', gata);
    randeaza();
    window.__masa = { stare: function () { return cand.map(function (x) { return { id: x.id, verdict: x.verdict, bloc: x.bloc, ordine: x.ordine }; }); }, text: textMasa, agenda: agendaDinMasa, hash: function () { return M.hash; } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
