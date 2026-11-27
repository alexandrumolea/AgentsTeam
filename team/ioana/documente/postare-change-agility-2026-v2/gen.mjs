// Imaginea postării LinkedIn despre Change Agility, runda 2 (Ioana, 2026-11-27).
// Alex, după runda 1: „Nu-mi place niciun mock-up. Vreau să mai văd variante complet diferite.”
// Runda 1 (arhiva/postare-change-agility-2026/) era o singură familie: tipografie pe sticlă + un motiv abstract.
// Aici, șase medii diferite: fotografie, colaj de mână, pagină de dicționar, aplicație de vreme, bilet, afiș de film.
// „Anul” se simte din context (toamna, multe deodată, folio-ul 2026, prognoza, biletul, premiera), nu se spune.
// Brand BEMORE (D-098), linia Lumină: cerul din deck-ul livrat (#80CAF1 → #BED6F3 → #AB9AE3, 135°), bleumarin #0F1B43.
// Fonturi: Sora și Inter Tight din site/node_modules; scrisul de mână din B e un font de sistem macOS (Noteworthy).
// Fără resurse externe. Randare în Chrome headless (cdp.mjs), fără ferestre pe ecran.
// Rulare, din rădăcina repo-ului:  node team/ioana/documente/postare-change-agility-2026-v2/gen.mjs
import { writeFileSync, mkdtempSync, existsSync, statSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch } from '../../../../curs/teste/cdp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(HERE, '../../../..');
const F = p => pathToFileURL(join(ROOT, 'site/node_modules/@fontsource-variable', p)).href;
const grain = join(ROOT, 'site/dist/assets/grain.png');
const GRAIN = existsSync(grain) ? `url(${pathToFileURL(grain).href})` : 'none';
const ALEX = pathToFileURL(join(ROOT, 'site/static/alex.jpg')).href;

// Valorile: o singură listă. Cerul și bleumarinul sunt din deck-ul livrat pe 23.11 (linia Lumină).
const C = {
  cer: 'linear-gradient(135deg,#80CAF1 0%,#BED6F3 52%,#AB9AE3 100%)',
  navy: '#0F1B43', text: '#14161F', muted: '#474A58', accent: '#2B44B8',
  punct: '#F28C3B', punctInel: '#C96A1E', hartie: '#FBFAF7',
};

// Textele de pe imagini: frazele aprobate de Alex și numele cursului. Nimic inventat despre oameni sau cifre.
const T = {
  necunoscut: 'Nu trebuie să iubești necunoscutul. E destul să poți sta în el și să rămâi constructiv.',
  semnal: 'Un semnal că nu mai ai suficiente informații.',
  presiune: ['Mai multă presiune nu aduce adaptare.', 'Aduce uzură.'],
};

const baza = (w, h) => `
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-wght-normal.woff2')}) format('woff2');font-weight:100 800}
@font-face{font-family:Sora;src:url(${F('sora/files/sora-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 800;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:"Inter Tight";src:url(${F('inter-tight/files/inter-tight-latin-ext-wght-normal.woff2')}) format('woff2');font-weight:100 900;unicode-range:U+0100-024F,U+0259,U+1E00-1EFF}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:${w}px;height:${h}px;overflow:hidden}
body{position:relative;background:${C.cer};color:${C.text};font-family:"Inter Tight",sans-serif;-webkit-font-smoothing:antialiased}
.grain::after{content:"";position:absolute;inset:0;background:${GRAIN};opacity:.32;mix-blend-mode:overlay;pointer-events:none;z-index:50}
.et{font:600 28px/1 "Inter Tight",sans-serif;letter-spacing:.24em;text-transform:uppercase;white-space:nowrap}
.marca{font:500 28px/1 "Inter Tight",sans-serif;white-space:nowrap}
.punct{display:inline-block;width:22px;height:22px;border-radius:50%;background:${C.punct};box-shadow:0 0 0 2.5px ${C.punctInel};flex:none}
`;

// A · Aleea. Fotografia lui Alex de pe site: aleea din spate se pierde în neclar (necunoscutul), el stă liniștit în ea.
// Toamna e anul care se apropie de capăt. Fraza stă pe sticlă de 93 %, peste tricou (îi acoperă și textul).
const A = (w, h) => `<style>${baza(w, h)}
body{background:#C9B79C url(${ALEX}) 50% 0/${w}px auto no-repeat}
.card{position:absolute;left:56px;right:56px;bottom:56px;padding:52px 56px 46px;border-radius:44px;
  background:rgb(255 255 255/.93);-webkit-backdrop-filter:blur(24px) saturate(1.3);backdrop-filter:blur(24px) saturate(1.3);
  border:1.5px solid rgb(255 255 255/.7);box-shadow:inset 0 1.5px 0 #fff,0 40px 80px -40px rgb(15 27 67/.55)}
.card .et{color:${C.accent}}
.fraza{margin-top:30px;font:300 62px/1.14 Sora,sans-serif;letter-spacing:-.02em;color:${C.navy}}
.jos{margin-top:40px;display:flex;align-items:center;gap:18px;color:${C.muted}}
</style>
<div class="card"><p class="et">Change Agility</p><p class="fraza">${T.necunoscut}</p>
<div class="jos"><span class="punct"></span><span class="marca">BEMORE Learning Studio</span></div></div>`;

// B · Peretele. Contextul anului: s-au schimbat multe deodată. Bilețele scrise de mână, strâmbe, una peste alta,
// cu ce se schimbă în organizații (structura, rolurile, tehnologia, felul de lucru…). Un singur cartonaș stă drept.
// Pe cartonaș doar numele: deschiderea v4 a Sofiei spune deja „deodată”, iar imaginea o arată fără s-o repete.
const NOTE = ['structura', 'rolurile', 'tehnologia', 'felul\nde lucru', 'AI', 'un manager\nnou', 'obiective\nnoi', 'echipă\nnouă',
  'buget', 'procese\nnoi', 'reorganizare', 'tool nou', 'hibrid', 'alt birou', 'KPI noi', 'termene', 'fuziune', 'clienți\nnoi',
  'colegi noi', 'strategie\nnouă', 'alt program'];
