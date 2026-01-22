import * as Data from "./data.js";
import * as UI from "./ui.js";
import * as Modal from "./modal.js";

// --- INITIALIZATION ---
async function initialize() {
    const $loading = $("#loading");

    // Pre-load database
    $loading.removeClass("hidden");

    const data = await Data.fetchData();

    try {

    } catch (error) {

        return;
    }

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
    });

window.addEventListener("load", () => {
    document.body.classList.remove('preload');
});

// ----- EVENT LISTENERS -----

// --- Search ---
UI.elements.$search.on("input", (e) => {
    UI.search(e);
});

// --- WINDOW CONTAINERS ---

// Comparator
UI.elements.$compWindow.on("click", (e) => {
    UI.comparatorClick(e);
});

// Items
UI.elements.$pcWindow.on("click", (e) => {
    UI.itemClick(e);
});

// --- WINDOW CONTROLS ---

// Score calculation
UI.elements.$compControlsCompare.on("click", UI.compareBtnClick);
UI.elements.$compControlsClear.on("click", UI.clearBtnClick);
UI.elements.$compControlsReset.on("click", UI.resetBtnClick);

// --- MODAL ---

UI.elements.$pcControlsAdd.on("click", () => Modal.toggleModal(true));
UI.elements.$modalClose.on("click", () => Modal.toggleModal(false));
UI.elements.$modalAction.on("click", Modal.createItem);

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