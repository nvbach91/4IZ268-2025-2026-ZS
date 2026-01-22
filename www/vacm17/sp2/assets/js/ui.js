import * as Data from "./data.js";
import * as Modal from "./modal.js";

export const elements = {
    $modal: $("#modal"),
    $modaContent: $("#modal-content"),
    $search: $("#search-input"),
    $pcWindow: $("#pc-container-window"),
    $compWindow: $("#comparator-container-window"),
    $pcControlsAdd: $("#pc-container-add-btn"),
    $compControlsClear: $("#comparator-clear-btn"),
    $compControlsReset: $("#comparator-reset-btn"),
    $compControlsCompare: $("#comparator-compare-btn"),
    $modalAction: $("#modal-action-btn"),
    $modalClose: $("#modal-close-btn"),
    $inputs: $("[data-item='input']"),
    $lists: $("[data-item='list']")
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
            <div class="item-body-row">${item.cpu.component}</div>
            <div class="item-body-row">${item.gpu.component}</div>
            <div class="item-body-row">${item.ram.component}</div>
            <div class="item-body-row">${item.ssd.component}</div>
        </div>
        <button data-action="compare" class="item-action-btn">Compare</button>
    `);

    elements.$pcWindow.prepend($div);
    console.log(`UI: renderPcItem: PC Item ${item.id} rendered.`)
}

export function renderComparatorItem(item) {
    if ($(`comp-${item.id}`).length > 0) return;

    const $div = $("<div>", {
        id: `comp-${item.id}`,
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
    `);

    elements.$compWindow.prepend($div);
    console.log(`UI: renderComparatorItem: Comparator Item ${item.id} rendered.`)
    updateBanners();
}

export function displayScores(id, score) {
    const $item = $(`#comp-${id}`);

    if ($item) {
        $item.find("[data-item='score']").text(score);
    }
}

// --- OTHER ---

// Main search function
export function search(event) {
    const input = $(event.target).val().toLowerCase().trim();
    console.log("UI: search:", input);

    const $items = elements.$pcWindow.find("[data-item='item']");

    if (!input) {
        $items.removeClass("hide");
        updateBanners();
        return;
    }

    $items.each(function () {
        const $item = $(this);
        const name = $item.find("[data-item='item-name']").text().toLowerCase();

        const matches = name.includes(input);

        $item.toggleClass("hide", !matches);
    });
    updateBanners();
}

export function showPopup(text, color) {
    const $popUp = $("#pop-up");
    $("#pop-up-text").text(text);
    $("#pop-up-box").css("background", color);

    $popUp.addClass("active");
    console.log("UI: showPopup: Pop-up window shown")
    setTimeout(() => $popUp.removeClass("active"), 2000);
}

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
    $items.each(function() {
        if (!$(this).hasClass("hide")) count++;
    });
    return count;
}

// --- WINDOW ITEMS ---

// Comparator Container
export function comparatorClick(event) {
    const $target = $(event.target);
    const $btn = $target.closest("[data-action]");
    if ($btn && $btn.data("action") === "remove") {
        $target.closest("[data-item='item']").remove();
        updateBanners();
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
        Data.removeLocalItem(id);
        $item.remove();
        updateBanners();
        showPopup("Item Removed", "red");
        return;
    }

    if (action === "compare") {
        const itemData = Data.getLocalItemById(id);
        renderComparatorItem(itemData);
    }
}

// --- COMPARATOR CONTROLS ---

// compare function
export function compareBtnClick() {
    const $compItems = elements.$compWindow.find("[data-item='item']");

    $compItems.each(function() {
        const id = $(this).data("originId");
        const data = Data.getLocalItemById(String(id));
        if(data) displayScores(id, data.score);
    });
    console.log("UI: compareBtnClick: Scores have been displayed.");
}

// clear function
export function clearBtnClick() {
    elements.$compWindow.empty();
    console.log("UI: clearBtnClick: Comparator has been cleared.");
    updateBanners();
}

// reset scores function
export function resetBtnClick() {
    elements.$compWindow.find("[data-item='score']").text("");
    console.log("UI: resetBtnClick: All scores reset.");
}

// --- THEME ---

const THEME = "theme";

export function setTheme() {
    const currentTheme = localStorage.getItem(THEME);
    const $body = $("body");
    const $button = $("#change-theme-btn");

    if (currentTheme === "white") {
        $body.addClass("dark");
        $button.text("☀︎")

        localStorage.setItem(THEME, "dark");
        console.log("THEME: setTheme: Theme changed to 'dark'");
    } else {
        $body.removeClass("dark");
        $button.text("⭒.☾˚⭒")

        localStorage.setItem(THEME, "white");
        console.log("THEME: setTheme: Theme changed to 'white'");
    }
}