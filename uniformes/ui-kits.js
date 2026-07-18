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

async function drawBackNumberOnCanvas(ctx, size, kit){
  const numberEntry = getNumberFont(kit.backNumberFontId);
  if(!numberEntry) return;
  const nameEntry = getNumberFont(kit.backNameFontId) || numberEntry;
  const numberFamily = await ensureNumberFontLoaded(numberEntry);
  const nameFamily = await ensureNumberFontLoaded(nameEntry);
  const outlineScale = size/300;
  const previewNumberText = (kit.previewNumber!=null && kit.previewNumber!=="") ? String(kit.previewNumber) : "10";
  const previewNameText = applyTextCase((kit.previewName!=null && kit.previewName!=="") ? kit.previewName : "APELLIDO", kit.backNameTextCase);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  drawTextWithStyle(ctx, BACK_TEXT_BOXES.name, previewNameText, nameFamily, kit.backNameColor, kit.backNameOutline, kit.backNameOutlineColor, kit.backNameOutlineWidth, kit.backNameSizePct, kit.backNameLetterSpacing, kit.backNameOffsetX, kit.backNameOffsetY, kit.backNameArc, size, outlineScale, undefined, kit.backNameCondense, true);
  drawTextWithStyle(ctx, BACK_TEXT_BOXES.number, previewNumberText, numberFamily, kit.backNumberColor, kit.backNumberOutline, kit.backNumberOutlineColor, kit.backNumberOutlineWidth, kit.backNumberSizePct, kit.backNumberLetterSpacing, kit.backNumberOffsetX, kit.backNumberOffsetY, 1, size, outlineScale);
  ctx.restore();
}
// Genera el cuadro de número+nombre que se muestra en el perfil del jugador (entre sus datos y el
// rating). Toma el Back que corresponde al Shirt del uniforme de Local de su selección (mismo
// número — o Back1 si no hay uno propio), lo recolorea con los colores de ese mismo uniforme, y
// dibuja encima el dorsal y el "nombre en camiseta (selección)" del jugador, usando exactamente la
// misma tipografía/color/contorno/tamaño/posición que ese uniforme tiene configurados para su dorso.
async function buildPlayerNumberBadgeDataURL(player, team, size){
  size = size || 200;
  if(!team || !DB.backBases.length) return null;
  // Los porteros usan los colores/configuración del uniforme de Portero Local, no del de Local.
  const refKit = player.pos==="GK"
    ? (team.kits.find(k=>k.category==="portero" && k.label==="Portero Local") || team.kits.find(k=>k.category==="portero"))
    : team.kits.find(k=>k.category==="jugador" && k.label==="Local") || team.kits.find(k=>k.category==="jugador");
  if(!refKit) return null;
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
  const outlineScale = size/300;
  const rawNameText = effectiveShirtName(player, "team") || "APELLIDO";
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
  drawTextWithStyle(ctx, BACK_SQUARE_TEXT_BOXES.name, nameText, nameFamily,
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
  return canvas.toDataURL("image/png");
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
  const outlineScale = size/300;
  const numberText = (kit.badgePreviewNumber!=null && kit.badgePreviewNumber!=="") ? String(kit.badgePreviewNumber) : "10";
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
    kit.badgeNameCondense!=null?kit.badgeNameCondense:kit.backNameCondense, true);
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
  const canDelete = k.category==="jugador" ? jugadorCount>2 : porteroCount>1;
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

function modalManageKits(team){
  openModal(`
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-head"><h2>Uniformes de ${team.commonName}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <label class="field" style="margin-bottom:18px;">${T('team.kitSponsor.label')}
          <input id="f-kit-sponsor-top" class="team-kitsponsor-input" data-team="${team.id}" list="brand-list" value="${team.kitSponsor||''}" placeholder="${T('team.kitSponsor.placeholder')}">
          <datalist id="brand-list">${apparelBrandNames().map(b=>`<option value="${escapeHtml(b)}">`).join("")}</datalist>
        </label>
        <div class="section-title" style="margin-top:0;"><h2 style="font-size:14px;">Uniformes de jugador</h2><button class="btn gold sm" data-action="add-kit" data-team="${team.id}" data-category="jugador">+ Agregar</button></div>
        <div class="grid cols-3">
          ${(team.kits||[]).filter(k=>k.category==="jugador").map(k=>kitCardHTML(team,k)).join("")}
        </div>
        <div class="section-title"><h2 style="font-size:14px;">Uniformes de portero</h2><button class="btn gold sm" data-action="add-kit" data-team="${team.id}" data-category="portero">+ Agregar</button></div>
        <div class="grid cols-3">
          ${(team.kits||[]).filter(k=>k.category==="portero").map(k=>kitCardHTML(team,k)).join("")}
        </div>
      </div>
      <div class="modal-foot"><button class="btn ghost" data-action="close-modal">Cerrar</button></div>
    </div>
  `);
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
    baseNumber: kit.baseNumber!=null ? kit.baseNumber : (DB.kitBases[0] ? DB.kitBases[0].number : 1),
    color1: resolvedColor1,
    color2: resolvedColor2,
    color3: resolvedColor3,
    layers: kit.layers || [],
    backLayers: kit.backLayers || [],
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
    badgeNumberLinked: kit.badgeNumberLinked!==undefined ? !!kit.badgeNumberLinked : true,
    badgeNameLinked: kit.badgeNameLinked!==undefined ? !!kit.badgeNameLinked : true,
    combinations: (kit.combinations && kit.combinations.length) ? kit.combinations : [defaultCombo(resolvedColor1, resolvedColor2, resolvedColor3)],
    linkedJugadorKitIds: kit.linkedJugadorKitIds || []
  };
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
  const showBadgeSection = kit.label==="Local" || kit.label==="Portero Local";
  const jugadorKits = team.kits.filter(k=>k.category==="jugador");
  openModal(`
    <div class="modal-box" style="max-width:640px;">
      <div class="modal-head"><h2>${isEdit?"Editar uniforme":"Agregar uniforme"} — ${kit.category==="jugador"?"Jugador":"Portero"}</h2><button class="modal-close" data-action="cancel-kit-edit" data-team="${team.id}" data-from-manage="${fromManage?'1':'0'}">×</button></div>
      <div class="modal-body">
        <div class="subhead" style="margin-top:0;">Playera</div>
        <div style="display:flex;gap:16px;margin-bottom:10px;flex-wrap:wrap;">
          <div id="kit-modal-preview" style="width:180px;height:180px;flex-shrink:0;background:var(--surface-2);border-radius:10px;"></div>
          <div id="kit-modal-preview-back" style="width:180px;height:180px;flex-shrink:0;background:var(--surface-2);border-radius:10px;"></div>
          <div style="flex:1;min-width:200px;">
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
          </div>
        </div>

        <div class="subhead">Capas adicionales (opcional)</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:14px;">
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

        <div style="background:var(--surface-2);border-radius:8px;padding:8px 12px;margin-bottom:14px;">
          <div data-action="toggle-kit-test-panel" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;">
            <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">Probar con otro número/nombre (solo vista previa — nunca se guarda)</span>
            <span id="kit-test-panel-chevron" class="mono" style="color:var(--muted);font-size:13px;">▸</span>
          </div>
          <div id="kit-test-panel-body" style="display:none;margin-top:10px;">
            <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;">
              <label class="field" style="width:100px;">Número de prueba
                <input type="number" id="f-kit-preview-number" class="kit-modal-control" min="0" max="999" value="10">
              </label>
              <label class="field" style="flex:1;min-width:180px;">Nombre de prueba
                <input type="text" id="f-kit-preview-name" class="kit-modal-control" maxlength="50" value="APELLIDO">
              </label>
            </div>
          </div>
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;background:var(--surface-2);border-radius:8px;padding:8px 12px;margin-bottom:6px;">
          <span style="font-size:11px;color:var(--muted);font-weight:700;text-transform:uppercase;letter-spacing:0.03em;">Número + Nombre (los dos juntos)</span>
          <span style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" class="btn ghost sm" data-action="copy-both-style">Copiar ambos</button>
            <button type="button" class="btn ghost sm" data-action="paste-both-style-color">Pegar ambos + color</button>
            <button type="button" class="btn ghost sm" data-action="paste-both-style-only">Pegar ambos sin color</button>
          </span>
        </div>

        <div class="subhead" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <span>Número</span>
          <span style="display:flex;gap:8px;">
            <button type="button" class="btn ghost sm" data-action="copy-number-style">Copiar estilo</button>
            <button type="button" class="btn ghost sm" data-action="paste-number-style-color">Pegar estilo y color</button>
            <button type="button" class="btn ghost sm" data-action="paste-number-style-only">Pegar solo estilo</button>
          </span>
        </div>
        <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">Tipografía, color y contorno opcional del número (se muestra "10" de ejemplo).</p>
        ${DB.numberFonts.length ? `
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;margin-bottom:14px;">
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
        <div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-start;margin-bottom:14px;">
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

        <div class="subhead" style="display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;">
          <span>Nombre</span>
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

        <div class="subhead">Combinaciones de shorts y calcetas</div>
        <p style="font-size:11.5px;color:var(--muted);margin:0 0 10px;">La primera combinación es la principal (la que se muestra en la lista de uniformes). Agrega más para tener otras opciones de shorts/calcetas con la misma playera.</p>
        <div id="kit-combo-rows">
          ${kit.combinations.map((c,i)=>comboBlockHTML(c,i)).join("")}
        </div>
        <button type="button" class="btn ghost sm" data-action="add-combo-row">+ Agregar combinación</button>
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
                  <label class="field" style="width:100px;">Número de prueba
                    <input type="number" id="f-kit-badge-preview-number" class="kit-modal-control" min="0" max="999" value="10">
                  </label>
                  <label class="field" style="flex:1;min-width:140px;">Nombre de prueba
                    <input type="text" id="f-kit-badge-preview-name" class="kit-modal-control" maxlength="50" value="APELLIDO">
                  </label>
                </div>
              </div>
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
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="cancel-kit-edit" data-team="${team.id}" data-from-manage="${fromManage?'1':'0'}">Cancelar</button>
        <button class="btn gold" data-action="save-kit" data-team="${team.id}" data-category="${kit.category}" data-id="${kit.id||''}" data-from-manage="${fromManage?'1':'0'}">Guardar</button>
      </div>
    </div>
  `);
  refreshKitModalPreview();
  refreshAllComboPreviews();
}
function readLayerRows(container){
  if(!container) return [];
  return Array.from(container.querySelectorAll(".layer-row")).map(row=>({
    img: row.dataset.img || "", recolorable: row.querySelector(".layer-recolorable").checked
  })).filter(l=>l.img);
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
    backNameTextCase: textCase ? textCase.value : "default"
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

async function refreshKitModalPreview(){
  const el = document.getElementById("kit-modal-preview");
  const elBack = document.getElementById("kit-modal-preview-back");
  const baseSel = document.getElementById("f-kit-base");
  const c1 = document.getElementById("f-kit-color1"), c2 = document.getElementById("f-kit-color2"), c3 = document.getElementById("f-kit-color3");
  if(!el || !baseSel || !c1 || !c2 || !c3) return;
  const layers = readLayerRows(document.getElementById("kit-layer-rows"));
  const backLayers = readLayerRows(document.getElementById("kit-back-layer-rows"));
  const backNumberFields = readBackNumberFields();
  const backNameFields = readBackNameFields();
  const previewNumberEl = document.getElementById("f-kit-preview-number");
  const previewNameEl = document.getElementById("f-kit-preview-name");
  const previewNumber = previewNumberEl && previewNumberEl.value!=="" ? Math.max(0, Math.min(999, parseInt(previewNumberEl.value)||0)) : 10;
  const previewName = previewNameEl ? previewNameEl.value.slice(0,50) : "APELLIDO";
  const kitCategory = baseSel.dataset.category || "jugador";
  const tempKit = {category:kitCategory, baseNumber:parseInt(baseSel.value), color1:c1.value, color2:c2.value, color3:c3.value, layers, backLayers, ...backNumberFields, ...backNameFields, previewNumber, previewName};
  try{
    const url = await buildKitDataURL(tempKit, 450);
    el.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    document.querySelectorAll("#kit-combo-rows .combo-preview-shirt").forEach(div=>{
      div.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:contain;">`;
    });
  }catch(e){ /* base aún no disponible */ }
  if(elBack){
    try{
      const urlBack = await buildKitBackDataURL(tempKit, 450);
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
    const badgeTempKit = {baseNumber:parseInt(baseSel.value), color1:c1.value, color2:c2.value, color3:c3.value, ...badgeNumberFields, ...badgeNameFields, badgePreviewNumber, badgePreviewName};
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
      const lc = await recolorToCanvas(layer.img, color1, color2, color3, w, h);
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
async function buildKitDataURL(kit, size){
  size = size || 300;
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
      const lc = await recolorToCanvas(layer.img, kit.color1, kit.color2, kit.color3, size, size);
      ctx.drawImage(lc, 0, 0);
    } else {
      const li = await loadImg(layer.img);
      ctx.drawImage(li, 0, 0, size, size);
    }
  }
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
  size = size || 300;
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
      const lc = await recolorToCanvas(layer.img, kit.color1, kit.color2, kit.color3, size, size);
      ctx.drawImage(lc, 0, 0);
    } else {
      const li = await loadImg(layer.img);
      ctx.drawImage(li, 0, 0, size, size);
    }
  }
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
