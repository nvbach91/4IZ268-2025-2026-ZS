import { App } from "./main.js"
import { listData } from "./sheetFunctions.js"

export const Google = {};

// Google API credentials
Google.CLIENT_ID = '241231260660-ihaoo9oo9fpcs8mv0n6q8ajv4vuk0tc4.apps.googleusercontent.com';
Google.API_KEY = 'AIzaSyBX3BtMytvjmuRdusFhsrT6IepA9kGwuu0';
Google.spreadsheetId = '1rqhRW4010xlcKE4b9_IFxCCHt3mSBPbDYkF1BmaqBrs';
Google.DISCOVERY_DOCS = ['https://sheets.googleapis.com/$discovery/rest?version=v4'];
Google.SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

// Load GAPI function (Sheets API client)
export function loadGapi() {
    gapi.load('client', async () => {
        await gapi.client.init({
            apiKey: Google.API_KEY,
            discoveryDocs: Google.DISCOVERY_DOCS,
        });
        console.log("GAPI loaded");

    });
}

// Initialize GIS OAuth client function
export let tokenClient;
export function initGis() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: Google.CLIENT_ID,
        scope: Google.SCOPES,
        callback: (response) => {
            if (response.error) throw response;

            console.log("OAuth token received");
            $('.google-alert-success').show();
            $('.google-alert-fail').hide();
            gapi.client.setToken({ access_token: response.access_token });

            listData();
        },
    });
}

export function checkAuthentication() {
    if (!gapi.client.getToken()) {
        console.warn("Not signed in yet");
        alert("Nejdřív se prosím přihlašte.");
        return false;
    }
    return true;
}