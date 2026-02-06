// Síťové/API funkce
(() => {
    window.App = window.App || {};
    const app = window.App;
    app.api = app.api || {};

    const getConfig = () => app.config || {};
    const getToken = () => (app.state && app.state.accessToken) ? app.state.accessToken : '';

    const buildUrl = (path, params = {}) => {
        const url = new URL(`https://api.deezer.com${path}`);
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                url.searchParams.set(key, value);
            }
        });
        return `${DEEZER_BASE}${encodeURIComponent(url.toString())}`;
    };

    const fetchJson = async (url, options = {}) => {
        const response = await fetch(url, { cache: 'no-store', ...options });
        const text = await response.text();
        let payload = {};

        try {
            payload = text ? JSON.parse(text) : {};
        } catch (error) {
            const shortText = text ? text.slice(0, 120) : 'No response body';
            throw new Error(`Request failed (${response.status}): ${shortText}`);
        }

        if (!response.ok) {
            const message = payload.error_description || payload.error || `Request failed (${response.status})`;
            const err = new Error(message);
            err.status = response.status;
            throw err;
        }

        return payload;
    };

    // Deezer base endpoints (proxied to bypass CORS)
    // Using corsproxy.io which mirrors response headers with Access-Control-Allow-Origin
    const DEEZER_BASE = 'https://corsproxy.io/?';
    const authHeaders = () => ({ });

    const parseDeezerDate = (dateStr) => {
        if (!dateStr) {
            return null;
        }
        if (dateStr.length === 4) {
            return new Date(`${dateStr}-01-01`);
        }
        if (dateStr.length === 7) {
            return new Date(`${dateStr}-01`);
        }
        return new Date(dateStr);
    };

    const mapAlbum = (album, artistNameFallback = '', releaseFallback = '') => ({
        id: album.id,
        name: album.title,
        artistName: (album.artist && album.artist.name) || artistNameFallback || '',
        artist: (album.artist && album.artist.name) || artistNameFallback || '',
        artists: [{ name: (album.artist && album.artist.name) || artistNameFallback || '' }],
        release_date: album.release_date || releaseFallback || '',
        total_tracks: album.nb_tracks
            || album.track_total
            || (album.tracks && Array.isArray(album.tracks.data) ? album.tracks.data.length : 0)
            || 0,
        images: album.cover_big ? [{ url: album.cover_big }, { url: album.cover_medium }] : [],
        coverUrl: album.cover_medium || album.cover_big || ''
    });

    const mapTrack = (track) => ({
        id: track.id,
        name: track.title,
        duration_ms: (track.duration || 0) * 1000,
        track_number: track.track_position || 0,
        artistName: (track.artist && track.artist.name) || '',
        artist: (track.artist && track.artist.name) || '',
        artists: [{ name: (track.artist && track.artist.name) || '' }],
        album: mapAlbum(
            track.album || {},
            (track.artist && track.artist.name) || '',
            (track.album && track.album.release_date) || track.release_date || ''
        ),
        coverUrl: (track.album && (track.album.cover_medium || track.album.cover_big)) || ''
    });

    const dedupeAlbumsPreferEarliestWithCover = (albums) => {
        const byKey = new Map();
        albums.forEach((album) => {
            const artistName = album.artists && album.artists.length ? album.artists[0].name : '';
            const key = `${(album.name || '').toLowerCase()}|${artistName.toLowerCase()}|${album.record_type || 'album'}`;
            const existing = byKey.get(key);
            if (!existing) {
                byKey.set(key, album);
                return;
            }
            const currentDate = parseDeezerDate(album.release_date);
            const existingDate = parseDeezerDate(existing.release_date);
            const isEarlier = currentDate && existingDate ? currentDate < existingDate : !!currentDate && !existingDate;
            const hasCover = !!album.coverUrl;
            const existingHasCover = !!existing.coverUrl;
            if (isEarlier) {
                byKey.set(key, album);
                return;
            }
            if (currentDate && existingDate && currentDate.getTime() === existingDate.getTime()) {
                if (hasCover && !existingHasCover) {
                    byKey.set(key, album);
                }
            } else if (!currentDate && existingDate) {
                // Prefer the one with a date; keep existing
                return;
            } else if (currentDate && !existingDate) {
                byKey.set(key, album);
            }
        });
        return Array.from(byKey.values());
    };

    async function fetchAlbumsByQuery(query, offset = 0, limit = 20) {
        const url = buildUrl('/search/album', { q: query, limit, index: offset });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        const mapped = items.map((a) => mapAlbum(a, a.artist ? a.artist.name : '', a.release_date || ''));
        const deduped = dedupeAlbumsPreferEarliestWithCover(mapped);
        return { albums: { items: deduped, total: data.total || deduped.length } };
    }

    async function fetchTracksByQuery(query, offset = 0, limit = 20) {
        const url = buildUrl('/search', { q: query, limit, index: offset });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        return { tracks: { items: items.map((t) => mapTrack(t)), total: data.total || items.length, next: data.next } };
    }

    async function fetchNewReleases(offset = 0, limit = 20) {
        const url = buildUrl('/editorial/0/releases', { limit, index: offset });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        const mapped = items.map((a) => mapAlbum(a, a.artist ? a.artist.name : '', a.release_date || ''));
        const deduped = dedupeAlbumsPreferEarliestWithCover(mapped);
        return { albums: { items: deduped, total: data.total || deduped.length } };
    }

    async function fetchTracksByAlbum(albumId) {
        const url = buildUrl(`/album/${albumId}/tracks`, { limit: 50 });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        return { items: items.map((t) => mapTrack({ ...t, album: { ...(t.album || {}), id: albumId } })) };
    }

    async function fetchArtistByName(artistName) {
        const url = buildUrl('/search/artist', { q: artistName, limit: 5 });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        if (!items.length) {
            return null;
        }
        const needle = artistName.trim().toLowerCase();
        const exact = items.find((artist) => (artist.name || '').toLowerCase() === needle);
        return exact || items[0] || null;
    }

    async function fetchArtistSuggestions(query, limit = 6) {
        const url = buildUrl('/search/artist', { q: query, limit });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        return items.map((artist) => ({ id: artist.id, name: artist.name }));
    }

    async function fetchArtistAlbums(artistId, offset = 0, limit = 49) {
        const url = buildUrl(`/artist/${artistId}/albums`, { limit, index: offset });
        const data = await fetchJson(url, { headers: authHeaders() });
        const items = Array.isArray(data.data) ? data.data : [];
        const mapped = items.map((a) => mapAlbum(a, a.artist ? a.artist.name : '', a.release_date || ''));
        const deduped = dedupeAlbumsPreferEarliestWithCover(mapped);
        return { items: deduped, next: data.next };
    }

    app.api.fetchAlbumsByQuery = fetchAlbumsByQuery;
    app.api.fetchTracksByQuery = fetchTracksByQuery;
    app.api.fetchNewReleases = fetchNewReleases;
    app.api.fetchTracksByAlbum = fetchTracksByAlbum;
    app.api.fetchArtistByName = fetchArtistByName;
    app.api.fetchArtistSuggestions = fetchArtistSuggestions;
    app.api.fetchArtistAlbums = fetchArtistAlbums;
})();