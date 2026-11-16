/* =========================================================
   COPA MANAGER 2026 — nucleo/importar-partidos.js
   Importador del archivo de texto editable "partidos.txt" (raíz del juego). El usuario
   escribe ahí sus partidos (pasados y futuros) en un formato sencillo y, al arrancar el
   juego, este módulo lo lee (fetch), lo interpreta y lo vuelca en DB.fixtures — enlazando
   jugadores/árbitros/estadios existentes y creando los que falten (jugadores nuevos entran
   como NO convocados de su selección). Es idempotente: en cada carga reemplaza los partidos
   marcados como importados (src:"txt") por lo que diga el archivo, así el .txt es la única
   fuente de verdad de esos partidos. No toca los partidos del torneo (sin src).

   Formato de un bloque (bloques separados por un renglón en blanco):
     Amistoso
     28 mar 2026 · 13:00 UTC−4
     BMO Field, Toronto, Canadá
     Asistencia: 26,328
     Árbitro: Jon Freemon (USA)
     Canadá 2 - Islandia 2
     Gol ICE Orri Óskarsson 9’
     Roj CAN Tajon Buchanan 80’
   En lugar de "Árbitro:" puede ir el cuerpo arbitral completo en una línea (ver CUERPO_ARBITRAL):
     ARB Steven Madrigal (CRC) - AA1 Jeriel Valverde (CRC) - AA2 Luis Granados (CRC) - 4AR Pablo Camacho (CRC)
     (con VAR se agregan "- VAR Nombre (PAÍS) - AVAR Nombre (PAÍS)").
   Códigos de incidencia: Gol (gol), Pen/PEN (gol de penal), GEC (gol en contra: se pone del
   lado del equipo que lo marcó y cuenta para el rival), Roj (tarjeta roja; al final, opcional, "(DA)" =
   expulsión por doble amarilla o "(RD)" = roja directa: "Roj SUI Breel Embolo 72’ (DA)"; sin marcador se
   deduce: si el jugador tiene una Ama antes, es doble amarilla), PenF / PFa (penal fallado en
   tiempo de juego: "PenF ARG Lionel Messi 21’" — código del equipo que lo cobró y quien lo tiró; sale en
   el informe y en la línea de tiempo con el icono de penal fallado, en el minuto a minuto y en la
   calificación; NO cuenta en el marcador).
   Final con tiempo extra: "FT 90+5’, 120+1’" (fin de los 90 y fin del partido). Tanda: "Penales: 4-3" y,
   en la línea siguiente, tiro por tiro: "COL Juan Fernando Quintero Gol, SUI Granit Xhaka Falla, …".
   Horarios en hora LOCAL (no se muestra el uso horario por ahora).
   Jugador del partido (opcional, partidos NO amistosos), al final del bloque:  JDP MEX Luis Romo
   (con "ALT" al final — JDP MEX Luis Romo ALT — usa el fondo alternativo del press wall del premio)
   Estadísticas de Opta por jugador (opcional, para las calificaciones v2): sección "Opta" dentro del bloque,
   SIN renglones en blanco, con la tabla de Opta Points pegada tal cual (tabuladores o espacios):
       Opta
       Jugador  Pos  Rank  PTS  MP  G  SOnT  SOffT  BS  OG  A  P  C  Tk  INT  FW  FC  O  YC  RC  GC  PW  SAV  PSAV
       J. Quiñones  MF  1  8.68  79  1  2.0  2.0  1.0  0.0  0.0  33.00  1.00  0.0  0.0  2.0  1.0  0.0  0.0  0.0  0.0  0.0  0.0  0.0
     · El renglón de columnas es opcional (sin él se usa ese orden). Un "svg" suelto al inicio de la fila se ignora.
     · El nombre puede venir abreviado ("J. Quiñones"): se liga con la alineación por apellido (e inicial si hace falta).
     · Pos: GK, DF, MF, FW o Sub. PTS se recalcula con la fórmula oficial y MP se compara con los minutos de la
       alineación; G, A, OG, YC y RC se cotejan con las incidencias. Todo queda en fx.optaBitacora.
     · Una fila sin números (jugador sin estadísticas) se anota y ese jugador sigue solo con el relato.
   Duración (opcional): "FT 120+2’" = hubo tiempos extra · "Penales: 4-3" · "Retraso: 30’" (minutos de
   retraso o interrupción). Con eso el resultado aparece en el reloj del juego hasta que el partido TERMINA.
   Entrenador (opcional), debajo de los titulares de cada "Ali":  DT, Javier Aguirre  ·  DT, Nombre (Interino)
   Se liga si ya existe en la base; si no, se crea. Sus tarjetas (Ama/Roj con su nombre) quedan como
   del entrenador, sin crear un jugador.

   partidos-mundial.js (window.PARTIDOS_MUNDIAL_TXT): MISMO formato, pero SOLO para partidos de la Copa
   del Mundo. No crea partidos: pone el informe en el partido del calendario oficial que ya existe
   (por número "Partido 73", por las dos selecciones o, en eliminatoria sin rivales, por fecha/estadio).

   Script CLÁSICO (no module). Cargar DESPUÉS de estadios.js, paises.js, jugadores.js,
   arbitros.js, modelo-db.js, almacenamiento.js (persist) y acciones.js
   (buildMinimalTeamFromCountry/ensureTeamKits/relinkCountriesToTeams), y ANTES de init.js.
   ========================================================= */
