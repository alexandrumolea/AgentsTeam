// 1. Cursul participanților: un JSON pentru site, fără :::trainer, fără :::sala, fără ediție.
// Verificarea se face pe REZULTAT (Radu, 1.6), nu doar pe sursă.
import { creeazaRandare, text, normal, escapeHtml } from './randare.mjs';
import { imaginiDin } from './sursa.mjs';

const IN_CURS = new Set(['text', 'sala-si-curs', 'participant']);
const CLASA = { 'sala-si-curs': 'curs-cheie', participant: 'curs-tu' };

export function construiesteExport(c) {
  const randeaza = creeazaRandare();
  const imagini = new Set();
  const module = c.module
    .filter((m) => m.tip !== 'pauza') // o pauză nu e o pagină de citit
    .map((m) => {
      const html = m.segmente
        .filter((s) => IN_CURS.has(s.strat))
        .map((s) => {
          imaginiDin(s.md).forEach((i) => imagini.add(i));
          const h = randeaza(s.md);
          return CLASA[s.strat] ? `<div class="${CLASA[s.strat]}">\n${h}</div>\n` : h;
        })
        .join('');
      return { id: m.id, titlu: m.titlu, tip: m.tip, durata: m.durata, html };
    });
  const x = c.curs;
  return {
    format: 'curs-participanti/1',
    sursa: 'generat de curs/build.mjs; nu edita de mână',
    curs: { slug: x.slug, titlu: x.titlu, promisiune: x.promisiune, limba: x.limba, brand: x.brand, public: String(x.public) },
    module,
    imagini: [...imagini].sort(),
  };
}

/** Fragmentele (de cel puțin 4 cuvinte) din tot ce NU are voie să ajungă la participanți. */
function fragmenteInterzise(c) {
  const randeaza = creeazaRandare({ randuriNoi: true });
  const out = [];
  const adauga = (sursa, html) => {
    for (const bucata of text(html).split(/[\n.!?;:„”"«»]+/)) {
      const n = normal(bucata);
      if (n.split(' ').length >= 4) out.push({ sursa, n, original: bucata.trim() });
    }
  };
  for (const m of c.module) for (const s of m.segmente) {
    if (s.strat === 'trainer' || s.strat === 'sala') adauga(`${m.fisier}:${s.linia} (:::${s.strat})`, randeaza(s.md));
  }
  if (c.editie.nota_trainer) adauga(`ediția ${c.editie.fisier} (nota_trainer)`, escapeHtml(c.editie.nota_trainer));
  return out;
}

/** Întoarce lista de erori. Goală = exportul e sigur de publicat. */
export function verificaExport(json, c) {
  const erori = [];
  const brut = JSON.stringify(json);
  const tot = normal(text([json.curs.titlu, json.curs.promisiune, ...json.module.flatMap((m) => [m.titlu, m.html])].join('\n')));
  const totCuSpatii = ` ${tot} `;

  if (brut.includes(':::')) erori.push('exportul conține „:::”: un bloc a scăpat netransformat');
  for (const f of fragmenteInterzise(c)) {
    if (totCuSpatii.includes(` ${f.n} `)) erori.push(`exportul conține text din ${f.sursa}: „${f.original}”. Dacă trebuie să apară și în curs, folosește „:::sala-si-curs” sau reformulează`);
  }
  for (const nume of c.editie.nume_interzise ?? []) {
    const n = normal(nume);
    if (n && totCuSpatii.includes(` ${n} `)) erori.push(`exportul conține un nume interzis de ediție („${nume}”). Scoate-l din textul cursului (poate sta în :::trainer)`);
  }
  for (const cheie of ['ancora', 'schita', 'materiale', 'nota_trainer', 'nume_interzise', 'sari_peste']) {
    if (brut.includes(`"${cheie}"`)) erori.push(`exportul conține câmpul „${cheie}”, care e doar pentru trainer`);
  }
  return erori;
}
