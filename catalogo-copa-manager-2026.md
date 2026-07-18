# Catálogo del proyecto — Copa Manager 2026 (VER 62)

> Documento de análisis. No propone cambios ni modifica el código; solo describe qué existe y cómo se conecta, como base para una futura modularización.

---

## Resumen general del proyecto

**Copa Manager 2026** es un simulador/editor de la Copa del Mundo 2026 implementado como una **aplicación de una sola página (SPA) contenida en un único archivo HTML** (`mundial2026-manager_62.html`, ~9.945 líneas). No usa frameworks: es JavaScript "vanilla" que renderiza vistas generando cadenas de HTML y volcándolas en `#view` mediante `innerHTML`.

Estructura física del archivo:

- **Líneas 1–8:** cabecera HTML, fuentes de Google.
- **Líneas 9–298:** CSS (`<style>`) — todo el estilo visual de la app.
- **Líneas 300–324:** cuerpo HTML estático: barra superior (marca, botones de navegación, buscador global, badge de versión), contenedor de pestañas `#tabs`, contenedor principal `#view`, raíz de modales `#modal-root` y `#toast`.
- **Líneas 325–9943:** un único bloque `<script>` con **todo el motor**: datos semilla, modelo, persistencia, historial, router, renderizadores de cada pestaña, modales de edición, motor gráfico de uniformes y el controlador de acciones.

Cifras de referencia (aproximadas): **~302 funciones de nivel superior**, un `switch` controlador con **~152 casos de acción**, y numerosas constantes semilla grandes (imágenes base64 de texturas de uniformes, tablas oficiales del torneo, rankings FIFA/Elo, catálogo de países).

Características funcionales visibles: gestión de selecciones, jugadores, países (catálogo maestro), clubes y ligas, confederaciones/FIFA, rankings (FIFA y Elo), estadios, patrocinadores y marcas, medios, un modelo editable del torneo ("El Evento") basado en el reglamento del Mundial 26, calendario/fixtures con simulación de partidos, un **editor de uniformes con recoloreo por canvas**, historial de cambios con reversión (undo), importación/exportación JSON y persistencia local vía `window.storage`.

**Estado del código:** el archivo funciona pero está fuertemente acoplado por variables globales compartidas (`DB`, estado de UI como `activeTab`, `activeTeamId`, etc.) y por una capa de renderizado que reconstruye HTML completo en cada acción. La modularización es posible pero requerirá aislar primero las zonas de datos puros antes que las de UI.

> **Actualización — estado de modularización.** El proyecto ya **no** es un único HTML: se han extraído **veintisiete módulos** (plan de 28 pasos COMPLETADO) como *scripts clásicos* (no ES Modules) que se cargan, en este orden, antes del `<script>` inline: `datos/constantes.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js`, `app/modales.js`, `funciones/paises.js`, `funciones/clubes.js`, `funciones/evento.js`, `funciones/calendario.js`, `funciones/jugadores.js`, `funciones/selecciones.js` `funciones/editor.js`, `uniformes/ui-kits.js` `nucleo/modelo-db.js`, `nucleo/migracion.js` `persistencia/almacenamiento.js` `persistencia/historial.js` `app/router.js` `app/acciones.js` y `app/init.js` (núcleo). **El plan de modularización de 28 pasos está completo**; `app/init.js` es el único que carga DESPUÉS del inline (init se autoinvoca). Notas de diseño: `getTeam` y el cableado de eventos de editor y uniformes (casos `kit-*` de `handleAction`, `addEventListener` globales) (casos de `handleAction`, listeners de `attachHandlers`) permanecen en el inline, reservados al núcleo.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js`, `app/modales.js`, `funciones/paises.js`, `funciones/clubes.js`, `funciones/evento.js`, `funciones/calendario.js` y `funciones/jugadores.js`.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js`, `app/modales.js`, `funciones/paises.js`, `funciones/clubes.js`, `funciones/evento.js` y `funciones/calendario.js`.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js`, `app/modales.js`, `funciones/paises.js`, `funciones/clubes.js` y `funciones/evento.js`.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js`, `app/modales.js`, `funciones/paises.js` y `funciones/clubes.js`.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js`, `app/modales.js` y `funciones/paises.js`.js`, `core/utilidades.js`, `app/textos-ui.js`, `funciones/medios.js`, `funciones/rankings.js`, `uniformes/motor-grafico.js`, `funciones/confederaciones.js`, `funciones/estadios.js`, `uniformes/modelo-kits.js`, `app/busqueda-global.js`, `funciones/patrocinadores.js` y `app/modales.js`. El inline conserva el resto del motor (incluido el estado de UI como `rankingSection`/`rankingSort`, que los módulos leen como globales compartidos, y `drawBackNumberOnCanvas`, que quedó intercalada entre el motor gráfico pero pertenece a la capa de kits). En consecuencia, **las cifras y números de línea de este catálogo corresponden a la VER 62 previa a las extracciones** (localizar por nombre, no por línea). Corrección detectada: `normalizeName`, citado más abajo en *Migración de esquema*, reside en realidad en `core/utilidades.js`. El detalle vivo del avance de modularización se lleva en `plan-modularizacion-copa-manager-2026.md` → sección "Estado de ejecución".

