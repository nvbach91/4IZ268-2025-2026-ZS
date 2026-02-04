// Funkce pro vykreslení
(() => {
    window.App = window.App || {};
    const app = window.App;
    const el = app.elements || {};

    function setLoading(isLoading, message = 'Načítám...') {
        if (!el.loadingOverlay || !el.loadingOverlay.length) {
            return;
        }

        app.state = app.state || {};
        app.state.isLoading = isLoading;

        $('.content-panel').toggleClass('is-loading', isLoading);

        const loadMoreControls = $('#loadMoreControls');
        if (loadMoreControls.length) {
            loadMoreControls.prop('hidden', isLoading);
            loadMoreControls.css('display', isLoading ? 'none' : '');
        }

        if (el.loadingMessage && el.loadingMessage.length) {
            el.loadingMessage.text(message);
        }

        el.loadingOverlay.prop('hidden', !isLoading);
    }

    function renderLoginSuccess() {
        setLoading(false);
        el.result && el.result.empty();
    }

    function renderTokenSuccess() {
        setLoading(false);
        el.result && el.result.empty();
    }

    function renderTokenError() {
        setLoading(false);
        el.result && el.result.empty();
    }

    function renderLogoutButton() {
        if (!el.loginBtn || !el.result) {
            return;
        }
        el.loginBtn.hide();
        el.result.append(`<button id='logoutBtn' class='btn btn-danger mt-2'>Odhlásit se</button>`);
    }

    function renderLogoutSuccess() {
        el.result && el.result.empty();
    }

    function renderSearchResults(tracks, searchLabel, genreLabel) {
        setLoading(false);

        const cards = tracks.map((track, index) => {
            const releaseDateStr = new Date(track.album.release_date).toLocaleDateString();
            const coverUrl = track.coverUrl || (track.album.images && track.album.images.length ? track.album.images[0].url : '');
            if (!track.coverUrl && coverUrl) {
                track.coverUrl = coverUrl;
            }

            const payload = encodeURIComponent(JSON.stringify({
                id: track.id,
                name: track.name,
                artistName: track.artists[0].name,
                albumName: track.album.name,
                genre: genreLabel || '',
                releaseDate: track.album.release_date,
                durationMs: track.duration_ms,
                trackNumber: track.track_number,
                coverUrl,
                type: 'track'
            }));

            const inWishlist = app.wishlist && typeof app.wishlist.isInWishlist === 'function'
                ? app.wishlist.isInWishlist(track.id, 'track')
                : false;

            const btnClass = inWishlist ? 'btn-secondary' : 'btn-primary';
            const btnLabel = inWishlist ? 'V seznamu' : 'Uložit do seznamu přání';
            const btnDisabled = inWishlist ? 'disabled' : '';

            return `
            <div class='card mb-2'>
                <div class='card-body'>
                    ${coverUrl ? `<img src='${coverUrl}' alt='${track.album.name}' class='card-cover' />` : ''}
                    <h6 class='card-title'>${index + 1}. ${track.name}</h6>
                    <p class='card-text'>
                        <strong>Interpret:</strong> ${track.artists[0].name}<br>
                        <strong>Album:</strong> ${track.album.name}<br>
                        <strong>Datum vydání:</strong> ${releaseDateStr}
                    </p>
                    <div class='d-flex gap-2 flex-wrap'>
                        <button type='button' class='btn btn-sm btn-outline-secondary open-details'
                            data-item-type='track'
                            data-id='${track.id}'
                            data-name='${track.name}'
                            data-artist='${track.artists[0].name}'
                            data-album='${track.album.name}'
                            data-genre='${genreLabel || ''}'
                            data-release='${track.album.release_date}'
                            data-duration='${track.duration_ms}'
                            data-track-number='${track.track_number}'
                            data-album-id='${track.album.id}'
                            data-total-tracks=''
                            data-cover-url='${coverUrl}'>
                            Detail
                        </button>
                        <button type='button' class='btn btn-sm ${btnClass} add-to-wishlist'
                            data-track='${payload}'
                            data-track-id='${track.id}'
                            data-track-name='${track.name}'
                            data-track-artist='${track.artists[0].name}'
                            data-track-album='${track.album.name}'
                            data-track-genre='${genreLabel || ''}'
                            data-track-release='${track.album.release_date}'
                            data-track-duration='${track.duration_ms}'
                            data-track-number='${track.track_number}'
                            data-track-cover='${coverUrl}'
                            data-item-type='track'
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

    function renderAlbumResults(albums, searchLabel, genreLabel) {
        setLoading(false);

        const cards = albums.map((album, index) => {
            const releaseDate = parseReleaseDate(album.release_date);
            const releaseDateStr = releaseDate ? releaseDate.toLocaleDateString() : 'Neznámé';
            const artistName = album.artists && album.artists.length ? album.artists[0].name : 'Neznámý interpret';
            const coverUrl = album.coverUrl || (album.images && album.images.length ? album.images[0].url : '');
            if (!album.coverUrl && coverUrl) {
                album.coverUrl = coverUrl;
            }

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
            <div class='card mb-2'>
                <div class='card-body'>
                    ${coverUrl ? `<img src='${coverUrl}' alt='${album.name}' class='card-cover' />` : ''}
                    <h6 class='card-title'>${index + 1}. ${album.name}</h6>
                    <p class='card-text'>
                        <strong>Interpret:</strong> ${artistName}<br>
                        <strong>Datum vydání:</strong> ${releaseDateStr}<br>
                        <strong>Počet skladeb:</strong> ${album.total_tracks}
                    </p>
                    <div class='d-flex gap-2 flex-wrap'>
                        <button type='button' class='btn btn-sm btn-outline-secondary open-details'
                            data-item-type='album'
                            data-id='${album.id}'
                            data-name='${album.name}'
                            data-artist='${artistName}'
                            data-album='${album.name}'
                            data-genre='${genreLabel || ''}'
                            data-release='${album.release_date}'
                            data-duration=''
                            data-track-number=''
                            data-total-tracks='${album.total_tracks}'
                            data-cover-url='${coverUrl}'>
                            Detail
                        </button>
                        <button type='button' class='btn btn-sm ${btnClass} add-to-wishlist'
                            data-track='${payload}'
                            data-track-id='${album.id}'
                            data-track-name='${album.name}'
                            data-track-artist='${artistName}'
                            data-track-genre='${genreLabel || ''}'
                            data-track-release='${album.release_date}'
                            data-track-total='${album.total_tracks}'
                            data-track-cover='${coverUrl}'
                            data-item-type='album'
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
        $('#loadMoreControls').prop('hidden', true).css('display', 'none');
        el.searchResult && el.searchResult.empty();
    }

    function parseReleaseDate(dateStr) {
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

    function renderSearchError(message) {
        setLoading(false);
        el.searchResult && el.searchResult.html(`<div class='alert alert-danger text-center'>Chyba: ${message}</div>`);
    }

    function renderSearchWarning(message) {
        setLoading(false);
        el.searchResult && el.searchResult.html(`<div class='alert alert-warning text-center'>${message}</div>`);
    }

    app.setLoading = setLoading;
    app.renderLoginSuccess = renderLoginSuccess;
    app.renderTokenSuccess = renderTokenSuccess;
    app.renderTokenError = renderTokenError;
    app.renderLogoutButton = renderLogoutButton;
    app.renderLogoutSuccess = renderLogoutSuccess;
    app.renderSearchResults = renderSearchResults;
    app.renderAlbumResults = renderAlbumResults;
    app.renderSearchLoading = renderSearchLoading;
    app.renderSearchError = renderSearchError;
    app.renderSearchWarning = renderSearchWarning;
})();