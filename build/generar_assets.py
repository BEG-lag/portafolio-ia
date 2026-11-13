"""Genera los recursos visuales del portafolio (paleta arena y ladrillo).

Uso: python3 build/generar_assets.py   (desde la raíz del repo)
Crea en assets/: ornamento.svg, esquina.svg, portada-{en,es}.svg,
arquitectura-cierre-n8n-{en,es}.svg y, si existe el arte de BeCa,
beca-jugando-con-clawd.gif y beca-jugando-con-clawd-tira.png.
"""
import os
import shutil
from html import escape

OUT = "assets"
os.makedirs(OUT, exist_ok=True)

# Paleta arena y ladrillo
ARENA_50, ARENA_100, ARENA_200, ARENA_300 = "#FBF7F0", "#F4EBDD", "#E9DBC4", "#D9C4A3"
LADRILLO, LADRILLO_HONDO, LADRILLO_SUAVE = "#A3452E", "#7C2F1E", "#C9755C"
TINTA, GRIS = "#2E241D", "#6E5D50"
SERIF = "Baskerville, 'Libre Baskerville', 'Hoefler Text', Georgia, serif"
SANS = "'Avenir Next', Avenir, 'Helvetica Neue', Helvetica, Arial, sans-serif"


def t(x, y, s, size=11, weight="normal", fill=TINTA, anchor="start", family=SANS, style="normal", spacing=0):
    ls = f' letter-spacing="{spacing}"' if spacing else ""
    return (f'<text x="{x}" y="{y}" font-family="{family}" font-size="{size}" font-weight="{weight}" '
            f'font-style="{style}" fill="{fill}" text-anchor="{anchor}"{ls}>{escape(s)}</text>')


def rombo(cx, cy, r, fill=LADRILLO, stroke=None, sw=1):
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<path d="M{cx},{cy-r} L{cx+r},{cy} L{cx},{cy+r} L{cx-r},{cy} Z" fill="{fill}"{st}/>'


def divisor(cx, cy, half=130):
    """Ornamento horizontal: línea, rombos y remates."""
    o = [f'<line x1="{cx-half}" y1="{cy}" x2="{cx-22}" y2="{cy}" stroke="{LADRILLO}" stroke-width="1.1"/>',
         f'<line x1="{cx+22}" y1="{cy}" x2="{cx+half}" y2="{cy}" stroke="{LADRILLO}" stroke-width="1.1"/>',
         f'<circle cx="{cx-half}" cy="{cy}" r="2.4" fill="{LADRILLO}"/>',
         f'<circle cx="{cx+half}" cy="{cy}" r="2.4" fill="{LADRILLO}"/>',
         rombo(cx - 15, cy, 3.2), rombo(cx + 15, cy, 3.2),
         rombo(cx, cy, 8.5, fill="none", stroke=LADRILLO, sw=1.2), rombo(cx, cy, 4.2)]
    return "\n".join(o)


def esquina_g():
    """Ornamento de esquina (origen arriba a la izquierda)."""
    return "\n".join([
        f'<path d="M6,6 H70 M6,6 V70" stroke="{LADRILLO}" stroke-width="1.6" fill="none"/>',
        f'<path d="M14,14 H44 M14,14 V44" stroke="{LADRILLO}" stroke-width="0.8" fill="none"/>',
        rombo(6, 6, 6), rombo(22, 22, 3.2),
        f'<circle cx="70" cy="6" r="2.4" fill="{LADRILLO}"/>',
        f'<circle cx="6" cy="70" r="2.4" fill="{LADRILLO}"/>'])


def svg(w, h, body, title=""):
    tt = f"<title>{escape(title)}</title>" if title else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'{tt}\n{body}\n</svg>\n')


def escribir(nombre, contenido):
    with open(os.path.join(OUT, nombre), "w", encoding="utf-8") as f:
        f.write(contenido)


# 1. Ornamento divisor y esquina
escribir("ornamento.svg", svg(300, 24, divisor(150, 12, 140)))
escribir("esquina.svg", svg(78, 78, esquina_g()))
escribir("favicon.svg", svg(64, 64, f'<rect width="64" height="64" rx="14" fill="{ARENA_100}"/>'
                         + rombo(32, 32, 22, fill=LADRILLO) + rombo(32, 32, 10, fill="none", stroke=ARENA_100, sw=2.2)))

