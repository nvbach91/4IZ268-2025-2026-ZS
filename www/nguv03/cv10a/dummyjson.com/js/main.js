import { addUserButton, listUsersButton, mainContainer, spinner } from './elements.js';
import { fetchUsers } from './network.js';
import { renderUsers } from './renders.js';

// events binding
listUsersButton.on('click', async () => {
    mainContainer.empty();
    mainContainer.append(spinner);
    const usersResp = await fetchUsers();
    // spinner.detach();
    renderUsers(usersResp);
});

addUserButton.on('click', () => {
    const form = $(`
        <form>
            <div>
                <label>First name</label>
                <input name="firstName">
            </div>
            <div>
                <label>Last name</label>
                <input name="lastName">
            </div>
            <div>
                <label>Email</label>
                <input name="email">
            </div>
            <div>
                <button>Submit</button>
            </div>
        </form>
    `);
    form.on('submit', async () => {
        // read form data
        // send to server
    });
    mainContainer.empty();
    mainContainer.append(form);
});