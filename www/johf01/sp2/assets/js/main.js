const App = {};

// Google API credentials
App.CLIENT_ID = '241231260660-ihaoo9oo9fpcs8mv0n6q8ajv4vuk0tc4.apps.googleusercontent.com';
App.API_KEY = 'AIzaSyBX3BtMytvjmuRdusFhsrT6IepA9kGwuu0';
App.spreadsheetId = '1rqhRW4010xlcKE4b9_IFxCCHt3mSBPbDYkF1BmaqBrs';
App.DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
App.SCOPES = 'https://www.googleapis.com/auth/spreadsheets';



// --- EDIT MODE STATE ---
App.editIndex = null; // null = adding, number = editing

// Load GAPI function (Sheets API client)
function loadGapi() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: App.API_KEY,
            discoveryDocs: App.DISCOVERY_DOCS,
        });
        console.log("GAPI loaded");

    });
}

// Initialize GIS OAuth client function
let tokenClient;
function initGis() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: App.CLIENT_ID,
        scope: App.SCOPES,
        callback: (response) => {
            if (response.error) throw response;

            console.log("OAuth token received");
            $('.google-alert-success').show();
            $('.google-alert-fail').hide();
            gapi.client.setToken({ access_token: response.access_token });

            App.listData();
        },
    });
}

// Load GAPI + GIS on window load
window.addEventListener("load", async () => {
    await loadGapi();

    if (typeof google === "undefined") {
        console.error("GIS script not loaded");
        return;
    }
    initGis();


});


// DOM Ready: Attach button handlers
$(document).ready(() => {
    App.authorizeButton = $('#authorize_button');
    App.signoutButton = $('#signout_button');
    App.refreshButton = $('#refresh-button');
    App.showFormButton = $('#show-form-button');
    App.hideFormButton = $('#hide-form-button');



    // Attach handlers immediately
    App.authorizeButton.on('click', () => {
        if (gapi.client.getToken()) {
            console.warn("Already authenticated");
            alert("You are already authenticated!");
            return;
        }

        console.log("Authorize clicked"); // Console log if it worked
        tokenClient.requestAccessToken({ prompt: 'consent' });


    });

    App.signoutButton.on('click', () => {
        if (!gapi.client.getToken()) {
            console.warn("Already signed out");
            alert("Nejste přihlášený!");
            return;
        }

        google.accounts.oauth2.revoke(gapi.client.getToken().access_token, () => {
            console.log("Signed out");
        });

        gapi.client.setToken(null);

        $('.google-alert-success').hide();
        $('.google-alert-fail').show();
    });

    App.showFormButton.on('click', () => {
        $('#add-form').show();
        $('html, body').animate({ scrollTop: $('#add-form').offset().top }, 400);
    });

    App.hideFormButton.on('click', () => {
        $('#add-form').hide();
        $('html, body').animate({ scrollTop: $('#h1').offset().top }, 400);
    });

    App.refreshButton.on('click', () => {
        if (!checkAuthentication()) return;
        App.listData();
    });

    // Form submit handler and write data to sheet
    App.addForm = $('#add-form').submit(async (e) => {
        e.preventDefault();

        if (!checkAuthentication()) return;


        const data = {};
        App.addForm.serializeArray().forEach(({ name, value }) => data[name] = value);

        // If NOT editing → append new row
        if (App.editIndex === null) {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: App.spreadsheetId,
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
            const $tasklistEdit = $('.tasklist');
            $tasklistEdit.empty();
            $tasklistEdit.append(spinner);
            $('html, body').animate({ scrollTop: $('#h1').offset().top }, 400);

            const response = await gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: App.spreadsheetId,
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
                spreadsheetId: App.spreadsheetId,
                range: 'Database!A2:E256',
            });
            await gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: App.spreadsheetId,
                range: 'Database!A2',
                valueInputOption: 'RAW',
                resource: {
                    values: rows
                }
            });
            App.editIndex = null; // exit edit mode 
        }

        $('#add-form').hide();
        $('html, body').animate({ scrollTop: $('#h1').offset().top }, 400);
        App.listData();
    });
});

// Read data from Google Sheets 
App.listData = () => {
    if (!checkAuthentication()) return;

    const $tasklist = $('.tasklist');
    $tasklist.empty();
    $tasklist.append(spinner);

    gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: App.spreadsheetId,
        range: 'Database!A2:E256',
    }).then((response) => {
        const range = response.result;

        if (range.values && range.values.length > 0) {

            range.values.forEach(row => {
                const [nazev, cas, misto, kategorie, popis] = row;
                const left = timeLeftUntil(cas);

                // Create task element as jQuery object
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

                // Attach delete handler
                $task.find('.delete-btn').on('click', () => {
                    if (!checkAuthentication()) return;

                    const index = $('.task').index($task);  // find position in list
                    deleteTask(index);                      // delete from sheet
                });

                // Attach edit handler
                $task.find('.edit-btn').on('click', () => {
                    if (!checkAuthentication()) return;

                    const index = $('.task').index($task);
                    App.editIndex = index;

                    // Load values into form
                    $('#taskTitle').val(nazev);
                    $('#taskTime').val(cas ? toInputDateTime(cas) : "");
                    $('#taskPlace').val(misto);
                    $('#taskCategory').val(kategorie);
                    $('#taskDesc').val(popis);

                    // Show form + scroll
                    $('#add-form').show();
                    $('html, body').animate({ scrollTop: $('#add-form').offset().top }, 400);
                });

                spinner.remove();
                $tasklist.append($task);
            });

        } else {
            $tasklist.append("<p>Error - nenalezena žádná data.</p>");
        }
    });

};

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


function toInputDateTime(value) {
    if (!value) return "";

    const [datePart, timePart] = value.split(" "); 
    if (!datePart || !timePart) 
        return null; 
    const [d, m, y] = datePart.split(".").map(Number); 
    const [hours, minutes] = timePart.split(":").map(Number); 
    return new Date(y, m - 1, d, hours, minutes).toISOString().slice(0, 16);
}

function timeLeftUntil(dateString) {
    const iso = toInputDateTime(dateString);
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
        spreadsheetId: App.spreadsheetId,
        range: 'Database!A2:E256',
    });

    let rows = response.result.values || [];

    // 2. Remove the row at the given index
    rows.splice(index, 1);

    // 3. Clear the sheet
    await gapi.client.sheets.spreadsheets.values.clear({
        spreadsheetId: App.spreadsheetId,
        range: 'Database!A2:E256',
    });

    //ad spinner /////////////////////////////////////////////////////////

    // 4. Write remaining rows back
    await gapi.client.sheets.spreadsheets.values.update({
        spreadsheetId: App.spreadsheetId,
        range: 'Database!A2',
        valueInputOption: 'RAW',
        resource: { values: rows }
    });

    // 5. Refresh UI
    App.listData();
}

function checkAuthentication() {
    if (!gapi.client.getToken()) {
        console.warn("Not signed in yet");
        alert("Nejdřív se prosím přihlašte.");
        return false;
    }
    return true;
}

const spinner = document.createElement('div');
spinner.classList.add('spinner');