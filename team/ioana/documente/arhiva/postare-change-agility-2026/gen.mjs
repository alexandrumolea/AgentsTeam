// Imaginea pentru postarea LinkedIn despre Change Agility (Ioana, 2026-11-27).
// Alex: imaginea să sublinieze că e „cursul anului 2026”, fără s-o spună. Cinci idei, 1080×1350 (portret, 4:5),
// plus B și pătrat (1080×1080), ca să se vadă diferența. Randare în Chrome headless (fără ferestre pe ecran).
// Culorile și gradientul vin din content/tema.yml (site/tema.mjs), Noaptea din curs/tema/bemore.css (fel-reflectie),
// fonturile din site/node_modules/@fontsource-variable.
// Rulare, din rădăcina repo-ului:  node team/ioana/documente/postare-change-agility-2026/gen.mjs
import { writeFileSync, mkdtempSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadTema } from '../../../../../site/tema.mjs';
import { launch } from '../../../../../curs/teste/cdp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../../..');
const tema = loadTema(ROOT);
const F = p => pathToFileURL(join(ROOT, 'site/node_modules/@fontsource-variable', p)).href;
const grain = join(ROOT, 'site/dist/assets/grain.png');
const GRAIN = existsSync(grain) ? `url(${pathToFileURL(grain).href})` : 'none';

// Textele: doar fraze ale lui Alex (mesajul cheie aprobat 25.11, pagina cursului, deschiderea postării v3).
const T = {
  drag: 'L-am construit cu drag și a devenit preferatul meu.',
  semnal: ['Incertitudinea este ', 'un semnal', ' că nu mai ai suficiente informații.'],
  resurse: 'Ai mai multe resurse decât crezi.',
  plan: 'Fiecare pleacă cu planul lui de reinventare.',
};

// Noaptea: aceleași valori ca ecranele de reflecție din sală (bemore.css, fel-reflectie).
const N = { fundal: '#0D1333', text: '#F5F3FF', accent: '#A9C4FF', marca: '#9AA2C6' };

const baza = (w, h) => `
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 800;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
${tema.css()}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;background:var(--mesh-pagini);color:var(--text);font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
body::after{content:"";position:absolute;inset:0;background:${GRAIN};opacity:.38;mix-blend-mode:overlay;pointer-events:none}
.sticla{position:absolute;background:var(--glass-read);border:1.5px solid var(--glass-edge);border-radius:44px;
  box-shadow:inset 0 1.5px 0 rgb(255 255 255/.85),0 30px 70px -34px rgb(var(--umbra-rgb)/.45)}
.marca{display:flex;align-items:baseline;gap:.75em;text-transform:uppercase;color:var(--muted);white-space:nowrap;font-size:28px}
.marca b{font:400 1em/1 Sora,sans-serif;letter-spacing:.2em;color:var(--text)}
.marca span{font:500 .86em/1 "Inter Tight",sans-serif;letter-spacing:.24em}
.et{font:600 30px/1 "Inter Tight",sans-serif;letter-spacing:.26em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
h1{font:200 170px/.96 Sora,sans-serif;letter-spacing:-.035em}
.punct{display:inline-block;width:24px;height:24px;border-radius:50%;background:var(--punct);box-shadow:0 0 0 2.5px var(--punct-inel);flex:none}
`;

// A · Ediția 01 · 2026. Cursul ca un tiraj numerotat: prima ediție. Anul stă în colofon, unde stă la o carte sau la o gravură.
const A = (w, h) => `<style>${baza(w, h)}
.st{inset:72px;padding:84px 80px 76px;display:flex;flex-direction:column}
h1{margin-top:auto}
.sub{margin-top:34px;font:300 62px/1.16 Sora,sans-serif;letter-spacing:-.012em;color:var(--accent)}
.colofon{margin-top:92px;display:grid;grid-template-columns:auto 1fr auto 1fr auto;align-items:center;gap:26px}
.colofon i{height:0;border-top:2px solid rgb(var(--text-rgb)/.28)}
.colofon .et{color:var(--text)}
.nr{position:absolute;right:64px;top:168px;font:100 360px/1 Sora,sans-serif;letter-spacing:-.06em;color:transparent;-webkit-text-stroke:2.5px var(--lavanda)}
</style>
<div class="sticla st"><span class="nr" aria-hidden="true">01</span><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p>
<h1>Change<br>Agility</h1>
<p class="sub">${T.resurse}</p>
<div class="colofon"><span class="et">Ediția 01</span><i></i><span class="punct"></span><i></i><span class="et">2026</span></div>
</div>`;

