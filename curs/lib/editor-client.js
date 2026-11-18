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
    salveaza: function (schimbari, hash) { return api('/api/masa', 'POST', { schimbari: schimbari, hash: hash }).then(function (j) { stare(j._cod === 200 ? ' · salvat în masa.yml' : ''); return j; }); },
    agenda: function (hash) { return api('/api/masa/agenda', 'POST', { hash: hash }); },
    creeaza: function () { return api('/api/masa/creeaza', 'POST', {}); },
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
})();