# 2. Portadas del README
PORTADA = {
    "en": dict(etiqueta="AI PORTFOLIO",
               linea="Corporate and energy lawyer who builds with AI",
               lema="Claude Code plugins · legal RAG · n8n workflows · data pipelines · websites and video",
               cifras=[("1", "legal-tech product on sale"), ("374", "energy-law instruments indexed"),
                       ("560K+", "public contracts analyzed"), ("25+", "projects built in 2026")]),
    "es": dict(etiqueta="PORTAFOLIO DE INTELIGENCIA ARTIFICIAL",
               linea="Abogado corporativo y de energía que construye con IA",
               lema="Plugins de Claude Code · RAG legal · flujos en n8n · pipelines de datos · sitios y video",
               cifras=[("1", "producto legal-tech a la venta"), ("374", "instrumentos de energía indexados"),
                       ("560 mil+", "contratos públicos analizados"), ("25+", "proyectos en 2026")]),
}
for L, d in PORTADA.items():
    W, H = 1200, 430
    o = [f'<rect x="0" y="0" width="{W}" height="{H}" rx="18" fill="{ARENA_100}"/>',
         f'<rect x="18" y="18" width="{W-36}" height="{H-36}" rx="6" fill="none" stroke="{LADRILLO}" stroke-width="2"/>',
         f'<rect x="27" y="27" width="{W-54}" height="{H-54}" rx="3" fill="none" stroke="{LADRILLO}" stroke-width="0.8"/>']
    for tr in ("translate(27,27)", f"translate({W-27},27) scale(-1,1)",
               f"translate(27,{H-27}) scale(1,-1)", f"translate({W-27},{H-27}) scale(-1,-1)"):
        o.append(f'<g transform="{tr}">{esquina_g()}</g>')
    o += [t(600, 88, d["etiqueta"], 15, "600", LADRILLO, "middle", SANS, spacing=5),
          t(600, 160, "Benjamín Esponda García", 56, "normal", TINTA, "middle", SERIF),
          t(600, 205, d["linea"], 25, "normal", LADRILLO, "middle", SERIF, "italic"),
          divisor(600, 236, 150),
          t(600, 274, d["lema"], 16.5, "normal", GRIS, "middle", SANS)]
    x0, bw, gap, y0 = 90, 240, 20, 304
    for i, (val, txt) in enumerate(d["cifras"]):
        x = x0 + i * (bw + gap)
        o += [f'<rect x="{x}" y="{y0}" width="{bw}" height="70" rx="8" fill="{ARENA_50}" stroke="{ARENA_300}" stroke-width="1.2"/>',
              rombo(x + bw / 2, y0, 4.5),
              t(x + bw / 2, y0 + 36, val, 28, "normal", LADRILLO, "middle", SERIF),
              t(x + bw / 2, y0 + 57, txt, 13.5, "normal", GRIS, "middle", SANS)]
    escribir(f"portada-{L}.svg", svg(W, H, "\n".join(o), "Benjamín Esponda García · " + d["etiqueta"].title()))

