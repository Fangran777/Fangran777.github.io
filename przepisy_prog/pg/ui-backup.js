"use strict";
// Kopie zapasowe, import bez duplikatów, trwałość danych i instalacja aplikacji.

const BACKUP_LIMIT = 100e6;
function bundle(recipes, full, withPhotos = true) {
  const ids = new Set(recipes.map(r => r.id)), meta = {}, photos = {};
  for (const id of Object.keys(S.meta)) if (full || ids.has(id)) meta[id] = S.meta[id];
  if (withPhotos) for (const r of recipes) if (S.photos[r.id]) photos[r.id] = S.photos[r.id];
  return { app: "przewodnik-gotowania", version: 2, exported: new Date().toISOString(), recipes: withPhotos ? recipes : recipes.map(r => ({ ...r, photo: undefined })), meta, photos,
    ...(full ? { collections: S.cols, plan: S.plan, plans: S.plans, shop: S.shop, nutri: S.nutri, hidden: [...S.hidden] } : {}) };
}
const backupName = () => `przewodnik-gotowania-${todayIso()}.json`;
// Zbyt duża kopia ze zdjęciami nie dałaby się zaimportować, więc w takim razie zdjęcia są pomijane.
function backupJson(withPhotos) {
  let json = JSON.stringify(bundle(S.user, true, withPhotos)), trimmed = false;
  if (withPhotos && json.length > BACKUP_LIMIT) { json = JSON.stringify(bundle(S.user, true, false)); trimmed = true; }
  return { json, trimmed };
}
function markBackup() { store.set(KEY.backup, Date.now()); backupHidden = true; renderBackupBanner(); }
function exportAll(withPhotos = true) {
  const { json, trimmed } = backupJson(withPhotos);
  download(backupName(), json);
  markBackup();
  toast(trimmed ? "Kopia jest zbyt duża, więc zapisano ją bez zdjęć." : "Kopia zapasowa zapisana.");
}
async function shareBackup() {
  const { json, trimmed } = backupJson(true), file = new File([json], backupName(), { type: "application/json" });
  if (!navigator.canShare?.({ files: [file] })) return toast("Ta przeglądarka nie udostępnia plików. Użyj „Eksportuj kopię”.");
  try {
    await navigator.share({ files: [file], title: "Kopia przewodnika gotowania" });
    markBackup();
    toast(trimmed ? "Wysłano kopię bez zdjęć (z zdjęciami była zbyt duża)." : "Kopia wysłana.");
  } catch (e) { if (e.name !== "AbortError") toast("Nie udało się wysłać kopii."); }
}
function exportOne(id) {
  const r = byId(id);
  download(`${slug(r.name)}.json`, JSON.stringify(bundle([r], false)));
}
async function importBundle(raw) {
  const data = Array.isArray(raw) ? { recipes: raw } : raw;
  if (!data || typeof data !== "object" || !Array.isArray(data.recipes)) throw new Error("To nie jest plik z przepisami.");
  const map = new Map(), photoOf = id => data.photos && typeof data.photos === "object" && Object.hasOwn(data.photos, id) ? data.photos[id] : null;
  if (Array.isArray(data.hidden)) for (const id of data.hidden) if (BUILTIN_IDS.has(id)) S.hidden.add(id);
  const stat = { added: 0, updated: 0, skipped: 0 }, keep = new Set(), seen = new Map(allRecipes().map(r => [PG.recipeKey(r), r.id]));
  for (const x of data.recipes.slice(0, 500)) {
    const c = PG.cleanRecipe(x);
    if (!c) continue;
    const orig = c.id, key = PG.recipeKey(c), same = SAFE_ID.test(orig) && !BUILTIN_IDS.has(orig) ? S.user.find(u => u.id === orig) : null;
    if (S.hidden.has(orig) && PG.recipeKey(BUILTIN.find(b => b.id === orig)) === key) {
      S.hidden.delete(orig); map.set(orig, orig); stat.added++;
      continue;
    }
    // Ten sam id: nowsza edycja wygrywa. Gdy obie strony nie mają daty (stare kopie), wygrywa plik.
    const newer = same && (c.updated > same.updated || (!c.updated && !same.updated));
    if (same ? PG.sameContent(same, c) || !newer : seen.has(key)) {
      const id = same ? same.id : seen.get(key);
      if (!map.has(orig)) map.set(orig, id);
      keep.add(id); stat.skipped++;
      continue;
    }
    if (BUILTIN_IDS.has(orig) || !SAFE_ID.test(orig) || orig === "__proto__" || map.has(orig)) c.id = PG.newId();
    if (!map.has(orig)) map.set(orig, c.id);
    const ph = photoOf(orig), ok = photoOk(ph);
    delete c.photo; if (ok || (same && S.photos[c.id])) c.photo = true;
    const i = S.user.findIndex(u => u.id === c.id);
    if (i >= 0) { S.user[i] = c; stat.updated++; } else { S.user.push(c); stat.added++; }
    seen.set(PG.recipeKey(c), c.id);
    if (ok) await savePhoto(c.id, ph);
  }
  const target = id => map.get(id) ?? (typeof id === "string" && (BUILTIN_IDS.has(id) || S.user.some(r => r.id === id)) ? id : null);
  if (data.meta && typeof data.meta === "object") for (const k of Object.keys(data.meta)) {
    const t = target(k);
    if (t && !(keep.has(t) && S.meta[t])) S.meta[t] = PG.cleanMeta(data.meta[k]);
  }
  for (const c of PG.cleanCollections(data.collections)) {
    c.ids = c.ids.map(target).filter(Boolean);
    const i = S.cols.findIndex(x => x.id === c.id);
    if (i >= 0) S.cols[i] = c; else S.cols.push(c);
  }
  if (data.plan) {
    const p = PG.cleanPlan(data.plan);
    for (const [day, list] of Object.entries(p)) {
      const cur = S.plan[day] || [], have = new Set(cur.map(e => e.id));
      const add = list.map(e => ({ ...e, rid: target(e.rid) })).filter(e => e.rid && !have.has(e.id));
      if (add.length) S.plan[day] = [...cur, ...add];
    }
  }
  if (data.shop) S.shop = PG.addToShop(S.shop, PG.cleanShop(data.shop).filter(i => !i.done), "");
  for (const p of PG.cleanSavedPlans(data.plans)) {
    p.days = p.days.map(d => d.map(e => ({ ...e, rid: target(e.rid) })).filter(e => e.rid));
    if (!p.days.some(d => d.length)) continue;
    const i = S.plans.findIndex(x => x.id === p.id);
    if (i >= 0) S.plans[i] = p; else if (S.plans.length < 30) S.plans.push(p);
  }
  if (data.nutri) { S.nutri = { ...S.nutri, ...PG.cleanNutri(data.nutri) }; PG.setCustomNutri(S.nutri); saveNutri(); }
  saveUser(); saveMeta(); saveCols(); savePlan(); savePlans(); saveShop(); saveHidden();
  return stat;
}
async function importFile(file) {
  try {
    if (file.size > BACKUP_LIMIT) throw new Error("Plik jest zbyt duży.");
    const s = await importBundle(JSON.parse(await file.text()));
    renderFilters(); renderList();
    toast(`Import: nowe ${s.added}, zaktualizowane ${s.updated}, pominięte (już istnieją) ${s.skipped}.`);
  } catch (e) { toast(e instanceof SyntaxError ? "Plik nie jest poprawnym JSON-em." : e.message || "Import nie powiódł się."); }
}

