/* Portafolio de IA · animaciones (GSAP + ScrollTrigger + Lenis, auto-hospedados).
   Mismo sistema que carocomunicando.com: telón, portada que se dibuja desde adentro,
   apariciones al hacer scroll, contadores, marquesina y scroll suave.
   Respeta "reducir movimiento" y ?static en la URL. */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var root = document.documentElement;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches || /[?&]static\b/.test(location.search);
  var touch = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  var hasLibs = !!(window.gsap && window.ScrollTrigger);

  /* ---------- navegación: estado al hacer scroll ---------- */
  var nav = $('.nav');
  var onScrollNav = function () { nav.classList.toggle('scrolled', window.scrollY > 8); };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------- menú móvil ---------- */
  var burger = $('.burger'), menu = $('#menu-movil');
  var setMenu = function (open) {
    burger.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    root.classList.toggle('menu-lock', open);
    ['main', 'footer'].forEach(function (s) { var el = $(s); if (el) { if (open) el.setAttribute('inert', ''); else el.removeAttribute('inert'); } });
  };
  burger.addEventListener('click', function () { setMenu(!menu.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target === menu || e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('is-open')) { setMenu(false); burger.focus(); } });

  /* ---------- barra de lectura ---------- */
  if (!reduce) {
    var bar = document.createElement('div');
    bar.className = 'read-progress';
    bar.setAttribute('aria-hidden', 'true');
    document.body.appendChild(bar);
    var ticking = false;
    var upd = function () {
      var max = root.scrollHeight - root.clientHeight;
      bar.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0).toFixed(2) + '%';
      ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { requestAnimationFrame(upd); ticking = true; } }, { passive: true });
    upd();
  }

  /* ---------- BeCa: sale a mitad de la página jugando con Clawd ---------- */
  var beca = $('#beca');
  if (beca) {
    var cerrada = false;
    try { cerrada = sessionStorage.getItem('beg_beca_cerrada') === '1'; } catch (e) {}
    var suSeccion = document.getElementById(beca.getAttribute('data-seccion'));
    var revisarBeca = function () {
      if (cerrada) return;
      var max = root.scrollHeight - root.clientHeight;
      var pct = max > 0 ? window.scrollY / max : 0;
      var visible = false;
      if (suSeccion) { var r = suSeccion.getBoundingClientRect(); visible = r.top < window.innerHeight && r.bottom > 0; }
      beca.classList.toggle('is-on', pct > 0.2 && pct < 0.96 && !visible && !menu.classList.contains('is-open'));
    };
    beca.hidden = false;
    window.addEventListener('scroll', revisarBeca, { passive: true });
    revisarBeca();
    $('.beca-cerrar', beca).addEventListener('click', function () {
      cerrada = true;
      beca.classList.remove('is-on');
      try { sessionStorage.setItem('beg_beca_cerrada', '1'); } catch (e) {}
    });
  }

  if (reduce || !hasLibs) { root.classList.remove('js-wait'); root.classList.add('static'); return; }
  root.classList.add('motion');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- scroll suave (en celular, nativo) ---------- */
  var lenis = null;
  if (window.Lenis && !touch) {
    lenis = new Lenis({ lerp: 0.1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  var navH = function () { return nav.offsetHeight + 16; };
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = decodeURIComponent(a.getAttribute('href').slice(1));
      var t = id && document.getElementById(id);
      if (!t) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(t, { offset: -navH(), duration: 1.4 });
      else window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - navH(), behavior: 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---------- portada: rombos que se dibujan desde adentro ---------- */
  var live = { draw: 0, scroll: 0 };
  var cv = $('#stage'), ctx = cv.getContext('2d'), W = 0, H = 0;
  var size = function () {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  size();
  window.addEventListener('resize', size);
  var heroOn = true;
  ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top', onToggle: function (s) { heroOn = s.isActive; } });
  ScrollTrigger.create({ trigger: '.hero', start: 'top top', end: 'bottom top', onUpdate: function (s) { live.scroll = s.progress; } });
  var N = 11;
  var paint = function () {
    if (!heroOn || !W) return;
    var t = performance.now();
    ctx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H * 0.52;
    var maxR = Math.hypot(W, H) * 0.6;
    for (var i = 1; i < N; i++) {
      var p = Math.max(0, Math.min(1, (live.draw - (i - 1) / N * 0.55) / 0.45));
      if (p <= 0) continue;
      var r = maxR * (i + 0.6) / N;
      var per = 4 * r * Math.SQRT2;
      var rot = (i % 2 ? 1 : -1) * (t * 0.00003 + live.scroll * 0.45);
      var a = Math.max(0.04, 0.17 - i * 0.012);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      ctx.moveTo(0, -r); ctx.lineTo(r, 0); ctx.lineTo(0, r); ctx.lineTo(-r, 0); ctx.closePath();
      ctx.setLineDash([per * p, per]);
      ctx.lineWidth = i % 3 === 0 ? 1.4 : 1;
      ctx.strokeStyle = 'rgba(163,69,46,' + a + ')';
      ctx.stroke();
      if (p >= 1) {
        ctx.fillStyle = 'rgba(163,69,46,' + (a + 0.08) + ')';
        [[0, -r], [r, 0], [0, r], [-r, 0]].forEach(function (v) {
          ctx.save(); ctx.translate(v[0], v[1]); ctx.rotate(Math.PI / 4); ctx.fillRect(-3.5, -3.5, 7, 7); ctx.restore();
        });
      }
      ctx.restore();
    }
  };
  gsap.ticker.add(paint);

  /* ---------- nombre letra por letra ---------- */
  var h1 = $('.hero-name');
  var nombre = h1.textContent.trim();
  h1.setAttribute('aria-label', nombre);
  h1.textContent = '';
  nombre.split(' ').forEach(function (word, i, arr) {
    var w = document.createElement('span'); w.className = 'w'; w.setAttribute('aria-hidden', 'true');
    word.split('').forEach(function (c) { var s = document.createElement('span'); s.className = 'ch'; s.textContent = c; w.appendChild(s); });
    h1.appendChild(w);
    if (i < arr.length - 1) h1.appendChild(document.createTextNode(' '));
  });

  /* ---------- arranque de la portada (después del telón, si lo hay) ---------- */
  var counters = $$('.hero [data-to]');
  var arrancar = function () {
    root.classList.remove('js-wait');
    var tl = gsap.timeline();
    tl.to(live, { draw: 1, duration: 2.4, ease: 'power2.inOut' }, 0)
      .from('.hero-name .ch', { yPercent: 70, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.028 }, 0.1)
      .from('.hero [data-in]', { y: 22, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1 }, 0.4);
    counters.forEach(function (el) {
      var o = { v: 0 }, to = +el.getAttribute('data-to');
      el.textContent = '0';
      tl.to(o, { v: to, duration: 1.8, ease: 'power2.out', onUpdate: function () { el.textContent = Math.round(o.v).toLocaleString(document.documentElement.lang); } }, 0.9);
    });
  };
  if (root.classList.contains('intro-playing')) document.addEventListener('intro:fin', arrancar, { once: true });
  else arrancar();

  /* la portada se aleja al bajar */
  gsap.to('.hero-in', { yPercent: -10, opacity: 0.2, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

  /* ---------- marquesina: acelera con el scroll ---------- */
  (function () {
    var track = $('.marquee-track'), set = $('.marquee-set');
    if (!track || !set) return;
    track.appendChild(set.cloneNode(true));
    track.appendChild(set.cloneNode(true));
    var x = 0, last = performance.now(), sw = set.offsetWidth, vel = 0, ls = window.scrollY;
    window.addEventListener('resize', function () { sw = set.offsetWidth; });
    gsap.ticker.add(function () {
      var now = performance.now(), dt = Math.min(64, now - last); last = now;
      var sy = window.scrollY; vel += (Math.abs(sy - ls) - vel) * 0.1; ls = sy;
      if (!sw) { sw = set.offsetWidth; return; }
      x -= dt * 0.045 * (1 + Math.min(6, vel * 0.25));
      if (x <= -sw) x += sw;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
    });
  })();

  /* ---------- apariciones al hacer scroll ---------- */
  $$('.doc > section > *').forEach(function (el) {
    gsap.from(el, { y: 28, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 92%', once: true } });
  });
  $$('.doc tbody tr').forEach(function (tr) {
    gsap.from(tr, { x: -12, opacity: 0, duration: 0.6, ease: 'power2.out', scrollTrigger: { trigger: tr, start: 'top 94%', once: true } });
  });
  $$('.doc p[align="center"] img').forEach(function (img) {
    gsap.from(img, { scaleX: 0.2, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: img, start: 'top 95%', once: true } });
  });

  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
});
