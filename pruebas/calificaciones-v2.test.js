/* =========================================================
   COPA MANAGER 2026 — pruebas/calificaciones-v2.test.js
   Pruebas automáticas del módulo nucleo/calificaciones-v2.js (no son parte del juego).
   Uso:  node pruebas/calificaciones-v2.test.js      (sin dependencias; sale con código 1 si algo falla)
   ========================================================= */
"use strict";
const path = require("path");
const V2 = require(path.join(__dirname, "..", "nucleo", "calificaciones-v2.js"));
const D = require(path.join(__dirname, "datos", "mex-rsa-2026.js"));

let ok = 0, mal = 0; const fallas = [];
function prueba(nombre, fn){
  try { const extra = fn(); ok++; console.log("  ✔ " + nombre + (extra ? "  — " + extra : "")); }
  catch(e){ mal++; fallas.push(nombre); console.log("  ✘ " + nombre + "\n      " + (e && e.message)); }
}
function igual(a, b, msg){ if(a !== b) throw new Error((msg || "") + ` esperado ${JSON.stringify(b)}, obtuve ${JSON.stringify(a)}`); }
function cerca(a, b, tol, msg){ if(!(Math.abs(a - b) <= tol)) throw new Error((msg || "") + ` esperado ${b} ± ${tol}, obtuve ${a}`); }
function cierto(c, msg){ if(!c) throw new Error(msg || "condición falsa"); }
const signo = x => Math.abs(x) < 1e-12 ? 0 : Math.sign(x);
// Coeficientes que usa un jugador: v0 con Opta; el perfil sin Opta en el nivel "relato".
const coef = (M, key) => (M.J[key].nivelDatos === "relato" && M.cfg.PERFIL_SIN_OPTA && M.cfg.PERFIL_SIN_OPTA.activo) ? M.cfg.PERFIL_SIN_OPTA : M.cfg;
const clon = o => JSON.parse(JSON.stringify(o));

// Partido completo (con estadísticas de Opta) y la variante del juego (sin estadísticas: solo relato + informe).
const partidoOpta = clon(D);
const partidoSinOpta = clon(D); partidoSinOpta.jugadores.forEach(j => { j.opta = null; });
const M_OPTA = V2.preparar(partidoOpta);
const M_SIN = V2.preparar(partidoSinOpta);
const conNota = m => Object.values(m.J).filter(j => typeof j.real === "number");

// Todos los sucesos (goles, eventos, extras) en orden global, con quién los afecta.
function sucesosOrdenados(modelo){
  const L = [];
  Object.values(modelo.J).forEach(j => {
    j.ev.forEach(e => { if(isFinite(e.idx)) L.push({ idx:e.idx, min:e.min, j }); });
    j.extras.forEach(e => L.push({ idx:e.idx, min:e.min, j }));
  });
  modelo.goles.forEach(g => Object.values(modelo.J).forEach(j => { if(j.equipo === g.equipo || modelo.equipos.includes(j.equipo)) L.push({ idx:g.idx, min:g.min, j, gol:g }); }));
  return L;
}
const hasta = h => (e => e.idx <= h);
// Partidos sintéticos mínimos.
function mini(jug, opts){
  return Object.assign({ duracion:90, equipos:["A","B"], jugadores:jug, goles:[], eventos:[], extras:[] }, opts || {});
}
const base = (k, eq, extra) => Object.assign({ key:k, nombre:k, equipo:eq, grupo:"FW", entra:0, sale:90, real:null, opta:null }, extra || {});

console.log("\n== Opta Points y regresión contra el script de calibración");
prueba("T1 · opta_points oficial = PTS de Opta en los 30 jugadores con estadísticas", () => {
  let n = 0;
  D.jugadores.forEach(p => { if(!p.opta) return; n++; cerca(M_OPTA.J[p.key].optaPoints, p.opta_pts, 1e-9, p.key); });
  igual(n, 30); return `${n}/30`;
});
prueba("R1 · nota_motor final = script de calibración (ajuste E5) en los 30", () => {
  let peor = 0;
  Object.entries(D.esperado_python_e5).forEach(([k, v]) => { const d = Math.abs(M_OPTA.J[k].motorFinal - v); peor = Math.max(peor, d); cerca(M_OPTA.J[k].motorFinal, v, 1e-9, k); });
  return `diferencia máxima ${peor.toExponential(1)}`;
});
prueba("R3 · trayectorias minuto a minuto = script de calibración (30 jugadores, cada 3')", () => {
  let n = 0, peor = 0;
  Object.entries(D.esperado_python_trayectorias).forEach(([k, filas]) => filas.forEach(([t, motor, mostrada]) => {
    const r = V2.evaluar(M_OPTA, k, t);
    cerca(r.nota_motor, motor, 1e-9, `${k} ${t}' motor`); cerca(r.nota_mostrada, mostrada, 1e-9, `${k} ${t}' mostrada`);
    peor = Math.max(peor, Math.abs(r.nota_motor - motor), Math.abs(r.nota_mostrada - mostrada)); n++;
  }));
  return `${n} puntos, diferencia máxima ${peor.toExponential(1)}`;
});
prueba("R2 · MAE de nota_motor sin calibrar contra FotMob (N = 30) = 0.197", () => {
  const e = V2.errores(M_OPTA, true); igual(e.n, 30); cerca(e.mae, 0.197, 0.0005); return `MAE ${e.mae.toFixed(3)}`;
});

