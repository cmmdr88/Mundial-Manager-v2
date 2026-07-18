# Plan de modularización — Copa Manager 2026 (VER 62)

> Diseño de la estructura final. **No** mueve código, **no** modifica el proyecto: solo define en qué archivos vivirá cada cosa, cómo se conectarán y en qué orden conviene extraerlos.

## Estado de ejecución (actualizado)

> Esta sección refleja el estado **real** de la modularización a medida que se ejecuta el plan. El diseño de más abajo se mantiene como referencia histórica.

**Módulos ya extraídos y cableados**, cargados como *scripts clásicos* (no ES Modules) antes del `<script>` inline de `mundial2026-manager_62.html`, en este orden de carga:

```
<script src="datos/constantes.js"></script>
<script src="core/utilidades.js"></script>
<script src="app/textos-ui.js"></script>
<script src="funciones/medios.js"></script>
<script src="funciones/rankings.js"></script>
<script src="uniformes/motor-grafico.js"></script>
<script src="funciones/confederaciones.js"></script>
<script src="funciones/estadios.js"></script>
<script src="uniformes/modelo-kits.js"></script>
<script src="app/busqueda-global.js"></script>
<script src="funciones/patrocinadores.js"></script>
<script src="app/modales.js"></script>
<script src="funciones/paises.js"></script>
<script src="funciones/clubes.js"></script>
<script src="funciones/evento.js"></script>
<script src="funciones/calendario.js"></script>
<script src="funciones/jugadores.js"></script>
<script src="funciones/selecciones.js"></script>
<script src="funciones/editor.js"></script>
<script src="uniformes/ui-kits.js"></script>
<script src="nucleo/modelo-db.js"></script>
<script src="nucleo/migracion.js"></script>
<script src="persistencia/almacenamiento.js"></script>
<script src="persistencia/historial.js"></script>
<script src="app/router.js"></script>
<script src="app/acciones.js"></script>
<script> …inline (renderInicio, SEED_TEAMS, helpers de formulario, estado global, ~29 listeners de dominio)… </script>
<script src="app/init.js"></script>  ← ÚLTIMO (tras el inline)
```

1. `datos/constantes.js` — extraído (paso 1 del orden).
2. `core/utilidades.js` — extraído (paso 2 del orden).
3. `app/textos-ui.js` — extraído (paso 4 del orden). Contiene `T`, `groupedTextKeys`, `tabLabel`, `tabDescription`, `tabDescHTML`. Depende de `UI_TEXT_DEFAULTS` (de `constantes.js`) y lee `DB.strings`/`DB.event` en tiempo de ejecución.
4. `funciones/medios.js` — extraído (paso 5 del orden). Contiene `renderMedios`, `modalAddEditMedia`. Depende de `escapeHtml` (utilidades), `T`/`tabLabel`/`tabDescHTML` (textos-ui) y usa `DB.media`, `openModal`, `imageUploadField`, `colorPickerHTML`, `brandLogoHTML` (aún en el inline) en tiempo de ejecución.
5. `funciones/rankings.js` — extraído (paso 6 del orden). Contiene `fifaRankingFor`, `applyFifaRankingToTeams`, `eloForTeamName`, `applyEloRatingToTeams`, `computeEloRanks`, `computeFifaRanks`, `rankingValue`, `rankingType`, `rankingDefaultDir`, `renderRankings`. Depende de `FIFA_RANKING_BY_CODE`/`ELO_RATING`/`ELO_NAME_ALIASES`/`RANKING_SECTION_IDS` (constantes), `compareGeneric`/`sortTh` (utilidades), `T`/`tabLabel`/`tabDescription` (textos-ui), y usa en tiempo de ejecución `DB`, el estado `rankingSection`/`rankingSort` (que **permanece en el inline**) y helpers del inline (`teamRating`, `crestHTML`, `confBadge`, `fifaBadge`).
6. `uniformes/motor-grafico.js` — extraído (paso 7 del orden). Motor gráfico de bajo nivel (sin `DB`): 11 funciones de texto/métricas (`normalizeForVerticalMetrics`, `verticalRefMetrics`, `enableFontKerning`, `fitTextMetrics`, `applyTextCase`, `clampInkToBounds`, `drawCurvedText`, `arcRadiusFor`, `drawTextWithStyle`, `badgeTextVerticalInk`, `badgeGroupTransform`) y 6 de imagen/canvas (`readFileAsDataURL`, `resizeImageToDataURL`, `loadImg`, `_nativeRecolorCacheKey`, `recolorToCanvas` + caché `_nativeRecolorCache`). Depende solo de `utilidades` (`hexToRgb`, `stripDiacritics`) y `constantes`. Se evaluó dividirlo en submódulos texto/imagen (son independientes) y se decidió **mantenerlo único**: comparten dependencias y consumidores, así que dividir no reduce acoplamiento y solo añade archivos. **Nota:** `drawBackNumberOnCanvas` (async) está físicamente intercalada entre las funciones de texto pero **NO es del motor** (usa `getNumberFont`/`ensureNumberFontLoaded` de modelo-kits) y **permanece en el inline**; por eso la extracción del bloque de texto fue no contigua.

7. `funciones/confederaciones.js` — extraído (paso 8 del orden). Contiene `buildDefaultConfederations`, `buildDefaultFifa`, `confBadge`, `fifaBadge`, `orgCrestHTML` (modelo/badges), `renderConfederaciones` (vista) y `modalEditFifa`, `modalEditConfederation` (modales). Depende de `CONF_LIST`/`CONF_COLORS`/`CONF_INFO_DEFAULTS`/`FIFA_INFO_DEFAULT` (constantes) y `T`/`tabLabel`/`tabDescription` (textos-ui); usa en tiempo de ejecución `DB`, el estado `confExpanded` (**permanece en el inline**) y helpers del inline (`openModal`, `colorPickerHTML`, `imageUploadField`, `teamCardHTML`). Se evaluó dividirlo (modelo/badges · vista · modales) y se decidió **mantenerlo único**: los tres clústeres comparten el dominio de datos (confederaciones/FIFA), constantes y consumidores, así que dividir no reduce acoplamiento. **Referencia cruzada:** `rankings.js` (ya extraído) consume `confBadge`/`fifaBadge`; como se llaman solo en tiempo de render y ambos scripts cargan antes del inline, funciona sin ciclo de carga. `confExpanded` y un bloque de estado de ui-kits que estaba bajo el comentario `/* CONFEDERACIONES */` permanecen en el inline.

8. `funciones/estadios.js` — extraído (paso 9 del orden). Contiene `buildDefaultStadiums`, `renderEstadios`, `stadiumCardHTML`, `stadiumDisplayName`, `stadiumSubName`, `modalAddEditStadium`, `findStadiumByName`, `stadiumLinkName`, `ensureStadiumFromName`, `clubStadiumRowHTML`, `stadiumTeamRowHTML` (en 5 clústeres dispersos del inline). Depende de `STADIUMS_SEED` (constantes), `normLoose`/`newId`/`uid`/`escapeHtml` (utilidades) y `T`/`tabLabel`/`tabDescHTML` (textos-ui); usa `DB`, el estado `stadiumsView` (**permanece en el inline**) y `openModal`. **Es un catálogo hoja:** no llama a otros dominios; son `clubes`/`calendario`/`selecciones` los que dependen de él (unión "por nombre" vía `findStadiumByName`/`ensureStadiumFromName`/`stadiumLinkName`). Sin ciclos.

9. `uniformes/modelo-kits.js` — extraído (paso 10 del orden). Modelo de uniformes (15 funciones en 3 clústeres): `buildDefaultKitBases`, `buildDefaultShortsBases`, `buildDefaultSocksBases`, `buildDefaultNumberFonts`, `buildDefaultBackBases`, `garmentConfig`, `numberFontLabel`, `numberFontFamily`, `ensureNumberFontLoaded`, `getNumberFont`, `backBaseDisplayLabel`, `getBackBaseForShirtNumber`, `padKitNumber`, `garmentName`, `fontDataUrlExtension` + caché `_loadedNumberFontFamilies`. Depende de seeds/constantes (`KIT_BASE_SEED`, `GARMENT_TYPES`, `GARMENT_DISPLAY_PREFIX`, etc.) y `uid` (utilidades); lee `DB`. **No llama a `motor-grafico`** (la función puente `drawBackNumberOnCanvas`, que usa ambos, permanece en el inline), así que **sin ciclo dentro del bloque uniformes**. La caché vive en el módulo y el inline la referencia (borra entradas al eliminar fuentes) en tiempo de ejecución. Los `buildDefault*` se llaman en la init del inline, que corre después.

10. `app/busqueda-global.js` — extraído (paso 11 del orden). Buscador de la barra superior: `closeGlobalSearch`, `runGlobalSearch`, `gsItemHTML`, `buildGlobalSearch` (un solo clúster). Depende de `escapeHtml` (utilidades); usa en tiempo de ejecución `DB.teams`, `playerDisplayName` (jugadores) y `navigateToTeam`/`navigateToPlayer` (router), todos en el inline. **Autocontenido:** engancha sus propios listeners (no depende de `handleAction`) y `closeGlobalSearch` solo se llama desde dentro del módulo (el router NO la llama → sin referencia mutua). Lo arranca `init` (llama a `buildGlobalSearch` una vez), que corre después de que el módulo carga. Sin ciclos.

11. `funciones/patrocinadores.js` — extraído (paso 12 del orden). Patrocinadores/marcas (13 funciones en 4 clústeres): `sponsorCategoriesOf`, `sponsorHasCategory`, `findSponsorByName`, `apparelBrandNames`, `ensureApparelBrandSponsor`, `matchOrAddBrand`, `effectiveShirtName`, `addBrand`, `addSponsorCategory`, `renderPatrocinadores`, `brandLogoHTML`, `sponsorCategoryRowHTML`, `modalAddEditSponsor`. Depende de `APPAREL_CATEGORY`/etc. (constantes) y `normLoose`/`newId`/`escapeHtml`/`initials` (utilidades); usa en tiempo de ejecución `DB`, `getTeam` y helpers de modales (`openModal`, `T`, `imageUploadField`, `colorPickerHTML`), todos en el inline. **No llama a otros dominios** (sin ciclos). **Referencia cruzada:** `medios.js` (ya extraído) consume `brandLogoHTML` en tiempo de render; y jugadores/uniformes (inline) consumen `effectiveShirtName`/`matchOrAddBrand`/`ensureApparelBrandSponsor`/`apparelBrandNames`. La construcción por defecto de sponsors/brands vive en `buildDefaultDB` (inline) y no se tocó. No dividido: mismo dominio, constantes y consumidores.

