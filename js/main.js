/* Propuesta B: animaciones de scroll (GSAP + ScrollTrigger + Lenis).
   Todo el contenido es legible sin este archivo; aquí sólo se agrega movimiento. */
(function () {
  'use strict';

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var SVGNS = 'http://www.w3.org/2000/svg';
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- construcciones estáticas (no dependen de GSAP) ---------- */

  // 374 celdas: 352 vigentes, 22 abrogados
  var cells = $('.cells');
  if (cells) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < 374; i++) {
      var c = document.createElement('i');
      if (i >= 352) c.className = 'off';
      frag.appendChild(c);
    }
    cells.appendChild(frag);
  }

  // Diagrama de nueve roles
  var orbit = $('.orbit svg');
  var orbitPts = [];
  if (orbit) {
    var gL = $('.orbit__lines', orbit), gN = $('.orbit__nodes', orbit), gS = $('.orbit__signals', orbit);
    for (var k = 0; k < 9; k++) {
      var a = (-90 + k * 40) * Math.PI / 180;
      var x = 200 + Math.cos(a) * 160, y = 200 + Math.sin(a) * 160;
      orbitPts.push({ x: x, y: y });
      var p = document.createElementNS(SVGNS, 'path');
      p.setAttribute('d', 'M' + x.toFixed(1) + ',' + y.toFixed(1) + ' L200,200');
      p.setAttribute('pathLength', '1');
      gL.appendChild(p);
      var ci = document.createElementNS(SVGNS, 'circle');
      ci.setAttribute('cx', x.toFixed(1)); ci.setAttribute('cy', y.toFixed(1)); ci.setAttribute('r', '17');
      gN.appendChild(ci);
      var s = document.createElementNS(SVGNS, 'circle');
      s.setAttribute('r', '3.5'); s.setAttribute('cx', x.toFixed(1)); s.setAttribute('cy', y.toFixed(1));
      s.setAttribute('opacity', '0');
      gS.appendChild(s);
    }
    // los números van después de los círculos para no romper nth-child
    orbitPts.forEach(function (pt, n) {
      var t = document.createElementNS(SVGNS, 'text');
      t.setAttribute('x', pt.x.toFixed(1)); t.setAttribute('y', (pt.y + 3.5).toFixed(1));
      t.textContent = String(n + 1);
      gN.appendChild(t);
    });
  }

  // Campo de puntos de SupplySense: 560 + 150 puntos, cada uno 1,000 contratos
  var dots = { progress: 1, canvas: $('.supply__canvas'), seeds: [] };
  (function () {
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    for (var d = 0; d < 710; d++) {
      dots.seeds.push(d < 560 ? rnd() * 0.72 : 0.76 + rnd() * 0.2);
    }
  })();
  function drawDots() {
    var cv = dots.canvas; if (!cv) return;
    var r = cv.getBoundingClientRect(); if (!r.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    var pad = 18 * dpr, w = W - pad * 2, h = H - pad * 2, N = 710;
    var cols = Math.ceil(Math.sqrt(N * w / h)), rows = Math.ceil(N / cols);
    var cw = w / cols, ch = h / rows, rad = Math.min(cw, ch) * 0.32;
    for (var n = 0; n < N; n++) {
      var t = (dots.progress - dots.seeds[n]) * 9;
      var cx = pad + (n % cols + 0.5) * cw, cy = pad + (Math.floor(n / cols) + 0.5) * ch;
      if (t <= 0) {
        ctx.fillStyle = 'rgba(236,238,230,0.07)';
        ctx.beginPath(); ctx.arc(cx, cy, rad * 0.45, 0, 6.2832); ctx.fill();
        continue;
      }
      var e = t > 1 ? 1 : t;
      ctx.fillStyle = n < 560 ? '#cfff45' : '#7fd8ff';
      ctx.globalAlpha = 0.25 + e * 0.75;
      ctx.beginPath(); ctx.arc(cx, cy, rad * (0.45 + 0.55 * e) * (t < 1.6 ? 1 + (1.6 - t) * 0.25 * e : 1), 0, 6.2832); ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  // Fondo del hero: retícula de puntos con una onda
  var hero = { canvas: $('.hero__canvas'), raf: 0, on: false, mx: -9999, my: -9999 };
  function drawHero(time) {
    var cv = hero.canvas; if (!cv) return;
    var r = cv.getBoundingClientRect(); if (!r.width) return;
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    var ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, W, H);
    var step = (r.width < 700 ? 26 : 34) * dpr, t = time / 1000;
    var mx = hero.mx * dpr, my = hero.my * dpr;
    for (var y = step / 2; y < H; y += step) {
      for (var x = step / 2; x < W; x += step) {
        var wv = Math.sin(x * 0.0042 / dpr * 2 + y * 0.006 / dpr * 2 - t * 0.9) * 0.5 + 0.5;
        var band = Math.pow(wv, 6);
        var dx = x - mx, dy = y - my, dist = Math.sqrt(dx * dx + dy * dy);
        var near = Math.max(0, 1 - dist / (190 * dpr));
        var v = Math.min(1, band + near);
        if (v > 0.35) { ctx.fillStyle = 'rgba(207,255,69,' + (0.2 + v * 0.75).toFixed(3) + ')'; }
        else { ctx.fillStyle = 'rgba(236,238,230,' + (0.07 + v * 0.2).toFixed(3) + ')'; }
        var rad = (1 + v * 2.1) * dpr;
        ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.2832); ctx.fill();
      }
    }
  }
  function heroLoop(time) { if (!hero.on) return; drawHero(time); hero.raf = requestAnimationFrame(heroLoop); }
  function heroStart() { if (hero.on) return; hero.on = true; hero.raf = requestAnimationFrame(heroLoop); }
  function heroStop() { hero.on = false; cancelAnimationFrame(hero.raf); }

  window.addEventListener('resize', function () { drawDots(); if (!hero.on) drawHero(2600); });

  // BeCa: un clic saluda
  var pet = $('.beca__pet');
  function petAnim(name) {
    if (!pet) return;
    pet.removeAttribute('data-anim');
    void pet.offsetWidth;
    pet.setAttribute('data-anim', name);
  }
  if (pet) pet.addEventListener('click', function () { petAnim('greet'); });

  /* ---------- sin GSAP o con movimiento reducido: todo estático ---------- */
  var hasGSAP = !!(window.gsap && window.ScrollTrigger);
  drawDots();
  drawHero(2600);
  if (!hasGSAP) return;

  var gsap = window.gsap, ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- divisiones de texto (una sola vez) ---------- */
  function splitWords(el) {
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(function (n) {
      var f = document.createDocumentFragment();
      n.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { f.appendChild(document.createTextNode(' ')); return; }
        var sp = document.createElement('span'); sp.className = 'w'; sp.textContent = part; f.appendChild(sp);
      });
      n.parentNode.replaceChild(f, n);
    });
    return $$('.w', el);
  }
  function splitChars(el) {
    var txt = el.textContent; el.textContent = '';
    txt.split('').forEach(function (chr) {
      var sp = document.createElement('span'); sp.className = 'ch';
      sp.textContent = chr === ' ' ? ' ' : chr; el.appendChild(sp);
    });
    return $$('.ch', el);
  }

  var lenis = null;
  if (!reduceMQ.matches && window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (ev) {
      var a = ev.target.closest ? ev.target.closest('a[href^="#"]') : null;
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (!target) return;
      ev.preventDefault();
      lenis.scrollTo(target, { offset: 0, duration: 1.4 });
      history.replaceState(null, '', a.getAttribute('href'));
    });
  }

  var fmt = function (v) { return Math.round(v).toLocaleString('en-US'); };
  var mm = gsap.matchMedia();

  mm.add({
    desk: '(min-width: 900px)',
    mobile: '(max-width: 899.98px)',
    reduce: '(prefers-reduced-motion: reduce)'
  }, function (ctx) {
    var desk = ctx.conditions.desk, reduce = ctx.conditions.reduce;
    if (reduce) { heroStop(); dots.progress = 1; drawDots(); drawHero(2600); return; }

    var undo = [];
    var once = function (trigger, start) { return { trigger: trigger, start: start || 'top 86%', once: true }; };

    /* barra de progreso y encabezado */
    gsap.to('.progress', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
    var top = $('.top');
    ScrollTrigger.create({
      start: 200, end: 'max',
      onUpdate: function (self) { top.classList.toggle('is-hidden', self.direction === 1 && self.scroll() > 400); }
    });
    undo.push(function () { top.classList.remove('is-hidden'); });

    /* 1. HERO: letras que suben + líneas que se separan con el scroll */
    var lines = $$('.hero__line');
    lines.forEach(function (l) { if (!l.querySelector('.ch')) splitChars(l); });
    var intro = gsap.timeline({ defaults: { ease: 'power4.out' } });
    intro.from('.hero__line .ch', { yPercent: 115, duration: 1.1, stagger: 0.028 }, 0.1)
      .from('.hero__eyebrow', { opacity: 0, y: 14, duration: 0.8 }, 0.2)
      .from('.hero__row > *', { opacity: 0, y: 30, duration: 0.9, stagger: 0.1 }, 0.75)
      .from('.hero__chips li', { opacity: 0, y: 16, scale: 0.9, duration: 0.6, stagger: 0.05 }, 1.0);
    lines.forEach(function (l) {
      gsap.to(l, { xPercent: (l.dataset.dir === '1' ? 1 : -1) * (desk ? 16 : 8), ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    });
    gsap.to('.hero__canvas', { yPercent: 22, scale: 1.12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    ScrollTrigger.create({ trigger: '.hero', start: 'top bottom', end: 'bottom top',
      onToggle: function (self) { if (self.isActive) heroStart(); else heroStop(); } });
    heroStart();
    var onMove = function (ev) { var r = hero.canvas.getBoundingClientRect(); hero.mx = ev.clientX - r.left; hero.my = ev.clientY - r.top; };
    window.addEventListener('pointermove', onMove, { passive: true });
    undo.push(function () { window.removeEventListener('pointermove', onMove); heroStop(); });

    /* 2. MANIFIESTO: texto que se revela palabra por palabra */
    var mtext = $('.manifesto__text');
    var words = $$('.w', mtext); if (!words.length) words = splitWords(mtext);
    gsap.fromTo(words, { opacity: 0.12 }, { opacity: 1, ease: 'none', stagger: 0.1,
      scrollTrigger: { trigger: mtext, start: 'top 80%', end: 'bottom 45%', scrub: 0.5 } });

    /* 2b. ESTE SOY YO: la foto se abre desde un recuadro hasta llenar la pantalla */
    if ($('.yo')) {
      if (desk) {
        gsap.timeline({ scrollTrigger: { trigger: '.yo', start: 'top top', end: '+=150%', scrub: 0.6, pin: '.yo__pin', anticipatePin: 1 } })
          .fromTo('.yo__frame', { clipPath: 'inset(24% 37% 24% 37% round 28px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none', duration: 1 }, 0)
          .fromTo('.yo__img', { scale: 1.4 }, { scale: 1, ease: 'none', duration: 1 }, 0)
          .from('.yo__txt > *', { y: 44, opacity: 0, ease: 'power2.out', duration: 0.3, stagger: 0.08 }, 0.62);
      } else {
        gsap.fromTo('.yo__frame', { clipPath: 'inset(20% 14% 20% 14% round 18px)' }, { clipPath: 'inset(0% 0% 0% 0% round 18px)', ease: 'none',
          scrollTrigger: { trigger: '.yo__frame', start: 'top 92%', end: 'center 55%', scrub: 0.6 } });
        gsap.fromTo('.yo__img', { scale: 1.3 }, { scale: 1, ease: 'none',
          scrollTrigger: { trigger: '.yo__frame', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from('.yo__txt > *', { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08, scrollTrigger: once('.yo__txt') });
      }
    }

    /* genéricos: títulos, bloques y grupos */
    $$('[data-reveal]').forEach(function (el) {
      gsap.from(el, { y: 46, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: once(el, 'top 90%') });
    });
    $$('[data-stagger]').forEach(function (el) {
      gsap.from(el.children, { y: 28, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.07, scrollTrigger: once(el) });
    });

    /* contadores */
    $$('[data-count]').forEach(function (el) {
      var end = +el.dataset.count, o = { v: 0 }, final = el.textContent;
      if (end < 3) return;
      el.textContent = '0';
      gsap.to(o, { v: end, duration: end > 5000 ? 2.4 : 1.6, ease: 'power2.out',
        onUpdate: function () { el.textContent = fmt(o.v); },
        scrollTrigger: once(el, 'top 92%') });
      undo.push(function () { el.textContent = final; });
    });

    /* 3. CIFRAS: celdas que entran en cascada */
    gsap.from('.fig', { opacity: 0, y: 50, duration: 0.9, ease: 'power3.out', stagger: 0.08, scrollTrigger: once('.figures__grid', 'top 82%') });

    /* marquesinas que reaccionan a la velocidad del scroll */
    var mTweens = [];
    $$('.marquee').forEach(function (m) {
      var inner = $('.marquee__inner', m);
      if (!m.classList.contains('is-live')) {
        $$('li', inner).forEach(function (li) { var cl = li.cloneNode(true); cl.setAttribute('aria-hidden', 'true'); cl.classList.add('is-clone'); inner.appendChild(cl); });
      }
      m.classList.add('is-live');
      var back = m.dataset.dir === '-1';
      mTweens.push(gsap.fromTo(inner, { xPercent: back ? -50 : 0 }, { xPercent: back ? 0 : -50, duration: 46, ease: 'none', repeat: -1 }));
      undo.push(function () { m.classList.remove('is-live'); $$('.is-clone', inner).forEach(function (n) { n.remove(); }); });
    });
    var skew = gsap.quickTo('.marquee__inner', 'skewX', { duration: 0.4, ease: 'power3.out' });
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: function (self) {
      var v = gsap.utils.clamp(-8, 8, self.getVelocity() / 260);
      mTweens.forEach(function (tw) {
        gsap.to(tw, { timeScale: 1 + Math.abs(v) * 1.4, duration: 0.25, overwrite: true });
        gsap.to(tw, { timeScale: 1, duration: 1.2, delay: 0.3 });
      });
      skew(v * -1.6);
      gsap.delayedCall(0.35, function () { skew(0); });
    } });

    /* 4. MAPA: tarjetas que se arman desde posiciones dispersas */
    if (desk) {
      gsap.from('.skill', {
        x: function () { return gsap.utils.random(-620, 620); },
        y: function () { return gsap.utils.random(120, 620); },
        rotation: function () { return gsap.utils.random(-38, 38); },
        scale: 0.55, opacity: 0, ease: 'power2.out', stagger: { each: 0.035, from: 'random' },
        scrollTrigger: { trigger: '.skills-grid', start: 'top 100%', end: 'top 22%', scrub: 0.8 }
      });
    } else {
      $$('.skill').forEach(function (el, n) {
        gsap.from(el, { x: n % 2 ? 60 : -60, rotation: n % 2 ? 5 : -5, opacity: 0, duration: 0.8, ease: 'power3.out', scrollTrigger: once(el, 'top 92%') });
      });
    }

    /* 5. CON CRITERIO: tarjetas pegajosas que se apilan */
    var cards = $$('.stack-card');
    cards.forEach(function (card, n) {
      if (n === cards.length - 1) return;
      gsap.to($('.stack-card__in', card), { scale: 1 - (cards.length - 1 - n) * 0.022, ease: 'none',
        scrollTrigger: { trigger: cards[n + 1], start: 'top bottom', end: 'top top+=110', scrub: true } });
    });
    gsap.from('.cc__stats li', { opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: once('.cc__stats') });

    /* 6. RAG: línea que avanza y etapas que se encienden */
    var stages = $('.rag__stages');
    stages.classList.add('is-live');
    undo.push(function () { stages.classList.remove('is-live'); $$('.stage').forEach(function (s) { s.classList.remove('is-on'); }); });
    gsap.fromTo('.rag__line', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: stages, start: 'top 62%', end: 'bottom 62%', scrub: 0.4 } });
    $$('.stage').forEach(function (st) {
      ScrollTrigger.create({ trigger: st, start: 'top 62%',
        onEnter: function () { st.classList.add('is-on'); },
        onLeaveBack: function () { st.classList.remove('is-on'); } });
    });
    gsap.from('.cells i', { scale: 0, opacity: 0, duration: 0.35, ease: 'back.out(2)', stagger: { amount: 1.3 }, scrollTrigger: once('.cells', 'top 88%') });

    /* 7. SUPPLYSENSE: campo de puntos ligado al scroll */
    dots.progress = 0; drawDots();
    gsap.to(dots, { progress: 1, ease: 'none', onUpdate: drawDots,
      scrollTrigger: { trigger: dots.canvas, start: 'top 85%', end: 'bottom 55%', scrub: 0.6 } });
    undo.push(function () { dots.progress = 1; drawDots(); });

    /* 8. CIERRE: 20 bloques, carriles paralelos, scroll horizontal y compuerta */
    gsap.from('.b', { rotationX: -92, opacity: 0, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.045, scrollTrigger: once('.tally__blocks', 'top 84%') });
    gsap.fromTo('.lanes__svg', { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', ease: 'none',
      scrollTrigger: { trigger: '.lanes', start: 'top 78%', end: 'top 38%', scrub: 0.5 } });
    gsap.from('.lanes__to li', { opacity: 0, x: -24, stagger: 0.12, ease: 'power2.out',
      scrollTrigger: { trigger: '.lanes', start: 'top 60%', end: 'top 30%', scrub: 0.5 } });

    if (desk) {
      var hs = $('.hscroll'), track = $('.hscroll__track');
      hs.classList.add('is-h');
      undo.push(function () { hs.classList.remove('is-h'); });
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var hTween = gsap.to(track, { x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: hs, start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
      $$('.piece').forEach(function (pc) {
        gsap.from($('.piece__n', pc), { yPercent: 60, opacity: 0, ease: 'power2.out',
          scrollTrigger: { trigger: pc, containerAnimation: hTween, start: 'left 96%', end: 'left 62%', scrub: true } });
      });
    } else {
      gsap.from('.piece', { opacity: 0, y: 40, duration: 0.7, stagger: 0.06, ease: 'power3.out', scrollTrigger: once('.hscroll__track') });
    }

    var gate = gsap.timeline({ scrollTrigger: { trigger: '.gate', start: 'top 72%', end: 'top 18%', scrub: 0.5 } });
    gate.from('.gate__light i', { backgroundColor: '#2c313d', boxShadow: '0 0 0px rgba(207,255,69,0)', duration: 0.4, stagger: 0.5 })
      .from('.gate__arm', { rotation: 0, duration: 1.4, ease: 'power2.inOut' }, '>-0.1')
      .from('.gate__result', { opacity: 0, x: -20, duration: 0.6 }, '>-0.5');

    /* 9. DOF: nodos del flujo que se activan en secuencia */
    var nodes = $$('.node');
    var flow = gsap.timeline({ scrollTrigger: { trigger: '.flow', start: desk ? 'top 75%' : 'top 70%', end: desk ? 'top 25%' : 'bottom 60%', scrub: 0.5 } });
    flow.fromTo('.flow__line i', desk ? { scaleX: 0 } : { scaleY: 0 }, desk ? { scaleX: 1, ease: 'none', duration: nodes.length } : { scaleY: 1, ease: 'none', duration: nodes.length }, 0);
    nodes.forEach(function (nd, n) {
      flow.from(nd, { opacity: 0.18, duration: 0.5 }, n * 0.95)
        .from($('.node__ico', nd), { scale: 0.6, rotation: -20, duration: 0.6, ease: 'back.out(2.2)' }, n * 0.95);
    });

    /* 10. LEGAL: filas con barrido */
    gsap.from('.matter', { opacity: 0, x: 60, duration: 0.8, ease: 'power3.out', stagger: 0.07, scrollTrigger: once('.legal__list', 'top 80%') });

    /* 11. ESTUDIO: parallax de sitios, cabezal del video, pasos de Reels */
    if (desk) {
      $$('.site').forEach(function (st) {
        var sp = parseFloat(st.dataset.speed || 0);
        gsap.fromTo(st, { y: sp * 90 }, { y: sp * -90, ease: 'none', scrollTrigger: { trigger: st, start: 'top bottom', end: 'bottom top', scrub: true } });
      });
    }
    gsap.from('.site__bar', { scaleX: 0, transformOrigin: '0 50%', duration: 0.9, ease: 'power3.out', stagger: 0.12, scrollTrigger: once('.sites') });
    gsap.fromTo('.video__play', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: '.videos', start: 'top 85%', end: 'top 25%', scrub: 0.4 } });
    gsap.from('.video', { opacity: 0, y: 50, duration: 0.8, stagger: 0.1, ease: 'power3.out', scrollTrigger: once('.videos') });
    gsap.from('.reels__steps li', { opacity: 0, x: desk ? -40 : 0, y: desk ? 0 : 30, duration: 0.6, stagger: 0.14, ease: 'power3.out', scrollTrigger: once('.reels__steps', 'top 82%') });

    /* 12. CONECTORES: barras que crecen */
    gsap.from('.bar__fill', { scaleX: 0, duration: 1.5, ease: 'power3.out', stagger: 0.15, scrollTrigger: once('.bars', 'top 80%') });

    /* 13. BECA: la ventana cae y los estados cambian con el scroll */
    gsap.from('.beca__win', { y: -90, rotation: -7, opacity: 0, duration: 1.3, ease: 'elastic.out(1,0.55)', scrollTrigger: once('.beca__grid', 'top 78%') });
    var states = $('.beca__states'), stateItems = $$('li', states);
    var hookEl = $('.beca__hook'), doesEl = $('.beca__does');
    var hook0 = hookEl.textContent, does0 = doesEl.textContent;
    states.classList.add('is-live');
    function setState(li) {
      stateItems.forEach(function (o) { o.classList.toggle('is-active', o === li); });
      hookEl.textContent = $$('code', li).map(function (cd) { return cd.textContent; }).join(' · ');
      doesEl.textContent = $('.st__beca', li).textContent;
      petAnim(li.dataset.anim);
    }
    stateItems.forEach(function (li) {
      ScrollTrigger.create({ trigger: li, start: 'top 58%', end: 'bottom 58%', onToggle: function (self) { if (self.isActive) setState(li); } });
    });
    undo.push(function () {
      states.classList.remove('is-live');
      stateItems.forEach(function (o) { o.classList.remove('is-active'); });
      hookEl.textContent = hook0; doesEl.textContent = does0; pet.removeAttribute('data-anim');
    });

    /* 14. SISTEMAS: líneas SVG que se dibujan y señales que viajan */
    if (orbit) {
      var ot = gsap.timeline({ scrollTrigger: { trigger: '.orbit', start: 'top 80%', end: 'top 30%', scrub: 0.6 } });
      ot.from('.orbit__nodes circle', { scale: 0, transformOrigin: '50% 50%', stagger: 0.1, duration: 0.4, ease: 'back.out(2)' }, 0)
        .from('.orbit__nodes text', { opacity: 0, stagger: 0.1, duration: 0.3 }, 0.1)
        .fromTo('.orbit__lines path', { strokeDashoffset: 1 }, { strokeDashoffset: 0, stagger: 0.1, duration: 0.6, ease: 'none' }, 0.2)
        .from('.orbit__core, .orbit__t', { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' }, 0.9);
      var sig = gsap.timeline({ repeat: -1, paused: true });
      $$('.orbit__signals circle').forEach(function (sc, n) {
        var pt = orbitPts[n], at = (n * 4 % 9) * 0.32;
        sig.fromTo(sc, { attr: { cx: pt.x, cy: pt.y }, opacity: 0 }, { attr: { cx: 200, cy: 200 }, opacity: 1, duration: 0.9, ease: 'power1.in' }, at)
          .to(sc, { opacity: 0, duration: 0.15 }, at + 0.9);
      });
      ScrollTrigger.create({ trigger: '.orbit', start: 'top 55%', end: 'bottom top',
        onToggle: function (self) { if (self.isActive) sig.play(); else sig.pause(); } });
    }

    /* 15. VIABILIDAD: filas que entran alternando lados */
    $$('.viab__list li').forEach(function (li, n) {
      gsap.from(li, { x: n % 2 ? 90 : -90, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: once(li, 'top 92%') });
    });

    /* 16. MÉTODO: la regla activa se resalta y el contador cambia */
    var pr = $('.principles'), prItems = $$('li', pr), cur = $('.method__cur');
    pr.classList.add('is-live');
    prItems.forEach(function (li, n) {
      ScrollTrigger.create({ trigger: li, start: 'top 60%', end: 'bottom 60%',
        onToggle: function (self) {
          li.classList.toggle('is-active', self.isActive);
          if (self.isActive && cur.textContent !== String(n + 1)) {
            cur.textContent = String(n + 1);
            gsap.fromTo(cur, { yPercent: 30, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: 'power3.out' });
          }
        } });
    });
    undo.push(function () { pr.classList.remove('is-live'); prItems.forEach(function (o) { o.classList.remove('is-active'); }); cur.textContent = '1'; });

    /* 17. STACK: chips que aparecen por grupo */
    $$('.tech > div').forEach(function (row) {
      gsap.from($$('.chips li', row), { opacity: 0, scale: 0.6, y: 14, duration: 0.45, ease: 'back.out(2)', stagger: 0.035, scrollTrigger: once(row, 'top 90%') });
      gsap.from($('dt', row), { opacity: 0, x: -30, duration: 0.6, ease: 'power3.out', scrollTrigger: once(row, 'top 90%') });
    });

    /* 17b. PIVOTEK: la P aparece, la flecha hace el giro y el nombre se parte en pivot + tek */
    if ($('.pvk')) {
      if (desk) {
        gsap.timeline({ scrollTrigger: { trigger: '.pvk', start: 'top top', end: '+=170%', scrub: 0.6, pin: '.pvk__pin', anticipatePin: 1 } })
          .fromTo('.pvk__p', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'none', duration: 0.3 }, 0)
          .fromTo('.pvk__arrow', { x: 240, rotation: 180, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, ease: 'power2.inOut', duration: 0.38 }, 0.18)
          .fromTo('.pvk__pivo', { xPercent: -35, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.2 }, 0.46)
          .fromTo('.pvk__ek', { xPercent: 70, opacity: 0 }, { xPercent: 0, opacity: 1, ease: 'power2.out', duration: 0.2 }, 0.46)
          .fromTo('.pvk__t', { scale: 2.4, opacity: 0 }, { scale: 1, opacity: 1, ease: 'power2.out', duration: 0.2 }, 0.52)
          .from('.pvk__def--pivot', { y: 40, opacity: 0, ease: 'power2.out', duration: 0.16 }, 0.68)
          .from('.pvk__def--tek', { y: 40, opacity: 0, ease: 'power2.out', duration: 0.16 }, 0.76)
          .from('.pvk__why', { y: 34, opacity: 0, ease: 'power2.out', duration: 0.14 }, 0.84)
          .from('.pvk__logo', { y: 30, opacity: 0, ease: 'power2.out', duration: 0.12 }, 0.92);
      } else {
        gsap.fromTo('.pvk__p', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.9, ease: 'power3.out', scrollTrigger: once('.pvk__iso') });
        gsap.fromTo('.pvk__arrow', { x: 110, rotation: 180, opacity: 0 }, { x: 0, rotation: 0, opacity: 1, duration: 1.1, delay: 0.35, ease: 'back.out(1.4)', scrollTrigger: once('.pvk__iso') });
        gsap.from(['.pvk__word', '.pvk__def--pivot', '.pvk__def--tek', '.pvk__why', '.pvk__logo'], { y: 30, opacity: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', scrollTrigger: once('.pvk__copy') });
      }
    }

    /* 18. CONTACTO */
    gsap.from('.contact__h', { yPercent: 40, opacity: 0, duration: 1, ease: 'power3.out', scrollTrigger: once('.contact', 'top 70%') });
    gsap.from('.contact__mail span', { yPercent: 100, opacity: 0, duration: 1, stagger: 0.12, ease: 'power4.out', scrollTrigger: once('.contact__mail', 'top 88%') });
    gsap.from('.contact__links li', { opacity: 0, y: 20, stagger: 0.08, duration: 0.6, scrollTrigger: once('.contact__links', 'top 95%') });
    gsap.from('.contact__beca', { y: 60, rotation: 14, opacity: 0, duration: 1.1, ease: 'elastic.out(1,0.6)', scrollTrigger: once('.contact__end', 'top 96%') });

    return function () { undo.forEach(function (fn) { try { fn(); } catch (e) {} }); };
  });

  var refresh = function () { ScrollTrigger.refresh(); };
  window.addEventListener('load', refresh);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
})();
