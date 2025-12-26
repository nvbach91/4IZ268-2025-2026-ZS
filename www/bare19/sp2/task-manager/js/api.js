export async function loadTasks() {
  const response = await fetch('https://dummyjson.com/todos?limit=5');
  const data = await response.json();
  console.log('Loaded tasks from API:', data);
}
