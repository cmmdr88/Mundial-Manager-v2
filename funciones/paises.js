/* =========================================================
   COPA MANAGER 2026 — funciones/paises.js
   Catálogo maestro de países/entidades: constructor por defecto, vínculo
   país↔selección (relink/integrate/buildMinimalTeamFromCountry), búsqueda
   por nombre, nacionalidades, fila y modal. Extracción mecánica: texto y
   orden idénticos al original. Script CLÁSICO (no module). Cargar DESPUÉS de
   datos/constantes.js (COUNTRIES_SEED, etc.), core/utilidades.js (normLoose,
   newId, uid, colorsFor, initials, shiftColor, escapeHtml), app/textos-ui.js
   (T), funciones/confederaciones.js (confBadge) y app/modales.js (openModal),
   y ANTES del <script> inline. Usa en tiempo de ejecución DB, getTeam y
   langRowHTML (que permanecen en el inline). buildMinimalTeamFromCountry
   construye la selección con un literal propio: NO depende de selecciones
   (sin ciclo). Lo consumen selecciones/jugadores/editor/modelo-db/historial.
   ========================================================= */

// Catálogo maestro de países/entidades (306) — incluye activos, no afiliados, dependencias y extintos.
// Las que ya están integradas como selección completa en DB.teams (mismo código FIFA) se excluyen
// automáticamente para no duplicar información.
function buildDefaultCountries(teamsList){
  const teamByFifa = {};
  (teamsList||[]).forEach(t=>{ teamByFifa[t.fifaCode] = t.id; });
  return COUNTRIES_SEED.map(row => ({
    id: uid(),
    commonName: row[0],
    iocCode: row[1],
    fifaCode: row[2],
    parentOrStatus: row[3],
    conf: row[4],
    fifaAffiliated: !!row[5],
    iocAffiliated: !!row[6],
    officialLanguages: [],
    secondaryLanguages: [],
    teamLinks: { absoluta: teamByFifa[row[2]] || null }
  }));
}
// Sincroniza cada país con su selección absoluta (por código FIFA) sin borrar nunca el país del catálogo.
// Se ejecuta cada vez que cambian las selecciones (alta, baja o importación de JSON) para que nunca quede desfasado.
function relinkCountriesToTeams(){
  if(!DB.countries) return;
  const teamByFifa = {};
  DB.teams.forEach(t=>{ teamByFifa[t.fifaCode] = t.id; });
  DB.countries.forEach(c=>{
    if(!c.teamLinks) c.teamLinks = {absoluta:null};
    c.teamLinks.absoluta = teamByFifa[c.fifaCode] || null;
  });
}
// Construye una selección mínima (solo nombre + códigos + colores derivados) a partir de un país.
// Se usa tanto para la creación masiva (countries sin selección con confederación) como para el
// botón individual "+ Agregar selección" dentro del editor de un país.
function buildMinimalTeamFromCountry(c){
  const [col1,col2] = colorsFor(c.commonName, c.conf);
  const fifaCode = (c.fifaCode || initials(c.commonName)).slice(0,3).toUpperCase();
  // Si el país no tenía código FIFA propio, se le asigna el recién generado — si no, el vínculo
  // país↔selección nunca podría completarse (relinkCountriesToTeams empareja por fifaCode).
  if(!c.fifaCode) c.fifaCode = fifaCode;
  return {
    id: newId("t"),
    officialName: c.commonName, commonName: c.commonName.slice(0,50), shortName: c.commonName.slice(0,30),
    fifaCode, iocCode: (c.iocCode && c.iocCode!==fifaCode) ? c.iocCode : null,
    federationName: null, federationAbbr: null, nicknames: [],
    conf: c.conf, group: "", host: false,
    color1: col1, color2: col2, awayColor1: shiftColor(col2,60), awayColor2: shiftColor(col1,-20),
    kitSponsor: null, logoImg: null, kitHomeImg: null, kitAwayImg: null,
    fifaPoints: null, eloRating: null,
    players: [], kits: []
  };
}
// Crea una selección mínima (solo nombre + códigos) para cada país con confederación que aún no tenga una,
// y vuelve a ligar el catálogo. Funciona sobre los arreglos que se le pasen (sirve tanto para los datos
// por defecto como para DB.teams/DB.countries ya cargados).
function integrateTeamsFromCountries(teamsArr, countriesArr){
  const missing = countriesArr.filter(c=>c.conf && !(c.teamLinks && c.teamLinks.absoluta));
  missing.forEach(c=>{ teamsArr.push(buildMinimalTeamFromCountry(c)); });
  const teamByFifa = {};
  teamsArr.forEach(t=>{ teamByFifa[t.fifaCode] = t.id; });
  countriesArr.forEach(c=>{
    if(!c.teamLinks) c.teamLinks = {absoluta:null};
    c.teamLinks.absoluta = teamByFifa[c.fifaCode] || null;
  });
  return missing.length;
}
function findOrCreateCountryByName(name){
  name = (name||"").trim();
  if(!name) return null;
  const existing = DB.countries.find(c=>c.commonName.toLowerCase()===name.toLowerCase());
  if(existing) return existing.id;
  const c = {id:newId("co"), commonName:name, iocCode:null, fifaCode:null, parentOrStatus:null, conf:null, fifaAffiliated:false, iocAffiliated:false, teamLinks:{absoluta:null}};
  DB.countries.push(c);
  return c.id;
}
function countryNameById(id){
  const c = DB.countries && DB.countries.find(c=>c.id===id);
  return c ? c.commonName : "";
}
// Busca un país por su nombre común SIN crearlo (a diferencia de findOrCreateCountryByName).
function findCountryByName(name){
  const key = (name||"").trim().toLowerCase();
  if(!key) return null;
  return (DB.countries||[]).find(c=>c.commonName.toLowerCase()===key) || null;
}
// Reconstruye las opciones del select "declara elegibilidad" para que solo contenga las nacionalidades
// que el jugador tiene cargadas en ese momento (se actualiza en vivo al editar las filas).
function refreshDeclaredForOptions(){
  const sel = document.getElementById("f-pdeclared");
  if(!sel) return;
  const seen = new Set();
  const nats = [];
  [...document.querySelectorAll("#nationality-rows .nationality-name")].forEach(inp=>{
    const c = findCountryByName(inp.value);
    if(c && !seen.has(c.id)){ seen.add(c.id); nats.push(c); }
  });
  const current = sel.value;
  sel.innerHTML = `<option value="">${T('player.declaredFor.none')}</option>`
    + nats.map(c=>`<option value="${c.id}">${(c.teamLinks&&c.teamLinks.absoluta)?"✓ ":""}${escapeHtml(c.commonName)}</option>`).join("");
  sel.value = seen.has(current) ? current : "";
}
// País del jugador (su nacionalidad principal). NO es lo mismo que la selección en la que está inscrito:
// un jugador puede tener la nacionalidad de un país sin formar parte de su selección. Toma la primera
// nacionalidad; si no hay, cae al país por el que está declarado.
function playerCountryName(p){
  if(p.nationalityIds && p.nationalityIds.length){
    const nm = countryNameById(p.nationalityIds[0]);
    if(nm) return nm;
  }
  if(p.declaredForCountryId){
    const nm = countryNameById(p.declaredForCountryId);
    if(nm) return nm;
  }
  return "";
}
function sortedCountries(){
  return DB.countries.slice().sort((a,b)=>a.commonName.localeCompare(b.commonName));
}

