/* =========================================================
   COPA MANAGER 2026 — nucleo/modelo-db.js
   Núcleo — modelo de datos: la variable global DB, su constructor por defecto
   (buildDefaultDB, que orquesta los buildDefault* de cada módulo) y el accesor
   de entidad por id (getTeam, sobre DB.teams/DB.clubsData; reasignado desde
   selecciones — decisión arquitectónica aprobada). Extracción mecánica: texto y
   orden idénticos al original. Script CLÁSICO (no module). Cargar DESPUÉS de
   core/utilidades.js (uid, colorsFor, _seedCounter) y de todos los módulos que
   aportan buildDefault* (constantes, confederaciones, estadios, modelo-kits,
   paises, clubes, evento…), y ANTES del <script> inline. buildDefaultDB usa, en
   tiempo de ejecución (init), SEED_TEAMS —que permanece en el inline, reservado a
   datos/semillas-equipos.js (paso 3)— y todos los buildDefault*. _seedCounter vive
   en utilidades (no se movió). Consumido por todos los módulos (leen/escriben DB)
   y por el núcleo (loadDB/import/migración/init asignan DB; router/acciones usan
   getTeam).
   ========================================================= */

function buildDefaultDB(){
  // La BASE DE DATOS POR DEFECTO (datos duros + toolkit visual + genéricas) vive en
  // datos/base-datos-seed.js (const BASE_DB_SEED). Las imágenes propias del usuario (logos de
  // selección/club, fotos de jugador, uniformes, colores y patrocinadores) NO están aquí: se
  // aplican encima importando el pack visual (applyVisualPack). Las banderas se sirven del folder
  // banderas/ por código ISO; las fotos/escudos genéricos, desde constantes.js y las carpetas del repo.
  const src = (typeof BASE_DB_SEED!=="undefined") ? BASE_DB_SEED
            : (typeof window!=="undefined" ? window.BASE_DB_SEED : null);
  if(!src) throw new Error("Falta datos/base-datos-seed.js (BASE_DB_SEED)");
  const db = (typeof structuredClone==="function")
    ? structuredClone(src)
    : JSON.parse(JSON.stringify(src));

  // Colores por defecto para selecciones/clubes que no traigan los suyos (los reales llegan en el
  // pack visual). Así la base es funcional aunque todavía no se haya importado el pack.
  const FALLBACK=["#1e293b","#e2e8f0"];
  (db.teams||[]).forEach(t=>{
    if(t.color1==null || t.color2==null){
      const cc = (typeof colorsFor==="function") ? colorsFor(t.commonName, t.conf) : FALLBACK;
      if(t.color1==null) t.color1=cc[0];
      if(t.color2==null) t.color2=cc[1];
    }
    if(t.color3==null) t.color3="#FFFFFF";
  });
  (db.clubsData||[]).forEach(c=>{
    if(c.color1==null || c.color2==null){
      const cc = (typeof colorsFor==="function") ? colorsFor(c.commonName, c.country) : FALLBACK;
      if(c.color1==null) c.color1=cc[0];
      if(c.color2==null) c.color2=cc[1];
    }
    if(c.color3==null) c.color3="#FFFFFF";
  });

  // Mantener el contador de ids por encima de los ids ya usados por el seed, para que los nuevos no choquen.
  if(typeof _seedCounter==="number" && typeof db.nextIdSeed==="number") _seedCounter = Math.max(_seedCounter, db.nextIdSeed);
  return db;
}

