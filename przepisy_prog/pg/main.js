"use strict";
(async function main() {
  loadState();
  applyTheme();
  $("themeBtn").onclick = cycleTheme;
  initRecipes();
  initPlanning();
  initNutri();
  initTimers();
  initBackup();
  renderShopBadge();
  renderFilters();
  renderList();
  await loadPhotos();
  if (S.view === "list") renderList();
  if (location.protocol === "http:" || location.protocol === "https:") {
    navigator.serviceWorker?.register("sw.js").catch(() => {});
  }
})();
