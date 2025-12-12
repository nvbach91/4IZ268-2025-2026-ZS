/**
 * Git The Hub
 */
const App = {};
App.client_id = 'Ov23limAHszXExCSuYIY';
App.client_secret = '3ba7f6dbd6c13e18beba7089ec79fad3f8f13f88';
App.baseApiUrl = 'https://api.github.com';


App.renderUser = (user) => {
  $('#user-profile').empty();

  if (!user || user.message === 'Not Found') {
    $('#user-profile').html('<p>User not found.</p>');
    return;
  }

  const createdAt = new Date(user.created_at).toLocaleDateString();

  const html = `
    <div class="user-card">
      <img class="avatar" src="${user.avatar_url}" alt="${user.login}" />
      <div class="user-info">
        <h3>${user.name ? user.name : user.login} <small>@${user.login}</small></h3>
        ${user.bio ? `<p class="bio">${user.bio}</p>` : ''}
        <p>
          <strong>Followers:</strong> ${user.followers} &nbsp;
          <strong>Following:</strong> ${user.following} &nbsp;
          <strong>Public repos:</strong> ${user.public_repos}
        </p>
        <p>
          ${user.company ? `<span>${user.company}</span> &nbsp;` : ''}
          ${user.location ? `<span>${user.location}</span> &nbsp;` : ''}
          ${user.blog ? `<a href="${user.blog.startsWith('http') ? user.blog : 'http://' + user.blog}" target="_blank">${user.blog}</a>` : ''}
        </p>
        <p class="small">Joined: ${createdAt}</p>
      </div>
    </div>
  `;

  $('#user-profile').html(html);
};

App.fetchRepositories = (username) => {
  if (!username) return;

  const creds = `?client_id=${App.client_id}&client_secret=${App.client_secret}`;

  $.getJSON(`${App.baseApiUrl}/users/${username}${creds}`)
    .done((user) => {
      App.renderUser(user);

      $.getJSON(`${App.baseApiUrl}/users/${username}/repos${creds}&sort=created&per_page=20`)
        .done((repos) => {
          const $list = $('#repositories');
          $list.empty();

          if (!repos || repos.length === 0) {
            $list.append('<li>No repositories found.</li>');
            return;
          }

          repos.forEach((repo) => {
            const li = `
              <li class="repo-item">
                <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                ${repo.description ? `<p class="repo-desc">${repo.description}</p>` : ''}
                <p class="repo-meta small">⭐ ${repo.stargazers_count} &nbsp; | &nbsp; Forks: ${repo.forks_count}</p>
              </li>
            `;
            $list.append(li);
          });
        })
        .fail(() => {
          $('#repositories').html('<li>Error loading repositories.</li>');
        });
    })
    .fail(() => {
      App.renderUser({ message: 'Not Found' });
      $('#repositories').empty();
    });
};
App.init = () => {
  $('#search-form').on('submit', (e) => {
    e.preventDefault();
    const username = $.trim($('input[name="username"]').val());
    if (!username) return;

    $('#user-profile').html('<p>Loading...</p>');
    $('#repositories').empty();

    App.fetchRepositories(username);
  });
};

$(document).ready(() => {
  App.init();
});