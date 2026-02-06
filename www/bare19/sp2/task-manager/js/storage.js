export function saveTasks(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

export function loadTasks() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}
