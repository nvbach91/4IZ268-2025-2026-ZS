import { mainContainer } from './elements.js';
// content rendering
export const renderUsers = (usersResp) => {
    const userElements = [];
    usersResp.users.forEach((user) => {
        const { firstName, lastName, image, id } = user;
        const userElement = $(`
            <div class="user">
                <div class="user-name">${firstName} ${lastName}</div>
                <div class="user-image">
                    <img src="${image}" alt="image of user ${id}" height="100">
                </div>
            </div>
        `);
        userElements.push(userElement);
    });
    mainContainer.append(userElements);
};

export const renderUserForm = () => {
    mainContainer.empty();
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
            <button>Submit</button>
        </for>
    `);
    form.on('submit', (e) => {
        e.preventDefault();
        // read form data
        // send to API using http POST method to create new user
    });
    mainContainer.append(form);
};