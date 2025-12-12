const CLIENT_ID = 'Ov23lif5mBeyHgRBLsIm';
const CLIENT_SECRET = '56f7e2705a3ad5b3435d8f3c5f46c97d28078203';
const BASE_API_URL = 'https://api.github.com';

const userProfileContainer = $('#user-profile');
const reposListContainer = $('#repos-list');

const getAuthParams = () => {
    if (CLIENT_ID && CLIENT_SECRET) {
        return `?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    }
    return '';
};

const fetchUser = async (username) => {
 
    const url = `${BASE_API_URL}/users/${username}${getAuthParams()}`;
    

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};

const fetchRepositories = async (userLogin) => {

    
    let url = `${BASE_API_URL}/users/${userLogin}/repos`;
    const auth = getAuthParams();
    

    url += auth ? auth + '&sort=updated' : '?sort=updated';

    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};

const displayUser = (user) => {
    userProfileContainer.empty(); 

    const userHtml = `
        <div class="user-card">
            <img src="${user.avatar_url}" alt="${user.login}">
            <div>
                <h2>${user.name || user.login}</h2>
                <p><strong>Bio:</strong> ${user.bio || 'No bio available'}</p>
                <p><strong>Followers:</strong> ${user.followers} | <strong>Following:</strong> ${user.following}</p>
                <a href="${user.html_url}" target="_blank">Show GitHub profile</a>
            </div>
        </div>
    `;
    userProfileContainer.append(userHtml);
};

const displayRepositories = (repositories) => {
    reposListContainer.empty();
    
    if (repositories.length === 0) {
        reposListContainer.append('<p>User has no repositories</p>');
        return;
    }

    reposListContainer.append('<h3>Last repositories:</h3>');

    repositories.forEach(repo => {
        const repoHtml = `
            <div class="repo-item">
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || 'Bez popisu'}</p>
                <small>⭐ ${repo.stargazers_count} | 🍴 ${repo.forks_count}</small>
            </div>
        `;
        reposListContainer.append(repoHtml);
    });
};

$('#search-form').submit(async (e) => {
    e.preventDefault(); 
    
    const username = $('#username').val().trim();
    if (!username) return;


    userProfileContainer.html('<p>Wait a little bit...</p>');
    reposListContainer.empty();

    try {
        const user = await fetchUser(username);
        
        displayUser(user);

        const repos = await fetchRepositories(user.login);
        
        displayRepositories(repos);

    } catch (err) {
        console.error(err);
        userProfileContainer.empty();
        reposListContainer.empty();
        
        if (err.status === 404) {
            userProfileContainer.append('<p class="error">User was not found</p>');
        } else {
            userProfileContainer.append('<p class="error">Error on API way</p>');
        }
    }
});