const CLIENT_ID = '';     
const CLIENT_SECRET = ''; 

const BASE_API_URL = 'https://api.github.com';
const userProfileContainer = $('#user-profile');
const userReposContainer = $('#user-repos');

const fetchUser = async (username) => {
    let url = `${BASE_API_URL}/users/${username}`;
    if (CLIENT_ID && CLIENT_SECRET) {
        url += `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    }

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};

const fetchRepositories = async (username) => {
    let url = `${BASE_API_URL}/users/${username}/repos?sort=updated&per_page=5`;
    if (CLIENT_ID && CLIENT_SECRET) {
        url += `&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    }

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};

const displayUser = (user) => {
    const html = `
        <div class="profile-card">
            <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
            <h2>${user.name || user.login}</h2>
            <p>${user.bio || 'Bez popisu'}</p>
            
            <div class="stats">
                <span class="badge">Repos: ${user.public_repos}</span>
                <span class="badge">Followers: ${user.followers}</span>
                <span class="badge">Following: ${user.following}</span>
            </div>
            
            <a href="${user.html_url}" target="_blank">Zobrazit profil na GitHubu</a>
        </div>
    `;
    userProfileContainer.html(html);
};

const displayRepositories = (repositories) => {
    if (repositories.length === 0) {
        userReposContainer.html('<p>Uživatel nemá žádné veřejné repozitáře.</p>');
        return;
    }

    let html = '<h3>Poslední repozitáře:</h3>';
    
    repositories.forEach(repo => {
        html += `
            <div class="repo-item">
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                ${repo.description ? `<p style="font-size:0.8em; color:#666; margin:5px 0 0 0;">${repo.description}</p>` : ''}
            </div>
        `;
    });

    userReposContainer.html(html);
};

$(document).ready(() => {
    $('#search-btn').on('click', async () => {
        const username = $('#username-input').val().trim();

        if (!username) {
            alert('Prosím zadejte uživatelské jméno.');
            return;
        }

        userProfileContainer.html('<p>Načítám...</p>');
        userReposContainer.empty();

        try {
            const user = await fetchUser(username);
            
            displayUser(user);

            const repos = await fetchRepositories(user.login);

            displayRepositories(repos);

        } catch (err) {
            console.error(err);
            userReposContainer.empty();
            
            if (err.status === 404) {
                userProfileContainer.html('<p class="error-msg">Uživatel nenalezen.</p>');
            } else {
                userProfileContainer.html('<p class="error-msg">Došlo k chybě při komunikaci s API.</p>');
            }
        }
    });
});