const NUANTE = ['#CFEAFB', '#E3DBFA', '#FCE0D3', '#FBD8B8', '#FFFFFF', '#DCE7FB'];
const rnd = (s => () => (s = (s * 16807) % 2147483647) / 2147483647)(20261127);
const B = (w, h) => {
  // Bilețele: o grilă amestecată, cu salturi mari și unghiuri diferite, ca un perete lipit în grabă.
  // Cele care ajung sub cartonaș rămân fără text (se văd doar marginile), ca să nu apară jumătăți de cuvinte.
  const cols = 4, rows = 5, cw = w / cols, ch = h / rows;
  const cel = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cel.push([c, r]);
  cel.sort(() => rnd() - .5);
  let out = '';
  for (const [c, r] of cel) {
    const cx = cw * (c + .5) + (rnd() - .5) * 70, cy = ch * (r + .5) + (rnd() - .5) * 64;
    const s = 250 + rnd() * 40, rot = (rnd() - .5) * 22;
    const bg = NUANTE[(c * 7 + r * 3) % NUANTE.length];
    out += `<div class="nota" style="left:${(cx - s / 2).toFixed(0)}px;top:${(cy - s / 2).toFixed(0)}px;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;transform:rotate(${rot.toFixed(1)}deg);background:${bg}"><span></span></div>`;
  }
  // al doilea strat: bilețele mai mici, lipite peste, oriunde, mai strâmbe (multe deodată)
  for (let k = 0; k < 11; k++) {
    const cx = 80 + rnd() * (w - 160), cy = 80 + rnd() * (h - 160), s = 200 + rnd() * 40, rot = (rnd() - .5) * 34;
    out += `<div class="nota" style="left:${(cx - s / 2).toFixed(0)}px;top:${(cy - s / 2).toFixed(0)}px;width:${s.toFixed(0)}px;height:${s.toFixed(0)}px;transform:rotate(${rot.toFixed(1)}deg);background:${NUANTE[(k * 5 + 2) % NUANTE.length]}"><span></span></div>`;
  }
  // Cuvintele se scriu doar pe bilețelele al căror mijloc se vede întreg (nimic deasupra, nimic în afara imaginii),
  // în ordinea listei: întâi cele patru de pe pagina cursului (structura, rolurile, tehnologia, felul de lucru).
  out += `<script>window.scrie=()=>{const W=${w},H=${h},rest=${JSON.stringify(NOTE)};let k=0;
    const vede=(n,sp)=>{const q=sp.getBoundingClientRect();if(q.left<40||q.top<40||q.right>W-40||q.bottom>H-40)return false;
      for(const fx of [0,.25,.5,.75,1])for(const fy of [0,.5,1]){const e=document.elementFromPoint(q.left-10+fx*(q.width+20),q.top-6+fy*(q.height+12));if(!e||e.closest('.nota')!==n)return false;}return true;};
    for(const n of [...document.querySelectorAll('.nota')].reverse()){const sp=n.firstElementChild;
      for(let j=0;j<rest.length;j++){sp.innerHTML=rest[j].replace('\\n','<br>');if(vede(n,sp)){rest.splice(j,1);k++;break;}sp.innerHTML='';}}
    document.body.dataset.cuvinte=k+' scrise, rămase: '+rest.length;};<\/script>`;
  return `<style>${baza(w, h)}
body{background:${C.cer}}
.nota{position:absolute;display:flex;align-items:center;justify-content:center;text-align:center;padding:26px;
  box-shadow:0 2px 0 rgb(15 27 67/.06),0 22px 34px -18px rgb(15 27 67/.38)}
.nota span{font:400 50px/1.08 Noteworthy,"Bradley Hand",sans-serif;color:#1E2340}
.card{position:absolute;left:200px;right:200px;top:470px;padding:50px 56px 46px;background:#fff;border-radius:36px;z-index:10;
  box-shadow:0 0 0 1.5px rgb(15 27 67/.06),0 50px 90px -40px rgb(15 27 67/.6)}
.card h1{font:200 112px/.98 Sora,sans-serif;letter-spacing:-.035em;color:${C.navy}}
.card .et{color:${C.accent};margin-bottom:26px}
.card .jos{margin-top:40px;display:flex;align-items:center;gap:18px;color:${C.muted}}
</style>${out}
<div class="card"><p class="et">Workshop</p><h1>Change<br>Agility</h1><div class="jos"><span class="punct"></span><span class="marca">BEMORE Learning Studio</span></div></div>`;
};

// C · Dicționarul. O pagină de dicționar, de aproape. Folio-ul paginii e 2026 (anul se citește ca număr de pagină),
// iar sensul 2 al cuvântului e fraza lui Alex, subliniat cu marker. „v. și Change Agility” e trimiterea.
// Cuvintele vecine și definițiile lor sunt scrise de mine, scurt (nu copiate din vreun dicționar).
const C_ = (w, h) => `<style>${baza(w, h)}
.pag{position:absolute;left:70px;top:58px;width:1080px;height:1420px;background:${C.hartie};transform:rotate(-2deg);transform-origin:0 0;
  padding:74px 140px 0 86px;box-shadow:0 50px 90px -30px rgb(15 27 67/.45);
  background-image:linear-gradient(90deg,rgb(15 27 67/.10),rgb(15 27 67/0) 54px)}
.cap{display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid rgb(20 22 31/.2);padding-bottom:24px;color:${C.muted}}
.cap .g{font:italic 400 32px/1 "Inter Tight",sans-serif}
.cap .fol{font:300 56px/1 Sora,sans-serif;color:${C.navy};letter-spacing:.02em}
.v{margin-top:30px;font:400 34px/1.38 "Inter Tight",sans-serif;color:#555866}
.v b{font-weight:700;color:#363946}
.v i{font-style:italic}
.cuv{margin-top:54px;padding:6px 0 10px}
.cuv h1{font:300 126px/1 Sora,sans-serif;letter-spacing:-.03em;color:${C.navy}}
.cuv .gr{margin-top:20px;font:italic 400 36px/1 "Inter Tight",sans-serif;color:${C.muted}}
.cuv ol{list-style:none;margin-top:38px;display:grid;gap:30px}
.cuv li{display:grid;grid-template-columns:58px 1fr;align-items:baseline;font:400 46px/1.24 "Inter Tight",sans-serif;color:${C.text}}
.cuv li .n{font-weight:700;color:${C.accent}}
.cuv li.doi span:last-child{font:300 62px/1.2 Sora,sans-serif;letter-spacing:-.015em;color:${C.navy}}
.cuv mark{background:linear-gradient(180deg,rgb(143 211 247/0) 48%,rgb(143 211 247/.8) 48%,rgb(143 211 247/.8) 94%,rgb(143 211 247/0) 94%);color:inherit;padding:0 6px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.vezi{margin-top:34px;margin-left:58px;font:500 42px/1.2 "Inter Tight",sans-serif;color:${C.accent}}
.vezi i{color:${C.muted};font-weight:400;margin-right:.3em}
.subsol{position:absolute;left:86px;right:140px;top:1186px;padding-top:26px;border-top:2px solid rgb(20 22 31/.12);display:flex;align-items:center;gap:16px;color:${C.navy}}
</style>
<div class="pag">
<div class="cap"><span class="g">incasabil — incipient</span><span class="fol">2026</span></div>
<p class="v"><b>incasabil, -ă</b> <i>adj.</i> Care nu se sparge ușor.</p>
<p class="v"><b>incert, -ă</b> <i>adj.</i> Despre care nu știi încă destul.</p>
<div class="cuv">
<h1>incertitúdine</h1>
<p class="gr">s.f.</p>
<ol>
<li><span class="n">1.</span><span>Starea în care nu știi ce urmează.</span></li>
<li class="doi"><span class="n">2.</span><span><mark>${T.semnal}</mark></span></li>
</ol>
<p class="vezi"><i>v. și</i>Change Agility</p>
</div>
<p class="v" style="margin-top:44px"><b>incidență</b> <i>s.f.</i> Cât de des apare ceva.</p>
<p class="v"><b>incipient, -ă</b> <i>adj.</i> Abia început.</p>
<div class="subsol"><span class="punct"></span><span class="marca">BEMORE Learning Studio</span></div>
</div>`;

