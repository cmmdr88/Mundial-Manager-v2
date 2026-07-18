/* =========================================================
   COPA MANAGER 2026 — app/modales.js
   Infraestructura genérica de UI: abrir/cerrar modales, confirmación
   propia, avisos (toast), campos de subida de imagen/tipografía y
   navegación entre fichas. Extracción mecánica: texto y orden idénticos
   al original (showToast, detailNavHTML y el grupo de modales, en ese
   orden de aparición). Script CLÁSICO (no module). Cargar ANTES del
   <script> inline. Infraestructura consumida por casi todos los módulos.
   Su única dependencia saliente es renderKitPreviews (ui-kits), que
   openModal invoca en tiempo de ejecución y permanece en el inline.
   NOTA: colorPickerHTML (helper hermano de campo de formulario) NO forma
   parte de este módulo y permanece en el inline.
   ========================================================= */

function showToast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(()=>t.classList.remove("show"), 2200);
}

// Flechas arriba/abajo para moverse entre fichas (selecciones o jugadores) sin volver a la lista.
// idx = posición actual (0-based), total = cuántos elementos hay en el recorrido.
function detailNavHTML(action, idx, total){
  if(total<=1 || idx<0) return "";
  return `
  <div class="detail-nav">
    <button class="btn ghost sm arrow" data-action="${action}" data-dir="prev" title="Anterior" aria-label="Anterior">↑</button>
    <button class="btn ghost sm arrow" data-action="${action}" data-dir="next" title="Siguiente" aria-label="Siguiente">↓</button>
    <span class="detail-nav-count mono">${idx+1}/${total}</span>
  </div>`;
}

/* ---------- MODALES ---------- */
function openModal(html){
  document.getElementById("modal-root").innerHTML = `<div class="modal-overlay" id="modal-overlay">${html}</div>`;
  document.getElementById("modal-overlay").addEventListener("click", (e)=>{
    // Clic en el fondo = lo mismo que la X de cerrar (algunos modales, como el de editar
    // uniforme, necesitan volver a la ventana de origen en vez de cerrar todo).
    if(e.target.id==="modal-overlay"){
      const closeBtn = document.querySelector("#modal-root .modal-close");
      if(closeBtn) closeBtn.click(); else closeModal();
    }
  });
  renderKitPreviews();
}
function closeModal(){ document.getElementById("modal-root").innerHTML = ""; }
// Confirm propio, basado en nuestros modales — no depende de window.confirm(), que puede venir
// bloqueado dentro de la vista previa embebida y fallar en silencio sin avisar nada.
function modalConfirm(message, onConfirm, confirmLabel){
  openModal(`
    <div class="modal-box" style="max-width:380px;">
      <div class="modal-head"><h2>Confirmar</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body"><p style="margin:0;font-size:14px;">${message}</p></div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn danger" id="modal-confirm-yes">${confirmLabel||"Eliminar"}</button>
      </div>
    </div>
  `);
  document.getElementById("modal-confirm-yes").onclick = ()=>{ closeModal(); onConfirm(); };
}

function imageUploadField(label, key, currentValue, hintText, maxDim){
  const hiddenId = `f-${key}-data`;
  const fileId = `f-${key}-file`;
  const previewId = `f-${key}-preview`;
  return `
  <label class="field" style="grid-column:1/-1;">${label}
    <div class="img-upload">
      <div class="thumb"><img id="${previewId}" ${currentValue?`src="${currentValue}"`:''} style="display:${currentValue?'block':'none'};"></div>
      <div class="controls">
        <input type="file" id="${fileId}" accept="image/png,image/jpeg" data-imgfield data-target="${hiddenId}" data-preview="${previewId}" data-maxdim="${maxDim||300}">
        <button type="button" class="btn ghost sm" data-action="clear-image" data-target="${hiddenId}" data-preview="${previewId}" style="width:fit-content;">Quitar imagen</button>
      </div>
    </div>
    ${hintText?`<span style="font-size:11px;color:var(--muted);font-weight:400;">${hintText}</span>`:''}
    <input type="hidden" id="${hiddenId}" value="${currentValue||''}">
  </label>`;
}
// Caps de resolución para subir bases de prenda recoloreables (camisetas/shorts/calcetas/back) — estos
// PNG son ilustraciones planas de pocos colores puros (no fotos), y necesitan conservar sus bordes
// exactos para que el sistema de recoloreado funcione bien. Si se reducen demasiado al subirlos (con
// el redimensionado normal del navegador, que no sabe nada del sistema de 3 colores), se generan
// pixeles de borde mezclados/antialiased que después el recoloreado no puede reconstruir
// correctamente — apareciendo como líneas o recuadros grises falsos en ciertas combinaciones de
// color. Por eso estas bases se guardan a una resolución bastante más alta que otras imágenes (fotos,
// logos, etc., que sí se pueden achicar sin problema).
// Campo para subir un archivo de tipografía (.otf/.ttf/.woff/.woff2) — se guarda como data: URL
// sin redimensionar (a diferencia de imageUploadField, que sí procesa la imagen con canvas).
function fontUploadField(label, key, hintText){
  const hiddenId = `f-${key}-data`;
  const fileId = `f-${key}-file`;
  return `
  <label class="field" style="grid-column:1/-1;">${label}
    <input type="file" id="${fileId}" accept=".otf,.ttf,.woff,.woff2,font/otf,font/ttf,font/woff,font/woff2" data-fontfield data-target="${hiddenId}">
    ${hintText?`<span style="font-size:11px;color:var(--muted);font-weight:400;">${hintText}</span>`:''}
    <input type="hidden" id="${hiddenId}" value="">
  </label>`;
}
