// Server local pentru verificare: servește site/dist exact ca GitHub Pages, sub baza SITE_BASE (implicit „/”).
// Folosire: npm run build && npm run serve   →   http://localhost:4321/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('./dist/', import.meta.url));
const PORT = Number(process.env.PORT || process.argv[2] || 4321);
let BASE = process.env.SITE_BASE || '/'; if (!BASE.endsWith('/')) BASE += '/';
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (!path.startsWith(BASE)) { res.writeHead(302, { Location: BASE }); return res.end(); }
  path = normalize(path.slice(BASE.length)).replace(/^(\.\.[/\\])+/, '');
  let file = join(DIST, path);
  try { if ((await stat(file)).isDirectory()) file = join(file, 'index.html'); } catch {}
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'Content-Type': TYPES['.html'] });
    res.end(await readFile(join(DIST, '404.html')).catch(() => 'Nu există.'));
  }
}).listen(PORT, () => console.log(`Site local: http://localhost:${PORT}${BASE}`));
