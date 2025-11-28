const CLIENT_ID = 'secret';
const CLIENT_SECRET = 'secret';
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const repositoriesList = $('#repositories');
const form = $('#search-form');
const input = $('input[name="username"]');

form.on('submit', async (e) => {
    e.preventDefault();

    const username = input.val().trim();

    if (username === '') {
        alert('Prosím zadejte jméno uživatele');
        return;
    }

    userProfileContainer.html('');
    repositoriesList.html('');

    await fetchUser(username);
});

const fetchUser = async (username) => {
    const url = `${BASE_API_URL}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

    try {
        const user = await $.get(url);

        displayUser(user);

        await fetchRepositories(username);

    } catch (error) {
        if (error.status === 404) {
            userProfileContainer.html(`<div class="error">Uživatel <strong>${username}</strong> nebyl nalezen.</div>`);
        } else {
            userProfileContainer.html(`<div class="error">Došlo k chybě při komunikaci s GitHub API.</div>`);
        }
    }
};

const fetchRepositories = async (userLogin) => {
    const url = `${BASE_API_URL}/users/${userLogin}/repos?sort=updated&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

    try {
        const repos = await $.get(url);
        displayRepositories(repos);
    } catch (error) {
        repositoriesList.html('<li>Nepodařilo se načíst repozitáře.</li>');
    }
};

const displayUser = (user) => {
    const html = `
        <div class="user-card">
            <img src="${user.avatar_url}" alt="${user.login}" style="width: 150px;height: 150px; border-radius: 50%;">
            <h3>${user.name || user.login}</h3>
            <p><strong>Login:</strong> ${user.login}</p>
            <p>${user.bio ? user.bio : 'Bez popisu'}</p>
            <p><strong>Lokace:</strong> ${user.location || 'Neznáma'}</p>
            <a href="${user.html_url}" target="_blank" class="btn-profile">Zobrazit na GitHubu</a>
        </div>
    `;

    userProfileContainer.html(html);
};

const displayRepositories = (repositories) => {
    if (repositories.length === 0) {
        repositoriesList.html('<li>Tento uživatel nemá žádné veřejné repozitáře.</li>');
        return;
    }

    const reposHtml = repositories.map(repo => `
        <li>
            <a href="${repo.html_url}" target="_blank">
                <strong>${repo.name}</strong>
            </a>
            - ⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}
        </li>
    `).join('');

    repositoriesList.html(reposHtml);

};
