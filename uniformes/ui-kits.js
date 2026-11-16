/* =========================================================
   COPA MANAGER 2026 — uniformes/ui-kits.js
   Presentación de uniformes: builders HTML de tarjetas/secciones, generación
   de imágenes de kits/prendas/dorsales a canvas (build*DataURL,
   drawBackNumberOnCanvas, shirt*ImgFor*), previews, y los modales de gestión
   y edición de uniformes con sus helpers de lectura/escritura/sincronización
   de formulario. Extracción mecánica: texto y orden idénticos al original (7
   runs). Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js,
   core/utilidades.js, uniformes/motor-grafico.js (loadImg, recolorToCanvas,
   drawTextWithStyle, applyTextCase), uniformes/modelo-kits.js (garmentConfig,
   getNumberFont, getBackBaseForShirtNumber, defaultCombo, ensureTeamKits,
   kitOrdinalLabel…), app/modales.js (openModal) y funciones/jugadores.js
   (getPlayerWithTeam), y ANTES del <script> inline. Usa en tiempo de ejecución
   DB, getTeam (inline) y el estado de sesión (clipboard, drag, expandidos) del
   inline. modales.openModal invoca renderKitPreviews (ref. mutua, render-time).
   Los casos kit de handleAction y los addEventListener globales quedan en el inline.
   ========================================================= */

function garmentSectionHTML(type, combo){
  const cfg = garmentConfig(type);
  const bases = DB[cfg.basesKey];
  const baseNum = combo[type+"BaseNumber"];
  const c1 = combo[type+"Color1"], c2 = combo[type+"Color2"], c3 = combo[type+"Color3"];
  const layers = combo[type+"Layers"] || [];
  return `
  <div class="garment-edit-section" style="margin-bottom:14px;padding-bottom:14px;border-bottom:1px solid var(--line);">
    <div style="font-weight:700;font-size:12.5px;margin-bottom:8px;">${cfg.label}</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:10px;">
      <div class="combo-preview-${type}-large" style="width:150px;height:150px;flex-shrink:0;background:var(--surface-2);border-radius:10px;"></div>
      <div style="flex:1;min-width:200px;display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end;">
        <label class="field" style="flex:1;min-width:110px;">Base
          <select class="combo-control combo-base-${type}">
            ${bases.map(b=>`<option value="${b.number}" ${b.number===baseNum?"selected":""}>${garmentName(type,b.number)}</option>`).join("")}
          </select>
        </label>
        ${colorPickerHTML(`combo-control combo-color1-${type} color-square-sm`, c1)}
        ${colorPickerHTML(`combo-control combo-color2-${type} color-square-sm`, c2)}
        ${colorPickerHTML(`combo-control combo-color3-${type} color-square-sm`, c3)}
      </div>
    </div>
    <div class="combo-layer-rows-${type}">
      ${layers.map(l=>layerRowHTML(l)).join("")}
    </div>
    <button type="button" class="btn ghost sm" data-action="add-combo-layer-row" data-garment="${type}">+ Agregar capa</button>
  </div>`;
}
function comboBlockHTML(combo, index){
  combo = combo || defaultCombo();
  return `
  <div class="combo-block" draggable="true" style="border:1px solid var(--line);border-radius:10px;margin-bottom:10px;overflow:hidden;cursor:grab;">
    <div class="combo-block-header" data-action="toggle-combo-block" style="cursor:pointer;display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--surface-2);">
      <span style="color:var(--muted);font-size:13px;">⠿</span>
      <div style="display:flex;flex-direction:column;gap:2px;">
        <button type="button" class="btn ghost sm" data-action="move-combo-row" data-dir="up" style="padding:2px 7px;line-height:1;">↑</button>
        <button type="button" class="btn ghost sm" data-action="move-combo-row" data-dir="down" style="padding:2px 7px;line-height:1;">↓</button>
      </div>
      <div class="combo-preview-shirt" title="Playera de este uniforme (se edita arriba, igual para todas las combinaciones)" style="width:46px;height:46px;background:var(--surface);border-radius:6px;flex-shrink:0;opacity:0.92;"></div>
      <div class="combo-preview-shorts" style="width:46px;height:36px;background:var(--surface);border-radius:6px;flex-shrink:0;"></div>
      <div class="combo-preview-socks" style="width:46px;height:36px;background:var(--surface);border-radius:6px;flex-shrink:0;"></div>
      <div class="combo-label-text" style="flex:1;font-weight:700;font-size:13px;">Combo ${index+1}</div>
      <button type="button" class="btn danger sm" data-action="remove-combo-row">✕</button>
      <span class="mono combo-toggle-arrow" style="color:var(--muted);font-size:14px;">▸</span>
    </div>
    <div class="combo-block-body" style="padding:12px;display:none;">
      <div style="display:flex;gap:8px;margin-bottom:14px;">
        <button type="button" class="btn ghost sm" data-action="copy-combo">Copiar esta combinación</button>
        <button type="button" class="btn ghost sm" data-action="paste-combo" ${clipboardCombo?'':'disabled'}>Pegar combinación copiada</button>
      </div>
      ${garmentSectionHTML('shorts', combo)}
      ${garmentSectionHTML('socks', combo)}
    </div>
  </div>`;
}

// Número de muestra en las vistas previas: 1 en los uniformes de portero, 10 en los demás.
function kitDefaultPreviewNumber(kit){ return (kit && kit.category==="portero") ? "1" : "10"; }
async function drawBackNumberOnCanvas(ctx, size, kit){
  const numberEntry = getNumberFont(kit.backNumberFontId);
  if(!numberEntry) return;
  const nameEntry = getNumberFont(kit.backNameFontId) || numberEntry;
  const numberFamily = await ensureNumberFontLoaded(numberEntry);
  const nameFamily = await ensureNumberFontLoaded(nameEntry);
  const outlineScale = size/300;
  const previewNumberText = (kit.previewNumber!=null && kit.previewNumber!=="") ? String(kit.previewNumber) : kitDefaultPreviewNumber(kit);
  const previewNameText = applyTextCase((kit.previewName!=null && kit.previewName!=="") ? kit.previewName : "APELLIDO", kit.backNameTextCase);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // El dorso arbitral no lleva número: solo el apellido, en una franja mucho más chica y más alta.
  // El nombre puede ocultarse por completo con el checkbox "Mostrar nombre" del editor (backNameHidden).
  const nameBox = (kit.category==="arbitro") ? REFEREE_BACK_TEXT_BOXES.name : BACK_TEXT_BOXES.name;
  if(!kit.backNameHidden){
    drawTextWithStyle(ctx, nameBox, previewNameText, nameFamily, kit.backNameColor, kit.backNameOutline, kit.backNameOutlineColor, kit.backNameOutlineWidth, kit.backNameSizePct, kit.backNameLetterSpacing, kit.backNameOffsetX, kit.backNameOffsetY, kit.backNameArc, size, outlineScale, undefined, kit.backNameCondense, true);
  }
  if(kit.category!=="arbitro"){
    drawTextWithStyle(ctx, BACK_TEXT_BOXES.number, previewNumberText, numberFamily, kit.backNumberColor, kit.backNumberOutline, kit.backNumberOutlineColor, kit.backNumberOutlineWidth, kit.backNumberSizePct, kit.backNumberLetterSpacing, kit.backNumberOffsetX, kit.backNumberOffsetY, 1, size, outlineScale);
  }
  ctx.restore();
}
// Genera el cuadro de número+nombre que se muestra en el perfil del jugador (entre sus datos y el
// rating). Toma el Back que corresponde al Shirt del uniforme de Local de su selección (mismo
// número — o Back1 si no hay uno propio), lo recolorea con los colores de ese mismo uniforme, y
// dibuja encima el dorsal y el "nombre en camiseta (selección)" del jugador, usando exactamente la
// misma tipografía/color/contorno/tamaño/posición que ese uniforme tiene configurados para su dorso.
// Caché global compartido de dorsos de playera: el simulador y el onboarding reutilizan el
// mismo render (misma clave = jugador + equipo + dorsal + colores del kit + tamaño), así no se
// vuelve a componer el canvas cada vez. Vive en window para que TODOS los módulos lo compartan.
var _playerBadgeCache = (typeof window!=="undefined")
  ? (window.__playerBadgeCache || (window.__playerBadgeCache = {}))
  : {};
// Capas adicionales del cuadro de número+nombre (igual que las de la playera y el dorso): se dibujan
// sobre el fondo recoloreado y debajo del número y el nombre.
// Cada capa se escala (tamaño %) y se mueve (X/Y en % del cuadro) desde el centro, y TODAS se recortan
// con la silueta del cuadro (mask = el fondo ya dibujado), así no salen de las esquinas redondeadas.
async function drawBadgeLayers(ctx, kit, size, mask){
  const list=((kit && kit.badgeLayers) || []).filter(l=>l && l.img); if(!list.length) return;
  const off=document.createElement("canvas"); off.width=size; off.height=size;
  const oc=off.getContext("2d"); oc.imageSmoothingEnabled=true; oc.imageSmoothingQuality="high";
  for(const layer of list){
    const src = layer.recolorable
      ? await recolorToCanvas(layer.img, ...layerRecolorArgs(layer, kit.color1, kit.color2, kit.color3), size, size)
      : await loadImg(layer.img);
    const sc=(layer.scale!=null ? +layer.scale : 100)/100;
    const w=size*sc, h=size*sc;
    const cx=size/2 + (+layer.x||0)/100*size, cy=size/2 + (+layer.y||0)/100*size;
    oc.drawImage(src, cx-w/2, cy-h/2, w, h);
  }
  if(mask){ oc.globalCompositeOperation="destination-in"; oc.drawImage(mask, 0, 0, size, size); oc.globalCompositeOperation="source-over"; }
  ctx.drawImage(off, 0, 0);
}
function badgeLayersKey(kit){ return ((kit && kit.badgeLayers) || []).map(l=>[(l.img||"").length, (l.img||"").slice(-24), l.recolorable?1:0, l.colors?[l.colors.r,l.colors.g,l.colors.b].join(","):"", l.scale, l.x, l.y].join(":")).join(";"); }
async function buildPlayerNumberBadgeDataURL(player, team, size){
  size = size || 200;
  if(!team || !DB.backBases.length) return null;
  const _ck = [player && player.id, team && team.id, size, player && player.number,
    team && team.color1, team && team.color2, team && team.color3, player && player.pos,
    // El nombre en la camiseta también forma parte de la clave: al cambiarlo, el dorso se vuelve a dibujar.
    (typeof effectiveShirtName==="function" && player) ? effectiveShirtName(player,"team") : (player && player.shirtNameTeam)].join("|");
  // Los porteros usan los colores/configuración del uniforme de Portero Local, no del de Local.
  const refKit = player.pos==="GK"
    ? (team.kits.find(k=>k.category==="portero" && k.label==="Portero Local") || team.kits.find(k=>k.category==="portero"))
    : team.kits.find(k=>k.category==="jugador" && k.label==="Local") || team.kits.find(k=>k.category==="jugador");
  if(!refKit) return null;
  const _ckL = _ck + "|" + badgeLayersKey(refKit);   // las capas del cuadro también forman parte de la clave
  if(_playerBadgeCache[_ckL]) return _playerBadgeCache[_ckL];
  const backBase = getBackBaseForShirtNumber(refKit.baseNumber);
  if(!backBase) return null;
  const numberEntry = getNumberFont(refKit.badgeNumberFontId!=null ? refKit.badgeNumberFontId : refKit.backNumberFontId);
  if(!numberEntry) return null;
  const nameEntry = getNumberFont(refKit.badgeNameFontId!=null ? refKit.badgeNameFontId : refKit.backNameFontId) || numberEntry;
  const numberFamily = await ensureNumberFontLoaded(numberEntry);
  const nameFamily = await ensureNumberFontLoaded(nameEntry);
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const bg = await recolorToCanvas(backBase.baseImg, refKit.color1, refKit.color2, refKit.color3, size, size);
  ctx.drawImage(bg, 0, 0);
  await drawBadgeLayers(ctx, refKit, size, bg);
  const outlineScale = size/300;
  // _noName: dorsal LIBRE — se reserva el espacio del nombre (con "APELLIDO" fantasma) para que la
  // ALTURA del número no cambie, pero NO se dibuja ningún apellido hasta que se asigne un jugador.
  const _hideName = !!player._noName;
  const rawNameText = _hideName ? "APELLIDO" : (effectiveShirtName(player, "team") || "APELLIDO");
  const nameText = applyTextCase(rawNameText, refKit.badgeNameTextCase!=null ? refKit.badgeNameTextCase : refKit.backNameTextCase);
  const numberText = player.number!=null ? String(player.number) : "";
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // Reencuadre de grupo: el nombre y el número se tratan como un CONJUNTO que se centra
  // verticalmente en el cuadro conservando la distancia configurada entre ellos. Si la posición
  // heredada del dorso (pensada para la silueta de la playera, no para un cuadrado) sacara al
  // grupo del cuadro, el conjunto entero se reduce por igual hasta caber — nunca se recorta ni se
  // rompe la separación. El nombre se mide con la muestra fija de mayúsculas y el número con la
  // altura de dígito (constante), así el reencuadre es idéntico para TODOS los jugadores de la
  // selección y sus nombres conservan el mismo tamaño entre sí. (Si el jugador no tiene dorsal se
  // mide con un dígito fantasma, para que su nombre quede donde el de todos los demás.)
  const nameInk = badgeTextVerticalInk(ctx, BACK_SQUARE_TEXT_BOXES.name, nameText, nameFamily,
    refKit.badgeNameSizePct!=null?refKit.badgeNameSizePct:refKit.backNameSizePct,
    refKit.badgeNameOffsetY!=null?refKit.badgeNameOffsetY:refKit.backNameOffsetY,
    refKit.badgeNameArc!=null?refKit.badgeNameArc:refKit.backNameArc,
    size, outlineScale,
    refKit.badgeNameOutline!=null?refKit.badgeNameOutline:refKit.backNameOutline,
    refKit.badgeNameOutlineWidth!=null?refKit.badgeNameOutlineWidth:refKit.backNameOutlineWidth,
    refKit.badgeNameCondense!=null?refKit.badgeNameCondense:refKit.backNameCondense, true);
  const numInk = badgeTextVerticalInk(ctx, BACK_SQUARE_TEXT_BOXES.number, numberText||"0", numberFamily,
    refKit.badgeNumberSizePct!=null?refKit.badgeNumberSizePct:refKit.backNumberSizePct,
    refKit.badgeNumberOffsetY!=null?refKit.badgeNumberOffsetY:refKit.backNumberOffsetY,
    1, size, outlineScale,
    refKit.badgeNumberOutline!=null?refKit.badgeNumberOutline:refKit.backNumberOutline,
    refKit.badgeNumberOutlineWidth!=null?refKit.badgeNumberOutlineWidth:refKit.backNumberOutlineWidth,
    false, false);
  const grp = badgeGroupTransform([nameInk, numInk], size);
  grp.apply(ctx);
  const badgeContainBounds = grp.bounds;
  if(!_hideName) drawTextWithStyle(ctx, BACK_SQUARE_TEXT_BOXES.name, nameText, nameFamily,
    refKit.badgeNameColor!=null?refKit.badgeNameColor:refKit.backNameColor,
    refKit.badgeNameOutline!=null?refKit.badgeNameOutline:refKit.backNameOutline,
    refKit.badgeNameOutlineColor!=null?refKit.badgeNameOutlineColor:refKit.backNameOutlineColor,
    refKit.badgeNameOutlineWidth!=null?refKit.badgeNameOutlineWidth:refKit.backNameOutlineWidth,
    refKit.badgeNameSizePct!=null?refKit.badgeNameSizePct:refKit.backNameSizePct,
    refKit.badgeNameLetterSpacing!=null?refKit.badgeNameLetterSpacing:refKit.backNameLetterSpacing,
    refKit.badgeNameOffsetX!=null?refKit.badgeNameOffsetX:refKit.backNameOffsetX,
    refKit.badgeNameOffsetY!=null?refKit.badgeNameOffsetY:refKit.backNameOffsetY,
    refKit.badgeNameArc!=null?refKit.badgeNameArc:refKit.backNameArc,
    size, outlineScale, badgeContainBounds, refKit.badgeNameCondense!=null?refKit.badgeNameCondense:refKit.backNameCondense, true);
  drawTextWithStyle(ctx, BACK_SQUARE_TEXT_BOXES.number, numberText, numberFamily,
    refKit.badgeNumberColor!=null?refKit.badgeNumberColor:refKit.backNumberColor,
    refKit.badgeNumberOutline!=null?refKit.badgeNumberOutline:refKit.backNumberOutline,
    refKit.badgeNumberOutlineColor!=null?refKit.badgeNumberOutlineColor:refKit.backNumberOutlineColor,
    refKit.badgeNumberOutlineWidth!=null?refKit.badgeNumberOutlineWidth:refKit.backNumberOutlineWidth,
    refKit.badgeNumberSizePct!=null?refKit.badgeNumberSizePct:refKit.backNumberSizePct,
    refKit.badgeNumberLetterSpacing!=null?refKit.badgeNumberLetterSpacing:refKit.backNumberLetterSpacing,
    refKit.badgeNumberOffsetX!=null?refKit.badgeNumberOffsetX:refKit.backNumberOffsetX,
    refKit.badgeNumberOffsetY!=null?refKit.badgeNumberOffsetY:refKit.backNumberOffsetY,
    1, size, outlineScale, badgeContainBounds);
  ctx.restore();
  const _url = canvas.toDataURL("image/png");
  _playerBadgeCache[_ckL] = _url;
  return _url;
}
// Genera la vista previa en vivo del cuadro de número+nombre dentro del editor de uniforme — usa
// la configuración del badge tal como está en el formulario (tempKit), con el número/nombre de
// prueba que se haya puesto (por default "10" y "APELLIDO", igual que en la playera).
async function buildKitBadgePreviewDataURL(kit, size){
  size = size || 200;
  if(!DB.backBases.length) return null;
  const backBase = getBackBaseForShirtNumber(kit.baseNumber);
  if(!backBase) return null;
  const numberEntry = getNumberFont(kit.badgeNumberFontId);
  if(!numberEntry) return null;
  const nameEntry = getNumberFont(kit.badgeNameFontId) || numberEntry;
  const numberFamily = await ensureNumberFontLoaded(numberEntry);
  const nameFamily = await ensureNumberFontLoaded(nameEntry);
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const bg = await recolorToCanvas(backBase.baseImg, kit.color1, kit.color2, kit.color3, size, size);
  ctx.drawImage(bg, 0, 0);
  await drawBadgeLayers(ctx, kit, size, bg);
  const outlineScale = size/300;
  const numberText = (kit.badgePreviewNumber!=null && kit.badgePreviewNumber!=="") ? String(kit.badgePreviewNumber) : kitDefaultPreviewNumber(kit);
  const rawNameText = (kit.badgePreviewName!=null && kit.badgePreviewName!=="") ? kit.badgePreviewName : "APELLIDO";
  const nameText = applyTextCase(rawNameText, kit.badgeNameTextCase);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  // Mismo reencuadre de grupo que en el cuadro real del perfil del jugador, para que la vista
  // previa del editor muestre exactamente lo que se verá: conjunto nombre+número centrado
  // verticalmente, distancia intacta, y reducción uniforme solo si la configuración lo saca del cuadro.
  const nameInkP = badgeTextVerticalInk(ctx, BACK_SQUARE_TEXT_BOXES.name, nameText, nameFamily,
    kit.badgeNameSizePct, kit.badgeNameOffsetY, kit.badgeNameArc, size, outlineScale,
    kit.badgeNameOutline, kit.badgeNameOutlineWidth,
    kit.badgeNameCondense!=null?kit.badgeNameCondense:kit.backNameCondense, true,
    kit.badgeNameLetterSpacing);
  const numInkP = badgeTextVerticalInk(ctx, BACK_SQUARE_TEXT_BOXES.number, numberText||"0", numberFamily,
    kit.badgeNumberSizePct, kit.badgeNumberOffsetY, 1, size, outlineScale,
    kit.badgeNumberOutline, kit.badgeNumberOutlineWidth, false, false);
  const grpP = badgeGroupTransform([nameInkP, numInkP], size);
  grpP.apply(ctx);
  const badgePreviewContainBounds = grpP.bounds;
  drawTextWithStyle(ctx, BACK_SQUARE_TEXT_BOXES.name, nameText, nameFamily, kit.badgeNameColor, kit.badgeNameOutline, kit.badgeNameOutlineColor, kit.badgeNameOutlineWidth, kit.badgeNameSizePct, kit.badgeNameLetterSpacing, kit.badgeNameOffsetX, kit.badgeNameOffsetY, kit.badgeNameArc, size, outlineScale, badgePreviewContainBounds, kit.badgeNameCondense!=null?kit.badgeNameCondense:kit.backNameCondense, true);
  drawTextWithStyle(ctx, BACK_SQUARE_TEXT_BOXES.number, numberText, numberFamily, kit.badgeNumberColor, kit.badgeNumberOutline, kit.badgeNumberOutlineColor, kit.badgeNumberOutlineWidth, kit.badgeNumberSizePct, kit.badgeNumberLetterSpacing, kit.badgeNumberOffsetX, kit.badgeNumberOffsetY, 1, size, outlineScale, badgePreviewContainBounds);
  ctx.restore();
  return canvas.toDataURL("image/png");
}
// Genera una miniatura de muestra (dígitos) para previsualizar una tipografía en el catálogo.
async function buildNumberFontPreviewDataURL(entry, size){
  size = size || 140;
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  const family = await ensureNumberFontLoaded(entry);
  ctx.fillStyle = "#EDEFF5";
  ctx.font = `${Math.round(size*0.5)}px "${family}"`;
  enableFontKerning(ctx);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("10", size/2, size/2+size*0.04);
  return canvas.toDataURL("image/png");
}

