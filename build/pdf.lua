-- Ajustes del README para el PDF:
-- 1. Quita lo que va antes de la primera sección (la portada del PDF ya lo trae).
-- 2. Convierte en texto los enlaces internos de GitHub (anclas y README).
-- 3. Cambia el GIF de BeCa por la tira de cuadros y fija anchos de imagen.

function Pandoc(doc)
  local blocks, started = {}, false
  for _, b in ipairs(doc.blocks) do
    if not started and b.t == "Header" then started = true end
    if started then table.insert(blocks, b) end
  end
  doc.blocks = blocks
  return doc
end

function Link(el)
  local t = el.target
  if t:sub(1, 1) == "#" or t:match("^README") then return el.content end
end

function Image(el)
  if el.src:match("beca%-jugando%-con%-clawd%.gif$") then
    el.src = "assets/beca-jugando-con-clawd-tira.png"
    el.attributes.width = "62%"
  elseif el.src:match("arquitectura") then
    el.attributes.width = "100%"
  end
  return el
end
