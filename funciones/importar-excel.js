/* =====================================================================
   COPA MANAGER 2026 — funciones/importar-excel.js
   Apartado «Jugadores» del editor: una HOJA DE CÁLCULO por selección con los datos del juego.
     · BULK_COLS: la lista ÚNICA de columnas (40); de aquí salen el encabezado, la ayuda, la
       exportación y la importación, así todo coincide siempre.
     · En la hoja se escribe, se pega (bloques de filas y columnas desde Excel, a partir de la celda
       o de la columna/fila elegida) y se copia (clic en el encabezado de columna o en el número de
       fila; Mayús+clic para un rango). Nada se guarda hasta «Guardar cambios».
     · Importar Excel (.xlsx): carga la hoja de la selección en la tabla (empareja cada fila con su
       jugador; las que no coinciden entran como jugadores nuevos). Exportar Excel: los jugadores de la
       base del juego (con los cambios hechos a mano), una hoja por selección.
   Cargar después de funciones/jugadores.js y funciones/editor.js.
   ===================================================================== */

// i = índice de la columna (base 0). n = número de columnas que ocupa (las posiciones: 20).
const BULK_COLS = [
  {i:0,  key:"dorsal",   label:"Dorsal",                       fmt:"número 1–99 (vacío = sin dorsal)", ej:["10","16"]},
  {i:1,  key:"pos",      label:"Posición",                     fmt:"GK, DF, MF o FW", ej:["FW","FW"]},
  {i:2,  key:"nombre",   label:"Nombre",                       fmt:"texto", ej:["Lionel","Julián"]},
  {i:3,  key:"apellido", label:"Apellido",                     fmt:"texto", ej:["Messi","Quiñones"]},
  {i:4,  key:"comun",    label:"Nombre común",                 fmt:"texto (opcional: apodo o mononombre); «[Apellido primero]» = el nombre se escribe Apellido + Nombre (p. ej. coreanos)", ej:["",""]},
  {i:5,  key:"completo", label:"Nombre completo",              fmt:"texto (opcional)", ej:["Lionel Andrés Messi","Julián Andrés Quiñones Quiñones"]},
  {i:6,  key:"fecha",    label:"Fecha de nacimiento",          fmt:"1998-05-12 · 14/01/1999 · April 9, 1997 · September 30, 1990 (aged 35)", ej:["1987-06-24","1997-03-24"]},
  {i:7,  key:"estatura", label:"Estatura",                     fmt:"cm (140–230)", ej:["170","177"]},
  {i:8,  key:"caps",     label:"Internacionalidades",          fmt:"número de partidos con la selección", ej:["191","22"]},
  {i:9,  key:"goles",    label:"Goles con la selección",       fmt:"número", ej:["112","2"]},
  {i:10, key:"club",     label:"Club",                         fmt:"se empareja con los clubes existentes", ej:["Inter Miami","Al-Qadsiah"]},
  {i:11, key:"camsel",   label:"Nombre en camiseta (selección)", fmt:"texto (máx. 50)", ej:["MESSI","J.QUIÑONES"]},
  {i:12, key:"camclub",  label:"Nombre en camiseta (club)",    fmt:"texto (máx. 50)", ej:["MESSI","QUIÑONES"]},
  {i:13, key:"marca",    label:"Marca patrocinadora",          fmt:"se empareja con las marcas; porteros: «botas, guantes» (ej. Nike, Reusch); «Sin sponsor» = sin marca", ej:["Adidas","Nike"]},
  {i:14, key:"rating",   label:"Rating",                       fmt:"0–99", ej:["93","78"]},
  {i:15, key:"ratingpot",label:"Rating potencial",             fmt:"0–99", ej:["93","82"]},
  {i:16, key:"pieizq",   label:"Pie izquierdo",                fmt:"1–20", ej:["20","14"]},
  {i:17, key:"pieder",   label:"Pie derecho",                  fmt:"1–20", ej:["18","16"]},
  {i:18, key:"posiciones", n:20, label:"Posiciones (10 pares Posición · Valor)", fmt:"código (GK, CB, LB, RB, DM, CM, CAM, LW, RW, ST, CF…) y valor 0–20; «CB (R)» / «CB (L)» = central por derecha / izquierda", ej:[["ST","19","CAM","18","RW","17"],["ST","16","CF","15"]]},
  {i:38, key:"favsel",   label:"Dorsales favoritos (selección)", fmt:"números separados por coma (máx. 5)", ej:["10","9, 16"]},
  {i:39, key:"favclub",  label:"Dorsales favoritos (club)",    fmt:"números separados por coma (máx. 5)", ej:["10, 30","9"]}
];
const BULK_NCOLS = 40;
function bulkCol(key){ return BULK_COLS.find(c=>c.key===key)||null; }
// Celdas de una columna en una fila de ejemplo (las posiciones ocupan 20 celdas).
function bulkCells(col, vals){ const n=col.n||1; const a=Array.isArray(vals)?vals.slice(0,n):[vals==null?"":String(vals)]; while(a.length<n) a.push(""); return a; }

// ---- Textos de ayuda ----
function bulkColsListHTML(){
  return `<ol class="bk-cols">${BULK_COLS.map(c=>`<li value="${c.i+1}"><b>${escapeHtml(c.label)}</b>${c.n?` <span class="bk-cr">(columnas ${c.i+1}–${c.i+c.n})</span>`:""} — <span>${escapeHtml(c.fmt)}</span></li>`).join("")}</ol>`;
}
// Ejemplo del recuadro: la lista de TODAS las columnas y dos filas de ejemplo completas (40 celdas).
// ---- Orden de los jugadores de una selección (el MISMO en la hoja y en la exportación) ----
function bulkTeamOrder(team){
  return (team&&team.players||[]).slice().sort((a,b)=>{
    const na=(a.number!=null&&!a.numberUnassigned)?a.number:999, nb=(b.number!=null&&!b.numberUnassigned)?b.number:999;
    return na-nb || String(playerSortName(a)).localeCompare(String(playerSortName(b)),"es");
  });
}

