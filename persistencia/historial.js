/* =========================================================
   COPA MANAGER 2026 — persistencia/historial.js
   Persistencia — historial de cambios (deshacer) con diff por entidad y reversión.
   Consts de configuración (HISTORY_KEY, HISTORY_MAX, HISTORY_MAX_BYTES), estado
   (HISTORY, PREV_DB_JSON, historySaveTimer), el mapa de colecciones diffables
   (HIST_COLLS) y las funciones histTopKeyLabel, diffTeamPlayers, computeDBDiff,
   recordHistory, saveHistory, loadHistory, applyReverseOps, deleteHistoryFrom.
   Extracción mecánica: texto y orden idénticos al original. Script CLÁSICO (no
   module). Cargar DESPUÉS de nucleo/modelo-db.js (DB, getTeam) y de los módulos de
   dominio cuyas etiquetas usa HIST_COLLS (estadios, paises, clubes, jugadores) y
   app/modales.js (showToast), y ANTES del <script> inline. Acoplamiento en tiempo
   de ejecución con almacenamiento: historial declara PREV_DB_JSON (baseline del
   diff) que loadDB/persist referencian, y usa STORAGE_KEY (de almacenamiento) al
   revertir; sin ciclo de carga (todo call-time). Lo invocan persist (recordHistory),
   init (loadHistory) y los casos de deshacer de handleAction (deleteHistoryFrom),
   que permanecen en el inline.
   ========================================================= */

/* ---------- Historial de cambios (últimos 50) ----------
   Cada guardado compara la base contra el estado anterior y registra SOLO lo que cambió,
   guardando el "antes" de cada entidad afectada. Eliminar una entrada del historial
   revierte la base al estado previo a ese cambio (deshaciendo también los posteriores,
   que se construyeron encima), sin tocar nada más. */
const HISTORY_KEY = "wc26_history_v1";
const HISTORY_MAX = 50;
const HISTORY_MAX_BYTES = 3000000; // margen amplio bajo el límite de almacenamiento por clave
let HISTORY = [];
let PREV_DB_JSON = null;   // último estado persistido (para calcular el diff)
let historySaveTimer = null;

