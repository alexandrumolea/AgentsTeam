// Imaginea de previzualizare a unei pagini de curs (og:image, 1200×630), în stilul variantei A a Ioanei (T-057,
// team/ioana/documente/og-change-agility/gen.mjs): în stânga titlul și subtitlul, în dreapta „Pleci acasă cu” din pagină.
// Textul se ia din pagina elementului (câmpul `pagina` din content/categorii.yml), deci o singură sursă: schimbi subtitlul în pagină,
// rulezi din nou comanda și imaginea e la zi. Mărimile literelor se potrivesc singure, ca titlurile lungi să încapă.
//
// Rulare, din site/ (după un `npm run build`, pentru granulația fundalului; randare doar în Chrome headless, fără ferestre):
//   node previzualizare.mjs <slug>                 ex.: node previzualizare.mjs listening-leading
//   node previzualizare.mjs <slug> --sub "Alt subtitlu"  --titlu "Alt titlu"   (opțional, doar în imagine; ex. un titlu prea lung)
// Ieșire: site/static/previzualizari/<slug>.png. Apoi, în content/categorii.yml, la element: imagine_linkedin: previzualizari/<slug>.png
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadTema } from './tema.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '..');
const [slug, ...rest] = process.argv.slice(2);
const fail = m => { console.error('Eroare: ' + m); process.exit(1); };
if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug || '')) fail('scrie slug-ul paginii, ex.: node previzualizare.mjs change-agility');
const opt = k => { const i = rest.indexOf(k); return i >= 0 ? String(rest[i + 1] || '').replace(/&/g, '&amp;').replace(/</g, '&lt;') : ''; };
const { parse } = await import('yaml');
const el = (parse(readFileSync(join(ROOT, 'content/categorii.yml'), 'utf8')).categorii || []).flatMap(c => c.elemente || []).find(e => e.slug === slug && e.pagina);
if (!el) fail(`în content/categorii.yml nu există un element cu slug: ${slug} și pagina`);
const sursa = join(ROOT, el.pagina);
if (!existsSync(sursa)) fail(`nu găsesc ${el.pagina}`);
const { launch } = await import(pathToFileURL(join(ROOT, 'curs/teste/cdp.mjs')).href);

