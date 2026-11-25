"""Genera los cuatro carteles de los proyectos destacados de pivotek.mx (SVG 600x800), en español e inglés, en img/carteles/.

Uso: NEUE_HAAS_DIR=/ruta/a/la/fuente python3 -P build/carteles/gen.py  (requiere fontTools y hb-shape de HarfBuzz)
"""
import math
import random
import sys

import os  # noqa: E402
AQUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, AQUI)
from texto import trazos  # noqa: E402

INK, PAPER, LIME, AMBER, CORAL, CYAN = '#0a0c10', '#eceee6', '#cfff45', '#ffb648', '#ff5d47', '#7fd8ff'
MONO = "font-family=\"'JetBrains Mono',ui-monospace,monospace\""
SERIF = "font-family=\"'Cormorant Garamond',Georgia,serif\" font-style=\"italic\""
TX = {
    'es': {'num': 'N.º', 'cc_lab': 'PRODUCTO EN VIVO', 'cc_pie': 'Una guía, 7 plugins y 7 skills.', 'cc_meta': 'A LA VENTA EN CONCRITERIO.MX',
           'cc_libros': ['NOTARIADO', 'ENERGÍA', 'C. COMERCIO'], 'guia': 'GUÍA', 'sello': 'VERIFICADO · CON CRITERIO ·',
           'rag_tit': ('EL', 'BUSCADOR'), 'rag_q': '¿qué permiso aplica hoy?', 'rag_pie': 'La ley de energía, en lenguaje natural.',
           'rag_meta': '35 DOCUMENTOS · 3,376 ARTÍCULOS', 'ss_lab': 'DATOS A ESCALA', 'ss_pie': 'Quién compra, a qué precio y cuándo.',
           'ss_meta': '300,000+ ADJUDICACIONES, AL DÍA', 'ci_tit': ('EL', 'CIERRE'), 'ci_pie': '20 pasos, con freno de mano.',
           'ci_meta': '11 AUTOMÁTICOS · 7 ASISTIDOS · 2 HUMANOS', 'freno': 'FRENO'},
    'en': {'num': 'NO.', 'cc_lab': 'LIVE PRODUCT', 'cc_pie': 'A guide, 7 plugins and 7 skills.', 'cc_meta': 'ON SALE AT CONCRITERIO.MX',
           'cc_libros': ['NOTARIAL', 'ENERGY', 'COMMERCE'], 'guia': 'GUIDE', 'sello': 'VERIFIED · CON CRITERIO ·',
           'rag_tit': ('SEARCH', 'ENGINE'), 'rag_q': 'which permit applies today?', 'rag_pie': 'Energy law, in plain language.',
           'rag_meta': '35 DOCUMENTS · 3,376 ARTICLES', 'ss_lab': 'DATA AT SCALE', 'ss_pie': 'Who buys, at what price and when.',
           'ss_meta': '300,000+ AWARDS, UPDATED DAILY', 'ci_tit': ('THE', 'CLOSING'), 'ci_pie': '20 steps, with a hand on the brake.',
           'ci_meta': '11 AUTOMATED · 7 ASSISTED · 2 HUMAN', 'freno': 'BRAKE'},
}
T = TX['es']
FLECHA = 'M0 128.5L128 0L163 35L137 61L233 61L233 196L137 196L163 222L128 257Z'   # flecha del isotipo, apunta a la izquierda


def flecha(cx, cy, h, rot=0, fill=INK, extra=''):
    s = h / 257
    d = {0: 'l', 180: 'r', 90: 'u', -90: 'd'}.get(rot, 'l')
    return ('<g class="c-fl" data-d="%s"><path d="%s" fill="%s" transform="translate(%.1f %.1f) rotate(%g) scale(%.4f) translate(-116.5 -128.5)" %s/></g>'
            % (d, FLECHA, fill, cx, cy, rot, s, extra))


def r(v):
    return ('%.1f' % v).rstrip('0').rstrip('.')


