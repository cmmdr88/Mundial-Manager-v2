/* =========================================================
   COPA MANAGER 2026 — funciones/rankings.js
   Rankings FIFA y Elo: cálculo de puntos/posiciones (capa de
   datos) y vista de la pestaña Rankings (mundial y por
   confederación). Extracción mecánica: texto y orden idénticos
   al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (FIFA_RANKING_BY_CODE, ELO_RATING, ELO_NAME_ALIASES,
   RANKING_SECTION_IDS), core/utilidades.js (compareGeneric, sortTh)
   y app/textos-ui.js (T, tabLabel, tabDescription), y ANTES del
   <script> inline. El estado de la vista (rankingSection,
   rankingSort) permanece en el inline y se referencia en tiempo de
   ejecución, junto con DB y helpers del inline (teamRating,
   crestHTML, confBadge, fifaBadge).
   ========================================================= */

// Ranking FIFA oficial completo (211 selecciones, posición + puntos) por código FIFA — fuente: archivo del usuario.
// Se aplica por código FIFA a cualquier selección que coincida, sin necesidad de capturarlo a mano.
function fifaRankingFor(fifaCode){
  const r = FIFA_RANKING_BY_CODE[fifaCode];
  return r ? {rank:r[0], points:r[1]} : {rank:null, points:null};
}
// Aplica (y sobreescribe) los puntos FIFA oficiales a cada selección que tenga código FIFA coincidente.
// El lugar del ranking ya NO se guarda — se calcula siempre a partir de los puntos (ver computeFifaRanks).
function applyFifaRankingToTeams(teamsArr){
  (teamsArr||[]).forEach(t=>{
    const r = FIFA_RANKING_BY_CODE[t.fifaCode];
    if(r){ t.fifaPoints = r[1]; }
  });
}
// Aplica los puntos Elo (fuente del usuario, hasta jun. 2026) emparejando por nombre común.
// Selecciones sin coincidencia en la tabla se dejan como están.
// Algunas selecciones pueden tener un commonName distinto en datos ya guardados (el usuario los
// renombró, o una versión previa usaba otra grafía). Estos alias mapean esos nombres alternativos
// al nombre canónico que sí está en ELO_RATING, para que reciban su puntaje igual.
function eloForTeamName(name){
  if(ELO_RATING[name]!=null) return ELO_RATING[name];
  const alias = ELO_NAME_ALIASES[name];
  if(alias && ELO_RATING[alias]!=null) return ELO_RATING[alias];
  return null;
}
function applyEloRatingToTeams(teamsArr){
  (teamsArr||[]).forEach(t=>{
    const e = eloForTeamName(t.commonName);
    if(e!=null){ t.eloRating = e; }
  });
}
// Calcula el lugar en el ranking Elo a partir del puntaje (mismo criterio que el FIFA: empates
// comparten lugar y la siguiente salta posiciones). Selecciones sin Elo no tienen lugar.
function computeEloRanks(teamsArr){
  const ranked = (teamsArr||DB.teams).filter(t=>t.eloRating!=null).sort((a,b)=>b.eloRating-a.eloRating);
  const rankByTeamId = {};
  let lastPts = null, lastRank = 0, count = 0;
  ranked.forEach(t=>{
    count++;
    if(t.eloRating !== lastPts){ lastRank = count; lastPts = t.eloRating; }
    rankByTeamId[t.id] = lastRank;
  });
  return rankByTeamId;
}
// Calcula el lugar de cada selección a partir de sus puntos FIFA (ranking por competición estándar:
// si dos selecciones empatan en puntos, comparten el mismo lugar y la siguiente selección salta esa
// cantidad de posiciones — ej. 1, 1, 3). Selecciones sin puntos no tienen lugar.
function computeFifaRanks(teamsArr){
  const ranked = (teamsArr||DB.teams).filter(t=>t.fifaPoints!=null).sort((a,b)=>b.fifaPoints-a.fifaPoints);
  const rankByTeamId = {};
  let lastPoints = null, lastRank = 0, count = 0;
  ranked.forEach(t=>{
    count++;
    if(t.fifaPoints !== lastPoints){ lastRank = count; lastPoints = t.fifaPoints; }
    rankByTeamId[t.id] = lastRank;
  });
  return rankByTeamId;
}