// textele din pagină: h1, .sub, iar din <aside class="plan">: titlul (.cap b) și cele trei rânduri (.rand b)
const html = readFileSync(sursa, 'utf8');
const text = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const unul = re => { const m = html.match(re); return m ? text(m[1]) : ''; };
const aside = (html.match(/<aside\b[^>]*class="[^"]*\bplan\b[^"]*"[^>]*>([\s\S]*?)<\/aside>/) || [])[1] || '';
const T = {
  titlu: opt('--titlu') || unul(/<h1[^>]*>([\s\S]*?)<\/h1>/),
  sub: opt('--sub') || unul(/<p class="sub">([\s\S]*?)<\/p>/),
  linii: /class="linii"/.test(aside),   // rândurile cu linii de scris (un plan); fără ele, doar rândurile
  cap: text((aside.match(/<div class="cap">[\s\S]*?<b>([\s\S]*?)<\/b>/) || [])[1] || ''),
  plan: [...aside.matchAll(/<div class="rand[^"]*">[\s\S]*?<b>([\s\S]*?)<\/b>/g)].map(m => text(m[1])),
};
if (!T.titlu || !T.sub || !T.cap || T.plan.length !== 3) fail(`în ${el.pagina} lipsește ceva din: <h1>, <p class="sub">, <aside class="plan"> cu .cap b și trei .rand b.`);

const tema = loadTema(ROOT);
const F = p => pathToFileURL(join(HERE, 'node_modules/@fontsource-variable', p)).href;
const grain = join(HERE, 'dist/assets/grain.png');
const css = `
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 800;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
${tema.css()}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;background:var(--mesh-pagini);color:var(--text);font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
body::after{content:"";position:absolute;inset:0;background:${existsSync(grain) ? `url(${pathToFileURL(grain).href})` : 'none'};opacity:.38;mix-blend-mode:overlay;pointer-events:none}
.sticla{position:absolute;background:var(--glass-read);border:1.5px solid var(--glass-edge);border-radius:36px;overflow:hidden;
  box-shadow:inset 0 1.5px 0 rgb(255 255 255/.85),0 24px 60px -30px rgb(var(--umbra-rgb)/.45)}
.marca{display:flex;align-items:baseline;gap:.75em;margin-bottom:28px;text-transform:uppercase;color:var(--muted);white-space:nowrap;font-size:25px}
.marca b{font:400 1em/1 Sora,sans-serif;letter-spacing:.2em;color:var(--text)}
.marca span{font:500 .86em/1 "Inter Tight",sans-serif;letter-spacing:.24em}
.punct{display:inline-block;width:18px;height:18px;border-radius:50%;background:var(--punct);box-shadow:0 0 0 2px var(--punct-inel)}
.n{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font:600 26px/1 "Inter Tight",sans-serif;color:var(--accent);background:#fff;border:3px solid var(--cer);flex:none}
.scris{height:0;border-top:3.5px solid var(--accent);border-radius:2px}
.st{left:52px;top:52px;width:604px;height:526px;padding:52px 52px;display:flex;flex-direction:column}
.st h1{margin-top:auto;font:200 120px/.98 Sora,sans-serif;letter-spacing:-.035em}
.st .sub{margin-top:24px;font:300 46px/1.18 Sora,sans-serif;letter-spacing:-.01em;color:var(--accent);text-wrap:balance}
.plan{left:688px;top:88px;width:464px;height:450px;padding:40px 38px 34px;transform:rotate(1.6deg);display:flex;flex-direction:column;justify-content:center;gap:24px}
.plan .punct{position:absolute;right:34px;top:38px}
.plan .cap{font:300 36px/1.12 Sora,sans-serif;letter-spacing:-.01em;padding-right:40px}
.rand{display:grid;grid-template-columns:58px 1fr;gap:10px 18px;align-items:center}
.rand b{font:600 32px/1.15 "Inter Tight",sans-serif;letter-spacing:-.01em;text-wrap:balance}
.rand .l{grid-column:2;display:grid;gap:10px}
`;
const doc = `<!doctype html><html lang="ro"><head><meta charset="utf-8"><style>${css}</style></head><body>
<div class="sticla st"><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p><h1>${T.titlu}</h1><p class="sub">${T.sub}</p></div>
<div class="sticla plan"><span class="punct"></span><p class="cap">${T.cap}</p>
${T.plan.map((r, i) => `<div class="rand"><span class="n">${i + 1}</span><b>${r}</b>${T.linii ? `<div class="l"><i class="scris" style="width:${[100, 62, 40][i]}%"></i></div>` : ''}</div>`).join('\n')}
</div></body></html>`;

// potrivirea: micșorăm titlul, apoi subtitlul, până încap în card; la fel titlul și rândurile din dreapta
const potriveste = `(async()=>{await document.fonts.ready;
  const st=document.querySelector('.st'),h1=st.querySelector('h1'),sub=st.querySelector('.sub');
  const lat=el=>[...el.querySelectorAll('*')].some(x=>x.scrollWidth>x.clientWidth+1);
  const plin=el=>el.scrollHeight>el.clientHeight+1;
  let a=120,b=46;
  while((plin(st)||h1.scrollWidth>h1.clientWidth+1)&&a>56){a-=4;h1.style.fontSize=a+'px';}
  while(plin(st)&&b>32){b-=2;sub.style.fontSize=b+'px';}
  const pl=document.querySelector('.plan'),cap=pl.querySelector('.cap'),rb=[...pl.querySelectorAll('.rand b')];
  let c=36,r=32;
  while(plin(pl)&&r>22){r-=1;rb.forEach(x=>x.style.fontSize=r+'px');if(c>28){c-=1;cap.style.fontSize=c+'px';}}
  await new Promise(z=>setTimeout(z,200));
  const out=[];
  if(!document.fonts.check('200 40px Sora')||!document.fonts.check('600 20px "Inter Tight"'))out.push('font lipsă');
  if(plin(st))out.push('textul din stânga nu încape');if(plin(pl))out.push('planul din dreapta nu încape');
  for(const el of document.querySelectorAll('h1,p,b,.n,.punct,.scris')){const q=el.getBoundingClientRect();
    if(q.left<40||q.top<40||q.right>1160||q.bottom>590)out.push('margine: '+(el.textContent||el.className).slice(0,30));
    if(el.matches('h1,p,b')&&el.scrollWidth>el.clientWidth+1)out.push('text tăiat: '+el.textContent.slice(0,30));}
  return {out,marimi:{titlu:a,sub:b,cap:c,randuri:r}};})()`;

const tmp = mkdtempSync(join(tmpdir(), 'og-'));
const br = await launch({ port: 9348 });
let ok = true;
try {
  const f = join(tmp, `${slug}.html`); writeFileSync(f, doc);
  const p = await br.open(pathToFileURL(f).href);
  await br.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false }, p.sessionId);
  const v = await br.evaluate(p, potriveste);
  const dest = join(HERE, 'static/previzualizari'); mkdirSync(dest, { recursive: true });
  const png = join(dest, `${slug}.png`);
  await br.screenshot(p, png);
  console.log(`${slug}: ${v.out.length ? v.out.join('; ') : 'OK'} · mărimi ${JSON.stringify(v.marimi)} · site/static/previzualizari/${slug}.png, ${Math.round(statSync(png).size / 1024)} KB`);
  ok = !v.out.length;
} finally { br.close(); rmSync(tmp, { recursive: true, force: true }); }
if (!ok) process.exit(1);
