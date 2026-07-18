/* =========================================================
   COPA MANAGER 2026 — uniformes/motor-grafico.js
   Motor gráfico de bajo nivel para uniformes: dibujo de texto
   (recto y curvo) con métricas, y recoloreo/carga de imágenes por
   canvas. NO conoce DB. Extracción mecánica: texto y orden
   idénticos al original (bloque de texto primero, imagen después).
   Script CLÁSICO (no module). Cargar DESPUÉS de core/utilidades.js
   (hexToRgb, stripDiacritics) y datos/constantes.js (VERTICAL_REF_SAMPLE,
   GARMENT_CANVAS_SIZE, RECOLORABLE_BASE_MAX_DIM), y ANTES del <script>
   inline. Nota: drawBackNumberOnCanvas NO forma parte de este motor
   (usa modelo-kits) y permanece en el inline.
   ========================================================= */

// Quita tildes/diacríticos (á→a, ñ→n, etc.) — se usa SOLO para medir la altura del texto, nunca
// para lo que se dibuja en pantalla (eso sigue siendo el texto real, con sus acentos y todo).
// Además de las tildes (marcas combinantes), hay glifos cuyo trazo sobresale por abajo o con adornos
// que NO son marcas separables: la cedilla (Ç→C), la cola de algunas Q, la Ø, etc. Para medir la
// altura/centrado del texto los reducimos a su letra base "limpia", de modo que ni la cedilla ni una
// cola de Q bajen el texto. Esto es solo para MEDIR — el texto que se dibuja conserva sus glifos.
function normalizeForVerticalMetrics(text){
  let s = stripDiacritics(text||"");
  s = s.replace(/[çÇ]/g,"C").replace(/[ØøÐðÞþ]/g,"O").replace(/[Ĳĳ]/g,"J").replace(/[ß]/g,"B");
  return s;
}
// Métrica vertical de REFERENCIA: en vez de medir el ascent/descent del texto real (que varía si
// una letra tiene cola o adorno), se mide sobre una muestra fija de mayúsculas "planas" de la misma
// tipografía y tamaño. Así el alto de caja y el centrado vertical son idénticos para cualquier nombre,
// tenga o no letras que sobresalgan hacia abajo. Se combina con la versión normalizada del texto real
// como respaldo por si la fuente no expone métricas para la muestra.
function verticalRefMetrics(ctx){
  const m = ctx.measureText(VERTICAL_REF_SAMPLE);
  // La muestra son mayúsculas planas: su tope define el "cap height" (ascent) y su base descansa en la
  // línea base, por lo que el descent de referencia es 0 A PROPÓSITO. Antes se exigía descent>0 y, como
  // estas letras no bajan, devolvía null y se caía al respaldo que sí medía la cola de la Q. Ahora el
  // descent 0 es válido: el alto del nombre se fija solo por el cap height y cualquier cola (Q, cedilla,
  // g, p…) sobresale sin encoger ni mover el texto.
  const ascent = (m.actualBoundingBoxAscent!=null && m.actualBoundingBoxAscent>0) ? m.actualBoundingBoxAscent : null;
  let descent = (m.actualBoundingBoxDescent!=null && m.actualBoundingBoxDescent>=0) ? m.actualBoundingBoxDescent : 0;
  // Redondeo defensivo: descenders residuales mínimos de la muestra se tratan como 0.
  if(descent < ascent*0.02) descent = 0;
  return { ascent, descent };
}
// Calcula el fontSize necesario para que un texto, con la tipografía dada, quepa exactamente
// dentro de un ancho/alto en píxeles (lo que sea más restrictivo), y devuelve también el
// ascent/descent reales a ese tamaño para poder centrarlo verticalmente con precisión.
// La ALTURA se mide siempre sobre la versión sin tildes del texto — así "MARTÍNEZ" ocupa
// exactamente el mismo tamaño que "MARTINEZ" (el acento ya no agranda ni achica la letra; si el
// tilde sobresale un poco de la caja, es el costo aceptado a cambio de un tamaño consistente).
// Fuerza el kerning de la tipografía en un contexto de canvas. El valor por defecto de
// ctx.fontKerning es "auto" (el navegador decide) y en algunos motores/versiones eso deja el kerning
// apagado al dibujar en canvas, con lo que pares como "AV" o "To" se ven demasiado separados. Con
// "normal" el kerning de la fuente (tabla GPOS o "kern") se aplica SIEMPRE, tanto al medir con
// measureText como al dibujar con fillText/strokeText — importante que medición y dibujo lo usen
// igual para que el centrado por tinta real no se desfase.
function enableFontKerning(ctx){
  try{ if("fontKerning" in ctx) ctx.fontKerning = "normal"; }catch(e){}
}
function fitTextMetrics(ctx, text, family, boxWidthPx, boxHeightPx, refSize, condense, flatRef){
  refSize = refSize || 200;
  ctx.font = `${refSize}px "${family}"`;
  enableFontKerning(ctx);
  // Solo el NOMBRE usa altura de referencia (flatRef): la ALTURA se mide sobre una muestra fija de
  // mayúsculas planas de la tipografía, de modo que colas hacia abajo (cedilla, cola de Q), tildes u
  // otros adornos no cambien el tamaño ni el centrado — el nombre queda con el mismo alto siempre.
  // El NÚMERO no usa flatRef: se mide con su propia tinta, exactamente como antes (no debe cambiar).
  const refV = flatRef ? verticalRefMetrics(ctx) : {ascent:null, descent:null};
  const normText = flatRef ? (normalizeForVerticalMetrics(text) || text) : (stripDiacritics(text) || text);
  const mHeight = ctx.measureText(normText);
  const mWidth = ctx.measureText(text);
  const ascent = refV.ascent!=null ? refV.ascent
    : ((mHeight.actualBoundingBoxAscent!=null && mHeight.actualBoundingBoxAscent>0) ? mHeight.actualBoundingBoxAscent : refSize*0.72);
  const descent = refV.descent!=null ? refV.descent
    : ((mHeight.actualBoundingBoxDescent!=null && mHeight.actualBoundingBoxDescent>0) ? mHeight.actualBoundingBoxDescent : 0);
  const totalH = ascent + descent;
  const totalW = mWidth.width > 0 ? mWidth.width : refSize;
  const scaleH = totalH>0 ? boxHeightPx/totalH : 1;
  const scaleW = totalW>0 ? boxWidthPx/totalW : 1;
  if(condense){
    // Modo condensado: el tamaño de la fuente se fija por la altura disponible (no se hace más
    // pequeña), y si el texto es más ancho que la caja solo se comprime horizontalmente con ctx.scale.
    const scale = scaleH;
    const scaleX = scaleW < scaleH ? scaleW/scaleH : 1; // <1 = comprimir, 1 = no toca nada
    return { fontSize: refSize*scale, ascent: ascent*scale, descent: descent*scale, scaleX };
  }
  const scale = Math.min(scaleH, scaleW);
  return { fontSize: refSize*scale, ascent: ascent*scale, descent: descent*scale, scaleX: 1 };
}
// Dibuja un texto centrado en (centerX, centerY), letra por letra (para poder controlar el
// interletrado manualmente), y si `radius` es finito lo curva siguiendo un arco (cada letra
// rotada para quedar tangente al círculo) — si es Infinity, queda recto.
// Aplica el estilo de mayúsculas/minúsculas elegido para el Nombre del dorso (y del cuadro de
// número+nombre del jugador) — "default" no transforma nada (respeta tal cual lo que esté escrito,
// importante para nombres con mayúsculas especiales en medio, como "McTominay"). Es el default real.
function applyTextCase(text, mode){
  if(!text) return text;
  switch(mode){
    case "capitalize-first": return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    case "title": return text.split(" ").map(w=>w ? w.charAt(0).toUpperCase()+w.slice(1).toLowerCase() : w).join(" ");
    case "lower": return text.toLowerCase();
    case "upper": return text.toUpperCase();
    case "default": default: return text;
  }
}
// Si se pasa `bounds` ({minX,maxX,minY,maxY} en pixeles), recorta (sin cambiar tamaño, solo
// reposicionando) la posición de dibujo para que la tinta real (medida con actualBoundingBox) nunca
// quede fuera de esa zona — usado por el Cuadro de número+nombre del jugador como "reencuadre de
// seguridad", para que un valor de Posición heredado del dorso (pensado para la silueta de la
// playera) nunca empuje el texto fuera del cuadrado. Si la tinta es más ancha/alta que la zona
// permitida ni centrada cabría, se prioriza mantener su propio centro dentro del centro de la zona
// (recorte parejo a ambos lados) en vez de dejarla descolgada hacia un borde.
function clampInkToBounds(x, y, leftM, rightM, ascentM, descentM, bounds){
  if(!bounds) return {x, y};
  let nx = x, ny = y;
  const inkW = leftM+rightM, availW = bounds.maxX-bounds.minX;
  if(inkW <= availW){
    const inkLeft = x-leftM, inkRight = x+rightM;
    if(inkLeft < bounds.minX) nx += (bounds.minX-inkLeft);
    else if(inkRight > bounds.maxX) nx -= (inkRight-bounds.maxX);
  } else {
    nx = (bounds.minX+bounds.maxX)/2 + (leftM-rightM)/2;
  }
  const inkH = ascentM+descentM, availH = bounds.maxY-bounds.minY;
  if(inkH <= availH){
    const inkTop = y-ascentM, inkBottom = y+descentM;
    if(inkTop < bounds.minY) ny += (bounds.minY-inkTop);
    else if(inkBottom > bounds.maxY) ny -= (inkBottom-bounds.maxY);
  } else {
    ny = (bounds.minY+bounds.maxY)/2 + (ascentM-descentM)/2;
  }
  return {x:nx, y:ny};
}
function drawCurvedText(ctx, text, centerX, centerY, fontSize, family, color, outline, outlineColor, outlineWidthPx, letterSpacingPx, radius, containBounds, flatRef){
  ctx.font = `${fontSize}px "${family}"`;
  enableFontKerning(ctx); // el kerning debe estar activo tanto al medir como al dibujar
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  if(!text.length) return;

  // Camino plano (sin arco): se dibuja la cadena COMPLETA en una sola llamada nativa, usando la
  // propiedad ctx.letterSpacing del canvas para el espaciado en vez de partir el texto letra por
  // letra. Dibujar carácter por carácter (como se hacía antes, y como sigue siendo necesario para el
  // texto curvo) rompe el kerning (GPOS) y las ligaduras (GSUB) de la tipografía — por ejemplo el par
  // "AV" ya no se "abraza" como debería, porque el navegador nunca ve las dos letras juntas para
  // aplicar esa información. Con una sola llamada a fillText/strokeText sobre la cadena entera, el
  // navegador sí aplica el kerning y las ligaduras propias de la fuente con normalidad.
  if(!isFinite(radius)){
    const supportsLetterSpacing = "letterSpacing" in ctx;
    if(supportsLetterSpacing) ctx.letterSpacing = `${letterSpacingPx}px`;
    // Centrado real (pixel a pixel), no por métricas de avance de la fuente: textAlign="center" por
    // sí solo centra según el "ancho de avance" del texto, que casi nunca coincide exactamente con
    // dónde empieza y termina la tinta realmente dibujada (las fuentes suelen tener un espacio lateral
    // ligeramente distinto a cada lado de cada glifo — por ejemplo "1" y "0" no pesan visualmente
    // igual). Eso es justo lo que antes obligaba a compensar a mano con "Posición horizontal", un
    // ajuste que además no se traducía igual entre el dorso y el cuadro del jugador (distinto tamaño
    // de fuente, distinto interletrado). Aquí, en cambio, medimos con measureText() el cuadro de tinta
    // REAL (actualBoundingBoxLeft/Right/Ascent/Descent) y recalculamos el punto de dibujo para que ese
    // cuadro de tinta quede exactamente centrado en (centerX, centerY) — del primer pixel al último,
    // siempre, automáticamente, sin importar el tamaño de letra ni el interletrado. La "Posición" que
    // configura el usuario sigue funcionando exactamente igual que antes (sigue moviendo el centro),
    // solo que ahora parte de una base ya perfectamente centrada en vez de una aproximación.
    let drawX = centerX, drawY = centerY;
    const m = ctx.measureText(text);
    const leftM = m.actualBoundingBoxLeft, rightM = m.actualBoundingBoxRight;
    // El centrado VERTICAL: para el NOMBRE (flatRef) se mide sobre la muestra fija de mayúsculas
    // planas, así ni un acento (arriba) ni una cola/cedilla/Q (abajo) mueven el nombre. Para el NÚMERO
    // se mide con su propia tinta (sin flatRef), como antes.
    const refV = flatRef ? verticalRefMetrics(ctx) : {ascent:null, descent:null};
    const mV = ctx.measureText((flatRef ? normalizeForVerticalMetrics(text) : stripDiacritics(text)) || text);
    const ascentM = refV.ascent!=null ? refV.ascent : mV.actualBoundingBoxAscent;
    const descentM = refV.descent!=null ? refV.descent : mV.actualBoundingBoxDescent;
    if(leftM!=null && rightM!=null){
      drawX = centerX - (rightM-leftM)/2;
    }
    if(ascentM!=null && descentM!=null){
      drawY = centerY + (ascentM-descentM)/2;
    }
    if(containBounds && leftM!=null && rightM!=null && ascentM!=null && descentM!=null){
      const clamped = clampInkToBounds(drawX, drawY, leftM, rightM, ascentM, descentM, containBounds);
      drawX = clamped.x; drawY = clamped.y;
    }
    if(outline){
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = outlineColor || "#000000";
      ctx.lineWidth = outlineWidthPx;
      ctx.strokeText(text, drawX, drawY);
    }
    ctx.fillStyle = color || "#FFFFFF";
    ctx.fillText(text, drawX, drawY);
    if(supportsLetterSpacing) ctx.letterSpacing = "0px";
    return;
  }

  // Camino curvo: cada letra necesita su propia posición/rotación sobre el arco, así que aquí sí hace
  // falta dibujarlas una por una. Antes eso también perdía el KERNING (cada letra se medía sola y el
  // par "AV" quedaba tan separado como "AH"). Ahora el avance de cada letra se obtiene midiendo las
  // subcadenas progresivas: adv[i] = ancho("ABC...i") - ancho("ABC...i-1"). Como el navegador mide la
  // subcadena completa, ese avance YA incluye el ajuste de kerning entre la letra i-1 y la i, y las
  // letras del arco quedan espaciadas igual que en el texto plano. (Las ligaduras siguen sin aplicarse
  // en el arco — cada glifo se dibuja solo — pero en nombres en mayúsculas no intervienen.)
  const chars = text.split("");
  const advances = [];
  let prevW = 0;
  for(let i=0;i<chars.length;i++){
    const w = ctx.measureText(text.slice(0, i+1)).width;
    advances.push(w - prevW);
    prevW = w;
  }
  const spacedWidths = advances.map(w=>w+letterSpacingPx);
  const totalWidth = spacedWidths.reduce((a,b)=>a+b,0) - letterSpacingPx;

  function paintChar(c, x, y, rot){
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if(outline){
      ctx.lineJoin = "round";
      ctx.miterLimit = 2;
      ctx.strokeStyle = outlineColor || "#000000";
      ctx.lineWidth = outlineWidthPx;
      ctx.strokeText(c, 0, 0);
    }
    ctx.fillStyle = color || "#FFFFFF";
    ctx.fillText(c, 0, 0);
    ctx.restore();
  }

  const totalAngle = totalWidth/radius;
  let angle = -totalAngle/2;
  chars.forEach((c,i)=>{
    const charAngle = angle + (advances[i]/2)/radius;
    const px = centerX + radius*Math.sin(charAngle);
    const py = centerY - radius*Math.cos(charAngle) + radius;
    paintChar(c, px, py, charAngle);
    angle += spacedWidths[i]/radius;
  });
}
// Radio del arco según la intensidad elegida (1 = plano/sin curva, 2 = arqueado, 3 = muy arqueado),
// relativo al ancho de la caja del nombre — mientras más chico el radio, más pronunciada la curva.
function arcRadiusFor(level, boxW){
  if(level===3) return boxW*0.62;
  if(level===2) return boxW*1.25;
  return Infinity;
}
// Dibuja un texto (nombre o número) dentro de su caja aplicando tamaño (%), interletrado, posición
// horizontal/vertical (offsetX/offsetY) y arco — el tamaño base (100%) sigue siendo el que calcula
// fitTextMetrics. El arco solo lo usa el nombre (el número siempre llama con arcLevel=1, plano).
// condense=true: mantiene el tamaño por altura y comprime solo horizontalmente si el nombre es largo.
function drawTextWithStyle(ctx, box, text, family, color, outline, outlineColor, outlineWidthInput, sizePct, letterSpacingInput, offsetXInput, offsetYInput, arcLevel, size, outlineScale, containBounds, condense, flatRef){
  const boxW = (box.right-box.left)*size, boxH = (box.bottom-box.top)*size;
  const baseFit = fitTextMetrics(ctx, text, family, boxW, boxH, undefined, condense, flatRef);
  const scale = (sizePct!=null ? sizePct : 100)/100;
  const fontSize = baseFit.fontSize * scale;
  const ascent = baseFit.ascent * scale, descent = baseFit.descent * scale;
  const scaleX = baseFit.scaleX ?? 1;
  const letterSpacingPx = (letterSpacingInput||0) * outlineScale;
  const outlineWidthPx = Math.max(0, (outlineWidthInput!=null?outlineWidthInput:4) * outlineScale * 2);
  const cx = (box.left+box.right)/2*size + (offsetXInput||0)*outlineScale;
  const cyBase = (box.top+box.bottom)/2*size + (offsetYInput||0)*outlineScale;
  const radius = arcRadiusFor(arcLevel, boxW);
  const cy = isFinite(radius) ? cyBase + (ascent-descent)/2 : cyBase;
  if(condense && scaleX < 1){
    ctx.save();
    ctx.scale(scaleX, 1);
    const cxS = cx/scaleX;
    const cbS = containBounds ? {minX:containBounds.minX/scaleX, maxX:containBounds.maxX/scaleX, minY:containBounds.minY, maxY:containBounds.maxY} : null;
    const radS = isFinite(radius) ? radius/scaleX : Infinity;
    drawCurvedText(ctx, text, cxS, cy, fontSize, family, color, outline, outlineColor, outlineWidthPx, letterSpacingPx/scaleX, radS, cbS, flatRef);
    ctx.restore();
  } else {
    drawCurvedText(ctx, text, cx, cy, fontSize, family, color, outline, outlineColor, outlineWidthPx, letterSpacingPx, radius, containBounds, flatRef);
  }
}

