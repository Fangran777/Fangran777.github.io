"use strict";
// Lista przepisów, widok przepisu, notatki, edytor, kopie zapasowe.

// ---------- Tagi ----------
const STD_TAGS = new Set(PG.TAG_GROUPS.flatMap(g => g.tags));
function tagGroups(extra = []) {
  const used = Object.values(S.meta).flatMap(m => m.tags || []);
  const custom = [...new Set([...used, ...extra])].filter(t => !STD_TAGS.has(t)).sort((a, b) => a.localeCompare(b, "pl"));
  return [...PG.TAG_GROUPS, ...(custom.length ? [{ g: "Własne", tags: custom }] : [])];
}
const chipHtml = (t, on) => `<button type="button" class="chip${on ? " on" : ""}" data-tag="${esc(t)}" aria-pressed="${on}">${esc(t)}</button>`;
const tagsHtml = (sel, extra) => tagGroups(extra).map(g =>
  `<div class="tag-group"><div class="tag-title">${esc(g.g)}</div><div class="chips">${g.tags.map(t => chipHtml(t, sel.has(t))).join("")}</div></div>`).join("");
const starsHtml = (v, btn) => [1, 2, 3, 4, 5].map(i => btn
  ? `<button type="button" class="star${i <= v ? " on" : ""}" data-v="${i}" aria-label="${i} z 5">★</button>`
  : `<span class="star${i <= v ? " on" : ""}">★</span>`).join("");
const dateStr = ts => new Date(ts).toLocaleDateString("pl-PL");

// Wspólny wybieracz tagów (edytor + zakładka przepisu): kontener, zbiór, callback.
function mountTagPicker(box, set, onChange) {
  const draw = () => {
    box.innerHTML = tagsHtml(set, [...set]) +
      `<div class="tag-add"><input data-newtag maxlength="30" placeholder="Własny tag" aria-label="Własny tag"><button type="button" class="secondary small" data-addtag>Dodaj</button></div>`;
  };
  const add = () => {
    const inp = box.querySelector("[data-newtag]"), t = inp.value.trim().slice(0, 30);
    if (t) { set.add(t); onChange(); draw(); }
  };
  box.onclick = e => {
    const c = e.target.closest("[data-tag]");
    if (c) { const t = c.dataset.tag; set.has(t) ? set.delete(t) : set.add(t); onChange(); draw(); return; }
    if (e.target.closest("[data-addtag]")) add();
  };
  box.onkeydown = e => { if (e.key === "Enter" && e.target.matches("[data-newtag]")) { e.preventDefault(); add(); } };
  draw();
}

