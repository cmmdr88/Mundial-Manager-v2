/* =========================================================
   COPA MANAGER 2026 — funciones/clubes.js
   Modelo de clubes (con múltiples estadios) y ligas: constructores por
   defecto, unión "por nombre" (clubKey/getClubByName/ensureClubObject/
   matchOrAddClub), ligas, jugadores/ratings del club, ordenación, vistas
   (lista y detalle) y modal. Extracción mecánica: texto y orden idénticos
   al original. Script CLÁSICO (no module). Cargar DESPUÉS de
   datos/constantes.js (CLUB_SEED_DATA), core/utilidades.js (normLoose,
   newClubId, isRegistered, avgRating, compareGeneric, sortTh),
   app/textos-ui.js (tabLabel, tabDescHTML), funciones/estadios.js
   (clubStadiumRowHTML, stadiumLinkName, stadiumDisplayName) y app/modales.js
   (openModal, imageUploadField, detailNavHTML), y ANTES del <script> inline.
   Usa en tiempo de ejecución DB, colorPickerHTML y el estado clubsSort/
   clubFilter (que permanecen en el inline). No llama a jugadores/selecciones/
   patrocinadores (sin ciclo). Incluye clubValue/clubValType (helpers propios
   no listados explícitamente en el plan).
   ========================================================= */

// ---------- Modelo de Clubes ----------
// Los clubes pasan de ser simples etiquetas de texto a objetos con datos propios. DB.clubs sigue siendo
// la lista de NOMBRES (para compatibilidad con datalists y el string p.club de cada jugador), y
// DB.clubsData guarda el objeto completo por nombre común. DB.leagues es el catálogo de ligas (etiquetas).
function clubKey(name){ return normLoose(name||""); }
function getClubByName(name){
  if(!name) return null;
  const key = clubKey(name);
  return (DB.clubsData||[]).find(c=> clubKey(c.commonName)===key || (c.aliases||[]).some(a=>clubKey(a)===key)) || null;
}
function ensureClubObject(name){
  const nm = (name||"").trim();
  if(!nm) return null;
  let c = getClubByName(nm);
  if(c) return c;
  const seed = CLUB_SEED_DATA[nm] || null;
  c = {
    id:newClubId(), fullName:"", officialName:"", commonName:nm.slice(0,50), shortName:nm.slice(0,30),
    code:"", codeAlt:"", nicknames:[], city:"", country: seed?seed[0]:"", league: seed?seed[1]:"",
    logoImg:null, color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", stadium:"", stadiums:[], trainingGround:"", founded:null, kitSponsor:""
  };
  if(!DB.clubsData) DB.clubsData = [];
  DB.clubsData.push(c);
  if(seed && seed[1]) ensureLeague(seed[1]);
  return c;
}
function ensureLeague(name){
  const nm=(name||"").trim(); if(!nm) return "";
  if(!DB.leagues) DB.leagues=[];
  const hit = DB.leagues.find(l=>normLoose(l)===normLoose(nm));
  if(hit) return hit;
  DB.leagues.push(nm); DB.leagues.sort();
  return nm;
}
function matchOrAddLeague(raw){ return ensureLeague(raw); }
function buildDefaultClubsData(names){
  return (names||[]).map(nm=>{
    const seed = CLUB_SEED_DATA[nm] || null;
    return {
      id:newClubId(), fullName:"", officialName:"", commonName:nm.slice(0,50), shortName:nm.slice(0,30),
      code:"", codeAlt:"", nicknames:[], city:"", country: seed?seed[0]:"", league: seed?seed[1]:"",
      logoImg:null, color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", stadium:"", stadiums:[], trainingGround:"", founded:null, kitSponsor:""
    };
  });
}
function buildDefaultLeagues(names){
  const set = new Set();
  (names||[]).forEach(nm=>{ const seed = CLUB_SEED_DATA[nm]; if(seed && seed[1]) set.add(seed[1]); });
  return [...set].sort();
}
function clubDisplayName(c){ return (c.commonName||"").trim() || "Club"; }
// Jugadores que pertenecen a un club (por su string p.club).
function clubPlayers(club){
  const key = clubKey(club.commonName);
  const names = new Set([clubKey(club.commonName), ...(club.aliases||[]).map(clubKey)]);
  const out=[];
  DB.teams.forEach(t=> t.players.forEach(p=>{ if(p.club && names.has(clubKey(p.club))) out.push({...p, _teamName:t.commonName, _teamId:t.id}); }));
  return out;
}
// Rubros OVR/ATT/MID/DEF de un club, con la misma lógica que selecciones (solo inscritos = con dorsal).
function clubRatings(club){
  const reg = clubPlayers(club).filter(isRegistered);
  return { overall:avgRating(reg), ataque:avgRating(reg.filter(p=>p.pos==="FW")),
           medio:avgRating(reg.filter(p=>p.pos==="MF")), defensa:avgRating(reg.filter(p=>p.pos==="DF"||p.pos==="GK")) };
}

