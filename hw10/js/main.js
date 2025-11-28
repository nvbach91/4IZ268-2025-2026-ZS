const CLIENT_ID = 'TVUJ_CLIENT_ID';
const CLIENT_SECRET = 'TVUJ_CLIENT_SECRET';
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const repositoriesContainer = $('#repositories');

const fetchUser = (username) => {
    const url = `${BASE_API_URL}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    return $.ajax({ url, method: 'GET' });
};

const fetchRepositories = (userLogin) => {
    const url = `${BASE_API_URL}/users/${userLogin}/repos?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    return $.ajax({ url, method: 'GET' });
};

const displayUser = (user) => {
    const html = `
        <h2>${user.login}</h2>
        <img class="avatar" src="${user.avatar_url}" alt="Avatar">
        <p>Followers: ${user.followers} | Following: ${user.following}</p>
        <p>Public Repos: ${user.public_repos}</p>
        <p><a href="${user.html_url}" target="_blank">GitHub Profile</a></p>
    `;
    userProfileContainer.html(html);
};

const displayRepositories = (repositories) => {
    if(repositories.length === 0){
        repositoriesContainer.html('<p>Uzivatel nema zadne repozitare</p>');
        return;
    }
    const html = '<h3>Repositories</h3><ul>' + 
        repositories.map(repo => `<li><a href="${repo.html_url}" target="_blank">${repo.name}</a></li>`).join('') +
        '</ul>';
    repositoriesContainer.html(html);
};

$('#user-form').on('submit', async (e) => {
    e.preventDefault();
    const username = $('#username').val().trim();
    userProfileContainer.html('<p>Načítám...</p>');
    repositoriesContainer.empty();
    try {
        const userResp = await fetchUser(username);
        displayUser(userResp);
        const reposResp = await fetchRepositories(userResp.login);
        displayRepositories(reposResp);
    } catch (err) {
        userProfileContainer.html('<p>Uzivatel nenalezen</p>');
        repositoriesContainer.empty();
    }
});
