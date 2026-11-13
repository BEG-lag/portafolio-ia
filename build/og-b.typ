// Imagen para compartir de la portada (1200 x 630), estilo "Tinta y semáforo".
// Uso: typst compile build/og-b.typ img/og.png --ppi 72
#let tinta = rgb("#0a0c10")
#let hueso = rgb("#eceee6")
#let gris = rgb("#8a8f98")
#let lima = rgb("#cfff45")
#let ambar = rgb("#ffb648")
#let coral = rgb("#ff5d47")
#set page(width: 1200pt, height: 630pt, margin: 0pt, fill: tinta)
#set text(font: "Inter", fill: hueso)

// retícula de puntos a la derecha
#for fila in range(0, 15) {
  for col in range(0, 22) {
    let x = 640pt + col * 26pt
    let y = 30pt + fila * 40pt
    let d = calc.abs(col - 14) + calc.abs(fila - 6)
    let a = calc.max(8, 90 - d * 9)
    place(top + left, dx: x, dy: y, circle(radius: 2.6pt, fill: lima.transparentize(100% - a * 1%)))
  }
}

#place(top + left, dx: 70pt, dy: 58pt, stack(dir: ltr, spacing: 7pt,
  circle(radius: 6pt, fill: lima), circle(radius: 6pt, fill: ambar), circle(radius: 6pt, fill: coral),
  h(8pt), text(font: "Menlo", size: 20pt, tracking: 3pt)[BEG]))

#place(top + left, dx: 70pt, dy: 140pt, text(font: "Menlo", size: 17pt, fill: gris, tracking: 2pt)[PORTAFOLIO DE INTELIGENCIA ARTIFICIAL · CIUDAD DE MÉXICO])
#place(top + left, dx: 66pt, dy: 178pt, text(size: 116pt, weight: 700, tracking: -4pt)[Benjamín])
#place(top + left, dx: 66pt, dy: 300pt, text(size: 100pt, weight: 600, tracking: -3pt, fill: tinta, stroke: 1.6pt + hueso)[Esponda García])
#place(top + left, dx: 70pt, dy: 448pt, text(size: 30pt, weight: 500)[Abogado corporativo mexicano que #text(fill: lima, style: "italic")[construye] con inteligencia artificial.])

#place(bottom + left, dx: 70pt, dy: -48pt, text(font: "Menlo", size: 20pt, fill: lima)[pivotek.mx])
