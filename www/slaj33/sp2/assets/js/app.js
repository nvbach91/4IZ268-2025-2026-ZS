import { redirectToSpotify, getToken } from "./auth.js";
import { getUserData, searchData, getDetails, getTrackDetails, getAudioFeatures } from "./api.js";
import { showSearchResults, showSaved, renderDetails, renderTrackDetail } from "./ui.js";

// UI elementy
const loginButton = document.getElementById("login-button");
const logoutButton = document.getElementById("logout-button");
const loginView = document.getElementById("login-view");
const searchView = document.getElementById("search-view");
const searchButton = document.getElementById("search-button");
const searchInput = document.getElementById("search-input");
const dropdownMenu = document.getElementById("dropdown-menu");
const profile = document.getElementById("profile");
const profilePicture = document.getElementById("profile-picture")
const profileName = document.getElementById("profile-name");
const logoButton = document.getElementById("logo-button");
const savedView = document.getElementById("saved-view");
const resultContainer = document.getElementById("results-container");
const savedContainer = document.getElementById("saved-container");
const detailView = document.getElementById("detail-view");
const playlistContainer = document.getElementById("playlist-tracks-container");
const trackDetailView = document.getElementById("track-detail-view");
const loadingSpinner = document.getElementById("loading-spinner");


// Event Listeners
loginButton.addEventListener("click", () => {
    redirectToSpotify();
});

logoutButton.addEventListener("click", () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("code_verifier");
    showLogin();
});

logoButton.addEventListener("click", () => {
    window.location.href = "/~slaj33/sp2/";
});

profile.addEventListener("click", () => {
    searchView.classList.add("hidden");
    savedView.classList.remove("hidden");
    detailView.classList.add("hidden");
    trackDetailView.classList.add("hidden");
    showSaved();

});

//operace pri inicializaci stranky
window.addEventListener("load", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    toggleSpinner(true);
    try {
        if (code) {
            const token = await getToken(code);
            window.history.replaceState({}, document.title, "/~slaj33/sp2/");

            if (token) {
                showApp();

            } else {
                showLogin();
            }
        }

        else if (localStorage.getItem("access_token")) {
            showApp();
        }

        else {
            showLogin();
        }
    } catch (error) {
        console.error(error)
    } finally {
        toggleSpinner(false);
    }
});

// UI Funkce
function toggleSpinner(show) {
    if (show) {
        loadingSpinner.classList.remove("d-none");
    } else {
        loadingSpinner.classList.add("d-none");
    }
}

function showLogin() {
    loginView.classList.remove("hidden");
    searchView.classList.add("hidden");
    logoutButton.classList.add("hidden");
    profile.classList.add("hidden");
    savedView.classList.add("hidden");
    detailView.classList.add("hidden");
    trackDetailView.classList.add("hidden");
}

async function showApp() {
    loginView.classList.add("hidden");
    searchView.classList.remove("hidden");
    logoutButton.classList.remove("hidden");
    profile.classList.remove("hidden");
    savedView.classList.add("hidden");
    detailView.classList.add("hidden");
    trackDetailView.classList.add("hidden");

    const token = localStorage.getItem("access_token");
    console.log("Access token:", token);

    //funkce pro nacteni profilovky a jmena (data o uzivateli)
    let userData = null;
    if (token) {
        userData = await getUserData(token);
        console.log(userData);
    }

    if (userData) {
        if (userData.images && userData.images.length > 0) {
            profilePicture.src = userData.images[0].url;
        } else {
            profilePicture.src = "https://placehold.co/100x100?text=No+Img"
        }
        profileName.innerText = userData.display_name;
    }
}

//zobrazeni skladby
async function showTrackDetail(item) {
    searchView.classList.add("hidden");
    savedView.classList.add("hidden");
    trackDetailView.classList.add("hidden");
    detailView.classList.add("hidden");

    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("Chybí token");
        return;
    }

    toggleSpinner(true);
    try {
        console.log("Načítám detail skladby...");

        const trackData = await getTrackDetails(token, item.id);
        //const audioFeatures = await getAudioFeatures(token, item.id);

        renderTrackDetail(trackData);
        trackDetailView.classList.remove("hidden");
    } catch (error) {
        console.error(error)
    } finally {
        toggleSpinner(false);
    }
}

//zobrazeni playlistu nebo alba
async function showDetail(item) {
    searchView.classList.add("hidden");
    savedView.classList.add("hidden");
    detailView.classList.add("hidden");


    const token = localStorage.getItem("access_token");

    if (!token) {
        console.error("chybi token");
        return;
    }

    const id = item.id;
    const type = item.type;

    toggleSpinner(true);
    try {
        console.log("hledani releasu");
        const result = await getDetails(token, id, type);
        console.log(result);

        //dani skladeb do mapy a odstraneni null
        if (result.tracks && result.tracks.items) {
            currentDetailTracks = result.tracks.items.map(item => {
                return item.track ? item.track : item;
            });
            currentDetailTracks = currentDetailTracks.filter(t => t !== null);

            renderDetails(result);
            detailView.classList.remove("hidden");
        }
    } catch (error) {
        console.error(error)
    } finally {
        toggleSpinner(false);
    }
}


