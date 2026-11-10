"use strict";
// Zakupy, plan tygodnia, lodówka, import z tekstu/adresu, nawigacja.

// ---------- Zakupy ----------
function addRecipeToShop(r, servings) {
  S.shop = PG.addToShop(S.shop, PG.scaledItems(r, servings), r.name);
  saveShop();
}
function renderShop() {
  const groups = PG.groupShop(S.shop);
  $("shopList").innerHTML = groups.length ? groups.map(([a, items]) => `<div class="shop-group"><h3>${esc(a)}</h3>${items.map(i => `
    <div class="shop-item${i.done ? " done" : ""}" data-id="${esc(i.id)}">
      <input type="checkbox" aria-label="Kupione"${i.done ? " checked" : ""}>
      <span class="txt">${esc(PG.shopLine(i))}${i.from.length ? `<small>${esc(i.from.join(", "))}</small>` : ""}</span>
      <button type="button" aria-label="Usuń pozycję">✕</button></div>`).join("")}</div>`).join("")
    : `<p class="muted" style="text-align:center">Lista jest pusta. Dodaj pozycje ręcznie albo z przepisu lub planu tygodnia.</p>`;
  renderShopBadge();
}
function shopPrintHtml() {
  return `<h1>Lista zakupów</h1>${PG.groupShop(S.shop.filter(i => !i.done)).map(([a, items]) =>
    `<h2>${esc(a)}</h2><ul>${items.map(i => `<li>☐ ${esc(PG.shopLine(i))}</li>`).join("")}</ul>`).join("")}`;
}
function bindShop() {
  $("shopForm").addEventListener("submit", e => {
    e.preventDefault();
    const it = PG.parseIngredientLine($("shopInput").value);
    if (!it) return;
    S.shop = PG.addToShop(S.shop, [it], ""); saveShop();
    $("shopInput").value = ""; renderShop();
  });
  $("shopList").addEventListener("click", e => {
    const row = e.target.closest("[data-id]");
    if (!row) return;
    if (e.target.matches("input[type=checkbox]")) { const i = S.shop.find(x => x.id === row.dataset.id); if (i) i.done = e.target.checked; }
    else if (e.target.closest("button")) S.shop = S.shop.filter(x => x.id !== row.dataset.id);
    else return;
    saveShop(); renderShop();
  });
  $("shopClearDone").onclick = () => { S.shop = S.shop.filter(i => !i.done); saveShop(); renderShop(); };
  $("shopClearAll").onclick = async () => { if (S.shop.length && await confirmAsk("Wyczyścić całą listę zakupów?")) { S.shop = []; saveShop(); renderShop(); } };
  $("shopCopy").onclick = () => { const t = PG.shopText(S.shop); t ? copyText(t) : toast("Lista jest pusta."); };
  $("shopShare").onclick = () => { const t = PG.shopText(S.shop); t ? shareText("Lista zakupów", t) : toast("Lista jest pusta."); };
  $("shopPrint").onclick = () => { $("printArea").innerHTML = shopPrintHtml(); window.print(); };
  $("toShop").onclick = () => {
    const r = byId(S.cur);
    addRecipeToShop(r, S.servings);
    toast("Dodano składniki do listy zakupów.", "Pokaż", () => showSection("shop"));
  };
}

