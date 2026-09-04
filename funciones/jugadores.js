/* =========================================================
   COPA MANAGER 2026 — funciones/jugadores.js
   Jugadores: helpers de nombre/edad/dorsal, constructor de plantilla (P),
   import masivo, ordenación, listado filtrable, ficha y modal de edición.
   Extracción mecánica: texto y orden idénticos al original (7 zonas; el estado
   playerFilter/bulkImportTeamId/playerSort permanece en el inline). Incluye
   helpers propios no listados en el plan (playerType, playerDefaultDir,
   parseFavNumbers, checkNumberTaken). Script CLÁSICO (no module). Cargar DESPUÉS
   de datos/constantes.js (POS_ORDER, VALID_POS, NUMBER_START_BY_POS, MONTH_NAMES),
   core/utilidades.js (uid, isoDate, escapeHtml, compareGeneric, sortTh, initials),
   app/textos-ui.js (tabLabel), app/modales.js (openModal, imageUploadField,
   detailNavHTML), funciones/paises.js (playerCountryName, nationalityRowHTML) y
   funciones/patrocinadores.js (apparelBrandNames), y ANTES del <script> inline
   (P se usa al evaluar SEED_TEAMS). Usa en tiempo de ejecución DB, getTeam y
   orderedTeamPlayers (selecciones, inline). Sin ciclo de carga: la relación con
   selecciones es en tiempo de render.
   ========================================================= */

// Separa un nombre completo en nombre/apellido — si es una sola palabra (apodos como "Rodri" o
// "Pedri"), se trata como nombre común directamente, ya que así es como se conoce al jugador.
function splitFullName(fullName){
  const parts = (fullName||"").trim().split(/\s+/).filter(Boolean);
  if(parts.length<=1) return {firstName:"", lastName:"", commonName:parts[0]||""};
  return {firstName:parts[0], lastName:parts.slice(1).join(" "), commonName:""};
}
function P(name,pos,age,club,rating){
  const {firstName,lastName,commonName} = splitFullName(name);
  return {id:uid(), firstName, lastName, commonName, fullName:"", pos, age, birthDate:null, club, rating, ratingPotential:null, number:null,
    nationalityIds:[], declaredForCountryId:null, photo:null, caps:null, goalsNational:null, brand:null,
    footLeft:null, footRight:null, positions:{}, cbSide:null,
    favNumbersTeam:[], favNumbersClub:[], shirtNameTeam:"", shirtNameClub:"",
    fullNameLinked:true, shirtNameTeamLinked:true, shirtNameClubLinked:true};
}
// ---- Perfiles y Posiciones específicas -----------------------------------------------------
// Las 17 posiciones agrupadas por línea. Cada jugador guarda un valor 1–20 por posición
// (player.positions[code]) y el pie izq/der (player.footLeft/footRight, 1–20). Independiente
// de la posición principal (player.pos = GK/DF/MF/FW); si no coincide, el editor avisa.
const POSICIONES_DEF = [
  { group:"PORTERO",        cat:"GK", items:[["GK","Portero"]] },
  { group:"DEFENSAS",       cat:"DF", items:[["CB","Defensa central"],["LB","Lateral izquierdo"],["RB","Lateral derecho"],["LWB","Carrilero izquierdo"],["RWB","Carrilero derecho"]] },
  { group:"MEDIOCAMPISTAS", cat:"MF", items:[["CDM","Mediocentro defensivo"],["CM","Mediocentro"],["LM","Volante izquierdo"],["RM","Volante derecho"],["CAM","Mediocentro ofensivo"]] },
  { group:"DELANTEROS",     cat:"FW", items:[["CF","Delantero centro"],["LF","Delantero izquierdo"],["RF","Delantero derecho"],["LW","Extremo izquierdo"],["RW","Extremo derecho"],["ST","Delantero"]] },
];
const POS_CAT_OF = {};       // código -> categoría (GK/DF/MF/FW)
const POS_LIST_ORDER = [];   // códigos en el orden de la lista (para desempates)
POSICIONES_DEF.forEach(g=>g.items.forEach(([code])=>{ POS_CAT_OF[code]=g.cat; POS_LIST_ORDER.push(code); }));
const CAT_LABEL = { GK:"GK", DF:"DF", MF:"MF", FW:"FW" };

/* ============================================================================================
   SISTEMA INTERNO DE VALORACIÓN POSICIONAL  (PASO 1)
   --------------------------------------------------------------------------------------------
   Determina qué tan adecuado es un jugador para una posición concreta, SIN atributos individuales.
   Usa únicamente el OVR general (player.rating) y el valor posicional interno 0–20
   (player.positions[código]). Todo esto es INTERNO: no se muestra en la interfaz y NO modifica el
   OVR general almacenado. Estas tablas son la ÚNICA fuente de verdad (no duplicar en otros lados).

   Conceptos separados:
     overall           -> OVR oficial del jugador (player.rating). Nunca se sobrescribe.
     positionValue     -> valor interno 0–20 del jugador para la posición.
     positionFactor    -> factor de la tabla según el valor 0–20.
     positionalRating  -> overall × positionFactor (decimales internos, sin redondear).
     specializationBonus-> bonus interno por especialización (0 = no elegible).
     selectionScore    -> positionalRating + specializationBonus (se usará en el PASO 2 para el XI).
   ============================================================================================ */

// Factor posicional por valor 0–20 (tabla EXACTA; única fuente de verdad).
const POSITION_FACTORS = {
  20:1.000, 19:0.995, 18:0.985, 17:0.970, 16:0.950, 15:0.925, 14:0.895, 13:0.865,
  12:0.830, 11:0.795, 10:0.755,  9:0.710,  8:0.660,  7:0.600,  6:0.530,  5:0.450,
   4:0.360,  3:0.260,  2:0.150,  1:0.060,  0:0.000
};
// Bonus de especialización por valor 0–20 (tabla EXACTA). 0 = NO elegible (null).
const SPECIALIZATION_BONUS = {
  20:2.0, 19:1.5, 18:1.0, 17:0.5, 16:0, 15:-0.5, 14:-1.0, 13:-1.5,
  12:-2.0, 11:-2.5, 10:-3.0, 9:-4.0, 8:-5.0, 7:-6.0, 6:-7.0, 5:-8.0,
   4:-10.0, 3:-12.0, 2:-15.0, 1:-20.0, 0:null
};

