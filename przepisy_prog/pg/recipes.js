// Przepisy wbudowane. Składniki są adresowane indeksem ("0", "1", …) w polu `ing` kroku.
const RECIPES = [
  {
    id: "pomidorowa", emoji: "🍅", name: "Zupa pomidorowa", servings: 4, time: "35 min",
    ingredients: [
      { n: "Cebula", q: 1, u: "szt" }, { n: "Czosnek", q: 2, u: "ząbki" },
      { n: "Oliwa", q: 20, u: "g" }, { n: "Pomidory z puszki", q: 800, u: "g" },
      { n: "Bulion", q: 400, u: "ml" }, { n: "Śmietanka 18%", q: 100, u: "ml" },
      { n: "Sól", q: 1, u: "łyżeczka" }
    ],
    steps: [
      { t: "Wrzuć cebulę i czosnek (w kawałkach) i rozdrobnij.", time: 5, speed: "5", ing: ["0", "1"] },
      { t: "Zgarnij ze ścianek, dodaj oliwę i podsmaż.", time: 180, temp: 120, speed: "1", ing: ["2"] },
      { t: "Dodaj pomidory, bulion i sól. Gotuj.", time: 1200, temp: 100, speed: "1", ing: ["3", "4", "6"] },
      { t: "Zmiksuj, zwiększając obroty stopniowo.", time: 60, speed: "0→10" },
      { t: "Dodaj śmietankę i krótko wymieszaj. Podawaj z bazylią.", time: 30, speed: "3", ing: ["5"] }
    ]
  },
  {
    id: "hummus", emoji: "🧆", name: "Hummus", servings: 4, time: "10 min",
    ingredients: [
      { n: "Ciecierzyca z puszki (odsączona)", q: 400, u: "g" }, { n: "Pasta tahini", q: 60, u: "g" },
      { n: "Czosnek", q: 1, u: "ząbek" }, { n: "Sok z cytryny", q: 40, u: "ml" },
      { n: "Oliwa", q: 40, u: "g" }, { n: "Woda", q: 50, u: "ml" },
      { n: "Sól", q: 1, u: "łyżeczka" }, { n: "Kmin rzymski", q: 0.5, u: "łyżeczka" }
    ],
    steps: [
      { t: "Rozdrobnij czosnek.", time: 5, speed: "7", ing: ["2"] },
      { t: "Dodaj pozostałe składniki i zmiksuj.", time: 60, speed: "6", ing: ["0", "1", "3", "4", "5", "6", "7"] },
      { t: "Zgarnij ze ścianek i miksuj do gładkiej konsystencji.", time: 30, speed: "6" },
      { t: "Przełóż do miski, skrop oliwą i posyp papryką." }
    ]
  },
  {
    id: "risotto", emoji: "🍚", name: "Risotto z parmezanem", servings: 3, time: "30 min",
    ingredients: [
      { n: "Cebula", q: 1, u: "szt" }, { n: "Masło", q: 30, u: "g" },
      { n: "Ryż arborio", q: 300, u: "g" }, { n: "Białe wino", q: 100, u: "ml" },
      { n: "Gorący bulion", q: 700, u: "ml" }, { n: "Parmezan (starty)", q: 50, u: "g" }
    ],
    steps: [
      { t: "Rozdrobnij cebulę.", time: 5, speed: "5", ing: ["0"] },
      { t: "Dodaj masło i podsmaż.", time: 180, temp: 100, speed: "1", ing: ["1"] },
      { t: "Wsyp ryż i smaż, aż stanie się szklisty.", time: 120, temp: 100, speed: "1", rev: true, ing: ["2"] },
      { t: "Wlej wino i bulion. Gotuj bez miarki, z koszyczkiem na pokrywie.", time: 900, temp: 100, speed: "1", rev: true, acc: ["noCup"], ing: ["3", "4"] },
      { t: "Dodaj parmezan i delikatnie wymieszaj. Odstaw na 2 minuty.", time: 60, speed: "1", rev: true, ing: ["5"] }
    ]
  },
  {
    id: "nalesniki", emoji: "🥞", name: "Ciasto na naleśniki", servings: 4, time: "15 min + odpoczynek",
    ingredients: [
      { n: "Mleko", q: 300, u: "ml" }, { n: "Woda gazowana", q: 100, u: "ml" },
      { n: "Jajka", q: 2, u: "szt" }, { n: "Mąka pszenna", q: 200, u: "g" },
      { n: "Olej", q: 2, u: "łyżki" }, { n: "Sól", q: 1, u: "szczypta" }
    ],
    steps: [
      { t: "Wsyp wszystkie składniki i dokładnie wymieszaj.", time: 30, speed: "4", ing: ["0", "1", "2", "3", "4", "5"] },
      { t: "Zgarnij ze ścianek i wymieszaj jeszcze raz.", time: 15, speed: "4" },
      { t: "Odstaw ciasto na odpoczynek (bez urządzenia).", time: 600 },
      { t: "Smaż na patelni na rozgrzanym oleju, po ok. 1–2 min z każdej strony." }
    ]
  }
];

const DEFAULT_TAGS = {
  pomidorowa: ["Zupy", "Wegetariańskie", "Polska", "Na co dzień"],
  hummus: ["Przekąski", "Sosy i dipy", "Wegańskie", "Bliskowschodnia", "Szybkie"],
  risotto: ["Dania główne", "Włoska", "Na przyjęcie"],
  nalesniki: ["Śniadania", "Wegetariańskie", "Polska", "Szybkie"]
};
