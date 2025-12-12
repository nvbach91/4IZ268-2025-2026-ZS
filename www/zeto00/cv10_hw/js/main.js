const submitBtn = $('#submit-btn');
const mainContainer = $('#main');
const spinner = $('<div class="spinner"></div>');
const usernameInput = $('#username');

const CLIENT_ID = 'Ov23libcVAW1RxTqPMdw';
const CLIENT_SECRET = '5c195b2ea6fb3c5a0b33ab854fa9080e28096db4'
const BASE_API_URL = "https://api.github.com"

submitBtn.on('click', async (e) => {
    e.preventDefault();
    const username = usernameInput.val();
    console.log(username);
    mainContainer.empty();
    mainContainer.append(spinner);
    try {
        const usersData = await fetchUser(username);
        const reposData = await fetchRepositories(username);
        spinner.remove();
        displayUser(usersData, reposData);
    } catch (error) {
        spinner.remove();
        mainContainer.append($('<div class="error-message">User not found</div>'));
    }
});

const fetchUser = async (username) => {
    const url = `${BASE_API_URL}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const response = await axios.get(url);
    return response.data;
};

const fetchRepositories = async (username) => {
    const url = `${BASE_API_URL}/users/${username}/repos?per_page=1000&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const response = await axios.get(url);
    return response.data;
};

const displayUser = (user, repos) => {
    const reposList = repos.map(repo => `<li><a href="${repo.html_url}" target="_blank">${repo.name}</a></li>`).join('');
    const userElement = $(`
        <div class="user-card">
            <h2>${user.login}</h2>
            <img src="${user.avatar_url}" alt="${user.login}'s avatar" height="100"/>
            <p>Repos: ${user.public_repos}</p>
            <h3>Repositories:</h3>
            <ul>${reposList}</ul>
        </div>
    `);
    mainContainer.append(userElement);
};