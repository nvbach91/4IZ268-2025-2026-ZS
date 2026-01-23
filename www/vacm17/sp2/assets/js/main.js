import * as Data from "./data.js";
import * as UI from "./ui.js";
import * as Modal from "./modal.js";

//
// ---------------------------------------- INITIALIZATION -----------------------------------------
//

async function initialize() {
    const $loading = UI.elements.$loading;

    // Pre-load database
    $loading.removeClass("hidden");

    const data = await Data.fetchData();

    $loading.addClass("hidden");
    console.log("MAIN: initialize: Data fetched:", data);

    // Load items from localStorage
    const pcItems = Data.getLocalStorage(Data.PC_STORAGE_KEY);
    pcItems.forEach(item => UI.renderPcItem(item));

    const compItems = Data.getLocalStorage(Data.COMP_STORAGE_KEY);
    compItems.forEach(item => UI.renderComparatorItem(item));

    UI.updateBanners();
}

initialize()
    .then(() => {
        console.log("MAIN: Application fully initialized.");
    });

//
// ---------------------------------------- EVENT LISTENERS -----------------------------------------
//

// --- Preload ---
window.addEventListener("load", () => {
    document.body.classList.remove('preload');
});

// --- Search ---
// UPDATE: Debounced search
const debouncedSearch = UI.debounce(UI.search, 300)
UI.elements.$search.on("input", debouncedSearch);

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
UI.elements.$compControlsClear.on("click", () => {
    Modal.toggleConfirmModal("Remove all items from comparison window?", UI.clearBtnClick)
});
UI.elements.$compControlsReset.on("click", UI.resetBtnClick);

// --- MODAL ---

UI.elements.$pcControlsAdd.on("click", () => Modal.toggleModal(true));
UI.elements.$modalClose.on("click", () => Modal.toggleModal(false));
UI.elements.$modalAction.on("click", Modal.createItem);

const debouncedAutoComplete = UI.debounce(async (e) => {await Modal.displayList(e)}, 300);
UI.elements.$inputs.on("input", debouncedAutoComplete);

UI.elements.$inputs.on("keydown", (e) => {
    Modal.keyAutoCompleteInput(e);
});

UI.elements.$inputs.on("change", async (e) => {
    await Modal.checkInputValidity(e);
});

// --- THEME ---

UI.elements.$changeTheme.on("click", UI.setTheme);