import { listUsersButton, mainContainer, addUserButton, spinner } from './elements.js';
import { fetchUsers, addUser } from './network.js';
import { renderUsers, renderUserForm, displayError, displaySuccess } from './renders.js';

// event listeners
listUsersButton.on('click', async () => {
    mainContainer.empty();
    mainContainer.append(spinner);
    const usersResp = await fetchUsers();
    spinner.remove();
    renderUsers(usersResp);
});

addUserButton.on('click', () => {
    const form = renderUserForm({});
    form.on('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form.get(0));
        const firstName = formData.get('firstName');
        const lastName = formData.get('lastName');
        const email = formData.get('email');
        const data = { firstName, lastName, email };
        mainContainer.empty();
        mainContainer.append(spinner);
        try {
            const resp = await addUser(data);
            if (resp.status !== 201) {
                throw resp.statusText;
            }
            spinner.remove();
            displaySuccess(`The user has been added successfully with ID ${resp.data.id}`);
        } catch (err) {
            spinner.remove();
            displayError(`There was a problem when creating a new user ${err.message}`);
        }
    });
});

/*
C - POST ======= DONE
R - GET ======== DONE
U - PUT/PATCH == DONE
D - DELETE ===== DONE
*/