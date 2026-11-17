// Tema: culorile site-ului, dintr-un singur loc (content/tema.yml).
// Folosit de build.mjs (CSS, scenă, theme-color, favicon) și de imagini.mjs (og.png, apple-touch-icon.png).
// Orice greșeală aruncă o eroare cu mesaj clar; build-ul se oprește.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const FILE = 'content/tema.yml';
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const own = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

export function loadTema(root){
  let raw;
  try { raw = parseYaml(readFileSync(join(root, FILE), 'utf8')) || {}; } catch (e) { throw new Error(`${FILE}: nu pot citi fișierul (${e.message})`); }
  const src = { culori: raw.culori || {}, scena: raw.scena || {} };
  // o pereche [sus, jos] în scenă (gradientul unui obiect) se rezolvă ca două roluri ascunse: obj-x.0, obj-x.1
  for (const [k, v] of Object.entries(src.scena)) if (Array.isArray(v)){
    if (v.length !== 2) throw new Error(`${FILE}: scena.${k} are nevoie de exact două culori, [sus, jos].`);
    v.forEach((c, i) => { src.scena[`${k}.${i}`] = c; });
    delete src.scena[k];
  }
  if (!Object.keys(src.culori).length) throw new Error(`${FILE}: lipsește lista „culori”.`);

  // Valoarea: „#hex”, „rol”, „#hex / .14” sau „rol / .94”. Un rol se caută întâi în `culori`, apoi în `scena`.
  // Rezultatul: { hex: '#RRGGBB', a: '.14' } (a lipsește când culoarea e plină).
  const resolve = (grp, key, seen = []) => {
    const id = `${grp}.${key}`;
    if (seen.includes(id)) throw new Error(`${FILE}: trimiterile se rotesc în cerc (${[...seen, id].join(' → ')}).`);
    const v = String(src[grp][key] ?? '').trim();
    const m = v.match(/^([^\s/]+)\s*(?:\/\s*(\S+))?$/);
    const bad = msg => new Error(`${FILE}: ${id} = „${v}”. ${msg}`);
    if (!m) throw bad('Scrie un cod hex (de exemplu #7CF5C8) sau numele altui rol, eventual cu „/ .5” pentru transparență.');
    const [, base, a] = m;
    if (a !== undefined && !(/^(0|1|0?\.\d+|1\.0+)$/.test(a))) throw bad('Transparența e un număr între 0 și 1, de exemplu „/ .14”.');
    if (a !== undefined && grp === 'scena') throw bad('Scena 3D nu folosește transparențe aici.');
    let out;
    if (HEX.test(base)) out = { hex: (base.length === 4 ? '#' + [...base.slice(1)].map(c => c + c).join('') : base).toUpperCase() };
    else if (own(src.culori, base)) out = { ...resolve('culori', base, [...seen, id]) };
    else if (own(src.scena, base)) out = { ...resolve('scena', base, [...seen, id]) };
    else throw bad('Trebuie un cod hex (de exemplu #7CF5C8) sau numele altui rol.');
    if (a !== undefined) out.a = a;
    if (grp === 'scena' && out.a !== undefined) throw bad(`Trimite la un rol transparent; scena 3D are nevoie de o culoare plină.`);
    return out;
  };
  const full = Object.fromEntries(Object.keys(src.culori).map(k => [k, resolve('culori', k)]));
  const culori = Object.fromEntries(Object.entries(full).map(([k, v]) => [k, v.hex]));
  const scena = {};
  for (const k of Object.keys(src.scena)){
    const hex = resolve('scena', k).hex, m = k.match(/^(.+)\.([01])$/);
    if (m) (scena[m[1]] ||= [])[+m[2]] = hex; else scena[k] = hex;
  }

  // Valoare liberă (în `mesh` și `contrast`): același format, rezolvată prin culori.
  const value = (v, where) => {
    src.culori['\u0000'] = v;
    try { return resolve('culori', '\u0000'); }
    catch (e) { throw new Error(e.message.replace('culori.\u0000', where)); }
    finally { delete src.culori['\u0000']; }
  };
  const rgb3 = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));

  // Gradientul de fundal: pete radiale peste o bază. Devine --mesh-<nume> în CSS.
  const POS = /^-?\d+(\.\d+)?% -?\d+(\.\d+)?%$/;
  const mesh = {};
  for (const [name, m] of Object.entries(raw.mesh || {})){
    const where = `mesh.${name}`;
    if (!m || !m.baza || !Array.isArray(m.pete)) throw new Error(`${FILE}: ${where} are nevoie de „baza” și de lista „pete”.`);
    const baza = value(m.baza, `${where}.baza`);
    if (baza.a !== undefined) throw new Error(`${FILE}: ${where}.baza trebuie să fie o culoare plină.`);
    const pete = m.pete.map((p, i) => {
      if (!Array.isArray(p) || p.length !== 3 || !POS.test(String(p[1])) || !POS.test(String(p[2]))) throw new Error(`${FILE}: ${where}.pete[${i + 1}] se scrie [culoare, "x% y%", "lățime% înălțime%"].`);
      return { ...value(p[0], `${where}.pete[${i + 1}]`), at: String(p[1]), size: String(p[2]) };
    });
    mesh[name] = { baza: baza.hex, pete };
  }
  const meshCss = ({ baza, pete }) => [...pete.map(p => { const c = rgb3(p.hex).join(' ');
    return `radial-gradient(${p.size} at ${p.at},rgb(${c} / ${p.a ?? 1}) 0%,rgb(${c} / 0) 70%)`; }), baza].join(',');

  // Fonturile, pe roluri: --font-titluri, --font-text
  const FONTURI = { 'Sora': 'sora', 'Inter Tight': 'inter-tight' }; // numele familiei → pachetul @fontsource-variable
  const fonturi = {};
  for (const rol of ['titluri', 'text']){
    const f = String((raw.fonturi || {})[rol] || '').trim();
    if (!FONTURI[f]) throw new Error(`${FILE}: fonturi.${rol} = „${f}”. Fonturile găzduite pe site: ${Object.keys(FONTURI).join(', ')}.`);
    fonturi[rol] = { nume: f, pachet: FONTURI[f] };
  }

  // Contrastul (WCAG 2.2): o culoare transparentă e pusă peste fiecare culoare din fiecare gradient.
  const lum = c => { const v = c.map(x => { x /= 255; return x <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; }); return .2126 * v[0] + .7152 * v[1] + .0722 * v[2]; };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
  const over = (top, a, bot) => top.map((v, i) => v * a + bot[i] * (1 - a));
  const backdrops = Object.values(mesh).flatMap(({ baza, pete }) => [rgb3(baza), ...pete.map(p => over(rgb3(p.hex), +(p.a ?? 1), rgb3(baza)))]);
  const contrast = [];
  for (const [i, row] of (raw.contrast || []).entries()){
    if (!Array.isArray(row) || row.length !== 3 || !(+row[2] > 1)) throw new Error(`${FILE}: contrast[${i + 1}] se scrie [text, fundal, prag], de exemplu [text, glass, 4.5].`);
    const fg = value(row[0], `contrast[${i + 1}]`), bg = value(row[1], `contrast[${i + 1}]`);
    if (fg.a !== undefined) throw new Error(`${FILE}: contrast[${i + 1}]: textul (${row[0]}) trebuie să fie o culoare plină.`);
    const f = rgb3(fg.hex), b = rgb3(bg.hex);
    const worst = bg.a === undefined ? ratio(f, b) : Math.min(...(backdrops.length ? backdrops : [[255, 255, 255]]).map(d => ratio(f, over(b, +bg.a, d))));
    contrast.push({ fg: row[0], bg: row[1], min: +row[2], worst: Math.round(worst * 100) / 100 });
    if (worst < +row[2]) throw new Error(`${FILE}: contrastul ${row[0]} pe ${row[1]} e ${worst.toFixed(2)} în cel mai rău punct al gradientului; trebuie cel puțin ${row[2]}. Închide textul sau fă sticla mai plină.`);
  }

  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const get = name => { // culoarea de bază (fără transparență): „accent”, „scena.ring” sau „scena.obj-live.0”
    const [grp, key] = name.startsWith('scena.') ? ['scena', name.slice(6)] : ['culori', name];
    const m = grp === 'scena' && key.match(/^(.+)\.([01])$/);
    const v = m ? (scena[m[1]] || [])[+m[2]] : (grp === 'culori' ? culori : scena)[key];
    if (!v || typeof v !== 'string') throw new Error(`${FILE}: rolul „${name}” nu există, dar e folosit în cod.`);
    return v;
  };

  return {
    culori, scena, get,
    // ex.: rgba('accent', '.22') → "rgba(124,245,200,.22)", pentru SVG-uri scrise în HTML
    rgba: (name, a) => `rgba(${rgb(get(name)).join(',')},${a})`,
    // :root cu fiecare rol de două ori: --accent:#7CF5C8 și --accent-rgb:124 245 200 (baza, pentru alte transparențe)
    css: () => `/* Generat din ${FILE}. Nu edita aici. */\n:root{\n${Object.entries(full).map(([k, { hex, a }]) => {
      const c = rgb(hex).join(' ');
      return `  --${k}:${a === undefined ? hex : `rgb(${c} / ${a})`}; --${k}-rgb:${c};`; }).join('\n')}\n${Object.entries(mesh).map(([k, m]) => `  --mesh-${k}:${meshCss(m)};`).join('\n')}\n${Object.entries(fonturi).map(([k, f]) => `  --font-${k}:"${f.nume}",${k === 'titluri' ? '"Avenir Next",' : ''}system-ui,-apple-system,"Segoe UI",sans-serif;`).join('\n')}\n}\n`,
    mesh, contrast, fonturi,
    // șabloane SVG: {{accent}} sau {{scena.glass-disc}} → codul hex
    fill: (text, where) => text.replace(/\{\{\s*([a-z0-9_.-]+)\s*\}\}/gi, (m, name) => {
      try { return get(name); } catch (e) { throw new Error(`${where}: ${e.message}`); }
    })
  };
}