// ---------- Plan tygodnia ----------
const P = { week: PG.weekStart(todayIso()) };
const dayLabel = iso => PG.parseIso(iso).toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long" });
function renderPlan() {
  const days = Array.from({ length: 7 }, (_, i) => PG.addDays(P.week, i)), today = todayIso();
  const short = iso => PG.parseIso(iso).toLocaleDateString("pl-PL", { day: "numeric", month: "numeric" });
  $("weekToday").textContent = `${short(days[0])} – ${short(days[6])}`;
  const recs = allRecipes().slice().sort((a, b) => a.name.localeCompare(b.name, "pl"));
  const opts = recs.map(r => `<option value="${esc(r.id)}">${esc(r.emoji)} ${esc(r.name)}</option>`).join("");
  const meals = PG.MEALS.map(m => `<option>${esc(m)}</option>`).join("");
  $("planDays").innerHTML = days.map(d => {
    const list = S.plan[d] || [];
    return `<div class="day${d === today ? " today" : ""}" data-day="${d}"><h3><span>${esc(PG.cap(dayLabel(d)))}</span>${d === today ? `<span class="badge">dziś</span>` : ""}</h3>
      ${list.map(e => { const r = byId(e.rid); return `<div class="plan-entry" data-id="${esc(e.id)}">
        <span class="meal">${esc(e.meal)}</span>
        ${r ? `<button class="nm" data-a="open" data-rid="${esc(r.id)}">${esc(r.emoji)} ${esc(r.name)}</button>` : `<span class="nm muted">(usunięty przepis)</span>`}
        <button class="x" data-a="serv" aria-label="Zmień liczbę porcji">${e.servings} porc.</button>
        <button class="x" data-a="del" aria-label="Usuń z planu">✕</button></div>`; }).join("")}
      <div class="plan-add"><select data-f="rid" aria-label="Przepis">${opts}</select><select data-f="meal" aria-label="Posiłek">${meals}</select>
        <button class="secondary small" data-a="add">Dodaj</button></div></div>`;
  }).join("");
}
function bindPlan() {
  $("weekPrev").onclick = () => { P.week = PG.addDays(P.week, -7); renderPlan(); };
  $("weekNext").onclick = () => { P.week = PG.addDays(P.week, 7); renderPlan(); };
  $("weekToday").onclick = () => { P.week = PG.weekStart(todayIso()); renderPlan(); };
  $("planDays").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]"), day = e.target.closest("[data-day]")?.dataset.day;
    if (!b || !day) return;
    const a = b.dataset.a, list = S.plan[day] || [], row = b.closest("[data-id]");
    if (a === "open") { openRecipe(b.dataset.rid); return; }
    if (a === "add") {
      const box = b.closest(".plan-add"), rid = box.querySelector("[data-f=rid]").value, r = byId(rid);
      if (!r) return;
      S.plan[day] = [...list, { id: PG.newId(), rid, meal: box.querySelector("[data-f=meal]").value, servings: r.servings }];
    } else if (a === "del") {
      const rest = list.filter(x => x.id !== row.dataset.id);
      if (rest.length) S.plan[day] = rest; else delete S.plan[day];
    } else if (a === "serv") {
      const en = list.find(x => x.id === row.dataset.id), v = Math.round(PG.num(((await ask("Liczba porcji", { value: String(en.servings) })) || "").replace(",", ".")));
      if (!(v >= 1)) return;
      en.servings = PG.clamp(v, 1, 24);
    }
    savePlan(); renderPlan();
  });
  $("planToShop").onclick = () => {
    let n = 0;
    for (let i = 0; i < 7; i++) for (const e of S.plan[PG.addDays(P.week, i)] || []) {
      const r = byId(e.rid);
      if (r) { addRecipeToShop(r, e.servings); n++; }
    }
    if (n) toast(`Dodano składniki z ${n} ${PG.pl(n, "posiłku", "posiłków", "posiłków")}.`, "Pokaż", () => showSection("shop"));
    else toast("W tym tygodniu nie zaplanowano żadnych posiłków.");
  };
  $("planSave").onclick = async () => {
    const days = PG.weekToDays(S.plan, P.week);
    if (!days.some(d => d.length)) return toast("W tym tygodniu nie zaplanowano żadnych posiłków.");
    const name = ((await ask("Nazwa planu", { value: `Plan ${$("weekToday").textContent}` })) || "").trim().slice(0, 40);
    if (!name) return;
    const old = S.plans.find(p => p.name.toLowerCase() === name.toLowerCase());
    if (old && !(await confirmAsk(`Plan "${name}" już istnieje. Nadpisać?`))) return;
    if (!old && S.plans.length >= 30) return toast("Można zapisać maksymalnie 30 planów. Usuń niepotrzebne.");
    const rec = { id: old?.id || PG.newId(), name, saved: Date.now(), days };
    S.plans = old ? S.plans.map(p => (p === old ? rec : p)) : [...S.plans, rec];
    savePlans(); toast(`Zapisano plan "${name}".`);
  };
  $("planLoad").onclick = () => { renderSavedPlans(); $("plansDlg").showModal(); };
  $("plansClose").onclick = () => $("plansDlg").close();
  $("plansList").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]"), p = S.plans.find(x => x.id === b?.closest("[data-id]")?.dataset.id);
    if (!p) return;
    if (b.dataset.a === "del") {
      if (await confirmAsk(`Usunąć plan "${p.name}"?`)) { S.plans = S.plans.filter(x => x !== p); savePlans(); renderSavedPlans(); }
      return;
    }
    const replace = b.dataset.a === "replace";
    if (replace && PG.weekToDays(S.plan, P.week).some(d => d.length) && !(await confirmAsk("Zastąpić obecny plan tego tygodnia?"))) return;
    let n = 0, miss = 0;
    p.days.forEach((list, i) => {
      const day = PG.addDays(P.week, i), keep = replace ? [] : S.plan[day] || [], add = [];
      for (const x of list) { if (byId(x.rid)) add.push({ id: PG.newId(), ...x }), n++; else miss++; }
      const all = [...keep, ...add];
      if (all.length) S.plan[day] = all; else delete S.plan[day];
    });
    savePlan(); renderPlan(); $("plansDlg").close();
    toast(`Wczytano plan "${p.name}" (${n} ${PG.pl(n, "posiłek", "posiłki", "posiłków")})${miss ? `, pominięto usunięte przepisy: ${miss}` : ""}.`);
  });
}
function renderSavedPlans() {
  $("plansList").innerHTML = S.plans.length ? S.plans.map(p => {
    const n = p.days.reduce((s, d) => s + d.length, 0);
    return `<div class="saved-plan" data-id="${esc(p.id)}"><div><b>${esc(p.name)}</b><small class="muted">${n} ${PG.pl(n, "posiłek", "posiłki", "posiłków")}</small></div>
      <div class="actions"><button class="secondary small" data-a="replace">Zastąp tydzień</button><button class="secondary small" data-a="merge">Dodaj do tygodnia</button><button class="secondary small" data-a="del" aria-label="Usuń plan">✕</button></div></div>`;
  }).join("") : `<p class="muted" style="text-align:center">Brak zapisanych planów. Zaplanuj tydzień i użyj przycisku "Zapisz ten tydzień jako plan".</p>`;
}

