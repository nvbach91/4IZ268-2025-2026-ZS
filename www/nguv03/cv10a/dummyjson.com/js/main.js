import { addUserButton, listUsersButton, mainContainer, spinner } from './elements.js';
import { fetchUsers, addUser } from './network.js';
import { renderUsers, displayError, displaySuccess, createUserForm } from './renders.js';

// events binding
listUsersButton.on('click', async () => {
    mainContainer.empty();
    mainContainer.append(spinner);
    const usersResp = await fetchUsers();
    // spinner.detach();
    renderUsers(usersResp);
});

addUserButton.on('click', () => {
    const form = createUserForm({});
    form.on('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(form.get(0));
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const data = { firstName, lastName, email };
        mainContainer.empty();
        mainContainer.append(spinner);
        try {
            const resp = await addUser(data);
            spinner.remove();
            // console.log(resp);
            if (resp.status !== 201) {
                return displayError('User was not created');
            }
            return displaySuccess(`User was created with id ${resp.data.id}`);
        } catch (err) {
            spinner.remove();
            return displayError(`User was not created: ${err.message}`);
        }
    });
    mainContainer.empty();
    mainContainer.append(form);
});