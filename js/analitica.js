// Google Analytics 4 de pivotek.mx (chat SEO). Archivo propio porque la CSP no permite scripts en línea.
// Eventos y ajustes acordados con el chat Analítica (pivotek/analitica/01-plan-de-medicion.md, 5.2 y 5.3).
// GA4 sólo se carga con consentimiento ("aceptadas") del banner de /js/consentimiento.js (chat Web, opción A de Legal).
(function () {
  if (location.hostname !== 'pivotek.mx') return; // fuera: vistas previas de Vercel y localhost

  var ID = 'G-0BEBP5SK25';
  var idioma = (document.documentElement.lang || '').indexOf('en') === 0 ? 'en' : 'es';
  var proyectos = { 'concriterio.mx': 'concriterio', 'casalegado.mx': 'casalegado', 'carocomunicando.com': 'carocomunicando' };
  var CLAVE = 'pivotek-cookies';
  var VERSION = '2026-11'; // si consentimiento.js expone window.pivotekCookies.version, manda esa
  var CATORCE_MESES = 36720000; // 425 días: caducidad de _ga en segundos (Legal, 9.5); se renueva con cada visita
  var cargado = false;

  function gtag() { window.dataLayer.push(arguments); }

  function medir(evento, parametros) {
    if (cargado) gtag('event', evento, parametros);
  }

  function cargar() {
    if (cargado) return;
    cargado = true;

    // Tráfico interno: abrir una vez https://pivotek.mx/?interno=1 en los navegadores de BEG y de prueba.
    var interno = /[?&]interno=1(&|$)/.test(location.search);
    try {
      if (interno) localStorage.setItem('pvk_interno', '1');
      interno = interno || localStorage.getItem('pvk_interno') === '1';
    } catch (e) {}

    window.dataLayer = window.dataLayer || [];
    window.gtag = gtag;
    var config = { allow_google_signals: false, allow_ad_personalization_signals: false, cookie_expires: CATORCE_MESES };
    if (interno) config.traffic_type = 'internal';
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    gtag('js', new Date());
    gtag('config', ID, config);

    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
    document.head.appendChild(s);
  }

  // Clics que importan. Nunca se manda un correo ni una URL mailto; el mailto del aviso no se mide.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var host = (a.hostname || '').replace(/^www\./, '');
    var ruta = (a.pathname || '').toLowerCase();
    if (href.indexOf('mailto:beg.empleos@') === 0) {
      medir('clic_correo', { idioma: idioma });
    } else if (host === 'linkedin.com' && ruta.indexOf('/in/') === 0) {
      medir('clic_linkedin', { idioma: idioma });
    } else if (/\/pdf\/(portafolio-beg-es|portfolio-beg-en)\.pdf$/.test(ruta)) {
      medir('descarga_portafolio', { idioma: idioma });
    } else if (proyectos[host]) {
      medir('clic_proyecto', { proyecto: proyectos[host], idioma: idioma });
    } else if (host === 'github.com' && ruta.indexOf('/beg-lag/portafolio-ia') === 0) {
      medir('clic_proyecto', { proyecto: 'github', idioma: idioma });
    } else if (host === 'github.com' && ruta.indexOf('/hainrixz/auto-crm') === 0) {
      medir('clic_proyecto', { proyecto: 'auto-crm', idioma: idioma });
    } else if (a.hasAttribute('hreflang') && a.host === location.host && (ruta === '/' || ruta === '/en')) {
      medir('cambio_idioma', { idioma: idioma });
    }
  });

  // ver_seccion (aprobado por Legal con el aviso nuevo): una vez por sección y por carga, cuando la mitad
  // de la sección, o la mitad de la pantalla, está a la vista. Sólo se manda el id fijo de la sección.
  if ('IntersectionObserver' in window) {
    var vistas = {};
    var observador = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        var id = en.target.id;
        if (!cargado || vistas[id] || !en.isIntersecting) return;
        if (en.intersectionRatio >= 0.5 || en.intersectionRect.height >= window.innerHeight * 0.5) {
          vistas[id] = true;
          medir('ver_seccion', { seccion: id, idioma: idioma });
        }
      });
    }, { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] });
    Array.prototype.forEach.call(document.querySelectorAll('section[id]'), function (sec) {
      if (/^[a-z0-9-]+$/.test(sec.id)) observador.observe(sec);
    });
  }

  try {
    var version = (window.pivotekCookies && window.pivotekCookies.version) || VERSION;
    var guardada = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (guardada && guardada.decision === 'aceptadas' && guardada.version === version) cargar();
  } catch (e) {
    // Sin almacenamiento: GA4 sólo se carga si la persona acepta en esta página.
  }

  document.addEventListener('pivotek:cookies', function (e) {
    if (e.detail && e.detail.decision === 'aceptadas') cargar();
  });
})();
