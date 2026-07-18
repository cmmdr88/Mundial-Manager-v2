/* =========================================================
   COPA MANAGER 2026 — uniformes/modelo-kits.js
   Modelo de uniformes: constructores por defecto de bases (camisetas,
   shorts, calcetas, back bases) y tipografías de dorsal, registro de
   tipos de prenda (garmentConfig), carga/registro de fuentes y helpers
   de nombre/etiqueta. Extracción mecánica: texto y orden idénticos al
   original. Script CLÁSICO (no module). Cargar DESPUÉS de
   datos/constantes.js (KIT_BASE_SEED, SHORTS_BASE_SEED, SOCKS_BASE_SEED,
   NUMBER_FONT_SEED, BACK_BASE_SEED, GARMENT_TYPES, GARMENT_DISPLAY_PREFIX)
   y core/utilidades.js (uid), y ANTES del <script> inline. Lee DB en
   tiempo de ejecución. La caché _loadedNumberFontFamilies vive aquí; el
   inline la referencia (borra entradas al eliminar fuentes). No llama a
   motor-grafico: la función puente drawBackNumberOnCanvas permanece en el
   inline.
   ========================================================= */

// ---- Bases de uniformes (kits) ----
// Cada "base" es una plantilla PNG recoloreable (3 colores: rojo ff0000, azul 0000ff, verde 00ff00)
// más su textura/outline, que va siempre encima y nunca se recolorea. Numeradas desde 1, sin límite.
function buildDefaultKitBases(){
  return KIT_BASE_SEED.map(b=>({id:uid(), number:b.number, baseImg:b.baseImg, backImg:b.backImg||null, gkImg:b.gkImg||null, gkBackImg:b.gkBackImg||null, label:b.label||""}));
}

// ---- Shorts (mismo esquema que las camisetas: bases recoloreables + textura fija compartida) ----
function buildDefaultShortsBases(){
  return SHORTS_BASE_SEED.map(b=>({id:uid(), number:b.number, baseImg:b.baseImg, label:b.label||""}));
}

// ---- Calcetas (mismo esquema) ----
function buildDefaultSocksBases(){
  return SOCKS_BASE_SEED.map(b=>({id:uid(), number:b.number, baseImg:b.baseImg, label:b.label||""}));
}

// Tipografías para el número del dorso. font0001 es la tipografía por defecto.
// Se guardan como OTF en base64 y se registran en tiempo de ejecución como FontFace
// para poder dibujarlas en el canvas del dorso.
function buildDefaultNumberFonts(){
  return NUMBER_FONT_SEED.map(f=>({id:uid(), number:f.number, fontData:f.fontData, label:f.label||""}));
}

// "Back" — bases cuadradas recoloreables (rojo=color1, igual que las demás prendas) usadas para el
// cuadro de número+nombre en el perfil del jugador. Back1 es el respaldo: si un Shirt no tiene un
// Back con el mismo número, se usa Back1. El nombre opcional de un Back se hereda del Shirt
// correspondiente (mismo número) — no tiene campo de etiqueta propio, ver backBaseDisplayLabel().
function buildDefaultBackBases(){
  return BACK_BASE_SEED.map(b=>({id:uid(), number:b.number, baseImg:b.baseImg}));
}

// Registro genérico de tipos de prenda — Camisetas ya existía (kitBases/kitTexture); Shorts y Calcetas
// siguen exactamente el mismo esquema, cada una con su propia numeración 0001, 0002... independiente.
function garmentConfig(type){ return GARMENT_TYPES.find(g=>g.type===type); }

