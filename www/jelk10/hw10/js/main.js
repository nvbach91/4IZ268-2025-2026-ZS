const CLIENT_ID = 'Ov23ctjHaIqHbeAqLRFd';
const CLIENT_SECRET = '289d8fee49a4f805a402afee52420a150f6d88f2';
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile')
const userRepositoriesContainer = $('#user-repositories')
const searchButton = $('#search-button')
const searchInput = $('#search-input')

searchButton.on('click', () => {
    const value = searchInput.val()
    display(value)
})

searchInput.on('keypress', (e) => {
    if (e.key === 'Enter') {
        const value = searchInput.val();
        display(value);
    }
});

const fetchUser = async (username) => {
    const url = `${BASE_API_URL}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            return null;
        }
        return await resp.json();
    } catch (e) {
        return null;
    }
};

const fetchRepositories = async (username) => {
    const url = `${BASE_API_URL}/users/${username}/repos?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    try {
        const resp = await fetch(url);
        if (!resp.ok) {
            return null;
        }
        return await resp.json();
    } catch (e) {
        return null;
    }
};

const displayUser = (user) => {
    if (user == null) {
        userProfileContainer.empty()
        userRepositoriesContainer.empty()
        userProfileContainer.append($(`<div class="not-found">404 - User not found</div>`))
    } else {
        userProfileContainer.empty()
        const { avatar_url, bio, created_at, followers, following, location, login, public_repos, html_url } = user
        const profileElement = $(`
            <div class="user">
                <div class="user-name">${login}</div>
                <div class="user-image">
                <img src="${avatar_url}" alt="Image of user with username ${login}" height="250">
                </div>
                <div class="info">
                <div class="col-2">
                <div>Location</div>
                <div>Public repositories</div>
                <div>Following</div>
                <div>Followers</div>
                <div>Profile</div>
                <div>On GitHub since</div>
                <div>Bio</div>
                </div>
                <div class="col-2">
                <div>${location != null ? location : '-' }</div>
                <div>${public_repos}</div>
                <div>${following}</div>
                <div>${followers}</div>
                <div><a href="${html_url}">${login}</a></div>
                <div>${created_at.split('T')[0]}</div>
                <div>${bio != null ? bio : '-' }</div>
                </div>
                </div>
                
            </div>
            `)
        userProfileContainer.append(profileElement)
    }
};

const displayRepositories = (repositories) => {
    if (repositories == null) {
        return
    }
    userRepositoriesContainer.empty()
    repositories.forEach(repo => {
        const { name, html_url } = repo
        const repoElement = $(`
            <div class="row">
            <div class="col-2">
            <div>${name}</div>
            </div>
            <div class="col-2">
            <div><a href="${html_url}">link</a></div>
            </div>
            </div>
            `)
        userRepositoriesContainer.append(repoElement)
    });
}

const display = async (username) => {
    const user = await fetchUser(username)
    displayUser(user)
    const repos = await fetchRepositories(username)
    displayRepositories(repos)
}