// Devuelve el nombre canónico de un club existente si coincide de forma laxa; si no, lo agrega tal cual.
function matchOrAddClub(raw){
  const name = (raw||"").trim();
  if(!name) return "";
  const key = normLoose(name);
  const hit = DB.clubs.find(c=>normLoose(c)===key);
  if(hit){ ensureClubObject(hit); return hit; }
  DB.clubs.push(name);
  ensureClubObject(name);
  return name;
}

function addClub(name){
  name = (name||"").trim();
  if(!name) return;
  if(!DB.clubs.some(c=>c.toLowerCase()===name.toLowerCase())) DB.clubs.push(name);
}

/* ---------- CLUBES ---------- */
function clubCrestHTML(c, extraStyle){
  if(c.logoImg){
    return `<div class="crest-mini has-img" style="${extraStyle||''}"><img src="${c.logoImg}" alt="${clubDisplayName(c)}"></div>`;
  }
  return `<div class="crest-mini" style="background:linear-gradient(160deg, ${c.color1||'#4F46E5'}, ${c.color2||'#15161D'});${extraStyle||''}">${c.code||initials(clubDisplayName(c))}</div>`;
}
function leagueBadge(league){
  return league ? `<span class="badge conf">${escapeHtml(league)}</span>` : `<span class="badge conf" style="opacity:.6;">Sin liga</span>`;
}
function clubCardHTML(c){
  const r = clubRatings(c);
  const nPlayers = clubPlayers(c).length;
  return `
  <div class="card team-card" data-action="open-club" data-id="${c.id}">
    <div class="team-card-top">
      ${clubCrestHTML(c, c.logoImg ? "width:50px;height:50px;" : "")}
      <div class="meta">
        <div class="name">${escapeHtml(clubDisplayName(c))}</div>
        <div class="sub">
          ${c.country?`<span class="badge conf">${escapeHtml(c.country)}</span>`:""}
          ${leagueBadge(c.league)}
          <span class="badge ${nPlayers>0?'ok':'incomplete'}">${nPlayers} jug.</span>
        </div>
      </div>
    </div>
    <div class="team-card-bottom">
      <div class="kit-swatch" title="Colores del club">
        <span class="kit-dot" style="background:${c.color1||'#4F46E5'};"></span>
        <span class="kit-dot" style="background:${c.color2||'#15161D'};"></span>
      </div>
      <div class="rating">${r.overall!=null?r.overall:"—"}</div>
    </div>
  </div>`;
}