// ¿La posición es un código definido en el sistema? (evita asumir valores en posiciones inexistentes)
function isDefinedPosition(position){
  return typeof position === "string" && Object.prototype.hasOwnProperty.call(POS_CAT_OF, position);
}
// Normaliza un valor 0–20: número finito, redondeado y limitado al rango permitido; si no, null.
function normalizePositionValue(value){
  if(value == null) return null;
  const n = Number(value);
  if(!isFinite(n)) return null;
  return Math.max(0, Math.min(20, Math.round(n)));   // validación explícita del rango 0–20
}
// OVR general del jugador (no se modifica nunca). null si no hay rating válido.
function getOverall(player){
  const n = player ? Number(player.rating) : NaN;
  return isFinite(n) ? n : null;
}
// Valor interno 0–20 del jugador para una posición.
//   - null  -> la posición no está definida en el sistema.
//   - 0     -> el jugador no tiene valor específico para esa posición (convención del proyecto:
//              ausente = 0 = "no apto"; el editor/seed guardan solo valores > 0 y muestran 0 por
//              defecto, así que "sin dato" equivale a 0). NO se asume 20.
//   - 0–20  -> el valor almacenado, validado al rango.
function getPositionValue(player, position){
  if(!player || !isDefinedPosition(position)) return null;
  const raw = (player.positions && player.positions[position] != null) ? player.positions[position] : 0;
  const v = normalizePositionValue(raw);
  return v == null ? 0 : v;
}
// Factor posicional para un valor 0–20 (null si el valor no es válido).
function getPositionFactor(value){
  const v = normalizePositionValue(value);
  return (v != null && POSITION_FACTORS[v] != null) ? POSITION_FACTORS[v] : null;
}
// Bonus de especialización para un valor 0–20. 0 -> null (no elegible).
function getSpecializationBonus(value){
  const v = normalizePositionValue(value);
  if(v == null) return null;
  const b = SPECIALIZATION_BONUS[v];
  return (b === undefined) ? null : b;   // b puede ser 0 (válido) o null (valor 0 = no elegible)
}
// positionalRating = overall × factor. Decimales internos (sin redondear).
//   null si la posición no está definida o no hay overall válido. Valor 0 -> 0 (no apto).
function getPositionalRating(player, position){
  const value = getPositionValue(player, position);
  if(value == null) return null;
  const ovr = getOverall(player);
  if(ovr == null) return null;
  const factor = getPositionFactor(value);
  if(factor == null) return null;
  return ovr * factor;
}
// selectionScore = positionalRating + specializationBonus.
//   null si la posición no está definida, no hay overall, o el valor es 0 (no elegible).
function getSelectionScore(player, position){
  const value = getPositionValue(player, position);
  if(value == null || value === 0) return null;   // no definida / no apto
  const pr = getPositionalRating(player, position);
  const bonus = getSpecializationBonus(value);
  if(pr == null || bonus == null) return null;
  return pr + bonus;
}
// Conjunto completo de valores internos (útil para el PASO 2 y para pruebas). NO se muestra en UI.
// Devuelve null si la posición no está definida.
function getPositionAssessment(player, position){
  const value = getPositionValue(player, position);
  if(value == null) return null;
  return {
    overall:            getOverall(player),
    positionValue:      value,
    positionFactor:     getPositionFactor(value),
    positionalRating:   getPositionalRating(player, position),
    specializationBonus: getSpecializationBonus(value),
    selectionScore:     getSelectionScore(player, position),
    eligible:           value > 0
  };
}
/* ==================== fin del sistema de valoración posicional (PASO 1) ===================== */

/* ============================================================================================
   SISTEMA DE SELECCIÓN AUTOMÁTICA DEL XI  (PASO 2)
   --------------------------------------------------------------------------------------------
   Dada una plantilla y una formación, encuentra la MEJOR COMBINACIÓN GLOBAL de 11 jugadores.
   Se construye SOBRE el PASO 1 (usa getSelectionScore / getPositionValue; no reescribe tablas).

   Criterio principal  -> selectionScore (PASO 1): nivel + adecuación posicional + especialización.
   Criterios secundarios (SOFT, solo desempatan diferencias pequeñas; nunca dominan la calidad):
     · Experiencia/producción internacional -> campos EXISTENTES player.caps y player.goalsNational.
     · Preferencia de perfil lateral del central -> campo EXISTENTE player.cbSide ('L' | 'R' | null).
       'L'=CB(L), 'R'=CB(R), null=CB indistinto. La POSICIÓN siempre es "CB" (no existen LCB/RCB).

   Algoritmo: matching bipartito de peso máximo (Hungarian) sobre pesos = selectionScore + ε,
   donde ε (secundario) está acotado por debajo de 1.0 para no superar diferencias importantes.
   Determinista (jugadores ordenados por id antes de construir la matriz).
   NO modifica ningún dato del jugador; la asignación jugador→posición es temporal.
   ============================================================================================ */

// Pesos del criterio secundario internacional por posición (§ pesos del prompt). Fracciones que
// suman 1: cuánto pesan internacionalidades (caps) vs goles con la selección. Fuente única.
const INTL_WEIGHTS = {
  GK:{caps:0.95,goals:0.05}, CB:{caps:0.85,goals:0.15}, LB:{caps:0.80,goals:0.20}, RB:{caps:0.80,goals:0.20},
  LWB:{caps:0.75,goals:0.25}, RWB:{caps:0.75,goals:0.25}, CDM:{caps:0.75,goals:0.25}, CM:{caps:0.65,goals:0.35},
  LM:{caps:0.60,goals:0.40}, RM:{caps:0.60,goals:0.40}, CAM:{caps:0.40,goals:0.60}, LW:{caps:0.40,goals:0.60},
  RW:{caps:0.40,goals:0.60}, CF:{caps:0.30,goals:0.70}, ST:{caps:0.25,goals:0.75}
};
// Configuración del XI (magnitudes de los criterios secundarios). Centralizada y fácil de ajustar.
// Los secundarios se mantienen < 1.0 para que un margen ≥ ~1.0 de selectionScore siempre gane.
const XI_CONFIG = {
  CAPS_K: 30,          // saturación de internacionalidades (rendimientos decrecientes)
  GOALS_K: 30,         // saturación de goles con la selección (misma curva; los pesos por posición diferencian)
  INTL_WEIGHT: 0.65,   // magnitud máxima del desempate por experiencia internacional (0..0.65)
  CB_SIDE_MATCH: 0.30, // preferencia positiva cuando el perfil coincide con el lado del slot
  CB_SIDE_OPP: 0.30,   // penalización cuando el perfil es del lado contrario
  TIE_MARGIN: 1.0      // margen de selectionScore dentro del cual se consideran "empatados"
};

// Experiencia/producción internacional NORMALIZADA y ponderada por posición. Devuelve ~[0,1).
// Usa los campos EXISTENTES caps y goalsNational (no crea ni modifica datos). Rendimientos
// decrecientes: x/(x+K). Los goles pesan más en posiciones ofensivas y las caps en defensivas/GK.
function getInternationalExperienceScore(player, position){
  const caps  = Math.max(0, Number(player && player.caps) || 0);
  const goals = Math.max(0, Number(player && player.goalsNational) || 0);
  const normCaps  = caps  / (caps  + XI_CONFIG.CAPS_K);
  const normGoals = goals / (goals + XI_CONFIG.GOALS_K);
  const w = INTL_WEIGHTS[position] || {caps:0.5, goals:0.5};
  return w.caps*normCaps + w.goals*normGoals;   // 0..1 aprox.
}

