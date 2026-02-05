const App = {
    API_KEY: '3d27426e467b2acfdfc56f7b4ac47300',
    BASE_URL: 'https://api.themoviedb.org/3/',

    // DOM elements
    $searchInput: $('#search-input'),
    $dynamicContent: $('#dynamic-content'),
    $favoritesContent: $('#favorites-content'),
    $searchForm: $('#search-form'),

    init: function () {
        App.$searchForm.on('submit', App.handleSearch);
        $('#logo').on('click', App.renderHome);

        // History API to handle browser back/forward buttons
        $(window).on('popstate', function (e) {
            const state = e.originalEvent.state;
            if (state) {
                if (state.view === 'search') App.fetchMovies(state.query, state.page, state.mediaType, false);
                else if (state.view === 'detail') App.fetchDetails(state.id, state.type, false);
                else App.renderHome();
            }
        });

        App.renderFavorites();
    },

    handleSearch: function (e) {
        e.preventDefault();
        const query = App.$searchInput.val().trim();
        if (query.length > 0) {
            // Server-side search defaults to movies
            App.fetchMovies(query, 1, 'movie', true);
        }
    },

    fetchMovies: function (query, page, mediaType, pushState) {
        // Update URL without page refresh
        if (pushState) window.history.pushState({ view: 'search', query: query, page: page, mediaType: mediaType }, '', `?search=${encodeURIComponent(query)}&type=${mediaType}&page=${page}`);

        App.$dynamicContent.html('<div class="loader">Searching for movies...</div>');

        // Server-side filtering: using specific /search/{type} endpoint instead of multi
        const url = `${App.BASE_URL}search/${mediaType}?api_key=${App.API_KEY}&query=${encodeURIComponent(query)}&page=${page}&language=en-US`;

        $.ajax({
            url: url,
            method: 'GET'
        }).done(function (response) {
            App.renderResults(response, query, mediaType);
        }).fail(function () {
            App.$dynamicContent.html('<h2>Error</h2><p>Connection to TMDB API failed.</p>');
        });
    },

    renderResults: function (response, query, mediaType) {
        const results = response.results;
        // Display total number of results found
        let resultsHtml = `<h2>Results for: "${query}" (${response.total_results} found)</h2>`;

        // Filter buttons for media type
        resultsHtml += `
            <div class="search-filters">
                <button class="filter-btn ${mediaType === 'movie' ? 'active' : ''}" data-type="movie">Movies</button>
                <button class="filter-btn ${mediaType === 'tv' ? 'active' : ''}" data-type="tv">TV Shows</button>
            </div>
            <div class="results-grid"></div>
            <div class="pagination" style="margin-top: 20px;"></div>`;

        const $container = $(resultsHtml);
        const $grid = $container.filter('.results-grid');

        const movieCards = results.map(item => {
            const title = item.title || item.name;
            const date = item.release_date || item.first_air_date;
            const year = (date && date.length >= 4) ? ` (${date.substring(0, 4)})` : '';
            const poster = item.poster_path
                ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                : 'https://placehold.co/200x300?text=No+Poster';

            const $card = $(`
                <div class="movie-card">
                    <img src="${poster}" alt="${title}">
                    <strong>${title}${year}</strong>
                </div>`);

            $card.on('click', () => App.fetchDetails(item.id, mediaType, true));
            return $card;
        });

        $grid.append(movieCards);

        // Pagination controls
        if (response.total_pages > 1) {
            const $pag = $container.filter('.pagination');
            if (response.page > 1) {
                $('<button>Prev</button>').on('click', () => App.fetchMovies(query, response.page - 1, mediaType, true)).appendTo($pag);
            }
            $(`<span> Page ${response.page} / ${response.total_pages} </span>`).appendTo($pag);
            if (response.page < response.total_pages) {
                $('<button>Next</button>').on('click', () => App.fetchMovies(query, response.page + 1, mediaType, true)).appendTo($pag);
            }
        }

        App.$dynamicContent.html($container);

        // Filter button event handlers
        $('.filter-btn').on('click', function () {
            App.fetchMovies(query, 1, $(this).data('type'), true);
        });
    },

    fetchDetails: function (id, type, pushState) {
        if (pushState) window.history.pushState({ view: 'detail', id: id, type: type }, '', `?id=${id}`);

        App.$dynamicContent.html('<div class="loader">Loading details...</div>');
        const url = `${App.BASE_URL}${type}/${id}?api_key=${App.API_KEY}&language=en-US`;

        $.get(url).done(function (data) {
            const title = data.title || data.name;
            const date = data.release_date || data.first_air_date;
            const year = (date && date.length >= 4) ? ` (${date.substring(0, 4)})` : '';
            const favorites = JSON.parse(localStorage.getItem('4iz268_favs')) || [];
            const isFav = favorites.some(f => f.id === data.id);
            const savedNote = favorites.find(f => f.id === data.id)?.note || '';

            const poster = data.poster_path
                ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                : 'https://placehold.co/500x750?text=No+Poster';

            // Detail view HTML
            const detailHtml = `
              <div class="detail-container-fixed">
                  <div class="back-nav">
                      <button class="back-btn">← BACK</button>
                  </div>
                    
                  <div class="movie-main-flex">
                      <div class="detail-poster">
                          <img src="${poster}" alt="${title}">
                      </div>
                      <div class="detail-info">
                          <h2>${title}${year}</h2>
                          <p><strong>Status:</strong> ${data.status}</p>
                          <p><strong>Genres:</strong> ${data.genres.map(g => g.name).join(', ')}</p>
                          <p><strong>Rating:</strong> ${data.vote_average}/10</p>
                          <p>${data.overview}</p>
                          
                          <div class="fav-actions"></div>
                    
                          <div class="note-section">
                              <strong>My Personal Note:</strong><br>
                              <textarea id="movie-note">${savedNote}</textarea><br>
                              <button id="save-note-btn">Save Note</button>
                          </div>
                      </div>
                  </div>
              </div>`;

            const $detail = $(detailHtml);

            // Favorite button
            if (isFav) {
                $('<button class="fav-btn remove">REMOVE FROM FAVORITES</button>')
                    .on('click', () => App.updateFavorites(data, poster, true))
                    .appendTo($detail.find('.fav-actions'));
            } else {
                $('<button class="fav-btn add">ADD TO FAVORITES</button>')
                    .on('click', () => App.updateFavorites(data, poster, false))
                    .appendTo($detail.find('.fav-actions'));
            }

            $detail.find('.back-btn').on('click', () => window.history.back());
            $detail.find('#save-note-btn').on('click', () => App.saveNote(data.id, $('#movie-note').val()));

            App.$dynamicContent.html($detail);
        });
    },

    updateFavorites: function (data, poster, isRemoving) {
        let favorites = JSON.parse(localStorage.getItem('4iz268_favs')) || [];

        if (isRemoving) {
            favorites = favorites.filter(f => f.id !== data.id);
        } else {
            // Store image URL and media type for better favorite list rendering
            favorites.push({
                id: data.id,
                title: data.title || data.name,
                poster: poster,
                type: data.title ? 'movie' : 'tv',
                note: ''
            });
        }

        localStorage.setItem('4iz268_favs', JSON.stringify(favorites));
        App.renderFavorites();

        const $favActions = $('.fav-actions').empty();
        if (isRemoving) {
            $('<button class="fav-btn add">ADD TO FAVORITES</button>')
                .on('click', () => App.updateFavorites(data, poster, false))
                .appendTo($favActions);
        } else {
            $('<button class="fav-btn remove">REMOVE FROM FAVORITES</button>')
                .on('click', () => App.updateFavorites(data, poster, true))
                .appendTo($favActions);
        }
    },

    saveNote: function (id, note) {
        let favorites = JSON.parse(localStorage.getItem('4iz268_favs')) || [];
        const index = favorites.findIndex(f => f.id === id);
        if (index > -1) {
            favorites[index].note = note;
            localStorage.setItem('4iz268_favs', JSON.stringify(favorites));
            const type = favorites[index].type;
            App.fetchDetails(id, type, false);
        }
    },

    renderFavorites: function () {
        const favorites = JSON.parse(localStorage.getItem('4iz268_favs')) || [];
        App.$favoritesContent.empty();

        if (favorites.length > 0) {
            const favoriteItems = favorites.map(f => {
                const $favItem = $(`
                   <div class="fav-item-row">
                       <div class="fav-clickable">
                           <img src="${f.poster}" alt="${f.title}">
                           <span>${f.title}</span>
                       </div>
                       <button class="remove-direct" title="Remove">✖</button>
                   </div>`);

                $favItem.find('.fav-clickable').on('click', () => App.fetchDetails(f.id, f.type, true));
                $favItem.find('.remove-direct').on('click', (e) => {
                    e.stopPropagation();
                    App.updateFavorites({ id: f.id, title: f.title, name: f.title }, f.poster, true);
                });
                return $favItem;
            });
            App.$favoritesContent.append(favoriteItems);
        } else {
            App.$favoritesContent.html('<p>No favorites added yet.</p>');
        }
    },

    renderHome: function () {
        App.$dynamicContent.html('<h2>Welcome</h2><p>Use the search bar above to explore movies and series.</p>');
    }
};

$(document).ready(App.init);