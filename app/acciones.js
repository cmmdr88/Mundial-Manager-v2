/* =========================================================
   COPA MANAGER 2026 — app/acciones.js
   Núcleo — despacho de acciones: handleAction, el switch central que traduce cada
   data-action (~152 casos) en operaciones sobre DB, navegación, persistencia,
   historial, modales y vistas. Es un COORDINADOR: invoca funciones de otros módulos
   (render y navigate del router, persist de almacenamiento, recordHistory y
   deleteHistoryFrom de historial, getTeam y buildDefaultDB de modelo-db, migrateDB,
   ensureTeamKits de modelo-kits, modalManageKits y modalAddEditKit de ui-kits, y las
   funciones save y modales de cada dominio) y los helpers de formulario del inline;
   NO define lógica de negocio propia. Los casos reservados (editor, kits, historial,
   navegación, import y export) permanecen íntegros aquí, sin fragmentar. Extracción
   mecánica: texto y orden idénticos al original. Script CLÁSICO (no module). Cargar
   DESPUÉS de todos los módulos que invoca (dominios, router, persistencia, historial,
   modelo-db, uniformes) y ANTES del <script> inline. Lo invocan los listeners de click
   (attachHandlers e inline), que permanecen en el inline. attachHandlers e init NO
   forman parte de este módulo (paso 28).
   ========================================================= */

