/**
 * Git The Hub
 */
const App = {};
App.client_id = 'Ov23liVkZ0GHiMoTyni2';
App.client_secret = '1115e80aa1a9e79c0821ac85072506bfc7ce';
App.baseApiUrl = 'https://api.github.com';

App.fetchUser = async (username) => {
    const response = await fetch(App.baseApiUrl + `/users/${username}`);
    if (response.ok) {
        return await response.json();
    }
    return null;
};

App.renderUser = (user) => {
    const $display = $('#user-profile');
    $display.empty();

    if (!user) {
        $display.append('User not found');
        return;
    }

    $display.append(`
        <div class="user-card">
            <br/>
            <img src="${user.avatar_url}" alt="${user.login}" width="100">
            <h2><a href="${user.html_url}" target="_blank">${user.name || user.login}</a></h2>
            ${user.bio ? `<p>${user.bio}</p>` : ''}
            <p>Followers: ${user.followers} | Following: ${user.following}</p>
            <p>Public Repos: ${user.public_repos} | Public Gists: ${user.public_gists}</p>
            ${user.blog ? `<p>Blog: <a href="${user.blog}" target="_blank">${user.blog}</a></p>` : ''}
            ${user.location ? `<p>Location: ${user.location}</p>` : ''}
        </div>
    `);
};

App.fetchRepos = async (repos_url) => {
    const response = await fetch(repos_url);
    if (response.ok) {
        return await response.json();
    }
    return null;
};

App.renderRepos = (repos) => {
    const $repositories = $('#repositories');
    $repositories.empty();


    if (!repos || repos.length === 0) {
        $repositories.append('<p>No repositories found.</p>');
        return;
    }

    console.log(repos);

    for (let i = 0; i < repos.length; i += 1) {
        console.log(i)
        $repositories.append($(`
            <li>
                ${repos[i].name} <a href="${repos[i].html_url}" target="_blank">${repos[i].html_url}</a>
            </li>
        `));
    };
};

App.init = async () => {
    const $input = $('#search-form>input');
    $('#search-form').submit(async (e) => {
        e.preventDefault();
        const user = await App.fetchUser($input.val());
        $input.val('');

        App.renderUser(user);
        App.renderRepos(await App.fetchRepos(user.repos_url));
    });
};

// wait for the page to load, then execute the main processes
$(document).ready(() => {
    App.init();
});

