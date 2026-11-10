// Plan roślinny na 7 dni (przepisy na 2 porcje) i szablon tygodnia. Ładowany po recipes.js.
(function () {
const i = (n, q, u = "g") => ({ n, q, u });
const T = (...t) => ["Plan 7 dni", "Wegańskie", ...t];

const PLAN_RECIPES = [
  {
    id: "owsianka-orzechy", emoji: "🥣", name: "Owsianka z orzechami i borówkami", servings: 2, time: "15 min",
    desc: "Śniadanie oparte na owsie (źródło metioniny) z orzechami i siemieniem (omega-3). Lizynę dołożysz w obiedzie ze strączkowych.",
    ingredients: [i("Płatki owsiane", 140), i("Mleko sojowe (wzbogacone)", 300, "ml"), i("Woda", 200, "ml"), i("Orzechy włoskie", 40),
      i("Siemię lniane (mielone)", 20), i("Borówki (świeże lub mrożone)", 150), i("Banan", 1, "szt"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Zagotuj wodę z solą, wsyp płatki i gotuj na małym ogniu, mieszając.", time: 420, ing: ["0", "2", "7"] },
      { t: "Wlej mleko sojowe i gotuj jeszcze 2 minuty.", time: 120, ing: ["1"] },
      { t: "Przełóż do misek, posyp orzechami i siemieniem, dodaj borówki i pokrojony banan.", ing: ["3", "4", "5", "6"] }
    ]
  },
  {
    id: "quinoa-ciecierzyca", emoji: "🥗", name: "Quinoa z ciecierzycą i warzywami w sosie tahini", servings: 2, time: "30 min",
    desc: "Quinoa ma zrównoważony profil aminokwasów, a ciecierzyca dokłada lizynę. Sos tahini to wapń i metionina.",
    ingredients: [i("Quinoa (komosa ryżowa)", 120), i("Ciecierzyca z puszki (odsączona)", 400), i("Papryka czerwona", 2, "szt"), i("Cukinia", 1, "szt"),
      i("Szpinak", 100), i("Pasta tahini", 40), i("Sok z cytryny", 30, "ml"), i("Czosnek", 2, "ząbki"), i("Oliwa", 10), i("Woda", 60, "ml"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Przepłucz quinoa, zalej wodą (ok. 250 ml), dodaj sól i gotuj pod przykryciem. Odstaw na 5 minut.", time: 900, ing: ["0", "10"] },
      { t: "Pokrój paprykę i cukinię, podsmaż na patelni na oliwie.", time: 600, ing: ["2", "3", "8"] },
      { t: "Dodaj ciecierzycę i jeden przeciśnięty ząbek czosnku, podgrzewaj.", time: 180, ing: ["1", "7"] },
      { t: "Wymieszaj tahini z sokiem z cytryny, wodą i drugim ząbkiem czosnku na gładki sos.", ing: ["5", "6", "9"] },
      { t: "Połącz quinoa z warzywami i ciecierzycą, dodaj szpinak i polej sosem.", ing: ["4"] }
    ]
  },
  {
    id: "ryz-soczewica", emoji: "🍛", name: "Ryż brązowy z czerwoną soczewicą i brokułami", servings: 2, time: "45 min",
    desc: "Klasyczne połączenie zboża i strączkowych (jak indyjskie dal z ryżem). Drożdże odżywcze wzbogacone o B12 dodają smaku i witamin.",
    ingredients: [i("Ryż brązowy", 140), i("Soczewica czerwona", 120), i("Brokuły", 400), i("Marchew", 2, "szt"), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"),
      i("Kurkuma", 1, "łyżeczka"), i("Drożdże odżywcze (płatki)", 20), i("Olej lniany", 10), i("Oliwa", 10), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ryż w osolonej wodzie do miękkości.", time: 2100, ing: ["0", "10"] },
      { t: "Podsmaż pokrojoną cebulę i czosnek na oliwie.", time: 300, ing: ["4", "5", "9"] },
      { t: "Dodaj soczewicę, kurkumę i 400 ml wody. Gotuj, aż soczewica się rozpadnie.", time: 900, ing: ["1", "6"] },
      { t: "Brokuły i pokrojoną marchew ugotuj na parze.", time: 600, ing: ["2", "3"] },
      { t: "Wymieszaj ryż, soczewicę i warzywa. Posyp drożdżami odżywczymi i skrop olejem lnianym (na zimno).", ing: ["7", "8"] }
    ]
  },
  {
    id: "jaglanka-maliny", emoji: "🍓", name: "Kasza jaglana z malinami i orzechami laskowymi", servings: 2, time: "25 min",
    ingredients: [i("Kasza jaglana", 120), i("Mleko sojowe (wzbogacone)", 300, "ml"), i("Woda", 250, "ml"), i("Maliny (świeże lub mrożone)", 200),
      i("Orzechy laskowe", 40), i("Cynamon", 1, "szczypta"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Przepłucz kaszę gorącą wodą na sitku.", ing: ["0"] },
      { t: "Zagotuj wodę z mlekiem sojowym i solą, wsyp kaszę i gotuj pod przykryciem, mieszając od czasu do czasu.", time: 1200, ing: ["1", "2", "6"] },
      { t: "Przełóż do misek, dodaj maliny, posiekane orzechy i cynamon.", ing: ["3", "4", "5"] }
    ]
  },
  {
    id: "miska-meksykanska", emoji: "🌮", name: "Miska meksykańska z fasolą, ryżem i awokado", servings: 2, time: "35 min",
    desc: "Fasola z ryżem to jedna z klasycznych par komplementarnych (zboże plus strączkowe).",
    ingredients: [i("Ryż jaśminowy", 140), i("Fasola czerwona z puszki (odsączona)", 400), i("Papryka czerwona", 2, "szt"), i("Awokado", 1, "szt"), i("Cebula", 1, "szt"),
      i("Czosnek", 2, "ząbki"), i("Kmin rzymski", 1, "łyżeczka"), i("Sok z cytryny", 30, "ml"), i("Natka pietruszki", 10), i("Oliwa", 15), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ryż w osolonej wodzie.", time: 900, ing: ["0", "10"] },
      { t: "Podsmaż pokrojoną cebulę, paprykę i czosnek na oliwie.", time: 600, ing: ["2", "4", "5", "9"] },
      { t: "Dodaj fasolę i kmin rzymski, podgrzewaj.", time: 300, ing: ["1", "6"] },
      { t: "Podawaj na ryżu z pokrojonym awokado, sokiem z cytryny i natką.", ing: ["3", "7", "8"] }
    ]
  },
  {
    id: "makaron-ciecierzyca", emoji: "🍝", name: "Makaron pełnoziarnisty z ciecierzycą i pomidorami", servings: 2, time: "25 min",
    ingredients: [i("Makaron pełnoziarnisty", 200), i("Ciecierzyca z puszki (odsączona)", 400), i("Pomidory z puszki", 400), i("Cebula", 1, "szt"),
      i("Czosnek", 3, "ząbki"), i("Oliwa", 20), i("Bazylia", 10), i("Drożdże odżywcze (płatki)", 10), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj makaron w osolonej wodzie według instrukcji na opakowaniu.", time: 600, ing: ["0", "8"] },
      { t: "Podsmaż cebulę i czosnek na oliwie.", time: 300, ing: ["3", "4", "5"] },
      { t: "Dodaj pomidory i ciecierzycę, duś na małym ogniu.", time: 600, ing: ["1", "2"] },
      { t: "Wymieszaj z makaronem, dopraw pieprzem, posyp bazylią i drożdżami odżywczymi.", ing: ["6", "7", "9"] }
    ]
  },
  {
    id: "tosty-awokado", emoji: "🥑", name: "Chleb żytni z pastą z awokado, hummusem i pomidorem", servings: 2, time: "10 min",
    ingredients: [i("Chleb żytni razowy", 200), i("Awokado", 1, "szt"), i("Pomidor", 2, "szt"), i("Hummus", 100), i("Pestki dyni", 30),
      i("Sok z cytryny", 15, "ml"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Rozgnieć awokado widelcem z sokiem z cytryny, solą i pieprzem.", ing: ["1", "5", "6", "7"] },
      { t: "Posmaruj chleb hummusem i pastą z awokado.", ing: ["0", "3"] },
      { t: "Dodaj plastry pomidora i posyp pestkami dyni.", ing: ["2", "4"] }
    ]
  },
  {
    id: "groch-gryka", emoji: "🥘", name: "Groch z kaszą gryczaną, burakami i kapustą", servings: 2, time: "55 min",
    desc: "Polska wersja komplementarnego białka: groch (lizyna) i kasza gryczana.",
    ingredients: [i("Groch łuskany", 140), i("Kasza gryczana", 120), i("Buraki", 2, "szt"), i("Kapusta biała", 300), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"),
      i("Majeranek", 1, "łyżeczka"), i("Olej rzepakowy", 20), i("Liść laurowy", 2, "szt"), i("Woda", 600, "ml"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Zagotuj groch z wodą i liściem laurowym, gotuj do miękkości.", time: 2400, ing: ["0", "8", "9"] },
      { t: "Ugotuj kaszę gryczaną w osolonej wodzie (ok. 1:2).", time: 900, ing: ["1", "10"] },
      { t: "Podsmaż cebulę i czosnek na oleju, dodaj poszatkowaną kapustę i starte buraki, duś.", time: 900, ing: ["2", "3", "4", "5", "7"] },
      { t: "Połącz groch z warzywami, dopraw majerankiem i pieprzem. Podawaj z kaszą.", ing: ["6", "11"] }
    ]
  },
  {
    id: "tofu-ryz", emoji: "🍲", name: "Tofu z brązowym ryżem i bok choy", servings: 2, time: "50 min",
    ingredients: [i("Tofu naturalne", 300), i("Ryż brązowy", 140), i("Bok choy", 300), i("Sos sojowy", 30, "ml"), i("Imbir świeży", 10), i("Czosnek", 2, "ząbki"),
      i("Olej rzepakowy", 20), i("Sezam", 10), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj ryż w osolonej wodzie do miękkości.", time: 2100, ing: ["1", "8"] },
      { t: "Pokrój tofu w kostkę i smaż na oleju do zrumienienia.", time: 600, ing: ["0", "6"] },
      { t: "Dodaj starty imbir i czosnek, po minucie bok choy i sos sojowy. Duś.", time: 240, ing: ["2", "3", "4", "5"] },
      { t: "Podawaj na ryżu posypane sezamem.", ing: ["7"] }
    ]
  },
  {
    id: "owsianka-nocna", emoji: "🫐", name: "Owsianka nocna z chia i jagodami", servings: 2, time: "5 min + noc w lodówce",
    ingredients: [i("Płatki owsiane", 120), i("Mleko sojowe (wzbogacone)", 300, "ml"), i("Nasiona chia", 30), i("Jagody (świeże lub mrożone)", 200),
      i("Orzechy włoskie", 40), i("Cynamon", 1, "szczypta")],
    steps: [
      { t: "Wieczorem wymieszaj płatki, chia, mleko i cynamon w słoikach.", ing: ["0", "1", "2", "5"] },
      { t: "Odstaw do lodówki na co najmniej 6 godzin." },
      { t: "Rano dodaj jagody i posiekane orzechy.", ing: ["3", "4"] }
    ]
  },
  {
    id: "soczewica-bulgur", emoji: "🍲", name: "Soczewica zielona z bulgurem i warzywami korzeniowymi", servings: 2, time: "40 min",
    ingredients: [i("Soczewica zielona", 140), i("Bulgur", 120), i("Marchew", 2, "szt"), i("Seler", 150), i("Pietruszka (korzeń)", 100), i("Cebula", 1, "szt"),
      i("Czosnek", 2, "ząbki"), i("Oliwa", 20), i("Kmin rzymski", 1, "łyżeczka"), i("Sok z cytryny", 15, "ml"), i("Natka pietruszki", 10), i("Woda", 500, "ml"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Podsmaż cebulę i czosnek z kminem na oliwie.", time: 300, ing: ["5", "6", "7", "8"] },
      { t: "Dodaj pokrojone warzywa korzeniowe i soczewicę, zalej wodą i gotuj.", time: 1500, ing: ["0", "2", "3", "4", "11", "12"] },
      { t: "Bulgur zalej wrzątkiem, przykryj i odstaw.", time: 600, ing: ["1"] },
      { t: "Wymieszaj, skrop sokiem z cytryny i posyp natką.", ing: ["9", "10"] }
    ]
  },
  {
    id: "fasolka-ziemniaki", emoji: "🥔", name: "Biała fasola z ziemniakami i kapustą", servings: 2, time: "35 min",
    desc: "Tradycyjne polskie smaki z kminkiem i majerankiem. Szczypta oleju lnianego na koniec daje omega-3.",
    ingredients: [i("Fasola biała z puszki (odsączona)", 400), i("Ziemniaki", 500), i("Kapusta biała", 300), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"),
      i("Kminek", 1, "łyżeczka"), i("Majeranek", 1, "łyżeczka"), i("Olej rzepakowy", 20), i("Olej lniany", 10), i("Woda", 300, "ml"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ziemniaki obierz, pokrój w kostkę i ugotuj w osolonej wodzie.", time: 1200, ing: ["1", "10"] },
      { t: "Podsmaż cebulę, czosnek i kminek na oleju rzepakowym.", time: 300, ing: ["3", "4", "5", "7"] },
      { t: "Dodaj poszatkowaną kapustę i wodę, duś pod przykryciem.", time: 900, ing: ["2", "9"] },
      { t: "Dodaj fasolę i majeranek, podgrzewaj. Połącz z ziemniakami, dopraw pieprzem i skrop olejem lnianym.", time: 180, ing: ["0", "6", "8", "11"] }
    ]
  },
  {
    id: "musli-gruszka", emoji: "🍐", name: "Musli z mlekiem migdałowym, gruszką i siemieniem", servings: 2, time: "5 min",
    ingredients: [i("Musli bez cukru", 120), i("Mleko migdałowe (niesłodzone)", 400, "ml"), i("Gruszka", 2, "szt"), i("Siemię lniane (mielone)", 20),
      i("Migdały", 30), i("Pestki słonecznika", 30)],
    steps: [
      { t: "Wsyp musli do misek i zalej mlekiem migdałowym.", ing: ["0", "1"] },
      { t: "Dodaj pokrojoną gruszkę, siemię, posiekane migdały i słonecznik.", ing: ["2", "3", "4", "5"] }
    ]
  },
  {
    id: "buddha-quinoa", emoji: "🥙", name: "Miska Buddha: quinoa, czarna fasola i kukurydza z salsą", servings: 2, time: "30 min",
    ingredients: [i("Quinoa (komosa ryżowa)", 140), i("Czarna fasola z puszki (odsączona)", 400), i("Kukurydza z puszki", 150), i("Pomidory", 300), i("Cebula czerwona", 0.5, "szt"),
      i("Sok z cytryny", 30, "ml"), i("Natka pietruszki", 10), i("Awokado", 1, "szt"), i("Kmin rzymski", 0.5, "łyżeczka"), i("Oliwa", 10), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj quinoa w osolonej wodzie (ok. 280 ml) pod przykryciem.", time: 900, ing: ["0", "10"] },
      { t: "Salsa: pokrój pomidory i cebulę, wymieszaj z sokiem z cytryny, natką i oliwą.", ing: ["3", "4", "5", "6", "9"] },
      { t: "Podgrzej fasolę z kminem i kukurydzą.", time: 240, ing: ["1", "2", "8"] },
      { t: "Ułóż w miskach quinoa, fasolę, salsę i plastry awokado.", ing: ["7"] }
    ]
  },
  {
    id: "beluga-kuskus", emoji: "🎃", name: "Soczewica beluga z kuskusem, dynią i szpinakiem", servings: 2, time: "40 min",
    ingredients: [i("Soczewica beluga", 120), i("Kuskus pełnoziarnisty", 120), i("Dynia", 400), i("Szpinak", 150), i("Cebula", 1, "szt"), i("Czosnek", 2, "ząbki"),
      i("Oliwa", 20), i("Papryka słodka mielona", 1, "łyżeczka"), i("Sok z cytryny", 15, "ml"), i("Woda", 400, "ml"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Ugotuj soczewicę w wodzie do miękkości, odcedź.", time: 1500, ing: ["0", "9"] },
      { t: "Dynię pokrój w kostkę i upiecz lub podsmaż z oliwą i papryką.", time: 1200, ing: ["2", "6", "7"] },
      { t: "Dodaj cebulę i czosnek, na końcu szpinak do zwiędnięcia.", time: 300, ing: ["3", "4", "5"] },
      { t: "Kuskus zalej wrzątkiem, przykryj na 5 minut. Wymieszaj wszystko, dopraw sokiem z cytryny i solą.", time: 300, ing: ["1", "8", "10"] }
    ]
  },
  {
    id: "nalesniki-orkiszowe", emoji: "🥞", name: "Naleśniki orkiszowe z jagodami (bez jajek i mleka)", servings: 2, time: "30 min",
    ingredients: [i("Mąka orkiszowa", 200), i("Mleko sojowe (wzbogacone)", 400, "ml"), i("Woda gazowana", 100, "ml"), i("Olej rzepakowy", 30), i("Mąka ziemniaczana", 20),
      i("Jagody (świeże lub mrożone)", 200), i("Orzechy włoskie", 40), i("Syrop klonowy", 30, "ml"), i("Sól", 1, "szczypta")],
    steps: [
      { t: "Wymieszaj mąki, mleko, wodę, 10 g oleju i sól na gładkie ciasto. Odstaw.", time: 600, ing: ["0", "1", "2", "3", "4", "8"] },
      { t: "Smaż cienkie naleśniki na rozgrzanej patelni, po 1–2 minuty z każdej strony.", time: 900 },
      { t: "Podawaj z jagodami, orzechami i syropem klonowym.", ing: ["5", "6", "7"] }
    ]
  },
  {
    id: "bob-kasza", emoji: "🫛", name: "Bób z kaszą jęczmienną, koperkiem i ogórkiem", servings: 2, time: "40 min",
    ingredients: [i("Bób (obrany)", 400), i("Kasza jęczmienna", 140), i("Ogórek", 2, "szt"), i("Koperek", 20), i("Cebula", 1, "szt"), i("Sok z cytryny", 30, "ml"),
      i("Oliwa", 20), i("Pestki słonecznika", 30), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj kaszę w osolonej wodzie do miękkości.", time: 1500, ing: ["1", "8"] },
      { t: "Bób ugotuj w osolonej wodzie i odcedź.", time: 600, ing: ["0"] },
      { t: "Pokrój ogórek, cebulę i koperek, wymieszaj z oliwą i sokiem z cytryny.", ing: ["2", "3", "4", "5", "6"] },
      { t: "Połącz kaszę z bobem i warzywami, dopraw pieprzem, posyp słonecznikiem.", ing: ["7", "9"] }
    ]
  },
  {
    id: "soba-edamame", emoji: "🍜", name: "Makaron soba z edamame, marchewką i imbirem", servings: 2, time: "25 min",
    ingredients: [i("Makaron soba (gryczany)", 180), i("Edamame (mrożone, bez łupin)", 200), i("Marchew", 2, "szt"), i("Imbir świeży", 15), i("Czosnek", 2, "ząbki"),
      i("Sos sojowy", 40, "ml"), i("Sezam", 15), i("Olej rzepakowy", 15), i("Szczypiorek", 20), i("Sok z cytryny", 15, "ml")],
    steps: [
      { t: "Ugotuj makaron soba według instrukcji, przepłucz zimną wodą.", time: 360, ing: ["0"] },
      { t: "Podsmaż na oleju starty imbir, czosnek i marchew w słupkach.", time: 300, ing: ["2", "3", "4", "7"] },
      { t: "Dodaj edamame i sos sojowy, podgrzewaj.", time: 240, ing: ["1", "5"] },
      { t: "Wymieszaj z makaronem, skrop cytryną i posyp sezamem oraz szczypiorkiem.", ing: ["6", "8", "9"] }
    ]
  },
  {
    id: "kanapki-orzechowe", emoji: "🥜", name: "Chleb orkiszowy z masłem orzechowym, bananem i kakao", servings: 2, time: "10 min",
    ingredients: [i("Chleb orkiszowy", 200), i("Masło orzechowe (100% orzeszków)", 40), i("Banan", 2, "szt"), i("Mleko sojowe (wzbogacone)", 300, "ml"), i("Kakao", 10)],
    steps: [
      { t: "Posmaruj chleb masłem orzechowym i ułóż na nim plasterki banana.", ing: ["0", "1", "2"] },
      { t: "Podgrzej mleko sojowe z kakao i wymieszaj na gorące kakao.", time: 180, ing: ["3", "4"] }
    ]
  },
  {
    id: "gulasz-soczewicowy", emoji: "🍲", name: "Gulasz z soczewicy z ziemniakami i papryką", servings: 2, time: "50 min",
    ingredients: [i("Soczewica zielona", 140), i("Ziemniaki", 500), i("Papryka czerwona", 2, "szt"), i("Cebula", 2, "szt"), i("Czosnek", 3, "ząbki"),
      i("Przecier pomidorowy", 200), i("Papryka wędzona mielona", 2, "łyżeczka"), i("Majeranek", 1, "łyżeczka"), i("Olej rzepakowy", 20), i("Bulion jarski", 500, "ml"),
      i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Podsmaż cebulę i czosnek na oleju, dodaj paprykę wędzoną.", time: 300, ing: ["3", "4", "6", "8"] },
      { t: "Dodaj pokrojoną paprykę, ziemniaki w kostce, soczewicę, przecier i bulion.", ing: ["0", "1", "2", "5", "9"] },
      { t: "Gotuj pod przykryciem do miękkości soczewicy i ziemniaków.", time: 1800 },
      { t: "Dopraw majerankiem, solą i pieprzem.", ing: ["7", "10", "11"] }
    ]
  },
  {
    id: "jablko-migdaly", emoji: "🍏", name: "Jabłko z migdałami i cynamonem", servings: 2, time: "5 min",
    ingredients: [i("Jabłko", 2, "szt"), i("Migdały", 60), i("Cynamon", 1, "szczypta")],
    steps: [
      { t: "Pokrój jabłka na cząstki.", ing: ["0"] },
      { t: "Podawaj z garścią migdałów, posyp cynamonem.", ing: ["1", "2"] }
    ]
  },
  {
    id: "dziki-ryz", emoji: "🍂", name: "Dziki ryż z ciecierzycą, brukselką, żurawiną i orzechami", servings: 2, time: "45 min",
    ingredients: [i("Dziki ryż (mieszanka)", 140), i("Ciecierzyca z puszki (odsączona)", 400), i("Brukselka", 400), i("Żurawina suszona", 30), i("Orzechy włoskie", 40),
      i("Cebula", 1, "szt"), i("Oliwa", 20), i("Sok z cytryny", 15, "ml"), i("Sól", 1, "szczypta"), i("Pieprz", 1, "szczypta")],
    steps: [
      { t: "Ugotuj dziki ryż w osolonej wodzie do miękkości.", time: 2400, ing: ["0", "8"] },
      { t: "Brukselkę przekrój na pół i upiecz lub podsmaż z cebulą na oliwie.", time: 900, ing: ["2", "5", "6"] },
      { t: "Dodaj ciecierzycę i podgrzewaj.", time: 180, ing: ["1"] },
      { t: "Wymieszaj z ryżem, żurawiną i posiekanymi orzechami, skrop cytryną i dopraw pieprzem.", ing: ["3", "4", "7", "9"] }
    ]
  }
];

const PLAN_TAGS = {
  "owsianka-orzechy": T("Śniadania", "Szybkie", "Na co dzień"),
  "quinoa-ciecierzyca": T("Dania główne", "Wysokobiałkowe", "Bliskowschodnia"),
  "ryz-soczewica": T("Dania główne", "Wysokobiałkowe", "Meal prep"),
  "jaglanka-maliny": T("Śniadania", "Lekkie", "Lato"),
  "miska-meksykanska": T("Dania główne", "Meksykańska", "Wysokobiałkowe"),
  "makaron-ciecierzyca": T("Dania główne", "Włoska", "Szybkie"),
  "tosty-awokado": T("Śniadania", "Szybkie"),
  "groch-gryka": T("Dania główne", "Polska", "Bezglutenowe", "Jesień"),
  "tofu-ryz": T("Dania główne", "Azjatycka", "Wysokobiałkowe"),
  "owsianka-nocna": T("Śniadania", "Meal prep", "Szybkie"),
  "soczewica-bulgur": T("Dania główne", "Wysokobiałkowe", "Meal prep", "Zima"),
  "fasolka-ziemniaki": T("Dania główne", "Polska", "Na co dzień"),
  "musli-gruszka": T("Śniadania", "Szybkie", "Jesień"),
  "buddha-quinoa": T("Dania główne", "Meksykańska", "Wysokobiałkowe", "Lato"),
  "beluga-kuskus": T("Dania główne", "Wysokobiałkowe", "Jesień"),
  "nalesniki-orkiszowe": T("Śniadania", "Polska", "Dla dzieci"),
  "bob-kasza": T("Dania główne", "Polska", "Lato"),
  "soba-edamame": T("Dania główne", "Azjatycka", "Szybkie", "Wysokobiałkowe"),
  "kanapki-orzechowe": T("Śniadania", "Szybkie", "Dla dzieci"),
  "gulasz-soczewicowy": T("Dania główne", "Polska", "Meal prep", "Zima"),
  "dziki-ryz": T("Dania główne", "Na przyjęcie", "Wysokobiałkowe", "Jesień"),
  "jablko-migdaly": T("Przekąski", "Szybkie", "Lekkie", "Jesień")
};

RECIPES.push(...PLAN_RECIPES);
Object.assign(DEFAULT_TAGS, PLAN_TAGS);

// Szablon 7 dni: [posiłek, id przepisu]. Hummus (4 porcje) jest przekąską dla jednej osoby.
globalThis.PLAN_WEEK = [
  [["Śniadanie", "owsianka-orzechy"], ["Obiad", "quinoa-ciecierzyca"], ["Kolacja", "ryz-soczewica"], ["Przekąska", "hummus"]],
  [["Śniadanie", "jaglanka-maliny"], ["Obiad", "miska-meksykanska"], ["Kolacja", "makaron-ciecierzyca"], ["Przekąska", "jablko-migdaly"]],
  [["Śniadanie", "tosty-awokado"], ["Obiad", "groch-gryka"], ["Kolacja", "tofu-ryz"], ["Przekąska", "hummus"]],
  [["Śniadanie", "owsianka-nocna"], ["Obiad", "soczewica-bulgur"], ["Kolacja", "fasolka-ziemniaki"], ["Przekąska", "jablko-migdaly"]],
  [["Śniadanie", "musli-gruszka"], ["Obiad", "buddha-quinoa"], ["Kolacja", "beluga-kuskus"], ["Przekąska", "hummus"]],
  [["Śniadanie", "nalesniki-orkiszowe"], ["Obiad", "bob-kasza"], ["Kolacja", "soba-edamame"], ["Przekąska", "jablko-migdaly"]],
  [["Śniadanie", "kanapki-orzechowe"], ["Obiad", "gulasz-soczewicowy"], ["Kolacja", "dziki-ryz"], ["Przekąska", "hummus"]]
];
})();
