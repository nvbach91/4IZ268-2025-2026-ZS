// Hlavní modul aplikace

import { createTask, deleteTaskById, toggleComplete, getFilteredTasks, updateTaskById, getTaskById } from './tasks.js';
import { getTasks } from './storage.js';
import { getWeatherForCity } from './api.js';
import { debounce } from './utils.js';
import { renderTaskList, renderFilters, showWeatherLoading, renderWeather, showWeatherError, showToast } from './ui.js';

const TASKS_PER_PAGE = 5;
let currentPage = 1;

// Inicializace
document.addEventListener("DOMContentLoaded", () => {
  initializeTasks();
  bindTaskForm();
  bindTaskListEvents();
  bindFilters();
  bindDateFilters();
  bindSearch();
  bindWeatherForm();
  bindPagination();
  bindAddCategory();
  bindEditModal();
});

// Načítí úkoly
function initializeTasks() {
  renderFilters("all");
  updateTaskList();  // pouziju updateTaskList co uz ma strankovani
}

// Přidání úkolu
function bindTaskForm() {
  const form = document.getElementById("task-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("task-title").value.trim();
    const category = document.getElementById("task-category").value || null;
    const due = document.getElementById("task-due").value || null;

    if (!title) {
      showToast("Název úkolu nesmí být prázdný.", "danger");
      return;
    }
// termin ukolu by mel byt povinny
    if (!due) {
      showToast("Termín úkolu je povinný.", "danger");
      return;
    }

    try {
      createTask({
        title,
        category,
        due_date: due
      });

      updateTaskList();
      form.reset();
      showToast("Úkol přidán.", "success");

    } catch (err) {
      showToast(err.message, "danger");
    }
  });
}

// Smazání a přepínání úkolů
function bindTaskListEvents() {
  const container = document.getElementById("task-list");

  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    let shouldRefresh = false;

    if (action === "toggle") {
      toggleComplete(id);
      showToast("Stav úkolu změněn.", "info");
      shouldRefresh = true;
    }
// kliknuti na edit otvori modal s aktualnima hodnotama
    if (action === "edit") {
      openEditModal(id);
      return;
    }
// odstraneni polozek by melo pozadovat uzivatelske potvrzeni
    if (action === "delete") {
      if (confirm("Opravdu chcete odstranit tento úkol?")) {
        deleteTaskById(id);
        showToast("Úkol odstraněn.", "warning");
        shouldRefresh = true;
      }
    }

    if (shouldRefresh) updateTaskList();
  });
}

// Filtrování
function bindFilters() {
  const filterButtons = Array.from(document.querySelectorAll("#filters .btn-group .btn"));
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      renderFilters(filter);
      updateTaskList();
    });
  });
}

// Filtrování podle data
function bindDateFilters() {
  document.getElementById('filter-date-from').onchange = () => updateTaskList();
  document.getElementById('filter-date-to').onchange = () => updateTaskList();
}

// Vyhledávání
function bindSearch() {
  const input = document.getElementById("search-input");
  input.addEventListener(
    "input",
    debounce(() => {
      updateTaskList();
    }, 300)
  );
}

// Aktualizace seznamu
function updateTaskList(currentFilter = null) {
  const filterButtons = Array.from(document.querySelectorAll("#filters .btn-group .btn"));
  const filterBtn = filterButtons.find((b) => b.classList.contains("active"));
  const activeFilter = currentFilter || (filterBtn ? filterBtn.dataset.filter : "all");
  const searchQuery = document.getElementById("search-input").value.trim();
  // *
  const dateFrom = document.getElementById("filter-date-from").value;
  const dateTo = document.getElementById("filter-date-to").value;

  const allTasks = getFilteredTasks({ 
    filter: activeFilter, 
    search: searchQuery,
    dueAfter: dateFrom || null,
    dueBefore: dateTo || null
  });
  const total = Math.ceil(allTasks.length / TASKS_PER_PAGE);
  const start = (currentPage - 1) * TASKS_PER_PAGE;
  
  renderTaskList(allTasks.slice(start, start + TASKS_PER_PAGE));
  
  document.getElementById('pagination').style.display = 'flex';
  document.getElementById('page-info').textContent = `Stránka ${currentPage} z ${total}`;
  document.getElementById('prev-page').disabled = currentPage === 1;
  document.getElementById('next-page').disabled = currentPage === total;
}

// Počasí
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

// Stránkování
function bindPagination() {
  document.getElementById('prev-page').onclick = () => currentPage > 1 && (currentPage--, updateTaskList());
  document.getElementById('next-page').onclick = () => {
    const max = Math.ceil(getFilteredTasks({ filter: 'all', search: '' }).length / TASKS_PER_PAGE);
    currentPage < max && (currentPage++, updateTaskList());
  };
}

// Přidání vlastní kategorie
function bindAddCategory() {
  document.getElementById('add-category-btn').onclick = () => {
    const name = prompt('Zadej název kategorie:');
    if (name?.trim()) {
      const select = document.getElementById('task-category');
      const option = document.createElement('option');
      option.value = name.trim();
      option.textContent = name.trim();
      select.appendChild(option);
      select.value = name.trim();
      showToast('Kategorie přidána.', 'success');
    }
  };
}

// Otevře edit modal s aktuálníma hodnotama
function openEditModal(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;
  
  document.getElementById('edit-task-id').value = task.id;
  document.getElementById('edit-task-title').value = task.title;
  document.getElementById('edit-task-category').value = task.category || '';
  document.getElementById('edit-task-due').value = task.due_date || '';
  
  const modal = new bootstrap.Modal(document.getElementById('editTaskModal'));
  modal.show();
}

// Uloží zmeny z edit modalu
function bindEditModal() {
  document.getElementById('save-edit-btn').onclick = () => {
    const id = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const category = document.getElementById('edit-task-category').value || null;
    const due = document.getElementById('edit-task-due').value || null;
    
    if (!title) {
      showToast('Název úkolu nesmí být prázdný.', 'danger');
      return;
    }
    
    if (!due) {
      showToast('Termín úkolu je povinný.', 'danger');
      return;
    }
    
    try {
      updateTaskById({ id, title, category, due_date: due });
      updateTaskList();
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('editTaskModal'));
      modal.hide();
      
      showToast('Úkol upraven.', 'success');
    } catch (err) {
      showToast(err.message, 'danger');
    }
  };
}
