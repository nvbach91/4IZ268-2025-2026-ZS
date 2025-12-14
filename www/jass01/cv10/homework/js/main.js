/**
 * Git The Hub
 */
// It is best practice to create variables and functions under one object to avoid global polution
const App = {};
// INSERT CLIENT ID FROM GITHUB
App.client_id = 'Ov23lidFE0xWlRKTOma5';
// INSERT CLIENT SECRET FROM GITHUB
App.client_secret = 'b10bd9e1c7effa7ddd71d89a8de563fd320430f1';
App.baseApiUrl = 'https://api.github.com';

// render the user's information
App.renderUser = (user) => {
  const $profile = $('#user-profile');
  if (!user || user.message === 'Not Found') {
    $profile.html('<p class="error">User not found</p>');
    $('#repositories').empty();
    return;
  }

  const name = user.name || user.login;
  const bio = user.bio ? `<p class="bio">${user.bio}</p>` : '';
  const location = user.location ? `<p>Location: ${user.location}</p>` : '';

  const html = `
    <div class="profile">
      <img src="${user.avatar_url}" alt="${user.login}" class="avatar" />
      <div class="meta">
        <h2><a href="${user.html_url}" target="_blank" rel="noopener">${name}</a></h2>
        ${bio}
        <p>Followers: ${user.followers} · Following: ${user.following} · Public repos: ${user.public_repos}</p>
        ${location}
      </div>
    </div>
  `;
  $profile.html(html);
};

// fetch user profile
App.fetchUser = (username) => {
  if (!username) return;
  const url = `${App.baseApiUrl}/users/${encodeURIComponent(username)}?client_id=${App.client_id}&client_secret=${App.client_secret}`;
  $.getJSON(url)
    .done((user) => {
      App.renderUser(user);
    })
    .fail(() => {
      App.renderUser({ message: 'Not Found' });
    });
};

// a function that fetches repositories of users based on their username
App.fetchRepositories = (username) => {
  if (!username) return;
  const url = `${App.baseApiUrl}/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc&client_id=${App.client_id}&client_secret=${App.client_secret}`;
  $.getJSON(url)
    .done((repos) => {
      const $list = $('#repositories');
      $list.empty();
      if (!Array.isArray(repos) || repos.length === 0) {
        $list.html('<li>No repositories found</li>');
        return;
      }
      repos.forEach((repo) => {
        const description = repo.description ? `<p class="repo-desc">${repo.description}</p>` : '';
        const li = `
          <li class="repo">
            <a href="${repo.html_url}" target="_blank" rel="noopener" class="repo-name">${repo.name}</a>
            ${description}
            <small class="repo-stats">★ ${repo.stargazers_count} · Forks: ${repo.forks_count}</small>
          </li>
        `;
        $list.append(li);
      });
    })
    .fail(() => {
      $('#repositories').empty();
      $('#user-profile').html('<p class="error">User not found</p>');
    });
};

App.init = () => {
  $('#search-form').on('submit', (e) => {
    e.preventDefault();
    const username = $.trim($('[name="username"]').val());
    if (!username) {
      $('#user-profile').html('<p class="error">Please enter a username</p>');
      $('#repositories').empty();
      return;
    }
    $('#user-profile').html('<p>Loading...</p>');
    $('#repositories').html('<li>Loading...</li>');
    App.fetchUser(username);
    App.fetchRepositories(username);
  });
};

// wait for the page to load, then execute the main processes
$(document).ready(() => {
  App.init();
});