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
  // Inicializa el estado de los modales de persona (elegibilidad automática + botón Guardar
  // desactivado si falta nacionalidad). En modales sin nacionalidad es inofensivo (no hace nada).
  if(typeof refreshDeclaredForOptions==="function") refreshDeclaredForOptions();
  // Inicializa las secciones de "Redes sociales" (genera/actualiza el avatar automático).
  if(typeof initAllSocialAvatars==="function") initAllSocialAvatars();
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
// Igual que imageUploadField pero como columna flexible (sin ocupar todo el ancho), para poner
// varias versiones del logo lado a lado en el mismo renglón (fondo oscuro / fondo claro, etc.).
function imageUploadFieldCol(label, key, currentValue, hintText, maxDim){
  const hiddenId = `f-${key}-data`;
  const fileId = `f-${key}-file`;
  const previewId = `f-${key}-preview`;
  return `
  <label class="field" style="flex:1 1 200px;min-width:0;">${label}
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
// Sección "Redes sociales" reutilizable (medios, clubes y selecciones).
// Campos: imagen de perfil (cuadrada 300×300), Nombre de perfil, Nombre de usuario (máx 15,
// solo letras/números/guion bajo) y Hashtag. Si NO se sube imagen de perfil, se genera una
// automáticamente con el logo elegido (claro/oscuro, u horizontal/vertical en medios) sobre uno
// de los 3 colores de marca (logo 250×250 centrado en 300×300).
//   key  = prefijo de ids ("msoc","clsoc","tsoc")
//   obj  = entidad (medio/club/selección)
//   ctx  = { logoOptions:[[val,label],...], logos:{val:dataURI,...}, colors:[c1,c2,c3] }
// El guardado lee: f-<key>-avatar-data (imagen final, manual o generada), f-<key>-avatar-manual,
// f-<key>-profile, f-<key>-username, f-<key>-hashtag, f-<key>-avlogo, f-<key>-avcolor.
// Un bloque de perfil de redes sociales (imagen + logo/color del avatar a la izquierda; nombre de
// perfil, usuario y hashtag a la derecha). `covName` (opcional) marca el bloque como perfil de una
// entrada de cobertura concreta (medios) vía data-social-cov, para el guardado.
function socialProfileBlockHTML(key, obj, ctx, covName){
  obj = obj || {};
  ctx = ctx || {};
  const logoOptions = ctx.logoOptions || [];
  const colors = (ctx.colors || []).map(c=>c || "#000000");
  const logoSel = obj.socialAvatarLogo || (logoOptions[0] && logoOptions[0][0]) || "";
  const colorSel = (obj.socialAvatarColor!=null && obj.socialAvatarColor!=="") ? String(obj.socialAvatarColor) : "0";
  const manual = obj.socialAvatarManual ? "1" : "";
  // Contexto (logos + colores) para regenerar el avatar en el navegador, sin tocar el guardado.
  const ctxJson = JSON.stringify({ logos: ctx.logos || {}, colors });
  const covAttr = (covName!=null) ? ` data-social-cov="${escapeHtml(covName)}"` : "";
  return `
  <div data-social-key="${key}"${covAttr} style="grid-column:1/-1;display:flex;flex-direction:column;gap:12px;">
    <script type="application/json" id="f-${key}-avctx">${ctxJson}</script>
    <input type="hidden" id="f-${key}-avatar-manual" value="${manual}">
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">
      <div style="flex:0 0 auto;width:200px;max-width:100%;">
        ${imageUploadFieldCol("Imagen de perfil (cuadrada, ideal 300×300)", key+"-avatar", obj.socialAvatar, "Si la dejas vacía, se genera con el logo y color de abajo.")}
      </div>
      <div style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px;justify-content:space-between;">
        <label class="field">Nombre de perfil<input id="f-${key}-profile" value="${escapeHtml(obj.socialProfileName||obj.socialHandle||'')}" placeholder="Nombre visible"></label>
        <label class="field">Nombre de usuario
          <input id="f-${key}-username" value="${escapeHtml(obj.socialUsername||'')}" maxlength="15" placeholder="usuario" oninput="this.value=this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,15)">
          <span style="font-size:11px;color:var(--muted);font-weight:400;">máx. 15 · solo letras, números y guion bajo (_) · sin espacios ni símbolos</span>
        </label>
        <label class="field">Hashtag<input id="f-${key}-hashtag" value="${escapeHtml(obj.socialHashtag||'')}" placeholder="#Hashtag"></label>
      </div>
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;">
      <label class="field" style="flex:1 1 200px;min-width:0;">Logo del avatar
        <select id="f-${key}-avlogo">${logoOptions.map(([v,l])=>`<option value="${v}" ${v===logoSel?'selected':''}>${escapeHtml(l)}</option>`).join("")}</select>
      </label>
      <label class="field" style="flex:1 1 200px;min-width:0;">Color de fondo
        <select id="f-${key}-avcolor">${colors.map((c,i)=>`<option value="${i}" ${String(i)===colorSel?'selected':''}>Color ${i+1}${i===0?' (principal)':''}</option>`).join("")}</select>
      </label>
    </div>
    <span style="font-size:11px;color:var(--muted);font-weight:400;">El logo y el color solo se usan cuando no subes una imagen de perfil.</span>
  </div>`;
}
// Sección "Redes sociales" de un solo perfil (clubes y selecciones).
function socialSectionHTML(key, obj, ctx){
  return `
  <div class="subhead">Redes sociales</div>
  ${socialProfileBlockHTML(key, obj, ctx)}`;
}
// Compone un avatar cuadrado de 300×300: rellena el fondo con bgHex y dibuja el logo centrado,
// ajustado dentro de un cuadro de 250×250 (conservando su proporción). Devuelve un data URI PNG.
function composeSocialAvatar(logoSrc, bgHex){
  return new Promise(resolve=>{
    const size=300, box=250, pad=(size-box)/2;
    const c=document.createElement("canvas"); c.width=size; c.height=size;
    const ctx=c.getContext("2d");
    ctx.fillStyle = bgHex || "#000000"; ctx.fillRect(0,0,size,size);
    if(!logoSrc){ resolve(c.toDataURL("image/png")); return; }
    const img=new Image();
    img.onload=()=>{
      let w=img.width, h=img.height; const sc=Math.min(box/w, box/h); w*=sc; h*=sc;
      ctx.drawImage(img, pad+(box-w)/2, pad+(box-h)/2, w, h);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror=()=>resolve(c.toDataURL("image/png"));
    img.src=logoSrc;
  });
}
// Inicializa una sección de redes sociales: regenera el avatar (cuando no hay imagen manual) al abrir
// y cada vez que cambian el logo o el color; marca "manual" al subir una imagen y lo desmarca al quitarla.
function initSocialAvatarSection(wrap){
  const key = wrap.getAttribute("data-social-key"); if(!key) return;
  const gId = id=>document.getElementById("f-"+key+"-"+id);
  const ctxEl = gId("avctx"); let ctx = {logos:{},colors:[]};
  try{ ctx = JSON.parse(ctxEl.textContent||"{}"); }catch(e){}
  const hidden = gId("avatar-data"), manualFlag = gId("avatar-manual");
  const preview = gId("avatar-preview"), fileInp = gId("avatar-file");
  const logoSel = gId("avlogo"), colorSel = gId("avcolor");
  const setPreview = (src)=>{ if(preview){ if(src){ preview.src=src; preview.style.display="block"; } else { preview.removeAttribute("src"); preview.style.display="none"; } } };
  const regen = ()=>{
    if(manualFlag && manualFlag.value==="1") return; // no pisar la imagen subida a mano
    const logo = (ctx.logos||{})[logoSel ? logoSel.value : ""] || "";
    const bg = (ctx.colors||[])[colorSel ? (parseInt(colorSel.value)||0) : 0] || "#000000";
    composeSocialAvatar(logo, bg).then(src=>{
      if(manualFlag && manualFlag.value==="1") return;
      if(hidden) hidden.value = src; setPreview(src);
    });
  };
  if(logoSel) logoSel.addEventListener("change", regen);
  if(colorSel) colorSel.addEventListener("change", regen);
  if(fileInp) fileInp.addEventListener("change", ()=>{ if(fileInp.files && fileInp.files.length){ if(manualFlag) manualFlag.value="1"; } });
  // El botón "Quitar imagen" de este avatar: reactiva la generación automática.
  const clearBtn = wrap.querySelector('[data-action="clear-image"][data-target="f-'+key+'-avatar-data"]');
  if(clearBtn) clearBtn.addEventListener("click", ()=>{ if(manualFlag) manualFlag.value=""; setTimeout(regen, 0); });
  // Al abrir: si no es manual, genera; si es manual, deja la imagen tal cual.
  if(!(manualFlag && manualFlag.value==="1")) regen();
}
function initAllSocialAvatars(){
  document.querySelectorAll("[data-social-key]").forEach(initSocialAvatarSection);
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