// ---------- Lista ----------
const SEL = { on: false, ids: new Set() };
function renderSelBar() {
  $("selectBar").classList.toggle("hidden", !SEL.on);
  $("selectBtn").textContent = SEL.on ? "Gotowe" : "Wybierz";
  $("selCount").textContent = `Zaznaczono: ${SEL.ids.size}`;
  $("selDel").disabled = !SEL.ids.size;
}
function setSelect(on) { SEL.on = on; SEL.ids.clear(); renderList(); }
const F = { q: "", tags: new Set(), minStar: 0, fav: false, col: "", sort: "def", group: "" };
const lastCooked = id => metaOf(id).history.at(-1) || 0;
function filteredRecipes() {
  const col = S.cols.find(c => c.id === F.col), groups = tagGroups();
  const f = { q: F.q, tags: F.tags, minStar: F.minStar, fav: F.fav, col: !!col };
  const list = allRecipes().filter(r => {
    const m = metaOf(r.id);
    return PG.recipeMatches(r, f, { tags: tagsOf(r.id), rating: m.rating, notes: m.notes.map(n => n.text), fav: !!m.fav, inCol: !!col?.ids.includes(r.id), groups });
  });
  const byName = (a, b) => a.name.localeCompare(b.name, "pl");
  const byRating = (a, b) => metaOf(b.id).rating - metaOf(a.id).rating;
  const by = {
    rating: byRating,
    name: byName,
    stale: (a, b) => lastCooked(a.id) - lastCooked(b.id),
    cooked: (a, b) => metaOf(b.id).history.length - metaOf(a.id).history.length
  }[F.sort];
  // Wtórnie zawsze: ocena malejąco, potem nazwa.
  return by ? list.sort((a, b) => by(a, b) || byRating(a, b) || byName(a, b)) : list;
}
function renderFilters() {
  if (F.col && !S.cols.some(c => c.id === F.col)) F.col = "";
  $("fCol").innerHTML = `<option value="">Wszystkie</option>` + S.cols.map(c => `<option value="${esc(c.id)}"${c.id === F.col ? " selected" : ""}>${esc(c.name)} (${c.ids.length})</option>`).join("");
  $("colManage").classList.toggle("hidden", !F.col);
  const groupNames = tagGroups().map(g => g.g);
  if (F.group && !groupNames.includes(F.group)) F.group = "";
  $("fGroup").innerHTML = `<option value="">Bez grupowania</option>` + groupNames.map(g => `<option${g === F.group ? " selected" : ""}>${esc(g)}</option>`).join("");
  $("filterTags").innerHTML = tagsHtml(F.tags);
  const n = F.tags.size + (F.minStar ? 1 : 0) + (F.fav ? 1 : 0) + (F.col ? 1 : 0);
  $("filterSummary").textContent = n ? `Filtry (${n})` : "Filtry";
}
function cardHtml(r) {
  const m = metaOf(r.id), ph = S.photos[r.id], sel = SEL.on && SEL.ids.has(r.id);
  return `<button class="recipe-card${sel ? " sel" : ""}" data-id="${esc(r.id)}"${SEL.on ? ` aria-pressed="${sel}"` : ""}>
      ${SEL.on ? `<span class="selmark">${sel ? "✓" : ""}</span>` : ""}
      ${ph ? `<img class="thumb" src="${esc(ph)}" alt="">` : `<span class="emoji">${esc(r.emoji)}</span>`}
      <span class="grow"><b>${esc(r.name)}</b>
        <small>${esc([PG.timeLabel(r), r.difficulty].filter(Boolean).join(" · "))}</small>
        ${m.rating ? `<span class="mini-stars">${starsHtml(m.rating)}</span>` : ""}
        ${tagsOf(r.id).length ? `<small>${esc(tagsOf(r.id).slice(0, 3).join(" · "))}</small>` : ""}
      </span>${m.fav ? `<span class="heart">♥</span>` : ""}</button>`;
}
// Przepis z kilkoma tagami z danej grupy trafia do każdej z sekcji.
function groupedHtml(list) {
  const g = tagGroups().find(x => x.g === F.group), sel = g.tags.filter(t => F.tags.has(t));
  const sections = (sel.length ? sel : g.tags).map(t => [t, list.filter(r => tagsOf(r.id).includes(t))]);
  const rest = list.filter(r => !g.tags.some(t => tagsOf(r.id).includes(t)));
  if (rest.length && !sel.length) sections.push(["Bez kategorii", rest]);
  return sections.filter(([, items]) => items.length)
    .map(([t, items]) => `<h3 class="group-title">${esc(t)} <span class="muted">(${items.length})</span></h3>${items.map(cardHtml).join("")}`).join("");
}
function renderList() {
  const list = filteredRecipes();
  if (SEL.on) { const vis = new Set(list.map(r => r.id)); for (const id of SEL.ids) if (!vis.has(id)) SEL.ids.delete(id); }
  $("recipeList").innerHTML = list.length ? (F.group ? groupedHtml(list) : list.map(cardHtml).join(""))
    : `<p class="muted" style="text-align:center">${allRecipes().length ? "Brak przepisów spełniających kryteria." : "Nie masz żadnych przepisów. Dodaj nowy, zaimportuj kopię lub przywróć wbudowane."}</p>`;
  $("restoreBtn").classList.toggle("hidden", !S.hidden.size);
  renderSelBar();
  renderResume(); renderBackupBanner();
}
let resumeHidden = false, backupHidden = false;
function renderResume() {
  const box = $("resume"), now = Date.now();
  const p = Object.entries(S.progress).map(([id, v]) => ({ id, ...v })).filter(v => { const r = byId(v.id); return r && v.step < r.steps.length && now - v.ts < 12 * 3600e3; })
    .sort((a, b) => b.ts - a.ts)[0];
  box.classList.toggle("hidden", !p || resumeHidden);
  if (!p || resumeHidden) return;
  const r = byId(p.id);
  box.innerHTML = `<span>Wznów: <b>${esc(r.name)}</b> (krok ${p.step + 1}/${r.steps.length})</span>
    <span class="row"><button class="primary small" data-a="go" data-id="${esc(p.id)}">Wznów</button><button class="secondary small" data-a="hide">Ukryj</button></span>`;
}
function renderBackupBanner() {
  const box = $("backupBanner"), last = store.get(KEY.backup, 0), has = S.user.length || Object.keys(S.meta).length || S.cols.length;
  if (!last && has) store.set(KEY.backup, Date.now());
  const days = last ? Math.floor((Date.now() - last) / 864e5) : 0, show = has && last && days >= 30 && !backupHidden;
  box.classList.toggle("hidden", !show);
  if (show) box.innerHTML = `<span>Ostatnia kopia zapasowa: ${days} dni temu.</span><span class="row"><button class="primary small" data-a="backup">Zrób kopię</button><button class="secondary small" data-a="hide">Później</button></span>`;
}

