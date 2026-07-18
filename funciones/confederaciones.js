/* =========================================================
   COPA MANAGER 2026 — funciones/confederaciones.js
   Confederaciones y entidad FIFA: constructores por defecto,
   generadores de badges/escudos, vista de la pestaña y modales de
   edición. Extracción mecánica: texto y orden idénticos al
   original (modelo/badges, luego vista, luego modales).
   Script CLÁSICO (no module). Cargar DESPUÉS de datos/constantes.js
   (CONF_LIST, CONF_COLORS, CONF_INFO_DEFAULTS, FIFA_INFO_DEFAULT) y
   app/textos-ui.js (T, tabLabel, tabDescription), y ANTES del
   <script> inline. Usa en tiempo de ejecución DB, el estado
   confExpanded (que permanece en el inline) y helpers del inline
   (openModal, colorPickerHTML, imageUploadField, teamCardHTML).
   ========================================================= */

// Colores propios por confederación, para distinguirla del resto de etiquetas
// Nombres oficiales reales de cada organismo — esto sí es información estable y verificable

function buildDefaultConfederations(){
  // Colores de marca aproximados de cada federación — independientes del color del badge
  const FED_COLORS = {
    CONCACAF:["#0B3D91","#C8102E"],
    CONMEBOL:["#F2B705","#00205B"],
    UEFA:["#0046AD","#003087"],
    AFC:["#C8102E","#FFB81C"],
    CAF:["#1EB53A","#FCD116"],
    OFC:["#007A87","#00485C"]
  };
  const out = {};
  CONF_LIST.forEach(id=>{
    const [c1,c2] = FED_COLORS[id];
    out[id] = {
      id,
      fullName: CONF_INFO_DEFAULTS[id].fullName,
      commonName: CONF_INFO_DEFAULTS[id].commonName,
      color1: c1,
      color2: c2,
      badgeColor: CONF_COLORS[id].fg,
      logoImg: null
    };
  });
  return out;
}
function buildDefaultFifa(){
  return { fullName: FIFA_INFO_DEFAULT.fullName, commonName: FIFA_INFO_DEFAULT.commonName, color1:"#1A6BFF", color2:"#091B3D", logoImg:null };
}

function confBadge(conf){
  if(!conf) return `<span class="badge" style="background:rgba(146,152,172,0.16);color:var(--muted);">Sin confederación</span>`;
  const info = DB && DB.confederations && DB.confederations[conf];
  const fallback = CONF_COLORS[conf] || {fg:"#9298AC"};
  const fg = (info && info.badgeColor) || fallback.fg;
  return `<span class="badge" style="background:${fg}2A;color:${fg};">${conf}</span>`;
}
function fifaBadge(t){
  return `<span class="badge fifa mono">${t.fifaCode}</span>`;
}
function orgCrestHTML(org, extraStyle, fallbackText){
  if(org.logoImg){
    return `<div class="crest-mini has-img" style="${extraStyle||''}"><img src="${org.logoImg}" alt="${org.commonName}"></div>`;
  }
  return `<div class="crest-mini" style="background:linear-gradient(160deg, ${org.color1}, ${org.color2});${extraStyle||''}">${fallbackText}</div>`;
}

function renderConfederaciones(){
  const fifa = DB.fifa;
  return `
  <div class="section-title"><h2>${tabLabel('confederaciones','Confederaciones')}</h2><span class="hint">${tabDescription('confederaciones')}</span></div>

  <div class="card" style="display:flex;gap:16px;align-items:center;flex-wrap:wrap;margin-bottom:26px;border-color:${fifa.color1}55;">
    ${orgCrestHTML(fifa, fifa.logoImg?"width:64px;height:64px;":"width:64px;height:64px;font-size:16px;", "FIFA")}
    <div style="flex:1;min-width:200px;">
      <div style="font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;">Organismo mundial</div>
      <div class="name" style="font-size:19px;">${fifa.commonName}</div>
      <div style="font-size:12px;color:var(--muted);">${fifa.fullName}</div>
    </div>
    <button class="btn ghost sm" data-action="edit-fifa">Editar FIFA</button>
  </div>

  ${CONF_LIST.map(conf=>{
    const info = DB.confederations[conf];
    const teams = DB.teams.filter(t=>t.conf===conf).sort((a,b)=> a.commonName.localeCompare(b.commonName));
    const isOpen = !!confExpanded[conf];
    return `
    <div class="group-block">
      <div class="card" data-action="toggle-confederation" data-id="${conf}" style="display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:${isOpen?'14px':'0'};border-color:${info.color1}55;cursor:pointer;">
        ${orgCrestHTML(info, info.logoImg?"width:48px;height:48px;":"width:48px;height:48px;font-size:12px;", conf.slice(0,4))}
        <div style="flex:1;min-width:160px;">
          <div class="name" style="font-size:15px;">${info.commonName}</div>
          <div style="font-size:11.5px;color:var(--muted);">${info.fullName}</div>
        </div>
        <span style="color:var(--muted);font-size:12px;">${teams.length} selecciones</span>
        <button class="btn ghost sm" data-action="edit-confederation" data-id="${conf}">Editar confederación</button>
        <span class="mono" style="color:var(--muted);font-size:14px;width:16px;text-align:center;flex-shrink:0;">${isOpen?"▾":"▸"}</span>
      </div>
      ${isOpen ? `
      <div class="grid cols-4">
        ${teams.map(t=>teamCardHTML(t)).join("") || `<div class="empty">Sin selecciones en esta confederación todavía</div>`}
      </div>` : ""}
    </div>`;
  }).join("")}
  `;
}

function modalEditFifa(){
  const f = DB.fifa;
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>Editar FIFA</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('fifa.fullName.label')}<input id="f-fifa-fullname" value="${f.fullName}"></label>
          <label class="field" style="grid-column:1/-1;">${T('fifa.commonName.label')}<input id="f-fifa-commonname" value="${f.commonName}"></label>
          <label class="field">${T('fifa.color1.label')}${colorPickerHTML("", f.color1, "f-fifa-color1")}</label>
          <label class="field">${T('fifa.color2.label')}${colorPickerHTML("", f.color2, "f-fifa-color2")}</label>
          ${imageUploadField(T('fifa.logo.label'), "fifalogo", f.logoImg, "")}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-fifa">Guardar</button>
      </div>
    </div>
  `);
}

function modalEditConfederation(confId){
  const info = DB.confederations[confId];
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>Editar ${confId}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('confederation.fullName.label')}<input id="f-conf-fullname" value="${info.fullName}"></label>
          <label class="field" style="grid-column:1/-1;">${T('confederation.commonName.label')}<input id="f-conf-commonname" value="${info.commonName}"></label>

          <div class="subhead">${T('confederation.section.fedColors')}</div>
          <label class="field">${T('confederation.color1.label')}${colorPickerHTML("", info.color1, "f-conf-color1")}</label>
          <label class="field">${T('confederation.color2.label')}${colorPickerHTML("", info.color2, "f-conf-color2")}</label>

          <div class="subhead">${T('confederation.section.badge')}</div>
          <label class="field" style="grid-column:1/-1;">${T('confederation.badgeColor.label')}${colorPickerHTML("", info.badgeColor, "f-conf-badgecolor")}
            <span style="font-size:11px;color:var(--muted);font-weight:400;">${T('confederation.badgeColor.hint')}</span>
          </label>

          ${imageUploadField(T('confederation.logo.label'), "conflogo", info.logoImg, "")}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-confederation" data-id="${confId}">Guardar</button>
      </div>
    </div>
  `);
}
