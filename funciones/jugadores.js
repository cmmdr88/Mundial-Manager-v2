/* =========================================================
   COPA MANAGER 2026 — funciones/jugadores.js
   Jugadores: helpers de nombre/edad/dorsal, constructor de plantilla (P),
   import masivo, ordenación, listado filtrable, ficha y modal de edición.
   Extracción mecánica: texto y orden idénticos al original (7 zonas; el estado
   playerFilter/bulkImportTeamId/playerSort permanece en el inline). Incluye
   helpers propios no listados en el plan (playerType, playerDefaultDir,
   parseFavNumbers, checkNumberTaken). Script CLÁSICO (no module). Cargar DESPUÉS
   de datos/constantes.js (POS_ORDER, VALID_POS, NUMBER_START_BY_POS, MONTH_NAMES),
   core/utilidades.js (uid, isoDate, escapeHtml, compareGeneric, sortTh, initials),
   app/textos-ui.js (tabLabel), app/modales.js (openModal, imageUploadField,
   detailNavHTML), funciones/paises.js (playerCountryName, nationalityRowHTML) y
   funciones/patrocinadores.js (apparelBrandNames), y ANTES del <script> inline
   (P se usa al evaluar SEED_TEAMS). Usa en tiempo de ejecución DB, getTeam y
   orderedTeamPlayers (selecciones, inline). Sin ciclo de carga: la relación con
   selecciones es en tiempo de render.
   ========================================================= */