def marco(n, etiqueta, titulo, bg, pie, meta, cuerpo, fg=INK, size=104):
    l1, l2 = titulo
    wmax = max(trazos(l1, size, 0, 0)[1], trazos(l2, size, 0, 0)[1])
    if wmax > 530:
        size = size * 530 / wmax
    d1, _ = trazos(l1, size, 34, 76 + size * 0.72)
    d2, _ = trazos(l2, size, 34, 76 + size * 0.72 + size * 0.86)
    return ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" class="cartel__svg">'
            '<rect width="600" height="800" fill="%s"/>' % bg +
            '<text x="36" y="52" %s font-size="13" letter-spacing="2.2" fill="%s">%s %s · %s</text>' % (MONO, fg, T['num'], n, etiqueta) +
            '<g class="c-tit" fill="%s"><path d="%s"/><path d="%s"/></g>' % (fg, d1, d2) +
            '<g class="c-ilu">%s</g>' % cuerpo +
            '<line x1="36" x2="564" y1="680" y2="680" stroke="%s" stroke-width="2"/>' % fg +
            '<text x="34" y="726" %s font-size="35" fill="%s">%s</text>' % (SERIF, fg, pie) +
            '<text x="36" y="764" %s font-size="12.5" letter-spacing="2" fill="%s">%s</text>' % (MONO, fg, meta) +
            '</svg>')


def puntos_disco(cx, cy, R, paso, rmax, fill, luz=(-0.45, -0.45), rmin=0.6):
    """Disco de semitono: los puntos crecen hacia el lado en sombra."""
    out = []
    y = cy - R
    fila = 0
    while y <= cy + R:
        x = cx - R + (paso / 2 if fila % 2 else 0)
        while x <= cx + R:
            dx, dy = (x - cx) / R, (y - cy) / R
            if dx * dx + dy * dy <= 1:
                t = 0.5 + 0.5 * (dx * -luz[0] + dy * -luz[1]) / math.hypot(*luz)
                rad = rmin + (rmax - rmin) * max(0, min(1, t))
                out.append('<circle cx="%s" cy="%s" r="%s"/>' % (r(x), r(y), r(rad)))
            x += paso
        y += paso * 0.866
        fila += 1
    return '<g fill="%s">%s</g>' % (fill, ''.join(out))


