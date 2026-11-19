// Fișa piesei din Harvest (Alex, 2026-11-19): „să pot deschide fiecare piesă și să-i văd toată logica”.
// Sursa, în ordine: harvest/<id>.md (fișa scrisă de Irina și Daria), apoi piesa produsă (piese/<id>.md sau modulul cu acest id).
// Markdown → HTML cu aceeași randare ca restul materialului: HTML-ul brut e afișat ca text, linkurile javascript:/data: devin text,
// linkurile externe se deschid în tab nou. Id-ul e validat (litere mici, cifre, cratimă), deci nu poate ieși din folderul cursului.
import { readFileSync, existsSync, realpathSync } from 'node:fs';
import { sep } from 'node:path';
import { parse as parseYaml } from 'yaml';
import { creeazaRandare, escapeHtml as e } from './randare.mjs';
import { imparteInStraturi } from './sursa.mjs';
import { caleSigura, fisierPentru, EroareEditor } from './editor-sursa.mjs';

const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const DOSAR = 'harvest';
const randeaza = creeazaRandare({ atribut: 'data-img', linkuriNoi: true });

const STRAT = {
  sala: 'Ecran în sală', 'sala-si-curs': 'Ecran în sală și în cursul online', trainer: 'Nota trainerului', participant: 'Pentru participant',
};
const ANTET = [
  ['durata', 'Durată', (v) => `${v} min`], ['tip', 'Tip'], ['format', 'Format'], ['energie', 'Energie'],
  ['obiectiv', 'Obiectiv'], ['ancora', 'Ancora'], ['materiale', 'Materiale', (v) => (Array.isArray(v) ? v.join(', ') : v)],
];

/** Citește un fișier al cursului doar dacă și ținta lui reală (după legăturile simbolice) e în folderul cursului. */
function citesteSigur(folder, rel) {
  const cale = caleSigura(folder, rel), radacina = realpathSync(folder), real = realpathSync(cale);
  if (!real.startsWith(radacina + sep)) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  return readFileSync(real, 'utf8');
}

/** Piesa produsă: antetul ca listă scurtă, apoi textul, bloc cu bloc (ecranele din sală, nota trainerului, participantul). */
function dinPiesa(text) {
  const t = text.replace(/\r\n?/g, '\n');
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(t);
  let antet = {};
  if (m) { try { antet = parseYaml(m[1]) ?? {}; } catch { antet = {}; } }
  if (typeof antet !== 'object' || Array.isArray(antet)) antet = {};
  const corp = m ? t.slice(m[0].length) : t;
  const segmente = imparteInStraturi(corp, '', 1, [], { marcaj: true });
  const lista = ANTET.filter(([k]) => antet[k] != null && antet[k] !== '' && !(Array.isArray(antet[k]) && !antet[k].length))
    .map(([k, eticheta, f]) => `<div><dt>${eticheta}</dt><dd>${e(f ? f(antet[k]) : antet[k])}</dd></div>`).join('');
  const parti = segmente.filter((s) => s.strat !== 'piese' && s.md.trim()).map((s) => {
    const cron = s.atribute?.cronometru ? ` · cronometru ${e(s.atribute.cronometru)} min` : '';
    return s.strat === 'text' ? randeaza(s.md) : `<section class="fisa-bloc fisa-${e(s.strat)}"><p class="eticheta">${STRAT[s.strat] ?? e(s.strat)}${cron}</p>${randeaza(s.md)}</section>`;
  }).join('\n');
  return { titlu: antet.titlu == null ? '' : String(antet.titlu), html: (lista ? `<dl class="fisa-antet">${lista}</dl>\n` : '') + parti };
}

/**
 * Fișa unei piese, citită acum de pe disc. Întoarce { id, sursa: 'harvest' | 'piesa' | null, fisier, titlu, html }.
 * sursa null = nu există nimic scris încă. Un id greșit e eroare 400 (fără să atingă discul).
 */
export function fisaPiesei(folder, id) {
  id = String(id ?? '');
  if (!ID_OK.test(id)) throw new EroareEditor(`id greșit: „${id.slice(0, 60)}”`, 400);
  const harvest = `${DOSAR}/${id}.md`, cale = caleSigura(folder, harvest);
  if (existsSync(cale)) return { id, sursa: 'harvest', fisier: harvest, titlu: '', html: randeaza(citesteSigur(folder, harvest)) };
  let fisier = null;
  try { fisier = fisierPentru(folder, id); } catch (err) { if (err.cod !== 404) throw err; }
  if (!fisier) return { id, sursa: null, fisier: null, titlu: '', html: '' };
  return { id, sursa: 'piesa', fisier, ...dinPiesa(citesteSigur(folder, fisier)) };
}

/** Fișele tuturor candidatelor, pentru fișierul offline (se includ la build). Doar cele care au ceva scris. */
export function fiseleMasa(c) {
  const out = {};
  for (const x of c.masa?.candidate ?? []) {
    try { const f = fisaPiesei(c.folder, x.id); if (f.sursa) out[x.id] = f; } catch { /* id-urile candidatelor sunt deja verificate */ }
  }
  return out;
}
