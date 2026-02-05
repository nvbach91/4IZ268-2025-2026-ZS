const CLIENT_ID = '76cc8800f1e94cf8bd6a5e4527b96255';
const CLIENT_SECRET = '33b87d6e09d6406084fdd0a345935ba2';
const REDIRECT_URI = 'https://eso.vse.cz/~malj23/sp2/index.html';
const ACCESS_TOKEN_KEY = 'sp2_access_token';
const ACCESS_TOKEN_EXPIRY_KEY = 'sp2_access_token_expires_at';

window.App = window.App || {};
const app = window.App;
app.config = app.config || { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI };
app.state = app.state || {};

const el = app.elements || {};
const $get = (cached, selector) => (cached && cached.length) ? cached : $(selector);

const state = {
    accessToken: app.state.accessToken || '',
    currentSearch: null,
    currentResults: [],
    pageLimit: 20,
    searchCacheKey: 'sp2_search_cache'
};

// Omezíme počet alb, pro která taháme tracklist, aby se nesesypaly requesty (429).
const MAX_ALBUMS_PER_TRACK_FETCH = 8;

const ENTER_DELAY_MS = 350;

app.state.accessToken = state.accessToken;

$(document).ready(function() {
    restoreAccessToken();
    setupLoginHandler();
    setupSearchHandler();
    setupArtistSuggestions();
    setupViewSwitch();
    localStorage.removeItem(state.searchCacheKey);

    const code = new URLSearchParams(window.location.search).get('code');
    if (code) {
        app.renderLoginSuccess(code);
        handleTokenExchange(code);
    }
});

function setupViewSwitch() {
    const $navSearch = $get(el.navSearch, '#navSearch');
    const $navWishlist = $get(el.navWishlist, '#navWishlist');
    const $viewSearch = $get(el.viewSearch, '#viewSearch');
    const $viewWishlist = $get(el.viewWishlist, '#viewWishlist');

    if (!$navSearch.length || !$navWishlist.length || !$viewSearch.length || !$viewWishlist.length) {
        return;
    }

    const activateView = (view) => {
        const isSearch = view === 'search';
        $viewSearch.prop('hidden', !isSearch);
        $viewWishlist.prop('hidden', isSearch);
        $navSearch.toggleClass('pill-active', isSearch).attr('aria-current', isSearch ? 'page' : null);
        $navWishlist.toggleClass('pill-active', !isSearch).attr('aria-current', !isSearch ? 'page' : null);

        if (!isSearch) {
            if (typeof app.wishlist?.refreshLastSaved === 'function') {
                app.wishlist.refreshLastSaved();
            }
            if (typeof app.wishlist?.renderWishlistView === 'function') {
                app.wishlist.renderWishlistView();
            }
        }
    };

    $navSearch.on('click', () => activateView('search'));
    $navWishlist.on('click', () => activateView('wishlist'));
}

function restoreAccessToken() {
    const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const storedExpiry = localStorage.getItem(ACCESS_TOKEN_EXPIRY_KEY);
    const expiry = storedExpiry ? Number(storedExpiry) : 0;

    if (storedToken && (!expiry || Date.now() < expiry)) {
        state.accessToken = storedToken;
        app.state.accessToken = storedToken;
        app.renderTokenSuccess();
        showLogoutButton();
    }
}

function setupLoginHandler() {
    const $loginBtn = $get(el.loginBtn, '#loginBtn');
    if (!$loginBtn.length) {
        return;
    }

    $loginBtn.off('click').on('click', function() {
        if (app && typeof app.setLoading === 'function') {
            app.setLoading(true, 'Přihlašuji...');
        }

        const scope = 'user-read-private user-read-email';
        const url = new URL('https://accounts.spotify.com/authorize');
        url.search = new URLSearchParams({
            client_id: CLIENT_ID,
            response_type: 'code',
            redirect_uri: REDIRECT_URI,
            scope
        }).toString();

        window.location = url.toString();
    });
}

