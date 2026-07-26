/* =========================================================
   COPA MANAGER 2026 — funciones/entrenadores.js
   Entrenadores (cuerpo técnico de cada selección): listado filtrable en su propia
   pestaña, ficha individual, fila para el bloque "Cuerpo técnico" del perfil de
   selección y modal de edición. Sigue el mismo patrón que funciones/jugadores.js
   pero con menos campos. Los entrenadores viven dentro de team.coaches (igual que
   los jugadores dentro de team.players). Script CLÁSICO (no module). Cargar DESPUÉS
   de datos/constantes.js (PLAYER_PHOTO_DEFAULT), core/utilidades.js (escapeHtml,
   compareGeneric, sortTh), app/textos-ui.js (tabLabel, tabDescription), app/modales.js
   (openModal, imageUploadField, detailNavHTML), funciones/paises.js (playerCountryName,
   countryNameById, sortedCountries, nationalityRowHTML) y funciones/jugadores.js
   (playerDisplayName, playerDisplayNameHTML, playerAge, playerAgeText, playerSortName,
   playerBirthSortKey, computeAge, computeDefaultFullName), y ANTES del <script> inline.
   Usa en tiempo de ejecución DB, getTeam (inline) y el estado coachFilter/coachSort
   (inline). Sin ciclo de carga: la relación con selecciones es en tiempo de render.
   ========================================================= */

// Los entrenadores comparten la misma "forma" de nombre/edad/nacionalidad que los jugadores, así que
// reutilizamos sus helpers genéricos (playerDisplayName, playerAge, playerCountryName, etc.) en vez de
// duplicarlos: cualquier objeto con firstName/lastName/commonName/birthDate/nationalityIds sirve.

// Abreviatura del icono según el puesto (va en el lugar del dorsal del jugador). Clave por normLoose
// para tolerar acentos/mayúsculas. Puestos personalizados o vacíos usan "ENT" por defecto.
const COACH_ROLE_BADGE = {
  "entrenador del primer equipo": "MAN",
  "asistente": "ASC",
  "entrenador de porteros": "GKC",
  "preparador fisico": "FIT",
  "analista de datos": "DAT",
  "analista de rivales": "RIV",
  "medico": "DOC",
  "fisioterapeuta": "PHY",
  "psicologo deportivo": "PSY",
  "nutriologo": "NUT"
};
function coachRoleBadge(role){
  return COACH_ROLE_BADGE[normLoose(role||"")] || "ENT";
}

// Busca un entrenador por id recorriendo todas las selecciones — igual que getPlayerWithTeam, los
// entrenadores no tienen un arreglo global propio: viven dentro de team.coaches.
// Los que no tienen contrato con una selección viven en un equipo OCULTO de agentes libres, que no se
// muestra en la lista de selecciones ni en la navegación, pero cuyos entrenadores sí salen en la
// pestaña de Entrenadores (que aplana todos los equipos).
const FREE_AGENT_TEAM_ID = "__free_agents";
function freeAgentTeam(){
  let t = DB.teams.find(x=>x.id===FREE_AGENT_TEAM_ID);
  if(!t){
    t = { id:FREE_AGENT_TEAM_ID, commonName:"Agentes libres", officialName:"Agentes libres",
          shortName:"LIBRE", fifaCode:"", conf:"", group:"", host:false, hidden:true,
          players:[], coaches:[], kits:[] };
    DB.teams.push(t);
  }
  if(!Array.isArray(t.coaches)) t.coaches = [];
  return t;
}
function getCoachWithTeam(coachId){
  for(const t of DB.teams){
    const c = (t.coaches||[]).find(x=>x.id===coachId);
    if(c) return {coach:c, team:t};
  }
  return {coach:null, team:null};
}

