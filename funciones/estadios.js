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
// Fila de equipo del estadio: primero el TIPO (selección o club, como en patrocinadores, sin torneo)
// y luego el nombre con la lista correspondiente. El tipo de un nombre existente se detecta solo.
function stadiumTeamRowHTML(name){
  const isTeam = !!(name && (DB.teams||[]).some(t=>normLoose(t.commonName)===normLoose(name)));
  const type = isTeam ? "team" : "club";
  return `
  <div class="stadium-team-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <select class="stadium-team-type" style="flex:0 0 110px;">
      <option value="team" ${type==="team"?"selected":""}>Selección</option>
      <option value="club" ${type==="club"?"selected":""}>Club</option>
    </select>
    <input class="stadium-team-name" list="${type==="team"?"stadium-link-teams":"club-list-stadium"}" value="${escapeHtml(name||'')}" placeholder="${type==="team"?"Nombre de la selección":"Escribe o elige un club"}" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-stadium-team-row" style="flex-shrink:0;">✕</button>
  </div>`;
}

function buildDefaultStadiums(){
  // Los 16 de la semilla son las sedes oficiales del Mundial 2026.
  return STADIUMS_SEED.map(s=>({id:uid(), worldCup:true, ...s}));
}

// Nombres de equipos que usan el estadio: los de s.teams MÁS, recíprocamente, las selecciones/clubes
// que declaran este estadio como suyo (por vínculo de estadio o campo de entrenamiento).
function stadiumUsedByNames(s){
  const names = [...(s.teams||[])];
  const seen = new Set(names.map(n=>normLoose(n)));
  const stadKeys = [s.tournamentName, s.officialName, s.nickname].map(x=>normLoose(x||"")).filter(Boolean);
  const push = (n)=>{ const k=normLoose(n); if(n && !seen.has(k)){ seen.add(k); names.push(n); } };
  const usesThis = (obj)=>{
    const arr = (obj.stadiums&&obj.stadiums.length)?obj.stadiums:(obj.stadium?[obj.stadium]:[]);
    if(arr.some(sn=>stadKeys.includes(normLoose(sn)))) return true;
    if(s.isTraining && obj.trainingGround && stadKeys.includes(normLoose(obj.trainingGround))) return true;
    return false;
  };
  (DB.teams||[]).forEach(t=>{ if(usesThis(t)) push(t.commonName); });
  (DB.clubsData||[]).forEach(c=>{ if(usesThis(c)) push(c.commonName); });
  return names;
}
// Equipos que juegan en el estadio, como etiquetas grises con logo. La(s) selección(es) van primero
// (como "Selección de X"); luego los clubes. Cada etiqueta enlaza a su selección o club.
function stadiumTeamsTagsHTML(s){
  const teams = stadiumUsedByNames(s);
  if(!teams.length) return `<span style="color:var(--muted);">—</span>`;
  const resolved = teams.map(name=>{
    const sel = (DB.teams||[]).find(t=>normLoose(t.commonName)===normLoose(name));
    if(sel) return {kind:0, name, team:sel};
    return {kind:1, name, club:getClubByName(name)};
  });
  resolved.sort((a,b)=>a.kind-b.kind); // selección(es) primero
  return resolved.map(r=> r.kind===0
    ? `<span class="badge conf tag-clickable" data-action="open-team" data-id="${r.team.id}" style="background:var(--surface-2);color:var(--muted);">${teamLogoIconHTML(r.team)||flagIconHTML(r.team)}${escapeHtml(`Selección de ${r.team.commonName}`)}</span>`
    : `<span class="badge conf tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(r.name)}" style="background:var(--surface-2);color:var(--muted);">${clubLogoIconHTML(r.club)}${escapeHtml(r.name)}</span>`
  ).join(" ");
}

