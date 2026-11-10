"use strict";
// Rdzeń interfejsu: pamięć, zdjęcia (IndexedDB), stan, toast, motyw, timery, ekran, głos.
const $ = id => document.getElementById(id);
const { esc } = PG;

// ---------- Pamięć ----------
const KEY = {
  recipes: "pg_recipes", meta: "pg_meta", cols: "pg_collections", shop: "pg_shop", plan: "pg_plan",
  progress: "pg_progress", theme: "pg_theme", timers: "pg_timers", backup: "pg_lastBackup", fridge: "pg_fridge", nutri: "pg_nutri", plans: "pg_plans", hidden: "pg_hidden"
};
const store = {
  get(k, def) { try { const v = JSON.parse(localStorage.getItem(k)); return v ?? def; } catch { return def; } },
  set(k, v) {
    try { localStorage.setItem(k, JSON.stringify(v)); return true; }
    catch { toast("Brak miejsca w pamięci przeglądarki – zrób kopię zapasową i usuń zbędne przepisy."); return false; }
  }
};

// ---------- Stan ----------
const withIds = r => ({ ...r, ingredients: r.ingredients.map((i, n) => ({ ...i, id: String(n) })) });
const BUILTIN = RECIPES.map(r => PG.cleanRecipe(withIds(r))).filter(Boolean);
const BUILTIN_IDS = new Set(BUILTIN.map(r => r.id));
const SAFE_ID = /^[\w-]{1,40}$/;

const S = {
  user: [], meta: Object.create(null), cols: [], shop: [], plan: Object.create(null), progress: Object.create(null),
  fridge: [], photos: Object.create(null), theme: "auto", timers: [], nutri: {}, plans: [], hidden: new Set(),
  view: "list", cur: null, tab: "ing", k: 1, servings: 4, unitMode: "orig", step: 0, checked: new Set(), big: false
};
// Usunięte przepisy wbudowane trafiają do S.hidden (kod aplikacji ich nie traci, można je przywrócić).
const allRecipes = () => [...BUILTIN.filter(r => !S.hidden.has(r.id)), ...S.user];
const byId = id => allRecipes().find(r => r.id === id);
const isBuiltin = id => BUILTIN_IDS.has(id);
const newMeta = () => ({ rating: 0, notes: [], history: [] });
const metaOf = id => S.meta[id] || newMeta();
const tagsOf = id => metaOf(id).tags ?? (typeof DEFAULT_TAGS !== "undefined" && Object.hasOwn(DEFAULT_TAGS, id) ? DEFAULT_TAGS[id] : []);
function patchMeta(id, patch) {
  S.meta[id] = PG.cleanMeta({ ...metaOf(id), ...patch });
  saveMeta();
}
const saveUser = () => store.set(KEY.recipes, S.user);
const saveMeta = () => store.set(KEY.meta, S.meta);
const saveCols = () => store.set(KEY.cols, S.cols);
const saveShop = () => { store.set(KEY.shop, S.shop); renderShopBadge(); };
const savePlan = () => store.set(KEY.plan, S.plan);
const saveProgress = () => store.set(KEY.progress, S.progress);
const saveFridge = () => store.set(KEY.fridge, S.fridge);
const saveNutri = () => store.set(KEY.nutri, S.nutri);
const savePlans = () => store.set(KEY.plans, S.plans);
const saveHidden = () => store.set(KEY.hidden, [...S.hidden]);

function loadState() {
  S.user = (store.get(KEY.recipes, []) || []).map(PG.cleanRecipe).filter(r => r && !BUILTIN_IDS.has(r.id) && SAFE_ID.test(r.id) && r.id !== "__proto__");
  const hid = store.get(KEY.hidden, []);
  S.hidden = new Set((Array.isArray(hid) ? hid : []).filter(id => BUILTIN_IDS.has(id)));
  const known = new Set([...BUILTIN_IDS, ...S.user.map(r => r.id)]), meta = store.get(KEY.meta, {});
  S.meta = Object.create(null);
  if (meta && typeof meta === "object") for (const id of Object.keys(meta)) if (known.has(id)) S.meta[id] = PG.cleanMeta(meta[id]);
  S.cols = PG.cleanCollections(store.get(KEY.cols, []));
  S.shop = PG.cleanShop(store.get(KEY.shop, []));
  S.plan = Object.assign(Object.create(null), PG.cleanPlan(store.get(KEY.plan, {})));
  S.plans = PG.cleanSavedPlans(store.get(KEY.plans, []));
  const pr = store.get(KEY.progress, {});
  S.progress = Object.create(null);
  if (pr && typeof pr === "object") for (const id of Object.keys(pr)) {
    const p = pr[id];
    if (known.has(id) && p && Number.isInteger(p.step) && p.step >= 0 && PG.num(p.k) > 0) S.progress[id] = { step: p.step, k: PG.clamp(+p.k, 0.1, 24), ts: PG.num(p.ts) || 0 };
  }
  const f = store.get(KEY.fridge, []);
  S.fridge = (Array.isArray(f) ? f : []).filter(x => typeof x === "string" && x.trim()).map(x => x.trim().slice(0, 40)).slice(0, 40);
  const th = store.get(KEY.theme, "auto");
  S.nutri = PG.cleanNutri(store.get(KEY.nutri, {})); PG.setCustomNutri(S.nutri);
  S.theme = ["auto", "light", "dark"].includes(th) ? th : "auto";
}

