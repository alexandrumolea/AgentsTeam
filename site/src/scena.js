// Scena atelierului (direcția Spațiu). Pornește din team/ioana/documente/prototip-v2-spatial.html.
// Diferența față de prototip: nimic simulat. Panourile vin din șabloanele generate la build,
// iar Live, luminițele și impulsurile vin din datele reale (docs/taskuri.md + git), incluse în pagină.
const D = JSON.parse(document.getElementById('data').textContent);
const qs = new URLSearchParams(location.search);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = matchMedia('(pointer: coarse)').matches;
const saveData = !!(navigator.connection && navigator.connection.saveData);
const $ = s => document.querySelector(s);
const body = document.body;
body.classList.remove('no-js');
let selected = -1, open = false;

const INTENTS = D.categorii;
const IDX = Object.fromEntries(INTENTS.map((it, i) => [it.k, i]));
const KIND = Object.fromEntries(D.echipa.map(n => [n.slug, n.tip]));

/* ---------- pauza actualizărilor (WCAG 2.2.2) ---------- */
let paused = reduce, hold = 0;
const sr = $('#sr');
function syncPause(){
  document.querySelectorAll('[data-pause]').forEach(b => {
    b.setAttribute('aria-pressed', String(paused));
    if (b.classList.contains('pz')) { b.textContent = paused ? '▶' : '❚❚'; b.setAttribute('aria-label', paused ? 'Pornește actualizările' : 'Oprește actualizările'); }
    else b.textContent = paused ? 'Pornește' : 'Pauză';
  });
  const tk = $('#ticker'); if (tk) tk.classList.toggle('held', paused || hold > 0);
}
document.addEventListener('click', e => { const b = e.target.closest('[data-pause]'); if (!b) return; paused = !paused; syncPause(); sr.textContent = paused ? 'Actualizările sunt oprite.' : 'Actualizările au pornit.'; });
function holdOn(el){
  if (!el) return;
  const on = () => { hold++; syncPause(); }, off = () => { hold = Math.max(0, hold - 1); syncPause(); };
  el.addEventListener('pointerenter', on); el.addEventListener('pointerleave', off);
  el.addEventListener('focusin', on); el.addEventListener('focusout', off);
}
holdOn($('#ticker'));

/* ---------- ticker: ultimele taskuri reale, pe rând ---------- */
const tick = $('#tick');
let ti = 0;
if (tick && D.ticker.length > 1) (function loopTicks(){
  if (!paused && hold === 0 && !document.hidden){ ti = (ti + 1) % D.ticker.length; tick.textContent = D.ticker[ti].t; }
  setTimeout(loopTicks, 5200);
})();

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

/* ---------- dock și carduri (generate la build) ---------- */
const dockBtns = [...document.querySelectorAll('#dock button[data-k]')];
const btnOf = k => dockBtns.find(b => b.dataset.k === k);
dockBtns.forEach(b => b.addEventListener('click', () => select(IDX[b.dataset.k])));
$('#cards').addEventListener('click', e => { const b = e.target.closest('[data-open]'); if (b){ select(IDX[b.dataset.open]); $('#px').focus({ preventScroll: true }); } });

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
  if (open) setOpen(false, true);
  if (selected === i){ closePanel(); return; }
  selected = i; const it = INTENTS[i];
  dockBtns.forEach(b => b.setAttribute('aria-pressed', String(b.dataset.k === it.k)));
  renderPanel(it); setModes(it.k);
  panel.classList.add('show'); body.classList.add('sheet');
  sr.textContent = `Deschis: ${it.label}.`;
  const b = btnOf(it.k);
  if (b) requestAnimationFrame(() => b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' }));
  if (window.__focusRing) window.__focusRing(i);
  if (window.__bridge) window.__bridge(i);
}
function closePanel(){
  const back = selected >= 0 && panel.contains(document.activeElement) ? btnOf(INTENTS[selected].k) : null;
  panel.classList.remove('show'); body.classList.remove('sheet'); setModes('');
  selected = -1; dockBtns.forEach(b => b.setAttribute('aria-pressed', 'false'));
  if (back) back.focus({ preventScroll: true });
}
$('#px').addEventListener('click', closePanel);
$('#about').addEventListener('click', e => { e.preventDefault(); if (selected !== IDX.despre) select(IDX.despre); $('#px').focus({ preventScroll: true }); });
$('#liveOut').addEventListener('click', () => { closePanel(); const t = $('#tk') || btnOf('live'); if (t) t.focus({ preventScroll: true }); });
const tk = $('#tk'); if (tk) tk.addEventListener('click', () => { if (selected !== IDX.live) select(IDX.live); $('#px').focus({ preventScroll: true }); });
addEventListener('keydown', e => { if (e.key === 'Escape'){ closePanel(); setOpen(false); } });

