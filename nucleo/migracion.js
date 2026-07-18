/* =========================================================
   COPA MANAGER 2026 — nucleo/migracion.js
   Núcleo — migración/compatibilidad de esquema: adapta bases guardadas con
   versiones anteriores al esquema actual (rellena campos nuevos, migra formatos
   antiguos) y repara datos (ids duplicados, selecciones duplicadas). migrateDB
   transforma un DB YA CARGADO in situ; NO carga ni persiste (eso es almacenamiento)
   ni construye por defecto (eso es modelo-db, aunque invoca sus buildDefault* para
   rellenar colecciones faltantes). repairDuplicateTeamIds y dedupeDuplicateTeams son
   helpers internos de migrateDB. Extracción mecánica: texto y orden idénticos al
   original. Script CLÁSICO (no module). Cargar DESPUÉS de nucleo/modelo-db.js y de
   los módulos de dominio (por sus constructores y helpers ensure), y ANTES del
   <script> inline. Usa DB y funciones de dominio en tiempo de ejecución. Lo invocan loadDB
   (almacenamiento) y handleAction (reset/import), que permanecen en el inline.
   ========================================================= */

/* Asegura que bases guardadas con una versión anterior tengan los campos nuevos */
// Repara selecciones con el mismo id (pudo pasar con una versión anterior que generaba ids
// colisionables al crear muchas selecciones de golpe). Conserva el id en la primera selección
// que lo tenga y le asigna uno nuevo a las siguientes que lo compartan.
function repairDuplicateTeamIds(){
  const seen = new Set();
  DB.teams.forEach(t=>{
    if(seen.has(t.id)) t.id = newId("t");
    seen.add(t.id);
  });
}
// Si dos selecciones acabaron representando el mismo país (mismo nombre ignorando acentos, o mismo
// código FIFA — por ejemplo "México"/"Mexico", o un código viejo huérfano junto al correcto actual),
// se queda solo la más correcta/completa y se descartan las demás.
function dedupeDuplicateTeams(){
  const validCodes = new Set((DB.countries||[]).map(c=>c.fifaCode).filter(Boolean));
  const countryNameByCode = {};
  (DB.countries||[]).forEach(c=>{ if(c.fifaCode) countryNameByCode[c.fifaCode] = c.commonName; });
  const teams = DB.teams;
  const parent = teams.map((_,i)=>i);
  function find(x){ while(parent[x]!==x) x=parent[x]; return x; }
  function union(a,b){ const ra=find(a), rb=find(b); if(ra!==rb) parent[rb]=ra; }
  const byCode = {}, byName = {};
  teams.forEach((t,i)=>{
    if(t.fifaCode){ if(byCode[t.fifaCode]!=null) union(byCode[t.fifaCode], i); else byCode[t.fifaCode]=i; }
    const nm = normalizeName(t.commonName);
    if(nm){ if(byName[nm]!=null) union(byName[nm], i); else byName[nm]=i; }
  });
  const groups = {};
  teams.forEach((t,i)=>{ const r=find(i); (groups[r]=groups[r]||[]).push(t); });
  // Cuenta los uniformes reales (t.kits[]) y también los campos legado, por si hay bases muy viejas.
  const kitCount = t =>
      (Array.isArray(t.kits) ? t.kits.length : 0)
    + (t.kitHomeImg ? 1 : 0)
    + (t.kitAwayImg ? 1 : 0);
  // "Contenido real" del usuario: lo que sería doloroso perder (jugadores, uniformes, logo…). Pesa
  // en una escala mucho mayor que los desempates de nombre/código, para que una selección editada
  // NUNCA sea descartada en favor de un duplicado vacío autogenerado por integrateTeamsFromCountries.
  const userContent = t =>
      (t.players ? t.players.length : 0) * 100
    + kitCount(t) * 40
    + (t.logoImg ? 50 : 0)
    + (t.federationName ? 10 : 0)
    + (t.kitSponsor ? 10 : 0)
    + ((t.nicknames && t.nicknames.length) ? 5 : 0)
    + (t.group ? 5 : 0)
    + (t.fifaPoints != null ? 2 : 0);
  // Desempates suaves: solo deciden cuando el contenido real está empatado (p. ej. dos stubs vacíos
  // del mismo país). No pueden voltear una selección que sí tiene datos.
  const tiebreak = t =>
      (validCodes.has(t.fifaCode) ? 2 : 0)
    + (countryNameByCode[t.fifaCode] === t.commonName ? 1 : 0);
  const keepIds = new Set();
  Object.values(groups).forEach(group=>{
    let best = group[0], bestScore = -Infinity;
    group.forEach(t=>{
      const score = userContent(t) + tiebreak(t);
      if(score>bestScore){ bestScore=score; best=t; }
    });
    keepIds.add(best.id);
  });
  DB.teams = DB.teams.filter(t=>keepIds.has(t.id));
}

