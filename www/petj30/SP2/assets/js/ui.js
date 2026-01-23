// Vykreslování UI

// Pomocí: vytvoří element
function elFromHTML(html) {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  return template.content.firstChild;
}

// Vykreslení prvků
export function createTaskElement(task) {
  const completedClass = task.status === 'done' ? 'task-completed' : '';
  // formatovat datum podle lokalniho zvyku
  const formattedDue = task.due_date?.split('-').reverse().join('. ');
  const dueText = formattedDue ? `<small class="text-muted"> • ${formattedDue}</small>` : '';
  const categoryText = task.category ? `<div class="task-category">${escapeHtml(task.category)}</div>` : '';

  const html = `
    <div class="list-group-item d-flex align-items-center" data-id="${task.id}">
      <div class="task-info">
        <div class="d-flex align-items-center">
          <button class="btn btn-sm btn-outline-secondary me-3" title="Označit jako hotové" data-action="toggle" data-id="${task.id}">
            ${task.status === 'done' ? '✔' : '☐'}
          </button>
          <div>
            <div class="task-title ${completedClass}">${escapeHtml(task.title)}</div>
            ${categoryText}
            ${formattedDue ? `<small class="text-muted">Termín: ${escapeHtml(formattedDue)}</small>` : ''}
          </div>
        </div>
      </div>

      <div class="task-actions ms-3">
        <button class="btn btn-sm btn-outline-primary" title="Upravit" data-action="edit" data-id="${task.id}">✎</button>
        <button class="btn btn-sm btn-outline-danger" title="Smazat" data-action="delete" data-id="${task.id}">🗑</button>
      </div>
    </div>
  `;
  return elFromHTML(html);
}

/**
 * renderTaskList(tasks)
 * Přepíše obsah #task-list podle pole tasks (očekává ucelená data).
 */
export function renderTaskList(tasks = []) {
  const container = document.getElementById('task-list');
  if (!container) {
    console.error('renderTaskList: #task-list nenalezen');
    return;
  }
  container.innerHTML = ''; // clear

  if (!tasks.length) {
    const empty = document.createElement('div');
    empty.className = 'text-muted';
    empty.textContent = 'Žádné úkoly. Přidej první úkol pomocí formuláře výše.';
    container.appendChild(empty);
    return;
  }

  // Append items directly - modifying DOM in loop
  for (const t of tasks) {
    container.appendChild(createTaskElement(t));
  }
}

/* ---------------------------
   Filtry
   --------------------------- */

/**
 * renderFilters(activeFilter)
 * Aktivuje tlačítko filtru (all|active|done)
 */
export function renderFilters(activeFilter = 'all') {
  const buttons = document.querySelectorAll('#filters .btn-group [data-filter]');
  // HTML má data-filter na tlačítcích; zpracování obou variant
  // Nejdřív odebrat active ze všech tlačítek v skupině
  const groupBtns = document.querySelectorAll('#filters .btn-group .btn');
  groupBtns.forEach(b => b.classList.remove('active'));

  // Aktivovat správné tlačítko
  const btn = document.querySelector(`#filters .btn-group [data-filter="${activeFilter}"]`);
  if (btn) btn.classList.add('active');
}

/* ---------------------------
   Vykreslování počasí
   --------------------------- */

export function showWeatherLoading(show = true) {
  const result = document.getElementById('weather-result');
  const l = document.getElementById('weather-loading');
  const content = document.getElementById('weather-content');
  const err = document.getElementById('weather-error');
  if (result) result.style.display = 'block';
  if (l) l.style.display = show ? 'block' : 'none';
  if (content) content.classList.toggle('d-none', show);
  if (err) err.style.display = 'none';
}

export function renderWeather(weather) {
  const result = document.getElementById('weather-result');
  const content = document.getElementById('weather-content');
  const iconEl = document.getElementById('weather-icon');
  const loc = document.getElementById('weather-location');
  const desc = document.getElementById('weather-desc');
  const temp = document.getElementById('weather-temp');
  const err = document.getElementById('weather-error');
  const loading = document.getElementById('weather-loading');

  if (result) result.style.display = 'block';
  if (loading) loading.style.display = 'none';
  if (err) err.style.display = 'none';

  if (!weather) {
    if (content) content.classList.add('d-none');
    return;
  }

  if (content) content.classList.remove('d-none');
  if (loc) loc.textContent = `${weather.city}${weather.country ? ', ' + weather.country : ''}`;
  if (desc) desc.textContent = weather.description || '';
  if (temp) temp.textContent = `Teplota: ${weather.temp} °C (pocitově ${weather.feels_like} °C), vlhkost ${weather.humidity}%`;

  // Zpracování ikony (kód OpenWeatherMap)
  if (iconEl) {
    iconEl.innerHTML = '';
    if (weather.icon) {
      const img = document.createElement('img');
      img.src = `https://openweathermap.org/img/wn/${weather.icon}@2x.png`;
      img.alt = weather.description || 'weather icon';
      img.width = 50;
      img.height = 50;
      iconEl.appendChild(img);
    }
  }
}

export function showWeatherError(msg) {
  const result = document.getElementById('weather-result');
  const loading = document.getElementById('weather-loading');
  const content = document.getElementById('weather-content');
  const err = document.getElementById('weather-error');
  if (result) result.style.display = 'block';
  if (loading) loading.style.display = 'none';
  if (content) content.classList.add('d-none');
  if (err) {
    err.style.display = 'block';
    err.textContent = msg || 'Chyba při načítání počasí.';
  }
}

/* ---------------------------
   Oznámení / malé pomocné funkce
   --------------------------- */

export function showToast(message, type = 'info', timeout = 2500) {
  // Malé dočasné upozornění vložené do DOM
  const wrapper = document.createElement('div');
  wrapper.style.position = 'fixed';
  wrapper.style.right = '18px';
  wrapper.style.bottom = '18px';
  wrapper.style.zIndex = 1060;

  const alert = document.createElement('div');
  alert.className = `alert alert-${type} shadow-sm`;
  alert.style.margin = 0;
  alert.textContent = message;

  wrapper.appendChild(alert);
  document.body.appendChild(wrapper);

  setTimeout(() => {
    wrapper.remove();
  }, timeout);
}

/* ---------------------------
   Malý nástroj (escape HTML)
   --------------------------- */
export function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
