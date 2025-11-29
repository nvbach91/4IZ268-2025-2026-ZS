const CLIENT_ID = 'Ov23li420UuA2kKURgpN'; 
const CLIENT_SECRET = 'caa1983d3ea6876cd791ba79d7a985dad5152fc4'; 
const BASE_API_URL = 'https://api.github.com';

const $userProfileContainer = $('#user-profile');
const $reposContainer = $('#repos-list');
const $reposTitle = $('#repos-title');
const $searchInput = $('#username-input');
const $searchBtn = $('#search-btn');

const fetchUser = async (username) => {
    let url = `${BASE_API_URL}/users/${username}`;
    
    if (CLIENT_ID && CLIENT_SECRET) {
        url += `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    }

    const response = await fetch(url);
    
    if (!response.ok) {
        throw new Error('User not found');
    }

    return await response.json();
};

const fetchRepositories = async (username) => {
    let url = `${BASE_API_URL}/users/${username}/repos?sort=updated`;

    if (CLIENT_ID && CLIENT_SECRET) {
        url += `&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Repositories not found');
    }

    return await response.json();
};

const displayUser = (user) => {
    const regDate = new Date(user.created_at).toLocaleDateString('cs-CZ');

    const html = `
        <div class="profile-header-bar">
            ${user.login}
        </div>
        <div class="profile-card">
            <div class="card-content">
                <div class="profile-image">
                    <img src="${user.avatar_url}" alt="${user.login}">
                </div>
                <div class="profile-details">
                    <div class="detail-row">
                        <span class="label">Login</span>
                        <span class="value">${user.login}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Bio</span>
                        <span class="value">${user.bio || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Location</span>
                        <span class="value">${user.location || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Company</span>
                        <span class="value">${user.company || '-'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Email</span>
                        <span class="value">${user.email || 'Not public'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Followers</span>
                        <span class="value">${user.followers}</span>
                    </div>
                    <div class="detail-row">
                        <span class="label">Registered</span>
                        <span class="value">${regDate}</span>
                    </div>
                </div>
            </div>
        </div>
        <a href="${user.html_url}" target="_blank" class="profile-link">View Full Profile</a>
    `;
    
    $userProfileContainer.html(html);
};

const displayRepositories = (repositories, totalCount, htmlUrl) => {
    $reposTitle.show();
    $reposContainer.empty();
    
    $reposTitle.text(`Repositories (Latest ${repositories.length} of ${totalCount})`);

    if (repositories.length === 0) {
        $reposContainer.html('<div class="repo-item">No public repositories found.</div>');
        return;
    }

    repositories.forEach(repo => {
        const repoHtml = `
            <div class="repo-item">
                <span>${repo.name}</span>
                <a href="${repo.html_url}" target="_blank">${repo.html_url}</a>
            </div>
        `;
        $reposContainer.append(repoHtml);
    });

    if (totalCount > repositories.length) {
        const remaining = totalCount - repositories.length;
        const viewMoreHtml = `
            <div class="repo-item" style="justify-content: center; background: #fff;">
                <a href="${htmlUrl}?tab=repositories" target="_blank" style="color: #666;">
                    ...and ${remaining} more. <strong>View all on GitHub</strong>
                </a>
            </div>
        `;
        $reposContainer.append(viewMoreHtml);
    }
};

const handleSearch = async () => {
    const username = $searchInput.val().trim();
    
    if (!username) {
        return;
    }

    $userProfileContainer.empty();
    $reposContainer.empty();
    $reposTitle.hide();
    
    $searchBtn.prop('disabled', true).text('Searching...');

    try {
        const user = await fetchUser(username);
        displayUser(user);

        const repos = await fetchRepositories(username);
        displayRepositories(repos, user.public_repos, user.html_url);

    } catch (err) {
        console.error(err);
        $userProfileContainer.html('<div class="error-message">User not found</div>');
    } finally {
        $searchBtn.prop('disabled', false).text('Find');
    }
};

$(document).ready(() => {
    $searchBtn.on('click', handleSearch);

    $searchInput.on('keypress', (e) => {
        if (e.which === 13) {
            handleSearch();
        }
    });
});