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
   Códigos de incidencia: Gol (gol), Pen/PEN (gol de penal), GEC (gol en contra: se pone del
   lado del equipo que lo marcó y cuenta para el rival), Roj (tarjeta roja).
   Horarios en hora LOCAL (no se muestra el uso horario por ahora).

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
  function ensureReferee(name, countryToken){
    const nm = (name||"").trim(); if(!nm) return null;
    const key = nl(nm);
    const kt = key.split(/\s+/).filter(Boolean);   // tokens del nombre del archivo
    DB.referees = DB.referees || [];
    // Compara contra TODAS las formas del nombre de cada árbitro (nombre completo, nombre+apellido y
    // nombre común), no solo el "fullName": los árbitros de la base traen el nombre completo con segundo
    // nombre/apellidos, pero en el archivo se escribe el nombre corto. Además, si los tokens de uno están
    // contenidos en el otro (nombre más/menos completo del MISMO árbitro), se considera el mismo.
    let r = DB.referees.find(x=>{
      const forms = [ x.fullName, ((x.firstName||"")+" "+(x.lastName||"")), x.commonName ]
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
      role:"Árbitro central", previousWorldCups:[], matches:[], photo:null,
      autoImported:true, importSource:"partidos.txt"
    };
    DB.referees.push(r);
    return r;
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
    return out;
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

  const EVENT_CODES = { gol:"gol", pen:"pen", gec:"gec", roj:"roj", ama:"ama" };
  // Encabezado de alineación:  "Ali MEX 4-3-3 (H)"  ->  {code, formation, type}
  function parseLineupHeader(line){
    const m = String(line||"").trim().match(/^ali\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+([\d]+(?:-[\d]+)+)\s*(?:\(([A-Za-z])\))?\s*$/i);
    if(!m) return null;
    return { code:m[1].toUpperCase(), formation:m[2], type:(m[3]||"").toUpperCase() };
  }
  // Fila de alineación:  "27, Richard Ledezma, RB - 16, Jesús Garza 66’"
  //   -> {number, name, pos, sub:{number,name,minute}}   (el sustituto y su minuto son opcionales)
  function parseLineupRow(line){
    // La (C) del capitán es opcional y va justo después de la posición: "23, Jesús Gallardo, LB (C)".
    const m = String(line||"").trim().match(/^(\d{1,3})\s*,\s*(.+?)\s*,\s*([A-Za-z]{1,3})\s*(\(\s*[Cc]\s*\))?\s*(?:[-–—]\s*(\d{1,3})\s*,\s*(.+?)\s+(\d{1,3}(?:\+\d{1,2})?)\s*['’′]?)?\s*$/);
    if(!m) return null;
    const row = { number:parseInt(m[1],10), name:m[2].trim(), pos:m[3].toUpperCase(), captain: !!m[4] };
    if(m[5]!=null){ row.sub = { number:parseInt(m[5],10), name:m[6].trim(), minute:m[7] }; }
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
  // Kit ARB <Fuente> R<n>            → árbitro: fuente Con<CONF> / Tor<TORNEO> y kit n.
  function parseKitSeg(seg){
    const s = String(seg||"").trim();
    const m = s.match(/^Kit\s+(\S+)\s+(.*)$/i);
    if(!m) return null;
    const code = m[1], rest = (m[2]||"").trim();
    if(/^ARB$/i.test(code)){
      const sm = rest.match(/^(\S+)/); const source = sm ? sm[1] : "";
      const rn = rest.match(/R\s*(\d+)/i);
      // Fuente del uniforme de árbitro: Con<CONF> (FIFA/CONCACAF/…), Tor<TORNEO> o Fed<PAÍS> (federación).
      let kind = "conf", scode = source;
      const cm = source.match(/^Con(.+)$/i), tm = source.match(/^Tor(.+)$/i), fm = source.match(/^Fed(.+)$/i);
      if(cm){ kind = "conf"; scode = cm[1]; }
      else if(tm){ kind = "tour"; scode = tm[1]; }
      else if(fm){ kind = "fed"; scode = fm[1]; }
      return { ref:{ kind, code:scode, num: rn?parseInt(rn[1],10):null } };
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
    const m = line.match(/^([A-Za-zÁÉÍÓÚáéíóú]{2,4})\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+(.+?)\s+(\d{1,3}(?:\+\d{1,2})?)\s*['’′]?\s*(?:\(([^)]*)\))?\s*(?:[-–—]\s*[Aa]si\s+([A-Za-zÁÉÍÓÚ]{2,4})\s+(.+?))?\s*$/);
    if(!m) return null;
    const code = nl(m[1]);
    if(!(code in EVENT_CODES)) return null;
    const mod = nl(m[5] || "");
    return {
      code, teamCode:m[2].toUpperCase(), player:m[3].trim(), minute:m[4],
      penalty: (code==="pen" || mod==="pen"),
      og:      (code==="gec" || mod==="gec"),
      assistCode:   m[6] ? m[6].toUpperCase() : null,
      assistPlayer: m[7] ? m[7].trim() : null
    };
  }

  function classify(line){
    const s = line.trim();
    if(/^asistencia\s*:/i.test(s)) return "att";
    if(/^(á|a)rbitros?\s*:/i.test(s)) return "ref";
    if(parseEventLine(s)) return "event";
    if(/\d{1,2}\s+[A-Za-zÁÉÍÓÚáéíóú]{3,}\.?\s+\d{4}/.test(s)) return "date";
    if(parseResultLine(s)) return "result";
    if(s.indexOf(",")>=0) return "venue";
    return "header";
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

  /* ---------- construir un fixture desde un bloque de texto ---------- */
  function buildFixture(block, report){
    const lines = block.split(/\n/).map(s=>s.trim()).filter(Boolean);
    if(!lines.length) return null;
    let type = "", dateInfo={date:null,time:null,tz:null}, venue=null, att=null, closedDoors=false, refName=null, refCtry=null, result=null;
    const events = [];
    const lineupsRaw = [];   // [{code, formation, type, players:[{number,name,pos,sub}]}]
    const benchRaw = [];     // [{code, players:[{number,name,pos}]}]  suplentes que NO jugaron
    let statsRaw = null, kitSegs = null, ftMin = null;
    let headerTaken = false, sawMatchData = false, curLineup = null, curBench = null;
    for(let li=0; li<lines.length; li++){
      const ln = lines[li];
      // ---- Bloque de ALINEACIÓN (Ali CODE Formación) y sus filas de jugadores ----
      const lh = parseLineupHeader(ln);
      if(lh){ curLineup = { code:lh.code, formation:lh.formation, type:lh.type, players:[] }; curBench=null; lineupsRaw.push(curLineup); sawMatchData=true; continue; }
      if(curLineup){ const row = parseLineupRow(ln); if(row){ curLineup.players.push(row); continue; } curLineup = null; /* fin del bloque: reprocesar esta línea */ }
      // ---- Bloque de SUPLENTES QUE NO JUGARON (Sub CODE) y sus filas ----
      const bh = parseBenchHeader(ln);
      if(bh){ curBench = { code:bh.code, players:[] }; benchRaw.push(curBench); sawMatchData=true; continue; }
      if(curBench){ const brow = parseBenchRow(ln); if(brow){ curBench.players.push(brow); continue; } curBench = null; /* fin del bloque: reprocesar esta línea */ }
      // ---- Rótulo opcional "Incidencias:" (solo separa visualmente el bloque; se ignora) ----
      if(/^incidencias\s*:?\s*$/i.test(ln)){ continue; }
      // ---- Línea de ESTADÍSTICAS ----
      const st = parseStatsLine(ln); if(st){ statsRaw = st; sawMatchData=true; continue; }
      // ---- Línea de UNIFORMES elegidos ----
      const kl = parseKitLine(ln); if(kl){ kitSegs = kl; sawMatchData=true; continue; }
      // ---- Línea de FINAL (FT): marca el LARGO de la línea de tiempo. No es un evento. ----
      const ftm = ln.match(/^FT\s+(\d{1,3}(?:\+\d{1,2})?)\s*['’′]?\s*$/i);
      if(ftm){ ftMin = ftm[1]; sawMatchData=true; continue; }
      const kind = classify(ln);
      switch(kind){
        case "att": { if(/puertas?\s+cerradas?/i.test(ln)){ closedDoors=true; } else { const m=ln.match(/([\d.,]+)/); if(m) att=parseInt(m[1].replace(/[.,]/g,""),10); } sawMatchData=true; break; }
        case "ref": { const m=ln.replace(/^[^:]*:\s*/,""); const mm=m.match(/^(.+?)\s*\(([^)]+)\)\s*$/); if(mm){ refName=mm[1].trim(); refCtry=mm[2].trim(); } else { refName=m.trim(); } sawMatchData=true; break; }
        case "event": { const e=parseEventLine(ln); if(e) events.push(e); sawMatchData=true; break; }
        case "date": dateInfo = parseDateLine(ln); sawMatchData=true; break;
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
    if(refName){ const r = ensureReferee(refName, refCtry); if(r) refereeId = r.id; }

    // Incidencias → goles / tarjetas, con el equipo de cada código resuelto.
    // El CÓDIGO antes del jugador es SIEMPRE el equipo al que le SUBE el gol al marcador (igual que en un
    // gol normal). En un AUTOGOL (GEC) el gol le cuenta a ese equipo, pero el JUGADOR es del equipo
    // CONTRARIO y la incidencia se muestra de ese lado (el que metió el autogol); por eso el jugador se
    // liga/crea en el equipo contrario, no en el beneficiado.
    const codeMap = buildCodeMap(events.map(e=>e.teamCode), TA, TB);
    const cA = countryOfTeam(TA), cB = countryOfTeam(TB);
    const goals = [], cards = [];
    const tally = { [TA.id]:0, [TB.id]:0 };   // goles al MARCADOR por equipo (para validar contra el resultado)
    events.forEach(e=>{
      const benefit = codeMap[e.teamCode] || TA.id;              // a quién le cuenta el gol (el código)
      const isGoal = (e.code!=="roj" && e.code!=="ama");
      // Autogol: el JUGADOR es del equipo CONTRARIO al beneficiado (ahí se liga/crea), pero la incidencia
      // se MUESTRA del lado del equipo beneficiado (el que se lleva el gol). En lo demás, ambos coinciden.
      const playerTeamId = (isGoal && e.og) ? (benefit===TA.id ? TB.id : TA.id) : benefit;
      const sideTeamId   = benefit;   // lado en que se dibuja la incidencia
      const team = getTeam(playerTeamId);
      const ctryId = (playerTeamId===TA.id)?(cA&&cA.id):(cB&&cB.id);
      const pl = ensurePlayerOnTeam(team, e.player, ctryId);
      if(pl && pl.autoImported && !report.playersSeen.has(pl.id)){ report.playersSeen.add(pl.id); report.players++; }
      const base = { playerId: pl?pl.id:null, player: e.player, teamId: sideTeamId, minute: String(e.minute) };
      if(e.code==="roj"){ cards.push(Object.assign(base,{ type:"red" })); }
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
          if(row.captain) rec.captain = true;   // capitán en la cancha
          if(row.sub){
            rec.sub = { number:row.sub.number, name:row.sub.name, minute:String(row.sub.minute), playerId:linkPlayer(row.sub.name) };
            // Un cambio de portero: el que ENTRA hereda la etiqueta (GK) del titular al que sustituye.
            if(row.pos==="GK") rec.sub.pos = "GK";
          }
          return rec;
        });
        const entry = { teamId:team.id, formation:lu.formation, formationType:lu.type||"", players };
        if(team.id===TA.id) lineups.home = entry; else lineups.away = entry;
      });
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
      teamA: TA.id, teamB: TB.id,
      date: dateInfo.date || null,
      time: dateInfo.time || null,
      tzText: dateInfo.tz || null,
      venue: venueName, city: cityName,
      refereeId,
      played: !!result.played,
      scoreA: result.played?result.sa:null,
      scoreB: result.played?result.sb:null,
      goals, cards,
      attendance: (att!=null?att:null),
      closedDoors: closedDoors,
      lineups: (lineups.home||lineups.away) ? lineups : null,
      stats: statsRaw || null
    };
    report.matches++;
    return fx;
  }

  /* ---------- aplicar todo el archivo ---------- */
  function applyText(text){
    const report = { matches:0, players:0, referees:0, stadiums:0, duplicates:0, removedSeeded:0, skipped:[], mismatches:[], playersSeen:new Set(), stadiumsSeen:new Set() };
    if(!DB){ return report; }
    // Quitar comentarios (# … o // …) y separar en bloques por renglón en blanco.
    const clean = String(text||"").replace(/\r/g,"")
      .split("\n").filter(ln=> !/^\s*(#|\/\/)/.test(ln)).join("\n");
    const blocks = clean.split(/\n\s*\n/).map(b=>b.trim()).filter(Boolean);

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

  window.PartidosTxt = { load, applyText, resolveTeamByName, resolveCountry, parseResultLine, parseEventLine, buildCodeMap };
})();
