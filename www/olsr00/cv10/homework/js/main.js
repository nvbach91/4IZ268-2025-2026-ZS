/**
 * Git The Hub
 */
// It is best practice to create variables and functions under one object to avoid global polution
const App = {};
// INSERT CLIENT ID FROM GITHUB
App.client_id = 'Ov23lidodOroDMlYFn44';
// INSERT CLIENT SECRET FROM GITHUB
App.client_secret = '3998abce152aedff4bbd4f75802da14985c6ee3c';
App.baseApiUrl = 'https://api.github.com';

// render the user's information
App.renderUser = (user) => {
        const $container = $('#user-profile').empty();
        const html = `
<div class="user">
    <img src="${user.avatar_url}" alt="${user.login}" width="100" height="100"/>
    <div>
        <h2>${user.name || ''} <small>@${user.login}</small></h2>
        ${user.bio ? `<p>${user.bio}</p>` : ''}
        <p>${user.location || ''}</p>
        <p>Followers: ${user.followers} • Following: ${user.following} • Repos: ${user.public_repos}</p>
        <p><a href="${user.html_url}" target="_blank">View profile</a></p>
    </div>
</div>`;
        $container.append(html);
};

App.fetchUser = (username) => {
    const creds = App.client_id || App.client_secret ? `?client_id=${App.client_id}&client_secret=${App.client_secret}` : '';
    const url = `${App.baseApiUrl}/users/${username}${creds}`;
    return $.ajax({ url, method: 'GET' });
};

// a function that fetches repositories of users based on their username
App.fetchRepositories = (username) => {
    const creds = App.client_id || App.client_secret ? `?client_id=${App.client_id}&client_secret=${App.client_secret}` : '';
    const url = `${App.baseApiUrl}/users/${username}/repos${creds}`;
    return $.ajax({ url, method: 'GET' });
};

App.displayRepositories = (repositories) => {
    const $list = $('#repositories').empty();
    if (!repositories || repositories.length === 0) {
        $list.append('<li>No repositories</li>');
        return;
    }
    repositories.forEach((repo) => {
        const li = `<li><a href="${repo.html_url}" target="_blank">${repo.name}</a> (${repo.stargazers_count}★) - ${repo.description || ''}</li>`;
        $list.append(li);
    });
};

App.init = () => {
    $('#search-form').on('submit', (event) => {
        event.preventDefault();
        const username = $.trim($('[name="username"]').val());
        $('#repositories').empty();
        $('#user-profile').empty().append('<div class="loader"></div>');
        if (!username) {
            $('#user-profile').empty().append('<p>Enter username</p>');
            return;
        }
        App.fetchUser(username).done((user) => {
            App.renderUser(user);
            App.fetchRepositories(user.login).done((repos) => {
                App.displayRepositories(repos);
            }).fail(() => {
                $('#repositories').empty().append('<li>Failed to load repositories</li>');
            });
        }).fail(() => {
            $('#user-profile').empty().append('<p class="user-error">User not found</p>');
        });
    });
};

// wait for the page to load, then execute the main processes
$(document).ready(() => {
    App.init();
});