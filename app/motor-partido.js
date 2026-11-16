/* =========================================================
   COPA MANAGER 2026 — app/motor-partido.js
   MOTOR DE PARTIDO (en vivo). Pantalla aparte, gemela del INFORME DE PARTIDO, en la que los
   sucesos se van REVELANDO minuto a minuto: marcador, goles, autogoles, asistencias, tarjetas
   y cambios aparecen en la línea de tiempo, en las canchas y en las alineaciones cuando
   "suceden". Debajo del rectángulo de datos va el relato (textos) con tiempo de lectura.

   Fuentes (SOLO LECTURA — este módulo nunca escribe archivos ni toca el DB):
     · El partido de DB.fixtures (viene de partidos.js) = EL INFORME. Manda en marcador,
       goleadores, tarjetas, cambios y minutos.
     · El relato minuto a minuto: un archivo por partido en la carpeta  partidos-en-vivo/
       llamado como  "MEX vs SRB 04JUN26.js"  (CÓDIGO_LOCAL vs CÓDIGO_VISITA DDMESAA).
       Define  window.CM_EN_VIVO["MEX vs SRB 04JUN26"] = `...texto...`;
       Se carga con un <script> al abrir el partido (funciona con file://).

   Cotejo relato ↔ informe:
     · Cada gol / tarjeta / cambio del informe busca su bloque en el relato (mismo tipo, a
       ±2 minutos, de preferencia el que menciona al jugador). Si lo encuentra, ese bloque
       toma el MINUTO DEL INFORME. Si no, el motor redacta un texto propio para ese suceso.
     · Si al relato le faltan los silbatazos (inicio, medio tiempo, final) se agregan.
     · Un gol/tarjeta/cambio del relato que no cuadra con el informe se muestra como texto
       pero NO cambia el marcador (el informe manda) y se avisa en la consola.

   Controles: Play / Pausa (botón o barra espaciadora). Silbatazos con Web Audio (sin archivos).

   Script CLÁSICO (no module). Cargar DESPUÉS de app/juego.js.
   API: window.MotorPartido = { open, show, stop, isActive, fileNameFor, parseNarrative, buildTimeline, calificacionesV2 }
   Calificaciones v2 (provisional): corre EN SOMBRA con nucleo/calificaciones-v2.js; MotorPartido.calificacionesV2()
   devuelve la comparación (sistema actual vs v2). Para verla en pantalla: CalificacionesV2.CONFIG.MOSTRAR = true.
   ========================================================= */