//vyhledavani a zobrazeni vysledku
let currentSearchResults = [];
let currentDetailTracks = [];

searchButton.addEventListener("click", async () => {
    const query = searchInput.value;
    const type = dropdownMenu.value;
    const token = localStorage.getItem("access_token");

    if (!query) {
        alert("Prázdná hodnota");
        return;
    }
    if (!token) {
        console.error("Chybí token");
        return
    }

    toggleSpinner(true);
    try {
        console.log("Odesílám dotaz na Spotify...");
        const result = await searchData(token, query, type);
        console.log("Přišla tato data:", result);

        const dataKey = type + "s";
        if (result[dataKey]) {
            currentSearchResults = result[dataKey].items;
        }
        showSearchResults(result, type);
        console.log(currentSearchResults);
    } catch (error) {
        console.error(error)
    } finally {
        toggleSpinner(false);
    }
});


resultContainer.addEventListener("click", (event) => {
    handleItemAction(event);
});

savedContainer.addEventListener("click", (event) => {
    handleItemAction(event);
});

playlistContainer.addEventListener("click", (event) => {
    handleItemAction(event);
});


//talcitka po zobrazeni vysledku (ulozit, zobrazit detail, kopirovat)
function handleItemAction(event) {
    const target = event.target.closest("button");

    if (!target) return;

    if (target.dataset.action === "copy") {
        const id = target.dataset.id;
        copyToClipboard(id);
    }

    if (target.dataset.action === "detail") {
        const id = target.dataset.id;

        let item = currentSearchResults.find(i => i.id === id);

        if (!item) {
            item = currentDetailTracks.find(i => i.id === id);
        }

        if (!item) {
            let saved = JSON.parse(localStorage.getItem("saved_items"));
            item = saved.find(i => i.id === id);
        }
        if (item) {
            if (item.type === "album" || item.type === "playlist") {
                showDetail(item);
            }
            if (item.type === "track") {
                showTrackDetail(item);
            }
        }
    }

    if (target.dataset.action === "save") {
        const id = target.dataset.id;
        saveItemToLocalStorage(id);
    }

    if (target.dataset.action === "remove") {
        const id = target.dataset.id;
        removeFromLocalStorage(id, target);
    }
}


//ulozeni do stranky saved a pameti
function saveItemToLocalStorage(id) {
    let itemToSave = currentSearchResults.find(item => item.id === id);

    if (!itemToSave) {
        itemToSave = currentDetailTracks.find(item => item.id === id);
    }

    if (!itemToSave) {
        console.error("Polozka neni v pameti");
        return;
    }

    let savedItems = JSON.parse(localStorage.getItem("saved_items")) || [];
    const exists = savedItems.some(item => item.id === id);

    if (exists) {
        console.log("Tato polozka je jiz ulozena");
        return;
    }
    savedItems.push(itemToSave);
    localStorage.setItem("saved_items", JSON.stringify(savedItems));
    console.log(savedItems);
}


//odstraneni ze stranky saved a pameti
function removeFromLocalStorage(id, buttonElement) {
    let savedItems = JSON.parse(localStorage.getItem("saved_items")) || [];
    const exists = savedItems.some(item => item.id === id);

    if (!exists) {
        console.warn("Polozka neexistuje");
        return;
    }

    const newItems = savedItems.filter(item => item.id !== id);
    localStorage.setItem("saved_items", JSON.stringify(newItems));

    if (buttonElement) {
        const cardToRemove = buttonElement.closest(".result-card");
        if (cardToRemove) {
            cardToRemove.remove();
        }
    }

    if (newItems.length === 0) {
        showSaved;
    }
}

function copyToClipboard(id) {
    let item = currentSearchResults.find(i => i.id === id);

    if (!item) {
        item = currentDetailTracks.find(i => i.id === id);
    }

    if (!item) {
        let saved = JSON.parse(localStorage.getItem("saved_items")) || [];
        item = saved.find(i => i.id === id);
    }

    if (!item) {
        console.error("polozka neni v pametu");
        return;
    }

    const isrc = item.external_ids?.isrc;

    if (isrc) {
        navigator.clipboard.writeText(isrc)
            .then(() => alert(`Zkopírováno: ${isrc}`))
            .catch(err => console.error("Chyba pri kopirovani: ", err));
    } else {
        console.warn("polozka nema isrc");
    }
}