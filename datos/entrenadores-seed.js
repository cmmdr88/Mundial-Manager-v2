/* =========================================================
   COPA MANAGER 2026 — datos/entrenadores-seed.js
   Semilla de entrenadores importada desde ENTRENADORES.xlsx (Hoja1). Cada entrada se
   engancha a la selección indicada en "seleccion" (team.coaches del equipo cuyo país
   coincide), con la nacionalidad, el rating, el rating potencial y el puesto del archivo.
   La resolución de país es tolerante a acentos (normLoose) y usa COACH_SEED_COUNTRY_ALIAS
   para los nombres abreviados/con typo del archivo. La aplica applyCoachSeed(), llamada
   UNA sola vez desde migrateDB() mediante el flag DB._coachSeedV1Applied (mismo patrón que
   _eloSeedV5Applied, etc.), así que respeta ediciones posteriores y no duplica.
   Script CLÁSICO. Cargar después de datos/constantes.js; usa en tiempo de ejecución
   normLoose, newId, findOrCreateCountryByName, buildMinimalTeamFromCountry,
   computeDefaultFullName, playerDisplayName y DB.
   ========================================================= */

// Nombres del archivo que no coinciden por acento/normalización con los de la base:
const COACH_SEED_COUNTRY_ALIAS = {
  "RD Congo": "República Democrática del Congo",
  "Chequia": "República Checa",
  "Estads Unidos": "Estados Unidos",
  "Greacia": "Grecia"
};

