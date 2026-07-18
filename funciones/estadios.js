/* =========================================================
   COPA MANAGER 2026 — funciones/estadios.js
   Catálogo de estadios (sedes del Mundial y de clubes): constructor
   por defecto, unión "por nombre" (findStadiumByName / stadiumLinkName
   / ensureStadiumFromName), helpers de fila, nombres para mostrar,
   tarjeta, vista de la pestaña y modal. Extracción mecánica: texto y
   orden idénticos al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (STADIUMS_SEED), core/utilidades.js (normLoose, newId, uid, escapeHtml)
   y app/textos-ui.js (T, tabLabel, tabDescHTML), y ANTES del <script>
   inline. Usa en tiempo de ejecución DB, el estado stadiumsView (que
   permanece en el inline) y openModal. No llama a otros dominios; son
   clubes/calendario/selecciones los que dependen de estadios.
   ========================================================= */

// Busca un estadio por cualquiera de sus nombres (torneo FIFA, oficial o apodo), sin
// distinguir mayúsculas ni acentos.
function findStadiumByName(name){
  const key = normLoose((name||"").trim());
  if(!key) return null;
  return (DB.stadiums||[]).find(s=> normLoose(s.tournamentName||"")===key || normLoose(s.officialName||"")===key || normLoose(s.nickname||"")===key) || null;
}
// Nombre estable con el que los clubes referencian a un estadio (oficial > torneo FIFA > apodo).
function stadiumLinkName(s){
  return ((s.officialName||"").trim() || (s.tournamentName||"").trim() || (s.nickname||"").trim());
}
// Si un club nombra un estadio que no está en el catálogo, lo crea automáticamente como
// "Otro estadio" (worldCup:false) y agrega el club a "Equipos que juegan ahí".
// OJO: no asigna dueño — ser local no implica ser propietario.
function ensureStadiumFromName(name, clubName, country, city, isTraining){
  const nm = (name||"").trim();
  if(!nm) return null;
  let st = findStadiumByName(nm);
  if(!st){
    st = { id:newId("st"), tournamentName:"", officialName:nm.slice(0,80), nickname:"", showNickname:false, capacity:null, turfType:"Natural",
           city:(city||"").trim(), state:"", country:(country||"").trim(), lat:null, lng:null, owner:"", teams:[], worldCup:false, isTraining:!!isTraining };
    if(!DB.stadiums) DB.stadiums = [];
    DB.stadiums.push(st);
  } else {
    // Si el estadio/instalación ya existía pero sin país o sin ciudad, se completan con los indicados
    // (ej. los del club o la selección). Nunca se sobrescribe un dato puesto a mano.
    if(country && !(st.country||"").trim()) st.country = country.trim();
    if(city && !(st.city||"").trim()) st.city = city.trim();
  }
  if(clubName){
    if(!Array.isArray(st.teams)) st.teams = [];
    if(!st.teams.some(t=>normLoose(t)===normLoose(clubName))) st.teams.push(clubName);
  }
  return st;
}
// Fila editable de "Estadios" en el modal de club — con flechas para reordenar por importancia
// (el primero es el estadio principal del club).
function clubStadiumRowHTML(name){
  return `
  <div class="club-stadium-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <div style="display:flex;flex-direction:column;gap:2px;flex-shrink:0;">
      <button type="button" class="btn ghost sm" data-action="move-club-stadium-row" data-dir="up" style="padding:2px 7px;line-height:1;">↑</button>
      <button type="button" class="btn ghost sm" data-action="move-club-stadium-row" data-dir="down" style="padding:2px 7px;line-height:1;">↓</button>
    </div>
    <input class="club-stadium-name" list="stadium-list-club" value="${escapeHtml(name||'')}" placeholder="Escribe o elige un estadio" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-club-stadium-row" style="flex-shrink:0;">✕</button>
  </div>`;
}
// Fila editable de "Equipos que juegan ahí" en el modal de estadio — misma mecánica que los apodos:
// una fila por equipo, con sugerencias de clubes existentes y botón para quitarla.
function stadiumTeamRowHTML(name){
  return `
  <div class="stadium-team-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <input class="stadium-team-name" list="club-list-stadium" value="${escapeHtml(name||'')}" placeholder="Escribe o elige un club" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-stadium-team-row" style="flex-shrink:0;">✕</button>
  </div>`;
}

function buildDefaultStadiums(){
  // Los 16 de la semilla son las sedes oficiales del Mundial 2026.
  return STADIUMS_SEED.map(s=>({id:uid(), worldCup:true, ...s}));
}

