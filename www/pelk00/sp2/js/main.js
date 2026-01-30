import { startGoogle, handleAuthClick, handleSignoutClick, addEvent, deleteEvent, addTask, deleteTask, toggleTaskStatus, loadTodayEvents } from './google.js';

const $authBtn = $('#authorize_button');
const $signoutBtn = $('#signout_button');
const $addEventBtn = $('#add-event-btn');
const $addTaskBtn = $('#add-task-btn');
const $showFormBtn = $('#show-form-btn');
const $entryForm = $('.entry-form');
const $entriesInfo = $('#entries-info');
const $entriesPanel = $('.entries-panel');
const $quoteDisplay = $('#quote-display');
const $currentDate = $('#current-date')
const $eventForm = $('.event-form');
const $taskForm = $('.task-form');
const $dateSelector = $('#calendar-date-selector');
const $modalForm = $('#modal-form');

$(document).ready(function () {
    getQuote();
    showTodaysDate();
    startGoogle();
    loadEntries();

    $authBtn.click(handleAuthClick);
    $signoutBtn.click(handleSignoutClick);

    $addEventBtn.click(addEvent);
    $addTaskBtn.click(addTask);

    // mazání událostí (s potvrzením)
    $(document).on('click', '.delete-event-btn', function (e) {
        const $btn = $(this);
        if (!$btn.hasClass('confirming')) {
            activateConfirm($btn);
        } else {
            deleteEvent($btn.data('event-id'));
        }
    });

    // mazání úkolů (s potvrzením)
    $(document).on('click', '.delete-task-btn', function (e) {
        const $btn = $(this);
        if (!$btn.hasClass('confirming')) {
            activateConfirm($btn);
        } else {
            deleteTask($btn.data('task-id'));
        }
    });

    // přepínání stavu úkolu
    $(document).on('click', '.task-title', function () {
        const id = $(this).data('id');
        const status = $(this).data('status');
        toggleTaskStatus(id, status);
    });

    // zobrazení formuláře pro nový záznam
    $showFormBtn.click(function () {
        $entriesInfo.slideUp();
        $modalForm.find('h3').text('Přidat nový záznam');
        $entryForm.html(`
            <form id="diary-form" class="entry-form-container">
                <input class="entry-input" type="text" id="entry-title" placeholder="Titulek záznamu" required>
                <textarea class="entry-textarea" id="entry-content" placeholder="Tvůj dnešní den..."></textarea>
                <div class="entry-form-actions">
                    <button type="button" id="cancel-entry">Zrušit</button>
                    <button type="submit" id="save-entry-btn">Uložit</button>
                </div>
            </form>
        `);
        $modalForm.fadeIn();
    });

    // uložení nového záznamu
    $(document).on('submit', '#diary-form', function (e) {
        e.preventDefault();
        const $titleInput = $('#entry-title');
        const $contentInput = $('#entry-content');

        const editId = $(this).data('edit-id');
        const title = $titleInput.val().trim();
        const content = $contentInput.val().trim();

        let entries = JSON.parse(localStorage.getItem('my_diary') || '[]');

        const now = new Date();
        const formattedDate = now.toLocaleDateString('cs-CZ', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        if (editId) {
            entries = entries.map(entry => {
                if (entry.id === editId) {
                    return { ...entry, title: title, content: content, date: formattedDate };
                }
                return entry;
            });

            localStorage.setItem('my_diary', JSON.stringify(entries));
            $modalForm.fadeOut();
            loadEntries();
        } else {
            const newEntry = { id: crypto.randomUUID(), title, content, date: formattedDate };
            entries.unshift(newEntry);

            localStorage.setItem('my_diary', JSON.stringify(entries));
            $modalForm.fadeOut();

            $entriesInfo.hide();
            const html = createEntryHtml(newEntry);
            $entriesPanel.prepend(html)
        }
        $showFormBtn.show();
    });

    // zrušení přidávání záznamu
    $(document).on('click', '#cancel-entry', function () {
        $modalForm.fadeOut();
        $showFormBtn.show();
        $('#entry-title, #entry-content').removeClass('input-error');
        loadEntries();
    });

    // mazání záznamu (s potvrzením)
    $(document).on('click', '.delete-entry-btn', function (e) {
        const $btn = $(this);
        if (!$btn.hasClass('confirming')) {
            activateConfirm($btn);
        } else {
            const id = $btn.data('id');
            let entries = JSON.parse(localStorage.getItem('my_diary') || '[]');
            entries = entries.filter(e => e.id !== id);
            localStorage.setItem('my_diary', JSON.stringify(entries));
            loadEntries();
        }
    });

    // úprava záznamu
    $(document).on('click', '.edit-btn', function () {
        const id = $(this).data('id');
        const entries = JSON.parse(localStorage.getItem('my_diary') || '[]');
        const entry = entries.find(e => e.id === id);

        if (entry) {
            $modalForm.find('h3').text('Upravit záznam');

            $entryForm.html(`
            <form id="diary-form" class="entry-form-container" data-edit-id="${entry.id}">
                <input class="entry-input" type="text" id="entry-title" placeholder="Titulek záznamu" value="${entry.title}" required>
                <textarea class="entry-textarea" id="entry-content" placeholder="Tvůj dnešní den...">${entry.content}</textarea>
                <div class="entry-form-actions">
                    <button type="button" id="cancel-entry">Zrušit</button>
                    <button type="submit" id="save-entry-btn">Uložit</button>
                </div>
            </form>
        `);
            $modalForm.fadeIn();
        };
    });

    // zobrazení formuláře pro nový úkol
    $addTaskBtn.click(function () {
        $taskForm.html(`
        <form id="task-form" class="entry-form-container">
            <input class="entry-input" type="text" id="task-title-input" placeholder="Co je třeba udělat?" required>
            <input class="entry-input" type="datetime-local" id="task-date-input" placeholder="Deadline:">
            <div class="entry-form-actions">
                <button type="button" class="cancel-task-btn">Zrušit</button>
                <button type="submit" id="submit-task-btn">Uložit</button>
            </div>
        </form>
    `).slideDown();
        $(this).hide();
    });

    // uložení nového úkolu
    $(document).on('submit', '#task-form', function (e) {
        e.preventDefault();
        const title = $('#task-title-input').val().trim();
        const date = $('#task-date-input').val();
        addTask(title, date);
        $taskForm.slideUp();
        $addTaskBtn.show();
    });

    // zrušení přidávání úkolu
    $(document).on('click', '.cancel-task-btn', function () {
        $taskForm.slideUp();
        $addTaskBtn.show();
    });

    // zobrazení formuláře pro novou událost
    $addEventBtn.click(function () {
        $eventForm.html(`
        <form id="event-form" class="entry-form-container">
            <input class="entry-input" type="text" id="event-title-input" placeholder="Název události" required>
            <input class="entry-input" type="datetime-local" id="event-date-input" required>
            <div class="entry-form-actions">
                <button type="button" class="cancel-event-btn">Zrušit</button>
                <button type="submit" id="submit-event-btn">Uložit</button>
            </div>
        </form>
    `).slideDown();
        $(this).hide();
        $dateSelector.slideUp();
    });

    // uložení nové události
    $(document).on('submit', '#event-form', function (e) {
        e.preventDefault();
        const title = $('#event-title-input').val().trim();
        const date = $('#event-date-input').val();
        addEvent(title, date);
        $eventForm.slideUp();
        $addEventBtn.show();
        $dateSelector.slideDown();
    });

    // zrušení přidávání události
    $(document).on('click', '.cancel-event-btn', function () {
        $eventForm.slideUp();
        $addEventBtn.show();
        $dateSelector.slideDown();
    });

    // nastavení dnešního data jako výchozího
    $dateSelector.val(new Date().toISOString().split('T')[0]);

    // načtení událostí pro vybrané datum
    $dateSelector.on('change', function () {
        const selectedDate = $(this).val();
        loadTodayEvents(selectedDate);
    });

});

// aktivace potvrzení při mazání
function activateConfirm($btn) {
    const $editBtn = $btn.siblings('.edit-btn');

    $editBtn.hide();

    $btn.data('original-html', $btn.html());
    $btn.addClass('confirming').html('<div class="check"><i class="fas fa-check"></i><small>Potvrdit odstranění</small></div>');

    const $cancelBtn = $('<button class="cancel-delete-btn"><i class="fas fa-times"></i></button>');
    $btn.parent().append($cancelBtn);

    $cancelBtn.on('click', function (e) {
        e.stopPropagation();
        $btn.removeClass('confirming').html($btn.data('original-html'));
        $cancelBtn.remove();
        $editBtn.show();
    });
}

// html pro jeden záznam
function createEntryHtml(entry) {
    return `
        <div class="diary-entry" data-id="${entry.id}">
            <div class="entry-header">
                <span>${entry.title} <small class="entry-date">(${entry.date})</small></span>
                <div class="actions-wrapper">
                    <button class="edit-btn" title="Upravit záznam" data-id="${entry.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn delete-entry-btn" title="Smazat záznam" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <p class="entry-body">${entry.content}</p>
        </div>
    `;
}

// načtení záznamů z localStorage
function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('my_diary') || '[]');
    const container = $entriesPanel;
    container.html('<div class="loader"><i class="fas fa-spinner"></i></div>');

    setTimeout(() => {
        container.empty();

        if (entries.length === 0) {
            $entriesInfo.show();
            container.empty();
        } else {
            $entriesInfo.hide();
            entries.forEach(entry => {
                container.append(createEntryHtml(entry));
            });
        }
    }, 300);
}

// načtení náhodného citátu
async function getQuote() {
    try {
        const response = await axios.get('https://dummyjson.com/quotes/random');
        const text = response.data.quote;
        const author = response.data.author;

        $quoteDisplay.html(`
            <p class="quote-text">"${text}"</p>
            <p class="quote-author">— ${author}</p>
        `);
    } catch (error) {
        console.error('Fetch error:', error);
        $quoteDisplay.text('Nepodařilo se načíst citát.');
    }
}

// zobrazení dnešního data
function showTodaysDate() {
    const today = new Date();
    const dateText = today.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    $currentDate.text(dateText);
}