// ---- Aplicar UNA columna (o el bloque de posiciones) de una fila c (array de 40 celdas) a un jugador ----
function bulkApplyCol(player, key, c){
  const v=i=>String(c[i]==null?"":c[i]).trim();
  const num=s=>{ const n=parseInt(String(s).trim()); return isNaN(n)?null:n; };
  const c020=s=>{ const n=num(s); return n==null?null:Math.max(0,Math.min(20,n)); };
  switch(key){
    case "dorsal": { const n=num(v(0)); if(n!=null && n>0){ player.number=Math.min(99,n); player.numberUnassigned=false; } return; }
    case "pos": { const p=v(1).toUpperCase(); if(VALID_POS.includes(p)) player.pos=p; return; }
    case "nombre": if(v(2)) player.firstName=v(2); return;
    case "apellido": if(v(3)) player.lastName=v(3); return;
    case "comun": if(v(4)){ const cn=parseCommonNameCell(v(4)); if(cn.lastNameFirst) player.lastNameFirst=true; if(cn.commonName) player.commonName=cn.commonName; if(cn.lastNameFirst && player.fullNameLinked) player.fullName=computeDefaultFullName(player); } return;
    case "completo": if(v(5)){ player.fullName=v(5); player.fullNameLinked=(v(5)===computeDefaultFullName(player)); } return;
    case "fecha": { const bd=parseBirthDate(v(6)); if(bd) player.birthDate=bd; return; }
    case "estatura": { const h=numInRange(v(7),140,230); if(h!=null) player.height=h; return; }
    case "caps": { const x=numInRange(v(8),0,100000); if(x!=null) player.caps=x; return; }
    case "goles": { const x=numInRange(v(9),0,100000); if(x!=null) player.goalsNational=x; return; }
    case "club": if(v(10)){ const cl=matchOrAddClub(v(10)); if(cl) player.club=cl; } return;
    case "camsel": if(v(11)){ player.shirtNameTeam=v(11).slice(0,50); player.shirtNameTeamLinked=false; } return;
    case "camclub": if(v(12)){ player.shirtNameClub=v(12).slice(0,50); player.shirtNameClubLinked=false; } return;
    case "marca": if(v(13)){ const mb=brandsFromImportCell(v(13)); if(mb.botas){ player.brand=mb.botas; if(player.pos==="GK") player.gloveBrand=mb.guantes||null; } } return;
    case "rating": if(v(14)!=="") player.rating=Math.max(0,Math.min(99,parseInt(v(14))||0)); return;
    case "ratingpot": if(v(15)!=="") player.ratingPotential=Math.max(0,Math.min(99,parseInt(v(15))||0)); return;
    case "pieizq": { const x=c020(v(16)); if(x!=null) player.footLeft=x; return; }
    case "pieder": { const x=c020(v(17)); if(x!=null) player.footRight=x; return; }
    case "posiciones": {
      const pos={}; let any=false;
      for(let i=18;i<=36;i+=2){
        const raw=v(i).toUpperCase(); if(!raw) continue;
        const cbm=raw.match(/^CB\s*[\(\-\s]?\s*([LR])\s*\)?$/);
        const code=cbm?"CB":raw.replace(/[^A-Z]/g,"");
        if(POS_CAT_OF[code]===undefined) continue;
        any=true; const val=c020(v(i+1)); if(val!=null && val>0) pos[code]=val;
        if(cbm) player.cbSide=cbm[1];
      }
      if(any) player.positions=pos;   // el bloque de pares define el perfil posicional completo
      return;
    }
    case "favsel": { const f=parseFavNumbers(v(38)); if(f.length) player.favNumbersTeam=f; return; }
    case "favclub": { const f=parseFavNumbers(v(39)); if(f.length) player.favNumbersClub=f; return; }
  }
}
// Fila de 40 celdas a partir de una línea pegada (tabulador; coma como respaldo).
function bulkSplit(line){ const c=(line.indexOf("\t")>=0 ? line.split("\t") : line.split(",")).map(s=>s.trim()); while(c.length<BULK_NCOLS) c.push(""); return c; }
function bulkIsHeader(line){ return !/^\s*\d/.test(line) && /(dorsal|posici|nombre|apellido|nacimiento|estatura|internacional|goles|club|camiseta|marca|rating|pie|favorito)/i.test(line); }

// ---- Exportación ----
function bulkExportRow(p, team){
  const r=new Array(BULK_NCOLS).fill("");
  r[0]=(p.number!=null && !p.numberUnassigned) ? String(p.number) : "";
  r[1]=p.pos||""; r[2]=p.firstName||""; r[3]=p.lastName||""; r[4]=((p.lastNameFirst?APELLIDO_PRIMERO_TAG+" ":"")+(p.commonName||"")).trim();
  // Nombre completo: solo si es distinto del automático (Nombre + Apellido); si no, va vacío y se forma solo.
  r[5]=(p.fullName && p.fullName.trim()!==computeDefaultFullName(p)) ? p.fullName.trim() : "";
  r[6]=p.birthDate||""; r[7]=p.height!=null?String(p.height):""; r[8]=p.caps!=null?String(p.caps):""; r[9]=p.goalsNational!=null?String(p.goalsNational):"";
  r[10]=p.club||"";
  r[11]=(p.shirtNameTeam && !p.shirtNameTeamLinked) ? p.shirtNameTeam : "";
  r[12]=(p.shirtNameClub && !p.shirtNameClubLinked) ? p.shirtNameClub : "";
  const gl=(p.pos==="GK" && p.gloveBrand && normLoose(p.gloveBrand)!==normLoose(p.brand||"")) ? p.gloveBrand : "";
  r[13]=p.brand ? (gl ? p.brand+", "+gl : p.brand) : "";
  r[14]=p.rating!=null?String(p.rating):""; r[15]=p.ratingPotential!=null?String(p.ratingPotential):"";
  r[16]=p.footLeft!=null?String(p.footLeft):""; r[17]=p.footRight!=null?String(p.footRight):"";
  const pos=Object.entries(p.positions||{}).filter(([k,v])=>v>0).sort((a,b)=>b[1]-a[1]).slice(0,10);
  pos.forEach(([k,v],j)=>{ r[18+j*2]=(k==="CB" && p.cbSide) ? `CB (${p.cbSide})` : k; r[19+j*2]=String(v); });
  r[38]=(p.favNumbersTeam||[]).join(", "); r[39]=(p.favNumbersClub||[]).join(", ");
  return r;
}
function bulkHeaderRow(){ const h=new Array(BULK_NCOLS).fill(""); BULK_COLS.forEach(c=>{ if(c.n){ for(let j=0;j<10;j++){ h[c.i+j*2]="Posición "+(j+1); h[c.i+j*2+1]="Valor "+(j+1); } } else h[c.i]=c.label; }); return h; }
function bulkTSV(team, withHeader){
  const rows=bulkTeamOrder(team).map(p=>bulkExportRow(p, team));
  if(withHeader) rows.unshift(bulkHeaderRow());
  return rows.map(r=>r.map(x=>String(x).replace(/[\t\r\n]+/g," ")).join("\t")).join("\n");
}

