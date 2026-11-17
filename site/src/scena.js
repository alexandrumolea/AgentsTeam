// Scena atelierului: „1 · Sticlă colorată” (Ioana, design v3.1, D-054).
// Fundalul e CSS (gradientul Sora); canvasul WebGL e transparent deasupra lui. Etichetele sunt HTML.
// Nimic simulat: drumurile, panourile și Live vin din datele generate la build (content/ + docs/taskuri.md + git).
const D = JSON.parse(document.getElementById('data').textContent);
const qs = new URLSearchParams(location.search);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);
const $ = s => document.querySelector(s);
const body = document.body;
body.classList.remove('no-js');
let selected = -1, open = false, hint = -1;

const INTENTS = D.categorii;
const IDX = Object.fromEntries(INTENTS.map((it, i) => [it.k, i]));
const KIND = Object.fromEntries(D.echipa.map(n => [n.slug, n.tip]));
// Culorile vin din content/tema.yml, prin build: COL = rolurile site-ului (COL.bg), SC = luminile și materialele 3D (SC['obj-live']).
const COL = D.culori, SC = D.scena;
const sr = $('#sr');

/* ---------- pauza actualizărilor din Live (WCAG 2.2.2) ---------- */
let paused = reduce, hold = 0;
function syncPause(){
  document.querySelectorAll('[data-pause]').forEach(b => { b.setAttribute('aria-pressed', String(paused)); b.textContent = paused ? 'Pornește' : 'Pauză'; });
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pause]'); if (!b) return; paused = !paused; syncPause(); sr.textContent = paused ? 'Actualizările sunt oprite.' : 'Actualizările au pornit.'; });
function holdOn(el){
  if (!el) return;
  const on = () => { hold++; }, off = () => { hold = Math.max(0, hold - 1); };
  el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off);
  el.addEventListener('focusin', on); el.addEventListener('focusout', off);
}

/* ---------- impulsuri în Live: reluarea ultimelor taskuri reale dintre agenți ---------- */
let replay = null;
function startReplay(){
  stopReplay();
  if (reduce || !D.puls.length) return;
  let k = 0;
  replay = setInterval(() => {
    if (paused || hold > 0 || document.hidden) return;
    if (k >= D.puls.length){ stopReplay(); return; }
    const p = D.puls[k++];
    if (window.__pulse) window.__pulse(p.de_la, p.pentru);
    const li = document.querySelector(`#feed li[data-ev="${CSS.escape(p.id)}"]`);
    if (li){ document.querySelectorAll('#feed li.hot').forEach(x => x.classList.remove('hot')); li.classList.add('hot', 'flash'); setTimeout(() => li.classList.remove('flash'), 1300); }
  }, 1700);
}
function stopReplay(){ if (replay){ clearInterval(replay); replay = null; } document.querySelectorAll('#feed li.hot').forEach(x => x.classList.remove('hot')); }

/* ---------- legenda: drumurile, legate de obiecte ---------- */
// Fără JavaScript sunt linkuri spre pagini. Cu JavaScript deschid panoul drumului, în coloana din stânga.
const roads = $('#roads');
const roadLinks = [...document.querySelectorAll('#roads a[data-k]')];
const roadOf = k => roadLinks.find(a => a.dataset.k === k);
roadLinks.forEach(a => {
  const i = IDX[a.dataset.k];
  a.setAttribute('role', 'button'); a.setAttribute('aria-pressed', 'false'); a.setAttribute('aria-controls', 'panel');
  a.addEventListener('click', e => { e.preventDefault(); select(i); });
  a.addEventListener('keydown', e => { if (e.key === ' '){ e.preventDefault(); select(i); } });
  a.addEventListener('pointerenter', () => setHint(i)); a.addEventListener('pointerleave', () => setHint(-1));
  a.addEventListener('focus', () => setHint(i)); a.addEventListener('blur', () => setHint(-1));
});
function setHint(i){
  hint = i;
  roadLinks.forEach(a => a.classList.toggle('hi', IDX[a.dataset.k] === i));
}
const more = $('#more');
if (more) more.addEventListener('click', () => {
  roads.classList.add('all'); more.setAttribute('aria-expanded', 'true');
  const first = $('#g2 a'); if (first) first.focus({ preventScroll: true });
});

/* ---------- panouri ---------- */
const panel = $('#panel'), pBody = $('#pBody');
function renderPanel(it){
  const tpl = document.getElementById('tpl-' + it.k);
  pBody.replaceChildren(tpl.content.cloneNode(true));
  panel.classList.toggle('paper', it.k === 'povesti');
  panel.scrollTop = 0;
  if (it.k === 'live'){ syncPause(); holdOn($('#feedWrap')); }
}
pBody.addEventListener('click', e => { const a = e.target.closest('[data-go]'); if (!a || IDX[a.dataset.go] === undefined) return; e.preventDefault(); select(IDX[a.dataset.go]); $('#px').focus({ preventScroll: true }); });
function setModes(k){
  body.classList.toggle('live', k === 'live');
  body.classList.toggle('warm', k === 'povesti');
  body.classList.toggle('know', k === 'knowledge');
  if (k === 'live') setTimeout(startReplay, reduce ? 0 : 1300); else stopReplay();
}
function select(i){
  if (i === undefined) return;
  if (open) setOpen(false);
  if (selected === i){ closePanel(); return; }
  selected = i; const it = INTENTS[i];
  roadLinks.forEach(a => a.setAttribute('aria-pressed', String(a.dataset.k === it.k)));
  renderPanel(it); setModes(it.k);
  body.classList.add('sheet');
  sr.textContent = `Deschis: ${it.label}.`;
  if (window.__focusRing) window.__focusRing(i);
  if (window.__bridge) window.__bridge(i);
}
function closePanel(){
  if (selected < 0) return;
  const back = panel.contains(document.activeElement) || !body.contains(document.activeElement) ? roadOf(INTENTS[selected].k) : null;
  body.classList.remove('sheet'); setModes('');
  selected = -1; roadLinks.forEach(a => a.setAttribute('aria-pressed', 'false'));
  if (back && back.offsetParent) back.focus({ preventScroll: true });
}
$('#px').addEventListener('click', closePanel);
const about = $('#about');
if (about && IDX.despre !== undefined) about.addEventListener('click', e => { e.preventDefault(); if (selected !== IDX.despre) select(IDX.despre); $('#px').focus({ preventScroll: true }); });
const liveLink = $('#liveLink');
if (liveLink) liveLink.addEventListener('click', e => { e.preventDefault(); if (selected !== IDX.live) select(IDX.live); $('#px').focus({ preventScroll: true }); });
addEventListener('keydown', e => { if (e.key === 'Escape'){ closePanel(); setOpen(false); } });

