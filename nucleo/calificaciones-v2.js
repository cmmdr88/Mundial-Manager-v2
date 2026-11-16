/* =========================================================
   COPA MANAGER 2026 — nucleo/calificaciones-v2.js
   CALIFICACIONES v2 (PROVISIONAL, AISLADO). No reemplaza al sistema actual: el motor en vivo lo
   corre EN SOMBRA (calcula en paralelo) y solo lo muestra si  CalificacionesV2.CONFIG.MOSTRAR = true.
   Módulo puro: no toca el DB, no lee archivos, no pinta nada.

   Tres métricas que nunca se mezclan:
     · opta_points    Fórmula OFICIAL de Opta Points (pesos publicados, base 5.5, límites 3–10).
                      Solo se calcula si el jugador trae sus estadísticas de Opta. Nunca se calibra.
     · nota_motor     Cálculo propio:  c0 + k·S + cr·s·m/T + croja·RC + cgc·GC·[DF] + extras,
                      limitado a 3–10. S = suma de puntos de acción (sin límites).
     · nota_mostrada  Solo con nota REAL numérica (Modo A): nota_motor corregida hacia la real;
                      al final de su participación es EXACTAMENTE la real.

   Reglas (ver documento "Sistema de calificaciones de jugadores — propuesta"):
     · Eventos CRÍTICOS (gol, asistencia, autogol, amarilla, roja, penal ganado, penal atajado,
       gol recibido): nunca se reducen para cuadrar estadísticas. Conservan actor y minuto. Si las
       estadísticas traen más de los narrados, los que faltan entran al final de su participación
       (minuto desconocido); si traen menos, se respeta el relato/informe. Todo queda en la bitácora.
     · Categorías REPETIBLES (tiros, pases, centros, entradas, intercepciones, faltas, fueras de
       juego, atajadas): si el relato narra más que las estadísticas, cada narrado vale
       estadísticas ÷ narrados; si narra menos, el resto se reparte parejo en sus minutos
       (trayectoria ESTIMADA: interpolación, no reconstrucción).
     · El tiro al arco que acompaña a un gol es parte del gol (crítico).
     · Un evento narrado después de su salida cuenta en su salida (y se anota).
     · Corrección gradual (Modo A): un evento se aplica con el reloj detenido, así que nunca cambia
       de signo. La deriva artificial (sin eventos) tiene signo constante. DERIVA_OBJETIVO es un OBJETIVO,
       no un límite absoluto. Lo que se GARANTIZA: por minuto, deriva ≤ máx(DERIVA_OBJETIVO, |Δ|/M). Cuando
       |Δ|/M pasa del objetivo, la corrección es lineal y la deriva vale exactamente |Δ|/M, que es el mínimo
       posible para llegar a la nota real al final de su participación (queda en la bitácora).
     · SC nunca se usa como número.

   Escala de tiempo: la que elija quien llama (minutos nominales en el script de calibración;
   minutos de juego del motor en vivo). Entradas, salidas, eventos y la duración T van en la misma.

   Script CLÁSICO (no module). También funciona en Node (module.exports) para las pruebas.
   API: window.CalificacionesV2 = { CONFIG, preparar, evaluar, final, errores, redondear, optaPoints,
                                    grupoDePosicion, CATS, CRITICAS }
   ========================================================= */