12. `app/modales.js` — extraído (paso 13 del orden). Infraestructura de UI (7 funciones en 3 zonas): `showToast`, `detailNavHTML`, `openModal`, `closeModal`, `modalConfirm`, `imageUploadField`, `fontUploadField`. Es **DOM puro** (no usa utilidades/constantes/motor-grafico); su única dependencia saliente es `renderKitPreviews` (ui-kits), que `openModal` invoca en tiempo de ejecución y **permanece en el inline** → referencia mutua modales↔ui-kits (sin ciclo de carga). La consumen casi todos los módulos (openModal/imageUploadField ya desde medios/confederaciones/estadios/patrocinadores, en tiempo de render). **Corrección al plan:** el plan indicaba dependencia de `motor-grafico` para las subidas, pero `imageUploadField`/`fontUploadField` solo generan HTML; el redimensionado ocurre en un handler que se queda en el inline. **`colorPickerHTML` (helper hermano de campo de formulario) NO está en la lista del plan y permanece en el inline** (lo usan 11 sitios, en tiempo de llamada). No dividido.

13. `funciones/paises.js` — extraído (paso 14 del orden). Catálogo de países/entidades (13 funciones en 4 clústeres): `buildDefaultCountries`, `relinkCountriesToTeams`, `buildMinimalTeamFromCountry`, `integrateTeamsFromCountries`, `findOrCreateCountryByName`, `countryNameById`, `findCountryByName`, `refreshDeclaredForOptions`, `playerCountryName`, `sortedCountries` (modelo), `countryRowHTML`, `nationalityRowHTML` (filas) y `modalAddEditCountry` (modal). Depende de `COUNTRIES_SEED`/etc. (constantes), utilidades (`normLoose`/`newId`/`uid`/`colorsFor`/`initials`/`shiftColor`/`escapeHtml`), `T` (textos-ui), `confBadge` (confederaciones, render), `openModal` (modales, render); usa en tiempo de ejecución `DB`, `getTeam` y `langRowHTML` (permanecen en el inline). **Clave:** `buildMinimalTeamFromCountry` construye la selección con un **literal propio**, NO llama a `selecciones` → **sin ciclo** con el dominio de selecciones. Lo consumen selecciones/jugadores/editor/modelo-db/historial. No dividido: mismo dominio de datos. **Deuda:** `langRowHTML` (filas de idioma del modal de país) no está en la lista del plan y quedó en el inline; y el puente país↔selección duplica la forma del objeto selección (vigilar al extraer selecciones/modelo-db).

14. `funciones/clubes.js` — extraído (paso 15 del orden). Modelo de clubes/ligas (21 funciones en 5 zonas, con estado intercalado que se queda): unión por nombre (`clubKey`/`getClubByName`/`ensureClubObject`/`matchOrAddClub`), ligas (`ensureLeague`/`matchOrAddLeague`/`buildDefaultLeagues`), datos (`buildDefaultClubsData`/`clubDisplayName`/`clubPlayers`/`clubRatings`/`addClub`), orden (`clubValue`/`clubValType`/`orderedClubs`), vistas (`clubCrestHTML`/`leagueBadge`/`clubCardHTML`/`renderClubes`/`renderClubDetail`) y modal (`modalAddEditClub`). Depende de `CLUB_SEED_DATA` (constantes), utilidades (`normLoose`/`newClubId`/`isRegistered`/`avgRating`/`compareGeneric`/`sortTh`), textos-ui, **estadios** (`clubStadiumRowHTML`/`stadiumLinkName`/`stadiumDisplayName`, render) y **modales** (`openModal`/`imageUploadField`/`detailNavHTML`, render); usa `DB`, `colorPickerHTML` y el estado `clubsSort`/`clubFilter` (inline). **No llama a jugadores/selecciones/patrocinadores → sin ciclo.** **Correcciones al plan:** (a) `newClubId` NO es de clubes: ya vive en `utilidades.js` (no se movió); (b) el plan indicaba dependencia de `patrocinadores`, pero no hay ninguna llamada; (c) `clubValue`/`clubValType` (helpers de orden) no estaban listados y se movieron con clubes. No dividido: mismo dominio.

15. `funciones/evento.js` — extraído (paso 16 del orden). Modelo/vistas/editores del torneo (21 funciones en 3 zonas, estado `eventoDetailOpen`/`eventBracketDraft` permanece en el inline): `buildDefaultEvent`, lógica de estructura (`eventGroupLetters`/`eventGroupStageMatches`/`eventKnockoutMatches`/`eventThirdSlots`/`solveThirdPairings`), vistas (`eventCrestHTML`/`eventFmtDate`/`renderEvento`/`renderEventoDetail`/`eventHostRowHTML`), cargador oficial (`findTeamByNameLoose`/`loadOfficialCalendarConfirm`/`doLoadOfficialCalendar`) y modales/saves (`modalEditEvent*`/`saveEvent*`/`readEventBracketDraftFromDOM`). Depende de `WC26_*` (constantes), utilidades, textos-ui, **modales** y **paises** (`buildMinimalTeamFromCountry`, render); usa `DB`, `persist`, `render` (inline). **Corrección al plan:** NO depende de `calendario` ni de `selecciones` — `doLoadOfficialCalendar` construye el calendario directamente (sin `generateAllFixtures`) y no usa helpers de selección. La relación con calendario es **unidireccional (calendario→evento)** vía `eventGroupStageMatches`/`eventKnockoutMatches`/`eventThirdSlots`/`solveThirdPairings` → **sin ciclo, sin cambio de orden**. No dividido (la lógica de estructura es sub-bloque puro aislable si se quisiera).

16. `funciones/calendario.js` — extraído (paso 17 del orden). Fixtures, tablas de grupo y simulación (13 funciones en 2 clústeres): `roundRobin`, `generateAllFixtures`, `clearAllFixtures`, `standingsFor`, `fmtFixtureDate`, `knockoutRoundName`, `fixtureSortKey`, `venueLinkHTML`, `teamLinkHTML`, `renderCalendario` (calendario) y `poisson`, `openSimModal`, `rollDice` (simulación "chapas", lógica pura). Depende de `escapeHtml` (utilidades), `tabLabel`/`tabDescHTML` (textos-ui), **estadios** (`findStadiumByName`/`stadiumDisplayName`, render) y **modales** (`openModal`/`modalConfirm`/`showToast`); usa en tiempo de ejecución `DB`, `getTeam`, `teamRating`, `persist` (inline). **Corrección al plan:** NO depende de `evento` (las funciones de estructura del torneo `eventGroupStageMatches`/`eventKnockoutMatches`/`eventThirdSlots` son **internas de evento**, no las consume calendario ni nadie más). No dividido (la simulación es sub-bloque puro aislable internamente, como nota el plan). Sin ciclo.

17. `funciones/jugadores.js` — extraído (paso 18 del orden). Dominio jugadores (26 funciones en 7 zonas; estado `playerFilter`/`bulkImportTeamId`/`playerSort` permanece en el inline): helpers de nombre/edad/dorsal (`splitFullName`, `P`, `playerDisplayName`/`playerDisplayNameHTML`, `computeAge`/`playerAge`/`playerAgeText`, `parseBirthDate`, `computeDefaultFullName`/`computeDefaultShirtNameValue`), plantel (`nextAvailableNumber`/`assignSquadNumbers`/`suggestNumber`), import (`parseBulkPlayers`), orden (`playerSortName`/`playerLastNameKey`/`playerBirthSortKey`/`playerValue`/`playerType`/`playerDefaultDir`), vistas (`getPlayerWithTeam`/`renderPlayerDetail`/`renderJugadores`) y modal (`parseFavNumbers`/`checkNumberTaken`/`modalAddEditPlayer`). Depende de constantes (`POS_ORDER`/`NUMBER_START_BY_POS`/`MONTH_NAMES`), utilidades, textos-ui, **modales**, **paises** (`playerCountryName`/`nationalityRowHTML`) y **patrocinadores** (`apparelBrandNames`); usa en tiempo de ejecución `DB`, `getTeam`, `orderedTeamPlayers` (selecciones, inline). **Relación mutua con selecciones en tiempo de render (sin ciclo de carga).** **Clave:** `P` se usa al evaluar `const SEED_TEAMS` (inline); como jugadores.js carga antes del inline, resuelve. Se movieron 4 helpers propios no listados (`playerType`/`playerDefaultDir`/`parseFavNumbers`/`checkNumberTaken`). El `document.addEventListener("input",…)` global de setup NO es de jugadores y permaneció en el inline. No dividido.

18. `funciones/selecciones.js` — extraído (paso 19 del orden). Selecciones (16 funciones en 5 zonas; estado `seleccionesSort`/`squadSort` en el inline): métricas (`teamRatings`/`teamRating`/`ratingBlockHTML`/`squadStatus`), grupos (`groupsList`/`teamsInGroup`/`groupSlotIndex`/`teamsInGroupOrdered`), vista (`crestHTML`/`teamCardHTML`/`orderedTeamsForSelecciones`/`renderSelecciones`/`orderedTeamPlayers`/`renderTeamDetail`/`squadSortChip`) y modal (`modalAddEditTeam`). Depende de utilidades, textos-ui, **confederaciones** (confBadge/fifaBadge), **modales** y **jugadores** (playerDisplayName/playerValue/playerType/playerAgeText); usa `getTeam` (reservado a modelo-db, inline) en tiempo de ejecución. **Relación mutua con jugadores en tiempo de render (sin ciclo de carga).** El `document.addEventListener("input",…)` que sigue a `modalAddEditTeam` es setup global y permaneció en el inline. **DECISIÓN ARQUITECTÓNICA: `getTeam` NO se extrajo** (ver abajo).

### Decisiones arquitectónicas (cambios respecto al plan original)