// ---------- Widok przepisu ----------
function openRecipe(id, resume) {
  const r = byId(id);
  if (!r) return;
  Object.assign(S, { cur: id, tab: "ing", servings: r.servings, k: 1, unitMode: "orig", step: 0, checked: new Set() });
  const p = resume && S.progress[id];
  if (p) { S.servings = PG.clamp(Math.round(r.servings * p.k), 1, 24); S.k = S.servings / r.servings; S.step = Math.min(p.step, r.steps.length - 1); S.tab = "cook"; }
  editingNote = null;
  showView("recipe");
  renderRecipe();
}
function setServings(n) {
  const r = byId(S.cur);
  S.servings = PG.clamp(n, 1, 24); S.k = S.servings / r.servings;
  renderIngredients(); if (S.tab === "cook") renderCook();
}
function renderRecipe() {
  renderMeta(); renderIngredients(); setTab(S.tab);
}
function renderMeta() {
  const r = byId(S.cur), m = metaOf(r.id), ph = S.photos[r.id], built = isBuiltin(r.id);
  $("recipeTitle").textContent = `${r.emoji} ${r.name}`;
  $("metaPhoto").classList.toggle("hidden", !ph);
  if (ph) $("metaPhoto").src = ph;
  $("metaInfo").textContent = [PG.timeLabel(r), r.difficulty, `${r.steps.length} ${PG.pl(r.steps.length, "krok", "kroki", "kroków")}`,
    m.history.length ? `ugotowano ${m.history.length}×` : ""].filter(Boolean).join(" · ");
  $("metaRating").innerHTML = starsHtml(m.rating, true);
  $("metaTags").innerHTML = tagsOf(r.id).map(t => `<span class="chip static">${esc(t)}</span>`).join("");
  const fav = $("favBtn"); fav.classList.toggle("on", !!m.fav); fav.setAttribute("aria-pressed", !!m.fav);
  $("editBtn").classList.toggle("hidden", built);
}
function renderIngredients() {
  const r = byId(S.cur);
  $("servingsVal").textContent = S.servings;
  $("unitMode").value = S.unitMode;
  $("recipeDesc").textContent = r.desc; $("recipeDesc").classList.toggle("hidden", !r.desc);
  $("ingList").innerHTML = r.ingredients.map((i, idx) => {
    const k = PG.ingKey(i, idx), c = PG.convertIng(i, S.k, S.unitMode);
    return `<li data-k="${esc(k)}" class="${S.checked.has(k) ? "done" : ""}"><span>${esc(i.n)}</span><span class="qty">${esc(c.text)}${c.conv ? `<small>${esc(c.orig)}</small>` : ""}</span></li>`;
  }).join("");
  const al = PG.allergensOf(r), nu = PG.nutrition(r);
  $("healthBody").innerHTML =
    `<p style="margin:6px 0"><b>Alergeny:</b> ${al.length ? al.map(a => `<span class="chip warn static">${esc(a)}</span>`).join(" ") : "nie wykryto typowych (sprawdź etykiety produktów)"}</p>` +
    (nu.coverage >= 0.5
      ? `<div class="nutri"><div><b>${nu.kcal}</b><small>kcal</small></div><div><b>${nu.p} g</b><small>białko</small></div><div><b>${nu.f} g</b><small>tłuszcz</small></div><div><b>${nu.c} g</b><small>węgl.</small></div></div>
         <p class="muted" style="margin:0;font-size:.78rem">Na porcję, wartość obliczona na podstawie ${Math.round(nu.coverage * 100)}% składników – orientacyjna.</p>`
      : `<p class="muted" style="margin:0;font-size:.85rem">Za mało rozpoznanych składników, aby obliczyć wartości odżywcze.</p>`);
  renderBio(r);
}
function renderBio(r) {
  const bio = PG.bioactiveOf(r, BIOACTIVE);
  $("bioInfo").classList.toggle("hidden", !bio.length);
  $("bioSummary").textContent = `Składniki aktywne (${bio.length})`;
  $("bioBody").innerHTML = bio.map(b => `<details class="bio"><summary><b>${esc(b.s)}</b><small>${esc(b.from.join(", "))}</small></summary>
    <dl><dt>Na co wpływa</dt><dd>${esc(b.w)}</dd><dt>Jak aktywować</dt><dd>${esc(b.a)}</dd><dt>Kiedy się traci</dt><dd>${esc(b.l)}</dd></dl>
    ${b.x ? `<p class="bio-warn">Uwaga: ${esc(b.x)}</p>` : ""}<p class="muted" style="margin:4px 0 0;font-size:.75rem">Siła dowodów u ludzi: ${BIO_EVIDENCE[b.e]}</p></details>`).join("") +
    (bio.length ? `<p class="muted" style="font-size:.75rem;margin:8px 0 0">Informacje edukacyjne, bez przypisów do pojedynczych badań. Wiele wyników pochodzi z badań laboratoryjnych lub obserwacyjnych. Weryfikuj je w przeglądach m.in. NIH Office of Dietary Supplements, Linus Pauling Institute, EFSA i Cochrane. Przy chorobach, ciąży lub przyjmowaniu leków skonsultuj się z lekarzem lub dietetykiem.</p>` : "");
}
function setTab(t) {
  S.tab = t;
  document.querySelectorAll("#recipeTabs button").forEach(b => b.classList.toggle("active", b.dataset.tab === t));
  $("ingPanel").classList.toggle("hidden", t !== "ing");
  $("cookPanel").classList.toggle("hidden", t !== "cook");
  $("notesPanel").classList.toggle("hidden", t !== "notes");
  if (t === "cook") { renderCook(); wake.on(); } else { wake.off(); voice.stop(); }
  if (t === "notes") renderNotes();
}

