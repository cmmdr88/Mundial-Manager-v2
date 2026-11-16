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
    logoImgLight:null,
    wordmarkImg:null,
    wordmarkImgLight:null,
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
      {id:"r32", name:"Dieciseisavos de final", matches:[
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
      {id:"sf", name:"Semifinal", matches:[
        {id:"M101", a:"W97", b:"W98"},
        {id:"M102", a:"W99", b:"W100"}
      ]},
      {id:"third", name:"Tercer lugar", matches:[
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
      {name:"Premio Fair Play (McDonald's)", desc:"Selección que gana el concurso de fair play (Anexo B); campaña social de hasta 50,000 USD"},
      {key:"potm", name:"Superior Player of the Match", desc:"Mejor jugador de cada partido (Michelob ULTRA)"}
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

/* ---- Perfil del evento: encabezado como el de una selección o club; debajo, a la izquierda los partidos
   del día (con flechas para ir de un día con partidos al siguiente, del 11 de junio a la final) y a la
   derecha los grupos de dos en dos con su tabla (PJ GF GC DIF PTS), que se actualiza con los partidos
   jugados según el reloj del juego. ---- */
var eventoDia = null;          // día elegido en la lista de partidos (YYYY-MM-DD); null = el que toca
var eventoDiaManual = false;   // true si el usuario se movió con las flechas (entonces no avanza solo)
// Al volver a abrir la pestaña del torneo, la lista de partidos regresa al día actual del juego.
function eventoReiniciarDia(){ eventoDia=null; eventoDiaManual=false; }

// Partidos del torneo (Mundial) con fecha, en orden.
function eventoPartidos(){
  return (DB.fixtures||[]).filter(f=>f && f.date && (typeof matchIsWorldCup!=="function" || matchIsWorldCup(f)))
    .sort((a,b)=> String(a.date+(a.time||"")).localeCompare(String(b.date+(b.time||""))) || ((a.matchNo||0)-(b.matchNo||0)));
}
function eventoDias(){ return [...new Set(eventoPartidos().map(f=>f.date))].sort(); }
// ¿Partido jugado? (resultado cargado y, en el juego, su hora ya pasó)
function eventoJugado(f){ return (typeof fxPlayed==="function") ? fxPlayed(f) : !!(f && f.played); }
// Día por defecto: el día del reloj del juego (o el siguiente con partidos); fuera del torneo, el primero.
function eventoDiaInicial(dias){
  if(!dias.length) return null;
  let hoy=null;
  try{ if(window.GameTime && typeof GameTime.now==="function"){ const d=GameTime.now(); hoy=d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); } }catch(e){}
  if(hoy && hoy>dias[dias.length-1]) return dias[dias.length-1];   // ya terminó: la final
  if(hoy && hoy>=dias[0]) return dias.find(d=>d>=hoy) || dias[dias.length-1];
  return dias[0];
}
function eventoDiaTitulo(d){
  const DS=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  const MS=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const [y,m,dd]=d.split("-").map(n=>parseInt(n,10)); const dt=new Date(y,m-1,dd);
  return `${DS[dt.getDay()]} ${dd} de ${MS[m-1]}`;
}
// Casilla de eliminatoria sin selección todavía: "1A" → 1º Grupo A · "3:ABCDF" → 3º A/B/C/D/F · "W74" → Ganador M74.
function eventoCasilla(x){
  const s=String(x||"").trim(); let m;
  if((m=/^([12])([A-L])$/i.exec(s))) return `${m[1]}º Grupo ${m[2].toUpperCase()}`;
  if((m=/^3:([A-L]+)$/i.exec(s))) return `3º ${m[1].toUpperCase().split("").join("/")}`;
  if((m=/^W(\d+)$/i.exec(s))) return `Ganador M${m[1]}`;
  if((m=/^L(\d+)$/i.exec(s))) return `Perdedor M${m[1]}`;
  return s || "Por definir";
}
// Sede como en el calendario: nombre del estadio para el Mundial y "ciudad, (estado), país".
function eventoSede(f){
  const nm=(f.venue||"").trim();
  let st=null; try{ if(typeof findStadiumForVenue==="function" && nm) st=findStadiumForVenue(nm); }catch(e){}
  if(st){
    const wc=(typeof matchIsWorldCup==="function") ? matchIsWorldCup(f) : true;
    const name=((typeof stadiumMatchName==="function") ? stadiumMatchName(st, wc) : (st.tournamentName||"").trim()) || nm;
    const loc=[...new Set([st.city,(st.showState?st.state:""),st.country].map(x=>(x||"").trim()).filter(Boolean))].join(", ");
    return [name, loc].filter(Boolean);
  }
  return [nm, (f.city||"").trim()].filter(Boolean);
}
function eventoEquipoHTML(teamId, casilla, lado, res){
  const t = teamId ? getTeam(teamId) : null;
  if(!t) return `<span class="evd-tm ${lado} evd-tbd">${escapeHtml(eventoCasilla(casilla))}</span>`;
  const nm = `<span class="evd-nm">${escapeHtml(t.commonName||t.name||"")}</span>`;
  return `<span class="evd-tm ${lado} ev-lnk${res?" evd-"+res:""}" data-action="open-team" data-id="${t.id}">${lado==="a" ? nm+flagIconHTML(t) : flagIconHTML(t)+nm}</span>`;
}
// Equipos que se muestran en un partido de eliminación, igual que en las llaves: cada lado aparece solo
// cuando su casilla ya se definió con partidos jugados (según el reloj); mientras, el cruce posible
// («1º Grupo A», «3º C/E/F/H/I», «Ganador M74»…). Ya jugado: sus equipos, en el orden del marcador.
function eventoLadosPartido(f, jug, llaves){
  const def={a:f.teamA, b:f.teamB, sa:f.slotA, sb:f.slotB};
  if(f.group || jug) return def;
  const k=String(f.code || (f.matchNo?("M"+f.matchNo):"")).toUpperCase(); if(!k) return def;
  let E=null; try{ E=(llaves||eventoLlaves()).equipos(k); }catch(e){}
  if(!E) return def;
  let sa=(E.m&&E.m.a)||f.slotA, sb=(E.m&&E.m.b)||f.slotB, ea=E.eq[0], eb=E.eq[1];
  // El calendario puede traer local y visitante al revés que las llaves: se respeta su orden.
  if(f.teamA && f.teamB && (ea===f.teamB || eb===f.teamA)){ [sa,sb]=[sb,sa]; [ea,eb]=[eb,ea]; }
  return {a:ea||null, b:eb||null, sa, sb};
}
function eventoPartidoHTML(f){
  const jug = eventoJugado(f);
  const lados = eventoLadosPartido(f, jug);
  // Marcador: abre el informe del partido (y desde ahí, «En vivo»), como en el calendario.
  const mid = jug ? `<span class="evd-sc ev-lnk" data-action="evento-informe" data-fx="${escapeHtml(f.id)}" title="Ver el informe del partido">${f.scoreA} - ${f.scoreB}</span>` : `<span class="evd-vs">${escapeHtml(f.time||"vs")}</span>`;
  // Ganador (o el que avanza, si hubo tanda): su nombre se destaca y el del otro se atenúa.
  let gana=null;
  if(jug){ const a=+f.scoreA||0, b=+f.scoreB||0;
    if(a!==b) gana = a>b ? "a" : "b";
    else if(f.penalties && f.penalties.a!==f.penalties.b) gana = f.penalties.a>f.penalties.b ? "a" : "b"; }
  const res = lado => gana ? (gana===lado ? "win" : "lose") : "";
  // Tanda de penales: debajo del marcador, destacada.
  const pen = (jug && f.penalties) ? `<span class="evd-pen">Penales ${f.penalties.a}-${f.penalties.b}</span>` : "";
  const fase = f.group ? `Grupo ${escapeHtml(f.group)}` : ((typeof knockoutRoundName==="function" && (f.code||f.matchNo)) ? escapeHtml(knockoutRoundName(f.code||("M"+f.matchNo))) : "");
  const sede = eventoSede(f).map(escapeHtml).join(" · ");
  const meta = [f.matchNo?`M${f.matchNo}`:"", fase, jug?escapeHtml(f.time||""):"", sede].filter(Boolean).join(" · ");
  return `<div class="evd-row">
    <div class="evd-teams">${eventoEquipoHTML(lados.a, lados.sa, "a", res("a"))}<span class="evd-mid">${mid}${pen}</span>${eventoEquipoHTML(lados.b, lados.sb, "b", res("b"))}</div>
    <div class="evd-meta" title="${meta.replace(/"/g,"&quot;")}">${meta}</div>
  </div>`;
}
// Tabla de un grupo con los partidos YA JUGADOS: PJ, GF, GC, DIF y PTS.
function eventoTablaGrupo(g){
  const filas = eventoTablaFilas(g);
  const dif = n => n>0 ? "+"+n : String(n);
  // Fase de grupos terminada: el número del 3º que NO quedó entre los mejores terceros va en gris (como el 4º).
  let terceroFuera=false;
  if(eventoGruposTerminados()){
    const n=(typeof eventThirdSlots==="function") ? eventThirdSlots().length : 8;
    terceroFuera = !eventoTercerosFilas().slice(0,n).some(r=>r.grupo===g);
  }
  return `<div class="card evg-card">
    <table class="evg-tbl">
      <thead><tr><th class="evg-g" colspan="2">Grupo ${escapeHtml(g)}</th><th>PJ</th><th>GF</th><th>GC</th><th>DIF</th><th>PTS</th></tr></thead>
      <tbody>${filas.map((r,i)=>`<tr class="evg-row ${i<2?"evg-q":(i===2?(terceroFuera?"":"evg-q3"):"")}" data-action="open-team" data-id="${r.team.id}" title="${escapeHtml(r.team.commonName||r.team.name||"")}">
        <td class="evg-pos">${i+1}</td>
        <td class="evg-tm">${flagIconHTML(r.team)}${escapeHtml(r.team.commonName||r.team.name||"")}</td>
        <td>${r.pj}</td><td>${r.gf}</td><td>${r.gc}</td><td>${dif(r.gf-r.gc)}</td><td class="evg-pts">${r.pts}</td></tr>`).join("")}</tbody>
    </table>
  </div>`;
}
// ESTADÍSTICAS INDIVIDUALES del torneo (SOLO partidos del Mundial ya jugados):
//   · Goles (sin autogoles) y asistencias: solo los del partido (90' y prórroga); la tanda de penales no cuenta.
//   · Tarjetas amarillas y rojas (de jugadores, no de entrenadores).
//   · Porterías invictas: el portero que jugó el partido COMPLETO (titular, sin salir ni ser expulsado) y su
//     equipo no recibió gol en el partido (la tanda de penales no cuenta).
//   · Media promedio: calificación por partido (la real del informe o la que calcula el juego). En la lista
//     corta cuenta quien jugó al menos la mitad de los partidos del que más lleva; en «Ver todos», todos.
function eventoEstadisticas(){
  const J={};
  const reg=(pid, nombre, teamId)=>{ const k=pid||("nm:"+nombre); if(!J[k]) J[k]={pid, nombre, teamId, g:0, a:0, y:0, r:0, cs:0, sum:0, n:0}; if(!J[k].teamId) J[k].teamId=teamId; return J[k]; };
  eventoPartidos().filter(eventoJugado).forEach(f=>{
    (f.goals||[]).forEach(g=>{
      if(!g.og) reg(g.playerId, g.player, g.teamId).g++;
      if(!g.og && (g.assistPlayerId||g.assistPlayer)) reg(g.assistPlayerId, g.assistPlayer, g.teamId).a++;
    });
    (f.cards||[]).forEach(c=>{ if(c.coach) return; const r=reg(c.playerId, c.player, c.teamId); if(c.type==="red") r.r++; else r.y++; });
    const roja=(pid,nm)=>(f.cards||[]).some(c=>c.type==="red" && ((pid && c.playerId===pid) || (!pid && c.player===nm)));
    ["home","away"].forEach(sd=>{
      const lu=f.lineups&&f.lineups[sd]; if(!lu) return;
      const recibidos = lu.teamId===f.teamA ? (+f.scoreB||0) : (+f.scoreA||0);
      (lu.players||[]).forEach(p=>{
        // Portería invicta: portero titular que no salió ni fue expulsado, y su equipo no recibió gol.
        if(p.pos==="GK" && !p.sub && recibidos===0 && !roja(p.playerId, p.name)) reg(p.playerId, p.name, lu.teamId).cs++;
        let x=p; while(x){
          if(x.playerId && typeof playerFixtureRating==="function"){
            let v=null; try{ v=playerFixtureRating(x.playerId, f); }catch(e){}
            if(typeof v==="number" && isFinite(v)){ const r=reg(x.playerId, x.name, lu.teamId); r.sum+=v; r.n++; }
          }
          x=x.sub; }
      });
    });
  });
  return Object.values(J).map(j=>Object.assign(j, { med: j.n ? j.sum/j.n : 0 }));
}
// Categorías de la tabla: [clave, título, campo, valor a mostrar]
const EVENTO_STATS = [
  ["g",   "Goles",               "g",   j=>j.g],
  ["a",   "Asistencias",         "a",   j=>j.a],
  ["cs",  "Porterías invictas",  "cs",  j=>j.cs],
  ["y",   "Tarjetas amarillas",  "y",   j=>j.y],
  ["r",   "Tarjetas rojas",      "r",   j=>j.r],
  ["med", "Media promedio",      "med", j=>`${j.med.toFixed(2)} <span class="evs-pj">${j.n} PJ</span>`]
];
function eventoJugadorDe(j){ let p=null; try{ if(j.pid && typeof getPlayerWithTeam==="function") p=getPlayerWithTeam(j.pid).player; }catch(e){} return p; }
function eventoNombreDe(j){ const p=eventoJugadorDe(j); return p ? ((typeof playerDisplayName==="function") ? playerDisplayName(p) : (p.commonName||p.fullName||j.nombre)) : (j.nombre||"—"); }
// Lista ordenada de una categoría. todos=false → la lista corta (con el mínimo de partidos en la media).
function eventoListaStat(L, campo, todos){
  if(campo==="med"){
    const maxPJ=L.reduce((m,j)=>Math.max(m,j.n),0), minPJ=todos ? 1 : Math.max(1, Math.ceil(maxPJ/2));
    return { minPJ, lista: L.filter(j=>j.n>=minPJ).sort((a,b)=> b.med-a.med || b.n-a.n || eventoNombreDe(a).localeCompare(eventoNombreDe(b),"es")) };
  }
  return { minPJ:0, lista: L.filter(j=>j[campo]>0).sort((a,b)=> b[campo]-a[campo] || eventoNombreDe(a).localeCompare(eventoNombreDe(b),"es")) };
}
// Fila: posición · bandera · foto en círculo · nombre · valor
function eventoStatFilaHTML(j, i, val){
  const t=j.teamId?getTeam(j.teamId):null, p=eventoJugadorDe(j), nm=escapeHtml(eventoNombreDe(j));
  const foto = (p && typeof personPhotoHTML==="function") ? `<span class="evs-ph">${personPhotoHTML(p,"width:100%;height:100%;")}</span>` : `<span class="evs-ph"></span>`;
  const flag = t ? flagIconHTML(t) : `<span class="flag-ic flag-ic-empty"></span>`;
  const quien = `${flag}${foto}<span class="evs-nm">${nm}</span>`;
  return `<div class="evs-row"><span class="evs-pos">${i+1}</span>${j.pid?`<span class="evs-who ev-lnk" data-action="open-player" data-id="${j.pid}">${quien}</span>`:`<span class="evs-who">${quien}</span>`}<span class="evs-v">${val}</span></div>`;
}
function eventoEstadisticasHTML(){
  const L=eventoEstadisticas();
  const bloque=([k, tit, campo, val])=>{
    const {minPJ, lista}=eventoListaStat(L, campo, false);
    const nota = (campo==="med" && minPJ>1) ? ` <span class="evs-note">(mín. ${minPJ} partidos)</span>` : "";
    const total = eventoListaStat(L, campo, true).lista.length;
    return `<div class="evs-blk">
      <div class="evs-hrow"><div class="evs-h">${tit}${nota}</div>${total?`<button class="btn ghost sm evs-all" data-action="evento-stats-todos" data-cat="${k}">Ver todos (${total})</button>`:""}</div>
      <div class="evs-list">${lista.length ? lista.slice(0,5).map((j,i)=>eventoStatFilaHTML(j,i,val(j))).join("") : `<div class="evs-empty">Sin datos todavía</div>`}</div>
    </div>`;
  };
  return `<div class="card evs-card"><div class="evs-title">Estadísticas individuales</div>${EVENTO_STATS.map(bloque).join("")}</div>`;
}
// Ventana emergente con TODOS los jugadores con registro en una categoría.
function eventoStatsModal(k){
  const C=EVENTO_STATS.find(x=>x[0]===k); if(!C) return;
  const [, tit, campo, val]=C;
  const {lista}=eventoListaStat(eventoEstadisticas(), campo, true);
  eventoCSS();
  openModal(`
    <div class="modal-box" style="max-width:560px;">
      <div class="modal-head"><h2>${tit} · ${escapeHtml(eventFieldText(DB.event,'name'))}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body evs-modal">
        ${lista.length ? lista.map((j,i)=>eventoStatFilaHTML(j,i,val(j))).join("") : `<div class="evs-empty">Sin datos todavía</div>`}
      </div>
    </div>`);
}
/* ---------- FASE FINAL: diagrama de llaves ----------
   Al terminar la fase de grupos (o al llegar la fecha del primer partido de eliminación) el lado
   derecho muestra el cuadro de enfrentamientos; con la flecha se vuelve a ver cómo quedaron los grupos.
   Las llaves se arman desde DB.event.rounds (casillas "1A", "3:ABCDF", "W74", "L101") y se llenan
   conforme se juegan los partidos: un grupo terminado define a su 1º y 2º, todos los grupos terminados
   definen a los mejores terceros (Anexo C), y cada partido jugado define a su ganador. */
var eventoVistaDer = null;   // null = automático · "llaves" · "grupos"
function eventoFaseFinalLlegó(){
  const fx=eventoPartidos(); const gr=fx.filter(f=>f.group);
  if(gr.length && gr.every(eventoJugado)) return true;
  const ko=fx.filter(f=>!f.group); if(!ko.length) return false;
  let hoy=null; try{ const n=GameTime.now(); hoy=n.getFullYear()+"-"+String(n.getMonth()+1).padStart(2,"0")+"-"+String(n.getDate()).padStart(2,"0"); }catch(e){}
  return !!hoy && hoy>=ko[0].date;
}
function eventoLlaves(){
  const ronda={}; (DB.event.rounds||[]).forEach(r=>(r.matches||[]).forEach(m=>{ ronda[m.id]=m; }));
  const fxDe={}; eventoPartidos().forEach(f=>{ const k=f.code || (f.matchNo?("M"+f.matchNo):null); if(k) fxDe[String(k).toUpperCase()]=f; });
  const grupoListo={}, tabla={};
  groupsList().forEach(g=>{ const fx=eventoPartidos().filter(f=>f.group===g); grupoListo[g]=fx.length>0 && fx.every(eventoJugado); });
  const posGrupo=(g,n)=>{ if(!grupoListo[g]) return null; if(!tabla[g]) tabla[g]=eventoTablaFilas(g); const r=tabla[g][n-1]; return r ? r.team.id : null; };
  // Mejores terceros (cuando TODOS los grupos terminaron): por puntos, diferencia, goles a favor.
  let terceros=null;
  const resolverTerceros=()=>{
    if(terceros) return terceros; terceros={};
    if(!groupsList().every(g=>grupoListo[g])) return terceros;
    const ths=eventoTercerosFilas();
    const cr=eventoCrucesTerceros(ths);
    ths.forEach(r=>{ const c=cr[r.grupo]; if(c) terceros[c.match]=r.team.id; });
    return terceros;
  };
  const memo={};
  const ganador=(f, eq)=>{ if(!f || !eventoJugado(f) || !eq[0] || !eq[1]) return null; const a=+f.scoreA||0, b=+f.scoreB||0;
    if(a!==b) return a>b?0:1; if(f.penalties && f.penalties.a!==f.penalties.b) return f.penalties.a>f.penalties.b?0:1; return null; };
  // Equipos de un partido de llaves: los del calendario si ya los trae; si no, resueltos desde sus casillas.
  const equipos=id=>{
    if(memo[id]) return memo[id];
    const m=ronda[id]||{}, f=fxDe[id];
    // Cada lado aparece SOLO cuando su casilla ya se definió con partidos jugados (según el reloj): el
    // ganador de un partido se coloca en la siguiente ronda en cuanto gana, y su rival hasta que gane el suyo.
    // Si el calendario ya trae a los equipos del partido, se usa ese nombre para el lado ya definido.
    let eq=[casilla(m.a||(f&&f.slotA), id), casilla(m.b||(f&&f.slotB), id)];
    if(f && f.teamA && f.teamB){
      const fx=[f.teamA, f.teamB];
      eq = eq.map((t,i)=> t==null ? null : (fx.indexOf(t)>=0 ? t : fx[i]));
      if(eventoJugado(f)) eq=[eq[0]||fx[0], eq[1]||fx[1]];   // jugado: siempre sus equipos
    }
    return (memo[id]={ id, m, f, eq, gana:ganador(f, eq) });
  };
  const casilla=(x, id)=>{
    const v=String(x||"").trim().toUpperCase(); let k;
    if((k=/^([12])([A-Z])$/.exec(v))) return posGrupo(k[2], +k[1]);
    if(/^3:/.test(v)) return resolverTerceros()[id]||null;
    if((k=/^([WL])(\d+)$/.exec(v))){ const E=equipos("M"+k[2]); if(E.gana==null) return null; return k[1]==="W" ? E.eq[E.gana] : E.eq[1-E.gana]; }
    return null;
  };
  return { ronda, equipos };
}
/* ---------- ORDEN DE LOS GRUPOS Y DE LOS TERCEROS (reglamento, art. 13) ----------
   Grupo: 1) puntos; entre los empatados: a) puntos, b) diferencia y c) goles en los partidos ENTRE ellos;
   2) si siguen empatados algunos, se reaplica a–c solo entre ellos; si nada los separa: d) diferencia de
   goles y e) goles en todo el grupo, f) puntaje de conducta, g) ranking FIFA (y, al final, el sorteo).
   Terceros: a) puntos, b) diferencia, c) goles, d) conducta, e) ranking FIFA.
   Conducta (por persona y partido, una sola deducción): amarilla −1, doble amarilla −3, roja directa −4,
   amarilla + roja directa −5. La roja trae su tipo en el informe ("(DA)" / "(RD)"); sin marcador, una
   amarilla previa y la roja cuentan como doble amarilla (−3). Cuentan jugadores y oficiales (entrenadores). */
function eventoConducta(partidos){
  const out={};
  partidos.forEach(f=>{
    const per={};
    (f.cards||[]).forEach(c=>{ const k=c.teamId+"|"+(c.playerId||c.coachId||c.player||""); const x=per[k]||(per[k]={team:c.teamId, y:0, r:0, doble:null}); if(c.type==="red"){ x.r++; if(c.doble!=null) x.doble=c.doble; } else x.y++; });
    Object.values(per).forEach(x=>{ let d=0;
      if(x.r && x.doble===true) d=-3;                      // (DA) doble amarilla
      else if(x.r && x.doble===false) d = x.y ? -5 : -4;   // (RD) roja directa (con amarilla antes: −5)
      else if(x.r && x.y>=1) d=-3; else if(x.r) d=-4; else if(x.y>=2) d=-3; else if(x.y) d=-1;
      out[x.team]=(out[x.team]||0)+d; });
  });
  return out;
}
function eventoRankFIFA(){ try{ return (typeof computeFifaRanks==="function") ? (computeFifaRanks()||{}) : {}; }catch(e){ return {}; } }
function eventoStats(ids, partidos){
  const S={}; ids.forEach(id=>S[id]={pj:0, g:0, e:0, p:0, gf:0, gc:0, pts:0});
  partidos.forEach(f=>{ const a=S[f.teamA], b=S[f.teamB]; if(!a||!b) return;
    const sa=+f.scoreA||0, sb=+f.scoreB||0;
    a.pj++; b.pj++; a.gf+=sa; a.gc+=sb; b.gf+=sb; b.gc+=sa;
    if(sa>sb){ a.pts+=3; a.g++; b.p++; } else if(sb>sa){ b.pts+=3; b.g++; a.p++; } else { a.pts++; b.pts++; a.e++; b.e++; } });
  return S;
}
// Filas ordenadas de la tabla de un grupo: {team, pj, g, e, p, gf, gc, pts, conducta, rank}.
function eventoTablaFilas(g){
  const teams = (typeof teamsInGroupOrdered==="function") ? teamsInGroupOrdered(g) : (DB.teams||[]).filter(t=>t.group===g);
  const jug = eventoPartidos().filter(f=>f.group===g && eventoJugado(f));
  const ids = teams.map(t=>t.id);
  const S = eventoStats(ids, jug), C = eventoConducta(jug), R = eventoRankFIFA();
  const slot = t => (typeof groupSlotIndex==="function") ? groupSlotIndex(t) : 0;
  const filas = teams.map(t=>Object.assign({team:t, conducta:C[t.id]||0, rank:R[t.id]||9999}, S[t.id]));
  const porId={}; filas.forEach(r=>porId[r.team.id]=r);
  // Bloques de empatados según una clave (lista ya ordenada).
  const bloques=(lista, clave)=>{ const out=[]; lista.forEach(r=>{ const k=clave(r); const u=out[out.length-1]; if(u && u.k===k) u.l.push(r); else out.push({k, l:[r]}); }); return out.map(b=>b.l); };
  const generales=(a,b)=> (b.gf-b.gc)-(a.gf-a.gc) || b.gf-a.gf || b.conducta-a.conducta || a.rank-b.rank || slot(a.team)-slot(b.team);
  const resolver=(empatados)=>{
    if(empatados.length<2) return empatados;
    const set=new Set(empatados.map(r=>r.team.id));
    const h=eventoStats([...set], jug.filter(f=>set.has(f.teamA) && set.has(f.teamB)));
    const clave=r=>{ const x=h[r.team.id]; return [x.pts, x.gf-x.gc, x.gf]; };
    const ord=empatados.slice().sort((a,b)=>{ const A=clave(a), B=clave(b); return B[0]-A[0] || B[1]-A[1] || B[2]-A[2]; });
    const subs=bloques(ord, r=>clave(r).join("|"));
    if(subs.length===1) return ord.slice().sort(generales);                 // a–c no separa: d, e, f, g
    return [].concat(...subs.map(sb=> sb.length>1 ? resolver(sb) : sb));   // paso 2: reaplicar entre los que sigan empatados
  };
  // Grupo sin partidos jugados todavía: orden del sorteo (A1, A2, A3, A4), sin desempates.
  if(!jug.length) return filas.slice().sort((a,b)=> slot(a.team)-slot(b.team));
  const porPuntos = filas.slice().sort((a,b)=> b.pts-a.pts);
  return [].concat(...bloques(porPuntos, r=>r.pts).map(resolver));
}
// Tabla de TERCEROS: el 3º de cada grupo, ordenado por puntos, diferencia, goles, conducta y ranking FIFA.
function eventoTercerosFilas(){
  const filas = groupsList().map(g=>{ const r=eventoTablaFilas(g)[2]; return r ? Object.assign({grupo:g}, r) : null; }).filter(Boolean);
  return filas.sort((a,b)=> b.pts-a.pts || (b.gf-b.gc)-(a.gf-a.gc) || b.gf-a.gf || b.conducta-a.conducta || a.rank-b.rank || a.grupo.localeCompare(b.grupo));
}
// Cruces de los terceros que clasifican (Anexo C): {grupo → {match:"M74", rival:"1E"}}.
function eventoCrucesTerceros(filas){
  const n = (typeof eventThirdSlots==="function") ? eventThirdSlots().length : 8;
  const sel = filas.slice(0, n).map(r=>r.grupo);
  const out={};
  try{ const R=solveThirdPairings(sel); if(R && R.ok) R.pairs.forEach(p=>{ out[p.third]={ match:p.matchId, rival:p.rival }; }); }catch(e){}
  return out;
}
function eventoGruposTerminados(){ return groupsList().every(g=>{ const fx=eventoPartidos().filter(f=>f.group===g); return fx.length && fx.every(eventoJugado); }); }
function eventoTablaTercerosHTML(){
  const filas = eventoTercerosFilas(); if(!filas.length) return "";
  const n = (typeof eventThirdSlots==="function") ? eventThirdSlots().length : 8;
  const todos = groupsList().every(g=>{ const fx=eventoPartidos().filter(f=>f.group===g); return fx.length && fx.every(eventoJugado); });
  const jugados = eventoPartidos().some(f=>f.group && eventoJugado(f));
  const cruces = jugados ? eventoCrucesTerceros(filas) : {};
  const dif = v => v>0 ? "+"+v : String(v);
  const rival = c => { if(!c) return ""; const m=/^([12])([A-Z])$/.exec(c.rival||""); return `${m?`${m[1]}º ${m[2]}`:escapeHtml(c.rival)} · ${escapeHtml(c.match)}`; };
  return `<div class="card evg-card evt-card">
    <table class="evg-tbl">
      <thead><tr><th class="evg-g" colspan="3">Mejores terceros${todos?"":` <span class="evt-prov">(provisional)</span>`}</th><th>PJ</th><th>GF</th><th>GC</th><th>DIF</th><th title="Puntaje de conducta (fair play)">FP</th><th>PTS</th><th class="evt-cr">Cruce</th></tr></thead>
      <tbody>${filas.map((r,i)=>`<tr class="evg-row ${i<n?"evg-q":"evt-out"}" data-action="open-team" data-id="${r.team.id}" title="${escapeHtml(r.team.commonName||"")}">
        <td class="evg-pos">${i+1}</td><td class="evt-gr">${escapeHtml(r.grupo)}</td>
        <td class="evg-tm">${flagIconHTML(r.team)}${escapeHtml(r.team.commonName||r.team.name||"")}</td>
        <td>${r.pj}</td><td>${r.gf}</td><td>${r.gc}</td><td>${dif(r.gf-r.gc)}</td><td>${r.conducta}</td><td class="evg-pts">${r.pts}</td>
        <td class="evt-cr">${i<n ? rival(cruces[r.grupo]) : ""}</td></tr>`).join("")}</tbody>
    </table>
    <div class="evt-nota">Clasifican los ${n} mejores. Orden: puntos, diferencia de goles, goles anotados, conducta (FP) y ranking FIFA. Los cruces siguen el Anexo C del reglamento.</div>
  </div>`;
}
// Tarjeta de un partido de llaves: bandera · código · goles (y penales). Ganador destacado.
function eventoLlaveHTML(E, etiqueta){
  const f=E.f, jug=f && eventoJugado(f) && E.eq[0] && E.eq[1];
  const golesDe=i=>{ if(!jug) return ""; if(f.teamA===E.eq[i]) return f.scoreA; if(f.teamB===E.eq[i]) return f.scoreB; return i===0?f.scoreA:f.scoreB; };
  const penDe=i=>{ if(!jug || !f.penalties) return ""; const own = f.teamA===E.eq[i] ? f.penalties.a : (f.teamB===E.eq[i] ? f.penalties.b : (i===0?f.penalties.a:f.penalties.b)); return `<span class="bk-pen">${own}</span>`; };
  const fila=i=>{
    const id=E.eq[i], t=id?getTeam(id):null;
    const cls = (E.gana==null) ? "" : (E.gana===i ? " win" : " lose");
    const slot = i===0 ? (E.m.a||(f&&f.slotA)) : (E.m.b||(f&&f.slotB));
    const nm = t ? escapeHtml(t.fifaCode || (t.commonName||"").slice(0,3).toUpperCase()) : `<span class="bk-tbd" title="${escapeHtml(eventoCasilla(slot))}">${escapeHtml(String(slot||"—").replace(/^3:/,"3º "))}</span>`;
    if(!t) return `<div class="bk-t bk-t-tbd">${nm}</div>`;   // sin definir: la casilla (W89, L101…) centrada
    return `<div class="bk-t${cls}" title="${escapeHtml(t.commonName||"")}">${flagIconHTML(t)}<span class="bk-c">${nm}</span><span class="bk-g">${golesDe(i)}${penDe(i)}</span></div>`;
  };
  const act = jug ? ` data-action="evento-informe" data-fx="${escapeHtml(f.id)}" title="${escapeHtml((f.date?eventoDiaTitulo(f.date)+" · ":"")+"Ver el informe del partido")}"` : (f && f.date ? ` title="${escapeHtml(eventoDiaTitulo(f.date)+(f.time?" · "+f.time:""))}"` : "");
  return `<div class="bk-m${jug?" ev-lnk":""}"${act}>${etiqueta?`<span class="bk-lbl">${escapeHtml(etiqueta)}</span>`:""}${fila(0)}${fila(1)}</div>`;
}
function eventoLlavesHTML(){
  const L=eventoLlaves();
  const fin=Object.values(L.ronda).find(m=>/^W\d+$/i.test(m.a||"") && /^W\d+$/i.test(m.b||"") && !Object.values(L.ronda).some(o=>[o.a,o.b].some(x=>String(x||"").toUpperCase()==="W"+String(m.id).replace(/^M/i,""))));
  if(!fin) return `<div class="card evd-empty">No hay llaves definidas en el formato del torneo.</div>`;
  const hijo=x=>{ const k=/^W(\d+)$/i.exec(String(x||"")); return k ? "M"+k[1] : null; };
  // Columnas de una mitad: [semifinal], [cuartos], [octavos], [dieciseisavos] (en orden del cuadro).
  const mitad=raiz=>{ const cols=[]; let nivel=[raiz]; while(nivel.length && nivel.every(Boolean)){ cols.push(nivel); const sig=[]; nivel.forEach(id=>{ const m=L.ronda[id]||{}; sig.push(hijo(m.a), hijo(m.b)); }); if(!sig.every(Boolean)) break; nivel=sig; } return cols; };
  const izq=mitad(hijo(fin.a)), der=mitad(hijo(fin.b));
  const columna=(ids, lado)=>{
    if(ids.length===1) return `<div class="bk-col"><div class="bk-single">${eventoLlaveHTML(L.equipos(ids[0]))}</div></div>`;
    const pares=[]; for(let i=0;i<ids.length;i+=2) pares.push(ids.slice(i,i+2));
    return `<div class="bk-col">${pares.map(p=>`<div class="bk-pair">${p.map(id=>`<div class="bk-slot">${eventoLlaveHTML(L.equipos(id))}</div>`).join("")}</div>`).join("")}</div>`;
  };
  const E=L.equipos(fin.id);
  const tercero=Object.values(L.ronda).find(m=>/^L\d+$/i.test(m.a||"") && /^L\d+$/i.test(m.b||""));
  const campeon = E.gana!=null ? getTeam(E.eq[E.gana]) : null;
  const centro=`<div class="bk-center">
      ${campeon?`<div class="bk-champ"><span class="bk-champ-h">Campeón</span><div class="bk-champ-t">${flagIconHTML(campeon)}<b>${escapeHtml(campeon.commonName||"")}</b></div></div>`:""}
      <div class="bk-final">${eventoLlaveHTML(E, "Final")}</div>
      <i class="bk-sfl bk-sfl-a"></i><i class="bk-sfl bk-sfl-b"></i><i class="bk-sfr bk-sfr-a"></i><i class="bk-sfr bk-sfr-b"></i>
      ${tercero?`<i class="bk-sfl bk-tl-a"></i><i class="bk-sfl bk-tl-b"></i><i class="bk-sfr bk-tr-a"></i><i class="bk-sfr bk-tr-b"></i>`:""}
      <div class="bk-trophy"><img src="${(DB.event && DB.event.trophyImg) || "logos/trofeo-copa-mundial.png"}" alt=""></div>
      <div class="bk-third">${tercero?eventoLlaveHTML(L.equipos(tercero.id), "3er lugar"):""}</div>
    </div>`;
  return `<div class="card bk-card"><div class="bk-wrap">
    <div class="bk-side bk-l">${izq.slice().reverse().map(c=>columna(c,"l")).join("")}</div>
    ${centro}
    <div class="bk-side bk-r">${der.map(c=>columna(c,"r")).join("")}</div>
  </div></div>`;
}
// Lado derecho de la pestaña: grupos o (desde la fase final) llaves, con flechas para alternar.
function eventoPanelDerechoHTML(){
  const grupos=`<div class="evg-grid">${groupsList().map(eventoTablaGrupo).join("")}</div>${eventoTablaTercerosHTML()}`;
  // Antes de la fase final se ven los grupos (con › se puede ver el diagrama vacío); después, las llaves.
  const vista = eventoVistaDer || (eventoFaseFinalLlegó() ? "llaves" : "grupos");
  const cab = vista==="llaves"
    ? `<button class="evd-arr" data-action="evento-vista" data-v="grupos" title="Ver cómo quedaron los grupos">‹</button><h3>Fase final</h3><button class="evd-arr" disabled>›</button>`
    : `<button class="evd-arr" disabled>‹</button><h3>Fase de grupos</h3><button class="evd-arr" data-action="evento-vista" data-v="llaves" title="Ver las llaves de la fase final">›</button>`;
  return `<div class="ev-right"><div class="card evd-head ev-rhead">${cab}</div>${vista==="llaves" ? eventoLlavesHTML() : grupos}</div>`;
}
function eventoCSS(){
  if(document.getElementById("evento-css")) return;
  const st=document.createElement("style"); st.id="evento-css";
  st.textContent=`
.ev-main{display:grid;grid-template-columns:minmax(300px,1fr) minmax(0,1.55fr);gap:14px;margin-top:14px;align-items:start;}
@media (max-width:980px){ .ev-main{grid-template-columns:1fr;} }
.evd-card{padding:0;overflow:hidden;}
.evd-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;border-bottom:1px solid var(--line);}
.evd-head h3{margin:0;font-size:14px;text-align:center;flex:1;}
.evd-head .evd-sub{display:block;font-size:11px;color:var(--muted);font-weight:500;margin-top:2px;}
.evd-arr{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--surface-2);color:var(--ink);cursor:pointer;font-size:15px;line-height:1;display:flex;align-items:center;justify-content:center;}
.evd-arr:hover:not([disabled]){border-color:var(--indigo);}
.evd-arr[disabled]{opacity:.35;cursor:default;}
.evd-list{overflow:hidden;}
.evd-row{height:84px;box-sizing:border-box;padding:8px 12px;border-bottom:1px solid color-mix(in srgb,var(--line) 70%,transparent);}
.evd-row:last-child{border-bottom:none;}
.evd-teams{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:10px;font-size:13px;font-weight:600;}
.evd-tm{display:flex;align-items:center;gap:0;min-width:0;}
.evd-tm.a{justify-content:flex-end;text-align:right;} .evd-tm.b{justify-content:flex-start;}
.evd-tm.a .flag-ic{margin:0 0 0 6px;} .evd-tm.b .flag-ic{margin:0 6px 0 0;}
.evd-nm{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.evd-tbd{color:var(--muted);font-weight:500;font-size:12px;}
.evd-sc{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;padding:2px 8px;border-radius:6px;background:var(--surface-2);white-space:nowrap;}
.evd-vs{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--muted);white-space:nowrap;}
.evd-row{display:flex;flex-direction:column;justify-content:center;}
.evd-mid{display:flex;flex-direction:column;align-items:center;gap:3px;}
.evd-pen{font-size:10.5px;font-weight:700;letter-spacing:.03em;color:var(--amber,#f5c842);background:color-mix(in srgb,var(--amber,#f5c842) 16%,transparent);border:1px solid color-mix(in srgb,var(--amber,#f5c842) 45%,transparent);border-radius:20px;padding:1px 8px;white-space:nowrap;}
.evd-win .evd-nm{font-weight:800;color:var(--ink);}
.evd-lose .evd-nm{font-weight:500;color:var(--muted);}
.evd-meta{text-align:center;font-size:11px;color:var(--muted);margin-top:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ev-left{display:flex;flex-direction:column;gap:14px;min-width:0;}
.evs-card{padding:12px 14px;margin:0;}
.evs-title{font-weight:700;font-size:14px;margin-bottom:6px;}
.evs-blk{padding:8px 0;border-top:1px solid var(--line);}
.evs-blk:first-of-type{border-top:none;}
.evs-h{font-size:11px;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px;}
.evs-note{text-transform:none;letter-spacing:0;font-weight:500;}
.evs-row{display:flex;align-items:center;gap:8px;font-size:12.5px;height:30px;box-sizing:border-box;}
.evs-row .flag-ic{margin-right:0;}
.evs-list{min-height:150px;}   /* espacio fijo para los 5 principales */
.evs-hrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px;min-height:28px;}
.evs-hrow .evs-h{margin-bottom:0;}
.evs-all{font-size:11px;padding:2px 8px;}
.evs-ph{width:24px;height:24px;border-radius:50%;overflow:hidden;flex-shrink:0;display:inline-block;background:var(--surface-2);border:1px solid var(--line);}
.evs-ph img{width:100%;height:100%;object-fit:cover;display:block;}
/* Enlaces (como en las demás pantallas): el TEXTO baja un poco la opacidad y las IMÁGENES suben de brillo. */
.ev-lnk{cursor:pointer;}
.ev-lnk .evd-nm,.ev-lnk .evs-nm,.evd-sc.ev-lnk{transition:opacity .12s ease;}
.ev-lnk img{transition:filter .12s ease;}
.ev-lnk:hover .evd-nm,.ev-lnk:hover .evs-nm,.evd-sc.ev-lnk:hover{opacity:.75;}
.ev-lnk:hover img{filter:brightness(1.18);}
.evs-who{display:flex;align-items:center;gap:8px;flex:1;min-width:0;}
.evg-row{cursor:pointer;}
.evg-row:hover td{background:var(--surface-2);}
.evg-row:hover img{filter:brightness(1.18);}
.evs-modal{max-height:70vh;overflow:auto;}
.evs-pos{width:16px;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:11.5px;}
.evs-nm{flex:1;min-width:0;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.evs-v{font-family:'JetBrains Mono',monospace;font-weight:700;}
.evs-pj{font-weight:400;color:var(--muted);font-size:11px;margin-left:4px;}
.evs-empty{font-size:12px;color:var(--muted);}
.evd-empty{padding:14px 12px;font-size:13px;color:var(--muted);}
.ev-right{display:flex;flex-direction:column;gap:14px;min-width:0;}
.ev-rhead{margin:0;border-bottom:none;}
.bk-card{padding:14px 6px;margin:0;overflow-x:auto;}
.bk-wrap{display:flex;align-items:stretch;justify-content:center;min-width:640px;height:520px;}
.bk-side{display:flex;flex:4;}
.bk-col{flex:1;display:flex;flex-direction:column;}
.bk-pair{flex:1;display:flex;flex-direction:column;position:relative;}
.bk-slot,.bk-single{flex:1;display:flex;align-items:center;justify-content:center;position:relative;}
.bk-m{position:relative;z-index:1;width:70px;box-sizing:border-box;background:var(--surface-2);border:1px solid var(--line);border-radius:8px;padding:4px 5px;display:flex;flex-direction:column;gap:2px;}
.bk-t{display:flex;align-items:center;gap:3px;font-size:10.5px;font-weight:600;color:var(--ink);line-height:1.25;}
.bk-t .flag-ic{margin-right:0;}
.bk-c{flex:1;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-family:'Space Grotesk',sans-serif;}
.bk-g{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:11px;white-space:nowrap;}
.bk-pen{font-size:8px;font-weight:700;color:var(--amber,#f5c842);margin-left:1px;vertical-align:1px;}
.bk-t.win .bk-c{font-weight:800;}
.bk-t.lose{color:var(--muted);font-weight:500;}
.bk-t-tbd{justify-content:center;color:var(--muted);font-weight:500;font-size:10px;font-family:'JetBrains Mono',monospace;min-height:15px;}
.bk-tbd{color:var(--muted);font-weight:500;font-size:10px;font-family:'JetBrains Mono',monospace;}
.bk-m.ev-lnk:hover .bk-c,.bk-m.ev-lnk:hover .bk-g{opacity:.75;}
.bk-lbl{position:absolute;left:50%;top:calc(100% + 5px);transform:translateX(-50%);font-size:9px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;padding:1px 7px;border-radius:10px;white-space:nowrap;background:var(--amber,#f5c842);color:#1a1a1a;}
.bk-third .bk-lbl{background:var(--indigo,#6d63f5);color:#fff;}
/* Conectores: cada pareja se une con un corchete hacia la siguiente ronda. */
.bk-l .bk-pair::after,.bk-r .bk-pair::after{content:"";position:absolute;top:25%;bottom:calc(25% - 1.5px);width:8px;border:1.5px solid var(--line);}   /* el borde inferior cae sobre la línea del partido de abajo */
.bk-l .bk-pair::after{right:0;border-left:none;border-radius:0 6px 6px 0;}
.bk-r .bk-pair::after{left:0;border-right:none;border-radius:6px 0 0 6px;}
.bk-l .bk-slot::before,.bk-l .bk-single::before,.bk-r .bk-slot::before,.bk-r .bk-single::before{content:"";position:absolute;top:50%;width:calc(50% - 35px);border-top:1.5px solid var(--line);}
.bk-l .bk-slot::before,.bk-l .bk-single::before{right:0;}
.bk-r .bk-slot::before,.bk-r .bk-single::before{left:0;}
.bk-l .bk-pair .bk-slot::before{right:8px;width:calc(50% - 43px);}
.bk-r .bk-pair .bk-slot::before{left:8px;width:calc(50% - 43px);}
.bk-l .bk-col:first-child .bk-slot::after,.bk-r .bk-col:last-child .bk-slot::after{display:none;}
.bk-l .bk-col:not(:first-child) .bk-slot::after,.bk-l .bk-col:not(:first-child) .bk-single::after,
.bk-r .bk-col:not(:last-child) .bk-slot::after,.bk-r .bk-col:not(:last-child) .bk-single::after{content:"";position:absolute;top:50%;width:calc(50% - 35px);border-top:1.5px solid var(--line);}
.bk-l .bk-col:not(:first-child) .bk-slot::after,.bk-l .bk-col:not(:first-child) .bk-single::after{left:0;}
.bk-r .bk-col:not(:last-child) .bk-slot::after,.bk-r .bk-col:not(:last-child) .bk-single::after{right:0;}
.bk-l .bk-col:first-child .bk-slot::after{display:none;}
.bk-center{flex:1.3;position:relative;min-width:96px;}
/* Trofeo al CENTRO; arriba la final (y el campeón), abajo el tercer lugar. */
.bk-trophy{position:absolute;left:0;right:0;top:50%;transform:translateY(-50%);display:flex;justify-content:center;pointer-events:none;}
.bk-trophy img{height:158px;width:auto;filter:drop-shadow(0 6px 14px rgba(0,0,0,.45));}
.bk-champ{position:absolute;left:0;right:0;top:2%;display:flex;flex-direction:column;align-items:center;gap:4px;}
.bk-champ-h{font-size:10px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:var(--amber,#f5c842);}
.bk-champ-t{display:flex;align-items:center;gap:6px;font-size:13px;min-height:24px;padding:3px 10px;border-radius:8px;background:var(--surface-2);border:1px solid var(--line);}
.bk-champ-t .flag-ic{margin:0;height:14px;width:21px;}
.bk-final{position:absolute;left:50%;top:25%;transform:translate(-50%,-50%);}
.bk-third{position:absolute;left:50%;top:75%;transform:translate(-50%,-50%);}
/* Conectores de las semifinales a la final: del centro de la línea suben hasta la altura de la final. */
.bk-sfl,.bk-sfr{position:absolute;pointer-events:none;border:0 solid var(--line);}
/* Raíz plana (donde la línea se parte en dos) y esquinas redondeadas al llegar a la Final y al Tercer lugar,
   igual que los corchetes de las rondas anteriores. g = calc(25% - 17.5px) es el tramo hasta la vertical. */
.bk-sfl-a{left:0;width:calc(25% - 17.5px);top:50%;height:0;border-top-width:1.5px;}
.bk-sfl-b{box-sizing:border-box;left:calc(25% - 17.5px);width:calc(25% - 17.5px);top:25%;bottom:50%;border-top-width:1.5px;border-left-width:1.5px;border-top-left-radius:6px;}
.bk-sfr-a{left:calc(75% + 16px);right:0;top:50%;height:0;border-top-width:1.5px;}
.bk-sfr-b{box-sizing:border-box;left:calc(50% + 35px);width:calc(25% - 17.5px);top:25%;bottom:50%;border-top-width:1.5px;border-right-width:1.5px;border-top-right-radius:6px;}
/* Tercer lugar: los perdedores de las semifinales bajan igual hasta su partido (la horizontal es la misma). */
.bk-tl-a,.bk-tr-a{display:none;}
.bk-tl-b{box-sizing:border-box;left:calc(25% - 17.5px);width:calc(25% - 17.5px);top:50%;bottom:calc(25% - 1.5px);border-bottom-width:1.5px;border-left-width:1.5px;border-bottom-left-radius:6px;}
.bk-tr-b{box-sizing:border-box;left:calc(50% + 35px);width:calc(25% - 17.5px);top:50%;bottom:calc(25% - 1.5px);border-bottom-width:1.5px;border-right-width:1.5px;border-bottom-right-radius:6px;}
.evt-card{padding:8px 12px;}
.evt-prov{font-weight:500;color:var(--muted);font-size:11px;}
.evg-tbl td.evt-gr{font-family:'Space Grotesk',sans-serif;font-weight:700;color:var(--muted);width:20px;}
.evg-tbl .evt-cr{text-align:right;white-space:nowrap;font-family:inherit;font-size:11.5px;color:var(--muted);}
.evg-tbl tr.evt-out td{opacity:.55;}
.evg-tbl tr.evt-out td.evg-pos{color:var(--muted);}
.evt-nota{font-size:11px;color:var(--muted);margin-top:6px;}
.evg-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
@media (max-width:640px){ .evg-grid{grid-template-columns:1fr;} }
.evg-card{padding:8px 10px;margin:0;}
.evg-tbl{width:100%;border-collapse:collapse;font-size:12.5px;}
.evg-tbl th{font-size:11px;color:var(--muted);font-weight:600;text-align:center;padding:4px 4px 6px;border-bottom:1px solid var(--line);}
.evg-tbl th.evg-g{text-align:left;color:var(--ink);font-size:13px;font-weight:700;}
.evg-tbl td{text-align:center;padding:5px 4px;font-family:'JetBrains Mono',monospace;font-size:12px;}
.evg-tbl td.evg-tm{text-align:left;font-family:inherit;font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:0;width:100%;}
.evg-tbl td.evg-pos{color:var(--muted);width:16px;}
.evg-tbl td.evg-pts{font-weight:700;}
.evg-tbl tr.evg-q td.evg-pos{color:var(--lime,#b5e853);}
.evg-tbl tr.evg-q3 td.evg-pos{color:var(--amber,#f5c842);}
`;
  (document.head||document.documentElement).appendChild(st);
}
function renderEvento(){
  if(eventoDetailOpen) return renderEventoDetail();
  eventoCSS();
  const ev = DB.event;
  const dias = eventoDias();
  // El día avanza solo con el reloj del juego, salvo que el usuario se haya movido con las flechas.
  if(!eventoDia || dias.indexOf(eventoDia)<0 || !eventoDiaManual) eventoDia = eventoDiaInicial(dias);
  eventoUltimaFirma = eventoFirma();
  const iDia = dias.indexOf(eventoDia);
  const delDia = eventoDia ? eventoPartidos().filter(f=>f.date===eventoDia) : [];
  const jugados = eventoPartidos().filter(eventoJugado).length;
  // Alto ESTÁNDAR del rectángulo de partidos: el del día con más partidos.
  const porDia={}; eventoPartidos().forEach(f=>{ porDia[f.date]=(porDia[f.date]||0)+1; });
  const maxDia=Math.max(1, ...Object.values(porDia));
  return `
  <div class="card" style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap;">
    ${eventCrestHTML(ev, 150)}
    <div style="flex:1;min-width:220px;">
      <h2 style="margin:0 0 2px;">${escapeHtml(eventFieldText(ev,'name'))}</h2>
      <div style="font-size:13px;color:var(--muted);margin:4px 0 8px;">${eventFmtDate(ev.startDate)} – ${eventFmtDate(ev.endDate)}</div>
      <div class="tag-list">
        ${(ev.hosts||[]).map(h=>`<span class="badge host">${escapeHtml(h)}</span>`).join("")}
        <span class="badge conf">${ev.numTeams} selecciones</span>
        <span class="badge conf">${groupsList().length} grupos</span>
        <span class="badge conf">${jugados} de ${eventoPartidos().length} partidos jugados</span>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:8px;align-self:center;">
      <button class="btn ghost sm" data-action="open-evento-detail">Formato y reglamento</button>
      <button class="btn ghost sm" data-action="edit-event-general">Editar evento</button>
      <button class="btn danger sm" data-action="reset-event">Restablecer (Mundial 2026)</button>
    </div>
  </div>

  <div class="ev-main">
    <div class="ev-left">
    <div class="card evd-card">
      <div class="evd-head">
        <button class="evd-arr" data-action="evento-dia" data-dir="-1" ${iDia<=0?"disabled":""} title="Día anterior">‹</button>
        <h3>${eventoDia ? escapeHtml(eventoDiaTitulo(eventoDia)) : "Sin partidos"}<span class="evd-sub">${delDia.length} partido${delDia.length===1?"":"s"}</span></h3>
        <button class="evd-arr" data-action="evento-dia" data-dir="1" ${(iDia<0||iDia>=dias.length-1)?"disabled":""} title="Día siguiente">›</button>
      </div>
      <div class="evd-list" style="height:${maxDia*84}px;">
      ${delDia.length ? delDia.map(eventoPartidoHTML).join("") : `<div class="evd-empty">No hay partidos cargados. Carga el calendario oficial desde «Formato y reglamento».</div>`}
      </div>
    </div>
    ${eventoEstadisticasHTML()}
    </div>
    ${eventoPanelDerechoHTML()}
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
        <li>Rondas: ${(ev.rounds||[]).map(r=>escapeHtml(nombreRondaMundial(r.name))).join(" → ")||"—"}.</li>
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
        <h3 style="margin:0 0 8px;font-size:13.5px;"><span class="tag">${escapeHtml(nombreRondaMundial(r.name))}</span> <span style="color:var(--muted);font-weight:500;font-size:12px;">${r.matches.length} partido(s)</span></h3>
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

  ${(typeof pwEditorHTML==="function") ? `
  <div class="section-title"><h2 style="white-space:nowrap;">Press Wall</h2><span class="hint">Muro de patrocinadores para las fotos de prensa. Del lado izquierdo el muro y la carga del back y la referencia. Agrega marcas para ir rellenando cada color de la referencia; cada marca tiene su color de referencia, el tipo de logo y su color de fondo (por defecto el del patrocinador). Los cambios se ven al instante.</span></div>
  <div class="card">
    ${pwEditorHTML({prefix:"evpw", title:"Press wall del Mundial", brands:pwBrandsFor("event"), back:(DB.event&&DB.event.pressWallBgImg)||"", ref:(DB.event&&DB.event.pressWallRefImg)||"", graphicPct:(DB.event&&DB.event.pressWallGraphicPct)||100, graphicX:(DB.event&&DB.event.pressWallGraphicX)||0, graphicY:(DB.event&&DB.event.pressWallGraphicY)||0, live:true, layout:"two-col"})}
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

          <div class="subhead">Logo del torneo</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Logo — fondo oscuro", "evlogo", ev.logoImg, "El que se usa en casi toda la app (fondo oscuro).", 800)}
            ${imageUploadFieldCol("Logo — fondo claro", "evlogo-l", ev.logoImgLight, "Para fondos claros (p. ej. el recuadro de próximo partido).", 800)}
          </div>

          <div class="subhead">Trofeo (imagen del torneo)</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Trofeo — PNG con fondo transparente", "evtrophy", ev.trophyImg, "Va al centro del cuadro de la fase final. Sin imagen se usa el trofeo de la Copa del Mundo.", 800)}
          </div>

          <div class="subhead">Wordmark (texto-logo del torneo)</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            ${imageUploadFieldCol("Wordmark — fondo oscuro", "evwm", ev.wordmarkImg, "Versión clara del texto-logo, para fondos oscuros.", 2000)}
            ${imageUploadFieldCol("Wordmark — fondo claro", "evwm-l", ev.wordmarkImgLight, "Reemplaza el nombre del torneo en el recuadro de próximo partido.", 2000)}
          </div>

          <div class="field" style="grid-column:1/-1;">
            <div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:5px;">Colores del torneo</div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", ev.color1||'#D4AF37', "f-ev-color1")}</label>
              <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", ev.color2||'#15161D', "f-ev-color2")}</label>
              <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", ev.color3||'#FFFFFF', "f-ev-color3")}</label>
            </div>
          </div>

          ${(typeof cardBgEditorHTML==="function") ? cardBgEditorHTML("ev", ev, '#24262d', "light") : ""}

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

          ${(typeof iconEditorSectionHTML==="function") ? iconEditorSectionHTML("evicon", ev, {
            title:"Icono del torneo",
            logoOptions:[["dark","Logo oscuro"],["light","Logo claro"]],
            logoInputs:{ dark:"f-evlogo-data", light:"f-evlogo-l-data" },
            colors:[ev.color1||"#D4AF37", ev.color2||"#15161D", ev.color3||"#FFFFFF"],
            colorInputs:["f-ev-color1","f-ev-color2","f-ev-color3"]
          }) : ""}

          ${(typeof socialSectionHTML==="function") ? socialSectionHTML("evsoc", ev, {
            logoOptions:[["dark","Logo oscuro"],["light","Logo claro"]],
            logos:{ dark:ev.logoImg||"", light:ev.logoImgLight||ev.logoImg||"" },
            logoInputs:{ dark:"f-evlogo-data", light:"f-evlogo-l-data" },
            colors:[ev.color1||"#D4AF37", ev.color2||"#15161D", ev.color3||"#FFFFFF"],
            colorInputs:["f-ev-color1","f-ev-color2","f-ev-color3"]
          }) : ""}
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
          <div style="margin-top:8px;">
            <div style="font-size:12px;color:var(--muted);margin-bottom:8px;">Nombre y descripción de cada premio. El <b>Jugador del partido</b> tiene además su press wall y su trofeo.</div>
            ${(typeof JugadorPartido!=="undefined") ? JugadorPartido.awardsEditorHTML(ev) : `<textarea id="ev-awards" class="json-area" style="min-height:110px;">${escapeHtml((ev.awards||[]).map(a=>`${a.name} | ${a.desc||""}`).join("\n"))}</textarea>`}
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
  ev.logoImgLight = (document.getElementById("f-evlogo-l-data")||{}).value || null;
  ev.wordmarkImg = (document.getElementById("f-evwm-data")||{}).value || null;
  ev.wordmarkImgLight = (document.getElementById("f-evwm-l-data")||{}).value || null;
  { const tr=document.getElementById("f-evtrophy-data"); if(tr) ev.trophyImg = tr.value || null; }   // trofeo (cuadro de la fase final)
  // Fondo de la tarjeta de partido de la Copa del Mundo (mismo editor que los torneos).
  // Solo si se tocó esa sección (o ya estaba configurada): así guardar otros datos del evento no cambia la tarjeta.
  { const ed=document.querySelector('.cbg-ed[data-cbg="ev"]');
    if(typeof cardBgEditorRead==="function" && ed && (ev.cardBgV2 || ed.getAttribute("data-dirty")==="1")) Object.assign(ev, cardBgEditorRead("ev")); }
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
  if(typeof readSocial==="function") Object.assign(ev, readSocial("evsoc"));
  if(typeof readIcon==="function") Object.assign(ev, readIcon("evicon"));
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
  if(typeof JugadorPartido!=="undefined" && document.getElementById("ev-awards-rows")){
    ev.awards = JugadorPartido.awardsEditorRead(ev.awards);
  } else {
    ev.awards = v("ev-awards").split("\n").map(line=>{
      const i = line.indexOf("|");
      const name = (i>=0?line.slice(0,i):line).trim();
      const desc = (i>=0?line.slice(i+1):"").trim();
      return name?{name,desc}:null;
    }).filter(Boolean);
  }

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

// Con la pestaña del torneo abierta, al pasar el reloj del juego a otro día (o al terminar un partido) se
// vuelve a dibujar: avanza el día de la lista y se actualizan tablas y estadísticas.
var eventoUltimaFirma = null;   // día del reloj + partidos jugados en el último dibujo de la pestaña
function eventoFirma(){ let d=""; try{ const n=GameTime.now(); d=n.getFullYear()+"-"+n.getMonth()+"-"+n.getDate(); }catch(e){} return d+"|"+eventoPartidos().filter(eventoJugado).length; }
(function(){
  let intentos=0;
  const enganchar=()=>{
    if(!(window.GameTime && GameTime.GameClock && GameTime.GameClock.onChange)){ if(intentos++<40) setTimeout(enganchar, 250); return; }
    GameTime.GameClock.onChange(()=>{
      try{
        if(typeof activeTab==="undefined" || activeTab!=="evento" || eventoDetailOpen){ eventoDiaManual=false; return; }
        const v=document.getElementById("view"); if(!v || v.hidden) return;
        if(document.querySelector("#modal-root .modal-overlay")) return;   // no cerrar una ventana abierta
        const fm=eventoFirma(); if(fm===eventoUltimaFirma) return;
        if(fm.split("|")[0]!==String(eventoUltimaFirma).split("|")[0]) eventoDiaManual=false;   // cambió el día: la lista lo sigue
        const y=window.scrollY; render(); window.scrollTo(0,y);
      }catch(e){}
    });
  };
  enganchar();
})();
