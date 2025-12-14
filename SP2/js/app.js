/* ----------------------------------------------------------
   app.js
   Spojuje UI, logiku úkolů, storage a API.
   Hlavní řídicí modul aplikace.
---------------------------------------------------------- */

import { createTask, deleteTaskById, toggleComplete, getFilteredTasks } from './tasks.js';
import { getTasks } from './storage.js';
import { getWeatherForCity } from './api.js';
import { debounce } from './utils.js';
import { renderTaskList, renderFilters, showWeatherLoading, renderWeather, showWeatherError, showToast } from './ui.js';

/* ----------------------------------------------------------
   1) Inicializace aplikace
---------------------------------------------------------- */

document.addEventListener("DOMContentLoaded", () => {
  initializeTasks();
  bindTaskForm();
  bindTaskListEvents();
  bindFilters();
  bindSearch();
  bindWeatherForm();

  // Načti výchozí počasí (můžeš upravit město)
  const defaultCity = "Prague";
  document.getElementById("weather-city").value = defaultCity;
  loadWeather(defaultCity);
});

/* ----------------------------------------------------------
   Tasks — načtení a vykreslení
---------------------------------------------------------- */

function initializeTasks() {
  const tasks = getTasks();
  const result = getFilteredTasks({ filter: "all" });
  renderTaskList(result);
  renderFilters("all");
}

/* ----------------------------------------------------------
   Přidání nového úkolu
---------------------------------------------------------- */

function bindTaskForm() {
  const form = document.getElementById("task-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("task-title").value.trim();
    const category = document.getElementById("task-category").value || null;
    const due = document.getElementById("task-due").value || null;
    const desc = document.getElementById("task-desc").value.trim() || null;

    if (!title) {
      showToast("Název úkolu nesmí být prázdný.", "danger");
      return;
    }

    try {
      createTask({
        title,
        category,
        due_date: due,
        description: desc
      });

      updateTaskList();
      form.reset();
      showToast("Úkol přidán.", "success");

    } catch (err) {
      showToast(err.message, "danger");
    }
  });
}

/* ----------------------------------------------------------
   Kliky v seznamu úkolů (toggle, delete)
---------------------------------------------------------- */

function bindTaskListEvents() {
  const container = document.getElementById("task-list");

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    if (action === "toggle") {
      toggleComplete(id);
      showToast("Stav úkolu změněn.", "info");
    }

    if (action === "delete") {
      deleteTaskById(id);
      showToast("Úkol odstraněn.", "warning");
    }

    updateTaskList();
  });
}

/* ----------------------------------------------------------
   Filtrování úkolů (all / active / done)
---------------------------------------------------------- */

function bindFilters() {
  const group = document.querySelectorAll("#filters .btn-group .btn");

  group.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      renderFilters(filter);
      updateTaskList(filter);
    });
  });
}

/* ----------------------------------------------------------
   Vyhledávání (debounce)
---------------------------------------------------------- */

function bindSearch() {
  const input = document.getElementById("search-input");
  input.addEventListener(
    "input",
    debounce(() => {
      updateTaskList();
    }, 300)
  );
}

/* ----------------------------------------------------------
   Centrální funkce pro aktualizaci seznamu
---------------------------------------------------------- */

function updateTaskList(currentFilter = null) {
  const filterBtn = document.querySelector("#filters .btn-group .active");
  const activeFilter = currentFilter || (filterBtn ? filterBtn.dataset.filter : "all");
  const searchQuery = document.getElementById("search-input").value.trim();

  const tasks = getFilteredTasks({
    filter: activeFilter,
    search: searchQuery
  });

  renderTaskList(tasks);
}

/* ----------------------------------------------------------
   WEATHER — získání dat
---------------------------------------------------------- */

function bindWeatherForm() {
  const form = document.getElementById("weather-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = document.getElementById("weather-city").value.trim();
    if (city) loadWeather(city);
  });
}

async function loadWeather(city) {
  showWeatherLoading(true);
  try {
    const weather = await getWeatherForCity(city);
    renderWeather(weather);
  } catch (err) {
    showWeatherError(err.message);
  }
}
