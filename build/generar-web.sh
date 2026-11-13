#!/bin/zsh
# Genera el sitio web (pivotek.mx) a partir de los README:
#   index.html (español) y en/index.html (inglés), más las imágenes para compartir.
# Uso: zsh build/generar-web.sh   (desde cualquier carpeta)
set -e
cd "$(dirname "$0")/.."
python3 build/generar_assets.py
mkdir -p en
# Desde el 13-11-2026 la portada en español (index.html, css/, js/) es la propuesta B,
# diseñada por Fable 5.2 a mano; este script sólo regenera la versión en inglés (en/).
for L in en; do
  if [[ $L == es ]]; then src=README.es.md; out=index.html
  else src=README.md; out=en/index.html; fi
  pandoc "$src" -o "$out" --standalone --wrap=none --section-divs \
    --template=build/web.html \
    --metadata-file="build/meta-$L.yaml" \
    --lua-filter=build/web.lua
  echo "listo: $out"
  # Imagen para compartir en redes (1200 x 630)
  tmp=$(mktemp -d)
  cp "assets/portada-$L.svg" "$tmp/portada.svg"
  printf '#set page(width: 1200pt, height: 630pt, margin: 0pt, fill: rgb("#F4EBDD"))\n#align(center + horizon, image("portada.svg", width: 1140pt))\n' > "$tmp/og.typ"
  typst compile --root "$tmp" "$tmp/og.typ" "assets/og-$L.png" --ppi 72
  rm -rf "$tmp"
done
