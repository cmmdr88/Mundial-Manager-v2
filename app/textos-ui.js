/* =========================================================
   COPA MANAGER 2026 — app/textos-ui.js
   Textos de interfaz: resolución de etiquetas con fallback,
   agrupación de claves para el editor y etiquetas/descripciones
   de pestañas. Extracción mecánica: texto y orden idénticos al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (usa UI_TEXT_DEFAULTS) y ANTES del <script> inline (usa DB en
   tiempo de ejecución).
   ========================================================= */

/* =========================================================
   TEXTOS EDITABLES DE LA INTERFAZ
   Todo lo que un formulario muestra como etiqueta, ayuda o
   placeholder vive aquí. Se edita desde Editor → "Editar
   textos de la interfaz" sin tocar el diseño del simulador.
   ========================================================= */
function T(key){
  const v = DB && DB.strings && DB.strings[key];
  return (v!=null && v!=="") ? v : (UI_TEXT_DEFAULTS[key] ?? key);
}
function groupedTextKeys(){
  const groups = {};
  Object.keys(UI_TEXT_DEFAULTS).forEach(k=>{
    const group = k.split(".")[0];
    (groups[group] = groups[group]||[]).push(k);
  });
  return groups;
}

function tabLabel(id, fallback){
  // La pestaña del evento muestra un nombre fijo (editable desde textos de interfaz).
  if(id==="evento" && !(DB.strings && DB.strings["tabs.evento.label"])) return "Copa Mundial™";
  return T(`tabs.${id}.label`) || fallback;
}
function tabDescription(id){
  return T(`tabs.${id}.description`) || "";
}
function tabDescHTML(id){
  const d = tabDescription(id);
  return d ? `<p class="tab-desc">${d}</p>` : "";
}