const explodeBtn = $('#explode'), collapseBtn = $('#collapse');
function setOpen(v){
  if (!explodeBtn || open === v) return;
  open = v; body.classList.toggle('open', v);
  if (window.__layout) window.__layout();
  explodeBtn.setAttribute('aria-expanded', String(v));
  if (v){ closePanel(); collapseBtn.focus({ preventScroll: true }); }
  else if (body.contains(document.activeElement) === false || document.activeElement === collapseBtn) explodeBtn.focus({ preventScroll: true });
}
if (explodeBtn){
  explodeBtn.addEventListener('click', () => setOpen(true));
  collapseBtn.addEventListener('click', () => setOpen(false));
  explodeBtn.addEventListener('pointerenter', () => explodeBtn.classList.add('hi'));
  explodeBtn.addEventListener('pointerleave', () => explodeBtn.classList.remove('hi'));
}
syncPause();

/* ---------- scena 3D (îmbunătățire progresivă) ---------- */
function noGL(why){ if (why) console.info('Rămâne varianta fără 3D:', why); body.classList.add('nogl'); }
const probe = document.createElement('canvas');
const hasGL = !!(window.WebGL2RenderingContext && probe.getContext('webgl2'));
if (qs.has('nogl')) noGL('cerută din adresă');
else if (saveData) noGL('Economisire date activă');
else if (!hasGL) noGL('WebGL2 indisponibil');
else {
  try {
    const THREE = await import('three');
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    start(THREE, RoomEnvironment);
  } catch (err) { noGL(err && err.message); }
}

