// Film Knihovna - Main JS

const API_KEY = '0a4102b109e21ac8b9c68f8141338cb2'; 
const API_URL = 'https://api.themoviedb.org/3';

// Funkce pro hledání filmů
async function searchFilms(query) {
    if (!query.trim()) {
        return;
    }

    try {
        const response = await axios.get(`${API_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                query: query,
                language: 'cs-CZ'
            }
        });

        displayResults(response.data.results);
    } catch (error) {
        console.error('Chyba při hledání:', error);
    }
}





// Zobrazení výsledků
function displayResults(films) {
    const resultsContainer = document.getElementById('results');
    
    if (!resultsContainer) return;
    
    if (films.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted">Žádné filmy nebyly nalezeny.</p>';
        return;
    }

    resultsContainer.innerHTML = films.map(film => `
        <div class="col-md-3">
            <div class="film-card" onclick="viewDetail(${film.id})">
                <div class="film-poster">
                    ${film.poster_path ? `<img src="https://image.tmdb.org/t/p/w200${film.poster_path}" alt="${film.title}" style="width: 100%; height: 100%; object-fit: cover;">` : '📷 Bez plakátu'}
                </div>
                <div class="film-info">
                    <div class="film-title">${film.title}</div>
                    <div class="film-year">${film.release_date ? film.release_date.split('-')[0] : 'N/A'}</div>
                    <div class="rating mt-2">⭐ ${film.vote_average.toFixed(1)}</div>
                </div>
            </div>
        </div>
    `).join('');
}




// Zobrazit detail
function viewDetail(filmId) {
    console.log('Detail filmu:', filmId);
    // TODO: Přesměrovat na detail stránku
}




// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value;
            searchFilms(query);
        });
    }

    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                searchFilms(query);
            }
        });
    }
});
