/* =========================================================
   COPA MANAGER 2026 — funciones/duplicados.js
   DETECTOR DE DUPLICADOS (Editor / Base de datos, debajo de «Catálogos reutilizables»).
   Revisa la base y muestra posibles registros repetidos (jugadores, entrenadores, árbitros, clubes,
   estadios, selecciones, países, competiciones, patrocinadores, medios, partidos y catálogos).
   FUSIONAR PERSONAS (jugadores, entrenadores y árbitros): en cada grupo se elige el perfil que se
   queda y, campo por campo, con qué dato se queda. El perfil elegido hereda TODO lo de los demás:
   sus partidos (goles, tarjetas, alineaciones, cambios, penales…), capitanías, arbitrajes, enlaces y
   cualquier otra referencia en la base. Los nombres de los perfiles fusionados se guardan como
   alias (mergedNames) para que el importador de partidos.js los ligue siempre al perfil que se quedó.
   Script CLÁSICO (no module). Cargar DESPUÉS de core/utilidades.js y de los módulos que definen
   playerDisplayName / personCoachName / clubDisplayName (se usan solo si existen), y ANTES de
   funciones/editor.js (que llama a dupFinderSectionHTML).
   ========================================================= */

var dupCat = "resumen";   // categoría elegida en el selector (se conserva al re-renderizar el editor)
var dupOpen = false;      // el desplegable empieza CERRADO; se recuerda abierto/cerrado mientras dure la sesión
var dupMerge = null;      // fusión abierta: {cat, key, ids, surv, choices:{campo: índice}, confirmar}

