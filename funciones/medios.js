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
function renderMedios(){
  return `
  <div class="section-title"><h2>${tabLabel('medios','Medios')}</h2><button class="btn gold sm" data-action="add-media">+ Agregar medio</button></div>
  ${tabDescHTML('medios')}
  <div class="tbl-wrap">
    <table>
      <thead><tr><th style="width:52px;"></th><th>Medio</th><th>Tipo</th><th>Cobertura</th><th>Alcance (M de personas)</th><th></th></tr></thead>
      <tbody>
      ${DB.media.map(m=>`<tr>
          <td>${brandLogoHTML(m, 34)}</td>
          <td><b>${escapeHtml(m.name)}</b></td>
          <td>${escapeHtml(m.type)}</td>
          <td>${escapeHtml(m.country)}</td>
          <td class="mono">${m.reach}</td>
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

function modalAddEditMedia(media){
  const isEdit = !!media;
  media = media || {id:null, name:"", type:"TV abierta", country:"Internacional", reach:20, logoImg:null, logoVDark:null, logoVLight:null, logoHDark:null, logoHLight:null, logoPrincipal:"horizontal", color1:"#4F46E5", color2:"#15161D", color3:"#FFFFFF"};
  // Compatibilidad: si solo existe el logo heredado, se muestra como "Horizontal — fondo oscuro".
  if(media.logoImg && !media.logoVDark && !media.logoHDark && !media.logoVLight && !media.logoHLight){ media = Object.assign({}, media, {logoHDark: media.logoImg}); }
  openModal(`
    <div class="modal-box">
      <div class="modal-head"><h2>${isEdit?"Editar medio":"Agregar medio"}</h2><button class="modal-close" data-action="close-modal">×</button></div>
      <div class="modal-body">
        <div class="form-grid">
          <label class="field" style="grid-column:1/-1;">${T('media.name.label')}<input id="f-mname" value="${escapeHtml(media.name||'')}"></label>
          <label class="field">${T('media.type.label')}
            <select id="f-mtype">
              ${["TV abierta","TV de paga","Radio","Streaming","Digital/Prensa"].map(t=>`<option ${t===media.type?"selected":""}>${t}</option>`).join("")}
            </select>
          </label>
          <label class="field">${T('media.country.label')}<input id="f-mcountry" value="${escapeHtml(media.country||'')}"></label>
          <label class="field">${T('media.reach.label')}<input id="f-mreach" type="number" min="0" value="${media.reach}"></label>

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
            <div style="display:flex;align-items:center;gap:18px;font-size:12px;color:var(--muted);font-weight:600;">
              <span>Logo principal:</span>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;"><input type="radio" name="media-principal" value="horizontal" style="width:auto;" ${((media.logoPrincipal||'horizontal')==='horizontal')?'checked':''}> Horizontal</label>
              <label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-weight:600;"><input type="radio" name="media-principal" value="vertical" style="width:auto;" ${(media.logoPrincipal==='vertical')?'checked':''}> Vertical</label>
            </div>
          </div>

          <div class="subhead">Colores</div>
          <div style="grid-column:1/-1;display:flex;gap:16px;flex-wrap:wrap;">
            <label class="field" style="flex:0 0 auto;">Color 1${colorPickerHTML("color-square", media.color1||'#4F46E5', "f-mcolor1")}</label>
            <label class="field" style="flex:0 0 auto;">Color 2${colorPickerHTML("color-square", media.color2||'#15161D', "f-mcolor2")}</label>
            <label class="field" style="flex:0 0 auto;">Color 3${colorPickerHTML("color-square", media.color3||'#FFFFFF', "f-mcolor3")}</label>
          </div>
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn ghost" data-action="close-modal">Cancelar</button>
        <button class="btn gold" data-action="save-media" data-id="${media.id||''}">Guardar</button>
      </div>
    </div>
  `);
}
