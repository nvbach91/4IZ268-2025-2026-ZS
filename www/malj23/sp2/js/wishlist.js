(() => {
    window.App = window.App || {};
    const app = window.App;
    app.state = app.state || {};
    app.wishlist = app.wishlist || {};

    const WISHLIST_KEY = 'sp2_wishlist';

    const storage = (() => {
        try {
            const testKey = '__sp2_wishlist_test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            return localStorage;
        } catch (error) {
            try {
                const testKey = '__sp2_wishlist_test__';
                sessionStorage.setItem(testKey, '1');
                sessionStorage.removeItem(testKey);
                return sessionStorage;
            } catch (innerError) {
                return null;
            }
        }
    })();

    const memoryStore = [];

    const normalizeType = (item) => item.type || 'track';

    const getWishlist = () => {
        if (!storage) {
            return [...memoryStore];
        }
        try {
            const raw = storage.getItem(WISHLIST_KEY);
            if (!raw) {
                return [];
            }
            const items = JSON.parse(raw);
            return Array.isArray(items) ? items : [];
        } catch (error) {
            return [...memoryStore];
        }
    };

    const saveWishlist = (items) => {
        if (!storage) {
            memoryStore.length = 0;
            memoryStore.push(...items);
            return;
        }
        try {
            storage.setItem(WISHLIST_KEY, JSON.stringify(items));
        } catch (error) {
            memoryStore.length = 0;
            memoryStore.push(...items);
        }
    };

    const findWishlistItem = (itemId, itemType) => {
        return getWishlist().find((item) => {
            if (item.id !== itemId) {
                return false;
            }
            if (!itemType) {
                return true;
            }
            return normalizeType(item) === itemType;
        }) || null;
    };

    const isInWishlist = (itemId, itemType = 'track') => {
        return getWishlist().some((item) => item.id === itemId && normalizeType(item) === itemType);
    };

    const addToWishlist = (item) => {
        if (!item || !item.id) {
            return false;
        }
        const items = getWishlist();
        const type = item.type || 'track';
        if (items.some((entry) => entry.id === item.id && normalizeType(entry) === type)) {
            return false;
        }
        item.type = type;
        item.addedAt = item.addedAt || Date.now();
        items.push(item);
        saveWishlist(items);
        return true;
    };

    const removeFromWishlist = (itemId, itemType = 'track') => {
        const items = getWishlist();
        const next = items.filter((item) => !(item.id === itemId && normalizeType(item) === itemType));
        saveWishlist(next);
        return next;
    };

    const formatDuration = (ms) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}:${String(seconds).padStart(2, '0')}`;
    };

    const getRating = (item) => Number(item.rating) || 0;

    const renderStars = (item, itemType, className, wrap) => {
        const rating = getRating(item);
        const buttons = Array.from({ length: 5 }, (_, index) => {
            const value = index + 1;
            const starChar = value <= rating ? '&starf;' : '&star;';
            return `
            <button type='button' class='btn btn-sm btn-link p-0 ${className}' data-track-id='${item.id}' data-item-type='${itemType}' data-rating='${value}' aria-label='Ohodnotit ${value} hvězdičkami'>
                ${starChar}
            </button>
        `;
        }).join('');

        return wrap ? `<div class='d-flex align-items-center gap-1'>${buttons}</div>` : buttons;
    };

    const renderRatingStars = (item, itemType) => renderStars(item, itemType, 'rating-star', true);
    const renderModalRatingStars = (item) => renderStars(item, normalizeType(item), 'modal-rating-star', false);

    function renderWishlist(items, viewType) {
        const wishlistResult = $('#wishlistResult');
        if (!wishlistResult.length) {
            return;
        }

        const filtered = items
            .filter((item) => normalizeType(item) === viewType)
            .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

        if (!filtered.length) {
            wishlistResult.html('<div class=\'alert alert-info\'>Seznam přání je prázdný.</div>');
            return;
        }

        const cards = filtered.map((track, index) => {
            const releaseDate = track.releaseDate ? new Date(track.releaseDate) : null;
            const releaseDateStr = releaseDate ? releaseDate.toLocaleDateString() : 'Neznámé';
            const itemType = normalizeType(track);

            if (itemType === 'album') {
                return `
                <div class='card mb-2'>
                    <div class='card-body'>
                        ${track.coverUrl ? `<img src='${track.coverUrl}' alt='${track.name}' class='card-cover' />` : ''}
                        <h6 class='card-title'>${index + 1}. ${track.name}</h6>
                        <p class='card-text mb-2'>
                            <strong>Interpret:</strong> ${track.artistName || 'Neznámý interpret'}<br>
                            <strong>Datum vydání:</strong> ${releaseDateStr}<br>
                            <strong>Počet skladeb:</strong> ${track.totalTracks || 0}
                        </p>
                        <div class='mb-2'>
                            <strong>Hodnocení:</strong>
                            ${renderRatingStars(track, 'album')}
                        </div>
                        <div class='d-flex gap-2 flex-wrap'>
                            <button type='button' class='btn btn-sm btn-outline-secondary open-details'
                                data-item-type='album'
                                data-id='${track.id}'
                                data-name='${track.name}'
                                data-artist='${track.artistName}'
                                data-album='${track.name}'
                                data-genre='${track.genre || ''}'
                                data-release='${track.releaseDate || ''}'
                                data-duration=''
                                data-track-number=''
                                data-total-tracks='${track.totalTracks || 0}'
                                data-cover-url='${track.coverUrl || ''}'>
                                Detail
                            </button>
                            <button class='btn btn-sm btn-outline-danger remove-from-wishlist' data-track-id='${track.id}' data-item-type='album'>Odebrat</button>
                        </div>
                    </div>
                </div>
            `;
            }

            return `
            <div class='card mb-2'>
                <div class='card-body'>
                    ${track.coverUrl ? `<img src='${track.coverUrl}' alt='${track.name}' class='card-cover' />` : ''}
                    <h6 class='card-title'>${index + 1}. ${track.name}</h6>
                    <p class='card-text mb-2'>
                        <strong>Interpret:</strong> ${track.artistName || 'Neznámý interpret'}<br>
                        <strong>Album:</strong> ${track.albumName}<br>
                        <strong>Datum vydání:</strong> ${releaseDateStr}<br>
                    </p>
                    <div class='mb-2'>
                        <strong>Hodnocení:</strong>
                        ${renderRatingStars(track, 'track')}
                    </div>
                    <div class='d-flex gap-2 flex-wrap'>
                        <button type='button' class='btn btn-sm btn-outline-secondary open-details'
                            data-item-type='track'
                            data-id='${track.id}'
                            data-name='${track.name}'
                            data-artist='${track.artistName}'
                            data-album='${track.albumName}'
                            data-genre='${track.genre || ''}'
                            data-release='${track.releaseDate || ''}'
                            data-duration='${track.durationMs || 0}'
                            data-track-number='${track.trackNumber || ''}'
                            data-album-id='${track.albumId || ''}'
                            data-total-tracks=''
                            data-cover-url='${track.coverUrl || ''}'>
                            Detail
                        </button>
                        <button class='btn btn-sm btn-outline-danger remove-from-wishlist' data-track-id='${track.id}' data-item-type='track'>Odebrat</button>
                    </div>
                </div>
            </div>
        `;
        }).join('');

        wishlistResult.html(cards);
    }

    async function loadAlbumTracks(albumId, albumInfo) {
        const container = $('#detailAlbumTracks');
        if (!container.length) {
            return;
        }

        container.html('<div class=\'d-flex justify-content-center\'><div class=\'spinner-border text-light\' role=\'status\' aria-label=\'Načítání\'></div></div>');

        try {
            const data = await app.api.fetchTracksByAlbum(albumId);
            if (data && data.error) {
                const message = data.error.message || 'Nepodařilo se načíst skladby.';
                container.html(`<div class='small text-danger'>${message}</div>`);
                return;
            }
            if (!data.items || !data.items.length) {
                container.html('<div class=\'small text-muted\'>Nebyly nalezeny žádné skladby.</div>');
                return;
            }

            app.state.albumTracks = {
                albumId,
                albumInfo,
                tracks: data.items
            };

            container.html(renderAlbumTracksList(albumInfo, data.items));
        } catch (error) {
            container.html('<div class=\'small text-danger\'>Nepodařilo se načíst skladby.</div>');
        }
    }

    function renderAlbumTracksList(albumInfo, tracks) {
        let html = '<h6 class=\'mt-3\'>Skladby</h6><ul class=\'list-group\'>';
        tracks.forEach((track) => {
            const duration = formatDuration(track.duration_ms);
            const trackNumber = track.track_number;
            const inWishlist = track.id ? isInWishlist(track.id, 'track') : false;
            const addClass = inWishlist ? 'btn-secondary' : 'btn-primary';
            const addLabel = inWishlist ? 'V seznamu' : 'Přidat';
            const addDisabled = inWishlist ? 'disabled' : '';
            const removeDisabled = inWishlist ? '' : 'disabled';

            html += `
            <li class='list-group-item d-flex justify-content-between align-items-center'>
                <div>
                    <strong>${track.name}</strong>
                    <div class='small text-muted'>#${trackNumber} - ${duration}</div>
                </div>
                <div class='d-flex gap-2'>
                    <button type='button' class='btn btn-sm ${addClass} album-track-add'
                        data-id='${track.id}'
                        data-name='${track.name}'
                        data-artist='${albumInfo.artistName}'
                        data-album='${albumInfo.albumName}'
                        data-genre='${albumInfo.genre || ''}'
                        data-release='${albumInfo.releaseDate || ''}'
                        data-duration='${track.duration_ms}'
                        data-track-number='${trackNumber}'
                        data-cover-url='${albumInfo.coverUrl || ''}'
                        ${addDisabled}>
                        ${addLabel}
                    </button>
                    <button type='button' class='btn btn-sm btn-outline-danger album-track-remove' data-id='${track.id}' ${removeDisabled}>
                        Odebrat
                    </button>
                </div>
            </li>
        `;
        });
        html += '</ul>';
        return html;
    }

    function updateModalWishlistButtons() {
        const modal = $('#detailsModal');
        const item = modal.data('item');
        if (!item) {
            return;
        }

        const inWishlist = isInWishlist(item.id, item.type);
        const addBtn = modal.find('.modal-add-item');
        const removeBtn = modal.find('.modal-remove-item');

        addBtn.prop('disabled', inWishlist);
        addBtn.toggleClass('btn-secondary', inWishlist).toggleClass('btn-primary', !inWishlist);
        addBtn.text(inWishlist ? 'V seznamu' : 'Přidat');
        removeBtn.prop('disabled', !inWishlist);
    }

    function updateAlbumTrackButtons() {
        const container = $('#detailAlbumTracks');
        if (!container.length || !app.state || !app.state.albumTracks) {
            return;
        }
        const { albumInfo, tracks } = app.state.albumTracks;
        container.html(renderAlbumTracksList(albumInfo, tracks));
    }

    function refreshSearchButtons() {
        $('#searchResult .add-to-wishlist').each(function() {
            const $btn = $(this);
            const itemId = $btn.attr('data-track-id');
            const itemType = $btn.attr('data-item-type') || 'track';
            if (!itemId) {
                return;
            }
            const inWishlist = isInWishlist(itemId, itemType);
            $btn
                .prop('disabled', inWishlist)
                .toggleClass('btn-secondary', inWishlist)
                .toggleClass('btn-primary', !inWishlist)
                .text(inWishlist ? 'V seznamu' : 'Uložit do seznamu přání');
        });
    }

    function renderLastSaved(viewType) {
        const list = $('#lastSavedList');
        if (!list.length) {
            return;
        }

        const items = getWishlist()
            .filter((item) => normalizeType(item) === viewType)
            .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0));

        const lastItems = items.slice(0, 5);
        if (!lastItems.length) {
            list.html('<div class=\'text-light small\'>Zatím nic.</div>');
            return;
        }

        const html = lastItems.map((item) => `
            <div class='wishlist-item-row' data-id='${item.id}' data-item-type='${normalizeType(item)}'>
                <div class='wishlist-item-text'>
                    <div class='wishlist-item-title'>${item.name}</div>
                    <div class='wishlist-item-artist'>${item.artistName || 'Neznámý interpret'}</div>
                </div>
                <button class='wishlist-item-delete' type='button' aria-label='Odebrat'>
                    Smazat
                </button>
            </div>
        `).join('');

        list.html(html);
    }

    const refreshLastSaved = () => {
        renderLastSaved('track');
        renderLastSaved('album');
    };

    function focusLastSavedType(viewType) {
        const switchEl = $('#lastSavedSwitch');
        if (!switchEl.length) {
            return;
        }

        const target = switchEl.find(`[data-type='${viewType}']`);
        if (!target.length) {
            return;
        }

        if (target.hasClass('pill-active')) {
            renderLastSaved(viewType);
            return;
        }

        target.trigger('click');
    }

    function syncModalRatingDisplay(itemId, itemType, rating) {
        const modal = $('#detailsModal');
        if (!modal.length) {
            return;
        }

        const current = modal.data('item');
        if (!current || current.id !== itemId || normalizeType(current) !== itemType) {
            return;
        }

        current.rating = rating;
        modal.data('item', current);
        $('#detailRating').html(renderModalRatingStars(current));
    }

    $(document).ready(function() {
        const lastSavedSwitch = $('#lastSavedSwitch');
        if (lastSavedSwitch.length) {
            let lastSavedType = 'track';

            const setActiveLastSaved = () => {
                lastSavedSwitch.find('.pill').removeClass('pill-active');
                lastSavedSwitch.find(`[data-type='${lastSavedType}']`).addClass('pill-active');
            };

            setActiveLastSaved();
            renderLastSaved(lastSavedType);

            lastSavedSwitch.on('click', '.pill', function() {
                const nextType = $(this).data('type');
                if (!nextType) {
                    return;
                }
                lastSavedType = nextType;
                setActiveLastSaved();
                renderLastSaved(lastSavedType);
            });

            $('#lastSavedList').on('click', '.wishlist-item-delete', function() {
                const row = $(this).closest('.wishlist-item-row');
                const itemId = row.data('id');
                const itemType = row.data('itemType') || 'track';
                if (!itemId) {
                    return;
                }
                removeFromWishlist(itemId, itemType);
                renderLastSaved(lastSavedType);
                if ($('#searchResult').length) {
                    refreshSearchButtons();
                }
            });
        }

        const searchResult = $('#searchResult');
        const wishlistResult = $('#wishlistResult');

        const handleOpenDetails = (btn) => {
            const modal = $('#detailsModal');
            if (!modal.length) {
                return;
            }

            const $btn = $(btn);
            const itemType = $btn.attr('data-item-type') || 'track';
            const itemId = $btn.attr('data-id') || '';
            const name = $btn.attr('data-name') || 'Neznámé';
            const artist = $btn.attr('data-artist') || 'Neznámý interpret';
            const album = $btn.attr('data-album') || 'Neznámé album';
            const genre = $btn.attr('data-genre') || 'Neznámý žánr';
            const release = $btn.attr('data-release') || 'Neznámé';
            const durationMs = Number($btn.attr('data-duration')) || 0;
            const trackNumber = $btn.attr('data-track-number') || '';
            const totalTracks = $btn.attr('data-total-tracks') || '';
            const albumId = $btn.attr('data-album-id') || itemId;
            const coverUrl = $btn.attr('data-cover-url') || '';

            $('#detailName').text(name);
            $('#detailArtist').text(artist);
            $('#detailAlbum').text(album);
            $('#detailGenre').text(genre);
            $('#detailRelease').text(release);

            if (coverUrl) {
                $('#detailCover').attr('src', coverUrl).show();
                $('#detailCoverWrap').show();
            } else {
                $('#detailCover').attr('src', '').hide();
                $('#detailCoverWrap').hide();
            }

            $('#detailDuration').text(durationMs ? formatDuration(durationMs) : '');
            $('#detailTrackNumber').text(trackNumber);
            $('#detailTotalTracks').text(totalTracks);

            $('#detailAlbumRow').toggle(itemType === 'track');
            $('#detailDurationRow').toggle(itemType === 'track');
            $('#detailTrackNumberRow').toggle(itemType === 'track');
            $('#detailTotalTracksRow').toggle(itemType === 'album');

            const albumTracksContainer = $('#detailAlbumTracks');
            albumTracksContainer.empty();
            albumTracksContainer.toggle(itemType === 'album');

            modal.data('item', {
                id: itemId,
                type: itemType,
                name,
                artistName: artist,
                albumName: album,
                genre,
                releaseDate: release,
                durationMs,
                trackNumber,
                totalTracks,
                rating: 0,
                coverUrl
            });

            const storedItem = findWishlistItem(itemId, itemType) || findWishlistItem(itemId);
            if (storedItem) {
                const current = modal.data('item');
                current.rating = getRating(storedItem);
                modal.data('item', current);
            }

            updateModalWishlistButtons();
            $('#detailRating').html(renderModalRatingStars(modal.data('item')));

            if (itemType === 'album' && albumId) {
                const storedToken = localStorage.getItem('sp2_access_token');
                const storedExpiry = localStorage.getItem('sp2_access_token_expires_at');
                const expiry = storedExpiry ? Number(storedExpiry) : 0;
                if (storedToken && (!expiry || Date.now() < expiry)) {
                    app.state.accessToken = storedToken;
                }

                loadAlbumTracks(albumId, {
                    albumName: album,
                    artistName: artist,
                    genre,
                    releaseDate: release,
                    coverUrl
                });
            }

            const modalInstance = new bootstrap.Modal(modal[0]);
            modalInstance.show();
        };

        if (searchResult.length) {
            searchResult.on('click', '.open-details', function() {
                handleOpenDetails(this);
            });
        }

        if (wishlistResult.length) {
            wishlistResult.on('click', '.open-details', function() {
                handleOpenDetails(this);
            });
        }

        $(document).on('click', '.modal-add-item', function() {
            const modal = $('#detailsModal');
            const item = modal.data('item');
            if (!item) {
                return;
            }

            const payload = item.type === 'album'
                ? {
                    id: item.id,
                    name: item.name,
                    artistName: item.artistName,
                    genre: item.genre || '',
                    releaseDate: item.releaseDate || '',
                    totalTracks: Number(item.totalTracks) || 0,
                    type: 'album',
                    rating: Number(item.rating) || 0,
                    coverUrl: item.coverUrl || ''
                }
                : {
                    id: item.id,
                    name: item.name,
                    artistName: item.artistName,
                    albumName: item.albumName,
                    genre: item.genre || '',
                    releaseDate: item.releaseDate || '',
                    durationMs: Number(item.durationMs) || 0,
                    trackNumber: Number(item.trackNumber) || 0,
                    type: 'track',
                    rating: Number(item.rating) || 0,
                    coverUrl: item.coverUrl || ''
                };

            addToWishlist(payload);
            updateModalWishlistButtons();
            refreshLastSaved();
            focusLastSavedType(payload.type || 'track');
            if ($('#wishlistResult').length) {
                const activeType = $('.wishlist-type-btn.active').data('type') || 'track';
                renderWishlist(getWishlist(), activeType);
            }
        });

        $(document).on('click', '.modal-remove-item', function() {
            const modal = $('#detailsModal');
            const item = modal.data('item');
            if (!item) {
                return;
            }

            removeFromWishlist(item.id, item.type);
            updateModalWishlistButtons();
            refreshLastSaved();
            if ($('#wishlistResult').length) {
                const activeType = $('.wishlist-type-btn.active').data('type') || 'track';
                renderWishlist(getWishlist(), activeType);
            }
        });

        $(document).on('click', '.modal-rating-star', function() {
            const trackId = $(this).data('trackId');
            const itemType = $(this).data('itemType') || 'track';
            const rating = Number($(this).data('rating')) || 0;

            if (!trackId) {
                return;
            }

            const items = getWishlist();
            const updated = items.map((item) => {
                if (item.id === trackId && normalizeType(item) === itemType) {
                    return {
                        ...item,
                        rating
                    };
                }
                return item;
            });

            saveWishlist(updated);
            syncModalRatingDisplay(trackId, itemType, rating);
            if ($('#wishlistResult').length) {
                renderWishlist(updated, $('.wishlist-type-btn.active').data('type') || 'track');
            }
        });

        searchResult.on('click', '.add-to-wishlist', function() {
            const encodedTrack = $(this).attr('data-track');
            let track = null;

            if (encodedTrack) {
                try {
                    track = JSON.parse(decodeURIComponent(encodedTrack));
                } catch (error) {
                    track = null;
                }
            }

            if (track && !track.type) {
                track.type = $(this).attr('data-item-type') || 'track';
            }

            if (!track) {
                const $btn = $(this);
                const trackId = $btn.attr('data-track-id');
                if (!trackId) {
                    return;
                }

                track = {
                    id: trackId,
                    name: $btn.attr('data-track-name') || 'Neznámé',
                    artistName: $btn.attr('data-track-artist') || 'Neznámý interpret',
                    albumName: $btn.attr('data-track-album') || 'Neznámé album',
                    genre: $btn.attr('data-track-genre') || '',
                    releaseDate: $btn.attr('data-track-release') || '',
                    durationMs: Number($btn.attr('data-track-duration')) || 0,
                    trackNumber: Number($btn.attr('data-track-number')) || 0,
                    totalTracks: Number($btn.attr('data-track-total')) || 0,
                    coverUrl: $btn.attr('data-track-cover') || '',
                    type: $btn.attr('data-item-type') || 'track'
                };
            }

            const added = addToWishlist(track);
            if (added) {
                $(this)
                    .removeClass('btn-primary')
                    .addClass('btn-secondary')
                    .prop('disabled', true)
                    .text('V seznamu');
            }

            refreshLastSaved();
            focusLastSavedType(track.type || 'track');
        });

        $(document).on('click', '.album-track-add', function() {
            const $btn = $(this);
            const track = {
                id: $btn.attr('data-id'),
                name: $btn.attr('data-name') || 'Neznámé',
                artistName: $btn.attr('data-artist') || 'Neznámý interpret',
                albumName: $btn.attr('data-album') || 'Neznámé album',
                genre: $btn.attr('data-genre') || '',
                releaseDate: $btn.attr('data-release') || '',
                durationMs: Number($btn.attr('data-duration')) || 0,
                trackNumber: Number($btn.attr('data-track-number')) || 0,
                coverUrl: $btn.attr('data-cover-url') || '',
                type: 'track'
            };

            addToWishlist(track);
            updateAlbumTrackButtons();
            renderLastSaved('track');
            focusLastSavedType('track');
        });

        $(document).on('click', '.album-track-remove', function() {
            const trackId = $(this).attr('data-id');
            if (!trackId) {
                return;
            }
            removeFromWishlist(trackId, 'track');
            updateAlbumTrackButtons();
            renderLastSaved('track');
        });

        if (wishlistResult.length) {
            const buttons = $('.wishlist-type-btn');
            let viewType = 'track';

            const setActiveButton = () => {
                buttons.removeClass('active pill-active');
                buttons.filter(`[data-type='${viewType}']`).addClass('active pill-active');
            };

            const renderCurrent = () => {
                renderWishlist(getWishlist(), viewType);
            };

            setActiveButton();
            renderCurrent();

            buttons.on('click', function() {
                const nextType = $(this).data('type');
                if (!nextType) {
                    return;
                }
                viewType = nextType;
                setActiveButton();
                renderCurrent();
            });

            wishlistResult.on('click', '.rating-star', function() {
                const trackId = $(this).data('trackId');
                const itemType = $(this).data('itemType') || 'track';
                const rating = Number($(this).data('rating')) || 0;

                if (!trackId) {
                    return;
                }

                const items = getWishlist();
                const updated = items.map((item) => {
                    if (item.id === trackId && normalizeType(item) === itemType) {
                        return {
                            ...item,
                            rating
                        };
                    }
                    return item;
                });

                saveWishlist(updated);
                renderWishlist(updated, viewType);
                syncModalRatingDisplay(trackId, itemType, rating);
            });

            wishlistResult.on('click', '.remove-from-wishlist', function() {
                const trackId = $(this).data('trackId');
                const itemType = $(this).data('itemType') || 'track';
                const updated = removeFromWishlist(trackId, itemType);
                renderWishlist(updated, viewType);
                refreshLastSaved();
            });
        }
    });

    app.wishlist.getWishlist = getWishlist;
    app.wishlist.findWishlistItem = findWishlistItem;
    app.wishlist.saveWishlist = saveWishlist;
    app.wishlist.normalizeType = normalizeType;
    app.wishlist.isInWishlist = isInWishlist;
    app.wishlist.addToWishlist = addToWishlist;
    app.wishlist.removeFromWishlist = removeFromWishlist;
    app.wishlist.formatDuration = formatDuration;
    app.wishlist.renderLastSaved = renderLastSaved;
    app.wishlist.refreshLastSaved = refreshLastSaved;
    app.wishlist.refreshSearchButtons = refreshSearchButtons;
})();
