const STORAGE_KEY = 'todoTasks';
let tasks = [];
let currentFilter = 'all';
const PAGE_SIZE = 7;
let currentPage = 1;

const datetimeEl = document.querySelector('.datetime');
const namesdayEl = document.querySelector('.namesday');
const namesdayTEl = document.querySelector('.namesdayT');
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
const statTBDEl = document.querySelector('.statTBD')
const piePercentEl = document.querySelector('.piePercent');
const pieLabelEl = document.querySelector('.pieLabel');
const taskDeadlineInput = document.querySelector('.taskDeadline');
const catSkolaEl = document.querySelector('.catSkola');
const catPraceEl = document.querySelector('.catPrace');
const catDomacnostEl = document.querySelector('.catDomacnost');
const pagePrevBtn = document.querySelector('.pagePrev');
const pageNextBtn = document.querySelector('.pageNext');
const pageInfoEl = document.querySelector('.pageInfo');
const modal = document.querySelector('.modal')
const deadlineNamedayEl = document.querySelector('.deadlineNameday') 

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
    initPagesHandlers();
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

    const tomorrow = dayjs().add(1, 'day').format('DDMM');

    axios.get('https://svatky.adresa.info/json', {
        params: { lang: 'cs', date: tomorrow }
    })
    .then(response => {
        if (Array.isArray(response.data) && response.data.length > 0) { 
            const namesT = response.data.map(item => item.name).join(', '); 
            namesdayTEl.textContent = `Zítra slaví ${namesT}.`; 
        } else {
            namesdayTEl.textContent = 'Nelze načíst svátek.';
        }
    })
    .catch(error => {
        console.error('Chyba při načítání svátku:', error); 
        namesdayTEl.textContent = 'Chyba při načítání svátku.';
    });

}

function loadDeadlineNameday (){
    const ddmm = dayjs(taskDeadlineInput.value).format('DDMM');
    axios.get('https://svatky.adresa.info/json', { params: { lang: 'cs', date: ddmm } })
    .then(response => {
      if (Array.isArray(response.data) && response.data.length > 0){
        const namesD = response.data.map(x => x.name).join(', ');
        deadlineNamedayEl.textContent = `Ten den slaví svátek ${namesD}`;
      } else {
        deadlineNamedayEl.textContent = 'Nelze načíst';
      }
    })
    .catch(() => {
      deadlineNamedayEl.textContent = 'Chyba při načítání svátku.';
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
    taskDeadlineInput.addEventListener('change', loadDeadlineNameday); /**reload svátku po změně deadlinu */

    taskForm.addEventListener('submit', (e) => { 
        e.preventDefault(); 
        createTask(); 
    });
}

function showForm() {
    taskForm.classList.add('show');
    modal.classList.add('show');
    taskDeadlineInput.value = dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm');
    loadDeadlineNameday();
    taskDeadlineInput.value = '';
    taskTitleInput.value = '';
    taskDescInput.value = '';
    taskCategorySelect.value = 'skola';
    taskTitleInput.focus();

    
}

function hideForm() {
    taskForm.classList.remove('show'); 
    modal.classList.remove('show');
}

function createTask() {
    const title = taskTitleInput.value.trim(); 
    const description = taskDescInput.value.trim();
    const category = taskCategorySelect.value;
    const deadline = dayjs(taskDeadlineInput.value).toISOString();

    if (!title) return; 

    const newTask = { 
        id: Date.now().toString() + Math.random().toString(16).slice(2), 
        title,
        description,
        category,
        deadline,
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
            currentPage = 1;
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

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)); /**Počítá totalPages po filtrování */

    const start = (currentPage - 1) * PAGE_SIZE; 
    const pageItems = filtered.slice(start, start + PAGE_SIZE); 

    pageInfoEl.textContent = `Strana ${currentPage}/${totalPages}`; 
    pagePrevBtn.disabled = currentPage === 1;
    pageNextBtn.disabled = currentPage === totalPages; 

    filtered.sort((a, b) => { /**Řezní podle deadlinů */
    return dayjs(a.deadline).valueOf() - dayjs(b.deadline).valueOf();
    });

    if (filtered.length === 0) { 
        const li = document.createElement('li'); 
        li.textContent = 'Zatím žádné úkoly.';
        li.style.fontSize = '0.9rem';
        li.style.color = '#6b716c';
        taskListEl.appendChild(li); 
        pageInfoEl.textContent = 'Strana 1/1';
        pagePrevBtn.disabled = true;
        pageNextBtn.disabled = true;
        return; 
    }

    pageItems.forEach(task => { 
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
            li.style.background = 'var(--accentSoft)';
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
        const deadlineText = task.deadline ? dayjs(task.deadline).format('DD.MM.YYYY HH:mm') : '—';
        metaSmall.textContent = `Kategorie: ${getCategoryLabel(task.category)} • Deadline: ${deadlineText} • Vytvořeno: ${created}`;

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
    const tbd = total - done;
    const percent = total === 0 ? 0 : Math.round((done / total) * 100); 

    statTotalEl.textContent = total;
    statDoneEl.textContent = done;
    statTBDEl.textContent = tbd;

    piePercentEl.style.setProperty('--percent', percent);
    pieLabelEl.textContent = `${percent}%`;

    let skola = 0;
    let prace = 0;
    let domacnost = 0;

    tasks.forEach(t => {
        if (t.category === 'skola') skola++;
        if (t.category === 'prace') prace++;
        if (t.category === 'domacnost') domacnost++;
    });

    catSkolaEl.textContent = skola;
    catPraceEl.textContent = prace;
    catDomacnostEl.textContent = domacnost; /**Doplnění kategorií */

}

function initPagesHandlers() { /**Fce pro pages */
    pagePrevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderTasks();
        }
    });

    pageNextBtn.addEventListener('click', () => {
        const totalPages = Math.max(1, Math.ceil(getFilteredTasks().length / PAGE_SIZE));
        if (currentPage < totalPages) {
            currentPage++;
            renderTasks();
        }
    });
}