// Separa un nombre completo en nombre/apellido — si es una sola palabra (apodos como "Rodri" o
// "Pedri"), se trata como nombre común directamente, ya que así es como se conoce al jugador.
function splitFullName(fullName){
  const parts = (fullName||"").trim().split(/\s+/).filter(Boolean);
  if(parts.length<=1) return {firstName:"", lastName:"", commonName:parts[0]||""};
  return {firstName:parts[0], lastName:parts.slice(1).join(" "), commonName:""};
}
function P(name,pos,age,club,rating){
  const {firstName,lastName,commonName} = splitFullName(name);
  return {id:uid(), firstName, lastName, commonName, fullName:"", pos, age, birthDate:null, club, rating, ratingPotential:null, number:null,
    nationalityIds:[], declaredForCountryId:null, photo:null, caps:null, goalsNational:null, brand:null,
    favNumbersTeam:[], favNumbersClub:[], shirtNameTeam:"", shirtNameClub:"",
    fullNameLinked:true, shirtNameTeamLinked:true, shirtNameClubLinked:true};
}
// Nombre para mostrar de un jugador en todo el juego: el nombre común si tiene uno asignado,
// si no, nombre+apellido completo (con varios respaldos por si algo viniera incompleto).
function playerDisplayName(p){
  if(p.commonName && p.commonName.trim()) return p.commonName.trim();
  const full = `${p.firstName||""} ${p.lastName||""}`.trim();
  if(full) return full;
  return p.name || "Jugador";
}
// Igual que playerDisplayName pero resaltando en negrita el "nombre principal": el nombre común si lo
// tiene; si no, el apellido (el nombre de pila queda en peso normal). Devuelve HTML ya escapado.
function playerDisplayNameHTML(p){
  const esc = escapeHtml;
  const common = (p.commonName||"").trim();
  if(common) return `<b>${esc(common)}</b>`;
  const first = (p.firstName||"").trim();
  const last = (p.lastName||"").trim();
  if(first || last){
    // El nombre de pila va en peso normal explícito (para que se des-enfatice incluso dentro de un
    // encabezado que ya es negrita); el apellido va en negrita como nombre principal.
    const firstPart = first ? `<span style="font-weight:400;">${esc(first)}</span> ` : "";
    const lastPart = last ? `<b>${esc(last)}</b>` : "";
    return (firstPart + lastPart).trim();
  }
  return esc(p.name || "Jugador");
}
// Edad calculada a partir de la fecha de nacimiento (ISO YYYY-MM-DD). Devuelve null si no hay fecha válida.
function computeAge(birthDate){
  if(!birthDate) return null;
  const d = new Date(birthDate);
  if(isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if(m<0 || (m===0 && now.getDate()<d.getDate())) age--;
  return (age>=0 && age<130) ? age : null;
}
// Edad a mostrar: la calculada desde la fecha de nacimiento si existe; si no, la edad guardada (legado).
function playerAge(p){
  const a = computeAge(p.birthDate);
  if(a!=null) return a;
  return (p.age!=null && !isNaN(p.age)) ? p.age : null;
}
function playerAgeText(p){
  const a = playerAge(p);
  return a!=null ? `${a} años` : "Edad s/d";
}
// Fecha a ISO (YYYY-MM-DD) desde año/mes/día numéricos.
// Normaliza una fecha de nacimiento a ISO desde varios formatos comunes de Excel/Sheets.
function parseBirthDate(raw){
  const s = (raw||"").trim()
    .replace(/\s*\(aged\s+\d+\)/i,"")   // quita "(aged 35)" al final
    .trim();
  if(!s) return null;
  // YYYY-MM-DD o YYYY/MM/DD
  let m = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if(m) return isoDate(+m[1], +m[2], +m[3]);
  // DD/MM/YYYY o MM/DD/YYYY
  m = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if(m){
    let a=+m[1], b=+m[2], y=+m[3];
    if(y<100) y += (y>30 ? 1900 : 2000);
    let day, month;
    if(a>12){ day=a; month=b; }
    else if(b>12){ day=b; month=a; }
    else { day=a; month=b; }
    return isoDate(y, month, day);
  }
  // "April 9, 1997"  o  "9 April 1997"
  m = s.match(/^([A-Za-z]+)\s+(\d{1,2})[,\s]+(\d{4})$/);
  if(!m) m = s.match(/^(\d{1,2})\s+([A-Za-z]+)[,\s]+(\d{4})$/);
  if(m){
    const [,p1,p2,p3] = m;
    const tryName = (tok) => MONTH_NAMES[tok.toLowerCase()];
    const mo1 = tryName(p1), mo2 = tryName(p2);
    if(mo1) return isoDate(+p3, mo1, +p2);
    if(mo2) return isoDate(+p3, mo2, +p1);
  }
  // Último recurso: Date.parse (maneja "Apr 9, 1997" etc.)
  const d = new Date(s);
  if(!isNaN(d.getTime())) return isoDate(d.getFullYear(), d.getMonth()+1, d.getDate());
  return null;
}
// Comparación laxa (sin acentos, sin mayúsculas, sin puntuación) para emparejar clubes/marcas
// escritos con pequeñas variaciones ("Atlético" vs "Atletico", "Man. City" vs "Man City").

// Valor por default de "Nombre completo" — siempre Nombre + Apellido, se recalcula en vivo
// mientras "fullNameLinked" sea true (es decir, mientras el usuario no lo haya tocado a mano).
function computeDefaultFullName(p){ return `${p.firstName||""} ${p.lastName||""}`.trim(); }
// Valor por default de "Nombre en camiseta" — nombre común o, en su defecto, apellido, siempre en
// MAYÚSCULAS (sin el propio campo explícito, a diferencia de effectiveShirtName que sí lo prioriza).
// Editable: en cuanto el usuario lo cambie a mano, deja de regenerarse solo (ver shirtName*Linked).
function computeDefaultShirtNameValue(p){
  const v = (p.commonName && p.commonName.trim()) || (p.lastName && p.lastName.trim()) || "";
  return v.toUpperCase();
}

function nextAvailableNumber(team, start){
  const used = new Set(team.players.map(p=>p.number).filter(n=>n!=null));
  for(let n=start;n<=99;n++){ if(!used.has(n)) return n; }
  for(let n=1;n<=99;n++){ if(!used.has(n)) return n; }
  return null;
}
function assignSquadNumbers(team){
  const order = ["GK","DF","MF","FW"];
  order.forEach(pos=>{
    team.players.filter(p=>p.pos===pos && p.number==null && !p.numberUnassigned).forEach(p=>{
      p.number = nextAvailableNumber(team, NUMBER_START_BY_POS[pos]);
    });
  });
}
function suggestNumber(team, pos, excludeId){
  const used = new Set(team.players.filter(p=>p.id!==excludeId).map(p=>p.number).filter(n=>n!=null));
  for(let n=NUMBER_START_BY_POS[pos]||1;n<=99;n++){ if(!used.has(n)) return n; }
  for(let n=1;n<=99;n++){ if(!used.has(n)) return n; }
  return 1;
}

function parseBulkPlayers(text){
  if(!text) return [];
  let lines = text.split(/\r?\n/).map(l=>l.replace(/\s+$/,"")).filter(l=>l.trim().length>0);
  if(lines.length>0){
    const first = lines[0].toLowerCase();
    const looksHeader = !/^\s*\d/.test(lines[0]) &&
      /(dorsal|posici|nombre|apellido|nacimiento|estatura|caps|internacional|goles|club|camiseta|marca|rating|height|birth)/.test(first);
    if(looksHeader) lines = lines.slice(1);
  }
  // Columnas: 0 Dorsal, 1 Pos, 2 Nombre, 3 Apellido, 4 Nombre común, 5 Nombre completo,
  //           6 Fecha nac., 7 Estatura (cm), 8 Caps, 9 Goles sel.,
  //           10 Club, 11 Nombre camiseta sel., 12 Marca, 13 Rating, 14 Rating potencial
  return lines.map(line=>{
    const cols = line.includes("\t") ? line.split("\t") : line.split(",");
    const c = cols.map(x=>(x||"").trim());
    const firstName = c[2] || "";
    const lastName  = c[3] || "";
    if(!firstName && !lastName) return null;
    const numberRaw = c[0];
    const numberVal = parseInt(numberRaw);
    const number         = (!numberRaw || isNaN(numberVal) || numberVal<=0) ? null : Math.min(99, numberVal);
    const numberUnassigned = (!numberRaw || isNaN(numberVal) || numberVal<=0);
    const posRaw      = (c[1]||"").toUpperCase();
    const pos         = VALID_POS.includes(posRaw) ? posRaw : "MF";
    const commonName  = c[4] || "";
    const fullName    = c[5] || "";
    const birthDate   = parseBirthDate(c[6]);
    const height      = numInRange(c[7], 140, 230);
    const caps        = numInRange(c[8], 0, 100000);
    const goalsNational = numInRange(c[9], 0, 100000);
    const club        = c[10] || "";
    const shirtNameTeam = (c[11]||"").slice(0,50);
    const brand       = c[12] || "";
    const rating      = (c[13]!=null && c[13]!=="") ? Math.max(0, Math.min(99, parseInt(c[13])||0)) : null;
    const ratingPotential = (c[14]!=null && c[14]!=="") ? Math.max(0, Math.min(99, parseInt(c[14])||0)) : null;
    return {number, numberUnassigned, pos, firstName, lastName, commonName, fullName, birthDate, height, caps, goalsNational, club, shirtNameTeam, brand, rating, ratingPotential};
  }).filter(Boolean);
}

// Clave de orden por nombre. Se ordena por lo que identifica al jugador en la lista: si tiene un
// nombre común (mononombre/apodo como "Chicharito"), se usa ese; si no, por su APELLIDO; y como
// último respaldo, el nombre visible completo. Así el orden coincide con el nombre que se muestra.
function playerSortName(p){
  if(p.commonName && p.commonName.trim()) return p.commonName.trim();
  if(p.lastName && p.lastName.trim()) return p.lastName.trim();
  return playerDisplayName(p);
}
function playerLastNameKey(p){ return playerSortName(p).toLowerCase(); }

// Busca un jugador por id recorriendo todos los equipos — los jugadores no tienen su propio
// arreglo global, viven dentro de team.players, así que hace falta esta búsqueda.
function getPlayerWithTeam(playerId){
  for(const t of DB.teams){
    const p = t.players.find(pl=>pl.id===playerId);
    if(p) return {player:p, team:t};
  }
  return {player:null, team:null};
}
// Ficha de un jugador — mismo espíritu que renderTeamDetail (foto/datos a la izquierda, foto del
// jugador, rating y botones de edición a la derecha). El contenido se irá llenando después;
// por ahora ya están los campos base (incl. internacionalidades y goles con selección).
function renderPlayerDetail(playerId){
  const {player:p, team} = getPlayerWithTeam(playerId);
  if(!p){ activePlayerId = null; return renderJugadores(); }
  let pIdx = -1, pTotal = 0;
  if(team){
    // La navegación con flechas recorre solo el mismo grupo del jugador: convocados (con dorsal) entre
    // sí, y no convocados (sin dorsal) entre sí.
    const isConvocado = p.number!=null;
    const op = orderedTeamPlayers(team).filter(x=> (x.number!=null)===isConvocado);
    pIdx = op.findIndex(x=>x.id===p.id);
    pTotal = op.length;
  }
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-player-detail">← Volver</button>
    ${team ? detailNavHTML('nav-player-arrow', pIdx, pTotal) : ""}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    <div style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2);flex-shrink:0;">
      <img src="${p.photo||personPhotoDefault(p)}" style="width:100%;height:100%;object-fit:cover;display:block;">
    </div>
    <div style="flex:1;min-width:200px;">
      <h2 style="margin:0 0 2px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
        <span class="num-badge">${p.number!=null?p.number:"–"}</span>
        <span>${playerDisplayNameHTML(p)}</span>
        <span class="pos-chip pos-${p.pos}">${p.pos}</span>
      </h2>
      <div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:6px;">${playerAgeText(p)}${p.height!=null?` · ${p.height} cm`:""} · ${p.club?`<span class="badge conf tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(p.club)}" style="background:var(--surface-2);color:var(--muted);">${clubLogoIconHTML(getClubByName(p.club))}${escapeHtml(p.club)}</span>`:`<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">Sin club</span>`}</div>
      <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:2px;">
        ${(()=>{
          const country = playerCountryName(p);
          if(!country && !team) return `<span style="font-size:13px;color:var(--muted);">Sin selección asignada</span>`;
          const calledUp = team && p.number!=null && p.number>0;
          const natCo = nationalityCountryOf(p);
          const label = personDemonym(p) || country || (team?team.commonName:"");   // gentilicio (masc.) o país
          const flag = flagIconHTML(natCo || country || (team?team.commonName:""));
          // La etiqueta de nacionalidad ya NO enlaza a la selección: bandera + gentilicio, en gris.
          const tag = `<span class="badge" style="background:var(--surface-2);color:var(--muted);">${flag}${escapeHtml(label)}</span>`;
          // El enlace a la selección ahora vive en la etiqueta "Internacional" (solo si está convocado).
          // Mismo tono morado y misma altura que la etiqueta de nacionalidad (ambas .badge conf).
          const intl = calledUp
            ? ` <span class="badge conf tag-clickable" data-action="open-team" data-id="${team.id}" style="cursor:pointer;" title="Convocado a la selección — ver">Internacional</span>`
            : "";
          return tag + intl;
        })()}
        <span style="font-size:13px;color:var(--muted);">Partidos: ${p.caps!=null?p.caps:"-"} / Goles: ${p.goalsNational!=null?p.goalsNational:"-"}</span>
      </div>
      <div style="margin-top:4px;"><span class="badge ${p.brand?'brand':'no-contract'}">${p.brand||'Sin sponsor'}</span></div>
    </div>
    <div class="player-badge-render" data-pending data-player-id="${p.id}" style="width:150px;height:150px;border-radius:12px;overflow:hidden;background:var(--surface-2);flex-shrink:0;align-self:center;"></div>
    <div style="align-self:center;text-align:center;min-width:96px;">
      <div style="font-family:'JetBrains Mono',monospace;font-size:44px;font-weight:800;line-height:1;color:var(--indigo);">${p.rating!=null?p.rating:"-"}</div>
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-top:2px;">Rating</div>
    </div>
    <div style="display:flex;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-player" data-team="${team?team.id:''}" data-id="${p.id}">Editar</button>
      <button class="btn danger sm" data-action="delete-player" data-team="${team?team.id:''}" data-id="${p.id}">Eliminar</button>
    </div>
  </div>
  `;
}

