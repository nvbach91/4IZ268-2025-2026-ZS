// Movie Library - Main JavaScript
// Základní konfigurace pro TMDB API

// API klíč pro TMDB (The Movie Database)
const API_KEY = '0a4102b109e21ac8b9c68f8141338cb2';
// Základní URL adresa pro všechny API požadavky
const API_URL = 'https://api.themoviedb.org/3';


// === SEARCH MOVIES WITH FILTERS ===
// Funkce pro vyhledávání filmů podle názvu + použití filtrů (rok, hodnocení, řazení)
async function searchMovies(query, filters = {}) {
    // Pokud je vyhledávací dotaz prázdný, nic nedělej
    if (!query.trim()) {
        return;
    }

    try {
        // HTTP GET požadavek na TMDB API pro vyhledání filmů
        const response = await axios.get(`${API_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                query: query,
                language: 'en-US'
            }
        });

        // Pole filmů z odpovědi API
        let movies = response.data.results;

        // Apply filters
        // Filtrování podle minimálního roku vydání
        if (filters.minYear) {
            movies = movies.filter(m => {
                const year = m.release_date ? parseInt(m.release_date.split('-')[0]) : 0;
                return year >= filters.minYear;
            });
        }

        // Filtrování podle minimálního hodnocení
        if (filters.minRating) {
            movies = movies.filter(m => m.vote_average >= filters.minRating);
        }

        // Sort
        // Řazení podle zvoleného kritéria
        if (filters.sort === 'vote_average.desc') {
            // Řazení podle hodnocení (nejlepší nahoře)
            movies.sort((a, b) => b.vote_average - a.vote_average);
        } else if (filters.sort === 'release_date.desc') {
            // Řazení podle data vydání (nejnovější nahoře)
            movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        } else {
            // Výchozí řazení podle popularity
            movies.sort((a, b) => b.popularity - a.popularity);
        }

        // Zobrazení výsledků na stránce
        displayResults(movies);
    } catch (error) {
        // Výpis chyby do konzole + jednoduchá hláška uživateli
        console.error('Error searching movies:', error);
        alert('Error searching movies. Please try again.');
    }
}


// === DISPLAY SEARCH RESULTS ===
// Vykreslí nalezené filmy jako karty na stránce Search Movies
function displayResults(movies) {
    // Najdeme kontejner pro výsledky
    const resultsContainer = document.getElementById('results');

    // Pokud kontejner neexistuje, ukončíme funkci
    if (!resultsContainer) return;

    // Když nejsou žádné filmy, zobrazí se text
    if (!movies || movies.length === 0) {
        resultsContainer.innerHTML = '<p class="text-muted">No movies found.</p>';
        return;
    }

    // Vygenerujeme HTML pro každou filmovou kartu
    resultsContainer.innerHTML = movies.map(movie => `
        <div class="col-md-3">
            <div class="film-card">
                <!-- Plakát filmu, kliknutím přejdu na detail -->
                <div class="film-poster" onclick="goToDetail(${movie.id})" style="cursor: pointer;">
                    ${movie.poster_path 
                        ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${escapeHtml(movie.title) || 'No title'}" style="width: 100%; height: 100%; object-fit: cover;">` 
                        : '<div class="no-poster">📷 No Poster</div>'}
                </div>
                <!-- Textové informace o filmu -->
                <div class="film-info">
                    <div class="film-title">${escapeHtml(movie.title) || 'Unknown'}</div>
                    <div class="film-year">${movie.release_date ? movie.release_date.split('-')[0] : 'N/A'}</div>
                    <div class="rating mt-2">⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}</div>
                    <!-- Tlačítka pro detail a rychlé přidání do oblíbených -->
                    <div class="mt-2">
                        <button class="btn btn-sm btn-success w-100" onclick="goToDetail(${movie.id})">View Details</button>
                        <button class="btn btn-sm btn-warning w-100 mt-1" onclick="addQuickFavourite(${movie.id}, '${escapeHtml(movie.title).replace(/'/g, "\\'")}', '${movie.poster_path || ''}')">Add to Fav</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}


// === ESCAPE HTML (for security) ===
// Pomocná funkce: escapuje speciální znaky v textu, aby se nespouštěl HTML/JS
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}


// === GO TO DETAIL PAGE ===
// Uloží ID filmu do localStorage a přesměruje na stránku s detailem
function goToDetail(movieId) {
    localStorage.setItem('selectedMovieId', movieId);
    window.location.href = '../detail/';
}


