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
  // Vista previa del "Icono del medio" (logo elegido sobre el color elegido).
  if(typeof initMediaIconPreview==="function") initMediaIconPreview();
  if(typeof initAllIconPreviews==="function") initAllIconPreviews();
  // Colores propios de la federación: casilla que activa/desactiva los 3 selectores de color.
  if(typeof initFedOwnColors==="function") initFedOwnColors();
  // Federación: nombre/siglas en vivo + perfil de redes heredado (en gris) de la selección.
  if(typeof initFedSection==="function") initFedSection();
  // El Press Wall (selecciones/clubes) se actualiza con el listener global de datos/presswall.js;
  // al abrir el modal hay que refrescar el muro (render async basado en la referencia).
  if(typeof pwRefreshAllEditors==="function") pwRefreshAllEditors(document.getElementById("modal-root"));
}
// Vista previa en vivo del icono del medio: dibuja el logo elegido sobre el color de fondo elegido,
// leyendo en tiempo real los colores y logos del formulario (misma lógica que el avatar de redes).
function initMediaIconPreview(){
  const box=document.getElementById("media-icon-box"); if(!box) return;
  const prev=document.getElementById("micon-preview"); const img=prev?prev.querySelector("img"):null;
  const colorSel=document.getElementById("f-micon-color"), logoSel=document.getElementById("f-micon-logo"), sizeInp=document.getElementById("f-micon-size");
  if(!prev||!img||!colorSel||!logoSel) return;
  const gv=id=>{ const el=document.getElementById(id); return el?el.value:""; };
  // Incluye logos alternos (aN): se leen del input oculto f-malt-N-data.
  const logoData=v=>{ if(/^a\d+$/.test(v)) return gv("f-malt-"+v.slice(1)+"-data"); return gv({hd:"f-mlogo-hd-data",hl:"f-mlogo-hl-data",vd:"f-mlogo-vd-data",vl:"f-mlogo-vl-data"}[v]||""); };
  const colHex=()=>{ const v=colorSel.value; if(v==="white")return "#FFFFFF"; if(v==="black")return "#0D0D0D"; const ids=["f-mcolor1","f-mcolor2","f-mcolor3"]; return gv(ids[parseInt(v)||0])||"#15161D"; };
  const upd=()=>{
    prev.style.background=colHex();
    // Prioridad al elegir/respaldar el logo: el elegido, luego hd → vd → hl → vl.
    let src=logoData(logoSel.value); if(!src){ src=logoData("hd")||logoData("vd")||logoData("hl")||logoData("vl"); }
    let pct=parseInt(sizeInp?sizeInp.value:75); if(isNaN(pct)) pct=75; pct=Math.max(1,Math.min(100,pct));
    img.style.width=pct+"%"; img.style.height=pct+"%";
    if(src){ img.src=src; img.style.display="block"; } else { img.removeAttribute("src"); img.style.display="none"; }
  };
  [colorSel,logoSel,sizeInp,document.getElementById("f-mcolor1"),document.getElementById("f-mcolor2"),document.getElementById("f-mcolor3")].forEach(e=>{ if(e){ e.addEventListener("change",upd); e.addEventListener("input",upd); } });
  ["f-mlogo-hd-data","f-mlogo-hl-data","f-mlogo-vd-data","f-mlogo-vl-data"].forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener("input",upd); });
  upd();
}
// Sección "Icono de <entidad>" reutilizable (torneo, confederación, FIFA, patrocinador, club, selección, federación).
// Misma lógica que el "Icono del medio": logo elegido sobre el color elegido, a un tamaño (%).
//   key = prefijo de ids ("evicon","conficon","fifaicon","spicon","clicon","ticon","fedicon")
//   opts = { title, logoOptions:[[val,label]], logoInputs:{val:inputId}, colors:[hex,...], colorInputs:[inputId,...], defaultLogo, hint }
function iconEditorSectionHTML(key, obj, opts){
  obj=obj||{}; opts=opts||{};
  const title=opts.title||"Icono";
  const logoOptions=opts.logoOptions||[["dark","Fondo oscuro"],["light","Fondo claro"]];
  const colors=(opts.colors||[]).map(c=>c||"#0D0D0D");
  const curColor=(obj.iconColor!=null&&obj.iconColor!=="")?String(obj.iconColor):"0";
  const defLogo=opts.defaultLogo||(logoOptions[0]&&logoOptions[0][0])||"dark";
  const curLogo=(obj.iconLogo||defLogo).toString();
  const curSize=(obj.iconLogoSize!=null&&obj.iconLogoSize!=="")?Math.max(1,Math.min(100,parseInt(obj.iconLogoSize)||75)):75;
  const ctx=JSON.stringify({logoInputs:opts.logoInputs||{}, fallbackLogoInputs:opts.fallbackLogoInputs||{}, colorInputs:opts.colorInputs||[], defaultLogo:defLogo, altPrefix:opts.altPrefix||""});
  const colorOptions = colors.map((c,i)=>`<option value="${i}" ${String(i)===curColor?'selected':''}>Color ${i+1}${i===0?' (principal)':''}</option>`).join("")
    + `<option value="white" ${curColor==="white"?'selected':''}>Blanco</option>`
    + `<option value="black" ${curColor==="black"?'selected':''}>Negro</option>`;
  return `
  <div class="subhead">${escapeHtml(title)}</div>
  <div class="org-icon-box" data-iconkey="${key}" style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;align-items:flex-end;">
    <script type="application/json" id="f-${key}-iconctx">${ctx}</script>
    <div id="${key}-preview" class="micon-prev" style="align-self:center;"><img alt=""></div>
    <label class="field" style="flex:1 1 140px;min-width:120px;">Color de fondo
      <select id="f-${key}-color">${colorOptions}</select>
    </label>
    <label class="field" style="flex:1 1 140px;min-width:120px;">Logo
      <select id="f-${key}-logo"${opts.altPrefix?` data-logovar-sel="${opts.altPrefix}"`:''}>${logoOptions.map(([v,l])=>`<option value="${v}" ${v===curLogo?'selected':''}>${escapeHtml(l)}</option>`).join("")}</select>
    </label>
    <label class="field" style="flex:1 1 120px;min-width:110px;">Tamaño del logo (%)
      <input type="number" id="f-${key}-size" min="1" max="100" step="1" value="${curSize}">
    </label>
    <span class="hint" style="font-size:11px;flex:1 1 100%;">${opts.hint||"Se usa como icono en los lugares donde aparece esta entidad (por ejemplo, sus correos en el buzón)."}</span>
  </div>`;
}
// Federación: la casilla "Usar colores propios" habilita/deshabilita los 3 selectores de color.
// Si está desmarcada, los colores de la federación reflejan (y siguen) los de la selección.
function initFedOwnColors(){
  const chk=document.getElementById("f-fed-owncolors");
  const wrap=document.getElementById("f-fed-colors-wrap");
  if(!chk||!wrap) return;
  const fedIds=["f-fed-color1","f-fed-color2","f-fed-color3"];
  const teamIds=["f-color1","f-color2","f-color3"];
  const syncFromTeam=()=>{
    fedIds.forEach((fid,i)=>{
      const fEl=document.getElementById(fid), tEl=document.getElementById(teamIds[i]);
      if(!fEl||!tEl||fEl.value===tEl.value) return;
      fEl.value=tEl.value;
      fEl.dispatchEvent(new Event("input",{bubbles:true}));
    });
  };
  const apply=()=>{
    if(chk.checked){
      wrap.style.opacity=""; wrap.style.pointerEvents="";
    }else{
      wrap.style.opacity=".45"; wrap.style.pointerEvents="none";
      syncFromTeam();
    }
  };
  chk.addEventListener("change", apply);
  teamIds.forEach(tid=>{
    const el=document.getElementById(tid);
    if(el) el.addEventListener("input", ()=>{ if(!chk.checked) syncFromTeam(); });
  });
  apply();
}
// Federación (editor de selecciones): mantiene sincronizados EN VIVO el nombre y las siglas mostrados
// en el submenú, y hace que el perfil de redes de la federación herede (en gris) el de la selección:
// placeholders con el nombre/usuario de la selección y foto heredada del avatar de la selección.
function initFedSection(){
  // 1) Nombre y siglas de la federación: reflejan en vivo los campos editables de arriba.
  const bind=(srcId,dstId)=>{
    const src=document.getElementById(srcId), dst=document.getElementById(dstId);
    if(src&&dst) src.addEventListener("input", ()=>{ dst.value = src.value; });
  };
  bind("f-federationname","f-fed-name-display");
  bind("f-federationabbr","f-fed-abbr-display");

  // 2) Perfil de redes de la federación heredado de la selección (perfil "tsoc").
  const fedWrap=document.querySelector('[data-social-key="fedsoc"][data-inherit-image="1"]');
  if(!fedWrap) return;
  const VERIF_LABEL={ "":"Ninguna", none:"Ninguna", azul:"Azul", dorado:"Dorado", gris:"Gris" };
  const gv=id=>(document.getElementById(id)||{}).value||"";
  const refreshPlaceholders=()=>{
    const p=document.getElementById("f-fedsoc-profile"), u=document.getElementById("f-fedsoc-username");
    if(p) p.placeholder = gv("f-tsoc-profile") || "Nombre visible";
    if(u) u.placeholder = gv("f-tsoc-username") || "usuario";
    const vsel=document.getElementById("f-fedsoc-verif");
    if(vsel && vsel.options.length){ vsel.options[0].textContent = "Según el perfil por defecto (" + (VERIF_LABEL[gv("f-tsoc-verif")]||"Ninguna") + ")"; }
  };
  const propagateAvatar=()=>{ if(typeof fedWrap._applyDefaultAvatar==="function") fedWrap._applyDefaultAvatar(); };
  const refreshAll=()=>{ refreshPlaceholders(); propagateAvatar(); };
  // En vivo: al cambiar el perfil por defecto (nombre/usuario/verif) de la selección.
  ["f-tsoc-profile","f-tsoc-username","f-tsoc-verif"].forEach(id=>{
    const el=document.getElementById(id); if(el){ el.addEventListener("input", refreshPlaceholders); el.addEventListener("change", refreshPlaceholders); }
  });
  // En vivo: al regenerarse el avatar de la selección (por logo, colores, tamaño o imagen subida).
  ["f-tsoc-avlogo","f-tsoc-avcolor","f-tsoc-avsize","f-logo-data","f-logo-l-data","f-color1","f-color2","f-color3"].forEach(id=>{
    const el=document.getElementById(id); if(el){ el.addEventListener("input", ()=>setTimeout(propagateAvatar,0)); el.addEventListener("change", ()=>setTimeout(propagateAvatar,0)); }
  });
  const tsocFile=document.getElementById("f-tsoc-avatar-file");
  if(tsocFile) tsocFile.addEventListener("change", ()=>setTimeout(propagateAvatar,120));
  // La generación del avatar de la selección es asíncrona: propaga tras un pequeño retraso al abrir.
  refreshPlaceholders(); setTimeout(refreshAll, 60);
}
// Vista previa en vivo de todas las secciones "Icono de <entidad>" del formulario abierto.
function initAllIconPreviews(){
  document.querySelectorAll(".org-icon-box[data-iconkey]").forEach(box=>{
    const key=box.getAttribute("data-iconkey");
    let ctx={}; try{ ctx=JSON.parse((document.getElementById("f-"+key+"-iconctx")||{}).textContent||"{}"); }catch(e){}
    const prev=document.getElementById(key+"-preview"); const img=prev?prev.querySelector("img"):null;
    const colorSel=document.getElementById("f-"+key+"-color"), logoSel=document.getElementById("f-"+key+"-logo"), sizeInp=document.getElementById("f-"+key+"-size");
    if(!prev||!img||!colorSel||!logoSel) return;
    const gv=id=>{ const el=document.getElementById(id); return el?el.value:""; };
    // Logo por variante: primero el propio; si está vacío, el de respaldo (p. ej. el escudo de la selección para la federación).
    const logoData=v=>{ let s=gv((ctx.logoInputs||{})[v]||""); if(!s) s=gv((ctx.fallbackLogoInputs||{})[v]||""); if(!s && ctx.altPrefix && /^a\d+$/.test(v)) s=gv("f-"+ctx.altPrefix+"-"+v.slice(1)+"-data"); return s; };
    const colHex=()=>{ const v=colorSel.value; if(v==="white")return "#FFFFFF"; if(v==="black")return "#0D0D0D"; const ids=ctx.colorInputs||[]; return gv(ids[parseInt(v)||0])||"#15161D"; };
    const order=Object.keys(Object.assign({}, ctx.logoInputs||{}, ctx.fallbackLogoInputs||{}));
    const upd=()=>{
      prev.style.background=colHex();
      let src=logoData(logoSel.value); if(!src){ for(const k of order){ src=logoData(k); if(src) break; } }
      let pct=parseInt(sizeInp?sizeInp.value:75); if(isNaN(pct)) pct=75; pct=Math.max(1,Math.min(100,pct));
      img.style.width=pct+"%"; img.style.height=pct+"%";
      if(src){ img.src=src; img.style.display="block"; } else { img.removeAttribute("src"); img.style.display="none"; }
    };
    [colorSel,logoSel,sizeInp].forEach(e=>{ if(e){ e.addEventListener("change",upd); e.addEventListener("input",upd); } });
    (ctx.colorInputs||[]).forEach(id=>{ const el=document.getElementById(id); if(el){ el.addEventListener("change",upd); el.addEventListener("input",upd); } });
    Object.values(ctx.logoInputs||{}).concat(Object.values(ctx.fallbackLogoInputs||{})).forEach(id=>{ const el=document.getElementById(id); if(el) el.addEventListener("input",upd); });
    upd();
  });
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
// Sección desplegable (cerrada por defecto) de LOGOS ALTERNOS ("Alt 1", "Alt 2", …) para el editor de
// patrocinadores y medios. Cada alterno es una carga de imagen extra; una vez cargado queda disponible
// como opción en todos los selectores de logo del editor (gráficos, icono, avatar) y del press wall.
// prefix = "salt" (patrocinadores) | "malt" (medios). Los ids de los inputs son f-<prefix>-<i>-data.
function logoAltRowHTML(prefix, i, alt){
  alt = alt || {};
  const label = "Alt " + (i+1);
  return `<div class="logo-alt-row" data-altprefix="${prefix}" data-alt-idx="${i}" style="flex:1 1 190px;min-width:170px;max-width:230px;display:flex;flex-direction:column;gap:6px;">
    ${imageUploadFieldCol(label, prefix+"-"+i, alt.img||"", "")}
    <button type="button" class="btn danger sm" data-action="remove-logo-alt" data-altprefix="${prefix}" data-alt-idx="${i}" style="width:fit-content;">Quitar ${label}</button>
  </div>`;
}
function logoAltsSectionHTML(prefix, alts){
  alts = Array.isArray(alts) ? alts : [];
  const rows = alts.map((a,i)=>logoAltRowHTML(prefix, i, a)).join("");
  return `
  <details class="logo-alts-details" data-altprefix="${prefix}" style="grid-column:1/-1;border:1px solid var(--line);border-radius:10px;padding:0;overflow:hidden;">
    <summary style="cursor:pointer;padding:11px 14px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;list-style:none;background:var(--surface-2);white-space:nowrap;">Logos alternos</summary>
    <div style="padding:14px;">
      <span style="display:block;font-size:11px;color:var(--muted);margin-bottom:10px;">Agrega aplicaciones de logo adicionales (Alt 1, Alt 2, …). Cada una queda disponible como opción en todos los selectores de logo (en gráficos, icono, avatar y en el press wall), junto a los logos horizontal y vertical, claro y oscuro.</span>
      <div class="logo-alts-rows" data-altprefix="${prefix}" style="display:flex;flex-wrap:wrap;gap:16px;">${rows}</div>
      <div style="margin-top:12px;"><button type="button" class="btn ghost sm" data-action="add-logo-alt" data-altprefix="${prefix}">+ Agregar logo alterno</button></div>
    </div>
  </details>`;
}
// Reconstruye las filas de logos alternos (reindexadas 0..n-1) tras agregar/quitar, y actualiza EN VIVO
// las opciones "Alt N" de todos los selectores de logo del modal, conservando la selección por índice.
function refreshLogoAltOptions(prefix){
  const host = document.querySelector('.logo-alts-rows[data-altprefix="'+prefix+'"]');
  if(!host) return;
  // 1) Lee los alternos actuales en orden del DOM (conservando lo ya cargado) y reindexa 0..n-1.
  //    Guarda el mapeo índice-viejo -> "aNuevo" para corregir las variantes elegidas que se hayan movido.
  const remap = {};
  const cur = [...host.querySelectorAll('.logo-alt-row')].map((row,i)=>{
    const oldIdx = row.getAttribute("data-alt-idx");
    const inp = document.getElementById("f-"+prefix+"-"+oldIdx+"-data");
    if(oldIdx!=null) remap["a"+oldIdx] = "a"+i;
    return { img:(inp&&inp.value)||"" };
  });
  host.innerHTML = cur.map((a,i)=>logoAltRowHTML(prefix, i, a)).join("");
  // 2) Actualiza los selectores de logo (data-logovar-sel = este prefijo): quita opciones "aN" viejas
  //    y agrega las de los alternos con imagen; reubica el valor elegido con el mapeo (si el alterno
  //    elegido se movió) o lo devuelve a la 1ª opción si desapareció. Las variantes base no cambian.
  const optLabel = i => "Alt " + (i+1);
  document.querySelectorAll('select[data-logovar-sel="'+prefix+'"]').forEach(sel=>{
    let prev = sel.value;
    // Reubica el alterno elegido con el mapeo; si el alterno fue eliminado (no está en el mapeo),
    // se marca como inexistente para que caiga a la 1ª opción base.
    if(/^a\d+$/.test(prev)) prev = remap[prev] || "\u0000removed";
    [...sel.querySelectorAll('option')].forEach(o=>{ if(/^a\d+$/.test(o.value)) o.remove(); });
    cur.forEach((a,i)=>{ if(a.img){ const o=document.createElement("option"); o.value="a"+i; o.textContent=optLabel(i); sel.appendChild(o); } });
    if([...sel.options].some(o=>o.value===prev)) sel.value=prev;
    else if(sel.options.length) sel.value=sel.options[0].value;
    sel.dispatchEvent(new Event("change",{bubbles:true}));
  });
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
  const colors = (ctx.colors || []).map(c=>c || "#0D0D0D");
  const logoSel = obj.socialAvatarLogo || (logoOptions[0] && logoOptions[0][0]) || "";
  const colorSel = (obj.socialAvatarColor!=null && obj.socialAvatarColor!=="") ? String(obj.socialAvatarColor) : "0";
  const manual = obj.socialAvatarManual ? "1" : "";
  // Contexto (logos + colores) para regenerar el avatar en el navegador, sin tocar el guardado.
  const ctxJson = JSON.stringify({ logos: ctx.logos || {}, colors, colorInputs: ctx.colorInputs || [], logoInputs: ctx.logoInputs || {}, fallbackLogoInputs: ctx.fallbackLogoInputs || {}, altPrefix: ctx.altPrefix || "" });
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
  // Tamaño del logo dentro del avatar (%): 100% = ocupa el primer margen (ancho o alto) del cuadrado.
  const avSizeVal = (obj.socialAvatarSize!=null && obj.socialAvatarSize!=="") ? Math.max(1,Math.min(100,parseInt(obj.socialAvatarSize)||75)) : 75;
  const avsizeField = `<label class="field" style="flex:1 1 130px;min-width:0;">Tamaño del logo (%)
      <input type="number" id="f-${key}-avsize" min="1" max="100" step="1" value="${avSizeVal}">
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
            <select id="f-${key}-avlogo"${ctx.altPrefix?` data-logovar-sel="${ctx.altPrefix}"`:''}>${logoOptions.map(([v,l])=>`<option value="${v}" ${v===logoSel?'selected':''}>${escapeHtml(l)}</option>`).join("")}</select>
          </label>
          <label class="field" style="flex:1 1 130px;min-width:0;">Color de fondo
            <select id="f-${key}-avcolor">${avcolorOptionsHTML}</select>
          </label>
          ${avsizeField}
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
    const inheritSrcAttr = ` data-inherit-src="${escapeHtml(opts.inheritSrc||"f-msoc-avatar-data")}"`;
    return `
  <div data-social-key="${key}"${covAttr} data-inherit-image="1"${inheritSrcAttr} style="grid-column:1/-1;display:flex;flex-direction:column;gap:10px;">
    <script type="application/json" id="f-${key}-avctx">${ctxJson}</script>
    <input type="hidden" id="f-${key}-avatar-manual" value="${manual}">
    <input type="hidden" id="f-${key}-avlogo" value="${escapeHtml(logoSel)}">
    <input type="hidden" id="f-${key}-avcolor" value="${escapeHtml(colorSel)}">
    <input type="hidden" id="f-${key}-avsize" value="${avSizeVal}">
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
      ${avsizeField}
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
  const i = parseInt(val); return (colors||[])[isNaN(i)?0:i] || "#0D0D0D";
}
// Compone un avatar cuadrado de 300×300: rellena el fondo con bgHex y dibuja el logo centrado,
// ajustado dentro de un cuadro de 250×250 (conservando su proporción). Devuelve un data URI PNG.
function composeSocialAvatar(logoSrc, bgHex, sizePct){
  return new Promise(resolve=>{
    const size=300; let pct=parseInt(sizePct); if(isNaN(pct)) pct=75; pct=Math.max(1,Math.min(100,pct));
    const box=Math.round(size*pct/100), pad=(size-box)/2;
    const c=document.createElement("canvas"); c.width=size; c.height=size;
    const ctx=c.getContext("2d");
    ctx.fillStyle = bgHex || "#0D0D0D"; ctx.fillRect(0,0,size,size);
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
  const logoSel = gId("avlogo"), colorSel = gId("avcolor"), sizeInp = gId("avsize");
  const setPreview = (src)=>{ if(preview){ if(src){ preview.src=src; preview.style.display="block"; } else { preview.removeAttribute("src"); preview.style.display="none"; } } };
  const clearBtn = wrap.querySelector('[data-action="clear-image"][data-target="f-'+key+'-avatar-data"]');

  // --- Perfiles POR COBERTURA (medios): la imagen se HEREDA del perfil por defecto ---
  if(wrap.getAttribute("data-inherit-image")==="1"){
    const defSrcId = wrap.getAttribute("data-inherit-src") || "f-msoc-avatar-data";
    const applyDefault = ()=>{
      if(manualFlag && manualFlag.value==="1") return; // respeta imagen propia subida
      const def = document.getElementById(defSrcId);
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
    ? colorInputIds.map((id,i)=>{ const e=document.getElementById(id); return (e && e.value) || (ctx.colors||[])[i] || "#0D0D0D"; })
    : (ctx.colors||[]);
  // Logos EN VIVO: si el ctx trae los ids de los inputs ocultos de logo (logoInputs), se leen de ahí en
  // cada regeneración, para que el avatar refleje al instante un logo recién SUBIDO en el editor.
  const logoInputMap = (ctx.logoInputs && typeof ctx.logoInputs==="object") ? ctx.logoInputs : null;
  const fbLogoMap = (ctx.fallbackLogoInputs && typeof ctx.fallbackLogoInputs==="object") ? ctx.fallbackLogoInputs : null;
  const liveLogo = (val)=>{
    if(logoInputMap && logoInputMap[val]){ const e=document.getElementById(logoInputMap[val]); if(e && e.value) return e.value; }
    // Respaldo en vivo (p. ej. el escudo de la selección para la federación) cuando el propio está vacío.
    if(fbLogoMap && fbLogoMap[val]){ const e=document.getElementById(fbLogoMap[val]); if(e && e.value) return e.value; }
    // Logos alternos añadidos en vivo (aN): se leen del input oculto f-<altPrefix>-N-data.
    if(ctx.altPrefix && /^a\d+$/.test(val)){ const e=document.getElementById("f-"+ctx.altPrefix+"-"+val.slice(1)+"-data"); if(e && e.value) return e.value; }
    return (ctx.logos||{})[val] || "";
  };
  const regen = ()=>{
    if(manualFlag && manualFlag.value==="1"){ if(key==="msoc" && typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar(); return; } // no pisar la imagen subida a mano
    const logo = liveLogo(logoSel ? logoSel.value : "");
    const bg = resolveSocialBg(colorSel ? colorSel.value : "0", liveColors());
    const sz = sizeInp ? sizeInp.value : 75;
    composeSocialAvatar(logo, bg, sz).then(src=>{
      if(manualFlag && manualFlag.value==="1") return;
      if(hidden) hidden.value = src; setPreview(src);
      // Perfil por defecto de un medio: propaga su imagen a los perfiles por cobertura.
      if(key==="msoc" && typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar();
    });
  };
  if(logoSel) logoSel.addEventListener("change", regen);
  if(colorSel) colorSel.addEventListener("change", regen);
  if(sizeInp){ sizeInp.addEventListener("input", regen); sizeInp.addEventListener("change", regen); }
  // Regenerar EN VIVO cuando el usuario cambia los colores del club/selección/medio.
  if(colorInputIds){ colorInputIds.forEach(id=>{ const e=document.getElementById(id); if(e) e.addEventListener("input", regen); }); }
  // Regenerar EN VIVO cuando se sube/cambia un logo (los inputs ocultos emiten 'input' al subir imagen).
  if(logoInputMap){ Object.keys(logoInputMap).forEach(k=>{ const e=document.getElementById(logoInputMap[k]); if(e) e.addEventListener("input", regen); }); }
  if(fbLogoMap){ Object.keys(fbLogoMap).forEach(k=>{ const e=document.getElementById(fbLogoMap[k]); if(e) e.addEventListener("input", regen); }); }
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