// Orden natural de posiciones (arco → defensa → medio → delantero) para que no se ordene alfabético.
// Clave de orden por edad basada en la FECHA EXACTA de nacimiento: el valor es menor cuanto más
// joven es el jugador (nacido más tarde), así "Edad ↑" muestra primero a los más jóvenes y dos
// jugadores con la misma edad en años se desempatan por quién nació después. Si solo hay edad en
// años (dato antiguo), se aproxima una fecha para poder mezclarlos en el mismo orden.
function playerBirthSortKey(p){
  let t = null;
  if(p.birthDate){ const d = new Date(p.birthDate); if(!isNaN(d.getTime())) t = d.getTime(); }
  if(t==null && p.age!=null && !isNaN(p.age)){
    const approx = new Date(); approx.setFullYear(approx.getFullYear()-p.age);
    t = approx.getTime();
  }
  return t==null ? null : -t;
}
function playerValue(p,key){
  switch(key){
    case "number": return p.number;
    case "name": return playerSortName(p);
    case "pos": return POS_ORDER[p.pos] ?? 99;
    case "teamName": return p.teamName;
    case "country": return playerCountryName(p);
    case "age": return playerBirthSortKey(p);
    case "club": return p.club;
    case "rating": return p.rating;
    default: return null;
  }
}
function playerType(key){ return ["age","rating","number","pos"].includes(key) ? "number" : "string"; }
function playerDefaultDir(key){ return key==="rating" ? "desc" : "asc"; }