console.log("\n== Calibración exacta, límites, conservación y bitácora");
[["con Opta", M_OPTA], ["sin Opta (como en el juego)", M_SIN]].forEach(([nom, M]) => {
  prueba(`T4 · nota_mostrada final = nota real en TODOS los jugadores con nota numérica (${nom})`, () => {
    const L = conNota(M);
    L.forEach(j => {
      const r = V2.evaluar(M, j.key, Math.max(M.T, j.sale), () => true);
      igual(r.nota_mostrada, j.real, j.key + " nota_mostrada");
      igual(r.mostrar, j.real.toFixed(1), j.key + " texto");
    });
    cierto(L.some(j => j.key === "Zwane"), "Zwane (suplente sin estadísticas) debe estar incluido");
    return `${L.length}/${L.length}, incluido Zwane (4.9, sin estadísticas de Opta)`;
  });
  prueba(`T3 · nota_motor y nota_mostrada entre 3 y 10 en cada minuto de cada jugador (${nom})`, () => {
    let mn = 10, mx = 3;
    Object.values(M.J).forEach(j => { for(let t = 0; t <= M.T; t += 0.5){ const r = V2.evaluar(M, j.key, t);
      [r.nota_motor, r.nota_mostrada].forEach(v => { if(v == null) return; cierto(v >= 3 && v <= 10, `${j.key} ${t}' ${v}`); mn = Math.min(mn, v); mx = Math.max(mx, v); }); } });
    return `mínimo ${mn.toFixed(2)}, máximo ${mx.toFixed(2)}`;
  });
});
prueba("T5 · conservación: al final, repetibles = estadísticas; críticos = máx(narrados, estadísticas)", () => {
  Object.values(M_OPTA.J).forEach(j => {
    if(!j.opta) return;
    const r = V2.evaluar(M_OPTA, j.key, Math.max(M_OPTA.T, j.sale), () => true);
    V2.CATS.forEach(c => {
      const tot = j.opta[c] || 0, usado = r.opta_vivo == null ? 0 : (j.ev.filter(e => e.cat === c).reduce((a, e) => a + e.cant * e.peso, 0) + (j.resto[c] || 0));
      if(V2.CRITICAS.has(c)){ const narr = j.ev.filter(e => e.cat === c && !e.sinMinuto).length; cerca(usado, Math.max(narr, tot), 1e-9, `${j.key} ${c}`); }
      else cerca(usado, tot, 1e-9, `${j.key} ${c}`);
    });
    cerca(r.opta_vivo, j.optaPoints, 1e-9, j.key + " opta_vivo final");
  });
});
prueba("T6 · bitácora: Jiménez, Rangel, Appollis y Montes quedan registrados", () => {
  const txt = M_OPTA.bitacora.map(b => b.jugador + ": " + b.texto);
  ["Jiménez: SOnT", "Rangel: SAV", "Appollis: SOnT", "Montes: RC narrado"].forEach(s => cierto(txt.some(t => t.indexOf(s) === 0), "falta " + s));
  return txt.length + " notas";
});

