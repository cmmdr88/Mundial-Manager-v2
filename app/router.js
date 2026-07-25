/* =========================================================
   COPA MANAGER 2026 — app/router.js
   Router: estado de navegación y coordinación de vistas. Estado de navegación
   (activeTab, activeTeamId, activePlayerId, activeClubId, navHistory, navIndex,
   MAX_NAV_HISTORY), scroll por pantalla (currentScrollY, saveScrollToCurrent,
   scrollToTop, restoreScroll), navegación (navigateTo, navigateToClub/Team/Player,
   replaceCurrentClub/Team/Player, pushHistory, navBack, navForward, resetNavHistory)
   y coordinación de render (renderTabs, renderNavButtons, render). render() decide la
   vista por activeTab e invoca los render externos; NO contiene presentación de
   dominio. Extracción mecánica: texto y orden idénticos al original. Script CLÁSICO
   (no module). Cargar DESPUÉS de los módulos de dominio (cuyos render invoca),
   nucleo/modelo-db.js y datos/constantes.js (TABS), y ANTES del <script> inline.
   Invoca en tiempo de ejecución renderInicio y attachHandlers, que permanecen en el
   inline (vista de inicio e init/attachHandlers, pasos futuros). El estado de
   dominio/UI (eventoDetailOpen, eventBracketDraft, seleccionesSort, clipboard, etc.)
   NO es del router y permanece en el inline.
   ========================================================= */

/* ---------- Estado en memoria ---------- */
let activeTab = "inicio";
let activeTeamId = null;
let activePlayerId = null;
let activeCoachId = null;
let activeRefereeId = null;
let activeClubId = null;

/* ---------- Historial de navegación (adelante / atrás) ---------- */
// Cada entrada guarda también la posición de scroll (scrollY) de esa pantalla, para que "Volver"
// (o las flechas ◀ ▶ del historial) te regrese exactamente a la altura donde estabas, mientras que
// abrir una pantalla nueva o cambiar de pestaña siempre arranca hasta arriba.
let navHistory = [{tab:"inicio", teamId:null, playerId:null, scrollY:0}];
let navIndex = 0;
function currentScrollY(){ return window.pageYOffset || document.documentElement.scrollTop || 0; }
function saveScrollToCurrent(){ if(navHistory[navIndex]) navHistory[navIndex].scrollY = currentScrollY(); }
function scrollToTop(){ window.scrollTo(0,0); }
// Restaura una posición de scroll tras re-renderizar (espera un frame a que el layout esté listo).
function restoreScroll(y){ requestAnimationFrame(()=>{ window.scrollTo(0, y||0); }); }

