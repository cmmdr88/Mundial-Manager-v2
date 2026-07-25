/* =========================================================
   COPA MANAGER 2026 — funciones/arbitros.js
   Árbitros: listado filtrable en su propia pestaña, ficha individual y modal de edición.
   Sigue el mismo patrón que funciones/entrenadores.js, pero los árbitros NO pertenecen a
   una selección: viven en un arreglo global DB.referees (como los estadios). Reutiliza los
   helpers de nombre/edad/nacionalidad de funciones/jugadores.js (playerDisplayName,
   playerAge, playerSortName, computeDefaultFullName…), que funcionan con cualquier objeto
   que tenga firstName/lastName/commonName/birthDate/nationalityIds.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js, datos/arbitros-seed.js,
   datos/partidos-numerados.js, core/utilidades.js, app/modales.js, funciones/paises.js y
   funciones/jugadores.js, y ANTES del <script> inline (usa refereeFilter/refereeSort).
   ========================================================= */

// Roles disponibles (los tres del reglamento; el editor no permite escribir otros).
const REFEREE_ROLES = ["Árbitro central", "Árbitro asistente", "Árbitro asistente de video"];
// Abreviatura que va en el lugar del dorsal, igual que el badge de puesto de los entrenadores.
const REFEREE_ROLE_BADGE = {
  "arbitro central": "REF",
  "arbitro asistente": "ASI",
  "arbitro asistente de video": "VAR"
};
function refereeRoleBadge(role){
  return REFEREE_ROLE_BADGE[normLoose(role||"")] || "REF";
}
const REFEREE_GENDERS = PERSON_GENDERS;

function getReferee(id){ return (DB.referees||[]).find(r=>r.id===id) || null; }

// Nombre que va en el dorso de su camiseta. Por defecto el apellido en mayúsculas.
function refereeDefaultShirtName(r){
  return String((r && (r.lastName || r.commonName || r.firstName)) || "").toUpperCase();
}
function refereeShirtName(r){
  // Mientras esté vinculado (no editado a mano) sigue al apellido, como el nombre en camiseta
  // de los jugadores.
  if(!r) return "";
  if(r.shirtNameLinked===false && String(r.shirtName||"").trim()) return String(r.shirtName).trim();
  return refereeDefaultShirtName(r);
}

// La nacionalidad PRINCIPAL de un árbitro es aquella por la que declara elegibilidad (el país que
// representa), no la primera de la lista: Elfath tiene nacionalidad marroquí y estadounidense, pero
// representa a Estados Unidos, así que esa es la que se muestra como su nacionalidad.
function refereeMainCountry(r){
  const id = r.countryRepresentsId || (r.nationalityIds && r.nationalityIds[0]) || null;
  return id ? ((DB.countries||[]).find(c=>c.id===id) || null) : null;
}
function refereeMainCountryName(r){ const c = refereeMainCountry(r); return c ? c.commonName : ""; }
// Gentilicio del árbitro, en femenino cuando corresponde.
function refereeDemonym(r){
  const co = refereeMainCountry(r);
  if(!co) return refereeMainCountryName(r);
  const fem = normLoose(r.gender||"")==="femenino";
  const g = fem ? (co.gentilicioF||co.gentilicioM) : (co.gentilicioM||co.gentilicioF);
  return g ? capitalizeFirst(g) : co.commonName;
}
// Copas del Mundo anteriores, en orden ascendente y separadas por comas.
function refereeWorldCupsText(r){
  return (r.previousWorldCups||[]).filter(Boolean)
    .slice().sort((a,b)=>String(a).localeCompare(String(b),'es',{numeric:true}))
    .join(", ");
}

