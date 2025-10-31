const fetchUsersData = () => {
    // Promise // prislib
    fetch('https://jsonplaceholder.typicode.com/users').then((resp) => {
        return resp.json();
    }).then((data) => {
        const userElements = [];
        for (const user of data) {
            const userElement = createUserElement(user.name);
            userElements.push(userElement);
        }
        resultsContainer.innerHTML = '';
        resultsContainer.append(...userElements);
    });
};
const createUserElement = (name) => {
    const userElement = document.createElement('div');
    const userNameElement = document.createElement('div');
    userNameElement.textContent = name;
    userElement.append(userNameElement);
    return userElement;
};
const resultsContainer = document.querySelector('#results');
const fetchUsersButton = document.querySelector('#fetch-users');
fetchUsersButton.addEventListener('click', () => {
    fetchUsersData();
});
