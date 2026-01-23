import * as Data from "./data.js";
import * as Modal from "./modal.js";

export const elements = {
    // modal
    $modal: $("#modal"),
    $modalContent: $("#modal-content"),
    $modalAction: $("#modal-action-btn"),
    $modalClose: $("#modal-close-btn"),
    // confirm modal
    $confirmModal: $("#confirm-modal"),
    $confirmText: $("#confirm-text"),
    $confirmActionYes: $("#modal-action-yes"),
    $confirmActionNo: $("#modal-action-no"),
    // pop-up
    $popUpModal: $("#pop-up"),
    $popUpText: $("#pop-up-text"),
    $popUpBox: $("#pop-up-box"),
    // inputs
    $inputName: $("#input-name"),
    $inputProcessor: $("#input-processor"),
    $inputGraphics: $("#input-graphics-card"),
    $inputRam: $("#input-ram"),
    $inputDrive: $("#input-drive"),
    $inputs: $("[data-item='input']"),
    // main containers
    $search: $("#search-input"),
    $pcWindow: $("#pc-container-window"),
    $compWindow: $("#comparator-container-window"),
    // controls
    $compControlsClear: $("#comparator-clear-btn"),
    $compControlsReset: $("#comparator-reset-btn"),
    $compControlsCompare: $("#comparator-compare-btn"),
    $pcControlsAdd: $("#pc-container-add-btn"),
    // others
    $lists: $("[data-item='list']"),
    $loading: $("#loading"),
    $changeTheme: $("#change-theme-btn")
};

// --- DOM GENERATION ---

export function renderPcItem(item) {
    const $div = $("<div>", {
        id: item.id,
        "data-item": "item",
        class: "pc-container-window-item"
    }).html(`
        <span data-action="remove" class="item-close-btn">✖</span>
        <div data-item="item-name" class="item-name">${item.name}</div>
        <div class="item-body">           
            <div class="item-body-row" data-item="item-data">${item.cpu.component}</div>
            <div class="item-body-row" data-item="item-data">${item.gpu.component}</div>
            <div class="item-body-row" data-item="item-data">${item.ram.component}</div>
            <div class="item-body-row" data-item="item-data">${item.ssd.component}</div>
        </div>
        <div class="item-controls">
            <button data-action="compare" class="item-compare-btn">Compare</button>
            <button data-action="edit" class="item-edit-btn">Edit</button>
        </div>    
    `);

    elements.$pcWindow.prepend($div);
    console.log(`UI: renderPcItem: PC Item ${item.id} rendered.`)
}

export function renderComparatorItem(item) {
    const $div = $("<div>", {
        id: item.id,
        "data-origin-id": item.id,
        "data-item": "item",
        class: "comparator-container-window-item"
    }).html(`
        <span data-action="remove" class="item-close-btn">✖</span>
        <div class="item-name">${item.name}</div>
        <div class="item-body">
            <div class="item-body-box">
                <div class="item-body-name">${item.cpu.component}</div>
                <div class="item-body-score">${item.cpu.score}</div>
            </div>
            <div class="item-body-box">
                <div class="item-body-name">${item.gpu.component}</div>
                <div class="item-body-score">${item.gpu.score}</div>
            </div>
            <div class="item-body-box">
                <div class="item-body-name">${item.ram.component}</div>
                <div class="item-body-score">${item.ram.score}</div>
            </div>
            <div class="item-body-box">
                <div class="item-body-name">${item.ssd.component}</div>
                <div class="item-body-score">${item.ssd.score}</div>
            </div> 
        </div>
        <div class="item-score-container">
            <div class="score-title">Score</div>
            <div data-item="score" class="score-box"></div>
        </div> 
        <button data-action="edit" class="compare-item-edit-btn">Edit</button>
    `);

    elements.$compWindow.prepend($div);
    console.log(`UI: renderComparatorItem: Comparator Item ${item.id} rendered.`)
    updateBanners();
}