---

## Catálogo de módulos

> Los módulos se identifican por afinidad funcional, no por separación física (todo vive en el mismo `<script>`). Para cada uno se indican funciones representativas, variables importantes y de qué depende.

### 1. Núcleo de datos / Modelo (DB)

**Qué hace:** define la forma del objeto de estado global `DB` y lo construye desde cero con datos semilla.

- **Funciones clave:** `buildDefaultDB` (2745), y todos los `buildDefault*` que arman colecciones: `buildDefaultCountries` (1790), `buildDefaultConfederations` (2221), `buildDefaultFifa` (2246), `buildDefaultStadiums` (1473), `buildDefaultClubsData` (2522), `buildDefaultLeagues` (2532), `buildDefaultEvent` (3755), y los del motor de uniformes (`buildDefaultKitBases`, `buildDefaultShortsBases`, `buildDefaultSocksBases`, `buildDefaultNumberFonts`, `buildDefaultBackBases`).
- **Variable central:** `DB` (2820) — objeto único que contiene: `teams`, `confederations`, `stadiums`, `kitBases`/`shortsBases`/`socksBases`/`numberFonts`/`backBases` + texturas, `countries`, `fifa`, `clubs`/`clubsData`/`leagues`, `brands`, `sponsorCategories`, `sponsors`, `media`, `event`, `fixtures`, `strings`, `meta`.
- **Semillas grandes:** `SEED_TEAMS` (2648), `COUNTRIES_SEED` (1478), `CLUB_SEED_DATA` (2380), `STADIUMS_SEED` (868), `KIT_BASE_SEED`/`SHORTS_BASE_SEED`/`SOCKS_BASE_SEED`/`NUMBER_FONT_SEED`/`BACK_BASE_SEED`, y las texturas base64 (`KIT_TEXTURE_DEFAULT`, etc., 889–893, 903, 912).
- **Depende de:** utilidades (`uid`, `colorsFor`, `initials`, `shiftColor`), tablas de rankings, y de casi todos los sub-constructores. Es la **raíz de la que cuelga todo lo demás**.

### 2. Persistencia

**Qué hace:** carga y guarda `DB` en almacenamiento persistente (`window.storage`, clave `STORAGE_KEY = "wc26_db_v1"`).

- **Funciones:** `loadDB` (3011, async), `persist` (3433, con *debounce* de 350 ms y guardado inmediato opcional).
- **Detalle:** `persist` también dispara el registro en el historial comparando contra `PREV_DB_JSON` antes de sobreescribir.
- **Depende de:** `DB`, `migrateDB`, módulo de Historial (`recordHistory`), `showToast`.

### 3. Migración de esquema

**Qué hace:** al cargar una base guardada con una versión anterior, rellena campos nuevos y repara inconsistencias para que el resto del código no falle.

- **Funciones:** `migrateDB` (3077, extensa), `repairDuplicateTeamIds` (3031), `dedupeDuplicateTeams` (3044), `normalizeName` (3041).
- **Depende de:** casi todo el modelo (llama a muchos `buildDefault*` y a `ensureLeague`, `ensureClubObject`, etc.). Es un módulo **de compatibilidad** que conoce la estructura íntima de muchas colecciones.

### 4. Historial de cambios (undo)

**Qué hace:** guarda los últimos ~50 cambios calculando un *diff* por entidad y permite revertir a un estado anterior.

- **Funciones:** `recordHistory` (3527), `computeDBDiff` (3492), `diffTeamPlayers` (3475), `saveHistory` (3541), `loadHistory` (3547), `applyReverseOps` (3554), `deleteHistoryFrom` (3590), `histTopKeyLabel` (3467).
- **Variables:** `HISTORY` (3456), `PREV_DB_JSON` (3457), `HIST_COLLS` (3461, define qué colecciones se diffean por id: `teams`, `clubsData`, `stadiums`, `countries`), `HISTORY_KEY`, `HISTORY_MAX`, `HISTORY_MAX_BYTES`.
- **Depende de:** `DB`, `window.storage`, etiquetas de entidades (`stadiumDisplayName`, etc.). Muy acoplado a la forma de `DB`.

### 5. Textos de interfaz (UI text / i18n ligero)

**Qué hace:** centraliza todas las etiquetas de formularios y nombres visibles para poder editarlos desde el Editor.

