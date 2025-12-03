/**
 * Git The Hub
 */
// It is best practice to create variables and functions under one object to avoid global polution
const App = {};
// INSERT CLIENT ID FROM GITHUB
App.client_id = 'Ov23liSijEP35fg8O7J7';
// INSERT CLIENT SECRET FROM GITHUB
App.client_secret = '592e6b80652d2351bd9cca107290a8e0f4b41823';
App.baseApiUrl = 'https://api.github.com';

// render the user's information
App.renderUser = (user) => {
  const container = $('#user-profile');
  container.empty();

  const html = `
    <div class="user-box">
      <img src="${user.avatar_url}" width="200" />
      <div class="info">
        <p><strong>Login:</strong> ${user.login}</p>
        <p><strong>Name:</strong> ${user.name || 'N/A'}</p>
        <p><strong>Bio:</strong> ${user.bio || 'N/A'}</p>
        <p><strong>Location:</strong> ${user.location || 'N/A'}</p>
        <p><strong>Email:</strong> ${user.email || 'N/A'}</p>
        <p><strong>Followers:</strong> ${user.followers}</p>
        <p><strong>Registered:</strong> ${new Date(user.created_at).toLocaleDateString()}</p>
        <a href="${user.html_url}" target="_blank">View profile</a>
      </div>
    </div>
  `

  container.append(html);
};

// a function that fetches repositories of users based on their username
App.fetchRepositories = (username) => {
  return $.ajax({
    url: `${App.baseApiUrl}/users/${username}/repos?client_id=${App.client_id}&client_secret=${App.client_secret}`,
    method: 'GET'
  });  
};

App.init = () => {
  $('#search-form').on('submit', function (e) {
    e.preventDefault();

    const username = $(this).find('input[name="username"]').val().trim();
    if (!username) return;

    $.ajax({
      url: `${App.baseApiUrl}/users/${username}?client_id=${App.client_id}&client_secret=${App.client_secret}`,
      method: 'GET'
    })
      .done((user) => {
        App.renderUser(user);

        App.fetchRepositories(username).done((repos) => {
          const list = $('#repositories');
          list.empty();

          if (repos.length === 0) {
            list.append('<li>This user has no repositories</li>');
            return;
          }

          repos.forEach((repo) => {
            list.append(`
              <li>
                <span class="repo-name">${repo.name}</span>
                <a class="repo-link" href="${repo.html_url}" target="_blank">${repo.html_url}</a>
              </li>
            `);
          });
        });
      })
      .fail(() => {
        $('#user-profile').html('<p>User not found</p>');
        $('#repositories').empty();
      });
  });
};

// wait for the page to load, then execute the main processes
$(document).ready(() => {
  App.init();
});