# 3. Arquitectura del cierre inmobiliario en n8n
T = {
    "en": {
        "title": "Automated real-estate closing: n8n architecture",
        "sub": "Design for a real-estate law firm in Baja California (client anonymized). Stage: design.",
        "in": "Inputs", "out": "Outputs",
        "inputs": [("New deal intake", "Short paralegal form"), ("Client documents", "Secure upload link"),
                   ("Third-party email", "Notary, bank, escrow, appraiser"), ("Client WhatsApp", "“What’s my closing status?”")],
        "outputs": [("Folder per deal", "Drive: 01 Client … 08 Post-closing"), ("Bilingual outgoing email", "Templates filled from the record"),
                    ("WhatsApp Business API", "Notices and status bot"), ("Partner dashboard", "Stage, days per step, blockers")],
        "container": "n8n, self-hosted on the client’s server",
        "record": ("Single deal record", "Single source of truth · Google Sheets first, own database if volume grows"),
        "mods": [("Email reader", ["Gmail + AI", "classifies mail,", "links it to the deal"]),
                 ("Document AI", ["Claude via API", "reads passports,", "checks the deed", "against the record"]),
                 ("Timers", ["deadlines per step,", "certificate validity", "and reminders"])],
        "pill": "human approval",
        "gate": ("Signing gate", ["closing can only be booked", "when every condition is met"]),
        "logs": ("Logs and errors", ["run log and instant", "alert on failure"]),
        "a_title": "Signing gate conditions",
        "a": ["Foreign Affairs (SRE) permit granted", "Appraisal received", "Certificates still valid on the proposed date",
              "Deed draft approved by the trust bank", "Funds confirmed in escrow", "Final balance paid"],
        "b_title": "Design rules",
        "b": [("•", "20 closing steps: 11 automated, 7 assisted, 2 human"), ("•", "Steps 4 to 7 run in parallel once escrow opens"),
              ("•", "Anti-fraud: no flow ever sends bank details; an email"), ("", "mentioning “new wiring instructions” raises a red alert"),
              ("•", "Demo on fictitious data; production on the client’s server"),
              ("•", "Expected savings: 50% to 70% of busywork per closing [ESTIMATE]")],
        "foot": "Tools: n8n · Gmail · Google Drive and Sheets · WhatsApp Business API · Claude API",
    },
    "es": {
        "title": "Cierre inmobiliario automatizado: arquitectura en n8n",
        "sub": "Diseño para un despacho inmobiliario en Baja California (cliente anonimizado). Etapa: diseño.",
        "in": "Entradas", "out": "Salidas",
        "inputs": [("Alta de operación", "Formulario corto del paralegal"), ("Documentos del cliente", "Liga segura de carga"),
                   ("Correo de terceros", "Notaría, banco, escrow, valuador"), ("WhatsApp del cliente", "“¿Cómo va mi cierre?”")],
        "outputs": [("Carpeta por operación", "Drive: 01 Cliente … 08 Post-cierre"), ("Correo saliente bilingüe", "Plantillas desde el expediente"),
                    ("WhatsApp Business API", "Avisos y bot de estatus"), ("Tablero del socio director", "Etapas, días por paso, atorones")],
        "container": "n8n autoalojado en el servidor del cliente",
        "record": ("Expediente único por operación", "Única fuente de verdad · Google Sheets al inicio, base propia si crece"),
        "mods": [("Lector de correo", ["Gmail + IA", "clasifica correos", "y los liga a cada", "operación"]),
                 ("IA documental", ["Claude vía API", "lee pasaportes y", "compara la escritura", "con el expediente"]),
                 ("Temporizadores", ["plazos por paso,", "vigencias de", "certificados y", "recordatorios"])],
        "pill": "aprobación humana",
        "gate": ("Compuerta de firma", ["sólo deja agendar la firma", "cuando todo está listo"]),
        "logs": ("Bitácora y errores", ["registro y aviso", "inmediato si falla"]),
        "a_title": "Condiciones de la compuerta de firma",
        "a": ["Permiso de la SRE otorgado", "Avalúo recibido", "Certificados vigentes a la fecha propuesta",
              "Proyecto aprobado por el banco fiduciario", "Fondos confirmados en escrow", "Saldo final pagado"],
        "b_title": "Reglas de diseño",
        "b": [("•", "20 pasos del cierre: 11 automáticos, 7 asistidos, 2 humanos"), ("•", "Pasos 4 a 7 en paralelo en cuanto se abre el escrow"),
              ("•", "Antifraude: ningún flujo envía cuentas bancarias; un correo"), ("", "con “cambio de cuenta” lanza alerta roja y exige llamada"),
              ("•", "Demo con datos ficticios; producción en servidor del cliente"),
              ("•", "Ahorro esperado: 50% a 70% de la talacha por cierre [ESTIMADO]")],
        "foot": "Herramientas: n8n · Gmail · Google Drive y Sheets · WhatsApp Business API · Claude API",
    },
}


def caja(x, y, w, h, fill=ARENA_50, stroke=ARENA_300, r=10, sw=1.2):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'