function setupSearchHandler() {
    setupGenreInputs();
    setupSearchTypeSwitch();
    setupLoadMoreHandler();

    const $searchBtn = $get(el.searchBtn, '#searchBtn');
    const $artistInput = $get(el.artistInput, '#artistInput');
    const $genreInput = $get(el.genreInput, '#genreInput');
    const $genreSelect = $get(el.genreSelect, '#genreSelect');
    const $releaseFromInput = $get(el.releaseFromInput, '#releaseFromInput');
    const $releaseToInput = $get(el.releaseToInput, '#releaseToInput');
    const $searchTypeSelect = $get(el.searchTypeSelect, '#searchTypeSelect');
    const $filtersForm = $get(el.filtersForm, '#filtersForm');

    if (!$searchBtn.length) {
        return;
    }

    const runSearch = function(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        if (!state.accessToken) {
            app.renderSearchWarning('Nejprve se přihlaste.');
            return;
        }

        const artistName = $artistInput.val().trim();
        const genreText = $genreInput.val().trim();
        const genrePick = $genreSelect.val();
        const genre = genreText || genrePick;
        const releaseFrom = $releaseFromInput.val();
        const releaseTo = $releaseToInput.val();
        const searchType = $searchTypeSelect.val() || 'track';

        if (!artistName) {
            app.renderSearchWarning('Vyberte interpreta.');
            updateLoadMoreButton(0, 0);
            return;
        }

        if (releaseFrom && releaseTo && releaseFrom > releaseTo) {
            app.renderSearchWarning('Datum vydání Od musí být dříve než Do.');
            return;
        }

        state.currentSearch = {
            artistName,
            genre,
            releaseFrom,
            releaseTo,
            searchType,
            offset: 0,
            total: 0,
            tracksCache: null,
            cacheKey: null,
            albumsCache: null,
            cacheKeyAlbum: null,
            tracksByAlbumCache: new Map(),
            artistId: null
        };
        state.currentResults = [];
        handleSearch(state.currentSearch);
    };

    $searchBtn.on('click', runSearch);
    if ($filtersForm.length) {
        $filtersForm.on('submit', runSearch);
    }
/*
    $artistInput
        .add($genreInput)
        .add($genreSelect)
        .add($releaseFromInput)
        .add($releaseToInput)
        .add($searchTypeSelect)
        .on('keypress', function(event) {
            if (event.which === 13) {
                $searchBtn.click();
                
            }
        });
*/


   $artistInput
        .add($genreInput)
        .add($genreSelect)
        .add($releaseFromInput)
        .add($releaseToInput)
        .add($searchTypeSelect)
        .on('keypress', function(event) {
            if (event.which === 13) {
                event.preventDefault();
                setTimeout(() => $searchBtn.click(), ENTER_DELAY_MS);
            }
        });

}

function setupArtistSuggestions() {
    const $artistInput = $get(el.artistInput, '#artistInput');
    const $list = $get(el.artistSuggestions, '#artistSuggestions');
    if (!$artistInput.length || !$list.length) {
        return;
    }

    let timer = null;
    let requestId = 0;

    const hideList = () => {
        $list.prop('hidden', true).empty();
    };

    const showList = (items) => {
        if (!items.length) {
            hideList();
            return;
        }

        const html = items.map((artist) => `
            <div class='suggestion-item' data-name='${artist.name}'>
                ${artist.name}
            </div>
        `).join('');

        $list.html(html).prop('hidden', false);
    };

    $artistInput.on('input', function() {
        const value = $(this).val().trim();
        if (!value || value.length < 2 || !state.accessToken) {
            hideList();
            return;
        }

        clearTimeout(timer);
        timer = setTimeout(async () => {
            const currentReq = ++requestId;
            try {
                const items = await app.api.fetchArtistSuggestions(value, 6);
                if (currentReq !== requestId) {
                    return;
                }
                showList(items);
            } catch (error) {
                hideList();
            }
        }, 300);
    });

    $artistInput.on('keydown', function(event) {
        if (event.key === 'Escape') {
            hideList();
        }
        if (event.key === 'Enter') {
            clearTimeout(timer);
            timer = null;
            requestId++;
            hideList();
        }
    });

    $artistInput.on('blur', function() {
        setTimeout(hideList, 150);
    });

    $list.on('click', '.suggestion-item', function() {
        const name = $(this).data('name');
        if (name) {
            $artistInput.val(name);
        }
        hideList();
    });
}