// El apodo NO es un nombre aparte: ocupa el lugar del NOMBRE OFICIAL cuando está marcado como
// nombre principal. Cuando NO lo está, el apodo no desaparece: baja al subtítulo.
function stadiumNicknameIsMain(s){
  return !!(s.showNickname && (s.nickname||"").trim());
}
// Nombre que va en el espacio del "nombre oficial" (el apodo si es el principal, si no el oficial).
function stadiumOfficialSlot(s){
  return stadiumNicknameIsMain(s) ? (s.nickname||"").trim() : (s.officialName||"").trim();
}
// El otro nombre del par oficial/apodo: el que quedó libre y pasa al subtítulo.
function stadiumOtherName(s){
  return stadiumNicknameIsMain(s) ? (s.officialName||"").trim() : (s.nickname||"").trim();
}
// Nombre principal del estadio:
// 1) si es del Mundial → SIEMPRE el nombre de torneo FIFA (ni el apodo ni el oficial lo reemplazan);
// 2) si no → el nombre del espacio oficial (el apodo si es el principal; si no, el oficial).
function stadiumDisplayName(s){
  if(s.worldCup) return (s.tournamentName||"").trim() || stadiumOfficialSlot(s) || (s.nickname||"").trim() || "Estadio";
  return stadiumOfficialSlot(s) || (s.tournamentName||"").trim() || (s.nickname||"").trim() || "Estadio";
}
// Nombre(s) secundario(s), en la línea pequeña de abajo: los nombres que no se usaron como principal,
// separados por " · ". Así, si un estadio tiene apodo pero NO está marcado como principal, el apodo
// aparece igualmente debajo del nombre oficial.
function stadiumSubName(s){
  const main = stadiumDisplayName(s);
  const parts = s.worldCup
    ? [stadiumOfficialSlot(s), stadiumOtherName(s)]
    : [stadiumOtherName(s), (s.tournamentName||"").trim()];
  const out = [];
  parts.forEach(n=>{ if(n && n!==main && !out.includes(n)) out.push(n); });
  return out.join(" · ");
}
// Traduce un nombre de estadio GUARDADO (en un club, una selección o un partido) al nombre que toca
// mostrar: si ese estadio tiene un apodo marcado como principal, se muestra el apodo. Si el nombre no
// corresponde a ningún estadio del catálogo, se devuelve tal cual.
function stadiumNameToShow(name){
  const nm = (name||"").trim();
  if(!nm) return "";
  const st = (typeof findStadiumByName==="function") ? findStadiumByName(nm) : null;
  return st ? stadiumDisplayName(st) : nm;
}
// Nombre con el que un CLUB (o cualquier equipo que no sea el torneo) llama a su estadio: el oficial,
// o el apodo si es el que manda. Nunca el nombre de torneo FIFA, que solo aplica dentro del Mundial.
function stadiumOwnNameToShow(name){
  const nm = (name||"").trim();
  if(!nm) return "";
  const st = (typeof findStadiumByName==="function") ? findStadiumByName(nm) : null;
  return st ? stadiumOfficialName(st) : nm;
}
// Nombre para la lista "Todos los estadios": el del espacio oficial, o sea el apodo cuando está
// marcado como principal (ahí el apodo SÍ manda, incluso en las sedes del Mundial).
function stadiumOfficialName(s){
  return stadiumOfficialSlot(s) || (s.tournamentName||"").trim() || (s.nickname||"").trim() || "Estadio";
}
// Subtítulo para la lista "Todos los estadios": el otro nombre del par oficial/apodo — el oficial si
// arriba va el apodo, o el apodo si arriba va el oficial.
function stadiumOfficialSubName(s){
  const other = stadiumOtherName(s);
  const main = stadiumOfficialName(s);
  return (other && normLoose(other)!==normLoose(main)) ? other : "";
}
function stadiumCardHTML(s, useOfficial){
  const mainName = useOfficial ? stadiumOfficialName(s) : stadiumDisplayName(s);
  const sub = useOfficial ? stadiumOfficialSubName(s) : stadiumSubName(s);
  return `
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px;">
      <div>
        <div class="name" style="font-size:15px;">${escapeHtml(mainName)}</div>
        ${sub?`<div style="font-size:12px;color:var(--muted);">${escapeHtml(sub)}</div>`:""}
        ${(s.worldCup && !useOfficial)?`<div style="margin-top:4px;"><span class="badge conf tag-clickable" data-action="goto-evento" style="background:rgba(212,175,55,0.15);color:var(--gold,#d4af37);font-size:10px;cursor:pointer;" title="Ver el torneo">${escapeHtml(eventShortNameLabel())}</span></div>`:""}
        ${s.isTraining?`<div style="margin-top:4px;"><span class="badge conf" style="background:rgba(52,211,153,0.16);color:var(--success);font-size:10px;">Campo de entrenamiento</span></div>`:""}
      </div>
      <div style="display:flex;gap:6px;flex-shrink:0;">
        <button class="btn ghost sm" data-action="edit-stadium" data-id="${s.id}">Editar</button>
        <button class="btn danger sm" data-action="delete-stadium" data-id="${s.id}">✕</button>
      </div>
    </div>
    <div class="tag-list" style="margin-top:10px;">
      <span class="badge conf">${s.city}${s.state?", "+s.state:""}</span>
      <span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${flagIconHTML(s.country)}${escapeHtml(s.country)}</span>
      <span class="badge fifa mono">${s.capacity?s.capacity.toLocaleString("es-MX"):"—"}</span>
      <span class="badge ok">${s.turfType||"—"}</span>
    </div>
    <div class="kv"><span>${T('stadium.owner.label')}</span><span>${s.owner || "—"}</span></div>
    <div style="margin-top:8px;"><div style="font-size:11px;color:var(--muted);margin-bottom:5px;">${T('stadium.teams.label')}</div><div class="tag-list">${stadiumTeamsTagsHTML(s)}</div></div>
    ${(s.lat!=null && s.lng!=null) ? `<div class="kv"><span>${T('stadium.coords.label')}</span><span class="mono">${s.lat}, ${s.lng}</span></div>` : ""}
  </div>`;
}

