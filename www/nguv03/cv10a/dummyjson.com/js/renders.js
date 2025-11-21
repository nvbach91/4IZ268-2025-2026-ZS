import { mainContainer } from './elements.js';

// element rendering
export const renderUsers = (usersResp) => {
    const users = [];
    usersResp.users.forEach((user) => {
        const { firstName, lastName, image, id } = user;
        const userElement = $(`
            <div class="user">
                <div class="user-name">${firstName} ${lastName}</div>
                <div class="user-image">
                    <img src="${image}" alt="iamge of user ${id}" height="100">
                </div>
            </div>
        `);
        users.push(userElement);
    });
    mainContainer.empty();
    mainContainer.append(users);
};
// ....