# ---------------------------------------------------------------- 03 · Con Criterio
def con_criterio():
    s = []
    s.append(puntos_disco(446, 372, 78, 10, 4.2, INK))
    # pila de 7 libros acostados (los plugins), de abajo hacia arriba
    b1, b2, b3 = T['cc_libros']
    libros = [(b1, 372, 38, PAPER, 92), (b2, 352, 32, INK, 112), (b3, 384, 36, CORAL, 84),
              ('LFDA', 340, 30, AMBER, 118), ('LFPPI', 362, 34, CYAN, 98), ('LGSM', 330, 30, PAPER, 124),
              ('LFPDPPP', 350, 36, INK, 104)]
    y = 652
    tops = []
    for lab, w, h, col, x in libros:
        y -= h
        tc = PAPER if col == INK else INK
        s.append('<rect x="%d" y="%d" width="%d" height="%d" rx="5" fill="%s" stroke="%s" stroke-width="4"/>' % (x, y, w, h, col, INK))
        s.append('<line x1="%d" x2="%d" y1="%d" y2="%d" stroke="%s" stroke-width="2"/>' % (x + 26, x + 26, y + 6, y + h - 6, tc))
        s.append('<line x1="%d" x2="%d" y1="%d" y2="%d" stroke="%s" stroke-width="2"/>' % (x + w - 26, x + w - 26, y + 6, y + h - 6, tc))
        s.append('<text x="%d" y="%s" %s font-size="14" letter-spacing="2.5" text-anchor="middle" fill="%s">%s</text>'
                 % (x + w / 2, r(y + h / 2 + 5), MONO, tc, lab))
        tops.append((x, y, w))
    tx, ty, tw = tops[-1]
    # la guía, parada sobre la pila
    gx, gy, gw, gh = 176, ty, 124, 160
    s.append('<g transform="rotate(-6 %d %d)">' % (gx, gy) +
             '<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="4"/>' % (gx + gw - 4, gy - gh + 6, 16, gh - 6, PAPER, INK) +
             '<rect x="%d" y="%d" width="%d" height="%d" rx="3" fill="%s" stroke="%s" stroke-width="4"/>' % (gx, gy - gh, gw, gh, INK, INK) +
             flecha(gx + gw / 2, gy - gh + 64, 52, 0, LIME) +
             '<text x="%d" y="%d" %s font-size="13" letter-spacing="3" text-anchor="middle" fill="%s">%s</text>' % (gx + gw / 2, gy - 42, MONO, PAPER, T['guia']) +
             '<line x1="%d" x2="%d" y1="%d" y2="%d" stroke="%s" stroke-width="2"/>' % (gx + 30, gx + gw - 30, gy - 26, gy - 26, PAPER) +
             '</g>')
    # sello de validación
    sx, sy = 476, 596
    s.append('<g transform="rotate(-14 %d %d)">' % (sx, sy) +
             '<circle cx="%d" cy="%d" r="54" fill="%s" stroke="%s" stroke-width="4"/>' % (sx, sy, CORAL, INK) +
             '<circle cx="%d" cy="%d" r="33" fill="none" stroke="%s" stroke-width="2"/>' % (sx, sy, INK) +
             '<path id="sello" d="M%d %d A43 43 0 1 1 %d %d A43 43 0 1 1 %d %d" fill="none"/>' % (sx - 43, sy, sx + 43, sy, sx - 43, sy) +
             '<text %s font-size="10.5" letter-spacing="2.1" fill="%s"><textPath href="#sello" textLength="262" lengthAdjust="spacing">%s</textPath></text>' % (MONO, INK, T['sello']) +
             '<path d="M%d %d l11 11 l20 -22" fill="none" stroke="%s" stroke-width="7" stroke-linecap="square"/>' % (sx - 16, sy + 1, INK) +
             '</g>')
    s.append('<line x1="56" x2="544" y1="653" y2="653" stroke="%s" stroke-width="4"/>' % INK)
    return marco('04', T['cc_lab'], ('CON', 'CRITERIO'), LIME, T['cc_pie'], T['cc_meta'], ''.join(s))