console.log("\n== Punto 1 · corrección gradual en vivo");
[["con Opta", M_OPTA], ["sin Opta", M_SIN]].forEach(([nom, M]) => {
  prueba(`P1a · ningún suceso cambia de signo en la nota mostrada (reloj detenido) (${nom})`, () => {
    let n = 0, ceros = 0;
    sucesosOrdenados(M).forEach(s => {
      const t = s.min;
      const a = V2.evaluar(M, s.j.key, t, hasta(s.idx - 1)), b = V2.evaluar(M, s.j.key, t, hasta(s.idx));
      const dM = b.nota_motor - a.nota_motor;
      if(a.nota_mostrada == null || b.nota_mostrada == null) return;
      const dV = b.nota_mostrada - a.nota_mostrada;
      if(signo(dM) === 0) return;
      n++; if(signo(dV) === 0) ceros++;
      cierto(signo(dV) === signo(dM) || signo(dV) === 0, `${s.j.key} ${t}': motor ${dM.toFixed(4)}, mostrada ${dV.toFixed(4)}`);
    });
    return `${n} cambios revisados${ceros ? `, ${ceros} topados en 3/10` : ""}`;
  });
  prueba(`P1b · deriva: signo constante; ≤ objetivo si |Δ|/M ≤ objetivo; si no, lineal y = |Δ|/M (${nom})`, () => {
    let peor = 0, quien = "", porEncima = 0;
    conNota(M).forEach(j => {
      if(j.M <= 0 || !j.delta) return;
      const obj = M.cfg.DERIVA_OBJETIVO, nec = Math.abs(j.delta) / j.M;
      const lim = (nec <= obj ? obj : nec) * (1 + 1e-9) + 1e-12;      // garantía: máx(objetivo, |Δ|/M)
      if(nec > obj){ porEncima++; cierto(j.gamma === 1, `${j.key}: con |Δ|/M > objetivo la corrección debe ser lineal`); }
      for(let t = j.entra; t < j.sale; t += 1){
        const t2 = Math.min(t + 1, j.sale);
        if(t2 >= j.sale) break;               // el último minuto asigna la nota real (no es deriva)
        const inc = e => e.min <= t;           // mismos sucesos en los dos instantes
        const a = V2.evaluar(M, j.key, t, inc), b = V2.evaluar(M, j.key, t2, inc);
        const deriva = (b.nota_mostrada - a.nota_mostrada) - (b.nota_motor - a.nota_motor);
        if(a.nota_mostrada > 3 && a.nota_mostrada < 10 && b.nota_mostrada > 3 && b.nota_mostrada < 10){
          cierto(Math.abs(deriva) <= lim, `${j.key} ${t}'→${t2}': ${deriva.toFixed(4)} > ${lim.toFixed(4)}`);
          cierto(signo(deriva) === 0 || signo(deriva) === signo(j.delta), `${j.key}: deriva con signo contrario a Δ`);
          if(Math.abs(deriva) > peor){ peor = Math.abs(deriva); quien = `${j.key} (Δ ${j.delta.toFixed(2)}, ${j.M}')`; }
        }
      }
    });
    return `máxima ${peor.toFixed(4)} por minuto: ${quien}; ${porEncima} jugador(es) por encima del objetivo, con corrección lineal`;
  });
});
prueba("P1d · garantía de deriva en casos extremos: objetivo cumplido cuando se puede; si no, exactamente |Δ|/M", () => {
  // A: |Δ| ≈ 1 en 90' → cabe en el objetivo.  B: |Δ| ≈ 2 en 12' → no cabe: lineal, |Δ|/M ≈ 0.17 por minuto.
  const M = V2.preparar(mini([base("A","A",{ grupo:"MF", real:7.0 }), base("B","A",{ grupo:"MF", entra:78, real:8.0 }), base("Y","B")]));
  const medir = k => { const j = M.J[k]; let mx = 0; for(let t = j.entra; t < j.sale - 1; t++){ const a = V2.evaluar(M, k, t), b = V2.evaluar(M, k, t + 1); mx = Math.max(mx, Math.abs((b.nota_mostrada - a.nota_mostrada) - (b.nota_motor - a.nota_motor))); } return mx; };
  const A = M.J.A, B = M.J.B, obj = M.cfg.DERIVA_OBJETIVO;
  cierto(Math.abs(A.delta) / A.M <= obj && medir("A") <= obj + 1e-12, "A dentro del objetivo");
  cierto(B.gamma === 1 && Math.abs(medir("B") - Math.abs(B.delta) / B.M) < 1e-9, "B lineal = |Δ|/M");
  cierto(M.bitacora.some(b => b.jugador === "B" && /por encima del objetivo/.test(b.texto)), "B anotado en la bitácora");
  igual(V2.evaluar(M, "B", 90).nota_mostrada, 8.0);
  return `A: ${medir("A").toFixed(4)} ≤ ${obj}; B: ${medir("B").toFixed(4)} = |Δ|/M (${B.M}')`;
});
prueba("P1c · sin la regla del reloj detenido una acción positiva SÍ podría bajar la nota (por eso existe la regla)", () => {
  // Nota real 4.0 muy por debajo del motor (Δ ≈ −2): una falta recibida (+0.07) al 60' junto con un salto de reloj de 10'.
  const M = V2.preparar(mini([base("X","A",{ grupo:"MF", real:4.0 }), base("Y","B")], { eventos:[{ min:60, orden:1, jugador:"X", cat:"FW" }] }));
  const e = M.J.X.ev[0];
  const antes = V2.evaluar(M, "X", 60, hasta(e.idx - 1)), despues = V2.evaluar(M, "X", 60, hasta(e.idx));
  const saltoReloj = V2.evaluar(M, "X", 50, hasta(e.idx - 1));
  cierto(despues.nota_mostrada > antes.nota_mostrada, "con el reloj detenido sube");
  cierto(despues.nota_mostrada < saltoReloj.nota_mostrada, "aplicada junto con 10' de deriva, bajaría");
  return `reloj detenido +${(despues.nota_mostrada - antes.nota_mostrada).toFixed(3)}; mezclada con 10' de deriva ${(despues.nota_mostrada - saltoReloj.nota_mostrada).toFixed(3)}`;
});

console.log("\n== Punto 2 · discrepancias en eventos críticos");
prueba("P2a · Opta trae 2 goles, el informe 1: el narrado conserva minuto y peso 1; el otro entra al final", () => {
  const M = V2.preparar(mini([base("X","A",{ opta:{ G:2, SOnT:2 } }), base("Y","B")], { goles:[{ min:30, orden:1, equipo:"A", autor:"X" }] }));
  const g = M.J.X.ev.filter(e => e.cat === "G");
  igual(g.length, 2); igual(g[0].min, 30); igual(g[0].peso, 1); cierto(g[1].sinMinuto && g[1].min === 90, "el segundo va sin minuto al final");
  const antes = V2.evaluar(M, "X", 89.9), fin = V2.evaluar(M, "X", 90);
  cerca(fin.S - antes.S, 1.4, 1e-9, "el gol sin minuto aparece al final, con su tiro al arco");
  cierto(M.bitacora.some(b => b.critica && /G: Opta registra 2, narrados 1/.test(b.texto)), "bitácora crítica");
});
prueba("P2b · Opta trae 0 goles, el informe 1: el gol cuenta completo y se anota como discrepancia crítica", () => {
  const M = V2.preparar(mini([base("X","A",{ opta:{ G:0, SOnT:0 } }), base("Y","B")], { goles:[{ min:30, orden:1, equipo:"A", autor:"X" }] }));
  const g = M.J.X.ev.find(e => e.cat === "G"); igual(g.peso, 1);
  cerca(V2.evaluar(M, "X", 31).S, 1.4, 1e-9, "gol + su tiro");
  cierto(M.bitacora.some(b => b.critica && /se respeta el relato/.test(b.texto)));
});
prueba("P2c · roja y asistencia nunca se reducen; los tiros repetibles sí se reparten", () => {
  const M = V2.preparar(mini([base("X","A",{ opta:{ RC:0, A:0, SOffT:1 } }), base("Y","B")], {
    goles:[{ min:20, orden:1, equipo:"A", autor:"Y2", asistente:"X" }],
    eventos:[{ min:40, orden:1, jugador:"X", cat:"RC" }, { min:10, orden:1, jugador:"X", cat:"SOffT" }, { min:15, orden:1, jugador:"X", cat:"SOffT" }] }));
  M.J.X.ev.filter(e => e.cat === "RC" || e.cat === "A").forEach(e => igual(e.peso, 1, e.cat));
  M.J.X.ev.filter(e => e.cat === "SOffT").forEach(e => cerca(e.peso, 0.5, 1e-12, "SOffT"));
});
prueba("P2d · el tiro al arco de un gol no se reparte con los demás tiros (Jiménez)", () => {
  const j = M_OPTA.J["Jiménez"];
  igual(j.ev.find(e => e.deCritico).peso, 1);
  j.ev.filter(e => e.cat === "SOnT" && !e.deCritico).forEach(e => cerca(e.peso, 0.5, 1e-12));
  return "gol 1 + 2 tiros narrados a 0.5 = 2 tiros al arco de Opta";
});