// ---------- Trwałość danych, wysyłanie kopii, instalacja ----------
let installEvt = null;
async function initStorage() {
  const el = $("persistNote");
  if (!navigator.storage?.persist) { el.textContent = "Ta przeglądarka nie potwierdza trwałości danych – rób regularnie kopie zapasowe."; return; }
  let ok = await navigator.storage.persisted().catch(() => false);
  if (!ok) ok = await navigator.storage.persist().catch(() => false);
  const est = await navigator.storage.estimate?.().catch(() => null), used = est?.usage ? ` Zajęte miejsce: ${(est.usage / 1048576).toFixed(1)} MB.` : "";
  el.textContent = (ok ? "Pamięć danych: trwała – przeglądarka nie usunie jej sama." : "Pamięć danych: nietrwała – przeglądarka może ją usunąć przy braku miejsca, więc rób kopie zapasowe.") + used;
}
function initBackup() {
  initStorage();
  const probe = new File(["{}"], "a.json", { type: "application/json" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [probe] })) $("shareBtn").classList.remove("hidden");
  $("shareBtn").onclick = shareBackup;
  const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone;
  window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); installEvt = e; if (!standalone) $("installBtn").classList.remove("hidden"); });
  window.addEventListener("appinstalled", () => { installEvt = null; $("installBtn").classList.add("hidden"); toast("Aplikacja zainstalowana."); });
  if (!standalone && /iphone|ipad|ipod/i.test(navigator.userAgent)) $("installBtn").classList.remove("hidden");
  $("installBtn").onclick = async () => {
    if (!installEvt) { toast("W Safari: Udostępnij → Do ekranu początkowego. Szczegóły w Instrukcji."); return; }
    installEvt.prompt(); await installEvt.userChoice.catch(() => {}); installEvt = null; $("installBtn").classList.add("hidden");
  };
}