function navigateTo(tab, teamId){
  saveScrollToCurrent();
  activeTab = tab;
  activeTeamId = teamId || null;
  activePlayerId = null;
  activeCoachId = null;
  activeRefereeId = null;
  if(tab!=="clubes") activeClubId = null;
  pushHistory();
  render();
  scrollToTop();
}
function navigateToClub(clubId){
  saveScrollToCurrent();
  activeTab = "clubes";
  activeClubId = clubId;
  activeTeamId = null;
  activePlayerId = null;
  activeCoachId = null;
  pushHistory();
  render();
  scrollToTop();
}
function replaceCurrentClub(clubId){
  activeClubId = clubId;
  activeCoachId = null;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, coachId:null, clubId:clubId, scrollY:0};
  render();
  scrollToTop();
}
// Abre la ficha de una selección sin cambiar la pestaña activa — así "Volver" regresa
// exactamente a donde estabas (Rankings, Confederaciones, etc.), no siempre a Selecciones.
function navigateToTeam(teamId){
  saveScrollToCurrent();
  activeTeamId = teamId;
  activePlayerId = null;
  activeCoachId = null;
  pushHistory();
  render();
  scrollToTop();
}
// Abre la ficha de un jugador — igual que navigateToTeam, conserva la pestaña/equipo de origen
// para que "Volver" regrese exactamente a donde estabas (lista de Jugadores o ficha del equipo).
function navigateToPlayer(playerId){
  saveScrollToCurrent();
  activePlayerId = playerId;
  activeCoachId = null;
  pushHistory();
  render();
  scrollToTop();
}
// Abre la ficha de un entrenador — igual que navigateToPlayer, conserva la pestaña/equipo de origen
// para que "Volver" regrese exactamente a donde estabas (lista de Entrenadores o ficha del equipo).
function navigateToCoach(coachId){
  saveScrollToCurrent();
  activeCoachId = coachId;
  activePlayerId = null;
  pushHistory();
  render();
  scrollToTop();
}
// Cambia la ficha actual EN EL MISMO lugar del historial (sin apilar) — lo usan las flechas
// arriba/abajo, para que "Volver" regrese a la lista de la que veníamos, no a la ficha anterior
// que hayas recorrido con las flechas.
// Abre la ficha de un árbitro — conserva la pestaña de origen para que "Volver" regrese ahí.
function navigateToReferee(refId){
  saveScrollToCurrent();
  activeRefereeId = refId;
  activePlayerId = null;
  activeCoachId = null;
  pushHistory();
  render();
  scrollToTop();
}
function replaceCurrentReferee(refId){
  activeRefereeId = refId;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:null, coachId:null, refereeId:activeRefereeId, scrollY:0};
  render();
  scrollToTop();
}
function replaceCurrentTeam(teamId){
  activeTeamId = teamId;
  activePlayerId = null;
  activeCoachId = null;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:null, coachId:null, scrollY:0};
  render();
  scrollToTop();
}
function replaceCurrentPlayer(playerId){
  activePlayerId = playerId;
  activeCoachId = null;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, coachId:null, scrollY:0};
  render();
  scrollToTop();
}
function replaceCurrentCoach(coachId){
  activeCoachId = coachId;
  activePlayerId = null;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:null, coachId:activeCoachId, scrollY:0};
  render();
  scrollToTop();
}
// Tope de pasos guardados en el historial. Cada entrada es diminuta (tab/id/scroll), así que 50 es
// más que suficiente para sesiones largas sin acumular memoria de más. Al pasarse, se recorta lo más viejo.
const MAX_NAV_HISTORY = 50;
function pushHistory(){
  navHistory = navHistory.slice(0, navIndex+1);
  navHistory.push({tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, coachId:activeCoachId, refereeId:activeRefereeId, clubId:activeClubId, scrollY:0});
  if(navHistory.length > MAX_NAV_HISTORY){
    navHistory = navHistory.slice(navHistory.length - MAX_NAV_HISTORY);
  }
  navIndex = navHistory.length-1;
}
function navBack(){
  if(navIndex<=0) return;
  saveScrollToCurrent();
  navIndex--;
  const s = navHistory[navIndex];
  activeTab = s.tab; activeTeamId = s.teamId; activePlayerId = s.playerId||null; activeCoachId = s.coachId||null; activeRefereeId = s.refereeId||null; activeClubId = s.clubId||null;
  render();
  restoreScroll(s.scrollY);
}
function navForward(){
  if(navIndex>=navHistory.length-1) return;
  saveScrollToCurrent();
  navIndex++;
  const s = navHistory[navIndex];
  activeTab = s.tab; activeTeamId = s.teamId; activePlayerId = s.playerId||null; activeCoachId = s.coachId||null; activeRefereeId = s.refereeId||null; activeClubId = s.clubId||null;
  render();
  restoreScroll(s.scrollY);
}
function resetNavHistory(){
  navHistory = [{tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, coachId:activeCoachId, scrollY:0}];
  navIndex = 0;
}

/* ---------- Helpers de dominio ---------- */
/* ---------- Render shell ---------- */
function renderTabs(){
  const el = document.getElementById("tabs");
  el.innerHTML = TABS.map(([id,label])=>
    `<button class="tab-btn ${id===activeTab?'active':''}" data-tab="${id}">${tabLabel(id,label)}</button>`
  ).join("");
  el.querySelectorAll(".tab-btn").forEach(b=>{
    b.addEventListener("click", ()=>{ navigateTo(b.dataset.tab, null); });
  });
  setupTabsArrows();
  // La pestaña activa siempre visible (navegación fluida al cambiar de sección).
  const act = el.querySelector(".tab-btn.active");
  if(act && typeof act.scrollIntoView === "function"){
    try{ act.scrollIntoView({block:"nearest", inline:"nearest"}); }catch(e){ /* navegadores viejos */ }
  }
  updateTabsArrows();
}

