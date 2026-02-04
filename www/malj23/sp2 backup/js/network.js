// Síťové/API funkce
(() => {
    window.App = window.App || {};
    const app = window.App;
    app.api = app.api || {};

    const getConfig = () => app.config || {};
    const getToken = () => (app.state && app.state.accessToken) ? app.state.accessToken : '';

    const fetchJson = async (url, options = {}) => {
        const response = await fetch(url, options);
        return response.json();
    };

    const authHeaders = () => ({
        Authorization: `Bearer ${getToken()}`
    });

    async function exchangeCodeForToken(code) {
        const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = getConfig();
        return fetchJson('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI
            })
        });
    }

    async function fetchAlbumsByQuery(query, offset = 0, limit = 20) {
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=${limit}&offset=${offset}&market=US`;
        return fetchJson(url, { headers: authHeaders() });
    }

    async function fetchTracksByQuery(query, offset = 0, limit = 20) {
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}&offset=${offset}&market=US`;
        return fetchJson(url, { headers: authHeaders() });
    }

    async function fetchNewReleases(offset = 0, limit = 20) {
        const url = `https://api.spotify.com/v1/browse/new-releases?limit=${limit}&offset=${offset}&country=US`;
        return fetchJson(url, { headers: authHeaders() });
    }

    async function fetchTracksByAlbum(albumId) {
        const url = `https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`;
        return fetchJson(url, { headers: authHeaders() });
    }

    async function fetchArtistByName(artistName) {
        const query = `artist:"${artistName}"`;
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=20`;
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = data && data.artists && data.artists.items ? data.artists.items : [];
        if (!items.length) {
            return null;
        }

        const needle = artistName.trim().toLowerCase();
        const exact = items.find((artist) => artist.name.toLowerCase() === needle);
        return exact || null;
    }

    async function fetchArtistSuggestions(query, limit = 6) {
        const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=${limit}`;
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = data && data.artists && data.artists.items ? data.artists.items : [];
        return items;
    }

    async function fetchArtistAlbums(artistId, offset = 0, limit = 50) {
        const url = `https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single&limit=${limit}&offset=${offset}&market=US`;
        return fetchJson(url, { headers: authHeaders() });
    }

    app.api.exchangeCodeForToken = exchangeCodeForToken;
    app.api.fetchAlbumsByQuery = fetchAlbumsByQuery;
    app.api.fetchTracksByQuery = fetchTracksByQuery;
    app.api.fetchNewReleases = fetchNewReleases;
    app.api.fetchTracksByAlbum = fetchTracksByAlbum;
    app.api.fetchArtistByName = fetchArtistByName;
    app.api.fetchArtistSuggestions = fetchArtistSuggestions;
    app.api.fetchArtistAlbums = fetchArtistAlbums;
})();