function rankingValue(t,key,ranksMap,eloRanksMap){
  switch(key){
    case "name": return t.commonName;
    case "conf": return t.conf;
    case "fifaRank": return ranksMap ? (ranksMap[t.id] ?? null) : null;
    case "fifaPoints": return t.fifaPoints;
    case "eloRank": return eloRanksMap ? (eloRanksMap[t.id] ?? null) : null;
    case "elo": return t.eloRating;
    case "rating": return teamRating(t);
    default: return null;
  }
}
function rankingType(key){ return (key==="name"||key==="conf") ? "string" : "number"; }
function rankingDefaultDir(key){ return (key==="fifaPoints"||key==="elo"||key==="rating") ? "desc" : "asc"; }

function renderRankings(){
  const ranksMap = computeFifaRanks();
  const eloRanksMap = computeEloRanks();
  const teams = rankingSection==="MUNDIAL" ? DB.teams.slice() : DB.teams.filter(t=>t.conf===rankingSection);
  const sorted = teams.sort((a,b)=>
    compareGeneric(rankingValue(a,rankingSort.key,ranksMap,eloRanksMap), rankingValue(b,rankingSort.key,ranksMap,eloRanksMap), rankingType(rankingSort.key), rankingSort.dir)
    || a.commonName.localeCompare(b.commonName)
  );
  return `
  <div class="section-title"><h2>${tabLabel('rankings','Rankings')}</h2><span class="hint">${tabDescription('rankings')}</span></div>
  <div class="subtabs">
    ${RANKING_SECTION_IDS.map(id=>`<button class="subtab-btn ${rankingSection===id?'active':''}" data-action="set-ranking-section" data-id="${id}">${T('rankings.section.'+id)}</button>`).join("")}
  </div>
  <div class="tbl-wrap">
    <table class="rankings-table">
      <colgroup>
        <col style="width:26%;"><col style="width:15%;"><col style="width:12%;">
        <col style="width:15%;"><col style="width:12%;"><col style="width:12%;"><col style="width:8%;">
      </colgroup>
      <thead><tr>
        ${sortTh("Selección","name",rankingSort,"sort-rankings")}
        ${sortTh("Confederación","conf",rankingSort,"sort-rankings")}
        ${sortTh("Ranking FIFA","fifaRank",rankingSort,"sort-rankings")}
        ${sortTh("Puntos FIFA","fifaPoints",rankingSort,"sort-rankings")}
        ${sortTh("Ranking Elo","eloRank",rankingSort,"sort-rankings")}
        ${sortTh("Puntos Elo","elo",rankingSort,"sort-rankings")}
        ${sortTh("Rating","rating",rankingSort,"sort-rankings")}
      </tr></thead>
      <tbody>
      ${sorted.map(t=>`
        <tr data-action="open-team-from-rank" data-id="${t.id}" style="cursor:pointer;">
          <td style="display:flex;align-items:center;gap:8px;">${crestHTML(t, t.logoImg?"width:26px;height:26px;":"width:26px;height:26px;font-size:10px;")}<b>${t.commonName}</b> ${fifaBadge(t)}</td>
          <td>${confBadge(t.conf)}</td>
          <td class="mono">${ranksMap[t.id] ? "#"+ranksMap[t.id] : "—"}</td>
          <td class="mono">${t.fifaPoints!=null ? t.fifaPoints.toLocaleString("es-MX",{minimumFractionDigits:2,maximumFractionDigits:2}) : "—"}</td>
          <td class="mono">${eloRanksMap[t.id] ? "#"+eloRanksMap[t.id] : "—"}</td>
          <td class="mono">${t.eloRating!=null ? Math.round(t.eloRating) : "—"}</td>
          <td class="mono"><b>${teamRating(t)}</b></td>
        </tr>
      `).join("") || `<tr><td colspan="7" style="text-align:center;color:var(--muted);">Sin selecciones en esta confederación</td></tr>`}
      </tbody>
    </table>
  </div>
  `;
}
