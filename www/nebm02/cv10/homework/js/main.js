/**
 * Git The Hub
 */
// It is best practice to create variables and functions under one object to avoid global polution
const App = {};
// INSERT CLIENT ID FROM GITHUB
App.CLIENT_ID = 'Ov23limbi7rLoVta3UM5';
// INSERT CLIENT SECRET FROM GITHUB
App.CLIENT_SECRET = '15b92b2df99cb02cb320d29ed4c8c99251d2ddd2';
App.BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile')
const userRepositoriesContainer = $('#repositories')
const loader = $('#loader');

App.fetchUser = async (username) => {
    const url = `${App.BASE_API_URL}/users/${username}?client_id=${App.CLIENT_ID}&client_secret=${App.CLIENT_SECRET}`;
    return await App.sendRequest(url);
}

App.fetchRepositories = async (username) => {
    const url = `${App.BASE_API_URL}/users/${username}/repos?client_id=${App.CLIENT_ID}&client_secret=${App.CLIENT_SECRET}`;
    return await App.sendRequest(url);
};

App.sendRequest = async (url) => {
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

App.displayUser = (user) => {
    userProfileContainer.addClass('profile_border');
    const userProfile = $(`
        <h2 id="nickname">${user.name}</h2>
                <div id="profile-picture">
                    <img id="avatar" src="${user.avatar_url}" alt="User Avatar" />
                    <a class="view_profile" href="${user.html_url}">View Profile</a>
                </div>
                <div id="informations">
                    <div class="user_info" id="login">Login: <b> ${user.login || ""} </b> </div>
                    <div class="user_info" id="bio">Bio: <b> ${user.bio || ""}</b></div>
                    <div class="user_info" id="location">Location: <b>${user.location || ""}</b></div>
                    <div class="user_info" id="e-mail">Email: <b>${user.email || ""}</b></div>
                    <div class="user_info" id="followers">Followers: <b>${user.followers || ""}</b></div>
                    <div class="user_info" id="registred">Registered: <b>${user.created_at || ""}</b></div>
                    <div class="user_info" id="link"><a href="${user.html_url}">${user.html_url}</a></div>
                </div>
`);
    userProfileContainer.empty().append(userProfile);
};

App.displayRepositories = (repositories) => {
    const repoList = []
    // <li><div class="repo_name">reponame</div><div class="repo_link"><a href="">repo_link</a></div></li>
    $.each(repositories, function (i, repo) {
        const repoItem = $(`
            <li>
                <div class="repo_name">${repo.name}</div>
                <div class="repo_link">
                    <a href="${repo.html_url}">${repo.html_url}</a>
                </div>
            </li>`);
        repoList.push(repoItem);
    });
    userRepositoriesContainer.append(repoList);
};

App.init = () => {
    $('#search-form').on('submit', async (e) => {
        e.preventDefault();

        const form = $(e.currentTarget);
        const username = form.find('input[name="username"]').val();

        if (username) {
            userProfileContainer.empty();
            userRepositoriesContainer.empty();
            userProfileContainer.append('<div class="loader"></div>');
            try {
                const user = await App.fetchUser(username);

                App.displayUser(user);

                const repositories = await App.fetchRepositories(username);
                console.log(repositories);
                App.displayRepositories(repositories);
            } catch (err) {
                console.error(err);
                userProfileContainer.empty().append('<p>User not found</p>');
            }
        }
    });
};

// wait for the page to load, then execute the main processes
$(document).ready(() => {
    App.init();
});