// Nombre principal del estadio según sus datos:
// 1) si es del Mundial 2026 → SIEMPRE el nombre de torneo FIFA (el apodo nunca lo reemplaza);
// 2) si tiene apodo y "Mostrar apodo" activo → el apodo (ej. "La Bombonera");
// 3) si no → el nombre oficial (la mayoría de los "otros" estadios ni tienen nombre FIFA).
function stadiumDisplayName(s){
  if(s.worldCup) return (s.tournamentName||"").trim() || (s.officialName||"").trim() || "Estadio";
  if(s.showNickname && (s.nickname||"").trim()) return s.nickname.trim();
  return (s.officialName||"").trim() || (s.tournamentName||"").trim() || "Estadio";
}
// Nombre secundario (pequeño, debajo). En estadios del Mundial con apodo activo se muestran
// el nombre oficial y el apodo juntos, separados por " · ". En los demás, el otro nombre
// que no se usó como principal, dando prioridad al oficial.
function stadiumSubName(s){
  const main = stadiumDisplayName(s);
  const nick = (s.showNickname && (s.nickname||"").trim()) ? s.nickname.trim() : "";
  if(s.worldCup){
    const parts = [(s.officialName||"").trim(), nick].filter(n=>n && n!==main);
    return parts.join(" · ");
  }
  const cand = [s.officialName, s.tournamentName].map(x=>(x||"").trim()).filter(Boolean);
  return cand.find(n=>n!==main) || "";
}
function stadiumCardHTML(s){
  const sub = stadiumSubName(s);
  return `
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
      <div>
        <div class="name" style="font-size:15px;">${escapeHtml(stadiumDisplayName(s))}</div>
        ${sub?`<div style="font-size:12px;color:var(--muted);">${escapeHtml(sub)}</div>`:""}
        ${s.worldCup?`<div style="margin-top:4px;"><span class="badge conf" style="background:rgba(212,175,55,0.15);color:var(--gold,#d4af37);font-size:10px;">Mundial 2026</span></div>`:""}
        ${s.isTraining?`<div style="margin-top:4px;"><span class="badge conf" style="background:rgba(52,211,153,0.16);color:var(--success);font-size:10px;">Campo de entrenamiento</span></div>`:""}
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn ghost sm" data-action="edit-stadium" data-id="${s.id}">Editar</button>
        <button class="btn danger sm" data-action="delete-stadium" data-id="${s.id}">✕</button>
      </div>
    </div>
    <div class="tag-list" style="margin-top:10px;">
      <span class="badge conf">${s.city}${s.state?", "+s.state:""}</span>
      <span class="badge conf">${s.country}</span>
      <span class="badge fifa mono">${s.capacity?s.capacity.toLocaleString("es-MX"):"—"}</span>
      <span class="badge ok">${s.turfType||"—"}</span>
    </div>
    <div class="kv"><span>${T('stadium.owner.label')}</span><span>${s.owner || "—"}</span></div>
    <div class="kv"><span>${T('stadium.teams.label')}</span><span>${(s.teams&&s.teams.length)?s.teams.join(", "):"—"}</span></div>
    ${(s.lat!=null && s.lng!=null) ? `<div class="kv"><span>${T('stadium.coords.label')}</span><span class="mono">${s.lat}, ${s.lng}</span></div>` : ""}
  </div>`;
}

function renderEstadios(){
  const sortTabs = `
  <div class="subtabs">
    <button class="subtab-btn ${stadiumsView==='separados'?'active':''}" data-action="set-stadiums-view" data-view="separados">Competencia</button>
    <button class="subtab-btn ${stadiumsView==='alfabetico'?'active':''}" data-action="set-stadiums-view" data-view="alfabetico">Alfabético</button>
  </div>`;
  const training = DB.stadiums.filter(s=>s.isTraining);
  const wc = DB.stadiums.filter(s=>s.worldCup && !s.isTraining);
  const others = DB.stadiums.filter(s=>!s.worldCup && !s.isTraining);
  const grid = list => `<div class="grid cols-3">${list.map(s=>stadiumCardHTML(s)).join("")}</div>`;
  const trainingSection = `
    <div class="section-title" style="margin-top:18px;"><h2 style="font-size:15px;">Instalaciones de entrenamiento</h2><span class="hint">${training.length} instalaci${training.length===1?"ón":"ones"} · campos de clubes y selecciones</span></div>
    ${training.length ? grid(training) : `<div class="empty"><h3>Aún no hay instalaciones de entrenamiento</h3><p>Se agregan aquí (marcando «Es campo de entrenamiento») o escribiendo el campo de entrenamiento de un club o selección.</p></div>`}`;
  let body;
  if(stadiumsView==="alfabetico"){
    const all = DB.stadiums.filter(s=>!s.isTraining).slice().sort((a,b)=>stadiumDisplayName(a).localeCompare(stadiumDisplayName(b), 'es'));
    body = `${all.length ? `
    <div class="group-block">
      <h3><span class="tag">A–Z</span> ${all.length} estadio${all.length===1?"":"s"}</h3>
      ${grid(all)}
    </div>` : `<div class="empty"><h3>Sin estadios cargados</h3></div>`}
    ${trainingSection}`;
  } else {
    body = `
    <div class="section-title"><h2 style="font-size:15px;">Estadios de la Copa del Mundo 2026</h2><span class="hint">${wc.length} sede${wc.length===1?"":"s"}</span></div>
    ${wc.length ? grid(wc) : `<div class="empty"><h3>Sin estadios del Mundial</h3></div>`}
    <div class="section-title" style="margin-top:18px;"><h2 style="font-size:15px;">Otros estadios</h2><span class="hint">Los de los clubes y los creados a mano</span></div>
    ${others.length ? grid(others) : `<div class="empty"><h3>Aún no hay otros estadios</h3><p>Se agregan desde aquí o nombrándolos en un club.</p></div>`}
    ${trainingSection}`;
  }
  return `
  <div class="section-title"><h2>${tabLabel('estadios','Estadios')}</h2><button class="btn gold sm" data-action="add-stadium">+ Agregar estadio</button></div>
  ${tabDescHTML('estadios')}
  ${sortTabs}
  ${body}
  `;
}

