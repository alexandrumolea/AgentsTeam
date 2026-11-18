// Materialul trainerului, partea care rulează în browser. Fără internet, fără server, fără biblioteci.
// Modul Prezintă: fereastra sălii este ACELAȘI fișier, deschis cu „#sala”. Cele două ferestre vorbesc prin postMessage,
// care merge și din file:// (unde fiecare fișier are altă origine, deci accesul direct dintr-o fereastră în alta e blocat).
// Ecranul de comandă trimite doar „ce ecran, negru sau nu, cronometrul”; sala trimite înapoi tastele (telecomanda).
(function () {
  'use strict';
  var DATA = JSON.parse(document.getElementById('date-curs').textContent);
  var IMG = JSON.parse(document.getElementById('imagini').textContent);
  // TOATE: ecranele din sală în ordinea ediției (build-ul aplică deja `ecrane:` din ediție), cu id stabil (1.10).
  // ECRANE: ce se prezintă acum, în ordinea locală (vederea Ecrane), fără cele ascunse. Toată prezentarea lucrează cu ECRANE.
  var TOATE = DATA.ecrane, ECRANE = TOATE.slice(), DUPA_ID = {};
  for (var ti = 0; ti < TOATE.length; ti++) DUPA_ID[TOATE[ti].id] = TOATE[ti];
  // Biblioteca (1.12): ecranele fiecărei piese, ca să poată fi prezentată live chiar dacă nu e în agendă (id-uri <piesă>~live#n).
  var BIB = DATA.biblioteca || {}, BIB_ID = {};
  Object.keys(BIB).forEach(function (pid) { BIB[pid].ecrane.forEach(function (x) { BIB_ID[x.id] = x; }); });
  var $ = function (id) { return document.getElementById(id); };
  var NUME_SALA = 'sala-' + DATA.curs.slug;
  var CHEIE = 'curs:' + DATA.curs.slug + ':' + (DATA.editie.data || '');

  var MOD_SALA = location.hash === '#sala';

  // ---------- stare (păstrată în browser, ca un refresh să nu te scoată din zi) ----------
  var st = citeste() || { i: 0, intrari: {}, start: null };
  var cron = { total: 0, ramas: 0, pornit: null };
  var negru = false, sala = null, aici = false, vedere = 'ziua';
  function citeste() { try { var s = JSON.parse(localStorage.getItem(CHEIE)); return s && typeof s.i === 'number' ? s : null; } catch (e) { return null; } }
  function salveaza() { try { localStorage.setItem(CHEIE, JSON.stringify(st)); } catch (e) { /* fără stocare: merge oricum */ } }

  // ---------- ecrane ----------
  function hidrateaza(r) { var l = r.querySelectorAll('img[data-img]'); for (var k = 0; k < l.length; k++) if (!l[k].getAttribute('src')) l[k].src = IMG[l[k].getAttribute('data-img')] || ''; }
  function ecranHtml(e) {
    if (!e) return '<div class="ecran ecran-final"><p>Final</p></div>';
    return '<div class="ecran fel-' + e.fel + (e.titlu ? ' ecran-titlu' : '') + '">' + e.html + '</div>';
  }
  function puneEcran(cadru, e) {
    var cheie = e ? e.id : 'final';
    if (cadru._id === cheie && cadru.firstElementChild) { potriveste(cadru); return; }
    cadru.innerHTML = ecranHtml(e) + '<div class="negru-strat"></div>';
    cadru._id = cheie; hidrateaza(cadru); potriveste(cadru);
  }
  function potriveste(cadru) {
    var e = cadru.firstElementChild; if (!e) return;
    var w = cadru.clientWidth, h = cadru.clientHeight; if (!w || !h) return;
    var s = Math.min(w / 1600, h / 900);
    e.style.transform = 'translate(' + (w - 1600 * s) / 2 + 'px,' + (h - 900 * s) / 2 + 'px) scale(' + s + ')';
  }

  // ---------- timp ----------
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  function mmss(ms) { var s = Math.max(0, Math.ceil(ms / 1000)); return Math.floor(s / 60) + ':' + pad(s % 60); }
  function oraDin(min) { return Math.floor(min / 60) + ':' + pad(min % 60); }
  function azi() { var d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function cronRamas() { return cron.pornit ? cron.ramas - (Date.now() - cron.pornit) : cron.ramas; }
  function modulCurent() { return ECRANE[st.i] ? ECRANE[st.i].modul : null; }
  // Abaterea față de plan: în ziua ediției, după ceas; în altă zi (repetiție), față de momentul în care ai pornit.
  function abatere() {
    var mi = modulCurent(); if (mi == null) return null;
    var m = DATA.module[mi], intrare = st.intrari[mi];
    if (!intrare || m.start == null) return null;
    var plan;
    if (DATA.editie.data === azi()) { var z = new Date(intrare); z.setHours(0, 0, 0, 0); plan = z.getTime() + m.start * 60000; }
    else { if (!st.start) return null; plan = st.start + (m.start - DATA.editie.start) * 60000; }
    return { min: Math.round((intrare - plan) / 60000), repetitie: DATA.editie.data !== azi() };
  }

  // ---------- navigare ----------
  function mergiLa(i) {
    i = Math.max(0, Math.min(ECRANE.length - 1, i));
    var schimbat = i !== st.i || ECRANE[i].id !== st.id || cron.total === 0;
    st.i = i; st.id = ECRANE[i].id;
    var mi = ECRANE[i].modul;
    if (!st.intrari[mi]) st.intrari[mi] = Date.now();
    if (schimbat) { var c = ECRANE[i].cronometru; cron = { total: c * 60000, ramas: c * 60000, pornit: null }; }
    salveaza(); randeaza();
  }
  function cronComuta() {
    if (!cron.total) { mesaj('Ecranul acesta nu are cronometru.'); return; }
    if (cron.pornit) { cron.ramas = cronRamas(); cron.pornit = null; }
    else if (cron.ramas <= 0) cron.ramas = cron.total;
    else cron.pornit = Date.now();
    bate();
  }
  function negruComuta() { negru = !negru; randeaza(); }
  // Schița mare acoperă ecranul de comandă: are buton propriu de închidere, se închide cu S sau Esc,
  // la alegerea unui modul și la schimbarea vederii, și începe sub bara de sus (care poate avea două rânduri).
  function schitaSeteaza(mare) {
    var c = $('comanda'); if (!c) return;
    c.classList.toggle('schita-mare', mare);
    var cutie = $('schita-mica'), bara = document.querySelector('.bara');
    if (cutie) cutie.style.top = mare && bara ? (bara.getBoundingClientRect().bottom + 8) + 'px' : '';
  }
  function schitaComuta() { schitaSeteaza(!$('comanda').classList.contains('schita-mare')); }

  // ---------- fereastra sălii (văzută din ecranul de comandă) ----------
  var salaGata = false;
  function deschideSala() {
    var adresa = location.href.split('#')[0] + '#sala';
    // Numele e fix: dacă fereastra sălii a rămas deschisă (de exemplu după un refresh al acestei pagini), o refolosim
    // fără s-o reîncărcăm, ca să rămână pe tot ecranul pe proiector.
    var w = window.open('', NUME_SALA, 'popup,width=1280,height=720');
    if (!w) { mesaj('Browserul a blocat fereastra nouă. Permite ferestrele pop-up pentru acest fișier sau folosește „Prezintă aici”.', true); return; }
    var noua = false;
    try { noua = w.location.href === 'about:blank'; } catch (e) { noua = false; /* altă origine: e fereastra sălii de dinainte */ }
    sala = w; salaGata = false;
    if (noua) w.location.href = adresa; else trimite({ tip: 'salut' });
    if (!st.start) { st.start = Date.now(); salveaza(); }
    arata('prezinta'); mergiLa(st.i);
    try { w.focus(); } catch (e) { /* nimic */ }
  }
  function trimite(m) { if (sala && !sala.closed) try { sala.postMessage(m, '*'); } catch (e) { /* nimic */ } }
  function salaDeschisa() { return !!(sala && !sala.closed && salaGata); }
  // Sala primește id-ul ecranului (nu poziția): ordinea și ascunderea le decide doar ecranul de comandă.
  function stareEcran() { return { tip: 'ecran', id: ECRANE[st.i] ? ECRANE[st.i].id : null, negru: negru }; }
  window.addEventListener('message', function (ev) {
    if (MOD_SALA || !sala || ev.source !== sala || !ev.data) return;
    if (ev.data.tip === 'gata') { salaGata = true; randeaza(); }
    else if (ev.data.tip === 'tasta') tasta({ key: ev.data.key, dinSala: true, preventDefault: function () {} });
  });
  function totEcranul(el) {
    var f = el.requestFullscreen || el.webkitRequestFullscreen;
    if (f) { try { var p = f.call(el); if (p && p.catch) p.catch(function () {}); } catch (e) { /* nimic */ } }
  }

  // ---------- „Prezintă aici” (un singur ecran) ----------
  function prezintaAici() {
    aici = true;
    var a = $('aici'); a.hidden = false;
    a.innerHTML = '<div class="cadru cadru-plin" id="aici-cadru"></div>';
    if (!st.start) { st.start = Date.now(); salveaza(); }
    totEcranul(a); mergiLa(st.i);
  }
  function iesiAici() { aici = false; $('aici').hidden = true; $('aici').innerHTML = ''; arata('prezinta'); randeaza(); }
  document.addEventListener('fullscreenchange', function () { if (aici && !document.fullscreenElement) iesiAici(); });
  document.addEventListener('webkitfullscreenchange', function () { if (aici && !document.webkitFullscreenElement) iesiAici(); });

  // ---------- taste (aceeași funcție în ambele ferestre) ----------
  var INAINTE = ['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'];
  var INAPOI = ['ArrowLeft', 'ArrowUp', 'PageUp'];
  function tasta(ev) {
    if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var t = ev.target;
    // O bifă din schiță are focusul după click: Spațiu/Enter o bifează, dar telecomanda (săgeți, PageDown) merge mai departe.
    var bifa = t && t.tagName === 'INPUT' && t.type === 'checkbox';
    if (bifa && (ev.key === ' ' || ev.key === 'Enter')) return;
    if (t && t.tagName && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) && !bifa) return;
    var dinSala = !!ev.dinSala;
    if (!dinSala && !aici && vedere !== 'prezinta') return; // în Ziua, Modulul și Schița tastele fac ce fac de obicei
    var k = ev.key, oprit = true;
    if (INAINTE.indexOf(k) >= 0) mergiLa(st.i + 1);
    else if (INAPOI.indexOf(k) >= 0) mergiLa(st.i - 1);
    else if (k === 'Home') mergiLa(0);
    else if (k === 'End') mergiLa(ECRANE.length - 1);
    else if (k === 'c' || k === 'C') cronComuta();
    else if (k === 'n' || k === 'N' || k === 'b' || k === 'B' || k === '.') negruComuta(); // telecomenzile trimit „.” sau „B” pentru ecran negru
    else if ((k === 's' || k === 'S') && !aici) schitaComuta();
    else if (k === 'Escape' && !aici && !dinSala && $('comanda').classList.contains('schita-mare')) schitaSeteaza(false);
    else if (k === 'F5' || k === 'Escape' && !aici && !dinSala) { /* telecomenzile trimit F5 / Esc la „start”: nu reîncărcăm pagina */ }
    else if (k === 'Escape' && aici) { iesiAici(); }
    else oprit = false;
    if (oprit) ev.preventDefault();
  }
  document.addEventListener('keydown', tasta);

  // ---------- randare ----------
  function randeaza() {
    var deschisa = salaDeschisa();
    if (deschisa) trimite(stareEcran());
    if (aici) { var ca = $('aici-cadru'); if (ca) { puneEcran(ca, ECRANE[st.i]); ca.classList.toggle('negru', negru); } }
    var activ = deschisa || aici;
    $('comanda-start').hidden = activ; $('comanda').hidden = !activ;
    if (activ) {
      puneEcran($('cadru-acum'), ECRANE[st.i]); $('cadru-acum').classList.toggle('negru', negru);
      puneEcran($('cadru-urmeaza'), ECRANE[st.i + 1]);
      arataAscunseAici();
      var e = ECRANE[st.i], m = DATA.module[e.modul];
      $('pozitie').textContent = 'ecranul ' + (st.i + 1) + ' din ' + ECRANE.length;
      if ($('live-acum')) $('live-acum').hidden = !e.live;
      if ($('live-urm')) $('live-urm').hidden = !(ECRANE[st.i + 1] && ECRANE[st.i + 1].live);
      $('modul-acum').textContent = m.titlu + (m.start != null ? ' (' + oraDin(m.start) + '–' + oraDin(m.sfarsit) + ')' : '');
      var note = e.note.length ? e.note : [];
      if (!note.length) for (var j = st.i - 1; j >= 0 && ECRANE[j].modul === e.modul; j--) if (ECRANE[j].note.length) { note = ECRANE[j].note; break; }
      $('note').innerHTML = note.join(''); hidrateaza($('note'));
      $('alternative').innerHTML = m.alternative || '';
      $('btn-negru').setAttribute('aria-pressed', negru);
      $('btn-sala').textContent = deschisa ? 'Ecranul din sală: deschis' : 'Deschide ecranul din sală';
      var bp = document.querySelectorAll('#banda [data-i]');
      for (var bk = 0; bk < bp.length; bk++) { var ea = +bp[bk].getAttribute('data-i') === st.i; bp[bk].classList.toggle('acum', ea); bp[bk].classList.toggle('trecut', +bp[bk].getAttribute('data-i') < st.i); if (ea) bp[bk].setAttribute('aria-current', 'step'); else bp[bk].removeAttribute('aria-current'); }
      var li = document.querySelectorAll('#schita-mica li[data-modul]');
      for (var q = 0; q < li.length; q++) li[q].classList.toggle('acum', +li[q].getAttribute('data-modul') === e.modul);
      // Derulăm doar lista schiței, nu toată pagina.
      var acum = document.querySelector('#schita-mica li.acum'), cutie = $('schita-mica');
      if (acum && !$('comanda').classList.contains('schita-mare')) cutie.scrollTop = Math.max(0, acum.offsetTop - cutie.offsetTop - 40);
    }
    bate();
  }
  function arataCron(d, text, gata) {
    var l = d.querySelectorAll('[data-cron]');
    for (var u = 0; u < l.length; u++) { l[u].textContent = text; l[u].classList.toggle('gata', gata); }
  }
  function bate() {
    var d = new Date();
    $('ceas').textContent = d.getHours() + ':' + pad(d.getMinutes());
    var mi = modulCurent(), m = mi != null ? DATA.module[mi] : null, intrare = mi != null ? st.intrari[mi] : null;
    $('ramas').textContent = m && intrare ? mmss(intrare + m.durata * 60000 - Date.now()) : '–';
    var a = abatere();
    $('abatere').textContent = !a ? '–' : (a.min === 0 ? 'la timp' : (a.min > 0 ? '+' : '−') + Math.abs(a.min) + ' min') + (a.repetitie ? ' (repetiție)' : '');
    var r = cronRamas(), text = cron.total ? mmss(r) : '–', gata = cron.total && r <= 0;
    if (gata && cron.pornit) { cron.ramas = 0; cron.pornit = null; }
    $('cron').textContent = text + (cron.total ? (cron.pornit ? ' ▶' : (gata ? ' gata' : ' pauză')) : '');
    arataCron(document, text, !!gata);
    if (salaDeschisa()) trimite({ tip: 'cron', text: text, gata: !!gata });
  }
  var ultimulMesaj = 0;
  function mesaj(t, important) { $('mesaj').textContent = t; $('mesaj-start').textContent = important ? t : ''; ultimulMesaj = Date.now(); }

  // ---------- fereastra sălii (în ea însăși) ----------
  function modSala() {
    document.title = 'Ecranul din sală · ' + DATA.curs.titlu;
    document.body.className = 'sala';
    document.body.innerHTML = '<div class="cadru cadru-plin" id="sala-cadru"></div>' +
      '<p class="sala-ajutor" id="sala-ajutor">Trage fereastra pe proiector și apasă F (tot ecranul). Săgețile și telecomanda merg și aici.</p>';
    var cadru = $('sala-cadru'), cronText = null, cronGata = false;
    var catreComanda = function (m) { if (window.opener && !window.opener.closed) try { window.opener.postMessage(m, '*'); } catch (e) { /* nimic */ } };
    window.addEventListener('message', function (ev) {
      if (ev.source !== window.opener || !ev.data) return;
      var m = ev.data;
      if (m.tip === 'salut') catreComanda({ tip: 'gata' });
      else if (m.tip === 'ecran') { puneEcran(cadru, DUPA_ID[m.id] || BIB_ID[m.id]); cadru.classList.toggle('negru', !!m.negru); if (cronText != null) arataCron(document, cronText, cronGata); }
      else if (m.tip === 'cron') { cronText = m.text; cronGata = m.gata; arataCron(document, m.text, m.gata); }
    });
    document.addEventListener('keydown', function (ev) {
      if (ev.metaKey || ev.ctrlKey || ev.altKey) return;
      var a = $('sala-ajutor'); if (a) a.hidden = true;
      if (ev.key === 'f' || ev.key === 'F') { totEcranul(document.documentElement); ev.preventDefault(); return; }
      if (ev.key === 'Escape') return; // ieșirea din tot ecranul o face browserul
      ev.preventDefault(); // nici Spațiu, nici F5 nu fac nimic aici: tasta merge la ecranul de comandă
      catreComanda({ tip: 'tasta', key: ev.key });
    });
    document.addEventListener('dblclick', function () { totEcranul(document.documentElement); });
    window.addEventListener('resize', function () { potriveste(cadru); });
    setTimeout(function () { var a = $('sala-ajutor'); if (a) a.hidden = true; }, 8000);
    puneEcran(cadru, null); // negru până vine primul mesaj
    cadru.classList.add('negru');
    catreComanda({ tip: 'gata' });
  }

  // ---------- vederi ----------
  function arata(v) {
    vedere = v;
    schitaSeteaza(false);
    var s = document.querySelectorAll('main > section');
    for (var k = 0; k < s.length; k++) s[k].hidden = s[k].id !== v;
    var b = document.querySelectorAll('[data-vedere]');
    for (var j = 0; j < b.length; j++) if (b[j].getAttribute('data-vedere') === v) b[j].setAttribute('aria-current', 'page'); else b[j].removeAttribute('aria-current');
    if (v === 'prezinta') randeaza();
    if (v === 'ecrane' && typeof randeazaGrila === 'function') randeazaGrila();
    marcheazaAcum();
  }
  // Biblioteca de piese: căutare + filtre-chip. În același grup chipurile se adună (perechi SAU grup); între grupuri se cer toate.
  // Durata e un prag: un singur chip apăsat odată.
  function normal(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function filtreaza() {
    var f = { familie: [], tip: [], format: [], energie: [], durata: [], modul: [], eticheta: [], stare: [] }, l = document.querySelectorAll('.chip[aria-pressed="true"]');
    for (var k = 0; k < l.length; k++) f[l[k].getAttribute('data-filtru')].push(l[k].getAttribute('data-valoare'));
    var c = $('banca-cauta'), q = c ? normal(c.value) : '', cuvinte = q ? q.split(' ') : [];
    var ex = document.querySelectorAll('details.ex'), n = 0;
    for (var j = 0; j < ex.length; j++) {
      // Familia și tipul stau pe același rând de chip-uri, deci se adună între ele (conținut SAU energizant).
      // Format și energie există doar la activități: când sunt cerute, celelalte piese ies din listă.
      var a = ex[j], mod = a.getAttribute('data-module'), text = a.getAttribute('data-cauta'), ok =
        ((!f.familie.length && !f.tip.length) || f.familie.indexOf(a.getAttribute('data-familie')) >= 0 || f.tip.indexOf(a.getAttribute('data-tip')) >= 0) &&
        (!f.format.length || f.format.indexOf(a.getAttribute('data-format')) >= 0) &&
        (!f.energie.length || f.energie.indexOf(a.getAttribute('data-energie')) >= 0) &&
        (!f.durata.length || +a.getAttribute('data-durata') <= +f.durata[0]) &&
        (!f.modul.length || !mod || f.modul.some(function (m) { return (' ' + mod + ' ').indexOf(' ' + m + ' ') >= 0; })) &&
        (!f.stare.length || f.stare.indexOf(a.getAttribute('data-stare')) >= 0) &&
        (!f.eticheta.length || f.eticheta.some(function (t) { return (a.getAttribute('data-etichete') || '').indexOf('|' + t + '|') >= 0; }));
      for (var w = 0; ok && w < cuvinte.length; w++) if (text.indexOf(cuvinte[w]) < 0) ok = false;
      a.hidden = !ok; if (ok) n++;
    }
    var g = document.querySelectorAll('.banca-grup');
    for (var gi = 0; gi < g.length; gi++) { var v = g[gi].querySelectorAll('details.ex:not([hidden])').length; g[gi].hidden = !v; g[gi].querySelector('.banca-grup-nr').textContent = v; }
    var activ = !!(l.length || q);
    var nr = $('banca-numar'); if (nr) nr.textContent = activ ? n + ' din ' + ex.length + ' piese' : ex.length + (ex.length === 1 ? ' piesă' : ' piese');
    if ($('banca-gol')) $('banca-gol').hidden = n > 0;
    if ($('banca-sterge')) $('banca-sterge').hidden = !activ;
  }
  function stergeFiltrele() {
    var l = document.querySelectorAll('.chip[aria-pressed="true"]'); for (var k = 0; k < l.length; k++) l[k].setAttribute('aria-pressed', 'false');
    if ($('banca-cauta')) $('banca-cauta').value = '';
    filtreaza();
  }
  // Deschide un exercițiu din bancă (din Modul sau din ecranul de comandă). Dacă filtrele îl ascund, le șterge.
  function deschideExercitiu(id) {
    arata('banca');
    var t = document.getElementById(id); if (!t) return;
    if (t.hidden) stergeFiltrele();
    t.open = true; t.scrollIntoView({ block: 'start' });
    var s = t.querySelector('summary'); if (s) s.focus({ preventScroll: true });
  }
  // În ziua ediției, Ziua și Schița arată modulul de acum.
  function marcheazaAcum() {
    var min = null; if (DATA.editie.data === azi()) { var d = new Date(); min = d.getHours() * 60 + d.getMinutes(); }
    var l = document.querySelectorAll('#ziua tr[data-modul], #schita li[data-modul]');
    for (var k = 0; k < l.length; k++) { var m = DATA.module[+l[k].getAttribute('data-modul')]; l[k].classList.toggle('acum', min != null && m.start != null && min >= m.start && min < m.sfarsit); }
  }

  if (MOD_SALA) { modSala(); return; }

  // ---------- ordinea și ascunderea ecranelor (vederea Ecrane, 1.10, Alex 2026-11-17) ----------
  // Starea locală: { ordine: [toate id-urile], ascunse: [id-uri], live: [{ piesa, dupa }] }, în localStorage (slug + data ediției).
  // Fără ea: ordinea ediției. `live` = piesele puse din Bibliotecă în timpul zilei (1.12), fiecare după ecranul pe care erai.
  var CHEIE_EC = CHEIE + ':ecrane';
  var EDITIE_EC = { ordine: TOATE.map(function (x) { return x.id; }), ascunse: TOATE.filter(function (x) { return x.ascuns; }).map(function (x) { return x.id; }), live: [] };
  var RANDURI_AGENDA = DATA.module.length; // rândurile de după acestea în DATA.module sunt piese adăugate live
  // Ecranele unei piese adăugate live: copii ale ecranelor din Bibliotecă, legate de un rând nou (ora: necunoscută; durata: a piesei).
  function puneLive(intrare) {
    var b = BIB[intrare.piesa]; if (!b) return [];
    var ri = DATA.module.length;
    DATA.module.push({ id: intrare.piesa, titlu: b.titlu, tip: b.tip, durata: b.durata, start: null, sfarsit: null, live: true, alternative: '' });
    return b.ecrane.map(function (x) {
      var y = {}; for (var k in x) y[k] = x[k];
      y.modul = ri; y.live = intrare; DUPA_ID[y.id] = y; return y;
    });
  }
  var ec = citesteEc();
  function citesteEc() {
    try {
      var v = JSON.parse(localStorage.getItem(CHEIE_EC));
      if (!v || !Array.isArray(v.ordine) || !Array.isArray(v.ascunse)) return null;
      var live = (Array.isArray(v.live) ? v.live : []).filter(function (x) { return x && BIB[x.piesa]; });
      live.forEach(function (x) {
        var ids = puneLive(x).map(function (y) { return y.id; });
        // dacă ordinea salvată nu le are (n-ar trebui), le punem după ecranul din „dupa”
        if (ids.length && v.ordine.indexOf(ids[0]) < 0) { var k = v.ordine.indexOf(x.dupa); v.ordine.splice.apply(v.ordine, [k + 1, 0].concat(ids)); }
      });
      // Ecranele care nu mai există dispar; cele noi (o piesă adăugată între timp) intră după vecinul lor din ordinea ediției.
      var ord = [], vazut = {};
      v.ordine.forEach(function (id) { if (DUPA_ID[id] && !vazut[id]) { vazut[id] = 1; ord.push(id); } });
      EDITIE_EC.ordine.forEach(function (id, k) {
        if (vazut[id]) return;
        var inainte = k > 0 ? ord.indexOf(EDITIE_EC.ordine[k - 1]) : -1;
        ord.splice(inainte + 1, 0, id); vazut[id] = 1;
      });
      return { ordine: ord, ascunse: v.ascunse.filter(function (id) { return DUPA_ID[id]; }), live: live };
    } catch (e) { return null; }
  }
  function stareEc() { return ec || EDITIE_EC; }
  function aplicaOrdinea() {
    var s = stareEc(), asc = {};
    s.ascunse.forEach(function (id) { asc[id] = 1; });
    var noi = s.ordine.filter(function (id) { return !asc[id]; }).map(function (id) { return DUPA_ID[id]; });
    if (!noi.length) noi = [DUPA_ID[s.ordine[0]]];
    // Rămânem pe același ecran; dacă tocmai a fost ascuns, pe primul vizibil de după el.
    var curent = st.id || (ECRANE[st.i] && ECRANE[st.i].id), i = -1;
    if (curent) {
      i = noi.indexOf(DUPA_ID[curent]);
      if (i < 0) { var poz = s.ordine.indexOf(curent); for (var k = poz + 1; k < s.ordine.length && i < 0; k++) if (!asc[s.ordine[k]]) i = noi.indexOf(DUPA_ID[s.ordine[k]]); }
    }
    ECRANE = noi;
    st.i = Math.max(0, Math.min(noi.length - 1, i < 0 ? st.i : i));
    st.id = ECRANE[st.i].id;
  }
  function seteazaEc(ordine, ascunse, live) {
    ec = { ordine: ordine, ascunse: ascunse, live: live || (stareEc().live || []).slice() };
    try { localStorage.setItem(CHEIE_EC, JSON.stringify(ec)); } catch (e) { /* fără stocare: ține până la închiderea paginii */ }
    dupaSchimbare();
  }
  function dupaSchimbare() {
    var inainte = st.id;
    aplicaOrdinea(); salveaza(); construiesteBanda(); randeazaGrila(); arataTotaluri();
    if (st.id !== inainte) mergiLa(st.i); else randeaza();
  }
  function ascunsComuta(id) {
    var s = stareEc(), asc = s.ascunse.slice(), k = asc.indexOf(id);
    if (k >= 0) asc.splice(k, 1);
    else {
      if (s.ordine.filter(function (x) { return asc.indexOf(x) < 0; }).length <= 1) { mesajEc('Ultimul ecran vizibil nu se poate ascunde.'); return; }
      asc.push(id);
    }
    seteazaEc(s.ordine.slice(), asc);
  }
  function mutaLa(id, poz) {
    var ord = stareEc().ordine.slice(), k = ord.indexOf(id);
    poz = Math.max(0, Math.min(ord.length - 1, poz));
    if (k < 0 || k === poz) return;
    ord.splice(k, 1); ord.splice(poz, 0, id);
    seteazaEc(ord, stareEc().ascunse.slice());
  }
  function reseteazaEc() {
    ec = null;
    try { localStorage.removeItem(CHEIE_EC); } catch (e) { /* nimic */ }
    dupaSchimbare(); mesajEc('Ordinea, ecranele ascunse și piesele adăugate live sunt din nou cele din ediție.');
  }

  // ---------- „Prezintă” din Bibliotecă (1.12, Alex, 2026-11-17) ----------
  // Piesa e deja în prezentare (în agendă sau adăugată live)? Sărim la primul ei ecran. Altfel îi punem ecranele imediat după
  // ecranul de acum și sărim la primul; după ultimul ei ecran, prezentarea continuă de unde a rămas.
  function prezintaPiesa(pid) {
    var gasit = -1;
    for (var k = 0; k < ECRANE.length && gasit < 0; k++) if (ECRANE[k].piesa === pid) gasit = k;
    if (gasit < 0) {
      if (!BIB[pid] || !BIB[pid].ecrane.length) return;
      var s = stareEc(), dupa = (ECRANE[st.i] && ECRANE[st.i].id) || s.ordine[0];
      var intrare = { piesa: pid, dupa: dupa }, noi = puneLive(intrare).map(function (y) { return y.id; });
      var ord = s.ordine.slice(), poz = ord.indexOf(dupa);
      ord.splice.apply(ord, [poz + 1, 0].concat(noi));
      seteazaEc(ord, s.ascunse.slice(), (s.live || []).concat([intrare]));
      for (var j = 0; j < ECRANE.length && gasit < 0; j++) if (ECRANE[j].id === noi[0]) gasit = j;
    }
    arata('prezinta');
    mergiLa(gasit);
    if (!salaDeschisa() && !aici) mesaj('„' + (BIB[pid] ? BIB[pid].titlu : pid) + '” e pregătită ca ecranul următor de prezentat. Deschide ecranul din sală sau alege „Prezintă aici”.', true);
  }
  function scoateLive(intrare) {
    var s = stareEc(), live = (s.live || []).filter(function (x) { return x !== intrare && !(x.piesa === intrare.piesa && x.dupa === intrare.dupa); });
    var ale = {}; Object.keys(DUPA_ID).forEach(function (id) { var x = DUPA_ID[id]; if (x.live && x.live.piesa === intrare.piesa && x.live.dupa === intrare.dupa) ale[id] = 1; });
    // Dacă erai pe un ecran al piesei scoase, rămâi pe ecranul după care fusese pusă.
    if (ale[st.id]) st.id = intrare.dupa;
    seteazaEc(s.ordine.filter(function (id) { return !ale[id]; }), s.ascunse.filter(function (id) { return !ale[id]; }), live);
  }
  // Totalul zilei, cu piesele adăugate live (Ziua și Schița): același text ca la build, plus minutele adăugate.
  function arataTotaluri() {
    var T = DATA.total; if (!T) return;
    var live = (stareEc().live || []).filter(function (x) { return BIB[x.piesa]; });
    var min = live.reduce(function (a, x) { return a + BIB[x.piesa].durata; }, 0);
    var l = document.querySelectorAll('.total-zi');
    if (!min) { for (var u = 0; u < l.length; u++) { if (l[u]._original != null) { l[u].innerHTML = l[u]._original; l[u].className = l[u]._clasa; } } return; }
    var ag = T.agenda + min, sf = T.sfarsit + min, ramas = T.ziSfarsit != null ? T.ziSfarsit - sf : null;
    var timp = function (m) { var a = Math.abs(m); return a >= 60 ? Math.floor(a / 60) + ' h' + (a % 60 ? ' ' + (a % 60) + ' min' : '') : a + ' min'; };
    var stare = ramas == null ? '' : ramas > 0 ? ' · rămân <b>' + timp(ramas) + '</b> până la ' + oraDin(T.ziSfarsit) : ramas === 0 ? ' · ziua e plină exact' : ' · <b>depășire ' + timp(ramas) + '</b>';
    var html = '<b>Total: ' + timp(ag) + '</b>' + (T.zi != null ? ' din ' + timp(T.zi) + ' (' + T.durataZi + ')' : '') + stare + '. Se termină la ' + oraDin(sf) + '.' +
      ' <span class="live-semn">din care ' + timp(min) + ' adăugate live: ' + live.map(function (x) { return BIB[x.piesa].titlu.replace(/</g, '&lt;'); }).join(', ') + '</span>';
    for (var k = 0; k < l.length; k++) {
      if (l[k]._original == null) { l[k]._original = l[k].innerHTML; l[k]._clasa = l[k].className; }
      l[k].innerHTML = html;
      l[k].className = 'total-zi live ' + (ramas == null || ramas > 0 ? 'ramas' : ramas === 0 ? 'plin' : 'depasire');
    }
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-prezinta]') : null; if (!b) return;
    ev.preventDefault(); ev.stopPropagation(); // nu deschide/închide rândul din Bibliotecă
    prezintaPiesa(b.getAttribute('data-prezinta'));
  }, true);
  if ($('btn-scoate-live')) $('btn-scoate-live').addEventListener('click', function () { var x = ECRANE[st.i]; if (x && x.live) scoateLive(x.live); this.blur(); });
  // Blocul YAML pentru ediție: doar mutările (față de ordinea firească a agendei) și ecranele ascunse.
  // Mutările minime: ecranele care nu fac parte din cel mai lung șir păstrat în ordinea firească.
  function yamlEditie() {
    var s0 = stareEc(), fara = function (id) { return !DUPA_ID[id].live; };
    var s = { ordine: s0.ordine.filter(fara), ascunse: s0.ascunse.filter(fara), live: s0.live || [] }, nat = s.ordine.map(function (id) { return DUPA_ID[id].nat; });
    var lung = [], prev = [], capete = [];
    for (var i = 0; i < nat.length; i++) {
      var lo = 0, hi = capete.length;
      while (lo < hi) { var mij = (lo + hi) >> 1; if (nat[capete[mij]] < nat[i]) lo = mij + 1; else hi = mij; }
      prev[i] = lo > 0 ? capete[lo - 1] : -1; capete[lo] = i; lung[i] = lo + 1;
    }
    var pastrat = {}, j = capete.length ? capete[capete.length - 1] : -1;
    while (j >= 0) { pastrat[j] = 1; j = prev[j]; }
    var muta = [];
    for (var m = 0; m < s.ordine.length; m++) if (!pastrat[m]) muta.push(m === 0 ? s.ordine[m] + ' la început' : s.ordine[m] + ' după ' + s.ordine[m - 1]);
    var asc = s.ordine.filter(function (id) { return s.ascunse.indexOf(id) >= 0; });
    var q = function (x) { return '"' + x.replace(/"/g, '\\"') + '"'; };
    var ecrane = (!muta.length && !asc.length) ? '' : 'ecrane:\n' +
      (muta.length ? '  muta:\n' + muta.map(function (x) { return '    - ' + q(x) + '\n'; }).join('') : '') +
      (asc.length ? '  ascunse:\n' + asc.map(function (x) { return '    - ' + q(x) + '\n'; }).join('') : '');
    var agenda = agendaCuLive(s0);
    if (!ecrane && !agenda) return '# Ordinea din curs, nimic ascuns, nimic adăugat: în ediție nu trebuie scris nimic (sau șterge blocul „ecrane:”).\n';
    return ecrane + agenda;
  }
  // Piesele adăugate live devin rânduri de agendă (piese singure), după rândul în care erai când le-ai pus.
  // Se dă toată agenda, gata de lipit în locul blocului „agenda:” din ediție.
  function agendaCuLive(s) {
    var live = (s.live || []).filter(function (x) { return BIB[x.piesa]; });
    if (!live.length || !DATA.agendaYaml) return '';
    var rand = function (intrare) { // rândul din agendă după care stă intrarea (urmând lanțul dacă „dupa” e tot un ecran live)
      var x = DUPA_ID[intrare.dupa], pas = 0;
      while (x && x.live && pas++ < 50) x = DUPA_ID[x.live.dupa];
      return x && x.modul < RANDURI_AGENDA ? x.modul : RANDURI_AGENDA - 1;
    };
    var primul = function (intrare) { for (var k = 0; k < s.ordine.length; k++) { var y = DUPA_ID[s.ordine[k]]; if (y.live && y.live.piesa === intrare.piesa && y.live.dupa === intrare.dupa) return k; } return 1e9; };
    var linii = ['# Piesele adăugate live, ca rânduri în agendă. Înlocuiește tot blocul „agenda:” din ediție cu cel de mai jos.', 'agenda:'];
    for (var r = 0; r < RANDURI_AGENDA; r++) {
      linii.push('  ' + DATA.agendaYaml[r]);
      live.filter(function (x) { return rand(x) === r; }).sort(function (a, b) { return primul(a) - primul(b); }).forEach(function (x) {
        linii.push('  - ' + x.piesa + '   # adăugată live (în sală: după ' + x.dupa.replace(/~live/, '') + ')');
      });
    }
    return linii.join('\n') + '\n';
  }
  function copiazaPentruEditie() {
    var t = $('ec-yaml'), text = yamlEditie();
    t.value = text; $('ec-yaml-cutie').hidden = false;
    var ok = function () { mesajEc('Copiat. Lipește-l în editii/' + (DATA.editie.data || '<data>') + '.yml, în locul blocului „ecrane:” (dacă există), apoi rulează build-ul.'); };
    var rezerva = function () {
      t.focus(); t.select();
      var reusit = false; try { reusit = document.execCommand('copy'); } catch (e) { /* nimic */ }
      if (reusit) ok(); else mesajEc('Nu pot copia singur: textul e selectat mai jos, apasă Cmd+C.');
    };
    try { if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok, rezerva); else rezerva(); } catch (e) { rezerva(); }
  }
  function mesajEc(t) { var m = $('ec-mesaj'); if (m) m.textContent = t; }

  // Grila: o carte pe ecran, în ordinea de prezentare; cele ascunse rămân, estompate.
  var CARTI = {};
  function carte(x) {
    if (CARTI[x.id]) return CARTI[x.id];
    var m = DATA.module[x.modul], li = document.createElement('li');
    li.className = 'ec-carte'; li.setAttribute('data-id', x.id); li.tabIndex = 0;
    li.innerHTML = '<span class="ec-maner" aria-hidden="true" title="Trage ca să muți">⠿</span>' +
      '<div class="cadru ec-mini">' + ecranHtml(x).replace(' data-cron>', '>') + '</div>' + // miniatura arată durata, nu cronometrul viu
      '<div class="ec-info"><span class="ec-nr"></span><span class="semn-mic fel-' + x.fel + '" aria-hidden="true"></span>' +
      '<span class="ec-sursa">' + (x.sursa || x.eticheta).replace(/</g, '&lt;') + '</span>' +
      (x.live ? '<span class="live-semn">adăugat live</span>' : m && m.start != null ? '<span class="ec-ora">' + oraDin(m.start) + '</span>' : '') + '<code class="ec-id">' + x.id + '</code></div>' +
      '<div class="ec-butoane"><button type="button" data-ec="sus" aria-label="Mută mai devreme">↑</button><button type="button" data-ec="jos" aria-label="Mută mai târziu">↓</button>' +
      (x.live ? '<button type="button" data-ec="scoate" title="Scoate piesa adăugată live">Scoate</button>' : '') +
      '<button type="button" data-ec="ascunde" class="ec-ascunde"></button></div>';
    if (x.live) li.classList.add('live');
    hidrateaza(li);
    CARTI[x.id] = li; return li;
  }
  function randeazaGrila() {
    var g = $('grila-ecrane'); if (!g) return;
    var s = stareEc(), asc = {}, n = 0, mutate = 0;
    s.ascunse.forEach(function (id) { asc[id] = 1; });
    s.ordine.forEach(function (id, k) {
      var li = carte(DUPA_ID[id]), ascuns = !!asc[id];
      g.appendChild(li);
      li.classList.toggle('ascuns', ascuns);
      li.querySelector('.ec-nr').textContent = ascuns ? 'ascuns' : String(++n);
      var b = li.querySelector('.ec-ascunde'); b.textContent = ascuns ? 'Arată' : 'Ascunde'; b.setAttribute('aria-pressed', ascuns ? 'true' : 'false');
      li.setAttribute('aria-label', (ascuns ? 'Ascuns' : 'Ecranul ' + n) + ': ' + DUPA_ID[id].eticheta + ' (' + id + ')');
      if (k > 0 && !DUPA_ID[id].live && !DUPA_ID[s.ordine[k - 1]].live && DUPA_ID[s.ordine[k - 1]].nat > DUPA_ID[id].nat) mutate++;
    });
    var st2 = $('ec-stare');
    var nLive = (s.live || []).length;
    if (st2) st2.textContent = n + ' în prezentare' + (s.ascunse.length ? ' · ' + s.ascunse.length + ' ascunse' : '') + (mutate ? ' · ordine schimbată' : '') + (nLive ? ' · ' + nLive + (nLive === 1 ? ' piesă adăugată' : ' piese adăugate') + ' live' : '') + (ec ? ' · salvat în acest browser' : '');
    if ($('ec-reset')) $('ec-reset').disabled = !ec;
  }
  var gr = $('grila-ecrane');
  if (gr) {
    gr.addEventListener('click', function (ev) {
      var b = ev.target.closest('button[data-ec]'); if (!b) return;
      var id = b.closest('.ec-carte').getAttribute('data-id'), k = stareEc().ordine.indexOf(id), a = b.getAttribute('data-ec');
      if (a === 'scoate') { scoateLive(DUPA_ID[id].live); return; }
      if (a === 'ascunde') ascunsComuta(id); else mutaLa(id, k + (a === 'sus' ? -1 : 1));
      var nou = CARTI[id].querySelector('button[data-ec="' + a + '"]'); if (nou) nou.focus();
    });
    // Tastatura: pe o carte, Alt + săgeată o mută; H o ascunde sau o arată.
    gr.addEventListener('keydown', function (ev) {
      var li = ev.target.closest && ev.target.classList.contains('ec-carte') ? ev.target : null; if (!li) return;
      var id = li.getAttribute('data-id'), k = stareEc().ordine.indexOf(id);
      if (ev.altKey && (ev.key === 'ArrowLeft' || ev.key === 'ArrowUp')) { ev.preventDefault(); mutaLa(id, k - 1); CARTI[id].focus(); }
      else if (ev.altKey && (ev.key === 'ArrowRight' || ev.key === 'ArrowDown')) { ev.preventDefault(); mutaLa(id, k + 1); CARTI[id].focus(); }
      else if (ev.key === 'h' || ev.key === 'H') { ev.preventDefault(); ascunsComuta(id); CARTI[id].focus(); }
    });
    // Tragerea: cu mouse-ul de oriunde de pe carte, cu degetul de pe mâner (⠿), ca grila să se poată derula pe tabletă.
    var tr = null;
    gr.addEventListener('pointerdown', function (ev) {
      var li = ev.target.closest('.ec-carte'); if (!li || ev.target.closest('button') || ev.button > 0) return;
      if (ev.pointerType !== 'mouse' && !ev.target.closest('.ec-maner')) return;
      tr = { li: li, x: ev.clientX, y: ev.clientY, p: ev.pointerId, activ: false };
      if (ev.pointerType !== 'mouse') ev.preventDefault();
    });
    document.addEventListener('pointermove', function (ev) {
      if (!tr || ev.pointerId !== tr.p) return;
      if (!tr.activ) {
        if (Math.abs(ev.clientX - tr.x) + Math.abs(ev.clientY - tr.y) < 6) return;
        tr.activ = true; tr.li.classList.add('trage'); gr.classList.add('in-mutare');
      }
      ev.preventDefault();
      var sub = document.elementFromPoint(ev.clientX, ev.clientY), tinta = sub && sub.closest ? sub.closest('.ec-carte') : null;
      if (!tinta || tinta === tr.li || tinta.parentNode !== gr) return;
      var r = tinta.getBoundingClientRect(), dupa = ev.clientY > r.bottom - 4 || (ev.clientY >= r.top && ev.clientX > r.left + r.width / 2);
      gr.insertBefore(tr.li, dupa ? tinta.nextSibling : tinta);
    });
    var gata = function (ev) {
      if (!tr || (ev && ev.pointerId !== tr.p)) return;
      var activ = tr.activ; tr.li.classList.remove('trage'); gr.classList.remove('in-mutare'); tr = null;
      if (!activ) return;
      var ord = [].map.call(gr.children, function (li) { return li.getAttribute('data-id'); });
      seteazaEc(ord, stareEc().ascunse.slice());
    };
    document.addEventListener('pointerup', gata);
    document.addEventListener('pointercancel', gata);
    $('ec-copiaza').addEventListener('click', copiazaPentruEditie);
    $('ec-reset').addEventListener('click', reseteazaEc);
  }
  // În ecranul de comandă: ascunde ecranul de acum sau pe cel următor; arată ce e ascuns între ele.
  function arataAscunseAici() {
    var c = $('ascunse-aici'); if (!c) return;
    var s = stareEc(), k = s.ordine.indexOf(st.id), lista = [];
    for (var j = k + 1; j < s.ordine.length && s.ascunse.indexOf(s.ordine[j]) >= 0; j++) lista.push(s.ordine[j]);
    c.innerHTML = lista.length ? (lista.length === 1 ? '1 ecran ascuns urmează aici: ' : lista.length + ' ecrane ascunse urmează aici: ') +
      lista.map(function (id) { return '<button type="button" data-arata="' + id + '">Arată ' + DUPA_ID[id].eticheta.replace(/</g, '&lt;') + '</button>'; }).join(' ') : '';
    if ($('btn-ascunde-urm')) $('btn-ascunde-urm').disabled = !ECRANE[st.i + 1];
  }
  if ($('ascunse-aici')) $('ascunse-aici').addEventListener('click', function (ev) { var b = ev.target.closest('[data-arata]'); if (b) ascunsComuta(b.getAttribute('data-arata')); });
  if ($('btn-ascunde-acum')) $('btn-ascunde-acum').addEventListener('click', function () { ascunsComuta(st.id); this.blur(); });
  if ($('btn-ascunde-urm')) $('btn-ascunde-urm').addEventListener('click', function () { if (ECRANE[st.i + 1]) ascunsComuta(ECRANE[st.i + 1].id); this.blur(); });
  aplicaOrdinea();
  arataTotaluri();

  // ---------- obiectivele zilei: bife locale, în Schiță și în schița ecranului de comandă (niciodată în sală) ----------
  // Cheia: slug + data ediției. Bifele se țin după text, ca o listă reordonată să nu mute bifele pe alt obiectiv.
  var CHEIE_OB = CHEIE + ':obiective';
  function bifeCitite() { try { var v = JSON.parse(localStorage.getItem(CHEIE_OB)); return v && typeof v === 'object' ? v : {}; } catch (e) { return {}; } }
  var bife = bifeCitite();
  function bifeSalvate() { try { localStorage.setItem(CHEIE_OB, JSON.stringify(bife)); } catch (e) { /* fără stocare: bifele țin până la închiderea paginii */ } }
  function bifeArata() {
    var l = document.querySelectorAll('input[data-obiectiv]'), total = {}, bifate = {};
    for (var k = 0; k < l.length; k++) { var tx = l[k].getAttribute('data-text'); l[k].checked = !!bife[tx]; total[tx] = 1; if (bife[tx]) bifate[tx] = 1; }
    var n = Object.keys(total).length, b = Object.keys(bifate).length;
    var c = document.querySelectorAll('[data-obiective-nr]');
    for (var j = 0; j < c.length; j++) c[j].textContent = b + ' din ' + n;
  }
  var bifeInputuri = document.querySelectorAll('input[data-obiectiv]');
  for (var bi = 0; bi < bifeInputuri.length; bi++) bifeInputuri[bi].addEventListener('change', function () {
    var tx = this.getAttribute('data-text'); if (this.checked) bife[tx] = true; else delete bife[tx];
    bifeSalvate(); bifeArata();
    // Focusul pleacă de pe bifă: altfel Spațiul de la telecomandă sau tastatură ar debifa în loc să treacă la ecranul următor.
    this.blur();
  });
  var bifeReset = document.querySelectorAll('[data-obiective-reset]');
  for (var br = 0; br < bifeReset.length; br++) bifeReset[br].addEventListener('click', function () { bife = {}; bifeSalvate(); bifeArata(); });
  bifeArata();

  var butoane = document.querySelectorAll('[data-vedere]');
  for (var b = 0; b < butoane.length; b++) butoane[b].addEventListener('click', function () { arata(this.getAttribute('data-vedere')); try { history.replaceState(null, '', '#' + vedere); } catch (e) { /* file:// în Safari */ } });
  $('deschide-sala').addEventListener('click', deschideSala);
  $('btn-sala').addEventListener('click', deschideSala);
  $('prezinta-aici').addEventListener('click', prezintaAici);
  $('inainte').addEventListener('click', function () { mergiLa(st.i + 1); });
  $('inapoi').addEventListener('click', function () { mergiLa(st.i - 1); });
  $('btn-cron').addEventListener('click', cronComuta);
  $('btn-negru').addEventListener('click', negruComuta);
  $('btn-schita').addEventListener('click', schitaComuta);
  $('btn-reset').addEventListener('click', function () {
    if (!confirm('Repornești ziua? Se șterg orele la care ai intrat în fiecare modul.')) return;
    st = { i: 0, intrari: {}, start: Date.now() }; salveaza(); mergiLa(0);
  });
  // Banda zilei (Ioana, slide-tipuri v1): un semn pe ecran, în ordinea zilei, cu forma și culoarea felului.
  // Arată dintr-o privire ce urmează (teorie, exercițiu, reflecție…). Un click sare la acel ecran.
  function construiesteBanda() {
    var banda = $('banda'); if (!banda) return;
    var html = '';
    for (var k = 0; k < ECRANE.length; k++) {
      var x = ECRANE[k], nou = k > 0 && ECRANE[k - 1].modul !== x.modul;
      html += (nou ? '<span class="banda-sep" aria-hidden="true"></span>' : '') +
        '<button type="button" class="banda-p" data-i="' + k + '" title="' + (k + 1) + ' · ' + x.eticheta.replace(/"/g, '&quot;') + '" aria-label="Ecranul ' + (k + 1) + ': ' + x.eticheta.replace(/"/g, '&quot;') + '"' + (x.live ? ' data-live="1"' : '') + '><span class="semn-mic fel-' + x.fel + '"></span></button>';
    }
    banda.innerHTML = html;
  }
  construiesteBanda();
  if ($('banda')) $('banda').addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-i]') : null; if (!t) return;
    mergiLa(+t.getAttribute('data-i')); t.blur();
  });
  var lista = document.querySelectorAll('#schita-mica li[data-modul]');
  for (var q = 0; q < lista.length; q++) lista[q].addEventListener('click', function () {
    var mi = +this.getAttribute('data-modul');
    for (var k = 0; k < ECRANE.length; k++) if (ECRANE[k].modul === mi) { mergiLa(k); break; }
    schitaSeteaza(false);
  });
  $('inchide-schita').addEventListener('click', function () { schitaSeteaza(false); });
  window.addEventListener('resize', function () { ['cadru-acum', 'cadru-urmeaza', 'aici-cadru'].forEach(function (id) { var c = $(id); if (c) potriveste(c); }); });
  var chipuri = document.querySelectorAll('.chip[data-filtru]');
  for (var fi = 0; fi < chipuri.length; fi++) chipuri[fi].addEventListener('click', function () {
    var pornit = this.getAttribute('aria-pressed') !== 'true';
    if (this.getAttribute('data-filtru') === 'durata') { var d = document.querySelectorAll('.chip[data-filtru="durata"]'); for (var k = 0; k < d.length; k++) d[k].setAttribute('aria-pressed', 'false'); }
    this.setAttribute('aria-pressed', pornit ? 'true' : 'false');
    filtreaza();
  });
  if ($('banca-cauta')) $('banca-cauta').addEventListener('input', filtreaza);
  // Un click pe eticheta de pe rândul unei piese pornește filtrul ei (fără să deschidă sau să închidă rândul).
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('.et-chip') : null; if (!b) return;
    ev.preventDefault(); ev.stopPropagation();
    var chipF = document.querySelector('.chip[data-filtru="eticheta"][data-valoare="' + b.getAttribute('data-eticheta').replace(/["\\]/g, '\\$&') + '"]');
    if (chipF && chipF.getAttribute('aria-pressed') !== 'true') { chipF.setAttribute('aria-pressed', 'true'); filtreaza(); }
    if (chipF) chipF.focus({ preventScroll: true });
  }, true);
  if ($('banca-sterge')) $('banca-sterge').addEventListener('click', stergeFiltrele);
  if ($('banca-gol-sterge')) $('banca-gol-sterge').addEventListener('click', function () { stergeFiltrele(); $('banca-cauta').focus(); });
  filtreaza();
  // Banca din tastatură: „/” caută, Esc golește căutarea, săgețile sus/jos trec de la un exercițiu la altul.
  document.addEventListener('keydown', function (ev) {
    if (vedere !== 'banca' || ev.metaKey || ev.ctrlKey || ev.altKey) return;
    var t = ev.target, cauta = $('banca-cauta'); if (!cauta) return;
    var vizibile = [].slice.call(document.querySelectorAll('details.ex:not([hidden]) > summary'));
    if (ev.key === '/' && t !== cauta && !/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) { ev.preventDefault(); cauta.focus(); cauta.select(); return; }
    if (t === cauta) {
      if (ev.key === 'Escape') { if (cauta.value) { cauta.value = ''; filtreaza(); } else cauta.blur(); ev.preventDefault(); }
      else if ((ev.key === 'ArrowDown' || ev.key === 'Enter') && vizibile.length) { ev.preventDefault(); vizibile[0].focus(); }
      return;
    }
    var i = vizibile.indexOf(t); if (i < 0) return;
    if (ev.key === 'ArrowDown' && i < vizibile.length - 1) { ev.preventDefault(); vizibile[i + 1].focus(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); (i > 0 ? vizibile[i - 1] : cauta).focus(); }
    else if (ev.key === 'Escape' && t.parentNode.open) { ev.preventDefault(); t.parentNode.open = false; }
  });
  // La tipar, exercițiile din bancă apar deschise.
  window.addEventListener('beforeprint', function () { var d = document.querySelectorAll('details.ex'); for (var k = 0; k < d.length; k++) d[k].open = true; });
  // Linkurile spre bancă (din Modul și din ecranul de comandă) deschid vederea Banca la exercițiul ales.
  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('a[data-banca]') : null; if (!a) return;
    ev.preventDefault(); deschideExercitiu(a.getAttribute('href').slice(1));
  });
  // Dacă fereastra sălii s-a închis sau s-a golit, ecranul de comandă o spune.
  var eraDeschisa = false;
  setInterval(function () {
    if (sala && sala.closed) { sala = null; salaGata = false; }
    var d = salaDeschisa();
    if (eraDeschisa && !d) { mesaj('Fereastra sălii s-a închis. Apasă „Deschide ecranul din sală”.', true); randeaza(); }
    eraDeschisa = d;
    if (Date.now() - ultimulMesaj > 6000 && $('mesaj').textContent && d) $('mesaj').textContent = '';
    bate(); marcheazaAcum();
  }, 500);

  // ---------- tipar: #tipar-ecrane = toate ecranele, câte unul pe pagină ----------
  var h = (location.hash || '').slice(1);
  if (h === 'tipar-ecrane') {
    document.body.classList.add('tipar-ecrane');
    var st2 = document.createElement('style'); st2.textContent = '@page { size: 1600px 900px; margin: 0; }'; document.head.appendChild(st2);
    var html = ''; for (var x = 0; x < ECRANE.length; x++) html += ecranHtml(ECRANE[x]).replace(' data-cron>', '>'); // la tipar, cronometrul arată durata (pusă de build)
    $('tipar-ecrane-lista').innerHTML = html; hidrateaza($('tipar-ecrane-lista'));
  } else if (h === 'tipar-trainer') {
    var st3 = document.createElement('style'); st3.textContent = '@page { size: A4; margin: 14mm; }'; document.head.appendChild(st3);
    var sec = document.querySelectorAll('main > section'); for (var y = 0; y < sec.length; y++) sec[y].hidden = sec[y].id === 'prezinta' || sec[y].id === 'ecrane' || sec[y].id === 'masa';
    var dex = document.querySelectorAll('details.ex'); for (var z = 0; z < dex.length; z++) dex[z].open = true;
    hidrateaza(document);
  } else {
    // Masa e panoul de control al cursului (Alex, 2026-11-18): vederea de la deschidere, când cursul o are.
    arata(['masa', 'ziua', 'modul', 'schita', 'banca', 'ecrane', 'prezinta'].indexOf(h) >= 0 && $(h) ? h : $('masa') ? 'masa' : 'ziua');
    hidrateaza(document);
  }
  window.__curs = { stare: function () { return { id: ECRANE[st.i] ? ECRANE[st.i].id : null, ordine: ECRANE.map(function (x) { return x.id; }), i: st.i, negru: negru, salaDeschisa: salaDeschisa(), aici: aici, cron: { total: cron.total, ramas: cronRamas(), pornit: !!cron.pornit }, vedere: vedere }; } };
})();
