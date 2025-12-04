const CLIENT_ID = 'Ov23liTZAIN2ikSIsHlW';     // client_id získáte po registraci OAuth účtu
const CLIENT_SECRET = 'a4d72fd81a560ae683e524685927da5acb7faf23'; // client_secret získáte po registraci OAuth účtu
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const reposContainer = $('#repos');

const fetchUser = async (username) => {
    const url = `${BASE_API_URL}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const resp = await $.ajax({ url, method: 'GET' });
    return { data: resp };
};

const fetchRepositories = async (userLogin) => {
    const url = `${BASE_API_URL}/users/${userLogin}/repos?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    const resp = await $.ajax({ url, method: 'GET' });
    return { data: resp };
};

const displayUser = (user) => {
    userProfileContainer.empty().append(`
        <h3>${user.login}</h3>
        <img src="${user.avatar_url}" width="150">
        <p>Bio: ${user.bio ?? "—"}</p>
        <p>Location: ${user.location ?? "—"}</p>
        <p>Followers: ${user.followers}</p>
        <p>Profile: <a href="${user.html_url}" target="_blank">${user.html_url}</a></p>
    `);
};

const displayRepositories = (repositories) => {
    reposContainer.empty().append(`<h3>Repositories (${repositories.length})</h3>`);

    repositories.forEach(repo => {
        reposContainer.append(`
            <div>
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
            </div>
        `);
    });
};

$('#find').on('click', async () => {
    const username = $('#username').val().trim();
    if (!username) return;

    userProfileContainer.html("Načítám...");
    reposContainer.empty();

    (async () => {
        try {
            const userResp = await fetchUser(username);
            displayUser(userResp.data);
            const repositoriesResp = await fetchRepositories(userResp.data.login);
            displayRepositories(repositoriesResp.data);
        } catch (err) {
            console.error(err);
            userProfileContainer.empty().append('<p>User not found</p>');
        }
    })();
});


