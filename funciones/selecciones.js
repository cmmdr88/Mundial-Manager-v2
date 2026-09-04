/* =========================================================
   COPA MANAGER 2026 — funciones/selecciones.js
   Selecciones nacionales: métricas de equipo, escudo/tarjeta, grupos,
   ordenación, listado, ficha y modal. Extracción mecánica: texto y orden
   idénticos al original (5 zonas; el estado seleccionesSort/squadSort permanece
   en el inline). Script CLÁSICO (no module). Cargar DESPUÉS de core/utilidades.js
   (isRegistered, avgRating, escapeHtml, compareGeneric, initials), app/textos-ui.js
   (tabLabel, tabDescHTML), funciones/confederaciones.js (confBadge, fifaBadge),
   app/modales.js (openModal, imageUploadField, detailNavHTML) y funciones/jugadores.js
   (playerDisplayName, playerValue, playerType, playerAgeText), y ANTES del <script>
   inline. DECISIÓN ARQUITECTÓNICA: getTeam NO forma parte de este módulo; es un
   accesor de datos reservado para el futuro modelo-db y permanece en el inline (se
   usa aquí en tiempo de ejecución). Relación mutua con jugadores en tiempo de render
   (sin ciclo de carga).
   ========================================================= */

// Calcula los 4 rubros de una selección promediando el rating de TODOS los jugadores inscritos de cada
// grupo (no solo los mejores). Solo cuentan los jugadores inscritos: los que tienen dorsal asignado
// (número distinto de 0 / no vacío).
//  OVR: promedio de todos los jugadores inscritos.
//  ATT: promedio de todos los delanteros (FW) inscritos.
//  MID: promedio de todos los mediocampistas (MF) inscritos.
//  DEF: promedio de todos los defensas (DF) y porteros (GK) inscritos.
function teamRatings(team){
  const reg = (team.players||[]).filter(isRegistered);
  const overall = avgRating(reg);
  const ataque  = avgRating(reg.filter(p=>p.pos==="FW"));
  const medio   = avgRating(reg.filter(p=>p.pos==="MF"));
  const defensa = avgRating(reg.filter(p=>p.pos==="DF" || p.pos==="GK"));
  return { overall, defensa, medio, ataque };
}
function teamRating(team){
  if(!team.players || team.players.length===0) return 60;
  const r = teamRatings(team);
  return r.overall!=null ? r.overall : 60;
}
// Bloque visual del rating para perfiles de selección y club: el OVERALL grande arriba con la etiqueta
// "RATING" debajo, y luego ATT / MID / DEF en columna, cada rubro con su etiqueta a la izquierda y el
// número (en índigo) alineado a la derecha en su propia columna.
function ratingBlockHTML(r){
  const num = v => v!=null ? String(v) : "-";
  const bigNum = v => v!=null ? String(v) : "-";
  const row = (label, v) => `<div style="font-size:12px;color:var(--muted);letter-spacing:.03em;line-height:22px;text-align:center;">${label}</div><div style="font-size:15px;font-weight:700;color:var(--indigo);text-align:center;line-height:22px;">${num(v)}</div>`;
  return `
  <div style="align-self:center;text-align:center;min-width:96px;">
    <div style="font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:800;line-height:1;color:var(--indigo);">${bigNum(r.overall)}</div>
    <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;margin-bottom:10px;">Rating</div>
    <div style="display:grid;grid-template-columns:auto auto;gap:3px 18px;font-family:'JetBrains Mono',monospace;justify-content:center;align-items:center;">
      ${row("ATT", r.ataque)}
      ${row("MID", r.medio)}
      ${row("DEF", r.defensa)}
    </div>
  </div>`;
}
// Una plantilla se considera COMPLETA con la convocatoria máxima del Mundial 2026 (26 jugadores).
// Con 26 o más → "ok" (verde); con menos → "incomplete" (rojo).
function squadStatus(team){
  const maxSize = (DB && DB.event && DB.event.squadMax) || SQUAD_COMPLETE_SIZE;
  return team.players.length>=maxSize ? "ok" : "incomplete";
}
function groupsList(){
  const set = [...new Set(DB.teams.map(t=>t.group).filter(Boolean))];
  return set.sort();
}
function teamsInGroup(g){ return DB.teams.filter(t=>t.group===g); }
// Posición oficial (A1, A2, A3, A4...) de una selección dentro de su grupo, según el sorteo
// del Mundial 2026 (WC26_GROUPS). Devuelve 0..3 para las oficiales; un valor alto para las demás,
// que se ordenan alfabéticamente al final. Contempla alias (Chequia / RD del Congo).
function groupSlotIndex(team){
  if(!team || !team.group || !/^[A-L]$/.test(team.group) || typeof WC26_GROUPS==="undefined") return 99;
  const ALIAS = {"chequia":"republica checa","republica checa":"chequia","rd del congo":"republica democratica del congo","rd congo":"republica democratica del congo","dr congo":"republica democratica del congo","republica democratica del congo":"rd congo"};
  const names = WC26_GROUPS[team.group] || [];
  const tn = normalizeName(team.commonName);
  let idx = names.findIndex(n=>normalizeName(n)===tn);
  if(idx<0 && ALIAS[tn]) idx = names.findIndex(n=>normalizeName(n)===ALIAS[tn]);
  return idx<0 ? 99 : idx;
}
// Selecciones de un grupo en el orden correcto A1→A4 (posición de sorteo), y las no oficiales
// al final por orden alfabético.
function teamsInGroupOrdered(g){
  return teamsInGroup(g).slice().sort((a,b)=>
    groupSlotIndex(a)-groupSlotIndex(b) || a.commonName.localeCompare(b.commonName,'es')
  );
}

