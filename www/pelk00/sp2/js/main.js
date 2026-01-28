import { startGoogle, handleAuthClick, handleSignoutClick, addEvent, deleteEvent, addTask, deleteTask, toggleTaskStatus } from './google.js';

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

$(document).ready(function () {
    getQuote();
    showTodaysDate();
    startGoogle();
    loadEntries();

    $authBtn.click(handleAuthClick);
    $signoutBtn.click(handleSignoutClick);

    $addEventBtn.click(addEvent);
    $addTaskBtn.click(addTask);

    $(document).on('click', '.delete-event-btn', function (e) {
        const $btn = $(this);
        if (!$btn.hasClass('confirming')) {
            activateConfirm($btn);
        } else {
            deleteEvent($btn.data('event-id'));
        }
    });

    $(document).on('click', '.delete-task-btn', function (e) {
        const $btn = $(this);
        if (!$btn.hasClass('confirming')) {
            activateConfirm($btn);
        } else {
            deleteTask($btn.data('task-id'));
        }
    });

    $(document).on('click', '.task-title', function () {
        const id = $(this).data('id');
        const status = $(this).data('status');
        toggleTaskStatus(id, status);
    });

    $showFormBtn.click(function () {
        $entriesInfo.slideUp();
        $entryForm.html(`
            <div class="entry-form-container">
                <input class="entry-input" type="text" id="entry-title" placeholder="Titulek záznamu">
                <textarea class="entry-textarea" id="entry-content" placeholder="Tvůj dnešní den..."></textarea>
                <div class="entry-form-actions">
                    <button id="cancel-entry">Zrušit</button>
                    <button id="save-entry-btn">Uložit</button>
                </div>
            </div>
        `).slideDown();
        $(this).hide();
    });

    $(document).on('click', '#save-entry-btn', function () {
        const $titleInput = $('#entry-title');
        const $contentInput = $('#entry-content');

        $titleInput.removeClass('input-error');
        $contentInput.removeClass('input-error');

        const title = $titleInput.val().trim();
        const content = $contentInput.val().trim();

        if (title && content) {
            const entries = JSON.parse(localStorage.getItem('my_diary') || '[]');
            entries.unshift({ id: Date.now(), title, content, date: new Date().toLocaleDateString('cs-CZ') });
            localStorage.setItem('my_diary', JSON.stringify(entries));

            $entryForm.slideUp();
            $showFormBtn.show();
            loadEntries();
        } else {
            if (!title) $titleInput.addClass('input-error');
            if (!content) $contentInput.addClass('input-error');
        }
    });

    $(document).on('click', '#cancel-entry', function () {
        $entryForm.slideUp();
        $showFormBtn.show();
        $('#entry-title, #entry-content').removeClass('input-error');
        loadEntries();
    });

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

    $addTaskBtn.click(function () {
        $taskForm.html(`
        <div class="entry-form-container">
            <input class="entry-input" type="text" id="task-title-input" placeholder="Co je třeba udělat?">
            <div class="entry-form-actions">
                <button class="cancel-task-btn">Zrušit</button>
                <button id="submit-task-btn">Uložit</button>
            </div>
        </div>
    `).slideDown();
        $(this).hide();
    });

    $(document).on('click', '#submit-task-btn', function () {
        const title = $('#task-title-input').val().trim();
        if (title) {
            addTask(title);
            $taskForm.slideUp();
            $addTaskBtn.show();
        } else {
            $('#task-title-input').addClass('input-error');
        }
    });

    $(document).on('click', '.cancel-task-btn', function () {
        $taskForm.slideUp();
        $addTaskBtn.show();
    });

    $addEventBtn.click(function () {
        $eventForm.html(`
        <div class="entry-form-container">
            <input class="entry-input" type="text" id="event-title-input" placeholder="Název události">
            <input class="entry-input" type="datetime-local" id="event-date-input">
            <div class="entry-form-actions">
                <button class="cancel-event-btn">Zrušit</button>
                <button id="submit-event-btn">Uložit</button>
            </div>
        </div>
    `).slideDown();
        $(this).hide();
    });

    $(document).on('click', '#submit-event-btn', function () {
        const title = $('#event-title-input').val().trim();
        const date = $('#event-date-input').val();
        if (title && date) {
            addEvent(title, date);
            $eventForm.slideUp();
            $addEventBtn.show();
        } else {
            $('#event-title-input, #event-date-input').addClass('input-error');
        }
    });

    $(document).on('click', '.cancel-event-btn', function () {
        $eventForm.slideUp();
        $addEventBtn.show();
    });


});

function activateConfirm($btn) {
    $btn.data('original-html', $btn.html());
    $btn.addClass('confirming').html('<div class="check"><i class="fas fa-check"></i></div>');

    const $cancelBtn = $('<button class="cancel-delete-btn"><i class="fas fa-times"></i></button>');
    $btn.parent().append($cancelBtn);

    $cancelBtn.on('click', function (e) {
        e.stopPropagation();
        $btn.removeClass('confirming').html($btn.data('original-html'));
        $cancelBtn.remove();
    });
}

function loadEntries() {
    const entries = JSON.parse(localStorage.getItem('my_diary') || '[]');
    const container = $entriesPanel;
    container.html('<div class="loader"><i class="fas fa-spinner"></i></div>');

    if (entries.length === 0) {
        $entriesInfo.show();
        container.empty();
    } else {
        $entriesInfo.hide();
    }

    let htmlContent = '';
    entries.forEach(entry => {
        htmlContent += `
            <div class="diary-entry">
                <div class="entry-header">
                    <span>${entry.title} <small class="entry-date">(${entry.date})</small></span>
                    <div class="actions-wrapper">
                        <button class="delete-btn delete-entry-btn" title="Smazat záznam" data-id="${entry.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
                <p class="entry-body">${entry.content}</p>
            </div>
        `;
    });
    container.html(htmlContent);
}

function getQuote() {
    axios.get('https://dummyjson.com/quotes/random')
        .then(function (response) {

            const text = response.data.quote;
            const author = response.data.author;

            $quoteDisplay.html(`
                <p class="quote-text">"${text}"</p>
                <p class="quote-author">— ${author}</p>
            `);
        })
        .catch(function (error) {
            console.error('Fetch error:', error);

            $quoteDisplay.text('Nepodařilo se načíst citát.');
        });
}

function showTodaysDate() {
    const today = new Date();
    const dateText = today.toLocaleDateString('cs-CZ', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
    $currentDate.text(dateText);
}