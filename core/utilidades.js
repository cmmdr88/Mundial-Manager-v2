/* =========================================================
   COPA MANAGER 2026 — core/utilidades.js
   Funciones utilitarias sin estado + contadores de ID (dueño único).
   Extracción mecánica: texto y orden idénticos al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (usa CUSTOM_COLORS/PALETTES) y ANTES del <script> inline.
   ========================================================= */

function colorsFor(name, conf){ return CUSTOM_COLORS[name] || PALETTES[conf] || ["#3C4A42","#1F2A24"]; }

function stripDiacritics(text){
  return (text||"").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function initials(name){
  return name.replace("Países Bajos","NED").replace("Estados Unidos","USA").replace("Corea del Sur","KOR")
    .replace("Arabia Saudita","KSA").replace("Costa de Marfil","CIV").replace("Nueva Zelanda","NZL")
    .replace("República Democrática del Congo","COD").split(" ").map(w=>w[0]).join("").slice(0,3).toUpperCase();
}

function isoDate(y,mo,d){
  if(!y||!mo||!d) return null;
  return `${y}-${String(mo).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function normLoose(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
    .replace(/[.\-_'`´]/g,"").replace(/\s+/g," ").trim();
}

function newClubId(){ return "cl_" + Math.random().toString(36).slice(2,9); }

function shiftColor(hex, amt){
  try{
    const c = hex.replace("#","");
    const num = parseInt(c.length===3 ? c.split('').map(x=>x+x).join('') : c, 16);
    let r = (num>>16)+amt, g = ((num>>8)&0x00FF)+amt, b = (num&0x0000FF)+amt;
    r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
    return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
  }catch(e){ return hex; }
}

let _seedCounter = 1;

function uid(){ return "p" + (_seedCounter++); }