function clubValue(c, key){
  switch(key){
    case "name": return clubDisplayName(c).toLowerCase();
    case "city": return (c.city||"~").toLowerCase();
    case "country": return (c.country||"~").toLowerCase();
    case "league": return (c.league||"~").toLowerCase();
    case "players": return clubPlayers(c).length;
    case "ovr": { const r=clubRatings(c); return r.overall!=null?r.overall:-1; }
    default: return "";
  }
}
function clubValType(key){ return (key==="players"||key==="ovr") ? "number" : "string"; }
function orderedClubs(){
  return (DB.clubsData||[]).slice().sort((a,b)=>
    compareGeneric(clubValue(a,clubsSort.key), clubValue(b,clubsSort.key), clubValType(clubsSort.key), clubsSort.dir)
    || clubDisplayName(a).localeCompare(clubDisplayName(b),'es',{sensitivity:'base'}));
}
function renderClubes(){
  if(activeClubId) return renderClubDetail(activeClubId);
  const q = normLoose(clubFilter.q);
  const list = orderedClubs().filter(c=>{
    if(clubFilter.country && c.country!==clubFilter.country) return false;
    if(clubFilter.league && c.league!==clubFilter.league) return false;
    if(q){
      const hay = normLoose(clubDisplayName(c)) + " " + normLoose(c.fullName||"") + " " + normLoose(c.officialName||"") + " " + normLoose(c.code||"");
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  const countries = [...new Set((DB.clubsData||[]).map(c=>c.country).filter(Boolean))].sort();
  const leagues = [...new Set((DB.clubsData||[]).map(c=>c.league).filter(Boolean))].sort();
  return `
  <div class="section-title"><h2>${tabLabel('clubes','Clubes')}</h2><span class="hint">${(DB.clubsData||[]).length} clubes</span></div>
  ${tabDescHTML('clubes')}
  <div class="searchbar">
    <input type="text" id="club-q" placeholder="Buscar club..." value="${escapeHtml(clubFilter.q)}">
    <select id="club-country-filter">
      <option value="">Todos los países</option>
      ${countries.map(c=>`<option value="${escapeHtml(c)}" ${clubFilter.country===c?"selected":""}>${escapeHtml(c)}</option>`).join("")}
    </select>
    <select id="club-league-filter">
      <option value="">Todas las ligas</option>
      ${leagues.map(l=>`<option value="${escapeHtml(l)}" ${clubFilter.league===l?"selected":""}>${escapeHtml(l)}</option>`).join("")}
    </select>
    <button class="btn gold sm" data-action="add-club">+ Club</button>
  </div>
  <div class="tbl-wrap">
    <table>
      <thead><tr>
        ${sortTh("Club","name",clubsSort,"sort-clubs")}
        ${sortTh("Ciudad","city",clubsSort,"sort-clubs")}
        ${sortTh("País","country",clubsSort,"sort-clubs")}
        ${sortTh("Liga","league",clubsSort,"sort-clubs")}
        ${sortTh("Jug.","players",clubsSort,"sort-clubs")}
        ${sortTh("OVR","ovr",clubsSort,"sort-clubs")}
      </tr></thead>
      <tbody>
      ${list.map(c=>{ const r=clubRatings(c); const n=clubPlayers(c).length; return `
        <tr data-action="open-club" data-id="${c.id}" style="cursor:pointer;">
          <td style="display:flex;align-items:center;gap:8px;">${clubCrestHTML(c, "width:24px;height:24px;font-size:9px;")}<b>${escapeHtml(clubDisplayName(c))}</b></td>
          <td>${c.city?escapeHtml(c.city):"—"}</td>
          <td>${c.country?escapeHtml(c.country):"—"}</td>
          <td>${c.league?`<span class="badge conf">${escapeHtml(c.league)}</span>`:"—"}</td>
          <td class="mono">${n}</td>
          <td class="mono" style="color:var(--indigo);font-weight:700;">${r.overall!=null?r.overall:"—"}</td>
        </tr>`; }).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--muted);">Sin resultados</td></tr>`}
      </tbody>
    </table>
  </div>`;
}
function renderClubDetail(clubId){
  const c = (DB.clubsData||[]).find(x=>x.id===clubId);
  if(!c){ activeClubId=null; return renderClubes(); }
  ensureTeamKits(c);
  const r = clubRatings(c);
  const players = clubPlayers(c);
  const ordered = orderedClubs();
  const idx = ordered.findIndex(x=>x.id===c.id);
  const sortedPlayers = players.slice().sort((a,b)=>
    compareGeneric(playerValue(a,squadSort.key), playerValue(b,squadSort.key), playerType(squadSort.key), squadSort.dir)
    || playerDisplayName(a).localeCompare(playerDisplayName(b)));
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-clubes">← Volver</button>
    ${detailNavHTML('nav-club-arrow', idx, ordered.length)}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    ${clubCrestHTML(c, c.logoImg ? "width:150px;height:150px;" : "width:150px;height:150px;font-size:32px;")}
    <div style="flex:1;min-width:200px;">
      <h2 style="margin:0 0 2px;">${escapeHtml(clubDisplayName(c))}</h2>
      ${c.fullName ? `<div style="font-size:12px;color:var(--muted);margin-bottom:4px;">${escapeHtml(c.fullName)}</div>` : ""}
      <div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${c.founded ? `<span>Fundado en ${escapeHtml(String(c.founded))}</span>` : ""}
        ${c.founded && ((c.stadiums&&c.stadiums.length)||c.stadium) ? `<span style="color:var(--muted);font-weight:400;">·</span>` : ""}
        ${((c.stadiums&&c.stadiums.length)?c.stadiums:(c.stadium?[c.stadium]:[])).map(nm=>`<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${escapeHtml(nm)}</span>`).join("")}
      </div>
      <div class="tag-list" style="margin-top:4px;">
        ${c.country ? `<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${escapeHtml(c.country)}</span>` : ""}
        ${leagueBadge(c.league)}
        <span class="badge ${players.length>0?'ok':'incomplete'}">${players.length} jugadores</span>
      </div>
    </div>
    ${ratingBlockHTML(r)}
    <div style="display:flex;flex-direction:column;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-club" data-id="${c.id}">Editar club</button>
      <button class="btn danger sm" data-action="delete-club" data-id="${c.id}">Eliminar</button>
    </div>
  </div>

  <div class="section-title"><h2>Uniformes</h2></div>
  <div class="card" style="display:flex;gap:18px;align-items:center;flex-wrap:wrap;margin-bottom:14px;">
    <div style="flex:2;min-width:240px;display:flex;gap:14px;justify-content:flex-start;flex-wrap:wrap;">
      ${(c.kits||[]).filter(k=>k.category==="jugador").slice(0,3).map(k=>`
        <div class="kit-render" data-pending data-team-id="${c.id}" data-kit-id="${k.id}" data-action="edit-kit" data-team="${c.id}" data-id="${k.id}"
             style="width:110px;height:110px;background:var(--surface-2);border-radius:10px;cursor:pointer;flex-shrink:0;"></div>
      `).join("") || `<span style="font-size:13px;color:var(--muted);align-self:center;">Sin uniformes todavía</span>`}
    </div>
    <div style="flex:1;min-width:160px;border-left:1px solid var(--line);padding-left:18px;">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:4px;">Patrocinador de ropa</div>
      ${c.kitSponsor ? `<span class="badge brand">${escapeHtml(c.kitSponsor)}</span>` : `<span style="font-size:13px;color:var(--muted);">Sin definir</span>`}
      <div style="margin-top:10px;">
        <button class="btn ghost sm" data-action="manage-kits" data-team="${c.id}">Editar uniformes</button>
      </div>
    </div>
  </div>

  <div class="section-title"><h2>Plantilla</h2></div>
  ${players.length===0 ? `<div class="empty"><h3>Sin jugadores</h3><p>Los jugadores aparecen aquí cuando su club coincide con este.</p></div>` : `
  <div class="squad-sortbar">
    <span class="squad-sortbar-label">Ordenar</span>
    ${squadSortChip("#","number")}
    ${squadSortChip("Jugador","name")}
    ${squadSortChip("Pos","pos")}
    ${squadSortChip("Edad","age")}
    ${squadSortChip("Rating","rating")}
  </div>
  <div class="card">
    ${sortedPlayers.map(p=>`
      <div class="player-row" data-action="open-player" data-id="${p.id}" style="cursor:pointer;">
        <span class="num-badge">${p.number!=null?p.number:"–"}</span>
        <span class="pos-chip pos-${p.pos}">${p.pos}</span>
        <span class="pname"><img src="${p.photo||PLAYER_PHOTO_DEFAULT}" style="width:18px;height:18px;border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:6px;flex-shrink:0;">${playerDisplayNameHTML(p)}</span>
        <span class="pmeta">${playerAgeText(p)} · ${(()=>{
          const country = playerCountryName(p) || "Sin país";
          const calledUp = p._teamId && p.number!=null && p.number>0;
          const sn = calledUp ? ` <span class="badge" style="background:rgba(109,99,245,0.16);color:var(--indigo-bright);font-size:9px;padding:1px 5px;" title="Seleccionado nacional (convocado con dorsal)">SN</span>` : "";
          const countryTag = calledUp
            ? `<span class="club-chip tag-clickable" data-action="open-team" data-id="${p._teamId}">${escapeHtml(country)}</span>`
            : `<span class="club-chip">${escapeHtml(country)}</span>`;
          return countryTag + sn;
        })()}</span>
        <span class="prating">${p.rating}</span>
      </div>
    `).join("")}
  </div>`}
  `;
}

function modalAddEditClub(club){
  const isEdit = !!club;
  club = club || {id:null, fullName:"", officialName:"", commonName:"", shortName:"", code:"", codeAlt:"",
    nicknames:[], city:"", country:"", league:"", logoImg:"", color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF",
    stadium:"", stadiums:[], trainingGround:"", kitSponsor:""};
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar club":"Agregar club"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="subhead">Nombres</div>
          <label class="field" style="grid-column:1/-1;">Nombre legal
            <input id="f-cl-fullname" value="${escapeHtml(club.fullName||'')}" placeholder="Sin límite de caracteres">
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre oficial
            <input id="f-cl-officialname" value="${escapeHtml(club.officialName||'')}" placeholder="Sin límite de caracteres">
          </label>
          <label class="field" style="grid-column:1/-1;">Nombre común (máx. 50)
            <input id="f-cl-commonname" value="${escapeHtml(club.commonName||'')}" maxlength="50" placeholder="El que se usa en casi todo">
          </label>
          <label class="field">Nombre corto (máx. 30)
            <input id="f-cl-shortname" value="${escapeHtml(club.shortName||'')}" maxlength="30" placeholder="Versión corta">
          </label>
          <label class="field">Nombre de tres letras
            <input id="f-cl-code" value="${escapeHtml(club.code||'')}" maxlength="7" placeholder="Para marcadores (máx. 7)">
          </label>
          <label class="field">Nombre de tres letras alternativo
            <input id="f-cl-codealt" value="${escapeHtml(club.codeAlt||'')}" maxlength="7" placeholder="Alternativo (máx. 7)">
          </label>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Artículo
            <div style="display:flex;align-items:center;gap:8px;">
              <select id="f-cl-article" style="width:130px;flex-shrink:0;">
                ${ARTICLE_OPTIONS.map(a=>`<option value="${a.value}" ${a.value===(club.article||"")?"selected":""}>${a.label}</option>`).join("")}
              </select>
              <input value="${escapeHtml(club.commonName||'Nombre del club')}" disabled style="flex:1;opacity:.7;" id="f-cl-article-name-echo">
            </div>
            <div id="f-cl-article-examples" style="font-size:10px;color:var(--muted);font-weight:400;font-style:italic;line-height:1.5;margin-top:4px;">
              ${escapeHtml(clubArticleExamples(club.article||"", club.commonName||"Equipo").join("  ·  "))}
            </div>
          </div>

          <div class="subhead">Apodos</div>
          <div style="grid-column:1/-1;">
            <div id="nicknames-rows">
              ${(club.nicknames && club.nicknames.length ? club.nicknames : [{article:"",name:""}]).map(n=>nicknameRowHTML(n.article,n.name)).join("")}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:11px;color:var(--muted);">${T('team.nicknames.hint')}</span>
              <button type="button" class="btn ghost sm" data-action="add-nickname-row">${T('team.nicknames.addButton')}</button>
            </div>
          </div>

          <div class="subhead">Ubicación</div>
          <label class="field">Ciudad
            <input id="f-cl-city" value="${escapeHtml(club.city||'')}" placeholder="Ciudad del club">
          </label>
          <label class="field">País
            <input id="f-cl-country" list="country-name-list" value="${escapeHtml(club.country||'')}" placeholder="País del club">
            <datalist id="country-name-list">${(DB.countries||[]).map(c=>`<option value="${escapeHtml(c.commonName)}">`).join("")}</datalist>
          </label>
          <label class="field" style="grid-column:1/-1;">Liga
            <input id="f-cl-league" list="league-list" value="${escapeHtml(club.league||'')}" placeholder="Liga donde juega">
            <datalist id="league-list">${(DB.leagues||[]).map(l=>`<option value="${escapeHtml(l)}">`).join("")}</datalist>
          </label>

          <div class="subhead">Escudo</div>
          ${imageUploadField("Escudo del club", "cl-logo", club.logoImg, "PNG o JPG. Cuadrado se ve mejor.")}

          <div class="subhead">Colores del club</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", club.color1||'#4F46E5', "f-cl-color1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", club.color2||'#15161D', "f-cl-color2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", club.color3||'#FFFFFF', "f-cl-color3")}</label>
          </div>

          <div class="subhead">Instalaciones</div>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Estadios (en orden de importancia)
            <div id="club-stadium-rows">
              ${(((club.stadiums&&club.stadiums.length)?club.stadiums:(club.stadium?[club.stadium]:[""]))).map(n=>clubStadiumRowHTML(n)).join("")}
            </div>
            <div>
              <button type="button" class="btn ghost sm" data-action="add-club-stadium-row">+ Agregar estadio</button>
            </div>
            <datalist id="stadium-list-club">
              ${[...new Set((DB.stadiums||[]).map(s=>stadiumLinkName(s)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es')).map(n=>`<option value="${escapeHtml(n)}">`).join("")}
            </datalist>
          </div>
          <label class="field" style="grid-column:1/-1;">Campo de entrenamiento
            <input id="f-cl-training" list="training-list-club" value="${escapeHtml(club.trainingGround||'')}" placeholder="Escribe o elige un campo de entrenamiento">
            <datalist id="training-list-club">${(DB.stadiums||[]).filter(s=>s.isTraining).map(s=>`<option value="${escapeHtml(stadiumDisplayName(s))}">`).join("")}</datalist>
          </label>

          <div class="subhead">Fundación</div>
          <label class="field">Año de fundación
            <input id="f-cl-founded" type="number" min="1800" max="2100" value="${club.founded!=null?club.founded:''}" placeholder="Ej. 1886">
          </label>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-club" data-id="${club.id||''}">Guardar</button>
      </div>
    </div>
  `);
}
