/* =========================================================
   COPA MANAGER 2026 — funciones/calendario.js
   Fixtures, tablas de grupo y simulación de partidos. Extracción mecánica:
   texto y orden idénticos al original (2 clústeres: calendario y el
   sub-bloque de simulación "chapas" —poisson/rollDice, lógica pura—).
   Script CLÁSICO (no module). Cargar DESPUÉS de core/utilidades.js
   (escapeHtml), app/textos-ui.js (tabLabel, tabDescHTML), funciones/estadios.js
   (findStadiumByName, stadiumDisplayName) y app/modales.js (openModal,
   modalConfirm, showToast), y ANTES del <script> inline. Usa en tiempo de
   ejecución DB, getTeam, teamRating, persist (inline). No llama a evento
   (las funciones de estructura del torneo son internas de evento). Sin ciclo.
   ========================================================= */

/* ---------- CALENDARIO ---------- */
function roundRobin(teamIds, groupId){
  const fixtures = [];
  for(let i=0;i<teamIds.length;i++){
    for(let j=i+1;j<teamIds.length;j++){
      fixtures.push({id:newId("f"), group:groupId, teamA:teamIds[i], teamB:teamIds[j], played:false, scoreA:null, scoreB:null});
    }
  }
  return fixtures;
}
function generateAllFixtures(){
  const doGenerate = ()=>{
    const fixtures = [];
    groupsList().forEach(g=>{
      const ids = teamsInGroup(g).map(t=>t.id);
      if(ids.length>=2) fixtures.push(...roundRobin(ids, g));
    });
    DB.fixtures = fixtures;
    persist();
    showToast("Calendario generado");
    render();
  };
  if(DB.fixtures.length>0){
    modalConfirm("Ya existen partidos generados. ¿Borrar y regenerar todo el calendario?", doGenerate, "Regenerar");
  } else {
    doGenerate();
  }
}
function clearAllFixtures(){
  if(DB.fixtures.length===0){ showToast("El calendario ya está vacío"); return; }
  modalConfirm("¿Borrar todo el calendario? Se eliminarán todos los partidos y sus resultados.", ()=>{
    DB.fixtures = [];
    persist();
    showToast("Calendario borrado");
    render();
  }, "Borrar");
}

function standingsFor(group){
  const teams = teamsInGroupOrdered(group);
  const table = {};
  teams.forEach(t=> table[t.id] = {team:t, pj:0,g:0,e:0,p:0,gf:0,gc:0,pts:0});
  DB.fixtures.filter(f=>f.group===group && f.played).forEach(f=>{
    const a = table[f.teamA], b = table[f.teamB];
    if(!a||!b) return;
    a.pj++; b.pj++; a.gf+=f.scoreA; a.gc+=f.scoreB; b.gf+=f.scoreB; b.gc+=f.scoreA;
    if(f.scoreA>f.scoreB){ a.g++; a.pts+=3; b.p++; }
    else if(f.scoreA<f.scoreB){ b.g++; b.pts+=3; a.p++; }
    else { a.e++; b.e++; a.pts++; b.pts++; }
  });
  return Object.values(table).sort((x,y)=> y.pts-x.pts || (y.gf-y.gc)-(x.gf-x.gc) || y.gf-x.gf || groupSlotIndex(x.team)-groupSlotIndex(y.team));
}

