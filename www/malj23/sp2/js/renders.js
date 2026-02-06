// Funkce pro vykreslení
(() => {
    window.App = window.App || {};
    const app = window.App;
    const el = app.elements || {};
    const contentPanels = (el.contentPanels && el.contentPanels.length) ? el.contentPanels : $('.content-panel');
    const loadMoreControls = (el.loadMoreControls && el.loadMoreControls.length) ? el.loadMoreControls : $('#loadMoreControls');

    function setLoading(isLoading, message = 'Načítám...') {
        if (!el.loadingOverlay || !el.loadingOverlay.length) {
            return;
        }

        app.state = app.state || {};
        app.state.isLoading = isLoading;

        contentPanels.toggleClass('is-loading', isLoading);

        if (loadMoreControls && loadMoreControls.length) {
            loadMoreControls.prop('hidden', isLoading);
            loadMoreControls.css('display', isLoading ? 'none' : '');
        }

        if (el.loadingMessage && el.loadingMessage.length) {
            el.loadingMessage.text(message);
        }

        el.loadingOverlay.prop('hidden', !isLoading);
    }

    function renderAlbumResults(albums, searchLabel, genreLabel) {
        setLoading(false);

        const cards = albums.map((album, index) => {
            const releaseDateStr = formatReleaseDate(album.release_date);
            const artistName = album.artistName
                || (album.artists && album.artists.length ? album.artists[0].name : '')
                || 'Neznámý interpret';
            // Normalize for downstream usage (wishlist payloads, modal data)
            album.artistName = artistName;
            const coverUrl = album.coverUrl || (album.images && album.images.length ? album.images[0].url : '');
            if (!album.coverUrl && coverUrl) {
                album.coverUrl = coverUrl;
            }
            const totalTracksDisplay = album.total_tracks || '?';

            const detailAttrs = `data-item-type="album"
                            data-id="${album.id}"
                            data-name="${album.name}"
                            data-artist="${artistName}"
                            data-album="${album.name}"
                            data-genre="${genreLabel || ''}"
                            data-release="${album.release_date}"
                            data-duration=""
                            data-track-number=""
                            data-total-tracks="${totalTracksDisplay}"
                            data-cover-url="${coverUrl}"`;

            const payload = encodeURIComponent(JSON.stringify({
                id: album.id,
                name: album.name,
                artistName,
                genre: genreLabel || '',
                releaseDate: album.release_date,
                totalTracks: album.total_tracks,
                coverUrl,
                type: 'album'
            }));

            const inWishlist = app.wishlist && typeof app.wishlist.isInWishlist === 'function'
                ? app.wishlist.isInWishlist(album.id, 'album')
                : false;

            const btnClass = inWishlist ? 'btn-secondary' : 'btn-primary';
            const btnLabel = inWishlist ? 'V seznamu' : 'Uložit do seznamu přání';
            const btnDisabled = inWishlist ? 'disabled' : '';

            return `
            <div class="card mb-2">
                <div class="card-body">
                    ${coverUrl ? `<img src="${coverUrl}" alt="${album.name}" class="card-cover open-details" ${detailAttrs} />` : ''}
                    <h6 class="card-title open-details" ${detailAttrs}>${index + 1}. ${album.name}</h6>
                    <p class="card-text">
                        <strong>Interpret:</strong> ${artistName}<br>
                        <strong>Datum vydání:</strong> ${releaseDateStr}<br>
                        <strong>Počet skladeb:</strong> <span class="album-total-tracks">${totalTracksDisplay}</span>
                    </p>
                    <div class="d-flex gap-2 flex-wrap">
                        <button type="button" class="btn btn-sm btn-outline-secondary open-details"
                            ${detailAttrs}>
                            Detail
                        </button>
                        <button type="button" class="btn btn-sm ${btnClass} add-to-wishlist"
                            data-track="${payload}"
                            data-track-id="${album.id}"
                            data-track-name="${album.name}"
                            data-track-artist="${artistName}"
                            data-track-genre="${genreLabel || ''}"
                            data-track-release="${album.release_date}"
                            data-track-total="${album.total_tracks}"
                            data-track-cover="${coverUrl}"
                            data-item-type="album"
                            ${btnDisabled}>
                            ${btnLabel}
                        </button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        el.searchResult && el.searchResult.html(cards);
        if (app.wishlist && typeof app.wishlist.refreshSearchButtons === 'function') {
            app.wishlist.refreshSearchButtons();
        }
    }

    function renderSearchLoading() {
        setLoading(true);
        loadMoreControls && loadMoreControls.length && loadMoreControls.prop('hidden', true).css('display', 'none');
        el.searchResult && el.searchResult.empty();
    }

    function formatReleaseDate(dateStr) {
        if (!dateStr) {
            return 'Neznámé';
        }
        if (dateStr.length === 4) {
            return dateStr;
        }
        if (dateStr.length === 7) {
            const [year, month] = dateStr.split('-');
            return `${month}.${year}`;
        }
        if (dateStr.length === 10) {
            const [year, month, day] = dateStr.split('-');
            return `${day}.${month}.${year}`;
        }
        return dateStr;
    }

    function renderSearchError(message) {
        setLoading(false);
        el.searchResult && el.searchResult.html(`<div class="alert alert-danger text-center">Chyba: ${message}</div>`);
    }

    function renderSearchWarning(message) {
        setLoading(false);
        el.searchResult && el.searchResult.html(`<div class="alert alert-warning text-center">${message}</div>`);
    }

    app.setLoading = setLoading;
    app.renderAlbumResults = renderAlbumResults;
    app.renderSearchLoading = renderSearchLoading;
    app.renderSearchError = renderSearchError;
    app.renderSearchWarning = renderSearchWarning;
})();