- **Funciones:** `T` (511, lector con *fallback*), `groupedTextKeys` (515), `tabLabel` (3696), `tabDescription`/`tabDescHTML` (3701/3704).
- **Variables:** `UI_TEXT_DEFAULTS` (342, diccionario grande con subsecciones por modal/entidad), `GROUP_LABELS` (506), `DB.strings` (overrides guardados).
- **Depende de:** `DB.strings`. Es un módulo **casi independiente** (solo lee de `DB.strings`).

### 6. Navegación / Router y estado de UI

**Qué hace:** decide qué vista mostrar y mantiene el historial de navegación (atrás/adelante) con scroll.

- **Funciones:** `render` (3729, **dispatcher central**), `renderTabs` (3709), `renderNavButtons` (3719), `navigateTo` (2839), `navigateToClub`/`navigateToTeam`/`navigateToPlayer` (2849/2867/2877), `replaceCurrent*` (2859/2887/2894), `pushHistory` (2903), `navBack`/`navForward` (2911/2920), `resetNavHistory` (2929), helpers de scroll (`currentScrollY`, `saveScrollToCurrent`, `restoreScroll`).
- **Variables de estado global de UI:** `activeTab` (2821), `activeTeamId`, `activePlayerId`, `activeClubId`, `navHistory` (2831), `navIndex` (2832), `MAX_NAV_HISTORY`, `TABS` (3691).
- **Depende de:** todos los renderizadores de pestaña, `attachHandlers`. Es el **hub de la UI**: lo usa (o lo usan) prácticamente todos los módulos de vista.

### 7. Búsqueda global

**Qué hace:** el buscador de la barra superior (selecciones o jugadores).

- **Funciones:** `buildGlobalSearch` (2988), `runGlobalSearch` (2942), `gsItemHTML` (2980), `closeGlobalSearch` (2938).
- **Depende de:** `DB.teams` (y jugadores), `escapeHtml`, `navigateTo*`. Módulo de vista relativamente **acotado**.

### 8. Selecciones (Teams)

**Qué hace:** listado y detalle de selecciones nacionales, su edición y sus métricas.

- **Funciones:** `renderSelecciones` (4672), `renderTeamDetail` (4742), `teamCardHTML` (4628), `crestHTML` (4621), `modalAddEditTeam` (6233), `teamRatings`/`teamRating` (3619/3627), `ratingBlockHTML` (3635), `squadStatus` (3653), `orderedTeamsForSelecciones` (4660), `orderedTeamPlayers` (4735), `getTeam` (3609), utilidades de grupos (`groupsList`, `teamsInGroup`, `groupSlotIndex`, `teamsInGroupOrdered`).
- **Variables:** `seleccionesSort` (4655), `squadSort` (4970), `SQUAD_COMPLETE_SIZE` (3652).
- **Depende de:** `DB.teams`, Países (nacionalidades), Confederaciones/badges, Rankings, motor de Uniformes (preview de kits), Router. **Muy central.**

### 9. Jugadores (Players)

**Qué hace:** listado filtrable, detalle e importación masiva de jugadores.

- **Funciones:** `renderJugadores` (5078), `renderPlayerDetail` (4841), `getPlayerWithTeam` (4831), `modalAddEditPlayer` (6463), `parseBulkPlayers` (3394), y helpers de nombre/edad/dorsal: `P` (2280), `playerDisplayName`/`HTML` (2289/2297), `splitFullName` (2275), `computeDefaultFullName`/`ShirtNameValue` (2625/2629), `computeAge`/`playerAge`/`playerAgeText` (2313/2324/2329), `parseBirthDate` (2340), `nextAvailableNumber`/`assignSquadNumbers`/`suggestNumber` (2723/2730/2738), ordenación (`playerValue`, `playerSortName`, etc.).
- **Variables:** `playerFilter` (5044), `playerSort` (5046), `bulkImportTeamId` (5045), `POS_ORDER` (5048), `VALID_POS` (3387), `NUMBER_START_BY_POS` (2729), `MONTH_NAMES` (2339).
- **Depende de:** `DB.teams[].players`, Países (nacionalidad/declaración), Clubes/Marcas, motor de Uniformes (nombre/dorsal en preview), Router.

### 10. Países / Catálogo maestro (Countries)

**Qué hace:** catálogo maestro de países/entidades; base para nacionalidades de jugadores y para crear selecciones.

