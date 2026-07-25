/* =========================================================
   COPA MANAGER 2026 — datos/historial-copas.js
   Historial de todas las ediciones de la Copa del Mundo (1930 en adelante), en orden ascendente.
   Los nombres son de PAÍSES, no de selecciones: incluyen países ya extintos (Alemania Occidental,
   Checoslovaquia, Yugoslavia, Unión Soviética) que existen en el catálogo de países pero no tienen
   selección activa. 1942 y 1946 aparecen sin datos porque el torneo no se disputó.
   Script CLÁSICO. Cargar DESPUÉS de datos/constantes.js.
   ========================================================= */

const WC_HISTORY_SEED = [
  {year:1930, hosts:["Uruguay"], champion:"Uruguay", runnerUp:"Argentina", third:"Estados Unidos", fourth:"Yugoslavia"},
  {year:1934, hosts:["Italia"], champion:"Italia", runnerUp:"Checoslovaquia", third:"Alemania", fourth:"Austria"},
  {year:1938, hosts:["Francia"], champion:"Italia", runnerUp:"Hungría", third:"Brasil", fourth:"Suecia"},
  {year:1942, hosts:[], champion:"", runnerUp:"", third:"", fourth:""},
  {year:1946, hosts:[], champion:"", runnerUp:"", third:"", fourth:""},
  {year:1950, hosts:["Brasil"], champion:"Uruguay", runnerUp:"Brasil", third:"Suecia", fourth:"España"},
  {year:1954, hosts:["Suiza"], champion:"Alemania Occidental", runnerUp:"Hungría", third:"Austria", fourth:"Uruguay"},
  {year:1958, hosts:["Suecia"], champion:"Brasil", runnerUp:"Suecia", third:"Francia", fourth:"Alemania Occidental"},
  {year:1962, hosts:["Chile"], champion:"Brasil", runnerUp:"Checoslovaquia", third:"Chile", fourth:"Yugoslavia"},
  {year:1966, hosts:["Inglaterra"], champion:"Inglaterra", runnerUp:"Alemania Occidental", third:"Portugal", fourth:"Unión Sovietica"},
  {year:1970, hosts:["México"], champion:"Brasil", runnerUp:"Italia", third:"Alemania Occidental", fourth:"Uruguay"},
  {year:1974, hosts:["Alemania Occidental"], champion:"Alemania Occidental", runnerUp:"Países Bajos", third:"Polonia", fourth:"Brasil"},
  {year:1978, hosts:["Argentina"], champion:"Argentina", runnerUp:"Países Bajos", third:"Brasil", fourth:"Italia"},
  {year:1982, hosts:["España"], champion:"Italia", runnerUp:"Alemania Occidental", third:"Polonia", fourth:"Francia"},
  {year:1986, hosts:["México"], champion:"Argentina", runnerUp:"Alemania Occidental", third:"Francia", fourth:"Bélgica"},
  {year:1990, hosts:["Italia"], champion:"Alemania Occidental", runnerUp:"Argentina", third:"Italia", fourth:"Inglaterra"},
  {year:1994, hosts:["Estados Unidos"], champion:"Brasil", runnerUp:"Italia", third:"Suecia", fourth:"Bulgaria"},
  {year:1998, hosts:["Francia"], champion:"Francia", runnerUp:"Brasil", third:"Croacia", fourth:"Países Bajos"},
  {year:2002, hosts:["Corea del Sur", "Japón"], champion:"Brasil", runnerUp:"Alemania", third:"Turquía", fourth:"Corea del Sur"},
  {year:2006, hosts:["Alemania"], champion:"Italia", runnerUp:"Francia", third:"Alemania", fourth:"Portugal"},
  {year:2010, hosts:["Sudáfrica"], champion:"España", runnerUp:"Países Bajos", third:"Alemania", fourth:"Uruguay"},
  {year:2014, hosts:["Brasil"], champion:"Alemania", runnerUp:"Argentina", third:"Países Bajos", fourth:"Brasil"},
  {year:2018, hosts:["Rusia"], champion:"Francia", runnerUp:"Croacia", third:"Bélgica", fourth:"Inglaterra"},
  {year:2022, hosts:["Catar"], champion:"Argentina", runnerUp:"Francia", third:"Croacia", fourth:"Marruecos"},
  {year:2026, hosts:["Canadá", "Estados Unidos", "México"], champion:"", runnerUp:"", third:"", fourth:""},
  {year:2030, hosts:["España", "Marruecos", "Portugal"], champion:"", runnerUp:"", third:"", fourth:""},
  {year:2034, hosts:["Arabia Saudita"], champion:"", runnerUp:"", third:"", fourth:""}
];

// Países extintos cuya bandera es idéntica a la de un país actual, así que pueden reutilizar su
// archivo: la bandera de Alemania Occidental (1949-1990) es la misma tricolor negra-roja-dorada de
// Alemania, y la de Checoslovaquia (1920-1992) es la que conserva hoy la República Checa.
const EXTINCT_COUNTRY_ISO = {
  "alemania occidental": "de",
  "checoslovaquia": "cz"
};