// Determina, para los slots CB de una formación, cuál corresponde al lado izquierdo ('L'),
// derecho ('R') o central ('C', solo en líneas de 3/5). Usa la columna existente del slot (s.c).
// Devuelve un arreglo alineado a formation.slots (null para los slots que no son CB).
function computeCbSlotSides(slots){
  const sides = new Array(slots.length).fill(null);
  const cb = slots.map((s,i)=>({ i, c:(typeof s.c==="number"?s.c:0), p:s.p }))
                  .filter(o=>o.p==="CB").sort((a,b)=>a.c-b.c);
  if(cb.length>=2){
    sides[cb[0].i]="L";
    sides[cb[cb.length-1].i]="R";
    for(let k=1;k<cb.length-1;k++) sides[cb[k].i]="C";
  }
  return sides;   // un único CB (o ninguno) queda sin lado (indistinto)
}

// Peso de asignar un jugador a un slot concreto. null = inelegible (positionValue 0 -> no apto).
// weight = selectionScore (principal) + experiencia internacional + preferencia lateral (secundarios).
function xiWeight(player, slot, slotSide){
  const value = getPositionValue(player, slot.p);
  if(value == null || value === 0) return null;                 // no definida / no apto
  const ss = getSelectionScore(player, slot.p);
  if(ss == null) return null;
  let w = ss;
  w += getInternationalExperienceScore(player, slot.p) * XI_CONFIG.INTL_WEIGHT;   // 0..0.65
  if(slot.p === "CB" && slotSide){
    const side = player.cbSide || null;                         // 'L' | 'R' | null (indistinto)
    if(slotSide === "L" || slotSide === "R"){
      if(side === slotSide) w += XI_CONFIG.CB_SIDE_MATCH;       // perfil coincide con el lado
      else if(side) w -= XI_CONFIG.CB_SIDE_OPP;                 // perfil del lado contrario
      // side null (indistinto) -> sin ajuste
    } else if(slotSide === "C"){                                // central (3/5 defensas)
      if(!side) w += XI_CONFIG.CB_SIDE_MATCH * 0.5;             // el indistinto es ideal en el centro
      else      w -= XI_CONFIG.CB_SIDE_OPP  * 0.5;              // uno con lado, ligera penalización
    }
  }
  return w;
}

// ---- Hungarian (Kuhn–Munkres) para matriz cuadrada de COSTES (minimización). O(n^3). ----
function hungarianMin(cost){
  const n = cost.length;
  const INF = Infinity;
  const u = new Array(n+1).fill(0), v = new Array(n+1).fill(0);
  const p = new Array(n+1).fill(0), way = new Array(n+1).fill(0);
  for(let i=1;i<=n;i++){
    p[0]=i; let j0=0;
    const minv = new Array(n+1).fill(INF);
    const used = new Array(n+1).fill(false);
    do{
      used[j0]=true;
      const i0=p[j0]; let delta=INF, j1=-1;
      for(let j=1;j<=n;j++) if(!used[j]){
        const cur = cost[i0-1][j-1] - u[i0] - v[j];
        if(cur < minv[j]){ minv[j]=cur; way[j]=j0; }
        if(minv[j] < delta){ delta=minv[j]; j1=j; }
      }
      for(let j=0;j<=n;j++){
        if(used[j]){ u[p[j]]+=delta; v[j]-=delta; }
        else minv[j]-=delta;
      }
      j0=j1;
    } while(p[j0]!==0);
    do{ const j1=way[j0]; p[j0]=p[j1]; j0=j1; } while(j0);
  }
  const rowToCol = new Array(n).fill(-1);
  for(let j=1;j<=n;j++) if(p[j]>0) rowToCol[p[j]-1]=j-1;
  return rowToCol;   // rowToCol[fila] = columna asignada
}

// Asignación de PESO MÁXIMO a partir de una matriz de pesos R×C (null = inelegible).
// Devuelve un arreglo por fila (slot) con la columna (jugador) asignada, o -1 si queda sin cubrir.
function maxWeightAssignment(W){
  const R = W.length;
  const C = R>0 ? W[0].length : 0;
  const n = Math.max(R, C);
  const HUGE = 1e9;
  const OFFSET = 100000;   // convierte "maximizar peso" en "minimizar coste" manteniéndolo positivo
  const cost = [];
  for(let i=0;i<n;i++){
    const row = [];
    for(let j=0;j<n;j++){
      if(i<R && j<C){ const w = W[i][j]; row.push(w==null ? HUGE : (OFFSET - w)); }
      else if(i<R){ row.push(HUGE); }   // columna comodín para un slot real: evitar salvo forzado
      else { row.push(0); }             // fila comodín (slot inexistente): coste 0
    }
    cost.push(row);
  }
  const rowToCol = hungarianMin(cost);
  const out = new Array(R).fill(-1);
  for(let i=0;i<R;i++){
    const j = rowToCol[i];
    if(j!=null && j>=0 && j<C && W[i][j]!=null) out[i]=j;   // solo aristas elegibles reales
  }
  return out;
}

// FUNCIÓN PRINCIPAL DEL PASO 2.
// players: plantilla YA disponible (el llamador aplica la disponibilidad existente, p. ej. convocados).
// formation: objeto de formación existente con .slots = [{p,cat,c,r}, ...].
// Devuelve { lineup: [jugador|null por slot], assignments:[{slotIndex,position,side,player,selectionScore,weight}] }.
// No modifica ningún dato. Determinista.
function generateBestXI(players, formation, options){
  options = options || {};
  const slots = (formation && Array.isArray(formation.slots)) ? formation.slots : [];
  const empty = { lineup:[], assignments:[] };
  if(!slots.length) return empty;

  // Disponibilidad: se respeta la que provee el llamador. Además, por robustez, se descartan
  // jugadores marcados como no disponibles con banderas ya existentes en el proyecto, si las hay.
  const isAvailable = p => !!p && !p.unavailable && !p.injured && !p.suspended && p.available!==false;

  // Orden estable por id -> determinismo/reproducibilidad, independiente del orden de entrada.
  const pool = (players||[]).filter(isAvailable)
    .slice()
    .sort((a,b)=> String(a && a.id!=null ? a.id : "").localeCompare(String(b && b.id!=null ? b.id : "")));

  const sides = computeCbSlotSides(slots);
  const R = slots.length, C = pool.length;

  // Matriz de pesos slots × jugadores (null = inelegible).
  const W = [];
  for(let i=0;i<R;i++){
    const row = [];
    for(let j=0;j<C;j++) row.push(xiWeight(pool[j], slots[i], sides[i]));
    W.push(row);
  }

  const assign = (R>0 && C>0) ? maxWeightAssignment(W) : new Array(R).fill(-1);

  const lineup = new Array(R).fill(null);
  const assignments = [];
  for(let i=0;i<R;i++){
    const j = assign[i];
    if(j>=0 && j<C && W[i][j]!=null){
      const pl = pool[j];
      lineup[i] = pl;
      assignments.push({ slotIndex:i, position:slots[i].p, side:sides[i]||null, player:pl,
                         selectionScore:getSelectionScore(pl, slots[i].p), weight:W[i][j] });
    } else {
      assignments.push({ slotIndex:i, position:slots[i].p, side:sides[i]||null, player:null,
                         selectionScore:null, weight:null });
    }
  }
  return { lineup, assignments };
}
/* ==================== fin de la selección automática del XI (PASO 2) ======================== */