Registro de cambios de frontera acordados durante la ejecución, respecto al diseño original del plan:

- **`getTeam` reasignado de `selecciones` a `modelo-db` (paso 19).** El plan lo listaba en `funciones/selecciones.js`, pero `getTeam(id)` es un **accesor de datos puro** (`DB.teams.find(id) || DB.clubsData.find(id)` — devuelve equipos *y* clubes, sin lógica de selecciones) consumido por ≥4 módulos ya extraídos (calendario, jugadores, paises, patrocinadores) + inline. Colocarlo en un módulo de dominio invertiría las capas (módulos inferiores dependiendo "hacia arriba" de selecciones para una simple búsqueda). Se decidió **reservarlo para `nucleo/modelo-db.js`** y dejarlo temporalmente en el inline. `teamRating`/`teamRatings` (lógica de métrica de equipo) y `crestHTML` (helper de vista) **sí** son de selecciones y se extrajeron. `getClub`/`getPlayer` no existen como funciones.
- **modelo-db (paso 22): `getTeam` incorporado; `_seedCounter` y `SEED_TEAMS` NO.** `getTeam` se movió al fin al núcleo (`nucleo/modelo-db.js`) junto con `DB` y `buildDefaultDB` (decisión ya aprobada en el paso 19). **Corrección al plan:** `_seedCounter` NO es de modelo-db — se define en `core/utilidades.js` (contador de `uid`); `buildDefaultDB` solo lo lee en tiempo de ejecución, así que permaneció en utilidades. **`SEED_TEAMS` permaneció en el inline**, reservado a `datos/semillas-equipos.js` (paso 3, pospuesto): el plan lo lista como variable que modelo-db *usa*, no que posee; `buildDefaultDB` lo consume en tiempo de ejecución (init). Esto crea una dependencia temporal modelo-db→inline (SEED_TEAMS) que se resolverá al extraer el paso 3.
- **`editor.js` acotado a presentación (paso 20).** El plan definía `editor.js` como "agregador" incluyendo los listeners `ui-text`/`country` (hoy en `attachHandlers`) y los casos `import-json`/`clear-history`/`delete-history-entry` (hoy en `handleAction`, un `switch` de ~1.385 líneas). Se decidió extraer **solo `renderEditor`** (la vista); esos listeners y casos son **infraestructura de eventos del núcleo** y **permanecen en el inline**, reservados a `handleAction` (paso 27) y `attachHandlers`/`init` (paso 28). editor.js es un módulo de **presentación**, no propietario del sistema de eventos. No se tocó ninguna función del núcleo.
- **Bloque uniformes: 5 funciones de datos reubicadas a `modelo-kits` (paso 21).** El plan situaba todo el bloque de kits en `ui-kits`. Se detectó que `ensureTeamKits` (constructor/normalizador de `t.kits`), `defaultCombo` (constructor de combo desde `DB.*Bases`), `cloneCombo` (clon), `kitOrdinalLabel` y `autoKitLabel` (etiquetas derivadas) son **modelo de datos**, no presentación (análogas a `buildDefault*`/`ensureClubObject`), consumidas por `buildDefaultDB`/migración/`handleAction`. Se autorizó **corregir la frontera** incorporándolas a `uniformes/modelo-kits.js` (módulo ya extraído) — no es un paso nuevo del plan, sino una corrección de capa. El resto del bloque (presentación, render, previews, generación de imágenes, builders HTML y modales) fue a `uniformes/ui-kits.js`. **Clasificación de funciones no inventariadas inicialmente:** `renderPlayerBadgePreviews` → ui-kits (renderer de previews); `shirtBackImgFor`/`shirtFrontImgFor`/`shirtBackImgForCategory` → ui-kits (resolutores de imagen para el render, sin mutación de datos, usados solo por los renderers). Los 4 `addEventListener` globales del modal de kits y los casos `kit-*` de `handleAction` permanecen en el inline (núcleo).

19. `funciones/editor.js` — extraído (paso 20 del orden). **Solo `renderEditor`** (panel admin: editor de textos, catálogo de países, historial, import/export JSON). Depende de textos-ui (`T`/`tabLabel`/`tabDescHTML`/`groupedTextKeys`), paises (`countryRowHTML`/`sortedCountries`) y utilidades (`escapeHtml`); lee `DB`/`HISTORY`. **DECISIÓN ARQUITECTÓNICA (Opción A):** los listeners `ui-text`/`country` (attachHandlers) y los casos `import-json`/`clear-history`/`delete-history-entry` (handleAction) **NO se extrajeron** — son cableado de eventos del núcleo y quedan en el inline (ver Decisiones arquitectónicas). Los botones `data-action` de la vista los despacha `handleAction`. El `document.addEventListener("input")` global que sigue a renderEditor permaneció en el inline. Módulo de presentación puro, sin ciclo.

20. `uniformes/ui-kits.js` — extraído (paso 21 del orden). **45 funciones** de presentación de uniformes en 7 runs: builders HTML (`kitCardHTML`, `garmentBaseCardHTML`, `comboBlockHTML`, `garmentSectionHTML`, `garmentTemplateCardHTML`, `numberFontCardHTML`, `backBaseCardHTML`, `outlineThumb`), secciones/previews (`renderGarmentSection`, `renderNumberFontsSection`, `renderBackBasesSection`, `renderKitPreviews`, `renderPlayerBadgePreviews`, `renderGarmentPreviews`, `renderNumberFontPreviews`), generación de imágenes (`drawBackNumberOnCanvas`, `buildPlayerNumberBadgeDataURL`, `buildKitBadgePreviewDataURL`, `buildNumberFontPreviewDataURL`, `buildGarmentDataURL`, `buildKitDataURL`, `buildKitBackDataURL`, `shirtBackImgFor`, `shirtFrontImgFor`, `shirtBackImgForCategory`), modales y helpers de formulario (`modalManageKits`, `modalAddEditKit` + `readLayerRows`/`read*`/`write*`/`sync*`/`unlink*`/`refresh*`/`readComboFromBlock`/`renumberComboBlocks`/`updateBadgeStatusBadge`). Depende de constantes, utilidades, **motor-grafico**, **modelo-kits** (incl. las 5 funciones de datos reubicadas), **modales**, **jugadores** (`getPlayerWithTeam`); usa `DB`, `getTeam` (inline) y el estado de sesión `clipboard*`/`drag*`/`*Expanded` (inline). Ref. mutua render-time con `modales` (`openModal`→`renderKitPreviews`). **Se quedan en el inline (núcleo):** 4 `addEventListener` globales + casos `kit-*` de `handleAction`. Fidelidad byte a byte verificada. Ver Decisiones arquitectónicas.

21. `nucleo/modelo-db.js` — extraído (paso 22 del orden, **inicio del NÚCLEO**). 3 piezas: `let DB = null` (variable global central), `buildDefaultDB` (constructor por defecto que orquesta los `buildDefault*`) y `getTeam` (accesor de entidad por id, reasignado desde selecciones). Depende de utilidades (`uid`/`colorsFor`/`_seedCounter`) y, en tiempo de ejecución, de `SEED_TEAMS` (inline) + todos los `buildDefault*` (módulos) — todo call-time (se invoca en init). Cargado tras `ui-kits.js`, antes del inline. **Permanecen en el inline (núcleo/otros pasos):** `SEED_TEAMS` (→ paso 3), `_seedCounter` (en utilidades), el estado de router (`activeTab`/`activeTeamId`/…), y las asignaciones `DB =` (loadDB/import/migración/init). Validación de carga en runtime superada: DB se construye completo (222 equipos, 39 clubes). Ver Decisiones arquitectónicas.

22. `nucleo/migracion.js` — extraído (paso 23 del orden, núcleo). 3 funciones (clúster contiguo): `repairDuplicateTeamIds` y `dedupeDuplicateTeams` (helpers internos, llamados solo por migrateDB) + `migrateDB` (compatibilidad de esquema: rellena campos nuevos, migra formatos viejos, repara duplicados de ids/selecciones). **Migración pura:** transforma un `DB` ya cargado in situ; **no carga ni persiste** (verificado: 0 llamadas a persist/loadDB/localStorage) ni construye por defecto (aunque invoca `buildDefault*`/`ensure*` en call-time para rellenar colecciones faltantes). Depende de `DB` (modelo-db) y funciones de dominio, todo en tiempo de ejecución. La invocan `loadDB` (almacenamiento) y `handleAction` (reset/import), que permanecen en el inline. Sin ciclo. Validación runtime superada (init buildDefaultDB+migrateDB OK).

23. `persistencia/almacenamiento.js` — extraído (paso 24 del orden, núcleo). 4 piezas: `STORAGE_KEY` (clave), `saveTimer` (timer de guardado diferido, exclusivo de persist), `loadDB` (async: `window.storage.get` → migra → fija baseline) y `persist` (guardado diferido → `window.storage.set`, invocando `recordHistory` antes de sobreescribir). Backend: **`window.storage`** (get/set con `STORAGE_KEY`). Depende de modelo-db (`DB`/`buildDefaultDB`), migracion (`migrateDB`) y modales (`showToast`); usa en call-time las piezas de historial `PREV_DB_JSON`/`recordHistory` (inline, reservadas al paso 25). `STORAGE_KEY` también lo usa el historial (revertir). La invocan `init` (loadDB) y `handleAction`/acciones (persist), que permanecen en el inline. Sin ciclo. **Frontera:** el baseline `PREV_DB_JSON` y `recordHistory` son de historial; loadDB/persist solo los referencian (acoplamiento esperado, sin lógica de historial separable). Validación runtime + flujo buildDefaultDB→loadDB→migrateDB→persist OK.

