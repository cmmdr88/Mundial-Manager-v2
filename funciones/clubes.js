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
// Orden alfabético en español, sin distinguir acentos ni mayúsculas. Todos los catálogos lo usan
// para mostrarse siempre ordenados.
function sortAlpha(arr){
  return (arr||[]).slice().sort((a,b)=>String(a).localeCompare(String(b),'es',{sensitivity:'base'}));
}

// Catálogo de ciudades: se llena solo con las ciudades usadas en estadios y clubes (y cualquiera que
// se haya guardado a mano en DB.cities). Se devuelve único y ordenado alfabéticamente.
function allCities(){
  const set = new Set();
  const add = (c)=>{ const v=(c||"").trim(); if(v) set.add(v); };
  (DB.cities||[]).forEach(add);
  (DB.stadiums||[]).forEach(st=>add(st.city));
  (DB.clubsData||[]).forEach(c=>add(c.city));
  return sortAlpha([...set]);
}
// Registra una ciudad en el catálogo persistente (idempotente, sin duplicar por acentos).
function registerCity(name){
  const v=(name||"").trim(); if(!v) return;
  if(!Array.isArray(DB.cities)) DB.cities=[];
  if(!DB.cities.some(c=>normLoose(c)===normLoose(v))){ DB.cities.push(v); DB.cities = sortAlpha(DB.cities); }
}