- **Funciones:** `buildDefaultCountries` (1790), `relinkCountriesToTeams` (1809), `buildMinimalTeamFromCountry` (1821), `integrateTeamsFromCountries` (1842), `findOrCreateCountryByName` (1853), `countryNameById` (1862), `findCountryByName` (1867), `refreshDeclaredForOptions` (1874), `playerCountryName` (1891), `sortedCountries` (1902), `modalAddEditCountry` (6726), `countryRowHTML` (5377), `nationalityRowHTML` (6456).
- **Variables:** `COUNTRIES_SEED` (1478), `FIFA_CODES` (1906), federaciones (`FEDERATION_NAMES`, `FEDERATION_ABBR`), `OFFICIAL_NAMES`, `NICKNAMES`.
- **Depende de:** `DB.countries`, `DB.teams` (vínculo país↔selección). Acoplado con Selecciones y Jugadores.

### 11. Clubes y Ligas

**Qué hace:** modelo de clubes (con múltiples estadios), ligas, y sus vistas.

- **Funciones:** `renderClubes` (5778), `renderClubDetail` (5831), `clubCardHTML` (5734), `clubCrestHTML` (5725), `leagueBadge` (5731), `modalAddEditClub` (6328), `getClubByName`/`ensureClubObject`/`clubKey` (2492/2497/2491), `ensureLeague`/`matchOrAddLeague` (2513/2521), `matchOrAddClub`/`matchOrAddBrand` (2554/2606), `clubPlayers`/`clubRatings`/`clubDisplayName` (2539/2547/2537), `addClub` (3370), `newClubId` (2490), `orderedClubs` (5773).
- **Variables:** `CLUB_SEED_DATA` (2380), `clubsSort` (5759), `clubFilter` (5760).
- **Depende de:** `DB.clubsData`/`DB.leagues`/`DB.clubs`, Jugadores (relación jugador↔club), Estadios (clubes referencian estadios), Marcas. `normLoose` (2376) para *matching* de nombres.

### 12. Confederaciones y FIFA

**Qué hace:** vistas y edición de las 6 confederaciones y de la entidad FIFA; genera badges/escudos.

- **Funciones:** `renderConfederaciones` (4910), `modalEditConfederation` (6203), `modalEditFifa` (6181), `buildDefaultConfederations` (2221), `buildDefaultFifa` (2246), `confBadge` (2250), `fifaBadge` (2257), `orgCrestHTML` (2260).
- **Variables:** `CONFS` (525), `CONF_LIST` (2209), `CONF_COLORS` (2201), `CONF_INFO_DEFAULTS` (2211), `FIFA_INFO_DEFAULT` (2219), `confExpanded` (4896).
- **Depende de:** `DB.confederations`, `DB.fifa`, `DB.teams`. Relativamente **acotado**.

### 13. Rankings (FIFA + Elo)

**Qué hace:** calcula y muestra rankings mundiales y por confederación, en FIFA y Elo.

- **Funciones:** `renderRankings` (4997), `fifaRankingFor` (2132), `applyFifaRankingToTeams` (2138), `eloForTeamName` (2159), `applyEloRatingToTeams` (2165), `computeEloRanks` (2173), `computeFifaRanks` (2187), y helpers de orden (`rankingValue`, `rankingType`, `rankingDefaultDir`).
- **Variables:** `FIFA_RANKING_BY_CODE` (1919), `ELO_RATING` (2198), `ELO_NAME_ALIASES` (2149), `RANKING_SECTION_IDS` (4978), `rankingSection` (4979), `rankingSort` (4980).
- **Depende de:** `DB.teams`, códigos FIFA (Países). Mayormente **datos + una vista**; separable.

### 14. Estadios

**Qué hace:** catálogo de estadios (de Copa del Mundo y de clubes), con vistas y creación automática desde nombres.

- **Funciones:** `buildDefaultStadiums` (1473), `renderEstadios` (5919), `stadiumCardHTML` (5697), `stadiumDisplayName`/`stadiumSubName` (5679/5687), `modalAddEditStadium` (7662), `findStadiumByName` (794), `stadiumLinkName` (800), `ensureStadiumFromName` (806), `clubStadiumRowHTML`/`stadiumTeamRowHTML` (829/842).
- **Variables:** `STADIUMS_SEED` (868), `stadiumsView` (5918).
- **Depende de:** `DB.stadiums`, Clubes (relación club↔estadio). Casi independiente salvo por ese vínculo.

### 15. El Evento / Torneo

**Qué hace:** modelo editable del torneo (formato, llaves, criterios de desempate, mejores terceros, premios) inspirado en el reglamento del Mundial 26; vistas y editores.

