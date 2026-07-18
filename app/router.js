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
  pushHistory();
  render();
  scrollToTop();
}
function replaceCurrentClub(clubId){
  activeClubId = clubId;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, clubId:clubId, scrollY:0};
  render();
  scrollToTop();
}
// Abre la ficha de una selección sin cambiar la pestaña activa — así "Volver" regresa
// exactamente a donde estabas (Rankings, Confederaciones, etc.), no siempre a Selecciones.
function navigateToTeam(teamId){
  saveScrollToCurrent();
  activeTeamId = teamId;
  activePlayerId = null;
  pushHistory();
  render();
  scrollToTop();
}
// Abre la ficha de un jugador — igual que navigateToTeam, conserva la pestaña/equipo de origen
// para que "Volver" regrese exactamente a donde estabas (lista de Jugadores o ficha del equipo).
function navigateToPlayer(playerId){
  saveScrollToCurrent();
  activePlayerId = playerId;
  pushHistory();
  render();
  scrollToTop();
}
// Cambia la ficha actual EN EL MISMO lugar del historial (sin apilar) — lo usan las flechas
// arriba/abajo, para que "Volver" regrese a la lista de la que veníamos, no a la ficha anterior
// que hayas recorrido con las flechas.
function replaceCurrentTeam(teamId){
  activeTeamId = teamId;
  activePlayerId = null;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:null, scrollY:0};
  render();
  scrollToTop();
}
function replaceCurrentPlayer(playerId){
  activePlayerId = playerId;
  navHistory[navIndex] = {tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, scrollY:0};
  render();
  scrollToTop();
}
// Tope de pasos guardados en el historial. Cada entrada es diminuta (tab/id/scroll), así que 50 es
// más que suficiente para sesiones largas sin acumular memoria de más. Al pasarse, se recorta lo más viejo.
const MAX_NAV_HISTORY = 50;
function pushHistory(){
  navHistory = navHistory.slice(0, navIndex+1);
  navHistory.push({tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, clubId:activeClubId, scrollY:0});
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
  activeTab = s.tab; activeTeamId = s.teamId; activePlayerId = s.playerId||null; activeClubId = s.clubId||null;
  render();
  restoreScroll(s.scrollY);
}
function navForward(){
  if(navIndex>=navHistory.length-1) return;
  saveScrollToCurrent();
  navIndex++;
  const s = navHistory[navIndex];
  activeTab = s.tab; activeTeamId = s.teamId; activePlayerId = s.playerId||null; activeClubId = s.clubId||null;
  render();
  restoreScroll(s.scrollY);
}
function resetNavHistory(){
  navHistory = [{tab:activeTab, teamId:activeTeamId, playerId:activePlayerId, scrollY:0}];
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
  else if(activeTeamId) view.innerHTML = renderTeamDetail(activeTeamId);
  else if(activeTab==="inicio") view.innerHTML = renderInicio();
  else if(activeTab==="evento") view.innerHTML = renderEvento();
  else if(activeTab==="selecciones") view.innerHTML = renderSelecciones();
  else if(activeTab==="confederaciones") view.innerHTML = renderConfederaciones();
  else if(activeTab==="rankings") view.innerHTML = renderRankings();
  else if(activeTab==="jugadores") view.innerHTML = renderJugadores();
  else if(activeTab==="clubes") view.innerHTML = renderClubes();
  else if(activeTab==="estadios") view.innerHTML = renderEstadios();
  else if(activeTab==="calendario") view.innerHTML = renderCalendario();
  else if(activeTab==="patrocinadores") view.innerHTML = renderPatrocinadores();
  else if(activeTab==="medios") view.innerHTML = renderMedios();
  else if(activeTab==="editor") view.innerHTML = renderEditor();
  attachHandlers();
}
