/* =====================================================================
   COPA MANAGER 2026 — PARTIDOS
   Edita ESTE archivo con cualquier editor de texto (TextEdit, Bloc de notas,
   VS Code…). En Mac: clic derecho sobre el archivo -> Abrir con -> TextEdit,
   o arrástralo a tu editor.

   Escribe tus partidos ENTRE las comillas invertidas ` de abajo.
   NO borres la primera línea  window.PARTIDOS_TXT = `   ni la última  `;
   (esas dos líneas son las que hacen que el juego lo cargue solo, incluso
    abriéndolo con doble clic).

   Reglas:
    - Separa cada partido con un RENGLÓN EN BLANCO.
    - Las líneas que empiezan con # son comentarios (se ignoran).
    - Horarios en HORA LOCAL (no hace falta el uso horario; por ahora no se muestra).
    - Partido FUTURO (no jugado): sin marcador -> "México - Serbia".
    - Puedes organizar por selección: pon el nombre del país en su propio
      renglón (con renglón en blanco antes y después) como separador.
    - Si el mismo partido está en las dos listas, se agrega una sola vez.
    - Los amistosos salen SOLO de este archivo (los precargados se quitan).
    - Jugador, árbitro, estadio o ciudad que no exista, se agrega solo
      (los jugadores nuevos entran como NO convocados de su selección).

   Códigos de incidencia:  Gol Codigo Jugador Minuto’ (Modificador)
    - El CÓDIGO (BRA, PAN…) es SIEMPRE el equipo al que le SUBE el gol al marcador.
    - Gol            -> gol normal.
    - (PEN)          -> gol de penal.  Ej: Gol BRA Vinicius 55’ (PEN)
    - (GEC)          -> AUTOGOL. El código es el equipo al que le cuenta (el que anota),
                       pero el JUGADOR es del equipo CONTRARIO y se muestra de ese lado.
                       Ej: en Brasil vs Panamá, autogol de Matheus Cunha (de Brasil) que
                       le cuenta a Panamá se escribe:  Gol PAN Matheus Cunha 33’ (GEC)
    - Roj            -> tarjeta roja.  Ej: Roj BRA Casemiro 80’
    - Ama            -> tarjeta amarilla. Ej: Ama BRA Casemiro 70’  (solo aparece en la línea de tiempo).

   Alineaciones (para el INFORME de partido, opcionales):
     Ali CODIGO Formacion (Tipo)     <- Tipo: H holding, A attack, D defend, N narrow, W wide
       Nº, Nombre, Posición          <- p. ej.  12, Raúl Rangel, GK
       Nº, Nombre, Posición - Nº, Sustituto Minuto’   <- si hubo cambio: 27, R. Ledezma, RB - 16, J. Garza 66’
     (Se ordenan por posición, de izquierda a derecha. Si el jugador no existe, se crea.)

   Estadísticas del partido (una sola línea, LOCAL primero y luego VISITANTE):
     POS: 57, 43 - TIR: 24, 4 - TPO: 11, 2 - FAL: 7, 11 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 8, 2 - ATA: 2, 7
     (POS posesión %, TIR tiros, TPO tiros a puerta, FAL faltas, AMA amarillas, ROJ rojas,
      ESQ tiros de esquina, ATA atajadas.)

   OJO: los goles deben CUADRAR con el marcador. Un 2-2 necesita 4 goles (normales o
   autogoles) que sumen 2 y 2. Si no cuadran, el juego muestra un aviso para corregirlo.

   Evita escribir el carácter ` o la secuencia ${ dentro de los partidos.
   ===================================================================== */