function setupLoadMoreHandler() {
    const $loadMoreBtn = $get(el.loadMoreBtn, '#loadMoreBtn');
    if (!$loadMoreBtn.length) {
        return;
    }

    $loadMoreBtn.prop('disabled', true);
    $loadMoreBtn.on('click', function() {
        if (!state.currentSearch) {
            return;
        }
        const nextOffset = state.currentSearch.offset + state.pageLimit;
        if (state.currentSearch.total && nextOffset >= state.currentSearch.total) {
            return;
        }
        state.currentSearch.offset = nextOffset;
        handleSearch(state.currentSearch, true);
    });
}

function setupSearchTypeSwitch() {
    const $switchEl = $get(el.searchTypeSwitch, '#searchTypeSwitch');
    const $searchTypeSelect = $get(el.searchTypeSelect, '#searchTypeSelect');
    if (!$switchEl.length || !$searchTypeSelect.length) {
        return;
    }

    setSearchTypeUI($searchTypeSelect.val() || 'track');

    $switchEl.on('click', '.pill', function() {
        const nextType = $(this).data('type');
        if (!nextType) {
            return;
        }
        setSearchTypeUI(nextType);

        if (!state.currentSearch) {
            return;
        }

        state.currentSearch.searchType = nextType;
        state.currentSearch.offset = 0;
        state.currentResults = [];

        const cacheKey = buildCacheKey(state.currentSearch);
        if (nextType === 'album' && state.currentSearch.albumsCache && state.currentSearch.cacheKeyAlbum === cacheKey) {
            renderFromAlbumCache(state.currentSearch);
            return;
        }

        if (nextType === 'track' && state.currentSearch.tracksCache && state.currentSearch.cacheKey === cacheKey) {
            renderFromTrackCache(state.currentSearch);
            return;
        }

        handleSearch(state.currentSearch);
    });
}

function setSearchTypeUI(type) {
    const $switchEl = $get(el.searchTypeSwitch, '#searchTypeSwitch');
    const $searchTypeSelect = $get(el.searchTypeSelect, '#searchTypeSelect');
    const $searchBtn = $get(el.searchBtn, '#searchBtn');
    if (!$switchEl.length || !$searchTypeSelect.length) {
        return;
    }

    $switchEl.find('.pill').removeClass('pill-active');
    $switchEl.find(`[data-type='${type}']`).addClass('pill-active');
    $searchTypeSelect.val(type);
    $searchBtn.text('Hledat');
}

function buildCacheKey(filters) {
    return `${filters.artistName}|${filters.genre}|${filters.releaseFrom || ''}|${filters.releaseTo || ''}`;
}

function renderFromAlbumCache(filters) {
    const filteredAlbums = filterAlbumsByReleaseDate(filters.albumsCache || [], filters.releaseFrom, filters.releaseTo);
    const recentAlbums = filteredAlbums
        .sort((a, b) => parseSpotifyDate(b.release_date) - parseSpotifyDate(a.release_date))
        .slice(0, state.pageLimit);

    filters.total = filteredAlbums.length;
    state.currentResults = recentAlbums;
    app.renderAlbumResults(state.currentResults, buildSearchLabel(filters), filters.genre);
    updateLoadMoreButton(filters.offset || 0, filters.total || 0);
}

function renderFromTrackCache(filters) {
    const pageItems = (filters.tracksCache || []).slice(0, state.pageLimit);
    filters.total = (filters.tracksCache || []).length;
    state.currentResults = pageItems;
    app.renderSearchResults(state.currentResults, `Nejnovější skladby od ${filters.artistName}`, filters.genre || '');
    updateLoadMoreButton(filters.offset || 0, filters.total || 0);
}

