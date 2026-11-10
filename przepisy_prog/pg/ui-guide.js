"use strict";
// Poradnik: treść z guide.js, plan 7 dni (PLAN_WEEK) z wstawianiem do planera i listy zakupów, udostępnianie.

const guideDay = day => {
  const t = { kcal: 0, p: 0 };
  for (const [, rid] of day) { const r = byId(rid); if (r) { const n = PG.nutrition(r); t.kcal += n.kcal; t.p += n.p; } }
  return t;
};
const roundTo = (n, s) => Math.round(n / s) * s;
const appUrl = () => /^https?:$/.test(location.protocol) ? location.href.split("#")[0] : "";

function guideSection(title, body, open) {
  return `<details class="guide-sec"${open ? " open" : ""}><summary>${esc(title)}</summary>${body}</details>`;
}
const guideCards = list => `<div class="guide-cards">${list.map(x => `<div class="guide-card"><b>${esc(x.h)}</b><p>${esc(x.p)}</p></div>`).join("")}</div>`;
const guideList = list => `<ul class="guide-list">${list.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`;

function renderGuide() {
  const G = GUIDE;
  const week = PLAN_WEEK.map((day, i) => {
    const s = guideDay(day);
    return `<div class="guide-day"><div class="guide-day-h"><b>Dzień ${i + 1}</b><small>ok. ${roundTo(s.kcal, 50)} kcal, ${s.p} g białka</small></div>
      ${day.map(([meal, rid]) => { const r = byId(rid); return r ? `<div class="guide-meal"><span>${esc(meal)}</span><button type="button" data-a="open" data-rid="${esc(rid)}">${esc(r.emoji)} ${esc(r.name)}</button></div>` : ""; }).join("")}</div>`;
  }).join("");
  $("guideView").innerHTML = `
    <div class="head"><h1>Poradnik</h1>
      <div class="row"><button class="secondary small" data-a="share">Udostępnij</button><button class="secondary small" data-a="print">Drukuj</button></div></div>
    <div class="guide-hero"><h2>${esc(G.title)}</h2><p>${esc(G.lead)}</p>
      <div class="actions"><button class="primary" data-a="insert">Wstaw plan od dziś</button><button class="secondary" data-a="shopOnly">Tylko lista zakupów</button></div></div>
    <h2 class="guide-h">Plan na 7 dni</h2>
    <p class="muted guide-note">Wartości są szacunkiem na jedną osobę. Porcje dopasuj do apetytu i aktywności. Każdy przepis ma też alergeny i wartości odżywcze.</p>
    <div class="guide-week">${week}</div>
    <h2 class="guide-h">Zasady</h2>${guideCards(G.rules)}
    ${guideSection("Talerz roślinny", guideCards(G.plate))}
    ${guideSection("Zboża i strączki: pary, które działają", `<table class="guide-table"><thead><tr><th>Baza</th><th>Dodaj</th><th>Przykład</th></tr></thead><tbody>${G.pairs.map(p => `<tr>${p.map(c => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</tbody></table><p class="muted guide-note">${esc(G.pairsNote)}</p>`)}
    ${guideSection("Mity i fakty", `<div class="guide-cards">${G.myths.map(([m, f]) => `<div class="guide-card"><b class="myth">Mit: ${esc(m)}</b><p><b>Fakt:</b> ${esc(f)}</p></div>`).join("")}</div>`)}
    ${guideSection("Na co zwrócić uwagę (składniki i suplementy)", guideCards(G.nutrients))}
    ${guideSection("Praktyczne wskazówki", guideList(G.tips))}
    ${guideSection("Kiedy skonsultować się z lekarzem lub dietetykiem", guideList(G.doctor))}
    <div class="guide-warn">${esc(G.disclaimer)}</div>
    <p class="note">Źródła: ${esc(G.sources.join(" "))}</p>
    <div class="actions foot"><button class="secondary small" data-a="app">Poleć aplikację znajomym</button></div>`;
}

function guideText() {
  const G = GUIDE, L = [G.title, "", G.lead, "", "ZASADY"];
  G.rules.forEach(r => L.push(`- ${r.h}: ${r.p}`));
  L.push("", "PLAN NA 7 DNI (szacunek na osobę)");
  PLAN_WEEK.forEach((day, i) => {
    const s = guideDay(day);
    L.push(`Dzień ${i + 1} (ok. ${roundTo(s.kcal, 50)} kcal, ${s.p} g białka): ` + day.map(([m, rid]) => `${m}: ${byId(rid)?.name || "(usunięty przepis)"}`).join("; "));
  });
  L.push("", "NA CO ZWRÓCIĆ UWAGĘ");
  G.nutrients.forEach(n => L.push(`- ${n.h}: ${n.p}`));
  L.push("", G.disclaimer);
  if (appUrl()) L.push("", `Aplikacja z przepisami i listą zakupów: ${appUrl()}`);
  return L.join("\n");
}

function guidePrintHtml() {
  const G = GUIDE;
  return `<h1>${esc(G.title)}</h1><p>${esc(G.lead)}</p>
    <h2>Zasady</h2><ul>${G.rules.map(r => `<li><b>${esc(r.h)}.</b> ${esc(r.p)}</li>`).join("")}</ul>
    <h2>Plan na 7 dni</h2><ul>${PLAN_WEEK.map((day, i) => `<li><b>Dzień ${i + 1}:</b> ${day.map(([m, rid]) => `${esc(m)}: ${esc(byId(rid)?.name || "(usunięty przepis)")}`).join("; ")}</li>`).join("")}</ul>
    <h2>Na co zwrócić uwagę</h2><ul>${G.nutrients.map(n => `<li><b>${esc(n.h)}.</b> ${esc(n.p)}</li>`).join("")}</ul>
    <p><i>${esc(G.disclaimer)}</i></p>`;
}

async function guideAskPeople() {
  const v = await ask("Dla ilu osób? (1–12)", { value: "1" });
  if (v == null) return 0;
  const n = Math.round(PG.num(String(v).replace(",", ".")));
  return n >= 1 ? PG.clamp(n, 1, 12) : 0;
}
function guideAddShop(n) {
  for (const [, rid] of PLAN_WEEK.flat()) { const r = byId(rid); if (r) addRecipeToShop(r, n); }
}
async function guideInsertPlan() {
  const n = await guideAskPeople();
  if (!n) return;
  const start = todayIso(), days = Array.from({ length: 7 }, (_, i) => PG.addDays(start, i));
  if (days.some(d => (S.plan[d] || []).length) && !(await confirmAsk("W najbliższych 7 dniach masz już zaplanowane posiłki. Dodać plan obok nich?"))) return;
  PLAN_WEEK.forEach((day, i) => {
    const add = day.filter(([, rid]) => byId(rid)).map(([meal, rid]) => ({ id: PG.newId(), rid, meal, servings: n }));
    S.plan[days[i]] = [...(S.plan[days[i]] || []), ...add];
  });
  savePlan();
  const shop = await confirmAsk("Plan dodany. Dodać też składniki całego planu do listy zakupów?");
  if (shop) guideAddShop(n);
  P.week = PG.weekStart(start);
  showSection("plan");
  toast(shop ? "Plan i lista zakupów gotowe." : "Plan dodany do planera.", shop ? "Zakupy" : "", () => showSection("shop"));
}

function initGuide() {
  $("guideView").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    const a = b.dataset.a;
    if (a === "open") openRecipe(b.dataset.rid);
    else if (a === "insert") guideInsertPlan();
    else if (a === "shopOnly") {
      const n = await guideAskPeople();
      if (!n) return;
      guideAddShop(n);
      toast("Dodano składniki planu 7 dni do listy zakupów.", "Pokaż", () => showSection("shop"));
    }
    else if (a === "share") shareText(GUIDE.title, guideText());
    else if (a === "print") { $("printArea").innerHTML = guidePrintHtml(); window.print(); }
    else if (a === "app") shareText("Przewodnik gotowania", `${GUIDE.title}: gotowy plan, przepisy z timerami i lista zakupów w jednej aplikacji.${appUrl() ? "\n" + appUrl() : ""}`);
  });
  $("planGuide").onclick = () => showSection("guide");
}
