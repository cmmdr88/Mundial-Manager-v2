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
// IMPORTANCIA (1–100) de CADA entrada de cobertura: qué tan relevante es el medio en ese país/región.
// Entre más alto, más importante (decide qué medio muestra las noticias). Se guarda en
// m.coverageReach como { <nombre>: <1–100> }. Migración: si un medio antiguo solo tiene m.reach, ese
// valor se asigna a la PRIMERA entrada de cobertura.
function mediaCoverageReachMap(m){
  const cov = mediaCoverage(m);
  const map = {};
  const stored = (m && m.coverageReach && typeof m.coverageReach==="object") ? m.coverageReach : null;
  cov.forEach((name, i)=>{
    let val = 0;
    if(stored && stored[name]!=null) val = stored[name];
    else if(!stored && i===0 && m && m.reach!=null) val = m.reach; // migración del valor global
    map[name] = Math.max(0, parseInt(val)||0);
  });
  return map;
}
// Importancia de una entrada concreta de cobertura (0 si no está definida).
function mediaReachFor(m, name){ const mp = mediaCoverageReachMap(m); return mp[name]!=null ? mp[name] : 0; }
// Importancia máxima del medio entre sus coberturas (referencia para el nivel "internacional").
function mediaTotalReach(m){
  const mp = mediaCoverageReachMap(m);
  return Object.keys(mp).reduce((mx,k)=>Math.max(mx, mp[k]||0), 0);
}
// Nombre de la banda de importancia (1–100) según la escala definida.
function mediaImportanceBand(n){
  n = parseInt(n); if(isNaN(n) || n<=0) return "";
  if(n>=90) return "Dominante";
  if(n>=75) return "Muy alto";
  if(n>=60) return "Alto";
  if(n>=40) return "Medio";
  if(n>=20) return "Bajo";
  return "Muy bajo";
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
// Fila editable de cobertura (una por entrada); se pueden agregar varias. Cada fila lleva su propia
// IMPORTANCIA (1–100) al lado del nombre: a mayor número, más importante es el medio en esa cobertura.
function mediaCoverageRowHTML(value, reach){
  const band = (typeof mediaImportanceBand==="function") ? mediaImportanceBand(reach) : "";
  return `
  <div class="media-coverage-row" style="display:flex;gap:6px;margin-bottom:8px;align-items:center;">
    <input class="media-coverage-name" list="media-coverage-list" value="${escapeHtml(value||'')}" placeholder="País, ciudad, confederación o región" style="flex:1;">
    <input class="media-coverage-reach" type="number" min="1" max="100" value="${reach!=null?reach:''}" placeholder="1–100" title="Importancia del medio en esta cobertura (1–100) — 90–100 Dominante · 75–89 Muy alto · 60–74 Alto · 40–59 Medio · 20–39 Bajo · 1–19 Muy bajo" oninput="if(this.value!==''){if(+this.value>100)this.value=100;}" style="width:66px;flex-shrink:0;text-align:center;">
    <span class="media-reach-band" style="width:76px;flex-shrink:0;font-size:11px;color:var(--muted);white-space:nowrap;">${escapeHtml(band)}</span>
    <button type="button" class="btn danger sm" data-action="remove-media-coverage-row" style="flex-shrink:0;">✕</button>
  </div>`;
}
// Valor de ordenación de un medio según la columna. El "Alcance total" ya no se muestra en la
// pestaña (solo en el editor), así que aquí solo se ordena por nombre o por cobertura.
function mediaSortValue(m, key){
  if(key==="coverage") return mediaCoverage(m).join(", ").toLowerCase();
  return (m.name||"").toLowerCase();
}
// Filtro por NOMBRE de la pestaña de medios ("" = sin filtro).
var mediaFilterName = "";
// Filtro por PAÍS de la pestaña de medios (nombre común del país; "" = todos).
var mediaFilterCountry = "";
// Filtro por fuente de noticias: "" = todos, "yes" = es fuente, "no" = no es fuente.
var mediaFilterNews = "";
// Aliases país → nombre de cobertura equivalente (mismos que usa la selección de noticias).
var MEDIA_COUNTRY_ALIAS = {
  "inglaterra":"reino unido", "escocia":"reino unido", "gales":"reino unido", "irlanda del norte":"reino unido",
  "arabia saudita":"medio oriente", "catar":"medio oriente", "jordania":"medio oriente", "iran":"medio oriente", "irak":"medio oriente"
};
// ¿El medio cubre a este PAÍS? Aplica si la cobertura lo incluye explícitamente, o incluye una REGIÓN
// que lo contiene, o su CONFEDERACIÓN, o es Internacional (mismo criterio que las noticias por país).
function mediaCoversCountry(m, countryName){
  const cov = mediaCoverage(m);
  if(!cov.length) return true; // sin cobertura = internacional (cubre a todos)
  const target = normLoose(countryName);
  const country = (DB.countries||[]).find(c=> normLoose(c.commonName)===target || normLoose(c.officialName||"")===target);
  const names = new Set([target]);
  if(country && country.officialName) names.add(normLoose(country.officialName));
  if(MEDIA_COUNTRY_ALIAS[target]) names.add(normLoose(MEDIA_COUNTRY_ALIAS[target]));
  const conf = country ? normLoose(country.conf||"") : "";
  // Índice de regiones (nombre normalizado → Set de países normalizados).
  let regions = null;
  try{ const R=(typeof getRegions==="function")?getRegions():null; if(R){ regions=Object.create(null); Object.keys(R).forEach(k=>{ regions[normLoose(k)] = new Set((R[k]||[]).map(normLoose)); }); } }catch(e){}
  // Etiqueta de continente → clave de confederación ("europa" → "uefa").
  let confByLabel = null;
  try{ if(typeof CONFEDERATION_LABELS==="object" && CONFEDERATION_LABELS){ confByLabel=Object.create(null); Object.keys(CONFEDERATION_LABELS).forEach(k=>{ confByLabel[normLoose(CONFEDERATION_LABELS[k])] = normLoose(k); }); } }catch(e){}
  for(const raw of cov){
    const e = normLoose(raw);
    if(!e) continue;
    if(e==="internacional" || e==="mundial" || e==="global") return true;         // internacional
    if(names.has(e)) return true;                                                  // país explícito (+ oficial/alias)
    if(regions && regions[e]){ for(const nm of names){ if(regions[e].has(nm)) return true; } } // región que lo contiene
    if(conf && (e===conf || (confByLabel && confByLabel[e]===conf))) return true;  // confederación del país
  }
  return false;
}
function renderMedios(){
  let list = DB.media.slice();
  if(mediaFilterName){ const q = normLoose(mediaFilterName); list = list.filter(m=> normLoose(m.name||"").includes(q)); }
  if(mediaFilterCountry){ list = list.filter(m=> mediaCoversCountry(m, mediaFilterCountry)); }
  if(mediaFilterNews==="yes"){ list = list.filter(m=> m.newsSource!==false); }
  else if(mediaFilterNews==="no"){ list = list.filter(m=> m.newsSource===false); }
  list.sort((a,b)=>
    compareGeneric(mediaSortValue(a, mediaSort.key), mediaSortValue(b, mediaSort.key), "string", mediaSort.dir)
    || (a.name||"").localeCompare(b.name||"", 'es'));
  const countryNames = [...new Set((DB.countries||[]).map(c=>c.commonName).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
  return `
  <div class="section-title"><h2>${tabLabel('medios','Medios')}</h2><button class="btn gold sm" data-action="add-media">+ Agregar medio</button></div>
  ${tabDescHTML('medios')}
  <div class="searchbar" style="margin-bottom:12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
    <input type="text" id="media-name-filter" placeholder="Buscar medio por nombre..." value="${escapeHtml(mediaFilterName)}" style="flex:1;min-width:180px;max-width:320px;">
    <select id="media-country-filter" style="max-width:280px;">
      <option value="">Todos los países</option>
      ${countryNames.map(c=>`<option value="${escapeHtml(c)}" ${mediaFilterCountry===c?'selected':''}>${escapeHtml(c)}</option>`).join("")}
    </select>
    <select id="media-news-filter" style="max-width:220px;">
      <option value="" ${mediaFilterNews===''?'selected':''}>Todo</option>
      <option value="yes" ${mediaFilterNews==='yes'?'selected':''}>Es fuente de noticias</option>
      <option value="no" ${mediaFilterNews==='no'?'selected':''}>No es fuente de noticias</option>
    </select>
    ${mediaFilterCountry ? `<span class="hint" style="font-size:11.5px;">${list.length} medio${list.length===1?'':'s'} cubren ${escapeHtml(mediaFilterCountry)} · incluye región, confederación e internacional</span>` : `<span class="hint" style="font-size:11.5px;">Filtra por país (incluye medios por región, confederación o internacionales que lo cubran)</span>`}
  </div>
  <div class="tbl-wrap">
    <table>
      <thead><tr>
        <th style="width:52px;"></th>
        ${sortTh("Medio","name",mediaSort,"sort-media")}
        <th>Categorías</th>
        ${sortTh("Cobertura","coverage",mediaSort,"sort-media")}
        <th></th>
      </tr></thead>
      <tbody>
      ${list.map(m=>`<tr>
          <td>${brandLogoHTML(m, 34)}</td>
          <td><b>${escapeHtml(m.name)}</b></td>
          <td>${(()=>{ const cats = mediaCategories(m); return cats.length ? cats.map(c=>`<span class="badge conf" style="font-size:10px;">${escapeHtml(c)}</span>`).join(" ") : '<span style="color:var(--muted);">—</span>'; })()}</td>
          <td>${(()=>{ const cov = mediaCoverage(m).join(", "); return `<span title="${escapeHtml(cov)}" style="display:inline-block;max-width:220px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:bottom;">${escapeHtml(cov)}</span>`; })()}</td>
          <td>
            <button class="btn ghost sm" data-action="edit-media" data-id="${m.id}">Editar</button>
            <button class="btn danger sm" data-action="delete-media" data-id="${m.id}">✕</button>
          </td>
        </tr>`).join("") || `<tr><td colspan="5" style="text-align:center;color:var(--muted);">${mediaFilterCountry ? "Ningún medio cubre "+escapeHtml(mediaFilterCountry) : "Sin medios"}</td></tr>`}
      </tbody>
    </table>
  </div>
  `;
}

// Sección "Redes sociales" de un MEDIO: desplegable, con un perfil por defecto y, opcionalmente, un
// perfil por cada valor de cobertura (país, región, etc.). Si una cobertura no tiene perfil propio,
// se usa el perfil por defecto. `ctx` = { logoOptions, logos, colors } (compartido por todos).
// Etiqueta del resumen de un desplegable de cobertura ("· personalizado" / "· usa el perfil por defecto").
function mediaCovSummaryHTML(name, custom){
  return `Perfil para «${escapeHtml(name)}» ${custom?'<span style="color:var(--success);font-weight:400;">· personalizado</span>':'<span style="color:var(--muted);font-weight:400;">· usa el perfil por defecto</span>'}`;
}
// ¿Está personalizada una cobertura? (tiene algún dato propio: nombre, usuario, imagen propia o una
// marca de verificación distinta de "usa la del perfil por defecto").
function mediaCovIsCustom(prof){
  prof = prof || {};
  return !!((prof.socialProfileName||"").toString().trim() || (prof.socialUsername||"").toString().trim() || prof.socialAvatarManual || (prof.socialVerified||"").toString().trim());
}
// Un desplegable de perfil por cobertura (cerrado por defecto). La imagen se hereda del perfil por
// defecto (inheritImage); los campos vacíos muestran EN GRIS el dato del perfil por defecto (que es
// lo que se usará). Incluye botón para restablecer esa cobertura al perfil por defecto.
function mediaCoverageProfileHTML(name, i, prof, ctx, defaults){
  prof = prof || {};
  const custom = mediaCovIsCustom(prof);
  const key = "msoc-c"+i;
  return `
    <details style="grid-column:1/-1;border:1px solid var(--border,rgba(255,255,255,0.08));border-radius:8px;padding:8px 12px;margin-bottom:8px;">
      <summary style="cursor:pointer;font-size:12.5px;font-weight:600;color:var(--ink);" data-cov-summary>${mediaCovSummaryHTML(name, custom)}</summary>
      <div style="margin-top:10px;">
        ${socialProfileBlockHTML(key, prof, ctx, name, {inheritImage:true, placeholders:(defaults||{})})}
        <div style="margin-top:8px;display:flex;justify-content:flex-end;">
          <button type="button" class="btn ghost sm" data-action="reset-media-cov-profile" data-key="${key}">Restablecer al perfil por defecto</button>
        </div>
      </div>
    </details>`;
}
// Datos del PERFIL POR DEFECTO leídos EN VIVO del formulario (para los placeholders en gris).
function currentMediaDefaults(){
  const v = id => (document.getElementById(id)||{}).value || "";
  return { profile: v("f-msoc-profile"), username: v("f-msoc-username"), verif: v("f-msoc-verif") };
}
// Actualiza el resumen (personalizado / usa el perfil por defecto) de UN desplegable de cobertura.
function updateMediaCovSummary(wrap){
  if(!wrap) return;
  const key = wrap.getAttribute("data-social-key");
  const v = suf => (document.getElementById("f-"+key+"-"+suf)||{}).value || "";
  const man = (document.getElementById("f-"+key+"-avatar-manual")||{}).value === "1";
  const custom = !!(v("profile").trim() || v("username").trim() || man || v("verif").trim());
  const det = wrap.closest("details");
  const sm = det && det.querySelector("[data-cov-summary]");
  const cov = wrap.getAttribute("data-social-cov");
  if(sm && cov!=null) sm.innerHTML = mediaCovSummaryHTML(cov, custom);
}
// Actualiza los placeholders (en gris) de todas las coberturas con los datos actuales del default.
function updateMediaCovPlaceholders(){
  const d = currentMediaDefaults();
  const VERIF_LABEL = { "":"Ninguna", none:"Ninguna", azul:"Azul", dorado:"Dorado", gris:"Gris" };
  const defVerifLabel = VERIF_LABEL[(d.verif||"").toString()] || "Ninguna";
  document.querySelectorAll('#media-cov-profiles [data-social-cov]').forEach(w=>{
    const key = w.getAttribute("data-social-key");
    const set = (suf, val, fb) => { const e = document.getElementById("f-"+key+"-"+suf); if(e) e.placeholder = val || fb; };
    set("profile", d.profile, "Nombre visible");
    set("username", d.username, "usuario");
    // Actualiza la opción "Según el perfil por defecto (X)" del selector de verificación.
    const vsel = document.getElementById("f-"+key+"-verif");
    if(vsel && vsel.options.length){ vsel.options[0].textContent = "Según el perfil por defecto (" + defVerifLabel + ")"; }
  });
}
// Nombres de cobertura actuales leídos EN VIVO del formulario (sin duplicados, sin vacíos).
function currentMediaCoverageNames(){
  const names = []; const seen = new Set();
  document.querySelectorAll("#media-coverage-rows .media-coverage-name").forEach(inp=>{
    const nm = (inp.value||"").trim(); if(!nm) return;
    const k = normLoose(nm); if(seen.has(k)) return; seen.add(k); names.push(nm);
  });
  return names;
}
// ctx (logos + colores del medio) leído EN VIVO del formulario, para regenerar avatares.
function currentMediaSocialCtx(){
  const val = id => (document.getElementById(id)||{}).value || "";
  return {
    logoOptions: [["hd","Horizontal — oscuro"],["hl","Horizontal — claro"],["vd","Vertical — oscuro"],["vl","Vertical — claro"]],
    logos: { hd: val("f-mlogo-hd-data")||val("f-mlogo-vd-data"), hl: val("f-mlogo-hl-data"), vd: val("f-mlogo-vd-data"), vl: val("f-mlogo-vl-data") },
    colors: [val("f-mcolor1")||"#4F46E5", val("f-mcolor2")||"#15161D", val("f-mcolor3")||"#FFFFFF"],
    colorInputs: ["f-mcolor1","f-mcolor2","f-mcolor3"]
  };
}
// Reconstruye EN VIVO los "Perfiles por cobertura" a partir de las coberturas actuales, conservando
// lo ya personalizado (por nombre de cobertura). Se llama al agregar/quitar/editar coberturas.
function rebuildMediaCoverageProfiles(){
  const host = document.getElementById("media-cov-profiles"); if(!host) return;
  const names = currentMediaCoverageNames();
  // Personalizaciones actuales, leídas del DOM y guardadas por NOMBRE de cobertura.
  const existing = {};
  host.querySelectorAll('[data-social-cov]').forEach(w=>{
    const cov = w.getAttribute("data-social-cov");
    const k = w.getAttribute("data-social-key");
    if(typeof readSocial==="function") existing[cov] = readSocial(k);
  });
  const ctx = currentMediaSocialCtx();
  const defaults = currentMediaDefaults();
  host.innerHTML = names.map((name,i)=> mediaCoverageProfileHTML(name, i, existing[name]||{}, ctx, defaults)).join("");
  const head = document.getElementById("media-cov-head");
  if(head) head.style.display = names.length ? "" : "none";
  // Re-inicializa los avatares de las coberturas nuevas y vuelve a heredar la imagen por defecto.
  host.querySelectorAll("[data-social-key]").forEach(w=>{ if(typeof initSocialAvatarSection==="function") initSocialAvatarSection(w); });
  if(typeof mediaPropagateDefaultAvatar==="function") mediaPropagateDefaultAvatar();
  if(typeof updateMediaCovPlaceholders==="function") updateMediaCovPlaceholders();
}
function mediaSocialSectionHTML(media, ctx){
  const cov = mediaCoverage(media);
  const byCov = (media.socialByCoverage && typeof media.socialByCoverage==="object") ? media.socialByCoverage : {};
  const defaults = { profile: media.socialProfileName||"", username: media.socialUsername||"", verif: media.socialVerified||"" };
  const perCov = cov.map((name, i)=> mediaCoverageProfileHTML(name, i, byCov[name]||{}, ctx, defaults)).join("");
  return `
  <div class="subhead">Redes sociales</div>
  <div style="grid-column:1/-1;" id="media-social">
    <div style="font-size:12px;color:var(--muted);font-weight:600;margin-bottom:6px;">Perfil por defecto</div>
    ${socialProfileBlockHTML("msoc", media, ctx, null, {avatarOnly:true})}
    <div class="subhead" id="media-cov-head" style="margin-top:14px;${cov.length?'':'display:none;'}">Perfiles por cobertura <span style="font-weight:400;color:var(--muted);font-size:11px;">(opcional — cada campo vacío usa el del perfil por defecto, mostrado en gris)</span></div>
    <div id="media-cov-profiles">${perCov}</div>
  </div>`;
}
// Reacciones EN VIVO dentro del modal de medios:
//  - Al escribir una cobertura (país/región): reconstruye los "Perfiles por cobertura".
//  - Al editar un campo de una cobertura: actualiza su resumen (personalizado / usa el perfil por defecto).
//  - Al editar el perfil por defecto (nombre/usuario): refresca los placeholders en gris.
document.addEventListener("input", (e)=>{
  const t = e.target; if(!t || !t.matches) return;
  if(t.id==="media-name-filter"){
    mediaFilterName = t.value;
    if(typeof render==="function") render();
    setTimeout(()=>{ const el=document.getElementById("media-name-filter"); if(el){ el.focus(); try{ el.selectionStart=el.selectionEnd=el.value.length; }catch(err){} } }, 0);
    return;
  }
  if(t.matches(".media-coverage-name")){
    clearTimeout(window._mediaCovRebuildT);
    window._mediaCovRebuildT = setTimeout(()=>{ if(typeof rebuildMediaCoverageProfiles==="function") rebuildMediaCoverageProfiles(); }, 300);
    return;
  }
  if(t.matches(".media-coverage-reach")){
    // Actualiza la etiqueta de banda (Dominante/Muy alto/…) junto al número, en vivo.
    const row = t.closest(".media-coverage-row");
    const band = row && row.querySelector(".media-reach-band");
    if(band && typeof mediaImportanceBand==="function") band.textContent = mediaImportanceBand(t.value);
    return;
  }
  const covWrap = t.closest && t.closest('#media-cov-profiles [data-social-key]');
  if(covWrap){ if(typeof updateMediaCovSummary==="function") updateMediaCovSummary(covWrap); return; }
  if(t.id==="f-msoc-profile" || t.id==="f-msoc-username" || t.id==="f-msoc-verif"){
    if(typeof updateMediaCovPlaceholders==="function") updateMediaCovPlaceholders();
  }
});
// Los <select> disparan 'change' (además de 'input'): cubre la marca de verificación del perfil por
// defecto (refresca las etiquetas de las coberturas) y la de cada cobertura (refresca su resumen).
document.addEventListener("change", (e)=>{
  const t = e.target; if(!t) return;
  if(t.id==="media-country-filter"){ mediaFilterCountry = t.value; if(typeof render==="function") render(); return; }
  if(t.id==="media-news-filter"){ mediaFilterNews = t.value; if(typeof render==="function") render(); return; }
  if(t.id==="f-msoc-verif" && typeof updateMediaCovPlaceholders==="function") updateMediaCovPlaceholders();
  const covWrap = t.closest && t.closest('#media-cov-profiles [data-social-key]');
  if(covWrap && typeof updateMediaCovSummary==="function") updateMediaCovSummary(covWrap);
});
// Resuelve el perfil de redes sociales de un medio para un valor de cobertura dado (país/región/…).
// Devuelve el perfil específico si existe; si no, el perfil por defecto del medio.
function mediaSocialProfile(m, coverageName){
  const def = {
    socialAvatar: (m && m.socialAvatar) || null,
    socialProfileName: (m && m.socialProfileName) || "",
    socialUsername: (m && m.socialUsername) || "",
    socialVerified: (m && m.socialVerified) || "",
    socialAvatarLogo: (m && m.socialAvatarLogo) || null,
    socialAvatarColor: (m && m.socialAvatarColor) || 0
  };
  const bc = (m && m.socialByCoverage) || null;
  const cov = (bc && coverageName && bc[coverageName]) ? bc[coverageName] : null;
  if(!cov) return def;
  // Fallback POR CAMPO: cada dato vacío de la cobertura toma el del perfil por defecto.
  // La imagen es la del default salvo que la cobertura haya subido una propia (manual).
  // El logo del avatar es siempre el del perfil por defecto.
  // Marca de verificación (misma lógica por campo): "" = usa la del default; "none" = Ninguna
  // explícita (sin insignia); azul/dorado/gris = valor propio.
  const t = s => (s==null ? "" : String(s).trim());
  const covVerif = t(cov.socialVerified);
  const resolvedVerif = covVerif==="" ? def.socialVerified : (covVerif==="none" ? "" : covVerif);
  return {
    socialAvatar: (cov.socialAvatarManual && cov.socialAvatar) ? cov.socialAvatar : def.socialAvatar,
    socialAvatarManual: !!cov.socialAvatarManual,
    socialProfileName: t(cov.socialProfileName) || def.socialProfileName,
    socialUsername:    t(cov.socialUsername)    || def.socialUsername,
    socialVerified:    resolvedVerif,
    socialAvatarLogo:  def.socialAvatarLogo,
    socialAvatarColor: def.socialAvatarColor
  };
}

function modalAddEditMedia(media){
  const isEdit = !!media;
  media = media || {id:null, name:"", categories:[], newsSource:true, coverage:["Internacional"], reach:20, logoImg:null, logoVDark:null, logoVLight:null, logoHDark:null, logoHLight:null, logoPrincipal:"horizontal", logoGrafico:"hd", color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF", socialAvatar:null, socialAvatarManual:false, socialProfileName:"", socialUsername:"", socialVerified:"", socialAvatarLogo:"hd", socialAvatarColor:0, socialByCoverage:{}};
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

          <div class="subhead">Cobertura e importancia <span style="font-weight:400;color:var(--muted);font-size:11px;">(países, ciudades, confederaciones o regiones — con su importancia de 1 a 100 al lado: a mayor número, más relevante es el medio ahí)</span></div>
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
            colors: [media.color1||"#4F46E5", media.color2||"#15161D", media.color3||"#FFFFFF"],
            colorInputs: ["f-mcolor1","f-mcolor2","f-mcolor3"]
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