// Removes an item from a certain element (finds it by id)
export function removeItem(item, elementKey) {
    const $element = elements[elementKey];
    

    if (!$element) {
        console.warn(`UI: removeItem: Element ${$element} not found.`);
        return;
    }
    console.log(`UI: removeItem: Element ${$element} found.`);

    const $item = $element.find(`#${item.id}`);

    if (!$item.length) {
        console.warn(`UI: removeItem: Item id=${item.id} not found.`);
        return;
    }

    $item.remove();
    console.warn(`UI: removeItem: Item id=${item.id} removed.`);
}

// Displays scores in score boxes
export function displayScores(id, score) {

}

// --- SEARCH ---

// Main search function
export function search(event) {
    const input = $(event.target).val().toLowerCase().trim();
    console.log("UI: search:", input);

    const $items = elements.$pcWindow.find("[data-item='item']");

    // Precaution
    if (!input) {
        $items.removeClass("hide");
        updateBanners();
        return;
    }

    $items.each(function () {
        const $item = $(this);
        const name = $item.find("[data-item='item-name']").text().toLowerCase();

        const isMatch = name.includes(input); // UPDATE: Changed name

        $item.toggleClass("hide", !isMatch);
    });
    updateBanners();
}

// --- POP-UP ---

export function showPopup(text, color) {
    const $popUp = elements.$popUpModal;
    elements.$popUpText.text(text);
    elements.$popUpBox.css("background", color);

    $popUp.addClass("active");
    console.log("UI: showPopup: Pop-up window shown")
    setTimeout(() => $popUp.removeClass("active"), 2000);
}

// --- BANNER ---

// Updating banners
export function updateBanners() {
    const $pcItems = elements.$pcWindow.find(`[data-item="item"]`);
    const $compItems = elements.$compWindow.find(`[data-item="item"]`);
    let $pcBanner = $("#pc-banner");
    let $compBanner = $("#comp-banner");

    if($pcBanner.length === 0) {
        $pcBanner = $("<div>", {id: "pc-banner"});
        elements.$pcWindow.append($pcBanner);
        console.log("UI: updateBanners: No pc banner found. Banner foundation created.")
    }

    if (countItems($pcItems) === 0) {
        $pcBanner
            .html(`
            <div class="no-items-banner-text">No items found</div>
            <button class="no-items-banner-action-btn" data-action="addModal">+</button>`)
            .attr("class", "no-items-banner");
        console.log("UI: updateBanners: No pc items found. Banner updated.")
    } else {
        $pcBanner
            .html(`
            <button class="items-banner-action-btn" data-action="addModal">+</button>`)
            .attr("class", "items-banner");
        console.log("UI: updateBanners: Pc items found. Banner updated.")
    }

    if($compBanner.length === 0) {
        $compBanner = $("<div>", {id: "comp-banner"});
        elements.$compWindow.append($compBanner);
        console.log("UI: updateBanners: No comp banner found. Banner foundation created.")
    }

    if (countItems($compItems) === 0) {
        $compBanner
            .html(`<div class="no-items-banner-text">No items found</div>`)
            .attr("class", "no-items-banner");
        console.log("UI: updateBanners: No comp items found. Banner updated.")
    } else {
        $compBanner
            .html(`<div></div>`)
            .attr("class", "items-banner");
        console.log("UI: updateBanners: Comp items found. Banner updated.")
    }
}

// Counts items within windows (even the hidden ones)
export function countItems($items) {
    let count = 0;

    // Searches for hidden elements - these should not count
    $items.each(function() {
        if (!$(this).hasClass("hide")) count++;
    });
    return count;
}

// --- WINDOW ITEMS ---

// Comparator Container
export function comparatorClick(event) {
    const $target = $(event.target);
    const $item = $target.closest("[data-item='item']")
    const id = $item.attr("id");

    const $btn = $target.closest("[data-action]");

    if ($btn && $btn.data("action") === "remove") {
        Modal.toggleConfirmModal("Would you like to remove this item?", () => {
            
            Data.removeLocalItem(id, Data.COMP_STORAGE_KEY);

            $item.remove();

            updateBanners();
        });
        return;
    }
    
    if ($btn && $btn.data("action") === "edit") {
        Modal.toggleModal(true)
        Modal.sendDataToModal(Data.changePcID(id), Data.PC_STORAGE_KEY);
    }
}