const explodeBtn = $('#explode'), collapseBtn = $('#collapse');
function setOpen(v){
  if (!explodeBtn) return;
  open = v; body.classList.toggle('open', v);
  explodeBtn.setAttribute('aria-expanded', String(v));
  if (v){ closePanel(); collapseBtn.focus({ preventScroll: true }); }
}
if (explodeBtn){
  explodeBtn.addEventListener('click', () => setOpen(true));
  collapseBtn.addEventListener('click', () => { setOpen(false); explodeBtn.focus({ preventScroll: true }); });
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
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !coarse, powerPreference: 'high-performance' });
  let dpr = Math.min(devicePixelRatio, low ? 1 : coarse ? 1.5 : 2);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  window.__perf = { dpr, low, avgMs: 0 };
  const seg = n => coarse ? Math.max(8, Math.round(n * 0.5)) : n;
  const V3 = THREE.Vector3;

  const BG = new THREE.Color('#070910'), WARM = new THREE.Color('#160D08');
  const scene = new THREE.Scene();
  scene.background = BG.clone();
  scene.fog = new THREE.Fog(BG.clone(), 9, 22);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
  const world = new THREE.Group(); scene.add(world);
  const hemi = new THREE.HemisphereLight('#9fb4ff', '#120c08', 0.5); scene.add(hemi);
  const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(3, 5, 4); scene.add(key);
  const glow = new THREE.PointLight('#7CF5C8', 6, 8, 2); glow.position.set(0, 0.6, 0.8); world.add(glow);
  const C = { hemi: new THREE.Color('#9fb4ff'), hemiW: new THREE.Color('#ffb37a'), key: new THREE.Color('#ffffff'), keyW: new THREE.Color('#ffd2a8'),
              glow: new THREE.Color('#7CF5C8'), glowW: new THREE.Color('#ff9a4a'), floor: new THREE.Color('#ffffff'), floorW: new THREE.Color('#e0b48e') };

  // planșa de atelier
  const gc = document.createElement('canvas'); gc.width = gc.height = 256;
  const g = gc.getContext('2d'); g.fillStyle = '#0a0d17'; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = '#1f3b44'; g.lineWidth = 2; g.strokeRect(0, 0, 256, 256);
  g.strokeStyle = '#141f2e'; g.lineWidth = 1; for (let i = 64; i < 256; i += 64){ g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 256); g.moveTo(0, i); g.lineTo(256, i); g.stroke(); }
  const gridTex = new THREE.CanvasTexture(gc); gridTex.wrapS = gridTex.wrapT = THREE.RepeatWrapping; gridTex.repeat.set(24, 24); gridTex.colorSpace = THREE.SRGBColorSpace;
  gridTex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const floorMat = new THREE.MeshBasicMaterial({ map: gridTex });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), floorMat);
  floor.rotation.x = -Math.PI / 2; floor.position.y = -1.5; world.add(floor);

  const glass = (tint = '#ffffff', rough = 0.08, op = 0.6) => coarse
    ? new THREE.MeshPhysicalMaterial({ color: new THREE.Color(tint).multiplyScalar(0.35), metalness: 0.1, roughness: 0.08, clearcoat: 1, iridescence: low ? 0 : 0.5, transparent: true, opacity: op, depthWrite: op > 0.5, envMapIntensity: 1.8 })
    : new THREE.MeshPhysicalMaterial({ color: '#ffffff', transmission: 1, thickness: 0.6, roughness: rough, ior: 1.45, iridescence: 0.55, iridescenceIOR: 1.3, attenuationColor: new THREE.Color(tint), attenuationDistance: 2.5, envMapIntensity: 1.2, specularIntensity: 1 });

  const halo = (r, g2, b) => {
    const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
    const rg = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    rg.addColorStop(0, `rgba(${r},${g2},${b},1)`); rg.addColorStop(.25, `rgba(${r},${g2},${b},.45)`); rg.addColorStop(1, `rgba(${r},${g2},${b},0)`);
    x.fillStyle = rg; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c);
  };
  const TEX = { agent: halo(124, 245, 200), om: halo(255, 195, 122), alex: halo(255, 244, 230), pulse: halo(230, 255, 246) };
  const sprite = (tex, s = 0.32) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, depthWrite: false, blending: THREE.AdditiveBlending, transparent: true })); sp.scale.setScalar(s); return sp; };

  /* --- obiectul din centru: o invenție în 5 straturi (acum: chiar site-ul) --- */
  const inv = new THREE.Group(); inv.position.y = 0.15; inv.visible = D.centru; world.add(inv);
  const L = [];
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.4, 0.14, seg(72)), new THREE.MeshStandardMaterial({ color: '#161a28', metalness: 0.85, roughness: 0.32 }));
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.26, 1.26, 0.16, seg(72)), glass('#bfefff', 0.06, 0.45));
  const ring = new THREE.Group();
  ring.add(new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.024, 12, seg(120)), new THREE.MeshStandardMaterial({ color: '#7CF5C8', emissive: '#2fd69c', emissiveIntensity: 1.4, roughness: .3 })));
  ring.children[0].rotation.x = Math.PI / 2;
  for (let i = 0; i < 8; i++){ const t = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.16), new THREE.MeshStandardMaterial({ color: '#e8fff6', emissive: '#7CF5C8', emissiveIntensity: .8 }));
    const a = i * Math.PI / 4; t.position.set(Math.sin(a), 0, Math.cos(a)); t.rotation.y = a; ring.add(t); }
  // miezul: un cristal care lucrează (în prototip era acul busolei, invenția fictivă)
  const core = new THREE.Group();
  const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.34, 0), new THREE.MeshStandardMaterial({ color: '#c9fff0', emissive: '#2fd69c', emissiveIntensity: .55, metalness: .2, roughness: .25, flatShading: true }));
  crystal.scale.y = 1.25;
  core.add(crystal, new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.012, 8, seg(64)), new THREE.MeshStandardMaterial({ color: '#e8fff6', emissive: '#7CF5C8', emissiveIntensity: .6 })));
  core.children[1].rotation.x = Math.PI / 2;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(1.24, seg(64), seg(24), 0, Math.PI * 2, 0, Math.PI / 2), glass('#d8ccff', 0.04, 0.28));
  dome.scale.y = 0.32;
  [[base, 0, -1.75], [disc, 0.13, -0.85], [ring, 0.24, 0.0], [core, 0.36, 0.85], [dome, 0.3, 1.7]].forEach(([m, y0, y1]) => { inv.add(m); L.push({ m, y0: y0 - 0.15, y1 }); });

  /* --- cele 7 obiecte pe orbită --- */
  const R = 3.7;
  const orbit = new THREE.Group(); world.add(orbit);
  const liveInner = [], plates = [];
  let pebble = null, pebbleHalo = null;
  const build = {
    coaching: () => new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.12, seg(24), seg(64)), glass('#ffd2c2', .18)),
    inventii: () => new THREE.Mesh(new THREE.IcosahedronGeometry(0.46, 0), glass('#c9fff0', .18)),
    live: () => { // lanternă de sticlă cu lumini care lucrează înăuntru
      const gr = new THREE.Group(); gr.add(new THREE.Mesh(new THREE.SphereGeometry(0.42, seg(40), seg(20)), glass('#d6fff1', .12)));
      [0, 2.1, 4.2].forEach(ph => { const s = sprite(TEX.agent, 0.2); gr.add(s); liveInner.push({ s, ph }); });
      return gr; },
    knowledge: () => { // straturi de cunoaștere: plăci care se desfac
      const gr = new THREE.Group(); ['#c9fff0', '#d8d2ff', '#ffe9c2', '#c9e4ff'].forEach(t => {
        const m = glass(t, .12); m.emissive = new THREE.Color('#7CF5C8'); m.emissiveIntensity = 0;
        const p = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.045, 0.52), m); gr.add(p); plates.push({ p }); });
      return gr; },
    povesti: () => { // piatră caldă, mată: singurul obiect care nu e din sticlă
      const gr = new THREE.Group();
      pebble = new THREE.Mesh(new THREE.SphereGeometry(0.36, seg(40), seg(20)), new THREE.MeshStandardMaterial({ color: '#d9a273', emissive: '#ff8a3d', emissiveIntensity: .35, roughness: .85, metalness: 0 }));
      pebble.scale.set(1.15, 0.72, 1); gr.add(pebble);
      pebbleHalo = sprite(TEX.om, 1.5); pebbleHalo.material.opacity = .45; gr.add(pebbleHalo);
      return gr; },
    speaking: () => new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.5, 8, seg(24)), glass('#fff3c2', .18)),
    companie: () => new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), glass('#d8d2ff', .18))
  };
  const tagsEl = $('#tags');
  const ON = INTENTS.map((it, i) => [it, i]).filter(([it]) => it.orbit && build[it.k]);
  const byI = {};
  const items = ON.map(([it, i], j) => {
    const m = build[it.k]();
    const holder = new THREE.Group(); holder.add(m); holder.userData.i = i; orbit.add(holder);
    if (it.fam === 'direct') holder.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 6), new THREE.MeshBasicMaterial({ color: '#ffffff' })));
    if (it.room){ // fiecare cameră își aruncă lumina pe planșă: semn că e un loc, nu un buton
      const pool = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.9), new THREE.MeshBasicMaterial({ map: it.k === 'povesti' ? TEX.om : it.k === 'inventii' ? TEX.alex : TEX.agent, transparent: true, opacity: .42, depthWrite: false, blending: THREE.AdditiveBlending }));
      pool.rotation.x = -Math.PI / 2; pool.position.y = -1.23; holder.add(pool);
    }
    const tag = document.createElement('div'); tag.className = 'tag'; tag.textContent = it.label; tagsEl.appendChild(tag);
    return (byI[i] = { i, k: it.k, holder, m, tag, w: 0, a: j * Math.PI * 2 / ON.length, s: 1, spin: 0.2 + Math.random() * 0.3 });
  });
  const measure = () => items.forEach(o => o.w = o.tag.offsetWidth);
  measure(); document.fonts && document.fonts.ready.then(measure);

  /* --- echipa: doar agenții sunt luminițe; Alex e un punct solid, vizibil doar în Live --- */
  const NODES = D.echipa;
  const hub = NODES.find(n => n.slug === 'tudor') ? 'tudor' : 'alex';
  const ringIds = NODES.filter(n => n.slug !== 'alex' && n.slug !== hub).map(n => n.slug);
  const NET = { alex: new V3(0, 0.25, 0) };
  if (hub !== 'alex') NET[hub] = new V3(0, 1.25, 0.3);
  ringIds.forEach((id, i) => { const deg = 160 - i * (370 / Math.max(1, ringIds.length)) + (i > ringIds.length / 2 ? 0 : 0); const a = deg * Math.PI / 180, r = 2.2;
    NET[id] = new V3(Math.cos(a) * r, 0.25 + Math.sin(a) * r * 0.72, Math.sin(i * 1.7) * 0.35); });
  const nodeTagsEl = $('#nodeTags');
  const team = NODES.map((n, i) => {
    const sp = n.tip === 'alex' ? new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 12), new THREE.MeshStandardMaterial({ color: '#F3F1EC', roughness: .55, metalness: .1 })) : sprite(TEX.agent, 0.32);
    world.add(sp);
    const tg = document.createElement('div'); tg.className = 'ntag ' + n.tip; tg.textContent = n.nume; nodeTagsEl.appendChild(tg);
    // luminiță stinsă = agentul nu are niciun rând în jurnal în ultimele 24 de ore (arhitectura v2, 1.6)
    return { n, sp, tg, tw: 0, lit: n.aprins, r: 4.9 + (i % 3) * 0.35, inc: -0.5 + (i / NODES.length), ph: i * 0.7, sp0: 0.08 + (i % 4) * 0.03, pulse: 0, hot: 0, pos: new V3() };
  });
  const T = Object.fromEntries(team.map(t => [t.n.slug, t]));
  const measureN = () => team.forEach(t => t.tw = t.tg.offsetWidth);
  measureN(); document.fonts && document.fonts.ready.then(measureN);

  // firele rețelei
  const EDGES = [...(hub !== 'alex' ? [['alex', hub]] : []), ...ringIds.map(a => [hub, a])];
  const ePos = new Float32Array(Math.max(1, EDGES.length) * 6);
  const eGeo = new THREE.BufferGeometry(); eGeo.setAttribute('position', new THREE.BufferAttribute(ePos, 3));
  const eMat = new THREE.LineBasicMaterial({ color: '#7CF5C8', transparent: true, opacity: 0, depthWrite: false });
  const edges = new THREE.LineSegments(eGeo, eMat); edges.frustumCulled = false; world.add(edges);
  const aPos = new Float32Array(3 * 6);
  const aGeo = new THREE.BufferGeometry(); aGeo.setAttribute('position', new THREE.BufferAttribute(aPos, 3));
  const aMat = new THREE.LineBasicMaterial({ color: '#E6FFF6', transparent: true, opacity: 0, depthWrite: false });
  const aLines = new THREE.LineSegments(aGeo, aMat); aLines.frustumCulled = false; world.add(aLines);
  const pool = [0, 1, 2].map(() => { const s = sprite(TEX.pulse, 0.26); s.visible = false; world.add(s); return { s, a: null, b: null, t: 1 }; });

  const firstLit = team.find(m => m.lit && m.n.tip === 'agent');
  let activeAgent = firstLit ? firstLit.n.slug : null, liveK = 0, warmK = 0;
  window.__pulse = (from, to) => {
    if (!T[from] || !T[to]) return;
    activeAgent = KIND[from] === 'agent' ? from : (KIND[to] === 'agent' ? to : activeAgent);
    T[from].pulse = 1;
    if (liveK > 0.5 && !reduce){
      const p = pool.find(q => q.t >= 1) || pool[0];
      p.a = T[from]; p.b = T[to]; p.t = 0; p.s.visible = true; p.a.hot = 1; p.b.hot = 1;
    } else T[to].pulse = 0.6;
  };

  /* --- pragul: intri în atelier, nu deschizi un site --- */
  const door = new THREE.Group(); scene.add(door);
  const dMat = new THREE.MeshBasicMaterial({ color: '#7CF5C8', transparent: true, opacity: .6, fog: false });
  [[6, .035, 0, 3.3], [6, .035, 0, -1.5], [.035, 4.8, -3, 0.9], [.035, 4.8, 3, 0.9]].forEach(([w, h, x, y]) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, .035), dMat); b.position.set(x, y, 0); door.add(b); });
  door.position.z = 15;
  let entry = reduce ? 1 : 0;
  setTimeout(() => { entry = 1; }, 3200); // plasă: în tab-uri lente, intrarea se termină oricum

  /* --- poduri: ce explorezi se leagă. Misiunea (D-026) ca gest, nu ca text --- */
  const visited = [], bridges = [];
  const bMat = new THREE.LineBasicMaterial({ color: '#E6FFF6', transparent: true, opacity: .75, depthWrite: false });
  const NB = 16, bA = new V3(), bB = new V3();
  window.__bridge = i => {
    if (!byI[i]) return;
    const prev = visited[visited.length - 1];
    if (prev === i) return;
    if (prev !== undefined && !bridges.some(b => (b.a === prev && b.b === i) || (b.a === i && b.b === prev)) && bridges.length < 10){
      const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array((NB + 1) * 3), 3));
      const line = new THREE.Line(geo, bMat); line.frustumCulled = false; orbit.add(line);
      bridges.push({ a: prev, b: i, g: reduce ? 1 : 0, line, geo });
    }
    visited.push(i);
  };

  /* --- interacțiune --- */
  let ringA = 0, ringT = 0, vel = 0, dragging = false, moved = 0, lastX = 0;
  const px = { x: 0, y: 0 }, pxT = { x: 0, y: 0 };
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  window.__focusRing = i => { if (!byI[i]) return; const target = -byI[i].a; ringT += Math.atan2(Math.sin(target - ringT), Math.cos(target - ringT)); vel = 0; };
  canvas.addEventListener('pointerdown', e => { dragging = true; moved = 0; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); canvas.classList.add('dragging'); });
  canvas.addEventListener('pointermove', e => {
    pxT.x = e.clientX / innerWidth - 0.5; pxT.y = e.clientY / innerHeight - 0.5;
    if (!dragging) return;
    const dx = e.clientX - lastX; lastX = e.clientX; moved += Math.abs(dx);
    if (!open && liveK < 0.5){ ringT += dx * 0.006; vel = dx * 0.006; }
  });
  canvas.addEventListener('pointerup', e => {
    dragging = false; canvas.classList.remove('dragging');
    if (moved >= 6 || liveK > 0.5) return;
    ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const targets = items.map(o => o.holder); if (D.centru) targets.push(inv);
    const hit = ray.intersectObjects(targets, true).find(h => !h.object.isSprite);
    if (!hit) return;
    let o = hit.object; while (o && o.userData.i === undefined && o !== inv) o = o.parent;
    if (o && o.userData.i !== undefined) select(o.userData.i);
    else if (o === inv && !open) setOpen(true);
  });

  function resize(){
    renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight;
    camera.fov = innerWidth < 760 ? 46 : 35; camera.updateProjectionMatrix();
  }
  addEventListener('resize', () => { resize(); measure(); measureN(); });
  resize();

  /* --- buclă --- */
  const v = new V3(), zero = new V3(), offRight = new V3(1.38, 0, 0);
  const heroEl = $('.hero'), featEl = $('.feature'), partEls = [...document.querySelectorAll('#parts li')], agentTag = $('#agentTag');
  const rectOf = el => el ? el.getBoundingClientRect() : { right: -1e4, bottom: -1e4, top: 1e4 };
  let hr = rectOf(heroEl), fr = rectOf(featEl);
  const comp = { x: 0, y: 0, z: 10, l: 0 };
  let explode = 0, last = performance.now(), t = 0, running = true, frame = 0, fAcc = 0, fN = 0;
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running){ last = performance.now(); requestAnimationFrame(loop); } });
  const damp = (a, b, k, dt) => a + (b - a) * (1 - Math.exp(-k * dt));
  const toScreen = (obj, off) => { v.copy(off); obj.localToWorld(v); v.project(camera); return { x: (v.x * .5 + .5) * innerWidth, y: (-v.y * .5 + .5) * innerHeight, z: v.z }; };

  function loop(now){
    if (!running) return;
    frame++;
    const sheet = body.classList.contains('sheet');
    const mode = selected >= 0 ? INTENTS[selected].k : '';
    // pe telefon, cu un panou deschis și scena liniștită, desenăm la jumătate din cadre
    if (coarse && sheet && mode !== 'live' && liveK < 0.01 && Math.abs(warmK - (mode === 'povesti' ? 1 : 0)) < 0.01 && (frame & 1)){ requestAnimationFrame(loop); return; }
    const raw = (now - last) / 1000; last = now;
    const dt = Math.min(0.2, raw); t += dt;
    // pixeli adaptivi: dacă media cadrelor trece de ~26 ms, scădem rezoluția (minimum 1)
    fAcc += raw; fN++;
    if (fN >= 90){ const avg = fAcc / fN; window.__perf.avgMs = Math.round(avg * 1000);
      if (avg > 0.026 && dpr > 1){ dpr = Math.max(1, dpr - 0.25); renderer.setPixelRatio(dpr); resize(); window.__perf.dpr = dpr; }
      fAcc = 0; fN = 0; }
    if (frame % 30 === 0){ hr = rectOf(heroEl); fr = rectOf(featEl); }

    const narrow = innerWidth < 760;
    const K = reduce ? 60 : 4.5;
    const live = mode === 'live', warm = mode === 'povesti', know = mode === 'knowledge';
    liveK = damp(liveK, live ? 1 : 0, reduce ? 60 : 2.6, dt);
    warmK = damp(warmK, warm ? 1 : 0, reduce ? 60 : 2.2, dt);
    explode = damp(explode, open ? 1 : 0, reduce ? 60 : 3.2, dt);

    // compoziția
    let tx, ty, tz;
    if (open){ tx = narrow ? 0 : 0.9; ty = narrow ? 1.9 : -0.05; tz = narrow ? 15 : 8.6; }
    else if (live){ tx = narrow ? 0 : -1.6; ty = narrow ? 2.1 : 0.05; tz = narrow ? 14 : 9.4; }
    else { tx = narrow ? 0 : (selected >= 0 ? 0.2 : 2.2); ty = narrow ? (selected >= 0 ? 1.7 : -0.3) : -0.1; tz = narrow ? (selected >= 0 ? 16 : 15) : 10.5; }
    comp.x = damp(comp.x, tx, K, dt); comp.y = damp(comp.y, ty, K, dt); comp.z = damp(comp.z, tz, K, dt);
    world.position.set(comp.x, comp.y, 0);
    if (!reduce && !coarse){ px.x = damp(px.x, pxT.x, 3, dt); px.y = damp(px.y, pxT.y, 3, dt); }
    entry = Math.min(1, entry + dt / 2.2);
    const ee = 1 - Math.pow(1 - entry, 3);
    door.visible = entry < 1;
    camera.position.set(px.x * 0.9, 1.4 - px.y * 0.6 + liveK * 0.2, comp.z + (1 - ee) * 10);
    comp.l = damp(comp.l, narrow ? (selected >= 0 ? -1.6 : 0) : liveK * 0.15, K, dt);
    camera.lookAt(world.position.x * 0.35, world.position.y * 0.5 + comp.l, 0);

    // lumina caldă pentru Ce m-a crescut
    scene.background.lerpColors(BG, WARM, warmK); scene.fog.color.copy(scene.background);
    hemi.color.lerpColors(C.hemi, C.hemiW, warmK); key.color.lerpColors(C.key, C.keyW, warmK);
    glow.color.lerpColors(C.glow, C.glowW, warmK); floorMat.color.lerpColors(C.floor, C.floorW, warmK);

    // orbita
    if (!dragging){
      if (Math.abs(vel) > 0.0001){ ringT += vel; vel *= 0.92; }
      else if (!reduce && selected < 0 && !open) ringT += dt * 0.07;
    }
    ringA = damp(ringA, ringT, reduce ? 60 : 5, dt);
    const hide = Math.max(explode, liveK);
    items.forEach((o, j) => {
      const i = o.i;
      const a = o.a + ringA, rr = R * (1 + 0.45 * explode);
      o.ly = damp(o.ly || 0, narrow && i === selected ? 2.2 : 0, K, dt); // pe telefon, obiectul ales urcă deasupra panoului
      o.holder.position.set(Math.sin(a) * rr, -0.25 + o.ly + Math.sin(t * 0.6 + j) * (reduce ? 0 : 0.06), Math.cos(a) * rr);
      const target = (open || live) ? 0.001 : (i === selected ? 1.35 : 1);
      o.s = damp(o.s, (open && !narrow) ? 0.55 : target, 6, dt); o.holder.scale.setScalar(Math.max(0.001, o.s));
      if (!reduce){ o.m.rotation.y += dt * o.spin * (o.k === 'knowledge' && know ? 0.3 : 1); if (o.k !== 'knowledge' && o.k !== 'povesti') o.m.rotation.x += dt * o.spin * 0.4; }
      const p = toScreen(o.holder, zero);
      o.tag.style.opacity = (hide > 0.1) ? 0 : (Math.cos(a) > 0.15 ? 1 : 0);
      o.tag.classList.toggle('on', i === selected);
      o.tag.style.transform = `translate(${(p.x - o.w / 2).toFixed(1)}px,${(p.y + 34 - (narrow ? 6 : 0)).toFixed(1)}px)`;
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
    bMat.color.setRGB(0.9 + warmK * 0.1, 1 - warmK * 0.2, 0.96 - warmK * 0.4);
    liveInner.forEach(l => { const a = (reduce ? 0 : t * 1.4) + l.ph; l.s.position.set(Math.cos(a) * 0.2, Math.sin(a * 1.3) * 0.14, Math.sin(a) * 0.2); });
    const spread = know ? 1 : 0;
    plates.forEach((pl, i) => {
      const y = (i - 1.5) * (0.085 + 0.17 * spread);
      pl.p.position.y = damp(pl.p.position.y, y, reduce ? 60 : 5, dt);
      pl.p.rotation.y = damp(pl.p.rotation.y, i * 0.22 * spread, reduce ? 60 : 4, dt);
    });
    if (pebble){ const b = reduce ? 1 : 1 + Math.sin(t * 0.9) * 0.025; pebble.scale.set(1.15 * b, 0.72 * b, b); pebbleHalo.material.opacity = 0.35 + warmK * 0.4; }

    // invenția din centru
    comp.inv = damp(comp.inv ?? 1, narrow && selected >= 0 ? 0.001 : 1, K, dt);
    inv.scale.setScalar(Math.max(0.001, 0.88 * (1 - liveK) * comp.inv));
    inv.rotation.x = 0.95 + (0.32 - 0.95) * explode;
    inv.rotation.y = (reduce ? 0 : Math.sin(t * 0.25) * 0.12) * (1 - explode);
    L.forEach(l => { l.m.position.y = l.y0 + (l.y1 - l.y0) * explode; });
    core.rotation.y = (reduce ? 0 : t * 0.5) + explode * 1.15;
    ring.rotation.y = explode * 0.4;
    if (D.centru && explode > 0.02 && !narrow){
      [L[4], L[3], L[2], L[1], L[0]].forEach((l, i) => {
        const el = partEls[i]; if (!el) return;
        const p = toScreen(l.m, offRight);
        el.style.setProperty('--x', (p.x + 36) + 'px');
        el.style.transform = `translate(${(p.x + 36).toFixed(1)}px,${(p.y - el.offsetHeight / 2).toFixed(1)}px)`;
      });
    }

    // echipa: pe orbită sau în rețea
    team.forEach((m, i) => {
      const ang = m.ph + (reduce ? 0 : t * m.sp0);
      const ox = Math.sin(ang) * m.r, oz = Math.cos(ang) * m.r;
      v.set(ox, 0.3 + oz * Math.sin(m.inc) * 0.35 + Math.sin(ang * 2) * 0.2, oz * Math.cos(m.inc));
      const k = m.n.tip === 'alex' ? 1 : liveK;
      m.pos.copy(v).lerp(NET[m.n.slug] || v, k);
      if (!reduce && liveK > 0.5) m.pos.y += Math.sin(t * 0.8 + i) * 0.03;
      m.sp.position.copy(m.pos);
      m.pulse = Math.max(0, m.pulse - dt * 0.6); m.hot = Math.max(0, m.hot - dt * 0.45);
      let s = 0.3 + m.pulse * 0.5 + (m.n.slug === activeAgent && liveK < 0.5 ? 0.12 : 0) + liveK * 0.08;
      if (m.n.tip === 'alex') s = liveK + 0.001;
      m.sp.scale.setScalar(s);
      if (m.sp.isSprite) m.sp.material.opacity = (m.lit || m.hot > 0.05 ? 1 : 0.25) * (1 - warmK * 0.7);
    });
    if (liveK > 0.01){
      EDGES.forEach(([a, b], j) => { const A = T[a].pos, B = T[b].pos; ePos.set([A.x, A.y, A.z, B.x, B.y, B.z], j * 6); });
      eGeo.attributes.position.needsUpdate = true;
    }
    eMat.opacity = liveK * 0.3;
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
      m.tg.style.transform = `translate(${Math.max(4, Math.min(innerWidth - m.tw - 4, p.x - m.tw / 2)).toFixed(1)}px,${(p.y + (m.n.tip === 'alex' ? 16 : 11)).toFixed(1)}px)`;
    });
    // eticheta agentului activ, pe orbită (doar dacă a lucrat în ultimele 24 de ore)
    if (activeAgent && T[activeAgent]){
      const aa = T[activeAgent], ap = toScreen(aa.sp, zero);
      agentTag.textContent = aa.n.nume;
      const overUI = (ap.x < hr.right + 20 && ap.y < hr.bottom + 10) || (ap.x < fr.right + 20 && ap.y > fr.top - 30) || (sheet && !narrow && ap.x > innerWidth - 480);
      agentTag.style.opacity = (open || liveK > 0.1 || warmK > 0.3 || ap.z > 1 || overUI || narrow && sheet) ? 0 : 0.95;
      agentTag.style.transform = `translate(${(ap.x + 12).toFixed(1)}px,${(ap.y - 22).toFixed(1)}px)`;
    }

    renderer.render(scene, camera);
    if (!canvas.classList.contains('ready')) canvas.classList.add('ready');
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}
