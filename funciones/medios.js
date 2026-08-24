/* =========================================================
   COPA MANAGER 2026 — funciones/medios.js
   Dominio "Medios": tabla de medios (renderMedios) y su modal de
   alta/edición (modalAddEditMedia). Extracción mecánica: texto y
   orden idénticos al original.
   Script CLÁSICO (no module). Cargar DESPUÉS de core/utilidades.js
   (escapeHtml) y app/textos-ui.js (T, tabLabel, tabDescHTML), y
   ANTES del <script> inline (usa DB, openModal, imageUploadField,
   colorPickerHTML, brandLogoHTML en tiempo de ejecución).
   ========================================================= */

/* ---------- MEDIOS ---------- */
// Catálogo de categorías de medios (se pueden marcar varias por medio).
const MEDIA_CATEGORIES = [
  "Agencia de noticias","Periódico","Revista","Portal digital","Radio","Televisión",
  "Broadcaster","Podcast","Agencia audiovisual","Agencia fotográfica",
  "Proveedor de datos","Red social","Blog / publicación independiente",
  "Plataforma de streaming","Foro"
];
// Mapea tipos antiguos (campo `type`) al nuevo catálogo de categorías, para compatibilidad.
const MEDIA_TYPE_MIGRATION = {
  "TV abierta":"Televisión", "TV de paga":"Televisión", "Radio":"Radio",
  "Streaming":"Plataforma de streaming", "Digital/Prensa":"Portal digital"
};
// Categorías efectivas de un medio (array), migrando el antiguo `type` si hiciera falta.
function mediaCategories(m){
  if(Array.isArray(m.categories) && m.categories.length) return m.categories;
  if(m.type){ const mapped = MEDIA_TYPE_MIGRATION[m.type] || m.type; return mapped ? [mapped] : []; }
  return [];
}
// Cobertura de un medio (array): puede incluir países, ciudades, confederaciones y/o regiones.
// Migra el antiguo campo `country` (texto único) si aún no hay `coverage`.
function mediaCoverage(m){
  if(Array.isArray(m.coverage) && m.coverage.length) return m.coverage;
  return m.country ? [m.country] : [];
}
// Alcance (millones de personas) de CADA entrada de cobertura. Ahora el alcance se define por
// país/ciudad/región, no global. Se guarda en m.coverageReach como { <nombre>: <millones> }.
// Migración: si un medio antiguo solo tiene m.reach (alcance global único), ese total se asigna a
// la PRIMERA entrada de cobertura y las demás quedan en 0, para no perder el dato.
function mediaCoverageReachMap(m){
  const cov = mediaCoverage(m);
  const map = {};
  const stored = (m && m.coverageReach && typeof m.coverageReach==="object") ? m.coverageReach : null;
  cov.forEach((name, i)=>{
    let val = 0;
    if(stored && stored[name]!=null) val = stored[name];
    else if(!stored && i===0 && m && m.reach!=null) val = m.reach; // migración del alcance global
    map[name] = Math.max(0, parseInt(val)||0);
  });
  return map;
}
// Alcance de una entrada concreta de cobertura (0 si no está definida).
function mediaReachFor(m, name){ const mp = mediaCoverageReachMap(m); return mp[name]!=null ? mp[name] : 0; }
// Alcance total del medio = suma de los alcances por entrada. Es el número que se muestra en la lista.
function mediaTotalReach(m){
  const mp = mediaCoverageReachMap(m);
  return Object.keys(mp).reduce((s,k)=>s+(mp[k]||0), 0);
}
// Opciones para el datalist de cobertura: regiones + confederaciones + países + ciudades.
function mediaCoverageOptions(){
  const out = [];
  out.push("Internacional");   // región global: presencia en todo el mundo (aplica a todas las selecciones)
  try{ const R=(typeof getRegions==="function")?getRegions():MEDIA_REGIONS; if(R) out.push(...Object.keys(R)); }catch(e){ if(typeof MEDIA_REGIONS==="object") out.push(...Object.keys(MEDIA_REGIONS)); }
  // Confederaciones: se muestran con nombre "de continente" (Europa, Asia…), no la sigla.
  try{ if(DB.confederations) out.push(...Object.keys(DB.confederations).map(k=>(typeof CONFEDERATION_LABELS==="object" && CONFEDERATION_LABELS[k]) || k)); }catch(e){}
  try{ (DB.countries||[]).forEach(c=>{ if(c.commonName) out.push(c.commonName); }); }catch(e){}
  try{ if(typeof allCities==="function") out.push(...allCities()); }catch(e){}
  const seen=new Set(); return out.filter(v=>{ const k=normLoose(v); if(!v||seen.has(k)) return false; seen.add(k); return true; });
}
// Fila editable de cobertura (una por entrada); se pueden agregar varias. Cada fila lleva su propio
// alcance en millones de personas (al lado del nombre).
function mediaCoverageRowHTML(value, reach){
  return `
  <div class="media-coverage-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <input class="media-coverage-name" list="media-coverage-list" value="${escapeHtml(value||'')}" placeholder="País, ciudad, confederación o región" style="flex:1;">
    <input class="media-coverage-reach" type="number" min="0" value="${reach!=null?reach:''}" placeholder="M" title="Alcance en millones de personas" style="width:90px;flex-shrink:0;">
    <button type="button" class="btn danger sm" data-action="remove-media-coverage-row" style="flex-shrink:0;">✕</button>
  </div>`;
}
function renderMedios(){
  return `
  <div class="section-title"><h2>${tabLabel('medios','Medios')}</h2><button class="btn gold sm" data-action="add-media">+ Agregar medio</button></div>
  ${tabDescHTML('medios')}
  <div class="tbl-wrap">
    <table>
      <thead><tr><th style="width:52px;"></th><th>Medio</th><th>Categorías</th><th>Cobertura</th><th>Alcance total (M de personas)</th><th></th></tr></thead>
      <tbody>
      ${DB.media.map(m=>`<tr>
          <td>${brandLogoHTML(m, 34)}</td>
          <td><b>${escapeHtml(m.name)}</b></td>
          <td>${escapeHtml(mediaCategories(m).join(", "))}</td>
          <td>${(()=>{ const cov = mediaCoverage(m).join(", "); return `<span title="${escapeHtml(cov)}" style="display:inline-block;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;">${escapeHtml(cov)}</span>`; })()}</td>
          <td class="mono">${mediaTotalReach(m)}</td>
          <td>
            <button class="btn ghost sm" data-action="edit-media" data-id="${m.id}">Editar</button>
            <button class="btn danger sm" data-action="delete-media" data-id="${m.id}">✕</button>
          </td>
        </tr>`).join("") || `<tr><td colspan="6" style="text-align:center;color:var(--muted);">Sin medios</td></tr>`}
      </tbody>
    </table>
  </div>
  `;
}

