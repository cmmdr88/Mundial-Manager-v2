#!/usr/bin/env python3
"""
Calificaciones de jugadores — calibración reproducible con México vs. Sudáfrica (Mundial 2026, inauguración).

Uso:  python3 calificaciones_mex_rsa.py
Requiere: numpy. Sin azar: la salida es idéntica en cada corrida.

Tres métricas separadas:
  opta_points    fórmula oficial de Opta Points (pesos publicados, base 5.5, límites 3–10). Nunca se calibra.
  nota_motor     cálculo propio: escala la suma de puntos de acción y agrega contexto y eventos del relato.
  nota_mostrada  solo Modo A: nota_motor corregida hacia la nota real (FotMob); al final es exactamente la real.
Los errores se miden SIEMPRE sobre nota_motor al final, antes de calibrar.
"""
import numpy as np

# ----------------------------------------------------------------------------------------------
# 1. Datos (tal como los compartió Jonathan)
# ----------------------------------------------------------------------------------------------
CAT = "G SOnT SOffT BS OG A P C Tk INT FW FC O YC RC GC PW SAV PSAV".split()
# nombre equipo grupo entra sale fotmob opta_pts | 19 estadísticas de Opta en el orden de CAT
RAW = """\
Quiñones MEX FW 0 79 8.8 8.68 | 1 2 2 1 0 0 33 1 0 0 2 1 0 0 0 0 0 0 0
Jiménez MEX FW 0 76 8.0 8.08 | 1 2 1 1 0 0 19 0 1 0 0 1 1 0 0 0 0 0 0
Alvarado MEX FW 0 90 8.2 7.88 | 0 0 0 0 0 1 35 4 5 0 2 2 0 0 0 0 0 0 0
Lira MEX MF 0 76 7.9 7.80 | 0 0 0 0 0 1 45 0 2 1 2 0 0 0 0 0 0 0 0
Vásquez MEX DF 0 90 7.2 7.52 | 0 0 0 0 0 0 81 0 1 1 0 0 0 0 0 0 0 0 0
Gallardo MEX DF 0 90 7.2 7.30 | 0 0 1 1 0 0 45 0 0 3 0 1 0 0 0 0 0 0 0
Mbokazi RSA DF 0 90 6.1 7.14 | 0 1 0 0 0 0 30 2 2 1 3 1 0 0 0 2 0 0 0
Rangel MEX GK 0 90 7.5 7.10 | 0 0 0 0 0 0 30 0 0 0 0 0 0 0 0 0 0 2 0
Mudau RSA DF 0 90 6.5 7.00 | 0 0 0 0 0 0 29 1 4 1 3 2 0 0 0 2 0 0 0
Reyes MEX DF 0 90 7.4 6.78 | 0 0 1 0 0 0 42 2 0 1 0 0 0 0 0 0 0 0 0
Okon RSA DF 0 90 6.0 6.68 | 0 0 0 0 0 0 49 0 2 0 0 0 0 0 0 2 0 0 0
Modiba RSA DF 0 77 5.9 6.54 | 0 1 0 0 0 0 15 2 3 0 2 2 1 0 0 2 0 0 0
Gutiérrez MEX MF 0 66 6.7 6.50 | 0 0 2 2 0 0 23 2 0 0 1 2 0 1 0 0 0 0 0
Mokoena RSA MF 0 90 6.5 6.48 | 0 0 0 0 0 0 42 2 0 2 2 1 0 1 0 2 0 0 0
Montes MEX DF 0 89 6.1 6.42 | 0 0 0 0 0 0 65 1 0 1 1 2 0 0 1 0 0 0 0
Chávez MEX MF 66 90 6.5 6.38 | 0 0 0 0 0 0 28 1 2 0 0 1 0 0 0 0 0 0 0
Fidalgo MEX MF 0 66 7.2 6.38 | 0 0 0 0 0 0 34 0 0 0 2 0 0 0 0 0 0 0 0
Williams RSA GK 0 90 6.2 6.30 | 0 0 0 0 0 0 40 0 0 1 0 0 0 0 0 2 0 2 0
Sibisi RSA DF 0 90 5.8 6.20 | 0 0 0 0 0 0 50 0 0 1 0 1 0 1 0 2 0 0 0
Álvarez MEX MF 76 90 6.6 6.10 | 0 0 0 0 0 0 15 0 1 0 1 0 0 0 0 0 0 0 0
Mbatha RSA MF 56 90 6.2 5.94 | 0 0 0 0 0 0 7 0 2 0 0 0 0 0 0 1 0 0 0
Mora MEX MF 66 90 6.3 5.88 | 0 0 0 0 0 0 14 0 0 1 0 1 0 0 0 0 0 0 0
Appollis RSA FW 77 90 6.3 5.82 | 0 0 0 0 0 0 6 0 1 0 0 0 0 0 0 0 0 0 0
Foster RSA FW 0 56 5.6 5.80 | 0 0 1 0 0 0 5 0 0 0 1 0 0 0 0 1 0 0 0
Adams RSA MF 0 61 6.2 5.80 | 0 0 0 0 0 0 20 0 0 0 0 0 0 0 0 1 0 0 0
Vega MEX FW 79 90 6.0 5.72 | 0 0 0 0 0 0 10 1 0 0 0 0 0 0 0 0 0 0 0
Makgopa RSA FW 76 90 6.3 5.60 | 0 0 0 0 0 0 5 0 0 0 0 0 0 0 0 0 0 0 0
Rayners RSA FW 0 76 5.5 5.52 | 0 0 0 0 0 0 10 1 0 0 0 0 0 0 0 2 0 0 0
González MEX FW 76 90 5.9 5.42 | 0 0 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0
Sithole RSA MF 0 49 3.5 5.18 | 0 0 0 0 0 0 19 0 0 1 0 3 0 0 1 1 0 0 0
Zwane RSA MF 61 84 4.9 - | -"""
# Minutos nominales: el tiempo añadido cuenta como 45 o 90 (como el MP de Opta). Montes sale al 89 según Opta (roja 90+2).
P = {}
for line in RAW.splitlines():
    head, stats = line.split("|")
    n, team, grp, a, b, fm, op = head.split()
    P[n] = dict(team=team, grp=grp, start=int(a), end=int(b), fm=float(fm),
                opta=None if op == "-" else float(op),
                st=None if stats.strip() == "-" else dict(zip(CAT, map(float, stats.split()))))