const COACH_SEED = [
  {firstName:"Dick", lastName:"Advocaat", commonName:"", fullName:"Dirk Nicolaas Advocaat", birthDate:"1947-09-27", nationality:"Países Bajos", role:"Entrenador del primer equipo", seleccion:"Curazao", club:"", rating:79, ratingPotential:79},
  {firstName:"Javier", lastName:"Aguirre", commonName:"", fullName:"Javier Aguirre Onaindía", birthDate:"1958-12-01", nationality:"México", role:"Entrenador del primer equipo", seleccion:"México", club:"", rating:83, ratingPotential:83},
  {firstName:"Gustavo", lastName:"Alfaro", commonName:"", fullName:"Gustavo Julio Alfaro", birthDate:"1962-08-14", nationality:"Argentina", role:"Entrenador del primer equipo", seleccion:"Paraguay", club:"", rating:82, ratingPotential:82},
  {firstName:"Carlo", lastName:"Ancelotti", commonName:"", fullName:"", birthDate:"1959-06-10", nationality:"Italia", role:"Entrenador del primer equipo", seleccion:"Brasil", club:"", rating:93, ratingPotential:93},
  {firstName:"Graham", lastName:"Arnold", commonName:"", fullName:"Graham James Arnold", birthDate:"1963-08-03", nationality:"Australia", role:"Entrenador del primer equipo", seleccion:"Irak", club:"", rating:78, ratingPotential:78},
  {firstName:"Sergej", lastName:"Barbarez", commonName:"", fullName:"", birthDate:"1971-09-17", nationality:"Bosnia y Herzegovina", role:"Entrenador del primer equipo", seleccion:"Bosnia y Herzegovina", club:"", rating:74, ratingPotential:77},
  {firstName:"Darren", lastName:"Bazeley", commonName:"", fullName:"Darren Shaun Bazeley", birthDate:"1972-10-05", nationality:"Inglaterra", role:"Entrenador del primer equipo", seleccion:"Nueva Zelanda", club:"", rating:73, ratingPotential:76},
  {firstName:"Sebastián", lastName:"Beccacece", commonName:"", fullName:"Sebastián Andrés Beccacece", birthDate:"1980-12-17", nationality:"Argentina", role:"Entrenador del primer equipo", seleccion:"Ecuador", club:"", rating:78, ratingPotential:83},
  {firstName:"Marcelo", lastName:"Bielsa", commonName:"", fullName:"Marcelo Alberto Bielsa Caldera", birthDate:"1955-07-21", nationality:"Argentina", role:"Entrenador del primer equipo", seleccion:"Uruguay", club:"", rating:89, ratingPotential:89},
  {firstName:"Hugo", lastName:"Broos", commonName:"", fullName:"Hugo Henri Broos", birthDate:"1952-04-10", nationality:"Belgica", role:"Entrenador del primer equipo", seleccion:"Sudafrica", club:"", rating:82, ratingPotential:82},
  {firstName:"Pedro", lastName:"Leitão Brito", commonName:"Bubista", fullName:"", birthDate:"1970-01-06", nationality:"Cabo Verde", role:"Entrenador del primer equipo", seleccion:"Cabo Verde", club:"", rating:77, ratingPotential:80},
  {firstName:"Fabio", lastName:"Cannavaro", commonName:"", fullName:"", birthDate:"1973-09-13", nationality:"Italia", role:"Entrenador del primer equipo", seleccion:"Uzbekistan", club:"", rating:78, ratingPotential:81},
  {firstName:"Thomas", lastName:"Christiansen", commonName:"", fullName:"Thomas Christiansen Tarín", birthDate:"1973-03-11", nationality:"España", role:"Entrenador del primer equipo", seleccion:"Panama", club:"", rating:79, ratingPotential:81},
  {firstName:"Steve", lastName:"Clarke", commonName:"", fullName:"", birthDate:"1963-08-29", nationality:"Escocia", role:"Entrenador del primer equipo", seleccion:"Escocia", club:"", rating:81, ratingPotential:81},
  {firstName:"Zlatko", lastName:"Dalić", commonName:"", fullName:"", birthDate:"1966-10-26", nationality:"Croacia", role:"Entrenador del primer equipo", seleccion:"Croacia", club:"", rating:87, ratingPotential:87},
  {firstName:"Sébastien", lastName:"Desabre", commonName:"", fullName:"Sébastien Serge Louis Desabre", birthDate:"1976-08-02", nationality:"Francia", role:"Entrenador del primer equipo", seleccion:"RD Congo", club:"", rating:77, ratingPotential:80},
  {firstName:"Didier", lastName:"Deschamps", commonName:"", fullName:"Didier Claude Deschamps", birthDate:"1968-10-15", nationality:"Francia", role:"Entrenador del primer equipo", seleccion:"Francia", club:"", rating:91, ratingPotential:91},
  {firstName:"Georgios", lastName:"Donis", commonName:"", fullName:"", birthDate:"1969-10-22", nationality:"Greacia", role:"Entrenador del primer equipo", seleccion:"Arabia Saudita", club:"", rating:77, ratingPotential:78},
  {firstName:"Emerse", lastName:"Faé", commonName:"", fullName:"", birthDate:"1984-01-24", nationality:"Costa de Marfil", role:"Entrenador del primer equipo", seleccion:"Costa de Marfil", club:"", rating:79, ratingPotential:85},
  {firstName:"Luis", lastName:"de la Fuente", commonName:"", fullName:"Luis de la Fuente Castillo", birthDate:"1961-06-21", nationality:"España", role:"Entrenador del primer equipo", seleccion:"España", club:"", rating:88, ratingPotential:89},
  {firstName:"Rudi", lastName:"Garcia", commonName:"", fullName:"Rudi José Garcia", birthDate:"1964-02-20", nationality:"Francia", role:"Entrenador del primer equipo", seleccion:"Belgica", club:"", rating:81, ratingPotential:82},
  {firstName:"Amir", lastName:"Ghalenoei", commonName:"", fullName:"Ardashir Amir Ghalenoei", birthDate:"1963-11-22", nationality:"Iran", role:"Entrenador del primer equipo", seleccion:"Iran", club:"", rating:78, ratingPotential:79},
  {firstName:"Hossam", lastName:"Hassan", commonName:"", fullName:"Hossam Hassan Hassanein Hassan", birthDate:"1966-08-10", nationality:"Egipto", role:"Entrenador del primer equipo", seleccion:"Egipto", club:"", rating:77, ratingPotential:79},
  {firstName:"Myung-bo", lastName:"Hong", commonName:"", fullName:"", birthDate:"1969-02-12", nationality:"Corea del Sur", role:"Entrenador del primer equipo", seleccion:"Corea del Sur", club:"", rating:78, ratingPotential:80},
  {firstName:"Ronald", lastName:"Koeman", commonName:"", fullName:"", birthDate:"1963-03-21", nationality:"Países Bajos", role:"Entrenador del primer equipo", seleccion:"Países Bajos", club:"", rating:85, ratingPotential:85},
  {firstName:"Miroslav", lastName:"Koubek", commonName:"", fullName:"", birthDate:"1951-09-01", nationality:"Chequia", role:"Entrenador del primer equipo", seleccion:"Chequia", club:"", rating:77, ratingPotential:77},
  {firstName:"Sabri", lastName:"Lamouchi", commonName:"", fullName:"", birthDate:"1971-11-09", nationality:"Francia", role:"Entrenador del primer equipo", seleccion:"Tunez", club:"", rating:78, ratingPotential:80},
  {firstName:"Julen", lastName:"Lopetegui", commonName:"", fullName:"Julen Lopetegui Argote", birthDate:"1966-08-28", nationality:"España", role:"Entrenador del primer equipo", seleccion:"Catar", club:"", rating:82, ratingPotential:83},
  {firstName:"Néstor", lastName:"Lorenzo", commonName:"", fullName:"Néstor Gabriel Lorenzo", birthDate:"1966-02-26", nationality:"Argentina", role:"Entrenador del primer equipo", seleccion:"Colombia", club:"", rating:83, ratingPotential:85},
  {firstName:"Jesse", lastName:"Marsch", commonName:"", fullName:"", birthDate:"1973-11-08", nationality:"Estados Unidos", role:"Entrenador del primer equipo", seleccion:"Canada", club:"", rating:81, ratingPotential:84},
  {firstName:"Roberto", lastName:"Martínez", commonName:"", fullName:"Roberto Martínez Montoliu", birthDate:"1973-07-13", nationality:"España", role:"Entrenador del primer equipo", seleccion:"Portugal", club:"", rating:87, ratingPotential:87},
  {firstName:"Sébastien", lastName:"Migné", commonName:"", fullName:"Sébastien Bernard Henri Clément Migné", birthDate:"1972-11-30", nationality:"Francia", role:"Entrenador del primer equipo", seleccion:"Haiti", club:"", rating:73, ratingPotential:76},
  {firstName:"Vincenzo", lastName:"Montella", commonName:"", fullName:"", birthDate:"1974-06-18", nationality:"Italia", role:"Entrenador del primer equipo", seleccion:"Turquia", club:"", rating:82, ratingPotential:83},
  {firstName:"Hajime", lastName:"Moriyasu", commonName:"", fullName:"", birthDate:"1968-08-23", nationality:"Japon", role:"Entrenador del primer equipo", seleccion:"Japon", club:"", rating:83, ratingPotential:84},
  {firstName:"Julian", lastName:"Nagelsmann", commonName:"", fullName:"", birthDate:"1987-07-23", nationality:"Alemania", role:"Entrenador del primer equipo", seleccion:"Alemania", club:"", rating:89, ratingPotential:92},
  {firstName:"Mohamed", lastName:"Ouahbi", commonName:"", fullName:"", birthDate:"1976-09-07", nationality:"Belgica", role:"Entrenador del primer equipo", seleccion:"Marruecos", club:"", rating:75, ratingPotential:82},
  {firstName:"Vladimir", lastName:"Petković", commonName:"", fullName:"", birthDate:"1963-08-15", nationality:"Bosnia y Herzegovina", role:"Entrenador del primer equipo", seleccion:"Argelia", club:"", rating:81, ratingPotential:81},
  {firstName:"Mauricio", lastName:"Pochettino", commonName:"", fullName:"Mauricio Roberto Pochettino Trossero", birthDate:"1972-03-02", nationality:"Argentina", role:"Entrenador del primer equipo", seleccion:"Estads Unidos", club:"", rating:87, ratingPotential:88},
  {firstName:"Tony", lastName:"Popovic", commonName:"", fullName:"", birthDate:"1973-07-04", nationality:"Australia", role:"Entrenador del primer equipo", seleccion:"Australia", club:"", rating:78, ratingPotential:81},
  {firstName:"Graham", lastName:"Potter", commonName:"", fullName:"Graham Stephen Potter", birthDate:"1975-05-20", nationality:"Inglaterra", role:"Entrenador del primer equipo", seleccion:"Suecia", club:"", rating:82, ratingPotential:85},
  {firstName:"Carlos", lastName:"Queiroz", commonName:"", fullName:"Carlos Manuel Brito Leal de Queiroz", birthDate:"1953-03-01", nationality:"Portugal", role:"Entrenador del primer equipo", seleccion:"Ghana", club:"", rating:84, ratingPotential:84},
  {firstName:"Ralf", lastName:"Rangnick", commonName:"", fullName:"Ralf Dietrich Rangnick", birthDate:"1958-06-29", nationality:"Alemania", role:"Entrenador del primer equipo", seleccion:"Austria", club:"", rating:86, ratingPotential:86},
  {firstName:"Lionel", lastName:"Scaloni", commonName:"", fullName:"Lionel Sebastián Scaloni", birthDate:"1978-05-16", nationality:"Argentina", role:"Entrenador del primer equipo", seleccion:"Argentina", club:"", rating:91, ratingPotential:92},
  {firstName:"Jamal", lastName:"Sellami", commonName:"", fullName:"", birthDate:"1970-10-06", nationality:"Marruecos", role:"Entrenador del primer equipo", seleccion:"Jordania", club:"", rating:76, ratingPotential:78},
  {firstName:"Ståle", lastName:"Solbakken", commonName:"", fullName:"", birthDate:"1968-02-27", nationality:"Noruega", role:"Entrenador del primer equipo", seleccion:"Noruega", club:"", rating:81, ratingPotential:82},
  {firstName:"Pape", lastName:"Thiaw", commonName:"", fullName:"Pape Bouna Thiaw", birthDate:"1981-02-05", nationality:"Senegal", role:"Entrenador del primer equipo", seleccion:"Senegal", club:"", rating:77, ratingPotential:82},
  {firstName:"Thomas", lastName:"Tuchel", commonName:"", fullName:"", birthDate:"1973-08-29", nationality:"Alemania", role:"Entrenador del primer equipo", seleccion:"Inglaterra", club:"", rating:90, ratingPotential:91},
  {firstName:"Murat", lastName:"Yakin", commonName:"", fullName:"", birthDate:"1974-09-15", nationality:"Suiza", role:"Entrenador del primer equipo", seleccion:"Suiza", club:"", rating:82, ratingPotential:83},
];

