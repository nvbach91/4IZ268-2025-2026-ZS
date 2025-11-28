
const CLIENT_ID = 'Ov23liumpaVUe48QvSr6';     
const CLIENT_SECRET = '08085e047c2c8c50a814e8b40c23b584d237404a'; 

const BASE_API_URL = 'https://api.github.com';
const userProfileContainer = $('#user-profile');
const reposListContainer = $('#repos-list');


const fetchUser = async (username) => {
    
    const url = `${BASE_API_URL}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    
    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};


const fetchRepositories = async (username) => {

    const url = `${BASE_API_URL}/users/${username}/repos?sort=updated&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;
    
    return $.ajax({
        url: url,
        method: 'GET',
        dataType: 'json'
    });
};


const displayUser = (user) => {
    
    userProfileContainer.empty();
    
    const userHTML = `
        <div class="profile-card">
            <img src="${user.avatar_url}" alt="${user.login}">
            <div>
                <h2>${user.name || user.login}</h2>
                <p><strong>Login:</strong> ${user.login}</p>
                <p>${user.bio ? user.bio : 'Bez popisu'}</p>
                <p>📍 ${user.location || 'Neznámo'} | 🔗 <a href="${user.html_url}" target="_blank">Profil na GitHubu</a></p>
            </div>
        </div>
    `;
    
    userProfileContainer.append(userHTML);
};


const displayRepositories = (repositories) => {
    reposListContainer.empty();
    reposListContainer.append('<h3>Seznam repozitářů:</h3>');

    if (repositories.length === 0) {
        reposListContainer.append('<p>Uživatel nemá žádné veřejné repozitáře.</p>');
        return;
    }

    repositories.forEach(repo => {
        const repoHTML = `
            <div class="repo-item">
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || 'Bez popisu'}</p>
                <div class="repo-stats">
                    ⭐ Stars: ${repo.stargazers_count} | 🍴 Forks: ${repo.forks_count} | 🔤 Language: ${repo.language || 'Neznámý'}
                </div>
            </div>
        `;
        reposListContainer.append(repoHTML);
    });
};


const handleSearch = async () => {
    const username = $('#username-input').val().trim();

    if (!username) {
        alert('Prosím zadejte uživatelské jméno.');
        return;
    }


    userProfileContainer.empty();
    reposListContainer.empty();

    try {

        const user = await fetchUser(username);
        

        displayUser(user);

        
        const repos = await fetchRepositories(user.login);
        

        displayRepositories(repos);

    } catch (err) {
        console.error(err);
        
        if (err.status === 404) {
            userProfileContainer.html('<p class="error">Uživatel nebyl nalezen.</p>');
        } else {
            userProfileContainer.html('<p class="error">Došlo k chybě při komunikaci s API.</p>');
        }
    }
};


$(document).ready(() => {
    $('#search-btn').click(handleSearch);
    
    
    $('#username-input').keypress((e) => {
        if (e.which === 13) { 
            handleSearch();
        }
    });
});