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
        ${(DB.leagues||[]).length? DB.leagues.map(c=>`<span class="badge conf">${escapeHtml(c)} <button data-action="delete-catalog-item" data-cat="leagues" data-value="${encodeURIComponent(c)}" style="border:none;background:none;cursor:pointer;color:inherit;margin-left:2px;">×</button></span>`).join("") : `<span style="font-size:12.5px;color:var(--muted);">Aún ninguna</span>`}
      </div>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:13px;">Marcas de ropa</h3>
      <p style="font-size:12px;color:var(--muted);margin:0;">Las marcas de ropa ahora son <b>patrocinadores</b> (categoría «Indumentaria»). Adminístralas desde la pestaña <b>Patrocinadores</b>. Al escribirlas en una selección o jugador se crean solas como patrocinador.</p>
    </div>
    <div class="card">
      <h3 style="margin-top:0;font-size:13px;">Categorías de patrocinio (${DB.sponsorCategories.length})</h3>
      <div class="tag-list">
        ${DB.sponsorCategories.map(c=>`<span class="badge conf">${c} <button data-action="delete-catalog-item" data-cat="sponsorCategories" data-value="${encodeURIComponent(c)}" style="border:none;background:none;cursor:pointer;color:inherit;margin-left:2px;">×</button></span>`).join("")}
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
          ${DB.teams.slice().sort((a,b)=>a.commonName.localeCompare(b.commonName)).map(t=>`<option value="${t.id}" ${bulkImportTeamId===t.id?"selected":""}>${t.commonName}</option>`).join("")}
        </select>
      </label>
    </div>
    <label class="field">Pega aquí las filas
      <textarea class="json-area" id="bulk-import-area" placeholder="Columnas: Dorsal, Pos, Nombre, Apellido, Nombre común, Nombre completo, Fecha nac., Estatura (cm), Caps, Goles, Club, Camiseta, Marca, Rating, Rating potencial&#10;Ej:&#10;10	FW	Lionel	Messi		Lionel Andrés Messi	June 24, 1987	170	191	112	Inter Miami	MESSI	Adidas	93	93&#10;16	FW	Julián	Quiñones		Julián Andrés Quiñones Quiñones	March 24, 1997	177	22	2	Al-Qadsiah	J.QUIÑONES	Nike	78	82"></textarea></textarea>
    </label>
    <div style="margin-top:10px;display:flex;gap:8px;">
      <button class="btn gold" data-action="bulk-import-players">Importar jugadores</button>
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

  <div class="section-title"><h2>Exportar / Importar</h2><span class="hint">Copia tu base de datos como JSON o pega una para reemplazarla</span></div>
  <div class="card">
    <label class="field">JSON actual (puedes copiarlo como respaldo)
      <textarea class="json-area" readonly>${JSON.stringify(DB, null, 1)}</textarea>
    </label>
    <div style="height:10px;"></div>
    <label class="field">Pegar JSON para importar
      <textarea class="json-area" id="import-area" placeholder="Pega aquí un JSON exportado previamente..."></textarea>
    </label>
    <div style="margin-top:10px;display:flex;gap:8px;">
      <button class="btn" data-action="import-json">Importar y reemplazar</button>
    </div>
  </div>
  `;
}