function renderEstadios(){
  const sortTabs = `
  <div class="subtabs">
    <button class="subtab-btn ${stadiumsView==='separados'?'active':''}" data-action="set-stadiums-view" data-view="separados">Competencia</button>
    <button class="subtab-btn ${stadiumsView==='alfabetico'?'active':''}" data-action="set-stadiums-view" data-view="alfabetico">Alfabético</button>
  </div>`;
  const training = DB.stadiums.filter(s=>s.isTraining).slice().sort((a,b)=>stadiumOfficialName(a).localeCompare(stadiumOfficialName(b), 'es'));
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
    const allNonTraining = DB.stadiums.filter(s=>!s.isTraining).slice().sort((a,b)=>stadiumOfficialName(a).localeCompare(stadiumOfficialName(b), 'es'));
    const gridOfficial = list => `<div class="grid cols-3">${list.map(s=>stadiumCardHTML(s, true)).join("")}</div>`;
    body = `
    <div class="section-title"><h2 style="font-size:15px;">Estadios de la ${escapeHtml(eventCommonName())}</h2><span class="hint">${wc.length} sede${wc.length===1?"":"s"}</span></div>
    ${wc.length ? grid(wc) : `<div class="empty"><h3>Sin estadios del Mundial</h3></div>`}
    <div class="section-title" style="margin-top:18px;"><h2 style="font-size:15px;">Todos los estadios</h2><span class="hint">${allNonTraining.length} en total · nombres oficiales, A–Z</span></div>
    ${allNonTraining.length ? gridOfficial(allNonTraining) : `<div class="empty"><h3>Aún no hay estadios</h3><p>Se agregan desde aquí o nombrándolos en un club.</p></div>`}
    ${trainingSection}`;
  }
  return `
  <div class="section-title"><h2>${tabLabel('estadios','Estadios')}</h2><button class="btn gold sm" data-action="add-stadium">+ Agregar estadio</button></div>
  ${tabDescHTML('estadios')}
  ${sortTabs}
  ${body}
  `;
}

// Selector de artículo para un nombre de estadio. Por defecto "El" mientras no se ajuste a mano.
function stadiumArticleSelectHTML(id, current){
  const val = (current===undefined || current===null) ? "El" : current;
  return `<select id="${id}" class="st-article" style="width:120px;flex-shrink:0;">
    ${ARTICLE_OPTIONS.map(a=>`<option value="${a.value}" ${a.value===val?"selected":""}>${a.label}</option>`).join("")}
  </select>`;
}