// Aplica un "pack visual" (visual-pack.json) sobre la base ACTUAL, fusionando por id: logos y uniformes
// de selecciones/clubes, colores, patrocinadores, fotos de jugador, y logos de medios/confederaciones/
// evento/FIFA. No toca los datos duros. Devuelve true si el pack era válido.
function applyVisualPack(pack){
  if(!pack || pack.__type!=="copa-manager-visual-pack") return false;
  const teams = (DB && DB.teams) || [];
  const tById={}, pById={};
  teams.forEach(t=>{ tById[t.id]=t; (t.players||[]).forEach(p=>{ pById[p.id]=p; }); });
  const cById={}; ((DB&&DB.clubsData)||[]).forEach(c=>{ cById[c.id]=c; });

  Object.keys(pack.teams||{}).forEach(id=>{ if(tById[id]) Object.assign(tById[id], pack.teams[id]); });
  Object.keys(pack.playerPhotos||{}).forEach(id=>{ if(pById[id]) pById[id].photo = pack.playerPhotos[id]; });
  Object.keys(pack.clubs||{}).forEach(id=>{ if(cById[id]) Object.assign(cById[id], pack.clubs[id]); });
  Object.keys(pack.media||{}).forEach(id=>{ const m=((DB&&DB.media)||[]).find(x=>x.id===id); if(m) m.logoImg=pack.media[id]; });
  if(DB && DB.confederations) Object.keys(pack.confederations||{}).forEach(k=>{ if(DB.confederations[k]) DB.confederations[k].logoImg=pack.confederations[k]; });
  if(pack.event && pack.event.logoImg && DB && DB.event) DB.event.logoImg = pack.event.logoImg;
  if(pack.fifa && pack.fifa.logoImg && DB && DB.fifa) DB.fifa.logoImg = pack.fifa.logoImg;
  // Tipografías extra del pack (la primera, "Default 01", ya viene en la base). Se anexan sin duplicar por id.
  if(Array.isArray(pack.numberFonts) && DB){
    if(!Array.isArray(DB.numberFonts)) DB.numberFonts=[];
    const seen = new Set(DB.numberFonts.map(f=>f.id));
    pack.numberFonts.forEach(f=>{ if(f && !seen.has(f.id)){ DB.numberFonts.push(f); seen.add(f.id); } });
  }
  return true;
}

/* Inversa de applyVisualPack: extrae SOLO los datos visuales (imágenes propias, uniformes, colores,
   tipografías extra) de la base actual y produce un pack visual listo para respaldar/importar.
   Los datos duros (id, nombre, conf, grupo, etc.) NO se incluyen: viven en base-datos-seed.js. */
function buildVisualPack(db){
  const src = db || (typeof DB!=="undefined" ? DB : null);
  const pack = { __type:"copa-manager-visual-pack", version:(src&&src.version)||2,
    teams:{}, playerPhotos:{}, clubs:{}, media:{}, confederations:{}, event:{}, fifa:{}, numberFonts:[] };
  if(!src) return pack;
  const TEAM_VISUAL = ["logoImg","kits","color1","color2","color3","kitSponsor"];
  const CLUB_VISUAL = TEAM_VISUAL;
  const has = v => !(v===null || v===undefined || v==="" || (Array.isArray(v)&&v.length===0));
  const pick = (obj, fields)=>{ const out={}; fields.forEach(f=>{ if(has(obj[f])) out[f]=obj[f]; }); return out; };

  (src.teams||[]).forEach(t=>{
    const v = pick(t, TEAM_VISUAL);
    if(Object.keys(v).length) pack.teams[t.id] = v;
    (t.players||[]).forEach(p=>{ if(typeof p.photo==="string" && p.photo.startsWith("data:")) pack.playerPhotos[p.id]=p.photo; });
  });
  (src.clubsData||[]).forEach(c=>{
    const v = pick(c, CLUB_VISUAL);
    if(Object.keys(v).length) pack.clubs[c.id] = v;
  });
  (src.media||[]).forEach(m=>{ if(typeof m.logoImg==="string" && m.logoImg.startsWith("data:")) pack.media[m.id]=m.logoImg; });
  if(src.confederations) Object.keys(src.confederations).forEach(k=>{
    const lg = src.confederations[k] && src.confederations[k].logoImg;
    if(typeof lg==="string" && lg.startsWith("data:")) pack.confederations[k]=lg;
  });
  if(src.event && typeof src.event.logoImg==="string" && src.event.logoImg.startsWith("data:")) pack.event.logoImg=src.event.logoImg;
  if(src.fifa && typeof src.fifa.logoImg==="string" && src.fifa.logoImg.startsWith("data:")) pack.fifa.logoImg=src.fifa.logoImg;

  // Tipografías: incluye solo las que NO están ya en la base seed (la primera, "Default 01", vive en la base).
  const baseFontIds = new Set(((typeof BASE_DB_SEED!=="undefined" && BASE_DB_SEED.numberFonts)||[]).map(f=>f.id));
  (src.numberFonts||[]).forEach(f=>{ if(f && !baseFontIds.has(f.id)) pack.numberFonts.push(f); });

  return pack;
}