// Verifică faptul că tot ce cere codul există în temă: var(--x) în CSS, COL.x / SC['x'] în scenă.
export function checkUsage(tema, { css, js }){
  const defined = new Set([...Object.keys(tema.culori).flatMap(k => [k, k + '-rgb']), ...Object.keys(tema.mesh).map(k => 'mesh-' + k), ...Object.keys(tema.fonturi).map(k => 'font-' + k)]);
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:/gi)) defined.add(m[1]);
  const missing = new Set();
  for (const m of css.matchAll(/var\(--([a-z0-9-]+)\s*\)/gi)) // cu valoare de rezervă, var(--x,0) nu cere temă
    if (!defined.has(m[1])) missing.add(`--${m[1]} (site.css)`);
  const keys = re => [...js.matchAll(re)].map(m => m[1] || m[2]);
  for (const k of keys(/\bCOL(?:\.([a-z0-9_]+)|\[['"]([a-z0-9-]+)['"]\])/gi)) if (!own(tema.culori, k)) missing.add(`culori.${k} (scena.js)`);
  for (const k of keys(/\bSC(?:\.([a-z0-9_]+)|\[['"]([a-z0-9-]+)['"]\])/gi)) if (!own(tema.scena, k)) missing.add(`scena.${k} (scena.js)`);
  if (missing.size) throw new Error(`${FILE}: lipsesc rolurile ${[...missing].join(', ')}.`);
}
