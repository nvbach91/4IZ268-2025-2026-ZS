// Rendering functions
function renderLoginSuccess(code) {
    result.html(`<div class="alert alert-success">Success! Got authorization code: ${code.substring(0, 20)}...</div>`);
}

function renderTokenSuccess() {
    result.append(`<div class="alert alert-success mt-2">Got access token! Ready to use Spotify API.</div>`);
}

function renderTokenError(error) {
    result.append(`<div class="alert alert-danger mt-2">Failed to get access token: ${JSON.stringify(error)}</div>`);
}

function renderLogoutButton() {
    loginBtn.hide();
    result.append(`<button id="logoutBtn" class="btn btn-danger mt-2">Logout</button>`);
}

function renderLogoutSuccess() {
    result.html(`<div class="alert alert-info">Logged out successfully!</div>`);
}

function renderSearchResults(tracks, artistName) {
    let html = `<h4>20 Most Recent Tracks by ${artistName}</h4>`;
    
    tracks.forEach((track, index) => {
        const releaseDate = new Date(track.album.release_date);
        const releaseDateStr = releaseDate.toLocaleDateString();
        
        html += `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${index + 1}. ${track.name}</h6>
                    <p class="card-text">
                        <strong>Artist:</strong> ${track.artists[0].name}<br>
                        <strong>Album:</strong> ${track.album.name}<br>
                        <strong>Release Date:</strong> ${releaseDateStr}<br>
                        <strong>Duration:</strong> ${Math.floor(track.duration_ms / 60000)}:${String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}<br>
                        <strong>Track Number:</strong> ${track.track_number}
                    </p>
                </div>
            </div>
        `;
    });
    
    searchResult.html(html);
}

function renderSearchLoading(artistName) {
    searchResult.html(`<div class="alert alert-info">Searching for recent tracks by ${artistName}...</div>`);
}

function renderSearchError(message) {
    searchResult.html(`<div class="alert alert-danger">Error: ${message}</div>`);
}

function renderSearchWarning(message) {
    searchResult.html(`<div class="alert alert-warning">${message}</div>`);
}