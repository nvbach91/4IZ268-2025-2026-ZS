// Příklad volání na GitHub API
const CLIENT_ID = 'Ov23li8zZeviZdMn2HbH';     
const CLIENT_SECRET = '5e0f224303b10e07d826a74c617bf667a398e832'; 
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');

const escapeHtml = (s) =>
  String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

const fetchUser = async (username) => {
  // sestavujeme URL, který obsahuje parametry CLIENT_ID a CLIENT_SECRET
  // každý parametr se určuje v podobě klíč=hodnota, parametry se oddělují ampersandem,
  // na začátek přidáme otazník
  // např. ?client_id=abcdef&client_secret=fedcba
  const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  return axios.get(url, { headers: { 'Accept': 'application/vnd.github+json' } });
};

const fetchRepositories = async (userLogin) => {
  const url = `${BASE_API_URL}/users/${encodeURIComponent(userLogin)}/repos?per_page=100&sort=updated&direction=desc&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
  return axios.get(url, { headers: { 'Accept': 'application/vnd.github+json' } });
};

const displayUser = (user) => {
  const name = user.name ? escapeHtml(user.name) : escapeHtml(user.login);
  const login = escapeHtml(user.login);
  const bio = user.bio ? escapeHtml(user.bio) : 'Bez bio';
  const location = user.location ? escapeHtml(user.location) : '—';

  const html = `
    <div class="user">
      <img class="avatar" src="${escapeHtml(user.avatar_url)}" alt="Avatar ${login}">
      <div>
        <h2>${name}</h2>
        <p class="muted">@${login} · ${location}</p>
      </div>
    </div>

    <div class="row">
      <span class="badge">Followers: ${user.followers ?? 0}</span>
      <span class="badge">Following: ${user.following ?? 0}</span>
      <span class="badge">Public repos: ${user.public_repos ?? 0}</span>
      ${user.blog ? `<span class="badge">Web: ${escapeHtml(user.blog)}</span>` : ''}
    </div>

    <p class="muted" style="margin-top:10px;">${bio}</p>

    <hr>
    <div id="repos">
      <p class="muted">Načítám repozitáře…</p>
    </div>
  `;

  userProfileContainer.empty().append(html);
};

const displayRepositories = (repositories) => {
  const reposContainer = $('#repos');

  if (!Array.isArray(repositories) || repositories.length === 0) {
    reposContainer.empty().append('<p class="muted">Žádné veřejné repozitáře.</p>');
    return;
  }

  // lehké seřazení: nejdřív podle ⭐, pak podle updated_at
  const sorted = [...repositories].sort((a, b) => {
    const sa = a.stargazers_count ?? 0;
    const sb = b.stargazers_count ?? 0;
    if (sb !== sa) return sb - sa;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const items = sorted.map((r) => {
    const name = escapeHtml(r.name);
    const desc = r.description ? escapeHtml(r.description) : 'Bez popisu';
    const lang = r.language ? escapeHtml(r.language) : '—';
    const stars = r.stargazers_count ?? 0;
    const forks = r.forks_count ?? 0;
    const updated = r.updated_at ? new Date(r.updated_at).toLocaleString('cs-CZ') : '—';

    return `
      <li class="repo">
        <div><a href="${escapeHtml(r.html_url)}" target="_blank" rel="noreferrer">${name}</a></div>
        <div class="meta">${desc}</div>
        <div class="meta">Lang: ${lang} · ⭐ ${stars} · Forks: ${forks} · Updated: ${escapeHtml(updated)}</div>
      </li>
    `;
  }).join('');

  reposContainer.empty().append(`<ul class="repo-list">${items}</ul>`);
};

// UI + submit bez reloadu
const setLoading = (isLoading) => {
  const btn = $('#search-form button');
  btn.prop('disabled', isLoading);
  btn.text(isLoading ? 'Načítám…' : 'Hledat');
};

$('#search-form').on('submit', async (e) => {
  e.preventDefault();
  const username = $('#username').val().trim();
  if (!username) return;

  setLoading(true);
  userProfileContainer.empty().append('<p class="muted">Načítám uživatele…</p>');

  try {
    const userResp = await fetchUser(username);
    displayUser(userResp.data);
    const repositoriesResp = await fetchRepositories(userResp.data.login);
    displayRepositories(repositoriesResp.data);
  } catch (err) {
    console.error(err);
    const msg = (err?.response?.status === 404)
      ? 'User not found'
      : 'Chyba při volání GitHub API (zkontroluj CLIENT_ID/CLIENT_SECRET nebo limit API).';
    userProfileContainer.empty().append(`<p class="error">${escapeHtml(msg)}</p>`);
  } finally {
    setLoading(false);
  }
});

