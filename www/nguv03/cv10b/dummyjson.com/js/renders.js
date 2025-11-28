import { mainContainer, spinner } from './elements.js';
import { updateUser, deleteUser } from './network.js';

// content rendering
export const renderUsers = (usersResp) => {
    const userElements = [];
    usersResp.users.forEach((user) => {
        const { firstName, lastName, image, id, email } = user;
        const userElement = $(`
            <div class="user">
                <div class="user-name">${firstName} ${lastName}</div>
                <div class="user-image">
                    <img src="${image}" alt="image of user ${id}" height="100">
                </div>
                <div class="user-controls">
                    <button class="user-update">Update</button>
                    <button class="user-delete">Delete</button>
                </div>
            </div>
        `);
        const userUpdateButton = userElement.find('.user-update');
        userUpdateButton.on('click', () => {
            const form = renderUserForm({ firstName, lastName, email });
            form.on('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(form.get(0));
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                const email = formData.get('email');
                const data = { firstName, lastName, email, id };
                mainContainer.empty();
                mainContainer.append(spinner);
                try {
                    const resp = await updateUser(data);
                    if (resp.status !== 200) {
                        throw resp.statusText;
                    }
                    spinner.remove();
                    displaySuccess(`The user has been updated successfully, user ID ${id}`);
                } catch (err) {
                    console.log(err);
                    spinner.remove();
                    displayError(`There was a problem when updating user ID ${id}`);
                }
            });
        });
        const userDeleteButton = userElement.find('.user-delete');
        userDeleteButton.on('click', async () => {
            try {
                const resp = await deleteUser(id);
                if (resp.status !== 200) {
                    throw resp.statusText;
                }
                userElement.remove();
            } catch (err) {
                console.log(err);
                displayError(`There was a problem deleting user ID ${id}, ${err.message}`);
            }
        });
        userElements.push(userElement);
    });
    mainContainer.append(userElements);
};

export const renderUserForm = (data) => {
    const { firstName, lastName, email } = data;
    mainContainer.empty();
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
            <button>Submit</button>
        </for>
    `);
    mainContainer.append(form);
    return form;
};

export const displaySuccess = (text) => {
    mainContainer.empty();
    mainContainer.append(`
        <div class="success">${text}</div>
    `);
};

export const displayError = (text) => {
    mainContainer.empty();
    mainContainer.append(`
        <div class="error">${text}</div>
    `);
};