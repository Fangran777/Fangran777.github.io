"use strict";
// Usuwanie przepisów (także wbudowanych), wyszukiwanie duplikatów, czyszczenie listy.

// Usuwa przepisy (własne i wbudowane); zwraca funkcję cofającą.
function removeRecipes(ids) {
  const snaps = ids.map(byId).filter(Boolean).map(r => ({ r, id: r.id, builtin: isBuiltin(r.id), meta: S.meta[r.id], photo: S.photos[r.id], prog: S.progress[r.id],
    inCols: S.cols.filter(c => c.ids.includes(r.id)).map(c => c.id) }));
  const gone = new Set(snaps.map(s => s.id));
  for (const s of snaps) if (s.builtin) S.hidden.add(s.id);
  S.user = S.user.filter(x => !gone.has(x.id));
  for (const id of gone) { delete S.meta[id]; delete S.progress[id]; }
  S.cols.forEach(c => { c.ids = c.ids.filter(x => !gone.has(x)); });
  const planBefore = JSON.stringify(S.plan);
  for (const day of Object.keys(S.plan)) { S.plan[day] = S.plan[day].filter(e => !gone.has(e.rid)); if (!S.plan[day].length) delete S.plan[day]; }
  saveUser(); saveHidden(); saveMeta(); saveCols(); saveProgress(); savePlan();
  for (const id of gone) removePhoto(id);
  return async () => {
    S.plan = Object.assign(Object.create(null), JSON.parse(planBefore));
    for (const s of snaps) {
      if (s.builtin) S.hidden.delete(s.id); else S.user.push(s.r);
      if (s.meta) S.meta[s.id] = s.meta;
      if (s.prog) S.progress[s.id] = s.prog;
      S.cols.forEach(c => { if (s.inCols.includes(c.id)) c.ids.push(s.id); });
    }
    saveUser(); saveHidden(); saveMeta(); saveCols(); saveProgress(); savePlan();
    await Promise.all(snaps.filter(s => s.photo).map(s => savePhoto(s.id, s.photo)));
    renderFilters(); renderList();
  };
}
async function deleteRecipe(id) {
  const r = byId(id);
  if (!r || !(await confirmAsk(`Usunąć przepis „${r.name}”?${isBuiltin(id) ? " Wbudowane przepisy można przywrócić na dole listy." : ""}`))) return;
  const undo = removeRecipes([id]);
  showView("list"); renderFilters(); renderList();
  toast("Przepis usunięty.", "Cofnij", undo);
}
async function deleteSelected() {
  const ids = [...SEL.ids], n = ids.length;
  if (!n || !(await confirmAsk(`Usunąć zaznaczone przepisy (${n})? Wbudowane można potem przywrócić na dole listy.`))) return;
  const undo = removeRecipes(ids);
  setSelect(false); renderFilters();
  toast(`Usunięto przepisy: ${n}.`, "Cofnij", undo);
}

// ---------- Duplikaty ----------
let dupGroups = [];
function keepScore(r) {
  const m = metaOf(r.id);
  return (isBuiltin(r.id) ? 1000 : 0) + m.rating * 10 + m.history.length * 5 + m.notes.length * 3 + (m.fav ? 2 : 0) + (S.photos[r.id] ? 1 : 0);
}
function renderDups() {
  dupGroups = PG.duplicateGroups(allRecipes(), keepScore);
  $("dupList").innerHTML = dupGroups.length ? dupGroups.map((g, gi) => `<div class="dup-group" data-g="${gi}"><b>${esc(g[0].name)}</b>
    ${g.map((r, i) => `<div class="dup-row" data-id="${esc(r.id)}"><span>${esc(r.emoji)} ${esc(r.name)}<small class="muted">${isBuiltin(r.id) ? "wbudowany" : "własny"}${i === 0 ? ", sugerowany do zachowania" : ""}</small></span>
      <span class="row"><button class="secondary small" data-a="open">Otwórz</button><button class="danger small" data-a="del">Usuń</button></span></div>`).join("")}
    <button class="secondary small" data-a="dedupe">Zostaw jeden, usuń resztę</button></div>`).join("")
    : `<p class="muted" style="text-align:center">Nie znaleziono duplikatów.</p>`;
}
async function onDupClick(e) {
  const b = e.target.closest("button[data-a]");
  if (!b) return;
  const g = dupGroups[+b.closest("[data-g]").dataset.g], id = b.closest("[data-id]")?.dataset.id;
  if (b.dataset.a === "open") { $("dupDlg").close(); openRecipe(id); return; }
  const ids = b.dataset.a === "del" ? [id] : g.slice(1).map(r => r.id);
  const msg = b.dataset.a === "del" ? `Usunąć przepis „${byId(id).name}”?` : `Zostawić „${g[0].name}” i usunąć pozostałe (${ids.length})?`;
  if (!(await confirmAsk(msg))) return;
  removeRecipes(ids);
  renderFilters(); renderList(); renderDups();
}
async function deleteAllRecipes() {
  const n = allRecipes().length;
  if (!n) return toast("Nie ma przepisów do usunięcia.");
  const v = await ask(`Usunąć wszystkie przepisy (${n}), także wbudowane, razem z ocenami, notatkami i zdjęciami? Zalecana kopia zapasowa. Wpisz USUŃ, aby potwierdzić.`);
  if (PG.fold(v || "").trim() !== "usun") { if (v != null) toast("Nie usunięto. Wpisz słowo USUŃ."); return; }
  const snap = { user: S.user, hidden: S.hidden, meta: S.meta, progress: S.progress, photos: { ...S.photos }, cols: S.cols.map(c => [c.id, c.ids]), plan: JSON.stringify(S.plan) };
  S.user = []; S.hidden = new Set(BUILTIN_IDS); S.meta = Object.create(null); S.progress = Object.create(null); S.plan = Object.create(null);
  S.cols = S.cols.map(c => ({ ...c, ids: [] }));
  saveUser(); saveHidden(); saveMeta(); saveProgress(); saveCols(); savePlan();
  await Promise.all(Object.keys(snap.photos).map(removePhoto));
  showView("list"); renderFilters(); renderList();
  toast("Usunięto wszystkie przepisy.", "Cofnij", async () => {
    Object.assign(S, { user: snap.user, hidden: snap.hidden, meta: snap.meta, progress: snap.progress, plan: Object.assign(Object.create(null), JSON.parse(snap.plan)) });
    S.cols.forEach(c => { c.ids = snap.cols.find(x => x[0] === c.id)?.[1] || []; });
    saveUser(); saveHidden(); saveMeta(); saveProgress(); saveCols(); savePlan();
    await Promise.all(Object.entries(snap.photos).map(([id, d]) => savePhoto(id, d)));
    renderFilters(); renderList();
  });
}
function restoreBuiltin() {
  const n = S.hidden.size;
  S.hidden = new Set(); saveHidden();
  renderFilters(); renderList();
  toast(`Przywrócono wbudowane przepisy: ${n}.`);
}