- **Funciones:** `buildDefaultEvent` (3755), `renderEvento` (3984), `renderEventoDetail` (4028), editores de modal (`modalEditEventGeneral` 4354, `modalEditEventBracket` 4471, `modalEditEventTiebreakers` 4531) y sus `save*`; llaves/terceros (`eventGroupLetters` 3876, `eventGroupStageMatches` 3880, `eventKnockoutMatches` 3884, `eventThirdSlots` 3896, `solveThirdPairings` 3920), lectura del *draft* de bracket (`readEventBracketDraftFromDOM` 4504), calendario oficial (`loadOfficialCalendarConfirm` 4293, `doLoadOfficialCalendar` 4299, `findTeamByNameLoose` 4286), y helpers (`eventCrestHTML`, `eventFmtDate`, `eventHostRowHTML`).
- **Variables:** `WC26_THIRD_COLS` (3893), `WC26_THIRD_TABLE` (3894, tabla oficial de 495 cruces — constante enorme), `WC26_GROUPS` (4159), `WC26_SCHEDULE_GROUPSTAGE` (4174), `WC26_SCHEDULE_KNOCKOUT` (4251), `eventoDetailOpen` (3968), `eventBracketDraft` (4470).
- **Depende de:** `DB.event`, `DB.teams`, Calendario/Fixtures (carga oficial), Router. Módulo grande y bastante **autocontenido en su lógica de reglas**.

### 16. Calendario / Fixtures / Simulación

**Qué hace:** genera fixtures, calcula tablas de grupo y simula partidos.

- **Funciones:** `renderCalendario` (5218), `generateAllFixtures` (5142), `roundRobin` (5133), `clearAllFixtures` (5160), `standingsFor` (5170), `openSimModal` (7736), `rollDice` (7765), `poisson` (7731), helpers de formato (`fmtFixtureDate`, `knockoutRoundName`, `fixtureSortKey`, `venueLinkHTML`, `teamLinkHTML`).
- **Variables:** `DB.fixtures`.
- **Depende de:** `DB.teams`, El Evento (formato/grupos), Estadios (sedes), Router. La simulación (`poisson`/`rollDice`) es **lógica pura fácilmente aislable**.

### 17. Uniformes / Kits (motor gráfico)

**Qué hace:** el subsistema más grande y complejo: define bases recoloreables (camiseta, short, calcetas), texturas, tipografías de dorsal y "back bases", recolorea imágenes por canvas y dibuja nombre/número (recto y curvo) para generar previews de uniformes.

- **Motor de recoloreo/canvas:** `recolorToCanvas` (~7855), `_nativeRecolorCacheKey` (7854), `loadImg` (7841), `hexToRgb` (7836), `resizeImageToDataURL` (7806), `readFileAsDataURL` (7798), variable `_nativeRecolorCache` (7853), `GARMENT_CANVAS_SIZE` (7940), `RECOLORABLE_BASE_MAX_DIM` (6167).
- **Dibujo de texto/badges:** `drawCurvedText` (1118), `drawTextWithStyle` (1235), `fitTextMetrics` (1044), `applyTextCase` (1080), `arcRadiusFor` (1226), `badgeTextVerticalInk` (1288), `badgeGroupTransform` (1316), `clampInkToBounds` (1097), métricas verticales (`verticalRefMetrics` 1016, `normalizeForVerticalMetrics` 1005, `stripDiacritics` 998, `enableFontKerning` 1041), `VERTICAL_REF_SAMPLE` (1015).
- **Modelo de prendas/fuentes:** `garmentConfig` (949), `GARMENT_TYPES` (944), `buildDefault*` de bases/fuentes, tipografías (`numberFontLabel`, `numberFontFamily`, `ensureNumberFontLoaded` 955, `getNumberFont` 970, `_loadedNumberFontFamilies` 954), back bases (`backBaseDisplayLabel`, `getBackBaseForShirtNumber`), cajas de texto (`BACK_TEXT_BOXES` 974, `BACK_SQUARE_TEXT_BOXES` 981).
- **Composición de kits y previews:** `ensureTeamKits` (8075), `shirtBackImgFor`/`shirtFrontImgFor`/`shirtBackImgForCategory` (8001/8011/8022), `kitOrdinalLabel`/`autoKitLabel` (8066/8067), `renderKitPreviews` (8181), `renderGarmentPreviews` (8213), `renderNumberFontPreviews` (8232), `renderPlayerBadgePreviews` (8200), `renderGarmentSection` (5556), tarjetas (`kitCardHTML` 5409, `garmentBaseCardHTML` 5435, `garmentTemplateCardHTML` 5529, `numberFontCardHTML` 5593, `backBaseCardHTML` 5632), y sus secciones/render (`renderNumberFontsSection` 5610, `renderBackBasesSection` 5648).
- **Modales/edición de kits:** `modalManageKits` (6797), `modalAddEditKit` (6819, muy extenso), lectores de formulario (`readLayerRows`, `readBackNumberFields`, `writeBackNumberFields`, `readBackNameFields`, `writeBackNameFields`, `readBadgeNumberFields`, `readBadgeNameFields`, `syncBadge*`, `unlinkBadge`, `updateBadgeStatusBadge`, `syncBackNameIfLinked`, `unlinkBackName`, `readComboFromBlock`, `refreshAllComboPreviews`, `renumberComboBlocks`), y helpers de combo (`defaultCombo`, `cloneCombo`, `comboBlockHTML`, `garmentSectionHTML`, `colorPickerHTML`, `layerRowHTML`, `syncColorHexText`, `fontDataUrlExtension`, `outlineThumb`).
- **Variables:** `KIT_ORDINAL_LABELS` (8065), `GARMENT_DISPLAY_PREFIX` (5400), `garmentExpanded`/`garmentsParentExpanded`/`numberFontsExpanded`/`backBasesExpanded` (4897/4907–4909), portapapeles de estilos (`clipboardKit`, `clipboardCombo`, `clipboardNumberStyle`, `clipboardNameStyle`, `clipboardBothStyle`, `dragKitInfo`, `draggedComboBlock`, 4900–4906), y las texturas/seeds base64.
- **Depende de:** `DB` (bases, texturas, fuentes) y de Selecciones/Jugadores para saber qué dibujar. Internamente es cohesivo pero **enorme y con mucho estado de UI propio**.