// B · Orbita anului. O orbită = un an. Fraza de sub orbită e mesajul cheie (textul postării are deja „preferatul meu”).
// Lunile trecute sunt pline, iar în noiembrie se aprinde punctul: Change Agility.
// Arcul plin merge până la punct, decembrie rămâne punctat (anul nu s-a terminat).
const orbita = () => {
  const c = 400, r = 330, ang = i => (-90 + (i + .5) * 30) * Math.PI / 180;
  const pt = (a, rr = r) => [c + rr * Math.cos(a), c + rr * Math.sin(a)].map(v => v.toFixed(1));
  const [nx, ny] = pt(ang(10));
  const luni = Array.from({ length: 12 }, (_, i) => i).filter(i => i !== 10).map(i => {
    const [x, y] = pt(ang(i));
    return i < 10 ? `<circle cx="${x}" cy="${y}" r="8" fill="var(--accent)"/>` : `<circle cx="${x}" cy="${y}" r="8" fill="#fff" stroke="var(--accent)" stroke-width="3"/>`;
  }).join('');
  return `<svg viewBox="0 0 800 800" aria-hidden="true">
  <path d="M${c} ${c - r} A${r} ${r} 0 1 1 ${nx} ${ny}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-linecap="round"/>
  <path d="M${nx} ${ny} A${r} ${r} 0 0 1 ${c} ${c - r}" fill="none" stroke="var(--accent)" stroke-width="4" stroke-dasharray="2 14" stroke-linecap="round"/>
  ${luni}
  <circle cx="${nx}" cy="${ny}" r="78" fill="var(--punct)" opacity=".12"/>
  <circle cx="${nx}" cy="${ny}" r="50" fill="var(--punct)" opacity=".22"/>
  <circle cx="${nx}" cy="${ny}" r="26" fill="var(--punct)" stroke="var(--punct-inel)" stroke-width="3.5"/>
</svg>`;
};
const B = (w, h) => {
  const patrat = h <= w;
  const D = patrat ? 600 : 800;
  return `<style>${baza(w, h)}
.st{inset:${patrat ? 56 : 72}px;padding:${patrat ? '56px 64px 52px' : '80px 76px 76px'};display:flex;flex-direction:column;align-items:center}
.st .marca{align-self:flex-start}
.orb{position:relative;width:${D}px;height:${D}px;margin:${patrat ? 4 : 30}px 0 0}
.orb svg{position:absolute;inset:0;width:100%;height:100%}
.miez{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:${patrat ? 20 : 28}px}
.miez h1{font-size:${patrat ? 88 : 118}px;text-align:center}
.miez .et{color:var(--accent)}
.fraza{margin-top:auto;font:300 ${patrat ? 42 : 46}px/1.24 Sora,sans-serif;letter-spacing:-.012em;text-align:center;max-width:none;white-space:nowrap}
</style>
<div class="sticla st"><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p>
<div class="orb" role="img" aria-label="Un an ca o orbită: unsprezece luni ca puncte mici, iar în noiembrie un punct portocaliu aprins.">${orbita()}
<div class="miez"><span class="et">2026</span><h1>Change<br>Agility</h1></div></div>
<p class="fraza">Incertitudinea este un semnal<br>că nu mai ai suficiente informații.</p>
</div>`;
};

// C · Marca atelierului. Fraza lui despre drag, cu semnătura și ștampila atelierului: „făcut aici, anul acesta”.
// Ștampila e o marcă de meșteșug (ca pe ceramică sau pe o carte legată de mână), nu un premiu: fără lauri, fără „cel mai”.
const stampila = `<svg viewBox="0 0 260 260" aria-hidden="true">
<defs><path id="sus" d="M32 130 A98 98 0 0 1 228 130"/><path id="jos" d="M18 130 A112 112 0 0 0 242 130"/></defs>
<circle cx="130" cy="130" r="124" fill="none" stroke="var(--accent)" stroke-width="3"/>
<circle cx="130" cy="130" r="80" fill="none" stroke="var(--accent)" stroke-width="1.6"/>
<text font-family="Inter Tight" font-weight="600" font-size="15" letter-spacing="1.4" fill="var(--accent)" text-anchor="middle"><textPath href="#sus" startOffset="50%">BEMORE LEARNING STUDIO</textPath></text>
<text font-family="Inter Tight" font-weight="600" font-size="22" letter-spacing="7" fill="var(--accent)" text-anchor="middle"><textPath href="#jos" startOffset="50%">2026</textPath></text>
<circle cx="26" cy="130" r="4" fill="var(--accent)"/><circle cx="234" cy="130" r="4" fill="var(--accent)"/>
<text x="130" y="143" text-anchor="middle" font-family="Sora" font-weight="300" font-size="38" fill="var(--text)">CA</text>
</svg>`;
const C = (w, h) => `<style>${baza(w, h)}
.st{inset:72px;padding:84px 80px 76px;display:flex;flex-direction:column}
.linie{display:block;width:96px;height:0;border-top:6px solid var(--cer);border-radius:3px;margin-top:96px;margin-bottom:44px}
.citat{font:300 92px/1.12 Sora,sans-serif;letter-spacing:-.02em}
.citat em{font-style:normal;color:var(--accent)}
.semn{margin-top:36px;font:500 36px/1 "Inter Tight",sans-serif;color:var(--muted)}
.jos{margin-top:auto;display:flex;align-items:flex-end;justify-content:space-between;gap:32px}
.jos h2{font:200 96px/.98 Sora,sans-serif;letter-spacing:-.03em}
.jos svg{width:300px;height:300px;transform:rotate(-9deg);flex:none}
</style>
<div class="sticla st"><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p>
<i class="linie" aria-hidden="true"></i>
<p class="citat">L-am construit<br>cu drag<br>și a devenit<br><em>preferatul meu.</em></p>
<p class="semn">— Alex</p>
<div class="jos"><h2>Change<br>Agility</h2><span role="img" aria-label="Ștampila atelierului: BEMORE Learning Studio, 2026">${stampila}</span></div>
</div>`;

