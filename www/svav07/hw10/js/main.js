// GitHub API credentials
const CLIENT_ID = 'Ov23IiTmHrdcBIGzQLhH';
const CLIENT_SECRET = '7c833f9a649d720dae26a7160a607e328d371f74';
const BASE_API_URL = 'https://api.github.com';

// DOM references
const $form = $('#search-form');
const $input = $('#username');
const $userProfile = $('#user-profile');
const $reposContainer = $('#repositories');

// Fetch user data
const fetchUser = (username) => {
    const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}`;
    return $.ajax({
        url: url,
        method: 'GET',
        data: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }
    });
};

// Fetch repositories
const fetchRepositories = (login) => {
    const url = `${BASE_API_URL}/users/${encodeURIComponent(login)}/repos`;
    return $.ajax({
        url: url,
        method: 'GET',
        data: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            sort: 'updated',
            per_page: 67
        }
    });
};

// Display user info
const displayUser = (user) => {
    const createdDate = formatDate(user.created_at);

    const userHtml = `
        <div class="user-card">
            ${renderUserHeader(user)}
            <div class="user-body">
                ${renderUserLeft(user)}
                ${renderUserRight(user, createdDate)}
            </div>
        </div>
    `;

    $userProfile.empty().append(userHtml);
};

// Helpers
const formatDate = (isoDate) => {
    if (!isoDate) return 'N/A';
    return new Date(isoDate).toLocaleDateString('cs-CZ');
};

const renderUserHeader = (user) => `
    <div class="user-header">
        ${user.name ?? user.login}
    </div>
`;

const renderUserLeft = (user) => `
    <div class="user-left">
        <img src="${user.avatar_url}" alt="${user.login}" class="avatar-large">
        <a href="${user.html_url}" target="_blank" class="profile-button">
            View profile
        </a>
    </div>
`;

const renderUserRight = (user, createdDate) => `
    <div class="user-right">
        <div class="user-row">
            <span class="user-label">Login</span>
            <span class="user-value">${user.login}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Bio</span>
            <span class="user-value">${user.bio ?? '-'}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Location</span>
            <span class="user-value">${user.location ?? '-'}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Email</span>
            <span class="user-value">${user.email ?? '-'}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Followers</span>
            <span class="user-value">${user.followers}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Public repos</span>
            <span class="user-value">${user.public_repos}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Registered</span>
            <span class="user-value">${createdDate}</span>
        </div>
        <div class="user-row">
            <span class="user-label">Profile URL</span>
            <span class="user-value">
                <a href="${user.html_url}" target="_blank" class="profile-link">
                    ${user.html_url}
                </a>
            </span>
        </div>
    </div>
`;

const getLanguageInfo = (language) => {
    if (!language) {
        return { label: 'Unknown', className: 'lang-unknown' };
    }

    const normalized = language.toLowerCase();

    switch (normalized) {
        case 'javascript':
            return { label: 'JavaScript', className: 'lang-js' };
        case 'typescript':
            return { label: 'TypeScript', className: 'lang-ts' };
        case 'html':
        case 'html5':
            return { label: 'HTML', className: 'lang-html' };
        case 'css':
            return { label: 'CSS', className: 'lang-css' };
        case 'scss':
        case 'sass':
            return { label: 'SCSS', className: 'lang-scss' };
        case 'vue':
            return { label: 'Vue', className: 'lang-vue' };
        case 'react':
        case 'jsx':
            return { label: 'React', className: 'lang-react' };
        case 'tsx':
            return { label: 'TSX', className: 'lang-tsx' };
        case 'java':
            return { label: 'Java', className: 'lang-java' };
        case 'python':
            return { label: 'Python', className: 'lang-py' };
        case 'c#':
            return { label: 'C#', className: 'lang-csharp' };
        case 'c++':
            return { label: 'C++', className: 'lang-cpp' };
        case 'c':
            return { label: 'C', className: 'lang-c' };
        case 'php':
            return { label: 'PHP', className: 'lang-php' };
        case 'ruby':
            return { label: 'Ruby', className: 'lang-ruby' };
        case 'go':
            return { label: 'Go', className: 'lang-go' };
        case 'shell':
        case 'bash':
            return { label: 'Shell', className: 'lang-shell' };
        case 'kotlin':
            return { label: 'Kotlin', className: 'lang-kotlin' };
        case 'swift':
            return { label: 'Swift', className: 'lang-swift' };
        case 'dart':
            return { label: 'Dart', className: 'lang-dart' };
        case 'rust':
            return { label: 'Rust', className: 'lang-rust' };
        case 'r':
            return { label: 'R', className: 'lang-r' };
        case 'sql':
            return { label: 'SQL', className: 'lang-sql' };
        case 'perl':
            return { label: 'Perl', className: 'lang-perl' };
        case 'scala':
            return { label: 'Scala', className: 'lang-scala' };
        case 'lua':
            return { label: 'Lua', className: 'lang-lua' };
        case 'elixir':
            return { label: 'Elixir', className: 'lang-elixir' };
        case 'haskell':
            return { label: 'Haskell', className: 'lang-haskell' };
        case 'clojure':
            return { label: 'Clojure', className: 'lang-clojure' };
        case 'markdown':
        case 'md':
            return { label: 'Markdown', className: 'lang-markdown' };
        case 'mdx':
            return { label: 'MDX', className: 'lang-mdx' };
        case 'json':
            return { label: 'JSON', className: 'lang-json' };
        case 'yaml':
        case 'yml':
            return { label: 'YAML', className: 'lang-yaml' };
        case 'dockerfile':
            return { label: 'Docker', className: 'lang-docker' };
        default:
            return { label: language, className: 'lang-unknown' };
    }
};

// Display repository list
const displayRepositories = (repositories, user) => {
    const count = repositories.length;
    const name = user.name ?? user.login;

    $reposContainer.empty();

    $reposContainer.append(
        `<p class="repo-info">Načteno ${count} repozitářů uživatele ${name}</p>`
    );

    if (repositories.length === 0) {
        $reposContainer.append('<p>Tento uživatel nemá žádné veřejné repozitáře.</p>');
        return;
    }

    const $list = $('<ul></ul>');

    repositories.forEach(repo => {
        const { label, className } = getLanguageInfo(repo.language);

        $list.append(`
            <li class="repo-row">
                <div class="repo-name">
                    <a href="${repo.html_url}" target="_blank" class="repo-link">
                        ${repo.name}
                    </a>
                </div>
                <div class="repo-lang">
                    <span class="lang-pill ${className}">
                        <span class="lang-dot"></span>
                        ${label}
                    </span>
                </div>
                <div class="repo-stars">
                    ⭐ ${repo.stargazers_count}
                </div>
            </li>
        `);
    });

    $reposContainer.append('<h3>Repozitáře</h3>');
    $reposContainer.append($list);
};

// Handle form submit
$form.on('submit', async (event) => {
    event.preventDefault();

    const username = $input.val().trim();
    if (!username) return;

    $userProfile.html('<p>Načítám uživatele…</p>');
    $reposContainer.empty();

    try {
        const user = await fetchUser(username);
        displayUser(user);

        const repos = await fetchRepositories(user.login);
        const repositories = Array.isArray(repos) ? repos : repos.data || repos;

        displayRepositories(repositories, user);
    } catch (error) {
        console.error(error);
        
        if (error.status === 404) {
            $userProfile.html('<p>User not found</p>');
        } else {
            $userProfile.html('<p>Chyba při komunikaci s GitHub API.</p>');
        }

        $reposContainer.empty();
    }
});
