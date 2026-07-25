/* =========================================================
   COPA MANAGER 2026 — datos/partidos-numerados.js
   Numeración oficial de los 104 partidos del Mundial (M1–M104). Los 72 de la fase de
   grupos se identifican por grupo + local + visitante; los 32 de eliminación directa ya
   traen su código (M73–M104) en WC26_SCHEDULE_KNOCKOUT, así que aquí sirven de catálogo
   para el editor de árbitros. Script CLÁSICO. Cargar DESPUÉS de datos/constantes.js.
   Formato: [número, grupo o ronda, local, visitante].
   ========================================================= */

const WC26_MATCH_NUMBERS = [
  [1,"A","México","Sudáfrica"],
  [2,"A","Corea del Sur","Chequia"],
  [3,"B","Canadá","Bosnia y Herzegovina"],
  [4,"D","Estados Unidos","Paraguay"],
  [5,"C","Haití","Escocia"],
  [6,"D","Australia","Turquía"],
  [7,"C","Brasil","Marruecos"],
  [8,"B","Catar","Suiza"],
  [9,"E","Costa de Marfil","Ecuador"],
  [10,"E","Alemania","Curazao"],
  [11,"F","Países Bajos","Japón"],
  [12,"F","Suecia","Túnez"],
  [13,"H","Arabia Saudita","Uruguay"],
  [14,"H","España","Cabo Verde"],
  [15,"G","Irán","Nueva Zelanda"],
  [16,"G","Bélgica","Egipto"],
  [17,"I","Francia","Senegal"],
  [18,"I","Irak","Noruega"],
  [19,"J","Argentina","Argelia"],
  [20,"J","Austria","Jordania"],
  [21,"L","Ghana","Panamá"],
  [22,"L","Inglaterra","Croacia"],
  [23,"K","Portugal","RD Congo"],
  [24,"K","Uzbekistán","Colombia"],
  [25,"A","Chequia","Sudáfrica"],
  [26,"B","Suiza","Bosnia y Herzegovina"],
  [27,"B","Canadá","Catar"],
  [28,"A","México","Corea del Sur"],
  [29,"C","Brasil","Haití"],
  [30,"C","Escocia","Marruecos"],
  [31,"D","Turquía","Paraguay"],
  [32,"D","Estados Unidos","Australia"],
  [33,"E","Alemania","Costa de Marfil"],
  [34,"E","Ecuador","Curazao"],
  [35,"F","Países Bajos","Suecia"],
  [36,"F","Túnez","Japón"],
  [37,"H","Uruguay","Cabo Verde"],
  [38,"H","España","Arabia Saudita"],
  [39,"G","Bélgica","Irán"],
  [40,"G","Nueva Zelanda","Egipto"],
  [41,"I","Noruega","Senegal"],
  [42,"I","Francia","Irak"],
  [43,"J","Argentina","Austria"],
  [44,"J","Jordania","Argelia"],
  [45,"L","Inglaterra","Ghana"],
  [46,"L","Panamá","Croacia"],
  [47,"K","Portugal","Uzbekistán"],
  [48,"K","Colombia","RD Congo"],
  [49,"C","Escocia","Brasil"],
  [50,"C","Marruecos","Haití"],
  [51,"B","Suiza","Canadá"],
  [52,"B","Bosnia y Herzegovina","Catar"],
  [53,"A","Chequia","México"],
  [54,"A","Sudáfrica","Corea del Sur"],
  [55,"E","Curazao","Costa de Marfil"],
  [56,"E","Ecuador","Alemania"],
  [57,"F","Japón","Suecia"],
  [58,"F","Túnez","Países Bajos"],
  [59,"D","Turquía","Estados Unidos"],
  [60,"D","Paraguay","Australia"],
  [61,"I","Noruega","Francia"],
  [62,"I","Senegal","Irak"],
  [63,"G","Egipto","Irán"],
  [64,"G","Nueva Zelanda","Bélgica"],
  [65,"H","Cabo Verde","Arabia Saudita"],
  [66,"H","Uruguay","España"],
  [67,"L","Panamá","Inglaterra"],
  [68,"L","Croacia","Ghana"],
  [69,"J","Argelia","Austria"],
  [70,"J","Jordania","Argentina"],
  [71,"K","Colombia","Portugal"],
  [72,"K","RD Congo","Uzbekistán"],
  [73,"16avos","2A","2B"],
  [74,"16avos","1E","3:ABCDF"],
  [75,"16avos","1F","2C"],
  [76,"16avos","1C","2F"],
  [77,"16avos","1I","3:CDFGH"],
  [78,"16avos","2E","2I"],
  [79,"16avos","1A","3:CEFHI"],
  [80,"16avos","1L","3:EHIJK"],
  [81,"16avos","1D","3:BEFIJ"],
  [82,"16avos","1G","3:AEHIJ"],
  [83,"16avos","2K","2L"],
  [84,"16avos","1H","2J"],
  [85,"16avos","1B","3:EFGIJ"],
  [86,"16avos","1J","2H"],
  [87,"16avos","1K","3:DEIJL"],
  [88,"16avos","2D","2G"],
  [89,"Octavos","W74","W77"],
  [90,"Octavos","W73","W75"],
  [91,"Octavos","W76","W78"],
  [92,"Octavos","W79","W80"],
  [93,"Octavos","W83","W84"],
  [94,"Octavos","W81","W82"],
  [95,"Octavos","W86","W88"],
  [96,"Octavos","W85","W87"],
  [97,"Cuartos","W89","W90"],
  [98,"Cuartos","W93","W94"],
  [99,"Cuartos","W91","W92"],
  [100,"Cuartos","W95","W96"],
  [101,"Semifinal","W97","W98"],
  [102,"Semifinal","W99","W100"],
  [103,"3er puesto","L101","L102"],
  [104,"Final","W101","W102"]
];