D = 90  # duración nominal del partido (120 con tiempo extra)

# Relato traducido a categorías de Opta (lectura manual; en el juego lo haría el clasificador).
# (minuto nominal, orden, jugador, categoría, cantidad)
RELATO = [
    (5, 1, "Jiménez", "SOnT", 1), (5, 2, "Williams", "SAV", 1),
    (9, 1, "Lira", "Tk", 1), (9, 2, "Lira", "A", 1), (9, 3, "Quiñones", "G", 1), (9, 4, "Quiñones", "SOnT", 1),
    (17, 1, "Mokoena", "FC", 1), (17, 2, "Mokoena", "YC", 1), (17, 3, "Fidalgo", "FW", 1),
    (20, 1, "Quiñones", "SOffT", 1),
    (23, 2, "Gutiérrez", "FC", 1), (23, 3, "Gutiérrez", "YC", 1), (23, 4, "Mokoena", "FW", 1),
    (30, 1, "Gutiérrez", "BS", 1),
    (38, 1, "Foster", "SOffT", 1),
    (42, 1, "Jiménez", "SOnT", 1), (42, 2, "Williams", "SAV", 1),
    (43, 1, "Quiñones", "SOffT", 1),            # remate al poste: Opta lo cuenta como tiro desviado
    (45, 1, "Mbokazi", "SOnT", 1), (45, 2, "Rangel", "SAV", 1),
    (45, 3, "Gutiérrez", "SOffT", 1),           # 45+4'
    (46, 1, "Gutiérrez", "SOffT", 1),
    (49, 1, "Sithole", "FC", 1), (49, 2, "Sithole", "RC", 1), (49, 3, "Gutiérrez", "FW", 1),
    (56, 1, "Modiba", "SOnT", 1), (56, 2, "Rangel", "SAV", 1),
    (67, 1, "Alvarado", "A", 1), (67, 2, "Jiménez", "G", 1), (67, 3, "Jiménez", "SOnT", 1),
    (74, 1, "Sibisi", "FC", 1), (74, 2, "Sibisi", "YC", 1), (74, 3, "Quiñones", "FW", 1),
    (81, 1, "Appollis", "SOnT", 1), (81, 2, "Rangel", "SAV", 1),
    (84, 1, "Zwane", "RC", 1),
    (90, 1, "Montes", "FC", 1), (90, 2, "Montes", "RC", 1), (90, 3, "Mudau", "FW", 1),   # 90+2'
]
GOLES = [(9, "MEX"), (67, "MEX")]
# Eventos del relato que Opta no cuenta (segunda capa). Valores provisionales, NO ajustados.
X_VAL = {"error_gol": -0.80, "error_ocasion": -0.15, "ocasion_fallada": -0.25, "penal_fallado": -0.60}
EXTRAS = [(9, "Sithole", "error_gol"), (23, "Rangel", "error_ocasion"),
          (23, "Rayners", "ocasion_fallada"), (46, "Williams", "error_ocasion")]