console.log("\n== Punto 3 · resultado del equipo");
function escenario(goles){
  const J = [base("MF","A",{ grupo:"MF" }), base("GK","A",{ grupo:"GK" }), base("DF","A",{ grupo:"DF" }), base("R","B")];
  return V2.preparar(mini(J, { goles: goles.map((g, i) => ({ min:g[0], orden:i, equipo:g[1], autor:"R" })) }));
}
const ESC = {
  "gana 1-0":        [[60,"A"]],
  "empata 1-1":      [[60,"A"],[80,"B"]],
  "remonta 0-1 → 2-1": [[20,"B"],[60,"A"],[85,"A"]],
  "pierde 0-2":      [[30,"B"],[70,"B"]]
};
const salto = (M, key, g) => { const a = V2.evaluar(M, key, g.min, hasta(g.idx - 1)), b = V2.evaluar(M, key, g.min, hasta(g.idx)); return b.nota_motor - a.nota_motor; };
Object.entries(ESC).forEach(([nom, gs]) => {
  prueba(`P3 · ${nom}: un gol ajeno mueve al medio ≤ cr (a favor) o ≤ cr + k·0.1 (en contra); el resultado final aporta ≤ cr`, () => {
    const M = escenario(gs), P = coef(M, "MF"), cr = P.cr, gc = P.k * 0.1;
    const saltos = M.goles.map(g => { const d = salto(M, "MF", g); cierto(Math.abs(d) <= (g.equipo === "A" ? cr : cr + gc) + 1e-12, `salto ${d}`); return d; });
    const fin = V2.evaluar(M, "MF", 90);
    const resultado = cr * fin.s * fin.m / M.T;
    cierto(Math.abs(resultado) <= cr + 1e-12, "aporte final del resultado");
    return `medio: saltos ${saltos.map(d => (d >= 0 ? "+" : "") + d.toFixed(2)).join(", ")}; resultado final ${(resultado >= 0 ? "+" : "") + resultado.toFixed(2)}; nota ${fin.nota_motor.toFixed(2)}`;
  });
});
prueba("P3 · gol recibido: portero y defensa bajan más que el medio (su acción), sin que el resultado domine", () => {
  const M = escenario([[60,"B"]]); const g = M.goles[0];
  const dMF = salto(M, "MF", g), dGK = salto(M, "GK", g), dDF = salto(M, "DF", g);
  const P = coef(M, "MF");
  cerca(dMF, P.k * -0.1 - P.cr * 60 / 90, 1e-12); cerca(dGK, P.k * -0.6 - P.cr * 60 / 90, 1e-12); cerca(dDF, P.k * -0.1 + P.cgc - P.cr * 60 / 90, 1e-12);
  return `al 60': medio ${dMF.toFixed(2)}, defensa ${dDF.toFixed(2)}, portero ${dGK.toFixed(2)}`;
});
prueba("P3 · el resultado completo vale menos de un tercio de un gol propio (v0 y perfil sin Opta)", () => {
  const c = V2.CONFIG, p = V2.CONFIG.PERFIL_SIN_OPTA;
  cierto(c.cr < (c.k * 1.4) / 3, `cr ${c.cr} vs gol ${c.k * 1.4}`);
  cierto(p.cr < (p.k * 1.4) / 3, `perfil: cr ${p.cr} vs gol ${p.k * 1.4}`);
  return `v0: resultado ±${c.cr.toFixed(2)} · gol propio +${(c.k * 1.4).toFixed(2)} | sin Opta: ±${p.cr.toFixed(2)} · +${(p.k * 1.4).toFixed(2)}`;
});

