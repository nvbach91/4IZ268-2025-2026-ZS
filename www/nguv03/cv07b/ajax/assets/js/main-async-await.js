const fetchUsers = async () => {
    resultsElement.innerHTML = '';
    resultsElement.append(spinner);
    try {
        const resp = await fetch('https://jsonplaceholder.typicode.com/users')
        const users = await resp.json();
        spinner.remove();
        const userElements = [];
        for (const user of users) {
            const userElement = createUserElement(user);
            userElements.push(userElement);
        }
        resultsElement.append(...userElements);
    } catch (error) {
        console.error(error);
    }
};
const createUserElement = (user) => {
    const userElement = document.createElement('div');
    const userNameElement = document.createElement('div');
    userNameElement.textContent = `Name: ${user.name}`;
    userElement.append(userNameElement);
    const userEmailElement = document.createElement('div');
    userEmailElement.textContent = `Email: ${user.email}`;
    userElement.append(userEmailElement);
    return userElement;
};
const resultsElement = document.querySelector('#results');
const fetchUsersButton = document.querySelector('#fetch-users');
fetchUsersButton.addEventListener('click', () => {
    fetchUsers();
});
const spinner = document.createElement('div');
spinner.classList.add('spinner');
