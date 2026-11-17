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
  const scena = Object.fromEntries(Object.keys(src.scena).map(k => [k, resolve('scena', k).hex]));

  const rgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
  const get = name => { // culoarea de bază (fără transparență): „accent” sau „scena.glass-disc”
    const [grp, key] = name.startsWith('scena.') ? ['scena', name.slice(6)] : ['culori', name];
    const v = (grp === 'culori' ? culori : scena)[key];
    if (!v) throw new Error(`${FILE}: rolul „${name}” nu există, dar e folosit în cod.`);
    return v;
  };

  return {
    culori, scena, get,
    // ex.: rgba('accent', '.22') → "rgba(124,245,200,.22)", pentru SVG-uri scrise în HTML
    rgba: (name, a) => `rgba(${rgb(get(name)).join(',')},${a})`,
    // :root cu fiecare rol de două ori: --accent:#7CF5C8 și --accent-rgb:124 245 200 (baza, pentru alte transparențe)
    css: () => `/* Generat din ${FILE}. Nu edita aici. */\n:root{\n${Object.entries(full).map(([k, { hex, a }]) => {
      const c = rgb(hex).join(' ');
      return `  --${k}:${a === undefined ? hex : `rgb(${c} / ${a})`}; --${k}-rgb:${c};`; }).join('\n')}\n}\n`,
    // șabloane SVG: {{accent}} sau {{scena.glass-disc}} → codul hex
    fill: (text, where) => text.replace(/\{\{\s*([a-z0-9_.-]+)\s*\}\}/gi, (m, name) => {
      try { return get(name); } catch (e) { throw new Error(`${where}: ${e.message}`); }
    })
  };
}

// Verifică faptul că tot ce cere codul există în temă: var(--x) în CSS, COL.x / SC['x'] în scenă.
export function checkUsage(tema, { css, js }){
  const defined = new Set(Object.keys(tema.culori).flatMap(k => [k, k + '-rgb']));
  for (const m of css.matchAll(/--([a-z0-9-]+)\s*:/gi)) defined.add(m[1]);
  const missing = new Set();
  for (const m of css.matchAll(/var\(--([a-z0-9-]+)\s*\)/gi)) // cu valoare de rezervă, var(--x,0) nu cere temă
    if (!defined.has(m[1])) missing.add(`--${m[1]} (site.css)`);
  const keys = re => [...js.matchAll(re)].map(m => m[1] || m[2]);
  for (const k of keys(/\bCOL(?:\.([a-z0-9_]+)|\[['"]([a-z0-9-]+)['"]\])/gi)) if (!own(tema.culori, k)) missing.add(`culori.${k} (scena.js)`);
  for (const k of keys(/\bSC(?:\.([a-z0-9_]+)|\[['"]([a-z0-9-]+)['"]\])/gi)) if (!own(tema.scena, k)) missing.add(`scena.${k} (scena.js)`);
  if (missing.size) throw new Error(`${FILE}: lipsesc rolurile ${[...missing].join(', ')}.`);
}
