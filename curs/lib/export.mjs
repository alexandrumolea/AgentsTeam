// 1. Cursul participanților: un JSON pentru site, fără :::trainer, fără :::sala, fără ediție.
// Verificarea se face pe REZULTAT (Radu, 1.6), nu doar pe sursă.
import { creeazaRandare, text, normal, escapeHtml } from './randare.mjs';
import { imaginiDin, desfasoara } from './sursa.mjs';

const IN_CURS = new Set(['text', 'sala-si-curs', 'participant']);
const CLASA = { 'sala-si-curs': 'curs-cheie', participant: 'curs-tu' };

export function construiesteExport(c) {
  const randeaza = creeazaRandare();
  const imagini = new Set();
  // Din ediție: modulele și piesele singure din agendă, în ordinea ei, doar cu piesele folosite care au in_curs: da.
  // O pauză nu e o pagină de citit.
  const module = c.agenda
    .filter((r) => (r.fel === 'modul' && r.modul.tip !== 'pauza') || (r.fel === 'piesa' && r.piesa.in_curs))
    .map((r) => {
      let html = '';
      for (const s of desfasoara(r)) {
        if (s.piesa && !s.piesa.in_curs) continue;
        if (r.fel === 'piesa' && (s.strat === 'piesa-inceput' || s.strat === 'piesa-sfarsit')) continue; // titlul paginii e chiar piesa
        if (s.strat === 'piesa-inceput') { html += `<section class="curs-piesa">\n<h3>${escapeHtml(s.piesa.titlu)}</h3>\n`; continue; }
        if (s.strat === 'piesa-sfarsit') { html += '</section>\n'; continue; }
        if (!IN_CURS.has(s.strat)) continue;
        imaginiDin(s.md).forEach((i) => imagini.add(i));
        const h = randeaza(s.md);
        html += CLASA[s.strat] ? `<div class="${CLASA[s.strat]}">\n${h}</div>\n` : h;
      }
      const sursa = r.fel === 'modul' ? r.modul : r.piesa;
      return { id: sursa.id, titlu: sursa.titlu, tip: sursa.tip, durata: r.durata, html };
    });
  const x = c.curs;
  return {
    format: 'curs-participanti/3',
    sursa: 'generat de curs/build.mjs; nu edita de mână',
    curs: { slug: x.slug, titlu: x.titlu, promisiune: x.promisiune, limba: x.limba, brand: x.brand, public: String(x.public) },
    obiective: c.obiective, // publice: „ce iei cu tine”, ca listă simplă (fără bife)
    module,
    imagini: [...imagini].sort(),
  };
}

/** Fragmentele (de cel puțin 4 cuvinte) din tot ce NU are voie să ajungă la participanți. */
function fragmenteInterzise(c) {
  const randeaza = creeazaRandare({ randuriNoi: true });
  const out = [];
  // Titlurile modulelor și ale pieselor sunt publice: o notă de trainer care le pomenește („treci la «Curba de pe podea»”) nu e o scurgere.
  const titluri = new Set([...c.module, ...c.piese.values()].map((x) => normal(x.titlu ?? '')));
  const adauga = (sursa, html) => {
    for (const bucata of text(html).split(/[\n.!?;:„”"«»]+/)) {
      const n = normal(bucata);
      if (n.split(' ').length >= 4 && !titluri.has(n)) out.push({ sursa, n, original: bucata.trim() });
    }
  };
  // Toată banca, nu doar ce e în agendă: o notă nu are voie să scape nici prin alt exercițiu.
  for (const f of [...c.module, ...c.piese.values()]) for (const s of f.segmente) {
    if (s.strat === 'trainer' || s.strat === 'sala') adauga(`${s.fisier}:${s.linia} (:::${s.strat})`, randeaza(s.md));
  }
  if (c.editie.nota_trainer) adauga(`ediția ${c.editie.fisier} (nota_trainer)`, escapeHtml(c.editie.nota_trainer));
  return out;
}

/** Întoarce lista de erori. Goală = exportul e sigur de publicat. */
export function verificaExport(json, c) {
  const erori = [];
  const brut = JSON.stringify(json);
  const tot = normal(text([json.curs.titlu, json.curs.promisiune, ...(json.obiective ?? []), ...json.module.flatMap((m) => [m.titlu, m.html])].join('\n')));
  const totCuSpatii = ` ${tot} `;

  if (brut.includes(':::')) erori.push('exportul conține „:::”: un bloc a scăpat netransformat');
  for (const f of fragmenteInterzise(c)) {
    if (totCuSpatii.includes(` ${f.n} `)) erori.push(`exportul conține text din ${f.sursa}: „${f.original}”. Dacă trebuie să apară și în curs, folosește „:::sala-si-curs” sau reformulează`);
  }
  for (const nume of c.editie.nume_interzise ?? []) {
    const n = normal(nume);
    if (n && totCuSpatii.includes(` ${n} `)) erori.push(`exportul conține un nume interzis de ediție („${nume}”). Scoate-l din textul cursului (poate sta în :::trainer)`);
  }
  for (const cheie of ['ancora', 'schita', 'materiale', 'nota_trainer', 'nume_interzise', 'agenda', 'obiectiv', 'energie', 'familie', 'etichete']) {
    if (brut.includes(`"${cheie}"`)) erori.push(`exportul conține câmpul „${cheie}”, care e doar pentru trainer`);
  }
  return erori;
}
