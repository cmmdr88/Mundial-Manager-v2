/* =========================================================
   COPA MANAGER 2026 — funciones/patrocinadores.js
   Patrocinadores, categorías y marcas de indumentaria: helpers de
   modelo (categorías, búsqueda por nombre, alta de marcas/patrocinadores),
   nombre en camiseta, mutadores de catálogo, logo, vista de la pestaña y
   modal. Extracción mecánica: texto y orden idénticos al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (APPAREL_CATEGORY, etc.) y core/utilidades.js (normLoose, newId,
   escapeHtml, initials), y ANTES del <script> inline. Usa en tiempo de
   ejecución DB, getTeam y helpers de modales (openModal, T,
   imageUploadField, colorPickerHTML), todos en el inline. brandLogoHTML lo
   consume también medios.js (en tiempo de render). No llama a otros
   dominios; son jugadores/uniformes/medios los que dependen de él.
   ========================================================= */

// Categoría de patrocinio que identifica a una marca de ropa/indumentaria.
// Las marcas de ropa ahora VIVEN como patrocinadores (categoría "Indumentaria") en vez de en un
// catálogo aparte. Estas funciones auxiliares manejan esa relación.
function sponsorCategoriesOf(s){
  if(Array.isArray(s.categories)) return s.categories;
  return s.category ? [s.category] : [];
}
function sponsorHasCategory(s, cat){
  const k = normLoose(cat);
  return sponsorCategoriesOf(s).some(c=>normLoose(c)===k);
}
function findSponsorByName(name){
  const key = normLoose(name);
  return (DB.sponsors||[]).find(s=>normLoose(s.name)===key) || null;
}
// Nombres de todas las marcas de ropa (patrocinadores con categoría "Indumentaria"), para los datalists.
function apparelBrandNames(){
  return [...new Set((DB.sponsors||[]).filter(s=>sponsorHasCategory(s, APPAREL_CATEGORY)).map(s=>s.name))]
    .sort((a,b)=>a.localeCompare(b,'es'));
}
// Garantiza que una marca de ropa exista como patrocinador. Si ya existe con ese nombre, solo le
// asegura la categoría "Indumentaria"; si no, la crea. Devuelve el patrocinador.
function ensureApparelBrandSponsor(name, opts){
  const nm = (name||"").trim();
  if(!nm) return null;
  opts = opts || {};
  let sp = findSponsorByName(nm);
  if(sp){
    if(!sponsorHasCategory(sp, APPAREL_CATEGORY)){
      if(!Array.isArray(sp.categories)) sp.categories = sp.category ? [sp.category] : [];
      sp.categories.push(APPAREL_CATEGORY);
    }
    return sp;
  }
  sp = { id:newId("sp"), name:nm, categories:[APPAREL_CATEGORY], value: opts.value!=null?opts.value:40,
         teamId:null, global: !!opts.global, logoImg:null, color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF" };
  if(!DB.sponsors) DB.sponsors = [];
  DB.sponsors.push(sp);
  return sp;
}
// Igual que matchOrAddClub pero para las marcas patrocinadoras: ahora las crea como patrocinadores.
function matchOrAddBrand(raw){
  const name = (raw||"").trim();
  if(!name) return "";
  const sp = ensureApparelBrandSponsor(name);
  return sp ? sp.name : name;
}
// Nombre que va en la camiseta (selección o club) — si el jugador no tiene uno puesto a mano,
// se usa por default su nombre común o, en su defecto, el apellido (como en una camiseta real),
// siempre en MAYÚSCULAS por default — pero si el campo se editó a mano, se respeta tal cual lo
// haya escrito el usuario (por ejemplo "McTominay", con su mayúscula especial en medio).
function effectiveShirtName(p, scope){
  const explicit = scope==="club" ? p.shirtNameClub : p.shirtNameTeam;
  if(explicit && explicit.trim()) return explicit.trim();
  if(p.commonName && p.commonName.trim()) return p.commonName.trim().toUpperCase();
  if(p.lastName && p.lastName.trim()) return p.lastName.trim().toUpperCase();
  return "";
}

function addBrand(name){
  name = (name||"").trim();
  if(!name) return;
  // Las marcas de ropa se registran como patrocinadores (categoría "Indumentaria").
  ensureApparelBrandSponsor(name);
}
function addSponsorCategory(name){
  name = (name||"").trim();
  if(!name) return;
  if(!DB.sponsorCategories.some(c=>c.toLowerCase()===name.toLowerCase())) DB.sponsorCategories.push(name);
}

/* ---------- PATROCINADORES ---------- */
function renderPatrocinadores(){
  return `
  <div class="section-title"><h2>${tabLabel('patrocinadores','Patrocinadores')}</h2><button class="btn gold sm" data-action="add-sponsor">+ Agregar patrocinador</button></div>
  ${tabDescHTML('patrocinadores')}
  <div class="tbl-wrap">
    <table>
      <thead><tr><th style="width:52px;"></th><th>Marca</th><th>Categoría</th><th>Ligado a</th><th>Valor (M$)</th><th></th></tr></thead>
      <tbody>
      ${DB.sponsors.map(s=>{
        const team = s.teamId ? getTeam(s.teamId) : null;
        const cats = sponsorCategoriesOf(s);
        const linkedHTML = team
          ? escapeHtml(team.commonName)
          : (s.global
              ? `<span style="color:var(--muted);">Torneo (global)</span> <span class="badge conf" style="background:rgba(212,175,55,0.15);color:var(--gold,#d4af37);font-size:10px;">${escapeHtml(DB.event ? (typeof eventFieldText==="function" ? eventFieldText(DB.event,'name') : DB.event.name) : "Mundial 2026")}</span>`
              : `<span style="color:var(--muted);">—</span>`);
        return `<tr>
          <td>${brandLogoHTML(s, 34)}</td>
          <td><b>${escapeHtml(s.name)}</b></td>
          <td>${cats.length? cats.map(c=>`<span class="badge conf" style="font-size:10px;">${escapeHtml(c)}</span>`).join(" ") : '<span style="color:var(--muted);">—</span>'}</td>
          <td>${linkedHTML}</td>
          <td class="mono">$${s.value}</td>
          <td>
            <button class="btn ghost sm" data-action="edit-sponsor" data-id="${s.id}">Editar</button>
            <button class="btn danger sm" data-action="delete-sponsor" data-id="${s.id}">✕</button>
          </td>
        </tr>`;
      }).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--muted);">Sin patrocinadores</td></tr>`}
      </tbody>
    </table>
  </div>
  `;
}

// Logo pequeño para patrocinadores y medios — mismo estilo/tamaño que los logos de equipos.
function brandLogoHTML(entity, sizePx){
  const s = sizePx || 40;
  const style = `width:${s}px;height:${s}px;`;
  if(entity.logoImg){
    return `<div class="crest-mini has-img" style="${style}"><img src="${entity.logoImg}" alt="${escapeHtml(entity.name||'')}"></div>`;
  }
  const c1 = entity.color1||"#4F46E5", c2 = entity.color2||"#15161D";
  return `<div class="crest-mini" style="background:linear-gradient(160deg, ${c1}, ${c2});${style}font-size:${Math.round(s*0.34)}px;">${escapeHtml(initials(entity.name||"?"))}</div>`;
}
// Fila editable de categoría en el modal de patrocinador — se pueden agregar varias.
function sponsorCategoryRowHTML(value){
  return `
  <div class="sponsor-cat-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <input class="sponsor-cat-name" list="sponsor-cat-list" value="${escapeHtml(value||'')}" placeholder="${T('sponsor.category.placeholder')}" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-sponsor-cat-row" style="flex-shrink:0;">✕</button>
  </div>`;
}
function modalAddEditSponsor(sponsor){
  const isEdit = !!sponsor;
  sponsor = sponsor || {id:null, name:"", categories:[], value:50, teamId:null, global:false, logoImg:null, color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF"};
  const cats = sponsorCategoriesOf(sponsor);
  const linkValue = sponsor.teamId ? sponsor.teamId : (sponsor.global ? "__global__" : "");
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar patrocinador":"Agregar patrocinador"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('sponsor.name.label')}<input id="f-sname" value="${escapeHtml(sponsor.name||'')}"></label>
          <div class="field" style="grid-column:1/-1;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">${T('sponsor.category.label')} (puedes agregar varias)
            <div id="sponsor-cat-rows">
              ${(cats.length?cats:[""]).map(c=>sponsorCategoryRowHTML(c)).join("")}
            </div>
            <div><button type="button" class="btn ghost sm" data-action="add-sponsor-cat-row">+ Agregar categoría</button></div>
            <datalist id="sponsor-cat-list">${DB.sponsorCategories.map(c=>`<option value="${escapeHtml(c)}">`).join("")}</datalist>
          </div>
          <label class="field">${T('sponsor.value.label')}<input id="f-sval" type="number" min="0" value="${sponsor.value}"></label>
          <label class="field" style="grid-column:1/-1;">${T('sponsor.team.label')}
            <select id="f-steam">
              <option value="" ${linkValue===""?"selected":""}>— Sin asignar —</option>
              <option value="__global__" ${linkValue==="__global__"?"selected":""}>Torneo global (${escapeHtml(DB.event ? (typeof eventFieldText==="function" ? eventFieldText(DB.event,'shortName')||eventFieldText(DB.event,'name') : DB.event.name) : "Mundial 2026")})</option>
              ${DB.teams.map(t=>`<option value="${t.id}" ${sponsor.teamId===t.id?"selected":""}>${t.commonName}</option>`).join("")}
            </select>
          </label>

          <div class="subhead">Logo</div>
          ${imageUploadField("Logo del patrocinador", "slogo", sponsor.logoImg, "PNG o JPG. Cuadrado se ve mejor.")}

          <div class="subhead">Colores</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", sponsor.color1||'#4F46E5', "f-scolor1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", sponsor.color2||'#15161D', "f-scolor2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", sponsor.color3||'#FFFFFF', "f-scolor3")}</label>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-sponsor" data-id="${sponsor.id||''}">Guardar</button>
      </div>
    </div>
  `);
}