// Item Container
export function itemClick(event) {
    const $target = $(event.target);
    const $btn = $target.closest("[data-action]");

    if (!$btn.length) return;

    const action = $btn.data("action");
    console.log("UI: itemClick: Registered action:", action);

    if (action === "addModal") {
        Modal.toggleModal(true);
        return;
    }

    const $item = $target.closest("[data-item='item']");

    if (!$item.length) return;

    const id = $item.attr("id");

    if (action === "remove") {
        Modal.toggleConfirmModal("Would you like to remove this item?", () => {
            const item = Data.getLocalItemById(Data.changeCompID(id), Data.COMP_STORAGE_KEY)

            if (item) {
                console.log("UI: itemClick: Comparator item found.", item.id)
                removeItem(item, "$compWindow");
                Data.removeLocalItem(Data.changeCompID(id), Data.COMP_STORAGE_KEY);
            }

            Data.removeLocalItem(id, Data.PC_STORAGE_KEY);

            $item.remove();
            updateBanners();
            showPopup("Item Removed", "red");
        });
        return;
    }

    if (action === "compare") {
        const itemData = Data.getLocalItemById(id, Data.PC_STORAGE_KEY);
        itemData.id = `comp-${id}`;
        const exists = !!Data.getLocalItemById(itemData.id, Data.COMP_STORAGE_KEY);

        if (!exists) {
            renderComparatorItem(itemData);
            Data.addLocalItem(itemData, Data.COMP_STORAGE_KEY);
        } else {
            showPopup("This Item is already in comparison", "#af7632")
        }
        return;
    }

    if (action === "edit") {
        Modal.toggleModal(true);
        Modal.sendDataToModal(id, Data.PC_STORAGE_KEY);
    }
}

// --- COMPARATOR CONTROLS ---

// compare function
export function compareBtnClick() {
    const $compItems = elements.$compWindow.find("[data-item='item']");

    if (!$compItems) {
        showPopup("Comparison window is empty", "red");
        return;
    }

    let highestScore = 0;
    let winner;

    $compItems.each(function() {
        const id = $(this).attr("id");
        const $item = elements.$compWindow.find(`#${id}`).find("[data-item='score']");
        const data = Data.getLocalItemById(id, Data.COMP_STORAGE_KEY);
        console.log(data.score)
        
        if(data) {
            if($item.length) {
                $item.text(data.score);
            }
        }

        if(data.score >= highestScore) {
            highestScore = Number(data.score);
            winner = $item;
        }
    });

    winner.parent().css("background", "#5f9d4c")

    console.log("UI: compareBtnClick: Scores have been displayed.");
}

// clear function
export function clearBtnClick() {
    const $compItems = elements.$compWindow.find("[data-item='item']");

    if (!$compItems) {
        showPopup("Comparison window is empty", "red");
        return;
    }

    $compItems.each(function() {
        const id = $(this).attr("id");

        Data.removeLocalItem(id, Data.COMP_STORAGE_KEY);
    });
    elements.$compWindow.empty();

    console.log("UI: clearBtnClick: Comparator has been cleared.");
    updateBanners();
}

// reset scores function
export function resetBtnClick() {
    const $compItems = elements.$compWindow.find("[data-item='score']");

    if (!$compItems) {
        showPopup("Comparison window is empty", "red");
        return;
    }

    if ($compItems.text().length === 0) {
        showPopup("Scores were not calculated yet", "red");
        return;
    }
    
    $compItems.text("");
    $compItems.parent().css("background", "white");

    console.log("UI: resetBtnClick: All scores reset.");
}

// --- THEME ---

let theme = "light";

export function setTheme() {
    const $body = $("body");
    const $button = elements.$changeTheme;

    if (theme === "light") {
        $body.addClass("dark");
        $button.text("☀︎")

        theme = "dark"
        console.log("THEME: setTheme: Theme changed to 'dark'");
    } else {
        $body.removeClass("dark");
        $button.text("⭒.☾˚⭒")

        theme = "light"
        console.log("THEME: setTheme: Theme changed to 'light'");
    }
}

// --- DEBOUNCE ---

export function debounce(func, delay = 300){
    let timeout;

    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
            }, delay);
    };
}