function handleAction(action, el){
  switch(action){
    case "goto-calendario": navigateTo("calendario", null); break;
    case "goto-editor": navigateTo("editor", null); break;
    case "goto-patrocinadores": navigateTo("patrocinadores", null); break;
    case "goto-evento": eventoDetailOpen = false; navigateTo("evento", null); break;
    case "open-evento-detail": eventoDetailOpen = true; render(); scrollToTop(); break;
    case "back-evento": eventoDetailOpen = false; render(); scrollToTop(); break;
    case "ev-add-host-row": {
      const wrap = document.getElementById("ev-host-rows");
      if(wrap) wrap.insertAdjacentHTML("beforeend", eventHostRowHTML(""));
      break;
    }
    case "ev-del-host-row": {
      const row = el.closest(".ev-host-row");
      if(row) row.remove();
      break;
    }
    /* ---- Editor del evento: etiqueta de año por campo e historial ---- */
    case "ev-set-field-style": {
      // Selector XX/XXXX por campo: activa el botón elegido dentro de su propio grupo.
      const fieldId = el.dataset.field;
      document.querySelectorAll(`.ev-field-style[data-for="${fieldId}"] [data-action="ev-set-field-style"]`).forEach(btn=>{
        btn.classList.remove("gold"); btn.classList.add("ghost");
      });
      el.classList.remove("ghost"); el.classList.add("gold");
      updateEventPreviews();
      break;
    }
    case "ev-toggle-year-tag": {
      // Inserta o quita el chip de etiqueta en un campo contenteditable.
      // Solo este botón controla la etiqueta; el chip en sí es pasivo (no editable, sin ✕).
      const box = document.getElementById(el.dataset.target);
      if(!box) break;
      const existing = box.querySelector('[data-chip="year"]');
      if(existing){
        existing.remove();
      } else {
        const chip = document.createElement("span");
        chip.className = "ev-year-chip";
        chip.setAttribute("contenteditable","false");
        chip.setAttribute("data-chip","year");
        chip.textContent = "Etiqueta de año";
        // Inserta en la posición del cursor si está dentro del campo; si no, al final.
        const sel = window.getSelection();
        if(sel && sel.rangeCount && box.contains(sel.anchorNode)){
          const range = sel.getRangeAt(0);
          range.collapse(false);
          range.insertNode(chip);
          range.setStartAfter(chip); range.collapse(true);
          sel.removeAllRanges(); sel.addRange(range);
        } else {
          box.appendChild(chip);
        }
      }
      updateEventPreviews();
      break;
    }
    case "ev-add-history-row": {
      const wrap = document.getElementById("ev-history-rows");
      if(!wrap) break;
      const idx = wrap.querySelectorAll(".ev-history-row").length;
      wrap.insertAdjacentHTML("beforeend", eventHistoryRowHTML(null, idx));
      break;
    }
    case "ev-del-history-row": {
      const row = el.closest(".ev-history-row");
      if(row) row.remove();
      break;
    }
    case "ev-add-history-host-row": {
      const hrow = el.closest(".ev-history-row");
      if(!hrow) break;
      const wrap = hrow.querySelector(".evh-host-rows");
      if(wrap) wrap.insertAdjacentHTML("beforeend", eventHistoryHostRowHTML(""));
      break;
    }
    case "ev-del-history-host-row": {
      const row = el.closest(".evh-host-row");
      if(row) row.remove();
      break;
    }
    case "load-official-calendar": loadOfficialCalendarConfirm(); break;

    /* ---- El Evento ---- */
    case "edit-event-general": modalEditEventGeneral(); break;
    case "save-event-general": saveEventGeneral(); break;
    case "edit-event-bracket": eventBracketDraft = null; modalEditEventBracket(); break;
    case "close-event-bracket": eventBracketDraft = null; closeModal(); break;
    case "save-event-bracket": saveEventBracket(); break;
    case "event-bracket-add-match": {
      readEventBracketDraftFromDOM();
      const r = eventBracketDraft[parseInt(el.dataset.ri)];
      if(r) r.matches.push({id:"M"+(100+Math.floor(Math.random()*900)), a:"", b:""});
      modalEditEventBracket(); break;
    }
    case "event-bracket-del-match": {
      readEventBracketDraftFromDOM();
      const r = eventBracketDraft[parseInt(el.dataset.ri)];
      if(r) r.matches.splice(parseInt(el.dataset.mi), 1);
      modalEditEventBracket(); break;
    }
    case "event-bracket-add-round": {
      readEventBracketDraftFromDOM();
      eventBracketDraft.push({id:uid(), name:"Nueva ronda", matches:[{id:"M?", a:"", b:""}]});
      modalEditEventBracket(); break;
    }
    case "event-bracket-del-round": {
      readEventBracketDraftFromDOM();
      eventBracketDraft.splice(parseInt(el.dataset.ri), 1);
      modalEditEventBracket(); break;
    }
    case "edit-event-tiebreakers": modalEditEventTiebreakers(); break;
    case "save-event-tiebreakers": saveEventTiebreakers(); break;
    case "reset-event": {
      modalConfirm("¿Restablecer el evento a los datos oficiales del Mundial 2026? Se pierde lo editado en la ficha del torneo (selecciones, jugadores y demás no se tocan).", ()=>{
        DB.event = buildDefaultEvent();
        persist(); render(); showToast("Evento restablecido (Mundial 2026)");
      }, "Restablecer");
      break;
    }
    case "event-calc-thirds": {
      const checked = [...document.querySelectorAll(".thirds-check:checked")].map(c=>c.value);
      const res = solveThirdPairings(checked);
      const out = document.getElementById("thirds-result");
      if(!out) break;
      if(!res.ok){ out.innerHTML = `<span style="color:var(--danger,#e5534b);">${escapeHtml(res.error)}</span>`; break; }
      out.innerHTML = `
        <div class="tbl-wrap"><table>
          <thead><tr><th>Tercero</th><th>Partido</th><th>Rival</th></tr></thead>
          <tbody>${res.pairs.map(p=>`<tr><td class="mono"><b>3${p.third}</b></td><td class="mono">${escapeHtml(p.matchId)}</td><td class="mono">${escapeHtml(p.rival)}</td></tr>`).join("")}</tbody>
        </table></div>
        <div style="color:var(--muted);font-size:11.5px;margin-top:6px;">Asignación válida según las bolsas del art. 12.6. Cuando existen varias asignaciones posibles, el Anexo C fija una opción concreta por combinación; puede variar respecto a esta.</div>`;
      break;
    }

    case "open-team": navigateToTeam(el.dataset.id); break;
    case "open-club": navigateToClub(el.dataset.id); break;
    case "open-club-by-name": {
      const club = getClubByName(el.dataset.name) || ensureClubObject(el.dataset.name);
      if(club){ persist(); navigateToClub(club.id); }
      break;
    }
    case "add-club": modalAddEditClub(null); break;
    case "sort-clubs": toggleSort(clubsSort, el.dataset.key); render(); break;
    case "back-clubes": activeClubId=null; navIndex>0 ? navBack() : navigateTo("clubes", null); break;
    case "nav-club-arrow": {
      const ordered = orderedClubs();
      if(ordered.length===0) break;
      const idx = ordered.findIndex(x=>x.id===activeClubId);
      if(idx<0) break;
      const dir = el.dataset.dir==="next"?1:-1;
      const nextIdx = (idx + dir + ordered.length) % ordered.length;
      replaceCurrentClub(ordered[nextIdx].id);
      break;
    }
    case "edit-club": modalAddEditClub((DB.clubsData||[]).find(c=>c.id===el.dataset.id)); break;
    case "delete-club": {
      const club = (DB.clubsData||[]).find(c=>c.id===el.dataset.id);
      if(!club) break;
      modalConfirm(`¿Eliminar el club "${clubDisplayName(club)}"? Los jugadores no se borran, pero el club se quitará de todos lados: perfiles de jugadores (quedarán "Sin club") y estadios (dueño y equipos).`, ()=>{
        // Nombres que identifican a este club (nombre común + alias), para limpiar el string p.club
        // de cada jugador. Si no se limpia, el club "reviviría" al abrir o guardar a esos jugadores.
        const names = new Set([clubKey(club.commonName), ...(club.aliases||[]).map(clubKey)]);
        DB.teams.forEach(t=>t.players.forEach(p=>{ if(p.club && names.has(clubKey(p.club))) p.club = ""; }));
        // También se limpia de los estadios: si era el dueño queda en blanco, y se quita de la
        // lista de equipos que juegan ahí.
        (DB.stadiums||[]).forEach(s=>{
          if(s.owner && names.has(clubKey(s.owner))) s.owner = "";
          if(Array.isArray(s.teams)) s.teams = s.teams.filter(n=>!names.has(clubKey(n)));
        });
        DB.clubsData = DB.clubsData.filter(c=>c.id!==club.id);
        DB.clubs = DB.clubs.filter(n=>!names.has(clubKey(n)));
        activeClubId = null; activeTab="clubes";
        persist(); render();
      });
      break;
    }
    case "open-player": navigateToPlayer(el.dataset.id); break;
    case "open-team-from-rank": navigateToTeam(el.dataset.id); break;
    case "create-team-from-country": {
      const country = DB.countries.find(c=>c.id===el.dataset.id);
      if(!country) break;
      const newTeam = buildMinimalTeamFromCountry(country);
      ensureTeamKits(newTeam);
      DB.teams.push(newTeam);
      relinkCountriesToTeams();
      persist();
      showToast(`Selección creada para ${country.commonName} — ya aparece en "Selecciones"`);
      closeModal();
      render();
      break;
    }
    case "edit-team-from-country": {
      closeModal();
      navigateToTeam(el.dataset.id);
      break;
    }
    case "nav-back": navBack(); break;
    case "nav-forward": navForward(); break;
    case "set-ranking-section": rankingSection = el.dataset.id; render(); break;
    case "sort-selecciones": {
      const key = el.dataset.key || "name";
      toggleSort(seleccionesSort, key, key==="rating" ? "desc" : "asc");
      render();
      break;
    }
    case "nav-team-arrow": {
      const ordered = orderedTeamsForNav();
      if(ordered.length===0) break;
      const idx = ordered.findIndex(x=>x.id===activeTeamId);
      if(idx<0) break;
      const dir = el.dataset.dir==="next"?1:-1;
      const nextIdx = (idx + dir + ordered.length) % ordered.length; // vuelta circular
      replaceCurrentTeam(ordered[nextIdx].id);
      break;
    }
    case "nav-player-arrow": {
      const {team} = getPlayerWithTeam(activePlayerId);
      if(!team) break;
      const ordered = orderedTeamPlayers(team);
      if(ordered.length===0) break;
      const idx = ordered.findIndex(x=>x.id===activePlayerId);
      if(idx<0) break;
      const dir = el.dataset.dir==="next"?1:-1;
      const nextIdx = (idx + dir + ordered.length) % ordered.length; // vuelta circular
      replaceCurrentPlayer(ordered[nextIdx].id);
      break;
    }
    case "sort-players": {
      toggleSort(playerSort, el.dataset.key, playerDefaultDir(el.dataset.key));
      render();
      break;
    }
    case "sort-squad": {
      toggleSort(squadSort, el.dataset.key, playerDefaultDir(el.dataset.key));
      render();
      break;
    }
    case "sort-rankings": {
      const key = el.dataset.key;
      if(key==="#"){ rankingSort = {key:"fifaRank", dir:"asc"}; }
      else { toggleSort(rankingSort, key, rankingDefaultDir(key)); }
      render();
      break;
    }
    case "back-selecciones": navIndex>0 ? navBack() : navigateTo("selecciones", null); break;
    case "back-player-detail": navIndex>0 ? navBack() : navigateTo("jugadores", null); break;
    case "edit-fifa": modalEditFifa(); break;
    case "save-fifa": {
      const f = DB.fifa;
      f.fullName = document.getElementById("f-fifa-fullname").value.trim() || f.fullName;
      f.commonName = document.getElementById("f-fifa-commonname").value.trim() || "FIFA";
      f.color1 = document.getElementById("f-fifa-color1").value;
      f.color2 = document.getElementById("f-fifa-color2").value;
      f.logoImg = document.getElementById("f-fifalogo-data").value || null;
      persist(); closeModal(); render();
      break;
    }
    case "edit-confederation": modalEditConfederation(el.dataset.id); break;
    case "toggle-confederation": confExpanded[el.dataset.id] = !confExpanded[el.dataset.id]; render(); break;
    case "toggle-garments-parent": garmentsParentExpanded = !garmentsParentExpanded; render(); break;
    case "toggle-garment": garmentExpanded[el.dataset.type] = !garmentExpanded[el.dataset.type]; render(); break;
    case "toggle-kit-test-panel": {
      // Toggle puramente visual (sin pasar por render()), para no perder cambios sin guardar del formulario.
      const panel = document.getElementById("kit-test-panel-body");
      const chevron = document.getElementById("kit-test-panel-chevron");
      if(panel){
        const isHidden = panel.style.display === "none";
        panel.style.display = isHidden ? "block" : "none";
        if(chevron) chevron.textContent = isHidden ? "▾" : "▸";
      }
      break;
    }
    case "toggle-kit-badge-panel": {
      const panel = document.getElementById("kit-badge-panel-body");
      const chevron = document.getElementById("kit-badge-panel-chevron");
      if(panel){
        const isHidden = panel.style.display === "none";
        panel.style.display = isHidden ? "block" : "none";
        if(chevron) chevron.textContent = isHidden ? "▾" : "▸";
      }
      break;
    }
    case "reset-badge-number": {
      const linked = document.getElementById("f-kit-badgenum-linked");
      if(linked) linked.value = "1";
      syncBadgeIfLinked("number");
      updateBadgeStatusBadge("number");
      showToast("Número del cuadro restablecido — vuelve a seguir al dorso");
      break;
    }
    case "reset-badge-name": {
      const linked = document.getElementById("f-kit-badgename-linked");
      if(linked) linked.value = "1";
      syncBadgeIfLinked("name");
      updateBadgeStatusBadge("name");
      showToast("Nombre del cuadro restablecido — vuelve a seguir al dorso");
      break;
    }
    case "toggle-numberfonts": numberFontsExpanded = !numberFontsExpanded; render(); break;
    case "toggle-backbases": backBasesExpanded = !backBasesExpanded; render(); break;
    case "save-confederation": {
      const info = DB.confederations[el.dataset.id];
      info.fullName = document.getElementById("f-conf-fullname").value.trim() || info.fullName;
      info.commonName = document.getElementById("f-conf-commonname").value.trim() || el.dataset.id;
      info.color1 = document.getElementById("f-conf-color1").value;
      info.color2 = document.getElementById("f-conf-color2").value;
      info.badgeColor = document.getElementById("f-conf-badgecolor").value;
      info.logoImg = document.getElementById("f-conflogo-data").value || null;
      persist(); closeModal(); render();
      break;
    }
    case "add-team": modalAddEditTeam(null); break;
    case "edit-team": modalAddEditTeam(getTeam(el.dataset.id)); break;
    case "delete-team": {
      modalConfirm("¿Eliminar esta selección y todos sus jugadores?", ()=>{
        DB.teams = DB.teams.filter(t=>t.id!==el.dataset.id);
        DB.sponsors.forEach(s=>{ if(s.teamId===el.dataset.id) s.teamId=null; });
        DB.fixtures = DB.fixtures.filter(f=>f.teamA!==el.dataset.id && f.teamB!==el.dataset.id);
        relinkCountriesToTeams();
        persist();
        activeTeamId = null;
        pushHistory();
        render();
      });
      break;
    }
    case "close-modal": closeModal(); break;
    case "add-nickname-row": {
      const container = document.getElementById("nicknames-rows");
      if(container) container.insertAdjacentHTML("beforeend", nicknameRowHTML("",""));
      break;
    }
    case "remove-nickname-row": {
      const row = el.closest(".nickname-row");
      if(row) row.remove();
      break;
    }
    case "add-stadium-team-row": {
      const container = document.getElementById("stadium-team-rows");
      if(container) container.insertAdjacentHTML("beforeend", stadiumTeamRowHTML(""));
      break;
    }
    case "remove-stadium-team-row": {
      const row = el.closest(".stadium-team-row");
      if(row) row.remove();
      break;
    }
    case "add-club-stadium-row": {
      const container = document.getElementById("club-stadium-rows");
      if(container) container.insertAdjacentHTML("beforeend", clubStadiumRowHTML(""));
      break;
    }
    case "remove-club-stadium-row": {
      const row = el.closest(".club-stadium-row");
      if(row) row.remove();
      break;
    }
    case "move-club-stadium-row": {
      const row = el.closest(".club-stadium-row");
      if(!row) break;
      if(el.dataset.dir==="up"){
        const prev = row.previousElementSibling;
        if(prev) row.parentNode.insertBefore(row, prev);
      } else {
        const next = row.nextElementSibling;
        if(next) row.parentNode.insertBefore(next, row);
      }
      break;
    }
    case "add-lang-row": {
      const container = document.getElementById("lang-rows");
      if(container) container.insertAdjacentHTML("beforeend", langRowHTML("",""));
      break;
    }
    case "remove-lang-row": {
      const row = el.closest(".lang-row");
      if(row) row.remove();
      break;
    }
    case "move-nickname-row": {
      const row = el.closest(".nickname-row");
      if(!row) break;
      if(el.dataset.dir==="up"){
        const prev = row.previousElementSibling;
        if(prev) row.parentNode.insertBefore(row, prev);
      } else {
        const next = row.nextElementSibling;
        if(next) row.parentNode.insertBefore(next, row);
      }
      break;
    }

    case "clear-image": {
      const hidden = document.getElementById(el.dataset.target);
      if(hidden) hidden.value = "";
      const preview = document.getElementById(el.dataset.preview);
      if(preview){ preview.removeAttribute("src"); preview.style.display = "none"; }
      break;
    }

    case "save-club": {
      const id = el.dataset.id;
      const commonName = document.getElementById("f-cl-commonname").value.trim().slice(0,50);
      if(!commonName){ alert("El nombre común es obligatorio."); return; }
      let shortName = document.getElementById("f-cl-shortname").value.trim().slice(0,30);
      if(!shortName) shortName = commonName.slice(0,30);
      const nicknames = Array.from(document.querySelectorAll("#nicknames-rows .nickname-row")).map(row=>({
        article: row.querySelector(".nick-article").value,
        name: row.querySelector(".nick-name").value.trim()
      })).filter(n=>n.name);
      const league = document.getElementById("f-cl-league").value.trim();
      if(league) ensureLeague(league);
      const data = {
        fullName: document.getElementById("f-cl-fullname").value.trim(),
        officialName: document.getElementById("f-cl-officialname").value.trim(),
        commonName, shortName,
        article: document.getElementById("f-cl-article").value,
        code: document.getElementById("f-cl-code").value.trim().toUpperCase().slice(0,7),
        codeAlt: document.getElementById("f-cl-codealt").value.trim().toUpperCase().slice(0,7),
        nicknames,
        city: document.getElementById("f-cl-city").value.trim(),
        country: document.getElementById("f-cl-country").value.trim(),
        league,
        logoImg: document.getElementById("f-cl-logo-data").value || null,
        color1: document.getElementById("f-cl-color1").value,
        color2: document.getElementById("f-cl-color2").value,
        color3: document.getElementById("f-cl-color3").value,
        // Lee una fila por estadio, en orden de importancia. Si el nombre coincide con un estadio
        // existente (por cualquiera de sus nombres) se guarda su nombre canónico; quita duplicados.
        stadiums: (()=>{ const seen=new Set(); return [...document.querySelectorAll("#club-stadium-rows .club-stadium-name")]
          .map(i=>{ const raw=i.value.trim(); if(!raw) return ""; const st=findStadiumByName(raw); return st? stadiumLinkName(st) : raw; })
          .filter(n=>{ if(!n || seen.has(normLoose(n))) return false; seen.add(normLoose(n)); return true; }); })(),
        trainingGround: document.getElementById("f-cl-training").value.trim(),
        founded: (()=>{ const v=parseInt(document.getElementById("f-cl-founded").value); return (v>=1800&&v<=2100)?v:null; })()
      };
      data.stadium = data.stadiums[0]||""; // el primero es el principal (compatibilidad)
      let prevStadiums = [];
      if(id){
        const club = DB.clubsData.find(c=>c.id===id);
        if(club){
          const prevName = club.commonName;
          prevStadiums = Array.isArray(club.stadiums) ? club.stadiums.slice() : (club.stadium ? [club.stadium] : []);
          Object.assign(club, data);
          // Si cambió el nombre común, actualiza la lista de nombres y el string club de los jugadores.
          if(normLoose(prevName)!==normLoose(commonName)){
            DB.clubs = DB.clubs.filter(n=>normLoose(n)!==normLoose(prevName));
            if(!DB.clubs.some(n=>normLoose(n)===normLoose(commonName))) DB.clubs.push(commonName);
            DB.teams.forEach(t=>t.players.forEach(p=>{ if(p.club && normLoose(p.club)===normLoose(prevName)) p.club = commonName; }));
            // Y las referencias al club en los estadios (dueño y equipos que juegan ahí).
            (DB.stadiums||[]).forEach(s=>{
              if(s.owner && normLoose(s.owner)===normLoose(prevName)) s.owner = commonName;
              if(Array.isArray(s.teams)) s.teams = s.teams.map(t=> normLoose(t)===normLoose(prevName) ? commonName : t);
            });
          }
        }
      } else {
        const club = {id:newClubId(), aliases:[], ...data};
        DB.clubsData.push(club);
        if(!DB.clubs.some(n=>normLoose(n)===normLoose(commonName))) DB.clubs.push(commonName);
      }
      // Sincronización con la sección de Estadios (vínculo en ambos sentidos):
      // 1) si el club dejó de usar un estadio, se le quita de "Equipos que juegan ahí";
      prevStadiums
        .filter(old=> !data.stadiums.some(n=>normLoose(n)===normLoose(old)))
        .forEach(old=>{
          const st = findStadiumByName(old);
          if(st && Array.isArray(st.teams)) st.teams = st.teams.filter(t=>normLoose(t)!==normLoose(commonName));
        });
      // 2) cada estadio del club existe en el catálogo y lo lista como equipo local (sin asignar dueño).
      //    Hereda ciudad y país del club.
      data.stadiums.forEach(nm=> ensureStadiumFromName(nm, commonName, data.country, data.city));
      // 3) el campo de entrenamiento del club existe como instalación (isTraining) heredando ciudad y país.
      if((data.trainingGround||"").trim()) ensureStadiumFromName(data.trainingGround, null, data.country, data.city, true);
      persist(); closeModal(); render();
      showToast("Club guardado");
      break;
    }
    case "save-team": {
      const id = el.dataset.id;
      const commonName = document.getElementById("f-commonname").value.trim().slice(0,50);
      if(!commonName){ alert("El nombre común es obligatorio."); return; }
      const officialName = document.getElementById("f-officialname").value.trim() || commonName;
      let shortName = document.getElementById("f-shortname").value.trim().slice(0,30);
      if(!shortName) shortName = commonName.slice(0,30);
      let fifaCode = document.getElementById("f-fifacode").value.trim().toUpperCase().slice(0,3);
      if(!fifaCode) fifaCode = initials(commonName).slice(0,3).toUpperCase();
      const iocCodeRaw = document.getElementById("f-ioccode").value.trim().toUpperCase().slice(0,3);
      const nicknames = Array.from(document.querySelectorAll("#nicknames-rows .nickname-row")).map(row=>({
        article: row.querySelector(".nick-article").value,
        name: row.querySelector(".nick-name").value.trim()
      })).filter(n=>n.name);
      const federationName = document.getElementById("f-federationname").value.trim();
      const federationAbbr = document.getElementById("f-federationabbr").value.trim();
      const fifaPointsRaw = document.getElementById("f-fifapoints").value;
      const eloRaw = document.getElementById("f-elorating").value;
      const data = {
        officialName, commonName, shortName, fifaCode,
        iocCode: (iocCodeRaw && iocCodeRaw!==fifaCode) ? iocCodeRaw : null,
        nicknames,
        federationName: federationName || null,
        federationAbbr: federationAbbr || null,
        conf: document.getElementById("f-conf").value || null,
        group: document.getElementById("f-group").value.trim().toUpperCase(),
        color1: document.getElementById("f-color1").value,
        color2: document.getElementById("f-color2").value,
        color3: document.getElementById("f-color3").value,
        logoImg: document.getElementById("f-logo-data").value || null,
        fifaPoints: fifaPointsRaw ? parseFloat(fifaPointsRaw) : null,
        eloRating: eloRaw ? parseFloat(eloRaw) : null,
        host: document.getElementById("f-host").checked,
        // Instalaciones: una fila por estadio, en orden de importancia; si el nombre coincide
        // con un estadio existente se guarda su nombre canónico, sin duplicados.
        stadiums: (()=>{ const seen=new Set(); return [...document.querySelectorAll("#club-stadium-rows .club-stadium-name")]
          .map(i=>{ const raw=i.value.trim(); if(!raw) return ""; const st=findStadiumByName(raw); return st? stadiumLinkName(st) : raw; })
          .filter(n=>{ if(!n || seen.has(normLoose(n))) return false; seen.add(normLoose(n)); return true; }); })(),
        trainingGround: document.getElementById("f-t-training").value.trim()
      };
      data.stadium = data.stadiums[0]||""; // el primero es el principal
      // Los estadios de la selección existen en el catálogo, pero sin registrarla como
      // equipo local (esa lista es de clubes) ni como dueña. Al crearse desde una selección se les
      // autocompleta el país con el de la propia selección (su país vinculado, o su nombre común).
      const teamCountryName = (()=>{
        const lc = id ? DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===id) : null;
        return (lc && lc.commonName) || commonName;
      })();
      data.stadiums.forEach(nm=> ensureStadiumFromName(nm, null, teamCountryName));
      // El campo de entrenamiento de la selección existe como instalación (isTraining), heredando su país.
      if((data.trainingGround||"").trim()) ensureStadiumFromName(data.trainingGround, null, teamCountryName, null, true);
      let savedTeam;
      if(id){
        savedTeam = getTeam(id); Object.assign(savedTeam, data);
      } else {
        savedTeam = {id:newId("t"), players:[], kits:[], ...data};
        ensureTeamKits(savedTeam);
        DB.teams.push(savedTeam);
      }
      relinkCountriesToTeams();
      // La confederación vive tanto en la selección como en su país — si se edita desde la selección,
      // se refleja también en el país vinculado (mismo fifaCode), para que no queden desincronizados.
      const linkedCountry = DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===savedTeam.id);
      if(linkedCountry && linkedCountry.conf!==savedTeam.conf) linkedCountry.conf = savedTeam.conf;
      persist(); closeModal(); render();
      break;
    }

    case "add-player": modalAddEditPlayer(el.dataset.team, null); break;
    case "edit-player": {
      const team = getTeam(el.dataset.team);
      modalAddEditPlayer(el.dataset.team, team.players.find(p=>p.id===el.dataset.id));
      break;
    }
    case "delete-player": {
      const deleteTeamId = el.dataset.team;
      modalConfirm("¿Eliminar jugador?", ()=>{
        const team = getTeam(deleteTeamId);
        team.players = team.players.filter(p=>p.id!==el.dataset.id);
        activePlayerId = null;
        activeTeamId = deleteTeamId;
        activeTab = "selecciones";
        persist(); render();
      });
      break;
    }
    case "save-player": {
      const teamId = el.dataset.team; const id = el.dataset.id;
      const firstName = document.getElementById("f-pfirstname").value.trim();
      const lastName = document.getElementById("f-plastname").value.trim();
      const commonName = document.getElementById("f-pcommonname").value.trim();
      if(!firstName && !lastName && !commonName){ alert("Pon al menos el nombre, el apellido, o el nombre común."); return; }
      const club = matchOrAddClub(document.getElementById("f-pclub").value);
      const numberRaw = document.getElementById("f-pnumber").value;
      const nationalityIds = [...new Set([...document.querySelectorAll("#nationality-rows .nationality-name")]
        .map(i=>i.value.trim()).filter(Boolean)
        .map(findOrCreateCountryByName).filter(Boolean))];
      const declaredForCountryId = document.getElementById("f-pdeclared").value || null;
      const capsRaw = document.getElementById("f-pcaps").value;
      const goalsNatRaw = document.getElementById("f-pgoalsnat").value;
      const birthDate = document.getElementById("f-pbirth").value || null;
      const heightRaw = document.getElementById("f-pheight").value;
      const height = heightRaw ? Math.max(140, Math.min(230, parseInt(heightRaw))) : null;
      const brandRaw = document.getElementById("f-pbrand").value.trim();
      const photoEl = document.getElementById("f-pphoto-data");
      const favNumbersTeam = parseFavNumbers(document.getElementById("f-pfavnums-team").value);
      const favNumbersClub = parseFavNumbers(document.getElementById("f-pfavnums-club").value);
      const shirtNameTeam = document.getElementById("f-pshirtname-team").value.trim().slice(0,50);
      const shirtNameClub = document.getElementById("f-pshirtname-club").value.trim().slice(0,50);
      const fullName = document.getElementById("f-pfullname").value.trim();
      const fullNameLinked = document.getElementById("f-pfullname-linked").value==="1";
      const shirtNameTeamLinked = document.getElementById("f-pshirtname-team-linked").value==="1";
      const shirtNameClubLinked = document.getElementById("f-pshirtname-club-linked").value==="1";
      const brand = (brandRaw && brandRaw.toLowerCase()!=="sin sponsor") ? matchOrAddBrand(brandRaw) : null;
      const data = {
        firstName, lastName, commonName, fullName, fullNameLinked, shirtNameTeamLinked, shirtNameClubLinked,
        pos: document.getElementById("f-ppos").value,
        number: (parseInt(numberRaw)>0) ? Math.min(99, parseInt(numberRaw)) : null,
        numberUnassigned: !(parseInt(numberRaw)>0),
        numberClub: (()=>{ const v=parseInt(document.getElementById("f-pnumber-club").value); return (v>0)?Math.min(99,v):null; })(),
        birthDate,
        height,
        club,
        rating: Math.max(0, Math.min(99, parseInt(document.getElementById("f-prating").value)||70)),
        ratingPotential: (()=>{ const v=document.getElementById("f-prating-potential").value; return (v===""||v==null)?null:Math.max(0,Math.min(99,parseInt(v)||0)); })(),
        nationalityIds,
        declaredForCountryId,
        photo: (photoEl && photoEl.value) ? photoEl.value : null,
        caps: capsRaw ? Math.max(0, parseInt(capsRaw)) : null,
        goalsNational: goalsNatRaw ? Math.max(0, parseInt(goalsNatRaw)) : null,
        brand,
        favNumbersTeam, favNumbersClub, shirtNameTeam, shirtNameClub
      };
      const team = getTeam(teamId);
      if(id){ Object.assign(team.players.find(p=>p.id===id), data); }
      else { team.players.push({id:newId("p"), ...data}); }
      persist(); closeModal(); render();
      break;
    }

    case "generate-fixtures": generateAllFixtures(); break;
    case "clear-fixtures": clearAllFixtures(); break;
    case "open-sim": openSimModal(el.dataset.fixture); break;
    case "roll-dice": rollDice(el.dataset.fixture); break;

    case "add-sponsor": modalAddEditSponsor(null); break;
    case "edit-sponsor": modalAddEditSponsor(DB.sponsors.find(s=>s.id===el.dataset.id)); break;
    case "delete-sponsor": {
      modalConfirm("¿Eliminar patrocinador?", ()=>{ DB.sponsors = DB.sponsors.filter(s=>s.id!==el.dataset.id); persist(); render(); });
      break;
    }
    case "save-sponsor": {
      const id = el.dataset.id;
      const name = document.getElementById("f-sname").value.trim();
      if(!name){ alert("El nombre es obligatorio"); return; }
      // Categorías: una por fila, sin duplicados, en orden.
      const categories = (()=>{ const seen=new Set(); return [...document.querySelectorAll("#sponsor-cat-rows .sponsor-cat-name")]
        .map(i=>i.value.trim()).filter(Boolean)
        .filter(c=>{ const k=normLoose(c); if(seen.has(k)) return false; seen.add(k); return true; }); })();
      const linkSel = document.getElementById("f-steam").value;
      const isGlobal = linkSel==="__global__";
      const teamId = (linkSel && !isGlobal) ? linkSel : null;
      const data = {
        name,
        categories,
        value: Math.max(0, parseInt(document.getElementById("f-sval").value)||0),
        teamId,
        global: isGlobal,
        logoImg: document.getElementById("f-slogo-data").value || null,
        color1: document.getElementById("f-scolor1").value,
        color2: document.getElementById("f-scolor2").value,
        color3: document.getElementById("f-scolor3").value
      };
      categories.forEach(c=>addSponsorCategory(c));
      if(id){ Object.assign(DB.sponsors.find(s=>s.id===id), data); }
      else { DB.sponsors.push({id:newId("sp"), ...data}); }
      persist(); closeModal(); render();
      break;
    }

    case "add-sponsor-cat-row": {
      const container = document.getElementById("sponsor-cat-rows");
      if(container) container.insertAdjacentHTML("beforeend", sponsorCategoryRowHTML(""));
      break;
    }
    case "remove-sponsor-cat-row": {
      const row = el.closest(".sponsor-cat-row");
      if(row) row.remove();
      break;
    }

    case "add-nationality-row": {
      const container = document.getElementById("nationality-rows");
      if(container) container.insertAdjacentHTML("beforeend", nationalityRowHTML(""));
      refreshDeclaredForOptions();
      break;
    }
    case "remove-nationality-row": {
      const row = el.closest(".nationality-row");
      if(row) row.remove();
      refreshDeclaredForOptions();
      break;
    }

    case "add-media": modalAddEditMedia(null); break;
    case "edit-media": modalAddEditMedia(DB.media.find(m=>m.id===el.dataset.id)); break;
    case "delete-media": {
      modalConfirm("¿Eliminar medio?", ()=>{ DB.media = DB.media.filter(m=>m.id!==el.dataset.id); persist(); render(); });
      break;
    }
    case "save-media": {
      const id = el.dataset.id;
      const name = document.getElementById("f-mname").value.trim();
      if(!name){ alert("El nombre es obligatorio"); return; }
      const data = {
        name,
        type: document.getElementById("f-mtype").value,
        country: document.getElementById("f-mcountry").value.trim(),
        reach: Math.max(0, parseInt(document.getElementById("f-mreach").value)||0),
        logoImg: document.getElementById("f-mlogo-data").value || null,
        color1: document.getElementById("f-mcolor1").value,
        color2: document.getElementById("f-mcolor2").value,
        color3: document.getElementById("f-mcolor3").value
      };
      if(id){ Object.assign(DB.media.find(m=>m.id===id), data); }
      else { DB.media.push({id:newId("md"), ...data}); }
      persist(); closeModal(); render();
      break;
    }

    case "create-missing-teams": {
      const missingCount = DB.countries.filter(c=>c.conf && !(c.teamLinks && c.teamLinks.absoluta)).length;
      if(missingCount===0){ alert("Todos los países con confederación asignada ya tienen una selección cargada."); break; }
      modalConfirm(`Esto creará ${missingCount} selecciones nuevas (sin grupo, solo con nombre y códigos — tú las vas completando después). ¿Continuar?`, ()=>{
        const before = new Set(DB.teams.map(t=>t.id));
        const created = integrateTeamsFromCountries(DB.teams, DB.countries);
        DB.teams.filter(t=>!before.has(t.id)).forEach(ensureTeamKits);
        persist(); render();
        showToast(`${created} selecciones creadas`);
      }, "Crear");
      break;
    }
    case "add-garment-base": {
      const type = el.dataset.type;
      const cfg = garmentConfig(type);
      const baseImg = document.getElementById(`f-newgarmentbase-${type}-data`).value;
      if(!baseImg){ alert("Sube la imagen base."); return; }
      const bases = DB[cfg.basesKey];
      const nextNumber = bases.length ? Math.max(...bases.map(b=>b.number)) + 1 : 1;
      const newBase = {id:newId("gb"), number:nextNumber, baseImg};
      if(type==="shirt"){
        const backEl = document.getElementById(`f-newgarmentbaseback-${type}-data`);
        newBase.backImg = (backEl && backEl.value) || null;
        newBase.gkImg = null;
        newBase.gkBackImg = null;
      }
      bases.push(newBase);
      persist(); render();
      showToast(`${garmentName(type, nextNumber)} agregada`);
      break;
    }
    case "delete-garment-base": {
      const type = el.dataset.type;
      const cfg = garmentConfig(type);
      modalConfirm("¿Eliminar esta base?", ()=>{ DB[cfg.basesKey] = DB[cfg.basesKey].filter(b=>b.id!==el.dataset.id); persist(); render(); });
      break;
    }
    case "add-number-font": {
      const fontData = document.getElementById("f-newnumberfont-data").value;
      if(!fontData){ alert("Sube el archivo de la tipografía."); return; }
      const nextNumber = DB.numberFonts.length ? Math.max(...DB.numberFonts.map(f=>f.number)) + 1 : 1;
      const newFont = {id:newId("nf"), number:nextNumber, fontData};
      DB.numberFonts.push(newFont);
      persist(); render();
      showToast(`${numberFontLabel(newFont)} agregada`);
      break;
    }
    case "delete-number-font": {
      modalConfirm("¿Eliminar esta tipografía? Los uniformes que la tengan elegida pasarán a usar la primera disponible.", ()=>{
        const id = el.dataset.id;
        DB.numberFonts = DB.numberFonts.filter(f=>f.id!==id);
        delete _loadedNumberFontFamilies[id];
        const fallbackId = DB.numberFonts[0] ? DB.numberFonts[0].id : null;
        DB.teams.forEach(t=>t.kits.forEach(k=>{
          if(k.backNumberFontId===id) k.backNumberFontId = fallbackId;
          if(k.backNameFontId===id) k.backNameFontId = fallbackId;
        }));
        persist(); render();
      });
      break;
    }
    case "add-back-base": {
      const baseData = document.getElementById("f-newbackbase-data").value;
      if(!baseData){ alert("Sube la imagen de la base."); return; }
      const number = parseInt(document.getElementById("f-newbackbase-number").value) || 1;
      if(DB.backBases.some(b=>b.number===number)){ alert(`Ya existe un Back${number}. Bórralo primero o usa otro número.`); return; }
      const newBase = {id:newId("bk"), number, baseImg:baseData};
      DB.backBases.push(newBase);
      persist(); render();
      showToast(`${backBaseDisplayLabel(newBase)} agregado`);
      break;
    }
    case "delete-back-base": {
      modalConfirm("¿Eliminar esta base? Los Shirts que la usaban pasarán a usar Back1 como respaldo.", ()=>{
        const id = el.dataset.id;
        DB.backBases = DB.backBases.filter(b=>b.id!==id);
        persist(); render();
      });
      break;
    }
    case "view-garment-base": {
      const type = el.dataset.type;
      const cfg = garmentConfig(type);
      const b = DB[cfg.basesKey].find(b=>b.id===el.dataset.id);
      if(!b) break;
      const backSrc = type==="shirt" ? shirtBackImgFor(b.number) : null;
      openModal(`
        <div class="modal-box">
          <div class="modal-head"><h2>${garmentName(type,b.number)}</h2><button class="modal-close" data-action="close-modal">×</button></div>
          <div class="modal-body" style="text-align:center;">
            <div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">
              <div style="position:relative;width:240px;height:240px;background:var(--surface-2);border-radius:10px;overflow:hidden;">
                <img src="${b.baseImg}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
                <img src="${DB[cfg.textureKey]}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">
              </div>
              ${type==="shirt" ? `
              <div style="position:relative;width:240px;height:240px;background:var(--surface-2);border-radius:10px;overflow:hidden;">
                ${backSrc?`<img src="${backSrc}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:''}
                ${DB.kitTextureBack?`<img src="${DB.kitTextureBack}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:contain;">`:''}
              </div>` : ''}
            </div>
          </div>
          <div class="modal-foot"><button class="btn ghost" data-action="close-modal">Cerrar</button></div>
        </div>
      `);
      break;
    }
    case "add-country": modalAddEditCountry(null); break;
    case "edit-country": modalAddEditCountry(DB.countries.find(c=>c.id===el.dataset.id)); break;
    case "delete-country": {
      modalConfirm("¿Eliminar este país/entidad del catálogo?", ()=>{ DB.countries = DB.countries.filter(c=>c.id!==el.dataset.id); persist(); render(); });
      break;
    }
    case "toggle-country-fifa": {
      const c = DB.countries.find(c=>c.id===el.dataset.id);
      if(c){ c.fifaAffiliated = el.checked; persist(); }
      break;
    }
    case "toggle-country-ioc": {
      const c = DB.countries.find(c=>c.id===el.dataset.id);
      if(c){ c.iocAffiliated = el.checked; persist(); }
      break;
    }
    case "save-country": {
      const id = el.dataset.id;
      const commonName = document.getElementById("f-c-name").value.trim();
      if(!commonName){ alert("El nombre es obligatorio"); return; }
      const officialLanguages = document.getElementById("f-c-offlangs").value.split(",").map(s=>s.trim()).filter(Boolean);
      const secondaryLanguages = Array.from(document.querySelectorAll("#lang-rows .lang-row")).map(row=>({
        name: row.querySelector(".lang-name").value.trim(),
        percentage: row.querySelector(".lang-pct").value!=="" ? parseFloat(row.querySelector(".lang-pct").value) : null
      })).filter(l=>l.name);
      const data = {
        commonName,
        fifaCode: document.getElementById("f-c-fifa").value.trim().toUpperCase().slice(0,3) || null,
        iocCode: document.getElementById("f-c-ioc").value.trim().toUpperCase().slice(0,3) || null,
        parentOrStatus: document.getElementById("f-c-parent").value.trim() || null,
        conf: document.getElementById("f-c-conf").value || null,
        fifaAffiliated: document.getElementById("f-c-fifaafil").checked,
        iocAffiliated: document.getElementById("f-c-iocafil").checked,
        officialLanguages, secondaryLanguages
      };
      let savedCountry;
      if(id){ savedCountry = DB.countries.find(c=>c.id===id); Object.assign(savedCountry, data); }
      else { savedCountry = {id:newId("co"), ...data}; DB.countries.push(savedCountry); }
      relinkCountriesToTeams();
      // Igual que al revés: si se edita la confederación desde el país, se refleja en su selección
      // vinculada (si tiene una) — incluyendo dejarla en blanco, ya que ambos formularios la soportan.
      const linkedTeam = savedCountry.teamLinks && savedCountry.teamLinks.absoluta ? getTeam(savedCountry.teamLinks.absoluta) : null;
      if(linkedTeam && linkedTeam.conf!==savedCountry.conf) linkedTeam.conf = savedCountry.conf;
      persist(); closeModal(); render();
      break;
    }
    case "manage-kits": modalManageKits(getTeam(el.dataset.team)); break;
    case "add-kit": modalAddEditKit(getTeam(el.dataset.team), {category: el.dataset.category}, true); break;
    case "edit-kit": {
      const team = getTeam(el.dataset.team);
      modalAddEditKit(team, team.kits.find(k=>k.id===el.dataset.id), el.dataset.fromManage==="1");
      break;
    }
    case "delete-kit": {
      const team = getTeam(el.dataset.team);
      const kit = team.kits.find(k=>k.id===el.dataset.id);
      if(!kit) break;
      const min = kit.category==="jugador" ? 2 : 1;
      const countSameCat = team.kits.filter(k=>k.category===kit.category).length;
      if(countSameCat<=min){ alert(`Debe haber al menos ${min} uniforme${min>1?'s':''} de ${kit.category==="jugador"?"jugador":"portero"}.`); break; }
      modalConfirm(`¿Eliminar el uniforme "${kit.label}"?`, ()=>{
        team.kits = team.kits.filter(k=>k.id!==el.dataset.id);
        ensureTeamKits(team);
        persist(); render();
        modalManageKits(team);
      });
      break;
    }
    case "copy-kit": {
      const team = getTeam(el.dataset.team);
      const kit = team.kits.find(k=>k.id===el.dataset.id);
      if(!kit) break;
      clipboardKit = JSON.parse(JSON.stringify({
        baseNumber: kit.baseNumber, color1: kit.color1, color2: kit.color2, color3: kit.color3,
        layers: kit.layers, backLayers: kit.backLayers, combinations: kit.combinations,
        backNumberFontId: kit.backNumberFontId, backNumberColor: kit.backNumberColor,
        backNumberOutline: kit.backNumberOutline, backNumberOutlineColor: kit.backNumberOutlineColor,
        backNumberOutlineWidth: kit.backNumberOutlineWidth,
        backNumberSizePct: kit.backNumberSizePct, backNumberLetterSpacing: kit.backNumberLetterSpacing, backNumberOffsetX: kit.backNumberOffsetX, backNumberOffsetY: kit.backNumberOffsetY,
        backNameFontId: kit.backNameFontId, backNameColor: kit.backNameColor,
        backNameOutline: kit.backNameOutline, backNameOutlineColor: kit.backNameOutlineColor,
        backNameOutlineWidth: kit.backNameOutlineWidth,
        backNameFontLinked: kit.backNameFontLinked, backNameColorLinked: kit.backNameColorLinked,
        backNameOutlineLinked: kit.backNameOutlineLinked,
        backNameSizePct: kit.backNameSizePct, backNameCondense: kit.backNameCondense||false, backNameLetterSpacing: kit.backNameLetterSpacing, backNameOffsetX: kit.backNameOffsetX, backNameOffsetY: kit.backNameOffsetY, backNameArc: kit.backNameArc, backNameTextCase: kit.backNameTextCase,
        badgeNumberLinked: kit.badgeNumberLinked, badgeNumberFontId: kit.badgeNumberFontId, badgeNumberColor: kit.badgeNumberColor,
        badgeNumberOutline: kit.badgeNumberOutline, badgeNumberOutlineColor: kit.badgeNumberOutlineColor, badgeNumberOutlineWidth: kit.badgeNumberOutlineWidth,
        badgeNumberSizePct: kit.badgeNumberSizePct, badgeNumberLetterSpacing: kit.badgeNumberLetterSpacing, badgeNumberOffsetX: kit.badgeNumberOffsetX, badgeNumberOffsetY: kit.badgeNumberOffsetY,
        badgeNameLinked: kit.badgeNameLinked, badgeNameFontId: kit.badgeNameFontId, badgeNameColor: kit.badgeNameColor,
        badgeNameOutline: kit.badgeNameOutline, badgeNameOutlineColor: kit.badgeNameOutlineColor, badgeNameOutlineWidth: kit.badgeNameOutlineWidth,
        badgeNameSizePct: kit.badgeNameSizePct, badgeNameCondense: kit.badgeNameCondense||false, badgeNameLetterSpacing: kit.badgeNameLetterSpacing, badgeNameOffsetX: kit.badgeNameOffsetX, badgeNameOffsetY: kit.badgeNameOffsetY,
        badgeNameArc: kit.badgeNameArc, badgeNameTextCase: kit.badgeNameTextCase
      }));
      showToast(`Uniforme "${kit.label}" copiado`);
      modalManageKits(team);
      break;
    }
    case "paste-kit": {
      if(!clipboardKit){ showToast("No hay ningún uniforme copiado todavía"); break; }
      const team = getTeam(el.dataset.team);
      const kit = team.kits.find(k=>k.id===el.dataset.id);
      if(!kit) break;
      const copy = JSON.parse(JSON.stringify(clipboardKit));
      copy.combinations.forEach(c=>{ c.id = newId("combo"); });
      kit.baseNumber = copy.baseNumber; kit.color1 = copy.color1; kit.color2 = copy.color2; kit.color3 = copy.color3;
      kit.layers = copy.layers; kit.backLayers = copy.backLayers || []; kit.combinations = copy.combinations;
      kit.backNumberFontId = copy.backNumberFontId!==undefined ? copy.backNumberFontId : (DB.numberFonts[0] ? DB.numberFonts[0].id : null);
      kit.backNumberColor = copy.backNumberColor || "#FFFFFF";
      kit.backNumberOutline = !!copy.backNumberOutline;
      kit.backNumberOutlineColor = copy.backNumberOutlineColor || "#000000";
      kit.backNumberOutlineWidth = copy.backNumberOutlineWidth!=null ? copy.backNumberOutlineWidth : 4;
      kit.backNumberSizePct = copy.backNumberSizePct!=null ? copy.backNumberSizePct : 100;
      kit.backNumberLetterSpacing = copy.backNumberLetterSpacing!=null ? copy.backNumberLetterSpacing : 0;
      kit.backNumberOffsetX = copy.backNumberOffsetX!=null ? copy.backNumberOffsetX : 0;
      kit.backNumberOffsetY = copy.backNumberOffsetY!=null ? copy.backNumberOffsetY : 0;
      kit.backNameFontLinked = copy.backNameFontLinked!==undefined ? !!copy.backNameFontLinked : true;
      kit.backNameColorLinked = copy.backNameColorLinked!==undefined ? !!copy.backNameColorLinked : true;
      kit.backNameOutlineLinked = copy.backNameOutlineLinked!==undefined ? !!copy.backNameOutlineLinked : true;
      kit.backNameFontId = copy.backNameFontId!==undefined ? copy.backNameFontId : kit.backNumberFontId;
      kit.backNameColor = copy.backNameColor || kit.backNumberColor;
      kit.backNameOutline = !!copy.backNameOutline;
      kit.backNameOutlineColor = copy.backNameOutlineColor || kit.backNumberOutlineColor;
      kit.backNameOutlineWidth = copy.backNameOutlineWidth!=null ? copy.backNameOutlineWidth : kit.backNumberOutlineWidth;
      kit.backNameSizePct = copy.backNameSizePct!=null ? copy.backNameSizePct : 100;
      kit.backNameCondense = copy.backNameCondense || false;
      kit.backNameLetterSpacing = copy.backNameLetterSpacing!=null ? copy.backNameLetterSpacing : 0;
      kit.backNameOffsetX = copy.backNameOffsetX!=null ? copy.backNameOffsetX : 0;
      kit.backNameOffsetY = copy.backNameOffsetY!=null ? copy.backNameOffsetY : 0;
      kit.backNameArc = copy.backNameArc!=null ? copy.backNameArc : 1;
      kit.backNameTextCase = copy.backNameTextCase || "default";
      kit.badgeNumberLinked = copy.badgeNumberLinked!==undefined ? !!copy.badgeNumberLinked : true;
      kit.badgeNumberFontId = copy.badgeNumberFontId!==undefined ? copy.badgeNumberFontId : kit.backNumberFontId;
      kit.badgeNumberColor = copy.badgeNumberColor || kit.backNumberColor;
      kit.badgeNumberOutline = !!copy.badgeNumberOutline;
      kit.badgeNumberOutlineColor = copy.badgeNumberOutlineColor || kit.backNumberOutlineColor;
      kit.badgeNumberOutlineWidth = copy.badgeNumberOutlineWidth!=null ? copy.badgeNumberOutlineWidth : kit.backNumberOutlineWidth;
      kit.badgeNumberSizePct = copy.badgeNumberSizePct!=null ? copy.badgeNumberSizePct : 100;
      kit.badgeNumberLetterSpacing = copy.badgeNumberLetterSpacing!=null ? copy.badgeNumberLetterSpacing : 0;
      kit.badgeNumberOffsetX = copy.badgeNumberOffsetX!=null ? copy.badgeNumberOffsetX : 0;
      kit.badgeNumberOffsetY = copy.badgeNumberOffsetY!=null ? copy.badgeNumberOffsetY : 0;
      kit.badgeNameLinked = copy.badgeNameLinked!==undefined ? !!copy.badgeNameLinked : true;
      kit.badgeNameFontId = copy.badgeNameFontId!==undefined ? copy.badgeNameFontId : kit.backNameFontId;
      kit.badgeNameColor = copy.badgeNameColor || kit.backNameColor;
      kit.badgeNameOutline = !!copy.badgeNameOutline;
      kit.badgeNameOutlineColor = copy.badgeNameOutlineColor || kit.backNameOutlineColor;
      kit.badgeNameOutlineWidth = copy.badgeNameOutlineWidth!=null ? copy.badgeNameOutlineWidth : kit.backNameOutlineWidth;
      kit.badgeNameSizePct = copy.badgeNameSizePct!=null ? copy.badgeNameSizePct : 100;
      kit.badgeNameCondense = copy.badgeNameCondense || false;
      kit.badgeNameLetterSpacing = copy.badgeNameLetterSpacing!=null ? copy.badgeNameLetterSpacing : 0;
      kit.badgeNameOffsetX = copy.badgeNameOffsetX!=null ? copy.badgeNameOffsetX : 0;
      kit.badgeNameOffsetY = copy.badgeNameOffsetY!=null ? copy.badgeNameOffsetY : 0;
      kit.badgeNameArc = copy.badgeNameArc!=null ? copy.badgeNameArc : 1;
      kit.badgeNameTextCase = copy.badgeNameTextCase || "default";
      persist(); render();
      modalManageKits(team);
      showToast(`Uniforme pegado en "${kit.label}"`);
      break;
    }
    case "copy-combo": {
      const block = el.closest(".combo-block");
      if(!block) break;
      clipboardCombo = readComboFromBlock(block);
      delete clipboardCombo.id;
      showToast("Combinación copiada");
      document.querySelectorAll('[data-action="paste-combo"]').forEach(b=>b.disabled=false);
      break;
    }
    case "paste-combo": {
      if(!clipboardCombo){ showToast("No hay ninguna combinación copiada todavía"); break; }
      const block = el.closest(".combo-block");
      const container = document.getElementById("kit-combo-rows");
      if(!block || !container) break;
      const index = Array.from(container.children).indexOf(block);
      const copy = JSON.parse(JSON.stringify(clipboardCombo));
      block.outerHTML = comboBlockHTML(copy, index);
      const newBlock = container.children[index];
      const body = newBlock.querySelector(".combo-block-body");
      const arrow = newBlock.querySelector(".combo-toggle-arrow");
      body.style.display = "block";
      if(arrow) arrow.textContent = "▾";
      refreshComboBlockPreview(newBlock);
      refreshKitModalPreview();
      showToast("Combinación pegada");
      break;
    }
    case "add-layer-row": {
      const container = document.getElementById("kit-layer-rows");
      if(container){
        container.insertAdjacentHTML("beforeend", layerRowHTML(null));
        refreshKitModalPreview();
      }
      break;
    }
    case "add-back-layer-row": {
      const container = document.getElementById("kit-back-layer-rows");
      if(container){
        container.insertAdjacentHTML("beforeend", layerRowHTML(null));
        refreshKitModalPreview();
      }
      break;
    }
    case "reset-backname": {
      ["font","color","outline"].forEach(g=>{
        const linked = document.getElementById(`f-kit-backname-${g}-linked`);
        if(linked) linked.value = "1";
      });
      syncBackNameIfLinked("font");
      syncBackNameIfLinked("color");
      syncBackNameIfLinked("outline");
      const sizePct = document.getElementById("f-kit-backname-sizepct");
      const letterSpacing = document.getElementById("f-kit-backname-letterspacing");
      const offsetX = document.getElementById("f-kit-backname-offsetx");
      const offsetY = document.getElementById("f-kit-backname-offsety");
      const arc = document.getElementById("f-kit-backname-arc");
      const textCase = document.getElementById("f-kit-backname-textcase");
      if(sizePct) sizePct.value = 100;
      if(letterSpacing) letterSpacing.value = 0;
      if(offsetX) offsetX.value = 0;
      if(offsetY) offsetY.value = 0;
      if(arc) arc.value = 1;
      if(textCase) textCase.value = "default";
      refreshKitModalPreview();
      showToast("Nombre restablecido — vuelve a seguir al número");
      break;
    }
    case "copy-number-style": {
      clipboardNumberStyle = readBackNumberFields();
      showToast("Estilo del número copiado");
      break;
    }
    case "paste-number-style-color": {
      if(!clipboardNumberStyle){ showToast("No has copiado ningún estilo de número todavía"); break; }
      writeBackNumberFields(clipboardNumberStyle, true);
      refreshKitModalPreview();
      showToast("Estilo y color del número pegados");
      break;
    }
    case "paste-number-style-only": {
      if(!clipboardNumberStyle){ showToast("No has copiado ningún estilo de número todavía"); break; }
      writeBackNumberFields(clipboardNumberStyle, false);
      refreshKitModalPreview();
      showToast("Estilo del número pegado (sin tocar el color)");
      break;
    }
    case "copy-name-style": {
      clipboardNameStyle = readBackNameFields();
      showToast("Estilo del nombre copiado");
      break;
    }
    case "paste-name-style-color": {
      if(!clipboardNameStyle){ showToast("No has copiado ningún estilo de nombre todavía"); break; }
      writeBackNameFields(clipboardNameStyle, true);
      refreshKitModalPreview();
      showToast("Estilo y color del nombre pegados");
      break;
    }
    case "paste-name-style-only": {
      if(!clipboardNameStyle){ showToast("No has copiado ningún estilo de nombre todavía"); break; }
      writeBackNameFields(clipboardNameStyle, false);
      refreshKitModalPreview();
      showToast("Estilo del nombre pegado (sin tocar el color)");
      break;
    }
    case "copy-both-style": {
      clipboardBothStyle = { number: readBackNumberFields(), name: readBackNameFields() };
      showToast("Estilo del número y del nombre copiados");
      break;
    }
    case "paste-both-style-color": {
      if(!clipboardBothStyle){ showToast("No has copiado ningún estilo todavía"); break; }
      writeBackNumberFields(clipboardBothStyle.number, true);
      writeBackNameFields(clipboardBothStyle.name, true);
      refreshKitModalPreview();
      showToast("Estilo y color de número y nombre pegados");
      break;
    }
    case "paste-both-style-only": {
      if(!clipboardBothStyle){ showToast("No has copiado ningún estilo todavía"); break; }
      writeBackNumberFields(clipboardBothStyle.number, false);
      writeBackNameFields(clipboardBothStyle.name, false);
      refreshKitModalPreview();
      showToast("Estilo de número y nombre pegado (sin tocar los colores)");
      break;
    }
    case "remove-layer-row": {
      const block = el.closest(".combo-block");
      const row = el.closest(".layer-row");
      if(row) row.remove();
      if(block) refreshComboBlockPreview(block); else refreshKitModalPreview();
      break;
    }
    case "move-layer-row": {
      const block = el.closest(".combo-block");
      const row = el.closest(".layer-row");
      if(!row) break;
      if(el.dataset.dir==="up"){
        const prev = row.previousElementSibling;
        if(prev) row.parentNode.insertBefore(row, prev);
      } else {
        const next = row.nextElementSibling;
        if(next) row.parentNode.insertBefore(next, row);
      }
      if(block) refreshComboBlockPreview(block); else refreshKitModalPreview();
      break;
    }
    case "add-combo-row": {
      const container = document.getElementById("kit-combo-rows");
      if(container){
        const blocks = container.querySelectorAll(".combo-block");
        let newCombo;
        if(blocks.length){
          newCombo = readComboFromBlock(blocks[blocks.length-1]);
        } else {
          const c1 = document.getElementById("f-kit-color1");
          const c2 = document.getElementById("f-kit-color2");
          const c3 = document.getElementById("f-kit-color3");
          newCombo = defaultCombo(c1?c1.value:null, c2?c2.value:null, c3?c3.value:null);
        }
        container.insertAdjacentHTML("beforeend", comboBlockHTML(newCombo, blocks.length));
        refreshComboBlockPreview(container.lastElementChild);
        refreshKitModalPreview();
        renumberComboBlocks();
      }
      break;
    }
    case "remove-combo-row": {
      const blocks = document.querySelectorAll("#kit-combo-rows .combo-block");
      if(blocks.length<=1){ alert("Debe quedar al menos una combinación."); break; }
      const block = el.closest(".combo-block");
      if(block) block.remove();
      renumberComboBlocks();
      break;
    }
    case "move-combo-row": {
      const block = el.closest(".combo-block");
      if(!block) break;
      if(el.dataset.dir==="up"){
        const prev = block.previousElementSibling;
        if(prev) block.parentNode.insertBefore(block, prev);
      } else {
        const next = block.nextElementSibling;
        if(next) block.parentNode.insertBefore(next, block);
      }
      renumberComboBlocks();
      break;
    }
    case "toggle-combo-block": {
      const block = el.closest(".combo-block");
      if(!block) break;
      const body = block.querySelector(".combo-block-body");
      const arrow = block.querySelector(".combo-toggle-arrow");
      const isOpen = body.style.display !== "none";
      body.style.display = isOpen ? "none" : "block";
      if(arrow) arrow.textContent = isOpen ? "▸" : "▾";
      break;
    }
    case "add-combo-layer-row": {
      const block = el.closest(".combo-block");
      if(!block) break;
      const container = block.querySelector(".combo-layer-rows-"+el.dataset.garment);
      if(container){
        container.insertAdjacentHTML("beforeend", layerRowHTML(null));
        refreshComboBlockPreview(block);
      }
      break;
    }
    case "cancel-kit-edit": {
      const fromManage = el.dataset.fromManage==="1";
      if(fromManage){ modalManageKits(getTeam(el.dataset.team)); } else { closeModal(); }
      break;
    }
    case "save-kit": {
      const teamId = el.dataset.team, id = el.dataset.id, category = el.dataset.category;
      const fromManage = el.dataset.fromManage==="1";
      const team = getTeam(teamId);
      const layers = readLayerRows(document.getElementById("kit-layer-rows"));
      const backLayers = readLayerRows(document.getElementById("kit-back-layer-rows"));
      const backNumberFields = readBackNumberFields();
      const backNameFields = readBackNameFields();
      const badgeNumberFields = document.getElementById("f-kit-badgenum-linked") ? readBadgeNumberFields() : {};
      const badgeNameFields = document.getElementById("f-kit-badgename-linked") ? readBadgeNameFields() : {};
      const combinations = Array.from(document.querySelectorAll("#kit-combo-rows .combo-block")).map(block=>readComboFromBlock(block));
      const data = {
        baseNumber: parseInt(document.getElementById("f-kit-base").value),
        color1: document.getElementById("f-kit-color1").value,
        color2: document.getElementById("f-kit-color2").value,
        color3: document.getElementById("f-kit-color3").value,
        layers, backLayers, combinations, ...backNumberFields, ...backNameFields, ...badgeNumberFields, ...badgeNameFields
      };
      if(category==="portero"){
        data.linkedJugadorKitIds = Array.from(document.querySelectorAll("#kit-linked-jugador .linked-jugador-checkbox:checked")).map(cb=>cb.value);
      }
      if(id){ Object.assign(team.kits.find(k=>k.id===id), data); }
      else { team.kits.push({id:newId("kit"), category, label:autoKitLabel(team,category), ...data}); }
      persist(); render();
      if(fromManage){ modalManageKits(team); } else { closeModal(); }
      break;
    }
    case "add-stadium": modalAddEditStadium(null); break;
    case "set-stadiums-view": stadiumsView = el.dataset.view; render(); break;
    case "edit-stadium": modalAddEditStadium(DB.stadiums.find(s=>s.id===el.dataset.id)); break;
    case "delete-stadium": {
      modalConfirm("¿Eliminar este estadio?", ()=>{
        const st = DB.stadiums.find(s=>s.id===el.dataset.id);
        if(st){
          // Quita cualquiera de sus nombres de las listas de estadios de los clubes.
          const keys = [st.tournamentName, st.officialName, st.nickname].map(n=>normLoose((n||"").trim())).filter(Boolean);
          (DB.clubsData||[]).forEach(c=>{
            if(!Array.isArray(c.stadiums)) return;
            c.stadiums = c.stadiums.filter(nm=> !keys.includes(normLoose(nm)));
            c.stadium = c.stadiums[0]||"";
          });
        }
        DB.stadiums = DB.stadiums.filter(s=>s.id!==el.dataset.id);
        persist(); render();
      });
      break;
    }
    case "save-stadium": {
      const id = el.dataset.id;
      const tournamentName = document.getElementById("f-st-tname").value.trim();
      const officialName = document.getElementById("f-st-oname").value.trim();
      if(!officialName && !tournamentName){ alert("Pon al menos el nombre oficial o el nombre de torneo FIFA."); return; }
      const coordsRaw = document.getElementById("f-st-coords").value.trim();
      let lat = null, lng = null;
      if(coordsRaw){
        const parts = coordsRaw.split(",").map(x=>parseFloat(x.trim()));
        if(parts.length===2 && !isNaN(parts[0]) && !isNaN(parts[1])){ lat = parts[0]; lng = parts[1]; }
      }
      const owner = matchOrAddClub(document.getElementById("f-st-owner").value);
      // Lee una fila por equipo, reutiliza el nombre canónico si el club ya existe y quita duplicados.
      const seen = new Set();
      const teams = [...document.querySelectorAll("#stadium-team-rows .stadium-team-name")]
        .map(i=>matchOrAddClub(i.value))
        .filter(n=>{ if(!n || seen.has(normLoose(n))) return false; seen.add(normLoose(n)); return true; });
      const data = {
        tournamentName,
        officialName,
        nickname: document.getElementById("f-st-nickname").value.trim(),
        showNickname: document.getElementById("f-st-shownick").checked,
        capacity: Math.max(0, parseInt(document.getElementById("f-st-capacity").value)||0) || null,
        turfType: document.getElementById("f-st-turf").value,
        city: document.getElementById("f-st-city").value.trim(),
        state: document.getElementById("f-st-state").value.trim(),
        country: document.getElementById("f-st-country").value.trim(),
        lat, lng,
        owner: owner || "",
        teams,
        worldCup: document.getElementById("f-st-wc").checked,
        isTraining: document.getElementById("f-st-training").checked
      };
      // Si el estadio/instalación pertenece a un club (dueño) y no se escribió país o ciudad,
      // hereda el país y la ciudad del club dueño.
      if(owner){
        const ownerClub = getClubByName(owner);
        if(ownerClub){
          if(!data.country && (ownerClub.country||"").trim()) data.country = ownerClub.country.trim();
          if(!data.city && (ownerClub.city||"").trim()) data.city = ownerClub.city.trim();
        }
      }
      // Vínculo en ambos sentidos: los cambios en "Equipos que juegan ahí" se reflejan
      // en la lista de estadios de cada club.
      const existing = id ? DB.stadiums.find(s=>s.id===id) : null;
      const oldTeams = existing ? (existing.teams||[]).slice() : [];
      const oldLink = existing ? stadiumLinkName(existing) : "";
      let st;
      if(existing){ Object.assign(existing, data); st = existing; }
      else { st = {id:newId("st"), ...data}; DB.stadiums.push(st); }
      const newLink = stadiumLinkName(st);
      // 1) Clubes quitados del estadio → se les quita este estadio de su lista.
      oldTeams
        .filter(t=> !teams.some(n=>normLoose(n)===normLoose(t)))
        .forEach(t=>{
          const c = getClubByName(t);
          if(!c || !Array.isArray(c.stadiums)) return;
          c.stadiums = c.stadiums.filter(nm=> normLoose(nm)!==normLoose(oldLink) && normLoose(nm)!==normLoose(newLink));
          c.stadium = c.stadiums[0]||"";
        });
      // 2) Si el estadio cambió de nombre, se actualizan las referencias en todos los clubes.
      if(oldLink && normLoose(oldLink)!==normLoose(newLink)){
        (DB.clubsData||[]).forEach(c=>{
          if(!Array.isArray(c.stadiums)) return;
          c.stadiums = c.stadiums.map(nm=> normLoose(nm)===normLoose(oldLink) ? newLink : nm);
          c.stadium = c.stadiums[0]||"";
        });
      }
      // 3) Clubes del estadio → este estadio aparece en su lista (al final, sin cambiar su principal).
      teams.forEach(t=>{
        const c = getClubByName(t);
        if(!c) return;
        if(!Array.isArray(c.stadiums)) c.stadiums = (c.stadium||"").trim() ? [c.stadium.trim()] : [];
        if(!c.stadiums.some(nm=>normLoose(nm)===normLoose(newLink))) c.stadiums.push(newLink);
        c.stadium = c.stadiums[0]||"";
      });
      persist(); closeModal(); render();
      break;
    }

    case "delete-catalog-item": {
      const cat = el.dataset.cat;
      const value = decodeURIComponent(el.dataset.value);
      const catLabel = ({leagues:"la liga", brands:"la marca", sponsorCategories:"la categoría"})[cat] || "el elemento";
      modalConfirm(`¿Eliminar ${catLabel} "${value}" del catálogo?`, ()=>{
        if(DB[cat]){ DB[cat] = DB[cat].filter(v=>v!==value); persist(); render(); }
      });
      break;
    }
    case "save-ui-text": {
      Object.keys(UI_TEXT_DEFAULTS).forEach(k=>{
        const input = document.getElementById(`ui-text-${k}`);
        if(!input) return;
        const val = input.value;
        if(val !== UI_TEXT_DEFAULTS[k]) DB.strings[k] = val;
        else delete DB.strings[k];
      });
      persist(); render();
      showToast("Textos de la interfaz actualizados");
      break;
    }
    case "reset-ui-text": {
      modalConfirm("¿Restablecer todos los textos de la interfaz a su versión original?", ()=>{
        DB.strings = {};
        persist(); render();
      });
      break;
    }
    case "reset-db": {
      modalConfirm("Esto borrará todo lo editado y volverá a los datos iniciales. ¿Continuar?", ()=>{
        DB = buildDefaultDB();
        migrateDB();
        HISTORY = []; saveHistory(); PREV_DB_JSON = JSON.stringify(DB); // el historial de la base anterior ya no aplica
        activeTab="inicio"; activeTeamId=null; resetNavHistory();
        persist(true); render();
      }, "Restablecer");
      break;
    }
    case "bulk-import-players": {
      const teamSelect = document.getElementById("bulk-team-select");
      const teamId = teamSelect ? teamSelect.value : "";
      if(!teamId){ alert("Elige primero la selección destino."); return; }
      const team = getTeam(teamId);
      const raw = document.getElementById("bulk-import-area").value;
      const parsed = parseBulkPlayers(raw);
      if(parsed.length===0){ alert("No se detectaron filas válidas para importar."); return; }
      const teamCountry = DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===teamId);
      let created=0, updated=0;
      parsed.forEach(p=>{
        const firstName  = p.firstName;
        const lastName   = p.lastName;
        const commonName = p.commonName || "";
        const club  = p.club  ? matchOrAddClub(p.club)   : "";
        const brand = (p.brand && p.brand.toLowerCase()!=="sin sponsor") ? matchOrAddBrand(p.brand) : null;
        // Upsert: busca por nombre común si existe, si no por firstName+lastName
        const nameKey = normLoose(commonName || `${firstName} ${lastName}`.trim());
        const existing = team.players.find(pl=>
          normLoose(playerDisplayName(pl))===nameKey ||
          normLoose(`${pl.firstName||""} ${pl.lastName||""}`.trim())===nameKey
        );
        if(existing){
          if(p.number!=null)        existing.number           = p.number;
          if(p.numberUnassigned)  { existing.number = null; existing.numberUnassigned = true; }
          else if(p.number!=null)   existing.numberUnassigned = false;
          if(p.pos)                 existing.pos           = p.pos;
          if(firstName)             existing.firstName     = firstName;
          if(lastName)              existing.lastName      = lastName;
          if(commonName)            existing.commonName    = commonName;
          if(p.fullName){
            existing.fullName = p.fullName;
            existing.fullNameLinked = (p.fullName === computeDefaultFullName(existing));
          }
          if(p.birthDate)           existing.birthDate     = p.birthDate;
          if(p.height!=null)        existing.height        = p.height;
          if(p.caps!=null)          existing.caps          = p.caps;
          if(p.goalsNational!=null) existing.goalsNational = p.goalsNational;
          if(club)                  existing.club          = club;
          if(p.shirtNameTeam)     { existing.shirtNameTeam = p.shirtNameTeam; existing.shirtNameTeamLinked = false; }
          if(brand)                 existing.brand         = brand;
          if(p.rating!=null)        existing.rating        = p.rating;
          if(p.ratingPotential!=null) existing.ratingPotential = p.ratingPotential;
          updated++;
        } else {
          const defaultFull = `${firstName} ${lastName}`.trim();
          team.players.push({
            id:newId("p"), firstName, lastName, commonName,
            fullName: p.fullName || defaultFull,
            fullNameLinked: !p.fullName || (p.fullName === defaultFull),
            pos:p.pos, number:p.number, numberUnassigned: p.numberUnassigned||false,
            birthDate:p.birthDate, height:p.height||null,
            club, rating:p.rating??70, ratingPotential:p.ratingPotential??null, brand,
            nationalityIds: teamCountry?[teamCountry.id]:[], declaredForCountryId: teamCountry?teamCountry.id:null,
            photo:null, caps:p.caps, goalsNational:p.goalsNational,
            favNumbersTeam:[], favNumbersClub:[],
            shirtNameTeam:p.shirtNameTeam||"", shirtNameClub:"",
            shirtNameTeamLinked:!p.shirtNameTeam, shirtNameClubLinked:true
          });
          created++;
        }
      });
      assignSquadNumbers(team);
      bulkImportTeamId = "";
      persist(); render();
      showToast(`${created} creado(s), ${updated} actualizado(s) en ${team.commonName}`);
      break;
    }
    case "delete-history-entry": {
      const hid = el.dataset.id;
      const after = parseInt(el.dataset.after)||0;
      const msg = after > 0
        ? `La base volverá a como estaba antes de este cambio. Los ${after} cambio${after===1?"":"s"} posteriores también se deshacen, porque se hicieron encima de éste. ¿Continuar?`
        : "La base volverá a como estaba antes de este cambio. ¿Continuar?";
      modalConfirm(msg, ()=>{ deleteHistoryFrom(hid); render(); showToast("Cambio revertido"); }, "Revertir");
      break;
    }
    case "clear-history": {
      modalConfirm("Se vacía solo la lista del historial — tus datos no cambian. ¿Continuar?", ()=>{ HISTORY = []; saveHistory(); render(); showToast("Historial vaciado"); }, "Vaciar");
      break;
    }
    case "import-json": {
      const txt = document.getElementById("import-area").value.trim();
      if(!txt) return;
      try{
        const parsed = JSON.parse(txt);
        if(!parsed.teams) throw new Error("Formato inválido");
        DB = parsed;
        migrateDB();
        HISTORY = []; saveHistory(); PREV_DB_JSON = JSON.stringify(DB); // el historial de la base anterior ya no aplica
        activeTeamId = null;
        resetNavHistory();
        persist(true); render();
        showToast("Base de datos importada y actualizada a la versión más reciente");
      }catch(err){ alert("JSON inválido: " + err.message); }
      break;
    }
  }
}
