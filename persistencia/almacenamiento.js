/* =========================================================
   COPA MANAGER 2026 — persistencia/almacenamiento.js
   Persistencia: cargar (loadDB) y guardar (persist) DB en window.storage, bajo la
   clave STORAGE_KEY, con guardado diferido (saveTimer). Extracción mecánica: texto y
   orden idénticos al original. Script CLÁSICO (no module). Cargar DESPUÉS de
   nucleo/modelo-db.js (DB, buildDefaultDB), nucleo/migracion.js (migrateDB) y
   app/modales.js (showToast), y ANTES del <script> inline. Usa en tiempo de
   ejecución DB, migrateDB, y las piezas de historial PREV_DB_JSON y recordHistory,
   que permanecen en el inline reservadas a persistencia/historial.js (paso 25):
   loadDB fija el baseline PREV_DB_JSON tras cargar/migrar, y persist invoca
   recordHistory antes de sobreescribir. STORAGE_KEY también lo usa el historial
   (revertir). Lo invocan init (loadDB) y handleAction/acciones (persist).
   ========================================================= */

const STORAGE_KEY = "wc26_db_v1";

let saveTimer = null;

async function loadDB(){
  try{
    const res = await window.storage.get(STORAGE_KEY, false);
    if(res && res.value){
      DB = JSON.parse(res.value);
      migrateDB();
      PREV_DB_JSON = JSON.stringify(DB); // punto de partida del historial (la migración no se registra)
      return;
    }
  }catch(e){ /* no existe aún */ }
  DB = buildDefaultDB();
  migrateDB();
  PREV_DB_JSON = JSON.stringify(DB);
  await persist(true);
}

function persist(immediate){
  if(saveTimer) clearTimeout(saveTimer);
  const doSave = async ()=>{
    try{
      const json = JSON.stringify(DB);
      // Registra el cambio en el historial ANTES de sobreescribir el estado previo.
      if(PREV_DB_JSON!==null && json!==PREV_DB_JSON) recordHistory();
      PREV_DB_JSON = json;
      await window.storage.set(STORAGE_KEY, json, false);
    }catch(e){ showToast("No se pudo guardar (almacenamiento)"); }
  };
  if(immediate) return doSave();
  saveTimer = setTimeout(doSave, 350);
}