function start(THREE, RoomEnvironment){
  const canvas = $('#gl');
  const low = coarse && ((navigator.deviceMemory || 4) <= 4 || (navigator.hardwareConcurrency || 8) <= 4);
  // canvas transparent: fundalul e gradientul CSS de dedesubt
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, alpha: true, powerPreference: 'high-performance' });
  renderer.setClearColor(0x000000, 0);
  let dpr = Math.min(devicePixelRatio, low ? 1 : coarse ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.NoToneMapping; // ACES spală culorile pastel spre alb

  renderer.outputColorSpace = THREE.SRGBColorSpace;
  window.__perf = { dpr, low, avgMs: 0 };
  const seg = n => coarse ? Math.max(8, Math.round(n * 0.5)) : n;
  const V3 = THREE.Vector3;
  const col = c => new THREE.Color(c);

  const BG = col(COL.bg), WARM = col(SC['bg-warm']);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(BG.clone(), 16, 34); // obiectele din spate se topesc ușor în fundal
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 80);
  const world = new THREE.Group(); scene.add(world);
  const hemi = new THREE.HemisphereLight(SC.sky, SC.ground, 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight(SC.key, 0.95); key.position.set(-5, 6, 5); scene.add(key); // lumina vine dintr-o parte
  const glow = new THREE.PointLight(SC.glow, 1.2, 9, 2); glow.position.set(0, 0.8, 0.6); world.add(glow);
  const C = { hemi: col(SC.sky), hemiW: col(SC['sky-warm']), key: col(SC.key), keyW: col(SC['key-warm']),
              glow: col(SC.glow), glowW: col(SC['glow-warm']), pod: col(SC.bridge), podW: col(SC['bridge-warm']) };

  /* --- materialele: sticlă colorată. Fiecare obiect are gradientul lui (culori pe vârfuri) --- */
  // gradientul merge pe diagonală, ca în mostră: sus-stânga → jos-dreapta. Pe un disc culcat, „jos” pe ecran e „în față” (z).
  const DIAG = new V3(1, -1.1, 0.9).normalize();
  // k: cât de repede trece în a doua culoare (0,6: a doua acoperă ceva mai mult de jumătate; 1,6: a doua doar în colțul din dreapta jos)
  const paint = (geo, pair, k = 0.6) => {
    const a = col(pair[0]), b = col(pair[1]), c = new THREE.Color(), p = new V3();
    const pos = geo.attributes.position, d = new Float32Array(pos.count);
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < pos.count; i++){ d[i] = p.fromBufferAttribute(pos, i).dot(DIAG); lo = Math.min(lo, d[i]); hi = Math.max(hi, d[i]); }
    const out = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++){
      const t = Math.pow((d[i] - lo) / ((hi - lo) || 1), k);
      c.copy(a).lerp(b, t); out[i * 3] = c.r; out[i * 3 + 1] = c.g; out[i * 3 + 2] = c.b;
    }
    geo.setAttribute('color', new THREE.BufferAttribute(out, 3));
    return geo;
  };
  // conturul alb vine dintr-o margine luminoasă (fresnel), cu intensitatea în userData.rim: crește la hover
  const candy = ({ matte = false, flat = false } = {}) => {
    const opts = { vertexColors: true, roughness: matte ? 0.8 : 0.22, metalness: 0, envMapIntensity: matte ? 0.15 : 0.22, flatShading: flat };
    const m = coarse || matte ? new THREE.MeshStandardMaterial(opts) : new THREE.MeshPhysicalMaterial({ ...opts, clearcoat: 0.35, clearcoatRoughness: 0.18 });
    const rim = { value: matte ? 0.25 : 0.55 };
    m.userData.rim = rim; m.userData.rim0 = rim.value;
    m.onBeforeCompile = sh => {
      sh.uniforms.uRim = rim;
      sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nuniform float uRim;')
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n{ float fr = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition))); totalEmissiveRadiance += vec3(pow(fr, 6.0) * uRim) + vColor.rgb * 0.32; }'); // contur alb fin + puțină lumină proprie, în culoarea obiectului (saturată, nu albă)
    };
    m.customProgramCacheKey = () => 'candy' + (matte ? 'm' : '') + (coarse ? 'c' : '');
    return m;
  };
  const edgeMat = new THREE.LineBasicMaterial({ color: SC.edge, transparent: true, opacity: 0.9, depthWrite: false });
  const withEdges = mesh => { mesh.add(new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), edgeMat)); return mesh; };
  const obj = (geo, pair, o = {}) => new THREE.Mesh(paint(geo, pair, o.k), candy(o));
  // un disc (cilindru jos) cu muchiile desenate: cercul de sus și de jos, ca în planșă
  const disc = (r, h, pr, n = 64) => withEdges(obj(new THREE.CylinderGeometry(r, r, h, seg(n)), pr));
  // linia stinsă din mostră (umbra desenată, baza cupolei, cercul din nucleu): un cerc subțire, în culoarea orbitelor
  const faintMat = new THREE.LineBasicMaterial({ color: SC.orbit, transparent: true, opacity: 0.3, depthWrite: false });
  const faint = (r, y = 0) => {
    const pts = []; for (let k = 0; k < 64; k++){ const a = k / 64 * Math.PI * 2; pts.push(new V3(Math.sin(a) * r, y, Math.cos(a) * r)); }
    return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), faintMat);
  };

  const tex = (hex, stops) => {
    const [r, g2, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const rg = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    stops.forEach(([o, a]) => rg.addColorStop(o, `rgba(${r},${g2},${b},${a})`));
    x.fillStyle = rg; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const HALO = [[0, 1], [0.3, 0.5], [1, 0]];
  // pe fundal luminos, lumina nu se adună (AdditiveBlending dispare pe alb): luminițele sunt puncte colorate moi
  const sprite = (t, s = 0.32) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthWrite: false, transparent: true })); sp.scale.setScalar(s); return sp; };
  const TEX = { agent: tex(SC.agent, HALO), pulse: tex(SC.pulse, HALO), light: tex(SC['orbit-light'], HALO), warm: tex(SC['journey-glow'], [[0, 0.9], [1, 0]]), shadow: tex(COL.umbra, [[0, 1], [0.5, 0.45], [1, 0]]) };
  // umbra de contact: o textură moale sub fiecare obiect, nu umbre în timp real
  const shadowMat = op => new THREE.MeshBasicMaterial({ map: TEX.shadow, transparent: true, opacity: op, depthWrite: false, fog: false });
  const shadow = (size, op = 0.26) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), shadowMat(op)); m.rotation.x = -Math.PI / 2; m.renderOrder = -1; return m; };
  const FLOOR = -0.95;

  /* --- obiectul din centru, Innovations: discuri stratificate care se desfac (doar când Innovations e vizibil) --- */
  // Ca în mostră: 5 discuri, cel de sus e cel mai larg și poartă cercul stins și punctul paletei.
  // L[0] e baza (jos), L[4] e scena (sus); etichetele #parts merg de sus în jos.
  const inv = new THREE.Group(); inv.position.y = 0.15; inv.visible = D.centru; world.add(inv);
  const L = [], invMats = [];
  for (let k = 0; k < 5; k++){
    const m = disc(1.3 - (4 - k) * 0.075, 0.07, SC['obj-centru'], 72);
    if (k === 4){
      m.add(faint(1.0, 0.036));
      const dot = new THREE.Mesh(new THREE.SphereGeometry(0.075, 20, 10), new THREE.MeshBasicMaterial({ color: SC['orbit-light'] }));
      dot.scale.y = 0.5; dot.position.y = 0.04; m.add(dot);
    }
    invMats.push(m.material); inv.add(m);
    L.push({ m, y0: (k - 2) * 0.085, y1: (k - 2) * 1.05 });
  }
  const invShadow = shadow(3.6, 0.3); invShadow.position.y = FLOOR; invShadow.visible = D.centru; world.add(invShadow);
  // fără inovație în centru: centrul e punctul paletei, mic și cald (semnul din marcă)
  const hubDot = new THREE.Mesh(new THREE.SphereGeometry(0.11, 24, 12), new THREE.MeshBasicMaterial({ color: SC['orbit-light'] }));
  const hubHalo = sprite(TEX.light, 0.9); hubHalo.material.opacity = 0.35;
  const hub = new THREE.Group(); hub.add(hubDot, hubHalo); hub.position.y = -0.25; hub.visible = !D.centru; world.add(hub);

  /* --- obiectele-simbol pe orbită --- */
  const OBJ = INTENTS.filter(it => it.orbit).length <= 3 ? 1.6 : 1.25; // obiectele, cu 15 % mai mari decât în v3; cu puține obiecte, mai mari
  const orbit = new THREE.Group(); world.add(orbit);
  const liveInner = [], plates = [];
  let pebble = null, pebbleHalo = null, lensDot = null;
  const pair = k => SC['obj-' + k];
  // Formele din planșa Ioanei (design v3.1, „1 · Sticlă colorată”, obiectul SH). Același număr = aceeași formă și în
  // varianta fără 3D (SHAPES din build.mjs): o formă nouă se schimbă în ambele locuri.
  const build = {
    coaching: () => { // un disc cu inel: doi oameni, o conversație
      const gr = new THREE.Group(); gr.add(disc(0.46, 0.08, pair('coaching')));
      const in1 = disc(0.16, 0.05, pair('coaching')); in1.position.y = 0.06; gr.add(in1);
      return gr; },
    speaking: () => { // cupolă pe bază eliptică: sala
      const gr = new THREE.Group(), pr = pair('speaking');
      const base = disc(0.5, 0.035, pr); base.position.y = -0.2; gr.add(base);
      const dome = obj(new THREE.SphereGeometry(0.44, seg(48), seg(16), 0, Math.PI * 2, 0, Math.PI / 2), pr); dome.position.y = -0.18; gr.add(dome);
      return gr; },
    companie: () => { // cub izometric, fețe plane cu contur
      const geo = new THREE.BoxGeometry(0.6, 0.6, 0.6); geo.rotateY(Math.PI / 4);
      return withEdges(obj(geo, pair('companie'), { flat: true })); },
    live: () => { // sferă cu trei puncte care lucrează pe fața ei
      const gr = new THREE.Group(); gr.add(obj(new THREE.SphereGeometry(0.4, seg(40), seg(20)), pair('live')));
      [0, 2.1, 4.2].forEach(ph => { const s = new THREE.Mesh(new THREE.SphereGeometry(0.05, 14, 8), new THREE.MeshBasicMaterial({ color: SC.pulse })); gr.add(s); liveInner.push({ s, ph }); });
      return gr; },
    povesti: () => { // disc eliptic cu umbră desenată sub el
      const gr = new THREE.Group();
      pebble = obj(new THREE.SphereGeometry(0.5, seg(48), seg(24)), pair('povesti'));
      pebble.scale.set(1, 0.36, 1); gr.add(pebble);
      gr.add(faint(0.4, -0.3));
      pebbleHalo = sprite(TEX.warm, 1.6); pebbleHalo.material.opacity = 0.3; pebbleHalo.position.z = -0.3; gr.add(pebbleHalo);
      return gr; },
    knowledge: () => { // patru plăci romboidale stivuite, care se desfac
      const gr = new THREE.Group();
      for (let i = 0; i < 4; i++){ const geo = new THREE.BoxGeometry(0.5, 0.035, 0.5); geo.rotateY(Math.PI / 4);
        const p = withEdges(obj(geo, pair('knowledge'))); gr.add(p); plates.push({ p }); }
      return gr; },
    inventii: () => { // doar dacă Innovations e pe orbită, fără „Desfă inovația”: nucleul, mic
      const gr = new THREE.Group();
      for (let k = 0; k < 4; k++){ const d = disc(0.5 - (3 - k) * 0.035, 0.05, pair('inventii')); d.position.y = (k - 1.5) * 0.075; gr.add(d); }
      return gr; },
    despre: () => { // lentila (Ioana, manualul §7): disc biconvex vertical, întors pe jumătate spre dreapta, cu ramă și punct
      const gr = new THREE.Group(), D = LENS;
      const body = obj(new THREE.SphereGeometry(D / 2, seg(48), seg(24)), pair('despre'), { k: 1.6 }) /* ~60 % cer, piersica doar în colțul din dreapta jos (T-036) */; body.scale.set(1, 1, 0.3); gr.add(body);
      gr.add(new THREE.Mesh(new THREE.TorusGeometry(D / 2, D * 0.018, 10, seg(96)), new THREE.MeshStandardMaterial({ color: SC.edge, roughness: 0.3 })));
      lensDot = new THREE.Mesh(new THREE.SphereGeometry(D / 16, 24, 12), new THREE.MeshStandardMaterial({ color: COL.punct, emissive: COL.piersica, emissiveIntensity: 0.35, roughness: 0.4 }));
      gr.add(lensDot);
      return gr; }
  };
  const LENS = 0.6; // diametrul lentilei = 0,65 × lățimea discului Coaching (0,92)
  // cât se apleacă fiecare obiect spre tine, ca elipsele lui să aibă proporțiile din planșă (camera e deja la ~14°)
  const TILT = { coaching: 0.36, povesti: 0.34, companie: 0.37, knowledge: 0.16, inventii: 0.2 };
  const tagsEl = $('#tags');
  // cu „Desfă inovația”, Innovations e nucleul din centru (ca în mostră), nu încă un obiect pe orbită
  const ON = INTENTS.map((it, i) => [it, i]).filter(([it]) => it.orbit && build[it.k] && SC['obj-' + it.k] && !(D.centru && it.k === 'inventii'));
  const R = ON.length <= 3 ? 2.6 : 3.2; // cu puține obiecte, orbita se strânge
  const byI = {};
  const marker = nr => {
    const lead = document.createElement('i'); lead.className = 'lead'; tagsEl.appendChild(lead);
    const num = document.createElement('div'); num.className = 'num'; num.textContent = nr || ''; tagsEl.appendChild(num);
    return { lead, num };
  };
  const items = ON.map(([it, i], j) => {
    const m = build[it.k]();
    const tilt = new THREE.Group(); tilt.rotation.x = TILT[it.k] || 0; tilt.add(m);
    const holder = new THREE.Group(); holder.add(tilt); holder.userData.i = i; orbit.add(holder);
    const sh = shadow(1.5); orbit.add(sh);
    const mats = []; m.traverse(o => { if (o.material && o.material.userData.rim) mats.push(o.material); });
    const tag = document.createElement('div'); tag.className = 'tag'; tag.textContent = it.label; tagsEl.appendChild(tag);
    return (byI[i] = { i, k: it.k, holder, m, sh, mats, tag, ...marker(it.nr), w: 0, glowK: 0, a: (ON.length <= 3 ? 0.5 : 0) + j * Math.PI * 2 / ON.length, s: OBJ });
  });
  // numărul nucleului (Innovations), cu linia lui de reper
  const INV_I = D.centru && IDX.inventii !== undefined ? IDX.inventii : -1;
  const invMark = INV_I >= 0 ? marker(INTENTS[INV_I].nr) : null;
  let invGlow = 0;
  const measure = () => items.forEach(o => o.w = o.tag.offsetWidth);
  measure(); document.fonts && document.fonts.ready.then(measure);

  /* --- orbitele desenate și cele două lumini mici care se rotesc pe ele --- */
  const orbitMat = new THREE.LineDashedMaterial({ color: SC.orbit, dashSize: 0.12, gapSize: 0.18, transparent: true, opacity: 0.3, depthWrite: false });
  const rings = [R * 0.7, R * 1.32].map(r => {
    const pts = []; for (let k = 0; k <= 160; k++){ const a = k / 160 * Math.PI * 2; pts.push(new V3(Math.sin(a) * r, -0.25, Math.cos(a) * r)); }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), orbitMat); l.computeLineDistances(); world.add(l); return { l, r };
  });
  const lights = rings.map((rg, n) => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.SphereGeometry(n ? 0.05 : 0.065, 16, 8), new THREE.MeshBasicMaterial({ color: SC['orbit-light'] })));
    const h = sprite(TEX.light, 0.5); h.material.opacity = 0.45; g.add(h); world.add(g);
    return { g, r: rg.r, a: n * 2.4, w: (n ? -1 : 1) * Math.PI * 2 / (n ? 38 : 24) }; // un tur în 24 s, celălalt invers, în 38 s
  });

  /* --- echipa: doar agenții sunt luminițe; Alex e un punct solid, vizibil doar în Live --- */
  const NODES = D.echipa;
  const hubId = NODES.find(n => n.slug === 'tudor') ? 'tudor' : 'alex';
  const ringIds = NODES.filter(n => n.slug !== 'alex' && n.slug !== hubId).map(n => n.slug);
  const NET = { alex: new V3(0, 0.25, 0) };
  if (hubId !== 'alex') NET[hubId] = new V3(0, 1.25, 0.3);
  ringIds.forEach((id, i) => { const deg = 160 - i * (360 / Math.max(1, ringIds.length)); const a = deg * Math.PI / 180, r = 2.2;
    NET[id] = new V3(Math.cos(a) * r, 0.25 + Math.sin(a) * r * 0.72, Math.sin(i * 1.7) * 0.35); });
  const nodeTagsEl = $('#nodeTags');
  const team = NODES.map((n, i) => {
    const sp = n.tip === 'alex' ? new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12), new THREE.MeshStandardMaterial({ color: SC.alex, roughness: .55, metalness: .1 })) : sprite(TEX.agent, 0.32);
    world.add(sp);
    const tg = document.createElement('div'); tg.className = 'ntag ' + n.tip; tg.textContent = n.nume; nodeTagsEl.appendChild(tg);
    // luminiță stinsă = agentul nu are niciun rând în jurnal în ultimele 24 de ore (arhitectura v2, 1.6)
    return { n, sp, tg, tw: 0, lit: n.aprins, r: R * 1.55 + (i % 3) * 0.35, inc: -0.5 + (i / NODES.length), ph: i * 0.7, sp0: 0.08 + (i % 4) * 0.03, pulse: 0, hot: 0, pos: new V3() };
  });
  const T = Object.fromEntries(team.map(t => [t.n.slug, t]));
  const measureN = () => team.forEach(t => t.tw = t.tg.offsetWidth);
  measureN(); document.fonts && document.fonts.ready.then(measureN);

  const EDGES = NODES.length ? [...(hubId !== 'alex' ? [['alex', hubId]] : []), ...ringIds.map(a => [hubId, a])] : [];
  const ePos = new Float32Array(Math.max(1, EDGES.length) * 6);
  const eGeo = new THREE.BufferGeometry(); eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const eMat = new THREE.LineBasicMaterial({ color: SC.network, transparent: true, opacity: 0, depthWrite: false });
  const edges = new THREE.LineSegments(eGeo, eMat); edges.frustumCulled = false; world.add(edges);
  const aPos = new Float32Array(3 * 6);
  const aGeo = new THREE.BufferGeometry(); aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
  const aMat = new THREE.LineBasicMaterial({ color: SC.pulse, transparent: true, opacity: 0, depthWrite: false });
  const aLines = new THREE.LineSegments(aGeo, aMat); aLines.frustumCulled = false; world.add(aLines);
  const pool = [0, 1, 2].map(() => { const s = sprite(TEX.pulse, 0.26); s.visible = false; world.add(s); return { s, a: null, b: null, t: 1 }; });

  let liveK = 0, warmK = 0;
  window.__pulse = (from, to) => {
    if (!T[from] || !T[to]) return;
    T[from].pulse = 1;
    if (liveK > 0.5 && !reduce){
      const p = pool.find(q => q.t >= 1) || pool[0];
      p.a = T[from]; p.b = T[to]; p.t = 0; p.s.visible = true; p.a.hot = 1; p.b.hot = 1;
    } else T[to].pulse = 0.6;
  };

  /* --- pragul: intri în atelier, nu deschizi un site --- */
  const door = new THREE.Group(); scene.add(door);
  const dMat = new THREE.MeshBasicMaterial({ color: SC.door, transparent: true, opacity: .45, fog: false });
  [[6, .035, 0, 3.3], [6, .035, 0, -1.5], [.035, 4.8, -3, 0.9], [.035, 4.8, 3, 0.9]].forEach(([w, h, x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .035), dMat); b.position.set(x, y, 0); door.add(b); });
  let entry = reduce ? 1 : 0;
  setTimeout(() => { entry = 1; }, 3200); // plasă: în tab-uri lente, intrarea se termină oricum

  /* --- poduri: ce explorezi se leagă. Misiunea (D-026) ca gest, nu ca text --- */
  const visited = [], bridges = [];
  const bMat = new THREE.LineBasicMaterial({ color: SC.bridge, transparent: true, opacity: .5, depthWrite: false });
  const NB = 16, bA = new V3(), bB = new V3();
  window.__bridge = i => {
    if (!byI[i]) return;
    const prev = visited[visited.length - 1];
    if (prev === i) return;
    if (prev !== undefined && byI[prev] && !bridges.some(b => (b.a === prev && b.b === i) || (b.a === i && b.b === prev)) && bridges.length < 10){
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NB + 1) * 3), 3));
      const line = new THREE.Line(geo, bMat); line.frustumCulled = false; orbit.add(line);
      bridges.push({ a: prev, b: i, g: reduce ? 1 : 0, line, geo });
    }
    visited.push(i);
  };

  /* --- interacțiune: tragi de spațiu, treci peste un obiect, apeși --- */
  let ringA = 0, ringT = 0, vel = 0, dragging = false, moved = 0, lastX = 0, pointerIn = false, hoverDirty = false, overInv = false;
  const px = { x: 0, y: 0 }, pxT = { x: 0, y: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  window.__focusRing = i => { if (!byI[i]) return; const target = -byI[i].a; ringT += Math.atan2(Math.sin(target - ringT), Math.cos(target - ringT)); vel = 0; };
  const pick = () => {
    ray.setFromCamera(ndc, camera);
    const targets = items.map(o => o.holder); if (D.centru) targets.push(inv);
    const hit = ray.intersectObjects(targets, true).find(h => !h.object.isSprite && !h.object.isLine && !h.object.isLineSegments);
    if (!hit) return null;
    let o = hit.object; while (o && o.userData.i === undefined && o !== inv) o = o.parent;
    return o === inv ? 'inv' : (o ? o.userData.i : null);
  };
  const setNdc = e => ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  canvas.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); });
  canvas.addEventListener('pointermove', e => {
    pxT.x = e.clientX / innerWidth - 0.5; pxT.y = e.clientY / innerHeight - 0.5;
    setNdc(e); if (e.pointerType === 'mouse'){ pointerIn = true; hoverDirty = true; }
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    if (!open && liveK < 0.5){ ringT += dx * 0.006; vel = dx * 0.006; }
  });
  canvas.addEventListener('pointerleave', () => { pointerIn = false; if (hint >= 0 && !roadLinks.some(a => a.matches(':hover, :focus'))) setHint(-1); overInv = false; canvas.classList.remove('point'); });
  canvas.addEventListener('pointerup', e => {
    dragging = false; canvas.classList.remove('dragging');
    if (moved >= 6 || liveK > 0.5) return;
    setNdc(e);
    const p = pick();
    if (p === null){ if (e.pointerType !== 'mouse') setHint(-1); return; }
    if (p === 'inv'){ if (!open) setOpen(true); return; }
    // pe ecranul tactil: prima atingere arată numele, a doua intră
    if (e.pointerType !== 'mouse' && hint !== p){ setHint(p); return; }
    select(p);
  });

  let W = innerWidth, H = innerHeight;
  function resize(){
    W = innerWidth; H = innerHeight;
    renderer.setSize(W, H, false); camera.aspect = W / H;
    camera.fov = W < 760 ? 44 : 35; camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { resize(); measure(); measureN(); readLayout(); });
  resize();

  /* --- compoziția: scena stă în spațiul liber, lângă coloana din stânga (sau între panouri, pe telefon) --- */
  const colEl = $('.col'), heroEl = $('.hero'), roadsEl = $('#roads'), panelEl = $('#panel'), closeEl = $('#closebar');
  const vis = el => el && el.offsetParent !== null;
  const lay = { cx: W * 0.68, cy: H * 0.5, free: W * 0.5, freeH: H * 0.6 };
  function readLayout(){
    const narrow = W < 760;
    if (!narrow){
      const r = colEl.getBoundingClientRect();
      const left = r.right + 24, right = W - 24;
      // desfăcută, inovația se mută spre stânga, ca etichetele straturilor să aibă loc în dreapta
      lay.cx = open ? left + (right - left) * 0.36 : (left + right) / 2; lay.cy = H * 0.47; lay.free = Math.max(320, right - left); lay.freeH = H * 0.8;
    } else {
      const topEl = [heroEl, closeEl].find(vis), botEl = [roadsEl, panelEl, closeEl].filter(vis).pop();
      const top = topEl && topEl !== botEl ? topEl.getBoundingClientRect().bottom : 14;
      const bottom = botEl ? botEl.getBoundingClientRect().top : H - 14;
      lay.cx = W / 2; lay.cy = (top + bottom) / 2; lay.free = W; lay.freeH = Math.max(120, bottom - top);
    }
  }
  readLayout(); window.__layout = readLayout;
  if (document.fonts) document.fonts.ready.then(readLayout);
  const EXT = 2 * (R + 0.75 * OBJ); // lățimea orbitei, cu obiecte cu tot

  /* --- buclă --- */
  const v = new V3(), zero = new V3(), topRight = new V3(), offRight = new V3(1.38, 0, 0), rimOff = new V3(0, 0.5, 0), tagOff = new V3(0, -0.6, 0), below = new V3(0, -1.0, 0);
  const partEls = [...document.querySelectorAll('#parts li')];
  const comp = { x: 0, y: 0, d: 16, inv: 1 };
  let explode = 0, last = performance.now(), t = 0, running = true, frame = 0, fAcc = 0, fN = 0;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running){ last = performance.now(); requestAnimationFrame(loop); } });
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const toScreen = (o, off) => { v.copy(off); o.localToWorld(v); v.project(camera); return { x: (v.x * .5 + .5) * W, y: (-v.y * .5 + .5) * H, z: v.z }; };
  const hit = new V3(), dir = new V3();
  // punctul din lume (pe planul z = 0) care apare pe ecran la (sx, sy)
  const worldAt = (sx, sy) => { dir.set(sx / W * 2 - 1, -(sy / H) * 2 + 1, 0.5).unproject(camera).sub(camera.position).normalize();
    return hit.copy(camera.position).addScaledVector(dir, -camera.position.z / dir.z); };

  function loop(now){
    if (!running) return;
    frame++;
    const mode = selected >= 0 ? INTENTS[selected].k : '';
    const raw = (now - last) / 1000; last = now;
    const dt = Math.min(0.2, raw); t += dt;
    // pixeli adaptivi: dacă media cadrelor trece de ~26 ms, scădem rezoluția (minimum 1)
    fAcc += raw; fN++;
    if (fN >= 90){ const avg = fAcc / fN; window.__perf.avgMs = Math.round(avg * 1000);
      if (avg > 0.026 && dpr > 1){ dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); window.__perf.dpr = dpr; }
      fAcc = 0; fN = 0; }
    if (frame % 20 === 0) readLayout();

    const narrow = W < 760;
    const K = reduce ? 60 : 4.5;
    const live = mode === 'live', warm = mode === 'povesti', know = mode === 'knowledge';
    liveK = damp(liveK, live ? 1 : 0, reduce ? 60 : 2.6, dt);
    warmK = damp(warmK, warm ? 1 : 0, reduce ? 60 : 2.2, dt);
    explode = damp(explode, open ? 1 : 0, reduce ? 60 : 3.2, dt);

    // distanța camerei: orbita încape în spațiul liber
    const tan = Math.tan(camera.fov * Math.PI / 360);
    let dT = Math.max(EXT * H / (2 * tan * lay.free), EXT * 0.5 * H / (2 * tan * lay.freeH));
    dT = Math.min(narrow ? 26 : 19, Math.max(narrow ? 13 : 10.5, dT)) * (open ? 0.95 : 1) * (1 + liveK * 0.05);
    comp.d = damp(comp.d, dT, K, dt);
    scene.fog.near = comp.d + 1.5; scene.fog.far = comp.d + 16; // ceața pornește de la centrul orbitei: doar obiectele din spate se topesc
    if (!reduce && !coarse){ px.x = damp(px.x, pxT.x, 3, dt); px.y = damp(px.y, pxT.y, 3, dt); }
    entry = Math.min(1, entry + dt / 2.2);
    const ee = 1 - Math.pow(1 - entry, 3);
    door.visible = entry < 1;
    const dz = comp.d + (1 - ee) * 10;
    door.position.set(world.position.x, 0, dz - 2);
    // camera privește de sus, la ~14°: orbita devine elipsa din mostră
    camera.position.set(px.x * 0.9, comp.d * 0.25 - px.y * 0.6, dz);
    camera.lookAt(0, 0, 0); camera.updateMatrixWorld();
    const target = worldAt(lay.cx, lay.cy);
    comp.x = damp(comp.x, target.x, K, dt); comp.y = damp(comp.y, target.y, K, dt);
    world.position.set(comp.x, comp.y, 0);

    // lumina caldă pentru My Journey
    scene.fog.color.lerpColors(BG, WARM, warmK);
    hemi.color.lerpColors(C.hemi, C.hemiW, warmK); key.color.lerpColors(C.key, C.keyW, warmK);
    glow.color.lerpColors(C.glow, C.glowW, warmK);

    // hover: o singură căutare pe cadru, doar cu mouse-ul
    if (hoverDirty && pointerIn && !dragging && liveK < 0.5){
      hoverDirty = false; const p = pick();
      overInv = p === 'inv';
      const i = typeof p === 'number' ? p : p === 'inv' ? INV_I : -1; // nucleul aprinde rândul Innovations din legendă
      if (i !== hint && !roadLinks.some(a => a.matches(':focus'))) setHint(i);
      canvas.classList.toggle('point', p !== null);
    }

    // orbita
    if (!dragging){
      if (Math.abs(vel) > 0.0001){ ringT += vel; vel *= 0.92; }
      else if (!reduce && selected < 0 && !open && hint < 0) ringT += dt * 0.05;
    }
    ringA = damp(ringA, ringT, reduce ? 60 : 5, dt);
    const hide = Math.max(explode, liveK);
    const ctr = toScreen(world, zero);
    items.forEach((o, j) => {
      const i = o.i, lit = i === hint || i === selected;
      const a = o.a + ringA, rr = R * (1 + 0.45 * explode);
      const fl = reduce ? 0 : Math.sin(t * 0.7 + j * 1.3) * 0.09; // obiectele plutesc
      o.holder.position.set(Math.sin(a) * rr, -0.25 + fl, Math.cos(a) * rr);
      const target = live ? 0.001 : open ? (narrow ? 0.001 : OBJ * 0.55) : OBJ * (i === selected ? (o.k === 'knowledge' ? 1 : 1.22) : i === hint ? 1.12 : 1); // plăcile se desfac, nu cresc (T-036)
      o.s = damp(o.s, target, 6, dt); o.holder.scale.setScalar(Math.max(0.001, o.s));
      o.glowK = damp(o.glowK, lit ? 1 : 0, reduce ? 60 : 8, dt);
      o.mats.forEach(m => { m.userData.rim.value = m.userData.rim0 + o.glowK * 0.9; });
      o.sh.position.set(o.holder.position.x, FLOOR, o.holder.position.z);
      o.sh.scale.setScalar(Math.max(0.001, o.s / OBJ * (1 - fl * 0.8)));
      o.sh.material.opacity = 0.26 * (1 - hide) * (1 - fl * 2);
      // planșa nu se rostogolește: obiectele se leagănă puțin în jurul axei lor, cu fața spre tine
      if (o.k === 'despre'){ // lentila: întoarsă spre dreapta, se leagănă ±0,15 rad în 14 s; la hover și Tab se întoarce spre tine, iar punctul iese în față
        const e = 1 - Math.pow(1 - o.glowK, 3);
        o.m.rotation.set(0.08, (-0.6 + (reduce ? 0 : Math.sin(t * Math.PI * 2 / 14 + j) * 0.15)) * (1 - e), 0);
        lensDot.position.z = LENS * (reduce ? 0.2 : 0.16 + 0.06 * e); // fără sticlă cu transmisie, punctul stă chiar pe fața lentilei (manualul: 0,1 D, sub suprafață) lensDot.scale.setScalar(reduce ? 1 : 1 + 0.5 * e);
      } else o.m.rotation.y = reduce ? 0 : Math.sin(t * 0.3 + j * 1.7) * 0.32 * (o.k === 'knowledge' && know ? 0.3 : 1);
      // numărul de reper: mereu, dacă obiectul e în față; numele: doar la hover, Tab, atingere sau când e ales
      const front = items.length <= 3 ? 1 : Math.cos(a), show = hide < 0.1 && front > -0.45;
      // discul stă în afara obiectului, pe direcția dinspre centrul orbitei (în sus), legat cu o linie de reper, ca în mostră
      const pc = toScreen(o.holder, zero), rpx = Math.hypot(...(p => [p.x - pc.x, p.y - pc.y])(toScreen(o.holder, rimOff)));
      let dx = pc.x - ctr.x, dy = pc.y - ctr.y - 140; const dl = Math.hypot(dx, dy) || 1; dx /= dl; dy /= dl;
      const L0 = rpx * 0.8, L1 = rpx + 30, nx = pc.x + dx * L1, ny = pc.y + dy * L1;
      const op = show && !lit ? Math.min(1, (front + 0.45) / 0.4).toFixed(2) : 0; // când apare numele, numărul se retrage
      o.num.style.opacity = op; o.lead.style.opacity = op;
      o.num.style.transform = `translate(${nx.toFixed(1)}px,${ny.toFixed(1)}px)`;
      o.lead.style.width = Math.max(0, L1 - 16 - L0).toFixed(1) + 'px';
      o.lead.style.transform = `translate(${(pc.x + dx * L0).toFixed(1)}px,${(pc.y + dy * L0).toFixed(1)}px) rotate(${Math.atan2(dy, dx).toFixed(3)}rad)`;
      const pt = toScreen(o.holder, tagOff);
      o.tag.classList.toggle('on', lit && hide < 0.1);
      o.tag.style.transform = `translate(${(pt.x - o.w / 2).toFixed(1)}px,${(pt.y + 8).toFixed(1)}px)`;
    });
    bridges.forEach(br => {
      br.g = Math.min(1, br.g + dt / 0.9);
      bA.copy(byI[br.a].holder.position); bB.copy(byI[br.b].holder.position);
      const arr = br.geo.attributes.position.array, n = Math.max(1, Math.round(NB * br.g));
      for (let k = 0; k <= NB; k++){ const uu = Math.min(k, n) / NB;
        arr[k * 3] = bA.x + (bB.x - bA.x) * uu; arr[k * 3 + 1] = bA.y + (bB.y - bA.y) * uu + Math.sin(Math.PI * uu) * 0.7 - 0.1; arr[k * 3 + 2] = bA.z + (bB.z - bA.z) * uu; }
      br.geo.attributes.position.needsUpdate = true;
      br.line.visible = hide < 0.1;
    });
    bMat.color.lerpColors(C.pod, C.podW, warmK);
    orbitMat.opacity = 0.3 * (1 - hide);
    rings.forEach(rg => { rg.l.scale.setScalar(1 + 0.45 * explode); });
    lights.forEach(l => {
      if (!reduce) l.a += l.w * dt;
      const r = l.r * (1 + 0.45 * explode);
      l.g.position.set(Math.sin(l.a) * r, -0.25, Math.cos(l.a) * r);
      l.g.visible = hide < 0.6;
    });
    // cele trei puncte din Live se mișcă încet pe fața sferei, fără să treacă în spatele ei
    liveInner.forEach(l => { const a = (reduce ? 0 : t * 0.45) + l.ph; l.s.position.set(Math.cos(a) * 0.42, Math.sin(a) * 0.42 + 0.08, 1).normalize().multiplyScalar(0.405); });
    const spread = know ? 1 : 0;
    plates.forEach((pl, i) => {
      const y = (i - 1.5) * (0.07 + 0.06 * spread);
      pl.p.position.y = damp(pl.p.position.y, y, reduce ? 60 : 5, dt);
      pl.p.rotation.y = damp(pl.p.rotation.y, i * 0.08 * spread, reduce ? 60 : 4, dt);
    });
    if (pebble){ const b = reduce ? 1 : 1 + Math.sin(t * 0.9) * 0.025; pebble.scale.set(b, 0.36 * b, b); pebbleHalo.material.opacity = 0.25 + warmK * 0.45; }

    // inovația din centru
    comp.inv = damp(comp.inv, narrow && selected >= 0 ? 0.001 : 1, K, dt);
    const invS = Math.max(0.001, (open ? 0.9 : 0.75) * (1 - liveK) * comp.inv * (open ? 1 : 1 + invGlow * 0.07)); // hover, Tab sau rândul din legendă: nucleul crește puțin
    inv.scale.setScalar(invS);
    inv.rotation.x = 0.1 + (0.32 - 0.1) * explode; // închis: discurile se văd aproape din profil, ca în mostră
    inv.rotation.y = (reduce ? 0 : Math.sin(t * 0.25) * 0.12) * (1 - explode);
    L.forEach(l => { l.m.position.y = l.y0 + (l.y1 - l.y0) * explode; });
    invGlow = damp(invGlow, overInv || hint === INV_I && INV_I >= 0 || (explodeBtn && explodeBtn.classList.contains('hi')) ? 1 : 0, reduce ? 60 : 8, dt);
    invMats.forEach(m => { m.userData.rim.value = m.userData.rim0 + invGlow * 0.7; });
    if (invMark){ // numărul 4 stă deasupra discului de sus, spre dreapta, ca în mostră
      const pc = toScreen(inv, topRight.set(1.05, L[4].m.position.y, 0)), on = hide < 0.1 && comp.inv > 0.5 && entry > 0.6 && !open;
      const op = on ? 1 : 0, dx = 0.42, dy = -0.91, L1 = 64;
      invMark.num.style.opacity = op; invMark.lead.style.opacity = op;
      invMark.num.style.transform = `translate(${(pc.x + dx * L1).toFixed(1)}px,${(pc.y + dy * L1).toFixed(1)}px)`;
      invMark.lead.style.width = (L1 - 16) + 'px';
      invMark.lead.style.transform = `translate(${pc.x.toFixed(1)}px,${pc.y.toFixed(1)}px) rotate(${Math.atan2(dy, dx).toFixed(3)}rad)`;
    }
    invShadow.material.opacity = 0.3 * (1 - liveK) * (1 - explode * 0.6) * comp.inv;
    hub.scale.setScalar(Math.max(0.001, 1 - liveK)); hubHalo.material.opacity = 0.3 + (reduce ? 0 : Math.sin(t * 1.6) * 0.08);
    if (explodeBtn){
      const pb = toScreen(world, below);
      explodeBtn.classList.toggle('on', hide < 0.1 && comp.inv > 0.5 && entry > 0.6);
      explodeBtn.style.transform = `translate(${(pb.x - explodeBtn.offsetWidth / 2).toFixed(1)}px,${pb.y.toFixed(1)}px)`;
    }
    if (D.centru && explode > 0.02 && !narrow){
      [L[4], L[3], L[2], L[1], L[0]].forEach((l, i) => {
        const el = partEls[i]; if (!el) return;
        offRight.set(1.38, l.m.position.y, 0); // în spațiul inovației, ca eticheta să nu se rotească odată cu stratul
        const p = toScreen(inv, offRight);
        el.style.setProperty('--x', (p.x + 36) + 'px');
        el.style.transform = `translate(${(p.x + 36).toFixed(1)}px,${(p.y - el.offsetHeight / 2).toFixed(1)}px)`;
      });
    }

    // echipa (doar cu Live vizibil): pe orbită sau în rețea
    team.forEach((m, i) => {
      const ang = m.ph + (reduce ? 0 : t * m.sp0);
      const ox = Math.sin(ang) * m.r, oz = Math.cos(ang) * m.r;
      v.set(ox, 0.3 + oz * Math.sin(m.inc) * 0.35 + Math.sin(ang * 2) * 0.2, oz * Math.cos(m.inc));
      const k = m.n.tip === 'alex' ? 1 : liveK;
      m.pos.copy(v).lerp(NET[m.n.slug] || v, k);
      if (!reduce && liveK > 0.5) m.pos.y += Math.sin(t * 0.8 + i) * 0.03;
      m.sp.position.copy(m.pos);
      m.pulse = Math.max(0, m.pulse - dt * 0.6); m.hot = Math.max(0, m.hot - dt * 0.45);
      let s = 0.26 + m.pulse * 0.4 + liveK * 0.1;
      if (m.n.tip === 'alex') s = liveK + 0.001;
      m.sp.scale.setScalar(s);
      if (m.sp.isSprite) m.sp.material.opacity = (m.lit || m.hot > 0.05 ? 0.9 : 0.22) * (1 - warmK * 0.7) * (1 - explode);
    });
    if (liveK > 0.01){
      EDGES.forEach(([a, b], j) => { const A = T[a].pos, B = T[b].pos; ePos.set([A.x, A.y, A.z, B.x, B.y, B.z], j * 6); });
      eGeo.attributes.position.needsUpdate = true;
    }
    eMat.opacity = liveK * 0.35;
    let ai2 = 0; aPos.fill(0);
    pool.forEach(p => {
      if (p.t >= 1 || !p.a){ p.s.visible = false; return; }
      p.t = Math.min(1, p.t + dt / 1.1);
      const e = p.t < .5 ? 2 * p.t * p.t : 1 - Math.pow(-2 * p.t + 2, 2) / 2;
      p.s.position.copy(p.a.pos).lerp(p.b.pos, e); p.s.position.y += Math.sin(Math.PI * e) * 0.35;
      p.s.scale.setScalar(0.22 + Math.sin(Math.PI * e) * 0.12);
      const A = p.a.pos, B = p.b.pos; aPos.set([A.x, A.y, A.z, B.x, B.y, B.z], ai2++ * 6);
      if (p.t >= 1){ p.b.pulse = 1; p.s.visible = false; }
    });
    aGeo.attributes.position.needsUpdate = true;
    aMat.opacity = liveK * 0.75;

    // etichetele rețelei: pe desktop toate, pe telefon doar Alex și cine lucrează acum
    team.forEach(m => {
      if (liveK < 0.05){ if (m.tg.style.opacity !== '0') m.tg.style.opacity = 0; return; }
      const p = toScreen(m.sp, zero);
      const show = !narrow || m.n.tip === 'alex' || m.hot > 0.05;
      m.tg.style.opacity = show ? Math.min(1, (liveK - 0.3) * 2).toFixed(2) : 0;
      m.tg.classList.toggle('hot', m.hot > 0.05);
      m.tg.style.transform = `translate(${Math.max(4, Math.min(W - m.tw - 4, p.x - m.tw / 2)).toFixed(1)}px,${(p.y + (m.n.tip === 'alex' ? 16 : 11)).toFixed(1)}px)`;
    });

    renderer.render(scene, camera);
    if (!canvas.classList.contains('ready')) canvas.classList.add('ready');
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
