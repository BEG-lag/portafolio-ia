-- Ajustes del README para la versión web:
-- 1. Quita lo que va antes de la primera sección (el hero de la plantilla ya lo trae).
-- 2. Da a cada encabezado el mismo identificador que GitHub, para que el índice funcione igual.
-- 3. Rutas absolutas para assets y PDF; las ligas entre README pasan a las páginas de cada idioma.
-- 4. Envuelve las tablas para que se desplacen de lado en el celular.

local GITHUB = "https://github.com/BEG-lag/portafolio-ia"

local function slug(text)
  local s = pandoc.text.lower(text)
  s = s:gsub("%p", function(c) if c == "-" then return c end return "" end)
  s = s:gsub("%s+", "-")
  return s
end

local function ruta(src)
  if src:match("^assets/") or src:match("^pdf/") then return "/" .. src end
  if src == "README.es.md" then return "/" end
  if src == "README.md" then return "/en" end
  if src:match("^build/?$") then return GITHUB .. "/tree/main/build" end
  return src
end

function Header(el)
  el.identifier = slug(pandoc.utils.stringify(el.content))
  return el
end

function Image(el)
  el.src = ruta(el.src)
  el.attributes.loading = "lazy"
  return el
end

function Link(el)
  el.target = ruta(el.target)
  if el.target:match("^https?://") and not el.target:match("^https://concriterio%.mx") then
    el.attributes.target = "_blank"
    el.attributes.rel = "noopener"
  end
  return el
end

function RawBlock(el)
  if el.format == "html" then
    el.text = el.text:gsub('src="assets/', 'src="/assets/')
  end
  return el
end

function RawInline(el)
  if el.format == "html" then
    el.text = el.text:gsub('src="assets/', 'src="/assets/')
  end
  return el
end

function Table(el)
  return {
    pandoc.RawBlock("html", '<div class="tabla">'),
    el,
    pandoc.RawBlock("html", "</div>"),
  }
end

function Pandoc(doc)
  local blocks, started = {}, false
  for _, b in ipairs(doc.blocks) do
    if not started and b.t == "Header" then started = true end
    if started then table.insert(blocks, b) end
  end
  doc.blocks = blocks
  return doc
end
