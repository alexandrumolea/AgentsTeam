// Materialul trainerului, partea care rulează în browser. Fără internet, fără server, fără biblioteci.
// Modul Prezintă: fereastra sălii este ACELAȘI fișier, deschis cu „#sala”. Cele două ferestre vorbesc prin postMessage,
// care merge și din file:// (unde fiecare fișier are altă origine, deci accesul direct dintr-o fereastră în alta e blocat).
// Ecranul de comandă trimite doar „ce ecran, negru sau nu, cronometrul”; sala trimite înapoi tastele (telecomanda).
(function () {
  'use strict';
  var DATA = JSON.parse(document.getElementById('date-curs').textContent);
  var IMG = JSON.parse(document.getElementById('imagini').textContent);
  var ECRANE = DATA.ecrane;
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
  function ecranHtml(i) {
    var e = ECRANE[i];
    if (!e) return '<div class="ecran ecran-final"><p>Final</p></div>';
    return '<div class="ecran lume-' + e.lume + '"><div class="ecran-continut">' + e.html + '</div>' +
      (e.cronometru ? '<div class="ecran-cronometru" data-cron></div>' : '') + '</div>';
  }
  function puneEcran(cadru, i) {
    if (cadru._i === i && cadru.firstElementChild) { potriveste(cadru); return; }
    cadru.innerHTML = ecranHtml(i) + '<div class="negru-strat"></div>';
    cadru._i = i; hidrateaza(cadru); potriveste(cadru);
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
    var schimbat = i !== st.i || cron.total === 0;
    st.i = i;
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
  function stareEcran() { return { tip: 'ecran', i: st.i, negru: negru }; }
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
    if (aici) { var ca = $('aici-cadru'); if (ca) { puneEcran(ca, st.i); ca.classList.toggle('negru', negru); } }
    var activ = deschisa || aici;
    $('comanda-start').hidden = activ; $('comanda').hidden = !activ;
    if (activ) {
      puneEcran($('cadru-acum'), st.i); $('cadru-acum').classList.toggle('negru', negru);
      puneEcran($('cadru-urmeaza'), st.i + 1);
      var e = ECRANE[st.i], m = DATA.module[e.modul];
      $('pozitie').textContent = 'ecranul ' + (st.i + 1) + ' din ' + ECRANE.length;
      $('modul-acum').textContent = m.titlu + (m.start != null ? ' (' + oraDin(m.start) + '–' + oraDin(m.sfarsit) + ')' : '');
      var note = e.note.length ? e.note : [];
      if (!note.length) for (var j = st.i - 1; j >= 0 && ECRANE[j].modul === e.modul; j--) if (ECRANE[j].note.length) { note = ECRANE[j].note; break; }
      $('note').innerHTML = note.join(''); hidrateaza($('note'));
      $('alternative').innerHTML = m.alternative || '';
      $('btn-negru').setAttribute('aria-pressed', negru);
      $('btn-sala').textContent = deschisa ? 'Ecranul din sală: deschis' : 'Deschide ecranul din sală';
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
      else if (m.tip === 'ecran') { puneEcran(cadru, m.i); cadru.classList.toggle('negru', !!m.negru); if (cronText != null) arataCron(document, cronText, cronGata); }
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
    puneEcran(cadru, -1); // negru până vine primul mesaj
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
    marcheazaAcum();
  }
  // Biblioteca de piese: căutare + filtre-chip. În același grup chipurile se adună (perechi SAU grup); între grupuri se cer toate.
  // Durata e un prag: un singur chip apăsat odată.
  function normal(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim(); }
  function filtreaza() {
    var f = { familie: [], tip: [], format: [], energie: [], durata: [], modul: [], eticheta: [] }, l = document.querySelectorAll('.chip[aria-pressed="true"]');
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
    var html = ''; for (var x = 0; x < ECRANE.length; x++) html += ecranHtml(x).replace(' data-cron>', '>' + (ECRANE[x].cronometru ? ECRANE[x].cronometru + ':00' : ''));
    $('tipar-ecrane-lista').innerHTML = html; hidrateaza($('tipar-ecrane-lista'));
  } else if (h === 'tipar-trainer') {
    var st3 = document.createElement('style'); st3.textContent = '@page { size: A4; margin: 14mm; }'; document.head.appendChild(st3);
    var sec = document.querySelectorAll('main > section'); for (var y = 0; y < sec.length; y++) sec[y].hidden = sec[y].id === 'prezinta';
    var dex = document.querySelectorAll('details.ex'); for (var z = 0; z < dex.length; z++) dex[z].open = true;
    hidrateaza(document);
  } else {
    arata(['ziua', 'modul', 'schita', 'banca', 'prezinta'].indexOf(h) >= 0 ? h : 'ziua');
    hidrateaza(document);
  }
  window.__curs = { stare: function () { return { i: st.i, negru: negru, salaDeschisa: salaDeschisa(), aici: aici, cron: { total: cron.total, ramas: cronRamas(), pornit: !!cron.pornit }, vedere: vedere }; } };
})();