def arquitectura(L):
    d = T[L]
    o = ['<defs><marker id="ar" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" '
         f'orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="{GRIS}"/></marker></defs>',
         caja(0, 0, 1000, 650, fill="#FFFCF7", stroke=ARENA_200, r=14),
         t(40, 46, d["title"], 23, "normal", TINTA, family=SERIF),
         t(40, 70, d["sub"], 12.5, fill=GRIS),
         t(40, 99, d["in"].upper(), 11, "600", LADRILLO, spacing=1.5),
         t(750, 99, d["out"].upper(), 11, "600", LADRILLO, spacing=1.5)]
    ys = [110, 184, 258, 332]
    for (a, b), y in zip(d["inputs"], ys):
        o += [caja(40, y, 210, 56), t(56, y + 24, a, 13, "600"), t(56, y + 42, b, 10.5, fill=GRIS),
              f'<line x1="250" y1="{y+28}" x2="288" y2="{y+28}" stroke="{GRIS}" stroke-width="1.5" marker-end="url(#ar)"/>']
    for (a, b), y in zip(d["outputs"], ys):
        o += [caja(750, y, 210, 56), t(766, y + 24, a, 13, "600"), t(766, y + 42, b, 10.5, fill=GRIS),
              f'<line x1="712" y1="{y+28}" x2="748" y2="{y+28}" stroke="{GRIS}" stroke-width="1.5" marker-end="url(#ar)"/>']
    o += [caja(290, 92, 420, 298, fill="#FFFFFF", stroke=LADRILLO, r=14, sw=1.8),
          t(310, 113, d["container"], 12, "600", LADRILLO),
          caja(310, 122, 380, 50, fill=ARENA_100, stroke=LADRILLO),
          t(500, 143, d["record"][0], 13, "600", anchor="middle"),
          t(500, 161, d["record"][1], 10.5, fill=GRIS, anchor="middle")]
    for i, ((title, lines), x) in enumerate(zip(d["mods"], [310, 440, 570])):
        cx = x + 60
        o += [f'<line x1="{cx}" y1="172" x2="{cx}" y2="188" stroke="{LADRILLO}" stroke-width="1.5" marker-end="url(#ar)"/>',
              caja(x, 190, 120, 112), t(cx, 210, title, 12, "600", anchor="middle")]
        for j, ln in enumerate(lines):
            o.append(t(cx, 228 + j * 14, ln, 10.5, fill=GRIS, anchor="middle"))
        if i == 1:
            o += [caja(x + 10, 280, 100, 16, fill=ARENA_100, stroke=LADRILLO, r=8, sw=1),
                  t(cx, 292, d["pill"], 9.5, "600", LADRILLO, "middle")]
    g, lg = d["gate"], d["logs"]
    o += [caja(310, 316, 250, 60, fill=ARENA_100, stroke=LADRILLO), t(435, 337, g[0], 12, "600", anchor="middle"),
          t(435, 353, g[1][0], 10.5, fill=GRIS, anchor="middle"), t(435, 367, g[1][1], 10.5, fill=GRIS, anchor="middle"),
          caja(570, 316, 120, 60), t(630, 337, lg[0], 12, "600", anchor="middle"),
          t(630, 353, lg[1][0], 10.5, fill=GRIS, anchor="middle"), t(630, 367, lg[1][1], 10.5, fill=GRIS, anchor="middle")]
    o += [caja(40, 412, 450, 190), t(60, 441, d["a_title"], 15, "normal", LADRILLO_HONDO, family=SERIF)]
    for i, s in enumerate(d["a"]):
        y = 467 + i * 21
        o += [caja(60, y - 10, 11, 11, fill="#FFFFFF", stroke=LADRILLO, r=2, sw=1.4),
              f'<path d="M62.5,{y-4.5} L65,{y-2} L69,{y-7.5}" fill="none" stroke="{LADRILLO}" stroke-width="1.6"/>',
              t(80, y, s, 11.5)]
    o += [caja(510, 412, 450, 190), t(530, 441, d["b_title"], 15, "normal", LADRILLO_HONDO, family=SERIF)]
    for i, (bul, s) in enumerate(d["b"]):
        y = 467 + i * 21
        if bul:
            o.append(rombo(534, y - 4, 3.3))
        o.append(t(546, y, s, 11.5))
    o += [divisor(880, 622, 70), t(40, 626, d["foot"], 10.5, fill=GRIS)]
    return svg(1000, 650, "\n".join(o), d["title"])


for L in ("en", "es"):
    escribir(f"arquitectura-cierre-n8n-{L}.svg", arquitectura(L))

# 4. BeCa jugando con Clawd (GIF animado para GitHub y tira de cuadros para el PDF)
ARTE = os.path.expanduser("~/Claudecodetodo/axo-acompanante")
gif, sprite = f"{ARTE}/arte-gato/juego/play.gif", f"{ARTE}/app/clips/play.png"
if os.path.exists(gif) and os.path.exists(sprite):
    from PIL import Image, PngImagePlugin
    hoja = Image.open(sprite).convert("RGBA")
    fw, fh = 192, hoja.height
    # Animación con fondo transparente (APNG): se ve animada en GitHub y en el sitio
    paleta = hoja.quantize(colors=160, method=Image.Quantize.FASTOCTREE)  # paleta compartida: ~170 KB en vez de 1.4 MB
    marcos = [paleta.crop((k * fw, 0, (k + 1) * fw, fh)) for k in range(paleta.width // fw)]
    marcos[0].save(os.path.join(OUT, "beca-jugando-con-clawd-animado.png"), save_all=True,
                   append_images=marcos[1:], duration=[109] * (len(marcos) - 1) + [900], loop=0,
                   disposal=PngImagePlugin.Disposal.OP_NONE, blend=PngImagePlugin.Blend.OP_SOURCE, optimize=True)
    viejo = os.path.join(OUT, "beca-jugando-con-clawd.gif")
    if os.path.exists(viejo):
        os.remove(viejo)
    cuadros = [9, 17, 19, 23]  # cuadros donde Clawd queda completo
    gap = 24
    tira = Image.new("RGBA", (len(cuadros) * fw + (len(cuadros) - 1) * gap, fh), (0, 0, 0, 0))
    for i, k in enumerate(cuadros):
        tira.paste(hoja.crop((k * fw, 0, (k + 1) * fw, fh)), (i * (fw + gap), 0))
    tira.save(os.path.join(OUT, "beca-jugando-con-clawd-tira.png"), optimize=True)

print("assets listos:", ", ".join(sorted(os.listdir(OUT))))
