/* =====================================================================
   COPA MANAGER 2026 — nucleo/importar-lesiones.js
   Lee window.LESIONES_TXT (archivo lesiones.js, editable a mano) y lo convierte en una lista
   de CAMBIOS DE CONVOCATORIA (lesiones y reemplazos). NO toca la plantilla ni la base de datos: solo
   produce datos que app/juego.js usa para generar NOTICIAS y CORREOS en la fecha marcada.

   Cargar DESPUÉS de los demás módulos pero en el mismo lugar que partidos.js:
     <script src="nucleo/importar-lesiones.js"></script>
     <script src="lesiones.js"></script>
   El parseo es PEREZOSO: se hace la primera vez que las pantallas de Noticias/Buzón lo piden (ya con la
   base de datos cargada), y se re-parsea solo si cambia el texto.

   Expone window.LesionesTxt = { parse, items }.
   ===================================================================== */
(function(){
  function nl(s){ return String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").trim(); }
  function pad2(n){ return String(n).padStart(2,"0"); }
  const MESES={enero:0,febrero:1,marzo:2,abril:3,mayo:4,junio:5,julio:6,agosto:7,septiembre:8,setiembre:8,octubre:9,noviembre:10,diciembre:11,
               ene:0,feb:1,mar:2,abr:3,may:4,jun:5,jul:6,ago:7,sep:8,set:8,oct:9,nov:10,dic:11};
  // "1 de junio de 2026" / "1 junio 2026" / "1 jun 2026" → "2026-06-01"
  function parseDate(str){
    if(!str) return null;
    const s=nl(str).replace(/\bde\b/g," ").replace(/[.,]/g," ").replace(/\s+/g," ").trim();
    const m=s.match(/(\d{1,2})\s+([a-z]+)\s+(\d{4})/);
    if(!m) return null;
    let mo=MESES[m[2]]; if(mo==null) mo=MESES[m[2].slice(0,3)];
    if(mo==null) return null;
    return `${m[3]}-${pad2(mo+1)}-${pad2(parseInt(m[1],10))}`;
  }
  function hasDate(line){ return /\d{1,2}\s+(de\s+)?[A-Za-zÁÉÍÓÚáéíóú]{3,}\.?\s+(de\s+)?\d{4}/i.test(line); }
  // Lugar de la lesión: "con su selección" / "en su club". null si no se especifica (se trata como club).
  function detectVenue(txt){ const s=nl(txt); if(/selec/.test(s)) return "seleccion"; if(/club/.test(s)) return "club"; return null; }
  // Resuelve el equipo por nombre SIN crearlo (solo lectura). Si no existe, deja id en null (se muestra el texto).
  function resolveTeam(name){
    const res={id:null, name:name};
    try{
      if(typeof DB==="undefined"||!DB.teams) return res;
      const key=nl(name);
      let t=DB.teams.find(x=>nl(x.commonName||"")===key || nl(x.name||"")===key || nl(x.officialName||"")===key);
      if(!t && DB.countries){
        const c=DB.countries.find(x=>nl(x.commonName||"")===key || nl(x.name||"")===key);
        if(c && c.teamLinks && c.teamLinks.absoluta && typeof getTeam==="function") t=getTeam(c.teamLinks.absoluta);
      }
      if(t){ res.id=t.id; res.name=t.commonName||t.name||name; }
    }catch(e){}
    return res;
  }

  let _cacheText=null, _items=null;
  function parse(){
    const text=(typeof window!=="undefined" && typeof window.LESIONES_TXT==="string") ? window.LESIONES_TXT : "";
    if(_cacheText===text && _items) return _items;
    _cacheText=text;
    const out=[]; let curTeam=null, cur=null;
    const flush=()=>{ if(cur){ out.push(cur); cur=null; } };
    text.split(/\r?\n/).forEach(raw=>{
      const line=raw.trim();
      if(!line){ flush(); return; }
      if(line.charAt(0)==="#"){ return; }                          // comentario
      // Reemplazo:  "26, Sale - Entra - fecha de confirmación"
      let m=line.match(/^(\d{1,3})\s*,\s*(.+?)\s+-\s+(.+?)\s+-\s+(.+)$/);
      if(m){ flush(); cur={type:"replacement", dorsal:parseInt(m[1],10), outName:m[2].trim(), inName:m[3].trim(), date:parseDate(m[4]), _team:curTeam, _need:"desc"}; return; }
      // Lesión:  "Nombre - fecha de lesión"  (un solo " - ", termina en fecha)
      m=line.match(/^([^-]+?)\s+-\s+(.+)$/);
      if(m && hasDate(m[2])){ const d=parseDate(m[2]); if(d){ flush(); cur={type:"injury", player:m[1].trim(), date:d, _team:curTeam, _need:"desc"}; return; } }
      // Dentro de una entrada: descripción o línea de fecha/lugar de la lesión (club / selección).
      if(cur && cur._need==="injdate"){
        if(hasDate(line)){ const parts=line.split(","); cur.injuryDate=parseDate(parts[0]); cur.context=parts.slice(1).join(",").trim(); cur.venue=detectVenue(cur.context); cur._need=null; flush(); return; }
        flush();   // no era fecha → cierra la entrada y trata la línea como encabezado
      }
      if(cur && cur._need==="desc"){
        const dm=line.match(/^(.*?)\s*(?:\(([^)]*)\))?\s*$/);
        cur.injuryDesc=(dm?dm[1]:line).trim();
        cur.duration=(dm && dm[2]) ? dm[2].trim() : "";
        cur._need = "injdate";   // ambos tipos admiten una línea opcional de fecha/lugar de la lesión
        return;
      }
      // Encabezado de selección.
      flush();
      curTeam=resolveTeam(line);
    });
    flush();
    out.forEach(it=>{ const tm=it._team||{}; it.teamName=tm.name||""; it.teamId=tm.id||null; delete it._team; delete it._need; });
    _items=out; return out;
  }

  try{ window.LesionesTxt = { parse:parse, get items(){ return parse(); }, parseDate:parseDate }; }catch(e){}
})();