function countryRowHTML(c){
  const search = (c.commonName+" "+(c.fifaCode||"")+" "+(c.iocCode||"")+" "+(c.conf||"")).toLowerCase();
  const teamId = c.teamLinks && c.teamLinks.absoluta;
  const team = teamId ? getTeam(teamId) : null;
  return `
  <tr data-search="${search}">
    <td><b>${c.commonName}</b></td>
    <td class="mono">${c.fifaCode||"—"}</td>
    <td class="mono">${c.iocCode||"—"}</td>
    <td>${c.conf ? confBadge(c.conf) : `<span style="color:var(--muted);">—</span>`}</td>
    <td style="text-align:center;"><input type="checkbox" data-action="toggle-country-fifa" data-id="${c.id}" ${c.fifaAffiliated?"checked":""} style="width:auto;"></td>
    <td style="text-align:center;"><input type="checkbox" data-action="toggle-country-ioc" data-id="${c.id}" ${c.iocAffiliated?"checked":""} style="width:auto;"></td>
    <td>${team ? `<span class="badge ok" data-action="open-team-from-rank" data-id="${team.id}" style="cursor:pointer;">✓ ${team.commonName}</span>` : `<button class="btn gold sm" data-action="create-team-from-country" data-id="${c.id}">+ Selección</button>`}</td>
    <td style="font-size:12px;color:var(--muted);">${c.parentOrStatus||"—"}</td>
    <td style="white-space:nowrap;">
      <button class="btn ghost sm" data-action="edit-country" data-id="${c.id}">Editar</button>
      <button class="btn danger sm" data-action="delete-country" data-id="${c.id}">✕</button>
    </td>
  </tr>`;
}