function renderJugadores(){
  const all = DB.teams.flatMap(t=>t.players.map(p=>({...p, teamName:t.commonName, teamId:t.id})));
  const filtered = all.filter(p=>{
    if(playerFilter.q && !playerDisplayName(p).toLowerCase().includes(playerFilter.q.toLowerCase())) return false;
    if(playerFilter.nat){ const co=nationalityCountryOf(p); if(!co || co.id!==playerFilter.nat) return false; }
    if(playerFilter.pos && p.pos!==playerFilter.pos) return false;
    return true;
  }).sort((a,b)=>
    compareGeneric(playerValue(a,playerSort.key), playerValue(b,playerSort.key), playerType(playerSort.key), playerSort.dir)
    || playerDisplayName(a).localeCompare(playerDisplayName(b))
  );
  // Nacionalidades presentes entre los jugadores, para el filtro.
  const natOptions = [...new Map(all.map(p=>nationalityCountryOf(p)).filter(Boolean).map(c=>[c.id,c])).values()]
    .sort((a,b)=>a.commonName.localeCompare(b.commonName,'es'));

  // La pestaña Jugadores muestra TODOS los jugadores juntos (convocados y no convocados). La división
  // por convocatoria vive en el perfil de cada selección.
  const b = playerTableBlockHTML(filtered, playerPage, "players-page"); playerPage = b.page;

  return `
  <div class="section-title"><h2>${tabLabel('jugadores','Jugadores')}</h2><span class="hint">${filtered.length} ${filtered.length===1?'jugador':'jugadores'} · mostrando ${b.range}</span></div>
  <div class="searchbar">
    <input type="text" id="player-q" placeholder="Buscar jugador..." value="${playerFilter.q}">
    <select id="player-nat-filter">
      <option value="">Todas las nacionalidades</option>
      ${natOptions.map(c=>`<option value="${c.id}" ${playerFilter.nat===c.id?"selected":""}>${escapeHtml(c.commonName)}</option>`).join("")}
    </select>
    <select id="player-pos-filter">
      <option value="">Todas las posiciones</option>
      ${["GK","DF","MF","FW"].map(p=>`<option value="${p}" ${playerFilter.pos===p?"selected":""}>${p}</option>`).join("")}
    </select>
    <button class="btn gold sm" data-action="add-player" data-team="${playerFilter.team||''}">+ Agregar jugador</button>
  </div>
  ${b.html}
  `;
}