function migrateDB(){
  if(!DB.teams) DB.teams = [];
  // El Evento: bases guardadas antes de esta versión no lo tienen; se crea con el Mundial 2026.
  if(!DB.event) DB.event = buildDefaultEvent();
  else {
    const def = buildDefaultEvent();
    Object.keys(def).forEach(k=>{ if(DB.event[k]===undefined) DB.event[k] = def[k]; });
    if(!DB.event.conductPoints) DB.event.conductPoints = def.conductPoints;
    if(!Array.isArray(DB.event.rounds) || !DB.event.rounds.length) DB.event.rounds = def.rounds;
  }
  repairDuplicateTeamIds();
  if(!DB.clubs){
    const set = new Set();
    DB.teams.forEach(t=>t.players.forEach(p=>{ if(p.club) set.add(p.club); }));
    DB.clubs = [...set].sort();
  }
  // Modelo de clubes: crea los objetos y el catálogo de ligas si aún no existen (datos previos).
  if(!DB.leagues) DB.leagues = buildDefaultLeagues(DB.clubs);
  if(!DB.clubsData){
    DB.clubsData = buildDefaultClubsData(DB.clubs);
  } else {
    // Asegura que cada club-nombre tenga su objeto (por si se agregaron nombres sueltos después).
    DB.clubs.forEach(nm=>{ if(!getClubByName(nm)) ensureClubObject(nm); });
    // Normaliza campos faltantes en objetos viejos.
    DB.clubsData.forEach(c=>{
      ["fullName","officialName","code","codeAlt","city","country","league","stadium","trainingGround","kitSponsor"].forEach(k=>{ if(c[k]===undefined) c[k]=""; });
      if(!c.nicknames) c.nicknames=[];
      if(c.color1===undefined) c.color1="#4F46E5";
      if(c.color2===undefined) c.color2="#15161D";
      if(c.color3===undefined) c.color3="#FFFFFF";
      if(c.logoImg===undefined) c.logoImg=null;
      if(c.founded===undefined) c.founded=null;
      if(!c.commonName) c.commonName="Club";
      if(!c.shortName) c.shortName=(c.commonName||"").slice(0,30);
    });
  }
  // Asegura que las ligas usadas por los clubes estén en el catálogo.
  DB.clubsData.forEach(c=>{ if(c.league) ensureLeague(c.league); });
  // Modelo: cada club puede tener varios estadios, en orden de importancia (c.stadiums).
  // c.stadium se conserva como el principal (el primero) por compatibilidad con datos previos.
  DB.clubsData.forEach(c=>{
    if(!Array.isArray(c.stadiums)) c.stadiums = (c.stadium||"").trim() ? [c.stadium.trim()] : [];
    c.stadium = c.stadiums[0]||"";
  });
  if(!DB.brands) DB.brands = [...APPAREL_BRANDS];
  if(!DB.sponsorCategories) DB.sponsorCategories = [...SPONSOR_CATEGORIES];
  if(!DB.confederations) DB.confederations = buildDefaultConfederations();
  else CONF_LIST.forEach(id=>{
    if(DB.confederations[id] && DB.confederations[id].badgeColor===undefined){
      DB.confederations[id].badgeColor = (CONF_COLORS[id]||{fg:"#9298AC"}).fg;
    }
  });
  if(!DB.stadiums) DB.stadiums = buildDefaultStadiums();
  else DB.stadiums.forEach(s=>{
    if(s.state===undefined) s.state = "";
    if(s.owner===undefined) s.owner = "";
    if(!Array.isArray(s.teams)) s.teams = [];
    if(s.nickname===undefined) s.nickname = "";
    if(s.showNickname===undefined) s.showNickname = false;
    // Clasificación: los que coinciden con las 16 sedes de la semilla son del Mundial 2026;
    // el resto (creados a mano o desde clubes) son "Otros estadios".
    if(s.worldCup===undefined) s.worldCup = STADIUMS_SEED.some(x=>normLoose(x.tournamentName)===normLoose(s.tournamentName));
    if(s.isTraining===undefined) s.isTraining = false;
  });
  // Todos los estadios nombrados en los clubes aparecen también en la sección de Estadios (como "Otros")
  // y llevan al club en su lista de "Equipos que juegan ahí". Heredan ciudad y país del club.
  (DB.clubsData||[]).forEach(c=>{ (c.stadiums||[]).forEach(nm=> ensureStadiumFromName(nm, c.commonName, c.country, c.city)); });
  // Los de las selecciones también existen en el catálogo, pero sin registrar a la selección
  // como equipo local (esa lista es de clubes) ni como dueña.
  (DB.teams||[]).forEach(t=>{ (t.stadiums||[]).forEach(nm=> ensureStadiumFromName(nm)); });
  // Instalaciones de entrenamiento de clubes y selecciones: existen como "estadios" marcados
  // isTraining=true dentro del mismo catálogo, heredando ciudad y país del club / selección.
  (DB.clubsData||[]).forEach(c=>{ if((c.trainingGround||"").trim()) ensureStadiumFromName(c.trainingGround, null, c.country, c.city, true); });
  (DB.teams||[]).forEach(t=>{ if((t.trainingGround||"").trim()) ensureStadiumFromName(t.trainingGround, null, null, null, true); });
  // Limpieza única: versiones anteriores ponían como dueño al club que nombraba el estadio.
  // Se borra ese dueño auto-asignado (reconocible porque el club tiene el estadio en su lista
  // y figura como equipo local). Corre una sola vez; los dueños puestos a mano después no se tocan.
  if(!DB.ownerAutoCleanupDone){
    (DB.stadiums||[]).forEach(s=>{
      if(!s.owner) return;
      const c = getClubByName(s.owner);
      if(!c) return;
      const names = [s.tournamentName, s.officialName, s.nickname].map(n=>normLoose((n||"").trim())).filter(Boolean);
      const inClubList = Array.isArray(c.stadiums) && c.stadiums.some(nm=>names.includes(normLoose(nm)));
      const inTeams = Array.isArray(s.teams) && s.teams.some(t=>normLoose(t)===normLoose(s.owner));
      if(inClubList && inTeams) s.owner = "";
    });
    DB.ownerAutoCleanupDone = true;
  }
  if(!DB.kitBases) DB.kitBases = buildDefaultKitBases();
  DB.kitBases.forEach(b=>{ if(!("backImg" in b)) b.backImg = null; if(!("gkImg" in b)) b.gkImg = null; if(!("gkBackImg" in b)) b.gkBackImg = null; });
  // Precarga las versiones de portero de shirt1 y shirt2 en datos ya existentes que aún no las tengan.
  (function backfillGkSeeds(){
    const seedById = {};
    KIT_BASE_SEED.forEach(s=>{ seedById[s.number] = s; });
    DB.kitBases.forEach(b=>{
      const seed = seedById[b.number];
      if(seed && seed.gkImg && !b.gkImg) b.gkImg = seed.gkImg;
      if(seed && seed.gkBackImg && !b.gkBackImg) b.gkBackImg = seed.gkBackImg;
    });
  })();
  // Actualización única de las texturas de portero de shirt1/shirt2 al nuevo juego de plantillas.
  // Se aplica una sola vez para no pisar reemplazos manuales posteriores del usuario.
  if(!DB._gkTexV3Applied){
    const seedById = {};
    KIT_BASE_SEED.forEach(s=>{ seedById[s.number] = s; });
    [1,2].forEach(num=>{
      const b = DB.kitBases.find(x=>x.number===num);
      const seed = seedById[num];
      if(b && seed){
        if(seed.gkImg) b.gkImg = seed.gkImg;
        if(seed.gkBackImg) b.gkBackImg = seed.gkBackImg;
      }
    });
    // Refresca también los contornos de portero al nuevo juego (una sola vez).
    DB.gkTexture = KIT_GK_TEXTURE_DEFAULT;
    DB.gkTextureBack = KIT_GK_TEXTURE_BACK_DEFAULT;
    DB._gkTexV3Applied = true;
  }
  if(!DB.kitTexture) DB.kitTexture = KIT_TEXTURE_DEFAULT;
  if(!DB.kitTextureBack) DB.kitTextureBack = KIT_TEXTURE_BACK_DEFAULT;
  if(!DB.gkTexture) DB.gkTexture = KIT_GK_TEXTURE_DEFAULT;
  if(!DB.gkTextureBack) DB.gkTextureBack = KIT_GK_TEXTURE_BACK_DEFAULT;
  if(!DB.shortsBases) DB.shortsBases = buildDefaultShortsBases();
  if(!DB.shortsTexture) DB.shortsTexture = SHORTS_TEXTURE_DEFAULT;
  if(!DB.socksBases) DB.socksBases = buildDefaultSocksBases();
  if(!DB.socksTexture) DB.socksTexture = SOCKS_TEXTURE_DEFAULT;
  if(!Array.isArray(DB.numberFonts) || DB.numberFonts.length===0) DB.numberFonts = buildDefaultNumberFonts();
  if(!Array.isArray(DB.backBases) || DB.backBases.length===0) DB.backBases = buildDefaultBackBases();
  if(!DB.countries) DB.countries = buildDefaultCountries(DB.teams);
  else {
    // Compatibilidad con versiones anteriores que excluían los países ya promovidos a selección.
    const existingFifa = new Set(DB.countries.map(c=>c.fifaCode));
    COUNTRIES_SEED.forEach(row=>{
      if(!existingFifa.has(row[2])){
        DB.countries.push({
          id: uid(), commonName: row[0], iocCode: row[1], fifaCode: row[2],
          parentOrStatus: row[3], conf: row[4], fifaAffiliated: !!row[5], iocAffiliated: !!row[6],
          officialLanguages: [], secondaryLanguages: [],
          teamLinks: {absoluta:null}
        });
      }
    });
    DB.countries.forEach(c=>{
      if(!c.teamLinks) c.teamLinks = {absoluta:null};
      if(!Array.isArray(c.officialLanguages)) c.officialLanguages = [];
      if(!Array.isArray(c.secondaryLanguages)) c.secondaryLanguages = [];
    });
  }
  integrateTeamsFromCountries(DB.teams, DB.countries);
  dedupeDuplicateTeams();
  relinkCountriesToTeams();
  applyFifaRankingToTeams(DB.teams);
  DB.teams.forEach(t=>{ if("fifaRank" in t) delete t.fifaRank; });
  // Integración del ranking Elo (jun. 2026) que el usuario proporcionó. Se reaplica por completo una
  // sola vez por versión de datos (para no pisar ediciones manuales posteriores), y además —en cada
  // carga— rellena el Elo de cualquier selección que lo tenga en null pero exista en la tabla, para
  // recuperar selecciones que quedaron sin dato en integraciones previas (ej. nombres corregidos).
  if(!DB._eloSeedV5Applied){ applyEloRatingToTeams(DB.teams); DB._eloSeedV5Applied = true; }
  DB.teams.forEach(t=>{ if(t.eloRating==null && ELO_RATING[t.commonName]!=null) t.eloRating = ELO_RATING[t.commonName]; });
  if(!DB.fifa) DB.fifa = buildDefaultFifa();
  if(!DB.strings) DB.strings = {};
  if(DB.tabsMeta){
    // Migración: las personalizaciones viejas de pestañas pasan al sistema unificado de textos
    TABS.forEach(([id,label])=>{
      const old = DB.tabsMeta[id];
      if(!old) return;
      if(old.label && old.label.trim() && old.label!==label && DB.strings[`tabs.${id}.label`]===undefined){
        DB.strings[`tabs.${id}.label`] = old.label;
      }
      if(old.description && old.description.trim() && DB.strings[`tabs.${id}.description`]===undefined){
        DB.strings[`tabs.${id}.description`] = old.description;
      }
    });
    delete DB.tabsMeta;
  }
  if(!DB.sponsors) DB.sponsors = [];
  if(!DB.media) DB.media = [];
  // Patrocinadores: campos nuevos — categorías MÚLTIPLES, marca global del torneo, logo y 3 colores.
  DB.sponsors.forEach(s=>{
    if(!Array.isArray(s.categories)) s.categories = s.category ? [s.category] : [];
    if(s.category!==undefined) delete s.category;
    if(s.global===undefined) s.global = !s.teamId; // antes: sin equipo = patrocinador del torneo (global)
    if(s.logoImg===undefined) s.logoImg = null;
    if(s.color1===undefined) s.color1 = "#4F46E5";
    if(s.color2===undefined) s.color2 = "#15161D";
    if(s.color3===undefined) s.color3 = "#FFFFFF";
  });
  // Medios: logo y 3 colores.
  DB.media.forEach(m=>{
    if(m.logoImg===undefined) m.logoImg = null;
    if(m.color1===undefined) m.color1 = "#4F46E5";
    if(m.color2===undefined) m.color2 = "#15161D";
    if(m.color3===undefined) m.color3 = "#FFFFFF";
  });
  // Las marcas de ropa dejan de ser un catálogo reutilizable y pasan a ser patrocinadores
  // (categoría "Indumentaria"). Solo Adidas queda ya como patrocinador del torneo (global). Se corre
  // una sola vez; después, cada marca nueva se crea como patrocinador automáticamente.
  if(!DB.brandsToSponsorsDone){
    const brandList = (DB.brands && DB.brands.length) ? DB.brands : [...APPAREL_BRANDS];
    brandList.forEach(name=> ensureApparelBrandSponsor(name, {global: normLoose(name)===normLoose("Adidas")}));
    DB.brandsToSponsorsDone = true;
  }
  DB.brands = []; // el catálogo reutilizable de marcas ya no se usa
  if(!DB.fixtures) DB.fixtures = [];
  if(!DB.meta) DB.meta = {};
  DB.teams.forEach(t=>{
    if(!t.players) t.players = [];
    if(t.commonName===undefined){
      const legacyName = t.name || "Selección";
      t.commonName = legacyName.slice(0,50);
      t.officialName = OFFICIAL_NAMES[legacyName] || legacyName;
      t.shortName = legacyName.slice(0,30);
      t.fifaCode = (FIFA_CODES[legacyName] || initials(legacyName)).slice(0,3).toUpperCase();
      t.iocCode = null;
    }
    if(t.federationName===undefined){
      t.federationName = FEDERATION_NAMES[t.name || t.commonName] || null;
    }
    if(t.federationAbbr===undefined){
      t.federationAbbr = FEDERATION_ABBR[t.name || t.commonName] || null;
    }
    if(!Array.isArray(t.nicknames)){
      const seed = NICKNAMES[t.name || t.commonName];
      t.nicknames = seed ? seed.map(n=>({...n})) : [];
    }
    // Instalaciones: cada selección puede tener varios estadios (en orden de importancia)
    // y un campo de entrenamiento — igual que los clubes.
    if(!Array.isArray(t.stadiums)) t.stadiums = (t.stadium||"").trim() ? [t.stadium.trim()] : [];
    t.stadium = t.stadiums[0]||"";
    if(t.trainingGround===undefined) t.trainingGround = "";
    if(t.kitSponsor===undefined) t.kitSponsor = null;
    if(t.logoImg===undefined) t.logoImg = null;
    if(t.eloRating===undefined) t.eloRating = ELO_RATING[t.commonName] ?? null;
    ensureTeamKits(t);
    // Migración única: los colores de visita que vivían sueltos en la selección pasan al uniforme
    // de visitante (si aún no se había hecho) y luego se limpian estos campos ya obsoletos.
    // OJO: solo se actúa si el campo ya venía así desde los datos cargados — nunca se recrea aquí,
    // para no sobrescribir en cada carga el color real que el usuario ya puso en el kit.
    if("awayColor1" in t){
      const jugadorKits = t.kits.filter(k=>k.category==="jugador");
      if(jugadorKits[1] && t.awayColor1){
        jugadorKits[1].color1 = t.awayColor1;
        if(t.awayColor2) jugadorKits[1].color2 = t.awayColor2;
      }
      delete t.awayColor1; delete t.awayColor2; delete t.kitHomeImg; delete t.kitAwayImg;
    }
    if(t.color3===undefined) t.color3 = "#FFFFFF";
    let needsNumbers = false;
    t.players.forEach(p=>{
      if(p.number===undefined){ p.number=null; needsNumbers=true; }
      if(p.firstName===undefined && p.lastName===undefined && p.commonName===undefined){
        const split = splitFullName(p.name);
        p.firstName = split.firstName; p.lastName = split.lastName; p.commonName = split.commonName;
      }
      if(p.firstName===undefined) p.firstName = "";
      if(p.lastName===undefined) p.lastName = "";
      if(p.commonName===undefined) p.commonName = "";
      if(!Array.isArray(p.nationalityIds)) p.nationalityIds = [];
      if(p.declaredForCountryId===undefined) p.declaredForCountryId = null;
      if(p.photo===undefined) p.photo = null;
      if(p.caps===undefined) p.caps = null;
      if(p.goalsNational===undefined) p.goalsNational = null;
      if(p.birthDate===undefined) p.birthDate = null;
      if(p.brand===undefined) p.brand = null;
      if(p.height===undefined) p.height = null;
      if(p.fullName===undefined) p.fullName = "";
      if(p.numberUnassigned===undefined) p.numberUnassigned = false;
      if(p.ratingPotential===undefined) p.ratingPotential = null;
      if(p.numberClub===undefined) p.numberClub = null;
      if(!Array.isArray(p.favNumbersTeam)) p.favNumbersTeam = [];
      if(!Array.isArray(p.favNumbersClub)) p.favNumbersClub = [];
      if(p.shirtNameTeam===undefined) p.shirtNameTeam = "";
      if(p.shirtNameClub===undefined) p.shirtNameClub = "";
      if(p.fullName===undefined) p.fullName = "";
      if(p.fullNameLinked===undefined) p.fullNameLinked = !p.fullName;
      if(p.shirtNameTeamLinked===undefined) p.shirtNameTeamLinked = !p.shirtNameTeam;
      if(p.shirtNameClubLinked===undefined) p.shirtNameClubLinked = !p.shirtNameClub;
      if(p.fullNameLinked) p.fullName = computeDefaultFullName(p);
      if(p.shirtNameTeamLinked) p.shirtNameTeam = computeDefaultShirtNameValue(p);
      if(p.shirtNameClubLinked) p.shirtNameClub = computeDefaultShirtNameValue(p);
      // Si todavía no tiene ninguna nacionalidad ni selección declarada, se asume por default el
      // país de su propia selección — al estar en esa convocatoria, ya cuenta como declarado ahí.
      if(p.nationalityIds.length===0 && p.declaredForCountryId===null){
        const country = DB.countries.find(c=>c.teamLinks && c.teamLinks.absoluta===t.id);
        if(country){ p.nationalityIds = [country.id]; p.declaredForCountryId = country.id; }
      }
    });
    if(needsNumbers) assignSquadNumbers(t);
  });
  if(!DB.sponsorCategories) DB.sponsorCategories = [...SPONSOR_CATEGORIES];
}