// D · Obiectul anului. Planul de reinventare fotografiat ca un produs: foaia mare, în lumină, pe jumătate scrisă.
// Anul stă în colțul foii, unde îți scrii data pe o pagină de caiet.
const scris = (lat) => `<i class="scris" style="width:${lat}px"></i>`;
const D = (w, h) => `<style>${baza(w, h)}
.sus{left:72px;right:72px;top:72px;padding:60px 72px 64px}
.sus h1{font-size:132px;margin-top:44px}
.sus .sub{margin-top:26px;font:300 52px/1.18 Sora,sans-serif;letter-spacing:-.012em;color:var(--accent)}
.foaie{position:absolute;left:140px;right:116px;top:640px;bottom:96px;background:#fff;border-radius:30px;padding:56px 60px;
  transform:rotate(-3.2deg);box-shadow:0 2px 0 rgb(var(--text-rgb)/.04),0 50px 90px -40px rgb(var(--umbra-rgb)/.6),0 18px 30px -18px rgb(var(--text-rgb)/.18)}
.foaie .cap{display:flex;justify-content:space-between;align-items:center;gap:20px}
.scris{display:block;height:0;border-top:4px solid var(--accent);border-radius:2px;margin-top:16px}
.data{display:flex;align-items:center;gap:14px}
.foaie .cap p{font:300 46px/1.1 Sora,sans-serif;letter-spacing:-.01em}
.foaie .cap .et{font-size:28px;color:var(--muted)}
.rand{display:grid;grid-template-columns:60px 1fr;gap:8px 22px;align-items:center;margin-top:40px}
.n{width:60px;height:60px;border-radius:50%;display:grid;place-items:center;font:600 28px/1 "Inter Tight",sans-serif;color:#fff;background:#0F1B43}
.rand b{font:600 40px/1.15 "Inter Tight",sans-serif;letter-spacing:-.01em}
.rand .l{grid-column:2;display:grid;gap:14px}
.gol{height:0;border-top:3px dotted rgb(var(--text-rgb)/.28);margin-top:20px}
</style>
<div class="sticla sus"><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p>
<h1>Change Agility</h1><p class="sub">${T.plan}</p></div>
<div class="foaie" role="img" aria-label="Planul de reinventare, pe jumătate completat: resursele tale, skill-ul pe care vrei să-l crești, primii tăi pași.">
<div class="cap"><p>Planul meu<br>de reinventare</p><span class="data"><span class="punct"></span><span class="et">2026</span></span></div>
<div class="rand"><span class="n">1</span><b>Resursele tale</b><div class="l">${scris(560)}${scris(410)}</div></div>
<div class="rand"><span class="n">2</span><b>Skill-ul pe care vrei să-l crești</b><div class="l">${scris(300)}</div></div>
<div class="rand"><span class="n">3</span><b>Primii tăi pași</b><div class="l"><i class="gol"></i></div></div>
</div>`;

