/* =========================================================
   COPA MANAGER 2026 — funciones/evento.js
   Modelo editable del torneo (formato, llaves, desempates, mejores
   terceros, premios) y sus vistas/editores, más el cargador del calendario
   oficial. Extracción mecánica: texto y orden idénticos al original (en 3
   zonas; el estado eventoDetailOpen/eventBracketDraft permanece en el
   inline). Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (WC26_*), core/utilidades.js (initials, newId, normalizeName, colorsFor,
   shiftColor), app/textos-ui.js (tabLabel, tabDescHTML), app/modales.js
   (openModal/closeModal/modalConfirm/showToast/imageUploadField) y
   funciones/paises.js (buildMinimalTeamFromCountry), y ANTES del <script>
   inline. Usa en tiempo de ejecución DB, persist y render (inline). No llama
   a calendario ni a selecciones: la dependencia con calendario es
   unidireccional (calendario→evento). Sin ciclo.
   ========================================================= */

/* ---------- EL EVENTO (torneo) ----------
   Modelo editable del torneo, construido a partir del "Regulations for the FIFA World Cup 26"
   (mayo 2026): formato, llaves oficiales (art. 12), criterios de desempate (art. 13),
   bolsas de mejores terceros (art. 12.6 / Anexo C) y premios (art. 45).
   Todo es editable para poder recrear otros torneos (una Euro, Copa América, etc.). */
function buildDefaultEvent(){
  return {
    name:"Copa Mundial de la FIFA [Etiqueta de año]",
    shortName:"Copa Mundial [Etiqueta de año]",
    code:"FWC[Etiqueta de año]",
    officialName:"FIFA World Cup [Etiqueta de año]™",
    logoImg:null,
    // ---- Colores del torneo ----
    color1:"#D4AF37", color2:"#15161D", color3:"#FFFFFF",
    // ---- Próxima edición ----
    year:2026,
    // Formato preferido de la etiqueta de año, independiente por campo: "short" (26) | "long" (2026)
    yearLabelStyle:{ name:"short", shortName:"short", code:"short", officialName:"short" },
    slogan:"We are 26™",
    hosts:["México","Canadá","Estados Unidos"],
    startDate:"2026-06-11",
    endDate:"2026-07-19",
    // ---- Formato ----
    numTeams:48,
    numGroups:12,           // Grupos A–L
    groupSize:4,
    pointsWin:3, pointsDraw:1, pointsLoss:0,
    advancePerGroup:2,      // 1.º y 2.º de cada grupo
    thirdPlaceAdvance:8,    // + los 8 mejores terceros (art. 12.5)
    restDaysMin:3,          // descanso mínimo entre partidos (art. 16.2)
    simultaneousLastRound:true, // última jornada del grupo simultánea (art. 12.4)
    extraTime:true, extraTimeMinutes:15, penalties:true, thirdPlaceMatch:true,
    maxSubs:5, subWindows:3, extraTimeExtraSub:true, concussionSub:true, // art. 36
    squadMin:23, squadMax:26, minGoalkeepers:3, benchOfficials:11,       // art. 24 / 33
    // Posiciones fijas de los anfitriones en el sorteo (art. 12.3)
    hostPositions:[
      {slot:"A1", team:"México"},
      {slot:"B1", team:"Canadá"},
      {slot:"D1", team:"Estados Unidos"}
    ],
    // Patrón de jornadas dentro de cada grupo (art. 12.4). 1..4 = posición del sorteo.
    matchdayPattern:[["1-2","3-4"],["1-3","4-2"],["4-1","2-3"]],
    /* ---- Llaves de eliminación directa (art. 12.6 a 12.11) ----
       Sintaxis de casillas:
       · "1A" / "2B"  → ganador / segundo del grupo
       · "3:ABCDF"    → mejor tercero proveniente de alguno de esos grupos
       · "W73"        → ganador del partido M73  ·  "L101" → perdedor del M101 */
    rounds:[
      {id:"r32", name:"Dieciseisavos de final (Ronda de 32)", matches:[
        {id:"M73", a:"2A", b:"2B"},
        {id:"M74", a:"1E", b:"3:ABCDF"},
        {id:"M75", a:"1F", b:"2C"},
        {id:"M76", a:"1C", b:"2F"},
        {id:"M77", a:"1I", b:"3:CDFGH"},
        {id:"M78", a:"2E", b:"2I"},
        {id:"M79", a:"1A", b:"3:CEFHI"},
        {id:"M80", a:"1L", b:"3:EHIJK"},
        {id:"M81", a:"1D", b:"3:BEFIJ"},
        {id:"M82", a:"1G", b:"3:AEHIJ"},
        {id:"M83", a:"2K", b:"2L"},
        {id:"M84", a:"1H", b:"2J"},
        {id:"M85", a:"1B", b:"3:EFGIJ"},
        {id:"M86", a:"1J", b:"2H"},
        {id:"M87", a:"1K", b:"3:DEIJL"},
        {id:"M88", a:"2D", b:"2G"}
      ]},
      {id:"r16", name:"Octavos de final", matches:[
        {id:"M89", a:"W74", b:"W77"},
        {id:"M90", a:"W73", b:"W75"},
        {id:"M91", a:"W76", b:"W78"},
        {id:"M92", a:"W79", b:"W80"},
        {id:"M93", a:"W83", b:"W84"},
        {id:"M94", a:"W81", b:"W82"},
        {id:"M95", a:"W86", b:"W88"},
        {id:"M96", a:"W85", b:"W87"}
      ]},
      {id:"qf", name:"Cuartos de final", matches:[
        {id:"M97",  a:"W89", b:"W90"},
        {id:"M98",  a:"W93", b:"W94"},
        {id:"M99",  a:"W91", b:"W92"},
        {id:"M100", a:"W95", b:"W96"}
      ]},
      {id:"sf", name:"Semifinales", matches:[
        {id:"M101", a:"W97", b:"W98"},
        {id:"M102", a:"W99", b:"W100"}
      ]},
      {id:"third", name:"Partido por el tercer puesto", matches:[
        {id:"M103", a:"L101", b:"L102"}
      ]},
      {id:"final", name:"Final", matches:[
        {id:"M104", a:"W101", b:"W102"}
      ]}
    ],
    // ---- Criterios de desempate en grupos (art. 13, en orden) ----
    tiebreakersGroup:[
      "Paso 1a — Mayor número de puntos en los partidos entre los equipos implicados",
      "Paso 1b — Mejor diferencia de goles en los partidos entre los equipos implicados",
      "Paso 1c — Mayor número de goles anotados en los partidos entre los equipos implicados",
      "Paso 2 — Reaplicar a–c solo entre los equipos que sigan empatados",
      "Paso 2d — Mejor diferencia de goles en todos los partidos del grupo",
      "Paso 2e — Mayor número de goles anotados en todos los partidos del grupo",
      "Paso 2f — Mayor puntaje de conducta (fair play: tarjetas de jugadores y oficiales)",
      "Paso 3g — Ranking FIFA/Coca-Cola más reciente publicado",
      "Paso 3h — Ediciones anteriores del Ranking FIFA (hacia atrás hasta decidir)"
    ],
    // Puntos de conducta (una sola deducción por persona por partido)
    conductPoints:{ yellow:-1, doubleYellow:-3, directRed:-4, yellowPlusDirectRed:-5 },
    // ---- Ranking de los mejores terceros (art. 13, sección final) ----
    tiebreakersThird:[
      "a — Mayor número de puntos en todos los partidos del grupo",
      "b — Diferencia de goles en todos los partidos del grupo",
      "c — Mayor número de goles anotados en todos los partidos del grupo",
      "d — Mayor puntaje de conducta (calculado como en el paso 2 del art. 13)",
      "e — Ranking FIFA/Coca-Cola más reciente publicado",
      "f — Ediciones anteriores del Ranking FIFA (hacia atrás hasta decidir)"
    ],
    // ---- Premios (art. 45) ----
    awards:[
      {name:"Trofeo de la Copa Mundial de la FIFA", desc:"Se entrega al campeón en la ceremonia; permanece propiedad de la FIFA (recibe el Winner's Trophy)"},
      {name:"Balón de Oro adidas", desc:"Mejor jugador del torneo, elegido por el Grupo de Estudio Técnico (también Plata y Bronce)"},
      {name:"Bota de Oro adidas", desc:"Máximo goleador; desempate por asistencias y luego por menos minutos jugados (también Plata y Bronce)"},
      {name:"Guante de Oro adidas", desc:"Mejor portero del torneo (Grupo de Estudio Técnico)"},
      {name:"Premio al Jugador Joven (Aramco)", desc:"Mejor jugador nacido el 1 de enero de 2005 o después"},
      {name:"Premio Fair Play (McDonald's)", desc:"Selección que gana el concurso de fair play (Anexo B); campaña social de hasta 50,000 USD"}
    ],
    // ---- Historial de ediciones pasadas (editable por el usuario) ----
    history:[]
  };
}