function fmtFixtureDate(d){
  if(!d) return "";
  const [y,m,dd]=d.split("-");
  const M=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${parseInt(dd)} ${M[(parseInt(m)||1)-1]}`;
}
// Nombre de la ronda de eliminación a partir del código del partido (M73 → Dieciseisavos, etc.)
function knockoutRoundName(code){
  for(const r of (DB.event.rounds||[])){
    if((r.matches||[]).some(m=>m.id===code)) return r.name;
  }
  return code||"Eliminación directa";
}
function fixtureSortKey(f){ return (f.date||"9999")+"T"+(f.time||"99:99"); }

// Nombre de sede: resuelve el estadio por cualquiera de sus nombres para mostrar siempre el
// nombre de torneo FIFA, pero se muestra como texto (no es un enlace clicable).
function venueLinkHTML(venueName, cityName){
  const nm = (venueName||"").trim();
  if(!nm) return "";
  const st = findStadiumByName(nm);
  const shown = st ? stadiumDisplayName(st) : nm;
  const cityPart = cityName ? `, ${escapeHtml(cityName)}` : "";
  return `${escapeHtml(shown)}${cityPart}`;
}
function renderCalendario(){
  const groupFx = DB.fixtures.filter(f=>!f.stage || f.stage==="grupos");
  const koFx = DB.fixtures.filter(f=>f.stage==="eliminatoria");
  if(DB.fixtures.length===0){
    return `
    <div class="section-title"><h2>${tabLabel('calendario','Calendario')}</h2></div>
    ${tabDescHTML('calendario')}
    <div class="empty">
      <h3>Aún no hay partidos generados</h3>
      <p>Carga el calendario oficial del Mundial 2026 — fechas reales, horario del Este (ET) y estadios — o genera enfrentamientos automáticos de los grupos actuales.</p>
      <div style="display:flex;gap:8px;justify-content:center;margin-top:10px;flex-wrap:wrap;">
        <button class="btn gold" data-action="load-official-calendar">Cargar calendario oficial</button>
        <button class="btn ghost" data-action="generate-fixtures">Generar todos contra todos</button>
      </div>
    </div>`;
  }
  const groups = groupsList();
  return `
  <div class="section-title"><h2>${tabLabel('calendario','Calendario')}</h2><div style="display:flex;gap:8px;flex-wrap:wrap;"><button class="btn gold sm" data-action="load-official-calendar">Cargar calendario oficial</button><button class="btn danger sm" data-action="clear-fixtures">Borrar calendario</button></div></div>
  ${tabDescHTML('calendario')}
  ${groups.map(g=>{
    const fixtures = groupFx.filter(f=>f.group===g).slice().sort((a,b)=>fixtureSortKey(a).localeCompare(fixtureSortKey(b)));
    if(!fixtures.length) return "";
    const table = standingsFor(g);
    return `
    <div class="group-block">
      <h3><span class="tag">Grupo ${g}</span></h3>
      <div class="grid cols-2">
        <div class="tbl-wrap">
          <table>
            <thead><tr><th>Pos</th><th>Equipo</th><th>PJ</th><th>Pts</th><th>DG</th></tr></thead>
            <tbody>
            ${table.map((row,i)=>`
              <tr data-action="open-team" data-id="${row.team.id}" style="cursor:pointer;">
                <td>${i+1}</td>
                <td>${escapeHtml(row.team.commonName)}</td>
                <td class="mono">${row.pj}</td>
                <td class="mono"><b>${row.pts}</b></td>
                <td class="mono">${row.gf-row.gc>0?"+":""}${row.gf-row.gc}</td>
              </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <div class="card" style="padding:10px 14px;">
          ${fixtures.map(f=>{
            const ta=getTeam(f.teamA), tb=getTeam(f.teamB);
            return `
            <div class="player-row">
              <div style="flex:1;min-width:0;">
                <div style="font-size:13px;">${ta?escapeHtml(ta.commonName):'<span class="mono">?</span>'} <span style="color:var(--muted);">vs</span> ${tb?escapeHtml(tb.commonName):'<span class="mono">?</span>'}</div>
                ${f.date?`<div style="font-size:11px;color:var(--muted);margin-top:1px;">${fmtFixtureDate(f.date)} · ${f.time||""}${f.venue?` · ${venueLinkHTML(f.venue, f.city)}`:(f.city?`, ${escapeHtml(f.city)}`:"")}</div>`:""}
              </div>
              ${f.played ? `<span class="mono" style="font-weight:700;">${f.scoreA} - ${f.scoreB}</span>` :
                `<button class="btn sm gold" data-action="open-sim" data-fixture="${f.id}">Tirar chapas</button>`}
            </div>`;
          }).join("")}
        </div>
      </div>
    </div>`;
  }).join("")}
  ${koFx.length?`
  <div class="section-title"><h2>Fase de eliminación directa</h2><span class="hint">Horario del Este (ET). El cruce exacto de octavos en adelante se define con los resultados; la asignación de códigos por sede es orientativa.</span></div>
  ${(function(){
    const order = (DB.event.rounds||[]).map(r=>r.name);
    const byRound = {};
    koFx.forEach(f=>{ const rn = knockoutRoundName(f.code); (byRound[rn]=byRound[rn]||[]).push(f); });
    const names = [...order.filter(n=>byRound[n]), ...Object.keys(byRound).filter(n=>!order.includes(n))];
    return names.map(rn=>{
      const rows = byRound[rn].slice().sort((a,b)=>fixtureSortKey(a).localeCompare(fixtureSortKey(b)));
      return `
      <div class="group-block">
        <h3><span class="tag">${escapeHtml(rn)}</span></h3>
        <div class="tbl-wrap">
          <table>
            <thead><tr><th style="width:70px;">Partido</th><th>Cruce</th><th>Fecha</th><th>Hora (ET)</th><th>Estadio</th></tr></thead>
            <tbody>
            ${rows.map(f=>{
              const ta=f.teamA?getTeam(f.teamA):null, tb=f.teamB?getTeam(f.teamB):null;
              const cruce = (ta&&tb) ? `${escapeHtml(ta.commonName)} vs ${escapeHtml(tb.commonName)}` : `<span class="mono">${escapeHtml(f.slotA||"?")}</span> vs <span class="mono">${escapeHtml(f.slotB||"?")}</span>`;
              return `<tr>
                <td class="mono"><b>${escapeHtml(f.code||"")}</b></td>
                <td>${cruce}${f.played?` <span class="mono" style="font-weight:700;">(${f.scoreA} - ${f.scoreB})</span>`:""}</td>
                <td class="mono">${fmtFixtureDate(f.date)}</td>
                <td class="mono">${f.time||""}</td>
                <td style="font-size:12.5px;">${f.venue?venueLinkHTML(f.venue, f.city):(f.city?`<span style="color:var(--muted);">${escapeHtml(f.city)}</span>`:"")}</td>
              </tr>`;
            }).join("")}
            </tbody>
          </table>
        </div>
      </div>`;
    }).join("");
  })()}
  `:""}
  `;
}

/* ---------- Simulación "chapas" ---------- */
function poisson(lambda){
  const L = Math.exp(-lambda); let k=0, p=1;
  do{ k++; p*=Math.random(); }while(p>L && k<10);
  return k-1;
}
function openSimModal(fixtureId){
  const f = DB.fixtures.find(x=>x.id===fixtureId);
  const ta = getTeam(f.teamA), tb = getTeam(f.teamB);
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>Simular partido</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="scoreboard">
          <div class="sb-row">
            <div class="sb-team"><div class="nm">${ta.fifaCode}</div></div>
            <div class="sb-score" id="sb-a">0</div>
            <div class="sb-vs">VS</div>
            <div class="sb-score" id="sb-b">0</div>
            <div class="sb-team"><div class="nm">${tb.fifaCode}</div></div>
          </div>
          <div class="dice-row" id="dice-row">
            <div class="die">🎲</div><div class="die">🎲</div><div class="die">🎲</div>
            <div class="die">🎲</div><div class="die">🎲</div><div class="die">🎲</div>
          </div>
        </div>
        <p style="font-size:12px;color:var(--muted);text-align:center;margin-top:14px;">Ratings: ${ta.commonName} ${teamRating(ta)} — ${tb.commonName} ${teamRating(tb)}. El resultado combina dados con la fuerza de cada plantilla.</p>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">${T('general.sim.closeButton')}</button>
        <button class="btn gold" id="btn-roll" data-action="roll-dice" data-fixture="${f.id}">${T('general.sim.rollButton')}</button>
      </div>
    </div>
  `);
}
function rollDice(fixtureId){
  const f = DB.fixtures.find(x=>x.id===fixtureId);
  const ta = getTeam(f.teamA), tb = getTeam(f.teamB);
  const dice = document.querySelectorAll("#dice-row .die");
  const rollBtn = document.getElementById("btn-roll");
  rollBtn.disabled = true;
  dice.forEach(d=>d.classList.add("rolling"));
  let ticks = 0;
  const interval = setInterval(()=>{
    dice.forEach(d=>d.textContent = Math.ceil(Math.random()*6));
    ticks++;
    if(ticks>10){
      clearInterval(interval);
      dice.forEach(d=>d.classList.remove("rolling"));
      const ra = teamRating(ta), rb = teamRating(tb);
      const lambdaA = Math.max(0.35, 1.3 + (ra-rb)/22);
      const lambdaB = Math.max(0.35, 1.3 + (rb-ra)/22);
      const goalsA = Math.min(9, poisson(lambdaA));
      const goalsB = Math.min(9, poisson(lambdaB));
      document.getElementById("sb-a").textContent = goalsA;
      document.getElementById("sb-b").textContent = goalsB;
      f.played = true; f.scoreA = goalsA; f.scoreB = goalsB;
      persist();
      showToast(`Final: ${ta.commonName} ${goalsA} - ${goalsB} ${tb.commonName}`);
      rollBtn.textContent = "¡Listo!";
    }
  }, 90);
}