24. `persistencia/historial.js` — extraído (paso 25 del orden, núcleo). Sistema de deshacer (undo) con diff por entidad: consts (`HISTORY_KEY`="wc26_history_v1", `HISTORY_MAX`, `HISTORY_MAX_BYTES`), estado (`HISTORY`, `PREV_DB_JSON`, `historySaveTimer`), `HIST_COLLS` y 8 funciones (`histTopKeyLabel`, `diffTeamPlayers`, `computeDBDiff`, `recordHistory`, `saveHistory`, `loadHistory`, `applyReverseOps`, `deleteHistoryFrom`). Bloque contiguo (656-808). Depende de modelo-db (`DB`/`getTeam`), etiquetas de dominio (estadios/paises/clubes/jugadores) y modales (`showToast`); usa `window.storage` con clave propia `wc26_history_v1`. **Las funciones no llaman a render/navigate/persist** (separación limpia de router/acciones). **Acoplamiento call-time con almacenamiento:** historial declara `PREV_DB_JSON` (baseline del diff) que loadDB/persist referencian, y usa `STORAGE_KEY` de almacenamiento al revertir — sin ciclo de carga. **Se quedan en el inline:** los casos de deshacer de `handleAction` (delete-history-entry/clear-history) y la llamada de `init` a `loadHistory`. Validación runtime: ciclo persist→recordHistory→undo→restore OK, misma clave y formato.

25. `app/router.js` — extraído (paso 26 del orden, núcleo). 18 funciones + estado de navegación. **Estado (router):** `activeTab`, `activeTeamId`, `activePlayerId`, `activeClubId` (contexto de navegación), `navHistory`, `navIndex`, `MAX_NAV_HISTORY` (historial de navegación con scroll). **Funciones:** scroll (`currentScrollY`, `saveScrollToCurrent`, `scrollToTop`, `restoreScroll`), navegación (`navigateTo`, `navigateToClub`/`Team`/`Player`, `replaceCurrentClub`/`Team`/`Player`, `pushHistory`, `navBack`, `navForward`, `resetNavHistory`) y coordinación de render (`renderTabs`, `renderNavButtons`, `render`). `render()` decide la vista por `activeTab` e invoca los `render*` externos (dominios) + `renderInicio`/`attachHandlers` (inline) — **no contiene presentación de dominio**. **NO se absorbió:** `renderInicio` (vista de presentación, se queda), `eventoDetailOpen`/`eventBracketDraft` (estado de dominio evento), ni `TABS` (ya en constantes). `activeClubView` no existe. Ref. mutua render-time con dominios (sin ciclo). Dependencias router→inline (renderInicio, attachHandlers) a resolver en pasos 27/28. Validación runtime: flujo de navegación (navigateTo/navBack/navForward/resetNavHistory/render) OK; handleAction (1385) y attachHandlers (56) byte-idénticos.

26. `app/acciones.js` — extraído (paso 27 del orden, núcleo). **`handleAction` únicamente** (el switch central, 1385 líneas, 152 casos). Despachador puro: NO define lógica de negocio; invoca externos (render/navigate del router, persist de almacenamiento, recordHistory/deleteHistoryFrom de historial, getTeam/buildDefaultDB de modelo-db, migrateDB, ensureTeamKits, modalManageKits/modalAddEditKit de ui-kits, y save*/modales de dominio), todo call-time. Verificado: 0 definiciones de funciones ajenas dentro; los 152 casos intactos, incluidos los reservados (editor, kits, historial, navegación, import/export), sin fragmentar. **Correcciones de frontera respecto al plan:** (a) `attachHandlers` NO se incluyó (el plan lo agrupaba aquí, pero por decisión vigente va con init, paso 28); (b) `checkNumberTaken`/`parseFavNumbers` ya estaban en jugadores.js (paso 18); (c) los 8 helpers de formulario (colorPickerHTML, layerRowHTML, nickname*, langRowHTML, clubArticle*) son compartidos por modales/renders de módulos, NO privados de handleAction → permanecen en el inline (futuro campos-form.js). Validación runtime: muestreo funcional en 8 dominios OK; attachHandlers byte-idéntico.

