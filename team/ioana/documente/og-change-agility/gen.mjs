// Imaginile de previzualizare (og:image) pentru pagina Change Agility, T-057.
// Două variante, 1200×630, randate în Chrome headless (fără ferestre pe ecran).
// Culorile și gradientul vin direct din content/tema.yml (site/tema.mjs), fonturile din site/node_modules.
// Rulare, din rădăcina repo-ului:  node team/ioana/documente/og-change-agility/gen.mjs
// Ieșire: a-planul.png, b-resursele.png (finale) + mic-*.png (cum se văd în feed pe telefon, ~360 px).
import { writeFileSync, mkdtempSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadTema } from '../../../../site/tema.mjs';
import { launch } from '../../../../curs/teste/cdp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const tema = loadTema(ROOT);
const F = p => pathToFileURL(join(ROOT, 'site/node_modules/@fontsource-variable', p)).href;
const grain = join(ROOT, 'site/dist/assets/grain.png');

// Textele: doar fraze aprobate de Alex (pagina cursului, cu corecturile lui din 2026-11-25).
const T = {
  titlu: ['Change', 'Agility'],
  sub1: 'Ai trecut deja prin schimbări.',
  sub2: 'Ai mai multe resurse decât crezi.',
  plan: ['Resursele tale', 'Skill-ul pe care vrei să-l crești', 'Primii tăi pași'],
};

const baza = `
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 800;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
${tema.css()}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1200px;height:630px;overflow:hidden}
body{position:relative;background:var(--mesh-pagini);color:var(--text);font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
body::after{content:"";position:absolute;inset:0;background:${existsSync(grain) ? `url(${pathToFileURL(grain).href})` : 'none'};opacity:.38;mix-blend-mode:overlay;pointer-events:none}
.sticla{position:absolute;background:var(--glass-read);border:1.5px solid var(--glass-edge);border-radius:36px;
  box-shadow:inset 0 1.5px 0 rgb(255 255 255/.85),0 24px 60px -30px rgb(var(--umbra-rgb)/.45)}
.marca{display:flex;align-items:baseline;gap:.75em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.marca b{font:400 1em/1 Sora,sans-serif;letter-spacing:.2em;color:var(--text)}
.marca span{font:500 .86em/1 "Inter Tight",sans-serif;letter-spacing:.24em}
h1{font:200 128px/.98 Sora,sans-serif;letter-spacing:-.035em}
.punct{display:inline-block;width:18px;height:18px;border-radius:50%;background:var(--punct);box-shadow:0 0 0 2px var(--punct-inel)}
.n{width:58px;height:58px;border-radius:50%;display:grid;place-items:center;font:600 26px/1 "Inter Tight",sans-serif;color:var(--accent);background:#fff;border:3px solid var(--cer);flex:none}
.scris{height:0;border-top:3.5px solid var(--accent);border-radius:2px}
.gol{height:0;border-top:2.5px dotted rgb(var(--text-rgb)/.3)}
`;

// A · Planul: compoziția din primul ecran al paginii, mărită pentru feed (aceeași lume ca pagina pe care ajungi).
const A = `<style>${baza}
.st{left:52px;top:52px;width:604px;height:526px;padding:52px 52px;display:flex;flex-direction:column}
.st .marca{font-size:25px}
.st h1{margin-top:auto;font-size:120px}
.st .sub{margin-top:24px;font:300 46px/1.18 Sora,sans-serif;letter-spacing:-.01em;color:var(--accent)}
.plan{left:688px;top:88px;width:464px;height:450px;padding:40px 38px 34px;transform:rotate(1.6deg);display:flex;flex-direction:column;gap:24px}
.plan .punct{position:absolute;right:34px;top:38px}
.plan .cap{font:300 36px/1.12 Sora,sans-serif;letter-spacing:-.01em;padding-right:40px}
.rand{display:grid;grid-template-columns:58px 1fr;gap:10px 18px;align-items:center}
.rand b{font:600 32px/1.15 "Inter Tight",sans-serif;letter-spacing:-.01em}
.rand .l{grid-column:2;display:grid;gap:10px}
</style>
<div class="sticla st"><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p>
<h1>${T.titlu.join('<br>')}</h1><p class="sub">${T.sub2}</p></div>
<div class="sticla plan" role="img" aria-label="Planul de reinventare"><span class="punct"></span>
<p class="cap">Planul de reinventare</p>
<div class="rand"><span class="n">1</span><b>${T.plan[0]}</b><div class="l"><i class="scris"></i></div></div>
<div class="rand"><span class="n">2</span><b>Skill-ul pe care<br>vrei să-l crești</b><div class="l"><i class="scris" style="width:62%"></i></div></div>
<div class="rand"><span class="n">3</span><b>${T.plan[2]}</b><div class="l"><i class="scris" style="width:40%"></i></div></div>
</div>`;

