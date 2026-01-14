// Úložiště - localStorage

const STORAGE_KEY = "sp2_tasks";

// Bezpečné parsování JSON
function safeParse(json, fallback) {
  try {
    return JSON.parse(json);
  } catch (e) {
    console.warn("Nepodařilo se načíst data z localStorage, vracím fallback.", e);
    return fallback;
  }
}

// Načítání úkolů
export function getTasks() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  return safeParse(raw, []);
}

// Ukládání úkolů
export function saveTasks(tasks) {
  if (!Array.isArray(tasks)) {
    console.error("saveTasks očekává pole, ale dostal:", tasks);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Přidávání úkolu
export function addTask(task) {
  const tasks = getTasks();
  tasks.push(task);
  saveTasks(tasks);
}

/**
 * Smaže úkol podle ID.
 * @param {string} id
 */
export function removeTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
}

/**
 * Aktualizuje existující úkol podle ID.
 * @param {Object} updatedTask
 */
export function updateTask(updatedTask) {
  const tasks = getTasks().map(t => t.id === updatedTask.id ? updatedTask : t);
  saveTasks(tasks);
}

/**
 * Vymaže všechna data (pouze pro testování).
 */
export function clearAll() {
  localStorage.removeItem(STORAGE_KEY);
}