async function ensureArtistAlbumsCache(filters, cacheKey) {
    if (filters.cacheKeyAlbum === cacheKey && filters.albumsCache && filters.albumsCache.length > 0) {
        return true;
    }

    const artistData = await app.api.fetchArtistByName(filters.artistName);
    if (!artistData || !artistData.id) {
        return false;
    }

    if (filters.genre) {
        const genres = artistData.genres || [];
        const match = genres.some((g) => g.toLowerCase().includes(filters.genre.toLowerCase()));
        if (!match) {
            return false;
        }
    }

    filters.artistId = artistData.id;
    filters.albumsCache = await fetchAllArtistAlbums(artistData.id);
    filters.cacheKeyAlbum = cacheKey;
    return filters.albumsCache.length > 0;
}

async function buildTracksFromAlbums(filters) {
    const albums = (filters.albumsCache || [])
        .slice()
        .sort((a, b) => parseSpotifyDate(b.release_date) - parseSpotifyDate(a.release_date))
        .slice(0, MAX_ALBUMS_PER_TRACK_FETCH);
    let tracks = [];

    if (!filters.tracksByAlbumCache || !(filters.tracksByAlbumCache instanceof Map)) {
        filters.tracksByAlbumCache = new Map();
    }

    for (const album of albums) {
        if (filters.tracksByAlbumCache.has(album.id)) {
            tracks = tracks.concat(filters.tracksByAlbumCache.get(album.id));
            continue;
        }

        const tracksData = await app.api.fetchTracksByAlbum(album.id);
        if (!tracksData.items) {
            continue;
        }

        const albumTracks = tracksData.items.map((track) => ({
            ...track,
            album: {
                name: album.name,
                release_date: album.release_date,
                id: album.id,
                images: album.images
            }
        }));

        filters.tracksByAlbumCache.set(album.id, albumTracks);
        tracks = tracks.concat(albumTracks);
    }

    const filteredTracks = filterTracksByReleaseDate(tracks, filters.releaseFrom, filters.releaseTo);
    return filteredTracks.sort((a, b) => parseSpotifyDate(b.album.release_date) - parseSpotifyDate(a.album.release_date));
}

async function buildTracksFromSearchQuery(query, releaseFrom, releaseTo, pages = 3, relaxIfEmpty = false) {
    let tracks = [];

    for (let page = 0; page < pages; page++) {
        const offset = page * state.pageLimit;
        const data = await app.api.fetchTracksByQuery(query, offset, state.pageLimit);
        const items = data.tracks && data.tracks.items ? data.tracks.items : [];
        tracks = tracks.concat(items);

        if (!data.tracks || !data.tracks.next) {
            break;
        }
    }

    const filteredTracks = filterTracksByReleaseDate(tracks, releaseFrom, releaseTo);
    if (!filteredTracks.length && relaxIfEmpty) {
        const fallback = dedupeTracks(tracks);
        return fallback.sort((a, b) => parseSpotifyDate(b.album.release_date) - parseSpotifyDate(a.album.release_date));
    }

    const deduped = dedupeTracks(filteredTracks);
    return deduped.sort((a, b) => parseSpotifyDate(b.album.release_date) - parseSpotifyDate(a.album.release_date));
}

function setupGenreInputs() {
    const $genreSelect = $get(el.genreSelect, '#genreSelect');
    const $genreInput = $get(el.genreInput, '#genreInput');
    if (!$genreSelect.length || !$genreInput.length) {
        return;
    }

    $genreSelect.on('change', function() {
        const selected = $(this).val();
        if (selected) {
            $genreInput.val('');
            $genreInput.prop('disabled', true);
        } else {
            $genreInput.prop('disabled', false);
        }
    });

    $genreInput.on('input', function() {
        if ($(this).val().trim()) {
            $genreSelect.val('');
        }
    });
}

