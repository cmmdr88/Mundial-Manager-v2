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
  // Los uniformes de árbitro se numeran Kit 1, Kit 2… (no tienen Local/Visita).
  if(category==="arbitro") return "Kit " + (team.kits.filter(k=>k.category==="arbitro").length + 1);
  // Etiqueta provisional (ensureTeamKits reetiqueta por temporada): se cuenta dentro de la temporada visible.
  const sid = (typeof window!=="undefined" && window.KIT_ERA_VIEW) || null;
  const n = (team.kits||[]).filter(k=>k.category===category && (sid? k.seasonId===sid : true)).length;
  return category==="jugador" ? kitOrdinalLabel(n) : ("Portero "+kitOrdinalLabel(n));
}
function normalizeKitFields(k){
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
    // --- Versiones por temporada/fecha ---
    // slotKey agrupa las versiones (por época) de una MISMA equipación (Local, Visita, Portero…).
    // Los kits antiguos sin slotKey se convierten cada uno en su propio slot (una sola versión).
    if(k.slotKey===undefined || k.slotKey===null) k.slotKey = k.id || null;
    if(k.dateStart===undefined || k.dateStart===null) k.dateStart = "";   // "" = desde siempre (base); "yyyy-mm-dd" o "yyyy-mm"
    if(k.ownDate===undefined) k.ownDate = false;                          // true = esta equipación se estrena en fecha propia
    if(k.brand===undefined) k.brand = null;                               // marca (patrocinador de indumentaria) de esta versión
    k.combinations.forEach(c=>{
      if(c.shortsColor1===undefined) c.shortsColor1 = k.color1;
      if(c.shortsColor2===undefined) c.shortsColor2 = k.color2;
      if(c.shortsColor3===undefined) c.shortsColor3 = k.color3;
      if(c.socksColor1===undefined) c.socksColor1 = k.color1;
      if(c.socksColor2===undefined) c.socksColor2 = k.color2;
      if(c.socksColor3===undefined) c.socksColor3 = k.color3;
    });
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
  t.kits.forEach(normalizeKitFields);
  ensureKitSeasons(t);
  // Los enlaces de portero→jugador solo valen DENTRO de la misma temporada (parrillas independientes).
  t.kits.filter(k=>k.category==="portero").forEach(k=>{
    const sameSeasonJug = new Set(t.kits.filter(j=>j.category==="jugador" && j.seasonId===k.seasonId).map(j=>j.id));
    k.linkedJugadorKitIds = (k.linkedJugadorKitIds||[]).filter(id=>sameSeasonJug.has(id));
  });
  // Etiquetas por TEMPORADA: dentro de cada temporada y categoría, ordinal Local/Visita/Tercero…
  // (Portero Local…). Cada temporada es una parrilla INDEPENDIENTE con sus propios kits.
  const relabel=(cat, pre)=>{
    orderedSeasons(t).forEach(s=>{
      t.kits.filter(k=>k.category===cat && k.seasonId===s.id).forEach((k,i)=>{
        k.label = pre ? (pre+kitOrdinalLabel(i)) : kitOrdinalLabel(i);
      });
    });
  };
  relabel("jugador","");
  relabel("portero","Portero ");
}
// ---- Temporadas (parrillas INDEPENDIENTES por época) de un equipo ----
// Cada temporada tiene nombre (manual), fecha de PRESENTACIÓN (calendario) y marca, y su PROPIO juego de
// equipaciones (kits con seasonId). Agregar/eliminar un kit en una temporada NO toca las demás.
function ensureKitSeasons(team){
  if(!team || team.isRefereeKits) return;
  if(!Array.isArray(team.kitSeasons)) team.kitSeasons=[];
  const kits=(team.kits||[]).filter(k=>k.category!=="arbitro");
  const byId={}; team.kitSeasons.forEach(s=>{ byId[s.id]=s; });
  // Kits sin temporada válida → temporada base (reutiliza una con fecha "" o la crea con el año del juego).
  const seasonless=kits.filter(k=>!(k.seasonId && byId[k.seasonId]));
  if(seasonless.length){
    let base=team.kitSeasons.find(s=>String(s.date||"")==="") || null;
    if(!base){ base={id:newId("ksn"), name:(String(kitTodayISO()).slice(0,4)||"Base"), date:"", brand:(team.kitSponsor||null)}; team.kitSeasons.push(base); byId[base.id]=base; }
    seasonless.forEach(k=>{ k.seasonId=base.id; });
  }
  // Poda temporadas sin kits y ordena por fecha de presentación.
  const used=new Set(kits.map(k=>k.seasonId));
  team.kitSeasons=team.kitSeasons.filter(s=>used.has(s.id));
  team.kitSeasons.sort((a,b)=>kitDateExpand(a.date).localeCompare(kitDateExpand(b.date)));
}
function kitSeasonOf(team,k){ return ((team&&team.kitSeasons)||[]).find(s=>s.id===(k&&k.seasonId))||null; }
function orderedSeasons(team){ return ((team&&team.kitSeasons)||[]).slice().sort((a,b)=>kitDateExpand(a.date).localeCompare(kitDateExpand(b.date))); }
// Id de la temporada VIGENTE en una fecha (por defecto, la fecha del juego): la de mayor presentación <= fecha.
function currentSeasonId(team, dateISO){
  const ss=orderedSeasons(team); if(!ss.length) return null;
  const d=kitDateExpand(dateISO || kitTodayISO()); let pick=ss[0];
  ss.forEach(s=>{ if(kitDateExpand(s.date)<=d) pick=s; }); return pick.id;
}
// Kits de una temporada y categoría, en orden (define el ordinal Local/Visita/…).
function seasonKitsCat(team, seasonId, category){
  return ((team&&team.kits)||[]).filter(k=>k.category===category && k.seasonId===seasonId);
}
// Un kit por parrilla vigente HOY (para perfiles/vistas): la temporada actual, por categoría.
function currentSlotKits(team, category){
  return seasonKitsCat(team, currentSeasonId(team, kitTodayISO()), category);
}
// Resolución para el informe: temporada vigente a la FECHA del partido → kit por ordinal (Local=1…).
// Si ese kit tiene fecha propia posterior al partido, retrocede a la temporada anterior.
function seasonKitByOrdinal(team, category, num, dateISO){
  const ss=orderedSeasons(team); if(!ss.length) return null;
  let si=ss.findIndex(s=>s.id===currentSeasonId(team, dateISO)); if(si<0) si=0;
  const idx=(num!=null && num>=1)?(num-1):0;
  const d=kitDateExpand(dateISO || "9999-12-31");
  for(let i=si;i>=0;i--){
    const kits=seasonKitsCat(team, ss[i].id, category);
    const k=kits[idx]||kits[0];
    if(!k) continue;
    if(k.ownDate && kitDateExpand(k.dateStart) > d) continue;   // fecha propia aún no presentada
    return k;
  }
  const first=seasonKitsCat(team, ss[0].id, category);
  return first[idx]||first[0]||null;
}
// Normaliza una fecha a "yyyy-mm-dd" comparable ("" = desde siempre → mínimo).
function kitDateExpand(s){
  s=String(s||"").trim();
  if(!s) return "0000-00-00";
  if(/^\d{4}$/.test(s)) return s+"-01-01";
  if(/^\d{4}-\d{2}$/.test(s)) return s+"-01";
  return s;   // se asume yyyy-mm-dd
}
// Fecha actual del juego como ISO (para elegir la temporada vigente en perfiles/vistas).
function kitTodayISO(){
  try{ const d=(window.GameTime&&GameTime.now)?GameTime.now():new Date(); const p=n=>String(n).padStart(2,"0");
    return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`; }catch(e){ return ""; }
}
const KIT_MESES=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
// Interpreta lo que teclea el usuario ("d/m/aaaa", "m/aaaa", "aaaa", o ISO) → "yyyy-mm-dd" / "yyyy-mm" / "".
function parseUserKitDate(str){
  str=String(str||"").trim(); if(!str) return "";
  if(/^\d{4}-\d{2}-\d{2}$/.test(str) || /^\d{4}-\d{2}$/.test(str) || /^\d{4}$/.test(str)) return str;  // ya ISO
  const p=str.split(/[\/\-.\s]+/).filter(Boolean).map(x=>parseInt(x,10));
  const pad=n=>String(n).padStart(2,"0");
  if(p.length>=3 && p[2]>=1000){ return `${p[2]}-${pad(p[1])}-${pad(p[0])}`; }   // d m aaaa
  if(p.length===2 && p[1]>=1000){ return `${p[1]}-${pad(p[0])}`; }               // m aaaa
  if(p.length===1 && p[0]>=1000){ return String(p[0]); }                          // aaaa
  return str;
}
// ISO ("yyyy-mm-dd"/"yyyy-mm"/"yyyy"/"") → texto legible para el usuario.
function formatUserKitDate(iso){
  iso=String(iso||"").trim(); if(!iso) return "";
  const m=iso.split("-").map(x=>parseInt(x,10));
  if(m.length>=3) return `${m[2]}/${m[1]}/${m[0]}`;
  if(m.length===2) return `${m[1]}/${m[0]}`;
  return String(m[0]||"");
}
// Etiqueta corta de una temporada (fecha de estreno) para la barra de navegación: "mar 2026" / "Base".
function kitEraLabel(iso){
  iso=String(iso||"").trim(); if(!iso) return "Base";
  const m=iso.split("-").map(x=>parseInt(x,10));
  const mes=(m[1]>=1&&m[1]<=12)?KIT_MESES[m[1]-1]:"";
  if(m.length>=3) return `${m[2]}${mes?" "+mes:""} ${String(m[0])}`.replace(/\s+/g," ").trim();
  if(m.length===2) return `${mes} ${m[0]}`.trim();
  return String(m[0]||"");
}

/* ---------- Uniformes de árbitros del torneo ---------- */
// Contenedor con forma de equipo (id fijo, kits, patrocinador de ropa) para poder reutilizar el
// mismo editor de uniformes de selecciones y clubes. Vive dentro del evento, no en DB.teams.
function refereeKitsTeam(){
  if(!DB.event) return null;
  if(!DB.event.refereeKitsTeam){
    DB.event.refereeKitsTeam = {id:REFEREE_KIT_TEAM_ID, commonName:"árbitros del torneo",
      isRefereeKits:true, kitSponsor:"", kits:[]};
  }
  const t = DB.event.refereeKitsTeam;
  t.id = REFEREE_KIT_TEAM_ID;
  t.isRefereeKits = true;
  if(!Array.isArray(t.kits)) t.kits = [];
  return t;
}
// Marca de ropa del torneo: la del patrocinador de indumentaria ligado al torneo. Es el valor por
// defecto del "Patrocinador de ropa" de los árbitros, hasta que se escriba uno a mano.
function tournamentApparelSponsorName(){
  const s = (DB.sponsors||[]).find(sp=>
    (typeof sponsorHasTournamentLink==="function" ? sponsorHasTournamentLink(sp) : sp.global) &&
    (typeof sponsorCategoriesOf==="function" ? sponsorCategoriesOf(sp) : []).some(c=>/indumentaria|ropa|apparel|deportiv/i.test(c)));
  return s ? s.name : "";
}
function refereeKitSponsorName(){
  const t = refereeKitsTeam();
  return (t && (t.kitSponsor||"").trim()) || tournamentApparelSponsorName();
}
// Normaliza los uniformes de árbitro: todos en la categoría "arbitro" y renumerados Kit 1, Kit 2…
// No crea ninguno por defecto — se agregan a mano.
function ensureRefereeKits(teamArg){
  // Acepta el equipo de árbitros global (por defecto) o el envoltorio de una entidad (torneo,
  // federación, confederación) — ver refKitsTeamFor.
  const t = teamArg || refereeKitsTeam();
  if(!t || !Array.isArray(t.kits)) return t||null;
  t.kits.forEach(k=>{
    k.category = "arbitro";
    if(k.refLocalKit===undefined) k.refLocalKit = false;
    if(k.refLocalCountry===undefined) k.refLocalCountry = "";
    if(k.refFinalKit===undefined) k.refFinalKit = false;
  });
  t.kits.forEach(normalizeKitFields);
  t.kits.forEach((k,i)=>{ k.label = "Kit " + (i+1); });
  return t;
}

/* ---------- Uniformes de árbitro POR ENTIDAD (torneo / federación / confederación) ---------- */
// Igual que el equipo de árbitros del torneo, pero los kits viven dentro de la propia entidad
// (<entidad>.refereeKits) y su marca de ropa en <entidad>.refereeKitSponsor. Se envuelve como
// "equipo" para reutilizar TODO el editor de uniformes (modalManageKits/add-kit/edit-kit/save-kit).
const REFKITS_ID_PREFIX = "__refkits__:";
function refKitsWrapId(kind, entityId){ return REFKITS_ID_PREFIX + kind + ":" + entityId; }
function refKitsEntityFor(wrapId){
  if(typeof wrapId!=="string" || wrapId.indexOf(REFKITS_ID_PREFIX)!==0) return null;
  const rest = wrapId.slice(REFKITS_ID_PREFIX.length);
  const i = rest.indexOf(":"); if(i<0) return null;
  const kind = rest.slice(0,i), eid = rest.slice(i+1);
  if(kind==="comp") return { kind, id:eid, entity:(DB.competitions||[]).find(c=>c.id===eid)||null, name:"competición" };
  if(kind==="conf") return { kind, id:eid, entity:(DB.confederations&&DB.confederations[eid])||null, name:"confederación" };
  if(kind==="fifa"){ if(!DB.fifa) return null; return { kind, id:eid, entity:DB.fifa, name:"FIFA" }; }
  if(kind==="fed"){ const tm=(DB.teams||[]).find(t=>t.id===eid); if(tm){ if(!tm.federation) tm.federation={}; return { kind, id:eid, entity:tm.federation, name:"federación" }; } return null; }
  return null;
}
// Devuelve un "equipo" envoltorio cuyos .kits y .kitSponsor apuntan (get/set) a la entidad real,
// de modo que cualquier cambio del editor se guarda directamente en ella.
function refKitsTeamFor(wrapId){
  const found = refKitsEntityFor(wrapId);
  if(!found || !found.entity) return null;
  const ent = found.entity;
  if(!Array.isArray(ent.refereeKits)) ent.refereeKits = [];
  const wrap = { id: wrapId, commonName: "árbitros", isRefereeKits: true };
  Object.defineProperty(wrap, "kits", {
    get(){ if(!Array.isArray(ent.refereeKits)) ent.refereeKits=[]; return ent.refereeKits; },
    set(v){ ent.refereeKits = v; }, enumerable:true, configurable:true
  });
  Object.defineProperty(wrap, "kitSponsor", {
    get(){ return ent.refereeKitSponsor||""; },
    set(v){ ent.refereeKitSponsor = v; }, enumerable:true, configurable:true
  });
  return wrap;
}
function isRefKitsWrapId(id){ return typeof id==="string" && id.indexOf(REFKITS_ID_PREFIX)===0; }
// Países anfitriones del torneo, tomados de la edición del año en curso en el historial. Si esa
// edición no tiene sedes cargadas, se usan las de la constante como respaldo.
function refereeLocalKitCountries(){
  const year = (DB.event && DB.event.year) || null;
  const ed = year ? ((DB.event.history||[]).find(h=>h.year===year)) : null;
  const hosts = (ed && Array.isArray(ed.hosts)) ? ed.hosts.filter(Boolean) : [];
  return hosts.length ? hosts : REFEREE_LOCAL_KIT_COUNTRIES.slice();
}

// Uniforme por defecto del árbitro (Kit 1): de él sale el color del cuadro del badge en su ficha.
function refereeDefaultKit(){
  const t = refereeKitsTeam();
  return (t && t.kits && t.kits[0]) || null;
}