console.log("\n== Punto 4 · casos sin datos");
prueba("P4a · sin estadísticas de Opta (Zwane): opta_points nulo, nota del relato, calibración exacta", () => {
  const j = M_OPTA.J.Zwane; igual(j.optaPoints, null); igual(j.opta, null);
  cierto(typeof j.motorFinal === "number" && isFinite(j.motorFinal));
  igual(V2.evaluar(M_OPTA, "Zwane", 90).nota_mostrada, 4.9);
  return `nota_motor ${j.motorFinal.toFixed(2)} → mostrada 4.9`;
});
prueba("P4b · sin nota real: nota_mostrada = nota_motor, sin corrección", () => {
  const p = clon(partidoOpta); p.jugadores.forEach(j => { j.real = null; });
  const M = V2.preparar(p);
  Object.values(M.J).forEach(j => { const r = V2.evaluar(M, j.key, 60); igual(r.nota_mostrada, r.nota_motor, j.key); igual(j.delta, null); });
});
prueba("P4c · nota real SC: se muestra SC siempre y nunca se usa como número", () => {
  const p = clon(partidoOpta); p.jugadores.find(j => j.key === "Vega").real = "SC";
  const M = V2.preparar(p); const j = M.J.Vega;
  igual(j.real, "SC"); igual(j.delta, null);
  for(let t = 0; t <= 90; t++){ const r = V2.evaluar(M, "Vega", t); igual(r.mostrar, "SC"); igual(r.nota_mostrada, null); cierto(!Number.isNaN(r.nota_motor)); }
  const f = V2.final(M).find(x => x.key === "Vega"); igual(f.nota_mostrada, null); cierto(typeof f.nota_motor === "number");
  cierto(V2.errores(M).n === 30, "SC queda fuera de las métricas");
  return `nota_motor guardada ${f.nota_motor.toFixed(2)}, mostrada SC`;
});
prueba("P4d · nota real numérica con menos de 10 minutos: SC durante el partido y la real al final", () => {
  const M = V2.preparar(mini([base("S","A",{ entra:84, real:6.4 }), base("Y","B")]));
  igual(V2.evaluar(M, "S", 89).mostrar, "SC"); igual(V2.evaluar(M, "S", 90).mostrar, "6.4");
});
prueba("P4e · jugador con 0 minutos (entra al 90): sin divisiones entre cero", () => {
  const M = V2.preparar(mini([base("Z","A",{ entra:90, real:null }), base("Y","B")]));
  const r = V2.evaluar(M, "Z", 90); igual(r.mostrar, "SC"); cierto(isFinite(r.nota_motor));
});

console.log("\n== Punto 5 · regresión T7–T10");
prueba("T7 · separación: cambiar la nota real no cambia nota_motor", () => {
  const p = clon(partidoOpta); p.jugadores.forEach(j => { if(typeof j.real === "number") j.real = 3 + ((j.real * 7) % 7); });
  const M = V2.preparar(p);
  Object.keys(M.J).forEach(k => igual(M.J[k].motorFinal, M_OPTA.J[k].motorFinal, k));
  for(const t of [10, 45, 70]) Object.keys(M.J).forEach(k => igual(V2.evaluar(M, k, t).nota_motor, V2.evaluar(M_OPTA, k, t).nota_motor, k));
});
prueba("T8 · monotonía: cada suceso mueve nota_motor en el sentido de su peso", () => {
  let n = 0;
  [M_OPTA, M_SIN].forEach(M => Object.values(M.J).forEach(j => {
    j.ev.concat(j.extras).forEach(e => {
      if(!isFinite(e.idx)) return;
      if(M.goles.some(g => g.idx === e.idx)) return;   // goles: ver T9 y P3
      const a = V2.evaluar(M, j.key, e.min, hasta(e.idx - 1)), b = V2.evaluar(M, j.key, e.min, hasta(e.idx));
      let w;
      if(e.tipo) w = M.cfg.EXTRAS[e.tipo];
      else { const op = Object.assign({}, M.cfg.PESOS_OPTA, j.grupo === "GK" ? M.cfg.PESOS_OPTA_GK : M.cfg.PESOS_OPTA_CAMPO);
             w = M.cfg.k * op[e.cat] + (e.cat === "RC" ? M.cfg.croja : 0) + (e.cat === "GC" && j.grupo === "DF" ? M.cfg.cgc : 0); }
      const d = b.nota_motor - a.nota_motor;
      if(e.peso === 0) return;
      cierto(signo(d) === signo(w) || signo(d) === 0, `${j.key} ${e.cat || e.tipo} ${e.min}': ${d}`); n++;
    });
  }));
  return `${n} sucesos`;
});
prueba("T9 · doble conteo: el gol de Quiñones suma exactamente k × 1.4 más el cambio de resultado", () => {
  const M = M_SIN, g = M.goles[0];
  const a = V2.evaluar(M, "Quiñones", g.min, hasta(g.idx - 1)), b = V2.evaluar(M, "Quiñones", g.min, hasta(g.idx));
  cerca(b.S - a.S, 1.4, 1e-12, "S");
  const P = coef(M, "Quiñones");
  cerca(b.nota_motor - a.nota_motor, P.k * 1.4 + P.cr * 9 / 90, 1e-12, "nota_motor");
  return `+${(b.nota_motor - a.nota_motor).toFixed(3)}`;
});
prueba("T10 · redondeo mitad hacia arriba y texto = valor redondeado (del que sale el color)", () => {
  igual(V2.redondear(6.25), 6.3); igual(V2.redondear(6.2499999), 6.2); igual(V2.redondear(7.05), 7.1);
  igual(V2.redondear(5.95), 6.0); igual(V2.redondear(8.84999), 8.8); igual(V2.redondear(6.35), 6.4);
  Object.values(M_SIN.J).forEach(j => { for(const t of [15, 50, 80]){ const r = V2.evaluar(M_SIN, j.key, t); if(r.valor != null) igual(r.mostrar, r.valor.toFixed(1), j.key); } });
});
prueba("T10 · SC con menos de 10 minutos jugados (sin nota real)", () => {
  const M = V2.preparar(mini([base("S","A",{ entra:70 }), base("Y","B")]));
  igual(V2.evaluar(M, "S", 79).mostrar, "SC"); cierto(V2.evaluar(M, "S", 80).mostrar !== "SC");
});

