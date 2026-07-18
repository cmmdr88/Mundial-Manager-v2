/* =========================================================
   COPA MANAGER 2026 — app/busqueda-global.js
   Buscador global de la barra superior (selecciones y jugadores con
   ficha): abrir/cerrar el desplegable, ejecutar la búsqueda, render de
   resultados y enganche de eventos. Extracción mecánica: texto y orden
   idénticos al original. Script CLÁSICO (no module). Cargar DESPUÉS de
   core/utilidades.js (escapeHtml) y ANTES del <script> inline. Usa en
   tiempo de ejecución DB, playerDisplayName (jugadores) y
   navigateToTeam/navigateToPlayer (router), todos en el inline. Lo
   arranca init (llama a buildGlobalSearch una vez). Engancha sus propios
   listeners; no depende de handleAction.
   ========================================================= */

/* ---------- Buscador global (solo elementos con ficha: selecciones y jugadores) ---------- */
function closeGlobalSearch(){
  const box = document.getElementById("global-search-results");
  if(box){ box.innerHTML=""; box.classList.remove("open"); }
}
function runGlobalSearch(qRaw){
  const box = document.getElementById("global-search-results");
  if(!box) return;
  const q = (qRaw||"").trim().toLowerCase();
  if(!q){ closeGlobalSearch(); return; }
  const has = s => (s||"").toLowerCase().includes(q);

  // Evento (Copa Mundial): coincide por su nombre/nombre corto/oficial resueltos o por palabras clave.
  const eventHits = [];
  if(DB.event){
    const ev = DB.event;
    const names = [
      typeof eventFieldText==="function" ? eventFieldText(ev,'name') : ev.name,
      typeof eventFieldText==="function" ? eventFieldText(ev,'shortName') : ev.shortName,
      typeof eventFieldText==="function" ? eventFieldText(ev,'officialName') : ev.officialName,
      typeof eventFieldText==="function" ? eventFieldText(ev,'code') : ev.code,
      "copa mundial", "mundial", "torneo", "evento"
    ];
    if(names.some(n=>has(n))){
      const label = (typeof eventFieldText==="function" ? eventFieldText(ev,'name') : ev.name) || "Copa Mundial";
      eventHits.push({type:"event", id:"event", label, sub:"Torneo"});
    }
  }

  // Selecciones (por nombre o código FIFA)
  const teamHits = DB.teams
    .filter(t=> has(t.commonName) || has(t.fifaCode))
    .slice(0,6)
    .map(t=>({type:"team", id:t.id, label:t.commonName, sub:"Selección"+(t.fifaCode?` · ${t.fifaCode}`:"")}));

  // Jugadores (por nombre visible, apellido o club), etiquetados con su selección
  const playerHits = [];
  for(const t of DB.teams){
    for(const p of t.players){
      if(has(playerDisplayName(p)) || has(p.lastName) || has(p.firstName) || has(p.club)){
        playerHits.push({type:"player", id:p.id, label:playerDisplayName(p), sub:`Jugador · ${t.commonName}`});
      }
    }
  }
  playerHits.sort((a,b)=>a.label.localeCompare(b.label));
  const players = playerHits.slice(0,8);

  let html = "";
  if(eventHits.length){
    html += `<div class="gs-group">Torneo</div>`;
    html += eventHits.map(r=>gsItemHTML(r)).join("");
  }
  if(teamHits.length){
    html += `<div class="gs-group">Selecciones</div>`;
    html += teamHits.map(r=>gsItemHTML(r)).join("");
  }
  if(players.length){
    html += `<div class="gs-group">Jugadores</div>`;
    html += players.map(r=>gsItemHTML(r)).join("");
  }
  if(!html) html = `<div class="gs-empty">Sin resultados para "${escapeHtml(qRaw.trim())}"</div>`;
  box.innerHTML = html;
  box.classList.add("open");
}
function gsItemHTML(r){
  return `<button class="gs-item" data-action="global-search-go" data-type="${r.type}" data-id="${r.id}">
    <span class="gs-label">${escapeHtml(r.label)}</span>
    <span class="gs-sub">${escapeHtml(r.sub)}</span>
  </button>`;
}
// Se engancha una sola vez al arrancar (los elementos viven en el topbar, fuera de #view, así que
// no se re-renderizan y conservan su estado mientras navegas).
function buildGlobalSearch(){
  const input = document.getElementById("global-search-input");
  const box = document.getElementById("global-search-results");
  const wrap = document.getElementById("global-search");
  if(!input || !box || !wrap) return;
  input.addEventListener("input", ()=> runGlobalSearch(input.value));
  input.addEventListener("focus", ()=>{ if(input.value.trim()) runGlobalSearch(input.value); });
  input.addEventListener("keydown", (e)=>{
    if(e.key==="Escape"){ input.value=""; closeGlobalSearch(); input.blur(); }
  });
  box.addEventListener("click", (e)=>{
    const item = e.target.closest("[data-action='global-search-go']");
    if(!item) return;
    const {type, id} = item.dataset;
    input.value = "";
    closeGlobalSearch();
    if(type==="team") navigateToTeam(id);
    else if(type==="player") navigateToPlayer(id);
    else if(type==="event"){ if(typeof eventoDetailOpen!=="undefined") eventoDetailOpen=false; navigateTo("evento", null); }
  });
  // Cerrar el desplegable al hacer clic fuera del buscador.
  document.addEventListener("click", (e)=>{ if(!wrap.contains(e.target)) closeGlobalSearch(); });
}