function clubKey(name){ return normLoose(name||""); }
// Índice memoizado de clubes por nombre común y alias (clubKey), para no recorrer DB.clubsData en
// cada getClubByName (en la lista de jugadores se llamaba una vez por fila). Se invalida al editar
// clubes o al recargar/importar (invalidateClubNameIndex).
let _clubNameIdx = null;
function invalidateClubNameIndex(){ _clubNameIdx = null; }
function getClubByName(name){
  if(!name) return null;
  const key = clubKey(name);
  if(!_clubNameIdx){
    _clubNameIdx = Object.create(null);
    (DB.clubsData||[]).forEach(c=>{
      const ck = clubKey(c.commonName);
      if(ck && !(ck in _clubNameIdx)) _clubNameIdx[ck] = c;
      (c.aliases||[]).forEach(a=>{ const ak = clubKey(a); if(ak && !(ak in _clubNameIdx)) _clubNameIdx[ak] = c; });
    });
  }
  return _clubNameIdx[key] || null;
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
  // Mantener el índice de nombres consistente AL INSTANTE. Sin esto, crear el mismo club varias veces
  // dentro de una misma operación (p. ej. asignar un club nuevo a varios jugadores, o una importación en
  // lote) generaba DUPLICADOS: cada llamada consultaba el índice viejo —que aún no incluía el club recién
  // creado— no lo encontraba y creaba otro. Registrar el club en el índice apenas se crea lo evita.
  if(_clubNameIdx){
    const ck = clubKey(c.commonName);
    if(ck && !(ck in _clubNameIdx)) _clubNameIdx[ck] = c;
    (c.aliases||[]).forEach(a=>{ const ak = clubKey(a); if(ak && !(ak in _clubNameIdx)) _clubNameIdx[ak] = c; });
  }
  if(seed && seed[1]) ensureLeague(seed[1]);
  return c;
}
function ensureLeague(name){
  const nm=(name||"").trim(); if(!nm) return "";
  if(!DB.leagues) DB.leagues=[];
  const hit = DB.leagues.find(l=>normLoose(l)===normLoose(nm));
  if(hit) return hit;
  DB.leagues.push(nm); DB.leagues = sortAlpha(DB.leagues);
  return nm;
}
function matchOrAddLeague(raw){ return ensureLeague(raw); }
function buildDefaultClubsData(names){
  return (names||[]).map(nm=>{
    const seed = CLUB_SEED_DATA[nm] || null;
    return {
      id:newClubId(), fullName:"", officialName:"", commonName:nm.slice(0,50), shortName:nm.slice(0,30),
      code:"", codeAlt:"", nicknames:[], city:"", country: seed?seed[0]:"", league: seed?seed[1]:"",
      logoImg:null, logoImgLight:null, color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", stadium:"", stadiums:[], trainingGround:"", founded:null, kitSponsor:""
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
// Índice de jugadores por club, construido de una sola pasada por todas las selecciones. Antes,
// clubPlayers recorría TODA la base de jugadores en cada llamada; al ordenar la lista de clubes por
// "Jugadores" o por rating eso se llamaba una vez por club, dando un coste cuadrático (400 clubes ×
// 780 jugadores ≈ 500 ms por reordenación, y la lista se recalcula en cada navegación). Con el índice
// baja a una sola pasada. La firma detecta cambios en los datos para reconstruirlo cuando hace falta.
let _clubPlayerIndex = null;
let _clubPlayerIndexSig = "";
function clubPlayerIndexSignature(){
  let nPlayers = 0;
  (DB.teams||[]).forEach(t=> nPlayers += (t.players||[]).length);
  return `${(DB.teams||[]).length}:${nPlayers}`;
}
function clubPlayerIndex(){
  const sig = clubPlayerIndexSignature();
  if(_clubPlayerIndex && _clubPlayerIndexSig===sig) return _clubPlayerIndex;
  const idx = new Map();
  (DB.teams||[]).forEach(t=>{
    (t.players||[]).forEach(p=>{
      if(!p.club) return;
      const k = clubKey(p.club);
      let arr = idx.get(k);
      if(!arr){ arr = []; idx.set(k, arr); }
      arr.push({...p, _teamName:t.commonName, _teamId:t.id});
    });
  });
  _clubPlayerIndex = idx;
  _clubPlayerIndexSig = sig;
  return idx;
}
// Invalida el índice tras editar jugadores o clubes (por si el conteo no cambió pero sí el "club").
function invalidateClubPlayerIndex(){ _clubPlayerIndex = null; _clubPlayerIndexSig = ""; }

function clubPlayers(club){
  const idx = clubPlayerIndex();
  const keys = new Set([clubKey(club.commonName), ...(club.aliases||[]).map(clubKey)]);
  const out = [];
  keys.forEach(k=>{ const arr = idx.get(k); if(arr) out.push(...arr); });
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
  // Sin logo propio: escudo genérico recoloreado con los colores del club.
  return defaultCrestBoxHTML(c, extraStyle);
}
function leagueBadge(league){
  return league ? `<span class="badge conf">${escapeHtml(league)}</span>` : `<span class="badge conf" style="opacity:.6;">Sin liga</span>`;
}

/* ---- Competiciones: registro editable (nombres, logos, colores, redes, patrocinador) ----
   Cada liga/torneo se identifica por su nombre-fuente (la liga del club o el competition de partidos.js).
   El registro rico vive en DB.competitions y solo se crea cuando el usuario lo edita/guarda. */
function competitionKey(name){ return (typeof normLoose==="function") ? normLoose(name) : String(name||"").toLowerCase().trim(); }
function competitionByName(name){ const k=competitionKey(name); if(!k) return null; return (DB.competitions||[]).find(c=>c.key===k)||null; }
function ensureCompetition(name, kind){
  const nm=(name||"").trim(); if(!nm) return null;
  let c=competitionByName(nm);
  if(!c){
    c={ id:"comp_"+Math.random().toString(36).slice(2,9), key:competitionKey(nm), kind:kind||"tournament",
        officialName:nm, commonName:nm, shortName:"", code:"", logoImg:"", logoImgLight:"",
        color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", social:{web:"",x:"",ig:"",fb:"",yt:""}, sponsor:"" };
    (DB.competitions=DB.competitions||[]).push(c);
  }
  return c;
}
// Nombre para mostrar de una competición por su nombre-fuente: común > oficial > el nombre dado.
function competitionDisplayName(name){ const c=competitionByName(name); return c ? (c.commonName||c.officialName||name) : name; }
// Etiqueta con el logo de la competición (si tiene), o "" si no hay registro/logo.
function competitionLogoBadge(name){
  const c=competitionByName(name); const lg=c && (c.logoImgLight||c.logoImg);
  return (typeof lg==="string" && lg.indexOf("data:")===0) ? `<img src="${lg}" style="width:24px;height:24px;object-fit:contain;">` : "";
}

/* Pestaña "Competiciones": Amistoso arriba y aparte (no es torneo), luego los torneos (Copa del Mundo y
   los que lleguen por partidos.js), y por último TODAS las ligas marcadas en los clubes.
   En cada fila va PRIMERO el nombre y luego la etiqueta; cada una se puede editar. */
function renderCompeticiones(){
  const clubs = DB.clubsData || [];
  const fixtures = DB.fixtures || [];
  const isFriendly = f => !!(f.friendly || f.stage==="amistoso");

  const leagues = [...new Set(clubs.map(c=>(c.league||"").trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  const clubsInLeague = l => clubs.filter(c=>(c.league||"").trim()===l).length;
  const friendlyN = fixtures.filter(isFriendly).length;
  const comps = [...new Set(fixtures.filter(f=>f.competition && !isFriendly(f)).map(f=>String(f.competition).trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  const compN = c => fixtures.filter(f=>String(f.competition||"").trim()===c).length;

  let wcName = "Copa del Mundo";
  try{ if(typeof eventFieldText==="function"){ wcName = eventFieldText(DB.event,'name') || eventFieldText(DB.event,'shortName') || wcName; } }catch(e){}
  const wcLogo = (DB.event && (DB.event.logoImgLight||DB.event.logoImg)) || "";
  const wcLogoHTML = (typeof wcLogo==="string" && wcLogo.indexOf("data:")===0)
    ? `<img src="${wcLogo}" style="width:28px;height:28px;object-fit:contain;">`
    : `<span class="badge conf">FWC26</span>`;

  // Fila: NOMBRE primero, ETIQUETA después, luego acciones (Ver / Editar).
  const row = (title, badge, sub, opts)=>{
    opts = opts || {};
    const rowAttrs = opts.rowAction ? ` data-action="${opts.rowAction}"${opts.league!=null?` data-league="${escapeHtml(opts.league)}"`:""} style="cursor:pointer;"` : "";
    const go = opts.go ? `<span class="comp-go">${opts.go}</span>` : "";
    const edit = (opts.editName!=null) ? `<button class="btn ghost sm" data-action="edit-competition" data-comp="${escapeHtml(opts.editName)}" data-kind="${escapeHtml(opts.kind||'tournament')}">Editar</button>` : "";
    return `<div class="comp-row"${rowAttrs}>
      <div class="comp-tx"><div class="comp-nm">${escapeHtml(title)}</div>${sub?`<div class="comp-sub">${escapeHtml(sub)}</div>`:""}</div>
      <div class="comp-badge">${badge||""}</div>
      <div class="comp-actions">${go}${edit}</div>
    </div>`;
  };

  const compRows = comps.map(c=>{
    const badge = competitionLogoBadge(c) || `<span class="badge brand">Torneo</span>`;
    return row(competitionDisplayName(c), badge, `${compN(c)} partido${compN(c)===1?"":"s"} · desde partidos.js`, {editName:c, kind:"tournament"});
  }).join("");
  const leagueRows = leagues.length
    ? leagues.map(l=>{
        const badge = competitionLogoBadge(l) || leagueBadge(l);
        return row(competitionDisplayName(l), badge, `${clubsInLeague(l)} club${clubsInLeague(l)===1?"":"es"}`, {rowAction:"open-competition-league", league:l, go:"Ver clubes →", editName:l, kind:"league"});
      }).join("")
    : `<div class="comp-empty">Aún no hay ligas marcadas en los clubes.</div>`;

  return `
  <style id="comp-css">
    .comp-card{padding:4px 8px;}
    .comp-row{display:flex;align-items:center;gap:12px;padding:11px 8px;border-bottom:1px solid var(--line);}
    .comp-row:last-child{border-bottom:none;}
    .comp-row[data-action]{border-radius:8px;transition:background .12s;}
    .comp-row[data-action]:hover{background:var(--surface-2);}
    .comp-tx{flex:1;min-width:0;}
    .comp-nm{font-weight:700;font-size:14px;color:var(--ink);}
    .comp-sub{font-size:12px;color:var(--muted);margin-top:1px;}
    .comp-badge{flex-shrink:0;display:flex;align-items:center;justify-content:flex-end;min-width:64px;}
    .comp-actions{flex-shrink:0;display:flex;align-items:center;gap:10px;}
    .comp-go{font-size:12px;color:var(--indigo-bright);font-weight:600;white-space:nowrap;}
    .comp-empty{padding:18px 8px;color:var(--muted);font-size:13px;}
  </style>
  <div class="section-title"><h2>${tabLabel('competiciones','Competiciones')}</h2><span class="hint">${leagues.length} liga${leagues.length===1?"":"s"} · Copa del Mundo · Amistosos</span></div>

  <h3 class="subhead" style="margin-top:2px;">Amistosos</h3>
  <div class="card comp-card">
    ${row("Amistoso", (competitionLogoBadge("Amistoso")||`<span class="badge host">Amistoso</span>`), `${friendlyN} partido${friendlyN===1?"":"s"} cargado${friendlyN===1?"":"s"} · no es un torneo (partidos sueltos)`, {editName:"Amistoso", kind:"amistoso"})}
  </div>

  <h3 class="subhead">Torneos</h3>
  <div class="card comp-card">
    ${row(wcName, wcLogoHTML, "48 selecciones · edición 2026", {rowAction:"open-competition-event", go:"Ver →"})}
    ${compRows}
  </div>

  <h3 class="subhead">Ligas (de clubes)</h3>
  <div class="card comp-card">${leagueRows}</div>
  `;
}

// Editor de una competición (liga, torneo o "amistoso"): nombres, logos claro/oscuro, colores,
// patrocinador (derechos de nombre) y redes. Se guarda en DB.competitions vía "save-competition".
function modalAddEditCompetition(name, kind){
  // Se materializa la competición (con id) al abrir su editor, para poder crear ahí sus uniformes de
  // árbitro. Solo queda guardada si luego se guarda algo (un kit o la propia competición); si no, se
  // descarta al recargar (ensureCompetition no llama a persist por sí mismo).
  const c = (((name||"").trim() && typeof ensureCompetition==="function") ? ensureCompetition(name, kind) : null)
    || competitionByName(name)
    || { officialName:name, commonName:name, shortName:"", code:"", logoImg:"", logoImgLight:"", color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", social:{}, sponsor:"" };
  const s = c.social || {};
  const kindLbl = kind==="league" ? "liga" : (kind==="amistoso" ? "categoría" : "torneo");
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>Editar competición · ${escapeHtml(kindLbl)}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <div class="subhead">Nombres</div>
          <label class="field" style="grid-column:1/-1;">Nombre oficial<input id="f-comp-officialname" value="${escapeHtml(c.officialName||'')}" placeholder="Nombre oficial del torneo/liga"></label>
          <label class="field" style="grid-column:1/-1;">Nombre común<input id="f-comp-commonname" value="${escapeHtml(c.commonName||'')}" placeholder="El que se usa en casi todo"></label>
          <label class="field">Nombre corto<input id="f-comp-shortname" value="${escapeHtml(c.shortName||'')}" maxlength="30" placeholder="Versión corta"></label>
          <label class="field">Código<input id="f-comp-code" value="${escapeHtml(c.code||'')}" maxlength="8" placeholder="Para marcadores"></label>

          <div class="subhead">Logos</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Logo — fondo oscuro","comp-logo",c.logoImg,"El que se usa en casi toda la app (fondo oscuro).")}
            ${imageUploadFieldCol("Logo — fondo claro","comp-logo-l",c.logoImgLight,"Para fondos claros.")}
          </div>

          <div class="subhead">Wordmark (texto-logo del torneo)</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Wordmark — fondo oscuro","comp-wm",c.wordmarkImg,"Versión clara del texto-logo, para fondos oscuros.",2000)}
            ${imageUploadFieldCol("Wordmark — fondo claro","comp-wm-l",c.wordmarkImgLight,"Reemplaza el nombre del torneo en el recuadro de próximo partido.",2000)}
          </div>

          <div class="subhead">Colores del torneo</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", c.color1||'#4F46E5', "f-comp-color1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", c.color2||'#15161D', "f-comp-color2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", c.color3||'#FFFFFF', "f-comp-color3")}</label>
          </div>

          <div class="subhead">Patrocinador (derechos de nombre)</div>
          <label class="field" style="grid-column:1/-1;">Patrocinador<input id="f-comp-sponsor" value="${escapeHtml(c.sponsor||'')}" placeholder="Marca que da nombre al torneo (si aplica)"></label>

          <div class="subhead">Redes sociales</div>
          <label class="field">Sitio web<input id="f-comp-web" value="${escapeHtml(s.web||'')}" placeholder="https://"></label>
          <label class="field">X (Twitter)<input id="f-comp-x" value="${escapeHtml(s.x||'')}" placeholder="@usuario"></label>
          <label class="field">Instagram<input id="f-comp-ig" value="${escapeHtml(s.ig||'')}" placeholder="@usuario"></label>
          <label class="field">Facebook<input id="f-comp-fb" value="${escapeHtml(s.fb||'')}" placeholder="/página"></label>
          <label class="field">YouTube<input id="f-comp-yt" value="${escapeHtml(s.yt||'')}" placeholder="@canal"></label>

          ${cardBgEditorHTML("comp", c, kind==="amistoso"?'#6257e6':'#24262d', "dark")}

          ${(typeof pwEditorHTML==="function") ? `
          <details class="clpw-details" style="grid-column:1/-1;border:1px solid var(--line);border-radius:10px;padding:0;overflow:hidden;">
            <summary style="cursor:pointer;padding:11px 14px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;list-style:none;background:var(--surface-2);white-space:nowrap;">Press Wall</summary>
            <div style="padding:14px;">
              <span style="display:block;font-size:11px;color:var(--muted);margin-bottom:10px;">Arriba el muro y la carga del back y la referencia; abajo las marcas. Agrega marcas para ir rellenando cada color de la referencia; cada marca tiene su color de referencia, el tipo de logo y su color de fondo (por defecto el del patrocinador).</span>
              <div class="field" style="flex-direction:row;align-items:center;gap:8px;font-size:12px;color:var(--muted);font-weight:600;margin-bottom:12px;">
                <input type="checkbox" id="f-comp-teampw" ${c.useTeamPressWall!==false?'checked':''} style="width:auto;flex-shrink:0;margin:0;">
                <span>Los equipos usan su propio press wall</span>
              </div>
              ${pwEditorHTML({prefix:"comppw", title:"Press wall del torneo", brands:pwBrandsFor(c), back:c.pressWallBgImg||"", ref:c.pressWallRefImg||"", graphicPct:c.pressWallGraphicPct||100, graphicX:c.pressWallGraphicX||0, graphicY:c.pressWallGraphicY||0, live:false, layout:"stacked"})}
            </div>
          </details>` : ""}

          ${(typeof refereeKitsDetailsHTML==="function") ? refereeKitsDetailsHTML(refKitsWrapId("comp", c.id||""), {
            exists: !!c.id,
            hint: "Uniformes que usan los árbitros de este torneo. Se editan igual que los de la Copa del Mundo.",
            savedFirst: "Guarda primero el torneo para poder crear sus uniformes de árbitro."
          }) : ""}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-competition" data-name="${escapeHtml(name)}" data-kind="${escapeHtml(kind||'tournament')}">Guardar</button>
      </div>
    </div>
  `);
}
function clubCardHTML(c){
  const r = clubRatings(c);
  const nPlayers = clubPlayers(c).length;
  return `
  <div class="card team-card" data-action="open-club" data-id="${c.id}">
    <div class="team-card-top">
      ${clubCrestHTML(c, "width:50px;height:50px;")}
      <div class="meta">
        <div class="name">${escapeHtml(clubDisplayName(c))}</div>
        <div class="sub">
          ${c.country?`<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${flagIconHTML(c.country)}${escapeHtml(c.country)}</span>`:""}
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
  // El conteo/rating de cada club se calcula una sola vez por ordenación (no una vez por comparación),
  // que con muchos clubes era lo que disparaba el tiempo. clubValue ya usa el índice, así que aquí
  // basta con precomputar la clave de orden por club antes de comparar.
  const key = clubsSort.key, dir = clubsSort.dir, type = clubValType(key);
  const decorated = (DB.clubsData||[]).map(c=>({c, v:clubValue(c,key), n:clubDisplayName(c)}));
  decorated.sort((a,b)=>
    compareGeneric(a.v, b.v, type, dir)
    || a.n.localeCompare(b.n,'es',{sensitivity:'base'}));
  return decorated.map(d=>d.c);
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
          <td>${c.country?flagIconHTML(c.country)+escapeHtml(c.country):"—"}</td>
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
  // Patrocinadores ligados a este club (por enlace {type:"club"} o por marca de indumentaria).
  const sponsorsOfClub = (DB.sponsors||[]).filter(s=>{ try{ return sponsorEffectiveLinks(s).some(l=>l.type==="club" && normLoose(l.name)===normLoose(c.commonName)); }catch(e){ return false; } }).slice().sort((a,b)=>(a.name||"").localeCompare(b.name||"", 'es'));
  const sortedPlayers = players.slice().sort((a,b)=>
    compareGeneric(playerValue(a,squadSort.key), playerValue(b,squadSort.key), playerType(squadSort.key), squadSort.dir)
    || playerDisplayName(a).localeCompare(playerDisplayName(b)));
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-clubes">← Volver</button>
    ${detailNavHTML('nav-club-arrow', idx, ordered.length)}
  </div>
  <div class="card" style="margin-top:14px;display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    ${clubCrestHTML(c, "width:150px;height:150px;")}
    <div style="flex:1;min-width:200px;">
      <h2 style="margin:0 0 2px;">${escapeHtml(clubDisplayName(c))}</h2>
      ${c.fullName ? `<div style="font-size:12px;color:var(--muted);margin-bottom:4px;">${escapeHtml(c.fullName)}</div>` : ""}
      <div style="font-size:12.5px;color:var(--indigo-bright);font-weight:600;margin-bottom:6px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
        ${c.founded ? `<span>Fundado en ${escapeHtml(String(c.founded))}</span>` : ""}
        ${c.founded && ((c.stadiums&&c.stadiums.length)||c.stadium) ? `<span style="color:var(--muted);font-weight:400;">·</span>` : ""}
        ${((c.stadiums&&c.stadiums.length)?c.stadiums:(c.stadium?[c.stadium]:[])).map(nm=>`<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${escapeHtml(stadiumOwnNameToShow(nm))}</span>`).join("")}
      </div>
      <div class="tag-list" style="margin-top:4px;">
        ${c.country ? `<span class="badge conf" style="background:var(--surface-2);color:var(--muted);">${flagIconHTML(c.country)}${escapeHtml(c.country)}</span>` : ""}
        ${leagueBadge(c.league)}
        <span class="badge ${players.length>0?'ok':'incomplete'}">${players.length} jugadores</span>
      </div>
      ${(typeof formaRowHTML==="function")?formaRowHTML(null):""}
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
      ${currentSlotKits(c,"jugador").slice(0,3).map(k=>`
        <div class="kit-render" data-pending data-team-id="${c.id}" data-kit-id="${k.id}" data-action="edit-kit" data-team="${c.id}" data-id="${k.id}"
             style="width:110px;height:110px;background:var(--surface-2);border-radius:10px;cursor:pointer;flex-shrink:0;"></div>
      `).join("") || `<span style="font-size:13px;color:var(--muted);align-self:center;">Sin uniformes todavía</span>`}
    </div>
    <div style="flex:1;min-width:160px;border-left:1px solid var(--line);padding-left:18px;">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;margin-bottom:4px;">Patrocinador de ropa</div>
      ${c.kitSponsor ? `<span class="badge conf" style="${KIT_SPONSOR_BADGE_STYLE}">${kitSponsorLogoIcon(c.kitSponsor)}${escapeHtml(c.kitSponsor)}</span>` : `<span class="badge conf" style="${KIT_SPONSOR_BADGE_STYLE}">Sin marca</span>`}
      <div style="margin-top:10px;">
        <button class="btn ghost sm" data-action="manage-kits" data-team="${c.id}">Editar uniformes</button>
      </div>
    </div>
  </div>

  ${(typeof facilitiesSectionHTML==="function") ? facilitiesSectionHTML(c) : ""}

  <div class="section-title"><h2>Patrocinadores</h2></div>
  <div class="card" style="margin-bottom:14px;">
    ${sponsorsOfClub.length===0 ? `<p style="font-size:13px;color:var(--muted);margin:0;">Ninguno todavía. Puedes ligar uno desde la pestaña Patrocinadores o desde el Press Wall.</p>` :
      sponsorsOfClub.map(s=>`<div class="kv"><span>${escapeHtml(s.name)} <span style="color:var(--muted);">(${escapeHtml(sponsorCategoriesOf(s).join(", ")||"—")})</span></span></div>`).join("")}
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
        <span class="pname"><img src="${p.photo||personPhotoDefault(p)}" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;object-fit:cover;vertical-align:middle;margin-right:6px;flex-shrink:0;">${playerDisplayNameHTML(p)}<span class="pos-chip pos-${p.pos}" style="margin-left:10px;">${p.pos}</span>${positionsText(p)?` <span style="color:var(--muted);font-size:12px;font-weight:400;">${positionsText(p)}</span>`:""}</span>
        <span class="pmeta">${playerAgeText(p)} · ${(()=>{
          const natCo = nationalityCountryOf(p);
          const demonym = personDemonym(p) || playerCountryName(p) || "Sin país";
          const calledUp = p._teamId && p.number!=null && p.number>0;
          // Etiqueta de nacionalidad (gentilicio + bandera, gris, SIN enlace a la selección).
          const natTag = `<span class="club-chip">${flagIconHTML(natCo||demonym)}${escapeHtml(demonym)}</span>`;
          // "INT" es el enlace a la selección; solo si el jugador está convocado (dorsal distinto de 0).
          const intl = calledUp
            ? ` <span class="badge conf tag-clickable" data-action="open-team" data-id="${p._teamId}" style="cursor:pointer;font-size:9px;padding:1px 6px;" title="Internacional — convocado a la selección">INT</span>`
            : "";
          return natTag + intl;
        })()}</span>
        <span class="prating">${p.rating}</span>
      </div>
    `).join("")}
  </div>`}

  <div class="section-title"><h2>Cuerpo técnico</h2><button class="btn gold sm" data-action="add-coach-club" data-club="${escapeHtml(c.commonName)}">+ Agregar entrenador</button></div>
  ${(()=>{
    // Entrenadores con contrato en ESTE club (derivado de contractClub, vivan donde vivan).
    const staff = DB.teams.flatMap(t=>(t.coaches||[]).map(co=>({co, team:t})))
      .filter(x=>{ const gc = x.co.contractClub ? getClubByName(x.co.contractClub) : null; return gc && gc.id===c.id; })
      .sort((a,b)=> playerSortName(a.co).toLowerCase().localeCompare(playerSortName(b.co).toLowerCase(),'es',{sensitivity:'base'})
        || playerDisplayName(a.co).localeCompare(playerDisplayName(b.co)));
    return staff.length===0
      ? `<div class="empty"><h3>Sin cuerpo técnico</h3><p>Aparecen aquí los entrenadores con contrato en este club.</p></div>`
      : `<div class="card">${staff.map(x=>coachRowHTML(x.co, x.team)).join("")}</div>`;
  })()}
  `;
}

function modalAddEditClub(club){
  const isEdit = !!club;
  club = club || {id:null, fullName:"", officialName:"", commonName:"", shortName:"", code:"", codeAlt:"",
    nicknames:[], city:"", country:"", league:"", logoImg:"", logoImgLight:"", color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF",
    stadium:"", stadiums:[], trainingGround:"", kitSponsor:"", socialAvatar:null, socialAvatarManual:false, socialProfileName:"", socialUsername:"", socialVerified:"", socialAvatarLogo:"dark", socialAvatarColor:0};
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
            <input id="f-cl-city" list="city-list-club" value="${escapeHtml(club.city||'')}" placeholder="Ciudad del club">
            <datalist id="city-list-club">${datalistOptions(allCities())}</datalist>
          </label>
          <label class="field">País
            <input id="f-cl-country" list="country-name-list" value="${escapeHtml(club.country||'')}" placeholder="País del club">
            <datalist id="country-name-list">${datalistOptions((DB.countries||[]).map(c=>c.commonName))}</datalist>
          </label>
          <label class="field" style="grid-column:1/-1;">Liga
            <input id="f-cl-league" list="league-list" value="${escapeHtml(club.league||'')}" placeholder="Liga donde juega">
            <datalist id="league-list">${datalistOptions(DB.leagues||[])}</datalist>
          </label>

          <div class="subhead">Escudo</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Escudo — fondo oscuro", "cl-logo", club.logoImg, "El que se usa en casi toda la app (fondo oscuro).")}
            ${imageUploadFieldCol("Escudo — fondo claro", "cl-logo-l", club.logoImgLight, "Para fondos claros.")}
          </div>

          <div class="subhead">Colores del club</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", club.color1||'#4F46E5', "f-cl-color1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", club.color2||'#15161D', "f-cl-color2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", club.color3||'#FFFFFF', "f-cl-color3")}</label>
            <label class="field" style="flex:1 1 180px;min-width:180px;">Logo principal (con estos colores)
              <select id="f-cl-logomain">
                <option value="dark" ${(club.logoMain||'dark')==='dark'?'selected':''}>Escudo — fondo oscuro</option>
                <option value="light" ${club.logoMain==='light'?'selected':''}>Escudo — fondo claro</option>
              </select>
            </label>
          </div>

          ${(typeof iconEditorSectionHTML==="function") ? iconEditorSectionHTML("clicon", club, {
            title:"Icono del club",
            logoOptions:[["dark","Escudo oscuro"],["light","Escudo claro"]].concat(((typeof entityLogoAlts==="function")?entityLogoAlts(club):(club.logoAlts||[])).map((a,i)=>(a&&a.img)?["a"+i,"Alt "+(i+1)]:null).filter(Boolean)),
            logoInputs:(()=>{ const m={ dark:"f-cl-logo-data", light:"f-cl-logo-l-data" }; ((typeof entityLogoAlts==="function")?entityLogoAlts(club):(club.logoAlts||[])).forEach((a,i)=>{ if(a&&a.img) m["a"+i]="f-calt-"+i+"-data"; }); return m; })(),
            altPrefix:"calt",
            colors:[club.color1||"#4F46E5", club.color2||"#15161D", club.color3||"#FFFFFF"],
            colorInputs:["f-cl-color1","f-cl-color2","f-cl-color3"]
          }) : ""}

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

          ${socialSectionHTML("clsoc", club, {
            logoOptions: [["dark","Logo oscuro"],["light","Logo claro"]],
            logos: { dark: club.logoImg||"", light: club.logoImgLight||club.logoImg||"" },
            logoInputs: { dark:"f-cl-logo-data", light:"f-cl-logo-l-data" },
            colors: [club.color1||"#4F46E5", club.color2||"#15161D", club.color3||"#FFFFFF"],
            colorInputs: ["f-cl-color1","f-cl-color2","f-cl-color3"]
          })}

          ${(typeof pwEditorHTML==="function") ? `
          <details class="clpw-details" style="grid-column:1/-1;border:1px solid var(--line);border-radius:10px;padding:0;overflow:hidden;">
            <summary style="cursor:pointer;padding:11px 14px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;list-style:none;background:var(--surface-2);white-space:nowrap;">Press Wall</summary>
            <div style="padding:14px;">
              <span style="display:block;font-size:11px;color:var(--muted);margin-bottom:10px;">Arriba el muro y la carga del back y la referencia; abajo las marcas. Agrega marcas para ir rellenando cada color de la referencia; cada marca tiene su color de referencia, el tipo de logo y su color de fondo (por defecto el del patrocinador).</span>
              ${pwEditorHTML({prefix:"clpw", title:"Press wall del club", brands:pwBrandsFor(club), back:club.pressWallBgImg||"", ref:club.pressWallRefImg||"", graphicPct:club.pressWallGraphicPct||100, graphicX:club.pressWallGraphicX||0, graphicY:club.pressWallGraphicY||0, live:false, layout:"stacked"})}
            </div>
          </details>` : ""}
          ${(typeof logoAltsSectionHTML==="function") ? logoAltsSectionHTML("calt", (typeof entityLogoAlts==="function") ? entityLogoAlts(club) : (club.logoAlts||[])) : ""}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-club" data-id="${club.id||''}">Guardar</button>
      </div>
    </div>
  `);
}

/* =========================================================
   FONDO DE TARJETA DE PARTIDO (torneos, amistosos y Copa del Mundo)
   Capas, de atrás hacia adelante:
     1) color base: negro (logos para fondo oscuro) o blanco (logos para fondo claro);
     2) imagen de fondo (opcional) con tamaño y posición ajustables;
     3) sólido (opcional, casilla): degradado de un color, degradado de dos colores o color sólido, con borde
        nítido. Margen 0 = toda la tarjeta; con margen, se separa lo MISMO en los 4 lados (px) y conserva la
        misma curva en las esquinas.
   Se activa con cfg.cardBgV2 (lo pone el editor al guardar); sin eso, la tarjeta se ve como antes.
   ========================================================= */
var CARD_BG_RADIO = 16;   // radio de esquina de la tarjeta de partido (px)
function cardBgMix(hex, target, amt){
  hex=String(hex||"").replace("#",""); if(hex.length===3) hex=hex.split("").map(function(c){return c+c;}).join("");
  var n=parseInt(hex,16); if(isNaN(n)) return "#"+hex;
  var r=(n>>16)&255, g=(n>>8)&255, b=n&255;
  r=Math.round(r+(target-r)*amt); g=Math.round(g+(target-g)*amt); b=Math.round(b+(target-b)*amt);
  var h=function(v){ return ('0'+Math.max(0,Math.min(255,v)).toString(16)).slice(-2); };
  return "#"+h(r)+h(g)+h(b);
}
function cardBgGradient(hex){
  var c0=cardBgMix(hex,255,0.16), c2=cardBgMix(hex,0,0.28), c3=cardBgMix(hex,0,0.46);
  return "linear-gradient(145deg,"+c0+" 0%,"+hex+" 42%,"+c2+" 74%,"+c3+" 100%)";
}
// Proporción (ancho/alto) de la imagen de fondo. SVG: de su viewBox (o width/height). Raster: se lee al
// cargarla (asíncrono); mientras tanto devuelve 0 y se repinta la vista previa al terminar.
var _cbgRatios = Object.create(null);
function cardBgImgRatio(src){
  if(!src) return 0;
  var k = src.length+":"+src.slice(-48);
  if(_cbgRatios[k]!=null) return _cbgRatios[k];
  if(/^data:image\/svg\+xml/i.test(src)){
    var txt=""; try{ var i=src.indexOf(","); var body=src.slice(i+1); txt = /;base64,/i.test(src.slice(0,i+1)) ? decodeURIComponent(escape(atob(body))) : decodeURIComponent(body); }catch(e){}
    var vb=/viewBox\s*=\s*["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/i.exec(txt);
    var r = vb ? (+vb[1]/+vb[2]) : 0;
    if(!r){ var w=/<svg[^>]*\swidth\s*=\s*["']([\d.]+)/i.exec(txt), h=/<svg[^>]*\sheight\s*=\s*["']([\d.]+)/i.exec(txt); if(w&&h) r=+w[1]/+h[1]; }
    _cbgRatios[k] = (r>0 && isFinite(r)) ? r : 0;
    return _cbgRatios[k];
  }
  _cbgRatios[k] = 0;
  try{ var im=new Image(); im.onload=function(){ if(im.naturalWidth && im.naturalHeight){ _cbgRatios[k]=im.naturalWidth/im.naturalHeight; document.querySelectorAll(".cbg-ed").forEach(function(ed){ cardBgPreview(ed.getAttribute("data-cbg")); }); } }; im.src=src; }catch(e){}
  return 0;
}
// Margen del sólido (px). Configuraciones anteriores guardaban un % de tamaño: se convierte.
function cardBgMargen(cfg){
  if(cfg.gradMargin!=null && !isNaN(+cfg.gradMargin)) return Math.max(0, +cfg.gradMargin);
  if(+cfg.gradSize>0 && +cfg.gradSize<100) return Math.round((100 - +cfg.gradSize)*0.5);
  return 0;
}
// Estilo en línea + clases de la tarjeta para una configuración (cfg) ya guardada.
//   dark: ¿logos para fondo oscuro? (fondo base negro y textos blancos).  defColor: color del degradado por defecto.
function cardBgV2Style(cfg, dark, defColor){
  cfg=cfg||{};
  var base = dark ? "#000" : "#fff";
  var img = (typeof cfg.matchBackImg==="string" && cfg.matchBackImg.indexOf("data:")===0) ? cfg.matchBackImg : "";
  var sc = +cfg.bgImgScale>0 ? +cfg.bgImgScale : 100, x = (cfg.bgImgX!=null) ? +cfg.bgImgX : 50, y = (cfg.bgImgY!=null) ? +cfg.bgImgY : 50;
  // La imagen mide SIEMPRE el mismo % del ANCHO de la tarjeta y conserva su proporción (nunca se estira),
  // sin importar el tamaño o la forma del rectángulo. Va en su propia capa (::after) con la proporción
  // real de la imagen (cfg.bgImgRatio, leída al cargarla; un SVG la toma de su viewBox).
  var ratio = +cfg.bgImgRatio>0 ? +cfg.bgImgRatio : (img ? cardBgImgRatio(img) : 0);
  var st;
  if(img && ratio>0){
    st = "background:"+base+";--nm-img:url('"+img+"');--nm-iw:"+sc+"%;--nm-ir:"+ratio.toFixed(5)+";--nm-ix:"+x+"%;--nm-iy:"+y+"%;";
  } else {
    st = img ? ("background:"+base+" url('"+img+"') "+x+"% "+y+"%/"+sc+"% auto no-repeat;") : ("background:"+base+";");
  }
  var gOn = cfg.gradOn!==false;
  // Margen IGUAL en los 4 lados (px), como un contorno; las esquinas conservan la misma curva.
  var m = cardBgMargen(cfg);
  var c1 = cfg.backColor||defColor||"#24262d", c2 = cfg.backColor2||cardBgMix(c1,0,0.5);
  var capa = cfg.solidType==="solid" ? c1 : (cfg.solidType==="grad2" ? "linear-gradient(145deg,"+c1+" 0%,"+c2+" 100%)" : cardBgGradient(c1));
  // Curva CONCÉNTRICA (como un contorno de grosor uniforme): radio interior = radio de la tarjeta − margen.
  st += "--nm-gi:"+m+"px;--nm-gr:"+Math.max(0, CARD_BG_RADIO - m)+"px;--nm-grad:"+capa+";";
  return { style:st, cls:" nm-v2"+(gOn?"":" nm-sing")+((img && ratio>0)?" nm-img":"") };
}
// Sección del editor ("Fondo de tarjeta de partido") con vista previa en vivo. p = prefijo de los ids.
function cardBgEditorHTML(p, cfg, defColor, defLogo){
  cfg=cfg||{};
  var lm = cfg.matchLogoMode || defLogo || "dark";
  var v2 = !!cfg.cardBgV2;
  var gOn = v2 ? (cfg.gradOn!==false) : !cfg.matchBackImg;   // antes: con imagen no había degradado
  var mg = v2 ? cardBgMargen(cfg) : 0;
  var tipo = cfg.solidType || "grad1";
  var sc = v2 && +cfg.bgImgScale>0 ? +cfg.bgImgScale : 100, x = v2 && cfg.bgImgX!=null ? +cfg.bgImgX : 50, y = v2 && cfg.bgImgY!=null ? +cfg.bgImgY : 50;
  var rng=function(id,lbl,min,max,val,unit){ return '<label class="field cbg-rng" style="flex:1 1 150px;min-width:0;">'+lbl+' <span class="mono" id="'+id+'-v" style="font-weight:400;color:var(--muted);">'+val+unit+'</span>'
    +'<input type="range" id="'+id+'" min="'+min+'" max="'+max+'" value="'+val+'" data-unit="'+unit+'" style="width:100%;margin-top:6px;"></label>'; };
  return '<details class="clpw-details" style="grid-column:1/-1;border:1px solid var(--line);border-radius:10px;padding:0;overflow:hidden;">'
    +'<summary style="cursor:pointer;padding:11px 14px;font-family:\'Space Grotesk\',sans-serif;font-weight:700;font-size:13px;list-style:none;background:var(--surface-2);white-space:nowrap;">Fondo de tarjeta de partido</summary>'
    +'<div class="cbg-ed" data-cbg="'+p+'" data-defcolor="'+(defColor||"#24262d")+'" style="padding:14px;display:flex;flex-direction:column;gap:14px;">'
    +  '<span style="display:block;font-size:11px;color:var(--muted);">Capas de la tarjeta: color base (negro o blanco según los logos), imagen de fondo y, encima, un sólido (degradado de uno o dos colores, o color sólido) con el mismo margen en los 4 lados y la misma curva de la tarjeta.</span>'
    +  '<div class="cbg-ratios" role="group" aria-label="Proporción de la vista previa">'
    +    [["6/1","Delgada"],["4/1","4:1"],["3/1","3:1"],["2/1","2:1"]].map(function(r,i){ return '<button type="button" class="btn ghost sm cbg-ratio'+(i===0?' on':'')+'" data-ratio="'+r[0]+'">'+r[1]+'</button>'; }).join("")
    +  '</div>'
    +  '<div id="'+p+'-cbg-prev" class="cbg-prev" data-ratio="6/1"><div class="cbg-prev-t">Siguiente partido</div><div class="cbg-prev-m">México <b>2 - 0</b> Sudáfrica</div><div class="cbg-prev-s">Grupo A · 11 jun 2026 · Estadio Ciudad de México</div></div>'
    +  '<label class="field" style="flex:0 0 auto;">Logos que usa'
    +    '<select id="f-'+p+'-logomode" style="margin-top:4px;">'
    +      '<option value="dark"'+(lm==="dark"?" selected":"")+'>Logos para fondo oscuro (base negra)</option>'
    +      '<option value="light"'+(lm==="light"?" selected":"")+'>Logos para fondo claro (base blanca)</option>'
    +    '</select></label>'
    +  '<div style="display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">'
    +    imageUploadFieldCol("Imagen de fondo (opcional)", p+"-back", cfg.matchBackImg, "Va detrás del sólido. Acepta SVG (se conserva vectorial, nítido a cualquier tamaño), PNG o JPG. Sin imagen, la base queda negra o blanca.", 2560, "jpeg")
          .replace('accept="image/png,image/jpeg"', 'accept="image/png,image/jpeg,image/svg+xml,.svg" data-keepvector="1"')
    +  '</div>'
    +  '<div style="display:flex;gap:14px;flex-wrap:wrap;">'
    +    rng("f-"+p+"-bgsc","Ancho de la imagen",30,300,sc,"%")
    +    rng("f-"+p+"-bgx","Posición horizontal",0,100,x,"%")
    +    rng("f-"+p+"-bgy","Posición vertical",0,100,y,"%")
    +  '</div>'
    +  '<label style="display:flex;align-items:center;gap:8px;font-size:12px;font-weight:600;color:var(--ink);cursor:pointer;"><input type="checkbox" id="f-'+p+'-grad"'+(gOn?" checked":"")+' style="width:auto;margin:0;"> Sólido encima de la imagen</label>'
    +  '<div style="display:flex;gap:14px;flex-wrap:wrap;align-items:flex-end;">'
    +    '<label class="field" style="flex:0 0 auto;">Tipo'
    +      '<select id="f-'+p+'-soltype" style="margin-top:4px;">'
    +        '<option value="grad1"'+(tipo==="grad1"?" selected":"")+'>Degradado de un color</option>'
    +        '<option value="grad2"'+(tipo==="grad2"?" selected":"")+'>Degradado de dos colores</option>'
    +        '<option value="solid"'+(tipo==="solid"?" selected":"")+'>Color sólido</option>'
    +      '</select></label>'
    +    '<label class="field" style="flex:0 0 auto;">Color'+colorPickerHTML("color-square", cfg.backColor||defColor||'#24262d', "f-"+p+"-backcolor")+'</label>'
    +    '<label class="field cbg-c2" style="flex:0 0 auto;'+(tipo==="grad2"?"":"display:none;")+'">Color 2'+colorPickerHTML("color-square", cfg.backColor2||cardBgMix(cfg.backColor||defColor||'#24262d',0,0.5), "f-"+p+"-backcolor2")+'</label>'
    +  '</div>'
    +  '<div style="display:flex;gap:14px;flex-wrap:wrap;">'
    +    rng("f-"+p+"-gmg","Margen alrededor del sólido",0,60,mg,"px")
    +  '</div>'
    +'</div></details>';
}
function cardBgEditorRead(p){
  var g=function(id){ return document.getElementById(id); };
  var num=function(id,def){ var e=g(id); var v=e?+e.value:NaN; return isNaN(v)?def:v; };
  return {
    cardBgV2: true,
    matchLogoMode: ((g("f-"+p+"-logomode")||{}).value==="light") ? "light" : "dark",
    matchBackImg: (g("f-"+p+"-back-data")||{}).value || "",
    bgImgScale: num("f-"+p+"-bgsc",100), bgImgX: num("f-"+p+"-bgx",50), bgImgY: num("f-"+p+"-bgy",50),
    bgImgRatio: cardBgImgRatio((g("f-"+p+"-back-data")||{}).value || "") || undefined,
    gradOn: !!((g("f-"+p+"-grad")||{}).checked),
    gradMargin: num("f-"+p+"-gmg",0),
    gradSize: undefined,
    solidType: ((g("f-"+p+"-soltype")||{}).value) || "grad1",
    backColor: ((g("f-"+p+"-backcolor")||{}).value||"").trim(),
    backColor2: ((g("f-"+p+"-backcolor2")||{}).value||"").trim()
  };
}
// Vista previa en vivo: se repinta con cada cambio del editor (y al cargar/quitar la imagen).
function cardBgPreview(p){
  var ed=document.querySelector('.cbg-ed[data-cbg="'+p+'"]'), pv=document.getElementById(p+"-cbg-prev");
  if(!ed || !pv) return;
  var cfg=cardBgEditorRead(p), dark=cfg.matchLogoMode!=="light";
  var r=cardBgV2Style(cfg, dark, ed.getAttribute("data-defcolor"));
  pv.setAttribute("style", r.style+"aspect-ratio:"+(pv.getAttribute("data-ratio")||"6/1")+";");
  pv.className="cbg-prev"+r.cls+(dark?" cbg-dark":"");
  var c2=ed.querySelector(".cbg-c2"); if(c2) c2.style.display = cfg.solidType==="grad2" ? "" : "none";
  ed.querySelectorAll('input[type=range]').forEach(function(rg){ var o=document.getElementById(rg.id+"-v"); if(o) o.textContent=rg.value+(rg.getAttribute("data-unit")||""); });
}
(function(){
  if(typeof document==="undefined") return;
  var h=function(e){ var ed=e.target && e.target.closest && e.target.closest(".cbg-ed"); if(ed){ ed.setAttribute("data-dirty","1"); cardBgPreview(ed.getAttribute("data-cbg")); } };
  document.addEventListener("input", h, true); document.addEventListener("change", h, true);
  document.addEventListener("click", function(e){
    var ed=e.target && e.target.closest && e.target.closest(".cbg-ed"); if(!ed) return;
    // Proporción de la vista previa (solo visual, no se guarda).
    var rb=e.target.closest(".cbg-ratio");
    if(rb){ var p=ed.getAttribute("data-cbg"), pv=document.getElementById(p+"-cbg-prev");
      if(pv) pv.setAttribute("data-ratio", rb.getAttribute("data-ratio"));
      ed.querySelectorAll(".cbg-ratio").forEach(function(b){ b.classList.toggle("on", b===rb); });
      cardBgPreview(p); return; }
    setTimeout(function(){ cardBgPreview(ed.getAttribute("data-cbg")); }, 60);
  }, true);
  // La imagen se lee de forma asíncrona: se revisa el campo oculto mientras el editor está abierto.
  setInterval(function(){ document.querySelectorAll(".cbg-ed").forEach(function(ed){ var p=ed.getAttribute("data-cbg"), d=document.getElementById("f-"+p+"-back-data"); var v=d?d.value.length:0; if(ed._iv!==v){ if(ed._iv!=null) ed.setAttribute("data-dirty","1"); ed._iv=v; cardBgPreview(p); } }); }, 400);
})();