// Letras de los grupos según numGroups (A, B, C...)
function eventGroupLetters(){
  const ev = DB.event; const n = Math.max(1, Math.min(26, ev.numGroups||12));
  return Array.from({length:n}, (_,i)=>String.fromCharCode(65+i));
}
function eventGroupStageMatches(){
  const ev = DB.event; const k = ev.groupSize||4;
  return (ev.numGroups||12) * (k*(k-1)/2);
}
function eventKnockoutMatches(){
  return (DB.event.rounds||[]).reduce((s,r)=>s+(r.matches||[]).length,0);
}
// Casillas de "mejor tercero" definidas en las llaves (las que usan la sintaxis "3:...")
// --- Anexo C: tabla oficial de los 495 cruces de mejores terceros (FIFA World Cup 26) ---
// Clave: los 8 grupos cuyos terceros clasifican (letras ordenadas A→L). Valor: la letra del
// tercero asignado a cada llave, en el orden de columnas WC26_THIRD_COLS. Idéntica a la tabla
// de Wikipedia/FIFA (Anexo C). Se usa como consulta directa para reproducir exactamente la
// asignación oficial; si el torneo no encaja (otro formato), se recurre al backtracking.

function eventThirdSlots(){
  const slots = [];
  (DB.event.rounds||[]).forEach(r=>{
    (r.matches||[]).forEach(m=>{
      ["a","b"].forEach(k=>{
        const v = String(m[k]||"").trim().toUpperCase();
        if(v.startsWith("3:")){
          slots.push({
            matchId:m.id, side:k,
            rival: m[k==="a"?"b":"a"],
            pool: v.slice(2).split("").filter(ch=>/[A-Z]/.test(ch))
          });
        }
      });
    });
  });
  return slots;
}
/* Resuelve el cruce de los mejores terceros: dado el conjunto de grupos cuyos terceros
   clasificaron, asigna cada tercero a una llave cuya bolsa lo admita (emparejamiento
   bipartito con backtracking, en el orden oficial de las llaves). El Anexo C del
   reglamento lista las 495 combinaciones posibles — C(12,8) — que se derivan
   exactamente de estas bolsas; cuando hay varias asignaciones válidas, la FIFA fija
   una opción concreta por combinación, aquí se muestra una asignación válida. */
function solveThirdPairings(groups){
  const slots = eventThirdSlots();
  const gs = [...new Set(groups.map(g=>String(g).toUpperCase()))].sort();
  if(gs.length!==slots.length) return {ok:false, error:`Selecciona exactamente ${slots.length} grupos (elegiste ${gs.length}).`};

  // 1) Vía oficial: si el torneo coincide con el Mundial 26 (8 llaves cuyos rivales son
  //    los ganadores 1A,1B,1D,1E,1G,1I,1K,1L), se usa la tabla del Anexo C tal cual FIFA,
  //    reproduciendo exactamente la asignación oficial de las 495 combinaciones.
  const key = gs.join("");
  const officialRow = (typeof WC26_THIRD_TABLE!=="undefined") ? WC26_THIRD_TABLE[key] : null;
  if(officialRow){
    const rivalByCol = {};
    WC26_THIRD_COLS.forEach((code,i)=>{ rivalByCol[code] = officialRow[i]; }); // "1A" -> letra tercero
    const slotByRival = {};
    slots.forEach(s=>{ slotByRival[String(s.rival||"").toUpperCase()] = s; });
    const haveAllCols = WC26_THIRD_COLS.every(code=>slotByRival[code]);
    if(haveAllCols){
      const pairs = WC26_THIRD_COLS.map(code=>{
        const s = slotByRival[code];
        return {matchId:s.matchId, rival:s.rival, third:rivalByCol[code]};
      });
      // Verificación de seguridad: cada tercero cae en la bolsa de su llave.
      const okPools = pairs.every(p=>{
        const s = slots.find(x=>x.matchId===p.matchId);
        return s && s.pool.includes(p.third);
      });
      if(okPools) return {ok:true, pairs, official:true};
    }
  }

  // 2) Respaldo: emparejamiento con backtracking (torneos personalizados: Euro, etc.).
  const used = new Array(gs.length).fill(false);
  const assign = new Array(slots.length).fill(null);
  function bt(i){
    if(i===slots.length) return true;
    for(let j=0;j<gs.length;j++){
      if(!used[j] && slots[i].pool.includes(gs[j])){
        used[j]=true; assign[i]=gs[j];
        if(bt(i+1)) return true;
        used[j]=false; assign[i]=null;
      }
    }
    return false;
  }
  if(!bt(0)) return {ok:false, error:"No existe una asignación válida con esas bolsas y esos grupos."};
  return {ok:true, pairs: slots.map((s,i)=>({matchId:s.matchId, rival:s.rival, third:assign[i]}))};
}