// Encabezados de la tabla de jugadores (compartidos por ambas listas).
function playerTableHeadHTML(){
  return `<thead><tr>
    ${sortTh("Jugador","name",playerSort,"sort-players")}
    ${sortTh("Pos","pos",playerSort,"sort-players")}
    ${sortTh("País","country",playerSort,"sort-players")}
    ${sortTh("Edad","age",playerSort,"sort-players")}
    ${sortTh("Club","club",playerSort,"sort-players")}
    ${sortTh("Rating","rating",playerSort,"sort-players")}
    <th></th>
  </tr></thead>`;
}
function playerRowHTML(p){
  return `
    <tr data-action="open-player" data-id="${p.id}" style="cursor:pointer;">
      <td>${personPhotoHTML(p, "width:18px;height:18px;border-radius:50%;vertical-align:middle;margin-right:6px;")}${playerDisplayNameHTML(p)}</td>
      <td><span class="pos-chip pos-${p.pos}">${p.pos}</span></td>
      <td>${(()=>{const cn=playerCountryName(p);return cn?flagIconHTML(cn)+escapeHtml(cn):"—";})()}</td>
      <td>${playerAge(p)!=null?playerAge(p):'—'}</td>
      <td>${p.club?`<span class="club-chip tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(p.club)}">${clubLogoIconHTML(getClubByName(p.club))}${escapeHtml(p.club)}</span>`:`<span class="club-chip">Sin club</span>`}</td>
      <td class="mono">${p.rating}</td>
      <td><button class="btn ghost sm" data-action="edit-player" data-team="${p.teamId}" data-id="${p.id}">Editar</button></td>
    </tr>`;
}
// Bloque de una lista de jugadores: pager arriba, tabla (con relleno de altura), pager abajo.
function playerTableBlockHTML(list, page, pageAction){
  const pg = paginate(list, page);
  const fillers = pg.pageCount>1 ? (LIST_PAGE_SIZE - pg.items.length) : 0;
  const range = pg.total ? `${pg.start+1}–${pg.start+pg.items.length} de ${pg.total}` : "0";
  const rows = pg.items.map(playerRowHTML).join("") || `<tr><td colspan="7" style="text-align:center;color:var(--muted);">Sin jugadores en esta lista</td></tr>`;
  const html = `
  ${pagerHTML(pg.page, pg.pageCount, pageAction)}
  <div class="tbl-wrap">
    <table>
      ${playerTableHeadHTML()}
      <tbody>
      ${rows}
      ${fillerRowsHTML(fillers, 7)}
      </tbody>
    </table>
  </div>
  ${pagerHTML(pg.page, pg.pageCount, pageAction)}`;
  return { html, page: pg.page, total: pg.total, range };
}

