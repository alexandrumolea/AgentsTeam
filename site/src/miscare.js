// Butonul „Oprește mișcarea” (T-039, început pe pagina Despre): pune clasa `still` pe <html>, care oprește
// toate animațiile CSS (site.css), și ține minte alegerea de la o pagină la alta. Se încarcă în <head>, fără defer,
// ca alegerea să se aplice înainte de prima randare. Orice pagină care are un <button class="motion" hidden> îl primește.
(() => {
  const KEY = 'miscare', root = document.documentElement;
  try { root.classList.toggle('still', localStorage.getItem(KEY) === 'oprita'); } catch {}
  const sync = b => { const t = b.querySelector('span'); if (t) t.textContent = root.classList.contains('still') ? 'Pornește mișcarea' : 'Oprește mișcarea'; };
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button.motion').forEach(b => {
      b.hidden = false;
      sync(b);
      b.addEventListener('click', () => {
        const oprita = root.classList.toggle('still');
        try { oprita ? localStorage.setItem(KEY, 'oprita') : localStorage.removeItem(KEY); } catch {}
        document.querySelectorAll('button.motion').forEach(sync);
      });
    });
  });
})();