// Variantes de nombre de selección para emparejar aunque la base use el nombre corto/otra grafía.
// El emparejamiento principal es por código FIFA (infalible); esto es un respaldo por nombre.
const COACH_SEED_TEAM_NAME_VARIANTS = {
  "República Democrática del Congo": ["RD Congo","RD del Congo","R.D. Congo","DR Congo","Congo RD","Congo DR","Congo-Kinshasa","Congo Kinshasa"],
  "República Checa": ["Chequia","Czechia"],
  "Estados Unidos": ["EE.UU.","EEUU","USA","Estados Unidos de América"]
};

// Resuelve un nombre de país (de la semilla) al id del país en la base. IMPORTANTE: primero intenta
// el nombre TAL CUAL (tolerante a acentos); solo si no existe usa el alias. Así, si la base ya llama
// a la selección "RD Congo", empareja con esa y NO crea "República Democrática del Congo" duplicada.
function coachSeedResolveCountryId(name){
  name = (name||"").trim();
  if(!name) return null;
  const match = (n)=>{ const k=normLoose(n); return DB.countries.find(c=>normLoose(c.commonName)===k); };
  // 1) nombre exacto del archivo
  let hit = match(name);
  // 2) alias (solo si el nombre crudo no existía)
  if(!hit && COACH_SEED_COUNTRY_ALIAS[name]) hit = match(COACH_SEED_COUNTRY_ALIAS[name]);
  if(hit) return hit.id;
  // 3) último recurso: crear (con el nombre canónico preferido)
  return findOrCreateCountryByName(COACH_SEED_COUNTRY_ALIAS[name] || name);
}