function escapeHtml(s){
  return String(s==null?"":s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function normalizeName(s){
  return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase();
}

function numInRange(raw, min, max){
  if(raw==null || String(raw).trim()==="") return null;
  const n = parseInt(raw);
  if(isNaN(n)) return null;
  return Math.max(min, Math.min(max, n));
}

let _newIdCounter = 0;

function newId(prefix){
  _newIdCounter++;
  return prefix + Date.now().toString(36) + "_" + _newIdCounter.toString(36) + Math.floor(Math.random()*46656).toString(36);
}

function isRegistered(p){ return p.number!=null && !p.numberUnassigned; }

function avgRating(players){ return players.length ? Math.round(players.reduce((s,p)=>s+(p.rating||0),0)/players.length) : null; }

function compareGeneric(a,b,type,dir){
  let cmp;
  if(a==null && b==null) cmp = 0;
  else if(a==null) cmp = 1;
  else if(b==null) cmp = -1;
  else if(type==="string") cmp = String(a).localeCompare(String(b));
  else cmp = a-b;
  return dir==="asc" ? cmp : -cmp;
}

function sortTh(label, key, sortState, action){
  const active = sortState.key===key;
  const arrow = active ? (sortState.dir==="asc"?" ▲":" ▼") : "";
  return `<th data-action="${action}" data-key="${key}" style="cursor:pointer;user-select:none;white-space:nowrap;">${label}<span class="mono" style="color:var(--indigo-bright);">${arrow}</span></th>`;
}

function toggleSort(sortState, key, defaultDir){
  if(sortState.key===key){ sortState.dir = sortState.dir==="asc"?"desc":"asc"; }
  else { sortState.key = key; sortState.dir = defaultDir; }
}

function hexToRgb(hex){
  hex = (hex||"#000000").replace("#","");
  if(hex.length===3) hex = hex.split("").map(c=>c+c).join("");
  return [parseInt(hex.slice(0,2),16)||0, parseInt(hex.slice(2,4),16)||0, parseInt(hex.slice(4,6),16)||0];
}

// --- Paginación de listas grandes (jugadores, entrenadores, árbitros, clubes) ---
// Con listas de 100 filas por página el HTML por render es pequeño y la navegación es fluida, sin
// necesidad de trucos de deduplicación. El estado vive aquí (scope global de scripts clásicos) y se
// reinicia a 1 al cambiar filtro u orden. El orden lo fija el ordenamiento antes de partir en páginas,
// así que se mantiene consistente entre páginas.
const LIST_PAGE_SIZE = 100;
let playerPage = 1, coachPage = 1, refereePage = 1, clubPage = 1, uncalledPage = 1;

// Calcula el corte de la página actual. Devuelve {page, pageCount, start, items, total}.
function paginate(list, page){
  const total = list.length;
  const pageCount = Math.max(1, Math.ceil(total / LIST_PAGE_SIZE));
  let p = page || 1;
  if(p > pageCount) p = pageCount;
  if(p < 1) p = 1;
  const start = (p - 1) * LIST_PAGE_SIZE;
  return { page:p, pageCount, start, items:list.slice(start, start + LIST_PAGE_SIZE), total };
}

// Controles de paginación. `action` es el data-action que dispara el cambio de página (el handler lee
// data-page; el botón "Ir" lleva data-goto y el handler lee el número del input contiguo). Ocupa todo
// el ancho y SIEMPRE se muestra: si solo hay una página, los botones salen deshabilitados (grises).
function pagerHTML(page, pageCount, action){
  const one = pageCount <= 1;
  const btn = (p, label, disabled, cur) =>
    `<button class="pager-btn${cur?' cur':''}" data-action="${action}" data-page="${p}"${disabled?' disabled':''}>${label}</button>`;
  let from = Math.max(1, page - 2), to = Math.min(pageCount, page + 2);
  if(page <= 3) to = Math.min(pageCount, 5);
  if(page >= pageCount - 2) from = Math.max(1, pageCount - 4);
  let nums = "";
  if(from > 1) nums += btn(1, "1", one, page===1) + (from > 2 ? `<span class="pager-gap">…</span>` : "");
  for(let i = from; i <= to; i++) nums += btn(i, String(i), one, i === page);
  if(to < pageCount) nums += (to < pageCount - 1 ? `<span class="pager-gap">…</span>` : "") + btn(pageCount, String(pageCount), one, page===pageCount);
  return `<div class="pager">
    <div class="pager-side pager-side-left">${btn(page - 1, "‹ Anterior", one || page <= 1, false)}</div>
    <div class="pager-nums">${nums}</div>
    <div class="pager-side pager-side-right">
      ${btn(page + 1, "Siguiente ›", one || page >= pageCount, false)}
      <span class="pager-goto">
        <input type="number" class="pager-goto-input" min="1" max="${pageCount}" value="${page}" ${one?'disabled':''} aria-label="Ir a la página">
        <button class="pager-btn pager-goto-btn" data-action="${action}" data-goto="1"${one?' disabled':''}>Ir</button>
      </span>
    </div>
  </div>`;
}

// Filas de relleno para que todas las páginas midan lo mismo (evita que al pasar a la última página,
// con menos filas, la lista se acorte y el scroll salte). Solo se usan cuando hay más de una página.
function fillerRowsHTML(count, colspan){
  if(count <= 0) return "";
  const row = `<tr class="pager-filler"><td colspan="${colspan}"><span class="pager-filler-cell"></span></td></tr>`;
  return new Array(count).fill(row).join("");
}


// Insignias de "Marca de verificación" para perfiles de redes sociales (se muestran junto al
// nombre de perfil). Azul o Dorado. PNG 64x64 con transparencia.
var VERIF_BADGES = { azul: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAO3ElEQVR42tVba3Bd1XX+1jr73PeVrvyMZcmuScPUGFpibJJ2oDVl0sbgwpTUt2QmIUnHsoCmuKV0UjJ0rpS2tAyTmXZ4yk6AGdqmXAVoS6ExTbGZNkM7xaRNsSfOOAZsSUb4oSvd9z1nr9Uf50jItmQ9rGvsPaMfOtI9+35rr732t761NqHZQ5UAAER6Re7tyNiqNTcTsAVqN0LkZwAwmAcV+CE57vfUP/5PA12rTgEAcsroJWnm16Omgp8EoOPbo18hcu4lcq6EMYDvQ60XfAnHAI4LqECt/y5Bn4wUh/7q0I7L68irgyzZS88AIfjljx9bFom1fJtjiS3qNaD1sgJQEAMAh14SPgPIRJlicUit+ha86h1Hty/e30wjcHPA5xi9JJ2PHG93o+nXOJbYIqWCr42KgJhAzKfNTUQgYoBYvbpKccRnE1lPkeTelX0nPoUsWeSULx4PCL4MYx0UWyEgUkAJeTBG9jGGrtGOdXBpdOx1TrRslHLBA5E7t9ghPkWTRj3vA9/yxmND8QFgv8G6dfasOfeDAMh84gXNAzhmM1HnzsLDnG69T4rzAD/JCJxsM7Yy+v2BrsxnZhVw+8Fz2S6zN8Ckfdi+c/Ryw/zrCv00RDqU0EKqVRh3CJ6/T1gPEug7xGwgQucVa1QtRZOO1Cq/SxCFG/1l+F67krRAuQxjBknxQ3H0lcEvp38UfoZBUIB0YQwQBrT2nSNXGzd2v1rvFo6nYwCg1gdUAOIgmgNQrwb1GgBkoeKskokQuTGAKJxTAaKJOaVWFJCzB9Z76GhX5l8nPILObQSaaV7kQOglWfWtwtfUifRyJB6V6hig4gMUTgKCkgKKcEIGlABauFMmOCkEBIXijDmhABmOpaDiQ/3Go+n0kT88kL2yMZMR6Jzg88F+6tx58jFuWXS3FMcUaiWM2M3lEPPcLiACp1sdKRVfiZbTtx06BQ890OmMMP3RsrU/AN934g8C8KNe6OrORQk+OE4dAI6MFRpOKn1TPTbyCHpJ0N/Pc/OAnDJ6oGt2Hf+E7yT+F1AX1mfQRQp86uFzLGVsrbR5oCvzvenI1NSWOQACkXpwH+BYMgbr6yUGHlAlVVGo/Cn2qMFWyOy2QC7H6Ce7Ztf7y4n4VqmVFICDS20QOVovK7vxDe0HxzaCSJFXZxYesIkBwNPEFo63tMB6csmt/oQXQCgSU3LweQAIGeOMBgj+QHotaProeYkMVusRQ68NGaw/mxggwRaSDqhQkKNdooMAiIVCl1yR18jE8X5OA/QgXHFKqVxEix8QoblbQBUEREdGhkKaOpMH9IyvuJYvmq2vqnAMBZx7bkEARFClRrJWtlMd/FNsgb3hM30fzCHN/EjdWOAYUrFjFEkwVOcmjLABAaOHdnyiEdLzGQzQnibk846Q8xpU8JHGAFWfk60MkccBXKNe/f84mXGCPGRWQ4JkSf8dCqAP5sxNwGdxgO4NHrJZS9Y/IY1qI+D9+hF4gXqcyhgpjT1/tLXlnoGuzCGPSjfaauk/ONlmoDoLIxCp9QHHvAsiRTd52Jp3pqbC4xrew/+TjCy67C9AfCesbwKDXeBgEAohUivuiZbSmw/dgwZ64KCX/KWPvp2KxVZ/h5OpLVIshInZDJTQiUCVXpDSyd8f3NE5MJkW82TwnY8cb48uvvw1TqR/D9Z3FzylnR16nxOtRmvFfa7v/+ahHVRHDwi95COnfPyrV5aW2YO3abm0kyIJnjkwEqnfAMfin+P04jc6HhvaiCzZcU8g5HKMnh5d9XejGa3y6xxPXyWVEQ9g94J7vYjleNoRr/FjI7Lpna70cKDuTJLg+tRFN3kdO08+yLGW+7VesgA5s/EqiiYNrD2FeuX6I3ctOYCcMmPdOgKRSkWf5kT6KikXPhrwqpZiCUd9bxCl0pZ3utLDyKtzGvicmgB84QEnteh+rZdlVuABgNhoveLDjSwS182v6BtMTMSAzp2FLKdan5NSwQeRufDgRchEWYECeeUbj3Qvewu5PQa9N3wY6PaowQ3kr+o7cQ8l2/5aaiUfKmbukpt6nM64fnGsd7CrtYfQp24njfwXxVJXa60soagwbyQh/6DZJ1AqcFyAnYZUS5sH71q6dzrwK588/gUn0fqsNmoWYuenT6gqGRdqvVOo+T9vOnl0EznRT2q9rOcFXkXIjTOIoH4dEKsgphk+o2BXiZilXvp8AF7NaUlLLgTf98FmJ5p+Wr26QHye8d3Tx0RS37MUTy9WLWYZoN+AGwUUch771+d0G6tXe0X82hdALGQi56auqgp2hGIJRxqVbQPdS/8Be84Ev8egl/z2J0/+IkdSeYjvwPqYN/gPD3+CWFXC5wyg18La4OF5nNm2Uvy3JPu3H9y2tLhy10iVTew5YnVU/EAzPws8W461GFst3DfQveSp8ZWe+J/grPZX7zqxVkz8H4kopV5DwrLaeRNs9RtEwM+xqq5VWz+3QDr9KgqnAsLinTp868FtS4tX5DUy2NX2gjTKt4ONJZ4iiSFYTrQYWyn8+UBX2zfPcvt83kGWbPtjJzvFib3MjlmqjapdIPABsRMLKBYH8rbOoJBPs/TkRslWiq8lTgzeOvxHV5eRUz6QpQb63nQHu5c8bxvl29UxltjFJCN4nMoYWyo8MbC97QHk1KAH9jRGms3a1U+PZJyo+xK78TVSK9lAjW6CYgLoQTIRzC3VVAUxiUi90ah0Hfza2iL61J2oGXZv8LBHzWD3kuelXrsd7CjYsIo0ONnq2vLYcwPb2+5GXh30wE6oTqEavaJvMKFqXuJY6hekOuYvPHhVBK8cYYD/G47RoMoyBxdSUWaORqPJv1/++LFlQaIxSXS8gXzk1Ax2tz1v62NZsFM3mbaILY+9uty2fBE55Q+rvAFlx4F+Qs9ex3AyT7HUdVJpGi9RMq6C6CfskP/P8BsEzLX+TqxeTTmW2hiNpl5e0Te4BP1kT1Nee0Mj3Ln8BW2UvmwrlT3VU0O/ta+bvHGaPiFT9YPRn7UdKz/5FCdbb5bSiA/i5pAyhYINkeiLtPrpd2LWa93H0eRabVT0rIg9m1MgkTHaqLwZKY7ddGhH+/EgiGXtmZnm5ATtNLE1JDoduwrfNMnWe21TGakqHFfV90tW5Sp+7ytragQ8RG6E5sUFiI1URn2KJDbUU+ndlz1+bBmyWYt8frInyERvwXTg+079iZNovdeWR5tLx1Utx5OsJH3HuhcdIeTVwX5oR/upV530ohulPM9MUIM0VurVtxr1sc3Dd6/4YMbenvD4a9958k43kXki5PfNqz2qWIqmHGlUD0fErj881FZk7IeiB8qIflGqpUMcb3UB9eZxtBqpjPocja+PRlteWdE3uATZM2LC5BGyvs4nT/62iSafkFrZQpoJXn2KxB1Yv8zQ7OHuRaPBMdhLgh7Qke7UMfiVz6pXf5uTGXdeMjSRkUrBp2j8GuOkd08Y4QwZapz1dTw5/FlE438D64X8vmkrr5xoNap6wtbLW450ZfYhn3fQS/Jhz8/WvHO0e/lPqTB8va1Vngm4wTwUYWIjlYLPsdR646R3tz8ysBj92Q+NEPL7lY+//2mOpvtJxai/APz+XNlfJEHaqH5faqVfGrxr6d5gawZBms5YmYlo3dl36hYY97sQMWGrC80nJmi9/KY3Mrb52H0rT1yReztyoPfKxurHTqyVeGIvES1TryoLR3HPOu4sxRIOGrU/PrKt5aFJOcZEXDo92vaSoE9dDMGCR+McSRipjs1PIwi3AycyG0wb716zq3jTga70cPtTJztFIy+T4yzTerlpFDfMOZQcF74trpyQ07LknbsuMLRX0UsCkc+Amc6rMDKxHRLrPdiXVz01sp6teZGjyTVaazL4wAVY/QaInV9FThnd5M1cG8SmgAswf2xBCiPERsojwiZyjVh6g425RqqjAubm9xwoCGJBQGb5x9+PY4qoNn1xVJFesOIoMatfFyKKqO/JnNnmeRI/VXWT1aiZJhs8ywDjK77AxVFiBBa9cOAxEbtl1LGzbJEZL44Shha+OHqBiywUdKUT0eiVR5dUMYXsMW2HCBRv4pIfJGSiqtAfv95LfpCuk85ggLBDxPovSbVYBjnO/JoTLoKhSlBLSvS3AIAr9s6iRyhkhQN3LRlU67/M8TSBYC9B9EJujG2tdMSPVF8BlNC7aZZ9gqFIQeR+Q+oVD2xw6XkBWYrGiFRzw3esKCMPnqp7fGoD9GcttoKPbk/vV7/+DU6mDAj+R9MnMC/Xb3Cq1ZXiyItHt7c9E9Df2TZKThgBgrw6A9sX/ZkdKzzL6YwLIp1zi8oFdvugSJOJSKX0g4RjvwRVCrpE59osDQquw+SUB7a33WGLpQfJcYkTLSGDUz8whsrET/C7P/dmplmCA8I5IdCA4YRz+0FpLsaczBgpl75b0drmg9uWFk/XHqc6KWchoIZNItrZd+o6RGJfh7W/xvGUA9Xg6tvkywvEUOtB65WFTWmjCSITgYoF/EZoDwIcF2RcqFio3zgI6/3l0W2tz0ypRc7PAOGYlEZ2PFW8ipRuhtgNgH5coWmAakTOEYj/pgLvEXFfcKnhPG97qQpFk6yNytcVYoijmyDe5VBNKJEP0AAB+5TpX6xf3H2se2VlvL4wmy7XuV+amuLFv5JT83ov7OR91vmtwi5OtG47L3lb1Q9KaMUfDGzPXDf+eEXfYEJNOplIpxuHszQ63ULNjizOZ0y+Njd5spwy2uFgCHpZO5KeU3qDoom1Wh2b+80xEUuRmKOiBSH/2sH3Wn6KdTDYCu+slc3tMVi3SU8rtDTVAFPFifHAOWnvdTw6/LOUTL/KbnyNVEb88cuRM+13QC1FUwZiy7ZaumXw7qWvnVZr0Ek5/Xk2czcvOQmbmz726NBqk2x51oklr9daDerXJEyvJnWRhFdnVUEmwhxPwtaqPxGv8qXB7Uv+89K7OhusjCCn/P5X298bePfhTVqp7IDawxRNMsVSTMYlUNiFx4YokmSKpVmJh/1K5UEuDH+q2eCb6wFTCK2rnx7JWHVvI9EtgG5QkaUgJQKPKvAjEHYLu88N/U7iKABga95Bf7apxOv/Ac/cALawdIPIAAAAAElFTkSuQmCC", dorado: "data:image/png;base64,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", gris: "data:image/png;base64,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" };
// Devuelve la insignia (data URI) para un valor de marca de verificación, o "" si no aplica.
function verifBadgeSrc(v){ v=(v||"").toString().trim().toLowerCase(); return (VERIF_BADGES[v]||""); }