function kitCardHTML(t,k){
  const jugadorCount = t.kits.filter(x=>x.category==="jugador").length;
  const porteroCount = t.kits.filter(x=>x.category==="portero").length;
  const canDelete = k.category==="arbitro" ? true : (k.category==="jugador" ? jugadorCount>2 : porteroCount>1);
  return `
  <div class="card kit-drag-card" draggable="true" data-team="${t.id}" data-kit-id="${k.id}" data-category="${k.category}" style="text-align:center;position:relative;">
    <div class="kit-drag-handle" title="Arrastra para reordenar" style="position:absolute;top:6px;left:8px;color:var(--muted);cursor:grab;font-size:13px;">⠿</div>
    <div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px;">
      <div class="kit-render" data-pending data-team-id="${t.id}" data-kit-id="${k.id}" data-action="edit-kit" data-team="${t.id}" data-id="${k.id}" data-from-manage="1" style="width:96px;height:96px;background:var(--surface-2);border-radius:8px;flex-shrink:0;cursor:pointer;" title="Editar este uniforme"></div>
      <div style="display:flex;flex-direction:column;gap:6px;">
        <div class="garment-render" data-pending data-team-id="${t.id}" data-kit-id="${k.id}" data-garment="shorts" data-combo-index="0" data-action="edit-kit" data-team="${t.id}" data-id="${k.id}" data-from-manage="1" style="width:62px;height:46px;background:var(--surface-2);border-radius:8px;cursor:pointer;" title="Editar este uniforme"></div>
        <div class="garment-render" data-pending data-team-id="${t.id}" data-kit-id="${k.id}" data-garment="socks" data-combo-index="0" data-action="edit-kit" data-team="${t.id}" data-id="${k.id}" data-from-manage="1" style="width:62px;height:46px;background:var(--surface-2);border-radius:8px;cursor:pointer;" title="Editar este uniforme"></div>
      </div>
    </div>
    <div style="font-weight:700;font-size:13px;">${k.label}</div>
    ${(k.category==="portero" && k.linkedJugadorKitIds && k.linkedJugadorKitIds.length) ? `
      <div style="font-size:10.5px;color:var(--muted);margin-top:2px;">Solo con: ${k.linkedJugadorKitIds.map(id=>{ const jk=t.kits.find(x=>x.id===id); return jk?jk.label:null; }).filter(Boolean).join(", ")}</div>
    ` : ""}
    ${k.ownDate ? `<div style="font-size:10px;color:var(--gold,#eeca5c);margin-top:3px;" title="Se presenta en fecha propia">Fecha propia: ${escapeHtml(kitEraLabel(k.dateStart)||'—')}</div>`:""}
    <div style="display:flex;gap:6px;justify-content:center;margin-top:8px;flex-wrap:wrap;">
      <button class="btn ghost sm" data-action="edit-kit" data-team="${t.id}" data-id="${k.id}" data-from-manage="1">Editar</button>
      <button class="btn ghost sm" data-action="copy-kit" data-team="${t.id}" data-id="${k.id}" title="Copiar este uniforme completo">Copiar</button>
      <button class="btn ghost sm" data-action="paste-kit" data-team="${t.id}" data-id="${k.id}" title="Pegar el uniforme copiado aquí" ${clipboardKit?'':'disabled'}>Pegar</button>
      ${canDelete?`<button class="btn danger sm" data-action="delete-kit" data-team="${t.id}" data-id="${k.id}">✕</button>`:''}
    </div>
  </div>`;
}
function garmentBaseCardHTML(type, b){
  const cfg = garmentConfig(type);
  if(type==="shirt"){
    const backSrc = shirtBackImgFor(b.number);
    const gkFront = b.gkImg || (DB.kitBases.find(x=>x.number===1)||{}).gkImg || null;
    const gkBack = b.gkBackImg || (DB.kitBases.find(x=>x.number===1)||{}).gkBackImg || null;
    return `
    <div class="card" style="text-align:center;">
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:700;margin-bottom:4px;">Jugador</div>
      <div style="display:flex;gap:6px;justify-content:center;margin-bottom:8px;">
        <div class="kit-thumb" data-action="view-garment-base" data-type="shirt" data-id="${b.id}" style="position:relative;width:64px;height:64px;background:var(--surface-2);border-radius:8px;overflow:hidden;cursor:pointer;">
          <img src="${b.baseImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
          <img src="${DB.kitTexture}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
        </div>
        <div style="position:relative;width:64px;height:64px;background:var(--surface-2);border-radius:8px;overflow:hidden;" title="${b.backImg?'':'Usando el dorso de shirt1 (no se subió uno propio)'}">
          ${backSrc?`<img src="${backSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:''}
          ${DB.kitTextureBack?`<img src="${DB.kitTextureBack}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:''}
        </div>
      </div>
      <div style="font-weight:700;font-size:13px;margin-bottom:2px;font-family:'JetBrains Mono',monospace;">${GARMENT_DISPLAY_PREFIX[type] || type}${b.number}</div>
      <input type="text" class="garmentbase-label-input" data-type="shirt" data-id="${b.id}" value="${(b.label||'').replace(/"/g,'&quot;')}" placeholder="Nombre (opcional)" style="width:100%;font-size:11px;text-align:center;margin-bottom:6px;background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:3px 4px;color:var(--text);">
      ${!b.backImg?`<div style="font-size:9.5px;color:var(--muted);margin-bottom:6px;">dorso = shirt1</div>`:``}
      <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;margin-bottom:10px;">
        <label class="btn ghost sm" style="cursor:pointer;margin:0;">
          Reemplazar frente
          <input type="file" accept="image/png" data-replace-garmentbase data-type="shirt" data-side="front" data-id="${b.id}" style="display:none;">
        </label>
        <label class="btn ghost sm" style="cursor:pointer;margin:0;">
          Reemplazar dorso
          <input type="file" accept="image/png" data-replace-garmentbase data-type="shirt" data-side="back" data-id="${b.id}" style="display:none;">
        </label>
      </div>
      <div style="border-top:1px solid var(--line);padding-top:8px;">
        <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:700;margin-bottom:4px;">Portero</div>
        <div style="display:flex;gap:6px;justify-content:center;margin-bottom:6px;">
          <div style="position:relative;width:64px;height:64px;background:var(--surface-2);border-radius:8px;overflow:hidden;" title="${b.gkImg?'Frente de portero propio':'Usando el frente de portero de shirt1'}">
            ${gkFront?`<img src="${gkFront}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:9px;color:var(--muted);">sin GK</div>`}
            ${gkFront&&DB.gkTexture?`<img src="${DB.gkTexture}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:''}
          </div>
          <div style="position:relative;width:64px;height:64px;background:var(--surface-2);border-radius:8px;overflow:hidden;" title="${b.gkBackImg?'Dorso de portero propio':'Usando el dorso de portero de shirt1'}">
            ${gkBack?`<img src="${gkBack}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:9px;color:var(--muted);">sin GK</div>`}
            ${gkBack&&DB.gkTextureBack?`<img src="${DB.gkTextureBack}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:''}
          </div>
        </div>
        ${!b.gkImg?`<div style="font-size:9.5px;color:var(--muted);margin-bottom:6px;">GK = ${b.number===1?'sin versión de portero':'shirt1'}</div>`:``}
        <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
          <label class="btn ghost sm" style="cursor:pointer;margin:0;">
            Frente portero
            <input type="file" accept="image/png" data-replace-garmentbase data-type="shirt" data-side="gkfront" data-id="${b.id}" style="display:none;">
          </label>
          <label class="btn ghost sm" style="cursor:pointer;margin:0;">
            Dorso portero
            <input type="file" accept="image/png" data-replace-garmentbase data-type="shirt" data-side="gkback" data-id="${b.id}" style="display:none;">
          </label>
        </div>
      </div>
      <div style="margin-top:10px;">
        <button class="btn danger sm" data-action="delete-garment-base" data-type="shirt" data-id="${b.id}">Eliminar</button>
      </div>
    </div>`;
  }
  return `
  <div class="card" style="text-align:center;">
    <div class="kit-thumb" data-action="view-garment-base" data-type="${type}" data-id="${b.id}" style="position:relative;width:72px;height:72px;margin:0 auto 8px;background:var(--surface-2);border-radius:8px;overflow:hidden;cursor:pointer;">
      <img src="${b.baseImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
      <img src="${DB[cfg.textureKey]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
    </div>
    <div style="font-weight:700;font-size:13px;margin-bottom:2px;font-family:'JetBrains Mono',monospace;">${GARMENT_DISPLAY_PREFIX[type] || type}${b.number}</div>
    <input type="text" class="garmentbase-label-input" data-type="${type}" data-id="${b.id}" value="${(b.label||'').replace(/"/g,'&quot;')}" placeholder="Nombre (opcional)" style="width:100%;font-size:11px;text-align:center;margin-bottom:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:3px 4px;color:var(--text);">
    <div style="display:flex;gap:6px;justify-content:center;">
      <label class="btn ghost sm" style="cursor:pointer;margin:0;">
        Reemplazar
        <input type="file" accept="image/png" data-replace-garmentbase data-type="${type}" data-id="${b.id}" style="display:none;">
      </label>
      <button class="btn danger sm" data-action="delete-garment-base" data-type="${type}" data-id="${b.id}">Eliminar</button>
    </div>
  </div>`;
}
// Tarjeta fija "Template" al inicio de cada rubro: contiene los OUTLINES (contornos) que se dibujan
// encima de todas las bases recoloreables. No se puede eliminar ni reordenar. Para Camisetas hay 4
// (frente/dorso de jugador y frente/dorso de portero); para Shorts y Calcetas hay 1 (su contorno).
function outlineThumb(src, label, type, slot){
  return `
    <div style="text-align:center;">
      <div style="position:relative;width:64px;height:64px;background:var(--surface-2);border-radius:8px;overflow:hidden;margin:0 auto 4px;">
        ${src?`<img src="${src}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:9px;color:var(--muted);">—</div>`}
      </div>
      <div style="font-size:10px;color:var(--muted);margin-bottom:4px;">${label}</div>
      <label class="btn ghost sm" style="cursor:pointer;margin:0;font-size:10px;">
        Reemplazar
        <input type="file" accept="image/png" data-replace-outline data-type="${type}" data-slot="${slot}" style="display:none;">
      </label>
    </div>`;
}
function garmentTemplateCardHTML(type){
  let thumbs = "";
  if(type==="shirt"){
    thumbs = `
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:700;margin:0 0 6px;">Jugador</div>
      <div style="display:flex;gap:10px;justify-content:center;margin-bottom:10px;">
        ${outlineThumb(DB.kitTexture, "Frente", "shirt", "front")}
        ${outlineThumb(DB.kitTextureBack, "Dorso", "shirt", "back")}
      </div>
      <div style="font-size:10px;color:var(--muted);text-transform:uppercase;letter-spacing:.04em;font-weight:700;margin:0 0 6px;border-top:1px solid var(--line);padding-top:8px;">Portero</div>
      <div style="display:flex;gap:10px;justify-content:center;">
        ${outlineThumb(DB.gkTexture, "Frente", "shirt", "gkfront")}
        ${outlineThumb(DB.gkTextureBack, "Dorso", "shirt", "gkback")}
      </div>`;
  } else {
    const cfg = garmentConfig(type);
    thumbs = `
      <div style="display:flex;gap:10px;justify-content:center;">
        ${outlineThumb(DB[cfg.textureKey], "Contorno", type, "texture")}
      </div>`;
  }
  return `
  <div class="card" style="text-align:center;border:1px dashed var(--line);background:var(--surface-2);">
    <div style="font-weight:700;font-size:13px;margin-bottom:10px;font-family:'JetBrains Mono',monospace;">Template</div>
    ${thumbs}
  </div>`;
}
function renderGarmentSection(type){
  const cfg = garmentConfig(type);
  const bases = DB[cfg.basesKey];
  const expanded = !!garmentExpanded[type];
  return `
  <div class="card" data-action="toggle-garment" data-type="${type}" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;margin-bottom:${expanded?'10px':'8px'};">
    <span style="font-size:13px;font-weight:700;">${cfg.label} <span style="color:var(--muted);font-weight:500;">— ${bases.length} base(s)</span></span>
    <span class="mono" style="color:var(--muted);font-size:14px;">${expanded?"▾":"▸"}</span>
  </div>
  ${expanded ? `
  <div class="card" style="margin-bottom:10px;">
    ${type==="shirt" ? `<p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Sube siempre el frente; el dorso es opcional — si no lo subes, se usa el dorso de shirt1 hasta que cargues el propio.</p>` : ""}
    <div class="form-grid">
      ${imageUploadField(type==="shirt" ? "Frente (PNG recoloreable)" : "Base (PNG recoloreable)", "newgarmentbase-"+type, "", "Usa rojo ff0000, azul 0000ff y verde 00ff00 para las zonas recoloreables.", RECOLORABLE_BASE_MAX_DIM)}
      ${type==="shirt" ? imageUploadField("Dorso (opcional)", "newgarmentbaseback-"+type, "", "", RECOLORABLE_BASE_MAX_DIM) : ""}
    </div>
    <button class="btn gold sm" data-action="add-garment-base" data-type="${type}" style="margin-top:6px;">+ Agregar base</button>
  </div>
  <div class="grid cols-4" style="margin-bottom:10px;">
    ${garmentTemplateCardHTML(type)}
    ${bases.map(b=>garmentBaseCardHTML(type,b)).join("")}
  </div>
  ` : ""}
  `;
}
function numberFontCardHTML(f){
  const downloadName = (f.label ? `Font${f.number}_${f.label}` : `Font${f.number}`).replace(/[^a-z0-9_-]+/gi,"_") + "." + fontDataUrlExtension(f.fontData);
  return `
  <div class="card" style="text-align:center;">
    <div class="numberfont-render" data-pending data-id="${f.id}" style="width:72px;height:72px;margin:0 auto 8px;background:var(--surface-2);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;"></div>
    <div style="font-weight:700;font-size:13px;margin-bottom:2px;font-family:'JetBrains Mono',monospace;">Font${f.number}</div>
    <input type="text" class="numberfont-label-input" data-id="${f.id}" value="${(f.label||'').replace(/"/g,'&quot;')}" placeholder="Nombre (opcional)" style="width:100%;font-size:11px;text-align:center;margin-bottom:8px;background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:3px 4px;color:var(--text);">
    <div style="display:flex;gap:6px;justify-content:center;flex-wrap:wrap;">
      <label class="btn ghost sm" style="cursor:pointer;margin:0;">
        Reemplazar
        <input type="file" accept=".otf,.ttf,.woff,.woff2,font/otf,font/ttf,font/woff,font/woff2" data-replace-numberfont data-id="${f.id}" style="display:none;">
      </label>
      <a class="btn ghost sm" href="${f.fontData}" download="${downloadName}" style="text-decoration:none;display:inline-block;">Descargar</a>
      <button class="btn danger sm" data-action="delete-number-font" data-id="${f.id}">Eliminar</button>
    </div>
  </div>`;
}
function renderNumberFontsSection(){
  const fonts = DB.numberFonts;
  const expanded = !!numberFontsExpanded;
  return `
  <div class="card" data-action="toggle-numberfonts" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;margin-bottom:${expanded?'10px':'8px'};">
    <span style="font-size:13px;font-weight:700;">Tipografías de número <span style="color:var(--muted);font-weight:500;">— ${fonts.length} tipografía(s)</span></span>
    <span class="mono" style="color:var(--muted);font-size:14px;">${expanded?"▾":"▸"}</span>
  </div>
  ${expanded ? `
  <div class="card" style="margin-bottom:10px;">
    <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Se usan para el número del dorso en "Editar Uniforme". Sube archivos .otf, .ttf, .woff o .woff2.</p>
    <div class="form-grid">
      ${fontUploadField("Archivo de tipografía", "newnumberfont", "")}
    </div>
    <button class="btn gold sm" data-action="add-number-font" style="margin-top:6px;">+ Agregar tipografía</button>
  </div>
  <div class="grid cols-4" style="margin-bottom:10px;">
    ${fonts.map(f=>numberFontCardHTML(f)).join("") || `<div class="empty">Sin tipografías cargadas todavía</div>`}
  </div>
  ` : ""}
  `;
}
function backBaseCardHTML(b){
  return `
  <div class="card" style="text-align:center;">
    <div style="position:relative;width:72px;height:72px;margin:0 auto 8px;background:var(--surface-2);border-radius:8px;overflow:hidden;">
      <img src="${b.baseImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
    </div>
    <div style="font-weight:700;font-size:13px;margin-bottom:8px;font-family:'JetBrains Mono',monospace;">${backBaseDisplayLabel(b)}</div>
    <div style="display:flex;gap:6px;justify-content:center;">
      <label class="btn ghost sm" style="cursor:pointer;margin:0;">
        Reemplazar
        <input type="file" accept="image/png" data-replace-backbase data-id="${b.id}" style="display:none;">
      </label>
      <button class="btn danger sm" data-action="delete-back-base" data-id="${b.id}">Eliminar</button>
    </div>
  </div>`;
}
function renderBackBasesSection(){
  const bases = DB.backBases;
  const expanded = !!backBasesExpanded;
  const missingNumbers = DB.kitBases.map(s=>s.number).filter(n=>!bases.some(b=>b.number===n));
  const suggestedNumber = missingNumbers[0] || (bases.length ? Math.max(...bases.map(b=>b.number))+1 : 1);
  return `
  <div class="card" data-action="toggle-backbases" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;margin-bottom:${expanded?'10px':'8px'};">
    <span style="font-size:13px;font-weight:700;">Cuadros de número (Back) <span style="color:var(--muted);font-weight:500;">— ${bases.length} base(s)</span></span>
    <span class="mono" style="color:var(--muted);font-size:14px;">${expanded?"▾":"▸"}</span>
  </div>
  ${expanded ? `
  <div class="card" style="margin-bottom:10px;">
    <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Se usan para el cuadro de número+nombre en el perfil del jugador. Cada "BackN" corresponde al "ShirtN" del mismo número (mismos colores) — si un Shirt no tiene su Back propio, se usa Back1 como respaldo. El nombre opcional se hereda automáticamente del Shirt correspondiente, no hace falta repetirlo aquí.</p>
    <div class="form-grid">
      ${imageUploadField("Base (PNG recoloreable, cuadrada)", "newbackbase", "", "Usa rojo ff0000 para la zona recoloreable — igual que las playeras.", RECOLORABLE_BASE_MAX_DIM)}
      <label class="field">Número (debe coincidir con su Shirt)
        <input type="number" id="f-newbackbase-number" min="1" value="${suggestedNumber}">
      </label>
    </div>
    <button class="btn gold sm" data-action="add-back-base" style="margin-top:6px;">+ Agregar base</button>
  </div>
  <div class="grid cols-4" style="margin-bottom:10px;">
    ${bases.map(b=>backBaseCardHTML(b)).join("") || `<div class="empty">Sin bases cargadas todavía</div>`}
  </div>
  ` : ""}
  `;
}

// Sección pegable (como la de Press Wall) para editar los uniformes de árbitro de una entidad
// (torneo / federación / confederación). Replica el editor de la Copa del Mundo: muestra los kits
// y un botón "Editar uniformes" que abre el mismo administrador de uniformes.
//   wrapId  -> id de envoltorio (refKitsWrapId): __refkits__:comp|fed|conf:<id>
//   opts    -> {summary, hint, savedFirst, exists}
function refereeKitsDetailsHTML(wrapId, opts){
  opts = opts || {};
  const summary = opts.summary || "Uniformes de árbitro";
  const exists = opts.exists!==false && (typeof getTeam==="function");
  const t = exists ? getTeam(wrapId) : null;
  let inner;
  if(!t){
    inner = `<span style="display:block;font-size:11.5px;color:var(--muted);">${escapeHtml(opts.savedFirst||"Guarda primero para poder crear los uniformes de árbitro.")}</span>`;
  } else {
    const kits = (t.kits||[]).slice(0,10);
    inner = `
      <span style="display:block;font-size:11px;color:var(--muted);margin-bottom:12px;">${escapeHtml(opts.hint||"Uniformes que usan los árbitros. Se editan igual que los de la Copa del Mundo.")}</span>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:${kits.length?'12px':'0'};">
        <button type="button" class="btn gold sm" data-action="manage-kits" data-team="${escapeHtml(wrapId)}">Editar uniformes</button>
        <span style="font-size:12px;color:var(--muted);">${(t.kits||[]).length} uniforme${(t.kits||[]).length===1?'':'s'}</span>
      </div>
      ${kits.length ? `<div style="display:flex;gap:16px;flex-wrap:wrap;">
        ${kits.map(k=>`<div style="text-align:center;width:84px;">
          <div class="kit-render" data-pending data-team-id="${escapeHtml(wrapId)}" data-kit-id="${k.id}" data-action="edit-kit" data-team="${escapeHtml(wrapId)}" data-id="${k.id}" data-from-manage="0" style="width:84px;height:84px;background:var(--surface-2);border-radius:8px;cursor:pointer;" title="Editar este uniforme"></div>
          <div style="font-weight:700;font-size:12px;margin-top:6px;">${escapeHtml(k.label||"")}</div>
        </div>`).join("")}
      </div>` : `<div class="empty" style="margin:0;"><h3>Sin uniformes de árbitro</h3><p>Agrégalos con “Editar uniformes”.</p></div>`}`;
  }
  return `<details class="clpw-details" style="grid-column:1/-1;border:1px solid var(--line);border-radius:10px;padding:0;overflow:hidden;">
    <summary style="cursor:pointer;padding:11px 14px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;list-style:none;background:var(--surface-2);white-space:nowrap;">${escapeHtml(summary)}</summary>
    <div style="padding:14px;">${inner}</div>
  </details>`;
}

function modalManageKits(team){
  // Uniformes de árbitros del torneo: un solo apartado, kits numerados Kit 1, Kit 2… y el
  // "Patrocinador de ropa" que por defecto es el patrocinador de indumentaria del torneo.
  if(team && team.isRefereeKits){
    ensureRefereeKits(team);
    const porDefecto = tournamentApparelSponsorName();
    openModal(`
      <div class="modal-box" style="max-width:680px;">
        <div class="modal-head"><h2>Uniformes de árbitros del torneo</h2><button class="modal-close" data-action="close-modal">×</button></div>
        <div class="modal-body">
          <label class="field" style="margin-bottom:18px;">Patrocinador de ropa
            <input id="f-kit-sponsor-top" class="team-kitsponsor-input" data-team="${team.id}" list="brand-list" value="${escapeHtml(team.kitSponsor||porDefecto||'')}" placeholder="Marca de ropa">
            <datalist id="brand-list">${apparelBrandNames().map(b=>`<option value="${escapeHtml(b)}">`).join("")}</datalist>
            <span style="font-size:10px;color:var(--muted);font-weight:400;">${porDefecto?`Si lo dejas vacío se usa el del torneo: <b>${escapeHtml(porDefecto)}</b>.`:'Si lo dejas vacío se usa el patrocinador de indumentaria ligado al torneo.'}</span>
          </label>
          <div class="section-title" style="margin-top:0;"><h2 style="font-size:14px;">Uniformes de árbitro</h2><button class="btn gold sm" data-action="add-kit" data-team="${team.id}" data-category="arbitro">+ Agregar</button></div>
          <div class="grid cols-3">
            ${(team.kits||[]).map(k=>kitCardHTML(team,k)).join("") || `<div class="empty" style="grid-column:1/-1;"><h3>Sin uniformes</h3><p>Agrega el primero con “+ Agregar”.</p></div>`}
          </div>
        </div>
        <div class="modal-foot"><button class="btn ghost" data-action="close-modal">Cerrar</button></div>
      </div>
    `);
    return;
  }
  // --- Navegación por TEMPORADAS (parrillas por época) ---
  // Cada temporada tiene nombre, marca y fecha de presentación. La parrilla muestra las equipaciones
  // vigentes en la temporada visible; las flechas cambian TODA la parrilla. Por defecto se abre en la
  // temporada vigente según el calendario del juego, que se distingue en color/negritas.
  ensureKitSeasons(team);
  const seasons = orderedSeasons(team);
  const curId = currentSeasonId(team, kitNowISO());
  let viewId = (window.KIT_ERA_VIEW && seasons.some(s=>s.id===window.KIT_ERA_VIEW)) ? window.KIT_ERA_VIEW : curId;
  window.KIT_ERA_VIEW = viewId;
  const vi = seasons.findIndex(s=>s.id===viewId);
  const season = seasons[vi] || null;
  const viewDate = season ? season.date : kitNowISO();
  const cardsFor = (cat)=> seasonKitsCat(team, viewId, cat).map(k=>kitCardHTML(team,k)).join("");
  const isCurrent = season && season.id===curId;
  const brandDefault = team.kitSponsor||tournamentApparelSponsorName()||'';
  const seasonBar = season ? `
    <div class="kit-era-bar" style="margin-bottom:16px;padding:12px 14px;background:var(--surface-2);border-radius:12px;${isCurrent?'box-shadow:inset 0 0 0 2px var(--indigo,#4F46E5);':''}">
      <div style="display:flex;align-items:center;gap:10px;">
        <button class="btn ghost sm" data-action="kit-era-prev" data-team="${team.id}" ${vi<=0?'disabled':''}>◀</button>
        <div style="flex:1;text-align:center;">
          <div style="font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:${isCurrent?'var(--indigo,#4F46E5)':'var(--muted)'};font-weight:800;">Temporada ${vi+1} de ${seasons.length}${isCurrent?' · ACTUAL':''}</div>
          <input class="kit-season-name" data-team="${team.id}" data-season="${season.id}" value="${escapeHtml(season.name||'')}" placeholder="Nombre (ej. 2026)"
            style="width:100%;max-width:240px;text-align:center;border:none;background:transparent;font-size:18px;font-weight:800;color:${isCurrent?'var(--indigo,#4F46E5)':'var(--ink)'};padding:2px 4px;">
        </div>
        <button class="btn ghost sm" data-action="kit-era-next" data-team="${team.id}" ${vi>=seasons.length-1?'disabled':''}>▶</button>
      </div>
      <div style="display:flex;gap:14px;align-items:flex-end;justify-content:center;flex-wrap:wrap;margin-top:8px;">
        <label class="field" style="margin:0;min-width:160px;">Marca
          <input class="kit-season-brand" data-team="${team.id}" data-season="${season.id}" list="brand-list" value="${escapeHtml(season.brand||'')}" placeholder="${escapeHtml(brandDefault||'Marca de ropa')}">
        </label>
        <label class="field" style="margin:0;min-width:150px;">Presentación
          <input type="date" class="kit-season-date" data-team="${team.id}" data-season="${season.id}" value="${escapeHtml(kitToDateInput(season.date))}">
        </label>
        <button class="btn ghost sm" data-action="kit-era-new" data-team="${team.id}">+ Nueva temporada</button>
        ${seasons.length>1?`<button class="btn danger sm" data-action="kit-era-del" data-team="${team.id}" data-season="${season.id}" title="Eliminar esta temporada">✕ Temporada</button>`:""}
      </div>
      <datalist id="brand-list">${apparelBrandNames().map(b=>`<option value="${escapeHtml(b)}">`).join("")}</datalist>
    </div>` : "";
  openModal(`
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-head"><h2>Uniformes de ${team.commonName}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        ${seasonBar}
        <div class="section-title" style="margin-top:0;"><h2 style="font-size:14px;">Uniformes de jugador</h2><button class="btn gold sm" data-action="add-kit" data-team="${team.id}" data-category="jugador">+ Agregar</button></div>
        <div class="grid cols-3">
          ${cardsFor("jugador")}
        </div>
        <div class="section-title"><h2 style="font-size:14px;">Uniformes de portero</h2><button class="btn gold sm" data-action="add-kit" data-team="${team.id}" data-category="portero">+ Agregar</button></div>
        <div class="grid cols-3">
          ${cardsFor("portero")}
        </div>
      </div>
      <div class="modal-foot"><button class="btn ghost" data-action="close-modal">Cerrar</button></div>
    </div>
  `);
}
// ISO ("yyyy-mm-dd"/"yyyy-mm"/"yyyy"/"") → valor para <input type="date"> (siempre yyyy-mm-dd; mes→día 01).
function kitToDateInput(iso){
  iso=String(iso||"").trim(); if(!iso) return "";
  if(/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  if(/^\d{4}-\d{2}$/.test(iso)) return iso+"-01";
  if(/^\d{4}$/.test(iso)) return iso+"-01-01";
  return iso;
}
// Modal para crear una nueva temporada: nombre, fecha de presentación (calendario) y copiar/desde cero.
function modalNewKitSeason(team){
  const nowISO=kitNowISO();
  openModal(`
    <div class="modal-box" style="max-width:440px;">
      <div class="modal-head"><h2>Nueva temporada</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <label class="field" style="margin-bottom:14px;">Nombre
          <input id="f-newseason-name" placeholder="ej. 2026" value="">
        </label>
        <label class="field" style="margin-bottom:14px;">Fecha de presentación
          <input id="f-newseason-date" type="date" value="${escapeHtml(nowISO)}">
        </label>
        <div class="field">Equipaciones</div>
        <label class="field" style="flex-direction:row;align-items:center;gap:8px;color:var(--ink);font-weight:400;margin-top:6px;"><input type="radio" name="newseason-mode" value="copy" checked> Copiar exactamente las equipaciones actuales</label>
        <label class="field" style="flex-direction:row;align-items:center;gap:8px;color:var(--ink);font-weight:400;margin-top:6px;"><input type="radio" name="newseason-mode" value="scratch"> Empezar desde cero</label>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="kit-era-create" data-team="${team.id}">Crear temporada</button>
      </div>
    </div>
  `);
}
// Fecha actual del juego como ISO "yyyy-mm-dd" (para elegir la temporada por defecto).
function kitNowISO(){
  try{
    const d = (window.GameTime && GameTime.now) ? GameTime.now() : new Date();
    const p=n=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
  }catch(e){ return ""; }
}
function modalAddEditKit(team, kit, fromManage){
  const isEdit = !!(kit && kit.id);
  kit = kit || {category:"jugador"};
  const resolvedColor1 = kit.color1 || "#4F46E5";
  const resolvedColor2 = kit.color2 || "#15161D";
  const resolvedColor3 = kit.color3 || "#FFFFFF";
  // Hay que guardar estos valores ANTES de reconstruir "kit" más abajo — si no, en la rama
  // "no vinculado" se estarían leyendo del objeto nuevo (que nunca los tuvo) en vez del original
  // ya guardado, y el cambio manual del usuario se perdía silenciosamente al reabrir el modal.
  const origBackNameFontId = kit.backNameFontId;
  const origBackNameColor = kit.backNameColor;
  const origBackNameOutline = kit.backNameOutline;
  const origBackNameOutlineColor = kit.backNameOutlineColor;
  const origBackNameOutlineWidth = kit.backNameOutlineWidth;
  // Lo mismo para el cuadro de número+nombre del perfil del jugador ("badge") — por default sigue
  // exactamente al dorso de este mismo uniforme, pero cada lado (número/nombre) se puede
  // independizar por completo si se edita cualquiera de sus campos.
  const origBadgeNumberFontId = kit.badgeNumberFontId;
  const origBadgeNumberColor = kit.badgeNumberColor;
  const origBadgeNumberOutline = kit.badgeNumberOutline;
  const origBadgeNumberOutlineColor = kit.badgeNumberOutlineColor;
  const origBadgeNumberOutlineWidth = kit.badgeNumberOutlineWidth;
  const origBadgeNumberSizePct = kit.badgeNumberSizePct;
  const origBadgeNumberLetterSpacing = kit.badgeNumberLetterSpacing;
  const origBadgeNumberOffsetX = kit.badgeNumberOffsetX;
  const origBadgeNumberOffsetY = kit.badgeNumberOffsetY;
  const origBadgeNameFontId = kit.badgeNameFontId;
  const origBadgeNameColor = kit.badgeNameColor;
  const origBadgeNameOutline = kit.badgeNameOutline;
  const origBadgeNameOutlineColor = kit.badgeNameOutlineColor;
  const origBadgeNameOutlineWidth = kit.badgeNameOutlineWidth;
  const origBadgeNameSizePct = kit.badgeNameSizePct;
  const origBadgeNameLetterSpacing = kit.badgeNameLetterSpacing;
  const origBadgeNameOffsetX = kit.badgeNameOffsetX;
  const origBadgeNameOffsetY = kit.badgeNameOffsetY;
  const origBadgeNameArc = kit.badgeNameArc;
  const origBadgeNameTextCase = kit.badgeNameTextCase;
  const origBadgeNameCondense = kit.badgeNameCondense;
  kit = {
    id: kit.id || null,
    category: kit.category || "jugador",
    label: kit.label || "",
    // Marcas propias de los uniformes de árbitro (uso local por sede y uniforme de la final).
    refLocalKit: !!kit.refLocalKit,
    refLocalCountry: kit.refLocalCountry || "",
    refFinalKit: !!kit.refFinalKit,
    baseNumber: kit.baseNumber!=null ? kit.baseNumber : (DB.kitBases[0] ? DB.kitBases[0].number : 1),
    color1: resolvedColor1,
    color2: resolvedColor2,
    color3: resolvedColor3,
    layers: kit.layers || [],
    backLayers: kit.backLayers || [],
    badgeLayers: kit.badgeLayers || [],
    // Escudos, logos y parches: una sola lista; cada uno con su ubicación (frente, espalda o manga).
    // Los de la versión anterior (lista aparte del dorso) pasan a "espalda".
    images: (kit.images || []).map(i=>Object.assign({loc:"frente"}, i)).concat((kit.backImages || []).map(i=>Object.assign({}, i, {loc:"espalda"}))),
    frontNumber: kit.frontNumber || null,  // número al frente (selecciones)
    backImages: [],
    backNumberFontId: kit.backNumberFontId || (DB.numberFonts[0] ? DB.numberFonts[0].id : null),
    backNumberColor: kit.backNumberColor || "#FFFFFF",
    backNumberOutline: !!kit.backNumberOutline,
    backNumberOutlineColor: kit.backNumberOutlineColor || "#000000",
    backNumberOutlineWidth: kit.backNumberOutlineWidth!=null ? kit.backNumberOutlineWidth : 4,
    backNumberSizePct: kit.backNumberSizePct!=null ? kit.backNumberSizePct : 100,
    backNumberLetterSpacing: kit.backNumberLetterSpacing!=null ? kit.backNumberLetterSpacing : 0,
    backNumberOffsetX: kit.backNumberOffsetX!=null ? kit.backNumberOffsetX : 0,
    backNumberOffsetY: kit.backNumberOffsetY!=null ? kit.backNumberOffsetY : 0,
    backNameFontLinked: kit.backNameFontLinked!==undefined ? !!kit.backNameFontLinked : true,
    backNameColorLinked: kit.backNameColorLinked!==undefined ? !!kit.backNameColorLinked : true,
    backNameOutlineLinked: kit.backNameOutlineLinked!==undefined ? !!kit.backNameOutlineLinked : true,
    backNameSizePct: kit.backNameSizePct!=null ? kit.backNameSizePct : 100,
    backNameCondense: kit.backNameCondense || false,
    backNameLetterSpacing: kit.backNameLetterSpacing!=null ? kit.backNameLetterSpacing : 0,
    backNameOffsetX: kit.backNameOffsetX!=null ? kit.backNameOffsetX : 0,
    backNameOffsetY: kit.backNameOffsetY!=null ? kit.backNameOffsetY : 0,
    backNameArc: kit.backNameArc!=null ? kit.backNameArc : 1,
    backNameTextCase: kit.backNameTextCase || "default",
    // Los uniformes de árbitro nacen SIN nombre en la espalda (backNameHidden=true) por defecto.
    backNameHidden: (kit.backNameHidden!=null ? !!kit.backNameHidden : (kit.category==="arbitro")),
    badgeNumberLinked: kit.badgeNumberLinked!==undefined ? !!kit.badgeNumberLinked : true,
    badgeNameLinked: kit.badgeNameLinked!==undefined ? !!kit.badgeNameLinked : true,
    combinations: (kit.combinations && kit.combinations.length) ? kit.combinations : [defaultCombo(resolvedColor1, resolvedColor2, resolvedColor3)],
    linkedJugadorKitIds: kit.linkedJugadorKitIds || [],
    // Temporada a la que pertenece (parrilla independiente) + fecha propia opcional.
    seasonId: kit.seasonId || null,
    dateStart: kit.dateStart || "",
    ownDate: !!kit.ownDate
  };
  KIT_EDIT_CTX = { teamId: team && team.id || null, date: kitDateOf(team, kit), seasonId: kit.seasonId || null };
  // La "Letra del dorso" (APELLIDO) hereda los valores del número mientras esté "vinculada"
  // (backName*Linked=true) — en cuanto el usuario la edite manualmente, se desvincula y guarda su propio valor.
  kit.backNameFontId = kit.backNameFontLinked ? kit.backNumberFontId : (origBackNameFontId || kit.backNumberFontId);
  kit.backNameColor = kit.backNameColorLinked ? kit.backNumberColor : (origBackNameColor || kit.backNumberColor);
  kit.backNameOutline = kit.backNameOutlineLinked ? kit.backNumberOutline : !!origBackNameOutline;
  kit.backNameOutlineColor = kit.backNameOutlineLinked ? kit.backNumberOutlineColor : (origBackNameOutlineColor || kit.backNumberOutlineColor);
  kit.backNameOutlineWidth = kit.backNameOutlineLinked ? kit.backNumberOutlineWidth : (origBackNameOutlineWidth!=null ? origBackNameOutlineWidth : kit.backNumberOutlineWidth);
  // El cuadro de número+nombre del perfil del jugador ("badge") sigue exactamente al dorso de este
  // mismo uniforme (Número→badgeNumber, Nombre→badgeName) mientras esté vinculado — apenas se
  // edite cualquier campo del lado correspondiente, ese lado completo se independiza.
  kit.badgeNumberFontId = kit.badgeNumberLinked ? kit.backNumberFontId : (origBadgeNumberFontId || kit.backNumberFontId);
  kit.badgeNumberColor = kit.badgeNumberLinked ? kit.backNumberColor : (origBadgeNumberColor || kit.backNumberColor);
  kit.badgeNumberOutline = kit.badgeNumberLinked ? kit.backNumberOutline : !!origBadgeNumberOutline;
  kit.badgeNumberOutlineColor = kit.badgeNumberLinked ? kit.backNumberOutlineColor : (origBadgeNumberOutlineColor || kit.backNumberOutlineColor);
  kit.badgeNumberOutlineWidth = kit.badgeNumberLinked ? kit.backNumberOutlineWidth : (origBadgeNumberOutlineWidth!=null ? origBadgeNumberOutlineWidth : kit.backNumberOutlineWidth);
  kit.badgeNumberSizePct = kit.badgeNumberLinked ? kit.backNumberSizePct : (origBadgeNumberSizePct!=null ? origBadgeNumberSizePct : kit.backNumberSizePct);
  kit.badgeNumberLetterSpacing = kit.badgeNumberLinked ? kit.backNumberLetterSpacing : (origBadgeNumberLetterSpacing!=null ? origBadgeNumberLetterSpacing : kit.backNumberLetterSpacing);
  kit.badgeNumberOffsetX = kit.badgeNumberLinked ? kit.backNumberOffsetX : (origBadgeNumberOffsetX!=null ? origBadgeNumberOffsetX : kit.backNumberOffsetX);
  kit.badgeNumberOffsetY = kit.badgeNumberLinked ? kit.backNumberOffsetY : (origBadgeNumberOffsetY!=null ? origBadgeNumberOffsetY : kit.backNumberOffsetY);
  kit.badgeNameFontId = kit.badgeNameLinked ? kit.backNameFontId : (origBadgeNameFontId || kit.backNameFontId);
  kit.badgeNameColor = kit.badgeNameLinked ? kit.backNameColor : (origBadgeNameColor || kit.backNameColor);
  kit.badgeNameOutline = kit.badgeNameLinked ? kit.backNameOutline : !!origBadgeNameOutline;
  kit.badgeNameOutlineColor = kit.badgeNameLinked ? kit.backNameOutlineColor : (origBadgeNameOutlineColor || kit.backNameOutlineColor);
  kit.badgeNameOutlineWidth = kit.badgeNameLinked ? kit.backNameOutlineWidth : (origBadgeNameOutlineWidth!=null ? origBadgeNameOutlineWidth : kit.backNameOutlineWidth);
  kit.badgeNameSizePct = kit.badgeNameLinked ? kit.backNameSizePct : (origBadgeNameSizePct!=null ? origBadgeNameSizePct : kit.backNameSizePct);
  kit.badgeNameLetterSpacing = kit.badgeNameLinked ? kit.backNameLetterSpacing : (origBadgeNameLetterSpacing!=null ? origBadgeNameLetterSpacing : kit.backNameLetterSpacing);
  kit.badgeNameOffsetX = kit.badgeNameLinked ? kit.backNameOffsetX : (origBadgeNameOffsetX!=null ? origBadgeNameOffsetX : kit.backNameOffsetX);
  kit.badgeNameOffsetY = kit.badgeNameLinked ? kit.backNameOffsetY : (origBadgeNameOffsetY!=null ? origBadgeNameOffsetY : kit.backNameOffsetY);
  kit.badgeNameArc = kit.badgeNameLinked ? kit.backNameArc : (origBadgeNameArc!=null ? origBadgeNameArc : kit.backNameArc);
  kit.badgeNameTextCase = kit.badgeNameLinked ? kit.backNameTextCase : (origBadgeNameTextCase || kit.backNameTextCase);
  kit.badgeNameCondense = kit.badgeNameLinked ? (kit.backNameCondense||false) : (origBadgeNameCondense!=null ? origBadgeNameCondense : (kit.backNameCondense||false));
  // El cuadro solo tiene sentido configurar aparte en el uniforme de Local (jugador) y Portero
  // Local — los demás (Visita, Portero Visita, etc.) no se usan para este cuadro en el perfil.
  const isRefKit = kit.category==="arbitro";
  const showBadgeSection = !isRefKit && (kit.label==="Local" || kit.label==="Portero Local");
  // Solo los uniformes de jugador de la MISMA temporada que este kit (cada temporada es independiente).
  const jugadorKits = team.kits.filter(k=>k.category==="jugador" && k.seasonId===kit.seasonId);
  openModal(`
    ${isRefKit ? `<style>[data-kit-number-only]{display:none !important;}</style>` : ""}
    <div class="modal-box kit-ed-box">
      <div class="modal-head"><h2>${isEdit?"Editar uniforme":"Agregar uniforme"} — ${kit.category==="arbitro"?"Árbitro":(kit.category==="jugador"?"Jugador":"Portero")}</h2><button class="modal-close" data-action="cancel-kit-edit" data-team="${team.id}" data-from-manage="${fromManage?'1':'0'}">×</button></div>
      <div class="modal-body kit-ed-body">
        
        <!-- Editor de uniformes (como el de press walls): a la IZQUIERDA las vistas previas (frente y dorso),
             la prueba de número/nombre y las combinaciones; a la DERECHA, pestañas para editar. -->
        <datalist id="kit-img-brandlist">${(DB.sponsors||[]).map(sp=>`<option value="${escapeHtml(sp.name)}"></option>`).join("")}</datalist>
        <div class="kit-ed">
          <div class="kit-ed-izq">
            <div class="kit-ed-prevs">
              <div><div class="kit-ed-cap">Frente</div><div id="kit-modal-preview" class="kit-ed-prev"></div></div>
              <div><div class="kit-ed-cap">Dorso</div><div id="kit-modal-preview-back" class="kit-ed-prev"></div></div>
            </div>
            <div style="background:var(--surface-2);border-radius:8px;padding:8px 12px;margin-bottom:14px;">
          <div data-action="toggle-kit-test-panel" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">Probar con otro número/nombre (solo vista previa — nunca se guarda)</span>
            <span id="kit-test-panel-chevron" class="mono" style="color:var(--muted);font-size:13px;">▸</span>
          </div>
          <div id="kit-test-panel-body" style="display:none;margin-top:10px;">
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;">
              <label class="field" data-kit-number-only="1" style="width:100px;">Número de prueba
                <input type="number" id="f-kit-preview-number" class="kit-modal-control" min="0" max="999" value="${kitDefaultPreviewNumber(kit)}">
              </label>
              <label class="field" style="flex:1;min-width:180px;">Nombre de prueba
                <input type="text" id="f-kit-preview-name" class="kit-modal-control" maxlength="50" value="APELLIDO">
              </label>
            </div>
          </div>
        </div>
            <div class="subhead">Combinaciones de shorts y calcetas</div>
        <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">La primera combinación es la principal (la que se muestra en la lista de uniformes). Agrega más para tener otras opciones de shorts/calcetas con la misma playera.</p>
        <div id="kit-combo-rows">
          ${kit.combinations.map((c,i)=>comboBlockHTML(c,i)).join("")}
        </div>
        <button type="button" class="btn ghost sm" data-action="add-combo-row">+ Agregar combinación</button>
          </div>
          <div class="kit-ed-der">
            <div class="kit-ed-tabs">
              <button type="button" class="btn ghost sm kit-ed-tab" data-action="kit-ed-tab" data-tab="base">Base, colores y capas</button>
              <button type="button" class="btn ghost sm kit-ed-tab" data-action="kit-ed-tab" data-tab="logos">Escudos, logos y parches</button>
              <button type="button" class="btn ghost sm kit-ed-tab" data-action="kit-ed-tab" data-tab="num">${isRefKit?"Nombre":"Número y nombre"}</button>
              ${showBadgeSection?`<button type="button" class="btn ghost sm kit-ed-tab" data-action="kit-ed-tab" data-tab="cuadro">Cuadro de número+nombre</button>`:""}
            </div>
            <div class="kit-ed-pane" data-pane="base">
              <div class="form-grid">
              <label class="field" style="grid-column:1/-1;">Base
                <select id="f-kit-base" class="kit-modal-control" data-category="${kit.category||'jugador'}">
                  ${DB.kitBases.map(b=>`<option value="${b.number}" ${b.number===kit.baseNumber?"selected":""}>${garmentName('shirt',b.number)}</option>`).join("")}
                </select>
              </label>
              <div style="grid-column:1/-1;display:flex;gap:14px;">
                ${colorPickerHTML("kit-modal-control color-square", kit.color1, "f-kit-color1")}
                ${colorPickerHTML("kit-modal-control color-square", kit.color2, "f-kit-color2")}
                ${colorPickerHTML("kit-modal-control color-square", kit.color3, "f-kit-color3")}
              </div>
            </div>
              <div class="subhead">Capas adicionales (opcional)</div>
              <div style="display:grid;grid-template-columns:1fr;gap:14px;margin-bottom:14px;">   <!-- una columna: cada capa usa todo el ancho (cabe "Recolorear" con sus 3 colores en la misma fila) -->
          <div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:6px;">Playera</div>
            <div id="kit-layer-rows">
              ${kit.layers.map(l=>layerRowHTML(l)).join("")}
            </div>
            <button type="button" class="btn ghost sm" data-action="add-layer-row">+ Agregar capa</button>
          </div>
          <div>
            <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:6px;">Dorso</div>
            <div id="kit-back-layer-rows">
              ${kit.backLayers.map(l=>layerRowHTML(l)).join("")}
            </div>
            <button type="button" class="btn ghost sm" data-action="add-back-layer-row">+ Agregar capa</button>
          </div>
        </div>
              ${kit.category==="portero" ? `
        <div class="subhead">¿Va con algún uniforme de jugador en particular?</div>
        <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Opcional. Por ejemplo, si esta playera de portero solo se usa con el uniforme Local (o con Visita y Tercero juntos, por temas de patrocinador). Si no marcas ninguno, esta playera se puede usar con cualquier uniforme de jugador.</p>
        <div id="kit-linked-jugador" style="display:flex;gap:10px;flex-wrap:wrap;">
          ${jugadorKits.map(jk=>`
            <label style="display:flex;align-items:center;gap:6px;font-size:13px;background:var(--surface-2);padding:6px 10px;border-radius:8px;cursor:pointer;">
              <input type="checkbox" class="linked-jugador-checkbox" value="${jk.id}" style="width:auto;" ${kit.linkedJugadorKitIds.includes(jk.id)?'checked':''}>
              ${jk.label}
            </label>
          `).join("") || `<span style="font-size:12px;color:var(--muted);">Esta selección todavía no tiene uniformes de jugador.</span>`}
        </div>
        ` : ""}
        ${isRefKit ? `
        <div class="subhead">Uso de este uniforme</div>
        <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Opcional. Marca si este uniforme es el que usan los árbitros en las sedes de un país anfitrión, o el exclusivo de la final del torneo.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center;">
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;background:var(--surface-2);padding:6px 10px;border-radius:8px;cursor:pointer;">
            <input type="checkbox" id="f-kit-ref-final" class="kit-modal-control" style="width:auto;" ${kit.refFinalKit?"checked":""}>
            Kit final
          </label>
          <label style="display:flex;align-items:center;gap:6px;font-size:13px;background:var(--surface-2);padding:6px 10px;border-radius:8px;cursor:pointer;">
            <input type="checkbox" id="f-kit-ref-local" class="kit-modal-control" style="width:auto;" ${kit.refLocalKit?"checked":""}>
            Kit local
          </label>
          <select id="f-kit-ref-local-country" class="kit-modal-control" style="width:190px;" ${kit.refLocalKit?"":"disabled"}>
            ${kit.refLocalKit ? refereeLocalKitCountries().map(c=>`<option value="${escapeHtml(c)}" ${normLoose(c)===normLoose(kit.refLocalCountry||"")?"selected":""}>${escapeHtml(c)}</option>`).join("") : ""}
          </select>
        </div>
        ` : ""}
              ${!isRefKit ? `
        <div class="subhead">Fecha de esta equipación</div>
        <div class="form-grid" style="margin-bottom:4px;">
          <label class="field" style="grid-column:1/-1;flex-direction:row;align-items:center;gap:8px;color:var(--ink);font-weight:400;">
            <input type="checkbox" id="f-kit-owndate" class="kit-modal-control" ${kit.ownDate?'checked':''} onchange="var d=document.getElementById('f-kit-datestart'); if(d){ d.disabled=!this.checked; if(this.checked) d.focus(); }">
            <span>Esta equipación se presenta en fecha propia (distinta a la temporada)</span>
          </label>
          <label class="field">Se presenta
            <input id="f-kit-datestart" type="date" class="kit-modal-control" value="${escapeHtml(kitToDateInput(kit.dateStart))}" ${kit.ownDate?'':'disabled'}>
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Solo si se presenta en fecha distinta a la de su temporada. La marca se define en la temporada.</span>
          </label>
        </div>` : ""}
            </div>
            <div class="kit-ed-pane" data-pane="logos" hidden>
              <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
              <button type="button" class="btn ghost sm" data-action="copy-kit-imgs" title="Escudos, logos, parches y número al frente, con sus posiciones">Copiar escudos y logos</button>
              <button type="button" class="btn ghost sm" data-action="paste-kit-imgs" data-colors="1">Pegar con colores</button>
              <button type="button" class="btn ghost sm" data-action="paste-kit-imgs" data-colors="0">Pegar sin colores</button>
            </div>
              <!-- Escudos, logos y parches: UNA lista para todo el uniforme (cada uno elige si va al frente, en la
             espalda o en una manga), en dos columnas, debajo de las capas. -->
        <div style="margin:-4px 0 14px;">
          <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:6px;">Escudos, logos y parches</div>
          ${kitImgButtonsHTML(team)}
          <div id="kit-img-rows" class="kit-img-grid">
            ${kit.images.map(im=>kitImgRowHTML(im)).join("")}
          </div>
          ${kitIsNationalTeam(team) ? frontNumberFieldsHTML(kit) : ""}
        </div>
            </div>
            <div class="kit-ed-pane" data-pane="num" hidden>
              <div data-kit-number-only="1" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--surface-2);border-radius:8px;padding:8px 12px;margin-bottom:6px;">
          <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">Número + Nombre (los dos juntos)</span>
          <span style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn ghost sm" data-action="copy-both-style">Copiar ambos</button>
            <button type="button" class="btn ghost sm" data-action="paste-both-style-color">Pegar ambos + color</button>
            <button type="button" class="btn ghost sm" data-action="paste-both-style-only">Pegar ambos sin color</button>
          </span>
        </div>

        <div class="subhead" data-kit-number-only="1" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <span>Número</span>
          <span style="display:flex;gap:8px;">
            <button type="button" class="btn ghost sm" data-action="copy-number-style">Copiar estilo</button>
            <button type="button" class="btn ghost sm" data-action="paste-number-style-color">Pegar estilo y color</button>
            <button type="button" class="btn ghost sm" data-action="paste-number-style-only">Pegar solo estilo</button>
          </span>
        </div>
        <p data-kit-number-only="1" style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Tipografía, color y contorno opcional del número (se muestra "${kitDefaultPreviewNumber(kit)}" de ejemplo).</p>
        ${DB.numberFonts.length ? `
        <div data-kit-number-only="1" style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
          <label class="field" style="flex:1;min-width:130px;">Tipografía
            <select id="f-kit-backnum-font" class="kit-modal-control">
              ${DB.numberFonts.map(f=>`<option value="${f.id}" ${f.id===kit.backNumberFontId?"selected":""}>${numberFontLabel(f)}</option>`).join("")}
            </select>
          </label>
          ${colorPickerHTML("kit-modal-control color-square-sm", kit.backNumberColor, "f-kit-backnum-color")}
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;padding-bottom:9px;">
            <input type="checkbox" id="f-kit-backnum-outline" class="kit-modal-control" style="width:auto;" ${kit.backNumberOutline?"checked":""}> Contorno
          </label>
          ${colorPickerHTML("kit-modal-control color-square-sm", kit.backNumberOutlineColor, "f-kit-backnum-outline-color")}
          <label class="field" style="width:70px;">Grosor
            <input type="number" id="f-kit-backnum-outline-width" class="kit-modal-control" min="0" max="12" step="1" value="${kit.backNumberOutlineWidth}">
          </label>
        </div>
        <div data-kit-number-only="1" style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:14px;">
          <label class="field" style="width:90px;">Tamaño
            <input type="number" id="f-kit-backnum-sizepct" class="kit-modal-control" min="40" max="150" step="5" value="${kit.backNumberSizePct}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">% del tamaño normal</span>
          </label>
          <label class="field" style="width:100px;">Interletrado
            <input type="number" id="f-kit-backnum-letterspacing" class="kit-modal-control" min="-20" max="20" step="1" value="${kit.backNumberLetterSpacing}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">espacio entre letras</span>
          </label>
          <label class="field" style="width:130px;">Posición
            <div style="display:flex;gap:4px;">
              <input type="number" id="f-kit-backnum-offsetx" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.backNumberOffsetX}" title="Horizontal" style="width:50%;">
              <input type="number" id="f-kit-backnum-offsety" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.backNumberOffsetY}" title="Vertical" style="width:50%;">
            </div>
            <span style="font-size:10px;color:var(--muted);font-weight:400;">↔ ↕ ajuste opcional (ya centra solo)</span>
          </label>
        </div>

        ${kitIsNationalTeam(team) ? frontNumberStyleHTML(kit) : ""}
        <div class="subhead" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <span style="display:flex;align-items:center;gap:12px;">Nombre
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;text-transform:none;letter-spacing:0;">
              <input type="checkbox" id="f-kit-backname-show" class="kit-modal-control" style="width:auto;margin:0;" ${kit.backNameHidden?'':'checked'}> Mostrar nombre
            </label>
          </span>
          <span style="display:flex;gap:8px;">
            <button type="button" class="btn ghost sm" data-action="copy-name-style">Copiar estilo</button>
            <button type="button" class="btn ghost sm" data-action="paste-name-style-color">Pegar estilo y color</button>
            <button type="button" class="btn ghost sm" data-action="paste-name-style-only">Pegar solo estilo</button>
            <button type="button" class="btn ghost sm" data-action="reset-backname">↺ Restablecer al default</button>
          </span>
        </div>
        <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Por default sigue al número — si cambias algo aquí, se desvincula esa parte.</p>
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
          <label class="field" style="flex:1;min-width:130px;">Tipografía
            <select id="f-kit-backname-font" class="kit-modal-control">
              ${DB.numberFonts.map(f=>`<option value="${f.id}" ${f.id===kit.backNameFontId?"selected":""}>${numberFontLabel(f)}</option>`).join("")}
            </select>
          </label>
          ${colorPickerHTML("kit-modal-control color-square-sm", kit.backNameColor, "f-kit-backname-color")}
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;padding-bottom:9px;">
            <input type="checkbox" id="f-kit-backname-outline" class="kit-modal-control" style="width:auto;" ${kit.backNameOutline?"checked":""}> Contorno
          </label>
          ${colorPickerHTML("kit-modal-control color-square-sm", kit.backNameOutlineColor, "f-kit-backname-outline-color")}
          <label class="field" style="width:70px;">Grosor
            <input type="number" id="f-kit-backname-outline-width" class="kit-modal-control" min="0" max="12" step="1" value="${kit.backNameOutlineWidth}">
          </label>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:14px;">
          <label class="field" style="width:90px;">Tamaño
            <input type="number" id="f-kit-backname-sizepct" class="kit-modal-control" min="40" max="150" step="5" value="${kit.backNameSizePct}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">% del tamaño normal</span>
          </label>
          <label class="field" style="width:160px;justify-content:flex-end;padding-bottom:4px;">Ajuste de nombre
            <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:400;color:var(--ink);cursor:pointer;margin-top:4px;">
              <input type="checkbox" id="f-kit-backname-condense" class="kit-modal-control" style="width:auto;margin:0;" ${kit.backNameCondense?'checked':''}> Condensar letras
            </label>
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Desmarcado: reduce el tamaño uniformemente. Marcado: comprime el ancho cuando el nombre es largo.</span>
          </label>
          <label class="field" style="width:100px;">Interletrado
            <input type="number" id="f-kit-backname-letterspacing" class="kit-modal-control" min="-20" max="20" step="1" value="${kit.backNameLetterSpacing}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">espacio entre letras</span>
          </label>
          <label class="field" style="width:130px;">Posición
            <div style="display:flex;gap:4px;">
              <input type="number" id="f-kit-backname-offsetx" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.backNameOffsetX}" title="Horizontal" style="width:50%;">
              <input type="number" id="f-kit-backname-offsety" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.backNameOffsetY}" title="Vertical" style="width:50%;">
            </div>
            <span style="font-size:10px;color:var(--muted);font-weight:400;">↔ ↕ ajuste opcional (ya centra solo)</span>
          </label>
          <label class="field" style="width:150px;">Arco
            <select id="f-kit-backname-arc" class="kit-modal-control">
              <option value="1" ${kit.backNameArc===1?"selected":""}>1 — Plano</option>
              <option value="2" ${kit.backNameArc===2?"selected":""}>2 — Arqueado</option>
              <option value="3" ${kit.backNameArc===3?"selected":""}>3 — Muy arqueado</option>
            </select>
          </label>
          <label class="field" style="width:170px;">Estilo de letra
            <select id="f-kit-backname-textcase" class="kit-modal-control">
              <option value="default" ${kit.backNameTextCase==="default"?"selected":""}>Default</option>
              <option value="upper" ${kit.backNameTextCase==="upper"?"selected":""}>MAYÚSCULAS</option>
              <option value="capitalize-first" ${kit.backNameTextCase==="capitalize-first"?"selected":""}>Mayúscula primera letra</option>
              <option value="title" ${kit.backNameTextCase==="title"?"selected":""}>Mayúscula En Cada Palabra</option>
              <option value="lower" ${kit.backNameTextCase==="lower"?"selected":""}>minúsculas</option>
            </select>
          </label>
        </div>
        <input type="hidden" id="f-kit-backname-font-linked" value="${kit.backNameFontLinked?'1':'0'}">
        <input type="hidden" id="f-kit-backname-color-linked" value="${kit.backNameColorLinked?'1':'0'}">
        <input type="hidden" id="f-kit-backname-outline-linked" value="${kit.backNameOutlineLinked?'1':'0'}">
        ` : `<p style="font-size:12px;color:var(--danger);margin:0 0 14px;">Todavía no hay tipografías cargadas — agrega una desde "Editor / Base de datos" → "Uniformes" → "Tipografías de número".</p>`}
            </div>
            ${showBadgeSection ? `<div class="kit-ed-pane kit-ed-pane-cuadro" data-pane="cuadro" hidden>` : ""}
            ${showBadgeSection ? `
        <div style="background:var(--surface-2);border-radius:8px;padding:8px 12px;margin-top:14px;">
          <div data-action="toggle-kit-badge-panel" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">Cuadro de número+nombre (perfil del jugador)</span>
            <span id="kit-badge-panel-chevron" class="mono" style="color:var(--muted);font-size:13px;">▸</span>
          </div>
          <div id="kit-badge-panel-body" style="display:none;margin-top:10px;">
            <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Por default, el cuadro del perfil del jugador usa exactamente la misma tipografía/color/contorno/tamaño/interletrado/posición que el dorso de este uniforme. Si cambias algo aquí, ese lado (número o nombre) deja de seguir al dorso.</p>

            <div style="display:flex;gap:16px;margin-bottom:14px;flex-wrap:wrap;align-items:flex-start;">
              <div id="kit-badge-preview" style="width:150px;height:150px;flex-shrink:0;background:var(--surface-2);border-radius:10px;"></div>
              <div style="flex:1;min-width:200px;background:var(--surface-2);border-radius:8px;padding:8px 12px;">
                <div style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;margin-bottom:8px;">Probar con otro número/nombre (solo vista previa — nunca se guarda)</div>
                <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;">
                  <label class="field" data-kit-number-only="1" style="width:100px;">Número de prueba
                    <input type="number" id="f-kit-badge-preview-number" class="kit-modal-control" min="0" max="999" value="${kitDefaultPreviewNumber(kit)}">
                  </label>
                  <label class="field" style="flex:1;min-width:140px;">Nombre de prueba
                    <input type="text" id="f-kit-badge-preview-name" class="kit-modal-control" maxlength="50" value="APELLIDO">
                  </label>
                </div>
              </div>
            </div>

            <div class="subhead">Capas adicionales del cuadro (opcional)</div>
            <div style="margin-bottom:14px;">
              <div id="kit-badge-layer-rows">
                ${(kit.badgeLayers||[]).map(l=>layerRowHTML(l, {transform:true})).join("")}
              </div>
              <button type="button" class="btn ghost sm" data-action="add-badge-layer-row">+ Agregar capa</button>
            </div>

            <div class="subhead" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <span>Número (cuadro) <span id="kit-badgenum-status" style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:0;padding:2px 7px;border-radius:10px;margin-left:6px;${kit.badgeNumberLinked?'background:rgba(52,211,153,0.16);color:var(--success);':'background:rgba(255,107,106,0.16);color:var(--danger);'}">${kit.badgeNumberLinked?'🔗 Vinculado':'🔓 Independiente'}</span></span>
              <button type="button" class="btn ghost sm" data-action="reset-badge-number">↺ Restablecer al default</button>
            </div>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
              <label class="field" style="flex:1;min-width:130px;">Tipografía
                <select id="f-kit-badgenum-font" class="kit-modal-control">
                  ${DB.numberFonts.map(f=>`<option value="${f.id}" ${f.id===kit.badgeNumberFontId?"selected":""}>${numberFontLabel(f)}</option>`).join("")}
                </select>
              </label>
              ${colorPickerHTML("kit-modal-control color-square-sm", kit.badgeNumberColor, "f-kit-badgenum-color")}
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;padding-bottom:9px;">
                <input type="checkbox" id="f-kit-badgenum-outline" class="kit-modal-control" style="width:auto;" ${kit.badgeNumberOutline?"checked":""}> Contorno
              </label>
              ${colorPickerHTML("kit-modal-control color-square-sm", kit.badgeNumberOutlineColor, "f-kit-badgenum-outline-color")}
              <label class="field" style="width:70px;">Grosor
                <input type="number" id="f-kit-badgenum-outline-width" class="kit-modal-control" min="0" max="12" step="1" value="${kit.badgeNumberOutlineWidth}">
              </label>
            </div>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:14px;">
              <label class="field" style="width:90px;">Tamaño
                <input type="number" id="f-kit-badgenum-sizepct" class="kit-modal-control" min="40" max="150" step="5" value="${kit.badgeNumberSizePct}">
                <span style="font-size:10px;color:var(--muted);font-weight:400;">% del tamaño normal</span>
              </label>
              <label class="field" style="width:100px;">Interletrado
                <input type="number" id="f-kit-badgenum-letterspacing" class="kit-modal-control" min="-20" max="20" step="1" value="${kit.badgeNumberLetterSpacing}">
                <span style="font-size:10px;color:var(--muted);font-weight:400;">espacio entre letras</span>
              </label>
              <label class="field" style="width:130px;">Posición
                <div style="display:flex;gap:4px;">
                  <input type="number" id="f-kit-badgenum-offsetx" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.badgeNumberOffsetX}" title="Horizontal" style="width:50%;">
                  <input type="number" id="f-kit-badgenum-offsety" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.badgeNumberOffsetY}" title="Vertical" style="width:50%;">
                </div>
                <span style="font-size:10px;color:var(--muted);font-weight:400;">↔ ↕ ajuste opcional (ya centra solo)</span>
              </label>
            </div>
            <input type="hidden" id="f-kit-badgenum-linked" value="${kit.badgeNumberLinked?'1':'0'}">

            <div class="subhead" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
              <span>Nombre (cuadro) <span id="kit-badgename-status" style="font-size:10px;font-weight:600;text-transform:none;letter-spacing:0;padding:2px 7px;border-radius:10px;margin-left:6px;${kit.badgeNameLinked?'background:rgba(52,211,153,0.16);color:var(--success);':'background:rgba(255,107,106,0.16);color:var(--danger);'}">${kit.badgeNameLinked?'🔗 Vinculado':'🔓 Independiente'}</span></span>
              <button type="button" class="btn ghost sm" data-action="reset-badge-name">↺ Restablecer al default</button>
            </div>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
              <label class="field" style="flex:1;min-width:130px;">Tipografía
                <select id="f-kit-badgename-font" class="kit-modal-control">
                  ${DB.numberFonts.map(f=>`<option value="${f.id}" ${f.id===kit.badgeNameFontId?"selected":""}>${numberFontLabel(f)}</option>`).join("")}
                </select>
              </label>
              ${colorPickerHTML("kit-modal-control color-square-sm", kit.badgeNameColor, "f-kit-badgename-color")}
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;padding-bottom:9px;">
                <input type="checkbox" id="f-kit-badgename-outline" class="kit-modal-control" style="width:auto;" ${kit.badgeNameOutline?"checked":""}> Contorno
              </label>
              ${colorPickerHTML("kit-modal-control color-square-sm", kit.badgeNameOutlineColor, "f-kit-badgename-outline-color")}
              <label class="field" style="width:70px;">Grosor
                <input type="number" id="f-kit-badgename-outline-width" class="kit-modal-control" min="0" max="12" step="1" value="${kit.badgeNameOutlineWidth}">
              </label>
            </div>
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:6px;">
              <label class="field" style="width:90px;">Tamaño
                <input type="number" id="f-kit-badgename-sizepct" class="kit-modal-control" min="40" max="150" step="5" value="${kit.badgeNameSizePct}">
                <span style="font-size:10px;color:var(--muted);font-weight:400;">% del tamaño normal</span>
              </label>
              <label class="field" style="width:160px;">Ajuste de nombre
                <label style="display:flex;align-items:center;gap:6px;font-size:12px;font-weight:400;color:var(--ink);cursor:pointer;margin-top:4px;">
                  <input type="checkbox" id="f-kit-badgename-condense" class="kit-modal-control" style="width:auto;margin:0;" ${kit.badgeNameCondense?'checked':''}> Condensar letras
                </label>
                <span style="font-size:10px;color:var(--muted);font-weight:400;">Desmarcado: reduce el tamaño uniformemente. Marcado: comprime el ancho cuando el nombre es largo.</span>
              </label>
              <label class="field" style="width:100px;">Interletrado
                <input type="number" id="f-kit-badgename-letterspacing" class="kit-modal-control" min="-20" max="20" step="1" value="${kit.badgeNameLetterSpacing}">
                <span style="font-size:10px;color:var(--muted);font-weight:400;">espacio entre letras</span>
              </label>
              <label class="field" style="width:130px;">Posición
                <div style="display:flex;gap:4px;">
                  <input type="number" id="f-kit-badgename-offsetx" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.badgeNameOffsetX}" title="Horizontal" style="width:50%;">
                  <input type="number" id="f-kit-badgename-offsety" class="kit-modal-control" min="-100" max="100" step="1" value="${kit.badgeNameOffsetY}" title="Vertical" style="width:50%;">
                </div>
                <span style="font-size:10px;color:var(--muted);font-weight:400;">↔ ↕ ajuste opcional (ya centra solo)</span>
              </label>
              <label class="field" style="width:150px;">Arco
                <select id="f-kit-badgename-arc" class="kit-modal-control">
                  <option value="1" ${kit.badgeNameArc===1?"selected":""}>1 — Plano</option>
                  <option value="2" ${kit.badgeNameArc===2?"selected":""}>2 — Arqueado</option>
                  <option value="3" ${kit.badgeNameArc===3?"selected":""}>3 — Muy arqueado</option>
                </select>
              </label>
              <label class="field" style="width:170px;">Estilo de letra
                <select id="f-kit-badgename-textcase" class="kit-modal-control">
                  <option value="default" ${kit.badgeNameTextCase==="default"?"selected":""}>Default</option>
                  <option value="upper" ${kit.badgeNameTextCase==="upper"?"selected":""}>MAYÚSCULAS</option>
                  <option value="capitalize-first" ${kit.badgeNameTextCase==="capitalize-first"?"selected":""}>Mayúscula primera letra</option>
                  <option value="title" ${kit.badgeNameTextCase==="title"?"selected":""}>Mayúscula En Cada Palabra</option>
                  <option value="lower" ${kit.badgeNameTextCase==="lower"?"selected":""}>minúsculas</option>
                </select>
              </label>
            </div>
            <input type="hidden" id="f-kit-badgename-linked" value="${kit.badgeNameLinked?'1':'0'}">
          </div>
        </div>
        ` : ""}
            ${showBadgeSection ? `</div>` : ""}
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="cancel-kit-edit" data-team="${team.id}" data-from-manage="${fromManage?'1':'0'}">Cancelar</button>
        <button class="btn gold" data-action="save-kit" data-team="${team.id}" data-category="${kit.category}" data-id="${kit.id||''}" data-from-manage="${fromManage?'1':'0'}">Guardar</button>
      </div>
    </div>
  `);
  kitEdShowTab(window.KIT_ED_TAB || "base");
  refreshKitModalPreview();
  refreshAllComboPreviews();
}
// Pestañas del editor de uniformes (se recuerda la última abierta).
function kitEdShowTab(tab){
  const panes=document.querySelectorAll(".kit-ed-pane"); if(!panes.length) return;
  if(![...panes].some(p=>p.dataset.pane===tab)) tab="base";
  window.KIT_ED_TAB = tab;
  panes.forEach(p=>{ p.hidden = p.dataset.pane!==tab; });
  document.querySelectorAll(".kit-ed-tab").forEach(b=>b.classList.toggle("on", b.dataset.tab===tab));
}
/* ---------- Imágenes sobre la playera: escudo, marca, patrocinadores y parches (PNG) ----------
   Cada imagen = { kind:"escudo"|"marca"|"patrocinador"|"parche", img, x, y, w, pos, variant?, sponsorId? }
     x / y = centro en % del lienzo; w = ancho en % (el alto sale de la proporción de la imagen);
     pos = "izq" | "centro" | "der" | "libre" (atajo que fija la X); el orden de la lista es el apilado
     (la de abajo queda encima).
   · Escudo: se elige entre los logos del dueño (escudo oscuro/claro y sus alternativos). En árbitros, los
     del torneo / federación / confederación / FIFA y el badge FIFA Referee (con el año en curso).
   · Marca y patrocinadores: se eligen entre los patrocinadores del dueño VIGENTES en la fecha del uniforme
     (enlaces con "desde/hasta"); la marca solo entre los de indumentaria. Si no está, se agrega (y se liga
     al dueño desde el año del uniforme). Luego se elige el logo (principal o alternativos).
   · Subir un PNG en escudo / marca / patrocinador lo agrega a los ALTERNATIVOS del dueño o de la marca
     ("Alt N", siguiendo la numeración que ya tenga). El parche es solo un PNG. */
