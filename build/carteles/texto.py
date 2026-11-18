"""Convierte texto a trazos SVG con Neue Haas Display (HarfBuzz para el espaciado, fontTools para los contornos)."""
import json
import os
import subprocess
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

# Neue Haas Grotesk Display es comercial (Commercial Type) y no se publica: apunta NEUE_HAAS_DIR a la carpeta local con
# NeueHaasDisplayBlack.ttf. Los carteles sólo llevan los trazos, no la fuente.
FUENTES = os.environ.get('NEUE_HAAS_DIR', '').rstrip('/') + '/'
_cache = {}


def _font(nombre):
    if nombre not in _cache:
        f = TTFont(FUENTES + nombre)
        _cache[nombre] = (f, f.getGlyphSet(), f.getGlyphOrder(), f['head'].unitsPerEm)
    return _cache[nombre]


def trazos(texto, size, x, y, nombre='NeueHaasDisplayBlack.ttf', tracking=0.0):
    """Regresa (d, ancho) del texto con línea base en (x, y) y altura de cuerpo `size`."""
    f, gs, order, upm = _font(nombre)
    out = subprocess.run(['hb-shape', FUENTES + nombre, texto, '--output-format=json', '--no-glyph-names'],
                         capture_output=True, text=True, check=True).stdout
    glyphs = json.loads(out)
    k = size / upm
    pen = SVGPathPen(gs)
    cx = 0.0
    for g in glyphs:
        name = order[g['g']]
        tp = TransformPen(pen, (k, 0, 0, -k, x + (cx + g.get('dx', 0)) * k, y - g.get('dy', 0) * k))
        gs[name].draw(tp)
        cx += g['ax'] + tracking * upm
    d = pen.getCommands()
    return d, (cx - tracking * upm) * k


def ancho(texto, size, nombre='NeueHaasDisplayBlack.ttf', tracking=0.0):
    return trazos(texto, size, 0, 0, nombre, tracking)[1]
