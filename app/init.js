/* =========================================================
   COPA MANAGER 2026 — app/init.js
   Núcleo — arranque y cableado global. Contiene: attachHandlers (cableado por render:
   delega los clics de #view en handleAction, rellena previews de kits y engancha los
   inputs de filtro de jugadores, clubes y editor), el listener global de click que
   despacha los data-action de modales y navegación a handleAction, e init (IIFE de
   arranque: loadDB, loadHistory, primer render, buildGlobalSearch, badge de versión).
   Extracción mecánica: texto y orden idénticos al original. Script CLÁSICO (no module).
   IMPORTANTE: se carga como ÚLTIMO script, DESPUÉS del <script> inline, porque init()
   se autoinvoca y depende de SEED_TEAMS, renderInicio, los helpers de formulario y el
   estado global que permanecen en el inline. Usa en tiempo de ejecución loadDB y
   persist (almacenamiento), loadHistory (historial), render y navegación y estado
   activo (router), handleAction (acciones), renderKitPreviews (ui-kits),
   buildGlobalSearch (busqueda-global) y el estado de dominio del inline (playerFilter,
   clubFilter, bulkImportTeamId, APP_VERSION). Los ~29 listeners de dominio (drag-drop
   de kits, refresco de combos, nacionalidad) NO forman parte de este módulo y
   permanecen en el inline.
   ========================================================= */

function attachHandlers(){
  const view = document.getElementById("view");
  view.onclick = (e)=>{
    const el = e.target.closest("[data-action]");
    if(!el) return;
    handleAction(el.dataset.action, el);
  };
  renderKitPreviews();

  if(activeTab==="jugadores"){
    const q = document.getElementById("player-q");
    const tf = document.getElementById("player-team-filter");
    const pf = document.getElementById("player-pos-filter");
    if(q) q.addEventListener("input", ()=>{ playerFilter.q=q.value; render(); setTimeout(()=>{ const el=document.getElementById("player-q"); if(el){el.focus(); el.selectionStart=el.selectionEnd=el.value.length;} },0); });
    if(tf) tf.addEventListener("change", ()=>{ playerFilter.team=tf.value; render(); });
    if(pf) pf.addEventListener("change", ()=>{ playerFilter.pos=pf.value; render(); });
  }
  if(activeTab==="clubes" && !activeClubId){
    const q = document.getElementById("club-q");
    const cf = document.getElementById("club-country-filter");
    const lf = document.getElementById("club-league-filter");
    if(q) q.addEventListener("input", ()=>{ clubFilter.q=q.value; render(); setTimeout(()=>{ const el=document.getElementById("club-q"); if(el){el.focus(); el.selectionStart=el.selectionEnd=el.value.length;} },0); });
    if(cf) cf.addEventListener("change", ()=>{ clubFilter.country=cf.value; render(); });
    if(lf) lf.addEventListener("change", ()=>{ clubFilter.league=lf.value; render(); });
  }
  if(activeTab==="editor"){
    const bts = document.getElementById("bulk-team-select");
    if(bts) bts.addEventListener("change", ()=>{ bulkImportTeamId = bts.value; });
    const search = document.getElementById("ui-text-search");
    if(search){
      search.addEventListener("input", ()=>{
        const q = search.value.trim().toLowerCase();
        document.querySelectorAll("#ui-text-groups details").forEach(det=>{
          let anyVisible = false;
          det.querySelectorAll(".ui-text-row").forEach(row=>{
            const match = !q || (row.dataset.search||"").includes(q);
            row.style.display = match ? "" : "none";
            if(match) anyVisible = true;
          });
          det.style.display = anyVisible ? "" : "none";
          if(q) det.open = true;
        });
      });
    }
    const countrySearch = document.getElementById("country-search");
    if(countrySearch){
      countrySearch.addEventListener("input", ()=>{
        const q = countrySearch.value.trim().toLowerCase();
        document.querySelectorAll("#country-tbody tr").forEach(row=>{
          const match = !q || (row.dataset.search||"").includes(q);
          row.style.display = match ? "" : "none";
        });
      });
    }
  }
}

document.addEventListener("click", (e)=>{
  const el = e.target.closest("[data-action]");
  if(!el) return;
  if(el.closest("#modal-root") || el.closest("#nav-buttons")) handleAction(el.dataset.action, el);
});

/* ---------- Init ---------- */
(async function init(){
  await loadDB();
  await loadHistory();
  render();
  buildGlobalSearch();
  const badge = document.getElementById("season-badge");
  if(badge) badge.textContent = "WIP · JULIO 2026 · VER " + APP_VERSION;
})();
