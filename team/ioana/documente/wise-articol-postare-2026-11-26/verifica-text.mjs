// Comparația automată: textul din HTML (articolul și postarea) trebuie să fie identic, cuvânt cu cuvânt, cu sursele.
// Rulare: node verifica-text.mjs <fișier.html>   → „IDENTIC” sau prima diferență, cu cod de ieșire 1.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '../../../..');
const sec = (md, a, stop) => { const r = md.slice(md.indexOf(a) + a.length); return r.slice(0, r.search(stop)); };
const art = sec(readFileSync(join(R, 'team/sofia/documente/drafts/wise-teams-articol-1-2026-11-20.md'), 'utf8'), '## Textul pentru Substack (EN)', /\n---\s*\n/);
const post = sec(readFileSync(join(R, 'team/sofia/documente/drafts/linkedin-workshop-wise-2026-11-25.md'), 'utf8'), '## Postarea (RO)', /\n## /);
const curat = t => t.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  .replace(/^#+ /gm, '').replace(/^\* /gm, '').replace(/\*\*/g, '').replace(/\*/g, '').split(/\s+/).filter(Boolean).join(' ');
const ent = s => s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
const text = h => ent(h.replace(/<svg[\s\S]*?<\/svg>/g, ' ').replace(/<br>/g, ' ').replace(/<[^>]+>/g, ' ')).split(/\s+/).filter(Boolean).join(' ')
  .replace(/\s+([,.:;?!])/g, '$1');
const H = readFileSync(process.argv[2], 'utf8');
const corp = H.slice(H.indexOf('<body>'));
const a = text(corp.slice(corp.indexOf('<h1>'), corp.indexOf('</article>')).replace(/<span class="dest">[^<]*<\/span>/, ''));
const p = text(corp.slice(corp.indexOf('<div class="autor">'), corp.indexOf('<div class="nota">'))).replace(/^Alexandru Molea Wise Teams /, '');
let ok = true;
for (const [n, x, y] of [['articol', curat(art), a], ['postare', curat(post), p]]) {
  if (x === y) { console.log(n + ': IDENTIC cu sursa (' + x.split(' ').length + ' cuvinte)'); continue; }
  ok = false; let i = 0; while (x[i] === y[i]) i++;
  console.log(n + ': DIFERIT la caracterul ' + i + '\n  sursa: …' + x.slice(i - 50, i + 50) + '\n  html:  …' + y.slice(i - 50, i + 50));
}
process.exit(ok ? 0 : 1);
