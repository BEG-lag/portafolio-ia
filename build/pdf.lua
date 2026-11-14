-- Ajustes del README para el PDF (diseño de pivotek.mx):
-- 1. Quita lo que va antes de la primera sección (la portada del PDF ya lo trae).
-- 2. Cada sección numerada lleva su ceja ("03 · Destacado: ...") como título y,
--    debajo, el titular del sitio (meta "titulares"), con la cursiva en verde lima.
-- 3. La lista de "Contenido" se cambia por un índice con número de página.
-- 4. Convierte en texto los enlaces internos de GitHub (anclas y README).
-- 5. Pone en verde la frase "¿Por qué BeCa?".
-- 6. Cambia el GIF de BeCa por la tira de cuadros y el diagrama por su versión oscura.
-- 7. El párrafo que sigue al titular no se queda solo al pie de una página: va pegado a lo que sigue.
-- 8. En la tabla de formación académica, el logo de cada universidad (en claro, como en el sitio)
--    va arriba de su nombre.

local function a_typst(inlines)
  local s = pandoc.write(pandoc.Pandoc({ pandoc.Plain(inlines) }), "typst")
  return (s:gsub("%s+$", ""))
end

local function titular(inlines)
  return pandoc.RawBlock("typst", "#titular[" .. a_typst(inlines) .. "]")
end

-- "3." -> ceja con el número en lima; "9.1" -> número de subsección
local function numerar(h)
  local c = h.content
  local primero = c[1]
  if not (primero and primero.t == "Str") then return nil end
  local n = primero.text:match("^(%d+)%.$")
  if n and c[2] and c[2].t == "Space" then
    local resto = { table.unpack(c, 3) }
    h.content = { pandoc.RawInline("typst", string.format("#text(fill: lima)[%02d]", tonumber(n))),
                  pandoc.Space(), pandoc.Str("·"), pandoc.Space(), table.unpack(resto) }
    return n, resto
  end
  local sub = primero.text:match("^(%d+%.%d+)$")
  if sub and c[2] and c[2].t == "Space" then
    h.content = { pandoc.RawInline("typst", "#numsub[" .. sub .. "]"), table.unpack(c, 3) }
  end
  return nil
end

function Pandoc(doc)
  local titulares = doc.meta.titulares or {}
  local blocks, started, salta_lista, pega = {}, false, false, false
  for _, b in ipairs(doc.blocks) do
    if not started and b.t == "Header" then started = true end
    if started then
      if b.t == "Header" then
        local n, resto = numerar(b)
        table.insert(blocks, b)
        if n then
          local t = titulares[n]
          table.insert(blocks, titular(t and t or resto))
          pega = true
        elseif #blocks == 1 then
          -- "Contenido": titular propio y, en lugar de la lista, el índice
          if doc.meta["titular-indice"] then table.insert(blocks, titular(doc.meta["titular-indice"])) end
          table.insert(blocks, pandoc.RawBlock("typst", "#indice()"))
          salta_lista = true
        end
      elseif salta_lista and (b.t == "OrderedList" or b.t == "BulletList") then
        salta_lista = false
      elseif pega and b.t == "Para" then
        pega = false
        table.insert(blocks, pandoc.RawBlock("typst", "#block(sticky: true)["))
        table.insert(blocks, b)
        table.insert(blocks, pandoc.RawBlock("typst", "]"))
      else
        pega = false
        table.insert(blocks, b)
      end
    end
  end
  doc.blocks = blocks
  return doc
end

-- "¿Por qué BeCa? ..." / "Why BeCa? ..." en verde lima, como en el sitio
function Para(el)
  local c = el.content
  for i = 1, #c - 2 do
    local a, b = c[i], c[i + 2]
    local es = a.t == "Str" and a.text == "¿Por" and c[i + 4] and c[i + 4].t == "Str" and c[i + 4].text == "BeCa?"
    local en = a.t == "Str" and a.text == "Why" and b.t == "Str" and b.text == "BeCa?"
    if es or en then
      c:insert(i, pandoc.RawInline("typst", "#text(fill: lima)["))
      c:insert(pandoc.RawInline("typst", "]"))
      return el
    end
  end
end

function Link(el)
  local t = el.target
  if t:sub(1, 1) == "#" or t:match("^README") then return el.content end
end

function Image(el)
  if el.src:match("beca%-jugando%-con%-clawd%-animado%.png$") then
    el.src = "assets/beca-jugando-con-clawd-tira.png"
    el.attributes.width = "62%"
  elseif el.src:match("arquitectura") then
    el.src = el.src:gsub("%.svg$", "-oscuro.svg")
    el.attributes.width = "100%"
  end
  return el
end

-- Logos de las universidades en la tabla de formación académica (columna "Institución" / "School")
local LOGOS = {
  { "Anáhuac", "img/logo-anahuac-claro.png", "24pt" },
  { "EAE", "img/logo-eae-claro.png", "12.5pt" },
  { "Iberoamericana", "img/logo-ibero-claro.png", "17pt" },
}

function Table(tbl)
  local head = tbl.head.rows[1]
  if not head or not head.cells[2] then return nil end
  local h = pandoc.utils.stringify(head.cells[2].contents)
  if h ~= "Institución" and h ~= "School" then return nil end
  for _, body in ipairs(tbl.bodies) do
    for _, row in ipairs(body.body) do
      local cell = row.cells[2]
      local txt = pandoc.utils.stringify(cell.contents)
      for _, l in ipairs(LOGOS) do
        if txt:find(l[1], 1, true) then
          local img = pandoc.Image({}, l[2], "")
          img.attributes.height = l[3]
          table.insert(cell.contents, 1, pandoc.Plain({ img, pandoc.LineBreak() }))
          break
        end
      end
    end
  end
  return tbl
end