// Flechas de la barra de pestañas: indican que hay más pestañas fuera de vista y desplazan la barra.
// Se muestran solo cuando hay contenido oculto de ese lado; se actualizan al hacer scroll y al
// redimensionar la ventana. Idempotente (los listeners se instalan una sola vez).
function setupTabsArrows(){
  const el = document.getElementById("tabs");
  const left = document.getElementById("tabs-arrow-left");
  const right = document.getElementById("tabs-arrow-right");
  if(!el || !left || !right || el.dataset.arrowsWired) { updateTabsArrows(); return; }
  el.dataset.arrowsWired = "1";
  const step = ()=> Math.max(160, Math.round(el.clientWidth * 0.6));
  const scrollByX = (dx)=>{ if(typeof el.scrollBy==="function") el.scrollBy({left:dx, behavior:"smooth"}); else el.scrollLeft += dx; };
  left.addEventListener("click", ()=>{ scrollByX(-step()); });
  right.addEventListener("click", ()=>{ scrollByX(step()); });
  el.addEventListener("scroll", updateTabsArrows, {passive:true});
  window.addEventListener("resize", updateTabsArrows);
}
function updateTabsArrows(){
  const el = document.getElementById("tabs");
  const left = document.getElementById("tabs-arrow-left");
  const right = document.getElementById("tabs-arrow-right");
  if(!el || !left || !right) return;
  const max = el.scrollWidth - el.clientWidth;
  left.hidden = !(max > 4 && el.scrollLeft > 4);
  right.hidden = !(max > 4 && el.scrollLeft < max - 4);
}

function renderNavButtons(){
  const el = document.getElementById("nav-buttons");
  if(!el) return;
  const canBack = navIndex>0;
  const canFwd = navIndex<navHistory.length-1;
  el.innerHTML = `
    <button class="btn ghost sm" data-action="nav-back" ${canBack?'':'disabled'} title="Atrás" style="padding:6px 11px;">←</button>
    <button class="btn ghost sm" data-action="nav-forward" ${canFwd?'':'disabled'} title="Adelante" style="padding:6px 11px;">→</button>
  `;
}
function render(){
  renderNavButtons();
  renderTabs();
  const view = document.getElementById("view");
  if(activePlayerId) view.innerHTML = renderPlayerDetail(activePlayerId);
  else if(activeCoachId) view.innerHTML = renderCoachDetail(activeCoachId);
  else if(activeRefereeId) view.innerHTML = renderRefereeDetail(activeRefereeId);
  else if(activeTeamId) view.innerHTML = renderTeamDetail(activeTeamId);
  else if(activeTab==="inicio") view.innerHTML = renderInicio();
  else if(activeTab==="evento") view.innerHTML = renderEvento();
  else if(activeTab==="selecciones") view.innerHTML = renderSelecciones();
  else if(activeTab==="confederaciones") view.innerHTML = renderConfederaciones();
  else if(activeTab==="rankings") view.innerHTML = renderRankings();
  else if(activeTab==="jugadores") view.innerHTML = renderJugadores();
  else if(activeTab==="entrenadores") view.innerHTML = renderEntrenadores();
  else if(activeTab==="arbitros") view.innerHTML = renderArbitros();
  else if(activeTab==="clubes") view.innerHTML = renderClubes();
  else if(activeTab==="estadios") view.innerHTML = renderEstadios();
  else if(activeTab==="calendario") view.innerHTML = renderCalendario();
  else if(activeTab==="patrocinadores") view.innerHTML = renderPatrocinadores();
  else if(activeTab==="medios") view.innerHTML = renderMedios();
  else if(activeTab==="editor") view.innerHTML = renderEditor();
  attachHandlers();
}
