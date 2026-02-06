import { loadTasks, saveTasks, clearTasks, loadSettings, saveSettings } from "./storage.js";
import { fetchTodos, fetchWeather, fetchDailyForecast } from "./api.js";

const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3 };


const $dom = {};

function initDomCache() {
  $dom.body = $("body");
  $dom.document = $(document);

  
  $dom.pageHome = $("#page-home");
  $dom.pageStats = $("#page-stats");
  $dom.navHome = $("#nav-home");
  $dom.navStats = $("#nav-stats");
  $dom.btnAdd = $("#btn-add");
  $dom.toggleDark = $("#toggle-dark");
  $dom.btnWeatherReset = $("#btn-weather-reset");

  $dom.weather = $("#weather");

  
  $dom.filterChips = $("#filter-chips");
  $dom.filterCategory = $("#filter-category");
  $dom.filterPriority = $("#filter-priority");
  $dom.search = $("#search");
  $dom.sort = $("#sort");

  $dom.pagesMount = $("#pages-mount");

  $dom.taskList = $("#task-list");
  $dom.empty = $("#empty");
  $dom.statsMini = $("#stats-mini");

  
  $dom.modal = $("#modal");
  $dom.modalBackdrop = $("#modal-backdrop");
  $dom.btnCancel = $("#btn-cancel");
  $dom.taskForm = $("#task-form");
  $dom.formError = $("#form-error");
  $dom.modalTitle = $("#modal-title");
  $dom.btnSubmit = $("#btn-submit");

  $dom.formId = $("#form-id");
  $dom.formTitle = $("#form-title");
  $dom.formDesc = $("#form-desc");
  $dom.formCategory = $("#form-category");
  $dom.formPriority = $("#form-priority");
  $dom.formDue = $("#form-due");
  $dom.formTasktype = $("#form-tasktype");
  $dom.formWeather = $("#form-weather");

  
  $dom.statsText = $("#stats-text");

  $dom.globalMsg = $("#global-msg");
  $dom.resetData = $("#reset-data");
  $dom.clearCompleted = $("#clear-completed");
}


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

function debounce(fn, delay = 300) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
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
  if (s.theme === "light") $dom.body.addClass("light");
  else $dom.body.removeClass("light");
}