// ---------- Lodówka ----------
function renderFridge() {
  $("fridgeChips").innerHTML = S.fridge.map((t, i) => `<button type="button" class="chip on" data-i="${i}" aria-label="Usuń ${esc(t)}">${esc(t)} ✕</button>`).join("");
  if (!S.fridge.length) { $("fridgeResults").innerHTML = `<p class="muted" style="text-align:center">Wpisz składniki, które masz w domu – aplikacja podpowie pasujące przepisy.</p>`; return; }
  const hits = allRecipes().map(r => ({ r, s: PG.fridgeScore(r, S.fridge) })).filter(x => x.s.matched.length)
    .sort((a, b) => b.s.ratio - a.s.ratio || a.s.missing.length - b.s.missing.length);
  $("fridgeResults").innerHTML = hits.length ? hits.map(({ r, s }) => `<div class="fridge-hit" data-id="${esc(r.id)}">
    <b>${esc(r.emoji)} ${esc(r.name)}</b>
    <div class="bar"><i style="width:${Math.round(s.ratio * 100)}%"></i></div>
    <small class="muted">Masz ${s.matched.length} z ${s.total} składników${s.missing.length ? `. Brakuje: ${esc(s.missing.join(", "))}` : " – wszystko jest!"}</small>
    <div class="actions" style="margin-top:8px"><button class="secondary small" data-a="open">Otwórz</button>${s.missing.length ? `<button class="secondary small" data-a="miss">Brakujące do zakupów</button>` : ""}</div></div>`).join("")
    : `<p class="muted" style="text-align:center">Żaden przepis nie pasuje do tych składników.</p>`;
}
function bindFridge() {
  $("fridgeForm").addEventListener("submit", e => {
    e.preventDefault();
    const add = $("fridgeInput").value.split(/[,;\n]/).map(x => x.trim().slice(0, 40)).filter(Boolean);
    S.fridge = [...new Set([...S.fridge, ...add])].slice(0, 40);
    saveFridge(); $("fridgeInput").value = ""; renderFridge();
  });
  $("fridgeChips").addEventListener("click", e => {
    const c = e.target.closest("[data-i]");
    if (c) { S.fridge.splice(+c.dataset.i, 1); saveFridge(); renderFridge(); }
  });
  $("fridgeResults").addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"), id = b?.closest("[data-id]")?.dataset.id, r = id && byId(id);
    if (!r) return;
    if (b.dataset.a === "open") openRecipe(id);
    else {
      const miss = new Set(PG.fridgeScore(r, S.fridge).missing);
      S.shop = PG.addToShop(S.shop, PG.scaledItems(r, r.servings).filter(i => miss.has(i.n)), r.name); saveShop();
      toast("Dodano brakujące składniki.", "Pokaż", () => showSection("shop"));
    }
  });
}

// ---------- Import z tekstu / adresu ----------
function bindImportDialog() {
  const dlg = $("importDlg"), err = m => { $("impErr").textContent = m; $("impErr").classList.toggle("hidden", !m); };
  $("importTextBtn").onclick = () => { $("impText").value = ""; $("impUrl").value = ""; err(""); dlg.showModal(); };
  $("impCancel").onclick = () => dlg.close();
  $("impFetch").onclick = async () => {
    err("");
    let url;
    try { url = new URL($("impUrl").value.trim()); if (!/^https?:$/.test(url.protocol)) throw 0; } catch { return err("Podaj poprawny adres http(s)."); }
    try {
      const res = await fetch(url.href, { credentials: "omit", referrerPolicy: "no-referrer" });
      if (!res.ok) throw 0;
      const text = await res.text();
      $("impText").value = text.slice(0, 2e6);
    } catch { err("Strona nie pozwala na pobranie z przeglądarki. Otwórz ją, skopiuj tekst przepisu lub kod źródłowy (Ctrl+U) i wklej poniżej."); }
  };
  $("impGo").onclick = () => {
    const r = PG.extractRecipe($("impText").value);
    if (!r) return err("Nie rozpoznano przepisu. Tekst powinien zawierać nazwę w pierwszej linii oraz sekcje „Składniki” i „Przygotowanie”.");
    dlg.close();
    openEditor(null, { ...r, tags: [], photoData: null });
    toast("Sprawdź i popraw dane przed zapisaniem.");
  };
}

// ---------- Nawigacja ----------
function showSection(sec) {
  showView(sec);
  ({ list: () => { renderFilters(); renderList(); }, plan: renderPlan, shop: renderShop, fridge: renderFridge, guide: renderGuide })[sec]();
}
function initPlanning() {
  $("mainNav").addEventListener("click", e => { const b = e.target.closest("button[data-sec]"); if (b) showSection(b.dataset.sec); });
  bindShop(); bindPlan(); bindFridge(); bindImportDialog(); initGuide();
}
