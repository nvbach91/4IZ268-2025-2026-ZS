// Static values
const CLIENT_ID = "Ov23li9b8H8KFMmlDLKD";
const CLIENT_SECRET = "14a99bb4ad881dc294abf47fc3b19562a503f070";
const API = "https://api.github.com";

// Fetching html elements
const searchOutput= $("#search-output");
const searchButton = $("#search-button");
const userContainer = $("#user-container");
const reposContainer = $("#repos-container");

// Initiation of the search function once a button is clicked
searchButton.on("click", (event) => {
    event.preventDefault(); // STOPS the form from reloading page after a search is conducted
    const searchInput = $(".search-input").val(); // Getting the username and imputing it into the function on the row below
    search(searchInput); // initiating the function
});

// Defining the search function
// MAIN function - fetches data using AJAX and when fetch is successful, it gives them to the display* functions
function search(username) {
    // Debugging log
    console.log(`DEBUG: search: Searched for user ${username}`);

    // Defining the URL
    const usernameURL = `${API}/users/${username}?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

    // Fetching data using AJAX
    $.ajax({
        url: usernameURL,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log("SUCCESS: search: User Data Response:", data);
            // Displaying data
            displayUserData(data);
        },
        error: function (err) {
            console.log("ERROR: search: User Data AJAX Error:", err);
        }
    });

    // Defining the URL
    const reposURL = `${API}/users/${username}/repos?sort=updated?client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`;

    // Fetching data using AJAX
    $.ajax({
        url: reposURL,
        method: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log("SUCCESS: search: Repos Data Response:", data);
            // Displaying data
            displayRepos(data);
        },
        error: function (err) {
            console.log("ERROR: search: Repos Data AJAX Error:", err);
        }
    });
}

// Displays user data
function displayUserData(userData) {
    // Clears all previous HTML elements
    userContainer.empty();
    console.log("DEBUG: displayUserData: userContainer cleared");

    // Create the user profile as a html element
    const userDataHTML = `
        <div class="username">${userData.login}</div>
        <div class="user-profile">
            <div class="profile-card">  
                <img src="${userData.avatar_url}" alt="User Avatar">
                <a href="${userData.html_url}">Visit profile</a>
            </div>
            <div class="profile-info">
                <div>Bio: ${userData.bio}</div>
                <div>Profile created: ${userData.created_at}</div>
                <div>Followers: ${userData.followers}</div>
                <div>Following: ${userData.following}</div>
                <div>Public repositories: ${userData.public_repos}</div>
            </div>
        </div>
    `;
    
    // Add the whole user profile to the html file
    userContainer.append(userDataHTML);
    
    // log the action happening
    console.log(`DEBUG: displayUserData: ${userDataHTML} appended`);
}

// Displays repositories
function displayRepos(repos) {
    // Clears all previous HTML elements
    reposContainer.empty();
    
    // Adds heading
    reposContainer.append(`
        <div class="repo-heading">Repositories</di>
    `)
    
    // IF the number of repositories in the received array is equal to 0, then display just a message
    // ElSE list all the repositories received
    if (repos.length === 0) {
        reposContainer.append(`
        <div class="no-repo-box">This user has no public repositories</di>
    `)} else {
        // Periodically adds all the repos to the html file
        for (let i = 0; i < repos.length; i++) {
            reposContainer.append(`
            <div class="repo-box">
                <div class="repo-name">${repos[i].name}</div>
                <a class="repo-url">${repos[i].html_url}</a>
            </div>    
        `);
            // logs each displayed repos name
            console.log(`DEBUG: displayRepos: ${repos[i].name} appended`);
        }
    }
}