(function(){
  "use strict";
  const N = s => String(s==null?"":s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g," ").trim();
  const H = s => (typeof escapeHtml==="function") ? escapeHtml(String(s==null?"":s)) : String(s==null?"":s).replace(/[&<>"]/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const firstLast = s => { const w=N(s).split(" ").filter(Boolean); return w.length>=2 ? (w[0]+" "+w[w.length-1]) : null; };
  const lastWord = s => { const w=N(s).split(" ").filter(Boolean); return w.length ? w[w.length-1] : null; };
  const teamName = id => { const t=(DB.teams||[]).find(x=>x.id===id); return t ? (t.hidden ? "Agentes libres" : (t.commonName||t.name||id)) : (id||""); };
  const countryName = id => { const c=(DB.countries||[]).find(x=>x.id===id); return c ? c.commonName : (id||""); };
  const fecha = d => d ? String(d).slice(0,10) : "";
  // Nombre de una persona (jugador / entrenador / árbitro): nombre + apellido, o el común / completo.
  const personName = p => {
    const fl=((p.firstName||"")+" "+(p.lastName||"")).trim();
    return fl || p.commonName || p.fullName || p.name || "";
  };
  // Dos personas con fecha de nacimiento DISTINTA nunca son la misma.
  const mismaPersonaPosible = (a,b) => !(a.birth && b.birth && a.birth!==b.birth);

  /* ---------- agrupador genérico ----------
     items: [{id, name, cols:[...], birth?, ...}]
     reglas: [{label, key:item=>string|null, seguro:bool, par?:(a,b)=>bool}]
     Devuelve grupos [{items, motivos:Set, seguro}] (2 o más registros unidos por alguna regla). */
  function agrupar(items, reglas){
    const padre=items.map((_,i)=>i);
    const raiz=i=>{ while(padre[i]!==i){ padre[i]=padre[padre[i]]; i=padre[i]; } return i; };
    const unir=(i,j)=>{ const a=raiz(i), b=raiz(j); if(a!==b) padre[b]=a; };
    const pares=[];
    reglas.forEach(r=>{
      const m={};
      items.forEach((it,i)=>{ const k=r.key(it); if(k==null || k==="") return; (m[k]=m[k]||[]).push(i); });
      Object.values(m).forEach(lst=>{
        if(lst.length<2) return;
        for(let x=0;x<lst.length;x++) for(let y=x+1;y<lst.length;y++){
          const a=items[lst[x]], b=items[lst[y]];
          if(r.par && !r.par(a,b)) continue;
          unir(lst[x], lst[y], r); pares.push([lst[x], lst[y], r]);
        }
      });
    });
    const grupos={};
    items.forEach((it,i)=>{ const k=raiz(i); (grupos[k]=grupos[k]||{items:[], idx:new Set(), motivos:new Set(), seguro:false}); grupos[k].items.push(it); grupos[k].idx.add(i); });
    pares.forEach(([i,j,r])=>{ const g=grupos[raiz(i)]; g.motivos.add(r.label); if(r.seguro) g.seguro=true; });
    return Object.values(grupos).filter(g=>g.items.length>1)
      .sort((a,b)=> (b.seguro-a.seguro) || String(a.items[0].name).localeCompare(String(b.items[0].name),"es"));
  }

  /* ---------- fuentes ---------- */
  const reglasPersona = [
    { label:"Mismo nombre", seguro:true, key:it=>N(it.name)||null, par:mismaPersonaPosible },
    { label:"Mismo nombre completo", seguro:true, key:it=>N(it.full)||null, par:mismaPersonaPosible },
    { label:"Mismo nombre y primer apellido (sin segundos nombres)", seguro:false, key:it=>firstLast(it.full||it.name), par:mismaPersonaPosible },
    // (con la inicial del nombre: así dos gemelos con el mismo apellido no salen como la misma persona)
    { label:"Misma fecha de nacimiento y apellido", seguro:false, key:it=> it.birth ? (it.birth+"|"+lastWord(it.last||it.name)+"|"+N(it.name).charAt(0)) : null }
  ];
  const catalogoTexto = (arr, titulo) => ({
    titulo, cols:["Valor"],
    items: (arr||[]).map((v,i)=>({ id:"#"+(i+1), name:String(v), cols:[String(v)] })),
    reglas:[{ label:"Mismo texto (sin mayúsculas ni acentos)", seguro:true, key:it=>N(it.name)||null }]
  });

  const FUENTES = {
    jugadores: ()=>{
      const items=[];
      (DB.teams||[]).forEach(t=>(t.players||[]).forEach(p=>items.push({
        id:p.id, name:(typeof playerDisplayName==="function" ? playerDisplayName(p) : personName(p)), full:p.fullName||personName(p),
        last:p.lastName, birth:fecha(p.birthDate),
        cols:[ (typeof playerDisplayName==="function" ? playerDisplayName(p) : personName(p)), p.fullName||"", t.hidden?"Agentes libres":(t.commonName||t.name), p.number!=null?("#"+p.number):"", p.pos||"", fecha(p.birthDate), p.club||"", p.id ]
      })));
      return { titulo:"Jugadores", cols:["Nombre","Nombre completo","Selección","Dorsal","Pos.","Nacimiento","Club","ID"], items, reglas:reglasPersona };
    },
    entrenadores: ()=>{
      const items=[];
      (DB.teams||[]).forEach(t=>(t.coaches||[]).forEach(c=>{
        const nm=(typeof personCoachName==="function") ? personCoachName(c) : personName(c);
        items.push({ id:c.id, name:nm, full:c.fullName||personName(c), last:c.lastName, birth:fecha(c.birthDate),
          cols:[nm, c.fullName||"", t.hidden?"Agentes libres":(t.commonName||t.name), c.role||c.position||"", fecha(c.birthDate), c.id] });
      }));
      return { titulo:"Entrenadores", cols:["Nombre","Nombre completo","Selección","Cargo","Nacimiento","ID"], items, reglas:reglasPersona };
    },
    arbitros: ()=>{
      const items=(DB.referees||[]).map(r=>{
        const nm=r.commonName||personName(r);
        return { id:r.id, name:nm, full:r.fullName||personName(r), last:r.lastName, birth:fecha(r.birthDate),
          cols:[nm, r.fullName||"", countryName(r.countryRepresentsId||(r.nationalityIds||[])[0]), r.role||"", fecha(r.birthDate), r.id] };
      });
      return { titulo:"Árbitros", cols:["Nombre","Nombre completo","País","Rol","Nacimiento","ID"], items, reglas:reglasPersona };
    },
    clubes: ()=>{
      const items=(DB.clubsData||[]).map(c=>{
        const nm=(typeof clubDisplayName==="function") ? clubDisplayName(c) : (c.commonName||"");
        return { id:c.id, name:nm, official:c.officialName||c.fullName||"", country:c.country||"", code:c.code||"",
          cols:[nm, c.officialName||c.fullName||"", c.country||"", c.city||"", c.league||"", c.code||"", c.id] };
      });
      return { titulo:"Clubes", cols:["Nombre","Nombre oficial","País","Ciudad","Liga","Código","ID"], items, reglas:[
        { label:"Mismo nombre y país", seguro:true, key:it=> N(it.name) ? N(it.name)+"|"+N(it.country) : null },
        { label:"Mismo nombre oficial", seguro:true, key:it=> N(it.official)||null },
        { label:"Mismo código y país", seguro:false, key:it=> (it.code && it.country) ? N(it.code)+"|"+N(it.country) : null },
        { label:"Mismo nombre (otro país)", seguro:false, key:it=> N(it.name)||null }
      ]};
    },
    estadios: ()=>{
      const items=(DB.stadiums||[]).map(s=>({ id:s.id, name:s.officialName||s.tournamentName||"", city:s.city||"", lat:+s.lat, lng:+s.lng,
        cols:[s.officialName||"", s.tournamentName||"", s.city||"", s.country||"", s.capacity!=null?String(s.capacity):"", s.isTraining?"Entrenamiento":"", s.id] }));
      const celda=it=> (isFinite(it.lat) && isFinite(it.lng) && (it.lat||it.lng)) ? (Math.round(it.lat*200)+","+Math.round(it.lng*200)) : null;   // ~500 m
      return { titulo:"Estadios", cols:["Nombre oficial","Nombre de torneo","Ciudad","País","Capacidad","Tipo","ID"], items, reglas:[
        { label:"Mismo nombre oficial", seguro:true, key:it=> N(it.name)||null },
        { label:"Misma ubicación (coordenadas a menos de ~500 m)", seguro:false, key:celda }
      ]};
    },
    selecciones: ()=>{
      const items=(DB.teams||[]).map(t=>({ id:t.id, name:t.commonName||t.name||"", code:t.fifaCode||"",
        cols:[t.commonName||t.name||"", t.officialName||"", t.fifaCode||"", t.conf||"", t.hidden?"Oculta":"", t.id] }));
      return { titulo:"Selecciones", cols:["Nombre","Nombre oficial","Código FIFA","Conf.","","ID"], items, reglas:[
        { label:"Mismo nombre", seguro:true, key:it=> N(it.name)||null },
        { label:"Mismo código FIFA", seguro:true, key:it=> N(it.code)||null }
      ]};
    },
    paises: ()=>{
      const items=(DB.countries||[]).map(c=>({ id:c.id, name:c.commonName||"", fifa:c.fifaCode||"", ioc:c.iocCode||"",
        cols:[c.commonName||"", c.fifaCode||"", c.iocCode||"", c.conf||"", c.parentOrStatus||"", c.id] }));
      return { titulo:"Países / entidades", cols:["Nombre","FIFA","COI","Conf.","País / estatus","ID"], items, reglas:[
        { label:"Mismo nombre", seguro:true, key:it=> N(it.name)||null },
        { label:"Mismo código FIFA", seguro:true, key:it=> N(it.fifa)||null },
        { label:"Mismo código COI", seguro:false, key:it=> N(it.ioc)||null }
      ]};
    },
    competiciones: ()=>{
      const items=(DB.competitions||[]).map(c=>({ id:c.id, name:c.commonName||c.officialName||"", official:c.officialName||"", code:c.code||"",
        cols:[c.commonName||"", c.officialName||"", c.code||"", c.kind||"", c.id] }));
      return { titulo:"Competiciones", cols:["Nombre","Nombre oficial","Código","Tipo","ID"], items, reglas:[
        { label:"Mismo nombre", seguro:true, key:it=> N(it.name)||null },
        { label:"Mismo nombre oficial", seguro:true, key:it=> N(it.official)||null },
        { label:"Mismo código", seguro:false, key:it=> N(it.code)||null }
      ]};
    },
    patrocinadores: ()=>{
      const items=(DB.sponsors||[]).map(s=>({ id:s.id, name:s.name||"", team:s.teamId||"",
        cols:[s.name||"", s.global?"Global":teamName(s.teamId), (s.categories||[]).join(", "), s.id] }));
      return { titulo:"Patrocinadores", cols:["Nombre","Selección","Categorías","ID"], items, reglas:[
        { label:"Mismo nombre y selección", seguro:true, key:it=> N(it.name) ? N(it.name)+"|"+it.team : null },
        { label:"Mismo nombre (otra selección)", seguro:false, key:it=> N(it.name)||null }
      ]};
    },
    medios: ()=>{
      const items=(DB.media||[]).map(m=>({ id:m.id, name:m.name||"", country:m.country||"",
        cols:[m.name||"", m.type||"", m.country||"", m.id] }));
      return { titulo:"Medios", cols:["Nombre","Tipo","País","ID"], items, reglas:[
        { label:"Mismo nombre y país", seguro:true, key:it=> N(it.name) ? N(it.name)+"|"+N(it.country) : null },
        { label:"Mismo nombre (otro país)", seguro:false, key:it=> N(it.name)||null }
      ]};
    },
    partidos: ()=>{
      const items=(DB.fixtures||[]).filter(f=>f.teamA && f.teamB).map(f=>({ id:f.id, name:teamName(f.teamA)+" vs "+teamName(f.teamB),
        pair:[f.teamA,f.teamB].sort().join("|"), date:f.date||"",
        cols:[f.date||"", f.time||"", teamName(f.teamA)+" vs "+teamName(f.teamB), (f.played?(f.scoreA+"-"+f.scoreB):"—"), f.venue||"", f.matchNo?("Partido "+f.matchNo):(f.src==="txt"?"partidos.js":(f.stage||"")), f.id] }));
      return { titulo:"Partidos", cols:["Fecha","Hora","Partido","Marcador","Estadio","Origen","ID"], items, reglas:[
        { label:"Mismos equipos y misma fecha", seguro:true, key:it=> it.date ? (it.date+"|"+it.pair) : null }
      ]};
    },
    ligas:        ()=>catalogoTexto(DB.leagues, "Ligas (catálogo)"),
    ciudades:     ()=>catalogoTexto((typeof allCities==="function")?allCities():DB.cities, "Ciudades (catálogo)"),
    clubesCat:    ()=>catalogoTexto(DB.clubs, "Clubes (catálogo de nombres)"),
    categorias:   ()=>catalogoTexto(DB.sponsorCategories, "Categorías de patrocinio"),
    marcas:       ()=>catalogoTexto(DB.brands, "Marcas")
  };
  const ORDEN = ["jugadores","entrenadores","arbitros","clubes","estadios","selecciones","paises","competiciones","patrocinadores","medios","partidos","ligas","ciudades","clubesCat","categorias","marcas"];

  function analizar(cat){
    try{ const F=FUENTES[cat](); return Object.assign(F, { cat, grupos: agrupar(F.items, F.reglas) }); }
    catch(e){ return { titulo:cat, cols:[], items:[], grupos:[], error:String(e&&e.message||e) }; }
  }

  /* ---------- FUSIÓN DE PERSONAS ---------- */
  const PERSONAS = new Set(["jugadores","entrenadores","arbitros"]);
  // Registro real de cada id: {obj, lista (arreglo que lo contiene), team}.
  function ubicarPersona(cat, id){
    if(cat==="arbitros"){ const l=DB.referees||[]; const o=l.find(x=>x.id===id); return o?{obj:o, lista:l, team:null}:null; }
    const campo = cat==="jugadores" ? "players" : "coaches";
    for(const t of (DB.teams||[])){ const l=t[campo]||[]; const o=l.find(x=>x.id===id); if(o) return {obj:o, lista:l, team:t}; }
    return null;
  }
  const SIN_ELEGIR = new Set(["id","mergedIds","mergedNames","autoImported","importSource"]);
  const ETIQUETAS = { firstName:"Nombre", lastName:"Apellido", commonName:"Nombre común", fullName:"Nombre completo",
    birthDate:"Nacimiento", birthPlace:"Lugar de nacimiento", pos:"Posición", positions:"Posiciones", number:"Dorsal",
    numberUnassigned:"Sin dorsal", club:"Club", rating:"Calificación", ratingPotential:"Potencial", photo:"Foto",
    nationalityIds:"Nacionalidades", declaredForCountryId:"Juega por", caps:"Partidos internacionales",
    goalsNational:"Goles internacionales", gender:"Género", height:"Estatura", weight:"Peso", foot:"Pie",
    autoImported:"Creado por el importador", importSource:"Origen", contractRole:"Cargo", contractClub:"Club (contrato)",
    contractCountryId:"País (contrato)", role:"Rol", countryRepresentsId:"País que representa", fifaBadgeYear:"Gafete FIFA",
    brand:"Marca (calzado)", favNumbersTeam:"Dorsales favoritos (selección)", favNumbersClub:"Dorsales favoritos (club)",
    shirtNameTeam:"Nombre en la camiseta (selección)", shirtNameClub:"Nombre en la camiseta (club)", fullNameLinked:"Nombre completo ligado",
    shirtNameTeamLinked:"Nombre en camiseta ligado (selección)", shirtNameClubLinked:"Nombre en camiseta ligado (club)",
    countryWorksIds:"Países donde trabaja", previousWorldCups:"Mundiales previos", fifaSince:"FIFA desde", matches:"Partidos", photoAlt:"Foto alternativa" };
  // Campos que guardan países por id: se muestran con su nombre.
  const CAMPOS_PAIS = /^(nationalityIds|declaredForCountryId|countryRepresentsId|contractCountryId|countryWorksIds)$/;
  const vacio = v => v==null || v==="" || (Array.isArray(v) && !v.length) || (typeof v==="object" && !Array.isArray(v) && !Object.keys(v).length);
  const llenos = o => Object.keys(o).filter(k=>!SIN_ELEGIR.has(k) && !vacio(o[k])).length;
  function vistaValor(v, k){
    if(vacio(v)) return `<span class="dup-mv0">—</span>`;
    if(CAMPOS_PAIS.test(k||"")){ const t=(Array.isArray(v)?v:[v]).map(countryName).join(", "); return `<span title="${H(t)}">${H(t)}</span>`; }
    if(typeof v==="string" && /^data:image\//.test(v)) return `<img class="dup-mimg" src="${v}" alt="">`;
    if(typeof v==="boolean") return v ? "Sí" : "No";
    if(typeof v==="object"){ const j=JSON.stringify(v); return `<span class="mono" title="${H(j)}">${H(j.length>60?j.slice(0,58)+"…":j)}</span>`; }
    const t=String(v); return `<span title="${H(t)}">${H(t.length>70?t.slice(0,68)+"…":t)}</span>`;
  }
  // Estado inicial de una fusión: se queda el perfil más completo (el que no creó el importador, si empatan).
  function nuevaFusion(cat, ids){
    const regs=ids.map(id=>ubicarPersona(cat,id));
    let surv=0; regs.forEach((r,i)=>{ if(!r) return; const a=regs[surv]; if(!a){ surv=i; return; }
      const d=llenos(r.obj)-llenos(a.obj); if(d>0 || (d===0 && a.obj.autoImported && !r.obj.autoImported)) surv=i; });
    return { cat, key:ids.slice().sort().join("|"), ids, surv, choices:eleccionesPorDefecto(regs, surv), confirmar:false };
  }
  function camposDiferentes(regs){
    const ks=new Set(); regs.forEach(r=>r && Object.keys(r.obj).forEach(k=>{ if(!SIN_ELEGIR.has(k)) ks.add(k); }));
    return [...ks].filter(k=>{ const vs=regs.map(r=>r?JSON.stringify(r.obj[k]===undefined?null:r.obj[k]):"null"); return vs.some(v=>v!==vs[0]); });
  }
  function eleccionesPorDefecto(regs, surv){
    const out={};
    camposDiferentes(regs).forEach(k=>{
      if(regs[surv] && !vacio(regs[surv].obj[k])) out[k]=surv;
      else { const i=regs.findIndex(r=>r && !vacio(r.obj[k])); out[k]= i>=0 ? i : surv; }
    });
    return out;
  }
  function fusionHTML(cat, ids){
    const M=dupMerge; const regs=M.ids.map(id=>ubicarPersona(cat,id));
    if(regs.some(r=>!r)) return `<p class="dup-mnote">Alguno de estos perfiles ya no existe. Vuelve a abrir el detector.</p>`;
    const nombre = r => personName(r.obj) || r.obj.id;
    const donde = r => r.team ? (r.team.hidden ? "Agentes libres" : (r.team.commonName||r.team.name||"")) : "";
    // Solo se elige el perfil que se queda: conserva sus datos; los que tenga vacíos se completan con los del otro.
    // Ficha breve de cada perfil (lo que muestra su perfil) para decidir cuál se queda.
    const partidos = id => (DB.fixtures||[]).filter(f=>JSON.stringify(f).indexOf('"'+id+'"')>=0).length;
    const fila = (et, v) => vacio(v) ? "" : `<div class="dup-mrow"><span>${H(et)}</span><b>${H(v)}</b></div>`;
    const ficha = r => {
      const o=r.obj, pais=v=>(Array.isArray(v)?v:[v]).filter(Boolean).map(countryName).join(", ");
      let foto = (typeof o.photo==="string" && o.photo) ? `<img class="dup-mfoto" src="${H(o.photo)}" alt="">` : `<span class="dup-mfoto vacia"></span>`;
      if(typeof personPhotoHTML==="function"){ try{ foto=`<span class="dup-mfoto">${personPhotoHTML(o,"width:100%;height:100%;")}</span>`; }catch(e){} }
      let filas="";
      if(M.cat==="jugadores"){
        filas = fila("Nombre completo", o.fullName) + fila("Selección", donde(r)) + fila("Posición", o.pos)
          + fila("Dorsal", o.number!=null ? "#"+o.number : "") + fila("Nacimiento", o.birthDate?String(o.birthDate).slice(0,10):"")
          + fila("Club", o.club) + fila("Nacionalidad", pais(o.nationalityIds)) + fila("Internacional", (o.caps||o.goalsNational) ? `${o.caps||0} partidos · ${o.goalsNational||0} goles` : "")
          + fila("Calificación", o.rating);
      } else if(M.cat==="entrenadores"){
        filas = fila("Nombre completo", o.fullName) + fila("Selección", donde(r)) + fila("Cargo", o.contractRole||o.role)
          + fila("Nacimiento", o.birthDate?String(o.birthDate).slice(0,10):"") + fila("Nacionalidad", pais(o.nationalityIds)) + fila("Calificación", o.rating);
      } else {
        filas = fila("Nombre completo", o.fullName) + fila("País", pais(o.countryRepresentsId||o.nationalityIds)) + fila("Rol", o.role)
          + fila("Nacimiento", o.birthDate?String(o.birthDate).slice(0,10):"") + fila("FIFA desde", o.fifaSince);
      }
      const n=partidos(o.id);
      filas += fila("Partidos en el juego", String(n)) + fila("Origen", o.autoImported ? "Creado por el importador" : "Base de datos");
      return `<div class="dup-mhead">${foto}<div><b>${H(nombre(r))}</b><div class="dup-msub mono">${H(o.id)}</div></div></div>${filas}`;
    };
    const tarjetas = regs.map((r,i)=>`<label class="dup-mcard${M.surv===i?" on":""}"><input type="radio" name="dupm-surv" value="${i}" ${M.surv===i?"checked":""}>
        <div class="dup-mbody">${ficha(r)}</div></label>`).join("");
    const otros = regs.filter((_,i)=>i!==M.surv).map(nombre).join(", ");
    return `<div class="dup-merge">
      <div class="dup-mtitle">Fusionar perfiles</div>
      <p class="dup-mnote">Elige el perfil que <b>se queda</b>. Conserva sus datos (lo que tenga vacío se completa con el otro) y hereda todo lo de <b>${H(otros)}</b> en el juego: partidos, goles, tarjetas, alineaciones, cambios, capitanías, arbitrajes, enlaces y cualquier otra referencia. Los demás perfiles se eliminan.</p>
      <div class="dup-mcards">${tarjetas}</div>
      <div class="dup-mact">
        ${M.confirmar ? `<span class="dup-mwarn">¿Seguro? Se eliminarán ${regs.length-1} perfil(es). Se puede deshacer con el historial.</span><button type="button" class="btn dup-mgo danger" data-dupmgo="1">Sí, fusionar</button><button type="button" class="btn" data-dupmcancel="1">Cancelar</button>`
                    : `<button type="button" class="btn primary dup-mgo" data-dupmgo="1">Fusionar ${regs.length} perfiles</button>`}
      </div>
    </div>`;
  }
  // Reemplaza las referencias a los ids fusionados en TODA la base (y en el estado guardado del onboarding).
  // Un id generado (largo, p. ej. "pmr1x5xhn_nso8d") se reemplaza donde aparezca; un id corto heredado
  // ("p5") solo en campos que son de personas (para no confundirlo con otro registro que se llame igual).
  const CAMPO_PERSONA=/player|coach|referee|captain|officials|^ref$|^aa1$|^aa2$|^fourth$|^var$|^avar$|potm|jdp|squad|bench|lineup|starter|taker|scorer|persona|person|ids$/i;
  function reemplazarIds(raiz, mapa, skip){
    const distintivo = id => String(id).length>=8;
    const toca = (id, k, kPadre) => distintivo(id) || CAMPO_PERSONA.test(k||"") || CAMPO_PERSONA.test(kPadre||"");
    const vistos=new Set();
    const walk=(o, k, kPadre)=>{
      if(!o || typeof o!=="object" || vistos.has(o) || skip.has(o)) return;
      vistos.add(o);
      if(Array.isArray(o)){
        for(let i=0;i<o.length;i++){ const v=o[i]; if(typeof v==="string" && mapa[v] && toca(v,k,kPadre)) o[i]=mapa[v]; else walk(v, k, kPadre); }
        // Lista de ids con el que se quedó repetido (dos convocados que eran la misma persona): uno solo.
        const nuevos=new Set(Object.values(mapa));
        for(let i=o.length-1;i>=0;i--){ if(typeof o[i]==="string" && nuevos.has(o[i]) && o.indexOf(o[i])<i) o.splice(i,1); }
        return;
      }
      Object.keys(o).forEach(key=>{
        if(key==="mergedIds") return;
        const v=o[key];
        if(typeof v==="string" && mapa[v] && toca(v,key,k)) o[key]=mapa[v];
        else walk(v, key, k);
        // Objetos indexados por id de persona ({ "pmr…": … }): la clave pasa al que se queda (sin pisar la suya).
        if(mapa[key] && distintivo(key)){ const nk=mapa[key]; if(o[nk]===undefined) o[nk]=o[key]; delete o[key]; }
      });
    };
    walk(raiz, "", "");
  }
  function ejecutarFusion(){
    const M=dupMerge; if(!M) return;
    const regs=M.ids.map(id=>ubicarPersona(M.cat,id)); if(regs.some(r=>!r)) return;
    const S=regs[M.surv], quedan=S.obj, otros=regs.filter((_,i)=>i!==M.surv);
    // 1) Datos elegidos campo por campo.
    Object.keys(M.choices).forEach(k=>{ const r=regs[M.choices[k]]; const v=r.obj[k];
      if(v===undefined) delete quedan[k]; else quedan[k]=JSON.parse(JSON.stringify(v)); });
    // 2) Ids y nombres de los perfiles fusionados (alias para el importador y para futuras fusiones).
    const nombres=o=>[ (typeof playerDisplayName==="function" && M.cat==="jugadores") ? playerDisplayName(o) : "", o.commonName, o.fullName, ((o.firstName||"")+" "+(o.lastName||"")).trim() ].concat(o.mergedNames||[]).map(x=>String(x||"").trim()).filter(Boolean);
    const propios=new Set(nombres(quedan).filter(n=>!(quedan.mergedNames||[]).includes(n)).map(N));
    const alias=[...(quedan.mergedNames||[])];
    otros.forEach(r=>nombres(r.obj).forEach(n=>{ if(!propios.has(N(n)) && !alias.some(a=>N(a)===N(n))) alias.push(n); }));
    if(alias.length) quedan.mergedNames=alias;
    // Si alguno de los perfiles NO lo creó el importador, el que se queda es un perfil "real".
    if(regs.some(r=>!r.obj.autoImported)){ delete quedan.autoImported; delete quedan.importSource; }
    const ids=new Set(quedan.mergedIds||[]); otros.forEach(r=>{ ids.add(r.obj.id); (r.obj.mergedIds||[]).forEach(x=>ids.add(x)); });
    quedan.mergedIds=[...ids];
    // 3) Fuera los perfiles que se van.
    otros.forEach(r=>{ const i=r.lista.indexOf(r.obj); if(i>=0) r.lista.splice(i,1); });
    // 4) Todas las referencias en el juego pasan al que se queda.
    const mapa={}; otros.forEach(r=>{ mapa[r.obj.id]=quedan.id; (r.obj.mergedIds||[]).forEach(x=>{ if(x!==quedan.id) mapa[x]=quedan.id; }); });
    reemplazarIds(DB, mapa, new Set([quedan]));
    try{
      const K=(typeof CM26_ONBOARDING_KEY!=="undefined") ? CM26_ONBOARDING_KEY : "cm26_onboarding_v1";
      const raw=localStorage.getItem(K);
      if(raw){ const o=JSON.parse(raw); reemplazarIds(o, mapa, new Set()); localStorage.setItem(K, JSON.stringify(o)); }
    }catch(e){}
    dupMerge=null;
    if(typeof persist==="function") persist();
    if(typeof showToast==="function") showToast(`Perfiles fusionados en ${personName(quedan)||quedan.id}`);
    if(typeof render==="function") render(); else pintar();
  }

  function grupoHTML(F, g){
    const chips=[...g.motivos].map(m=>`<span class="dup-chip">${H(m)}</span>`).join("");
    const esPersona = PERSONAS.has(F.cat);
    const key = g.items.map(it=>it.id).sort().join("|");
    const abierto = esPersona && dupMerge && dupMerge.cat===F.cat && dupMerge.key===key;
    const btn = esPersona ? `<button type="button" class="btn dup-mbtn${abierto?" on":""}" data-dupmerge="${H(key)}" data-dupmcat="${H(F.cat)}">${abierto?"Cerrar fusión":"Fusionar perfiles"}</button>` : "";
    return `<div class="dup-group${g.seguro?" seguro":""}" data-dupkey="${H(key)}">
      <div class="dup-ghead"><span class="dup-badge ${g.seguro?"s":"p"}">${g.seguro?"Duplicado":"Posible"}</span>
        <b>${H(g.items[0].name||"(sin nombre)")}</b><span class="dup-n">× ${g.items.length}</span>${chips}${btn}</div>
      ${abierto ? fusionHTML(F.cat, g.items.map(it=>it.id)) : ""}
      <div class="dup-tablewrap"><table class="dup-table"><thead><tr>${F.cols.map(c=>`<th>${H(c)}</th>`).join("")}</tr></thead>
        <tbody>${g.items.map(it=>`<tr>${it.cols.map((v,i)=>`<td${i===it.cols.length-1&&F.cols[i]==="ID"?' class="mono dup-id"':""}>${H(v)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>
    </div>`;
  }

  function resultadosHTML(cat){
    if(cat==="resumen"){
      const filas=ORDEN.map(k=>{ const F=analizar(k); const s=F.grupos.filter(g=>g.seguro).length, p=F.grupos.length-s;
        return `<tr data-dupcat="${k}" style="cursor:pointer;"><td>${H(F.titulo)}</td><td class="mono">${F.items.length}</td>
          <td class="mono" style="color:${s?"var(--danger,#ff6b4d)":"var(--muted)"};font-weight:${s?700:400};">${s}</td>
          <td class="mono" style="color:${p?"var(--amber,#f5c842)":"var(--muted)"};">${p}</td></tr>`; }).join("");
      return `<table class="dup-table dup-sum"><thead><tr><th>Sección</th><th>Registros</th><th>Duplicados</th><th>Posibles</th></tr></thead><tbody>${filas}</tbody></table>
        <p class="hint" style="font-size:11px;margin:8px 0 0;">Pulsa una fila para ver el detalle. <b>Duplicado</b>: mismo nombre (o código). <b>Posible</b>: coincidencia parcial que conviene revisar. Dos personas con fecha de nacimiento distinta nunca se marcan como la misma.</p>`;
    }
    const F=analizar(cat);
    if(F.error) return `<p style="font-size:12.5px;color:var(--danger,#ff6b4d);margin:0;">No se pudo revisar esta sección: ${H(F.error)}</p>`;
    if(!F.grupos.length) return `<p style="font-size:12.5px;color:var(--muted);margin:0;">Sin duplicados en ${H(F.titulo.toLowerCase())} (${F.items.length} registros revisados).</p>`;
    const s=F.grupos.filter(g=>g.seguro).length;
    return `<p style="font-size:12px;color:var(--muted);margin:0 0 10px;">${F.items.length} registros revisados · <b style="color:var(--ink);">${s}</b> grupo(s) duplicado(s) · <b style="color:var(--ink);">${F.grupos.length-s}</b> posible(s)</p>`
      + F.grupos.map(g=>grupoHTML(F,g)).join("");
  }

  // Sección completa (la pinta editor.js debajo de «Catálogos reutilizables»).
  window.dupFinderSectionHTML = function(){
    const opts=[["resumen","Resumen de toda la base"]].concat(ORDEN.map(k=>{ let t=k; try{ t=FUENTES[k]().titulo; }catch(e){} return [k,t]; }));
    // Desplegable, CERRADO por defecto (como «Catálogo de regiones»). Los resultados se calculan solo al abrirlo.
    return `
  <details class="dup-finder" id="dup-finder" ${dupOpen?"open":""}>
    <summary class="section-title" style="cursor:pointer;list-style:none;"><h2>Detector de duplicados <span style="font-size:13px;color:var(--muted);font-weight:400;">▾</span></h2><span class="hint">Revisa la base y muestra registros repetidos; jugadores, entrenadores y árbitros se pueden fusionar</span></summary>
    <div class="card">
      <label class="field" style="max-width:360px;margin-bottom:12px;">Revisar
        <select id="dup-cat">${opts.map(([k,t])=>`<option value="${k}" ${dupCat===k?"selected":""}>${H(t)}</option>`).join("")}</select>
      </label>
      <div id="dup-results">${dupOpen ? resultadosHTML(dupCat) : ""}</div>
    </div>
  </details>`;
  };

  const pintar=()=>{ const el=document.getElementById("dup-results"); if(el) el.innerHTML=resultadosHTML(dupCat); const sel=document.getElementById("dup-cat"); if(sel) sel.value=dupCat; };
  document.addEventListener("toggle", e=>{ if(e.target && e.target.id==="dup-finder"){ dupOpen=e.target.open; if(dupOpen) pintar(); } }, true);
  document.addEventListener("change", e=>{ if(e.target && e.target.id==="dup-cat"){ dupCat=e.target.value; pintar(); } });
  document.addEventListener("click", e=>{ const tr=e.target && e.target.closest && e.target.closest("#dup-results [data-dupcat]"); if(tr){ dupCat=tr.dataset.dupcat; pintar(); } });
  // Fusión: abrir/cerrar, elegir perfil y datos, confirmar.
  const repintarGrupo=()=>{ const keep=window.scrollY; pintar(); window.scrollTo(0, keep); };
  document.addEventListener("click", e=>{
    const t=e.target && e.target.closest ? e.target : null; if(!t) return;
    const ab=t.closest("#dup-results [data-dupmerge]");
    if(ab){ e.preventDefault(); const key=ab.dataset.dupmerge, cat=ab.dataset.dupmcat;
      dupMerge = (dupMerge && dupMerge.key===key && dupMerge.cat===cat) ? null : nuevaFusion(cat, key.split("|")); repintarGrupo(); return; }
    if(t.closest("#dup-results [data-dupmcancel]")){ if(dupMerge) dupMerge.confirmar=false; repintarGrupo(); return; }
    if(t.closest("#dup-results [data-dupmgo]")){ if(!dupMerge) return; if(!dupMerge.confirmar){ dupMerge.confirmar=true; repintarGrupo(); return; } ejecutarFusion(); }
  });
  document.addEventListener("change", e=>{
    const t=e.target; if(!t || !t.closest || !t.closest("#dup-results .dup-merge") || !dupMerge) return;
    if(t.name==="dupm-surv"){ const i=+t.value; const regs=dupMerge.ids.map(id=>ubicarPersona(dupMerge.cat,id)); dupMerge.surv=i; dupMerge.choices=eleccionesPorDefecto(regs, i); dupMerge.confirmar=false; repintarGrupo(); return; }
    if(t.dataset && t.dataset.dupmf){ dupMerge.choices[t.dataset.dupmf]=+t.value; dupMerge.confirmar=false; repintarGrupo(); }
  });

  // Estilos (una sola vez).
  if(!document.getElementById("dup-css")){
    const st=document.createElement("style"); st.id="dup-css";
    st.textContent=`
.dup-group{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-bottom:10px;}
.dup-group.seguro{border-color:color-mix(in srgb,var(--danger,#ff6b4d) 45%,var(--line));}
.dup-ghead{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-bottom:8px;font-size:13px;}
.dup-n{color:var(--muted);font-size:12px;}
.dup-badge{font-size:10.5px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:2px 7px;border-radius:6px;}
.dup-badge.s{background:color-mix(in srgb,var(--danger,#ff6b4d) 20%,transparent);color:var(--danger,#ff6b4d);}
.dup-badge.p{background:color-mix(in srgb,var(--amber,#f5c842) 20%,transparent);color:var(--amber,#f5c842);}
.dup-chip{font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:20px;padding:1px 8px;}
.dup-tablewrap{overflow-x:auto;}
.dup-table{width:100%;border-collapse:collapse;font-size:12px;}
.dup-table th{text-align:left;font-weight:600;color:var(--muted);padding:4px 8px;border-bottom:1px solid var(--line);white-space:nowrap;}
.dup-table td{padding:4px 8px;border-bottom:1px solid color-mix(in srgb,var(--line) 60%,transparent);white-space:nowrap;}
.dup-table tr:last-child td{border-bottom:none;}
.dup-id{color:var(--muted);font-size:11px;}
.dup-sum tbody tr:hover td{background:var(--surface-2);}
.dup-mbtn{margin-left:auto;font-size:11.5px;padding:3px 10px;}
.dup-mbtn.on{background:var(--surface-2);}
.dup-merge{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin:0 0 10px;background:var(--surface-2);}
.dup-mtitle{font-weight:700;font-size:13px;margin-bottom:4px;}
.dup-mnote{font-size:12px;color:var(--muted);margin:0 0 8px;white-space:normal;}
.dup-msurv{font-weight:700;color:var(--ink);cursor:pointer;white-space:nowrap;}
.dup-msub{font-weight:400;font-size:10.5px;color:var(--muted);}
.dup-mtable td{vertical-align:middle;}
.dup-mk{color:var(--muted);font-weight:600;}
.dup-mcards{display:flex;flex-wrap:wrap;gap:8px;}
.dup-mcard{display:flex;align-items:flex-start;gap:8px;cursor:pointer;padding:8px 10px;border:1px solid var(--line);border-radius:8px;font-size:12.5px;flex:1;min-width:220px;}
.dup-mcard.on{border-color:var(--indigo,#5b5bd6);background:color-mix(in srgb,var(--indigo,#5b5bd6) 14%,transparent);}
.dup-mbody{flex:1;min-width:0;}
.dup-mhead{display:flex;align-items:center;gap:8px;margin-bottom:6px;}
.dup-mfoto{width:36px;height:36px;border-radius:50%;object-fit:cover;overflow:hidden;display:inline-block;flex-shrink:0;background:var(--surface);border:1px solid var(--line);}
.dup-mrow{display:flex;justify-content:space-between;gap:10px;font-size:11.5px;padding:2px 0;border-top:1px solid color-mix(in srgb,var(--line) 50%,transparent);}
.dup-mrow span{color:var(--muted);} .dup-mrow b{font-weight:600;text-align:right;}
.dup-mopt{display:inline-flex;align-items:center;gap:6px;cursor:pointer;padding:2px 6px;border-radius:6px;}
.dup-mopt.on{background:color-mix(in srgb,var(--indigo,#5b5bd6) 22%,transparent);}
.dup-mv0{color:var(--muted);}
.dup-mimg{height:28px;width:auto;border-radius:4px;vertical-align:middle;}
.dup-mact{display:flex;align-items:center;gap:8px;justify-content:flex-end;margin-top:10px;flex-wrap:wrap;}
.dup-mwarn{font-size:12px;color:var(--amber,#f5c842);}
.dup-mgo.danger{background:var(--danger,#ff6b4d);color:#fff;border-color:transparent;}
`;
    (document.head||document.documentElement).appendChild(st);
  }
})();
