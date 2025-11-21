import { fetchAndRenderUsers, searchAndRenderUsers, renderAddUser } from './renders.js';
import { mainContainer, listUsersButton, addUserButton, searchUsersInput } from './elements.js';

listUsersButton.on('click', () => {
    fetchAndRenderUsers();
});

addUserButton.on('click', () => {
    renderAddUser();
});

let debounceTimeout;
searchUsersInput.on('input', () => {
    clearTimeout(debounceTimeout);
    const searchValue = searchUsersInput.val();
    if (!searchValue) {
        return mainContainer.empty();
    }
    debounceTimeout = setTimeout(() => {
        searchAndRenderUsers(searchValue);
    }, 500);
});