function crestHTML(t, extraStyle){
  if(t.logoImg){
    return `<div class="crest-mini has-img" style="${extraStyle||''}"><img src="${t.logoImg}" alt="${t.commonName}"></div>`;
  }
  // Sin logo propio: escudo genérico recoloreado con los colores de la selección (ver defaultCrestBoxHTML).
  return defaultCrestBoxHTML(t, extraStyle);
}

function teamCardHTML(t){
  const rating = teamRating(t);
  const status = squadStatus(t);
  return `
  <div class="card team-card" data-action="open-team" data-id="${t.id}">
    <div class="team-card-top">
      ${crestHTML(t, "width:50px;height:50px;")}
      <div class="meta">
        <div class="name">${t.commonName} ${fifaBadge(t)}</div>
        <div class="sub">
          ${flagBadgeHTML(t)}
          ${confBadge(t.conf)}
          ${t.host?`<span class="badge host">${T('general.badge.host')}</span>`:''}
          <span class="badge ${status}">${t.players.length} jugadores</span>
        </div>
      </div>
    </div>
    <div class="team-card-bottom">
      <div class="kit-swatch" title="Uniformes de jugador">
        ${(t.kits||[]).filter(k=>k.category==="jugador").slice(0,3).map(k=>`<span class="kit-dot" style="background:${k.color1};"></span>`).join("")}
      </div>
      <div class="rating">${rating}</div>
    </div>
  </div>`;
}

// Devuelve TODAS las selecciones en el mismo orden en que se muestran en la pantalla principal.
// Se usa tanto para renderizar como para las flechas arriba/abajo de la ficha de selección,
// así el recorrido con las flechas siempre coincide con lo que ves en la lista.
function orderedTeamsForSelecciones(){
  const key = (seleccionesSort && seleccionesSort.key) || "name";
  const dir = (seleccionesSort && seleccionesSort.dir) || "asc";
  const teams = DB.teams.filter(t=>!t.hidden);   // oculta el equipo de agentes libres
  if(key==="rating"){
    return teams.slice().sort((a,b)=>
      compareGeneric(teamRating(a), teamRating(b), "number", dir)
      || a.commonName.localeCompare(b.commonName,'es')  // desempate estable por nombre
    );
  }
  return teams.slice().sort((a,b)=>compareGeneric(a.commonName,b.commonName,"string",dir));
}

// Lista de selecciones para la NAVEGACIÓN con flechas en la ficha, según de dónde se abrió:
// - desde la pestaña Copa Mundial (evento): solo las participantes (grupo A–L), en orden de
//   sorteo por grupo (A1→A2→A3→A4→B1→…);
// - desde cualquier otra pantalla: todas, en el orden de la lista de Selecciones.
function orderedTeamsForNav(){
  if(activeTab === "evento"){
    return DB.teams
      .filter(t=>/^[A-L]$/.test(t.group||""))
      .sort((a,b)=>
        (a.group||"").localeCompare(b.group||"") ||
        groupSlotIndex(a)-groupSlotIndex(b) ||
        a.commonName.localeCompare(b.commonName,'es')
      );
  }
  return orderedTeamsForSelecciones();
}