# ----------------------------------------------------------------------------------------------
# 2. Opta Points oficial (pesos publicados; no se tocan)
# ----------------------------------------------------------------------------------------------
W_OPTA = dict(G=1, SOnT=.4, SOffT=.2, BS=.2, OG=-.5, A=.6, P=.02, C=.02, Tk=.2, INT=.2, FW=.1, FC=-.1,
              O=-.1, YC=-.2, RC=-.5, PW=.4)
W_GK = dict(GC=-.6, SAV=.5, PSAV=.5)
W_FIELD = dict(GC=-.1, SAV=0, PSAV=0)
clamp = lambda x, lo=3.0, hi=10.0: max(lo, min(hi, x))

def suma_puntos(cnt, gk, w=W_OPTA):
    """S = suma de puntos de acción (sin la base 5.5, sin límites)."""
    extra = W_GK if gk else W_FIELD
    return sum(w[k] * cnt.get(k, 0) for k in w) + sum(extra[k] * cnt.get(k, 0) for k in extra)

def opta_points(cnt, gk):
    return clamp(5.5 + suma_puntos(cnt, gk))

CON_DATOS = [n for n in P if P[n]["st"]]          # 30 jugadores con nota FotMob y estadísticas Opta

# ----------------------------------------------------------------------------------------------
# 3. nota_motor al final (forma del ajuste)
#    motor_raw = c0 + k*S + cr*r + croja*RC + cgc*GC*[DF] + X ;  nota_motor = clamp(motor_raw)
#    r = s_final * minutos/D  (s = +1 gana, 0 empata, -1 pierde)
# ----------------------------------------------------------------------------------------------
def rasgos(n, pase_df=0.02):
    p = P[n]; s = p["st"]; gk = p["grp"] == "GK"
    m = p["end"] - p["start"]
    sgn = 1 if p["team"] == "MEX" else -1          # resultado final 2-0
    S = suma_puntos(s, gk)
    if p["grp"] == "DF": S += (pase_df - 0.02) * s["P"]     # hipótesis H2; por defecto no cambia nada
    return dict(S=S, r=sgn * m / D, RC=s["RC"], GCDF=s["GC"] if p["grp"] == "DF" else 0)

def X_total(n):
    return sum(X_VAL[t] for _, j, t in EXTRAS if j == n)

def ajustar(cols, nombres, con_extras, lam, pase_df=0.02):
    """Mínimos cuadrados con penalización ridge (lam) en todo menos la constante. Devuelve parámetros,
    MAE dentro de la muestra y MAE dejando fuera a cada jugador."""
    F = [rasgos(n, pase_df) for n in nombres]
    Xm = np.array([[f[c] for c in cols] for f in F])
    xe = np.array([X_total(n) if con_extras else 0.0 for n in nombres])
    y = np.array([P[n]["fm"] for n in nombres]) - xe
    A = np.c_[np.ones(len(Xm)), Xm]
    R = np.eye(A.shape[1]) * lam; R[0, 0] = 0
    sol = lambda Aa, yy: np.linalg.solve(Aa.T @ Aa + R, Aa.T @ yy)
    w_ = sol(A, y)
    pred = np.clip(A @ w_ + xe, 3, 10)
    fm = np.array([P[n]["fm"] for n in nombres])
    loo = []
    for i in range(len(nombres)):
        m = np.ones(len(nombres), bool); m[i] = False
        wi = sol(A[m], y[m]); loo.append(abs(clamp(A[i] @ wi + xe[i]) - fm[i]))
    return w_, float(np.mean(np.abs(pred - fm))), float(np.mean(loo)), dict(zip(nombres, pred))