// Entrenadores de una selección ordenados por apellido/nombre común (para las flechas ↑ ↓ de la ficha).
function orderedTeamCoaches(team){
  return (team.coaches||[]).slice().sort((a,b)=>
    playerSortName(a).toLowerCase().localeCompare(playerSortName(b).toLowerCase(), 'es', {sensitivity:'base'})
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
}

function coachValue(c,key){
  switch(key){
    case "name": return playerSortName(c);
    case "country": return playerCountryName(c);
    case "age": return playerBirthSortKey(c);
    case "equipo": return coachEmployerText(c);
    case "puesto": return c.contractRole || "";
    case "rating": return c.rating;
    default: return null;
  }
}
function coachType(key){ return ["age","rating"].includes(key) ? "number" : "string"; }
function coachDefaultDir(key){ return key==="rating" ? "desc" : "asc"; }

// Texto plano del empleador (para la columna "Equipo" de la tabla y para ordenar): la selección
// (como "Selección de [país]") y/o el club, separados por coma si están ambos.
function coachEmployerText(c){
  const parts = [];
  if(c.contractCountryId){
    const co = (DB.countries||[]).find(x=>x.id===c.contractCountryId);
    if(co) parts.push(`Selección de ${co.commonName}`);
  }
  if(c.contractClub) parts.push(c.contractClub);
  return parts.join(", ");
}

// Etiquetas del contrato para el perfil: el empleador para el que trabaja el entrenador — la selección
// (mostrada como "Selección de [país]") y/o el club — en gris, igual que el chip de club de los jugadores.
// Si el país tiene una selección ligada, la etiqueta abre esa selección; el club abre la ficha del club.
function coachContractChipsHTML(c){
  const chips = [];
  if(c.contractCountryId){
    const country = (DB.countries||[]).find(x=>x.id===c.contractCountryId);
    if(country){
      const label = `Selección de ${country.commonName}`;
      const teamId = country.teamLinks && country.teamLinks.absoluta;
      const flag = flagIconHTML(country);
      chips.push(teamId
        ? `<span class="badge conf tag-clickable" data-action="open-team" data-id="${teamId}" style="background:var(--surface-2);color:var(--muted);">${flag}${escapeHtml(label)}</span>`
        : `<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${flag}${escapeHtml(label)}</span>`);
    }
  }
  if(c.contractClub){
    chips.push(`<span class="badge conf tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(c.contractClub)}" style="background:var(--surface-2);color:var(--muted);">${clubLogoIconHTML(getClubByName(c.contractClub))}${escapeHtml(c.contractClub)}</span>`);
  }
  return chips.join(" ");
}

// Ficha de un entrenador — mismo espíritu que renderPlayerDetail pero con menos detalles: foto a la
// izquierda, icono ENT + nombre, edad, país (nacionalidad principal) y el rating grande a la derecha.
function renderCoachDetail(coachId){
  const {coach:c, team} = getCoachWithTeam(coachId);
  if(!c){ activeCoachId = null; return renderEntrenadores(); }
  let cIdx = -1, cTotal = 0;
  if(team){
    const oc = orderedTeamCoaches(team);
    cIdx = oc.findIndex(x=>x.id===c.id);
    cTotal = oc.length;
  }
  const country = playerCountryName(c);
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-coach-detail">← Volver</button>
    ${team ? detailNavHTML('nav-coach-arrow', cIdx, cTotal) : ""}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    <div style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2);flex-shrink:0;">
      <img src="${c.photo||personPhotoDefault(c)}" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>
    <div style="flex:1;min-width:200px;">
      <h2 style="margin:0 0 2px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="num-badge" style="width:auto;padding:0 8px;font-size:10px;letter-spacing:.05em;">${coachRoleBadge(c.contractRole)}</span>
        <span>${playerDisplayNameHTML(c)}</span>
      </h2>
      <div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        <span>${playerAgeText(c)}${(c.contractRole||'').trim()?` · ${escapeHtml((c.contractRole||'').trim())}`:''}</span>
        ${coachContractChipsHTML(c)}
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
        ${country
          ? `<span class="badge" style="background:var(--surface-2);color:var(--muted);">${flagIconHTML(nationalityCountryOf(c)||country)}${escapeHtml(personDemonym(c)||country)}</span>`
          : `<span style="font-size:13px;color:var(--muted);">Sin nacionalidad</span>`}
      </div>
    </div>
    <div style="align-self:center;text-align:center;min-width:96px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:800;line-height:1;color:var(--indigo);">${c.rating!=null?c.rating:"-"}</div>
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">Rating</div>
    </div>
    <div style="display:flex;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-coach" data-team="${team?team.id:''}" data-id="${c.id}">Editar</button>
      <button class="btn danger sm" data-action="delete-coach" data-team="${team?team.id:''}" data-id="${c.id}">Eliminar</button>
    </div>
  </div>
  `;
}

// Fila de entrenador para el bloque "Cuerpo técnico" dentro del perfil de una selección — mismo estilo
// visual que las filas de jugador de la convocatoria (icono ENT en el lugar del dorsal, foto, nombre,
// edad · puesto, rating, y los botones Editar / ✕).
function coachRowHTML(c, team){
  const puesto = (c.contractRole||"").trim();
  return `
  <div class="player-row" data-action="open-coach" data-id="${c.id}" style="cursor:pointer;">
    <span class="num-badge" style="width:auto;padding:0 6px;font-size:9px;letter-spacing:.04em;">${coachRoleBadge(c.contractRole)}</span>
    <span class="pname">${personPhotoHTML(c, "width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-right:6px;flex-shrink:0;")}${playerDisplayNameHTML(c)}</span>
    <span class="pmeta">${playerAgeText(c)}${puesto?` · ${escapeHtml(puesto)}`:""}</span>
    <span class="prating">${c.rating!=null?c.rating:"-"}</span>
    <button class="btn ghost sm" data-action="edit-coach" data-team="${team.id}" data-id="${c.id}">Editar</button>
    <button class="btn danger sm" data-action="delete-coach" data-team="${team.id}" data-id="${c.id}">✕</button>
  </div>`;
}

// Celda "Equipo" de la LISTA de entrenadores: cuando es selección NO muestra bandera, sino el LOGO de
// la selección; para un club, el logo del club. (El perfil sí usa bandera, vía coachContractChipsHTML.)
function coachEquipoCellHTML(c){
  const parts = [];
  if(c.contractCountryId){
    const co = (DB.countries||[]).find(x=>x.id===c.contractCountryId);
    if(co){
      const tid = co.teamLinks && co.teamLinks.absoluta;
      const team = tid ? getTeam(tid) : null;
      const label = `Selección de ${co.commonName}`;
      parts.push(team
        ? `<span class="badge conf tag-clickable" data-action="open-team" data-id="${team.id}" style="background:var(--surface-2);color:var(--muted);">${teamLogoIconHTML(team)}${escapeHtml(label)}</span>`
        : `<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${escapeHtml(label)}</span>`);
    }
  }
  if(c.contractClub){
    const club = getClubByName(c.contractClub);
    parts.push(`<span class="badge conf tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(c.contractClub)}" style="background:var(--surface-2);color:var(--muted);">${clubLogoIconHTML(club)}${escapeHtml(c.contractClub)}</span>`);
  }
  return parts.join(" ");
}

function renderEntrenadores(){
  const all = DB.teams.flatMap(t=>(t.coaches||[]).map(c=>({...c, teamName:t.commonName, teamId:t.id})));
  const filtered = all.filter(c=>{
    if(coachFilter.q && !playerDisplayName(c).toLowerCase().includes(coachFilter.q.toLowerCase())) return false;
    if(coachFilter.nat){ const co=nationalityCountryOf(c); if(!co || co.id!==coachFilter.nat) return false; }
    return true;
  }).sort((a,b)=>
    compareGeneric(coachValue(a,coachSort.key), coachValue(b,coachSort.key), coachType(coachSort.key), coachSort.dir)
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
  const natOptions = [...new Map(all.map(c=>nationalityCountryOf(c)).filter(Boolean).map(c=>[c.id,c])).values()]
    .sort((a,b)=>a.commonName.localeCompare(b.commonName,'es'));

  const pg = paginate(filtered, coachPage);
  coachPage = pg.page;
  const rangeText = pg.total ? `${pg.start+1}–${pg.start+pg.items.length} de ${pg.total}` : "0";
  const fillers = pg.pageCount>1 ? (LIST_PAGE_SIZE - pg.items.length) : 0;

  return `
  <div class="section-title"><h2>${tabLabel('entrenadores','Entrenadores')}</h2><span class="hint">${filtered.length} ${filtered.length===1?'entrenador':'entrenadores'} · mostrando ${rangeText}</span></div>
  <div class="searchbar">
    <input type="text" id="coach-q" placeholder="Buscar entrenador..." value="${coachFilter.q}">
    <select id="coach-nat-filter">
      <option value="">Todas las nacionalidades</option>
      ${natOptions.map(c=>`<option value="${c.id}" ${coachFilter.nat===c.id?"selected":""}>${escapeHtml(c.commonName)}</option>`).join("")}
    </select>
    <button class="btn gold sm" data-action="add-coach" data-team="${coachFilter.team||''}">+ Agregar entrenador</button>
  </div>
  ${pagerHTML(pg.page, pg.pageCount, "coaches-page")}
  <div class="tbl-wrap">
    <table>
      <thead><tr>
        ${sortTh("Entrenador","name",coachSort,"sort-coaches")}
        ${sortTh("País","country",coachSort,"sort-coaches")}
        ${sortTh("Edad","age",coachSort,"sort-coaches")}
        ${sortTh("Equipo","equipo",coachSort,"sort-coaches")}
        ${sortTh("Puesto","puesto",coachSort,"sort-coaches")}
        ${sortTh("Rating","rating",coachSort,"sort-coaches")}
        <th></th>
      </tr></thead>
      <tbody>
      ${pg.items.map(c=>`
        <tr data-action="open-coach" data-id="${c.id}" style="cursor:pointer;">
          <td>${personPhotoHTML(c, "width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-right:6px;")}${playerDisplayNameHTML(c)}</td>
          <td>${(()=>{const cn=playerCountryName(c);return cn?flagIconHTML(cn)+escapeHtml(cn):"—";})()}</td>
          <td>${playerAge(c)!=null?playerAge(c):'—'}</td>
          <td>${coachEquipoCellHTML(c) || `<span class="tag-free-agent">Agente libre</span>`}</td>
          <td>${c.contractRole?escapeHtml(c.contractRole):"—"}</td>
          <td class="mono">${c.rating!=null?c.rating:"—"}</td>
          <td><button class="btn ghost sm" data-action="edit-coach" data-team="${c.teamId}" data-id="${c.id}">Editar</button></td>
        </tr>
      `).join("") || `<tr><td colspan="7" style="text-align:center;color:var(--muted);">Sin resultados</td></tr>`}
      ${fillerRowsHTML(fillers, 7)}
      </tbody>
    </table>
  </div>
  ${pagerHTML(pg.page, pg.pageCount, "coaches-page")}
  `;
}

function modalAddEditCoach(teamId, coach, prefill){
  const isEdit = !!coach;
  const team = getTeam(teamId);
  // Para un entrenador nuevo, hereda por defecto la nacionalidad del país de la selección (si lo tiene).
  const teamCountry = teamId ? DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===teamId) : null;
  coach = coach || {id:null, firstName:"", lastName:"", commonName:"", fullName:"", birthDate:null,
    rating:70, ratingPotential:null, nationalityIds: teamCountry ? [teamCountry.id] : [], photo:null, fullNameLinked:true,
    contractCountryId: teamCountry ? teamCountry.id : null, contractClub:(prefill&&prefill.contractClub)||"", contractRole:""};
  if(coach.fullNameLinked===undefined) coach.fullNameLinked = !coach.fullName;
  // Mientras esté "vinculado", el nombre completo se recalcula fresco al abrir el editor.
  if(coach.fullNameLinked) coach.fullName = computeDefaultFullName(coach);
  const nationalityNames = (coach.nationalityIds||[]).map(countryNameById).filter(Boolean);
  const contractSelName = coach.contractCountryId ? countryNameById(coach.contractCountryId) : "";
  const contractRole = coach.contractRole || "";
  const roleIsCustom = !!(contractRole && !COACH_ROLES.includes(contractRole));
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar entrenador":"Agregar entrenador"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          ${imageUploadField("Foto del entrenador (opcional)", "cphoto", coach.photo, "Si no subes una, se usa una silueta genérica.")}
          <label class="field">Nombre<input id="f-cfirstname" value="${(coach.firstName||"").replace(/"/g,"&quot;")}"></label>
          <label class="field">Apellido<input id="f-clastname" value="${(coach.lastName||"").replace(/"/g,"&quot;")}"></label>
          <label class="field" style="grid-column:1/-1;">Nombre común (opcional)
            <input id="f-ccommonname" value="${(coach.commonName||"").replace(/"/g,"&quot;")}" placeholder="Si lo dejas vacío, se usa Nombre + Apellido">
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre completo
            <input id="f-cfullname" value="${(coach.fullName||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se forma solo con Nombre + Apellido — si lo cambias a mano, ya no se actualiza solo.</span>
          </label>
          <input type="hidden" id="f-cfullname-linked" value="${coach.fullNameLinked?'1':'0'}">

          <label class="field">Fecha de nacimiento
            <input id="f-cbirth" type="date" value="${coach.birthDate||''}">
            <span id="f-cage-hint" style="font-size:10px;color:var(--muted);font-weight:400;">${coach.birthDate&&computeAge(coach.birthDate)!=null?`Edad: ${computeAge(coach.birthDate)} años`:'Opcional — de aquí se calcula la edad.'}</span>
          </label>
          <label class="field">Género
            <select id="f-cgender">
              ${PERSON_GENDERS.map(g=>`<option value="${g}" ${g===(coach.gender||"Masculino")?"selected":""}>${g}</option>`).join("")}
            </select>
          </label>

          <label class="field">Rating (0-99)<input id="f-crating" type="number" min="0" max="99" value="${coach.rating}"></label>
          <label class="field">Rating potencial (0-99)<input id="f-crating-potential" type="number" min="0" max="99" value="${coach.ratingPotential!=null?coach.ratingPotential:''}" placeholder="—"></label>

          <div class="subhead">Nacionalidades</div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Nacionalidades (la primera es la principal)
            <div id="nationality-rows">
              ${(nationalityNames.length?nationalityNames:[""]).map(n=>nationalityRowHTML(n)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="add-nationality-row">+ Agregar nacionalidad</button></div>
            <datalist id="nation-list">${datalistOptions(sortedCountries().map(c=>c.commonName))}</datalist>
          </div>
          <div class="subhead">Contrato</div>
          <label class="field">Selección
            <input id="f-c-sel" list="coach-sel-list" value="${(contractSelName||'').replace(/"/g,'&quot;')}" placeholder="Escribe o elige un país (opcional)">
            <datalist id="coach-sel-list">${datalistOptions(sortedCountries().map(c=>c.commonName))}</datalist>
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se muestra como “Selección de …”. Puedes dejarlo en blanco.</span>
          </label>
          <label class="field">Club
            <input id="f-c-club" list="coach-club-list" value="${(coach.contractClub||'').replace(/"/g,'&quot;')}" placeholder="Escribe o elige un club (opcional)">
            <datalist id="coach-club-list">${datalistOptions(DB.clubs.slice().sort((a,b)=>a.localeCompare(b,'es')))}</datalist>
          </label>
          <label class="field" style="grid-column:1/-1;">Puesto
            <select id="f-c-role">
              <option value="" ${!contractRole?'selected':''}>—</option>
              ${COACH_ROLES.map(r=>`<option value="${escapeHtml(r)}" ${(!roleIsCustom && r===contractRole)?'selected':''}>${escapeHtml(r)}</option>`).join("")}
              <option value="__otro__" ${roleIsCustom?'selected':''}>Otro…</option>
            </select>
          </label>
          <label class="field" id="f-c-role-otro-wrap" style="grid-column:1/-1;${roleIsCustom?'':'display:none;'}">Puesto personalizado
            <input id="f-c-role-otro" value="${roleIsCustom?escapeHtml(contractRole):''}" placeholder="Escribe el puesto">
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-coach" data-team="${teamId||''}" data-id="${coach.id||''}">Guardar</button>
      </div>
    </div>
  `);
}