console.log("\n== Clasificador del relato (v2, aislado)");
const R = require(path.join(__dirname, "datos", "mex-rsa-relato.js"));
const ord = L => L.map(x => x.join(":")).sort().join(" | ");
prueba("C1 · México–Sudáfrica: cada bloque asigna exactamente lo esperado (tirador, atajada, faltas, errores)", () => {
  R.bloques.forEach(b => {
    const r = V2.clasificarSuceso({ titulo:b.titulo, descripcion:b.descripcion, tipo:b.tipo, informe:b.informe }, { jugadores:R.jugadores, equipo:b.equipo });
    igual(ord(r.eventos), ord(b.esperado.eventos), `${b.minuto} ${b.titulo} eventos:`);
    igual(ord(r.extras), ord(b.esperado.extras), `${b.minuto} ${b.titulo} extras:`);
  });
  return `${R.bloques.length} bloques`;
});
prueba("C7 · México–Portugal: cada bloque asigna exactamente lo esperado (tiros, adelantados, faltas)", () => {
  const RP = require(path.join(__dirname, "datos", "mex-por-relato.js"));
  RP.bloques.forEach(b => {
    const r = V2.clasificarSuceso({ titulo:b.titulo, descripcion:b.descripcion, tipo:b.tipo, informe:b.informe }, { jugadores:RP.jugadores, equipo:b.equipo });
    igual(ord(r.eventos), ord(b.esperado.eventos), `${b.minuto} ${b.titulo} eventos:`);
    igual(ord(r.extras), ord(b.esperado.extras), `${b.minuto} ${b.titulo} extras:`);
  });
  return `${RP.bloques.length} bloques`;
});
prueba("C8 · Brasil–Noruega: cada bloque asigna exactamente lo esperado (pasador, 'lo falló X', penal atajado, nombres con ø)", () => {
  const RB = require(path.join(__dirname, "datos", "bra-nor-relato.js"));
  RB.bloques.forEach(b => {
    const r = V2.clasificarSuceso({ titulo:b.titulo, descripcion:b.descripcion, tipo:b.tipo, informe:b.informe }, { jugadores:RB.jugadores, equipo:b.equipo });
    igual(ord(r.eventos), ord(b.esperado.eventos), `${b.minuto} ${b.titulo} eventos:`);
    igual(ord(r.extras), ord(b.esperado.extras), `${b.minuto} ${b.titulo} extras:`);
  });
  return `${RB.bloques.length} bloques`;
});
prueba("O1 · tabla de Opta en PUNTOS (vista Points): se detecta y se convierte a conteos exactos", () => {
  const reyes  = { PTS:7.50, MP:90, G:0, SOnT:0.4, SOffT:0, BS:0, OG:0, A:0, P:0.70, C:0, Tk:0.6, INT:0.4, FW:0, FC:-0.1, O:0, YC:0, RC:0, GC:0, PW:0, SAV:0, PSAV:0 };
  const rangel = { PTS:7.18, MP:90, G:0, SOnT:0, SOffT:0, BS:0, OG:0, A:0, P:0.68, C:0, Tk:0, INT:0, FW:0, FC:0, O:0, YC:0, RC:0, GC:0, PW:0, SAV:1.0, PSAV:0 };
  cierto(V2.tablaEsDePuntos([reyes, rangel]), "debe detectarse como puntos");
  cierto(!V2.tablaEsDePuntos([{ P:33, C:1, FC:1, SOnT:2 }]), "una tabla de conteos no es de puntos");
  const a = V2.puntosAConteos(reyes, false), b = V2.puntosAConteos(rangel, true);
  igual(a.problemas.length, 0); igual(a.conteos.P, 35); igual(a.conteos.Tk, 3); igual(a.conteos.INT, 2); igual(a.conteos.FC, 1); igual(a.conteos.SOnT, 1);
  igual(b.conteos.SAV, 2); igual(b.conteos.P, 34);
  cerca(V2.optaPoints(a.conteos, "DF"), 7.50, 1e-9); cerca(V2.optaPoints(b.conteos, "GK"), 7.18, 1e-9);
  cierto(V2.puntosAConteos({ P:0.71 }, false).problemas.length === 1, "0.71 no es múltiplo de 0.02");
  return "Reyes 35 pases, 3 entradas, 2 intercepciones → 7.50; Rangel 2 atajadas → 7.18";
});
const cl = (titulo, descripcion, equipo, extra) => V2.clasificarSuceso(Object.assign({ titulo, descripcion, tipo:"texto", informe:[] }, extra || {}), { jugadores:R.jugadores, equipo });
prueba("C2 · el pasador no se lleva el tiro: 'X filtra para Y, que dispara' → Y (30' y 45+4')", () => {
  const a = R.bloques.find(b => b.minuto === "30'"), b = R.bloques.find(b => b.minuto === "45+4'");
  [a, b].forEach(x => { const r = V2.clasificarSuceso({ titulo:x.titulo, descripcion:x.descripcion, tipo:"texto", informe:[] }, { jugadores:R.jugadores, equipo:"MEX" });
    cierto(r.eventos.some(e => e[0] === "Gutiérrez") && !r.eventos.some(e => e[0] === "Quiñones"), x.minuto); });
});
prueba("C3 · el portero nombrado primero no es el tirador (42'): el tiro es de Jiménez y la atajada de Williams", () => {
  const x = R.bloques.find(b => b.minuto === "42'"); const r = V2.clasificarSuceso({ titulo:x.titulo, descripcion:x.descripcion, tipo:"texto", informe:[] }, { jugadores:R.jugadores, equipo:"MEX" });
  igual(ord(r.eventos), "Jiménez:SOnT | Williams:SAV");
});
prueba("C4 · centro y remate: 'Centro de Gallardo y Jiménez cabecea' → Jiménez; sin portero nombrado no hay atajada", () => {
  const r = cl("Tiro a puerta", "Centro de Jesús Gallardo desde la izquierda y Raúl Jiménez cabecea al centro del arco.", "MEX");
  igual(ord(r.eventos), "Jiménez:SOnT");
});
prueba("C5 · dos atacantes sin verbo ni pase: el tiro no se asigna y queda como duda", () => {
  const r = cl("Tiro desviado", "Julián Quiñones y Roberto Alvarado combinan por la derecha y el balón se va por un lado.", "MEX");
  igual(r.eventos.length, 0); cierto(r.dudas.length === 1);
});
prueba("C6 · sacada sobre la línea: tiro a puerta sin atajada del portero", () => {
  const r = cl("Tiro a puerta", "Raúl Jiménez remata y Ime Okon la saca sobre la línea ante Ronwen Williams.", "MEX");
  igual(ord(r.eventos), "Jiménez:SOnT");
});
console.log("\n== Errores, ocasiones y penales (forma estándar)");
prueba("E1 · 'error de X' en un tiro → error que genera ocasión", () => {
  const r = cl("Tiro desviado", "Error de Ime Okon en la salida y Raúl Jiménez remata desviado.", "MEX");
  igual(ord(r.extras), "Okon:error_ocasion"); igual(ord(r.eventos), "Jiménez:SOffT");
});
prueba("E2 · 'X pierde el balón' en un gol del rival → error que genera gol; si su equipo es el que anota, no se asigna", () => {
  const g = { tipo:"goal", informe:[{ tipo:"goal", jugador:"Jiménez", equipo:"MEX" }] };
  igual(ord(cl("Gol de Raúl Jiménez", "Ime Okon pierde el balón en la salida y Raúl Jiménez define.", "MEX", g).extras), "Okon:error_gol");
  const r = cl("Gol de Raúl Jiménez", "Johan Vásquez pierde el balón, lo recupera México y Raúl Jiménez define.", "MEX", g);
  igual(r.extras.length, 0); cierto(r.dudas.length === 1);
});
prueba("E3 · 'presiona a X … le roba el balón' (Sithole 9') y 'X entrega el balón a <rival>' (Williams 46')", () => {
  const a = R.bloques.find(b => b.minuto === "9'"), b = R.bloques.find(b => b.minuto === "46'");
  igual(ord(V2.clasificarSuceso({ titulo:a.titulo, descripcion:a.descripcion, tipo:a.tipo, informe:a.informe }, { jugadores:R.jugadores, equipo:"MEX" }).extras), "Sithole:error_gol");
  igual(ord(V2.clasificarSuceso({ titulo:b.titulo, descripcion:b.descripcion, tipo:"texto", informe:[] }, { jugadores:R.jugadores, equipo:"MEX" }).extras), "Williams:error_ocasion");
});
prueba("E4 · redacción no estándar (Rangel 23'): no se asigna ningún error", () => {
  const x = R.bloques.find(b => b.minuto === "23'" && b.titulo === "Ocasión");
  const r = V2.clasificarSuceso({ titulo:x.titulo, descripcion:x.descripcion, tipo:"texto", informe:[] }, { jugadores:R.jugadores, equipo:"RSA" });
  igual(r.extras.length, 0);
});
prueba("E5 · ocasión clara fallada: con 'X falla' se asigna; 'Ocasión fallada' sin verbo pegado al nombre queda como duda", () => {
  igual(ord(cl("Ocasión fallada", "Raúl Jiménez falla solo frente al portero.", "MEX").extras), "Jiménez:ocasion_fallada");
  const r = cl("Ocasión fallada", "México desperdicia una contra con Roberto Alvarado y Julián Quiñones.", "MEX");
  igual(r.extras.length, 0); cierto(r.dudas.length === 1);
  igual(cl("Ocasión", "Julián Quiñones manda el centro al segundo palo, pero Roberto Alvarado no alcanza a conectar.", "MEX").extras.length, 0);
});
prueba("E6 · penal fallado: sin PFa en el informe queda como duda; con PFa el clasificador no lo duplica", () => {
  const sin = cl("Penal fallado", "Raúl Jiménez manda el penal por encima.", "MEX", { tipo:"penmiss" });
  igual(sin.extras.length, 0); cierto(sin.dudas.length === 1);
  const con = cl("Penal fallado", "Raúl Jiménez manda el penal por encima.", "MEX", { tipo:"penmiss", informe:[{ tipo:"penmiss", jugador:"Jiménez", equipo:"MEX" }] });
  igual(con.extras.length, 0); igual(con.dudas.length, 0);
});
prueba("E7 · evento narrado después de la salida: cuenta en su salida y se anota", () => {
  const M = V2.preparar(mini([base("X","A",{ sale:60 }), base("Y","B")], { eventos:[{ min:75, orden:1, jugador:"X", cat:"FC" }] }));
  igual(M.J.X.ev[0].min, 60); cierto(M.bitacora.some(b => /después de su salida/.test(b.texto)));
  cerca(V2.evaluar(M, "X", 60).S, -0.1, 1e-12);
});