(function(){
  "use strict";

  const MESES = { ene:0, feb:1, mar:2, abr:3, may:4, jun:5, jul:6, ago:7, sep:8, set:8, oct:9, nov:10, dic:11 };
  const pad2 = n => String(n).padStart(2,"0");
  function nl(s){ return (typeof normLoose==="function") ? normLoose(s) : String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim(); }
  function newPid(){ return "ptx_" + Math.random().toString(36).slice(2,10); }

  // Entrenador de un equipo por nombre (nombre común, nombre + apellido o nombre completo; sin acentos).
  function coachByName(team, name){
    const key=nl(name); if(!team || !key) return null;
    return (team.coaches||[]).find(c=>{
      const vs=[c.commonName, ((c.firstName||"")+" "+(c.lastName||"")).trim(), c.fullName, ((c.lastName||"")+" "+(c.firstName||"")).trim()].concat(c.mergedNames||[]).filter(Boolean).map(nl);   // + alias de perfiles fusionados
      return vs.some(v=> v===key || (v && (v.indexOf(key)>=0 || key.indexOf(v)>=0) && key.split(" ").length>=2));
    }) || null;
  }

  // Busca un entrenador por nombre en TODA la base (selecciones y agentes libres). Si no existe, lo crea:
  // como entrenador del primer equipo de la selección si esta aún no tiene uno; si ya lo tiene (p. ej. un
  // partido de un técnico anterior), entre los agentes libres, para no alterar el cuerpo técnico actual.
  //   Interino ("DT, Nombre (Interino)"): si no existe se crea igual, en el cuerpo técnico de la selección
  //   con el puesto "Entrenador interino" (nunca como entrenador principal).
  function ensureCoach(team, name, ctryId, report, interim){
    const nm=String(name||"").trim(); if(!nm) return null;
    for(const t of (DB.teams||[])){ const c=coachByName(t, nm); if(c) return c; }
    const parts=nm.split(/\s+/); const firstName=parts.shift()||""; const lastName=parts.join(" ");
    if(interim){
      const ci={ id:(typeof newId==="function"?newId("c"):"c_"+Math.random().toString(36).slice(2,10)),
        firstName, lastName, commonName:"", fullName:nm, fullNameLinked:false, birthDate:null,
        rating:70, ratingPotential:null, nationalityIds: ctryId?[ctryId]:[], photo:null,
        contractCountryId: ctryId||null, contractClub:"", contractRole:"Entrenador interino", autoImported:true };
      if(!Array.isArray(team.coaches)) team.coaches=[]; team.coaches.push(ci);
      if(report) report.coaches=(report.coaches||0)+1;
      return ci;
    }
    const hasHead=(team.coaches||[]).some(c=>/primer equipo|^entrenador$/i.test((c.contractRole||"").trim()));
    const c={ id:(typeof newId==="function"?newId("c"):"c_"+Math.random().toString(36).slice(2,10)),
      firstName, lastName, commonName:"", fullName:nm, fullNameLinked:false, birthDate:null,
      rating:70, ratingPotential:null, nationalityIds: ctryId?[ctryId]:[], photo:null,
      contractCountryId: hasHead ? null : (ctryId||null), contractClub:"",
      contractRole: hasHead ? "" : "Entrenador del primer equipo", autoImported:true };
    if(!hasHead){ if(!Array.isArray(team.coaches)) team.coaches=[]; team.coaches.push(c); }
    else if(typeof freeAgentTeam==="function"){ freeAgentTeam().coaches.push(c); }
    else { if(!Array.isArray(team.coaches)) team.coaches=[]; team.coaches.push(c); }
    if(report) report.coaches=(report.coaches||0)+1;
    return c;
  }

  /* ---------- resolución de país / selección ---------- */
  // Un token puede ser un nombre ("Canadá") o un código de 2-4 letras ("USA", "CAN", "ICE").
  function resolveCountry(token){
    const raw = (token||"").trim(); if(!raw) return null;
    const key = nl(raw), up = raw.toUpperCase().replace(/[^A-Z]/g,"");
    const cs = DB.countries || [];
    // 1) por nombre exacto
    let c = cs.find(x=> nl(x.commonName)===key);
    if(c) return c;
    // 2) por código FIFA / COI
    if(up.length>=2 && up.length<=4){
      c = cs.find(x=> (x.fifaCode||"").toUpperCase()===up || (x.iocCode||"").toUpperCase()===up);
      if(c) return c;
    }
    // 3) por inicio del nombre (para códigos "caseros": CANadá, ISLandia…)
    if(up.length>=3){
      c = cs.find(x=> nl(x.commonName).replace(/[^a-z]/g,"").startsWith(up.toLowerCase()));
      if(c) return c;
    }
    return null;
  }

  // Devuelve (o crea) la selección absoluta de un país nombrado. Crea la selección desde el
  // país si aún no existe (misma vía que el botón "+ Selección" de la pestaña Naciones).
  function resolveTeamByName(name){
    const key = nl(name); if(!key) return null;
    // Equipo directo por su nombre
    let t = (DB.teams||[]).find(x=> nl(x.name||x.commonName)===key);
    if(t) return t;
    const country = resolveCountry(name);
    if(!country) return null;
    const tid = country.teamLinks && country.teamLinks.absoluta;
    if(tid){ t = getTeam(tid); if(t) return t; }
    // No hay selección para este país todavía → crearla
    if(typeof buildMinimalTeamFromCountry==="function"){
      try{
        const nt = buildMinimalTeamFromCountry(country);
        if(typeof ensureTeamKits==="function") ensureTeamKits(nt);
        (DB.teams = DB.teams || []).push(nt);
        if(typeof relinkCountriesToTeams==="function") relinkCountriesToTeams();
        return nt;
      }catch(e){ return null; }
    }
    return null;
  }

  function countryOfTeam(t){
    if(!t) return null;
    const c = (DB.countries||[]).find(x=> x.teamLinks && x.teamLinks.absoluta===t.id);
    return c || null;
  }

  // ¿La línea es el NOMBRE de una selección? Se usa como rótulo para organizar las listas por país
  // ("México", "Serbia"…): es solo un separador, no un dato del partido, así que se ignora. No crea nada.
  function isSeleccionLabel(s){
    const key = nl(s); if(!key) return false;
    if((DB.teams||[]).some(t=> nl(t.name||t.commonName)===key)) return true;
    return !!resolveCountry(s);
  }

  /* ---------- jugadores (enlazar o crear como NO convocado) ---------- */
  function ensurePlayerOnTeam(team, name, countryId){
    if(!team) return null;
    const key = nl(name);
    team.players = team.players || [];
    let p = team.players.find(x=> nl((typeof playerDisplayName==="function")?playerDisplayName(x):(x.commonName||x.fullName||x.name||""))===key);
    if(p) return p;
    // Sin importar el orden del nombre y el apellido (Zhou Fei = Fei Zhou), nombre completo o común.
    if(typeof personNameForms==="function"){ const c=team.players.filter(x=>personNameForms(x).indexOf(key)>=0); if(c.length===1) return c[0]; }
    // Perfiles FUSIONADOS (detector de duplicados): el nombre del que se fue liga siempre al que se quedó,
    // esté en esta selección o en otra.
    const porAlias = x => (x.mergedNames||[]).some(n=>nl(n)===key);
    p = team.players.find(porAlias);
    if(p) return p;
    for(const t of (DB.teams||[])){ const q=(t.players||[]).find(porAlias); if(q) return q; }
    // Crear jugador mínimo. Sin dorsal (numberUnassigned) → aparece en "No convocados".
    const parts = (name||"").trim().split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");
    p = {
      id: newPid(),
      firstName, lastName, commonName:"", fullName:(name||"").trim(),
      pos:"MF", positions:{}, number:null, numberUnassigned:true,
      birthDate:null, club:"", rating:null, ratingPotential:null,
      nationalityIds: countryId?[countryId]:[], declaredForCountryId: countryId||null,
      caps:0, goalsNational:0, gender:"Masculino",
      autoImported:true, importSource:"partidos.txt"
    };
    team.players.push(p);
    return p;
  }

  /* ---------- árbitro (enlazar o crear) ---------- */
  function ensureReferee(name, countryToken, role){
    const nm = (name||"").trim(); if(!nm) return null;
    const key = nl(nm);
    const kt = key.split(/\s+/).filter(Boolean);   // tokens del nombre del archivo
    DB.referees = DB.referees || [];
    // Compara contra TODAS las formas del nombre de cada árbitro (nombre completo, nombre+apellido y
    // nombre común), no solo el "fullName": los árbitros de la base traen el nombre completo con segundo
    // nombre/apellidos, pero en el archivo se escribe el nombre corto. Además, si los tokens de uno están
    // contenidos en el otro (nombre más/menos completo del MISMO árbitro), se considera el mismo.
    let r = DB.referees.find(x=>{
      const forms = [ x.fullName, ((x.firstName||"")+" "+(x.lastName||"")), x.commonName, ((x.lastName||"")+" "+(x.firstName||"")) ].concat(x.mergedNames||[])   // + alias de perfiles fusionados
        .map(s=>nl((s||"").trim())).filter(Boolean);
      if(forms.includes(key)) return true;
      if(kt.length>=2){
        for(const fkey of forms){
          const ft = fkey.split(/\s+/).filter(Boolean);
          if(ft.length>=2){
            const setF = new Set(ft), setK = new Set(kt);
            if(kt.every(t=>setF.has(t)) || ft.every(t=>setK.has(t))) return true;
          }
        }
      }
      return false;
    });
    if(r) return r;
    const country = countryToken ? resolveCountry(countryToken) : null;
    const parts = nm.split(/\s+/);
    const firstName = parts.shift() || "";
    const lastName = parts.join(" ");
    r = {
      id: "reftx_" + Math.random().toString(36).slice(2,9),
      firstName, lastName, commonName:"", fullName:nm, birthDate:null,
      gender:"Masculino", fifaSince:null,
      nationalityIds: country?[country.id]:[], countryRepresentsId: country?country.id:null,
      countryWorksIds: country?[country.id]:[],
      role: role || "Árbitro central", previousWorldCups:[], matches:[], photo:null,
      autoImported:true, importSource:"partidos.txt"
    };
    DB.referees.push(r);
    return r;
  }

  /* ---------- cuerpo arbitral completo (una línea) ----------
     ARB Steven Madrigal (CRC) - AA1 Jeriel Valverde (CRC) - AA2 Luis Granados (CRC) - 4AR Pablo Camacho (CRC)
     Con VAR se agregan:  - VAR Jose Carlos Rivero (USA) - AVAR Lukasz Szpala (USA)
     ARB = central · AA1/AA2 = asistentes · 4AR (o A4) = cuarto árbitro · VAR / AVAR = árbitros de video.
     Los árbitros que no existen se suman a la base con el rol que corresponde a su puesto (el cuarto
     árbitro es árbitro central; VAR y AVAR son árbitros asistentes de video). */
  const CUERPO_ARBITRAL = {
    ARB:{ campo:"ref",    rol:"Árbitro central" },
    AA1:{ campo:"aa1",    rol:"Árbitro asistente" },
    AA2:{ campo:"aa2",    rol:"Árbitro asistente" },
    "4AR":{ campo:"fourth", rol:"Árbitro central" },
    A4: { campo:"fourth", rol:"Árbitro central" },
    VAR:{ campo:"var",    rol:"Árbitro asistente de video" },
    AVAR:{ campo:"avar",  rol:"Árbitro asistente de video" }
  };
  const RX_CUERPO = /^(ARB|AA1|AA2|4AR|A4|VAR|AVAR)\s+(.+?)\s*(?:\(([^)]+)\))?\s*$/i;
  function parseCrewLine(line){
    const s = String(line||"").trim();
    if(!/^ARB\s+\S/i.test(s)) return null;
    const out = {};
    s.split(/\s+[-–—]\s+/).forEach(seg=>{
      const m = RX_CUERPO.exec(seg.trim()); if(!m) return;
      const def = CUERPO_ARBITRAL[m[1].toUpperCase()]; if(!def || out[def.campo]) return;
      out[def.campo] = { name:m[2].trim(), ctry:m[3]?m[3].trim():null, rol:def.rol };
    });
    return out.ref ? out : null;
  }

  /* ---------- parseo de líneas ---------- */
  function parseDateLine(line){
    // "28 mar 2026 · 13:00 UTC−4"
    const out = { date:null, time:null, tz:null };
    const dm = line.match(/(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóú]{3,})\.?\s+(\d{4})/);
    if(dm){
      const mo = MESES[nl(dm[2]).slice(0,3)];
      if(mo!=null) out.date = `${dm[3]}-${pad2(mo+1)}-${pad2(parseInt(dm[1],10))}`;
    }
    const tm = line.match(/(\d{1,2}):(\d{2})/);
    if(tm) out.time = `${pad2(parseInt(tm[1],10))}:${tm[2]}`;
    const tz = line.match(/UTC\s*([+\-−]\s*\d{1,2}(?::?\d{2})?)/i);
    if(tz) out.tz = "UTC" + tz[1].replace(/\s+/g,"").replace(/−/g,"−");
    // CONTRATIEMPO (dato interno, no se muestra): lo que va después de "→".
    //   "… 19:00 UTC−6 → 20:00 (Retraso: tormenta eléctrica)"            → inicio a las 20:00
    //   "… 17:00 UTC−4 → 2.º tiempo 20:00 (Suspensión en el descanso: …)" → el 2º tiempo a las 20:00
    // La hora de ANTES de la flecha es la oficial (la que usa todo el juego).
    const ar = line.split(/\s*(?:→|->)\s*/);
    if(ar.length>1){
      const tras = ar.slice(1).join(" ");
      const hr = tras.match(/(\d{1,2}):(\d{2})/);
      const mot = tras.match(/\(([^)]*)\)/);
      out.contratiempo = {
        horaReal: hr ? `${pad2(parseInt(hr[1],10))}:${hr[2]}` : null,
        tipo: /2\.?\s*[ºo°]?\s*tiempo|segundo\s+tiempo/i.test(tras) ? "segundoTiempo" : "inicio",
        motivo: mot ? mot[1].trim() : ""
      };
      const ant = ar[0].match(/(\d{1,2}):(\d{2})(?![\s\S]*\d{1,2}:\d{2})/);   // hora oficial: la última de antes de la flecha
      if(ant) out.time = `${pad2(parseInt(ant[1],10))}:${ant[2]}`;
    }
    return out;
  }
  // CLIMA (opcional, debajo de la fecha):  "Clima: 23 °C, Llovizna"  ·  "Clima: 32 °C, Nublado · Techo cerrado"
  function parseClimaLine(line){
    const m = String(line||"").match(/^clima\s*:\s*(.*)$/i); if(!m) return null;
    let resto = m[1].trim();
    const techoCerrado = /[·•\-–]\s*techo\s+cerrado\s*$/i.test(resto);
    if(techoCerrado) resto = resto.replace(/\s*[·•\-–]\s*techo\s+cerrado\s*$/i, "").trim();
    const tm = resto.match(/^(-?\d+(?:[.,]\d+)?)\s*°?\s*C?\s*,?\s*/i);
    const temperatura = tm ? parseFloat(tm[1].replace(",", ".")) : null;
    const condicion = (tm ? resto.slice(tm[0].length) : resto).replace(/^[,\s]+/,"").trim();
    return { temperatura, condicion, techoCerrado };
  }

  function parseVenueLine(line){
    // "BMO Field, Toronto, Canadá"
    const parts = line.split(",").map(s=>s.trim()).filter(Boolean);
    if(parts.length>=3) return { name:parts[0], city:parts[1], country:parts.slice(2).join(", ") };
    if(parts.length===2) return { name:parts[0], city:parts[1], country:"" };
    return { name:parts[0]||"", city:"", country:"" };
  }

  // Línea de resultado. Formato: "<Equipo A> <golesA> - <Equipo B> <golesB>" (el marcador va DESPUÉS
  // de cada selección). Jugado: "Canadá 2 - Islandia 2". Por jugar: "Canadá - Islandia" / "Canadá vs Islandia".
  function parseResultLine(line){
    let m = line.match(/^(.+?)\s+(\d+)\s*[-–—]\s*(.+?)\s+(\d+)\s*$/);
    if(m) return { a:m[1].trim(), b:m[3].trim(), sa:parseInt(m[2],10), sb:parseInt(m[4],10), played:true };
    m = line.match(/^(.+?)\s+(?:vs\.?|[-–—])\s+(.+?)\s*$/i);
    if(m && !/\d/.test(line)) return { a:m[1].trim(), b:m[2].trim(), sa:null, sb:null, played:false };
    return null;
  }

  // pfa / pf / penf = PENAL FALLADO en tiempo de juego ("PenF ARG Lionel Messi 21’" · "PFa MEX Raúl Jiménez 57’"): solo minuto a minuto y calificación; NO es incidencia ni cuenta en el marcador.
  const EVENT_CODES = { gol:"gol", pen:"pen", gec:"gec", roj:"roj", ama:"ama", pfa:"pfa", pf:"pfa", penf:"pfa" };
  // Encabezado de alineación:  "Ali MEX 4-3-3 (H)"  ->  {code, formation, type}
  function parseLineupHeader(line){
    const m = String(line||"").trim().match(/^ali\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+([\d]+(?:-[\d]+)+)\s*(?:\(([A-Za-z])\))?\s*$/i);
    if(!m) return null;
    return { code:m[1].toUpperCase(), formation:m[2], type:(m[3]||"").toUpperCase() };
  }
  // Fila de alineación:  "27, Richard Ledezma, RB - 16, Jesús Garza 66’"
  //   -> {number, name, pos, sub:{number,name,minute}}   (el sustituto y su minuto son opcionales)
  //   Si el que entró volvió a salir, se encadena:  "… - 16, Jesús Garza 66’ - 11, Santiago Giménez 85’"
  //   -> sub:{…Garza, sub:{…Giménez}}
  function parseLineupRow(line){
    // La (C) del capitán es opcional y va justo después de la posición: "23, Jesús Gallardo, LB (C)".
    // CAMBIOS EN CADENA (quien entró y luego volvió a salir), cualquier cantidad de eslabones:
    //   "3, Tomáš Holeš, CB - 22, Tomáš Souček 64' - 24, Alexandr Sojka 87'"
    //   → row.sub = Souček (64') y row.sub.sub = Sojka (87', entra por Souček).
    // CALIFICACIÓN MANUAL (opcional) entre paréntesis al final de cada jugador: "(6.4)" o "(SC)".
    //   "17, Ágúst Þorsteinsson, RM (6.4) - 14, Birnir Snær Ingason 77’ (5.7)"
    const partes = String(line||"").trim().split(/\s+[-–—]\s+(?=\d{1,3}\s*,)/);
    const califs = partes.map((seg,k)=>{
      let cal;
      partes[k] = seg.replace(/\s*\(\s*(\d{1,2}(?:[.,]\d{1,2})?|sc)\s*\)/ig, (mm, v)=>{
        if(/^sc$/i.test(v)) cal="SC";
        else { const n=parseFloat(String(v).replace(",", ".")); if(n>=0 && n<=10) cal=Math.round(n*10)/10; else { try{ console.warn("[partidos] Calificación fuera de rango (0–10) ignorada: "+mm.trim()+" en «"+line+"»"); }catch(e){} } }
        return "";
      }).trim();
      return cal;
    });
    const m = partes[0].match(/^(\d{1,3})\s*,\s*(.+?)\s*,\s*([A-Za-z]{1,3})\s*(\(\s*[Cc]\s*\))?\s*$/);
    if(!m) return null;
    const row = { number:parseInt(m[1],10), name:m[2].trim(), pos:m[3].toUpperCase(), captain: !!m[4] };
    if(califs[0]!==undefined) row.rating = califs[0];
    let cola = row;
    for(let k=1;k<partes.length;k++){
      const s = partes[k].match(/^(\d{1,3})\s*,\s*(.+?)\s+(\d{1,3}(?:\+\d{1,2})?)\s*['’′´]?\s*$/);
      if(!s) return null;
      cola.sub = { number:parseInt(s[1],10), name:s[2].trim(), minute:s[3] };
      if(califs[k]!==undefined) cola.sub.rating = califs[k];
      cola = cola.sub;
    }
    return row;
  }
  // Encabezado de SUPLENTES QUE NO JUGARON:  "Sub MEX"
  function parseBenchHeader(line){
    const m = String(line||"").trim().match(/^sub\s+([A-Za-zÁÉÍÓÚ]{2,4})\s*$/i);
    return m ? { code:m[1].toUpperCase() } : null;
  }
  // Fila de un suplente que no jugó:  "28, Carlos Acevedo, GK"  o  "5, Denzell García"
  //   La posición es OPCIONAL: solo se pone a los porteros (los únicos que muestran su icono de posición).
  function parseBenchRow(line){
    const m = String(line||"").trim().match(/^(\d{1,3})\s*,\s*(.+?)\s*(?:,\s*([A-Za-z]{1,3}))?\s*(\(\s*[Cc]\s*\))?\s*$/);
    if(!m) return null;
    return { number:parseInt(m[1],10), name:m[2].trim(), pos:(m[3]||"").toUpperCase(), captain: !!m[4] };
  }
  // Línea de estadísticas:  "POS: 57, 43 - TIR: 24, 4 - TPO: 11, 2 - FAL: 7, 11 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 8, 2 - ATA: 2, 7"
  //   (primero LOCAL, luego VISITANTE). Devuelve {pos:[h,a], shots, sot, fouls, yellows, reds, corners, saves}.
  const STAT_KEYS = { POS:"pos", TIR:"shots", TPO:"sot", FAL:"fouls", AMA:"yellows", ROJ:"reds", ESQ:"corners", ATA:"saves" };
  function parseStatsLine(line){
    const s = String(line||"").trim();
    if(!/^pos\s*:/i.test(s)) return null;
    const out = {};
    s.split(/\s+[-–—]\s+/).forEach(part=>{
      const mm = part.match(/^\s*([A-Za-z]{2,4})\s*:\s*(\d{1,3})\s*,\s*(\d{1,3})\s*$/);
      if(mm){ const key=STAT_KEYS[mm[1].toUpperCase()]; if(key) out[key]=[parseInt(mm[2],10), parseInt(mm[3],10)]; }
    });
    return Object.keys(out).length ? out : null;
  }
  // Línea de UNIFORMES elegidos (último renglón, opcional):
  //   Kit MEX J1 C1, P1 C1 - Kit ISL J1 C1, P1 C1 - Kit ARB ConFIFA R1
  // Kit <CODE> J<n> C<n>, P<n> C<n>  → equipo <CODE>: kit de jugador n (combo n) y de portero n (combo n).
  // Kit ARB <Fuente> R<n> [C<n>]     → árbitro: fuente Con<CONF> / Tor<TORNEO>, kit n y combinación n.
  function parseKitSeg(seg){
    const s = String(seg||"").trim();
    const m = s.match(/^Kit\s+(\S+)\s+(.*)$/i);
    if(!m) return null;
    const code = m[1], rest = (m[2]||"").trim();
    if(/^ARB$/i.test(code)){
      const sm = rest.match(/^(\S+)/); const source = sm ? sm[1] : "";
      // R<n> (uniforme) y C<n> (combinación de short y calcetas) se leen DESPUÉS de la fuente, para que el
      // código de la fuente (p. ej. TorFWC26) no se confunda con un C26.
      const tras = rest.slice(source.length);
      const rn = tras.match(/\bR\s*(\d+)/i);
      const cn = tras.match(/\bC\s*(\d+)/i);
      // Fuente del uniforme de árbitro: Con<CONF> (FIFA/CONCACAF/…), Tor<TORNEO> o Fed<PAÍS> (federación).
      let kind = "conf", scode = source;
      const cm = source.match(/^Con(.+)$/i), tm = source.match(/^Tor(.+)$/i), fm = source.match(/^Fed(.+)$/i);
      if(cm){ kind = "conf"; scode = cm[1]; }
      else if(tm){ kind = "tour"; scode = tm[1]; }
      else if(fm){ kind = "fed"; scode = fm[1]; }
      return { ref:{ kind, code:scode, num: rn?parseInt(rn[1],10):null, combo: cn?parseInt(cn[1],10):null } };
    }
    const parts = rest.split(",");
    const left = parts[0]||"", right = parts[1]||"";
    const num = (str, re)=>{ const mm=String(str).match(re); return mm?parseInt(mm[1],10):null; };
    return { team:{ code,
      jugadorNum:   num(left,  /J\s*(\d+)/i),
      jugadorCombo: num(left,  /C\s*(\d+)/i),
      porteroNum:   num(right, /P\s*(\d+)/i),
      porteroCombo: num(right, /C\s*(\d+)/i)
    } };
  }
  // Tanda de penales tiro por tiro: "COD Jugador Gol|Falla, COD Jugador Gol|Falla, …".
// Devuelve [{code, name, scored}] o null si la línea no tiene ese formato (todas las partes deben cuadrar).
function parsePenShotsLine(ln){
  const partes = String(ln||"").split(",").map(x=>x.trim()).filter(Boolean);
  if(!partes.length) return null;
  const out = [];
  for(const pt of partes){
    const m = pt.match(/^([A-Za-z]{2,4})\s+(.+?)\s+(gol|anot[oó]|convertido|falla|fall[oó]|errado|atajad[oa]|poste|fuera)\.?$/i);
    if(!m || m[1]!==m[1].toUpperCase()) return null;
    out.push({ code:m[1].toUpperCase(), name:m[2].trim(), scored:/^(gol|anot|convertido)/i.test(m[3]) });
  }
  return out;
}
function parseKitLine(line){
    const s = String(line||"").trim();
    if(!/^Kit\s+/i.test(s)) return null;
    // Se corta ANTES de cada "Kit" (no por el separador), así funciona con " - ", "," o cualquier mezcla:
    //   "Kit MEX J1 C1, P1 C1 - Kit ISL J1 C1, P1 C1, Kit ARB ConFIFA R2"
    const segs = s.split(/(?=\bKit\b)/i).map(x=>x.replace(/[\s,–—-]+$/,"").trim()).filter(Boolean).map(parseKitSeg).filter(Boolean);
    return segs.length ? segs : null;
  }
  function parseEventLine(line){
    // Acepta el modificador al INICIO (Pen/GEC ...) o al FINAL entre paréntesis:
    //   "Gol CAN Jonathan David 67’ (PEN)"   -> gol de penal
    //   "Gol ISL Sverrir 33’ (GEC)"          -> gol en contra
    //   "Gol ICE Orri Óskarsson 9’"          -> gol normal
    //   "Roj CAN Tajon Buchanan 80’"         -> tarjeta roja
    //   "Gol MEX Richard Ledezma 22’ - Asi MEX Armando González" -> gol con asistencia
    // La asistencia es OPCIONAL, va al final tras un guion: "- Asi CODIGO Jugador".
    const m = line.match(/^([A-Za-zÁÉÍÓÚáéíóú]{2,4})\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+(.+?)\s+(\d{1,3}(?:\+\d{1,2})?)\s*['’′´]?\s*(?:\(([^)]*)\))?\s*(?:[-–—]\s*[Aa]si\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+(.+?))?\s*$/);
    if(!m) return null;
    let code = nl(m[1]);
    if(!(code in EVENT_CODES)) return null;
    code = EVENT_CODES[code];
    const mod = nl(m[5] || "");
    return {
      code, teamCode:m[2].toUpperCase(), player:m[3].trim(), minute:m[4],
      penalty: (code==="pen" || mod==="pen"),
      // Roja con marcador opcional: "(DA)" doble amarilla · "(RD)" roja directa. Sin marcador: null (se deduce).
      doble: (mod==="da") ? true : ((mod==="rd") ? false : null),
      og:      (code==="gec" || mod==="gec"),
      assistCode:   m[6] ? m[6].toUpperCase() : null,
      assistPlayer: m[7] ? m[7].trim() : null
    };
  }

  function classify(line){
    const s = line.trim();
    if(/^clima\s*:/i.test(s)) return "clima";   // antes que "venue" (la línea del clima lleva coma)
    if(/^asistencia\s*:/i.test(s)) return "att";
    if(/^(á|a)rbitros?\s*:/i.test(s)) return "ref";
    if(parseCrewLine(s)) return "crew";
    if(parseEventLine(s)) return "event";
    if(/\d{1,2}\s+[A-Za-zÁÉÍÓÚáéíóú]{3,}\.?\s+\d{4}/.test(s)) return "date";
    if(parseResultLine(s)) return "result";
    if(s.indexOf(",")>=0) return "venue";
    return "header";
  }

  /* ---------- ESTADÍSTICAS DE OPTA POR JUGADOR (sección "Opta") ---------- */
  const OPTA_COLS = ["Rank","PTS","MP","G","SOnT","SOffT","BS","OG","A","P","C","Tk","INT","FW","FC","O","YC","RC","GC","PW","SAV","PSAV"];
  const OPTA_STATS = ["G","SOnT","SOffT","BS","OG","A","P","C","Tk","INT","FW","FC","O","YC","RC","GC","PW","SAV","PSAV"];
  const RX_OPTA_POS = /^(GK|DF|MF|FW|SUB|POR|DEF|MED|DEL|ARQ|SUP)$/i;   // inglés o español (Arq = portero, Sup = suplente)
  const RX_OPTA_ETIQUETA = /^(points|stats|puntos|estad[ií]sticas|pos\.?|rank|jugador|player)$/i;   // rótulos sueltos de la tabla
  // ¿Este renglón es del informe (y no de la tabla de Opta)? Cierra la sección Opta.
  function esLineaDelInforme(ln){
    return !!(parseLineupHeader(ln) || parseBenchHeader(ln) || parseStatsLine(ln) || parseKitLine(ln) || parseEventLine(ln) ||
      /^jdp\s/i.test(ln) || /^FT\s+\d/i.test(ln) || /^(retraso|demora|interrupci[oó]n|suspensi[oó]n)\b/i.test(ln) ||
      /^pen(ales|altis|altys)?\s*:?\s*\d/i.test(ln) || /^clima\s*:/i.test(ln) || /^asistencia\s*:/i.test(ln) || /^(á|a)rbitros?\s*:/i.test(ln) || !!parseCrewLine(ln) || !!parsePenShotsLine(ln) || /^incidencias\s*:?\s*$/i.test(ln));
  }
  // Renglón de columnas: trae PTS y MP. Devuelve las columnas conocidas en su orden (después de Pos).
  function parseOptaHeader(line){
    const t = String(line||"").trim().split(/\s+/);
    const up = t.map(x=>x.replace(/\.$/,"").toUpperCase());
    if(up.indexOf("PTS")<0 || up.indexOf("MP")<0) return null;
    const cols = [];
    t.forEach(x=>{ const k=OPTA_COLS.find(c=>c.toUpperCase()===x.replace(/\.$/,"").toUpperCase()); if(k) cols.push(k); });
    return cols.length ? cols : null;
  }
  // Fila: [svg] Nombre (una o más palabras) Pos números…  → {name, pos, vals}
  function parseOptaRow(line){
    const t = String(line||"").trim().split(/\s+/);
    if(t.length && /^svg$/i.test(t[0])) t.shift();
    let iPos = -1;
    for(let i=1;i<t.length;i++){ if(RX_OPTA_POS.test(t[i])){ iPos=i; break; } }
    if(iPos<1) return null;
    const nums = t.slice(iPos+1);
    if(nums.some(x=>!/^-?\d+(?:[.,]\d+)?$/.test(x))) return null;
    return { name:t.slice(0,iPos).join(" "), pos:t[iPos].toUpperCase(), vals:nums.map(x=>parseFloat(x.replace(",","."))) };
  }

  /* ---------- mapeo de códigos de equipo a los dos equipos del partido ---------- */
  function buildCodeMap(codes, TA, TB){
    const cA = countryOfTeam(TA), cB = countryOfTeam(TB);
    const score = (code, c, team)=>{
      if(!c && !team) return 0;
      const up = code.toUpperCase();
      let s = 0;
      if(c){
        if((c.fifaCode||"").toUpperCase()===up || (c.iocCode||"").toUpperCase()===up) s = Math.max(s,3);
        if(nl(c.commonName).replace(/[^a-z]/g,"").startsWith(up.toLowerCase())) s = Math.max(s,2);
      }
      if(nl((team&&(team.name||team.commonName))||"").replace(/[^a-z]/g,"").startsWith(up.toLowerCase())) s = Math.max(s,2);
      return s;
    };
    const map = {};
    const uniq = [...new Set(codes)];
    // 1) puntuar cada código contra ambos equipos
    const scored = uniq.map(code=>({ code, a:score(code,cA,TA), b:score(code,cB,TB) }));
    // 2) asignación directa cuando hay ganador claro
    scored.forEach(x=>{ if(x.a>x.b) map[x.code]=TA.id; else if(x.b>x.a) map[x.code]=TB.id; });
    // 3) eliminación: códigos sin resolver van al equipo que quede libre (partido de 2 equipos)
    const claimed = new Set(Object.values(map));
    scored.forEach(x=>{
      if(map[x.code]) return;
      if(!claimed.has(TA.id) && claimed.has(TB.id)){ map[x.code]=TA.id; claimed.add(TA.id); }
      else if(!claimed.has(TB.id) && claimed.has(TA.id)){ map[x.code]=TB.id; claimed.add(TB.id); }
      else { map[x.code] = (x.a>=x.b)?TA.id:TB.id; } // último recurso
    });
    return map;
  }

  /* ---------- ligar y validar la sección Opta con la alineación y las incidencias ----------
     Devuelve la bitácora [{nivel:"error"|"aviso"|"info", texto}] (determinista: mismo texto → misma bitácora).
     Guarda en cada jugador de la alineación: rec.opta {G,…,PSAV}, rec.optaPts, rec.optaMin, rec.optaPos. */
  function ligarOpta(raw, lineups, goals, cards, ftMin){
    const bit = []; const nota=(nivel,texto)=>bit.push({ nivel, texto });
    const cols = raw.cols || OPTA_COLS;
    if(!raw.cols) nota("info", "Sin renglón de columnas: se usa el orden de la tabla de Opta Points (Rank, PTS, MP, G … PSAV).");
    if(raw.ignorados) nota("info", `${raw.ignorados} renglones de la sección Opta no son filas de jugadores (glosario o texto suelto) y se ignoraron.`);
    // Valores de cada fila por columna. Si la fila trae más números que columnas (el Rank viene en su propio
    // renglón y no en el de columnas), se quitan los sobrantes del principio.
    let quitoRank = false;
    raw.rows.forEach(row=>{
      let vals = row.vals;
      if(vals.length > cols.length){ vals = vals.slice(vals.length - cols.length); quitoRank = true; }
      row.v = {}; cols.forEach((k,i)=>{ if(i<vals.length) row.v[k]=vals[i]; });
      row.gk = /^(GK|POR|ARQ)$/i.test(row.pos);
    });
    if(quitoRank) nota("info", "Las filas traen el Rank antes de PTS; se tomó como Rank.");
    // ¿Conteos (vista Stats) o puntos por categoría (vista Points)?
    const V2c = (typeof window!=="undefined") ? window.CalificacionesV2 : null;
    const conDatos = raw.rows.filter(r=>r.vals.length);
    const enPuntos = !!(V2c && conDatos.length && V2c.tablaEsDePuntos(conDatos.map(r=>r.v)));
    if(enPuntos) nota("info", "La tabla trae PUNTOS por categoría (vista Points de Opta): se convirtieron a conteos dividiendo entre el peso oficial de cada acción.");
    // Solo PTS (sin desglose por acción): basta para que nota_motor final sea la misma que con la tabla completa.
    const soloPts = cols.indexOf("PTS")>=0 && !OPTA_STATS.some(c=>cols.indexOf(c)>=0);
    if(soloPts) nota("info", "La tabla trae solo el PTS de Opta (sin desglose): v2 usa la suma total y reparte en sus minutos lo que el relato no explica.");
    else OPTA_STATS.forEach(c=>{ if(cols.indexOf(c)<0) nota("aviso", `La tabla no trae la columna ${c}: cuenta como 0.`); });
    const fin = (()=>{ const b=parseInt(String(ftMin||"90"),10)||90; return b>=105 ? 120 : 90; })();
    const minBase = m=>{ const b=parseInt(String(m||""),10); return isFinite(b) ? Math.min(b, fin) : null; };
    // Candidatos: todos los que jugaron, con su minuto de entrada y salida (nominales, como el MP de Opta).
    const cands = [];
    [lineups.home, lineups.away].forEach(e=>{
      if(!e) return;
      (e.players||[]).forEach(p=>{
        let r=p, ini=0;
        while(r){
          const roja=(cards||[]).find(c=>c.type==="red" && ((r.playerId && c.playerId===r.playerId) || nl(c.player)===nl(r.name)));
          let sale = r.sub && r.sub.minute ? minBase(r.sub.minute) : fin;
          if(roja){ const mr=minBase(roja.minute); if(mr!=null) sale=Math.min(sale, mr); }
          const toks = nl(r.name).replace(/[^a-z\s-]/g," ").split(/\s+/).filter(Boolean);
          cands.push({ rec:r, teamId:e.teamId, min:Math.max(0, sale-ini), nombre:r.name, toks });
          if(!r.sub) break;
          ini = minBase(r.sub.minute) || ini; r=r.sub;
        }
      });
    });
    const usados = new Map();
    raw.rows.forEach(row=>{
      const toks = nl(row.name).replace(/[^a-z\s.-]/g," ").split(/\s+/).filter(Boolean);
      const ape = (toks[toks.length-1]||"").replace(/\./g,"");
      const ini = (toks.length>1 ? toks[0].replace(/\./g,"") : "").charAt(0);
      let hit = cands.filter(c=>nl(c.nombre)===nl(row.name));
      if(!hit.length) hit = cands.filter(c=>c.toks[c.toks.length-1]===ape);
      if(hit.length>1 && ini) { const h2=hit.filter(c=>c.toks[0].charAt(0)===ini); if(h2.length) hit=h2; }
      if(!hit.length){ nota("error", `«${row.name}» no se encontró en las alineaciones; su fila no se usa.`); return; }
      if(hit.length>1){ nota("error", `«${row.name}» coincide con ${hit.map(h=>h.nombre).join(" y ")}; su fila no se usa.`); return; }
      const c = hit[0];
      if(ini && c.toks[0].charAt(0)!==ini) nota("aviso", `«${row.name}» se ligó con ${c.nombre} por apellido (la inicial no coincide).`);
      if(usados.has(c.rec)){ nota("error", `${c.nombre} aparece dos veces en la tabla de Opta; se usa la primera fila.`); return; }
      if(!row.vals.length){ nota("aviso", `${c.nombre}: fila sin estadísticas; sigue solo con el relato.`); usados.set(c.rec, null); return; }
      if(row.vals.length < cols.length) nota("aviso", `${c.nombre}: la fila trae ${row.vals.length} valores y la tabla ${cols.length} columnas; se toman en orden.`);
      const v = row.v;
      if(soloPts){
        if(v.PTS==null){ nota("aviso", `${c.nombre}: fila sin PTS.`); usados.set(c.rec, null); return; }
        delete c.rec.opta; c.rec.optaPts = v.PTS; if(v.MP!=null) c.rec.optaMin = v.MP; c.rec.optaPos = row.gk ? "GK" : row.pos;
        usados.set(c.rec, { soloPts:true });
        if(v.MP!=null && Math.abs(v.MP - c.min) > 1) nota("aviso", `${c.nombre}: Opta le da ${v.MP}’ y la alineación ${c.min}’.`);
        return;
      }
      let st = {};
      if(enPuntos){
        const gkConv = row.gk || String(c.rec.pos||"").toUpperCase()==="GK";
        const cv = V2c.puntosAConteos(v, gkConv);
        st = cv.conteos;
        cv.problemas.forEach(p=>nota("error", `${c.nombre}: ${p} (la conversión de puntos a conteos no es exacta).`));
      } else OPTA_STATS.forEach(k=>{ st[k] = Math.round(+v[k]||0); });
      c.rec.opta = st;
      if(v.PTS!=null) c.rec.optaPts = v.PTS;
      if(v.MP!=null) c.rec.optaMin = v.MP;
      c.rec.optaPos = row.gk ? "GK" : row.pos;
      usados.set(c.rec, st);
      // PTS: se recalcula con la fórmula oficial (portero si Opta lo marca GK o la alineación lo pone de GK).
      const V2 = (typeof window!=="undefined") ? window.CalificacionesV2 : null;
      if(V2 && v.PTS!=null){
        const gk = row.gk || String(c.rec.pos||"").toUpperCase()==="GK";
        const calc = V2.optaPoints(st, gk ? "GK" : "DF");
        if(Math.abs(calc - v.PTS) > 0.005) nota("error", `${c.nombre}: PTS de la tabla ${v.PTS.toFixed(2)}, la fórmula oficial da ${calc.toFixed(2)} con sus estadísticas.`);
      }
      if(v.MP!=null && Math.abs(v.MP - c.min) > 1) nota("aviso", `${c.nombre}: Opta le da ${v.MP}’ y la alineación ${c.min}’.`);
      // Eventos críticos contra las incidencias del informe.
      const mismo = (id, nm)=> (c.rec.playerId && id===c.rec.playerId) || nl(nm||"")===nl(c.nombre);
      const inf = {
        G:  (goals||[]).filter(g=>!g.og && mismo(g.playerId, g.player)).length,
        OG: (goals||[]).filter(g=> g.og && mismo(g.playerId, g.player)).length,
        A:  (goals||[]).filter(g=>!g.og && g.assistPlayer && mismo(g.assistPlayerId, g.assistPlayer)).length,
        YC: (cards||[]).filter(k=>k.type==="yellow" && !k.coach && mismo(k.playerId, k.player)).length,
        RC: (cards||[]).filter(k=>k.type==="red" && !k.coach && mismo(k.playerId, k.player)).length
      };
      Object.keys(inf).forEach(k=>{ if(inf[k]!==st[k]) nota("aviso", `${c.nombre}: ${k} ${st[k]} en Opta y ${inf[k]} en las incidencias.`); });
    });
    cands.forEach(c=>{ if(!usados.has(c.rec) && c.min>0) nota("info", `${c.nombre} (${c.min}’) no tiene fila de Opta; cuenta solo el relato.`); });
    nota("info", `Opta: ${[...usados.values()].filter(Boolean).length} jugadores con estadísticas de ${cands.filter(c=>c.min>0 || usados.has(c.rec)).length} que jugaron.`);
    return bit;
  }

  /* ---------- construir un fixture desde un bloque de texto ---------- */
  function buildFixture(block, report){
    const lines = block.split(/\n/).map(s=>s.trim()).filter(Boolean);
    if(!lines.length) return null;
    let type = "", dateInfo={date:null,time:null,tz:null}, clima=null, venue=null, att=null, closedDoors=false, refName=null, refCtry=null, result=null, crewRaw=null;
    const events = [];
    const lineupsRaw = [];   // [{code, formation, type, players:[{number,name,pos,sub}]}]
    const benchRaw = [];     // [{code, players:[{number,name,pos}]}]  suplentes que NO jugaron
    let statsRaw = null, kitSegs = null, ftMin = null, ftReg = null, delayMin = null, pens = null, penShotsRaw = null;
    let headerTaken = false, sawMatchData = false, curLineup = null, curBench = null, potmRaw = null;
    let optaRaw = null, curOpta = null;   // sección "Opta": {cols, rows:[{name,pos,vals}]}
    for(let li=0; li<lines.length; li++){
      const ln = lines[li];
      // ---- Bloque de ALINEACIÓN (Ali CODE Formación) y sus filas de jugadores ----
      const lh = parseLineupHeader(ln);
      if(lh){ curLineup = { code:lh.code, formation:lh.formation, type:lh.type, players:[] }; curBench=null; lineupsRaw.push(curLineup); sawMatchData=true; continue; }
      if(curLineup){
        // Entrenador del equipo en ese partido:  "DT, Javier Aguirre"  (va debajo de los titulares).
        const dt = ln.match(/^(?:dt|man)\s*[,:]\s*(.+?)\s*$/i);
        // "(Interino)" junto al nombre: dirigió sin ser el entrenador principal.
        if(dt){ const raw=dt[1]; curLineup.coachInterim = /\(\s*interin[oa]\s*\)/i.test(raw); curLineup.coach = raw.replace(/\(\s*interin[oa]\s*\)/ig,"").trim(); continue; }
        const row = parseLineupRow(ln); if(row){ curLineup.players.push(row); continue; } curLineup = null; /* fin del bloque: reprocesar esta línea */
      }
      // ---- Bloque de SUPLENTES QUE NO JUGARON (Sub CODE) y sus filas ----
      const bh = parseBenchHeader(ln);
      if(bh){ curBench = { code:bh.code, players:[] }; benchRaw.push(curBench); sawMatchData=true; continue; }
      if(curBench){ const brow = parseBenchRow(ln); if(brow){ curBench.players.push(brow); continue; } curBench = null; /* fin del bloque: reprocesar esta línea */ }
      // ---- Sección de ESTADÍSTICAS DE OPTA por jugador ("Opta", luego columnas opcionales y filas) ----
      if(/^opta\s*:?\s*$/i.test(ln)){ curOpta = optaRaw = { cols:null, rows:[], buf:[], ignorados:0 }; curLineup=null; curBench=null; sawMatchData=true; continue; }
      if(curOpta){
        // La sección termina SOLO en un renglón que sea del informe (FT, JDP, Ali…); así, si se pega el glosario
        // de la página de Opta, no se confunde con datos del partido.
        if(esLineaDelInforme(ln)){ curOpta = null; /* reprocesar esta línea */ }
        else {
          const hc = parseOptaHeader(ln);
          if(hc){ if(!curOpta.cols) curOpta.cols = hc; curOpta.buf = []; continue; }
          if(!curOpta.buf.length && RX_OPTA_ETIQUETA.test(ln)) continue;
          // Una fila puede venir en un renglón o repartida en varios (nombre / Pos / Rank / números).
          curOpta.buf.push(ln);
          const orow = parseOptaRow(curOpta.buf.join(" "));
          // Fila vacía (jugador sin estadísticas, "T. Zwane Sub"): solo en tablas de un renglón por fila; en las
          // de varios renglones, "Sup" va seguido de sus números en los renglones siguientes.
          const vacia = orow && !orow.vals.length && /^(sub|sup)$/i.test(orow.pos) && curOpta.buf.length===1 && !curOpta.multilinea;
          const minVals = Math.min(3, (curOpta.cols || OPTA_COLS).length);   // tabla de solo "PTS" (o "PTS MP")
          if(orow && (orow.vals.length >= minVals || vacia)){ if(curOpta.buf.length>1) curOpta.multilinea = true; curOpta.rows.push(orow); curOpta.buf = []; }
          else if(curOpta.buf.length > 4){ curOpta.ignorados += curOpta.buf.length; curOpta.buf = []; }
          continue;
        }
      }
      // ---- Rótulo opcional "Incidencias:" (solo separa visualmente el bloque; se ignora) ----
      if(/^incidencias\s*:?\s*$/i.test(ln)){ continue; }
      // ---- Jugador del partido:  "JDP MEX Luis Romo"  (solo cuenta en partidos NO amistosos) ----
      const jdp = ln.match(/^jdp\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+(.+?)\s*$/i);
      // "JDP MEX Julián Quiñones ALT" → versión ALTERNATIVA del press wall del premio (solo cambia el fondo).
      if(jdp){ const alt=/\s+alt$/i.test(jdp[2]); potmRaw = { code:jdp[1].toUpperCase(), name:jdp[2].replace(/\s+alt$/i,"").trim(), alt }; sawMatchData=true; continue; }
      // ---- Línea de ESTADÍSTICAS ----
      const st = parseStatsLine(ln); if(st){ statsRaw = st; sawMatchData=true; continue; }
      // ---- Línea de UNIFORMES elegidos ----
      const kl = parseKitLine(ln); if(kl){ kitSegs = kl; sawMatchData=true; continue; }
      // ---- Línea de FINAL (FT): marca el LARGO de la línea de tiempo. No es un evento. ----
      // Con tiempo extra trae DOS valores: "FT 90+5’, 120+2’" → el 1º es el final de los 90, el 2º el
      // final del partido (el que marca la duración). Con uno solo funciona como siempre.
      const ftm = ln.match(/^FT\s+(\d{1,3}(?:\+\d{1,2})?)\s*['’′´]?\s*(?:[,;y]\s*(\d{1,3}(?:\+\d{1,2})?)\s*['’′´]?\s*)?$/i);
      if(ftm){ if(ftm[2]){ ftReg = ftm[1]; ftMin = ftm[2]; } else { ftReg = null; ftMin = ftm[1]; } sawMatchData=true; continue; }
      // ---- Retraso / interrupción (alarga la DURACIÓN del partido en el reloj):  "Retraso: 30’" ----
      const rtm = ln.match(/^(retraso|demora|interrupci[oó]n|suspensi[oó]n)\s*:?\s*(\d{1,3})\s*['’′´]?\s*(?:min(?:utos)?)?\s*$/i);
      if(rtm){ delayMin = parseInt(rtm[2],10); sawMatchData=true; continue; }
      // ---- Tanda de penales:  "Penales: 4-3"  (local primero) ----
      const pnm = ln.match(/^pen(?:ales|altis|altys)?\s*:?\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*$/i);
      if(pnm){ pens = { a:parseInt(pnm[1],10), b:parseInt(pnm[2],10) }; sawMatchData=true; continue; }
      // ---- Detalle de la tanda (línea siguiente a "Penales: X-Y"), en el orden real de cobro:
      //      "COL Juan Fernando Quintero Gol, SUI Granit Xhaka Gol, COL Davinson Sánchez Falla, …" ----
      const pst = parsePenShotsLine(ln);
      if(pst){ penShotsRaw = pst; sawMatchData=true; continue; }
      const kind = classify(ln);
      switch(kind){
        case "att": { if(/puertas?\s+cerradas?/i.test(ln)){ closedDoors=true; } else { const m=ln.match(/([\d.,]+)/); if(m) att=parseInt(m[1].replace(/[.,]/g,""),10); } sawMatchData=true; break; }
        case "ref": { const m=ln.replace(/^[^:]*:\s*/,""); const mm=m.match(/^(.+?)\s*\(([^)]+)\)\s*$/); if(mm){ refName=mm[1].trim(); refCtry=mm[2].trim(); } else { refName=m.trim(); } sawMatchData=true; break; }
        case "crew": { crewRaw = parseCrewLine(ln); if(crewRaw && crewRaw.ref){ refName=crewRaw.ref.name; refCtry=crewRaw.ref.ctry; } sawMatchData=true; break; }
        case "event": { const e=parseEventLine(ln); if(e) events.push(e); sawMatchData=true; break; }
        case "date": dateInfo = parseDateLine(ln); sawMatchData=true; break;
        case "clima": clima = parseClimaLine(ln); sawMatchData=true; break;
        case "result": result = parseResultLine(ln); sawMatchData=true; break;
        case "venue": venue = parseVenueLine(ln); sawMatchData=true; break;
        default:
          // Primera línea suelta del bloque: si es el nombre de una selección, es un rótulo de
          // organización (se ignora); si no, es el tipo/torneo (p. ej. "Amistoso"). Sin encabezado
          // explícito, el partido se toma como amistoso.
          if(!headerTaken){ headerTaken = true; if(!isSeleccionLabel(ln)) type = ln; }
      }
    }
    if(!result){
      // Un bloque que solo trae un rótulo de sección (o texto suelto) se ignora en silencio; solo
      // se reporta como omitido si de verdad parecía un intento de partido.
      if(sawMatchData) report.skipped.push({block, why:"sin línea de resultado (Equipo A - Equipo B)"});
      return null;
    }

    const TA = resolveTeamByName(result.a), TB = resolveTeamByName(result.b);
    if(!TA || !TB){ report.skipped.push({block, why:`no se pudo resolver ${!TA?result.a:result.b} como selección`}); return null; }

    const isFriendly = nl(type)==="amistoso" || !type;
    // id estable → idempotencia (editar el .txt actualiza el mismo partido)
    const id = `txt_${dateInfo.date||"s-f"}_${TA.id}_${TB.id}`;

    // Estadio (crear si no existe) — usa el nombre oficial para amistosos (ya definido en estadios.js).
    let venueName = "", cityName = "";
    if(venue && venue.name && typeof ensureStadiumFromName==="function"){
      const st = ensureStadiumFromName(venue.name, null, venue.country||"", venue.city||"", false);
      venueName = st ? (typeof stadiumLinkName==="function"?stadiumLinkName(st):venue.name) : venue.name;
      cityName = (st && st.city) ? st.city : (venue.city||"");
      if(st && !report.stadiumsSeen.has(st.id)){ report.stadiumsSeen.add(st.id); if(st.__created) report.stadiums++; }
    } else if(venue){ venueName = venue.name||""; cityName = venue.city||""; }

    // Árbitro
    let refereeId = null;
    if(refName){ const r = ensureReferee(refName, refCtry, "Árbitro central"); if(r) refereeId = r.id; }
    // Cuerpo arbitral completo (línea ARB … - AA1 … - AA2 … - 4AR … [- VAR … - AVAR …]) → fx.officials.
    let officials = null;
    if(crewRaw){
      officials = {};
      Object.keys(crewRaw).forEach(k=>{
        const c = crewRaw[k];
        const r = (k==="ref" && refereeId) ? (DB.referees||[]).find(x=>x.id===refereeId) : ensureReferee(c.name, c.ctry, c.rol);
        if(r) officials[k] = r.id;
      });
    }

    // Incidencias → goles / tarjetas, con el equipo de cada código resuelto.
    // El CÓDIGO antes del jugador es SIEMPRE el equipo al que le SUBE el gol al marcador (igual que en un
    // gol normal). En un AUTOGOL (GEC) el gol le cuenta a ese equipo, pero el JUGADOR es del equipo
    // CONTRARIO y la incidencia se muestra de ese lado (el que metió el autogol); por eso el jugador se
    // liga/crea en el equipo contrario, no en el beneficiado.
    const codeMap = buildCodeMap(events.map(e=>e.teamCode), TA, TB);
    const cA = countryOfTeam(TA), cB = countryOfTeam(TB);
    // ---- Entrenadores de las alineaciones ("DT, Nombre"): se ligan si ya existen en la base (en
    // cualquier selección o entre los agentes libres); si no, se crean. Se resuelven ANTES de las
    // incidencias para que sus tarjetas queden como del entrenador (sin crear un jugador). ----
    const dtByTeam = {};   // teamId -> {coachId, name}
    lineupsRaw.forEach(lu=>{
      if(!lu.coach) return;
      const up=String(lu.code||"").toUpperCase();
      const sc=(c,team)=>{ let s=0; if(c){ if((c.fifaCode||"").toUpperCase()===up||(c.iocCode||"").toUpperCase()===up) s=3; } if(nl((team&&(team.name||team.commonName))||"").replace(/[^a-z]/g,"").startsWith(up.toLowerCase())) s=Math.max(s,2); return s; };
      const team = (sc(cA,TA)>=sc(cB,TB)) ? TA : TB;
      const ctryId = (team.id===TA.id)?(cA&&cA.id):(cB&&cB.id);
      const co = ensureCoach(team, lu.coach, ctryId, report, !!lu.coachInterim);
      dtByTeam[team.id] = { coachId: co?co.id:null, name: lu.coach, interim: !!lu.coachInterim };
    });
    const goals = [], cards = [], missedPens = [];
    const tally = { [TA.id]:0, [TB.id]:0 };   // goles al MARCADOR por equipo (para validar contra el resultado)
    events.forEach(e=>{
      const benefit = codeMap[e.teamCode] || TA.id;              // a quién le cuenta el gol (el código)
      const isGoal = (e.code!=="roj" && e.code!=="ama" && e.code!=="pfa");
      // Autogol: el JUGADOR es del equipo CONTRARIO al beneficiado (ahí se liga/crea), pero la incidencia
      // se MUESTRA del lado del equipo beneficiado (el que se lleva el gol). En lo demás, ambos coinciden.
      const playerTeamId = (isGoal && e.og) ? (benefit===TA.id ? TB.id : TA.id) : benefit;
      const sideTeamId   = benefit;   // lado en que se dibuja la incidencia
      const team = getTeam(playerTeamId);
      const ctryId = (playerTeamId===TA.id)?(cA&&cA.id):(cB&&cB.id);
      // Tarjeta a un ENTRENADOR del equipo: se registra como del entrenador y NO se crea un jugador.
      if(!isGoal && e.code!=="pfa"){
        let co = coachByName(team, e.player);
        const dtl = dtByTeam[playerTeamId];
        if(!co && dtl && dtl.coachId && nl(dtl.name)===nl(e.player)) co = { id: dtl.coachId };
        if(co){ const cc={ coachId:co.id, coach:true, playerId:null, player:e.player, teamId:sideTeamId, minute:String(e.minute), type:(e.code==="roj"?"red":"yellow") }; if(e.code==="roj" && e.doble!=null) cc.doble=e.doble; cards.push(cc); return; }
      }
      const pl = ensurePlayerOnTeam(team, e.player, ctryId);
      if(pl && pl.autoImported && !report.playersSeen.has(pl.id)){ report.playersSeen.add(pl.id); report.players++; }
      const base = { playerId: pl?pl.id:null, player: e.player, teamId: sideTeamId, minute: String(e.minute) };
      if(e.code==="pfa"){ missedPens.push(base); }   // penal fallado: solo en el minuto a minuto y en la calificación (no suma al marcador)
      else if(e.code==="roj"){ const c=Object.assign(base,{ type:"red" }); if(e.doble!=null) c.doble=e.doble; cards.push(c); }
      else if(e.code==="ama"){ cards.push(Object.assign(base,{ type:"yellow" })); }  // amarilla: solo línea de tiempo
      else {
        if(e.og) base.og = true;            // gol en contra: del lado del que lo marcó, cuenta para el rival
        if(e.penalty) base.penalty = true;  // gol de penal
        // Asistencia (opcional): el que asiste es del MISMO equipo que anotó (no aplica en autogol).
        if(!e.og && e.assistPlayer){
          const at = getTeam(benefit); const aCtry = (benefit===TA.id)?(cA&&cA.id):(cB&&cB.id);
          const ap = ensurePlayerOnTeam(at, e.assistPlayer, aCtry);
          if(ap){ base.assistPlayerId = ap.id; base.assistPlayer = e.assistPlayer;
            if(ap.autoImported && !report.playersSeen.has(ap.id)){ report.playersSeen.add(ap.id); report.players++; } }
        }
        goals.push(base);
        tally[benefit] = (tally[benefit]||0) + 1;   // al marcador SIEMPRE le suma al equipo del código
      }
    });

    // Validación: los goles cargados deben cuadrar con el marcador (goles normales + autogoles). Si no,
    // se avisa con un error claro (nombrando el partido y la diferencia) para corregir el archivo.
    if(result.played){
      const nameA=(TA.commonName||TA.name||result.a), nameB=(TB.commonName||TB.name||result.b);
      if(tally[TA.id]!==result.sa || tally[TB.id]!==result.sb){
        report.mismatches.push(`${nameA} ${result.sa}-${result.sb} ${nameB} (${dateInfo.date||"sin fecha"}): el marcador pide ${result.sa} de ${nameA} y ${result.sb} de ${nameB}, pero se cargaron ${tally[TA.id]} y ${tally[TB.id]}. Revisa los goles/autogoles de ese partido.`);
      }
    }

    // ---- Alineaciones (Ali): resolver el código de cada bloque a su equipo y ligar/crear jugadores ----
    // Se guarda como lineups.home (teamA) y lineups.away (teamB). Cada titular puede traer su sustituto y
    // el minuto del cambio (para la línea de tiempo).
    const lineups = { home:null, away:null };
    const teamForCode = (code)=>{
      const up=String(code||"").toUpperCase();
      const sc=(c,team)=>{ let s=0; if(c){ if((c.fifaCode||"").toUpperCase()===up||(c.iocCode||"").toUpperCase()===up) s=3; } if(nl((team&&(team.name||team.commonName))||"").replace(/[^a-z]/g,"").startsWith(up.toLowerCase())) s=Math.max(s,2); return s; };
      return (sc(cA,TA)>=sc(cB,TB)) ? TA : TB;
    };
    const linkOnTeam = (team, ctryId, nm)=>{ if(!nm) return null; const p=ensurePlayerOnTeam(team, nm, ctryId); if(p && p.autoImported && !report.playersSeen.has(p.id)){ report.playersSeen.add(p.id); report.players++; } return p?p.id:null; };
    if(lineupsRaw.length){
      lineupsRaw.forEach(lu=>{
        const team = teamForCode(lu.code);
        const ctryId = (team.id===TA.id)?(cA&&cA.id):(cB&&cB.id);
        const linkPlayer = (nm)=>linkOnTeam(team, ctryId, nm);
        const players = (lu.players||[]).map(row=>{
          const rec = { number:row.number, name:row.name, pos:row.pos, playerId:linkPlayer(row.name) };
          if(row.rating!==undefined) rec.rating = row.rating;   // calificación manual del informe
          if(row.captain) rec.captain = true;   // capitán en la cancha
          // Cambios (también en cadena: rec.sub.sub…). Un cambio de portero: el que ENTRA hereda la
          // etiqueta (GK) del titular al que sustituye.
          let src=row, dst=rec;
          while(src.sub){
            dst.sub = { number:src.sub.number, name:src.sub.name, minute:String(src.sub.minute), playerId:linkPlayer(src.sub.name) };
            if(src.sub.rating!==undefined) dst.sub.rating = src.sub.rating;
            if(row.pos==="GK") dst.sub.pos = "GK";
            src=src.sub; dst=dst.sub;
          }
          return rec;
        });
        const entry = { teamId:team.id, formation:lu.formation, formationType:lu.type||"", players };
        if(dtByTeam[team.id]){ entry.coachName = dtByTeam[team.id].name; if(dtByTeam[team.id].coachId) entry.coachId = dtByTeam[team.id].coachId; if(dtByTeam[team.id].interim) entry.coachInterim = true; }
        if(team.id===TA.id) lineups.home = entry; else lineups.away = entry;
      });
    }
    // ---- Goleadores y penales fallados que NO están en la alineación de su equipo (solo si vino la alineación) ----
    {
      const enAlineacion=(teamId, pid, nombre)=>{
        const lu = teamId===TA.id ? lineups.home : (teamId===TB.id ? lineups.away : null);
        if(!lu) return true;   // sin alineación no se puede revisar
        const n=nl(nombre||"");
        let ok=false;
        (lu.players||[]).forEach(r=>{ let x=r; while(x){ if((pid && x.playerId===pid) || (n && nl(x.name||"")===n)) ok=true; x=x.sub; } });
        return ok;
      };
      const tagA=`${TA.commonName||TA.name||result.a}-${TB.commonName||TB.name||result.b} (${dateInfo.date||"sin fecha"})`;
      goals.forEach(g=>{
        const tid = g.og ? (g.teamId===TA.id ? TB.id : TA.id) : g.teamId;   // autogol: el jugador es del rival
        if(!enAlineacion(tid, g.playerId, g.player)) report.mismatches.push(`${tagA}: ${g.player} (${g.og?"gol en contra":"gol"} ${g.minute}’) no está en la alineación de ${(getTeam(tid)||{}).commonName||(getTeam(tid)||{}).name||"su equipo"}.`);
      });
      missedPens.forEach(g=>{
        if(!enAlineacion(g.teamId, g.playerId, g.player)) report.mismatches.push(`${tagA}: ${g.player} (penal fallado ${g.minute}’) no está en la alineación de ${(getTeam(g.teamId)||{}).commonName||(getTeam(g.teamId)||{}).name||"su equipo"}.`);
      });
    }
    // ---- Tanda de penales tiro por tiro: liga cada cobrador a su selección y valida contra "Penales: X-Y" ----
    let penaltyShots = null;
    if(penShotsRaw && penShotsRaw.length){
      penaltyShots = penShotsRaw.map((t,i)=>{
        const team = teamForCode(t.code);
        const ctryId = (team.id===TA.id)?(cA&&cA.id):(cB&&cB.id);
        return { order:i+1, teamId:team.id, player:t.name, playerId:linkOnTeam(team, ctryId, t.name), scored:!!t.scored };
      });
      const gA = penaltyShots.filter(t=>t.teamId===TA.id && t.scored).length;
      const gB = penaltyShots.filter(t=>t.teamId===TB.id && t.scored).length;
      const tag = `${TA.commonName||TA.name||result.a}-${TB.commonName||TB.name||result.b} (${dateInfo.date||"sin fecha"})`;
      if(!pens) report.mismatches.push(`${tag}: viene el detalle de la tanda pero falta la línea "Penales: X-Y" (el detalle da ${gA}-${gB}).`);
      else if(pens.a!==gA || pens.b!==gB) report.mismatches.push(`${tag}: la tanda dice ${pens.a}-${pens.b}, pero el detalle tiro por tiro suma ${gA}-${gB}.`);
      // Orden alternado: no puede haber dos tiros seguidos del mismo equipo.
      for(let i=1;i<penaltyShots.length;i++){ if(penaltyShots[i].teamId===penaltyShots[i-1].teamId){ report.mismatches.push(`${tag}: en la tanda hay dos tiros seguidos del mismo equipo (tiros ${i} y ${i+1}: ${penaltyShots[i-1].player} y ${penaltyShots[i].player}).`); break; } }
    }
    // ---- Suplentes que NO jugaron (Sub CODE) → entry.bench de su equipo ----
    if(benchRaw.length && (lineups.home || lineups.away)){
      benchRaw.forEach(bl=>{
        const team = teamForCode(bl.code);
        const ctryId = (team.id===TA.id)?(cA&&cA.id):(cB&&cB.id);
        const bench = (bl.players||[]).map(row=>({ number:row.number, name:row.name, pos:row.pos||"", captain:!!row.captain, playerId:linkOnTeam(team, ctryId, row.name) }));
        const entry = (team.id===TA.id) ? lineups.home : lineups.away;
        if(entry) entry.bench = (entry.bench||[]).concat(bench);
      });
    }

    // ---- Jugador del partido (JDP): se busca primero en la alineación del equipo; si no está, se liga/crea
    // en la selección (igual que un goleador). ----
    let potm = null;
    if(potmRaw){
      const team = teamForCode(potmRaw.code);
      const ctryId = (team.id===TA.id)?(cA&&cA.id):(cB&&cB.id);
      const entry = (team.id===TA.id) ? lineups.home : lineups.away;
      const cands = [];
      if(entry){ (entry.players||[]).forEach(p=>{ let r=p; while(r){ cands.push(r); r=r.sub; } }); (entry.bench||[]).forEach(b=>cands.push(b)); }
      const want = nl(potmRaw.name), last = want.split(" ").pop();
      let hit = cands.find(c=>nl(c.name)===want);
      if(!hit){ const porAp = cands.filter(c=>nl(c.name).split(" ").pop()===last); if(porAp.length===1) hit = porAp[0]; }
      const pid = (hit && hit.playerId) || linkOnTeam(team, ctryId, potmRaw.name);
      potm = { playerId: pid||null, player: potmRaw.name, teamId: team.id };
      if(potmRaw.alt) potm.alt = true;   // usar el fondo alternativo del press wall
    }

    // ---- Estadísticas de Opta por jugador → rec.opta en la alineación + fx.optaBitacora ----
    const optaBitacora = optaRaw ? ligarOpta(optaRaw, lineups, goals, cards, ftMin) : null;
    if(optaBitacora){
      const nameA=(TA.commonName||TA.name||result.a), nameB=(TB.commonName||TB.name||result.b);
      optaBitacora.filter(b=>b.nivel==="error").forEach(b=>report.mismatches.push(`${nameA}-${nameB} (Opta): ${b.texto}`));
    }

    // ---- Uniformes elegidos por partido (opcional) → fx.kitSel {home, away, ref} ----
    let kitSel = null;
    if(kitSegs && kitSegs.length){
      const teamByCode = (code)=>{
        const up = String(code||"").toUpperCase();
        const codeHit = (t,c)=> t && ( (t.fifaCode||"").toUpperCase()===up || (t.iocCode||"").toUpperCase()===up || (c && ((c.fifaCode||"").toUpperCase()===up || (c.iocCode||"").toUpperCase()===up)) );
        if(codeHit(TA,cA)) return TA;
        if(codeHit(TB,cB)) return TB;
        const starts = (t)=> nl((t&&(t.commonName||t.name))||"").replace(/[^a-z]/g,"").startsWith(up.toLowerCase());
        if(starts(TA)) return TA; if(starts(TB)) return TB;
        return null;
      };
      kitSel = { home:null, away:null, ref:null };
      const pick = (seg)=>({ jugadorNum:seg.team.jugadorNum, jugadorCombo:seg.team.jugadorCombo, porteroNum:seg.team.porteroNum, porteroCombo:seg.team.porteroCombo });
      const teamSegs = kitSegs.filter(s=>s.team);
      const unresolved = [];
      // 1) Por código de equipo (FIFA/COI o inicio del nombre).
      teamSegs.forEach(seg=>{
        if(seg.ref) return;
        const t = teamByCode(seg.team.code);
        if(t){ kitSel[(t.id===TA.id)?"home":"away"] = pick(seg); }
        else unresolved.push(seg);
      });
      // 2) RESPALDO por posición: si un código no coincide con ningún equipo, se asigna por orden
      //    (primer bloque = local, segundo = visitante) a los huecos que queden libres.
      unresolved.forEach(seg=>{
        if(!kitSel.home){ kitSel.home = pick(seg); }
        else if(!kitSel.away){ kitSel.away = pick(seg); }
      });
      // Árbitro.
      kitSegs.forEach(seg=>{ if(seg.ref) kitSel.ref = seg.ref; });
    }

    const fx = {
      id,
      src:"txt",
      friendly: isFriendly,
      stage: isFriendly ? "amistoso" : "torneo",
      competition: isFriendly ? null : type,
      kitSel: kitSel,
      ftMin: ftMin,   // minuto de FINAL (largo de la línea de tiempo); null si no se indicó
      delayMin: delayMin,   // minutos de retraso/interrupción (alarga la duración); null si no se indicó
      penalties: pens,      // tanda de penales {a, b}; null si no hubo
      penaltyShots: penaltyShots,   // tanda tiro por tiro [{order, teamId, player, playerId, scored}]; null si no vino
      ftReg: ftReg,   // final de los 90' cuando hubo tiempo extra ("FT 90+5’, 120+2’"); null si no
      teamA: TA.id, teamB: TB.id,
      date: dateInfo.date || null,
      time: dateInfo.time || null,
      tzText: dateInfo.tz || null,
      contratiempo: dateInfo.contratiempo || null,   // {horaReal, tipo:"inicio"|"segundoTiempo", motivo} · dato interno, no se muestra
      clima: clima || null,                           // {temperatura (°C), condicion, techoCerrado}
      venue: venueName, city: cityName,
      refereeId,
      officials,   // cuerpo arbitral {ref, aa1, aa2, fourth, var, avar} (ids de DB.referees); null si no se indicó
      played: !!result.played,
      scoreA: result.played?result.sa:null,
      scoreB: result.played?result.sb:null,
      goals, cards, missedPens,
      potm,   // Jugador del partido {playerId, player, teamId} (línea JDP); null si no se indicó
      attendance: (att!=null?att:null),
      closedDoors: closedDoors,
      lineups: (lineups.home||lineups.away) ? lineups : null,
      stats: statsRaw || null,
      optaBitacora: optaBitacora   // validación de la sección Opta (null si el bloque no la trae)
    };
    report.matches++;
    return fx;
  }

  /* ---------- la tabla de Opta pegada con renglones en blanco ----------
     Copiada de la página de Opta, la tabla suele traer renglones en blanco (antes de las filas o antes del
     glosario). Un bloque que empieza con "Opta", o que sigue a una sección Opta y no trae resultado ni datos
     del informe, se une al bloque anterior en vez de tomarse como otro partido. */
  function unirOpta(blocks){
    const out = [];
    let enOpta = false;
    blocks.forEach(b=>{
      const ls = b.split(/\n/).map(x=>x.trim()).filter(Boolean);
      const empiezaOpta = ls.length && /^opta\s*:?\s*$/i.test(ls[0]);
      const pareceInforme = ls.some(x=> parseResultLine(x) || parseLineupHeader(x) || parseEventLine(x) || /^FT\s+\d/i.test(x) || /^jdp\s/i.test(x));
      if(out.length && (empiezaOpta || (enOpta && !pareceInforme))){ out[out.length-1] += "\n" + b; enOpta = true; return; }
      out.push(b);
      enOpta = ls.some(x=>/^opta\s*:?\s*$/i.test(x)) && !ls.slice(ls.findIndex(x=>/^opta\s*:?\s*$/i.test(x))+1).some(x=>esLineaDelInforme(x));
    });
    return out;
  }

  /* ---------- aplicar todo el archivo ---------- */
  function applyText(text){
    const report = { matches:0, players:0, referees:0, stadiums:0, duplicates:0, removedSeeded:0, skipped:[], mismatches:[], playersSeen:new Set(), stadiumsSeen:new Set() };
    if(!DB){ return report; }
    // Quitar comentarios (# … o // …) y separar en bloques por renglón en blanco.
    const clean = String(text||"").replace(/\r/g,"")
      .split("\n").filter(ln=> !/^\s*(#|\/\/)/.test(ln)).join("\n");
    const blocks = unirOpta(clean.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean));

    const refsBefore = (DB.referees||[]).length;
    const stadsBefore = (DB.stadiums||[]).length;

    // Construir y DEDUPLICAR: el mismo partido puede venir en la lista de las dos selecciones (una vez
    // por país, para organizar). Se consideran el mismo partido si coinciden la fecha y las dos
    // selecciones (en cualquier orden). Nos quedamos con el más completo (el que ya tiene resultado).
    const built = [], byKey = {};
    blocks.forEach(b=>{
      const fx = buildFixture(b, report);
      if(!fx) return;
      const key = (fx.date||"s-f") + "::" + [fx.teamA, fx.teamB].slice().sort().join("|");
      const prev = byKey[key];
      if(!prev){ byKey[key] = fx; built.push(fx); return; }
      report.duplicates++;
      if(fx.played && !prev.played){ const i = built.indexOf(prev); if(i>=0) built[i] = fx; byKey[key] = fx; }
    });

    // Reconciliar. El .txt es la ÚNICA fuente de verdad de los AMISTOSOS: se quitan tanto los partidos
    // importados de una carga anterior (src:"txt") como los amistosos que venían sembrados en la base,
    // y se vuelven a poblar desde el archivo. Los partidos del torneo (Mundial) NO se tocan.
    report.removedSeeded = (DB.fixtures||[]).filter(f=> f.src!=="txt" && (f.friendly||f.stage==="amistoso")).length;
    DB.fixtures = (DB.fixtures||[]).filter(f=>{
      if(f.src==="txt") return false;
      if(f.friendly || f.stage==="amistoso") return false;
      return true;
    });
    built.forEach(fx=> DB.fixtures.push(fx));

    report.referees = Math.max(0, (DB.referees||[]).length - refsBefore);
    report.stadiums = Math.max(0, (DB.stadiums||[]).length - stadsBefore);

    // Si algún partido tiene goles que NO cuadran con el marcador, avisa en pantalla (una sola tarjeta).
    if(report.mismatches.length){
      const items = report.mismatches.map(m=>`<li style="margin:3px 0;">${m}</li>`).join("");
      diagNote("Goles que no cuadran con el marcador.", `<ul style="margin:4px 0 0;padding-left:16px;">${items}</ul>`, "warn");
    }
    return report;
  }

  /* ---------- partidos-mundial.js: SOLO partidos de la Copa del Mundo ---------- */
  // Mismo formato que partidos.js, pero cada bloque NO crea un partido nuevo: se le pone el informe
  // (marcador, goles, tarjetas, alineaciones, estadísticas, árbitro, asistencia, FT, penales, uniformes)
  // al partido del calendario oficial del Mundial que ya existe. Se busca así:
  //   1) por número de partido, si el encabezado lo trae ("Partido 73", "M73", "#73");
  //   2) por las dos selecciones (en cualquier orden);
  //   3) eliminatoria aún sin rivales definidos: por fecha (y estadio, si se escribió).
  // Idempotente: antes de aplicar, cada partido que recibió un informe en una carga anterior vuelve a
  // su estado original (_wcOrig), así el archivo es la única fuente de verdad de esos informes.
  const WC_CAMPOS = ["played","scoreA","scoreB","goals","cards","missedPens","potm","lineups","stats","refereeId","attendance","closedDoors",
                     "ftMin","ftReg","delayMin","penalties","penaltyShots","kitSel","teamA","teamB","date","time","tzText","contratiempo","clima","optaBitacora","officials"];
  function esMundial(f){
    if(!f || f.src==="txt" || f.friendly || f.stage==="amistoso") return false;
    return (typeof matchIsWorldCup==="function") ? matchIsWorldCup(f) : true;
  }
  function restaurarMundial(){
    (DB.fixtures||[]).forEach(f=>{
      if(!f._wcOrig) return;
      WC_CAMPOS.forEach(k=>{ if(Object.prototype.hasOwnProperty.call(f._wcOrig,k)) f[k]=f._wcOrig[k]; else delete f[k]; });
      delete f._wcOrig; delete f.wcTxt;
    });
  }
  function buscarPartidoMundial(fx, header, venueName){
    const wc=(DB.fixtures||[]).filter(esMundial);
    const nm=String(header||"").match(/(?:^|\b)(?:partido|match|m|#)\s*#?\s*(\d{1,3})\b/i);
    if(nm){ const n=parseInt(nm[1],10); const f=wc.find(x=>x.matchNo===n); if(f) return {f, por:"número"}; }
    const mismos=wc.filter(x=> (x.teamA===fx.teamA && x.teamB===fx.teamB) || (x.teamA===fx.teamB && x.teamB===fx.teamA));
    if(mismos.length){
      // Si dos selecciones se cruzan dos veces (grupos y eliminatoria), el de la fecha más cercana.
      const dist=x=> (fx.date && x.date) ? Math.abs(new Date(x.date)-new Date(fx.date)) : 0;
      mismos.sort((a,b)=>dist(a)-dist(b));
      return {f:mismos[0], por:"selecciones"};
    }
    if(fx.date){
      const libres=wc.filter(x=> x.stage==="eliminatoria" && x.date===fx.date && (!x.teamA || !x.teamB));
      const v=nl(venueName||"");
      const conEst = v ? libres.filter(x=> nl(x.venue||"")===v || (typeof findStadiumForVenue==="function" && findStadiumForVenue(x.venue||"") && findStadiumForVenue(x.venue||"")===findStadiumForVenue(venueName))) : [];
      if(conEst.length===1) return {f:conEst[0], por:"fecha y estadio"};
      if(libres.length===1) return {f:libres[0], por:"fecha"};
    }
    return null;
  }
  function applyWorldCupText(text){
    const report = { matches:0, players:0, referees:0, stadiums:0, duplicates:0, removedSeeded:0, skipped:[], mismatches:[], notFound:[], playersSeen:new Set(), stadiumsSeen:new Set() };
    if(!DB) return report;
    restaurarMundial();
    const clean = String(text||"").replace(/\r/g,"").split("\n").filter(ln=> !/^\s*(#|\/\/)/.test(ln)).join("\n");
    const blocks = unirOpta(clean.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean));
    blocks.forEach(b=>{
      const fx = buildFixture(b, report);
      if(!fx) return;
      const header = (b.split(/\n/).map(x=>x.trim()).filter(Boolean)[0]) || "";
      const hit = buscarPartidoMundial(fx, header, fx.venue);
      if(!hit){ report.notFound.push(`${(getTeam(fx.teamA)||{}).commonName||"?"} - ${(getTeam(fx.teamB)||{}).commonName||"?"}${fx.date?" ("+fx.date+")":""}`); return; }
      const f = hit.f;
      // Guardar el estado original UNA vez (para poder deshacer en la siguiente carga).
      if(!f._wcOrig){ const o={}; WC_CAMPOS.forEach(k=>{ if(Object.prototype.hasOwnProperty.call(f,k)) o[k]=f[k]; }); f._wcOrig=JSON.parse(JSON.stringify(o)); }
      // Orientación: si el calendario tiene al local y visitante al revés, se voltea el informe.
      const alReves = f.teamA && f.teamB && f.teamA===fx.teamB && f.teamB===fx.teamA;
      if(alReves){
        [fx.scoreA, fx.scoreB] = [fx.scoreB, fx.scoreA];
        if(fx.lineups) fx.lineups = { home:fx.lineups.away||null, away:fx.lineups.home||null };
        if(fx.penalties) fx.penalties = { a:fx.penalties.b, b:fx.penalties.a };
        if(fx.kitSel) fx.kitSel = Object.assign({}, fx.kitSel, { home:fx.kitSel.away, away:fx.kitSel.home });
        if(fx.stats){ const st={}; Object.keys(fx.stats).forEach(k=>{ const v=fx.stats[k]; st[k]=Array.isArray(v)?[v[1],v[0]]:v; }); fx.stats=st; }
        [fx.teamA, fx.teamB] = [fx.teamB, fx.teamA];
      }
      // Eliminatoria sin rivales aún: el informe los define.
      if(!f.teamA) f.teamA = fx.teamA;
      if(!f.teamB) f.teamB = fx.teamB;
      ["played","scoreA","scoreB","goals","cards","missedPens","potm","lineups","stats","attendance","closedDoors","ftMin","ftReg","delayMin","penalties","penaltyShots","kitSel","optaBitacora"]
        .forEach(k=>{ if(fx[k]!==undefined) f[k]=fx[k]; });
      if(fx.officials) f.officials = fx.officials;
      if(fx.refereeId) f.refereeId = fx.refereeId;
      // Fecha y hora: solo si el bloque las trae (si no, se queda el calendario oficial).
      if(fx.date) f.date = fx.date;
      if(fx.time) f.time = fx.time;
      if(fx.tzText) f.tzText = fx.tzText;
      // Contratiempo y clima: los del bloque (sin línea → sin dato).
      f.contratiempo = fx.contratiempo || null;
      f.clima = fx.clima || null;
      // El estadio del Mundial se queda como está en el calendario (nombre de torneo FIFA).
      f.wcTxt = true;
      report.matches++;
    });
    if(report.mismatches.length){
      const items = report.mismatches.map(m=>`<li style="margin:3px 0;">${m}</li>`).join("");
      diagNote("Goles que no cuadran con el marcador (partidos-mundial.js).", `<ul style="margin:4px 0 0;padding-left:16px;">${items}</ul>`, "warn");
    }
    report.skipped.forEach(sk=> report.notFound.push(sk.why));
    if(report.notFound.length){
      const items = report.notFound.map(m=>`<li style="margin:3px 0;">${m}</li>`).join("");
      diagNote("No encontré estos partidos en el calendario del Mundial (partidos-mundial.js).", `<ul style="margin:4px 0 0;padding-left:16px;">${items}</ul>Revisa los nombres de las selecciones, o pon el número de partido en el encabezado (ej. <code>Partido 73</code>).`, "warn");
    }
    return report;
  }
  function loadWorldCup(){
    // Sin archivo: los partidos del Mundial vuelven a su estado original (sin informes importados).
    if(typeof window==="undefined" || typeof window.PARTIDOS_MUNDIAL_TXT!=="string"){ restaurarMundial(); return { ok:false, reason:"no-source" }; }
    return { ok:true, report: applyWorldCupText(window.PARTIDOS_MUNDIAL_TXT) };
  }

  /* ---------- carga automática de los partidos ---------- */
  // Fuente principal: partidos.js (define window.PARTIDOS_TXT). Se carga con un <script>, así que el
  // navegador lo lee SOLO aunque abras el juego con doble clic (a diferencia de un .txt vía fetch, que
  // el navegador bloquea en archivos locales). Respaldo: si alguien prefiere servir un partidos.txt
  // (por ejemplo publicado), también se intenta leerlo.
  async function load(){
    let text = null, via = "inline";
    if(typeof window!=="undefined" && typeof window.PARTIDOS_TXT==="string"){ text = window.PARTIDOS_TXT; via = "inline"; }
    if(text==null){
      try{ const res = await fetch("partidos.txt", { cache:"no-store" }); if(res && res.ok){ text = await res.text(); via = "fetch"; } }catch(e){ /* file:// bloquea fetch local; se ignora */ }
    }
    if(text==null){
      // Ni partidos.js (window.PARTIDOS_TXT) ni partidos.txt legibles.
      diagNote("No pude leer <b>partidos.js</b>.", "Revisa que <b>partidos.js</b> esté en la MISMA carpeta que el juego, y que esté completo (empieza con <code>window.PARTIDOS_TXT = `</code> y termina con <code>`;</code>). Edítalo con un editor de texto plano (no TextEdit en modo enriquecido).");
      return { ok:false, reason:"no-source" };
    }
    const report = applyText(text);
    // Después de los amistosos: los informes de la Copa del Mundo (partidos-mundial.js).
    try{ loadWorldCup(); }catch(e){ try{ console.warn("[partidos-mundial.js]", e); }catch(_){} }
    try{ if(typeof persist==="function") await persist(true); }catch(e){}
    if(report.matches===0){
      diagNote("Leí <b>partidos.js</b>, pero no hay partidos activos.", "Quita el <code>#</code> del inicio de las líneas de tus partidos (con <code>#</code> son comentarios y se ignoran).");
    }
    return { ok:true, via, report };
  }

  // Aviso en pantalla SOLO cuando algo falla (no es un botón para cargar nada; es un diagnóstico que se
  // cierra solo). Ayuda a ver por qué no aparecieron los partidos sin tener que abrir la consola.
  function diagNote(title, detail, kind){
    try{
      if(typeof document==="undefined" || !document.body) return;
      const old = document.getElementById("partidos-diag"); if(old) old.remove();
      const warn = (kind==="warn");
      const bg = warn ? "#2a2410" : "#2a1720", bd = warn ? "#7a6a2f" : "#7a2f3a", fg = warn ? "#ffedc2" : "#ffd9d0";
      const box = document.createElement("div");
      box.id = "partidos-diag";
      box.style.cssText = `position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:100000;max-width:min(600px,92vw);max-height:70vh;overflow:auto;background:${bg};color:${fg};border:1px solid ${bd};border-radius:12px;padding:12px 40px 12px 14px;font:400 12.5px/1.45 'Space Grotesk',sans-serif;box-shadow:0 14px 40px rgba(0,0,0,.45);`;
      box.innerHTML = `<div style="font-weight:700;margin-bottom:3px;">Partidos: ${title}</div><div style="opacity:.92;">${detail}</div>`;
      const x = document.createElement("button");
      x.textContent = "×";
      x.style.cssText = `position:absolute;top:8px;right:10px;background:none;border:none;color:${fg};font-size:18px;line-height:1;cursor:pointer;`;
      x.addEventListener("click", ()=> box.remove());
      box.appendChild(x);
      document.body.appendChild(box);
      setTimeout(()=>{ if(box && box.parentNode) box.remove(); }, 20000);
    }catch(e){}
  }

  window.PartidosTxt = { load, applyText, applyWorldCupText, loadWorldCup, resolveTeamByName, resolveCountry, parseResultLine, parseEventLine, buildCodeMap };
})();
