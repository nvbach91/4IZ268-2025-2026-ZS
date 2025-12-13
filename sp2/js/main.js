// Main application logic
const CLIENT_ID = '76cc8800f1e94cf8bd6a5e4527b96255';
const CLIENT_SECRET = '33b87d6e09d6406084fdd0a345935ba2';
const REDIRECT_URI = 'https://eso.vse.cz/~malj23/sp2/index.html';

let accessToken = '';

// Wait for document to be ready
$(document).ready(function() {
    // Set up login button handler
    setupLoginHandler();
    
    // Set up search button handler
    setupSearchHandler();

    // Check if we got redirected back with an authorization code
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');

    if (code) {
        renderLoginSuccess(code);
        handleTokenExchange(code);
    }
});

function setupLoginHandler() {
    loginBtn.off('click').on('click', function() {
        console.log('Login button clicked!');
        
        const scope = 'user-read-private user-read-email';
        
        const url = `https://accounts.spotify.com/authorize?` +
            `client_id=${CLIENT_ID}&` +
            `response_type=code&` +
            `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
            `scope=${encodeURIComponent(scope)}`;
        
        console.log('Generated URL:', url);
        window.location = url;
    });
}

function setupSearchHandler() {
    searchBtn.on('click', function() {
        if (!accessToken) {
            renderSearchWarning('Please login first!');
            return;
        }
        
        const artistName = artistInput.val().trim();
        if (!artistName) {
            renderSearchWarning('Please enter an artist name!');
            return;
        }
        
        handleSearch(artistName);
    });
    
    // Allow Enter key to search
    artistInput.on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            searchBtn.click();
        }
    });
}

async function handleTokenExchange(code) {
    try {
        const data = await exchangeCodeForToken(code);
        
        if (data.access_token) {
            accessToken = data.access_token;
            renderTokenSuccess();
            showLogoutButton();
        } else {
            renderTokenError(data);
        }
    } catch (error) {
        renderTokenError(error.message);
    }
}

function showLogoutButton() {
    renderLogoutButton();
    
    $('#logoutBtn').on('click', function() {
        logout();
    });
}

function logout() {
    accessToken = '';
    result.empty();
    searchResult.empty();
    loginBtn.show();
    
    setupLoginHandler();
    
    window.history.replaceState({}, document.title, window.location.pathname);
    renderLogoutSuccess();
}

async function handleSearch(artistName) {
    try {
        renderSearchLoading(artistName);
        
        const albumData = await fetchAlbumsByArtist(artistName);
        
        if (albumData.albums && albumData.albums.items.length > 0) {
            // Sort albums by release date (newest first)
            const sortedAlbums = albumData.albums.items.sort((a, b) => {
                const dateA = new Date(a.release_date);
                const dateB = new Date(b.release_date);
                return dateB - dateA;
            });
            
            // Get tracks from the most recent albums
            let allTracks = [];
            
            for (let i = 0; i < sortedAlbums.length && allTracks.length < 20; i++) {
                const album = sortedAlbums[i];
                
                const tracksData = await fetchTracksByAlbum(album.id);
                
                if (tracksData.items) {
                    // Add album info to each track
                    const tracksWithAlbumInfo = tracksData.items.map(track => ({
                        ...track,
                        album: {
                            name: album.name,
                            release_date: album.release_date,
                            id: album.id,
                            images: album.images
                        }
                    }));
                    
                    allTracks.push(...tracksWithAlbumInfo);
                }
            }
            
            // Sort all tracks by album release date (newest first) and take top 20
            const recentTracks = allTracks
                .sort((a, b) => {
                    const dateA = new Date(a.album.release_date);
                    const dateB = new Date(b.album.release_date);
                    return dateB - dateA;
                })
                .slice(0, 20);
            
            if (recentTracks.length > 0) {
                renderSearchResults(recentTracks, artistName);
            } else {
                renderSearchWarning(`No tracks found for "${artistName}"`);
            }
        } else {
            renderSearchWarning(`No albums found for "${artistName}"`);
        }
        
    } catch (error) {
        renderSearchError(error.message);
    }
}