prueba("V5 · perfil sin Opta: solo se usa en el nivel «relato»; con Opta o solo PTS manda v0 (sin cambios)", () => {
  const res = [];
  ["mex-rsa-2026.js", "mex-por-2026.js", "bra-nor-2026.js"].forEach(f => {
    const DX = require(path.join(__dirname, "datos", f));
    const conOpta = V2.preparar(clon(DX)), conOptaSinPerfil = V2.preparar(clon(DX), { PERFIL_SIN_OPTA:null });
    Object.values(conOpta.J).forEach(j => { if(j.nivelDatos !== "relato") cerca(j.motorFinal, conOptaSinPerfil.J[j.key].motorFinal, 1e-12, f + " " + j.key); });
    const sin = clon(DX); sin.jugadores.forEach(p => { p.opta = null; delete p.optaPts; });
    const Mp = V2.preparar(sin), M0 = V2.preparar(clon(sin), { PERFIL_SIN_OPTA:null });
    const mae = M => { const L = Object.values(M.J).filter(j => typeof j.real === "number"); return L.reduce((a, j) => a + Math.abs(j.motorFinal - j.real), 0) / L.length; };
    cierto(mae(Mp) < mae(M0), `${f}: perfil ${mae(Mp)} vs v0 ${mae(M0)}`);
    res.push(`${f.slice(0, 7)} ${mae(M0).toFixed(2)}→${mae(Mp).toFixed(2)}`);
  });
  return "sin Opta, v0 → perfil (ajuste con los tres): " + res.join(" · ");
});