// Escudo/logo del evento (mismo patrón que crestHTML de selecciones; sin emojis)
function eventCrestHTML(ev, size){
  size = size||110;
  if(ev.logoImg) return `<div class="crest-mini has-img" style="width:${size}px;height:${size}px;"><img src="${ev.logoImg}" alt="${escapeHtml(eventFieldText(ev,'name'))}"></div>`;
  const c1 = ev.color1 || "#d4af37";
  const c2 = ev.color2 || "#7a6216";
  const codeText = eventFieldText(ev,'code') || "FWC26";
  return `<div class="crest-mini" style="width:${size}px;height:${size}px;background:linear-gradient(160deg,${c1},${c2});color:${ev.color3||"#fff"};font-size:${Math.max(11, Math.round(size/4.8))}px;">${escapeHtml(codeText.slice(0,10))}</div>`;
}
function eventFmtDate(d){
  if(!d) return "—";
  const [y,m,dd]=d.split("-");
  const M=["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  return `${parseInt(dd)} ${M[(parseInt(m)||1)-1]} ${y}`;
}

/* ---- Perfil del evento (misma estructura que la ficha de selección) ---- */
function renderEvento(){
  if(eventoDetailOpen) return renderEventoDetail();
  const ev = DB.event;
  return `
  <div class="section-title"><h2>${tabLabel('evento','Copa Mundial™')}</h2></div>
  ${tabDescHTML('evento')}

  <div class="card" style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    ${eventCrestHTML(ev, 150)}
    <div style="flex:1;min-width:220px;">
      <h2 style="margin:0 0 2px;">${escapeHtml(eventFieldText(ev,'name'))}</h2>
      <div style="font-size:13px;color:var(--muted);margin:4px 0 8px;">${eventFmtDate(ev.startDate)} – ${eventFmtDate(ev.endDate)}</div>
      <div class="tag-list">
        ${(ev.hosts||[]).map(h=>`<span class="badge host">${escapeHtml(h)}</span>`).join("")}
        <span class="badge conf">${ev.numTeams} selecciones</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="edit-event-general">Editar evento</button>
      <button class="btn danger sm" data-action="reset-event">Restablecer (Mundial 2026)</button>
    </div>
  </div>

  <div style="margin-top:14px;">
  ${groupsList().map(g=>`
    <div class="group-block">
      <h3><span class="tag">Grupo ${g}</span> ${teamsInGroup(g).length} selecciones</h3>
      <div class="grid cols-4">
        ${teamsInGroupOrdered(g).map(t=>teamCardHTML(t)).join("")}
      </div>
    </div>
  `).join("")}
  </div>

  <div class="card" data-action="open-evento-detail" style="cursor:pointer;margin-top:14px;display:flex;justify-content:space-between;align-items:center;">
    <div>
      <div style="font-weight:700;font-size:14px;">Formato, llaves, cruces, criterios y premios</div>
      <div style="font-size:12.5px;color:var(--muted);margin-top:2px;">Ver y editar todo el reglamento del torneo: fase de grupos, llaves M73–M104, bolsas de terceros, desempates del art. 13 y premios oficiales.</div>
    </div>
    <button class="btn gold sm" data-action="open-evento-detail">Abrir →</button>
  </div>
  `;
}

// Tarjeta de los uniformes de árbitros: muestra hasta los tres primeros (Kit 1, Kit 2 y Kit 3) con
// el mismo render que los uniformes de selecciones, más la marca de ropa vigente.
function refereeKitsCardHTML(){
  if(typeof ensureRefereeKits!=="function") return "";
  const t = ensureRefereeKits();
  if(!t) return "";
  const kits = (t.kits||[]).slice(0,10);
  const marca = refereeKitSponsorName();
  return `
  <div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:${kits.length?'12px':'0'};">
      <div style="font-size:12.5px;color:var(--muted);">Patrocinador de ropa: ${marca?`<b style="color:var(--ink);">${escapeHtml(marca)}</b>`:'<span style="color:var(--muted);">sin definir</span>'}</div>
      <div style="font-size:12px;color:var(--muted);">${(t.kits||[]).length} uniforme${(t.kits||[]).length===1?'':'s'}</div>
    </div>
    ${kits.length ? `
    <div style="display:flex;gap:18px;flex-wrap:wrap;">
      ${kits.map(k=>`
        <div style="text-align:center;width:96px;">
          <div class="kit-render" data-pending data-team-id="${t.id}" data-kit-id="${k.id}" data-action="edit-kit" data-team="${t.id}" data-id="${k.id}" style="width:96px;height:96px;background:var(--surface-2);border-radius:8px;cursor:pointer;" title="Editar este uniforme"></div>
          <div style="font-weight:700;font-size:13px;margin-top:6px;">${escapeHtml(k.label)}</div>
          ${(k.refLocalKit&&k.refLocalCountry)?`<div style="font-size:10.5px;color:var(--muted);">Local · ${escapeHtml(countryShortLabel(k.refLocalCountry))}</div>`:""}
          ${k.refFinalKit?`<div style="font-size:10.5px;color:var(--gold,#d4af37);">Final</div>`:""}
        </div>`).join("")}
    </div>` : `<div class="empty" style="margin:0;"><h3>Sin uniformes de árbitro</h3><p>Agrégalos con “Editar uniformes”.</p></div>`}
  </div>`;
}

/* ---- Detalle del evento: formato, llaves, cruces, criterios y premios ---- */
function renderEventoDetail(){
  const ev = DB.event;
  const thirdSlots = eventThirdSlots();
  return `
  <div class="detail-topbar">
    <button class="btn ghost sm" data-action="back-evento">← Volver</button>
  </div>

  <div class="card" style="margin-top:14px;display:flex;gap:14px;align-items:center;flex-wrap:wrap;">
    ${eventCrestHTML(ev, 54)}
    <div style="flex:1;min-width:200px;">
      <div style="font-weight:800;font-size:16px;">${escapeHtml(eventFieldText(ev,'name'))} <span class="badge conf mono">${escapeHtml(eventFieldText(ev,'code'))}</span></div>
      <div style="font-size:12.5px;color:var(--muted);margin-top:2px;">Reglamento del torneo — todo editable para recrear otros formatos (una Euro, Copa América, etc.)</div>
    </div>
  </div>

  <div class="section-title"><h2>Formato del torneo</h2><button class="btn ghost sm" data-action="edit-event-general">Editar formato</button></div>
  <div class="grid cols-2">
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Fase de grupos</h3>
      <ul style="font-size:13px;color:var(--text);margin:0;padding-left:18px;line-height:1.8;">
        <li>${ev.numGroups} grupos (${eventGroupLetters().join(", ")}) de ${ev.groupSize} equipos, todos contra todos a una vuelta.</li>
        <li>Puntos: <b>${ev.pointsWin}</b> victoria · <b>${ev.pointsDraw}</b> empate · <b>${ev.pointsLoss}</b> derrota.</li>
        <li>Avanzan los <b>${ev.advancePerGroup} primeros</b> de cada grupo${ev.thirdPlaceAdvance?` + los <b>${ev.thirdPlaceAdvance} mejores terceros</b>`:""}.</li>
        <li>Jornadas por grupo: ${(ev.matchdayPattern||[]).map((jd,i)=>`<span class="mono">J${i+1}: ${jd.join(", ")}</span>`).join(" · ")}.</li>
        <li>${ev.simultaneousLastRound?"Última jornada del grupo con <b>horario simultáneo</b>.":"Última jornada sin horario simultáneo."}</li>
        <li>Descanso mínimo entre partidos: ${ev.restDaysMin} días.</li>
        <li>Posiciones fijas de anfitriones: ${(ev.hostPositions||[]).map(h=>`<span class="mono">${escapeHtml(h.slot)}</span> ${escapeHtml(h.team)}`).join(" · ")||"—"}.</li>
      </ul>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Eliminación directa y reglas de juego</h3>
      <ul style="font-size:13px;color:var(--text);margin:0;padding-left:18px;line-height:1.8;">
        <li>Rondas: ${(ev.rounds||[]).map(r=>escapeHtml(r.name)).join(" → ")||"—"}.</li>
        <li>${ev.extraTime?`Empate en eliminación → <b>tiempo extra</b> (2 × ${ev.extraTimeMinutes}')${ev.penalties?" y luego <b>penales</b>":""}.`:"Sin tiempo extra."}</li>
        <li>${ev.thirdPlaceMatch?"Se juega partido por el <b>tercer puesto</b>.":"Sin partido por el tercer puesto."}</li>
        <li>Cambios: hasta <b>${ev.maxSubs}</b> en <b>${ev.subWindows}</b> ventanas${ev.extraTimeExtraSub?" (+1 cambio y +1 ventana en tiempo extra)":""}${ev.concussionSub?"; cambio adicional permanente por conmoción":""}.</li>
        <li>Plantillas: ${ev.squadMin} a <b>${ev.squadMax}</b> jugadores (mín. ${ev.minGoalkeepers} porteros) · hasta ${ev.benchOfficials} oficiales en banca.</li>
      </ul>
    </div>
  </div>

  <div class="section-title"><h2>Llaves de eliminación directa</h2><button class="btn ghost sm" data-action="edit-event-bracket">Editar llaves</button></div>
  <p class="hint" style="margin-top:-6px;">Sintaxis: 1A = ganador del grupo A · 2B = segundo del B · 3:ABCDF = mejor tercero de esa bolsa · W73 / L101 = ganador / perdedor del partido</p>
  <div class="grid cols-2">
    ${(ev.rounds||[]).map(r=>`
      <div class="card" style="padding:12px 14px;">
        <h3 style="margin:0 0 8px;font-size:13.5px;"><span class="tag">${escapeHtml(r.name)}</span> <span style="color:var(--muted);font-weight:500;font-size:12px;">${r.matches.length} partido(s)</span></h3>
        <div class="tbl-wrap"><table>
          <thead><tr><th style="width:64px;">Partido</th><th>Local (A)</th><th>Visita (B)</th></tr></thead>
          <tbody>
            ${r.matches.map(m=>`<tr><td class="mono"><b>${escapeHtml(m.id)}</b></td><td class="mono">${escapeHtml(m.a)}</td><td class="mono">${escapeHtml(m.b)}</td></tr>`).join("")}
          </tbody>
        </table></div>
      </div>`).join("")}
  </div>

  ${thirdSlots.length?`
  <div class="section-title"><h2>Cruces de los mejores terceros</h2><span class="hint">Art. 12.6 — el Anexo C lista las 495 combinaciones posibles (C(12,8)); se derivan de estas bolsas</span></div>
  <div class="grid cols-2">
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Bolsas por llave</h3>
      <div class="tbl-wrap"><table>
        <thead><tr><th>Partido</th><th>Rival fijo</th><th>Tercero puede venir de</th></tr></thead>
        <tbody>
          ${thirdSlots.map(s=>`<tr><td class="mono"><b>${escapeHtml(s.matchId)}</b></td><td class="mono">${escapeHtml(s.rival)}</td><td>${s.pool.map(g=>`<span class="badge conf" style="font-size:10px;">3${g}</span>`).join(" ")}</td></tr>`).join("")}
        </tbody>
      </table></div>
      <p style="font-size:12px;color:var(--muted);margin-bottom:0;">Para editar las bolsas cambia el texto <span class="mono">3:...</span> en «Editar llaves».</p>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Calculadora de cruces</h3>
      <p style="font-size:12.5px;color:var(--muted);margin-top:0;">Marca los <b>${thirdSlots.length}</b> grupos cuyos terceros clasificaron y calcula contra quién juega cada uno (máximo ${thirdSlots.length}).</p>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
        ${eventGroupLetters().map(g=>`<label style="display:flex;align-items:center;gap:4px;font-size:13px;border:1px solid var(--line);border-radius:8px;padding:4px 8px;cursor:pointer;"><input type="checkbox" class="thirds-check" value="${g}" style="width:auto;">3${g}</label>`).join("")}
      </div>
      <button class="btn gold sm" data-action="event-calc-thirds">Calcular cruces</button>
      <div id="thirds-result" style="margin-top:10px;font-size:13px;"></div>
    </div>
  </div>`:""}

  <div class="section-title"><h2>Criterios de desempate</h2><button class="btn ghost sm" data-action="edit-event-tiebreakers">Editar desempates</button></div>
  <div class="grid cols-2">
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Empate en puntos dentro del grupo</h3>
      <ol style="font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
        ${(ev.tiebreakersGroup||[]).map(c=>`<li>${escapeHtml(c)}</li>`).join("")}
      </ol>
      <div style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px;font-size:12.5px;">
        <b>Puntos de conducta (fair play):</b>
        <span class="badge conf" style="font-size:10px;">Amarilla ${ev.conductPoints.yellow}</span>
        <span class="badge conf" style="font-size:10px;">Doble amarilla ${ev.conductPoints.doubleYellow}</span>
        <span class="badge conf" style="font-size:10px;">Roja directa ${ev.conductPoints.directRed}</span>
        <span class="badge conf" style="font-size:10px;">Amarilla + roja directa ${ev.conductPoints.yellowPlusDirectRed}</span>
        <div style="color:var(--muted);margin-top:4px;">Solo una deducción por persona por partido.</div>
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Ranking de los mejores terceros</h3>
      <ol style="font-size:13px;margin:0;padding-left:20px;line-height:1.8;">
        ${(ev.tiebreakersThird||[]).map(c=>`<li>${escapeHtml(c)}</li>`).join("")}
      </ol>
    </div>
  </div>

  <div class="section-title"><h2>Premios oficiales</h2><button class="btn ghost sm" data-action="edit-event-general">Editar premios</button></div>
  <div class="grid cols-3">
    ${(ev.awards||[]).map(a=>`
      <div class="card" style="padding:12px 14px;">
        <div style="font-weight:700;font-size:13.5px;">${escapeHtml(a.name)}</div>
        <div style="font-size:12.5px;color:var(--muted);margin-top:4px;">${escapeHtml(a.desc||"")}</div>
      </div>`).join("") || `<div class="empty">Sin premios definidos</div>`}
  </div>

  <div class="section-title"><h2>Uniformes de árbitros del torneo</h2><button class="btn ghost sm" data-action="manage-kits" data-team="${REFEREE_KIT_TEAM_ID}">Editar uniformes</button></div>
  ${refereeKitsCardHTML()}

  ${(typeof getPressWall==="function") ? `
  <div class="section-title"><h2>Press Wall</h2><span class="hint">Muro de patrocinadores para las fotos de prensa — asigna una marca a cada uno de los 16 espacios (se usa el «Logo en gráficos» de cada patrocinador). Los cambios se ven al instante.</span></div>
  <div class="card">
    <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start;">
      <div>${pressWallComposeHTML(440)}</div>
      <div style="flex:1;min-width:300px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px 14px;">
          ${getPressWall().map((name,i)=>`<label class="field" style="flex-direction:row;align-items:center;gap:8px;font-size:12px;margin:0;"><b style="width:20px;color:var(--muted);text-align:right;flex-shrink:0;">${i+1}</b><select data-action="set-presswall-slot" data-slot="${i}" style="flex:1;min-width:0;">${pressWallSponsorOptions(name)}</select></label>`).join("")}
        </div>
      </div>
    </div>
  </div>` : ""}

  <div class="section-title"><h2>Historial</h2><button class="btn ghost sm" data-action="edit-event-general">Editar historial</button></div>
  ${(ev.history&&ev.history.length)?`
  <div class="card" style="padding:0;overflow:hidden;">
    <div class="tbl-wrap"><table>
      <thead><tr><th style="width:64px;">Año</th><th>Sede(s)</th><th>Campeón</th><th>Subcampeón</th><th>Tercer lugar</th><th>Cuarto lugar</th></tr></thead>
      <tbody>
        ${ev.history.slice().sort((a,b)=>(a.year||0)-(b.year||0)).map(h=>{
          const played = !!(h.champion||"").trim() || (h.hosts||[]).length>0;
          if(!played) return `
          <tr>
            <td class="mono"><b>${escapeHtml(String(h.year||"—"))}</b></td>
            <td colspan="5" style="color:var(--muted);font-style:italic;">No se disputó</td>
          </tr>`;
          return `
          <tr>
            <td class="mono"><b>${escapeHtml(String(h.year||"—"))}</b></td>
            <td>${(h.hosts||[]).length ? (h.hosts||[]).map(x=>historyHostTagHTML(x)).join(" ") : "—"}</td>
            <td>${historyCountryHTML(h.champion)}</td>
            <td>${historyCountryHTML(h.runnerUp)}</td>
            <td>${historyCountryHTML(h.third)}</td>
            <td>${historyCountryHTML(h.fourth)}</td>
          </tr>`;
        }).join("")}
      </tbody>
    </table></div>
  </div>`:`<div class="empty">Aún no hay ediciones en el historial. Usa «Editar historial» para agregarlas.</div>`}
  `;
}

// Límite de la calculadora de cruces: no se pueden marcar más terceros que casillas 3:... existan.
document.addEventListener("change", (e)=>{
  if(!(e.target.matches && e.target.matches(".thirds-check"))) return;
  const max = eventThirdSlots().length;
  if(e.target.checked && document.querySelectorAll(".thirds-check:checked").length>max){
    e.target.checked = false;
    showToast(`Solo puedes marcar ${max} grupos`);
  }
});

/* ---------- Calendario oficial del Mundial 2026 ----------
   Fuente: FIFA World Cup 2026™ Schedule (fechas, horario del Este y estadios).
   Los grupos reales se derivan del propio calendario. */
// [fecha, hora ET, grupo, jornada, equipo A, equipo B, estadio, ciudad]
// [fecha, hora ET, ronda, código de partido, casilla A, casilla B, estadio, ciudad]
// Del R32 los cruces vienen del calendario oficial; de octavos en adelante la asignación
// de códigos M89–M104 por sede es orientativa (el orden real depende de los cruces).
// Busca una selección por nombre (ignorando acentos) con alias conocidos.
function findTeamByNameLoose(name){
  const ALIAS = {"chequia":"republica checa","republica checa":"chequia","rd del congo":"republica democratica del congo","rd congo":"republica democratica del congo","dr congo":"republica democratica del congo","republica democratica del congo":"rd congo"};
  const n = normalizeName(name);
  let t = DB.teams.find(x=>normalizeName(x.commonName)===n);
  if(!t && ALIAS[n]) t = DB.teams.find(x=>normalizeName(x.commonName)===ALIAS[n]);
  return t||null;
}
// Nombre de país del historial: se muestra con su bandera pero SIN enlace — son países (algunos ya
// extintos, como Yugoslavia o la Unión Soviética), no selecciones, así que no llevan a ninguna ficha.
// País anfitrión como etiqueta gris con bandera, al estilo de las de clubes. No es clicable: es un
// PAÍS (a veces ya extinto), no una selección, así que no lleva a ninguna ficha.
function historyHostTagHTML(name){
  const nm = (name||"").trim();
  if(!nm) return "";
  const country = (DB.countries||[]).find(c=>normLoose(c.commonName)===normLoose(nm));
  return `<span class="badge conf" style="background:var(--surface-2);color:var(--muted);white-space:nowrap;">${flagIconHTML(country||nm)}${escapeHtml(nm)}</span>`;
}

function historyCountryHTML(name){
  const nm = (name||"").trim();
  if(!nm) return `<span style="color:var(--muted);">—</span>`;
  const country = (DB.countries||[]).find(c=>normLoose(c.commonName)===normLoose(nm));
  return `<span style="white-space:nowrap;">${flagIconHTML(country||nm)}${escapeHtml(nm)}</span>`;
}

function loadOfficialCalendarConfirm(){
  const msg = DB.fixtures.length>0
    ? "Se reemplazará el calendario actual por el oficial del Mundial 2026 (72 partidos de grupos con fechas, horarios del Este y estadios + 32 de eliminación directa). También se acomodan los grupos reales de las 48 selecciones. ¿Continuar?"
    : "Se cargará el calendario oficial del Mundial 2026 (72 partidos de grupos + 32 de eliminación directa) y se acomodan los grupos reales de las 48 selecciones. ¿Continuar?";
  modalConfirm(msg, doLoadOfficialCalendar, "Cargar calendario");
}
function doLoadOfficialCalendar(){
  const hostSet = new Set(["mexico","canada","estados unidos"]);
  const officialIds = new Set();
  const teamByName = {};
  Object.entries(WC26_GROUPS).forEach(([g, names])=>{
    names.forEach(name=>{
      let t = findTeamByNameLoose(name);
      if(!t){
        const country = (DB.countries||[]).find(c=>normalizeName(c.commonName)===normalizeName(name));
        t = country ? buildMinimalTeamFromCountry(country) : {
          id:newId("t"), officialName:name, commonName:name, shortName:name.slice(0,30),
          fifaCode:initials(name).slice(0,3).toUpperCase(), iocCode:null,
          federationName:null, federationAbbr:null, nicknames:[],
          conf:null, group:"", host:false,
          color1:"#3C4A42", color2:"#1F2A24", awayColor1:"#8a9a90", awayColor2:"#101713",
          kitSponsor:null, logoImg:null, kitHomeImg:null, kitAwayImg:null,
          fifaPoints:null, eloRating:null, players:[], coaches:[], kits:[]
        };
        DB.teams.push(t);
      }
      t.group = g;
      t.host = hostSet.has(normalizeName(t.commonName));
      officialIds.add(t.id);
      teamByName[normalizeName(name)] = t;
    });
  });
  // Las selecciones que no están en el torneo salen del cuadro de grupos (solo si tenían A–L)
  DB.teams.forEach(t=>{
    if(!officialIds.has(t.id) && /^[A-L]$/.test(t.group||"")){ t.group=""; t.host=false; }
  });
  const fx = [];
  WC26_SCHEDULE_GROUPSTAGE.forEach(row=>{
    const [date,time,g,md,a,b,venue,city] = row;
    const ta = teamByName[normalizeName(a)], tb = teamByName[normalizeName(b)];
    if(!ta || !tb) return;
    const matchNo = (typeof matchNumberFor==="function") ? matchNumberFor(g, a, b) : null;
    fx.push({id:newId("f"), stage:"grupos", group:g, matchday:md, teamA:ta.id, teamB:tb.id, matchNo,
             played:false, scoreA:null, scoreB:null, date, time, venue, city});
  });
  WC26_SCHEDULE_KNOCKOUT.forEach(row=>{
    const [date,time,round,code,sa,sb,venue,city] = row;
    fx.push({id:newId("f"), stage:"eliminatoria", round, code, slotA:sa, slotB:sb, group:null,
             matchNo: /^M\d+$/i.test(code||"") ? parseInt(code.slice(1),10) : null,
             teamA:null, teamB:null, played:false, scoreA:null, scoreB:null, date, time, venue, city});
  });
  DB.fixtures = fx;
  persist(); render(); showToast("Calendario oficial cargado: 72 de grupos + 32 de eliminación");
}

/* ---- Modal: datos generales del evento ---- */
// Fila de anfitrión (dinámica, como las nacionalidades: se pueden sumar o quitar)
function eventHostRowHTML(val){
  return `<div class="ev-host-row" style="display:flex;gap:6px;margin-bottom:6px;">
    <input class="ev-host-input" value="${escapeHtml(val||"")}" placeholder="País anfitrión">
    <button type="button" class="btn danger sm" data-action="ev-del-host-row">✕</button>
  </div>`;
}
function modalEditEventGeneral(){
  const ev = DB.event;
  const currentYear = ev.year || 2026;
  const styleMap = ev.yearLabelStyle || {};
  const YEAR_TAG = "[Etiqueta de año]";

  // Convierte una plantilla ("Copa Mundial [Etiqueta de año]") en el HTML interno del campo
  // contenteditable: el texto plano como nodos y la etiqueta como un chip no editable.
  // El chip es pasivo (sin ✕ interna): se agrega/quita solo con el botón externo.
  const templateToInnerHTML = (val) => {
    const parts = String(val||"").split(YEAR_TAG);
    const chip = `<span class="ev-year-chip" contenteditable="false" data-chip="year">Etiqueta de año</span>`;
    return parts.map(p=>escapeHtml(p)).join(chip);
  };

  // Campo con chip embebido (contenteditable), botón +etiqueta, selector XX/XXXX y preview en itálicas.
  // Nota: se usa <div>, NO <label>: dentro de un <label> el clic en el campo reenvía al botón/control
  // asociado y disparaba el toggle de la etiqueta al intentar editar.
  const templateField = (id, label, value, inputStyle) => {
    const val = value || "";
    const hasTag = val.includes(YEAR_TAG);
    // Mapa id del campo -> clave en yearLabelStyle. OJO: "ev-official" y "ev-short" NO se derivan
    // quitando el prefijo (las claves reales son officialName/shortName); con el replace() anterior
    // la elección XXXX de esos dos campos nunca se leía al reabrir y se perdía al guardar.
    const STYLE_KEY = {"ev-official":"officialName","ev-name":"name","ev-short":"shortName","ev-code":"code"};
    const style = styleMap[STYLE_KEY[id] || id.replace("ev-", "")] || "short";
    const preview = renderTemplate(val, resolveYearLabel(style, currentYear));
    const styleBtn = (st, lbl) => `<button type="button" class="btn ${st===style?"gold":"ghost"} sm" data-action="ev-set-field-style" data-field="${id}" data-style="${st}" style="padding:2px 8px;font-size:11px;">${lbl}</button>`;
    return `
      <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;"><span style="font-size:12px;color:var(--muted);font-weight:600;">${label}</span>
        <div style="display:flex;gap:6px;align-items:stretch;">
          <div id="${id}" class="ev-template-input" contenteditable="true"
               data-template-field="1" oninput="updateEventPreviews()"
               style="flex:1;min-height:38px;border:1px solid var(--line);border-radius:8px;padding:8px 10px;background:var(--input-bg,#111);${inputStyle||""}">${templateToInnerHTML(val)}</div>
          <button type="button" class="btn ghost sm" data-action="ev-toggle-year-tag" data-target="${id}" title="${hasTag?"Quitar etiqueta de año":"Agregar etiqueta de año"}" style="flex-shrink:0;white-space:nowrap;">${hasTag?"✕ etiqueta":"+ etiqueta"}</button>
        </div>
        <div style="display:flex;gap:10px;align-items:center;margin-top:4px;flex-wrap:wrap;">
          <span style="font-size:11px;color:var(--muted);">Año como:</span>
          <div class="ev-field-style" data-for="${id}" style="display:flex;gap:4px;">${styleBtn("short","XX")}${styleBtn("long","XXXX")}</div>
          <div class="ev-preview" data-preview-for="${id}" style="font-size:12px;color:var(--muted);font-style:italic;padding-left:2px;">${escapeHtml(preview)}</div>
        </div>
      </div>`;
  };

  openModal(`
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-head"><h2>Editar el evento</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <style>
          .ev-template-input{ font-size:13.5px; line-height:1.6; white-space:pre-wrap; word-break:break-word; }
          .ev-template-input:focus{ outline:none; border-color:var(--gold,#d4af37); }
          .ev-year-chip{ display:inline-flex; align-items:center; background:rgba(212,175,55,0.18);
            border:1px solid rgba(212,175,55,0.55); color:var(--gold,#d4af37); border-radius:6px;
            padding:1px 7px; margin:0 1px; font-size:11.5px; font-weight:700; white-space:nowrap;
            user-select:none; vertical-align:baseline; text-transform:none; }
        </style>
        <div class="form-grid">
          <div class="subhead">Identidad</div>
          ${templateField("ev-official", "Nombre oficial", ev.officialName)}
          ${templateField("ev-name", "Nombre común", ev.name)}
          ${templateField("ev-short", "Nombre corto", ev.shortName)}
          ${templateField("ev-code", "Código", ev.code, "text-transform:uppercase;")}

          ${imageUploadField("Logo del torneo", "evlogo", ev.logoImg, "PNG o JPG. Cuadrado se ve mejor. Si no hay logo se muestra el código en un escudo dorado.")}

          <div class="field" style="grid-column:1/-1;">
            <div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:5px;">Colores del torneo</div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", ev.color1||'#D4AF37', "f-ev-color1")}</label>
              <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", ev.color2||'#15161D', "f-ev-color2")}</label>
              <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", ev.color3||'#FFFFFF', "f-ev-color3")}</label>
            </div>
          </div>

          <div class="subhead">Próxima edición</div>
          <label class="field">Año<input id="ev-year" type="number" min="1900" max="2999" value="${currentYear}" oninput="updateEventPreviews()"></label>
          <label class="field">Inicio<input id="ev-start" type="date" value="${ev.startDate||""}"></label>
          <label class="field">Fin<input id="ev-end" type="date" value="${ev.endDate||""}"></label>
          <label class="field" style="grid-column:1/-1;">Eslogan<input id="ev-slogan" value="${escapeHtml(ev.slogan||"")}"></label>

          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Anfitriones (puedes agregar varios)
            <div id="ev-host-rows">
              ${((ev.hosts&&ev.hosts.length)?ev.hosts:[""]).map(h=>eventHostRowHTML(h)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="ev-add-host-row">+ Agregar anfitrión</button></div>
          </div>
        </div>

        <details class="ev-collapse" style="margin-top:14px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;">
          <summary style="cursor:pointer;font-weight:700;font-size:14px;padding:6px 0;">Formato</summary>
          <div class="form-grid" style="margin-top:8px;">
            <div class="subhead">Fase de grupos</div>
            <label class="field">Selecciones<input id="ev-teams" type="number" min="2" value="${ev.numTeams}"></label>
            <label class="field">Grupos<input id="ev-groups" type="number" min="1" max="26" value="${ev.numGroups}"></label>
            <label class="field">Equipos por grupo<input id="ev-gsize" type="number" min="2" max="8" value="${ev.groupSize}"></label>
            <label class="field">Avanzan por grupo<input id="ev-adv" type="number" min="0" value="${ev.advancePerGroup}"></label>
            <label class="field">Mejores terceros que avanzan<input id="ev-thirds" type="number" min="0" value="${ev.thirdPlaceAdvance}"></label>
            <label class="field">Descanso mínimo (días)<input id="ev-rest" type="number" min="0" value="${ev.restDaysMin}"></label>
            <label class="field">Pts victoria<input id="ev-pw" type="number" value="${ev.pointsWin}"></label>
            <label class="field">Pts empate<input id="ev-pd" type="number" value="${ev.pointsDraw}"></label>
            <label class="field">Pts derrota<input id="ev-pl" type="number" value="${ev.pointsLoss}"></label>
            <label class="field" style="grid-column:1/-1;display:flex;flex-direction:row;align-items:center;gap:8px;">
              <input id="ev-simul" type="checkbox" ${ev.simultaneousLastRound?"checked":""} style="width:auto;">Última jornada del grupo con horario simultáneo
            </label>
            <label class="field" style="grid-column:1/-1;">Posiciones fijas de anfitriones — una por línea, ejemplo: <span class="mono">A1 | México</span>
              <textarea id="ev-hostpos" class="json-area" style="min-height:64px;">${escapeHtml((ev.hostPositions||[]).map(h=>`${h.slot} | ${h.team}`).join("\n"))}</textarea>
            </label>
            <label class="field" style="grid-column:1/-1;">Patrón de jornadas — una jornada por línea, partidos separados por coma, ejemplo: <span class="mono">1-2, 3-4</span>
              <textarea id="ev-mdpattern" class="json-area" style="min-height:64px;">${escapeHtml((ev.matchdayPattern||[]).map(jd=>jd.join(", ")).join("\n"))}</textarea>
            </label>
          </div>
        </details>

        <details class="ev-collapse" style="margin-top:10px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;">
          <summary style="cursor:pointer;font-weight:700;font-size:14px;padding:6px 0;">Reglas de juego y plantillas</summary>
          <div class="form-grid" style="margin-top:8px;">
            <label class="field" style="display:flex;flex-direction:row;align-items:center;gap:8px;"><input id="ev-et" type="checkbox" ${ev.extraTime?"checked":""} style="width:auto;">Tiempo extra</label>
            <label class="field">Minutos por periodo de TE<input id="ev-etmin" type="number" min="1" value="${ev.extraTimeMinutes}"></label>
            <label class="field" style="display:flex;flex-direction:row;align-items:center;gap:8px;"><input id="ev-pen" type="checkbox" ${ev.penalties?"checked":""} style="width:auto;">Penales</label>
            <label class="field" style="display:flex;flex-direction:row;align-items:center;gap:8px;"><input id="ev-third-match" type="checkbox" ${ev.thirdPlaceMatch?"checked":""} style="width:auto;">Partido por el 3.er puesto</label>
            <label class="field">Cambios máximos<input id="ev-subs" type="number" min="0" value="${ev.maxSubs}"></label>
            <label class="field">Ventanas de cambio<input id="ev-windows" type="number" min="0" value="${ev.subWindows}"></label>
            <label class="field">Plantilla mínima<input id="ev-sqmin" type="number" min="1" value="${ev.squadMin}"></label>
            <label class="field">Plantilla máxima<input id="ev-sqmax" type="number" min="1" value="${ev.squadMax}"></label>
            <label class="field">Porteros mínimos<input id="ev-gkmin" type="number" min="0" value="${ev.minGoalkeepers}"></label>
            <label class="field">Oficiales en banca<input id="ev-bench" type="number" min="0" value="${ev.benchOfficials}"></label>
          </div>
        </details>

        <details class="ev-collapse" style="margin-top:10px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;">
          <summary style="cursor:pointer;font-weight:700;font-size:14px;padding:6px 0;">Premios</summary>
          <div class="form-grid" style="margin-top:8px;">
            <div class="subhead">Uno por línea, formato: <span class="mono">Nombre | descripción</span></div>
            <label class="field" style="grid-column:1/-1;">
              <textarea id="ev-awards" class="json-area" style="min-height:110px;">${escapeHtml((ev.awards||[]).map(a=>`${a.name} | ${a.desc||""}`).join("\n"))}</textarea>
            </label>
          </div>
        </details>

        <details class="ev-collapse" style="margin-top:10px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;">
          <summary style="cursor:pointer;font-weight:700;font-size:14px;padding:6px 0;">Historial de ediciones pasadas</summary>
          <div style="margin-top:8px;">
            <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Copas del mundo anteriores. Cada entrada: año, sede(s), campeón, subcampeón y tercer lugar.</div>
            <datalist id="ev-country-list">${(DB.countries||[]).map(c=>`<option value="${escapeHtml(c.commonName)}">`).join("")}</datalist>
            <datalist id="ev-team-list">${(DB.teams||[]).filter(t=>!t.hidden).map(t=>`<option value="${escapeHtml(t.commonName)}">`).join("")}</datalist>
            <div id="ev-history-rows">
              ${((ev.history&&ev.history.length)?ev.history:[]).map((h,i)=>eventHistoryRowHTML(h,i)).join("")}
            </div>
            <div style="margin-top:6px;"><button type="button" class="btn ghost sm" data-action="ev-add-history-row">+ Agregar edición</button></div>
          </div>
        </details>

      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-event-general">Guardar</button>
      </div>
    </div>
  `);
}
function saveEventGeneral(){
  const ev = DB.event;
  const v = id => document.getElementById(id).value;
  const n = (id, def) => { const x = parseInt(v(id)); return isNaN(x)?def:x; };
  const chk = id => document.getElementById(id).checked;

  // ---- Identidad ----
  ev.logoImg = document.getElementById("f-evlogo-data").value || null;
  const tpl = id => readTemplateField(document.getElementById(id));
  ev.name = tpl("ev-name") || ev.name;
  ev.shortName = tpl("ev-short");
  // El código va en mayúsculas, pero SIN tocar el placeholder [Etiqueta de año] (si se pone en
  // mayúsculas deja de coincidir y la etiqueta se rompe). Se separa por el placeholder y solo se
  // capitaliza el texto real del usuario.
  const TAG = "[Etiqueta de año]";
  ev.code = tpl("ev-code").split(TAG).map(part=>part.toUpperCase()).join(TAG).slice(0,40);
  ev.officialName = tpl("ev-official");
  ev.color1 = document.getElementById("f-ev-color1").value;
  ev.color2 = document.getElementById("f-ev-color2").value;
  ev.color3 = document.getElementById("f-ev-color3").value;
  ev.yearLabelStyle = {
    name: fieldYearStyle("ev-name"),
    shortName: fieldYearStyle("ev-short"),
    code: fieldYearStyle("ev-code"),
    officialName: fieldYearStyle("ev-official")
  };

  // ---- Próxima edición ----
  ev.year = n("ev-year", ev.year || 2026);
  ev.startDate = v("ev-start"); ev.endDate = v("ev-end");
  ev.slogan = v("ev-slogan").trim();
  ev.hosts = [...document.querySelectorAll("#ev-host-rows .ev-host-input")].map(i=>i.value.trim()).filter(Boolean);

  // ---- Formato ----
  ev.numTeams = n("ev-teams", ev.numTeams);
  ev.numGroups = Math.max(1, Math.min(26, n("ev-groups", ev.numGroups)));
  ev.groupSize = n("ev-gsize", ev.groupSize);
  ev.advancePerGroup = n("ev-adv", ev.advancePerGroup);
  ev.thirdPlaceAdvance = n("ev-thirds", ev.thirdPlaceAdvance);
  ev.restDaysMin = n("ev-rest", ev.restDaysMin);
  ev.pointsWin = n("ev-pw", ev.pointsWin); ev.pointsDraw = n("ev-pd", ev.pointsDraw); ev.pointsLoss = n("ev-pl", ev.pointsLoss);
  ev.simultaneousLastRound = chk("ev-simul");
  ev.hostPositions = v("ev-hostpos").split("\n").map(line=>{
    const [slot, team] = line.split("|").map(s=>(s||"").trim());
    return slot ? {slot, team:team||""} : null;
  }).filter(Boolean);
  ev.matchdayPattern = v("ev-mdpattern").split("\n").map(line=>line.split(",").map(s=>s.trim()).filter(Boolean)).filter(jd=>jd.length);

  // ---- Reglas ----
  ev.extraTime = chk("ev-et"); ev.extraTimeMinutes = n("ev-etmin", ev.extraTimeMinutes);
  ev.penalties = chk("ev-pen"); ev.thirdPlaceMatch = chk("ev-third-match");
  ev.maxSubs = n("ev-subs", ev.maxSubs); ev.subWindows = n("ev-windows", ev.subWindows);
  ev.squadMin = n("ev-sqmin", ev.squadMin); ev.squadMax = n("ev-sqmax", ev.squadMax);
  ev.minGoalkeepers = n("ev-gkmin", ev.minGoalkeepers); ev.benchOfficials = n("ev-bench", ev.benchOfficials);

  // ---- Premios ----
  ev.awards = v("ev-awards").split("\n").map(line=>{
    const i = line.indexOf("|");
    const name = (i>=0?line.slice(0,i):line).trim();
    const desc = (i>=0?line.slice(i+1):"").trim();
    return name?{name,desc}:null;
  }).filter(Boolean);

  // ---- Historial ----
  ev.history = [...document.querySelectorAll("#ev-history-rows .ev-history-row")].map(row=>{
    const yearVal = parseInt(row.querySelector(".evh-year").value);
    const hosts = [...row.querySelectorAll(".evh-host-input")].map(i=>i.value.trim()).filter(Boolean);
    const champion = row.querySelector(".evh-champion").value.trim();
    const runnerUp = row.querySelector(".evh-runnerup").value.trim();
    const third = row.querySelector(".evh-third").value.trim();
    const fourth = row.querySelector(".evh-fourth").value.trim();
    if(!yearVal && !hosts.length && !champion && !runnerUp && !third && !fourth) return null;
    return {year:yearVal||null, hosts, champion, runnerUp, third, fourth};
  }).filter(Boolean).sort((a,b)=>(b.year||0)-(a.year||0));

  persist(); closeModal(); render(); showToast("Evento actualizado ✔");
}

function modalEditEventBracket(){
  if(!eventBracketDraft) eventBracketDraft = JSON.parse(JSON.stringify(DB.event.rounds||[]));
  openModal(`
    <div class="modal-box" style="max-width:760px;">
      <div class="modal-head"><h2>Editar llaves de eliminación directa</h2><button class="modal-close" data-action="close-event-bracket">×</button></div>
      <div class="modal-body">
        <p style="font-size:12.5px;color:var(--muted);margin-top:0;">Sintaxis de casillas: <span class="mono">1A</span> ganador del grupo A · <span class="mono">2B</span> segundo del B · <span class="mono">3:ABCDF</span> mejor tercero de esa bolsa · <span class="mono">W73</span> ganador del M73 · <span class="mono">L101</span> perdedor del M101. Para un torneo tipo Euro cambia el número de grupos en «Datos generales» y arma aquí sus rondas (p. ej. octavos con <span class="mono">3:ABC…</span> de 4 mejores terceros).</p>
        ${eventBracketDraft.map((r,ri)=>`
          <div class="card" style="padding:10px 12px;margin-bottom:10px;">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
              <input id="ebr-name-${ri}" value="${escapeHtml(r.name)}" style="flex:1;font-weight:700;">
              <button class="btn danger sm" data-action="event-bracket-del-round" data-ri="${ri}">Eliminar ronda</button>
            </div>
            ${r.matches.map((m,mi)=>`
              <div style="display:flex;gap:6px;align-items:center;margin-bottom:6px;">
                <input id="ebr-id-${ri}-${mi}" value="${escapeHtml(m.id)}" class="mono" style="width:82px;" title="ID del partido">
                <input id="ebr-a-${ri}-${mi}" value="${escapeHtml(m.a)}" class="mono" style="flex:1;" title="Equipo A">
                <span style="color:var(--muted);font-size:12px;">vs</span>
                <input id="ebr-b-${ri}-${mi}" value="${escapeHtml(m.b)}" class="mono" style="flex:1;" title="Equipo B">
                <button class="btn danger sm" data-action="event-bracket-del-match" data-ri="${ri}" data-mi="${mi}">✕</button>
              </div>`).join("")}
            <button class="btn ghost sm" data-action="event-bracket-add-match" data-ri="${ri}">+ Agregar partido</button>
          </div>`).join("")}
        <button class="btn ghost" data-action="event-bracket-add-round">+ Agregar ronda</button>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-event-bracket">Cancelar</button>
        <button class="btn gold" data-action="save-event-bracket">Guardar llaves</button>
      </div>
    </div>
  `);
}
// Lee lo escrito en los inputs del modal hacia el borrador (para no perder cambios al agregar/quitar filas)
function readEventBracketDraftFromDOM(){
  if(!eventBracketDraft) return;
  eventBracketDraft.forEach((r,ri)=>{
    const nameEl = document.getElementById(`ebr-name-${ri}`);
    if(nameEl) r.name = nameEl.value;
    r.matches.forEach((m,mi)=>{
      const idEl = document.getElementById(`ebr-id-${ri}-${mi}`);
      const aEl = document.getElementById(`ebr-a-${ri}-${mi}`);
      const bEl = document.getElementById(`ebr-b-${ri}-${mi}`);
      if(idEl) m.id = idEl.value.trim();
      if(aEl) m.a = aEl.value.trim();
      if(bEl) m.b = bEl.value.trim();
    });
  });
}
function saveEventBracket(){
  readEventBracketDraftFromDOM();
  DB.event.rounds = eventBracketDraft.map(r=>({
    id: r.id || uid(),
    name: (r.name||"Ronda").trim(),
    matches: r.matches.filter(m=>m.id||m.a||m.b).map(m=>({id:m.id||"M?", a:m.a||"", b:m.b||""}))
  }));
  eventBracketDraft = null;
  persist(); closeModal(); render(); showToast("Llaves actualizadas ✔");
}

/* ---- Modal: criterios de desempate ---- */
function modalEditEventTiebreakers(){
  const ev = DB.event;
  openModal(`
    <div class="modal-box" style="max-width:680px;">
      <div class="modal-head"><h2>Editar criterios de desempate</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <p style="font-size:12.5px;color:var(--muted);margin-top:0;">Un criterio por línea, <b>en orden de aplicación</b>. Puedes reescribirlos, reordenarlos, borrar o agregar (p. ej. para una Euro: sin head-to-head reaplicado, o «sorteo» como último recurso).</p>
        <label class="field">Empate en puntos dentro del grupo (art. 13)
          <textarea id="ev-tb-group" class="json-area" style="min-height:170px;">${escapeHtml((ev.tiebreakersGroup||[]).join("\n"))}</textarea>
        </label>
        <div class="form-grid" style="margin-top:10px;">
          <div class="subhead">Puntos de conducta (fair play)</div>
          <label class="field">Amarilla<input id="ev-cp-y" type="number" value="${ev.conductPoints.yellow}"></label>
          <label class="field">Doble amarilla (roja indirecta)<input id="ev-cp-yy" type="number" value="${ev.conductPoints.doubleYellow}"></label>
          <label class="field">Roja directa<input id="ev-cp-r" type="number" value="${ev.conductPoints.directRed}"></label>
          <label class="field">Amarilla + roja directa<input id="ev-cp-yr" type="number" value="${ev.conductPoints.yellowPlusDirectRed}"></label>
        </div>
        <label class="field" style="margin-top:10px;">Ranking de los mejores terceros
          <textarea id="ev-tb-third" class="json-area" style="min-height:130px;">${escapeHtml((ev.tiebreakersThird||[]).join("\n"))}</textarea>
        </label>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-event-tiebreakers">Guardar</button>
      </div>
    </div>
  `);
}
function saveEventTiebreakers(){
  const ev = DB.event;
  const lines = id => document.getElementById(id).value.split("\n").map(s=>s.trim()).filter(Boolean);
  const num = (id, def) => { const x = parseInt(document.getElementById(id).value); return isNaN(x)?def:x; };
  ev.tiebreakersGroup = lines("ev-tb-group");
  ev.tiebreakersThird = lines("ev-tb-third");
  ev.conductPoints = {
    yellow: num("ev-cp-y", -1),
    doubleYellow: num("ev-cp-yy", -3),
    directRed: num("ev-cp-r", -4),
    yellowPlusDirectRed: num("ev-cp-yr", -5)
  };
  persist(); closeModal(); render(); showToast("Criterios actualizados ✔");
}

/* ---------- Helpers de la Etiqueta de año e Historial (editor del evento) ---------- */

// Representación textual del año según el estilo: "short"/"26" = 2 dígitos · "long"/"2026" = completo.
function resolveYearLabel(style, year){
  const y = parseInt(year) || 2026;
  if(style === "long" || style === "2026") return String(y);
  return String(y % 100).padStart(2, "0"); // "short" / "26" / default
}

// Reemplaza el placeholder [Etiqueta de año] por el texto resuelto, en cualquier posición.
function renderTemplate(text, yearLabel){
  return (text||"").split("[Etiqueta de año]").join(yearLabel||"");
}

// Texto final de un campo del evento (name/shortName/code/officialName) resolviendo su etiqueta
// de año con el estilo elegido para ese campo. Usado por las vistas y por otras pantallas.
function eventFieldText(ev, field){
  ev = ev || DB.event;
  const raw = ev[field] || "";
  const style = (ev.yearLabelStyle && ev.yearLabelStyle[field]) || "short";
  return renderTemplate(raw, resolveYearLabel(style, ev.year||2026));
}
// Nombre común y Nombre corto del evento, ya con el año resuelto. Con respaldo a WC_LABEL si aún
// no hay evento (p. ej. durante la construcción de la base). Se usan en títulos y etiquetas de
// Estadios y Patrocinadores para que sigan cualquier renombre del torneo.
function eventCommonName(){
  try{ return (DB && DB.event && eventFieldText(DB.event,'name')) || WC_LABEL; }catch(e){ return WC_LABEL; }
}
function eventShortNameLabel(){
  try{ return (DB && DB.event && eventFieldText(DB.event,'shortName')) || WC_LABEL; }catch(e){ return WC_LABEL; }
}

// Convierte un color #RRGGBB a rgba(r,g,b,alpha). Si el hex es inválido, usa el dorado por defecto.
function hexToRgba(hex, alpha){
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex||"").trim());
  const int = m ? parseInt(m[1],16) : 0xD4AF37;
  const r = (int>>16)&255, g = (int>>8)&255, b = int&255;
  return `rgba(${r},${g},${b},${alpha==null?1:alpha})`;
}

// Lee un campo contenteditable con chip y reconstruye la plantilla ("...[Etiqueta de año]...").
// Los chips (spans con data-chip) se convierten de vuelta al placeholder; el resto es texto plano.
function readTemplateField(el){
  if(!el) return "";
  let out = "";
  el.childNodes.forEach(node=>{
    if(node.nodeType === 3){ // texto
      out += node.textContent;
    } else if(node.nodeType === 1){
      if(node.dataset && node.dataset.chip === "year") out += "[Etiqueta de año]";
      else out += node.textContent; // por si el navegador insertó otro elemento
    }
  });
  return out.replace(/\u00a0/g, " ").trim();
}

// Estilo de año elegido por campo (lee el botón activo de ese campo, default "short").
function fieldYearStyle(fieldId){
  const box = document.querySelector(`.ev-field-style[data-for="${fieldId}"] .btn.gold`);
  return (box && box.dataset && box.dataset.style) || "short";
}

// Actualiza los previews (en itálicas) y el texto de los botones +/✕ etiqueta.
// Se invoca desde el oninput de los campos y desde los cases de handleAction.
function updateEventPreviews(){
  const yearInput = document.getElementById("ev-year");
  const year = yearInput ? (parseInt(yearInput.value)||2026) : 2026;
  document.querySelectorAll(".ev-preview").forEach(prev=>{
    const id = prev.dataset.previewFor;
    const el = document.getElementById(id);
    if(!el) return;
    const tpl = readTemplateField(el);
    prev.textContent = renderTemplate(tpl, resolveYearLabel(fieldYearStyle(id), year));
  });
  document.querySelectorAll('[data-action="ev-toggle-year-tag"]').forEach(btn=>{
    const el = document.getElementById(btn.dataset.target);
    if(!el) return;
    const hasTag = !!el.querySelector('[data-chip="year"]');
    btn.textContent = hasTag ? "✕ etiqueta" : "+ etiqueta";
    btn.title = hasTag ? "Quitar etiqueta de año" : "Agregar etiqueta de año";
  });
}

// Fila de sede dentro de una entrada del historial.
function eventHistoryHostRowHTML(val){
  return `<div class="evh-host-row" style="display:flex;gap:6px;margin-bottom:6px;">
    <input class="evh-host-input" list="ev-country-list" value="${escapeHtml(val||"")}" placeholder="País sede">
    <button type="button" class="btn danger sm" data-action="ev-del-history-host-row">✕</button>
  </div>`;
}

// Entrada completa del historial de ediciones pasadas.
function eventHistoryRowHTML(entry, idx){
  entry = entry || {year:"", hosts:[""], champion:"", runnerUp:"", third:"", fourth:""};
  const hosts = (entry.hosts && entry.hosts.length) ? entry.hosts : [""];
  return `
    <div class="ev-history-row" data-idx="${idx}" style="border:1px solid var(--line);border-radius:10px;padding:10px;margin-bottom:8px;">
      <div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <label class="field" style="flex:0 0 auto;">Año<input class="evh-year" type="number" min="1900" max="2999" value="${escapeHtml(String(entry.year||""))}" style="width:100px;"></label>
        <button type="button" class="btn danger sm" data-action="ev-del-history-row" title="Eliminar edición">✕ edición</button>
      </div>
      <div class="field" style="display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Sede(s)
        <div class="evh-host-rows">
          ${hosts.map(h=>eventHistoryHostRowHTML(h)).join("")}
        </div>
        <div><button type="button" class="btn ghost sm" data-action="ev-add-history-host-row">+ Agregar sede</button></div>
      </div>
      <div class="form-grid" style="margin-top:8px;">
        <label class="field">Campeón<input class="evh-champion" list="ev-team-list" value="${escapeHtml(entry.champion||"")}"></label>
        <label class="field">Subcampeón<input class="evh-runnerup" list="ev-team-list" value="${escapeHtml(entry.runnerUp||"")}"></label>
        <label class="field">Tercer lugar<input class="evh-third" list="ev-team-list" value="${escapeHtml(entry.third||"")}"></label>
        <label class="field">Cuarto lugar<input class="evh-fourth" list="ev-team-list" value="${escapeHtml(entry.fourth||"")}"></label>
      </div>
    </div>`;
}