// Fila editable de nacionalidad en el modal de jugador — cada una autocompleta con los países de la
// base de datos conforme se escribe (igual que los demás campos). Se pueden agregar varias.
function nationalityRowHTML(value){
  return `
  <div class="nationality-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <input class="nationality-name" list="nation-list" value="${escapeHtml(value||'')}" placeholder="${T('player.nationalities.placeholder')}" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-nationality-row" style="flex-shrink:0;">✕</button>
  </div>`;
}

function modalAddEditCountry(country){
  const isEdit = !!country;
  country = country || {id:null, commonName:"", iocCode:"", fifaCode:"", parentOrStatus:"", conf:"", fifaAffiliated:false, iocAffiliated:false, officialLanguages:[], secondaryLanguages:[]};
  const officialLangsText = (country.officialLanguages||[]).join(", ");
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar país / entidad":"Agregar país / entidad"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('country.commonName.label')}<input id="f-c-name" value="${country.commonName||''}"></label>
          <label class="field">${T('country.fifaCode.label')}<input id="f-c-fifa" value="${country.fifaCode||''}" maxlength="3"></label>
          <label class="field">${T('country.iocCode.label')}<input id="f-c-ioc" value="${country.iocCode||''}" maxlength="3"></label>
          <label class="field" style="grid-column:1/-1;">${T('country.parentOrStatus.label')}<input id="f-c-parent" value="${country.parentOrStatus||''}" placeholder="${T('country.parentOrStatus.placeholder')}"></label>
          <label class="field">${T('country.conf.label')}
            <select id="f-c-conf">
              <option value="">${T('country.conf.none')}</option>
              ${CONF_LIST.map(c=>`<option value="${c}" ${c===country.conf?"selected":""}>${c}</option>`).join("")}
            </select>
          </label>
          <label class="field" style="flex-direction:row;align-items:center;gap:8px;">
            <input type="checkbox" id="f-c-fifaafil" style="width:auto;" ${country.fifaAffiliated?"checked":""}> ${T('country.fifaAffiliated.label')}
          </label>
          <label class="field" style="flex-direction:row;align-items:center;gap:8px;">
            <input type="checkbox" id="f-c-iocafil" style="width:auto;" ${country.iocAffiliated?"checked":""}> ${T('country.iocAffiliated.label')}
          </label>

          <div class="subhead">${T('country.section.languages')}</div>
          <label class="field" style="grid-column:1/-1;">${T('country.officialLanguages.label')}
            <input id="f-c-offlangs" value="${officialLangsText}" placeholder="${T('country.officialLanguages.placeholder')}">
          </label>
          <label class="field" style="grid-column:1/-1;">${T('country.secondaryLanguages.label')}</label>
          <div style="grid-column:1/-1;">
            <div id="lang-rows">
              ${(country.secondaryLanguages && country.secondaryLanguages.length ? country.secondaryLanguages : [{name:"",percentage:""}]).map(l=>langRowHTML(l.name,l.percentage)).join("")}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:var(--muted);">${T('country.secondaryLanguages.hint')}</span>
              <button type="button" class="btn ghost sm" data-action="add-lang-row">${T('country.secondaryLanguages.addButton')}</button>
            </div>
          </div>

          ${isEdit ? `
          <div class="subhead">Selección absoluta</div>
          <div style="grid-column:1/-1;">
            ${(()=>{
              const teamId = country.teamLinks && country.teamLinks.absoluta;
              const linkedTeam = teamId ? getTeam(teamId) : null;
              if(linkedTeam){
                return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                  <span class="badge ok">✓ ${linkedTeam.commonName}</span>
                  <button type="button" class="btn ghost sm" data-action="edit-team-from-country" data-id="${linkedTeam.id}">Editar selección</button>
                </div>`;
              }
              return `<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                <span style="font-size:12.5px;color:var(--muted);">Este país todavía no tiene una selección absoluta cargada.</span>
                <button type="button" class="btn gold sm" data-action="create-team-from-country" data-id="${country.id}">+ Agregar selección</button>
              </div>
              ${!country.conf ? `<p style="font-size:11px;color:var(--muted);margin:6px 0 0;">Se creará sin confederación asignada (puedes asignarle una después, a esta selección y/o a este país, de forma independiente).</p>` : ""}`;
            })()}
          </div>
          ` : ""}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-country" data-id="${country.id||''}">Guardar</button>
      </div>
    </div>
  `);
}
