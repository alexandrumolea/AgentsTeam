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
    fisa: function (id) { return api('/api/fisa?id=' + encodeURIComponent(id)); },
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
      '<p class="fe-nota sters" id="fe-campuri-nota" hidden></p></div>' +
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
    var schimbate = function () { var v = val(), o = {}; if (!ed || !ed.campuri0) return o; CAMP.forEach(function (k) { if (String(v[k]).trim() !== String(ed.campuri0[k] == null ? '' : ed.campuri0[k])) o[k] = k === 'durata' ? (/^\s*\d+\s*$/.test(v[k]) ? +v[k] : v[k]) : v[k].trim(); }); return o; };
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
    function activeaza(mod) {
      d.classList.add('fe-activ'); p.hidden = false; corp.hidden = true; be.hidden = true;
      $('fe-text').hidden = mod === 'nou'; $('fe-text-eticheta').hidden = mod === 'nou';
      $('fe-salveaza').textContent = mod === 'nou' ? 'Creează piesa' : 'Salvează';
      $('fe-conflict').hidden = true; feEroare(''); info('');
    }
    function iesi() {
      ed = null; d.classList.remove('fe-activ'); p.hidden = true; corp.hidden = false; be.hidden = false;
    }
    function intra(id) {
      feEroare('');
      api('/api/fisa/sursa?id=' + encodeURIComponent(id)).then(function (j) {
        if (j._cod !== 200) { info(''); feEroare(j.eroare || 'Nu pot deschide fișa pentru editare.'); if (!d.open) d.showModal(); return; }
        if (MF.deschisa() !== id && d.open) return; // între timp s-a deschis altă piesă
        if (!d.open) MF.deschide(id);
        ed = { mod: 'fisa', id: id, md0: j.md, hash: j.hash, exista: j.exista, fisier: j.fisier, campuri0: j.campuri, hashMasa: j.hashMasa, fisierMasa: j.fisierMasa };
        activeaza('fisa');
        puneTipuri(j.tipuri, '');
        var areRand = j.areMasa && j.campuri;
        puneCampuri(j.campuri, !!areRand, !j.areMasa ? 'Cursul nu are încă harvest.yml: titlul, durata și tipul se pot schimba după „Creează harvest.yml”.' : !j.campuri ? 'Piesa nu e în ' + j.fisierMasa + '.' : '');
        $('fe-text').value = j.md;
        $('fe-text-eticheta').textContent = 'Fișa (Markdown) · ' + j.fisier + (j.exista ? '' : ' · nouă, din șablonul D-078; se creează la „Salvează”');
        var c = ciorne[id];
        if (c) {
          $('fe-text').value = c.md; CAMP.forEach(function (k) { if (k in c.v) $('fe-' + k).value = c.v[k]; });
          info('Am pus înapoi textul nesalvat de data trecută. „Renunță” îl aruncă.');
        }
        $('fe-text').focus(); $('fe-text').setSelectionRange(0, 0); $('fe-text').scrollTop = 0;
      }, function () { feEroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?'); });
    }
    function renunta() {
      if (!ed) return true;
      if (murdar() && !confirm(ed.mod === 'nou' ? 'Renunți la piesa nouă?' : 'Renunți la schimbările din fișă?')) return false;
      var nou = ed.mod === 'nou', id = ed.id; delete ciorne[id];
      iesi();
      if (nou) d.close();
      return true;
    }
    function salveaza() {
      if (!ed) return;
      if (ed.mod === 'nou') return creeaza();
      var b = $('fe-salveaza'); b.disabled = true; b.textContent = 'Salvez…'; feEroare('');
      var campuri = schimbate(), id = ed.id;
      api('/api/fisa/salveaza', 'POST', { id: id, md: $('fe-text').value, hash: ed.hash, campuri: campuri, campuriInainte: ed.campuri0 }).then(function (j) {
        b.disabled = false; b.textContent = 'Salvează';
        if (!ed || ed.id !== id) return;
        if (j._cod === 409 && j.conflict) { arataConflict(j); return; }
        if (j._cod !== 200) { feEroare(j.eroare || 'Nu s-a salvat.', j.erori); return; } // textul rămâne în câmp
        delete ciorne[id];
        if (j.sursa) MF.actualizeaza(id, j.sursa.campuri, j.sursa.hashMasa);
        iesi();
        MF.arata(id, j.fisa);
        stare(j.neschimbat ? ' · nimic de salvat' : ' · salvat în ' + escape(j.sursa ? j.sursa.fisier : 'harvest/') + (Object.keys(campuri).length ? ' și ' + escape(j.sursa.fisierMasa) : '') + ', materialul e refăcut');
        $('fisa-sursa').textContent += j.neschimbat ? ' · nimic de salvat' : ' · salvat';
        be.focus();
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
    $('fe-reincarca').addEventListener('click', function () { if (!ed) return; var id = ed.id; delete ciorne[id]; ed = null; intra(id); });
    $('fe-pastreaza').addEventListener('click', function () {
      if (!ed || !ed.conflict) return;
      var c = ed.conflict;
      if ('hash' in c) { ed.hash = c.hash; ed.exista = c.hash != null; }
      if (c.campuri) { ed.campuri0 = c.campuri; ed.hashMasa = c.hashMasa; }
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
        ed = { mod: 'nou', id: null, md0: '', campuri0: { titlu: '', scop: '', durata: '', tip: '' } };
        $('fisa-titlu').textContent = 'Piesă nouă'; $('fisa-sursa').textContent = 'Harvest · rând nou în harvest.yml + fișă în harvest/';
        activeaza('nou');
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
        try { sessionStorage.setItem('masa:mesaj', 'Am creat piesa „' + v.titlu.trim() + '” (' + j.fisier + ', verdict „nou”). Fișa e deschisă pentru editare.'); sessionStorage.setItem('masa:editeaza', j.id); } catch (e) { /* nimic */ }
        location.hash = '#masa'; location.reload();
      }, function () { b.disabled = false; b.textContent = 'Creează piesa'; feEroare('Editorul nu răspunde. Fereastra Terminal în care rulează e încă deschisă?'); });
    }

    be.addEventListener('click', function () { var id = MF.deschisa(); if (id) intra(id); });
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
      if (ed.id) delete ciorne[ed.id];
      iesi(); return true;
    };
    // Dacă fișa se închide totuși cu text nesalvat, textul rămâne ca ciornă pentru următorul „Editează”.
    d.addEventListener('close', function () {
      if (ed && ed.mod === 'fisa' && murdar()) ciorne[ed.id] = { md: $('fe-text').value, v: val() };
      if (ed) iesi();
    });
    window.addEventListener('beforeunload', function (ev) { if (murdar()) { ev.preventDefault(); ev.returnValue = ''; } });

    var deEditat = null; try { deEditat = sessionStorage.getItem('masa:editeaza'); sessionStorage.removeItem('masa:editeaza'); } catch (e) { /* nimic */ }
    if (deEditat && MF.candidata(deEditat)) { MF.deschide(deEditat); intra(deEditat); }
    window.__fisaEditor = { stare: function () { return ed ? { mod: ed.mod, id: ed.id, murdar: murdar(), hash: ed.hash } : null; }, ciorne: function () { return Object.keys(ciorne); } };
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pornesteFisa); else pornesteFisa();
})();
