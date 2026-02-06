window.App = window.App || {};
const app = window.App;
app.config = app.config || {};
app.state = app.state || {};

const el = app.elements || {};
const $get = (cached, selector) => (cached && cached.length) ? cached : $(selector);

const state = {
    currentSearch: null,
    currentResults: [],
    pageLimit: 20,
    searchCacheKey: 'sp2_search_cache'
};

const ENTER_DELAY_MS = 0;

$(document).ready(function() {
    setupSearchHandler();
    setupArtistSuggestions();
    setupViewSwitch();
    localStorage.removeItem(state.searchCacheKey);
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

    // Force album-only flow
    if ($searchTypeSelect.length) {
        $searchTypeSelect.val('album').prop('disabled', true);
    }

    if (!$searchBtn.length) {
        return;
    }

    const runSearch = function(event) {
        if (event && typeof event.preventDefault === 'function') {
            event.preventDefault();
        }

        const artistName = $artistInput.val().trim();
        const genreText = $genreInput.val().trim();
        const genrePick = $genreSelect.val();
        const genre = genreText || genrePick;
        const releaseFrom = $releaseFromInput.val();
        const releaseTo = $releaseToInput.val();
        const searchType = 'album';

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
            albumsCache: null,
            cacheKeyAlbum: null,
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
            <div class="suggestion-item" data-name="${artist.name}">
                ${artist.name}
            </div>
        `).join('');

        $list.html(html).prop('hidden', false);
    };

    $artistInput.on('input', function() {
        const value = $(this).val().trim();
        if (!value || value.length < 2) {
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

    // Lock UI to album search only
    setSearchTypeUI('album');
    $searchTypeSelect.val('album').prop('disabled', true);
    $switchEl.addClass('pill-disabled');
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

async function handleSearch(filters, append = false) {
    const warn = (message) => {
        app.renderSearchWarning(message);
        updateLoadMoreButton(filters.offset || 0, filters.total || 0);
    };

    const ensureAlbumArtist = (albums, fallbackArtist) => {
        const fallback = fallbackArtist || '';
        return (albums || []).map((album) => {
            const artistName = album.artistName
                || (album.artists && album.artists[0] ? album.artists[0].name : '')
                || fallback
                || 'Neznámý interpret';
            return {
                ...album,
                artistName,
                artists: album.artists && album.artists.length ? album.artists : [{ name: artistName }]
            };
        });
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
        const { artistName, genre, releaseFrom, releaseTo } = filters;
        const effectiveReleaseFrom = releaseFrom || '';
        const effectiveReleaseTo = releaseTo || '';
        const searchQuery = buildSearchQuery(artistName, genre);
        const searchLabel = buildSearchLabel(filters);
        const albumLabel = buildSearchLabel(filters, { includeArtist: false });
        const cacheKey = buildCacheKey(filters);

        if (!append) {
            app.renderSearchLoading(searchLabel);
        }
        // Album-only flow
        if (artistName) {
            const cacheReady = await ensureArtistAlbumsCache(filters, cacheKey);
            if (!cacheReady) {
                warn('Pro zadané filtry nebyla nalezena žádná alba.');
                return;
            }

            const filteredAlbums = ensureAlbumArtist(
                filterAlbumsByReleaseDate(filters.albumsCache || [], effectiveReleaseFrom, effectiveReleaseTo),
                artistName
            );
            const recentAlbums = filteredAlbums
                .sort((a, b) => parseReleaseDateValue(b.release_date) - parseReleaseDateValue(a.release_date))
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
            const filteredAlbums = ensureAlbumArtist(
                filterAlbumsByReleaseDate(items, effectiveReleaseFrom, effectiveReleaseTo),
                artistName
            );
            const recentAlbums = filteredAlbums
                .sort((a, b) => parseReleaseDateValue(b.release_date) - parseReleaseDateValue(a.release_date))
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
            const filteredAlbums = ensureAlbumArtist(
                filterAlbumsByReleaseDate(items, releaseFrom, releaseTo),
                artistName
            );
            const recentAlbums = filteredAlbums
                .sort((a, b) => parseReleaseDateValue(b.release_date) - parseReleaseDateValue(a.release_date))
                .slice(0, state.pageLimit);

            if (!setResults(recentAlbums, app.renderAlbumResults, albumLabel, genre)) {
                warn('Pro zadané filtry nebyla nalezena žádná alba.');
            }
        }

        updateLoadMoreButton(filters.offset || 0, filters.total || 0);
    } catch (error) {
        app.renderSearchError(error.message);
        updateLoadMoreButton(0, 0);
    }
}

async function fetchAllArtistAlbums(artistId) {
    const albums = [];
    const seen = new Set();
    let offset = 0;
    const limit = 100;

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
        cacheKeyAlbum: filters.cacheKeyAlbum || null
    };

    const maxCacheItems = 200;
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
    return parts.length ? parts.join(' | ') : 'Všechna alba';
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
        const itemDate = parseReleaseDateValue(getDate(item));
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

function parseReleaseDateValue(dateStr) {
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