# ----------------------------------------------------------------------------------------------
# 4. Trayectoria en vivo (Modo A con estadísticas finales)
# ----------------------------------------------------------------------------------------------
def marcador(team, t):
    a = sum(1 for g, tm in GOLES if g <= t and tm == team)
    b = sum(1 for g, tm in GOLES if g <= t and tm != team)
    return (a > b) - (a < b)

def eventos_narrados(n):
    p = P[n]; ev = [(m, o, c, q) for m, o, j, c, q in RELATO if j == n]
    for g, tm in GOLES:                              # goles recibidos mientras está en la cancha
        if tm != p["team"] and p["start"] <= g < p["end"]:
            ev.append((g, 9, "GC", 1))
    return sorted(ev)

CRITICAS = {"G", "A", "OG", "YC", "RC", "PW", "PSAV", "GC"}

def preparar(n, bitacora):
    """Reparte las estadísticas finales.
    · Críticos (gol, asistencia, autogol, tarjetas, penal ganado/atajado, gol recibido): nunca se reducen;
      conservan actor y minuto. Si Opta trae más, los que faltan entran al final de su participación; si trae
      menos, se respeta el relato/informe. Todo se anota.
    · El tiro al arco de un gol va con el gol (no se reparte).
    · Repetibles: si el relato narra más que Opta, cada narrado vale Opta ÷ narrados; si narra menos, el resto
      se interpola parejo en sus minutos. Nada se descarta en silencio."""
    p = P[n]; ev = eventos_narrados(n)
    if ev and ev[-1][0] > p["end"]:
        bitacora.append(f"{n}: sale al {p['end']}' según Opta, pero el relato le narra un evento al {ev[-1][0]}' "
                        f"→ ese evento cuenta igual, en su salida")
    minutos_gol = {m for m, _, c, _ in ev if c == "G"}
    # marca el tiro al arco que acompaña a cada gol
    ev2 = []
    usados = set()
    for m, o, c, q in ev:
        dc = c == "SOnT" and m in minutos_gol and m not in usados
        if dc: usados.add(m)
        ev2.append((m, o, c, q, dc))
    narr, dentro = {}, {}
    for _, _, c, q, dc in ev2:
        (dentro if dc else narr)[c] = (dentro if dc else narr).get(c, 0) + q
    peso, resto, extra_final = {}, {}, []
    for c in set(CAT) | set(narr):
        tot = p["st"].get(c, 0) if p["st"] else narr.get(c, 0) + dentro.get(c, 0)
        k = narr.get(c, 0)
        if c in CRITICAS:
            peso[c] = 1.0; resto[c] = 0.0
            if p["st"] and tot > k:
                extra_final += [c] * int(tot - k)
                bitacora.append(f"{n}: {c} Opta {tot:g}, narrados {k:g} → {tot-k:g} sin minuto, al final de su participación")
            elif p["st"] and k > tot:
                bitacora.append(f"{n}: {c} narrados {k:g}, Opta {tot:g} → se respeta el relato/informe (crítico)")
            continue
        pool = tot - dentro.get(c, 0)
        if k > pool:
            peso[c] = pool / k; resto[c] = 0.0
            bitacora.append(f"{n}: {c} narrados {k:g}, estadísticas {pool:g}{' (sin el tiro del gol)' if dentro.get(c) else ''} → cada narrado vale {pool/k:.3f}")
        else:
            peso[c] = 1.0; resto[c] = pool - k
    # eventos con su peso (el tiro del gol siempre 1) + críticos sin minuto al final
    evp = [(m, o, c, q * (1.0 if dc else peso.get(c, 1.0))) for m, o, c, q, dc in ev2]
    evp += [(p["end"], 10**6, c, 1.0) for c in extra_final]
    return evp, resto

DERIVA_MAX = 0.04   # deriva artificial máxima por minuto en Modo A (si |Δ|/M lo permite)

