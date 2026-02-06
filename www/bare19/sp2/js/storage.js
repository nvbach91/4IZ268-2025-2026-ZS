/* klíče pro localStorage */
const KEYS = {
  TASKS: "tm_tasks_v2",
  SETTINGS: "tm_settings_v2"
};

/*bezpečné načtení JSON z localStorage
   když jsou data rozbitá, aplikace nespadne */
function safeParse(raw, fallback) {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

/* načtení uložených úkolů */
export function loadTasks() {
  const raw = localStorage.getItem(KEYS.TASKS);
  return safeParse(raw, null);
}

/* uložení úkolů do localStorage*/
export function saveTasks(tasks) {
  localStorage.setItem(KEYS.TASKS, JSON.stringify(tasks));
}

/* kompletní smazání úkolů z localStorage */
export function clearTasks() {
  localStorage.removeItem(KEYS.TASKS);
}

/*načtení nastavení aplikace (dark / light mód)*/
export function loadSettings() {
  const raw = localStorage.getItem(KEYS.SETTINGS);
  return safeParse(raw, { theme: "dark" });
}

/* uložení nastavení aplikace */
export function saveSettings(settings) {
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}
