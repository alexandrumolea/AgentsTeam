// Pagina Despre: pachetul de cărți se rotește doar cu JavaScript, ca să aibă buton de pauză (WCAG 2.2.2).
// Click sau Enter pe pachet: pauză / pornește. Cu „reduce motion”, pachetul stă pe loc și butonul rămâne inactiv.
document.body.classList.remove('no-js');
const stage = document.querySelector('.values .stage');
if (stage){
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const sync = () => { stage.disabled = still.matches; };
  sync();
  still.addEventListener('change', sync);
  stage.addEventListener('click', () => stage.setAttribute('aria-pressed', String(stage.getAttribute('aria-pressed') !== 'true')));
}
// Orbita drumului: lumina face o singură trecere, de la primul an la „azi”, când orbita intră în ecran (CSS: .orb.drum).
const orb = document.querySelector('.orb');
if (orb && 'IntersectionObserver' in window){
  const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { orb.classList.add('drum'); io.disconnect(); } }, { threshold: 0.35 });
  io.observe(orb);
} else if (orb) orb.classList.add('drum');