27. `app/init.js` — extraído (paso 28 del orden, **CIERRE DEL PLAN**). Arranque y cableado global: `attachHandlers` (cableado por render: delega #view en handleAction, rellena previews de kits, engancha filtros de jugadores/clubes/editor), el listener global de click (dispatch de data-action de modales/nav a handleAction) e `init` (IIFE de arranque: loadDB → loadHistory → render → buildGlobalSearch → badge). **Carga como ÚLTIMO script, DESPUÉS del inline**, porque init() se autoinvoca y depende de SEED_TEAMS/renderInicio/helpers/estado del inline. **Corrección de frontera:** el listener global de click (dispatch puro) se incluyó con init/attachHandlers por ser wiring de arranque; los ~29 listeners de DOMINIO (drag-drop de kits, refresco de combos, nacionalidad…) contienen lógica de dominio y **permanecen en el inline**. Validación runtime: arranque end-to-end automático (222 equipos, primer render, historial) OK; sin listeners duplicados (los 2 document-click son dispatch + cierre de búsqueda, preexistentes).

> **Precedente de arquitectura (estado de UI).** `rankings.js` es el primer módulo con estado de vista asociado (`rankingSection`, `rankingSort`). Se decidió **dejar ese estado en el inline** (donde también lo reasigna `handleAction`) y que el módulo lo lea/escriba como global compartido, en lugar de moverlo. Funciona porque los *scripts clásicos* comparten el entorno léxico global y las funciones se invocan siempre después de que el inline se ejecuta. Este criterio se reutilizará en las siguientes extracciones de vistas con estado (jugadores, selecciones, etc.): mover funciones, conservar el estado en el inline hasta que se modularice la capa de estado/router (pasos finales).

**Desvío respecto al orden numérico del plan.** El paso 3 (`datos/semillas-equipos.js`) queda **pospuesto**. Motivo: `SEED_TEAMS` se construye con el helper `P()`, que todavía vive en el `<script>` inline y se extraerá junto con `funciones/jugadores.js` (paso 18). Si `SEED_TEAMS` se moviera ahora a un archivo externo cargado *antes* del inline, lanzaría `ReferenceError` porque `P` aún no está definido en ese instante. Por eso se ejecutó primero el paso 4 (`app/textos-ui.js`). Queda además pendiente la decisión de diseño de las "Notas" (co-ubicar `SEED_TEAMS` en jugadores/selecciones en vez de un archivo de datos aparte).

**PLAN DE 28 PASOS COMPLETADO.** Los 28 pasos han sido extraídos y validados. Residual en el inline (por decisión de diseño): `renderInicio`, `SEED_TEAMS` (paso 3 diferido), helpers de formulario compartidos, estado global de dominio/UI y ~29 listeners de dominio. Pasos opcionales pendientes: `datos/semillas-equipos.js` (3), futuro `campos-form.js`, posible módulo `inicio`.

**Nota sobre números de línea.** Las posiciones citadas en este plan y en el catálogo corresponden a la VER 62 *previa* a las extracciones; tras mover constantes/utilidades/textos-ui las líneas se han desplazado. Localizar siempre por nombre, no por número de línea.

## Convenciones de este plan

- **Escala de riesgo:** Muy bajo · Bajo · Medio · Alto · Muy alto. (Probabilidad de romper algo al mover el módulo.)
- **Escala de dificultad:** Trivial · Baja · Media · Alta · Muy alta. (Esfuerzo/cuidado que exige la extracción.)
- "Exporta/comparte" = API pública que otros módulos consumirán (hoy son variables/funciones globales).
- El sistema de módulos concreto (ESM `import/export`, un espacio de nombres global compartido, o un *bundler*) es una decisión aparte; este plan describe **límites y contratos**, no sintaxis.

## Estructura de carpetas propuesta

```
/src
  /datos
    constantes.js
    semillas-equipos.js
  /core
    utilidades.js
  /nucleo
    modelo-db.js
    migracion.js
  /persistencia
    almacenamiento.js
    historial.js
  /app
    router.js
    acciones.js
    modales.js
    busqueda-global.js
    textos-ui.js
  /funciones
    selecciones.js
    jugadores.js
    paises.js
    clubes.js
    confederaciones.js
    rankings.js
    estadios.js
    evento.js
    calendario.js
    patrocinadores.js
    medios.js
    editor.js
  /uniformes
    motor-grafico.js
    modelo-kits.js
    ui-kits.js
  init.js
```

---

## Catálogo de módulos (estructura final)

### DATOS (capa de datos puros)

#### `datos/constantes.js`
- **Responsabilidad:** alojar todos los datos literales inmutables del proyecto (sin lógica): texturas y fotos base64, tablas oficiales del torneo, tablas de rankings, códigos, paletas y catálogos semilla literales, y los textos por defecto de la interfaz.
- **Funciones:** ninguna (solo constantes).
- **Variables que utiliza:** solo referencias internas entre sus propias constantes (p. ej. las `*_BASE_SEED` referencian sus texturas base64 vecinas).
- **Exporta/comparte:** `KIT_TEXTURE_DEFAULT`, `KIT_TEXTURE_BACK_DEFAULT`, `KIT_GK_TEXTURE_DEFAULT`, `KIT_GK_TEXTURE_BACK_DEFAULT`, `SHORTS_TEXTURE_DEFAULT`, `SOCKS_TEXTURE_DEFAULT`, `PLAYER_PHOTO_DEFAULT`; `KIT_BASE_SEED`, `SHORTS_BASE_SEED`, `SOCKS_BASE_SEED`, `NUMBER_FONT_SEED`, `BACK_BASE_SEED`, `BACK_TEXT_BOXES`, `BACK_SQUARE_TEXT_BOXES`, `GARMENT_TYPES`, `KIT_ORDINAL_LABELS`; `COUNTRIES_SEED`, `CLUB_SEED_DATA`, `STADIUMS_SEED`; `FIFA_RANKING_BY_CODE`, `ELO_RATING`, `ELO_NAME_ALIASES`, `FIFA_CODES`, `OFFICIAL_NAMES`, `FEDERATION_NAMES`, `FEDERATION_ABBR`, `NICKNAMES`, `PALETTES`, `CUSTOM_COLORS`, `CONFS`, `CONF_COLORS`, `CONF_LIST`, `CONF_INFO_DEFAULTS`, `FIFA_INFO_DEFAULT`; `WC26_THIRD_COLS`, `WC26_THIRD_TABLE`, `WC26_GROUPS`, `WC26_SCHEDULE_GROUPSTAGE`, `WC26_SCHEDULE_KNOCKOUT`; `APPAREL_BRANDS`, `SPONSOR_CATEGORIES`, `KIT_SPONSORS`, `APPAREL_CATEGORY`; `MONTH_NAMES`, `VALID_POS`, `POS_ORDER`, `NUMBER_START_BY_POS`, `GROUP_LABELS`, `UI_TEXT_DEFAULTS`, `TABS`, `RANKING_SECTION_IDS`, `VERTICAL_REF_SAMPLE`, `GARMENT_CANVAS_SIZE`, `GARMENT_DISPLAY_PREFIX`, `RECOLORABLE_BASE_MAX_DIM`, `SQUAD_COMPLETE_SIZE`.
- **Depende de:** **nada.**
- **Depende de él:** prácticamente todos los módulos de funciones y de uniformes, más `modelo-db` y `textos-ui`.
- **Riesgo:** Muy bajo. · **Dificultad:** Trivial.

#### `datos/semillas-equipos.js`
- **Responsabilidad:** la semilla de selecciones (`SEED_TEAMS`), separada porque construye jugadores mediante el helper `P`.
- **Funciones:** ninguna propia (solo la constante).
- **Variables que utiliza:** el constructor `P` (de `funciones/jugadores.js`).
- **Exporta/comparte:** `SEED_TEAMS`.
- **Depende de:** `funciones/jugadores.js` (por `P`). *(Alternativa: alojar `SEED_TEAMS` dentro de `jugadores.js`/`selecciones.js` para evitar esta dependencia cruzada; ver "Notas".)*
- **Depende de él:** `nucleo/modelo-db.js`.
- **Riesgo:** Muy bajo. · **Dificultad:** Baja.

### CORE

#### `core/utilidades.js`
- **Responsabilidad:** funciones transversales sin estado (formato, color, cadenas, IDs, ordenación).
- **Funciones:** `escapeHtml`, `normLoose`, `normalizeName`, `hexToRgb`, `shiftColor`, `stripDiacritics`, `uid`, `newId`, `newClubId`, `colorsFor`, `initials`, `isoDate`, `compareGeneric`, `sortTh`, `toggleSort`, `numInRange`, `isRegistered`, `avgRating`.
- **Variables que utiliza:** `PALETTES`, `CUSTOM_COLORS` (de `constantes`); contadores mutables `_seedCounter`, `_newIdCounter`.
- **Exporta/comparte:** todas las funciones anteriores + los contadores de IDs.
- **Depende de:** `datos/constantes.js`.
- **Depende de él:** casi todos.
- **Riesgo:** Muy bajo. · **Dificultad:** Baja. *(El único punto de atención son los contadores de IDs, que son estado global mutable; deben tener un único dueño.)*

### APP (núcleo de interfaz)

#### `app/textos-ui.js`
- **Responsabilidad:** resolver etiquetas de interfaz con *fallback* y agruparlas para el editor.
- **Funciones:** `T`, `groupedTextKeys`, `tabLabel`, `tabDescription`, `tabDescHTML`.
- **Variables que utiliza:** `UI_TEXT_DEFAULTS`, `GROUP_LABELS`, `TABS` (de `constantes`); `DB.strings`.
- **Exporta/comparte:** `T`, `groupedTextKeys`, `tabLabel`, `tabDescription`, `tabDescHTML`.
- **Depende de:** `datos/constantes.js`, y lee de `DB` (modelo).
- **Depende de él:** todos los renderizadores/modales que muestran etiquetas; el `editor`.
- **Riesgo:** Bajo. · **Dificultad:** Baja.

#### `app/modales.js`
- **Responsabilidad:** infraestructura genérica de UI: abrir/cerrar modales, confirmaciones, avisos (toast) y campos de subida de imagen/fuente.
- **Funciones:** `openModal`, `closeModal`, `modalConfirm`, `showToast`, `imageUploadField`, `fontUploadField`, `detailNavHTML`.
- **Variables que utiliza:** DOM (`#modal-root`, `#toast`); `resizeImageToDataURL`/`readFileAsDataURL` (del motor de uniformes) para las subidas.
- **Exporta/comparte:** `openModal`, `closeModal`, `modalConfirm`, `showToast`, `imageUploadField`, `fontUploadField`, `detailNavHTML`.
- **Depende de:** `uniformes/motor-grafico.js` (utilidades de imagen), `core/utilidades.js`.
- **Depende de él:** todos los módulos que abren modales o muestran toasts (casi todas las funciones).
- **Riesgo:** Medio. · **Dificultad:** Media.

#### `app/busqueda-global.js`
- **Responsabilidad:** el buscador de la barra superior.
- **Funciones:** `buildGlobalSearch`, `runGlobalSearch`, `gsItemHTML`, `closeGlobalSearch`.
- **Variables que utiliza:** `DB.teams` y sus jugadores; `escapeHtml`; navegación.
- **Exporta/comparte:** `buildGlobalSearch`, `runGlobalSearch`, `closeGlobalSearch`.
- **Depende de:** `core/utilidades.js`, `app/router.js` (navegación), lee de `DB`.
- **Depende de él:** `init.js`.
- **Riesgo:** Bajo. · **Dificultad:** Media.

#### `app/router.js`
- **Responsabilidad:** decidir qué vista mostrar, mantener el estado global de UI y el historial de navegación con scroll.
- **Funciones:** `render`, `renderTabs`, `renderNavButtons`, `navigateTo`, `navigateToClub`, `navigateToTeam`, `navigateToPlayer`, `replaceCurrentClub`, `replaceCurrentTeam`, `replaceCurrentPlayer`, `pushHistory`, `navBack`, `navForward`, `resetNavHistory`, `currentScrollY`, `saveScrollToCurrent`, `scrollToTop`, `restoreScroll`.
- **Variables que utiliza:** `activeTab`, `activeTeamId`, `activePlayerId`, `activeClubId`, `navHistory`, `navIndex`, `MAX_NAV_HISTORY`, `TABS`; y **todos** los `render*` de las funciones.
- **Exporta/comparte:** `render`, funciones `navigate*`/`replace*`, `navBack`, `navForward`, `resetNavHistory`, y el estado activo de UI.
- **Depende de:** **todos** los módulos de funciones/uniformes (invoca sus renderizadores) y de `app/acciones.js` (`attachHandlers`).
- **Depende de él:** casi todos (llaman a `render()`/`navigate*`).
- **Riesgo:** Muy alto. · **Dificultad:** Alta.

#### `app/acciones.js`
- **Responsabilidad:** traducir clics (`data-action`) en operaciones sobre `DB` y navegación; enganchar listeners.
- **Funciones:** `attachHandlers`, `handleAction` (~152 casos), y helpers de formulario compartidos por acciones (`checkNumberTaken`, `parseFavNumbers`).
- **Variables que utiliza:** `DB`, estado de UI del router, y funciones de **todos** los módulos de dominio (sus `save*`, modales, etc.).
- **Exporta/comparte:** `attachHandlers`, `handleAction`.
- **Depende de:** **todos** los módulos (router, modales, persistencia, historial y cada función de dominio).
- **Depende de él:** `app/router.js` (lo llama tras cada render) e `init` indirectamente.
- **Riesgo:** Muy alto. · **Dificultad:** Muy alta.

### FUNCIONES (dominios)

> Cada módulo de dominio incluye sus `buildDefault*`, renderizadores, modales `modalAddEdit*`/`save*`, tarjetas HTML y helpers propios. Solo se listan piezas representativas.

#### `funciones/medios.js`
- **Responsabilidad:** catálogo de medios (TV/radio/streaming).
- **Funciones:** `renderMedios`, `modalAddEditMedia`.
- **Variables que utiliza:** `DB.media`.
- **Exporta/comparte:** `renderMedios`, `modalAddEditMedia`, (constructor por defecto de medios si se separa de `modelo-db`).
- **Depende de:** `app/modales.js`, `app/router.js`, `core/utilidades.js`.
- **Depende de él:** `router`, `acciones`.
- **Riesgo:** Bajo. · **Dificultad:** Baja.

#### `funciones/rankings.js`
- **Responsabilidad:** cálculo y vista de rankings FIFA y Elo (mundial y por confederación).
- **Funciones:** `renderRankings`, `fifaRankingFor`, `applyFifaRankingToTeams`, `eloForTeamName`, `applyEloRatingToTeams`, `computeEloRanks`, `computeFifaRanks`, `rankingValue`, `rankingType`, `rankingDefaultDir`.
- **Variables que utiliza:** `FIFA_RANKING_BY_CODE`, `ELO_RATING`, `ELO_NAME_ALIASES`, `RANKING_SECTION_IDS` (de `constantes`); `rankingSection`, `rankingSort`; `DB.teams`.
- **Exporta/comparte:** `renderRankings`, y los `apply*`/`compute*` (usados por selecciones y modelo-db).
- **Depende de:** `datos/constantes.js`, `core/utilidades.js`, `app/router.js`.
- **Depende de él:** `funciones/selecciones.js`, `nucleo/modelo-db.js`, `router`, `acciones`.
- **Riesgo:** Bajo. · **Dificultad:** Media.

#### `funciones/confederaciones.js`
- **Responsabilidad:** confederaciones y entidad FIFA; generación de badges/escudos.
- **Funciones:** `renderConfederaciones`, `modalEditConfederation`, `modalEditFifa`, `buildDefaultConfederations`, `buildDefaultFifa`, `confBadge`, `fifaBadge`, `orgCrestHTML`.
- **Variables que utiliza:** `CONF_LIST`, `CONF_COLORS`, `CONF_INFO_DEFAULTS`, `FIFA_INFO_DEFAULT` (de `constantes`); `confExpanded`; `DB.confederations`, `DB.fifa`, `DB.teams`.
- **Exporta/comparte:** `renderConfederaciones`, `confBadge`, `fifaBadge`, `orgCrestHTML`, `buildDefaultConfederations`, `buildDefaultFifa`.
- **Depende de:** `datos/constantes.js`, `app/modales.js`, `app/router.js`.
- **Depende de él:** `selecciones` (badges), `modelo-db`, `router`, `acciones`.
- **Riesgo:** Bajo. · **Dificultad:** Media.

#### `funciones/estadios.js`
- **Responsabilidad:** catálogo de estadios (Copa del Mundo y clubes), vistas y creación desde nombre.
- **Funciones:** `buildDefaultStadiums`, `renderEstadios`, `stadiumCardHTML`, `stadiumDisplayName`, `stadiumSubName`, `modalAddEditStadium`, `findStadiumByName`, `stadiumLinkName`, `ensureStadiumFromName`, `clubStadiumRowHTML`, `stadiumTeamRowHTML`.
- **Variables que utiliza:** `STADIUMS_SEED` (de `constantes`); `stadiumsView`; `DB.stadiums`.
- **Exporta/comparte:** `renderEstadios`, `buildDefaultStadiums`, `stadiumDisplayName`, `findStadiumByName`, `ensureStadiumFromName`, helpers de fila.
- **Depende de:** `datos/constantes.js`, `app/modales.js`, `app/router.js`, `core/utilidades.js`.
- **Depende de él:** `clubes`, `calendario` (sedes), `historial` (etiqueta de estadio), `modelo-db`, `router`, `acciones`.
- **Riesgo:** Bajo/Medio. · **Dificultad:** Media.

#### `funciones/patrocinadores.js`
- **Responsabilidad:** patrocinadores, categorías y marcas de indumentaria.
- **Funciones:** `renderPatrocinadores`, `modalAddEditSponsor`, `sponsorCategoriesOf`, `sponsorHasCategory`, `findSponsorByName`, `sponsorCategoryRowHTML`, `apparelBrandNames`, `ensureApparelBrandSponsor`, `addBrand`, `brandLogoHTML`, `addSponsorCategory`, `matchOrAddBrand`, `effectiveShirtName`.
- **Variables que utiliza:** `APPAREL_BRANDS`, `SPONSOR_CATEGORIES`, `KIT_SPONSORS`, `APPAREL_CATEGORY` (de `constantes`); `DB.sponsors`, `DB.brands`, `DB.sponsorCategories`.
- **Exporta/comparte:** `renderPatrocinadores`, `brandLogoHTML`, `apparelBrandNames`, `ensureApparelBrandSponsor`, `matchOrAddBrand`, `effectiveShirtName`, `findSponsorByName`.
- **Depende de:** `datos/constantes.js`, `app/modales.js`, `app/router.js`, `core/utilidades.js`.
- **Depende de él:** `jugadores` y `uniformes` (marca/indumentaria), `modelo-db`, `router`, `acciones`.
- **Riesgo:** Medio. · **Dificultad:** Media.

#### `funciones/paises.js`
- **Responsabilidad:** catálogo maestro de países/entidades; nacionalidades y vínculo país↔selección.
- **Funciones:** `buildDefaultCountries`, `relinkCountriesToTeams`, `buildMinimalTeamFromCountry`, `integrateTeamsFromCountries`, `findOrCreateCountryByName`, `countryNameById`, `findCountryByName`, `refreshDeclaredForOptions`, `playerCountryName`, `sortedCountries`, `modalAddEditCountry`, `countryRowHTML`, `nationalityRowHTML`.
- **Variables que utiliza:** `COUNTRIES_SEED`, `FIFA_CODES`, `FEDERATION_*`, `OFFICIAL_NAMES`, `NICKNAMES` (de `constantes`); `DB.countries`, `DB.teams`.
- **Exporta/comparte:** los `find*`/`countryNameById`/`sortedCountries`/`playerCountryName`, `integrateTeamsFromCountries`, `buildDefaultCountries`, `modalAddEditCountry`, helpers de fila.
- **Depende de:** `datos/constantes.js`, `core/utilidades.js` (`normLoose`), `app/modales.js`.
- **Depende de él:** `selecciones`, `jugadores`, `editor`, `modelo-db`, `historial`.
- **Riesgo:** Medio. · **Dificultad:** Media/Alta.

#### `funciones/clubes.js`
- **Responsabilidad:** modelo de clubes (con múltiples estadios) y ligas; vistas y edición.
- **Funciones:** `renderClubes`, `renderClubDetail`, `clubCardHTML`, `clubCrestHTML`, `leagueBadge`, `modalAddEditClub`, `getClubByName`, `ensureClubObject`, `clubKey`, `ensureLeague`, `matchOrAddLeague`, `matchOrAddClub`, `clubPlayers`, `clubRatings`, `clubDisplayName`, `addClub`, `newClubId`, `orderedClubs`, `buildDefaultClubsData`, `buildDefaultLeagues`.
- **Variables que utiliza:** `CLUB_SEED_DATA` (de `constantes`); `clubsSort`, `clubFilter`; `DB.clubsData`, `DB.leagues`, `DB.clubs`.
- **Exporta/comparte:** `getClubByName`, `ensureClubObject`, `ensureLeague`, `matchOrAddClub`, `clubPlayers`, `clubDisplayName`, `renderClubes`, `renderClubDetail`, `buildDefaultClubsData`, `buildDefaultLeagues`.
- **Depende de:** `datos/constantes.js`, `core/utilidades.js` (`normLoose`), `funciones/estadios.js`, `funciones/patrocinadores.js`, `app/modales.js`, `app/router.js`.
- **Depende de él:** `jugadores`, `modelo-db`, `migracion`, `historial`, `router`, `acciones`.
- **Riesgo:** Medio. · **Dificultad:** Alta.

#### `funciones/jugadores.js`
- **Responsabilidad:** jugadores: listado filtrable, detalle, edición, importación masiva, nombres/edades/dorsales.
- **Funciones:** `renderJugadores`, `renderPlayerDetail`, `getPlayerWithTeam`, `modalAddEditPlayer`, `parseBulkPlayers`, `P`, `playerDisplayName`, `playerDisplayNameHTML`, `splitFullName`, `computeDefaultFullName`, `computeDefaultShirtNameValue`, `computeAge`, `playerAge`, `playerAgeText`, `parseBirthDate`, `nextAvailableNumber`, `assignSquadNumbers`, `suggestNumber`, `playerValue`, `playerSortName`, `playerLastNameKey`, `playerBirthSortKey`.
- **Variables que utiliza:** `POS_ORDER`, `VALID_POS`, `NUMBER_START_BY_POS`, `MONTH_NAMES` (de `constantes`); `playerFilter`, `playerSort`, `bulkImportTeamId`; `DB.teams[].players`.
- **Exporta/comparte:** `P`, `playerDisplayName*`, `assignSquadNumbers`, `computeAge`/`playerAge*`, `getPlayerWithTeam`, `renderJugadores`, `renderPlayerDetail`, `modalAddEditPlayer`.
- **Depende de:** `datos/constantes.js`, `core/utilidades.js`, `funciones/paises.js`, `funciones/clubes.js`, `funciones/patrocinadores.js`, `uniformes/*` (preview de nombre/dorsal), `app/modales.js`, `app/router.js`.
- **Depende de él:** `selecciones`, `busqueda-global`, `datos/semillas-equipos.js` (por `P`), `modelo-db`, `router`, `acciones`.
- **Riesgo:** Alto. · **Dificultad:** Alta.

#### `funciones/selecciones.js`
- **Responsabilidad:** selecciones nacionales: listado, detalle, edición, métricas y grupos.
- **Funciones:** `renderSelecciones`, `renderTeamDetail`, `teamCardHTML`, `crestHTML`, `modalAddEditTeam`, `teamRatings`, `teamRating`, `ratingBlockHTML`, `squadStatus`, `orderedTeamsForSelecciones`, `orderedTeamPlayers`, `groupsList`, `teamsInGroup`, `groupSlotIndex`, `teamsInGroupOrdered`, `squadSortChip`.
- **Variables que utiliza:** `seleccionesSort`, `squadSort`, `SQUAD_COMPLETE_SIZE`; `DB.teams`.
- **Exporta/comparte:** `teamRating(s)`, `crestHTML`, `renderSelecciones`, `renderTeamDetail`, `groupsList`, `teamsInGroup*`, `orderedTeamPlayers`. *(`getTeam` reasignado a `modelo-db` — ver Decisiones arquitectónicas.)*
- **Depende de:** `funciones/paises.js`, `funciones/confederaciones.js`, `funciones/rankings.js`, `uniformes/*` (kits), `app/modales.js`, `app/router.js`, `core/utilidades.js`.
- **Depende de él:** `jugadores`, `evento`, `calendario`, `busqueda-global`, `modelo-db`, `router`, `acciones`.
- **Riesgo:** Alto. · **Dificultad:** Alta.

#### `funciones/evento.js`
- **Responsabilidad:** modelo editable del torneo (formato, llaves, desempates, mejores terceros, premios) y sus vistas/editores.
- **Funciones:** `buildDefaultEvent`, `renderEvento`, `renderEventoDetail`, `modalEditEventGeneral`/`saveEventGeneral`, `modalEditEventBracket`/`saveEventBracket`/`readEventBracketDraftFromDOM`, `modalEditEventTiebreakers`/`saveEventTiebreakers`, `eventGroupLetters`, `eventGroupStageMatches`, `eventKnockoutMatches`, `eventThirdSlots`, `solveThirdPairings`, `loadOfficialCalendarConfirm`, `doLoadOfficialCalendar`, `findTeamByNameLoose`, `eventCrestHTML`, `eventFmtDate`, `eventHostRowHTML`.
- **Variables que utiliza:** `WC26_THIRD_COLS`, `WC26_THIRD_TABLE`, `WC26_GROUPS`, `WC26_SCHEDULE_GROUPSTAGE`, `WC26_SCHEDULE_KNOCKOUT` (de `constantes`); `eventoDetailOpen`, `eventBracketDraft`; `DB.event`, `DB.teams`.
- **Exporta/comparte:** `renderEvento`, `buildDefaultEvent`, `eventGroupStageMatches`, `eventKnockoutMatches`, `eventThirdSlots`, `solveThirdPairings`.
- **Depende de:** `datos/constantes.js`, `funciones/selecciones.js`, `funciones/calendario.js` (carga oficial), `app/modales.js`, `app/router.js`, `core/utilidades.js`.
- **Depende de él:** `calendario`, `modelo-db`, `migracion`, `router`, `acciones`.
- **Riesgo:** Medio. · **Dificultad:** Alta.

#### `funciones/calendario.js`
- **Responsabilidad:** fixtures, tablas de grupo y simulación de partidos. (La simulación —`poisson`/`rollDice`— es un sub-bloque de lógica pura, aislable internamente.)
- **Funciones:** `renderCalendario`, `generateAllFixtures`, `roundRobin`, `clearAllFixtures`, `standingsFor`, `openSimModal`, `rollDice`, `poisson`, `fmtFixtureDate`, `knockoutRoundName`, `fixtureSortKey`, `venueLinkHTML`, `teamLinkHTML`.
- **Variables que utiliza:** `DB.fixtures`, `DB.teams`, formato de `DB.event`.
- **Exporta/comparte:** `renderCalendario`, `generateAllFixtures`, `standingsFor`, `poisson`, `openSimModal`.
- **Depende de:** `funciones/selecciones.js`, `funciones/evento.js`, `funciones/estadios.js`, `app/modales.js`, `app/router.js`, `core/utilidades.js`.
- **Depende de él:** `evento` (carga oficial), `router`, `acciones`.
- **Riesgo:** Medio. · **Dificultad:** Alta.

#### `funciones/editor.js`
- **Responsabilidad:** panel de administración: edición de textos de interfaz, catálogo de países e import/export JSON de la base.
- **Funciones:** `renderEditor` (la vista). *(Los listeners `ui-text`/`country` de `attachHandlers` y los casos `import-json`/`clear-history`/`delete-history-entry` de `handleAction` se reservan al núcleo — ver Decisiones arquitectónicas.)*
- **Variables que utiliza:** `DB.strings`, catálogo de países, historial.
- **Exporta/comparte:** `renderEditor`.
- **Depende de:** `app/textos-ui.js`, `funciones/paises.js`, `persistencia/historial.js`, `persistencia/almacenamiento.js`, `nucleo/migracion.js`, `app/modales.js`, `app/router.js`.
- **Depende de él:** `router`, `acciones`.
- **Riesgo:** Medio. · **Dificultad:** Alta (es un agregador).

### UNIFORMES

#### `uniformes/motor-grafico.js`
- **Responsabilidad:** motor de bajo nivel: recoloreo de imágenes por canvas y dibujo de texto (recto y curvo) con métricas. No conoce `DB`.
- **Funciones:** `recolorToCanvas`, `_nativeRecolorCacheKey`, `loadImg`, `readFileAsDataURL`, `resizeImageToDataURL`, `drawCurvedText`, `drawTextWithStyle`, `fitTextMetrics`, `applyTextCase`, `arcRadiusFor`, `badgeTextVerticalInk`, `badgeGroupTransform`, `clampInkToBounds`, `verticalRefMetrics`, `normalizeForVerticalMetrics`, `enableFontKerning`.
- **Variables que utiliza:** `hexToRgb`, `stripDiacritics` (utilidades); `VERTICAL_REF_SAMPLE`, `GARMENT_CANVAS_SIZE`, `RECOLORABLE_BASE_MAX_DIM` (constantes); caché interna `_nativeRecolorCache`.
- **Exporta/comparte:** `recolorToCanvas`, `drawCurvedText`, `drawTextWithStyle`, `fitTextMetrics`, `resizeImageToDataURL`, `readFileAsDataURL`, `loadImg`.
- **Depende de:** `core/utilidades.js`, `datos/constantes.js`.
- **Depende de él:** `uniformes/ui-kits.js`, `app/modales.js` (subidas), indirectamente jugadores/selecciones.
- **Riesgo:** Bajo. · **Dificultad:** Media.

#### `uniformes/modelo-kits.js`
- **Responsabilidad:** modelo de prendas, tipografías de dorsal y "back bases"; constructores por defecto de bases/fuentes.
- **Funciones:** `garmentConfig`, `buildDefaultKitBases`, `buildDefaultShortsBases`, `buildDefaultSocksBases`, `buildDefaultNumberFonts`, `buildDefaultBackBases`, `numberFontLabel`, `numberFontFamily`, `ensureNumberFontLoaded`, `getNumberFont`, `backBaseDisplayLabel`, `getBackBaseForShirtNumber`, `padKitNumber`, `garmentName`, `fontDataUrlExtension`.
- **Variables que utiliza:** seeds y `GARMENT_TYPES`/`BACK_TEXT_BOXES`/etc. (constantes); `_loadedNumberFontFamilies`; `DB[cfg.basesKey]`.
- **Exporta/comparte:** `garmentConfig`, todos los `buildDefault*` de kits, `getNumberFont`, `numberFontFamily`, `ensureNumberFontLoaded`, `getBackBaseForShirtNumber`.
- **Depende de:** `datos/constantes.js`, `core/utilidades.js`, lee de `DB`.
- **Depende de él:** `uniformes/ui-kits.js`, `nucleo/modelo-db.js`, `migracion`.
- **Riesgo:** Medio. · **Dificultad:** Media.

#### `uniformes/ui-kits.js`
- **Responsabilidad:** toda la interfaz de uniformes: composición de kits, previews, secciones, tarjetas, modales de edición y estado de UI propio (portapapeles, expandidos, drag).
- **Funciones:** `ensureTeamKits`, `shirtBackImgFor`, `shirtFrontImgFor`, `shirtBackImgForCategory`, `kitOrdinalLabel`, `autoKitLabel`, `renderKitPreviews`, `renderGarmentPreviews`, `renderNumberFontPreviews`, `renderPlayerBadgePreviews`, `renderGarmentSection`, `renderNumberFontsSection`, `renderBackBasesSection`, `kitCardHTML`, `garmentBaseCardHTML`, `garmentTemplateCardHTML`, `numberFontCardHTML`, `backBaseCardHTML`, `modalManageKits`, `modalAddEditKit`, y todos los lectores/sincronizadores de formulario (`readLayerRows`, `read/writeBackNumberFields`, `read/writeBackNameFields`, `readBadge*Fields`, `syncBadge*`, `unlinkBadge`, `updateBadgeStatusBadge`, `syncBackNameIfLinked`, `unlinkBackName`, `readComboFromBlock`, `refreshAllComboPreviews`, `renumberComboBlocks`, `defaultCombo`, `cloneCombo`, `comboBlockHTML`, `garmentSectionHTML`, `colorPickerHTML`, `layerRowHTML`, `syncColorHexText`, `outlineThumb`, `nicknameRowHTML` si aplica).
- **Variables que utiliza:** `KIT_ORDINAL_LABELS`, `GARMENT_DISPLAY_PREFIX` (constantes); estado de UI: `garmentExpanded`, `garmentsParentExpanded`, `numberFontsExpanded`, `backBasesExpanded`, `clipboardKit`, `clipboardCombo`, `clipboardNumberStyle`, `clipboardNameStyle`, `clipboardBothStyle`, `dragKitInfo`, `draggedComboBlock`; `DB` (bases, texturas, fuentes).
- **Exporta/comparte:** `renderKitPreviews`, `ensureTeamKits`, `modalManageKits`, `modalAddEditKit`, secciones de render para el editor.
- **Depende de:** `uniformes/motor-grafico.js`, `uniformes/modelo-kits.js`, `funciones/patrocinadores.js`, `app/modales.js`, `app/router.js`, `core/utilidades.js`, `datos/constantes.js`.
- **Depende de él:** `selecciones`, `jugadores`, `editor`, `router`, `acciones`.
- **Riesgo:** Alto. · **Dificultad:** Muy alta.

### NÚCLEO (modelo + migración)

#### `nucleo/modelo-db.js`
- **Responsabilidad:** definir la forma de `DB` y orquestar su construcción por defecto invocando los `buildDefault*` de cada módulo.
- **Funciones:** `buildDefaultDB`, `getTeam` (accesor de entidad por id sobre `DB.teams`/`DB.clubsData`; reasignado desde `selecciones` — ver Decisiones arquitectónicas).
- **Variables que utiliza:** `DB` (variable global central); `_seedCounter`; y todos los `buildDefault*` + `SEED_TEAMS`.
- **Exporta/comparte:** `DB`, `buildDefaultDB`.
- **Depende de:** `datos/*`, `core/utilidades.js`, y **todos** los módulos de dominio/uniformes (por sus constructores).
- **Depende de él:** **todos** (leen/escriben `DB`).
- **Riesgo:** Alto. · **Dificultad:** Alta.

#### `nucleo/migracion.js`
- **Responsabilidad:** compatibilidad de esquema al cargar bases antiguas; reparaciones.
- **Funciones:** `migrateDB`, `repairDuplicateTeamIds`, `dedupeDuplicateTeams`.
- **Variables que utiliza:** `DB`, y los `buildDefault*`/`ensure*` de varios dominios.
- **Exporta/comparte:** `migrateDB`.
- **Depende de:** `nucleo/modelo-db.js` y casi todos los dominios (clubes, evento, uniformes, países…).
- **Depende de él:** `persistencia/almacenamiento.js`, `funciones/editor.js`.
- **Riesgo:** Alto. · **Dificultad:** Alta.

### PERSISTENCIA

#### `persistencia/almacenamiento.js`
- **Responsabilidad:** cargar y guardar `DB` en `window.storage`.
- **Funciones:** `loadDB`, `persist`.
- **Variables que utiliza:** `STORAGE_KEY`, `DB`, `PREV_DB_JSON`, `saveTimer`; `migrateDB`; `recordHistory`; `showToast`.
- **Exporta/comparte:** `loadDB`, `persist`, `STORAGE_KEY`.
- **Depende de:** `nucleo/modelo-db.js`, `nucleo/migracion.js`, `persistencia/historial.js`, `app/modales.js`.
- **Depende de él:** `init`, `acciones`, `editor`.
- **Riesgo:** Alto. · **Dificultad:** Media.

#### `persistencia/historial.js`
- **Responsabilidad:** historial de cambios (undo) con *diff* por entidad y reversión.
- **Funciones:** `recordHistory`, `computeDBDiff`, `diffTeamPlayers`, `saveHistory`, `loadHistory`, `applyReverseOps`, `deleteHistoryFrom`, `histTopKeyLabel`.
- **Variables que utiliza:** `HISTORY`, `PREV_DB_JSON`, `HIST_COLLS`, `HISTORY_KEY`, `HISTORY_MAX`, `HISTORY_MAX_BYTES`; `DB`; `window.storage`; etiquetas (`stadiumDisplayName`, etc.).
- **Exporta/comparte:** `recordHistory`, `loadHistory`, `deleteHistoryFrom`, `saveHistory`, `HISTORY`.
- **Depende de:** `nucleo/modelo-db.js`, y de las etiquetas de `estadios`/`paises`/`clubes`/`selecciones` que usa `HIST_COLLS`.
- **Depende de él:** `persistencia/almacenamiento.js`, `funciones/editor.js`, `init`.
- **Riesgo:** Alto. · **Dificultad:** Alta.

### ARRANQUE

#### `init.js`
- **Responsabilidad:** secuencia de arranque.
- **Funciones:** la IIFE `init()`.
- **Variables que utiliza:** `APP_VERSION`.
- **Exporta/comparte:** nada.
- **Depende de:** `persistencia/almacenamiento.js`, `persistencia/historial.js`, `app/router.js`, `app/busqueda-global.js`.
- **Depende de él:** nadie.
- **Riesgo:** Bajo. · **Dificultad:** Baja (pero es el último paso lógico: solo tiene sentido cuando el resto existe).

---

## Orden de extracción — del más sencillo al más complejo

1. `datos/constantes.js` — Muy bajo / Trivial. **✓ Extraído.**
2. `core/utilidades.js` — Muy bajo / Baja. **✓ Extraído.**
3. `datos/semillas-equipos.js` — Muy bajo / Baja (una vez exista `P`). **⏸ Pospuesto** (depende de `P`, aún en el inline; ver "Estado de ejecución").
4. `app/textos-ui.js` — Bajo / Baja. **✓ Extraído (ejecutado antes del paso 3).**
5. `funciones/medios.js` — Bajo / Baja. **✓ Extraído.**
6. `funciones/rankings.js` — Bajo / Media. **✓ Extraído** (estado `rankingSection`/`rankingSort` permanece en el inline).
7. `uniformes/motor-grafico.js` — Bajo / Media. **✓ Extraído** (módulo único; `drawBackNumberOnCanvas` intercalada permanece en el inline).
8. `funciones/confederaciones.js` — Bajo / Media. **✓ Extraído** (módulo único; `confExpanded` permanece en el inline).
9. `funciones/estadios.js` — Bajo-Medio / Media. **✓ Extraído** (5 clústeres; `stadiumsView` permanece en el inline).
10. `uniformes/modelo-kits.js` — Medio / Media. **✓ Extraído** (3 clústeres; caché `_loadedNumberFontFamilies` incluida; sin dependencia de motor-grafico).
11. `app/busqueda-global.js` — Bajo / Media. **✓ Extraído** (autocontenido; engancha sus propios listeners).
12. `funciones/patrocinadores.js` — Medio / Media. **✓ Extraído** (4 clústeres; brandLogoHTML compartido con medios en render).
13. `app/modales.js` — Medio / Media. **✓ Extraído** (DOM puro; colorPickerHTML permanece en el inline; ref. mutua con ui-kits).
14. `funciones/paises.js` — Medio / Media-Alta. **✓ Extraído** (4 clústeres; puente país↔selección con literal propio, sin ciclo; langRowHTML queda en inline).
15. `funciones/clubes.js` — Medio / Alta. **✓ Extraído** (5 zonas; sin ciclo; newClubId queda en utilidades; no depende de patrocinadores).
16. `funciones/evento.js` — Medio / Alta. **✓ Extraído** (3 zonas; NO depende de calendario/selecciones; relación unidireccional calendario→evento; sin ciclo).
17. `funciones/calendario.js` — Medio / Alta. **✓ Extraído** (2 clústeres; NO depende de evento; simulación aislable; sin ciclo).
18. `funciones/jugadores.js` — Alto / Alta. **✓ Extraído** (7 zonas; +4 helpers; P desbloquea paso 3; sin ciclo con selecciones; fidelidad byte a byte).
19. `funciones/selecciones.js` — Alto / Alta. **✓ Extraído** (5 zonas; getTeam reservado a modelo-db; sin ciclo con jugadores; fidelidad byte a byte).
20. `funciones/editor.js` — Medio / Alta. **✓ Extraído** (solo renderEditor; fragmentos de handleAction/attachHandlers reservados al núcleo).
21. `uniformes/ui-kits.js` — Alto / Muy alta. **✓ Extraído** (45 fns; 5 fns de datos corregidas a modelo-kits; listeners y casos kit reservados al núcleo; fidelidad byte a byte).
22. `nucleo/modelo-db.js` — Alto / Alta. **✓ Extraído** (DB + buildDefaultDB + getTeam; SEED_TEAMS y _seedCounter permanecen; validación runtime OK).
23. `nucleo/migracion.js` — Alto / Alta. **✓ Extraído** (migrateDB + repair/dedupe; migración pura, sin carga/persistencia; validación runtime OK).
24. `persistencia/almacenamiento.js` — Alto / Media. **✓ Extraído** (loadDB/persist + STORAGE_KEY/saveTimer; backend window.storage intacto; validación runtime OK).
25. `persistencia/historial.js` — Alto / Alta. **✓ Extraído** (8 fns undo + diff; PREV_DB_JSON compartido call-time con almacenamiento; casos undo en handleAction; validación runtime OK).
26. `app/router.js` — Muy alto / Alta. **✓ Extraído** (render/navigate + estado nav; renderInicio y estado de dominio NO absorbidos; handleAction/attachHandlers byte-idénticos; validación runtime OK).
27. `app/acciones.js` — Muy alto / Muy alta. **✓ Extraído** (handleAction, 152 casos intactos; attachHandlers reservado a init; helpers de formulario compartidos se quedan; validación runtime OK).
28. `init.js` — Bajo / Baja. **✓ Extraído** (init + attachHandlers + dispatch global; carga tras el inline; arranque end-to-end validado). **← CIERRE DEL PLAN**

> Nota sobre el orden: `modelo-db`, `almacenamiento`, `migracion` e `historial` aparecen tarde no por dificultad intrínseca de cada uno, sino porque dependen de que el modelo de `DB` ya esté estabilizado. `router` y `acciones` van al final por ser el pegamento de toda la UI.

---

## Módulo elegido para extraer primero

## → `datos/constantes.js`

**Por qué este y no otro**, contrastado con las tres condiciones pedidas:

1. **Menor número de dependencias.** Es el único módulo con **cero dependencias**: no importa nada de ningún otro archivo. Son literales (cadenas base64, objetos y arreglos constantes) que no invocan funciones. Cualquier otro candidato "fácil" (`utilidades`, `textos-ui`) ya depende de algo (`constantes`, o lee de `DB`).

2. **Menor riesgo.** Es datos inertes: no hay comportamiento que pueda cambiar al moverlos, y la extracción se puede **verificar por igualdad exacta** (el valor antes y después debe ser idéntico). Frente a `utilidades`, que aunque es de bajo riesgo contiene *funciones* con posible comportamiento sutil, `constantes` no tiene ninguna lógica que romper. Es el riesgo más bajo posible de todo el proyecto.

3. **Mayor beneficio al extraerlo.** Aquí gana con claridad: estas constantes concentran **la enorme mayoría del volumen del archivo** —las texturas y la foto por defecto en base64, la tabla oficial de 495 cruces de mejores terceros (`WC26_THIRD_TABLE`), las tablas completas de ranking FIFA y Elo, los calendarios `WC26_*` y los catálogos semilla—. Sacarlas de en medio, en un solo movimiento sin riesgo, **reduce drásticamente el ruido** del archivo principal y deja el resto del código legible y navegable. Además es un **prerrequisito natural**: casi todos los módulos de funciones y de uniformes van a importar de aquí, así que extraerlo primero desbloquea y simplifica todas las extracciones siguientes.

En resumen: es el único módulo que puntúa óptimo en las tres condiciones a la vez —dependencias nulas, riesgo mínimo verificable y beneficio máximo inmediato—, y sienta la base sobre la que se apoyará todo el plan.

*(Segundo lugar: `core/utilidades.js`. Comparte el "cero dependencias hacia otros módulos de lógica" —solo usa `constantes`— y es de riesgo muy bajo, pero al contener funciones su riesgo no es literalmente nulo y su beneficio es más arquitectónico que de reducción de volumen. Por eso `constantes` va primero y `utilidades` inmediatamente después.)*

---

## Notas de diseño (decisiones a confirmar antes de ejecutar)

- **`SEED_TEAMS` y el helper `P`:** `SEED_TEAMS` construye jugadores con `P()`, lo que crea una dependencia de un archivo de datos hacia el modelo de jugadores. Alternativa más limpia: alojar `SEED_TEAMS` dentro de `funciones/selecciones.js` o `funciones/jugadores.js` en lugar de un archivo de datos aparte. Conviene decidirlo antes del paso 3.
- **Contadores de IDs (`_seedCounter`, `_newIdCounter`):** son estado global mutable. Deben tener **un único dueño** (propuesto: `core/utilidades.js`) y el resto consumirlos vía su API, para no duplicar generadores.
- **`buildDefault*` repartidos:** cada `buildDefaultX` se asigna a su módulo de dominio y `modelo-db.js` los orquesta. Esto invierte parte del acoplamiento actual (hoy `buildDefaultDB` lo sabe todo) y es lo que permite dejar `modelo-db` para más tarde sin bloquear a los dominios.
- **`handleAction` (~152 casos):** no se extrae "de golpe". La estrategia recomendada es **vaciarlo por dominios** a medida que cada módulo se aísla (cada módulo se lleva sus propios casos), de modo que al llegar al paso 27 quede casi vacío.
- **Doble enganche de eventos:** recordar que existen dos puntos de escucha de `data-action` (`#view` vía `attachHandlers` y un listener de `document` para `#modal-root`/`#nav-buttons`), ambos hacia `handleAction`. `app/acciones.js` debe conservar ambos caminos.
- **Uniones "por nombre":** varias relaciones se resuelven por `normLoose` (jugador↔club, club↔estadio, selección↔país) en vez de por id. Antes de separar cada dominio conviene documentar ese contrato implícito para no romperlo.
- **Estado de sesión vs. dato persistido en Uniformes:** `ui-kits.js` mezcla estado efímero (portapapeles, expandidos, drag) con datos de `DB` (bases, texturas, fuentes). Delimitar ambos antes de moverlo reduce su (alta) dificultad.

Cuando quieras seguimos con el siguiente paso.
