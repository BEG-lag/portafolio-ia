#!/bin/zsh
# Regenera los recursos visuales y los dos PDF del portafolio.
# Uso: zsh build/generar-pdf.sh   (desde cualquier carpeta)
# Diseño de pivotek.mx: Inter (instalada en la Mac), JetBrains Mono y Cormorant Garamond
# en cursiva (build/fuentes, convertidas de las fuentes del sitio).
set -e
cd "$(dirname "$0")/.."
python3 build/generar_assets.py
mkdir -p pdf
for L in en es; do
  if [[ $L == en ]]; then src=README.md; out=pdf/portfolio-BEG-en.pdf
  else src=README.es.md; out=pdf/portafolio-BEG-es.pdf; fi
  pandoc "$src" -o "$out" --pdf-engine=typst \
    --pdf-engine-opt=--font-path=build/fuentes \
    --template=build/portafolio.typst \
    --metadata-file="build/meta-$L.yaml" \
    --lua-filter=build/pdf.lua \
    --shift-heading-level-by=-1
  echo "listo: $out"
done
