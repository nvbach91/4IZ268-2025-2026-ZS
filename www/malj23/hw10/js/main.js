
const App = {};

App.client_id = '...';
App.client_secret = '...';
App.baseApiUrl = 'https://api.github.com';

App.renderUser = (user) => {
  const userHtml = `
    <div class="user-info">
      <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
      <div class="user-details">
        <h2>${user.name || user.login}</h2>
        <p class="username">@${user.login}</p>
        ${user.bio ? `<p class="bio">${user.bio}</p>` : ''}
        <div class="stats">
          <span>Followers: ${user.followers}</span>
          <span>Following: ${user.following}</span>
          <span>Public repos: ${user.public_repos}</span>
        </div>
        ${user.location ? `<p class="location">📍 ${user.location}</p>` : ''}
        ${user.blog ? `<p class="website"><a href="${user.blog}" target="_blank">🔗 ${user.blog}</a></p>` : ''}
        <p class="joined">Joined: ${new Date(user.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  `;
  $('#user-profile').html(userHtml);
};


App.fetchRepositories = (username) => {
  const apiUrl = `${App.baseApiUrl}/users/${username}/repos`;
  const params = {
    sort: 'updated desc',
    per_page: 10
  };
  

  if (App.client_id !== '...' && App.client_secret !== '...') {
    params.client_id = App.client_id;
    params.client_secret = App.client_secret;
  }
  
  $.ajax({
    url: apiUrl,
    method: 'GET',
    data: params,
    success: function(repos) {
      App.renderRepositories(repos);
    },
    error: function() {
      $('#repositories').html('<li class="error">Failed to load repositories.</li>');
    }
  });
};

App.renderRepositories = (repos) => {
  if (repos.length === 0) {
    $('#repositories').html('<li>No public repositories found.</li>');
    return;
  }
  
  const reposHtml = repos.map(repo => `
    <li class="repo-item">
      <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
      ${repo.description ? `<p class="repo-description">${repo.description}</p>` : ''}
      <div class="repo-stats">
        ${repo.language ? `<span class="language">${repo.language}</span>` : ''}
        <span class="stars">⭐ ${repo.stargazers_count}</span>
        <span class="forks">🍴 ${repo.forks_count}</span>
        <span class="updated">Updated: ${new Date(repo.updated_at).toLocaleDateString()}</span>
      </div>
    </li>
  `).join('');
  
  $('#repositories').html(reposHtml);
};

App.fetchUser = (username) => {
  const apiUrl = `${App.baseApiUrl}/users/${username}`;
  const params = {};
  

  if (App.client_id !== '...' && App.client_secret !== '...') {
    params.client_id = App.client_id;
    params.client_secret = App.client_secret;
  }
  
  $.ajax({
    url: apiUrl,
    method: 'GET',
    data: params,
    success: function(user) {
      App.renderUser(user);
      App.fetchRepositories(username);
    },
    error: function() {
      $('#user-profile').html('<p class="error">User not found. Please try a different username.</p>');
      $('#repositories').empty();
    }
  });
};

App.init = () => {
  $('#search-form').on('submit', function(e) {
    e.preventDefault();
    
    const username = $('input[name="username"]').val().trim();
    if (!username) return;
    

    $('#user-profile').empty();
    $('#repositories').empty();
    

    App.fetchUser(username);
  });
};


$(document).ready(() => {
  App.init();
});