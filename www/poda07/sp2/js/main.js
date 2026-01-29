const STORAGE_KEY = 'todoTasks';
let tasks = [];
let currentFilter = 'all';

const datetimeEl = document.querySelector('.datetime');
const namesdayEl = document.querySelector('.namesday');
const addTaskButton = document.querySelector('.addTaskButton');
const taskForm = document.querySelector('.taskForm');
const taskTitleInput = document.querySelector('.taskTitle');
const taskDescInput = document.querySelector('.taskDsc');
const taskCategorySelect = document.querySelector('.taskCategory');
const cancelButton = document.querySelector('.cancelButton');
const taskListEl = document.querySelector('.taskList');
const filterButtons = document.querySelectorAll('.filterButton');
const deleteDoneButton = document.querySelector('.deleteButton');
const statTotalEl = document.querySelector('.statTotal');
const statDoneEl = document.querySelector('.statDone');
const piePercentEl = document.querySelector('.piePercent');
const pieLabelEl = document.querySelector('.pieLabel');

document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    updateStats();
    initDateTime();
    loadNameday();
    initFormHandlers();
    initFilterHandlers();
    initTaskListHandlers();
    initDeleteDoneHandler();
});

function initDateTime() {
    updateDateTime();
    setInterval(updateDateTime, 60 * 1000);
}

function updateDateTime() {
    const now = dayjs();
    datetimeEl.textContent = now.format('DD.MM.YYYY HH:mm');
}

function loadNameday() {
    axios.get('https://svatky.adresa.info/json', {
        params: { lang: 'cs' }
    })
    .then(response => {
        if (Array.isArray(response.data) && response.data.length > 0) {
            const names = response.data.map(item => item.name).join(', ');
            namesdayEl.textContent = `Dnes má svátek ${names}.`;
        } else {
            namesdayEl.textContent = 'Nelze načíst svátek.';
        }
    })
    .catch(error => {
        console.error('Chyba při načítání svátku:', error);
        namesdayEl.textContent = 'Chyba při načítání svátku.';
    });
}

function loadTasks() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
        tasks = [];
        return;
    }

    try {
        tasks = JSON.parse(raw);
    } catch (e) {
        console.error('Chyba při načítání uložených úkolů:', e);
        tasks = [];
    }
}

function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function initFormHandlers() {
    addTaskButton.addEventListener('click', showForm);
    cancelButton.addEventListener('click', hideForm);

    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        createTask();
    });
}

function showForm() {
    taskForm.classList.add('show');
    taskTitleInput.value = '';
    taskDescInput.value = '';
    taskCategorySelect.value = 'skola';
    taskTitleInput.focus();
}

function hideForm() {
    taskForm.classList.remove('show');
}

function createTask() {
    const title = taskTitleInput.value.trim();
    const description = taskDescInput.value.trim();
    const category = taskCategorySelect.value;

    if (!title) return;

    const newTask = {
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title,
        description,
        category,
        done: false,
        createdAt: dayjs().toISOString()
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();
    hideForm();
}

function initFilterHandlers() {
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

function getFilteredTasks() {
    if (currentFilter === 'active') {
        return tasks.filter(t => !t.done);
    }
    if (currentFilter === 'done') {
        return tasks.filter(t => t.done);
    }
    return tasks;
}

function renderTasks() {
    taskListEl.innerHTML = '';

    const filtered = getFilteredTasks();

    if (filtered.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Zatím žádné úkoly.';
        li.style.fontSize = '0.9rem';
        li.style.color = '#6b716c';
        taskListEl.appendChild(li);
        return;
    }

    filtered.forEach(task => {
        const li = document.createElement('li');
        li.classList.add('task');
        li.dataset.id = task.id;

        const infoDiv = document.createElement('div');
        infoDiv.classList.add('taskInfo');

        const titleStrong = document.createElement('strong');
        titleStrong.textContent = task.title;
        if (task.done) {
            titleStrong.style.textDecoration = 'line-through';
            titleStrong.style.opacity = '0.7';
        }

        const descP = document.createElement('p');
        descP.textContent = task.description;
        descP.style.fontSize = '0.85rem';
        descP.style.marginTop = '2px';
        if (!task.description) {
            descP.style.display = 'none';
        }

        const metaSmall = document.createElement('small');
        const created = task.createdAt
            ? dayjs(task.createdAt).format('DD.MM.YYYY HH:mm')
            : '';
        metaSmall.textContent = `Kategorie: ${getCategoryLabel(task.category)} • Vytvořeno: ${created}`;

        infoDiv.appendChild(titleStrong);
        infoDiv.appendChild(descP);
        infoDiv.appendChild(metaSmall);

        const actionsDiv = document.createElement('div');
        actionsDiv.classList.add('taskActions');

        const toggleBtn = document.createElement('button');
        toggleBtn.classList.add('btn', 'toggleButton');
        toggleBtn.textContent = task.done ? 'Vrátit' : 'Hotovo';

        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('btn', 'deleteOneButton');
        deleteBtn.textContent = 'Smazat';

        actionsDiv.appendChild(toggleBtn);
        actionsDiv.appendChild(deleteBtn);

        li.appendChild(infoDiv);
        li.appendChild(actionsDiv);

        taskListEl.appendChild(li);
    });
}

function getCategoryLabel(value) {
    switch (value) {
        case 'skola': return 'Škola';
        case 'prace': return 'Práce';
        case 'domacnost': return 'Domácnost';
        default: return value;
    }
}

function initTaskListHandlers() {
    taskListEl.addEventListener('click', (e) => {
        const li = e.target.closest('.task');
        if (!li) return;

        const id = li.dataset.id;

        if (e.target.closest('.toggleButton')) {
            toggleTaskDone(id);
        } else if (e.target.closest('.deleteOneButton')) {
            deleteTask(id);
        }
    });
}

function toggleTaskDone(id) {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    task.done = !task.done;
    saveTasks();
    renderTasks();
    updateStats();
}

function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
}

function initDeleteDoneHandler() {
    deleteDoneButton.addEventListener('click', () => {
        tasks = tasks.filter(t => !t.done);
        saveTasks();
        renderTasks();
        updateStats();
    });
}

function updateStats() {
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100);

    statTotalEl.textContent = total;
    statDoneEl.textContent = done;

    piePercentEl.style.setProperty('--percent', percent);
    pieLabelEl.textContent = `${percent}%`;

}