// ---------- Gotowanie ----------
function saveProgress1() {
  const r = byId(S.cur);
  S.progress[r.id] = { step: S.step, k: S.k, ts: Date.now() };
  saveProgress();
}
let timerSigCook = "";
function renderCook() {
  const r = byId(S.cur), s = r.steps[S.step], last = S.step === r.steps.length - 1;
  $("progress").innerHTML = r.steps.map((_, i) => `<span class="${i < S.step ? "done" : i === S.step ? "current" : ""}"></span>`).join("");
  $("stepNum").textContent = `Krok ${S.step + 1} z ${r.steps.length}`;
  $("stepText").textContent = s.t;
  const ing = PG.stepIngredients(r, S.step, S.k);
  $("stepIngs").classList.toggle("hidden", !ing.length);
  $("stepIngs").innerHTML = ing.map(i => `<div><span>${esc(i.n)}</span><span>${esc(i.text)}${i.scale != null ? ` <small>(waga: ${i.scale} g)</small>` : ""}</span></div>`).join("");
  const ps = [];
  if (s.time) ps.push(["czas", PG.fmtDur(s.time)]);
  if (s.temp) ps.push(["temperatura", s.temp === "Varoma" ? "Varoma" : `${s.temp}°C`]);
  if (s.speed) ps.push(["obroty", (s.rev ? "↺ " : "") + s.speed]);
  $("params").innerHTML = ps.map(([l, v]) => `<div class="param"><b>${esc(v)}</b><small>${l}</small></div>`).join("");
  $("params").classList.toggle("hidden", !ps.length);
  const flags = [];
  const mode = PG.MODES.find(([k]) => k === s.mode); if (mode) flags.push(mode[1]);
  for (const a of s.acc || []) { const x = PG.ACCESSORIES.find(([k]) => k === a); if (x) flags.push(x[1]); }
  $("flags").innerHTML = flags.map(f => `<span class="flag">${esc(f)}</span>`).join("");
  $("prev").disabled = S.step === 0;
  $("next").textContent = last ? "Zakończ" : "Dalej";
  timerSigCook = ""; renderStepTimer();
  $("micBtn").classList.toggle("hidden", !voice.supported);
  $("bigBtn").classList.toggle("on", S.big);
  saveProgress1();
}
function renderStepTimer() {
  if (S.view !== "recipe" || S.tab !== "cook" || !S.cur) return;
  const r = byId(S.cur), s = r?.steps[S.step];
  if (!s) return;
  const t = timerFor(`${r.id}:${S.step}`), sig = t ? (t.ring ? "ring" : "run") : s.time ? "idle" : "none";
  $("timer").textContent = t ? (t.ring ? "00:00" : PG.fmtTime(Math.ceil((t.end - Date.now()) / 1000))) : s.time ? PG.fmtTime(s.time) : "";
  if (sig === timerSigCook) return;
  timerSigCook = sig;
  $("timerActions").innerHTML = { none: "", idle: `<button class="primary" data-a="tstart">Start timera (${esc(PG.fmtDur(s.time || 0))})</button>`,
    run: `<button class="secondary" data-a="tadd">+1 min</button><button class="danger" data-a="tstop">Stop</button>`, ring: `<button class="primary" data-a="tstop">OK</button>` }[sig];
}
function stepTimerAction(a) {
  const r = byId(S.cur), s = r.steps[S.step], key = `${r.id}:${S.step}`, t = timerFor(key);
  if (a === "tstart" && s.time) startTimer({ key, label: `${r.name} – krok ${S.step + 1}`, secs: s.time });
  else if (a === "tadd" && t) addToTimer(t.id, 60);
  else if (a === "tstop" && t) stopTimer(t.id);
}
function cookGo(d) {
  const r = byId(S.cur), n = S.step + d;
  if (n < 0) return;
  if (n >= r.steps.length) return cookFinish();
  S.step = n; renderCook();
  return true;
}
function cookFinish() {
  const r = byId(S.cur), m = metaOf(r.id);
  patchMeta(r.id, { history: [...m.history, Date.now()] });
  delete S.progress[r.id]; saveProgress();
  renderMeta(); setTab("notes");
  toast("Smacznego! Zapisano w historii – oceń przepis i dodaj notatkę.");
}
function voiceCommand(cmd) {
  if (S.view !== "recipe" || S.tab !== "cook") return;
  const speakStep = () => speak(byId(S.cur).steps[S.step].t);
  if (cmd === "next") { if (cookGo(1)) speakStep(); }
  else if (cmd === "prev") { if (cookGo(-1)) speakStep(); }
  else if (cmd === "repeat") speakStep();
  else if (cmd === "start") stepTimerAction("tstart");
  else if (cmd === "stop") stepTimerAction("tstop");
}

// ---------- Notatki, kolekcje, historia ----------
let editingNote = null;
function renderNotes() {
  const r = byId(S.cur), m = metaOf(r.id), tags = new Set(tagsOf(r.id));
  mountTagPicker($("tagPicker"), tags, () => { patchMeta(r.id, { tags: [...tags] }); renderMeta(); renderFilters(); });
  $("colPicker").innerHTML = (S.cols.length ? `<div class="chips">${S.cols.map(c => `<button type="button" class="chip${c.ids.includes(r.id) ? " on" : ""}" data-col="${esc(c.id)}" aria-pressed="${c.ids.includes(r.id)}">${esc(c.name)}</button>`).join("")}</div>` : `<p class="muted" style="margin:0 0 8px;font-size:.85rem">Brak kolekcji.</p>`) +
    `<button type="button" class="secondary small" data-a="newcol" style="margin-top:8px">+ Nowa kolekcja</button>`;
  const h = m.history;
  $("history").innerHTML = `<p style="margin:0 0 8px;font-size:.9rem">${h.length ? `Ugotowano ${h.length}×, ostatnio ${dateStr(h.at(-1))}.` : "Jeszcze nie gotowano."}</p>
    <div class="actions"><button class="secondary small" data-a="cooked">Ugotowałem dziś</button>${h.length ? `<button class="secondary small" data-a="uncook">Cofnij ostatni wpis</button>` : ""}</div>`;
  $("noteList").innerHTML = [...m.notes].reverse().map(n => editingNote === n.id
    ? `<div class="note-item" data-id="${esc(n.id)}"><textarea rows="3" maxlength="2000" data-edit>${esc(n.text)}</textarea>
        <div class="actions" style="margin-top:6px"><button class="primary small" data-a="nsave">Zapisz</button><button class="secondary small" data-a="ncancel">Anuluj</button></div></div>`
    : `<div class="note-item" data-id="${esc(n.id)}"><div class="note-head"><span>${esc(dateStr(n.ts))}</span><span><button data-a="nedit">Edytuj</button><button data-a="ndel">Usuń</button></span></div><div class="note-text">${esc(n.text)}</div></div>`).join("");
}
async function promptCollection(rid) {
  const name = ((await ask("Nazwa nowej kolekcji")) || "").trim().slice(0, 40);
  if (!name) return;
  S.cols.push({ id: PG.newId(), name, ids: rid ? [rid] : [] });
  saveCols(); renderFilters();
}

