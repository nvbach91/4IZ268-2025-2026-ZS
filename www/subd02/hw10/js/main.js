/**
 * Git The Hub
 */
// It is best practice to create variables and functions under one object to avoid global polution
const App = {};
// INSERT CLIENT ID FROM GITHUB
App.client_id = 'Ov23lix4hzdGYRiFv5XR';
// INSERT CLIENT SECRET FROM GITHUB
App.client_secret = '896ee50d57d36551016231693e5ff55c115b1a2c';
App.baseApiUrl = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const repositoriesList = $('#repositories');
const searchForm = $('#search-form');

App.fetchUser = async (username) => {
    const url = `${App.baseApiUrl}/users/${username}?client_id=${App.client_id}&client_secret=${App.client_secret}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
    }
    return await response.json();
};

App.renderUser = (user) => {
    userProfileContainer.empty();
    const html = `
        <div id="profile-display">
        <h2 id="nickname">${user.name}</h2>
        <div id="profile-columns">
            <div id="profile-left">
                <img id="avatar" src="${user.avatar_url}" alt="User Avatar" />
                <a class="view_profile" href="${user.html_url}">View Profile</a>
            </div>
            <div id="profile-right">
                <div class="user_info" id="login">Login: <b> ${user.login || ""} </b> </div>
                <div class="user_info" id="bio">Bio: <b> ${user.bio || ""}</b></div>
                <div class="user_info" id="location">Location: <b>${user.location || ""}</b></div>
                <div class="user_info" id="e-mail">Email: <b>${user.email || ""}</b></div>
                <div class="user_info" id="followers">Followers: <b>${user.followers || ""}</b></div>
                <div class="user_info" id="registred">Registered: <b>${user.created_at || ""}</b></div>
                <div class="user_info" id="link"><a href="${user.html_url}">${user.html_url}</a></div>
            </div>
        </div>
        </div id="profile-display">
    `;
    userProfileContainer.append(html);
};

App.fetchRepositories = async (username) => {
    const url = `${App.baseApiUrl}/users/${username}/repos?sort=updated&client_id=${App.client_id}&client_secret=${App.client_secret}`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch repositories`);
    }
    return await response.json();
};

App.renderRepositories = (repositories) => {
    repositoriesList.empty();

    if (repositories.length === 0) {
        repositoriesList.append('<li>No public repositories found</li>');
        return;
    }

    repositories.forEach(repo => {
        const repoHtml = `
            <li>
                <a href="${repo.html_url}" target="_blank"><strong>${repo.name}</strong></a>
                <p>${repo.description || ''}</p>
            </li>
        `;
        repositoriesList.append(repoHtml);
    });

};

App.init = () => {
    searchForm.on("submit", async (e) => {
        e.preventDefault();

        const username = searchForm.find('input[name="username"]').val().trim();

        if (!username) {
            alert("Please enter username");
            return;
        }
        userProfileContainer.empty();
        repositoriesList.empty();
        userProfileContainer.append('<div class="loader"></div>');

        try {
            const user = await App.fetchUser(username);
            App.renderUser(user);

            const repos = await App.fetchRepositories(user.login);
            App.renderRepositories(repos);
        }
        catch (err) {
            console.error(err);
            userProfileContainer.html('<p style="color: red;">User not found!</p>');
        }
    });
};

$(document).ready(() => {
    App.init();
});