// Convierte un texto "9, 10, 7" en hasta 5 números válidos (0-999), en el mismo orden que los
// escribió el usuario (el orden es importante — son números favoritos en orden de importancia).
function parseFavNumbers(text){
  return (text||"").split(",")
    .map(s=>s.trim()).filter(Boolean)
    .map(s=>parseInt(s)).filter(n=>!isNaN(n) && n>=0 && n<=999)
    .slice(0,5);
}
// Revalida en tiempo real si el dorsal escrito ya lo tiene otro jugador de la convocatoria.
// El 0 (sin dorsal asignado) nunca dispara la advertencia: varios jugadores pueden estar sin número.
function checkNumberTaken(input){
  const warn = document.getElementById("f-pnumber-warning");
  if(!warn) return;
  const team = getTeam(input.dataset.team);
  if(!team){ warn.style.display = "none"; return; }
  const pid = input.dataset.pid || null;
  const val = parseInt(input.value);
  const taken = (val>0) && team.players.some(p=>p.id!==pid && p.number===val);
  warn.style.display = taken ? "" : "none";
}
function modalAddEditPlayer(teamId, player){
  const isEdit = !!player;
  const team = getTeam(teamId);
  // Para un jugador nuevo, el dorsal arranca en 0 (sin asignar). Se puede cambiar en el formulario.
  const teamCountry = teamId ? DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===teamId) : null;
  player = player || {id:null, firstName:"", lastName:"", commonName:"", fullName:"", pos:"MF", age:24, birthDate:null, club:"", rating:70, ratingPotential:null, number:null, numberClub:null, numberUnassigned:true,
    nationalityIds: teamCountry ? [teamCountry.id] : [], declaredForCountryId: teamCountry ? teamCountry.id : null,
    photo:null, caps:null, goalsNational:null, brand:null, favNumbersTeam:[], favNumbersClub:[], shirtNameTeam:"", shirtNameClub:"",
    fullNameLinked:true, shirtNameTeamLinked:true, shirtNameClubLinked:true};
  if(player.fullNameLinked===undefined) player.fullNameLinked = !player.fullName;
  if(player.shirtNameTeamLinked===undefined) player.shirtNameTeamLinked = !player.shirtNameTeam;
  if(player.shirtNameClubLinked===undefined) player.shirtNameClubLinked = !player.shirtNameClub;
  // Mientras estén "vinculados", se recalculan siempre frescos al abrir el editor (por si nombre/
  // apellido/nombre común cambiaron desde la última vez que se guardó).
  if(player.fullNameLinked) player.fullName = computeDefaultFullName(player);
  if(player.shirtNameTeamLinked) player.shirtNameTeam = computeDefaultShirtNameValue(player);
  if(player.shirtNameClubLinked) player.shirtNameClub = computeDefaultShirtNameValue(player);
  const numberTaken = (!team || player.number==null) ? false : (player.id ? team.players.some(p=>p.id!==player.id && p.number===player.number) : team.players.some(p=>p.number===player.number));
  const nationalityNames = (player.nationalityIds||[]).map(countryNameById).filter(Boolean);
  const favNumbersTeamText = (player.favNumbersTeam||[]).join(", ");
  const favNumbersClubText = (player.favNumbersClub||[]).join(", ");
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar jugador":"Agregar jugador"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          ${imageUploadField("Foto del jugador (opcional)", "pphoto", player.photo, "Si no subes una, se usa una silueta genérica.")}
          <label class="field">Nombre<input id="f-pfirstname" value="${(player.firstName||"").replace(/"/g,"&quot;")}"></label>
          <label class="field">Apellido<input id="f-plastname" value="${(player.lastName||"").replace(/"/g,"&quot;")}"></label>
          <label class="field" style="grid-column:1/-1;">Nombre común (opcional)
            <input id="f-pcommonname" value="${(player.commonName||"").replace(/"/g,"&quot;")}" placeholder="Ej. Alisson — si lo dejas vacío, se usa Nombre + Apellido">
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre completo
            <input id="f-pfullname" value="${(player.fullName||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se forma solo con Nombre + Apellido — si lo cambias a mano, ya no se actualiza solo.</span>
          </label>
          <input type="hidden" id="f-pfullname-linked" value="${player.fullNameLinked?'1':'0'}">

          <label class="field">Estatura (cm)
            <input id="f-pheight" type="number" min="140" max="230" value="${player.height!=null?player.height:''}">
          </label>
          <label class="field">${T('player.pos.label')}
            <select id="f-ppos">
              ${["GK","DF","MF","FW"].map(pos=>`<option ${pos===player.pos?"selected":""}>${pos}</option>`).join("")}
            </select>
          </label>

          <label class="field">${T('player.birthDate.label')}
            <input id="f-pbirth" type="date" value="${player.birthDate||''}">
            <span id="f-page-hint" style="font-size:10px;color:var(--muted);font-weight:400;">${player.birthDate&&computeAge(player.birthDate)!=null?`Edad: ${computeAge(player.birthDate)} años`:'Opcional — de aquí se calcula la edad.'}</span>
          </label>
          <label class="field">Género
            <select id="f-pgender">
              ${PERSON_GENDERS.map(g=>`<option value="${g}" ${g===(player.gender||"Masculino")?"selected":""}>${g}</option>`).join("")}
            </select>
          </label>

          <label class="field">${T('player.rating.label')}<input id="f-prating" type="number" min="0" max="99" value="${player.rating}"></label>
          <label class="field">Rating potencial (0-99)<input id="f-prating-potential" type="number" min="0" max="99" value="${player.ratingPotential!=null?player.ratingPotential:''}" placeholder="—"></label>
          <label class="field">${T('player.club.label')}
            <input id="f-pclub" list="club-list" value="${player.club}" placeholder="${T('player.club.placeholder')}">
            <datalist id="club-list">${datalistOptions(DB.clubs.slice().sort((a,b)=>a.localeCompare(b,'es')))}</datalist>
          </label>

          <div class="subhead">${T('player.nationalities.label')}</div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('player.nationalities.label')} (puedes agregar varias)
            <div id="nationality-rows">
              ${(nationalityNames.length?nationalityNames:[""]).map(n=>nationalityRowHTML(n)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="add-nationality-row">+ Agregar nacionalidad</button></div>
            <datalist id="nation-list">${datalistOptions(sortedCountries().map(c=>c.commonName))}</datalist>
          </div>
          <label class="field" style="grid-column:1/-1;">${T('player.declaredFor.label')}
            <select id="f-pdeclared">
              <option value="">${T('player.declaredFor.none')}</option>
              ${(player.nationalityIds||[]).map(id=>{ const c=(DB.countries||[]).find(x=>x.id===id); return c?`<option value="${c.id}" ${player.declaredForCountryId===c.id?"selected":""}>${(c.teamLinks&&c.teamLinks.absoluta)?"✓ ":""}${escapeHtml(c.commonName)}</option>`:""; }).join("")}
            </select>
            <span style="font-size:11px;color:var(--muted);font-weight:400;">Solo puede declarar por una de sus nacionalidades.</span>
          </label>

          <div class="subhead">Estadísticas con la selección</div>
          <label class="field">Internacionalidades (caps)
            <input id="f-pcaps" type="number" min="0" value="${player.caps!=null?player.caps:''}" placeholder="Por llenar después">
          </label>
          <label class="field">Goles con la selección
            <input id="f-pgoalsnat" type="number" min="0" value="${player.goalsNational!=null?player.goalsNational:''}" placeholder="Por llenar después">
          </label>

          <div class="subhead">Dorsales y nombre en camiseta</div>
          <label class="field">Dorsal en selección
            <input id="f-pnumber" type="number" min="0" max="99" value="${player.number!=null?player.number:0}" data-team="${team?team.id:''}" data-pid="${player.id||''}" oninput="checkNumberTaken(this)">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">0 = sin dorsal asignado</span>
          </label>
          <label class="field">Dorsal en club
            <input id="f-pnumber-club" type="number" min="0" max="99" value="${player.numberClub!=null?player.numberClub:0}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">0 = sin dorsal asignado</span>
          </label>
          <p id="f-pnumber-warning" style="grid-column:1/-1;font-size:11.5px;color:#C24A2E;margin:0;${numberTaken?'':'display:none;'}">${T('player.numberTaken.warning')}</p>
          <label class="field">Dorsales favoritos (selección)
            <input id="f-pfavnums-team" value="${favNumbersTeamText}" placeholder="Ej. 9, 10, 7 (hasta 5, en orden)">
          </label>
          <label class="field">Dorsales favoritos (club)
            <input id="f-pfavnums-club" value="${favNumbersClubText}" placeholder="Ej. 9, 10, 7 (hasta 5, en orden)">
          </label>
          <label class="field">Nombre en camiseta (selección)
            <input id="f-pshirtname-team" maxlength="50" value="${(player.shirtNameTeam||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se actualiza solo con el nombre común o el apellido — si lo cambias a mano, ya no.</span>
          </label>
          <input type="hidden" id="f-pshirtname-team-linked" value="${player.shirtNameTeamLinked?'1':'0'}">
          <label class="field">Nombre en camiseta (club)
            <input id="f-pshirtname-club" maxlength="50" value="${(player.shirtNameClub||"").replace(/"/g,"&quot;")}">
            <span style="font-size:10px;color:var(--muted);font-weight:400;">Se actualiza solo con el nombre común o el apellido — si lo cambias a mano, ya no.</span>
          </label>
          <input type="hidden" id="f-pshirtname-club-linked" value="${player.shirtNameClubLinked?'1':'0'}">
          <label class="field" style="grid-column:1/-1;">Marca patrocinadora
            <input id="f-pbrand" list="player-brand-list" value="${(player.brand||"").replace(/"/g,"&quot;")}" placeholder="Escribe o elige una marca">
            <datalist id="player-brand-list"><option value="Sin sponsor">${apparelBrandNames().filter(b=>b.toLowerCase()!=="sin sponsor").map(b=>`<option value="${escapeHtml(b)}">`).join("")}</datalist>
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-player" data-team="${teamId||''}" data-id="${player.id||''}">Guardar</button>
      </div>
    </div>
  `);
}

