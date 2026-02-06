import { loadGapi, initGis } from "./google.js"
import { taskEditFormSubmitClick, googleCategories, loadCategoriesFromSheet } from "./sheetFunctions.js"
import { populateCategories, authBtnClick, signoutBtnClick, refreshBtnClick, showFormBtnClick, 
    hideFormBtnClick, $form, loadJustFromLocalStorage } from "./DOMedits.js"

// zobrazit localstorage rovnou/////
// ukladat isostorage do google sheetu---------
// update zamirit jen na tu jednu editovanou bunku//////////////
// schovat tlacitka prihlasit odhlasit/////////////
// zobrazit form jako modalove okno nad tasky////////////
// delete zamerit taky, mozna smazat cely radek
// kategorie nemit v kodu, ale ve vlastnim sheetu, aby sly lehceji zmenit////////////
// seradit podle deadlinu, isoformatu

export const App = {};

// Edit mode state for form handler
App.editIndex = null; // null = adding, number = editing

// Load GAPI + GIS on window load
window.addEventListener("load", () => {
    loadGapi();
    initGis();
});


// DOM Ready: Attach button handlers
$(document).ready(() => {
    loadJustFromLocalStorage();
    
    App.authorizeButton = $('#authorize_button');
    App.signoutButton = $('#signout_button');
    App.refreshButton = $('#refresh-button');
    App.showFormButtonTop = $('#show-form-button-top');
    App.loadFromLocalStorage = $('#load-from-local-storage-btn');
    App.showFormButtonBottom = $('#show-form-button-bottom');
    App.hideFormButton = $('#hide-form-button');
    App.formheading = $('#form-heading');
    App.backdrop = $('#backdrop');

    // Attach handlers immediately
    App.authorizeButton.on('click', () => { authBtnClick(); });
    App.signoutButton.on('click', () => { signoutBtnClick(); });
    App.refreshButton.on('click', () => { refreshBtnClick(); });

    App.showFormButtonTop.on('click', () => { showFormBtnClick(); });
    App.loadFromLocalStorage.on('click', () => { loadJustFromLocalStorage(); });
    App.showFormButtonBottom.on('click', () => { showFormBtnClick(); });

    App.hideFormButton.on('click', () => { hideFormBtnClick(); });

    populateCategories(googleCategories);

    // Form submit handler and write data to sheet
    App.taskEditForm = $form.submit((e) => {
        e.preventDefault();
        taskEditFormSubmitClick();
    });
});



