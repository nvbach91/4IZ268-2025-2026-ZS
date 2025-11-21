import { USERS_FETCH_LIMIT } from './config.js';
import { mainContainer, spinner } from './elements.js';
import { axiosInstance, deleteUser, fetchUsers, searchUsers } from './network.js';
import { createUserForm, showLoading } from './utils.js';

export const renderUsers = (resp, isDisplayingPagination = true) => {
    mainContainer.empty();
    if (isDisplayingPagination) {
        const page = resp.skip / resp.limit + 1;
        const previousPageButton = $(`<button${page === 1 ? ' disabled' : ''}>Previous page</button>`);
        previousPageButton.on('click', () => {
            fetchAndRenderUsers(page - 1);
        });
        const nextPageButton = $(`<button${resp.total - page * USERS_FETCH_LIMIT < USERS_FETCH_LIMIT ? ' disabled' : ''}>Next page</button>`);
        nextPageButton.on('click', () => {
            fetchAndRenderUsers(page + 1);
        });
        mainContainer.append(previousPageButton, nextPageButton);
    }
    const usersContainer = $(`<div class="users"></div>`);
    resp.users.forEach((user) => {
        const { id, email, firstName, lastName, image } = user;
        const userElement = $(`
            <div class="user">
                <!--div class="user-email"><a href="mailto:${email}">${email}</a></div-->
                <div class="user-name">${firstName} ${lastName}</div>
                <div class="user-image">
                    <img height="100" src="${image}" alt="image of user ${id}">
                </div>
                <div class="user-controls">
                    <button class="user-update">Update user</button>
                    <button class="user-delete">Delete user</button>
                </div>
            </div>
        `);
        const updateButton = userElement.find('.user-update');
        updateButton.on('click', async () => {
            const form = createUserForm({ email, firstName, lastName }, async (formData) => {
                try {
                    showLoading();
                    const resp = await axiosInstance.put(`/users/${id}`, formData);
                    mainContainer.empty();
                    mainContainer.append(`
                        <div class="info">
                            User id ${resp.data.id}<br>
                            (firstName: <strong>${firstName}</strong>, lastName: <strong>${lastName}</strong>, email: <strong>${email}</strong>)<br>
                            was modified to<br>
                            (firstName: <strong>${resp.data.firstName}</strong>, lastName: <strong>${resp.data.lastName}</strong>, email: <strong>${resp.data.email}</strong>)
                        </div>
                    `);
                } catch (err) {
                    console.error(err);
                    if (err.message) {
                        mainContainer.append(`<div class="error">${err.message}</div>`);
                    }
                }
            });
            mainContainer.empty();
            mainContainer.append(form);
        });
        const deleteButton = userElement.find('.user-delete');
        deleteButton.on('click', async () => {
            try {
                deleteButton.empty();
                deleteButton.append(spinner);
                deleteButton.prop('disabled', true);
                await deleteUser(id);
                userElement.remove();
            } catch (err) {
                mainContainer.empty();
                if (err.response?.data?.message) {
                    mainContainer.append(`<div class="error">${err.response.data.message}</div>`);
                } else {
                    console.error(err);
                    mainContainer.append(`<div class="error">${err.message}</div>`);
                }
            }
        });
        usersContainer.append(userElement);
    });
    mainContainer.append(usersContainer);
};

export const fetchAndRenderUsers = async (page) => {
    showLoading();
    try {
        const usersResp = await fetchUsers(page);
        renderUsers(usersResp);
    } catch (err) {
        // something went wrong
        console.error(err);
        mainContainer.empty();
        if (err.message) {
            mainContainer.append(`<div class="error">${err.message}</div>`);
        }
    }
};

export const searchAndRenderUsers = async (searchValue) => {
    showLoading();
    try {
        const usersResp = await searchUsers(searchValue);
        renderUsers(usersResp, false);
    } catch (err) {
        // something went wrong
        console.error(err);
        mainContainer.empty();
        if (err.message) {
            mainContainer.append(`<div class="error">${err.message}</div>`);
        }
    }
};

export const renderAddUser = () => {
    mainContainer.empty();
    const form = createUserForm({ email: '', firstName: '', lastName: '' }, async (formData) => {
        try {
            showLoading();
            const resp = await axiosInstance.post('/users/add', formData);
            mainContainer.empty();
            mainContainer.append(`<div class="info">User id ${resp.data.id} (firstName: ${resp.data.firstName}, lastName: ${resp.data.lastName}, email: ${resp.data.email}) was created</div>`)
        } catch (err) {
            console.error(err);
            if (err.message) {
                mainContainer.append(`<div class="error">${err.message}</div>`);
            }
        }
    });
    mainContainer.append(form);
};