### 18. Patrocinadores y Marcas (Sponsors / Brands / Apparel)

**Qué hace:** gestiona patrocinadores, categorías, y marcas de indumentaria.

- **Funciones:** `renderPatrocinadores` (5316), `modalAddEditSponsor` (6644), `sponsorCategoriesOf`/`sponsorHasCategory`/`findSponsorByName` (2568/2572/2576), `sponsorCategoryRowHTML` (6637), marcas (`apparelBrandNames` 2581, `ensureApparelBrandSponsor` 2587, `addBrand` 3375, `brandLogoHTML` 6627), categorías (`addSponsorCategory` 3388), `effectiveShirtName` (2616).
- **Variables:** `APPAREL_BRANDS` (2710), `SPONSOR_CATEGORIES` (2711), `KIT_SPONSORS` (2713), `APPAREL_CATEGORY` (2565).
- **Depende de:** `DB.sponsors`/`DB.brands`/`DB.sponsorCategories`, y es referenciado por Jugadores y Uniformes (marca de indumentaria). Acoplamiento moderado.

### 19. Medios (Media)

**Qué hace:** catálogo de medios (TV, radio, streaming).

- **Funciones:** `renderMedios` (5351), `modalAddEditMedia` (6690).
- **Variables:** `DB.media`.
- **Depende de:** solo `DB.media` y utilidades. Es el módulo **más independiente y pequeño**.

### 20. Editor (panel de administración)

**Qué hace:** pestaña "editor" con: edición de textos de interfaz, edición del catálogo de países, e importación/exportación JSON de toda la base.

- **Funciones:** `renderEditor` (5958), y (en `handleAction`) los casos `import-json`, `delete-history-entry`, `clear-history`, más el editor de textos (`ui-text-*`) y de países (`country-*`) cuyos listeners se enganchan en `attachHandlers` (8485).
- **Depende de:** `DB.strings` (UI text), Países, Historial, Persistencia, `migrateDB` (al importar). Es un **agregador** que toca muchos módulos.

### 21. Utilidades comunes

**Qué hace:** funciones transversales sin estado propio.

- **Funciones:** `escapeHtml` (2935), `normLoose` (2376) / `normalizeName` (3041), `hexToRgb` (7836), `shiftColor` (2634), `stripDiacritics` (998), `uid` (2645) / `newId` (3603) / `newClubId` (2490), `colorsFor` (551), `initials` (2267), `isoDate` (2334), `compareGeneric` (4951), helpers de ordenación de tablas (`sortTh` 4960, `toggleSort` 4965), `numInRange` (3388), `isRegistered`/`avgRating` (3617/3618).
- **Variables:** `PALETTES` (527), `CUSTOM_COLORS` (532), contadores `_seedCounter` (2644), `_newIdCounter` (3602).
- **Depende de:** nada (o casi). **Base candidata a extraer primero.**

### 22. Controlador de acciones y modales (capa de control)

**Qué hace:** traduce clics del usuario (atributos `data-action`) en operaciones sobre `DB` y navegación; gestiona modales y avisos.

- **Funciones:** `attachHandlers` (8485), `handleAction` (8548, `switch` con ~152 casos), `openModal` (6113), `closeModal` (6125), `modalConfirm` (6128), `showToast` (3682), campos de subida (`imageUploadField` 6142, `fontUploadField` 6170), `checkNumberTaken`/`parseFavNumbers` (6444/6436), `detailNavHTML` (4716).
- **Depende de:** **todos** los módulos (crea sus modales, llama a sus `save*`, y dispara `render`/`persist`). Es el **punto de máximo acoplamiento** de la aplicación.

