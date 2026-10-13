/* =========================================================
   COPA MANAGER 2026 — app/tiempo.js
   SISTEMA DE AVANCE TEMPORAL (estilo Football Manager).

   CONTINUAR (o la barra ESPACIO) no suma tiempo fijo: avanza el reloj hasta el
   PRÓXIMO evento que requiere al usuario, procesando en el camino (en memoria)
   los eventos automáticos, con una animación de "el tiempo avanzando".

   Capas separadas (para crecer sin tocar el núcleo):
     GameClock          — fecha/hora del simulador (ÚNICA fuente de verdad, en memoria)
     EventManager       — eventos futuros + proveedores pluggables (generados bajo demanda)
     SimulationEngine   — plan()/commit(): procesa lo automático y avanza al punto de interrupción
     Interruptions      — cola de eventos que requieren al usuario (ordenada por prioridad)
     UI                 — píldora de fecha/hora, botón/ESPACIO Continuar, animación y panel

   RESTRICCIÓN DE ESTA ETAPA (estricta): la base de datos es SOLO LECTURA.
     - Nada del flujo de CONTINUAR escribe en DB (sin persist, sin mutar datos).
     - El reloj y los eventos viven ÚNICAMENTE en memoria durante la sesión.
     - Navegar a una pantalla al "resolver" es uso normal (equivale a un clic del
       usuario en el menú), no es el avance automático.

   Script CLÁSICO. Cargar DESPUÉS de app/juego.js (usa window.Juego en runtime).
   ========================================================= */