// Encuentra la selección EXISTENTE para un país: 1) vínculo país↔selección, 2) por código FIFA,
// 3) por nombre (commonName del país, nombre crudo del archivo, o variantes conocidas). NO crea
// selecciones nuevas — si no la encuentra devuelve null y el entrenador simplemente se omite.
// `excludeIds` permite ignorar selecciones fantasma durante la reparación.
function coachSeedFindTeam(countryId, rawSelName, excludeIds){
  excludeIds = excludeIds || new Set();
  if(!countryId) return null;
  const co = DB.countries.find(c=>c.id===countryId);
  if(!co) return null;
  const ok = t => t && !excludeIds.has(t.id);
  // 1) vínculo explícito
  const tid = co.teamLinks && co.teamLinks.absoluta;
  let team = tid ? DB.teams.find(t=>t.id===tid) : null;
  if(ok(team)) return team;
  // 2) por código FIFA
  if(co.fifaCode){
    team = DB.teams.find(t=>ok(t) && t.fifaCode && t.fifaCode.toUpperCase()===co.fifaCode.toUpperCase());
    if(team) return team;
  }
  // 3) por nombre / variantes
  const variants = new Set([co.commonName, rawSelName].filter(Boolean).map(normLoose));
  (COACH_SEED_TEAM_NAME_VARIANTS[co.commonName]||[]).forEach(v=>variants.add(normLoose(v)));
  team = DB.teams.find(t=>ok(t) && variants.has(normLoose(t.commonName)));
  return team || null;
}