// Posiciones ordenadas por especialidad: valor desc; en empate, primero el rol de su categoría
// principal (player.pos) y luego el orden de la lista.
function orderedPositions(player){
  const pos = player.positions || {};
  const own = player.pos;
  return Object.keys(pos)
    .map(code=>({ code, v:+pos[code]||0, cat:POS_CAT_OF[code], ord:POS_LIST_ORDER.indexOf(code) }))
    .filter(e=> e.v>0 && e.cat)
    .sort((a,b)=> b.v-a.v || ((a.cat===own?0:1)-(b.cat===own?0:1)) || a.ord-b.ord );
}
// Categoría derivada de las posiciones (la de mayor valor). Sirve para avisar si no coincide
// con la posición principal declarada.
function derivedMainCat(player){
  const o = orderedPositions(player);
  return o.length ? o[0].cat : null;
}
// Código a mostrar en tablas y fichas. El perfil L/R del CB NO se muestra aquí: es un dato interno
// que solo se usa para colocar al jugador en las alineaciones; se hará visible al elegir alineación.
function posCodeDisplay(player, code){
  return code;
}
// Texto de posiciones para el perfil y las listas: las de valor ≥15, ordenadas por especialidad,
// máximo 4. Ej.: "ST, LW, RW".
function positionsText(player){
  let list = orderedPositions(player).filter(e=> e.v>=15);
  if(list.length>4) list = list.slice(0,4);
  return list.map(e=> posCodeDisplay(player, e.code)).join(', ');
}
// Posiciones principales (valor 20) — para el texto de las fichas del once en el onboarding.
function principalPositionsText(player){
  return orderedPositions(player).filter(e=> e.v>=20).map(e=> posCodeDisplay(player, e.code)).join(', ');
}
// Nombre para mostrar de un jugador en todo el juego: el nombre común si tiene uno asignado,
// si no, nombre+apellido completo (con varios respaldos por si algo viniera incompleto).
function playerDisplayName(p){
  if(p.commonName && p.commonName.trim()) return p.commonName.trim();
  const full = `${p.firstName||""} ${p.lastName||""}`.trim();
  if(full) return full;
  return p.name || "Jugador";
}
// Igual que playerDisplayName pero resaltando en negrita el "nombre principal": el nombre común si lo
// tiene; si no, el apellido (el nombre de pila queda en peso normal). Devuelve HTML ya escapado.
function playerDisplayNameHTML(p){
  const esc = escapeHtml;
  const common = (p.commonName||"").trim();
  if(common) return `<b>${esc(common)}</b>`;
  const first = (p.firstName||"").trim();
  const last = (p.lastName||"").trim();
  if(first || last){
    // El nombre de pila va en peso normal explícito (para que se des-enfatice incluso dentro de un
    // encabezado que ya es negrita); el apellido va en negrita como nombre principal.
    const firstPart = first ? `<span style="font-weight:400;">${esc(first)}</span> ` : "";
    const lastPart = last ? `<b>${esc(last)}</b>` : "";
    return (firstPart + lastPart).trim();
  }
  return esc(p.name || "Jugador");
}
// Edad calculada a partir de la fecha de nacimiento (ISO YYYY-MM-DD). Devuelve null si no hay fecha válida.
function computeAge(birthDate){
  if(!birthDate) return null;
  const d = new Date(birthDate);
  if(isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if(m<0 || (m===0 && now.getDate()<d.getDate())) age--;
  return (age>=0 && age<130) ? age : null;
}
// Edad a mostrar: la calculada desde la fecha de nacimiento si existe; si no, la edad guardada (legado).
function playerAge(p){
  const a = computeAge(p.birthDate);
  if(a!=null) return a;
  return (p.age!=null && !isNaN(p.age)) ? p.age : null;
}
function playerAgeText(p){
  const a = playerAge(p);
  return a!=null ? `${a} años` : "Edad s/d";
}
// Fecha a ISO (YYYY-MM-DD) desde año/mes/día numéricos.
// Normaliza una fecha de nacimiento a ISO desde varios formatos comunes de Excel/Sheets.
function parseBirthDate(raw){
  const s = (raw||"").trim()
    .replace(/\s*\(aged\s+\d+\)/i,"")   // quita "(aged 35)" al final
    .trim();
  if(!s) return null;
  // YYYY-MM-DD o YYYY/MM/DD
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if(m) return isoDate(+m[1], +m[2], +m[3]);
  // DD/MM/YYYY o MM/DD/YYYY
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if(m){
    let a=+m[1], b=+m[2], y=+m[3];
    if(y<100) y += (y>30 ? 1900 : 2000);
    let day, month;
    if(a>12){ day=a; month=b; }
    else if(b>12){ day=b; month=a; }
    else { day=a; month=b; }
    return isoDate(y, month, day);
  }
  // "April 9, 1997"  o  "9 April 1997"
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})$/);
  if(!m) m = s.match(/^(\d{1,2})\s+([A-Za-z]+)[,\s]+(\d{4})$/);
  if(m){
    const [,p1,p2,p3] = m;
    const tryName = (tok) => MONTH_NAMES[tok.toLowerCase()];
    const mo1 = tryName(p1), mo2 = tryName(p2);
    if(mo1) return isoDate(+p3, mo1, +p2);
    if(mo2) return isoDate(+p3, mo2, +p1);
  }
  // Último recurso: Date.parse (maneja "Apr 9, 1997" etc.)
  const d = new Date(s);
  if(!isNaN(d.getTime())) return isoDate(d.getFullYear(), d.getMonth()+1, d.getDate());
  return null;
}
// Comparación laxa (sin acentos, sin mayúsculas, sin puntuación) para emparejar clubes/marcas
// escritos con pequeñas variaciones ("Atlético" vs "Atletico", "Man. City" vs "Man City").

// Valor por default de "Nombre completo" — siempre Nombre + Apellido, se recalcula en vivo
// mientras "fullNameLinked" sea true (es decir, mientras el usuario no lo haya tocado a mano).
function computeDefaultFullName(p){ return `${p.firstName||""} ${p.lastName||""}`.trim(); }
// Valor por default de "Nombre en camiseta" — nombre común o, en su defecto, apellido, siempre en
// MAYÚSCULAS (sin el propio campo explícito, a diferencia de effectiveShirtName que sí lo prioriza).
// Editable: en cuanto el usuario lo cambie a mano, deja de regenerarse solo (ver shirtName*Linked).
function computeDefaultShirtNameValue(p){
  const v = (p.commonName && p.commonName.trim()) || (p.lastName && p.lastName.trim()) || "";
  return v.toUpperCase();
}

