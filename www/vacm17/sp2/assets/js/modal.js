import * as Data from "./data.js";
import * as UI from "./ui.js";

// --- MODAL ITEM RENDERING ---

export function createItem() {
    const inputs = {
        cpu: $("#input-processor").val().trim(),
        gpu: $("#input-graphics-card").val().trim(),
        ram: $("#input-ram").val().trim(),
        ssd: $("#input-drive").val().trim()
    };
    const name = $("#input-name").val().trim();

    if (name.length > 20) {
        UI.showPopup("Name is too long (max 20 chars)", "red");
        return;
    }

    if (Object.values(inputs).some(val => val.trim() === "") || name.trim() === "") {
        UI.showPopup("Please fill all fields", "red");
        return;
    }

    const newItem = Data.createDataObject(name, inputs);

    if (!newItem) {
        UI.showPopup("Invalid Component names. Please use autocomplete.", "red");
        return;
    }

    Data.addLocalItem(newItem);
    UI.renderPcItem(newItem);
    UI.updateBanners();
    toggleModal(false);
    UI.showPopup(`Computer ${name} created!`, "green");
}

export function toggleModal(show) {
    const $modal = UI.elements.$modal;

    if (show) {
        $modal.addClass("active");
    } else {
        $modal.removeClass("active");
    }
}

// --- LIST OPERATIONS ---

export async function displayList(event) {
    const $wrapper = $(event.target).closest("[data-item='wrapper']");
    const category = $wrapper.data("table");
    const $list = $wrapper.find("ul");
    const $input = $wrapper.find("[data-item='input']");

    const value = $input.val().toLowerCase();

    if (value.length < 1) {
        $list.removeClass("active");
        return;
    }

    const data = Data.getComponentList(category);
    const matches = data.filter(name => name.toLowerCase().includes(value));

    $list.empty();

    if (matches.length > 0) {
        $list.addClass("active");

        const listItems = matches.slice(0, 5).map((match) => {
            const $li = $("<li>")
                .attr("data-item", "list-item")
                .text(match);

            $li.on("click", () => {
                $input.val(match);
                $list.removeClass("active");
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
        console.log(`BACKEND: checkInputValidity(): Input ${inputVal} is valid.`);
    } else {
        $indicator.html("✖");
        console.warn(`BACKEND: checkInputValidity(): Input ${inputVal} is invalid.`);
    }
}

export function closeList() {
    const $lists = UI.elements.$modal.find("[data-item='list'].active");

    if ($lists.length === 0) return;

    $lists.removeClass("active");
    console.log(`BACKEND: closeAutoCompleteList: ${$lists.length} lists removed.`);
}

export function disableModal(errorMessage,error) {
    console.error(`DATA: disableModal: ${errorMessage}`, error);
    UI.showPopup("Failed to load application data.", "red");
    UI.elements.$modaContent.html(`<div>Initialization failed. Data did not load.</div>`);
}