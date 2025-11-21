import { listUsersButton, mainContainer, addUserButton, spinner } from './elements.js';
import { fetchUsers } from './network.js';
import { renderUsers, renderUserForm } from './renders.js';

// event listeners
listUsersButton.on('click', async () => {
    mainContainer.empty();
    mainContainer.append(spinner);
    const usersResp = await fetchUsers();
    spinner.remove();
    renderUsers(usersResp);
});

addUserButton.on('click', () => {
    renderUserForm();
});