// Árbitros ordenados por apellido/nombre común — para las flechas ↑ ↓ de la ficha.
function orderedReferees(){
  return (DB.referees||[]).slice().sort((a,b)=>
    playerSortName(a).toLowerCase().localeCompare(playerSortName(b).toLowerCase(), 'es', {sensitivity:'base'})
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
}

// Números de partido de un árbitro, siempre ordenados y sin repetidos.
function refereeMatchNumbers(r){
  return [...new Set((r.matches||[]).map(n=>parseInt(n,10)).filter(n=>n>=1 && n<=104))].sort((a,b)=>a-b);
}
// Árbitros asignados a un partido (por número). Los centrales van primero.
function refereesForMatch(n){
  const num = parseInt(n,10);
  if(!num) return [];
  return (DB.referees||[])
    .filter(r=>refereeMatchNumbers(r).includes(num))
    .sort((a,b)=>{
      const rank = x=> normLoose(x.role||"")==="arbitro central" ? 0 : 1;
      return rank(a)-rank(b) || playerDisplayName(a).localeCompare(playerDisplayName(b),'es');
    });
}
// País (nombre) que representa / donde trabaja, resueltos desde su id.
function refereeCountryName(r, key){
  if(key==="works") return (r.countryWorksIds||[]).map(countryNameById).filter(Boolean).join(", ");
  return r.countryRepresentsId ? (countryNameById(r.countryRepresentsId) || "") : "";
}

function refereeValue(r,key){
  switch(key){
    case "name": return playerSortName(r);
    case "country": return refereeMainCountryName(r);
    case "age": return playerBirthSortKey(r);
    case "role": return r.role || "";
    case "fifa": return r.fifaSince!=null ? r.fifaSince : null;
    case "matches": return refereeMatchNumbers(r).length;
    default: return null;
  }
}
function refereeType(key){ return ["age","fifa","matches"].includes(key) ? "number" : "string"; }
function refereeDefaultDir(key){ return key==="matches" ? "desc" : "asc"; }

// Etiquetas grises de los partidos que dirige, clicables hacia el calendario.
function refereeMatchTagsHTML(r){
  const nums = refereeMatchNumbers(r);
  if(!nums.length) return `<span style="color:var(--muted);">Sin partidos asignados</span>`;
  return nums.map(n=>`<span class="badge conf tag-clickable" data-action="goto-calendario" style="background:var(--surface-2);color:var(--muted);" title="${escapeHtml(matchNumberLabel(n))}">M${n}</span>`).join(" ");
}

// ——— Badge FIFA del árbitro ———
// Imagen oficial según el puesto. Las tres vienen SIN el año, que se dibuja encima.
const REFEREE_BADGE_IMG = {
  "arbitro central": "arbitros/referee.png",
  "arbitro asistente": "arbitros/ass_referee.png",
  "arbitro asistente de video": "arbitros/var_referee.png"
};
// Medidas tomadas de la imagen de referencia (example.png, 404×500), en las coordenadas de esa imagen:
// la tinta del año ocupa x 131–272 (142 de ancho) y y 395–441 (47 de alto), con la línea base en 441
// y centrada en el ancho de la imagen. A 64 px la tipografía da exactamente 47 de alto y 138 de ancho,
// así que el 1.33 de interletrado completa los 142. Como todo va en el viewBox del SVG, el conjunto
// escala a cualquier tamaño sin perder proporción ni nitidez.
const REFEREE_BADGE_W = 404, REFEREE_BADGE_H = 500;
const REFEREE_BADGE_YEAR = {size:64, baseline:441, letterSpacing:1.33};
function refereeBadgeImg(role){
  return REFEREE_BADGE_IMG[normLoose(role||"")] || REFEREE_BADGE_IMG["arbitro central"];
}
// Año del badge: es el año EN CURSO (la acreditación FIFA se renueva cada año), no el del torneo.
function refereeBadgeYear(){
  return String(new Date().getFullYear());
}
// SVG del badge: la imagen oficial más el año centrado sobre el listón azul. `height` es la altura
// en píxeles con la que se dibuja (el ancho sale solo, respetando la proporción original).
function refereeBadgeHTML(r, height){
  const h = height || 109;
  const w = h * REFEREE_BADGE_W / REFEREE_BADGE_H;
  const y = REFEREE_BADGE_YEAR;
  // text-anchor="middle" centra el AVANCE del texto, que con interletrado incluye el espacio que
  // queda tras el último dígito; se compensa medio interletrado para que la tinta quede centrada.
  const cx = REFEREE_BADGE_W/2 + y.letterSpacing/2;
  return `
  <svg width="${w.toFixed(1)}" height="${h}" viewBox="0 0 ${REFEREE_BADGE_W} ${REFEREE_BADGE_H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Badge FIFA ${escapeHtml(r.role||'')} ${escapeHtml(refereeBadgeYear())}">
    <image href="${refereeBadgeImg(r.role)}" x="0" y="0" width="${REFEREE_BADGE_W}" height="${REFEREE_BADGE_H}"></image>
    <text x="${cx}" y="${y.baseline}" text-anchor="middle" fill="#FFFFFF"
          font-family="'FIFABadgeYear'" font-size="${y.size}" font-weight="700"
          letter-spacing="${y.letterSpacing}" xml:space="preserve">${escapeHtml(refereeBadgeYear())}</text>
  </svg>`;
}

// Color de fondo del cuadro del badge: el color base del Kit 1 de los árbitros del torneo (el que
// se usa por defecto). Si todavía no hay uniformes, se queda con el gris neutro de la interfaz.
function refereeBadgeBoxColor(){
  const kit = (typeof refereeDefaultKit==="function") ? refereeDefaultKit() : null;
  return (kit && kit.color1) ? kit.color1 : "var(--surface-2)";
}

// Ficha de un árbitro: foto, badge del rol, nombre, edad · rol, nacionalidad, países y partidos.
function renderRefereeDetail(refId){
  const r = getReferee(refId);
  if(!r){ activeRefereeId = null; return renderArbitros(); }
  const ord = orderedReferees();
  const idx = ord.findIndex(x=>x.id===r.id);
  const mainCountry = refereeMainCountry(r);
  const wcs = refereeWorldCupsText(r);
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-referee-detail">← Volver</button>
    ${detailNavHTML('nav-referee-arrow', idx, ord.length)}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    <div style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2);flex-shrink:0;">
      <img src="${r.photo||personPhotoDefault(r)}" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>
    <div style="flex:1;min-width:220px;">
      <h2 style="margin:0 0 2px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="num-badge" style="width:auto;padding:0 8px;font-size:10px;letter-spacing:.05em;">${refereeRoleBadge(r.role)}</span>
        <span>${playerDisplayNameHTML(r)}</span>
      </h2>
      <div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:6px;">
        ${playerAgeText(r)}${(r.role||'').trim()?` · ${escapeHtml(r.role)}`:''}
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${mainCountry
          ? `<span class="badge" style="background:var(--surface-2);color:var(--muted);">${flagIconHTML(mainCountry)}${escapeHtml(refereeDemonym(r))}</span>`
          : `<span style="font-size:13px;color:var(--muted);">Sin nacionalidad</span>`}
        ${r.fifaSince?`<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">Internacional FIFA desde ${r.fifaSince}</span>`:""}
        ${wcs?`<span style="font-size:12px;color:var(--muted);">Copas Mundiales: ${escapeHtml(wcs)}</span>`:""}
      </div>
    </div>
    <div style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:${refereeBadgeBoxColor()};flex-shrink:0;align-self:center;display:flex;align-items:center;justify-content:center;">
      ${refereeBadgeHTML(r, 109)}
    </div>
    <div style="display:flex;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-referee" data-id="${r.id}">Editar</button>
      <button class="btn danger sm" data-action="delete-referee" data-id="${r.id}">Eliminar</button>
    </div>
  </div>
  `;
}

function renderArbitros(){
  const all = (DB.referees||[]);
  const filtered = all.filter(r=>{
    if(refereeFilter.q && !playerDisplayName(r).toLowerCase().includes(refereeFilter.q.toLowerCase())) return false;
    if(refereeFilter.role && normLoose(r.role||"")!==normLoose(refereeFilter.role)) return false;
    if(refereeFilter.country && r.countryRepresentsId!==refereeFilter.country) return false;
    return true;
  }).sort((a,b)=>
    compareGeneric(refereeValue(a,refereeSort.key), refereeValue(b,refereeSort.key), refereeType(refereeSort.key), refereeSort.dir)
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
  // Países presentes entre los árbitros, para el filtro.
  const countryIds = [...new Set(all.map(r=>r.countryRepresentsId).filter(Boolean))]
    .map(id=>({id, name:countryNameById(id)||""}))
    .filter(c=>c.name)
    .sort((a,b)=>a.name.localeCompare(b.name,'es'));

  return `
  <div class="section-title"><h2>${tabLabel('arbitros','Árbitros')}</h2><button class="btn gold sm" data-action="add-referee">+ Agregar árbitro</button></div>
  <div class="searchbar">
    <input type="text" id="referee-q" placeholder="Buscar árbitro..." value="${escapeHtml(refereeFilter.q)}">
    <select id="referee-role-filter">
      <option value="">Todos los roles</option>
      ${REFEREE_ROLES.map(r=>`<option value="${escapeHtml(r)}" ${refereeFilter.role===r?"selected":""}>${escapeHtml(r)}</option>`).join("")}
    </select>
    <select id="referee-country-filter">
      <option value="">Todos los países</option>
      ${countryIds.map(c=>`<option value="${c.id}" ${refereeFilter.country===c.id?"selected":""}>${escapeHtml(c.name)}</option>`).join("")}
    </select>
  </div>
  <div class="tbl-wrap">
    <table>
      <thead><tr>
        ${sortTh("Árbitro","name",refereeSort,"sort-referees")}
        ${sortTh("País","country",refereeSort,"sort-referees")}
        ${sortTh("Edad","age",refereeSort,"sort-referees")}
        ${sortTh("Rol","role",refereeSort,"sort-referees")}
        ${sortTh("Árbitro FIFA desde","fifa",refereeSort,"sort-referees")}
        <th></th>
      </tr></thead>
      <tbody>
      ${filtered.map(r=>{
        const cn = refereeMainCountryName(r);
        return `
        <tr data-action="open-referee" data-id="${r.id}" style="cursor:pointer;">
          <td><img src="${r.photo||personPhotoDefault(r)}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;">${playerDisplayNameHTML(r)}</td>
          <td>${cn?flagIconHTML(cn)+escapeHtml(cn):"—"}</td>
          <td>${playerAge(r)!=null?playerAge(r):'—'}</td>
          <td>${r.role?escapeHtml(r.role):"—"}</td>
          <td class="mono">${r.fifaSince||"—"}</td>
          <td><button class="btn ghost sm" data-action="edit-referee" data-id="${r.id}">Editar</button></td>
        </tr>`;
      }).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--muted);">Sin resultados</td></tr>`}
      </tbody>
    </table>
  </div>
  `;
}

// Fila editable de "Países donde trabaja" — misma mecánica que las filas de nacionalidad.
function refereeWorkRowHTML(name){
  return `
  <div class="referee-work-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <input class="referee-work-name" list="referee-country-list" value="${escapeHtml(name||'')}" placeholder="Escribe o elige un país" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-referee-work-row" style="flex-shrink:0;">✕</button>
  </div>`;
}

function modalAddEditReferee(referee){
  const isEdit = !!referee;
  referee = referee || {id:null, firstName:"", lastName:"", commonName:"", fullName:"", birthDate:null,
    gender:"Masculino", fifaSince:null, nationalityIds:[], countryRepresentsId:null, countryWorksIds:[],
    role:"Árbitro central", previousWorldCups:[], matches:[], photo:null, fullNameLinked:true};
  if(referee.fullNameLinked===undefined) referee.fullNameLinked = !referee.fullName;
  if(referee.shirtNameLinked===undefined) referee.shirtNameLinked = !referee.shirtName;
  if(referee.fullNameLinked) referee.fullName = computeDefaultFullName(referee);
  const nationalityNames = (referee.nationalityIds||[]).map(countryNameById).filter(Boolean);
  const worksNames = (referee.countryWorksIds||[]).map(countryNameById).filter(Boolean);
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar árbitro":"Agregar árbitro"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          ${imageUploadField("Foto del árbitro (opcional)", "rphoto", referee.photo, "Si no subes una, se usa una silueta genérica.")}
          <label class="field">Nombre<input id="f-rfirstname" value="${escapeHtml(referee.firstName||"")}"></label>
          <label class="field">Apellido<input id="f-rlastname" value="${escapeHtml(referee.lastName||"")}"></label>
          <label class="field" style="grid-column:1/-1;">Nombre común (opcional)
            <input id="f-rcommonname" value="${escapeHtml(referee.commonName||"")}" placeholder="Si lo dejas vacío, se usa Nombre + Apellido">
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre completo
            <input id="f-rfullname" value="${escapeHtml(referee.fullName||"")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se forma solo con Nombre + Apellido — si lo cambias a mano, ya no se actualiza solo.</span>
          </label>
          <input type="hidden" id="f-rfullname-linked" value="${referee.fullNameLinked?'1':'0'}">

          <label class="field">Fecha de nacimiento
            <input id="f-rbirth" type="date" value="${referee.birthDate||''}">
            <span id="f-rage-hint" style="font-size:10px;color:var(--muted);font-weight:400;">${referee.birthDate&&computeAge(referee.birthDate)!=null?`Edad: ${computeAge(referee.birthDate)} años`:'Opcional — de aquí se calcula la edad.'}</span>
          </label>
          <label class="field">Género
            <select id="f-rgender">
              ${REFEREE_GENDERS.map(g=>`<option value="${g}" ${g===(referee.gender||"Masculino")?"selected":""}>${g}</option>`).join("")}
            </select>
          </label>

          <div class="subhead">Nacionalidades</div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Nacionalidades
            <div id="nationality-rows">
              ${(nationalityNames.length?nationalityNames:[""]).map(n=>nationalityRowHTML(n)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="add-nationality-row">+ Agregar nacionalidad</button></div>
            <datalist id="nation-list">${datalistOptions(sortedCountries().map(c=>c.commonName))}</datalist>
          </div>
          <label class="field" style="grid-column:1/-1;">País que representa
            <select id="f-r-represents">
              <option value="">— Sin definir —</option>
              ${(referee.nationalityIds||[]).map(id=>{ const c=(DB.countries||[]).find(x=>x.id===id); return c?`<option value="${c.id}" ${referee.countryRepresentsId===c.id?"selected":""}>${escapeHtml(c.commonName)}</option>`:""; }).join("")}
            </select>
            <span style="font-size:11px;color:var(--muted);font-weight:400;">Solo puede representar a una de sus nacionalidades — esa es la que se muestra como su nacionalidad. Si falta alguna, agrégala arriba y guarda.</span>
          </label>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Países donde trabaja
            <div id="referee-work-rows">
              ${(worksNames.length?worksNames:[""]).map(n=>refereeWorkRowHTML(n)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="add-referee-work-row">+ Agregar país</button></div>
            <datalist id="referee-country-list">${datalistOptions(sortedCountries().map(c=>c.commonName))}</datalist>
          </div>

          <div class="subhead">Arbitraje</div>
          <label class="field">Rol
            <select id="f-r-role">
              ${REFEREE_ROLES.map(r=>`<option value="${escapeHtml(r)}" ${normLoose(r)===normLoose(referee.role||"")?"selected":""}>${escapeHtml(r)}</option>`).join("")}
            </select>
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre en camiseta (árbitro)
            <input id="f-r-shirtname" maxlength="50" value="${escapeHtml(refereeShirtName(referee))}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se actualiza solo con el apellido en mayúsculas — si lo cambias a mano, ya no.</span>
          </label>
          <input type="hidden" id="f-r-shirtname-linked" value="${referee.shirtNameLinked===false?'0':'1'}">
          <label class="field">Internacional FIFA desde (año)
            <input id="f-r-fifasince" type="number" min="1900" max="2100" value="${referee.fifaSince!=null?referee.fifaSince:''}" placeholder="Ej: 2013">
          </label>
          <label class="field" style="grid-column:1/-1;">Copas del Mundo anteriores
            <input id="f-r-wcs" value="${escapeHtml((referee.previousWorldCups||[]).join(', '))}" placeholder="Separadas por comas. Ej: 2018, 2022">
          </label>
          <label class="field" style="grid-column:1/-1;">Partidos en los que participa
            <input id="f-r-matches" value="${escapeHtml(refereeMatchNumbers(referee).join(', '))}" placeholder="Números del 1 al 104, separados por comas. Ej: 21, 67">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Del 1 al 104, en el orden oficial del torneo. Se ignoran los números fuera de ese rango.</span>
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-referee" data-id="${referee.id||''}">Guardar</button>
      </div>
    </div>
  `);
}