// Aplica la semilla: engancha cada entrenador a la selección EXISTENTE de su columna "seleccion".
// Idempotente por equipo (no re-agrega si ya existe uno con el mismo nombre mostrado).
function applyCoachSeed(){
  let added = 0;
  for(const s of COACH_SEED){
    const selCountryId = coachSeedResolveCountryId(s.seleccion);
    const team = coachSeedFindTeam(selCountryId, s.seleccion);
    if(!team) continue;
    if(!Array.isArray(team.coaches)) team.coaches = [];
    const natId = s.nationality ? coachSeedResolveCountryId(s.nationality) : null;
    const base = {firstName:s.firstName||"", lastName:s.lastName||"", commonName:s.commonName||""};
    const displayKey = normLoose((s.commonName||"") || (s.fullName||"") || `${s.firstName||""} ${s.lastName||""}`);
    if(team.coaches.some(c=>normLoose(playerDisplayName(c))===displayKey)) continue;
    const hasFull = !!(s.fullName && s.fullName.trim());
    team.coaches.push({
      id: newId("c"),
      firstName: base.firstName, lastName: base.lastName, commonName: base.commonName,
      fullName: hasFull ? s.fullName.trim() : computeDefaultFullName(base),
      fullNameLinked: !hasFull,
      birthDate: s.birthDate || null,
      rating: (s.rating!=null ? Math.max(0,Math.min(99, Math.round(s.rating))) : 70),
      ratingPotential: (s.ratingPotential!=null ? Math.max(0,Math.min(99, Math.round(s.ratingPotential))) : null),
      nationalityIds: natId ? [natId] : [],
      photo: null,
      contractCountryId: selCountryId,
      contractClub: s.club || "",
      contractRole: s.role || ""
    });
    added++;
  }
  return added;
}

