// Logika bez DOM-u (działa w przeglądarce i w Node: `node pg/tests.js`).
(function (root) {
"use strict";

// ---------- Stałe ----------
const DIFFICULTY = ["łatwy", "średni", "zaawansowany"];
const ACCESSORIES = [["butterfly", "Motylek"], ["basket", "Koszyczek"], ["varoma", "Varoma"], ["noCup", "Bez miarki"]];
const MODES = [["steam", "Gotowanie na parze"], ["slow", "Wolne gotowanie"], ["ferment", "Fermentacja"],
  ["sousvide", "Sous-vide"], ["warm", "Podgrzewanie"], ["brown", "Obsmażanie"]];
const MEALS = ["Śniadanie", "Obiad", "Kolacja", "Przekąska"];
const TAG_GROUPS = [
  { g: "Rodzaj dania", tags: ["Śniadania", "Zupy", "Dania główne", "Sałatki", "Przekąski", "Sosy i dipy", "Desery", "Ciasta i wypieki", "Napoje"] },
  { g: "Dieta", tags: ["Wegetariańskie", "Wegańskie", "Bezglutenowe", "Bez laktozy", "Wysokobiałkowe", "Lekkie"] },
  { g: "Kuchnia", tags: ["Polska", "Włoska", "Francuska", "Bliskowschodnia", "Azjatycka", "Meksykańska", "Grecka", "Indyjska"] },
  { g: "Okazja i czas", tags: ["Szybkie", "Na co dzień", "Na przyjęcie", "Meal prep", "Dla dzieci", "Z ogrodu", "Plan 7 dni"] },
  { g: "Sezon", tags: ["Wiosna", "Lato", "Jesień", "Zima"] },
  { g: "Wyróżnione", tags: ["World best"] }
];

// ---------- Pomocnicze ----------
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fold = s => String(s ?? "").toLowerCase().replace(/ł/g, "l").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const rand = n => Math.random().toString(36).slice(2, 2 + n);
const newId = () => "u_" + Date.now().toString(36) + rand(4);
const num = v => (typeof v !== "number" && typeof v !== "string") || v === "" || !Number.isFinite(+v) ? undefined : +v;
const str = (v, n) => String(v ?? "").slice(0, n);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const fmtMin = m => m >= 60 ? `${Math.floor(m / 60)} h${m % 60 ? ` ${m % 60} min` : ""}` : `${m} min`;
const fmtNum = v => String(v).replace(".", ",");
const cap = s => s ? s[0].toUpperCase() + s.slice(1) : s;
const pl = (n, one, few, many) => {
  if (!Number.isInteger(n)) return few;
  if (n === 1) return one;
  return n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14) ? few : many;
};

// ---------- Jednostki ----------
const UNIT_RULES = [
  [/^(g|gr|gram\w*)$/, "g"], [/^kg$/, "kg"], [/^dag$/, "dag"], [/^ml$/, "ml"], [/^(l|litr\w*)$/, "l"],
  [/^(szt|sztuk\w*)$/, "szt"], [/^lyzeczk\w*$/, "łyżeczka"], [/^lyzk\w*$/, "łyżka"], [/^szklank\w*$/, "szklanka"],
  [/^zab\w*$/, "ząbek"], [/^szczypt\w*$/, "szczypta"], [/^plast\w*$/, "plaster"], [/^pecz\w*$/, "pęczek"], [/^puszk\w*$/, "puszka"]
];
function canonUnit(u) {
  const t = fold(u).trim().replace(/\.$/, "");
  for (const [rx, c] of UNIT_RULES) if (rx.test(t)) return c;
  return null;
}
const ML_OF = { ml: 1, l: 1000, "łyżeczka": 5, "łyżka": 15, szklanka: 250 };
const G_OF = { g: 1, kg: 1000, dag: 10 };
const toMl = (q, u) => ML_OF[canonUnit(u)] != null ? q * ML_OF[canonUnit(u)] : null;
const toG = (q, u) => G_OF[canonUnit(u)] != null ? q * G_OF[canonUnit(u)] : null;

const COUNT_UNITS = new Set(["szt", "ząbek", "łyżeczka", "łyżka", "szczypta", "plaster", "pęczek", "puszka", "szklanka"]);
function fmtQty(q, u) {
  if (q == null) return u || "do smaku";
  const step = COUNT_UNITS.has(canonUnit(u)) ? 0.5 : q < 10 ? 0.1 : 1;
  let v = +(Math.round(q / step) * step).toFixed(2);
  if (v === 0) v = step;
  return u ? `${fmtNum(v)} ${u}` : fmtNum(v);
}
function fmtTime(s) {
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), r = s % 60, p = n => String(n).padStart(2, "0");
  return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`;
}
function fmtDur(s) {
  if (s < 60) return `${s} s`;
  if (s % 60) return fmtTime(s);
  const h = Math.floor(s / 3600), m = s % 3600 / 60;
  return h ? `${h} h${m ? ` ${m} min` : ""}` : `${m} min`;
}
function fmtGrams(g) {
  if (g >= 1000) return `${fmtNum(+(g / 1000).toFixed(2))} kg`;
  return `${fmtNum(g < 10 ? +g.toFixed(1) : g < 100 ? Math.round(g) : Math.round(g / 5) * 5)} g`;
}
function fmtVol(ml) {
  if (ml >= 125) { const c = Math.round(ml / 250 * 4) / 4; return `${fmtNum(c)} ${pl(c, "szklanka", "szklanki", "szklanek")}`; }
  if (ml >= 12) { const t = Math.round(ml / 15 * 2) / 2; return `${fmtNum(t)} ${pl(t, "łyżka", "łyżki", "łyżek")}`; }
  const t = Math.max(0.5, Math.round(ml / 5 * 2) / 2);
  return `${fmtNum(t)} ${pl(t, "łyżeczka", "łyżeczki", "łyżeczek")}`;
}

// ---------- Wartości odżywcze, gęstość, alergeny, działy sklepu ----------
// [początek słowa (bez ogonków), kcal, białko, tłuszcz, węgle (na 100 g), gęstość g/ml, g na sztukę]
const NUTRI = [
  ["maka ziemniaczana", 350, 0.3, 0.1, 86, 0.6], ["maka", 350, 10, 1, 73, 0.55],
  ["cukier puder", 390, 0, 0, 99, 0.55], ["cukier", 400, 0, 0, 100, 0.85],
  ["sol", 0, 0, 0, 0, 1.2], ["woda", 0, 0, 0, 0, 1], ["bulion", 8, 0.5, 0.2, 1, 1], ["wino", 70, 0, 0, 2.6, 1],
  ["mleko kokosow", 197, 2, 21, 3, 1], ["mleko sojowe", 40, 3.3, 1.8, 1.5, 1.03], ["mleko migdalowe", 20, 0.5, 1.1, 2, 1],
  ["mleko", 50, 3.4, 2, 4.8, 1.03], ["smietank", 185, 2.5, 18, 3.5, 1], ["smietan", 130, 2.5, 12, 3.5, 1],
  ["jogurt", 60, 4, 3, 5, 1.03], ["maslo orzechowe", 588, 25, 50, 20, 1], ["maslo", 717, 0.9, 81, 0.1, 0.95],
  ["oliwk", 115, 0.8, 11, 6, 0.7], ["oliw", 884, 0, 100, 0, 0.92], ["olej", 884, 0, 100, 0, 0.92], ["jajk", 143, 12.6, 9.5, 0.7, 1, 55], ["jajo", 143, 12.6, 9.5, 0.7, 1, 55],
  ["sok z cytryn", 22, 0.4, 0.1, 7, 1.03], ["cytryn", 29, 1.1, 0.3, 9, 1, 80],
  ["pomidor", 21, 1, 0.2, 4, 1, 120], ["cebul", 40, 1.1, 0.1, 9.3, 0.6, 100], ["czosnek", 149, 6.4, 0.5, 33, 0.6, 4],
  ["marchew", 41, 0.9, 0.2, 10, 0.6, 80], ["ziemniak", 77, 2, 0.1, 17, 0.7, 120], ["papryk", 31, 1, 0.3, 6, 0.5, 150],
  ["ogorek", 15, 0.7, 0.1, 3.6, 1, 200], ["szpinak", 23, 2.9, 0.4, 3.6, 0.3], ["brokul", 34, 2.8, 0.4, 7, 0.4], ["cukini", 17, 1.2, 0.3, 3.1, 0.6, 250],
  ["banan", 89, 1.1, 0.3, 23, 1, 120], ["jablk", 52, 0.3, 0.2, 14, 0.6, 150],
  ["fasolka szparagow", 31, 1.8, 0.2, 7, 0.5], ["groszek", 81, 5, 0.4, 14, 0.7],
  ["ciecierzyc", 120, 7, 2, 18, 0.8], ["fasol", 100, 7, 0.5, 17, 0.8],
  ["soczewica gotowana", 116, 9, 0.4, 20, 0.8], ["soczewic", 350, 25, 1.5, 60, 0.8], ["groch", 341, 25, 1.2, 60, 0.8],
  ["komosa", 368, 14, 6, 64, 0.7], ["quinoa", 368, 14, 6, 64, 0.7], ["bulgur", 342, 12, 1.5, 76, 0.7], ["kuskus", 360, 12, 1.5, 73, 0.7],
  ["tofu", 120, 13, 7, 2, 1], ["edamame", 121, 12, 5, 9, 0.7], ["hummus", 166, 8, 10, 14, 1], ["bob", 110, 8, 0.7, 19, 0.8],
  ["siemie", 534, 18, 42, 29, 0.55], ["chia", 486, 17, 31, 42, 0.6], ["sezam", 573, 18, 50, 23, 0.6], ["pestki", 560, 25, 47, 15, 0.55],
  ["orzechy wloskie", 654, 15, 65, 14, 0.5], ["orzech laskow", 628, 15, 61, 17, 0.5], ["orzechy laskowe", 628, 15, 61, 17, 0.5],
  ["borowk", 57, 0.7, 0.3, 14, 0.6], ["jagod", 57, 0.7, 0.3, 14, 0.6], ["malin", 52, 1.2, 0.7, 12, 0.6], ["gruszk", 57, 0.4, 0.1, 15, 0.6, 170],
  ["zurawin", 308, 0.2, 1.4, 82, 0.5], ["awokado", 160, 2, 15, 9, 1, 200], ["burak", 43, 1.6, 0.2, 10, 0.7, 150], ["kapust", 25, 1.3, 0.1, 6, 0.4],
  ["dyni", 26, 1, 0.1, 6.5, 0.6], ["brukselk", 43, 3.4, 0.3, 9, 0.5], ["kukurydz", 86, 3.3, 1.2, 19, 0.7], ["bok choy", 13, 1.5, 0.2, 2.2, 0.4],
  ["seler", 16, 0.7, 0.2, 3, 0.5], ["pietruszk", 55, 1.5, 0.5, 12, 0.5], ["imbir", 80, 1.8, 0.8, 18, 0.5], ["kurkum", 312, 10, 3, 67, 0.5],
  ["syrop klonowy", 260, 0, 0, 67, 1.3], ["sos sojowy", 60, 8, 0.1, 6, 1.15], ["musli", 360, 10, 6, 66, 0.4], ["chleb", 250, 8, 1.5, 48, 0.3],
  ["przecier pomidorowy", 38, 1.7, 0.2, 7, 1.05], ["szczypiorek", 30, 3, 0.7, 4, 0.3], ["koper", 43, 3.5, 1.1, 7, 0.2], ["majeran", 271, 12.7, 7, 60, 0.2], ["lisc laurowy", 313, 7.6, 8.4, 75, 0.1, 0.3], ["cynamon", 247, 4, 1.2, 81, 0.5],
  ["tahini", 595, 17, 54, 22, 1], ["kmin", 375, 18, 22, 44, 0.4], ["pieprz", 251, 10, 3, 64, 0.5],
  ["bazyli", 23, 3, 0.6, 2.7, 0.2], ["oregano", 265, 9, 4, 69, 0.2], ["natk", 36, 3, 0.8, 6, 0.2],
  ["ryz", 350, 7, 0.6, 78, 0.8], ["makaron", 360, 12, 1.5, 72, 0.4], ["kasz", 350, 12, 3, 70, 0.8], ["platki owsiane", 370, 13, 7, 60, 0.35],
  ["parmezan", 431, 38, 29, 4, 0.4], ["feta", 264, 14, 21, 4, 1], ["mozzarell", 280, 18, 22, 2, 1], ["ser", 350, 25, 27, 1, 0.5],
  ["twarog", 98, 12, 4, 3, 1], ["mascarpone", 430, 4.6, 44, 4, 1],
  ["miod", 304, 0.3, 0, 82, 1.4], ["kakao", 228, 20, 14, 10, 0.45], ["drozdze odzywcze", 350, 50, 5, 30, 0.3], ["drozdze", 105, 8, 2, 12, 1], ["proszek do pieczenia", 53, 0, 0, 28, 0.9],
  ["kurczak", 110, 23, 1.5, 0, 1], ["mieso mielone", 250, 17, 20, 0, 1], ["losos", 208, 20, 13, 0, 1], ["tunczyk", 130, 29, 1, 0, 1],
  ["orzech wloski", 654, 15, 65, 14, 0.5], ["migdal", 579, 21, 50, 22, 0.6],
  ["baklazan", 25, 1, 0.2, 6, 0.5, 300], ["rzodkiew", 16, 0.7, 0.1, 3.4, 0.6, 15], ["salat", 15, 1.4, 0.2, 2.9, 0.2], ["rukol", 25, 2.6, 0.7, 3.7, 0.2],
  ["jarmuz", 49, 4.3, 0.9, 9, 0.3], ["kalafior", 25, 1.9, 0.3, 5, 0.4], ["pasternak", 75, 1.2, 0.3, 18, 0.6, 150], ["kalarepa", 27, 1.7, 0.1, 6, 0.6, 200],
  ["pieczark", 22, 3.1, 0.3, 3.3, 0.4, 20], ["boczniak", 33, 3.3, 0.4, 6, 0.4], ["grzyb", 22, 3.1, 0.3, 3.3, 0.4],
  ["ocet", 20, 0, 0, 0.6, 1], ["musztard", 66, 4, 4, 6, 1.05], ["chili", 282, 13, 14, 50, 0.4],
  ["mieta", 70, 3.8, 0.9, 15, 0.2], ["tymianek", 101, 5.6, 1.7, 24, 0.2], ["rozmaryn", 131, 3.3, 5.9, 21, 0.2], ["szalwi", 315, 10.6, 12.7, 61, 0.1]
];
let ACTIVE_NUTRI = NUTRI, OWN_NUTRI = {};
const nutriKey = s => fold(s).replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
// Własne wartości: { klucz: [kcal, białko, tłuszcz, węgle, gęstość|null, g/szt|null] } na 100 g.
function cleanNutri(x) {
  const out = {};
  if (!x || typeof x !== "object" || Array.isArray(x)) return out;
  for (const [k, v] of Object.entries(x).slice(0, 500)) {
    const key = nutriKey(k);
    if (!key || !Array.isArray(v)) continue;
    const [kcal, p, f, c, d, g] = v.map(n => num(n));
    if (![kcal, p, f, c].every(n => n !== undefined && n >= 0) || kcal > 900 || p > 100 || f > 100 || c > 100) continue;
    out[key] = [kcal, p, f, c, d > 0 && d <= 3 ? d : null, g > 0 && g <= 5000 ? g : null].map(n => n == null ? null : Math.round(n * 100) / 100);
  }
  return out;
}
function setCustomNutri(map) {
  OWN_NUTRI = cleanNutri(map);
  const known = new Set(NUTRI.map(e => e[0]));
  const extra = Object.entries(OWN_NUTRI).filter(([k]) => !known.has(k)).sort((a, b) => b[0].length - a[0].length).map(([k, v]) => [k, ...v]);
  ACTIVE_NUTRI = [...extra, ...NUTRI.map(e => OWN_NUTRI[e[0]] ? [e[0], ...OWN_NUTRI[e[0]]] : e)];
}
function nutriEntry(name) {
  const f = fold(name);
  return ACTIVE_NUTRI.find(e => new RegExp("(^|[^a-z])" + e[0]).test(f));
}
function nutriSource(name) {
  const e = nutriEntry(name);
  return !e ? "none" : Object.hasOwn(OWN_NUTRI, e[0]) ? "own" : "table";
}
const nutriTable = () => ACTIVE_NUTRI.map(e => ({ key: e[0], v: e.slice(1), own: Object.hasOwn(OWN_NUTRI, e[0]), base: NUTRI.some(n => n[0] === e[0]) }));
function gramsOf(i, qty, e) {
  const u = canonUnit(i.u), d = e?.[5] ?? 1;
  if (G_OF[u] != null) return qty * G_OF[u];
  if (ML_OF[u] != null) return qty * ML_OF[u] * d;
  if (u === "szt" || u === "ząbek") return e?.[6] ? qty * e[6] : null;
  if (u === "szczypta") return qty * 0.3;
  return null;
}
// Szacunek na porcję; coverage = udział policzonych składników (0–1).
function nutrition(r) {
  let kcal = 0, p = 0, f = 0, c = 0, n = 0, ok = 0;
  for (const i of r.ingredients) {
    if (i.q == null) continue;
    n++;
    const e = nutriEntry(i.n), g = e ? gramsOf(i, i.q, e) : null;
    if (g == null) continue;
    ok++;
    kcal += g / 100 * e[1]; p += g / 100 * e[2]; f += g / 100 * e[3]; c += g / 100 * e[4];
  }
  const s = r.servings || 1;
  return { kcal: Math.round(kcal / s), p: Math.round(p / s), f: Math.round(f / s), c: Math.round(c / s), coverage: n ? ok / n : 0 };
}

const ALLERGENS = [
  ["Gluten", /\b(maka|makaron\w*|chleb\w*|bulk\w*|pszen\w*|zytni\w*|jeczmien\w*|kus ?kus|manna|bulgur|panierk\w*|seitan|tortill\w*|nalesnik\w*|musli|sos sojowy)\b/, /ziemniacz|ryzow|kukurydz|migdal|kokos|gryczan/],
  ["Mleko (laktoza)", /\b(mleko|mleka|smietan\w*|maslo|masla|ser|sera|serek|serka|parmezan\w*|jogurt\w*|twarog\w*|twarozek|kefir\w*|maslanka|mascarpone|ricotta|mozzarell\w*|feta|serwatk\w*)\b/, /orzechow|kakaow|kokosow|roslinn|sojow|migdalow|owsian/],
  ["Jaja", /\b(jajk\w*|jajo|jaj)\b/],
  ["Orzechy", /orzech\w*|migdal\w*|nerkowc\w*|pistacj\w*|laskow\w*/],
  ["Orzeszki ziemne", /orzeszk\w*|arachid\w*|maslo orzechowe/],
  ["Soja", /\bsoj\w*|\btofu|edamame/],
  ["Sezam", /sezam\w*|tahini/],
  ["Ryby", /\b(ryb\w*|losos\w*|tunczyk\w*|dorsz\w*|sledz\w*|makrel\w*|sardynk\w*|anchois\w*)/],
  ["Skorupiaki", /krewetk\w*|\bkraby?\b|homar\w*|langust\w*/],
  ["Seler", /seler\w*/],
  ["Gorczyca", /musztard\w*|gorczyc\w*/],
  ["Siarczyny", /\bwin(o|a|em)\b/]
];
function allergensOf(r) {
  const names = r.ingredients.map(i => fold(i.n));
  return ALLERGENS.filter(([, rx, ex]) => names.some(n => rx.test(n) && !(ex && ex.test(n)))).map(([l]) => l);
}

const AISLES = [
  ["Przyprawy", /\bsol\b|pieprz|kmin|oregano|papryk\w* (mielon|slodk|ostr|wedzon)|chili|cynamon|przypraw|curry|kurkum|imbir|ziele|tymianek|rozmaryn|majeranek|musztard|szalwi/],
  ["Tłuszcze i oleje", /oliwa|oliwy|olej|margaryn|smalec/],
  ["Roślinne zamienniki", /tofu|tempeh|maslo orzechowe|mleko (sojow|migdal|owsian|kokos)|jogurt sojow|drozdze odzywcze|hummus|edamame/],
  ["Nabiał i jaja", /mleko|smietan|\bser\b|\bsera\b|serek|parmezan|jogurt|twarog|kefir|maslo|mascarpone|mozzarell|feta|jajk|jajo|maslanka/],
  ["Mięso i ryby", /kurczak|mieso|wieprz|wolow|schab|szynk|boczek|kielbas|losos|tunczyk|dorsz|ryb|krewetk/],
  ["Warzywa i owoce", /cebul|czosnek|pomidor|marchew|ziemniak|papryk|ogorek|cytryn|limonk|jablk|banan|szpinak|brokul|cukini|natk|bazyli|salat|\bpor\b|seler|(?<!pestki )dyni|grzyb|awokado|pietruszk|koper|szczypior|owoc|warzyw|burak|kapust|brukselk|kukurydz|\bbob\b|borowk|malin|jagod|gruszk|bok choy|rzodkiew|rukol|jarmuz|kalafior|szparag|baklazan|pasternak|kalarepa|groszek|rzezuch|mieta|pieczark|boczniak|oliwk/],
  ["Produkty sypkie i suche", /maka|ryz|makaron|kasz|platki|cukier|drozdz|chleb|bulk|proszek|kakao|bulgur|kus|ciecierzyc|soczewic|fasol|migdal|orzech|tahini|miod|komosa|quinoa|groch|musli|siemie|\bchia|sezam|zurawin|pestki/],
  ["Płyny", /wino|piwo|\bsok\b|woda|bulion|ocet|napoj|\bsos\b|syrop|przecier/]
];
const AISLE_OTHER = "Inne";
const aisleOf = name => { const f = fold(name); return (AISLES.find(([, rx]) => rx.test(f)) || [AISLE_OTHER])[0]; };
const AISLE_ORDER = [...AISLES.map(a => a[0]), AISLE_OTHER];

// ---------- Normalizacja danych z zewnątrz ----------
function cleanRecipe(x) {
  if (!x || typeof x !== "object" || typeof x.name !== "string" || !x.name.trim() || !Array.isArray(x.ingredients) || !Array.isArray(x.steps)) return null;
  const seen = new Set(), ingredients = [];
  x.ingredients.forEach((i, idx) => {
    if (!i || typeof i.n !== "string" || !i.n.trim()) return;
    let id = typeof i.id === "string" && /^[\w-]{1,16}$/.test(i.id) ? i.id : "i" + idx;
    while (seen.has(id)) id += "x";
    seen.add(id);
    ingredients.push({ id, n: i.n.trim().slice(0, 100), q: num(i.q) >= 0 ? num(i.q) : null, u: str(i.u, 20).trim() });
  });
  return {
    id: str(x.id || newId(), 40), emoji: str(x.emoji || "🍽️", 8), name: x.name.trim().slice(0, 80),
    servings: clamp(Math.round(num(x.servings) || 4), 1, 24),
    prep: num(x.prep) > 0 ? Math.round(num(x.prep)) : undefined,
    total: num(x.total) > 0 ? Math.round(num(x.total)) : undefined,
    time: typeof x.time === "string" && x.time ? x.time.slice(0, 60) : undefined,
    difficulty: DIFFICULTY.includes(x.difficulty) ? x.difficulty : "",
    desc: str(x.desc, 1000),
    ...(x.photo === true ? { photo: true } : {}),
    ingredients,
    steps: x.steps.filter(s => s && typeof s.t === "string" && s.t.trim()).map(s => {
      const o = { t: s.t.trim().slice(0, 500) };
      if (num(s.time) > 0) o.time = Math.round(num(s.time));
      if (s.temp === "Varoma") o.temp = "Varoma"; else if (num(s.temp) > 0) o.temp = num(s.temp);
      if (s.speed) o.speed = str(s.speed, 10);
      if (s.rev) o.rev = true;
      if (MODES.some(([k]) => k === s.mode)) o.mode = s.mode;
      const acc = Array.isArray(s.acc) ? s.acc.filter(a => ACCESSORIES.some(([k]) => k === a)) : [];
      if (acc.length) o.acc = acc;
      const ing = Array.isArray(s.ing) ? [...new Set(s.ing.filter(id => seen.has(id)))] : [];
      if (ing.length) o.ing = ing;
      return o;
    }),
    created: num(x.created) || Date.now(),
    updated: num(x.updated) || 0
  };
}
function cleanMeta(m) {
  return {
    rating: clamp(Math.round(+m?.rating) || 0, 0, 5),
    ...(m?.fav ? { fav: true } : {}),
    ...(Array.isArray(m?.tags) ? { tags: [...new Set(m.tags.filter(t => typeof t === "string" && t.trim()).map(t => t.trim().slice(0, 30)))] } : {}),
    notes: (Array.isArray(m?.notes) ? m.notes : []).filter(n => n && typeof n.text === "string" && n.text.trim())
      .map(n => ({ id: str(n.id || newId(), 20), ts: num(n.ts) || Date.now(), text: n.text.slice(0, 2000) })),
    history: (Array.isArray(m?.history) ? m.history : []).map(num).filter(t => t > 0).sort((a, b) => a - b).slice(-200)
  };
}
function cleanCollections(a) {
  return (Array.isArray(a) ? a : []).filter(c => c && typeof c.name === "string" && c.name.trim()).map(c => ({
    id: str(c.id || newId(), 20), name: c.name.trim().slice(0, 40),
    ids: [...new Set((Array.isArray(c.ids) ? c.ids : []).filter(x => typeof x === "string").map(x => x.slice(0, 40)))].slice(0, 500)
  }));
}
function cleanShop(a) {
  return (Array.isArray(a) ? a : []).filter(i => i && typeof i.n === "string" && i.n.trim()).slice(0, 500).map(i => ({
    id: str(i.id || newId(), 20), n: i.n.trim().slice(0, 100), q: num(i.q) >= 0 ? num(i.q) : null, u: str(i.u, 20).trim(),
    done: !!i.done, from: (Array.isArray(i.from) ? i.from : []).filter(x => typeof x === "string").map(x => x.slice(0, 80)).slice(0, 10)
  }));
}
function cleanPlan(o) {
  const out = {};
  for (const [k, v] of Object.entries(o && typeof o === "object" ? o : {})) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !Array.isArray(v)) continue;
    const list = v.filter(e => e && typeof e.rid === "string").map(e => ({
      id: str(e.id || newId(), 20), rid: e.rid.slice(0, 40), meal: MEALS.includes(e.meal) ? e.meal : "Obiad",
      servings: clamp(Math.round(num(e.servings) || 4), 1, 24)
    }));
    if (list.length) out[k] = list;
  }
  return out;
}
// Zapisany plan to 7 dni względnych (0 = poniedziałek), więc można go wczytać na dowolny tydzień.
function cleanSavedPlans(a) {
  return (Array.isArray(a) ? a : []).filter(p => p && typeof p.name === "string" && p.name.trim() && Array.isArray(p.days)).slice(0, 30).map(p => ({
    id: str(p.id || newId(), 20), name: p.name.trim().slice(0, 40), saved: num(p.saved) || 0,
    days: Array.from({ length: 7 }, (_, d) => (Array.isArray(p.days[d]) ? p.days[d] : []).filter(e => e && typeof e.rid === "string").slice(0, 20).map(e => ({
      rid: e.rid.slice(0, 40), meal: MEALS.includes(e.meal) ? e.meal : "Obiad", servings: clamp(Math.round(num(e.servings) || 4), 1, 24)
    })))
  })).filter(p => p.days.some(d => d.length));
}
const weekToDays = (plan, start) => Array.from({ length: 7 }, (_, i) =>
  ((plan || {})[addDays(start, i)] || []).map(e => ({ rid: e.rid, meal: e.meal, servings: e.servings })));
// Odcisk treści do wykrywania tego samego przepisu pod innym id. `strict` dodaje treść kroków, luźny tylko ich liczbę.
const recipeKey = (r, strict = true) => [fold(r.name).replace(/[^a-z0-9]+/g, " ").trim(), r.servings,
  ...r.ingredients.map(i => fold(i.n).replace(/[^a-z0-9]+/g, " ").trim() + ":" + (Math.round((num(i.q) ?? 0) * 100) / 100) + (i.u || "")),
  strict ? r.steps.map(s => fold(s.t).replace(/[^a-z0-9]+/g, " ").trim()).join("~") : r.steps.length].join("|");
// Czy dwa przepisy mają tę samą treść (bez id, dat i zdjęcia).
const sameContent = (a, b) => { const c = ({ id, created, updated, photo, ...rest }) => JSON.stringify(rest); return c(a) === c(b); };
// Grupy tych samych przepisów (ignoruje dopisek "(kopia)"); w każdej grupie pierwszy jest najlepszy według `score`.
function duplicateGroups(list, score = () => 0) {
  const m = new Map();
  for (const r of list) {
    const k = recipeKey({ ...r, name: r.name.replace(/\s*\(kopia(?: \d+)?\)\s*$/i, "") }, false);
    m.set(k, [...(m.get(k) || []), r]);
  }
  return [...m.values()].filter(g => g.length > 1)
    .map(g => g.map((r, i) => ({ r, i, s: score(r) })).sort((a, b) => b.s - a.s || a.i - b.i).map(x => x.r));
}

// Składniki aktywne występujące w przepisie. `list` to BIOACTIVE; pierwszy pasujący wpis wygrywa, wyniki od najlepiej udokumentowanych.
function bioactiveOf(r, list) {
  const out = new Map();
  for (const i of r.ingredients) {
    const f = fold(i.n), k = list.findIndex(b => new RegExp("(^|[^a-z])(?:" + b.m + ")").test(f));
    if (k < 0) continue;
    if (!out.has(k)) out.set(k, { ...list[k], from: [] });
    const nm = i.n.replace(/\s*\(.*?\)/g, "").trim(), e = out.get(k);
    if (!e.from.includes(nm)) e.from.push(nm);
  }
  return [...out.entries()].sort((a, b) => a[1].e - b[1].e || a[0] - b[0]).map(x => x[1]);
}

// ---------- Czas ----------
const stepSeconds = r => r.steps.reduce((a, s) => a + (s.time || 0), 0);
function timeLabel(r) {
  if (r.total) return fmtMin(r.total) + (r.prep ? ` (przygotowanie ${fmtMin(r.prep)})` : "");
  if (r.prep) return `przygotowanie ${fmtMin(r.prep)}`;
  if (r.time) return r.time;
  const s = stepSeconds(r);
  return s >= 60 ? `ok. ${fmtMin(Math.ceil(s / 60))}` : "";
}

// ---------- Przeliczanie jednostek ----------
// mode: "orig" | "weight" | "volume". Zwraca {text, conv, orig}.
function convertIng(i, k, mode) {
  const q = i.q == null ? null : i.q * k, orig = fmtQty(q, i.u);
  if (q == null || mode === "orig") return { text: orig, conv: false, orig };
  const u = canonUnit(i.u), e = nutriEntry(i.n), d = e?.[5];
  const ml = toMl(q, i.u), g = toG(q, i.u);
  if (mode === "weight") {
    if (g != null) return u === "g" ? { text: orig, conv: false, orig } : { text: fmtGrams(g), conv: true, orig };
    if (ml != null && (d || u === "ml" || u === "l")) return { text: "≈ " + fmtGrams(ml * (d ?? 1)), conv: true, orig };
  }
  if (mode === "volume") {
    if (ml != null) return u === "łyżka" || u === "łyżeczka" || u === "szklanka" ? { text: orig, conv: false, orig } : { text: "≈ " + fmtVol(ml), conv: true, orig };
    if (g != null && d) return { text: "≈ " + fmtVol(g / d), conv: true, orig };
  }
  return { text: orig, conv: false, orig };
}

// Składniki kroku z narastającym odczytem wagi (g/ml) – jak przy ważeniu w misie.
const ingKey = (i, idx) => i.id ?? String(idx);
function stepIngredients(r, stepIdx, k) {
  const ids = new Set(r.steps[stepIdx]?.ing || []);
  let acc = 0;
  return r.ingredients.filter((i, idx) => ids.has(ingKey(i, idx))).map(i => {
    const q = i.q == null ? null : i.q * k, g = q == null ? null : (toG(q, i.u) ?? (canonUnit(i.u) === "ml" || canonUnit(i.u) === "l" ? toMl(q, i.u) : null));
    if (g != null) acc += g;
    return { n: i.n, text: fmtQty(q, i.u), scale: g != null ? Math.round(acc) : null };
  });
}

// ---------- Wyszukiwanie i filtry ----------
// c: {tags, rating, notes[], fav, inCol, groups}; f: {q, tags:Set, minStar, fav, col}
function recipeMatches(r, f, c) {
  if (f.fav && !c.fav) return false;
  if (f.col && !c.inCol) return false;
  if (f.minStar && c.rating < f.minStar) return false;
  const tagOk = c.groups.every(g => {
    const sel = g.tags.filter(t => f.tags.has(t));
    return !sel.length || sel.some(t => c.tags.includes(t));
  });
  if (!tagOk) return false;
  const terms = fold(f.q).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const hay = fold([r.name, r.desc, ...r.ingredients.map(i => i.n), ...r.steps.map(s => s.t), ...c.tags, ...c.notes].join("\n"));
  return terms.every(t => hay.includes(t));
}

// ---------- Co z lodówki ----------
const PANTRY = /^(woda|sol|pieprz)/;
function sameStem(a, b) {
  let p = 0;
  while (p < a.length && p < b.length && a[p] === b[p]) p++;
  return p >= 3 && p >= Math.min(a.length, b.length) - 2;
}
function fridgeScore(r, terms) {
  const ts = terms.map(fold).filter(t => t.length >= 2);
  const matched = [], missing = [];
  for (const i of r.ingredients) {
    const words = fold(i.n).split(/[^a-z0-9]+/).filter(w => w.length > 2);
    if (PANTRY.test(fold(i.n))) continue;
    (ts.some(t => words.some(w => sameStem(t, w))) ? matched : missing).push(i.n);
  }
  const total = matched.length + missing.length;
  return { matched, missing, total, ratio: total ? matched.length / total : 0 };
}

// ---------- Zakupy ----------
const shopKey = (n, u) => fold(n).trim() + "|" + (canonUnit(u) || fold(u));
function addToShop(list, items, from) {
  const out = list.map(x => ({ ...x, from: [...x.from] }));
  for (const it of items) {
    const ex = out.find(x => !x.done && shopKey(x.n, x.u) === shopKey(it.n, it.u));
    if (ex) {
      if (ex.q != null && it.q != null) ex.q += it.q; else if (ex.q == null) ex.q = it.q ?? null;
      if (from && !ex.from.includes(from)) ex.from.push(from);
    } else out.push({ id: newId(), n: it.n, q: it.q ?? null, u: it.u || "", done: false, from: from ? [from] : [] });
  }
  return out;
}
function groupShop(list) {
  const g = {};
  for (const it of list) (g[aisleOf(it.n)] ||= []).push(it);
  return AISLE_ORDER.filter(a => g[a]).map(a => [a, g[a]]);
}
const shopLine = i => `${i.q == null ? "" : fmtQty(i.q, i.u) + " "}${i.q == null && i.u ? i.u + " " : ""}${i.n}`.trim();
const shopText = list => groupShop(list.filter(i => !i.done)).map(([a, items]) => `${a}\n${items.map(i => `- ${shopLine(i)}`).join("\n")}`).join("\n\n");
const scaledItems = (r, servings) => r.ingredients.map(i => ({ n: i.n, q: i.q == null ? null : i.q * servings / r.servings, u: i.u }));

// ---------- Plan tygodnia ----------
const isoDate = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const parseIso = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (iso, n) => { const d = parseIso(iso); d.setDate(d.getDate() + n); return isoDate(d); };
const weekStart = iso => addDays(iso, -((parseIso(iso).getDay() + 6) % 7));

// ---------- Import z tekstu / JSON-LD ----------
const FRAC = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };
function takeQty(s) {
  let m;
  if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)/))) return [+m[1] + m[2] / m[3], s.slice(m[0].length)];
  if ((m = s.match(/^(\d+)\/(\d+)/))) return [m[1] / m[2], s.slice(m[0].length)];
  if ((m = s.match(/^(\d+)\s*([½¼¾⅓⅔])/))) return [+m[1] + FRAC[m[2]], s.slice(m[0].length)];
  if ((m = s.match(/^[½¼¾⅓⅔]/))) return [FRAC[m[0]], s.slice(1)];
  if ((m = s.match(/^(\d+(?:[.,]\d+)?)(?:\s*[-–]\s*\d+(?:[.,]\d+)?)?/))) return [+m[1].replace(",", "."), s.slice(m[0].length)];
  return null;
}
function parseIngredientLine(line) {
  let s = String(line).replace(/^[\s•*·\-–—]+/, "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  let q = null, u = "";
  const t = takeQty(s);
  if (t) {
    q = t[0]; s = t[1].trim();
    const m = s.match(/^([^\s\d,;()]+\.?)\s*(.*)$/u), c = m && canonUnit(m[1]);
    if (c) { u = c; s = m[2]; if (c === "dag") { q *= 10; u = "g"; } } else u = "szt";
  }
  const n = s.replace(/^[,.:\-–]\s*/, "").trim();
  return n ? { n: cap(n).slice(0, 100), q, u } : null;
}
function parseStepSettings(text) {
  const sm = text.match(/obr\.?\s*(?:↺\s*)?(\d+(?:[.,]\d)?|turbo)/i);
  if (!sm) return {};
  const o = {}, mm = text.match(/(\d+)\s*min/i), ss = text.match(/(\d+)\s*(?:sek|s\b)/i), tm = text.match(/(\d{2,3})\s*°\s*C/i);
  const sec = (mm ? +mm[1] * 60 : 0) + (ss ? +ss[1] : 0);
  if (sec) o.time = sec;
  if (tm) o.temp = +tm[1]; else if (/varoma/i.test(text)) o.temp = "Varoma";
  o.speed = /turbo/i.test(sm[1]) ? "Turbo" : sm[1].replace(".", ",");
  if (/↺|wsteczn/i.test(text)) o.rev = true;
  return o;
}
function htmlToText(s) {
  return String(s ?? "").replace(/<br\s*\/?>|<\/(p|li|div)>/gi, "\n").replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&deg;/g, "°").trim();
}
const stepsFrom = lines => lines.map(t => t.replace(/^(\d+[.)]|krok\s*\d+[.:)]?|[-•*])\s*/i, "").trim()).filter(Boolean).map(t => ({ t, ...parseStepSettings(t) }));
function parseRecipeText(text) {
  const H_ING = /^(sk[łl]adniki|ingredients)\s*:?$/i;
  const H_STEP = /^(przygotowanie|spos[óo]b przygotowania|spos[óo]b wykonania|wykonanie|kroki|instrukcja|dzia[łl]anie|directions|instructions|method)\s*:?$/i;
  let name = "", mode = "", servings;
  const ing = [], stepLines = [];
  for (const l of String(text).split(/\r?\n/).map(x => x.trim())) {
    if (!l) continue;
    if (H_ING.test(l)) { mode = "ing"; continue; }
    if (H_STEP.test(l)) { mode = "step"; continue; }
    if (!mode) {
      if (!name) name = l;
      else { const sv = l.match(/(\d+)\s*(porcj|os[óo]b)/i); if (sv && !servings) servings = +sv[1]; }
    } else if (mode === "ing") { const p = parseIngredientLine(l); if (p) ing.push(p); }
    else stepLines.push(l);
  }
  const steps = stepsFrom(stepLines);
  return name && ing.length && steps.length ? { name, servings, ingredients: ing, steps } : null;
}
function findRecipeNode(n) {
  if (!n || typeof n !== "object") return null;
  if (Array.isArray(n)) { for (const x of n) { const r = findRecipeNode(x); if (r) return r; } return null; }
  const t = n["@type"];
  return t === "Recipe" || (Array.isArray(t) && t.includes("Recipe")) ? n : findRecipeNode(n["@graph"]);
}
const isoMin = d => {
  const m = String(d || "").match(/^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/i);
  return m ? (+m[1] || 0) * 1440 + (+m[2] || 0) * 60 + (+m[3] || 0) || undefined : undefined;
};
function flatInstr(v) {
  if (!v) return [];
  if (typeof v === "string") return htmlToText(v).split(/\n+/).map(s => s.trim()).filter(Boolean);
  if (Array.isArray(v)) return v.flatMap(flatInstr);
  if (typeof v === "object") return v.itemListElement ? flatInstr(v.itemListElement) : flatInstr(v.text || v.name);
  return [];
}
function parseJsonLd(n) {
  const y = String([].concat(n.recipeYield ?? "")[0]).match(/\d+/);
  return {
    name: htmlToText(n.name), servings: y ? +y[0] : undefined, prep: isoMin(n.prepTime), total: isoMin(n.totalTime),
    desc: htmlToText(n.description).slice(0, 1000),
    ingredients: (Array.isArray(n.recipeIngredient) ? n.recipeIngredient : []).map(x => parseIngredientLine(htmlToText(x))).filter(Boolean),
    steps: stepsFrom(flatInstr(n.recipeInstructions))
  };
}
function extractRecipe(text) {
  const src = String(text).trim();
  const nodes = [];
  if (/^[\[{]/.test(src)) { try { nodes.push(JSON.parse(src)); } catch { /* nie JSON */ } }
  for (const m of src.matchAll(/<script[^>]*application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) { try { nodes.push(JSON.parse(m[1])); } catch { /* pomiń */ } }
  const node = findRecipeNode(nodes);
  if (node) { const r = parseJsonLd(node); return r.name && r.ingredients.length && r.steps.length ? r : null; }
  return parseRecipeText(src);
}

// ---------- Tekst do udostępnienia / druku ----------
function recipeToText(r, k = 1, tags = []) {
  const head = [`${r.emoji} ${r.name}`, [`${Math.round(r.servings * k)} porcje`, timeLabel(r), r.difficulty].filter(Boolean).join(" · ")];
  if (tags.length) head.push(tags.map(t => `#${t.replace(/\s+/g, "")}`).join(" "));
  if (r.desc) head.push("", r.desc);
  const ing = r.ingredients.map(i => `- ${i.q == null ? "" : fmtQty(i.q * k, i.u) + " "}${i.n}`);
  const steps = r.steps.map((s, n) => {
    const p = [s.time ? fmtDur(s.time) : "", s.temp ? (s.temp === "Varoma" ? "Varoma" : `${s.temp}°C`) : "", s.speed ? `obr. ${s.rev ? "↺ " : ""}${s.speed}` : ""].filter(Boolean).join("/");
    return `${n + 1}. ${s.t}${p ? ` [${p}]` : ""}`;
  });
  return [...head, "", "Składniki:", ...ing, "", "Przygotowanie:", ...steps].join("\n");
}

const PG = {
  DIFFICULTY, ACCESSORIES, MODES, MEALS, TAG_GROUPS, AISLE_ORDER,
  esc, fold, newId, rand, num, str, clamp, fmtMin, fmtNum, cap, pl,
  canonUnit, fmtQty, fmtTime, fmtDur, fmtGrams, fmtVol, nutriEntry, nutriSource, nutriKey, nutriTable, cleanNutri, setCustomNutri, nutrition, allergensOf, aisleOf,
  cleanRecipe, cleanMeta, cleanCollections, cleanShop, cleanPlan, cleanSavedPlans, weekToDays, recipeKey, sameContent, duplicateGroups, bioactiveOf,
  stepSeconds, timeLabel, convertIng, ingKey, stepIngredients, recipeMatches, fridgeScore,
  addToShop, groupShop, shopLine, shopText, scaledItems,
  isoDate, parseIso, addDays, weekStart,
  parseIngredientLine, parseStepSettings, parseRecipeText, extractRecipe, recipeToText
};
if (typeof module !== "undefined" && module.exports) module.exports = PG; else root.PG = PG;
})(typeof globalThis !== "undefined" ? globalThis : this);