// D · Prognoza. Ecranul unei aplicații de vreme, pe cerul Lumină: în locul temperaturii stă anul,
// iar „clima” e cea din echipe: presiune ridicată, vizibilitate redusă. Fraza lui despre presiune stă pe card.
const ico = {
  nor: '<path d="M22 46h30a12 12 0 0 0 0-24 16 16 0 0 0-30 4 10 10 0 0 0 0 20z" fill="#fff" stroke="#0F1B43" stroke-width="3"/>',
  ploaie: '<path d="M22 40h30a12 12 0 0 0 0-24 16 16 0 0 0-30 4 10 10 0 0 0 0 20z" fill="#fff" stroke="#0F1B43" stroke-width="3"/><path d="M26 48l-4 10M38 48l-4 10M50 48l-4 10" stroke="#2B44B8" stroke-width="3.5" stroke-linecap="round"/>',
  vant: '<path d="M10 26h34a8 8 0 1 0-8-8M10 38h44a8 8 0 1 1-8 8M10 50h22" fill="none" stroke="#0F1B43" stroke-width="3.5" stroke-linecap="round"/>',
  fulger: '<path d="M22 38h30a12 12 0 0 0 0-24 16 16 0 0 0-30 4 10 10 0 0 0 0 20z" fill="#fff" stroke="#0F1B43" stroke-width="3"/><path d="M38 40l-8 12h9l-6 12" fill="none" stroke="#F28C3B" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>',
  ceata: '<path d="M10 22h44M16 32h40M10 42h44M18 52h32" stroke="#0F1B43" stroke-width="3.5" stroke-linecap="round" opacity=".75"/>',
  soare: '<circle cx="24" cy="24" r="10" fill="#F28C3B"/><path d="M28 46h26a10 10 0 0 0 0-20 14 14 0 0 0-26 4 8 8 0 0 0 0 16z" fill="#fff" stroke="#0F1B43" stroke-width="3"/>',
};
const LUNI = [['Ian', 'nor'], ['Feb', 'vant'], ['Mar', 'ploaie'], ['Apr', 'ceata'], ['Mai', 'fulger'], ['Iun', 'vant'],
  ['Iul', 'soare'], ['Aug', 'ploaie'], ['Sep', 'fulger'], ['Oct', 'ceata'], ['Nov', 'vant'], ['Dec', 'nor']];
const D = (w, h) => `<style>${baza(w, h)}
.sus{position:absolute;left:56px;right:56px;top:76px;text-align:center;color:${C.navy}}
.sus .loc{font:500 50px/1 "Inter Tight",sans-serif}
.sus .an{margin-top:4px;font:100 220px/1 Sora,sans-serif;letter-spacing:-.05em}
.sus .stare{margin-top:2px;font:500 46px/1.15 "Inter Tight",sans-serif}
.sticla{position:absolute;left:56px;right:56px;background:rgb(255 255 255/.82);-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px);
  border:1.5px solid rgb(255 255 255/.75);border-radius:40px;box-shadow:inset 0 1.5px 0 #fff,0 30px 60px -36px rgb(15 27 67/.5)}
.luni{top:482px;padding:26px 28px 24px}
.luni .et{font-size:24px;color:${C.muted};padding:0 8px 18px;border-bottom:1.5px solid rgb(20 22 31/.14)}
.rand{display:grid;grid-template-columns:repeat(12,1fr);margin-top:18px;text-align:center}
.rand span{font:600 24px/1 "Inter Tight",sans-serif;color:${C.navy}}
.rand svg{display:block;width:62px;height:62px;margin:14px auto 0}
.doua{position:absolute;left:56px;right:56px;top:724px;display:grid;grid-template-columns:1fr 1fr;gap:24px}
.doua .sticla{position:static;padding:28px 34px 30px}
.doua .et{font-size:24px;color:${C.muted}}
.doua .v{margin-top:16px;font:300 58px/1 Sora,sans-serif;color:${C.navy};letter-spacing:-.02em}
.doua svg{display:block;margin-top:14px}
.mesaj{top:966px;padding:34px 40px 32px}
.mesaj p{font:300 54px/1.14 Sora,sans-serif;color:${C.navy};letter-spacing:-.015em}
.mesaj .jos{margin-top:24px;display:flex;align-items:center;gap:16px;color:${C.muted}}
</style>
<div class="sus"><p class="loc">Echipa ta</p><p class="an">2026</p><p class="stare">Schimbări din toate direcțiile</p></div>
<div class="sticla luni"><p class="et">Prognoza pe 12 luni</p><div class="rand">${LUNI.map(([l, k]) => `<div><span>${l}</span><svg viewBox="0 0 64 64" aria-hidden="true">${ico[k]}</svg></div>`).join('')}</div></div>
<div class="doua">
<div class="sticla"><p class="et">Presiune</p><p class="v">Ridicată</p>
<svg width="200" height="34" viewBox="0 0 200 34" aria-hidden="true"><rect x="0" y="12" width="200" height="10" rx="5" fill="rgb(15 27 67 / .12)"/><rect x="0" y="12" width="176" height="10" rx="5" fill="#2B44B8"/><circle cx="176" cy="17" r="14" fill="#fff" stroke="#0F1B43" stroke-width="3"/></svg></div>
<div class="sticla"><p class="et">Vizibilitate</p><p class="v">Redusă</p>
<svg width="200" height="34" viewBox="0 0 200 34" aria-hidden="true"><path d="M4 8h192M24 17h152M4 26h192" stroke="#0F1B43" stroke-width="3.5" stroke-linecap="round" opacity=".5"/></svg></div>
</div>
<div class="sticla mesaj"><p>Mai multă presiune<br>nu aduce adaptare.<br>Aduce uzură.</p><div class="jos"><span class="punct"></span><span class="marca">Change Agility · BEMORE Learning Studio</span></div></div>`;

