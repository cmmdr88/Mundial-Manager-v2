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
// Nombre corto del evento para las etiquetas de torneo.
function sponsorEventName(){
  return (DB.event ? ((typeof eventFieldText==="function" ? (eventFieldText(DB.event,'shortName')||eventFieldText(DB.event,'name')) : DB.event.name)) : "") || "Copa Mundial 2026™";
}
function sponsorTournamentOptionLabel(){ return eventShortNameLabel(); }
// Lista normalizada de enlaces GUARDADOS del patrocinador. Compat: si no existe `links`, se deriva de global/teamId.
function sponsorLinksOf(s){
  if(Array.isArray(s.links)) return s.links;
  const links=[];
  if(s.global) links.push({type:"tournament"});
  if(s.teamId) links.push({type:"team", id:s.teamId});
  return links;
}
// Enlaces EFECTIVOS: los guardados MÁS, recíprocamente, las selecciones y clubes cuyo kitSponsor
// (marca de indumentaria) coincide con este patrocinador — p. ej. México y Argentina con Adidas.
function sponsorEffectiveLinks(s){
  const links = sponsorLinksOf(s).slice();
  const seen = new Set(links.map(l=>l.type+"|"+(l.id||normLoose(l.name||""))));
  const brand = normLoose(s.name);
  const push = (l,key)=>{ if(!seen.has(key)){ seen.add(key); links.push(l); } };
  (DB.teams||[]).forEach(t=>{ if(t.kitSponsor && normLoose(t.kitSponsor)===brand) push({type:"team", id:t.id}, "team|"+t.id); });
  (DB.clubsData||[]).forEach(c=>{ if(c.kitSponsor && normLoose(c.kitSponsor)===brand) push({type:"club", name:c.commonName}, "club|"+normLoose(c.commonName)); });
  return links;
}
function sponsorHasTournamentLink(s){ return sponsorEffectiveLinks(s).some(l=>l.type==="tournament"); }
// Etiqueta de un enlace: torneo = badge dorado clicable con el Nombre común del evento; selección/club = etiqueta gris con logo.
function sponsorLinkLabelHTML(link){
  if(link.type==="tournament"){
    return `<span class="badge conf tag-clickable" data-action="goto-evento" style="background:rgba(212,175,55,0.15);color:var(--gold,#d4af37);font-size:10px;cursor:pointer;" title="Ver el torneo">${escapeHtml(eventCommonName())}</span>`;
  }
  if(link.type==="team"){
    const t=getTeam(link.id);
    return t?`<span class="badge conf tag-clickable" data-action="open-team" data-id="${t.id}" style="background:var(--surface-2);color:var(--muted);">${teamLogoIconHTML(t)||flagIconHTML(t)}${escapeHtml(t.commonName)}</span>`:"";
  }
  if(link.type==="club"){
    const c=getClubByName(link.name);
    return `<span class="badge conf tag-clickable" data-action="open-club-by-name" data-name="${escapeHtml(link.name)}" style="background:var(--surface-2);color:var(--muted);">${clubLogoIconHTML(c)}${escapeHtml(link.name)}</span>`;
  }
  return "";
}
// Texto plano de un enlace (para el tooltip).
function sponsorLinkPlainText(link){
  if(link.type==="tournament") return eventShortNameLabel();
  if(link.type==="team"){ const t=getTeam(link.id); return t?t.commonName:""; }
  if(link.type==="club") return link.name||"";
  return "";
}
// Celda "Ligado a" en "Todos los patrocinadores": muestra el NÚMERO de torneos/selecciones/clubes,
// sin nombres; el tooltip (title) lista hasta 12 y resume el resto ("… y N más").
function sponsorLinkedCellHTML(s){
  const links = sponsorEffectiveLinks(s).filter(l=>l.type!=="team" || getTeam(l.id));
  if(links.length===0) return `<span style="color:var(--muted);">—</span>`;
  const MAX_TIP = 12;
  const names = links.map(sponsorLinkPlainText).filter(Boolean);
  const tip = names.slice(0,MAX_TIP).join(", ") + (names.length>MAX_TIP ? ` … y ${names.length-MAX_TIP} más` : "");
  return `<span class="badge conf" style="background:var(--surface-2);color:var(--muted);cursor:default;" title="${escapeHtml(tip)}">${links.length} enlace${links.length===1?"":"s"}</span>`;
}
// Valor de texto (para la fila editable del modal) a partir de un enlace.
function sponsorLinkToInputValue(link){
  if(link.type==="tournament") return eventShortNameLabel();
  if(link.type==="team"){ const t=getTeam(link.id); return t?t.commonName:""; }
  if(link.type==="club") return link.name||"";
  return "";
}
// Fila editable de "Ligado a": primero el TIPO (torneo/selección/club) y luego el nombre, con la lista
// correspondiente a cada tipo. El torneo se muestra solo como "Copa Mundial 2026™".
function sponsorLinkRowHTML(link){
  const type = link && link.type ? link.type : "team";
  const value = link ? sponsorLinkToInputValue(link) : "";
  return `
  <div class="sponsor-link-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <select class="sponsor-link-type" data-action-change="sponsor-link-type" style="flex:0 0 110px;">
      <option value="tournament" ${type==="tournament"?"selected":""}>Torneo</option>
      <option value="team" ${type==="team"?"selected":""}>Selección</option>
      <option value="club" ${type==="club"?"selected":""}>Club</option>
    </select>
    <input class="sponsor-link-name" list="${type==="tournament"?"sponsor-link-tournaments":type==="club"?"sponsor-link-clubs":"sponsor-link-teams"}" value="${escapeHtml(value)}" placeholder="${type==="tournament"?escapeHtml(eventShortNameLabel()):type==="club"?"Nombre del club":"Nombre de la selección"}" style="flex:1;">
    <button type="button" class="btn danger sm" data-action="remove-sponsor-link-row" style="flex-shrink:0;">✕</button>
  </div>`;
}
// Tabla de patrocinadores. mode: "wc" (con Valor, SIN "Ligado a") o "all" (con "Ligado a" como conteo, sin Valor).
function sponsorTableHTML(list, mode){
  const isWC = mode==="wc";
  const cols = 5;
  return `
  <div class="tbl-wrap">
    <table>
      <thead><tr><th style="width:52px;"></th><th>Marca</th><th>Categoría</th>${isWC?'<th>Valor (M$)</th>':'<th>Ligado a</th>'}<th></th></tr></thead>
      <tbody>
      ${list.map(s=>{
        const cats=sponsorCategoriesOf(s);
        return `<tr>
          <td>${brandLogoHTML(s,34)}</td>
          <td><b>${escapeHtml(s.name)}</b></td>
          <td>${cats.length?cats.map(c=>`<span class="badge conf" style="font-size:10px;">${escapeHtml(c)}</span>`).join(" "):'<span style="color:var(--muted);">—</span>'}</td>
          ${isWC?`<td class="mono">$${s.value}</td>`:`<td>${sponsorLinkedCellHTML(s)}</td>`}
          <td>
            <button class="btn ghost sm" data-action="edit-sponsor" data-id="${s.id}">Editar</button>
            <button class="btn danger sm" data-action="delete-sponsor" data-id="${s.id}">✕</button>
          </td>
        </tr>`;
      }).join("") || `<tr><td colspan="${cols}" style="text-align:center;color:var(--muted);">Sin patrocinadores</td></tr>`}
      </tbody>
    </table>
  </div>`;
}
function renderPatrocinadores(){
  const sortTabs = `
  <div class="subtabs">
    <button class="subtab-btn ${sponsorsView==='separados'?'active':''}" data-action="set-sponsors-view" data-view="separados">Competencia</button>
    <button class="subtab-btn ${sponsorsView==='alfabetico'?'active':''}" data-action="set-sponsors-view" data-view="alfabetico">Alfabético</button>
  </div>`;
  const wc = DB.sponsors.filter(s=>sponsorHasTournamentLink(s)).slice().sort((a,b)=>a.name.localeCompare(b.name,'es'));
  const all = DB.sponsors.slice().sort((a,b)=>a.name.localeCompare(b.name,'es'));
  let body;
  if(sponsorsView==='alfabetico'){
    body = `<div class="group-block"><h3><span class="tag">A–Z</span> ${all.length} patrocinador${all.length===1?'':'es'}</h3>${sponsorTableHTML(all,"all")}</div>`;
  } else {
    body = `
    <div class="section-title"><h2 style="font-size:15px;">Patrocinadores de la ${escapeHtml(eventCommonName())}</h2><span class="hint">${wc.length} patrocinador${wc.length===1?'':'es'}</span></div>
    ${sponsorTableHTML(wc,"wc")}
    <div class="section-title" style="margin-top:18px;"><h2 style="font-size:15px;">Todos los patrocinadores</h2><span class="hint">${all.length} en total · A–Z</span></div>
    ${sponsorTableHTML(all,"all")}`;
  }
  return `
  <div class="section-title"><h2>${tabLabel('patrocinadores','Patrocinadores')}</h2><button class="btn gold sm" data-action="add-sponsor">+ Agregar patrocinador</button></div>
  ${tabDescHTML('patrocinadores')}
  ${sortTabs}
  ${body}
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
  const links = sponsor.id ? sponsorEffectiveLinks(sponsor) : sponsorLinksOf(sponsor);
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

          <div class="subhead">Logo</div>
          ${imageUploadField("Logo del patrocinador", "slogo", sponsor.logoImg, "PNG o JPG. Cuadrado se ve mejor.")}

          <div class="subhead">Colores</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", sponsor.color1||'#4F46E5', "f-scolor1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", sponsor.color2||'#15161D', "f-scolor2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", sponsor.color3||'#FFFFFF', "f-scolor3")}</label>
          </div>

          <div class="subhead">Ligado a</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;align-items:flex-start;">
            <div class="field" style="flex:1;min-width:260px;display:flex;flex-direction:column;gap:5px;font-size:12px;color:var(--muted);font-weight:600;">Ligado a (torneo, selección o club — puedes agregar varios)
              <div id="sponsor-link-rows">
                ${(links.length?links:[{type:"team"}]).map(l=>sponsorLinkRowHTML(l)).join("")}
              </div>
              <div><button type="button" class="btn ghost sm" data-action="add-sponsor-link-row">+ Agregar enlace</button></div>
              <datalist id="sponsor-link-tournaments"><option value="${escapeHtml(eventShortNameLabel())}"></datalist>
              <datalist id="sponsor-link-teams">${datalistOptions(DB.teams.slice().sort((a,b)=>a.commonName.localeCompare(b.commonName,'es')).map(t=>t.commonName))}</datalist>
              <datalist id="sponsor-link-clubs">${datalistOptions(DB.clubs.slice().sort((a,b)=>a.localeCompare(b,'es')))}</datalist>
            </div>
            <label class="field" style="flex:0 0 150px;">Valor (millones)<input id="f-sval" type="number" min="0" value="${sponsor.value}"></label>
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

