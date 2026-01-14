// Logika úkolů - CRUD a filtrování

import { getTasks, saveTasks, addTask, updateTask, removeTask } from './storage.js';
import { uid, formatISODate } from './utils.js';

// CRUD funkce
export function createTask(data = {}) {
  const now = new Date().toISOString();
  const task = {
    id: `t_${uid()}`,
    title: (data.title || '').trim(),
    category: data.category || null,
    priority: data.priority || 'normal',
    status: 'pending',
    due_date: data.due_date || null,
    created_at: now,
    updated_at: now,
    completed_at: null,
    meta: data.meta || {}
  };

  // základní validace
  if (!task.title) {
    throw new Error('Název úkolu nemůže být prázdný.');
  }

  addTask(task);
  return task;
}

/**
 * Vrátí task podle id, nebo null pokud neexistuje.
 * @param {string} id
 */
export function getTaskById(id) {
  const tasks = getTasks();
  return tasks.find(t => t.id === id) || null;
}

/**
 * Aktualizuje task (plné přepsání polí podle objektu updated).
 * updated musí obsahovat id.
 * @param {Object} updated
 * @returns {Object} updated task
 */
export function updateTaskById(updated) {
  if (!updated || !updated.id) throw new Error('updateTaskById očekává objekt s id.');

  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === updated.id);
  if (idx === -1) throw new Error('Úkol nenalezen.');

  const merged = {
    ...tasks[idx],
    ...updated,
    updated_at: new Date().toISOString()
  };

  tasks[idx] = merged;
  saveTasks(tasks);
  return merged;
}

/**
 * Odstraní úkol podle id.
 * @param {string} id
 */
export function deleteTaskById(id) {
  removeTask(id);
}

/**
 * Přepne stav mezi pending a done.
 * @param {string} id
 * @returns {Object} updated task nebo null
 */
export function toggleComplete(id) {
  const tasks = getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  if (idx === -1) return null;

  const t = tasks[idx];
  if (t.status === 'done') {
    t.status = 'pending';
    t.completed_at = null;
  } else {
    t.status = 'done';
    t.completed_at = new Date().toISOString();
  }
  t.updated_at = new Date().toISOString();

  tasks[idx] = t;
  saveTasks(tasks);
  return t;
}

/* -------------------------
   Filtrování a statistiky
   ------------------------- */

/**
 * Vrátí pole tasků aplikované podle filtru.
 * filterObj může obsahovat:
 *   - filter: 'all'|'active'|'done'
 *   - category: string|null
 *   - search: string (hledaný text v title/description)
 *   - dueBefore: 'YYYY-MM-DD' (nezahrnuje čas)
 *   - dueAfter: 'YYYY-MM-DD'
 *
 * @param {Object} filterObj
 * @returns {Array}
 */
export function getFilteredTasks(filterObj = {}) {
  let tasks = getTasks();

  const {
    filter = 'all',
    category = null,
    search = null,
    dueBefore = null,
    dueAfter = null
  } = filterObj;

  // stav
  if (filter === 'active') {
    tasks = tasks.filter(t => t.status !== 'done');
  } else if (filter === 'done') {
    tasks = tasks.filter(t => t.status === 'done');
  }

  // kategorie
  if (category) {
    tasks = tasks.filter(t => (t.category || '').toLowerCase() === String(category).toLowerCase());
  }

  // search (prohledáváme title i description)
  if (search && String(search).trim()) {
    const q = String(search).trim().toLowerCase();
    tasks = tasks.filter(t => {
      const title = (t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
  }

  // due date filtering
  if (dueBefore) {
    tasks = tasks.filter(t => t.due_date && t.due_date <= dueBefore);
  }
  if (dueAfter) {
    tasks = tasks.filter(t => t.due_date && t.due_date >= dueAfter);
  }

  // řazení: nejdříve podle due_date (nejbližší nahoře), poté podle created_at
  tasks.sort((a, b) => {
    if (a.due_date && b.due_date) {
      if (a.due_date < b.due_date) return -1;
      if (a.due_date > b.due_date) return 1;
    } else if (a.due_date && !b.due_date) {
      return -1;
    } else if (!a.due_date && b.due_date) {
      return 1;
    }
    // fallback: created_at (novější nejdříve)
    if (a.created_at > b.created_at) return -1;
    if (a.created_at < b.created_at) return 1;
    return 0;
  });

  return tasks;
}

/**
 * Vrátí statistiky: celkem, aktivní, dokončené
 */
export function getStats() {
  const tasks = getTasks();
  const total = tasks.length;
  const done = tasks.filter(t => t.status === 'done').length;
  const active = total - done;
  return { total, active, done };
}

/* -------------------------
   Helpery pro UI / debug
   ------------------------- */

/**
 * Vrátí shrnutí (string) pro debug/obhajobu
 */
export function summary() {
  const s = getStats();
  return `Úkolů: ${s.total} (aktivní: ${s.active}, dokončené: ${s.done})`;
}