### 23. Arranque (Init)

**Qué hace:** secuencia de inicio: cargar base, cargar historial, renderizar, construir buscador, fijar el badge de versión.

- **Función:** la IIFE `init()` al final del script (9934) y la constante `APP_VERSION` (334).
- **Depende de:** Persistencia, Historial, Router, Búsqueda global.

---

## Dependencias entre módulos

Relaciones observadas (→ significa "usa / depende de"):

- **Todo → Núcleo de datos (DB)** y **Utilidades**. `DB` y las utilidades son las dos hojas de las que cuelga el resto.
- **Persistencia → Migración, Historial.** `loadDB` migra al cargar; `persist` registra historial.
- **Migración → prácticamente todo el modelo** (invoca `buildDefault*` y los `ensure*`).
- **Historial → forma de `DB`** (diff por entidad de `teams`, `clubsData`, `stadiums`, `countries`) y `window.storage`.
- **Router → todos los renderizadores** de pestaña + `attachHandlers`. A su vez, casi todos los módulos de vista llaman a `render()` y a `navigate*`.
- **Selecciones → Países, Confederaciones/FIFA, Rankings, Uniformes, Router.**
- **Jugadores → Países, Clubes/Marcas, Uniformes, Router.**
- **Clubes → Jugadores, Estadios, Marcas.**
- **Estadios → Clubes** (relación bidireccional ligera).
- **El Evento → Calendario/Fixtures, Selecciones.**
- **Calendario → El Evento, Selecciones, Estadios; Simulación** (poisson) es pura.
- **Uniformes → DB (bases/texturas/fuentes), Selecciones/Jugadores** para el contenido a dibujar.
- **Editor → UI text, Países, Historial, Persistencia, Migración.**
- **Controlador de acciones (`handleAction`) → todos.** Es el nudo central que conecta eventos de UI con cada módulo.
- **Init → Persistencia, Historial, Router, Búsqueda.**

Puntos únicos de acoplamiento (todo pasa por aquí): la variable global **`DB`**, el estado global de UI (`activeTab`/`activeTeamId`/`activePlayerId`/`activeClubId`), la función **`render()`** y el **`switch` de `handleAction`**.

---

## Componentes críticos

Los que, si se tocan, afectan a casi todo el sistema:

1. **Núcleo de datos (`DB` + `buildDefaultDB`)** — raíz de todo el estado.
2. **Persistencia (`loadDB`/`persist`)** — cualquier cambio de forma de `DB` impacta aquí y en el historial.
3. **Migración (`migrateDB`)** — conoce la estructura íntima de muchas colecciones; frágil ante cambios de esquema.
4. **Router (`render` + estado global de UI + `navHistory`)** — orquesta qué se muestra.
5. **Controlador de acciones (`handleAction`, ~152 casos)** — cuello de botella que conecta UI con lógica; el de mayor acoplamiento.
6. **Historial (undo)** — depende de la forma exacta de `DB`; sensible a cambios de modelo.

---

## Componentes independientes

Los de menor acoplamiento, tocables casi en aislamiento:

- **Utilidades comunes** (`escapeHtml`, `hexToRgb`, `shiftColor`, `normLoose`, `compareGeneric`, `initials`, `isoDate`…). Sin dependencias.
- **Medios** — solo lee/escribe `DB.media`.
- **Textos de interfaz (UI text)** — solo lee `DB.strings`.
- **Simulación de partidos** (`poisson`, y en gran medida `rollDice`) — lógica matemática pura.
- **Motor de recoloreo/dibujo de bajo nivel** (`recolorToCanvas`, `drawCurvedText`, `drawTextWithStyle`, `fitTextMetrics`) — reciben parámetros y devuelven canvas/píxeles; no dependen de `DB` directamente (aunque sus llamadores sí).
- **Rankings (cálculo)** — `computeEloRanks`/`computeFifaRanks` y tablas asociadas; principalmente datos + funciones puras.

---

## Componentes muy conectados con el resto

- **`handleAction`** (toca todos los módulos).
- **`render` / estado global de UI** (lo usan todas las vistas).
- **`DB`** (todos leen/escriben).
- **Selecciones y Jugadores** (cruzan con Países, Clubes, Uniformes, Rankings, Confederaciones).
- **Uniformes** (subsistema grande que enlaza DB, Selecciones/Jugadores y mucho estado de UI propio).

---

## Componentes candidatos para separarse primero

Criterio: bajo acoplamiento, dependencias claras, valor de aislar temprano.

