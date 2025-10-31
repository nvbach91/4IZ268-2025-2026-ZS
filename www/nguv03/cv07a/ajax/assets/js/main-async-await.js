const fetchUsersData = async () => {
    resultsContainer.innerHTML = '';
    resultsContainer.append(spinner);
    const resp = await fetch('https://jsonplaceholder.typicode.com/users');
    const data = await resp.json();
    spinner.remove();
    const userElements = [];
    for (const user of data) {
        const userElement = createUserElement(user.name);
        userElements.push(userElement);
    }
    resultsContainer.append(...userElements);
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

const spinner = document.createElement('div');
spinner.classList.add('spinner');