// E · Noapte, mesajul cheie. Fraza lui despre incertitudine, ca ecranele de reflecție din sală.
// Anul e un semn mic pe linia orizontului: un singur punct aprins.
const E = (w, h) => `<style>${baza(w, h)}
body{background:radial-gradient(70% 55% at 8% 4%,#24357F 0%,rgb(36 53 127/0) 70%),radial-gradient(60% 50% at 100% 100%,#3E3283 0%,rgb(62 50 131/0) 70%),${N.fundal};color:${N.text}}
body::after{opacity:.22}
.wrap{position:absolute;inset:112px 96px 104px;display:flex;flex-direction:column}
.sus{display:flex;align-items:center;gap:20px}
.sus .et{color:${N.text}}
.sus .punct{width:22px;height:22px;background:${N.text};box-shadow:none}
.fraza{margin:auto 0;font:300 96px/1.1 Sora,sans-serif;letter-spacing:-.025em}
.fraza em{font-style:normal;color:${N.accent}}
.orizont{position:relative;height:0;border-top:2px solid rgb(245 243 255/.32)}
.orizont .punct{position:absolute;left:calc(87.5% - 12px);top:-13px}
.orizont .punct::before{content:"";position:absolute;inset:-22px;border-radius:50%;background:var(--punct);opacity:.22}
.jos{margin-top:40px;display:flex;justify-content:space-between;align-items:baseline;color:${N.marca}}
.jos .m{font:500 30px/1 "Inter Tight",sans-serif}
.jos .et{color:${N.marca}}
</style>
<div class="wrap">
<div class="sus"><span class="punct"></span><span class="et">Change Agility</span></div>
<p class="fraza">${T.semnal[0]}<em>${T.semnal[1]}</em>${T.semnal[2]}</p>
<div class="orizont" role="img" aria-label="O linie de orizont cu un punct portocaliu aprins"><span class="punct"></span></div>
<div class="jos"><span class="m">BEMORE Learning Studio</span><span class="et">2026</span></div>
</div>`;

const LISTA = [
  ['a-editia', A, 1080, 1350],
  ['b-orbita', B, 1080, 1350],
  ['b-orbita-patrat', B, 1080, 1080],
  ['c-marca', C, 1080, 1350],
  ['d-planul', D, 1080, 1350],
  ['e-noapte', E, 1080, 1350],
];

const tmp = mkdtempSync(join(tmpdir(), 'post-ca-'));
const br = await launch({ port: 9351 });
try {
  for (const [nume, fn, w, h] of LISTA) {
    const f = join(tmp, `${nume}.html`);
    writeFileSync(f, `<!doctype html><html lang="ro"><head><meta charset="utf-8"></head><body>${fn(w, h)}</body></html>`);
    const p = await br.open(pathToFileURL(f).href);
    await br.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, p.sessionId);
    await br.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false }, p.sessionId);
    await br.evaluate(p, 'document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,400)))');
    // verificări: fonturile, marginea de siguranță (48 px), textul tăiat, textul ieșit din cardul lui, suprapuneri între blocuri
    const v = await br.evaluate(p, `(()=>{const out=[],W=${w},H=${h};
      if(!document.fonts.check('200 40px Sora')||!document.fonts.check('600 20px "Inter Tight"'))out.push('font lipsă');
      const els=[...document.querySelectorAll('h1,h2,p,b,.et,.marca,.colofon,.orb,.punct,.foaie,.jos span')];
      for(const el of els){const r=el.getBoundingClientRect();if(!r.width)continue;
        if(r.left<48||r.top<48||r.right>W-48||r.bottom>H-48)out.push('margine: '+(el.textContent||el.className).trim().slice(0,28));
        const c=el.closest('.sticla');if(c){const q=c.getBoundingClientRect();if(r.left<q.left-1||r.right>q.right+1||r.top<q.top-1||r.bottom>q.bottom+1)out.push('iese din card: '+(el.textContent||el.className).trim().slice(0,28));}
        if(el.matches('h1,h2,p')&&el.scrollWidth>el.clientWidth+1)out.push('text tăiat: '+el.textContent.slice(0,28));}
      // blocurile de text de pe același card nu se ating
      const txt=[...document.querySelectorAll('.sticla > *, .wrap > *, .miez, .fraza')].map(e=>[e,e.getBoundingClientRect()]);
      for(let i=0;i<txt.length;i++)for(let j=i+1;j<txt.length;j++){const [a,ra]=txt[i],[b,rb]=txt[j];if(a.contains(b)||b.contains(a))continue;
        if(a.classList.contains('orb')&&b.classList.contains('miez')||b.classList.contains('miez')&&a.classList.contains('orb'))continue;
        if(ra.left<rb.right&&rb.left<ra.right&&ra.top<rb.bottom&&rb.top<ra.bottom)out.push('suprapuse: '+(a.className||a.tagName)+' / '+(b.className||b.tagName));}
      return out;})()`);
    console.log(nume.padEnd(17), v.length ? v : 'OK');
    await br.screenshot(p, join(HERE, `${nume}.png`));
    console.log('  ', `${nume}.png`, Math.round(statSync(join(HERE, `${nume}.png`)).size / 1024), 'KB');
  }
} finally { br.close(); rmSync(tmp, { recursive: true, force: true }); }
