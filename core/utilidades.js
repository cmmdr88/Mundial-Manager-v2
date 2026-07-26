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

// --- Paginación de listas grandes (jugadores, entrenadores, árbitros, clubes) ---
// Con listas de 100 filas por página el HTML por render es pequeño y la navegación es fluida, sin
// necesidad de trucos de deduplicación. El estado vive aquí (scope global de scripts clásicos) y se
// reinicia a 1 al cambiar filtro u orden. El orden lo fija el ordenamiento antes de partir en páginas,
// así que se mantiene consistente entre páginas.
const LIST_PAGE_SIZE = 100;
let playerPage = 1, coachPage = 1, refereePage = 1, clubPage = 1, uncalledPage = 1;

// Calcula el corte de la página actual. Devuelve {page, pageCount, start, items, total}.
function paginate(list, page){
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  let p = page || 1;
  if(p > pageCount) p = pageCount;
  if(p < 1) p = 1;
  const start = (p - 1) * LIST_PAGE_SIZE;
  return { page:p, pageCount, start, items:list.slice(start, start + LIST_PAGE_SIZE), total };
}

// Controles de paginación. `action` es el data-action que dispara el cambio de página (el handler lee
// data-page; el botón "Ir" lleva data-goto y el handler lee el número del input contiguo). Ocupa todo
// el ancho y SIEMPRE se muestra: si solo hay una página, los botones salen deshabilitados (grises).
function pagerHTML(page, pageCount, action){
  const one = pageCount <= 1;
  const btn = (p, label, disabled, cur) =>
    `<button class="pager-btn${cur?' cur':''}" data-action="${action}" data-page="${p}"${disabled?' disabled':''}>${label}</button>`;
  let from = Math.max(1, page - 2), to = Math.min(pageCount, page + 2);
  if(page <= 3) to = Math.min(pageCount, 5);
  if(page >= pageCount - 2) from = Math.max(1, pageCount - 4);
  let nums = "";
  if(from > 1) nums += btn(1, "1", one, page===1) + (from > 2 ? `<span class="pager-gap">…</span>` : "");
  for(let i = from; i <= to; i++) nums += btn(i, String(i), one, i === page);
  if(to < pageCount) nums += (to < pageCount - 1 ? `<span class="pager-gap">…</span>` : "") + btn(pageCount, String(pageCount), one, page===pageCount);
  return `<div class="pager">
    <div class="pager-side pager-side-left">${btn(page - 1, "‹ Anterior", one || page <= 1, false)}</div>
    <div class="pager-nums">${nums}</div>
    <div class="pager-side pager-side-right">
      ${btn(page + 1, "Siguiente ›", one || page >= pageCount, false)}
      <span class="pager-goto">
        <input type="number" class="pager-goto-input" min="1" max="${pageCount}" value="${page}" ${one?'disabled':''} aria-label="Ir a la página">
        <button class="pager-btn pager-goto-btn" data-action="${action}" data-goto="1"${one?' disabled':''}>Ir</button>
      </span>
    </div>
  </div>`;
}

// Filas de relleno para que todas las páginas midan lo mismo (evita que al pasar a la última página,
// con menos filas, la lista se acorte y el scroll salte). Solo se usan cuando hay más de una página.
function fillerRowsHTML(count, colspan){
  if(count <= 0) return "";
  const row = `<tr class="pager-filler"><td colspan="${colspan}"><span class="pager-filler-cell"></span></td></tr>`;
  return new Array(count).fill(row).join("");
}