// ——— Reencuadre vertical del cuadro nombre+número ———
// Predice el rango vertical de tinta de un texto del cuadro usando LAS MISMAS fórmulas del dibujo
// (fitTextMetrics para el tamaño; muestra plana fija de mayúsculas para el nombre, tinta propia
// para el número), sin pintar nada. Como el tamaño del nombre se calcula por ALTURA (condense solo
// comprime a lo ancho) y la muestra vertical del nombre es fija, el resultado es idéntico para
// todos los jugadores de un mismo uniforme: el reencuadre les aplica a todos por igual y los
// nombres conservan exactamente el mismo tamaño entre sí.
function badgeTextVerticalInk(ctx, box, text, family, sizePct, offsetYInput, arcLevel, size, outlineScale, outlineOn, outlineWidthInput, condense, flatRef){
  const boxW = (box.right-box.left)*size, boxH = (box.bottom-box.top)*size;
  const baseFit = fitTextMetrics(ctx, text, family, boxW, boxH, undefined, condense, flatRef);
  const scale = (sizePct!=null ? sizePct : 100)/100;
  const fontSize = baseFit.fontSize * scale;
  const ascentF = baseFit.ascent * scale, descentF = baseFit.descent * scale;
  const cyBase = (box.top+box.bottom)/2*size + (offsetYInput||0)*outlineScale;
  const radius = arcRadiusFor(arcLevel, boxW);
  const cy = isFinite(radius) ? cyBase + (ascentF-descentF)/2 : cyBase;
  ctx.save();
  ctx.font = `${fontSize}px "${family}"`;
  let ascentM = null, descentM = null;
  if(flatRef){ const rv = verticalRefMetrics(ctx); ascentM = rv.ascent; descentM = rv.descent; }
  if(ascentM==null || descentM==null){
    const mV = ctx.measureText((flatRef ? normalizeForVerticalMetrics(text) : stripDiacritics(text)) || text);
    ascentM = mV.actualBoundingBoxAscent||0; descentM = mV.actualBoundingBoxDescent||0;
  }
  ctx.restore();
  // El dibujo plano recoloca el punto de dibujo para que esta tinta quede centrada en cy;
  // el contorno (stroke centrado en el trazo) asoma la mitad de su grosor hacia afuera.
  const half = (ascentM+descentM)/2 + (outlineOn ? Math.max(0,(outlineWidthInput!=null?outlineWidthInput:4)*outlineScale*2)/2 : 0);
  return {top: cy-half, bottom: cy+half};
}
// Con las tintas previstas de nombre y número produce la transformación de grupo del cuadro:
// desplaza el CONJUNTO (manteniendo intacta la distancia configurada entre nombre y número) para
// que quede centrado verticalmente y, solo si la configuración lo saca del cuadro, reduce el grupo
// completo por igual hasta que quepa. El factor sale de la configuración del uniforme (no del
// jugador), así que todos los cuadros de una misma selección se reencuadran exactamente igual.
function badgeGroupTransform(inks, size){
  const top = Math.min(...inks.map(i=>i.top)), bottom = Math.max(...inks.map(i=>i.bottom));
  const minY = size*0.05, maxY = size*0.95;
  const f = Math.min(1, (maxY-minY)/Math.max(1, bottom-top));
  const gCy = (top+bottom)/2, targetCy = size/2;
  const toLocalX = x => size/2 + (x-size/2)/f;
  const toLocalY = y => gCy + (y-targetCy)/f;
  return {
    apply(ctx){ ctx.translate(size/2, targetCy); ctx.scale(f, f); ctx.translate(-size/2, -gCy); },
    // Límites convertidos al espacio del grupo, para que el clamp HORIZONTAL siga funcionando
    // igual que siempre (el vertical queda resuelto por el propio reencuadre).
    bounds: {minX:toLocalX(size*0.05), maxX:toLocalX(size*0.95), minY:toLocalY(minY), maxY:toLocalY(maxY)}
  };
}

