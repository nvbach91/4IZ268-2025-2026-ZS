/**
 * Git The Hub
 */
const App = {};
App.client_id = 'Ov23li1o41UuefqpZvUL';
App.client_secret = '9587112a11c5ef108e540dace53c43eed7632f04';
App.baseApiUrl = 'https://api.github.com';

// vykreslení uživatele
App.renderUser = (user) => {
  const html = `
    <div class="user">
      <img src="${user.avatar_url}" alt="${user.login}">
      <h2>${user.name || user.login}</h2>
      <p>Login: ${user.login}</p>
      <p>Public repos: ${user.public_repos}</p>
      <p>Followers: ${user.followers}</p>
      <a href="${user.html_url}" target="_blank">View profile</a>
    </div>
  `;
  $('#user-profile').html(html);
};

// načtení repozitářů
App.fetchRepositories = (username) => {
  const url = `${App.baseApiUrl}/users/${username}/repos?client_id=${App.client_id}&client_secret=${App.client_secret}`;
  return $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  })
    .done((repos) => {
      if (!repos.length) {
        $('#repositories').html('<p>No public repositories.</p>');
        return;
      }

      const items = repos.map((repo) => `
        <li class="repo">
          <a href="${repo.html_url}" target="_blank">${repo.name}</a>
          <span>★ ${repo.stargazers_count}</span>
        </li>
      `).join('');

      $('#repositories').html(`<ul>${items}</ul>`);
    })
    .fail(() => {
      $('#repositories').html('<p class="error">Could not load repositories</p>');
    });
};

App.init = () => {
  const $form = $('#search-form');
  const $input = $('input[name="username"]');
  const $userProfile = $('#user-profile');
  const $reposContainer = $('#repositories');

  $form.on('submit', (e) => {
    e.preventDefault();

    const username = $input.val().trim();
    if (!username) {
      $userProfile.html('<p class="error">Please enter a username</p>');
      $reposContainer.empty();
      return;
    }

    $userProfile.html('<p>Loading user...</p>');
    $reposContainer.empty();

    const url = `${App.baseApiUrl}/users/${username}?client_id=${App.client_id}&client_secret=${App.client_secret}`;

    $.ajax({
      url,
      method: 'GET',
      dataType: 'json'
    })
      .done((user) => {
        App.renderUser(user);
        $reposContainer.html('<p>Loading repositories...</p>');
        App.fetchRepositories(user.login);
      })
      .fail(() => {
        $userProfile.html('<p class="error">User not found</p>');
      });
  });
};

$(document).ready(() => {
  App.init();
});
