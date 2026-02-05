import { loadTasks, saveTasks, clearTasks, loadSettings, saveSettings } from "./storage.js";
import { fetchTodos, fetchWeather, fetchDailyForecast } from "./api.js";

const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3 };

const state = {
  page: "home" /* "home" | "stats" */,
  tasks: [],
  ui: {
    filter: "active" /* all | active | completed */,
    category: "all",
    priority: "all",
    search: "",
    sort: "created_desc"
  },
  chart: null
};

/* jednoduchá cache pro předpověď
   klíč je YYYY-MM-DD a hodnota je text (nebo null) */
const forecastCache = {};

function uid() {
  return (crypto?.randomUUID?.() ?? `id_${Math.random().toString(16).slice(2)}_${Date.now()}`);
}

function nowISO() {
  return new Date().toISOString();
}

/* ošetření textu, ať se do HTML nedostane něco nechtěného */
function escapeHtml(str) {
  return String(str ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("cs-CZ");
}

/* ---------------- Theme ---------------- */

/* při startu načtu theme z localStorage a nastavím class na body */
function applyTheme() {
  const s = loadSettings();
  if (s.theme === "light") $("body").addClass("light");
  else $("body").removeClass("light");
}

/* kliknutím přepnu dark/light a uložím to do localStorage */
function toggleTheme() {
  const isLight = $("body").toggleClass("light").hasClass("light");
  saveSettings({ theme: isLight ? "light" : "dark" });
}

/* ---------------- Weather helpers ---------------- */

function weatherCodeEmoji(code) {
  if (code === 0) return "☀️";
  if ([1, 2, 3].includes(code)) return "⛅";
  if ([45, 48].includes(code)) return "🌫️";
  if ([51, 53, 55, 56, 57].includes(code)) return "🌦️";
  if ([61, 63, 65, 66, 67].includes(code)) return "🌧️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "🌨️";
  if ([80, 81, 82].includes(code)) return "🌧️";
  if ([95, 96, 99].includes(code)) return "⛈️";
  return "🌤️";
}

/* z API vrací čísla, tak si z toho skládám krátký text pro badge */
function formatForecast(f) {
  if (!f) return null;
  const emoji = weatherCodeEmoji(f.code);
  const tmin = (typeof f.tmin === "number") ? Math.round(f.tmin) : null;
  const tmax = (typeof f.tmax === "number") ? Math.round(f.tmax) : null;
  const rain = (typeof f.rain === "number") ? Math.round(f.rain * 10) / 10 : null;

  const tempPart = (tmin != null && tmax != null) ? `${tmin}–${tmax}°C` : "teplota ?";
  const rainPart = (rain != null) ? `déšť ${rain}mm` : "déšť ?";
  return `${emoji} ${tempPart}, ${rainPart}`;
}

/* počasí do hlavičky, když to spadne tak jen ukážu že není dostupné */
async function initHeaderWeather() {
  try {
    const w = await fetchWeather(50.08, 14.43);
    const txt = `${Math.round(w.temperature)}°C • vítr ${Math.round(w.windspeed)} km/h`;
    $("#weather").html(`<i class="fa-solid fa-cloud-sun"></i><span>${escapeHtml(txt)}</span>`);
  } catch {
    $("#weather").html(`<i class="fa-solid fa-cloud"></i><span>Počasí nedostupné</span>`);
  }
}

/* ---------------- Data init ---------------- */

/* reset dat z API, používám to při prvním startu nebo když dám reset */
async function resetFromApi() {
  const todos = await fetchTodos(30);
  const categories = ["school", "work", "personal", "health", "general"];

  state.tasks = todos.map((t, idx) => ({
    id: uid(),
    title: t.todo,
    description: "",
    category: categories[idx % categories.length],
    priority: (idx % 3 === 0) ? "high" : (idx % 3 === 1) ? "medium" : "low",
    dueDate: "",
    taskType: "indoor",
    completed: !!t.completed,
    createdAt: nowISO(),
    updatedAt: nowISO()
  }));

  saveTasks(state.tasks);
}

/* načtu uložené tasks, když nejsou tak si je stáhnu z API */
async function initData() {
  const stored = loadTasks();
  if (stored && Array.isArray(stored)) {
    /* jednoduchý fallback pro starší data */
    state.tasks = stored.map(t => ({
      ...t,
      taskType: t.taskType || "indoor"
    }));
  } else {
    await resetFromApi();
  }
  saveTasks(state.tasks);
}

/* ---------------- Filters ---------------- */

function uniqueCategories() {
  const set = new Set(state.tasks.map(t => t.category).filter(Boolean));
  return Array.from(set).sort((a, b) => a.localeCompare(b, "cs"));
}

/* select s kategoriemi si plním podle toho, co je v datech */
function updateCategorySelect() {
  const cats = uniqueCategories();
  const $sel = $("#filter-category");
  $sel.empty();
  $sel.append(`<option value="all">Vše</option>`);
  for (const c of cats) $sel.append(`<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`);

  /* když už vybraná kategorie neexistuje, tak to vrátím na all */
  if (state.ui.category !== "all" && !cats.includes(state.ui.category)) {
    state.ui.category = "all";
  }
  $sel.val(state.ui.category);
}

function getVisibleTasks() {
  let items = [...state.tasks];

  if (state.ui.filter === "active") items = items.filter(t => !t.completed);
  if (state.ui.filter === "completed") items = items.filter(t => t.completed);

  if (state.ui.category !== "all") items = items.filter(t => t.category === state.ui.category);
  if (state.ui.priority !== "all") items = items.filter(t => t.priority === state.ui.priority);

  const q = state.ui.search.trim().toLowerCase();
  if (q) {
    items = items.filter(t =>
      (t.title || "").toLowerCase().includes(q) ||
      (t.description || "").toLowerCase().includes(q)
    );
  }

  items.sort((a, b) => {
    const s = state.ui.sort;
    if (s === "created_desc") return (b.createdAt || "").localeCompare(a.createdAt || "");
    if (s === "created_asc") return (a.createdAt || "").localeCompare(b.createdAt || "");
    if (s === "due_asc") {
      const ad = a.dueDate ? new Date(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bd = b.dueDate ? new Date(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      return ad - bd;
    }
    if (s === "prio_desc") {
      return (PRIORITY_WEIGHT[b.priority] || 0) - (PRIORITY_WEIGHT[a.priority] || 0);
    }
    return 0;
  });

  return items;
}

/* ---------------- Badges ---------------- */

function prioBadge(prio) {
  const p = prio || "medium";
  const cls = p === "high" ? "prio-high" : p === "low" ? "prio-low" : "prio-medium";
  const label = p === "high" ? "Vysoká" : p === "low" ? "Nízká" : "Střední";
  return `<span class="badge ${cls}">${escapeHtml(label)}</span>`;
}

function typeBadge(type) {
  return type === "outdoor"
    ? `<span class="badge">Outdoor</span>`
    : `<span class="badge">Indoor</span>`;
}

/* ---------------- Rendering ---------------- */

function renderNav() {
  const isHome = state.page === "home";
  $("#page-home").toggleClass("hidden", !isHome);
  $("#page-stats").toggleClass("hidden", isHome);

  $("#nav-home").toggleClass("is-active", isHome);
  $("#nav-stats").toggleClass("is-active", !isHome);

  $("#btn-add").prop("disabled", !isHome);
}

/* malý souhrn pod filtry, ať je hned vidět kolik toho je */
function renderMiniStats(visible) {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.completed).length;
  const active = total - done;
  $("#stats-mini").text(`Zobrazeno: ${visible.length}\nCelkem: ${total} | Aktivní: ${active} | Hotové: ${done}`);
}

/* pro outdoor úkoly dotáhnu předpověď jen pro unikátní dny
   a výsledek si pamatuju v cache */
async function fillOutdoorWeatherBadges(visibleItems) {
  const dates = Array.from(new Set(
    visibleItems
      .filter(t => t.taskType === "outdoor" && t.dueDate)
      .map(t => t.dueDate)
  ));

  if (!dates.length) return;

  for (const d of dates) {
    let txt = null;

    if (Object.prototype.hasOwnProperty.call(forecastCache, d)) {
      txt = forecastCache[d];
    } else {
      try {
        const f = await fetchDailyForecast(d);
        txt = formatForecast(f);
      } catch {
        txt = null;
      }
      forecastCache[d] = txt;
    }

    const selector = `.js-weather[data-date="${CSS.escape(d)}"]`;
    if (txt) {
      $(selector).removeClass("uncertain").text(txt);
    } else {
      $(selector).addClass("uncertain").text("Počasí se upřesní");
    }
  }
}

function renderHome() {
  updateCategorySelect();

  /* hodnoty do ovládacích prvků beru ze state */
  $("#filter-priority").val(state.ui.priority);
  $("#search").val(state.ui.search);
  $("#sort").val(state.ui.sort);

  $("#filter-chips .chip").removeClass("is-active");
  $(`#filter-chips .chip[data-filter="${state.ui.filter}"]`).addClass("is-active");

  /* podle filtrů si spočítám seznam, který se má ukázat */
  const items = getVisibleTasks();
  renderMiniStats(items);

  const $list = $("#task-list");
  $list.empty();

  if (!items.length) {
    $("#empty").text("Žádné úkoly neodpovídají filtru.");
    return;
  }
  $("#empty").text("");

  for (const t of items) {
    const due = t.dueDate ? formatDate(t.dueDate) : "";
    const dueTxt = due ? `• ${due}` : "";

    const weatherBadge = (t.taskType === "outdoor")
      ? `<span class="badge weather uncertain js-weather" data-date="${escapeHtml(t.dueDate || "")}">
           ${t.dueDate ? "Načítám počasí…" : "Vyplň datum"}
         </span>`
      : "";

    const $row = $(`
      <li class="taskrow" data-id="${escapeHtml(t.id)}">
        <div class="statuscell">
          <input class="js-check" type="checkbox" ${t.completed ? "checked" : ""} />
        </div>

        <div>
          <div class="taskrow__title">${escapeHtml(t.title)}</div>
          <div class="badges">
            <span class="badge">${escapeHtml(t.category)}</span>
            ${typeBadge(t.taskType)}
            ${prioBadge(t.priority)}
            ${t.dueDate ? `<span class="badge">${escapeHtml(dueTxt)}</span>` : ""}
            ${weatherBadge}
          </div>
        </div>

        <div class="taskrow__desc">${escapeHtml(t.description || "")}</div>

        <div class="right">
          <button class="actionbtn js-edit" type="button" title="Upravit">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="actionbtn danger js-delete" type="button" title="Smazat">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </li>
    `);

    if (t.completed) $row.addClass("is-done");
    $list.append($row);
  }

  /* počasí doplním až po vykreslení seznamu */
  fillOutdoorWeatherBadges(items);
}

function renderStats() {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.completed).length;
  const active = total - done;

  const outdoor = state.tasks.filter(t => t.taskType === "outdoor").length;
  const indoor = total - outdoor;

  const byCat = {};
  for (const t of state.tasks) byCat[t.category] = (byCat[t.category] || 0) + 1;

  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const topCats = cats.slice(0, 5).map(([c, n]) => `<li><b>${escapeHtml(c)}</b>: ${n}</li>`).join("");

  const late = state.tasks.filter(t =>
    t.dueDate && !t.completed && new Date(t.dueDate).getTime() < Date.now()
  ).length;

  $("#stats-text").html(`
    <h3>Nějaký statistiky</h3>
    <ul>
      <li>Celkem úkolů: <b>${total}</b></li>
      <li>Splněné: <b>${done}</b></li>
      <li>Nesplněné: <b>${active}</b></li>
      <li>Po termínu (nesplněné): <b>${late}</b></li>
      <li>Indoor: <b>${indoor}</b> | Outdoor: <b>${outdoor}</b></li>
    </ul>
    <h3>Top kategorie</h3>
    <ul>${topCats || "<li class='muted'>Žádné kategorie</li>"}</ul>
  `);

  /* graf vždycky znovu vytvořím, aby seděl na aktuální data */
  const canvas = document.getElementById("chart");
  const ctx = canvas.getContext("2d");

  if (state.chart) state.chart.destroy();

  state.chart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Splněné", "Nesplněné"],
      datasets: [{ data: [done, active] }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}

function render() {
  renderNav();
  if (state.page === "home") renderHome();
  else renderStats();
}

/* ---------------- Modal ---------------- */

async function updateWeatherPreviewInForm() {
  const type = String($("#form-tasktype").val() || "indoor");
  const dateISO = String($("#form-due").val() || "");

  if (type !== "outdoor") {
    $("#form-weather").html(`<span class="muted">Indoor úkol – počasí se nezobrazuje.</span>`);
    return;
  }

  if (!dateISO) {
    $("#form-weather").html(`<span class="warn">Outdoor úkol bez termínu – doplň datum pro zobrazení předpovědi.</span>`);
    return;
  }

  $("#form-weather").html(`<span class="muted">Načítám předpověď…</span>`);

  try {
    const f = await fetchDailyForecast(dateISO);
    const txt = formatForecast(f);
    if (txt) $("#form-weather").html(`<b>Předpověď:</b> ${escapeHtml(txt)}`);
    else $("#form-weather").html(`<span class="warn">Předpověď na tento den zatím není dostupná.</span>`);
  } catch {
    $("#form-weather").html(`<span class="warn">Předpověď se nepodařila načíst.</span>`);
  }
}

function openModal(mode, task = null) {
  $("#form-error").text("");

  $("#modal-title").text("Přidání / úprava úkolu");

  if (mode === "add") {
    $("#btn-submit").text("Přidat");
    $("#form-id").val("");
    $("#form-title").val("");
    $("#form-desc").val("");
    $("#form-category").val(state.ui.category !== "all" ? state.ui.category : "");
    $("#form-priority").val("medium");
    $("#form-due").val("");
    $("#form-tasktype").val("indoor");
  } else {
    $("#btn-submit").text("Uložit");
    $("#form-id").val(task.id);
    $("#form-title").val(task.title);
    $("#form-desc").val(task.description || "");
    $("#form-category").val(task.category || "");
    $("#form-priority").val(task.priority || "medium");
    $("#form-due").val(task.dueDate || "");
    $("#form-tasktype").val(task.taskType || "indoor");
  }

  updateWeatherPreviewInForm();
  $("#modal").removeClass("hidden");
  $("#form-title").trigger("focus");
}

function closeModal() {
  $("#modal").addClass("hidden");
}

/* ---------------- CRUD ---------------- */

function saveAll() {
  saveTasks(state.tasks);
}

function addTaskFromForm() {
  const title = String($("#form-title").val()).trim();
  const description = String($("#form-desc").val()).trim();
  const category = String($("#form-category").val()).trim();
  const priority = String($("#form-priority").val());
  const dueDate = String($("#form-due").val());
  const taskType = String($("#form-tasktype").val());

  if (!title) return "Název je povinný.";
  if (!category) return "Kategorie je povinná.";

  const t = {
    id: uid(),
    title,
    description,
    category,
    priority,
    dueDate: dueDate || "",
    taskType: taskType || "indoor",
    completed: false,
    createdAt: nowISO(),
    updatedAt: nowISO()
  };

  state.tasks.unshift(t);
  saveAll();
  return null;
}

function updateTaskFromForm(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return "Úkol nenalezen.";

  const title = String($("#form-title").val()).trim();
  const description = String($("#form-desc").val()).trim();
  const category = String($("#form-category").val()).trim();
  const priority = String($("#form-priority").val());
  const dueDate = String($("#form-due").val());
  const taskType = String($("#form-tasktype").val());

  if (!title) return "Název je povinný.";
  if (!category) return "Kategorie je povinná.";

  t.title = title;
  t.description = description;
  t.category = category;
  t.priority = priority;
  t.dueDate = dueDate || "";
  t.taskType = taskType || "indoor";
  t.updatedAt = nowISO();

  saveAll();
  return null;
}

function toggleCompleted(id) {
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;
  t.completed = !t.completed;
  t.updatedAt = nowISO();
  saveAll();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveAll();
}

/* ---------------- Events ---------------- */

function bindEvents() {
  /* navigace mezi stránkami */
  $("#nav-home").on("click", () => { state.page = "home"; render(); });
  $("#nav-stats").on("click", () => { state.page = "stats"; render(); });

  /* theme tlačítko */
  $("#toggle-dark").on("click", toggleTheme);

  /* přidání úkolu */
  $("#btn-add").on("click", () => openModal("add"));

  /* zavření modalu */
  $("#btn-cancel").on("click", closeModal);
  $("#modal-backdrop").on("click", closeModal);
  $(document).on("keydown", (e) => {
    if (e.key === "Escape" && !$("#modal").hasClass("hidden")) closeModal();
  });

  /* náhled počasí ve formuláři */
  $("#form-tasktype").on("change", updateWeatherPreviewInForm);
  $("#form-due").on("change", updateWeatherPreviewInForm);

  /* odeslání formuláře */
  $("#task-form").on("submit", async (e) => {
    e.preventDefault();
    $("#form-error").text("");

    const id = String($("#form-id").val());
    const savedType = String($("#form-tasktype").val());
    const savedDue = String($("#form-due").val());

    const err = id ? updateTaskFromForm(id) : addTaskFromForm();
    if (err) {
      $("#form-error").text(err);
      return;
    }

    /* jednoduché upozornění pro outdoor */
    if (savedType === "outdoor" && savedDue) {
      try {
        const f = await fetchDailyForecast(savedDue);
        if (!f) alert("Outdoor úkol: předpověď na tento den zatím není dostupná. Počasí se upřesní později.");
      } catch {
        alert("Outdoor úkol: předpověď se nepodařila načíst. Počasí se upřesní později.");
      }
    } else if (savedType === "outdoor" && !savedDue) {
      alert("Outdoor úkol nemá vyplněný termín — počasí se ukáže až po doplnění data.");
    }

    closeModal();
    render();
  });

  /* filtrovací chipy */
  $("#filter-chips").on("click", ".chip", (e) => {
    state.ui.filter = $(e.currentTarget).data("filter");
    renderHome();
  });

  $("#filter-category").on("change", (e) => {
    state.ui.category = String($(e.currentTarget).val());
    renderHome();
  });

  $("#filter-priority").on("change", (e) => {
    state.ui.priority = String($(e.currentTarget).val());
    renderHome();
  });

  $("#search").on("input", (e) => {
    state.ui.search = String($(e.currentTarget).val());
    renderHome();
  });

  $("#sort").on("change", (e) => {
    state.ui.sort = String($(e.currentTarget).val());
    renderHome();
  });

  /* akce v seznamu */
  $("#task-list").on("change", ".js-check", (e) => {
    const id = $(e.currentTarget).closest(".taskrow").data("id");
    toggleCompleted(id);
    renderHome();
  });

  $("#task-list").on("click", ".js-edit", (e) => {
    const id = $(e.currentTarget).closest(".taskrow").data("id");
    const t = state.tasks.find(x => x.id === id);
    if (!t) return;
    openModal("edit", t);
  });

  $("#task-list").on("click", ".js-delete", (e) => {
    const id = $(e.currentTarget).closest(".taskrow").data("id");
    const t = state.tasks.find(x => x.id === id);
    if (!t) return;
    if (!confirm(`Opravdu smazat úkol:\n"${t.title}"?`)) return;
    deleteTask(id);
    renderHome();
  });

  /* smažu všechny hotové úkoly */
  $("#clear-completed").on("click", () => {
    const before = state.tasks.length;
    state.tasks = state.tasks.filter(t => !t.completed);
    saveAll();
    if (before !== state.tasks.length) renderHome();
  });

  /* reset dat z API */
  $("#reset-data").on("click", async () => {
    if (!confirm("Reset: smažeš localStorage a načteš výchozí data z REST API. Pokračovat?")) return;
    $("#global-msg").text("");
    try {
      clearTasks();
      await resetFromApi();
      $("#global-msg").text("Reset hotový.");
      setTimeout(() => $("#global-msg").text(""), 2000);
      render();
    } catch (err) {
      $("#global-msg").text(err?.message || "Reset se nepodařil.");
    }
  });
}

/* ---------------- Boot ---------------- */

async function boot() {
  applyTheme();
  await initData();
  initHeaderWeather();
  bindEvents();
  render();
}

$(boot);
