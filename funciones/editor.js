/* =========================================================
   COPA MANAGER 2026 — funciones/editor.js
   Panel de administración (presentación): edición de textos de interfaz,
   catálogo de países e import/export JSON de la base — SOLO la vista.
   Extracción mecánica: texto y orden idénticos al original. Script CLÁSICO
   (no module). Cargar DESPUÉS de app/textos-ui.js (T, tabLabel, tabDescHTML,
   groupedTextKeys), funciones/paises.js (countryRowHTML, sortedCountries) y
   core/utilidades.js (escapeHtml), y ANTES del <script> inline. Lee DB/HISTORY
   en tiempo de ejecución. DECISIÓN ARQUITECTÓNICA: editor.js es un módulo de
   presentación, NO el propietario del sistema de eventos: los listeners de
   textos de interfaz y países (en attachHandlers) y los casos import-json,
   clear-history y delete-history-entry (en handleAction) permanecen en el
   inline, reservados al núcleo. Los botones data-action de esta vista los
   despacha handleAction (inline).
   ========================================================= */

/* ---------- EDITOR / BASE DE DATOS ---------- */
function renderEditor(){
  return `
  <div class="section-title"><h2>${tabLabel('editor','Editor / Base de datos')}</h2></div>
  ${tabDescHTML('editor')}
  <div class="grid cols-2">
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Agregar selección nueva</h3>
      <p style="font-size:12.5px;color:var(--muted);">El juego no está limitado a 48 equipos: puedes sumar selecciones, equipos invitados, o ligas ficticias.</p>
      <button class="btn gold" data-action="add-team">+ Agregar selección</button>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:14px;">Restablecer datos</h3>
      <p style="font-size:12.5px;color:var(--muted);">Vuelve a la base inicial de 48 selecciones (se pierde lo editado).</p>
      <button class="btn danger" data-action="reset-db">Restablecer todo</button>
    </div>
  </div>

  <div class="section-title"><h2>Editar textos de la interfaz</h2><span class="hint">Etiquetas, ayudas, placeholders y nombres de pestañas — todo en un solo lugar, no cambia el diseño, solo el texto</span></div>
  <div class="card">
    <input type="text" id="ui-text-search" placeholder="Buscar un texto o campo (ej: 'COI', 'club', 'patrocinador')..." style="margin-bottom:14px;">
    <div id="ui-text-groups">
      ${Object.entries(groupedTextKeys()).map(([group,keys])=>`
        <details style="margin-bottom:10px;border:1px solid var(--line);border-radius:8px;padding:8px 12px;">
          <summary style="cursor:pointer;font-weight:700;font-size:13px;padding:4px 0;">${GROUP_LABELS[group]||group} <span style="color:var(--muted);font-weight:500;">(${keys.length})</span></summary>
          <div style="margin-top:10px;">
            ${keys.map(k=>`
              <div class="ui-text-row" data-search="${((GROUP_LABELS[group]||group)+' '+k+' '+T(k)).toLowerCase()}" style="margin-bottom:10px;">
                <label class="field">${k}
                  <input id="ui-text-${k}" value="${String(T(k)).replace(/"/g,"&quot;")}">
                </label>
              </div>
            `).join("")}
          </div>
        </details>
      `).join("")}
    </div>
    <div style="display:flex;gap:8px;margin-top:6px;">
      <button class="btn gold" data-action="save-ui-text">Guardar todos los textos</button>
      <button class="btn danger" data-action="reset-ui-text">Restablecer todos los textos</button>
    </div>
  </div>

  <div class="section-title"><h2>Catálogos reutilizables</h2><span class="hint">Se llenan solos cuando los usas en formularios — bórralos aquí si ya no los necesitas</span></div>
  <div class="grid cols-3">
    <div class="card">
      <h3 style="margin-top:0;font-size:13px;">Ligas (${(DB.leagues||[]).length})</h3>
      <div class="tag-list">
        ${(DB.leagues||[]).length? sortAlpha(DB.leagues).map(c=>`<span class="badge conf">${escapeHtml(c)} <button data-action="delete-catalog-item" data-cat="leagues" data-value="${encodeURIComponent(c)}" style="border:none;background:none;cursor:pointer;color:inherit;margin-left:2px;">×</button></span>`).join("") : `<span style="font-size:12.5px;color:var(--muted);">Aún ninguna</span>`}
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:13px;">Ciudades (${allCities().length})</h3>
      <div class="tag-list">
        ${allCities().length? allCities().map(c=>`<span class="badge conf">${escapeHtml(c)} <button data-action="delete-catalog-item" data-cat="cities" data-value="${encodeURIComponent(c)}" style="border:none;background:none;cursor:pointer;color:inherit;margin-left:2px;">×</button></span>`).join("") : `<span style="font-size:12.5px;color:var(--muted);">Aún ninguna</span>`}
      </div>
      <p style="font-size:11px;color:var(--muted);margin:8px 0 0;">Se llenan solas con las ciudades de estadios y clubes.</p>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:13px;">Categorías de patrocinio (${DB.sponsorCategories.length})</h3>
      <div class="tag-list">
        ${sortAlpha(DB.sponsorCategories).map(c=>`<span class="badge conf">${c} <button data-action="delete-catalog-item" data-cat="sponsorCategories" data-value="${encodeURIComponent(c)}" style="border:none;background:none;cursor:pointer;color:inherit;margin-left:2px;">×</button></span>`).join("")}
      </div>
    </div>
  </div>

  <div class="section-title"><h2>Importar jugadores desde Excel</h2><span class="hint">Copia celdas de Excel/Sheets y pégalas aquí</span></div>
  <div class="card">
    <p style="font-size:12.5px;color:var(--muted);margin-top:0;">
      ${T('general.bulk.instructions')}
    </p>
    <div class="form-grid" style="margin-bottom:10px;">
      <label class="field" style="grid-column:1/-1;">Selección destino
        <select id="bulk-team-select">
          <option value="">— Elige una selección —</option>
          ${DB.teams.slice().filter(t=>!t.hidden).sort((a,b)=>a.commonName.localeCompare(b.commonName)).map(t=>`<option value="${t.id}" ${bulkImportTeamId===t.id?"selected":""}>${t.commonName}</option>`).join("")}
        </select>
      </label>
    </div>
    <label class="field">Pega aquí las filas
      <textarea class="json-area" id="bulk-import-area" placeholder="Columnas: Dorsal, Pos, Nombre, Apellido, Nombre común, Nombre completo, Fecha nac., Estatura (cm), Caps, Goles, Club, Nombre en camiseta (selección), Marca, Rating, Rating potencial&#10;Ej:&#10;10	FW	Lionel	Messi		Lionel Andrés Messi	June 24, 1987	170	191	112	Inter Miami	MESSI	Adidas	93	93&#10;16	FW	Julián	Quiñones		Julián Andrés Quiñones Quiñones	March 24, 1997	177	22	2	Al-Qadsiah	J.QUIÑONES	Nike	78	82"></textarea>
    </label>
    <div style="margin-top:10px;display:flex;flex-direction:column;gap:10px;">
      <label style="display:flex;align-items:flex-start;gap:10px;cursor:pointer;">
        <input type="checkbox" id="bulk-only-new" style="flex:0 0 auto;margin-top:3px;width:16px;height:16px;">
        <span style="flex:1 1 auto;min-width:0;font-size:12.5px;color:var(--muted);line-height:1.55;">
          <b style="color:var(--ink);">Cargar solo datos nuevos.</b> No agrega ni elimina jugadores: actualiza <b>cualquier dato presente</b> de los jugadores que ya existan y coincidan, <b>excepto las primeras 6 columnas</b> (Dorsal, Posición, Nombre, Apellido, Nombre común, Nombre completo), que solo sirven para emparejar. Una fila se carga solo si coinciden <b>Dorsal + Apellido</b> o <b>Nombre + Apellido</b>; si no, se salta.
          <br><span style="display:block;margin-top:5px;font-size:11px;">Columnas (en este orden): Dorsal, Posición, Nombre, Apellido, Nombre común, Nombre completo <span style="opacity:.75;">(estas 6 solo emparejan)</span>, Fecha nac., Estatura, Caps, Goles, Club, Nombre en camiseta (selección), Nombre en camiseta (club), Marca, Rating, Rating pot., Perfil izquierdo, Perfil derecho, luego 10 pares <b>Posición · Valor</b> (código y valor 0–20), Dorsal favorito (selección), Dorsal favorito (club). Las celdas vacías no borran el dato existente.</span>
        </span>
      </label>
      <div style="display:flex;gap:8px;">
        <button class="btn gold" data-action="bulk-import-players">Importar jugadores</button>
      </div>
    </div>
  </div>

  <div class="section-title"><h2>Uniformes</h2><span class="hint">Bases de prendas recoloreables (camisetas, shorts, calcetas) y tipografías de número para armar los kits de cada selección</span></div>
  <div class="card" data-action="toggle-garments-parent" style="cursor:pointer;display:flex;justify-content:space-between;align-items:center;margin-bottom:${garmentsParentExpanded?'14px':'0'};">
    <span style="font-size:13px;color:var(--muted);">${DB.kitBases.length + DB.shortsBases.length + DB.socksBases.length} base(s) + ${DB.numberFonts.length} tipografía(s)</span>
    <span class="mono" style="color:var(--muted);font-size:14px;">${garmentsParentExpanded?"▾":"▸"}</span>
  </div>
  ${garmentsParentExpanded ? `
  ${renderGarmentSection("shirt")}
  ${renderGarmentSection("shorts")}
  ${renderGarmentSection("socks")}
  ${renderNumberFontsSection()}
  ${renderBackBasesSection()}
  ` : ""}

  <div class="section-title"><h2>Catálogo de países / entidades (FIFA y COI)</h2><span class="hint">${DB.countries.length} registros — siempre los 306, se liguen o no a una selección absoluta</span></div>
  <div class="card">
    <div class="searchbar" style="margin-bottom:10px;">
      <input type="text" id="country-search" placeholder="Buscar país, código FIFA o COI...">
      <button class="btn gold sm" data-action="add-country">+ Agregar país / entidad</button>
      <button class="btn ghost sm" data-action="create-missing-teams">Crear selecciones para países con confederación</button>
    </div>
    <div style="max-height:480px;overflow-y:auto;border:1px solid var(--line);border-radius:8px;">
      <table>
        <thead style="position:sticky;top:0;background:var(--surface);z-index:1;">
          <tr><th>Nombre</th><th>FIFA</th><th>COI</th><th>Confederación</th><th>FIFA</th><th>COI</th><th>Selección Absoluta</th><th>País / estatus</th><th></th></tr>
        </thead>
        <tbody id="country-tbody">
          ${sortedCountries().map(c=>countryRowHTML(c)).join("") || `<tr><td colspan="9" style="text-align:center;color:var(--muted);">Sin registros</td></tr>`}
        </tbody>
      </table>
    </div>
  </div>

  <details class="region-catalog">
    <summary class="section-title" style="cursor:pointer;list-style:none;"><h2>Catálogo de regiones <span style="font-size:13px;color:var(--muted);font-weight:400;">▾</span></h2><span class="hint">Grupos de países para definir la cobertura de medios — se pueden agregar o quitar</span></summary>
    <div class="card">
      <div style="margin-bottom:10px;"><button class="btn gold sm" data-action="add-region">+ Agregar región</button></div>
      <div id="regions-list">
        ${(()=>{ const R=getRegions(); const all=Object.keys(R); const recent=(typeof regionRecent!=="undefined"?regionRecent:[]).filter(n=>n in R); const rest=all.filter(n=>!recent.includes(n)).sort((a,b)=>a.localeCompare(b,'es')); const ordered=[...recent,...rest]; const open=(typeof regionOpen!=="undefined"?regionOpen:{}); return ordered.length ? ordered.map(n=>regionDetailsHTML(n, R[n], !!open[n])).join("") : `<p style="font-size:12.5px;color:var(--muted);margin:0;">Sin regiones. Usa «Agregar región».</p>`; })()}
      </div>
      <datalist id="region-country-list">${(DB.countries||[]).map(c=>`<option value="${escapeHtml(c.commonName||'')}">`).join("")}</datalist>
    </div>
  </details>

  <div class="section-title"><h2>Historial de cambios</h2><span class="hint">Últimos ${HISTORY_MAX} guardados en la base — eliminar uno la revierte a como estaba antes de ese cambio</span></div>
  <div class="card">
    ${HISTORY.length ? `
    <div>
      ${HISTORY.slice().reverse().map((h,ri)=>{
        const d = new Date(h.ts);
        const fecha = d.toLocaleDateString('es-MX',{day:'2-digit',month:'short'}) + " · " + d.toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'});
        const posteriores = ri; // cuántos cambios hay después de éste (la lista va del más reciente al más viejo)
        return `
        <div style="display:flex;align-items:center;gap:10px;padding:8px 4px;${ri < HISTORY.length-1 ? 'border-bottom:1px solid var(--line);' : ''}">
          <span style="font-size:11px;color:var(--muted);flex-shrink:0;width:100px;">${fecha}</span>
          <span style="font-size:12.5px;flex:1;">${escapeHtml(h.desc)}</span>
          <button class="btn danger sm" data-action="delete-history-entry" data-id="${h.id}" data-after="${posteriores}" title="Revertir este cambio${posteriores?` (y los ${posteriores} posteriores)`:''}" style="flex-shrink:0;">✕</button>
        </div>`;
      }).join("")}
    </div>
    <div style="display:flex;gap:8px;margin-top:12px;align-items:center;">
      <button class="btn ghost sm" data-action="clear-history">Vaciar historial</button>
      <span class="hint" style="font-size:11px;">Vaciar solo borra la lista — tus datos no cambian.</span>
    </div>`
    : `<p style="font-size:12.5px;color:var(--muted);margin:0;">Aún no hay cambios registrados. Desde ahora, cada guardado deja aquí una entrada con lo que cambió.</p>`}
  </div>

  <div class="section-title"><h2>Exportar / Importar</h2><span class="hint">Descarga tu base como archivo .json o carga uno para reemplazarla</span></div>
  <div class="card">
    <div style="font-size:12.5px;color:var(--muted);margin-bottom:10px;">El respaldo contiene solo tus cambios respecto a la base del juego (datos editados, logos, uniformes, colores, fotos, tipografías, catálogos). Lo que no tocaste no se incluye.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center;">
      <button class="btn gold sm" data-action="download-backup">⬇ Descargar respaldo (.json)</button>
      <button class="btn sm" data-action="trigger-import-file">⬆ Cargar respaldo (.json)</button>
      <input type="file" id="import-file" accept=".json,application/json" style="display:none;">
    </div>
    <div class="hint" style="font-size:11px;margin-top:8px;">Descargar y cargar un archivo es más rápido que copiar y pegar, sobre todo cuando hay muchas imágenes.</div>

    <details style="margin-top:14px;">
      <summary style="cursor:pointer;font-size:12.5px;color:var(--muted);font-weight:600;">¿Prefieres copiar/pegar el texto? (avanzado)</summary>
      <div style="margin-top:12px;">
        <label class="field">JSON actual
          <textarea class="json-area" id="export-area" readonly placeholder="Pulsa «Generar JSON» para verlo y copiarlo."></textarea>
        </label>
        <div style="margin-top:8px;display:flex;gap:8px;align-items:center;">
          <button class="btn ghost sm" data-action="export-json">Generar JSON</button>
          <span class="hint" style="font-size:11px;">Se genera solo al pulsar.</span>
        </div>
        <label class="field" style="margin-top:12px;">Pegar JSON para importar
          <textarea class="json-area" id="import-area" placeholder="Pega aquí un JSON exportado previamente..."></textarea>
        </label>
        <div style="margin-top:10px;"><button class="btn" data-action="import-json">Importar y reemplazar</button></div>
      </div>
    </details>
  </div>
  `;
}

