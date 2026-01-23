import * as Data from "./data.js";
import * as UI from "./ui.js";

// --- MODAL ITEM RENDERING ---

export function createItem() {
    const inputs = {
        cpu: UI.elements.$inputProcessor.val().trim(),
        gpu: UI.elements.$inputGraphics.val().trim(),
        ram: UI.elements.$inputRam.val().trim(),
        ssd: UI.elements.$inputDrive.val().trim()
    };
    const name = UI.elements.$inputName.val().trim();
    
    const isEditPc = UI.elements.$modal.data("pcEditId") ?? null;
    // const isEditComp = UI.elements.$modal.data("compEditId") ?? null;

    if (name.length > 20) {
        UI.showPopup("Name is too long (max 20 chars)", "red");
        return;
    }

    if (Object.values(inputs).some(val => val === "") || name === "") {
        UI.showPopup("Please fill all fields", "red");
        return;
    }

    let item;

    if (isEditPc) {
        item = Data.createDataObject(name, inputs, isEditPc);
    }
    else {
        item = Data.createDataObject(name, inputs);
    }

    if (!item) {
        UI.showPopup("Invalid Component names. Please use autocomplete.", "red");
        return;
    }

    // Toggling between modes
    if (isEditPc) {
        if (Data.existsLocalItemById(Data.changeCompID(item.id), Data.COMP_STORAGE_KEY)) {
            const oldCompItem = Data.getLocalItemById(Data.changeCompID(item.id), Data.COMP_STORAGE_KEY);
            console.log("MODAL: Comp Item detected.")
            Data.removeLocalItem(oldCompItem.id, Data.COMP_STORAGE_KEY);
            UI.removeItem(oldCompItem,"$compWindow");

            const newCompItem = Data.createDataObject(name, inputs, oldCompItem.id)

            Data.addLocalItem(newCompItem, Data.COMP_STORAGE_KEY);
            UI.renderComparatorItem(newCompItem);

            UI.compareBtnClick()
        }
        
        Data.removeLocalItem(item.id, Data.PC_STORAGE_KEY);
        UI.removeItem(item, "$pcWindow");
        
        Data.addLocalItem(item, Data.PC_STORAGE_KEY);
        UI.renderPcItem(item);
        
        UI.showPopup("Computer updated", "green");
        UI.elements.$modal.removeData("pcEditId");
        console.log("MODAL: Action 'isEditPc' commited.")
    }
    else {
        Data.addLocalItem(item, Data.PC_STORAGE_KEY);
        UI.renderPcItem(item);
        UI.showPopup(`Computer ${name} created`, "green");
        console.log("MODAL: New pc created. No action commited.")
    }

    UI.updateBanners();
    toggleModal(false);
}

// Toggles modal
export function toggleModal(show) {
    const $modal = UI.elements.$modal;

    if (show) {
        $modal.addClass("active");
    } else {
        $modal.removeClass("active");
    }
}

export function disableModal(errorMessage, error) {
    const $modalActinBtn = UI.elements.$modalAction;

    console.error(`MODAL: disableModal: ${errorMessage}`, error);
    UI.showPopup(`${errorMessage}`, "red");
    UI.elements.$modalContent.html(`<div class="modal-error">Initialization failed. Data did not load.</div>`);
    $modalActinBtn
        .prop("disabled", true)
        .addClass("disabled");
}

// Sends data to modal window for editing
export function sendDataToModal(id, storage) {
    const item = Data.getLocalItemById(id, storage);

    if (!item) {
        return;
    }

    UI.elements.$inputName.val(item.name);
    UI.elements.$inputProcessor.val(item.cpu.component);
    UI.elements.$inputGraphics.val(item.gpu.component);
    UI.elements.$inputRam.val(item.ram.component);
    UI.elements.$inputDrive.val(item.ssd.component);

    UI.elements.$modal.data("pcEditId", id);

    console.log(`MODAL: Items sent to modal with id=${id}`);
}

// --- LIST OPERATIONS ---

export async function displayList(event) {
    const $wrapper = $(event.target).closest("[data-item='wrapper']");
    const category = $wrapper.data("table");
    const $list = $wrapper.find("ul");
    const $input = $wrapper.find("[data-item='input']");

    const value = $input.val().toLowerCase().trim(); // UPDATE: Added trim() to user input

    if (value.length < 1) {
        $list.removeClass("active");
        return;
    }

    const data = Data.getComponentList(category);
    const matches = data.filter(name => name.toLowerCase().includes(value));

    $list.empty();

    if (matches.length > 0) {
        $list.addClass("active");

        // UPDATE: Number of fetched element increased to 20.
        const listItems = matches.slice(0, 20).map((match) => {
            const $li = $("<li>")
                .attr("data-item", "list-item")
                .text(match);

            $li.on("click", (e) => {
                $input.val(match);
                $list.removeClass("active");
                checkInputValidity(e);
            });

            return $li;
        });

        $list.append(listItems);

    } else {
        $list.removeClass("active");
    }
}

export  function keyAutoCompleteInput(event) {
    const $wrapper = $(event.target).closest("[data-item='wrapper']");
    const $item = $wrapper.find("[data-item='list-item']").first(); // Get first match
    const $input = $wrapper.find("[data-item='input']");

    if ($item.length === 0) return;

    if (event.key === "Tab" || event.key === "Enter") {
        $input.val($item.text());
        closeList();
        console.log("BACKEND: tabAutoCompleteInput: AutoCompleteList removed.");
    }
}

export async function checkInputValidity(event) {
    const $wrapper = $(event.target).closest("[data-item='wrapper']");
    const $indicator = $wrapper.parent().find("[data-item='indicator']");
    const inputVal = $wrapper.find("[data-item='input']").val().trim();
    const category = $wrapper.data("table");

    const list = await Data.getComponentList(category);

    if (list.includes(inputVal)) {
        $indicator.html("✔");
        console.log(`MODAL: checkInputValidity(): Input ${inputVal} is valid.`);
    } else {
        $indicator.html("✖");
        console.warn(`MODAL: checkInputValidity(): Input ${inputVal} is invalid.`);
    }
}

export function closeList() {
    const $lists = UI.elements.$modal.find("[data-item='list'].active");

    if ($lists.length === 0) return;

    $lists.removeClass("active");
    console.log(`MODAL: closeAutoCompleteList: ${$lists.length} lists removed.`);
}

// --- CONFIRM MODAL ---

// Toggles confirmModal
export function toggleConfirmModal(message, onConfirm) {
    const $modal = UI.elements.$confirmModal;
    const $text = UI.elements.$confirmText;

    $text.text(message);
    $modal.addClass("active");

    // one() = one time listener
    UI.elements.$confirmActionYes.one("click", () => {
        $modal.removeClass("active");
        onConfirm();
    });

    UI.elements.$confirmActionNo.one("click", () => {
        $modal.removeClass("active");
    });
}