function nextAvailableNumber(team, start){
  const used = new Set(team.players.map(p=>p.number).filter(n=>n!=null));
  for(let n=start;n<=99;n++){ if(!used.has(n)) return n; }
  for(let n=1;n<=99;n++){ if(!used.has(n)) return n; }
  return null;
}
function assignSquadNumbers(team){
  const order = ["GK","DF","MF","FW"];
  order.forEach(pos=>{
    team.players.filter(p=>p.pos===pos && p.number==null && !p.numberUnassigned).forEach(p=>{
      p.number = nextAvailableNumber(team, NUMBER_START_BY_POS[pos]);
    });
  });
}
function suggestNumber(team, pos, excludeId){
  const used = new Set(team.players.filter(p=>p.id!==excludeId).map(p=>p.number).filter(n=>n!=null));
  for(let n=NUMBER_START_BY_POS[pos]||1;n<=99;n++){ if(!used.has(n)) return n; }
  for(let n=1;n<=99;n++){ if(!used.has(n)) return n; }
  return 1;
}

function parseBulkPlayers(text){
  if(!text) return [];
  let lines = text.split(/\r?\n/).map(l=>l.replace(/\s+$/,"")).filter(l=>l.trim().length>0);
  if(lines.length>0){
    const first = lines[0].toLowerCase();
    const looksHeader = !/^\s*\d/.test(lines[0]) &&
      /(dorsal|posici|nombre|apellido|nacimiento|estatura|caps|internacional|goles|club|camiseta|marca|rating|height|birth)/.test(first);
    if(looksHeader) lines = lines.slice(1);
  }
  // Columnas: 0 Dorsal, 1 Pos, 2 Nombre, 3 Apellido, 4 Nombre común, 5 Nombre completo,
  //           6 Fecha nac., 7 Estatura (cm), 8 Caps, 9 Goles sel.,
  //           10 Club, 11 Nombre camiseta sel., 12 Marca, 13 Rating, 14 Rating potencial
  return lines.map(line=>{
    const cols = line.includes("\t") ? line.split("\t") : line.split(",");
    const c = cols.map(x=>(x||"").trim());
    const firstName = c[2] || "";
    const lastName  = c[3] || "";
    if(!firstName && !lastName) return null;
    const numberRaw = c[0];
    const numberVal = parseInt(numberRaw);
    const number         = (!numberRaw || isNaN(numberVal) || numberVal<=0) ? null : Math.min(99, numberVal);
    const numberUnassigned = (!numberRaw || isNaN(numberVal) || numberVal<=0);
    const posRaw      = (c[1]||"").toUpperCase();
    const pos         = VALID_POS.includes(posRaw) ? posRaw : "MF";
    const commonName  = c[4] || "";
    const fullName    = c[5] || "";
    const birthDate   = parseBirthDate(c[6]);
    const height      = numInRange(c[7], 140, 230);
    const caps        = numInRange(c[8], 0, 100000);
    const goalsNational = numInRange(c[9], 0, 100000);
    const club        = c[10] || "";
    const shirtNameTeam = (c[11]||"").slice(0,50);
    const brand       = c[12] || "";
    const rating      = (c[13]!=null && c[13]!=="") ? Math.max(0, Math.min(99, parseInt(c[13])||0)) : null;
    const ratingPotential = (c[14]!=null && c[14]!=="") ? Math.max(0, Math.min(99, parseInt(c[14])||0)) : null;
    return {number, numberUnassigned, pos, firstName, lastName, commonName, fullName, birthDate, height, caps, goalsNational, club, shirtNameTeam, brand, rating, ratingPotential};
  }).filter(Boolean);
}

// Clave de orden por nombre. Se ordena por lo que identifica al jugador en la lista: si tiene un
// nombre común (mononombre/apodo como "Chicharito"), se usa ese; si no, por su APELLIDO; y como
// último respaldo, el nombre visible completo. Así el orden coincide con el nombre que se muestra.
function playerSortName(p){
  if(p.commonName && p.commonName.trim()) return p.commonName.trim();
  if(p.lastName && p.lastName.trim()) return p.lastName.trim();
  return playerDisplayName(p);
}
function playerLastNameKey(p){ return playerSortName(p).toLowerCase(); }

// Busca un jugador por id recorriendo todos los equipos — los jugadores no tienen su propio
// arreglo global, viven dentro de team.players, así que hace falta esta búsqueda.
function getPlayerWithTeam(playerId){
  for(const t of DB.teams){
    const p = t.players.find(pl=>pl.id===playerId);
    if(p) return {player:p, team:t};
  }
  return {player:null, team:null};
}
// Ficha de un jugador — mismo espíritu que renderTeamDetail (foto/datos a la izquierda, foto del
// jugador, rating y botones de edición a la derecha). El contenido se irá llenando después;
// por ahora ya están los campos base (incl. internacionalidades y goles con selección).
function renderPlayerDetail(playerId){
  const {player:p, team} = getPlayerWithTeam(playerId);
  if(!p){ activePlayerId = null; return renderJugadores(); }
  let pIdx = -1, pTotal = 0;
  if(team){
    // La navegación con flechas recorre solo el mismo grupo del jugador: convocados (con dorsal) entre
    // sí, y no convocados (sin dorsal) entre sí.
    const isConvocado = p.number!=null;
    const op = orderedTeamPlayers(team).filter(x=> (x.number!=null)===isConvocado);
    pIdx = op.findIndex(x=>x.id===p.id);
    pTotal = op.length;
  }
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-player-detail">← Volver</button>
    ${team ? detailNavHTML('nav-player-arrow', pIdx, pTotal) : ""}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    <div style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2);flex-shrink:0;">
      <img src="${p.photo||personPhotoDefault(p)}" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>
    <div style="flex:1;min-width:200px;">
      <h2 style="margin:0 0 2px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="num-badge">${p.number!=null?p.number:"–"}</span>
        <span>${playerDisplayNameHTML(p)}</span>
        <span style="display:inline-flex;align-items:center;gap:6px;"><span class="pos-chip pos-${p.pos}">${p.pos}</span>${positionsText(p)?`<span style="font-size:12.5px;color:var(--muted);font-weight:600;">${positionsText(p)}</span>`:""}</span>
      </h2>
      <div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:6px;">${playerAgeText(p)}${p.height!=null?` · ${p.height} cm`:""} · ${p.club?`<span class="badge conf tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(p.club)}" style="background:var(--surface-2);color:var(--muted);">${clubLogoIconHTML(getClubByName(p.club))}${escapeHtml(p.club)}</span>`:`<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">Sin club</span>`}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
        ${(()=>{
          const country = playerCountryName(p);
          if(!country && !team) return `<span style="font-size:13px;color:var(--muted);">Sin selección asignada</span>`;
          const calledUp = team && p.number!=null && p.number>0;
          const natCo = nationalityCountryOf(p);
          const label = personDemonym(p) || country || (team?team.commonName:"");   // gentilicio (masc.) o país
          const flag = flagIconHTML(natCo || country || (team?team.commonName:""));
          // La etiqueta de nacionalidad ya NO enlaza a la selección: bandera + gentilicio, en gris.
          const tag = `<span class="badge" style="background:var(--surface-2);color:var(--muted);">${flag}${escapeHtml(label)}</span>`;
          // El enlace a la selección ahora vive en la etiqueta "Internacional" (solo si está convocado).
          // Mismo tono morado y misma altura que la etiqueta de nacionalidad (ambas .badge conf).
          const intl = calledUp
            ? ` <span class="badge conf tag-clickable" data-action="open-team" data-id="${team.id}" style="cursor:pointer;" title="Convocado a la selección — ver">Internacional</span>`
            : "";
          return tag + intl;
        })()}
        <span style="font-size:13px;color:var(--muted);">Partidos: ${p.caps!=null?p.caps:"-"} / Goles: ${p.goalsNational!=null?p.goalsNational:"-"}</span>
      </div>
      <div style="margin-top:4px;">${p.brand ? `<span class="badge conf" style="${KIT_SPONSOR_BADGE_STYLE}">${kitSponsorLogoIcon(p.brand)}${escapeHtml(p.brand)}</span>` : `<span class="badge conf" style="${KIT_SPONSOR_BADGE_STYLE}">Sin sponsor</span>`}</div>
    </div>
    <div class="player-badge-render" data-pending data-player-id="${p.id}" style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2);flex-shrink:0;align-self:center;"></div>
    <div style="align-self:center;text-align:center;min-width:96px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:800;line-height:1;color:var(--indigo);">${p.rating!=null?p.rating:"-"}</div>
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">Rating</div>
    </div>
    <div style="display:flex;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-player" data-team="${team?team.id:''}" data-id="${p.id}">Editar</button>
      <button class="btn danger sm" data-action="delete-player" data-team="${team?team.id:''}" data-id="${p.id}">Eliminar</button>
    </div>
  </div>
  `;
}