const KIT_IMG_KINDS = {
  escudo:       { label:"Escudo",        front:{x:63, y:31, w:12, pos:"der"},    back:{x:50, y:16, w:9,  pos:"centro"} },
  marca:        { label:"Marca",         front:{x:37, y:31, w:9,  pos:"izq"},    back:{x:50, y:16, w:8,  pos:"centro"} },
  patrocinador: { label:"Patrocinador",  front:{x:50, y:50, w:32, pos:"centro"}, back:{x:50, y:80, w:24, pos:"centro"} },
  parche:       { label:"Parche",        front:{x:18, y:33, w:9,  pos:"libre"},  back:{x:50, y:16, w:9,  pos:"centro"} }
};
// Atajos de posición (vista de frente): izquierda / centro / derecha.
const KIT_IMG_POS_X = { izq:37, centro:50, der:63 };
// Ubicación de cada imagen. Las mangas se dibujan con la inclinación de la manga (26° por defecto,
// editable). "Manga derecha" = la derecha de quien la viste (a la izquierda en la vista de frente).
const KIT_IMG_LOCS = { frente:"Frente", espalda:"Espalda", "manga-der":"Manga derecha", "manga-izq":"Manga izquierda" };
const KIT_SLEEVE_TILT = 26;
const KIT_SLEEVE_DEF = { "manga-der":{x:18, y:29, w:8, rot:KIT_SLEEVE_TILT, pos:"libre"}, "manga-izq":{x:82, y:29, w:8, rot:-KIT_SLEEVE_TILT, pos:"libre"} };
// Borde exterior de la manga (donde se dobla la tela): lo que pasa de esa línea se ve en la otra vista.
// Recta en fracciones del lienzo, medida sobre la silueta de las bases (manga a la izquierda en la vista).
const KIT_SLEEVE_FOLD = { p:{x:0.108, y:0.333}, q:{x:0.208, y:0.143} };
function kitImgDefaults(kind, loc){
  if(KIT_SLEEVE_DEF[loc]) return Object.assign({}, KIT_SLEEVE_DEF[loc]);
  const d=(KIT_IMG_KINDS[kind]||KIT_IMG_KINDS.parche)[loc==="espalda"?"back":"front"];
  return Object.assign({rot:0}, d);
}
// Contexto del editor abierto: dueño de los uniformes y fecha del uniforme (para los patrocinadores vigentes).
let KIT_EDIT_CTX = { teamId:null, date:"" };
function kitEditTeam(){ return KIT_EDIT_CTX.teamId ? getTeam(KIT_EDIT_CTX.teamId) : null; }
function kitDateOf(team, kit){
  if(kit && kit.ownDate && kit.dateStart) return kit.dateStart;
  let s=null; try{ s=(typeof kitSeasonOf==="function") ? kitSeasonOf(team, kit) : null; }catch(e){}
  if(!s && team && window.KIT_ERA_VIEW) s=((team.kitSeasons)||[]).find(x=>x.id===window.KIT_ERA_VIEW)||null;
  return (s && s.date) || (kit && kit.dateStart) || "";
}
function kitImgButtonsHTML(team){
  const tid = team && team.id ? team.id : "";
  // Una sola línea, justo debajo de "+ Agregar capa".
  return `<div class="kit-img-btns" style="display:flex;gap:4px;flex-wrap:nowrap;margin-top:6px;">
    ${Object.keys(KIT_IMG_KINDS).map(k=>`<button type="button" class="btn ghost sm" data-action="add-kit-img" data-kind="${k}" data-team="${escapeHtml(tid)}" style="white-space:nowrap;flex:0 1 auto;min-width:0;padding-left:5px;padding-right:5px;font-size:11px;overflow:hidden;text-overflow:ellipsis;">+ ${KIT_IMG_KINDS[k].label}</button>`).join("")}
  </div>`;
}

