// Markdown → HTML. HTML-ul scris de mână în fișiere e afișat ca text, nu executat.
import { Marked } from 'marked';

export const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/**
 * @param {(src:string)=>string} imagine  cum devine adresa unei imagini
 *        (cursul online: rămâne „materiale/x.png”; materialul trainerului: o cheie din harta de imagini)
 * @param {'src'|'data-img'} atribut
 */
export function creeazaRandare({ imagine = (s) => s, atribut = 'src', randuriNoi = false } = {}) {
  // randuriNoi: pe ecranele din sală, fiecare rând nou rămâne rând nou.
  const m = new Marked({ gfm: true, breaks: randuriNoi });
  m.use({
    renderer: {
      html: (tok) => escapeHtml(tok.text),
      // Linkurile javascript:/data:/vbscript: devin text simplu (cursul ajunge pe site-ul public).
      link: (tok) => (/^\s*(javascript|data|vbscript):/i.test(tok.href) ? escapeHtml(tok.text) : false),
      image: (tok) => `<img ${atribut}="${escapeHtml(imagine(tok.href))}" alt="${escapeHtml(tok.text)}">`,
    },
  });
  return (md) => m.parse(md ?? '');
}

/** Textul simplu dintr-un HTML, pentru verificări. */
export const text = (html) => String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Normalizare pentru comparații: litere mici, fără diacritice, fără punctuație, spații simple. */
export const normal = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
