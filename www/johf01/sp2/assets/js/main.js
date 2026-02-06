import { loadGapi, initGis } from "./google.js"
import { taskEditFormSubmitClick } from "./sheetFunctions.js"
import { authBtnClick, signoutBtnClick, refreshBtnClick, showFormBtnClick, hideFormBtnClick, $form } from "./DOMedits.js"

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
    App.authorizeButton = $('#authorize_button');
    App.signoutButton = $('#signout_button');
    App.refreshButton = $('#refresh-button');
    App.showFormButtonTop = $('#show-form-button-top');
    App.showFormButtonBottom = $('#show-form-button-bottom');
    App.hideFormButton = $('#hide-form-button');

    // Attach handlers immediately
    App.authorizeButton.on('click', () => { authBtnClick(); });
    App.signoutButton.on('click', () => { signoutBtnClick(); });
    App.refreshButton.on('click', () => { refreshBtnClick(); });

    App.showFormButtonTop.on('click', () => { showFormBtnClick(); });
    App.showFormButtonBottom.on('click', () => { showFormBtnClick(); });

    App.hideFormButton.on('click', () => { hideFormBtnClick(); });

    // Form submit handler and write data to sheet
    App.taskEditForm = $form.submit( (e) => {
        e.preventDefault();
        taskEditFormSubmitClick();
    });
});



