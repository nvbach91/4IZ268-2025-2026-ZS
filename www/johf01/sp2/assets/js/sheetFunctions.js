import { App } from "./main.js"
import { Google, checkAuthentication } from "./google.js"
import { renderTasks, $tasklist, $form, $h1, spinner } from "./DOMedits.js"



// Read data from Google Sheets 
export function listData() {
    if (!checkAuthentication()) return;

    $tasklist.empty();
    $tasklist.append(spinner);

    loadTasksFromSheet().then(tasks => { spinner.remove(); renderTasks(tasks); });
};

// 1) Fetch data from Google Sheets (pure function)
function loadTasksFromSheet() {
    return gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: Google.spreadsheetId,
        range: 'Database!A2:E256',
    }).then(response => {
        const range = response.result;
        return range.values || [];
    });
}

function formatDateTime(value) {
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

    // If NOT editing → append new row
    if (App.editIndex === null) {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId: Google.spreadsheetId,
            range: 'Database!A2',
            valueInputOption: 'RAW',
            insertDataOption: 'INSERT_ROWS',
            resource: {
                values: [
                    [data.name, formatDateTime(data.time), data.place, data.category, data.description]
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

        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: Google.spreadsheetId,
            range: 'Database!A2:E256',
        });

        let rows = response.result.values || [];

        rows[App.editIndex] = [
            data.name,
            formatDateTime(data.time),
            data.place,
            data.category,
            data.description
        ];
        await gapi.client.sheets.spreadsheets.values.clear({
            spreadsheetId: Google.spreadsheetId,
            range: 'Database!A2:E256',
        });
        await gapi.client.sheets.spreadsheets.values.update({
            spreadsheetId: Google.spreadsheetId,
            range: 'Database!A2',
            valueInputOption: 'RAW',
            resource: {
                values: rows
            }
        });
        App.editIndex = null; // exit edit mode 
    }

    $form.hide();
    $('html, body').animate({ scrollTop: $h1.offset().top }, 400);
    listData();
}