// ---------- Zdjęcia (IndexedDB) ----------
const PHOTO_RX = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
const photoOk = s => typeof s === "string" && s.length < 1.5e6 && PHOTO_RX.test(s);
const idb = {
  db: null,
  open() {
    if (this.db) return Promise.resolve(this.db);
    return new Promise((res, rej) => {
      if (!window.indexedDB) return rej(new Error("no idb"));
      const q = indexedDB.open("pg", 1);
      q.onupgradeneeded = () => q.result.createObjectStore("photos");
      q.onsuccess = () => res(this.db = q.result);
      q.onerror = () => rej(q.error);
    });
  },
  async run(mode, fn) {
    const db = await this.open();
    return new Promise((res, rej) => {
      const tx = db.transaction("photos", mode), st = tx.objectStore("photos");
      const out = fn(st);
      tx.oncomplete = () => res(out?.result);
      tx.onerror = tx.onabort = () => rej(tx.error);
    });
  },
  put(id, v) { return this.run("readwrite", s => s.put(v, id)); },
  del(id) { return this.run("readwrite", s => s.delete(id)); },
  async loadAll() {
    const db = await this.open();
    return new Promise((res, rej) => {
      const out = {}, q = db.transaction("photos").objectStore("photos").openCursor();
      q.onsuccess = () => { const c = q.result; if (c) { if (photoOk(c.value)) out[c.key] = c.value; c.continue(); } else res(out); };
      q.onerror = () => rej(q.error);
    });
  }
};
async function loadPhotos() {
  try { Object.assign(S.photos, await idb.loadAll()); } catch { /* brak IndexedDB – zdjęcia wyłączone */ }
}
async function savePhoto(id, dataUrl) {
  try { await idb.put(id, dataUrl); S.photos[id] = dataUrl; return true; }
  catch { toast("Nie udało się zapisać zdjęcia."); return false; }
}
async function removePhoto(id) {
  delete S.photos[id];
  try { await idb.del(id); } catch { /* ignoruj */ }
}
function resizePhoto(file, max = 900) {
  return new Promise((res, rej) => {
    if (!file || !/^image\//.test(file.type)) return rej(new Error("To nie jest obraz."));
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.max(1, Math.round(img.width * k)); c.height = Math.max(1, Math.round(img.height * k));
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error("Nie można odczytać obrazu.")); };
    img.src = url;
  });
}

// ---------- Komunikaty ----------
let toastTimer;
function toast(msg, label, fn) {
  const t = $("toast");
  t.innerHTML = `<span>${esc(msg)}</span>${label ? `<button type="button">${esc(label)}</button>` : ""}`;
  t.classList.remove("hidden");
  t.querySelector("button")?.addEventListener("click", () => { t.classList.add("hidden"); fn?.(); });
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add("hidden"), label ? 7000 : 3500);
}

// Własne okna zamiast prompt()/confirm() (działają też w osadzonych widokach i aplikacji PWA).
function ask(title, { value = "", input = true } = {}) {
  return new Promise(res => {
    const d = $("askDlg"), inp = $("askInput");
    $("askTitle").textContent = title; inp.classList.toggle("hidden", !input); inp.value = value;
    const done = v => { d.close(); res(v); };
    $("askOk").onclick = () => done(input ? inp.value : true);
    $("askCancel").onclick = () => done(input ? null : false);
    inp.onkeydown = e => { if (e.key === "Enter") { e.preventDefault(); done(inp.value); } };
    d.oncancel = e => { e.preventDefault(); done(input ? null : false); };
    d.showModal();
    if (input) inp.select(); else $("askOk").focus();
  });
}
const confirmAsk = title => ask(title, { input: false });