// Descarga un texto como archivo (para el respaldo .json). Evita pintar decenas de MB en un
// <textarea>, que era lo más lento de «Generar JSON».
function downloadTextFile(filename, text, mime){
  try{
    const blob = new Blob([text], {type: mime || "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename || "descarga.json";
    document.body.appendChild(a); a.click();
    setTimeout(()=>{ try{ document.body.removeChild(a); }catch(e){} try{ URL.revokeObjectURL(url); }catch(e){} }, 0);
    return true;
  }catch(e){ return false; }
}
// Nombre del archivo de respaldo, con fecha (AAAA-MM-DD) si el navegador la da.
function backupFileName(){
  let stamp = "";
  try{ stamp = new Date().toISOString().slice(0,10); }catch(e){}
  return "copa-manager-respaldo" + (stamp ? ("-"+stamp) : "") + ".json";
}
// Al elegir un archivo en «Cargar respaldo (.json)», se lee y se importa (misma lógica que pegar el
// texto). Listener global, delegado por id del input (el editor se re-renderiza).
document.addEventListener("change", (e)=>{
  const inp = e.target;
  if(!inp || inp.id!=="import-file") return;
  const f = inp.files && inp.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload  = ()=>{ try{ if(typeof applyImportedBackupText==="function") applyImportedBackupText(String(reader.result||"")); } finally { inp.value=""; } };
  reader.onerror = ()=>{ alert("No se pudo leer el archivo."); inp.value=""; };
  reader.readAsText(f);
});

// Estado efímero del editor de regiones: `regionRecent` = nombres recién agregados (se muestran
// arriba) y `regionOpen` = regiones que deben renderizarse abiertas. Se limpian al cambiar de pestaña
// (regionEditorReset, llamado desde navigateTo), así el orden vuelve a ser alfabético.
var regionRecent = [];
var regionOpen = {};
function regionEditorReset(){ regionRecent = []; regionOpen = {}; }

// Renombra una región (clave de DB.regions) y propaga el cambio a TODO lo que la usa: la cobertura de
// los medios (coverage, coverageReach y socialByCoverage). Devuelve true si se aplicó.
function renameRegion(oldName, newName){
  oldName = (oldName||"").trim();
  newName = (newName||"").trim();
  if(!newName || newName===oldName) return false;
  const R = getRegions();
  if(!(oldName in R)) return false;
  // No permitir chocar con otra región ya existente (ignorando mayúsculas/acentos).
  const clash = Object.keys(R).some(k=> k!==oldName && normLoose(k)===normLoose(newName));
  if(clash){ alert("Ya existe una región con ese nombre."); return false; }
  // Reconstruir el objeto conservando el ORDEN, solo renombrando la clave.
  const rebuilt = {};
  Object.keys(R).forEach(k=>{ rebuilt[ (k===oldName ? newName : k) ] = R[k]; });
  DB.regions = rebuilt;
  // Propagar a la cobertura de los medios.
  (DB.media||[]).forEach(m=>{
    if(Array.isArray(m.coverage)) m.coverage = m.coverage.map(c=> c===oldName ? newName : c);
    if(m.country===oldName) m.country = newName;
    if(m.coverageReach && typeof m.coverageReach==="object" && (oldName in m.coverageReach)){
      const v = m.coverageReach[oldName]; delete m.coverageReach[oldName]; m.coverageReach[newName] = v;
    }
    if(m.socialByCoverage && typeof m.socialByCoverage==="object" && (oldName in m.socialByCoverage)){
      const v = m.socialByCoverage[oldName]; delete m.socialByCoverage[oldName]; m.socialByCoverage[newName] = v;
    }
  });
  // Conservar el estado del editor con el nuevo nombre y dejar la región renombrada visible arriba.
  if(typeof regionRecent!=="undefined"){
    regionRecent = regionRecent.map(n=> n===oldName ? newName : n);
    if(regionRecent.indexOf(newName)<0) regionRecent.unshift(newName);
  }
  if(typeof regionOpen!=="undefined"){ if(regionOpen[oldName]) regionOpen[newName] = true; delete regionOpen[oldName]; }
  persist();
  return true;
}
// Al editar el nombre de una región (blur o Enter), se aplica el renombrado y se re-renderiza.
document.addEventListener("change", (e)=>{
  const inp = e.target;
  if(!inp || !inp.classList || !inp.classList.contains("region-name-input")) return;
  const oldName = inp.dataset.oldname || "";
  const newName = (inp.value||"").trim();
  if(!newName){ inp.value = oldName; return; }       // vacío: revertir sin cambios
  if(newName===oldName) return;                       // sin cambios
  if(renameRegion(oldName, newName)){ render(); }     // aplicado: refrescar la vista
  else { inp.value = oldName; }                        // colisión u error: revertir
});

// Un renglón colapsable por región (nombre + lista de países editable).
function regionDetailsHTML(name, countries, open){
  countries = Array.isArray(countries) ? countries : [];
  const chips = countries.length
    ? countries.map(c=>`<span class="badge" style="display:inline-flex;align-items:center;gap:6px;background:var(--surface-2);color:var(--ink);margin:0 6px 6px 0;padding:4px 8px;border-radius:20px;font-size:12px;">${escapeHtml(c)}<button class="btn danger sm" data-action="remove-region-country" data-name="${escapeHtml(name)}" data-country="${escapeHtml(c)}" style="padding:0 6px;line-height:1.4;">✕</button></span>`).join("")
    : `<span class="hint" style="font-size:12px;">Sin países todavía.</span>`;
  return `
  <details class="region-item" data-region="${escapeHtml(name)}" ${open?'open':''} style="border:1px solid var(--line);border-radius:8px;margin-bottom:8px;padding:8px 12px;">
    <summary style="cursor:pointer;display:flex;align-items:center;gap:10px;list-style:none;">
      <input class="region-name-input" value="${escapeHtml(name)}" data-oldname="${escapeHtml(name)}"
        onclick="event.stopPropagation();" onkeydown="if(event.key==='Enter'){event.preventDefault();this.blur();}"
        title="Editar el nombre de la región"
        style="font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:14px;color:var(--ink);background:var(--surface-2);border:1px solid var(--line);border-radius:6px;padding:3px 8px;min-width:120px;max-width:280px;">
      <span class="hint" style="font-size:11px;">${countries.length} ${countries.length===1?'país':'países'}</span>
      <span style="flex:1;"></span>
      <button class="btn danger sm" data-action="remove-region" data-name="${escapeHtml(name)}" onclick="event.preventDefault();" style="flex-shrink:0;">Quitar región</button>
    </summary>
    <div style="padding:10px 2px 2px;">
      <div style="display:flex;flex-wrap:wrap;">${chips}</div>
      <div style="margin-top:10px;display:flex;gap:6px;align-items:center;">
        <input class="region-add-country" list="region-country-list" data-name="${escapeHtml(name)}" placeholder="Agregar país…" style="flex:1;max-width:280px;">
        <button class="btn ghost sm" data-action="add-region-country" data-name="${escapeHtml(name)}">Agregar país</button>
      </div>
    </div>
  </details>`;
}