1. **Utilidades comunes** — es la base sin dependencias; extraerlas primero simplifica todo lo demás.
2. **Constantes/semillas de datos** (`SEED_TEAMS`, `COUNTRIES_SEED`, `CLUB_SEED_DATA`, `STADIUMS_SEED`, tablas FIFA/Elo, `WC26_*`, texturas base64) — son datos puros; separarlas aligera enormemente el archivo y no rompe lógica.
3. **Textos de interfaz (`UI_TEXT_DEFAULTS` + `T`)** — casi autónomo.
4. **Medios** — módulo pequeño y aislado; buen "primer módulo" de práctica.
5. **Simulación (`poisson`) y motor de recoloreo/dibujo de bajo nivel** — funciones puras que reciben entradas y devuelven salidas, fáciles de mover con pruebas.
6. **Rankings (cálculo + tablas)** — datos + funciones acotadas.

---

## Componentes que conviene dejar para el final

Criterio: alto acoplamiento o dependencia de la forma de `DB` / del estado global.

1. **Controlador de acciones (`handleAction`)** — depende de que el resto ya esté modularizado; conviene fragmentarlo al final (o por dominios, a medida que cada módulo se aísle).
2. **Router / estado global de UI (`render`, `activeTab`…)** — es el pegamento de las vistas; migrarlo pronto obligaría a tocar todo lo demás en cascada.
3. **Persistencia + Migración + Historial** — están atados a la forma exacta de `DB`; deben moverse una vez estabilizado el modelo de datos.
4. **Uniformes (subsistema completo de kits)** — grande, con mucho estado de UI propio y modales extensos; conviene abordarlo tarde y con cuidado, aunque su capa de dibujo de bajo nivel sí puede extraerse antes (ver "candidatos para separarse primero").

---

## Orden recomendado para modularizar el proyecto

Secuencia sugerida de menor a mayor riesgo, respetando dependencias:

1. **Separar datos puros:** todas las semillas y tablas constantes (equipos, países, clubes, estadios, FIFA/Elo, `WC26_*`, texturas base64). Reduce el tamaño del archivo sin tocar lógica.
2. **Extraer Utilidades comunes** (formato, color, cadenas, ordenación).
3. **Extraer Textos de interfaz** (`UI_TEXT_DEFAULTS` + `T`).
4. **Extraer módulos independientes de vista/lógica pequeños:** Medios, luego Simulación y Rankings (cálculo).
5. **Aislar la capa gráfica de bajo nivel de Uniformes** (recoloreo y dibujo de texto), separándola de sus modales de UI.
6. **Modularizar dominios de datos con sus vistas asociadas**, uno a uno: Estadios → Confederaciones/FIFA → Países → Clubes/Ligas → Selecciones → Jugadores. (Se dejan Selecciones/Jugadores al final de este bloque por ser los más cruzados.)
7. **Modularizar El Evento y el Calendario/Fixtures** (dependen de Selecciones ya aisladas).
8. **Modularizar el subsistema completo de Uniformes** (modales y estado de UI), apoyándose en la capa gráfica ya extraída en el paso 5.
9. **Estabilizar el modelo de `DB` y luego mover Persistencia, Migración e Historial**, que dependen de su forma final.
10. **Refactor final del Router y del Controlador de acciones (`handleAction`)**, repartiendo sus casos entre los módulos ya existentes; es el último por ser el de mayor acoplamiento.

---

## Notas y zonas cuyo propósito conviene confirmar antes de asumir

- **`WC26_THIRD_TABLE` (3894):** por su tamaño y por el comentario "tabla oficial de los 495 cruces de mejores terceros", parece un **dato de referencia oficial** más que lógica. Conviene tratarlo como constante de datos y verificar que ningún código lo modifique en caliente.
- **Doble enganche de eventos:** `attachHandlers` engancha `#view`, mientras que un `document.addEventListener("click", …)` separado (justo antes de `handleAction`) atiende clics dentro de `#modal-root` y `#nav-buttons`. Ambos terminan en `handleAction`. Conviene tener presente este doble camino al separar la capa de control.
- **Estado de UI de Uniformes vs. datos:** el módulo de Uniformes mezcla estado efímero de UI (portapapeles de estilos, flags de expandido, drag) con datos persistidos (`DB.kitBases`, texturas, fuentes). Antes de moverlo conviene delimitar qué es estado de sesión y qué es dato del modelo.
- **Relaciones "por nombre":** varias uniones se hacen por *matching* de nombres normalizados (`normLoose`) en lugar de por id — p. ej. jugador↔club, club↔estadio, selección↔país. Es una dependencia lógica implícita a documentar módulo por módulo antes de separarlos.
- **`P` (2280) y `uid`/`_seedCounter`:** `P` es un constructor abreviado de jugadores usado por las semillas; los contadores `_seedCounter`/`_newIdCounter` son globales mutables. Al modularizar semillas hay que decidir dónde vive ese estado de generación de ids.

Cuando quieras, dime cómo seguimos.
