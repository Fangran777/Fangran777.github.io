"use strict";
// Treść poradnika "Dieta roślinna na 7 dni". Same dane (bez logiki), żeby łatwo je edytować.
globalThis.GUIDE = {
  title: "Dieta roślinna: 7 dni z białkiem z roślin",
  lead: "Praktyczny poradnik dla osób, które chcą jeść więcej roślin i nie wiedzą, od czego zacząć. Gotowy plan na tydzień, lista zakupów jednym kliknięciem i krótkie wyjaśnienia, co naprawdę ma znaczenie.",
  disclaimer: "To materiał edukacyjny, a nie porada medyczna. Przy ciąży, karmieniu piersią, chorobach nerek, cukrzycy, zaburzeniach odżywiania, lekach na stałe oraz dla dzieci i młodzieży zmianę diety omów z lekarzem lub dietetykiem.",

  rules: [
    { h: "Co dzień strączki", p: "Soczewica, ciecierzyca, fasola, groch, tofu lub edamame w co najmniej dwóch posiłkach. To podstawowe źródło białka, żelaza, cynku i błonnika." },
    { h: "Pełne ziarna zamiast białych", p: "Kasze, brązowy ryż, płatki owsiane, chleb razowy, makaron pełnoziarnisty. Zboża dopełniają aminokwasy ze strączków." },
    { h: "Warzywa w każdym posiłku", p: "Połowa talerza to warzywa, najlepiej w kilku kolorach. Do tego codziennie owoce, w tym jagodowe." },
    { h: "Garść orzechów i nasion", p: "Orzechy włoskie, migdały, pestki dyni, sezam, siemię lniane. Dają zdrowe tłuszcze, magnez, cynk i kwasy omega-3 (ALA)." },
    { h: "Suplementuj to, czego brakuje", p: "Witamina B12 jest niezbędna przy diecie w pełni roślinnej. Jesienią i zimą w Polsce także witamina D. Szczegóły poniżej." },
    { h: "Zmieniaj stopniowo", p: "Błonnika i strączków przybywa z tygodnia na tydzień, a nie z dnia na dzień. Pij dużo wody, a organizm dostosuje się w 2–3 tygodnie." }
  ],

  plate: [
    { h: "1/2 talerza", p: "Warzywa i owoce: surowe, duszone, pieczone." },
    { h: "1/4 talerza", p: "Strączki lub tofu: główne źródło białka." },
    { h: "1/4 talerza", p: "Pełne ziarna lub ziemniaki: energia i dopełnienie aminokwasów." },
    { h: "Do tego", p: "Łyżka dobrego tłuszczu (oliwa, olej lniany lub rzepakowy), garść orzechów lub nasion, przyprawy i zioła." }
  ],

  pairs: [
    ["Ryż lub kasza", "soczewica, fasola", "ryż z soczewicą"],
    ["Pieczywo razowe", "hummus, pasta z fasoli", "tosty z awokado i hummusem"],
    ["Makaron pełnoziarnisty", "ciecierzyca, groszek", "makaron z sosem z ciecierzycy"],
    ["Płatki owsiane", "mleko sojowe, orzechy", "owsianka z orzechami"],
    ["Kuskus lub bulgur", "soczewica, ciecierzyca", "sałatka z soczewicą i kuskusem"]
  ],
  pairsNote: "Aminokwasy z różnych produktów uzupełniają się w ciągu dnia. Nie trzeba ich łączyć w jednym posiłku.",

  myths: [
    ["Białko roślinne jest gorsze.", "Dobrze zaplanowana dieta roślinna pokrywa zapotrzebowanie na wszystkie aminokwasy. Białko roślinne jest nieco słabiej trawione, więc zaleca się celować w ok. 10% więcej białka niż przy diecie mieszanej."],
    ["Trzeba łączyć białka w każdym posiłku.", "Nie. Liczy się różnorodność w ciągu całego dnia: zboża, strączki, orzechy i nasiona."],
    ["Soja psuje hormony.", "Umiarkowane ilości produktów sojowych (np. porcja tofu lub szklanka mleka sojowego dziennie) są uznawane za bezpieczne dla większości osób."],
    ["Bez mięsa nie da się pokryć żelaza.", "Da się, ale żelazo roślinne wchłania się słabiej. Jedz strączki z witaminą C (papryka, cytryna), nie pij kawy i herbaty do posiłku i badaj ferrytynę."],
    ["Dieta roślinna sama leczy choroby.", "Nie. Obserwacje (m.in. wśród Adwentystów Dnia Siódmego) pokazują lepsze wskaźniki zdrowia, ale to badania obserwacyjne. Wpływa na nie także styl życia: brak palenia, ruch, mniej alkoholu."],
    ["Roślinne znaczy automatycznie zdrowe.", "Frytki, słodycze i przetworzone zamienniki mięsa też są roślinne. Bazą ma być jedzenie mało przetworzone."]
  ],

  nutrients: [
    { h: "Witamina B12", p: "Obowiązkowo przy diecie w pełni roślinnej. Zwykle 25–100 µg dziennie (lub większa dawka raz w tygodniu) zgodnie z zaleceniem lekarza. Zbadaj poziom raz w roku." },
    { h: "Witamina D", p: "W Polsce od września do kwietnia zwykle 800–2000 IU dziennie, najlepiej według wyniku badania. Są wersje D3 pochodzenia roślinnego." },
    { h: "Omega-3", p: "Łyżka mielonego siemienia lub olej lniany codziennie albo kilka orzechów włoskich. Opcjonalnie suplement DHA/EPA z alg." },
    { h: "Żelazo", p: "Strączki, kasze, pestki dyni, sezam, ciemne warzywa liściaste. Łącz z witaminą C. Badaj ferrytynę, szczególnie kobiety w wieku rozrodczym." },
    { h: "Wapń", p: "Napoje roślinne wzbogacone w wapń, tofu z solą wapnia, jarmuż, brokuły, sezam i tahini." },
    { h: "Jod", p: "Używaj soli jodowanej (w niewielkiej ilości). Algi są nieprzewidywalne i mogą zawierać zbyt dużo jodu." },
    { h: "Cynk i selen", p: "Pestki dyni, strączki, produkty pełnoziarniste. Jeden–dwa orzechy brazylijskie dziennie dostarczają selenu." }
  ],

  tips: [
    "Strączki z puszki są w pełni wartościowe. Odsącz i przepłucz. Suche namocz na noc i gotuj do miękkości.",
    "Czerwona fasola musi być gotowana co najmniej 10 minut na mocnym ogniu. Surowa lub niedogotowana jest toksyczna.",
    "W niedzielę ugotuj garnek kaszy lub ryżu i garnek soczewicy. Przechowuj w lodówce do 3–4 dni, porcje można mrozić.",
    "Hummus i pasty kanapkowe z ciecierzycy wytrzymują w lodówce kilka dni.",
    "Błonnik zwiększaj stopniowo i pij wodę. Wzdęcia w pierwszych tygodniach to normalne.",
    "Przyprawy (kmin rzymski, majeranek, imbir, kurkuma) poprawiają smak i ułatwiają trawienie strączków."
  ],

  doctor: [
    "Ciąża, karmienie piersią, dzieci i młodzież.",
    "Choroby nerek (ograniczenia białka i potasu), cukrzyca, choroby jelit.",
    "Leki na stałe (np. na tarczycę, warfaryna) lub podejrzenie niedoborów.",
    "Utrzymujące się zmęczenie, wypadanie włosów, zawroty głowy lub drętwienie rąk i stóp."
  ],

  sources: [
    "WHO/FAO/UNU, Protein and amino acid requirements in human nutrition, Technical Report 935 (2007).",
    "Academy of Nutrition and Dietetics, Position on Vegetarian Diets (2016).",
    "Jarosz M. i wsp., Normy żywienia dla populacji Polski, NIZP-PZH (2020)."
  ]
};