def trayectoria(n, prm, minutos, bitacora, modoA=True, gamma=1.5):
    c0, k, cr, croja, cgc = prm
    p = P[n]; gk = p["grp"] == "GK"; M = p["end"] - p["start"]
    ev, resto = preparar(n, bitacora)
    def motor(t):
        m = max(0, min(t, p["end"]) - p["start"]); fr = m / M
        cnt = {c: resto[c] * fr for c in resto}
        for mt, _, c, q in ev:
            if min(mt, p["end"]) <= t: cnt[c] = cnt.get(c, 0) + q
        S = suma_puntos(cnt, gk)
        r = marcador(p["team"], t) * m / D
        x = sum(X_VAL[ty] for mt, j, ty in EXTRAS if j == n and min(mt, p["end"]) <= t)
        raw = c0 + k * S + cr * r + croja * cnt.get("RC", 0) + cgc * cnt.get("GC", 0) * (p["grp"] == "DF") + x
        return clamp(raw), S, cnt
    mT, ST, cntT = motor(p["end"])
    delta = p["fm"] - mT
    if abs(delta) > 1e-12:   # forma de la corrección: γ_j = clamp(DERIVA_MAX·M/|Δ|, 1, γ)
        gamma = max(1.0, min(gamma, DERIVA_MAX * M / abs(delta)))
    filas = []
    for t, lab in minutos:
        mo, S, _ = motor(t)
        m = max(0, min(t, p["end"]) - p["start"])
        if modoA:
            phi = (m / M) ** gamma
            mostrada = p["fm"] if m >= M else clamp(mo + phi * (p["fm"] - mT))
        else:
            phi, mostrada = 0.0, mo
        filas.append((t, lab, 5.5 + S, float(mo), phi, float(mostrada)))
    return mT, ST, cntT, filas

def redondear(x):           # mitad hacia arriba, sin errores de coma flotante
    return np.floor(x * 10 + 0.5 + 1e-9) / 10

# ----------------------------------------------------------------------------------------------
# 5. Versión descartada (pesos inventados, base 6.0) — solo para reproducir las cifras 0.58 y 0.26/0.35
# ----------------------------------------------------------------------------------------------
def legado():
    Dl = dict(gol=1.0, asistencia=0.6, pase_clave=0.12, tiro_puerta=0.10, poste=0.08, tiro_fuera=0, ocasion_fallada=-0.25,
              entrada=0.06, atajada=0.15, atajada_dificil=0.45, error_ocasion=-0.3, error_gol=-0.8, falta=-0.05,
              falta_recibida=0.03, amarilla=-0.3)
    EV = [(5,'Jiménez','tiro_puerta'),(5,'Williams','atajada_dificil'),(9,'Lira','entrada'),(9,'Lira','asistencia'),
          (9,'Sithole','error_gol'),(9,'Quiñones','gol'),(9,'RSA','gol_recibido'),(17,'Mokoena','amarilla'),(17,'Mokoena','falta'),
          (17,'Fidalgo','falta_recibida'),(20,'Quiñones','tiro_fuera'),(23,'Rangel','error_ocasion'),(23,'Rayners','ocasion_fallada'),
          (23,'Gutiérrez','amarilla'),(23,'Gutiérrez','falta'),(23,'Mokoena','falta_recibida'),(30,'Quiñones','pase_clave'),
          (30,'Gutiérrez','tiro_fuera'),(38,'Foster','tiro_fuera'),(42,'Jiménez','tiro_puerta'),(42,'Williams','atajada_dificil'),
          (43,'Quiñones','poste'),(45,'Mbokazi','tiro_puerta'),(45,'Rangel','atajada'),(47,'Quiñones','pase_clave'),
          (47,'Gutiérrez','tiro_fuera'),(46,'Williams','error_ocasion'),(46,'Gutiérrez','tiro_fuera'),(49,'Sithole','roja'),
          (49,'Gutiérrez','falta_recibida'),(56,'Modiba','tiro_puerta'),(56,'Rangel','atajada'),(67,'Alvarado','asistencia'),
          (67,'Jiménez','gol'),(67,'RSA','gol_recibido'),(74,'Sibisi','amarilla'),(74,'Sibisi','falta'),(74,'Quiñones','falta_recibida'),
          (81,'Appollis','tiro_puerta'),(81,'Rangel','atajada'),(84,'Zwane','roja'),(92,'Montes','roja'),(92,'Mudau','falta_recibida')]
    OF = {'DF':1.15,'MF':1.0,'FW':0.9,'GK':1.0}; DEF = {'DF':1.0,'MF':1.1,'FW':1.25,'GK':1.0}; GC = {'GK':-.3,'DF':-.1,'MF':-.03,'FW':0}
    nota = {n: 6.0 for n in P}; cnt = {}
    for m, who, t in EV:
        if t == 'gol_recibido':
            for n, p in P.items():
                if p['team'] == who and p['start'] <= m < p['end']: nota[n] += GC[p['grp']]
            continue
        p = P[who]
        if t == 'roja': d = -1.2 - 0.5 * max(0, (90 - m) / 90)
        else:
            d = Dl[t]
            if t in ('gol','asistencia','pase_clave','tiro_puerta','poste'): d *= OF[p['grp']]
            if t == 'entrada': d *= DEF[p['grp']]
            kk = cnt.get((who, t), 0); cnt[(who, t)] = kk + 1; d *= 0.9 ** kk
        nota[who] += d
    for n, p in P.items():
        mins = p['end'] - p['start']
        nota[n] += (0.15 if p['team'] == 'MEX' else -0.15) * mins / 90
        if p['team'] == 'MEX' and mins >= 60:
            nota[n] += 0.5 if p['grp'] == 'GK' else 0.3 if p['grp'] == 'DF' else 0
        nota[n] = clamp(nota[n])
    mae_31 = np.mean([abs(nota[n] - P[n]['fm']) for n in P])
    # capa de fondo con pesos propios sobre el residuo (7 parámetros, ridge 2)
    feats = ('P','C','Tk','INT','FW','FC')
    Xm = np.array([[P[n]['st'][f] / 30 if f == 'P' else P[n]['st'][f] for f in feats] for n in CON_DATOS])
    y = np.array([P[n]['fm'] - nota[n] for n in CON_DATOS]); A = np.c_[np.ones(len(Xm)), Xm]
    R = np.eye(A.shape[1]) * 2.0; R[0, 0] = 0; sol = lambda Aa, yy: np.linalg.solve(Aa.T @ Aa + R, Aa.T @ yy)
    w_ = sol(A, y); ins = np.mean(np.abs(y - A @ w_)); loo = []
    for i in range(len(y)):
        m = np.ones(len(y), bool); m[i] = False; loo.append(abs(y[i] - A[i] @ sol(A[m], y[m])))
    return mae_31, ins, float(np.mean(loo))