// Orden natural de posiciones (arco → defensa → medio → delantero) para que no se ordene alfabético.
// Clave de orden por edad basada en la FECHA EXACTA de nacimiento: el valor es menor cuanto más
// joven es el jugador (nacido más tarde), así "Edad ↑" muestra primero a los más jóvenes y dos
// jugadores con la misma edad en años se desempatan por quién nació después. Si solo hay edad en
// años (dato antiguo), se aproxima una fecha para poder mezclarlos en el mismo orden.
function playerBirthSortKey(p){
  let t = null;
  if(p.birthDate){ const d = new Date(p.birthDate); if(!isNaN(d.getTime())) t = d.getTime(); }
  if(t==null && p.age!=null && !isNaN(p.age)){
    const approx = new Date(); approx.setFullYear(approx.getFullYear()-p.age);
    t = approx.getTime();
  }
  return t==null ? null : -t;
}
function playerValue(p,key){
  switch(key){
    case "number": return p.number;
    case "name": return playerSortName(p);
    case "pos": return POS_ORDER[p.pos] ?? 99;
    case "teamName": return p.teamName;
    case "country": return playerCountryName(p);
    case "age": return playerBirthSortKey(p);
    case "club": return p.club;
    case "rating": return p.rating;
    default: return null;
  }
}
function playerType(key){ return ["age","rating","number","pos"].includes(key) ? "number" : "string"; }
function playerDefaultDir(key){ return key==="rating" ? "desc" : "asc"; }