/* ---------- Respaldo delta (copa-manager-backup) ----------
   El respaldo guarda SOLO lo que cambió respecto a la base del juego (buildDefaultDB): datos duros
   editados, imágenes propias, colores, uniformes, tipografías, catálogos, etc. Lo que no se tocó no
   se duplica (esos datos ya viven en el código). Al importar se parte de una base limpia y se aplican
   los cambios encima, reproduciendo el estado exacto. Formato:
     { __type:"copa-manager-backup", version, data:<parche> }
   El parche es recursivo y entiende los arreglos indexados por id (teams, players, clubsData,
   referees, media...): solo incluye los elementos añadidos, quitados o modificados; en los modificados
   baja recursivamente para no arrastrar campos que no cambiaron. */

function _isIdArray(a){
  return Array.isArray(a) && a.length>0 && a.every(x=> x && typeof x==="object" && !Array.isArray(x) && "id" in x);
}
function _cloneVal(v){ return (typeof structuredClone==="function") ? structuredClone(v) : JSON.parse(JSON.stringify(v)); }

// Devuelve el parche que lleva de `base` a `cur`, o undefined si son iguales.
function diffVal(base, cur){
  if(cur === base) return undefined;
  if(cur === undefined) return { __del:true };
  if(base === undefined) return { __set: cur };
  if(cur === null || base === null) return (base===cur) ? undefined : { __set: cur };

  if(Array.isArray(cur)){
    if(_isIdArray(cur) && _isIdArray(base)){
      const bById = Object.create(null); base.forEach(x=> bById[x.id]=x);
      const cById = Object.create(null); cur.forEach(x=> cById[x.id]=x);
      const changed=[], added=[], removed=[];
      cur.forEach(x=>{
        const b = bById[x.id];
        if(b===undefined){ added.push(x); }
        else { const d = diffVal(b, x); if(d!==undefined) changed.push({ id:x.id, patch:d }); }
      });
      base.forEach(x=>{ if(!(x.id in cById)) removed.push(x.id); });
      // Reordenamiento: si el orden de los ids comunes (presentes en base y cur) cambió, hay que
      // guardarlo. Los uniformes (team.kits) son arreglos por-id que el usuario reordena a mano, y sin
      // esto el respaldo delta perdía el orden. `order` guarda la secuencia completa de ids de `cur`.
      const curIds = cur.map(x=>x.id);
      const baseIds = base.map(x=>x.id);
      const commonCur  = curIds.filter(id=> baseIds.indexOf(id)>=0);
      const commonBase = baseIds.filter(id=> cById[id]!==undefined);
      const reordered = commonCur.join("\u0001") !== commonBase.join("\u0001");
      if(!changed.length && !added.length && !removed.length && !reordered) return undefined;
      const out = { __idarr:true };
      if(changed.length) out.changed = changed;
      if(added.length)   out.added   = added;
      if(removed.length) out.removed = removed;
      if(reordered || added.length) out.order = curIds;  // secuencia final de ids
      return out;
    }
    return (JSON.stringify(base)===JSON.stringify(cur)) ? undefined : { __set: cur };
  }

  if(typeof cur === "object"){
    if(typeof base !== "object" || Array.isArray(base)) return { __set: cur };
    const obj = {}; let any=false;
    for(const k in cur){ const d = diffVal(base[k], cur[k]); if(d!==undefined){ obj[k]=d; any=true; } }
    for(const k in base){ if(!(k in cur)){ obj[k] = { __del:true }; any=true; } }
    return any ? { __obj: obj } : undefined;
  }

  return { __set: cur };
}