(function(raiz){
  "use strict";

  const CATS = ["G","SOnT","SOffT","BS","OG","A","P","C","Tk","INT","FW","FC","O","YC","RC","PW","SAV","PSAV","GC"];
  const CRITICAS = new Set(["G","A","OG","YC","RC","PW","PSAV","GC"]);
  // Un evento crítico que Opta cuenta también en una categoría repetible: gol → tiro al arco; penal atajado → atajada.
  const INCLUYE = { G:"SOnT", PSAV:"SAV" };

  /* ---------- parámetros (todos configurables; v0 PROVISIONAL) ---------- */
  const CONFIG = {
    VERSION: "v0-provisional (México–Sudáfrica, ajuste E5, λ = 1)",
    MOSTRAR: false,              // false: el en vivo sigue mostrando el sistema actual (v2 corre en sombra)
    // Opta Points oficial: NO se modifican nunca para calibrar.
    PESOS_OPTA: { G:1, SOnT:0.4, SOffT:0.2, BS:0.2, OG:-0.5, A:0.6, P:0.02, C:0.02, Tk:0.2, INT:0.2,
                  FW:0.1, FC:-0.1, O:-0.1, YC:-0.2, RC:-0.5, PW:0.4 },
    PESOS_OPTA_GK:    { GC:-0.6, SAV:0.5, PSAV:0.5 },
    PESOS_OPTA_CAMPO: { GC:-0.1, SAV:0,   PSAV:0   },
    OPTA_BASE: 5.5, OPTA_MIN: 3, OPTA_MAX: 10,
    // Pesos de acción de nota_motor: null = los mismos de Opta (v0). Un cambio aquí es una HIPÓTESIS del
    // motor (p. ej. pase de defensa) y nunca toca opta_points.
    PESOS_MOTOR: null,
    PESOS_MOTOR_DF: null,        // p. ej. { P:0.015 } para probar la hipótesis H2 (desactivada)
    c0: 5.951788986048091,
    k: 0.7233464103546474,
    cr: 0.2879787559434304,
    croja: -0.68852545883535,
    cgc: -0.23277403130347757,
    // PERFIL SIN OPTA: coeficientes aparte para los jugadores sin datos de Opta (nivel "relato": ni tabla ni
    // PTS). Mismos términos que v0 más la fracción de minutos jugados (cf·m/T). Ajustado con MEX–RSA, MEX–POR
    // y BRA–NOR (solo relato + informe) con la condición cr = 0.4·k, para que el resultado del equipo siga
    // valiendo menos de un tercio de un gol propio (P3). Dejando fuera cada partido: error medio 0.36 contra
    // 0.71 de v0 sin Opta. Con Opta (tabla completa o solo PTS) se usan siempre los coeficientes v0 de arriba.
    PERFIL_SIN_OPTA: {
      activo: true,
      c0: 5.919466995417003,
      k: 0.6380298587247035,
      cr: 0.2552119434898814,
      croja: -0.7639126493508025,
      cgc: -0.13329745183419547,
      cf: 1.0381972415830358
    },
    EXTRAS: { error_gol:-0.80, error_ocasion:-0.15, ocasion_fallada:-0.25, penal_fallado:-0.60 },
    GAMMA: 1.5,                  // forma de la corrección hacia la nota real
    DERIVA_OBJETIVO: 0.04,       // OBJETIVO de deriva por minuto; garantía: ≤ máx(objetivo, |Δ|/M)
    MIN_SC: 10,                  // menos de 10 minutos: SC
    NOTA_MIN: 3, NOTA_MAX: 10
  };

  const esNumero = x => typeof x === "number" && isFinite(x);
  // Mitad hacia arriba, sin errores de coma flotante (6.25 → 6.3; 6.2499999 → 6.2).
  const redondear = x => Math.floor(x * 10 + 0.5 + 1e-9) / 10;

  // Grupo para las fórmulas (solo importan GK y DF).
  function grupoDePosicion(pos){
    const p = String(pos || "").toUpperCase().trim();
    if(/^(GK|POR|PO|G)$/.test(p)) return "GK";
    if(/^(CB|LB|RB|LWB|RWB|DF|D|DFC|LI|LD|DEF|SW)$/.test(p)) return "DF";
    if(/^(LW|RW|ST|CF|FW|SS|F|DC|EI|ED|DEL)$/.test(p)) return "FW";
    return "MF";
  }

  function sumaPuntos(cnt, grupo, cfg, deMotor){
    let w = cfg.PESOS_OPTA;
    if(deMotor){
      if(cfg.PESOS_MOTOR) w = Object.assign({}, w, cfg.PESOS_MOTOR);
      if(grupo === "DF" && cfg.PESOS_MOTOR_DF) w = Object.assign({}, w, cfg.PESOS_MOTOR_DF);
    }
    const ex = grupo === "GK" ? cfg.PESOS_OPTA_GK : cfg.PESOS_OPTA_CAMPO;
    let s = 0;
    for(const c in w)  s += w[c]  * (cnt[c] || 0);
    for(const c in ex) s += ex[c] * (cnt[c] || 0);
    return s;
  }
  // Opta Points OFICIAL a partir de las estadísticas finales (sin reconciliar con el relato).
  function optaPoints(stats, grupo, cfg){
    cfg = cfg || CONFIG;
    if(!stats) return null;
    const v = cfg.OPTA_BASE + sumaPuntos(stats, grupo, cfg, false);
    return Math.max(cfg.OPTA_MIN, Math.min(cfg.OPTA_MAX, v));
  }

  /* =========================================================
     PREPARAR
     partido = {
       duracion: T,
       equipos: [idA, idB],
       jugadores: [{ key, nombre, equipo, grupo|pos, entra, sale, real: número | "SC" | null, opta: {G,SOnT,…}|null }],
       goles:   [{ min, orden, equipo (el que SUMA en el marcador), autor, asistente, autogol, penal, ref }],
       eventos: [{ min, orden, jugador, cat, cant, ref }],     // narrados (sin G/A/OG/GC: salen de goles)
       extras:  [{ min, orden, jugador, tipo, ref }]           // error_gol, error_ocasion, ocasion_fallada, penal_fallado
     }
     ========================================================= */
  function preparar(partido, ajustes){
    const cfg = Object.assign({}, CONFIG, ajustes || {});
    const T = +partido.duracion || 90;
    const bitacora = [];
    const J = {};
    (partido.jugadores || []).forEach(p => {
      const grupo = p.grupo || grupoDePosicion(p.pos);
      const entra = +p.entra || 0;
      const sale = p.sale == null ? T : +p.sale;
      let real = null;
      if(p.real === "SC" || p.real === "sc") real = "SC";
      else if(esNumero(p.real)) real = p.real;
      else if(typeof p.real === "string" && /^\d{1,2}([.,]\d{1,2})?$/.test(p.real.trim())) real = parseFloat(p.real.replace(",", "."));
      J[p.key] = { key:p.key, nombre:p.nombre || p.key, equipo:p.equipo, grupo, entra, sale, M: Math.max(0, sale - entra),
                   real, opta: p.opta || null, optaPts: (!p.opta && esNumero(p.optaPts)) ? p.optaPts : null,
                   ev:[], extras:[], resto:{}, fondoS:0, notas:[] };
    });
    const anota = (j, txt, critica) => { const n = { jugador:j.nombre, texto:txt, critica:!!critica }; j.notas.push(n); bitacora.push(n); };

    // Orden global (minuto, orden) para pruebas y para el modo "hasta el suceso n".
    let idx = 0;
    const goles = (partido.goles || []).slice().sort((a, b) => a.min - b.min || (a.orden || 0) - (b.orden || 0));
    const eventos = (partido.eventos || []).slice();
    const extras = (partido.extras || []).slice();
    const todos = [];
    goles.forEach(g => todos.push({ tipo:"gol", x:g }));
    eventos.forEach(e => todos.push({ tipo:"ev", x:e }));
    extras.forEach(e => todos.push({ tipo:"extra", x:e }));
    todos.sort((a, b) => a.x.min - b.x.min || (a.x.orden || 0) - (b.x.orden || 0));
    todos.forEach(o => { o.x.__idx = idx++; });

    const enCancha = (j, min) => j.entra <= min && (min < j.sale || (j.sale >= T && min <= T));
    const agrega = (key, ev) => {
      const j = J[key]; if(!j) return;
      if(ev.min > j.sale){ anota(j, `${ev.cat || ev.tipo} narrado al ${ev.min}’ después de su salida (${j.sale}’): cuenta en su salida`, false); ev = Object.assign({}, ev, { min:j.sale }); }
      j.ev.push(ev);
    };

    const GOLES = [];
    goles.forEach(g => {
      const base = { min:g.min, orden:g.orden || 0, ref:g.ref, idx:g.__idx, critico:true };
      const otroEq = (partido.equipos || []).find(e => e !== g.equipo);
      GOLES.push({ min:g.min, equipo:g.equipo, ref:g.ref, idx:g.__idx });
      if(g.autor && J[g.autor]){
        if(g.autogol) agrega(g.autor, Object.assign({}, base, { cat:"OG", cant:1 }));
        else {
          agrega(g.autor, Object.assign({}, base, { cat:"G", cant:1 }));
          agrega(g.autor, Object.assign({}, base, { cat:"SOnT", cant:1, deCritico:true }));
        }
      }
      if(!g.autogol && g.asistente && J[g.asistente]) agrega(g.asistente, Object.assign({}, base, { cat:"A", cant:1 }));
      // Gol recibido: los del equipo que concede que estaban en la cancha.
      Object.values(J).forEach(j => { if(j.equipo === otroEq && enCancha(j, g.min)) j.ev.push(Object.assign({}, base, { cat:"GC", cant:1 })); });
    });
    eventos.forEach(e => {
      if(!e.jugador || !J[e.jugador] || CATS.indexOf(e.cat) < 0) return;
      const ev = { min:e.min, orden:e.orden || 0, ref:e.ref, idx:e.__idx, cat:e.cat, cant:e.cant || 1, critico:CRITICAS.has(e.cat) };
      agrega(e.jugador, ev);
      if(INCLUYE[e.cat] && e.cat !== "G") agrega(e.jugador, Object.assign({}, ev, { cat:INCLUYE[e.cat], deCritico:true, critico:true }));
    });
    extras.forEach(e => {
      const j = J[e.jugador]; if(!j || !(e.tipo in cfg.EXTRAS)) return;
      const min = e.min > j.sale ? j.sale : e.min;
      j.extras.push({ min, orden:e.orden || 0, ref:e.ref, idx:e.__idx, tipo:e.tipo });
    });

    // Reconciliación con las estadísticas finales de Opta (si las hay).
    Object.values(J).forEach(j => {
      j.ev.forEach(e => { e.peso = 1; });
      // Solo el PTS final de Opta (sin desglose): la suma total de puntos es PTS − 5.5. Lo que el relato y el
      // informe no explican queda como "fondo" en puntos y se reparte parejo en sus minutos. Así, al final,
      // S es exactamente la de Opta y nota_motor sale igual que con la tabla completa.
      if(!j.opta && esNumero(j.optaPts)){
        if(j.optaPts <= cfg.OPTA_MIN || j.optaPts >= cfg.OPTA_MAX){ anota(j, `PTS de Opta ${j.optaPts} está en el límite de la escala; no se usa (la suma real es desconocida)`, false); j.optaPts = null; return; }
        const narrados = {}; j.ev.forEach(e => { narrados[e.cat] = (narrados[e.cat] || 0) + e.cant; });
        const Snarr = sumaPuntos(narrados, j.grupo, cfg, false);
        j.fondoS = (j.optaPts - cfg.OPTA_BASE) - Snarr;
        anota(j, `solo PTS de Opta (${j.optaPts}): ${j.fondoS >= 0 ? "+" : ""}${j.fondoS.toFixed(2)} puntos que el relato no explica, repartidos en sus minutos`, false);
        return;
      }
      if(!j.opta) return;
      const st = j.opta;
      const narr = {}, dentro = {};             // dentro: lo que ya va incluido en eventos críticos (tiro del gol…)
      j.ev.forEach(e => { if(e.deCritico) dentro[e.cat] = (dentro[e.cat] || 0) + e.cant; else narr[e.cat] = (narr[e.cat] || 0) + e.cant; });
      // Primero los críticos (pueden agregar su parte incluida: el tiro del gol, la atajada del penal) y después
      // los repetibles, para que su reparto ya descuente lo incluido.
      CATS.filter(c => CRITICAS.has(c)).concat(CATS.filter(c => !CRITICAS.has(c))).forEach(c => {
        const tot = +st[c] || 0;
        if(CRITICAS.has(c)){
          const kN = narr[c] || 0;
          if(tot > kN){
            for(let i = 0; i < tot - kN; i++){
              j.ev.push({ min:j.sale, orden:1e6, ref:null, idx:Infinity, cat:c, cant:1, critico:true, sinMinuto:true, peso:1 });
              if(INCLUYE[c]){ j.ev.push({ min:j.sale, orden:1e6, ref:null, idx:Infinity, cat:INCLUYE[c], cant:1, critico:true, sinMinuto:true, deCritico:true, peso:1 }); dentro[INCLUYE[c]] = (dentro[INCLUYE[c]] || 0) + 1; }
            }
            anota(j, `${c}: Opta registra ${tot}, narrados ${kN} → ${tot - kN} sin minuto, al final de su participación (${j.sale}')`, true);
          } else if(kN > tot){
            anota(j, `${c}: narrados ${kN}, Opta registra ${tot} → se respeta el relato/informe (evento crítico)`, true);
          }
          return;
        }
        // Repetibles: lo que ya va dentro de un evento crítico (el tiro al arco del gol) no se reparte.
        let pool = tot - (dentro[c] || 0);
        if(pool < 0){ anota(j, `${c}: Opta registra ${tot}, menos que los incluidos en eventos críticos (${dentro[c]})`, true); pool = 0; }
        const kN = narr[c] || 0;
        if(kN > pool){
          const p = pool / kN;
          j.ev.forEach(e => { if(e.cat === c && !e.deCritico) e.peso = p; });
          anota(j, `${c}: narrados ${kN}, Opta ${pool}${dentro[c] ? " (sin contar los incluidos en eventos críticos)" : ""} → cada narrado vale ${p.toFixed(3)}`, false);
          j.resto[c] = 0;
        } else j.resto[c] = pool - kN;
      });
    });

    const modelo = { cfg, T, J, goles:GOLES, bitacora, equipos:partido.equipos || [] };
    // nota_motor al final de la participación de cada uno (se guarda aparte) y corrección Modo A.
    Object.values(J).forEach(j => { j.nivelDatos = j.opta ? "opta" : (esNumero(j.optaPts) ? "pts" : "relato"); });
    Object.values(J).forEach(j => {
      const r = calcular(modelo, j, Infinity, () => true);
      j.motorFinal = r.nota_motor;
      j.S_final = r.S;
      j.optaPoints = j.opta ? optaPoints(j.opta, j.grupo, cfg) : (esNumero(j.optaPts) ? j.optaPts : null);
      j.nivelDatos = j.opta ? "opta" : (esNumero(j.optaPts) ? "pts" : "relato");
      j.delta = esNumero(j.real) ? j.real - j.motorFinal : null;
      j.gamma = cfg.GAMMA;
      if(esNumero(j.delta) && Math.abs(j.delta) > 1e-12 && j.M > 0){
        j.gamma = Math.max(1, Math.min(cfg.GAMMA, cfg.DERIVA_OBJETIVO * j.M / Math.abs(j.delta)));
        j.derivaMax = j.gamma * Math.abs(j.delta) / j.M;   // máxima deriva por minuto de este jugador
        if(Math.abs(j.delta) / j.M > cfg.DERIVA_OBJETIVO)
          anota(j, `deriva de ${(Math.abs(j.delta) / j.M).toFixed(3)} por minuto hacia la nota real (Δ = ${j.delta.toFixed(2)} en ${j.M}'): por encima del objetivo ${cfg.DERIVA_OBJETIVO}, es el mínimo para llegar a la nota real; corrección lineal`, false);
      }
    });
    return modelo;
  }

  function minutos(j, t){ return Math.max(0, Math.min(t, j.sale) - j.entra); }
  function marcador(modelo, equipo, incluido){
    let a = 0, b = 0;
    modelo.goles.forEach(g => { if(incluido(g)) { if(g.equipo === equipo) a++; else b++; } });
    return (a > b) - (a < b);
  }

  // Núcleo: conteos y nota_motor de un jugador en t (con los sucesos que cumplan "incluido").
  function calcular(modelo, j, t, incluido){
    const cfg = modelo.cfg;
    const m = minutos(j, t);
    const fr = j.M > 0 ? m / j.M : (t >= j.sale ? 1 : 0);
    const cnt = {};
    for(const c in j.resto) cnt[c] = j.resto[c] * fr;
    const fondo = (j.fondoS || 0) * fr;   // solo PTS: puntos sin desglose
    j.ev.forEach(e => { if(e.sinMinuto ? t >= j.sale : incluido(e)) cnt[e.cat] = (cnt[e.cat] || 0) + e.cant * e.peso; });
    const S = sumaPuntos(cnt, j.grupo, cfg, true) + fondo;
    const s = marcador(modelo, j.equipo, incluido);
    let x = 0; j.extras.forEach(e => { if(incluido(e)) x += cfg.EXTRAS[e.tipo]; });
    const pf = (j.nivelDatos === "relato" && cfg.PERFIL_SIN_OPTA && cfg.PERFIL_SIN_OPTA.activo) ? cfg.PERFIL_SIN_OPTA : null;
    const P = pf || cfg;
    const raw = P.c0 + P.k * S + P.cr * s * m / modelo.T + P.croja * (cnt.RC || 0)
              + P.cgc * (cnt.GC || 0) * (j.grupo === "DF" ? 1 : 0) + (pf ? pf.cf * m / modelo.T : 0) + x;
    return { m, cnt, S, s, x, raw, fondo, nota_motor: Math.max(cfg.NOTA_MIN, Math.min(cfg.NOTA_MAX, raw)) };
  }

  /* =========================================================
     EVALUAR un jugador en el minuto t.
       incluido(suceso) → ¿ya ocurrió? (por defecto: su minuto ≤ t). El motor en vivo pasa "ya se reveló".
     Devuelve { m, S, opta_vivo, nota_motor, nota_mostrada, mostrar, valor }.
       mostrar: texto ("7.3" o "SC"); valor: número redondeado o null (SC).
     ========================================================= */
  function evaluar(modelo, key, t, incluido){
    const j = modelo.J[key]; if(!j) return null;
    const cfg = modelo.cfg;
    const inc = incluido || (e => e.min <= t);
    const r = calcular(modelo, j, t, inc);
    const opta_vivo = (j.opta || esNumero(j.optaPts)) ? Math.max(cfg.OPTA_MIN, Math.min(cfg.OPTA_MAX, cfg.OPTA_BASE + sumaPuntos(r.cnt, j.grupo, cfg, false) + (r.fondo || 0))) : null;
    const termino = r.m >= j.M && t >= j.sale;
    let mostrada = null;
    if(j.real === "SC") mostrada = null;                       // SC nunca es número
    else if(esNumero(j.real)){
      if(termino) mostrada = j.real;                           // exacto al final
      else {
        const phi = j.M > 0 ? Math.pow(r.m / j.M, j.gamma) : 0;
        mostrada = Math.max(cfg.NOTA_MIN, Math.min(cfg.NOTA_MAX, r.nota_motor + phi * j.delta));
      }
    } else mostrada = r.nota_motor;                            // sin nota real: lo que da el motor
    let mostrar, valor;
    if(j.real === "SC"){ mostrar = "SC"; valor = null; }
    else if(esNumero(j.real) && termino){ valor = redondear(j.real); mostrar = valor.toFixed(1); }
    else if(r.m < cfg.MIN_SC){ mostrar = "SC"; valor = null; }
    else { valor = redondear(mostrada); mostrar = valor.toFixed(1); }
    return { m:r.m, S:r.S, s:r.s, x:r.x, RC:r.cnt.RC || 0, GC:r.cnt.GC || 0, grupo:j.grupo, M:j.M, T:modelo.T, nivel:j.nivelDatos,
             opta_vivo, nota_motor:r.nota_motor, nota_mostrada:mostrada, mostrar, valor };
  }

  // Resultado final por jugador: las tres métricas por separado.
  function final(modelo){
    return Object.values(modelo.J).map(j => ({
      key:j.key, nombre:j.nombre, equipo:j.equipo, grupo:j.grupo, minutos:j.M, real:j.real,
      opta_points: j.optaPoints,
      nivel_datos: j.nivelDatos,   // "opta" (tabla completa), "pts" (solo PTS) o "relato" (sin Opta)
      nota_motor: j.motorFinal,
      nota_mostrada: j.real === "SC" ? null : (esNumero(j.real) ? j.real : j.motorFinal),
      mostrar: evaluar(modelo, j.key, Math.max(modelo.T, j.sale), () => true).mostrar,
      bitacora: j.notas.slice()
    }));
  }

  // Error medio absoluto de nota_motor (SIN calibrar) contra la nota real, solo jugadores con nota numérica.
  function errores(modelo, soloConOpta){
    const L = Object.values(modelo.J).filter(j => esNumero(j.real) && (!soloConOpta || j.opta || esNumero(j.optaPts)));
    if(!L.length) return { n:0, mae:null };
    const mae = L.reduce((a, j) => a + Math.abs(j.motorFinal - j.real), 0) / L.length;
    return { n:L.length, mae };
  }


  /* =========================================================
     CLASIFICADOR DEL RELATO (v2, aislado del sistema actual)
     clasificarSuceso(item, ctx) → { eventos:[[clave, categoría]], extras:[[clave, tipo]], dudas:[texto] }
       item = { titulo, descripcion, tipo ("goal","yellow","red","penmiss","texto",…), informe:[{tipo, jugador, equipo}] }
       ctx  = { jugadores:[{ key, equipo, gk, nombres:[nombres normalizados], apellido, unico }],
                equipo: id del equipo que REALIZA la acción (o null) }
     Reglas (documento, sección C):
       · Tirador: entre los jugadores del equipo que ataca, primero el que va seguido de un verbo de remate
         ("…, que dispara"); si no, el que recibe un pase ("filtra para X", "lanza a X", "pase atrás para X");
         si solo hay uno, ese. Si sigue habiendo más de uno, NO se asigna (queda como duda).
       · Atajada: solo al portero rival NOMBRADO en un tiro a puerta (no si la sacan sobre la línea).
       · Errores (forma estándar): "error de X", "X comete un error", "X pierde el balón", "X entrega el balón a
         <rival>", "le roba el balón a X" o "presiona a X … le roba el balón". En un bloque de gol → error que
         genera gol (si X es del equipo que recibe el gol); en un tiro u ocasión → error que genera ocasión.
         Otra redacción, o un bloque sin tiro/ocasión/gol: no se asigna.
       · Ocasión clara fallada: un jugador del equipo que ataca seguido de "falla", "desperdicia", "no acierta",
         "manda fuera"…, en un bloque de ocasión o tiro desviado. Sin ese verbo pegado al nombre: no se asigna.
       · Penal fallado: solo con la línea PFa del informe (un bloque del relato sin PFa queda como duda).
       · Faltas, manos y fueras de lugar: el primer jugador nombrado del equipo que comete; la falta recibida,
         el primero del rival. Tarjetas del informe con la falta descrita: falta cometida al amonestado.
     ========================================================= */
  // Normaliza nombres y textos: minúsculas, sin acentos; letras nórdicas y otras que NFD no separa
  // (Ødegaard → odegaard, Sørloth → sorloth, Æ → ae, ß → ss, Ł → l, Đ → d).
  function nl(s){ return String(s||"").toLowerCase().replace(/ø/g,"o").replace(/æ/g,"ae").replace(/œ/g,"oe").replace(/ß/g,"ss").replace(/ł/g,"l").replace(/đ/g,"d").replace(/ı/g,"i")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim(); }
  // Verbo de remate en la "ventana" del jugador (desde su nombre hasta el siguiente jugador nombrado).
  // "busca a X" y "toca para X" son pases, no remates.
  const RX_VERBO_TIRO = /\b(remata\w*|rematar|dispara|disparar|cabecea\w*|le pega|pega\b|define|prueba|probar|busca(?! a\b)|saca(?! (un |el )?(centro|corner|tiro de esquina|tiro libre|balon))|engancha|desvia|arma la pierna|chuta|conecta|empalma|tira\b|ajusta|manda(?! (el |un )?(centro|balon|pase))|intenta|estrella|volea|empuja|toca(?! (para|a)\b))/;
  const RX_PASE_ANTES = /(filtra|lanza|habilita|cede|pasa|deja|abre|toca|centra|mete|pone|sirve|asiste|entrega|encuentra|busca|pase(\s+atras)?|centro|envio|balon)(\s+\S+){0,4}?\s+(para|a)\s*$/;
  // Jugador que da el pase (su ventana empieza con un verbo de pase): no es el tirador.
  const RX_PASA_DESPUES = /^ (que |y )?(se la |la |lo |le )?(filtra|lanza|habilita|cede|pasa|deja|abre|toca para|centra|mete (un|el) (pase|centro|balon)|pone (el balon|un centro|un pase|el centro)|sirve|asiste|entrega|encuentra|busca a|cobra|manda el centro)/;
  // "¡Lo falló X!", "falla X", "perdonó X": el verbo va antes del nombre.
  const RX_FALLA_ANTES = /(lo |la )?(fallo|falla|perdono|perdona|desperdicio|desperdicia) $/;
  const RX_ADELANTADO = /^ (que )?(estaba |esta |queda )?(se adelanta|adelantado|en fuera de (juego|lugar)|en posicion adelantada)/;
  const RX_FALLA = /^\s*(,\s*)?(que\s+)?(no\s+)?(se\s+|la\s+|le\s+|lo\s+)?(falla|desperdicia|no acierta|no puede definir|la manda fuera|manda fuera|la vuela|se le escapa|perdona)/;
  const RX_FALTA_DESC = /falta|entrada|derrib|zancadill|agarr|empuj|plancha|codazo|codo|patada|mano|sujet|barr|pega|golpe|manotazo|brazo|pisot|tumba|arrolla|lleva por delante|a destiempo/;

  function mencionesEn(texto, jugadores){
    const x = " " + nl(texto).replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ") + " ";
    const out = [];
    jugadores.forEach(j => {
      let pos = -1, fin = -1;
      (j.nombres || []).forEach(n => { const nn = " " + nl(n).replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim() + " "; const i = x.indexOf(nn);
        if(nn.trim().length > 3 && i >= 0 && (pos < 0 || i < pos)){ pos = i; fin = i + nn.length - 1; } });
      if(pos < 0 && j.unico && j.apellido){ const a = " " + nl(j.apellido) + " "; const i = x.indexOf(a); if(i >= 0){ pos = i; fin = i + a.length - 1; } }
      if(pos >= 0) out.push({ j, pos, fin });
    });
    out.sort((a, b) => a.pos - b.pos);
    return { x, lista: out };
  }

  function clasificarSuceso(item, ctx){
    const res = { eventos:[], extras:[], dudas:[] };
    const jug = (ctx && ctx.jugadores) || [];
    const ti = nl(item.titulo).replace(/^[^a-z0-9]+/, "");
    const { x, lista } = mencionesEn((item.titulo || "") + " . " + (item.descripcion || ""), jug);
    const eq = ctx && ctx.equipo;
    const tras = m => x.slice(m.fin, m.fin + 45);
    // Ventana del jugador: de su nombre al siguiente jugador nombrado (como máximo 70 caracteres).
    const ventana = m => { const sig = lista.find(o => o.pos > m.fin); return x.slice(m.fin, Math.min(m.fin + 70, sig ? sig.pos + 1 : x.length)); };
    const antes = m => x.slice(Math.max(0, m.pos - 45), m.pos + 1);
    const titulo = (item.titulo || "").trim();
    const inf = item.informe || [];

    // ---- Errores (forma estándar) ----
    const esGol = item.tipo === "goal";
    const esTiroTitulo = /^(tiro|remate|disparo|cabezazo|chut|volea|poste|travesano|larguero)/.test(ti) && !/^tiro (de esquina|libre)/.test(ti);
    const esOcasion = /^(ocasion|oportunidad|jugada de peligro|peligro|llegada|aproximacion)/.test(ti);
    const errores = [];
    const agregaError = j => { if(errores.indexOf(j) < 0) errores.push(j); };
    lista.forEach(m => {
      const a = antes(m), d = tras(m);
      if(/error (de|del|grave de) $/.test(a)) agregaError(m.j);
      else if(/(le )?roba (el balon|la pelota) a $/.test(a)) agregaError(m.j);
      else if(/^ (comete un error|se equivoca|pierde el balon|pierde la pelota|regala el balon)/.test(d)) agregaError(m.j);
      else if(/^ entrega (el balon|la pelota) a /.test(d)){
        const rival = lista.find(o => o.pos > m.fin && o.pos <= m.fin + 30 && o.j.equipo !== m.j.equipo);
        if(rival) agregaError(m.j);
      }
    });
    // "presiona a X … le roba el balón" (el pronombre se refiere a X).
    const rp = / presiona a /g; let mm;
    while((mm = rp.exec(x))){
      const p = mm.index + mm[0].length - 1;
      const v = lista.find(m => m.pos === p);
      if(v && /^.{0,60}?le roba (el balon|la pelota)/.test(x.slice(v.fin))) agregaError(v.j);
    }
    errores.forEach(j => {
      if(esGol){
        const gol = inf.find(e => e.tipo === "goal");
        if(gol && gol.equipo !== j.equipo && !gol.autogol) res.extras.push([j.key, "error_gol"]);
        else res.dudas.push(`«${titulo}»: error de ${j.key} en un gol que no recibe su equipo; no se asigna.`);
      } else if(esTiroTitulo || esOcasion) res.extras.push([j.key, "error_ocasion"]);
      else res.dudas.push(`«${titulo}»: error de ${j.key} sin tiro, ocasión ni gol en el bloque; no se asigna.`);
    });

    // ---- Penal fallado: solo con PFa del informe ----
    if(item.tipo === "penmiss" || (/^(penal|penalti)/.test(ti) && /fall|atajad|errad|detenid|poste|fuera/.test(ti))){
      const pfa = inf.find(e => e.tipo === "penmiss");
      if(!pfa){ res.dudas.push(`«${titulo}»: penal fallado sin línea PFa en el informe; no se asigna.`); return res; }
      // Penal atajado: el portero rival nombrado con un verbo de atajada se lleva el penal atajado (crítico).
      const gkp = lista.find(m => m.j.gk && m.j.equipo !== pfa.equipo);
      if(gkp && /\b(lo |la )?(para|paro|ataja|atajo|detiene|detuvo|rechaza|rechazo|adivina|adivino|salva|desvia|saca)\b/.test(x)) res.eventos.push([gkp.j.key, "PSAV"]);
      return res;   // el extra de penal fallado lo agrega el informe (PFa)
    }
    if(esGol || item.tipo === "sub") return res;   // goles, asistencias y cambios: los da el informe

    // ---- Tarjetas del informe: falta cometida al amonestado y recibida al rival nombrado ----
    if(item.tipo === "yellow" || item.tipo === "red"){
      const ev = inf.find(e => e.tipo === item.tipo);
      if(ev && RX_FALTA_DESC.test(nl(item.descripcion))){
        res.eventos.push([ev.jugador, "FC"]);
        const vic = lista.find(m => m.j.equipo !== ev.equipo); if(vic) res.eventos.push([vic.j.key, "FW"]);
      }
      return res;
    }
    if(/^(var|revision|lesion|pausa|hidratacion|asistencia|dato|tiempo anadido|tiempo de reposicion|anuncio|cambio|sustituci)/.test(ti)) return res;

    // ---- Tiros ----
    if(esTiroTitulo){
      if(!eq){ res.dudas.push(`«${titulo}»: no se sabe qué equipo remata; el tiro no se asigna.`); return res; }
      const atac = lista.filter(m => m.j.equipo === eq && !m.j.gk);
      let tirador = null;
      const fallo = atac.filter(m => RX_FALLA_ANTES.test(antes(m)));               // "¡Lo falló X!"
      const pasadores = atac.filter(m => RX_PASA_DESPUES.test(ventana(m)));
      const noPasan = atac.filter(m => pasadores.indexOf(m) < 0);
      const conVerbo = noPasan.filter(m => RX_VERBO_TIRO.test(ventana(m)));
      if(fallo.length === 1) tirador = fallo[0];
      else if(conVerbo.length) tirador = conVerbo[conVerbo.length - 1];
      else {
        const receptores = noPasan.filter(m => RX_PASE_ANTES.test(antes(m).replace(/\s+$/, " ")));
        if(receptores.length) tirador = receptores[receptores.length - 1];
        else if(noPasan.length === 1) tirador = noPasan[0];
      }
      const alPoste = /poste|palo|larguero|travesano/.test(ti), bloqueado = /bloquead/.test(ti);
      const desviado = /desviad|fuera|por encima|por un lado|rozando/.test(ti);
      const aPuerta = !alPoste && !bloqueado && !desviado && /a puerta|atajad|parad|detenid|salvad|al arco|a porteria/.test(ti);
      const cat = aPuerta ? "SOnT" : bloqueado ? "BS" : "SOffT";
      if(tirador) res.eventos.push([tirador.j.key, cat]);
      else if(atac.length > 1) res.dudas.push(`«${titulo}»: no queda claro quién remata (${atac.map(m => m.j.key).join(", ")}); el tiro no se asigna.`);
      else res.dudas.push(`«${titulo}»: el relato no nombra al que remata; el tiro no se asigna.`);
      if(aPuerta && !/sobre la linea|en la linea|bajo palos|debajo de los palos/.test(nl(item.descripcion))){
        const gk = lista.find(m => m.j.equipo !== eq && m.j.gk);
        if(gk) res.eventos.push([gk.j.key, "SAV"]);
      }
      // Ocasión clara fallada en un tiro (solo con el verbo pegado al nombre).
      atac.forEach(m => { if(RX_FALLA.test(tras(m)) || (fallo.length === 1 && fallo[0] === m)) res.extras.push([m.j.key, "ocasion_fallada"]); });
      return res;
    }
    // ---- Ocasión sin remate ----
    if(esOcasion){
      const atac = lista.filter(m => (!eq || m.j.equipo === eq) && !m.j.gk);
      atac.forEach(m => { if(RX_FALLA.test(tras(m))) res.extras.push([m.j.key, "ocasion_fallada"]); });
      if(/fallad|clara/.test(ti) && !res.extras.some(e => e[1] === "ocasion_fallada")) res.dudas.push(`«${titulo}»: ocasión fallada sin un jugador seguido de "falla" o similar; no se asigna.`);
      return res;
    }
    // ---- Faltas, manos y fueras de lugar ----
    if(/^(falta|mano)\b/.test(ti)){
      if(!eq){ res.dudas.push(`«${titulo}»: no se sabe qué equipo comete la falta.`); return res; }
      const inf2 = lista.find(m => m.j.equipo === eq); if(inf2) res.eventos.push([inf2.j.key, "FC"]);
      const vic = lista.find(m => m.j.equipo !== eq);
      if(vic && /^falta/.test(ti)){ res.eventos.push([vic.j.key, "FW"]); if(/penal(ti)?|pena maxima/.test(x)) res.eventos.push([vic.j.key, "PW"]); }
      return res;
    }
    if(/fuera de lugar|fuera de juego|posicion adelantada|offside/.test(ti)){
      // El adelantado: el que "se adelanta" / "estaba adelantado"; si no, el que recibe el pase; si no, el único nombrado.
      const cand = lista.filter(m => !eq || m.j.equipo === eq);
      let adel = cand.find(m => RX_ADELANTADO.test(x.slice(m.fin, m.fin + 40)));
      if(!adel){ const rec = cand.filter(m => RX_PASE_ANTES.test(antes(m))); if(rec.length) adel = rec[rec.length - 1]; }
      if(!adel && cand.length === 1) adel = cand[0];
      if(adel) res.eventos.push([adel.j.key, "O"]);
      else if(cand.length) res.dudas.push(`«${titulo}»: no queda claro quién estaba adelantado; no se asigna.`);
      return res;
    }
    return res;
  }

  /* ---------- Tablas de Opta: conteos o puntos ----------
     La página de Opta Points tiene dos vistas: "Stats" (conteos: 33 pases) y "Points" (puntos por categoría:
     0.70 = 35 pases × 0.02). tablaEsDePuntos decide cuál es con los valores (hay negativos, o pases/centros
     que no son enteros → puntos). puntosAConteos divide entre el peso oficial y exige un múltiplo exacto. */
  const OPTA_CATS_TABLA = ["G","SOnT","SOffT","BS","OG","A","P","C","Tk","INT","FW","FC","O","YC","RC","GC","PW","SAV","PSAV"];
  function tablaEsDePuntos(filas){
    return filas.some(v => OPTA_CATS_TABLA.some(c => (+v[c] || 0) < 0)) ||
           filas.some(v => ["P","C"].some(c => v[c] != null && Math.abs(v[c] - Math.round(v[c])) > 1e-6));
  }
  function puntosAConteos(v, gk, cfg){
    cfg = cfg || CONFIG;
    const w = Object.assign({}, cfg.PESOS_OPTA, gk ? cfg.PESOS_OPTA_GK : cfg.PESOS_OPTA_CAMPO);
    const conteos = {}, problemas = [];
    OPTA_CATS_TABLA.forEach(c => {
      const x = +v[c] || 0;
      if(!x){ conteos[c] = 0; return; }
      if(!w[c]){ conteos[c] = 0; problemas.push(`${c} trae ${x} pero su peso es 0`); return; }
      const n = x / w[c];
      if(Math.abs(n - Math.round(n)) > 0.02 || Math.round(n) < 0) problemas.push(`${c} = ${x} no es múltiplo de ${w[c]}`);
      conteos[c] = Math.max(0, Math.round(n));
    });
    return { conteos, problemas };
  }

  const API = { CONFIG, CATS, CRITICAS, preparar, evaluar, final, errores, redondear, optaPoints, grupoDePosicion, sumaPuntos, clasificarSuceso, mencionesEn, nl, tablaEsDePuntos, puntosAConteos };
  if(typeof module !== "undefined" && module.exports) module.exports = API;
  if(raiz) raiz.CalificacionesV2 = API;
})(typeof window !== "undefined" ? window : (typeof globalThis !== "undefined" ? globalThis : null));
