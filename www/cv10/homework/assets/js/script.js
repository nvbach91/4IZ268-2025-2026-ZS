const CLIENT_ID = 'Ov23liuCKo8oJF36j6DN';
const CLIENT_SECRET = 'f61b4bb05ccddf12cda5fb5a0eab279724fe2560';

const BASE_API_URL = 'https://api.github.com';
const userProfileContainer = $('#user-profile');
const repositoriesListContainer = $('#repositories-list');
const repoUl = $('#repo-ul');
const form = $('#user-search-form');

const buildUrl = (path) => {
    return `${BASE_API_URL}${path}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
};

const fetchUser = (username) => {
    const url = buildUrl(`/users/${username}`);
    
    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};

const fetchRepositories = (userLogin) => {
    const url = buildUrl(`/users/${userLogin}/repos?sort=updated&direction=desc`);

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};

const displayUser = (user) => {
    userProfileContainer.empty();
    repositoriesListContainer.hide();

    const html = `
        <div class="user-card">
            <img src="${user.avatar_url}" alt="${user.login} avatar">
            <div class="user-info">
                <h2>${user.name || user.login} (${user.login})</h2>
                <p><strong>Lokalita:</strong> ${user.location || 'Neznáma'}</p>
                <p><strong>Bio:</strong> ${user.bio || 'Bez bio.'}</p>
                <p><strong>Followers:</strong> ${user.followers}</p>
                <p><strong>Following:</strong> ${user.following}</p>
                <p><strong>Public Repos:</strong> ${user.public_repos}</p>
                <p><strong>GitHub Profil:</strong> <a href="${user.html_url}" target="_blank">${user.html_url}</a></p>
            </div>
        </div>
    `;
    userProfileContainer.append(html);
};

const displayRepositories = (repositories) => {
    repoUl.empty();

    if (repositories.length === 0) {
        repoUl.append('<li>Používateľ nemá žiadne verejné repozitáre.</li>');
    } else {
        repositories.forEach(repo => {
            const description = repo.description ? `<p class="repo-description">${repo.description}</p>` : '';
            const html = `
                <li>
                    <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                    ${description}
                    <div class="repo-stats">
                        <span>⭐ ${repo.stargazers_count}</span>
                        <span>Forks: ${repo.forks_count}</span>
                        <span>Language: ${repo.language || 'N/A'}</span>
                    </div>
                </li>
            `;
            repoUl.append(html);
        });
    }

    repositoriesListContainer.show();
};

const handleSearch = async (event) => {
    event.preventDefault();

    const username = $('#username-input').val().trim();
    if (!username) return;

    userProfileContainer.empty().append('<p>Načítavam dáta pre ' + username + '...</p>');
    repositoriesListContainer.hide();
    repoUl.empty();

    try {
        const user = await fetchUser(username);
        displayUser(user);
        const repositories = await fetchRepositories(user.login);
        displayRepositories(repositories);

    } catch (error) {
        userProfileContainer.empty();
        repositoriesListContainer.hide();

        if (error.status === 404) {
             userProfileContainer.append('<p class="error-message">Chyba: Používateľ s menom "' + username + '" nebol nájdený na GitHubi.</p>');
        } else if (error.status === 403 && error.responseJSON && error.responseJSON.message.includes('API rate limit exceeded')) {
             userProfileContainer.append('<p class="error-message">Chyba: Prekročený limit API volaní. Skúste prosím neskôr.</p>');
        } else {
             userProfileContainer.append('<p class="error-message">Nastala chyba pri načítavaní dát z GitHub API. Kód: ' + error.status + '</p>');
        }
    }
};

$(document).ready(function() {
    form.on('submit', handleSearch);
});