// ---------- Pliki, schowek, udostępnianie ----------
function download(name, text, mime = "application/json") {
  const a = document.createElement("a"), url = URL.createObjectURL(new Blob([text], { type: mime }));
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast("Skopiowano do schowka."); }
  catch {
    const ta = Object.assign(document.createElement("textarea"), { value: text });
    document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); toast("Skopiowano do schowka."); } catch { toast("Nie udało się skopiować."); }
    ta.remove();
  }
}
async function shareText(title, text) {
  if (navigator.share) { try { await navigator.share({ title, text }); return; } catch (e) { if (e.name === "AbortError") return; } }
  copyText(text);
}
const slug = s => PG.fold(s).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "przepis";
const todayIso = () => PG.isoDate(new Date());

// ---------- Motyw ----------
const THEME_ICON = { auto: "🌓", light: "☀️", dark: "🌙" };
function applyTheme() {
  const root = document.documentElement;
  if (S.theme === "auto") root.removeAttribute("data-theme"); else root.dataset.theme = S.theme;
  $("themeBtn").textContent = THEME_ICON[S.theme];
  $("themeBtn").title = "Motyw: " + { auto: "automatyczny", light: "jasny", dark: "ciemny" }[S.theme];
}
function cycleTheme() {
  S.theme = { auto: "light", light: "dark", dark: "auto" }[S.theme];
  store.set(KEY.theme, S.theme); applyTheme();
}

// ---------- Dźwięk, powiadomienia, timery ----------
let audio, ringLoop;
function ensureAudio() {
  try { audio ||= new (window.AudioContext || window.webkitAudioContext)(); if (audio.state === "suspended") audio.resume(); } catch { /* brak dźwięku */ }
}
function beep() {
  if (!audio) return;
  [0, 0.25, 0.5].forEach(d => {
    const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + d;
    o.frequency.value = 880; g.gain.setValueAtTime(0.25, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
    o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + 0.2);
  });
}
async function notify(title, body) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const reg = await navigator.serviceWorker?.getRegistration?.();
    if (reg?.showNotification) reg.showNotification(title, { body, tag: "pg-timer", icon: "icon.svg" });
    else new Notification(title, { body, icon: "icon.svg" });
  } catch { /* ignoruj */ }
}
const saveTimers = () => store.set(KEY.timers, S.timers);
function loadTimers() {
  const t = store.get(KEY.timers, []);
  S.timers = (Array.isArray(t) ? t : []).filter(x => x && PG.num(x.end) > 0 && PG.num(x.total) > 0).slice(0, 10).map(x => ({
    id: PG.str(x.id || PG.newId(), 20), key: PG.str(x.key, 60), label: PG.str(x.label, 80), end: +x.end, total: +x.total, ring: !!x.ring
  }));
}
function startTimer({ key = "", label, secs }) {
  ensureAudio();
  if ("Notification" in window && Notification.permission === "default") Notification.requestPermission().catch(() => {});
  S.timers = S.timers.filter(t => !key || t.key !== key);
  S.timers.push({ id: PG.newId(), key, label: PG.str(label, 80), end: Date.now() + secs * 1000, total: secs, ring: false });
  saveTimers(); renderTimers(true);
}
const timerFor = key => S.timers.find(t => t.key === key);
function stopTimer(id) { S.timers = S.timers.filter(t => t.id !== id); saveTimers(); renderTimers(true); }
function addToTimer(id, secs) {
  const t = S.timers.find(x => x.id === id);
  if (!t) return;
  t.end = Math.max(Date.now(), t.ring ? Date.now() : t.end) + secs * 1000; t.total += secs; t.ring = false;
  saveTimers(); renderTimers(true);
}
let timerSig = "";
function renderTimers(force) {
  const now = Date.now();
  let changed = false;
  for (const t of S.timers) if (!t.ring && t.end <= now) { t.ring = true; changed = true; notify("Timer", t.label || "Czas minął"); navigator.vibrate?.([300, 150, 300]); }
  if (changed) saveTimers();
  const bar = $("timerBar"), sig = S.timers.map(t => t.id + t.ring).join();
  if (force || sig !== timerSig) {
    timerSig = sig;
    bar.innerHTML = S.timers.map(t => `<div class="tm${t.ring ? " ring" : ""}" data-id="${esc(t.id)}">
      <span class="lab">${esc(t.label || "Timer")}</span><span class="t"></span>
      ${t.ring ? "" : `<button type="button" data-a="add" aria-label="Dodaj minutę">+1 min</button>`}
      <button type="button" data-a="stop">${t.ring ? "OK" : "Stop"}</button></div>`).join("");
  }
  for (const t of S.timers) {
    const el = bar.querySelector(`[data-id="${CSS.escape(t.id)}"] .t`);
    if (el) el.textContent = t.ring ? "00:00" : PG.fmtTime(Math.ceil((t.end - now) / 1000));
  }
  const ringing = S.timers.some(t => t.ring);
  document.title = ringing ? "⏰ Czas minął – Przewodnik gotowania" : "Przewodnik gotowania";
  if (ringing && !ringLoop) { beep(); ringLoop = setInterval(beep, 2000); }
  if (!ringing && ringLoop) { clearInterval(ringLoop); ringLoop = null; }
  document.dispatchEvent(new CustomEvent("pg:tick"));
}
function initTimers() {
  $("timerBar").addEventListener("click", e => {
    const b = e.target.closest("button"), id = b?.closest(".tm")?.dataset.id;
    if (!b || !id) return;
    if (b.dataset.a === "add") addToTimer(id, 60); else stopTimer(id);
  });
  loadTimers(); renderTimers(true);
  setInterval(renderTimers, 500);
}

