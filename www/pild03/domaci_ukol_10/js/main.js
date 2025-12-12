/**
 * Git The Hub
 */
const App = {};
App.client_id = 'Ov23liPYBivHtrYRgkOU';
App.client_secret = '5fefe7c5c73226951c513455d422a96f2514efec';
App.baseApiUrl = 'https://api.github.com';


/**
 * Fetch GitHub user
 */
App.fetchUser = (username) => {
  const url = `${App.baseApiUrl}/users/${username}?client_id=${App.client_id}&client_secret=${App.client_secret}`;
  return $.ajax({ url, method: "GET" });
};

/**
 * Fetch repos
 */
App.fetchRepositories = (username) => {
  const url = `${App.baseApiUrl}/users/${username}/repos?sort=created&per_page=100&client_id=${App.client_id}&client_secret=${App.client_secret}`;
  return $.ajax({ url, method: "GET" });
};

/**
 * Render user panel like screenshot
 */
App.renderUser = (user) => {
  $("#user-profile").html(`
    <div class="user-header">${user.login.toUpperCase()}</div>

    <div class="user-container">
      <div class="user-left">
        <img src="${user.avatar_url}" alt="${user.login}">
        <a class="profile-button" target="_blank" href="${user.html_url}">View profile</a>
      </div>

      <div class="user-right">
        <table>
          <tr><td><strong>Login</strong></td><td>${user.login}</td></tr>
          <tr><td><strong>Bio</strong></td><td>${user.bio ?? "N/A"}</td></tr>
          <tr><td><strong>Location</strong></td><td>${user.location ?? "N/A"}</td></tr>
          <tr><td><strong>Description</strong></td><td>${user.bio ?? "N/A"}</td></tr>
          <tr><td><strong>Email</strong></td><td>${user.email ?? "N/A"}</td></tr>
          <tr><td><strong>Followers</strong></td><td>${user.followers}</td></tr>
          <tr><td><strong>Registered</strong></td><td>${new Date(user.created_at).toLocaleDateString()}</td></tr>
          <tr><td><strong>URL</strong></td><td><a href="${user.html_url}" target="_blank">${user.html_url}</a></td></tr>
        </table>
      </div>
    </div>
  `);
};

/**
 * Render repositories
 */
App.renderRepositories = (repos) => {
  const list = $("#repositories");
  list.empty();

  if (!repos.length) {
    list.append("<li>This user has no repositories</li>");
    return;
  }

  repos.forEach((repo) => {
    list.append(`
      <li>
        <span>${repo.name}</span>
        <a href="${repo.html_url}" target="_blank">${repo.html_url}</a>
      </li>
    `);
  });
};

/**
 * Initialize App
 */
App.init = () => {
  $("#search-form").on("submit", function (e) {
    e.preventDefault();
    const username = $("input[name='username']").val().trim();

    if (!username) return;

    $("#user-profile").html('<div class="loader"></div>');
    $("#repositories").empty();

    App.fetchUser(username)
      .done((user) => {
        App.renderUser(user);

        App.fetchRepositories(user.login)
          .done((repos) => App.renderRepositories(repos))
          .fail(() =>
            $("#repositories").html("<li>Could not load repositories</li>")
          );
      })
      .fail(() => $("#user-profile").html("<p>User not found</p>"));
  });
};

$(document).ready(App.init);