function renderJugadores(){
  const all = DB.teams.flatMap(t=>t.players.map(p=>({...p, teamName:t.commonName, teamId:t.id})));
  const filtered = all.filter(p=>{
    if(playerFilter.q && !playerDisplayName(p).toLowerCase().includes(playerFilter.q.toLowerCase())) return false;
    if(playerFilter.nat){ const co=nationalityCountryOf(p); if(!co || co.id!==playerFilter.nat) return false; }
    if(playerFilter.pos && p.pos!==playerFilter.pos) return false;
    return true;
  }).sort((a,b)=>
    compareGeneric(playerValue(a,playerSort.key), playerValue(b,playerSort.key), playerType(playerSort.key), playerSort.dir)
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
  // Nacionalidades presentes entre los jugadores, para el filtro.
  const natOptions = [...new Map(all.map(p=>nationalityCountryOf(p)).filter(Boolean).map(c=>[c.id,c])).values()]
    .sort((a,b)=>a.commonName.localeCompare(b.commonName,'es'));

  // La pestaña Jugadores muestra TODOS los jugadores juntos (convocados y no convocados). La división
  // por convocatoria vive en el perfil de cada selección.
  const b = playerTableBlockHTML(filtered, playerPage, "players-page"); playerPage = b.page;

  return `
  <div class="section-title"><h2>${tabLabel('jugadores','Jugadores')}</h2><span class="hint">${filtered.length} ${filtered.length===1?'jugador':'jugadores'} · mostrando ${b.range}</span></div>
  <div class="searchbar">
    <input type="text" id="player-q" placeholder="Buscar jugador..." value="${playerFilter.q}">
    <select id="player-nat-filter">
      <option value="">Todas las nacionalidades</option>
      ${natOptions.map(c=>`<option value="${c.id}" ${playerFilter.nat===c.id?"selected":""}>${escapeHtml(c.commonName)}</option>`).join("")}
    </select>
    <select id="player-pos-filter">
      <option value="">Todas las posiciones</option>
      ${["GK","DF","MF","FW"].map(p=>`<option value="${p}" ${playerFilter.pos===p?"selected":""}>${p}</option>`).join("")}
    </select>
    <button class="btn gold sm" data-action="add-player" data-team="${playerFilter.team||''}">+ Agregar jugador</button>
  </div>
  ${b.html}
  `;
}

// Encabezados de la tabla de jugadores (compartidos por ambas listas).
function playerTableHeadHTML(){
  return `<thead><tr>
    ${sortTh("Jugador","name",playerSort,"sort-players")}
    ${sortTh("Pos","pos",playerSort,"sort-players")}
    ${sortTh("País","country",playerSort,"sort-players")}
    ${sortTh("Edad","age",playerSort,"sort-players")}
    ${sortTh("Club","club",playerSort,"sort-players")}
    ${sortTh("Rating","rating",playerSort,"sort-players")}
    <th></th>
  </tr></thead>`;
}
function playerRowHTML(p){
  return `
    <tr data-action="open-player" data-id="${p.id}" style="cursor:pointer;">
      <td>${personPhotoHTML(p, "width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-right:6px;")}${playerDisplayNameHTML(p)}</td>
      <td><span class="pos-chip pos-${p.pos}">${p.pos}</span> <span style="color:var(--muted);font-size:12px;">${positionsText(p)}</span></td>
      <td>${(()=>{const cn=playerCountryName(p);return cn?flagIconHTML(cn)+escapeHtml(cn):"—";})()}</td>
      <td>${playerAge(p)!=null?playerAge(p):'—'}</td>
      <td>${p.club?`<span class="club-chip tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(p.club)}">${clubLogoIconHTML(getClubByName(p.club))}${escapeHtml(p.club)}</span>`:`<span class="club-chip">Sin club</span>`}</td>
      <td class="mono">${p.rating}</td>
      <td><button class="btn ghost sm" data-action="edit-player" data-team="${p.teamId}" data-id="${p.id}">Editar</button></td>
    </tr>`;
}
// Bloque de una lista de jugadores: pager arriba, tabla (con relleno de altura), pager abajo.
function playerTableBlockHTML(list, page, pageAction){
  const pg = paginate(list, page);
  const fillers = pg.pageCount>1 ? (LIST_PAGE_SIZE - pg.items.length) : 0;
  const range = pg.total ? `${pg.start+1}–${pg.start+pg.items.length} de ${pg.total}` : "0";
  const rows = pg.items.map(playerRowHTML).join("") || `<tr><td colspan="7" style="text-align:center;color:var(--muted);">Sin jugadores en esta lista</td></tr>`;
  const html = `
  ${pagerHTML(pg.page, pg.pageCount, pageAction)}
  <div class="tbl-wrap">
    <table>
      ${playerTableHeadHTML()}
      <tbody>
      ${rows}
      ${fillerRowsHTML(fillers, 7)}
      </tbody>
    </table>
  </div>
  ${pagerHTML(pg.page, pg.pageCount, pageAction)}`;
  return { html, page: pg.page, total: pg.total, range };
}

// Convierte un texto "9, 10, 7" en hasta 5 números válidos (0-999), en el mismo orden que los
// escribió el usuario (el orden es importante — son números favoritos en orden de importancia).
function parseFavNumbers(text){
  return (text||"").split(",")
    .map(s=>s.trim()).filter(Boolean)
    .map(s=>parseInt(s)).filter(n=>!isNaN(n) && n>=0 && n<=999)
    .slice(0,5);
}
// Revalida en tiempo real si el dorsal escrito ya lo tiene otro jugador de la convocatoria.
// El 0 (sin dorsal asignado) nunca dispara la advertencia: varios jugadores pueden estar sin número.
function checkNumberTaken(input){
  const warn = document.getElementById("f-pnumber-warning");
  if(!warn) return;
  const team = getTeam(input.dataset.team);
  if(!team){ warn.style.display = "none"; return; }
  const pid = input.dataset.pid || null;
  const val = parseInt(input.value);
  const taken = (val>0) && team.players.some(p=>p.id!==pid && p.number===val);
  warn.style.display = taken ? "" : "none";
}
function modalAddEditPlayer(teamId, player){
  const isEdit = !!player;
  const team = getTeam(teamId);
  // Para un jugador nuevo, el dorsal arranca en 0 (sin asignar). Se puede cambiar en el formulario.
  const teamCountry = teamId ? DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===teamId) : null;
  player = player || {id:null, firstName:"", lastName:"", commonName:"", fullName:"", pos:"MF", age:24, birthDate:null, club:"", rating:70, ratingPotential:null, number:null, numberClub:null, numberUnassigned:true,
    nationalityIds: teamCountry ? [teamCountry.id] : [], declaredForCountryId: teamCountry ? teamCountry.id : null,
    photo:null, caps:null, goalsNational:null, brand:null, favNumbersTeam:[], favNumbersClub:[], shirtNameTeam:"", shirtNameClub:"",
    fullNameLinked:true, shirtNameTeamLinked:true, shirtNameClubLinked:true};
  if(player.fullNameLinked===undefined) player.fullNameLinked = !player.fullName;
  if(player.shirtNameTeamLinked===undefined) player.shirtNameTeamLinked = !player.shirtNameTeam;
  if(player.shirtNameClubLinked===undefined) player.shirtNameClubLinked = !player.shirtNameClub;
  // Mientras estén "vinculados", se recalculan siempre frescos al abrir el editor (por si nombre/
  // apellido/nombre común cambiaron desde la última vez que se guardó).
  if(player.fullNameLinked) player.fullName = computeDefaultFullName(player);
  if(player.shirtNameTeamLinked) player.shirtNameTeam = computeDefaultShirtNameValue(player);
  if(player.shirtNameClubLinked) player.shirtNameClub = computeDefaultShirtNameValue(player);
  const numberTaken = (!team || player.number==null) ? false : (player.id ? team.players.some(p=>p.id!==player.id && p.number===player.number) : team.players.some(p=>p.number===player.number));
  const nationalityNames = (player.nationalityIds||[]).map(countryNameById).filter(Boolean);
  const favNumbersTeamText = (player.favNumbersTeam||[]).join(", ");
  const favNumbersClubText = (player.favNumbersClub||[]).join(", ");
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar jugador":"Agregar jugador"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          ${imageUploadField("Foto del jugador (opcional)", "pphoto", player.photo, "Si no subes una, se usa una silueta genérica.")}
          <label class="field">Nombre<input id="f-pfirstname" value="${(player.firstName||"").replace(/"/g,"&quot;")}"></label>
          <label class="field">Apellido<input id="f-plastname" value="${(player.lastName||"").replace(/"/g,"&quot;")}"></label>
          <label class="field" style="grid-column:1/-1;">Nombre común (opcional)
            <input id="f-pcommonname" value="${(player.commonName||"").replace(/"/g,"&quot;")}" placeholder="Ej. Alisson — si lo dejas vacío, se usa Nombre + Apellido">
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre completo
            <input id="f-pfullname" value="${(player.fullName||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se forma solo con Nombre + Apellido — si lo cambias a mano, ya no se actualiza solo.</span>
          </label>
          <input type="hidden" id="f-pfullname-linked" value="${player.fullNameLinked?'1':'0'}">

          <label class="field">Estatura (cm)
            <input id="f-pheight" type="number" min="140" max="230" value="${player.height!=null?player.height:''}">
          </label>
          <label class="field">${T('player.pos.label')}
            <select id="f-ppos">
              ${["GK","DF","MF","FW"].map(pos=>`<option ${pos===player.pos?"selected":""}>${pos}</option>`).join("")}
            </select>
          </label>

          <label class="field">${T('player.birthDate.label')}
            <input id="f-pbirth" type="date" value="${player.birthDate||''}">
            <span id="f-page-hint" style="font-size:10px;color:var(--muted);font-weight:400;">${player.birthDate&&computeAge(player.birthDate)!=null?`Edad: ${computeAge(player.birthDate)} años`:'Opcional — de aquí se calcula la edad.'}</span>
          </label>
          <label class="field">Género
            <select id="f-pgender">
              ${PERSON_GENDERS.map(g=>`<option value="${g}" ${g===(player.gender||"Masculino")?"selected":""}>${g}</option>`).join("")}
            </select>
          </label>

          <label class="field">${T('player.rating.label')}<input id="f-prating" type="number" min="0" max="99" value="${player.rating}"></label>
          <label class="field">Rating potencial (0-99)<input id="f-prating-potential" type="number" min="0" max="99" value="${player.ratingPotential!=null?player.ratingPotential:''}" placeholder="—"></label>
          <label class="field">${T('player.club.label')}
            <input id="f-pclub" list="club-list" value="${player.club}" placeholder="${T('player.club.placeholder')}">
            <datalist id="club-list">${datalistOptions(DB.clubs.slice().sort((a,b)=>a.localeCompare(b,'es')))}</datalist>
          </label>

          <div class="subhead">${T('player.nationalities.label')}</div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('player.nationalities.label')} (puedes agregar varias)
            <div id="nationality-rows">
              ${(nationalityNames.length?nationalityNames:[""]).map(n=>nationalityRowHTML(n)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="add-nationality-row">+ Agregar nacionalidad</button></div>
            <datalist id="nation-list">${datalistOptions(sortedCountries().map(c=>c.commonName))}</datalist>
          </div>
          <label class="field" style="grid-column:1/-1;">${T('player.declaredFor.label')}
            <select id="f-pdeclared">
              <option value="">${T('player.declaredFor.none')}</option>
              ${(player.nationalityIds||[]).map(id=>{ const c=(DB.countries||[]).find(x=>x.id===id); return c?`<option value="${c.id}" ${player.declaredForCountryId===c.id?"selected":""}>${(c.teamLinks&&c.teamLinks.absoluta)?"✓ ":""}${escapeHtml(c.commonName)}</option>`:""; }).join("")}
            </select>
            <span style="font-size:11px;color:var(--muted);font-weight:400;">Solo puede declarar por una de sus nacionalidades.</span>
          </label>

          <style id="pos-editor-css">
            .pos-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:4px;}
            .pos-col-h{font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted);font-weight:700;margin-bottom:5px;}
            .pos-row{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;}
            .pos-row-l{font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--ink);display:flex;align-items:center;gap:4px;}
            .pos-val{width:52px;padding:5px 6px;font-size:13px;text-align:center;background:var(--surface-2);border:1px solid var(--line);border-radius:8px;color:var(--ink);}
            .pos-cbside{padding:2px;font-size:11px;background:var(--surface-2);border:1px solid var(--line);border-radius:6px;color:var(--ink);}
          </style>
          <div class="subhead">Perfiles</div>
          <label class="field">Pie izquierdo (1–20)
            <input id="f-pfootleft" type="number" min="1" max="20" value="${player.footLeft!=null?player.footLeft:''}" placeholder="1–20">
          </label>
          <label class="field">Pie derecho (1–20)
            <input id="f-pfootright" type="number" min="1" max="20" value="${player.footRight!=null?player.footRight:''}" placeholder="1–20">
          </label>
          <div class="field" style="grid-column:1/-1;font-weight:400;">
            <span style="font-size:11px;color:var(--muted);">El más alto es el pie dominante (normalmente 20); pueden ser iguales.</span>
          </div>

          <div class="subhead">Posiciones</div>
          ${(function(){
            const cbSide = player.cbSide||'';
            const posRow = (code,name)=>`
                  <div class="pos-row">
                    <span class="pos-row-l" title="${escapeHtml(name)}">${code}${code==='CB'?` <select id="f-pcbside" class="pos-cbside"><option value="" ${cbSide===''?'selected':''}>—</option><option value="L" ${cbSide==='L'?'selected':''}>L</option><option value="R" ${cbSide==='R'?'selected':''}>R</option></select>`:''}</span>
                    <input class="pos-val" data-poscode="${code}" type="number" min="0" max="20" value="${(player.positions&&player.positions[code]!=null)?player.positions[code]:0}" placeholder="0">
                  </div>`;
            const grp = code => POSICIONES_DEF.find(g=>g.group===code);
            const colHTML = (title, items) => `<div class="pos-col"><div class="pos-col-h">${title}</div>${items.map(([c,n])=>posRow(c,n)).join('')}</div>`;
            const col1 = `<div class="pos-col">
                <div class="pos-col-h">Portero</div>${grp('PORTERO').items.map(([c,n])=>posRow(c,n)).join('')}
                <div class="pos-col-h" style="margin-top:12px;">Defensa</div>${grp('DEFENSAS').items.map(([c,n])=>posRow(c,n)).join('')}
              </div>`;
            const col2 = colHTML('Mediocampista', grp('MEDIOCAMPISTAS').items);
            const col3 = colHTML('Delantero', grp('DELANTEROS').items);
            return `<div class="field" style="grid-column:1/-1;font-weight:400;">
              <div style="font-size:11px;color:var(--muted);margin-bottom:6px;">Valor 1–20 por posición.</div>
              <div class="pos-grid">${col1}${col2}${col3}</div>
              <div id="pos-mismatch" style="font-size:11px;margin-top:8px;color:var(--amber);${derivedMainCat(player)&&derivedMainCat(player)!==player.pos?'':'display:none;'}">⚠︎ La posición de mayor valor (${derivedMainCat(player)||'—'}) no coincide con la posición principal declarada (${player.pos||'—'}).</div>
            </div>`;
          })()}

          <div class="subhead">Estadísticas con la selección</div>
          <label class="field">Internacionalidades (caps)
            <input id="f-pcaps" type="number" min="0" value="${player.caps!=null?player.caps:''}" placeholder="Por llenar después">
          </label>
          <label class="field">Goles con la selección
            <input id="f-pgoalsnat" type="number" min="0" value="${player.goalsNational!=null?player.goalsNational:''}" placeholder="Por llenar después">
          </label>

          <div class="subhead">Dorsales y nombre en camiseta</div>
          <label class="field">Dorsal en selección
            <input id="f-pnumber" type="number" min="0" max="99" value="${player.number!=null?player.number:0}" data-team="${team?team.id:''}" data-pid="${player.id||''}" oninput="checkNumberTaken(this)">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">0 = sin dorsal asignado</span>
          </label>
          <label class="field">Dorsal en club
            <input id="f-pnumber-club" type="number" min="0" max="99" value="${player.numberClub!=null?player.numberClub:0}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">0 = sin dorsal asignado</span>
          </label>
          <p id="f-pnumber-warning" style="grid-column:1/-1;font-size:11.5px;color:#C24A2E;margin:0;${numberTaken?'':'display:none;'}">${T('player.numberTaken.warning')}</p>
          <label class="field">Dorsales favoritos (selección)
            <input id="f-pfavnums-team" value="${favNumbersTeamText}" placeholder="Ej. 9, 10, 7 (hasta 5, en orden)">
          </label>
          <label class="field">Dorsales favoritos (club)
            <input id="f-pfavnums-club" value="${favNumbersClubText}" placeholder="Ej. 9, 10, 7 (hasta 5, en orden)">
          </label>
          <label class="field">Nombre en camiseta (selección)
            <input id="f-pshirtname-team" maxlength="50" value="${(player.shirtNameTeam||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se actualiza solo con el nombre común o el apellido — si lo cambias a mano, ya no.</span>
          </label>
          <input type="hidden" id="f-pshirtname-team-linked" value="${player.shirtNameTeamLinked?'1':'0'}">
          <label class="field">Nombre en camiseta (club)
            <input id="f-pshirtname-club" maxlength="50" value="${(player.shirtNameClub||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se actualiza solo con el nombre común o el apellido — si lo cambias a mano, ya no.</span>
          </label>
          <input type="hidden" id="f-pshirtname-club-linked" value="${player.shirtNameClubLinked?'1':'0'}">
          <label class="field" style="grid-column:1/-1;">Marca patrocinadora
            <input id="f-pbrand" list="player-brand-list" value="${(player.brand||"").replace(/"/g,"&quot;")}" placeholder="Escribe o elige una marca">
            <datalist id="player-brand-list"><option value="Sin sponsor">${apparelBrandNames().filter(b=>b.toLowerCase()!=="sin sponsor").map(b=>`<option value="${escapeHtml(b)}">`).join("")}</datalist>
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-player" data-team="${teamId||''}" data-id="${player.id||''}">Guardar</button>
      </div>
    </div>
  `);
}