// ---------- Ekran nie gaśnie ----------
const wake = {
  lock: null, wanted: false,
  async on() {
    this.wanted = true;
    try { if ("wakeLock" in navigator && !this.lock) { this.lock = await navigator.wakeLock.request("screen"); this.lock.addEventListener("release", () => { this.lock = null; this.state(); }); } } catch { /* odmowa */ }
    this.state();
  },
  async off() { this.wanted = false; try { await this.lock?.release(); } catch { /* ignoruj */ } this.lock = null; this.state(); },
  state() { const el = $("wakeState"); if (el) el.textContent = this.lock ? "Ekran nie wygaśnie" : ""; }
};
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && wake.wanted && !wake.lock) wake.on(); });

// ---------- Głos ----------
function speak(text) {
  if (!("speechSynthesis" in window)) { toast("Ta przeglądarka nie obsługuje czytania na głos."); return; }
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "pl-PL";
  speechSynthesis.speak(u);
}
const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
const voice = {
  supported: !!SpeechRec, active: false, rec: null, onCommand: null,
  parse(t) {
    const s = PG.fold(t);
    if (/\b(dalej|nastepn\w*|kolejn\w*)\b/.test(s)) return "next";
    if (/\b(wstecz|cofnij|poprzedn\w*)\b/.test(s)) return "prev";
    if (/\b(start|uruchom|zacznij)\b/.test(s)) return "start";
    if (/\b(stop|zatrzymaj|pauza)\b/.test(s)) return "stop";
    if (/\b(powtorz|czytaj)\b/.test(s)) return "repeat";
    return null;
  },
  start() {
    if (!this.supported || this.active) return;
    const r = this.rec = new SpeechRec();
    r.lang = "pl-PL"; r.continuous = true; r.interimResults = false;
    r.onresult = e => {
      const cmd = this.parse(e.results[e.results.length - 1][0].transcript);
      if (cmd) this.onCommand?.(cmd);
    };
    r.onerror = e => { if (e.error === "not-allowed" || e.error === "service-not-allowed") { this.active = false; this.sync(); toast("Brak zgody na mikrofon."); } };
    r.onend = () => { if (this.active) { try { r.start(); } catch { /* już działa */ } } };
    this.active = true;
    try { r.start(); } catch { this.active = false; }
    this.sync();
  },
  stop() { this.active = false; try { this.rec?.stop(); } catch { /* ignoruj */ } this.sync(); },
  toggle() { this.active ? this.stop() : this.start(); },
  sync() { $("micBtn")?.classList.toggle("on", this.active); }
};

// ---------- Widoki ----------
const VIEWS = ["list", "plan", "shop", "fridge", "guide", "nutri", "recipe", "edit"];
function showView(v) {
  S.view = v;
  for (const n of VIEWS) $(n + "View").classList.toggle("hidden", n !== v);
  const sec = ["recipe", "edit", "nutri"].includes(v) ? "list" : v;
  document.querySelectorAll("#mainNav button").forEach(b => b.classList.toggle("active", b.dataset.sec === sec));
  $("mainNav").classList.toggle("hidden", ["recipe", "edit", "nutri"].includes(v));
  if (v !== "recipe") { wake.off(); voice.stop(); if ("speechSynthesis" in window) speechSynthesis.cancel(); }
  window.scrollTo(0, 0);
}
function renderShopBadge() {
  const n = S.shop.filter(i => !i.done).length, b = $("shopBadge");
  b.textContent = n; b.classList.toggle("hidden", !n);
}
