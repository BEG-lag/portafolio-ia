/* Telón de entrada. Corre en el <head>, antes del primer pintado:
   decide si se muestra (una vez por sesión, nunca con movimiento reducido),
   bloquea el scroll mientras corre y avisa al terminar con el evento "intro:fin".
   Para verlo otra vez: agrega ?intro=1 a la URL. */
(function () {
  var root = document.documentElement;
  root.classList.add('js', 'js-wait');
  setTimeout(function () { root.classList.remove('js-wait'); }, 3500);

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var force = /[?&]intro=1/.test(location.search);
  var seen = false;
  try { seen = sessionStorage.getItem('beg_intro_visto') === '1'; } catch (e) {}

  if (reduce || (seen && !force)) { root.classList.add('intro-skip'); return; }
  try { sessionStorage.setItem('beg_intro_visto', '1'); } catch (e) {}
  root.classList.add('intro-lock', 'intro-playing');

  var listo = false;
  function fin() {
    if (listo) return;
    listo = true;
    root.classList.remove('intro-lock', 'intro-playing');
    root.classList.add('intro-skip');
    var el = document.getElementById('intro');
    if (el && el.parentNode) el.parentNode.removeChild(el);
    document.dispatchEvent(new Event('intro:fin'));
  }
  setTimeout(fin, 2900);
  setTimeout(fin, 4200); /* respaldo */
})();