/* kliknutím přepnu dark/light a uložím to do localStorage */
function toggleTheme() {
  const isLight = $dom.body.toggleClass("light").hasClass("light");
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

/*function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolokace není podporována"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        console.warn("Geolokace error:", {
          code: err.code,          
          message: err.message
        });
        reject(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  });
}*/



/* počasí do hlavičky, když to spadne tak jen ukážu že není dostupné */
async function initHeaderWeather() {
  let lat = 50.08, lon = 14.43; 
  try {
    const pos = await getUserLocation();
    lat = pos.lat;
    lon = pos.lon;

    state.ui.latitude = lat;
    state.ui.longitude = lon;

    } catch (err) {
    //console.warn("Geolokace zamítnuta nebo nedostupná, používám default (Praha).");
    //console.warn("Geolokace FAIL:", err?.code, err?.message);
    //console.warn("origin:", location.origin, "isSecureContext:", window.isSecureContext);
    //console.warn("href:", location.href);
    //console.warn("Používám default (Praha).");
    }

  try {
    const w = await fetchWeather(lat, lon); 
    const txt = `${Math.round(w.temperature)}°C • vítr ${Math.round(w.windspeed)} km/h`;
    $dom.weather.html(`<i class="fa-solid fa-cloud-sun"></i><span>${escapeHtml(txt)}</span>`);
  } catch (err) {
    $dom.weather.html(`<i class="fa-solid fa-cloud"></i><span>Počasí nedostupné</span>`);
  }
}

/* ---------------- Data init ---------------- */

/* reset dat z API, používám to při prvním startu nebo když dám reset */
async function resetFromApi() {
  const todos = await fetchTodos(20);
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
  const $sel = $dom.filterCategory;
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
function mountActivePage() {

  $dom.pageHome.removeClass("hidden");
  $dom.pageStats.removeClass("hidden");

  if (state.page === "home") {
    $dom.pageStats.detach();              
    $dom.pagesMount.append($dom.pageHome); 
  } else {
    $dom.pageHome.detach();
    $dom.pagesMount.append($dom.pageStats);
  }
}


function renderNav() {
  const isHome = state.page === "home";
  
  mountActivePage();

  $dom.navHome.toggleClass("is-active", isHome);
  $dom.navStats.toggleClass("is-active", !isHome);

  $dom.btnAdd.prop("disabled", !isHome);
}

/* malý souhrn pod filtry, ať je hned vidět kolik toho je */
function renderMiniStats(visible) {
  const total = state.tasks.length;
  const done = state.tasks.filter(t => t.completed).length;
  const active = total - done;
  $dom.statsMini.text(`Zobrazeno: ${visible.length}\nCelkem: ${total} | Aktivní: ${active} | Hotové: ${done}`);
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
        const f = await fetchDailyForecast(d, state.ui.latitude, state.ui.longitude);
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
  $dom.filterPriority.val(state.ui.priority);
  $dom.search.val(state.ui.search);
  $dom.sort.val(state.ui.sort);

  $dom.filterChips.find(".chip").removeClass("is-active");
  $(`#filter-chips .chip[data-filter="${state.ui.filter}"]`).addClass("is-active");

  /* podle filtrů si spočítám seznam, který se má ukázat */
  const items = getVisibleTasks();
  renderMiniStats(items);

  const $list = $dom.taskList;
  $list.empty();

  if (!items.length) {
    $dom.empty.text("Žádné úkoly neodpovídají filtru.");
    return;
  }
  $dom.empty.text("");

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

  $dom.statsText.html(`
    <h3>Statistiky</h3>
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
  const type = String($dom.formTasktype.val() || "indoor");
  const dateISO = String($dom.formDue.val() || "");

  if (type !== "outdoor") {
    $dom.formWeather.html(`<span class="muted">Indoor úkol – počasí se nezobrazuje.</span>`);
    return;
  }

  if (!dateISO) {
    $dom.formWeather.html(`<span class="warn">Outdoor úkol bez termínu – doplň datum pro zobrazení předpovědi.</span>`);
    return;
  }

  $dom.formWeather.html(`<span class="muted">Načítám předpověď…</span>`);

  try {
    const f = await fetchDailyForecast(dateISO, state.ui.latitude, state.ui.longitude);
    const txt = formatForecast(f);
    if (txt) $dom.formWeather.html(`<b>Předpověď:</b> ${escapeHtml(txt)}`);
    else $dom.formWeather.html(`<span class="warn">Předpověď na tento den zatím není dostupná.</span>`);
  } catch {
    $dom.formWeather.html(`<span class="warn">Předpověď se nepodařila načíst.</span>`);
  }
}

function openModal(mode, task = null) {
  $dom.formError.text("");

  $dom.modalTitle.text("Přidání / úprava úkolu");

  if (mode === "add") {
    $dom.btnSubmit.text("Přidat");
    $dom.formId.val("");
    $dom.formTitle.val("");
    $dom.formDesc.val("");
    $dom.formCategory.val(state.ui.category !== "all" ? state.ui.category : "");
    $dom.formPriority.val("medium");
    $dom.formDue.val("");
    $dom.formTasktype.val("indoor");
  } else {
    $dom.btnSubmit.text("Uložit");
    $dom.formId.val(task.id);
    $dom.formTitle.val(task.title);
    $dom.formDesc.val(task.description || "");
    $dom.formCategory.val(task.category || "");
    $dom.formPriority.val(task.priority || "medium");
    $dom.formDue.val(task.dueDate || "");
    $dom.formTasktype.val(task.taskType || "indoor");
  }

  updateWeatherPreviewInForm();
  $dom.modal.removeClass("hidden");
  $dom.formTitle.trigger("focus");
}

function closeModal() {
  $dom.modal.addClass("hidden");
}

/* ---------------- CRUD ---------------- */

function saveAll() {
  saveTasks(state.tasks);
}

function addTaskFromForm() {
  const title = String($dom.formTitle.val()).trim();
  const description = String($dom.formDesc.val()).trim();
  const category = String($dom.formCategory.val()).trim();
  const priority = String($dom.formPriority.val());
  const dueDate = String($dom.formDue.val());
  const taskType = String($dom.formTasktype.val());

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

  const title = String($dom.formTitle.val()).trim();
  const description = String($dom.formDesc.val()).trim();
  const category = String($dom.formCategory.val()).trim();
  const priority = String($dom.formPriority.val());
  const dueDate = String($dom.formDue.val());
  const taskType = String($dom.formTasktype.val());

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
  $dom.navHome.on("click", () => { state.page = "home"; render(); });
  $dom.navStats.on("click", () => { state.page = "stats"; render(); });

  /* theme tlačítko */
  $dom.toggleDark.on("click", toggleTheme);

  $dom.btnWeatherReset.on("click", async () => {
    initHeaderWeather();
    fillOutdoorWeatherBadges(getVisibleTasks());
  });

  /* přidání úkolu */
  $dom.btnAdd.on("click", () => openModal("add"));

  /* zavření modalu */
  $dom.btnCancel.on("click", closeModal);
  $dom.modalBackdrop.on("click", closeModal);
  $dom.document.on("keydown", (e) => {
    if (e.key === "Escape" && !$dom.modal.hasClass("hidden")) closeModal();
  });

  /* náhled počasí ve formuláři */
  $dom.formTasktype.on("change", updateWeatherPreviewInForm);
  $dom.formDue.on("change", updateWeatherPreviewInForm);

  /* odeslání formuláře */
  $dom.taskForm.on("submit", async (e) => {
    e.preventDefault();
    $dom.formError.text("");

    const id = String($dom.formId.val());
    const savedType = String($dom.formTasktype.val());
    const savedDue = String($dom.formDue.val());

    const err = id ? updateTaskFromForm(id) : addTaskFromForm();
    if (err) {
      $dom.formError.text(err);
      return;
    }

    /* jednoduché upozornění pro outdoor */
    if (savedType === "outdoor" && savedDue) {
      try {
        const f = await fetchDailyForecast(savedDue, state.ui.latitude, state.ui.longitude);
        if (!f) {
          await Swal.fire({
          icon: "info",
          title: "Outdoor úkol",
          text: "Předpověď na tento den zatím není dostupná. Počasí se upřesní později."
        });
        }
      } catch (err) {
        await Swal.fire({
          icon: "warning",
          title: "Outdoor úkol",
          text: "Předpověď se nepodařila načíst. Počasí se upřesní později."
        });
      }
    } else if (savedType === "outdoor" && !savedDue) {
      await Swal.fire({
        icon: "info",
        title: "Outdoor úkol",
        text: "Úkol nemá vyplněný termín — počasí se ukáže až po doplnění data."
      });
    }


    closeModal();
    render();
  });

  /* filtrovací chipy */
  $dom.filterChips.on("click", ".chip", (e) => {
    state.ui.filter = $(e.currentTarget).data("filter");
    renderHome();
  });

  $dom.filterCategory.on("change", (e) => {
    state.ui.category = String($(e.currentTarget).val());
    renderHome();
  });

  $dom.filterPriority.on("change", (e) => {
    state.ui.priority = String($(e.currentTarget).val());
    renderHome();
  });

  const onSearchInput = debounce((value) => {
  state.ui.search = value;
  renderHome();
}, 300);

$dom.search.on("input", (e) => {
  onSearchInput(String($(e.currentTarget).val()));
});


  $dom.sort.on("change", (e) => {
    state.ui.sort = String($(e.currentTarget).val());
    renderHome();
  });

  /* akce v seznamu */
  $dom.taskList.on("change", ".js-check", (e) => {
    const id = $(e.currentTarget).closest(".taskrow").data("id");
    toggleCompleted(id);
    renderHome();
  });

  $dom.taskList.on("click", ".js-edit", (e) => {
    const id = $(e.currentTarget).closest(".taskrow").data("id");
    const t = state.tasks.find(x => x.id === id);
    if (!t) return;
    openModal("edit", t);
  });

  $dom.taskList.on("click", ".js-delete", (e) => {
  const id = $(e.currentTarget).closest(".taskrow").data("id");
  const t = state.tasks.find(x => x.id === id);
  if (!t) return;

  Swal.fire({
    title: "Opravdu smazat?",
    text: `Úkol: "${t.title}"`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ano, smazat",
    cancelButtonText: "Ne"
  }).then((result) => {
    if (!result.isConfirmed) return;
    deleteTask(id);
    renderHome();
  });
});


  /* smažu všechny hotové úkoly */
  $dom.clearCompleted.on("click", async () => {
  const result = await Swal.fire({
    title: "Smazat všechny hotové úkoly?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ano",
    cancelButtonText: "Ne"
  });

  if (!result.isConfirmed) return;

  const before = state.tasks.length;
  state.tasks = state.tasks.filter(t => !t.completed);
  saveAll();
  if (before !== state.tasks.length) renderHome();
});

  /* reset dat z API */
  $dom.resetData.on("click", async () => {
  const result = await Swal.fire({
    title: "Reset dat",
    text: "Smažeš localStorage a načtou se výchozí data z REST API. Pokračovat?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ano, reset",
    cancelButtonText: "Zrušit"
  });

  if (!result.isConfirmed) return;

  $dom.globalMsg.text("");
  try {
    clearTasks();
    await resetFromApi();
    $dom.globalMsg.text("Reset hotový.");
    setTimeout(() => $dom.globalMsg.text(""), 2000);
    render();
  } catch (err) {
    $dom.globalMsg.text(err?.message || "Reset se nepodařil.");
  }
});

}

/* ---------------- Boot ---------------- */

async function boot() {
  initDomCache();
  mountActivePage();
  applyTheme();
  await initData();
  initHeaderWeather();
  bindEvents();
  render();
}

$(boot);