function renderSelecciones(){
  const all = orderedTeamsForSelecciones();
  const key = (seleccionesSort && seleccionesSort.key) || "name";
  const dir = (seleccionesSort && seleccionesSort.dir) || "asc";
  const chip = (k, label) => {
    const active = key===k;
    const arrow = active ? (dir==="asc" ? "▲" : "▼") : "";
    return `<button class="sort-chip ${active?'active':''}" data-action="sort-selecciones" data-key="${k}"><span>${label}</span>${arrow?`<span class="arrow">${arrow}</span>`:""}</button>`;
  };
  const tagText = key==="rating"
    ? (dir==="asc" ? "Rating ↑" : "Rating ↓")
    : (dir==="asc" ? "A–Z" : "Z–A");
  return `
  <div class="section-title"><h2>${tabLabel('selecciones','Selecciones')}</h2><button class="btn gold sm" data-action="add-team">+ Agregar selección</button></div>
  ${tabDescHTML('selecciones')}
  <div class="squad-sortbar">
    <span class="squad-sortbar-label">Ordenar</span>
    ${chip("name","Nombre")}
    ${chip("rating","Rating")}
  </div>
  <div class="group-block">
    <h3><span class="tag">${tagText}</span> ${all.length} selecciones</h3>
    <div class="grid cols-4">
      ${all.map(t=>teamCardHTML(t)).join("") || `<div class="empty">Sin selecciones todavía</div>`}
    </div>
  </div>`;
}