// ---------- Tipografías para el número del dorso ----------
function numberFontLabel(f){ return "Font" + f.number + (f.label ? ` (${f.label})` : ""); }
function numberFontFamily(f){ return "kitnumfont_" + f.id; }
const _loadedNumberFontFamilies = {}; // id -> Promise<string> (familia ya registrada en document.fonts)
function ensureNumberFontLoaded(entry){
  if(!entry) return Promise.resolve(null);
  if(_loadedNumberFontFamilies[entry.id]) return _loadedNumberFontFamilies[entry.id];
  const family = numberFontFamily(entry);
  const p = (async ()=>{
    try{
      const face = new FontFace(family, `url(${entry.fontData})`);
      await face.load();
      document.fonts.add(face);
    }catch(e){ /* fuente inválida o no soportada por el navegador */ }
    return family;
  })();
  _loadedNumberFontFamilies[entry.id] = p;
  return p;
}
function getNumberFont(id){ return DB.numberFonts.find(f=>f.id===id) || DB.numberFonts[0] || null; }
// Zonas exactas para el nombre y el número, medidas en píxeles sobre la plantilla de referencia
// "BASE26_numeros.png" (1080x1080, versión ajustada/recortada) y convertidas a fracción del
// canvas (0..1), para que funcionen igual sin importar el tamaño al que se renderice el dorso.
// Igual que BACK_TEXT_BOXES pero para el cuadro cuadrado "Back" del perfil del jugador — medidas
// sobre la plantilla de referencia "nombres.png" (300x300) que indica dónde van el nombre y el
// número dentro del cuadro (a diferencia del dorso, aquí no hay forma de playera, es un cuadro liso).
// El nombre opcional de un Back no es propio — se hereda siempre del Shirt con el mismo número
// (así, si renombras "Shirt1" a "Shirt1 (Plano)", "Back1" se ve automáticamente como "Back1 (Plano)").
function backBaseDisplayLabel(b){
  const shirt = DB.kitBases.find(s=>s.number===b.number);
  return "Back" + b.number + ((shirt && shirt.label) ? ` (${shirt.label})` : "");
}
// Busca el Back que corresponde a un número de Shirt — si ese número no tiene Back propio, se cae
// al Back1 (el respaldo universal), y si ni eso existe, no hay cuadro que dibujar.
function getBackBaseForShirtNumber(shirtNumber){
  return DB.backBases.find(b=>b.number===shirtNumber) || DB.backBases.find(b=>b.number===1) || null;
}

function padKitNumber(n){ return String(n).padStart(4,"0"); }
// Prefijo "bonito" para mostrar de cada tipo de prenda — con mayúscula inicial, y "shorts" se
// muestra en singular ("Short") para que junto al número quede "Short1", como pidió el usuario.
// Nombre para mostrar de una base de prenda — agrega la etiqueta personalizada entre paréntesis
// si el usuario le puso una (ej. "Shirt1 (Plano)"), para tener más contexto al elegir en los selects.
function garmentName(type, number){
  const cfg = garmentConfig(type);
  const base = cfg && DB[cfg.basesKey] ? DB[cfg.basesKey].find(b=>b.number===number) : null;
  const baseName = (GARMENT_DISPLAY_PREFIX[type] || type) + number;
  return (base && base.label) ? `${baseName} (${base.label})` : baseName;
}

// Determina la extensión correcta del archivo de tipografía a partir de su MIME type embebido en
// el data: URL — para que el botón "Descargar" entregue el archivo con la extensión que le
// corresponde (.otf/.ttf/.woff/.woff2) en vez de un nombre genérico.
function fontDataUrlExtension(dataUrl){
  const m = (dataUrl||"").match(/^data:([^;]+);base64,/);
  if(!m) return "otf";
  const mime = m[1].toLowerCase();
  if(mime.includes("woff2")) return "woff2";
  if(mime.includes("woff")) return "woff";
  if(mime.includes("ttf") || mime.includes("truetype")) return "ttf";
  return "otf";
}

/* ===== Corrección de frontera arquitectónica (paso 21) — datos de kits =====
   Las siguientes funciones se incorporaron desde el bloque ui-kits por ser
   MODELO DE DATOS (constructores/normalizadores de kits y combos, etiquetas
   derivadas), no presentación. Consumidas por buildDefaultDB/migración/
   handleAction (núcleo) y por ui-kits. Ver "Decisiones arquitectónicas".
   ===================================================================== */

