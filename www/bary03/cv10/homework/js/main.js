const CLIENT_ID = 'Ov23liKc6zYc7IhOAoAF';     
const CLIENT_SECRET = '413a5ce3b2c67c353611f6c3b60ae146401344fe';
const BASE_API_URL = 'https://api.github.com';

const $form = $('#search-form');
const $input = $('#username-input');
const $profile = $('#user-profile');
const $reposTitle = $('#repos-title');
const $reposSubtitle = $('#repos-subtitle');
const $reposList = $('#repos-list');

function buildAuthParams() {
  if (CLIENT_ID && CLIENT_SECRET) {
    return `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  }
  return '';
}

async function fetchUser(username) {
  const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}${buildAuthParams()}`;
  return $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  });
}

async function fetchRepositories(username) {
  const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}/repos${buildAuthParams()}&per_page=100&sort=updated`;
  return $.ajax({
    url,
    method: 'GET',
    dataType: 'json'
  });
}

function displayUser(user) {
  $profile.empty();
  const avatar = $('<img>').attr('src', user.avatar_url).attr('alt', user.login);
  const info = $('<div>').addClass('profile-info');

  const rows = [
    { label: 'Login', value: user.login || '' },
    { label: 'Name', value: user.name || '' },
    { label: 'Bio', value: user.bio || '' },
    { label: 'Location', value: user.location || '' },
    { label: 'Email', value: user.email || '' },
    { label: 'Followers', value: user.followers != null ? user.followers : '' },
    { label: 'Registered', value: user.created_at ? new Date(user.created_at).toLocaleDateString() : '' },
    { label: 'Profile', value: user.html_url || '' }
  ];

  rows.forEach(r => {
  const row = $('<div>').addClass('row');
  let value = r.value;

  if (r.label === 'Profile' && r.value) {
    value = `<a href="${r.value}" target="_blank">${r.value}</a>`;
  }

  row.html(`<strong>${r.label}:</strong> ${value}`);
  info.append(row);
});


  $profile.append(avatar, info);
}

function displayRepositories(repos) {
  $reposList.empty();
  $reposTitle.text(`Repositories`);
  $reposSubtitle.text(`This user has (${repos.length}) repositories`);
  if (!repos.length) {
    $reposList.text('This user has no public repositories.');
    return;
  }

  repos.forEach(r => {
    const row = $('<div>').addClass('repo-row');
    const name = $('<div>').text(r.name);
    const link = $('<a>').attr('href', r.html_url).attr('target','_blank').text(r.html_url);
    row.append(name, link);
    $reposList.append(row);
  });
}

$form.on('submit', async function (e) {
  e.preventDefault();
  const username = $input.val().trim();
  if (!username) return;

  $profile.html('<p>Loading user...</p>');
  $reposTitle.text('');
  $reposSubtitle.text('');
  $reposList.empty();

  try {
    const user = await fetchUser(username);
    displayUser(user);
    $reposList.html('<p>Loading repositories...</p>');
    const repos = await fetchRepositories(username);
    displayRepositories(repos);
  } catch (err) {
    console.error(err);
    if (err && err.status === 404) {
      $profile.html('<p>User not found</p>');
    } else {
      $profile.html('<p>Error fetching data (see console)</p>');
    }
    $reposTitle.text('');
    $reposSubtitle.text('');
    $reposList.empty();
  }
});
