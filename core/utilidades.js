/* =========================================================
   COPA MANAGER 2026 — core/utilidades.js
   Funciones utilitarias sin estado + contadores de ID (dueño único).
   Extracción mecánica: texto y orden idénticos al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (usa CUSTOM_COLORS/PALETTES) y ANTES del <script> inline.
   ========================================================= */

function colorsFor(name, conf){ return CUSTOM_COLORS[name] || PALETTES[conf] || ["#3C4A42","#1F2A24"]; }

function stripDiacritics(text){
  return (text||"").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function initials(name){
  return name.replace("Países Bajos","NED").replace("Estados Unidos","USA").replace("Corea del Sur","KOR")
    .replace("Arabia Saudita","KSA").replace("Costa de Marfil","CIV").replace("Nueva Zelanda","NZL")
    .replace("República Democrática del Congo","COD").split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();
}

function isoDate(y,mo,d){
  if(!y||!mo||!d) return null;
  return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function normLoose(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[.\-_'`´]/g,"").replace(/\s+/g," ").trim();
}

function newClubId(){ return "cl_" + Math.random().toString(36).slice(2,9); }

function shiftColor(hex, amt){
  try{
    const c = hex.replace("#","");
    const num = parseInt(c.length===3 ? c.split('').map(x=>x+x).join('') : c, 16);
    let r = (num>>16)+amt, g = ((num>>8)&0x00FF)+amt, b = (num&0x0000FF)+amt;
    r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
    return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }catch(e){ return hex; }
}

let _seedCounter = 1;

function uid(){ return "p" + (_seedCounter++); }

function escapeHtml(s){
  return String(s==null?"":s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function normalizeName(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
}

function numInRange(raw, min, max){
  if(raw==null || String(raw).trim()==="") return null;
  const n = parseInt(raw);
  if(isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

let _newIdCounter = 0;

function newId(prefix){
  _newIdCounter++;
  return prefix + Date.now().toString(36) + "_" + _newIdCounter.toString(36) + Math.floor(Math.random()*46656).toString(36);
}

function isRegistered(p){ return p.number!=null && !p.numberUnassigned; }

function avgRating(players){ return players.length ? Math.round(players.reduce((s,p)=>s+(p.rating||0),0)/players.length) : null; }

function compareGeneric(a,b,type,dir){
  let cmp;
  if(a==null && b==null) cmp = 0;
  else if(a==null) cmp = 1;
  else if(b==null) cmp = -1;
  else if(type==="string") cmp = String(a).localeCompare(String(b));
  else cmp = a-b;
  return dir==="asc" ? cmp : -cmp;
}

function sortTh(label, key, sortState, action){
  const active = sortState.key===key;
  const arrow = active ? (sortState.dir==="asc"?" ▲":" ▼") : "";
  return `<th data-action="${action}" data-key="${key}" style="cursor:pointer;user-select:none;white-space:nowrap;">${label}<span class="mono" style="color:var(--indigo-bright);">${arrow}</span></th>`;
}

function toggleSort(sortState, key, defaultDir){
  if(sortState.key===key){ sortState.dir = sortState.dir==="asc"?"desc":"asc"; }
  else { sortState.key = key; sortState.dir = defaultDir; }
}

function hexToRgb(hex){
  hex = (hex||"#000000").replace("#","");
  if(hex.length===3) hex = hex.split("").map(c=>c+c).join("");
  return [parseInt(hex.slice(0,2),16)||0, parseInt(hex.slice(2,4),16)||0, parseInt(hex.slice(4,6),16)||0];
}