/* ---------- Imágenes (escudos y camisetas) ---------- */
// Lee un archivo cualquiera (ej. tipografía .otf/.ttf) como data: URL, sin procesarlo —
// a diferencia de resizeImageToDataURL, que sí espera una imagen y la redimensiona con canvas.
function readFileAsDataURL(file){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = ()=> resolve(reader.result);
    reader.onerror = ()=> reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}
function resizeImageToDataURL(file, maxDim){
  return new Promise((resolve, reject)=>{
    if(!file.type || !file.type.startsWith("image/")){ reject(new Error("No es una imagen")); return; }
    const reader = new FileReader();
    reader.onload = ()=>{
      const img = new Image();
      img.onload = ()=>{
        let w = img.width, h = img.height;
        const scale = Math.min(1, maxDim / Math.max(w, h));
        w = Math.max(1, Math.round(w * scale));
        h = Math.max(1, Math.round(h * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = ()=>reject(new Error("No se pudo leer la imagen"));
      img.src = reader.result;
    };
    reader.onerror = ()=>reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

/* ---------- Motor de recoloreado de uniformes ---------- */
// Las bases usan 3 colores plantilla: rojo ff0000, azul 0000ff, verde 00ff00.
// Cada uno se reemplaza por el color 1/2/3 que el usuario elija para ese uniforme.
// La textura/outline (KIT_TEXTURE_DEFAULT / DB.kitTexture) nunca se recolorea.
function loadImg(src){
  return new Promise((resolve,reject)=>{
    const img = new Image();
    img.onload = ()=>resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
// Caché del recoloreado "nativo" (antes de escalar) por combinación base+colores — recolorear pixel
// por pixel a resolución nativa es el paso costoso; varias partes de la pantalla (preview grande,
// miniatura de la lista, combinación, etc.) suelen pedir la MISMA base con los MISMOS colores pero a
// tamaños finales distintos, así que conviene resolver ese paso una sola vez y solo reescalar después.
const _nativeRecolorCache = new Map();
function _nativeRecolorCacheKey(src, color1, color2, color3){ return src.length+"|"+src.slice(-40)+"|"+color1+"|"+color2+"|"+color3; }
async function recolorToCanvas(src, color1, color2, color3, w, h){
  if(h===undefined) h = w;
  const cacheKey = _nativeRecolorCacheKey(src, color1, color2, color3);
  let nativePromise = _nativeRecolorCache.get(cacheKey);
  if(!nativePromise){
    nativePromise = (async ()=>{
      const img = await loadImg(src);
      // Paso 1: recolorear SIEMPRE a la resolución nativa de la imagen fuente, ANTES de escalar. Si se
      // escala primero y se recolorea después, el navegador ya mezcló pixeles de zonas de color distintas
      // entre sí durante el escalado (ej. rojo de una raya con verde de la raya vecina), perdiendo para
      // siempre la información de a qué zona pertenecía cada uno — ningún criterio posterior puede
      // reconstruir eso, y el resultado son líneas/recuadros grises falsos exactamente en cada borde entre
      // dos colores. Al recolorear primero (sobre los colores originales, sin mezclar) y escalar después
      // (cuando los dos lados de cada borde ya comparten, casi siempre, el mismo color final), el
      // suavizado del escalado ya no tiene nada incorrecto que mezclar.
      const nw = img.naturalWidth || img.width, nh = img.naturalHeight || img.height;
      const nativeCanvas = document.createElement("canvas");
      nativeCanvas.width = nw; nativeCanvas.height = nh;
      const nctx = nativeCanvas.getContext("2d");
      nctx.drawImage(img, 0, 0, nw, nh);
      const data = nctx.getImageData(0, 0, nw, nh);
      const d = data.data;
      const [r1,g1,b1] = hexToRgb(color1), [r2,g2,b2] = hexToRgb(color2), [r3,g3,b3] = hexToRgb(color3);
      // Mezcla suave por "segmento más cercano": el PNG fuente tiene 5 colores de referencia posibles
      // en cualquier borde (rojo/azul/verde puros = máscaras de color1/2/3, blanco = fondo, negro =
      // contorno). Un pixel de borde antialiased es casi siempre una mezcla de exactamente DOS de esas
      // referencias — para encontrar cuáles dos, se prueban los 10 pares posibles y se elige aquel
      // cuyo SEGMENTO (la línea recta entre ambos colores) pasa más cerca del pixel real — no solo
      // "cuál de las 5 referencias está más cerca" (eso fallaba: un pixel mezcla de rojo+verde podía
      // salir numéricamente más cerca del negro que de cualquiera de los dos, clasificándose mal y
      // generando una franja gris). Con el segmento correcto identificado, se reconstruye esa misma
      // mezcla pero con los colores NUEVOS, dando un borde suave y sin grises falsos. Ahora que las
      // imágenes se suben a resolución completa (ya no se degradan al cargarlas), los pixeles de borde
      // son antialiasing genuino de 1-2 pixeles, así que este método ya no tropieza como antes.
      const REF_ORIG = [255,0,0, 0,0,255, 0,255,0, 255,255,255, 0,0,0];
      const REF_TARGET = [r1,g1,b1, r2,g2,b2, r3,g3,b3, 255,255,255, 0,0,0];
      const PAIRS = [[0,1],[0,2],[0,3],[0,4],[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]];
      for(let i=0;i<d.length;i+=4){
        const r=d[i], g=d[i+1], b=d[i+2], a=d[i+3];
        if(a===0) continue;
        const maxV = Math.max(r,g,b), minV = Math.min(r,g,b);
        // Camino rápido para pixeles claramente puros (la inmensa mayoría de cada zona de relleno).
        if(maxV<15 && minV<15) continue; // negro puro
        if(minV>240) continue; // blanco puro
        if(r>200 && g<60 && b<60){ d[i]=r1; d[i+1]=g1; d[i+2]=b1; continue; }
        if(b>200 && r<60 && g<60){ d[i]=r2; d[i+1]=g2; d[i+2]=b2; continue; }
        if(g>200 && r<60 && b<60){ d[i]=r3; d[i+1]=g3; d[i+2]=b3; continue; }
        // Camino lento: pixel ambiguo (borde antialiased) — busca, de los 10 pares posibles entre las
        // 5 referencias, cuál segmento pasa más cerca del pixel real (distancia perpendicular).
        let bestDist=Infinity, bestT=0, bestPair=null;
        for(let p=0;p<10;p++){
          const i0=PAIRS[p][0], i1=PAIRS[p][1];
          const ax=REF_ORIG[i0*3], ay=REF_ORIG[i0*3+1], az=REF_ORIG[i0*3+2];
          const bx=REF_ORIG[i1*3], by=REF_ORIG[i1*3+1], bz=REF_ORIG[i1*3+2];
          const abx=bx-ax, aby=by-ay, abz=bz-az;
          const abLenSq = abx*abx+aby*aby+abz*abz;
          let t = abLenSq>0 ? ((r-ax)*abx+(g-ay)*aby+(b-az)*abz)/abLenSq : 0;
          t = Math.max(0, Math.min(1, t));
          const fx=ax+t*abx, fy=ay+t*aby, fz=az+t*abz;
          const dist = (r-fx)*(r-fx)+(g-fy)*(g-fy)+(b-fz)*(b-fz);
          if(dist<bestDist){ bestDist=dist; bestT=t; bestPair=[i0,i1]; }
        }
        const tax=REF_TARGET[bestPair[0]*3], tay=REF_TARGET[bestPair[0]*3+1], taz=REF_TARGET[bestPair[0]*3+2];
        const tbx=REF_TARGET[bestPair[1]*3], tby=REF_TARGET[bestPair[1]*3+1], tbz=REF_TARGET[bestPair[1]*3+2];
        d[i]=tax+(tbx-tax)*bestT; d[i+1]=tay+(tby-tay)*bestT; d[i+2]=taz+(tbz-taz)*bestT;
      }
      nctx.putImageData(data, 0, 0);
      return nativeCanvas;
    })();
    _nativeRecolorCache.set(cacheKey, nativePromise);
  }
  const nativeCanvas = await nativePromise;
  // Paso 2: ya con todo recoloreado correctamente a resolución nativa, se escala al tamaño final
  // pedido — con suavizado de alta calidad, y sin riesgo de mezclar dos colores distintos porque
  // ambos lados de cada borde ya tienen su color definitivo.
  if(nativeCanvas.width === w && nativeCanvas.height === h) return nativeCanvas;
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(nativeCanvas, 0, 0, w, h);
  return canvas;
}
