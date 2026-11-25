// O pagină HTML din repo (ex.: docs/procese/curs-nou-vizual.html) devine o pagină a site-ului, fără o a doua copie.
// Sursa rămâne cum e (un fragment cu <style> și conținut, ca un artifact). La build:
//  - scoatem <title>, <meta>, <link> (fonturile de pe Google Fonts: site-ul are Sora și Inter Tight locale);
//  - prefixăm clasele (pr-…), ca să nu se lovească de clasele site-ului (.hero, .col, .lead, .dot…);
//  - închidem tot stilul sub clasa paginii (:root și body devin .proces, h1 devine .proces h1);
//  - atributele style="…" devin clase generate (CSP-ul site-ului are style-src 'self', fără stil inline);
//  - @keyframes primesc și ele prefixul (pr-nume), ca să nu se lovească de animațiile site-ului.
// <title> devine titlul din tab, iar <meta name="description"> descrierea paginii (pentru căutare și previzualizări).
// Ce nu se poate face sigur oprește build-ul: <script>, @import, resurse de pe alte site-uri.

const PREFIX = 'pr-';
const pref = cls => cls.split(/\s+/).filter(Boolean).map(c => PREFIX + c).join(' ');

// prefixează clasele dintr-un selector și îl închide sub `scope`
function scopeSelector(sel, scope){
  return sel.split(',').map(s => {
    s = s.trim().replace(/\.(-?[A-Za-z_][\w-]*)/g, (_, c) => '.' + PREFIX + c);
    if (s === ':root' || s === 'body' || s === 'html') return scope;
    if (/^(:root|body|html)\b/.test(s)) return scope + s.replace(/^(:root|body|html)/, '');
    return `${scope} ${s}`;
  }).join(',');
}

// numele animațiilor din `animation` / `animation-name` primesc prefixul, la fel ca @keyframes
const renameAnimations = (body, names) => names.length ? body.replace(/(animation(?:-name)?\s*:)([^;]*)/gi,
  (_, p, v) => p + v.replace(new RegExp(`(^|[\\s,])(${names.join('|')})(?=$|[\\s,])`, 'g'), (m, a, n) => a + PREFIX + n)) : body;

// regulile de la nivelul de sus, cu @media recursiv; comentariile se scot
function scopeCss(css, scope, where, names){
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  names ??= [...css.matchAll(/@keyframes\s+([A-Za-z_][\w-]*)/g)].map(m => m[1]);
  let out = '', i = 0;
  while (i < css.length){
    const open = css.indexOf('{', i);
    if (open < 0) break;
    const head = css.slice(i, open).trim();
    // găsește acolada care închide blocul
    let depth = 1, j = open + 1;
    while (j < css.length && depth){ if (css[j] === '{') depth++; else if (css[j] === '}') depth--; j++; }
    const body = css.slice(open + 1, j - 1);
    if (head.startsWith('@media') || head.startsWith('@supports')) out += `${head}{${scopeCss(body, scope, where, names)}}`;
    else if (/^@keyframes\s+[A-Za-z_][\w-]*$/.test(head)) out += `@keyframes ${PREFIX}${head.split(/\s+/)[1]}{${body.trim()}}\n`;
    else if (head.startsWith('@')) throw new Error(`${where}: regula „${head}” nu e permisă pe site.`);
    else if (head) out += `${scopeSelector(head, scope)}{${renameAnimations(body.trim(), names)}}\n`;
    i = j;
  }
  return out;
}

export function citestePagina(raw, { scope, where }){
  const err = m => { throw new Error(`${where}: ${m}`); };
  if (/<script\b/i.test(raw)) err('are <script>. Pe site, paginile din repo nu rulează cod.');
  const styles = [...raw.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(m => m[1]).join('\n');
  if (/@import\b/i.test(styles)) err('stilul are @import. Fonturile vin de pe site.');
  const titlu = (raw.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || '';
  const descriere = (raw.match(/<meta\s+name\s*=\s*["']description["']\s+content\s*=\s*"([^"]*)"/i) || [])[1]?.trim() || '';
  let html = raw.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<title>[\s\S]*?<\/title>/gi, '')
    .replace(/<(meta|link)\b[^>]*>/gi, '')
    .replace(/<!doctype[^>]*>|<\/?(html|head|body)\b[^>]*>/gi, '')
    .trim();
  if (/\b(src|href|srcset|poster)\s*=\s*["']?\s*(https?:)?\/\//i.test(html) || /url\(\s*["']?\s*(https?:)?\/\//i.test(styles + html)) err('încarcă resurse de pe alt site. Pe site totul e local.');
  // style="…" → clase generate (aceeași valoare = aceeași clasă), cu !important ca să păstreze puterea stilului inline
  const inline = new Map();
  html = html.replace(/\sstyle\s*=\s*"([^"]*)"/gi, (_, decl) => {
    const d = decl.trim().replace(/;$/, '');
    if (!inline.has(d)) inline.set(d, `s${inline.size + 1}`);
    return ` data-pr-style="${inline.get(d)}"`;
  });
  // clasele: prefixate; clasa de stil inline se adaugă la clasele elementului
  html = html.replace(/<([a-z][\w-]*)\b([^>]*)>/gi, (tag, name, attrs) => {
    let extra = '';
    attrs = attrs.replace(/\sdata-pr-style="(s\d+)"/, (_, s) => { extra = PREFIX + s; return ''; });
    let has = false;
    attrs = attrs.replace(/\sclass\s*=\s*"([^"]*)"/i, (_, c) => { has = true; return ` class="${[pref(c), extra].filter(Boolean).join(' ')}"`; });
    if (!has && extra) attrs += ` class="${extra}"`;
    return `<${name}${attrs}>`;
  });
  const important = d => d.split(';').map(x => x.trim()).filter(Boolean).map(x => /!important$/.test(x) ? x : `${x}!important`).join(';');
  const css = scopeCss(styles, scope, where) + [...inline].map(([d, s]) => `${scope} .${PREFIX}${s}{${important(d)}}`).join('\n');
  return { titlu, descriere, html, css };
}
