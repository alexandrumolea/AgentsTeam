// Editorul local (1.11, Alex, 2026-11-17): găsește și rescrie UN bloc dintr-un fișier al cursului, fără să atingă restul.
// Referința unui bloc: <id>#<n> (al n-lea :::sala / :::sala-si-curs din fișier, ca id-ul ecranului, fără @k)
// sau <id>#nota<n> (al n-lea :::trainer). <id> e id-ul unui modul (din antet) sau numele unei piese (piese/<id>.md).
import { readFileSync, readdirSync, existsSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, resolve, relative, sep, isAbsolute } from 'node:path';
import { createHash } from 'node:crypto';

const ID_OK = /^[a-z0-9]+(-[a-z0-9]+)*$/;
export const hash = (text) => createHash('sha256').update(text).digest('hex');

export class EroareEditor extends Error {
  constructor(mesaj, cod = 400) { super(mesaj); this.cod = cod; }
}

/** „curba#2” → { id: 'curba', fel: 'sala', n: 2 }; „perechi-curba@2#1” → piesa, fără @2; „curba#nota1” → nota trainerului. */
export function citesteRef(ref) {
  const m = /^([a-z0-9]+(?:-[a-z0-9]+)*)(?:@\d+)?#(nota)?(\d+)$/.exec(String(ref ?? ''));
  if (!m) throw new EroareEditor(`„${ref}” nu e un ecran sau o notă care se poate edita aici (titlurile și pauzele se schimbă în antet)`);
  return { id: m[1], fel: m[2] ? 'trainer' : 'sala', n: +m[3] };
}

/** Calea fișierului, verificată: doar în folderul cursului, fără .. și fără căi absolute. */
export function caleSigura(folder, rel) {
  if (!rel || isAbsolute(rel) || rel.split(/[\\/]/).includes('..')) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  const radacina = resolve(folder), cale = resolve(radacina, rel);
  if (cale !== radacina && !cale.startsWith(radacina + sep)) throw new EroareEditor(`cale interzisă: ${rel}`, 403);
  return cale;
}

/** Fișierul unui id: un modul (id din antet, în rădăcina cursului) sau o piesă (piese/<id>.md). */
export function fisierPentru(folder, id) {
  if (!ID_OK.test(id)) throw new EroareEditor(`id greșit: ${id}`);
  const piesa = join('piese', `${id}.md`);
  if (existsSync(caleSigura(folder, piesa))) return piesa;
  for (const f of readdirSync(resolve(folder)).filter((x) => x.endsWith('.md')).sort()) {
    const antet = /^---\n([\s\S]*?)\n---/.exec(readFileSync(caleSigura(folder, f), 'utf8').replace(/\r\n?/g, '\n'));
    if (antet && new RegExp(`^id:\\s*["']?${id}["']?\\s*(#.*)?$`, 'm').test(antet[1])) return f;
  }
  throw new EroareEditor(`nu găsesc modulul sau piesa „${id}”`, 404);
}

/** Liniile blocului cerut: { deschidere, inchidere } (indexuri de linie), plus Markdown-ul dinăuntru. */
export function gasesteBloc(text, fel, n) {
  const linii = text.split('\n');
  let i = 0;
  if (linii[0] === '---') { i = 1; while (i < linii.length && !/^---[ \t]*$/.test(linii[i])) i++; i++; }
  let deschis = null, k = 0;
  for (; i < linii.length; i++) {
    const t = linii[i].trim();
    if (!t.startsWith(':::')) continue;
    if (/^:::\s*$/.test(t)) {
      if (deschis && deschis.potrivit) return { deschidere: deschis.linia, inchidere: i, md: linii.slice(deschis.linia + 1, i).join('\n'), linii };
      deschis = null; continue;
    }
    const m = /^:::\s*([A-Za-z0-9_-]+)/.exec(t);
    if (!m || deschis) continue;
    const e = fel === 'trainer' ? m[1] === 'trainer' : m[1] === 'sala' || m[1] === 'sala-si-curs';
    deschis = { linia: i, potrivit: e && ++k === n };
  }
  throw new EroareEditor(`nu găsesc blocul ${fel === 'trainer' ? ':::trainer' : ':::sala'} cu numărul ${n}`, 404);
}

/** Textul nou al blocului: fără linii care ar strica structura fișierului. */
export function verificaMd(md, fel) {
  const t = String(md ?? '').replace(/\r\n?/g, '\n').replace(/\s+$/, '');
  if (fel === 'sala' && !t.trim()) throw new EroareEditor('Ecranul nu poate rămâne gol. Dacă nu-l vrei, ascunde-l din vederea Ecrane.');
  const rau = t.split('\n').find((l) => /^\s*::/.test(l));
  if (rau) throw new EroareEditor(`Rândul „${rau.trim()}” începe cu „::”, care în fișier deschide sau închide blocuri. Scrie-l altfel.`);
  if (t.length > 20000) throw new EroareEditor('Textul e prea lung pentru un singur ecran.');
  return t;
}

/** Citește blocul unei referințe. */
export function citesteBloc(folder, ref) {
  const r = citesteRef(ref);
  const fisier = fisierPentru(folder, r.id);
  const text = readFileSync(caleSigura(folder, fisier), 'utf8');
  const b = gasesteBloc(text.replace(/\r\n?/g, '\n'), r.fel, r.n);
  return { ...r, fisier, md: b.md.replace(/^\n+|\s+$/g, ''), deschidere: b.linii[b.deschidere].trim(), hash: hash(text) };
}

/**
 * Rescrie blocul: verifică întâi că fișierul nu s-a schimbat pe disc de când a fost citit (hash), păstrează
 * o copie a versiunii anterioare în .editor-istoric/ și înlocuiește doar liniile dintre „:::sala…” și „:::”.
 * Întoarce { fisier, inainte, dupa, copie }.
 */
export function scrieBloc(folder, ref, md, hashCitit, { acum = new Date() } = {}) {
  const r = citesteRef(ref);
  const nou = verificaMd(md, r.fel);
  const fisier = fisierPentru(folder, r.id);
  const cale = caleSigura(folder, fisier);
  const inainte = readFileSync(cale, 'utf8');
  if (!hashCitit || hash(inainte) !== hashCitit) {
    throw new EroareEditor(`${fisier} s-a schimbat pe disc între timp (poate l-a editat altcineva). Nu l-am suprascris: copiază-ți textul, reîncarcă pagina și încearcă din nou.`, 409);
  }
  const crlf = inainte.includes('\r\n');
  const b = gasesteBloc(inainte.replace(/\r\n?/g, '\n'), r.fel, r.n);
  const linii = b.linii.slice(0, b.deschidere + 1).concat(nou.split('\n'), b.linii.slice(b.inchidere));
  let dupa = linii.join('\n');
  if (crlf) dupa = dupa.replace(/\n/g, '\r\n');
  if (dupa === inainte) return { fisier, inainte, dupa, copie: null, neschimbat: true };
  // Copia de siguranță: .editor-istoric/<data-ora>__<fișier>, cu un .gitignore propriu (nu intră în niciun repo).
  const istoric = caleSigura(folder, '.editor-istoric');
  mkdirSync(istoric, { recursive: true });
  if (!existsSync(join(istoric, '.gitignore'))) writeFileSync(join(istoric, '.gitignore'), '*\n');
  const marca = acum.toISOString().replace(/[:.]/g, '-');
  const copie = join(istoric, `${marca}__${fisier.replace(/[\\/]/g, '__')}`);
  copyFileSync(cale, copie);
  writeFileSync(cale, dupa);
  return { fisier, inainte, dupa, copie: relative(resolve(folder), copie) };
}
