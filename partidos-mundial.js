/* =====================================================================
   COPA MANAGER 2026 — PARTIDOS DEL MUNDIAL
   Igual que partidos.js, pero SOLO para partidos de la COPA DEL MUNDO.
   Edita ESTE archivo con cualquier editor de texto plano.

   Escribe tus partidos ENTRE las comillas invertidas ` de abajo.
   NO borres la primera línea  window.PARTIDOS_MUNDIAL_TXT = `   ni la última  `;

   Diferencia con partidos.js:
    - Aquí NO se crean partidos nuevos. Cada bloque se pega al partido que YA existe en el
      calendario oficial del Mundial (los 104), y le pone su informe: marcador, goles, tarjetas,
      alineaciones, entrenadores, estadísticas, árbitro, asistencia, FT, penales y uniformes.
    - El partido se encuentra así:
        1) por su NÚMERO, si lo pones en el encabezado:  Partido 73   (o  M73  /  #73)
        2) si no, por las dos selecciones (en cualquier orden; si el calendario las tiene al
           revés, el informe se voltea solo);
        3) en eliminatoria sin rivales todavía: por la fecha (y el estadio, si lo escribes).
    - La sede del Mundial se queda como está en el calendario (nombre de torneo FIFA). La fecha y
      la hora solo cambian si las escribes.
    - Si borras un partido de aquí, al recargar vuelve a quedar como en el calendario (sin informe).
    - Si un partido no se encuentra, el juego muestra un aviso con su nombre.

   Fecha y clima (solo en este archivo):
    - La línea de fecha lleva la hora OFICIAL programada. Si el partido empezó tarde o se
      suspendió, se añade después de una flecha la hora real y el motivo (dato interno, no se
      muestra en pantalla):
        30 jun 2026 · 19:00 UTC−6 → 20:00 (Retraso: tormenta eléctrica)
        22 jun 2026 · 17:00 UTC−4 → 2.º tiempo 20:00 (Suspensión en el descanso: tormenta eléctrica)
    - Justo debajo de la fecha va el clima a la hora del saque inicial (opcional):
        Clima: 30 °C, Mayormente despejado
        Clima: 32 °C, Nublado · Techo cerrado
      Condiciones: Soleado, Despejado, Mayormente soleado, Mayormente despejado, Parcialmente
      nublado, Nublado, Llovizna, Lluvioso, Lluvia intensa, Tormenta eléctrica.

   Expulsiones:
    - Toda línea Roj lleva al final cómo fue la expulsión:
        Roj SUI Breel Embolo 72’ (DA)     ← doble amarilla (su primera amarilla va en su línea Ama)
        Roj RSA Themba Zwane 84’ (RD)     ← roja directa (aunque el jugador ya tuviera amarilla)

   Todo lo demás (códigos Gol/Ama/Roj, (PEN), (GEC), Ali, Sub, DT, POS:…, Kit, FT, Penales,
   Retraso) se escribe EXACTAMENTE igual que en partidos.js.

   Evita escribir el carácter ` o la secuencia ${ dentro de los partidos.
   ===================================================================== */

window.PARTIDOS_MUNDIAL_TXT = `

# ---- Escribe tus partidos del Mundial debajo. Ejemplo (quítale los # para activarlo): ----
#
# Partido 1
# 11 jun 2026 · 13:00
# Asistencia: 83,264
# Árbitro: Nombre Apellido (País)
# México 2 - Sudáfrica 0
# Gol MEX Raúl Jiménez 23’
# Gol MEX Santiago Giménez 71’
# Ama RSA Jugador 40’

Partido 1
México 2 - Sudáfrica 0
11 jun 2026 · 13:00 UTC−6 → 13:06 (Retraso: ceremonia de inauguración)
Clima: 23 °C, Llovizna
Estadio Ciudad de México, Ciudad de México, México
Asistencia: 80,824
ARB Wilton Sampaio (BRA) - AA1 Bruno Pires (BRA) - AA2 Bruno Boschilia (BRA) - 4AR Juan Gabriel Benítez (PAR) - VAR Nicolás Gallo Barragán (COL) - AVAR Juan Lara (CHI)
Incidencias:
Gol MEX Julián Quiñones 9’ - Asi MEX Érik Lira
Ama RSA Teboho Mokoena 17’
Ama MEX Brian Gutiérrez 23’
Roj RSA Yaya Sithole 49’ (RD)
Gol MEX Raúl Jiménez 67’ - Asi MEX Roberto Alvarado
Ama RSA Nkosinathi Sibisi 74’
Roj RSA Themba Zwane 84’ (RD)
Roj MEX César Montes 90+2’ (RD)
FT 90+7’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (7.5)
23, Jesús Gallardo, LB (7.2)
5, Johan Vásquez, CB (7.2)
3, César Montes, CB (C) (6.1)
15, Israel Reyes, RB (7.4)
8, Álvaro Fidalgo, CM (7.2) - 19, Gilberto Mora 66’ (6.3)
6, Érik Lira, CDM (7.9) - 4, Edson Álvarez 76’ (6.6)
26, Brian Gutiérrez, CM (6.7) - 24, Luis Chávez 66’ (6.5)
16, Julián Quiñones, LW (8.8) - 10, Alexis Vega 79’ (6.0)
9, Raúl Jiménez, ST (8.0) - 14, Armando González 76’ (5.9)
25, Roberto Alvarado, RW (8.2)
DT, Javier Aguirre
Sub MEX
12, Carlos Acevedo, GK
13, Guillermo Ochoa, GK
2, Jorge Sánchez
7, Luis Romo
11, Santiago Giménez
17, Orbelín Pineda
18, Obed Vargas
20, Mateo Chávez
21, César Huerta
22, Guillermo Martínez
Ali RSA 5-3-2
1, Ronwen Williams, GK (C) (6.2)
6, Aubrey Modiba, LB (5.9) - 7, Oswin Appollis 76’ (6.3)
14, Mbekezeli Mbokazi, CB (6.1)
21, Ime Okon, CB (6.0)
19, Nkosinathi Sibisi, CB (5.8)
20, Khuliso Mudau, RB (6.5)
23, Jayden Adams, CM (6.2) - 11, Themba Zwane 61’ (4.9)
13, Yaya Sithole, CDM (3.5)
4, Teboho Mokoena, CM (6.5)
9, Lyle Foster, ST (5.6) - 5, Thalente Mbatha 56’ (6.2)
15, Iqraam Rayners, ST (5.5) - 17, Evidence Makgopa 76’ (6.3)
DT, Hugo Broos
Sub RSA
16, Sipho Chaine, GK
22, Ricardo Goss, GK
2, Thabang Matuludi
3, Khulumani Ndamane
8, Tshepang Moremi
10, Relebohile Mofokeng
12, Thapelo Maseko
18, Samukele Kabini
24, Olwethu Makhanya
25, Kamogelo Sebelebele
26, Bradley Cross
POS: 61, 39 - TIR: 16, 3 - TPO: 4, 2 - FAL: 12, 11 - AMA: 1, 2 - ROJ: 1, 2 - ESQ: 3, 1 - ATA: 2, 2
Kit MEX J1 C1, P1 C1 - Kit RSA J1 C2, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP MEX Julián Quiñones

Partido 2
Corea del Sur 2 - Chequia 1
11 jun 2026 · 20:00 UTC−6
Clima: 21 °C, Mayormente despejado
Estadio Guadalajara, Guadalajara, México
Asistencia: 44,985
ARB Amin Omar (EGY) - AA1 Mahmoud Abouelregal (EGY) - AA2 Ahmed Hossam Taha (EGY) - 4AR Juan Gabriel Calderón (CRC) - VAR Mahmoud Ashour (EGY) - AVAR Joe Dickerson (USA)
Incidencias:
Gol CZE Ladislav Krejčí 59’ - Asi CZE Vladimír Coufal
Gol KOR Hwang In-beom 67’ - Asi KOR Lee Kang-in
Gol KOR Oh Hyeon-gyu 80’ - Asi KOR Hwang In-beom
Ama KOR Lee Gi-hyuk 90+6’
FT 90+6’
Ali KOR 3-4-3
1, Kim Seung-gyu, GK (7.7)
3, Lee Gi-hyuk, CB (7.6)
4, Kim Min-jae, CB (7.4)
2, Lee Han-beom, CB (7.1)
13, Lee Tae-seok, LM (6.9) - 25, Eom Ji-sung 69’ (6.6)
8, Paik Seung-ho, CM (7.3) - 16, Park Jin-seob 84’ (SC)
6, Hwang In-beom, CM (8.9) - 24, Kim Jin-gyu 84’ (SC)
22, Seol Young-woo, RM (6.9)
10, Lee Jae-sung, LW (7.4) - 11, Hwang Hee-chan 62’ (6.5)
7, Son Heung-min, ST (C) (6.9) - 18, Oh Hyeon-gyu 69’ (7.5)
19, Lee Kang-in, RW (8.4)
DT, Hong Myung-bo
Sub KOR
12, Song Bum-keun, GK
21, Jo Hyeon-woo, GK
5, Kim Tae-hyeon
9, Cho Gue-sung
14, Cho Wi-je
15, Kim Moon-hwan
17, Bae Jun-ho
20, Yang Hyun-jun
23, Jens Castrop
26, Lee Dong-gyeong
Ali CZE 3-4-2-1
1, Matěj Kovář, GK (6.8)
7, Ladislav Krejčí, CB (C) (7.4)
4, Robin Hranáč, CB (5.7)
6, Štěpán Chaloupek, CB (5.7)
20, Jaroslav Zelený, LM (6.8)
22, Tomáš Souček, CM (6.1)
17, Lukáš Provod, CM (6.8) - 18, Michal Sadílek 63’ (6.0)
5, Vladimír Coufal, RM (6.9)
15, Pavel Šulc, CAM (7.2) - 9, Adam Hložek 63’ (6.1)
24, Alexandr Sojka, CAM (6.6) - 13, Mojmír Chytil 84’ (SC)
10, Patrik Schick, ST (5.9) - 19, Tomáš Chorý 63’ (5.9)
DT, Miroslav Koubek
Sub CZE
16, Jindřich Staněk, GK
23, Lukáš Horníček, GK
2, David Zima
3, Tomáš Holeš
8, Vladimír Darida
11, Jan Kuchta
12, Lukáš Červ
14, David Jurásek
21, David Douděra
25, Hugo Sochůrek
26, Denis Višinský
POS: 62, 38 - TIR: 15, 6 - TPO: 6, 4 - FAL: 10, 15 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 4, 5 - ATA: 3, 4
Kit KOR J1 C1, P2 C1 - Kit CZE J2 C1, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP KOR Hwang In-beom

Partido 3
Canadá 1 - Bosnia y Herzegovina 1
12 jun 2026 · 15:00 UTC−4
Clima: 26 °C, Mayormente soleado
Estadio Toronto, Toronto, Canadá
Asistencia: 43,002
ARB Facundo Tello (ARG) - AA1 Juan Pablo Belatti (ARG) - AA2 Gabriel Chade (ARG) - 4AR Khalid Al-Turais (KSA) - VAR Hernán Mastrangelo (ARG) - AVAR Antonio García (URU)
Incidencias:
Ama CAN Alistair Johnston 11’
Gol BIH Jovo Lukić 21’ - Asi BIH Sead Kolašinac
Ama BIH Ermedin Demirović 44’
Ama BIH Jovo Lukić 45+1’
Ama CAN Luc de Fougerolles 53’
Gol CAN Cyle Larin 78’ - Asi CAN Promise David
Ama BIH Nikola Katić 90+3’
FT 90+6’
Ali CAN 4-4-2
16, Maxime Crépeau, GK (7.5)
22, Richie Laryea, LB (8.2)
13, Derek Cornelius, CB (7.4)
4, Luc de Fougerolles, CB (7.1)
2, Alistair Johnston, RB (7.2)
11, Liam Millar, LM (6.8) - 14, Jacob Shaffelburg 61’ (6.1)
7, Stephen Eustáquio, CM (C) (7.5) - 21, Jonathan Osorio 90+1’ (SC)
8, Ismaël Koné, CM (6.0)
17, Tajon Buchanan, RM (5.7) - 20, Ali Ahmed 61’ (6.2)
12, Tani Oluwaseyi, ST (6.6) - 9, Cyle Larin 76’ (7.5)
10, Jonathan David, ST (6.6) - 24, Promise David 61’ (6.6)
DT, Jesse Marsch
Sub CAN
1, Dayne St. Clair, GK
18, Owen Goodman, GK
3, Alfie Jones
5, Joel Waterman
6, Mathieu Choinière
15, Moïse Bombito
19, Alphonso Davies
23, Niko Sigur
25, Nathan Saliba
26, Jayden Nelson
Ali BIH 4-4-2
1, Nikola Vasilj, GK (6.8)
5, Sead Kolašinac, LB (C) (8.0) - 17, Dženis Burnić 83’ (SC)
4, Tarik Muharemović, CB (8.3)
18, Nikola Katić, CB (8.4)
7, Amar Dedić, RB (7.0)
15, Amar Memić, LM (6.1) - 19, Kerim Alajbegović 74’ (6.3)
6, Benjamin Tahirović, CM (6.6)
13, Ivan Bašić, CM (7.2) - 8, Armin Gigović 62’ (6.9)
20, Esmir Bajraktarević, RM (6.3) - 14, Ivan Šunjić 74’ (6.2)
25, Jovo Lukić, ST (8.0) - 9, Samed Baždar 62’ (6.0)
10, Ermedin Demirović, ST (6.6)
DT, Sergej Barbarez
Sub BIH
12, Mladen Jurkas, GK
22, Martin Zlomislić, GK
2, Nihad Mujakić
3, Dennis Hadžikadunić
11, Edin Džeko
16, Amir Hadžiahmetović
21, Stjepan Radeljić
23, Haris Tabaković
24, Arjan Malić
26, Ermin Mahmić
POS: 61, 39 - TIR: 13, 8 - TPO: 4, 3 - FAL: 10, 20 - AMA: 2, 3 - ROJ: 0, 0 - ESQ: 9, 4 - ATA: 2, 2
Kit CAN J1 C1, P1 C1 - Kit BIH J2 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP CAN Ismaël Koné ALT

Partido 4
Estados Unidos 4 - Paraguay 1
12 jun 2026 · 18:00 UTC−7
Clima: 23 °C, Soleado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,492
ARB Danny Makkelie (NED) - AA1 Hessel Steegstra (NED) - AA2 Jan de Vries (NED) - 4AR Yusuke Araki (JPN) - VAR Carlos del Cerro Grande (ESP) - AVAR Dennis Higler (NED)
Incidencias:
Gol USA Damián Bobadilla 7’ (GEC)
Ama PAR Juan José Cáceres 9’
Gol USA Folarin Balogun 31’ - Asi USA Christian Pulisic
Gol USA Folarin Balogun 45+5’ - Asi USA Malik Tillman
Ama PAR Miguel Almirón 53’
Ama USA Tyler Adams 59’
Gol PAR Maurício 73’ - Asi PAR Julio Enciso
Ama PAR Diego Gómez 79’
Ama PAR Álex Arce 88’
Ama PAR Júnior Alonso 90+3’
Gol USA Giovanni Reyna 90+8’ - Asi USA Alex Freeman
FT 90+8’
Ali USA 4-2-3-1 (W)
24, Matt Freese, GK (6.2)
5, Antonee Robinson, LB (7.6)
13, Tim Ream, CB (C) (7.5)
3, Chris Richards, CB (7.2)
16, Alex Freeman, RB (8.1)
17, Malik Tillman, CDM (7.9) - 7, Giovanni Reyna 82’ (SC)
4, Tyler Adams, CDM (7.7)
10, Christian Pulisic, LM (7.8) - 14, Sebastian Berhalter 45’ (6.6)
8, Weston McKennie, CAM (7.4)
2, Sergiño Dest, RM (7.0) - 21, Timothy Weah 72’ (6.2)
20, Folarin Balogun, ST (8.9) - 9, Ricardo Pepi 72’ (6.0)
DT, Mauricio Pochettino
Sub USA
1, Matt Turner, GK
25, Chris Brady, GK
6, Auston Trusty
11, Brenden Aaronson
12, Miles Robinson
15, Cristian Roldan
18, Max Arfsten
19, Haji Wright
22, Mark McKenzie
23, Joe Scally
26, Alejandro Zendejas
Ali PAR 4-4-2
12, Orlando Gill, GK (5.6)
6, Júnior Alonso, LB (5.3)
3, Omar Alderete, CB (5.8)
15, Gustavo Gómez, CB (C) (5.2)
4, Juan José Cáceres, RB (6.5) - 2, Gustavo Velázquez 79’ (6.0)
10, Miguel Almirón, LM (7.0) - 7, Ramón Sosa 79’ (6.3)
16, Damián Bobadilla, CM (5.0) - 11, Maurício 45’ (7.4)
14, Andrés Cubas, CM (6.3)
8, Diego Gómez, RM (6.4) - 17, Alejandro Romero Gamarra 79’ (6.1)
9, Antonio Sanabria, ST (5.7) - 18, Álex Arce 62’ (6.0)
19, Julio Enciso, ST (7.8)
DT, Gustavo Alfaro
Sub PAR
1, Gatito Fernández, GK
22, Gastón Olveira, GK
5, Fabián Balbuena
13, José Canale
20, Braian Ojeda
21, Gabriel Ávalos
23, Matías Galarza
24, Gustavo Caballero
25, Isidro Pitta
26, Alexandro Maidana
POS: 65, 35 - TIR: 16, 9 - TPO: 6, 1 - FAL: 13, 17 - AMA: 1, 5 - ROJ: 0, 0 - ESQ: 3, 1 - ATA: 0, 3
Kit USA J1 C2, P1 C1 - Kit PAR J2 C1, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP USA Folarin Balogun

Partido 5
Haití 0 - Escocia 1
13 jun 2026 · 21:00 UTC−4
Clima: 25 °C, Despejado
Estadio Boston, Boston, Estados Unidos
Asistencia: 64,146
ARB Mustapha Ghorbal (ALG) - AA1 Mokrane Gourari (ALG) - AA2 Abbes Akram Zerhouni (ALG) - 4AR Alejandro Hernández Hernández (ESP) - VAR Abdullah Al-Shehri (KSA) - AVAR Mohammed Obaid Khadim (UAE)
Incidencias:
Gol SCO John McGinn 28’
Ama HAI Jean-Ricner Bellegarde 39’
Ama SCO Aaron Hickey 46’
Ama SCO Findlay Curtis 90+1’
Ama SCO Kenny McLean 90+5’
FT 90+8’
Ali HAI 4-4-2
1, Johny Placide, GK (C) (6.4)
8, Martin Expérience, LB (7.1)
5, Hannes Delcroix, CB (6.9)
4, Ricardo Adé, CB (6.7)
2, Carlens Arcus, RB (6.4)
15, Ruben Providence, LM (6.5) - 19, Yassin Fortuné 85’ (SC)
10, Jean-Ricner Bellegarde, CM (7.2)
17, Danley Jean Jacques, CM (7.3)
11, Louicius Deedson, RM (6.5) - 21, Josué Casimir 61’ (6.2)
20, Frantzdy Pierrot, ST (6.0)
18, Wilson Isidor, ST (5.9) - 16, Lenny Joseph 75’ (6.0)
DT, Sébastien Migné
Sub HAI
12, Alexandre Pierre, GK
23, Josué Duverger, GK
3, Keeto Thermoncy
6, Carl Sainté
7, Derrick Etienne Jr.
9, Duckens Nazon
13, Duke Lacroix
14, Garven Metusala
22, Jean-Kévin Duverne
24, Wilguens Paugain
25, Dominique Simon
26, Woodensky Pierre
Ali SCO 4-4-2
1, Angus Gunn, GK (7.7)
3, Andy Robertson, LB (C) (7.3)
13, Jack Hendry, CB (6.8)
5, Grant Hanley, CB (6.8)
2, Aaron Hickey, RB (7.3) - 22, Nathan Patterson 75’ (6.2)
7, John McGinn, LM (7.8) - 25, Findlay Curtis 82’ (SC)
19, Lewis Ferguson, CM (7.3)
4, Scott McTominay, CM (6.8)
17, Ben Gannon-Doak, RM (7.0) - 11, Ryan Christie 75’ (6.4)
10, Ché Adams, ST (6.4) - 9, Lyndon Dykes 75’ (6.1)
20, Lawrence Shankland, ST (6.8) - 23, Kenny McLean 82’ (SC)
DT, Steve Clarke
Sub SCO
12, Liam Kelly, GK
21, Craig Gordon, GK
6, Kieran Tierney
8, Tyler Fletcher
14, Ross Stewart
15, John Souttar
16, Dominic Hyam
18, George Hirst
24, Anthony Ralston
26, Scott McKenna
POS: 52, 48 - TIR: 15, 9 - TPO: 2, 2 - FAL: 23, 21 - AMA: 1, 3 - ROJ: 0, 0 - ESQ: 4, 3 - ATA: 1, 2
Kit HAI J2 C1, P1 C1 - Kit SCO J2 C1, P3 C1 - Kit ARB TorFWC26 R1 C1
JDP SCO John McGinn

Partido 6
Australia 2 - Turquía 0
13 jun 2026 · 21:00 UTC−7
Clima: 23 °C, Parcialmente nublado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Jesús Valenzuela (VEN) - AA1 Jorge Urrego (VEN) - AA2 Tulio Moreno (VEN) - 4AR Kevin Ortega (PER) - VAR Tatiana Guzmán (NCA) - AVAR Juan Soto (VEN)
Incidencias:
Gol AUS Nestory Irankunda 27’ - Asi AUS Paul Okon-Engstler
Gol AUS Connor Metcalfe 75’
Ama TUR Yunus Akgün 86’
FT 90+6’
Ali AUS 5-4-1
18, Patrick Beach, GK (8.9)
5, Jordan Bos, LB (6.8) - 16, Aziz Behich 83’ (SC)
21, Cameron Burgess, CB (7.3)
19, Harry Souttar, CB (C) (7.8)
3, Alessandro Circati, CB (7.2)
4, Jacob Italiano, RB (7.1) - 6, Jason Geria 74’ (6.4)
17, Nestory Irankunda, LM (7.6) - 23, Nishan Velupillay 61’ (6.1)
24, Paul Okon-Engstler, CM (8.1) - 22, Jackson Irvine 83’ (SC)
13, Aiden O'Neill, CM (7.4)
8, Connor Metcalfe, RM (8.0)
9, Mohamed Touré, ST (6.6) - 26, Tete Yengi 74’ (6.2)
DT, Tony Popovic
Sub AUS
1, Mathew Ryan, GK
12, Paul Izzo, GK
2, Miloš Degenek
7, Mathew Leckie
10, Ajdin Hrustic
11, Awer Mabil
14, Cameron Devlin
15, Kai Trewin
20, Cristian Volpato
25, Lucas Herrington
Ali TUR 4-2-3-1 (W)
23, Uğurcan Çakır, GK (6.0)
20, Ferdi Kadıoğlu, LB (7.6)
14, Abdülkerim Bardakcı, CB (7.0)
3, Merih Demiral, CB (6.5)
2, Zeki Çelik, RB (6.4) - 18, Mert Müldür 80’ (SC)
10, Hakan Çalhanoğlu, CDM (C) (7.4)
16, İsmail Yüksek, CDM (7.0) - 5, Salih Özcan 80’ (SC)
21, Barış Alper Yılmaz, LM (5.6) - 11, Kenan Yıldız 45’ (7.2)
6, Orkun Kökçü, CAM (6.9) - 19, Yunus Akgün 62’ (6.6)
8, Arda Güler, RM (7.4)
7, Kerem Aktürkoğlu, ST (6.1) - 9, Deniz Gül 85’ (SC)
DT, Vincenzo Montella
Sub TUR
1, Mert Günok, GK
12, Altay Bayındır, GK
4, Çağlar Söyüncü
13, Eren Elmalı
15, Ozan Kabak
17, İrfan Can Kahveci
22, Kaan Ayhan
24, Oğuz Aydın
25, Samet Akaydin
26, Can Uzun
POS: 29, 71 - TIR: 9, 30 - TPO: 4, 8 - FAL: 12, 4 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 5, 8 - ATA: 7, 2
Kit AUS J1 C1, P2 C1 - Kit TUR J1 C1, P1 C1 - Kit ARB TorFWC26 R4 C1
JDP AUS Nestory Irankunda ALT

Partido 7
Brasil 1 - Marruecos 1
13 jun 2026 · 18:00 UTC−4
Clima: 31 °C, Soleado
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Slavko Vinčić (SVN) - AA1 Tomaž Klančnik (SVN) - AA2 Andraž Kovačič (SVN) - 4AR Sandro Schärer (SUI) - VAR Bastian Dankert (GER) - AVAR Willy Delajod (FRA)
Incidencias:
Gol MAR Ismael Saibari 21’ - Asi MAR Brahim Díaz
Gol BRA Vinícius Júnior 32’ - Asi BRA Bruno Guimarães
Ama BRA Casemiro 37’
Ama BRA Roger Ibañez 43’
FT 90+10’
Ali BRA 4-4-2
1, Alisson, GK (6.7)
16, Douglas Santos, LB (7.7)
3, Gabriel Magalhães, CB (6.9)
4, Marquinhos, CB (C) (7.0)
24, Roger Ibañez, RB (6.6) - 13, Danilo Luiz 45’ (6.4)
7, Vinícius Júnior, LM (7.7)
5, Casemiro, CM (6.4) - 17, Fabinho 45’ (6.4)
8, Bruno Guimarães, CM (6.9) - 18, Danilo Santos 80’ (6.1)
20, Lucas Paquetá, RM (7.2) - 9, Matheus Cunha 61’ (6.3)
11, Raphinha, ST (7.1)
25, Igor Thiago, ST (6.5) - 21, Luiz Henrique 61’ (6.5)
DT, Carlo Ancelotti
Sub BRA
12, Weverton, GK
23, Ederson, GK
2, Éderson Silva
6, Alex Sandro
14, Bremer
15, Léo Pereira
19, Endrick
22, Gabriel Martinelli
26, Rayan
Ali MAR 4-2-3-1 (W)
1, Yassine Bounou, GK (7.5)
3, Noussair Mazraoui, LB (7.5) - 26, Anass Salah-Eddine 80’ (5.9)
18, Chadi Riad, CB (7.1)
14, Issa Diop, CB (6.6)
2, Achraf Hakimi, RB (C) (7.6)
6, Ayyoub Bouaddi, CDM (7.2)
24, Neil El Aynaoui, CDM (7.4)
23, Bilal El Khannouss, LM (7.7) - 21, Ayoube Amaimouni 80’ (6.2)
8, Azzedine Ounahi, CAM (7.6) - 15, Samir El Mourabet 64’ (6.3)
10, Brahim Díaz, RM (7.4) - 7, Chemsdine Talbi 64’ (6.1)
11, Ismael Saibari, ST (7.8) - 9, Soufiane Rahimi 89’ (SC)
DT, Mohamed Ouahbi
Sub MAR
12, Munir El Kajoui, GK
22, Ahmed Reda Tagnaouti, GK
4, Sofyan Amrabat
5, Marwane Saâdane
13, Zakaria El Ouahdi
16, Gessime Yassine
17, Amine Sbaï
19, Youssef Belammari
20, Ayoub El Kaabi
25, Redouane Halhal
POS: 51, 49 - TIR: 13, 14 - TPO: 5, 3 - FAL: 16, 14 - AMA: 2, 0 - ROJ: 0, 0 - ESQ: 6, 2 - ATA: 2, 4
Kit BRA J1 C1, P1 C1 - Kit MAR J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP BRA Vinícius Júnior

Partido 8
Catar 1 - Suiza 1
13 jun 2026 · 12:00 UTC−7
Clima: 26 °C, Soleado
Estadio Bahía de San Francisco, San Francisco, Estados Unidos
Asistencia: 67,966
ARB Saíd Martínez (HON) - AA1 Walter López (HON) - AA2 Christian Ramírez (HON) - 4AR Oshane Nation (JAM) - VAR Guillermo Pacheco (MEX) - AVAR Erick Miranda (MEX)
Incidencias:
Ama QAT Mahmud Abunada 14’
Gol SUI Breel Embolo 17’ (PEN)
Ama QAT Jassem Gaber 23’
Ama SUI Denis Zakaria 42’
Gol QAT Miro Muheim 90+4’ (GEC)
FT 90+7’
Ali QAT 4-2-3-1 (W)
1, Mahmud Abunada, GK (7.7)
14, Homam Ahmed, LB (7.2)
16, Boualem Khoukhi, CB (C) (6.9)
2, Pedro Miguel, CB (7.3)
13, Ayoub Al-Oui, RB (6.4) - 20, Ahmed Fathy 60’ (6.9)
4, Issa Laye, CDM (6.8)
5, Jassem Gaber, CDM (6.1) - 12, Karim Boudiaf 60’ (6.3)
11, Akram Afif, LM (6.9)
23, Assim Madibo, CAM (6.4) - 26, Mohamed Manai 79’ (SC)
8, Edmilson Junior, RM (6.3) - 10, Hassan Al-Haydos 88’ (SC)
15, Yusuf Abdurisag, ST (6.8) - 7, Ahmed Alaaeldin 60’ (6.4)
DT, Julen Lopetegui
Sub QAT
21, Salah Zakaria, GK
22, Meshaal Barsham, GK
3, Lucas Mendes
6, Abdulaziz Hatem
9, Mohammed Muntari
17, Ahmed Al-Ganehi
18, Sultan Al-Brake
19, Almoez Ali
24, Tahsin Jamshid
25, Al-Hashmi Al-Hussain
Ali SUI 4-3-3
1, Gregor Kobel, GK (7.5)
13, Ricardo Rodriguez, LB (7.8) - 2, Miro Muheim 89’ (SC)
5, Manuel Akanji, CB (7.4)
4, Nico Elvedi, CB (7.3)
6, Denis Zakaria, RB (7.5)
8, Remo Freuler, CM (7.1) - 14, Ardon Jashari 89’ (SC)
10, Granit Xhaka, CM (C) (7.3)
20, Michel Aebischer, CM (7.2) - 22, Fabian Rieder 66’ (6.1)
17, Rubén Vargas, LW (8.1) - 23, Zeki Amdouni 79’ (6.6)
7, Breel Embolo, ST (8.0)
11, Dan Ndoye, RW (7.2) - 9, Johan Manzambi 66’ (5.9)
DT, Murat Yakin
Sub SUI
12, Yvon Mvogo, GK
21, Marvin Keller, GK
3, Silvan Widmer
15, Djibril Sow
16, Christian Fassnacht
18, Eray Cömert
19, Noah Okafor
24, Aurèle Amenda
25, Luca Jaquez
26, Cedric Itten
POS: 34, 66 - TIR: 6, 26 - TPO: 3, 7 - FAL: 12, 11 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 3, 10 - ATA: 5, 3
Kit QAT J1 C1, P1 C1 - Kit SUI J2 C1, P2 C1 - Kit ARB TorFWC26 R2 C1
JDP QAT Mahmud Abunada ALT

Partido 9
Costa de Marfil 1 - Ecuador 0
14 jun 2026 · 19:00 UTC−4
Clima: 28 °C, Nublado
Estadio Filadelfia, Filadelfia, Estados Unidos
Asistencia: 68,274
ARB François Letexier (FRA) - AA1 Cyril Mugnier (FRA) - AA2 Mehdi Rahmouni (FRA) - 4AR Khalid Al-Turais (KSA) - VAR Jarred Gillett (ENG) - AVAR Willy Delajod (FRA)
Incidencias:
Ama CIV Seko Fofana 28’
Ama CIV Franck Kessié 38’
Ama CIV Guéla Doué 40’
Ama ECU Jackson Porozo 73’
Gol CIV Amad Diallo 90’ - Asi CIV Wilfried Singo
FT 90+8’
Ali CIV 4-4-2
1, Yahia Fofana, GK (7.6)
3, Ghislain Konan, LB (7.0)
20, Emmanuel Agbadou, CB (7.7)
5, Wilfried Singo, CB (8.3)
17, Guéla Doué, RB (7.6) - 7, Odilon Kossounou 89’ (SC)
24, Bazoumana Touré, LM (6.2) - 15, Amad Diallo 56’ (8.1)
6, Seko Fofana, CM (6.9) - 18, Ibrahim Sangaré 77’ (6.3)
8, Franck Kessié, CM (C) (7.5)
11, Yan Diomande, RM (8.3)
12, Elye Wahi, ST (6.6) - 9, Ange-Yoan Bonny 56’ (6.3)
19, Nicolas Pépé, ST (6.7) - 26, Christ Inao Oulaï 77’ (6.6)
DT, Emerse Faé
Sub CIV
16, Mohamed Koné, GK
23, Alban Lafont, GK
2, Ousmane Diomande
4, Jean Michaël Seri
10, Simon Adingra
13, Christopher Opéri
14, Oumar Diakité
21, Evan Ndicka
22, Evann Guessand
25, Parfait Guiagon
Ali ECU 4-4-2
1, Hernán Galíndez, GK (6.5)
3, Piero Hincapié, LB (6.5)
6, Willian Pacho, CB (6.9)
4, Joel Ordóñez, CB (6.9)
21, Alan Franco, RB (6.9) - 25, Jackson Porozo 62’ (5.8)
14, Alan Minda, LM (6.6) - 20, Nilson Angulo 56’ (6.1)
15, Pedro Vite, CM (7.3)
23, Moisés Caicedo, CM (6.9)
9, John Yeboah, RM (6.9) - 17, Ángelo Preciado 62’ (6.0)
13, Enner Valencia, ST (C) (6.6) - 11, Kevin Rodríguez 77’ (5.7)
19, Gonzalo Plata, ST (7.3)
DT, Sebastián Beccacece
Sub ECU
12, Moisés Ramírez, GK
22, Gonzalo Valle, GK
2, Félix Torres
5, Jordy Alcívar
7, Pervis Estupiñán
8, Anthony Valencia
10, Kendry Páez
16, Jordy Caicedo
18, Denil Castillo
24, Jeremy Arévalo
26, Yaimar Medina
POS: 48, 52 - TIR: 15, 12 - TPO: 4, 1 - FAL: 10, 13 - AMA: 3, 1 - ROJ: 0, 0 - ESQ: 3, 5 - ATA: 1, 3
Kit CIV J1 C1, P2 C1 - Kit ECU J2 C1, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP CIV Yan Diomande ALT

Partido 10
Alemania 7 - Curazao 1
14 jun 2026 · 12:00 UTC−5
Clima: 30 °C, Llovizna · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,021
ARB Jalal Jayed (MAR) - AA1 Zakaria Brinsi (MAR) - AA2 Mostafa Akarkad (MAR) - 4AR Abongile Tom (RSA) - VAR Hamza El Fariq (MAR) - AVAR Nicolás Gallo Barragán (COL)
Incidencias:
Gol GER Felix Nmecha 6’ - Asi GER Florian Wirtz
Gol CUW Livano Comenencia 21’
Gol GER Nico Schlotterbeck 38’ - Asi GER Nathaniel Brown
Gol GER Kai Havertz 45+5’ (PEN)
Gol GER Jamal Musiala 47’ - Asi GER Joshua Kimmich
Gol GER Nathaniel Brown 68’ - Asi GER Deniz Undav
Gol GER Deniz Undav 78’ - Asi GER Joshua Kimmich
Gol GER Kai Havertz 88’ - Asi GER Deniz Undav
FT 90+5’
Ali GER 3-4-3
1, Manuel Neuer, GK (6.6)
15, Nico Schlotterbeck, CB (8.9)
4, Jonathan Tah, CB (6.9) - 2, Antonio Rüdiger 72’ (6.3)
6, Joshua Kimmich, CB (C) (8.8) - 3, Waldemar Anton 83’ (SC)
18, Nathaniel Brown, LM (8.5) - 22, David Raum 72’ (6.3)
5, Aleksandar Pavlović, CM (7.6)
10, Jamal Musiala, CM (8.3) - 26, Deniz Undav 64’ (8.8)
23, Felix Nmecha, RM (8.6) - 8, Leon Goretzka 72’ (6.0)
17, Florian Wirtz, LW (8.4)
7, Kai Havertz, ST (8.9)
19, Leroy Sané, RW (7.2)
DT, Julian Nagelsmann
Sub GER
12, Oliver Baumann, GK
21, Alexander Nübel, GK
9, Jamie Leweling
11, Nick Woltemade
13, Pascal Groß
14, Maximilian Beier
16, Angelo Stiller
20, Nadiem Amiri
24, Malick Thiaw
25, Assan Ouédraogo
Ali CUW 4-3-3 (H)
1, Eloy Room, GK (4.1)
24, Deveron Fonville, LB (4.8)
18, Armando Obispo, CB (5.3)
23, Riechedly Bazoer, CB (4.1)
5, Sherel Floranus, RB (4.9)
21, Tahith Chong, CM (7.0) - 19, Gervane Kastaneer 82’ (SC)
10, Leandro Bacuna, CDM (C) (5.8)
8, Livano Comenencia, CM (8.1)
7, Juninho Bacuna, LW (7.4)
9, Jürgen Locadia, ST (6.0) - 16, Jearl Margaritha 65’ (5.8)
12, Sontje Hansen, RW (6.6) - 11, Jeremy Antonisse 45’ (6.4)
DT, Dick Advocaat
Sub CUW
25, Tyrick Bodak, GK
26, Trevor Doornbusch, GK
2, Shurandy Sambo
3, Juriën Gaari
4, Roshon van Eijma
6, Godfried Roemeratoe
13, Tyrese Noslin
14, Kenji Gorré
15, Ar'jany Martha
17, Brandley Kuwas
20, Joshua Brenet
22, Kevin Felida
POS: 64, 36 - TIR: 26, 8 - TPO: 11, 2 - FAL: 18, 11 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 8, 1 - ATA: 1, 4
Kit GER J1 C1, P1 C1 - Kit CUW J1 C2, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP GER Kai Havertz

Partido 11
Países Bajos 2 - Japón 2
14 jun 2026 · 15:00 UTC−5
Clima: 29 °C, Nublado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 69,285
ARB Ismail Elfath (USA) - AA1 Corey Parker (USA) - AA2 Kyle Atkins (USA) - 4AR Katia Itzel García (MEX) - VAR Armando Villarreal (USA) - AVAR Rodolpho Toski (BRA)
Incidencias:
Gol NED Virgil van Dijk 51’ - Asi NED Ryan Gravenberch
Gol JPN Keito Nakamura 57’ - Asi JPN Takefusa Kubo
Ama NED Crysencio Summerville 61’
Gol NED Crysencio Summerville 64’ - Asi NED Ryan Gravenberch
Ama NED Memphis Depay 83’
Gol JPN Daichi Kamada 89’ - Asi JPN Kōki Ogawa
Ama NED Micky van de Ven 90+1’
FT 90+6’
Ali NED 4-3-3 (H)
1, Bart Verbruggen, GK (5.8)
15, Micky van de Ven, LB (6.6)
4, Virgil van Dijk, CB (C) (7.9)
6, Jan Paul van Hecke, CB (7.3)
22, Denzel Dumfries, RB (6.7)
14, Tijjani Reijnders, CM (6.8) - 26, Quinten Timber 70’ (6.5)
21, Frenkie de Jong, CDM (7.9)
8, Ryan Gravenberch, CM (8.4) - 5, Nathan Aké 81’ (SC)
11, Cody Gakpo, LW (7.2) - 19, Brian Brobbey 85’ (SC)
18, Donyell Malen, ST (6.8) - 10, Memphis Depay 70’ (6.1)
24, Crysencio Summerville, RW (7.8) - 20, Teun Koopmeiners 70’ (6.1)
DT, Ronald Koeman
Sub NED
13, Robin Roefs, GK
23, Mark Flekken, GK
2, Lutsharel Geertruida
3, Marten de Roon
7, Justin Kluivert
9, Wout Weghorst
12, Mats Wieffer
16, Guus Til
17, Noa Lang
25, Jorrel Hato
Ali JPN 3-4-3
1, Zion Suzuki, GK (6.7)
21, Hiroki Itō, CB (5.8)
3, Shōgo Taniguchi, CB (6.7)
16, Tsuyoshi Watanabe, CB (6.6) - 22, Takehiro Tomiyasu 75’ (6.4)
13, Keito Nakamura, LM (8.1)
15, Daichi Kamada, CM (8.1)
24, Kaishū Sano, CM (6.2)
10, Ritsu Dōan, RM (C) (6.4) - 2, Yukinari Sugawara 75’ (6.5)
11, Daizen Maeda, LW (6.0) - 14, Junya Itō 66’ (6.7)
18, Ayase Ueda, ST (6.5) - 26, Kento Shiogai 84’ (SC)
8, Takefusa Kubo, RW (7.2) - 19, Kōki Ogawa 75’ (6.8)
DT, Hajime Moriyasu
Sub JPN
12, Keisuke Ōsako, GK
23, Tomoki Hayakawa, GK
4, Kō Itakura
5, Yūto Nagatomo
6, Shūto Machino
7, Ao Tanaka
9, Keisuke Gotō
17, Yuito Suzuki
20, Ayumu Seko
25, Junnosuke Suzuki
POS: 60, 40 - TIR: 10, 10 - TPO: 6, 3 - FAL: 7, 7 - AMA: 3, 0 - ROJ: 0, 0 - ESQ: 5, 4 - ATA: 1, 4
Kit NED J1 C2, P1 C1 - Kit JPN J1 C1, P2 C1 - Kit ARB TorFWC26 R2 C1
JDP NED Virgil van Dijk ALT

Partido 12
Suecia 5 - Túnez 1
14 jun 2026 · 20:00 UTC−6
Clima: 26 °C, Nublado
Estadio Monterrey, Monterrey, México
Asistencia: 50,987
ARB Yael Falcón (ARG) - AA1 Maximiliano Del Yesso (ARG) - AA2 Facundo Rodríguez (ARG) - 4AR Juan Gabriel Calderón (CRC) - VAR Juan Lara (CHI) - AVAR Antonio García (URU)
Incidencias:
Gol SWE Yasin Ayari 7’
Gol SWE Alexander Isak 30’ - Asi SWE Viktor Gyökeres
Gol TUN Omar Rekik 43’ - Asi TUN Hannibal Mejbri
Ama TUN Rani Khedira 54’
Gol SWE Viktor Gyökeres 59’ - Asi SWE Alexander Isak
Gol SWE Mattias Svanberg 84’ - Asi SWE Alexander Isak
Gol SWE Yasin Ayari 90+6’ - Asi SWE Lucas Bergvall
FT 90+6’
Ali SWE 3-4-1-2
23, Kristoffer Nordfeldt, GK (6.3)
3, Victor Lindelöf, CB (C) (7.0)
4, Isak Hien, CB (7.1)
2, Gustaf Lagerbielke, CB (6.7)
5, Gabriel Gudmundsson, LM (7.2) - 24, Elliot Stroud 64’ (6.2)
18, Yasin Ayari, CM (8.9)
16, Jesper Karlström, CM (6.9) - 19, Mattias Svanberg 84’ (SC)
21, Alexander Bernhardsson, RM (6.9) - 8, Daniel Svensson 90’ (SC)
10, Benjamin Nygren, CAM (6.7) - 7, Lucas Bergvall 64’ (7.4)
9, Alexander Isak, ST (8.8) - 11, Anthony Elanga 90’ (SC)
17, Viktor Gyökeres, ST (8.7)
DT, Graham Potter
Sub SWE
1, Jacob Widell Zetterström, GK
12, Viktor Johansson, GK
6, Herman Johansson
13, Ken Sema
14, Hjalmar Ekdal
15, Carl Starfelt
20, Eric Smith
22, Besfort Zeneli
25, Gustaf Nilsson
26, Taha Ali
Ali TUN 5-3-2
1, Mouhib Chamakh, GK (1.9)
2, Ali Abdi, LB (4.6)
21, Mohamed Amine Ben Hamida, CB (6.0)
3, Montassar Talbi, CB (5.4)
4, Omar Rekik, CB (6.1)
20, Yan Valery, RB (5.4) - 15, Hadj Mahmoud 72’ (6.5)
10, Hannibal Mejbri, CM (8.0)
17, Ellyes Skhiri, CDM (C) (5.8) - 7, Elias Achouri 72’ (6.2)
13, Rani Khedira, CM (5.7) - 11, Ismaël Gharbi 84’ (SC)
25, Anis Slimane, ST (6.4) - 19, Firas Chaouat 84’ (SC)
8, Elias Saad, ST (6.3) - 26, Sebastian Tounekti 72’ (5.8)
DT, Sabri Lamouchi
Sub TUN
16, Aymen Dahmen, GK
22, Sabri Ben Hessen, GK
5, Adem Arous
6, Dylan Bronn
9, Hazem Mastouri
12, Mortadha Ben Ouanes
14, Khalil Ayari
18, Rayan Elloumi
23, Moutaz Neffati
24, Raed Chikhaoui
POS: 48, 52 - TIR: 13, 6 - TPO: 7, 2 - FAL: 10, 8 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 4, 2 - ATA: 1, 1
Kit SWE J1 C1, P1 C1 - Kit TUN J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP SWE Isak Hien

Partido 13
Arabia Saudita 1 - Uruguay 1
15 jun 2026 · 18:00 UTC−4
Clima: 32 °C, Llovizna
Estadio Miami, Miami, Estados Unidos
Asistencia: 62,764
ARB Maurizio Mariani (ITA) - AA1 Daniele Bindoni (ITA) - AA2 Alberto Tegoni (ITA) - 4AR Drew Fischer (CAN) - VAR Marco Di Bello (ITA) - AVAR Ivan Bebek (CRO)
Incidencias:
Gol KSA Abdulelah Al-Amri 41’
Ama KSA Abdulelah Al-Amri 44’
Gol URU Maximiliano Araújo 80’
FT 90+8’
Ali KSA 4-4-2
21, Mohammed Al-Owais, GK (7.4)
24, Moteb Al-Harbi, LB (7.0) - 19, Abdullah Al-Hamddan 90+2’ (SC)
5, Hassan Al-Tambakti, CB (6.3)
4, Abdulelah Al-Amri, CB (8.0)
12, Saud Abdulhamid, RB (6.9) - 3, Ali Lajami 90+2’ (SC)
10, Salem Al-Dawsari, LM (C) (6.4)
15, Abdullah Al-Khaibari, CM (6.5)
23, Mohamed Kanno, CM (7.3)
26, Mohammed Abu Al-Shamat, RM (6.3) - 13, Nawaf Boushal 81’ (SC)
7, Musab Al-Juwayr, ST (6.8) - 6, Nasser Al-Dawsari 63’ (6.5)
9, Feras Al-Buraikan, ST (6.4) - 18, Alaa Al-Hajji 90+2’ (SC)
DT, Georgios Donis
Sub KSA
1, Nawaf Al-Aqidi, GK
22, Ahmed Al-Kassar, GK
2, Ali Majrashi
8, Aiman Yahya
11, Saleh Al-Shehri
14, Hassan Kadish
16, Ziyad Al-Johani
17, Khalid Al-Ghannam
20, Sultan Mandash
25, Jehad Thakri
Ali URU 4-4-2
23, Fernando Muslera, GK (5.6)
17, Matías Viña, LB (6.4) - 25, Juan Manuel Sanabria 45’ (6.7)
16, Mathías Olivera, CB (7.9)
3, Sebastián Cáceres, CB (6.9)
13, Guillermo Varela, RB (7.5)
20, Maximiliano Araújo, LM (8.1) - 18, Brian Rodríguez 81’ (SC)
6, Rodrigo Bentancur, CM (8.0)
5, Manuel Ugarte, CM (7.1) - 7, Nicolás de la Cruz 72’ (7.2)
8, Federico Valverde, RM (C) (6.8)
9, Darwin Núñez, ST (6.3) - 14, Agustín Canobbio 45’ (6.6)
21, Federico Viñas, ST (6.9) - 19, Rodrigo Aguirre 90’ (SC)
DT, Marcelo Bielsa
Sub URU
1, Sergio Rochet, GK
12, Santiago Mele, GK
2, José María Giménez
11, Facundo Pellistri
15, Emiliano Martínez
22, Joaquín Piquerez
24, Santiago Bueno
26, Rodrigo Zalazar
POS: 33, 67 - TIR: 7, 29 - TPO: 3, 11 - FAL: 11, 6 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 4, 14 - ATA: 9, 2
Kit KSA J1 C1, P1 C1 - Kit URU J1 C2, P1 C1 - Kit ARB TorFWC26 R7 C2
JDP URU Federico Valverde

Partido 14
España 0 - Cabo Verde 0
15 jun 2026 · 12:00 UTC−4
Clima: 26 °C, Nublado · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 67,640
ARB Adham Makhadmeh (JOR) - AA1 Mohammad Al-Kalaf (JOR) - AA2 Ahmad Al-Roalle (JOR) - 4AR Andrés Rojas (COL) - VAR Joe Dickerson (USA) - AVAR Khamis Al-Marri (QAT)
Incidencias:
Ama CPV Sidny Lopes Cabral 16’
Ama ESP Pedri 90+3’
FT 90+5’
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (7.4)
24, Marc Cucurella, LB (7.4)
14, Aymeric Laporte, CB (7.5)
22, Pau Cubarsí, CB (7.9)
5, Marcos Llorente, RB (7.9)
20, Pedri, CM (8.6)
16, Rodri, CDM (C) (7.8) - 17, Nico Williams 87’ (SC)
8, Fabián Ruiz, CM (7.5) - 6, Mikel Merino 71’ (6.7)
9, Gavi, LW (6.8) - 19, Lamine Yamal 71’ (6.4)
21, Mikel Oyarzabal, ST (6.2)
7, Ferran Torres, RW (6.6) - 10, Dani Olmo 81’ (SC)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
4, Eric García
11, Yéremy Pino
12, Pedro Porro
15, Álex Baena
18, Martín Zubimendi
25, Víctor Muñoz
26, Borja Iglesias
Ali CPV 4-3-3 (H)
1, Vozinha, GK (9.0)
13, Sidny Lopes Cabral, LB (7.2) - 8, João Paulo 76’ (6.6)
3, Diney Borges, CB (7.8)
4, Pico Lopes, CB (7.1)
22, Steven Moreira, RB (6.5)
10, Jamiro Monteiro, CM (7.2) - 18, Telmo Arcanjo 79’ (6.3)
6, Kevin Pina, CDM (6.7)
15, Laros Duarte, CM (6.0) - 14, Deroy Duarte 61’ (6.6)
7, Jovane Cabral, LW (7.0) - 17, Willy Semedo 61’ (5.9)
19, Dailon Livramento, ST (6.0) - 21, Nuno da Costa 61’ (6.1)
20, Ryan Mendes, RW (C) (6.5)
DT, Bubista
Sub CPV
12, Márcio Rosa, GK
23, CJ dos Santos, GK
2, Stopira
5, Logan Costa
9, Gilson Benchimol
11, Garry Rodrigues
16, Yannick Semedo
24, Wagner Pina
25, Kelvin Pires
26, Hélio Varela
POS: 73, 27 - TIR: 27, 6 - TPO: 7, 1 - FAL: 10, 1 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 11, 1 - ATA: 1, 7
Kit ESP J1 C1, P1 C1 - Kit CPV J2 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP CPV Vozinha

Partido 15
Irán 2 - Nueva Zelanda 2
15 jun 2026 · 18:00 UTC−7
Clima: 22 °C, Soleado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,108
ARB César Arturo Ramos (MEX) - AA1 Alberto Morín (MEX) - AA2 Marco Bisguerra (MEX) - 4AR Yusuke Araki (JPN) - VAR Erick Miranda (MEX) - AVAR Fedayi San (SUI)
Incidencias:
Gol NZL Elijah Just 7’ - Asi NZL Chris Wood
Gol IRN Ramin Rezaeian 32’
Gol NZL Elijah Just 54’ - Asi NZL Chris Wood
Gol IRN Mohammad Mohebbi 64’ - Asi IRN Ramin Rezaeian
Ama IRN Ehsan Hajisafi 89’
FT 90+5’
Ali IRN 4-3-3
1, Alireza Beiranvand, GK (6.1)
5, Milad Mohammadi, LB (6.0)
19, Ali Nemati, CB (6.4)
4, Shoja Khalilzadeh, CB (6.4)
23, Ramin Rezaeian, RB (8.6)
9, Mehdi Taremi, CM (C) (7.5) - 18, Amirhossein Hosseinzadeh 80’ (6.3)
6, Saeid Ezatolahi, CM (7.1)
14, Saman Ghoddos, CM (7.3) - 3, Ehsan Hajisafi 65’ (6.1)
17, Arya Yousefi, LW (6.5) - 10, Mehdi Ghayedi 45’ (6.1)
20, Shahriyar Moghanloo, ST (7.2) - 11, Ali Alipour 53’ (6.4)
8, Mohammad Mohebbi, RW (8.0)
DT, Amir Ghalenoei
Sub IRN
12, Payam Niazmand, GK
22, Hossein Hosseini, GK
2, Saleh Hardani
7, Alireza Jahanbakhsh
13, Hossein Kanani
15, Roozbeh Cheshmi
16, Mehdi Torabi
21, Mohammad Ghorbani
24, Dennis Dargahi
25, Danial Iri
26, Amirmohammad Razaghinia
Ali NZL 4-4-2
1, Max Crocombe, GK (6.1)
13, Liberato Cacace, LB (6.3) - 19, Ben Old 68’ (5.9)
5, Michael Boxall, CB (6.3)
16, Finn Surman, CB (7.1)
2, Tim Payne, RB (6.3) - 24, Callan Elliot 77’ (6.3)
11, Elijah Just, LM (8.9)
8, Marko Stamenić, CM (6.4) - 4, Tyler Bindon 90+2’ (SC)
6, Joe Bell, CM (6.8)
10, Sarpreet Singh, RM (6.9) - 21, Jesse Randall 90+2’ (SC)
9, Chris Wood, ST (C) (8.2)
20, Callum McCowatt, ST (7.2) - 23, Ryan Thomas 68’ (5.8)
DT, Darren Bazeley
Sub NZL
12, Alex Paulsen, GK
22, Michael Woud, GK
3, Francis de Vries
14, Alex Rufer
15, Nando Pijnaker
17, Kosta Barbarouses
18, Ben Waine
25, Lachlan Bayliss
26, Tommy Smith
POS: 48, 52 - TIR: 17, 14 - TPO: 4, 8 - FAL: 10, 8 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 4, 1 - ATA: 4, 2
Kit IRN J1 C1, P1 C1 - Kit NZL J1 C1, P2 C1 - Kit ARB TorFWC26 R2 C1
JDP IRN Ramin Rezaeian ALT

Partido 16
Bélgica 1 - Egipto 1
15 jun 2026 · 12:00 UTC−7
Clima: 28 °C, Parcialmente nublado
Estadio Seattle, Seattle, Estados Unidos
Asistencia: 66,775
ARB Ramon Abatti (BRA) - AA1 Danilo Manis (BRA) - AA2 Rafael Alves (BRA) - 4AR Kevin Ortega (PER) - VAR Juan Soto (VEN) - AVAR Leodán González (URU)
Incidencias:
Ama EGY Marwan Attia 13’
Ama BEL Timothy Castagne 14’
Gol EGY Emam Ashour 20’ - Asi EGY Mohamed Salah
Ama EGY Ahmed Fatouh 34’
Gol BEL Mohamed Hany 66’ (GEC)
Ama BEL Maxim De Cuyper 75’
FT 90+5’
Ali BEL 4-2-3-1 (W)
1, Thibaut Courtois, GK (7.0)
21, Timothy Castagne, LB (7.5) - 23, Nicolas Raskin 56’ (6.8)
4, Brandon Mechele, CB (7.6)
25, Nathan Ngoy, CB (7.4)
15, Thomas Meunier, RB (6.3)
8, Youri Tielemans, CDM (C) (7.5)
24, Amadou Onana, CDM (6.9) - 5, Maxim De Cuyper 56’ (6.7)
11, Jérémy Doku, LM (6.4) - 26, Matias Fernandez-Pardo 86’ (SC)
7, Kevin De Bruyne, CAM (7.0) - 20, Hans Vanaken 86’ (SC)
10, Leandro Trossard, RM (6.7)
17, Charles De Ketelaere, ST (7.5) - 9, Romelu Lukaku 66’ (5.8)
DT, Rudi Garcia
Sub BEL
12, Senne Lammens, GK
13, Mike Penders, GK
3, Arthur Theate
6, Axel Witsel
14, Dodi Lukébakio
16, Koni De Winter
18, Joaquin Seys
19, Diego Moreira
22, Alexis Saelemaekers
Ali EGY 4-2-3-1 (W)
23, Mostafa Shobeir, GK (7.7)
13, Ahmed Fatouh, LB (6.8) - 15, Karim Hafez 88’ (SC)
14, Hamdy Fathy, CB (7.1) - 20, Ibrahim Adel 88’ (SC)
2, Yasser Ibrahim, CB (6.7)
3, Mohamed Hany, RB (6.5)
19, Marwan Attia, CDM (6.9)
17, Mohanad Lasheen, CDM (7.5)
8, Emam Ashour, LM (7.9) - 5, Ramy Rabia 71’ (6.7)
10, Mohamed Salah, CAM (C) (7.2) - 9, Hamza Abdelkarim 76’ (6.1)
11, Mostafa Zico, RM (6.1) - 25, Zizo 76’ (5.7)
22, Omar Marmoush, ST (7.2)
DT, Hossam Hassan
Sub EGY
1, Mohamed El Shenawy, GK
16, El Mahdy Soliman, GK
26, Mohamed Alaa, GK
4, Hossam Abdelmaguid
6, Mohamed Abdelmonem
7, Trézéguet
12, Haissem Hassan
18, Nabil Emad
21, Mahmoud Saber
24, Tarek Alaa
POS: 53, 47 - TIR: 15, 14 - TPO: 3, 4 - FAL: 15, 15 - AMA: 2, 2 - ROJ: 0, 0 - ESQ: 2, 7 - ATA: 2, 3
Kit BEL J1 C1, P1 C1 - Kit EGY J2 C1, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP EGY Emam Ashour ALT

Partido 17
Francia 3 - Senegal 1
16 jun 2026 · 15:00 UTC−4
Clima: 25 °C, Mayormente soleado
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,545
ARB Alireza Faghani (AUS) - AA1 George Lakrindis (AUS) - AA2 Andrew Lindsay (AUS) - 4AR Sandro Schärer (SUI) - VAR Abdullah Al-Shehri (KSA) - AVAR Armando Villarreal (USA)
Incidencias:
Gol FRA Kylian Mbappé 66’ - Asi FRA Michael Olise
Gol FRA Bradley Barcola 82’ - Asi FRA Adrien Rabiot
Gol SEN Ibrahim Mbaye 90+5’ - Asi SEN Iliman Ndiaye
Gol FRA Kylian Mbappé 90+6’
FT 90+10’
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (6.2)
19, Théo Hernandez, LB (6.9)
17, William Saliba, CB (7.0)
4, Dayot Upamecano, CB (8.2)
5, Jules Koundé, RB (7.4)
14, Adrien Rabiot, CDM (7.7)
8, Aurélien Tchouaméni, CDM (7.5)
20, Désiré Doué, LM (7.4) - 24, Rayan Cherki 87’ (SC)
7, Ousmane Dembélé, CAM (7.1) - 12, Bradley Barcola 80’ (7.4)
11, Michael Olise, RM (8.3)
10, Kylian Mbappé, ST (C) (9.0)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
2, Malo Gusto
3, Lucas Digne
6, Manu Koné
9, Marcus Thuram
13, N'Golo Kanté
15, Ibrahima Konaté
18, Warren Zaïre-Emery
21, Lucas Hernandez
22, Jean-Philippe Mateta
25, Maghnes Akliouche
26, Maxence Lacroix
Ali SEN 4-3-3
16, Édouard Mendy, GK (5.5)
25, El Hadji Malick Diouf, LB (6.0)
19, Moussa Niakhaté, CB (5.6)
3, Kalidou Koulibaly, CB (C) (6.0)
15, Krépin Diatta, RB (6.9)
26, Pape Gueye, CM (6.2) - 13, Iliman Ndiaye 83’ (SC)
5, Idrissa Gana Gueye, CM (6.3) - 6, Pathé Ciss 88’ (SC)
8, Lamine Camara, CM (6.0) - 21, Habib Diarra 75’ (6.1)
10, Sadio Mané, LW (6.4)
11, Nicolas Jackson, ST (6.2) - 9, Bamba Dieng 83’ (SC)
18, Ismaïla Sarr, RW (6.2) - 20, Ibrahim Mbaye 75’ (7.1)
DT, Pape Thiaw
Sub SEN
1, Yehvann Diouf, GK
23, Mory Diaw, GK
2, Mamadou Sarr
4, Abdoulaye Seck
7, Assane Diao
12, Cherif Ndiaye
14, Ismail Jakobs
17, Pape Matar Sarr
22, Bara Sapoko Ndiaye
24, Antoine Mendy
POS: 53, 47 - TIR: 11, 6 - TPO: 8, 2 - FAL: 5, 9 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 6, 4 - ATA: 1, 5
Kit FRA J1 C1, P1 C1 - Kit SEN J1 C2, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP FRA Michael Olise ALT

Partido 18
Irak 1 - Noruega 4
16 jun 2026 · 18:00 UTC−4
Clima: 23 °C, Soleado
Estadio Boston, Boston, Estados Unidos
Asistencia: 63,106
ARB Pierre Atcho (GAB) - AA1 Boris Ditsoga (GAB) - AA2 Amos Abeigne (GAB) - 4AR Amin Omar (EGY) - VAR Guillermo Pacheco (MEX) - AVAR Hamza El Fariq (MAR)
Incidencias:
Gol NOR Erling Haaland 29’ - Asi NOR David Møller Wolfe
Gol IRQ Aymen Hussein 39’ - Asi IRQ Amir Al-Ammari
Gol NOR Erling Haaland 43’
Gol NOR Leo Østigård 76’ - Asi NOR Martin Ødegaard
Ama IRQ Zaid Tahseen 86’
Gol NOR Aymen Hussein 90+6’ (GEC)
FT 90+7’
Ali IRQ 4-4-2
12, Jalal Hassan, GK (C) (5.2)
23, Merchas Doski, LB (6.4)
5, Akam Hashim, CB (5.5)
4, Zaid Tahseen, CB (3.6)
3, Hussein Ali, RB (5.7) - 25, Mustafa Saadoon 73’ (6.2)
17, Ali Jasim, LM (6.6) - 11, Ahmed Qasem 73’ (6.1)
16, Amir Al-Ammari, CM (6.9)
24, Zaid Ismail, CM (6.6) - 14, Zidane Iqbal 59’ (6.4)
8, Ibrahim Bayesh, RM (6.7) - 10, Mohanad Ali 78’ (6.0)
9, Ali Al-Hamadi, ST (6.9) - 21, Marko Farji 59’ (6.4)
18, Aymen Hussein, ST (6.2)
DT, Graham Arnold
Sub IRQ
1, Fahad Talib, GK
22, Ahmed Basil, GK
2, Rebin Sulaka
6, Munaf Younus
7, Youssef Amyn
13, Ali Yousif
15, Ahmed Maknazi
19, Kevin Yakob
20, Aimar Sher
26, Frans Putros
Ali NOR 4-3-3 (H)
1, Ørjan Nyland, GK (6.5)
5, David Møller Wolfe, LB (7.3) - 4, Leo Østigård 73’ (7.3)
17, Torbjørn Heggem, CB (7.2)
3, Kristoffer Ajer, CB (7.2)
26, Julian Ryerson, RB (7.5)
14, Fredrik Aursnes, CM (6.8) - 18, Kristian Thorstvedt 73’ (6.2)
8, Sander Berge, CDM (7.7)
10, Martin Ødegaard, CM (C) (7.5) - 6, Patrick Berg 81’ (SC)
20, Antonio Nusa, LW (6.7) - 21, Andreas Schjelderup 73’ (6.1)
9, Erling Haaland, ST (9.2)
7, Alexander Sørloth, RW (6.4) - 22, Oscar Bobb 73’ (6.3)
DT, Ståle Solbakken
Sub NOR
12, Sander Tangvik, GK
13, Egil Selvik, GK
2, Morten Thorsby
11, Jørgen Strand Larsen
15, Fredrik André Bjørkan
16, Marcus Holmgren Pedersen
19, Thelo Aasgaard
23, Jens Petter Hauge
24, Sondre Langås
25, Henrik Falchener
POS: 39, 61 - TIR: 11, 12 - TPO: 1, 5 - FAL: 12, 13 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 2, 5 - ATA: 1, 0
Kit IRQ J1 C1, P2 C1 - Kit NOR J1 C2, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP NOR Erling Haaland

Partido 19
Argentina 3 - Argelia 0
16 jun 2026 · 20:00 UTC−5
Clima: 25 °C, Nublado
Estadio Kansas City, Kansas City, Estados Unidos
Asistencia: 69,045
ARB Szymon Marciniak (POL) - AA1 Tomasz Listkiewicz (POL) - AA2 Adam Kupsik (POL) - 4AR Campbell-Kirk Kawana-Waugh (NZL) - VAR Tomasz Kwiatkowski (POL) - AVAR Dennis Higler (NED)
Incidencias:
Gol ARG Lionel Messi 17’ - Asi ARG Rodrigo De Paul
Gol ARG Lionel Messi 60’
Gol ARG Lionel Messi 76’ - Asi ARG Nicolás González
FT 90+6’
Ali ARG 4-3-3
23, Emiliano Martínez, GK (7.0)
25, Facundo Medina, LB (7.2)
6, Lisandro Martínez, CB (7.7)
13, Cristian Romero, CB (7.2) - 19, Nicolás Otamendi 80’ (6.7)
4, Gonzalo Montiel, RB (6.8) - 26, Nahuel Molina 45’ (7.0)
24, Enzo Fernández, CM (7.6)
20, Alexis Mac Allister, CM (7.2)
7, Rodrigo De Paul, CM (8.1)
16, Thiago Almada, LW (7.0) - 15, Nicolás González 55’ (7.1)
22, Lautaro Martínez, ST (6.5) - 9, Julián Alvarez 55’ (6.0)
10, Lionel Messi, RW (C) (9.7) - 18, Nico Paz 80’ (6.2)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
2, Marcos Senesi
3, Nicolás Tagliafico
5, Leandro Paredes
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
17, Giuliano Simeone
21, José Manuel López
Ali ALG 4-3-3
23, Luca Zidane, GK (5.5)
15, Rayan Aït-Nouri, LB (6.3)
21, Ramy Bensebaini, CB (6.5)
2, Aïssa Mandi, CB (C) (6.5)
17, Rafik Belghali, RB (6.1)
19, Nabil Bentaleb, CM (6.8) - 6, Ramiz Zerrouki 82’ (SC)
22, Ibrahim Maza, CM (6.3) - 20, Adil Boulbina 82’ (SC)
14, Hicham Boudaoui, CM (6.3) - 8, Houssem Aouar 64’ (6.0)
10, Farès Chaïbi, LW (6.6)
9, Amine Gouiri, ST (5.8) - 18, Mohamed Amoura 64’ (6.1)
11, Anis Hadj Moussa, RW (6.2) - 7, Riyad Mahrez 64’ (6.4)
DT, Vladimir Petković
Sub ALG
1, Melvin Mastil, GK
16, Oussama Benbot, GK
3, Achref Abada
4, Mohamed Amine Tougai
5, Zineddine Belaïd
12, Nadhir Benbouali
13, Jaouen Hadjam
24, Yacine Titraoui
25, Farès Ghedjemis
26, Samir Chergui
POS: 48, 52 - TIR: 10, 7 - TPO: 6, 0 - FAL: 13, 8 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 2, 2 - ATA: 0, 3
Kit ARG J1 C2, P2 C1 - Kit ALG J2 C1, P5 C1 - Kit ARB TorFWC26 R1 C1
JDP ARG Lionel Messi

Partido 20
Austria 3 - Jordania 1
16 jun 2026 · 21:00 UTC−7
Clima: 17 °C, Despejado
Estadio Bahía de San Francisco, San Francisco, Estados Unidos
Asistencia: 68,527
ARB Dahane Beida (MTN) - AA1 Jerson Santos (ANG) - AA2 Elvis Noupue (CMR) - 4AR Oshane Nation (JAM) - VAR Mahmoud Ashour (EGY) - AVAR Nicolás Gallo Barragán (COL)
Incidencias:
Gol AUT Romano Schmid 21’ - Asi AUT Xaver Schlager
Gol JOR Ali Olwan 50’ - Asi JOR Noor Al-Rawabdeh
Gol AUT Yazan Al-Arab 76’ (GEC)
Ama AUT Marcel Sabitzer 77’
Gol AUT Marko Arnautović 90+12’ (PEN)
FT 90+12’
Ali AUT 4-2-3-1 (N)
1, Alexander Schlager, GK (7.4)
16, Phillipp Mwene, LB (6.4) - 24, Paul Wanner 59’ (6.1)
8, David Alaba, CB (C) (7.2) - 3, Kevin Danso 59’ (6.8)
15, Philipp Lienhart, CB (7.7)
5, Stefan Posch, RB (6.9)
4, Xaver Schlager, CDM (8.1) - 17, Carney Chukwuemeka 59’ (5.9)
6, Nicolas Seiwald, CDM (7.5)
9, Marcel Sabitzer, CAM (7.6)
20, Konrad Laimer, CAM (6.7)
18, Romano Schmid, CAM (7.6) - 21, Patrick Wimmer 83’ (SC)
14, Saša Kalajdžić, ST (6.5) - 7, Marko Arnautović 45’ (7.6)
DT, Ralf Rangnick
Sub AUT
12, Florian Wiegele, GK
13, Patrick Pentz, GK
2, David Affengruber
10, Florian Grillitsch
11, Michael Gregoritsch
19, Dejan Ljubičić
22, Alexander Prass
23, Marco Friedl
25, Michael Svoboda
26, Alessandro Schöpf
Ali JOR 3-4-3
1, Yazeed Abulaila, GK (5.6)
16, Mo Abu Al-Nadi, CB (6.3) - 17, Saleem Obaid 72’ (5.9)
5, Yazan Al-Arab, CB (6.8)
3, Abdallah Nasib, CB (6.4) - 19, Sa'ed Al-Rosan 81’ (SC)
20, Mohannad Abu Taha, LM (7.2)
8, Noor Al-Rawabdeh, CM (7.9)
21, Nizar Al-Rashdan, CM (6.9)
23, Ehsan Haddad, RM (C) (6.5) - 13, Mahmoud Al-Mardi 81’ (SC)
11, Odeh Al-Fakhouri, LW (6.8) - 24, Ali Azaizeh 88’ (SC)
9, Ali Olwan, ST (7.7)
10, Musa Al-Tamari, RW (6.3) - 25, Mohammad Al-Daoud 88’ (SC)
DT, Jamal Sellami
Sub JOR
12, Nour Bani Ateyah, GK
22, Abdallah Al-Fakhori, GK
2, Mohammad Abu Hasheesh
4, Husam Abu Dahab
6, Amer Jamous
7, Mohammad Abu Zraiq
14, Raja'ei Ayed
15, Ibrahim Sa'deh
18, Mohammad Abu Ghoush
26, Anas Badawi
POS: 63, 37 - TIR: 11, 11 - TPO: 4, 4 - FAL: 12, 7 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 4, 3 - ATA: 3, 1
Kit AUT J1 C1, P1 C1 - Kit JOR J1 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP JOR Ali Olwan ALT

Partido 21
Ghana 1 - Panamá 0
17 jun 2026 · 19:00 UTC−4
Clima: 19 °C, Nublado
Estadio Toronto, Toronto, Canadá
Asistencia: 42,942
ARB Glenn Nyberg (SWE) - AA1 Mahbod Beigi (SWE) - AA2 Andreas Söderkvist (SWE) - 4AR Khalid Al-Turais (KSA) - VAR Bram Van Driessche (BEL) - AVAR Marco Di Bello (ITA)
Incidencias:
Ama GHA Caleb Yirenkyi 16’
Ama PAN César Blackman 72’
Gol GHA Caleb Yirenkyi 90+5’
Ama PAN Carlos Harvey 90+9’
FT 90+11’
Ali GHA 4-3-3 (H)
1, Lawrence Ati Zigi, GK (7.3) - 16, Benjamin Asare 45’ (7.8)
14, Gideon Mensah, LB (7.1)
18, Jerome Opoku, CB (7.4)
4, Jonas Adjetey, CB (7.9)
26, Marvin Senaya, RB (7.4)
22, Kamaldeen Sulemana, CM (6.5) - 10, Brandon Thomas-Asante 58’ (7.4)
15, Elisha Owusu, CDM (6.7) - 8, Kwasi Sibo 78’ (6.2)
3, Caleb Yirenkyi, CM (8.2)
11, Antoine Semenyo, LW (6.6)
9, Jordan Ayew, ST (C) (6.9) - 25, Prince Kwabena Adu 87’ (SC)
24, Ernest Nuamah, RW (6.2) - 7, Abdul Fatawu 58’ (6.6)
DT, Carlos Queiroz
Sub GHA
12, Joseph Anang, GK
2, Alidu Seidu
6, Abdul Mumin
13, Christopher Bonsu Baah
17, Abdul Rahman Baba
19, Iñaki Williams
20, Augustine Boakye
21, Kojo Peprah Oppong
23, Derrick Luckassen
Ali PAN 3-4-3
22, Orlando Mosquera, GK (6.5)
16, Andrés Andrade, CB (7.1)
3, José Córdoba, CB (6.3)
13, Jiovany Ramos, CB (7.5)
2, César Blackman, LM (6.7) - 20, Aníbal Godoy 90’ (SC)
11, Yoel Bárcenas, CM (C) (6.7)
14, Carlos Harvey, CM (6.2)
23, Michael Amir Murillo, RM (7.3)
7, José Luis Rodríguez, LW (5.8) - 10, Ismael Díaz 74’ (6.7)
18, Cecilio Waterman, ST (5.7) - 17, José Fajardo 63’ (5.9)
6, Cristian Martínez, RW (6.4) - 24, Azarias Londoño 63’ (6.6)
DT, Thomas Christiansen
Sub PAN
1, Luis Mejía, GK
12, César Samudio, GK
4, Fidel Escobar
5, Edgardo Fariña
8, Adalberto Carrasquilla
9, Tomás Rodríguez
15, Eric Davis
19, Alberto Quintero
21, César Yanis
25, Roderick Miller
26, Jorge Gutiérrez
POS: 38, 62 - TIR: 7, 11 - TPO: 2, 4 - FAL: 9, 11 - AMA: 1, 2 - ROJ: 0, 0 - ESQ: 2, 2 - ATA: 4, 1
Kit GHA J2 C1, P1 C1 - Kit PAN J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP GHA Antoine Semenyo

Partido 22
Inglaterra 4 - Croacia 2
17 jun 2026 · 15:00 UTC−5
Clima: 32 °C, Soleado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,389
ARB Clément Turpin (FRA) - AA1 Nicolas Danos (FRA) - AA2 Benjamin Pagès (FRA) - 4AR Katia Itzel García (MEX) - VAR Jérôme Brisard (FRA) - AVAR Willy Delajod (FRA)
Incidencias:
Gol ENG Harry Kane 12’ (PEN)
Gol CRO Martin Baturina 36’ - Asi CRO Petar Sučić
Gol ENG Harry Kane 42’ - Asi ENG Declan Rice
Gol CRO Petar Musa 45+5’ - Asi CRO Ivan Perišić
Gol ENG Jude Bellingham 47’ - Asi ENG Elliot Anderson
Gol ENG Marcus Rashford 85’ - Asi ENG Bukayo Saka
FT 90+6’
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (6.4)
3, Nico O'Reilly, LB (6.8)
5, John Stones, CB (6.5) - 6, Marc Guéhi 87’ (SC)
2, Ezri Konsa, CB (6.1)
24, Reece James, RB (6.2)
4, Declan Rice, CDM (7.6) - 17, Morgan Rogers 72’ (7.0)
8, Elliot Anderson, CDM (8.0)
18, Anthony Gordon, LM (6.2) - 11, Marcus Rashford 72’ (7.2)
10, Jude Bellingham, CAM (8.3) - 25, Djed Spence 80’ (6.3)
20, Noni Madueke, RM (7.5) - 7, Bukayo Saka 72’ (7.5)
9, Harry Kane, ST (C) (9.0)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
14, Jordan Henderson
15, Dan Burn
16, Kobbie Mainoo
19, Ollie Watkins
21, Eberechi Eze
22, Ivan Toney
26, Jarell Quansah
Ali CRO 3-4-3
1, Dominik Livaković, GK (6.5)
4, Joško Gvardiol, CB (5.7)
22, Luka Vušković, CB (6.4) - 24, Marco Pašalić 66’ (6.2)
6, Josip Šutalo, CB (6.1)
14, Ivan Perišić, LM (7.9)
15, Mario Pašalić, CM (6.8) - 9, Andrej Kramarić 78’ (6.1)
10, Luka Modrić, CM (C) (5.9) - 8, Mateo Kovačić 58’ (6.8)
2, Josip Stanišić, RM (7.2)
16, Martin Baturina, LW (7.9) - 13, Nikola Vlašić 78’ (6.0)
26, Petar Musa, ST (7.0) - 20, Igor Matanović 66’ (6.0)
17, Petar Sučić, RW (7.5)
DT, Zlatko Dalić
Sub CRO
12, Ivor Pandur, GK
23, Dominik Kotarski, GK
3, Marin Pongračić
5, Duje Ćaleta-Car
7, Nikola Moro
11, Ante Budimir
18, Kristijan Jakić
19, Toni Fruk
21, Luka Sučić
25, Martin Erlić
POS: 52, 48 - TIR: 22, 10 - TPO: 11, 5 - FAL: 10, 12 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 8, 2 - ATA: 3, 7
Kit ENG J1 C1, P1 C1 - Kit CRO J2 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP ENG Harry Kane

Partido 23
Portugal 1 - RD Congo 1
17 jun 2026 · 12:00 UTC−5
Clima: 29 °C, Llovizna · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,777
ARB Abdulrahman Al-Jassim (QAT) - AA1 Taleb Al-Marri (QAT) - AA2 Saoud Al-Maqaleh (QAT) - 4AR Abongile Tom (RSA) - VAR Khamis Al-Marri (QAT) - AVAR Juan Soto (VEN)
Incidencias:
Gol POR João Neves 6’ - Asi POR Pedro Neto
Ama POR Bernardo Silva 13’
Ama COD Chancel Mbemba 32’
Gol COD Yoane Wissa 45+5’ - Asi COD Arthur Masuaku
Ama POR Nélson Semedo 88’
Ama POR Tomás Araújo 90+2’
FT 90+5’
Ali POR 4-2-3-1 (W)
1, Diogo Costa, GK (6.8)
25, Nuno Mendes, LB (6.6) - 2, Nélson Semedo 72’ (6.0)
13, Renato Veiga, CB (6.8)
4, Tomás Araújo, CB (7.3)
20, João Cancelo, RB (7.1)
23, Vitinha, CDM (6.8) - 9, Gonçalo Ramos 83’ (SC)
15, João Neves, CDM (8.2)
18, Pedro Neto, LM (7.2) - 17, Rafael Leão 72’ (6.1)
8, Bruno Fernandes, CAM (7.0)
10, Bernardo Silva, RM (5.7) - 26, Francisco Conceição 45’ (6.4)
7, Cristiano Ronaldo, ST (C) (6.7)
DT, Roberto Martínez
Sub POR
12, José Sá, GK
22, Rui Silva, GK
3, Rúben Dias
5, Diogo Dalot
6, Matheus Nunes
11, João Félix
14, Gonçalo Inácio
16, Francisco Trincão
19, Gonçalo Guedes
21, Rúben Neves
24, Samú Costa
Ali COD 5-3-2
1, Lionel Mpasi, GK (6.7)
26, Arthur Masuaku, LB (7.6) - 12, Joris Kayembe 75’ (6.6)
3, Steve Kapuadi, CB (6.8)
4, Axel Tuanzebe, CB (6.5)
22, Chancel Mbemba, CB (C) (7.0)
2, Aaron Wan-Bissaka, RB (7.6) - 24, Gédéon Kalulu 85’ (SC)
25, Edo Kayembe, CM (7.1) - 18, Charles Pickel 75’ (6.0)
8, Samuel Moutoussamy, CDM (6.4)
6, Ngal'ayel Mukau, CM (6.3) - 14, Noah Sadiki 57’ (6.4)
20, Yoane Wissa, ST (7.5)
17, Cédric Bakambu, ST (7.1) - 23, Simon Banza 85’ (SC)
DT, Sébastien Desabre
Sub COD
16, Timothy Fayulu, GK
21, Matthieu Epolo, GK
5, Dylan Batubinsika
7, Nathanaël Mbuku
9, Brian Cipenga
10, Théo Bongonda
11, Gaël Kakuta
13, Meschak Elia
15, Aaron Tshibola
19, Fiston Mayele
POS: 75, 25 - TIR: 7, 8 - TPO: 1, 2 - FAL: 9, 10 - AMA: 3, 1 - ROJ: 0, 0 - ESQ: 5, 4 - ATA: 1, 0
Kit POR J1 C1, P2 C1 - Kit COD J1 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP POR João Neves

Partido 24
Uzbekistán 1 - Colombia 3
17 jun 2026 · 20:00 UTC−6
Clima: 18 °C, Nublado
Estadio Ciudad de México, Ciudad de México, México
Asistencia: 80,824
ARB Anthony Taylor (ENG) - AA1 Gary Beswick (ENG) - AA2 Adam Nunn (ENG) - 4AR Juan Gabriel Calderón (CRC) - VAR Ivan Bebek (CRO) - AVAR Jarred Gillett (ENG)
Incidencias:
Ama COL Johan Mojica 7’
Ama UZB Abdukodir Khusanov 34’
Gol COL Daniel Muñoz 41’ - Asi COL Luis Díaz
Gol UZB Abbosbek Fayzullaev 60’
Gol COL Luis Díaz 65’ - Asi COL Gustavo Puerta
Gol COL Jaminton Campaz 90+9’ - Asi COL Cucho Hernández
FT 90+10’
Ali UZB 3-4-3
1, Utkir Yusupov, GK (5.0)
5, Rustam Ashurmatov, CB (6.3) - 26, Jakhongir Urozov 77’ (6.1)
18, Abdulla Abdullaev, CB (5.6)
2, Abdukodir Khusanov, CB (5.8)
13, Sherzod Nasrullaev, LM (5.7) - 4, Farrukh Sayfiev 45’ (6.4)
7, Otabek Shukurov, CM (6.8)
6, Akmal Mozgovoy, CM (6.2)
24, Behruzjon Karimov, RM (7.5)
11, Oston Urunov, LW (6.3) - 17, Dostonbek Khamdamov 45’ (6.7)
14, Eldor Shomurodov, ST (C) (5.5) - 21, Igor Sergeev 90+3’ (SC)
22, Abbosbek Fayzullaev, RW (7.1) - 20, Azizbek Amonov 77’ (5.8)
DT, Fabio Cannavaro
Sub UZB
12, Abduvohid Nematov, GK
16, Botirali Ergashev, GK
3, Khojiakbar Alijonov
8, Jamshid Iskanderov
9, Odiljon Xamrobekov
10, Ruslanbek Jiyanov
15, Umar Eshmurodov
19, Azizjon Ganiev
23, Sherzod Esanov
25, Avazbek Ulmasaliyev
Ali COL 4-3-3 (H)
12, Camilo Vargas, GK (5.8)
17, Johan Mojica, LB (6.8)
3, Jhon Lucumí, CB (6.9)
23, Davinson Sánchez, CB (7.5)
2, Daniel Muñoz, RB (8.1)
11, Jhon Arias, CM (7.0) - 5, Kevin Castaño 90+3’ (SC)
16, Jefferson Lerma, CDM (7.5)
14, Gustavo Puerta, CM (7.8) - 6, Richard Ríos 80’ (6.0)
7, Luis Díaz, LW (8.9) - 26, Andrés Gómez 90+3’ (SC)
25, Luis Suárez, ST (7.1) - 19, Cucho Hernández 80’ (6.7)
10, James Rodríguez, RW (C) (6.7) - 21, Jaminton Campaz 72’ (7.6)
DT, Néstor Lorenzo
Sub COL
1, David Ospina, GK
24, Álvaro Montero, GK
4, Santiago Arias
8, Jorge Carrascal
9, Jhon Córdoba
13, Yerry Mina
15, Juan Portilla
18, Willer Ditta
20, Juan Fernando Quintero
22, Deiver Machado
POS: 40, 60 - TIR: 8, 15 - TPO: 2, 4 - FAL: 14, 11 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 3, 4 - ATA: 1, 1
Kit UZB J1 C1, P1 C1 - Kit COL J2 C2, P3 C1 - Kit ARB TorFWC26 R2 C1
JDP COL Luis Díaz

Partido 25
Chequia 1 - Sudáfrica 1
18 jun 2026 · 12:00 UTC−4
Clima: 28 °C, Nublado · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 67,442
ARB Tori Penso (USA) - AA1 Brooke Mayo (USA) - AA2 Kathryn Nesbitt (USA) - 4AR Campbell-Kirk Kawana-Waugh (NZL) - VAR Tatiana Guzmán (NCA) - AVAR Joe Dickerson (USA)
Incidencias:
Gol CZE Michal Sadílek 6’ - Asi CZE Alexandr Sojka
Ama RSA Teboho Mokoena 33’
Ama RSA Thalente Mbatha 40’
Ama CZE Ladislav Krejčí 75’
Gol RSA Teboho Mokoena 83’ (PEN)
FT 90+7’
Ali CZE 3-5-2
1, Matěj Kovář, GK (6.7)
7, Ladislav Krejčí, CB (C) (7.8)
3, Tomáš Holeš, CB (7.0)
4, Robin Hranáč, CB (6.4)
24, Alexandr Sojka, LM (7.6) - 20, Jaroslav Zelený 55’ (6.4)
8, Vladimír Darida, CDM (7.0) - 15, Pavel Šulc 55’ (5.9)
12, Lukáš Červ, CAM (7.0) - 2, David Zima 78’ (6.4)
18, Michal Sadílek, CDM (7.5) - 22, Tomáš Souček 67’ (6.2)
5, Vladimír Coufal, RM (7.7)
10, Patrik Schick, ST (6.2)
9, Adam Hložek, ST (5.7) - 17, Lukáš Provod 67’ (6.3)
DT, Miroslav Koubek
Sub CZE
16, Jindřich Staněk, GK
23, Lukáš Horníček, GK
6, Štěpán Chaloupek
11, Jan Kuchta
13, Mojmír Chytil
19, Tomáš Chorý
21, David Douděra
25, Hugo Sochůrek
26, Denis Višinský
Ali RSA 4-3-3
1, Ronwen Williams, GK (C) (6.1)
6, Aubrey Modiba, LB (7.9)
14, Mbekezeli Mbokazi, CB (7.0)
21, Ime Okon, CB (7.6)
20, Khuliso Mudau, RB (7.5)
23, Jayden Adams, CM (6.4) - 10, Relebohile Mofokeng 45’ (6.2)
4, Teboho Mokoena, CM (8.6)
5, Thalente Mbatha, CM (6.5)
7, Oswin Appollis, LW (7.2)
15, Iqraam Rayners, ST (5.7) - 17, Evidence Makgopa 66’ (6.7)
12, Thapelo Maseko, RW (6.8) - 25, Kamogelo Sebelebele 84’ (SC)
DT, Hugo Broos
Sub RSA
16, Sipho Chaine, GK
22, Ricardo Goss, GK
2, Thabang Matuludi
3, Khulumani Ndamane
8, Tshepang Moremi
9, Lyle Foster
18, Samukele Kabini
19, Nkosinathi Sibisi
24, Olwethu Makhanya
26, Bradley Cross
POS: 37, 63 - TIR: 14, 17 - TPO: 3, 4 - FAL: 12, 10 - AMA: 1, 2 - ROJ: 0, 0 - ESQ: 5, 5 - ATA: 3, 2
Kit CZE J1 C1, P2 C1 - Kit RSA J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP CZE Ladislav Krejčí

Partido 26
Suiza 4 - Bosnia y Herzegovina 1
18 jun 2026 · 12:00 UTC−7
Clima: 21 °C, Nublado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,026
ARB João Pinheiro (POR) - AA1 Bruno Jesus (POR) - AA2 Luciano Maia (POR) - 4AR Yusuke Araki (JPN) - VAR Dennis Higler (NED) - AVAR Tomasz Kwiatkowski (POL)
Incidencias:
Ama BIH Amar Dedić 59’
Ama BIH Edin Džeko 61’
Ama SUI Nico Elvedi 65’
Gol SUI Johan Manzambi 74’
Roj BIH Tarik Muharemović 80’ (RD)
Gol SUI Rubén Vargas 84’ - Asi SUI Breel Embolo
Gol SUI Johan Manzambi 90’ - Asi SUI Rubén Vargas
Gol BIH Ermin Mahmić 90+3’
Gol SUI Granit Xhaka 90+7’ (PEN)
FT 90+7’
Ali SUI 4-3-3
1, Gregor Kobel, GK (6.5)
13, Ricardo Rodriguez, LB (7.3)
5, Manuel Akanji, CB (7.9)
4, Nico Elvedi, CB (7.4)
3, Silvan Widmer, RB (6.7) - 25, Luca Jaquez 86’ (SC)
8, Remo Freuler, CM (7.3)
10, Granit Xhaka, CM (C) (8.6)
20, Michel Aebischer, CM (7.2) - 15, Djibril Sow 72’ (6.7)
22, Fabian Rieder, LW (7.2) - 17, Rubén Vargas 72’ (8.3)
7, Breel Embolo, ST (7.5) - 26, Cedric Itten 89’ (SC)
11, Dan Ndoye, RW (7.4) - 9, Johan Manzambi 72’ (8.6)
DT, Murat Yakin
Sub SUI
12, Yvon Mvogo, GK
21, Marvin Keller, GK
6, Denis Zakaria
14, Ardon Jashari
16, Christian Fassnacht
18, Eray Cömert
19, Noah Okafor
23, Zeki Amdouni
24, Aurèle Amenda
Ali BIH 4-4-2
1, Nikola Vasilj, GK (5.0)
5, Sead Kolašinac, LB (5.8)
4, Tarik Muharemović, CB (6.0)
18, Nikola Katić, CB (5.9)
7, Amar Dedić, RB (6.0)
19, Kerim Alajbegović, LM (6.3) - 26, Ermin Mahmić 90+1’ (SC)
14, Ivan Šunjić, CM (5.9) - 16, Amir Hadžiahmetović 85’ (SC)
6, Benjamin Tahirović, CM (6.0) - 13, Ivan Bašić 63’ (6.3)
15, Amar Memić, RM (6.3)
11, Edin Džeko, ST (C) (6.5) - 20, Esmir Bajraktarević 63’ (5.8)
10, Ermedin Demirović, ST (6.1) - 25, Jovo Lukić 85’ (SC)
DT, Sergej Barbarez
Sub BIH
12, Mladen Jurkas, GK
22, Martin Zlomislić, GK
2, Nihad Mujakić
3, Dennis Hadžikadunić
8, Armin Gigović
9, Samed Baždar
17, Dženis Burnić
21, Stjepan Radeljić
23, Haris Tabaković
24, Arjan Malić
POS: 62, 38 - TIR: 13, 5 - TPO: 7, 3 - FAL: 7, 18 - AMA: 1, 2 - ROJ: 0, 1 - ESQ: 7, 3 - ATA: 2, 3
Kit SUI J1 C1, P2 C1 - Kit BIH J2 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP SUI Johan Manzambi ALT

Partido 27
Canadá 6 - Catar 0
18 jun 2026 · 15:00 UTC−7
Clima: 20 °C, Parcialmente nublado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Cristián Garay (CHI) - AA1 José Retamal (CHI) - AA2 Miguel Rocha (CHI) - 4AR Kevin Ortega (PER) - VAR Juan Lara (CHI) - AVAR Rodolpho Toski (BRA)
Incidencias:
Ama CAN Derek Cornelius 9’
Gol CAN Cyle Larin 16’
Gol CAN Jonathan David 29’
Roj QAT Homam Ahmed 33’ (RD)
Gol CAN Jonathan David 45+3’
Roj QAT Assim Madibo 51’ (RD)
Ama QAT Ahmed Fathy 62’
Gol CAN Nathan Saliba 64’
Gol CAN Mohamed Manai 75’ (GEC)
Gol CAN Jonathan David 90+2’ - Asi CAN Nathan Saliba
FT 90+9’
Ali CAN 4-4-2
16, Maxime Crépeau, GK (6.9)
22, Richie Laryea, LB (8.0)
13, Derek Cornelius, CB (6.5) - 15, Moïse Bombito 45’ (6.3)
4, Luc de Fougerolles, CB (7.3) - 14, Jacob Shaffelburg 71’ (6.5)
2, Alistair Johnston, RB (8.3)
20, Ali Ahmed, LM (7.1) - 12, Tani Oluwaseyi 71’ (5.7)
7, Stephen Eustáquio, CM (C) (7.8)
8, Ismaël Koné, CM (7.4) - 25, Nathan Saliba 56’ (8.4)
17, Tajon Buchanan, RM (7.8) - 23, Niko Sigur 83’ (SC)
9, Cyle Larin, ST (7.6)
10, Jonathan David, ST (9.6)
DT, Jesse Marsch
Sub CAN
1, Dayne St. Clair, GK
18, Owen Goodman, GK
5, Joel Waterman
6, Mathieu Choinière
11, Liam Millar
19, Alphonso Davies
21, Jonathan Osorio
24, Promise David
26, Jayden Nelson
Ali QAT 4-3-3
1, Mahmud Abunada, GK (5.1)
14, Homam Ahmed, LB (4.5)
16, Boualem Khoukhi, CB (C) (5.3)
2, Pedro Miguel, CB (4.8)
13, Ayoub Al-Oui, RB (5.0)
4, Issa Laye, CM (6.3)
23, Assim Madibo, CM (5.0)
5, Jassem Gaber, CM (6.3) - 26, Mohamed Manai 45’ (SC)
11, Akram Afif, LW (6.1) - 25, Al-Hashmi Al-Hussain 59’ (6.6)
15, Yusuf Abdurisag, ST (6.0) - 18, Sultan Al-Brake 40’ (6.6)
8, Edmilson Junior, RW (5.9) - 20, Ahmed Fathy 45’ (6.0) - 3, Lucas Mendes 87’ (SC)
DT, Julen Lopetegui
Sub QAT
21, Salah Zakaria, GK
22, Meshaal Barsham, GK
6, Abdulaziz Hatem
7, Ahmed Alaaeldin
9, Mohammed Muntari
10, Hassan Al-Haydos
12, Karim Boudiaf
17, Ahmed Al-Ganehi
19, Almoez Ali
24, Tahsin Jamshid
POS: 77, 23 - TIR: 33, 2 - TPO: 10, 0 - FAL: 9, 10 - AMA: 1, 1 - ROJ: 0, 2 - ESQ: 19, 1 - ATA: 0, 4
Kit CAN J3 C1, P2 C1 - Kit QAT J2 C1, P3 C1 - Kit ARB TorFWC26 R4 C1
JDP CAN Jonathan David

Partido 28
México 1 - Corea del Sur 0
18 jun 2026 · 19:00 UTC−6
Clima: 21 °C, Nublado
Estadio Guadalajara, Guadalajara, México
Asistencia: 45,522
ARB Gustavo Tejera (URU) - AA1 Carlos Barreiro (URU) - AA2 Nicolás Tarán (URU) - 4AR Andrés Rojas (COL) - VAR Leodán González (URU) - AVAR Antonio García (URU)
Incidencias:
Ama KOR Lee Kang-in 4’
Gol MEX Luis Romo 50’
Ama KOR Paik Seung-ho 58’
FT 90+7’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (8.4)
23, Jesús Gallardo, LB (7.4)
5, Johan Vásquez, CB (6.9)
4, Edson Álvarez, CB (C) (7.8)
2, Jorge Sánchez, RB (6.8)
7, Luis Romo, CM (8.0) - 18, Obed Vargas 71’ (6.5)
6, Érik Lira, CDM (6.7)
26, Brian Gutiérrez, CM (7.0) - 17, Orbelín Pineda 71’ (6.0)
16, Julián Quiñones, LW (6.7) - 21, César Huerta 84’ (SC)
9, Raúl Jiménez, ST (6.2) - 11, Santiago Giménez 80’ (5.7)
25, Roberto Alvarado, RW (7.0) - 15, Israel Reyes 80’ (6.1)
DT, Javier Aguirre
Sub MEX
12, Carlos Acevedo, GK
13, Guillermo Ochoa, GK
8, Álvaro Fidalgo
10, Alexis Vega
14, Armando González
19, Gilberto Mora
20, Mateo Chávez
22, Guillermo Martínez
24, Luis Chávez
Ali KOR 3-4-3
1, Kim Seung-gyu, GK (5.8)
3, Lee Gi-hyuk, CB (6.5)
4, Kim Min-jae, CB (6.9)
2, Lee Han-beom, CB (6.6)
22, Seol Young-woo, LM (6.2) - 20, Yang Hyun-jun 71’ (6.4)
8, Paik Seung-ho, CM (6.3) - 9, Cho Gue-sung 77’ (5.9)
6, Hwang In-beom, CM (6.0)
15, Kim Moon-hwan, RM (6.3) - 25, Eom Ji-sung 71’ (6.6)
10, Lee Jae-sung, LW (6.4) - 11, Hwang Hee-chan 57’ (6.2)
7, Son Heung-min, ST (C) (6.8) - 18, Oh Hyeon-gyu 57’ (5.8)
19, Lee Kang-in, RW (7.2)
DT, Hong Myung-bo
Sub KOR
12, Song Bum-keun, GK
21, Jo Hyeon-woo, GK
5, Kim Tae-hyeon
13, Lee Tae-seok
14, Cho Wi-je
16, Park Jin-seob
17, Bae Jun-ho
23, Jens Castrop
24, Kim Jin-gyu
26, Lee Dong-gyeong
POS: 43, 57 - TIR: 8, 8 - TPO: 4, 2 - FAL: 9, 7 - AMA: 0, 2 - ROJ: 0, 0 - ESQ: 0, 2 - ATA: 2, 3
Kit MEX J3 C1, P4 C1 - Kit KOR J2 C1, P2 C1 - Kit ARB TorFWC26 R4 C1
JDP MEX Luis Romo

Partido 29
Brasil 3 - Haití 0
19 jun 2026 · 20:30 UTC−4
Clima: 26 °C, Despejado
Estadio Filadelfia, Filadelfia, Estados Unidos
Asistencia: 68,324
ARB Alejandro Hernández Hernández (ESP) - AA1 José Enrique Naranjo (ESP) - AA2 Diego Sánchez (ESP) - 4AR Sandro Schärer (SUI) - VAR Carlos del Cerro Grande (ESP) - AVAR Willy Delajod (FRA)
Incidencias:
Ama HAI Carlens Arcus 4’
Gol BRA Matheus Cunha 23’
Gol BRA Matheus Cunha 36’ - Asi BRA Vinícius Júnior
Gol BRA Vinícius Júnior 45+3’ - Asi BRA Lucas Paquetá
Ama HAI Frantzdy Pierrot 45+4’
Ama BRA Douglas Santos 65’
Ama HAI Danley Jean Jacques 72’
FT 90+5’
Ali BRA 4-3-3
1, Alisson, GK (8.1)
16, Douglas Santos, LB (7.1)
3, Gabriel Magalhães, CB (7.3)
4, Marquinhos, CB (C) (7.3)
13, Danilo Luiz, RB (7.1)
20, Lucas Paquetá, CM (8.1) - 22, Gabriel Martinelli 64’ (6.4)
5, Casemiro, CM (7.6)
8, Bruno Guimarães, CM (7.5) - 2, Éderson Silva 81’ (SC)
7, Vinícius Júnior, LW (8.5) - 18, Danilo Santos 81’ (SC)
9, Matheus Cunha, ST (8.9) - 19, Endrick 64’ (6.1)
11, Raphinha, RW (6.0) - 26, Rayan 40’ (6.3)
DT, Carlo Ancelotti
Sub BRA
12, Weverton, GK
23, Ederson, GK
6, Alex Sandro
14, Bremer
15, Léo Pereira
17, Fabinho
21, Luiz Henrique
24, Roger Ibañez
25, Igor Thiago
Ali HAI 5-4-1
1, Johny Placide, GK (C) (5.4)
8, Martin Expérience, LB (6.4)
5, Hannes Delcroix, CB (5.1)
4, Ricardo Adé, CB (6.6)
22, Jean-Kévin Duverne, CB (5.7)
2, Carlens Arcus, RB (5.5) - 25, Dominique Simon 45’ (6.6)
15, Ruben Providence, LM (6.1) - 16, Lenny Joseph 71’ (6.0)
10, Jean-Ricner Bellegarde, CM (6.4) - 7, Derrick Etienne Jr. 81’ (SC)
17, Danley Jean Jacques, CM (6.5)
21, Josué Casimir, RM (4.9) - 11, Louicius Deedson 63’ (5.8)
20, Frantzdy Pierrot, ST (5.8) - 18, Wilson Isidor 45’ (6.1)
DT, Sébastien Migné
Sub HAI
12, Alexandre Pierre, GK
23, Josué Duverger, GK
3, Keeto Thermoncy
6, Carl Sainté
9, Duckens Nazon
13, Duke Lacroix
14, Garven Metusala
19, Yassin Fortuné
24, Wilguens Paugain
26, Woodensky Pierre
POS: 57, 43 - TIR: 8, 8 - TPO: 5, 3 - FAL: 14, 14 - AMA: 1, 3 - ROJ: 0, 0 - ESQ: 4, 4 - ATA: 3, 2
Kit BRA J2 C1, P6 C1 - Kit HAI J2 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP BRA Vinícius Júnior

Partido 30
Escocia 0 - Marruecos 1
19 jun 2026 · 18:00 UTC−4
Clima: 24 °C, Soleado
Estadio Boston, Boston, Estados Unidos
Asistencia: 64,146
ARB Ilgiz Tantashev (UZB) - AA1 Andrey Tsapenko (UZB) - AA2 Timur Gaynullin (UZB) - 4AR Adham Makhadmeh (JOR) - VAR Armando Villarreal (USA) - AVAR Erick Miranda (MEX)
Incidencias:
Gol MAR Ismael Saibari 2’ - Asi MAR Brahim Díaz
Ama MAR Issa Diop 23’
Ama SCO Andy Robertson 65’
FT 90+6’
Ali SCO 4-4-2
1, Angus Gunn, GK (7.0)
3, Andy Robertson, LB (C) (6.7)
13, Jack Hendry, CB (6.7)
5, Grant Hanley, CB (6.6)
22, Nathan Patterson, RB (6.5) - 24, Anthony Ralston 88’ (SC)
6, Kieran Tierney, LM (6.7) - 17, Ben Gannon-Doak 60’ (6.1)
19, Lewis Ferguson, CM (7.1)
11, Ryan Christie, CM (5.9) - 23, Kenny McLean 71’ (6.4)
7, John McGinn, RM (6.2) - 14, Ross Stewart 88’ (SC)
4, Scott McTominay, ST (6.5)
10, Ché Adams, ST (6.1) - 9, Lyndon Dykes 71’ (6.0)
DT, Steve Clarke
Sub SCO
12, Liam Kelly, GK
21, Craig Gordon, GK
2, Aaron Hickey
8, Tyler Fletcher
15, John Souttar
16, Dominic Hyam
18, George Hirst
20, Lawrence Shankland
25, Findlay Curtis
26, Scott McKenna
Ali MAR 4-2-3-1 (W)
1, Yassine Bounou, GK (7.0)
3, Noussair Mazraoui, LB (7.1)
18, Chadi Riad, CB (6.9)
14, Issa Diop, CB (6.8)
2, Achraf Hakimi, RB (C) (7.5)
24, Neil El Aynaoui, CDM (7.7)
6, Ayyoub Bouaddi, CDM (7.0)
23, Bilal El Khannouss, LM (7.1) - 7, Chemsdine Talbi 83’ (SC)
8, Azzedine Ounahi, CAM (7.0) - 15, Samir El Mourabet 90’ (SC)
10, Brahim Díaz, RM (7.7) - 21, Ayoube Amaimouni 83’ (SC)
11, Ismael Saibari, ST (8.0) - 9, Soufiane Rahimi 83’ (SC)
DT, Mohamed Ouahbi
Sub MAR
12, Munir El Kajoui, GK
22, Ahmed Reda Tagnaouti, GK
4, Sofyan Amrabat
5, Marwane Saâdane
13, Zakaria El Ouahdi
16, Gessime Yassine
17, Amine Sbaï
19, Youssef Belammari
20, Ayoub El Kaabi
25, Redouane Halhal
26, Anass Salah-Eddine
POS: 40, 60 - TIR: 6, 12 - TPO: 0, 2 - FAL: 11, 8 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 2, 5 - ATA: 1, 0
Kit SCO J1 C1, P2 C1 - Kit MAR J2 C1, P2 C1 - Kit ARB TorFWC26 R5 C1
JDP MAR Ismael Saibari ALT

Partido 31
Turquía 0 - Paraguay 1
19 jun 2026 · 20:00 UTC−7
Clima: 20 °C, Despejado
Estadio Bahía de San Francisco, San Francisco, Estados Unidos
Asistencia: 68,827
ARB Iván Barton (SLV) - AA1 David Morán (SLV) - AA2 Antonio Pupiro (NCA) - 4AR Oshane Nation (JAM) - VAR Khamis Al-Marri (QAT) - AVAR Tatiana Guzmán (NCA)
Incidencias:
Gol PAR Matías Galarza 2’ - Asi PAR Julio Enciso
Ama PAR Matías Galarza 4’
Roj PAR Miguel Almirón 45+3’ (RD)
Ama TUR Vincenzo Montella 63’
Ama TUR Eren Elmalı 71’
FT 90+8’
Ali TUR 4-2-3-1 (W)
23, Uğurcan Çakır, GK (6.3)
20, Ferdi Kadıoğlu, LB (7.1) - 13, Eren Elmalı 71’ (6.4)
14, Abdülkerim Bardakcı, CB (8.0) - 6, Orkun Kökçü 86’ (SC)
3, Merih Demiral, CB (7.1)
18, Mert Müldür, RB (7.7)
10, Hakan Çalhanoğlu, CDM (C) (7.7)
16, İsmail Yüksek, CDM (6.9) - 26, Can Uzun 60’ (7.2)
11, Kenan Yıldız, LM (7.4)
8, Arda Güler, CAM (7.1)
19, Yunus Akgün, RM (6.0) - 9, Deniz Gül 60’ (5.8)
7, Kerem Aktürkoğlu, ST (6.0) - 21, Barış Alper Yılmaz 45’ (6.3)
DT, Vincenzo Montella
Sub TUR
1, Mert Günok, GK
12, Altay Bayındır, GK
2, Zeki Çelik
4, Çağlar Söyüncü
5, Salih Özcan
15, Ozan Kabak
17, İrfan Can Kahveci
22, Kaan Ayhan
24, Oğuz Aydın
25, Samet Akaydin
Ali PAR 4-2-3-1 (W)
12, Orlando Gill, GK (8.3)
6, Júnior Alonso, LB (7.1)
3, Omar Alderete, CB (7.3)
15, Gustavo Gómez, CB (C) (7.3)
4, Juan José Cáceres, RB (8.4) - 26, Alexandro Maidana 81’ (SC)
8, Diego Gómez, CDM (6.8) - 2, Gustavo Velázquez 67’ (6.2)
14, Andrés Cubas, CDM (7.2)
23, Matías Galarza, LM (8.1) - 13, José Canale 90+1’ (SC)
19, Julio Enciso, CAM (8.6) - 21, Gabriel Ávalos 90+1’ (SC)
10, Miguel Almirón, RM (6.0)
25, Isidro Pitta, ST (5.7) - 16, Damián Bobadilla 45’ (6.7)
DT, Gustavo Alfaro
Sub PAR
1, Gatito Fernández, GK
22, Gastón Olveira, GK
5, Fabián Balbuena
7, Ramón Sosa
9, Antonio Sanabria
11, Maurício
17, Alejandro Romero Gamarra
18, Álex Arce
20, Braian Ojeda
24, Gustavo Caballero
POS: 81, 19 - TIR: 32, 7 - TPO: 5, 2 - FAL: 14, 15 - AMA: 2, 2 - ROJ: 0, 1 - ESQ: 12, 0 - ATA: 1, 5
Kit TUR J2 C1, P3 C1 - Kit PAR J2 C1, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP PAR Matías Galarza

Partido 32
Estados Unidos 2 - Australia 0
19 jun 2026 · 12:00 UTC−7
Clima: 23 °C, Parcialmente nublado
Estadio Seattle, Seattle, Estados Unidos
Asistencia: 66,925
ARB Felix Zwayer (GER) - AA1 Robert Kempter (GER) - AA2 Christian Dietz (GER) - 4AR Katia Itzel García (MEX) - VAR Bastian Dankert (GER) - AVAR Hamza El Fariq (MAR)
Incidencias:
Gol USA Cameron Burgess 11’ (GEC)
Ama AUS Jordan Bos 16’
Ama AUS Alessandro Circati 32’
Gol USA Alex Freeman 43’
Ama USA Antonee Robinson 56’
Ama USA Folarin Balogun 89’
Ama AUS Jacob Italiano 89’
Ama AUS Harry Souttar 89’
Ama USA Chris Richards 90+3’
FT 90+8’
Ali USA 3-5-2
24, Matt Freese, GK (7.9)
13, Tim Ream, CB (C) (7.3)
3, Chris Richards, CB (7.6)
16, Alex Freeman, CB (8.5)
5, Antonee Robinson, LM (7.7) - 6, Auston Trusty 80’ (6.2)
17, Malik Tillman, CDM (7.6)
4, Tyler Adams, CAM (7.6)
8, Weston McKennie, CDM (7.8) - 7, Giovanni Reyna 90+6’ (SC)
2, Sergiño Dest, RM (7.1) - 23, Joe Scally 80’ (6.3)
20, Folarin Balogun, ST (6.6) - 19, Haji Wright 90+6’ (SC)
9, Ricardo Pepi, ST (6.4) - 14, Sebastian Berhalter 74’ (6.4)
DT, Mauricio Pochettino
Sub USA
1, Matt Turner, GK
25, Chris Brady, GK
11, Brenden Aaronson
12, Miles Robinson
15, Cristian Roldan
18, Max Arfsten
21, Timothy Weah
22, Mark McKenzie
26, Alejandro Zendejas
Ali AUS 5-4-1
18, Patrick Beach, GK (6.4)
5, Jordan Bos, LB (6.3)
21, Cameron Burgess, CB (4.8) - 6, Jason Geria 45’ (6.2)
19, Harry Souttar, CB (C) (5.9)
3, Alessandro Circati, CB (6.9)
4, Jacob Italiano, RB (6.2)
23, Nishan Velupillay, LM (6.1) - 8, Connor Metcalfe 45’ (6.4)
24, Paul Okon-Engstler, CM (6.6) - 22, Jackson Irvine 78’ (6.3)
13, Aiden O'Neill, CM (7.0)
7, Mathew Leckie, RM (6.1) - 20, Cristian Volpato 61’ (6.8)
9, Mohamed Touré, ST (5.9) - 17, Nestory Irankunda 45’ (6.3)
DT, Tony Popovic
Sub AUS
1, Mathew Ryan, GK
12, Paul Izzo, GK
2, Miloš Degenek
10, Ajdin Hrustic
11, Awer Mabil
14, Cameron Devlin
15, Kai Trewin
16, Aziz Behich
25, Lucas Herrington
26, Tete Yengi
POS: 63, 37 - TIR: 10, 5 - TPO: 2, 2 - FAL: 12, 16 - AMA: 3, 4 - ROJ: 0, 0 - ESQ: 7, 4 - ATA: 2, 1
Kit USA J1 C1, P2 C1 - Kit AUS J1 C2, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP USA Folarin Balogun

Partido 33
Alemania 2 - Costa de Marfil 1
20 jun 2026 · 16:00 UTC−4
Clima: 23 °C, Soleado
Estadio Toronto, Toronto, Canadá
Asistencia: 43,036
ARB Juan Gabriel Benítez (PAR) - AA1 Eduardo Cardozo (PAR) - AA2 Milciades Saldívar (PAR) - 4AR Khalid Al-Turais (KSA) - VAR Antonio García (URU) - AVAR Guillermo Pacheco (MEX)
Incidencias:
Gol CIV Franck Kessié 30’
Gol GER Deniz Undav 68’ - Asi GER Nadiem Amiri
Gol GER Deniz Undav 90+4’ - Asi GER Felix Nmecha
FT 90+7’
Ali GER 4-2-3-1 (N)
1, Manuel Neuer, GK (6.8)
18, Nathaniel Brown, LB (6.5)
15, Nico Schlotterbeck, CB (6.8) - 2, Antonio Rüdiger 45’ (6.5)
4, Jonathan Tah, CB (7.7)
6, Joshua Kimmich, RB (C) (7.6)
5, Aleksandar Pavlović, CDM (6.8) - 20, Nadiem Amiri 60’ (7.2)
23, Felix Nmecha, CDM (8.2)
17, Florian Wirtz, CAM (7.8)
10, Jamal Musiala, CAM (7.1) - 26, Deniz Undav 60’ (8.7)
19, Leroy Sané, CAM (6.7) - 9, Jamie Leweling 60’ (6.4)
7, Kai Havertz, ST (6.5) - 8, Leon Goretzka 85’ (SC)
DT, Julian Nagelsmann
Sub GER
12, Oliver Baumann, GK
21, Alexander Nübel, GK
3, Waldemar Anton
11, Nick Woltemade
13, Pascal Groß
14, Maximilian Beier
16, Angelo Stiller
22, David Raum
24, Malick Thiaw
25, Assan Ouédraogo
Ali CIV 4-3-3 (H)
1, Yahia Fofana, GK (7.0)
3, Ghislain Konan, LB (6.6)
20, Emmanuel Agbadou, CB (6.4)
7, Odilon Kossounou, CB (6.6)
5, Wilfried Singo, RB (7.1) - 17, Guéla Doué 82’ (SC)
26, Christ Inao Oulaï, CM (7.5)
18, Ibrahim Sangaré, CDM (7.3) - 6, Seko Fofana 75’ (6.0)
8, Franck Kessié, CM (C) (7.2)
11, Yan Diomande, LW (7.1) - 19, Nicolas Pépé 85’ (SC)
9, Ange-Yoan Bonny, ST (6.1) - 22, Evann Guessand 75’ (5.9)
15, Amad Diallo, RW (6.4) - 10, Simon Adingra 75’ (6.1)
DT, Emerse Faé
Sub CIV
16, Mohamed Koné, GK
23, Alban Lafont, GK
2, Ousmane Diomande
4, Jean Michaël Seri
12, Elye Wahi
13, Christopher Opéri
14, Oumar Diakité
21, Evan Ndicka
24, Bazoumana Touré
25, Parfait Guiagon
POS: 58, 42 - TIR: 16, 9 - TPO: 7, 2 - FAL: 5, 7 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 8, 3 - ATA: 1, 5
Kit GER J1 C1, P2 C1 - Kit CIV J1 C1, P3 C1 - Kit ARB TorFWC26 R1 C1
JDP GER Deniz Undav

Partido 34
Ecuador 0 - Curazao 0
20 jun 2026 · 19:00 UTC−5
Clima: 26 °C, Parcialmente nublado
Estadio Kansas City, Kansas City, Estados Unidos
Asistencia: 68,598
ARB Ma Ning (CHN) - AA1 Zhou Fei (CHN) - AA2 Saoud Al-Maqaleh (QAT) - 4AR Campbell-Kirk Kawana-Waugh (NZL) - VAR Fu Ming (CHN) - AVAR Marco Di Bello (ITA)
Incidencias:
Ama ECU Jordy Alcívar 38’
Ama CUW Leandro Bacuna 39’
Ama CUW Juninho Bacuna 53’
Ama CUW Livano Comenencia 56’
Ama CUW Juriën Gaari 75’
Ama CUW Gervane Kastaneer 90+1’
FT 90+5’
Ali ECU 3-5-2
1, Hernán Galíndez, GK (8.0)
3, Piero Hincapié, CB (7.9)
6, Willian Pacho, CB (7.3)
21, Alan Franco, CB (7.5) - 17, Ángelo Preciado 83’ (SC)
7, Pervis Estupiñán, LM (6.3) - 20, Nilson Angulo 71’ (6.7)
23, Moisés Caicedo, CDM (8.4)
5, Jordy Alcívar, CAM (6.6) - 11, Kevin Rodríguez 45’ (7.1)
15, Pedro Vite, CDM (8.1)
9, John Yeboah, RM (7.4) - 16, Jordy Caicedo 89’ (SC)
13, Enner Valencia, ST (C) (6.5)
19, Gonzalo Plata, ST (7.7)
DT, Sebastián Beccacece
Sub ECU
12, Moisés Ramírez, GK
22, Gonzalo Valle, GK
2, Félix Torres
4, Joel Ordóñez
8, Anthony Valencia
10, Kendry Páez
14, Alan Minda
18, Denil Castillo
24, Jeremy Arévalo
25, Jackson Porozo
26, Yaimar Medina
Ali CUW 5-3-2
1, Eloy Room, GK (9.3)
24, Deveron Fonville, LB (6.9) - 4, Roshon van Eijma 75’ (6.3)
5, Sherel Floranus, CB (7.3)
18, Armando Obispo, CB (7.3)
3, Juriën Gaari, CB (7.3)
20, Joshua Brenet, RB (7.8)
8, Livano Comenencia, CM (6.0) - 6, Godfried Roemeratoe 84’ (SC)
10, Leandro Bacuna, CDM (C) (6.9)
21, Tahith Chong, CM (7.3) - 16, Jearl Margaritha 75’ (6.0)
7, Juninho Bacuna, ST (7.0) - 14, Kenji Gorré 75’ (6.1)
9, Jürgen Locadia, ST (6.0) - 19, Gervane Kastaneer 84’ (SC)
DT, Dick Advocaat
Sub CUW
25, Tyrick Bodak, GK
26, Trevor Doornbusch, GK
2, Shurandy Sambo
11, Jeremy Antonisse
12, Sontje Hansen
13, Tyrese Noslin
15, Ar'jany Martha
17, Brandley Kuwas
22, Kevin Felida
23, Riechedly Bazoer
POS: 74, 26 - TIR: 28, 10 - TPO: 15, 3 - FAL: 7, 10 - AMA: 1, 5 - ROJ: 0, 0 - ESQ: 9, 0 - ATA: 3, 15
Kit ECU J1 C2, P2 C1 - Kit CUW J1 C1, P2 C1 - Kit ARB TorFWC26 R5 C1
JDP CUW Eloy Room

Partido 35
Países Bajos 5 - Suecia 1
20 jun 2026 · 12:00 UTC−5
Clima: 28 °C, Llovizna · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,777
ARB Michael Oliver (ENG) - AA1 Stuart Burt (ENG) - AA2 James Mainwaring (ENG) - 4AR Abongile Tom (RSA) - VAR Jarred Gillett (ENG) - AVAR Ivan Bebek (CRO)
Incidencias:
Gol NED Brian Brobbey 5’ - Asi NED Cody Gakpo
Gol NED Brian Brobbey 17’ - Asi NED Denzel Dumfries
Gol NED Cody Gakpo 47’ - Asi NED Denzel Dumfries
Ama SWE Gabriel Gudmundsson 53’
Gol NED Cody Gakpo 54’
Gol SWE Anthony Elanga 59’ - Asi SWE Alexander Isak
Ama SWE Yasin Ayari 75’
Ama SWE Lucas Bergvall 80’
Gol NED Crysencio Summerville 89’ - Asi NED Memphis Depay
FT 90+5’
Ali NED 4-3-3
1, Bart Verbruggen, GK (7.9)
15, Micky van de Ven, LB (7.3)
4, Virgil van Dijk, CB (C) (7.1)
6, Jan Paul van Hecke, CB (7.2)
22, Denzel Dumfries, RB (8.7)
14, Tijjani Reijnders, CM (6.1) - 16, Guus Til 59’ (6.1)
21, Frenkie de Jong, CM (7.7) - 20, Teun Koopmeiners 59’ (6.5)
8, Ryan Gravenberch, CM (7.0)
11, Cody Gakpo, LW (9.3) - 17, Noa Lang 90’ (SC)
19, Brian Brobbey, ST (8.8) - 10, Memphis Depay 72’ (6.6)
18, Donyell Malen, RW (6.4) - 24, Crysencio Summerville 45’ (8.4)
DT, Ronald Koeman
Sub NED
13, Robin Roefs, GK
23, Mark Flekken, GK
2, Lutsharel Geertruida
3, Marten de Roon
5, Nathan Aké
7, Justin Kluivert
9, Wout Weghorst
12, Mats Wieffer
25, Jorrel Hato
Ali SWE 3-5-2
23, Kristoffer Nordfeldt, GK (4.6)
3, Victor Lindelöf, CB (C) (4.7)
4, Isak Hien, CB (4.9)
2, Gustaf Lagerbielke, CB (5.3)
5, Gabriel Gudmundsson, LM (6.1) - 24, Elliot Stroud 90+3’ (SC)
18, Yasin Ayari, CDM (6.2) - 26, Taha Ali 79’ (6.6)
16, Jesper Karlström, CAM (5.8) - 22, Besfort Zeneli 55’ (6.3)
10, Benjamin Nygren, CDM (5.6) - 7, Lucas Bergvall 55’ (6.6)
21, Alexander Bernhardsson, RM (6.5) - 11, Anthony Elanga 55’ (7.4)
9, Alexander Isak, ST (7.9)
17, Viktor Gyökeres, ST (7.0)
DT, Graham Potter
Sub SWE
1, Jacob Widell Zetterström, GK
12, Viktor Johansson, GK
6, Herman Johansson
8, Daniel Svensson
13, Ken Sema
14, Hjalmar Ekdal
15, Carl Starfelt
19, Mattias Svanberg
20, Eric Smith
25, Gustaf Nilsson
POS: 52, 48 - TIR: 10, 16 - TPO: 7, 8 - FAL: 9, 12 - AMA: 0, 3 - ROJ: 0, 0 - ESQ: 2, 5 - ATA: 7, 2
Kit NED J1 C1, P1 C1 - Kit SWE J2 C1, P3 C1 - Kit ARB TorFWC26 R3 C1
JDP NED Cody Gakpo

Partido 36
Túnez 0 - Japón 4
20 jun 2026 · 22:00 UTC−6
Clima: 23 °C, Mayormente despejado
Estadio Monterrey, Monterrey, México
Asistencia: 51,243
ARB István Kovács (ROU) - AA1 Mihai Marica (ROU) - AA2 Ferencz Tunyogi (ROU) - 4AR Juan Gabriel Calderón (CRC) - VAR Fedayi San (SUI) - AVAR Joe Dickerson (USA)
Incidencias:
Gol JPN Daichi Kamada 4’ - Asi JPN Keito Nakamura
Gol JPN Ayase Ueda 31’ - Asi JPN Kō Itakura
Gol JPN Junya Itō 69’ - Asi JPN Ayase Ueda
Gol JPN Ayase Ueda 83’ - Asi JPN Kaishū Sano
FT 90+6’
Ali TUN 5-3-2
16, Aymen Dahmen, GK (4.9)
2, Ali Abdi, LB (6.7) - 7, Elias Achouri 90’ (SC)
4, Omar Rekik, CB (5.8)
3, Montassar Talbi, CB (5.1)
6, Dylan Bronn, CB (5.9) - 21, Mohamed Amine Ben Hamida 45’ (6.7)
20, Yan Valery, RB (6.5)
10, Hannibal Mejbri, CM (6.1)
25, Anis Slimane, CDM (6.7)
17, Ellyes Skhiri, CM (C) (5.4) - 13, Rani Khedira 90’ (SC)
26, Sebastian Tounekti, ST (5.5) - 19, Firas Chaouat 64’ (5.8)
8, Elias Saad, ST (5.6) - 11, Ismaël Gharbi 45’ (6.0)
DT, Hervé Renard
Sub TUN
1, Mouhib Chamakh, GK
22, Sabri Ben Hessen, GK
5, Adem Arous
9, Hazem Mastouri
12, Mortadha Ben Ouanes
14, Khalil Ayari
15, Hadj Mahmoud
18, Rayan Elloumi
23, Moutaz Neffati
24, Raed Chikhaoui
Ali JPN 3-4-3
1, Zion Suzuki, GK (7.4)
21, Hiroki Itō, CB (7.7)
4, Kō Itakura, CB (C) (8.3)
22, Takehiro Tomiyasu, CB (7.4) - 20, Ayumu Seko 78’ (6.6)
13, Keito Nakamura, LM (8.2) - 17, Yuito Suzuki 78’ (6.1)
7, Ao Tanaka, CM (7.5)
24, Kaishū Sano, CM (8.1)
10, Ritsu Dōan, RM (7.0) - 2, Yukinari Sugawara 74’ (6.3)
15, Daichi Kamada, LW (7.7) - 25, Junnosuke Suzuki 74’ (6.2)
18, Ayase Ueda, ST (9.3) - 9, Keisuke Gotō 84’ (SC)
14, Junya Itō, RW (7.7)
DT, Hajime Moriyasu
Sub JPN
12, Keisuke Ōsako, GK
23, Tomoki Hayakawa, GK
3, Shōgo Taniguchi
5, Yūto Nagatomo
11, Daizen Maeda
16, Tsuyoshi Watanabe
19, Kōki Ogawa
26, Kento Shiogai
POS: 40, 60 - TIR: 2, 11 - TPO: 0, 5 - FAL: 8, 15 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 3, 5 - ATA: 1, 0
Kit TUN J2 C1, P2 C1 - Kit JPN J1 C2, P2 C1 - Kit ARB TorFWC26 R12 C1
JDP JPN Ayase Ueda

Partido 37
Uruguay 2 - Cabo Verde 2
21 jun 2026 · 18:00 UTC−4
Clima: 31 °C, Llovizna
Estadio Miami, Miami, Estados Unidos
Asistencia: 64,003
ARB Espen Eskås (NOR) - AA1 Jan Erik Engan (NOR) - AA2 Isaak Bashevkin (NOR) - 4AR Tori Penso (USA) - VAR Willy Delajod (FRA) - AVAR Jérôme Brisard (FRA)
Incidencias:
Ama CPV Sidny Lopes Cabral 5’
Ama URU Rodrigo Bentancur 20’
Gol CPV Kevin Pina 21’
Gol URU Maximiliano Araújo 44’
Gol URU Agustín Canobbio 45+6’ - Asi URU Maximiliano Araújo
Ama URU Mathías Olivera 58’
Gol CPV Hélio Varela 61’
Ama CPV Diney Borges 90+3’
FT 90+8’
Ali URU 4-3-3 (H)
23, Fernando Muslera, GK (4.6)
25, Juan Manuel Sanabria, LB (6.2)
16, Mathías Olivera, CB (5.8)
3, Sebastián Cáceres, CB (6.5)
13, Guillermo Varela, RB (6.6)
8, Federico Valverde, CM (C) (7.2)
5, Manuel Ugarte, CDM (6.2) - 7, Nicolás de la Cruz 70’ (6.5)
6, Rodrigo Bentancur, CM (8.2)
20, Maximiliano Araújo, LW (8.3) - 18, Brian Rodríguez 81’ (SC)
21, Federico Viñas, ST (6.7) - 9, Darwin Núñez 70’ (6.4)
14, Agustín Canobbio, RW (7.9)
DT, Marcelo Bielsa
Sub URU
1, Sergio Rochet, GK
12, Santiago Mele, GK
2, José María Giménez
11, Facundo Pellistri
15, Emiliano Martínez
17, Matías Viña
19, Rodrigo Aguirre
22, Joaquín Piquerez
24, Santiago Bueno
26, Rodrigo Zalazar
Ali CPV 4-3-3 (H)
1, Vozinha, GK (6.2)
13, Sidny Lopes Cabral, LB (6.8)
3, Diney Borges, CB (7.5)
4, Pico Lopes, CB (7.2)
22, Steven Moreira, RB (6.7)
10, Jamiro Monteiro, CM (6.5) - 16, Yannick Semedo 80’ (6.6)
6, Kevin Pina, CDM (7.7) - 15, Laros Duarte 70’ (7.1)
20, Ryan Mendes, CM (C) (7.0)
11, Garry Rodrigues, LW (6.4) - 26, Hélio Varela 58’ (7.0)
9, Gilson Benchimol, ST (6.3) - 21, Nuno da Costa 58’ (6.4)
18, Telmo Arcanjo, RW (6.3) - 14, Deroy Duarte 45’ (6.7)
DT, Bubista
Sub CPV
12, Márcio Rosa, GK
23, CJ dos Santos, GK
2, Stopira
5, Logan Costa
7, Jovane Cabral
8, João Paulo
17, Willy Semedo
19, Dailon Livramento
24, Wagner Pina
25, Kelvin Pires
POS: 63, 37 - TIR: 17, 12 - TPO: 2, 4 - FAL: 11, 4 - AMA: 2, 2 - ROJ: 0, 0 - ESQ: 11, 4 - ATA: 2, 0
Kit URU J1 C1, P2 C1 - Kit CPV J3 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP CPV Kevin Pina

Partido 38
España 4 - Arabia Saudita 0
21 jun 2026 · 12:00 UTC−4
Clima: 27 °C, Nublado · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 68,239
ARB Raphael Claus (BRA) - AA1 Danilo Manis (BRA) - AA2 Rodrigo Figueiredo (BRA) - 4AR Andrés Rojas (COL) - VAR Nicolás Gallo Barragán (COL) - AVAR Erick Miranda (MEX)
Incidencias:
Gol ESP Lamine Yamal 10’ - Asi ESP Mikel Oyarzabal
Gol ESP Mikel Oyarzabal 21’ - Asi ESP Aymeric Laporte
Gol ESP Mikel Oyarzabal 24’ - Asi ESP Dani Olmo
Ama KSA Salem Al-Dawsari 30’
Gol ESP Hassan Al-Tambakti 49’ (GEC)
Ama KSA Mohamed Kanno 60’
FT 90+8’
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (7.8)
24, Marc Cucurella, LB (7.5)
14, Aymeric Laporte, CB (8.1)
22, Pau Cubarsí, CB (7.8)
12, Pedro Porro, RB (8.3)
20, Pedri, CM (7.4) - 8, Fabián Ruiz 70’ (6.6)
16, Rodri, CDM (C) (8.3)
10, Dani Olmo, CM (7.7) - 6, Mikel Merino 61’ (6.2)
15, Álex Baena, LW (7.0) - 17, Nico Williams 61’ (5.8)
21, Mikel Oyarzabal, ST (9.3) - 7, Ferran Torres 45’ (6.3)
19, Lamine Yamal, RW (8.4) - 11, Yéremy Pino 45’ (6.1)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
4, Eric García
5, Marcos Llorente
9, Gavi
18, Martín Zubimendi
25, Víctor Muñoz
26, Borja Iglesias
Ali KSA 5-4-1
21, Mohammed Al-Owais, GK (6.6)
24, Moteb Al-Harbi, LB (5.1)
5, Hassan Al-Tambakti, CB (4.5)
3, Ali Lajami, CB (5.8)
4, Abdulelah Al-Amri, CB (5.3) - 18, Alaa Al-Hajji 60’ (6.2)
12, Saud Abdulhamid, RB (5.6)
10, Salem Al-Dawsari, LM (C) (6.1)
6, Nasser Al-Dawsari, CM (7.1) - 17, Khalid Al-Ghannam 90’ (SC)
15, Abdullah Al-Khaibari, CM (6.3) - 23, Mohamed Kanno 45’ (6.2)
7, Musab Al-Juwayr, RM (6.2) - 19, Abdullah Al-Hamddan 45’ (6.3)
9, Feras Al-Buraikan, ST (6.1) - 26, Mohammed Abu Al-Shamat 60’ (6.8)
DT, Georgios Donis
Sub KSA
1, Nawaf Al-Aqidi, GK
22, Ahmed Al-Kassar, GK
2, Ali Majrashi
8, Aiman Yahya
11, Saleh Al-Shehri
13, Nawaf Boushal
14, Hassan Kadish
16, Ziyad Al-Johani
20, Sultan Mandash
25, Jehad Thakri
POS: 66, 34 - TIR: 22, 3 - TPO: 8, 1 - FAL: 10, 2 - AMA: 0, 2 - ROJ: 0, 0 - ESQ: 6, 1 - ATA: 1, 5
Kit ESP J1 C1, P2 C1 - Kit KSA J2 C1, P4 C1 - Kit ARB TorFWC26 R2 C1
JDP ESP Mikel Oyarzabal

Partido 39
Bélgica 0 - Irán 0
21 jun 2026 · 12:00 UTC−7
Clima: 22 °C, Mayormente soleado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,317
ARB Darío Herrera (ARG) - AA1 Cristian Navarro (ARG) - AA2 Gabriel Chade (ARG) - 4AR Yusuke Araki (JPN) - VAR Hernán Mastrangelo (ARG) - AVAR Leodán González (URU)
Incidencias:
Ama BEL Romelu Lukaku 3’
Ama IRN Saeid Ezatolahi 33’
Roj BEL Nathan Ngoy 66’ (RD)
FT 90+5’
Ali BEL 4-2-3-1 (W)
1, Thibaut Courtois, GK (8.3)
5, Maxim De Cuyper, LB (7.7)
4, Brandon Mechele, CB (7.6)
25, Nathan Ngoy, CB (6.6)
15, Thomas Meunier, RB (7.2) - 21, Timothy Castagne 58’ (7.1)
8, Youri Tielemans, CDM (C) (7.7)
23, Nicolas Raskin, CDM (7.3) - 20, Hans Vanaken 58’ (6.2)
10, Leandro Trossard, LM (8.0)
7, Kevin De Bruyne, CAM (7.5) - 26, Matias Fernandez-Pardo 87’ (SC)
22, Alexis Saelemaekers, RM (6.4) - 14, Dodi Lukébakio 58’ (6.1)
9, Romelu Lukaku, ST (6.1) - 3, Arthur Theate 73’ (6.4)
DT, Rudi Garcia
Sub BEL
12, Senne Lammens, GK
13, Mike Penders, GK
6, Axel Witsel
16, Koni De Winter
17, Charles De Ketelaere
18, Joaquin Seys
19, Diego Moreira
24, Amadou Onana
Ali IRN 5-2-1-2
1, Alireza Beiranvand, GK (9.1)
3, Ehsan Hajisafi, LB (C) (6.8) - 5, Milad Mohammadi 66’ (6.5)
19, Ali Nemati, CB (6.6)
4, Shoja Khalilzadeh, CB (7.8)
13, Hossein Kanani, CB (7.2)
2, Saleh Hardani, RB (6.4) - 7, Alireza Jahanbakhsh 45’ (6.3)
6, Saeid Ezatolahi, CM (6.9) - 18, Amirhossein Hosseinzadeh 85’ (SC)
14, Saman Ghoddos, CM (6.7) - 20, Shahriyar Moghanloo 79’ (6.3)
9, Mehdi Taremi, CAM (6.3)
8, Mohammad Mohebbi, ST (6.2) - 16, Mehdi Torabi 66’ (6.4)
23, Ramin Rezaeian, ST (6.8)
DT, Amir Ghalenoei
Sub IRN
12, Payam Niazmand, GK
22, Hossein Hosseini, GK
10, Mehdi Ghayedi
11, Ali Alipour
15, Roozbeh Cheshmi
17, Arya Yousefi
21, Mohammad Ghorbani
24, Dennis Dargahi
25, Danial Iri
26, Amirmohammad Razaghinia
POS: 69, 31 - TIR: 23, 7 - TPO: 7, 3 - FAL: 7, 9 - AMA: 1, 1 - ROJ: 1, 0 - ESQ: 4, 2 - ATA: 3, 7
Kit BEL J1 C1, P1 C1 - Kit IRN J1 C1, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP IRN Alireza Beiranvand ALT

Partido 40
Nueva Zelanda 1 - Egipto 3
21 jun 2026 · 18:00 UTC−7
Clima: 22 °C, Soleado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Omar Al-Ali (UAE) - AA1 Mohamed Al-Hammadi (UAE) - AA2 Taleb Al-Marri (QAT) - 4AR Kevin Ortega (PER) - VAR Mohammed Obaid Khadim (UAE) - AVAR Shaun Evans (AUS)
Incidencias:
Gol NZL Finn Surman 15’ - Asi NZL Tim Payne
Ama EGY Mohanad Lasheen 17’
Ama NZL Sarpreet Singh 20’
Ama NZL Callum McCowatt 34’
Gol EGY Mostafa Zico 58’ - Asi EGY Mohamed Hany
Gol EGY Mohamed Salah 67’ - Asi EGY Mostafa Zico
Gol EGY Trézéguet 82’ - Asi EGY Mohamed Salah
FT 90+10’
Ali NZL 4-4-2
1, Max Crocombe, GK (5.6)
13, Liberato Cacace, LB (6.8) - 21, Jesse Randall 76’ (6.3)
5, Michael Boxall, CB (5.7)
16, Finn Surman, CB (7.0)
2, Tim Payne, RB (6.3) - 4, Tyler Bindon 85’ (SC)
11, Elijah Just, LM (6.7) - 3, Francis de Vries 85’ (SC)
8, Marko Stamenić, CM (6.2)
6, Joe Bell, CM (6.1)
10, Sarpreet Singh, RM (5.8) - 23, Ryan Thomas 76’ (6.4)
9, Chris Wood, ST (C) (6.0)
20, Callum McCowatt, ST (6.1) - 19, Ben Old 66’ (6.2)
DT, Darren Bazeley
Sub NZL
12, Alex Paulsen, GK
22, Michael Woud, GK
7, Logan Rogerson
14, Alex Rufer
15, Nando Pijnaker
17, Kosta Barbarouses
18, Ben Waine
24, Callan Elliot
25, Lachlan Bayliss
26, Tommy Smith
Ali EGY 4-2-3-1 (W)
23, Mostafa Shobeir, GK (8.3)
13, Ahmed Fatouh, LB (7.8)
14, Hamdy Fathy, CB (6.9) - 5, Ramy Rabia 41’ (6.8)
2, Yasser Ibrahim, CB (6.7)
3, Mohamed Hany, RB (8.0)
17, Mohanad Lasheen, CDM (7.5)
19, Marwan Attia, CDM (7.5)
8, Emam Ashour, LM (7.3) - 25, Zizo 84’ (SC)
10, Mohamed Salah, CAM (C) (8.9) - 4, Hossam Abdelmaguid 84’ (SC) - 6, Mohamed Abdelmonem 90+9’ (SC)
11, Mostafa Zico, RM (8.5) - 9, Hamza Abdelkarim 76’ (6.0)
22, Omar Marmoush, ST (7.4) - 7, Trézéguet 76’ (7.1)
DT, Hossam Hassan
Sub EGY
1, Mohamed El Shenawy, GK
16, El Mahdy Soliman, GK
26, Mohamed Alaa, GK
12, Haissem Hassan
15, Karim Hafez
18, Nabil Emad
20, Ibrahim Adel
21, Mahmoud Saber
24, Tarek Alaa
POS: 43, 57 - TIR: 11, 19 - TPO: 5, 7 - FAL: 14, 8 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 4, 3 - ATA: 4, 4
Kit NZL J1 C1, P1 C1 - Kit EGY J1 C2, P2 C1 - Kit ARB TorFWC26 R4 C1
JDP EGY Mohamed Salah ALT

Partido 41
Noruega 3 - Senegal 2
22 jun 2026 · 20:00 UTC−4
Clima: 21 °C, Llovizna
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Wilton Sampaio (BRA) - AA1 Bruno Pires (BRA) - AA2 Bruno Boschilia (BRA) - 4AR Campbell-Kirk Kawana-Waugh (NZL) - VAR Rodolpho Toski (BRA) - AVAR Juan Lara (CHI)
Incidencias:
Gol NOR Marcus Holmgren Pedersen 43’
Gol NOR Erling Haaland 48’ - Asi NOR Martin Ødegaard
Gol SEN Ismaïla Sarr 53’ - Asi SEN Sadio Mané
Gol NOR Erling Haaland 58’ - Asi NOR Patrick Berg
Gol SEN Ismaïla Sarr 90+3’ - Asi SEN Nicolas Jackson
FT 90+10’
Ali NOR 4-3-3 (H)
1, Ørjan Nyland, GK (6.2)
5, David Møller Wolfe, LB (6.6)
17, Torbjørn Heggem, CB (7.2) - 4, Leo Østigård 84’ (SC)
3, Kristoffer Ajer, CB (7.2)
26, Julian Ryerson, RB (6.4) - 16, Marcus Holmgren Pedersen 13’ (7.4)
14, Fredrik Aursnes, CM (6.4) - 6, Patrick Berg 45’ (7.4)
8, Sander Berge, CDM (7.2)
10, Martin Ødegaard, CM (C) (7.7)
20, Antonio Nusa, LW (6.7) - 21, Andreas Schjelderup 71’ (6.4)
9, Erling Haaland, ST (9.0)
7, Alexander Sørloth, RW (6.2) - 22, Oscar Bobb 84’ (SC)
DT, Ståle Solbakken
Sub NOR
12, Sander Tangvik, GK
13, Egil Selvik, GK
2, Morten Thorsby
11, Jørgen Strand Larsen
15, Fredrik André Bjørkan
18, Kristian Thorstvedt
19, Thelo Aasgaard
23, Jens Petter Hauge
24, Sondre Langås
25, Henrik Falchener
Ali SEN 4-3-3
16, Édouard Mendy, GK (5.1) - 23, Mory Diaw 63’ (6.3)
25, El Hadji Malick Diouf, LB (6.1) - 14, Ismail Jakobs 54’ (6.4)
19, Moussa Niakhaté, CB (7.2)
3, Kalidou Koulibaly, CB (C) (3.7) - 17, Pape Matar Sarr 72’ (6.2)
15, Krépin Diatta, RB (6.8)
26, Pape Gueye, CM (5.8) - 20, Ibrahim Mbaye 54’ (7.1)
8, Lamine Camara, CM (7.2) - 6, Pathé Ciss 63’ (6.7)
5, Idrissa Gana Gueye, CM (6.2)
10, Sadio Mané, LW (8.4)
11, Nicolas Jackson, ST (7.3)
18, Ismaïla Sarr, RW (8.6)
DT, Pape Thiaw
Sub SEN
1, Yehvann Diouf, GK
2, Mamadou Sarr
4, Abdoulaye Seck
7, Assane Diao
9, Bamba Dieng
12, Cherif Ndiaye
13, Iliman Ndiaye
21, Habib Diarra
22, Bara Sapoko Ndiaye
24, Antoine Mendy
POS: 41, 59 - TIR: 13, 16 - TPO: 7, 4 - FAL: 13, 5 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 5, 4 - ATA: 2, 3
Kit NOR J2 C1, P2 C1 - Kit SEN J1 C1, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP NOR Erling Haaland

Partido 42
Francia 3 - Irak 0
22 jun 2026 · 17:00 UTC−4 → 2.º tiempo 20:00 (Suspensión en el descanso: tormenta eléctrica)
Clima: 31 °C, Tormenta eléctrica
Estadio Filadelfia, Filadelfia, Estados Unidos
Asistencia: 68,324
ARB Drew Fischer (CAN) - AA1 Micheal Barwegen (CAN) - AA2 Lyes Arfa (CAN) - 4AR Sandro Schärer (SUI) - VAR Joe Dickerson (USA) - AVAR Antonio García (URU)
Incidencias:
Ama IRQ Amir Al-Ammari 6’
Gol FRA Kylian Mbappé 14’ - Asi FRA Michael Olise
Gol FRA Kylian Mbappé 54’ - Asi FRA Ousmane Dembélé
Gol FRA Ousmane Dembélé 66’ - Asi FRA Michael Olise
FT 90+2’
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (7.1)
3, Lucas Digne, LB (7.3)
17, William Saliba, CB (7.2)
4, Dayot Upamecano, CB (7.9)
5, Jules Koundé, RB (7.4) - 2, Malo Gusto 83’ (SC)
14, Adrien Rabiot, CDM (7.3)
6, Manu Koné, CDM (7.5)
12, Bradley Barcola, LM (7.7) - 25, Maghnes Akliouche 83’ (SC)
11, Michael Olise, CAM (8.9) - 24, Rayan Cherki 68’ (6.9)
7, Ousmane Dembélé, RM (8.6) - 20, Désiré Doué 68’ (6.2)
10, Kylian Mbappé, ST (C) (9.2) - 9, Marcus Thuram 90+1’ (SC)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
8, Aurélien Tchouaméni
13, N'Golo Kanté
15, Ibrahima Konaté
18, Warren Zaïre-Emery
19, Théo Hernandez
21, Lucas Hernandez
22, Jean-Philippe Mateta
26, Maxence Lacroix
Ali IRQ 4-2-3-1 (W)
22, Ahmed Basil, GK (4.4)
23, Merchas Doski, LB (6.4)
5, Akam Hashim, CB (6.6)
4, Zaid Tahseen, CB (6.2) - 2, Rebin Sulaka 60’ (6.3)
3, Hussein Ali, RB (5.8)
16, Amir Al-Ammari, CDM (5.8) - 20, Aimar Sher 68’ (6.0)
24, Zaid Ismail, CDM (6.4) - 7, Youssef Amyn 60’ (5.9)
8, Ibrahim Bayesh, LM (5.8) - 21, Marko Farji 68’ (6.5)
14, Zidane Iqbal, CAM (6.7)
11, Ahmed Qasem, RM (5.7)
18, Aymen Hussein, ST (C) (6.0) - 9, Ali Al-Hamadi 26’ (6.0)
DT, Graham Arnold
Sub IRQ
1, Fahad Talib, GK
12, Jalal Hassan, GK
6, Munaf Younus
10, Mohanad Ali
13, Ali Yousif
15, Ahmed Maknazi
17, Ali Jasim
19, Kevin Yakob
25, Mustafa Saadoon
26, Frans Putros
POS: 55, 45 - TIR: 19, 4 - TPO: 5, 0 - FAL: 8, 4 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 4, 2 - ATA: 0, 2
Kit FRA J1 C2, P1 C1 - Kit IRQ J1 C1, P1 C1 - Kit ARB TorFWC26 R5 C1
JDP FRA Kylian Mbappé ALT

Partido 43
Argentina 2 - Austria 0
22 jun 2026 · 12:00 UTC−5
Clima: 29 °C, Soleado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,649
ARB Amin Omar (EGY) - AA1 Mahmoud Abouelregal (EGY) - AA2 Ahmed Hossam Taha (EGY) - 4AR Alejandro Hernández Hernández (ESP) - VAR Khamis Al-Marri (QAT) - AVAR Mahmoud Ashour (EGY)
Incidencias:
PFa ARG Lionel Messi 9’
Gol ARG Lionel Messi 38’ - Asi ARG Facundo Medina
Ama AUT Stefan Posch 41’
Ama ARG Facundo Medina 76’
Ama AUT Konrad Laimer 76’
Ama ARG Leandro Paredes 90+2’
Gol ARG Lionel Messi 90+5’
FT 90+7’
Ali ARG 4-1-3-2
23, Emiliano Martínez, GK (7.6)
25, Facundo Medina, LB (7.9) - 3, Nicolás Tagliafico 82’ (SC)
6, Lisandro Martínez, CB (7.5)
13, Cristian Romero, CB (7.2) - 19, Nicolás Otamendi 57’ (6.2)
26, Nahuel Molina, RB (7.4)
20, Alexis Mac Allister, CDM (7.4)
16, Thiago Almada, LM (7.2) - 9, Julián Alvarez 64’ (6.2)
24, Enzo Fernández, CM (7.8)
7, Rodrigo De Paul, RM (7.1) - 5, Leandro Paredes 82’ (SC)
22, Lautaro Martínez, ST (7.0) - 15, Nicolás González 64’ (6.6)
10, Lionel Messi, ST (C) (8.7)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
2, Marcos Senesi
4, Gonzalo Montiel
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
17, Giuliano Simeone
18, Nico Paz
21, José Manuel López
Ali AUT 4-2-3-1 (N)
1, Alexander Schlager, GK (5.4)
20, Konrad Laimer, LB (6.2)
8, David Alaba, CB (C) (7.4) - 23, Marco Friedl 67’ (6.1)
3, Kevin Danso, CB (6.3)
5, Stefan Posch, RB (5.6) - 22, Alexander Prass 67’ (6.2)
4, Xaver Schlager, CDM (5.7)
6, Nicolas Seiwald, CDM (7.3)
9, Marcel Sabitzer, CAM (6.6)
24, Paul Wanner, CAM (6.2) - 7, Marko Arnautović 67’ (6.0)
18, Romano Schmid, CAM (6.8) - 21, Patrick Wimmer 78’ (6.0)
11, Michael Gregoritsch, ST (6.0) - 17, Carney Chukwuemeka 85’ (SC)
DT, Ralf Rangnick
Sub AUT
12, Florian Wiegele, GK
13, Patrick Pentz, GK
2, David Affengruber
10, Florian Grillitsch
14, Saša Kalajdžić
15, Philipp Lienhart
16, Phillipp Mwene
19, Dejan Ljubičić
25, Michael Svoboda
26, Alessandro Schöpf
POS: 54, 46 - TIR: 12, 6 - TPO: 4, 1 - FAL: 13, 13 - AMA: 2, 2 - ROJ: 0, 0 - ESQ: 1, 3 - ATA: 1, 2
Kit ARG J1 C1, P3 C1 - Kit AUT J1 C2, P2 C1 - Kit ARB TorFWC26 R2 C1
JDP ARG Lionel Messi

Partido 44
Jordania 1 - Argelia 2
22 jun 2026 · 20:00 UTC−7
Clima: 17 °C, Despejado
Estadio Bahía de San Francisco, San Francisco, Estados Unidos
Asistencia: 68,371
ARB Slavko Vinčić (SVN) - AA1 Tomaž Klančnik (SVN) - AA2 Andraž Kovačič (SVN) - 4AR Oshane Nation (JAM) - VAR Ivan Bebek (CRO) - AVAR Jarred Gillett (ENG)
Incidencias:
Gol JOR Nizar Al-Rashdan 36’ - Asi JOR Musa Al-Tamari
Ama ALG Ramiz Zerrouki 44’
Ama JOR Husam Abu Dahab 64’
Gol ALG Nadhir Benbouali 69’ - Asi ALG Riyad Mahrez
Gol ALG Amine Gouiri 82’
FT 90+7’
Ali JOR 3-4-3
1, Yazeed Abulaila, GK (7.0)
4, Husam Abu Dahab, CB (6.8) - 17, Saleem Obaid 90+1’ (SC)
5, Yazan Al-Arab, CB (5.9)
3, Abdallah Nasib, CB (6.6)
20, Mohannad Abu Taha, LM (7.7) - 2, Mohammad Abu Hasheesh 84’ (SC)
8, Noor Al-Rawabdeh, CM (6.6)
21, Nizar Al-Rashdan, CM (7.4)
23, Ehsan Haddad, RM (C) (6.2)
13, Mahmoud Al-Mardi, LW (6.4) - 11, Odeh Al-Fakhouri 76’ (6.0)
10, Musa Al-Tamari, ST (6.7) - 24, Ali Azaizeh 84’ (SC)
9, Ali Olwan, RW (6.9) - 7, Mohammad Abu Zraiq 90+1’ (SC)
DT, Jamal Sellami
Sub JOR
12, Nour Bani Ateyah, GK
22, Abdallah Al-Fakhori, GK
6, Amer Jamous
14, Raja'ei Ayed
15, Ibrahim Sa'deh
16, Mo Abu Al-Nadi
18, Mohammad Abu Ghoush
19, Sa'ed Al-Rosan
25, Mohammad Al-Daoud
26, Anas Badawi
Ali ALG 4-3-3 (H)
23, Luca Zidane, GK (6.7)
15, Rayan Aït-Nouri, LB (7.9) - 13, Jaouen Hadjam 85’ (SC)
21, Ramy Bensebaini, CB (8.5)
2, Aïssa Mandi, CB (7.8)
17, Rafik Belghali, RB (7.1)
6, Ramiz Zerrouki, CM (5.8) - 19, Nabil Bentaleb 45’ (6.6)
22, Ibrahim Maza, CDM (7.7)
14, Hicham Boudaoui, CM (7.1) - 12, Nadhir Benbouali 45’ (7.5)
10, Farès Chaïbi, LW (7.7)
9, Amine Gouiri, ST (7.8) - 5, Zineddine Belaïd 85’ (SC)
7, Riyad Mahrez, RW (C) (7.9) - 11, Anis Hadj Moussa 76’ (6.7)
DT, Vladimir Petković
Sub ALG
1, Melvin Mastil, GK
16, Oussama Benbot, GK
3, Achref Abada
4, Mohamed Amine Tougai
8, Houssem Aouar
20, Adil Boulbina
24, Yacine Titraoui
25, Farès Ghedjemis
26, Samir Chergui
POS: 30, 70 - TIR: 8, 17 - TPO: 4, 8 - FAL: 11, 6 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 1, 10 - ATA: 6, 3
Kit JOR J2 C1, P1 C1 - Kit ALG J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP ALG Ibrahim Maza ALT

Partido 45
Inglaterra 0 - Ghana 0
23 jun 2026 · 16:00 UTC−4
Clima: 20 °C, Llovizna
Estadio Boston, Boston, Estados Unidos
Asistencia: 63,983
ARB Saíd Martínez (HON) - AA1 Walter López (HON) - AA2 Christian Ramírez (HON) - 4AR Ma Ning (CHN) - VAR Armando Villarreal (USA) - AVAR Erick Miranda (MEX)
Incidencias:
Ama ENG Declan Rice 41’
Ama GHA Iñaki Williams 60’
FT 90+6’
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (7.1)
25, Djed Spence, LB (7.0) - 3, Nico O'Reilly 65’ (6.7)
6, Marc Guéhi, CB (8.0)
2, Ezri Konsa, CB (7.3)
24, Reece James, RB (7.5)
4, Declan Rice, CDM (8.1)
8, Elliot Anderson, CDM (7.3) - 21, Eberechi Eze 74’ (6.5)
18, Anthony Gordon, LM (7.0) - 7, Bukayo Saka 65’ (6.3)
10, Jude Bellingham, CAM (6.0) - 17, Morgan Rogers 74’ (6.2)
20, Noni Madueke, RM (6.5) - 11, Marcus Rashford 83’ (SC)
9, Harry Kane, ST (C) (6.3)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
5, John Stones
12, Trevoh Chalobah
14, Jordan Henderson
15, Dan Burn
16, Kobbie Mainoo
19, Ollie Watkins
22, Ivan Toney
26, Jarell Quansah
Ali GHA 4-4-2
16, Benjamin Asare, GK (7.7)
14, Gideon Mensah, LB (7.7)
18, Jerome Opoku, CB (7.3)
4, Jonas Adjetey, CB (6.3)
26, Marvin Senaya, RB (7.5) - 21, Kojo Peprah Oppong 87’ (SC)
8, Kwasi Sibo, LM (6.4)
5, Thomas Partey, CM (7.4)
3, Caleb Yirenkyi, CM (6.0)
19, Iñaki Williams, RM (5.8) - 7, Abdul Fatawu 66’ (6.6)
11, Antoine Semenyo, ST (5.7)
9, Jordan Ayew, ST (C) (6.2) - 25, Prince Kwabena Adu 66’ (6.0) - 17, Abdul Rahman Baba 90+5’ (SC)
DT, Carlos Queiroz
Sub GHA
1, Lawrence Ati Zigi, GK
12, Joseph Anang, GK
2, Alidu Seidu
6, Abdul Mumin
10, Brandon Thomas-Asante
13, Christopher Bonsu Baah
15, Elisha Owusu
20, Augustine Boakye
22, Kamaldeen Sulemana
23, Derrick Luckassen
24, Ernest Nuamah
POS: 77, 23 - TIR: 19, 2 - TPO: 3, 1 - FAL: 14, 24 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 9, 2 - ATA: 0, 3
Kit ENG J1 C2, P2 C1 - Kit GHA J2 C1, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP ENG Jude Bellingham

Partido 46
Panamá 0 - Croacia 1
23 jun 2026 · 19:00 UTC−4
Clima: 22 °C, Nublado
Estadio Toronto, Toronto, Canadá
Asistencia: 43,036
ARB Pierre Atcho (GAB) - AA1 Boris Ditsoga (GAB) - AA2 Amos Abeigne (GAB) - 4AR Khalid Al-Turais (KSA) - VAR Nicolás Gallo Barragán (COL) - AVAR Fu Ming (CHN)
Incidencias:
Gol CRO Ante Budimir 54’ - Asi CRO Josip Stanišić
Ama PAN Yoel Bárcenas 61’
Ama CRO Petar Sučić 90+2’
FT 90+5’
Ali PAN 3-4-3
22, Orlando Mosquera, GK (6.5)
16, Andrés Andrade, CB (6.9)
3, José Córdoba, CB (6.8)
13, Jiovany Ramos, CB (6.4) - 18, Cecilio Waterman 77’ (6.2)
2, César Blackman, LM (6.7) - 15, Eric Davis 90’ (SC)
11, Yoel Bárcenas, CM (C) (7.2) - 9, Tomás Rodríguez 90’ (SC)
14, Carlos Harvey, CM (6.1)
23, Michael Amir Murillo, RM (6.9)
7, José Luis Rodríguez, LW (6.0)
17, José Fajardo, ST (6.4) - 24, Azarias Londoño 83’ (SC)
6, Cristian Martínez, RW (6.5)
DT, Thomas Christiansen
Sub PAN
1, Luis Mejía, GK
12, César Samudio, GK
4, Fidel Escobar
5, Edgardo Fariña
8, Adalberto Carrasquilla
10, Ismael Díaz
19, Alberto Quintero
20, Aníbal Godoy
21, César Yanis
25, Roderick Miller
26, Jorge Gutiérrez
Ali CRO 4-2-3-1 (W)
1, Dominik Livaković, GK (7.7)
4, Joško Gvardiol, LB (6.9) - 9, Andrej Kramarić 45’ (6.6)
3, Marin Pongračić, CB (7.1)
6, Josip Šutalo, CB (7.4)
2, Josip Stanišić, RB (8.1)
8, Mateo Kovačić, CDM (6.6) - 17, Petar Sučić 72’ (6.0)
10, Luka Modrić, CDM (C) (7.6) - 15, Mario Pašalić 81’ (SC)
14, Ivan Perišić, LM (7.0)
16, Martin Baturina, CAM (7.4)
24, Marco Pašalić, RM (7.2) - 21, Luka Sučić 72’ (5.9)
26, Petar Musa, ST (6.3) - 11, Ante Budimir 45’ (7.6)
DT, Zlatko Dalić
Sub CRO
12, Ivor Pandur, GK
23, Dominik Kotarski, GK
5, Duje Ćaleta-Car
7, Nikola Moro
13, Nikola Vlašić
18, Kristijan Jakić
19, Toni Fruk
20, Igor Matanović
22, Luka Vušković
25, Martin Erlić
POS: 40, 60 - TIR: 8, 6 - TPO: 1, 2 - FAL: 19, 12 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 7, 2 - ATA: 1, 1
Kit PAN J3 C1, P2 C1 - Kit CRO J1 C1, P2 C1 - Kit ARB TorFWC26 R4 C1
JDP PAN Cristian Martínez

Partido 47
Portugal 5 - Uzbekistán 0
23 jun 2026 · 12:00 UTC−5
Clima: 31 °C, Soleado · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,777
ARB Jalal Jayed (MAR) - AA1 Zakaria Brinsi (MAR) - AA2 Mostafa Akarkad (MAR) - 4AR Abongile Tom (RSA) - VAR Leodán González (URU) - AVAR Hamza El Fariq (MAR)
Incidencias:
Gol POR Cristiano Ronaldo 6’ - Asi POR João Cancelo
Ama UZB Odiljon Xamrobekov 14’
Gol POR Nuno Mendes 17’
Gol POR Cristiano Ronaldo 39’ - Asi POR Bruno Fernandes
Gol POR Abduvohid Nematov 60’ (GEC)
Ama POR Renato Veiga 68’
Gol POR Rafael Leão 87’
FT 90+5’
Ali POR 4-2-3-1 (W)
1, Diogo Costa, GK (8.2)
25, Nuno Mendes, LB (8.8)
13, Renato Veiga, CB (7.4)
3, Rúben Dias, CB (7.7)
20, João Cancelo, RB (7.8) - 2, Nélson Semedo 45’ (6.6)
23, Vitinha, CDM (7.2) - 17, Rafael Leão 83’ (SC)
15, João Neves, CDM (7.3) - 10, Bernardo Silva 76’ (6.4)
11, João Félix, LM (7.2) - 16, Francisco Trincão 63’ (6.3)
8, Bruno Fernandes, CAM (8.2)
18, Pedro Neto, RM (6.8) - 26, Francisco Conceição 45’ (7.3)
7, Cristiano Ronaldo, ST (C) (9.1)
DT, Roberto Martínez
Sub POR
12, José Sá, GK
22, Rui Silva, GK
4, Tomás Araújo
5, Diogo Dalot
6, Matheus Nunes
9, Gonçalo Ramos
14, Gonçalo Inácio
19, Gonçalo Guedes
21, Rúben Neves
24, Samú Costa
Ali UZB 3-4-3
12, Abduvohid Nematov, GK (4.5)
5, Rustam Ashurmatov, CB (5.0)
18, Abdulla Abdullaev, CB (4.6)
2, Abdukodir Khusanov, CB (5.5)
13, Sherzod Nasrullaev, LM (6.1) - 3, Khojiakbar Alijonov 45’ (6.4)
7, Otabek Shukurov, CM (6.2) - 23, Sherzod Esanov 90+2’ (SC)
9, Odiljon Xamrobekov, CM (5.7) - 6, Akmal Mozgovoy 45’ (5.9)
24, Behruzjon Karimov, RM (6.7) - 10, Ruslanbek Jiyanov 90+2’ (SC)
22, Abbosbek Fayzullaev, LW (6.7) - 21, Igor Sergeev 73’ (6.2)
14, Eldor Shomurodov, ST (C) (7.2)
19, Azizjon Ganiev, RW (6.7)
DT, Fabio Cannavaro
Sub UZB
1, Utkir Yusupov, GK
16, Botirali Ergashev, GK
4, Farrukh Sayfiev
8, Jamshid Iskanderov
11, Oston Urunov
15, Umar Eshmurodov
17, Dostonbek Khamdamov
20, Azizbek Amonov
25, Avazbek Ulmasaliyev
26, Jakhongir Urozov
POS: 65, 35 - TIR: 17, 7 - TPO: 8, 2 - FAL: 15, 15 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 3, 2 - ATA: 2, 4
Kit POR J1 C1, P1 C1 - Kit UZB J1 C1, P2 C1 - Kit ARB TorFWC26 R2 C1
JDP POR Cristiano Ronaldo

Partido 48
Colombia 1 - RD Congo 0
23 jun 2026 · 20:00 UTC−6
Clima: 18 °C, Despejado
Estadio Guadalajara, Guadalajara, México
Asistencia: 45,358
ARB Maurizio Mariani (ITA) - AA1 Daniele Bindoni (ITA) - AA2 Alberto Tegoni (ITA) - 4AR Juan Gabriel Calderón (CRC) - VAR Marco Di Bello (ITA) - AVAR Mohammed Obaid Khadim (UAE)
Incidencias:
Ama COL Jhon Lucumí 56’
Gol COL Daniel Muñoz 76’ - Asi COL Juan Fernando Quintero
Ama COD Charles Pickel 90+3’
Ama COL Jefferson Lerma 90+4’
FT 90+6’
Ali COL 4-3-3 (H)
12, Camilo Vargas, GK (7.8)
17, Johan Mojica, LB (7.9)
3, Jhon Lucumí, CB (7.4)
23, Davinson Sánchez, CB (7.9)
2, Daniel Muñoz, RB (8.2)
11, Jhon Arias, CM (7.5) - 6, Richard Ríos 77’ (5.9)
16, Jefferson Lerma, CDM (7.5)
14, Gustavo Puerta, CM (7.6)
7, Luis Díaz, LW (7.2)
25, Luis Suárez, ST (6.2) - 9, Jhon Córdoba 58’ (6.2)
10, James Rodríguez, RW (C) (7.6) - 20, Juan Fernando Quintero 58’ (7.3)
DT, Néstor Lorenzo
Sub COL
1, David Ospina, GK
24, Álvaro Montero, GK
4, Santiago Arias
5, Kevin Castaño
8, Jorge Carrascal
13, Yerry Mina
15, Juan Portilla
18, Willer Ditta
19, Cucho Hernández
21, Jaminton Campaz
22, Deiver Machado
26, Andrés Gómez
Ali COD 5-3-2
1, Lionel Mpasi, GK (7.5)
26, Arthur Masuaku, LB (7.0) - 12, Joris Kayembe 71’ (6.8)
3, Steve Kapuadi, CB (6.5)
4, Axel Tuanzebe, CB (6.2)
22, Chancel Mbemba, CB (C) (6.1)
2, Aaron Wan-Bissaka, RB (6.7)
25, Edo Kayembe, CM (5.4) - 18, Charles Pickel 71’ (6.1)
8, Samuel Moutoussamy, CDM (6.2) - 7, Nathanaël Mbuku 82’ (SC)
6, Ngal'ayel Mukau, CM (6.6) - 14, Noah Sadiki 45’ (6.1)
20, Yoane Wissa, ST (6.3)
17, Cédric Bakambu, ST (5.8) - 23, Simon Banza 57’ (6.3)
DT, Sébastien Desabre
Sub COD
16, Timothy Fayulu, GK
21, Matthieu Epolo, GK
5, Dylan Batubinsika
9, Brian Cipenga
10, Théo Bongonda
11, Gaël Kakuta
13, Meschak Elia
15, Aaron Tshibola
19, Fiston Mayele
24, Gédéon Kalulu
POS: 63, 37 - TIR: 20, 7 - TPO: 9, 2 - FAL: 12, 16 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 5, 4 - ATA: 1, 8
Kit COL J1 C2, P1 C1 - Kit COD J1 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP COL Daniel Muñoz

Partido 49
Escocia 0 - Brasil 3
24 jun 2026 · 18:00 UTC−4
Clima: 27 °C, Llovizna
Estadio Miami, Miami, Estados Unidos
Asistencia: 64,478
ARB César Arturo Ramos (MEX) - AA1 Alberto Morín (MEX) - AA2 Marco Bisguerra (MEX) - 4AR Espen Eskås (NOR) - VAR Guillermo Pacheco (MEX) - AVAR Abdullah Al-Shehri (KSA)
Incidencias:
Gol BRA Vinícius Júnior 7’ - Asi BRA Rayan
Gol BRA Vinícius Júnior 45+3’ - Asi BRA Bruno Guimarães
Gol BRA Matheus Cunha 60’ - Asi BRA Bruno Guimarães
Ama BRA Danilo Luiz 62’
Ama BRA Fabinho 82’
Ama SCO Ryan Christie 89’
FT 90+6’
Ali SCO 4-2-3-1 (W)
1, Angus Gunn, GK (7.8)
3, Andy Robertson, LB (C) (6.1) - 6, Kieran Tierney 45’ (6.4)
26, Scott McKenna, CB (4.5)
13, Jack Hendry, CB (5.8)
22, Nathan Patterson, RB (5.9) - 24, Anthony Ralston 81’ (SC)
7, John McGinn, CDM (5.7) - 25, Findlay Curtis 90+1’ (SC)
19, Lewis Ferguson, CDM (6.6)
23, Kenny McLean, LM (5.5)
4, Scott McTominay, CAM (6.5)
17, Ben Gannon-Doak, RM (5.7) - 11, Ryan Christie 81’ (SC)
20, Lawrence Shankland, ST (6.4) - 10, Ché Adams 90+1’ (SC)
DT, Steve Clarke
Sub SCO
12, Liam Kelly, GK
21, Craig Gordon, GK
2, Aaron Hickey
5, Grant Hanley
8, Tyler Fletcher
9, Lyndon Dykes
14, Ross Stewart
15, John Souttar
16, Dominic Hyam
18, George Hirst
Ali BRA 4-3-3
1, Alisson, GK (8.6)
16, Douglas Santos, LB (7.3) - 6, Alex Sandro 82’ (SC)
3, Gabriel Magalhães, CB (8.1)
4, Marquinhos, CB (C) (7.1)
13, Danilo Luiz, RB (7.6)
20, Lucas Paquetá, CM (7.9) - 22, Gabriel Martinelli 66’ (6.1)
5, Casemiro, CM (7.2) - 17, Fabinho 66’ (6.7)
8, Bruno Guimarães, CM (8.9)
7, Vinícius Júnior, LW (9.3)
9, Matheus Cunha, ST (8.5) - 10, Neymar 76’ (6.2)
26, Rayan, RW (8.5) - 19, Endrick 82’ (SC)
DT, Carlo Ancelotti
Sub BRA
12, Weverton, GK
23, Ederson, GK
2, Éderson Silva
14, Bremer
15, Léo Pereira
18, Danilo Santos
21, Luiz Henrique
24, Roger Ibañez
25, Igor Thiago
POS: 46, 54 - TIR: 14, 21 - TPO: 5, 8 - FAL: 10, 11 - AMA: 1, 2 - ROJ: 0, 0 - ESQ: 6, 6 - ATA: 5, 5
Kit SCO J1 C1, P1 C1 - Kit BRA J1 C2, P2 C1 - Kit ARB TorFWC26 R4 C1
JDP BRA Vinícius Júnior

Partido 50
Marruecos 4 - Haití 2
24 jun 2026 · 18:00 UTC−4
Clima: 28 °C, Parcialmente nublado · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 68,239
ARB Danny Makkelie (NED) - AA1 Hessel Steegstra (NED) - AA2 Jan de Vries (NED) - 4AR João Pinheiro (POR) - VAR Dennis Higler (NED) - AVAR Fedayi San (SUI)
Incidencias:
Gol HAI Yassine Bounou 10’ (GEC)
Gol MAR Achraf Hakimi 39’
Gol HAI Wilson Isidor 43’ - Asi HAI Jean-Kévin Duverne
Gol MAR Ismael Saibari 45+1’ - Asi MAR Achraf Hakimi
Gol MAR Soufiane Rahimi 78’ - Asi MAR Chadi Riad
Ama HAI Johny Placide 79’
Ama HAI Duckens Nazon 80’
Gol MAR Gessime Yassine 89’ - Asi MAR Soufiane Rahimi
Ama HAI Josué Casimir 90+3’
FT 90+8’
Ali MAR 4-2-3-1 (W)
1, Yassine Bounou, GK (5.4)
26, Anass Salah-Eddine, LB (6.5) - 3, Noussair Mazraoui 83’ (SC)
18, Chadi Riad, CB (7.6)
25, Redouane Halhal, CB (6.9)
2, Achraf Hakimi, RB (C) (9.0)
24, Neil El Aynaoui, CDM (6.6) - 15, Samir El Mourabet 83’ (SC)
4, Sofyan Amrabat, CDM (6.6)
23, Bilal El Khannouss, LM (8.3)
11, Ismael Saibari, CAM (8.0) - 9, Soufiane Rahimi 70’ (8.1)
10, Brahim Díaz, RM (6.8) - 8, Azzedine Ounahi 70’ (6.0)
20, Ayoub El Kaabi, ST (6.7) - 16, Gessime Yassine 70’ (7.5)
DT, Mohamed Ouahbi
Sub MAR
12, Munir El Kajoui, GK
22, Ahmed Reda Tagnaouti, GK
5, Marwane Saâdane
6, Ayyoub Bouaddi
7, Chemsdine Talbi
13, Zakaria El Ouahdi
14, Issa Diop
17, Amine Sbaï
19, Youssef Belammari
21, Ayoube Amaimouni
Ali HAI 4-4-2
1, Johny Placide, GK (C) (6.2)
8, Martin Expérience, LB (5.0)
5, Hannes Delcroix, CB (5.7)
4, Ricardo Adé, CB (5.7)
22, Jean-Kévin Duverne, RB (6.9) - 2, Carlens Arcus 80’ (5.2)
15, Ruben Providence, LM (6.6) - 9, Duckens Nazon 67’ (6.3)
10, Jean-Ricner Bellegarde, CM (6.1)
17, Danley Jean Jacques, CM (6.8) - 25, Dominique Simon 80’ (6.4)
21, Josué Casimir, RM (6.3)
16, Lenny Joseph, ST (5.7) - 20, Frantzdy Pierrot 83’ (SC)
18, Wilson Isidor, ST (7.4) - 11, Louicius Deedson 67’ (6.1)
DT, Sébastien Migné
Sub HAI
12, Alexandre Pierre, GK
23, Josué Duverger, GK
3, Keeto Thermoncy
6, Carl Sainté
7, Derrick Etienne Jr.
13, Duke Lacroix
14, Garven Metusala
19, Yassin Fortuné
24, Wilguens Paugain
26, Woodensky Pierre
POS: 67, 33 - TIR: 23, 8 - TPO: 11, 2 - FAL: 10, 18 - AMA: 0, 3 - ROJ: 0, 0 - ESQ: 9, 1 - ATA: 1, 7
Kit MAR J1 C1, P3 C1 - Kit HAI J1 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP MAR Achraf Hakimi ALT

Partido 51
Suiza 2 - Canadá 1
24 jun 2026 · 12:00 UTC−7
Clima: 24 °C, Mayormente soleado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Ramon Abatti (BRA) - AA1 Danilo Manis (BRA) - AA2 Rafael Alves (BRA) - 4AR Kevin Ortega (PER) - VAR Juan Soto (VEN) - AVAR Antonio García (URU)
Incidencias:
Ama SUI Granit Xhaka 32’
Ama CAN Cyle Larin 32’
Gol SUI Rubén Vargas 46’ - Asi SUI Johan Manzambi
Gol SUI Johan Manzambi 57’ - Asi SUI Breel Embolo
Gol CAN Promise David 76’ - Asi CAN Nathan Saliba
Ama CAN Liam Millar 87’
FT 90+6’
Ali SUI 4-4-2
1, Gregor Kobel, GK (8.8)
13, Ricardo Rodriguez, LB (7.5)
5, Manuel Akanji, CB (7.4)
4, Nico Elvedi, CB (7.2)
25, Luca Jaquez, RB (7.0) - 3, Silvan Widmer 74’ (5.9)
17, Rubén Vargas, LM (7.4) - 11, Dan Ndoye 80’ (6.3)
8, Remo Freuler, CM (6.8)
10, Granit Xhaka, CM (C) (7.0)
15, Djibril Sow, RM (6.9) - 20, Michel Aebischer 74’ (6.3)
9, Johan Manzambi, ST (8.4) - 16, Christian Fassnacht 85’ (SC)
7, Breel Embolo, ST (8.1) - 26, Cedric Itten 85’ (SC)
DT, Murat Yakin
Sub SUI
12, Yvon Mvogo, GK
21, Marvin Keller, GK
6, Denis Zakaria
14, Ardon Jashari
18, Eray Cömert
19, Noah Okafor
22, Fabian Rieder
23, Zeki Amdouni
24, Aurèle Amenda
Ali CAN 4-4-2
16, Maxime Crépeau, GK (5.1)
22, Richie Laryea, LB (6.1) - 14, Jacob Shaffelburg 83’ (SC)
13, Derek Cornelius, CB (5.2)
4, Luc de Fougerolles, CB (6.2)
2, Alistair Johnston, RB (6.4)
20, Ali Ahmed, LM (6.3) - 11, Liam Millar 58’ (6.3)
6, Mathieu Choinière, CM (6.7) - 7, Stephen Eustáquio 58’ (6.5)
25, Nathan Saliba, CM (8.0)
17, Tajon Buchanan, RM (6.5) - 24, Promise David 74’ (7.5)
10, Jonathan David, ST (C) (6.0)
9, Cyle Larin, ST (6.2) - 12, Tani Oluwaseyi 58’ (6.2)
DT, Jesse Marsch
Sub CAN
1, Dayne St. Clair, GK
18, Owen Goodman, GK
5, Joel Waterman
15, Moïse Bombito
19, Alphonso Davies
21, Jonathan Osorio
23, Niko Sigur
26, Jayden Nelson
POS: 57, 43 - TIR: 6, 13 - TPO: 4, 7 - FAL: 19, 13 - AMA: 1, 2 - ROJ: 0, 0 - ESQ: 2, 7 - ATA: 6, 2
Kit SUI J1 C1, P3 C1 - Kit CAN J2 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP SUI Johan Manzambi ALT

Partido 52
Bosnia y Herzegovina 3 - Catar 1
24 jun 2026 · 12:00 UTC−7
Clima: 27 °C, Soleado
Estadio Seattle, Seattle, Estados Unidos
Asistencia: 66,925
ARB Jesús Valenzuela (VEN) - AA1 Jorge Urrego (VEN) - AA2 Tulio Moreno (VEN) - 4AR Yusuke Araki (JPN) - VAR Tatiana Guzmán (NCA) - AVAR Leodán González (URU)
Incidencias:
Gol BIH Kerim Alajbegović 29’ - Asi BIH Ivan Bašić
Gol BIH Mahmud Abunada 34’ (GEC)
Gol QAT Hassan Al-Haydos 42’ - Asi QAT Edmilson Junior
Ama QAT Ahmed Fathy 78’
Gol BIH Ermin Mahmić 80’ - Asi BIH Dennis Hadžikadunić
Ama BIH Ermin Mahmić 82’
FT 90+6’
Ali BIH 4-4-2
1, Nikola Vasilj, GK (6.9)
5, Sead Kolašinac, LB (7.3)
21, Stjepan Radeljić, CB (6.9)
18, Nikola Katić, CB (6.8) - 3, Dennis Hadžikadunić 64’ (7.1)
24, Arjan Malić, RB (6.2) - 15, Amar Memić 45’ (6.7)
19, Kerim Alajbegović, LM (8.3) - 17, Dženis Burnić 82’ (SC)
13, Ivan Bašić, CM (8.1)
14, Ivan Šunjić, CM (7.1) - 6, Benjamin Tahirović 45’ (7.0)
20, Esmir Bajraktarević, RM (7.2)
11, Edin Džeko, ST (C) (7.0) - 26, Ermin Mahmić 64’ (7.5)
10, Ermedin Demirović, ST (6.7)
DT, Sergej Barbarez
Sub BIH
12, Mladen Jurkas, GK
22, Martin Zlomislić, GK
2, Nihad Mujakić
7, Amar Dedić
8, Armin Gigović
9, Samed Baždar
16, Amir Hadžiahmetović
23, Haris Tabaković
25, Jovo Lukić
Ali QAT 4-3-3 (H)
1, Mahmud Abunada, GK (4.4)
18, Sultan Al-Brake, LB (5.7)
4, Issa Laye, CB (6.1)
16, Boualem Khoukhi, CB (5.9)
2, Pedro Miguel, RB (6.3)
12, Karim Boudiaf, CM (6.5) - 19, Almoez Ali 72’ (5.9)
20, Ahmed Fathy, CDM (6.2) - 26, Mohamed Manai 79’ (SC)
5, Jassem Gaber, CM (5.5) - 6, Abdulaziz Hatem 45’ (6.4)
10, Hassan Al-Haydos, LW (C) (7.6) - 17, Ahmed Al-Ganehi 55’ (6.5)
11, Akram Afif, ST (6.6)
8, Edmilson Junior, RW (7.2) - 7, Ahmed Alaaeldin 79’ (6.1)
DT, Julen Lopetegui
Sub QAT
21, Salah Zakaria, GK
22, Meshaal Barsham, GK
3, Lucas Mendes
9, Mohammed Muntari
13, Ayoub Al-Oui
15, Yusuf Abdurisag
24, Tahsin Jamshid
25, Al-Hashmi Al-Hussain
POS: 52, 48 - TIR: 14, 9 - TPO: 5, 3 - FAL: 9, 14 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 5, 5 - ATA: 2, 3
Kit BIH J1 C1, P2 C1 - Kit QAT J2 C1, P4 C1 - Kit ARB TorFWC26 R3 C1
JDP BIH Kerim Alajbegović ALT

Partido 53
Chequia 0 - México 3
24 jun 2026 · 19:00 UTC−6
Clima: 19 °C, Nublado
Estadio Ciudad de México, Ciudad de México, México
Asistencia: 80,824
ARB Yael Falcón (ARG) - AA1 Maximiliano Del Yesso (ARG) - AA2 Facundo Rodríguez (ARG) - 4AR Cristián Garay (CHI) - VAR Juan Lara (CHI) - AVAR Rodolpho Toski (BRA)
Incidencias:
Gol MEX Mateo Chávez 55’ - Asi MEX Luis Romo
Gol MEX Julián Quiñones 61’ - Asi MEX Jorge Sánchez
Ama MEX Edson Álvarez 64’
Gol MEX Álvaro Fidalgo 90+4’ - Asi MEX Roberto Alvarado
FT 90+7’
Ali CZE 3-4-2-1
1, Matěj Kovář, GK (5.7)
7, Ladislav Krejčí, CB (C) (5.7)
4, Robin Hranáč, CB (5.3)
3, Tomáš Holeš, CB (5.7) - 22, Tomáš Souček 64’ (5.8) - 24, Alexandr Sojka 87’ (SC)
21, David Douděra, LM (6.8)
18, Michal Sadílek, CM (6.4)
12, Lukáš Červ, CM (6.7) - 19, Tomáš Chorý 87’ (SC)
5, Vladimír Coufal, RM (5.9)
26, Denis Višinský, CAM (6.4) - 17, Lukáš Provod 56’ (6.2)
15, Pavel Šulc, CAM (6.1)
9, Adam Hložek, ST (6.6) - 10, Patrik Schick 64’ (6.0)
DT, Miroslav Koubek
Sub CZE
16, Jindřich Staněk, GK
23, Lukáš Horníček, GK
2, David Zima
6, Štěpán Chaloupek
8, Vladimír Darida
11, Jan Kuchta
13, Mojmír Chytil
20, Jaroslav Zelený
25, Hugo Sochůrek
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (6.7) - 13, Guillermo Ochoa 78’ (6.0)
20, Mateo Chávez, LB (8.3) - 23, Jesús Gallardo 78’ (6.1)
15, Israel Reyes, CB (7.2)
3, César Montes, CB (7.5)
2, Jorge Sánchez, RB (8.3)
7, Luis Romo, CM (7.5) - 18, Obed Vargas 63’ (6.4)
4, Edson Álvarez, CDM (C) (7.2)
19, Gilberto Mora, CM (6.7) - 8, Álvaro Fidalgo 72’ (7.4)
16, Julián Quiñones, LW (7.5)
22, Guillermo Martínez, ST (6.4) - 11, Santiago Giménez 63’ (6.4)
25, Roberto Alvarado, RW (8.2)
DT, Javier Aguirre
Sub MEX
12, Carlos Acevedo, GK
5, Johan Vásquez
6, Érik Lira
9, Raúl Jiménez
10, Alexis Vega
14, Armando González
17, Orbelín Pineda
21, César Huerta
24, Luis Chávez
26, Brian Gutiérrez
POS: 50, 50 - TIR: 13, 11 - TPO: 1, 5 - FAL: 9, 13 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 5, 1 - ATA: 2, 1
Kit CZE J1 C1, P2 C1 - Kit MEX J2 C2, P3 C1 - Kit ARB TorFWC26 R2 C1
JDP MEX Mateo Chávez

Partido 54
Sudáfrica 1 - Corea del Sur 0
24 jun 2026 · 19:00 UTC−6
Clima: 30 °C, Despejado
Estadio Monterrey, Monterrey, México
Asistencia: 51,243
ARB Facundo Tello (ARG) - AA1 Juan Pablo Belatti (ARG) - AA2 Gabriel Chade (ARG) - 4AR Andrés Rojas (COL) - VAR Hernán Mastrangelo (ARG) - AVAR Nicolás Gallo Barragán (COL)
Incidencias:
Gol RSA Thapelo Maseko 63’ - Asi RSA Tshepang Moremi
Ama RSA Aubrey Modiba 72’
Ama KOR Cho Gue-sung 78’
FT 90+6’
Ali RSA 4-2-3-1 (W)
1, Ronwen Williams, GK (C) (8.6)
6, Aubrey Modiba, LB (7.5)
14, Mbekezeli Mbokazi, CB (7.9)
21, Ime Okon, CB (7.2)
20, Khuliso Mudau, RB (8.1)
13, Yaya Sithole, CDM (7.5)
5, Thalente Mbatha, CDM (7.4)
7, Oswin Appollis, LM (6.7) - 8, Tshepang Moremi 62’ (7.4)
10, Relebohile Mofokeng, CAM (6.9) - 23, Jayden Adams 80’ (6.3)
12, Thapelo Maseko, RM (7.6) - 15, Iqraam Rayners 75’ (6.5)
17, Evidence Makgopa, ST (7.0)
DT, Hugo Broos
Sub RSA
16, Sipho Chaine, GK
22, Ricardo Goss, GK
2, Thabang Matuludi
3, Khulumani Ndamane
9, Lyle Foster
18, Samukele Kabini
19, Nkosinathi Sibisi
24, Olwethu Makhanya
25, Kamogelo Sebelebele
26, Bradley Cross
Ali KOR 3-4-3
1, Kim Seung-gyu, GK (6.2)
3, Lee Gi-hyuk, CB (7.5)
4, Kim Min-jae, CB (C) (6.6) - 16, Park Jin-seob 65’ (6.8)
2, Lee Han-beom, CB (6.8)
13, Lee Tae-seok, LM (6.7) - 23, Jens Castrop 45’ (6.5)
6, Hwang In-beom, CM (6.6)
8, Paik Seung-ho, CM (6.0) - 24, Kim Jin-gyu 45’ (6.5)
22, Seol Young-woo, RM (6.9)
11, Hwang Hee-chan, LW (6.2) - 7, Son Heung-min 45’ (6.4)
18, Oh Hyeon-gyu, ST (5.8) - 9, Cho Gue-sung 74’ (5.8)
19, Lee Kang-in, RW (6.4)
DT, Hong Myung-bo
Sub KOR
12, Song Bum-keun, GK
21, Jo Hyeon-woo, GK
5, Kim Tae-hyeon
10, Lee Jae-sung
14, Cho Wi-je
15, Kim Moon-hwan
17, Bae Jun-ho
20, Yang Hyun-jun
25, Eom Ji-sung
26, Lee Dong-gyeong
POS: 32, 68 - TIR: 13, 8 - TPO: 4, 3 - FAL: 7, 9 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 4, 6 - ATA: 2, 3
Kit RSA J1 C2, P1 C1 - Kit KOR J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP RSA Thapelo Maseko

Partido 55
Curazao 0 - Costa de Marfil 2
25 jun 2026 · 16:00 UTC−4
Clima: 29 °C, Nublado
Estadio Filadelfia, Filadelfia, Estados Unidos
Asistencia: 68,324
ARB Glenn Nyberg (SWE) - AA1 Mahbod Beigi (SWE) - AA2 Andreas Söderkvist (SWE) - 4AR Sandro Schärer (SUI) - VAR Carlos del Cerro Grande (ESP) - AVAR Leodán González (URU)
Incidencias:
Gol CIV Nicolas Pépé 7’ - Asi CIV Yan Diomande
Ama CIV Nicolas Pépé 34’
Gol CIV Nicolas Pépé 64’ - Asi CIV Ibrahim Sangaré
Ama CUW Juninho Bacuna 75’
Ama CUW Gervane Kastaneer 83’
FT 90+6’
Ali CUW 5-4-1
1, Eloy Room, GK (5.9)
5, Sherel Floranus, LB (7.0)
24, Deveron Fonville, CB (6.8) - 13, Tyrese Noslin 77’ (6.2)
18, Armando Obispo, CB (6.1)
3, Juriën Gaari, CB (5.5) - 19, Gervane Kastaneer 77’ (6.0)
20, Joshua Brenet, RB (5.6) - 2, Shurandy Sambo 90’ (SC)
7, Juninho Bacuna, LM (6.5)
10, Leandro Bacuna, CM (C) (7.4)
8, Livano Comenencia, CM (6.9) - 11, Jeremy Antonisse 61’ (6.7)
21, Tahith Chong, RM (6.3)
9, Jürgen Locadia, ST (5.9) - 17, Brandley Kuwas 90’ (SC)
DT, Dick Advocaat
Sub CUW
25, Tyrick Bodak, GK
26, Trevor Doornbusch, GK
4, Roshon van Eijma
6, Godfried Roemeratoe
12, Sontje Hansen
14, Kenji Gorré
15, Ar'jany Martha
16, Jearl Margaritha
22, Kevin Felida
23, Riechedly Bazoer
Ali CIV 4-3-3 (H)
1, Yahia Fofana, GK (7.6)
13, Christopher Opéri, LB (7.5)
2, Ousmane Diomande, CB (7.1)
7, Odilon Kossounou, CB (7.1)
17, Guéla Doué, RB (7.2)
8, Franck Kessié, CM (C) (7.0) - 4, Jean Michaël Seri 77’ (6.4)
18, Ibrahim Sangaré, CDM (8.2)
19, Nicolas Pépé, CM (8.9) - 12, Elye Wahi 67’ (6.2)
11, Yan Diomande, LW (7.9) - 24, Bazoumana Touré 67’ (6.5)
9, Ange-Yoan Bonny, ST (6.5) - 14, Oumar Diakité 67’ (6.2)
15, Amad Diallo, RW (7.0) - 26, Christ Inao Oulaï 45’ (7.0)
DT, Emerse Faé
Sub CIV
16, Mohamed Koné, GK
23, Alban Lafont, GK
3, Ghislain Konan
5, Wilfried Singo
6, Seko Fofana
10, Simon Adingra
20, Emmanuel Agbadou
21, Evan Ndicka
22, Evann Guessand
25, Parfait Guiagon
POS: 36, 64 - TIR: 11, 7 - TPO: 2, 3 - FAL: 11, 6 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 4, 6 - ATA: 1, 2
Kit CUW J1 C1, P2 C1 - Kit CIV J1 C1, P3 C1 - Kit ARB TorFWC26 R3 C1
JDP CIV Nicolas Pépé

Partido 56
Ecuador 2 - Alemania 1
25 jun 2026 · 16:00 UTC−4
Clima: 28 °C, Mayormente soleado
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Tori Penso (USA) - AA1 Brooke Mayo (USA) - AA2 Kathryn Nesbitt (USA) - 4AR Campbell-Kirk Kawana-Waugh (NZL) - VAR Joe Dickerson (USA) - AVAR Fu Ming (CHN)
Incidencias:
Gol GER Leroy Sané 2’ - Asi GER Florian Wirtz
Gol ECU Nilson Angulo 9’ - Asi ECU Pedro Vite
Ama ECU Piero Hincapié 43’
Ama GER Aleksandar Pavlović 44’
Ama ECU Alan Franco 50’
Gol ECU Gonzalo Plata 77’ - Asi ECU Kevin Rodríguez
Ama ECU Gonzalo Plata 89’
FT 90+7’
Ali ECU 4-4-2
1, Hernán Galíndez, GK (6.9)
3, Piero Hincapié, LB (6.4) - 7, Pervis Estupiñán 71’ (6.5)
6, Willian Pacho, CB (7.2)
4, Joel Ordóñez, CB (7.5)
21, Alan Franco, RB (6.9) - 17, Ángelo Preciado 64’ (6.4)
20, Nilson Angulo, LM (8.4) - 16, Jordy Caicedo 85’ (SC)
15, Pedro Vite, CM (8.7)
23, Moisés Caicedo, CM (C) (7.5)
9, John Yeboah, RM (7.5) - 2, Félix Torres 85’ (SC)
13, Enner Valencia, ST (6.5) - 11, Kevin Rodríguez 64’ (7.1)
19, Gonzalo Plata, ST (7.6)
DT, Sebastián Beccacece
Sub ECU
12, Moisés Ramírez, GK
22, Gonzalo Valle, GK
5, Jordy Alcívar
8, Anthony Valencia
10, Kendry Páez
14, Alan Minda
18, Denil Castillo
24, Jeremy Arévalo
25, Jackson Porozo
26, Yaimar Medina
Ali GER 4-2-3-1 (N)
1, Manuel Neuer, GK (5.8)
22, David Raum, LB (6.7)
2, Antonio Rüdiger, CB (6.3)
4, Jonathan Tah, CB (6.2)
6, Joshua Kimmich, RB (C) (6.7) - 24, Malick Thiaw 60’ (6.7)
5, Aleksandar Pavlović, CDM (5.9) - 16, Angelo Stiller 45’ (6.4)
23, Felix Nmecha, CDM (4.8) - 14, Maximilian Beier 64’ (6.0)
17, Florian Wirtz, CAM (7.8) - 13, Pascal Groß 73’ (6.6)
10, Jamal Musiala, CAM (6.4)
19, Leroy Sané, CAM (7.5)
7, Kai Havertz, ST (6.8) - 26, Deniz Undav 60’ (6.3)
DT, Julian Nagelsmann
Sub GER
12, Oliver Baumann, GK
21, Alexander Nübel, GK
3, Waldemar Anton
8, Leon Goretzka
9, Jamie Leweling
11, Nick Woltemade
20, Nadiem Amiri
25, Assan Ouédraogo
POS: 39, 61 - TIR: 7, 11 - TPO: 3, 3 - FAL: 15, 10 - AMA: 3, 1 - ROJ: 0, 0 - ESQ: 3, 2 - ATA: 2, 1
Kit ECU J1 C1, P1 C1 - Kit GER J2 C1, P4 C1 - Kit ARB TorFWC26 R3 C1
JDP ECU Nilson Angulo

Partido 57
Japón 1 - Suecia 1
25 jun 2026 · 18:00 UTC−5
Clima: 33 °C, Mayormente soleado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,137
ARB Iván Barton (SLV) - AA1 David Morán (SLV) - AA2 Antonio Pupiro (NCA) - 4AR Dahane Beida (MTN) - VAR Nicolás Gallo Barragán (COL) - AVAR Guillermo Pacheco (MEX)
Incidencias:
Ama SWE Isak Hien 32’
Gol JPN Daizen Maeda 56’ - Asi JPN Ritsu Dōan
Gol SWE Anthony Elanga 62’ - Asi SWE Viktor Gyökeres
Ama JPN Shōgo Taniguchi 77’
Ama SWE Viktor Gyökeres 84’
FT 90+7’
Ali JPN 3-4-3
1, Zion Suzuki, GK (7.4)
21, Hiroki Itō, CB (7.0)
4, Kō Itakura, CB (C) (6.5) - 3, Shōgo Taniguchi 39’ (6.3)
20, Ayumu Seko, CB (6.6) - 16, Tsuyoshi Watanabe 75’ (6.3)
13, Keito Nakamura, LM (7.2) - 5, Yūto Nagatomo 75’ (6.3)
15, Daichi Kamada, CM (7.4)
7, Ao Tanaka, CM (7.6)
2, Yukinari Sugawara, RM (7.2)
11, Daizen Maeda, LW (8.0)
18, Ayase Ueda, ST (6.1) - 19, Kōki Ogawa 66’ (5.8)
10, Ritsu Dōan, RW (7.2) - 14, Junya Itō 66’ (6.2)
DT, Hajime Moriyasu
Sub JPN
12, Keisuke Ōsako, GK
23, Tomoki Hayakawa, GK
6, Shūto Machino
9, Keisuke Gotō
17, Yuito Suzuki
22, Takehiro Tomiyasu
24, Kaishū Sano
25, Junnosuke Suzuki
26, Kento Shiogai
Ali SWE 3-4-3
1, Jacob Widell Zetterström, GK (7.1)
5, Gabriel Gudmundsson, CB (7.0) - 10, Benjamin Nygren 87’ (SC)
4, Isak Hien, CB (6.5) - 7, Lucas Bergvall 37’ (6.3)
2, Gustaf Lagerbielke, CB (7.1)
24, Elliot Stroud, LM (6.5) - 13, Ken Sema 75’ (6.2)
18, Yasin Ayari, CM (7.3)
3, Victor Lindelöf, CM (C) (6.4) - 15, Carl Starfelt 87’ (SC)
21, Alexander Bernhardsson, RM (6.5) - 8, Daniel Svensson 75’ (6.0)
9, Alexander Isak, LW (6.4)
17, Viktor Gyökeres, ST (6.7)
11, Anthony Elanga, RW (7.9)
DT, Graham Potter
Sub SWE
12, Viktor Johansson, GK
23, Kristoffer Nordfeldt, GK
6, Herman Johansson
14, Hjalmar Ekdal
16, Jesper Karlström
19, Mattias Svanberg
20, Eric Smith
22, Besfort Zeneli
25, Gustaf Nilsson
26, Taha Ali
POS: 52, 48 - TIR: 8, 11 - TPO: 3, 5 - FAL: 20, 11 - AMA: 1, 2 - ROJ: 0, 0 - ESQ: 2, 8 - ATA: 4, 2
Kit JPN J1 C1, P1 C1 - Kit SWE J1 C1, P1 C1 - Kit ARB TorFWC26 R5 C1
JDP SWE Anthony Elanga

Partido 58
Túnez 1 - Países Bajos 3
25 jun 2026 · 18:00 UTC−5
Clima: 22 °C, Lluvioso
Estadio Kansas City, Kansas City, Estados Unidos
Asistencia: 68,391
ARB Katia Itzel García (MEX) - AA1 Sandra Ramírez (MEX) - AA2 José Enrique Naranjo (ESP) - 4AR Juan Gabriel Benítez (PAR) - VAR Erick Miranda (MEX) - AVAR Mohammed Obaid Khadim (UAE)
Incidencias:
Gol NED Ellyes Skhiri 3’ (GEC)
Gol NED Brian Brobbey 7’ - Asi NED Virgil van Dijk
Gol TUN Hazem Mastouri 54’ - Asi TUN Hannibal Mejbri
Gol NED Jan Paul van Hecke 62’ - Asi NED Tijjani Reijnders
FT 90+5’
Ali TUN 5-4-1
16, Aymen Dahmen, GK (6.7)
2, Ali Abdi, LB (6.4)
21, Mohamed Amine Ben Hamida, CB (5.1) - 12, Mortadha Ben Ouanes 67’ (6.2)
17, Ellyes Skhiri, CB (C) (5.0)
3, Montassar Talbi, CB (5.4)
20, Yan Valery, RB (6.3)
10, Hannibal Mejbri, LM (7.7)
13, Rani Khedira, CM (5.8) - 15, Hadj Mahmoud 67’ (6.0)
11, Ismaël Gharbi, CM (6.6) - 19, Firas Chaouat 75’ (5.8)
25, Anis Slimane, RM (6.3) - 7, Elias Achouri 67’ (6.2)
9, Hazem Mastouri, ST (8.0) - 26, Sebastian Tounekti 90’ (SC)
DT, Hervé Renard
Sub TUN
1, Mouhib Chamakh, GK
22, Sabri Ben Hessen, GK
4, Omar Rekik
6, Dylan Bronn
8, Elias Saad
14, Khalil Ayari
18, Rayan Elloumi
24, Raed Chikhaoui
Ali NED 4-3-3 (H)
1, Bart Verbruggen, GK (6.8)
5, Nathan Aké, LB (7.6)
4, Virgil van Dijk, CB (C) (8.6)
6, Jan Paul van Hecke, CB (8.6)
22, Denzel Dumfries, RB (7.2)
14, Tijjani Reijnders, CM (8.5) - 7, Justin Kluivert 72’ (6.3)
21, Frenkie de Jong, CDM (7.2) - 20, Teun Koopmeiners 72’ (6.2)
8, Ryan Gravenberch, CM (6.7)
11, Cody Gakpo, LW (6.7) - 17, Noa Lang 84’ (SC)
19, Brian Brobbey, ST (8.0) - 10, Memphis Depay 77’ (6.2)
18, Donyell Malen, RW (7.3) - 24, Crysencio Summerville 72’ (6.4)
DT, Ronald Koeman
Sub NED
13, Robin Roefs, GK
23, Mark Flekken, GK
2, Lutsharel Geertruida
3, Marten de Roon
9, Wout Weghorst
12, Mats Wieffer
15, Micky van de Ven
16, Guus Til
25, Jorrel Hato
26, Quinten Timber
POS: 29, 71 - TIR: 10, 20 - TPO: 4, 7 - FAL: 11, 10 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 4, 6 - ATA: 4, 2
Kit TUN J2 C1, P1 C1 - Kit NED J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP NED Brian Brobbey

Partido 59
Turquía 3 - Estados Unidos 2
25 jun 2026 · 19:00 UTC−7
Clima: 20 °C, Despejado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,492
ARB Mustapha Ghorbal (ALG) - AA1 Mokrane Gourari (ALG) - AA2 Abbes Akram Zerhouni (ALG) - 4AR Omar Al-Ali (UAE) - VAR Antonio García (URU) - AVAR Mahmoud Ashour (EGY)
Incidencias:
Gol USA Auston Trusty 3’ - Asi USA Sebastian Berhalter
Gol TUR Arda Güler 10’ - Asi TUR Barış Alper Yılmaz
Ama USA Sebastian Berhalter 19’
Gol TUR Barış Alper Yılmaz 31’ - Asi TUR Orkun Kökçü
Gol USA Sebastian Berhalter 49’
Gol TUR Kaan Ayhan 90+8’ - Asi TUR Can Uzun
FT 90+8’
Ali TUR 3-4-3
23, Uğurcan Çakır, GK (7.4)
14, Abdülkerim Bardakcı, CB (7.1)
15, Ozan Kabak, CB (7.0)
2, Zeki Çelik, CB (C) (7.6) - 4, Çağlar Söyüncü 84’ (SC)
13, Eren Elmalı, LM (7.7)
6, Orkun Kökçü, CM (7.6) - 22, Kaan Ayhan 88’ (SC)
5, Salih Özcan, CM (7.6)
24, Oğuz Aydın, RM (7.9) - 18, Mert Müldür 90+1’ (SC)
11, Kenan Yıldız, LW (6.4) - 26, Can Uzun 84’ (SC)
21, Barış Alper Yılmaz, ST (8.3) - 17, İrfan Can Kahveci 90+1’ (SC)
8, Arda Güler, RW (8.4)
DT, Vincenzo Montella
Sub TUR
1, Mert Günok, GK
12, Altay Bayındır, GK
3, Merih Demiral
7, Kerem Aktürkoğlu
9, Deniz Gül
10, Hakan Çalhanoğlu
16, İsmail Yüksek
19, Yunus Akgün
20, Ferdi Kadıoğlu
25, Samet Akaydin
Ali USA 4-3-3 (H)
1, Matt Turner, GK (5.8)
6, Auston Trusty, LB (7.4)
22, Mark McKenzie, CB (5.7)
12, Miles Robinson, CB (6.2)
23, Joe Scally, RB (6.2) - 16, Alex Freeman 76’ (6.4)
7, Giovanni Reyna, CM (6.0) - 2, Sergiño Dest 76’ (6.4)
8, Weston McKennie, CDM (C) (7.2) - 17, Malik Tillman 86’ (SC)
14, Sebastian Berhalter, CM (8.9)
21, Timothy Weah, LW (5.5) - 10, Christian Pulisic 58’ (6.2)
9, Ricardo Pepi, ST (6.1)
11, Brenden Aaronson, RW (6.0) - 26, Alejandro Zendejas 76’ (5.9)
DT, Mauricio Pochettino
Sub USA
24, Matt Freese, GK
25, Chris Brady, GK
3, Chris Richards
4, Tyler Adams
5, Antonee Robinson
13, Tim Ream
18, Max Arfsten
19, Haji Wright
20, Folarin Balogun
POS: 48, 52 - TIR: 8, 18 - TPO: 4, 7 - FAL: 13, 13 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 2, 9 - ATA: 5, 0
Kit TUR J2 C1, P3 C1 - Kit USA J2 C1, P1 C1 - Kit ARB TorFWC26 R4 C1
JDP TUR Arda Güler ALT

Partido 60
Paraguay 0 - Australia 0
25 jun 2026 · 19:00 UTC−7
Clima: 20 °C, Despejado
Estadio Bahía de San Francisco, San Francisco, Estados Unidos
Asistencia: 68,827
ARB Clément Turpin (FRA) - AA1 Nicolas Danos (FRA) - AA2 Benjamin Pagès (FRA) - 4AR Oshane Nation (JAM) - VAR Jérôme Brisard (FRA) - AVAR Willy Delajod (FRA)
Incidencias:
Ama AUS Jackson Irvine 46’
Ama PAR Diego Gómez 77’
FT 90+5’
Ali PAR 5-3-2
12, Orlando Gill, GK (8.0)
26, Alexandro Maidana, LB (6.5) - 11, Maurício 45’ (6.7)
3, Omar Alderete, CB (7.2) - 13, José Canale 84’ (SC)
15, Gustavo Gómez, CB (C) (7.1)
2, Gustavo Velázquez, CB (7.0)
4, Juan José Cáceres, RB (6.7)
23, Matías Galarza, CM (8.0) - 6, Júnior Alonso 90+2’ (SC)
8, Diego Gómez, CDM (6.9) - 16, Damián Bobadilla 90+2’ (SC)
14, Andrés Cubas, CM (7.7)
19, Julio Enciso, ST (5.4)
21, Gabriel Ávalos, ST (6.2) - 18, Álex Arce 67’ (6.0)
DT, Gustavo Alfaro
Sub PAR
1, Gatito Fernández, GK
22, Gastón Olveira, GK
5, Fabián Balbuena
7, Ramón Sosa
9, Antonio Sanabria
17, Alejandro Romero Gamarra
20, Braian Ojeda
24, Gustavo Caballero
25, Isidro Pitta
Ali AUS 3-4-3
18, Patrick Beach, GK (7.9)
25, Lucas Herrington, CB (7.1)
19, Harry Souttar, CB (C) (7.1)
3, Alessandro Circati, CB (7.5)
16, Aziz Behich, LM (6.9)
13, Aiden O'Neill, CM (7.4)
22, Jackson Irvine, CM (6.7) - 24, Paul Okon-Engstler 84’ (SC)
5, Jordan Bos, RM (7.7)
8, Connor Metcalfe, LW (6.8)
17, Nestory Irankunda, ST (6.3) - 26, Tete Yengi 84’ (SC)
20, Cristian Volpato, RW (6.1) - 10, Ajdin Hrustic 58’ (6.4)
DT, Tony Popovic
Sub AUS
1, Mathew Ryan, GK
12, Paul Izzo, GK
2, Miloš Degenek
6, Jason Geria
9, Mohamed Touré
11, Awer Mabil
14, Cameron Devlin
15, Kai Trewin
21, Cameron Burgess
23, Nishan Velupillay
POS: 44, 56 - TIR: 7, 12 - TPO: 2, 5 - FAL: 9, 6 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 1, 3 - ATA: 5, 2
Kit PAR J1 C2, P2 C1 - Kit AUS J1 C1, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP AUS Aiden O'Neill

Partido 61
Noruega 1 - Francia 4
26 jun 2026 · 15:00 UTC−4
Clima: 21 °C, Llovizna
Estadio Boston, Boston, Estados Unidos
Asistencia: 64,146
ARB Michael Oliver (ENG) - AA1 Stuart Burt (ENG) - AA2 James Mainwaring (ENG) - 4AR Ma Ning (CHN) - VAR Jarred Gillett (ENG) - AVAR Bram Van Driessche (BEL)
Incidencias:
Gol FRA Ousmane Dembélé 7’ - Asi FRA Kylian Mbappé
Ama NOR Patrick Berg 10’
Gol FRA Ousmane Dembélé 20’ - Asi FRA Kylian Mbappé
Gol NOR Thelo Aasgaard 21’ - Asi NOR Andreas Schjelderup
Gol FRA Ousmane Dembélé 32’ - Asi FRA Aurélien Tchouaméni
PFa NOR Jørgen Strand Larsen 50’
Ama FRA Aurélien Tchouaméni 74’
Gol FRA Désiré Doué 90+4’ - Asi FRA Bradley Barcola
FT 90+5’
Ali NOR 4-3-3 (H)
13, Egil Selvik, GK (5.8)
15, Fredrik André Bjørkan, LB (5.9) - 16, Marcus Holmgren Pedersen 45’ (6.3)
4, Leo Østigård, CB (5.0)
25, Henrik Falchener, CB (5.4) - 24, Sondre Langås 66’ (6.0)
14, Fredrik Aursnes, RB (6.2)
19, Thelo Aasgaard, CM (7.5)
6, Patrick Berg, CDM (C) (6.3)
18, Kristian Thorstvedt, CM (6.4) - 2, Morten Thorsby 45’ (6.0)
21, Andreas Schjelderup, LW (7.4) - 23, Jens Petter Hauge 83’ (SC)
11, Jørgen Strand Larsen, ST (5.9)
22, Oscar Bobb, RW (7.4) - 20, Antonio Nusa 83’ (SC)
DT, Ståle Solbakken
Sub NOR
1, Ørjan Nyland, GK
12, Sander Tangvik, GK
3, Kristoffer Ajer
5, David Møller Wolfe
7, Alexander Sørloth
8, Sander Berge
9, Erling Haaland
10, Martin Ødegaard
17, Torbjørn Heggem
26, Julian Ryerson
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (7.9)
19, Théo Hernandez, LB (6.7)
26, Maxence Lacroix, CB (6.5)
4, Dayot Upamecano, CB (7.5) - 15, Ibrahima Konaté 76’ (6.5)
5, Jules Koundé, RB (7.6) - 2, Malo Gusto 86’ (SC)
6, Manu Koné, CDM (7.2)
8, Aurélien Tchouaméni, CDM (8.7)
20, Désiré Doué, LM (8.6)
11, Michael Olise, CAM (6.8) - 24, Rayan Cherki 65’ (6.3)
7, Ousmane Dembélé, RM (9.6) - 12, Bradley Barcola 65’ (7.5)
10, Kylian Mbappé, ST (C) (8.7) - 22, Jean-Philippe Mateta 86’ (SC)
DT, Guy Stéphan (Interino)
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
3, Lucas Digne
9, Marcus Thuram
13, N'Golo Kanté
14, Adrien Rabiot
17, William Saliba
18, Warren Zaïre-Emery
21, Lucas Hernandez
25, Maghnes Akliouche
POS: 44, 56 - TIR: 10, 18 - TPO: 4, 9 - FAL: 9, 11 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 4, 5 - ATA: 5, 3
Kit NOR J1 C2, P2 C1 - Kit FRA J2 C1, P5 C1 - Kit ARB TorFWC26 R1 C1
JDP FRA Ousmane Dembélé ALT

Partido 62
Senegal 5 - Irak 0
26 jun 2026 · 15:00 UTC−4
Clima: 20 °C, Nublado
Estadio Toronto, Toronto, Canadá
Asistencia: 43,036
ARB Anthony Taylor (ENG) - AA1 Gary Beswick (ENG) - AA2 Adam Nunn (ENG) - 4AR Khalid Al-Turais (KSA) - VAR Ivan Bebek (CRO) - AVAR Fedayi San (SUI)
Incidencias:
Gol SEN Habib Diarra 4’ - Asi SEN Abdoulaye Seck
Roj IRQ Rebin Sulaka 13’ (RD)
Ama SEN Abdoulaye Seck 18’
Gol SEN Ismaïla Sarr 56’ - Asi SEN Lamine Camara
Gol SEN Pape Gueye 59’ - Asi SEN Ismaïla Sarr
Gol SEN Pape Gueye 71’ - Asi SEN Iliman Ndiaye
Ama IRQ Amir Al-Ammari 75’
Ama SEN Pape Gueye 81’
Gol SEN Iliman Ndiaye 82’ - Asi SEN Pape Gueye
Ama IRQ Merchas Doski 90’
FT 90+6’
Ali SEN 4-3-3 (H)
23, Mory Diaw, GK (7.8)
14, Ismail Jakobs, LB (7.0)
19, Moussa Niakhaté, CB (6.9)
4, Abdoulaye Seck, CB (7.6) - 6, Pathé Ciss 58’ (6.5)
15, Krépin Diatta, RB (8.2)
8, Lamine Camara, CM (8.4) - 11, Nicolas Jackson 56’ (6.8)
5, Idrissa Gana Gueye, CDM (C) (8.2)
21, Habib Diarra, CM (7.9) - 26, Pape Gueye 56’ (9.3)
10, Sadio Mané, LW (7.3)
18, Ismaïla Sarr, ST (8.6) - 7, Assane Diao 81’ (SC)
20, Ibrahim Mbaye, RW (6.6) - 13, Iliman Ndiaye 56’ (8.5)
DT, Pape Thiaw
Sub SEN
1, Yehvann Diouf, GK
2, Mamadou Sarr
3, Kalidou Koulibaly
9, Bamba Dieng
12, Cherif Ndiaye
17, Pape Matar Sarr
22, Bara Sapoko Ndiaye
24, Antoine Mendy
25, El Hadji Malick Diouf
Ali IRQ 4-4-2
22, Ahmed Basil, GK (6.7) - 12, Jalal Hassan 45’ (5.6)
23, Merchas Doski, LB (4.8)
5, Akam Hashim, CB (3.9)
2, Rebin Sulaka, CB (4.9)
26, Frans Putros, RB (4.9)
8, Ibrahim Bayesh, LM (C) (6.7)
16, Amir Al-Ammari, CM (4.3)
14, Zidane Iqbal, CM (4.9) - 19, Kevin Yakob 67’ (6.3)
11, Ahmed Qasem, RM (5.7) - 6, Munaf Younus 16’ (6.4)
17, Ali Jasim, ST (5.9) - 15, Ahmed Maknazi 57’ (6.7)
9, Ali Al-Hamadi, ST (6.3) - 13, Ali Yousif 57’ (6.2)
DT, Graham Arnold
Sub IRQ
1, Fahad Talib, GK
3, Hussein Ali
4, Zaid Tahseen
7, Youssef Amyn
10, Mohanad Ali
18, Aymen Hussein
20, Aimar Sher
21, Marko Farji
24, Zaid Ismail
25, Mustafa Saadoon
POS: 68, 32 - TIR: 28, 6 - TPO: 12, 1 - FAL: 10, 11 - AMA: 2, 2 - ROJ: 0, 1 - ESQ: 12, 3 - ATA: 1, 7
Kit SEN J1 C1, P1 C1 - Kit IRQ J2 C1, P3 C1 - Kit ARB TorFWC26 R2 C1
JDP SEN Idrissa Gana Gueye ALT

Partido 63
Egipto 1 - Irán 1
26 jun 2026 · 20:00 UTC−7
Clima: 17 °C, Mayormente despejado
Estadio Seattle, Seattle, Estados Unidos
Asistencia: 66,925
ARB Szymon Marciniak (POL) - AA1 Tomasz Listkiewicz (POL) - AA2 Adam Kupsik (POL) - 4AR Yusuke Araki (JPN) - VAR Tomasz Kwiatkowski (POL) - AVAR Dennis Higler (NED)
Incidencias:
Gol EGY Mahmoud Saber 5’ - Asi EGY Trézéguet
PFa IRN Mehdi Taremi 11’
Gol IRN Ramin Rezaeian 14’
Ama EGY Mahmoud Saber 19’
Ama IRN Hossein Kanani 19’
Ama EGY Yasser Ibrahim 41’
Ama IRN Ali Nemati 43’
Ama IRN Saeid Ezatolahi 79’
Ama EGY Mohanad Lasheen 90+2’
Ama IRN Shoja Khalilzadeh 90+4’
FT 90+8’
Ali EGY 4-2-3-1 (W)
23, Mostafa Shobeir, GK (7.7)
13, Ahmed Fatouh, LB (7.3)
6, Mohamed Abdelmonem, CB (5.8) - 2, Yasser Ibrahim 14’ (7.1)
5, Ramy Rabia, CB (7.1)
3, Mohamed Hany, RB (8.0)
21, Mahmoud Saber, CDM (7.5) - 19, Marwan Attia 45’ (6.8)
17, Mohanad Lasheen, CDM (7.0)
7, Trézéguet, LM (7.8)
10, Mohamed Salah, CAM (C) (6.2) - 25, Zizo 57’ (6.4)
8, Emam Ashour, RM (6.0) - 22, Omar Marmoush 45’ (6.5)
11, Mostafa Zico, ST (6.1) - 9, Hamza Abdelkarim 76’ (6.0)
DT, Hossam Hassan
Sub EGY
1, Mohamed El Shenawy, GK
16, El Mahdy Soliman, GK
26, Mohamed Alaa, GK
12, Haissem Hassan
15, Karim Hafez
18, Nabil Emad
20, Ibrahim Adel
24, Tarek Alaa
Ali IRN 5-4-1
1, Alireza Beiranvand, GK (6.8)
5, Milad Mohammadi, LB (7.1)
19, Ali Nemati, CB (6.8)
4, Shoja Khalilzadeh, CB (6.9)
13, Hossein Kanani, CB (6.0) - 2, Saleh Hardani 45’ (6.6)
23, Ramin Rezaeian, RB (7.7)
8, Mohammad Mohebbi, LM (6.6) - 7, Alireza Jahanbakhsh 90+1’ (SC)
21, Mohammad Ghorbani, CM (6.9)
6, Saeid Ezatolahi, CM (7.6)
14, Saman Ghoddos, RM (6.4) - 20, Shahriyar Moghanloo 67’ (6.4)
9, Mehdi Taremi, ST (C) (7.3)
DT, Amir Ghalenoei
Sub IRN
12, Payam Niazmand, GK
22, Hossein Hosseini, GK
3, Ehsan Hajisafi
10, Mehdi Ghayedi
11, Ali Alipour
15, Roozbeh Cheshmi
16, Mehdi Torabi
17, Arya Yousefi
18, Amirhossein Hosseinzadeh
24, Dennis Dargahi
25, Danial Iri
26, Amirmohammad Razaghinia
POS: 62, 38 - TIR: 15, 13 - TPO: 3, 4 - FAL: 11, 16 - AMA: 3, 4 - ROJ: 0, 0 - ESQ: 8, 2 - ATA: 2, 2
Kit EGY J1 C2, P1 C1 - Kit IRN J1 C1, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP IRN Ramin Rezaeian ALT

Partido 64
Nueva Zelanda 1 - Bélgica 5
26 jun 2026 · 20:00 UTC−7
Clima: 16 °C, Mayormente despejado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Adham Makhadmeh (JOR) - AA1 Mohammad Al-Kalaf (JOR) - AA2 Ahmad Al-Roalle (JOR) - 4AR Kevin Ortega (PER) - VAR Juan Soto (VEN) - AVAR Erick Miranda (MEX)
Incidencias:
Gol BEL Leandro Trossard 28’
Ama NZL Marko Stamenić 46’
Gol BEL Leandro Trossard 50’ - Asi BEL Hans Vanaken
Ama NZL Elijah Just 56’
Gol BEL Kevin De Bruyne 66’
Gol NZL Elijah Just 84’
Gol BEL Romelu Lukaku 86’ - Asi BEL Nicolas Raskin
Gol BEL Alexis Saelemaekers 90+4’ - Asi BEL Romelu Lukaku
FT 90+5’
Ali NZL 4-2-3-1 (W)
1, Max Crocombe, GK (4.6)
13, Liberato Cacace, LB (6.6) - 3, Francis de Vries 79’ (6.5)
4, Tyler Bindon, CB (4.7)
16, Finn Surman, CB (3.3)
2, Tim Payne, RB (5.3) - 5, Michael Boxall 64’ (5.9)
8, Marko Stamenić, CDM (4.5)
6, Joe Bell, CDM (6.0) - 20, Callum McCowatt 64’ (6.0)
11, Elijah Just, LM (7.6)
23, Ryan Thomas, CAM (6.0) - 19, Ben Old 45’ (6.5)
10, Sarpreet Singh, RM (5.7) - 21, Jesse Randall 45’ (6.2)
9, Chris Wood, ST (C) (6.2)
DT, Darren Bazeley
Sub NZL
12, Alex Paulsen, GK
22, Michael Woud, GK
7, Logan Rogerson
14, Alex Rufer
15, Nando Pijnaker
17, Kosta Barbarouses
18, Ben Waine
24, Callan Elliot
25, Lachlan Bayliss
26, Tommy Smith
Ali BEL 4-2-3-1 (W)
1, Thibaut Courtois, GK (6.7)
5, Maxim De Cuyper, LB (7.9)
3, Arthur Theate, CB (7.4)
4, Brandon Mechele, CB (7.4)
21, Timothy Castagne, RB (7.1)
20, Hans Vanaken, CDM (8.4)
8, Youri Tielemans, CDM (C) (6.9) - 23, Nicolas Raskin 85’ (SC)
10, Leandro Trossard, LM (9.3) - 22, Alexis Saelemaekers 72’ (7.7)
7, Kevin De Bruyne, CAM (8.6) - 24, Amadou Onana 72’ (6.3)
11, Jérémy Doku, RM (7.3) - 26, Matias Fernandez-Pardo 56’ (7.0)
17, Charles De Ketelaere, ST (7.4) - 9, Romelu Lukaku 85’ (SC)
DT, Rudi Garcia
Sub BEL
12, Senne Lammens, GK
13, Mike Penders, GK
6, Axel Witsel
14, Dodi Lukébakio
15, Thomas Meunier
16, Koni De Winter
18, Joaquin Seys
19, Diego Moreira
POS: 47, 53 - TIR: 6, 35 - TPO: 2, 10 - FAL: 10, 7 - AMA: 2, 0 - ROJ: 0, 0 - ESQ: 5, 8 - ATA: 5, 1
Kit NZL J1 C1, P1 C1 - Kit BEL J1 C1, P2 C1 - Kit ARB TorFWC26 R4 C1
JDP BEL Leandro Trossard

Partido 65
Cabo Verde 0 - Arabia Saudita 0
26 jun 2026 · 19:00 UTC−5
Clima: 31 °C, Despejado · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,278
ARB François Letexier (FRA) - AA1 Cyril Mugnier (FRA) - AA2 Mehdi Rahmouni (FRA) - 4AR Abongile Tom (RSA) - VAR Marco Di Bello (ITA) - AVAR Willy Delajod (FRA)
Incidencias:
Ama KSA Saud Abdulhamid 4’
Ama CPV Wagner Pina 8’
Ama KSA Nasser Al-Dawsari 67’
Ama KSA Feras Al-Buraikan 90+3’
FT 90+5’
Ali CPV 4-3-3 (H)
1, Vozinha, GK (7.7)
8, João Paulo, LB (7.7)
3, Diney Borges, CB (7.4)
4, Pico Lopes, CB (7.4)
24, Wagner Pina, RB (7.4) - 22, Steven Moreira 90+4’ (SC)
10, Jamiro Monteiro, CM (6.0) - 15, Laros Duarte 71’ (6.9)
6, Kevin Pina, CDM (7.6)
14, Deroy Duarte, CM (7.4)
17, Willy Semedo, LW (6.5) - 26, Hélio Varela 61’ (6.3)
19, Dailon Livramento, ST (5.6) - 21, Nuno da Costa 61’ (6.8)
20, Ryan Mendes, RW (C) (6.9) - 11, Garry Rodrigues 71’ (6.5)
DT, Bubista
Sub CPV
12, Márcio Rosa, GK
23, CJ dos Santos, GK
2, Stopira
5, Logan Costa
7, Jovane Cabral
9, Gilson Benchimol
16, Yannick Semedo
25, Kelvin Pires
Ali KSA 4-4-2
21, Mohammed Al-Owais, GK (7.6)
13, Nawaf Boushal, LB (6.9) - 24, Moteb Al-Harbi 82’ (SC)
5, Hassan Al-Tambakti, CB (6.7) - 3, Ali Lajami 33’ (6.7)
4, Abdulelah Al-Amri, CB (7.3)
12, Saud Abdulhamid, RB (7.8)
10, Salem Al-Dawsari, LM (C) (6.5) - 26, Mohammed Abu Al-Shamat 65’ (6.4)
6, Nasser Al-Dawsari, CM (7.4)
15, Abdullah Al-Khaibari, CM (6.4) - 7, Musab Al-Juwayr 45’ (6.6)
20, Sultan Mandash, RM (6.6) - 19, Abdullah Al-Hamddan 65’ (5.9)
23, Mohamed Kanno, ST (6.9)
9, Feras Al-Buraikan, ST (6.5)
DT, Georgios Donis
Sub KSA
1, Nawaf Al-Aqidi, GK
22, Ahmed Al-Kassar, GK
2, Ali Majrashi
8, Aiman Yahya
11, Saleh Al-Shehri
14, Hassan Kadish
16, Ziyad Al-Johani
17, Khalid Al-Ghannam
18, Alaa Al-Hajji
25, Jehad Thakri
POS: 51, 49 - TIR: 15, 7 - TPO: 2, 3 - FAL: 10, 16 - AMA: 1, 3 - ROJ: 0, 0 - ESQ: 4, 2 - ATA: 3, 2
Kit CPV J1 C1, P1 C1 - Kit KSA J2 C1, P2 C1 - Kit ARB TorFWC26 R5 C1
JDP CPV Deroy Duarte

Partido 66
Uruguay 0 - España 1
26 jun 2026 · 18:00 UTC−6
Clima: 23 °C, Lluvioso
Estadio Guadalajara, Guadalajara, México
Asistencia: 45,065
ARB Ismail Elfath (USA) - AA1 Corey Parker (USA) - AA2 Kyle Atkins (USA) - 4AR Juan Gabriel Calderón (CRC) - VAR Tatiana Guzmán (NCA) - AVAR Armando Villarreal (USA)
Incidencias:
Gol ESP Álex Baena 42’ - Asi ESP Marcos Llorente
Ama ESP Álex Baena 46’
Ama URU Juan Manuel Sanabria 54’
Ama URU Guillermo Varela 58’
Ama URU Nicolás de la Cruz 90+3’
Roj URU Agustín Canobbio 90+4’ (RD)
FT 90+6’
Ali URU 4-3-3 (H)
23, Fernando Muslera, GK (4.5) - 1, Sergio Rochet 45’ (5.9)
25, Juan Manuel Sanabria, LB (7.0) - 18, Brian Rodríguez 70’ (6.1)
16, Mathías Olivera, CB (7.8)
3, Sebastián Cáceres, CB (6.2)
13, Guillermo Varela, RB (6.4)
8, Federico Valverde, CM (C) (6.3) - 21, Federico Viñas 56’ (6.3)
5, Manuel Ugarte, CDM (6.8) - 7, Nicolás de la Cruz 45’ (6.6)
6, Rodrigo Bentancur, CM (7.2)
20, Maximiliano Araújo, LW (6.5)
9, Darwin Núñez, ST (6.0)
14, Agustín Canobbio, RW (5.2)
DT, Marcelo Bielsa
Sub URU
12, Santiago Mele, GK
2, José María Giménez
4, Ronald Araujo
10, Giorgian de Arrascaeta
11, Facundo Pellistri
15, Emiliano Martínez
17, Matías Viña
19, Rodrigo Aguirre
22, Joaquín Piquerez
24, Santiago Bueno
26, Rodrigo Zalazar
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (7.7)
24, Marc Cucurella, LB (7.2)
14, Aymeric Laporte, CB (7.9)
22, Pau Cubarsí, CB (7.5)
5, Marcos Llorente, RB (8.3)
20, Pedri, CM (7.5) - 8, Fabián Ruiz 60’ (6.6)
16, Rodri, CDM (C) (7.2)
6, Mikel Merino, CM (6.4) - 10, Dani Olmo 60’ (6.7)
15, Álex Baena, LW (7.6) - 11, Yéremy Pino 66’ (5.8)
21, Mikel Oyarzabal, ST (6.3) - 17, Nico Williams 76’ (6.3)
19, Lamine Yamal, RW (6.9) - 7, Ferran Torres 76’ (6.6)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
4, Eric García
9, Gavi
12, Pedro Porro
18, Martín Zubimendi
25, Víctor Muñoz
26, Borja Iglesias
POS: 32, 68 - TIR: 5, 6 - TPO: 1, 1 - FAL: 14, 14 - AMA: 3, 1 - ROJ: 1, 0 - ESQ: 1, 6 - ATA: 0, 1
Kit URU J2 C1, P1 C1 - Kit ESP J2 C2, P5 C1 - Kit ARB TorFWC26 R5 C1
JDP ESP Álex Baena

Partido 67
Panamá 0 - Inglaterra 2
27 jun 2026 · 17:00 UTC−4
Clima: 22 °C, Lluvioso
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Abdulrahman Al-Jassim (QAT) - AA1 Taleb Al-Marri (QAT) - AA2 Saoud Al-Maqaleh (QAT) - 4AR Sandro Schärer (SUI) - VAR Juan Lara (CHI) - AVAR Khamis Al-Marri (QAT)
Incidencias:
Ama PAN José Fajardo 53’
Ama ENG Jarell Quansah 60’
Gol ENG Jude Bellingham 62’ - Asi ENG Bukayo Saka
Gol ENG Harry Kane 67’ - Asi ENG Jude Bellingham
Ama PAN Andrés Andrade 83’
FT 90+7’
Ali PAN 3-4-3
22, Orlando Mosquera, GK (6.8)
16, Andrés Andrade, CB (6.1)
3, José Córdoba, CB (6.5)
4, Fidel Escobar, CB (6.4)
26, Jorge Gutiérrez, LM (6.1) - 15, Eric Davis 88’ (SC)
11, Yoel Bárcenas, CM (C) (5.8) - 10, Ismael Díaz 71’ (5.8)
14, Carlos Harvey, CM (6.5) - 19, Alberto Quintero 88’ (SC)
23, Michael Amir Murillo, RM (6.6)
7, José Luis Rodríguez, LW (6.3) - 24, Azarias Londoño 71’ (5.9)
9, Tomás Rodríguez, ST (5.8) - 17, José Fajardo 45’ (5.8)
6, Cristian Martínez, RW (7.0)
DT, Thomas Christiansen
Sub PAN
1, Luis Mejía, GK
12, César Samudio, GK
2, César Blackman
5, Edgardo Fariña
8, Adalberto Carrasquilla
13, Jiovany Ramos
18, Cecilio Waterman
20, Aníbal Godoy
21, César Yanis
25, Roderick Miller
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (8.0)
3, Nico O'Reilly, LB (7.8)
6, Marc Guéhi, CB (7.8)
2, Ezri Konsa, CB (7.4)
26, Jarell Quansah, RB (7.3) - 25, Djed Spence 63’ (6.3)
10, Jude Bellingham, CDM (9.1) - 21, Eberechi Eze 71’ (6.0)
8, Elliot Anderson, CDM (8.0) - 14, Jordan Henderson 84’ (SC)
11, Marcus Rashford, LM (7.3)
17, Morgan Rogers, CAM (7.3)
7, Bukayo Saka, RM (7.5) - 20, Noni Madueke 63’ (6.8)
9, Harry Kane, ST (C) (7.8) - 19, Ollie Watkins 84’ (SC)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
4, Declan Rice
5, John Stones
12, Trevoh Chalobah
15, Dan Burn
16, Kobbie Mainoo
18, Anthony Gordon
22, Ivan Toney
POS: 35, 65 - TIR: 12, 17 - TPO: 2, 6 - FAL: 16, 13 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 3, 7 - ATA: 4, 2
Kit PAN J2 C1, P3 C1 - Kit ENG J2 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP ENG Jude Bellingham

Partido 68
Croacia 2 - Ghana 1
27 jun 2026 · 17:00 UTC−4
Clima: 23 °C, Nublado
Estadio Filadelfia, Filadelfia, Estados Unidos
Asistencia: 68,324
ARB Drew Fischer (CAN) - AA1 Micheal Barwegen (CAN) - AA2 Lyes Arfa (CAN) - 4AR Campbell-Kirk Kawana-Waugh (NZL) - VAR Guillermo Pacheco (MEX) - AVAR Rodolpho Toski (BRA)
Incidencias:
Gol CRO Petar Sučić 31’ - Asi CRO Mateo Kovačić
Ama CRO Ivan Perišić 68’
Gol GHA Derrick Luckassen 73’ - Asi GHA Ernest Nuamah
Gol CRO Nikola Vlašić 83’ - Asi CRO Luka Modrić
Ama GHA Kojo Peprah Oppong 90+4’
FT 90+7’
Ali CRO 4-2-3-1 (N)
1, Dominik Livaković, GK (6.8)
14, Ivan Perišić, LB (7.5)
3, Marin Pongračić, CB (7.3)
6, Josip Šutalo, CB (7.6)
2, Josip Stanišić, RB (6.4)
8, Mateo Kovačić, CDM (7.5) - 15, Mario Pašalić 78’ (6.3)
10, Luka Modrić, CDM (C) (8.1)
16, Martin Baturina, CAM (7.1) - 24, Marco Pašalić 88’ (SC)
17, Petar Sučić, CAM (7.9)
13, Nikola Vlašić, CAM (8.0) - 4, Joško Gvardiol 88’ (SC)
11, Ante Budimir, ST (6.1) - 20, Igor Matanović 66’ (6.7)
DT, Zlatko Dalić
Sub CRO
12, Ivor Pandur, GK
23, Dominik Kotarski, GK
5, Duje Ćaleta-Car
7, Nikola Moro
9, Andrej Kramarić
18, Kristijan Jakić
19, Toni Fruk
21, Luka Sučić
22, Luka Vušković
25, Martin Erlić
26, Petar Musa
Ali GHA 4-3-3 (H)
16, Benjamin Asare, GK (5.6)
14, Gideon Mensah, LB (6.9)
23, Derrick Luckassen, CB (7.5)
4, Jonas Adjetey, CB (6.2) - 21, Kojo Peprah Oppong 45’ (6.0)
26, Marvin Senaya, RB (6.6)
8, Kwasi Sibo, CM (5.9) - 3, Caleb Yirenkyi 85’ (SC)
5, Thomas Partey, CDM (6.0)
15, Elisha Owusu, CM (5.9) - 7, Abdul Fatawu 45’ (6.6)
22, Kamaldeen Sulemana, LW (6.2) - 24, Ernest Nuamah 71’ (7.2)
9, Jordan Ayew, ST (C) (6.0) - 10, Brandon Thomas-Asante 71’ (6.2)
11, Antoine Semenyo, RW (5.8)
DT, Carlos Queiroz
Sub GHA
1, Lawrence Ati Zigi, GK
12, Joseph Anang, GK
2, Alidu Seidu
6, Abdul Mumin
13, Christopher Bonsu Baah
17, Abdul Rahman Baba
18, Jerome Opoku
19, Iñaki Williams
20, Augustine Boakye
25, Prince Kwabena Adu
POS: 52, 48 - TIR: 8, 6 - TPO: 4, 1 - FAL: 10, 12 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 3, 2 - ATA: 0, 2
Kit CRO J1 C1, P3 C1 - Kit GHA J2 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP CRO Petar Sučić

Partido 69
Argelia 3 - Austria 3
27 jun 2026 · 21:00 UTC−5
Clima: 26 °C, Despejado
Estadio Kansas City, Kansas City, Estados Unidos
Asistencia: 69,045
ARB Ilgiz Tantashev (UZB) - AA1 Andrey Tsapenko (UZB) - AA2 Timur Gaynullin (UZB) - 4AR Katia Itzel García (MEX) - VAR Leodán González (URU) - AVAR Shaun Evans (AUS)
Incidencias:
Ama AUT Marko Arnautović 11’
Gol AUT Marko Arnautović 28’ - Asi AUT David Alaba
Gol ALG Rafik Belghali 45’
Gol AUT Marcel Sabitzer 55’ - Asi AUT Konrad Laimer
Gol ALG Riyad Mahrez 60’ - Asi ALG Houssem Aouar
Gol ALG Riyad Mahrez 90+3’ - Asi ALG Houssem Aouar
Gol AUT Saša Kalajdžić 90+6’ - Asi AUT Michael Gregoritsch
FT 90+6’
Ali ALG 4-2-3-1 (W)
16, Oussama Benbot, GK (3.8)
13, Jaouen Hadjam, LB (6.6) - 15, Rayan Aït-Nouri 71’ (6.5)
21, Ramy Bensebaini, CB (6.0)
2, Aïssa Mandi, CB (6.5)
17, Rafik Belghali, RB (7.1) - 26, Samir Chergui 71’ (6.1)
10, Farès Chaïbi, CDM (7.1)
19, Nabil Bentaleb, CDM (7.0)
8, Houssem Aouar, LM (8.4) - 25, Farès Ghedjemis 90+4’ (SC)
22, Ibrahim Maza, CAM (7.3)
7, Riyad Mahrez, RM (C) (9.1)
9, Amine Gouiri, ST (6.6) - 5, Zineddine Belaïd 71’ (6.2)
DT, Vladimir Petković
Sub ALG
1, Melvin Mastil, GK
23, Luca Zidane, GK
3, Achref Abada
4, Mohamed Amine Tougai
6, Ramiz Zerrouki
11, Anis Hadj Moussa
12, Nadhir Benbouali
14, Hicham Boudaoui
20, Adil Boulbina
24, Yacine Titraoui
Ali AUT 4-2-3-1 (N)
1, Alexander Schlager, GK (5.8)
16, Phillipp Mwene, LB (6.4) - 14, Saša Kalajdžić 90+5’ (SC)
8, David Alaba, CB (C) (7.0) - 3, Kevin Danso 62’ (6.3)
15, Philipp Lienhart, CB (5.5)
5, Stefan Posch, RB (6.1)
4, Xaver Schlager, CDM (6.1) - 10, Florian Grillitsch 45’ (6.2)
6, Nicolas Seiwald, CDM (6.1)
9, Marcel Sabitzer, CAM (8.0)
18, Romano Schmid, CAM (5.7) - 24, Paul Wanner 45’ (6.7)
20, Konrad Laimer, CAM (7.2)
7, Marko Arnautović, ST (7.1) - 11, Michael Gregoritsch 45’ (7.4)
DT, Ralf Rangnick
Sub AUT
12, Florian Wiegele, GK
13, Patrick Pentz, GK
2, David Affengruber
17, Carney Chukwuemeka
19, Dejan Ljubičić
21, Patrick Wimmer
22, Alexander Prass
23, Marco Friedl
25, Michael Svoboda
26, Alessandro Schöpf
POS: 66, 34 - TIR: 12, 10 - TPO: 5, 3 - FAL: 3, 7 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 0, 3 - ATA: 0, 2
Kit ALG J1 C1, P1 C1 - Kit AUT J1 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP ALG Riyad Mahrez ALT

Partido 70
Jordania 1 - Argentina 3
27 jun 2026 · 21:00 UTC−5
Clima: 32 °C, Nublado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,649
ARB István Kovács (ROU) - AA1 Mihai Marica (ROU) - AA2 Ferencz Tunyogi (ROU) - 4AR Dahane Beida (MTN) - VAR Bram Van Driessche (BEL) - AVAR Fedayi San (SUI)
Incidencias:
Ama JOR Mohannad Abu Taha 17’
Gol ARG Giovani Lo Celso 19’
Gol ARG Lautaro Martínez 31’ (PEN)
Gol JOR Musa Al-Tamari 55’ - Asi JOR Ehsan Haddad
Ama JOR Yazan Al-Arab 64’
Gol ARG Lionel Messi 80’
Ama JOR Mohammad Abu Zraiq 90+4’
FT 90+5’
Ali JOR 3-4-3
1, Yazeed Abulaila, GK (5.0)
4, Husam Abu Dahab, CB (6.2) - 17, Saleem Obaid 90’ (SC)
5, Yazan Al-Arab, CB (6.6)
3, Abdallah Nasib, CB (6.5)
20, Mohannad Abu Taha, LM (6.9)
8, Noor Al-Rawabdeh, CM (6.9)
21, Nizar Al-Rashdan, CM (6.5) - 6, Amer Jamous 76’ (5.9)
23, Ehsan Haddad, RM (C) (6.9)
9, Ali Olwan, LW (6.3) - 7, Mohammad Abu Zraiq 90’ (SC)
11, Odeh Al-Fakhouri, ST (6.1) - 13, Mahmoud Al-Mardi 45’ (5.8)
24, Ali Azaizeh, RW (6.8) - 10, Musa Al-Tamari 45’ (7.6)
DT, Jamal Sellami
Sub JOR
12, Nour Bani Ateyah, GK
22, Abdallah Al-Fakhori, GK
2, Mohammad Abu Hasheesh
14, Raja'ei Ayed
15, Ibrahim Sa'deh
16, Mo Abu Al-Nadi
18, Mohammad Abu Ghoush
19, Sa'ed Al-Rosan
25, Mohammad Al-Daoud
26, Anas Badawi
Ali ARG 4-3-3 (H)
23, Emiliano Martínez, GK (6.3)
3, Nicolás Tagliafico, LB (6.9)
2, Marcos Senesi, CB (7.3)
19, Nicolás Otamendi, CB (C) (7.4)
14, Exequiel Palacios, RB (7.6)
11, Giovani Lo Celso, CM (7.7) - 16, Thiago Almada 60’ (6.4)
5, Leandro Paredes, CDM (6.9)
18, Nico Paz, CM (7.1) - 20, Alexis Mac Allister 60’ (6.9)
9, Julián Alvarez, LW (6.5) - 21, José Manuel López 82’ (SC)
22, Lautaro Martínez, ST (8.2) - 10, Lionel Messi 60’ (7.7)
17, Giuliano Simeone, RW (6.6) - 8, Valentín Barco 71’ (6.6)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
4, Gonzalo Montiel
6, Lisandro Martínez
7, Rodrigo De Paul
13, Cristian Romero
15, Nicolás González
24, Enzo Fernández
25, Facundo Medina
26, Nahuel Molina
POS: 27, 73 - TIR: 5, 13 - TPO: 1, 4 - FAL: 13, 7 - AMA: 3, 0 - ROJ: 0, 0 - ESQ: 2, 6 - ATA: 1, 0
Kit JOR J1 C1, P1 C1 - Kit ARG J2 C1, P4 C1 - Kit ARB TorFWC26 R5 C1
JDP ARG Giovani Lo Celso

Partido 71
Colombia 0 - Portugal 0
27 jun 2026 · 19:30 UTC−4
Clima: 30 °C, Despejado
Estadio Miami, Miami, Estados Unidos
Asistencia: 64,478
ARB Alireza Faghani (AUS) - AA1 George Lakrindis (AUS) - AA2 Andrew Lindsay (AUS) - 4AR Saíd Martínez (HON) - VAR Jérôme Brisard (FRA) - AVAR Hernán Mastrangelo (ARG)
Incidencias:
Ama COL Gustavo Puerta 86’
FT 90+6’
Ali COL 4-3-3 (H)
12, Camilo Vargas, GK (7.8)
22, Deiver Machado, LB (7.2)
3, Jhon Lucumí, CB (7.0)
23, Davinson Sánchez, CB (7.2)
4, Santiago Arias, RB (7.9) - 2, Daniel Muñoz 87’ (SC)
14, Gustavo Puerta, CM (7.0)
16, Jefferson Lerma, CDM (6.4) - 6, Richard Ríos 60’ (6.2)
11, Jhon Arias, CM (7.9) - 5, Kevin Castaño 76’ (6.1)
7, Luis Díaz, LW (6.5)
9, Jhon Córdoba, ST (6.1) - 25, Luis Suárez 60’ (5.9)
10, James Rodríguez, RW (C) (7.9) - 20, Juan Fernando Quintero 76’ (6.1)
DT, Néstor Lorenzo
Sub COL
1, David Ospina, GK
24, Álvaro Montero, GK
8, Jorge Carrascal
13, Yerry Mina
15, Juan Portilla
17, Johan Mojica
18, Willer Ditta
19, Cucho Hernández
21, Jaminton Campaz
26, Andrés Gómez
Ali POR 4-2-3-1 (W)
1, Diogo Costa, GK (8.2)
25, Nuno Mendes, LB (7.0) - 6, Matheus Nunes 90+2’ (SC)
13, Renato Veiga, CB (7.4)
3, Rúben Dias, CB (7.4)
20, João Cancelo, RB (6.5) - 5, Diogo Dalot 45’ (6.9)
23, Vitinha, CDM (7.6) - 24, Samú Costa 70’ (6.5)
21, Rúben Neves, CDM (6.5) - 15, João Neves 45’ (6.2)
11, João Félix, LM (6.5) - 17, Rafael Leão 70’ (6.7)
8, Bruno Fernandes, CAM (7.1)
18, Pedro Neto, RM (6.6)
7, Cristiano Ronaldo, ST (C) (6.3)
DT, Roberto Martínez
Sub POR
12, José Sá, GK
22, Rui Silva, GK
2, Nélson Semedo
4, Tomás Araújo
9, Gonçalo Ramos
10, Bernardo Silva
14, Gonçalo Inácio
16, Francisco Trincão
19, Gonçalo Guedes
26, Francisco Conceição
POS: 54, 46 - TIR: 24, 13 - TPO: 6, 2 - FAL: 12, 6 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 5, 2 - ATA: 2, 6
Kit COL J1 C1, P1 C1 - Kit POR J2 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP POR Diogo Costa

Partido 72
RD Congo 3 - Uzbekistán 1
27 jun 2026 · 19:30 UTC−4
Clima: 30 °C, Nublado · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 68,239
ARB Felix Zwayer (GER) - AA1 Robert Kempter (GER) - AA2 Christian Dietz (GER) - 4AR Alejandro Hernández Hernández (ESP) - VAR Bastian Dankert (GER) - AVAR Dennis Higler (NED)
Incidencias:
Gol UZB Eldor Shomurodov 10’ - Asi UZB Akmal Mozgovoy
Ama COD Noah Sadiki 21’
Ama UZB Abdukodir Khusanov 43’
Ama COD Nathanaël Mbuku 45+4’
Ama UZB Sherzod Nasrullaev 47’
Ama COD Samuel Moutoussamy 62’
Gol COD Yoane Wissa 68’ (PEN)
Gol COD Fiston Mayele 78’
Gol COD Yoane Wissa 90+1’ - Asi COD Meschak Elia
FT 90+8’
Ali COD 4-4-2
1, Lionel Mpasi, GK (6.1)
26, Arthur Masuaku, LB (7.9) - 12, Joris Kayembe 83’ (SC)
4, Axel Tuanzebe, CB (7.5)
22, Chancel Mbemba, CB (C) (7.2)
2, Aaron Wan-Bissaka, RB (7.9)
7, Nathanaël Mbuku, LM (7.5) - 13, Meschak Elia 72’ (7.5)
14, Noah Sadiki, CM (7.8)
8, Samuel Moutoussamy, CM (7.5) - 6, Ngal'ayel Mukau 72’ (6.1)
9, Brian Cipenga, RM (6.9) - 10, Théo Bongonda 72’ (6.2)
17, Cédric Bakambu, ST (6.2) - 19, Fiston Mayele 51’ (7.2)
20, Yoane Wissa, ST (8.9)
DT, Sébastien Desabre
Sub COD
16, Timothy Fayulu, GK
21, Matthieu Epolo, GK
3, Steve Kapuadi
5, Dylan Batubinsika
11, Gaël Kakuta
15, Aaron Tshibola
18, Charles Pickel
23, Simon Banza
24, Gédéon Kalulu
25, Edo Kayembe
Ali UZB 3-4-3
12, Abduvohid Nematov, GK (5.7)
26, Jakhongir Urozov, CB (6.4) - 21, Igor Sergeev 82’ (SC)
2, Abdukodir Khusanov, CB (6.3)
5, Rustam Ashurmatov, CB (7.2)
13, Sherzod Nasrullaev, LM (7.0)
6, Akmal Mozgovoy, CM (7.5) - 8, Jamshid Iskanderov 82’ (SC)
7, Otabek Shukurov, CM (6.4) - 9, Odiljon Xamrobekov 58’ (6.2)
3, Khojiakbar Alijonov, RM (7.1)
22, Abbosbek Fayzullaev, LW (6.4) - 11, Oston Urunov 73’ (6.0)
14, Eldor Shomurodov, ST (C) (7.3)
17, Dostonbek Khamdamov, RW (6.4) - 19, Azizjon Ganiev 58’ (6.7)
DT, Fabio Cannavaro
Sub UZB
1, Utkir Yusupov, GK
16, Botirali Ergashev, GK
4, Farrukh Sayfiev
10, Ruslanbek Jiyanov
15, Umar Eshmurodov
18, Abdulla Abdullaev
20, Azizbek Amonov
23, Sherzod Esanov
24, Behruzjon Karimov
25, Avazbek Ulmasaliyev
POS: 58, 42 - TIR: 19, 3 - TPO: 4, 1 - FAL: 6, 16 - AMA: 3, 2 - ROJ: 0, 0 - ESQ: 2, 4 - ATA: 0, 1
Kit COD J3 C1, P3 C1 - Kit UZB J1 C1, P3 C1 - Kit ARB TorFWC26 R2 C1
JDP COD Yoane Wissa ALT

Partido 73
Sudáfrica 0 - Canadá 1
28 jun 2026 · 12:00 UTC−7
Clima: 23 °C, Nublado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 69,237
ARB João Pinheiro (POR) - AA1 Bruno Jesus (POR) - AA2 Luciano Maia (POR) - 4AR Omar Al-Ali (UAE) - VAR Carlos del Cerro Grande (ESP) - AVAR Rodolpho Toski (BRA)
Incidencias:
Ama CAN Nathan Saliba 54’
Ama CAN Niko Sigur 67’
Gol CAN Stephen Eustáquio 90+2’
FT 90+6’
Ali RSA 4-2-3-1 (W)
1, Ronwen Williams, GK (C) (7.3)
6, Aubrey Modiba, LB (7.7)
14, Mbekezeli Mbokazi, CB (6.9)
21, Ime Okon, CB (7.5)
20, Khuliso Mudau, RB (7.7)
13, Yaya Sithole, CDM (7.6)
4, Teboho Mokoena, CDM (6.6)
7, Oswin Appollis, LM (6.0)
10, Relebohile Mofokeng, CAM (6.3) - 5, Thalente Mbatha 45’ (6.2)
12, Thapelo Maseko, RM (6.6) - 8, Tshepang Moremi 86’ (SC)
17, Evidence Makgopa, ST (6.0) - 15, Iqraam Rayners 86’ (SC)
DT, Hugo Broos
Sub RSA
16, Sipho Chaine, GK
22, Ricardo Goss, GK
2, Thabang Matuludi
3, Khulumani Ndamane
9, Lyle Foster
18, Samukele Kabini
19, Nkosinathi Sibisi
23, Jayden Adams
24, Olwethu Makhanya
25, Kamogelo Sebelebele
26, Bradley Cross
Ali CAN 4-4-2
16, Maxime Crépeau, GK (7.7)
22, Richie Laryea, LB (7.6)
13, Derek Cornelius, CB (7.5)
15, Moïse Bombito, CB (6.8) - 4, Luc de Fougerolles 59’ (7.1)
2, Alistair Johnston, RB (7.3)
11, Liam Millar, LM (6.5) - 14, Jacob Shaffelburg 70’ (6.2)
7, Stephen Eustáquio, CM (C) (8.7)
25, Nathan Saliba, CM (7.4) - 23, Niko Sigur 59’ (6.4)
17, Tajon Buchanan, RM (6.6) - 19, Alphonso Davies 75’ (6.4)
10, Jonathan David, ST (6.2)
12, Tani Oluwaseyi, ST (6.9) - 24, Promise David 70’ (6.5)
DT, Jesse Marsch
Sub CAN
1, Dayne St. Clair, GK
18, Owen Goodman, GK
3, Alfie Jones
5, Joel Waterman
6, Mathieu Choinière
9, Cyle Larin
20, Ali Ahmed
21, Jonathan Osorio
26, Jayden Nelson
POS: 58, 42 - TIR: 6, 12 - TPO: 1, 7 - FAL: 10, 16 - AMA: 0, 2 - ROJ: 0, 0 - ESQ: 1, 4 - ATA: 5, 1
Kit RSA J1 C1, P2 C1 - Kit CAN J3 C1, P1 C1 - Kit ARB TorFWC26 R4 C1
JDP CAN Stephen Eustáquio

Partido 74
Alemania 1 - Paraguay 1
29 jun 2026 · 16:30 UTC−4
Clima: 27 °C, Soleado
Estadio Boston, Boston, Estados Unidos
Asistencia: 63,945
ARB Jalal Jayed (MAR) - AA1 Zakaria Brinsi (MAR) - AA2 Mostafa Akarkad (MAR) - 4AR Ma Ning (CHN) - VAR Tatiana Guzmán (NCA) - AVAR Hamza El Fariq (MAR)
Incidencias:
Gol PAR Julio Enciso 42’ - Asi PAR Matías Galarza
Gol GER Kai Havertz 54’ - Asi GER Florian Wirtz
Ama PAR Andrés Cubas 65’
Ama PAR Gustavo Alfaro 105’
Ama GER Julian Nagelsmann 105+1’
Ama GER Kai Havertz 106’
Ama GER Jamal Musiala 115’
Ama PAR Matías Galarza 117’
FT 120+2’
Penales: 3-4
GER Kai Havertz Falla, PAR Maurício Gol, GER Joshua Kimmich Gol, PAR Gustavo Gómez Gol, GER Jamal Musiala Gol, PAR Matías Galarza Gol, GER Nick Woltemade Falla, PAR Antonio Sanabria Falla, GER Nadiem Amiri Gol, PAR Fabián Balbuena Falla, GER Jonathan Tah Falla, PAR José Canale Gol
Ali GER 4-2-3-1 (N)
1, Manuel Neuer, GK (7.2)
18, Nathaniel Brown, LB (7.4)
2, Antonio Rüdiger, CB (7.8) - 24, Malick Thiaw 110’ (6.1)
4, Jonathan Tah, CB (7.4)
6, Joshua Kimmich, RB (C) (7.9)
5, Aleksandar Pavlović, CDM (6.5) - 3, Waldemar Anton 79’ (6.7)
23, Felix Nmecha, CDM (6.3) - 8, Leon Goretzka 45’ (6.2)
17, Florian Wirtz, CAM (8.4) - 20, Nadiem Amiri 110’ (6.1)
7, Kai Havertz, CAM (7.8)
19, Leroy Sané, CAM (6.3) - 11, Nick Woltemade 88’ (6.5)
26, Deniz Undav, ST (6.0) - 10, Jamal Musiala 63’ (6.5)
DT, Julian Nagelsmann
Sub GER
12, Oliver Baumann, GK
21, Alexander Nübel, GK
9, Jamie Leweling
13, Pascal Groß
14, Maximilian Beier
16, Angelo Stiller
22, David Raum
25, Assan Ouédraogo
Ali PAR 4-4-2
12, Orlando Gill, GK (8.7)
6, Júnior Alonso, LB (6.8) - 5, Fabián Balbuena 120+2’ (SC)
13, José Canale, CB (7.9)
15, Gustavo Gómez, CB (C) (6.3)
4, Juan José Cáceres, RB (7.0) - 20, Braian Ojeda 99’ (6.2)
23, Matías Galarza, LM (7.8)
14, Andrés Cubas, CM (7.2)
16, Damián Bobadilla, CM (7.2) - 9, Antonio Sanabria 99’ (6.3)
10, Miguel Almirón, RM (7.1) - 2, Gustavo Velázquez 91’ (6.3)
19, Julio Enciso, ST (7.5) - 11, Maurício 57’ (7.3)
21, Gabriel Ávalos, ST (6.5) - 24, Gustavo Caballero 55’ (6.7)
DT, Gustavo Alfaro
Sub PAR
1, Gatito Fernández, GK
22, Gastón Olveira, GK
3, Omar Alderete
7, Ramón Sosa
17, Alejandro Romero Gamarra
18, Álex Arce
25, Isidro Pitta
26, Alexandro Maidana
POS: 76, 24 - TIR: 21, 7 - TPO: 6, 3 - FAL: 18, 12 - AMA: 4, 4 - ROJ: 0, 0 - ESQ: 16, 6 - ATA: 2, 5
Kit GER J1 C2, P3 C1 - Kit PAR J2 C1, P3 C1 - Kit ARB TorFWC26 R5 C1
JDP PAR Orlando Gill

Partido 75
Países Bajos 1 - Marruecos 1
29 jun 2026 · 19:00 UTC−6
Clima: 30 °C, Mayormente despejado
Estadio Monterrey, Monterrey, México
Asistencia: 51,243
ARB Wilton Sampaio (BRA) - AA1 Bruno Pires (BRA) - AA2 Bruno Boschilia (BRA) - 4AR Cristián Garay (CHI) - VAR Nicolás Gallo Barragán (COL) - AVAR Leodán González (URU)
Incidencias:
Ama MAR Issa Diop 47’
Gol NED Cody Gakpo 72’ - Asi NED Crysencio Summerville
Gol MAR Issa Diop 90+1’ - Asi MAR Chemsdine Talbi
FT 90+7’, 120+1’
Penales: 2-3
NED Teun Koopmeiners Gol, MAR Neil El Aynaoui Falla, NED Justin Kluivert Falla, MAR Soufiane Rahimi Gol, NED Wout Weghorst Gol, MAR Chemsdine Talbi Gol, NED Quinten Timber Falla, MAR Achraf Hakimi Falla, NED Crysencio Summerville Falla, MAR Ismael Saibari Gol
Ali NED 3-4-3
1, Bart Verbruggen, GK (7.9)
5, Nathan Aké, CB (6.7) - 20, Teun Koopmeiners 71’ (6.5)
4, Virgil van Dijk, CB (C) (7.1)
6, Jan Paul van Hecke, CB (7.2)
15, Micky van de Ven, LM (6.5) - 25, Jorrel Hato 86’ (6.3)
21, Frenkie de Jong, CM (7.1) - 3, Marten de Roon 110’ (6.0)
8, Ryan Gravenberch, CM (6.5) - 26, Quinten Timber 86’ (6.9)
22, Denzel Dumfries, RM (6.2)
11, Cody Gakpo, LW (7.2) - 7, Justin Kluivert 113’ (SC)
19, Brian Brobbey, ST (6.4) - 9, Wout Weghorst 71’ (6.3)
24, Crysencio Summerville, RW (7.6)
DT, Ronald Koeman
Sub NED
13, Robin Roefs, GK
23, Mark Flekken, GK
2, Lutsharel Geertruida
10, Memphis Depay
12, Mats Wieffer
14, Tijjani Reijnders
16, Guus Til
17, Noa Lang
18, Donyell Malen
Ali MAR 4-2-3-1 (W)
1, Yassine Bounou, GK (6.6)
3, Noussair Mazraoui, LB (7.9)
18, Chadi Riad, CB (6.5) - 26, Anass Salah-Eddine 75’ (7.0)
14, Issa Diop, CB (7.9)
2, Achraf Hakimi, RB (C) (8.0)
24, Neil El Aynaoui, CDM (7.6)
6, Ayyoub Bouaddi, CDM (7.1) - 15, Samir El Mourabet 79’ (6.6)
23, Bilal El Khannouss, LM (6.6) - 7, Chemsdine Talbi 86’ (7.3)
8, Azzedine Ounahi, CAM (7.5) - 9, Soufiane Rahimi 86’ (6.3)
10, Brahim Díaz, RM (6.7) - 16, Gessime Yassine 79’ (7.1)
11, Ismael Saibari, ST (6.4)
DT, Mohamed Ouahbi
Sub MAR
12, Munir El Kajoui, GK
22, Ahmed Reda Tagnaouti, GK
4, Sofyan Amrabat
5, Marwane Saâdane
13, Zakaria El Ouahdi
17, Amine Sbaï
19, Youssef Belammari
20, Ayoub El Kaabi
21, Ayoube Amaimouni
25, Redouane Halhal
POS: 31, 69 - TIR: 6, 11 - TPO: 2, 5 - FAL: 18, 15 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 5, 8 - ATA: 4, 1
Kit NED J1 C2, P2 C1 - Kit MAR J2 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP MAR Issa Diop ALT

Partido 76
Brasil 2 - Japón 1
29 jun 2026 · 12:00 UTC−5
Clima: 33 °C, Soleado · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,777
ARB Maurizio Mariani (ITA) - AA1 Daniele Bindoni (ITA) - AA2 Alberto Tegoni (ITA) - 4AR Sandro Schärer (SUI) - VAR Marco Di Bello (ITA) - AVAR Ivan Bebek (CRO)
Incidencias:
Ama JPN Kaishū Sano 12’
Ama BRA Casemiro 14’
Gol JPN Kaishū Sano 29’
Ama JPN Daichi Kamada 45’
Ama BRA Danilo Luiz 48’
Gol BRA Casemiro 56’ - Asi BRA Gabriel Magalhães
Ama JPN Junnosuke Suzuki 84’
Gol BRA Gabriel Martinelli 90+5’ - Asi BRA Bruno Guimarães
FT 90+10’
Ali BRA 4-3-3 (H)
1, Alisson, GK (6.5)
16, Douglas Santos, LB (7.9)
3, Gabriel Magalhães, CB (8.4)
4, Marquinhos, CB (C) (7.7)
13, Danilo Luiz, RB (6.3)
20, Lucas Paquetá, CM (7.1) - 19, Endrick 45’ (6.0)
5, Casemiro, CDM (8.4) - 17, Fabinho 90+1’ (SC)
8, Bruno Guimarães, CM (8.4) - 18, Danilo Santos 90+7’ (SC)
7, Vinícius Júnior, LW (7.6)
9, Matheus Cunha, ST (6.5) - 22, Gabriel Martinelli 66’ (7.4)
26, Rayan, RW (7.7)
DT, Carlo Ancelotti
Sub BRA
12, Weverton, GK
23, Ederson, GK
2, Éderson Silva
6, Alex Sandro
10, Neymar
14, Bremer
15, Léo Pereira
21, Luiz Henrique
24, Roger Ibañez
25, Igor Thiago
Ali JPN 3-4-3
1, Zion Suzuki, GK (7.0)
21, Hiroki Itō, CB (5.6)
3, Shōgo Taniguchi, CB (6.4)
22, Takehiro Tomiyasu, CB (7.0)
13, Keito Nakamura, LM (6.1) - 25, Junnosuke Suzuki 66’ (5.8)
15, Daichi Kamada, CM (6.3) - 7, Ao Tanaka 78’ (5.4)
24, Kaishū Sano, CM (7.5)
10, Ritsu Dōan, RM (C) (6.1) - 2, Yukinari Sugawara 66’ (6.5)
11, Daizen Maeda, LW (6.9) - 19, Kōki Ogawa 90+7’ (SC)
18, Ayase Ueda, ST (5.9)
14, Junya Itō, RW (6.5) - 6, Shūto Machino 78’ (5.9)
DT, Hajime Moriyasu
Sub JPN
12, Keisuke Ōsako, GK
23, Tomoki Hayakawa, GK
4, Kō Itakura
5, Yūto Nagatomo
8, Takefusa Kubo
9, Keisuke Gotō
16, Tsuyoshi Watanabe
17, Yuito Suzuki
20, Ayumu Seko
26, Kento Shiogai
POS: 68, 32 - TIR: 19, 5 - TPO: 7, 2 - FAL: 4, 13 - AMA: 2, 3 - ROJ: 0, 0 - ESQ: 6, 2 - ATA: 1, 4
Kit BRA J1 C1, P1 C1 - Kit JPN J2 C2, P4 C1 - Kit ARB TorFWC26 R5 C1
JDP BRA Casemiro

Partido 77
Francia 3 - Suecia 0
30 jun 2026 · 17:00 UTC−4
Clima: 33 °C, Nublado
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Danny Makkelie (NED) - AA1 Hessel Steegstra (NED) - AA2 Jan de Vries (NED) - 4AR Tori Penso (USA) - VAR Dennis Higler (NED) - AVAR Bram Van Driessche (BEL)
Incidencias:
Gol FRA Kylian Mbappé 45’ - Asi FRA Ousmane Dembélé
Gol FRA Bradley Barcola 53’ - Asi FRA Michael Olise
Gol FRA Kylian Mbappé 74’ - Asi FRA Michael Olise
FT 90+4’
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (8.2)
3, Lucas Digne, LB (7.4) - 19, Théo Hernandez 78’ (6.5)
17, William Saliba, CB (7.5)
4, Dayot Upamecano, CB (7.1)
5, Jules Koundé, RB (7.5) - 2, Malo Gusto 75’ (6.3)
14, Adrien Rabiot, CDM (7.7)
8, Aurélien Tchouaméni, CDM (8.0)
12, Bradley Barcola, LM (8.1)
11, Michael Olise, CAM (9.3) - 24, Rayan Cherki 85’ (SC)
7, Ousmane Dembélé, RM (8.2) - 20, Désiré Doué 75’ (6.4)
10, Kylian Mbappé, ST (C) (9.4) - 22, Jean-Philippe Mateta 85’ (SC)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
6, Manu Koné
9, Marcus Thuram
13, N'Golo Kanté
15, Ibrahima Konaté
18, Warren Zaïre-Emery
21, Lucas Hernandez
25, Maghnes Akliouche
26, Maxence Lacroix
Ali SWE 4-4-2
1, Jacob Widell Zetterström, GK (7.6)
5, Gabriel Gudmundsson, LB (5.7)
3, Victor Lindelöf, CB (C) (5.7)
2, Gustaf Lagerbielke, CB (6.0)
8, Daniel Svensson, RB (5.4) - 19, Mattias Svanberg 82’ (SC)
24, Elliot Stroud, LM (6.6) - 26, Taha Ali 66’ (5.9)
18, Yasin Ayari, CM (6.4) - 10, Benjamin Nygren 82’ (SC)
7, Lucas Bergvall, CM (6.6) - 22, Besfort Zeneli 66’ (6.2)
11, Anthony Elanga, RM (6.4)
9, Alexander Isak, ST (6.2) - 25, Gustaf Nilsson 89’ (SC)
17, Viktor Gyökeres, ST (6.6)
DT, Graham Potter
Sub SWE
12, Viktor Johansson, GK
23, Kristoffer Nordfeldt, GK
6, Herman Johansson
13, Ken Sema
14, Hjalmar Ekdal
15, Carl Starfelt
16, Jesper Karlström
20, Eric Smith
21, Alexander Bernhardsson
POS: 60, 40 - TIR: 25, 7 - TPO: 12, 3 - FAL: 14, 10 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 9, 1 - ATA: 3, 9
Kit FRA J1 C1, P3 C1 - Kit SWE J1 C1, P2 C1 - Kit ARB TorFWC26 R5 C1
JDP FRA Kylian Mbappé ALT

Partido 78
Costa de Marfil 1 - Noruega 2
30 jun 2026 · 12:00 UTC−5
Clima: 33 °C, Soleado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 69,665
ARB Jesús Valenzuela (VEN) - AA1 Jorge Urrego (VEN) - AA2 Tulio Moreno (VEN) - 4AR Juan Gabriel Benítez (PAR) - VAR Juan Lara (CHI) - AVAR Juan Soto (VEN)
Incidencias:
Gol NOR Antonio Nusa 39’ - Asi NOR Martin Ødegaard
Ama NOR Antonio Nusa 45+1’
Gol CIV Amad Diallo 74’ - Asi CIV Nicolas Pépé
Gol NOR Erling Haaland 86’ - Asi NOR Patrick Berg
FT 90+7’
Ali CIV 4-3-3 (H)
1, Yahia Fofana, GK (6.2)
3, Ghislain Konan, LB (6.7) - 24, Bazoumana Touré 90+3’ (SC)
20, Emmanuel Agbadou, CB (6.9)
7, Odilon Kossounou, CB (7.1)
17, Guéla Doué, RB (6.8)
26, Christ Inao Oulaï, CM (6.6) - 15, Amad Diallo 60’ (8.0)
18, Ibrahim Sangaré, CDM (6.2)
8, Franck Kessié, CM (C) (6.7)
11, Yan Diomande, LW (6.9) - 22, Evann Guessand 90+3’ (SC)
9, Ange-Yoan Bonny, ST (5.7) - 12, Elye Wahi 60’ (6.0)
19, Nicolas Pépé, RW (7.0) - 14, Oumar Diakité 87’ (SC)
DT, Emerse Faé
Sub CIV
16, Mohamed Koné, GK
23, Alban Lafont, GK
2, Ousmane Diomande
4, Jean Michaël Seri
5, Wilfried Singo
6, Seko Fofana
10, Simon Adingra
13, Christopher Opéri
21, Evan Ndicka
25, Parfait Guiagon
Ali NOR 4-3-3 (A)
1, Ørjan Nyland, GK (7.6)
5, David Møller Wolfe, LB (6.6)
17, Torbjørn Heggem, CB (7.2)
3, Kristoffer Ajer, CB (7.9)
16, Marcus Holmgren Pedersen, RB (6.5) - 14, Fredrik Aursnes 83’ (SC)
6, Patrick Berg, CM (8.1)
10, Martin Ødegaard, CAM (C) (7.8)
8, Sander Berge, CM (7.1)
20, Antonio Nusa, LW (7.8) - 21, Andreas Schjelderup 71’ (6.6)
9, Erling Haaland, ST (7.8)
7, Alexander Sørloth, RW (6.4) - 22, Oscar Bobb 71’ (6.0)
DT, Ståle Solbakken
Sub NOR
12, Sander Tangvik, GK
13, Egil Selvik, GK
2, Morten Thorsby
4, Leo Østigård
11, Jørgen Strand Larsen
15, Fredrik André Bjørkan
18, Kristian Thorstvedt
19, Thelo Aasgaard
23, Jens Petter Hauge
24, Sondre Langås
25, Henrik Falchener
26, Julian Ryerson
POS: 45, 55 - TIR: 14, 9 - TPO: 5, 4 - FAL: 6, 7 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 14, 3 - ATA: 1, 4
Kit CIV J1 C1, P4 C1 - Kit NOR J3 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP NOR Antonio Nusa

Partido 79
México 2 - Ecuador 0
30 jun 2026 · 19:00 UTC−6 → 20:00 (Retraso: tormenta eléctrica)
Clima: 15 °C, Lluvioso
Estadio Ciudad de México, Ciudad de México, México
Asistencia: 80,824
ARB Slavko Vinčić (SVN) - AA1 Tomaž Klančnik (SVN) - AA2 Andraž Kovačič (SVN) - 4AR Mustapha Ghorbal (ALG) - VAR Bastian Dankert (GER) - AVAR Willy Delajod (FRA)
Incidencias:
Gol MEX Julián Quiñones 22’ - Asi MEX Roberto Alvarado
Gol MEX Raúl Jiménez 31’ - Asi MEX Julián Quiñones
Ama ECU Alan Franco 45+1’
Ama ECU Kendry Páez 90+3’
Roj ECU Piero Hincapié 90+5’ (RD)
Ama ECU Moisés Caicedo 90+9’
FT 90+9’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (8.2)
23, Jesús Gallardo, LB (6.8)
5, Johan Vásquez, CB (7.6)
3, César Montes, CB (C) (7.6)
2, Jorge Sánchez, RB (7.5)
7, Luis Romo, CM (7.1) - 18, Obed Vargas 73’ (6.1)
6, Érik Lira, CDM (7.2)
19, Gilberto Mora, CM (7.6) - 26, Brian Gutiérrez 59’ (6.3)
16, Julián Quiñones, LW (8.6) - 17, Orbelín Pineda 80’ (6.2)
9, Raúl Jiménez, ST (7.9) - 11, Santiago Giménez 73’ (5.8)
25, Roberto Alvarado, RW (8.0) - 15, Israel Reyes 80’ (6.3)
DT, Javier Aguirre
Sub MEX
12, Carlos Acevedo, GK
13, Guillermo Ochoa, GK
4, Edson Álvarez
8, Álvaro Fidalgo
10, Alexis Vega
14, Armando González
20, Mateo Chávez
21, César Huerta
22, Guillermo Martínez
24, Luis Chávez
Ali ECU 4-4-2
1, Hernán Galíndez, GK (5.4)
3, Piero Hincapié, LB (5.7)
6, Willian Pacho, CB (6.7)
4, Joel Ordóñez, CB (4.5) - 17, Ángelo Preciado 45’ (6.0)
21, Alan Franco, RB (5.5) - 26, Yaimar Medina 45’ (6.2)
20, Nilson Angulo, LM (6.9) - 10, Kendry Páez 79’ (6.6)
15, Pedro Vite, CM (6.8)
23, Moisés Caicedo, CM (C) (7.1)
9, John Yeboah, RM (7.3) - 16, Jordy Caicedo 79’ (5.8)
13, Enner Valencia, ST (5.2) - 11, Kevin Rodríguez 59’ (5.9)
19, Gonzalo Plata, ST (6.2)
DT, Sebastián Beccacece
Sub ECU
12, Moisés Ramírez, GK
22, Gonzalo Valle, GK
2, Félix Torres
5, Jordy Alcívar
7, Pervis Estupiñán
8, Anthony Valencia
14, Alan Minda
18, Denil Castillo
24, Jeremy Arévalo
25, Jackson Porozo
POS: 43, 57 - TIR: 15, 7 - TPO: 3, 1 - FAL: 10, 14 - AMA: 0, 3 - ROJ: 0, 1 - ESQ: 3, 8 - ATA: 1, 1
Kit MEX J1 C1, P1 C1 - Kit ECU J1 C3, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP MEX Julián Quiñones

Partido 80
Inglaterra 2 - RD Congo 1
1 jul 2026 · 12:00 UTC−4
Clima: 32 °C, Llovizna · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 68,239
ARB Adham Makhadmeh (JOR) - AA1 Mohammad Al-Kalaf (JOR) - AA2 Ahmad Al-Roalle (JOR) - 4AR Khalid Al-Turais (KSA) - VAR Khamis Al-Marri (QAT) - AVAR Mohammed Obaid Khadim (UAE)
Incidencias:
Gol COD Brian Cipenga 7’ - Asi COD Chancel Mbemba
Ama ENG Jude Bellingham 19’
Ama COD Noah Sadiki 27’
Gol ENG Harry Kane 75’ - Asi ENG Anthony Gordon
Gol ENG Harry Kane 86’ - Asi ENG Anthony Gordon
FT 90+6’
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (5.3)
3, Nico O'Reilly, LB (7.0)
6, Marc Guéhi, CB (7.3)
2, Ezri Konsa, CB (7.1)
25, Djed Spence, RB (6.9) - 21, Eberechi Eze 70’ (6.4)
4, Declan Rice, CDM (7.2) - 5, John Stones 90+1’ (SC)
8, Elliot Anderson, CDM (7.9)
11, Marcus Rashford, LM (7.2) - 18, Anthony Gordon 60’ (8.1)
10, Jude Bellingham, CAM (7.1)
20, Noni Madueke, RM (7.7) - 7, Bukayo Saka 60’ (6.7)
9, Harry Kane, ST (C) (8.9)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
12, Trevoh Chalobah
14, Jordan Henderson
15, Dan Burn
16, Kobbie Mainoo
17, Morgan Rogers
19, Ollie Watkins
22, Ivan Toney
24, Reece James
26, Jarell Quansah
Ali COD 4-1-4-1
1, Lionel Mpasi, GK (7.4)
26, Arthur Masuaku, LB (6.2) - 12, Joris Kayembe 89’ (SC)
4, Axel Tuanzebe, CB (6.5)
22, Chancel Mbemba, CB (C) (7.5)
2, Aaron Wan-Bissaka, RB (6.7)
8, Samuel Moutoussamy, CDM (6.6) - 19, Fiston Mayele 89’ (SC)
9, Brian Cipenga, LM (7.2) - 10, Théo Bongonda 76’ (6.4)
14, Noah Sadiki, CM (6.5)
6, Ngal'ayel Mukau, CM (6.1) - 25, Edo Kayembe 76’ (6.2)
7, Nathanaël Mbuku, RM (6.9) - 13, Meschak Elia 64’ (6.0)
20, Yoane Wissa, ST (6.9)
DT, Sébastien Desabre
Sub COD
16, Timothy Fayulu, GK
21, Matthieu Epolo, GK
3, Steve Kapuadi
5, Dylan Batubinsika
11, Gaël Kakuta
15, Aaron Tshibola
17, Cédric Bakambu
18, Charles Pickel
23, Simon Banza
24, Gédéon Kalulu
POS: 57, 43 - TIR: 16, 7 - TPO: 7, 2 - FAL: 10, 12 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 5, 3 - ATA: 1, 4
Kit ENG J1 C1, P3 C1 - Kit COD J1 C1, P3 C1 - Kit ARB TorFWC26 R2 C1
JDP ENG Harry Kane

Partido 81
Estados Unidos 2 - Bosnia y Herzegovina 0
1 jul 2026 · 17:00 UTC−7
Clima: 26 °C, Soleado
Estadio Bahía de San Francisco, San Francisco, Estados Unidos
Asistencia: 68,827
ARB Raphael Claus (BRA) - AA1 Danilo Manis (BRA) - AA2 Rodrigo Figueiredo (BRA) - 4AR Darío Herrera (ARG) - VAR Juan Soto (VEN) - AVAR Nicolás Gallo Barragán (COL)
Incidencias:
Gol USA Folarin Balogun 45’
Roj USA Folarin Balogun 64’ (RD)
Ama BIH Stjepan Radeljić 80’
Ama BIH Sergej Barbarez 80’
Gol USA Malik Tillman 82’
FT 90+10’
Ali USA 3-5-2
24, Matt Freese, GK (8.0)
13, Tim Ream, CB (C) (7.4)
3, Chris Richards, CB (7.4)
16, Alex Freeman, CB (7.6)
5, Antonee Robinson, LM (7.8)
17, Malik Tillman, CDM (8.5)
4, Tyler Adams, CAM (7.1)
8, Weston McKennie, CDM (7.7) - 7, Giovanni Reyna 90+5’ (SC)
2, Sergiño Dest, RM (7.0) - 14, Sebastian Berhalter 87’ (SC)
10, Christian Pulisic, ST (7.1) - 9, Ricardo Pepi 87’ (SC)
20, Folarin Balogun, ST (6.8)
DT, Mauricio Pochettino
Sub USA
1, Matt Turner, GK
25, Chris Brady, GK
6, Auston Trusty
11, Brenden Aaronson
12, Miles Robinson
18, Max Arfsten
19, Haji Wright
21, Timothy Weah
23, Joe Scally
26, Alejandro Zendejas
Ali BIH 4-4-2
1, Nikola Vasilj, GK (5.0)
21, Stjepan Radeljić, LB (5.6)
4, Tarik Muharemović, CB (6.7)
18, Nikola Katić, CB (6.3) - 15, Amar Memić 75’ (6.2)
7, Amar Dedić, RB (6.5)
5, Sead Kolašinac, LM (6.4) - 23, Haris Tabaković 75’ (6.1)
19, Kerim Alajbegović, CM (6.2)
14, Ivan Šunjić, CM (6.1) - 6, Benjamin Tahirović 51’ (6.5)
8, Armin Gigović, RM (6.3) - 20, Esmir Bajraktarević 51’ (6.5)
10, Ermedin Demirović, ST (6.2)
11, Edin Džeko, ST (C) (6.1) - 26, Ermin Mahmić 51’ (5.9)
DT, Sergej Barbarez
Sub BIH
12, Mladen Jurkas, GK
22, Martin Zlomislić, GK
2, Nihad Mujakić
3, Dennis Hadžikadunić
9, Samed Baždar
13, Ivan Bašić
16, Amir Hadžiahmetović
17, Dženis Burnić
24, Arjan Malić
25, Jovo Lukić
POS: 47, 53 - TIR: 8, 10 - TPO: 2, 3 - FAL: 7, 13 - AMA: 0, 2 - ROJ: 1, 0 - ESQ: 4, 3 - ATA: 3, 0
Kit USA J1 C2, P1 C1 - Kit BIH J1 C1, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP USA Malik Tillman

Partido 82
Bélgica 3 - Senegal 2
1 jul 2026 · 13:00 UTC−7
Clima: 17 °C, Nublado
Estadio Seattle, Seattle, Estados Unidos
Asistencia: 66,925
ARB Saíd Martínez (HON) - AA1 Walter López (HON) - AA2 Christian Ramírez (HON) - 4AR Andrés Rojas (COL) - VAR Guillermo Pacheco (MEX) - AVAR Rodolpho Toski (BRA)
Incidencias:
Gol SEN Habib Diarra 25’
Gol SEN Ismaïla Sarr 51’ - Asi SEN Moussa Niakhaté
Ama BEL Brandon Mechele 64’
Ama SEN Lamine Camara 67’
Gol BEL Romelu Lukaku 86’ - Asi BEL Thomas Meunier
Gol BEL Youri Tielemans 89’ - Asi BEL Leandro Trossard
Ama BEL Rudi Garcia 90’
Gol BEL Youri Tielemans 120+5’ (PEN)
FT 90+7’, 120+11’
Ali BEL 4-2-3-1 (W)
1, Thibaut Courtois, GK (6.8)
5, Maxim De Cuyper, LB (6.4) - 15, Thomas Meunier 78’ (7.2)
3, Arthur Theate, CB (7.1)
4, Brandon Mechele, CB (7.4)
21, Timothy Castagne, RB (7.4)
8, Youri Tielemans, CDM (C) (9.1)
20, Hans Vanaken, CDM (6.2) - 19, Diego Moreira 63’ (6.6)
11, Jérémy Doku, LM (6.8) - 14, Dodi Lukébakio 56’ (7.2)
7, Kevin De Bruyne, CAM (7.0) - 23, Nicolas Raskin 56’ (6.3)
10, Leandro Trossard, RM (8.4) - 24, Amadou Onana 109’ (6.3)
17, Charles De Ketelaere, ST (5.8) - 9, Romelu Lukaku 45’ (8.0)
DT, Rudi Garcia
Sub BEL
12, Senne Lammens, GK
13, Mike Penders, GK
6, Axel Witsel
16, Koni De Winter
18, Joaquin Seys
22, Alexis Saelemaekers
25, Nathan Ngoy
26, Matias Fernandez-Pardo
Ali SEN 4-3-3
23, Mory Diaw, GK (4.8)
14, Ismail Jakobs, LB (6.2) - 25, El Hadji Malick Diouf 93’ (6.5)
19, Moussa Niakhaté, CB (7.1)
6, Pathé Ciss, CB (6.8)
15, Krépin Diatta, RB (7.0)
26, Pape Gueye, CM (6.4) - 8, Lamine Camara 66’ (5.7)
5, Idrissa Gana Gueye, CM (C) (7.0) - 22, Bara Sapoko Ndiaye 95’ (6.4)
21, Habib Diarra, CM (8.0) - 17, Pape Matar Sarr 73’ (6.5)
10, Sadio Mané, LW (7.3) - 11, Nicolas Jackson 93’ (5.9)
18, Ismaïla Sarr, ST (8.6)
13, Iliman Ndiaye, RW (6.8) - 20, Ibrahim Mbaye 73’ (6.8)
DT, Pape Thiaw
Sub SEN
1, Yehvann Diouf, GK
2, Mamadou Sarr
3, Kalidou Koulibaly
4, Abdoulaye Seck
7, Assane Diao
9, Bamba Dieng
12, Cherif Ndiaye
24, Antoine Mendy
POS: 52, 48 - TIR: 19, 19 - TPO: 5, 5 - FAL: 22, 12 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 4, 2 - ATA: 3, 2
Kit BEL J2 C1, P4 C1 - Kit SEN J2 C1, P1 C1 - Kit ARB TorFWC26 R5 C1
JDP BEL Youri Tielemans

Partido 83
Portugal 2 - Croacia 1
2 jul 2026 · 19:00 UTC−4
Clima: 34 °C, Nublado
Estadio Toronto, Toronto, Canadá
Asistencia: 43,036
ARB Espen Eskås (NOR) - AA1 Jan Erik Engan (NOR) - AA2 Isaak Bashevkin (NOR) - 4AR Abongile Tom (RSA) - VAR Jarred Gillett (ENG) - AVAR Dennis Higler (NED)
Incidencias:
Ama POR Rúben Dias 17’
Gol CRO Ivan Perišić 53’
Ama CRO Luka Modrić 59’
Gol POR Cristiano Ronaldo 68’ (PEN)
Gol POR Gonçalo Ramos 90+4’ - Asi POR Rafael Leão
Ama CRO Ivan Perišić 90+8’
FT 90+18’
Ali POR 4-2-3-1 (W)
1, Diogo Costa, GK (7.6)
25, Nuno Mendes, LB (7.6)
13, Renato Veiga, CB (7.7)
3, Rúben Dias, CB (7.8)
20, João Cancelo, RB (7.4) - 9, Gonçalo Ramos 62’ (7.4)
23, Vitinha, CDM (7.5) - 10, Bernardo Silva 62’ (6.1)
15, João Neves, CDM (7.5)
17, Rafael Leão, LM (8.2)
8, Bruno Fernandes, CAM (6.7) - 2, Nélson Semedo 62’ (6.5)
18, Pedro Neto, RM (6.7) - 26, Francisco Conceição 62’ (6.2)
7, Cristiano Ronaldo, ST (C) (7.7) - 21, Rúben Neves 81’ (SC)
DT, Roberto Martínez
Sub POR
12, José Sá, GK
22, Rui Silva, GK
4, Tomás Araújo
5, Diogo Dalot
6, Matheus Nunes
11, João Félix
14, Gonçalo Inácio
16, Francisco Trincão
19, Gonçalo Guedes
24, Samú Costa
Ali CRO 4-2-3-1 (N)
1, Dominik Livaković, GK (6.1)
14, Ivan Perišić, LB (7.5)
3, Marin Pongračić, CB (6.5)
6, Josip Šutalo, CB (6.7)
2, Josip Stanišić, RB (7.2)
8, Mateo Kovačić, CDM (6.9) - 9, Andrej Kramarić 90+6’ (SC)
10, Luka Modrić, CDM (C) (6.8)
16, Martin Baturina, CAM (6.1) - 15, Mario Pašalić 68’ (6.4)
17, Petar Sučić, CAM (6.4)
13, Nikola Vlašić, CAM (6.6) - 4, Joško Gvardiol 90+2’ (SC)
11, Ante Budimir, ST (5.9) - 20, Igor Matanović 45’ (5.4)
DT, Zlatko Dalić
Sub CRO
12, Ivor Pandur, GK
23, Dominik Kotarski, GK
5, Duje Ćaleta-Car
7, Nikola Moro
18, Kristijan Jakić
19, Toni Fruk
21, Luka Sučić
22, Luka Vušković
24, Marco Pašalić
25, Martin Erlić
26, Petar Musa
POS: 61, 39 - TIR: 15, 13 - TPO: 3, 6 - FAL: 6, 12 - AMA: 1, 2 - ROJ: 0, 0 - ESQ: 9, 5 - ATA: 5, 1
Kit POR J2 C1, P2 C1 - Kit CRO J2 C1, P1 C1 - Kit ARB TorFWC26 R5 C1
JDP POR Cristiano Ronaldo

Partido 84
España 3 - Austria 0
2 jul 2026 · 12:00 UTC−7
Clima: 23 °C, Soleado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,492
ARB Glenn Nyberg (SWE) - AA1 Mahbod Beigi (SWE) - AA2 Andreas Söderkvist (SWE) - 4AR Dahane Beida (MTN) - VAR Tomasz Kwiatkowski (POL) - AVAR Fedayi San (SUI)
Incidencias:
Gol ESP Mikel Oyarzabal 36’ - Asi ESP Marc Cucurella
Gol ESP Pedro Porro 66’ - Asi ESP Álex Baena
Ama AUT Stefan Posch 83’
Gol ESP Mikel Oyarzabal 89’ - Asi ESP Marc Cucurella
FT 90+6’
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (7.3)
24, Marc Cucurella, LB (8.5)
14, Aymeric Laporte, CB (8.0) - 2, Marc Pubill 90+3’ (SC)
22, Pau Cubarsí, CB (8.0)
12, Pedro Porro, RB (8.9)
20, Pedri, CM (7.5) - 8, Fabián Ruiz 90+3’ (SC)
16, Rodri, CDM (C) (8.2)
10, Dani Olmo, CM (7.4) - 6, Mikel Merino 71’ (6.1)
15, Álex Baena, LW (8.2) - 7, Ferran Torres 71’ (6.0)
21, Mikel Oyarzabal, ST (9.1)
19, Lamine Yamal, RW (7.8) - 9, Gavi 85’ (SC)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
3, Álex Grimaldo
4, Eric García
5, Marcos Llorente
11, Yéremy Pino
17, Nico Williams
18, Martín Zubimendi
25, Víctor Muñoz
26, Borja Iglesias
Ali AUT 4-2-3-1 (N)
1, Alexander Schlager, GK (5.9)
20, Konrad Laimer, LB (6.1)
8, David Alaba, CB (C) (5.9)
3, Kevin Danso, CB (6.0)
5, Stefan Posch, RB (6.1) - 22, Alexander Prass 85’ (SC)
4, Xaver Schlager, CDM (5.6) - 10, Florian Grillitsch 45’ (6.2)
6, Nicolas Seiwald, CDM (6.1) - 17, Carney Chukwuemeka 45’ (6.0)
9, Marcel Sabitzer, CAM (6.7)
24, Paul Wanner, CAM (6.3)
18, Romano Schmid, CAM (6.5) - 14, Saša Kalajdžić 60’ (5.9)
11, Michael Gregoritsch, ST (5.5) - 7, Marko Arnautović 60’ (5.9)
DT, Ralf Rangnick
Sub AUT
12, Florian Wiegele, GK
13, Patrick Pentz, GK
2, David Affengruber
15, Philipp Lienhart
16, Phillipp Mwene
19, Dejan Ljubičić
21, Patrick Wimmer
23, Marco Friedl
25, Michael Svoboda
26, Alessandro Schöpf
POS: 64, 36 - TIR: 23, 5 - TPO: 10, 0 - FAL: 8, 15 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 9, 0 - ATA: 0, 6
Kit ESP J1 C1, P1 C1 - Kit AUT J2 C2, P2 C1 - Kit ARB TorFWC26 R3 C1
JDP ESP Lamine Yamal ALT

Partido 85
Suiza 2 - Argelia 0
2 jul 2026 · 20:00 UTC−7
Clima: 14 °C, Nublado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Yael Falcón (ARG) - AA1 Maximiliano Del Yesso (ARG) - AA2 Facundo Rodríguez (ARG) - 4AR Kevin Ortega (PER) - VAR Hernán Mastrangelo (ARG) - AVAR Erick Miranda (MEX)
Incidencias:
Gol SUI Breel Embolo 10’ - Asi SUI Johan Manzambi
Ama ALG Farès Chaïbi 36’
Gol SUI Dan Ndoye 46’
Ama ALG Hicham Boudaoui 72’
FT 90+6’
Ali SUI 4-2-3-1 (W)
1, Gregor Kobel, GK (8.0)
13, Ricardo Rodriguez, LB (7.5)
5, Manuel Akanji, CB (7.8)
4, Nico Elvedi, CB (7.3)
6, Denis Zakaria, RB (7.9) - 3, Silvan Widmer 87’ (SC)
10, Granit Xhaka, CDM (C) (7.7)
8, Remo Freuler, CDM (7.3)
17, Rubén Vargas, LM (7.5) - 22, Fabian Rieder 70’ (6.4)
9, Johan Manzambi, CAM (7.4) - 19, Noah Okafor 70’ (6.6)
11, Dan Ndoye, RM (8.4) - 20, Michel Aebischer 87’ (SC)
7, Breel Embolo, ST (7.7) - 23, Zeki Amdouni 82’ (SC)
DT, Murat Yakin
Sub SUI
12, Yvon Mvogo, GK
21, Marvin Keller, GK
2, Miro Muheim
14, Ardon Jashari
15, Djibril Sow
16, Christian Fassnacht
18, Eray Cömert
24, Aurèle Amenda
26, Cedric Itten
Ali ALG 4-3-3 (H)
23, Luca Zidane, GK (5.7)
15, Rayan Aït-Nouri, LB (7.5)
21, Ramy Bensebaini, CB (6.2)
2, Aïssa Mandi, CB (6.6)
17, Rafik Belghali, RB (7.0) - 20, Adil Boulbina 82’ (SC)
10, Farès Chaïbi, CM (6.1)
19, Nabil Bentaleb, CDM (6.7) - 14, Hicham Boudaoui 71’ (6.2)
6, Ramiz Zerrouki, CM (6.2) - 9, Amine Gouiri 58’ (5.6)
8, Houssem Aouar, LW (6.4) - 13, Jaouen Hadjam 58’ (6.8)
22, Ibrahim Maza, ST (6.2)
7, Riyad Mahrez, RW (C) (6.0) - 11, Anis Hadj Moussa 71’ (6.3)
DT, Vladimir Petković
Sub ALG
1, Melvin Mastil, GK
16, Oussama Benbot, GK
3, Achref Abada
4, Mohamed Amine Tougai
5, Zineddine Belaïd
24, Yacine Titraoui
25, Farès Ghedjemis
26, Samir Chergui
POS: 44, 56 - TIR: 11, 8 - TPO: 5, 2 - FAL: 10, 12 - AMA: 0, 2 - ROJ: 0, 0 - ESQ: 4, 2 - ATA: 2, 2
Kit SUI J1 C1, P2 C1 - Kit ALG J1 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP SUI Breel Embolo

Partido 86
Argentina 3 - Cabo Verde 2
3 jul 2026 · 18:00 UTC−4
Clima: 28 °C, Llovizna
Estadio Miami, Miami, Estados Unidos
Asistencia: 64,478
ARB Drew Fischer (CAN) - AA1 Micheal Barwegen (CAN) - AA2 Lyes Arfa (CAN) - 4AR Katia Itzel García (MEX) - VAR Armando Villarreal (USA) - AVAR Ivan Bebek (CRO)
Incidencias:
Gol ARG Lionel Messi 29’ - Asi ARG Lisandro Martínez
Gol CPV Deroy Duarte 59’ - Asi CPV Ryan Mendes
Ama CPV Kevin Pina 68’
Gol ARG Lisandro Martínez 92’ - Asi ARG Alexis Mac Allister
Gol CPV Sidny Lopes Cabral 103’ - Asi CPV Yannick Semedo
Gol ARG Diney Borges 111’ (GEC)
Ama ARG Gonzalo Montiel 115’
FT 90+8’, 120+3’
Ali ARG 4-4-2
23, Emiliano Martínez, GK (6.2)
25, Facundo Medina, LB (7.4) - 3, Nicolás Tagliafico 85’ (6.9)
6, Lisandro Martínez, CB (8.7)
13, Cristian Romero, CB (7.5)
26, Nahuel Molina, RB (6.3) - 4, Gonzalo Montiel 104’ (5.9)
16, Thiago Almada, LM (6.9) - 15, Nicolás González 63’ (7.2)
24, Enzo Fernández, CM (7.7)
20, Alexis Mac Allister, CM (8.2)
7, Rodrigo De Paul, RM (7.0) - 5, Leandro Paredes 84’ (7.0)
22, Lautaro Martínez, ST (6.1) - 9, Julián Alvarez 63’ (6.6)
10, Lionel Messi, ST (C) (8.7)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
2, Marcos Senesi
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
17, Giuliano Simeone
18, Nico Paz
19, Nicolás Otamendi
21, José Manuel López
Ali CPV 4-1-4-1
1, Vozinha, GK (7.7)
13, Sidny Lopes Cabral, LB (7.1)
3, Diney Borges, CB (5.8)
4, Pico Lopes, CB (6.3)
22, Steven Moreira, RB (6.2)
6, Kevin Pina, CDM (7.3) - 9, Gilson Benchimol 100’ (6.0)
7, Jovane Cabral, LM (6.6) - 26, Hélio Varela 80’ (6.8)
14, Deroy Duarte, CM (7.5) - 16, Yannick Semedo 100’ (7.4)
15, Laros Duarte, CM (6.4) - 10, Jamiro Monteiro 67’ (6.3)
20, Ryan Mendes, RM (C) (6.8) - 17, Willy Semedo 80’ (5.6)
21, Nuno da Costa, ST (6.0) - 19, Dailon Livramento 67’ (6.0)
DT, Bubista
Sub CPV
12, Márcio Rosa, GK
23, CJ dos Santos, GK
2, Stopira
5, Logan Costa
8, João Paulo
11, Garry Rodrigues
18, Telmo Arcanjo
24, Wagner Pina
25, Kelvin Pires
POS: 63, 37 - TIR: 22, 16 - TPO: 10, 5 - FAL: 13, 12 - AMA: 1, 1 - ROJ: 0, 0 - ESQ: 8, 8 - ATA: 3, 9
Kit ARG J1 C2, P3 C1 - Kit CPV J1 C1, P1 C1 - Kit ARB TorFWC26 R5 C1
JDP ARG Lionel Messi

Partido 87
Colombia 1 - Ghana 0
3 jul 2026 · 20:30 UTC−5
Clima: 30 °C, Mayormente despejado
Estadio Kansas City, Kansas City, Estados Unidos
Asistencia: 69,045
ARB Clément Turpin (FRA) - AA1 Nicolas Danos (FRA) - AA2 Benjamin Pagès (FRA) - 4AR Alejandro Hernández Hernández (ESP) - VAR Jérôme Brisard (FRA) - AVAR Willy Delajod (FRA)
Incidencias:
Ama COL Jhon Arias 12’
Gol COL Jhon Arias 14’ - Asi COL Luis Suárez
Ama GHA Caleb Yirenkyi 49’
Ama GHA Abdul Fatawu 66’
Ama GHA Alidu Seidu 76’
Ama COL Richard Ríos 78’
FT 90+7’
Ali COL 4-3-3 (H)
12, Camilo Vargas, GK (6.9)
17, Johan Mojica, LB (7.5)
3, Jhon Lucumí, CB (7.7)
23, Davinson Sánchez, CB (7.9)
2, Daniel Muñoz, RB (7.5)
11, Jhon Arias, CM (8.3) - 20, Juan Fernando Quintero 72’ (7.3)
16, Jefferson Lerma, CDM (6.9)
14, Gustavo Puerta, CM (7.5)
7, Luis Díaz, LW (6.4) - 21, Jaminton Campaz 90’ (SC)
9, Jhon Córdoba, ST (SC) - 25, Luis Suárez 8’ (7.2)
10, James Rodríguez, RW (C) (6.3) - 6, Richard Ríos 45’ (6.8)
DT, Néstor Lorenzo
Sub COL
1, David Ospina, GK
24, Álvaro Montero, GK
4, Santiago Arias
5, Kevin Castaño
8, Jorge Carrascal
13, Yerry Mina
15, Juan Portilla
18, Willer Ditta
19, Cucho Hernández
22, Deiver Machado
26, Andrés Gómez
Ali GHA 4-3-3 (H)
1, Lawrence Ati Zigi, GK (8.2)
14, Gideon Mensah, LB (7.2)
18, Jerome Opoku, CB (6.7)
23, Derrick Luckassen, CB (6.7)
26, Marvin Senaya, RB (6.4) - 2, Alidu Seidu 13’ (6.4)
8, Kwasi Sibo, CM (5.8) - 15, Elisha Owusu 62’ (6.2)
5, Thomas Partey, CDM (6.8)
3, Caleb Yirenkyi, CM (5.9) - 25, Prince Kwabena Adu 79’ (5.8)
11, Antoine Semenyo, LW (6.6)
9, Jordan Ayew, ST (C) (6.2) - 24, Ernest Nuamah 79’ (6.4)
19, Iñaki Williams, RW (6.0) - 7, Abdul Fatawu 62’ (6.0)
DT, Carlos Queiroz
Sub GHA
12, Joseph Anang, GK
16, Benjamin Asare, GK
4, Jonas Adjetey
6, Abdul Mumin
10, Brandon Thomas-Asante
13, Christopher Bonsu Baah
17, Abdul Rahman Baba
20, Augustine Boakye
21, Kojo Peprah Oppong
22, Kamaldeen Sulemana
POS: 60, 40 - TIR: 20, 8 - TPO: 8, 0 - FAL: 14, 10 - AMA: 2, 3 - ROJ: 0, 0 - ESQ: 3, 2 - ATA: 0, 7
Kit COL J1 C1, P1 C1 - Kit GHA J1 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP COL Luis Díaz

Partido 88
Australia 1 - Egipto 1
3 jul 2026 · 13:00 UTC−5
Clima: 35 °C, Mayormente soleado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,244
ARB Gustavo Tejera (URU) - AA1 Carlos Barreiro (URU) - AA2 Nicolás Tarán (URU) - 4AR Sandro Schärer (SUI) - VAR Leodán González (URU) - AVAR Antonio García (URU)
Incidencias:
Gol EGY Emam Ashour 13’ - Asi EGY Karim Hafez
Gol AUS Mohamed Hany 55’ (GEC)
Ama EGY Haissem Hassan 105’
Ama EGY Yasser Ibrahim 120’
FT 120+2’
Penales: 2-4
Ali AUS 3-4-3
18, Patrick Beach, GK (6.7) - 1, Mathew Ryan 119’ (SC)
25, Lucas Herrington, CB (6.6)
19, Harry Souttar, CB (C) (7.2)
3, Alessandro Circati, CB (7.3)
16, Aziz Behich, LM (7.1)
13, Aiden O'Neill, CM (7.0) - 24, Paul Okon-Engstler 91’ (6.3)
22, Jackson Irvine, CM (7.6)
5, Jordan Bos, RM (6.0) - 15, Kai Trewin 45’ (6.1)
8, Connor Metcalfe, LW (6.6) - 11, Awer Mabil 91’ (6.4)
17, Nestory Irankunda, ST (6.8) - 9, Mohamed Touré 74’ (5.9)
20, Cristian Volpato, RW (7.4) - 10, Ajdin Hrustic 74’ (6.7)
DT, Tony Popovic
Sub AUS
12, Paul Izzo, GK
2, Miloš Degenek
6, Jason Geria
14, Cameron Devlin
21, Cameron Burgess
23, Nishan Velupillay
26, Tete Yengi
Ali EGY 4-4-2
23, Mostafa Shobeir, GK (6.9)
15, Karim Hafez, LB (7.8) - 7, Trézéguet 80’ (6.2)
5, Ramy Rabia, CB (7.3)
2, Yasser Ibrahim, CB (6.9)
3, Mohamed Hany, RB (6.2)
11, Mostafa Zico, LM (6.4) - 12, Haissem Hassan 67’ (6.5)
19, Marwan Attia, CM (7.9) - 21, Mahmoud Saber 120+1’ (SC)
14, Hamdy Fathy, CM (6.6) - 4, Hossam Abdelmaguid 67’ (6.3)
8, Emam Ashour, RM (8.0)
22, Omar Marmoush, ST (6.5) - 9, Hamza Abdelkarim 105’ (5.9)
10, Mohamed Salah, ST (C) (8.1)
DT, Hossam Hassan
Sub EGY
1, Mohamed El Shenawy, GK
16, El Mahdy Soliman, GK
26, Mohamed Alaa, GK
18, Nabil Emad
20, Ibrahim Adel
24, Tarek Alaa
25, Zizo
POS: 42, 58 - TIR: 16, 14 - TPO: 1, 4 - FAL: 12, 14 - AMA: 0, 3 - ROJ: 0, 0 - ESQ: 4, 7 - ATA: 2, 1
Kit AUS J1 C1, P1 C1 - Kit EGY J1 C1, P3 C1 - Kit ARB TorFWC26 R1 C1
JDP EGY Mohamed Salah ALT

Partido 89
Paraguay 0 - Francia 1
4 jul 2026 · 17:00 UTC−4
Clima: 39 °C, Parcialmente nublado
Estadio Filadelfia, Filadelfia, Estados Unidos
Asistencia: 68,324
ARB Ilgiz Tantashev (UZB) - AA1 Andrey Tsapenko (UZB) - AA2 Timur Gaynullin (UZB) - 4AR Abdulrahman Al-Jassim (QAT) - VAR Juan Lara (CHI) - AVAR Marco Di Bello (ITA)
Incidencias:
Ama FRA Bradley Barcola 19’
Gol FRA Kylian Mbappé 70’ (PEN)
Ama FRA Manu Koné 81’
Ama FRA Michael Olise 90+7’
FT 90+10’
Ali PAR 5-4-1
12, Orlando Gill, GK (7.7)
6, Júnior Alonso, LB (7.0)
3, Omar Alderete, CB (6.2) - 13, José Canale 58’ (6.2)
15, Gustavo Gómez, CB (C) (6.7)
2, Gustavo Velázquez, CB (6.6)
4, Juan José Cáceres, RB (7.3)
23, Matías Galarza, LM (6.9)
14, Andrés Cubas, CM (7.3)
8, Diego Gómez, CM (6.4) - 11, Maurício 71’ (6.5)
10, Miguel Almirón, RM (6.5) - 21, Gabriel Ávalos 71’ (5.8)
19, Julio Enciso, ST (5.9) - 24, Gustavo Caballero 61’ (6.0)
DT, Gustavo Alfaro
Sub PAR
1, Gatito Fernández, GK
22, Gastón Olveira, GK
5, Fabián Balbuena
7, Ramón Sosa
9, Antonio Sanabria
16, Damián Bobadilla
17, Alejandro Romero Gamarra
18, Álex Arce
20, Braian Ojeda
25, Isidro Pitta
26, Alexandro Maidana
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (7.7)
3, Lucas Digne, LB (7.8)
17, William Saliba, CB (7.5)
4, Dayot Upamecano, CB (8.3)
5, Jules Koundé, RB (7.5)
14, Adrien Rabiot, CDM (7.2)
6, Manu Koné, CDM (7.7)
12, Bradley Barcola, LM (7.0) - 20, Désiré Doué 61’ (7.4)
11, Michael Olise, CAM (7.2)
7, Ousmane Dembélé, RM (6.7) - 24, Rayan Cherki 84’ (SC)
10, Kylian Mbappé, ST (C) (8.2)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
2, Malo Gusto
8, Aurélien Tchouaméni
9, Marcus Thuram
13, N'Golo Kanté
15, Ibrahima Konaté
18, Warren Zaïre-Emery
19, Théo Hernandez
21, Lucas Hernandez
22, Jean-Philippe Mateta
25, Maghnes Akliouche
26, Maxence Lacroix
POS: 24, 76 - TIR: 5, 15 - TPO: 1, 5 - FAL: 13, 11 - AMA: 1, 3 - ROJ: 0, 0 - ESQ: 2, 12 - ATA: 4, 0
Kit PAR J1 C1, P1 C1 - Kit FRA J1 C2, P1 C1 - Kit ARB TorFWC26 R3 C1
JDP PAR Orlando Gill

Partido 90
Canadá 0 - Marruecos 3
4 jul 2026 · 12:00 UTC−5
Clima: 33 °C, Soleado · Techo cerrado
Estadio Houston, Houston, Estados Unidos
Asistencia: 68,777
ARB Michael Oliver (ENG) - AA1 Stuart Burt (ENG) - AA2 James Mainwaring (ENG) - 4AR Danny Makkelie (NED) - VAR Jarred Gillett (ENG) - AVAR Dennis Higler (NED)
Incidencias:
Ama MAR Redouane Halhal 20’
Ama CAN Richie Laryea 40’
Ama MAR Achraf Hakimi 40’
Ama CAN Jonathan David 43’
Ama MAR Azzedine Ounahi 45’
Ama MAR Bilal El Khannouss 45+6’
Ama CAN Luc de Fougerolles 49’
Gol MAR Azzedine Ounahi 50’ - Asi MAR Achraf Hakimi
Ama CAN Cyle Larin 67’
Gol MAR Azzedine Ounahi 82’ - Asi MAR Brahim Díaz
Gol MAR Soufiane Rahimi 90+8’ - Asi MAR Brahim Díaz
FT 90+9’
Ali CAN 4-4-2
16, Maxime Crépeau, GK (5.2)
22, Richie Laryea, LB (6.5) - 14, Jacob Shaffelburg 78’ (6.4)
4, Luc de Fougerolles, CB (5.9)
15, Moïse Bombito, CB (5.0)
2, Alistair Johnston, RB (5.5)
20, Ali Ahmed, LM (6.8) - 24, Promise David 78’ (6.1)
7, Stephen Eustáquio, CM (C) (7.3)
23, Niko Sigur, CM (6.5) - 21, Jonathan Osorio 87’ (SC)
17, Tajon Buchanan, RM (5.8) - 26, Jayden Nelson 87’ (SC)
12, Tani Oluwaseyi, ST (6.6) - 9, Cyle Larin 63’ (5.8)
10, Jonathan David, ST (6.1)
DT, Jesse Marsch
Sub CAN
1, Dayne St. Clair, GK
18, Owen Goodman, GK
3, Alfie Jones
5, Joel Waterman
6, Mathieu Choinière
11, Liam Millar
13, Derek Cornelius
19, Alphonso Davies
25, Nathan Saliba
Ali MAR 4-2-3-1 (W)
1, Yassine Bounou, GK (8.3)
3, Noussair Mazraoui, LB (8.0)
25, Redouane Halhal, CB (7.1)
14, Issa Diop, CB (7.4) - 5, Marwane Saâdane 87’ (SC)
2, Achraf Hakimi, RB (C) (8.0)
6, Ayyoub Bouaddi, CDM (7.0) - 4, Sofyan Amrabat 63’ (6.1)
24, Neil El Aynaoui, CDM (6.6)
23, Bilal El Khannouss, LM (6.9) - 7, Chemsdine Talbi 63’ (6.9)
8, Azzedine Ounahi, CAM (8.9) - 15, Samir El Mourabet 87’ (SC)
10, Brahim Díaz, RM (8.3)
11, Ismael Saibari, ST (6.4) - 9, Soufiane Rahimi 22’ (7.9)
DT, Mohamed Ouahbi
Sub MAR
12, Munir El Kajoui, GK
22, Ahmed Reda Tagnaouti, GK
13, Zakaria El Ouahdi
16, Gessime Yassine
17, Amine Sbaï
18, Chadi Riad
19, Youssef Belammari
20, Ayoub El Kaabi
21, Ayoube Amaimouni
26, Anass Salah-Eddine
POS: 42, 58 - TIR: 10, 5 - TPO: 3, 4 - FAL: 24, 14 - AMA: 4, 4 - ROJ: 0, 0 - ESQ: 11, 1 - ATA: 1, 3
Kit CAN J3 C1, P2 C1 - Kit MAR J2 C1, P2 C1 - Kit ARB TorFWC26 R5 C1
JDP MAR Azzedine Ounahi ALT

Partido 91
Brasil 1 - Noruega 2
5 jul 2026 · 16:00 UTC−4
Clima: 26 °C, Lluvioso
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Ismail Elfath (USA) - AA1 Corey Parker (USA) - AA2 Kyle Atkins (USA) - 4AR Saíd Martínez (HON) - VAR Tatiana Guzmán (NCA) - AVAR Leodán González (URU)
Incidencias:
PFa BRA Bruno Guimarães 14’
Gol NOR Erling Haaland 79’ - Asi NOR Andreas Schjelderup
Gol NOR Erling Haaland 90’ - Asi NOR Andreas Schjelderup
Ama BRA Neymar 90+6’
Gol BRA Neymar 90+10’ (PEN)
FT 90+11’
Ali BRA 4-3-3 (H)
1, Alisson, GK (6.5)
16, Douglas Santos, LB (7.1)
3, Gabriel Magalhães, CB (6.2)
4, Marquinhos, CB (C) (6.2)
13, Danilo Luiz, RB (6.5)
22, Gabriel Martinelli, CM (7.0) - 10, Neymar 67’ (7.2)
5, Casemiro, CDM (7.2)
8, Bruno Guimarães, CM (5.8) - 2, Éderson Silva 79’ (5.7)
7, Vinícius Júnior, LW (7.4)
9, Matheus Cunha, ST (6.7) - 19, Endrick 58’ (5.7)
26, Rayan, RW (7.2) - 18, Danilo Santos 67’ (6.4)
DT, Carlo Ancelotti
Sub BRA
12, Weverton, GK
23, Ederson, GK
6, Alex Sandro
11, Raphinha
14, Bremer
15, Léo Pereira
17, Fabinho
21, Luiz Henrique
24, Roger Ibañez
25, Igor Thiago
Ali NOR 4-3-3 (H)
1, Ørjan Nyland, GK (8.3)
5, David Møller Wolfe, LB (7.3) - 4, Leo Østigård 90+5’ (SC)
17, Torbjørn Heggem, CB (7.3)
3, Kristoffer Ajer, CB (7.4)
26, Julian Ryerson, RB (6.9) - 14, Fredrik Aursnes 63’ (6.5)
6, Patrick Berg, CM (7.5)
8, Sander Berge, CDM (7.9)
10, Martin Ødegaard, CM (C) (7.3)
20, Antonio Nusa, LW (6.4) - 21, Andreas Schjelderup 45’ (8.3)
9, Erling Haaland, ST (8.8)
7, Alexander Sørloth, RW (6.2) - 22, Oscar Bobb 45’ (7.0)
DT, Ståle Solbakken
Sub NOR
12, Sander Tangvik, GK
13, Egil Selvik, GK
2, Morten Thorsby
11, Jørgen Strand Larsen
15, Fredrik André Bjørkan
18, Kristian Thorstvedt
19, Thelo Aasgaard
23, Jens Petter Hauge
24, Sondre Langås
25, Henrik Falchener
POS: 35, 65 - TIR: 14, 9 - TPO: 4, 5 - FAL: 7, 6 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 5, 5 - ATA: 3, 3
Kit BRA J1 C1, P4 C1 - Kit NOR J3 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP NOR Erling Haaland

Partido 92
México 2 - Inglaterra 3
5 jul 2026 · 18:00 UTC−6 → 19:00 (Retraso: tormenta eléctrica)
Clima: 17 °C, Lluvioso
Estadio Ciudad de México, Ciudad de México, México
Asistencia: 80,824
ARB Alireza Faghani (AUS) - AA1 George Lakrindis (AUS) - AA2 Andrew Lindsay (AUS) - 4AR Jalal Jayed (MAR) - VAR Nicolás Gallo Barragán (COL) - AVAR Juan Lara (CHI)
Incidencias:
Ama ENG Declan Rice 1’
Gol ENG Jude Bellingham 36’ - Asi ENG Bukayo Saka
Gol ENG Jude Bellingham 38’ - Asi ENG Harry Kane
Gol MEX Julián Quiñones 42’
Roj ENG Jarell Quansah 54’ (RD)
Gol ENG Harry Kane 60’ (PEN)
Ama ENG Marc Guéhi 68’
Gol MEX Raúl Jiménez 69’ (PEN)
Ama MEX Jorge Sánchez 71’
Ama ENG Nico O'Reilly 72’
Ama MEX Johan Vásquez 90+8’
Ama ENG Jordan Henderson 90+8’
FT 90+12’
Ali MEX 4-3-3 (H)
1, Raúl Rangel, GK (5.5)
23, Jesús Gallardo, LB (6.3)
5, Johan Vásquez, CB (7.0)
3, César Montes, CB (C) (5.7) - 4, Edson Álvarez 45’ (7.2)
2, Jorge Sánchez, RB (6.3) - 8, Álvaro Fidalgo 79’ (6.7)
7, Luis Romo, CM (6.2) - 26, Brian Gutiérrez 61’ (6.7)
6, Érik Lira, CDM (6.8)
19, Gilberto Mora, CM (5.3) - 11, Santiago Giménez 61’ (5.7)
16, Julián Quiñones, LW (7.6) - 22, Guillermo Martínez 81’ (SC)
9, Raúl Jiménez, ST (7.4)
25, Roberto Alvarado, RW (7.7)
DT, Javier Aguirre
Sub MEX
12, Carlos Acevedo, GK
13, Guillermo Ochoa, GK
10, Alexis Vega
14, Armando González
15, Israel Reyes
17, Orbelín Pineda
18, Obed Vargas
20, Mateo Chávez
21, César Huerta
24, Luis Chávez
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (7.4)
3, Nico O'Reilly, LB (6.6) - 25, Djed Spence 75’ (6.4)
6, Marc Guéhi, CB (7.2)
2, Ezri Konsa, CB (5.8)
26, Jarell Quansah, RB (5.7)
8, Elliot Anderson, CDM (7.4) - 15, Dan Burn 75’ (6.4)
4, Declan Rice, CDM (6.6)
18, Anthony Gordon, LM (7.6)
10, Jude Bellingham, CAM (9.2)
7, Bukayo Saka, RM (7.4) - 5, John Stones 57’ (6.4)
9, Harry Kane, ST (C) (8.2) - 17, Morgan Rogers 90’ (SC)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
11, Marcus Rashford
14, Jordan Henderson
16, Kobbie Mainoo
19, Ollie Watkins
20, Noni Madueke
21, Eberechi Eze
22, Ivan Toney
24, Reece James
POS: 65, 35 - TIR: 20, 6 - TPO: 5, 5 - FAL: 14, 7 - AMA: 2, 4 - ROJ: 0, 1 - ESQ: 12, 2 - ATA: 2, 3
Kit MEX J1 C1, P1 C1 - Kit ENG J1 C2, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP ENG Jude Bellingham

Partido 93
Portugal 0 - España 1
6 jul 2026 · 14:00 UTC−5
Clima: 35 °C, Parcialmente nublado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,649
ARB Anthony Taylor (ENG) - AA1 Gary Beswick (ENG) - AA2 Adam Nunn (ENG) - 4AR Felix Zwayer (GER) - VAR Bastian Dankert (GER) - AVAR Antonio García (URU)
Incidencias:
Ama POR Bernardo Silva 89’
Gol ESP Mikel Merino 90+1’ - Asi ESP Ferran Torres
Ama POR Renato Veiga 90+3’
Ama ESP Ferran Torres 90+8’
FT 90+8’
Ali POR 4-2-3-1 (W)
1, Diogo Costa, GK (7.8)
25, Nuno Mendes, LB (6.8) - 2, Nélson Semedo 56’ (6.0)
13, Renato Veiga, CB (6.8)
3, Rúben Dias, CB (6.4)
20, João Cancelo, RB (6.8) - 5, Diogo Dalot 71’ (6.2)
23, Vitinha, CDM (6.5) - 10, Bernardo Silva 83’ (SC)
15, João Neves, CDM (7.2)
11, João Félix, LM (6.9) - 17, Rafael Leão 71’ (6.5)
8, Bruno Fernandes, CAM (7.0)
18, Pedro Neto, RM (6.5) - 26, Francisco Conceição 83’ (SC)
7, Cristiano Ronaldo, ST (C) (6.4)
DT, Roberto Martínez
Sub POR
12, José Sá, GK
22, Rui Silva, GK
4, Tomás Araújo
6, Matheus Nunes
9, Gonçalo Ramos
14, Gonçalo Inácio
16, Francisco Trincão
19, Gonçalo Guedes
21, Rúben Neves
24, Samú Costa
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (8.4)
24, Marc Cucurella, LB (7.0)
14, Aymeric Laporte, CB (6.8)
22, Pau Cubarsí, CB (6.9)
12, Pedro Porro, RB (7.6)
20, Pedri, CM (7.0) - 8, Fabián Ruiz 85’ (SC)
16, Rodri, CDM (C) (8.0)
10, Dani Olmo, CM (6.9) - 6, Mikel Merino 85’ (SC)
15, Álex Baena, LW (7.2) - 7, Ferran Torres 75’ (6.7)
21, Mikel Oyarzabal, ST (6.9) - 26, Borja Iglesias 90+7’ (SC)
19, Lamine Yamal, RW (7.5)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
4, Eric García
5, Marcos Llorente
9, Gavi
11, Yéremy Pino
17, Nico Williams
18, Martín Zubimendi
25, Víctor Muñoz
POS: 45, 55 - TIR: 10, 15 - TPO: 2, 6 - FAL: 9, 13 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 3, 7 - ATA: 5, 2
Kit POR J1 C1, P1 C1 - Kit ESP J2 C2, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP ESP Rodri

Partido 94
Estados Unidos 1 - Bélgica 4
6 jul 2026 · 17:00 UTC−7
Clima: 27 °C, Soleado
Estadio Seattle, Seattle, Estados Unidos
Asistencia: 66,925
ARB Adham Makhadmeh (JOR) - AA1 Mohammad Al-Kalaf (JOR) - AA2 Ahmad Al-Roalle (JOR) - 4AR Pierre Atcho (GAB) - VAR Khamis Al-Marri (QAT) - AVAR Nicolás Gallo Barragán (COL)
Incidencias:
Gol BEL Charles De Ketelaere 9’ - Asi BEL Nicolas Raskin
Gol USA Malik Tillman 31’
Gol BEL Charles De Ketelaere 33’ - Asi BEL Leandro Trossard
Ama USA Weston McKennie 35’
Gol BEL Hans Vanaken 57’ - Asi BEL Charles De Ketelaere
Ama USA Malik Tillman 69’
Gol BEL Romelu Lukaku 90+3’ - Asi BEL Hans Vanaken
FT 90+4’
Ali USA 3-5-2
24, Matt Freese, GK (4.6)
13, Tim Ream, CB (C) (4.4)
3, Chris Richards, CB (4.8)
16, Alex Freeman, CB (6.6)
5, Antonee Robinson, LM (6.3) - 18, Max Arfsten 90+2’ (SC)
17, Malik Tillman, CDM (7.6)
4, Tyler Adams, CAM (6.0) - 9, Ricardo Pepi 72’ (6.4)
8, Weston McKennie, CDM (5.9)
2, Sergiño Dest, RM (6.3) - 7, Giovanni Reyna 45’ (6.9)
10, Christian Pulisic, ST (6.0) - 14, Sebastian Berhalter 59’ (6.5)
20, Folarin Balogun, ST (5.9) - 19, Haji Wright 90+2’ (SC)
DT, Mauricio Pochettino
Sub USA
1, Matt Turner, GK
25, Chris Brady, GK
6, Auston Trusty
11, Brenden Aaronson
12, Miles Robinson
21, Timothy Weah
22, Mark McKenzie
23, Joe Scally
26, Alejandro Zendejas
Ali BEL 4-2-3-1 (W)
1, Thibaut Courtois, GK (6.4)
5, Maxim De Cuyper, LB (7.3)
4, Brandon Mechele, CB (6.7)
25, Nathan Ngoy, CB (7.1)
21, Timothy Castagne, RB (7.0)
23, Nicolas Raskin, CDM (8.0) - 6, Axel Witsel 89’ (SC)
24, Amadou Onana, CDM (6.6) - 20, Hans Vanaken 21’ (8.4)
10, Leandro Trossard, LM (7.4) - 22, Alexis Saelemaekers 89’ (SC)
8, Youri Tielemans, CAM (C) (7.2)
14, Dodi Lukébakio, RM (7.2) - 11, Jérémy Doku 67’ (6.5)
17, Charles De Ketelaere, ST (9.4) - 9, Romelu Lukaku 67’ (7.0)
DT, Rudi Garcia
Sub BEL
12, Senne Lammens, GK
13, Mike Penders, GK
2, Zeno Debast
3, Arthur Theate
7, Kevin De Bruyne
15, Thomas Meunier
16, Koni De Winter
18, Joaquin Seys
19, Diego Moreira
26, Matias Fernandez-Pardo
POS: 57, 43 - TIR: 7, 15 - TPO: 2, 7 - FAL: 11, 9 - AMA: 2, 0 - ROJ: 0, 0 - ESQ: 3, 5 - ATA: 3, 1
Kit USA J2 C2, P1 C1 - Kit BEL J2 C1, P5 C1 - Kit ARB TorFWC26 R5 C1
JDP BEL Maxim De Cuyper

Partido 95
Argentina 3 - Egipto 2
7 jul 2026 · 12:00 UTC−4
Clima: 32 °C, Nublado · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 68,239
ARB François Letexier (FRA) - AA1 Cyril Mugnier (FRA) - AA2 Mehdi Rahmouni (FRA) - 4AR Espen Eskås (NOR) - VAR Jérôme Brisard (FRA) - AVAR Willy Delajod (FRA)
Incidencias:
Gol EGY Yasser Ibrahim 15’ - Asi EGY Marwan Attia
PFa ARG Lionel Messi 21’
Gol EGY Mostafa Zico 67’ - Asi EGY Haissem Hassan
Gol ARG Cristian Romero 79’ - Asi ARG Lionel Messi
Gol ARG Lionel Messi 83’ - Asi ARG Gonzalo Montiel
Gol ARG Enzo Fernández 90+2’ - Asi ARG Lautaro Martínez
Ama EGY Mostafa Shobeir 90+3’
Ama EGY Hamdy Fathy 90+4’
Ama EGY Marwan Attia 90+8’
Roj EGY Hossam Hassan 90+9’ (RD)
FT 90+11’
Ali ARG 4-1-3-2
23, Emiliano Martínez, GK (5.8)
3, Nicolás Tagliafico, LB (7.0) - 15, Nicolás González 66’ (6.7)
6, Lisandro Martínez, CB (7.6)
13, Cristian Romero, CB (8.1) - 19, Nicolás Otamendi 90+5’ (SC)
26, Nahuel Molina, RB (7.0) - 4, Gonzalo Montiel 73’ (7.1)
5, Leandro Paredes, CDM (8.2)
20, Alexis Mac Allister, LM (7.0)
24, Enzo Fernández, CM (8.2)
7, Rodrigo De Paul, RM (7.1) - 22, Lautaro Martínez 66’ (7.0)
9, Julián Alvarez, ST (6.8) - 25, Facundo Medina 90+5’ (SC)
10, Lionel Messi, ST (C) (8.7)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
2, Marcos Senesi
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
16, Thiago Almada
17, Giuliano Simeone
18, Nico Paz
21, José Manuel López
Ali EGY 4-2-3-1 (W)
23, Mostafa Shobeir, GK (6.9)
15, Karim Hafez, LB (6.3)
5, Ramy Rabia, CB (6.1)
2, Yasser Ibrahim, CB (7.0)
3, Mohamed Hany, RB (5.6)
19, Marwan Attia, CDM (7.3)
17, Mohanad Lasheen, CDM (7.1) - 25, Zizo 90+6’ (SC)
8, Emam Ashour, LM (6.2) - 14, Hamdy Fathy 45’ (6.3)
10, Mohamed Salah, CAM (C) (6.1)
12, Haissem Hassan, RM (7.2) - 7, Trézéguet 73’ (6.3)
11, Mostafa Zico, ST (7.6) - 22, Omar Marmoush 80’ (6.1)
DT, Hossam Hassan
Sub EGY
1, Mohamed El Shenawy, GK
16, El Mahdy Soliman, GK
26, Mohamed Alaa, GK
4, Hossam Abdelmaguid
9, Hamza Abdelkarim
18, Nabil Emad
20, Ibrahim Adel
21, Mahmoud Saber
24, Tarek Alaa
POS: 62, 38 - TIR: 19, 5 - TPO: 7, 2 - FAL: 13, 11 - AMA: 0, 6 - ROJ: 0, 1 - ESQ: 6, 1 - ATA: 0, 4
Kit ARG J1 C2, P1 C1 - Kit EGY J1 C2 , P1 C1 - Kit ARB TorFWC26 R2 C1
JDP ARG Lionel Messi

Partido 96
Suiza 0 - Colombia 0
7 jul 2026 · 13:00 UTC−7
Clima: 22 °C, Mayormente soleado
BC Place Vancouver, Vancouver, Canadá
Asistencia: 52,497
ARB Iván Barton (SLV) - AA1 David Morán (SLV) - AA2 Antonio Pupiro (NCA) - 4AR Katia Itzel García (MEX) - VAR Guillermo Pacheco (MEX) - AVAR Armando Villarreal (USA)
Incidencias:
Ama SUI Granit Xhaka 51’
Ama SUI Denis Zakaria 59’
Ama COL Luis Suárez 60’
Ama COL Davinson Sánchez 94’
Ama SUI Miro Muheim 105’
FT 90+5’, 120+1’
Penales: 4-3
COL Juan Fernando Quintero Gol, SUI Granit Xhaka Gol, COL Davinson Sánchez Falla, SUI Zeki Amdouni Gol, COL Jaminton Campaz Gol, SUI Manuel Akanji Falla, COL Cucho Hernández Falla, SUI Cedric Itten Gol, COL Luis Díaz Gol, SUI Rubén Vargas Gol
Ali SUI 4-3-3 (H)
1, Gregor Kobel, GK (8.6)
13, Ricardo Rodriguez, LB (6.3) - 2, Miro Muheim 71’ (6.7)
5, Manuel Akanji, CB (7.0)
4, Nico Elvedi, CB (7.6)
6, Denis Zakaria, RB (7.0) - 3, Silvan Widmer 87’ (6.6)
14, Ardon Jashari, CM (5.9) - 15, Djibril Sow 45’ (6.4)
10, Granit Xhaka, CDM (C) (7.4)
8, Remo Freuler, CM (7.2)
11, Dan Ndoye, LW (7.5) - 17, Rubén Vargas 90+1’ (6.6)
7, Breel Embolo, ST (6.2) - 26, Cedric Itten 87’ (5.9)
22, Fabian Rieder, RW (6.4) - 23, Zeki Amdouni 103’ (6.1)
DT, Murat Yakin
Sub SUI
12, Yvon Mvogo, GK
21, Marvin Keller, GK
16, Christian Fassnacht
18, Eray Cömert
19, Noah Okafor
24, Aurèle Amenda
Ali COL 4-3-3 (H)
12, Camilo Vargas, GK (7.4)
17, Johan Mojica, LB (7.4)
3, Jhon Lucumí, CB (7.6) - 13, Yerry Mina 118’ (SC)
23, Davinson Sánchez, CB (7.4)
2, Daniel Muñoz, RB (6.6)
14, Gustavo Puerta, CM (7.0)
16, Jefferson Lerma, CDM (7.3) - 6, Richard Ríos 82’ (6.7)
11, Jhon Arias, CM (7.2) - 21, Jaminton Campaz 66’ (6.7)
7, Luis Díaz, LW (7.0)
25, Luis Suárez, ST (6.0) - 19, Cucho Hernández 82’ (6.2)
10, James Rodríguez, RW (C) (6.7) - 20, Juan Fernando Quintero 66’ (6.7)
DT, Néstor Lorenzo
Sub COL
1, David Ospina, GK
24, Álvaro Montero, GK
4, Santiago Arias
5, Kevin Castaño
8, Jorge Carrascal
9, Jhon Córdoba
15, Juan Portilla
18, Willer Ditta
22, Deiver Machado
26, Andrés Gómez
POS: 54, 46 - TIR: 7, 15 - TPO: 2, 3 - FAL: 22, 21 - AMA: 3, 3 - ROJ: 0, 0 - ESQ: 3, 7 - ATA: 3, 2
Kit SUI J1 C1, P1 C1 - Kit COL J1 C4, P1 C1 - Kit ARB TorFWC26 R4 C1
JDP SUI Gregor Kobel

Partido 97
Francia 2 - Marruecos 0
9 jul 2026 · 16:00 UTC−4
Clima: 30 °C, Nublado
Estadio Boston, Boston, Estados Unidos
Asistencia: 63,811
ARB Facundo Tello (ARG) - AA1 Juan Pablo Belatti (ARG) - AA2 Gabriel Chade (ARG) - 4AR Darío Herrera (ARG) - VAR Hernán Mastrangelo (ARG) - AVAR Leodán González (URU)
Incidencias:
PFa FRA Kylian Mbappé 28’
Gol FRA Kylian Mbappé 60’ - Asi FRA Désiré Doué
Ama MAR Issa Diop 63’
Gol FRA Ousmane Dembélé 66’ - Asi FRA Kylian Mbappé
FT 90+6’
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (7.5)
3, Lucas Digne, LB (7.8)
17, William Saliba, CB (7.3)
4, Dayot Upamecano, CB (7.4)
5, Jules Koundé, RB (7.5) - 2, Malo Gusto 87’ (SC)
14, Adrien Rabiot, CDM (7.7)
6, Manu Koné, CDM (7.6) - 18, Warren Zaïre-Emery 71’ (6.2)
20, Désiré Doué, LM (8.4) - 12, Bradley Barcola 77’ (6.6)
11, Michael Olise, CAM (7.7)
7, Ousmane Dembélé, RM (8.3)
10, Kylian Mbappé, ST (C) (8.6) - 22, Jean-Philippe Mateta 77’ (6.4)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
8, Aurélien Tchouaméni
9, Marcus Thuram
13, N'Golo Kanté
15, Ibrahima Konaté
19, Théo Hernandez
21, Lucas Hernandez
24, Rayan Cherki
25, Maghnes Akliouche
26, Maxence Lacroix
Ali MAR 4-2-3-1 (W)
1, Yassine Bounou, GK (7.7)
26, Anass Salah-Eddine, LB (6.2) - 13, Zakaria El Ouahdi 74’ (6.0)
3, Noussair Mazraoui, CB (5.5)
14, Issa Diop, CB (5.9)
2, Achraf Hakimi, RB (C) (6.6)
24, Neil El Aynaoui, CDM (5.9)
6, Ayyoub Bouaddi, CDM (6.0) - 4, Sofyan Amrabat 62’ (6.5)
7, Chemsdine Talbi, LM (6.2) - 17, Amine Sbaï 85’ (SC)
8, Azzedine Ounahi, CAM (6.7)
10, Brahim Díaz, RM (6.8) - 16, Gessime Yassine 74’ (6.0)
23, Bilal El Khannouss, ST (6.5) - 9, Soufiane Rahimi 62’ (5.9)
DT, Mohamed Ouahbi
Sub MAR
12, Munir El Kajoui, GK
22, Ahmed Reda Tagnaouti, GK
5, Marwane Saâdane
11, Ismael Saibari
15, Samir El Mourabet
18, Chadi Riad
19, Youssef Belammari
20, Ayoub El Kaabi
21, Ayoube Amaimouni
25, Redouane Halhal
POS: 49, 51 - TIR: 22, 5 - TPO: 8, 1 - FAL: 10, 13 - AMA: 0, 1 - ROJ: 0, 0 - ESQ: 5, 5 - ATA: 1, 6
Kit FRA J2 C1, P5 C1 - Kit MAR J1 C1, P2 C1 - Kit ARB TorFWC26 R1 C1
JDP FRA Kylian Mbappé ALT

Partido 98
España 2 - Bélgica 1
10 jul 2026 · 12:00 UTC−7
Clima: 28 °C, Soleado
Estadio Los Ángeles, Los Ángeles, Estados Unidos
Asistencia: 70,492
ARB Michael Oliver (ENG) - AA1 Stuart Burt (ENG) - AA2 James Mainwaring (ENG) - 4AR Ramon Abatti (BRA) - VAR Jarred Gillett (ENG) - AVAR Ivan Bebek (CRO)
Incidencias:
Gol ESP Fabián Ruiz 30’
Gol BEL Charles De Ketelaere 41’ - Asi BEL Timothy Castagne
Ama ESP Pau Cubarsí 43’
Ama BEL Kevin De Bruyne 86’
Gol ESP Mikel Merino 88’
Ama ESP Aymeric Laporte 90+3’
Ama BEL Axel Witsel 90+5’
FT 90+7’
Ali ESP 4-2-3-1 (W)
23, Unai Simón, GK (6.2)
24, Marc Cucurella, LB (7.1)
14, Aymeric Laporte, CB (7.1)
22, Pau Cubarsí, CB (7.6)
12, Pedro Porro, RB (7.6)
8, Fabián Ruiz, CDM (7.7) - 20, Pedri 55’ (6.5)
16, Rodri, CDM (C) (7.8)
15, Álex Baena, LM (6.5) - 7, Ferran Torres 55’ (6.0)
10, Dani Olmo, CAM (7.7) - 6, Mikel Merino 86’ (SC)
19, Lamine Yamal, RM (7.8)
21, Mikel Oyarzabal, ST (7.4) - 17, Nico Williams 79’ (6.3)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
4, Eric García
5, Marcos Llorente
9, Gavi
11, Yéremy Pino
18, Martín Zubimendi
25, Víctor Muñoz
26, Borja Iglesias
Ali BEL 4-2-3-1 (W)
1, Thibaut Courtois, GK (7.3) - 12, Senne Lammens 71’ (5.1)
5, Maxim De Cuyper, LB (6.5) - 18, Joaquin Seys 60’ (6.5)
4, Brandon Mechele, CB (6.5)
25, Nathan Ngoy, CB (6.4)
21, Timothy Castagne, RB (6.9)
23, Nicolas Raskin, CDM (6.6)
20, Hans Vanaken, CDM (6.2) - 9, Romelu Lukaku 60’ (5.7)
11, Jérémy Doku, LM (7.0)
7, Kevin De Bruyne, CAM (C) (6.7) - 22, Alexis Saelemaekers 86’ (SC)
10, Leandro Trossard, RM (5.4) - 6, Axel Witsel 60’ (5.9)
17, Charles De Ketelaere, ST (7.4)
DT, Rudi Garcia
Sub BEL
13, Mike Penders, GK
3, Arthur Theate
14, Dodi Lukébakio
15, Thomas Meunier
16, Koni De Winter
19, Diego Moreira
26, Matias Fernandez-Pardo
POS: 68, 32 - TIR: 17, 5 - TPO: 8, 2 - FAL: 13, 18 - AMA: 2, 2 - ROJ: 0, 0 - ESQ: 5, 1 - ATA: 1, 6
Kit ESP J1 C1, P1 C1 - Kit BEL J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP ESP Lamine Yamal ALT

Partido 99
Noruega 1 - Inglaterra 2
11 jul 2026 · 17:00 UTC−4
Clima: 32 °C, Nublado
Estadio Miami, Miami, Estados Unidos
Asistencia: 64,478
ARB Clément Turpin (FRA) - AA1 Nicolas Danos (FRA) - AA2 Benjamin Pagès (FRA) - 4AR Alejandro Hernández Hernández (ESP) - VAR Jérôme Brisard (FRA) - AVAR Armando Villarreal (USA)
Incidencias:
Gol NOR Andreas Schjelderup 36’ - Asi NOR Martin Ødegaard
Gol ENG Jude Bellingham 45+2’ - Asi ENG Anthony Gordon
Gol ENG Jude Bellingham 93’
Ama NOR Kristoffer Ajer 117’
FT 90+8’, 120+2’
Ali NOR 4-3-3 (H)
1, Ørjan Nyland, GK (5.9)
5, David Møller Wolfe, LB (6.3) - 16, Marcus Holmgren Pedersen 90’ (5.9)
17, Torbjørn Heggem, CB (6.7) - 4, Leo Østigård 91’ (6.3)
3, Kristoffer Ajer, CB (6.8)
26, Julian Ryerson, RB (6.8) - 14, Fredrik Aursnes 60’ (6.8)
6, Patrick Berg, CM (6.6)
8, Sander Berge, CDM (7.2)
10, Martin Ødegaard, CM (C) (7.6)
21, Andreas Schjelderup, LW (7.8) - 20, Antonio Nusa 67’ (6.1)
9, Erling Haaland, ST (6.4) - 11, Jørgen Strand Larsen 93’ (6.2)
7, Alexander Sørloth, RW (6.6) - 22, Oscar Bobb 67’ (6.4)
DT, Ståle Solbakken
Sub NOR
12, Sander Tangvik, GK
13, Egil Selvik, GK
2, Morten Thorsby
15, Fredrik André Bjørkan
18, Kristian Thorstvedt
19, Thelo Aasgaard
23, Jens Petter Hauge
24, Sondre Langås
25, Henrik Falchener
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (6.6)
3, Nico O'Reilly, LB (7.3) - 25, Djed Spence 86’ (7.0)
6, Marc Guéhi, CB (6.8)
5, John Stones, CB (7.2)
2, Ezri Konsa, RB (7.7) - 17, Morgan Rogers 89’ (6.3)
8, Elliot Anderson, CDM (7.5)
4, Declan Rice, CDM (6.7) - 21, Eberechi Eze 45’ (6.7)
18, Anthony Gordon, LM (7.5) - 24, Reece James 71’ (6.4)
10, Jude Bellingham, CAM (9.1) - 15, Dan Burn 111’ (SC)
20, Noni Madueke, RM (6.6) - 7, Bukayo Saka 45’ (7.4)
9, Harry Kane, ST (C) (6.9)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
11, Marcus Rashford
12, Trevoh Chalobah
14, Jordan Henderson
16, Kobbie Mainoo
19, Ollie Watkins
22, Ivan Toney
POS: 46, 54 - TIR: 13, 14 - TPO: 4, 7 - FAL: 10, 8 - AMA: 1, 0 - ROJ: 0, 0 - ESQ: 7, 4 - ATA: 5, 3
Kit NOR J1 C4, P3 C1 - Kit ENG J1 C1, P1 C1 - Kit ARB TorFWC26 R1 C1
JDP ENG Jude Bellingham

Partido 100
Argentina 3 - Suiza 1
11 jul 2026 · 20:00 UTC−5
Clima: 30 °C, Mayormente despejado
Estadio Kansas City, Kansas City, Estados Unidos
Asistencia: 69,045
ARB João Pinheiro (POR) - AA1 Bruno Jesus (POR) - AA2 Luciano Maia (POR) - 4AR Drew Fischer (CAN) - VAR Guillermo Pacheco (MEX) - AVAR Juan Lara (CHI)
Incidencias:
Gol ARG Alexis Mac Allister 10’ - Asi ARG Lionel Messi
Ama SUI Breel Embolo 44’
Gol SUI Dan Ndoye 67’ - Asi SUI Ricardo Rodriguez
Roj SUI Breel Embolo 72’ (DA)
Ama ARG Thiago Almada 97’
Ama ARG Lautaro Martínez 98’
Gol ARG Julián Alvarez 112’ - Asi ARG José Manuel López
Ama ARG José Manuel López 114’
Gol ARG Lautaro Martínez 120+1’
FT 90+9’, 120+4’
Ali ARG 4-1-3-2
23, Emiliano Martínez, GK (7.5)
3, Nicolás Tagliafico, LB (6.9) - 15, Nicolás González 78’ (6.9)
6, Lisandro Martínez, CB (7.9)
13, Cristian Romero, CB (7.4) - 19, Nicolás Otamendi 98’ (6.5)
26, Nahuel Molina, RB (6.8) - 4, Gonzalo Montiel 85’ (6.0)
5, Leandro Paredes, CDM (7.9) - 21, José Manuel López 110’ (6.9)
20, Alexis Mac Allister, LM (8.4)
24, Enzo Fernández, CM (7.0) - 16, Thiago Almada 91’ (7.3)
7, Rodrigo De Paul, RM (7.0) - 22, Lautaro Martínez 85’ (7.4)
9, Julián Alvarez, ST (8.3)
10, Lionel Messi, ST (C) (8.9)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
2, Marcos Senesi
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
17, Giuliano Simeone
18, Nico Paz
25, Facundo Medina
Ali SUI 4-2-3-1 (W)
1, Gregor Kobel, GK (7.1)
13, Ricardo Rodriguez, LB (7.7) - 18, Eray Cömert 90+5’ (6.2)
5, Manuel Akanji, CB (5.7)
4, Nico Elvedi, CB (6.8)
6, Denis Zakaria, RB (6.5) - 14, Ardon Jashari 96’ (6.0)
10, Granit Xhaka, CDM (C) (6.1)
8, Remo Freuler, CDM (6.4) - 17, Rubén Vargas 115’ (SC)
11, Dan Ndoye, LM (7.3) - 23, Zeki Amdouni 86’ (5.9)
22, Fabian Rieder, CAM (5.9) - 2, Miro Muheim 86’ (6.1)
15, Djibril Sow, RM (6.4) - 3, Silvan Widmer 86’ (6.5)
7, Breel Embolo, ST (5.1)
DT, Murat Yakin
Sub SUI
12, Yvon Mvogo, GK
21, Marvin Keller, GK
16, Christian Fassnacht
19, Noah Okafor
20, Michel Aebischer
24, Aurèle Amenda
25, Luca Jaquez
26, Cedric Itten
POS: 59, 41 - TIR: 22, 11 - TPO: 7, 5 - FAL: 14, 18 - AMA: 3, 2 - ROJ: 0, 1 - ESQ: 8, 2 - ATA: 4, 4
Kit ARG J1 C2, P3 C1 - Kit SUI J1 C1, P1 C1 - Kit ARB TorFWC26 R2 C1
JDP ARG Julián Alvarez

Partido 101
Francia 0 - España 2
14 jul 2026 · 14:00 UTC−5
Clima: 31 °C, Nublado · Techo cerrado
Estadio Dallas, Dallas, Estados Unidos
Asistencia: 70,176
ARB Iván Barton (SLV) - AA1 David Morán (SLV) - AA2 Antonio Pupiro (NCA) - 4AR Glenn Nyberg (SWE) - VAR Tomasz Kwiatkowski (POL) - AVAR Dennis Higler (NED)
Incidencias:
Ama FRA Adrien Rabiot 8’
Gol ESP Mikel Oyarzabal 22’ (PEN)
Ama ESP Marc Cucurella 31’
Gol ESP Pedro Porro 58’ - Asi ESP Dani Olmo
Ama FRA Kylian Mbappé 86’
FT 90+7’
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (5.6)
3, Lucas Digne, LB (6.1) - 19, Théo Hernandez 72’ (6.1)
17, William Saliba, CB (5.9) - 26, Maxence Lacroix 30’ (6.6)
4, Dayot Upamecano, CB (6.4)
5, Jules Koundé, RB (6.6)
14, Adrien Rabiot, CDM (7.3) - 6, Manu Koné 45’ (5.9)
8, Aurélien Tchouaméni, CDM (6.9)
12, Bradley Barcola, LM (6.2) - 20, Désiré Doué 57’ (6.9)
11, Michael Olise, CAM (6.3) - 24, Rayan Cherki 72’ (6.8)
7, Ousmane Dembélé, RM (6.7)
10, Kylian Mbappé, ST (C) (5.8)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
2, Malo Gusto
9, Marcus Thuram
13, N'Golo Kanté
15, Ibrahima Konaté
18, Warren Zaïre-Emery
21, Lucas Hernandez
22, Jean-Philippe Mateta
25, Maghnes Akliouche
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (8.2)
24, Marc Cucurella, LB (7.6)
14, Aymeric Laporte, CB (7.4)
22, Pau Cubarsí, CB (7.7)
12, Pedro Porro, RB (8.1) - 5, Marcos Llorente 83’ (SC)
8, Fabián Ruiz, CM (7.9) - 20, Pedri 77’ (6.2)
16, Rodri, CDM (C) (7.5)
10, Dani Olmo, CM (7.3) - 6, Mikel Merino 77’ (6.5)
15, Álex Baena, LW (6.8) - 17, Nico Williams 83’ (SC)
21, Mikel Oyarzabal, ST (7.6) - 7, Ferran Torres 74’ (6.3)
19, Lamine Yamal, RW (7.3)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
4, Eric García
9, Gavi
11, Yéremy Pino
18, Martín Zubimendi
25, Víctor Muñoz
26, Borja Iglesias
POS: 49, 51 - TIR: 10, 10 - TPO: 3, 2 - FAL: 11, 12 - AMA: 2, 1 - ROJ: 0, 0 - ESQ: 7, 1 - ATA: 0, 3
Kit FRA J1 C1, P3 C1 - Kit ESP J2 C4, P5 C1 - Kit ARB TorFWC26 R12 C1
JDP ESP Pedro Porro

Partido 102
Inglaterra 1 - Argentina 2
15 jul 2026 · 15:00 UTC−4
Clima: 30 °C, Llovizna · Techo cerrado
Estadio Atlanta, Atlanta, Estados Unidos
Asistencia: 68,239
ARB Ismail Elfath (USA) - AA1 Corey Parker (USA) - AA2 Kyle Atkins (USA) - 4AR Maurizio Mariani (ITA) - VAR Marco Di Bello (ITA) - AVAR Juan Lara (CHI)
Incidencias:
Ama ENG Elliot Anderson 37’
Ama ARG Lisandro Martínez 42’
Ama ARG Cristian Romero 51’
Gol ENG Anthony Gordon 55’ - Asi ENG Morgan Rogers
Gol ARG Enzo Fernández 85’ - Asi ARG Lionel Messi
Gol ARG Lautaro Martínez 90+2’ - Asi ARG Lionel Messi
Ama ARG Rodrigo De Paul 90+4’
FT 90+11’
Ali ENG 4-2-3-1 (W)
1, Jordan Pickford, GK (6.1)
25, Djed Spence, LB (6.8) - 11, Marcus Rashford 90+6’ (SC)
6, Marc Guéhi, CB (6.3)
5, John Stones, CB (6.3) - 22, Ivan Toney 90+6’ (SC)
24, Reece James, RB (7.2) - 15, Dan Burn 82’ (SC)
8, Elliot Anderson, CDM (6.9)
4, Declan Rice, CDM (7.6) - 3, Nico O'Reilly 82’ (SC)
18, Anthony Gordon, LM (6.7) - 2, Ezri Konsa 72’ (6.0)
10, Jude Bellingham, CAM (6.2)
17, Morgan Rogers, RM (6.8)
9, Harry Kane, ST (C) (6.2)
DT, Thomas Tuchel
Sub ENG
13, Dean Henderson, GK
23, James Trafford, GK
7, Bukayo Saka
12, Trevoh Chalobah
14, Jordan Henderson
16, Kobbie Mainoo
19, Ollie Watkins
20, Noni Madueke
21, Eberechi Eze
Ali ARG 4-4-2
23, Emiliano Martínez, GK (6.8)
3, Nicolás Tagliafico, LB (7.0) - 22, Lautaro Martínez 81’ (SC)
6, Lisandro Martínez, CB (6.5) - 19, Nicolás Otamendi 72’ (6.4)
13, Cristian Romero, CB (7.9)
26, Nahuel Molina, RB (6.8) - 4, Gonzalo Montiel 72’ (6.0)
24, Enzo Fernández, LM (8.0)
20, Alexis Mac Allister, CM (7.0)
5, Leandro Paredes, CM (7.3) - 15, Nicolás González 64’ (7.1)
17, Giuliano Simeone, RM (6.7) - 7, Rodrigo De Paul 72’ (6.8)
9, Julián Alvarez, ST (7.4)
10, Lionel Messi, ST (C) (9.0)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
2, Marcos Senesi
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
16, Thiago Almada
18, Nico Paz
21, José Manuel López
25, Facundo Medina
POS: 37, 63 - TIR: 5, 14 - TPO: 2, 5 - FAL: 11, 15 - AMA: 1, 3 - ROJ: 0, 0 - ESQ: 1, 6 - ATA: 3, 1
Kit ENG J1 C1, P1 C1 - Kit ARG J1 C1, P4 C1 - Kit ARB TorFWC26 R12 C1
JDP ARG Lionel Messi

Partido 103
Francia 4 - Inglaterra 6
18 jul 2026 · 17:00 UTC−4
Clima: 31 °C, Nublado
Estadio Miami, Miami, Estados Unidos
Asistencia: 64,478
ARB Jesús Valenzuela (VEN) - AA1 Jorge Urrego (VEN) - AA2 Tulio Moreno (VEN) - 4AR Jalal Jayed (MAR) - VAR Leodán González (URU) - AVAR Armando Villarreal (USA)
Incidencias:
Gol ENG Declan Rice 3’
Gol ENG Ezri Konsa 18’ - Asi ENG Declan Rice
Gol ENG Bukayo Saka 37’ - Asi ENG Marcus Rashford
Gol ENG Bukayo Saka 45+1’ - Asi ENG Eberechi Eze
Gol FRA Kylian Mbappé 48’ - Asi FRA Michael Olise
Gol FRA Bradley Barcola 54’ - Asi FRA Kylian Mbappé
Gol FRA Kylian Mbappé 66’ - Asi FRA Michael Olise
Gol ENG Bukayo Saka 87’ (PEN)
Gol FRA Ousmane Dembélé 90+6’ - Asi FRA Dayot Upamecano
Gol ENG Jude Bellingham 90+8’
FT 90+8’
Ali FRA 4-2-3-1 (W)
16, Mike Maignan, GK (4.7)
19, Théo Hernandez, LB (4.9) - 3, Lucas Digne 45’ (6.5)
26, Maxence Lacroix, CB (5.8)
15, Ibrahima Konaté, CB (4.5) - 4, Dayot Upamecano 45’ (7.3)
2, Malo Gusto, RB (5.2) - 5, Jules Koundé 90+1’ (SC)
14, Adrien Rabiot, CDM (4.9)
18, Warren Zaïre-Emery, CDM (4.7)
20, Désiré Doué, LM (6.4) - 12, Bradley Barcola 45’ (7.5)
24, Rayan Cherki, CAM (6.2) - 7, Ousmane Dembélé 45’ (7.8)
11, Michael Olise, RM (8.5)
10, Kylian Mbappé, ST (C) (8.9)
DT, Didier Deschamps
Sub FRA
1, Brice Samba, GK
23, Robin Risser, GK
6, Manu Koné
8, Aurélien Tchouaméni
9, Marcus Thuram
13, N'Golo Kanté
17, William Saliba
21, Lucas Hernandez
22, Jean-Philippe Mateta
25, Maghnes Akliouche
Ali ENG 4-3-3 (H)
13, Dean Henderson, GK (6.6)
25, Djed Spence, LB (7.1)
6, Marc Guéhi, CB (7.4) - 12, Trevoh Chalobah 90+2’ (SC)
2, Ezri Konsa, CB (7.6)
26, Jarell Quansah, RB (6.2) - 24, Reece James 83’ (SC)
21, Eberechi Eze, CM (8.1) - 10, Jude Bellingham 79’ (7.8)
4, Declan Rice, CDM (C) (8.3)
17, Morgan Rogers, CM (7.4)
11, Marcus Rashford, LW (7.9) - 19, Ollie Watkins 45’ (6.8)
22, Ivan Toney, ST (6.9) - 8, Elliot Anderson 79’ (6.2)
7, Bukayo Saka, RW (9.7)
DT, Thomas Tuchel
Sub ENG
1, Jordan Pickford, GK
23, James Trafford, GK
3, Nico O'Reilly
5, John Stones
9, Harry Kane
14, Jordan Henderson
15, Dan Burn
18, Anthony Gordon
20, Noni Madueke
POS: 46, 54 - TIR: 19, 19 - TPO: 9, 11 - FAL: 14, 8 - AMA: 0, 0 - ROJ: 0, 0 - ESQ: 3, 4 - ATA: 4, 5
Kit FRA J1 C2, P2 C1 - Kit ENG J1 C1, P1 C1 - Kit ARB TorFWC26 R12 C1
JDP ENG Bukayo Saka

Partido 104
España 1 - Argentina 0
19 jul 2026 · 15:00 UTC−4
Clima: 26 °C, Mayormente soleado
Estadio Nueva York Nueva Jersey, Nueva York, Estados Unidos
Asistencia: 80,663
ARB Slavko Vinčić (SVN) - AA1 Tomaž Klančnik (SVN) - AA2 Andraž Kovačič (SVN) - 4AR Adham Makhadmeh (JOR) - VAR Bastian Dankert (GER) - AVAR Nicolás Gallo Barragán (COL)
Incidencias:
Ama ARG Lisandro Martínez 41’
Ama ARG Leandro Paredes 52’
Ama ARG Enzo Fernández 82’
Ama ARG Cristian Romero 90+2’
Roj ARG Enzo Fernández 90+3’ (DA)
Ama ARG Lionel Scaloni 105’
Gol ESP Ferran Torres 106’ - Asi ESP Nico Williams
Ama ARG Alexis Mac Allister 111’
FT 90+8’, 120+5’
Ali ESP 4-3-3 (H)
23, Unai Simón, GK (7.7)
24, Marc Cucurella, LB (7.6)
14, Aymeric Laporte, CB (7.6) - 4, Eric García 99’ (6.2)
22, Pau Cubarsí, CB (8.0)
12, Pedro Porro, RB (7.8)
8, Fabián Ruiz, CM (7.3) - 20, Pedri 62’ (7.7)
16, Rodri, CDM (C) (8.2) - 18, Martín Zubimendi 99’ (6.6)
10, Dani Olmo, CM (7.1) - 6, Mikel Merino 75’ (6.6)
15, Álex Baena, LW (6.7) - 17, Nico Williams 75’ (7.7)
21, Mikel Oyarzabal, ST (6.5) - 7, Ferran Torres 62’ (7.4)
19, Lamine Yamal, RW (7.8)
DT, Luis de la Fuente
Sub ESP
1, David Raya, GK
13, Joan Garcia, GK
2, Marc Pubill
3, Álex Grimaldo
5, Marcos Llorente
9, Gavi
11, Yéremy Pino
25, Víctor Muñoz
26, Borja Iglesias
Ali ARG 4-4-2
23, Emiliano Martínez, GK (8.8)
3, Nicolás Tagliafico, LB (7.5)
6, Lisandro Martínez, CB (6.6) - 19, Nicolás Otamendi 44’ (6.3)
13, Cristian Romero, CB (6.5) - 25, Facundo Medina 70’ (6.5)
4, Gonzalo Montiel, RB (7.0) - 26, Nahuel Molina 58’ (6.7)
15, Nicolás González, LM (6.2) - 5, Leandro Paredes 45’ (6.4)
20, Alexis Mac Allister, CM (6.5)
24, Enzo Fernández, CM (5.4)
7, Rodrigo De Paul, RM (5.9) - 17, Giuliano Simeone 70’ (6.1)
9, Julián Alvarez, ST (6.0) - 2, Marcos Senesi 102’ (6.1)
10, Lionel Messi, ST (C) (6.5)
DT, Lionel Scaloni
Sub ARG
1, Juan Musso, GK
12, Gerónimo Rulli, GK
8, Valentín Barco
11, Giovani Lo Celso
14, Exequiel Palacios
16, Thiago Almada
18, Nico Paz
21, José Manuel López
22, Lautaro Martínez
POS: 65, 35 - TIR: 20, 2 - TPO: 12, 0 - FAL: 21, 25 - AMA: 0, 7 - ROJ: 0, 1 - ESQ: 9, 4 - ATA: 0, 11
Kit ESP J1 C1, P1 C1 - Kit ARG J1 C2, P3 C1 - Kit ARB TorFWC26 R8 C1
JDP ESP Ferran Torres

`;