// Sección "Redes sociales" de un MEDIO: desplegable, con un perfil por defecto y, opcionalmente, un
// perfil por cada valor de cobertura (país, región, etc.). Si una cobertura no tiene perfil propio,
// se usa el perfil por defecto. `ctx` = { logoOptions, logos, colors } (compartido por todos).
function mediaSocialSectionHTML(media, ctx){
  const cov = mediaCoverage(media);
  const byCov = (media.socialByCoverage && typeof media.socialByCoverage==="object") ? media.socialByCoverage : {};
  const perCov = cov.map((name, i)=>{
    const prof = byCov[name] || {};
    const custom = !!(prof.socialProfileName || prof.socialUsername || prof.socialHashtag || prof.socialAvatarManual);
    return `
    <details ${custom?'open':''} style="grid-column:1/-1;border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:8px;padding:8px 12px;margin-bottom:8px;">
      <summary style="cursor:pointer;font-size:12.5px;font-weight:600;color:var(--ink);">Perfil para «${escapeHtml(name)}» ${custom?'<span style="color:var(--success);font-weight:400;">· personalizado</span>':'<span style="color:var(--muted);font-weight:400;">· usa el perfil por defecto</span>'}</summary>
      <div style="margin-top:10px;">${socialProfileBlockHTML("msoc-c"+i, prof, ctx, name)}</div>
    </details>`;
  }).join("");
  return `
  <div class="subhead">Redes sociales</div>
  <div style="grid-column:1/-1;">
    <div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:6px;">Perfil por defecto</div>
    ${socialProfileBlockHTML("msoc", media, ctx)}
    ${cov.length ? `<div class="subhead" style="margin-top:14px;">Perfiles por cobertura <span style="font-weight:400;color:var(--muted);font-size:11px;">(opcional — si dejas uno vacío, ese valor usa el perfil por defecto)</span></div>${perCov}` : ""}
  </div>`;
}
// Resuelve el perfil de redes sociales de un medio para un valor de cobertura dado (país/región/…).
// Devuelve el perfil específico si existe; si no, el perfil por defecto del medio.
function mediaSocialProfile(m, coverageName){
  const bc = (m && m.socialByCoverage) || null;
  if(bc && coverageName && bc[coverageName]) return bc[coverageName];
  return {
    socialAvatar: (m && m.socialAvatar) || null,
    socialProfileName: (m && m.socialProfileName) || "",
    socialUsername: (m && m.socialUsername) || "",
    socialHashtag: (m && m.socialHashtag) || "",
    socialAvatarLogo: (m && m.socialAvatarLogo) || null,
    socialAvatarColor: (m && m.socialAvatarColor) || 0
  };
}