// Colecciones con identificador propio: el diff es entidad por entidad.
const HIST_COLLS = {
  teams:     { noun:"Selección", fem:true,  label:t=>t.name||t.commonName||t.id },
  clubsData: { noun:"Club",      fem:false, label:c=>c.commonName||c.id },
  stadiums:  { noun:"Estadio",   fem:false, label:s=>stadiumDisplayName(s) },
  countries: { noun:"País",      fem:false, label:c=>c.name||c.id }
};
function histTopKeyLabel(k){
  const m = { clubs:"Lista de nombres de clubes", leagues:"Catálogo de ligas", brands:"Catálogo de marcas",
              sponsorCategories:"Categorías de patrocinio", uiText:"Textos de la interfaz" };
  return (m[k] || ("Datos: "+k)) + " (modificado)";
}
// Compara las plantillas de una selección jugador por jugador. Así, editar a un jugador
// (por ejemplo cambiarle el club) se registra como cambio DEL JUGADOR, independiente de
// la selección y del club, y revertirlo solo toca a ese jugador.
function diffTeamPlayers(oldT, newT, ops, parts, teamName){
  const a = oldT.players||[], b = newT.players||[];
  const mapA = new Map(a.map((p,i)=>[p.id,{p,i}]));
  const idsB = new Set(b.map(p=>p.id));
  const pname = p => playerDisplayName(p);
  let any = false;
  b.forEach(p=>{
    const old = mapA.get(p.id);
    if(!old){ ops.push({t:"player",teamId:newT.id,id:p.id,before:null}); parts.push(`Jugador «${pname(p)}» agregado (${teamName})`); any=true; }
    else if(JSON.stringify(old.p)!==JSON.stringify(p)){ ops.push({t:"player",teamId:newT.id,id:p.id,before:old.p,idx:old.i}); parts.push(`Jugador «${pname(p)}» modificado (${teamName})`); any=true; }
  });
  a.forEach((p,i)=>{ if(!idsB.has(p.id)){ ops.push({t:"player",teamId:newT.id,id:p.id,before:p,idx:i}); parts.push(`Jugador «${pname(p)}» eliminado (${teamName})`); any=true; } });
  if(!any && a.length===b.length && a.some((p,i)=>b[i] && b[i].id!==p.id)){
    ops.push({t:"porder",teamId:newT.id,ids:a.map(p=>p.id)}); parts.push(`Orden de jugadores cambiado (${teamName})`);
  }
}
// Compara dos estados de la base y produce: ops para deshacer + piezas de descripción.
function computeDBDiff(oldDB, newDB){
  const ops = [], parts = [];
  const keys = new Set([...Object.keys(oldDB||{}), ...Object.keys(newDB||{})]);
  keys.forEach(k=>{
    const a = oldDB ? oldDB[k] : undefined, b = newDB[k];
    const meta = HIST_COLLS[k];
    if(meta && Array.isArray(a) && Array.isArray(b)){
      const suf = w => meta.fem ? w+"a" : w+"o";
      const mapA = new Map(a.map((e,i)=>[e.id,{e,i}]));
      const idsB = new Set(b.map(e=>e.id));
      b.forEach(e=>{
        const old = mapA.get(e.id);
        if(!old){ ops.push({t:"ent",coll:k,id:e.id,before:null}); parts.push(meta.noun+" «"+meta.label(e)+"» "+suf("agregad")); }
        else if(JSON.stringify(old.e)!==JSON.stringify(e)){
          // Selecciones: si lo único que cambió fue la plantilla, registra jugador por jugador
          // (el cambio de un jugador es independiente de su selección y de su club).
          if(k==="teams" && JSON.stringify({...old.e, players:null})===JSON.stringify({...e, players:null})){
            diffTeamPlayers(old.e, e, ops, parts, meta.label(e));
          } else {
            ops.push({t:"ent",coll:k,id:e.id,before:old.e,idx:old.i}); parts.push(meta.noun+" «"+meta.label(e)+"» "+suf("modificad"));
          }
        }
      });
      a.forEach((e,i)=>{ if(!idsB.has(e.id)){ ops.push({t:"ent",coll:k,id:e.id,before:e,idx:i}); parts.push(meta.noun+" «"+meta.label(e)+"» "+suf("eliminad")); } });
      // Reordenamiento puro (mismas entidades, distinto orden): se guarda el orden anterior.
      if(!ops.some(o=>o.t==="ent"&&o.coll===k) && a.length===b.length && a.some((e,i)=>b[i] && b[i].id!==e.id)){
        ops.push({t:"order",coll:k,ids:a.map(e=>e.id)}); parts.push("Orden de "+(meta.noun.toLowerCase())+"es cambiado");
      }
    } else {
      const ja = JSON.stringify(a===undefined?null:a), jb = JSON.stringify(b===undefined?null:b);
      if(ja!==jb){ ops.push({t:"top",key:k,before:(a===undefined?undefined:a)}); parts.push(histTopKeyLabel(k)); }
    }
  });
  return {ops, parts};
}
function recordHistory(){
  try{
    const oldDB = JSON.parse(PREV_DB_JSON);
    const {ops, parts} = computeDBDiff(oldDB, DB);
    if(!ops.length) return;
    const uniq = [...new Set(parts)];
    const desc = uniq.slice(0,3).join(" · ") + (uniq.length>3 ? ` · +${uniq.length-3} cambios más` : "");
    HISTORY.push({id:newId("h"), ts:Date.now(), desc, ops});
    while(HISTORY.length>HISTORY_MAX) HISTORY.shift();
    let js = JSON.stringify(HISTORY);
    while(js.length>HISTORY_MAX_BYTES && HISTORY.length>1){ HISTORY.shift(); js = JSON.stringify(HISTORY); }
    saveHistory(js);
  }catch(e){ /* el historial nunca debe impedir el guardado */ }
}
function saveHistory(js){
  if(historySaveTimer) clearTimeout(historySaveTimer);
  historySaveTimer = setTimeout(async ()=>{
    try{ await window.storage.set(HISTORY_KEY, js || JSON.stringify(HISTORY), false); }catch(e){}
  }, 400);
}
async function loadHistory(){
  try{
    const r = await window.storage.get(HISTORY_KEY, false);
    if(r && r.value) HISTORY = JSON.parse(r.value) || [];
  }catch(e){ HISTORY = []; }
}
// Aplica los "antes" de una entrada (deshace ese cambio).
function applyReverseOps(ops){
  (ops||[]).forEach(op=>{
    if(op.t==="top"){
      if(op.before===undefined) delete DB[op.key];
      else DB[op.key] = op.before;
    } else if(op.t==="order"){
      const arr = DB[op.coll]||[];
      const byId = new Map(arr.map(e=>[e.id,e]));
      const ordered = op.ids.map(id=>byId.get(id)).filter(Boolean);
      arr.forEach(e=>{ if(!op.ids.includes(e.id)) ordered.push(e); });
      DB[op.coll] = ordered;
    } else if(op.t==="player"){
      const tm = (DB.teams||[]).find(x=>x.id===op.teamId);
      if(!tm) return; // si la selección ya no existe (la restauró/quitó otra op), no hay nada que hacer
      if(!Array.isArray(tm.players)) tm.players = [];
      const i = tm.players.findIndex(p=>p.id===op.id);
      if(i>=0) tm.players.splice(i,1);
      if(op.before) tm.players.splice(Math.min(op.idx??tm.players.length, tm.players.length), 0, op.before);
    } else if(op.t==="porder"){
      const tm = (DB.teams||[]).find(x=>x.id===op.teamId);
      if(!tm || !Array.isArray(tm.players)) return;
      const byId = new Map(tm.players.map(p=>[p.id,p]));
      const ordered = op.ids.map(id=>byId.get(id)).filter(Boolean);
      tm.players.forEach(p=>{ if(!op.ids.includes(p.id)) ordered.push(p); });
      tm.players = ordered;
    } else if(op.t==="ent"){
      if(!Array.isArray(DB[op.coll])) DB[op.coll] = [];
      const arr = DB[op.coll];
      const i = arr.findIndex(e=>e.id===op.id);
      if(i>=0) arr.splice(i,1);
      if(op.before) arr.splice(Math.min(op.idx??arr.length, arr.length), 0, op.before);
    }
  });
}
// Elimina la entrada indicada revirtiendo la base a como estaba antes de ese cambio.
// Los cambios posteriores se deshacen también (se hicieron sobre ese estado).
function deleteHistoryFrom(entryId){
  const idx = HISTORY.findIndex(h=>h.id===entryId);
  if(idx<0) return;
  for(let i=HISTORY.length-1; i>=idx; i--) applyReverseOps(HISTORY[i].ops);
  HISTORY = HISTORY.slice(0, idx);
  PREV_DB_JSON = JSON.stringify(DB); // la reversión no se registra como un cambio nuevo
  saveHistory();
  (async ()=>{ try{ await window.storage.set(STORAGE_KEY, PREV_DB_JSON, false); }catch(e){ showToast("No se pudo guardar (almacenamiento)"); } })();
  // Si lo que se estaba viendo ya no existe, vuelve al editor.
  if(activeTeamId && !getTeam(activeTeamId)){ activeTeamId = null; activeTab = "editor"; }
}