// B · Resursele: tipografic, totul mare, pentru telefon. Planul rămâne doar ca semn: trei pași, două deja scriși.
const B = `<style>${baza}
.st{left:52px;top:52px;right:52px;bottom:52px;padding:52px 64px 50px;display:flex;flex-direction:column}
.sus{display:flex;justify-content:space-between;align-items:center}
.sus .marca{font-size:25px}
h1{font-size:126px;line-height:1;margin-top:auto;white-space:nowrap}
.sub{margin-top:26px;font:300 54px/1.2 Sora,sans-serif;letter-spacing:-.012em}
.sub em{font-style:normal;color:var(--accent)}
.pasi{display:flex;align-items:center;gap:0}
.pasi .n{width:50px;height:50px;font-size:22px}
.pasi i{display:block;width:56px;margin:0 8px}
</style>
<div class="sticla st">
<div class="sus"><p class="marca"><b>BEMORE</b><span>Learning Studio</span></p>
<div class="pasi" role="img" aria-label="Trei pași ai planului de reinventare"><span class="n">1</span><i class="scris"></i><span class="n">2</span><i class="scris"></i><span class="n">3</span><i class="gol"></i><span class="punct"></span></div></div>
<h1>${T.titlu.join(' ')}</h1>
<p class="sub">${T.sub1}<br><em>${T.sub2}</em></p>
</div>`;

const tmp = mkdtempSync(join(tmpdir(), 'og-ca-'));
const br = await launch({ port: 9347 });
const send = br.send ?? null;
try {
  for (const [nume, html] of [['a-planul', A], ['b-resursele', B]]) {
    const f = join(tmp, `${nume}.html`);
    writeFileSync(f, `<!doctype html><html lang="ro"><head><meta charset="utf-8"></head><body>${html}</body></html>`);
    const p = await br.open(pathToFileURL(f).href);
    await br.send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false }, p.sessionId);
    await br.evaluate(p, 'document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,300)))');
    // verificări: fonturile încărcate, nimic ieșit din 1200×630 sau din cardul lui, marginea de siguranță de 40 px
    const v = await br.evaluate(p, `(()=>{const out=[];
      if(!document.fonts.check('200 40px Sora')||!document.fonts.check('600 20px "Inter Tight"'))out.push('font lipsă');
      const fam=[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family+' '+f.weight);
      for(const el of document.querySelectorAll('h1,p,b,.n,.punct,.scris,.gol')){const r=el.getBoundingClientRect();
        if(r.left<40||r.top<40||r.right>1160||r.bottom>590)out.push('margine: '+(el.textContent||el.className).slice(0,30));
        const c=el.closest('.sticla');if(c&&!el.closest('.plan')){const q=c.getBoundingClientRect();if(r.left<q.left||r.right>q.right+1||r.top<q.top||r.bottom>q.bottom+1)out.push('iese din card: '+(el.textContent||el.className).slice(0,30));}
        if(el.matches('h1,p,b')&&el.scrollWidth>el.clientWidth+1)out.push('text tăiat: '+el.textContent.slice(0,30));}
      return {out,fam};})()`);
    console.log(nume, v.out.length ? v.out : 'OK', '·', [...new Set(v.fam)].join(', '));
    await br.screenshot(p, join(HERE, `${nume}.png`));
    console.log('  ', `${nume}.png`, Math.round(statSync(join(HERE, `${nume}.png`)).size / 1024), 'KB');
  }
} finally { await br.close?.(); rmSync(tmp, { recursive: true, force: true }); }