function modalAddEditMedia(media){
  const isEdit = !!media;
  media = media || {id:null, name:"", categories:[], newsSource:true, coverage:["Internacional"], reach:20, logoImg:null, logoVDark:null, logoVLight:null, logoHDark:null, logoHLight:null, logoPrincipal:"horizontal", logoGrafico:"hd", color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", socialAvatar:null, socialAvatarManual:false, socialProfileName:"", socialUsername:"", socialHashtag:"", socialAvatarLogo:"hd", socialAvatarColor:0, socialByCoverage:{}};
  // Compatibilidad: si solo existe el logo heredado, se muestra como "Horizontal — fondo oscuro".
  if(media.logoImg && !media.logoVDark && !media.logoHDark && !media.logoVLight && !media.logoHLight){ media = Object.assign({}, media, {logoHDark: media.logoImg}); }
  const mCats = mediaCategories(media);
  const mNews = media.newsSource !== false;
  const mCov = mediaCoverage(media);
  const mReachMap = mediaCoverageReachMap(media);
  const covRows = (mCov.length ? mCov : [""]).map(v=>mediaCoverageRowHTML(v, v ? mReachMap[v] : "")).join("");
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar medio":"Agregar medio"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('media.name.label')}<input id="f-mname" value="${escapeHtml(media.name||'')}"></label>

          <div class="subhead">Cobertura y alcance <span style="font-weight:400;color:var(--muted);font-size:11px;">(países, ciudades, confederaciones o regiones — con su alcance en millones al lado)</span></div>
          <div style="grid-column:1/-1;">
            <div id="media-coverage-rows">${covRows}</div>
            <div><button type="button" class="btn ghost sm" data-action="add-media-coverage-row">+ Agregar cobertura</button></div>
            <datalist id="media-coverage-list">${mediaCoverageOptions().map(o=>`<option value="${escapeHtml(o)}">`).join("")}</datalist>
          </div>

          <div class="subhead">Categorías <span style="font-weight:400;color:var(--muted);font-size:11px;">(puedes marcar varias)</span></div>
          <div style="grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:5px 14px;">
            ${MEDIA_CATEGORIES.map(c=>`<label style="display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:500;color:var(--ink);cursor:pointer;"><input type="checkbox" name="media-cat" value="${escapeHtml(c)}" style="width:auto;flex-shrink:0;" ${mCats.includes(c)?'checked':''}> ${escapeHtml(c)}</label>`).join("")}
          </div>

          <label class="field" style="grid-column:1/-1;flex-direction:row;align-items:center;gap:9px;">
            <input type="checkbox" id="f-mnews" style="width:auto;flex-shrink:0;" ${mNews?'checked':''}>
            <span style="display:flex;flex-direction:column;gap:2px;"><span style="color:var(--ink);font-weight:600;">Fuente de noticias</span><span style="font-weight:400;color:var(--muted);font-size:11px;">Si está marcado, el medio puede aparecer en las pantallas de noticias.</span></span>
          </label>

          <div class="subhead">Logo</div>
          <div style="grid-column:1/-1;display:flex;flex-direction:column;gap:10px;">
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              ${imageUploadFieldCol("Vertical — fondo oscuro", "mlogo-vd", media.logoVDark, "")}
              ${imageUploadFieldCol("Vertical — fondo claro", "mlogo-vl", media.logoVLight, "")}
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              ${imageUploadFieldCol("Horizontal — fondo oscuro", "mlogo-hd", media.logoHDark, "")}
              ${imageUploadFieldCol("Horizontal — fondo claro", "mlogo-hl", media.logoHLight, "")}
            </div>
            <div style="display:flex;gap:16px;flex-wrap:wrap;">
              <label class="field" style="flex:1 1 200px;">Logo principal
                <select id="f-mlogo-principal">
                  <option value="horizontal" ${((media.logoPrincipal||'horizontal')==='horizontal')?'selected':''}>Horizontal</option>
                  <option value="vertical" ${(media.logoPrincipal==='vertical')?'selected':''}>Vertical</option>
                </select>
              </label>
              <label class="field" style="flex:1 1 200px;">Logo en gráficos
                <select id="f-mlogo-grafico">
                  ${[["hd","Horizontal — fondo oscuro"],["hl","Horizontal — fondo claro"],["vd","Vertical — fondo oscuro"],["vl","Vertical — fondo claro"]].map(([v,l])=>`<option value="${v}" ${((media.logoGrafico||'hd')===v)?'selected':''}>${l}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>

          <div class="subhead">Colores</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", media.color1||'#4F46E5', "f-mcolor1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", media.color2||'#15161D', "f-mcolor2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", media.color3||'#FFFFFF', "f-mcolor3")}</label>
          </div>

          ${mediaSocialSectionHTML(media, {
            logoOptions: [["hd","Horizontal — oscuro"],["hl","Horizontal — claro"],["vd","Vertical — oscuro"],["vl","Vertical — claro"]],
            logos: { hd: media.logoHDark||media.logoImg||"", hl: media.logoHLight||"", vd: media.logoVDark||"", vl: media.logoVLight||"" },
            colors: [media.color1||"#4F46E5", media.color2||"#15161D", media.color3||"#FFFFFF"]
          })}
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-media" data-id="${media.id||''}">Guardar</button>
      </div>
    </div>
  `);
}