console.log("\n== Validación fuera de la muestra (coeficientes v0 sin tocar)");
prueba("V1 · México–Portugal: opta_points = PTS de Opta en los 38 (tabla en puntos convertida a conteos)", () => {
  const DP = require(path.join(__dirname, "datos", "mex-por-2026.js"));
  const M = V2.preparar(JSON.parse(JSON.stringify(DP)));
  let n = 0; DP.jugadores.forEach(p => { if(!p.opta) return; n++; cerca(M.J[p.key].optaPoints, p.opta_pts, 1e-9, p.key); });
  igual(n, 38); return `${n}/38`;
});
prueba("V2 · México–Portugal: MAE de nota_motor sin calibrar ≤ 0.35 (partido que el ajuste no vio)", () => {
  const DP = require(path.join(__dirname, "datos", "mex-por-2026.js"));
  const M = V2.preparar(JSON.parse(JSON.stringify(DP)));
  const e = V2.errores(M, true);
  igual(e.n, 37, "37 con nota numérica (Trincão es SC)");
  cierto(e.mae <= 0.35, `MAE ${e.mae}`);
  const opta = DP.jugadores.filter(p => typeof p.real === "number" && p.opta).reduce((a, p) => a + Math.abs(p.opta_pts - p.real), 0) / 37;
  igual(V2.evaluar(M, "Francisco Trincão", 90).mostrar, "SC");
  return `v2 ${e.mae.toFixed(3)} · Opta Points tal cual ${opta.toFixed(3)} · Trincão (SC) se muestra SC`;
});

prueba("V3 · Brasil–Noruega: MAE de nota_motor sin calibrar ≤ 0.35 (segundo partido fuera de la muestra)", () => {
  const DB_ = require(path.join(__dirname, "datos", "bra-nor-2026.js"));
  const M = V2.preparar(JSON.parse(JSON.stringify(DB_)));
  DB_.jugadores.forEach(p => { if(p.opta) cerca(M.J[p.key].optaPoints, p.opta_pts, 1e-9, p.key); });
  const e = V2.errores(M, true);
  cierto(e.mae <= 0.35, `MAE ${e.mae}`);
  return `v2 ${e.mae.toFixed(3)} · n ${e.n}`;
});
prueba("V4 · solo PTS de Opta (sin columnas): mismo resultado que la tabla completa en los tres partidos", () => {
  const res = [];
  ["mex-rsa-2026.js", "mex-por-2026.js", "bra-nor-2026.js"].forEach(f => {
    const DX = require(path.join(__dirname, "datos", f));
    const full = V2.preparar(JSON.parse(JSON.stringify(DX)));
    const pts = JSON.parse(JSON.stringify(DX));
    pts.jugadores.forEach(p => { if(p.opta){ p.optaPts = V2.optaPoints(p.opta, p.grupo || V2.grupoDePosicion(p.pos)); delete p.opta; } });
    const M = V2.preparar(pts);
    Object.values(M.J).forEach(j => { const a = V2.evaluar(full, j.key, Math.max(full.T, j.sale)), b = V2.evaluar(M, j.key, Math.max(M.T, j.sale)); cerca(b.nota_motor, a.nota_motor, 1e-9, f + " " + j.key); });
    res.push(V2.errores(M, true).mae.toFixed(3));
  });
  return res.join(" · ");
});

console.log(`\n${ok} pruebas pasaron, ${mal} fallaron.` + (mal ? "\nFallaron: " + fallas.join(" · ") : ""));
if(mal) process.exit(1);
