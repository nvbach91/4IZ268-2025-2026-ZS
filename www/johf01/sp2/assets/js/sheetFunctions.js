import { App } from "./main.js"
import { Google, checkAuthentication } from "./google.js"
import { renderTasks, $tasklist, $form, $h1, spinner, populateCategories } from "./DOMedits.js"



// Read data from Google Sheets 
export function listData() {
    if (!checkAuthentication()) return;

    $tasklist.empty();
    $tasklist.append(spinner);

    loadTasksFromSheet().then(tasks => { spinner.remove(); const sorted = sortTasksByDate(tasks); renderTasks(sorted); })
};

// 1) Fetch data from Google Sheets (pure function)
function loadTasksFromSheet() {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: Google.spreadsheetId,
        range: 'Database!A2:E256',
    }).then(response => {
        const rows = response.result.values || [];

        // Wrap each row with its original sheet index
        return rows.map((row, i) => ({
            sheetRow: i,   // original row index (A2 = 0)
            data: row      // the actual row data
        }));
    });
}


export function formatDateTime(value) {
    if (!value) return "";

    const date = new Date(value);
    if (isNaN(date.getTime())) return "";

    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}.${month}.${year} ${hours}:${minutes}`;
}

export async function taskEditFormSubmitClick() {
    if (!checkAuthentication()) return;

    const data = {};
    App.taskEditForm.serializeArray().forEach(({ name, value }) => data[name] = value);
    data.time = new Date(data.time).toISOString();

    // If NOT editing → append new row
    if (App.editIndex === null) {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: Google.spreadsheetId,
            range: 'Database!A2',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [
                    [data.name, data.time, data.place, data.category, data.description]
                ]
            }

        });
        console.log("added new rows");
    }

    // If editing → update existing row
    else {
        $tasklist.empty();
        $tasklist.append(spinner);
        $('html, body').animate({ scrollTop: $h1.offset().top }, 400);

        // app.data ma data z formu
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: Google.spreadsheetId,
            range: `Database!A${App.editIndex + 2}:E${App.editIndex + 2}`,
            valueInputOption: 'RAW',
            resource: {
                values: [
                    [data.name, data.time, data.place, data.category, data.description]
                ]
            }
        });
        App.editIndex = null; // exit edit mode 
    }

    $form.hide();
    App.backdrop.hide();
    $('html, body').animate({ scrollTop: $h1.offset().top }, 400);
    listData();
}

export let googleCategories = ["Práce", "Škola", "Osobní", "Jiné"];

export function loadCategoriesFromSheet() {
    if (!checkAuthentication()) return;

    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: Google.spreadsheetId,
        range: 'Kategorie!A2:A256',
    }).then(response => {

        const rows = response.result.values || [];

        googleCategories = rows.map(r => r[0]).filter(Boolean);

        populateCategories(googleCategories);
        return;
    });
}

function sortTasksByDate(tasks) {
    return tasks.sort((a, b) => {
        return new Date(a.data[1]) - new Date(b.data[1]);
    });
}



