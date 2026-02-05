const App = {
    API_KEY: '3d27426e467b2acfdfc56f7b4ac47300',
    BASE_URL: 'https://api.themoviedb.org/3/',

    // DOM elements
    $searchInput: $('#search-input'),
    $dynamicContent: $('#dynamic-content'),
    $favoritesContent: $('#favorites-content'),

    init: function () {
        $('#search-form').on('submit', App.handleSearch);
        $('#logo').on('click', App.renderHome);

        // History API to handle browser back/forward buttons
        $(window).on('popstate', function (e) {
            const state = e.originalEvent.state;
            if (state) {
                if (state.view === 'search') App.fetchMovies(state.query, false);
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
            App.fetchMovies(query, true);
        }
    },

    fetchMovies: function (query, pushState) {
        // Update URL without page refresh
        if (pushState) window.history.pushState({ view: 'search', query: query }, '', `?search=${encodeURIComponent(query)}`);

        App.$dynamicContent.html('<div class="loader">Searching for movies...</div>');

        const url = `${App.BASE_URL}search/multi?api_key=${App.API_KEY}&query=${encodeURIComponent(query)}&language=en-US`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function (response) {
                App.renderResults(response.results, query);
            },
            error: function () {
                App.$dynamicContent.html('<h2>Error</h2><p>Connection to TMDB API failed.</p>');
            }
        });
    },

    renderResults: function (results, query) {
        // Build HTML string first to minimize DOM manipulations
        let resultsHtml = `<h2>Results for: "${query}"</h2><div class="results-grid">`;
        let count = 0;

        results.forEach(item => {
            if (item.media_type === 'movie' || item.media_type === 'tv') {
                const title = item.title || item.name;
                const date = item.release_date || item.first_air_date;
                const year = (date && date.length >= 4) ? ` (${date.substring(0, 4)})` : '';

                const poster = item.poster_path
                    ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                    : 'https://placehold.co/200x300?text=No+Poster';

                resultsHtml += `
                    <div class="movie-card" data-id="${item.id}" data-type="${item.media_type}">
                        <img src="${poster}" alt="${title}">
                        <strong>${title}${year}</strong>
                    </div>`;
                count++;
            }
        });

        resultsHtml += '</div>';

        if (count === 0) {
            App.$dynamicContent.html('<h2>No results found.</h2>');
        } else {
            App.$dynamicContent.html(resultsHtml);
            $('.movie-card').on('click', function () {
                const $el = $(this);
                App.fetchDetails($el.data('id'), $el.data('type'), true);
            });
        }
    },

    fetchDetails: function (id, type, pushState) {
        if (pushState) window.history.pushState({ view: 'detail', id: id, type: type }, '', `?id=${id}`);

        App.$dynamicContent.html('<div class="loader">Loading details...</div>');
        const url = `${App.BASE_URL}${type}/${id}?api_key=${App.API_KEY}&language=en-US`;

        $.get(url, function (data) {
            const title = data.title || data.name;
            const date = data.release_date || data.first_air_date;
            const year = (date && date.length >= 4) ? ` (${date.substring(0, 4)})` : '';
            const fullDate = date ? date : 'Unknown';

            const poster = data.poster_path
                ? `https://image.tmdb.org/t/p/w500${data.poster_path}`
                : 'https://placehold.co/500x750?text=No+Poster';

            const detailHtml = `
                <button class="back-btn" onclick="window.history.back()">← BACK</button>
                <div class="detail-view">
                    <div class="detail-poster"><img src="${poster}" alt="${title}"></div>
                    <div class="detail-info">
                        <h2>${title}${year}</h2>
                        <p>${data.overview || 'No description available.'}</p>
                        <p><strong>Rating:</strong> ${data.vote_average}/10</p>
                        <p><strong>Release Date:</strong> ${fullDate}</p>
                        <button id="fav-toggle" class="fav-btn">ADD / REMOVE FAVORITE</button>
                    </div>
                </div>`;

            App.$dynamicContent.html(detailHtml);
            $('#fav-toggle').on('click', () => App.updateFavorites(data.id, title));
        });
    },

    updateFavorites: function (id, title) {
        // LocalStorage API to manage favorites
        let favorites = JSON.parse(localStorage.getItem('4iz268_favs')) || [];
        const index = favorites.findIndex(f => f.id === id);

        if (index > -1) {
            favorites.splice(index, 1);
        } else {
            favorites.push({ id: id, title: title });
        }

        localStorage.setItem('4iz268_favs', JSON.stringify(favorites));
        App.renderFavorites();
    },

    renderFavorites: function () {
        const favorites = JSON.parse(localStorage.getItem('4iz268_favs')) || [];
        App.$favoritesContent.empty();

        if (favorites.length > 0) {
            let favHtml = '';
            favorites.forEach(f => {
                favHtml += `<div class="fav-item" data-id="${f.id}">${f.title}</div>`;
            });
            App.$favoritesContent.html(favHtml);

            $('.fav-item').on('click', function () {
                App.fetchDetails($(this).data('id'), 'movie', true);
            });
        } else {
            App.$favoritesContent.html('<p>No favorites added yet.</p>');
        }
    },

    renderHome: function () {
        App.$dynamicContent.html('<h2>Welcome</h2><p>Use the search bar above to explore movies and series.</p>');
    }
};

$(document).ready(App.init);