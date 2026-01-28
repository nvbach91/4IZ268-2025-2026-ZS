
const CLIENT_ID = '362401534700-qpvoeks25o5v434r1gilmbrjt1lof2vm.apps.googleusercontent.com';
const API_KEY = 'AIzaSyB2Ws3ZiO25w2Jfs_Ak2eGtj8p1G5xUz-8';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/tasks';

const $authBtn = $('#authorize_button');
const $signoutBtn = $('#signout_button');
const $addEventBtn = $('#add-event-btn');
const $addTaskBtn = $('#add-task-btn');
const $calendar = $('#calendar');
const $todoList = $('#todo-list');
const $eventsInfo = $('#events-info');
const $todoInfo = $('#todo-info');

let tokenClient;
let gapiInited = false;
let gisInited = false;

function showButtons() {
    if (gapiInited && gisInited) {
        if (localStorage.getItem('isLoggedIn') === 'true') {
            tokenClient.requestAccessToken({ prompt: '' });
        } else {
            $authBtn.show();
            $signoutBtn.hide();
        }
    }
}

function handleAuthClick() {
    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');

        localStorage.removeItem('isLoggedIn');

        $authBtn.show();
        $signoutBtn.hide();
        $addEventBtn.hide();
        $addTaskBtn.hide();
        $calendar.empty();
        $todoList.empty();
        $eventsInfo.show();
        $todoInfo.show();
    }
}

function startGoogle() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
                "https://www.googleapis.com/discovery/v1/apis/tasks/v1/rest"
            ],
        });
        gapiInited = true;
        showButtons();
    });
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (resp) => {
            if (resp.error) {
                localStorage.removeItem('isLoggedIn');
                $authBtn.show();
                $signoutBtn.hide();
                $addEventBtn.hide();
                $addTaskBtn.hide();
                throw (resp);
            }

            localStorage.setItem('isLoggedIn', 'true');

            $authBtn.hide();
            $signoutBtn.show();
            $addEventBtn.show();
            $addTaskBtn.show();
            loadTodayEvents();
            loadTasks();
        }
    });
    gisInited = true;
    showButtons();
}

async function loadTodayEvents() {
    $eventsInfo.hide();
    const calendarDiv = $calendar;

    const today = new Date();

    calendarDiv.html(`<div class="loader"><i class="fas fa-spinner"></i></div>`);

    const startDay = new Date(today);
    startDay.setHours(0, 0, 0, 0);

    const endDay = new Date(today);
    endDay.setHours(23, 59, 59, 999);
    try {
        const response = await gapi.client.calendar.events.list({
            'calendarId': 'primary',
            'timeMin': startDay.toISOString(),
            'timeMax': endDay.toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'orderBy': 'startTime'
        });

        const events = response.result.items;
        let htmlContent = '';
        if (events.length > 0) {
            events.forEach(event => {
                let time = 'All day';
                if (event.start.dateTime) {
                    time = new Date(event.start.dateTime).toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                htmlContent += `
                <div class="api-item">
                    <span class="item-text">
                        <span class="event-time">${time}</span> 
                        ${event.summary} 
                    </span>
                    <div class="actions-wrapper">
                        <button class="delete-btn delete-event-btn" data-event-id="${event.id}" title="Smazat událost">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
             `;
            });
            calendarDiv.html(htmlContent);
        } else {
            calendarDiv.html('<p>Dnes nemáš v kalendáři žádné plány.</p>');
        }

    } catch (error) {
        console.error('Error loading calendar:', error);
        $eventsInfo.text('Nepodařilo se načíst kalendář.');
    }
}

async function addEvent(title, startStr) {
    if (!title || !startStr) return;

    const startDate = new Date(startStr);

    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);

    try {
        await gapi.client.calendar.events.insert({
            'calendarId': 'primary',
            'resource': {
                'summary': title,
                'start': { 'dateTime': startDate.toISOString() },
                'end': { 'dateTime': endDate.toISOString() }
            }
        });
        loadTodayEvents();
    } catch (error) {
        console.error('Error adding event:', error);
    }
}

async function deleteEvent(eventId) {
    try {
        await gapi.client.calendar.events.delete({
            'calendarId': 'primary',
            'eventId': eventId
        });
        loadTodayEvents();
    } catch (error) {
        console.error('Error deleting event:', error);
    }
}

async function loadTasks() {
    $todoInfo.hide();
    const todoList = $todoList;
    todoList.html('<div class="loader"><i class="fas fa-spinner"></i></div>');

    try {
        const response = await gapi.client.tasks.tasks.list({
            'tasklist': '@default',
            'showCompleted': true,
            'showHidden': false
        });

        const tasks = response.result.items;
        let htmlContent = '';

        if (tasks && tasks.length > 0) {
            tasks.forEach(task => {
                const status = task.status === 'completed' ? '<s>' : '';
                const statusEnd = task.status === 'completed' ? '</s>' : '';

                htmlContent += `
                    <li class="api-item">
                        <span class="task-title item-text" data-id="${task.id}" data-status="${task.status}">
                                                ${status}${task.title}${statusEnd}
                        </span>
                        <div class="actions-wrapper">
                            <button class="delete-btn delete-task-btn" data-task-id="${task.id}" title="Smazat úkol"><i class="fas fa-trash"></i></button>
                        </div>
                    </li>
                `;
            });
            todoList.html(htmlContent);
        } else {
            todoList.html('<p>Žádné úkoly k zobrazení.</p>');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        todoList.text('Nepodařilo se načíst úkoly.');
    }
}

async function addTask(title) {
    if (!title) return;

    try {
        await gapi.client.tasks.tasks.insert({
            'tasklist': '@default',
            'resource': { 'title': title }
        });
        loadTasks();
    } catch (error) {
        console.error('Error adding task:', error);
    }
}

async function deleteTask(taskId) {
    try {
        await gapi.client.tasks.tasks.delete({
            'tasklist': '@default',
            'task': taskId
        });
        loadTasks();
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

async function toggleTaskStatus(taskId, currentStatus) {
    const newStatus = currentStatus === 'completed' ? 'needsAction' : 'completed';
    try {
        await gapi.client.tasks.tasks.patch({
            'tasklist': '@default',
            'task': taskId,
            'resource': { 'status': newStatus }
        });
        loadTasks();
    } catch (error) {
        console.error('Chyba při změně stavu úkolu:', error);
    }
}

export { startGoogle, handleAuthClick, handleSignoutClick, addEvent, deleteEvent, addTask, deleteTask, toggleTaskStatus };