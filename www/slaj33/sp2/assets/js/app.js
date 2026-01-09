import { redirectToSpotify, getToken } from "./auth.js";
import { getUserData, searchData, getDetails, getTrackDetails } from "./api.js";
import { showSearchResults, showSaved, renderDetails, renderTrackDetail } from "./ui.js";
import {
    loginButton, logoutButton, loginView, searchView, searchInput, dropdownMenu, profile, profilePicture, profileName, logoButton, savedView, resultContainer,
    savedContainer, detailView, playlistContainer, trackDetailView, loadingSpinner, searchForm
} from "./const.js";



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
    //window.location.href = "/sp2/";
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
            //window.history.replaceState({}, document.title, "/sp2/");

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

searchForm.addEventListener("submit", async (e) => {
    e.preventDefault();
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
        saveItemToLocalStorage(id, target);
        return;
    }

if (target.dataset.action === "remove") {
        if (target.dataset.confirmState !== "true") {
            
            const originalText = target.innerText;
            target.innerText = "Opravdu odstranit?";
            target.dataset.confirmState = "true";
        
            setTimeout(() => {
                if (target && target.dataset.confirmState === "true") {
                    target.innerText = "Odstranit";
                    delete target.dataset.confirmState;
                }
            }, 3000);

            return;
        }

            
        const id = target.dataset.id;    
        
        delete target.dataset.confirmState;
        
        removeFromLocalStorage(id, target);
        return;
    }
}


function saveItemToLocalStorage(id, buttonElement) {
    let itemToSave = currentSearchResults.find(item => item.id === id) || 
                     currentDetailTracks.find(item => item.id === id);

    if (!itemToSave) {
        console.error("Položka nebyla nalezena.");
        return;
    }
    const storageKey = `saved_${itemToSave.type}s`;

    let saved = JSON.parse(localStorage.getItem(storageKey)) || [];
    
    if (!saved.some(i => i.id === id)) {
        saved.push(itemToSave);
        localStorage.setItem(storageKey, JSON.stringify(saved));
        console.log(`Uloženo do: ${storageKey}`);
    }

    if (buttonElement) {
        buttonElement.innerText = "Odstranit";
        buttonElement.classList.replace("btn-dark", "btn-danger");
        buttonElement.dataset.action = "remove";
    }
}



function removeFromLocalStorage(id, buttonElement) {
    const types = ["saved_tracks", "saved_albums", "saved_playlists", "saved_artists"];

    types.forEach(key => {
        const items = JSON.parse(localStorage.getItem(key)) || [];
        const newItems = items.filter(item => item.id !== id);
        
        if (items.length !== newItems.length) {
            localStorage.setItem(key, JSON.stringify(newItems));
            console.log(`Odstraněno z: ${key}`);
        }
    });

    if (buttonElement) {

        if (!document.getElementById("saved-view").classList.contains("hidden")) {
            buttonElement.closest(".result-card")?.remove();
            
            if (document.getElementById("saved-container").children.length === 0) {
            
                 import("./ui.js").then(module => module.showSaved()); 
            }
        } 
        
        else {
            buttonElement.innerText = "Uložit";
            buttonElement.classList.replace("btn-danger", "btn-dark");
            buttonElement.dataset.action = "save";
        }
    }
}


function showNotification(message) {
    const notification = document.getElementById("copy-notification");
    
    if (notification) {
        notification.innerText = message;
        notification.classList.remove("d-none");
        notification.classList.add("show");

        setTimeout(() => {
            notification.classList.add("d-none");
        }, 3000);
    } else {
        alert(message);
    }
}

function copyToClipboard(id) {
    let item = currentSearchResults.find(i => i.id === id);

    if (!item) {
        item = currentDetailTracks.find(i => i.id === id);
    }

    if (!item) {
        const types = ["saved_tracks", "saved_albums", "saved_playlists", "saved_artists"];
        for (const key of types) {
            const savedItems = JSON.parse(localStorage.getItem(key)) || [];
            item = savedItems.find(i => i.id === id);
            if (item) break;
        }
    }

    if (!item) {
        console.error("Položka nebyla nalezena v paměti.");
        return;
    }

    const isrc = item.external_ids?.isrc;

    if (isrc) {
        navigator.clipboard.writeText(isrc)
            .then(() => {
                showNotification(`ISRC zkopírováno: ${isrc}`);
            })
            .catch(err => console.error("Chyba při kopírování: ", err));
    } else {
        console.warn("Položka nemá ISRC.");
        showNotification("Tato položka nemá ISRC kód.");
    }
}