// ---------- Usuwanie / duplikowanie / druk ----------
function duplicateRecipe(id) {
  const r = byId(id);
  openEditor(null, { ...JSON.parse(JSON.stringify(r)), name: r.name + " (kopia)", photoData: S.photos[id] || null, tags: tagsOf(id) });
}
function printHtml(r, k) {
  const ph = S.photos[r.id], m = metaOf(r.id);
  return `<h1>${esc(r.emoji)} ${esc(r.name)}</h1>${ph ? `<img src="${esc(ph)}" alt="">` : ""}
    <p>${esc([`${Math.round(r.servings * k)} porcji`, PG.timeLabel(r), r.difficulty].filter(Boolean).join(" · "))}${tagsOf(r.id).length ? `<br>${esc(tagsOf(r.id).join(", "))}` : ""}</p>
    ${r.desc ? `<p>${esc(r.desc)}</p>` : ""}<h2>Składniki</h2><ul>${r.ingredients.map(i => `<li>${esc((i.q == null ? "" : PG.fmtQty(i.q * k, i.u) + " ") + i.n)}</li>`).join("")}</ul>
    <h2>Przygotowanie</h2><ol>${r.steps.map(s => {
      const p = [s.time ? PG.fmtDur(s.time) : "", s.temp ? (s.temp === "Varoma" ? "Varoma" : `${s.temp}°C`) : "", s.speed ? `obr. ${s.rev ? "↺ " : ""}${s.speed}` : ""].filter(Boolean).join(" / ");
      return `<li>${esc(s.t)}${p ? ` <b>[${esc(p)}]</b>` : ""}</li>`;
    }).join("")}</ol>${m.notes.length ? `<h2>Notatki</h2>${m.notes.map(n => `<p>${esc(n.text)}</p>`).join("")}` : ""}`;
}
function printRecipe(r) {
  $("printArea").innerHTML = printHtml(r, S.cur === r.id ? S.k : 1);
  window.print();
}

// ---------- Edytor ----------
const EMOJIS = ["🍽️", "🍲", "🥘", "🍝", "🍕", "🥗", "🥞", "🍳", "🥪", "🌮", "🍜", "🍛", "🍣", "🥟", "🍚", "🧆", "🥙", "🍖", "🍗", "🥩", "🐟", "🥕", "🍅", "🍰", "🍪", "🥧", "🍮", "🍞", "🥐", "🍹"];
const TEMP_OPTS = ["37", ...Array.from({ length: 17 }, (_, i) => String(40 + i * 5)), "Varoma"];
const SPEED_OPTS = [...Array.from({ length: 20 }, (_, i) => PG.fmtNum((i + 1) / 2)), "Turbo", "0→10", "Ciasto"];
const optHtml = (list, cur, blank) => `<option value="">${blank}</option>` + (cur && !list.includes(cur) ? [...list, cur] : list)
  .map(o => `<option value="${esc(o)}"${o === cur ? " selected" : ""}>${esc(o)}</option>`).join("");
let E = null;
const ingId = () => "i" + PG.rand(6);