// E · Biletul. Un bilet de îmbarcare, ca un card din portofelul telefonului, așezat strâmb pe cer.
// De la „Cunoscut”, spre „Necunoscut”; punctul portocaliu e pe drum, la jumătate. Anul e data biletului;
// bagajul sunt resursele tale (planul de reinventare pornește de la ele).
// Codul de bare e doar decor (nu se scanează; un QR fals ar păcăli pe cine încearcă).
const bare = (w = 300, h = 120) => {
  const r2 = (s => () => (s = (s * 48271) % 2147483647) / 2147483647)(2026);
  let x = 0, p = '';
  while (x < w - 6) { const g = [3, 3, 6, 9][Math.floor(r2() * 4)], sp = [3, 6][Math.floor(r2() * 2)]; p += `<rect x="${x}" y="0" width="${Math.min(g, w - x)}" height="${h}"/>`; x += g + sp; }
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><g fill="#0F1B43">${p}</g></svg>`;
};
const E = (w, h) => `<style>${baza(w, h)}
.umbra{position:absolute;left:120px;top:96px;width:840px;height:1160px;transform:rotate(-4deg);filter:drop-shadow(0 46px 50px rgb(15 27 67/.38))}
.bilet{position:absolute;inset:0;background:#fff;border-radius:40px;padding:52px 60px 0;
  -webkit-mask:radial-gradient(circle 30px at 0 868px,#0000 29px,#000 30px) 0 0/51% 100% no-repeat,radial-gradient(circle 30px at 100% 868px,#0000 29px,#000 30px) 100% 0/51% 100% no-repeat;
  mask:radial-gradient(circle 30px at 0 868px,#0000 29px,#000 30px) 0 0/51% 100% no-repeat,radial-gradient(circle 30px at 100% 868px,#0000 29px,#000 30px) 100% 0/51% 100% no-repeat}
.bilet .cap{display:flex;justify-content:space-between;align-items:center}
.bilet .cap .marca{color:${C.navy};display:flex;align-items:center;gap:14px}
.bilet .cap .et{font-size:24px;color:${C.muted}}
.ruta{margin-top:52px;display:grid;grid-template-columns:44px 1fr;column-gap:30px}
.ruta .linie{grid-row:1/4;position:relative}
.ruta .linie::before{content:"";position:absolute;left:20px;top:22px;bottom:22px;border-left:4px dotted rgb(15 27 67/.4)}
.ruta .linie i{position:absolute;left:8px;width:28px;height:28px;border-radius:50%;border:4px solid ${C.navy};background:#fff}
.ruta .linie i.a{top:8px}.ruta .linie i.b{bottom:8px;background:${C.navy}}
.ruta .linie .punct{position:absolute;left:11px;top:calc(50% - 11px)}
.ruta .et{font-size:24px;color:${C.muted}}
.ruta .loc{margin-top:12px;font:200 104px/1 Sora,sans-serif;letter-spacing:-.035em;color:${C.navy}}
.ruta .gol{height:86px}
.campuri{margin-top:48px;display:grid;grid-template-columns:1fr 1fr;gap:30px;padding-top:38px;border-top:2px solid rgb(20 22 31/.12)}
.campuri .et{font-size:22px;color:${C.muted}}
.campuri .lat{grid-column:1/3}
.campuri p:not(.et){margin-top:12px;font:500 44px/1.1 "Inter Tight",sans-serif;color:${C.navy}}
.rupt{position:absolute;left:44px;right:44px;top:866px;border-top:4px dashed rgb(15 27 67/.2)}
.cotor{position:absolute;left:60px;right:60px;top:900px;bottom:40px;display:flex;align-items:center;justify-content:space-between;gap:30px}
.cotor .nume{font:200 64px/1 Sora,sans-serif;letter-spacing:-.03em;color:${C.navy}}
.cotor .nume span{display:block;margin-top:16px;font:500 24px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:${C.muted}}
</style>
<div class="umbra"><div class="bilet">
<div class="cap"><span class="marca"><span class="punct"></span>BEMORE Learning Studio</span><span class="et">Bilet de îmbarcare</span></div>
<div class="ruta">
<div class="linie"><i class="a"></i><span class="punct"></span><i class="b"></i></div>
<div><p class="et">De la</p><p class="loc">Cunoscut</p></div>
<div class="gol"></div>
<div><p class="et">Spre</p><p class="loc">Necunoscut</p></div>
</div>
<div class="campuri">
<div><p class="et">Pasager</p><p>Echipa ta</p></div>
<div><p class="et">Anul</p><p>2026</p></div>
<div class="lat"><p class="et">Bagaj</p><p>Resursele tale</p></div>
</div>
<div class="rupt"></div>
<div class="cotor"><p class="nume">Change<br>Agility<span>Workshop</span></p>${bare()}</div>
</div></div>`;

// F · Afișul. Un afiș de film: drumul care intră în ceață (esența, nu peisajul), titlul și blocul de credite de jos.
// „Premiera” anului se simte din formatul afișului, fără s-o spunem. Rolul principal: echipa ta.
// Drumul: curba centrului (Bézier în S, de departe spre aproape) și jumătatea lățimii, care crește în perspectivă.
const drum = () => {
  const P = [[520, 694], [540, 880], [420, 1080], [470, 1420]];
  const c = t => [0, 1].map(k => (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t * t * P[2][k] + t ** 3 * P[3][k]);
  const hw = t => 3 + 470 * t ** 2.2;
  const N = 80, st = [], dr = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N, [x, y] = c(t), [x2, y2] = c(Math.min(1, t + .01)), [x1, y1] = c(Math.max(0, t - .01));
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, r = hw(t);
    st.push([x + nx * r, y + ny * r]); dr.push([x - nx * r, y - ny * r]);
  }
  const pts = a => a.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L');
  const supr = `M${pts(st)} L${pts(dr.slice().reverse())} Z`;
  // liniuțele din mijloc: tot mai lungi spre aproape; se opresc înainte de credite
  let lin = '';
  for (let t = .05; t < .6; t += .02 + .05 * t) {
    const [xa, ya] = c(t), [xb, yb] = c(t + .008 + .03 * t);
    lin += `<path d="M${xa.toFixed(1)} ${ya.toFixed(1)} L${xb.toFixed(1)} ${yb.toFixed(1)}" stroke-width="${(1.5 + 9 * t).toFixed(1)}"/>`;
  }
  return { supr, mg: [`M${pts(st)}`, `M${pts(dr)}`], lin };
};
const F_ = (w, h, dr = drum()) => `<style>${baza(w, h)}
body{background:linear-gradient(180deg,#7FC3EE 0%,#9FD0F2 22%,#CFE1F6 40%,#F4F1F8 50%,#E6DDF6 56%,#D3C5F0 76%,#BFAEE9 100%)}
svg.scena{position:absolute;inset:0}
.sus{position:absolute;left:56px;right:56px;top:84px;text-align:center;color:${C.navy}}
.sus .et{font-size:26px;letter-spacing:.34em}
.titlu{position:absolute;left:56px;right:56px;top:170px;text-align:center;color:${C.navy}}
.titlu h1{font:200 156px/.94 Sora,sans-serif;letter-spacing:-.045em}
.titlu p{margin-top:36px;font:300 50px/1.15 Sora,sans-serif;letter-spacing:-.015em}
.credite{position:absolute;left:84px;right:84px;bottom:76px;text-align:center;color:${C.navy}}
.credite .r1{font:500 27px/1.35 "Inter Tight",sans-serif;letter-spacing:.16em;text-transform:uppercase}
.credite .r1 b{font-weight:700}
.credite .r2{margin-top:16px;font:600 42px/1 "Inter Tight",sans-serif;letter-spacing:.1em;text-transform:uppercase}
.credite .r3{margin-top:18px;font:500 25px/1.3 "Inter Tight",sans-serif;letter-spacing:.16em;text-transform:uppercase;color:${C.muted}}
</style>
<svg class="scena" viewBox="0 0 ${w} ${h}" aria-hidden="true">
<defs>
<linearGradient id="dr" x1="0" y1="690" x2="0" y2="${h}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#FFFFFF" stop-opacity=".2"/><stop offset=".45" stop-color="#FAF8FD" stop-opacity=".85"/><stop offset="1" stop-color="#FBFAFE"/></linearGradient>
<linearGradient id="mg" x1="0" y1="650" x2="0" y2="${h}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0F1B43" stop-opacity="0"/><stop offset=".35" stop-color="#0F1B43" stop-opacity=".34"/><stop offset=".72" stop-color="#0F1B43" stop-opacity=".3"/><stop offset=".9" stop-color="#0F1B43" stop-opacity="0"/></linearGradient>
<linearGradient id="mj" x1="0" y1="650" x2="0" y2="1110" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0F1B43" stop-opacity="0"/><stop offset=".5" stop-color="#0F1B43" stop-opacity=".3"/><stop offset=".85" stop-color="#0F1B43" stop-opacity=".3"/><stop offset="1" stop-color="#0F1B43" stop-opacity="0"/></linearGradient>
<radialGradient id="ceata" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff" stop-opacity=".96"/><stop offset=".6" stop-color="#fff" stop-opacity=".5"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<path d="${dr.supr}" fill="url(#dr)"/>
${dr.mg.map(d => `<path d="${d}" fill="none" stroke="url(#mg)" stroke-width="3.5"/>`).join('')}
<g stroke="#0F1B43" stroke-opacity=".28" stroke-linecap="round">${dr.lin}</g>
<ellipse cx="520" cy="676" rx="780" ry="110" fill="url(#ceata)"/>
<ellipse cx="480" cy="720" rx="360" ry="60" fill="url(#ceata)" opacity=".85"/>
<ellipse cx="540" cy="1290" rx="760" ry="170" fill="url(#ceata)" opacity=".9"/>
</svg>
<div class="sus"><p class="et">BEMORE Learning Studio prezintă</p></div>
<div class="titlu"><h1>Change<br>Agility</h1><p>Nu trebuie să iubești necunoscutul.</p></div>
<div class="credite">
<p class="r1">Un workshop de <b>Alexandru Molea</b></p>
<p class="r2">În rolul principal: echipa ta</p>
<p class="r3">4 sau 6 ore · în organizații · 2026</p>
</div>`;

// E1 și E2 · Biletul, după alegerea lui Alex (2026-11-27): „îmi place conceptul de la Cunoscut la Necunoscut,
// de boarding pass. Scrie cam mic Change Agility.” Același bilet, aceleași câmpuri; se schimbă doar ierarhia.
// Pe telefon imaginea are ~375 px (×0,35): numele cursului ≥ 130 px în sursă ca să iasă ≥ 45 px în feed.
// Valorile biletului: un singur loc. TY = linia de rupere (cotorul începe sub ea).
const BL = { w: 860, h: 1190, rot: -4, pad: 64 };
const biletCss = TY => `
.umbra{position:absolute;left:${(1080 - BL.w) / 2}px;top:${(1350 - BL.h) / 2}px;width:${BL.w}px;height:${BL.h}px;transform:rotate(${BL.rot}deg);filter:drop-shadow(0 46px 50px rgb(15 27 67/.38))}
.bilet{position:absolute;inset:0;background:#fff;border-radius:40px;padding:56px ${BL.pad}px 0;
  -webkit-mask:radial-gradient(circle 30px at 0 ${TY}px,#0000 29px,#000 30px) 0 0/51% 100% no-repeat,radial-gradient(circle 30px at 100% ${TY}px,#0000 29px,#000 30px) 100% 0/51% 100% no-repeat;
  mask:radial-gradient(circle 30px at 0 ${TY}px,#0000 29px,#000 30px) 0 0/51% 100% no-repeat,radial-gradient(circle 30px at 100% ${TY}px,#0000 29px,#000 30px) 100% 0/51% 100% no-repeat}
.bilet .et{font-size:24px;color:${C.muted}}
.bilet .cap{display:flex;justify-content:space-between;align-items:center}
.bilet .cap .marca{color:${C.navy};display:flex;align-items:center;gap:14px}
.rupt{position:absolute;left:44px;right:44px;top:${TY - 2}px;border-top:4px dashed rgb(15 27 67/.2)}
.cotor{position:absolute;left:${BL.pad}px;right:${BL.pad}px;top:${TY + 34}px;bottom:44px}
.v{margin-top:12px;font:500 44px/1.1 "Inter Tight",sans-serif;color:${C.navy};white-space:nowrap}
.nume{font:300 var(--fs)/1 Sora,sans-serif;letter-spacing:-.04em;color:${C.navy}}
.nume span{display:block;white-space:nowrap}
`;
// E1 · numele cursului e „zborul”, sus pe bilet, imediat sub antet. Ruta rămâne verticală, mai mică;
// pasagerul, anul și bagajul trec pe cotor, ca pe un bilet adevărat.
const E1 = (w, h, TY = 866) => `<style>${baza(w, h)}${biletCss(TY)}
.zbor{margin-top:52px}
.zbor .rand{display:flex;justify-content:space-between}
.zbor .nume{--fs:158px;margin-top:18px}
.ruta{margin-top:46px;padding-top:38px;border-top:2px solid rgb(20 22 31/.12);display:grid;grid-template-columns:44px 1fr;column-gap:28px}
.ruta .linie{grid-row:1/4;position:relative}
.ruta .linie::before{content:"";position:absolute;left:20px;top:22px;bottom:22px;border-left:4px dotted rgb(15 27 67/.4)}
.ruta .linie i{position:absolute;left:8px;width:28px;height:28px;border-radius:50%;border:4px solid ${C.navy};background:#fff}
.ruta .linie i.a{top:6px}.ruta .linie i.b{bottom:6px;background:${C.navy}}
.ruta .linie .punct{position:absolute;left:11px;top:calc(50% - 11px)}
.ruta .loc{margin-top:8px;font:250 76px/1 Sora,sans-serif;letter-spacing:-.03em;color:${C.navy}}
.ruta .gol{height:30px}
.cotor{display:grid;grid-template-columns:1fr 290px;grid-template-rows:auto 1fr;gap:28px 32px}
.cotor .cod{grid-column:2;grid-row:2;align-self:end}
</style>
<div class="umbra"><div class="bilet">
<div class="cap"><span class="marca"><span class="punct"></span>BEMORE Learning Studio</span><span class="et">Bilet de îmbarcare</span></div>
<div class="zbor"><div class="rand"><p class="et">Zbor</p><p class="et">Workshop</p></div><h1 class="nume"><span>Change</span><span>Agility</span></h1></div>
<div class="ruta">
<div class="linie"><i class="a"></i><span class="punct"></span><i class="b"></i></div>
<div><p class="et">De la</p><p class="loc">Cunoscut</p></div>
<div class="gol"></div>
<div><p class="et">Spre</p><p class="loc">Necunoscut</p></div>
</div>
<div class="rupt"></div>
<div class="cotor">
<div><p class="et">Pasager</p><p class="v">Echipa ta</p></div>
<div><p class="et">Anul</p><p class="v">2026</p></div>
<div><p class="et">Bagaj</p><p class="v">Resursele tale</p></div>
<div class="cod">${bare(290, 104)}</div>
</div>
</div></div>`;

// E2 · numele cursului e elementul dominant al biletului; ruta stă sub el, pe orizontală, ca cursa de pe un
// boarding pass: Cunoscut în stânga, Necunoscut în dreapta, punctul portocaliu pe drum, la jumătate.
const E2 = (w, h, TY = 936) => `<style>${baza(w, h)}${biletCss(TY)}
.titlu{margin-top:50px}
.titlu .nume{--fs:178px;margin-top:14px}
.ruta{margin-top:44px}
.ruta .ets,.ruta .loc{display:flex;justify-content:space-between;align-items:baseline}
.ruta .drum{position:relative;height:28px;margin:16px 0 18px}
.ruta .drum::before{content:"";position:absolute;left:22px;right:22px;top:12px;border-top:4px dotted rgb(15 27 67/.4)}
.ruta .drum i{position:absolute;top:0;width:28px;height:28px;border-radius:50%;border:4px solid ${C.navy};background:#fff}
.ruta .drum i.a{left:0}.ruta .drum i.b{right:0;background:${C.navy}}
.ruta .drum .punct{position:absolute;left:calc(50% - 11px);top:3px}
.ruta .loc p{font:300 62px/1 Sora,sans-serif;letter-spacing:-.03em;color:${C.navy}}
.campuri{margin-top:38px;padding-top:30px;border-top:2px solid rgb(20 22 31/.12);display:grid;grid-template-columns:auto auto 1fr;gap:44px}
.campuri .v{font-size:42px}
.cotor{display:flex;align-items:center}
</style>
<div class="umbra"><div class="bilet">
<div class="cap"><span class="marca"><span class="punct"></span>BEMORE Learning Studio</span><span class="et">Bilet de îmbarcare</span></div>
<div class="titlu"><p class="et">Workshop</p><h1 class="nume"><span>Change</span><span>Agility</span></h1></div>
<div class="ruta">
<div class="ets"><p class="et">De la</p><p class="et">Spre</p></div>
<div class="drum"><i class="a"></i><span class="punct"></span><i class="b"></i></div>
<div class="loc"><p>Cunoscut</p><p>Necunoscut</p></div>
</div>
<div class="campuri">
<div><p class="et">Pasager</p><p class="v">Echipa ta</p></div>
<div><p class="et">Anul</p><p class="v">2026</p></div>
<div><p class="et">Bagaj</p><p class="v">Resursele tale</p></div>
</div>
<div class="rupt"></div>
<div class="cotor">${bare(BL.w - 2 * BL.pad, 120)}</div>
</div></div>`;

// D1–D3 · Vremea, după Alex (2026-11-27): „Îmi place și treaba cu vremea. Doar că prognoza nu e foarte relevantă,
// ar putea fi exemple de schimbări.” Aceeași aplicație de vreme pentru „Echipa ta”, dar fenomenele sunt schimbări
// prin care trec echipele. Trei forme: anul pe luni, ziua pe ore, alerta cu fronturi. „Change Agility” se citește
// clar în toate (≥ 118 px în sursă, ~41 px în feed). Schimbările: o singură listă, ca să le poată corecta oricine.
const SCH = {
  luni: [['Ian', 'Reorganizare', 'fulger'], ['Feb', 'Rol nou', 'vant'], ['Mar', 'AI în lucru', 'vant'], ['Apr', 'Buget tăiat', 'ploaie'],
    ['Mai', 'Echipă nouă', 'soare'], ['Iun', 'Fuziune de procese', 'ceata'], ['Iul', 'KPI noi', 'nor'], ['Aug', 'Un manager nou', 'fulger'],
    ['Sep', 'Tool nou', 'vant'], ['Oct', 'Strategie nouă', 'ceata'], ['Nov', 'Lucru hibrid', 'nor'], ['Dec', 'Obiective noi', 'ploaie']],
  ore: [['09:00', 'Se anunță reorganizarea', 'fulger'], ['10:30', 'Ai un rol nou', 'vant'], ['12:00', 'AI intră în lucru', 'ceata'],
    ['14:00', 'Bugetul e tăiat', 'ploaie'], ['15:30', 'Vin colegi noi', 'soare'], ['17:00', 'KPI noi pentru mâine', 'nor']],
  fronturi: ['Reorganizare', 'AI în lucru', 'Buget tăiat', 'Rol nou', 'Echipă nouă', 'KPI noi'],
};
ico.alerta = '<path d="M32 7 59 55H5z" fill="#F28C3B" stroke="#C96A1E" stroke-width="3" stroke-linejoin="round"/><path d="M32 24v15" stroke="#0F1B43" stroke-width="5" stroke-linecap="round"/><circle cx="32" cy="47" r="3.2" fill="#0F1B43"/>';
const svgI = (k, s = 60) => `<svg width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true">${ico[k]}</svg>`;
// În Inter Tight, „AI” se citește „Al” (I și l au aceeași formă, iar fontul nu are varianta cu serife).
// I-ul din AI primește două serife desenate: liniile cap-height (0,727 em) și baseline, cu line-height 1.
const ai = s => s.replace(/\bAI\b/g, 'A<span class="i">I</span>');
const vremeCss = `
.i{display:inline-block;position:relative;line-height:1}
.i::before,.i::after{content:"";position:absolute;left:50%;width:.32em;margin-left:-.16em;height:.074em;background:currentColor;border-radius:.01em}
.i::before{top:.137em}.i::after{top:.79em}
.sticla{position:absolute;left:56px;right:56px;background:rgb(255 255 255/.82);-webkit-backdrop-filter:blur(26px);backdrop-filter:blur(26px);
  border:1.5px solid rgb(255 255 255/.75);border-radius:40px;box-shadow:inset 0 1.5px 0 #fff,0 30px 60px -36px rgb(15 27 67/.5)}
.sticla .et{font-size:24px;color:${C.muted}}
.sticla .cap{padding-bottom:18px;border-bottom:1.5px solid rgb(20 22 31/.14)}
.ca{font:300 var(--fs)/1 Sora,sans-serif;letter-spacing:-.04em;color:${C.navy};white-space:nowrap}
.fraza{font:300 50px/1.14 Sora,sans-serif;letter-spacing:-.015em;color:${C.navy}}
.jos{display:flex;align-items:center;gap:16px;color:${C.muted}}
`;
// D1 · Anul. „Change Agility” e titlul mare al aplicației (ca „Vremea” din lista de orașe), „Echipa ta” e locul.
// Lunile au fiecare un fenomen: o schimbare. Jos, fraza lui despre presiune.
const D1 = (w, h) => `<style>${baza(w, h)}${vremeCss}
.sus{position:absolute;left:64px;right:64px;top:70px;color:${C.navy}}
.sus .ca{--fs:120px}
.sus .loc{margin-top:22px;display:flex;justify-content:space-between;align-items:baseline;font:500 46px/1 "Inter Tight",sans-serif}
.sus .loc span:last-child{font:200 64px/1 Sora,sans-serif;letter-spacing:-.03em}
.sus .stare{margin-top:12px;font:500 34px/1.1 "Inter Tight",sans-serif;color:${C.muted}}
.luni{top:376px;padding:28px 34px 30px}
.grila{display:grid;grid-template-columns:1fr 1fr;gap:18px 30px;margin-top:22px}
.grila>div{display:grid;grid-template-columns:60px 1fr;column-gap:18px;align-items:center}
.grila svg{grid-row:1/3}
.grila .l{font:600 22px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;color:${C.muted}}
.grila .s{margin-top:6px;font:500 38px/1.05 "Inter Tight",sans-serif;color:${C.navy};white-space:nowrap}
.mesaj{top:1002px;padding:34px 40px 32px}
.mesaj .jos{margin-top:22px}
</style>
<div class="sus"><h1 class="ca">Change Agility</h1>
<p class="loc"><span>Echipa ta</span><span>2026</span></p><p class="stare">Schimbări din toate direcțiile</p></div>
<div class="sticla luni"><p class="et cap">Fenomene pe 12 luni</p><div class="grila">${SCH.luni.map(([l, s, k]) => `<div>${svgI(k)}<p class="l">${l}</p><p class="s">${ai(s)}</p></div>`).join('')}</div></div>
<div class="sticla mesaj"><p class="fraza">Mai multă presiune<br>nu aduce adaptare.<br>Aduce uzură.</p><div class="jos"><span class="punct"></span><span class="marca">BEMORE Learning Studio</span></div></div>`;

// D2 · Azi la birou. Ecranul principal al aplicației: locul, ziua, starea; apoi prognoza pe ore, în care fiecare oră
// aduce altă schimbare. Jos, numele cursului mare, pe două rânduri. Fără frază: ziua spune destul.
const D2 = (w, h) => `<style>${baza(w, h)}${vremeCss}
.sus{position:absolute;left:56px;right:56px;top:62px;text-align:center;color:${C.navy}}
.sus .loc{font:500 52px/1 "Inter Tight",sans-serif}
.sus .zi{margin-top:10px;font:200 78px/1 Sora,sans-serif;letter-spacing:-.03em}
.sus .stare{margin-top:14px;font:500 36px/1.1 "Inter Tight",sans-serif;color:${C.muted}}
.ore{top:296px;padding:26px 36px 14px}
.ore .r{display:grid;grid-template-columns:112px 62px 1fr;column-gap:22px;align-items:center;padding:8px 0;border-bottom:1.5px solid rgb(20 22 31/.08)}
.ore .r:last-child{border-bottom:0}
.ore .h{font:600 32px/1 "Inter Tight",sans-serif;color:${C.muted};font-variant-numeric:tabular-nums}
.ore .s{font:500 42px/1.05 "Inter Tight",sans-serif;color:${C.navy};white-space:nowrap}
.curs{bottom:56px;padding:32px 40px 30px}
.curs .ca{--fs:120px;margin-top:14px}
.curs .ca span{display:block}
.curs .jos{margin-top:24px}
</style>
<div class="sus"><p class="loc">Echipa ta</p><p class="zi">Azi la birou</p><p class="stare">Schimbări din oră în oră</p></div>
<div class="sticla ore"><p class="et cap">Prognoza pe ore</p>${SCH.ore.map(([o, s, k]) => `<div class="r"><p class="h">${o}</p>${svgI(k, 62)}<p class="s">${ai(s)}</p></div>`).join('')}</div>
<div class="sticla curs"><p class="et">Workshop</p><h1 class="ca"><span>Change</span><span>Agility</span></h1><div class="jos"><span class="punct"></span><span class="marca">BEMORE Learning Studio</span></div></div>`;

// D3 · Alerta. Ecranul de alertă meteo: radarul cu fronturile care vin deodată, din toate direcțiile, spre punctul
// portocaliu (echipa ta). Triunghiurile frontului arată direcția: spre echipă. Jos, cursul și fraza despre presiune.
const radar = (cx, cy) => {
  const ang = [-90, -30, 30, 90, 150, 210];
  let fr = '', et = '';
  ang.forEach((a, i) => {
    const r = a * Math.PI / 180, ux = Math.cos(r), uy = Math.sin(r), nx = -uy, ny = ux;
    const p = d => [cx + ux * d, cy + uy * d];
    const [x1, y1] = p(252), [x2, y2] = p(96);
    fr += `<path d="M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="#2B44B8" stroke-width="5" stroke-linecap="round"/>`;
    for (let d = 236; d > 130; d -= 40) { // triunghiuri pe o parte a frontului, cu vârful spre centru
      const [bx, by] = p(d), [tx, ty] = p(d - 26), [sx, sy] = p(d - 13);
      fr += `<path d="M${bx.toFixed(1)} ${by.toFixed(1)}L${tx.toFixed(1)} ${ty.toFixed(1)}L${(sx + nx * 20).toFixed(1)} ${(sy + ny * 20).toFixed(1)}Z" fill="#2B44B8"/>`;
    }
    const [lx, ly] = p(300);
    et += `<p class="front" style="left:${lx.toFixed(0)}px;top:${ly.toFixed(0)}px">${ai(SCH.fronturi[i])}</p>`;
  });
  return { fr, et };
};
const D3 = (w, h, cx = 540, cy = 606, rd = radar(540, 606)) => `<style>${baza(w, h)}${vremeCss}
.alerta{top:60px;padding:26px 34px 28px;display:grid;grid-template-columns:64px 1fr;column-gap:22px;align-items:center}
.alerta .t{font:600 42px/1.1 "Inter Tight",sans-serif;color:${C.navy}}
.alerta .et{margin-bottom:10px}
svg.radar{position:absolute;left:0;top:0}
.front{position:absolute;transform:translate(-50%,-50%);padding:12px 22px;border-radius:999px;background:rgb(255 255 255/.92);
  border:1.5px solid rgb(255 255 255/.8);box-shadow:0 14px 30px -18px rgb(15 27 67/.55);font:500 38px/1 "Inter Tight",sans-serif;color:${C.navy};white-space:nowrap}
.echipa{position:absolute;left:${cx}px;top:${cy}px;transform:translate(-50%,-50%);font:600 30px/1.05 "Inter Tight",sans-serif;color:${C.navy};text-align:center;white-space:nowrap}
.curs{top:970px;padding:32px 40px 30px}
.curs .ca{--fs:118px}
.curs .fraza{margin-top:18px;font-size:44px}
.curs .jos{margin-top:22px}
</style>
<div class="sticla alerta">${svgI('alerta', 64)}<div><p class="et">Alertă · Echipa ta · 2026</p><p class="t">Fronturi din toate direcțiile</p></div></div>
<svg class="radar" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true">
${[90, 170, 250].map(r => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${r === 250 ? 'rgb(255 255 255/.28)' : 'none'}" stroke="rgb(15 27 67/.16)" stroke-width="2" stroke-dasharray="${r === 250 ? '0' : '6 10'}"/>`).join('')}
${rd.fr}
<circle cx="${cx}" cy="${cy}" r="76" fill="#fff" stroke="#F28C3B" stroke-width="8"/><circle cx="${cx}" cy="${cy}" r="80.5" fill="none" stroke="#C96A1E" stroke-width="1.5"/>
</svg>${rd.et}
<p class="echipa">Echipa<br>ta</p>
<div class="sticla curs"><h1 class="ca">Change Agility</h1><p class="fraza">Mai multă presiune nu aduce adaptare.<br>Aduce uzură.</p><div class="jos"><span class="punct"></span><span class="marca">BEMORE Learning Studio</span></div></div>`;

// Verificarea ecranelor de vreme: nicio pereche de texte nu se suprapune, iar textul nu trece peste marginea sticlei.
const VERIF_VREME = `(()=>{if(!document.querySelector('.sticla')||document.querySelector('.umbra'))return [];const out=[];
  const cx=document.createElement('canvas').getContext('2d');
  const box=el=>{const r=document.createRange();r.selectNodeContents(el);const q=[...r.getClientRects()];if(!q.length)return null;
    const cs=getComputedStyle(el);cx.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;const m=cx.measureText(el.textContent.trim()||'x');
    let L=1e9,T=1e9,R=-1e9,B=-1e9;for(const k of q){const b=k.top+m.fontBoundingBoxAscent;L=Math.min(L,k.left);R=Math.max(R,k.right);T=Math.min(T,b-m.actualBoundingBoxAscent);B=Math.max(B,b+m.actualBoundingBoxDescent);}
    return {left:L,right:R,top:T,bottom:B};};
  const els=[...document.querySelectorAll('p,h1 span,h1:not(:has(span)),.marca')].filter(e=>!e.querySelector('p'));
  const R=els.map(e=>[e,box(e)]).filter(([,r])=>r);
  for(const [e,r] of R){const s=e.closest('.sticla');if(!s)continue;const q=s.getBoundingClientRect();
    if(r.left<q.left+20||r.right>q.right-20||r.top<q.top+12||r.bottom>q.bottom-12)out.push('sticlă: '+e.textContent.trim().slice(0,24));}
  for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const [a,ra]=R[i],[c,rc]=R[j];if(a.contains(c)||c.contains(a))continue;
    if(ra.left<rc.right-1&&rc.left<ra.right-1&&ra.top<rc.bottom-1&&rc.top<ra.bottom-1)out.push('suprapus: '+a.textContent.trim().slice(0,16)+' / '+c.textContent.trim().slice(0,16));}
  const s=[...document.querySelectorAll('.sticla')].map(e=>e.getBoundingClientRect());
  for(let i=0;i<s.length;i++)for(let j=i+1;j<s.length;j++)if(s[i].bottom>s[j].top&&s[j].bottom>s[i].top)out.push('sticle suprapuse');
  for(const f of document.querySelectorAll('.front,.echipa')){const q=f.getBoundingClientRect();for(const t of s)if(q.bottom>t.top&&q.top<t.bottom&&q.right>t.left&&q.left<t.right)out.push('front peste sticlă: '+f.textContent);}
  return out;})()`;

// Verificarea biletului, cu rotația scoasă (coordonatele biletului): textul stă în bilet, deasupra liniei
// de rupere sau sub ea (nu peste), și nicio pereche de texte nu se suprapune.
const VERIF_BILET = `(()=>{const u=document.querySelector('.umbra');if(!u||!document.querySelector('.cotor'))return [];const out=[];
  const t0=u.style.transform;u.style.transform='none';const b=document.querySelector('.bilet').getBoundingClientRect();
  const TY=document.querySelector('.rupt').getBoundingClientRect().top;
  const els=[...document.querySelectorAll('.bilet p,.bilet .marca,.bilet .nume span,.bilet svg')];
  // cutia literelor, nu a fontului: linia de bază din fontBoundingBoxAscent, apoi actualBoundingBox (canvas)
  const cx=document.createElement('canvas').getContext('2d');
  const box=el=>{if(el.tagName==='svg')return el.getBoundingClientRect();const r=document.createRange();r.selectNodeContents(el);const q=r.getClientRects();
    const cs=getComputedStyle(el);cx.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;let L=1e9,T=1e9,Rr=-1e9,B=-1e9;
    const m=cx.measureText(el.textContent.trim()||'x');
    for(const k of q){const base=k.top+m.fontBoundingBoxAscent;L=Math.min(L,k.left);Rr=Math.max(Rr,k.right);T=Math.min(T,base-m.actualBoundingBoxAscent);B=Math.max(B,base+m.actualBoundingBoxDescent);}
    return {left:L,right:Rr,top:T,bottom:B,width:Rr-L};};
  const R=els.map(el=>[el,box(el)]).filter(([,r])=>r.width);
  for(const [el,r] of R){const n=(el.textContent||'svg').trim().slice(0,24);
    if(r.left<b.left+40||r.right>b.right-40)out.push('lateral: '+n);
    const jos=!!el.closest('.cotor');if(jos?r.top<TY+16:r.bottom>TY-16)out.push('rupere: '+n);}
  for(let i=0;i<R.length;i++)for(let j=i+1;j<R.length;j++){const [a,ra]=R[i],[c,rc]=R[j];if(a.contains(c)||c.contains(a))continue;
    if(ra.left<rc.right-1&&rc.left<ra.right-1&&ra.top<rc.bottom-1&&rc.top<ra.bottom-1)out.push('suprapus: '+(a.textContent||'svg').trim().slice(0,16)+' / '+(c.textContent||'svg').trim().slice(0,16));}
  u.style.transform=t0;return out;})()`;

const LISTA = [
  ['a-aleea', A], ['b-peretele', B], ['c-dictionarul', C_], ['d-prognoza', D], ['e-biletul', E], ['f-afisul', F_],
  ['e1-biletul', E1], ['e2-biletul', E2], ['d1-vremea', D1], ['d2-vremea', D2], ['d3-vremea', D3],
].filter(([n]) => process.argv.length < 3 || process.argv.slice(2).includes(n));
// Doar unele imagini:  node …/gen.mjs e1-biletul e2-biletul
const W = 1080, H = 1350;
const tmp = mkdtempSync(join(tmpdir(), 'post-ca2-'));
const br = await launch({ port: 9363 });
try {
  for (const [nume, fn] of LISTA) {
    const f = join(tmp, `${nume}.html`);
    writeFileSync(f, `<!doctype html><html lang="ro"><head><meta charset="utf-8"></head><body class="grain">${fn(W, H)}</body></html>`);
    const p = await br.open(pathToFileURL(f).href);
    await br.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] }, p.sessionId);
    await br.send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false }, p.sessionId);
    await br.evaluate(p, 'document.fonts.ready.then(()=>new Promise(r=>setTimeout(r,500)))');
    await br.evaluate(p, 'window.scrie ? (window.scrie(), 1) : 0'); // după ce fereastra are mărimea imaginii
    // verificări: fonturile, textul ieșit din imagine (marginea de 40 px), textul tăiat pe orizontală
    const v = await br.evaluate(p, `(()=>{const out=[];
      if(!document.fonts.check('200 40px Sora')||!document.fonts.check('600 20px "Inter Tight"'))out.push('font lipsă');
      for(const el of document.querySelectorAll('h1,p,li,.marca,.et')){if(el.closest('.nota'))continue;const r=el.getBoundingClientRect();if(!r.width)continue;
        if(r.left<40||r.top<40||r.right>${W - 40}||r.bottom>${H - 40})out.push('margine: '+el.textContent.trim().slice(0,30));
        if(el.scrollWidth>el.clientWidth+1)out.push('tăiat: '+el.textContent.trim().slice(0,30));}
      return out;})()`);
    v.push(...await br.evaluate(p, VERIF_BILET), ...await br.evaluate(p, VERIF_VREME));
    await br.screenshot(p, join(HERE, `${nume}.png`));
    const cuv = await br.evaluate(p, 'document.body.dataset.cuvinte||""');
    console.log(nume.padEnd(15), v.length ? v : 'OK', cuv ? `(bilețele: ${cuv})` : '', Math.round(statSync(join(HERE, `${nume}.png`)).size / 1024) + ' KB');
  }
} finally { br.close(); rmSync(tmp, { recursive: true, force: true }); }