async function handleTokenExchange(code) {
    try {
        const data = await app.api.exchangeCodeForToken(code);
        if (data.access_token) {
            state.accessToken = data.access_token;
            app.state.accessToken = state.accessToken;
            persistAccessToken(data);
            app.renderTokenSuccess();
            showLogoutButton();
        } else {
            app.renderTokenError(data);
            clearStoredAccessToken();
        }
    } catch (error) {
        app.renderTokenError(error.message);
        clearStoredAccessToken();
    } finally {
        // Remove the one-time code from the URL to avoid reusing it on refresh (invalid_grant)
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

function showLogoutButton() {
    app.renderLogoutButton();
    $('#logoutBtn').on('click', function() {
        logout();
    });
}

function logout() {
    state.accessToken = '';
    app.state.accessToken = '';
    clearStoredAccessToken();
    $get(el.result, '#result').empty();
    $get(el.searchResult, '#searchResult').empty();
    $get(el.loginBtn, '#loginBtn').show();
    setupLoginHandler();
    window.history.replaceState({}, document.title, window.location.pathname);
    app.renderLogoutSuccess();
}

function persistAccessToken(data) {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    if (data.expires_in) {
        const expiresAt = Date.now() + Number(data.expires_in) * 1000;
        localStorage.setItem(ACCESS_TOKEN_EXPIRY_KEY, String(expiresAt));
    } else {
        localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
    }
}

function clearStoredAccessToken() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(ACCESS_TOKEN_EXPIRY_KEY);
}

async function handleSearch(filters, append = false) {
    const warn = (message) => {
        app.renderSearchWarning(message);
        updateLoadMoreButton(filters.offset || 0, filters.total || 0);
    };

    const setResults = (items, renderer, label, genreLabel, dedupe = false) => {
        if (!items.length) {
            return false;
        }
        state.currentResults = append ? state.currentResults.concat(items) : items;
        if (dedupe) {
            state.currentResults = dedupeTracks(state.currentResults);
        }
        renderer(state.currentResults, label, genreLabel);
        cacheSearchState(filters, state.currentResults);
        return true;
    };

    const getPage = (items) => items.slice(filters.offset || 0, (filters.offset || 0) + state.pageLimit);

    try {
        const { artistName, genre, releaseFrom, releaseTo, searchType } = filters;
        const effectiveReleaseFrom = releaseFrom || '';
        const effectiveReleaseTo = releaseTo || '';
        const searchQuery = buildSearchQuery(artistName, genre);
        const searchLabel = buildSearchLabel(filters);
        const albumLabel = buildSearchLabel(filters, { includeArtist: false });
        const cacheKey = buildCacheKey(filters);

        if (!append) {
            app.renderSearchLoading(searchLabel, searchType);
        }

        if (searchType === 'album') {
            if (artistName) {
                const cacheReady = await ensureArtistAlbumsCache(filters, cacheKey);
                if (!cacheReady) {
                    warn('Pro zadané filtry nebyla nalezena žádná alba.');
                    return;
                }

                const filteredAlbums = filterAlbumsByReleaseDate(filters.albumsCache || [], effectiveReleaseFrom, effectiveReleaseTo);
                const recentAlbums = filteredAlbums
                    .sort((a, b) => parseSpotifyDate(b.release_date) - parseSpotifyDate(a.release_date))
                    .slice(filters.offset || 0, (filters.offset || 0) + state.pageLimit);
                filters.total = filteredAlbums.length;

                if (!setResults(recentAlbums, app.renderAlbumResults, albumLabel, genre, true)) {
                    warn('Pro zadané filtry nebyla nalezena žádná alba.');
                }
            } else if (!searchQuery) {
                const albumData = await app.api.fetchNewReleases(filters.offset || 0, state.pageLimit);
                const items = albumData.albums && albumData.albums.items ? albumData.albums.items : [];
                if (!items.length) {
                    warn('Pro zadané filtry nebyla nalezena žádná alba.');
                    return;
                }

                filters.total = albumData.albums.total || 0;
                const filteredAlbums = filterAlbumsByReleaseDate(items, effectiveReleaseFrom, effectiveReleaseTo);
                const recentAlbums = filteredAlbums
                    .sort((a, b) => parseSpotifyDate(b.release_date) - parseSpotifyDate(a.release_date))
                    .slice(0, state.pageLimit);

                if (!setResults(recentAlbums, app.renderAlbumResults, albumLabel, genre)) {
                    warn('Pro zadané filtry nebyla nalezena žádná alba.');
                }
            } else {
                const albumData = await app.api.fetchAlbumsByQuery(searchQuery, filters.offset || 0, state.pageLimit);
                const items = albumData.albums && albumData.albums.items ? albumData.albums.items : [];
                if (!items.length) {
                    warn('Pro zadané filtry nebyla nalezena žádná alba.');
                    return;
                }

                filters.total = albumData.albums.total || 0;
                const filteredAlbums = filterAlbumsByReleaseDate(items, releaseFrom, releaseTo);
                const recentAlbums = filteredAlbums
                    .sort((a, b) => parseSpotifyDate(b.release_date) - parseSpotifyDate(a.release_date))
                    .slice(0, state.pageLimit);

                if (!setResults(recentAlbums, app.renderAlbumResults, albumLabel, genre)) {
                    warn('Pro zadané filtry nebyla nalezena žádná alba.');
                }
            }
        } else {
            if (artistName) {
                const cacheReady = await ensureArtistAlbumsCache(filters, cacheKey);
                if (!cacheReady) {
                    warn('Pro zadané filtry nebyly nalezeny žádné skladby.');
                    return;
                }

                if (!filters.tracksCache || filters.cacheKey !== cacheKey) {
                    filters.cacheKey = cacheKey;
                    filters.tracksCache = await buildTracksFromAlbums(filters);
                    filters.total = filters.tracksCache.length;
                    filters.offset = 0;
                }

                const pageItems = getPage(filters.tracksCache);
                if (!setResults(pageItems, app.renderSearchResults, '', genre || '', true)) {
                    warn('Pro zadané filtry nebyly nalezeny žádné skladby.');
                }
            } else if (!searchQuery) {
                if (!filters.tracksCache || filters.cacheKey !== cacheKey) {
                    const albumData = await app.api.fetchNewReleases(0, state.pageLimit);
                    const albums = albumData.albums ? albumData.albums.items || [] : [];
                    filters.albumsCache = albums;
                    filters.cacheKeyAlbum = cacheKey;
                    filters.cacheKey = cacheKey;
                    filters.tracksCache = await buildTracksFromAlbums(filters);
                    filters.total = filters.tracksCache.length;
                    filters.offset = 0;
                }

                const pageItems = getPage(filters.tracksCache);
                if (!setResults(pageItems, app.renderSearchResults, '', genre || '', true)) {
                    warn('Pro zadané filtry nebyly nalezeny žádné skladby.');
                }
            } else {
                if (!filters.tracksCache || filters.cacheKey !== cacheKey) {
                    filters.cacheKey = cacheKey;
                    filters.tracksCache = await buildTracksFromSearchQuery(searchQuery, effectiveReleaseFrom, effectiveReleaseTo, 8, false);
                    filters.total = filters.tracksCache.length;
                    filters.offset = 0;
                }

                const pageItems = getPage(filters.tracksCache);
                if (!setResults(pageItems, app.renderSearchResults, '', genre || '', true)) {
                    warn('Pro zadané filtry nebyly nalezeny žádné skladby.');
                }
            }
        }

        updateLoadMoreButton(filters.offset || 0, filters.total || 0);
    } catch (error) {
        if (error && (String(error.message).toLowerCase().includes('token') || String(error.message).toLowerCase().includes('grant') || error.status === 401)) {
            clearStoredAccessToken();
            state.accessToken = '';
            app.state.accessToken = '';
            app.renderSearchWarning('Relace skončila, přihlaste se znovu.');
            setupLoginHandler();
        } else {
            app.renderSearchError(error.message);
        }
        updateLoadMoreButton(0, 0);
    }
}

async function fetchAllArtistAlbums(artistId) {
    const albums = [];
    const seen = new Set();
    let offset = 0;
    const limit = 50;

    while (true) {
        const data = await app.api.fetchArtistAlbums(artistId, offset, limit);
        const items = data.items || [];
        if (!items.length) {
            break;
        }

        items.forEach((album) => {
            if (!seen.has(album.id)) {
                seen.add(album.id);
                albums.push(album);
            }
        });

        offset += items.length;
        if (!data.next) {
            break;
        }
    }

    return albums;
}

function dedupeTracks(items) {
    const seen = new Set();
    return items.filter((track) => {
        if (seen.has(track.id)) {
            return false;
        }
        seen.add(track.id);
        return true;
    });
}

function updateLoadMoreButton(offset, total) {
    const $loadMoreBtn = $get(el.loadMoreBtn, '#loadMoreBtn');
    const $loadMoreControls = $get(el.loadMoreControls, '#loadMoreControls');
    if (!$loadMoreBtn.length) {
        return;
    }

    if (app && app.state && app.state.isLoading) {
        $loadMoreControls.length && $loadMoreControls.prop('hidden', true).css('display', 'none');
        $loadMoreBtn.prop('disabled', true);
        return;
    }

    if (!total) {
        $loadMoreBtn.prop('disabled', true);
        $loadMoreControls.length && $loadMoreControls.prop('hidden', true).css('display', 'none');
        return;
    }

    $loadMoreControls.length && $loadMoreControls.prop('hidden', false).css('display', '');
    $loadMoreBtn.prop('disabled', offset + state.pageLimit >= total);
}

function cacheSearchState(filters, results) {
    const payload = {
        filters: {
            artistName: filters.artistName,
            genre: filters.genre,
            releaseFrom: filters.releaseFrom,
            releaseTo: filters.releaseTo,
            searchType: filters.searchType,
            offset: filters.offset,
            total: filters.total
        },
        results,
        cacheKey: filters.cacheKey || null,
        cacheKeyAlbum: filters.cacheKeyAlbum || null
    };

    const maxCacheItems = 200;
    if (Array.isArray(filters.tracksCache) && filters.tracksCache.length <= maxCacheItems) {
        payload.tracksCache = filters.tracksCache;
    }
    if (Array.isArray(filters.albumsCache) && filters.albumsCache.length <= maxCacheItems) {
        payload.albumsCache = filters.albumsCache;
    }

    try {
        localStorage.setItem(state.searchCacheKey, JSON.stringify(payload));
    } catch (error) {
        try {
            localStorage.setItem(state.searchCacheKey, JSON.stringify({
                filters: payload.filters,
                results: payload.results
            }));
        } catch (innerError) {
        }
    }
}

function buildSearchQuery(artistName, genre) {
    const parts = [];
    if (artistName) {
        parts.push(`artist:"${artistName}"`);
    }
    if (genre) {
        parts.push(`genre:"${genre}"`);
    }
    return parts.join(' ');
}

function buildSearchLabel({ artistName, genre, releaseFrom, releaseTo }) {
    const parts = [];
    if (artistName) {
        parts.push(`Interpret: ${artistName}`);
    }
    if (genre) {
        parts.push(`Žánr: ${genre}`);
    }
    if (releaseFrom || releaseTo) {
        parts.push(`Datum: ${releaseFrom || 'libovolné'} – ${releaseTo || 'libovolné'}`);
    }
    return parts.length ? parts.join(' | ') : 'Všechny skladby';
}

function filterByReleaseDate(items, releaseFrom, releaseTo, getDate) {
    if (!releaseFrom && !releaseTo) {
        return items;
    }

    const fromDate = releaseFrom ? new Date(releaseFrom) : null;
    const toDate = releaseTo ? new Date(releaseTo) : null;
    if (toDate) {
        toDate.setHours(23, 59, 59, 999);
    }

    return items.filter((item) => {
        const itemDate = parseSpotifyDate(getDate(item));
        if (!itemDate) {
            return false;
        }
        if (fromDate && itemDate < fromDate) {
            return false;
        }
        if (toDate && itemDate > toDate) {
            return false;
        }
        return true;
    });
}

function filterAlbumsByReleaseDate(albums, releaseFrom, releaseTo) {
    return filterByReleaseDate(albums, releaseFrom, releaseTo, (album) => album.release_date);
}

function filterTracksByReleaseDate(tracks, releaseFrom, releaseTo) {
    return filterByReleaseDate(tracks, releaseFrom, releaseTo, (track) => track.album.release_date);
}

function parseSpotifyDate(dateStr) {
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
}