// ---- Escritor mínimo de .xlsx (ZIP sin compresión + hojas con texto en línea) ----
const _bulkCRC=(()=>{ const t=new Uint32Array(256); for(let n=0;n<256;n++){ let c=n; for(let k=0;k<8;k++) c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1); t[n]=c>>>0; } return t; })();
function _bulkCrc32(b){ let c=0xFFFFFFFF; for(let i=0;i<b.length;i++) c=_bulkCRC[(c^b[i])&0xFF]^(c>>>8); return (c^0xFFFFFFFF)>>>0; }
function _bulkZip(files){   // files: [{name, data:Uint8Array}]
  const enc=new TextEncoder(); const parts=[], central=[]; let off=0;
  const u16=n=>[n&255,(n>>>8)&255], u32=n=>[n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255];
  files.forEach(f=>{
    const nm=enc.encode(f.name), crc=_bulkCrc32(f.data), sz=f.data.length;
    const loc=new Uint8Array([...u32(0x04034b50),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),...u16(0)]);
    parts.push(loc, nm, f.data);
    central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0x0800),...u16(0),...u16(0),...u16(0x21),...u32(crc),...u32(sz),...u32(sz),...u16(nm.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(off)]), nm);
    off+=loc.length+nm.length+sz;
  });
  const cdSize=central.reduce((s,a)=>s+a.length,0);
  const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(files.length),...u16(files.length),...u32(cdSize),...u32(off),...u16(0)]);
  return new Blob([...parts, ...central, end], {type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
}
function _bulkXml(s){ return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,""); }
function _bulkColRef(n){ let s=""; n++; while(n>0){ const m=(n-1)%26; s=String.fromCharCode(65+m)+s; n=Math.floor((n-1)/26); } return s; }
function bulkBuildXlsx(sheets){   // sheets: [{name, rows:[[...]]}] — la fila 1 va en negrita
  const enc=new TextEncoder(); const files=[];
  const used={}; const names=sheets.map(s=>{ let n=String(s.name||"Hoja").replace(/[\[\]:*?\/\\]/g," ").slice(0,31).trim()||"Hoja"; let k=n, i=2; while(used[k.toLowerCase()]){ k=(n.slice(0,28)+" "+i++); } used[k.toLowerCase()]=1; return k; });
  files.push({name:"[Content_Types].xml", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>${sheets.map((s,i)=>`<Override PartName="/xl/worksheets/sheet${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`)});
  files.push({name:"_rels/.rels", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`)});
  files.push({name:"xl/workbook.xml", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${names.map((n,i)=>`<sheet name="${_bulkXml(n)}" sheetId="${i+1}" r:id="rId${i+1}"/>`).join("")}</sheets></workbook>`)});
  files.push({name:"xl/_rels/workbook.xml.rels", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${names.map((n,i)=>`<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i+1}.xml"/>`).join("")}<Relationship Id="rId${names.length+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`)});
  files.push({name:"xl/styles.xml", data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>`)});
  sheets.forEach((s,si)=>{
    const rows=s.rows.map((r,ri)=>`<row r="${ri+1}">${r.map((v,ci)=>{
      if(v==null || v==="") return "";
      const ref=_bulkColRef(ci)+(ri+1), st=ri===0?' s="1"':"";
      // Números como número (excepto la fecha y los textos); todo lo demás, texto en línea.
      if(ri>0 && /^-?\d+(\.\d+)?$/.test(String(v)) && String(v).length<12) return `<c r="${ref}"${st}><v>${v}</v></c>`;
      return `<c r="${ref}" t="inlineStr"${st}><is><t xml:space="preserve">${_bulkXml(v)}</t></is></c>`;
    }).join("")}</row>`).join("");
    files.push({name:`xl/worksheets/sheet${si+1}.xml`, data:enc.encode(`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetData>${rows}</sheetData></worksheet>`)});
  });
  return _bulkZip(files);
}
function bulkExportXlsx(teamId){
  const teams = teamId ? [getTeam(teamId)].filter(Boolean)
    : DB.teams.filter(t=>!t.hidden && (t.players||[]).length).sort((a,b)=>a.commonName.localeCompare(b.commonName));
  if(!teams.length){ alert("No hay jugadores para exportar."); return; }
  const blob=bulkBuildXlsx(teams.map(t=>({name:t.commonName, rows:[bulkHeaderRow()].concat(bulkTeamOrder(t).map(p=>bulkExportRow(p,t)))})));
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  const hoy=new Date(); const f=hoy.getFullYear()+"-"+String(hoy.getMonth()+1).padStart(2,"0")+"-"+String(hoy.getDate()).padStart(2,"0");
  a.download = (teams.length===1 ? "jugadores-"+normLoose(teams[0].commonName).replace(/\s+/g,"-") : "jugadores-todas") + "-" + f + ".xlsx";
  document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  showToast(teams.length===1 ? `Exportados ${teams[0].players.length} jugadores de ${teams[0].commonName}` : `Exportadas ${teams.length} selecciones (una hoja por selección)`);
}

/* =====================================================================
   HOJA DE CÁLCULO DE JUGADORES
   ===================================================================== */
// Encabezados cortos de las 40 columnas (las posiciones: Pos 1, Val 1 … Pos 10, Val 10).
const SG_SHORT = ["Dorsal","Pos.","Nombre","Apellido","Nombre común","Nombre completo","Nacimiento","Estatura","Internac.","Goles","Club","Camiseta (sel.)","Camiseta (club)","Marca","Rating","Potencial","Pie izq.","Pie der."];
function sgIsRef(){ return !!(sgState && sgState.kind==="arb") || (!sgState && sgKind==="arb"); }
function sgN(){ return sgIsRef() ? REF_COLS.length : BULK_NCOLS; }
function sgHeadOf(ci){ return sgIsRef() ? REF_COLS[ci].short : sgHead(ci); }
function sgTitleOf(ci){ if(sgIsRef()){ const c=REF_COLS[ci]; return c.label+" — "+c.fmt; } const d=sgColDef(ci); return d.label+" — "+d.fmt; }
function sgWidthOf(ci){ return sgIsRef() ? REF_COLS[ci].w : sgWidth(ci); }
function sgHead(ci){ if(ci<18) return SG_SHORT[ci]; if(ci<38){ const j=Math.floor((ci-18)/2)+1; return ((ci-18)%2===0?"Pos ":"Val ")+j; } return ci===38?"Fav. sel.":"Fav. club"; }
function sgColDef(ci){ return BULK_COLS.find(c=>ci>=c.i && ci<c.i+(c.n||1)); }
const SG_W = [52,50,110,120,120,170,96,64,66,54,130,110,110,110,56,64,56,56];
function sgWidth(ci){ return ci<18 ? SG_W[ci] : (ci<38 ? ((ci-18)%2===0?52:42) : 84); }

// Estado: la hoja se arma al elegir selección y conserva los cambios hasta guardar o descartar.
var sgState = null;   // {kind:"jug"|"arb", teamId, rows:[{pid, cells[], orig[]}], sel:{r0,c0,r1,c1}|null}
var sgKind = "jug";   // hoja visible: jugadores o árbitros
function sgBuild(teamId){
  const team=getTeam(teamId); if(!team){ sgState=null; return; }
  const rows=bulkTeamOrder(team).map(p=>{ const c=bulkExportRow(p, team); return {pid:p.id, cells:c.slice(), orig:c.slice()}; });
  sgState={kind:"jug", teamId, rows, sel:null, anchor:null};
  sgAddBlank();
}
function sgBuildRef(){
  const rows=refSheetOrder().map(r=>{ const c=refExportRow(r); return {pid:r.id, cells:c.slice(), orig:c.slice()}; });
  sgState={kind:"arb", teamId:null, rows, sel:null, anchor:null};
  sgAddBlank();
}
function sgBlankRow(){ const c=new Array(sgN()).fill(""); return {pid:null, cells:c, orig:c.slice()}; }
// Siempre hay una fila vacía al final para agregar un jugador nuevo.
function sgAddBlank(){ const R=sgState.rows; if(!R.length || R[R.length-1].pid || R[R.length-1].cells.some(Boolean)) R.push(sgBlankRow()); }
function sgChanged(r,ci){ const x=sgState.rows[r]; return String(x.cells[ci]||"")!==String(x.orig[ci]||""); }
function sgChangeCount(){ let n=0; (sgState?sgState.rows:[]).forEach((x,r)=>{ if(x.cells.some((v,ci)=>sgChanged(r,ci))) n++; }); return n; }

// Validación de una celda con dato (vacía siempre es válida).
function sgValid(ci, v){
  if(sgIsRef()) return refValid(ci, v);
  v=String(v||"").trim(); if(!v) return true;
  const n=Number(v), int=/^-?\d+$/.test(v);
  switch(ci){
    case 0: return int && n>=1 && n<=99;
    case 1: return VALID_POS.includes(v.toUpperCase());
    case 6: return !!parseBirthDate(v);
    case 7: return int && n>=140 && n<=230;
    case 8: case 9: return int && n>=0;
    case 14: case 15: return int && n>=0 && n<=99;
    case 16: case 17: return int && n>=1 && n<=20;
    case 38: case 39: return /^\d{1,3}(\s*,\s*\d{1,3})*$/.test(v);
  }
  if(ci>=18 && ci<38){
    if((ci-18)%2===0){ const raw=v.toUpperCase(); const code=/^CB\s*[\(\-\s]?\s*[LR]\s*\)?$/.test(raw)?"CB":raw.replace(/[^A-Z]/g,""); return POS_CAT_OF[code]!==undefined; }
    return int && n>=0 && n<=20;
  }
  return true;
}
// Valor automático (gris) de las columnas que se calculan solas si se dejan vacías.
function sgAuto(r, ci){
  const x=sgState.rows[r];
  if(sgIsRef()){
    const lf=parseCommonNameCell(x.cells[2]).lastNameFirst;
    if(ci===3) return (lf ? x.cells[1]+" "+x.cells[0] : x.cells[0]+" "+x.cells[1]).trim();
    if(ci===10) return (x.cells[1] || parseCommonNameCell(x.cells[2]).commonName || "").toUpperCase();
    return "";
  }
  if(!x.pid) return "";
  const p=(getTeam(sgState.teamId).players||[]).find(q=>q.id===x.pid); if(!p) return "";
  if(ci===11 || ci===12){ const cn=parseCommonNameCell(x.cells[4]).commonName; return (cn || x.cells[3] || "").toUpperCase(); }
  if(ci===5){ const lf=parseCommonNameCell(x.cells[4]).lastNameFirst; return (lf ? x.cells[3]+" "+x.cells[2] : x.cells[2]+" "+x.cells[3]).trim(); }
  return "";
}

// ---- HTML ----
function bulkImportSectionHTML(){
  const teams = DB.teams.slice().filter(t=>!t.hidden).sort((a,b)=>a.commonName.localeCompare(b.commonName));
  const ref = sgKind==="arb";
  const tid = ref ? "" : ((sgState && sgState.kind==="jug" && sgState.teamId) || bulkImportTeamId || "");
  // Sin cambios pendientes, la hoja se vuelve a leer de la base (por si se editó algo en otro lado).
  if(ref){ if(!sgState || sgState.kind!=="arb" || !sgChangeCount()) sgBuildRef(); }
  else if(tid && (!sgState || sgState.kind!=="jug" || sgState.teamId!==tid || !sgChangeCount())) sgBuild(tid);
  else if(!tid && sgState && sgState.kind!=="jug") sgState=null;
  return `
  <div class="section-title"><h2>Jugadores y árbitros</h2><span class="hint">Hoja de cálculo con los datos del juego: escribe, pega o copia filas y columnas como en Excel</span></div>
  <div class="card sg-card">
    <div class="sg-bar">
      <div class="sg-seg"><button class="${ref?"":"on"}" data-action="sg-kind" data-k="jug">Jugadores</button><button class="${ref?"on":""}" data-action="sg-kind" data-k="arb">Árbitros</button></div>
      <select id="sg-team" style="${ref?"display:none;":""}"><option value="">— Elige una selección —</option>${teams.map(t=>`<option value="${t.id}" ${tid===t.id?"selected":""}>${escapeHtml(t.commonName)}</option>`).join("")}</select>
      <span class="sg-count" id="sg-count"></span>
      <span class="sg-sp"></span>
      <button class="btn ghost sm" data-action="sg-import">Importar Excel</button>
      <button class="btn ghost sm" data-action="sg-export" title="${ref?"Todos los árbitros":"La selección elegida, o todas (una hoja por selección) si no eliges una"}">Exportar Excel</button>
      <input type="file" id="sg-file" accept=".xlsx" style="display:none;">
    </div>
    <div class="sg-wrap" id="sg-wrap" tabindex="0">${sgTableHTML()}</div>
    <div class="sg-foot">
      <details class="bk-help"><summary>Columnas y valores aceptados</summary>
        <p>Para copiar o pegar una columna o fila completa, haz clic en su encabezado o en su número (Mayús+clic para varias) y usa Cmd/Ctrl+C o Cmd/Ctrl+V. Al pegar en una celda, el bloque se acomoda desde ahí hacia la derecha y hacia abajo; las filas de más se agregan como jugadores nuevos. Las celdas cambiadas se marcan; las que tienen un valor no válido, en rojo (no se guardan).</p>
        ${ref ? refColsListHTML() : bulkColsListHTML()}
      </details>
      <span class="sg-sp"></span>
      <button class="btn ghost" data-action="sg-discard">Descartar</button>
      <button class="btn gold" data-action="sg-save">Guardar cambios</button>
    </div>
  </div>`;
}
function sgTableHTML(){
  if(!sgState) return `<div class="sg-empty">Elige una selección para ver y editar sus jugadores.</div>`;
  const ref=sgState.kind==="arb";
  const team=ref ? null : getTeam(sgState.teamId);
  const pool=ref ? (DB.referees||[]) : (team.players||[]);
  const cols=[]; for(let ci=0;ci<sgN();ci++) cols.push(ci);
  const head=`<tr><th class="sg-corner" data-sg-all title="Seleccionar todo"></th><th class="sg-nmh">${ref?"Árbitro":"Jugador"}</th>${cols.map(ci=>`<th data-sg-col="${ci}" style="min-width:${sgWidthOf(ci)}px" title="${escapeHtml(sgTitleOf(ci))}">${escapeHtml(sgHeadOf(ci))}</th>`).join("")}</tr>`;
  const body=sgState.rows.map((x,r)=>{
    const p=x.pid ? pool.find(q=>q.id===x.pid) : null;
    const nm=p ? playerDisplayName(p) : (ref?"Nuevo árbitro":"Nuevo jugador");
    return `<tr data-r="${r}"><th class="sg-rh" data-sg-row="${r}">${r+1}</th><td class="sg-nm ${p?"":"nuevo"}" title="${escapeHtml(nm)}">${escapeHtml(nm)}</td>${cols.map(ci=>`<td class="${sgCellCls(r,ci)}"><input class="sg-in" data-r="${r}" data-c="${ci}" value="${escapeHtml(x.cells[ci]||"")}" placeholder="${escapeHtml(sgAuto(r,ci))}" spellcheck="false" autocomplete="off"></td>`).join("")}</tr>`;
  }).join("");
  return `<table class="sg-tbl"><thead>${head}</thead><tbody>${body}</tbody></table>`;
}
function sgCellCls(r,ci){
  const v=sgState.rows[r].cells[ci]; const s=sgState.sel; let k="";
  if(sgChanged(r,ci)) k+=" ch";
  if(!sgValid(ci,v)) k+=" bad";
  if(s && r>=Math.min(s.r0,s.r1) && r<=Math.max(s.r0,s.r1) && ci>=Math.min(s.c0,s.c1) && ci<=Math.max(s.c0,s.c1)) k+=" sel";
  return k.trim();
}
function sgRender(keepFocus){
  const w=document.getElementById("sg-wrap"); if(!w) return;
  const ae=document.activeElement; const fr=ae&&ae.classList&&ae.classList.contains("sg-in") ? [ae.dataset.r, ae.dataset.c, ae.selectionStart] : null;
  const sl=w.scrollLeft, st=w.scrollTop;
  w.innerHTML=sgTableHTML(); w.scrollLeft=sl; w.scrollTop=st;
  if(keepFocus && fr){ const n=w.querySelector(`.sg-in[data-r="${fr[0]}"][data-c="${fr[1]}"]`); if(n){ n.focus(); try{ n.setSelectionRange(fr[2],fr[2]); }catch(e){} } }
  sgUpdateCount();
}
function sgUpdateCount(){ const c=document.getElementById("sg-count"); if(c){ const n=sgChangeCount(); c.textContent = n ? `${n} jugador(es) con cambios sin guardar` : ""; } }
function sgRefreshCell(r,ci){ const inp=document.querySelector(`#sg-wrap .sg-in[data-r="${r}"][data-c="${ci}"]`); if(inp) inp.parentNode.className=sgCellCls(r,ci); }

// ---- Pegar un bloque (TSV) desde (r,c) ----
function sgParseTSV(txt){
  let lines=String(txt||"").replace(/\r\n?/g,"\n").split("\n");
  if(lines.length>1 && lines[lines.length-1]==="") lines.pop();
  return lines.map(l=>l.split("\t"));
}
function sgPaste(r0, c0, txt){
  const M=sgParseTSV(txt); if(!M.length) return;
  M.forEach((row,i)=>{
    const r=r0+i;
    while(sgState.rows.length<=r) sgState.rows.push(sgBlankRow());
    row.forEach((v,j)=>{ const ci=c0+j; if(ci<sgN()) sgState.rows[r].cells[ci]=String(v).trim(); });
  });
  sgAddBlank();
  sgState.sel={r0, c0, r1:r0+M.length-1, c1:Math.min(sgN()-1, c0+Math.max(...M.map(x=>x.length))-1)};
  sgRender(false);
}
function sgSelTSV(){
  const s=sgState&&sgState.sel; if(!s) return "";
  const r0=Math.min(s.r0,s.r1), r1=Math.max(s.r0,s.r1), c0=Math.min(s.c0,s.c1), c1=Math.max(s.c0,s.c1);
  const out=[]; for(let r=r0;r<=r1;r++){ const x=sgState.rows[r]; if(!x) continue; out.push(x.cells.slice(c0,c1+1).join("\t")); }
  return out.join("\n");
}

// ---- Guardar ----
function sgClearCol(p, key){
  switch(key){
    case "dorsal": p.number=null; p.numberUnassigned=true; return;
    case "comun": p.commonName=""; p.lastNameFirst=false; return;
    case "completo": p.fullNameLinked=true; return;
    case "fecha": p.birthDate=null; return;
    case "estatura": p.height=null; return;
    case "caps": p.caps=null; return;
    case "goles": p.goalsNational=null; return;
    case "club": p.club=""; return;
    case "camsel": p.shirtNameTeam=""; p.shirtNameTeamLinked=true; return;
    case "camclub": p.shirtNameClub=""; p.shirtNameClubLinked=true; return;
    case "marca": p.brand=null; p.gloveBrand=null; return;
    case "pieizq": p.footLeft=null; return;
    case "pieder": p.footRight=null; return;
    case "posiciones": p.positions={}; p.cbSide=null; return;
    case "favsel": p.favNumbersTeam=[]; return;
    case "favclub": p.favNumbersClub=[]; return;
  }
}
function sgApplyRow(p, x, onlyChanged){
  BULK_COLS.forEach(col=>{
    const idx=[]; for(let q=0;q<(col.n||1);q++) idx.push(col.i+q);
    if(onlyChanged && !idx.some(ci=>String(x.cells[ci]||"")!==String(x.orig[ci]||""))) return;
    const c=x.cells.map((v,ci)=> idx.indexOf(ci)>=0 && sgValid(ci,v) ? v : (idx.indexOf(ci)>=0 ? "" : v));
    if(idx.every(ci=>!String(c[ci]||"").trim())){ if(onlyChanged) sgClearCol(p, col.key); return; }
    if(col.key==="comun"){ const cn=parseCommonNameCell(c[4]); p.commonName=cn.commonName; p.lastNameFirst=cn.lastNameFirst; return; }
    if(col.key==="posiciones"){ p.positions={}; p.cbSide=null; }
    bulkApplyCol(p, col.key, c);
  });
  if(p.fullNameLinked!==false || !p.fullName) { p.fullName=computeDefaultFullName(p); p.fullNameLinked=true; }
}
function sgSave(){
  if(!sgState){ return; }
  if(sgState.kind==="arb") return refSave();
  const team=getTeam(sgState.teamId); if(!team) return;
  let upd=0, created=0, bad=0, faltan=0;
  const teamCountry=(DB.countries||[]).find(c=>c.teamLinks && c.teamLinks.absoluta===team.id);
  sgState.rows.forEach((x,r)=>{
    x.cells.forEach((v,ci)=>{ if(sgChanged(r,ci) && !sgValid(ci,v)) bad++; });
    if(x.pid){
      if(!x.cells.some((v,ci)=>sgChanged(r,ci))) return;
      const p=team.players.find(q=>q.id===x.pid); if(!p) return;
      sgApplyRow(p, x, true); upd++;
    } else {
      if(!x.cells.some(Boolean)) return;
      const cn=parseCommonNameCell(x.cells[4]);
      if(!String(x.cells[3]||"").trim() && !cn.commonName){ faltan++; return; }
      const p={ id:newId("p"), firstName:"", lastName:"", commonName:"", lastNameFirst:false, fullName:"", fullNameLinked:true,
        pos:"MF", number:null, numberUnassigned:true, birthDate:null, height:null, club:"", rating:70, ratingPotential:null, brand:null, gloveBrand:null,
        nationalityIds: teamCountry?[teamCountry.id]:[], declaredForCountryId: teamCountry?teamCountry.id:null,
        photo:null, caps:null, goalsNational:null, footLeft:null, footRight:null, positions:{}, cbSide:null,
        favNumbersTeam:[], favNumbersClub:[], shirtNameTeam:"", shirtNameClub:"", shirtNameTeamLinked:true, shirtNameClubLinked:true };
      sgApplyRow(p, x, false);
      team.players.push(p); created++;
    }
  });
  if(!upd && !created){ showToast(faltan ? "Las filas nuevas necesitan al menos Apellido o Nombre común" : "No hay cambios que guardar"); return; }
  if(typeof invalidateClubPlayerIndex==="function") invalidateClubPlayerIndex();
  persist();
  sgBuild(team.id); render();
  showToast(`${team.commonName}: ${upd} actualizado(s)`+(created?`, ${created} nuevo(s)`:"")+(bad?` · ${bad} celda(s) no válida(s) sin guardar`:"")+(faltan?` · ${faltan} fila(s) nueva(s) sin apellido`:""));
}

// ---- Importar un .xlsx a la hoja (no se guarda hasta «Guardar cambios») ----
async function _sgInflate(bytes){
  const ds=new DecompressionStream("deflate-raw");
  const buf=await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer();
  return new Uint8Array(buf);
}
async function sgReadZip(buf){
  const u=new Uint8Array(buf), dv=new DataView(buf); const out={};
  let e=-1; for(let i=u.length-22;i>=0;i--){ if(dv.getUint32(i,true)===0x06054b50){ e=i; break; } }
  if(e<0) throw new Error("No es un archivo .xlsx válido");
  const n=dv.getUint16(e+10,true); let off=dv.getUint32(e+16,true);
  const dec=new TextDecoder();
  for(let k=0;k<n;k++){
    const method=dv.getUint16(off+10,true), csize=dv.getUint32(off+20,true), nl=dv.getUint16(off+28,true), xl=dv.getUint16(off+30,true), cl=dv.getUint16(off+32,true), lo=dv.getUint32(off+42,true);
    const name=dec.decode(u.subarray(off+46, off+46+nl));
    const lnl=dv.getUint16(lo+26,true), lxl=dv.getUint16(lo+28,true);
    const data=u.subarray(lo+30+lnl+lxl, lo+30+lnl+lxl+csize);
    out[name]={method, data};
    off+=46+nl+xl+cl;
  }
  const get=async nm=>{ const f=out[nm]; if(!f) return null; const b=f.method===0?f.data:await _sgInflate(f.data); return dec.decode(b); };
  return get;
}
function _sgCellIdx(ref){ const m=/^([A-Z]+)(\d+)$/.exec(ref); if(!m) return [0,0]; let c=0; for(const ch of m[1]) c=c*26+(ch.charCodeAt(0)-64); return [parseInt(m[2],10)-1, c-1]; }
async function sgReadXlsx(file, teamName, dateCol){
  if(dateCol===undefined) dateCol=6;
  const get=await sgReadZip(await file.arrayBuffer());
  const P=new DOMParser(); const X=s=>P.parseFromString(s,"application/xml");
  const wb=X(await get("xl/workbook.xml")); const rels=X(await get("xl/_rels/workbook.xml.rels")||"<r/>");
  const sheets=[...wb.getElementsByTagName("sheet")].map(s=>({name:s.getAttribute("name"), rid:s.getAttribute("r:id")||s.getAttributeNS("http://schemas.openxmlformats.org/officeDocument/2006/relationships","id")}));
  const target=rid=>{ const r=[...rels.getElementsByTagName("Relationship")].find(x=>x.getAttribute("Id")===rid); let t=r?r.getAttribute("Target"):""; t=t.replace(/^\//,""); return t.startsWith("xl/")?t:"xl/"+t; };
  let sh=sheets.find(s=>normLoose(s.name)===normLoose(teamName)) || (teamName==="Árbitros" ? sheets.find(s=>/arbitr/.test(normLoose(s.name))) : null) || sheets[0];
  if(!sh) throw new Error("El archivo no tiene hojas");
  const ssx=await get("xl/sharedStrings.xml"); const ss=ssx ? [...X(ssx).getElementsByTagName("si")].map(si=>[...si.getElementsByTagName("t")].map(t=>t.textContent).join("")) : [];
  const doc=X(await get(target(sh.rid)));
  const rows=[];
  [...doc.getElementsByTagName("c")].forEach(c=>{
    const [r,ci]=_sgCellIdx(c.getAttribute("r")||""); if(ci>=sgN()) return;
    const t=c.getAttribute("t"); let v="";
    if(t==="inlineStr"){ v=[...c.getElementsByTagName("t")].map(x=>x.textContent).join(""); }
    else { const vn=c.getElementsByTagName("v")[0]; v=vn?vn.textContent:""; if(t==="s") v=ss[parseInt(v,10)]||""; }
    // Fecha guardada como número de serie de Excel → AAAA-MM-DD.
    if(ci===dateCol && t!=="s" && t!=="inlineStr" && /^\d{4,6}(\.\d+)?$/.test(v)){ const d=new Date(Date.UTC(1899,11,30)+Math.floor(+v)*86400000); v=d.toISOString().slice(0,10); }
    (rows[r]=rows[r]||new Array(sgN()).fill(""))[ci]=String(v).trim();
  });
  return {sheet:sh.name, rows:rows.filter(Boolean)};
}
// Empareja las filas del archivo con las de la hoja (Dorsal+Apellido, Nombre+Apellido o Nombre común).
function sgMergeImport(rows){
  if(sgState.kind==="arb") return refMergeImport(rows);
  let data=rows.slice(); if(data.length && bulkIsHeader(data[0].join("\t"))) data=data.slice(1);
  let match=0, nuevos=0;
  data.forEach(c=>{
    if(!c.some(Boolean)) return;
    const ln=normLoose(c[3]), fn=normLoose(c[2]), cn=normLoose(parseCommonNameCell(c[4]).commonName), d=String(c[0]||"").trim();
    let r=sgState.rows.findIndex(x=>{ if(!x.pid) return false; const o=x.orig;
      if(ln && normLoose(o[3])===ln && ((d && o[0]===d) || (fn && normLoose(o[2])===fn))) return true;
      // Nombre y apellido intercambiados (Zhou Fei = Fei Zhou).
      if(ln && fn && normLoose(o[2])===ln && normLoose(o[3])===fn) return true;
      return !!(cn && normLoose(parseCommonNameCell(o[4]).commonName)===cn);
    });
    if(r<0){ const R=sgState.rows; if(R.length && !R[R.length-1].pid && !R[R.length-1].cells.some(Boolean)) R.pop(); R.push(sgBlankRow()); r=R.length-1; nuevos++; } else match++;
    c.forEach((v,ci)=>{ if(String(v||"").trim()) sgState.rows[r].cells[ci]=String(v).trim(); });
  });
  sgAddBlank();
  return {match, nuevos};
}

// ---- Eventos ----
document.addEventListener("change", async e=>{
  const t=e.target; if(!t) return;
  if(t.id==="sg-team"){
    const go=()=>{ bulkImportTeamId=t.value; if(t.value) sgBuild(t.value); else sgState=null; sgRender(false); };
    if(sgState && sgChangeCount()){ const prev=sgState.teamId; modalConfirm("Hay cambios sin guardar en esta selección. ¿Descartarlos?", go, "Descartar"); t.value=prev; return; }
    go();
  } else if(t.id==="sg-file" && t.files && t.files[0]){
    const f=t.files[0]; t.value="";
    if(!sgState){ alert("Elige primero la selección."); return; }
    try{
      const res = sgState.kind==="arb" ? await sgReadXlsx(f, "Árbitros", 4) : await sgReadXlsx(f, getTeam(sgState.teamId).commonName);
      const m=sgMergeImport(res.rows); sgRender(false);
      showToast(`Hoja «${res.sheet}»: ${m.match} jugador(es) emparejado(s)`+(m.nuevos?`, ${m.nuevos} nuevo(s)`:"")+". Revisa y presiona Guardar cambios.");
    }catch(err){ alert("No se pudo leer el archivo: "+(err&&err.message||err)); }
  }
});
document.addEventListener("input", e=>{
  const t=e.target; if(!t || !t.classList || !t.classList.contains("sg-in") || !sgState) return;
  const r=+t.dataset.r, ci=+t.dataset.c; sgState.rows[r].cells[ci]=t.value;
  sgRefreshCell(r,ci); sgUpdateCount();
  if(!sgState.rows[r].pid && r===sgState.rows.length-1 && t.value){ sgAddBlank(); sgRender(true); }
});
document.addEventListener("paste", e=>{
  if(!sgState) return;
  const t=e.target; const w=document.getElementById("sg-wrap"); if(!w || !w.contains(t)) return;
  const txt=(e.clipboardData||window.clipboardData).getData("text");
  let r0, c0;
  if(t.classList && t.classList.contains("sg-in")){
    if(!/[\t\n]/.test(txt.replace(/\n$/,"")) && !sgState.sel) return;   // un solo valor: pegado normal en la celda
    r0=+t.dataset.r; c0=+t.dataset.c;
  } else if(sgState.sel){ r0=Math.min(sgState.sel.r0,sgState.sel.r1); c0=Math.min(sgState.sel.c0,sgState.sel.c1); }
  else return;
  e.preventDefault(); sgPaste(r0, c0, txt);
});
document.addEventListener("copy", e=>{
  if(!sgState || !sgState.sel) return;
  const w=document.getElementById("sg-wrap"); if(!w || document.activeElement!==w) return;
  e.clipboardData.setData("text/plain", sgSelTSV()); e.preventDefault();
  showToast("Copiado: pégalo en Excel");
});
document.addEventListener("mousedown", e=>{
  const t=e.target; if(!sgState || !t || !t.closest) return;
  const w=document.getElementById("sg-wrap"); if(!w || !w.contains(t)) return;
  const col=t.closest("[data-sg-col]"), row=t.closest("[data-sg-row]"), all=t.closest("[data-sg-all]");
  if(!col && !row && !all){ if(t.classList.contains("sg-in") && sgState.sel){ sgState.sel=null; sgRender(false); setTimeout(()=>{ const n=w.querySelector(`.sg-in[data-r="${t.dataset.r}"][data-c="${t.dataset.c}"]`); if(n) n.focus(); },0); } return; }
  e.preventDefault();
  const last=sgState.rows.length-1;
  const NC=sgN();
  if(all) sgState.sel={r0:0,c0:0,r1:last,c1:NC-1};
  else if(col){ const c=+col.dataset.sgCol; const a=(e.shiftKey && sgState.sel && sgState.sel.r0===0 && sgState.sel.r1===last) ? sgState.sel.c0 : c; sgState.sel={r0:0,r1:last,c0:a,c1:c}; }
  else { const r=+row.dataset.sgRow; const a=(e.shiftKey && sgState.sel && sgState.sel.c0===0 && sgState.sel.c1===NC-1) ? sgState.sel.r0 : r; sgState.sel={c0:0,c1:NC-1,r0:a,r1:r}; }
  sgRender(false); w.focus();
});
document.addEventListener("keydown", e=>{
  if(!sgState) return;
  const t=e.target; const w=document.getElementById("sg-wrap"); if(!w || !w.contains(t)) return;
  if(t===w && sgState.sel && (e.key==="Delete" || e.key==="Backspace")){
    const s=sgState.sel; for(let r=Math.min(s.r0,s.r1);r<=Math.max(s.r0,s.r1);r++) for(let ci=Math.min(s.c0,s.c1);ci<=Math.max(s.c0,s.c1);ci++) if(sgState.rows[r]) sgState.rows[r].cells[ci]="";
    e.preventDefault(); sgRender(false); w.focus(); return;
  }
  if(t===w && e.key==="Escape"){ sgState.sel=null; sgRender(false); return; }
  if(!t.classList.contains("sg-in")) return;
  const r=+t.dataset.r, ci=+t.dataset.c; let nr=r, nc=ci;
  if(e.key==="Enter" || e.key==="ArrowDown") nr=r+1; else if(e.key==="ArrowUp") nr=r-1;
  else if(e.key==="ArrowRight" && t.selectionStart===t.value.length) nc=ci+1;
  else if(e.key==="ArrowLeft" && t.selectionStart===0) nc=ci-1;
  else return;
  const n=w.querySelector(`.sg-in[data-r="${nr}"][data-c="${nc}"]`); if(n){ e.preventDefault(); n.focus(); n.select(); }
});
window.addEventListener("beforeunload", e=>{ if(sgState && sgChangeCount()){ e.preventDefault(); e.returnValue=""; } });

// ---- Estilos ----
(function(){ try{
  const css=`
.sg-card{padding:12px;}
.sg-bar{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:10px;}
.sg-bar select{min-width:220px;width:auto;max-width:320px;}
.sg-sp{flex:1;}
.sg-seg{display:inline-flex;background:var(--surface-2,#242837);border:1px solid var(--line);border-radius:10px;padding:3px;gap:2px;}
.sg-seg button{border:0;background:transparent;color:var(--muted);font-weight:600;font-size:12px;padding:5px 12px;border-radius:7px;cursor:pointer;}
.sg-seg button.on{background:var(--indigo,#6D63F5);color:#fff;}
.sg-count{font-size:12px;color:var(--amber,#F5C842);}
.sg-wrap{max-height:560px;overflow:auto;border:1px solid var(--line);border-radius:10px;outline:none;}
.sg-wrap:focus{box-shadow:0 0 0 2px rgba(109,99,245,.45);}
.sg-empty{padding:28px;text-align:center;color:var(--muted);font-size:13px;}
.sg-tbl{border-collapse:separate;border-spacing:0;font-size:12px;width:max-content;}
.sg-tbl th,.sg-tbl td{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:0;white-space:nowrap;}
.sg-tbl thead th{position:sticky;top:0;z-index:2;background:var(--surface-2,#242837);color:var(--muted);font-weight:600;font-size:11px;padding:6px 6px;text-align:left;cursor:pointer;user-select:none;}
.sg-tbl thead th:hover{color:var(--ink);}
.sg-tbl .sg-corner{left:0;z-index:4;min-width:34px;}
.sg-tbl .sg-nmh{left:34px;z-index:4;min-width:150px;cursor:default;}
.sg-tbl .sg-rh{position:sticky;left:0;z-index:1;background:var(--surface-2,#242837);color:var(--muted);font-weight:500;font-size:11px;text-align:center;min-width:34px;cursor:pointer;user-select:none;}
.sg-tbl .sg-nm{position:sticky;left:34px;z-index:1;background:var(--surface,#1A1D27);padding:0 8px;max-width:150px;min-width:150px;overflow:hidden;text-overflow:ellipsis;font-weight:600;color:var(--ink);}
.sg-tbl .sg-nm.nuevo{color:var(--muted);font-weight:400;font-style:italic;}
.sg-in{width:100%;min-width:100%;box-sizing:border-box;background:transparent;border:0;color:var(--ink);font:inherit;padding:5px 6px;outline:none;}
.sg-in::placeholder{color:var(--muted);opacity:.55;}
.sg-in:focus{background:rgba(109,99,245,.18);box-shadow:inset 0 0 0 2px var(--indigo,#6D63F5);}
.sg-tbl td.ch{background:rgba(245,200,66,.12);}
.sg-tbl td.bad{background:rgba(255,107,106,.22);}
.sg-tbl td.bad .sg-in{color:var(--danger,#FF6B6A);}
.sg-tbl td.sel{background:rgba(109,99,245,.22);}
.sg-foot{display:flex;align-items:flex-start;gap:8px;margin-top:10px;flex-wrap:wrap;}
.sg-foot .bk-help{flex:1 1 420px;font-size:12.5px;color:var(--muted);}
.sg-foot .bk-help summary{cursor:pointer;color:var(--ink);font-weight:600;}
.sg-foot .bk-help p{margin:8px 0 6px;line-height:1.5;}
.bk-cols{margin:0;padding-left:26px;columns:2 340px;column-gap:28px;font-size:12px;line-height:1.55;}
.bk-cols li{break-inside:avoid;margin-bottom:3px;}
.bk-cols b{color:var(--ink);font-weight:600;}
.bk-cr{opacity:.75;}`;
  const st=document.createElement("style"); st.id="sg-css"; st.textContent=css; document.head.appendChild(st);
}catch(e){} })();

/* =====================================================================
   HOJA DE ÁRBITROS (mismas reglas que la de jugadores)
   ===================================================================== */
const REF_COLS = [
  {key:"nombre",   short:"Nombre",           label:"Nombre",                         fmt:"texto", w:110},
  {key:"apellido", short:"Apellido",         label:"Apellido",                       fmt:"texto", w:120},
  {key:"comun",    short:"Nombre común",     label:"Nombre común",                   fmt:"texto (opcional); «[Apellido primero]» = el nombre se escribe Apellido + Nombre", w:130},
  {key:"completo", short:"Nombre completo",  label:"Nombre completo",                fmt:"texto (vacío = Nombre + Apellido)", w:170},
  {key:"fecha",    short:"Nacimiento",       label:"Fecha de nacimiento",            fmt:"1985-05-12 · 14/01/1985 · April 9, 1985", w:96},
  {key:"genero",   short:"Género",           label:"Género",                         fmt:"", w:90},
  {key:"nac",      short:"Nacionalidad",     label:"Nacionalidad",                   fmt:"país o países separados por coma", w:130},
  {key:"rep",      short:"Representa",       label:"País que representa",            fmt:"un país (se agrega a sus nacionalidades si no está)", w:120},
  {key:"trabaja",  short:"Trabaja en",       label:"Países donde trabaja",           fmt:"países separados por coma", w:140},
  {key:"rol",      short:"Rol",              label:"Rol",                            fmt:"", w:150},
  {key:"camiseta", short:"Camiseta",         label:"Nombre en camiseta (árbitro)",   fmt:"texto (vacío = el apellido en mayúsculas)", w:110},
  {key:"fifa",     short:"FIFA desde",       label:"Internacional FIFA desde (año)", fmt:"año", w:76},
  {key:"mundiales",short:"Mundiales",        label:"Copas del Mundo anteriores",     fmt:"años separados por coma (ej. 2018, 2022)", w:110},
  {key:"partidos", short:"Partidos",         label:"Partidos en los que participa",  fmt:"números de partido 1–104 separados por coma", w:130}
];
(function(){ try{
  REF_COLS[5].fmt = ((typeof REFEREE_GENDERS!=="undefined" && REFEREE_GENDERS) || ["Masculino","Femenino"]).join(" o ");
  REF_COLS[9].fmt = ((typeof REFEREE_ROLES!=="undefined" && REFEREE_ROLES) || []).join(" · ") + " (también: Central, Asistente, VAR)";
}catch(e){} })();
function refColsListHTML(){
  return `<ol class="bk-cols">${REF_COLS.map((c,i)=>`<li value="${i+1}"><b>${escapeHtml(c.label)}</b> — <span>${escapeHtml(c.fmt)}</span></li>`).join("")}</ol>`;
}
function refSheetOrder(){ return (DB.referees||[]).slice().sort((a,b)=>String(playerSortName(a)).localeCompare(String(playerSortName(b)),"es")); }
function refCountryName(id){ const c=(DB.countries||[]).find(x=>x.id===id); return c ? (c.commonName||c.name||"") : ""; }
function refExportRow(r){
  const auto=(r.lastNameFirst ? `${r.lastName||""} ${r.firstName||""}` : `${r.firstName||""} ${r.lastName||""}`).trim();
  const shirtAuto=String(r.lastName||r.commonName||r.firstName||"").toUpperCase();
  return [
    r.firstName||"", r.lastName||"",
    ((r.lastNameFirst?APELLIDO_PRIMERO_TAG+" ":"")+(r.commonName||"")).trim(),
    (r.fullName && r.fullName.trim()!==auto) ? r.fullName.trim() : "",
    r.birthDate||"", r.gender||"",
    (r.nationalityIds||[]).map(refCountryName).filter(Boolean).join(", "),
    r.countryRepresentsId ? refCountryName(r.countryRepresentsId) : "",
    (r.countryWorksIds||[]).map(refCountryName).filter(Boolean).join(", "),
    r.role||"",
    (r.shirtName && !r.shirtNameLinked && r.shirtName.trim().toUpperCase()!==shirtAuto) ? r.shirtName : "",
    r.fifaSince!=null ? String(r.fifaSince) : "",
    (r.previousWorldCups||[]).join(", "),
    (r.matches||[]).join(", ")
  ];
}
function refRoleOf(v){
  const k=normLoose(v); if(!k) return null;
  const R=(typeof REFEREE_ROLES!=="undefined") ? REFEREE_ROLES : [];
  const exact=R.find(x=>normLoose(x)===k); if(exact) return exact;
  if(/var|video/.test(k)) return R[2]||null;
  if(/asist/.test(k)) return R[1]||null;
  if(/central|principal|arbitro/.test(k)) return R[0]||null;
  return null;
}
function refGenderOf(v){ const k=normLoose(v); if(!k) return null; const G=(typeof REFEREE_GENDERS!=="undefined") ? REFEREE_GENDERS : ["Masculino","Femenino"]; return G.find(g=>normLoose(g)===k) || G.find(g=>normLoose(g).charAt(0)===k.charAt(0)) || null; }
function refValid(ci, v){
  v=String(v||"").trim(); if(!v) return true;
  switch(ci){
    case 4: return !!parseBirthDate(v);
    case 5: return !!refGenderOf(v);
    case 9: return !!refRoleOf(v);
    case 11: return /^\d{4}$/.test(v) && +v>=1900 && +v<=2100;
    case 12: return /^\d{4}(\s*,\s*\d{4})*$/.test(v);
    case 13: return /^\d{1,3}(\s*,\s*\d{1,3})*$/.test(v) && v.split(",").every(x=>+x>=1 && +x<=104);
  }
  return true;
}
function refCountries(v){ return [...new Set(String(v||"").split(",").map(x=>x.trim()).filter(Boolean).map(n=>findOrCreateCountryByName(n)).filter(Boolean))]; }
// Aplica las columnas (solo las cambiadas si onlyChanged) de la fila x al árbitro r. Vacía = se borra el dato.
function refApplyRow(r, x, onlyChanged){
  REF_COLS.forEach((col,ci)=>{
    const v=String(x.cells[ci]||"").trim();
    if(onlyChanged && v===String(x.orig[ci]||"").trim()) return;
    if(!refValid(ci, v)) return;
    switch(col.key){
      case "nombre": if(v) r.firstName=v; break;
      case "apellido": if(v) r.lastName=v; break;
      case "comun": { const cn=parseCommonNameCell(v); r.commonName=cn.commonName; r.lastNameFirst=cn.lastNameFirst; break; }
      case "completo": if(v){ r.fullName=v; r.fullNameLinked=false; } else r.fullNameLinked=true; break;
      case "fecha": r.birthDate = v ? parseBirthDate(v) : null; break;
      case "genero": if(v) r.gender=refGenderOf(v); break;
      case "nac": r.nationalityIds = refCountries(v); break;
      case "rep": r.countryRepresentsId = v ? (refCountries(v)[0]||null) : null; break;
      case "trabaja": r.countryWorksIds = refCountries(v); break;
      case "rol": if(v) r.role=refRoleOf(v); break;
      case "camiseta": if(v){ r.shirtName=v; r.shirtNameLinked=false; } else { r.shirtNameLinked=true; r.shirtName=""; } break;
      case "fifa": r.fifaSince = v ? parseInt(v,10) : null; break;
      case "mundiales": r.previousWorldCups = v ? v.split(",").map(y=>y.trim()).filter(Boolean) : []; break;
      case "partidos": r.matches = v ? [...new Set(v.split(",").map(n=>parseInt(n,10)).filter(n=>n>=1&&n<=104))].sort((a,b)=>a-b) : []; break;
    }
  });
  // El país que representa debe ser una de sus nacionalidades.
  if(r.countryRepresentsId && !(r.nationalityIds||[]).includes(r.countryRepresentsId)) r.nationalityIds=(r.nationalityIds||[]).concat([r.countryRepresentsId]);
  if(r.fullNameLinked!==false || !r.fullName){ r.fullName=(r.lastNameFirst ? `${r.lastName||""} ${r.firstName||""}` : `${r.firstName||""} ${r.lastName||""}`).trim(); r.fullNameLinked=true; }
  if(r.shirtNameLinked!==false || !r.shirtName) r.shirtName=String(r.lastName||r.commonName||r.firstName||"").toUpperCase();
}
function refSave(){
  if(!Array.isArray(DB.referees)) DB.referees=[];
  let upd=0, created=0, bad=0, faltan=0;
  sgState.rows.forEach((x,ri)=>{
    x.cells.forEach((v,ci)=>{ if(sgChanged(ri,ci) && !refValid(ci,v)) bad++; });
    if(x.pid){
      if(!x.cells.some((v,ci)=>sgChanged(ri,ci))) return;
      const r=DB.referees.find(q=>q.id===x.pid); if(!r) return;
      refApplyRow(r, x, true); upd++;
    } else {
      if(!x.cells.some(Boolean)) return;
      if(!String(x.cells[1]||"").trim() && !parseCommonNameCell(x.cells[2]).commonName){ faltan++; return; }
      const r={ id:newId("ref"), firstName:"", lastName:"", commonName:"", lastNameFirst:false, fullName:"", fullNameLinked:true, birthDate:null,
        gender:"Masculino", nationalityIds:[], countryRepresentsId:null, countryWorksIds:[], role:(typeof REFEREE_ROLES!=="undefined"?REFEREE_ROLES[0]:"Árbitro central"),
        fifaSince:null, previousWorldCups:[], shirtName:"", shirtNameLinked:true, matches:[], photo:null };
      refApplyRow(r, x, false);
      DB.referees.push(r); created++;
    }
  });
  if(!upd && !created){ showToast(faltan ? "Las filas nuevas necesitan al menos Apellido o Nombre común" : "No hay cambios que guardar"); return; }
  persist(); sgBuildRef(); render();
  showToast(`Árbitros: ${upd} actualizado(s)`+(created?`, ${created} nuevo(s)`:"")+(bad?` · ${bad} celda(s) no válida(s) sin guardar`:"")+(faltan?` · ${faltan} fila(s) nueva(s) sin apellido`:""));
}
// Importar: empareja por nombre (en cualquier orden: Zhou Fei = Fei Zhou); los que no coinciden, nuevos.
function refMergeImport(rows){
  let data=rows.slice();
  if(data.length && /(nombre|apellido|nacimiento|genero|género|rol|camiseta|partidos)/i.test(data[0].join(" ")) && !parseBirthDate(data[0][4]||"")) data=data.slice(1);
  let match=0, nuevos=0;
  data.forEach(c=>{
    if(!c.some(Boolean)) return;
    const cn=parseCommonNameCell(c[2]);
    const keys=[ `${c[0]||""} ${c[1]||""}`, `${c[1]||""} ${c[0]||""}`, c[3]||"", cn.commonName ].map(k=>normLoose(k)).filter(Boolean);
    const cand=sgState.rows.map((x,i)=>({x,i})).filter(o=>{ if(!o.x.pid) return false; const r=(DB.referees||[]).find(q=>q.id===o.x.pid); return r && personNameForms(r).some(f=>keys.indexOf(f)>=0); });
    let ri;
    if(cand.length===1){ ri=cand[0].i; match++; }
    else { const R=sgState.rows; if(R.length && !R[R.length-1].pid && !R[R.length-1].cells.some(Boolean)) R.pop(); R.push(sgBlankRow()); ri=R.length-1; nuevos++; }
    c.forEach((v,ci)=>{ if(ci<REF_COLS.length && String(v||"").trim()) sgState.rows[ri].cells[ci]=String(v).trim(); });
  });
  sgAddBlank();
  return {match, nuevos};
}
function refExportXlsx(){
  const list=refSheetOrder(); if(!list.length){ alert("No hay árbitros para exportar."); return; }
  const blob=bulkBuildXlsx([{name:"Árbitros", rows:[REF_COLS.map(c=>c.label)].concat(list.map(refExportRow))}]);
  const a=document.createElement("a"); a.href=URL.createObjectURL(blob);
  const hoy=new Date(); const f=hoy.getFullYear()+"-"+String(hoy.getMonth()+1).padStart(2,"0")+"-"+String(hoy.getDate()).padStart(2,"0");
  a.download="arbitros-"+f+".xlsx"; document.body.appendChild(a); a.click(); setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 1500);
  showToast(`Exportados ${list.length} árbitros`);
}