(function(){
  "use strict";

  /* ---------- utilidades de fecha ---------- */
  const DOW = ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"];
  const MON = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const pad2 = n => (n<10?"0":"")+n;
  const clone = d => new Date(d.getTime());
  const startOfDay = d => { const x=clone(d); x.setHours(0,0,0,0); return x; };
  const addDays = (d,n) => { const x=clone(d); x.setDate(x.getDate()+n); return x; };
  const atTime = (day,h,m) => { const x=startOfDay(day); x.setHours(h,m||0,0,0); return x; };
  const dayKey = d => d.getFullYear()+"-"+pad2(d.getMonth()+1)+"-"+pad2(d.getDate());
  const sameMinute = (a,b) => Math.floor(a.getTime()/60000)===Math.floor(b.getTime()/60000);
  const hhmm = d => pad2(d.getHours())+":"+pad2(d.getMinutes());

  /* ---------- iconos de línea (sin emojis; mismo estilo que el resto del juego) ---------- */
  const ICON_PATHS = {
    training:  '<path d="M10.6 5.5h2.8L17 19H7z"/><path d="M6 19h12"/><path d="M9.3 12h5.4M8.4 15.4h7.2"/>',
    condition: '<path d="M12 20s-6.8-4.4-6.8-9.2A3.4 3.4 0 0 1 12 7.2a3.4 3.4 0 0 1 6.8 3.6C18.8 15.6 12 20 12 20z"/>',
    news:      '<path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h9A1.5 1.5 0 0 1 16 6.5V18a1.5 1.5 0 0 0 1.5 1.5H6.4A2.4 2.4 0 0 1 4 17z"/><path d="M16 8.5h2.5A1.5 1.5 0 0 1 20 10v7.4a1.5 1.5 0 0 1-3 0"/><path d="M7 8.5h6M7 11h6M7 13.5h4"/>',
    email:     '<rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="m3.6 7 8.4 6 8.4-6"/>',
    decision:  '<rect x="6" y="4.5" width="12" height="16" rx="2"/><path d="M9 3.6h6v3H9z"/><path d="M8.8 11h6.4M8.8 14.5h4.4"/>',
    match:     '<circle cx="12" cy="12" r="8"/><path d="M12 7.6l3 2.2-1.15 3.6h-3.7L9 9.8z"/>',
    injury:    '<rect x="3" y="4.5" width="18" height="15" rx="3"/><path d="M12 9v6M9 12h6"/>',
    stats:     '<path d="M5 20V11M12 20V4.5M19 20v-6.5"/>',
    sim:       '<circle cx="12" cy="12" r="7.5"/><path d="M8 12h8M12 8v8"/>',
    day:       '<circle cx="12" cy="12" r="3.6"/><path d="M12 3.4v2.2M12 18.4v2.2M3.4 12h2.2M18.4 12h2.2M6 6l1.5 1.5M16.5 16.5 18 18M18 6l-1.5 1.5M7.5 16.5 6 18"/>',
    moon:      '<path d="M20 14.4A8 8 0 0 1 9.6 4 7 7 0 1 0 20 14.4z"/>'
  };
  function icon(kind, size){
    const s = size||18;
    const p = ICON_PATHS[kind] || ICON_PATHS.day;
    return `<svg class="gt-svg" viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  }

  /* =========================================================
     1) GAME CLOCK — única fuente de verdad de la fecha/hora
     ========================================================= */
  const GameClock = {
    _now: new Date(2026,5,1,9,0,0),   // 1 jun 2026, 09:00 (lunes) — solo en memoria
    _subs: [],
    now(){ return clone(this._now); },
    set(d){ this._now = clone(d); this._emit(); },
    advanceTo(d){ if(d.getTime() > this._now.getTime()){ this._now = clone(d); this._emit(); } },
    onChange(fn){ if(typeof fn==="function") this._subs.push(fn); },
    _emit(){ const n=this.now(); this._subs.forEach(f=>{ try{ f(n); }catch(e){} }); },
    fmt(d){
      d = d || this._now;
      return {
        dow: DOW[d.getDay()], day: d.getDate(), mon: MON[d.getMonth()], year: d.getFullYear(),
        hour: hhmm(d), dateShort: d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear(),
        full: DOW[d.getDay()]+" "+d.getDate()+" "+MON[d.getMonth()]+" "+d.getFullYear()+" "+hhmm(d)
      };
    }
  };

  /* =========================================================
     2) EVENT MANAGER — eventos futuros + proveedores pluggables
     Evento: { id, time:Date, kind, title, detail, body, screen, requiresUser, priority, processed }
     ========================================================= */
  const PRIORITY = { decision:1, match:2, injury:3, email:4, news:5, auto:6 };
  const REQUIRES_USER = new Set(["decision","match","injury","email"]);
  function kindPriority(kind){ return PRIORITY[kind]!=null ? PRIORITY[kind] : (REQUIRES_USER.has(kind)?PRIORITY.decision:PRIORITY.auto); }

  const EventManager = {
    _events: [], _providers: [], _daysGenerated: new Set(), _CAP_DAYS: 45,
    registerProvider(fn){ if(typeof fn==="function") this._providers.push(fn); },
    reset(){ this._events=[]; this._daysGenerated=new Set(); },
    add(ev){
      if(!ev || !ev.time) return;
      ev.id = ev.id || ("ev_"+ev.time.getTime()+"_"+(ev.kind||"x")+"_"+Math.random().toString(36).slice(2,7));
      if(this._events.some(e=>e.id===ev.id)) return;
      if(ev.requiresUser==null) ev.requiresUser = REQUIRES_USER.has(ev.kind);
      if(ev.priority==null) ev.priority = kindPriority(ev.kind);
      if(ev.processed==null) ev.processed = false;
      this._events.push(ev);
    },
    ensureDay(day){
      const k = dayKey(day);
      if(this._daysGenerated.has(k)) return;
      this._daysGenerated.add(k);
      const from = startOfDay(day), until = addDays(from,1);
      this._providers.forEach(p=>{ let evs=[]; try{ evs=p(from,until)||[]; }catch(e){ evs=[]; } evs.forEach(e=>this.add(e)); });
    },
    nextInterruption(after){
      const t0 = after.getTime();
      const cursor = startOfDay(after);
      for(let i=0;i<this._CAP_DAYS;i++){
        this.ensureDay(addDays(cursor,i));
        const cand = this._events.filter(e=>e.requiresUser && !e.processed && e.time.getTime()>t0)
          .sort((a,b)=> a.time-b.time || a.priority-b.priority)[0];
        if(cand) return cand;
      }
      return null;
    },
    autoEventsBetween(after, upto){
      const a=after.getTime(), b=upto.getTime();
      return this._events.filter(e=>!e.requiresUser && !e.processed && e.time.getTime()>a && e.time.getTime()<=b)
        .sort((x,y)=> x.time-y.time || x.priority-y.priority);
    },
    interruptionsAt(t){
      return this._events.filter(e=>e.requiresUser && !e.processed && sameMinute(e.time,t))
        .sort((a,b)=> a.priority-b.priority || a.time-b.time);
    }
  };

  /* =========================================================
     3) INTERRUPTIONS — cola de eventos pendientes de resolver
     ========================================================= */
  const Interruptions = {
    _queue: [],
    enqueue(list){ (list||[]).forEach(e=>{ if(!this._queue.some(q=>q.id===e.id)) this._queue.push(e); }); },
    hasPending(){ return this._queue.length>0; },
    current(){ return this._queue[0]||null; },
    count(){ return this._queue.length; },
    resolveCurrent(){ const e=this._queue.shift(); if(e) e.processed=true; return e; },
    clear(){ this._queue=[]; }
  };

  /* =========================================================
     4) SIMULATION ENGINE — plan()/commit(). TODO en memoria (no escribe en DB).
     ========================================================= */
  const SimulationEngine = {
    // Calcula el próximo salto SIN mover el reloj (para poder animarlo).
    plan(){
      if(Interruptions.hasPending()) return { type:"pending", event:Interruptions.current() };
      const from = GameClock.now();
      const target = EventManager.nextInterruption(from);
      if(!target) return { type:"idle", from };
      const autos = EventManager.autoEventsBetween(from, target.time);
      return { type:"advance", from, to:clone(target.time), autos, target };
    },
    // Aplica el plan (marca automáticos, mueve el reloj, encola interrupciones). Solo memoria.
    commit(plan){
      if(!plan || plan.type!=="advance") return;
      plan.autos.forEach(e=>{ e.processed = true; });
      GameClock.advanceTo(plan.to);
      Interruptions.enqueue(EventManager.interruptionsAt(plan.to));
    }
  };

  /* =========================================================
     5) PERSISTENCE LAYER — DESACTIVADA (DB READ-ONLY). Punto único a futuro.
     ========================================================= */
  const PersistenceLayer = { enabled:false, flush(){ /* vacío a propósito */ } };

  /* =========================================================
     PROVEEDOR DEMO (semilla) — agenda diaria en memoria, con CONTENIDO real-ish:
     noticias con titular, correos con remitente/asunto, parte de entrenamiento.
     Es solo un proveedor: se reemplaza por eventos reales registrando otros
     proveedores, sin tocar el núcleo.
     ========================================================= */
  const NEWS = [
    ["La FIFA confirma el calendario de la fase de grupos","El organismo publicó horarios y sedes definitivos."],
    ["Un histórico anuncia su retiro tras el Mundial","La estrella disputará su última cita mundialista."],
    ["Reacciones al sorteo de grupos","Las selecciones opinan sobre sus rivales."],
    ["El anfitrión presenta su nuevo uniforme","Diseño inspirado en la afición local."],
    ["Polémica arbitral en un amistoso de preparación","El VAR vuelve a estar en el centro del debate."],
    ["Se agotan las entradas para la inauguración","Lleno total asegurado en el estadio principal."]
  ];
  const MAILS = [
    ["Presidente","Objetivos de la temporada","Quiero repasar contigo las metas de cara al torneo."],
    ["Director deportivo","Refuerzos para la convocatoria","Tengo tres nombres para la lista preliminar."],
    ["Prensa","Solicitud de entrevista","Un medio pide unas palabras tuyas para mañana."],
    ["Patrocinador","Evento promocional","Necesitamos a dos jugadores para una activación."]
  ];
  const TRAIN = [
    "Enfoque: presión alta. 2 jugadores destacaron.",
    "Trabajo físico. Condición general +2%.",
    "Balón parado. Buen nivel en tiros libres.",
    "Sesión de recuperación tras el viaje."
  ];
  const pick = (arr, seed) => arr[((seed%arr.length)+arr.length)%arr.length];

  function demoDayProvider(from, until){
    const day = startOfDay(from);
    const seed = day.getDate() + day.getMonth()*31;
    const profile = day.getDate() % 3;
    const ev = [];
    const push = (h,m,kind,title,opts)=>{ opts=opts||{}; ev.push({ time:atTime(day,h,m), kind, title, detail:opts.detail||"", body:opts.body||"", screen:opts.screen||null }); };
    const news = pick(NEWS, seed), mail = pick(MAILS, seed+profile), train = pick(TRAIN, seed);

    // Automáticos (no detienen el juego) — con contenido para "ver qué pasó".
    push(10,0, "training",  "Entrenamiento",  {detail:train});
    push(11,0, "condition", "Condición actualizada", {detail:"Se recalculó la condición del plantel."});
    push(11,30,"news",      news[0], {detail:news[1]});
    push(13,0, "training",  "Entrenamiento (tarde)", {detail:pick(TRAIN, seed+2)});
    push(18,0, "stats",     "Estadísticas actualizadas", {detail:"Se recalcularon métricas y clasificaciones."});
    push(21,0, "sim",       "Otros partidos simulados", {detail:"Se resolvieron encuentros de la jornada."});

    // De usuario (detienen el juego) — te llevan a la pantalla a resolver.
    if(profile===0){
      push(12,15,"email",    mail[1], {detail:"De: "+mail[0], body:mail[2], screen:"buzon"});
      push(17,0, "decision", "Decisión de convocatoria", {detail:"Define la lista para el próximo compromiso.", body:"Debes elegir a los convocados.", screen:"plantilla"});
    } else if(profile===1){
      push(9,45, "email",    "Solicitud de prensa", {detail:"De: Prensa", body:"Un medio pide una declaración tuya.", screen:"buzon"});
      push(15,30,"decision", "Conferencia de prensa", {detail:"Preséntate ante los medios.", body:"Responde a la prensa antes del partido.", screen:"noticias"});
    } else {
      // Varias interrupciones a la MISMA hora (demuestra la cola por prioridad).
      push(14,0, "email",    mail[1], {detail:"De: "+mail[0], body:mail[2], screen:"buzon"});
      push(14,0, "injury",   "Lesión de un jugador", {detail:"Parte médico disponible.", body:"Un jugador cayó lesionado; revisa el centro médico.", screen:"medico"});
      push(14,0, "decision", "Solicitud de prensa urgente", {detail:"La prensa exige una postura.", body:"Responde de inmediato.", screen:"noticias"});
      push(16,0, "decision", "Confirmar alineación", {detail:"Define el once para el amistoso.", body:"Confirma tu alineación titular.", screen:"tacticas"});
    }
    return ev.filter(e=> e.time>=from && e.time<until);
  }
  EventManager.registerProvider(demoDayProvider);

  // REGLA DEL RELOJ (central, no demo): cada día SIEMPRE empieza a las 08:00. Es una parada de
  // "nuevo día" para que el paso de un día a otro sea claro y el usuario nunca deba avanzar de más
  // durante la madrugada — el reloj salta directo a las 08:00 del día siguiente.
  function dayStartProvider(from){
    const day = startOfDay(from);
    return [{ time: atTime(day,8,0), kind:"day", title:"Nuevo día", detail:"Empieza la jornada, 08:00.", requiresUser:true, priority:PRIORITY.auto }];
  }
  EventManager.registerProvider(dayStartProvider);

  // PARTIDOS REALES: los encuentros de DB.fixtures que ya traen resultado (p. ej. de partidos.js) van
  // APARECIENDO en el menú de avance conforme el reloj llega a su fecha y hora, mostrando el torneo y el
  // marcador ("Amistoso" / "México 5 - 0 Serbia"). Si el equipo del usuario está involucrado, es una
  // parada (para verlo/“simularlo”); los demás aparecen solos. Los partidos sin resultado no se anuncian.
  function fixturesProvider(from, until){
    const out=[];
    let fxs=[]; try{ fxs=(typeof DB!=="undefined" && DB && DB.fixtures) ? DB.fixtures : []; }catch(e){}
    let userTeam=null; try{ if(window.Juego && Juego._state) userTeam=Juego._state.teamId; }catch(e){}
    fxs.forEach(f=>{
      let ms=null; try{ if(typeof matchDateTimeMs==="function") ms=matchDateTimeMs(f); }catch(e){}
      if(ms==null) return;
      if(ms < from.getTime() || ms >= until.getTime()) return;
      const hasResult = !!(f.played && f.scoreA!=null && f.scoreB!=null);
      if(!hasResult) return;   // sin resultado cargado no se anuncia (se jugará/simulará más adelante)
      let A=null,B=null; try{ A=getTeam(f.teamA); B=getTeam(f.teamB); }catch(e){}
      if(!A||!B) return;
      const an=(A.commonName||A.name||"?"), bn=(B.commonName||B.name||"?");
      let tour="Copa Mundial";
      if(f.friendly||f.stage==="amistoso") tour="Amistoso";
      else if(f.competition && typeof matchIsWorldCup==="function" && !matchIsWorldCup(f)) tour=(typeof competitionDisplayName==="function")?competitionDisplayName(f.competition):f.competition;
      else { try{ if(typeof eventFieldText==="function") tour=eventFieldText(DB.event,'shortName')||eventFieldText(DB.event,'name')||tour; }catch(e){} }
      const line = `${an} ${f.scoreA} - ${f.scoreB} ${bn}`;
      const involvesUser = userTeam && (f.teamA===userTeam || f.teamB===userTeam);
      out.push(involvesUser
        ? { time:new Date(ms), kind:"match", title:tour, detail:line, body:"Tu selección jugó. Puedes ver el partido en el calendario.", screen:"calendario", requiresUser:true }
        : { time:new Date(ms), kind:"match", title:tour, detail:line, requiresUser:false });
    });
    return out;
  }
  EventManager.registerProvider(fixturesProvider);

  /* =========================================================
     UI — píldora, botón/ESPACIO, animación de avance y panel de interrupción
     ========================================================= */
  let _dateEl=null, _btnEl=null, _mounted=false, _animating=false;

  function renderPillAt(d){
    if(!_dateEl) return;
    const f = GameClock.fmt(d);
    _dateEl.innerHTML =
      `<div class="jg-date-row"><span class="dow">${f.dow}</span><span class="hora">${f.hour}</span></div>` +
      `<div class="d">${f.day} ${f.mon.toUpperCase()} <span class="yr">${f.year}</span></div>`;
  }
  function renderPill(){ renderPillAt(GameClock.now()); }

  function mountUI(dateEl, btn){
    _dateEl=dateEl; _btnEl=btn; _mounted=true;
    injectCSS();
    renderPill();
    GameClock.onChange(renderPill);
    if(_btnEl && !_btnEl.__gtBound){
      _btnEl.__gtBound=true;
      _btnEl.title="Avanzar hasta el próximo evento relevante (barra espaciadora)";
      _btnEl.addEventListener("click", onContinue);
    }
    bindSpace();
  }

  // Barra ESPACIO = Continuar. Si hay un panel abierto, la barra dispara su acción
  // (resolver / ir a la pantalla). Se ignora mientras escribes en un campo o durante la animación.
  function bindSpace(){
    if(window.__gtSpaceBound) return; window.__gtSpaceBound=true;
    document.addEventListener("keydown", (e)=>{
      if(e.code!=="Space" && e.key!==" ") return;
      if(isTyping(e.target)) return;
      if(!(window.Juego && Juego.isActive && Juego.isActive())) return;
      if(_animating){ e.preventDefault(); return; }
      e.preventDefault();
      const ov=document.getElementById("gt-overlay");
      if(ov && !ov.hidden){ const rb=ov.querySelector(".gt-resolve"); if(rb) rb.click(); }
      else { const c=document.getElementById("jg-continue"); if(c) c.click(); }
    }, true);
  }
  function isTyping(el){
    if(!el) return false;
    const t=(el.tagName||"").toUpperCase();
    return t==="INPUT" || t==="TEXTAREA" || t==="SELECT" || el.isContentEditable;
  }

  function onContinue(){
    if(_animating) return;
    const plan = SimulationEngine.plan();
    if(plan.type==="pending"){ showInterruption(Interruptions.current(), null); return; }
    if(plan.type==="idle"){ showIdle(); return; }
    playAdvance(plan);   // anima el paso del tiempo y, al terminar, muestra la interrupción
  }

  /* ---------- overlay ---------- */
  function ensureOverlay(){
    let ov=document.getElementById("gt-overlay");
    if(!ov){
      ov=document.createElement("div"); ov.id="gt-overlay"; ov.className="gt-overlay"; ov.hidden=true;
      ov.addEventListener("click", e=>{ if(e.target===ov && !_animating) closeOverlay(); });
      document.body.appendChild(ov);
    }
    return ov;
  }
  function closeOverlay(){ const ov=document.getElementById("gt-overlay"); if(ov){ ov.hidden=true; ov.innerHTML=""; } }

  // Tira de calendario: 3 rectángulos horizontales — día anterior | día actual (centro, con la hora) |
  // día siguiente. Hace visible el paso de un día a otro.
  function calCellHTML(d, cls, withTime){
    const f = GameClock.fmt(d);
    const time = withTime ? `<span class="gt-cd-time" id="gt-ch">${f.hour}</span>` : "";
    return `<div class="gt-cday ${cls}"><span class="gt-cd-dow">${f.dow}</span><span class="gt-cd-n">${f.day} ${f.mon}</span>${time}</div>`;
  }
  function calStripHTML(date){
    return `<div class="gt-caldays">${calCellHTML(addDays(date,-1),"side prev")}${calCellHTML(date,"cur",true)}${calCellHTML(addDays(date,1),"side next")}</div>`;
  }
  function gtTopHTML(date){
    return `<div class="gt-strip" id="gt-strip">${calStripHTML(date)}</div><span class="gt-memtag" title="Simulación en memoria: no se guarda en la base de datos">en memoria</span>`;
  }
  function feedRowHTML(e){
    // En un PARTIDO destaca el marcador (grande) y el torneo va como etiqueta pequeña arriba.
    if(e.kind==="match"){
      const tour = escapeH(e.title||"");
      const match = escapeH(e.detail||e.title||"");
      return `<div class="gt-feed-row gt-kc-${e.kind}"><span class="gt-feed-t">${hhmm(e.time)}</span><span class="gt-feed-ic">${icon(e.kind,15)}</span><span class="gt-feed-x"><span class="gt-feed-tour">${tour}</span><b class="gt-feed-match">${match}</b></span></div>`;
    }
    return `<div class="gt-feed-row gt-kc-${e.kind}"><span class="gt-feed-t">${hhmm(e.time)}</span><span class="gt-feed-ic">${icon(e.kind,15)}</span><span class="gt-feed-x"><b>${escapeH(e.title)}</b>${e.detail?`<span class="gt-feed-d">${escapeH(e.detail)}</span>`:""}</span></div>`;
  }

  /* ---------- animación "el tiempo avanza" ---------- */
  function playAdvance(plan){
    _animating=true;
    const ov=ensureOverlay(); ov.hidden=false;
    const from=plan.from, to=plan.to, autos=(plan.autos||[]).slice();
    ov.innerHTML = `
      <div class="gt-modal" role="dialog" aria-modal="true">
        <div class="gt-top">${gtTopHTML(from)}</div>
        <div class="gt-progress"><div class="gt-progress-bar" id="gt-bar"></div></div>
        <div class="gt-feed" id="gt-feed"><div class="gt-feed-h">Avanzando…</div></div>
        <div id="gt-card-slot"></div>
      </div>`;
    const bar=ov.querySelector("#gt-bar"), feed=ov.querySelector("#gt-feed");
    const strip=ov.querySelector("#gt-strip");
    let ch=ov.querySelector("#gt-ch");
    const span=Math.max(1, to.getTime()-from.getTime());
    const DUR=Math.min(1600, Math.max(800, 650 + Math.log2(span/60000+1)*90));
    let shown=0, feedStarted=false, lastDayKey=dayKey(from);
    const startFeed=()=>{ if(!feedStarted){ feed.innerHTML=""; feedStarted=true; } };
    const t0=performance.now();
    const ease=t=> 1-Math.pow(1-t,3);
    function frame(now){
      let p=(now-t0)/DUR; if(p>1)p=1;
      const e=ease(p);
      const cur=new Date(from.getTime()+span*e);
      const f=GameClock.fmt(cur);
      if(ch) ch.textContent=f.hour;
      if(bar) bar.style.width=(p*100).toFixed(1)+"%";
      renderPillAt(cur);
      // Cambio de día: la TIRA DE CALENDARIO avanza (el día siguiente entra deslizándose al centro)
      // y se marca el corte en el feed. Así el paso de un día a otro es gráficamente visible.
      const curKey=dayKey(cur);
      if(curKey!==lastDayKey){
        lastDayKey=curKey;
        if(strip){
          strip.innerHTML=calStripHTML(cur);
          const cal=strip.querySelector(".gt-caldays"); if(cal){ cal.classList.remove("gt-slide"); void cal.offsetWidth; cal.classList.add("gt-slide"); }
          ch=strip.querySelector("#gt-ch");   // el reloj vive en la celda del día actual
        }
        startFeed();
        feed.insertAdjacentHTML("beforeend", `<div class="gt-daybreak"><span>${f.dow} ${f.day} ${f.mon}</span></div>`);
        feed.scrollTop=feed.scrollHeight;
      }
      // Revela los eventos automáticos conforme el reloj los alcanza.
      while(shown<autos.length && autos[shown].time.getTime()<=cur.getTime()){
        startFeed();
        feed.insertAdjacentHTML("beforeend", feedRowHTML(autos[shown]));
        feed.scrollTop=feed.scrollHeight;
        shown++;
      }
      if(p<1){ requestAnimationFrame(frame); }
      else { finishAdvance(plan, feed, autos, feedStarted); }
    }
    requestAnimationFrame(frame);
  }

  function finishAdvance(plan, feed, autos, feedStarted){
    // Cualquier automático que faltara por revelar (por si la animación fue muy corta).
    if(feed){
      const rendered=feed.querySelectorAll(".gt-feed-row").length;
      if(rendered<autos.length){
        if(!feedStarted){ feed.innerHTML=""; }
        for(let i=rendered;i<autos.length;i++) feed.insertAdjacentHTML("beforeend", feedRowHTML(autos[i]));
      }
      if(!autos.length && !feed.querySelector(".gt-daybreak")){ feed.innerHTML=`<div class="gt-feed-h">Sin actividad automática en este tramo.</div>`; }
    }
    SimulationEngine.commit(plan);   // ahora sí: mueve el reloj (verdad) y encola interrupciones
    _animating=false;
    renderInterruptionCard(Interruptions.current());
  }

  /* ---------- panel de interrupción ---------- */
  function renderInterruptionCard(ev){
    const ov=document.getElementById("gt-overlay"); if(!ov) return;
    const slot=ov.querySelector("#gt-card-slot");
    if(!ev){ closeOverlay(); return; }
    const left=Interruptions.count();
    const more = left>1 ? `<span class="gt-more">+${left-1} pendiente${left-1===1?"":"s"} a esta hora</span>` : "";
    const html = `
      <div class="gt-card gt-kind-${ev.kind}">
        <div class="gt-ic">${icon(ev.kind,26)}</div>
        <div class="gt-body">
          <div class="gt-kindlbl">${kindLabel(ev.kind)}</div>
          <div class="gt-title">${escapeH(ev.title)}</div>
          ${ev.detail?`<div class="gt-text gt-detail">${escapeH(ev.detail)}</div>`:""}
          ${ev.body?`<div class="gt-text">${escapeH(ev.body)}</div>`:""}
        </div>
      </div>
      <div class="gt-actions">${more}<button type="button" class="gt-btn gt-resolve">${resolveLabel(ev)}</button></div>`;
    if(slot){ slot.innerHTML=html; } else { ov.querySelector(".gt-modal").insertAdjacentHTML("beforeend", html); }
    const rb=ov.querySelector(".gt-resolve"); if(rb) rb.addEventListener("click", onResolve);
  }

  // Muestra una interrupción SIN animación (p. ej. las siguientes de la misma hora).
  function showInterruption(ev, _ignore){
    const ov=ensureOverlay(); ov.hidden=false;
    ov.innerHTML = `<div class="gt-modal" role="dialog" aria-modal="true"><div class="gt-top">${gtTopHTML(GameClock.now())}</div><div id="gt-card-slot"></div></div>`;
    renderInterruptionCard(ev);
  }

  function showIdle(){
    const ov=ensureOverlay(); ov.hidden=false;
    ov.innerHTML = `<div class="gt-modal" role="dialog" aria-modal="true"><div class="gt-top">${gtTopHTML(GameClock.now())}</div>
      <div class="gt-card"><div class="gt-ic">${icon("moon",26)}</div><div class="gt-body"><div class="gt-title">Nada por ahora</div><div class="gt-text">No hay más eventos que requieran tu atención en el horizonte cercano.</div></div></div>
      <div class="gt-actions"><button type="button" class="gt-btn gt-resolve">Entendido</button></div></div>`;
    ov.querySelector(".gt-resolve").addEventListener("click", ()=>closeOverlay());
  }

  // Al resolver: se marca (en memoria). Si el evento tiene pantalla asociada, te lleva ahí
  // (uso normal, equivale a un clic en el menú); si quedan más a la misma hora, se muestran.
  function onResolve(){
    const ev=Interruptions.resolveCurrent();
    if(ev && ev.screen && window.Juego && typeof Juego.goScreen==="function"){
      closeOverlay();
      try{ Juego.goScreen(ev.screen); }catch(e){}
      return;
    }
    if(Interruptions.hasPending()) showInterruption(Interruptions.current(), null);
    else closeOverlay();
  }

  function kindLabel(k){
    return ({ decision:"Decisión", match:"Partido", injury:"Lesión", email:"Correo", news:"Noticia",
              training:"Entrenamiento", condition:"Condición", stats:"Estadísticas", sim:"Simulación", day:"Jornada" })[k] || "Evento";
  }
  function resolveLabel(ev){
    const k=ev.kind;
    if(ev.screen){ if(k==="email") return "Ir al buzón"; if(k==="news") return "Ver noticias"; if(k==="injury") return "Ir al centro médico"; if(k==="decision") return "Ir a resolver"; if(k==="match") return "Ir al calendario"; return "Ir a resolver"; }
    if(k==="email") return "Responder";
    if(k==="decision") return "Tomar decisión";
    return "Entendido";
  }
  function escapeH(s){ return (typeof escapeHtml==="function") ? escapeHtml(String(s==null?"":s)) : String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c])); }

  /* ---------- CSS ---------- */
  function injectCSS(){
    if(document.getElementById("gt-css")) return;
    const st=document.createElement("style"); st.id="gt-css";
    st.textContent = `
    .jg-date{gap:4px !important;}
    /* La fila superior se estira exactamente al ancho de la fila de abajo (la fecha, en nowrap), así el
       borde derecho de la hora queda alineado con el final del año. Sin min-width fijo que la desborde. */
    .jg-date-row{display:flex;align-items:baseline;justify-content:space-between;gap:12px;align-self:stretch;width:100%;}
    .jg-date .hora{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;color:var(--muted);line-height:1;font-weight:700;}
    .gt-overlay{position:fixed;inset:0;z-index:9000;background:rgba(8,9,16,.62);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;}
    .gt-overlay[hidden]{display:none !important;}
    .gt-modal{width:min(440px,94vw);background:var(--surface,#1b1d27);border:1px solid var(--line,#2a2d3a);border-radius:16px;box-shadow:0 24px 60px rgba(0,0,0,.5);padding:16px 16px 14px;font-family:'Space Grotesk',sans-serif;animation:gt-pop .18s ease;}
    @keyframes gt-pop{from{opacity:0;transform:translateY(6px) scale(.99);}to{opacity:1;transform:none;}}
    .gt-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;}
    /* Tira de calendario: 3 rectángulos horizontales (ayer | hoy | mañana). El paso de día se ve. */
    .gt-strip{flex:1;min-width:0;overflow:hidden;}
    .gt-caldays{display:grid;grid-template-columns:1fr 1.35fr 1fr;gap:6px;align-items:stretch;}
    .gt-cday{display:flex;flex-direction:column;gap:2px;background:var(--surface-2,#12141d);border:1px solid var(--line,#2a2d3a);border-radius:10px;padding:7px 9px;line-height:1.1;text-align:center;min-width:0;transition:background .2s,border-color .2s,opacity .2s;}
    .gt-cday.side{opacity:.42;transform:scale(.94);}
    .gt-cday.prev{align-items:flex-start;text-align:left;}
    .gt-cday.next{align-items:flex-end;text-align:right;}
    .gt-cday.cur{opacity:1;border-color:var(--coral,#ff6b4d);background:linear-gradient(180deg,rgba(255,107,77,.12),rgba(255,107,77,.03));box-shadow:0 0 0 1px rgba(255,107,77,.25);}
    .gt-cd-dow{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#8a90a6);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:100%;}
    .gt-cd-n{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;color:var(--ink,#eef);white-space:nowrap;}
    .gt-cday.cur .gt-cd-dow{color:var(--coral-bright,#ff9a3d);}
    .gt-cd-time{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:16px;color:var(--ink,#eef);font-variant-numeric:tabular-nums;margin-top:1px;}
    .gt-caldays.gt-slide{animation:gt-slide .42s cubic-bezier(.22,.8,.28,1);}
    @keyframes gt-slide{0%{transform:translateX(34%);opacity:0;}60%{opacity:1;}100%{transform:translateX(0);opacity:1;}}
    .gt-memtag{flex:0 0 auto;font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#8a90a6);border:1px solid var(--line,#2a2d3a);border-radius:999px;padding:3px 8px;white-space:nowrap;}
    .gt-progress{height:4px;border-radius:999px;background:var(--surface-2,#12141d);overflow:hidden;margin:2px 0 10px;}
    .gt-progress-bar{height:100%;width:0;border-radius:999px;background:linear-gradient(90deg,var(--coral,#ff6b4d),var(--coral-bright,#ff9a3d));transition:width .06s linear;}
    .gt-feed{background:var(--surface-2,#12141d);border:1px solid var(--line,#2a2d3a);border-radius:10px;padding:8px 10px;margin-bottom:10px;max-height:172px;overflow-y:auto;}
    .gt-feed-h{font-size:10px;letter-spacing:.06em;text-transform:uppercase;color:var(--muted,#8a90a6);}
    .gt-daybreak{display:flex;align-items:center;gap:10px;margin:8px 0 4px;color:var(--coral-bright,#ff9a3d);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;animation:gt-in .25s ease;}
    .gt-daybreak::before,.gt-daybreak::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(255,154,61,.5),transparent);}
    .gt-daybreak span{flex:0 0 auto;}
    .gt-feed-row{display:flex;align-items:flex-start;gap:9px;padding:4px 0;border-top:1px solid rgba(255,255,255,.04);animation:gt-in .22s ease;color:var(--muted,#9aa0b4);}
    .gt-feed-row:first-child{border-top:none;}
    @keyframes gt-in{from{opacity:0;transform:translateY(3px);}to{opacity:1;transform:none;}}
    .gt-feed-t{font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--muted,#8a90a6);min-width:38px;padding-top:1px;}
    .gt-feed-ic{width:16px;flex-shrink:0;display:flex;color:var(--muted,#9aa0b4);padding-top:1px;}
    .gt-feed-x{flex:1;min-width:0;display:flex;flex-direction:column;font-size:12.5px;}
    .gt-feed-x b{color:var(--ink,#dfe3f0);font-weight:600;}
    .gt-feed-d{color:var(--muted,#8a90a6);font-size:11.5px;margin-top:1px;}
    /* Partido en el feed: el torneo como etiqueta pequeña y el marcador destacado. */
    .gt-feed-tour{font-size:9.5px;letter-spacing:.09em;text-transform:uppercase;color:var(--muted,#8a90a6);font-weight:700;line-height:1.2;}
    .gt-feed-match{color:var(--ink,#eef);font-weight:700;font-size:14px;line-height:1.2;margin-top:1px;}
    .gt-kc-news .gt-feed-ic{color:#9aa6c8;} .gt-kc-training .gt-feed-ic{color:#7fd0a6;} .gt-kc-condition .gt-feed-ic{color:#ff8a8a;} .gt-kc-stats .gt-feed-ic{color:#c8a6ff;}
    .gt-card{display:flex;gap:12px;align-items:flex-start;background:var(--surface-2,#12141d);border:1px solid var(--line,#2a2d3a);border-left:3px solid var(--coral,#ff6b4d);border-radius:12px;padding:13px 14px;animation:gt-in .2s ease;}
    .gt-kind-decision{border-left-color:#f5c542;} .gt-kind-match{border-left-color:#4f8cff;} .gt-kind-injury{border-left-color:#ff5d5d;} .gt-kind-email{border-left-color:#37c98a;} .gt-kind-news{border-left-color:#9aa6c8;}
    .gt-kind-decision .gt-ic{color:#f5c542;} .gt-kind-match .gt-ic{color:#4f8cff;} .gt-kind-injury .gt-ic{color:#ff5d5d;} .gt-kind-email .gt-ic{color:#37c98a;} .gt-kind-news .gt-ic{color:#9aa6c8;}
    .gt-ic{flex-shrink:0;display:flex;color:var(--coral,#ff6b4d);}
    .gt-kindlbl{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#8a90a6);margin-bottom:2px;}
    .gt-title{font-weight:700;font-size:15px;color:var(--ink,#eef);line-height:1.25;}
    .gt-text{font-size:12.5px;color:var(--muted,#9aa0b4);margin-top:3px;line-height:1.45;}
    .gt-detail{color:var(--ink,#cdd3e6);opacity:.85;}
    .gt-actions{display:flex;align-items:center;justify-content:flex-end;gap:12px;margin-top:14px;}
    .gt-more{font-size:11px;color:var(--muted,#8a90a6);margin-right:auto;}
    .gt-btn{border:none;border-radius:10px;padding:10px 18px;font-weight:700;font-size:13.5px;font-family:'Space Grotesk',sans-serif;background:var(--coral,#ff6b4d);color:#fff;cursor:pointer;transition:background .15s,transform .1s;}
    .gt-btn:hover{background:var(--coral-bright,#ff835f);} .gt-btn:active{transform:scale(.97);}
    `;
    document.head.appendChild(st);
  }

  /* ---------- API pública ---------- */
  window.GameTime = {
    GameClock, EventManager, SimulationEngine, Interruptions, PersistenceLayer,
    mountUI,
    now: ()=>GameClock.now(),
    fmt: (d)=>GameClock.fmt(d),
    resetTo(date){ if(date) GameClock.set(date); EventManager.reset(); Interruptions.clear(); if(_mounted) renderPill(); }
  };
})();