// Reparación de una sola vez para bases donde la versión anterior de la semilla creó selecciones
// "fantasma" (mínimas, con el nombre largo del país) en vez de usar la selección existente
// (p. ej. Sébastien Desabre quedó en una "República Democrática del Congo" nueva en lugar de la
// selección de RD Congo ya presente). Reubica a cada entrenador de la semilla en su selección real
// (emparejada por vínculo/código FIFA/variantes de nombre) y elimina la selección fantasma vacía.
function repairCoachSeedPlacement(){
  const keyOf = c => normLoose(c.lastName||"") + "|" + (c.birthDate||"");
  const seedKeys = new Set(COACH_SEED.map(s=>normLoose(s.lastName||"") + "|" + (s.birthDate||"")));
  const countryNames = new Set(DB.countries.map(c=>normLoose(c.commonName)));

  // Detecta selecciones fantasma ANTES de mover: sin jugadores, con nombre EXACTO de un país, y cuyos
  // entrenadores son todos de la semilla. Así la eliminación queda acotada a lo que creó la semilla.
  const phantomIds = new Set();
  DB.teams.forEach(t=>{
    if(t.players && t.players.length) return;
    if(!countryNames.has(normLoose(t.commonName))) return;
    const coaches = t.coaches || [];
    if(coaches.length>0 && coaches.every(c=>seedKeys.has(keyOf(c)))) phantomIds.add(t.id);
  });
  if(phantomIds.size===0) return 0; // nada que reparar

  let moved = 0;
  for(const s of COACH_SEED){
    const countryId = coachSeedResolveCountryId(s.seleccion);
    const correct = coachSeedFindTeam(countryId, s.seleccion, phantomIds); // excluye fantasmas
    if(!correct) continue;
    if(!Array.isArray(correct.coaches)) correct.coaches = [];
    const k = normLoose(s.lastName||"") + "|" + (s.birthDate||"");
    for(const t of DB.teams){
      if(t===correct || !Array.isArray(t.coaches)) continue;
      for(let i=t.coaches.length-1;i>=0;i--){
        if(keyOf(t.coaches[i])===k){
          const [coach] = t.coaches.splice(i,1);
          coach.contractCountryId = countryId;
          if(correct.coaches.some(c=>keyOf(c)===k)) { /* ya existe: se descarta el duplicado */ }
          else { correct.coaches.push(coach); moved++; }
        }
      }
    }
    // Reapunta el vínculo país↔selección a la selección correcta si apuntaba a una fantasma o faltaba.
    const co = DB.countries.find(c=>c.id===countryId);
    if(co){
      if(!co.teamLinks) co.teamLinks = {absoluta:null};
      if(!co.teamLinks.absoluta || phantomIds.has(co.teamLinks.absoluta)) co.teamLinks.absoluta = correct.id;
    }
  }
  // Elimina las selecciones fantasma que quedaron vacías (sin jugadores y sin entrenadores).
  DB.teams = DB.teams.filter(t=>!(phantomIds.has(t.id) && (!t.players||!t.players.length) && (!t.coaches||!t.coaches.length)));
  return moved;
}

// Limpieza defensiva de PAÍSES duplicados que una versión previa del resolutor pudo crear al aplicar
// el alias (p. ej. crear "República Democrática del Congo" cuando la base ya tenía "RD Congo"). Solo
// actúa sobre el caso preciso: existe un país "fantasma" con el NOMBRE del alias, SIN código FIFA y SIN
// selección ligada, Y existe el país real con el nombre de la clave del alias. Reapunta referencias
// (contractCountryId y nacionalidades de entrenadores y jugadores) del fantasma al real y lo elimina.
// No toca duplicados ajenos (Camboya/República Jemer, Singapur, etc.) ni "República del Congo" (CGO).
function mergeSeedPhantomCountries(){
  let merged = 0;
  for(const rawKey of Object.keys(COACH_SEED_COUNTRY_ALIAS)){
    const aliasVal = COACH_SEED_COUNTRY_ALIAS[rawKey];
    const phantom = DB.countries.find(c=>
      normLoose(c.commonName)===normLoose(aliasVal) &&
      !c.fifaCode &&
      !(c.teamLinks && c.teamLinks.absoluta));
    const real = DB.countries.find(c=> normLoose(c.commonName)===normLoose(rawKey));
    if(!phantom || !real || phantom.id===real.id) continue;
    const oldId = phantom.id, newId2 = real.id;
    // Reapunta referencias de entrenadores y jugadores.
    DB.teams.forEach(t=>{
      (t.coaches||[]).forEach(c=>{
        if(c.contractCountryId===oldId) c.contractCountryId = newId2;
        if(Array.isArray(c.nationalityIds)) c.nationalityIds = c.nationalityIds.map(x=>x===oldId?newId2:x);
      });
      (t.players||[]).forEach(p=>{
        if(p.declaredForCountryId===oldId) p.declaredForCountryId = newId2;
        if(Array.isArray(p.nationalityIds)) p.nationalityIds = p.nationalityIds.map(x=>x===oldId?newId2:x);
      });
    });
    // Elimina el país fantasma.
    DB.countries = DB.countries.filter(c=>c.id!==oldId);
    merged++;
  }
  return merged;
}