# ---------------------------------------------------------------- 04 · RAG
def rag():
    s = []
    cols, rows, cell, pitch = 22, 17, 13, 18
    x0, y0 = (600 - (cols * pitch - (pitch - cell))) / 2, 322
    rnd = random.Random(7)
    abro = set(rnd.sample(range(cols * rows), 22))
    cx, cy, R = 318, 470, 104
    # celda encontrada: la más cercana al centro de la lupa
    best, bd = 0, 1e9
    for i in range(cols * rows):
        x, y = x0 + (i % cols) * pitch + cell / 2, y0 + (i // cols) * pitch + cell / 2
        dd = (x - cx - 8) ** 2 + (y - cy + 6) ** 2
        if dd < bd and i not in abro:
            best, bd = i, dd
    def base():
        grupos = {INK: [], CORAL: [], LIME: []}
        for i in range(cols * rows):
            col = LIME if i == best else (CORAL if i in abro else INK)
            grupos[col].append('M%s %sh%dv%dh-%dz' % (r(x0 + (i % cols) * pitch), r(y0 + (i // cols) * pitch), cell, cell, cell))
        return ''.join('<path fill="%s" d="%s"/>' % (c, ''.join(v)) for c, v in grupos.items())
    def celdas(k=1.0, ox=0, oy=0, stroke=0):
        out = []
        for i in range(cols * rows):
            x = x0 + (i % cols) * pitch
            y = y0 + (i // cols) * pitch
            col = LIME if i == best else (CORAL if i in abro else INK)
            if k != 1:
                x, y = cx + (x - cx) * k + ox, cy + (y - cy) * k + oy
                if x > cx + R or x + cell * k < cx - R or y > cy + R or y + cell * k < cy - R:
                    continue
            sw = (' stroke="%s" stroke-width="%s"' % (INK, stroke)) if (stroke and i == best) else ''
            out.append('<rect x="%s" y="%s" width="%s" height="%s" rx="%s" fill="%s"%s/>' % (r(x), r(y), r(cell * k), r(cell * k), r(1.5 * k), col, sw))
        return ''.join(out)
    # barra de consulta
    s.append('<rect x="%s" y="250" width="%s" height="44" rx="22" fill="%s" stroke="%s" stroke-width="3"/>' % (r(x0), r(cols * pitch - 5), PAPER, INK))
    s.append('<text x="%s" y="278" %s font-size="15" fill="%s">%s</text>' % (r(x0 + 22), MONO, INK, T['rag_q']))
    s.append('<rect x="%s" y="262" width="2" height="20" fill="%s"><animate attributeName="opacity" values="1;0;1" dur="1.1s" repeatCount="indefinite"/></rect>' % (r(x0 + 248), INK))
    s.append(flecha(x0 + cols * pitch - 5 - 26, 272, 22, 180, INK))
    s.append(base())
    # la lupa
    s.append('<clipPath id="lente"><circle cx="%d" cy="%d" r="%d"/></clipPath>' % (cx, cy, R - 8))
    s.append('<g clip-path="url(#lente)"><rect x="%d" y="%d" width="%d" height="%d" fill="%s"/>%s' % (cx - R, cy - R, 2 * R, 2 * R, PAPER, celdas(2.5, -8 * 2.5 + 8, 6 * 2.5 - 6, 3)))
    bi = best
    bx = cx + (x0 + (bi % cols) * pitch + cell / 2 - cx) * 2.5 - 12
    by = cy + (y0 + (bi // cols) * pitch + cell / 2 - cy) * 2.5 + 9
    s.append(flecha(bx + 46, by, 30, 0, INK) + '</g>')
    s.append('<g transform="rotate(45 %d %d)"><rect x="%d" y="%d" width="96" height="30" rx="8" fill="%s"/><rect x="%d" y="%d" width="14" height="30" fill="%s"/></g>'
             % (cx, cy, cx + R + 2, cy - 15, INK, cx + R + 22, cy - 15, LIME))
    s.append('<circle cx="%d" cy="%d" r="%d" fill="none" stroke="%s" stroke-width="16"/>' % (cx, cy, R, INK))
    s.append('<path d="M%s %s A%d %d 0 0 1 %s %s" fill="none" stroke="%s" stroke-width="5" stroke-linecap="round" opacity=".9"/>'
             % (r(cx - (R - 22) * math.cos(math.radians(30))), r(cy - (R - 22) * math.sin(math.radians(30))), R - 22, R - 22,
                r(cx - (R - 22) * math.cos(math.radians(75))), r(cy - (R - 22) * math.sin(math.radians(75))), CYAN))
    return marco('05', 'RAG', T['rag_tit'], CYAN, T['rag_pie'], T['rag_meta'], ''.join(s))


# ---------------------------------------------------------------- 05 · SupplySense
def supply():
    s = []
    g = 636
    # nube de contratos: sube hacia la derecha
    rnd = random.Random(11)
    pts = []
    for _ in range(150):
        t = rnd.random() ** 0.8
        x = 300 + t * 250 + rnd.gauss(0, 14)
        y = 470 - t * 200 + rnd.gauss(0, 26)
        if 290 < x < 560 and 250 < y < 520:
            pts.append((x, y, 1.6 + 4.2 * t * rnd.random() + 1.2 * t, rnd.random() < 0.2))
    s.append('<g>' + ''.join('<circle cx="%s" cy="%s" r="%s" fill="%s"/>' % (r(x), r(y), r(rr), PAPER if cy_ else INK) for x, y, rr, cy_ in pts) + '</g>')
    s.append(flecha(540, 262, 46, 90, INK))
    # suelo con semitono
    s.append('<line x1="40" x2="560" y1="%d" y2="%d" stroke="%s" stroke-width="4"/>' % (g, g, INK))
    dots = []
    for row in range(3):
        for i in range(44):
            x = 46 + i * 12 + (6 if row % 2 else 0)
            dots.append('<circle cx="%d" cy="%d" r="%s"/>' % (x, g + 12 + row * 10, r(2.4 - row * 0.7)))
    s.append('<g fill="%s">%s</g>' % (INK, ''.join(dots)))
    # bomba de varilla (balancín)
    px, py = 270, 430
    s.append('<rect x="120" y="%d" width="330" height="18" fill="%s"/>' % (g - 18, INK))
    s.append('<path d="M222 %d L%d %d L318 %d" fill="none" stroke="%s" stroke-width="13" stroke-linejoin="round"/>' % (g - 18, px, py + 6, g - 18, INK))
    s.append('<line x1="240" x2="300" y1="560" y2="560" stroke="%s" stroke-width="7"/>' % INK)
    s.append('<g transform="rotate(-11 %d %d)">' % (px, py) +
             '<rect x="150" y="%d" width="300" height="22" rx="3" fill="%s"/>' % (py - 11, INK) +
             '<path d="M178 %d H134 C104 %d 96 %d 102 %d H130 C126 %d 134 %d 156 %d H178 Z" fill="%s"/>' % (py - 15, py - 15, py + 30, py + 74, py + 44, py + 14, py + 14, INK) +
             '<circle cx="%d" cy="%d" r="9" fill="%s" stroke="%s" stroke-width="4"/>' % (px, py, AMBER, INK) +
             '</g>')
    # varilla y cabezal del pozo
    hx = 108
    s.append('<line x1="%d" x2="%d" y1="505" y2="%d" stroke="%s" stroke-width="4"/>' % (hx, hx, g - 30, INK))
    s.append('<rect x="%d" y="%d" width="24" height="30" fill="%s"/>' % (hx - 12, g - 30, INK))
    s.append('<rect x="%d" y="%d" width="40" height="8" fill="%s"/>' % (hx - 46, g - 22, INK))
    # contrapeso, biela y reductor
    cxw, cyw = 418, 560
    s.append('<line x1="%d" x2="%d" y1="%d" y2="%d" stroke="%s" stroke-width="7"/>' % (436, cxw + 18, 360, cyw - 10, INK))
    s.append('<rect x="392" y="%d" width="56" height="44" rx="4" fill="%s"/>' % (g - 62, INK))
    s.append('<g transform="rotate(28 %d %d)"><path d="M%d %d a42 42 0 0 1 0 84 z" fill="%s" stroke="%s" stroke-width="4" transform="rotate(-90 %d %d)"/></g>'
             % (cxw, cyw, cxw, cyw - 42, CORAL, INK, cxw, cyw))
    s.append('<circle cx="%d" cy="%d" r="10" fill="%s"/>' % (cxw, cyw, INK))
    return marco('06', T['ss_lab'], ('SUPPLY', 'SENSE'), AMBER, T['ss_pie'], T['ss_meta'], ''.join(s))


# ---------------------------------------------------------------- 06 · El cierre
def cierre():
    s = []
    g = 560
    tipos = 'auto asis asis asis auto auto auto hum asis auto auto asis asis auto hum asis auto auto auto auto'.split()
    pos = [(52 + 25 * i, 646) for i in range(9)] + [(252, 621), (252, 596)] + [(277 + 25 * i, 596) for i in range(8)] + [(452, 571)]
    s.append(puntos_disco(506, 300, 50, 9, 3.6, LIME, luz=(-0.5, 0.5)))
    s.append('<line x1="40" x2="560" y1="%d" y2="%d" stroke="%s" stroke-width="4"/>' % (g, g, INK))
    # casa
    hx, hw, hh = 340, 204, 168
    s.append('<rect x="%d" y="%d" width="28" height="70" fill="%s"/>' % (hx + 140, g - hh - 96, INK))
    s.append('<polygon points="%d,%d %d,%d %d,%d" fill="%s"/>' % (hx - 24, g - hh, hx + hw / 2, g - hh - 112, hx + hw + 24, g - hh, INK))
    s.append('<circle cx="%d" cy="%d" r="19" fill="%s" stroke="%s" stroke-width="4"/>' % (hx + hw / 2, g - hh - 40, CYAN, PAPER))
    s.append('<path d="M%d %d v38 M%d %d h38" stroke="%s" stroke-width="3"/>' % (hx + hw / 2, g - hh - 59, hx + hw / 2 - 19, g - hh - 40, PAPER))
    s.append('<rect x="%d" y="%d" width="%d" height="%d" fill="%s" stroke="%s" stroke-width="5"/>' % (hx, g - hh, hw, hh, PAPER, INK))
    s.append('<rect x="%d" y="%d" width="54" height="98" fill="%s"/>' % (425, g - 98, INK))
    s.append('<circle cx="%d" cy="%d" r="5" fill="%s"/>' % (468, g - 48, LIME))
    for wx in (hx + 20, hx + hw - 20 - 44):
        if wx > 400:
            continue
        s.append('<rect x="%d" y="%d" width="44" height="44" fill="%s" stroke="%s" stroke-width="4"/>' % (wx, g - hh + 22, CYAN, INK))
        s.append('<path d="M%d %d v44 M%d %d h44" stroke="%s" stroke-width="3"/>' % (wx + 22, g - hh + 22, wx, g - hh + 44, INK))
    s.append('<rect x="%d" y="%d" width="44" height="22" fill="%s" stroke="%s" stroke-width="4"/>' % (hx + 20, g - 70, CYAN, INK))
    # 20 pasos hacia la puerta
    colores = {'auto': LIME, 'asis': PAPER, 'hum': INK}
    for (x, y), t in zip(pos, tipos):
        s.append('<rect x="%d" y="%d" width="20" height="20" rx="2" fill="%s" stroke="%s" stroke-width="2.5"/>' % (x - 10, y - 10, colores[t], INK))
    # letrero con la flecha
    s.append('<line x1="292" x2="292" y1="%d" y2="452" stroke="%s" stroke-width="6"/>' % (g, INK))
    s.append(flecha(296, 448, 50, 180, INK))
    # freno de mano
    bx, by = 128, 518
    s.append('<rect x="%d" y="%d" width="76" height="42" rx="6" fill="%s"/>' % (bx - 38, by, INK))
    s.append('<line x1="%d" x2="%d" y1="%d" y2="%d" stroke="%s" stroke-width="13" stroke-linecap="round"/>' % (bx - 6, bx + 34, by + 8, by - 92, INK))
    s.append('<rect x="%d" y="%d" width="24" height="52" rx="11" fill="%s" stroke="%s" stroke-width="4" transform="rotate(22 %d %d)"/>' % (bx + 22, by - 140, LIME, INK, bx + 34, by - 114))
    s.append('<text x="%d" y="%d" %s font-size="11.5" letter-spacing="2.4" text-anchor="middle" fill="%s">%s</text>' % (bx, by + 26, MONO, PAPER, T['freno']))
    return marco('07', 'N8N', T['ci_tit'], CORAL, T['ci_pie'], T['ci_meta'], ''.join(s))


SITIO = os.path.join(AQUI, '..', '..', 'img', 'carteles') + '/'
os.makedirs(SITIO, exist_ok=True)
for lang in ('es', 'en'):
    T = TX[lang]
    CARTELES = [('concriterio', con_criterio()), ('rag', rag()), ('supplysense', supply()), ('cierre', cierre())]
    for nombre, svg in CARTELES:
        suf = '' if lang == 'es' else '-en'
        open(SITIO + '%s%s.svg' % (nombre, suf), 'w', encoding='utf-8').write(svg)
    print(lang, [len(s) // 1024 for _, s in CARTELES])
