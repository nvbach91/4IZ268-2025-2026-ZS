const CLIENT_ID = 'Ov23liDlbzYFyF6eW7p4';
        const CLIENT_SECRET = '6da76b875d8e7c2545d80add006c41d9705130ce';
        const BASE_API_URL = 'https://api.github.com';

        const $userProfileContainer = $('#user-profile');
        const $reposContainer = $('#repos');
        const $message = $('#message');
        const $reposHeading = $('#repos-heading');

        const fetchUser = (username) => {
            const url = `${BASE_API_URL}/users/${encodeURIComponent(username)}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
            return $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
        };

        const fetchRepositories = (userLogin) => {
            const url = `${BASE_API_URL}/users/${encodeURIComponent(userLogin)}/repos` +
                `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&sort=updated&per_page=100`;
            return $.ajax({
                url: url,
                method: 'GET',
                dataType: 'json'
            });
        };

        const displayUser = (user) => {
            $userProfileContainer.empty();
            $reposContainer.empty();
            $reposHeading.addClass('d-none');

            const createdAt = user.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : 'N/A';

            const html = `
        <div class="card mb-3">
            <div class="card-body d-flex">
                <div class="me-4 text-center">
                    <img src="${user.avatar_url}" alt="${user.login} avatar"
                         class="img-fluid rounded-circle mb-2">
                    <p>
                        <a href="${user.html_url}" target="_blank"
                           class="btn btn-sm btn-outline-primary">
                            Zobrazit profil
                        </a>
                    </p>
                </div>
                <div class="flex-grow-1">
                    <h2 class="h4 mb-2">
                        ${user.name ? user.name : ''}
                        <small class="text-muted">@${user.login}</small>
                    </h2>
                    ${user.bio ? `<p>${user.bio}</p>` : ''}

                    <div class="mb-2">
                        <span class="badge bg-primary me-1">Repozitáře: ${user.public_repos}</span>
                        <span class="badge bg-secondary me-1">Gists: ${user.public_gists}</span>
                        <span class="badge bg-success me-1">Followers: ${user.followers}</span>
                        <span class="badge bg-info text-dark">Following: ${user.following}</span>
                    </div>

                    <ul class="list-group list-group-flush">
                        ${user.company ? `<li class="list-group-item"><strong>Company:</strong> ${user.company}</li>` : ''}
                        ${user.blog ? `<li class="list-group-item"><strong>Web:</strong> <a href="${user.blog.startsWith('http') ? user.blog : 'https://' + user.blog}" target="_blank">${user.blog}</a></li>` : ''}
                        ${user.location ? `<li class="list-group-item"><strong>Location:</strong> ${user.location}</li>` : ''}
                        <li class="list-group-item"><strong>Member since:</strong> ${createdAt}</li>
                    </ul>
                </div>
            </div>
        </div>
        `;

            $userProfileContainer.append(html);
        };

        const displayRepositories = (repositories) => {
            $reposContainer.empty();

            if (!repositories || repositories.length === 0) {
                $reposContainer.append('<p>Tento uživatel nemá žádné veřejné repozitáře.</p>');
                return;
            }

            $reposHeading.removeClass('d-none');

            $.each(repositories, function (_, repo) {
                const html = `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h3 class="h6 mb-1">
                            <a href="${repo.html_url}" target="_blank">${repo.name}</a>
                        </h3>
                        ${repo.description ? `<p class="mb-0 small text-muted">${repo.description}</p>` : ''}
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary me-1">Stars: ${repo.stargazers_count}</span>
                        <span class="badge bg-secondary me-1">Watchers: ${repo.watchers_count}</span>
                        <span class="badge bg-success">Forks: ${repo.forks_count}</span>
                    </div>
                </div>
            </div>
            `;
                $reposContainer.append(html);
            });
        };

        const showMessage = (text, type = 'danger') => {
            $message.empty();
            if (!text) return;
            $message.append(`<div class="alert alert-${type}">${text}</div>`);
        };

        $('#search-form').on('submit', function (e) {
            e.preventDefault();

            const username = $('#username-input').val().trim();

            $message.empty();
            $userProfileContainer.empty();
            $reposContainer.empty();
            $reposHeading.addClass('d-none');

            if (!username) {
                showMessage('Zadejte prosím uživatelské jméno.', 'warning');
                return;
            }

            showMessage('Načítám data z GitHubu…', 'info');

            (async () => {
                try {
                    const user = await fetchUser(username);
                    showMessage('');
                    displayUser(user);

                    const repos = await fetchRepositories(user.login);
                    displayRepositories(repos);

                } catch (err) {
                    console.error(err);

                    if (err && err.status === 404) {
                        showMessage('Uživatel nebyl nalezen.', 'warning');
                    } else if (err && err.status === 403) {
                        showMessage('Byl překročen limit GitHub API (HTTP 403). Zkuste to později nebo použijte vlastní OAuth údaje.', 'warning');
                    } else {
                        showMessage('Při načítání dat došlo k chybě.', 'danger');
                    }
                }
            })();
        });