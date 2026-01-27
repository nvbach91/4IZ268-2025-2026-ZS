const App = {
    API_KEY: '3d27426e467b2acfdfc56f7b4ac47300', 
    BASE_URL: 'https://api.themoviedb.org/3/',
    
    $searchForm: $('#search-form'),
    $searchInput: $('#search-input'),
    $dynamicContent: $('#dynamic-content'),
    $favoritesContent: $('#favorites-content'),

    init: function() {
        console.log('Aplikácia beží (4IZ268).');
        App.$searchForm.on('submit', App.handleSearch);
        App.loadFavorites();
    },

    handleSearch: function(e) {
        e.preventDefault();
        const query = App.$searchInput.val().trim();
        
        if (query) {
            App.searchMovies(query);
            App.$searchInput.val('');
        } else {
            alert('Prosím, zadajte hľadaný výraz.');
        }
    },

    searchMovies: function(query) {
        App.$dynamicContent.html('<h2>Dynamické hľadanie</h2><p>Načítavam výsledky...</p>'); 
        
        const url = `${App.BASE_URL}search/multi?api_key=${App.API_KEY}&query=${encodeURIComponent(query)}&language=sk-SK`;

        $.ajax({
            url: url,
            method: 'GET',
            success: function(response) {
                App.renderSearchResults(response.results);
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
                App.$dynamicContent.html('<h2>Chyba hľadania</h2><p>Nastala chyba pri načítavaní dát z TMDB API. Skontrolujte kľúč a sieťové pripojenie.</p>');
            }
        });
    },

    renderSearchResults: function(results) {
        let html = '<h2>Výsledky hľadania:</h2><div class="results-grid">';

        if (results && results.length > 0) {
            results.forEach(item => {
                if (item.media_type === 'movie' || item.media_type === 'tv') {
                    const title = item.title || item.name;
                    const year = (item.release_date || item.first_air_date) ? (item.release_date || item.first_air_date).substring(0, 4) : 'N/A';
                    const poster = item.poster_path ? `https://image.tmdb.org/t/p/w200${item.poster_path}` : 'https://via.placeholder.com/200x300?text=Bez+plagátu';

                    html += `
                        <div class="movie-card" data-id="${item.id}" data-type="${item.media_type}">
                            <img src="${poster}" alt="${title} plagát">
                            <p><strong>${title}</strong> (${year})</p>
                        </div>
                    `;
                }
            });
            html += '</div>';

            App.$dynamicContent.html(html);
            App.$dynamicContent.find('.movie-card').on('click', App.handleCardClick);
            
        } else {
            App.$dynamicContent.html('<h2>Výsledky hľadania</h2><p>Pre Váš dopyt neboli nájdené žiadne výsledky.</p>');
        }
    },

    handleCardClick: function() {
        const id = $(this).data('id');
        const type = $(this).data('type');
        console.log(`Kliknuté na titul: ID ${id}, Typ ${type}.`);
    },

    loadFavorites: function() {
        const favorites = JSON.parse(localStorage.getItem('4iz268_favorites')) || [];
        App.$favoritesContent.empty(); 

        if (favorites.length > 0) {
            App.$favoritesContent.append('<p>Načítané obľúbené ID: ' + favorites.join(', ') + '</p>');
        } else {
            App.$favoritesContent.append('<p>Zatiaľ nemáte žiadne obľúbené tituly.</p>');
        }
    }
};

$(document).ready(function() {
    App.init();
});