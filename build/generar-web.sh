#!/bin/zsh
# El sitio (pivotek.mx) es la propuesta B, hecha a mano:
#   index.html (español), en/index.html (inglés), css/, js/, img/, vendor/, fonts/
# Ya no se genera desde los README. Este script sólo regenera las imágenes para compartir.
# Uso: zsh build/generar-web.sh   (desde cualquier carpeta)
set -e
cd "$(dirname "$0")/.."
typst compile build/og-b.typ img/og.png --ppi 72 && echo "listo: img/og.png"
typst compile build/og-b-en.typ img/og-en.png --ppi 72 && echo "listo: img/og-en.png"
