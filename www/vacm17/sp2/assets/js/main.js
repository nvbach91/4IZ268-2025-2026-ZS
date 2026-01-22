import * as Data from "./data.js";
import * as UI from "./ui.js";
import * as Modal from "./modal.js";

// --- INITIALIZATION ---
async function initialize() {
    const $loading = $("#loading");

    // Pre-load database
    $loading.removeClass("hidden");
    const data = await Data.fetchData();
    $loading.addClass("hidden");
    console.log("MAIN: initialize: Data fetched:", data);

    // Load items from localStorage
    const items = Data.getLocalStorage();
    items.forEach(item => UI.renderPcItem(item));

    UI.updateBanners();
}

initialize()
    .then(() => {
        console.log("MAIN: Application fully initialized.");
    })
    .catch((error) => {
        console.error("MAIN: Critical error during initialization:", error);
        UI.showPopup("Failed to load application data.", "red");
});

window.addEventListener("load", () => {
    document.body.classList.remove('preload');
});

// ----- EVENT LISTENERS -----

// --- Search ---
$("#search-input").on("input", (e) => {
    UI.search(e);
});

// --- WINDOW CONTAINERS ---

// Comparator
$("#comparator-container-window").on("click", (e) => {
    UI.comparatorClick(e);
});

// Items
$("#pc-container-window").on("click", (e) => {
    UI.itemClick(e);
});

// --- WINDOW CONTROLS ---

// Score calculation
$("#comparator-compare-btn").on("click", UI.compareBtnClick);
$("#comparator-clear-btn").on("click", UI.clearBtnClick);
$("#comparator-reset-btn").on("click", UI.resetBtnClick);

// --- MODAL ---

$("#pc-container-add-btn").on("click", () => Modal.toggleModal(true));
$("#modal-close-btn").on("click", () => Modal.toggleModal(false));
$("#modal-action-btn").on("click", Modal.createItem);

UI.elements.$inputs.on("input", async (e) => {
    await Modal.displayList(e);
});

UI.elements.$inputs.on("keydown", (e) => {
    Modal.keyAutoCompleteInput(e);
});

UI.elements.$inputs.on("change", async (e) => {
    await Modal.checkInputValidity(e);
});

// --- THEME ---

$("#change-theme-btn").on("click", UI.setTheme);