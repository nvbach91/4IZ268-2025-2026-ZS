// Network/API functions
async function exchangeCodeForToken(code) {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET)
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI
        })
    });
    
    return await response.json();
}

async function fetchAlbumsByArtist(artistName) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=artist:"${encodeURIComponent(artistName)}"&type=album&limit=20&market=US`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    
    return await response.json();
}

async function fetchTracksByAlbum(albumId) {
    const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
        headers: {
            'Authorization': 'Bearer ' + accessToken
        }
    });
    
    return await response.json();
}