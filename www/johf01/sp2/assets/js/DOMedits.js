import { App } from "./main.js"
import { listData, formatDateTime } from "./sheetFunctions.js"
import { tokenClient, checkAuthentication, Google } from "./google.js"


export const $tasklist = $('.tasklist');
export const $form = $('#add-form');
const $googleAlertSuccess = $('.google-alert-success')
const $googleAlertFail = $('.google-alert-fail')
export const $h1 = $('#h1');

export function authBtnClick() {
    if (gapi.client.getToken()) {
        console.warn("Already authenticated");
        alert("Už jste přihlášený!");
        return;
    }

    console.log("Authorize clicked");
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

    App.authorizeButton.show();
    App.signoutButton.hide();
    App.refreshButton.hide();
    $googleAlertSuccess.hide();
    $googleAlertFail.show();
}

export function refreshBtnClick() {
    if (!checkAuthentication()) return;
    listData();
}

export function showFormBtnClick() {
    $form.show();
    App.backdrop.show();
    App.formheading.html("<h2>Přidání úkolu</h2>");
}

export function hideFormBtnClick() {
    $form[0].reset();
    $form.hide();
    App.backdrop.hide();
}

// 2) Render tasks into the DOM
export function renderTasks(taskRows) {
    $tasklist.empty(); // clear previous content


    if (taskRows.length === 0) {
        $tasklist.append("<p>Error - nenalezena žádná data.</p>");
        return;
    }

    const fragment = $(document.createDocumentFragment());

    taskRows.forEach(task => {
        const { sheetRow, data } = task;
        const [nazev, cas, misto, kategorie, popis] = data;

        const left = timeLeftUntil(formatDateTime(cas));

        const $task = $(`
            <div class="task mb-3 p-3 rounded">
                <h5>${nazev || ''}</h5>
                <p>${formatDateTime(cas) || ''}</p>
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

        $task.attr("data-sheet-row", sheetRow);
        $task.attr("data-cas", cas);
        $task.attr("data-kategorie", kategorie);



        fragment.append($task);
    });

    let tempContainer = document.createElement("div");
    tempContainer.appendChild(fragment[0].cloneNode(true));
    let fragmentForStorage = tempContainer.innerHTML;

    localStorage.setItem("myFragment", fragmentForStorage);


    let stored = localStorage.getItem("myFragment");

    if (stored) {
        let temp = document.createElement("div");
        temp.innerHTML = stored;

        let restoredFragment = document.createDocumentFragment();

        while (temp.firstChild) {
            restoredFragment.appendChild(temp.firstChild);
        }

        $tasklist.append(restoredFragment);
    }

    $tasklist.off("click", ".delete-btn");
    $tasklist.off("click", ".edit-btn");

    //New delete handler
    $tasklist.on("click", ".delete-btn", function () {
        if (!checkAuthentication()) return;

        const sheetRow = $(this).closest(".task").data("sheet-row");
        deleteTask(sheetRow);
    });


    // New edit handler
    $tasklist.on("click", ".edit-btn", function () {
        if (!checkAuthentication()) return;
        App.formheading.html("<h2>Editování úkolu</h2>");

        const $task = $(this).closest(".task");
        const sheetRow = $task.data("sheet-row");
        App.editIndex = sheetRow;


        $('#taskTitle').val($task.find("h5").text());
        $('#taskTime').val(isoToDatetimeLocal($task.data("cas")));
        $('#taskPlace').val($task.find("p").eq(2).text());
        $('#taskCategory').val($task.data("kategorie"));
        $('#taskDesc').val($task.find(".task-popis").text());

        $form.show();
        App.backdrop.show();
    });
}

function isoToDatetimeLocal(iso) {
    if (!iso) return "";
    return iso.slice(0, 16); // "YYYY-MM-DDTHH:MM"
}


export function loadJustFromLocalStorage() {
    $tasklist.empty();

    if (localStorage.getItem("myFragment") == undefined) {
        $tasklist.append("Nemáte v prohlížeči uložené žádné úkoly. Nejdřív se prosím přihlašte.")
    }

    let stored = localStorage.getItem("myFragment");

    if (stored) {
        let temp = document.createElement("div");
        temp.innerHTML = stored;

        let restoredFragment = document.createDocumentFragment();

        while (temp.firstChild) {
            restoredFragment.appendChild(temp.firstChild);
        }

        $tasklist.append(restoredFragment);
    }

    $tasklist.off("click", ".delete-btn");
    $tasklist.off("click", ".edit-btn");

    //New delete handler
    $tasklist.on("click", ".delete-btn", function () {
        if (!checkAuthentication()) return;
    });

    // New edit handler
    $tasklist.on("click", ".edit-btn", function () {
        if (!checkAuthentication()) return;

        const $task = $(this).closest(".task");
        const index = $task.data("index");

        App.editIndex = index;

        $('#taskTitle').val($task.find("h5").text());
        $('#taskTime').val(isoToDatetimeLocal($task.data("cas")));
        $('#taskPlace').val($task.find("p").eq(2).text());
        $('#taskCategory').val($task.data("kategorie"));
        $('#taskDesc').val($task.find(".task-popis").text());

        $form.show();
        App.backdrop.show();
    });
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

async function deleteTask(sheetRow) {
    const start = sheetRow + 1; // A2 = rowIndex 0 → sheet row 1

    await gapi.client.sheets.spreadsheets.batchUpdate({
        spreadsheetId: Google.spreadsheetId,
        resource: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: Google.databaseSheetId,
                            dimension: "ROWS",
                            startIndex: start,
                            endIndex: start + 1
                        }
                    }
                }
            ]
        }
    });

    listData();
}


/*
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
*/

export function populateCategories(categories) {
    const $select = $("#taskCategory");
    $select.empty();
    $select.append(`<option value="">Vyberte kategorii</option>`);

    categories.forEach(cat => {
        $select.append(`<option value="${cat}">${cat}</option>`);
    });
}


export const spinner = document.createElement('div');
spinner.classList.add('spinner');