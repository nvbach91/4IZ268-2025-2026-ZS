import { App } from "./main.js"
import { listData } from "./sheetFunctions.js"
import { tokenClient, checkAuthentication, Google } from "./google.js"


export const $tasklist = $('.tasklist');
export const $form = $('#add-form');
const $googleAlertSuccess = $('.google-alert-success')
const $googleAlertFail = $('.google-alert-fail')
export const $h1 = $('#h1');

export function authBtnClick() {
    if (gapi.client.getToken()) {
        console.warn("Already authenticated");
        alert("You are already authenticated!");
        return;
    }

    console.log("Authorize clicked"); // Console log if it worked
    tokenClient.requestAccessToken();
}

export function signoutBtnClick() {
    if (!gapi.client.getToken()) {
        console.warn("Already signed out");
        alert("Nejste přihlášený!");
        return;
    }

    google.accounts.oauth2.revoke(gapi.client.getToken().access_token, () => {
        console.log("Signed out");
    });

    gapi.client.setToken(null);

    $googleAlertSuccess.hide();
    $googleAlertFail.show();
}

export function refreshBtnClick() {
    if (!checkAuthentication()) return;
    listData();
}

export function showFormBtnClick() {
    $form.show();
    $('html, body').animate({ scrollTop: $form.offset().top }, 400);
}

export function hideFormBtnClick() {
    $form.hide();
    $('html, body').animate({ scrollTop: $h1.offset().top }, 400);
}

// 2) Render tasks into the DOM (no DOM lookups inside loops)
export function renderTasks(taskRows) {
    $tasklist.empty(); // clear previous content

    if (taskRows.length === 0) {
        $tasklist.append("<p>Error - nenalezena žádná data.</p>");
        return;
    }

    const fragment = $(document.createDocumentFragment());

    taskRows.forEach((row, index) => {
        const [nazev, cas, misto, kategorie, popis] = row;
        const left = timeLeftUntil(cas);

        const $task = $(`
            <div class="task mb-3 p-3 rounded">
                <h5>${nazev || ''}</h5>
                <p>${cas || ''}</p>
                <p>${left}</p>
                <p>${misto || ''}</p>
                <p>${kategorie || ''}</p>
                <p class="task-popis">${popis || ''}</p>

                <div class="task-buttons border-top border-dark p-2 mt-2">
                    <button class="btn btn-info btn-sm edit-btn">Upravit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Smazat</button>
                </div>
            </div>
        `);

        // DELETE handler
        $task.find('.delete-btn').on('click', () => {
            if (!checkAuthentication()) return;
            deleteTask(index);
        });

        // EDIT handler
        $task.find('.edit-btn').on('click', () => {
            if (!checkAuthentication()) return;

            App.editIndex = index;

            $('#taskTitle').val(nazev);
            $('#taskTime').val(cas ? formatDateTimeToISO(cas) : "");
            $('#taskPlace').val(misto);
            $('#taskCategory').val(kategorie);
            $('#taskDesc').val(popis);

            $form.show();
            $('html, body').animate({ scrollTop: $form.offset().top }, 400);
        });

        fragment.append($task);
    });
    $tasklist.append(fragment);
}

function formatDateTimeToISO(value) {
    if (!value) return "";

    const [datePart, timePart] = value.split(" ");
    if (!datePart || !timePart)
        return null;
    const [d, m, y] = datePart.split(".").map(Number);
    const [hours, minutes] = timePart.split(":").map(Number);
    return new Date(y, m - 1, d, hours, minutes).toISOString().slice(0, 16);
}

function timeLeftUntil(dateString) {
    const iso = formatDateTimeToISO(dateString);
    if (!iso) return "";

    const target = new Date(iso);
    if (isNaN(target.getTime())) return "";

    const now = new Date();
    const diffMs = target - now;

    if (diffMs <= 0) return "Po termínu";

    const diffMinutes = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMinutes / (60 * 24));
    const hours = Math.round((diffMinutes % (60 * 24)) / 60);
    const minutes = diffMinutes % 60;

    if (days > 0) return `zbylý čas: ${days} dní ${hours} hodin`;
    if (hours > 0) return `zbylý čas: ${hours} hodin ${minutes} minut`;
    return `zbylý čas: ${minutes} minut`;
}

async function deleteTask(index) {
    if (!checkAuthentication()) return;

    // 1. Load all rows
    const response = await gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: Google.spreadsheetId,
        range: 'Database!A2:E256',
    });

    let rows = response.result.values || [];

    // 2. Remove the row at the given index
    rows.splice(index, 1);

    // 3. Clear the sheet
    await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: Google.spreadsheetId,
        range: 'Database!A2:E256',
    });

    // 4. Write remaining rows back
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: Google.spreadsheetId,
        range: 'Database!A2',
        valueInputOption: 'RAW',
        resource: { values: rows }
    });

    // 5. Refresh UI
    listData();
}

export const spinner = document.createElement('div');
spinner.classList.add('spinner');