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
  // La comparación ignora acentos y signos: buscar "Felix" encuentra "Félix", y al revés.
  const qLoose = (typeof normLoose==="function") ? normLoose(qRaw||"") : q;
  const has = s => {
    const v = s||"";
    if(v.toLowerCase().includes(q)) return true;
    if(!qLoose) return false;
    return (typeof normLoose==="function") ? normLoose(v).includes(qLoose) : false;
  };

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

  // Selecciones (por nombre común, oficial, nombre corto, código FIFA/COI o abreviatura de uso común
  // como "EUA" para Estados Unidos).
  const teamHits = DB.teams
    .filter(t=> has(t.commonName) || has(t.officialName) || has(t.shortName) ||
                has(t.fifaCode) || has(t.iocCode) ||
                (typeof countryShortLabel==="function" && has(countryShortLabel(t.commonName))))
    .slice(0,6)
    .map(t=>({type:"team", id:t.id, label:t.commonName, sub:"Selección"+(t.fifaCode?` · ${t.fifaCode}`:"")}));

  // Clubes: solo por sus NOMBRES (nombre común, oficial, completo, corto, alias) y CÓDIGOS (code,
  // codeAlt). No se buscan apodos ni atributos de otra entidad (país/liga).
  const clubHits = (DB.clubsData||[])
    .filter(c=> has(clubDisplayName(c)) || has(c.commonName) || has(c.officialName) || has(c.fullName) ||
                has(c.shortName) || has(c.code) || has(c.codeAlt) ||
                (Array.isArray(c.aliases) && c.aliases.some(a=> has(a))))
    .sort((a,b)=>clubDisplayName(a).localeCompare(clubDisplayName(b),'es'))
    .slice(0,8)
    .map(c=>{
      const partes = ["Club"];
      if((c.country||"").trim()) partes.push(countryShortLabel(c.country.trim()));
      if((c.league||"").trim()) partes.push(c.league.trim());
      return {type:"club", id:c.id, label:clubDisplayName(c), sub:partes.join(" · ")};
    });

  // Jugadores: solo por sus nombres (nombre visible, nombre, apellido, nombre completo).
  const playerHits = [];
  for(const t of DB.teams){
    for(const p of t.players){
      if(has(playerDisplayName(p)) || has(p.firstName) || has(p.lastName) || has(p.fullName)){
        // "Jugador · País · Club" (el club solo si lo tiene).
        const partes = ["Jugador", t.commonName];
        if((p.club||"").trim()) partes.push(p.club.trim());
        playerHits.push({type:"player", id:p.id, label:playerDisplayName(p), sub:partes.join(" · ")});
      }
    }
  }
  playerHits.sort((a,b)=>a.label.localeCompare(b.label));
  const players = playerHits.slice(0,8);

  // Entrenadores: solo por sus nombres (nombre visible, nombre, apellido, nombre completo).
  const coachHits = [];
  for(const t of DB.teams){
    for(const c of (t.coaches||[])){
      if(has(playerDisplayName(c)) || has(c.firstName) || has(c.lastName) || has(c.fullName)){
        coachHits.push({type:"coach", id:c.id, label:playerDisplayName(c), sub:`Entrenador · ${t.commonName}`});
      }
    }
  }
  coachHits.sort((a,b)=>a.label.localeCompare(b.label));
  const coaches = coachHits.slice(0,8);

  // Árbitros: solo por sus nombres (nombre visible, nombre, apellido, nombre completo).
  const refereeHits = [];
  for(const r of (DB.referees||[])){
    if(has(playerDisplayName(r)) || has(r.firstName) || has(r.lastName) || has(r.fullName)){
      const cn = (typeof countryNameById==="function" && r.countryRepresentsId) ? (countryNameById(r.countryRepresentsId)||"") : "";
      refereeHits.push({type:"referee", id:r.id, label:playerDisplayName(r), sub:`${r.role||"Árbitro"}${cn?` · ${cn}`:""}`});
    }
  }
  refereeHits.sort((a,b)=>a.label.localeCompare(b.label));
  const referees = refereeHits.slice(0,8);

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
  if(coaches.length){
    html += `<div class="gs-group">Entrenadores</div>`;
    html += coaches.map(r=>gsItemHTML(r)).join("");
  }
  if(referees.length){
    html += `<div class="gs-group">Árbitros</div>`;
    html += referees.map(r=>gsItemHTML(r)).join("");
  }
  if(clubHits.length){
    html += `<div class="gs-group">Clubes</div>`;
    html += clubHits.map(r=>gsItemHTML(r)).join("");
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
    else if(type==="coach") navigateToCoach(id);
    else if(type==="referee") navigateToReferee(id);
    else if(type==="club") navigateToClub(id);
    else if(type==="event"){ if(typeof eventoDetailOpen!=="undefined") eventoDetailOpen=false; navigateTo("evento", null); }
  });
  // Cerrar el desplegable al hacer clic fuera del buscador.
  document.addEventListener("click", (e)=>{ if(!wrap.contains(e.target)) closeGlobalSearch(); });
}