// Jugadores de una selección ordenados alfabéticamente por apellido/nombre común (para las flechas).
function orderedTeamPlayers(team){
  return team.players.slice().sort((a,b)=>
    playerLastNameKey(a).localeCompare(playerLastNameKey(b), 'es', {sensitivity:'base'})
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
}

function renderTeamDetail(teamId){
  const t = getTeam(teamId);
  if(!t || t.hidden){ activeTeamId=null; return renderSelecciones(); }  // el equipo oculto (agentes libres) no tiene perfil visible
  const rating = teamRating(t);
  const ratings = teamRatings(t);
  const sponsorsOfTeam = DB.sponsors.filter(s=>sponsorEffectiveLinks(s).some(l=>l.type==="team" && l.id===t.id));
  const fifaRankNow = computeFifaRanks()[t.id] || null;
  const orderedT = orderedTeamsForNav();
  const tIdx = orderedT.findIndex(x=>x.id===t.id);
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-selecciones">← Volver</button>
    ${detailNavHTML('nav-team-arrow', tIdx, orderedT.length)}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    ${crestHTML(t, "width:150px;height:150px;")}
    <div style="flex:1;min-width:200px;">
      <h2 style="margin:0 0 2px;">${t.commonName} ${fifaBadge(t)}</h2>
      ${firstNicknameDisplay(t) ? `<div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:2px;">${firstNicknameDisplay(t)}</div>` : ""}
      <div style="font-size:12px;color:var(--muted);margin-bottom:6px;">${flagIconHTML(t)}${t.federationName ? t.federationName + (t.federationAbbr ? ` (${t.federationAbbr})` : "") : ""}</div>
      <div class="tag-list">
        ${confBadge(t.conf)}
        <span class="badge conf">Grupo ${t.group||"—"}</span>
        ${fifaRankNow?`<span class="badge conf">FIFA #${fifaRankNow}</span>`:""}
        ${t.host?`<span class="badge host">${T('general.badge.host')}</span>`:''}
        <span class="badge ${squadStatus(t)}">${t.players.length} jugadores</span>
      </div>
    </div>
    ${ratingBlockHTML(ratings)}
    <div style="display:flex;flex-direction:column;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-team" data-id="${t.id}">Editar selección</button>
      <button class="btn danger sm" data-action="delete-team" data-id="${t.id}">Eliminar</button>
    </div>
  </div>

  <div class="section-title"><h2>Uniformes</h2></div>
  <div class="card" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
    <div style="flex:2;min-width:240px;display:flex;gap:14px;justify-content:flex-start;flex-wrap:wrap;">
      ${(t.kits||[]).filter(k=>k.category==="jugador").slice(0,3).map(k=>`
        <div class="kit-render" data-pending data-team-id="${t.id}" data-kit-id="${k.id}" data-action="edit-kit" data-team="${t.id}" data-id="${k.id}"
             style="width:110px;height:110px;background:var(--surface-2);border-radius:10px;cursor:pointer;flex-shrink:0;"></div>
      `).join("")}
    </div>
    <div style="flex:1;min-width:160px;border-left:1px solid var(--line);padding-left:18px;">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:4px;">Patrocinador de ropa</div>
      ${t.kitSponsor ? `<span class="badge conf" style="${KIT_SPONSOR_BADGE_STYLE}">${kitSponsorLogoIcon(t.kitSponsor)}${escapeHtml(t.kitSponsor)}</span>` : `<span class="badge conf" style="${KIT_SPONSOR_BADGE_STYLE}">Sin marca</span>`}
      <div style="margin-top:10px;">
        <button class="btn ghost sm" data-action="manage-kits" data-team="${t.id}">Editar uniformes</button>
      </div>
    </div>
  </div>

  ${(typeof facilitiesSectionHTML==="function") ? facilitiesSectionHTML(t) : ""}

  <div class="section-title"><h2>Convocatoria</h2><button class="btn gold sm" data-action="add-player" data-team="${t.id}">+ Agregar jugador</button></div>
  ${t.players.length===0 ? `<div class="empty"><h3>Sin jugadores cargados</h3><p>Agrega la convocatoria desde aquí.</p></div>` : `
  <div class="squad-sortbar">
    <span class="squad-sortbar-label">Ordenar</span>
    ${squadSortChip("#","number")}
    ${squadSortChip("Jugador","name")}
    ${squadSortChip("Pos","pos")}
    ${squadSortChip("Edad","age")}
    ${squadSortChip("Club","club")}
    ${squadSortChip("Rating","rating")}
  </div>
  ${(()=>{
    const row = p=>`
      <div class="player-row" data-action="open-player" data-id="${p.id}" style="cursor:pointer;">
        <span class="num-badge">${p.number!=null?p.number:"–"}</span>
        <span class="pname">${personPhotoHTML(p, "width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-right:6px;flex-shrink:0;")}${playerDisplayNameHTML(p)}<span class="pos-chip pos-${p.pos}" style="margin-left:10px;">${p.pos}</span>${positionsText(p)?` <span style="color:var(--muted);font-size:12px;font-weight:400;">${positionsText(p)}</span>`:""}</span>
        <span class="pmeta">${playerAgeText(p)} · ${p.club?`<span class="club-chip tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(p.club)}">${clubLogoIconHTML(getClubByName(p.club))}${escapeHtml(p.club)}</span>`:`<span class="club-chip">Sin club</span>`}</span>
        <span class="prating">${p.rating}</span>
        <button class="btn ghost sm" data-action="edit-player" data-team="${t.id}" data-id="${p.id}">Editar</button>
        <button class="btn danger sm" data-action="delete-player" data-team="${t.id}" data-id="${p.id}">✕</button>
      </div>`;
    const sorted = t.players.slice().sort((a,b)=>
      compareGeneric(playerValue(a,squadSort.key), playerValue(b,squadSort.key), playerType(squadSort.key), squadSort.dir)
      || playerDisplayName(a).localeCompare(playerDisplayName(b)));
    const conv = sorted.filter(p=>p.number!=null);
    const noconv = sorted.filter(p=>p.number==null);
    return `
    <div class="list-subhead"><h3>Convocados</h3><span class="hint">${conv.length} con dorsal</span></div>
    <div class="card">${conv.length ? conv.map(row).join("") : `<p style="font-size:13px;color:var(--muted);margin:0;">Ningún jugador con dorsal asignado.</p>`}</div>
    <div class="list-subhead" style="margin-top:18px;"><h3>No convocados</h3><span class="hint">${noconv.length} sin dorsal</span></div>
    <div class="card">${noconv.length ? noconv.map(row).join("") : `<p style="font-size:13px;color:var(--muted);margin:0;">Todos los jugadores están convocados.</p>`}</div>`;
  })()}`}

  <div class="section-title"><h2>Cuerpo técnico</h2><button class="btn gold sm" data-action="add-coach" data-team="${t.id}">+ Agregar entrenador</button></div>
  ${(t.coaches||[]).length===0
    ? `<div class="empty"><h3>Sin entrenadores cargados</h3><p>Agrega el cuerpo técnico desde aquí.</p></div>`
    : `<div class="card">
    ${(t.coaches||[]).slice().sort((a,b)=>
        playerSortName(a).toLowerCase().localeCompare(playerSortName(b).toLowerCase(),'es',{sensitivity:'base'})
        || playerDisplayName(a).localeCompare(playerDisplayName(b))
      ).map(c=>coachRowHTML(c, t)).join("")}
  </div>`}

  <div class="section-title"><h2>Patrocinadores ligados</h2></div>
  <div class="card">
    ${sponsorsOfTeam.length===0 ? `<p style="font-size:13px;color:var(--muted);margin:0;">Ninguno todavía. Puedes ligar uno desde la pestaña Patrocinadores.</p>` :
      sponsorsOfTeam.map(s=>`<div class="kv"><span>${escapeHtml(s.name)} <span style="color:var(--muted);">(${escapeHtml(sponsorCategoriesOf(s).join(", ")||"—")})</span></span><span class="mono">$${s.value}M</span></div>`).join("")}
  </div>
  `;
}

function squadSortChip(label, key){
  const active = squadSort.key===key;
  const arrow = active ? (squadSort.dir==="asc"?"▲":"▼") : "";
  return `<button class="sort-chip ${active?'active':''}" data-action="sort-squad" data-key="${key}"><span>${label}</span>${arrow?`<span class="arrow">${arrow}</span>`:""}</button>`;
}

function modalAddEditTeam(team){
  const isEdit = !!team;
  team = team || {id:null, officialName:"", commonName:"", shortName:"", fifaCode:"", iocCode:"", conf:"UEFA", group:"", host:false, color1:"#4F46E5", color2:"#15161D", awayColor1:"#FFFFFF", awayColor2:"#15161D", kitSponsor:"", logoImg:"", logoImgLight:"", kitHomeImg:"", kitAwayImg:"", stadium:"", stadiums:[], trainingGround:"", socialAvatar:null, socialAvatarManual:false, socialProfileName:"", socialUsername:"", socialVerified:"", socialAvatarLogo:"dark", socialAvatarColor:0};
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar selección":"Agregar selección"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="subhead">${T('team.section.names')}</div>
          <label class="field" style="grid-column:1/-1;">${T('team.officialName.label')}
            <input id="f-officialname" value="${team.officialName||''}" placeholder="${T('team.officialName.placeholder')}">
          </label>
          <label class="field" style="grid-column:1/-1;">${T('team.commonName.label')}
            <input id="f-commonname" value="${team.commonName||''}" maxlength="50" placeholder="${T('team.commonName.placeholder')}">
          </label>
          <label class="field">${T('team.shortName.label')}
            <input id="f-shortname" value="${team.shortName||''}" maxlength="30" placeholder="${T('team.shortName.placeholder')}">
          </label>
          <label class="field">${T('team.fifaCode.label')}
            <input id="f-fifacode" value="${team.fifaCode||''}" maxlength="3" placeholder="${T('team.fifaCode.placeholder')}">
          </label>
          <label class="field" style="grid-column:1/-1;">${T('team.iocCode.label')}
            <input id="f-ioccode" value="${team.iocCode||''}" maxlength="3" placeholder="${T('team.iocCode.placeholder')}">
          </label>

          <label class="field" style="grid-column:1/-1;">${T('team.federationName.label')}
            <input id="f-federationname" value="${team.federationName||''}" placeholder="${T('team.federationName.placeholder')}">
          </label>
          <label class="field" style="grid-column:1/-1;">${T('team.federationAbbr.label')}
            <input id="f-federationabbr" value="${team.federationAbbr||''}" maxlength="12" placeholder="${T('team.federationAbbr.placeholder')}">
          </label>

          <div class="subhead">${T('team.section.nicknames')}</div>
          <div style="grid-column:1/-1;">
            <div id="nicknames-rows">
              ${(team.nicknames && team.nicknames.length ? team.nicknames : [{article:"",name:""}]).map(n=>nicknameRowHTML(n.article,n.name)).join("")}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:var(--muted);">${T('team.nicknames.hint')}</span>
              <button type="button" class="btn ghost sm" data-action="add-nickname-row">${T('team.nicknames.addButton')}</button>
            </div>
          </div>

          <div class="subhead">${T('team.section.general')}</div>
          <label class="field">${T('team.conf.label')}
            <select id="f-conf">
              <option value="">${T('country.conf.none')}</option>
              ${CONFS.map(c=>`<option value="${c}" ${c===team.conf?"selected":""}>${c}</option>`).join("")}
            </select>
          </label>
          <label class="field">${T('team.group.label')}<input id="f-group" value="${team.group}" maxlength="2" placeholder="${T('team.group.placeholder')}"></label>
          <label class="field" style="flex-direction:row;align-items:center;gap:8px;grid-column:1/-1;">
            <input type="checkbox" id="f-host" style="width:auto;" ${team.host?"checked":""}> ${T('team.host.label')}
          </label>

          <div class="subhead">${T('team.section.crest')}</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Escudo — fondo oscuro", "logo", team.logoImg, "El que se usa en casi toda la app (fondo oscuro).")}
            ${imageUploadFieldCol("Escudo — fondo claro", "logo-l", team.logoImgLight, "Para fondos claros.")}
          </div>

          <div class="subhead">${T('team.section.colors')}</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">${T('team.color1.label')}${colorPickerHTML("color-square", team.color1, "f-color1")}</label>
            <label class="field" style="flex:0 0 auto;">${T('team.color2.label')}${colorPickerHTML("color-square", team.color2, "f-color2")}</label>
            <label class="field" style="flex:0 0 auto;">${T('team.color3.label')}${colorPickerHTML("color-square", team.color3||'#FFFFFF', "f-color3")}</label>
          </div>

          <div class="subhead">Instalaciones</div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Estadios (en orden de importancia)
            <div id="club-stadium-rows">
              ${(((team.stadiums&&team.stadiums.length)?team.stadiums:(team.stadium?[team.stadium]:[""]))).map(n=>clubStadiumRowHTML(n)).join("")}
            </div>
            <div>
              <button type="button" class="btn ghost sm" data-action="add-club-stadium-row">+ Agregar estadio</button>
            </div>
            <datalist id="stadium-list-club">
              ${[...new Set((DB.stadiums||[]).map(s=>stadiumLinkName(s)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map(n=>`<option value="${escapeHtml(n)}">`).join("")}
            </datalist>
          </div>
          <label class="field" style="grid-column:1/-1;">Campo de entrenamiento
            <input id="f-t-training" list="training-list" value="${escapeHtml(team.trainingGround||'')}" placeholder="Escribe o elige un campo de entrenamiento">
            <datalist id="training-list">${(DB.stadiums||[]).filter(s=>s.isTraining).map(s=>`<option value="${escapeHtml(stadiumDisplayName(s))}">`).join("")}</datalist>
          </label>

          <div class="subhead">${T('team.section.rankings')}</div>
          <label class="field">${T('team.fifaPoints.label')}<input id="f-fifapoints" type="number" step="0.01" value="${team.fifaPoints!=null?team.fifaPoints:''}" placeholder="${T('team.fifaPoints.placeholder')}"></label>
          <label class="field">${T('team.eloRating.label')}<input id="f-elorating" type="number" step="1" value="${team.eloRating!=null?team.eloRating:''}" placeholder="${T('team.eloRating.placeholder')}"></label>

          ${socialSectionHTML("tsoc", team, {
            logoOptions: [["dark","Logo oscuro"],["light","Logo claro"]],
            logos: { dark: team.logoImg||"", light: team.logoImgLight||team.logoImg||"" },
            colors: [team.color1||"#4F46E5", team.color2||"#15161D", team.color3||"#FFFFFF"],
            colorInputs: ["f-color1","f-color2","f-color3"]
          })}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-team" data-id="${team.id||''}">Guardar</button>
      </div>
    </div>
  `);
}

