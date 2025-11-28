import { mainContainer, spinner } from './elements.js';
import { deleteUser, updateUser } from './network.js';

// element rendering
export const renderUsers = (usersResp) => {
    const users = [];
    usersResp.users.forEach((user) => {
        const { firstName, lastName, image, id, email } = user;
        const userElement = $(`
            <div class="user">
                <div class="user-name">${firstName} ${lastName}</div>
                <div class="user-image">
                    <img src="${image}" alt="iamge of user ${id}" height="100">
                </div>
                <div class="user-controls">
                    <button class="user-update">Update user</button>
                    <button class="user-delete">Delete user</button>
                </div>
            </div>
        `);
        const userUpdateButton = userElement.find('.user-update');
        userUpdateButton.on('click', () => {
            const form = createUserForm({ firstName, lastName, email });
            form.on('submit', async () => {
                const formData = new FormData(form.get(0));
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                const email = formData.get('email');
                const data = { firstName, lastName, email, id };
                mainContainer.empty();
                mainContainer.append(spinner);
                try {
                    const resp = await updateUser(data);
                    spinner.remove();
                    if (resp.status !== 200) {
                        return displayError('User was not updated');
                    }
                    return displaySuccess(`User was updated with id ${resp.data.id}`);
                } catch (err) {
                    spinner.remove();
                    return displayError(`User was not updated: ${err.message}`);
                }
            });
            mainContainer.empty();
            mainContainer.append(form);
        });
        const userDeleteButton = userElement.find('.user-delete');
        userDeleteButton.on('click', async () => {
            // mainContainer.empty();
            // mainContainer.append(spinner);
            try {
                const resp = await deleteUser(id);
                // spinner.remove();
                if (resp.status !== 200) {
                    return displayError('User was not deleted');
                }
                return userElement.remove();
            } catch (err) {
                // spinner.remove();
                return displayError(`User was not deleted: ${err.message}`);
            }
        });
        users.push(userElement);
    });
    mainContainer.empty();
    mainContainer.append(users);
};

export const createUserForm = (data) => {
    const { firstName, lastName, email } = data;
    const form = $(`
        <form>
            <div>
                <label>First name</label>
                <input name="firstName" value="${firstName || ''}">
            </div>
            <div>
                <label>Last name</label>
                <input name="lastName" value="${lastName || ''}">
            </div>
            <div>
                <label>Email</label>
                <input name="email" value="${email || ''}">
            </div>
            <div>
                <button>Submit</button>
            </div>
        </form>
    `);
    return form;
};

// display error
export const displayError = (text) => {
    mainContainer.empty();
    mainContainer.append(`
        <div class="error">${text}</div>
    `);
};
// display success
export const displaySuccess = (text) => {
    mainContainer.empty();
    mainContainer.append(`
        <div class="success">${text}</div>
    `);
};