window.PARTIDOS_TXT = `

# ---- Escribe tus partidos debajo. Ejemplo (quítale los # para activarlo): ----
#
# Amistoso
# 28 mar 2026 · 13:00 UTC−4
# BMO Field, Toronto, Canadá
# Asistencia: 26,328
# Árbitro: Jon Freemon (USA)
# Canadá 2 - Islandia 2
# Gol ICE Orri Óskarsson 9’
# Gol ICE Orri Óskarsson 21’
# Gol CAN Jonathan David 67’
# Gol CAN Jonathan David 76’
# Roj CAN Tajon Buchanan 80’
#
# ---- Ejemplo de partido FUTURO (sin marcador todavía): ----
#
# Amistoso
# 4 jun 2026 · 20:00 UTC−6
# Estadio Nemesio Díez, Toluca, México
# Árbitro: Keylor Herrera (CRC)
# México - Serbia


MÉXICO

Amistoso
México 4 - Islandia 0
25 feb 2026 · 20:00 UTC−6
Clima: 22 °C, Despejado
Estadio Corregidora, Querétaro, México
Asistencia: 34,130
ARB Steven Madrigal (CRC) - AA1 Jeriel Valverde (CRC) - AA2 Luis Granados (CRC) - 4AR Pablo Camacho (CRC)
Incidencias:
Gol MEX Richard Ledezma 22’ - Asi MEX Armando González
Gol MEX Armando González 24’
Gol MEX Jesús Gallardo 59’ - Asi MEX Alexis Gutierrez
Ama ISL Ágúst Þorsteinsson 70’
Ama MEX Jesús Gallardo 86’
Gol MEX Brian Gutiérrez 90+2’ - Asi MEX Alexis Gutierrez
FT 90+4’
Ali MEX 4-3-3 (H)
12, Raúl Rangel, GK (8.0)
23, Jesús Gallardo, LB (C) (8.7)
22, Everardo López, CB (7.0)
3, Israel Reyes, CB (7.7)
27, Richard Ledezma, RB (8.0) - 16, Jesús Garza 66’ (6.5)
6, Érik Lira, CDM (7.6) - 19, Diego Campillo 66’ (6.3)
24, Brian Gutiérrez, CM (8.9)
14, Marcel Ruiz, CM (6.9) - 18, Érick Sánchez 58’ (6.6)
10, Efrain Álvarez, LW (6.9) - 8, Carlos Rodríguez 57’ (6.8)
25, Roberto Alvarado, RW (6.9) - 11, Alexis Gutierrez 57’ (7.1)
13, Armando González, ST (8.5) - 9, Guillermo Martínez 66’ (6.2)
DT, Javier Aguirre
Sub MEX
28, Carlos Acevedo, GK
1, Luis Ángel Malagón, GK
5, Denzell García
4, Víctor Guzmán
Ali ISL 5-4-1
1, Anton Ari Einarsson, GK (6.4)
8, Gudmundur Thórarinsson, LB (5.7) - 3, Baldur Kári Helgason 85’ (SC)
5, Gudmundur Kristjánsson, CB (6.0) - 15, Hans Gudmundsson 63’ (6.1)
4, Damir Muminovic, CB (5.7)
6, Hoskuldur Gunnlaugsson, CB (4.5)
2, Karl Gunnarsson, RB (5.1)
11, Helgi Gudjonsson, LM (6.0) - 18, Hallgrímur Mar Steingrímsson 63’ (6.0)
7, Jóhann Gudmundsson, CM (6.6) - 16, Daníel Hafsteinsson 85’ (SC)
10, Gylfi Sigurdsson, CM (C) (5.8)
17, Ágúst Þorsteinsson, RM (6.4) - 14, Birnir Snær Ingason 77’ (5.7)
9, Emil Atlason, ST (6.0) - 20, Óskar Borgthórsson 63’ (5.9)
DT, Arnar Gunnlaugsson
Sub ISL
13, Haukur Haraldsson
19, Kolbeinn Thordarson
12, Viktor Sigurdsson, GK
POS: 57, 43 - TIR: 24, 4 - TPO: 11, 2 - FAL: 7, 11 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 8, 2 - ATA: 2, 7
Kit MEX J1 C1, P1 C1 - Kit ISL J1 C1, P1 C1 - Kit ARB ConFIFA R2


Amistoso
México 0 - Portugal 0
28 mar 2026 · 20:00 UTC−6
Clima: 15 °C, Despejado
Estadio Banorte, Ciudad de México, México
Asistencia: 84,130
ARB Walter López (GUA) - AA1 Helpys Feliz (DOM) - AA2 Keytzel Corrales (NCA) - 4AR Bryan Loayza (ECU)
Incidencias:
Ama MEX Jesús Gallardo 54’
Ama POR Pedro Neto 54’
FT 90+5’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (7.3)
23, Jesús Gallardo, LB (6.6) - 21, Everardo López 78’ (5.8)
5, Johan Vásquez, CB (6.9)
3, César Montes, CB (C) (6.7)
15, Israel Reyes, RB (7.5)
6, Érik Lira, CDM (6.6) - 26, Armando González 78’ (5.9)
18, Obed Vargas, CM (6.2) - 8, Carlos Rodríguez 45’ (6.3)
19, Álvaro Fidalgo, CM (6.2) - 14, Érick Sánchez 60’ (6.5)
24, Brian Gutiérrez, LW (6.8) - 16, Julián Quiñones 45’ (6.9)
25, Roberto Alvarado, RW (6.6) - 22, Richard Ledezma 60’ (6.3)
9, Raúl Jiménez, ST (6.4) - 7, Germán Berterame 60’ (5.9)
DT, Javier Aguirre
Sub MEX
17, Orbelín Pineda
20, Denzell García
27, Jesús Alberto Angulo
10, Alexis Vega
12, Carlos Acevedo, GK
11, Guillermo Martínez
13, Guillermo Ochoa, GK
2, Jorge Sánchez
Ali POR 4-2-3-1 (W)
1, Rui Silva, GK (7.3)
25, Nuno Mendes, LB (6.3) - 20, João Cancelo 45’ (6.4)
13, Renato Veiga, CB (7.0)
4, António Silva, CB (6.4) - 3, Tomás Araújo 45’ (6.3)
6, Matheus Nunes, RB (6.7) - 2, Diogo Dalot 45’ (6.5)
5, Samú Costa, CDM (7.0) - 23, Vitinha 45’ (7.3)
21, Rúben Neves, CDM (6.5) - 15, João Neves 45’ (6.8)
10, João Félix, LM (6.1) - 7, Gonçalo Guedes 45’ (5.9)
8, Bruno Fernandes, CAM (C) (7.2) - 16, Francisco Trincão 81’ (SC)
26, Francisco Conceição, RM (5.9) - 18, Pedro Neto 45’ (6.9)
9, Gonçalo Ramos, ST (6.8) - 17, Paulinho 64’ (5.9)
DT, Roberto Martínez
Sub POR
1, Ricardo Velho, GK
24, Ricardo Horta
11, Mateus Fernandes
14, Gonçalo Inácio
12, José Sá, GK
19, Pedro Gonçalves
POS: 33, 67 - TIR: 7, 10 - TPO: 1, 2 - FAL: 12, 9 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 0, 4 - ATA: 2, 1
Kit MEX J2 C1, P3 C1 - Kit POR J1 C1, P1 C1 - Kit ARB ConFIFA R1


Amistoso
México 1 - Bélgica 1
31 mar 2026 · 20:00 UTC−5
Clima: 4 °C, Nublado
Soldier Field, Chicago, Estados Unidos
Asistencia: 52,412
ARB Rosendo Mendoza (USA) - AA1 Cory Richardson (USA) - AA2 Nick Uranga (USA) - 4AR Ricardo Montero (CRC) - VAR Jose Carlos Rivero (USA) - AVAR Lukasz Szpala (USA)
Incidencias:
Ama MEX Julián Quiñones 11’
Gol MEX Jorge Sánchez 19’
Ama BEL Timothy Castagne 39’
Gol BEL Dodi Lukébakio 46’ - Asi BEL Youri Tielemans
Ama MEX Jorge Sánchez 64’
Ama BEL Maxim De Cuyper 68’
Ama BEL Arthur Theate 75’
FT 90+5’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (6.0)
23, Jesús Gallardo, LB (7.1)
5, Johan Vásquez, CB (7.6)
3, César Montes, CB (C) (6.5)
2, Jorge Sánchez, RB (8.0) - 15, Israel Reyes 69’ (6.3)
6, Érik Lira, CDM (6.6)
19, Álvaro Fidalgo, CM (6.5) - 18, Obed Vargas 69’ (6.2)
24, Brian Gutiérrez, CM (6.9) - 14, Érick Sánchez 84’ (SC)
16, Julián Quiñones, LW (7.4) - 10, Alexis Vega 69’ (6.0)
17, Orbelín Pineda, RW (6.9) - 25, Roberto Alvarado 69’ (6.3)
9, Raúl Jiménez, ST (6.8) - 26, Armando González 68’ (6.0)
DT, Javier Aguirre
Sub MEX
12, Carlos Acevedo, GK
13, Guillermo Ochoa, GK
21, Everardo López
8, Carlos Rodríguez
20, Denzell García
27, Jesús Alberto Angulo
11, Guillermo Martínez
7, Germán Berterame
22, Richard Ledezma
Ali BEL 4-2-3-1 (W)
13, Matz Sels, GK (6.3)
5, Maxim De Cuyper, LB (6.6) - 22, Alexis Saelemaekers 72’ (6.2)
20, Nathan Ngoy, CB (6.8) - 3, Arthur Theate 72’ (6.6)
16, Koni De Winter, CB (6.7) - 2, Zeno Debast 72’ (6.1)
21, Timothy Castagne, RB (6.1) - 15, Thomas Meunier 63’ (6.5)
6, Axel Witsel, CDM (6.5) - 23, Nicolas Raskin 63’ (6.6)
8, Youri Tielemans, CDM (C) (7.8) - 24, Amadou Onana 63’ (6.6)
26, Mika Godts, LM (6.3) - 11, Jérémy Doku 63’ (6.5)
7, Kevin De Bruyne, CAM (6.3) - 18, Joaquin Seys 72’ (6.4)
14, Dodi Lukébakio, RM (7.0) - 19, Lucas Stassin 72’ (6.2)
9, Loïs Openda, ST (6.0) - 17, Charles De Ketelaere 63’ (7.0)
DT, Rudi Garcia
Sub BEL
1, Senne Lammens, GK
12, Maarten Vandevoordt, GK
25, Nathan De Cat
4, Brandon Mechele
POS: 48, 52 - TIR: 10, 5 - TPO: 3, 2 - FAL: 14, 20 - AMA: 2, 3 - ROJ: 0, 0 - ESQ: 3, 2 - ATA: 1, 2
Kit MEX J2 C3, P3 C1 - Kit BEL J1 C2, P3 C1 - Kit ARB FedUSA R2


Amistoso
México 2 - Ghana 0
22 may 2026 · 20:00 UTC−6
Clima: 17 °C, Parcialmente nublado
Estadio Cuauhtémoc, Puebla, México
Asistencia: 41,235
ARB Selvin Brown (HON) - AA1 Roney Salinas (HON) - AA2 Gerson Orellana (HON) - 4AR José Valladares (HON) - VAR Diego Ojer (GUA) - AVAR Yasith Monge (CRC)
Incidencias:
Gol MEX Brian Gutiérrez 2’
Ama GHA Oscar Naasei Oppong 13’
Gol MEX Guillermo Martínez 54’ - Asi MEX Luis Romo
Ama MEX Mateo Chávez 83’
FT 90+6’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (6.1) - 12, Carlos Acevedo 45’ (6.8)
23, Jesús Gallardo, LB (C) (6.4) - 20, Mateo Chávez 45’ (6.3)
18, Alejandro Gómez, CB (7.0) - 24, Luis Chávez 62’ (6.3)
7, Luis Romo, CB (7.9) - 21, Eduardo Águila 62’ (6.4)
15, Israel Reyes, RB (7.3) - 2, Jorge Sánchez 45’ (7.0)
6, Érik Lira, CDM (7.1) - 16, Luis Gabriel Rey 71’ (6.0)
19, Gilberto Mora, CM (7.7) - 4, Edson Álvarez 45’ (6.1)
26, Brian Gutiérrez, CM (8.3) - 8, Iker Fimbres 71’ (6.0)
10, Alexis Vega, LW (6.9) - 9, Kevin Castañeda 62’ (6.1)
25, Roberto Alvarado, RW (7.6) - 11, Isaías Violante 62’ (6.3)
14, Armando González, ST (6.2) - 22, Guillermo Martínez 45’ (7.2)
DT, Javier Aguirre
Sub MEX
27, Oscar García, GK
13, Guillermo Ochoa, GK
17, Orbelín Pineda
3, César Montes
Ali GHA 4-5-1
16, Benjamin Asare, GK (6.9) - 1, Solomon Agbasi 76’ (6.0)
6, Terry Yegbe, LB (5.9) - 19, Antwi Dacosta 90’ (SC)
15, Nathaniel Adjei, CB (6.5) - 3, David Oduro 90+2’ (SC)
2, Oscar Naasei Oppong, CB (5.4) - 5, Ebenezer Abban 90+2’ (SC)
21, Jan Gyamerah, RB (6.0) - 23, Ebenezer Adade 90’ (SC)
17, Ibrahim Osman, LM (6.2) - 14, Joseph Opoku 75’ (6.1)
13, Daniel Agyei, CM (6.1) - 11, Prince Amoako 66’ (6.3)
18, Emmanuel Agyei, CM (6.3) - 20, Salim Adams 75’ (6.3)
8, Majeed Ashimeru, CM (C) (6.7) - 22, Aziz Issah 75’ (6.5)
7, Jesurun Rak-Sakyi, RM (6.7) - 4, Razak Simpson 66’ (6.4)
9, Felix Afena-Gyan, ST (6.3) - 24, Jerry Afriyie 67’ (6.2)
DT, Desmond Offei (Interino)
POS: 60, 40 - TIR: 16, 7 - TPO: 8, 3 - FAL: 18, 9 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 9, 3 - ATA: 3, 6
Kit MEX J3 C1, P3 C1 - Kit GHA J1 C1, P3 C1 - Kit ARB ConFIFA R2


Amistoso
México 1 - Australia 0
30 may 2026 · 19:00 UTC−7
Clima: 22 °C, Despejado
Rose Bowl, Pasadena, Estados Unidos
Asistencia: 78,479
ARB Rubiel Vásquez (USA) - AA1 Stefan Tanaka-Freundt (CAN) - AA2 Chris Wattam (CAN) - 4AR Ricardo Fierro (USA) - VAR Edvin Jurisevic (USA) - AVAR Timothy Ford (USA)
Incidencias:
Gol MEX Johan Vásquez 27’ - Asi MEX Alexis Vega
Ama AUS Jacob Italiano 32’
Ama MEX César Huerta 52’
FT 90+6’
Ali MEX 4-2-3-1 (W)
1, Raúl Rangel, GK (6.2) - 13, Guillermo Ochoa 45’ (6.7)
20, Mateo Chávez, LB (6.8) - 23, Jesús Gallardo 60’ (6.3)
5, Johan Vásquez, CB (7.9) - 28, Alejandro Gómez 74’ (6.0)
4, Edson Álvarez, CB (C) (7.4) - 3, César Montes 60’ (6.3)
2, Jorge Sánchez, RB (6.7) - 15, Israel Reyes 45’ (7.0)
24, Luis Chávez, CDM (7.0) - 6, Érik Lira 60’ (6.7)
7, Luis Romo, CDM (7.0) - 18, Obed Vargas 74’ (6.1)
10, Alexis Vega, LM (7.8) - 16, Julián Quiñones 60’ (5.7)
8, Álvaro Fidalgo, CAM (6.8) - 19, Gilberto Mora 60’ (6.2)
17, Orbelín Pineda, LM (6.0) - 21, César Huerta 45’ (6.6)
22, Guillermo Martínez, ST (6.1) - 11, Santiago Giménez 45’ (6.5)
DT, Javier Aguirre
Sub MEX
9, Raúl Jiménez
14, Armando González
26, Brian Gutiérrez
27, Kevin Castañeda
12, Carlos Acevedo, GK
Ali AUS 5-4-1
1, Mathew Ryan, GK (C) (6.5)
5, Jordan Bos, LB (6.9) - 16, Aziz Behich 80’ (5.9)
26, Lucas Herrington, CB (6.5) - 21, Cameron Burgess 90’ (SC)
19, Harry Souttar, CB (6.9)
3, Alessandro Circati, CB (7.1)
23, Jacob Italiano, RB (6.2) - 36, Kai Trewin 67’ (6.4)
8, Connor Metcalfe, LM (6.3) - 34, Nishan Velupillay 67’ (6.0)
13, Aiden O'Neill, CM (6.3) - 20, Paul Okon-Engstler 67’ (6.2)
22, Jackson Irvine, CM (6.9) - 38, Awer Mabil 90’ (SC)
7, Mathew Leckie, RM (5.8) - 10, Ajdin Hrustic 67’ (6.3)
9, Mohamed Touré, ST (5.9) - 11, Nestory Irankunda 80’ (5.9)
DT, Tony Popovic
Sub AUS
28, Patrick Beach, GK
6, Martin Boyle
2, Milos Degenek
17, Cameron Devlin
25, Jason Geria
12, Paul Izzo, GK
4, Kye Rowles
POS: 60, 40 - TIR: 13, 7 - TPO: 3, 1 - FAL: 7, 10 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 5, 3 - ATA: 1, 2
Kit MEX J3 C1, P3 C1 - Kit AUS J1 C1, P3 C1 - Kit ARB FedUSA R3


Amistoso
México 5 - Serbia 1
4 jun 2026 · 20:00 UTC−6
Clima: 14 °C, Llovizna
Estadio Nemesio Díez, Toluca, México
Asistencia: 27,163
ARB Keylor Herrera (CRC) - AA1 Danny Sojo (CRC) - AA2 Luis Granados (CRC) - 4AR David Gómez (CRC)
Incidencias:
Ama SRB Vanja Dragojevic 16’
Gol SRB Petar Stanić 19’
Gol MEX Johan Vásquez 34’ - Asi MEX Brian Gutiérrez
Ama MEX Álvaro Fidalgo 43’
Gol MEX Stefan Bukinac 45+3’ (GEC)
Gol MEX Raúl Jiménez 57’
Ama MEX Edson Álvarez 65’
Ama SRB Adem Avdić 68’
Gol MEX Adem Avdić 72’ (GEC)
Gol MEX Luis Chávez 90’
FT 90+1’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (6.0)
23, Jesús Gallardo, LB (5.7) - 7, Luis Romo 72’ (6.1)
5, Johan Vásquez, CB (7.6) - 20, Mateo Chávez 73’ (7.0)
3, César Montes, CB (C) (6.5) - 15, Israel Reyes 59’ (6.5)
2, Jorge Sánchez, RB (6.6)
6, Érik Lira, CDM (6.3) - 4, Edson Álvarez 45’ (6.5)
8, Álvaro Fidalgo, CM (6.9) - 19, Gilberto Mora 59’ (6.5)
26, Brian Gutiérrez, CM (8.3) - 22, Guillermo Martínez 58’ (5.8)
16, Julián Quiñones, LW (7.1) - 10, Alexis Vega 58’ (7.1)
25, Roberto Alvarado, RW (7.5) - 17, Orbelín Pineda 73’ (6.1)
9, Raúl Jiménez, ST (7.9) - 24, Luis Chávez 59’ (7.4)
DT, Javier Aguirre
Sub MEX
13, Guillermo Ochoa, GK
12, Carlos Acevedo, GK
18, Obed Vargas
21, César Huerta
14, Armando González
11, Santiago Giménez
Ali SRB 4-2-3-1 (W)
1, Filip Stankovic, GK (7.4) - 12, Veljko Ilic 61’ (6.0)
25, Stefan Bukinac, LB (4.5) - 15, Adem Avdić 61’ (5.3)
4, Nikola Simić, CB (5.7) - 3, Petar Petrović 75’ (6.2)
16, Strahinja Erakovic, CB (C) (5.0) - 13, Mirko Milikic 79’ (6.2)
26, Vukasin Durdevic, RB (5.3) - 22, Vasilije Kostov 75’ (5.9)
6, Vanja Dragojevic, CDM (5.2) - 5, Njegos Petrovic 61’ (6.3)
10, Aleksandar Stankovic, CDM (5.5) - 2, Ognjen Mimovic 75’ (5.8)
21, Vladimir Lucic, LM (6.3) - 17, Kosta Nedeljkovic 79’ (6.1)
24, Petar Stanic, CAM (7.1) - 8, Dejan Zukic 45’ (6.1)
11, Lazar Randelovic, RM (6.2) - 7, Veljko Birmancevic 45’ (6.3)
18, Nikola Stulic, ST (6.1) - 19, Mihailo Ivanovic 45’ (5.9)
DT, Veljko Paunović
Sub SRB
20, Andrija Maksimovic
23, Luka Lijeskic, GK
POS: 66, 34 - TIR: 17, 3 - TPO: 7, 1 - FAL: 12, 5 - AMA: 2, 2 - ROJ: 0, 0 - ESQ: 6, 1 - ATA: 0, 4
Kit MEX J1 C1, P1 C1 - Kit SRB J2 C2, P1 C1 - Kit ARB ConFIFA R2


--------------------------------------------
CANADÁ

Amistoso
Colombia 0 - Canadá 0
14 oct 2025 · 20:30 UTC−4
Clima: 15 °C, Nublado
Sports Illustrated Stadium, New Jersey, Estados Unidos
Asistencia: 22,000
Árbitro: Guido Gonzales Jr. (USA)
Incidencias:
Ama CAN Richie Laryea 12’
Ama CAN Derek Cornelius 45’
Ama CAN Niko Sigur 77’
FT 90+5’
Ali COL 4-2-3-1 (W)
12, Álvaro Montero, GK
17, Johan Mojica, LB
3, Jhon Lucumí, CB
23, Davinson Sánchez, CB
24, Andres Román, RB
15, Juan Portilla, CDM - 16, Jefferson Lerma 79’
6, Richard Ríos, CDM - 5, Kevin Castaño 78’
7, Luis Díaz, LM (C) - 11, Yáser Asprilla 60’
21, Jáminton Campaz, CAM - 10, James Rodríguez 45’
20, Juan Fernando Quintero, RM - 25, Kevin Serna 60’
14, Cucho Hernández, ST - 19, Rafael Borré 60’
Sub COL
22, Kevin Mier, GK
4, Yerson Mosquera
9, Luis Suárez
18, Johan Carbonero
1, David Ospina, GK
2, Daniel Muñoz
8, Álvaro Angulo
13, Willer Ditta
Ali CAN 4-4-2 (H)
1, Dayne St. Clair, GK
22, Richie Laryea, LB
13, Derek Cornelius, CB
15, Luc de Fougerolles, CB
23, Niko Sigur, RB - 3, Zorhan Bassong 84’
20, Ali Ahmed, LM - 11, Liam Millar 61’
7, Stephen Eustáquio, CDM (C)
8, Ismaël Koné, CDM - 6, Mathieu Choinière 84’
17, Tajon Buchanan, RM - 14, Jacob Shaffelburg 71’
10, Jonathan David, ST
12, Tani Oluwaseyi, ST - 24, Promise David 71’
Sub CAN
4, Kamal Miller
18, Luka Gavran, GK
19, Nathan Saliba
16, Maxime Crépeau, GK
5, Joel Waterman
21, Jonathan Osorio
9, Cyle Larin
25, Jayden Nelson
POS: 60, 40 - TIR: 6, 4 - TPO: 1, 1 - FAL: 20, 18 - AMA: 0, 3 - ROJ: 0, 0 - ESQ: 2, 2 - ATA: 1, 1
Kit COL J1 C4, P1 C1 - Kit CAN J1 C1, P1 C1 - Kit ARB FedUSA R4


Amistoso
Canadá 0 - Ecuador 0
13 nov 2025 · 19:30 UTC−5
Clima: 5 °C, Mayormente despejado
BMO Field, Toronto, Canadá
Asistencia: 28,740
Árbitro: Fernando Hernández (MEX)
Incidencias:
Roj CAN Ali Ahmed 6’ (RD)
Ama CAN Tajon Buchanan 56’
Ama ECU Piero Hincapié 56’
Ama ECU Patrik Mercado 90+3’
Ama ECU Moisés Caicedo 90+4’
FT 90+5’
Ali CAN 4-4-2 (H)
1, Dayne St. Clair, GK
22, Richie Laryea, LB
4, Kamal Miller, CB
5, Joel Waterman, CB
23, Niko Sigur, RB
11, Ali Ahmed, LM
7, Stephen Eustáquio, CDM (C) - 25, Jayden Nelson 85’
8, Ismaël Koné, CDM - 19, Nathan Saliba 79’
17, Tajon Buchanan, RM - 21, Jonathan Osorio 79’
20, Jonathan David, ST - 14, Theo Bair 85’
12, Tani Oluwaseyi, ST - 10, Junior Hoilett 79’
Sub CAN
24, Promise David
13, Derek Cornelius
6, Mathieu Choinière
3, Zorhan Bassong
16, Maxime Crépeau, GK
98, Owen Goodman, GK
Ali ECU 4-4-2 (H)
1, Hernán Galíndez, GK
3, Piero Hincapié, LB (C)
6, Willian Pacho, CB
4, Joel Ordóñez, CB
21, Alan Franco, RB - 7, Jeremy Arévalo 85’
20, Nilson Angulo, LM - 19, Gonzalo Plata 45’
15, Pedro Vite, CDM - 5, Denil Castillo 85’
23, Moisés Caicedo, CDM
9, John Yeboah, RM - 10, Kendry Páez 77’
13, Enner Valencia, ST - 16, Leonardo Campana 90+2’
11, Kevin Rodríguez, ST - 25, Patrik Mercado 77’
Sub ECU
22, Cristian Loor, GK
27, Alan Minda
12, Moisés Ramírez, GK
2, Félix Torres
17, John Mercado
24, Yaimar Medina
26, Léo Realpe
8, Jordy Alcívar
POS: 24, 76 - TIR: 4, 4 - TPO: 1, 0 - FAL: 9, 20 - AMA: 1, 3 - ROJ: 1, 0 - ESQ: 4, 2 - ATA: 0, 1
Kit CAN J1 C1, P3 C1 - Kit ECU J3 C1, P4 C1 - Kit ARB ConCONCACAF R2

Amistoso
Venezuela 0 - Canadá 2
18 nov 2025 · 20:30 UTC−5
Clima: 25 °C, Despejado
Chase Stadium, Fort Lauderdale, Estados Unidos
Asistencia: 4,200
Árbitro: Rubiel Vásquez (USA)
Incidencias:
Gol CAN Ismaël Koné 23’
Ama CAN Stephen Eustáquio 45+1’
Ama VEN David Martínez 50’
Roj VEN David Martínez 57’ (RD)
Roj CAN Ismaël Koné 60’ (RD)
Ama CAN Mathieu Choinière 71’
Gol CAN Promise David 83’ - Asi CAN Niko Sigur
Ama VEN José Hernández 87’
Ama CAN Richie Laryea 88’
Ama CAN Joel Waterman 89’
Ama CAN Promise David 90+1’
FT 90+4’
Ali VEN 4-3-3
12, José Contreras, GK - 1, Wuilker Faríñez 45’
14, Alessandro Milani, LB - 25, Keiber Lamadrid 81’
5, Teo Quintero, CB
2, Nahuel Ferraresi, CB
4, Adrián Cova, RB - 20, Ronald Hernández 81’
10, Telasco Segovia, CM
8, Cristian Cásseres Jr., CM (C)
6, Dani Pereira, CM
7, Gleiker Mendoza, LW - 23, José Hernández 63’
19, Kevin Kelsy, ST - 21, Jesús Ramírez 62’
11, Ender Echenique, RW - 18, David Martínez 31’
Sub VEN
3, Yordan Osorio
26, Bianneider Tamayo
15, Jorge Yriarte
24, Adrian Palacios
9, Alejandro Marqués
16, Carlos Faya
17, Jeferson Caraballo
13, Carlos Vivas
22, Miguel Silva
Ali CAN 4-4-2 (H)
16, Maxime Crépeau, GK
22, Richie Laryea, LB
15, Alfie Jones, CB
13, Derek Cornelius, CB - 5, Joel Waterman 33’
23, Niko Sigur, RB
17, Tajon Buchanan, LM - 21, Jonathan Osorio 75’
7, Stephen Eustáquio, CDM (C) - 19, Nathan Saliba 75’
8, Ismaël Koné, CDM
25, Jayden Nelson, RM - 11, Jacob Shaffelburg 64’
12, Tani Oluwaseyi, ST - 6, Mathieu Choinière 64’
20, Jonathan David, ST - 24, Promise David 75’
Sub CAN
18, Owen Goodman, GK
1, Dayne St. Clair, GK
4, Kamal Miller
3, Zorhan Bassong
14, Theo Bair
POS: 60, 40 - TIR: 10, 8 - TPO: 3, 4 - FAL: 20, 21 - AMA: 2, 5 - ROJ: 1, 1 - ESQ: 2, 3 - ATA: 2, 3
Kit VEN J1 C1, P1 C1 - Kit CAN J2 C1, P2 C1 - Kit ARB FedUSA R2

Amistoso
Canadá 2 - Islandia 2
28 mar 2026 · 13:00 UTC−4
Clima: 0 °C, Nublado
BMO Field, Toronto, Canadá
Asistencia: 26,328
Árbitro: Jon Freemon (USA)
Incidencias:
Gol ISL Orri Óskarsson 9’
Gol ISL Orri Óskarsson 21’ - Asi ISL Mikael Ellertsson
Ama ISL Jon Dagur Thorsteinsson 35’
Gol CAN Jonathan David 67’ (PEN)
Gol CAN Jonathan David 75’ (PEN)
Roj CAN Tajon Buchanan 80’ (RD)
Ama ISL Mikkel Anderson 80’
FT 90+4’
Ali CAN 4-4-2 (H)
1, Dayne St. Clair, GK
22, Richie Laryea, LB
4, Kamal Miller, CB - 13, Derek Cornelius 75’
5, Joel Waterman, CB
23, Niko Sigur, RB
20, Ali Ahmed, LM - 26, Marcelo Flores 63’
6, Mathieu Choinière, CDM - 21, Jonathan Osorio 64’
19, Nathan Saliba, CDM - 3, Ralph Priso 86’
17, Tajon Buchanan, RM
9, Cyle Larin, ST - 24, Daniel Jebbison 64’
7, Jonathan David, ST (C) - 11, Liam Millar 87’
Sub CAN
16, Maxime Crépeau, GK
25, Jacen Russell-Rowe
12, Tani Oluwaseyi
15, Luc de Fougerolles
18, Owen Goodman, GK
14, Aribim Pepple
2, Jahkeele Marshall-Rutty
10, Junior Hoilett
Ali ISL 4-2-3-1
1, Elias Ólafsson, GK
19, Mikael Ellertsson, LB
23, Hördur Magnússon, CB
5, Sverrir Ingason, CB
4, Victor Palsson, RB
8, Ísak Jóhannesson, CDM - 6, Andri Fannar Baldursson 76’
7, Hákon Haraldsson, CDM
20, Kristian Hlynsson, LM - 14, Kristall Máni Ingason 68’
22, Brynjólfur Willumsson, CAM
11, Jon Dagur Thorsteinsson, RM - 18, Mikkel Anderson 76’
9, Orri Óskarsson, ST (C) - 16, Stefán Teitur Thórdarson 68’
Sub ISL
21, Arnór Sigurdsson
10, Gylfi Sigurdsson
3, Hjörtur Hermannsson
17, Aron Gunnarsson
12, Hákon Valdimarsson, GK
2, Logi Tomasson
15, Dagur Thórhallsson
13, Anton Ari Einarsson, GK
POS: 56, 44 - TIR: 15, 4 - TPO: 5, 3 - FAL: 12, 17 - AMA: 0, 2 - ROJ: 1, 0 - ESQ: 8, 1 - ATA: 1, 3
Kit CAN J1 C1, P1 C1 - Kit ISL J2 C1, P1 C1 - Kit ARB ConFIFA R3


Amistoso
Canadá 0 - Túnez 0
31 mar 2026 · 21:00 UTC−4
Clima: 13 °C, Llovizna
BMO Field, Toronto, Canadá
Asistencia: 22,624
Árbitro: Keylor Herrera (CRC)
Incidencias:
Ama TUN Elias Saad 28’
Ama CAN Tani Oluwaseyi 29’
Ama TUN Khalil Ayari 46’
Ama CAN Joel Waterman 54’
Ama CAN Liam Millar 74’
Ama CAN Junior Hoilett 90+2’
FT 90+3’
Ali CAN 4-4-2 (H)
16, Maxime Crépeau, GK
22, Richie Laryea, LB - 2, Jahkeele Marshall-Rutty 76’
3, Ralph Priso, CB - 11, Liam Millar 26’
5, Joel Waterman, CB - 13, Derek Cornelius 58’
23, Niko Sigur, RB
26, Marcelo Flores, LM - 20, Ali Ahmed 76’
19, Nathan Saliba, CDM - 21, Jonathan Osorio 58’
8, Ismaël Koné, CDM
11, Liam Millar, RM - 10, Junior Hoilett 76’
12, Tani Oluwaseyi, ST - 24, Daniel Jebbison 58’
7, Jonathan David, ST (C) - 25, Jacen Russell-Rowe 76’
Sub CAN
15, Luc de Fougerolles
6, Mathieu Choinière
1, Dayne St. Clair, GK
9, Cyle Larin
14, Aribim Pepple
18, Owen Goodman, GK
Ali TUN 4-2-3-1
22, Mouhib Chamakh, GK
2, Ali Abdi, LB - 3, Mohamed Amine Ben Hamida 58’
4, Omar Rekik, CB
18, Alaa Ghram, CB - 19, Firas Chaouat 86’
21, Moutaz Neffati, RB - 27, Rayan Elloumi 58’
17, Ellyes Skhiri, CDM (C)
6, Rani Khedira, CDM - 11, Ismaël Gharbi 70’
8, Elias Saad, LM - 15, Hadj Mahmoud 58’
25, Anis Slimane, CAM
23, Sayfallah Ltaief, RM - 7, Khalil Ayari 45’
29, Louey Farhat, ST - 26, Sebastian Tounekti 45’
Sub TUN
12, Mortadha Ben Ouanes
5, Adem Arous
30, Anisse Saidi
24, Raed Chikhaoui
1, Noureddine Farhati, GK
14, Ghaith Zaalouni
16, Aymen Dahmen, GK
28, Omar Ben Ali
POS: 58, 42 - TIR: 14, 4 - TPO: 6, 2 - FAL: 16, 14 - AMA: 4, 2 - ROJ: 0, 0 - ESQ: 9, 1 - ATA: 1, 6
Kit CAN J3 C1, P2 C1 - Kit TUN J2 C1, P3 C1 - Kit ARB ConFIFA R4

Amistoso
Canadá 2 - Uzbekistán 0
1 jun 2026 · 19:00 UTC−6
Clima: 10 °C, Llovizna
Commonwealth Stadium, Edmonton, Canadá
Asistencia: 46,164
Árbitro: Marco Ortíz (MEX)
Incidencias:
Ama UZB Azizjon Ganiev 2’
Ama UZB Farrukh Sayfiev 9’
Ama CAN Liam Millar 40’
Ama CAN Derek Cornelius 43’
Gol CAN Jonathan Osorio 58’ - Asi CAN Tani Oluwaseyi
Gol CAN Jayden Nelson 90+1’ - Asi CAN Tani Oluwaseyi
FT 90+6’
Ali CAN 4-4-2 (H)
16, Maxime Crépeau, GK - 1, Dayne St. Clair 45’
22, Richie Laryea, LB - 23, Niko Sigur 32’
13, Derek Cornelius, CB - 3, Alfie Jones 70’
15, Moïse Bombito, CB - 4, Luc de Fougerolles 31’
2, Alistair Johnston, RB - 12, Tani Oluwaseyi 45’
11, Liam Millar, LM - 29, Jayden Nelson 45’
8, Ismaël Koné, CM - 25, Nathan Saliba 45’
7, Stephen Eustáquio, CM (C) - 21, Jonathan Osorio 45’
17, Tajon Buchanan, RM - 6, Mathieu Choinière 45’
9, Cyle Larin, ST - 28, Ralph Priso 45’
10, Jonathan David, ST - 24, Promise David 70’
Sub CAN
5, Joel Waterman
20, Ali Ahmed
18, Owen Goodman, GK
27, Zorhan Bassong
Ali UZB 3-4-2-1
12, Abduvohid Nematov, GK
5, Rustam Ashurmatov, CB
18, Abdulla Abdullaev, CB - 27, Jakhongir Urozov 70’
2, Abdukodir Khusanov, CB
13, Sherzod Nasrullaev, LM
7, Otabek Shukurov, CM - 6, Akmal Mozgovoy 70’
9, Odiljon Xamrobekov, CM - 23, Sherzod Esanov 85’
4, Farrukh Sayfiev, RM - 21, Igor Sergeev 85’
11, Oston Urunov, CAM - 28, Azizbek Amonov 70’
19, Azizjon Ganiev, CAM - 22, Abbosbek Fayzullaev 23’
14, Eldor Shomurodov, ST (C)
Sub UZB
1, Utkir Yusupov, GK
25, Avazbek Ulmasaliyev
10, Jaloliddin Masharipov
17, Dostonbek Khamdamov
26, Ruslanbek Jiyanov
20, Jasurbek Jaloliddinov
8, Jamshid Iskanderov
15, Umar Eshmurodov
16, Botirali Ergashev, GK
POS: 52, 28 - TIR: 10, 6 - TPO: 4, 2 - FAL: 9, 15 - AMA: 2, 2 - ROJ: 0, 0 - ESQ: 7, 3 - ATA: 2, 2
Kit CAN J1 C1, P1 C1 - Kit UZB J1 C1, P3 C1 - Kit ARB ConFIFA R3

Amistoso
Canadá 1 - República de Irlanda 1
5 jun 2026 · 19:30 UTC−4
Clima: 27 °C, Nublado
Saputo Stadium, Montreal, Canadá
Asistencia: 19,619
Árbitro: Pablo Camacho (CRC)
Incidencias:
Gol CAN Jake O'Brien 23’ (GEC)
Ama CAN Derek Cornelius 47’
Ama CAN Cyle Larin 57’
Gol IRL Chiedozie Ogbene 60’
Ama IRL Jamie McGrath 64’
FT 90+6’
Ali CAN 4-4-2 (H)
16, Maxime Crépeau, GK
22, Richie Laryea, LB - 27, Zorhan Bassong 62’
13, Derek Cornelius, CB
4, Luc de Fougerolles, CB
2, Alistair Johnston, RB - 23, Niko Sigur 45’
11, Liam Millar, LM - 29, Jayden Nelson 87’
7, Stephen Eustáquio, CM (C) - 25, Nathan Saliba 87’
8, Ismaël Koné, CM
17, Tajon Buchanan, RM - 12, Tani Oluwaseyi 87’
9, Cyle Larin, ST - 24, Promise David 73’
10, Jonathan David, ST
Sub CAN
5, Joel Waterman
1, Dayne St. Clair, GK
28, Ralph Priso
21, Jonathan Osorio
3, Alfie Jones
18, Owen Goodman, GK
6, Mathieu Choinière
15, Moïse Bombito
Ali IRL 3-4-2-1 (H)
1, Mark Travers, GK
4, James Abankwah, CB
22, Nathan Collins, CB (C)
5, Jake O'Brien, CB
21, Corrie Ndaba, LM - 3, Liam Scales 45’
8, Dawson Devoy, CM - 10, Jamie McGrath 45’
6, Conor Coventry, CM - 14, Joseph Hodge 88’
2, Seamus Coleman, RM - 12, Killian Phillips 70’
11, Jaden Umeh, CAM - 9, Mason Melia 70’
20, Chiedozie Ogbene, CAM - 19, Adam Brennan 90+2’
7, Troy Parrott, ST - 15, Kian Leavy 88’
Sub IRL
23, Conor Brann, GK
17, Matthew Healy
16, Edward Mcginty, GK
18, Alex Murphy
25, Josh O'Dwyer
POS: 67, 33 - TIR: 21, 5 - TPO: 2, 3 - FAL: 9, 13 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 12, 4 - ATA: 2, 2
Kit CAN J3 C1, P3 C1 - Kit IRL J2 C1, P1 C1 - Kit ARB ConFIFA R2


--------------------------------------------
BRASIL

Amistoso
Brasil 2 - Senegal 0
15 nov 2025 · 16:00 UTC+0
Clima: 13 °C, Nublado
Emirates Stadium, Londres, Inglaterra
Asistencia: 58,657
Árbitro: Jarred Gillett (ENG)
Incidencias:
Gol BRA Estêvão 28’ - Asi BRA Rodrygo
Gol BRA Casemiro 35’
Ama SEN Antoine Mendy 51’
Ama SEN Kalidou Koulibaly 57’
Ama SEN Pape Gueye 61’
Ama BRA Casemiro 66’
Ama SEN Pape Gueye 87’
FT 90+4’
Ali BRA 4-2-2-2
23, Ederson, GK
6, Alex Sandro, LB - 15, Fabrício Bruno 90’
3, Gabriel Magalhães, CB - 14, Wesley 64’
4, Marquinhos, CB (C)
2, Éder Militão, RB
8, Bruno Guimarães, CDM
5, Casemiro, CDM
10, Rodrygo, CAM - 11, Lucas Paquetá 83’
20, Estêvão, CAM - 19, Luiz Henrique 83’
7, Vinícius Júnior, ST - 16, Caio Henrique 90’
21, Matheus Cunha, ST - 22, João Pedro 65’
Sub BRA
26, Vitor Roque
18, Andrey Santos
25, Paulo Henrique
24, Luciano Juba
12, Bento, GK
13, Danilo
1, John Victor, GK
9, Richarlison
17, Fabinho
Ali SEN 4-2-3-1 (W)
16, Édouard Mendy, GK
14, Ismail Jakobs, LB - 25, El Hadji Malick Diouf 76’
19, Moussa Niakhaté, CB
3, Kalidou Koulibaly, CB (C)
24, Antoine Mendy, RB
5, Idrissa Gana Gueye, CDM
26, Pape Gueye, CDM - 6, Pathé Ciss 76’
17, Pape Matar Sarr, LM - 11, Nicolas Jackson 49’
18, Ismaïla Sarr, CAM - 12, Cherif Ndiaye 82’
13, Iliman Ndiaye, RM - 21, Cheick Sabaly 82’
10, Sadio Mané, ST - 27, Ibrahim Mbaye 75’
Sub SEN
1, Yehvann Diouf, GK
15, Ilay Camara
22, Rassoul Ndiaye
7, Lamine Camara
9, Boulaye Dia
4, Abdoulaye Seck
23, Mory Diaw, GK
2, Mamadou Sarr
POS: 47, 53 - TIR: 14, 11 - TPO: 6, 1 - FAL: 15, 14 - AMA: 1, 4 - ROJ: 0, 0 - ESQ: 7, 7 - ATA: 1, 4
Kit BRA J1 C1, P2 C1 - Kit SEN J2 C1, P3 C1 - Kit ARB ConFIFA R1

Amistoso
Brasil 1 - Túnez 1
18 nov 2025 · 20:30 UTC+1
Clima: 5 °C, Llovizna
Stade Pierre-Mauroy, Lille, Francia
Asistencia: 40,000
Árbitro: Jérôme Brisard (FRA)
Incidencias:
Ama BRA Wesley 9’
Gol TUN Hazem Mastouri 23’ - Asi TUN Ali Abdi
Ama TUN Ali Abdi 39’
Gol BRA Estêvão 44’ (PEN)
FT 90+4’
Ali BRA 4-2-2-2
12, Bento, GK
16, Caio Henrique, LB
2, Éder Militão, CB - 15, Fabrício Bruno 60’
4, Marquinhos, CB (C)
14, Wesley, RB - 13, Danilo 45’
5, Casemiro, CDM - 17, Fabinho 60’
8, Bruno Guimarães, CDM - 11, Lucas Paquetá 60’
10, Rodrygo, CAM - 19, Luiz Henrique 79’
20, Estêvão, CAM
7, Vinícius Júnior, ST
21, Matheus Cunha, ST - 26, Vitor Roque 45’
Sub BRA
18, Andrey Santos
1, John Victor, GK
25, Paulo Henrique
9, Richarlison
23, Ederson, GK
22, João Pedro
24, Luciano Juba
6, Alex Sandro
Ali TUN 5-3-2
16, Aymen Dahmen, GK
2, Ali Abdi, LB - 12, Mortadha Ben Ouanes 79’
3, Montassar Talbi, CB
6, Dylan Bronn, CB
4, Yassine Meriah, CB
20, Yan Valery, RB
10, Hannibal Mejbri, CM - 19, Firas Chaouat 87’
17, Ellyes Skhiri, CDM
13, Ferjani Sassi, CM (C)
9, Hazem Mastouri, ST - 11, Ismaël Gharbi 59’
8, Elias Saad, ST - 7, Elias Achouri 80’
Sub TUN
30, Seifeddine Jaziri
23, Naïm Sliti
29, Nacim Dendani
15, Hadj Mahmoud
22, Sabri Ben Hessen, GK
18, Mohamed Ben Larbi
14, Mohamed Ben Ali
5, Mohamed Ali Ben Romdhane
1, Noureddine Farhati, GK
26, Marouane Sahraoui
21, Amor Layouni
POS: 74, 26 - TIR: 22, 7 - TPO: 3, 2 - FAL: 12, 15 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 7, 1 - ATA: 1, 2
Kit BRA J1 C1, P1 C1 - Kit TUN J1 C1, P4 C1 - Kit ARB ConFIFA R1

Amistoso
26 mar 2026 · 16:00 UTC−4
Gillette Stadium, Foxborough, Estados Unidos
Asistencia: 66,215
Árbitro: Guido Gonzales Jr. (USA)
Brasil 1 - Francia 2
Gol FRA Kylian Mbappé 32’
Gol FRA Hugo Ekitike 65’
Gol BRA Bremer 78’

Amistoso
31 mar 2026 · 20:00 UTC−4 	
Camping World Stadium, Orlando, Estados Unidos
Asistencia: 46,398
Árbitro: Armando Villarreal (USA)
Brasil 3 - Croacia 1
Gol BRA Danilo Santos 45+2’
Gol CRO Lovro Majer 84’
Gol BRA Igor Thiago 88’ (PEN)
Gol BRA Gabriel Martinelli 90+2’

Amistoso
31 may 2026 · 18:30 UTC−3 	
Maracanã, Río de Janeiro, Brasil
Asistencia: 72,140
Árbitro: Daniel Schlager (GER)
Brasil 6 - Panamá 2
Gol BRA Vinícius Júnior 1’
Gol PAN Matheus Cunha 13’ (GEC)
Gol BRA Casemiro 38’
Gol BRA Rayan 52’
Gol BRA Lucas Paquetá 59’
Gol BRA Igor Thiago 62’ (PEN)
Gol BRA Danilo Santos 80’
Gol PAN Carlos Harvey 83’

Amistoso
6 jun 2026 · 18:00 UTC−4
Huntington Bank Field, Cleveland, Estados Unidos
Asistencia: 64,311
Árbitro: Adonai Escobedo (MEX)
Brasil 2 - Egipto 1
Gol BRA Bruno Guimarães 7’
Gol EGY Mostafa Ziko 11’
Gol BRA Endrick 52’

--------------------------------------------
ESTADOS UNIDOS

Amistoso
15 nov 2025 · 17:00 UTC−5
Subaru Park, Chester, Estados Unidos
Asistencia: 17,224
Árbitro: Cristhofer Corado (GUA)
Estados Unidos 2 - Paraguay 1
Gol USA Giovanni Reyna 4’
Gol PAR Álex Arce 10’
Gol USA Folarin Balogun 71’

Amistoso
18 nov 2025 · 18:30 UTC−5
Raymond James Stadium, Tampa, Estados Unidos
Asistencia: 26,110
Árbitro: Julio Luna (GUA)
Estados Unidos 5 - Uruguay 1
Gol USA Sebastian Berhalter 17’
Gol USA Alex Freeman 20’
Gol USA Alex Freeman 31’
Gol USA Diego Luna 42’
Gol URU Giorgian de Arrascaeta 45+1’
Gol USA Tanner Tessmann 68’

Amistoso
28 mar 2026 · 15:30 UTC-4
Mercedes-Benz Stadium, Atlanta, Estados Unidos
Asistencia: 66,867
Árbitro: Esteban Ostojich (URU)
Estados Unidos 2 - Belgica 5
Gol USA Weston McKennie 39’
Gol BEL Zeno Debast 45’
Gol BEL Amadou Onana 53’
Gol BEL Charles De Ketelaere 59’ (PEN)
Gol BEL Dodi Lukébakio 68’
Gol BEL Dodi Lukébakio 82’
Gol USA Patrick Agyemang 87’

Amistoso
31 mar 2026 · 19:00 UTC−5
Mercedes-Benz Stadium, Atlanta, Estados Unidos
Asistencia: 72,297
Árbitro: Sven Jablonski (GER)
Estados Unidos 0 - Portugal 2
Gol POR Francisco Trincão 37’
Gol POR João Félix 59’

Amistoso
31 may 2026 · 15:30 UTC−5
Bank of America Stadium, Charlotte, Estados Unidos
Asistencia: 57,741
Árbitro: Nick Walsh (SCO)
Estados Unidos 3 - Senegal 2
Gol USA Sergiño Dest 7’
Gol USA Christian Pulisic 20'
Gol SEN Sadio Mané 44’
Gol SEN Sadio Mané 52’
Gol USA Folarin Balogun 63’

Amistoso
6 jun 2026 · 14:30 UTC−6 	
Soldier Field, Chicago, Estados Unidos
Asistencia: 63,636
Árbitro: Piero Maza (CHI)
Estados Unidos 1 - Alemania 2
Gol GER Kai Havertz 2’
Gol USA Antonee Robinson 37’
Gol GER Leroy Sané 57’

--------------------------------------------
ALEMANIA

Eliminatorias Copa Mundial 26™
12 nov 2025 · 20:45 UTC+1
Stade de Luxembourg, Ciudad de Luxemburgo, Luxemburgo
Asistencia: 9,214
Árbitro: John Brooks (ENG)
Luxemburgo 0 - Alemania 2
Gol GER Nick Woltemade 49’
Gol GER Nick Woltemade 69’

Eliminatorias Copa Mundial 26™
17 nov 2025 · 20:45 UTC+1
Red Bull Arena, Leipzig, Alemania
Asistencia: 40,120
Árbitro: François Letexier (FRA)
Alemania 6 - Eslovaquia 0
Gol GER Nick Woltemade 18’
Gol GER Serge Gnabry 29’
Gol GER Leroy Sané 36’
Gol GER Leroy Sané 41’
Gol GER Ridle Baku 67’
Gol GER Assan Ouédraogo 79’

Amistoso
27 mar 2026 · 20:45 UTC+1
St. Jakob-Park, Basilea, Suiza
Asistencia: 34,316
Árbitro: Chris Kavanagh (ENG)
Suiza 3 - Alemania 4
Gol SUI Dan Ndoye 17’
Gol GER Jonathan Tah 26’
Gol SUI Breel Embolo 41’
Gol GER Serge Gnabry 45+2’
Gol GER Florian Wirtz 61’
Gol SUI Joël Monteiro 79’
Gol GER Florian Wirtz 85’

Amistoso
30 mar 2026 · 20:45 UTC+2
MHPArena, Stuttgart, Alemania
Asistencia: 52,723
Árbitro: Stuart Attwell (ENG)
Alemania 2 - Ghana 1
Gol GER Kai Havertz 45+3’ (PEN)
Gol GHA Abdul Fatawu 70’
Gol GER Deniz Undav 88’

Amistoso
31 may 2026 · 20:45 UTC+2
Mewa Arena, Mainz, Alemania
Asistencia: 25,122
Árbitro: Matheus Candançan (BRA)
Alemania 4 - Finlandia 0
Gol GER Deniz Undav 34’
Gol GER Florian Wirtz 48’
Gol GER Deniz Undav 57’
Gol GER Jamal Musiala 63’

Amistoso
6 jun 2026 · 14:30 UTC−6 	
Soldier Field, Chicago, Estados Unidos
Asistencia: 63,636
Árbitro: Piero Maza (CHI)
Estados Unidos 1 - Alemania 2
Gol GER Kai Havertz 2’
Gol USA Antonee Robinson 37’
Gol GER Leroy Sané 57’

--------------------------------------------
PAÍSES BAJOS

Eliminatorias Copa Mundial 26™
12 oct 2025 · 18:00 UTC+2
Johan Cruijff Arena, Ámsterdam, Países Bajos
Asistencia: 52,387
Árbitro: Slavko Vinčić (SVN)
Países Bajos 4 - Finlandia 0
Gol NED Donyell Malen 8’
Gol NED Virgil van Dijk 17’
Gol NED Memphis Depay 38’ (PEN)
Gol NED Cody Gakpo 84’

Eliminatorias Copa Mundial 26™
14 nov 2025 · 20:45 UTC+1
Stadion Narodowy, Varsovia, Polonia
Asistencia: 56,278
Árbitro: Maurizio Mariani (ITA)
Polonia 1 - Países Bajos 1
Gol POL Jakub Kamiński 43’
Gol NED Memphis Depay 47’

Eliminatorias Copa Mundial 26™
17 nov 2025 · 20:45 UTC+1
Johan Cruijff Arena, Ámsterdam, Países Bajos
Asistencia: 46,913
Árbitro: Luis Godinho (POR)
Países Bajos 4 - Lituania 0
Gol NED Tijjani Reijnders 16’
Gol NED Cody Gakpo 58’ (PEN)
Gol NED Xavi Simons 60’
Gol NED Donyell Malen 62’

Amistoso
27 mar 2026 · 20:45 UTC+1
Johan Cruijff Arena, Ámsterdam, Países Bajos
Asistencia: 50,327
Árbitro: Lawrence Visser (BEL)
Países Bajos 2 - Noruega 1
Gol NOR Andreas Schjelderup 24’
Gol NED Virgil van Dijk 35’
Gol NED Tijjani Reijnders 51’

Amistoso
31 mar 2026 · 20:45 UTC+2
Philips Stadion, Eindhoven, Países Bajos
Asistencia: 29,344
Árbitro: Sascha Stegemann (GER)
Países Bajos 1 - Ecuador 1
Gol NED Willian Pacho 3’ (GEC)
Gol ECU Enner Valencia 24’ (PEN)

Amistoso
3 jun 2026 · 20:45 UTC+2
De Kuip, Róterdam, Países Bajos
Asistencia: 40,306
Árbitro: Jakob Semler (AUT)
Países Bajos 0 - Argelia 1
Gol ALG Anis Hadj Moussa 86’

Amistoso
8 jun 2026 · 14:45 UTC-4
Icahn Stadium, Nueva York, Estados Unidos
Asistencia: A puerta cerrada
Árbitro: Alyssa Pennington (USA)
Países Bajos 2 - Uzbekistán 1
Gol NED Cody Gakpo 32’ (PEN)
Gol ALG Igor Sergeev 90+2’
Gol NED Cody Gakpo 90+8’ (PEN)

--------------------------------------------
BÉLGICA

Eliminatorias Copa Mundial 26™
13 oct 2025 · 19:45 UTC+0
Cardiff City Stadium, Cardiff, Gales
Asistencia: 32,803
Árbitro: Daniel Siebert (GER)
Gales 2 - Bélgica 4
Gol WAL Joe Rodon 8’
Gol BEL Kevin De Bruyne 18’ (PEN)
Gol BEL Thomas Meunier 24’
Gol BEL Kevin De Bruyne 76’ (PEN)
Gol WAL Nathan Broadhead 89’
Gol BEL Leandro Trossard 90’

Eliminatorias Copa Mundial 26™
15 nov 2025 · 19:00 UTC+5
Astana Arena, Astaná, Kazajistán
Asistencia: 28,012
Árbitro: Donatas Rumšas (LTU)
Kazajistán 1 - Bélgica 1
Gol KAZ Dastan Satpayev 9’
Gol BEL Hans Vanaken 48’

Eliminatorias Copa Mundial 26™
18 nov 2025 · 20:45 UTC+1
Stade Maurice Dufrasne, Lieja, Bélgica
Asistencia: 26,253
Árbitro: Mohammed Al-Hakim (SWE)
Bélgica 7 - Liechtenstein 0
Gol BEL Hans Vanaken 3’
Gol BEL Jérémy Doku 34’
Gol BEL Jérémy Doku 41’
Gol BEL Brandon Mechele 52’
Gol BEL Alexis Saelemaekers 55’
Gol BEL Charles De Ketelaere 57’
Gol BEL Charles De Ketelaere 59’

Amistoso
28 mar 2026 · 15:30 UTC-4
Mercedes-Benz Stadium, Atlanta, Estados Unidos
Asistencia: 66,867
Árbitro: Esteban Ostojich (URU)
Estados Unidos 2 - Belgica 5
Gol USA Weston McKennie 39’
Gol BEL Zeno Debast 45’
Gol BEL Amadou Onana 53’
Gol BEL Charles De Ketelaere 59’ (PEN)
Gol BEL Dodi Lukébakio 68’
Gol BEL Dodi Lukébakio 82’
Gol USA Patrick Agyemang 87’

Amistoso
31 mar 2026 · 19:00 UTC−5
Soldier Field, Chicago, Estados Unidos
Asistencia: 52,412
Árbitro: Rosendo Mendoza (USA)
México 1 - Bélgica 1
Goles:
Gol MEX Jorge Sánchez 19’
Gol BEL Dodi Lukébakio 46’

Amistoso
2 jun 2026 · 18:00 UTC+1
Stadion Rujevica, Rijeka, Croacia
Asistencia: 7,555
Árbitro: Rade Obrenović (SVN)
Croacia 0 - Bélgica 2
Gol BEL Youri Tielemans 38’
Gol BEL Romelu Lukaku 90+6’

Amistoso
6 jun 2026 · 15:00 UTC+1
King Baudouin Stadium, Bruselas, Bélgica
Asistencia: 40,236
Árbitro: Anastasios Sidiropoulos (GRE)
Bélgica 5 - Tunisia 0
Gol BEL Leandro Trossard 28’
Gol BEL Charles De Ketelaere 53’
Gol BEL Kevin De Bruyne 65’
Gol BEL Dodi Lukébakio 85’
Gol BEL Nicolas Raskin 87’

--------------------------------------------
ESPAÑA

Eliminatorias Copa Mundial 26™
14 oct 2025 · 20:45 UTC+1
Estadio José Zorrilla, Valladolid, España
Asistencia: 24,526
Árbitro: Willy Delajod (FRA)
España 4 - Bulgaria 0
Gol ESP Mikel Merino 35’
Gol ESP Mikel Merino 57’
Gol ESP Atanas Chernev 79’ (GEC)
Gol ESP Mikel Oyarzabal 90+2’ (PEN)

Eliminatorias Copa Mundial 26™
15 nov 2025 · 21:00 UTC+4
Boris Paichadze Dinamo Arena, Tiflis, Georgia
Asistencia: 44,314
Árbitro: Benoît Bastien (FRA)
Georgia 0 - España 4
Gol ESP Mikel Oyarzabal 11’ (PEN)
Gol ESP Martín Zubimendi 22’
Gol ESP Ferran Torres 35’
Gol ESP Mikel Oyarzabal 63’

Eliminatorias Copa Mundial 26™
18 nov 2025 · 20:45 UTC+1
Estadio La Cartuja, Sevilla, España
Asistencia: 30,812
Árbitro: Felix Zwayer (GER)
España 2 - Turquia 2
Gol ESP Dani Olmo 4’
Gol TUR Deniz Gül 42’
Gol TUR Salih Özcan 54’
Gol ESP Mikel Oyarzabal 62’

Amistoso
27 mar 2026 · 21:00 UTC+1
Estadio de la Cerámica, Villarreal, España
Asistencia: 20,482
Árbitro: Luis Godinho (POR)
España 3 - Serbia 0
Gol ESP Mikel Oyarzabal 16’
Gol ESP Mikel Oyarzabal 44’
Gol ESP Víctor Muñoz 72’

Amistoso
31 mar 2026 · 21:00 UTC+1
RCDE Stadium, Cornellà de Llobregat, España
Asistencia: 35,895
Árbitro: Georgi Kabakov (BUL)
España 0 - Egipto 0

Amistoso
4 jun 2026 · 21:00 UTC+1
Estadio Riazor, A Coruña, España
Asistencia: 30,423
Árbitro: Florian Badstübner (GER)
España 1 - Irak 1
Gol ESP Ferran Torres 16’
Gol IRQ Merchas Doski 27’

Amistoso
8 jun 2026 · 20:00 UTC-6
Estadio Cuauhtémoc, Puebla, México
Asistencia: 45,845
Árbitro: Fernando Hernández (MEX)
Perú 1 - España 3
Gol ESP Mikel Oyarzabal 2’
Gol ESP Pedri 32’
Gol ESP Pedro Gallese 55’ (GEC)
Gol PER Jairo Vélez 66’

--------------------------------------------
FRANCIA

Eliminatorias Copa Mundial 26™
13 oct 2025 · 18:45 UTC+0
Laugardalsvöllur, Reikiavik, Islandia
Asistencia: 9,151
Árbitro: Orel Grinfeld (ISR)
Islandia 2 - Francia 2
Gol ISL Victor Pálsson 39’
Gol FRA Christopher Nkunku 63’
Gol FRA Jean-Philippe Mateta 68’
Gol ISR Kristian Hlynsson 70’

Eliminatorias Copa Mundial 26™
13 nov 2025 · 20:45 UTC+1
Parc des Princes, París, Francia
Asistencia: 41,055
Árbitro: Slavko Vinčić (SVN)
Francia 4 - Ucrania 0
Gol FRA Kylian Mbappé 55’ (PEN)
Gol FRA Michael Olise 76’
Gol FRA Kylian Mbappé 83’
Gol FRA Hugo Ekitike 88’

Eliminatorias Copa Mundial 26™
16 nov 2025 · 20:45 UTC+4
Tofiq Bahramov Republican Stadium, Bakú, Azerbaiyán
Asistencia: 29,700
Árbitro: Andris Treimanis (LVA)
Azerbaiyán 1 - Francia 3
Gol AZE Renat Dadaşov 4’
Gol FRA Jean-Philippe Mateta 17’
Gol FRA Maghnes Akliouche 30’
Gol FRA Shakhruddin Magomedaliyev 45’ (GEC)

Amistoso
26 mar 2026 · 16:00 UTC−4
Gillette Stadium, Foxborough, Estados Unidos
Asistencia: 66,215
Árbitro: Guido Gonzales Jr. (USA)
Brasil 1 - Francia 2
Gol FRA Kylian Mbappé 32’
Gol FRA Hugo Ekitike 65’
Gol BRA Bremer 78’

Amistoso
29 mar 2026 · 15:00 UTC−4
Northwest Stadium, Landover, Estados Unidos
Asistencia: 60,734
Árbitro: Victor Rivas (USA)
Colombia 1 - Francia 3
Gol FRA Désiré Doué 29’
Gol FRA Marcus Thuram 41’
Gol FRA Désiré Doué 56’
Gol COL Jaminton Campaz 77’

Amistoso
4 jun 2026 · 21:10 UTC+2
Stade de la Beaujoire, Nantes, Francia
Asistencia: 35,322
Árbitro: Sebastian Gishamer (AUT)
Francia 1 - Costa de Marfil 2
Gol FRA Rayan Cherki 45’
Gol CIV Guéla Doué 53’
Gol CIV Amad Diallo 84’

Amistoso
8 jun 2026 · 21:10 UTC+2
Stade Pierre-Mauroy, Villeneuve-d'Ascq, Francia
Asistencia: 43,272
Árbitro: Sascha Stegemann (GER)
Francia 3 - Irlanda del Norte 1
Gol FRA Michael Olise 43’
Gol FRA Michael Olise 49’
Gol NIR Patrick Kelly 64’
Gol FRA Michael Olise 75’

--------------------------------------------
ARGENTINA

Amistoso
10 oct 2025 · 20:00 UTC-4
Hard Rock Stadium, Miami, Estados Unidos
Asistencia: 20,000
Árbitro: Tori Penso (USA)
Argentina 1 - Venezuela 0
Gol ARG Giovani Lo Celso 31’

Amistoso
14 oct 2025 · 18:00 UTC-4
Chase Stadium, Fort Lauderdale, Estados Unidos
Asistencia: 18,000
Árbitro: Armando Villarreal (USA)
Puerto Rico 0 - Argentina 6
Gol ARG Alexis Mac Allister 14’
Gol ARG Gonzalo Montiel 23’
Gol ARG Alexis Mac Allister 36’
Gol ARG Steven Echevarria 64’ (GEC)
Gol ARG Lautaro Martínez 79’
Gol ARG Lautaro Martínez 84’

Amistoso
14 nov 2025 · 17:00 UTC+1
Estádio Nacional 11 de Novembro, Luanda, Angola
Asistencia: 43,000
Árbitro: Hillary Hambaba (ZAM)
Angola 0 - Argentina 2
Gol ARG Lautaro Martínez 43’
Gol ARG Lionel Messi 82’

Amistoso
27 mar 2026 · 20:15 UTC-3
La Bombonera, Buenos Aires, Argentina
Asistencia: 45,760
Árbitro: Derlis López (PAR)
Argentina 2 - Mauritania 1
Gol ARG Enzo Fernández 17’
Gol ARG Nico Paz 32’
Gol MTN Jordan Lefort 90+4’

Amistoso
31 mar 2026 · 20:30 UTC-3
La Bombonera, Buenos Aires, Argentina
Asistencia: 50,000
Árbitro: Alexis Herrera (VEN)
Argentina 5 - Zambia 0
Gol ARG Julián Alvarez 4’
Gol ARG Lionel Messi 43’
Gol ARG  Nicolás Otamendi 50’ (PEN)
Gol ARG Dominic Chanda 68’ (GEC)
Gol ARG Valentín Barco 90+4’

Amistoso
6 jun 2026 · 19:00 UTC-5
Kyle Field, College Station, Estados Unidos
Asistencia: 91,102
Árbitro: Victor Rivas (USA)
Argentina 2 - Honduras 0
Gol ARG Lautaro Martínez 37’ (PEN)
Gol ARG Giuliano Simeone 54’

Amistoso
9 jun 2026 · 19:30 UTC-5
Jordan–Hare Stadium, Auburn, Estados Unidos
Asistencia: 88,043
Árbitro: Rosendo Mendoza (USA)
Argentina 3 - Islandia 0
Gol ARG Valentín Barco 8’
Gol ARG Lionel Messi 72’ (PEN)
Gol ARG Thiago Almada 86’




`;