// Aplica un parche de diffVal sobre `base` y devuelve el resultado.
// NOTA de rendimiento: el único que llama a applyPatch es applyBackup, SIEMPRE con un parche recién
// salido de JSON.parse (importación). Esos valores (`__set`, `added`) ya son copias frescas nuestras,
// así que NO se clonan (clonarlos duplicaba en memoria todas las imágenes importadas y era el mayor
// costo del import). La `base` (el seed) sí se clona, porque no debe mutarse.
function applyPatch(base, patch){
  if(patch==null) return base;
  if("__set" in patch) return patch.__set;   // valor recién parseado: ya es nuestro, sin clonar
  if(patch.__del) return undefined;   // el contenedor padre se encarga de borrar la clave
  if(patch.__idarr){
    const arr = Array.isArray(base) ? base.map(_cloneVal) : [];
    const idx = Object.create(null); arr.forEach((x,i)=>{ if(x && typeof x==="object" && "id" in x) idx[x.id]=i; });
    (patch.removed||[]).forEach(id=>{ if(id in idx) arr[idx[id]] = undefined; });
    (patch.changed||[]).forEach(ch=>{ if(ch.id in idx && arr[idx[ch.id]]!==undefined) arr[idx[ch.id]] = applyPatch(arr[idx[ch.id]], ch.patch); });
    (patch.added||[]).forEach(v=>{ arr.push(v); });   // valor recién parseado: sin clonar
    let out = arr.filter(x=> x!==undefined);
    if(patch.order){
      // Reordenar según la secuencia guardada. Los ids no listados (no debería haber) van al final,
      // conservando su orden relativo (orden estable).
      const pos = Object.create(null); patch.order.forEach((id,i)=> pos[id]=i);
      out = out
        .map((x,i)=>({ x, k: (x && typeof x==="object" && x.id in pos) ? pos[x.id] : (patch.order.length + i) }))
        .sort((a,b)=> a.k - b.k)
        .map(o=> o.x);
    }
    return out;
  }
  if(patch.__obj){
    const out = (base && typeof base==="object" && !Array.isArray(base)) ? _cloneVal(base) : {};
    for(const k in patch.__obj){
      const p = patch.__obj[k];
      if(p && p.__del) delete out[k];
      else out[k] = applyPatch(out[k], p);
    }
    return out;
  }
  return base;
}

// Referencia determinista para el respaldo: el SEED CRUDO (constante congelada), no buildDefaultDB()
// —que deriva colores en tiempo de ejecución—. Así la reconstrucción nunca depende de estado derivado
// y TODO ajuste del usuario respecto al seed queda garantizado en el JSON, siempre.
// Referencia CRUDA al seed, SIN clonar. Solo debe usarse como base de SOLO LECTURA (diffVal, y como
// base de applyPatch —que clona internamente antes de modificar—). Nunca modificar lo que devuelve.
function _rawSeedRef(){
  const src = (typeof BASE_DB_SEED!=="undefined") ? BASE_DB_SEED
            : (typeof window!=="undefined" ? window.BASE_DB_SEED : null);
  if(!src) throw new Error("Falta datos/base-datos-seed.js (BASE_DB_SEED)");
  return src;
}
function _rawSeedClone(){
  return _cloneVal(_rawSeedRef());
}

// Construye el respaldo delta a partir del estado actual (o de `db`): todo lo que difiera del seed.
// diffVal SOLO LEE la referencia, así que se usa el seed crudo sin clonar (evita clonar ~8 MB).
function buildBackup(db){
  const src = db || (typeof DB!=="undefined" ? DB : null);
  const ref = _rawSeedRef();
  const data = src ? (diffVal(ref, src) || {}) : {};
  return { __type:"copa-manager-backup", version:(src&&src.version)||ref.version||2, data };
}

// Reconstruye la base completa aplicando un respaldo delta sobre el seed crudo. Devuelve el nuevo
// objeto de base de datos, o null si el pack no es un respaldo delta válido.
function applyBackup(pack){
  if(!pack || pack.__type!=="copa-manager-backup") return null;
  const data = pack.data || {};
  // applyPatch con un patch de objeto/arreglo YA clona la base internamente antes de modificarla, así
  // que se le pasa el seed crudo (sin pre-clonar): así solo se clona UNA vez, no dos. Solo cuando el
  // patch no cambia nada hay que clonar aquí para no devolver (y luego mutar) el seed constante.
  const hasPatch = !!(data && (data.__obj || data.__idarr || ("__set" in data)));
  const result = hasPatch ? applyPatch(_rawSeedRef(), data) : _rawSeedClone();
  // Mantener el contador de ids por encima de los ya usados, como hace buildDefaultDB.
  if(typeof _seedCounter==="number" && result && typeof result.nextIdSeed==="number") _seedCounter = Math.max(_seedCounter, result.nextIdSeed);
  return result;
}

let DB = null;

function getTeam(id){
  // El contenedor de uniformes de árbitros se comporta como un equipo más para el editor de kits.
  if(id===REFEREE_KIT_TEAM_ID && typeof refereeKitsTeam==="function") return refereeKitsTeam();
  return DB.teams.find(t=>t.id===id) || (DB.clubsData && DB.clubsData.find(c=>c.id===id));
}