/* --- logos del dueño (escudo) --- */
function kitCrestEntity(team){
  if(!team) return null;
  if(!team.isRefereeKits) return team;
  if(typeof REFEREE_KIT_TEAM_ID!=="undefined" && team.id===REFEREE_KIT_TEAM_ID) return DB.event || null;
  const f=(typeof refKitsEntityFor==="function") ? refKitsEntityFor(team.id) : null;
  return f ? f.entity : null;
}
// Bandera del país del dueño (selección, o la selección de una federación en árbitros).
// { data } si el país tiene bandera propia en data URI; { code } (iso) si es de banderas/*.png.
function kitFlagRef(team){
  try{
    let t=null;
    if(team && !team.isRefereeKits && (DB.teams||[]).some(x=>x.id===team.id)) t=team;
    else if(team && team.isRefereeKits && typeof refKitsEntityFor==="function"){ const f=refKitsEntityFor(team.id); if(f && f.kind==="fed") t=(DB.teams||[]).find(x=>x.id===f.id)||null; }
    if(!t || typeof flagSrc!=="function") return null;
    const src=flagSrc(t); if(!src) return null;
    if(/^data:/.test(src)) return { data:src };
    const m=/([a-z0-9-]+)\.png$/i.exec(src); return m ? { code:m[1].toLowerCase() } : null;
  }catch(e){ return null; }
}
// Data URI de una bandera de banderas/*.png: se carga (una sola vez) uniformes/banderas-kit.js.
let _kitFlagsLoading=null;
function kitFlagDataURL(ref){
  if(!ref) return Promise.resolve("");
  if(ref.data) return Promise.resolve(ref.data);
  const get=()=> (window.KIT_FLAGS && window.KIT_FLAGS[ref.code]) || "";
  if(window.KIT_FLAGS) return Promise.resolve(get());
  if(!_kitFlagsLoading){
    _kitFlagsLoading=new Promise(res=>{ const sc=document.createElement("script"); sc.src="uniformes/banderas-kit.js"; sc.onload=()=>res(); sc.onerror=()=>res(); document.head.appendChild(sc); });
  }
  return _kitFlagsLoading.then(get);
}
const KIT_BADGE_ROLES = { central:"FIFA Referee — árbitro central", asistente:"FIFA Referee — árbitro asistente", var:"FIFA Referee — árbitro de video" };
function kitCrestOptions(team){
  const out=[], ent=kitCrestEntity(team);
  if(ent){
    if(ent.logoImg) out.push({v:"dark", label:(team&&team.isRefereeKits)?"Logo — fondo oscuro":"Escudo — fondo oscuro", img:ent.logoImg});
    if(ent.logoImgLight) out.push({v:"light", label:(team&&team.isRefereeKits)?"Logo — fondo claro":"Escudo — fondo claro", img:ent.logoImgLight});
    ((ent && Array.isArray(ent.logoAlts)) ? ent.logoAlts : []).forEach((a,i)=>{ if(a && a.img) out.push({v:"a"+i, label:a.name||("Alt "+(i+1)), img:a.img}); });
  }
  // Selecciones (y federaciones en árbitros): la BANDERA del país en lugar del escudo.
  const fl = kitFlagRef(team);
  if(fl) out.push({v:"flag", label:"Bandera del país", img:fl.data||"", flag:fl});
  if(team && team.isRefereeKits){
    // Federación sin logo propio: el escudo de su selección.
    try{ const f=refKitsEntityFor(team.id); if(f && f.kind==="fed"){ const tm=(DB.teams||[]).find(t=>t.id===f.id); if(tm && tm.logoImg) out.push({v:"sel", label:"Escudo de la selección", img:tm.logoImg}); } }catch(e){}
    Object.keys(KIT_BADGE_ROLES).forEach(r=>out.push({v:"badge:"+r, label:KIT_BADGE_ROLES[r], img:_kitBadgeCache[r]||"", badge:r}));
  }
  return out;
}
// Badge FIFA Referee con el año en curso, compuesto en un lienzo (data URI).
const _kitBadgeCache = {};
async function kitRefereeBadgeDataURL(role){
  if(_kitBadgeCache[role]) return _kitBadgeCache[role];
  const src=(typeof REFEREE_BADGE_DATA!=="undefined") ? REFEREE_BADGE_DATA[role] : null; if(!src) return "";
  const W=(typeof REFEREE_BADGE_W!=="undefined")?REFEREE_BADGE_W:404, Hh=(typeof REFEREE_BADGE_H!=="undefined")?REFEREE_BADGE_H:500;
  const Y=(typeof REFEREE_BADGE_YEAR!=="undefined")?REFEREE_BADGE_YEAR:{size:64, baseline:441, letterSpacing:1.33};
  try{ await document.fonts.load(`700 ${Y.size}px FIFABadgeYear`); }catch(e){}
  const img=await loadImg(src);
  const c=document.createElement("canvas"); c.width=W; c.height=Hh;
  const ctx=c.getContext("2d"); ctx.drawImage(img,0,0,W,Hh);
  const year=(typeof refereeBadgeYear==="function") ? refereeBadgeYear() : String(new Date().getFullYear());
  ctx.font=`700 ${Y.size}px FIFABadgeYear`; ctx.fillStyle="#FFFFFF"; ctx.textAlign="center"; ctx.textBaseline="alphabetic";
  try{ ctx.letterSpacing=Y.letterSpacing+"px"; }catch(e){}
  ctx.fillText(year, W/2 + Y.letterSpacing/2, Y.baseline);
  return (_kitBadgeCache[role]=c.toDataURL("image/png"));
}

