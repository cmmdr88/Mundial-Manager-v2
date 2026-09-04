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

function imageUploadField(label, key, currentValue, hintText, maxDim, format){
  const hiddenId = `f-${key}-data`;
  const fileId = `f-${key}-file`;
  const previewId = `f-${key}-preview`;
  const fmtAttr = format ? ` data-imgformat="${format}"` : "";
  return `
  <label class="field" style="grid-column:1/-1;">${label}
    <div class="img-upload">
      <div class="thumb"><img id="${previewId}" ${currentValue?`src="${currentValue}"`:''} loading="lazy" decoding="async" style="display:${currentValue?'block':'none'};"></div>
      <div class="controls">
        <input type="file" id="${fileId}" accept="image/png,image/jpeg" data-imgfield data-target="${hiddenId}" data-preview="${previewId}" data-maxdim="${maxDim||300}"${fmtAttr}>
        <button type="button" class="btn ghost sm" data-action="clear-image" data-target="${hiddenId}" data-preview="${previewId}" style="width:fit-content;">Quitar imagen</button>
      </div>
    </div>
    ${hintText?`<span style="font-size:11px;color:var(--muted);font-weight:400;">${hintText}</span>`:''}
    <input type="hidden" id="${hiddenId}" value="${currentValue||''}">
  </label>`;
}
// Igual que imageUploadField pero como columna flexible (sin ocupar todo el ancho), para poner
// varias versiones del logo lado a lado en el mismo renglón (fondo oscuro / fondo claro, etc.).
function imageUploadFieldCol(label, key, currentValue, hintText, maxDim, format){
  const hiddenId = `f-${key}-data`;
  const fileId = `f-${key}-file`;
  const previewId = `f-${key}-preview`;
  const fmtAttr = format ? ` data-imgformat="${format}"` : "";
  return `
  <label class="field" style="flex:1 1 200px;min-width:0;">${label}
    <div class="img-upload">
      <div class="thumb"><img id="${previewId}" ${currentValue?`src="${currentValue}"`:''} loading="lazy" decoding="async" style="display:${currentValue?'block':'none'};"></div>
      <div class="controls">
        <input type="file" id="${fileId}" accept="image/png,image/jpeg" data-imgfield data-target="${hiddenId}" data-preview="${previewId}" data-maxdim="${maxDim||300}"${fmtAttr}>
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
function socialProfileBlockHTML(key, obj, ctx, covName, opts){
  obj = obj || {};
  ctx = ctx || {};
  opts = opts || {};
  const avatarOnly = !!opts.avatarOnly; // solo Imagen de perfil + logo del avatar + color de fondo
  const logoOptions = ctx.logoOptions || [];
  const colors = (ctx.colors || []).map(c=>c || "#000000");
  const logoSel = obj.socialAvatarLogo || (logoOptions[0] && logoOptions[0][0]) || "";
  const colorSel = (obj.socialAvatarColor!=null && obj.socialAvatarColor!=="") ? String(obj.socialAvatarColor) : "0";
  const manual = obj.socialAvatarManual ? "1" : "";
  // Contexto (logos + colores) para regenerar el avatar en el navegador, sin tocar el guardado.
  const ctxJson = JSON.stringify({ logos: ctx.logos || {}, colors, colorInputs: ctx.colorInputs || [] });
  const covAttr = (covName!=null) ? ` data-social-cov="${escapeHtml(covName)}"` : "";
  // Opciones del "Color de fondo": Color 1/2/3 de la entidad (selección/club/medio) + Blanco + Negro.
  const avcolorOptionsHTML =
      colors.map((c,i)=>`<option value="${i}" ${String(i)===colorSel?'selected':''}>Color ${i+1}${i===0?' (principal)':''}</option>`).join("")
    + `<option value="white" ${colorSel==="white"?'selected':''}>Blanco</option>`
    + `<option value="black" ${colorSel==="black"?'selected':''}>Negro</option>`;
  // Bloques reutilizables: imagen de perfil, selects de logo/color y la nota al pie.
  const avatarUpload = imageUploadFieldCol("Imagen de perfil (cuadrada, ideal 300×300)", key+"-avatar", obj.socialAvatar, "Si la dejas vacía, se genera con el logo y color de abajo.");
  const avlogoField = `<label class="field" style="flex:1 1 200px;min-width:0;">Logo del avatar
      <select id="f-${key}-avlogo">${logoOptions.map(([v,l])=>`<option value="${v}" ${v===logoSel?'selected':''}>${escapeHtml(l)}</option>`).join("")}</select>
    </label>`;
  const avcolorField = `<label class="field" style="flex:1 1 200px;min-width:0;">Color de fondo
      <select id="f-${key}-avcolor">${avcolorOptionsHTML}</select>
    </label>`;
  const hintSpan = `<span style="font-size:11px;color:var(--muted);font-weight:400;">El logo y el color solo se usan cuando no subes una imagen de perfil.</span>`;
  // Marca de verificación (se mostrará junto al nombre de perfil). Opciones: Ninguna / Azul / Dorado.
  const verifSel = (obj.socialVerified || "").toString();
  const VERIF_OPTS = [["","Ninguna"],["azul","Azul"],["dorado","Dorado"],["gris","Gris"]];
  const verifField = `<label class="field">Marca de verificación
      <select id="f-${key}-verif">${VERIF_OPTS.map(([v,l])=>`<option value="${v}" ${v===verifSel?'selected':''}>${l}</option>`).join("")}</select>
    </label>`;

  // Modo avatarOnly (perfil por defecto de medios): dos columnas equilibradas en altura.
  // Izquierda: imagen de perfil. Derecha: Nombre de perfil + Nombre de usuario + Marca de
  // verificación, y debajo el logo del avatar y el color de fondo lado a lado.
  if(avatarOnly){
    return `
  <div data-social-key="${key}"${covAttr} style="grid-column:1/-1;display:flex;flex-direction:column;gap:8px;">
    <script type="application/json" id="f-${key}-avctx">${ctxJson}</script>
    <input type="hidden" id="f-${key}-avatar-manual" value="${manual}">
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">
      <div style="flex:0 0 auto;width:200px;max-width:100%;">
        ${avatarUpload}
      </div>
      <div style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px;justify-content:flex-start;">
        <label class="field">Nombre de perfil<input id="f-${key}-profile" value="${escapeHtml(obj.socialProfileName||obj.socialHandle||'')}" placeholder="Nombre visible"></label>
        <label class="field">Nombre de usuario
          <input id="f-${key}-username" value="${escapeHtml(obj.socialUsername||'')}" maxlength="15" placeholder="usuario" oninput="this.value=this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,15)">
          <span style="font-size:11px;color:var(--muted);font-weight:400;">máx. 15 · solo letras, números y guion bajo (_) · sin espacios ni símbolos</span>
        </label>
        ${verifField}
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <label class="field" style="flex:1 1 130px;min-width:0;">Logo del avatar
            <select id="f-${key}-avlogo">${logoOptions.map(([v,l])=>`<option value="${v}" ${v===logoSel?'selected':''}>${escapeHtml(l)}</option>`).join("")}</select>
          </label>
          <label class="field" style="flex:1 1 130px;min-width:0;">Color de fondo
            <select id="f-${key}-avcolor">${avcolorOptionsHTML}</select>
          </label>
        </div>
        ${hintSpan}
      </div>
    </div>
  </div>`;
  }

  // Modo inheritImage (perfiles por cobertura de medios): la imagen se hereda del perfil por
  // defecto (se actualiza en vivo). El usuario solo personaliza nombre de perfil y usuario; puede
  // subir una imagen propia para sobrescribir la heredada. El logo, el color y la marca de
  // verificación se heredan del perfil por defecto (no se editan por cobertura).
  if(opts.inheritImage){
    const inheritUpload = imageUploadFieldCol("Imagen de perfil (opcional)", key+"-avatar", obj.socialAvatar, "Por defecto usa la imagen del perfil por defecto. Sube una para personalizar solo esta cobertura.");
    // Placeholders en GRIS con los datos del PERFIL POR DEFECTO: indican qué se usará si el campo
    // queda vacío (fallback por campo). Se actualizan en vivo (updateMediaCovPlaceholders).
    const ph = opts.placeholders || {};
    const phProfile = ph.profile ? escapeHtml(ph.profile) : "Nombre visible";
    const phUser = ph.username ? escapeHtml(ph.username) : "usuario";
    // Marca de verificación por cobertura: MISMA lógica que los demás campos. Vacío ("") = usa la del
    // perfil por defecto (opción "Según el perfil por defecto"); o se puede fijar Ninguna/Azul/Dorado/Gris.
    const VERIF_LABEL = { "":"Ninguna", none:"Ninguna", azul:"Azul", dorado:"Dorado", gris:"Gris" };
    const covVerif = (obj.socialVerified || "").toString();
    const defVerifLabel = VERIF_LABEL[(ph.verif||"").toString()] || "Ninguna";
    const covVerifOptions =
        `<option value="" ${covVerif===""?'selected':''}>Según el perfil por defecto (${escapeHtml(defVerifLabel)})</option>`
      + `<option value="none" ${covVerif==="none"?'selected':''}>Ninguna</option>`
      + `<option value="azul" ${covVerif==="azul"?'selected':''}>Azul</option>`
      + `<option value="dorado" ${covVerif==="dorado"?'selected':''}>Dorado</option>`
      + `<option value="gris" ${covVerif==="gris"?'selected':''}>Gris</option>`;
    return `
  <div data-social-key="${key}"${covAttr} data-inherit-image="1" style="grid-column:1/-1;display:flex;flex-direction:column;gap:10px;">
    <script type="application/json" id="f-${key}-avctx">${ctxJson}</script>
    <input type="hidden" id="f-${key}-avatar-manual" value="${manual}">
    <input type="hidden" id="f-${key}-avlogo" value="${escapeHtml(logoSel)}">
    <input type="hidden" id="f-${key}-avcolor" value="${escapeHtml(colorSel)}">
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">
      <div style="flex:0 0 auto;width:200px;max-width:100%;">
        ${inheritUpload}
      </div>
      <div style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px;justify-content:flex-start;">
        <label class="field">Nombre de perfil<input id="f-${key}-profile" value="${escapeHtml(obj.socialProfileName||obj.socialHandle||'')}" placeholder="${phProfile}"></label>
        <label class="field">Nombre de usuario
          <input id="f-${key}-username" value="${escapeHtml(obj.socialUsername||'')}" maxlength="15" placeholder="${phUser}" oninput="this.value=this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,15)">
          <span style="font-size:11px;color:var(--muted);font-weight:400;">máx. 15 · solo letras, números y guion bajo (_) · sin espacios ni símbolos · vacío = usa el del perfil por defecto</span>
        </label>
        <label class="field">Marca de verificación
          <select id="f-${key}-verif" data-cov-verif>${covVerifOptions}</select>
        </label>
      </div>
    </div>
  </div>`;
  }

  // Layout completo (clubes y selecciones).
  const nameFields = `<div style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px;justify-content:space-between;">
        <label class="field">Nombre de perfil<input id="f-${key}-profile" value="${escapeHtml(obj.socialProfileName||obj.socialHandle||'')}" placeholder="Nombre visible"></label>
        <label class="field">Nombre de usuario
          <input id="f-${key}-username" value="${escapeHtml(obj.socialUsername||'')}" maxlength="15" placeholder="usuario" oninput="this.value=this.value.replace(/[^A-Za-z0-9_]/g,'').slice(0,15)">
          <span style="font-size:11px;color:var(--muted);font-weight:400;">máx. 15 · solo letras, números y guion bajo (_) · sin espacios ni símbolos</span>
        </label>
        ${verifField}
      </div>`;
  return `
  <div data-social-key="${key}"${covAttr} style="grid-column:1/-1;display:flex;flex-direction:column;gap:12px;">
    <script type="application/json" id="f-${key}-avctx">${ctxJson}</script>
    <input type="hidden" id="f-${key}-avatar-manual" value="${manual}">
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:stretch;">
      <div style="flex:0 0 auto;width:200px;max-width:100%;">
        ${avatarUpload}
      </div>
      ${nameFields}
    </div>
    <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;">
      ${avlogoField}
      ${avcolorField}
    </div>
    ${hintSpan}
  </div>`;
}
// Sección "Redes sociales" de un solo perfil (clubes y selecciones).
function socialSectionHTML(key, obj, ctx){
  return `
  <div class="subhead">Redes sociales</div>
  ${socialProfileBlockHTML(key, obj, ctx)}`;
}
// Resuelve el HEX del color de fondo del avatar a partir del valor guardado (socialAvatarColor):
//  "white" -> #FFFFFF, "black" -> #0D0D0D, o un índice 0/1/2 dentro de los colores de la entidad.
function resolveSocialBg(val, colors){
  val = (val==null ? "" : String(val));
  if(val==="white") return "#FFFFFF";
  if(val==="black") return "#0D0D0D";
  const i = parseInt(val); return (colors||[])[isNaN(i)?0:i] || "#000000";
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
  const clearBtn = wrap.querySelector('[data-action="clear-image"][data-target="f-'+key+'-avatar-data"]');

  // --- Perfiles POR COBERTURA (medios): la imagen se HEREDA del perfil por defecto ---
  if(wrap.getAttribute("data-inherit-image")==="1"){
    const applyDefault = ()=>{
      if(manualFlag && manualFlag.value==="1") return; // respeta imagen propia subida
      const def = document.getElementById("f-msoc-avatar-data");
      const src = def ? def.value : "";
      if(hidden) hidden.value = src; setPreview(src||"");
    };
    wrap._applyDefaultAvatar = applyDefault; // usado por la propagación y el botón "restablecer"
    const refreshSummary = ()=>{ if(typeof updateMediaCovSummary==="function") updateMediaCovSummary(wrap); };
    if(fileInp) fileInp.addEventListener("change", ()=>{ if(fileInp.files && fileInp.files.length){ if(manualFlag) manualFlag.value="1"; refreshSummary(); } });
    if(clearBtn) clearBtn.addEventListener("click", ()=>{ if(manualFlag) manualFlag.value=""; setTimeout(()=>{ applyDefault(); refreshSummary(); }, 0); });
    if(!(manualFlag && manualFlag.value==="1")) applyDefault();
    return;
  }

  // Colores de la entidad EN VIVO: si el ctx trae los ids de los selectores de color del modal
  // (colorInputs), se leen de ahí en cada regeneración; así el avatar refleja al instante los
  // cambios de Color 1/2/3 del club/selección/medio. Si no, se usan los colores del ctx (snapshot).
  const colorInputIds = (ctx.colorInputs && ctx.colorInputs.length) ? ctx.colorInputs : null;
  const liveColors = ()=> colorInputIds
    ? colorInputIds.map((id,i)=>{ const e=document.getElementById(id); return (e && e.value) || (ctx.colors||[])[i] || "#000000"; })
    : (ctx.colors||[]);
  const regen = ()=>{
    if(manualFlag && manualFlag.value==="1"){ if(key==="msoc" && typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar(); return; } // no pisar la imagen subida a mano
    const logo = (ctx.logos||{})[logoSel ? logoSel.value : ""] || "";
    const bg = resolveSocialBg(colorSel ? colorSel.value : "0", liveColors());
    composeSocialAvatar(logo, bg).then(src=>{
      if(manualFlag && manualFlag.value==="1") return;
      if(hidden) hidden.value = src; setPreview(src);
      // Perfil por defecto de un medio: propaga su imagen a los perfiles por cobertura.
      if(key==="msoc" && typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar();
    });
  };
  if(logoSel) logoSel.addEventListener("change", regen);
  if(colorSel) colorSel.addEventListener("change", regen);
  // Regenerar EN VIVO cuando el usuario cambia los colores del club/selección/medio.
  if(colorInputIds){ colorInputIds.forEach(id=>{ const e=document.getElementById(id); if(e) e.addEventListener("input", regen); }); }
  if(fileInp) fileInp.addEventListener("change", ()=>{ if(fileInp.files && fileInp.files.length){ if(manualFlag) manualFlag.value="1"; } });
  // El botón "Quitar imagen" de este avatar: reactiva la generación automática.
  if(clearBtn) clearBtn.addEventListener("click", ()=>{ if(manualFlag) manualFlag.value=""; setTimeout(regen, 0); });
  // Al abrir: si no es manual, genera; si es manual, deja la imagen tal cual.
  if(!(manualFlag && manualFlag.value==="1")) regen();
  else if(key==="msoc" && typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar();
}
function initAllSocialAvatars(){
  document.querySelectorAll("[data-social-key]").forEach(initSocialAvatarSection);
  // Tras inicializar todo, asegura que los perfiles por cobertura muestren la imagen del
  // perfil por defecto (por si el default se inicializó después que las coberturas).
  if(document.getElementById("media-cov-profiles") && typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar();
}
// Copia la imagen del perfil POR DEFECTO de un medio a todos los perfiles POR COBERTURA que no
// tengan imagen propia (manual). Se llama en vivo al cambiar la imagen del perfil por defecto.
function mediaPropagateDefaultAvatar(){
  const def = document.getElementById("f-msoc-avatar-data");
  const src = def ? def.value : "";
  document.querySelectorAll('#media-cov-profiles [data-social-cov]').forEach(w=>{
    const k = w.getAttribute("data-social-key");
    const man = document.getElementById("f-"+k+"-avatar-manual");
    if(man && man.value==="1") return; // respeta la imagen propia de esa cobertura
    const h = document.getElementById("f-"+k+"-avatar-data");
    const pv = document.getElementById("f-"+k+"-avatar-preview");
    if(h) h.value = src;
    if(pv){ if(src){ pv.src=src; pv.style.display="block"; } else { pv.removeAttribute("src"); pv.style.display="none"; } }
  });
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