(function(){
  "use strict";

  /* ---------- configuración del ritmo ---------- */
  const CFG = {
    CARPETA: "partidos-en-vivo/",
    MS_POR_MINUTO: 420,          // (referencia) ritmo lineal anterior del reloj
    // Tiempo ENTRE sucesos: crece con los minutos de distancia pero amortiguado (no lineal), para que
    // 5 minutos sin nada se SIENTAN más que 1, sin volverse eternos: ms = BASE · minutos^EXP (tope MAX).
    // A 1.0x (con RITMO_BASE) ≈ 1 min → 0.6 s · 5 min → 1.9 s · 10 min → 3.2 s · 20+ min → ~5-6 s.
    PAUSA_BASE_MS: 750,
    PAUSA_EXP: 0.75,
    PAUSA_MAX_MS: 8000,
    RITMO_BASE: 1.33,            // la velocidad 1.0x va 33% más rápido; escala todo (reloj y lectura)
    LECTURA_MS_POR_CARACTER: 55, // tiempo de lectura de cada texto
    LECTURA_MIN_MS: 2600,
    LECTURA_MAX_MS: 9500,
    EXTRA_GOL_MS: 2200,          // los goles se quedan un poco más en pantalla
    EXTRA_SILBATO_MS: 900,
    TOLERANCIA_MIN: 2,
    AFICION_VOL: 0,              // afición APAGADA (0). El silbato y la cortinilla del Mundial siguen sonando.
    AFICION_CARPETA: "sonidos/", // grabaciones de la afición (ver SONIDOS_AFICION); sin archivos, no hay afición
    AFICION_SINTETICA: false,    // ambiente sintetizado de respaldo (apagado)
    CORTINILLA: "mundial",       // cortinilla al pulsar JUEGA por primera vez: "mundial" (solo Copa del Mundo) | true | false
    CORTINILLA_VOL: 0.8,           // diferencia máxima (minutos) para emparejar relato ↔ informe
    CODIGO_ESTILO: "bandera",    // código de selección junto a los nombres: parentesis | subindice | etiqueta | bandera | ninguno
    MARCADOR_MUNDIAL: "auto",    // marcador estilo transmisión del Mundial: "auto" (solo partidos de la Copa del Mundo) | true | false
    CODIGO_UNA_VEZ: true         // el código de cada selección sale una sola vez por suceso (y no si el texto ya la nombró)
  };
  const MESES = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];
  // Velocidad de la simulación. Se conserva toda la sesión del juego (solo en memoria).
  const VELOCIDADES = [0.5, 1, 1.5, 2, 3];
  let VELOCIDAD = 1;
  // Minutos de reposición generados cuando el partido no los trae: se sortean una vez y se conservan
  // toda la sesión (solo en memoria), para que el mismo partido se vea igual cada vez.
  const REPOSICION = {};
  function reposicionGenerada(f){
    if(!REPOSICION[f.id]) REPOSICION[f.id]={ 1: 1+Math.floor(Math.random()*3), 2: 3+Math.floor(Math.random()*4) };
    return REPOSICION[f.id];
  }
  // Anuncio de reposición en el relato ("Se añaden 4 minutos", "5 minutos de tiempo añadido").
  // Los números pueden venir con letra ("Seis minutos de reposición"): se pasan a cifra antes de buscar.
  const NUM_LETRA={un:1,uno:1,una:1,dos:2,tres:3,cuatro:4,cinco:5,seis:6,siete:7,ocho:8,nueve:9,diez:10,once:11,doce:12,trece:13,catorce:14,quince:15,dieciseis:16,diecisiete:17,dieciocho:18,diecinueve:19,veinte:20};
  function anuncioDe(it){
    const x=nl(it.title+" "+it.desc).replace(/\b(un|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|trece|catorce|quince|dieciseis|diecisiete|dieciocho|diecinueve|veinte)\b(?=\s*(minutos?|mas)\b)/g, w=>String(NUM_LETRA[w]));
    let m=/(\d{1,2})\s*minutos?\s*(de\s*)?(tiempo\s*)?(anadido|adicional|de reposicion|reposicion|de descuento|descuento|agregados?|extra)/.exec(x);
    if(m) return parseInt(m[1],10);
    m=/(anaden|anade|agregan|agrega|se juegan|adicionan)\s*(\d{1,2})/.exec(x);
    if(m) return parseInt(m[2],10);
    m=/(\d{1,2})\s*minutos?\s*mas\b/.exec(x);
    if(m) return parseInt(m[1],10);
    // Bloque que habla del tiempo añadido ("Tiempo añadido: +6", "el tablero marca 6"): el primer número.
    if(/^[^a-z0-9]*(tiempo anadido|tiempo adicional|tiempo de reposicion|reposicion|descuento|minutos? de reposicion|anuncio)/.test(nl(it.title)) || /(tablero|cartel) (luminoso |electronico )?(marca|indica|muestra|senala)/.test(x)){ m=/\+?\s*\b(\d{1,2})\b/.exec(x.replace(/\b(45|90|105|120)\b/g,"")); if(m && +m[1]>0 && +m[1]<=20) return parseInt(m[1],10); }
    return null;
  }

  /* ---------- utilidades ---------- */
  // Piezas de dibujo del INFORME (privadas de app/juego.js, compartidas en Juego.informe).
  const JI = ()=> (window.Juego && window.Juego.informe) || {};
  const call = (fn, ...a)=>{ const f=JI()[fn]; return (typeof f==="function") ? f(...a) : ""; };
  const H = s => (typeof esc==="function") ? esc(s) : String(s==null?"":s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  // CAMBIOS EN CADENA de un renglón de la alineación ("3, Holeš, CB - 22, Souček 64' - 24, Sojka 87'"):
  // p.sub es el 1er cambio y p.sub.sub el siguiente… Cada eslabón: ref = quien SALE (el registro cuyo .sub
  // es quien entra) y entra = quien ENTRA. S.revealed guarda el ref de cada cambio ya revelado.
  function cadenaCambios(p){ const out=[]; let r=p; while(r && r.sub && r.sub.name){ out.push({ ref:r, entra:r.sub }); r=r.sub; } return out; }
  function nl(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/\s+/g," ").trim(); }
  function apellido(nombre){ const p=String(nombre||"").trim().split(/\s+/); return p[p.length-1]||""; }
  function codigo(t){ return JI().mrTeamCode ? JI().mrTeamCode(t) : ((t&&t.fifaCode)||""); }
  function nombreEq(t){ return JI().teamName ? JI().teamName(t) : ((t&&(t.commonName||t.name))||""); }
  // "45+3" → {base:45, extra:3}
  function partesMin(m){ const s=String(m==null?"":m); const b=parseInt(s,10)||0; const e=/\+\s*(\d+)/.exec(s); return {base:b, extra:e?parseInt(e[1],10):0}; }
  function etiquetaMin(base, extra){ return extra>0 ? `${base}+${extra}` : String(base); }
  // TIEMPO EXTRA: con "FT 90+5’, 120+1’" (o sucesos después del 90) el partido tiene 4 tiempos:
  // 1 y 2 (los 90 reglamentarios), 3 (91–105) y 4 (106–120). Silbatazos extra: "fr" (fin del tiempo
  // reglamentario), "e1" (arranca el 1er tiempo extra), "eht" (fin del 1er tiempo extra), "e2" (arranca el 2º).
  let TE=false;
  function tieneTE(f){
    if(!f) return false;
    if(f.ftReg) return true;
    if(f.ftMin && partesMin(f.ftMin).base>=105) return true;
    const mas90=m=> partesMin(m).base>90;
    if((f.goals||[]).some(g=>mas90(g.minute)) || (f.cards||[]).some(c=>mas90(c.minute)) || (f.missedPens||[]).some(g=>mas90(g.minute))) return true;
    return ["home","away"].some(sd=>{ const lu=f.lineups&&f.lineups[sd]; return !!lu && (lu.players||[]).some(p=>{ let r=p; while(r&&r.sub){ if(r.sub.minute && mas90(r.sub.minute)) return true; r=r.sub; } return false; }); });
  }
  // Marcas de la barra de avance bajo el marcador: MT a la mitad; con tiempo extra los 120' se reparten
  // (45 · 45 · 15 · 15): MT al 37.5%, fin de los 90 al 75% y la división del tiempo extra al 87.5%.
  // En vivo, la barra (y la línea de tiempo) se reparten así SOLO a partir del final del tiempo
  // reglamentario (S.teVisible); antes se ven como un partido de 90'.
  function marcasProgHTML(){
    return (TE && S && S.teVisible) ? `<span class="ml-mt" style="left:37.5%;" title="Medio tiempo"></span><span class="ml-mt" style="left:75%;" title="Fin del tiempo reglamentario"></span><span class="ml-mt" style="left:87.5%;" title="Medio tiempo del tiempo extra"></span>`
              : `<span class="ml-mt" title="Medio tiempo"></span>`;
  }
  const SIL_DESCANSO = new Set(["ht","fr","eht"]);   // silbatazos que paran el partido (descanso)
  const SIL_ARRANQUE = new Set(["k1","k2","e1","e2"]);

  /* =========================================================
     NOMBRE DEL ARCHIVO Y CARGA DEL RELATO
     ========================================================= */
  // "MEX vs SRB 04JUN26" (local vs visitante, fecha del partido).
  function fileNameFor(f){
    const A=getTeam(f.teamA), B=getTeam(f.teamB);
    const d=String(f.date||"");
    const dd=d.slice(8,10), mm=parseInt(d.slice(5,7),10), yy=d.slice(2,4);
    return `${codigo(A)} vs ${codigo(B)} ${dd}${MESES[(mm||1)-1]}${yy}`;
  }
  // Inyecta  partidos-en-vivo/<nombre>.js  y devuelve el texto (o null si no existe).
  function loadNarrative(f, cb){
    const name=fileNameFor(f);
    window.CM_EN_VIVO = window.CM_EN_VIVO || {};
    const prev=document.querySelector(`script[data-en-vivo="${CSS.escape(name)}"]`);
    if(prev) prev.remove();   // se vuelve a leer cada vez (el archivo es vivo y puede haber cambiado)
    let done=false;
    const finish=()=>{ if(done) return; done=true; const t=window.CM_EN_VIVO[name]; cb(typeof t==="string"?t:null, name); };
    const s=document.createElement("script");
    s.dataset.enVivo=name;
    s.src=CFG.CARPETA + encodeURIComponent(name) + ".js";
    s.onload=finish; s.onerror=finish;
    setTimeout(finish, 4000);
    document.head.appendChild(s);
  }

  /* =========================================================
     LECTURA DEL RELATO
     Bloques separados por renglón en blanco:
       "8'"                ← minuto (también 45+3' · 45'+3')
       "Remate atajado"    ← título del suceso
       "Remate de …"       ← descripción (una o varias líneas)
     "Previo" en su propio renglón abre la sección previa (bloques sin minuto), o bien cada bloque
     previo empieza con "Previo" y luego su título y su descripción.
     Las líneas que empiezan con # se ignoran.
     ========================================================= */
  const RE_MIN=/^(\d{1,3})\s*['’′´]?\s*(?:\+\s*(\d{1,2})\s*['’′´]?)?$/;   // minuto con ’ ' ´ ′
  function esMinuto(linea){ return RE_MIN.test(linea) && /['’′´+]/.test(linea); }

  // En pantalla, los minutos siempre con ’ (aunque el archivo traiga ' ´ ′): "57'" → "57’", "45+2´" → "45+2’".
  function minutosConComilla(t){ return String(t||"").replace(/(\d)\s?['´′](?=\s|$|[.,;:)!?])/g, "$1’"); }
  function parseNarrative(text){
    const lines=String(text||"").replace(/\r/g,"").split("\n").map(s=>s.trim());
    const blocks=[]; let cur=[];
    lines.forEach(l=>{
      if(l.startsWith("#")) return;
      if(!l){ if(cur.length){ blocks.push(cur); cur=[]; } return; }
      cur.push(l);
    });
    if(cur.length) blocks.push(cur);
    const out=[]; let pending=null, lastMin=null, seq=0, enPost=false;
    // Jugador del partido: va SIEMPRE en la sección Post (después del silbatazo final), tenga o no minuto.
    const RX_POTM=/^[^a-z0-9]*(superior player of the match|jugador del partido)/i;
    blocks.forEach(b=>{
      if(b.length===1 && /^previo:?$/i.test(b[0])) return;
      // "Post" en su propio renglón abre la sección POSTERIOR al final (bloques sin minuto, en orden y sin
      // reloj); o bien cada bloque empieza con "Post" y luego su título y descripción.
      if(b.length===1 && /^post:?$/i.test(b[0])){ enPost=true; return; }
      if(/^post:?$/i.test(b[0])){
        if(b.length>1) out.push({ seq:seq++, post:true, base:0, extra:0, title:b[1].replace(/\s+/g," "), desc:b.slice(2).join(" ").replace(/\s+/g," ") });
        return;
      }
      // Formato por bloque:  "Previo" / Título / Descripción  (cada bloque previo lleva su propio "Previo").
      if(/^previo:?$/i.test(b[0])){
        out.push({ seq:seq++, previo:true, base:0, extra:0, title:b[1].replace(/\s+/g," "), desc:b.slice(2).join(" ").replace(/\s+/g," ") });
        return;
      }
      let i=0, min=null;
      if(esMinuto(b[0])){ const m=RE_MIN.exec(b[0]); min={base:parseInt(m[1],10), extra:m[2]?parseInt(m[2],10):0}; i=1; }
      if(i>=b.length){ pending=min; return; }          // minuto suelto: aplica al siguiente bloque
      if(!min && pending){ min=pending; }
      pending=null;
      const title=minutosConComilla(b[i].replace(/\s+/g," "));
      const desc=minutosConComilla(b.slice(i+1).join(" ").replace(/\s+/g," "));
      if(RX_POTM.test(title) || (enPost && !min)){ out.push({ seq:seq++, post:true, base:0, extra:0, title, desc }); return; }
      if(min) enPost=false;   // un minuto después de "Post" vuelve al partido
      let previo=false;
      if(!min){ if(lastMin) min=lastMin; else previo=true; }   // sin minuto: continuación, o sección previa
      if(min) lastMin=min;
      out.push({ seq:seq++, previo, base:min?min.base:0, extra:min?min.extra:0, title, desc });
    });
    return out;
  }

  // Tipo del suceso según el título (y la descripción).
  // ¿El bloque es un PENAL FALLADO? Encabezado que empieza con "Penal"/"Penalti" y dice que se falló
  // (fallado, atajado, al poste…), o encabezado neutro ("Penal") cuya descripción lo cuenta. "Penal para
  // México" / "Penal a favor de…" todavía no se cobra: no cuenta.
  const RX_PEN_MISS_TI=/fall|atajad|detenid|desviad|fuera|poste|travesa|errad|parad|ataja|detiene|desperdici/;
  const RX_PEN_MISS_DE=/(falla|fallo|erra|erro|desperdicia|desperdicio) (el|un|la) (penal|penalti|pena maxima)|penal (fallado|atajado|detenido|errado)|(ataja|atajo|detiene|detuvo|para|paro|adivina|adivino) (el|un) (penal|penalti|disparo|cobro)|(estrella|estrello|manda|mando|envia|envio) (el balon |la pelota |el disparo )?(al poste|al travesano|por encima|fuera|desviad)/;
  function esPenalFallado(title, desc){
    const ti=nl(title||"").replace(/^[^a-z0-9]+/,"");
    if(!/^(penal|penalti)/.test(ti)) return false;
    if(RX_PEN_MISS_TI.test(ti)) return true;
    if(/^(penal|penalti) (a favor|para|marcado|senalad|decretad|en contra)/.test(ti)) return false;
    return RX_PEN_MISS_DE.test(nl((title||"")+" "+(desc||"")));
  }
  function tipoDe(title, desc){
    // Sin signos al inicio ("¡Gol!", "¡¡GOOOL!!", "- Cambio") para reconocer el tipo.
    const t=nl(title).replace(/^[^a-z0-9]+/,""), d=nl(desc);
    // 1º por el INICIO del encabezado ("Gol de Julián Quiñones", "Tarjeta amarilla para Teboho Mokoena"…),
    // sin importar lo que siga (así el nombre del jugador nunca cambia el tipo).
    if(/^go+l anulad/.test(t)) return "texto";
    if(esPenalFallado(title, desc)) return "penmiss";
    if(/^(go+l en contra|gol en propia|autogol)\b/.test(t)) return "goal";
    if(/^(go+l|golazo)\b/.test(t)) return "goal";
    if(/^(tarjeta roja|roja|segunda amarilla|expulsi)/.test(t)) return "red";
    if(/^(tarjeta amarilla|amarilla|amonest)/.test(t)) return "yellow";
    if(/^(sustituci|cambio)/.test(t)) return "sub";
    // Encabezados con otra redacción (relatos anteriores): por palabras clave.
    if(/anulad/.test(t)) return "texto";
    if(/autogol|en propia|gol en contra/.test(t)) return "goal";
    if(/^(go+l|golazo)\b/.test(t)) return "goal";
    if(/segunda amarilla|tarjeta roja|^roja|expuls/.test(t)) return "red";
    if(/amarilla|amonest/.test(t)) return "yellow";
    if(/sustituci|^cambio/.test(t)) return "sub";
    return "texto";
  }
  // Silbatazo: k1 (inicio 1T), ht (fin 1T), k2 (inicio 2T), ft (final). half = mitad en curso al leerlo.
  // Se revisa el TÍTULO y, si es corta, la descripción, sin signos ("¡Final!", "Final, segunda parte").
  const W=String.raw`(?:\s+\S+){0,3}\s+`;
  const RX_SILBATO={
    ht: new RegExp(String.raw`(final|fin|termin|conclu|acab)\w*${W}(primera parte|primer tiempo)|^descanso|^medio tiempo|^entretiempo|^al descanso`),
    k2: new RegExp(String.raw`(empie|comien|arranc|inici|reanud)\w*${W}(segunda parte|segundo tiempo|complemento)`),
    ft: new RegExp(String.raw`(final|fin|termin|conclu|acab|finaliz)\w*${W}(partido|encuentro|juego|segunda parte|segundo tiempo)|(partido|encuentro) (finalizado|terminado|concluido|acabado)|(silbatazo|pitazo|silbato) final|^final$|^fin$|^final del|^fin del|^tiempo cumplido|^se acabo|^termina$|^terminado$|^finaliza|^concluye|^acaba$`),
    k1: new RegExp(String.raw`(empie|comien|arranc|inici)\w*${W}(primera parte|primer tiempo|partido|encuentro)|^saque inicial|^(pitazo|silbatazo) inicial|^inicio\b|^arranque|^arranca$|^comienza$|^empieza$|rueda el balon|ruedan el balon|echa a rodar|a rodar el balon`)
  };
  function silbatoDe(title, desc, half, sawHT){
    // Un bloque que es un SUCESO (gol, tarjeta, cambio…) nunca es silbatazo, aunque su texto diga
    // "apenas iniciado el complemento" o "al final del partido".
    if(tipoDe(title, desc)!=="texto") return null;
    const limpia=x=>nl(x).replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
    const T=limpia(title), D=limpia(desc);
    // La descripción solo cuenta si el título no describe una jugada.
    const tituloJugada=/\bgo+l|remate|disparo|tiro|cabezazo|falta|cambio|sustitu|tarjeta|amonest|expuls|corner|esquina|atajad|parad|fuera de juego|ocasion|penal|lesion|asistencia|centro|contragolpe/.test(T);
    const prueba=rx=> rx.test(T) || (!tituloJugada && D.length<=140 && rx.test(D));
    for(const w of ["ht","k2","ft","k1"]){
      if(!prueba(RX_SILBATO[w])) continue;
      // "Saque inicial" tras el descanso = 2T; antes del descanso es el inicio (si se repite, se quita).
      if(w==="k1") return sawHT ? "k2" : "k1";
      return w;
    }
    return null;
  }

  /* =========================================================
     LÍNEA DE SUCESOS (relato + informe, cotejados)
     ========================================================= */
  // Mitad (1/2) de un minuto del informe. "45" exacto: los cambios son del descanso (2T); lo demás, 1T.
  function mitadInforme(minute, tipo){
    const {base, extra}=partesMin(minute);
    if(base<45) return 1;
    if(base===45) return extra>0 ? 1 : (tipo==="sub" ? 2 : 1);
    if(TE && base>90){
      if(base<105) return 3;
      if(base===105) return extra>0 ? 3 : (tipo==="sub" ? 4 : 3);   // 105' exacto: los cambios son del descanso
      return 4;
    }
    return 2;
  }
  // Silbatazos del tiempo extra en el relato. w = lo que reconoció silbatoDe (k1/ht/k2/ft o null).
  function silbatoTE(title, desc, w, half, base, est){
    if(base<90 || tipoDe(title, desc)!=="texto") return w;
    const limpia=x=>nl(x).replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim();
    const T=limpia(title), D=limpia(desc);
    const tituloJugada=/\bgo+l|remate|disparo|tiro|cabezazo|falta|cambio|sustitu|tarjeta|amonest|expuls|corner|esquina|atajad|parad|fuera de juego|ocasion|penal|lesion|asistencia|centro|contragolpe/.test(T);
    const x = T + ((!tituloJugada && D.length<=140) ? " | "+D : "");
    const ET=/tiempo extra|tiempos extra|tiempo suplementario|tiempos suplementarios|prorroga|alargue|periodo extra/;
    const INI=/\b(empie|comien|arranc|inici|reanud|rueda|echa a rodar)/;
    const FIN=/\b(final|fin|termin|conclu|acab|finaliz|descanso|medio tiempo|silbatazo|pitazo)/;
    if(/reglamentari|noventa minutos|90 minutos/.test(x) && FIN.test(x)) return "fr";
    if(ET.test(x)){
      if(INI.test(T) && !/\b(final|termin|conclu|acab)/.test(T)){
        if(/segund/.test(T)) return "e2";
        if(/primer/.test(T)) return "e1";
        return (est.e1 && est.eht) ? "e2" : "e1";
      }
      if(/descanso|medio tiempo/.test(x) || (FIN.test(x) && /primer/.test(x))) return "eht";
      if(FIN.test(x)){ if(/segund/.test(x) || est.eht) return "ft"; return est.e1 ? "eht" : "fr"; }
      return w;
    }
    if(w==="ft" && half<=2) return "fr";
    if(w==="ht" && half>=3) return "eht";
    if((w==="k1"||w==="k2") && est.fr) return est.eht ? "e2" : "e1";
    return w;
  }
  // Sucesos del informe (DB.fixtures): goles, tarjetas y cambios.
  function sucesosInforme(f){
    const ev=[];
    (f.goals||[]).forEach(g=>{ const p=partesMin(g.minute); ev.push({ tipo:"goal", ref:g, teamId:g.teamId, og:!!g.og, pen:!!g.penalty, player:g.player, assist:g.assistPlayer||null, minute:String(g.minute), base:p.base, extra:p.extra, t:p.base+p.extra, half:mitadInforme(g.minute,"goal"), nombres:[g.player] }); });
    // Penal FALLADO (código PFa del informe): no cambia el marcador.
    (f.missedPens||[]).forEach(g=>{ const p=partesMin(g.minute); ev.push({ tipo:"penmiss", ref:g, teamId:g.teamId, player:g.player, minute:String(g.minute), base:p.base, extra:p.extra, t:p.base+p.extra, half:mitadInforme(g.minute,"penmiss"), nombres:[g.player] }); });
    (f.cards||[]).forEach(c=>{ const k=c.type||"yellow"; if(k!=="yellow"&&k!=="red") return; const p=partesMin(c.minute); ev.push({ tipo:k, ref:c, teamId:c.teamId, player:c.player, minute:String(c.minute), base:p.base, extra:p.extra, t:p.base+p.extra, half:mitadInforme(c.minute,k), nombres:[c.player] }); });
    ["home","away"].forEach(side=>{
      const lu=f.lineups&&f.lineups[side]; if(!lu) return;
      (lu.players||[]).forEach(pl=>{
        cadenaCambios(pl).forEach(({ref, entra})=>{
          if(!entra.minute) return;
          const p=partesMin(entra.minute);
          ev.push({ tipo:"sub", ref, teamId:lu.teamId, inName:entra.name, outName:ref.name, minute:String(entra.minute), base:p.base, extra:p.extra, t:p.base+p.extra, half:mitadInforme(entra.minute,"sub"), nombres:[entra.name, ref.name] });
        });
      });
    });
    return ev.sort((a,b)=> a.half-b.half || a.t-b.t);
  }
  function menciona(item, nombres){
    const x=nl(item.title+" "+item.desc);
    return (nombres||[]).some(n=>{ const a=nl(apellido(n)); return a.length>=3 && x.indexOf(a)>=0; });
  }

  // CAMBIOS AGRUPADOS: los cambios de un mismo equipo separados por 2' o menos forman un grupo, y la
  // ventana se ENCADENA (58'–59' juntos; uno al 61' también entra porque está a 2' del 59'). El grupo se
  // anuncia una sola vez, en el minuto del primer cambio. Excepción: si el jugador que sale en un cambio
  // posterior tiene un suceso propio (gol, tarjeta) entre el primer cambio del grupo y su salida, ese
  // cambio no se agrupa: se anuncia aparte, en su minuto.
  // Deja en cada cambio: ev.grp (clave), ev.G (el primer cambio del grupo) y ev.grupo (todos).
  const VENTANA_CAMBIOS = 2;
  // Grupo de cada cambio del informe (jugador del once → clave de grupo), para acomodarlos en la cancha.
  let GRUPO_CAMBIO = new WeakMap();
  function agruparCambios(evs){
    const L=e=> linDe(e.half, e.t);
    const otros=evs.filter(e=>e.tipo!=="sub");
    const tieneSuceso=(nombre, desde, hasta)=>{ const n=nl(nombre||""); return !!n && otros.some(o=> nl(o.player||"")===n && L(o)>=desde && L(o)<=hasta); };
    const subs=evs.filter(e=>e.tipo==="sub").sort((a,b)=> L(a)-L(b));
    const abiertos=[]; let n=0;
    subs.forEach(ev=>{
      const g=abiertos.find(g=> g.teamId===ev.teamId && L(ev)-L(g.ult)<=VENTANA_CAMBIOS && !tieneSuceso(ev.outName, L(g.G), L(ev)));
      if(g){ g.miembros.push(ev); g.ult=ev; ev.grp=g.key; ev.G=g.G; ev.grupo=g.miembros; }
      else {
        const ng={ key:"g"+(n++)+"@"+ev.teamId, teamId:ev.teamId, G:ev, ult:ev, miembros:[ev] };
        abiertos.unshift(ng);   // el más reciente primero
        ev.grp=ng.key; ev.G=ev; ev.grupo=ng.miembros;
      }
      if(ev.ref && typeof ev.ref==="object") GRUPO_CAMBIO.set(ev.ref, ev.grp);
    });
  }
  // VARIABLES DEL PARTIDO para los relatos ({horaOficial}, {horaReal}, {motivoContratiempo}, {temperatura},
  // {condicion}, {techoCerrado}): un bloque «Previo» puede mencionar el clima o el retraso.
  function variablesPartido(f){
    const ct=(f&&f.contratiempo)||{}, cl=(f&&f.clima)||{};
    return {
      horaOficial: (f&&f.time)||"",
      horaReal: ct.horaReal || (f&&f.time) || "",
      motivoContratiempo: ct.motivo || "",
      temperatura: cl.temperatura!=null ? String(cl.temperatura).replace(".",",") : "",
      condicion: cl.condicion || "",
      techoCerrado: cl.techoCerrado ? "techo cerrado" : ""
    };
  }
  function conVariables(texto, V){ return String(texto||"").replace(/\{(horaOficial|horaReal|motivoContratiempo|temperatura|condicion|techoCerrado)\}/g, (m,k)=> V[k]!=null ? V[k] : m); }
  function buildTimeline(f, raw){
    TE=tieneTE(f);
    { const V=variablesPartido(f); (raw||[]).forEach(r=>{ r.title=conVariables(r.title, V); r.desc=conVariables(r.desc, V); }); }
    const items=[]; let half=0, sawHT=false; const est={ fr:false, e1:false, eht:false };
    const posts=(raw||[]).filter(r=>r.post);   // sección Post: se agrega después del silbatazo final
    (raw||[]).filter(r=>!r.post).forEach(r=>{
      const it={ seq:r.seq, previo:r.previo, base:r.base, extra:r.extra, title:r.title, desc:r.desc, tipo:tipoDe(r.title,r.desc), silbato:null, matched:[], gen:false };
      // "Gol anulado a …" nunca es un gol del informe (ni por el respaldo de texto que nombra al jugador).
      if(/^go+l anulad|anulad/.test(nl(r.title).replace(/^[^a-z0-9]+/,""))) it.anulado=true;
      if(r.previo){ it.half=0; it.t=0; items.push(it); return; }
      let w=silbatoDe(r.title, r.desc, half, sawHT);
      if(TE) w=silbatoTE(r.title, r.desc, w, half, r.base, est);
      if(w==="k1") half=1;
      if(w==="k2"){ half=2; }
      if(w==="e1") half=3;
      if(w==="e2") half=4;
      if(half<1) half=1;
      if(half===1 && sawHT && w!=="ht") half=2;          // tras el descanso, todo es 2T
      if(half===1 && r.base>45) half=2;                    // al relato le faltó el medio tiempo
      if(TE){
        if(half<=2 && r.base>90) half=3;                                     // 91' en adelante: tiempo extra
        if(half===3 && r.base>105) half=4;
        if(half===3 && est.eht && w!=="eht" && !r.extra) half=4;            // tras el descanso del tiempo extra
      }
      if(w==="ht") sawHT=true;
      if(w==="fr") est.fr=true; if(w==="e1") est.e1=true; if(w==="eht") est.eht=true;
      it.silbato=w; it.half=half; it.t=r.base+r.extra;
      if(w) it.tipo="silbato";
      items.push(it);
    });

    // Cotejo con el informe
    const evs=sucesosInforme(f); const sinPareja=[];
    agruparCambios(evs);
    // Mención PRECISA: nombre completo; el apellido solo cuenta si no lo comparten dos jugadores de los
    // sucesos del informe (p. ej. Luis Chávez y Mateo Chávez entran en minutos distintos).
    const cuentaAp={};
    evs.forEach(e=>e.nombres.forEach(n=>{ const a=nl(apellido(n)); cuentaAp[a]=(cuentaAp[a]||new Set()).add(nl(n)); }));
    const nombra=(it, nombres)=>{
      const x=" "+nl(it.title+" "+it.desc).replace(/[^a-z0-9 ]+/g," ")+" ";
      return (nombres||[]).some(n=>{
        const full=nl(n).replace(/[^a-z0-9 ]+/g," ").trim();
        if(full.length>3 && x.indexOf(" "+full+" ")>=0) return true;
        const a=nl(apellido(n)).replace(/[^a-z0-9]+/g,"");
        return a.length>=3 && cuentaAp[nl(apellido(n))] && cuentaAp[nl(apellido(n))].size===1 && x.indexOf(" "+a+" ")>=0;
      });
    };
    // Goles y tarjetas: un bloque que nombra a OTRO jugador de un suceso del mismo tipo (y no a este) no es de este suceso.
    const deOtro=(it, ev)=> !nombra(it, ev.nombres) && evs.some(o=> o!==ev && o.tipo===ev.tipo && nombra(it, o.nombres));
    // Cambios (los relatos los agrupan por equipo en una ventana encadenada de ±2'): un bloque solo se
    // descarta si nombra a un jugador de un cambio de OTRO grupo (otro equipo, o fuera de la ventana).
    const deOtroCambio=(it, ev)=> evs.some(o=> o!==ev && o.tipo==="sub" && o.grp!==ev.grp && nombra(it, o.nombres));
    // Minuto con el que se coteja un suceso: los cambios usan el del PRIMER cambio de su grupo.
    const tEv=ev=> ev.tipo==="sub" ? ev.G : ev;
    evs.forEach(ev=>{
      const cand=items.filter(it=>{
        if(it.previo) return false;
        // Respaldo: un bloque de texto que habla de GOL y nombra al goleador también es ese gol
        // (evita que el gol salga dos veces: el del relato y el que redacta el motor).
        // Respaldo general: un bloque de TEXTO que habla del mismo tipo de suceso y nombra al jugador
        // también es ese suceso (así no sale dos veces: el del relato y el que redacta el motor).
        const CLAVE={ penmiss:/penal|penalti|pena maxima|once metros/, goal:/\bgo+l|golazo|autogol|anota|empata|marca el|adelanta|ventaja|celebra|al fondo de la red|la manda a guardar|\b\d\s*[-–]\s*\d\b/, yellow:/amarilla|amonest/, red:/roja|expuls/, sub:/sustitu|cambio|entra|ingresa/ };
        const enTexto = it.tipo==="texto" && !it.anulado && !it.matched.length && CLAVE[ev.tipo] && CLAVE[ev.tipo].test(nl(it.title+" "+it.desc)) && menciona(it, ev.nombres);
        if(it.tipo!==ev.tipo && !enTexto) return false;
        if(ev.tipo==="sub" ? deOtroCambio(it, ev) : deOtro(it, ev)) return false;
        const E=tEv(ev);
        // Cambios: el bloque del relato puede ir en el minuto de CUALQUIER cambio de su grupo.
        const dT = ev.tipo==="sub" ? Math.min(...ev.grupo.map(m=>Math.abs(it.t-m.t))) : Math.abs(it.t-ev.t);
        if(dT>CFG.TOLERANCIA_MIN) return false;
        const borde45 = (E.base===45&&!E.extra) || (it.base===45&&!it.extra);
        if(it.half!==E.half && !borde45) return false;
        if(ev.tipo!=="sub" && it.matched.length) return false;               // goles/tarjetas: uno a uno
        // Cambios: un bloque cubre varios cambios, pero solo los del MISMO grupo (equipo + ventana ±2').
        if(ev.tipo==="sub" && it.matched.length && it.matched.some(m=> m.grp!==ev.grp)) return false;
        return true;
      });
      if(!cand.length){ sinPareja.push(ev); return; }
      const E=tEv(ev);
      const peso=x=> (nombra(x,ev.nombres)?0:3) + Math.abs(x.t-E.t) + (x.matched.length?0:0.5) + (x.tipo===ev.tipo?0:0.6);
      cand.sort((a,b)=>peso(a)-peso(b));
      const it=cand[0];
      if(it.tipo==="texto") it.tipo=ev.tipo;
      it.matched.push(ev);
      // Manda el informe; un bloque de cambios va en el minuto del PRIMER cambio de su grupo.
      if(it.base!==E.base || it.extra!==E.extra || it.half!==E.half){
        if(it.matched.length===1 || ev.tipo==="sub"){ it.base=E.base; it.extra=E.extra; it.t=E.t; it.half=E.half; it.ajustado=true; }
      }
    });
    const CLAVE2={ penmiss:/penal|penalti|pena maxima|once metros/, goal:/\bgo+l|golazo|autogol|anota|empata|marca el|adelanta|ventaja|celebra|al fondo de la red|\b\d\s*[-–]\s*\d\b/, yellow:/amarilla|amonest/, red:/roja|expuls/, sub:/sustitu|cambio|entra|ingresa/ };
    for(let i=sinPareja.length-1;i>=0;i--){
      const ev=sinPareja[i];
      const cand=items.filter(it=> !it.previo && !it.matched.length && !it.silbato && !(it.anulado && ev.tipo==="goal")
        && (it.tipo===ev.tipo || (it.tipo==="texto" && CLAVE2[ev.tipo] && CLAVE2[ev.tipo].test(nl(it.title+" "+it.desc))))
        && nombra(it, ev.nombres) && Math.abs(linDe(it.half,it.t)-linDe(ev.half,ev.t))<=6);
      if(!cand.length) continue;
      cand.sort((a,b)=>Math.abs(a.t-ev.t)-Math.abs(b.t-ev.t));
      const it=cand[0]; const E=tEv(ev);
      it.tipo=ev.tipo; it.matched.push(ev);
      it.base=E.base; it.extra=E.extra; it.t=E.t; it.half=E.half; it.ajustado=true;
      sinPareja.splice(i,1);
    }
    // Un bloque de cambios del relato cubre el GRUPO COMPLETO: los demás cambios de ese equipo en su
    // ventana encadenada de ±2' (aunque el bloque no los nombre) se quedan en él.
    items.forEach(it=>{
      if(it.tipo!=="sub" || !it.matched.length) return;
      const m0=it.matched[0];
      for(let i=sinPareja.length-1;i>=0;i--){
        const ev=sinPareja[i];
        if(ev.tipo==="sub" && ev.grp===m0.grp && !deOtroCambio(it, ev)){ it.matched.push(ev); sinPareja.splice(i,1); }
      }
    });
    // Relato con gol/tarjeta/cambio que no cuadra con el informe: solo texto.
    items.forEach(it=>{
      if(it.tipo==="penmiss" && !it.matched.length){ it.tipo="texto"; return; }   // sin PFa en el informe: texto (conserva su icono)
      if((it.tipo==="goal"||it.tipo==="yellow"||it.tipo==="red"||it.tipo==="sub") && !it.matched.length){
        try{ console.warn(`[Motor de partido] ${etiquetaMin(it.base,it.extra)}’ "${it.title}" no cuadra con el informe (partidos.js); se muestra solo como texto.`); }catch(e){}
        it.tipo="texto";
      }
    });

    let seq=100000;
    // Sucesos del informe sin texto en el relato → texto propio. Los cambios del mismo grupo (equipo +
    // ventana encadenada de ±2') van juntos, en el minuto del primero.
    const grupos={};
    sinPareja.forEach(ev=>{
      if(ev.tipo==="sub"){
        const k=ev.grp, G=ev.G;
        if(grupos[k]){ grupos[k].matched.push(ev); return; }
        grupos[k]={ seq:seq++, gen:true, tipo:"sub", base:G.base, extra:G.extra, t:G.t, half:G.half, title:"Cambio", desc:"", matched:[ev] };
        items.push(grupos[k]); return;
      }
      // Encabezado con el jugador (el código de su selección lo agrega la pantalla).
      const title = ev.tipo==="penmiss" ? `Penal fallado por ${ev.player}`
                  : ev.tipo==="goal" ? (ev.og?`Gol en contra de ${ev.player}`:`Gol de ${ev.player}`)
                  : (ev.tipo==="red"?`Tarjeta roja para ${ev.player}`:`Tarjeta amarilla para ${ev.player}`);
      items.push({ seq:seq++, gen:true, tipo:ev.tipo, base:ev.base, extra:ev.extra, t:ev.t, half:ev.half, title, desc:"", matched:[ev] });
    });

    // Cambios del MISMO grupo (equipo + ventana ±2'): un solo mensaje, en el minuto del primer cambio.
    const porEquipo={};
    items.filter(it=>it.tipo==="sub" && it.matched.length).forEach(it=>{
      const k=it.matched[0].grp;
      (porEquipo[k]=porEquipo[k]||[]).push(it);
    });
    Object.keys(porEquipo).forEach(k=>{
      const g=porEquipo[k]; if(g.length<2) return;
      // Si el grupo tiene bloque(s) del relato, manda el relato: se muestra su texto una sola vez.
      // El texto propio del motor solo se usa cuando el grupo no tiene ningún bloque.
      const rel=g.filter(x=>!x.gen);
      const head=rel.length ? rel[0] : g[0];
      head.matched=[].concat(...g.map(x=>x.matched));
      head.seq=Math.min(...g.map(x=>x.seq));
      const G=head.matched[0].G; head.base=G.base; head.extra=G.extra; head.t=G.t; head.half=G.half;
      if(rel.length){ if(rel.length>1) head.desc=rel.map(x=>x.desc).filter(Boolean).join(" "); }
      else { head.gen=true; head.desc=""; head.title="Cambio"; }
      g.filter(x=>x!==head).forEach(x=>{ const i=items.indexOf(x); if(i>=0) items.splice(i,1); });
    });

    // Silbatazos que falten.
    // Cada silbatazo vale UNA sola vez: si el relato repite uno (dos "Final del partido"), el segundo
    // se queda como texto, sin silbato ni efecto.
    // Respaldo por POSICIÓN para el relato que no se reconoció como silbatazo: el primer bloque del 0'
    // es el inicio; el último bloque del añadido de cada tiempo que hable de final/descanso, el cierre.
    if(!items.some(it=>it.silbato==="k1")){
      const k=items.find(it=>!it.previo && it.half===1 && it.base===0 && it.tipo==="texto");
      if(k){ k.silbato="k1"; k.tipo="silbato"; }
    }
    const RX_CIERRE=/final|termin|acab|conclu|pitazo|silbat|descanso|vestidor|se van al/;
    if(!items.some(it=>it.silbato==="ht")){
      const c=items.filter(it=>!it.previo && it.half===1 && it.base>=45 && it.tipo==="texto" && RX_CIERRE.test(nl(it.title+" "+it.desc))).pop();
      if(c){ c.silbato="ht"; c.tipo="silbato"; }
    }
    if(TE){
      if(!items.some(it=>it.silbato==="fr")){
        const c=items.filter(it=>!it.previo && it.half===2 && it.base>=90 && it.tipo==="texto" && RX_CIERRE.test(nl(it.title+" "+it.desc))).pop();
        if(c){ c.silbato="fr"; c.tipo="silbato"; }
      }
      if(!items.some(it=>it.silbato==="ft")){
        const c=items.filter(it=>!it.previo && it.half===4 && it.base>=120 && it.tipo==="texto" && RX_CIERRE.test(nl(it.title+" "+it.desc))).pop();
        if(c){ c.silbato="ft"; c.tipo="silbato"; }
      }
    } else if(!items.some(it=>it.silbato==="ft")){
      const c=items.filter(it=>!it.previo && it.half===2 && it.base>=90 && it.tipo==="texto" && RX_CIERRE.test(nl(it.title+" "+it.desc))).pop();
      if(c){ c.silbato="ft"; c.tipo="silbato"; }
    }
    const vistos={};
    items.forEach(it=>{
      if(!it.silbato) return;
      const prev=vistos[it.silbato];
      if(!prev){ vistos[it.silbato]=it; return; }
      if(Math.abs(it.t-prev.t)<=1) it.borrar=true;        // el mismo silbatazo dos veces: se queda solo el primero
      else { it.silbato=null; it.tipo="texto"; }
    });
    for(let i=items.length-1;i>=0;i--) if(items[i].borrar) items.splice(i,1);
    const tiene=w=>items.some(it=>it.silbato===w);
    if(!tiene("k1")){
      // Texto informal: nombre formal ≈75% o corto ≈25% ("el Azteca"); si el apodo es el principal, 85% apodo / 15% oficial.
      let sede=""; try{ if(typeof fixtureStadiumCasualName==="function") sede=fixtureStadiumCasualName(f, {prep:"en", rnd:rng(f.id+"|sede")()}); }catch(e){}
      items.push({ seq:-2, gen:true, tipo:"silbato", silbato:"k1", base:0, extra:0, t:0, half:1, title:"Saque inicial", desc: sede ? `Rueda el balón ${sede}. Empieza la primera parte.` : "Empieza la primera parte.", matched:[] });
    }
    const maxT=h=>items.filter(it=>it.half===h).reduce((m,it)=>Math.max(m,it.t), [0,45,90,105,120][h]);
    const repo=reposicionGenerada(f);
    if(!tiene("ht")){ const t=Math.max(maxT(1), 45+repo[1]); items.push({ seq:seq++, gen:true, tipo:"silbato", silbato:"ht", base:45, extra:Math.max(0,t-45), t, half:1, title:"Final de la primera parte", desc:"", matched:[] }); }
    if(!tiene("k2")) items.push({ seq:-1, gen:true, tipo:"silbato", silbato:"k2", base:45, extra:0, t:45, half:2, title:"Saque inicial", desc:"Empieza la segunda parte.", matched:[] });
    if(TE){
      // Tiempo extra: fin de los 90 (el 1er valor del FT), dos tiempos de 15' y el final (el 2º valor del FT).
      if(!tiene("fr")){
        const rp=f.ftReg ? partesMin(f.ftReg) : {base:90, extra:repo[2]}; const t=Math.max(maxT(2), rp.base+rp.extra);
        items.push({ seq:seq++, gen:true, tipo:"silbato", silbato:"fr", base:90, extra:Math.max(0,t-90), t, half:2, title:"Final del tiempo reglamentario", desc:"", matched:[] });
      }
      if(!tiene("e1")) items.push({ seq:-1, gen:true, tipo:"silbato", silbato:"e1", base:90, extra:0, t:90, half:3, title:"Comienza el tiempo extra", desc:"Empieza el primer tiempo extra.", matched:[] });
      if(!tiene("eht")){ const t=maxT(3); items.push({ seq:seq++, gen:true, tipo:"silbato", silbato:"eht", base:105, extra:Math.max(0,t-105), t, half:3, title:"Final del primer tiempo extra", desc:"", matched:[] }); }
      if(!tiene("e2")) items.push({ seq:-1, gen:true, tipo:"silbato", silbato:"e2", base:105, extra:0, t:105, half:4, title:"Saque inicial", desc:"Empieza el segundo tiempo extra.", matched:[] });
      if(!tiene("ft")){
        const ftp=f.ftMin ? partesMin(f.ftMin) : {base:120, extra:0}; const t=Math.max(maxT(4), ftp.base+ftp.extra);
        items.push({ seq:seq++, gen:true, tipo:"silbato", silbato:"ft", base:120, extra:Math.max(0,t-120), t, half:4, title:"Final del partido", desc:"", matched:[] });
      }
    } else if(!tiene("ft")){
      // El final lo marca el informe (FT 90+5'); si no viene, se usa la reposición generada de la sesión.
      const ftp=f.ftMin ? partesMin(f.ftMin) : {base:90, extra:repo[2]}; const t=Math.max(maxT(2), ftp.base+ftp.extra);
      items.push({ seq:seq++, gen:true, tipo:"silbato", silbato:"ft", base:90, extra:Math.max(0,t-90), t, half:2, title:"Final del partido", desc:"", matched:[] });
    }
    // El arranque del 2T va SIEMPRE al 45' con el reloj en 45:00; los cambios del descanso (y lo demás del
    // 45') se anuncian ANTES del silbatazo.
    items.forEach(it=>{ if(it.silbato==="k2"){ it.base=45; it.extra=0; it.t=45; it.half=2; } });
    // Igual el arranque de cada tiempo extra: 90:00 y 105:00.
    items.forEach(it=>{ if(it.silbato==="e1"){ it.base=90; it.extra=0; it.t=90; it.half=3; } if(it.silbato==="e2"){ it.base=105; it.extra=0; it.t=105; it.half=4; } });
    const prio=it=> it.silbato==="k1" ? 0 : ((it.silbato==="k2"||it.silbato==="e1"||it.silbato==="e2") ? 2 : ((SIL_DESCANSO.has(it.silbato)||it.silbato==="ft") ? 3 : 1));
    items.sort((a,b)=> a.half-b.half || a.t-b.t || prio(a)-prio(b) || a.seq-b.seq);
    items.forEach(it=>{ it.minLabel = it.half===0 ? "" : etiquetaMin(it.base, it.extra); });
    // El reloj NO se detiene en minutos exactos: un suceso del minuto 17' ocurre en algún segundo entre
    // 16:00 y 17:00 (sorteado con la semilla del partido; varios del mismo minuto, en orden y en segundos
    // distintos). El arranque de cada tiempo (0:00 y 45:00) se queda exacto.
    // ACCIONES LIGADAS (rebote, rechace, córner tras un remate, "acto seguido"…): la segunda cae pocos
    // segundos después de la primera, sobre todo en el mismo minuto; si la primera fue al final del minuto
    // anterior, la segunda va al inicio del suyo.
    const rs=rng(f.id+"|seg");
    const RX_LIGADA=/rebot|rechac|rechaz|segunda jugada|acto seguido|a continuacion|de inmediato|inmediatamente|en la misma jugada|tras el (remate|disparo|tiro|cabezazo|corner|saque)|tras la (atajada|parada|jugada)|despeje|aprovecha el|el balon queda|le queda el balon|sobre el rebote|remata de nuevo|vuelve a rematar|repite/;
    const esTiro=x=> /remate|disparo|^tiro(?! de esquina| libre)|cabezazo|chut|atajad|parad|bloquead/.test(x);
    const ligada=(prev, it)=>{
      if(!prev || prev.half!==it.half || prev.half===0) return false;
      const pt=nl(prev.title+" "+prev.desc), ct=nl(it.title+" "+it.desc), ti=nl(it.title).replace(/^[^a-z0-9]+/,"");
      if(RX_LIGADA.test(ct)) return true;
      if(esTiro(nl(prev.title)) && /esquina|corner/.test(ti)) return true;            // córner tras remate/atajada
      if(/esquina|corner/.test(nl(prev.title)) && (esTiro(ti) || it.tipo==="goal")) return true;   // remate/gol tras córner
      if(/falta/.test(nl(prev.title)) && /amarilla|amonest|roja|tiro libre/.test(ti)) return true; // tarjeta tras la falta
      return false;
    };
    const orig=items.map(it=>it.t);
    const exacto=(k)=>{ const it=items[k]; return it.half===0 || orig[k]<=0 || (it.half===2 && orig[k]<=45) || (it.half===3 && orig[k]<=90) || (it.half===4 && orig[k]<=105); };
    const PASO=1/60;   // un segundo en minutos
    for(let k=0;k<items.length;k++){
      if(exacto(k)) continue;
      const it=items[k], hi=orig[k], lo=hi-1;
      const prev = k>0 ? items[k-1] : null;
      const mismoMin = prev && !exacto(k-1) && prev.half===it.half && orig[k-1]===hi;
      // ¿cuántos sucesos quedan en este minuto después de este? (para dejarles espacio)
      let resto=0; for(let q=k+1;q<items.length && items[q].half===it.half && orig[q]===hi; q++) resto++;
      const techo=hi - 0.01 - resto*2*PASO;
      if(ligada(prev, it)){
        const gap=(3 + rs()*7)*PASO;   // 3 a 10 segundos después
        if(mismoMin){ it.t=Math.min(techo, prev.t+gap); }
        else if(prev && !exacto(k-1) && prev.half===it.half && orig[k-1]===hi-1){
          // la anterior fue el minuto previo: se va al final de su minuto y esta al inicio del suyo
          // Si la anterior ya venía encadenada (p. ej. atajada → córner), se recorre TODA la cadena de su
          // minuto, conservando sus segundos de separación.
          const meta=(hi-1) - (2+rs()*6)*PASO, delta=meta-prev.t;
          if(delta>0){
            let m=k-1; const cadena=[m];
            while(m>0 && !exacto(m-1) && orig[m-1]===orig[k-1] && items[m-1].half===it.half && ligada(items[m-1], items[m])){ m--; cadena.push(m); }
            cadena.forEach(q=>{ items[q].t += delta; });
          }
          it.t=Math.min(techo, lo + (1+rs()*5)*PASO);
        } else it.t = lo + 0.04 + rs()*0.5;
      } else {
        const piso = mismoMin ? prev.t + 2*PASO : lo + 0.04;
        it.t = piso + rs()*Math.max(0, techo-piso);
      }
      // Primer minuto de cada tiempo: una jugada no puede pasar al 00:05 ni al 45:03; desde el saque
      // inicial hacen falta unos 12–15 segundos para que ocurra algo elaborado.
      const kick = [0,0,45,90,105][it.half]||0;
      if(!it.silbato && lo===kick){ const minT=kick + (12 + rs()*3)*PASO; if(it.t<minT) it.t=Math.min(Math.max(minT, it.t), hi-0.01); }
      if(mismoMin && it.t<=prev.t) it.t=prev.t+PASO;   // siempre después de la anterior
    }
    // SECCIÓN POST: después del silbatazo final, en el orden del relato y sin reloj. El JUGADOR DEL PARTIDO
    // («Superior Player of the Match» en el Mundial, «Jugador del partido» en otros torneos oficiales) va
    // siempre aquí, cotejado con la línea JDP del informe; sin JDP (amistosos) no se muestra. Si el relato no
    // trae el bloque pero el informe sí tiene JDP, el motor redacta uno.
    try{
      const ft=items.find(x=>x.silbato==="ft");
      const JP=window.JugadorPartido, P=(JP && JP.potmOf) ? JP.potmOf(f) : null;
      const RXP=/^[^a-z0-9]*(superior player of the match|jugador del partido)/;
      const lista=[];
      posts.forEach(r=>{
        const it={ seq:r.seq, post:true, base:0, extra:0, title:r.title, desc:r.desc, tipo:"texto", silbato:null, matched:[], gen:false };
        if(RXP.test(nl(r.title))){
          if(!P) return;   // sin JDP: no se muestra
          if(lista.some(x=>x.potm)) return;   // uno solo
          it.potm=true;
          const ap=nl(P.name).split(" ").pop();
          if(ap && nl(r.title+" "+r.desc).indexOf(ap)<0){ try{ console.warn(`[Motor de partido] "${r.title}" no nombra a ${P.name} (JDP del informe).`); }catch(e){} }
        }
        lista.push(it);
      });
      if(P && !lista.some(x=>x.potm)){
        const eq=P.team ? (P.team.commonName||P.team.name||"") : "";
        lista.unshift({ seq:seq++, post:true, gen:true, potm:true, tipo:"texto", base:0, extra:0, title:`${JP.potmTitle(f)}: ${P.name}`, desc:`${P.name}${eq?", de "+eq+",":""} es elegido ${JP.esMundial(f)?"el ":""}${JP.potmTitle(f)}.`, matched:[] });
      }
      const fin = ft || items[items.length-1];
      // TANDA DE PENALES: después del silbatazo final y antes de la sección Post, tiro por tiro en el orden
      // real ("PENALES" en lugar del minuto), con el marcador de la tanda y el resultado al final.
      const tiros=Array.isArray(f.penaltyShots)?f.penaltyShots:[];
      if(tiros.length || f.penalties){
        const TA=getTeam(f.teamA), TB=getTeam(f.teamB), cA=codigo(TA), cB=codigo(TB);
        const tanda=[{ seq:seq++, gen:true, tanda:true, tipo:"texto", title:"Tanda de penales", desc:`${nombreEq(TA)} y ${nombreEq(TB)} se juegan el pase desde los once metros.`, matched:[] }];
        let a=0, b=0; const n={};
        tiros.forEach(sh=>{
          const esA = sh.teamId===f.teamA; n[sh.teamId]=(n[sh.teamId]||0)+1;
          if(sh.scored){ if(esA) a++; else b++; }
          const eq=esA?TA:TB;
          tanda.push({ seq:seq++, gen:true, tanda:true, tiro:sh, anotado:!!sh.scored, teamId:sh.teamId, tipo:"texto",
            title: sh.scored ? `Penal anotado por ${sh.player}` : `Penal fallado por ${sh.player}`,
            desc: `${sh.player} ${sh.scored?"anota":"falla"} el ${n[sh.teamId]}º penal de ${nombreEq(eq)}.`,
            marcadorTanda:`${cA} ${a}-${b} ${cB}`, matched:[] });
        });
        const P=f.penalties || (tiros.length ? {a, b} : null);
        if(P && P.a!==P.b){
          const g=P.a>P.b?TA:TB;
          tanda.push({ seq:seq++, gen:true, tanda:true, teamId:g.id, tipo:"texto", title:`¡${nombreEq(g)} gana en penales!`,
            desc:`${nombreEq(g)} se impone ${Math.max(P.a,P.b)}-${Math.min(P.a,P.b)} en la tanda de penales.`, marcadorTanda:`${cA} ${P.a}-${P.b} ${cB}`, matched:[] });
        }
        tanda.forEach(it=>{ Object.assign(it, { half: fin ? fin.half : 2, t: fin ? fin.t : 90, base:0, extra:0, minLabel:"" }); items.push(it); });
      }
      lista.forEach(it=>{
        if(it.potm) it.potmTeam = P ? (P.team||null) : null;
        Object.assign(it, { half: fin ? fin.half : 2, t: fin ? fin.t : 90, minLabel:"" });
        items.push(it);
      });
    }catch(e){}
    return items;
  }

  /* =========================================================
     SILBATAZOS (Web Audio, sin archivos)
     ========================================================= */
  let AC=null;
  function audio(){
    try{
      if(!AC){ const C=window.AudioContext||window.webkitAudioContext; if(!C) return null; AC=new C(); }
      if(AC.state==="suspended") AC.resume();
      return AC;
    }catch(e){ return null; }
  }
  // Un pitido de silbato de bola: tono agudo con el "trino" del balín (vibrato + trémolo) y algo de aire.
  function pitido(ctx, t0, dur){
    const out=ctx.createGain();
    out.gain.setValueAtTime(0.0001,t0);
    out.gain.exponentialRampToValueAtTime(0.20,t0+0.025);
    out.gain.setValueAtTime(0.20,t0+Math.max(0.03,dur-0.07));
    out.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    out.connect(ctx.destination);
    const amp=ctx.createGain(); amp.gain.value=0.72; amp.connect(out);
    const tr=ctx.createOscillator(); tr.frequency.value=29; const trg=ctx.createGain(); trg.gain.value=0.28; tr.connect(trg); trg.connect(amp.gain);
    [[2780,1],[5590,0.14]].forEach(([fr,g])=>{
      const o=ctx.createOscillator(); o.type="sine"; o.frequency.value=fr;
      const vib=ctx.createOscillator(); vib.frequency.value=29; const vg=ctx.createGain(); vg.gain.value=fr*0.035; vib.connect(vg); vg.connect(o.frequency);
      const gg=ctx.createGain(); gg.gain.value=g; o.connect(gg); gg.connect(amp);
      o.start(t0); o.stop(t0+dur+0.05); vib.start(t0); vib.stop(t0+dur+0.05);
    });
    const n=ctx.createBufferSource(); const len=Math.ceil(ctx.sampleRate*(dur+0.05)); const buf=ctx.createBuffer(1,len,ctx.sampleRate); const d=buf.getChannelData(0); for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    n.buffer=buf; const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=3000; bp.Q.value=3; const ng=ctx.createGain(); ng.gain.value=0.10;
    n.connect(bp); bp.connect(ng); ng.connect(amp); n.start(t0); n.stop(t0+dur+0.05);
    tr.start(t0); tr.stop(t0+dur+0.05);
  }
  // Patrones: inicio = 1 largo · medio tiempo = corto + largo · final = corto, corto, largo.
  // gol = el árbitro valida el gol con un silbatazo firme.
  const PATRONES={ k1:[0.95], k2:[0.95], ht:[0.32,0.95], ft:[0.3,0.3,1.35], gol:[0.7], e1:[0.95], e2:[0.95], fr:[0.32,0.95], eht:[0.32,0.95] };
  let SILBATO_HASTA=0;
  function silbatazo(tipo){
    const ctx=audio(); if(!ctx) return;
    let t=ctx.currentTime+0.05;
    (PATRONES[tipo]||[0.6]).forEach(d=>{ pitido(ctx,t,d); t+=d+0.17; });
    SILBATO_HASTA=Math.max(SILBATO_HASTA, t);   // hasta cuándo suena (para no cortarlo al pausar)
  }

  /* ---------- AFICIÓN (ambiente del estadio, sintetizado) ----------
     Murmullo constante de la tribuna (ruido rosado filtrado con oleadas lentas) que reacciona a lo que
     pasa: rugido en los goles, "uuuh" en remates y ocasiones, abucheo/silbidos en tarjetas, aplauso en
     los silbatazos de medio tiempo y final, y un murmullo bajo durante el descanso. Suena solo mientras
     el partido corre (en pausa el audio se suspende). Volumen: CFG.AFICION_VOL (0 = sin afición). */
  let AF=null;
  function ruidoRosa(ctx, seg){
    const n=Math.floor(ctx.sampleRate*seg), buf=ctx.createBuffer(2, n, ctx.sampleRate);
    for(let ch=0; ch<2; ch++){
      const d=buf.getChannelData(ch); let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0,b6=0;
      for(let i=0;i<n;i++){
        const w=Math.random()*2-1;
        b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759; b2=0.96900*b2+w*0.1538520;
        b3=0.86650*b3+w*0.3104856; b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
        d[i]=(b0+b1+b2+b3+b4+b5+b6+w*0.5362)*0.11; b6=w*0.115926;
      }
    }
    return buf;
  }
  function aficionIniciar(){
    if(!(CFG.AFICION_VOL>0) || !CFG.AFICION_SINTETICA) return null;
    const ctx=audio(); if(!ctx) return null;
    if(AF && AF.ctx===ctx) return AF;
    try{
      const buf=ruidoRosa(ctx, 6);
      const master=ctx.createGain(); master.gain.value=0; master.connect(ctx.destination);
      // Capa grave (murmullo) y capa media (voces) con oleadas lentas independientes.
      const capa=(f, q, nivel, lfoHz)=>{
        const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true; src.loopStart=Math.random()*2; 
        const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=f; bp.Q.value=q;
        const g=ctx.createGain(); g.gain.value=nivel;
        const lfo=ctx.createOscillator(); lfo.frequency.value=lfoHz; const lg=ctx.createGain(); lg.gain.value=nivel*0.35;
        lfo.connect(lg); lg.connect(g.gain);
        src.connect(bp); bp.connect(g); g.connect(master);
        src.start(ctx.currentTime, Math.random()*5); lfo.start();
        return { bp, g };
      };
      const grave=capa(420, 0.8, 0.9, 0.07), voces=capa(1100, 1.1, 0.55, 0.13);
      // Capa del rugido (más aguda), en silencio hasta que hay un gol o una ocasión.
      const ru=ctx.createBufferSource(); ru.buffer=buf; ru.loop=true;
      const ruf=ctx.createBiquadFilter(); ruf.type="bandpass"; ruf.frequency.value=1500; ruf.Q.value=0.7;
      const rug=ctx.createGain(); rug.gain.value=0;
      ru.connect(ruf); ruf.connect(rug); rug.connect(ctx.destination); ru.start(ctx.currentTime, 2.5);
      // Silbidos/abucheos (tono agudo con vibrato) para tarjetas y polémicas.
      AF={ ctx, buf, master, grave, voces, rug, ruf, base:0.35 };   // ≈ -30 dB: de fondo, sin tapar el silbato
      aficionNivel(AF.base, 1.5);
    }catch(e){ AF=null; }
    return AF;
  }
  function aficionNivel(v, seg){
    if(!AF) return; const t=AF.ctx.currentTime;
    const vol=volAf();
    AF.master.gain.cancelScheduledValues(t);
    AF.master.gain.setTargetAtTime(v*vol, t, Math.max(0.05, (seg||1)/3));
  }
  // Oleada: sube la capa del rugido a 'pico' en 'sube' s, se sostiene 'dura' s y baja en 'baja' s.
  function aficionOleada(pico, sube, dura, baja, frec){
    if(!AF) return; const t=AF.ctx.currentTime, g=AF.rug.gain, vol=volAf();
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(pico*vol, t+sube);
    g.setValueAtTime(pico*vol, t+sube+dura);
    g.linearRampToValueAtTime(0, t+sube+dura+baja);
    if(frec){ AF.ruf.frequency.cancelScheduledValues(t); AF.ruf.frequency.setValueAtTime(frec, t); AF.ruf.frequency.linearRampToValueAtTime(1500, t+sube+dura+baja); }
  }
  function silbidosAficion(){
    if(!AF) return; const ctx=AF.ctx, vol=volAf(); if(!vol) return;
    for(let i=0;i<6;i++){
      const t0=ctx.currentTime+Math.random()*0.6, dur=0.5+Math.random()*0.7;
      const o=ctx.createOscillator(); o.type="sine"; o.frequency.setValueAtTime(1800+Math.random()*900, t0);
      o.frequency.linearRampToValueAtTime(1500+Math.random()*900, t0+dur);
      const g=ctx.createGain(); g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.03*vol, t0+0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0+dur);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0+dur+0.05);
    }
  }
  // ---- Voces de la tribuna (sintetizadas): muchas voces desafinadas entre sí, con un formante de vocal,
  // para "uuuh", "ooooh" (lamento) y "buuu" (abucheo). Curva de tono: inicio → pico → final.
  function vocesTribuna(n, f0, fPico, fFin, dur, nivel, formante){
    if(!AF || !(nivel>0)) return; const ctx=AF.ctx, t0=ctx.currentTime+0.02, vol=volAf();
    const out=ctx.createGain(); out.gain.value=0;
    const bp=ctx.createBiquadFilter(); bp.type="bandpass"; bp.frequency.value=formante; bp.Q.value=1.2;
    const lp=ctx.createBiquadFilter(); lp.type="lowpass"; lp.frequency.value=1400;
    bp.connect(lp); lp.connect(out); out.connect(ctx.destination);
    for(let i=0;i<n;i++){
      const o=ctx.createOscillator(); o.type=i%3?"sawtooth":"triangle";
      const k=0.82+Math.random()*0.4, desf=Math.random()*0.18*dur;           // cada voz con su tono y su entrada
      o.frequency.setValueAtTime(f0*k, t0+desf);
      o.frequency.linearRampToValueAtTime(fPico*k, t0+desf+dur*0.35);
      o.frequency.linearRampToValueAtTime(fFin*k, t0+dur);
      const vib=ctx.createOscillator(); vib.frequency.value=4+Math.random()*3; const vg=ctx.createGain(); vg.gain.value=f0*k*0.02; vib.connect(vg); vg.connect(o.frequency);
      const g=ctx.createGain(); g.gain.value=1/n;
      o.connect(g); g.connect(bp); o.start(t0+desf); o.stop(t0+dur+0.3); vib.start(t0); vib.stop(t0+dur+0.3);
    }
    // Ruido de fondo de las mismas voces (aire), para que no suene a órgano.
    const nz=ctx.createBufferSource(); nz.buffer=AF.buf; const nf=ctx.createBiquadFilter(); nf.type="bandpass"; nf.frequency.value=formante*1.4; nf.Q.value=0.9;
    const ng=ctx.createGain(); ng.gain.value=0.9; nz.connect(nf); nf.connect(ng); ng.connect(out); nz.start(t0, Math.random()*3); nz.stop(t0+dur+0.3);
    out.gain.setValueAtTime(0.0001, t0);
    out.gain.linearRampToValueAtTime(nivel*vol*0.5, t0+dur*0.25);
    out.gain.setValueAtTime(nivel*vol*0.5, t0+dur*0.55);
    out.gain.linearRampToValueAtTime(0.0001, t0+dur);
  }
  // Aplauso: cientos de palmadas cortas (ráfagas de ruido) con densidad que sube y se apaga.
  function aplausoTribuna(dur, nivel){
    if(!AF || !(nivel>0)) return; const ctx=AF.ctx, t0=ctx.currentTime+0.02, vol=volAf();
    const sr=ctx.sampleRate, len=Math.floor(sr*dur), buf=ctx.createBuffer(2, len, sr);
    for(let ch=0; ch<2; ch++){
      const d=buf.getChannelData(ch); const total=Math.floor(dur*260);
      for(let c=0;c<total;c++){
        const u=Math.random(); const t=dur*(u<0.5? Math.sqrt(u*0.5) : 1-Math.sqrt((1-u)*0.5));   // más palmadas al centro
        const i0=Math.floor(t*sr), L=Math.floor(sr*(0.004+Math.random()*0.006)), a=0.25+Math.random()*0.5;
        for(let i=0;i<L && i0+i<len;i++) d[i0+i]+= (Math.random()*2-1)*a*Math.exp(-i/(L*0.3));
      }
    }
    const src=ctx.createBufferSource(); src.buffer=buf;
    const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=700;
    const pk=ctx.createBiquadFilter(); pk.type="peaking"; pk.frequency.value=2200; pk.gain.value=4;
    const g=ctx.createGain(); g.gain.value=nivel*vol*0.35;
    src.connect(hp); hp.connect(pk); pk.connect(g); g.connect(ctx.destination); src.start(t0);
  }
  // Reacción de la tribuna (sintetizada). Cada reacción suena con la fuerza de la afición que reacciona.
  function aficionSinteticaPorSuceso(it, gol){
    if(!aficionIniciar()) return;
    const txt=nl((it.title||"")+" "+(it.desc||""));
    if(SIL_DESCANSO.has(it.silbato)){ aplausoTribuna(5, 0.8); aficionNivel(0.15, 4); return; }                         // aplauso y descanso
    if(it.silbato==="ft"){ aplausoTribuna(7, 1); aficionOleada(0.6, 0.3, 2, 5, 1000); aficionNivel(0.0, 12); return; }
    if(SIL_ARRANQUE.has(it.silbato)){ aficionNivel(AF.base, 1.5); aplausoTribuna(4, 0.6); aficionOleada(0.35, 0.4, 1, 2.5, 1200); return; }
    const tid = (it.matched && it.matched[0]) ? null : equipoDeSuceso(it);
    if(gol){
      const ev=it.matched.find(e=>e.tipo==="goal"); const anota=ev ? ev.teamId : tid;
      // Afición neutral (Mundial sin anfitrión en la cancha): los dos goles se celebran igual.
      const neutral=aficionNeutral(), sA=neutral ? 1 : apoyo(anota), sB=neutral ? 0 : 1-sA;
      aficionOleada(1.9*Math.max(0.22, sA), 0.25, 3.5, 5, 1900);                                       // ¡GOL!
      if(sA>=0.5) aplausoTribuna(6, sA);
      if(sB>0.3) vocesTribuna(28, 300, 270, 170, 2.6, sB*0.9, 380);                                       // "ooooh" (lamento)
      return;
    }
    if(it.tipo==="red" || it.tipo==="yellow"){
      const ev=it.matched[0]; const team=ev ? ev.teamId : tid; const sh=apoyo(team)*(it.tipo==="red"?1:0.65);
      vocesTribuna(30, 150, 165, 140, it.tipo==="red"?3.2:2.2, sh, 300);                                  // "buuu"
      if(sh>0.4) silbidosAficion();
      if(it.tipo==="red") aficionOleada(0.4, 0.2, 1.2, 2, 1300);
      return;
    }
    if(/^(falta|mano)\b/.test(nl(it.title||"").replace(/^[^a-z0-9]+/,""))){
      if(tid){ const sh=apoyo(tid)*0.55; vocesTribuna(22, 150, 160, 140, 1.6, sh, 300); if(sh>0.4) silbidosAficion(); }   // protesta
      return;
    }
    if(/poste|travesano|larguero|al palo|se va (desviado|por encima|rozando)|ocasion|atajad|paradon|salvad|remate|disparo|cabezazo|tiro (a puerta|desviado|bloqueado)/.test(txt)){
      const sh=tid ? Math.max(0.2, aficionNeutral()?0.8:apoyo(tid)) : 0.5;
      vocesTribuna(30, 230, 360, 260, 1.9, sh, 520);                                                      // "uuuh"
      aficionOleada(0.35*sh, 0.18, 0.5, 1.4, 1300);
      return;
    }
    if(/(^|[^a-z])var([^a-z]|$)|penal/.test(txt)){ aficionOleada(0.4, 0.4, 1.5, 2, 1100); return; }
  }
  // ¿Suena la cortinilla en este partido? (por defecto, solo en la Copa del Mundo)
  function cortinillaActiva(){
    const c=CFG.CORTINILLA; if(c===true) return true; if(!c) return false;
    const f=S.f; if(f.friendly || f.stage==="amistoso") return false;
    return (typeof matchIsWorldCup==="function") ? matchIsWorldCup(f) : false;
  }
  // ¿Afición neutral? Ningún equipo juega en su país (p. ej. un partido del Mundial sin anfitrión).
  function aficionNeutral(){ apoyo(S.f.teamA); return S.apoyoA===0.6; }

  /* ---------- AFICIÓN CON GRABACIONES REALES ----------
     Archivos de audio en la carpeta CFG.AFICION_CARPETA (por defecto "sonidos/"), junto al juego:
       aficion-ambiente.mp3  → ambiente de la tribuna (se repite en bucle durante el partido)
       aficion-gol.mp3       → celebración de gol
       aficion-lamento.mp3   → lamento/decepción (gol en contra)
       aficion-uuh.mp3       → "uuuh" de una ocasión fallada
       aficion-abucheo.mp3   → abucheo/silbidos (tarjetas y faltas en contra)
       aficion-aplauso.mp3   → aplauso (silbatazos de inicio, medio tiempo y final)
     Se cargan con <audio> (funciona abriendo el juego con doble clic). Si falta alguno, ese sonido no suena.
     REPARTO DE LA TRIBUNA: el que juega en su país tiene ≈85% del estadio; en cancha neutral (Mundial,
     amistoso fuera) el local tiene ≈60%. Cada reacción suena con la fuerza de la afición que reacciona:
     un gol del visitante en casa ajena = celebración pequeña + lamento grande. */
  const SONIDOS_AFICION=["ambiente","gol","lamento","uuh","abucheo","aplauso"];
  let AUD=null;
  function audAficion(){
    if(AUD) return AUD;
    AUD={ ok:{}, el:{} };
    SONIDOS_AFICION.forEach(n=>{
      const a=new Audio(); a.preload="auto";
      a.addEventListener("canplaythrough", ()=>{ AUD.ok[n]=true; }, { once:true });
      a.addEventListener("error", ()=>{ AUD.ok[n]=false; }, { once:true });
      a.src=CFG.AFICION_CARPETA+"aficion-"+n+".mp3";
      if(n==="ambiente") a.loop=true;
      AUD.el[n]=a;
    });
    return AUD;
  }
  const volAf=()=>Math.max(0, Math.min(1, +CFG.AFICION_VOL||0));
  // Fundido de volumen de un <audio> (sin Web Audio).
  function fundido(a, meta, ms){
    if(!a) return; clearInterval(a._fd); const ini=a.volume, t0=performance.now();
    a._fd=setInterval(()=>{ const k=Math.min(1,(performance.now()-t0)/Math.max(1,ms)); a.volume=Math.max(0,Math.min(1, ini+(meta-ini)*k)); if(k>=1){ clearInterval(a._fd); if(meta<=0.001) a.pause(); } }, 40);
  }
  function ambienteNivel(nivel, ms){
    const A=audAficion(), a=A.el.ambiente; if(!a || A.ok.ambiente===false) return;
    const v=nivel*volAf();
    if(v>0 && a.paused){ a.volume=0; const pr=a.play(); if(pr && pr.catch) pr.catch(()=>{}); }
    fundido(a, v, ms||1200);
  }
  function efecto(n, nivel){
    const A=audAficion(), base=A.el[n]; if(!base || A.ok[n]===false) return;
    const v=Math.max(0, Math.min(1, nivel*volAf())); if(v<0.02) return;
    const a=base.cloneNode(); a.volume=v; const pr=a.play(); if(pr && pr.catch) pr.catch(()=>{});
    (S && (S.sonando=S.sonando||[])).push(a);
    a.addEventListener("ended", ()=>{ if(S && S.sonando){ const i=S.sonando.indexOf(a); if(i>=0) S.sonando.splice(i,1); } });
  }
  function silenciarAficion(pausa){
    if(AUD && AUD.el.ambiente){ clearInterval(AUD.el.ambiente._fd); AUD.el.ambiente.pause(); }
    if(S && S.sonando){ S.sonando.forEach(a=>{ try{ a.pause(); }catch(e){} }); if(!pausa) S.sonando=[]; }
  }
  function reanudarAficion(){
    if(S && S.sonando) S.sonando.forEach(a=>{ try{ if(a.currentTime<a.duration) a.play().catch(()=>{}); }catch(e){} });
  }
  // Parte de la tribuna que apoya a cada equipo (0..1).
  function apoyo(teamId){
    if(!S) return 0.5;
    if(S.apoyoA==null){
      let pais="";
      try{ const st=(typeof findStadiumForVenue==="function" && S.f.venue) ? findStadiumForVenue(S.f.venue) : null; pais=nl((st&&st.country)||""); }catch(e){}
      const enCasa=t=> !!pais && [t&&t.commonName, t&&t.name, t&&t.officialName].filter(Boolean).some(n=>nl(n)===pais);
      S.apoyoA = enCasa(S.A) ? 0.85 : (enCasa(S.B) ? 0.15 : 0.6);
    }
    return teamId===S.f.teamA ? S.apoyoA : 1-S.apoyoA;
  }
  // Equipo de la acción de un suceso (el mismo criterio de la bandera del encabezado).
  function equipoDeSuceso(it){
    try{
      const a={}, b={}; conNegritas(it.title||"", null, {sinCodigo:true, out:a}); const d=textoDe(it); if(d) conNegritas(d, null, {sinCodigo:true, out:b});
      const T=equipoAccion(it, { ti:a.lista||[], de:b.lista||[] }); return T ? T.id : null;
    }catch(e){ return null; }
  }
  function aficionPorSuceso(it, gol){
    if(CFG.AFICION_SINTETICA){ const A=audAficion(); if(A.ok.ambiente!==true){ aficionSinteticaPorSuceso(it, gol); return; } }
    if(!(volAf()>0)) return;
    const t=nl((it.title||"")+" "+(it.desc||""));
    if(SIL_DESCANSO.has(it.silbato)){ efecto("aplauso", 0.7); ambienteNivel(0.25, 3000); return; }
    if(it.silbato==="ft"){ efecto("aplauso", 0.9); ambienteNivel(0, 9000); return; }
    if(SIL_ARRANQUE.has(it.silbato)){ ambienteNivel(0.6, 1500); efecto("aplauso", 0.5); return; }
    const tid = (it.matched && it.matched[0]) ? null : equipoDeSuceso(it);
    if(gol){
      const ev=it.matched.find(e=>e.tipo==="goal"); const anota=ev ? ev.teamId : tid;   // el que suma el gol
      const neutral=aficionNeutral(), sA=neutral ? 1 : apoyo(anota), sB=neutral ? 0 : 1-sA;
      efecto("gol", Math.max(0.2, sA));                 // los suyos celebran (en casa ajena, solo su sector)
      if(sB>0.3) efecto("lamento", sB*0.8);             // y el resto se lamenta
      return;
    }
    if(it.tipo==="red" || it.tipo==="yellow"){
      const ev=it.matched[0]; const team=ev ? ev.teamId : tid;
      // La afición del equipo amonestado abuchea al árbitro; con roja, más fuerte.
      efecto("abucheo", apoyo(team) * (it.tipo==="red" ? 1 : 0.6));
      return;
    }
    if(/^(falta|mano)\b/.test(nl(it.title||"").replace(/^[^a-z0-9]+/,""))){
      // Falta pitada EN CONTRA de un equipo: su afición protesta (más cuando es el local en su casa).
      if(tid) efecto("abucheo", apoyo(tid)*0.45);
      return;
    }
    if(/poste|travesano|larguero|al palo|se va (desviado|por encima|rozando)|ocasion|atajad|paradon|salvad|remate|disparo|cabezazo|tiro (a puerta|desviado|bloqueado)/.test(t)){
      if(tid) efecto("uuh", Math.max(0.15, apoyo(tid))*0.9);
      return;
    }
  }

  /* =========================================================
     ESTADO Y PANTALLA
     ========================================================= */
  let S=null;   // estado del partido en vivo (solo en memoria)

  function readMs(it){
    const txt=textoDe(it); const n=(it.title||"").length + txt.length;
    let ms=Math.min(CFG.LECTURA_MAX_MS, Math.max(CFG.LECTURA_MIN_MS, n*CFG.LECTURA_MS_POR_CARACTER));
    if(it.tipo==="goal") ms+=CFG.EXTRA_GOL_MS;
    if(it.silbato) ms+=CFG.EXTRA_SILBATO_MS;
    return ms;
  }
  function marcadorTxt(){ return `${codigo(S.A)} ${S.sa}-${S.sb} ${codigo(S.B)}`; }
  function equipoDe(teamId){ return teamId===S.f.teamA ? S.A : S.B; }
  // Texto del suceso. Los del relato se muestran tal cual; los que redacta el motor se arman aquí.
  function textoDe(it){
    if(it.desc || !it.gen) return it.desc||"";
    const ev=it.matched[0];
    if(it.silbato==="ht") return `Termina la primera parte: ${nombreEq(S.A)} ${S.sa}, ${nombreEq(S.B)} ${S.sb}.`;
    if(it.silbato==="fr") return `Termina el tiempo reglamentario: ${nombreEq(S.A)} ${S.sa}, ${nombreEq(S.B)} ${S.sb}. Habrá tiempo extra.`;
    if(it.silbato==="eht") return `Termina el primer tiempo extra: ${nombreEq(S.A)} ${S.sa}, ${nombreEq(S.B)} ${S.sb}.`;
    if(it.silbato==="ft"){
      const P=S.f.penalties; let pen="";
      if(P) pen=" Se define en penales.";
      return `Final del partido: ${nombreEq(S.A)} ${S.sa}, ${nombreEq(S.B)} ${S.sb}.${pen}`;
    }
    if(!ev) return "";
    const eq=nombreEq(equipoDe(ev.teamId));
    if(it.tipo==="goal"){
      if(ev.og){ const rival=nombreEq(ev.teamId===S.f.teamA?S.B:S.A); return `Autogol de ${ev.player} (${rival}). ${eq} se lleva el tanto.`; }
      return `¡Gol de ${eq}! ${ev.player} anota${ev.pen?" de penal":""}${ev.assist?` tras el pase de ${ev.assist}`:""}.`;
    }
    if(it.tipo==="yellow") return `${ev.player} (${eq}) ve la tarjeta amarilla.`;
    if(it.tipo==="red"){
      const doble = ev.ref && JI().mrDobleAmarilla ? JI().mrDobleAmarilla(S.f, ev.ref) : false;
      return doble ? `${ev.player} (${eq}) ve la segunda amarilla y es expulsado.` : `${ev.player} (${eq}) es expulsado con tarjeta roja.`;
    }
    if(it.tipo==="sub"){
      if(it.matched.length===1) return `Sustitución en ${eq}: entra ${ev.inName} por ${ev.outName}.`;
      // Varios cambios del grupo: "salen X, Y y Z; entran A, B y C".
      const ms=it.matched.slice().sort((a,b)=> linDe(a.half,a.t)-linDe(b.half,b.t));
      const lista=a=> a.length>1 ? a.slice(0,-1).join(", ")+" y "+a[a.length-1] : a[0];
      return `Sustitución en ${eq}: salen ${lista(ms.map(e=>e.outName))}; entran ${lista(ms.map(e=>e.inName))}.`;
    }
    return "";
  }

  /* ----- fixture "virtual": solo lo revelado hasta ahora ----- */
  const claveJ = (id, nm)=> id ? "id:"+id : "nm:"+nl(nm);
  // Quién está en la cancha AHORA por lado: [{slot (fila del once), key, playerId, name, number, pos}]
  // conExpulsados: true → también devuelve a los expulsados (marcados con .expulsado), para la cancha.
  function ocupantes(side, conExpulsados){
    const lu=S.f.lineups&&S.f.lineups[side]; if(!lu) return [];
    const rojas=(S.f.cards||[]).filter(c=>c.type==="red" && (S.ended||S.revealed.has(c)));
    const fuera=(id,nm)=> rojas.some(c=> (id && c.playerId===id) || (!c.playerId && nl(c.player)===nl(nm)));
    const todos=[];
    (lu.players||[]).forEach((p,i)=>{
      let cur={ playerId:p.playerId||null, name:p.name, number:p.number, pos:p.pos };
      for(const {ref, entra} of cadenaCambios(p)){
        if(!(S.ended || S.revealed.has(ref))) break;
        cur={ playerId:entra.playerId||null, name:entra.name, number:entra.number, pos:p.pos, entro:entra.minute, ref };
      }
      todos.push(Object.assign(cur, { slot:i, key:claveJ(cur.playerId, cur.name) }));
    });
    reacomodarCambios(lu, todos);
    if(conExpulsados){ todos.forEach(o=>{ if(fuera(o.playerId, o.name)) o.expulsado=true; }); return todos; }
    return todos.filter(o=>!fuera(o.playerId, o.name));
  }
  // CAMBIOS EN GRUPO en la cancha: cuando un equipo hace 2 o más cambios del mismo grupo (mismo equipo,
  // ventana encadenada de ±2'), se respeta "quién sale por quién" del informe mientras todos queden en su
  // posición; si uno o más quedan fuera de ella, los que entran se reparten entre
  // los huecos que dejaron los que salieron buscando la MEJOR COMBINACIÓN POR POSICIONES (máxima suma de
  // valores 0–20 del perfil de cada jugador en cada hueco). Ej.: sale Raúl Jiménez (DC) y en el mismo
  // grupo entra Guillermo Martínez → Martínez va de delantero centro aunque el informe diga que entró por
  // otro. En empate se respeta el reparto del informe.
  function valorPos(pid, pos){
    if(!pid || typeof getPlayerWithTeam!=="function" || typeof getPositionValue!=="function") return null;
    try{
      const pl=getPlayerWithTeam(pid).player; if(!pl) return null;
      const code=String(pos||"").toUpperCase();
      const tiene=pl.positions && Object.values(pl.positions).some(v=>+v>0);
      if(tiene){ const v=getPositionValue(pl, code); return v==null?0:v; }
      // Sin valores por posición: se usa su posición principal (GK/DF/MF/FW) contra la línea del hueco.
      const cat=(typeof POS_CAT_OF==="object" && POS_CAT_OF[code]) || null;
      if(!pl.pos || !cat) return null;
      return pl.pos===cat ? 20 : 0;
    }catch(e){ return null; }
  }
  const CAMBIO_EN_POSICION = 15;   // valor (0–20) a partir del cual un jugador está "en su posición"
  function reacomodarCambios(lu, todos){
    const grupos={};
    todos.forEach(o=>{
      if(o.entro==null) return;
      const p=lu.players[o.slot];
      const k=(o.ref && GRUPO_CAMBIO.get(o.ref)) || (p && GRUPO_CAMBIO.get(p)) || ("m"+o.entro);   // sin grupo conocido: por minuto
      (grupos[k]=grupos[k]||[]).push(o);
    });
    Object.keys(grupos).forEach(k=>{
      const g=grupos[k]; if(g.length<2) return;
      const huecos=g.map(o=>({ slot:o.slot, pos:(lu.players[o.slot]||{}).pos }));
      // Sin datos de posiciones de los que entran no se mueve nada.
      if(g.some(o=>valorPos(o.playerId, o.pos)==null)) return;
      // Se privilegia el jugador por jugador del informe: si TODOS los que entran quedan en su posición
      // (valor > 15 en el hueco del que sustituyen), no se mueve nada. Solo si uno o más quedarían fuera
      // de su posición se busca la mejor combinación del grupo.
      if(g.every(o=>valorPos(o.playerId, o.pos)>CAMBIO_EN_POSICION)) return;
      const val=g.map(o=>huecos.map(h=>valorPos(o.playerId, h.pos)||0));
      const n=g.length; let mejor=null, mejorVal=-1;
      const usado=new Array(n).fill(false), asig=new Array(n);
      const prueba=(i, tot, igual)=>{
        if(i===n){ const v=tot*100+igual; if(v>mejorVal){ mejorVal=v; mejor=asig.slice(); } return; }
        for(let h=0;h<n;h++){ if(usado[h]) continue;
          usado[h]=true; asig[i]=h; prueba(i+1, tot+val[i][h], igual+(huecos[h].slot===g[i].slot?1:0)); usado[h]=false; }
      };
      prueba(0,0,0);
      if(!mejor) return;
      g.forEach((o,i)=>{ const h=huecos[mejor[i]]; o.slot=h.slot; o.pos=h.pos; });
    });
  }
  // GAFETE: si el capitán sale (cambio o expulsión), pasa al siguiente del orden de capitanes de la
  // selección (team.captains) que esté en la cancha; si no hay, al que tenga más internacionalidades.
  // Si ENTRA de cambio el capitán (1º del orden), se le da el gafete; si el capitán no está en la cancha
  // y entra el vicecapitán (2º), también se le da. Del 3º en adelante no se quita a quien ya lo trae.
  function actualizarCapitan(side){
    const team = side==="home" ? S.A : S.B;
    const on=ocupantes(side); const keys=new Set(on.map(o=>o.key));
    const lu=S.f.lineups&&S.f.lineups[side];
    const entraron=new Set();
    ((lu&&lu.players)||[]).forEach(p=>cadenaCambios(p).forEach(({ref,entra})=>{ if(S.ended||S.revealed.has(ref)) entraron.add(claveJ(entra.playerId||null, entra.name)); }));
    const orden0=(team && Array.isArray(team.captains)) ? team.captains : [];
    const c1=orden0[0]?claveJ(orden0[0]):null, c2=orden0[1]?claveJ(orden0[1]):null;
    if(c1 && keys.has(c1) && entraron.has(c1)){ S.cap[side]=c1; return; }
    if(c2 && keys.has(c2) && entraron.has(c2) && !(c1 && keys.has(c1)) && S.cap[side]!==c1){ S.cap[side]=c2; return; }
    if(S.cap[side] && keys.has(S.cap[side])) return;
    if(!on.length){ S.cap[side]=null; return; }
    const orden=(team && Array.isArray(team.captains)) ? team.captains : [];
    for(const id of orden){ if(keys.has(claveJ(id))){ S.cap[side]=claveJ(id); return; } }
    const byId={}; ((team&&team.players)||[]).forEach(pl=>byId[pl.id]=pl);
    let best=null, bc=-1;
    on.forEach(o=>{ const c=(o.playerId && byId[o.playerId] && +byId[o.playerId].caps) || 0; if(c>bc){ bc=c; best=o; } });
    S.cap[side]=best?best.key:null;
  }
  function fixtureVirtual(final){
    const f=S.f;
    const rv = final ? null : S.revealed;
    const has = x => final || rv.has(x);
    const lineups={};
    ["home","away"].forEach(side=>{
      const lu=f.lineups&&f.lineups[side]; if(!lu) return;
      const cap=S.cap[side];
      const bench=(lu.bench||[]).map(b=>Object.assign({}, b, { captain: !!cap && claveJ(b.playerId,b.name)===cap }));
      const players=(lu.players||[]).map(p=>{
        const c=Object.assign({}, p, { captain: !!cap && claveJ(p.playerId,p.name)===cap });
        // Cadena de cambios: se conserva hasta el último revelado; los que aún no entran van a la banca.
        let dst=c, src=p;
        while(src.sub){
          if(!has(src)){
            let r=src.sub; while(r){ bench.push({ number:r.number, name:r.name, pos:r.pos||"", playerId:r.playerId||null, captain:false }); r=r.sub; }
            delete dst.sub; break;
          }
          dst.sub=Object.assign({}, src.sub, { captain: !!cap && claveJ(src.sub.playerId,src.sub.name)===cap });
          dst=dst.sub; src=src.sub;
        }
        return c;
      });
      lineups[side]=Object.assign({}, lu, { players, bench });
    });
    return Object.assign({}, f, {
      goals:(f.goals||[]).filter(has),
      cards:(f.cards||[]).filter(has),
      missedPens:(f.missedPens||[]).filter(has),
      // Tanda: en vivo van apareciendo los tiros ya cobrados (como los goles); al final, la tanda completa.
      penalties: final?f.penalties:null, penaltyShots: final ? f.penaltyShots : ((f.penaltyShots||[]).filter(t=>rv.has(t))),
      _tandaEnCurso: !final,
      lineups, scoreA: final?f.scoreA:S.sa, scoreB: final?f.scoreB:S.sb, stats: final?f.stats:null,
      _te: TE && (final || !!S.teVisible),   // en vivo: el tiempo extra se dibuja hasta que termina el reglamentario
      ftMin: (TE && !final && !S.teVisible) ? (f.ftReg||null) : f.ftMin,
      ftReg: (TE && !final && !S.teVisible) ? null : f.ftReg,
      _jdpOculto: !final   // la etiqueta JDP de la alineación sale hasta que termina el partido
    });
  }
  // Once en la cancha AHORA (cambios hechos, expulsados fuera) con el gafete en quien lo trae.
  function enCancha(side){
    const lu=S.f.lineups&&S.f.lineups[side]; if(!lu) return lu;
    // El expulsado NO desaparece de la formación: se queda en su lugar, atenuado (nombre, foto y posición al 60%).
    const on=ocupantes(side, true); const bySlot={}; on.forEach(o=>bySlot[o.slot]=o);
    const players=(lu.players||[]).map((p,i)=>{
      const o=bySlot[i];
      if(!o) return { pos:p.pos, name:"", number:null };
      return { playerId:o.playerId, name:o.name, number:o.number, pos:o.pos, captain: !o.expulsado && o.key===S.cap[side], expelled: !!o.expulsado };
    });
    return Object.assign({}, lu, { players });
  }

  function ladoHTML(team, side, vf, mirror){
    const lu=vf.lineups&&vf.lineups[side];
    return `<div class="mr-pcap">${call("flagImg",team,18)}<span>${H(nombreEq(team))}</span>${lu?`<span class="mr-form">${H(lu.formation)}${lu.formationType?` (${H(lu.formationType)})`:""}</span>`:""}</div>
      ${call("mrPitchHTML", enCancha(side))}
      ${call("mrLineupListHTML", lu, vf, mirror)}`;
  }

  function pintarDinamico(){
    if(!S || !S.root.isConnected) return;
    actualizarCapitan("home"); actualizarCapitan("away");
    // El partido "completo" (incidencias finales) llega hasta que se cobró el último penal de la tanda.
    const vf=fixtureVirtual(S.ended && (S.f.penaltyShots||[]).every(t=>S.revealed.has(t)));
    const set=(id,html)=>{ const el=document.getElementById(id); if(el) el.innerHTML=html; };
    const hayInc=(vf.goals||[]).length || (vf.cards||[]).some(c=>c.type==="red") || (vf.missedPens||[]).length || !!vf.penalties || (vf.penaltyShots||[]).length;
    const inc=document.getElementById("ml-inc");
    if(inc){
      inc.innerHTML=hayInc?call("calIncidentsHTML", vf, S.A):""; inc.hidden=!hayInc;
    }
    set("ml-tl", call("mrTimelineHTML", vf, S.A, S.B));
    set("ml-side-l", ladoHTML(S.A, "home", vf, false));
    set("ml-side-r", ladoHTML(S.B, "away", vf, true));
    prepararLineaTiempo();
    pintarMarcador(false);
    pintarCalificaciones();
  }
  function pintarMarcador(gol){
    S.root.querySelectorAll(".ml-sc").forEach(sc=>{
      sc.textContent=`${S.sa} - ${S.sb}`;
      if(gol){ sc.classList.remove("ml-goal"); void sc.offsetWidth; sc.classList.add("ml-goal"); }
    });
    // Marcador del Mundial: un número por equipo.
    [["ml-wc-sa",S.sa],["ml-wc-sb",S.sb]].forEach(([id,v])=>{
      const el=document.getElementById(id); if(!el) return;
      if(el.textContent!==String(v)){
        const sube = +v > +(el.textContent||0);   // el número del equipo que anotó hace la animación
        el.textContent=String(v);
        if(sube && (gol || S.playing)){ el.classList.remove("ml-goal"); void el.offsetWidth; el.classList.add("ml-goal"); }
      }
    });
  }
  /* ---------- MARCADOR ESTILO COPA DEL MUNDO (transmisión FIFA 2026) ----------
     Reloj (caja clara) + pestaña de reposición debajo; dos bloques negros con bandera (esquinas redondeadas
     y contorno blanco), círculo con el color de la PLAYERA que usa el equipo y código en FWC2026; al centro
     el marcador sobre turquesa y el emblema del Mundial. Medidas en unidades del diseño original
     (scoreboard_wc26.svg) escaladas con --u. Solo para partidos de la Copa del Mundo (CFG.MARCADOR_MUNDIAL). */
  function esMundialVivo(f){
    const m=CFG.MARCADOR_MUNDIAL;
    if(m===true) return true;
    if(m===false || !f) return false;
    if(f.friendly || f.stage==="amistoso") return false;
    return (typeof matchIsWorldCup==="function") ? matchIsWorldCup(f) : false;
  }
  // Color de la playera que usa el equipo en este partido (la elegida en "Kit …" del informe; si no, la 1ª).
  function colorPlayera(team, side, f){
    try{
      const s=f.kitSel && f.kitSel[side];
      const kit=JI().mrPickKit ? JI().mrPickKit(team, "jugador", s?s.jugadorNum:null, f.date||null) : null;
      if(kit && kit.color1) return kit.color1;
    }catch(e){}
    return (team && (team.color1||team.primaryColor)) || "#ffffff";
  }
  function marcadorMundialHTML(f, A, B){
    const ca=colorPlayera(A,"home",f), cb=colorPlayera(B,"away",f);
    // Reloj independiente (caja clara + pestaña de reposición debajo) y marcador aparte, con la línea del
    // tiempo debajo del marcador, igual que en el marcador de los amistosos.
    return `<div class="wcclk">
      <div class="wcclk-tab" id="ml-wctab" hidden><span class="wcclk-tclk" id="ml-add"></span><span class="wcclk-tadd" id="ml-wcadd"></span></div>
      <div class="wcclk-box"><span id="ml-clock">00:00</span></div>
    </div>
    <div class="wcsb" id="ml-wcsb">
      <div class="wcsb-und l"></div><div class="wcsb-und r"></div>
      <div class="wcsb-blk l"></div><div class="wcsb-blk r"></div>
      <div class="wcsb-mid"></div>
      <div class="wcsb-eq l">${call("flagImg",A,18)?`<span class="wcsb-flag">${call("flagImg",A,18)}</span>`:""}<span class="wcsb-dot" style="background:${H(ca)}"></span><span class="wcsb-code">${H(codigo(A))}</span></div>
      <div class="wcsb-sc l"><span id="ml-wc-sa">0</span></div>
      <div class="wcsb-emb"><img src="logos/marcador-wc26.svg" alt=""></div>
      <div class="wcsb-sc r"><span id="ml-wc-sb">0</span></div>
      <div class="wcsb-eq r"><span class="wcsb-code">${H(codigo(B))}</span><span class="wcsb-dot" style="background:${H(cb)}"></span>${call("flagImg",B,18)?`<span class="wcsb-flag">${call("flagImg",B,18)}</span>`:""}</div>
    </div>
    <div class="ml-track wc-track"><div class="ml-prog" id="ml-prog"></div>${marcasProgHTML()}</div>`;
  }
  // Escala del marcador del Mundial: --u (alto y tipografías) es fija para que el reloj y el marcador
  // midan exactamente 38 px (el alto del botón JUEGA); --w (posiciones horizontales) se reduce si la
  // barra es angosta, para que reloj + marcador quepan junto a los botones.
  function escalarMundial(){
    const bar=S && S.root && S.root.querySelector(".ml-bar.ml-wc"); if(!bar) return;
    const libre=bar.clientWidth - 28 - 176 - 28;          // padding + botones + 2 separaciones (14 px)
    // Alto FIJO (reloj y marcador = 38 px, como el botón JUEGA); solo el ANCHO se ajusta si no cabe.
    const w=Math.max(0.18, Math.min(0.27536, libre/1624));  // 331 (reloj) + 1293 (marcador) unidades
    bar.style.setProperty("--w", w.toFixed(5)+"px");
  }

  /* =========================================================
     EN VIVO: estadísticas, posesión, calificaciones y línea de tiempo
     ========================================================= */
  // Aleatorio con semilla (mismo partido → misma simulación cada vez que se ve).
  function rng(semilla){
    let h=2166136261>>>0; const s=String(semilla);
    for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619)>>>0; }
    return ()=>{ h+=0x6D2B79F5; let t=h; t=Math.imul(t^(t>>>15),t|1); t^=t+Math.imul(t^(t>>>7),t|61); return ((t^(t>>>14))>>>0)/4294967296; };
  }
  // Minuto lineal comparable entre mitades (el 2T va desplazado para que el añadido del 1T quede antes).
  const linDe = (half, t)=> half<=1 ? t : (half===2 ? t+10 : (half===3 ? t+25 : t+40));
  function linAhora(){ return S.half===0 ? -1 : linDe(S.half, S.t); }
  // Minuto "de juego" (0–90+) para calcular minutos jugados.
  // Con tiempo extra el añadido de cada tiempo no se suma (90+5 → 90; 105+1 → 105): así el reloj sigue
  // en orden de un tiempo al siguiente (el 3er tiempo arranca en 90:00).
  function minJuego(){ if(S.half===0) return 0; if(S.half===1) return Math.min(S.t,45); if(TE && S.half===2) return Math.min(S.t,90); if(TE && S.half===3) return Math.min(S.t,105); return S.t; }
  function minDe(minute){ const p=partesMin(minute); if(p.base<=45) return Math.min(p.base,45); if(TE && (p.base===90 || p.base===105)) return p.base; return p.base+p.extra; }
  // Minuto de juego del FINAL del partido (para minutos jugados y calificaciones).
  function finPartido(){ return TE ? Math.max(120, S.finT4||120) : Math.max(90, S.finT2||90); }

  // Jugadores del partido (titulares, cambios y banca) para reconocerlos en el relato.
  function indexarJugadores(){
    const lista=[];
    ["home","away"].forEach(side=>{
      const lu=S.f.lineups&&S.f.lineups[side]; if(!lu) return;
      const team=getTeam(lu.teamId); const byId={}; ((team&&team.players)||[]).forEach(p=>byId[p.id]=p);
      const add=(id,nm,pos)=>{ if(!nm) return; const o=id&&byId[id];
        const nombres=[nm]; if(o){ nombres.push(((o.firstName||"")+" "+(o.lastName||"")).trim()); nombres.push(((o.lastName||"")+" "+(o.firstName||"")).trim()); if(o.commonName) nombres.push(o.commonName); }
        const gk = /^(GK|POR)$/i.test(String(pos||"")) || (o && /^(GK|POR)$/i.test(String(o.pos||"")));   // portero
        lista.push({ pid:id||null, key:claveJ(id,nm), teamId:lu.teamId, gk:!!gk, full:nombres.map(nl).filter(x=>x.length>3), sur:nl(apellido(nm)) }); };
      (lu.players||[]).forEach(p=>{ add(p.playerId,p.name,p.pos); cadenaCambios(p).forEach(({entra})=>add(entra.playerId,entra.name,entra.pos||(p.pos==="GK"?"GK":""))); });
      (lu.bench||[]).forEach(b=>add(b.playerId,b.name,b.pos));
    });
    // Jugador del partido (JDP) aunque el informe no traiga su alineación: su nombre también va en negritas.
    const jp=S.f.potm;
    if(jp && jp.player && !lista.some(j=>(jp.playerId && j.pid===jp.playerId) || j.full.includes(nl(jp.player)))){
      lista.push({ pid:jp.playerId||null, key:claveJ(jp.playerId||null, jp.player), teamId:jp.teamId, gk:false, full:[nl(jp.player)].filter(x=>x.length>3), sur:nl(apellido(jp.player)) });
    }
    const cuenta={}; lista.forEach(j=>cuenta[j.sur]=(cuenta[j.sur]||0)+1);
    lista.forEach(j=>j.unico = j.sur.length>=4 && cuenta[j.sur]===1);
    return lista;
  }
  // Normalización carácter a carácter (misma longitud que el original), para ubicar nombres en el texto.
  function normMismoLargo(src){
    let norm=""; for(const ch of src){ const n=ch.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); norm += (n.length===ch.length ? n : ch.toLowerCase()); }
    return norm.length===src.length ? norm : null;
  }
  // ¿El APELLIDO suelto que empieza en src[i] es en realidad de OTRA persona? Pasa cuando va pegado a un nombre
  // propio que no es del jugador: "Hugo Sánchez" (exjugador, fuera de la base) no es Jorge Sánchez. Las
  // palabras comunes con mayúscula al inicio de una oración ("Remate de…", "Ahora Sánchez…") no cuentan.
  const PALABRAS_NO_NOMBRE = new Set(("ahi ahora y e o pero otra otro gran enorme luego despues tambien nuevamente atencion ojo cuidado "+
    "remate tiro disparo cabezazo centro pase falta gol golazo atajada atajadon parada entra sale cambio tarjeta amarilla roja "+
    "aparece llega vaya que como increible sin con para de del el la los las un una al por ante tras hacia mano error peligro "+
    "ocasion balon lo le se su este ese esta esa bien casi solo ya aqui alli alla primer primera segundo segunda nuevo nueva "+
    "capitan portero arquero defensa delantero volante lateral central extremo penal penalti contragolpe jugada asistencia "+
    "remata dispara cabecea recibe roba despeja bloquea cobra manda saca toca conduce avanza encara controla filtra busca "+
    "encuentra pierde comete derriba protesta reclama pide festeja celebra intenta prueba perdona falla salva ataja rechaza "+
    "desvia tapa achica anota marca define asiste homenaje leyenda don senor profe mister dt tecnico entrenador arbitro").split(" "));
  function apellidoAjeno(src, i, j){
    const m=/([A-ZÁÉÍÓÚÑÜÀ-ÖØ-Þ][A-Za-zÀ-ÖØ-öø-ÿ'’-]+)\s+$/.exec(src.slice(Math.max(0,i-30), i));
    if(!m) return false;
    const w=nl(m[1]);
    if(w.length<2 || PALABRAS_NO_NOMBRE.has(w)) return false;
    if(j.full.some(n=>n.split(" ").includes(w))) return false;              // su propio nombre de pila
    if((S.jug||[]).some(o=>o.sur===w)) return false;                         // otro apellido del partido
    if([S.A,S.B].some(t=>t && [t.commonName,t.name,t.officialName].filter(Boolean).some(n=>nl(n).split(" ").includes(w)))) return false;
    return true;
  }
  // Jugadores mencionados en un texto, en el orden en que aparecen.
  function menciones(texto){
    const x=" "+nl(texto)+" "; const out=[];
    const src=String(texto||""), norm=normMismoLargo(src);
    S.jug.forEach(j=>{
      let pos=-1;
      j.full.forEach(n=>{ const i=x.indexOf(n); if(i>=0 && (pos<0||i<pos)) pos=i; });
      if(pos<0 && j.unico){
        const rx=new RegExp("(^|[^a-z])"+j.sur.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"(?=$|[^a-z])","g");
        if(norm){ let m; while((m=rx.exec(norm))){ const i=m.index+m[1].length; if(!apellidoAjeno(src, i, j)){ pos=i; break; } } }
        else { const m=new RegExp("[^a-z]"+j.sur.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"[^a-z]").exec(x); if(m) pos=m.index; }
      }
      if(pos>=0 && !out.some(o=>o.j.key===j.key)) out.push({ j, pos });
    });
    return out.sort((a,b)=>a.pos-b.pos).map(o=>o.j);
  }
  // Nombres que también van en NEGRITAS en el relato: los árbitros (nombre completo) y los entrenadores
  // (nombre completo; el apellido solo del principal y si ningún jugador del partido lo comparte).
  // Devuelve pares [nombre normalizado, teamId]: el árbitro va sin equipo (sin código); los entrenadores
  // llevan el de su selección, para mostrar "Javier Aguirre (MEX)".
  function otrosNombres(f, A, B){
    const out=[]; const v=(x,tid)=>{ const n=nl(x||"").trim(); if(n.length>3) out.push([n, tid||null]); };
    // Árbitro central y, si el informe trae el cuerpo arbitral completo, asistentes, cuarto árbitro, VAR y AVAR.
    const ids=new Set([f.refereeId].concat(Object.values(f.officials||{})).filter(Boolean));
    (DB.referees||[]).filter(r=>ids.has(r.id)).forEach(ref=>{ v(ref.commonName); v(((ref.firstName||"")+" "+(ref.lastName||"")).trim()); v(ref.fullName); v(((ref.lastName||"")+" "+(ref.firstName||"")).trim()); });
    const sur=new Set((S.jug||[]).map(j=>j.sur));
    // DT del partido (línea "DT, Nombre" de la alineación).
    ["home","away"].forEach(sd=>{ const lu=f.lineups&&f.lineups[sd]; if(!lu) return; const tid=lu.teamId; v(lu.coachName, tid);
      if(lu.coachId && typeof getCoachWithTeam==="function"){ try{ const c=getCoachWithTeam(lu.coachId).coach; if(c){ v(c.commonName,tid); v(((c.firstName||"")+" "+(c.lastName||"")).trim(),tid); v(c.fullName,tid); v(((c.lastName||"")+" "+(c.firstName||"")).trim(),tid); const ap=nl(c.lastName||""); if(ap.length>=4 && !sur.has(ap)) out.push([ap,tid]); } }catch(e){} } });
    [A,B].forEach(t=>{
      ((t&&t.coaches)||[]).forEach(c=>{ v(c.commonName,t.id); v(((c.firstName||"")+" "+(c.lastName||"")).trim(),t.id); v(c.fullName,t.id); v(((c.lastName||"")+" "+(c.firstName||"")).trim(),t.id); });
      const hc=JI().mrTeamHeadCoach ? JI().mrTeamHeadCoach(t) : null;
      const ap=hc ? nl(hc.lastName||apellido(JI().personCoachName?JI().personCoachName(hc):"")) : "";
      if(ap.length>=4 && !sur.has(ap)) out.push([ap,t.id]);
    });
    return out;
  }
  // Equipo nombrado en el texto ("Córner para México").
  function equipoNombrado(texto){
    const x=nl(texto); let best=null, bi=1e9;
    [S.A,S.B].forEach(t=>{ [t.commonName,t.name,t.officialName].filter(Boolean).forEach(n=>{ const i=x.indexOf(nl(n)); if(i>=0 && i<bi){ bi=i; best=t.id; } }); });
    return best;
  }
  const otro = teamId => teamId===S.f.teamA ? S.f.teamB : S.f.teamA;

  // Clasifica un bloque del relato: qué estadística suma, a quién, y cómo mueve las calificaciones.
  // Definiciones de Opta (Stats Perform). El TOTAL final de cada estadística lo manda el informe; el relato
  // solo dice en qué minuto ocurre cada suceso y a qué equipo se adjudica (el que lo REALIZA):
  //   · Tiro a puerta → tiro +1 y a puerta +1 (atajada del portero rival, salvo que la saque un defensa
  //     sobre la línea). · Tiro desviado → tiro +1. · Tiro bloqueado → tiro +1 (no a puerta).
  //   · Remate al poste → tiro +1 (Opta lo cuenta como fuera). · Gol → lo cuenta el informe (tiro + a puerta).
  //   · Gol en contra y gol anulado → no son remate de nadie. · Ocasión sin remate → contador de ocasiones.
  //   · Falta → cometida para el infractor (el primer jugador nombrado), recibida para el rival.
  //   · Mano → falta cometida (sin recibida). · Tarjeta con la falta descrita → también falta cometida.
  //   · Fuera de lugar → al equipo del adelantado (no es falta). · Córner → al equipo que lo GANA (el
  //     relato suele nombrar al defensor que lo concede: va al rival de ese jugador).
  //   · VAR, lesión, hidratación, asistencia, dato, tiempo añadido → solo texto.
  function analizarRelato(it){
    const ti=nl(it.title).replace(/^[^a-z0-9]+/,""), de=nl(it.desc||""), txt=it.title+" . "+it.desc, ms=menciones(txt);
    const actor=ms[0]||null, segundo=ms[1]||null;
    const r={ stats:[], rate:[], empuje:null };
    if(it.tipo==="goal" || it.silbato) return r;                        // los goles (y en contra) los cuenta el informe
    if(/^go+l anulad|anulad/.test(ti)) return r;                        // la jugada se anula: no cuenta
    if(/^(var|revision|lesion|pausa|hidratacion|asistencia|dato|tiempo anadido|tiempo de reposicion|anuncio)/.test(ti)) return r;
    // Tarjetas: al jugador/equipo del informe; si la descripción trae la falta, también falta cometida.
    if(it.tipo==="yellow" || it.tipo==="red"){
      const ev=it.matched[0];
      if(ev && /falta|entrada|derrib|zancadill|agarr|empuj|plancha|codazo|patada|mano|sujet|barr/.test(de)){ r.stats.push(["fouls",ev.teamId]); r.stats.push(["foulsWon",otro(ev.teamId)]); }
      return r;
    }
    const eq=equipoDeSuceso(it);                                          // equipo que REALIZA la acción (misma regla que la bandera)
    const esTiro = /^(tiro|remate|disparo|cabezazo|chut|volea|poste|travesano|larguero)/.test(ti) && !/^tiro (de esquina|libre)/.test(ti);
    if(esTiro && eq){
      r.stats.push(["shots",eq]); r.empuje=eq;
      const alPoste=/poste|palo|larguero|travesano/.test(ti);
      const bloqueado=/bloquead/.test(ti);
      const desviado=/desviad|fuera|por encima|por un lado|rozando/.test(ti);
      const aPuerta=!alPoste && !bloqueado && !desviado && /a puerta|atajad|parad|detenid|salvad|al arco|a porteria/.test(ti);
      if(aPuerta){
        r.stats.push(["sot",eq]);
        const enLinea=/sobre la linea|en la linea|bajo palos|debajo de los palos/.test(de);
        if(!enLinea) r.stats.push(["saves",otro(eq)]);                  // atajada del portero rival
        if(actor && actor.teamId===eq) r.rate.push([actor.key,0.18]);
        const gk=ms.find(m=>m.teamId!==eq && m.gk); if(gk && !enLinea) r.rate.push([gk.key,0.25]);
      } else if(bloqueado){ if(actor && actor.teamId===eq) r.rate.push([actor.key,0.03]); const df=ms.find(m=>m.teamId!==eq); if(df) r.rate.push([df.key,0.10]); }
      else if(alPoste){ if(actor && actor.teamId===eq) r.rate.push([actor.key,0.12]); }
      else { if(actor && actor.teamId===eq) r.rate.push([actor.key,0.03]); }
      return r;
    }
    // Ocasión sin remate (centro que nadie alcanza, error del portero, jugada clara sin tiro).
    if(/^(ocasion|oportunidad|jugada de peligro|peligro|llegada|aproximacion)/.test(ti)){
      if(eq){ r.stats.push(["chances",eq]); r.empuje=eq; }
      if(/fallad|falla|fallo/.test(ti+" "+de) && actor) r.rate.push([actor.key,-0.30]);
      return r;
    }
    if(/esquina|corner/.test(ti)){
      if(eq){ r.stats.push(["corners",eq]); r.empuje=eq; }
      const def=ms.find(m=>m.teamId!==eq); if(def && /conced|cedid|despej/.test(de)) r.rate.push([def.key,-0.03]);
      return r;
    }
    if(/^(falta|mano)\b/.test(ti)){
      if(eq){ r.stats.push(["fouls",eq]); if(/^falta/.test(ti)) r.stats.push(["foulsWon",otro(eq)]); r.empuje=otro(eq); }
      const inf=ms.find(m=>m.teamId===eq); if(inf) r.rate.push([inf.key,-0.08]);
      const vic=ms.find(m=>m.teamId!==eq); if(vic && /^falta/.test(ti)) r.rate.push([vic.key,0.04]);
      if(/penal(ti)?|pena maxima/.test(ti+" "+de) && inf) r.rate.push([inf.key,-0.6]);
      return r;
    }
    if(/fuera de lugar|fuera de juego|posicion adelantada|offside/.test(ti)){
      if(eq) r.stats.push(["offsides",eq]);
      const adel=ms.find(m=>m.teamId===eq); if(adel) r.rate.push([adel.key,-0.05]);
      return r;
    }
    return r;
  }

  // Las que el informe trae (TIR, TPO, FAL, AMA, ROJ, ESQ, ATA) se muestran; las demás (faltas recibidas,
  // fueras de lugar, ocasiones) se llevan igual y aparecerán en cuanto el informe traiga su total.
  const STAT_KEYS=["shots","sot","fouls","yellows","reds","corners","saves","foulsWon","offsides","chances"];
  // Programa de la estadística: cada valor final del informe se reparte en el tiempo. Lo que el relato
  // describe cae en su minuto; lo que falta se reparte al azar (semilla del partido). Nunca pasa del final.
  function programarEstadisticas(){
    const F=S.f.stats; S.prog=null; if(!F) return;
    const rnd=rng(S.f.id+"|stats");
    const sides=[S.f.teamA,S.f.teamB];
    const reales={}; STAT_KEYS.forEach(k=>reales[k]={[sides[0]]:[],[sides[1]]:[]});
    S.items.forEach(it=>{
      const L=linDe(it.half,it.t); if(it.half===0) return;
      (it.analisis ? it.analisis.stats : []).forEach(([k,tid])=>{ if(reales[k]&&reales[k][tid]) reales[k][tid].push(L); });
      it.matched.forEach(ev=>{
        if(ev.tipo==="goal" && !ev.og){ reales.shots[ev.teamId].push(L); reales.sot[ev.teamId].push(L); }
        if(ev.tipo==="yellow") reales.yellows[ev.teamId].push(L);
        if(ev.tipo==="red") reales.reds[ev.teamId].push(L);
      });
    });
    // Tramos de juego (minuto lineal): 1T, 2T y, con tiempo extra, los dos tiempos de 15'.
    const tramos=[[1, S.finT1], [linDe(2,45)+0.5, linDe(2,S.finT2)]];
    if(TE) tramos.push([linDe(3,90)+0.5, linDe(3,S.finT3||105)], [linDe(4,105)+0.5, linDe(4,S.finT4||120)]);
    const durT=tramos.reduce((a,[i,f2])=>a+Math.max(0.1,f2-i),0);
    const azar=()=>{ let u=rnd()*durT; for(const [i,f2] of tramos){ const d=Math.max(0.1,f2-i); if(u<=d) return i+u; u-=d; } return tramos[tramos.length-1][1]; };
    S.prog={};
    STAT_KEYS.forEach(k=>{
      S.prog[k]={};
      sides.forEach((tid,i)=>{
        const tot=Array.isArray(F[k]) ? (+F[k][i]||0) : 0;
        const r=reales[k][tid].sort((a,b)=>a-b).slice(0,tot);
        while(r.length<tot) r.push(azar());
        S.prog[k][tid]=r.sort((a,b)=>a-b);
      });
    });
    // Empuje (dominio del juego) por minuto, a partir de lo que narra el relato y los goles.
    S.empujes=[];
    S.items.forEach(it=>{
      if(it.half===0) return; const L=linDe(it.half,it.t);
      if(it.analisis && it.analisis.empuje) S.empujes.push([L,it.analisis.empuje]);
      it.matched.forEach(ev=>{ if(ev.tipo==="goal") S.empujes.push([L,ev.teamId]); });
    });
    S.posAcc=0; S.posN=0; S.posMom=0; S.posRnd=rng(S.f.id+"|pos"); S.ultMin=-1;
  }
  // Una muestra por minuto de juego: la posesión instantánea gira alrededor del valor final, empujada
  // por quién está atacando según el relato; mostrada como PROMEDIO acumulado, al principio se mueve
  // mucho y conforme avanza el partido se va asentando cerca del resultado final.
  function avanzarPosesion(){
    if(!S.f.stats || !Array.isArray(S.f.stats.pos)) return false;
    const L=linAhora(); if(L<0) return false;
    const minuto=Math.floor(L); let cambio=false;
    while(S.ultMin<minuto){
      S.ultMin++;
      S.empujes.forEach(([l,tid])=>{ if(Math.floor(l)===S.ultMin) S.posMom += (tid===S.f.teamA?1:-1)*0.55; });
      S.posMom*=0.86;
      const P=+S.f.stats.pos[0]||50;
      const ruido=(S.posRnd()-0.5)*16;
      const inst=Math.max(15, Math.min(85, P + S.posMom*18 + ruido));
      S.posAcc+=inst; S.posN++; cambio=true;
    }
    return cambio;
  }
  function statsAhora(){
    if(!S.f.stats) return null;
    if(S.ended) return S.f.stats;
    const L=linAhora(), out={};
    STAT_KEYS.forEach(k=>{ out[k]=[S.f.teamA,S.f.teamB].map(tid=> S.prog[k][tid].filter(x=>x<=L+1e-9).length); });
    let h=50; if(S.posN) h=Math.round(S.posAcc/S.posN);
    out.pos=[h,100-h];
    return out;
  }
  // Pinta (o actualiza en su lugar, para que las barras se deslicen) el rectángulo de estadísticas.
  function pintarEstadisticas(){
    const box=document.getElementById("ml-stats"); if(!box) return;
    const st=statsAhora(); if(!st){ box.innerHTML=""; return; }
    const html=call("mrStatsHTML", {stats:st}, S.A, S.B);
    if(!box.firstElementChild){ box.innerHTML=html; return; }
    const tmp=document.createElement("div"); tmp.innerHTML=html;
    const nv=tmp.querySelectorAll(".mr-st-v"), ov=box.querySelectorAll(".mr-st-v");
    const nb=tmp.querySelectorAll(".mr-st-h,.mr-st-a"), ob=box.querySelectorAll(".mr-st-h,.mr-st-a");
    if(nv.length!==ov.length || nb.length!==ob.length){ box.innerHTML=html; return; }
    nv.forEach((n,i)=>{ if(ov[i].textContent!==n.textContent) ov[i].textContent=n.textContent; });
    nb.forEach((n,i)=>{ ob[i].style.width=n.style.width; });
  }

  // CALIFICACIONES: cada jugador parte de un promedio y sube/baja con lo que hace (gol, asistencia,
  // remate a puerta, falla clara, falta, tarjeta…). Conforme avanza el partido se acerca a la
  // calificación final del informe. Con menos de 10 minutos jugados, el recuadro dice SC.
  function prepararCalificaciones(){
    S.rt={}; S.final={}; S.sc={}; S.tramos=null;
    // ¿El informe trae calificaciones REALES (notas en la alineación)?
    S.califReales = ["home","away"].some(side=>{ const lu=S.f.lineups&&S.f.lineups[side]; return !!lu && (lu.players||[]).some(p=>{ let r=p; while(r){ if(typeof r.rating==="number") return true; r=r.sub; } return false; }); });
    // Calificación REAL "(SC)" en la ficha: ese jugador se muestra SC (sin calificación) en vivo.
    ["home","away"].forEach(side=>{ const lu=S.f.lineups&&S.f.lineups[side]; if(!lu) return;
      (lu.players||[]).forEach(p=>{ let r=p; while(r){ if(r.rating==="SC") S.sc[claveJ(r.playerId||null, r.name)]=true; r=r.sub; } }); });
    const rnd=rng(S.f.id+"|rt");
    S.jug.forEach(j=>{
      if(S.rt[j.key]) return;
      S.rt[j.key]={ base: 6.1 + (rnd()-0.5)*0.4, d:0 };
      if(j.pid && typeof playerFixtureRating==="function"){ try{ const r=playerFixtureRating(j.pid, S.f); if(r!=null) S.final[j.key]=r; }catch(e){} }
    });
  }
  function moverCalif(key, d){ const r=S.rt[key]; if(r) r.d+=d; }

  /* ----- CALIFICACIONES v2 (provisional, EN SOMBRA): nucleo/calificaciones-v2.js -----
     Se calcula en paralelo y NO cambia lo que se ve, salvo con  CalificacionesV2.CONFIG.MOSTRAR = true.
     Escala de tiempo = la de minJuego(): 1T topado en 45; 2T con su añadido (90+7 → 97). */
  function minV2(half, t){ if(half<=1) return Math.min(t,45); if(TE && half===2) return Math.min(t,90); if(TE && half===3) return Math.min(t,105); return t; }
  function minInformeV2(minute, tipo){ const p=partesMin(minute); return minV2(mitadInforme(minute, tipo), p.base+p.extra); }
  function prepararV2(){
    S.v2=null; S.v2items=new Set(); S.v2final=null;
    const V2=window.CalificacionesV2; if(!V2) return;
    try{
      const f=S.f, T=TE ? finPartido() : Math.max(90, minV2(2, S.finT2));
      const deItem=new Map();   // suceso del informe → bloque del relato que lo revela
      S.items.forEach(it=>it.matched.forEach(ev=>deItem.set(ev.ref, it)));
      const orden=(ref, i)=>{ const it=deItem.get(ref); return it ? it.seq : 1e5+i; };
      const realDe=r=> r.rating==="SC" ? "SC" : (typeof r.rating==="number" ? r.rating : null);
      const jugadores=[];
      ["home","away"].forEach(side=>{
        const lu=f.lineups&&f.lineups[side]; if(!lu) return;
        const team=getTeam(lu.teamId); const byId={}; ((team&&team.players)||[]).forEach(p=>byId[p.id]=p);
        const rojaDe=(id,nm)=>{ const c=(f.cards||[]).find(c=>c.type==="red" && ((id&&c.playerId===id)||nl(c.player)===nl(nm))); return c ? minInformeV2(c.minute,"red") : null; };
        (lu.players||[]).forEach(p=>{
          let r=p, ini=0, posAnt=p.pos;
          while(r){
            const sale0 = r.sub && r.sub.minute ? minInformeV2(r.sub.minute,"sub") : T;
            const rm=rojaDe(r.playerId, r.name);
            const o=r.playerId && byId[r.playerId];
            // El que entra hereda la posición del que sale (como hace el importador con el portero). La del DB
            // solo si no hay otra: un nombre mal ligado (Éderson → el portero Ederson) no debe volverlo portero.
            const pos=r.pos || posAnt || (o && o.pos);
            jugadores.push({ key:claveJ(r.playerId||null, r.name), nombre:r.name, equipo:lu.teamId, pos, entra:ini,
                             sale: rm!=null ? Math.min(sale0, rm) : sale0, real:realDe(r), opta:r.opta||null,
                             optaPts: (!r.opta && typeof r.optaPts==="number") ? r.optaPts : null });
            if(!r.sub) break;
            ini=sale0; posAnt=pos; r=r.sub;
          }
        });
      });
      const goles=(f.goals||[]).map((g,i)=>({ min:minInformeV2(g.minute,"goal"), orden:orden(g,i), equipo:g.teamId,
        autor:claveJ(g.playerId||null, g.player), asistente: g.assistPlayer ? claveJ(g.assistPlayerId||null, g.assistPlayer) : null,
        autogol:!!g.og, penal:!!g.penalty, ref:g }));
      const eventos=[], extras=[];
      (f.cards||[]).forEach((c,i)=>{ const k=c.type||"yellow"; if(k!=="yellow" && k!=="red") return;
        eventos.push({ min:minInformeV2(c.minute,k), orden:orden(c,i), jugador:claveJ(c.playerId||null, c.player), cat:k==="red"?"RC":"YC", ref:c }); });
      (f.missedPens||[]).forEach((g,i)=>extras.push({ min:minInformeV2(g.minute,"penmiss"), orden:orden(g,i), jugador:claveJ(g.playerId||null, g.player), tipo:"penal_fallado", ref:g }));
      // Clasificador AISLADO de v2 (no cambia lo que hace el sistema actual): tirador vs. pasador, atajadas,
      // faltas, fueras de lugar y errores/ocasiones en su forma estándar. Lo dudoso NO se asigna (bitácora).
      const ctx={ jugadores:S.jug.map(j=>({ key:j.key, equipo:j.teamId, gk:j.gk, nombres:j.full, apellido:j.sur, unico:j.unico })) };
      const dudas=[];
      S.items.forEach(it=>{
        if(it.previo || it.post || it.tanda || it.silbato || !(it.half>0)) return;
        const min=minV2(it.half, it.t);
        let eq=null; try{ eq=equipoDeSuceso(it); }catch(e){}
        const informe=it.matched.map(ev=>({ tipo:ev.tipo, equipo:ev.teamId, autogol:!!ev.og, jugador: ev.ref ? claveJ(ev.ref.playerId||null, ev.ref.player) : null }));
        const r=V2.clasificarSuceso({ titulo:it.title, descripcion:it.desc, tipo:it.tipo, informe }, Object.assign({ equipo:eq }, ctx));
        r.eventos.forEach(([jugador,cat])=>eventos.push({ min, orden:it.seq, jugador, cat, ref:it }));
        r.extras.forEach(([jugador,tipo])=>extras.push({ min, orden:it.seq, jugador, tipo, ref:it }));
        r.dudas.forEach(d=>dudas.push(`${etiquetaMin(it.base,it.extra)}’ ${d}`));
      });
      S.v2=V2.preparar({ duracion:T, equipos:[f.teamA, f.teamB], jugadores, goles, eventos, extras });
      S.v2.dudas=dudas;                              // sucesos del relato que no se asignaron (no hay certeza)
      S.v2.optaBitacora=f.optaBitacora||null;        // validación de la sección Opta del informe
    }catch(e){ try{ console.warn("[Motor de partido] Calificaciones v2 (en sombra) no se pudieron preparar:", e); }catch(_){} S.v2=null; }
  }
  // ¿Ya ocurrió este suceso en el en vivo? (goles y tarjetas del informe, o bloques del relato ya revelados)
  function incluidoV2(x){ return !!x && (S.revealed.has(x.ref) || (S.v2items && S.v2items.has(x.ref))); }
  function evaluarV2(key){ return S.v2 && window.CalificacionesV2 ? CalificacionesV2.evaluar(S.v2, key, minJuego(), incluidoV2) : null; }
  // Instantánea para comparar: sistema actual (mostrado y sin calibrar) frente a v2 (nota_motor y nota_mostrada).
  function calificacionesV2(){
    if(!S || !S.rt) return null;
    const mins=minutosJugados(), out=[];
    S.jug.forEach(j=>{
      const r=S.rt[j.key]; const v=evaluarV2(j.key);
      const jm=S.v2 && S.v2.J[j.key];
      if(!jm && !r) return;
      out.push({ key:j.key, nombre: jm ? jm.nombre : j.key, equipo:j.teamId, real: jm ? jm.real : null, minutos: mins[j.key]!=null ? mins[j.key] : null,
        actual: r ? califAhora(j.key) : null, actual_sin_calibrar: r ? Math.max(3, Math.min(10, r.base+r.d)) : null,
        v2: v ? { nota_motor:v.nota_motor, nota_mostrada:v.nota_mostrada, mostrar:v.mostrar, opta_vivo:v.opta_vivo,
                  S:v.S, m:v.m, s:v.s, x:v.x, RC:v.RC, GC:v.GC, grupo:v.grupo, M:v.M, T:v.T, nivel:v.nivel } : null });
    });
    return { minuto:minJuego(), terminado:!!S.ended, jugadores:out, final:S.v2final, bitacora: S.v2 ? S.v2.bitacora.slice() : [],
             dudas: S.v2 ? (S.v2.dudas||[]).slice() : [], opta: S.v2 ? S.v2.optaBitacora : null };
  }
  function califPorSucesos(it){
    if(it.analisis) it.analisis.rate.forEach(([k,d])=>moverCalif(k,d));
    it.matched.forEach(ev=>{
      const g=ev.ref;
      if(ev.tipo==="goal"){
        const kp=claveJ(g.playerId,g.player);
        if(ev.og) moverCalif(kp,-0.8); else moverCalif(kp,1.0);
        if(!ev.og && g.assistPlayer) moverCalif(claveJ(g.assistPlayerId,g.assistPlayer),0.6);
        const side = ev.teamId===S.f.teamA ? "home" : "away", rival = side==="home" ? "away" : "home";
        ocupantes(side).forEach(o=>moverCalif(o.key,0.05));
        ocupantes(rival).forEach(o=>{ const pos=String(o.pos||"").toUpperCase(); moverCalif(o.key, pos==="GK" ? -0.3 : (/B$|CB|DF/.test(pos) ? -0.1 : -0.03)); });
      }
      // Penal fallado: baja al que lo cobró, solo si el partido NO trae calificaciones reales (la nota real ya lo incluye).
      if(ev.tipo==="penmiss" && !S.califReales) moverCalif(claveJ(g.playerId,g.player),-0.6);
      if(ev.tipo==="yellow") moverCalif(claveJ(g.playerId,g.player),-0.35);
      if(ev.tipo==="red") moverCalif(claveJ(g.playerId,g.player),-1.2);
    });
  }
  // Minutos jugados hasta ahora por cada jugador que ha pisado la cancha.
  function minutosJugados(){
    const ahora=minJuego(), out={};
    ["home","away"].forEach(side=>{
      const lu=S.f.lineups&&S.f.lineups[side]; if(!lu) return;
      const rojaMin=(id,nm)=>{ const c=(S.f.cards||[]).find(c=>c.type==="red" && S.revealed.has(c) && ((id&&c.playerId===id)||nl(c.player)===nl(nm))); return c?minDe(c.minute):null; };
      (lu.players||[]).forEach(p=>{
        // Titular y cada uno de los que entraron en la cadena: de su entrada a su salida (o a ahora / a su roja).
        let r=p, ini=0;
        while(r){
          const sale = r.sub && S.revealed.has(r) ? minDe(r.sub.minute) : null;
          let fin = sale!=null ? Math.min(ahora, sale) : ahora;
          const rm=rojaMin(r.playerId,r.name); if(rm!=null) fin=Math.min(fin,rm);
          out[claveJ(r.playerId||null,r.name)]=Math.max(0,fin-ini);
          if(sale==null) break;
          ini=sale; r=r.sub;
        }
      });
    });
    return out;
  }
  // Tramo de cada jugador en la cancha según el informe: entrada y salida PREVISTA (cambio, roja o final).
  function tramosJugadores(){
    const T=finPartido(), out={};
    ["home","away"].forEach(side=>{
      const lu=S.f.lineups&&S.f.lineups[side]; if(!lu) return;
      const roja=(id,nm)=>{ const c=(S.f.cards||[]).find(c=>c.type==="red" && ((id&&c.playerId===id)||nl(c.player)===nl(nm))); return c?minDe(c.minute):null; };
      (lu.players||[]).forEach(p=>{
        let r=p, ini=0;
        while(r){
          const sale = r.sub && r.sub.minute ? minDe(r.sub.minute) : T;
          const rm=roja(r.playerId, r.name);
          out[claveJ(r.playerId||null,r.name)]={ ini, fin: rm!=null ? Math.min(sale, rm) : sale };
          if(!r.sub) break;
          ini=sale; r=r.sub;
        }
      });
    });
    return out;
  }
  // La calificación se acerca a la final del informe conforme avanza SU participación (no el reloj del
  // partido): llega a la final justo cuando sale (cambio, roja o silbatazo final) y de ahí ya no se mueve.
  function califAhora(key){
    const r=S.rt[key]; if(!r) return null;
    const vivo=r.base+r.d;
    const fin=S.final[key];
    if(fin==null) return Math.max(3,Math.min(10,vivo));
    if(!S.tramos) S.tramos=tramosJugadores();
    const tr=S.tramos[key];
    let w;
    if(tr && tr.fin>tr.ini) w=Math.pow(Math.min(1, Math.max(0, (Math.min(minJuego(), tr.fin)-tr.ini)/(tr.fin-tr.ini))), 1.6);
    else w=Math.pow(Math.min(1, Math.max(0, minJuego())/finPartido()), 1.6);
    return Math.max(3, Math.min(10, vivo*(1-w) + fin*w));
  }
  // Color de la calificación: el mismo del informe (Juego.informe.mrRateColor).
  function colorCalif(v){ return JI().mrRateColor ? JI().mrRateColor(v) : "#6fae4e"; }
  function pintarCalificaciones(){
    if(!S || !S.rt || S.ended) return;   // al final manda la calificación del informe (ya pintada por terminar)
    const mins=minutosJugados();
    const color=colorCalif;
    const usarV2=!!(S.v2 && window.CalificacionesV2 && CalificacionesV2.CONFIG.MOSTRAR);
    ["ml-side-l","ml-side-r"].forEach(id=>{
      const box=document.getElementById(id); if(!box) return;
      box.querySelectorAll(".mr-lu-row").forEach(row=>{
        const el=row.querySelector(".mr-lu-rate"); if(!el || el.classList.contains("mr-lu-rate-empty")) return;
        const pid=row.getAttribute("data-id"); if(!pid) return;
        const k=claveJ(pid);
        if(usarV2){
          const r=evaluarV2(k); if(!r) return;
          if(r.mostrar==="SC"){ if(el.textContent!=="SC"){ el.textContent="SC"; el.classList.add("mr-lu-rate-sc"); el.style.background=""; el.title="Sin calificación"; } return; }
          if(el.textContent!==r.mostrar){ el.textContent=r.mostrar; el.classList.remove("mr-lu-rate-sc"); el.style.background=color(r.valor); el.title="Calificación en vivo (v2 provisional)"; }
          return;
        }
        if(!(k in mins) || mins[k]<10 || S.sc[k]){
          if(el.textContent!=="SC"){ el.textContent="SC"; el.classList.add("mr-lu-rate-sc"); el.style.background=""; el.title="Sin calificación (menos de 10 minutos jugados)"; }
          return;
        }
        const v0=califAhora(k); if(v0==null) return;
        // El color sale de la calificación REDONDEADA que se ve (antes salía del valor sin redondear: un 5.96
        // y un 6.04 mostraban "6.0" pero con colores distintos, porque el color cambia justo en el 6).
        const v=Math.round(v0*10)/10, txt=v.toFixed(1);
        if(el.textContent!==txt){ el.textContent=txt; el.classList.remove("mr-lu-rate-sc"); el.style.background=color(v); el.title="Calificación en vivo"; }
      });
    });
  }

  // LÍNEA DE TIEMPO: misma escala que los iconos del informe (I=3% · MT=50% · F=97%), con una barra
  // redondeada que se va llenando en morado conforme avanza el partido.
  function xLinea(){
    if(S.ended) return 100;
    if(S.half===0) return 0;
    if(TE && S.teVisible && S.half>=2){
      // Tiempo extra: misma regla del informe (90' en 3/4 de la línea; 30' en el 1/4 restante).
      const K=0.75, R=3+94*K, M2=R+(97-R)/2, t=S.t;
      if(S.half===2){
        if(S.halfTime) return R;   // fin del tiempo reglamentario: la barra llega a su marca
        const ex=Math.max(0, (S.finT2||90)-90), band=ex>0?3:0, N90=97-band;
        const x = t<90 ? 50 + (t-45)/45*(N90-50) : N90 + Math.min(t-90,ex)/Math.max(ex,1)*band;
        return 3 + (x-3)*K;
      }
      if(S.half===3){ if(S.halfTime) return M2; return t<=105 ? R + (t-90)/15*(M2-R) : M2 - 1.2 + Math.min(t-105,4)/4*0.9; }
      const ex4=Math.max(0, (S.finT4||120)-120), b2=ex4>0?2:0, N120=97-b2;
      return t<120 ? M2 + (t-105)/15*(N120-M2) : N120 + Math.min(t-120,ex4)/Math.max(ex4,1)*b2;
    }
    if(S.half===1 && S.halfTime) return 50;   // medio tiempo: la barra llega EXACTO a la marca del MT
    const ftp=partesMin(S.f.ftMin||"90"); const ftExtra = TE ? Math.max(0, (S.finT2||90)-90) : Math.max(0, ftp.base+ftp.extra-90);
    const band=ftExtra>0?3:0, N90=97-band; const t=S.t;
    let x;
    if(S.half===1){ x = t<=45 ? 3 + t/45*47 : 48.4 + Math.min(t-45,6)/6*1.3; }
    else x = t<90 ? 50 + (t-45)/45*(N90-50) : N90 + Math.min(t-90,ftExtra)/Math.max(ftExtra,1)*band;
    return Math.max(0, Math.min(100, x));
  }
  function prepararLineaTiempo(){
    const ln=document.querySelector("#ml-tl .mr-tl-line"); if(!ln || ln.querySelector(".ml-tl-fill")) return;
    ln.insertAdjacentHTML("beforeend", `<i class="ml-tl-fill"></i>`);
  }
  function pintarLineaTiempo(){
    const fl=document.querySelector("#ml-tl .ml-tl-fill"); if(!fl) return;
    const x=xLinea();   // % del recuadro → % de la línea (la línea va de 1.5% a 98.5%)
    fl.style.width = (S.ended ? 100 : Math.max(0, Math.min(100, (x-1.5)/97*100))).toFixed(2)+"%";
  }

  /* ----- relato (debajo del rectángulo) ----- */
  const ICONO={
    goal:   ()=>`<span class="ml-ic ml-ic-ball" style="-webkit-mask-image:url('${JI().JG_BALL_ICON||""}');mask-image:url('${JI().JG_BALL_ICON||""}');"></span>`,
    yellow: ()=>`<span class="ml-ic ml-ic-card y"></span>`,
    red:    ()=>`<span class="ml-ic ml-ic-card r"></span>`,
    sub:    ()=>(JI().MR_SUB_ICON||""),
    silbato:()=>`<span class="ml-ic ml-ic-wh" style="-webkit-mask-image:url('${IMG_SILBATO}');mask-image:url('${IMG_SILBATO}');"></span>`
  };
  // Silbato (imagen aportada por el usuario, en blanco; se pinta con máscara).
  const IMG_SILBATO="data:image/png;base64,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";
  // Resalta en NEGRITAS los nombres de los jugadores del partido dentro de un texto (sin importar acentos).
  // Resalta en NEGRITAS los nombres del partido (jugadores, árbitro, entrenadores) sin importar acentos.
  // Junto a cada JUGADOR y ENTRENADOR va el código de su selección, sin negritas: "Raúl Jiménez (MEX)". Si el
  // texto ya traía el país entre paréntesis ("(México)"), se cambia por el código.
  // Código de la selección junto al nombre de un jugador o entrenador. Estilos (CFG.CODIGO_ESTILO):
  //   "parentesis" → Julián Quiñones (MEX)      · el código sin negritas
  //   "subindice"  → Julián QuiñonesMEX           · pequeño y algo más bajo, pegado al nombre
  //   "etiqueta"   → Julián Quiñones [MEX]       · etiqueta pequeña con fondo suave
  //   "bandera"    → Julián Quiñones 🇲🇽          · bandera mini en lugar del código
  //   "ninguno"    → sin código
  function codigoHTML(t){
    const cod=codigo(t), e=CFG.CODIGO_ESTILO;
    if(e==="ninguno" || !cod) return "";
    if(e==="subindice") return `<span class="ml-cod ml-cod-sub">${H(cod)}</span>`;
    if(e==="etiqueta") return `<span class="ml-cod ml-cod-tag">${H(cod)}</span>`;
    if(e==="bandera"){ const fl=call("flagImg",t,12); if(fl) return `<span class="ml-cod ml-cod-flag" title="${H(cod)}">${fl}</span>`; }
    return `<span class="ml-cod ml-cod-par"> (${H(cod)})</span>`;
  }
  // vistos (opcional, compartido por el título y la descripción de un mismo suceso): selecciones que ya
  // quedaron claras en ese suceso. Con CFG.CODIGO_UNA_VEZ, el código de cada selección sale solo la PRIMERA
  // vez, y no sale si el texto ya nombró a la selección antes ("Sustitución en Serbia: salen …").
  // opts.sinCodigo → solo negritas, sin código/bandera junto a los nombres. opts.out → recibe {tid} del
  // primer jugador/entrenador nombrado (para saber de qué equipo es la acción).
  function conNegritas(texto, vistos, opts){
    opts=opts||{};
    const src=String(texto||""); if(!src || !S || !S.jug) return H(src);
    // Normalización carácter a carácter (misma longitud que el original) para ubicar los nombres.
    let norm=""; for(const ch of src){ const n=ch.normalize("NFD").replace(/[̀-ͯ]/g,"").toLowerCase(); norm += (n.length===ch.length ? n : ch.toLowerCase()); }
    if(norm.length!==src.length) return H(src);
    const pats=[];   // [patrón, teamId|null]
    S.jug.forEach(j=>{ j.full.forEach(n=>pats.push([n,j.teamId,j.gk])); if(j.unico) pats.push([j.sur,j.teamId,j.gk,j]); });
    (S.otros||[]).forEach(([n,tid])=>pats.push([n,tid]));   // entrenadores con el código de su selección; árbitro sin código
    const pv=new Set(); const lista=pats.filter(([p])=>p.length>=3 && !pv.has(p) && pv.add(p)).sort((a,b)=>b[0].length-a[0].length);
    // (un apellido suelto pegado al nombre de otra persona — "Hugo Sánchez" — no se marca: apellidoAjeno)
    const marca=new Array(src.length).fill(false);
    const rangos=[];   // {i, fin, teamId}
    const esLetra=c=> /[a-z0-9À-ɏ]/i.test(c||"");
    lista.forEach(([p,tid,gk,soloAp])=>{
      let i=norm.indexOf(p);
      while(i>=0){
        const fin=i+p.length;
        if(!esLetra(norm[i-1]) && !esLetra(norm[fin]) && !marca.slice(i,fin).some(Boolean) && !(soloAp && apellidoAjeno(src, i, soloAp))){ for(let k=i;k<fin;k++) marca[k]=true; rangos.push({i,fin,tid,gk:!!gk}); }
        i=norm.indexOf(p, i+1);
      }
    });
    rangos.sort((a,b)=>a.i-b.i);
    // Nombres de las selecciones (para reconocer un "(México)" que ya venga en el texto).
    const nomEq={};
    [S.A,S.B].forEach(t=>{ nomEq[t.id]=[t.commonName,t.name,t.officialName,codigo(t)].filter(Boolean).map(x=>nl(x)); });
    const esPais=txt=>{ const x=nl(txt); return [S.A,S.B].some(t=>nomEq[t.id].includes(x)); };
    const unaVez=!!CFG.CODIGO_UNA_VEZ && vistos instanceof Set;
    const nombraEq=(t, hasta)=>{ const prev=norm.slice(0,hasta); return nomEq[t.id].some(n=> n.length>=3 && n!==nl(codigo(t)) && new RegExp("(^|[^a-z0-9])"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^a-z0-9])").test(prev)); };
    let out="", k=0;
    rangos.forEach(r=>{
      if(r.i<k) return;
      out+=H(src.slice(k,r.i)) + "<b>"+H(src.slice(r.i,r.fin))+"</b>";
      k=r.fin;
      if(!r.tid) return;
      if(opts.out){ if(!opts.out.tid) opts.out.tid=r.tid; (opts.out.lista=opts.out.lista||[]).push({ tid:r.tid, gk:r.gk, pre:norm.slice(Math.max(0,r.i-12), r.i) }); }
      if(opts.sinCodigo) return;
      const t = r.tid===S.f.teamA ? S.A : S.B; const cod=codigo(t);
      const m=/^\s*\(([^)]{1,40})\)/.exec(src.slice(k));
      // Un "(México)" o "(MEX)" que ya venga en el texto se reemplaza por el código con el estilo elegido.
      if(m && (esPais(m[1]) || nl(m[1])===nl(cod))) k+=m[0].length;
      if(unaVez){
        if(vistos.has(t.id) || nombraEq(t, r.i)){ vistos.add(t.id); return; }
        vistos.add(t.id);
      }
      out+=codigoHTML(t);
    });
    out+=H(src.slice(k));
    return out;
  }
  // Foto (el mismo recuadro del perfil) de quien anota o recibe la tarjeta: jugador o entrenador.
  // Imagen (16:9, mismo alto que las fotos) para momentos sin jugador: revisión del VAR, la asistencia
  // (foto exterior del estadio) y la pausa de hidratación (solo en la Copa del Mundo).
  function imagenContexto(it){
    if(it.silbato) return "";
    const txt=nl((it.title||"")+" "+textoDe(it));
    const img=(src, t)=>`<div class="ml-foto ml-foto-ancha" title="${H(t)}"><img src="${src}" alt=""></div>`;
    // VAR e hidratación: imágenes del Mundial → solo en partidos de la Copa del Mundo.
    const wc=(typeof matchIsWorldCup==="function") ? (!S.f.friendly && S.f.stage!=="amistoso" && matchIsWorldCup(S.f)) : false;
    if(wc && /hidrataci|rehidrataci|cooling break|pausa para (beber|refrescarse)/.test(txt)) return img("logos/hidratacion-wc26.jpg", "Pausa de hidratación");
    // VAR: solo cuando el VAR ACTÚA (revisión, monitor, anula/confirma/otorga…), no cuando se presenta al
    // cuerpo arbitral ("…; en el VAR, Fulano") ni en la sección Previo.
    const varActua = /videoarbitr|video arbitr|monitor|revis|consulta|chequeo|anula|confirma|valida|otorga|concede|cancela|senal|interv|llama al arbitro|on.field review/.test(txt);
    const presentaArbitros = /(arbitro|asistente|cuarto arbitro|terna|cuerpo arbitral|silbante|designad|encabez|dirigir|dirige|a cargo)/.test(txt) && !varActua;
    if(wc && !it.previo && it.half!==0 && !presentaArbitros && /(^|[^a-z])var([^a-z]|$)|videoarbitr|video arbitr|revision en el monitor|revisa (la jugada )?en el monitor|monitor del var/.test(txt) && varActua) return img("logos/var-wc26.jpg", "VAR");
    // Asistencia DEL PÚBLICO: foto exterior del estadio, en cualquier partido (también amistosos). No cuenta la
    // asistencia médica ni la asistencia de gol (pase).
    const asistenciaPublico = /asistencia( oficial| total| record| de publico| en (el )?estadio)?:? (de )?\d|asistencia (oficial|total|record|de publico)|\d[\d.,]* (aficionados|espectadores|personas)/.test(txt) && !/asistencia medica|atencion medica/.test(txt);
    if(asistenciaPublico || /espectadores|aficionados en (las gradas|el estadio)|entradas vendidas|lleno total|estadio lleno|boletos agotados/.test(txt)){
      let st=null; try{ if(typeof findStadiumForVenue==="function" && S.f.venue) st=findStadiumForVenue(S.f.venue); }catch(e){}
      let src=null; try{ src = st && typeof stadiumExteriorUrl==="function" ? stadiumExteriorUrl(st) : null; }catch(e){}
      if(!src && typeof stadiumGenericImageUrl==="function"){ try{ src=stadiumGenericImageUrl(); }catch(e){} }
      if(src) return img(src, st ? ((typeof stadiumOfficialName==="function") ? stadiumOfficialName(st) : (S.f.venue||"")) : (S.f.venue||""));
    }
    return "";
  }
  function fotoSuceso(it){
    // Jugador del partido. Copa del Mundo: press wall del premio con el jugador al frente (16:9, como la foto
    // del VAR). Amistosos y otros torneos: la foto del jugador (el mismo recuadro que cuando anota un gol).
    if(it.potm && window.JugadorPartido && JugadorPartido.esMundial(S.f)){ const ph=JugadorPartido.potmPhotoHTML(S.f); return ph ? `<div class="ml-foto ml-foto-ancha ml-foto-potm">${ph}</div>` : ""; }
    if(it.potm && window.JugadorPartido){
      const P=JugadorPartido.potmOf(S.f); const per=P && P.player; if(!per) return "";
      const src = per.photo || (typeof personPhotoDefault==="function" ? personPhotoDefault(per) : "");
      return src ? `<div class="ml-foto" title="${H(P.name||"")}"><img src="${src}" alt=""></div>` : "";
    }
    if(!(it.tipo==="goal" || it.tipo==="yellow" || it.tipo==="red")) return imagenContexto(it);
    const ev=it.matched && it.matched[0]; if(!ev || !ev.ref) return "";
    const r=ev.ref; let per=null;
    try{
      if(r.coachId && typeof getCoachWithTeam==="function") per=getCoachWithTeam(r.coachId).coach;
      else if(r.playerId && typeof getPlayerWithTeam==="function") per=getPlayerWithTeam(r.playerId).player;
    }catch(e){}
    if(!per) return imagenContexto(it);
    const src = per.photo || (typeof personPhotoDefault==="function" ? personPhotoDefault(per) : "");
    if(!src) return "";
    return `<div class="ml-foto" title="${H(r.player||"")}"><img src="${src}" alt=""></div>`;
  }
  function esAutogol(it){ return it.tipo==="goal" && (it.matched.some(e=>e.og) || /autogol|en propia|en contra/.test(nl(it.title))); }
  // Equipo de la ACCIÓN de un suceso (la bandera del encabezado):
  //   · goles → el que anota; gol en contra → el AFECTADO (el del jugador que lo hace); tarjetas y cambios → el suyo.
  //   · tiros (a puerta, desviado, bloqueado, al poste, atajado…) → el que ataca (el primer jugador nombrado).
  //   · tiro de esquina → el que lo GANA ("para México"; si no, el rival del defensor que se nombra).
  //   · fuera de lugar, faltas y manos → el que las COMETE ("Falta de X"; si solo dice "sobre X", el rival).
  //   · cualquier otro texto → si solo nombra a un equipo, ese; si nombra a los dos (saludo de capitanes,
  //     sorteo…) o a ninguno, SIN bandera. Silbatazos: sin bandera.
  function equipoAccion(it, nom){
    if(it.potm) return it.potmTeam || null;   // Jugador del partido: la selección del jugador
    if(it.tanda) return it.teamId ? (getTeam(it.teamId)||null) : null;   // tanda de penales: el equipo que cobra
    if(it.silbato) return null;
    // El PREVIO y los momentos de ambos equipos (sorteo, saludo de capitanes, himnos…) van sin bandera.
    if(it.previo || it.half===0) return null;
    if(!(it.matched && it.matched.length) && /capitanes|sorteo|himno|saludo|apreton de manos|se dan la mano|minuto de silencio|foto oficial|salen a la cancha|saltan a la cancha/.test(nl((it.title||"")+" "+(it.desc||"")))) return null;
    const A=S.f.teamA, B=S.f.teamB, otro=tid=> tid===A ? B : (tid===B ? A : null);
    const ev=it.matched && it.matched[0];
    let tid=null;
    if(ev && ev.teamId){ tid = (ev.tipo==="goal" && ev.og) ? otro(ev.teamId) : ev.teamId; }
    else {
      const t=nl(it.title||"").replace(/^[^a-z0-9]+/,"");
      const txt=nl((it.title||"")+" "+textoDe(it));
      const jug=[].concat(nom.ti||[], nom.de||[]);                    // jugadores en orden (título primero)
      // Selección nombrada en el texto ("Córner para México", "Falta de Serbia").
      const eqNom=(()=>{ let mejor=null, pos=1e9;
        [S.A,S.B].forEach(T=>{ [T.commonName,T.name].filter(Boolean).map(x=>nl(x)).forEach(n=>{
          const m=new RegExp("(^|[^a-z0-9])"+n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")+"($|[^a-z0-9])").exec(txt);
          if(m && m.index<pos){ pos=m.index; mejor=T.id; } }); });
        return mejor; })();
      const sobre=x=> /(^|[^a-z])(sobre|a|contra)\s*$/.test(x.pre);   // "falta SOBRE X" → X es la víctima
      if(/esquina|corner/.test(t)){
        tid = eqNom || (jug[0] ? otro(jug[0].tid) : null);
      } else if(/fuera de lugar|fuera de juego|offside|posicion adelantada/.test(t)){
        tid = eqNom || (jug[0] ? jug[0].tid : null);
      } else if(/^(falta|mano)\b/.test(t)){
        const autor=jug.find(x=>!sobre(x));
        tid = autor ? autor.tid : (jug[0] ? otro(jug[0].tid) : eqNom);
      } else if(/^ocasion/.test(t)){
        // OCASIÓN = siempre un ataque. Si sale el PORTERO (atajada, despeje, se queda con el balón), la
        // bandera es del equipo CONTRARIO al portero; si no, la del equipo de los jugadores que atacan.
        const portero=jug.find(x=>x.gk);
        tid = portero ? otro(portero.tid) : (jug[0] ? jug[0].tid : eqNom);
      } else if(esPenalFallado(it.title, textoDe(it)) || /^(tiro|remate|disparo|cabezazo|chut|poste|travesano|larguero)/.test(t) || /remate al poste|al poste|tiro a puerta|tiro desviado|tiro bloqueado/.test(t)){
        // El que remata: el primer jugador nombrado que NO sea portero ("¡Otra vez Ronwen Williams! …
        // Raúl Jiménez la desvía…" → México). Si solo se nombra al portero, ataca el rival.
        const tirador=jug.find(x=>!x.gk);
        tid = tirador ? tirador.tid : (jug[0] ? otro(jug[0].tid) : eqNom);
      } else if(/tiro libre/.test(t)){
        tid = eqNom || (jug[0] ? jug[0].tid : null);
      } else {
        const set=new Set(jug.map(x=>x.tid)); if(eqNom) set.add(eqNom);
        tid = set.size===1 ? [...set][0] : null;
      }
    }
    if(!tid) return null;
    return tid===A ? S.A : (tid===B ? S.B : null);
  }
  // Encabezado a mostrar: un bloque de cambios dice "Cambio" (uno) o "Cambios" (más de uno).
  function tituloDe(it){
    const ti=it.title||"";
    if(it.tipo==="sub" && it.matched && it.matched.length){
      const pal = it.matched.length>1 ? "Cambios" : "Cambio";
      const m=/^\s*(cambios?|sustituci[oó]n(?:es)?)\b/i.exec(ti);
      if(m || !ti.trim()) return pal + (m ? ti.slice(m[0].length) : "");
    }
    return ti;
  }
  // Icono del suceso (events.svg): gol / gol en contra / penal anotado / penal fallado, amarilla, roja o
  // doble amarilla, cambio, silbato (solo silbatazos, con sonido), fuera de juego y VAR. Faltas y manos van sin icono.
  function iconoSuceso(it){
    const E=JI().evIcon; if(!E) return (ICONO[it.tipo]||(()=>""))();
    const B=22;   // caja común: todos los iconos guardan la misma separación con el texto
    const ti=nl(it.title||"").replace(/^[^a-z0-9]+/,""), txt=nl((it.title||"")+" "+(it.desc||""));
    const ev=it.matched && it.matched[0];
    if(it.tanda) return it.tiro ? E(it.anotado?"penok":"penmiss", 16, "", it.anotado?"Penal anotado":"Penal fallado", B) : "";
    // Penal ANOTADO (tiempo regular o tanda): balón con palomita. Penal FALLADO: balón con X.
    const tanda=/tanda de penal|serie de penal|definicion (por|desde|en) (los )?penal|ronda de penal|tanda desde los once/.test(txt);
    if(it.tipo==="goal"){
      if(esAutogol(it)) return E("og", 16, "", "", B);
      const pen = ev ? (!!ev.pen || tanda) : (tanda || /^(penal|penalti)/.test(ti) || /gol de penal|de penal\b|desde el punto penal|desde los once/.test(txt));
      return pen ? E("penok", 16, "", "Gol - Penal anotado", B) : E("goal", 16, "", "", B);
    }
    if(it.tipo==="penmiss" || esPenalFallado(it.title, it.desc) || (tanda && /^(penal|penalti)/.test(ti) && RX_PEN_MISS_TI.test(txt))) return E("penmiss", 16, "", "Penal fallado", B);
    if(tanda && /^(penal|penalti)/.test(ti)) return E("penok", 16, "", "Penal anotado", B);
    if(it.tipo==="yellow") return E("yellow", 11, "", "", B);
    if(it.tipo==="red"){ const doble = ev && ev.ref && JI().mrDobleAmarilla ? JI().mrDobleAmarilla(S.f, ev.ref) : /segunda amarilla|doble amarilla/.test(txt); return doble ? E("double", 13, "", "", B) : E("red", 11, "", "", B); }
    if(it.tipo==="sub") return E("sub", 11, "", "", B);
    if(it.silbato) return E("whistle", 21, "", "", B);
    if(/^(var|revision)|(^|[^a-z])var([^a-z]|$)/.test(ti)) return E("var", 20, "", "", B);
    if(/^(fuera de lugar|fuera de juego|posicion adelantada|offside)/.test(ti)) return E("offside", 16, "", "", B);   // banderín
    return "";
  }
  function filaHTML(it, actual){
    const ic=iconoSuceso(it);
    const mn=it.half===0 ? `<span class="ml-min ml-min-prev">PREVIO</span>` : it.tanda ? `<span class="ml-min ml-min-prev">PENALES</span>` : (it.post ? `<span class="ml-min ml-min-prev">POST</span>` : `<span class="ml-min">${H(it.minLabel)}’</span>`);
    const tag=(it.tipo==="goal" && it.marcador) ? `<span class="ml-tag">${H(it.marcador)}</span>` : (it.marcadorTanda ? `<span class="ml-tag">${H(it.marcadorTanda)}</span>` : "");
    const cls=["ml-row", "ml-k-"+it.tipo, actual?"ml-now-row":""].join(" ");
    const de=textoDe(it);
    const foto = actual ? fotoSuceso(it) : "";   // la foto solo en el suceso PRINCIPAL; en el historial se quita
    // Nombres en negritas (título y descripción) SIN código; la bandera del equipo de la acción va una sola
    // vez, al lado del ENCABEZADO.
    const enTi={}, enDe={};
    let tiHTML=conNegritas(tituloDe(it), null, {sinCodigo:true, out:enTi});
    // «Superior Player of the Match» (Mundial): encabezado en dos líneas, SIEMPRE con el jugador en la segunda.
    if(it.potm && window.JugadorPartido && JugadorPartido.esMundial(S.f)){
      const i=tiHTML.indexOf(":");
      if(i>=0) tiHTML=tiHTML.slice(0,i+1)+"<br>"+tiHTML.slice(i+1).replace(/^\s+/,"");
      else { const P=JugadorPartido.potmOf(S.f); if(P && P.name) tiHTML+=":<br>"+conNegritas(P.name, null, {sinCodigo:true}); }
    }
    const deHTML=de ? conNegritas(de, null, {sinCodigo:true, out:enDe}) : "";
    const eq=equipoAccion(it, { ti:enTi.lista||[], de:enDe.lista||[] });
    const marca = eq ? codigoHTML(eq) : "";
    return `<div class="${cls}${esAutogol(it)?" ml-k-og":""}">${mn}<div class="ml-txt"><div class="ml-ti">${ic}<span>${tiHTML}${marca}</span>${tag}</div>${de?`<div class="ml-de">${deHTML}</div>`:""}</div>${foto}</div>`;
  }
  function pintarRelato(it){
    const now=document.getElementById("ml-now"), hist=document.getElementById("ml-hist");
    if(!now||!hist) return;
    if(S.actual){ hist.insertAdjacentHTML("afterbegin", filaHTML(S.actual,false)); }
    now.innerHTML=filaHTML(it,true)+`<div class="ml-read"><i></i></div>`;
    S.actual=it;
    ajustarHistorial();
  }
  // Debajo de la acción actual solo caben 3 avisos; los demás se ven al hacer scroll.
  function ajustarHistorial(){
    const hist=document.getElementById("ml-hist"); if(!hist) return;
    hist.scrollTop=0; return;   // altura FIJA por CSS (principal + 3 avisos); el resto, con scroll
    const rows=hist.querySelectorAll(".ml-row, .ml-note");
    if(rows.length<=3){ hist.style.maxHeight=""; return; }
    const top=hist.getBoundingClientRect().top;
    const h=rows[3].getBoundingClientRect().top - top;   // corta justo antes del 4º aviso
    hist.style.maxHeight=Math.ceil(h)+"px";
    hist.scrollTop=0;
  }

  /* ----- reloj ----- */
  // Reloj de partido MM:SS. Al llegar al 45:00 / 90:00 se detiene y debajo aparece la reposición
  // anunciada (+N) con un reloj pequeño de los minutos que se están jugando de ella.
  function mmss(min){ const tot=Math.max(0, Math.floor(min*60+1e-6)); return String(Math.floor(tot/60)).padStart(2,"0")+":"+String(tot%60).padStart(2,"0"); }
  function relojTxt(){
    if(S.ended && S.enTanda) return { fase:"Tanda de penales", min:"PEN" };
    if(S.ended) return { fase:"Final", min:"FT" };
    if(S.halfTime){
      if(S.half===2) return { fase:"Final del tiempo reglamentario", min:"FTR" };
      if(S.half===3) return { fase:"Medio tiempo de la prórroga", min:"MTP" };
      return { fase:"Medio tiempo", min:"MT" };
    }
    if(S.half===0) return { fase:"Previo", min:"00:00" };
    const tope=[0,45,90,105,120][S.half]||90;
    const fase=["","1er tiempo","2do tiempo","1er tiempo extra","2do tiempo extra"][S.half]||"2do tiempo";
    if(S.t < tope-1e-9) return { fase, min:mmss(S.t) };
    const anun = S.anuncio && S.anuncio[S.half];
    return { fase, min:mmss(tope), add: anun, extra: mmss(S.t-tope) };
  }
  function pintarReloj(){
    const r=relojTxt();
    const fa=document.getElementById("ml-fase"), mi=document.getElementById("ml-clock"), pb=document.getElementById("ml-prog");
    if(fa) fa.textContent=r.fase;
    if(mi && mi.textContent!==r.min) mi.textContent=r.min;
    const wtab=document.getElementById("ml-wctab");
    if(wtab){
      // Marcador del Mundial: pestaña negra bajo el reloj con el reloj de la reposición y "+N" en turquesa.
      const on=r.extra!=null;
      if(wtab.hidden===on) wtab.hidden=!on;
      const ad2=document.getElementById("ml-add"), wa=document.getElementById("ml-wcadd");
      if(ad2 && on && ad2.textContent!==r.extra) ad2.textContent=r.extra;
      const t2=(on && r.add!=null) ? "+"+r.add : "";
      if(wa && wa.textContent!==t2) wa.textContent=t2;
    }
    const ad=wtab ? null : document.getElementById("ml-add");
    if(ad){
      const html = r.extra!=null ? `${r.add!=null?`<span class="ml-addtag">+${r.add}</span>`:""}<span class="ml-addclk">${r.extra}</span>` : "";
      if(ad.dataset.h!==html){ ad.dataset.h=html; ad.innerHTML=html; }
    }
    if(pb){
      let p=0;
      if(S.ended) p=1;
      else if(TE && S.teVisible){
        // 120' repartidos: cada tiempo pesa sus minutos (45 · 45 · 15 · 15).
        if(S.half===1) p=0.375*Math.min(1, S.t/Math.max(45,S.finT1));
        else if(S.half===2) p=0.375+0.375*Math.min(1, (S.t-45)/Math.max(45,S.finT2-45));
        else if(S.half===3) p=0.75+0.125*Math.min(1, (S.t-90)/Math.max(15,(S.finT3||105)-90));
        else p=0.875+0.125*Math.min(1, (S.t-105)/Math.max(15,(S.finT4||120)-105));
      }
      else if(S.half===1) p=0.5*Math.min(1, S.t/Math.max(45,S.finT1));
      else if(S.half===2) p=0.5+0.5*Math.min(1, (S.t-45)/Math.max(45,S.finT2-45));
      pb.style.width=(p*100).toFixed(2)+"%";
    }
    const rd=document.querySelector("#ml-now .ml-read i");
    if(rd) rd.style.width = (S.mode==="hold" && S.holdTotal>0) ? (100*(1-S.holdLeft/S.holdTotal)).toFixed(1)+"%" : "100%";
    const bt=document.getElementById("ml-play");
    if(bt){
      const est = (S.mode==="done") ? "fin" : (S.playing ? "pausa" : "juego");
      if(bt.dataset.est!==est){
        bt.dataset.est=est;
        if(est==="pausa"){ bt.innerHTML=`${SVG_PAUSA}<span>PAUSA</span>`; bt.title="Pausa (barra espaciadora)"; }
        else if(est==="juego"){ bt.innerHTML=`${SVG_PLAY}<span>JUEGA</span>`; bt.title="Juega (barra espaciadora)"; }
        else { bt.innerHTML=`<span class="ml-pi">↺</span><span>REPETIR</span>`; bt.title="Repetir el partido"; }
      }
    }
    pintarLineaTiempo();
  }
  const SVG_PAUSA=`<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="14" y="5" width="4" height="14" rx="1.4" fill="currentColor"/></svg>`;
  const SVG_PLAY=`<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.2-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" fill="currentColor"/></svg>`;
  function velocidadHTML(){
    return VELOCIDADES.map(v=>`<button type="button" class="ml-vel${v===VELOCIDAD?" on":""}" data-vel="${v}" title="Velocidad ${v.toFixed(1)}x">${v.toFixed(1)}x</button>`).join("");
  }
  function ponerVelocidad(v){
    VELOCIDAD=v;
    document.querySelectorAll("#ml-root .ml-vel").forEach(b=>b.classList.toggle("on", +b.dataset.vel===v));
  }

  /* ----- revelar un suceso ----- */
  function revelar(it){
    S.half=it.half; S.t=it.t;
    if(it.silbato==="k2" || it.silbato==="e1" || it.silbato==="e2") S.halfTime=false;
    if(it.silbato) silbatazo(it.silbato);
    let cambio=false, gol=false;
    it.matched.forEach(ev=>{
      if(S.revealed.has(ev.ref)) return;
      S.revealed.add(ev.ref); cambio=true;
      if(ev.tipo==="goal"){ gol=true; if(ev.teamId===S.f.teamA) S.sa++; else S.sb++; }
    });
    if(it.tanda) S.enTanda = !!it.tiro || it.title==="Tanda de penales";   // reloj: "PEN" mientras se cobran
    if(it.tiro && !S.revealed.has(it.tiro)){ S.revealed.add(it.tiro); cambio=true; }   // tiro de la tanda: al resumen de incidencias
    if(gol) it.marcador=marcadorTxt();
    if(SIL_DESCANSO.has(it.silbato)) S.halfTime=true;
    if(it.silbato==="fr"){
      // Termina el tiempo reglamentario: desde aquí la línea y la barra se redistribuyen con el tiempo extra.
      S.teVisible=true;
      try{ document.querySelectorAll("#ml-root .ml-track").forEach(tr=>{ tr.querySelectorAll(".ml-mt").forEach(x=>x.remove()); tr.insertAdjacentHTML("beforeend", marcasProgHTML()); }); }catch(e){}
      pintarDinamico();
    }
    if(it.silbato==="ft") S.ended=true;
    if(S.v2items) S.v2items.add(it);
    califPorSucesos(it);
    pintarRelato(it);
    if(cambio) pintarDinamico();
    if(gol){ pintarMarcador(true); try{ silbatazo("gol"); }catch(e){} }   // el árbitro valida el gol
    try{ aficionPorSuceso(it, gol); }catch(e){}
    avanzarPosesion(); pintarEstadisticas(); pintarCalificaciones();
    if(S.ended){ terminar(); }
  }
  function terminar(){
    S.root.classList.remove("ml-live");
    try{ if(S.v2 && window.CalificacionesV2) S.v2final=CalificacionesV2.final(S.v2); }catch(e){}
    // El informe completo manda: marcador, alineaciones con calificaciones finales y estadísticas.
    S.sa=S.f.scoreA; S.sb=S.f.scoreB;
    pintarDinamico();
    pintarEstadisticas();
    pintarLineaTiempo();
    const bd=S.root.querySelector(".ml-livebadge"); if(bd){ bd.classList.add("fin"); bd.innerHTML="FINAL"; }
    // Al terminar el en vivo: abajo, el rectángulo del Jugador del partido (como en el informe).
    try{ const pm=document.getElementById("ml-potm"); if(pm && pm.hidden && window.JugadorPartido){ const h=JugadorPartido.potmCardHTML(S.f); if(h){ pm.innerHTML=h; pm.hidden=false; } } }catch(e){}
    const tm=S.root.querySelector("#ml-card .jg-nm-center .teams");
    if(tm && S.root.dataset.cardA) tm.innerHTML=`${S.root.dataset.cardA} <span class="jg-nm-sc ml-sc">${S.sa} - ${S.sb}</span> ${S.root.dataset.cardB}`;
  }

  /* ----- bucle ----- */
  function paso(dt){
    while(dt>0 && S.mode!=="done"){
      if(S.mode==="hold"){
        const k=Math.min(dt,S.holdLeft); S.holdLeft-=k; dt-=k;
        if(S.holdLeft<=0){
          S.mode="next";
          // MEDIO TIEMPO: el partido se detiene y se reanuda con el botón Juego (o la barra espaciadora).
          // Igual al terminar los 90 (antes del tiempo extra) y en el descanso del tiempo extra.
          if(S.actual && SIL_DESCANSO.has(S.actual.silbato) && !(S.pausas||(S.pausas={}))[S.actual.silbato]){ S.pausas[S.actual.silbato]=true; pause(); break; }
          // Antes de la TANDA DE PENALES: pausa como en el medio tiempo; sigue con JUEGA (o la barra espaciadora).
          if(S.actual && S.actual.silbato==="ft" && S.items.some(x=>x.tanda) && !(S.pausas||(S.pausas={})).tanda){ S.pausas.tanda=true; pause(); break; }
        } else break;
      }
      if(S.mode==="next"){
        if(S.idx>=S.items.length){ S.mode="done"; S.playing=false; break; }
        const it=S.items[S.idx];
        if(it.half===0 || it.half!==S.half || it.t<=S.t+1e-9){
          S.idx++; revelar(it);
          S.holdTotal=S.holdLeft=readMs(it); S.mode="hold";
        } else {
          // Tramo hasta el siguiente suceso: su duración depende de los minutos que los separan.
          const gap=it.t-S.t;
          S.adv={ from:S.t, to:it.t, el:0, ms:Math.min(CFG.PAUSA_MAX_MS, CFG.PAUSA_BASE_MS*Math.pow(Math.max(gap,0.02), CFG.PAUSA_EXP)) };
          S.mode="advance";
        }
      }
      if(S.mode==="advance"){
        const a=S.adv;
        const k=Math.min(dt, a.ms-a.el); a.el+=k; dt-=k;
        S.t = a.from + (a.to-a.from)*Math.min(1, a.el/a.ms);
        if(a.el>=a.ms-1e-6){ S.t=a.to; S.mode="next"; }
      }
    }
  }
  function frame(ts){
    if(!S) return;
    if(!S.root.isConnected){ stop(); return; }   // se salió de la pantalla por cualquier vía
    const dt=S.lastTs==null?0:Math.min(120, ts-S.lastTs);
    S.lastTs=ts;
    if(S.playing){
      paso(dt*VELOCIDAD*CFG.RITMO_BASE);
      if(S && !S.ended && avanzarPosesion()){ pintarEstadisticas(); pintarCalificaciones(); }
    }
    if(!S) return;
    pintarReloj();
    S.raf=requestAnimationFrame(frame);
  }

  function play(){
    if(!S) return;
    if(S.mode==="done"){ reiniciar(); return; }
    S.playing=true; S.lastTs=null;
    const ini=document.querySelector("#ml-feed .ml-start"); if(ini) ini.remove();
    const fd=document.getElementById("ml-feed"); if(fd) fd.classList.remove("ml-esperando");
    const ctx=audio(); if(ctx && ctx.state==="suspended") ctx.resume();
    // Cortinilla de la transmisión: la PRIMERA vez que se pulsa JUEGA (y se retoma si se pausó a la mitad).
    try{
      if(!S.introHecha && cortinillaActiva()){
        S.introHecha=true;
        const a=new Audio(CFG.AFICION_CARPETA+"cortinilla-mundial.mp3"); a.volume=Math.max(0,Math.min(1,+CFG.CORTINILLA_VOL||0));
        a.addEventListener("ended", ()=>{ if(S && S.intro===a) S.intro=null; });
        S.intro=a; const pr=a.play(); if(pr && pr.catch) pr.catch(()=>{});
      } else if(S.intro && S.intro.paused){ S.intro.play().catch(()=>{}); }
    }catch(e){}
    try{ if(!S.ended){ ambienteNivel(S.halfTime?0.25:0.6, 1200); reanudarAficion(); } }catch(e){}
    try{ if(aficionIniciar() && !S.halfTime && !S.ended) aficionNivel(AF.base, 1.5); }catch(e){}
    pintarReloj();
  }
  function pause(){
    if(!S) return;
    S.playing=false;
    try{ if(S.intro) S.intro.pause(); }catch(e){}
    try{ silenciarAficion(true); }catch(e){}
    // El audio se suspende al pausar, pero DESPUÉS de que termine el silbatazo en curso: si no, el del medio
    // tiempo se quedaba a la mitad y terminaba de sonar al pulsar JUEGA (junto con los cambios del descanso).
    try{
      if(AC && AC.state==="running"){
        const resta=Math.max(0, SILBATO_HASTA-AC.currentTime);
        if(resta>0.02) setTimeout(()=>{ try{ if(AC && AC.state==="running" && !(S && S.playing)) AC.suspend(); }catch(e){} }, Math.ceil(resta*1000)+60);
        else AC.suspend();
      }
    }catch(e){}
    pintarReloj();
  }
  function toggle(){ if(!S) return; (S.playing && S.mode!=="done") ? pause() : play(); }
  function reiniciar(){ if(!S) return; const id=S.f.id; show(id); }

  function stop(){
    if(!S) return;
    try{ cancelAnimationFrame(S.raf); }catch(e){}
    try{ silenciarAficion(false); }catch(e){}
    try{ if(S.intro){ S.intro.pause(); S.intro=null; } }catch(e){}
    S=null;
    try{ if(AF){ AF.master.gain.cancelScheduledValues(0); AF.master.gain.value=0; AF.rug.gain.cancelScheduledValues(0); AF.rug.gain.value=0; } }catch(e){}
    try{ if(AC && AC.state==="running") AC.suspend(); }catch(e){}
  }

  /* =========================================================
     MONTAJE
     ========================================================= */
  // Abrir (acción del usuario): entra al historial (← → y atrás lo recorren) y muestra.
  function open(fxId){
    if(!(DB.fixtures||[]).some(x=>x.id===fxId)) return;
    try{
      if(typeof navHistory!=="undefined"){
        if(typeof saveScrollToCurrent==="function") saveScrollToCurrent();
        navHistory=navHistory.slice(0, navIndex+1);
        navHistory.push({ live:fxId });
        if(typeof MAX_NAV_HISTORY==="number" && navHistory.length>MAX_NAV_HISTORY) navHistory=navHistory.slice(navHistory.length-MAX_NAV_HISTORY);
        navIndex=navHistory.length-1;
        if(typeof renderNavButtons==="function") renderNavButtons();
      }
    }catch(e){}
    audio();   // el clic del usuario habilita el audio
    show(fxId);
  }

  function show(fxId){
    stop();
    const f=(DB.fixtures||[]).find(x=>x.id===fxId); if(!f) return;
    const A=getTeam(f.teamA), B=getTeam(f.teamB); if(!A||!B) return;
    TE=tieneTE(f);   // tiempo extra: antes de armar la pantalla (barra de avance, línea de tiempo)
    if(!JI().abrirPantalla) return;
    const gv=JI().abrirPantalla(fxId);   // pantalla completa, como el informe (Esc / X cierran igual)
    if(!gv) return;
    injectCSS();

    const detail=call("calDetailCardHTML", f, A, {clickable:false, noIncidents:true});
    gv.innerHTML=`<div class="mr-screen ml-screen ml-live" id="ml-root">
      <button class="mr-x" data-mr-close title="Cerrar">×</button>
      <div class="mr-body"><div class="mr-grid">
        <div class="mr-topcard">
          <div id="ml-card">${detail}</div>
        </div>
        <div class="mr-side mr-side-l" id="ml-side-l"></div>
        <div class="mr-center">
          <div class="ml-panel">
            <div class="ml-bar${esMundialVivo(f)?" ml-wc":""}">
              <button class="ml-play" id="ml-play" type="button"></button>
              ${esMundialVivo(f) ? marcadorMundialHTML(f, A, B) : `
              <div class="ml-clock" id="ml-clock">00:00</div>
              <div class="ml-sb">
                <div class="ml-sbt l"><span class="ml-sbf">${call("flagImg",A,26)}</span><span class="ml-sbc">${H(codigo(A))}</span></div>
                <div class="ml-sbs ml-sc">0 - 0</div>
                <div class="ml-sbt r"><span class="ml-sbc">${H(codigo(B))}</span><span class="ml-sbf">${call("flagImg",B,26)}</span></div>
              </div>
              <div class="ml-add" id="ml-add"></div>
              <div class="ml-track"><div class="ml-prog" id="ml-prog"></div>${marcasProgHTML()}</div>`}
              <div class="ml-vels">${velocidadHTML()}</div>
            </div>
            <div class="ml-feed" id="ml-feed">
              <div class="ml-now" id="ml-now"><div class="ml-row ml-wait"><span class="ml-min ml-min-prev">…</span><div class="ml-txt"><div class="ml-de">Cargando el relato del partido…</div></div></div></div>
              <div class="ml-hist" id="ml-hist"></div>
            </div>
          </div>
          <div class="mr-incidents" id="ml-inc" hidden></div>
          <div id="ml-tl"></div>
          <div id="ml-stats"></div>
          ${call("mrKitsHTML", f, A, B)}
          ${call("mrOfficialsHTML", f)}
          <div id="ml-potm" hidden></div>
        </div>
        <div class="mr-side mr-side-r" id="ml-side-r"></div>
      </div></div></div>`;
    try{ if(typeof renderKitPreviews==="function") renderKitPreviews(); }catch(e){}
    try{ call("mrRenderRefKit"); }catch(e){}

    // Marcador del Mundial: escala según el ancho de la barra (y al cambiar el tamaño de la ventana).
    if(!window.__mlWcResize){ window.__mlWcResize=true; window.addEventListener("resize", ()=>{ try{ escalarMundial(); }catch(e){} }); }
    // Marcador en vivo dentro del rectángulo (el informe lo pinta solo si el partido ya se jugó).
    const root=document.getElementById("ml-root");
    const teams=root.querySelector("#ml-card .jg-nm-center .teams");
    if(teams){
      const ln=teams.querySelectorAll(".jg-lnk2");
      const a=ln[0]?ln[0].outerHTML:H(nombreEq(A)), b=ln[ln.length-1]?ln[ln.length-1].outerHTML:H(nombreEq(B));
      // En vivo, el rectángulo de datos muestra solo "México - Serbia": el marcador va en la barra de
      // control. Al final del partido vuelve a mostrar el resultado.
      teams.innerHTML=`${a} <span class="ml-vs">-</span> ${b}`;
      root.dataset.cardA=a; root.dataset.cardB=b;
      // Etiqueta EN VIVO hasta arriba del bloque (antes del wordmark).
      teams.parentElement.insertAdjacentHTML("afterbegin", `<div class="ml-livewrap"><span class="ml-livebadge"><i></i>EN VIVO</span></div>`);
    }
    const att=root.querySelectorAll("#ml-card .jg-nm-center .ref");   // asistencia (si el informe la trae)
    if((f.attendance!=null || f.clima) && att.length && !/Asistencia|Clima:/.test(root.querySelector("#ml-card").textContent)){
      const lin = JI().mrAsistenciaClimaHTML ? JI().mrAsistenciaClimaHTML(f) : (f.attendance!=null ? `Asistencia: ${Number(f.attendance).toLocaleString("es-MX")}` : "");
      if(lin) att[0].insertAdjacentHTML("beforebegin", `<div class="ref">${lin}</div>`);
    }

    medirRelato(root);
    const token={};
    S={ f, A, B, root, token, items:[], idx:0, half:0, t:0, mode:"next", holdLeft:0, holdTotal:0, playing:false,
        revealed:new Set(), sa:0, sb:0, halfTime:false, ended:false, actual:null, raf:0, lastTs:null, finT1:45, finT2:95,
        cap:{home:null, away:null}, jug:[], rt:null, final:{}, prog:null, empujes:[] };
    ["home","away"].forEach(side=>{ const lu=f.lineups&&f.lineups[side]; const c=lu&&(lu.players||[]).find(p=>p.captain); if(c) S.cap[side]=claveJ(c.playerId,c.name); });
    TE=tieneTE(f);
    S.jug=indexarJugadores();
    S.otros=otrosNombres(f, A, B);
    escalarMundial();
    prepararCalificaciones();
    pintarDinamico();
    root.querySelector("#ml-play").addEventListener("click", e=>{ toggle(); try{ e.currentTarget.blur(); }catch(_){} });
    root.querySelectorAll(".ml-vel").forEach(b=>b.addEventListener("click", e=>{ ponerVelocidad(+b.dataset.vel); try{ e.currentTarget.blur(); }catch(_){} }));
    S.raf=requestAnimationFrame(frame);

    loadNarrative(f, (text, name)=>{
      if(!S || S.token!==token) return;   // el usuario ya salió
      const raw=text?parseNarrative(text):[];
      S.items=buildTimeline(f, raw);
      const ht=S.items.find(it=>it.silbato==="ht"), ft=S.items.find(it=>it.silbato==="ft");
      S.finT1=ht?ht.t:45; S.finT2=ft?ft.t:95;
      if(TE){
        const fr=S.items.find(it=>it.silbato==="fr"), eht=S.items.find(it=>it.silbato==="eht");
        S.finT2=fr?fr.t:95; S.finT3=eht?eht.t:105; S.finT4=ft?ft.t:120; S.tramos=null;
      }
      S.items.forEach(it=>{ if(!it.silbato && it.half>0 && !it.post && !it.tanda) it.analisis=analizarRelato(it); });   // Post (y Jugador del partido): fuera de toda estadística
      // Reposición anunciada: la del relato; si no la trae, la generada de la sesión.
      const repo=reposicionGenerada(f); S.anuncio={1:null,2:null,3:null,4:null};
      S.items.forEach(it=>{ if(it.half>0 && !it.post && it.tipo==="texto"){ const n=anuncioDe(it); if(n!=null && S.anuncio[it.half]==null) S.anuncio[it.half]=n; } });
      // Sin anuncio en el relato: se toma la reposición REAL de ese tiempo (la del silbatazo final según el
      // informe); solo si tampoco se sabe, la generada de la sesión.
      const finDe={1:"ht", 2:TE?"fr":"ft", 3:"eht", 4:"ft"}, topeDe={1:45,2:90,3:105,4:120};
      (TE?[1,2,3,4]:[1,2]).forEach(h=>{ if(S.anuncio[h]==null){ const fin=S.items.find(it=>it.silbato===finDe[h]); const ex=fin?Math.round((fin.t-topeDe[h])):0; S.anuncio[h]= ex>0 ? ex : (h<=2 ? repo[h] : null); } });
      programarEstadisticas();
      pintarEstadisticas();
      prepararV2();   // calificaciones v2 en sombra (no cambia lo que se ve)
      S.archivo=name; S.conRelato=!!text;
      // NO arranca solo: espera a JUEGA (o la barra espaciadora).
      const now=document.getElementById("ml-now");
      if(now) now.innerHTML="";
      const feed=document.getElementById("ml-feed");
      if(feed) feed.classList.add("ml-esperando");
      if(feed && !feed.querySelector(".ml-start")) feed.insertAdjacentHTML("beforeend", `<div class="ml-start">Pulsa JUEGA para comenzar el minuto a minuto.</div>`);
      if(!text){
        const h=document.getElementById("ml-hist");
        if(h) h.innerHTML=`<div class="ml-note">Sin relato minuto a minuto: se muestran solo los sucesos del informe.</div>`;
      }
      S.playing=false;
      pintarReloj();
    });
  }

  // Alto fijo del rectángulo del relato = un suceso principal con 4 renglones de descripción + 3 avisos
  // con 1 renglón cada uno (medido con texto de ejemplo y los mismos estilos de la pantalla); si un aviso
  // trae 2 renglones, el tercero se corta. Así el rectángulo siempre mide lo mismo y no queda hueco abajo.
  function medirRelato(root){
    const feed=root.querySelector("#ml-feed"), now=root.querySelector("#ml-now"), hist=root.querySelector("#ml-hist");
    if(!feed||!now||!hist) return;
    const guarda=now.innerHTML;
    const largo="Texto de ejemplo para medir el alto del relato ".repeat(40);
    feed.style.height="auto"; feed.style.visibility="hidden";
    now.innerHTML=`<div class="ml-row ml-now-row ml-k-goal" style="animation:none"><span class="ml-min">90+9'</span><div class="ml-txt"><div class="ml-ti"><span>Gol</span></div><div class="ml-de" style="display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;">${largo}</div></div></div><div class="ml-read"><i></i></div>`;   // exactamente 4 renglones
    // Avisos de referencia: 1 renglón de descripción (lo común). Si alguno trae 2, el tercero se corta.
    hist.innerHTML=[1,2,3].map(()=>`<div class="ml-row"><span class="ml-min">90'</span><div class="ml-txt"><div class="ml-ti"><span>Remate</span></div><div class="ml-de">Remate de ejemplo desde fuera del área.</div></div></div>`).join("");
    const filas=[...hist.children], rowH=Math.max(...filas.map(el=>el.offsetHeight));
    const alto=now.offsetHeight + rowH*3 + 1;
    root.style.setProperty("--ml-rowh", rowH+"px");
    // El rectángulo completo mide siempre lo mismo. El principal toma SOLO el alto que necesita (sin huecos)
    // y los avisos de abajo llenan el resto: se ven los que quepan, el último se corta si hace falta.
    feed.style.height=alto+"px"; feed.style.visibility="";
    now.innerHTML=guarda; hist.innerHTML="";
  }
  function isActive(){ return !!(S && S.root && S.root.isConnected); }

  // Barra espaciadora = Play / Pausa (solo con la pantalla en vivo abierta y sin escribir en un campo).
  // Va en la fase de CAPTURA de window para ganarle al ESPACIO de app/tiempo.js (que avanza el reloj
  // del juego): durante el partido en vivo el espacio solo pausa / reanuda.
  window.addEventListener("keydown", e=>{
    if(!isActive()) return;
    if(e.key!==" " && e.code!=="Space") return;
    const tg=e.target; if(tg && (tg.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(tg.tagName))) return;
    e.preventDefault(); e.stopImmediatePropagation();
    if(!e.repeat) toggle();
  }, true);

  /* =========================================================
     ESTILOS
     ========================================================= */
  let cssDone=false;
  function injectCSS(){
    if(cssDone) return; cssDone=true;
    const st=document.createElement("style"); st.id="motor-partido-css";
    st.textContent=`
/* Cancha en vivo: el expulsado se queda en la formación, atenuado. */
.jgt-slot.mr-expulsado .jgt-facewrap,.jgt-slot.mr-expulsado .jgt-name,.jgt-slot.mr-expulsado .jgt-pos{opacity:.6;}
/* ===== Marcador estilo Copa del Mundo 2026 (ver marcadorMundialHTML) ===== */
@font-face{font-family:'FWC2026';src:url(data:font/woff2;base64,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) format('woff2');font-weight:900;font-style:normal;font-display:block;}
.ml-bar.ml-wc{--u:0.27536px;--w:0.27536px;grid-template-columns:176px auto auto;column-gap:14px;justify-content:start;grid-template-rows:38px 22px;}
.ml-bar.ml-wc .ml-play{grid-column:1;grid-row:1;}
.ml-bar.ml-wc .ml-vels{grid-column:1;grid-row:2;}
/* Reloj: caja clara (Open Sans) y debajo la pestaña negra de la reposición (reloj + "+N" turquesa). */
.wcclk{grid-column:2;grid-row:1 / span 2;align-self:start;position:relative;width:calc(var(--w)*331);height:calc(var(--u)*220);}
.wcclk>*{position:absolute;left:0;width:100%;box-sizing:border-box;}
.wcclk-box{top:0;height:calc(var(--u)*138);background:#f3f3f3;border-radius:calc(var(--u)*33);display:flex;align-items:center;justify-content:center;font-family:'Open Sans',sans-serif;font-weight:700;font-size:calc(var(--u)*90);line-height:1;color:#000;font-variant-numeric:tabular-nums;}
.wcclk-tab{top:calc(var(--u)*103);height:calc(var(--u)*118);background:#000;border-radius:0 0 calc(var(--u)*33) calc(var(--u)*33);display:flex;align-items:center;justify-content:space-between;padding:calc(var(--u)*35) calc(var(--w)*29) 0;font-family:'Open Sans',sans-serif;font-weight:700;font-size:calc(var(--u)*58.7);line-height:1;color:#fff;font-variant-numeric:tabular-nums;}
.wcclk-tab[hidden]{display:none;}
.wcclk-tadd{color:#6ffcdb;}
/* Marcador (origen: borde izquierdo de la franja salmón y parte alta del emblema). */
.wcsb{grid-column:3;grid-row:1;align-self:start;position:relative;width:calc(var(--w)*1293);height:calc(var(--u)*165);margin-top:calc(var(--u)*-14.3);}
.wcsb>*{position:absolute;box-sizing:border-box;}
.wcsb-und{top:calc(var(--u)*14.3);height:calc(var(--u)*138);border-radius:calc(var(--u)*33);}
.wcsb-und.l{left:0;width:calc(var(--w)*646.5);background:linear-gradient(90deg,#fd978a 0 calc(var(--w)*268),#d90000 calc(var(--w)*268));}
.wcsb-und.r{left:calc(var(--w)*648);width:calc(var(--w)*645);background:linear-gradient(90deg,#b2e33a 0 calc(var(--w)*351),#bd8bf5 calc(var(--w)*351));}
.wcsb-blk{top:calc(var(--u)*14.3);width:calc(var(--w)*626.8);height:calc(var(--u)*123.1);border-radius:calc(var(--u)*33);background:#000;}
.wcsb-blk.l{left:calc(var(--w)*19.7);}
.wcsb-blk.r{left:calc(var(--w)*646.5);}
.wcsb-mid{left:calc(var(--w)*470.3);top:calc(var(--u)*14.3);width:calc(var(--w)*352.4);height:calc(var(--u)*137.9);border-radius:calc(var(--u)*33);background:#6ffcdb;}
.wcsb-emb{left:calc(var(--w)*584.4 + (var(--w) - var(--u))*62.1);top:0;width:calc(var(--u)*124.2);height:calc(var(--u)*164.9);}
.wcsb-emb img{width:100%;height:100%;display:block;}
/* Goles: centrados en su parte del rectángulo turquesa (a cada lado del emblema). */
.wcsb-sc{top:calc(var(--u)*14.3);width:calc(var(--w)*114.1);height:calc(var(--u)*137.9);display:flex;align-items:center;justify-content:center;font-family:'Open Sans',sans-serif;font-weight:700;font-size:calc(var(--u)*103.3);line-height:1;color:#000;font-variant-numeric:tabular-nums;}
.wcsb-sc.l{left:calc(var(--w)*470.3);}
.wcsb-sc.r{left:calc(var(--w)*708.6);}
.wcsb-sc span{display:block;transform:translateY(-.03em);}
.wcsb-sc span.ml-goal{animation:mlGoalWc 1.6s ease;}
@keyframes mlGoalWc{0%{color:#fff;transform:translateY(-.03em) scale(1);}15%{transform:translateY(-.03em) scale(1.35);}40%{transform:translateY(-.03em) scale(1);}100%{color:#000;transform:translateY(-.03em) scale(1);}}
/* Bandera, círculo y código: una fila centrada a la MITAD del bloque negro (misma altura los tres). */
.wcsb-eq{top:calc(var(--u)*14.3);height:calc(var(--u)*123.1);display:flex;align-items:center;}
.wcsb-eq.l{left:calc(var(--w)*88.1);}
.wcsb-eq.r{right:calc(var(--w)*84);}
.wcsb-flag{flex-shrink:0;width:calc(var(--w)*95.8);height:calc(var(--w)*69.1);border-radius:calc(var(--u)*9);overflow:hidden;box-shadow:0 0 0 calc(var(--u)*4) #fff;background:#f3f3f3;display:block;}
.wcsb-flag img{width:100% !important;height:100% !important;object-fit:cover;display:block;}
.wcsb-dot{flex-shrink:0;width:calc(var(--u)*48.6);height:calc(var(--u)*48.6);border-radius:50%;border:calc(var(--u)*4) solid #ffffed;box-sizing:border-box;display:block;}
.wcsb-eq.l .wcsb-dot{margin:0 calc(var(--w)*29) 0 calc(var(--w)*29);}   /* misma distancia bandera–círculo que círculo–código */
.wcsb-eq.r .wcsb-dot{margin:0 calc(var(--w)*29) 0 calc(var(--w)*29);}
.wcsb-code{display:block;font-family:'FWC2026',sans-serif;font-weight:900;font-size:calc(var(--w)*89);line-height:1;height:1em;letter-spacing:.04em;color:#ffffed;white-space:nowrap;transform:translateY(.09em);}   /* las mayúsculas de FWC2026 quedan centradas ópticamente */
.wcsb-eq.r .wcsb-code{margin-right:-.04em;}   /* el espaciado de letras no deja hueco extra junto al círculo */
/* Línea del tiempo debajo del marcador, del mismo ancho, como en el marcador de los amistosos. */
.ml-bar.ml-wc .wc-track{grid-column:3;grid-row:2;align-self:center;margin:0;}
/* Botón "En vivo" del informe de partido (a la izquierda de la X). */
.mr-live-btn{position:absolute;top:0;right:46px;z-index:5;height:36px;padding:0 14px;border-radius:10px;border:1px solid color-mix(in srgb,var(--coral) 60%,var(--line));background:color-mix(in srgb,var(--coral) 16%,var(--surface));color:var(--ink);font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;gap:8px;transition:background .14s;}
.mr-live-btn:hover{background:color-mix(in srgb,var(--coral) 30%,var(--surface));}
.mr-live-btn .dot{width:8px;height:8px;border-radius:50%;background:var(--coral);box-shadow:0 0 0 3px color-mix(in srgb,var(--coral) 30%,transparent);}
/* Panel en vivo: pegado debajo del rectángulo de datos. */
.ml-panel{margin-top:10px;background:var(--surface);border:1px solid var(--line);border-radius:14px;box-shadow:var(--shadow);overflow:hidden;}
.ml-bar{display:flex;align-items:center;gap:14px;padding:12px 14px;border-bottom:1px solid var(--line);background:var(--surface-2,#222634);}
.ml-play{height:38px;min-width:104px;padding:0 14px;border-radius:10px;border:none;background:var(--indigo);color:#fff;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:8px;transition:background .14s,transform .08s;}
.ml-play:hover{background:var(--indigo-bright);}
.ml-play:active{transform:scale(.97);}
.ml-play .ml-pi{font-size:12px;letter-spacing:-1px;width:14px;text-align:center;}
.ml-clockbox{display:flex;flex-direction:column;align-items:flex-start;min-width:84px;}
.ml-fase{font-family:'JetBrains Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:var(--muted);}
.ml-clock{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:26px;line-height:1.05;color:var(--lime);font-variant-numeric:tabular-nums;}
.ml-track{flex:1;position:relative;height:6px;border-radius:4px;background:var(--line);overflow:visible;}
.ml-prog{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:linear-gradient(90deg,var(--indigo),var(--lime));width:0;}
.ml-mt{position:absolute;left:50%;top:-4px;width:2px;height:14px;margin-left:-1px;background:var(--muted);border-radius:1px;opacity:.7;}
.ml-now{padding:14px 16px 0;min-height:96px;}
.ml-hist{overflow-y:auto;padding:4px 16px 12px;border-top:1px solid var(--line);margin-top:12px;}
.ml-hist:empty{display:none;}
.ml-row{display:flex;gap:12px;align-items:flex-start;padding:8px 0;}
.ml-hist .ml-row{border-bottom:1px solid color-mix(in srgb,var(--line) 65%,transparent);opacity:.82;}
.ml-hist .ml-row:last-child{border-bottom:none;}
.ml-min{flex-shrink:0;box-sizing:border-box;width:calc(7ch + 14px);white-space:nowrap;text-align:center;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;padding:3px 6px;border-radius:7px;background:var(--surface-2,#222634);border:1px solid var(--line);color:var(--ink);}
.ml-min-prev{font-size:9px;letter-spacing:.06em;color:var(--muted);padding:5px 0;width:calc(9.33ch + 14px);}
.ml-txt{flex:1;min-width:0;}
/* Código de la selección junto a los nombres (ver codigoHTML). Nunca en negritas. */
.ml-cod{font-weight:400;white-space:nowrap;}
.ml-cod-par{opacity:.85;}
.ml-cod-sub{font-size:.6em;font-weight:600;letter-spacing:.04em;opacity:.6;margin-left:2px;position:relative;top:.32em;}
.ml-cod-tag{display:inline-block;font-size:9.5px;line-height:1;font-weight:700;letter-spacing:.05em;padding:2px 4px 1px;margin-left:5px;border-radius:4px;background:rgba(255,255,255,.1);color:var(--muted);vertical-align:2px;}
.ml-ti .ml-cod-tag{vertical-align:middle;}
.ml-cod-flag{display:inline-block;margin-left:5px;vertical-align:-1px;}
.ml-cod-flag img{height:9px !important;width:13.5px !important;object-fit:cover;border-radius:2px;box-shadow:0 0 0 1px rgba(0,0,0,.28);display:inline-block;vertical-align:baseline;}
.ml-ti .ml-cod-flag{margin-left:7px;vertical-align:0;}
.ml-ti .ml-cod-flag img{height:11px !important;width:16.5px !important;vertical-align:-1px;}
.ml-now-row .ml-ti .ml-cod-flag img{height:13px !important;width:19.5px !important;}
.ml-ti{display:flex;align-items:center;gap:8px;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:13px;color:var(--ink);}
.ml-de{font-size:13px;line-height:1.45;color:var(--muted);margin-top:3px;}
.ml-now-row{animation:mlIn .45s ease both;}
.ml-now-row .ml-ti{font-size:16px;}
.ml-now-row .ml-de{font-size:15px;color:var(--ink);}
.ml-now-row .ml-min{font-size:14px;}
.ml-now-row.ml-k-goal .ml-min{background:var(--lime);border-color:var(--lime);color:#11131a;}
.ml-now-row.ml-k-goal .ml-ti{color:var(--lime);font-size:20px;}
.ml-now-row.ml-k-red .ml-min{background:var(--danger);border-color:var(--danger);color:#fff;}
.ml-now-row.ml-k-yellow .ml-min{background:var(--amber);border-color:var(--amber);color:#11131a;}
.ml-now-row.ml-k-silbato .ml-min{background:var(--indigo);border-color:var(--indigo);color:#fff;}
.ml-tag{margin-left:auto;white-space:nowrap;flex-shrink:0;align-self:flex-start;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;padding:2px 8px;border-radius:7px;background:color-mix(in srgb,var(--lime) 18%,transparent);color:var(--lime);border:1px solid color-mix(in srgb,var(--lime) 45%,transparent);}
.ml-read{height:2px;margin:10px -16px 0;background:transparent;}
.ml-read i{display:block;height:100%;width:0;background:color-mix(in srgb,var(--indigo) 70%,transparent);}
.ml-ic{display:inline-block;width:16px;height:16px;flex-shrink:0;}
.ml-ic-ball{background:#e9edf5;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;}
.ml-ic-card{width:11px;height:15px;border-radius:2px;}
.ml-ic-card.y{background:var(--amber);}
.ml-ic-card.r{background:var(--danger);}
.ml-ic-wh{width:20px;height:15px;background:#fff;-webkit-mask-size:contain;mask-size:contain;-webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;-webkit-mask-position:center;mask-position:center;}
.ml-k-goal .ml-ic-ball.ml-og,.ml-ic-ball.ml-og{background:var(--coral,#E1473A);}
.ml-now-row.ml-k-og .ml-ti{color:var(--coral,#E1473A);}
.ml-now-row.ml-k-og .ml-min{background:var(--coral,#E1473A);border-color:var(--coral,#E1473A);color:#fff;}
.ml-de b{color:var(--ink);font-weight:700;}
/* Foto del protagonista (gol / tarjeta) a la derecha del suceso principal: recuadro del perfil. */
.ml-foto{flex-shrink:0;width:114px;height:114px;border-radius:12px;overflow:hidden;background:var(--surface-2);align-self:flex-start;animation:mlIn .45s ease both;}
.ml-foto img{width:100%;height:100%;object-fit:cover;display:block;}
.ml-foto.ml-foto-ancha{width:203px;}
.ml-foto.ml-foto-potm img{width:auto;height:auto;object-fit:contain;}
.ml-foto.ml-foto-potm .potm-per img{height:100%;width:auto;}   /* VAR, estadio, hidratación: 16:9 con el mismo alto que las fotos */

.ml-ti .mr-subsvg{width:16px;height:16px;flex-shrink:0;}
.ml-note{font-size:12px;color:var(--muted);padding:10px 0;}
.ml-wait .ml-de{font-style:italic;}
#ml-feed{position:relative;}
#ml-feed.ml-esperando .ml-now{visibility:hidden;}
.ml-start{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;padding:0 24px;font-family:'Space Grotesk',sans-serif;font-weight:600;font-size:15px;color:var(--muted);pointer-events:none;}
/* Marcador en vivo */
.ml-sc{display:inline-block;transition:color .3s;}
.ml-sc.ml-goal{animation:mlGoal 1.6s ease;}
/* Controles: Juego/Pausa y, debajo, la velocidad. */
.ml-bar{align-items:flex-start;}
.ml-ctrl{display:flex;flex-direction:column;gap:6px;flex-shrink:0;width:176px;}
.ml-play{width:100%;}
.ml-vels{display:flex;gap:3px;}
.ml-vel{flex:1;min-width:0;height:22px;padding:0;display:inline-flex;align-items:center;justify-content:center;line-height:1;text-align:center;border-radius:6px;border:1px solid var(--line);background:var(--surface);color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;cursor:pointer;transition:background .12s,color .12s,border-color .12s;}
.ml-vel:hover{color:var(--ink);border-color:color-mix(in srgb,var(--indigo) 55%,var(--line));}
.ml-vel.on{background:var(--indigo);border-color:var(--indigo);color:#fff;}
.ml-clockbox{padding-top:2px;}
.ml-track{margin-top:17px;}
/* Insignia EN VIVO en el renglón de los equipos. */
.ml-livebadge{display:inline-flex;align-items:center;gap:5px;margin-left:8px;vertical-align:middle;padding:2px 7px;border-radius:6px;background:rgba(0,0,0,.28);color:#fff;font-family:'JetBrains Mono',monospace;font-size:9.5px;font-weight:700;letter-spacing:.08em;line-height:1.4;}
.ml-livebadge i{width:7px;height:7px;border-radius:50%;background:var(--coral);animation:mlPulse 1.4s ease-in-out infinite;}
.ml-livebadge.fin{background:rgba(0,0,0,.2);color:rgba(255,255,255,.8);}
@keyframes mlPulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--coral) 70%,transparent);}50%{box-shadow:0 0 0 4px transparent;}}
/* Las canchas laterales empiezan a la altura del panel minuto a minuto (fila 2). */
.ml-screen .ml-panel{margin-top:0;}
.ml-livewrap{display:flex;justify-content:center;margin-bottom:4px;}
.ml-livewrap .ml-livebadge{margin-left:0;}
/* Reloj MM:SS + reposición */
.ml-clockbox{min-width:96px;}
.ml-add{display:flex;align-items:center;gap:6px;min-height:18px;margin-top:3px;}
.ml-addtag{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:11px;line-height:1;padding:3px 6px;border-radius:5px;background:var(--lime);color:#11131a;}
.ml-addclk{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;color:var(--ink);font-variant-numeric:tabular-nums;}
/* Línea de tiempo en vivo: la línea (estilo del informe) se va llenando en morado conforme avanza. */
.ml-screen .mr-tl-line{background:var(--line);}
.ml-tl-fill{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:4px;background:var(--indigo);}
.ml-screen .mr-lu-rate{transition:background .5s ease;}
/* ===== Barra de control con MARCADOR (rejilla 3 x 2, simétrica) =====
   fila 1: [JUEGA/PAUSA] [reloj]      [MEX  0 - 0  AUS]
   fila 2: [velocidades] [+N 00:21]   [línea del partido] */
.ml-bar{display:grid;grid-template-columns:176px auto 1fr;grid-template-rows:38px 22px;column-gap:22px;row-gap:6px;align-items:center;padding:12px 14px;}
.ml-play{grid-column:1;grid-row:1;width:100%;height:38px;border-radius:10px;}
.ml-vels{grid-column:1;grid-row:2;height:22px;}
.ml-clock{grid-column:2;grid-row:1;min-width:96px;text-align:center;line-height:38px;font-size:28px;}
.ml-add{grid-column:2;grid-row:2;display:flex;align-items:center;justify-content:center;gap:6px;min-height:22px;margin:0;}
.ml-sb{grid-column:3;grid-row:1;display:flex;align-items:center;gap:14px;height:38px;min-width:0;background:rgba(255,255,255,.15);border-radius:10px;}
.ml-track{grid-column:3;grid-row:2;align-self:center;margin:0;}
.ml-sbt{flex:1;min-width:0;height:38px;box-sizing:border-box;border-radius:10px;background:var(--indigo);display:flex;align-items:center;padding:3px;gap:10px;}
/* El código va pegado a su bandera: local [bandera MEX] a la izquierda, visitante [SRB bandera] a la derecha. */
.ml-sbt{gap:9px;padding:0 9px;}
.ml-sbt.l{justify-content:flex-start;}
.ml-sbt.r{justify-content:flex-end;}
/* Bandera con UN solo contorno, igual que en el perfil de selecciones (.flag-lbl), 3:2 y 20% más chica. */
.ml-sbf{flex-shrink:0;display:flex;align-items:center;}
.ml-sbf img{height:21px !important;width:31.5px;object-fit:cover;border-radius:3px;display:block;box-shadow:0 0 0 1px rgba(0,0,0,.28);}
.ml-sbc{font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:20px;color:#fff;letter-spacing:.02em;white-space:nowrap;}
.ml-sbs{flex-shrink:0;min-width:72px;text-align:center;font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:26px;line-height:38px;color:#fff;white-space:nowrap;}
/* Relato: el rectángulo COMPLETO tiene alto fijo (el de un suceso principal de 4 renglones + 3 avisos
   de 2 renglones; se mide al abrir). El principal crece o se encoge según su texto y los avisos de abajo
   ocupan el resto: si no caben, se cortan y siguen con scroll. */
.ml-feed{display:flex;flex-direction:column;overflow:hidden;}
.ml-now{position:relative;box-sizing:border-box;flex:0 0 auto;min-height:0;padding:14px 16px 12px;}
.ml-read{position:absolute;left:0;right:0;bottom:0;margin:0;}
.ml-hist{box-sizing:border-box;flex:1 1 auto;min-height:0;max-height:none !important;padding:0 16px;margin-top:0;overflow-y:auto;}

.ml-hist:empty{display:block;}
/* Minuto a minuto en el INFORME del partido: alto de 3–4 avisos, con scroll; todos del tamaño de los anteriores. */
.ml-hist.mr-relato-hist{flex:none;max-height:300px !important;overflow-y:auto;padding:0 4px 0 0;margin:0;border-top:none;}
.mr-relato-hist .ml-row{animation:none;}
/* Avisos pequeños: completos (los renglones que necesiten); el rectángulo NO crece, se recorre con scroll. */
@keyframes mlIn{from{opacity:0;transform:translateY(6px);}to{opacity:1;transform:none;}}
@keyframes mlGoal{0%{color:var(--lime);transform:scale(1);}15%{transform:scale(1.35);}40%{transform:scale(1);}100%{color:inherit;}}
`;
    document.head.appendChild(st);
  }
  // El botón "En vivo" del informe usa estos estilos aunque el motor no se haya abierto aún.
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", injectCSS); else injectCSS();

  // Minuto a minuto COMPLETO para el informe del partido (sin reloj): todos los bloques del relato con el
  // tamaño de los avisos anteriores, del último al primero, sin ninguno destacado. cb(html) — "" si no hay
  // relato. No toca un partido en vivo abierto: usa un estado temporal y lo restaura.
  function relatoInforme(fxId, cb){
    const f=(DB.fixtures||[]).find(x=>x.id===fxId); if(!f){ cb(""); return; }
    injectCSS();
    loadNarrative(f, text=>{
      if(!text){ cb(""); return; }
      const prev=S, prevTE=TE; let html="";
      try{
        const A=getTeam(f.teamA), B=getTeam(f.teamB);
        S={ f, A, B, items:[], jug:[], otros:[], revealed:new Set(), half:0, t:0, ended:true, final:{}, cap:{home:null, away:null}, informe:true };
        S.jug=indexarJugadores();
        S.otros=otrosNombres(f, A, B);
        S.items=buildTimeline(f, parseNarrative(text));
        const filas=S.items.slice().reverse().map(it=>filaHTML(it, false)).join("");
        html = filas ? `<div class="ml-hist mr-relato-hist">${filas}</div>` : "";
      }catch(e){ try{ console.warn("[Motor de partido] Minuto a minuto del informe:", e); }catch(_){} html=""; }
      finally{ S=prev; TE=prevTE; }
      cb(html);
    });
  }

  window.MotorPartido = { open, show, stop, isActive, play, pause, toggle, fileNameFor, parseNarrative, buildTimeline, CFG, calificacionesV2, relatoInforme, variablesPartido };
})();