// === QUICK ADD TO FAVOURITE (without detail page) ===
// Rychlé přidání filmu do oblíbených přímo z výsledků hledání
function addQuickFavourite(movieId, title, posterPath) {
    movieId = parseInt(movieId);
    let favourites = getFavourites();
    const index = favourites.findIndex(fav => fav.id === movieId);

    // Pokud už film v oblíbených je, jen ukážeme hlášku
    if (index > -1) {
        alert('Already in favourites!');
        return;
    }

    // Jinak film přidáme
    favourites.push({
        id: movieId,
        title: title,
        poster_path: posterPath
    });

    // Uložíme zpět do localStorage
    saveFavourites(favourites);
    alert('Added to favourites!');
}


// === GET MOVIE DETAILS FROM API ===
// Načte detailní informace o jednom filmu z TMDB API
async function getMovieDetail(movieId) {
    try {
        const response = await axios.get(`${API_URL}/movie/${movieId}`, {
            params: {
                api_key: API_KEY,
                language: 'en-US'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching movie detail:', error);
        return null;
    }
}


// === DISPLAY MOVIE DETAIL ===
// Vykreslí detailní informace o vybraném filmu na stránce Detail
async function displayMovieDetail() {
    // Přečteme ID filmu, které bylo uloženo při kliknutí na kartu
    const movieId = localStorage.getItem('selectedMovieId');
    const detailContainer = document.getElementById('movieDetail');

    // Když kontejner neexistuje, nemá smysl pokračovat
    if (!detailContainer) {
        return;
    }

    // Pokud není ID, uživatel přišel přímo na stránku detailu
    if (!movieId) {
        detailContainer.innerHTML = '<div class="alert alert-warning">No movie selected. <a href="../films/">Go back to search</a></div>';
        return;
    }

    // Zobrazíme načítání
    detailContainer.innerHTML = '<div class="text-center"><p>Loading movie details...</p></div>';

    // Načtení dat o filmu z API
    const movie = await getMovieDetail(movieId);

    // Pokud se něco pokazilo, zobrazíme chybu
    if (!movie) {
        detailContainer.innerHTML = '<div class="alert alert-danger">Error loading movie details. <a href="../films/">Try searching again</a></div>';
        return;
    }

    // Zjistíme, jestli je film v oblíbených
    const isFavourite = checkIfFavourite(parseInt(movieId));
    const buttonText = isFavourite ? 'Remove from Favourites' : 'Add to Favourites';
    const buttonClass = isFavourite ? 'btn-danger' : 'btn-success';

    const overview = movie.overview || 'No description available.';
    const title = escapeHtml(movie.title) || 'Unknown';

    // Poskládáme HTML detailu filmu
    detailContainer.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                ${movie.poster_path 
                    ? `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${title}" class="img-fluid rounded" style="max-height: 500px; object-fit: cover;">` 
                    : '<div class="no-poster-detail">📷 No Poster Available</div>'}
            </div>
            <div class="col-md-8">
                <h1>${title}</h1>
                <p class="text-muted"><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <p><strong>Rating:</strong> ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                <p><strong>Runtime:</strong> ${movie.runtime || 'N/A'} minutes</p>
                ${movie.genres ? `<p><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>` : ''}
                
                <h3 class="mt-4">Overview</h3>
                <p>${escapeHtml(overview)}</p>
                
                <div class="mt-4">
                    <!-- Tlačítko pro přidání/odebrání z oblíbených -->
                    <button class="btn ${buttonClass} btn-lg me-2" onclick="toggleFavourite(${movieId}, '${title.replace(/'/g, "\\'")}', '${movie.poster_path || ''}')">
                        ${buttonText}
                    </button>
                    <!-- Návrat zpět na stránku s vyhledáváním -->
                    <a href="../films/" class="btn btn-secondary btn-lg">Back to Search</a>
                </div>
            </div>
        </div>
    `;
}


// === FAVOURITE FUNCTIONS ===
// Sada funkcí pro práci s oblíbenými filmy v localStorage

// Vrátí pole oblíbených filmů z localStorage
function getFavourites() {
    try {
        const favourites = localStorage.getItem('favourites');
        return favourites ? JSON.parse(favourites) : [];
    } catch (e) {
        console.error('Error reading favourites:', e);
        return [];
    }
}

// Uloží pole oblíbených filmů do localStorage
function saveFavourites(favourites) {
    try {
        localStorage.setItem('favourites', JSON.stringify(favourites));
    } catch (e) {
        console.error('Error saving favourites:', e);
        alert('Could not save to favourites. Storage may be full.');
    }
}

// Zjistí, jestli daný film už je v oblíbených
function checkIfFavourite(movieId) {
    const favourites = getFavourites();
    return favourites.some(fav => fav.id === movieId);
}

// Přidá nebo odebere film z oblíbených (toggle)
function toggleFavourite(movieId, title, posterPath) {
    movieId = parseInt(movieId);
    let favourites = getFavourites();
    const index = favourites.findIndex(fav => fav.id === movieId);

    if (index > -1) {
        // Remove
        favourites.splice(index, 1);
        alert('Removed from favourites!');
    } else {
        // Add
        favourites.push({
            id: movieId,
            title: title,
            poster_path: posterPath
        });
        alert('Added to favourites!');
    }

    saveFavourites(favourites);
    // Po změně znovu vykreslí detail, aby se změnil text tlačítka
    displayMovieDetail();
}


// === DISPLAY FAVOURITES ===
// Vykreslí všechny oblíbené filmy na stránce Favourites
function displayFavourites() {
    const favouriteList = document.getElementById('favouriteList');
    const favourites = getFavourites();

    // Pokud kontejner neexistuje, nic neděláme
    if (!favouriteList) return;

    // Když nejsou žádné oblíbené filmy
    if (!favourites || favourites.length === 0) {
        favouriteList.innerHTML = '<div class="col-12"><div class="alert alert-info">No favourite movies yet. <a href="../films/">Start searching</a></div></div>';
        return;
    }

    // Vygenerujeme karty pro každý oblíbený film
    favouriteList.innerHTML = favourites.map(movie => `
        <div class="col-md-3">
            <div class="film-card">
                <div class="film-poster" onclick="goToDetail(${movie.id})" style="cursor: pointer;">
                    ${movie.poster_path 
                        ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${escapeHtml(movie.title) || 'No title'}" style="width: 100%; height: 100%; object-fit: cover;">` 
                        : '<div class="no-poster">📷 No Poster</div>'}
                </div>
                <div class="film-info">
                    <div class="film-title">${escapeHtml(movie.title) || 'Unknown'}</div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info w-100" onclick="goToDetail(${movie.id})">View Details</button>
                        <button class="btn btn-sm btn-danger w-100 mt-1" onclick="removeFavourite(${movie.id})">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Odebrání konkrétního filmu z oblíbených
function removeFavourite(movieId) {
    movieId = parseInt(movieId);
    let favourites = getFavourites();
    favourites = favourites.filter(fav => fav.id !== movieId);
    saveFavourites(favourites);
    displayFavourites();
}


// === EVENT LISTENERS ===
// Hlavní inicializace – spustí se po načtení celé stránky
document.addEventListener('DOMContentLoaded', function() {
    // Search page
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const filterBtn = document.getElementById('filterBtn');
    const yearFilter = document.getElementById('yearFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortFilter = document.getElementById('sortFilter');

    // Klik na tlačítko Search
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            const query = searchInput.value;
            const filters = {
                minYear: yearFilter && yearFilter.value ? parseInt(yearFilter.value) : null,
                minRating: ratingFilter && ratingFilter.value ? parseFloat(ratingFilter.value) : null,
                sort: sortFilter && sortFilter.value === 'rating' ? 'vote_average.desc' : 
                      sortFilter && sortFilter.value === 'release_date' ? 'release_date.desc' : 
                      'popularity.desc'
            };
            searchMovies(query, filters);
        });
    }

    // Enter v inputu spustí hledání
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = searchInput.value;
                const filters = {
                    minYear: yearFilter && yearFilter.value ? parseInt(yearFilter.value) : null,
                    minRating: ratingFilter && ratingFilter.value ? parseFloat(ratingFilter.value) : null,
                    sort: sortFilter && sortFilter.value === 'rating' ? 'vote_average.desc' : 
                          sortFilter && sortFilter.value === 'release_date' ? 'release_date.desc' : 
                          'popularity.desc'
                };
                searchMovies(query, filters);
            }
        });
    }

    // Klik na Apply Filters
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            const query = searchInput.value;
            const filters = {
                minYear: yearFilter && yearFilter.value ? parseInt(yearFilter.value) : null,
                minRating: ratingFilter && ratingFilter.value ? parseFloat(ratingFilter.value) : null,
                sort: sortFilter && sortFilter.value === 'rating' ? 'vote_average.desc' : 
                      sortFilter && sortFilter.value === 'release_date' ? 'release_date.desc' : 
                      'popularity.desc'
            };
            searchMovies(query, filters);
        });
    }

    // Detail page – pokud existuje kontejner pro detail, zavoláme vykreslení
    if (document.getElementById('movieDetail')) {
        displayMovieDetail();
    }

    // Favourites page – pokud existuje kontejner pro oblíbené, vykreslíme je
    if (document.getElementById('favouriteList')) {
        displayFavourites();
    }
});
