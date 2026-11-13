// Banner de cookies de pivotek.mx (chat Web). Textos del chat Legal, aprobados por BEG:
// opción A, Google Analytics sólo después de «Aceptar» (legal/01-revision-aviso-y-cookies.md, 8 y 9).
// Contrato con js/analitica.js (chat SEO): la decisión va en localStorage, clave "pivotek-cookies",
// {"decision": "aceptadas" | "rechazadas", "fecha": "AAAA-MM-DD", "version": "2026-11"};
// al decidir se dispara el evento 'pivotek:cookies' en document, aunque falle el guardado.
// Archivo propio porque la CSP no permite scripts en línea.
(function () {
  var CLAVE = 'pivotek-cookies';
  var VERSION = '2026-11'; // si cambia (por ejemplo, un proveedor nuevo), se vuelve a preguntar; avisar a SEO
  var ID_GA = 'G-0BEBP5SK25';
  var COOKIES_GA = ['_ga', '_ga_0BEBP5SK25'];
  var en = (document.documentElement.lang || '').indexOf('en') === 0;

  var T = en ? {
    region: 'Analytics cookies',
    titulo: 'Analytics cookies.',
    texto: ' If you accept them, Google Analytics will set cookies that record your browsing data (pages and clicks, where your visit came from, approximate location and device) so that I, Benjamín Esponda García, can measure statistically how the site is used. They are not used for advertising, and they are not set unless you accept. You can change your choice at any time under “Cookie preferences” at the bottom of the page.',
    aviso: 'Privacy notice (in Spanish)',
    aceptar: 'Accept',
    rechazar: 'Reject'
  } : {
    region: 'Cookies de analítica',
    titulo: 'Cookies de analítica.',
    texto: ' Si las aceptas, Google Analytics instalará cookies que registran datos de tu navegación (páginas y clics, origen de la visita, ubicación aproximada y dispositivo) para que yo, Benjamín Esponda García, mida de forma estadística cómo se usa el sitio. No se usan para publicidad y, si no las aceptas, no se instalan. Puedes cambiar tu decisión en cualquier momento en «Preferencias de cookies», al pie de la página.',
    aviso: 'Aviso de privacidad',
    aceptar: 'Aceptar',
    rechazar: 'Rechazar'
  };

  var enMemoria = null; // decisión de esta página si el navegador bloquea localStorage

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(CLAVE));
      if (d && d.version === VERSION && (d.decision === 'aceptadas' || d.decision === 'rechazadas')) return d.decision;
    } catch (e) {}
    return null;
  }

  function decision() { return leer() || enMemoria; }

  function guardar(dec) {
    enMemoria = dec;
    try {
      localStorage.setItem(CLAVE, JSON.stringify({ decision: dec, fecha: new Date().toISOString().slice(0, 10), version: VERSION }));
    } catch (e) {}
  }

  function hayCookiesGA() {
    return document.cookie.split(';').some(function (c) { return /^\s*_ga/.test(c); });
  }

  function borrarCookiesGA() {
    var vence = '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
    var dominios = ['', '; domain=pivotek.mx', '; domain=.pivotek.mx', '; domain=' + location.hostname, '; domain=.' + location.hostname];
    var nombres = COOKIES_GA.slice();
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (/^_ga/.test(n) && nombres.indexOf(n) < 0) nombres.push(n);
    });
    nombres.forEach(function (n) { dominios.forEach(function (d) { document.cookie = n + vence + d; }); });
  }

  // Banner: barra fija abajo, no bloquea la navegación; «Aceptar» y «Rechazar» con el mismo peso.
  var banner = document.createElement('div');
  banner.className = 'cookies';
  banner.setAttribute('role', 'region');
  banner.setAttribute('aria-label', T.region);
  banner.hidden = true;

  var caja = document.createElement('div');
  caja.className = 'cookies__in';

  var p = document.createElement('p');
  p.className = 'cookies__txt';
  var b = document.createElement('strong');
  b.textContent = T.titulo;
  var a = document.createElement('a');
  a.href = '/aviso-de-privacidad';
  if (en) a.hreflang = 'es';
  a.textContent = T.aviso;
  p.appendChild(b);
  p.appendChild(document.createTextNode(T.texto + ' '));
  p.appendChild(a);

  var botones = document.createElement('div');
  botones.className = 'cookies__btns';
  [['aceptadas', T.aceptar], ['rechazadas', T.rechazar]].forEach(function (par) {
    var bt = document.createElement('button');
    bt.type = 'button';
    bt.textContent = par[1];
    bt.addEventListener('click', function () { elegir(par[0]); });
    botones.appendChild(bt);
  });

  caja.appendChild(p);
  caja.appendChild(botones);
  banner.appendChild(caja);

  function mostrar(foco) {
    if (!banner.parentNode) document.body.appendChild(banner);
    banner.hidden = false;
    if (foco) botones.firstChild.focus();
  }

  function elegir(dec) {
    var previa = decision();
    guardar(dec);
    banner.hidden = true;
    try {
      document.dispatchEvent(new CustomEvent('pivotek:cookies', { detail: { decision: dec } }));
    } catch (e) {}
    // Retiro: si había aceptado (o quedaron cookies de GA), se apaga GA4 para que no vuelva a
    // escribir sus cookies al salir de la página, se borran y se recarga sin GA4.
    if (dec === 'rechazadas' && (previa === 'aceptadas' || hayCookiesGA())) {
      window['ga-disable-' + ID_GA] = true;
      borrarCookiesGA();
      location.reload();
    }
  }

  // «Preferencias de cookies»: cualquier elemento con data-cookies="preferencias" reabre el banner.
  document.addEventListener('click', function (e) {
    var t = e.target.closest && e.target.closest('[data-cookies="preferencias"]');
    if (!t) return;
    e.preventDefault();
    mostrar(true);
  });

  window.pivotekCookies = { version: VERSION, decision: decision, abrir: function () { mostrar(true); } };

  // Si la decisión es «rechazadas» y quedó alguna cookie de GA (por ejemplo, la que GA4 reescribe
  // al cerrar la página en que se retiró el consentimiento), se borra al cargar; GA4 no se carga.
  if (decision() === 'rechazadas' && hayCookiesGA()) {
    window['ga-disable-' + ID_GA] = true;
    borrarCookiesGA();
  }

  function iniciar() { if (!decision()) mostrar(false); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar);
  else iniciar();
})();
