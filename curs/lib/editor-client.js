// Editorul local (1.11, Alex, 2026-11-17): butonul „Editează” pe ecrane și pe notele trainerului.
// Se încarcă DOAR în paginile servite de curs/editor.mjs (nu e în fișierul HTML offline) și niciodată în fereastra sălii.
(function () {
  'use strict';
  var CFG = window.__EDITOR;
  if (!CFG || location.hash === '#sala') return;
  var IMG = {}; try { IMG = JSON.parse(document.getElementById('imagini').textContent); } catch (e) { /* fără imagini */ }
  var $ = function (id) { return document.getElementById(id); };
  var EDITABIL = /^[a-z0-9]+(-[a-z0-9]+)*(@\d+)?#(nota)?\d+$/;
  // Ecranele adăugate live din Bibliotecă (<piesă>~live#n, 1.12) se editează în fișierul piesei, ca oricare altele.
  var editabil = function (id) { id = String(id).replace('~live#', '#'); return EDITABIL.test(id) && !/^pauza#\d+$/.test(id); }; // pauza#k e un rând „pauza: N” din agendă, fără fișier

  function api(cale, metoda, corp) {
    return fetch(cale, {
      method: metoda || 'GET', cache: 'no-store',
      headers: corp ? { 'Content-Type': 'application/json', 'X-Editor-Token': CFG.token } : { 'X-Editor-Token': CFG.token },
      body: corp ? JSON.stringify(corp) : undefined,
    }).then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { j._cod = r.status; return j; }); });
  }

  // ---------- Masa (etapa A, 2026-11-18): lib/masa.js scrie prin editor în masa.yml și în ediție ----------
  window.__masaEditor = {
    salveaza: function (schimbari, hash) { return api('/api/masa', 'POST', { schimbari: schimbari, hash: hash }).then(function (j) { stare(j._cod === 200 ? ' · salvat în ' + (j.fisier || 'harvest.yml') : ''); return j; }); },
    agenda: function (hash) { return api('/api/masa/agenda', 'POST', { hash: hash }); },
    creeaza: function () { return api('/api/masa/creeaza', 'POST', {}); },
    fisa: function (id, fel) { return api('/api/fisa?id=' + encodeURIComponent(id) + (fel === 'obiectiv' ? '&fel=obiectiv' : '')); },
    // Harvest de obiective (2026-11-20): verdict / viziune, obiectiv nou, fișierul de pornire (harvest-obiective.yml).
    obiective: function (date, hash) { return api('/api/obiective', 'POST', { schimbari: date.schimbari || [], viziune: date.viziune, hash: hash }).then(function (j) { if (j._cod === 200) stare(' · salvat în harvest-obiective.yml'); return j; }); },
    obiectivNou: function (text, hash) { return api('/api/obiective/nou', 'POST', { text: text, hash: hash }); },
    obiectiveCreeaza: function () { return api('/api/obiective/creeaza', 'POST', {}); },
  };

  // ---------- bara de jos: mod editare + fișierele schimbate (commit-ul îl face Alex sau Tudor, nu editorul) ----------
  var bara = document.createElement('div');
  bara.className = 'ed-bara'; bara.setAttribute('role', 'status');
  document.body.appendChild(bara);
  function stare(mesaj) {
    api('/api/stare').then(function (j) {
      var s = j.schimbate;
      var t = s == null ? '' : s.length === 0 ? ' · totul e în commit' : ' · ' + s.length + (s.length === 1 ? ' fișier schimbat' : ' fișiere schimbate') + ' (commit-ul îl faci tu sau Tudor)';
      bara.innerHTML = '<b>Mod editare</b> · ' + CFG.folder + t + (mesaj ? '<span class="ed-mesaj">' + mesaj + '</span>' : '');
      if (s && s.length) bara.title = s.join('\n');
    });
  }

  // ---------- butoanele ----------
  function buton(ref, eticheta) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'ed-btn'; b.textContent = eticheta || 'Editează';
    b.setAttribute('data-ed-ref', ref);
    b.setAttribute('aria-label', 'Editează ' + ref);
    return b;
  }
  function puneButoane() {
    // Modul și Biblioteca: blocurile din sală și notele trainerului au data-sursa.
    var l = document.querySelectorAll('[data-sursa]');
    for (var k = 0; k < l.length; k++) if (!l[k].querySelector(':scope > .ed-btn')) l[k].appendChild(buton(l[k].getAttribute('data-sursa'), /#nota\d+$/.test(l[k].getAttribute('data-sursa')) ? 'Editează nota' : 'Editează'));
    // Vederea Ecrane: cărțile se fac în prezinta.js; titlurile de modul și pauzele nu se editează aici.
    var c = document.querySelectorAll('.ec-carte[data-id]');
    for (var j = 0; j < c.length; j++) {
      var id = c[j].getAttribute('data-id'), bt = c[j].querySelector('.ec-butoane');
      if (bt && editabil(id) && !bt.querySelector('.ed-btn')) bt.insertBefore(buton(id.replace('~live#', '#')), bt.querySelector('.ec-ascunde'));
    }
  }
  puneButoane();
  var gr = $('grila-ecrane');
  if (gr && window.MutationObserver) new MutationObserver(puneButoane).observe(gr, { childList: true });
  // Ecranul de comandă: „Editează” pentru ecranul de acum.
  var acum = $('btn-ascunde-acum');
  if (acum) {
    var ba = buton('', 'Editează'); ba.id = 'ed-acum'; ba.classList.add('ec-mic');
    acum.parentNode.insertBefore(ba, acum.nextSibling);
    setInterval(function () { var id = window.__curs && window.__curs.stare().id; ba.hidden = !(id && editabil(id)); ba.setAttribute('data-ed-ref', (id || '').replace('~live#', '#')); }, 400);
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('.ed-btn') : null; if (!b) return;
    ev.preventDefault(); ev.stopPropagation(); b.blur();
    deschide(b.getAttribute('data-ed-ref'));
  }, true);
  // Butoanele de pe cărți nu pornesc tragerea.
  document.addEventListener('pointerdown', function (ev) { if (ev.target.closest && ev.target.closest('.ed-btn')) ev.stopPropagation(); }, true);

  // ---------- fereastra de editare ----------
  var dlg = document.createElement('dialog');
  dlg.className = 'ed-dialog';
  dlg.innerHTML =
    '<form method="dialog" class="ed-form">' +
    '<header class="ed-cap"><div><p class="eticheta" id="ed-ce"></p><h2 id="ed-titlu">Editează ecranul</h2></div><button type="button" class="ed-inchide" id="ed-renunta" aria-label="Închide fără să salvezi">×</button></header>' +
    '<div class="ed-corp">' +
    '<div class="ed-stanga"><label class="eticheta" for="ed-text">Textul ecranului</label><textarea id="ed-text" spellcheck="true" lang="ro"></textarea>' +
    '<p class="ed-ajutor"><code>## Titlu</code> titlul ecranului · <code>- punct</code> listă · <code>1. pas</code> pași numerotați · <code>**îngroșat**</code> · un rând gol = paragraf nou. ' +
    'Rândurile cu imagini, <code>![…](materiale/…)</code>, lasă-le cum sunt.</p></div>' +
    '<div class="ed-dreapta"><p class="eticheta">Cum arată</p><div class="cadru ed-previz" id="ed-previz"></div><div class="ed-nota" id="ed-nota" hidden></div></div>' +
    '</div>' +
    '<p class="ed-eroare" id="ed-eroare" role="alert" hidden></p>' +
    '<footer class="ed-subsol"><span class="sters" id="ed-fisier"></span><span class="ed-taste sters"><kbd>⌘</kbd>+<kbd>Enter</kbd> salvează · <kbd>Esc</kbd> renunță</span>' +
    '<button type="button" id="ed-anuleaza">Renunță</button><button type="button" class="principal" id="ed-salveaza">Salvează</button></footer>' +
    '</form>';
  document.body.appendChild(dlg);
  var curent = null, cronPrev = null;

  function eroare(t, lista) {
    var e = $('ed-eroare');
    e.hidden = !t;
    e.innerHTML = t ? escape(t) + (lista && lista.length ? '<ul>' + lista.map(function (x) { return '<li>' + escape(x) + '</li>'; }).join('') + '</ul>' : '') : '';
  }
  function escape(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function deschide(ref) {
    if (!ref) return;
    eroare('');
    api('/api/bloc?ref=' + encodeURIComponent(ref)).then(function (j) {
      if (j._cod !== 200) { stare(escape(j.eroare || 'Nu pot deschide blocul.')); return; }
      curent = { ref: ref, md: j.md, hash: j.hash, fisier: j.fisier, nota: j.fel === 'trainer' };
      $('ed-ce').textContent = curent.nota ? 'Nota trainerului · ' + ref : 'Ecranul ' + ref + (/cronometru=(\d+)/.test(j.deschidere) ? ' · cronometru ' + RegExp.$1 + ' min' : '');
      $('ed-titlu').textContent = curent.nota ? 'Editează nota' : 'Editează ecranul';
      $('ed-fisier').textContent = j.fisier;
      $('ed-text').value = j.md;
      $('ed-previz').hidden = curent.nota; $('ed-nota').hidden = !curent.nota;
      dlg.showModal();
      $('ed-text').focus();
      previzualizeaza();
    });
  }
  function previzualizeaza() {
    clearTimeout(cronPrev);
    cronPrev = setTimeout(function () {
      if (!curent) return;
      api('/api/previzualizare', 'POST', { ref: curent.ref, md: $('ed-text').value }).then(function (j) {
        if (j._cod !== 200) return;
        var tinta = curent.nota ? $('ed-nota') : $('ed-previz');
        tinta.innerHTML = curent.nota ? j.html : '<div class="ecran fel-' + j.fel + '">' + j.html + '</div>';
        var imgs = tinta.querySelectorAll('img[data-img]');
        for (var k = 0; k < imgs.length; k++) imgs[k].src = IMG[imgs[k].getAttribute('data-img')] || '';
        if (!curent.nota) potriveste(tinta);
      });
    }, 200);
  }
  function potriveste(cadru) {
    var e = cadru.firstElementChild; if (!e) return;
    var w = cadru.clientWidth, h = cadru.clientHeight, s = Math.min(w / 1600, h / 900);
    e.style.transform = 'translate(' + (w - 1600 * s) / 2 + 'px,' + (h - 900 * s) / 2 + 'px) scale(' + s + ')';
  }
  function inchide(fortat) {
    if (!fortat && curent && $('ed-text').value !== curent.md && !confirm('Renunți la schimbări?')) return;
    curent = null; dlg.close();
  }
  function salveaza() {
    if (!curent) return;
    var buton = $('ed-salveaza'); buton.disabled = true; buton.textContent = 'Salvez și refac materialul…';
    eroare('');
    api('/api/bloc', 'POST', { ref: curent.ref, md: $('ed-text').value, hash: curent.hash }).then(function (j) {
      buton.disabled = false; buton.textContent = 'Salvează';
      if (j._cod !== 200) { eroare(j.eroare || 'Nu s-a salvat.', j.erori); return; } // textul rămâne în câmp
      // Reîncărcăm la aceeași vedere (hash-ul paginii) și la același loc; prezinta.js ține minte ecranul curent.
      try { sessionStorage.setItem('editor:dupa', JSON.stringify({ ref: curent.ref, fisier: j.fisier, neschimbat: !!j.neschimbat, y: window.scrollY })); } catch (e) { /* nimic */ }
      curent = null; dlg.close();
      location.reload();
    }, function () { buton.disabled = false; buton.textContent = 'Salvează'; eroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?'); });
  }
  $('ed-text').addEventListener('input', previzualizeaza);
  $('ed-salveaza').addEventListener('click', salveaza);
  $('ed-anuleaza').addEventListener('click', function () { inchide(false); });
  $('ed-renunta').addEventListener('click', function () { inchide(false); });
  dlg.addEventListener('cancel', function (ev) { ev.preventDefault(); inchide(false); });
  dlg.addEventListener('keydown', function (ev) {
    ev.stopPropagation(); // tastele din editor nu ajung la prezentare sau la Bibliotecă
    if ((ev.metaKey || ev.ctrlKey) && ev.key === 'Enter') { ev.preventDefault(); salveaza(); }
  });
  window.addEventListener('resize', function () { if (curent && !curent.nota) potriveste($('ed-previz')); });

  // ---------- după reîncărcare: înapoi la ecranul editat ----------
  var dupa = null; try { dupa = JSON.parse(sessionStorage.getItem('editor:dupa')); sessionStorage.removeItem('editor:dupa'); } catch (e) { /* nimic */ }
  if (dupa) {
    setTimeout(function () {
      var tinta = document.querySelector('.ec-carte[data-id="' + dupa.ref + '"]') || document.querySelector('[data-sursa="' + dupa.ref.replace(/@\d+#/, '#') + '"]');
      if (tinta && tinta.offsetParent) { tinta.scrollIntoView({ block: 'center' }); tinta.classList.add('ed-proaspat'); setTimeout(function () { tinta.classList.remove('ed-proaspat'); }, 2500); }
      else if (dupa.y) window.scrollTo(0, dupa.y);
    }, 50);
    stare(dupa.neschimbat ? ' · nimic de salvat' : ' · salvat în ' + escape(dupa.fisier) + ', materialul e refăcut');
  } else stare();
  window.__editor = { deschide: deschide };

  // ---------- fișa piesei din Harvest, editabilă (Alex, 2026-11-20) ----------
  // „Editează” în dialogul fișei: Markdown-ul din harvest/<id>.md (sau șablonul D-078) și câmpurile rândului din harvest.yml.
  // „Piesă nouă” în bara Harvest: rândul (verdict „nou”) + fișa din șablon. Conflict: dacă fișierul s-a schimbat pe disc, nu suprascriem.
  function pornesteFisa() {
    var d = $('fisa-dialog'), MF = window.__masa && window.__masa.fisa;
    if (!d || !MF) return;
    var cap = d.querySelector('.fisa-cap'), corp = $('fisa-corp');
    var be = document.createElement('button');
    be.type = 'button'; be.id = 'fe-editeaza'; be.className = 'fe-editeaza'; be.textContent = 'Editează';
    cap.insertBefore(be, $('fisa-inchide'));
    var p = document.createElement('div');
    p.className = 'fe'; p.id = 'fe'; p.hidden = true;
    p.innerHTML =
      '<div class="fe-campuri" id="fe-campuri">' +
      '<label class="fe-camp fe-lat"><span class="eticheta">Titlu</span><input id="fe-titlu" type="text" maxlength="200" autocomplete="off"></label>' +
      '<label class="fe-camp"><span class="eticheta">Durata (min)</span><input id="fe-durata" type="number" min="0" max="600" step="1" inputmode="numeric"></label>' +
      '<label class="fe-camp"><span class="eticheta">Tip</span><select id="fe-tip"></select></label>' +
      '<label class="fe-camp fe-tot"><span class="eticheta">Obiectivul piesei (scop, în harvest.yml)</span><input id="fe-scop" type="text" maxlength="600" autocomplete="off"></label>' +
      '<fieldset class="fe-camp fe-tot fe-obiective" id="fe-obiective" hidden><legend class="eticheta">Obiectivele cursului pe care le servește</legend><span id="fe-ob-lista"></span></fieldset>' +
      '<p class="fe-nota sters" id="fe-campuri-nota" hidden></p></div>' +
      '<div class="fe-campuri" id="fe-campuri-ob" hidden><label class="fe-camp fe-tot"><span class="eticheta">Obiectivul (text, în harvest-obiective.yml)</span><input id="fe-ob-text" type="text" maxlength="400" autocomplete="off"></label></div>' +
      '<label class="eticheta fe-eticheta" for="fe-text" id="fe-text-eticheta">Fișa (Markdown)</label>' +
      '<textarea id="fe-text" spellcheck="true" lang="ro"></textarea>' +
      '<div class="fe-conflict" id="fe-conflict" role="alert" hidden><p id="fe-conflict-text"></p>' +
      '<button type="button" id="fe-reincarca">Reîncarcă</button><button type="button" class="principal" id="fe-pastreaza">Păstrează textul meu</button></div>' +
      '<p class="ed-eroare" id="fe-eroare" role="alert" hidden></p>' +
      '<p class="fe-info sters" id="fe-info" role="status"></p>' +
      '<footer class="fe-subsol"><span class="sters fe-taste"><kbd>⌘</kbd>+<kbd>S</kbd> salvează · <kbd>Esc</kbd> renunță</span>' +
      '<span class="fe-optiuni" id="fe-optiuni"></span><button type="button" id="fe-renunta">Renunță</button><button type="button" class="principal" id="fe-salveaza">Salvează</button></footer>'; // fe-optiuni: loc pentru opțiuni lângă „Salvează” (de exemplu bifa bibliotecii de bază, dacă o aprobă Alex)
    d.appendChild(p);
    var noua = document.createElement('button');
    noua.type = 'button'; noua.id = 'fe-noua'; noua.textContent = 'Piesă nouă';
    var dreapta = document.querySelector('.masa-bara-dreapta'); if (dreapta) dreapta.insertBefore(noua, dreapta.firstChild);
    if (MF.propunere()) { noua.disabled = true; noua.title = 'Întâi „Creează harvest.yml”.'; }

    var ed = null, ciorne = {}, CAMP = ['titlu', 'scop', 'durata', 'tip'];
    var tipuri = [];
    var val = function () { return { titlu: $('fe-titlu').value, scop: $('fe-scop').value, durata: $('fe-durata').value, tip: $('fe-tip').value }; };
    // Bifele de obiective (2026-11-20): starea de la deschidere (ed.ob0) față de acum; se trimit doar dacă s-a schimbat ceva.
    var bifeOb = function () { return [].filter.call($('fe-ob-lista').querySelectorAll('input[data-ob]'), function (x) { return x.checked && !x.disabled; }).map(function (x) { return x.getAttribute('data-ob'); }); };
    var schimbate = function () {
      var o = {}; if (!ed || !ed.campuri0) return o;
      if (ed.fel === 'obiectiv') { var t = $('fe-ob-text').value.replace(/\s+/g, ' ').trim(); if (t !== String(ed.campuri0.text || '')) o.text = t; return o; }
      var v = val();
      CAMP.forEach(function (k) { if (String(v[k]).trim() !== String(ed.campuri0[k] == null ? '' : ed.campuri0[k])) o[k] = k === 'durata' ? (/^\s*\d+\s*$/.test(v[k]) ? +v[k] : v[k]) : v[k].trim(); });
      if (ed.ob0 && bifeOb().slice().sort().join(' ') !== ed.ob0.slice().sort().join(' ')) o.obiective = bifeOb();
      return o;
    };
    var murdar = function () { return !!ed && ((ed.mod === 'fisa' && $('fe-text').value !== ed.md0) || Object.keys(schimbate()).length > 0); };
    function feEroare(t, lista) { var e = $('fe-eroare'); e.hidden = !t; e.innerHTML = t ? escape(t) + (lista && lista.length ? '<ul>' + lista.map(function (x) { return '<li>' + escape(x) + '</li>'; }).join('') + '</ul>' : '') : ''; }
    function info(t) { $('fe-info').textContent = t || ''; }
    function puneTipuri(lista, ales) {
      if (lista && lista.length) tipuri = lista;
      var TIP = { exercitiu: 'exercițiu', reflectie: 'reflecție', inchidere: 'închidere', pauza: 'pauză' };
      $('fe-tip').innerHTML = '<option value="">(fără tip)</option>' + tipuri.map(function (t) { return '<option value="' + escape(t) + '">' + escape(TIP[t] || t) + '</option>'; }).join('');
      $('fe-tip').value = ales || '';
    }
    function puneCampuri(c, activ, nota) {
      $('fe-titlu').value = c ? c.titlu : ''; $('fe-scop').value = c ? c.scop || '' : ''; $('fe-durata').value = c && c.durata != null ? c.durata : ''; puneTipuri(null, c ? c.tip : '');
      [].forEach.call($('fe-campuri').querySelectorAll('input, select'), function (x) { x.disabled = !activ; });
      $('fe-campuri-nota').hidden = !nota; $('fe-campuri-nota').textContent = nota || '';
    }
    /** Bifele: toate obiectivele din harvest-obiective.yml. Cele legate din antetul piese/<id>.md sunt bifate și blocate. */
    function puneBifeOb(lista, areRand) {
      var f = $('fe-obiective'); f.hidden = !lista || !lista.length;
      if (f.hidden) { ed.ob0 = null; return; }
      var VER = { nou: 'nou', da: 'da', poate: 'poate', nu: 'nu' };
      $('fe-ob-lista').innerHTML = lista.map(function (o) {
        var blocat = o.dinFisier && !o.legatRand;
        return '<label class="fe-ob' + (o.verdict === 'nu' ? ' fe-ob-nu' : '') + '"' + (o.dinFisier ? ' title="Legat și din antetul piesei (piese/' + escape(ed.id) + '.md); se schimbă acolo."' : '') + '><input type="checkbox" data-ob="' + escape(o.id) + '"' + (o.legat ? ' checked' : '') + (!areRand || blocat ? ' disabled' : '') + '> <span>' + escape(o.text) + '</span> <span class="fe-ob-v v-' + escape(o.verdict) + '">' + VER[o.verdict] + '</span></label>';
      }).join('');
      ed.ob0 = bifeOb(); ed.obLista = lista;
    }
    function activeaza(mod, fel) {
      d.classList.add('fe-activ'); p.hidden = false; corp.hidden = true; be.hidden = true;
      $('fe-campuri').hidden = fel === 'obiectiv'; $('fe-campuri-ob').hidden = fel !== 'obiectiv'; $('fe-obiective').hidden = true;
      $('fe-text').hidden = mod === 'nou'; $('fe-text-eticheta').hidden = mod === 'nou';
      $('fe-salveaza').textContent = mod === 'nou' ? 'Creează piesa' : 'Salvează';
      $('fe-conflict').hidden = true; feEroare(''); info('');
      // Bifa core: nebifată la fiecare deschidere (spec Radu), ca personalizarea să nu ajungă din greșeală în core.
      if (CORE) { $('fe-core-bifa').checked = false; puneBifa(mod); if (fel === 'obiectiv') $('fe-core-eticheta').hidden = true; } // obiectivele nu merg în core (sunt ale cursului)
      bc.hidden = true; cmp.hidden = true;
    }
    function iesi() {
      ed = null; d.classList.remove('fe-activ'); p.hidden = true; corp.hidden = false; be.hidden = false;
      deseneazaCore();
    }
    function intra(id, fel) {
      feEroare('');
      fel = fel || (MF.fel ? MF.fel() : 'piesa');
      var cheie = (fel === 'obiectiv' ? 'obiectiv:' : '') + id;
      api('/api/fisa/sursa?id=' + encodeURIComponent(id) + (fel === 'obiectiv' ? '&fel=obiectiv' : '')).then(function (j) {
        if (j._cod !== 200) { info(''); feEroare(j.eroare || 'Nu pot deschide fișa pentru editare.'); if (!d.open) d.showModal(); return; }
        if ((MF.deschisa() !== id || (MF.fel && MF.fel() !== fel)) && d.open) return; // între timp s-a deschis altă fișă
        if (!d.open) MF.deschide(id, fel);
        ed = { mod: 'fisa', fel: fel, cheie: cheie, id: id, md0: j.md, hash: j.hash, exista: j.exista, fisier: j.fisier, campuri0: j.campuri, hashMasa: j.hashMasa, fisierMasa: j.fisierMasa, hashOb: j.hashOb };
        activeaza('fisa', fel);
        if (fel === 'obiectiv') {
          $('fe-ob-text').value = j.campuri ? j.campuri.text : ''; $('fe-ob-text').disabled = !j.campuri;
        } else {
          puneTipuri(j.tipuri, '');
          var areRand = j.areMasa && j.campuri;
          puneCampuri(j.campuri, !!areRand, !j.areMasa ? 'Cursul nu are încă harvest.yml: titlul, durata și tipul se pot schimba după „Creează harvest.yml”.' : !j.campuri ? 'Piesa nu e în ' + j.fisierMasa + '.' : '');
          puneBifeOb(j.obiective, !!areRand);
        }
        $('fe-text').value = j.md;
        $('fe-text-eticheta').textContent = 'Fișa (Markdown) · ' + j.fisier + (j.exista ? '' : (fel === 'obiectiv' ? ' · nouă; se creează la „Salvează”' : ' · nouă, din șablonul D-078; se creează la „Salvează”'));
        var c = ciorne[cheie];
        if (c) {
          $('fe-text').value = c.md;
          if (fel === 'obiectiv') { if ('text' in c.v) $('fe-ob-text').value = c.v.text; }
          else {
            CAMP.forEach(function (k) { if (k in c.v) $('fe-' + k).value = c.v[k]; });
            if (c.ob) [].forEach.call($('fe-ob-lista').querySelectorAll('input[data-ob]'), function (x) { if (!x.disabled) x.checked = c.ob.indexOf(x.getAttribute('data-ob')) >= 0; });
          }
          info('Am pus înapoi textul nesalvat de data trecută. „Renunță” îl aruncă.');
        }
        $('fe-text').focus(); $('fe-text').setSelectionRange(0, 0); $('fe-text').scrollTop = 0;
      }, function () { feEroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?'); });
    }
    function renunta() {
      if (!ed) return true;
      if (murdar() && !confirm(ed.mod === 'nou' ? 'Renunți la piesa nouă?' : 'Renunți la schimbările din fișă?')) return false;
      var nou = ed.mod === 'nou'; delete ciorne[ed.cheie || ed.id];
      iesi();
      if (nou) d.close();
      return true;
    }
    function salveaza() {
      if (!ed) return;
      if (ed.mod === 'nou') return creeaza();
      var b = $('fe-salveaza'); b.disabled = true; b.textContent = 'Salvez…'; feEroare('');
      var campuri = schimbate(), id = ed.id, fel = ed.fel, cheie = ed.cheie, inCore = CORE && fel !== 'obiectiv' && $('fe-core-bifa').checked;
      var corpCerere = { id: id, md: $('fe-text').value, hash: ed.hash, campuri: campuri, campuriInainte: ed.campuri0 };
      if (fel === 'obiectiv') corpCerere.fel = 'obiectiv';
      else if (campuri.obiective && ed.obLista) {
        // O bifă scoasă de pe un obiectiv care are piesa în lista lui „piese” o scoate și de acolo (harvest-obiective.yml).
        corpCerere.scoateDinObiective = ed.obLista.filter(function (o) { return o.dinLista && campuri.obiective.indexOf(o.id) < 0; }).map(function (o) { return o.id; });
        corpCerere.hashOb = ed.hashOb;
      }
      api('/api/fisa/salveaza', 'POST', corpCerere).then(function (j) {
        b.disabled = false; b.textContent = 'Salvează';
        if (!ed || ed.id !== id || ed.fel !== fel) return;
        if (j._cod === 409 && j.conflict) { arataConflict(j); return; }
        if (j._cod !== 200) { feEroare(j.eroare || 'Nu s-a salvat.', j.erori); return; } // textul rămâne în câmp
        delete ciorne[cheie];
        if (fel === 'obiectiv') { if (j.sursa) MF.actualizeazaOb(id, j.sursa.campuri, j.sursa.hashOb); }
        else if (j.sursa) { MF.actualizeaza(id, j.sursa.campuri, j.sursa.hashMasa); if (MF.legaturiObiective) MF.legaturiObiective(id, j.sursa.obiective, j.sursa.hashOb); }
        iesi();
        MF.arata(id, j.fisa, fel);
        stare(j.neschimbat ? ' · nimic de salvat' : ' · salvat în ' + escape(j.sursa ? j.sursa.fisier : 'harvest/') + (Object.keys(campuri).length ? ' și ' + escape(fel === 'obiectiv' ? j.sursa.fisierOb : j.sursa.fisierMasa) : '') + ', materialul e refăcut');
        $('fisa-sursa').textContent += j.neschimbat ? ' · nimic de salvat' : ' · salvat';
        be.focus();
        if (inCore) trimiteCore(id, {}, 'Fișa e salvată în curs.');
      }, function () { b.disabled = false; b.textContent = 'Salvează'; feEroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă? Textul tău e tot aici.'); });
    }
    function arataConflict(j) {
      ed.conflict = j.conflict;
      $('fe-conflict-text').textContent = j.conflict.fisa ? 'Fișa s-a schimbat între timp (probabil un agent). Nu am suprascris-o.' : j.eroare;
      $('fe-conflict').hidden = false;
      $('fe-pastreaza').focus();
    }
    function copiaza(text) {
      var rezerva = function () { var t = $('fe-text'); t.focus(); t.select(); try { return document.execCommand('copy'); } catch (e) { return false; } };
      return new Promise(function (ok) {
        try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { ok(true); }, function () { ok(rezerva()); }); else ok(rezerva()); } catch (e) { ok(rezerva()); }
      });
    }
    $('fe-reincarca').addEventListener('click', function () { if (!ed) return; var id = ed.id, fel = ed.fel; delete ciorne[ed.cheie || id]; ed = null; intra(id, fel); });
    $('fe-pastreaza').addEventListener('click', function () {
      if (!ed || !ed.conflict) return;
      var c = ed.conflict;
      if ('hash' in c) { ed.hash = c.hash; ed.exista = c.hash != null; }
      if (c.campuri) { ed.campuri0 = c.campuri; ed.hashMasa = c.hashMasa; if (c.hashOb) ed.hashOb = c.hashOb; }
      ed.conflict = null; $('fe-conflict').hidden = true;
      copiaza($('fe-text').value).then(function (ok) {
        info((ok ? 'Textul tău e copiat în clipboard și' : 'Nu l-am putut copia în clipboard, dar textul tău') + ' rămâne aici. „Salvează” înlocuiește acum versiunea de pe disc (aceea rămâne în .editor-istoric/).');
        $('fe-text').focus();
      });
    });
    // Piesă nouă: titlu, durată, tip, scop; serverul face id-ul, rândul și fișa din șablon, apoi o deschidem în modul de editare.
    noua.addEventListener('click', function () {
      if (MF.propunere()) return;
      api('/api/fisa/sursa?id=piesa-noua-model').then(function (j) {
        ed = { mod: 'nou', fel: 'piesa', id: null, md0: '', campuri0: { titlu: '', scop: '', durata: '', tip: '' } };
        $('fisa-titlu').textContent = 'Piesă nouă'; $('fisa-sursa').textContent = 'Harvest · rând nou în harvest.yml + fișă în harvest/';
        activeaza('nou', 'piesa');
        puneTipuri(j.tipuri || [], '');
        puneCampuri(null, true, 'Id-ul se face din titlu (litere mici, fără diacritice). Piesa intră în Harvest cu verdict „nou”, iar fișa pornește din șablonul D-078.');
        if (!d.open) d.showModal();
        $('fe-titlu').focus();
      });
    });
    function creeaza() {
      var v = val();
      if (!v.titlu.trim()) { feEroare('Scrie un titlu.'); $('fe-titlu').focus(); return; }
      var b = $('fe-salveaza'); b.disabled = true; b.textContent = 'Creez…'; feEroare('');
      api('/api/fisa/noua', 'POST', { titlu: v.titlu, scop: v.scop, durata: /^\s*\d+\s*$/.test(v.durata) ? +v.durata : v.durata, tip: v.tip }).then(function (j) {
        b.disabled = false; b.textContent = 'Creează piesa';
        if (j._cod !== 200) { feEroare(j.eroare || 'Nu am putut crea piesa.', j.erori); return; }
        ed = null;
        var gata = function (extra) {
          try { sessionStorage.setItem('masa:mesaj', 'Am creat piesa „' + v.titlu.trim() + '” (' + j.fisier + ', verdict „nou”). Fișa e deschisă pentru editare.' + (extra || '')); sessionStorage.setItem('masa:editeaza', j.id); } catch (e) { /* nimic */ }
          location.hash = '#masa'; location.reload();
        };
        if (!(CORE && $('fe-core-bifa').checked)) return gata();
        api('/api/core/trimite', 'POST', { id: j.id }).then(function (k) { gata(k._cod === 200 ? ' E și în core: ' + k.din + '.' : ' Nu a intrat în core: ' + (k.eroare || 'eroare')); }, function () { gata(' Nu a intrat în core: editorul nu a răspuns.'); });
      }, function () { b.disabled = false; b.textContent = 'Creează piesa'; feEroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?'); });
    }

    be.addEventListener('click', function () { var id = MF.deschisa(); if (id) intra(id, MF.fel ? MF.fel() : 'piesa'); });
    $('fe-salveaza').addEventListener('click', salveaza);
    $('fe-renunta').addEventListener('click', renunta);
    // Esc în modul de editare = „Renunță” (cu întrebare dacă ai scris ceva); nu închide fișa pe nevăzute.
    d.addEventListener('keydown', function (ev) {
      if (!ed) return;
      if (ev.key === 'Escape') { ev.preventDefault(); ev.stopPropagation(); renunta(); return; }
      if ((ev.metaKey || ev.ctrlKey) && (ev.key === 's' || ev.key === 'S' || ev.key === 'Enter')) { ev.preventDefault(); salveaza(); }
    }, true);
    d.addEventListener('cancel', function (ev) { if (ed) { ev.preventDefault(); renunta(); } });
    window.__fisaPaza = function () {
      if (!ed) return true;
      if (murdar() && !confirm('Închizi fișa fără să salvezi schimbările?')) return false;
      if (ed.id) delete ciorne[ed.cheie || ed.id];
      iesi(); return true;
    };
    // Dacă fișa se închide totuși cu text nesalvat, textul rămâne ca ciornă pentru următorul „Editează”.
    d.addEventListener('close', function () {
      if (ed && ed.mod === 'fisa' && murdar()) ciorne[ed.cheie || ed.id] = { md: $('fe-text').value, v: ed.fel === 'obiectiv' ? { text: $('fe-ob-text').value } : val(), ob: ed.fel === 'obiectiv' || !ed.ob0 ? null : bifeOb() };
      if (ed) iesi();
    });
    window.addEventListener('beforeunload', function (ev) { if (murdar()) { ev.preventDefault(); ev.returnValue = ''; } });

    // ---------- Biblioteca core (spec Radu, 2026-11-20): copie cu legătură; fiecare copiere e un buton apăsat de Alex ----------
    // Rândul „Din core” sub titlul fișei (stare + acțiuni), alegerea alăturată la „diferă”, bifa lângă „Salvează”, „Adaugă din core” în Harvest.
    var CORE = CFG.core || null, ci = null, coreMesaj = '';
    var bc = document.createElement('div'); bc.className = 'fe-core'; bc.id = 'fe-core'; bc.hidden = true; bc.setAttribute('role', 'region'); bc.setAttribute('aria-label', 'Biblioteca core');
    var cmp = document.createElement('div'); cmp.className = 'fe-cmp'; cmp.id = 'fe-cmp'; cmp.hidden = true;
    cap.parentNode.insertBefore(bc, cap.nextSibling); bc.parentNode.insertBefore(cmp, bc.nextSibling);
    if (CORE) $('fe-optiuni').innerHTML = '<label class="fe-bifa" id="fe-core-eticheta"><input type="checkbox" id="fe-core-bifa"> <span id="fe-core-bifa-text">Salvează și în core</span></label>';
    function puneBifa(mod) {
      if (!CORE) return;
      var legata = mod !== 'nou' && ci && ci.id === (ed && ed.id) && ci.legata;
      $('fe-core-bifa-text').textContent = legata ? 'Actualizează și în core' : 'Salvează și în core';
      $('fe-core-eticheta').hidden = mod !== 'nou' && !(ci && ci.activ && ci.areRand && ci.id === (ed && ed.id));
    }
    window.__fisaLaDeschidere = function (id, fel) {
      ci = null; bc.hidden = true; cmp.hidden = true; if (!ed) corp.hidden = false;
      if (!CORE || fel === 'obiectiv') return; // obiectivele sunt ale cursului: fără core
      api('/api/core/stare?id=' + encodeURIComponent(id)).then(function (j) {
        if (MF.deschisa() !== id || (MF.fel && MF.fel() !== 'piesa') || j._cod !== 200) return;
        ci = j; ci.id = id; deseneazaCore(); if (ed) puneBifa(ed.mod);
      });
    };
    var buton2 = function (id, text, cls) { return '<button type="button" id="' + id + '"' + (cls ? ' class="' + cls + '"' : '') + '>' + text + '</button>'; };
    function deseneazaCore() {
      if (!ci || !ci.activ || !ci.areRand || ed || ci.id !== MF.deschisa() || (MF.fel && MF.fel() !== 'piesa')) { bc.hidden = true; return; }
      var h = '', din = '<code>' + escape(ci.din || '') + '</code>';
      if (!ci.legata) {
        h = '<span class="fe-core-text sters">Doar în acest curs.</span>' + buton2('fe-core-trimite', 'Trimite în core') +
          (ci.propus ? '<span class="fe-core-id"><label>Id în core <input id="fe-core-id" type="text" maxlength="60" autocomplete="off" spellcheck="false" value="' + escape(ci.propus) + '"></label></span>' : '');
      } else {
        h = '<span class="fe-core-text"><span class="fe-core-semn" aria-hidden="true">◇</span> Din core ' + din + ' · <b>' + escape(ci.text) + '</b></span>';
        if (ci.stare === 'modificata') h += buton2('fe-core-trimite', 'Actualizează în core');
        if (ci.stare === 'noua') h += buton2('fe-core-ia', 'Ia versiunea din core', 'principal') + buton2('fe-core-raman', 'Rămân la a mea');
        if (ci.stare === 'difera') h += buton2('fe-core-compara', 'Compară și alege', 'principal');
        if (ci.stare === 'lipsa') h += buton2('fe-core-trimite', 'Trimite din nou în core');
        h += buton2('fe-core-dezleaga', 'Dezleagă de core', 'fe-core-discret');
      }
      bc.innerHTML = h + '<p class="fe-core-mesaj" id="fe-core-mesaj" role="status">' + escape(coreMesaj) + '</p>';
      coreMesaj = '';
      bc.hidden = false;
      if (!ci.areCeva && $('fe-core-trimite')) { $('fe-core-trimite').disabled = true; $('fe-core-trimite').title = 'Piesa nu are încă nimic scris: nici fișă, nici piesă produsă.'; }
    }
    function mesajCore(t, rau) { var m = $('fe-core-mesaj'); if (m) { m.textContent = t || ''; m.classList.toggle('eroare', !!rau); } }
    function dupaCore(id, mesaj) {
      try { sessionStorage.setItem('masa:mesaj', mesaj); sessionStorage.setItem('masa:core-mesaj', mesaj); sessionStorage.setItem('masa:fisa', id); } catch (e) { /* nimic */ }
      location.hash = '#masa'; location.reload();
    }
    var lucreaza = function (on) { [].forEach.call(bc.querySelectorAll('button'), function (b) { b.disabled = on; }); [].forEach.call(cmp.querySelectorAll('button'), function (b) { b.disabled = on; }); };
    function trimiteCore(id, extra, inainte) {
      var corpCerere = { id: id }; for (var k in extra) corpCerere[k] = extra[k];
      lucreaza(true); mesajCore('Trimit în core…');
      return api('/api/core/trimite', 'POST', corpCerere).then(function (j) {
        lucreaza(false);
        if (j._cod === 200) return dupaCore(id, (inainte ? inainte + ' ' : '') + 'E și în core: ' + j.din + '.');
        if (!ci || ci.id !== id) return;
        if (j._cod === 409 && j.conflict && j.conflict.ocupat) { ci.propus = j.conflict.propus; deseneazaCore(); mesajCore((inainte ? inainte + ' ' : '') + j.eroare, true); var c = $('fe-core-id'); if (c) { c.focus(); c.select(); } return; }
        if (j._cod === 409 && j.conflict && j.conflict.stare === 'difera') { ci.L = j.conflict.L; ci.C = j.conflict.C; ci.stare = 'difera'; ci.text = 'diferă'; deseneazaCore(); mesajCore((inainte ? inainte + ' ' : '') + j.eroare, true); return compara(); }
        mesajCore((inainte ? inainte + ' ' : '') + (j.eroare || 'Nu a intrat în core.'), true);
      }, function () { lucreaza(false); mesajCore('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?', true); });
    }
    function cere(cale, corpCerere, mesaj) {
      var id = ci.id; lucreaza(true);
      api(cale, 'POST', corpCerere).then(function (j) {
        lucreaza(false);
        if (j._cod === 200) return dupaCore(id, mesaj);
        mesajCore(j.eroare || 'Nu s-a putut.', true);
      }, function () { lucreaza(false); mesajCore('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?', true); });
    }
    function compara() {
      if (!ci) return;
      var id = ci.id;
      api('/api/core/compara?id=' + encodeURIComponent(id)).then(function (j) {
        if (MF.deschisa() !== id || ed) return;
        if (j._cod !== 200) { mesajCore(j.eroare || 'Nu pot compara.', true); return; }
        // HTML-ul vine randat și escapat de server (lib/fisa.mjs), ca fișa obișnuită.
        var col = function (titlu, f) { return '<section class="fe-cmp-col"><p class="eticheta">' + titlu + '</p><div class="fe-cmp-corp">' + (f && f.sursa ? f.html : '<p class="sters">Nimic scris.</p>') + '</div></section>'; };
        cmp.innerHTML = '<div class="fe-cmp-cols">' + col('În acest curs', j.curs) + col('În core · ' + escape(j.din), j.core) + '</div>' +
          '<div class="fe-cmp-alege"><span class="sters">Fără îmbinare automată: alegi una. Cealaltă rămâne în .editor-istoric/.</span>' +
          buton2('fe-cmp-inapoi', 'Înapoi la fișă') + buton2('fe-cmp-curs', 'Păstrez a cursului') + buton2('fe-cmp-core', 'Iau din core') + buton2('fe-cmp-trimit', 'Trimit a cursului în core', 'principal') + '</div>';
        [].forEach.call(cmp.querySelectorAll('img[data-img]'), function (im) { if (IMG[im.getAttribute('data-img')]) im.src = IMG[im.getAttribute('data-img')]; });
        corp.hidden = true; cmp.hidden = false; $('fe-cmp-trimit').focus();
      });
    }
    bc.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !ci) return;
      if (b.id === 'fe-core-trimite') {
        var c = $('fe-core-id'), extra = {};
        if (c) { if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.value)) { mesajCore('Id-ul are doar litere mici, cifre și cratimă.', true); c.focus(); return; } extra.idCore = c.value; }
        if (ci.stare === 'lipsa') extra.asteptat = null;
        trimiteCore(ci.id, extra);
      } else if (b.id === 'fe-core-ia') {
        if (confirm('Copia din curs devine versiunea din core. Cea de acum rămâne în .editor-istoric/. Continui?')) cere('/api/core/ia', { id: ci.id, C: ci.C, L: ci.L }, 'Am luat versiunea din core.');
      } else if (b.id === 'fe-core-raman') cere('/api/core/raman', { id: ci.id, L: ci.L }, 'Rămâne versiunea cursului; nu mai întreb de versiunea asta din core.');
      else if (b.id === 'fe-core-compara') compara();
      else if (b.id === 'fe-core-dezleaga') {
        if (confirm('Dezlegi piesa de ' + ci.din + '? Rămâne a cursului, iar core nu se schimbă.')) cere('/api/core/dezleaga', { id: ci.id }, 'Piesa e acum doar a cursului.');
      }
    });
    cmp.addEventListener('click', function (ev) {
      var b = ev.target.closest('button'); if (!b || !ci) return;
      if (b.id === 'fe-cmp-inapoi') { cmp.hidden = true; corp.hidden = false; return; }
      if (b.id === 'fe-cmp-curs') cere('/api/core/raman', { id: ci.id, L: ci.L }, 'Păstrezi versiunea cursului; core rămâne cum e.');
      if (b.id === 'fe-cmp-core') cere('/api/core/ia', { id: ci.id, C: ci.C, L: ci.L }, 'Am luat versiunea din core.');
      if (b.id === 'fe-cmp-trimit') trimiteCore(ci.id, { asteptat: ci.L });
    });

    // „Adaugă din core”, lângă „Piesă nouă”: lista compactă, căutare, filtre-buton după tip.
    if (CORE) {
      var ad = document.createElement('button');
      ad.type = 'button'; ad.id = 'core-deschide'; ad.textContent = 'Adaugă din core';
      if (dreapta) dreapta.insertBefore(ad, noua.nextSibling);
      if (MF.propunere()) { ad.disabled = true; ad.title = 'Întâi „Creează harvest.yml”.'; }
      var cd = document.createElement('dialog');
      cd.className = 'fisa-dialog core-dialog'; cd.id = 'core-dialog'; cd.setAttribute('aria-labelledby', 'core-titlu');
      cd.innerHTML = '<header class="fisa-cap"><div><p class="eticheta">Biblioteca core · ' + escape(CORE) + '</p><h2 id="core-titlu">Adaugă din core</h2></div><button type="button" class="fisa-inchide" id="core-inchide" aria-label="Închide">×</button></header>' +
        '<div class="core-cauta"><input type="search" id="core-q" placeholder="Caută: titlu, scop, etichetă" aria-label="Caută în core" autocomplete="off"><div class="core-filtre" id="core-filtre" role="group" aria-label="Filtrează după tip"></div></div>' +
        '<p class="ed-eroare" id="core-eroare" role="alert" hidden></p><ul class="core-lista" id="core-lista"></ul><p class="sters core-gol" id="core-gol" hidden></p>';
      document.body.appendChild(cd);
      var lista = [], tipAles = '', TIPRO = { exercitiu: 'exercițiu', reflectie: 'reflecție', inchidere: 'închidere', pauza: 'pauză' };
      var norm = function (t) { return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); };
      var coreEroare = function (t) { $('core-eroare').hidden = !t; $('core-eroare').textContent = t || ''; };
      function randCore(x) {
        return '<li class="core-rand" data-id="' + escape(x.id) + '"><span class="mc-durata"><b>' + escape(x.durata) + '</b> min</span>' +
          '<span class="core-cap"><span class="mc-titlu">' + escape(x.titlu) + (x.tip === 'challenge' ? ' <span title="challenge">◆</span>' : '') + '</span>' + (x.scop ? '<span class="mc-scop">' + escape(x.scop) + '</span>' : '') +
          '<span class="core-meta">' + escape([x.tip ? TIPRO[x.tip] || x.tip : '', (x.etichete || []).join(', '), 'comun/' + x.id].filter(Boolean).join(' · ')) + '</span></span>' +
          '<span class="core-act">' + (x.inCurs ? '<span class="sters">e deja în curs</span>' : '<button type="button" class="core-adauga" data-id="' + escape(x.id) + '">Adaugă</button>') + '</span>' +
          '<span class="core-id" hidden><label>Id în curs <input type="text" maxlength="60" autocomplete="off" spellcheck="false"></label><button type="button" class="core-adauga principal" data-id="' + escape(x.id) + '" data-cu-id="1">Adaugă cu acest id</button></span></li>';
      }
      function deseneazaLista() {
        var q = norm($('core-q').value).trim();
        var vazute = lista.filter(function (x) { return (!tipAles || x.tip === tipAles) && (!q || norm([x.titlu, x.scop, x.id, (x.etichete || []).join(' ')].join(' ')).indexOf(q) >= 0); });
        $('core-lista').innerHTML = vazute.map(randCore).join('');
        $('core-gol').hidden = vazute.length > 0;
        $('core-gol').textContent = lista.length ? 'Nicio piesă nu se potrivește.' : 'Core e încă gol. Trimiți piese din Fișa: „Trimite în core” sau bifa „Salvează și în core”.';
      }
      function deseneazaFiltre() {
        var tipuri = []; lista.forEach(function (x) { if (x.tip && tipuri.indexOf(x.tip) < 0) tipuri.push(x.tip); });
        $('core-filtre').innerHTML = tipuri.length > 1 ? ['<button type="button" data-tip="" aria-pressed="' + !tipAles + '">Toate</button>'].concat(tipuri.sort().map(function (t) { return '<button type="button" data-tip="' + escape(t) + '" aria-pressed="' + (tipAles === t) + '">' + escape(TIPRO[t] || t) + '</button>'; })).join('') : '';
      }
      ad.addEventListener('click', function () {
        coreEroare(''); $('core-q').value = ''; tipAles = '';
        api('/api/core').then(function (j) {
          if (j._cod !== 200) { coreEroare(j.eroare || 'Nu pot citi core.'); lista = []; }
          else { lista = j.piese || []; if (j.erori && j.erori.length) coreEroare(j.erori.join(' · ')); }
          deseneazaFiltre(); deseneazaLista();
          if (!cd.open) cd.showModal();
          $('core-q').focus();
        }, function () { coreEroare('Editorul nu răspunde.'); if (!cd.open) cd.showModal(); });
      });
      $('core-q').addEventListener('input', deseneazaLista);
      $('core-filtre').addEventListener('click', function (ev) { var b = ev.target.closest('button[data-tip]'); if (!b) return; tipAles = b.getAttribute('data-tip'); deseneazaFiltre(); deseneazaLista(); });
      $('core-inchide').addEventListener('click', function () { cd.close(); });
      cd.addEventListener('click', function (ev) { if (ev.target === cd) cd.close(); });
      cd.addEventListener('keydown', function (ev) { ev.stopPropagation(); }); // tastele nu ajung la cartonașe sau la prezentare
      cd.addEventListener('close', function () { ad.focus(); });
      $('core-lista').addEventListener('click', function (ev) {
        var b = ev.target.closest('button.core-adauga'); if (!b) return;
        var li = b.closest('.core-rand'), idc = b.getAttribute('data-id'), corpCerere = { idCore: idc };
        if (b.getAttribute('data-cu-id')) {
          var v = li.querySelector('.core-id input').value;
          if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(v)) { coreEroare('Id-ul are doar litere mici, cifre și cratimă.'); li.querySelector('.core-id input').focus(); return; }
          corpCerere.idNou = v;
        }
        b.disabled = true; coreEroare('');
        api('/api/core/adauga', 'POST', corpCerere).then(function (j) {
          b.disabled = false;
          if (j._cod === 200) {
            try { sessionStorage.setItem('masa:mesaj', 'Am adus comun/' + idc + ' în Harvest, cu verdict „nou” (' + j.id + ').'); } catch (e) { /* nimic */ }
            location.hash = '#masa'; location.reload(); return;
          }
          if (j._cod === 409 && j.conflict && j.conflict.ocupat) {
            var z = li.querySelector('.core-id'); z.hidden = false; var inp = z.querySelector('input'); inp.value = j.conflict.propus; inp.focus(); inp.select();
          }
          coreEroare(j.eroare || 'Nu am putut aduce piesa.');
        }, function () { b.disabled = false; coreEroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?'); });
      });
    }

    var deEditat = null; try { deEditat = sessionStorage.getItem('masa:editeaza'); sessionStorage.removeItem('masa:editeaza'); } catch (e) { /* nimic */ }
    if (deEditat && MF.candidata(deEditat)) { MF.deschide(deEditat); intra(deEditat, 'piesa'); }
    var deEditatOb = null; try { deEditatOb = sessionStorage.getItem('masa:editeaza-ob'); sessionStorage.removeItem('masa:editeaza-ob'); } catch (e) { /* nimic */ }
    if (deEditatOb && MF.obiectiv && MF.obiectiv(deEditatOb)) { MF.deschide(deEditatOb, 'obiectiv'); intra(deEditatOb, 'obiectiv'); }
    var deVazut = null; try { deVazut = sessionStorage.getItem('masa:fisa'); sessionStorage.removeItem('masa:fisa'); coreMesaj = sessionStorage.getItem('masa:core-mesaj') || ''; sessionStorage.removeItem('masa:core-mesaj'); } catch (e) { /* nimic */ }
    if (deVazut && !deEditat && MF.candidata(deVazut)) MF.deschide(deVazut);
    window.__fisaEditor = { stare: function () { return ed ? { mod: ed.mod, fel: ed.fel, id: ed.id, murdar: murdar(), hash: ed.hash } : null; }, ciorne: function () { return Object.keys(ciorne); } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pornesteFisa); else pornesteFisa();
})();
