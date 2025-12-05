// Příklad volání na GitHub API
const CLIENT_ID = 'Iv23liaLdKbULU4C2CPl';     // client_id získáte po registraci OAuth účtu
const CLIENT_SECRET = '8574b6059028fc5f35c6827a88f095754e767160'; // client_secret získáte po registraci OAuth účtu
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const reposContainer = $('#repos');
const form = $('main form');
const searchInput = $('input[name="search"]');

const fetchUser = async (username) => {
    // sestavujeme URL, který obsahuje parametry CLIENT_ID a CLIENT_SECRET
    // každý parametr se určuje v podobě klíč=hodnota, parametry se oddělují ampersandem, 
    // na začátek přidáme otazník
    // např. ?client_id=abcdef&client_secret=fedcba
    const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const data = await $.ajax({ url, method: 'GET', dataType: 'json' });
    return { data };
};

const fetchRepositories = async (userLogin) => {
    const url = `${BASE_API_URL}/users/${encodeURIComponent(userLogin)}/repos?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const data = await $.ajax({ url, method: 'GET', dataType: 'json' });
    return { data };
};

const displayUser = (user) => {
    userProfileContainer.html(`
        <div class="user">
            <img src="${user.avatar_url}" alt="${user.login}" class="avatar" width="120" height="120">
            <div class="info">
                <h2>${user.name || ''}</h2> <br>Login: ${user.login}
                ${user.bio ? `<p>Bio: ${user.bio}</p>` : ''}
                ${user.location ? `<p>Location: ${user.location}</p>` : ''}
                <p>
                    Public repos: ${user.public_repos} <br>
                    Followers: ${user.followers} <br>
                    Following: ${user.following} <br>
                </p>
                <a href="${user.html_url}" target="_blank">Open GitHub profile</a>
            </div>
        </div>
    `);
};

const displayRepositories = (repositories) => {
    reposContainer.empty();
    if (!repositories || !repositories.length) {
        reposContainer.append('<li>No public repositories.</li>');
        return;
    }
    repositories.forEach((repo) => {
        reposContainer.append(`
            <li>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                ${repo.description ? `<div>${repo.description}</div>` : ''}
            </li>
        `);
    });
};

(async () => {
    form.on('submit', async (e) => {
        e.preventDefault();
        const username = searchInput.val().trim();
        userProfileContainer.empty();
        reposContainer.empty();

        if (!username) {
            userProfileContainer.html('<p>Please enter github username.</p>');
            return;
        }

        try {
            const userResp = await fetchUser(username);
            displayUser(userResp.data);
            const repositoriesResp = await fetchRepositories(userResp.data.login);
            displayRepositories(repositoriesResp.data);
        } catch (err) {
            console.error(err);
            userProfileContainer.empty().append('<p>User not found</p>');
        }
    });
})();