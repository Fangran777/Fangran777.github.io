"use strict";
// Wartości odżywcze składników: własne wpisy nadpisują tabelę i dotyczą wszystkich przepisów.
// Edycja z poziomu przepisu (okno ze składnikami) oraz osobny widok całej tabeli.
let nutriCur = null;
const NUTRI_FIELDS = ["kcal", "p", "f", "c", "d", "g"];
const nf = v => v == null ? "" : PG.fmtNum(v);

function nutriLine(e) { return `${nf(e[1])} kcal, białko ${nf(e[2])} g, tłuszcz ${nf(e[3])} g, węgl. ${nf(e[4])} g na 100 g`; }

function showNutriPane(form) {
  $("nutriListPane").classList.toggle("hidden", form);
  $("nutriForm").classList.toggle("hidden", !form);
}
function renderNutriList() {
  const r = byId(S.cur);
  showNutriPane(false);
  $("nutriList").innerHTML = r.ingredients.map((i, idx) => {
    const e = PG.nutriEntry(i.n), src = PG.nutriSource(i.n);
    const info = e ? `${src === "own" ? "Własne" : "Tabela"}: ${nutriLine(e)}` : "Brak w tabeli, składnik nie jest liczony";
    return `<div class="nutri-row" data-i="${idx}"><span>${esc(i.n)}<small class="${e ? "" : "warn-txt"}">${esc(info)}</small></span>
      <button type="button" class="secondary small" data-a="edit">${e ? "Edytuj" : "Dodaj"}</button></div>`;
  }).join("");
}

// from: "recipe" (wraca do listy składników przepisu) lub "table" (zamyka okno).
function openNutriForm({ key = "", vals = [], own = false, base = false, title, isNew = false, from }) {
  nutriCur = { key, own, base, isNew, from };
  const f = $("nutriForm");
  $("nutriName").textContent = title || "Nowy produkt";
  $("nutriNameWrap").classList.toggle("hidden", !isNew);
  f.elements.name.value = "";
  $("nutriScope").textContent = isNew
    ? "Nazwa jest zapisywana bez polskich znaków i dopasowywana do początku nazwy składnika."
    : `Dotyczy składników, których nazwa zaczyna się od „${key}”, we wszystkich przepisach.`;
  NUTRI_FIELDS.forEach((k, n) => { f.elements[k].value = nf(vals[n]); });
  $("nutriReset").textContent = base ? "Przywróć z tabeli" : "Usuń produkt";
  $("nutriReset").classList.toggle("hidden", !own);
  $("nutriErr").classList.add("hidden");
  showNutriPane(true);
  (isNew ? f.elements.name : f.elements.kcal).focus();
}
function openNutriForRecipe(idx) {
  const i = byId(S.cur).ingredients[idx], e = PG.nutriEntry(i.n), src = PG.nutriSource(i.n);
  // Przy składniku z tabeli zmieniamy cały wiersz tabeli, a przy nieznanym tworzymy nowy wpis o jego nazwie.
  const row = e && PG.nutriTable().find(t => t.key === e[0]);
  openNutriForm({ key: e ? e[0] : PG.nutriKey(i.n), vals: e ? e.slice(1) : [], own: src === "own", base: !!row?.base, title: i.n, from: "recipe" });
}
function nutriError(msg) { $("nutriErr").textContent = msg; $("nutriErr").classList.remove("hidden"); }
function saveNutriForm() {
  const f = $("nutriForm"), v = NUTRI_FIELDS.map(k => PG.num(f.elements[k].value.trim().replace(",", ".")));
  const key = nutriCur.isNew ? PG.nutriKey(f.elements.name.value) : nutriCur.key;
  if (!key) return nutriError("Podaj nazwę produktu.");
  const clean = PG.cleanNutri({ [key]: v })[key];
  if (!clean) return nutriError("Podaj kalorie (0–900) oraz białko, tłuszcz i węglowodany (0–100 g) na 100 g produktu.");
  S.nutri[key] = clean;
  applyNutri("Zapisano wartości składnika.");
}
function applyNutri(msg) {
  saveNutri(); PG.setCustomNutri(S.nutri);
  if (nutriCur.from === "recipe") { renderRecipe(); renderNutriList(); }
  else { $("nutriDlg").close(); renderNutriTable(); }
  toast(msg);
}

// ---------- Widok tabeli ----------
function renderNutriTable() {
  const q = PG.fold($("ntSearch").value.trim()), only = $("ntOnly").checked;
  const all = PG.nutriTable(), rows = all.filter(r => (!q || r.key.includes(q)) && (!only || r.own)).sort((a, b) => a.key.localeCompare(b.key, "pl"));
  $("ntBody").innerHTML = rows.map(r => `<tr data-key="${esc(r.key)}" tabindex="0">
    <td>${esc(r.key)}${r.own ? `<small>${r.base ? "zmienione" : "własny produkt"}</small>` : ""}</td>${r.v.slice(0, 4).map(n => `<td class="num">${nf(n)}</td>`).join("")}</tr>`).join("");
  const own = all.filter(r => r.own).length;
  $("ntCount").textContent = `Pozycje: ${rows.length} z ${all.length}. Własne lub zmienione: ${own}.`;
}
function openNutriFromTable(key) {
  const r = PG.nutriTable().find(t => t.key === key);
  if (!r) return;
  openNutriForm({ key, vals: r.v, own: r.own, base: r.base, title: key, from: "table" });
  $("nutriDlg").showModal();
}

function initNutri() {
  const dlg = $("nutriDlg");
  $("nutriEdit").onclick = () => { renderNutriList(); dlg.showModal(); };
  $("nutriClose").onclick = () => dlg.close();
  $("nutriBack").onclick = () => nutriCur?.from === "table" ? dlg.close() : renderNutriList();
  $("nutriList").addEventListener("click", e => { const row = e.target.closest("[data-i]"); if (row && e.target.closest("button")) openNutriForRecipe(+row.dataset.i); });
  $("nutriForm").addEventListener("submit", e => { e.preventDefault(); saveNutriForm(); });
  $("nutriReset").onclick = () => { delete S.nutri[nutriCur.key]; applyNutri(nutriCur.base ? "Przywrócono wartości z tabeli." : "Usunięto produkt."); };

  $("nutriTableBtn").onclick = () => { showView("nutri"); renderNutriTable(); };
  $("ntBackBtn").onclick = () => showSection("list");
  $("ntSearch").addEventListener("input", renderNutriTable);
  $("ntOnly").onchange = renderNutriTable;
  $("ntNew").onclick = () => { openNutriForm({ isNew: true, from: "table" }); dlg.showModal(); };
  $("ntBody").addEventListener("click", e => { const tr = e.target.closest("tr[data-key]"); if (tr) openNutriFromTable(tr.dataset.key); });
  $("ntBody").addEventListener("keydown", e => { const tr = e.target.closest("tr[data-key]"); if (tr && e.key === "Enter") openNutriFromTable(tr.dataset.key); });
  $("ntResetAll").onclick = async () => {
    if (!Object.keys(S.nutri).length) return toast("Nie ma własnych wartości do przywrócenia.");
    if (!(await confirmAsk("Usunąć wszystkie własne wartości i produkty oraz przywrócić tabelę domyślną?"))) return;
    S.nutri = {}; saveNutri(); PG.setCustomNutri(S.nutri); renderNutriTable();
    toast("Przywrócono tabelę domyślną.");
  };
}