# ----------------------------------------------------------------------------------------------
# 6. Salida
# ----------------------------------------------------------------------------------------------
if __name__ == "__main__":
    print("== 1. Opta Points oficial contra la columna PTS que compartiste")
    malos = [n for n in CON_DATOS if abs(opta_points(P[n]["st"], P[n]["grp"] == "GK") - P[n]["opta"]) > 0.005]
    print(f"   jugadores comparados: {len(CON_DATOS)}   no coinciden: {len(malos)}")

    print("\n== 2. Tabla de errores (MAE contra FotMob, nota_motor al final SIN calibrar, N = 30)")
    fm = np.array([P[n]["fm"] for n in CON_DATOS])
    op = np.array([P[n]["opta"] for n in CON_DATOS])
    print(f"   E0  opta_points tal cual                      params 0  MAE {np.mean(np.abs(op-fm)):.3f}  sesgo {np.mean(op-fm):+.3f}")
    l58, l26, l35 = legado()
    print(f"   L1  versión descartada, solo relato (N=31)      params 0  MAE {l58:.3f}")
    print(f"   L2  versión descartada + fondo propio           params 7  MAE {l26:.3f}  LOO-jugador {l35:.3f}")
    modelos = [("E1", ["S"], False), ("E2", ["S", "r"], False), ("E3", ["S", "r", "RC"], False),
               ("E4", ["S", "r", "RC", "GCDF"], False), ("E5", ["S", "r", "RC", "GCDF"], True)]
    res = {}
    for lam in (1.0, 0.0):
        print(f"   -- ridge lambda = {lam}")
        for idm, cols, ex in modelos:
            w_, ins, loo, pred = ajustar(cols, CON_DATOS, ex, lam)
            res[(idm, lam)] = (w_, ins, loo, pred)
            print(f"   {idm}  {'+'.join(cols)}{' + extras' if ex else ''}  params {len(cols)+1}  MAE {ins:.3f}  LOO-jugador {loo:.3f}  "
                  f"params={np.round(w_, 3).tolist()}")
    # Hipótesis: pase de defensa a 0.015 (NO adoptada; solo se mide)
    w_h, ins_h, loo_h, _ = ajustar(["S", "r", "RC", "GCDF"], CON_DATOS, True, 1.0, pase_df=0.015)
    print(f"   H2  E5 con pase de defensa 0.015 (hipótesis)  params 5  MAE {ins_h:.3f}  LOO-jugador {loo_h:.3f}")

    w5, ins5, loo5, pred5 = res[("E5", 1.0)]
    print("\n== 3. Notas por jugador (E5, lambda 1): FotMob | opta_points | nota_motor final sin calibrar")
    for n in sorted(CON_DATOS, key=lambda n: (P[n]["team"] != "MEX", -P[n]["fm"])):
        print(f"   {n:10} {P[n]['team']} {P[n]['grp']}  {P[n]['fm']:.1f} | {P[n]['opta']:.2f} | {pred5[n]:.2f} ({redondear(pred5[n]):.1f})")
    print(f"   MAE con nota redondeada a un decimal: {np.mean([abs(redondear(pred5[n]) - P[n]['fm']) for n in CON_DATOS]):.3f}")

    print("\n== 4. Ejemplo Modo A: Raúl Jiménez (FotMob 8.0), parámetros E5")
    bit = []
    mT, ST, cntT, filas = trayectoria("Jiménez", w5, [(0, "Entra"), (5, "Tiro al arco (atajado)"), (9, "1-0"),
        (42, "Tiro al arco (atajado)"), (45, "Medio tiempo"), (67, "Gol"), (76, "Sale")], bit)
    print(f"   nota_motor final {mT:.4f}   S final {ST:.4f}   opta_points final {clamp(5.5+ST):.2f}")
    for f in filas: print(f"   {f[0]:3}'  {f[1]:28} opta {f[2]:.3f}  motor {f[3]:.3f}  φ {f[4]:.3f}  mostrada {f[5]:.3f}  se ve {redondear(f[5]):.1f}")
    print("   comprobaciones: opta_points final == PTS", abs(clamp(5.5 + ST) - P["Jiménez"]["opta"]) < 1e-9,
          "| nota_mostrada final == FotMob", filas[-1][-1] == P["Jiménez"]["fm"])

    print("\n== 5. Bitácora de discrepancias relato vs. estadísticas (todos los jugadores)")
    bit = []
    for n in CON_DATOS: preparar(n, bit)
    for b in bit: print("  ", b)

    print("\n== 6. Límites 3–10 en todas las trayectorias de Modo A (minuto a minuto)")
    peor = (10, -10)
    for n in CON_DATOS:
        _, _, _, fl = trayectoria(n, w5, [(t, "") for t in range(0, 91)], [])
        for f in fl: peor = (min(peor[0], f[3], f[5]), max(peor[1], f[3], f[5]))
        assert fl[-1][-1] == P[n]["fm"], n
    cons = all(abs(clamp(5.5 + trayectoria(n, w5, [(90, "")], [])[1]) - P[n]["opta"]) < 1e-9 for n in CON_DATOS)
    print(f"   conservación (conteos usados al final == estadísticas, vía opta_points final == PTS): {cons}")
    print(f"   mínimo {peor[0]:.3f}  máximo {peor[1]:.3f}   nota_mostrada final == FotMob en los 30: True")

    print("\n== 7. Ejemplo Modo B: mediocampista simulado, 90', gana 1-0 (eventos generados, todos con minuto)")
    c0, k, cr, croja, cgc = w5
    gen = [(12, "P", 14), (20, "Tk", 1), (31, "INT", 1), (38, "FC", 1), (45, "P", 12), (55, "YC", 1),
           (63, "SOffT", 1), (70, "A", 1), (70, "P", 10), (88, "P", 12)]
    gol_equipo = 70
    for t in (0, 12, 20, 31, 38, 45, 55, 63, 70, 88, 90):
        cnt = {}
        for mt, c, q in gen:
            if mt <= t: cnt[c] = cnt.get(c, 0) + q
        S = suma_puntos(cnt, False); s = 1 if t >= gol_equipo else 0
        raw = c0 + k * S + cr * s * t / D
        print(f"   {t:3}'  S={S:+.3f}  opta_points={clamp(5.5+S):.2f}  nota_motor={clamp(raw):.3f} ({redondear(clamp(raw)):.1f})")