// Variantes de nombre de una misma selección (lista numerada, calendario semilla y catálogo de la
// app no siempre coinciden). Cada variante se lleva a un mismo texto canónico para que el número de
// partido se encuentre venga de donde venga el nombre.
const MATCH_TEAM_ALIASES = {
  "rd congo":"congo rd", "republica democratica del congo":"congo rd", "congo rd":"congo rd",
  "chequia":"chequia", "republica checa":"chequia",
  "corea del sur":"corea del sur", "republica de corea":"corea del sur",
  "estados unidos":"estados unidos", "eeuu":"estados unidos",
  "bosnia y herzegovina":"bosnia y herzegovina", "bosnia herzegovina":"bosnia y herzegovina"
};

// Índice "grupo|local|visitante" (normalizado) -> número de partido. Se construye la PRIMERA vez que
// se usa, no al cargar el archivo: normLoose vive en core/utilidades.js, que se carga después de datos/.
let _wc26MatchNumberIndex = null;
function matchNumberKey(group, home, away){
  const nz = (s)=>{ const k = normLoose(s||""); return MATCH_TEAM_ALIASES[k] || k; };
  return `${normLoose(group||"")}|${nz(home)}|${nz(away)}`;
}
function wc26MatchNumberIndex(){
  if(!_wc26MatchNumberIndex){
    _wc26MatchNumberIndex = {};
    WC26_MATCH_NUMBERS.forEach(([n,g,h,a])=>{ _wc26MatchNumberIndex[matchNumberKey(g,h,a)] = n; });
  }
  return _wc26MatchNumberIndex;
}
// Número oficial de un partido de la fase de grupos (null si no está en la lista).
function matchNumberFor(group, home, away){
  return wc26MatchNumberIndex()[matchNumberKey(group, home, away)] || null;
}

// Etiqueta legible de un partido para el editor de árbitros: "M12 · A · México vs Sudáfrica".
function matchNumberLabel(n){
  const row = WC26_MATCH_NUMBERS.find(r=>r[0]===n);
  if(!row) return `M${n}`;
  return `M${row[0]} · ${row[1]} · ${row[2]} vs ${row[3]}`;
}