/* --- patrocinadores del dueño en la fecha del uniforme --- */
function kitLinkActive(l, date){
  const d=(typeof kitDateExpand==="function") ? kitDateExpand(date) : String(date||"");
  if(!date) return !l.hasta || kitDateExpand(l.hasta) >= new Date().toISOString().slice(0,10);   // sin fecha: los vigentes hoy
  if(l.desde && kitDateExpand(l.desde) > d) return false;
  if(l.hasta && kitDateExpand(l.hasta) < d) return false;
  return true;
}
function kitOwnerLinkMatch(team, l){
  if(!team) return false;
  if(team.isRefereeKits) return (typeof REFEREE_KIT_TEAM_ID!=="undefined" && team.id===REFEREE_KIT_TEAM_ID) ? l.type==="tournament" : false;
  if((DB.teams||[]).some(t=>t.id===team.id)) return l.type==="team" && l.id===team.id;
  return l.type==="club" && normLoose(l.name||"")===normLoose(team.commonName||"");
}
function kitOwnerSponsors(team, date, apparelOnly){
  return (DB.sponsors||[]).filter(sp=>{
    if(apparelOnly && typeof sponsorHasCategory==="function" && !sponsorHasCategory(sp, APPAREL_CATEGORY)) return false;
    const links=(typeof sponsorEffectiveLinks==="function") ? sponsorEffectiveLinks(sp) : (sp.links||[]);
    return links.some(l=>kitOwnerLinkMatch(team,l) && kitLinkActive(l, date));
  }).sort((a,b)=>String(a.name).localeCompare(String(b.name),'es'));
}
// Liga un patrocinador al dueño desde el año del uniforme (si no estaba ligado).
function kitLinkSponsorToOwner(sp, team, date){
  if(!sp || !team || team.isRefereeKits) return;
  if(!Array.isArray(sp.links)) sp.links = (typeof sponsorLinksOf==="function") ? sponsorLinksOf(sp).slice() : [];
  if(sp.links.some(l=>kitOwnerLinkMatch(team,l))) return;
  const esSel=(DB.teams||[]).some(t=>t.id===team.id);
  const link = esSel ? {type:"team", id:team.id, value:0} : {type:"club", name:team.commonName, value:0};
  const y=/^(\d{4})/.exec(String(date||"")); if(y) link.desde=y[1];
  sp.links.push(link);
}
// Marca de ropa de la TEMPORADA del uniforme (p. ej. 2025 Adidas, 2026 Nike, 2027 Adidas); si la temporada
// no tiene marca, la del dueño. Devuelve el patrocinador (se registra como marca de ropa si no existía).
function kitSeasonBrandSponsor(team, seasonId){
  if(!team) return null;
  const s=((team.kitSeasons)||[]).find(x=>x.id===seasonId) || null;
  const name=String((s && s.brand) || team.kitSponsor || "").trim(); if(!name) return null;
  let sp=(DB.sponsors||[]).find(x=>normLoose(x.name||"")===normLoose(name) && (typeof sponsorHasCategory!=="function" || typeof APPAREL_CATEGORY==="undefined" || sponsorHasCategory(x, APPAREL_CATEGORY)))
       || (DB.sponsors||[]).find(x=>normLoose(x.name||"")===normLoose(name));
  if(!sp && typeof ensureApparelBrandSponsor==="function"){ try{ sp=ensureApparelBrandSponsor(name); }catch(e){} }
  return sp||null;
}
// Al cambiar la marca de una temporada, los logos de MARCA de sus uniformes pasan a la nueva marca
// (misma versión del logo si existe).
function kitSeasonApplyBrand(team, seasonId){
  const sp=kitSeasonBrandSponsor(team, seasonId); if(!sp) return 0;
  let n=0;
  (team.kits||[]).filter(k=>k.seasonId===seasonId).forEach(k=>{
    ["images","backImages"].forEach(f=>{ (k[f]||[]).forEach(im=>{
      if(im.kind!=="marca" || im.sponsorId===sp.id) return;
      const opts=kitBrandOptions(sp); const o=opts.find(x=>x.v===im.variant)||opts[0];
      im.sponsorId=sp.id; im.variant=o?o.v:undefined; im.img=o?o.img:""; n++;
    }); });
  });
  return n;
}
function kitBrandOptions(sp){
  if(!sp) return [];
  const out=[], has=(v)=>{ const o=v.charAt(0), b=v.charAt(1); return typeof logoSlot==="function" ? logoSlot(sp, o, b==="l"?"l":"d") : null; };
  [["hd","Horizontal — fondo oscuro"],["hl","Horizontal — fondo claro"],["vd","Vertical — fondo oscuro"],["vl","Vertical — fondo claro"]].forEach(([v,l])=>{ const s=has(v); if(s) out.push({v,label:l,img:s}); });
  if(!out.length && sp.logoImg) out.push({v:"main", label:"Logo", img:sp.logoImg});
  ((Array.isArray(sp.logoAlts)) ? sp.logoAlts : []).forEach((a,i)=>{ if(a && a.img) out.push({v:"a"+i, label:a.name||("Alt "+(i+1)), img:a.img}); });
  return out;
}
function kitOptsHTML(opts, sel){
  return opts.map(o=>`<option value="${escapeHtml(o.v)}" ${o.v===sel?"selected":""}>${escapeHtml(o.label)}</option>`).join("");
}
function kitBrandSelectHTML(im){
  const team=kitEditTeam();
  const list=kitOwnerSponsors(team, KIT_EDIT_CTX.date, im.kind==="marca");
  // La marca de la temporada del uniforme siempre aparece en la lista (aunque no esté ligada con fechas).
  if(im.kind==="marca"){ const ssp=kitSeasonBrandSponsor(team, KIT_EDIT_CTX.seasonId); if(ssp && !list.some(s=>s.id===ssp.id)) list.unshift(ssp); }
  const cur=im.sponsorId ? (DB.sponsors||[]).find(s=>s.id===im.sponsorId) : null;
  if(cur && !list.some(s=>s.id===cur.id)) list.unshift(cur);
  return `<select class="kit-img-brand" style="font-size:11px;padding:2px 4px;min-width:0;flex:1;">
      <option value="">${im.kind==="marca"?"— Marca —":"— Patrocinador —"}</option>
      ${list.map(sp=>`<option value="${escapeHtml(sp.id)}" ${cur&&sp.id===cur.id?"selected":""}>${escapeHtml(sp.name)}</option>`).join("")}
      <option value="__add__">+ Agregar…</option>
    </select>`;
}
function kitImgRowHTML(im){
  im = im || {kind:"parche", img:"", x:50, y:50, w:10};
  const def = KIT_IMG_KINDS[im.kind] || KIT_IMG_KINDS.parche;
  const loc = KIT_IMG_LOCS[im.loc] ? im.loc : "frente";
  const dd = kitImgDefaults(im.kind, loc);
  // Posición y tamaño en DÉCIMAS de porcentaje (0–1000, paso 1 = 0.1 %): más fino que antes. Se guarda en %,
  // así que lo ya posicionado no cambia. La inclinación va en grados.
  const num = (cls, label, val, min, max, deci) => `<label style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted);font-weight:700;white-space:nowrap;">${label}
      <input type="number" class="${cls} kit-modal-control" value="${deci===false?val:Math.round((+val||0)*10)}" min="${deci===false?min:min*10}" max="${deci===false?max:max*10}" step="1" style="width:58px;font-size:11px;padding:2px 4px;"></label>`;
  let brand="", variant="";
  if(im.kind==="marca" || im.kind==="patrocinador"){
    brand = kitBrandSelectHTML(im)
      + `<span class="kit-img-addbrand" style="display:none;gap:4px;align-items:center;flex:1;min-width:0;">
           <input type="text" class="kit-img-brandname" list="kit-img-brandlist" placeholder="Nombre" style="font-size:11px;padding:2px 4px;min-width:0;flex:1;">
           <button type="button" class="btn ghost sm" data-action="kit-img-add-brand" style="padding:2px 7px;">Agregar</button></span>`;
    const sp=im.sponsorId ? (DB.sponsors||[]).find(s=>s.id===im.sponsorId) : null;
    const opts=kitBrandOptions(sp);
    variant = sp ? `<select class="kit-img-variant kit-modal-control" style="font-size:11px;padding:2px 4px;min-width:0;max-width:100%;">${opts.length?kitOptsHTML(opts, im.variant):'<option value="">(sin logo: sube un PNG)</option>'}</select>` : "";
  } else if(im.kind==="escudo"){
    const opts=kitCrestOptions(kitEditTeam());
    variant = `<select class="kit-img-variant kit-modal-control" style="font-size:11px;padding:2px 4px;min-width:0;max-width:100%;">${opts.length?kitOptsHTML(opts, im.variant):'<option value="">(sin escudo: sube un PNG)</option>'}</select>`;
  }
  const pos = im.pos || dd.pos;
  const col = im.color || "orig";
  const abierto = !!im._abierto;
  // Cuadro compacto en DOS LÍNEAS (miniatura · tipo y nombre · resumen de posición) que se despliega para editar.
  return `
  <div class="kit-img-row${abierto?" abierto":""}" data-kind="${escapeHtml(im.kind)}" data-img="${im.img||''}" data-sp="${escapeHtml(im.sponsorId||'')}" style="padding:6px 7px;border:1px solid var(--line);border-radius:8px;min-width:0;">
    <div class="kit-img-head" data-action="toggle-kit-img" style="display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:6px;align-items:center;cursor:pointer;">
      <div class="kit-img-thumb" style="width:32px;height:32px;background:var(--surface-2);border-radius:6px;overflow:hidden;">
        ${im.img?`<img src="${im.img}" style="width:100%;height:100%;object-fit:contain;">`:''}
      </div>
      <div style="min-width:0;line-height:1.25;">
        <div style="font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(def.label)}</div>
        <div class="kit-img-resumen" style="font-size:10px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(kitImgResumen(Object.assign({pos}, im, {loc, x:im.x!=null?im.x:dd.x, y:im.y!=null?im.y:dd.y, w:im.w!=null?im.w:dd.w, rot:im.rot!=null?im.rot:dd.rot, color:col})))}">${kitImgResumenCorto(Object.assign({pos}, im, {loc, w:im.w!=null?im.w:dd.w}))}</div>
      </div>
      <span style="display:flex;flex-direction:column;align-items:center;gap:2px;">
        <button type="button" class="btn danger sm" data-action="remove-kit-img" style="padding:1px 6px;font-size:10px;line-height:1.3;">✕</button>
        <span class="kit-img-chev mono" style="color:var(--muted);font-size:11px;line-height:1;">${abierto?"▾":"▸"}</span>
      </span>
    </div>
    <div class="kit-img-body" style="display:${abierto?"flex":"none"};flex-direction:column;gap:5px;margin-top:8px;min-width:0;">
      ${brand?`<div style="display:flex;align-items:center;gap:6px;min-width:0;">${brand}</div>`:""}
      ${variant}
      <input type="file" accept="image/png" data-kitimgfile style="font-size:10px;min-width:0;max-width:100%;">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        <select class="kit-img-loc kit-modal-control" title="Ubicación" style="font-size:11px;padding:2px 4px;">
          ${Object.keys(KIT_IMG_LOCS).map(k=>`<option value="${k}" ${k===loc?"selected":""}>${KIT_IMG_LOCS[k]}</option>`).join("")}
        </select>
        <select class="kit-img-pos" title="Posición" style="font-size:11px;padding:2px 4px;">
          <option value="izq" ${pos==="izq"?"selected":""}>Izquierda</option>
          <option value="centro" ${pos==="centro"?"selected":""}>Centro</option>
          <option value="der" ${pos==="der"?"selected":""}>Derecha</option>
          <option value="libre" ${pos==="libre"?"selected":""}>Libre</option>
        </select>
      </div>
      ${kitImgColorHTML(col)}
      <div class="kit-img-ol" style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
        <label style="display:flex;align-items:center;gap:5px;font-size:11px;font-weight:700;white-space:nowrap;">
          <input type="checkbox" class="kit-img-ol-on kit-modal-control" style="width:auto;margin:0;" ${im.outline?"checked":""}> Contorno
        </label>
        ${colorPickerHTML("kit-img-ol-color kit-modal-control color-square-sm", im.olColor||"#000000")}
        <label style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted);font-weight:700;">Grosor
          <input type="number" class="kit-img-ol-w kit-modal-control" min="1" max="12" step="1" value="${im.olW||3}" style="width:52px;font-size:11px;padding:2px 4px;"></label>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
        ${num("kit-img-x","X",im.x!=null?im.x:dd.x,0,100)}
        ${num("kit-img-y","Y",im.y!=null?im.y:dd.y,0,100)}
        ${num("kit-img-w","Tamaño",im.w!=null?im.w:dd.w,1,100)}
        ${num("kit-img-rot","Inclinación °",im.rot!=null?im.rot:dd.rot,-180,180,false)}
      </div>
    </div>
  </div>`;
}
// Recolorear: originales, los 3 colores del uniforme (como las capas), uno de los colores del uniforme
// (muestras con el color actual) u otro color en código hex.
function kitEdKitColor(n){ const el=document.getElementById("f-kit-color"+n); return (el && el.value) || "#888888"; }
// Color de la imagen, en una línea: Original · los 3 colores del uniforme (muestras) · nuevo color (hex).
function kitImgColorHTML(col){
  const hex = /^#[0-9a-f]{6}$/i.test(col||"") ? col : null;
  const v = hex ? hex : (["c1","c2","c3","3c"].includes(col) ? col : "orig");
  const sw=n=>`<button type="button" class="kit-img-sw${v==="c"+n?" on":""}" data-action="kit-img-color" data-val="c${n}" data-c="${n}" title="Color ${n} del uniforme" style="background:${kitEdKitColor(n)};"></button>`;
  return `<div class="kit-img-colores" title="Recolorear">
      <input type="hidden" class="kit-img-color" value="${escapeHtml(v)}">
      <span style="font-size:10px;color:var(--muted);font-weight:700;">Color</span>
      <button type="button" class="btn ghost sm kit-img-sw-btn${v==="orig"?" on":""}" data-action="kit-img-color" data-val="orig">Original</button>
      ${sw(1)}${sw(2)}${sw(3)}
      <span class="kit-img-hex${hex?" on":""}" style="display:inline-flex;align-items:center;gap:4px;">
        <input type="color" class="kit-img-hex-picker" value="${hex||"#ffffff"}" title="Nuevo color">
        <input type="text" class="kit-img-hex-text mono" value="${hex?hex.toUpperCase():""}" placeholder="#HEX" maxlength="7" spellcheck="false" style="width:68px;font-size:11px;padding:2px 4px;">
      </span>
    </div>`;
}
function kitImgSetColor(row, val){
  const h=row.querySelector(".kit-img-color"); if(h) h.value=val;
  row.querySelectorAll("[data-action=kit-img-color]").forEach(x=>x.classList.toggle("on", x.dataset.val===val));
  const hx=row.querySelector(".kit-img-hex"); if(hx) hx.classList.toggle("on", /^#/.test(val));
  kitImgActualizarResumen(row);
  refreshKitModalPreview();
}
// Las muestras siguen a los colores del uniforme mientras se editan.
function kitImgActualizarMuestras(){
  document.querySelectorAll(".kit-img-sw[data-c]").forEach(b=>{ b.style.background=kitEdKitColor(b.dataset.c); });
}
document.addEventListener("input", (e)=>{
  const t=e.target; if(!t || !t.matches) return;
  const row=t.closest && t.closest(".kit-img-row"); if(!row) return;
  if(t.matches(".kit-img-hex-picker")){ const tx=row.querySelector(".kit-img-hex-text"); if(tx) tx.value=t.value.toUpperCase(); kitImgSetColor(row, t.value.toLowerCase()); }
  else if(t.matches(".kit-img-hex-text")){ let v=t.value.trim(); if(v && v[0]!=="#") v="#"+v; if(/^#[0-9a-f]{6}$/i.test(v)){ const pk=row.querySelector(".kit-img-hex-picker"); if(pk) pk.value=v.toLowerCase(); kitImgSetColor(row, v.toLowerCase()); } }
});
const KIT_IMG_POS_LBL = { izq:"Izquierda", centro:"Centro", der:"Derecha", libre:"Libre" };
const KIT_IMG_COLOR_LBL = { orig:"", "3c":" · 3 colores", c1:" · color 1", c2:" · color 2", c3:" · color 3" };
function kitImgNombreTxt(im){
  if(im.sponsorId){ const sp=(DB.sponsors||[]).find(s=>s.id===im.sponsorId); if(sp) return sp.name; }
  if(im.kind==="escudo" && im.variant){ const o=kitCrestOptions(kitEditTeam()).find(x=>x.v===im.variant); if(o) return o.label; }
  return "";
}
function kitImgNombre(im){ const n=kitImgNombreTxt(im); return n ? " · "+escapeHtml(n) : ""; }
// Segunda línea del cuadro plegado: el nombre (marca, patrocinador o qué escudo); si no hay, posición y tamaño.
function kitImgResumenCorto(im){
  const n=kitImgNombreTxt(im);
  const donde = KIT_IMG_LOCS[im.loc]||"Frente";
  return escapeHtml(n ? `${n} · ${donde}` : `${donde} · ${Math.round((+im.w||0)*10)/10}%`);
}
function kitImgResumen(im){
  const f=v=>String(Math.round((+v||0)*10)/10);
  const colLbl = /^#/.test(im.color||"") ? " · "+im.color.toUpperCase() : (KIT_IMG_COLOR_LBL[im.color]||"");
  return `${KIT_IMG_LOCS[im.loc]||"Frente"} · ${KIT_IMG_POS_LBL[im.pos]||"Libre"} · X ${f(im.x)} · Y ${f(im.y)} · ${f(im.w)}%${im.rot?` · ${f(im.rot)}°`:""}${colLbl}`;
}
function kitImgActualizarResumen(row){
  const im=readKitImgRow(row);
  const r=row.querySelector(".kit-img-resumen"); if(r){ r.innerHTML=kitImgResumenCorto(im); r.title=kitImgResumen(im); }
}
function readKitImgRow(row){
  const n=(cls,d)=>{ const v=parseFloat((row.querySelector(cls)||{}).value); return isNaN(v)?d:v; };
  const p=(cls,d)=>{ const v=parseFloat((row.querySelector(cls)||{}).value); return isNaN(v)?d:v/10; };   // décimas de % → %
  const o={ kind:row.dataset.kind||"parche", img:row.dataset.img||"", x:p(".kit-img-x",50), y:p(".kit-img-y",50), w:Math.max(0.1,p(".kit-img-w",10)),
            rot:n(".kit-img-rot",0), loc:((row.querySelector(".kit-img-loc")||{}).value)||"frente",
            pos:((row.querySelector(".kit-img-pos")||{}).value)||"libre" };
  const c=row.querySelector(".kit-img-color"); if(c && c.value && c.value!=="orig") o.color=c.value;   // "3c" | "c1".."c3" | "#rrggbb"
  // Contorno (p. ej. el logo de la marca de ropa): color y grosor en px del lienzo de 540.
  const ol=row.querySelector(".kit-img-ol-on");
  if(ol && ol.checked){ o.outline=true; o.olColor=(row.querySelector(".kit-img-ol-color")||{}).value||"#000000"; const w=parseFloat((row.querySelector(".kit-img-ol-w")||{}).value); o.olW=isNaN(w)?3:Math.max(1,Math.min(12,w)); }
  const v=row.querySelector(".kit-img-variant"); if(v && v.value) o.variant=v.value;
  if(row.dataset.sp) o.sponsorId=row.dataset.sp;
  return o;
}
// Al PEGAR escudos y logos de otro uniforme solo se copian las posiciones: el escudo y la marca se toman del
// dueño de ESTE uniforme (misma variante si existe), el patrocinador solo si también es suyo en esta fecha;
// los parches (PNG genéricos) se conservan.
function kitImgsAdaptar(images, team, date, seasonId){
  const brands = kitOwnerSponsors(team, date, true), sps = kitOwnerSponsors(team, date, false);
  const seasonBrand = kitSeasonBrandSponsor(team, seasonId!==undefined ? seasonId : (KIT_EDIT_CTX && KIT_EDIT_CTX.seasonId));
  return (images||[]).map(src=>{
    const im = Object.assign({}, src);
    if(im.kind==="escudo"){
      const opts = kitCrestOptions(team);
      const o = opts.find(x=>x.v===im.variant && !x.badge) || opts.find(x=>x.v===im.variant) || opts[0];
      im.variant = o ? o.v : undefined; im.img = o ? (o.img||"") : "";
      if(o && (o.flag || o.badge) && !im.img) im._pendiente = true;   // bandera / badge: se resuelve aparte (asíncrono)
    } else if(im.kind==="marca"){
      // La marca de la temporada del uniforme manda (2025 Adidas, 2026 Nike…).
      const sp = seasonBrand || brands.find(b=>b.id===im.sponsorId) || brands.find(b=>team && team.kitSponsor && normLoose(b.name)===normLoose(team.kitSponsor)) || brands[0];
      const opts = kitBrandOptions(sp);
      const o = opts.find(x=>x.v===im.variant) || opts[0];
      im.sponsorId = sp ? sp.id : undefined; im.variant = o ? o.v : undefined; im.img = o ? o.img : "";
    } else if(im.kind==="patrocinador"){
      const sp = sps.find(b=>b.id===im.sponsorId);
      if(sp){ const opts=kitBrandOptions(sp); const o=opts.find(x=>x.v===im.variant)||opts[0]; im.variant=o?o.v:undefined; im.img=o?o.img:""; }
      else { delete im.sponsorId; delete im.variant; im.img=""; }
    }
    return im;
  });
}
function readKitImgRows(container){
  if(!container) return [];
  return Array.from(container.querySelectorAll(".kit-img-row")).map(readKitImgRow).filter(o=>o.img);
}
function kitImgSetImg(row, src){
  row.dataset.img = src||"";
  const th=row.querySelector(".kit-img-thumb"); if(th) th.innerHTML = src ? `<img src="${src}" style="width:100%;height:100%;object-fit:contain;">` : "";
}
// Aplica la variante elegida (escudo / logo de la marca) a la fila.
async function kitImgApplyVariant(row){
  const sel=row.querySelector(".kit-img-variant"); if(!sel) return;
  const v=sel.value, kind=row.dataset.kind;
  let src="";
  if(kind==="escudo"){
    const o=kitCrestOptions(kitEditTeam()).find(x=>x.v===v);
    if(o) src = o.badge ? await kitRefereeBadgeDataURL(o.badge) : (o.flag ? await kitFlagDataURL(o.flag) : o.img);
  } else {
    const sp=(DB.sponsors||[]).find(s=>s.id===row.dataset.sp);
    const o=kitBrandOptions(sp).find(x=>x.v===v); if(o) src=o.img;
  }
  kitImgSetImg(row, src);
  refreshKitModalPreview();
}
// Rehace la fila (p. ej. al cambiar de marca) conservando posición y tamaño.
function kitImgRebuildRow(row, patch){
  const cur=readKitImgRow(row);
  const im=Object.assign({ kind:row.dataset.kind, _abierto:row.classList.contains("abierto") }, cur, patch||{});
  const tmp=document.createElement("div"); tmp.innerHTML=kitImgRowHTML(im);
  const nr=tmp.firstElementChild; row.replaceWith(nr); return nr;
}
// PNG subido en una fila: escudo → alternativos del dueño; marca/patrocinador → alternativos de la marca.
function kitImgUploaded(row, dataUrl){
  const kind=row.dataset.kind;
  const pushAlt=(ent)=>{ if(!ent) return null; if(!Array.isArray(ent.logoAlts)) ent.logoAlts=[]; ent.logoAlts.push({ name:"Alt "+(ent.logoAlts.length+1), img:dataUrl }); return "a"+(ent.logoAlts.length-1); };
  let nr=row;
  if(kind==="escudo"){
    const v=pushAlt(kitCrestEntity(kitEditTeam()));
    if(v){ nr=kitImgRebuildRow(row, { variant:v, img:dataUrl }); try{ persist(); }catch(e){} }
  } else if((kind==="marca"||kind==="patrocinador") && row.dataset.sp){
    const sp=(DB.sponsors||[]).find(s=>s.id===row.dataset.sp);
    const v=pushAlt(sp);
    if(v){ nr=kitImgRebuildRow(row, { variant:v, img:dataUrl }); try{ persist(); }catch(e){} }
  }
  kitImgSetImg(nr, dataUrl);
  refreshKitModalPreview();
}
document.addEventListener("change", (e)=>{
  const t=e.target; if(!t || !t.closest) return;
  const row=t.closest(".kit-img-row"); if(!row) return;
  if(t.matches(".kit-img-brand")){
    const add=row.querySelector(".kit-img-addbrand");
    if(t.value==="__add__"){ if(add){ add.style.display="flex"; const i=add.querySelector("input"); if(i) i.focus(); } t.value=row.dataset.sp||""; return; }
    if(add) add.style.display="none";
    const sp=(DB.sponsors||[]).find(s=>s.id===t.value);
    const opts=kitBrandOptions(sp);
    const nr=kitImgRebuildRow(row, { sponsorId:t.value||undefined, variant:opts[0]?opts[0].v:undefined, img:opts[0]?opts[0].img:"" });
    if(!t.value) nr.dataset.sp="";
    refreshKitModalPreview();
  } else if(t.matches(".kit-img-variant")){
    if(t.value==="flag") kitImgSetColor(row, "orig");   // la bandera va con sus colores
    kitImgApplyVariant(row);
  } else if(t.matches(".kit-img-loc")){
    // Nueva ubicación: posición, tamaño e inclinación por defecto de ese lugar (las mangas, a 26°).
    const d=kitImgDefaults(row.dataset.kind, t.value);
    [["x",".kit-img-x",10],["y",".kit-img-y",10],["w",".kit-img-w",10],["rot",".kit-img-rot",1]].forEach(([k,c,f])=>{ const el=row.querySelector(c); if(el && d[k]!=null) el.value=Math.round(d[k]*f); });
    const ps=row.querySelector(".kit-img-pos"); if(ps) ps.value=d.pos||"libre";
    refreshKitModalPreview();
  } else if(t.matches(".kit-img-pos")){
    const x=KIT_IMG_POS_X[t.value]; const xi=row.querySelector(".kit-img-x");
    if(x!=null && xi){ xi.value=x*10; refreshKitModalPreview(); }
  }
});
document.addEventListener("input", (e)=>{
  const t=e.target; if(!t || !t.closest) return;
  const row=t.closest(".kit-img-row"); if(!row) return;
  if(t.matches(".kit-img-x")){ const p=row.querySelector(".kit-img-pos"); if(p){ const x=parseFloat(t.value)/10; const k=Object.keys(KIT_IMG_POS_X).find(k=>KIT_IMG_POS_X[k]===x); p.value=k||"libre"; } }
  kitImgActualizarResumen(row);
});
document.addEventListener("change", (e)=>{ const t=e.target; const row=t && t.closest && t.closest(".kit-img-row"); if(row && row.isConnected) kitImgActualizarResumen(row); });
// Dibuja las imágenes (centro x/y y ancho en % del lienzo; alto proporcional), en el orden de la lista.
// Fuente ya recoloreada de una imagen. Recolorear: "3c" = como las capas (los 3 colores del uniforme);
// "c1"/"c2"/"c3" = toda la imagen en ese color (conserva la transparencia); sin valor = originales.
async function kitImgSource(im, kit){
  const li = await loadImg(im.img);
  const iw = li.naturalWidth||li.width||1, ih = li.naturalHeight||li.height||1;
  let src = li;
  const baseKey = im.img.length + ":" + im.img.slice(-48);
  if(kit && im.color==="3c"){
    src = await recolorToCanvas(im.img, kit.color1, kit.color2, kit.color3, iw, ih);
  } else if(kit && (/^c[123]$/.test(im.color||"") || /^#[0-9a-f]{6}$/i.test(im.color||""))){
    const c=document.createElement("canvas"); c.width=iw; c.height=ih; const cx=c.getContext("2d");
    const fill = im.color.charAt(0)==="#" ? im.color : (kit["color"+im.color.charAt(1)]||"#ffffff");
    cx.drawImage(li,0,0,iw,ih); cx.globalCompositeOperation="source-in"; cx.fillStyle=fill; cx.fillRect(0,0,iw,ih);
    src = c;
  }
  try{ src.__kitKey = baseKey + "|" + (im.color||"orig") + "|" + (kit?[kit.color1,kit.color2,kit.color3].join(","):""); }catch(e){}
  return { src, iw, ih };
}
// Reducción de ALTA CALIDAD: el navegador, al reducir mucho una imagen de un solo golpe (un escudo de 600 px
// dibujado a 60 px), toma pocas muestras y el resultado sale dentado. Aquí se reduce a la mitad en pasos
// sucesivos (como un mipmap) hasta llegar al tamaño final, que es como queda un PNG bien exportado.
const _kitHQCache = new Map();
function kitHQScale(src, iw, ih, tw, th){
  tw=Math.max(1,Math.round(tw)); th=Math.max(1,Math.round(th));
  if(tw>=iw*0.75 && th>=ih*0.75) return src;          // casi el mismo tamaño: se dibuja directo
  const key = (src.__kitKey||"") + "|" + tw + "x" + th;
  if(src.__kitKey && _kitHQCache.has(key)) return _kitHQCache.get(key);
  let cur=src, cw=iw, ch=ih;
  while(cw/2 >= tw && ch/2 >= th){
    const nw=Math.max(tw, Math.floor(cw/2)), nh=Math.max(th, Math.floor(ch/2));
    const c=document.createElement("canvas"); c.width=nw; c.height=nh;
    const x=c.getContext("2d"); x.imageSmoothingEnabled=true; x.imageSmoothingQuality="high";
    x.drawImage(cur, 0, 0, cw, ch, 0, 0, nw, nh);
    cur=c; cw=nw; ch=nh;
  }
  const f=document.createElement("canvas"); f.width=tw; f.height=th;
  const fx=f.getContext("2d"); fx.imageSmoothingEnabled=true; fx.imageSmoothingQuality="high";
  fx.drawImage(cur, 0, 0, cw, ch, 0, 0, tw, th);
  if(src.__kitKey){ if(_kitHQCache.size>120) _kitHQCache.clear(); _kitHQCache.set(key, f); }
  return f;
}
// Contorno alrededor de una imagen (ya reducida a su tamaño final): la silueta en el color del contorno,
// repetida en círculo alrededor, y la imagen encima. Devuelve el lienzo con margen y ese margen (px).
function kitOutlined(src, w, h, color, px){
  const r=Math.max(1, Math.round(px)), W=Math.round(w)+2*r, H=Math.round(h)+2*r;
  const sil=document.createElement("canvas"); sil.width=Math.round(w); sil.height=Math.round(h);
  const sx=sil.getContext("2d"); sx.drawImage(src,0,0,sil.width,sil.height); sx.globalCompositeOperation="source-in"; sx.fillStyle=color||"#000"; sx.fillRect(0,0,sil.width,sil.height);
  const c=document.createElement("canvas"); c.width=W; c.height=H; const x=c.getContext("2d");
  const pasos=Math.max(16, r*8);
  for(let i=0;i<pasos;i++){ const a=i/pasos*Math.PI*2; x.drawImage(sil, r+Math.cos(a)*r, r+Math.sin(a)*r); }
  x.drawImage(sil, r, r);
  x.drawImage(src, r, r, sil.width, sil.height);
  return { c, r };
}
// Matriz de la imagen en el lienzo: centro (x, y), inclinación rot (grados) y ancho w (% del lienzo).
function kitImgMatrix(im, size, iw, ih){
  const w = size*(im.w||10)/100, h = w*ih/iw;
  return { m: new DOMMatrix().translate(size*(im.x!=null?im.x:50)/100, size*(im.y!=null?im.y:50)/100).rotate(im.rot||0), w, h };
}
// Recta del borde de la manga en píxeles. mirror=true → la manga del otro lado de la imagen.
function kitSleeveFold(size, mirror){
  const f=KIT_SLEEVE_FOLD, X=v=>mirror ? (1-v)*size : v*size;
  return { p:{x:X(f.p.x), y:f.p.y*size}, q:{x:X(f.q.x), y:f.q.y*size} };
}
// Recorta al lado de la PRENDA respecto de la recta (el lado donde queda el centro del lienzo).
function kitClipToShirtSide(ctx, size, fold){
  const {p,q}=fold, dx=q.x-p.x, dy=q.y-p.y, L=Math.hypot(dx,dy)||1, nx=-dy/L, ny=dx/L;
  const side = ((size/2-p.x)*nx + (size/2-p.y)*ny) >= 0 ? 1 : -1;
  const far=size*4, ox=nx*side*far, oy=ny*side*far, ex=dx/L*far, ey=dy/L*far;
  ctx.beginPath();
  ctx.moveTo(p.x-ex, p.y-ey); ctx.lineTo(p.x+ex, p.y+ey); ctx.lineTo(p.x+ex+ox, p.y+ey+oy); ctx.lineTo(p.x-ex+ox, p.y-ey+oy); ctx.closePath();
  ctx.clip();
}
// Reflexión respecto de una recta (como DOMMatrix).
function kitReflectAcross(fold){
  const {p,q}=fold, dx=q.x-p.x, dy=q.y-p.y, L=Math.hypot(dx,dy)||1, ux=dx/L, uy=dy/L;
  const a=2*ux*ux-1, b=2*ux*uy, d=2*uy*uy-1;
  return new DOMMatrix([a, b, b, d, p.x - (a*p.x + b*p.y), p.y - (b*p.x + d*p.y)]);
}
// Dibuja las imágenes de una vista ("frente" | "espalda"). Solo pintan sobre la prenda (source-atop).
// Mangas: en el frente se ve la parte de este lado del borde de la manga; lo que pasa del borde se ve en la
// espalda, sobre la misma manga (que ahí queda del otro lado), como si la tela se doblara en ese borde.
async function drawKitImages(ctx, size, list, kit, vista){
  vista = vista || "frente";
  for(const im of (list||[])){
    if(!im || !im.img) continue;
    const loc = im.loc || "frente";
    const manga = loc==="manga-der" || loc==="manga-izq";
    if(!manga && loc!==vista) continue;
    try{
      const srcInfo = await kitImgSource(im, kit);
      const { iw, ih } = srcInfo;
      const { m, w, h } = kitImgMatrix(im, size, iw, ih);
      let src = kitHQScale(srcInfo.src, iw, ih, w, h);   // reducida en pasos: bordes limpios
      let dw=w, dh=h;
      if(im.outline){ const k=size/540, o=kitOutlined(src, w, h, im.olColor, (im.olW||3)*k); src=o.c; dw=w+2*o.r; dh=h+2*o.r; }
      ctx.save();
      ctx.globalCompositeOperation = "source-atop";
      if(!manga){
        ctx.setTransform(m); ctx.drawImage(src, -dw/2, -dh/2, dw, dh);
      } else {
        // La manga derecha de quien la viste está a la izquierda en el frente y a la derecha en la espalda.
        const izqEnFrente = (loc==="manga-der");
        if(vista==="frente"){
          kitClipToShirtSide(ctx, size, kitSleeveFold(size, !izqEnFrente));
          ctx.setTransform(m); ctx.drawImage(src, -dw/2, -dh/2, dw, dh);
        } else {
          const foldB = kitSleeveFold(size, izqEnFrente);          // la misma manga, vista por detrás
          kitClipToShirtSide(ctx, size, foldB);
          const espejo = new DOMMatrix([-1,0,0,1,size,0]);
          ctx.setTransform(kitReflectAcross(foldB).multiply(espejo).multiply(m));
          ctx.drawImage(src, -dw/2, -dh/2, dw, dh);
        }
      }
      ctx.restore();
    }catch(e){ try{ ctx.restore(); }catch(_){} }
  }
}
/* --- Número al frente (selecciones): misma tipografía, color y contorno que el número del dorso --- */
function kitIsNationalTeam(team){ return !!(team && !team.isRefereeKits && (DB.teams||[]).some(t=>t.id===team.id)); }
function frontNumberFieldsHTML(kit){
  const fn=kit.frontNumber||{};
  const num=(id,label,val,min,max)=>`<label style="display:flex;align-items:center;gap:4px;font-size:10px;color:var(--muted);font-weight:700;white-space:nowrap;">${label}
      <input type="number" id="${id}" class="kit-modal-control" value="${Math.round((+val||0)*10)}" min="${min*10}" max="${max*10}" step="1" style="width:58px;font-size:11px;padding:2px 4px;"></label>`;   // décimas de %
  return `<div data-kit-number-only="1" style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:8px;padding:8px;border:1px solid var(--line);border-radius:8px;">
      <label style="display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;white-space:nowrap;"><input type="checkbox" id="f-kit-frontnum-on" class="kit-modal-control" style="width:auto;" ${fn.on?"checked":""}> Número al frente</label>
      ${num("f-kit-frontnum-x","X",fn.x!=null?fn.x:50,0,100)}
      ${num("f-kit-frontnum-y","Y",fn.y!=null?fn.y:37,0,100)}
      ${num("f-kit-frontnum-h","Tamaño",fn.h!=null?fn.h:12,1,60)}
    </div>`;
}
// Estilo propio del número frontal (pestaña "Número y nombre"): desactivado = igual al número del dorso.
// La posición y el tamaño se siguen moviendo desde "Escudos, logos y parches".
function frontNumberStyleHTML(kit){
  const fn=kit.frontNumber||{}, own=!!fn.ownStyle;
  const font=fn.fontId||kit.backNumberFontId, col=fn.color||kit.backNumberColor, ol=own?!!fn.outline:!!kit.backNumberOutline;
  const olc=fn.outlineColor||kit.backNumberOutlineColor||"#000000", olw=fn.outlineWidth!=null?fn.outlineWidth:(kit.backNumberOutlineWidth!=null?kit.backNumberOutlineWidth:4);
  const ls=fn.letterSpacing!=null?fn.letterSpacing:(kit.backNumberLetterSpacing||0);
  return `<div class="kit-frontnum-style" data-kit-number-only="1" style="border:1px solid var(--line);border-radius:8px;padding:8px 12px;margin:0 0 14px;">
      <label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:700;">
        <input type="checkbox" id="f-kit-frontnum-own" class="kit-modal-control" style="width:auto;margin:0;" ${own?"checked":""}> Número frontal con estilo propio
        <span style="font-weight:400;color:var(--muted);font-size:11px;">(desactivado = igual al del dorso; posición y tamaño en “Escudos, logos y parches”)</span>
      </label>
      <div class="kit-frontnum-style-body" style="display:${own?"flex":"none"};gap:14px;flex-wrap:wrap;align-items:flex-end;margin-top:10px;">
        ${DB.numberFonts.length ? `<label class="field" style="flex:1;min-width:130px;">Tipografía
          <select id="f-kit-frontnum-font" class="kit-modal-control">${DB.numberFonts.map(f=>`<option value="${f.id}" ${f.id===font?"selected":""}>${numberFontLabel(f)}</option>`).join("")}</select>
        </label>` : ""}
        ${colorPickerHTML("kit-modal-control color-square-sm", col, "f-kit-frontnum-color")}
        <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;padding-bottom:9px;">
          <input type="checkbox" id="f-kit-frontnum-outline" class="kit-modal-control" style="width:auto;" ${ol?"checked":""}> Contorno
        </label>
        ${colorPickerHTML("kit-modal-control color-square-sm", olc, "f-kit-frontnum-outline-color")}
        <label class="field" style="width:70px;">Grosor
          <input type="number" id="f-kit-frontnum-outline-width" class="kit-modal-control" min="0" max="12" step="1" value="${olw}">
        </label>
        <label class="field" style="width:100px;">Interletrado
          <input type="number" id="f-kit-frontnum-letterspacing" class="kit-modal-control" min="-20" max="20" step="1" value="${ls}">
        </label>
      </div>
    </div>`;
}
document.addEventListener("change", (e)=>{
  if(!(e.target && e.target.id==="f-kit-frontnum-own")) return;
  const b=document.querySelector(".kit-frontnum-style-body"); if(b) b.style.display = e.target.checked ? "flex" : "none";
});
function readFrontNumberFields(){
  const on=document.getElementById("f-kit-frontnum-on"); if(!on) return undefined;
  const v=(id,d)=>{ const x=parseFloat((document.getElementById(id)||{}).value); return isNaN(x)?d:x/10; };
  const o={ on:!!on.checked, x:v("f-kit-frontnum-x",50), y:v("f-kit-frontnum-y",37), h:Math.max(0.1,v("f-kit-frontnum-h",12)) };
  const own=document.getElementById("f-kit-frontnum-own");
  if(own && own.checked){
    const g=id=>document.getElementById(id);
    o.ownStyle=true;
    if(g("f-kit-frontnum-font")) o.fontId=g("f-kit-frontnum-font").value;
    o.color=(g("f-kit-frontnum-color")||{}).value||"#FFFFFF";
    o.outline=!!(g("f-kit-frontnum-outline")||{}).checked;
    o.outlineColor=(g("f-kit-frontnum-outline-color")||{}).value||"#000000";
    const w=parseFloat((g("f-kit-frontnum-outline-width")||{}).value); o.outlineWidth=isNaN(w)?4:w;
    const l=parseFloat((g("f-kit-frontnum-letterspacing")||{}).value); o.letterSpacing=isNaN(l)?0:l;
  }
  return o;
}
// posOnly=true ("Pegar sin colores"): solo se pegan si va o no, la posición y el tamaño; el estilo propio
// (tipografía, colores, contorno, interletrado) de este uniforme se queda como está.
function writeFrontNumberFields(fn, posOnly){
  const on=document.getElementById("f-kit-frontnum-on"); if(!on || !fn) return;
  on.checked=!!fn.on;
  [["x","x"],["y","y"],["h","h"]].forEach(([k,id])=>{ const el=document.getElementById("f-kit-frontnum-"+id); if(el && fn[k]!=null) el.value=Math.round(fn[k]*10); });
  const own=document.getElementById("f-kit-frontnum-own");
  if(own && !posOnly){
    own.checked=!!fn.ownStyle;
    const b=document.querySelector(".kit-frontnum-style-body"); if(b) b.style.display=own.checked?"flex":"none";
    if(fn.ownStyle){
      const set=(id,v)=>{ const el=document.getElementById(id); if(el && v!=null){ el.value=v; const hx=el.parentElement && el.parentElement.querySelector(".color-hex-text"); if(hx && /^#/.test(v)) hx.value=String(v).toUpperCase(); } };
      set("f-kit-frontnum-font", fn.fontId); set("f-kit-frontnum-color", fn.color); set("f-kit-frontnum-outline-color", fn.outlineColor); set("f-kit-frontnum-outline-width", fn.outlineWidth); set("f-kit-frontnum-letterspacing", fn.letterSpacing);
      const oc=document.getElementById("f-kit-frontnum-outline"); if(oc) oc.checked=!!fn.outline;
    }
  }
}
async function drawFrontNumberOnCanvas(ctx, size, kit){
  const fn=kit.frontNumber; if(!fn || !fn.on || kit.category==="arbitro") return;
  // Estilo: el propio (si se activó) o el del número del dorso.
  const own=!!fn.ownStyle;
  const entry=(typeof getNumberFont==="function") ? (getNumberFont(own && fn.fontId ? fn.fontId : kit.backNumberFontId) || getNumberFont(kit.backNumberFontId)) : null; if(!entry) return;
  const family=await ensureNumberFontLoaded(entry);
  const h=(fn.h||12)/100, w=h*1.44, cx=(fn.x!=null?fn.x:50)/100, cy=(fn.y!=null?fn.y:37)/100;   // misma proporción que la caja del dorso
  const box={ top:cy-h/2, bottom:cy+h/2, left:cx-w/2, right:cx+w/2 };
  const txt=(kit.previewNumber!=null && kit.previewNumber!=="") ? String(kit.previewNumber) : kitDefaultPreviewNumber(kit);
  ctx.save(); ctx.textAlign="center"; ctx.textBaseline="alphabetic";
  drawTextWithStyle(ctx, box, txt, family,
    own ? fn.color : kit.backNumberColor, own ? fn.outline : kit.backNumberOutline,
    own ? fn.outlineColor : kit.backNumberOutlineColor, own ? fn.outlineWidth : kit.backNumberOutlineWidth,
    // El interletrado es el de un número del tamaño del dorso: en el frente (más chico) se reduce en la
    // misma proporción que el alto del número, para que se vea igual.
    100, (own ? (fn.letterSpacing!=null ? fn.letterSpacing : (kit.backNumberLetterSpacing||0)) : (kit.backNumberLetterSpacing||0)) * (h / (BACK_TEXT_BOXES.number.bottom - BACK_TEXT_BOXES.number.top)), 0, 0, 1, size, size/300);
  ctx.restore();
}
function readLayerRows(container){
  if(!container) return [];
  return Array.from(container.querySelectorAll(".layer-row")).map(row=>{
    const l = { img: row.dataset.img || "", recolorable: row.querySelector(".layer-recolorable").checked };
    // Colores propios de la capa (rojo, verde y azul de la imagen): solo si la capa se recolorea.
    const r=row.querySelector(".layer-col-r"), g=row.querySelector(".layer-col-g"), b=row.querySelector(".layer-col-b");
    if(l.recolorable && r && g && b) l.colors = { r:r.value, g:g.value, b:b.value };
    // Tamaño y posición (solo las capas del cuadro de número+nombre los tienen).
    const sc=row.querySelector(".layer-scale"), lx=row.querySelector(".layer-x"), ly=row.querySelector(".layer-y");
    if(sc){ const v=parseFloat(sc.value); l.scale = isNaN(v) ? 100 : Math.max(10, Math.min(400, v)); }
    if(lx){ const v=parseFloat(lx.value); l.x = isNaN(v) ? 0 : Math.max(-100, Math.min(100, v)); }
    if(ly){ const v=parseFloat(ly.value); l.y = isNaN(v) ? 0 : Math.max(-100, Math.min(100, v)); }
    return l;
  }).filter(l=>l.img);
}
// Colores con que se recolorea una capa: los suyos (rojo→r, verde→g, azul→b) o, en capas guardadas antes,
// los 3 del uniforme. recolorToCanvas toma (rojo, azul, verde) en ese orden.
function layerRecolorArgs(layer, c1, c2, c3){
  const c = layer && layer.colors;
  return c ? [c.r||c1, c.b||c2, c.g||c3] : [c1, c2, c3];
}
function readBackNumberFields(){
  const fontSel = document.getElementById("f-kit-backnum-font");
  const color = document.getElementById("f-kit-backnum-color");
  const outline = document.getElementById("f-kit-backnum-outline");
  const outlineColor = document.getElementById("f-kit-backnum-outline-color");
  const outlineWidth = document.getElementById("f-kit-backnum-outline-width");
  const sizePct = document.getElementById("f-kit-backnum-sizepct");
  const letterSpacing = document.getElementById("f-kit-backnum-letterspacing");
  const offsetX = document.getElementById("f-kit-backnum-offsetx");
  const offsetY = document.getElementById("f-kit-backnum-offsety");
  return {
    backNumberFontId: fontSel ? fontSel.value : null,
    backNumberColor: color ? color.value : "#FFFFFF",
    backNumberOutline: outline ? outline.checked : false,
    backNumberOutlineColor: outlineColor ? outlineColor.value : "#000000",
    backNumberOutlineWidth: outlineWidth ? (parseInt(outlineWidth.value)||0) : 4,
    backNumberSizePct: sizePct ? (parseInt(sizePct.value)||100) : 100,
    backNumberLetterSpacing: letterSpacing ? (parseInt(letterSpacing.value)||0) : 0,
    backNumberOffsetX: offsetX ? (parseInt(offsetX.value)||0) : 0,
    backNumberOffsetY: offsetY ? (parseInt(offsetY.value)||0) : 0
  };
}
// Escribe los valores de un objeto de estilo (como el que devuelve readBackNumberFields) en los
// campos del formulario del Número — usado por "Pegar estilo".
// Escribe los valores de un objeto de estilo (como el que devuelve readBackNumberFields) en los
// campos del formulario del Número — usado por "Pegar estilo". Si includeColor es false, no toca
// los dos colores (relleno y contorno) — solo tipografía, grosor, tamaño, interletrado y posición.
function writeBackNumberFields(data, includeColor){
  includeColor = includeColor!==false;
  const map = {
    backNumberFontId: "f-kit-backnum-font",
    backNumberOutlineWidth: "f-kit-backnum-outline-width",
    backNumberSizePct: "f-kit-backnum-sizepct", backNumberLetterSpacing: "f-kit-backnum-letterspacing",
    backNumberOffsetX: "f-kit-backnum-offsetx", backNumberOffsetY: "f-kit-backnum-offsety"
  };
  if(includeColor){
    map.backNumberColor = "f-kit-backnum-color";
    map.backNumberOutlineColor = "f-kit-backnum-outline-color";
  }
  Object.entries(map).forEach(([key,id])=>{
    const el = document.getElementById(id);
    if(el && data[key]!=null) el.value = data[key];
  });
  const outlineChk = document.getElementById("f-kit-backnum-outline");
  if(outlineChk) outlineChk.checked = !!data.backNumberOutline;
  if(includeColor){
    syncColorHexText("f-kit-backnum-color");
    syncColorHexText("f-kit-backnum-outline-color");
  }
  syncBadgeIfLinked("number");
  refreshKitModalPreview();
}
function readBackNameFields(){
  const fontSel = document.getElementById("f-kit-backname-font");
  const color = document.getElementById("f-kit-backname-color");
  const outline = document.getElementById("f-kit-backname-outline");
  const outlineColor = document.getElementById("f-kit-backname-outline-color");
  const outlineWidth = document.getElementById("f-kit-backname-outline-width");
  const fontLinked = document.getElementById("f-kit-backname-font-linked");
  const colorLinked = document.getElementById("f-kit-backname-color-linked");
  const outlineLinked = document.getElementById("f-kit-backname-outline-linked");
  const sizePct = document.getElementById("f-kit-backname-sizepct");
  const letterSpacing = document.getElementById("f-kit-backname-letterspacing");
  const offsetX = document.getElementById("f-kit-backname-offsetx");
  const offsetY = document.getElementById("f-kit-backname-offsety");
  const arc = document.getElementById("f-kit-backname-arc");
  const textCase = document.getElementById("f-kit-backname-textcase");
  return {
    backNameFontId: fontSel ? fontSel.value : null,
    backNameColor: color ? color.value : "#FFFFFF",
    backNameOutline: outline ? outline.checked : false,
    backNameOutlineColor: outlineColor ? outlineColor.value : "#000000",
    backNameOutlineWidth: outlineWidth ? (parseInt(outlineWidth.value)||0) : 4,
    backNameFontLinked: fontLinked ? fontLinked.value==="1" : true,
    backNameColorLinked: colorLinked ? colorLinked.value==="1" : true,
    backNameOutlineLinked: outlineLinked ? outlineLinked.value==="1" : true,
    backNameSizePct: sizePct ? (parseInt(sizePct.value)||100) : 100,
    backNameCondense: !!(document.getElementById("f-kit-backname-condense")?.checked),
    backNameLetterSpacing: letterSpacing ? (parseInt(letterSpacing.value)||0) : 0,
    backNameOffsetX: offsetX ? (parseInt(offsetX.value)||0) : 0,
    backNameOffsetY: offsetY ? (parseInt(offsetY.value)||0) : 0,
    backNameArc: arc ? (parseInt(arc.value)||1) : 1,
    backNameTextCase: textCase ? textCase.value : "default",
    // Checkbox "Mostrar nombre": si está desmarcado, el nombre NO se dibuja en la espalda.
    backNameHidden: (function(){ const el=document.getElementById("f-kit-backname-show"); return el ? !el.checked : false; })()
  };
}
// Escribe los valores de un objeto de estilo (como el que devuelve readBackNameFields) en los
// campos del formulario del Nombre — usado por "Pegar estilo". Al pegar se desvinculan del número
// los grupos que sí se modifican (tipografía y contorno; color solo si includeColor es true).
function writeBackNameFields(data, includeColor){
  includeColor = includeColor!==false;
  const map = {
    backNameFontId: "f-kit-backname-font",
    backNameOutlineWidth: "f-kit-backname-outline-width",
    backNameSizePct: "f-kit-backname-sizepct", backNameLetterSpacing: "f-kit-backname-letterspacing",
    backNameOffsetX: "f-kit-backname-offsetx", backNameOffsetY: "f-kit-backname-offsety", backNameArc: "f-kit-backname-arc",
    backNameTextCase: "f-kit-backname-textcase"
  };
  if(includeColor){
    map.backNameColor = "f-kit-backname-color";
    map.backNameOutlineColor = "f-kit-backname-outline-color";
  }
  Object.entries(map).forEach(([key,id])=>{
    const el = document.getElementById(id);
    if(el && data[key]!=null) el.value = data[key];
  });
  const outlineChk = document.getElementById("f-kit-backname-outline");
  if(outlineChk) outlineChk.checked = !!data.backNameOutline;
  const condenseChk = document.getElementById("f-kit-backname-condense");
  if(condenseChk) condenseChk.checked = !!data.backNameCondense;
  const groupsToUnlink = includeColor ? ["font","color","outline"] : ["font","outline"];
  groupsToUnlink.forEach(g=>{
    const linked = document.getElementById(`f-kit-backname-${g}-linked`);
    if(linked) linked.value = "0";
  });
  if(includeColor){
    syncColorHexText("f-kit-backname-color");
    syncColorHexText("f-kit-backname-outline-color");
  }
  // Propaga los valores pegados al cuadro de número+nombre si sigue vinculado.
  syncBadgeIfLinked("name");
  refreshKitModalPreview();
}
// Actualiza el campo de texto hexadecimal junto a un input[type=color] después de cambiarlo por
// código — sin esto, "Pegar estilo" cambiaría el color pero el texto de al lado quedaría desfasado.
function syncColorHexText(colorInputId){
  const input = document.getElementById(colorInputId);
  if(!input) return;
  const hex = input.closest(".color-field") && input.closest(".color-field").querySelector(".color-hex-text");
  if(hex) hex.value = input.value.toUpperCase();
}
// Lee los campos del cuadro de número/nombre ("badge") — solo existen en el formulario cuando el
// uniforme es Local o Portero Local; en cualquier otro caso devuelven los defaults sin tronar.
function readBadgeNumberFields(){
  const fontSel = document.getElementById("f-kit-badgenum-font");
  const color = document.getElementById("f-kit-badgenum-color");
  const outline = document.getElementById("f-kit-badgenum-outline");
  const outlineColor = document.getElementById("f-kit-badgenum-outline-color");
  const outlineWidth = document.getElementById("f-kit-badgenum-outline-width");
  const sizePct = document.getElementById("f-kit-badgenum-sizepct");
  const letterSpacing = document.getElementById("f-kit-badgenum-letterspacing");
  const offsetX = document.getElementById("f-kit-badgenum-offsetx");
  const offsetY = document.getElementById("f-kit-badgenum-offsety");
  const linked = document.getElementById("f-kit-badgenum-linked");
  return {
    badgeNumberFontId: fontSel ? fontSel.value : null,
    badgeNumberColor: color ? color.value : "#FFFFFF",
    badgeNumberOutline: outline ? outline.checked : false,
    badgeNumberOutlineColor: outlineColor ? outlineColor.value : "#000000",
    badgeNumberOutlineWidth: outlineWidth ? (parseInt(outlineWidth.value)||0) : 4,
    badgeNumberSizePct: sizePct ? (parseInt(sizePct.value)||100) : 100,
    badgeNumberLetterSpacing: letterSpacing ? (parseInt(letterSpacing.value)||0) : 0,
    badgeNumberOffsetX: offsetX ? (parseInt(offsetX.value)||0) : 0,
    badgeNumberOffsetY: offsetY ? (parseInt(offsetY.value)||0) : 0,
    badgeNumberLinked: linked ? linked.value==="1" : true
  };
}
function readBadgeNameFields(){
  const fontSel = document.getElementById("f-kit-badgename-font");
  const color = document.getElementById("f-kit-badgename-color");
  const outline = document.getElementById("f-kit-badgename-outline");
  const outlineColor = document.getElementById("f-kit-badgename-outline-color");
  const outlineWidth = document.getElementById("f-kit-badgename-outline-width");
  const sizePct = document.getElementById("f-kit-badgename-sizepct");
  const letterSpacing = document.getElementById("f-kit-badgename-letterspacing");
  const offsetX = document.getElementById("f-kit-badgename-offsetx");
  const offsetY = document.getElementById("f-kit-badgename-offsety");
  const arc = document.getElementById("f-kit-badgename-arc");
  const textCase = document.getElementById("f-kit-badgename-textcase");
  const linked = document.getElementById("f-kit-badgename-linked");
  return {
    badgeNameFontId: fontSel ? fontSel.value : null,
    badgeNameColor: color ? color.value : "#FFFFFF",
    badgeNameOutline: outline ? outline.checked : false,
    badgeNameOutlineColor: outlineColor ? outlineColor.value : "#000000",
    badgeNameOutlineWidth: outlineWidth ? (parseInt(outlineWidth.value)||0) : 4,
    badgeNameSizePct: sizePct ? (parseInt(sizePct.value)||100) : 100,
    badgeNameCondense: !!(document.getElementById("f-kit-badgename-condense")?.checked),
    badgeNameLetterSpacing: letterSpacing ? (parseInt(letterSpacing.value)||0) : 0,
    badgeNameOffsetX: offsetX ? (parseInt(offsetX.value)||0) : 0,
    badgeNameOffsetY: offsetY ? (parseInt(offsetY.value)||0) : 0,
    badgeNameArc: arc ? (parseInt(arc.value)||1) : 1,
    badgeNameTextCase: textCase ? textCase.value : "default",
    badgeNameLinked: linked ? linked.value==="1" : true
  };
}
// Si el lado correspondiente del badge ("número" o "nombre") sigue vinculado, copia en vivo el
// valor recién cambiado del dorso hacia los controles del cuadro — y al revés, cualquier edición
// directa de un campo del cuadro lo desvincula por completo (todo ese lado, no por grupos sueltos).
function syncBadgeIfLinked(section){
  const linked = document.getElementById(`f-kit-badge${section==="number"?"num":"name"}-linked`);
  if(!linked || linked.value!=="1") return;
  const srcPrefix = section==="number" ? "f-kit-backnum-" : "f-kit-backname-";
  const dstPrefix = section==="number" ? "f-kit-badgenum-" : "f-kit-badgename-";
  // Copia directa, sin escalar: tanto el dorso como el cuadro del jugador se renderizan a tamaños de
  // canvas similares, y el interletrado/posición se aplican en términos de esos pixeles de render
  // (no como fracción del ancho de la caja) — así que el mismo valor numérico produce prácticamente
  // el mismo efecto visual en los dos. (Se probó escalar por la proporción de ancho de caja y el
  // resultado quedaba claramente descentrado — confirmado con evidencia visual real.)
  const fields = ["font","color","outline","outline-color","outline-width","sizepct","letterspacing","offsetx","offsety","condense"];
  if(section==="name") fields.push("arc","textcase");
  fields.forEach(f=>{
    const src = document.getElementById(srcPrefix+f);
    const dst = document.getElementById(dstPrefix+f);
    if(!src || !dst) return;
    if(src.type==="checkbox") dst.checked = src.checked;
    else dst.value = src.value;
    if(src.type==="color") syncColorHexText(dst.id);
  });
}
function unlinkBadge(section){
  const linked = document.getElementById(`f-kit-badge${section==="number"?"num":"name"}-linked`);
  if(linked) linked.value = "0";
  updateBadgeStatusBadge(section);
}
// Refleja en el chip visible (🔗 Vinculado / 🔓 Independiente) el estado actual — para que nunca quede
// "escondido" si una sección del cuadro se independizó sin que el usuario lo note explícitamente.
function updateBadgeStatusBadge(section){
  const linked = document.getElementById(`f-kit-badge${section==="number"?"num":"name"}-linked`);
  const statusEl = document.getElementById(`kit-badge${section==="number"?"num":"name"}-status`);
  if(!linked || !statusEl) return;
  const isLinked = linked.value==="1";
  statusEl.textContent = isLinked ? "🔗 Vinculado" : "🔓 Independiente";
  statusEl.style.background = isLinked ? "rgba(52,211,153,0.16)" : "rgba(255,107,106,0.16)";
  statusEl.style.color = isLinked ? "var(--success)" : "var(--danger)";
}

function syncBackNameIfLinked(group){
  if(group==="font"){
    const linked = document.getElementById("f-kit-backname-font-linked");
    if(!linked || linked.value!=="1") return;
    const src = document.getElementById("f-kit-backnum-font");
    const dst = document.getElementById("f-kit-backname-font");
    if(src && dst) dst.value = src.value;
  } else if(group==="color"){
    const linked = document.getElementById("f-kit-backname-color-linked");
    if(!linked || linked.value!=="1") return;
    const src = document.getElementById("f-kit-backnum-color");
    const dst = document.getElementById("f-kit-backname-color");
    if(src && dst){
      dst.value = src.value;
      const hex = dst.closest(".color-field") && dst.closest(".color-field").querySelector(".color-hex-text");
      if(hex) hex.value = src.value.toUpperCase();
    }
  } else if(group==="outline"){
    const linked = document.getElementById("f-kit-backname-outline-linked");
    if(!linked || linked.value!=="1") return;
    const srcChk = document.getElementById("f-kit-backnum-outline");
    const dstChk = document.getElementById("f-kit-backname-outline");
    if(srcChk && dstChk) dstChk.checked = srcChk.checked;
    const srcColor = document.getElementById("f-kit-backnum-outline-color");
    const dstColor = document.getElementById("f-kit-backname-outline-color");
    if(srcColor && dstColor){
      dstColor.value = srcColor.value;
      const hex = dstColor.closest(".color-field") && dstColor.closest(".color-field").querySelector(".color-hex-text");
      if(hex) hex.value = srcColor.value.toUpperCase();
    }
    const srcW = document.getElementById("f-kit-backnum-outline-width");
    const dstW = document.getElementById("f-kit-backname-outline-width");
    if(srcW && dstW) dstW.value = srcW.value;
  }
}
// Marca un grupo de "Letra del dorso" como editado a mano (ya no sigue al número).
function unlinkBackName(group){
  const el = document.getElementById(`f-kit-backname-${group==="font"?"font":group==="color"?"color":"outline"}-linked`);
  if(el) el.value = "0";
}

// Turno de la vista previa: como el dibujo es asíncrono, una vista previa vieja que termine después de una
// nueva no debe pisarla (solo se pinta el resultado del último llamado).
let _kitPreviewTurn = 0;
async function refreshKitModalPreview(){
  const turno = ++_kitPreviewTurn;
  try{ kitImgActualizarMuestras(); }catch(e){}
  const el = document.getElementById("kit-modal-preview");
  const elBack = document.getElementById("kit-modal-preview-back");
  const baseSel = document.getElementById("f-kit-base");
  const c1 = document.getElementById("f-kit-color1"), c2 = document.getElementById("f-kit-color2"), c3 = document.getElementById("f-kit-color3");
  if(!el || !baseSel || !c1 || !c2 || !c3) return;
  const layers = readLayerRows(document.getElementById("kit-layer-rows"));
  const backLayers = readLayerRows(document.getElementById("kit-back-layer-rows"));
  const images = readKitImgRows(document.getElementById("kit-img-rows"));
  const backImages = [];
  const backNumberFields = readBackNumberFields();
  const backNameFields = readBackNameFields();
  const previewNumberEl = document.getElementById("f-kit-preview-number");
  const previewNameEl = document.getElementById("f-kit-preview-name");
  const previewNumber = previewNumberEl && previewNumberEl.value!=="" ? Math.max(0, Math.min(999, parseInt(previewNumberEl.value)||0)) : parseInt(kitDefaultPreviewNumber({category:(baseSel.dataset.category||"jugador")}),10);
  const previewName = previewNameEl ? previewNameEl.value.slice(0,50) : "APELLIDO";
  const kitCategory = baseSel.dataset.category || "jugador";
  const tempKit = {category:kitCategory, baseNumber:parseInt(baseSel.value), color1:c1.value, color2:c2.value, color3:c3.value, layers, backLayers, images, backImages, frontNumber:readFrontNumberFields(), ...backNumberFields, ...backNameFields, previewNumber, previewName};
  try{
    const url = await buildKitDataURL(tempKit, 450);
    if(turno!==_kitPreviewTurn) return;
    el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    document.querySelectorAll("#kit-combo-rows .combo-preview-shirt").forEach(div=>{
      div.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    });
  }catch(e){ /* base aún no disponible */ }
  if(elBack){
    try{
      const urlBack = await buildKitBackDataURL(tempKit, 450);
      if(turno!==_kitPreviewTurn) return;
      elBack.innerHTML = `<img src="${urlBack}" style="width:100%;height:100%;object-fit:contain;">`;
    }catch(e){ /* base aún no disponible */ }
  }
  const elBadge = document.getElementById("kit-badge-preview");
  if(elBadge){
    const badgeNumberFields = document.getElementById("f-kit-badgenum-linked") ? readBadgeNumberFields() : {};
    const badgeNameFields = document.getElementById("f-kit-badgename-linked") ? readBadgeNameFields() : {};
    const badgePreviewNumberEl = document.getElementById("f-kit-badge-preview-number");
    const badgePreviewNameEl = document.getElementById("f-kit-badge-preview-name");
    const badgePreviewNumber = badgePreviewNumberEl && badgePreviewNumberEl.value!=="" ? Math.max(0, Math.min(999, parseInt(badgePreviewNumberEl.value)||0)) : 10;
    const badgePreviewName = badgePreviewNameEl ? badgePreviewNameEl.value.slice(0,50) : "APELLIDO";
    const badgeLayers = readLayerRows(document.getElementById("kit-badge-layer-rows"));
    const badgeTempKit = {baseNumber:parseInt(baseSel.value), color1:c1.value, color2:c2.value, color3:c3.value, badgeLayers, ...badgeNumberFields, ...badgeNameFields, badgePreviewNumber, badgePreviewName};
    try{
      const urlBadge = await buildKitBadgePreviewDataURL(badgeTempKit, 420);
      if(urlBadge) elBadge.innerHTML = `<img src="${urlBadge}" style="width:100%;height:100%;object-fit:contain;">`;
    }catch(e){ /* base aún no disponible */ }
  }
}
async function refreshComboBlockPreview(block){
  if(!block) return;
  const shortsBase = parseInt(block.querySelector(".combo-base-shorts").value);
  const scC1 = block.querySelector(".combo-color1-shorts").value;
  const scC2 = block.querySelector(".combo-color2-shorts").value;
  const scC3 = block.querySelector(".combo-color3-shorts").value;
  const shortsLayers = readLayerRows(block.querySelector(".combo-layer-rows-shorts"));

  const socksBase = parseInt(block.querySelector(".combo-base-socks").value);
  const skC1 = block.querySelector(".combo-color1-socks").value;
  const skC2 = block.querySelector(".combo-color2-socks").value;
  const skC3 = block.querySelector(".combo-color3-socks").value;
  const socksLayers = readLayerRows(block.querySelector(".combo-layer-rows-socks"));

  try{
    const shortsUrl = await buildGarmentDataURL("shorts", shortsBase, scC1, scC2, scC3, shortsLayers);
    block.querySelectorAll(".combo-preview-shorts, .combo-preview-shorts-large").forEach(div=>{
      div.innerHTML = `<img src="${shortsUrl}" style="width:100%;height:100%;object-fit:contain;">`;
    });
  }catch(e){}
  try{
    const socksUrl = await buildGarmentDataURL("socks", socksBase, skC1, skC2, skC3, socksLayers);
    block.querySelectorAll(".combo-preview-socks, .combo-preview-socks-large").forEach(div=>{
      div.innerHTML = `<img src="${socksUrl}" style="width:100%;height:100%;object-fit:contain;">`;
    });
  }catch(e){}
}
function refreshAllComboPreviews(){
  document.querySelectorAll("#kit-combo-rows .combo-block").forEach(block=>refreshComboBlockPreview(block));
}
function readComboFromBlock(block){
  return {
    id: newId("combo"),
    shortsBaseNumber: parseInt(block.querySelector(".combo-base-shorts").value),
    shortsColor1: block.querySelector(".combo-color1-shorts").value,
    shortsColor2: block.querySelector(".combo-color2-shorts").value,
    shortsColor3: block.querySelector(".combo-color3-shorts").value,
    shortsLayers: readLayerRows(block.querySelector(".combo-layer-rows-shorts")),
    socksBaseNumber: parseInt(block.querySelector(".combo-base-socks").value),
    socksColor1: block.querySelector(".combo-color1-socks").value,
    socksColor2: block.querySelector(".combo-color2-socks").value,
    socksColor3: block.querySelector(".combo-color3-socks").value,
    socksLayers: readLayerRows(block.querySelector(".combo-layer-rows-socks"))
  };
}
function renumberComboBlocks(){
  document.querySelectorAll("#kit-combo-rows .combo-block").forEach((block,i)=>{
    const labelEl = block.querySelector(".combo-label-text");
    if(labelEl) labelEl.textContent = "Combo "+(i+1);
  });
}

/* ---------- Event handling ---------- */
// Tamaño de lienzo natural por tipo de prenda (camiseta es cuadrada; shorts/calcetas son apaisadas 2:1).
// Compone una sola prenda (base recoloreada + su textura encima) — se usa para shorts y calcetas,
// y también internamente como pieza base de las camisetas.
async function buildGarmentDataURL(type, baseNumber, color1, color2, color3, layers){
  const cfg = garmentConfig(type);
  const [w,h] = GARMENT_CANVAS_SIZE[type] || [300,300];
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  const bases = DB[cfg.basesKey];
  const baseEntry = bases.find(b=>b.number===baseNumber) || bases[0];
  if(baseEntry){
    const baseCanvas = await recolorToCanvas(baseEntry.baseImg, color1, color2, color3, w, h);
    ctx.drawImage(baseCanvas, 0, 0);
  }
  for(const layer of (layers||[])){
    if(layer.recolorable){
      const lc = await recolorToCanvas(layer.img, ...layerRecolorArgs(layer, color1, color2, color3), w, h);
      ctx.drawImage(lc, 0, 0);
    } else {
      const li = await loadImg(layer.img);
      ctx.drawImage(li, 0, 0, w, h);
    }
  }
  if(DB[cfg.textureKey]){
    const tex = await loadImg(DB[cfg.textureKey]);
    ctx.drawImage(tex, 0, 0, w, h);
  }
  return canvas.toDataURL("image/png");
}
// Tamaño estándar de las playeras: 540×540 (la mitad del archivo original), con la nitidez de un PNG
// exportado. En espacios chicos se muestra esa misma imagen reducida por el navegador.
const KIT_RENDER_SIZE = 540;
async function buildKitDataURL(kit, size){
  size = Math.max(size || 0, KIT_RENDER_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  const baseEntry = DB.kitBases.find(b=>b.number===kit.baseNumber) || DB.kitBases[0];
  if(baseEntry){
    const frontSrc = shirtFrontImgFor(kit.baseNumber, kit.category);
    const baseCanvas = await recolorToCanvas(frontSrc, kit.color1, kit.color2, kit.color3, size, size);
    ctx.drawImage(baseCanvas, 0, 0);
  }
  for(const layer of (kit.layers||[])){
    if(layer.recolorable){
      const lc = await recolorToCanvas(layer.img, ...layerRecolorArgs(layer, kit.color1, kit.color2, kit.color3), size, size);
      ctx.drawImage(lc, 0, 0);
    } else {
      const li = await loadImg(layer.img);
      ctx.drawImage(li, 0, 0, size, size);
    }
  }
  await drawKitImages(ctx, size, kit.images, kit, "frente");   // escudo, marca, patrocinadores y parches (bajo la textura)
  if(DB.numberFonts && DB.numberFonts.length) await drawFrontNumberOnCanvas(ctx, size, kit);
  const frontTex = (kit.category==="portero") ? (DB.gkTexture||DB.kitTexture) : DB.kitTexture;
  if(frontTex){
    const tex = await loadImg(frontTex);
    ctx.drawImage(tex, 0, 0, size, size);
  }
  return canvas.toDataURL("image/png");
}
// El dorso de una base es opcional: si no se subió uno propio, se usa el dorso de la Base 0001
// (la primera que se cargó) como resguardo, para que nunca falte la vista trasera.
function shirtBackImgFor(baseNumber){
  const base = DB.kitBases.find(b=>b.number===baseNumber);
  if(base && base.backImg) return base.backImg;
  const fallback = DB.kitBases.find(b=>b.number===1);
  return fallback ? fallback.backImg : null;
}
// Resuelve el FRENTE de la camiseta según la categoría del uniforme.
// - Jugador: usa la versión normal (baseImg).
// - Portero: usa la versión de portero (gkImg) de esta misma base; si esa base no tiene una propia,
//   cae a la versión de portero de shirt1; y si tampoco existe, usa la versión normal como último recurso.
function shirtFrontImgFor(baseNumber, category){
  const base = DB.kitBases.find(b=>b.number===baseNumber) || DB.kitBases.find(b=>b.number===1);
  if(category==="portero"){
    if(base && base.gkImg) return base.gkImg;
    const first = DB.kitBases.find(b=>b.number===1);
    if(first && first.gkImg) return first.gkImg;
  }
  return base ? base.baseImg : null;
}
// Igual que shirtFrontImgFor pero para el DORSO. Portero: gkBackImg propio → gkBackImg de shirt1 →
// dorso de portero inexistente cae al dorso normal (con su propio fallback a shirt1).
function shirtBackImgForCategory(baseNumber, category){
  if(category==="portero"){
    const base = DB.kitBases.find(b=>b.number===baseNumber);
    if(base && base.gkBackImg) return base.gkBackImg;
    const first = DB.kitBases.find(b=>b.number===1);
    if(first && first.gkBackImg) return first.gkBackImg;
  }
  return shirtBackImgFor(baseNumber);
}
async function buildKitBackDataURL(kit, size){
  size = Math.max(size || 0, KIT_RENDER_SIZE);
  const canvas = document.createElement("canvas");
  canvas.width = size; canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
  const backSrc = shirtBackImgForCategory(kit.baseNumber, kit.category);
  if(backSrc){
    const backCanvas = await recolorToCanvas(backSrc, kit.color1, kit.color2, kit.color3, size, size);
    ctx.drawImage(backCanvas, 0, 0);
  }
  for(const layer of (kit.backLayers||[])){
    if(layer.recolorable){
      const lc = await recolorToCanvas(layer.img, ...layerRecolorArgs(layer, kit.color1, kit.color2, kit.color3), size, size);
      ctx.drawImage(lc, 0, 0);
    } else {
      const li = await loadImg(layer.img);
      ctx.drawImage(li, 0, 0, size, size);
    }
  }
  // Espalda: los de la lista con ubicación "espalda", la parte trasera de los de las mangas y los de la
  // lista anterior del dorso (uniformes guardados antes de que hubiera ubicación).
  await drawKitImages(ctx, size, (kit.images||[]).concat((kit.backImages||[]).map(i=>Object.assign({}, i, {loc:"espalda"}))), kit, "espalda");
  const backTex = (kit.category==="portero") ? (DB.gkTextureBack||DB.kitTextureBack) : DB.kitTextureBack;
  if(backTex){
    const tex = await loadImg(backTex);
    ctx.drawImage(tex, 0, 0, size, size);
  }
  // El número y el nombre van siempre arriba de todo, incluso del outline negro.
  if(DB.numberFonts && DB.numberFonts.length){
    await drawBackNumberOnCanvas(ctx, size, kit);
  }
  return canvas.toDataURL("image/png");
}

function renderKitPreviews(){
  document.querySelectorAll(".kit-render[data-pending]").forEach(async (el)=>{
    el.removeAttribute("data-pending");
    const kitId = el.dataset.kitId;
    const teamId = el.dataset.teamId;
    const team = getTeam(teamId);
    if(!team) return;
    const kit = team.kits.find(k=>k.id===kitId);
    if(!kit) return;
    try{
      const url = await buildKitDataURL(kit, 320);
      el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    }catch(e){ /* base no disponible aún u otro error de carga */ }
  });
  renderGarmentPreviews();
  renderNumberFontPreviews();
  renderPlayerBadgePreviews();
}

// Recolorea el escudo genérico de cada selección/club sin logo con SUS colores, usando el mismo motor
// que los uniformes (rojo→color 1, azul→color 2, verde→color 3). El resultado se guarda en caché por
// combinación de colores, así que una lista de 200 clubes solo hace el trabajo pesado unas pocas veces.
// Llena los contenedores ".player-badge-render" (cuadro de número+nombre en el perfil del jugador).
function renderPlayerBadgePreviews(){
  document.querySelectorAll(".player-badge-render[data-pending]").forEach(async (el)=>{
    el.removeAttribute("data-pending");
    const {player, team} = getPlayerWithTeam(el.dataset.playerId);
    if(!player) return;
    try{
      const url = await buildPlayerNumberBadgeDataURL(player, team, 420);
      if(url) el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
      else el.style.display = "none";
    }catch(e){ el.style.display = "none"; }
  });
}
// Llena los contenedores ".garment-render" (shorts/calcetas de una combinación) con su composición.
function renderGarmentPreviews(){
  document.querySelectorAll(".garment-render[data-pending]").forEach(async (el)=>{
    el.removeAttribute("data-pending");
    const team = getTeam(el.dataset.teamId);
    if(!team) return;
    const kit = team.kits.find(k=>k.id===el.dataset.kitId);
    if(!kit) return;
    const combo = (kit.combinations||[])[parseInt(el.dataset.comboIndex)||0];
    if(!combo) return;
    const garment = el.dataset.garment;
    try{
      const url = garment==="shorts"
        ? await buildGarmentDataURL("shorts", combo.shortsBaseNumber, combo.shortsColor1, combo.shortsColor2, combo.shortsColor3, combo.shortsLayers)
        : await buildGarmentDataURL("socks", combo.socksBaseNumber, combo.socksColor1, combo.socksColor2, combo.socksColor3, combo.socksLayers);
      el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    }catch(e){ /* base no disponible aún */ }
  });
}
// Llena los contenedores ".numberfont-render" (catálogo de tipografías de número) con una muestra "23".
function renderNumberFontPreviews(){
  document.querySelectorAll(".numberfont-render[data-pending]").forEach(async (el)=>{
    el.removeAttribute("data-pending");
    const entry = DB.numberFonts.find(f=>f.id===el.dataset.id);
    if(!entry) return;
    try{
      const url = await buildNumberFontPreviewDataURL(entry, 220);
      el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    }catch(e){ /* fuente no disponible aún */ }
  });
}