function openEditor(id, draft) {
  const src = draft || (id && byId(id)) || {};
  E = {
    id: id || null, from: S.view, created: src.created,
    time: src.time, photo: draft?.photoData !== undefined ? draft.photoData : (id ? S.photos[id] || null : null),
    ings: (src.ingredients || []).map(i => ({ id: i.id || ingId(), n: i.n, q: i.q == null ? "" : PG.fmtNum(i.q), u: i.u || "" })),
    steps: (src.steps || []).map(s => ({
      t: s.t, min: s.time ? String(Math.floor(s.time / 60)) : "", sec: s.time && s.time % 60 ? String(s.time % 60) : "",
      temp: s.temp != null ? String(s.temp) : "", speed: s.speed || "", rev: !!s.rev, acc: [...(s.acc || [])], mode: s.mode || "", ing: [...(s.ing || [])]
    })),
    tags: new Set(draft?.tags || (id ? tagsOf(id) : []))
  };
  if (!E.ings.length) E.ings.push({ id: ingId(), n: "", q: "", u: "" });
  if (!E.steps.length) E.steps.push(blankStep());
  $("editHeading").textContent = id ? "Edycja przepisu" : draft ? "Nowy przepis (z szablonu)" : "Nowy przepis";
  $("fName").value = src.name || "";
  $("fEmoji").innerHTML = (EMOJIS.includes(src.emoji) || !src.emoji ? EMOJIS : [src.emoji, ...EMOJIS]).map(e => `<option${e === (src.emoji || "🍽️") ? " selected" : ""}>${esc(e)}</option>`).join("");
  $("fServ").value = src.servings || 4;
  $("fPrep").value = src.prep || ""; $("fTotal").value = src.total || "";
  $("fDiff").innerHTML = `<option value="">–</option>` + PG.DIFFICULTY.map(d => `<option${d === src.difficulty ? " selected" : ""}>${d}</option>`).join("");
  $("fDesc").value = src.desc || "";
  $("formErr").classList.add("hidden");
  mountTagPicker($("fTags"), E.tags, () => {});
  renderPhotoEdit(); renderEditIngs(); renderEditSteps();
  showView("edit");
}
const blankStep = () => ({ t: "", min: "", sec: "", temp: "", speed: "", rev: false, acc: [], mode: "", ing: [] });
function renderPhotoEdit() {
  $("fPhotoImg").classList.toggle("hidden", !E.photo);
  if (E.photo) $("fPhotoImg").src = E.photo;
  $("fPhotoBtn").textContent = E.photo ? "Zmień zdjęcie" : "Dodaj zdjęcie";
  $("fPhotoDel").classList.toggle("hidden", !E.photo);
}
function renderEditIngs() {
  $("fIngs").innerHTML = E.ings.map((i, n) => `<div class="ing-row" data-i="${n}">
    <input data-k="q" inputmode="decimal" placeholder="Ilość" aria-label="Ilość" value="${esc(i.q)}">
    <input data-k="u" list="unitList" placeholder="Jedn." aria-label="Jednostka" maxlength="20" value="${esc(i.u)}">
    <input data-k="n" placeholder="Składnik" aria-label="Składnik" maxlength="100" value="${esc(i.n)}">
    <div class="mv"><button type="button" data-a="up" aria-label="W górę">↑</button><button type="button" data-a="down" aria-label="W dół">↓</button><button type="button" data-a="del" aria-label="Usuń">✕</button></div></div>`).join("");
}
function renderEditSteps() {
  $("fSteps").innerHTML = E.steps.map((s, n) => `<div class="step-card" data-i="${n}">
    <div class="step-head"><b>Krok ${n + 1}</b><div class="mv"><button type="button" data-a="up" aria-label="W górę">↑</button><button type="button" data-a="down" aria-label="W dół">↓</button><button type="button" data-a="del" aria-label="Usuń">✕</button></div></div>
    <textarea data-k="t" rows="2" maxlength="500" placeholder="Opis kroku" aria-label="Opis kroku">${esc(s.t)}</textarea>
    <div class="params-edit">
      <label>Min<input data-k="min" type="number" min="0" max="999" value="${esc(s.min)}"></label>
      <label>Sek<input data-k="sec" type="number" min="0" max="59" value="${esc(s.sec)}"></label>
      <label>Temp.<select data-k="temp">${optHtml(TEMP_OPTS, s.temp, "–")}</select></label>
      <label>Obroty<select data-k="speed">${optHtml(SPEED_OPTS, s.speed, "–")}</select></label>
    </div>
    <div class="checks"><label><input type="checkbox" data-k="rev"${s.rev ? " checked" : ""}> Wsteczne ↺</label>
      ${PG.ACCESSORIES.map(([k, l]) => `<label><input type="checkbox" data-acc="${k}"${s.acc.includes(k) ? " checked" : ""}> ${esc(l)}</label>`).join("")}</div>
    <label class="f" style="margin:8px 0 0">Tryb<select data-k="mode"><option value="">Standardowy</option>${PG.MODES.map(([k, l]) => `<option value="${k}"${s.mode === k ? " selected" : ""}>${esc(l)}</option>`).join("")}</select></label>
    <details><summary>Składniki w tym kroku (${s.ing.length})</summary><div class="checks">${E.ings.map(i => `<label><input type="checkbox" data-ing="${esc(i.id)}"${s.ing.includes(i.id) ? " checked" : ""}> <span data-ingl="${esc(i.id)}">${esc(i.n || "(bez nazwy)")}</span></label>`).join("")}</div></details>
  </div>`).join("");
}
function moveItem(arr, i, a) {
  if (a === "del") { arr.splice(i, 1); return true; }
  const j = a === "up" ? i - 1 : i + 1;
  if (j < 0 || j >= arr.length) return false;
  [arr[i], arr[j]] = [arr[j], arr[i]];
  return true;
}
function bindEditor() {
  $("fIngs").addEventListener("input", e => {
    const row = e.target.closest("[data-i]"), k = e.target.dataset.k;
    if (!row || !k) return;
    const ing = E.ings[+row.dataset.i];
    ing[k] = e.target.value;
    if (k === "n") document.querySelectorAll(`[data-ingl="${CSS.escape(ing.id)}"]`).forEach(el => { el.textContent = ing.n || "(bez nazwy)"; });
  });
  $("fIngs").addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"), row = e.target.closest("[data-i]");
    if (!b || !row) return;
    const i = +row.dataset.i, gone = b.dataset.a === "del" ? E.ings[i].id : null;
    if (!moveItem(E.ings, i, b.dataset.a)) return;
    if (gone) E.steps.forEach(s => { s.ing = s.ing.filter(x => x !== gone); });
    if (!E.ings.length) E.ings.push({ id: ingId(), n: "", q: "", u: "" });
    renderEditIngs(); renderEditSteps();
  });
  $("addIng").onclick = () => { E.ings.push({ id: ingId(), n: "", q: "", u: "" }); renderEditIngs(); renderEditSteps(); $("fIngs").querySelector(".ing-row:last-child [data-k=n]").focus(); };
  const stepEdit = e => {
    const card = e.target.closest("[data-i]");
    if (!card) return;
    const s = E.steps[+card.dataset.i], t = e.target;
    if (t.dataset.acc) s.acc = t.checked ? [...new Set([...s.acc, t.dataset.acc])] : s.acc.filter(x => x !== t.dataset.acc);
    else if (t.dataset.ing) {
      s.ing = t.checked ? [...new Set([...s.ing, t.dataset.ing])] : s.ing.filter(x => x !== t.dataset.ing);
      card.querySelector("summary").textContent = `Składniki w tym kroku (${s.ing.length})`;
    } else if (t.dataset.k) s[t.dataset.k] = t.type === "checkbox" ? t.checked : t.value;
  };
  $("fSteps").addEventListener("input", stepEdit);
  $("fSteps").addEventListener("change", stepEdit);
  $("fSteps").addEventListener("click", e => {
    const b = e.target.closest("button[data-a]"), card = e.target.closest("[data-i]");
    if (!b || !card) return;
    if (!moveItem(E.steps, +card.dataset.i, b.dataset.a)) return;
    if (!E.steps.length) E.steps.push(blankStep());
    renderEditSteps();
  });
  $("addStep").onclick = () => { E.steps.push(blankStep()); renderEditSteps(); $("fSteps").querySelector(".step-card:last-child textarea").focus(); };
  $("fPhotoBtn").onclick = () => $("fPhotoFile").click();
  $("fPhotoFile").onchange = async e => {
    const f = e.target.files[0]; e.target.value = "";
    if (!f) return;
    try { E.photo = await resizePhoto(f); renderPhotoEdit(); } catch (x) { toast(x.message); }
  };
  $("fPhotoDel").onclick = () => { E.photo = null; renderPhotoEdit(); };
  $("editCancel").onclick = () => { E.from === "recipe" && E.id ? openRecipe(E.id) : (showView("list"), renderList()); };
  $("editForm").addEventListener("submit", async e => {
    e.preventDefault();
    const err = m => { $("formErr").textContent = m; $("formErr").classList.remove("hidden"); };
    const ings = E.ings.filter(i => i.n.trim()).map(i => {
      const q = i.q.trim() ? PG.num(i.q.trim().replace(",", ".")) : undefined;
      return { id: i.id, n: i.n, q: q == null ? null : q, u: i.u };
    });
    const steps = E.steps.filter(s => s.t.trim()).map(s => {
      const time = (+s.min || 0) * 60 + (+s.sec || 0);
      return { t: s.t, time: time || undefined, temp: s.temp === "Varoma" ? "Varoma" : s.temp ? +s.temp : undefined, speed: s.speed || undefined,
        rev: s.rev, acc: s.acc, mode: s.mode || undefined, ing: s.ing };
    });
    if (!$("fName").value.trim()) return err("Podaj nazwę przepisu.");
    if (!ings.length) return err("Dodaj co najmniej jeden składnik.");
    if (!steps.length) return err("Dodaj co najmniej jeden krok.");
    const r = PG.cleanRecipe({
      id: E.id || PG.newId(), emoji: $("fEmoji").value, name: $("fName").value, servings: +$("fServ").value || 4,
      prep: PG.num($("fPrep").value), total: PG.num($("fTotal").value), time: E.time, difficulty: $("fDiff").value, desc: $("fDesc").value,
      photo: !!E.photo, ingredients: ings, steps, created: E.created, updated: Date.now()
    });
    if (!r) return err("Nie udało się zapisać – sprawdź pola formularza.");
    const i = S.user.findIndex(x => x.id === r.id);
    if (i >= 0) S.user[i] = r; else S.user.push(r);
    if (!saveUser()) return;
    patchMeta(r.id, { tags: [...E.tags] });
    if (E.photo) await savePhoto(r.id, E.photo); else if (S.photos[r.id]) await removePhoto(r.id);
    renderFilters(); renderList();
    toast("Przepis zapisany.");
    openRecipe(r.id);
  });
}

