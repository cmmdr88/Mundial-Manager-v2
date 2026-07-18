/* =========================================================
   COPA MANAGER 2026 — nucleo/modelo-db.js
   Núcleo — modelo de datos: la variable global DB, su constructor por defecto
   (buildDefaultDB, que orquesta los buildDefault* de cada módulo) y el accesor
   de entidad por id (getTeam, sobre DB.teams/DB.clubsData; reasignado desde
   selecciones — decisión arquitectónica aprobada). Extracción mecánica: texto y
   orden idénticos al original. Script CLÁSICO (no module). Cargar DESPUÉS de
   core/utilidades.js (uid, colorsFor, _seedCounter) y de todos los módulos que
   aportan buildDefault* (constantes, confederaciones, estadios, modelo-kits,
   paises, clubes, evento…), y ANTES del <script> inline. buildDefaultDB usa, en
   tiempo de ejecución (init), SEED_TEAMS —que permanece en el inline, reservado a
   datos/semillas-equipos.js (paso 3)— y todos los buildDefault*. _seedCounter vive
   en utilidades (no se movió). Consumido por todos los módulos (leen/escriben DB)
   y por el núcleo (loadDB/import/migración/init asignan DB; router/acciones usan
   getTeam).
   ========================================================= */

function buildDefaultDB(){
  const teams = SEED_TEAMS.map(([name,conf,group,host,players])=>{
    const [c1,c2] = colorsFor(name, conf);
    const fifaCode = (FIFA_CODES[name] || initials(name)).slice(0,3).toUpperCase();
    const team = {
      id: uid(),
      officialName: (OFFICIAL_NAMES[name] || name),
      commonName: name.slice(0,50),
      shortName: name.slice(0,30),
      fifaCode,
      iocCode: null,
      federationName: FEDERATION_NAMES[name] || null,
      federationAbbr: FEDERATION_ABBR[name] || null,
      nicknames: NICKNAMES[name] ? NICKNAMES[name].map(n=>({...n})) : [],
      conf, group, host,
      color1:c1, color2:c2,
      awayColor1: shiftColor(c2, 60), awayColor2: shiftColor(c1, -20),
      kitSponsor: KIT_SPONSORS[name] || null,
      logoImg: null, kitHomeImg: null, kitAwayImg: null,
      fifaPoints: fifaRankingFor(fifaCode).points,
      eloRating: ELO_RATING[name] ?? null,
      players: players
    };
    assignSquadNumbers(team);
    return team;
  });

  const clubSet = new Set();
  teams.forEach(t=> t.players.forEach(p=>{ if(p.club) clubSet.add(p.club); }));

  const countries = buildDefaultCountries(teams);
  integrateTeamsFromCountries(teams, countries);

  return {
    version:2,
    nextIdSeed:_seedCounter,
    teams,
    confederations: buildDefaultConfederations(),
    stadiums: buildDefaultStadiums(),
    kitBases: buildDefaultKitBases(),
    kitTexture: KIT_TEXTURE_DEFAULT,
    kitTextureBack: KIT_TEXTURE_BACK_DEFAULT,
    gkTexture: KIT_GK_TEXTURE_DEFAULT,
    gkTextureBack: KIT_GK_TEXTURE_BACK_DEFAULT,
    shortsBases: buildDefaultShortsBases(),
    shortsTexture: SHORTS_TEXTURE_DEFAULT,
    socksBases: buildDefaultSocksBases(),
    socksTexture: SOCKS_TEXTURE_DEFAULT,
    numberFonts: buildDefaultNumberFonts(),
    backBases: buildDefaultBackBases(),
    countries,
    fifa: buildDefaultFifa(),
    strings: {},
    clubs: [...clubSet].sort(),
    clubsData: buildDefaultClubsData([...clubSet]),
    leagues: buildDefaultLeagues([...clubSet]),
    brands: [...new Set([...APPAREL_BRANDS, ...Object.values(KIT_SPONSORS)])],
    sponsorCategories: [...SPONSOR_CATEGORIES],
    sponsors:[
      {id:uid(), name:"Aguamarca", category:"Bebidas", value:80, teamId:null},
      {id:uid(), name:"VoltCell Energía", category:"Tecnología", value:150, teamId:null},
      {id:uid(), name:"Tres Estrellas Seguros", category:"Seguros", value:45, teamId: teams[0] ? teams[0].id : null},
    ],
    media:[
      {id:uid(), name:"Canal Estadio", type:"TV abierta", country:"Internacional", reach:62},
      {id:uid(), name:"RadioGol AM", type:"Radio", country:"Internacional", reach:24},
      {id:uid(), name:"PlayDeportes+", type:"Streaming", country:"Internacional", reach:38},
    ],
    event: buildDefaultEvent(),
    fixtures:[],
    meta:{ createdNote:true }
  };
}

let DB = null;

function getTeam(id){ return DB.teams.find(t=>t.id===id) || (DB.clubsData && DB.clubsData.find(c=>c.id===id)); }