function modalAddEditStadium(stadium){
  const isEdit = !!stadium;
  stadium = stadium || {id:null, tournamentName:"", officialName:"", nickname:"", showNickname:false, capacity:"", state:"", city:"", country:"", lat:"", lng:"", turfType:"Natural", owner:"", teams:[]};
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar estadio":"Agregar estadio"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('stadium.officialName.label')}
            <div style="display:flex;align-items:center;gap:8px;">
              ${stadiumArticleSelectHTML("f-st-oname-article", stadium.articleOfficial)}
              <input id="f-st-oname" value="${escapeHtml(stadium.officialName||'')}" placeholder="${T('stadium.officialName.placeholder')}" style="flex:1;">
            </div>
          </div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('stadium.tournamentName.label')}
            <div style="display:flex;align-items:center;gap:8px;">
              ${stadiumArticleSelectHTML("f-st-tname-article", stadium.articleTournament)}
              <input id="f-st-tname" value="${escapeHtml(stadium.tournamentName||'')}" placeholder="${T('stadium.tournamentName.placeholder')}" style="flex:1;">
            </div>
          </div>

          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Apodo
            <div style="display:flex;align-items:center;gap:10px;">
              ${stadiumArticleSelectHTML("f-st-nickname-article", stadium.articleNickname)}
              <input id="f-st-nickname" value="${escapeHtml(stadium.nickname||'')}" placeholder="Ej: La Bombonera" style="flex:1;">
              <label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--muted);font-weight:600;white-space:nowrap;cursor:pointer;">
                <input type="checkbox" id="f-st-shownick" ${stadium.showNickname?'checked':''} style="width:auto;margin:0;">
                Es el nombre principal
              </label>
            </div>
            <div style="font-size:10px;color:var(--muted);font-weight:400;line-height:1.5;">Si está marcado, el apodo pasa a ser el nombre principal y el oficial queda pequeño debajo. Si no lo marcas, el apodo es el que aparece debajo del nombre oficial.</div>
          </div>

          <label class="field">${T('stadium.capacity.label')}<input id="f-st-capacity" type="number" min="0" value="${stadium.capacity!=null?stadium.capacity:''}" placeholder="${T('stadium.capacity.placeholder')}"></label>
          <label class="field">${T('stadium.turfType.label')}
            <select id="f-st-turf">${["Natural","Híbrido","Artificial"].map(t=>`<option ${t===stadium.turfType?"selected":""}>${t}</option>`).join("")}</select>
          </label>

          <label class="field">${T('stadium.city.label')}<input id="f-st-city" list="city-list" value="${stadium.city||''}">
            <datalist id="city-list">${datalistOptions(allCities())}</datalist></label>
          <label class="field">${T('stadium.state.label')}<input id="f-st-state" value="${stadium.state||''}"></label>
          <label class="field" style="grid-column:1/-1;">${T('stadium.country.label')}
            <input id="f-st-country" list="country-name-list-stadium" value="${escapeHtml(stadium.country||'')}" placeholder="Escribe o elige un país">
            <datalist id="country-name-list-stadium">${datalistOptions((DB.countries||[]).slice().sort((a,b)=>a.commonName.localeCompare(b.commonName,'es')).map(c=>c.commonName))}</datalist>
          </label>

          <label class="field" style="grid-column:1/-1;">${T('stadium.coords.label')}
            <input id="f-st-coords" value="${(stadium.lat!=null && stadium.lng!=null) ? stadium.lat+', '+stadium.lng : ''}" placeholder="${T('stadium.coords.placeholder')}">
          </label>

          <label class="field" style="grid-column:1/-1;">${T('stadium.owner.label')}
            <input id="f-st-owner" list="club-list-stadium" value="${stadium.owner||''}" placeholder="${T('stadium.owner.placeholder')}">
            <datalist id="club-list-stadium">${datalistOptions(DB.clubs.slice().sort((a,b)=>a.localeCompare(b,'es')))}</datalist>
            <datalist id="stadium-link-teams">${datalistOptions(DB.teams.slice().sort((a,b)=>a.commonName.localeCompare(b.commonName,'es')).map(t=>t.commonName))}</datalist>
          </label>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('stadium.teams.label')}
            <div id="stadium-team-rows">
              ${(()=>{ const names = stadium.id ? stadiumUsedByNames(stadium) : (stadium.teams||[]); return (names.length?names:[""]).map(n=>stadiumTeamRowHTML(n)).join(""); })()}
            </div>
            <div>
              <button type="button" class="btn ghost sm" data-action="add-stadium-team-row">+ Agregar equipo</button>
            </div>
          </div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:row;align-items:center;gap:8px;font-size:12px;color:var(--muted);font-weight:600;">
            <input type="checkbox" id="f-st-wc" ${stadium.worldCup?'checked':''} style="width:auto;flex-shrink:0;margin:0;">
            <span>Estadio de la ${escapeHtml(eventCommonName())}</span>
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