// ---------- Podpięcie zdarzeń ----------
function initRecipes() {
  $("search").addEventListener("input", e => { F.q = e.target.value; renderList(); });
  $("fMin").onchange = e => { F.minStar = +e.target.value; renderFilters(); renderList(); };
  $("fSort").onchange = e => { F.sort = e.target.value; renderList(); };
  $("fGroup").onchange = e => { F.group = e.target.value; renderList(); };
  $("fFav").onchange = e => { F.fav = e.target.checked; renderFilters(); renderList(); };
  $("fCol").onchange = e => { F.col = e.target.value; renderFilters(); renderList(); };
  $("filterTags").addEventListener("click", e => {
    const c = e.target.closest("[data-tag]");
    if (!c) return;
    F.tags.has(c.dataset.tag) ? F.tags.delete(c.dataset.tag) : F.tags.add(c.dataset.tag);
    renderFilters(); renderList();
  });
  $("clearFilters").onclick = () => {
    Object.assign(F, { q: "", minStar: 0, fav: false, col: "", sort: "def", group: "" }); F.tags.clear();
    $("search").value = ""; $("fMin").value = "0"; $("fSort").value = "def"; $("fFav").checked = false;
    renderFilters(); renderList();
  };
  $("colRename").onclick = async () => {
    const c = S.cols.find(x => x.id === F.col), name = ((c && await ask("Nowa nazwa kolekcji", { value: c.name })) || "").trim().slice(0, 40);
    if (c && name) { c.name = name; saveCols(); renderFilters(); }
  };
  $("colDelete").onclick = async () => {
    const c = S.cols.find(x => x.id === F.col);
    if (c && await confirmAsk(`Usunąć kolekcję „${c.name}”? Przepisy pozostaną.`)) { S.cols = S.cols.filter(x => x !== c); F.col = ""; saveCols(); renderFilters(); renderList(); }
  };
  $("recipeList").addEventListener("click", e => {
    const c = e.target.closest("[data-id]");
    if (!c) return;
    if (!SEL.on) return openRecipe(c.dataset.id);
    const id = c.dataset.id;
    SEL.ids.has(id) ? SEL.ids.delete(id) : SEL.ids.add(id);
    const on = SEL.ids.has(id);
    c.classList.toggle("sel", on); c.setAttribute("aria-pressed", on); c.querySelector(".selmark").textContent = on ? "✓" : "";
    renderSelBar();
  });
  $("selectBtn").onclick = () => setSelect(!SEL.on);
  $("selAll").onclick = () => { for (const r of filteredRecipes()) SEL.ids.add(r.id); renderList(); };
  $("selNone").onclick = () => { SEL.ids.clear(); renderList(); };
  $("selDel").onclick = deleteSelected;
  $("findDupBtn").onclick = () => { renderDups(); $("dupDlg").showModal(); };
  $("dupClose").onclick = () => $("dupDlg").close();
  $("dupList").addEventListener("click", onDupClick);
  for (const id of ["resume", "backupBanner"]) $(id).addEventListener("click", e => {
    const b = e.target.closest("button[data-a]");
    if (!b) return;
    if (b.dataset.a === "go") openRecipe(b.dataset.id, true);
    else if (b.dataset.a === "backup") exportAll();
    else { if (id === "resume") resumeHidden = true; else backupHidden = true; renderList(); }
  });
  $("newBtn").onclick = () => openEditor(null);
  $("exportBtn").onclick = () => exportAll();
  $("exportLiteBtn").onclick = () => exportAll(false);
  $("deleteAllBtn").onclick = deleteAllRecipes;
  $("restoreBtn").onclick = restoreBuiltin;
  $("importBtn").onclick = () => $("importFile").click();
  $("importFile").onchange = e => { const f = e.target.files[0]; e.target.value = ""; if (f) importFile(f); };

  $("backBtn").onclick = () => { showView("list"); renderList(); };
  $("recipeTabs").addEventListener("click", e => { const b = e.target.closest("button[data-tab]"); if (b) setTab(b.dataset.tab); });
  $("minus").onclick = () => setServings(S.servings - 1);
  $("plus").onclick = () => setServings(S.servings + 1);
  $("unitMode").onchange = e => { S.unitMode = e.target.value; renderIngredients(); };
  $("ingList").addEventListener("click", e => {
    const li = e.target.closest("li[data-k]");
    if (!li) return;
    const k = li.dataset.k; S.checked.has(k) ? S.checked.delete(k) : S.checked.add(k);
    li.classList.toggle("done");
  });
  $("startCook").onclick = () => { S.step = 0; setTab("cook"); };
  $("metaRating").addEventListener("click", e => {
    const b = e.target.closest("[data-v]");
    if (!b) return;
    const v = +b.dataset.v, cur = metaOf(S.cur).rating;
    patchMeta(S.cur, { rating: v === cur ? 0 : v }); renderMeta();
  });
  $("favBtn").onclick = () => { patchMeta(S.cur, { fav: !metaOf(S.cur).fav }); renderMeta(); };
  $("editBtn").onclick = () => openEditor(S.cur);
  $("dupBtn").onclick = () => duplicateRecipe(S.cur);
  $("delBtn").onclick = () => deleteRecipe(S.cur);
  $("printBtn").onclick = () => printRecipe(byId(S.cur));
  $("shareBtn").onclick = () => { const r = byId(S.cur); shareText(r.name, PG.recipeToText(r, S.k, tagsOf(r.id))); };
  $("exportOneBtn").onclick = () => exportOne(S.cur);

  $("prev").onclick = () => cookGo(-1);
  $("next").onclick = () => cookGo(1);
  $("timerActions").addEventListener("click", e => { const b = e.target.closest("button[data-a]"); if (b) stepTimerAction(b.dataset.a); });
  $("customTimer").onclick = async () => {
    const v = PG.num(((await ask("Timer w minutach", { value: "5" })) || "").replace(",", "."));
    if (v > 0 && v <= 600) startTimer({ label: `${byId(S.cur).name} – własny timer`, secs: Math.round(v * 60) });
  };
  $("speakBtn").onclick = () => speak(byId(S.cur).steps[S.step].t);
  $("micBtn").onclick = () => voice.toggle();
  $("bigBtn").onclick = () => { S.big = !S.big; document.body.classList.toggle("big", S.big); $("bigBtn").classList.toggle("on", S.big); };
  voice.onCommand = voiceCommand;
  document.addEventListener("pg:tick", renderStepTimer);

  $("colPicker").addEventListener("click", e => {
    if (e.target.closest("[data-a=newcol]")) { promptCollection(S.cur).then(renderNotes); return; }
    const c = e.target.closest("[data-col]"), col = c && S.cols.find(x => x.id === c.dataset.col);
    if (!col) return;
    col.ids = col.ids.includes(S.cur) ? col.ids.filter(x => x !== S.cur) : [...col.ids, S.cur];
    saveCols(); renderNotes(); renderFilters();
  });
  $("history").addEventListener("click", e => {
    const a = e.target.closest("button[data-a]")?.dataset.a, m = metaOf(S.cur);
    if (a === "cooked") patchMeta(S.cur, { history: [...m.history, Date.now()] });
    else if (a === "uncook") patchMeta(S.cur, { history: m.history.slice(0, -1) });
    else return;
    renderNotes(); renderMeta();
  });
  $("addNote").onclick = () => {
    const t = $("noteInput").value.trim();
    if (!t) return;
    patchMeta(S.cur, { notes: [...metaOf(S.cur).notes, { id: PG.newId(), ts: Date.now(), text: t }] });
    $("noteInput").value = ""; renderNotes();
  };
  $("noteList").addEventListener("click", async e => {
    const b = e.target.closest("button[data-a]"), item = e.target.closest("[data-id]");
    if (!b || !item) return;
    const id = item.dataset.id, notes = metaOf(S.cur).notes, a = b.dataset.a;
    if (a === "nedit") editingNote = id;
    else if (a === "ncancel") editingNote = null;
    else if (a === "nsave") {
      const t = item.querySelector("[data-edit]").value.trim();
      if (t) patchMeta(S.cur, { notes: notes.map(n => n.id === id ? { ...n, text: t } : n) });
      editingNote = null;
    } else if (a === "ndel") {
      if (!(await confirmAsk("Usunąć notatkę?"))) return;
      patchMeta(S.cur, { notes: notes.filter(n => n.id !== id) });
    }
    renderNotes();
  });
  bindEditor();
}