function defaultCombo(color1, color2, color3){
  return {
    shortsBaseNumber: DB.shortsBases[0] ? DB.shortsBases[0].number : 1,
    shortsColor1:color1||"#4F46E5", shortsColor2:color2||"#15161D", shortsColor3:color3||"#FFFFFF", shortsLayers:[],
    socksBaseNumber: DB.socksBases[0] ? DB.socksBases[0].number : 1,
    socksColor1:color1||"#4F46E5", socksColor2:color2||"#15161D", socksColor3:color3||"#FFFFFF", socksLayers:[]
  };
}
function cloneCombo(combo){
  return JSON.parse(JSON.stringify(combo));
}

function kitOrdinalLabel(n){ return KIT_ORDINAL_LABELS[n] || ("Uniforme "+(n+1)); }
function autoKitLabel(team, category){
  if(category==="jugador"){
    const n = team.kits.filter(k=>k.category==="jugador").length;
    return kitOrdinalLabel(n);
  }
  const n = team.kits.filter(k=>k.category==="portero").length;
  return "Portero "+kitOrdinalLabel(n);
}
function ensureTeamKits(t){
  if(!Array.isArray(t.kits)) t.kits = [];
  if(t.kits.length===0){
    t.kits.push({id:newId("kit"), category:"jugador", label:kitOrdinalLabel(0), baseNumber:1, color1:t.color1||"#4F46E5", color2:t.color2||"#15161D", color3:"#FFFFFF", layers:[]});
    t.kits.push({id:newId("kit"), category:"jugador", label:kitOrdinalLabel(1), baseNumber:1, color1:t.awayColor1||"#FFFFFF", color2:t.awayColor2||"#15161D", color3:"#000000", layers:[]});
  }
  while(t.kits.filter(k=>k.category==="jugador").length < 2){
    const n = t.kits.filter(k=>k.category==="jugador").length;
    t.kits.push({id:newId("kit"), category:"jugador", label:kitOrdinalLabel(n), baseNumber:1, color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", layers:[]});
  }
  while(t.kits.filter(k=>k.category==="portero").length < 1){
    const n = t.kits.filter(k=>k.category==="portero").length;
    t.kits.push({id:newId("kit"), category:"portero", label:"Portero "+kitOrdinalLabel(n), baseNumber:1, color1:"#2E2E2E", color2:"#39FF14", color3:"#FFFFFF", layers:[]});
  }
  t.kits.forEach(k=>{
    if(k.color3===undefined) k.color3 = "#FFFFFF";
    if(k.color1===undefined) k.color1 = "#4F46E5";
    if(k.color2===undefined) k.color2 = "#15161D";
    if(!Array.isArray(k.combinations) || k.combinations.length===0){
      k.combinations = [defaultCombo(k.color1, k.color2, k.color3)];
    }
    // Migración de vuelta: si la playera había quedado dentro de la combinación (versión anterior),
    // se regresa al uniforme (solo si éste todavía no tiene la suya) y se quita de las combinaciones.
    const c0 = k.combinations[0];
    if(k.baseNumber===undefined && c0 && c0.shirtBaseNumber!==undefined){
      k.baseNumber = c0.shirtBaseNumber; k.color1 = c0.shirtColor1; k.color2 = c0.shirtColor2; k.color3 = c0.shirtColor3;
      k.layers = Array.isArray(c0.shirtLayers) ? c0.shirtLayers.map(l=>({...l})) : [];
    }
    k.combinations.forEach(c=>{
      delete c.shirtBaseNumber; delete c.shirtColor1; delete c.shirtColor2; delete c.shirtColor3; delete c.shirtLayers;
      if(!Array.isArray(c.shortsLayers)) c.shortsLayers = [];
      if(!Array.isArray(c.socksLayers)) c.socksLayers = [];
      if(c.shortsBaseNumber===undefined) c.shortsBaseNumber = DB.shortsBases[0] ? DB.shortsBases[0].number : 1;
      if(c.socksBaseNumber===undefined) c.socksBaseNumber = DB.socksBases[0] ? DB.socksBases[0].number : 1;
    });
    if(!Array.isArray(k.layers)) k.layers = [];
    if(!Array.isArray(k.backLayers)) k.backLayers = [];
    if(k.backNumberFontId===undefined) k.backNumberFontId = DB.numberFonts[0] ? DB.numberFonts[0].id : null;
    if(k.backNumberColor===undefined) k.backNumberColor = "#FFFFFF";
    if(k.backNumberOutline===undefined) k.backNumberOutline = false;
    if(k.backNumberOutlineColor===undefined) k.backNumberOutlineColor = "#000000";
    if(k.backNumberOutlineWidth===undefined) k.backNumberOutlineWidth = 4;
    if(k.backNumberSizePct==null) k.backNumberSizePct = 100;
    if(k.backNumberLetterSpacing==null) k.backNumberLetterSpacing = 0;
    if(k.backNumberOffsetX==null) k.backNumberOffsetX = 0;
    if(k.backNumberOffsetY==null) k.backNumberOffsetY = 0;
    if(k.backNameFontLinked===undefined) k.backNameFontLinked = true;
    if(k.backNameColorLinked===undefined) k.backNameColorLinked = true;
    if(k.backNameOutlineLinked===undefined) k.backNameOutlineLinked = true;
    k.backNameFontId = k.backNameFontLinked ? k.backNumberFontId : (k.backNameFontId!==undefined ? k.backNameFontId : k.backNumberFontId);
    k.backNameColor = k.backNameColorLinked ? k.backNumberColor : (k.backNameColor!==undefined ? k.backNameColor : k.backNumberColor);
    k.backNameOutline = k.backNameOutlineLinked ? k.backNumberOutline : !!k.backNameOutline;
    k.backNameOutlineColor = k.backNameOutlineLinked ? k.backNumberOutlineColor : (k.backNameOutlineColor!==undefined ? k.backNameOutlineColor : k.backNumberOutlineColor);
    k.backNameOutlineWidth = k.backNameOutlineLinked ? k.backNumberOutlineWidth : (k.backNameOutlineWidth!=null ? k.backNameOutlineWidth : k.backNumberOutlineWidth);
    delete k.backNumberSample;
    if(k.backNameSizePct==null) k.backNameSizePct = 100;
    if(k.backNameCondense==null) k.backNameCondense = false;
    if(k.backNameLetterSpacing==null) k.backNameLetterSpacing = 0;
    if(k.backNameOffsetX==null) k.backNameOffsetX = 0;
    if(k.backNameOffsetY==null) k.backNameOffsetY = 0;
    if(k.backNameArc==null) k.backNameArc = 1;
    if(!k.backNameTextCase) k.backNameTextCase = "default";
    if(k.badgeNumberLinked===undefined) k.badgeNumberLinked = true;
    if(k.badgeNameLinked===undefined) k.badgeNameLinked = true;
    k.badgeNumberFontId = k.badgeNumberLinked ? k.backNumberFontId : (k.badgeNumberFontId!==undefined ? k.badgeNumberFontId : k.backNumberFontId);
    k.badgeNumberColor = k.badgeNumberLinked ? k.backNumberColor : (k.badgeNumberColor!==undefined ? k.badgeNumberColor : k.backNumberColor);
    k.badgeNumberOutline = k.badgeNumberLinked ? k.backNumberOutline : !!k.badgeNumberOutline;
    k.badgeNumberOutlineColor = k.badgeNumberLinked ? k.backNumberOutlineColor : (k.badgeNumberOutlineColor!==undefined ? k.badgeNumberOutlineColor : k.backNumberOutlineColor);
    k.badgeNumberOutlineWidth = k.badgeNumberLinked ? k.backNumberOutlineWidth : (k.badgeNumberOutlineWidth!=null ? k.badgeNumberOutlineWidth : k.backNumberOutlineWidth);
    k.badgeNumberSizePct = k.badgeNumberLinked ? k.backNumberSizePct : (k.badgeNumberSizePct!=null ? k.badgeNumberSizePct : k.backNumberSizePct);
    k.badgeNumberLetterSpacing = k.badgeNumberLinked ? k.backNumberLetterSpacing : (k.badgeNumberLetterSpacing!=null ? k.badgeNumberLetterSpacing : k.backNumberLetterSpacing);
    k.badgeNumberOffsetX = k.badgeNumberLinked ? k.backNumberOffsetX : (k.badgeNumberOffsetX!=null ? k.badgeNumberOffsetX : k.backNumberOffsetX);
    k.badgeNumberOffsetY = k.badgeNumberLinked ? k.backNumberOffsetY : (k.badgeNumberOffsetY!=null ? k.badgeNumberOffsetY : k.backNumberOffsetY);
    k.badgeNameFontId = k.badgeNameLinked ? k.backNameFontId : (k.badgeNameFontId!==undefined ? k.badgeNameFontId : k.backNameFontId);
    k.badgeNameColor = k.badgeNameLinked ? k.backNameColor : (k.badgeNameColor!==undefined ? k.badgeNameColor : k.backNameColor);
    k.badgeNameOutline = k.badgeNameLinked ? k.backNameOutline : !!k.badgeNameOutline;
    k.badgeNameOutlineColor = k.badgeNameLinked ? k.backNameOutlineColor : (k.badgeNameOutlineColor!==undefined ? k.badgeNameOutlineColor : k.backNameOutlineColor);
    k.badgeNameOutlineWidth = k.badgeNameLinked ? k.backNameOutlineWidth : (k.badgeNameOutlineWidth!=null ? k.badgeNameOutlineWidth : k.backNameOutlineWidth);
    k.badgeNameSizePct = k.badgeNameLinked ? k.backNameSizePct : (k.badgeNameSizePct!=null ? k.badgeNameSizePct : k.backNameSizePct);
    k.badgeNameCondense = k.badgeNameLinked ? (k.backNameCondense||false) : (k.badgeNameCondense!=null ? k.badgeNameCondense : (k.backNameCondense||false));
    k.badgeNameLetterSpacing = k.badgeNameLinked ? k.backNameLetterSpacing : (k.badgeNameLetterSpacing!=null ? k.badgeNameLetterSpacing : k.backNameLetterSpacing);
    k.badgeNameOffsetX = k.badgeNameLinked ? k.backNameOffsetX : (k.badgeNameOffsetX!=null ? k.badgeNameOffsetX : k.backNameOffsetX);
    k.badgeNameOffsetY = k.badgeNameLinked ? k.backNameOffsetY : (k.badgeNameOffsetY!=null ? k.badgeNameOffsetY : k.backNameOffsetY);
    k.badgeNameArc = k.badgeNameLinked ? k.backNameArc : (k.badgeNameArc!=null ? k.badgeNameArc : k.backNameArc);
    k.badgeNameTextCase = k.badgeNameLinked ? k.backNameTextCase : (k.badgeNameTextCase || k.backNameTextCase);
    if(k.baseNumber===undefined) k.baseNumber = DB.kitBases[0] ? DB.kitBases[0].number : 1;
    if(k.category==="portero" && !Array.isArray(k.linkedJugadorKitIds)) k.linkedJugadorKitIds = [];
    k.combinations.forEach(c=>{
      if(c.shortsColor1===undefined) c.shortsColor1 = k.color1;
      if(c.shortsColor2===undefined) c.shortsColor2 = k.color2;
      if(c.shortsColor3===undefined) c.shortsColor3 = k.color3;
      if(c.socksColor1===undefined) c.socksColor1 = k.color1;
      if(c.socksColor2===undefined) c.socksColor2 = k.color2;
      if(c.socksColor3===undefined) c.socksColor3 = k.color3;
    });
  });
  // Mantiene siempre la nomenclatura correcta según el orden (Local, Visita, Tercero... / Portero Local, Portero Visita...),
  // así selecciones con nombres de versiones anteriores (Visitante, Tercera...) quedan al día solas.
  const jugadorIds = new Set(t.kits.filter(k=>k.category==="jugador").map(k=>k.id));
  t.kits.filter(k=>k.category==="portero").forEach(k=>{
    k.linkedJugadorKitIds = (k.linkedJugadorKitIds||[]).filter(id=>jugadorIds.has(id));
  });
  t.kits.filter(k=>k.category==="jugador").forEach((k,i)=>{ k.label = kitOrdinalLabel(i); });
  t.kits.filter(k=>k.category==="portero").forEach((k,i)=>{ k.label = "Portero "+kitOrdinalLabel(i); });
}
