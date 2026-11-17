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
      // Pe ecranele din sală, o imagine stă în paragraful ei (<p class="doar-imagine">), chiar dacă e scrisă imediat sub text:
      // așa poate lua exact spațiul rămas pe ecran (stil.css). În rest, paragrafele rămân cum le face marked.
      paragraph(tok) {
        if (!randuriNoi || !tok.tokens?.some((t) => t.type === 'image')) return false;
        const grupuri = [];
        for (const t of tok.tokens) {
          const img = t.type === 'image';
          if (!img && (t.type === 'br' || (t.type === 'text' && !t.text.trim())) && (!grupuri.length || grupuri.at(-1).img)) continue;
          if (!grupuri.length || grupuri.at(-1).img !== img || img) grupuri.push({ img, tokens: [] });
          grupuri.at(-1).tokens.push(t);
        }
        for (const g of grupuri) while (!g.img && g.tokens.length && (g.tokens.at(-1).type === 'br' || (g.tokens.at(-1).type === 'text' && !g.tokens.at(-1).text.trim()))) g.tokens.pop();
        return grupuri.filter((g) => g.tokens.length)
          .map((g) => `<p${g.img ? ' class="doar-imagine"' : ''}>${this.parser.parseInline(g.tokens)}</p>\n`).join('');
      },
    },
  });
  return (md) => m.parse(md ?? '');
}

/** Textul simplu dintr-un HTML, pentru verificări. */
export const text = (html) => String(html).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/** Normalizare pentru comparații: litere mici, fără diacritice, fără punctuație, spații simple. */
export const normal = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
