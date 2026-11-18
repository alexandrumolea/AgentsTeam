// Pagina Despre: fără „no-js”, animațiile CSS pornesc (orbita, cărțile). Eticheta de sub orbită arată rolul
// punctului peste care treci cu mouse-ul, la care ajungi cu Tab sau pe care îl atingi (atingerea îl fixează).
document.body.classList.remove('no-js');
const badge = document.querySelector('.orbit .badge');
if (badge){
  const role = badge.querySelector('.role'), dots = [...document.querySelectorAll('.orbit button.pt')];
  let pinned = null;
  const em = (text, cls) => { const e = document.createElement('em'); e.textContent = text; if (cls) e.className = cls; return e; };
  const show = d => {
    if (!d) { badge.classList.remove('on'); return; }
    role.replaceChildren(em(d.dataset.yrs), document.createTextNode(d.dataset.role), ...(d.classList.contains('now') ? [em('acum', 'acum')] : []));
    badge.classList.add('on');
  };
  dots.forEach(d => {
    d.addEventListener('mouseenter', () => show(d));
    d.addEventListener('mouseleave', () => show(pinned));
    d.addEventListener('focus', () => show(d));
    d.addEventListener('blur', () => show(pinned));
    d.addEventListener('click', () => { pinned = pinned === d ? null : d; dots.forEach(x => x.setAttribute('aria-pressed', String(x === pinned))); show(pinned || d); });
  });
}
