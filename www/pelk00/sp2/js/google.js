
const CLIENT_ID = '362401534700-qpvoeks25o5v434r1gilmbrjt1lof2vm.apps.googleusercontent.com';
const API_KEY = 'AIzaSyB2Ws3ZiO25w2Jfs_Ak2eGtj8p1G5xUz-8';

const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function showButtons() {
    if (gapiInited && gisInited) {
        $('#authorize_button').show();
    }
}

function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error) {
            throw (resp);
        }

        localStorage.setItem('isLoggedIn', 'true');

        console.log("Jsem přihlášen!");
        $('#authorize_button').hide();
        $('#signout_button').show();
        loadTodayEvents();
    };

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

        $('#authorize_button').show();
        $('#signout_button').hide();
        $('#calendar').empty();
        $('#events-info').show();
        console.log("Odhlášeno.");
    }
}

function startGoogle() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: API_KEY,
            discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
        });
        gapiInited = true;
        showButtons();
    });
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '',
    });
    gisInited = true;
    showButtons();
}

async function loadTodayEvents() {
    $('#events-info').hide();
    const calendarDiv = $('#calendar');

    const today = new Date();

    calendarDiv.html(`
 <div id="events-list">Načítám události z Googlu...</div>
 `);

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
        const divList = $('#events-list');
        divList.empty();
        if (events.length > 0) {
            events.forEach(event => {
                let time = 'Celý den';
                if (event.start.dateTime) {
                    time = new Date(event.start.dateTime).toLocaleTimeString('cs-CZ', {
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                }
                divList.append(`
 <div style="margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px;">
 <span style="font-weight: bold; color: #555;">${time}</span> 
 ${event.summary}
 </div>
 `);
            });
        } else {
            divList.html('<p>Dnes nemáš v kalendáři žádné plány.</p>');
        }

    } catch (chyba) {
        console.error('Chyba při načítání kalendáře:', chyba);
        $('#events-list').text('Nepodařilo se načíst kalendář.');
    }
}

export { startGoogle, handleAuthClick, handleSignoutClick };