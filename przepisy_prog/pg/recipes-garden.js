// Dania główne i sałatki roślinne: najpierw warzywa, zioła i owoce z polskiego ogrodu, resztę dokupujesz w sklepie. Ładowany po recipes-plan.js.
(function () {
const i = (n, q, u = "g") => ({ n, q, u });
const T = (...t) => ["Wegańskie", "Z ogrodu", "World best", ...t];

const GARDEN_RECIPES = [
  // ---------- Dania główne ----------
  {
    id: "ratatouille-jaglana", emoji: "🍆", name: "Ratatouille z kaszą jaglaną i ciecierzycą", servings: 2, time: "50 min",
    desc: "Prowansalskie warzywa duszone w oliwie. Z ogrodu: bakłażan, cukinia, papryka, pomidory, cebula, czosnek, bazylia i tymianek. Ze sklepu: kasza, ciecierzyca.",
    ingredients: [i("Kasza jaglana", 120), i("Bakłażan", 1, "szt"), i("Cukinia", 1, "szt"), i("Papryka czerwona", 1, "szt"), i("Pomidory", 400), i("Cebula", 1, "szt"),
      i("Czosnek", 3, "ząbki"), i("Ciecierzyca z puszki (odsączona)", 240), i("Oliwa", 30), i("Tymianek (suszony)", 1, "łyżeczka"), i("Bazylia (świeża)", 10), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj kaszę jaglaną w osolonej wodzie (1:2) pod przykryciem, odstaw na 5 minut.", time: 1200, ing: ["0", "11"] },
      { t: "Cebulę i czosnek posiekaj i zeszklij na oliwie.", time: 300, ing: ["5", "6", "8"] },
      { t: "Dodaj bakłażana, cukinię i paprykę pokrojone w kostkę, smaż, od czasu do czasu mieszając.", time: 600, ing: ["1", "2", "3"] },
      { t: "Dodaj pokrojone pomidory i tymianek, duś pod przykryciem, aż warzywa będą miękkie.", time: 1200, ing: ["4", "9"] },
      { t: "Wmieszaj ciecierzycę i podgrzewaj. Podawaj z kaszą i świeżą bazylią.", time: 300, ing: ["7", "10"] }
    ]
  },
  {
    id: "golabki-gryka", emoji: "🥬", name: "Gołąbki z kaszą gryczaną i pieczarkami w sosie pomidorowym", servings: 2, time: "1 h 30 min",
    desc: "Polski klasyk bez mięsa. Z ogrodu: kapusta, cebula, czosnek, majeranek. Soczewica w farszu dokłada białka.",
    ingredients: [i("Kapusta biała", 500), i("Kasza gryczana", 120), i("Soczewica czerwona", 60), i("Pieczarki", 200), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"),
      i("Pomidory z puszki", 400), i("Oliwa", 20), i("Majeranek", 1, "łyżeczka"), i("Liść laurowy", 2, "szt"), i("Sól", 1, "łyżeczka"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Wytnij głąb kapusty, zanurz główkę w osolonym wrzątku i ściągaj miękkie liście (potrzeba 8). Gotuj kilka minut.", time: 600, ing: ["0", "10"] },
      { t: "Ugotuj kaszę z soczewicą w 400 ml osolonej wody pod przykryciem.", time: 900, ing: ["1", "2"] },
      { t: "Podsmaż cebulę, czosnek i posiekane pieczarki na oliwie.", time: 480, ing: ["3", "4", "5", "7"] },
      { t: "Połącz z kaszą, dopraw majerankiem i pieprzem.", ing: ["8", "11"] },
      { t: "Zawiń porcje farszu w liście kapusty i ułóż w garnku wyłożonym pozostałymi liśćmi." },
      { t: "Zalej pomidorami z liściem laurowym i 100 ml wody. Duś pod przykryciem na małym ogniu.", time: 2400, ing: ["6", "9"] }
    ]
  },
  {
    id: "placki-sos-grzybowy", emoji: "🥞", name: "Placki ziemniaczane z sosem grzybowym i kiszoną kapustą", servings: 2, time: "50 min",
    desc: "Chrupiące placki bez jajek. Z ogrodu: ziemniaki, cebula, koperek, kiszona kapusta. Sos z mleka sojowego i drożdży odżywczych daje białko i smak.",
    ingredients: [i("Ziemniaki", 600), i("Cebula", 2, "szt"), i("Mąka pszenna (do placków)", 50), i("Olej rzepakowy", 30), i("Pieczarki", 300), i("Mąka pszenna (do sosu)", 10),
      i("Mleko sojowe (wzbogacone)", 250, "ml"), i("Drożdże odżywcze (płatki)", 10), i("Kapusta kiszona", 200), i("Koperek", 10), i("Sól", 1, "łyżeczka"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Zetrzyj ziemniaki i jedną cebulę na drobnej tarce, odciśnij sok. Wymieszaj z mąką i połową soli.", ing: ["0", "1", "2", "10"] },
      { t: "Smaż małe placki na rozgrzanym oleju, po 3–4 minuty z każdej strony, aż się zarumienią.", time: 900, ing: ["3"] },
      { t: "Na osobnej patelni podsmaż drugą cebulę w piórkach z pokrojonymi pieczarkami.", time: 480, ing: ["1", "4"] },
      { t: "Posyp mąką, wlej mleko sojowe i gotuj, mieszając, do zgęstnienia. Dodaj drożdże odżywcze i pieprz.", time: 300, ing: ["5", "6", "7", "11"] },
      { t: "Podawaj placki z sosem, kiszoną kapustą i koperkiem.", ing: ["8", "9"] }
    ]
  },
  {
    id: "curry-dyniowe", emoji: "🍛", name: "Curry z dyni i ciecierzycy z mlekiem kokosowym", servings: 2, time: "40 min",
    desc: "Aromatyczne, kremowe curry w stylu indyjskim. Z ogrodu: dynia, cebula, czosnek, szpinak. Ze sklepu: mleko kokosowe, przyprawy, ryż.",
    ingredients: [i("Dynia hokkaido", 500), i("Ciecierzyca z puszki (odsączona)", 300), i("Mleko kokosowe", 150, "ml"), i("Cebula", 1, "szt"), i("Czosnek", 3, "ząbki"),
      i("Imbir (świeży)", 15), i("Kurkuma", 1, "łyżeczka"), i("Kmin rzymski", 1, "łyżeczka"), i("Chili mielone", 0.5, "łyżeczka"), i("Szpinak", 100), i("Ryż basmati", 120),
      i("Oliwa", 10), i("Sok z cytryny", 20, "ml"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ryż basmati w osolonej wodzie.", time: 720, ing: ["10", "13"] },
      { t: "Zeszklij cebulę z czosnkiem i startym imbirem na oliwie.", time: 240, ing: ["3", "4", "5", "11"] },
      { t: "Dodaj kurkumę, kmin i chili, smaż minutę.", time: 60, ing: ["6", "7", "8"] },
      { t: "Dodaj dynię w kostce, mleko kokosowe i 150 ml wody. Duś pod przykryciem, aż dynia zmięknie.", time: 900, ing: ["0", "2"] },
      { t: "Wmieszaj ciecierzycę i szpinak, podgrzewaj, aż szpinak zwiędnie.", time: 300, ing: ["1", "9"] },
      { t: "Dopraw sokiem z cytryny i podawaj z ryżem.", ing: ["12"] }
    ]
  },
  {
    id: "korzeniowe-tahini", emoji: "🥕", name: "Pieczone warzywa korzeniowe z zieloną soczewicą i sosem tahini", servings: 2, time: "55 min",
    desc: "Słodkie, karmelizowane warzywa i sycąca soczewica. Z ogrodu: marchew, pasternak, burak, czosnek, natka. Ze sklepu: soczewica, tahini, pestki dyni.",
    ingredients: [i("Marchew", 4, "szt"), i("Pasternak", 200), i("Burak", 2, "szt"), i("Soczewica zielona", 100), i("Oliwa", 20), i("Kmin rzymski", 1, "łyżeczka"), i("Pasta tahini", 30),
      i("Sok z cytryny", 30, "ml"), i("Czosnek", 1, "ząbek"), i("Woda", 50, "ml"), i("Pestki dyni", 30), i("Natka pietruszki", 15), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Piekarnik rozgrzej do 200°C. Pokrój marchew, pasternak i buraki w słupki, wymieszaj z oliwą, kminem i solą. Piecz.", time: 2400, ing: ["0", "1", "2", "4", "5", "12"] },
      { t: "W tym czasie ugotuj soczewicę w niesolonej wodzie do miękkości i odcedź.", time: 1500, ing: ["3"] },
      { t: "Wymieszaj tahini z sokiem z cytryny, przeciśniętym czosnkiem i wodą na gładki sos.", ing: ["6", "7", "8", "9"] },
      { t: "Pestki dyni uprażyć na suchej patelni.", time: 180, ing: ["10"] },
      { t: "Ułóż soczewicę i warzywa na talerzach, polej sosem, posyp pestkami i natką.", ing: ["11"] }
    ]
  },
  {
    id: "szakszuka-tofu", emoji: "🍳", name: "Szakszuka z ciecierzycą i tofu", servings: 2, time: "35 min",
    desc: "Bliskowschodnie śniadanie lub obiad w jednej patelni, bez jajek. Z ogrodu: papryka, pomidory, cebula, czosnek, natka. Pokruszone tofu zastępuje jajka.",
    ingredients: [i("Cebula", 1, "szt"), i("Papryka czerwona", 2, "szt"), i("Czosnek", 3, "ząbki"), i("Oliwa", 20), i("Kmin rzymski", 1, "łyżeczka"), i("Papryka wędzona mielona", 2, "łyżeczka"),
      i("Chili mielone", 0.5, "łyżeczka"), i("Pomidory", 600), i("Ciecierzyca z puszki (odsączona)", 240), i("Tofu naturalne", 200), i("Natka pietruszki", 15), i("Chleb pełnoziarnisty", 100), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Cebulę i paprykę pokrój i smaż na oliwie na dużej patelni.", time: 480, ing: ["0", "1", "3"] },
      { t: "Dodaj czosnek, kmin, wędzoną paprykę i chili, smaż minutę.", time: 60, ing: ["2", "4", "5", "6"] },
      { t: "Dodaj pokrojone pomidory, ciecierzycę i sól. Gotuj, aż sos zgęstnieje.", time: 900, ing: ["7", "8", "12"] },
      { t: "Pokrusz tofu do sosu jak jajecznicę i podgrzewaj.", time: 300, ing: ["9"] },
      { t: "Posyp natką i podawaj prosto z patelni z chlebem.", ing: ["10", "11"] }
    ]
  },
  {
    id: "bolognese-soczewica", emoji: "🍝", name: "Spaghetti bolognese z soczewicy i warzyw", servings: 2, time: "50 min",
    desc: "Wersja ulubionego dania bez mięsa, z sosem o mięsnej strukturze. Z ogrodu: marchew, seler, cebula, czosnek, pomidory, bazylia, oregano.",
    ingredients: [i("Makaron spaghetti pełnoziarnisty", 160), i("Soczewica brązowa", 100), i("Marchew", 2, "szt"), i("Seler naciowy", 100), i("Cebula", 1, "szt"), i("Czosnek", 3, "ząbki"),
      i("Oliwa", 20), i("Pomidory z puszki", 400), i("Wino czerwone", 100, "ml"), i("Oregano", 1, "łyżeczka"), i("Bazylia (świeża)", 10), i("Drożdże odżywcze (płatki)", 15), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Marchew, seler i cebulę posiekaj drobno i smaż na oliwie.", time: 480, ing: ["2", "3", "4", "6"] },
      { t: "Dodaj czosnek i wino, gotuj, aż prawie odparuje.", time: 120, ing: ["5", "8"] },
      { t: "Dodaj soczewicę, pomidory, oregano, sól i 300 ml wody. Gotuj pod przykryciem, aż soczewica będzie miękka.", time: 1800, ing: ["1", "7", "9", "12"] },
      { t: "Ugotuj makaron al dente.", time: 600, ing: ["0"] },
      { t: "Dopraw sos pieprzem i drożdżami odżywczymi. Podawaj z makaronem i bazylią.", ing: ["10", "11", "13"] }
    ]
  },
  {
    id: "burgery-fasola-burak", emoji: "🍔", name: "Burgery z czerwonej fasoli i buraka z pieczonymi ziemniakami", servings: 2, time: "55 min",
    desc: "Soczyste kotlety o głębokim smaku. Z ogrodu: buraki, ziemniaki, cebula, czosnek, majeranek, kapusta i marchew na surówkę.",
    ingredients: [i("Fasola czerwona z puszki (odsączona)", 400), i("Buraki ugotowane", 2, "szt"), i("Płatki owsiane", 60), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"), i("Kmin rzymski", 1, "łyżeczka"),
      i("Majeranek", 1, "łyżeczka"), i("Sos sojowy", 1, "łyżka"), i("Olej rzepakowy", 15), i("Ziemniaki", 400), i("Oliwa", 15), i("Kapusta biała", 200), i("Marchew", 1, "szt"),
      i("Sok z cytryny", 15, "ml"), i("Musztarda", 1, "łyżka"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Piekarnik rozgrzej do 200°C. Ziemniaki pokrój w ćwiartki, wymieszaj z oliwą i solą, piecz.", time: 2100, ing: ["9", "10", "15"] },
      { t: "Fasolę rozgnieć widelcem, dodaj starty burak, płatki, posiekaną cebulę, czosnek, kmin, majeranek i sos sojowy. Odstaw, by masa stężała.", time: 600, ing: ["0", "1", "2", "3", "4", "5", "6", "7"] },
      { t: "Uformuj 4 burgery i smaż na oleju z obu stron na złoty kolor.", time: 600, ing: ["8"] },
      { t: "Wymieszaj szatkowaną kapustę i marchew z sokiem z cytryny i musztardą na surówkę. Podawaj z burgerami i ziemniakami.", ing: ["11", "12", "13", "14"] }
    ]
  },
  {
    id: "risotto-dynia-groszek", emoji: "🎃", name: "Risotto z dyni z groszkiem, szałwią i prażonymi orzechami", servings: 2, time: "40 min",
    desc: "Kremowe risotto bez nabiału. Z ogrodu: dynia, cebula, czosnek, groszek, szałwia. Drożdże odżywcze zastępują parmezan.",
    ingredients: [i("Ryż arborio", 140), i("Dynia hokkaido", 400), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"), i("Oliwa", 25), i("Wino białe", 100, "ml"), i("Bulion jarski", 800, "ml"),
      i("Groszek zielony", 200), i("Szałwia suszona", 1, "łyżeczka"), i("Drożdże odżywcze (płatki)", 20), i("Orzechy włoskie", 30), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Dynię pokrój w kostkę 1 cm. Bulion podgrzej i trzymaj na małym ogniu.", ing: ["1", "6"] },
      { t: "Zeszklij cebulę i czosnek na oliwie.", time: 180, ing: ["2", "3", "4"] },
      { t: "Wsyp ryż i smaż, aż stanie się szklisty.", time: 120, ing: ["0"] },
      { t: "Wlej wino i poczekaj, aż się wchłonie.", time: 120, ing: ["5"] },
      { t: "Dolewaj bulion po chochli, często mieszaj. Dodaj dynię, szałwię i sól.", time: 1200, ing: ["1", "6", "8", "11"] },
      { t: "Na 3 minuty przed końcem dodaj groszek. Uprażyć orzechy na suchej patelni.", time: 180, ing: ["7", "10"] },
      { t: "Wmieszaj drożdże odżywcze i pieprz. Podawaj z orzechami.", ing: ["9", "12"] }
    ]
  },
  {
    id: "leczo-fasola-kasza", emoji: "🌶️", name: "Leczo z białą fasolą i wędzonym tofu z kaszą gryczaną", servings: 2, time: "50 min",
    desc: "Letnie leczo bez mięsa, z wędzonym tofu zamiast kiełbasy. Z ogrodu: papryka, cukinia, pomidory, cebula, czosnek, majeranek.",
    ingredients: [i("Papryka czerwona", 3, "szt"), i("Cukinia", 1, "szt"), i("Pomidory", 500), i("Cebula", 2, "szt"), i("Czosnek", 3, "ząbki"), i("Fasola biała z puszki (odsączona)", 300),
      i("Tofu wędzone", 150), i("Olej rzepakowy", 20), i("Papryka wędzona mielona", 2, "łyżeczka"), i("Majeranek", 1, "łyżeczka"), i("Kasza gryczana", 100), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj kaszę gryczaną w osolonej wodzie pod przykryciem.", time: 900, ing: ["10", "11"] },
      { t: "Cebulę w piórkach zeszklij na oleju, dodaj tofu w kostce i podsmaż.", time: 600, ing: ["3", "6", "7"] },
      { t: "Dodaj paprykę i cukinię pokrojone w paski i smaż.", time: 600, ing: ["0", "1"] },
      { t: "Dodaj czosnek, wędzoną paprykę i pokrojone pomidory. Duś pod przykryciem.", time: 900, ing: ["2", "4", "8"] },
      { t: "Wmieszaj fasolę, majeranek i pieprz, podgrzewaj. Podawaj z kaszą.", time: 300, ing: ["5", "9", "12"] }
    ]
  },

  // ---------- Sałatki ----------
  {
    id: "salatka-grecka-tofu", emoji: "🥒", name: "Sałatka grecka z marynowanym tofu i oliwkami", servings: 2, time: "20 min",
    desc: "Klasyka śródziemnomorska z tofu w roli fety. Z ogrodu: ogórek, pomidory, cebula, papryka, czosnek, oregano.",
    ingredients: [i("Tofu naturalne", 200), i("Sok z cytryny", 20, "ml"), i("Oregano", 1, "łyżeczka"), i("Czosnek", 1, "ząbek"), i("Ogórek", 1, "szt"), i("Pomidory", 400),
      i("Cebula czerwona", 1, "szt"), i("Papryka zielona", 1, "szt"), i("Oliwki czarne", 60), i("Oliwa", 30), i("Chleb pełnoziarnisty", 80), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Pokrusz tofu w kostki, zamarynuj w soku z cytryny, połowie oliwy, oregano, przeciśniętym czosnku i soli.", time: 600, ing: ["0", "1", "2", "3", "9", "11"] },
      { t: "Pokrój ogórek, pomidory, cebulę i paprykę w grube kawałki.", ing: ["4", "5", "6", "7"] },
      { t: "Połącz warzywa z oliwkami i tofu z marynatą, polej resztą oliwy. Podawaj z chlebem.", ing: ["8", "9", "10"] }
    ]
  },
  {
    id: "coleslaw-ciecierzyca", emoji: "🥗", name: "Colesław z jabłkiem, orzechami i pieczoną ciecierzycą", servings: 2, time: "35 min",
    desc: "Chrupiąca surówka z kremowym sosem. Z ogrodu: kapusta, marchew, jabłko, orzechy włoskie. Chrupiąca ciecierzyca zamienia ją w pełny posiłek.",
    ingredients: [i("Ciecierzyca z puszki (odsączona)", 240), i("Papryka wędzona mielona", 1, "łyżeczka"), i("Olej rzepakowy", 15), i("Kapusta biała", 300), i("Marchew", 2, "szt"), i("Jabłko", 1, "szt"),
      i("Orzechy włoskie", 40), i("Jogurt sojowy naturalny", 100), i("Musztarda", 1, "łyżka"), i("Sok z cytryny", 15, "ml"), i("Syrop klonowy", 1, "łyżka"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Piekarnik rozgrzej do 200°C. Osuszoną ciecierzycę wymieszaj z olejem i wędzoną papryką, piecz do chrupkości.", time: 1500, ing: ["0", "1", "2"] },
      { t: "Poszatkuj kapustę, posól i ugnieć rękami, aż zmięknie.", ing: ["3", "11"] },
      { t: "Dodaj starte marchewki i jabłko.", ing: ["4", "5"] },
      { t: "Wymieszaj jogurt z musztardą, sokiem z cytryny i syropem klonowym. Połącz z surówką.", ing: ["7", "8", "9", "10"] },
      { t: "Posyp orzechami i pieczoną ciecierzycą tuż przed podaniem.", ing: ["6", "0"] }
    ]
  },
  {
    id: "salatka-buraki-soczewica", emoji: "🟣", name: "Sałatka z pieczonych buraków, soczewicy i rukoli z orzechami", servings: 2, time: "1 h 10 min",
    desc: "Słodkie buraki, ziemista soczewica i pikantna rukola. Z ogrodu: buraki, rukola, cebula. Ze sklepu: soczewica, orzechy.",
    ingredients: [i("Buraki", 400), i("Soczewica zielona", 80), i("Rukola", 60), i("Orzechy włoskie", 40), i("Cebula czerwona", 0.5, "szt"), i("Oliwa", 20), i("Sok z cytryny", 30, "ml"),
      i("Musztarda", 1, "łyżeczka"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Buraki owiń w folię i piecz w 200°C, aż będą miękkie. Ostudź, obierz i pokrój w cząstki.", time: 3000, ing: ["0"] },
      { t: "Ugotuj soczewicę w osolonej wodzie do miękkości, odcedź.", time: 1200, ing: ["1", "8"] },
      { t: "Wymieszaj oliwę z sokiem z cytryny i musztardą.", ing: ["5", "6", "7"] },
      { t: "Połącz buraki, soczewicę i cebulę w piórkach z sosem. Dodaj rukolę i orzechy.", ing: ["0", "1", "4", "2", "3"] }
    ]
  },
  {
    id: "salatka-ziemniaczana-tofu", emoji: "🥔", name: "Sałatka ziemniaczana z wędzonym tofu, groszkiem i ogórkiem kiszonym", servings: 2, time: "40 min",
    desc: "Polska sałatka na ciepło lub zimno. Z ogrodu: młode ziemniaki, groszek, ogórek kiszony, cebula, koperek, szczypiorek.",
    ingredients: [i("Ziemniaki młode", 600), i("Tofu wędzone", 150), i("Groszek zielony", 150), i("Ogórek kiszony", 150), i("Cebula czerwona", 1, "szt"), i("Koperek", 15), i("Szczypiorek", 15),
      i("Jogurt sojowy naturalny", 100), i("Musztarda", 1, "łyżka"), i("Olej rzepakowy", 20), i("Ocet jabłkowy", 1, "łyżka"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ziemniaki w osolonej wodzie, ostudź i pokrój w kostkę.", time: 1200, ing: ["0", "11"] },
      { t: "Ugotuj groszek, odcedź.", time: 180, ing: ["2"] },
      { t: "Pokrojone tofu podsmaż na oleju na złoto.", time: 300, ing: ["1", "9"] },
      { t: "Wymieszaj jogurt z musztardą, octem i pieprzem.", ing: ["7", "8", "10", "12"] },
      { t: "Połącz wszystko z pokrojonym ogórkiem, cebulą, koperkiem i szczypiorkiem.", ing: ["3", "4", "5", "6"] }
    ]
  },
  {
    id: "tabbouleh-ciecierzyca", emoji: "🌿", name: "Tabbouleh z pietruszką, miętą i ciecierzycą", servings: 2, time: "30 min",
    desc: "Libańska sałatka, w której najwięcej jest ziół. Z ogrodu: pietruszka, mięta, pomidory, ogórek, szczypiorek. Bulgur i ciecierzyca dają energię i białko.",
    ingredients: [i("Bulgur", 100), i("Pietruszka (natka)", 100), i("Pomidory", 400), i("Ogórek", 1, "szt"), i("Szczypiorek", 30), i("Mięta", 15), i("Sok z cytryny", 60, "ml"),
      i("Oliwa", 30), i("Ciecierzyca z puszki (odsączona)", 240), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Zalej bulgur wrzątkiem (ok. 150 ml), przykryj i odstaw do napęcznienia.", time: 900, ing: ["0"] },
      { t: "Drobno posiekaj pietruszkę, miętę i szczypiorek. Pomidory i ogórek pokrój w kostkę.", ing: ["1", "5", "4", "2", "3"] },
      { t: "Wymieszaj bulgur z warzywami, ziołami i ciecierzycą. Dopraw sokiem z cytryny, oliwą i solą.", ing: ["0", "8", "6", "7", "9"] }
    ]
  },
  {
    id: "salatka-dynia-jarmuz", emoji: "🍂", name: "Sałatka z pieczonej dyni, jarmużu i ciecierzycy z sosem tahini", servings: 2, time: "40 min",
    desc: "Jesienna sałatka na ciepło. Z ogrodu: dynia, jarmuż. Pestki dyni, żurawina i tahini dodają tekstury i wapnia.",
    ingredients: [i("Dynia hokkaido", 400), i("Ciecierzyca z puszki (odsączona)", 240), i("Oliwa", 25), i("Kmin rzymski", 1, "łyżeczka"), i("Jarmuż", 100), i("Sok z cytryny", 20, "ml"),
      i("Pasta tahini", 20), i("Syrop klonowy", 1, "łyżka"), i("Żurawina suszona", 20), i("Pestki dyni", 30), i("Woda", 30, "ml"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Piekarnik rozgrzej do 200°C. Dynię w kostce i ciecierzycę wymieszaj z oliwą, kminem i solą. Piecz.", time: 1500, ing: ["0", "1", "2", "3", "11"] },
      { t: "Jarmuż bez twardych łodyg porwij na kawałki, natrzyj sokiem z cytryny i szczyptą soli, masuj.", time: 120, ing: ["4", "5"] },
      { t: "Wymieszaj tahini z syropem klonowym i wodą na gładki sos.", ing: ["6", "7", "10"] },
      { t: "Uprażyć pestki dyni na suchej patelni.", time: 180, ing: ["9"] },
      { t: "Połącz jarmuż z ciepłą dynią i ciecierzycą, polej sosem, posyp pestkami i żurawiną.", ing: ["8"] }
    ]
  },
  {
    id: "mizeria-bob", emoji: "🥒", name: "Mizeria z jogurtem sojowym, młodymi ziemniakami i bobem", servings: 2, time: "35 min",
    desc: "Najpolskiejsza sałatka w wersji na obiad. Z ogrodu: ogórki, koperek, szczypiorek, młode ziemniaki, bób, czosnek.",
    ingredients: [i("Ogórek", 2, "szt"), i("Jogurt sojowy naturalny", 200), i("Koperek", 15), i("Ziemniaki młode", 400), i("Bób (obrany)", 300), i("Szczypiorek", 15),
      i("Olej rzepakowy", 15), i("Sok z cytryny", 15, "ml"), i("Czosnek", 1, "ząbek"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ziemniaki w osolonej wodzie, ostudź i pokrój.", time: 1200, ing: ["3", "9"] },
      { t: "Ugotuj bób, odcedź i zdejmij łupinki.", time: 300, ing: ["4"] },
      { t: "Ogórki pokrój w cienkie plastry i lekko posól.", ing: ["0"] },
      { t: "Wymieszaj jogurt z koperkiem, czosnkiem, sokiem z cytryny, olejem i pieprzem.", ing: ["1", "2", "8", "7", "6", "10"] },
      { t: "Połącz ogórki, ziemniaki i bób z sosem, posyp szczypiorkiem.", ing: ["5"] }
    ]
  },
  {
    id: "salatka-nicejska", emoji: "🫒", name: "Sałatka nicejska z fasolką szparagową, ziemniakami i wędzonym tofu", servings: 2, time: "35 min",
    desc: "Francuska klasyka z południa. Z ogrodu: fasolka szparagowa, młode ziemniaki, pomidory, cebula, sałata, natka. Tofu zastępuje tuńczyka.",
    ingredients: [i("Ziemniaki młode", 400), i("Fasolka szparagowa", 300), i("Tofu wędzone", 150), i("Pomidory", 300), i("Oliwki czarne", 50), i("Cebula czerwona", 1, "szt"), i("Sałata", 100),
      i("Oliwa", 30), i("Musztarda", 1, "łyżeczka"), i("Ocet winny", 1, "łyżka"), i("Natka pietruszki", 10), i("Czosnek", 1, "ząbek"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ziemniaki w osolonej wodzie, w ostatnich 5 minutach dorzuć fasolkę. Odcedź i ostudź.", time: 1200, ing: ["0", "1", "12"] },
      { t: "Pokrojone w plastry tofu opiecz na łyżce oliwy.", time: 300, ing: ["2", "7"] },
      { t: "Wymieszaj resztę oliwy z musztardą, octem i przeciśniętym czosnkiem.", ing: ["7", "8", "9", "11"] },
      { t: "Na liściach sałaty ułóż ziemniaki, fasolkę, pomidory, cebulę, oliwki i tofu. Polej sosem i posyp natką.", ing: ["6", "3", "5", "4", "10"] }
    ]
  },
  {
    id: "salatka-soczewica-rzodkiewka", emoji: "🌱", name: "Sałatka z zieloną soczewicą, rzodkiewką i ogórkiem", servings: 2, time: "30 min",
    desc: "Francuska sałatka z soczewicą Puy. Z ogrodu: rzodkiewka, ogórek, cebula, koperek, natka. Pestki słonecznika dodają chrupkości i witaminy E.",
    ingredients: [i("Soczewica zielona", 140), i("Rzodkiewka", 150), i("Ogórek", 1, "szt"), i("Cebula czerwona", 1, "szt"), i("Koperek", 15), i("Natka pietruszki", 15), i("Pestki słonecznika", 30),
      i("Oliwa", 30), i("Musztarda", 1, "łyżka"), i("Ocet jabłkowy", 20, "ml"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj soczewicę w niesolonej wodzie do miękkości, ale nierozpadającej się. Odcedź i ostudź.", time: 1500, ing: ["0"] },
      { t: "Pokrój rzodkiewki, ogórek i cebulę, posiekaj zioła.", ing: ["1", "2", "3", "4", "5"] },
      { t: "Wymieszaj oliwę z musztardą, octem, solą i pieprzem.", ing: ["7", "8", "9", "10", "11"] },
      { t: "Połącz soczewicę z warzywami i sosem, posyp prażonym słonecznikiem.", ing: ["6"] }
    ]
  },
  {
    id: "salatka-azjatycka-soba", emoji: "🥢", name: "Sałatka azjatycka z kapustą pekińską, soba i edamame", servings: 2, time: "25 min",
    desc: "Chrupiąca i sycąca sałatka z sosem sojowo-imbirowym. Z ogrodu: kapusta pekińska, marchew, ogórek, szczypiorek, czosnek.",
    ingredients: [i("Makaron soba", 100), i("Edamame (mrożone, łuskane)", 150), i("Kapusta pekińska", 300), i("Marchew", 2, "szt"), i("Ogórek", 1, "szt"), i("Sezam", 15), i("Sos sojowy", 30, "ml"),
      i("Sok z cytryny", 20, "ml"), i("Olej rzepakowy", 15), i("Imbir (świeży)", 10), i("Czosnek", 1, "ząbek"), i("Syrop klonowy", 1, "łyżeczka"), i("Szczypiorek", 15), i("Chili mielone", 0.5, "łyżeczka")],
    steps: [
      { t: "Ugotuj makaron soba z edamame, odcedź i przepłucz zimną wodą.", time: 300, ing: ["0", "1"] },
      { t: "Sezam uprażyć na suchej patelni.", time: 120, ing: ["5"] },
      { t: "Wymieszaj sos sojowy, sok z cytryny, olej, starty imbir, czosnek, syrop klonowy i chili.", ing: ["6", "7", "8", "9", "10", "11", "13"] },
      { t: "Poszatkuj kapustę, marchew w słupki i ogórek w plasterki. Połącz z makaronem i sosem, posyp sezamem i szczypiorkiem.", ing: ["2", "3", "4", "12"] }
    ]
  }
];

const GARDEN_TAGS = {
  "ratatouille-jaglana": T("Dania główne", "Francuska", "Lato", "Wysokobiałkowe"),
  "golabki-gryka": T("Dania główne", "Polska", "Jesień", "Wysokobiałkowe"),
  "placki-sos-grzybowy": T("Dania główne", "Polska", "Jesień"),
  "curry-dyniowe": T("Dania główne", "Indyjska", "Jesień", "Bezglutenowe"),
  "korzeniowe-tahini": T("Dania główne", "Bliskowschodnia", "Jesień", "Zima", "Wysokobiałkowe"),
  "szakszuka-tofu": T("Dania główne", "Bliskowschodnia", "Lato", "Wysokobiałkowe", "Szybkie"),
  "bolognese-soczewica": T("Dania główne", "Włoska", "Wysokobiałkowe", "Meal prep"),
  "burgery-fasola-burak": T("Dania główne", "Dla dzieci", "Wysokobiałkowe"),
  "risotto-dynia-groszek": T("Dania główne", "Włoska", "Jesień", "Na przyjęcie"),
  "leczo-fasola-kasza": T("Dania główne", "Polska", "Lato", "Wysokobiałkowe", "Meal prep"),
  "salatka-grecka-tofu": T("Sałatki", "Grecka", "Lato", "Szybkie", "Wysokobiałkowe"),
  "coleslaw-ciecierzyca": T("Sałatki", "Jesień", "Zima"),
  "salatka-buraki-soczewica": T("Sałatki", "Polska", "Jesień", "Bezglutenowe"),
  "salatka-ziemniaczana-tofu": T("Sałatki", "Polska", "Lato", "Wysokobiałkowe", "Meal prep"),
  "tabbouleh-ciecierzyca": T("Sałatki", "Bliskowschodnia", "Lato"),
  "salatka-dynia-jarmuz": T("Sałatki", "Jesień", "Bezglutenowe"),
  "mizeria-bob": T("Sałatki", "Polska", "Lato", "Wysokobiałkowe", "Bezglutenowe"),
  "salatka-nicejska": T("Sałatki", "Francuska", "Lato", "Wysokobiałkowe", "Bezglutenowe"),
  "salatka-soczewica-rzodkiewka": T("Sałatki", "Francuska", "Wiosna", "Lato", "Wysokobiałkowe", "Bezglutenowe"),
  "salatka-azjatycka-soba": T("Sałatki", "Azjatycka", "Szybkie", "Wysokobiałkowe")
};

RECIPES.push(...GARDEN_RECIPES);
Object.assign(DEFAULT_TAGS, GARDEN_TAGS);
})();
