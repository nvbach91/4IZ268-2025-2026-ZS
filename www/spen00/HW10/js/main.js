
const CLIENT_ID = 'TVŮJ_CLIENT_ID';
const CLIENT_SECRET = 'TVŮJ_CLIENT_SECRET';

const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const repositoriesContainer = $('#repositories');
const messageBox = $('#message');


const fetchUser = async (username) => {
    const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    return axios.get(url);
};


const fetchRepositories = async (userLogin) => {

    const url = `${BASE_API_URL}/users/${encodeURIComponent(userLogin)}/repos?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    return axios.get(url);
};

const displayUser = (user) => {
    const createdDate = new Date(user.created_at);

    const html = `
        <div class="user-card">
            <div class="user-avatar">
                <img src="${user.avatar_url}" alt="Avatar of ${user.login}">
                <p><a href="${user.html_url}" target="_blank" rel="noopener noreferrer">View profile</a></p>
            </div>
            <div class="user-info">
                <h2>${user.login}</h2>
                <table>
                    <tbody>
                        <tr>
                            <th>Bio</th>
                            <td>${user.bio ? user.bio : '—'}</td>
                        </tr>
                        <tr>
                            <th>Location</th>
                            <td>${user.location ? user.location : '—'}</td>
                        </tr>
                        <tr>
                            <th>Description</th>
                            <td>${user.name ? user.name : '—'}</td>
                        </tr>
                        <tr>
                            <th>Email</th>
                            <td>${user.email ? user.email : '—'}</td>
                        </tr>
                        <tr>
                            <th>Followers</th>
                            <td>${user.followers}</td>
                        </tr>
                        <tr>
                            <th>Registered</th>
                            <td>${createdDate.toLocaleDateString()}</td>
                        </tr>
                        <tr>
                            <th>Profile URL</th>
                            <td><a href="${user.html_url}" target="_blank" rel="noopener noreferrer">${user.html_url}</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    `;

    userProfileContainer.empty().append(html);
};

const displayRepositories = (repositories) => {
    if (!repositories || repositories.length === 0) {
        repositoriesContainer.html('<p>This user has no public repositories.</p>');
        return;
    }

    const rows = repositories.map((repo) => {
        return `
            <tr>
                <td>${repo.name}</td>
                <td><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.html_url}</a></td>
                <td>${repo.language ? repo.language : '—'}</td>
                <td>${repo.stargazers_count}</td>
            </tr>
        `;
    }).join('');

    const html = `
        <h3>Repositories</h3>
        <p class="repo-count">This user has ${repositories.length} repositories</p>
        <table class="repo-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>URL</th>
                    <th>Language</th>
                    <th>★</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    `;

    repositoriesContainer.empty().append(html);
};

$('#search-form').on('submit', async function (event) {
    event.preventDefault();

    const username = $('#username').val().trim();

    userProfileContainer.empty();
    repositoriesContainer.empty();
    messageBox
        .removeClass('error info')
        .text('');

    if (username === '') {
        messageBox
            .addClass('error')
            .text('Please enter a GitHub username.');
        return;
    }

    try {
        messageBox
            .addClass('info')
            .text('Searching user…');


        const userResp = await fetchUser(username);
        const userData = userResp.data;
        displayUser(userData);


        const reposResp = await fetchRepositories(userData.login);
        const reposData = reposResp.data;
        displayRepositories(reposData);

        messageBox
            .removeClass('error')
            .addClass('info')
            .text('User loaded successfully.');
    } catch (err) {
        console.error(err);
        userProfileContainer.empty();
        repositoriesContainer.empty();
        messageBox
            .removeClass('info')
            .addClass('error')
            .text('User not found or error while calling GitHub API.');
    }
});