function modalAddEditStadium(stadium){
  const isEdit = !!stadium;
  stadium = stadium || {id:null, tournamentName:"", officialName:"", nickname:"", showNickname:false, capacity:"", state:"", city:"", country:"", lat:"", lng:"", turfType:"Natural", owner:"", teams:[]};
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar estadio":"Agregar estadio"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('stadium.officialName.label')}<input id="f-st-oname" value="${stadium.officialName||''}" placeholder="${T('stadium.officialName.placeholder')}"></label>
          <label class="field" style="grid-column:1/-1;">${T('stadium.tournamentName.label')}<input id="f-st-tname" value="${stadium.tournamentName||''}" placeholder="${T('stadium.tournamentName.placeholder')}"></label>

          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Apodo
            <div style="display:flex;align-items:center;gap:10px;">
              <input id="f-st-nickname" value="${escapeHtml(stadium.nickname||'')}" placeholder="Ej: La Bombonera" style="flex:1;">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;cursor:pointer;">
                <input type="checkbox" id="f-st-shownick" ${stadium.showNickname?'checked':''} style="width:auto;margin:0;">
                Mostrar apodo
              </label>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:400;line-height:1.5;">Si está marcado, el apodo se muestra como el nombre principal en todos lados, con el nombre oficial pequeño debajo.</div>
          </div>

          <label class="field">${T('stadium.capacity.label')}<input id="f-st-capacity" type="number" min="0" value="${stadium.capacity!=null?stadium.capacity:''}" placeholder="${T('stadium.capacity.placeholder')}"></label>
          <label class="field">${T('stadium.turfType.label')}
            <select id="f-st-turf">${["Natural","Híbrido","Artificial"].map(t=>`<option ${t===stadium.turfType?"selected":""}>${t}</option>`).join("")}</select>
          </label>

          <label class="field">${T('stadium.city.label')}<input id="f-st-city" value="${stadium.city||''}"></label>
          <label class="field">${T('stadium.state.label')}<input id="f-st-state" value="${stadium.state||''}"></label>
          <label class="field" style="grid-column:1/-1;">${T('stadium.country.label')}
            <input id="f-st-country" list="country-name-list-stadium" value="${escapeHtml(stadium.country||'')}" placeholder="Escribe o elige un país">
            <datalist id="country-name-list-stadium">${(DB.countries||[]).slice().sort((a,b)=>a.commonName.localeCompare(b.commonName,'es')).map(c=>`<option value="${escapeHtml(c.commonName)}">`).join("")}</datalist>
          </label>

          <label class="field" style="grid-column:1/-1;">${T('stadium.coords.label')}
            <input id="f-st-coords" value="${(stadium.lat!=null && stadium.lng!=null) ? stadium.lat+', '+stadium.lng : ''}" placeholder="${T('stadium.coords.placeholder')}">
          </label>

          <label class="field" style="grid-column:1/-1;">${T('stadium.owner.label')}
            <input id="f-st-owner" list="club-list-stadium" value="${stadium.owner||''}" placeholder="${T('stadium.owner.placeholder')}">
            <datalist id="club-list-stadium">${DB.clubs.slice().sort((a,b)=>a.localeCompare(b,'es')).map(c=>`<option value="${c}">`).join("")}</datalist>
          </label>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('stadium.teams.label')}
            <div id="stadium-team-rows">
              ${((stadium.teams && stadium.teams.length) ? stadium.teams : [""]).map(n=>stadiumTeamRowHTML(n)).join("")}
            </div>
            <div>
              <button type="button" class="btn ghost sm" data-action="add-stadium-team-row">+ Agregar equipo</button>
            </div>
          </div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:row;align-items:center;gap:8px;font-size:12px;color:var(--muted);font-weight:600;">
            <input type="checkbox" id="f-st-wc" ${stadium.worldCup?'checked':''} style="width:auto;flex-shrink:0;margin:0;">
            <span>Estadio de la Copa del Mundo 2026</span>
          </div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:row;align-items:center;gap:8px;font-size:12px;color:var(--muted);font-weight:600;">
            <input type="checkbox" id="f-st-training" ${stadium.isTraining?'checked':''} style="width:auto;flex-shrink:0;margin:0;">
            <span>Es campo de entrenamiento</span>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-stadium" data-id="${stadium.id||''}">Guardar</button>
      </div>
    </div>
  `);
}

