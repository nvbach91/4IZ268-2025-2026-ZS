//  API CONFIG 
// TMDB API key and base URL
const API_KEY = '0a4102b109e21ac8b9c68f8141338cb2';
const API_URL = 'https://api.themoviedb.org/3';


// Global state for search and filters
let currentQuery = '';
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};
let genresCache = [];
let currentMovieDetail = null;


//  HELPERS 


// Escape HTML to avoid XSS
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


//  LOCAL STORAGE (FAVOURITES) 


// Get favourites array from localStorage
function getFavourites() {
    try {
        const data = localStorage.getItem('favourites');
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading favourites:', e);
        return [];
    }
}


// Save favourites array to localStorage
function saveFavourites(favs) {
    try {
        localStorage.setItem('favourites', JSON.stringify(favs));
        updateFavCount();
    } catch (e) {
        console.error('Error saving favourites:', e);
        Swal.fire('Error', 'Could not save favourites.', 'error');
    }
}


// Check if movie is already in favourites
function checkIfFavourite(id) {
    const favs = getFavourites();
    return favs.some(f => f.id === id);
}


// Update favourites badge in navbar + text on favourites page
function updateFavCount() {
    const favs = getFavourites();
    const count = favs.length;
    const span = document.getElementById('favCount');
    const favText = document.getElementById('favCount-number');


    if (span) span.textContent = count;
    if (favText) favText.textContent = count;
}


//  SPA NAVIGATION 


// Show one page (home/search/favourites/detail/team) and hide others
function showPage(pageId) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(p => {
        p.style.display = (p.id === 'page-' + pageId) ? '' : 'none';
    });


    const links = document.querySelectorAll('.navbar-nav .nav-link');
    links.forEach(a => {
        if (a.dataset.page === pageId) {
            a.classList.add('active');
        } else {
            a.classList.remove('active');
        }
    });


    // Extra logic when switching pages
    if (pageId === 'favourites') {
        renderFavourites();
    } else if (pageId === 'detail') {
        if (!currentMovieDetail) {
            renderDetailFromStorage();
        }
    } else if (pageId === 'search') {
        // On search page, if nothing yet, show info message
        const res = document.getElementById('results');
        const info = document.getElementById('noResults');
        if (res && res.innerHTML.trim() === '' && info) {
            info.style.display = 'block';
        }
    }
}


//  GENRES (for filters) 


// Load list of genres from TMDB (for search and favourites)
async function loadGenres() {
    try {
        const res = await axios.get(`${API_URL}/genre/movie/list`, {
            params: { api_key: API_KEY, language: 'en-US' }
        });
        genresCache = res.data.genres || [];


        const genreSelect = document.getElementById('genreFilter');
        const favGenreSelect = document.getElementById('favGenreFilter');


        // Fill search genre dropdown
        if (genreSelect) {
            genresCache.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = g.name;
                genreSelect.appendChild(opt);
            });
        }


        // Fill favourites genre dropdown
        if (favGenreSelect) {
            genresCache.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.id;
                opt.textContent = g.name;
                favGenreSelect.appendChild(opt);
            });
        }
    } catch (e) {
        console.error('Error loading genres:', e);
    }
}


// Convert array of genre ids to names
function getGenreNames(ids) {
    if (!Array.isArray(ids)) return [];
    return ids
        .map(id => {
            const g = genresCache.find(x => x.id === id);
            return g ? g.name : null;
        })
        .filter(Boolean);
}


//  SEARCH MOVIES 


// Call TMDB API with query, page and filters
async function searchMovies(query, page = 1, filters = {}) {
    if (!query.trim()) {
        // Empty query -> show info message, clear results
        const info = document.getElementById('noResults');
        const res = document.getElementById('results');
        const more = document.getElementById('loadMoreContainer');
        if (info) info.style.display = '';
        if (res) res.innerHTML = '';
        if (more) more.style.display = 'none';
        return;
    }


    const info = document.getElementById('noResults');
    if (info) info.style.display = 'none';


    currentQuery = query;
    currentPage = page;
    currentFilters = filters;


    try {
        // Basic search request
        const params = {
            api_key: API_KEY,
            query: query,
            language: 'en-US',
            page: page
        };


        const res = await axios.get(`${API_URL}/search/movie`, { params });
        let movies = res.data.results || [];
        totalPages = res.data.total_pages || 1;


        // Filter by year
        if (filters.minYear) {
            movies = movies.filter(m => {
                const year = m.release_date ? parseInt(m.release_date.split('-')[0]) : 0;
                return year >= filters.minYear;
            });
        }


        // Filter by rating
        if (filters.minRating) {
            movies = movies.filter(m => m.vote_average >= filters.minRating);
        }


        // Filter by genre (if we have genre_ids)
        if (filters.genreId) {
            movies = movies.filter(m => m.genre_ids && m.genre_ids.includes(filters.genreId));
        }


        // Sorting
        if (filters.sort === 'rating') {
            movies.sort((a, b) => b.vote_average - a.vote_average);
        } else if (filters.sort === 'release_date') {
            movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));
        } else {
            movies.sort((a, b) => b.popularity - a.popularity);
        }


        const append = page > 1;
        renderResults(movies, append);


        // Show/hide Load More
        const loadMore = document.getElementById('loadMoreContainer');
        if (loadMore) {
            if (page < totalPages && movies.length > 0) {
                loadMore.style.display = 'block';
            } else {
                loadMore.style.display = 'none';
            }
        }


        // Save filters in URL as params
        const url = new URL(window.location.href);
        url.searchParams.set('q', query);
        if (filters.minYear) url.searchParams.set('minYear', filters.minYear); else url.searchParams.delete('minYear');
        if (filters.minRating) url.searchParams.set('minRating', filters.minRating); else url.searchParams.delete('minRating');
        if (filters.sort) url.searchParams.set('sort', filters.sort); else url.searchParams.delete('sort');
        if (filters.genreId) url.searchParams.set('genre', filters.genreId); else url.searchParams.delete('genre');
        history.replaceState({}, '', url.toString());


    } catch (e) {
        console.error('Error searching movies:', e);
        Swal.fire('Error', 'Error searching movies. Please try again.', 'error');
    }
}


// Render list of movies cards into #results
function renderResults(movies, append = false) {
    const container = document.getElementById('results');
    if (!container) return;


    if (!movies || movies.length === 0) {
        if (!append) {
            container.innerHTML = '<p class="text-muted">No movies found.</p>';
        }
        return;
    }


    const favs = getFavourites();
    const favIds = favs.map(f => f.id);


    const html = movies.map(movie => {
        const title = escapeHtml(movie.title) || 'Unknown';
        const year = movie.release_date ? movie.release_date.split('-')[0] : 'N/A';
        const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
        const isFav = favIds.includes(movie.id);


        const genres = getGenreNames(movie.genre_ids || []);
        const genresText = genres.length ? `<div class="film-year">${genres.join(', ')}</div>` : '';


        return `
        <div class="col-md-3">
            <div class="film-card ${isFav ? 'is-favourite' : ''}" data-movie-id="${movie.id}">
                <div class="film-poster" data-action="detail" data-id="${movie.id}">
                    ${movie.poster_path
                        ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${title}">`
                        : '<div class="no-poster">📷 No Poster</div>'}
                </div>
                <div class="film-info">
                    <div class="film-title">${title}</div>
                    <div class="film-year">${year}</div>
                    <div class="rating mt-2">⭐ ${rating}</div>
                    ${genresText}
                    <div class="mt-2">
                        <button class="btn btn-sm btn-success w-100" data-action="detail" data-id="${movie.id}">View Details</button>
                        <button class="btn btn-sm ${isFav ? 'btn-danger' : 'btn-warning'} w-100 mt-1" data-action="toggle-fav" data-id="${movie.id}"
                            data-title="${title}" data-poster="${movie.poster_path || ''}">
                            ${isFav ? 'Remove from Fav' : 'Add to Fav'}
                        </button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');


    if (append) {
        container.insertAdjacentHTML('beforeend', html);
    } else {
        container.innerHTML = html;
    }
}


//  MOVIE DETAIL 


// Load one movie detail from API by id
async function loadMovieDetail(id) {
    try {
        const res = await axios.get(`${API_URL}/movie/${id}`, {
            params: { api_key: API_KEY, language: 'en-US' }
        });
        return res.data;
    } catch (e) {
        console.error('Error loading movie detail:', e);
        return null;
    }
}


// Render detail page for given movie id
async function renderDetail(id) {
    const container = document.getElementById('movieDetail');
    if (!container) return;


    if (!id) {
        container.innerHTML = '<div class="alert alert-warning">No movie selected. <a href="#" data-page="search">Go search</a></div>';
        return;
    }


    container.innerHTML = '<p>Loading movie details...</p>';
    const movie = await loadMovieDetail(id);
    currentMovieDetail = movie;


    if (!movie) {
        container.innerHTML = '<div class="alert alert-danger">Error loading movie details.</div>';
        return;
    }


    const title = escapeHtml(movie.title) || 'Unknown';
    const overview = escapeHtml(movie.overview || 'No description available.');
    const isFav = checkIfFavourite(movie.id);


    const genres = movie.genres ? movie.genres.map(g => g.name).join(', ') : '';
    const companies = movie.production_companies ? movie.production_companies.map(c => c.name).join(', ') : '';
    const collection = movie.belongs_to_collection ? movie.belongs_to_collection.name : '';


    const collectionBlock = collection ? `<p><strong>Collection:</strong> ${escapeHtml(collection)}</p>` : '';
    const companiesBlock = companies ? `<p><strong>Production companies:</strong> ${escapeHtml(companies)}</p>` : '';


    container.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                ${movie.poster_path
                    ? `<img src="https://image.tmdb.org/t/p/w300${movie.poster_path}" alt="${title}" class="img-fluid rounded" style="max-height: 500px; object-fit: cover;">`
                    : '<div class="no-poster-detail">📷 No Poster</div>'}
            </div>
            <div class="col-md-8">
                <h1>${title}</h1>
                <p class="text-muted"><strong>Release Date:</strong> ${movie.release_date || 'N/A'}</p>
                <p><strong>Rating:</strong> ⭐ ${movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A'}/10</p>
                <p><strong>Runtime:</strong> ${movie.runtime || 'N/A'} minutes</p>
                ${genres ? `<p><strong>Genres:</strong> ${genres}</p>` : ''}
                ${collectionBlock}
                ${companiesBlock}


                <h3 class="mt-4">Overview</h3>
                <p>${overview}</p>


                <div class="mt-4">
                    <button class="btn ${isFav ? 'btn-danger' : 'btn-success'} btn-lg me-2" id="detailFavBtn"
                        data-id="${movie.id}" data-title="${title}" data-poster="${movie.poster_path || ''}">
                        ${isFav ? 'Remove from Favourites' : 'Add to Favourites'}
                    </button>
                    <button class="btn btn-secondary btn-lg" data-page="search">Back to Search</button>
                </div>
            </div>
        </div>
    `;


    // Save last opened movie id to localStorage
    localStorage.setItem('selectedMovieId', movie.id);
}


// If user opens "Details" tab directly, load from localStorage
function renderDetailFromStorage() {
    const id = localStorage.getItem('selectedMovieId');
    if (id) {
        renderDetail(parseInt(id, 10));
    }
}


//  FAVOURITES LIST 


// Render favourite movies in favourites page
function renderFavourites() {
    const list = document.getElementById('favouriteList');
    const noFav = document.getElementById('noFavourites');
    const favSearch = document.getElementById('favSearchInput');
    const favGenre = document.getElementById('favGenreFilter');


    if (!list) return;


    let favs = getFavourites();


    // Text search inside favourites
    if (favSearch && favSearch.value.trim()) {
        const q = favSearch.value.toLowerCase();
        favs = favs.filter(f => f.title.toLowerCase().includes(q));
    }


    // Genre filter
    if (favGenre && favGenre.value) {
        const genreId = parseInt(favGenre.value);
        favs = favs.filter(f => Array.isArray(f.genre_ids) && f.genre_ids.includes(genreId));
    }


    if (!favs.length) {
        list.innerHTML = '';
        if (noFav) noFav.style.display = '';
        return;
    }


    if (noFav) noFav.style.display = 'none';


    const html = favs.map(movie => {
        const title = escapeHtml(movie.title) || 'Unknown';
        return `
        <div class="col-md-3">
            <div class="film-card is-favourite" data-movie-id="${movie.id}">
                <div class="film-poster" data-action="detail" data-id="${movie.id}">
                    ${movie.poster_path
                        ? `<img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${title}">`
                        : '<div class="no-poster">📷 No Poster</div>'}
                </div>
                <div class="film-info">
                    <div class="film-title">${title}</div>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info w-100" data-action="detail" data-id="${movie.id}">View Details</button>
                        <button class="btn btn-sm btn-danger w-100 mt-1" data-action="remove-fav" data-id="${movie.id}">Remove</button>
                    </div>
                </div>
            </div>
        </div>`;
    }).join('');


    list.innerHTML = html;
}


//  FAVOURITES TOGGLE / REMOVE 


// Add/remove favourite (used from cards and detail)
function toggleFavouriteSimple(id, title, posterPath) {
    id = parseInt(id);
    let favs = getFavourites();
    const idx = favs.findIndex(f => f.id === id);


    if (idx > -1) {
        // Remove without extra confirm (confirm is separate function)
        favs.splice(idx, 1);
        saveFavourites(favs);
        Swal.fire('Removed', 'Removed from favourites.', 'success');
    } else {
        // If we have currentMovieDetail, we can keep genre_ids for filter in favourites
        favs.push({
            id,
            title,
            poster_path: posterPath,
            genre_ids: currentMovieDetail?.genres?.map(g => g.id) || []
        });
        saveFavourites(favs);
        Swal.fire('Added', 'Added to favourites.', 'success');
    }
}


// Ask confirmation before removing from favourites list
function confirmRemoveFavourite(id) {
    Swal.fire({
        title: 'Remove movie?',
        text: 'Do you really want to remove this movie from favourites?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, remove',
        cancelButtonText: 'Cancel'
    }).then(result => {
        if (result.isConfirmed) {
            id = parseInt(id);
            let favs = getFavourites();
            favs = favs.filter(f => f.id !== id);
            saveFavourites(favs);
            renderFavourites();
            Swal.fire('Removed', 'Movie removed from favourites.', 'success');
        }
    });
}


//  INITIALIZATION 


document.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements once (no repeated queries in loops)
    const nav = document.querySelector('nav');
    const main = document.querySelector('main');
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    const yearFilter = document.getElementById('yearFilter');
    const ratingFilter = document.getElementById('ratingFilter');
    const sortFilter = document.getElementById('sortFilter');
    const genreFilter = document.getElementById('genreFilter');
    const filterBtn = document.getElementById('filterBtn');
    const resetBtn = document.getElementById('resetBtn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const favSearchInput = document.getElementById('favSearchInput');
    const favGenreFilter = document.getElementById('favGenreFilter');


    // Update favourites badge and load genres for filters
    updateFavCount();
    loadGenres();


    // SPA navigation via data-page
    if (nav) {
        nav.addEventListener('click', (e) => {
            const link = e.target.closest('[data-page]');
            if (!link) return;
            e.preventDefault();
            const page = link.dataset.page;
            showPage(page);
        });
    }


    // Delegated events inside main (cards buttons etc.)
    if (main) {
        main.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-action]');
            if (!btn) return;
            const action = btn.dataset.action;
            const id = btn.dataset.id;


            if (action === 'detail') {
                // View details from card
                localStorage.setItem('selectedMovieId', id);
                showPage('detail');
                renderDetail(parseInt(id));
            } else if (action === 'toggle-fav') {
                // Add/remove favourites from card
                const title = btn.dataset.title;
                const poster = btn.dataset.poster || '';
                toggleFavouriteSimple(id, title, poster);


                const card = btn.closest('.film-card');
                const isNowFav = checkIfFavourite(parseInt(id, 10));
                if (card) {
                    card.classList.toggle('is-favourite', isNowFav);
                }
                btn.classList.toggle('btn-danger', isNowFav);
                btn.classList.toggle('btn-warning', !isNowFav);
                btn.textContent = isNowFav ? 'Remove from Fav' : 'Add to Fav';
            } else if (action === 'remove-fav') {
                // Remove from favourites list
                confirmRemoveFavourite(id);
            }
        });


        main.addEventListener('click', (e) => {
            const link = e.target.closest('a[data-page]');
            if (!link) return;
            e.preventDefault();
            const page = link.getAttribute('data-page');
            showPage(page);
        });
    }


    // Search button
    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value;
            const filters = {
                minYear: yearFilter && yearFilter.value ? parseInt(yearFilter.value, 10) : null,
                minRating: ratingFilter && ratingFilter.value ? parseFloat(ratingFilter.value) : null,
                sort: sortFilter ? sortFilter.value : 'popularity',
                genreId: genreFilter && genreFilter.value ? parseInt(genreFilter.value, 10) : null
            };
            showPage('search');
            searchMovies(query, 1, filters);
        });


        // Press Enter in search input
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }


    // Apply filters button
    if (filterBtn && searchInput) {
        filterBtn.addEventListener('click', () => {
            const query = searchInput.value;
            const filters = {
                minYear: yearFilter && yearFilter.value ? parseInt(yearFilter.value, 10) : null,
                minRating: ratingFilter && ratingFilter.value ? parseFloat(ratingFilter.value) : null,
                sort: sortFilter ? sortFilter.value : 'popularity',
                genreId: genreFilter && genreFilter.value ? parseInt(genreFilter.value, 10) : null
            };
            searchMovies(query, 1, filters);
        });
    }


    // Reset filters
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (yearFilter) yearFilter.value = '';
            if (ratingFilter) ratingFilter.value = '';
            if (sortFilter) sortFilter.value = 'popularity';
            if (genreFilter) genreFilter.value = '';
            const query = searchInput ? searchInput.value : '';
            searchMovies(query, 1, {
                minYear: null,
                minRating: null,
                sort: 'popularity',
                genreId: null
            });
        });
    }


    // Load more results
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                searchMovies(currentQuery, currentPage + 1, currentFilters);
            }
        });
    }


    // Detail page favourite button (inside #movieDetail)
    const movieDetailContainer = document.getElementById('movieDetail');
    if (movieDetailContainer) {
        movieDetailContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('#detailFavBtn');
            if (!btn) return;
            const id = btn.dataset.id;
            const title = btn.dataset.title;
            const poster = btn.dataset.poster || '';
            toggleFavouriteSimple(id, title, poster);
            const isFav = checkIfFavourite(parseInt(id, 10));
            btn.textContent = isFav ? 'Remove from Favourites' : 'Add to Favourites';
            btn.classList.toggle('btn-danger', isFav);
            btn.classList.toggle('btn-success', !isFav);
        });


        // Back to search button on detail page (data-page="search")
        movieDetailContainer.addEventListener('click', (e) => {
            const backBtn = e.target.closest('button[data-page="search"], a[data-page="search"]');
            if (!backBtn) return;
            e.preventDefault();
            showPage('search');
        });
    }


    // Favourites filters (search text, genre)
    if (favSearchInput) {
        favSearchInput.addEventListener('input', renderFavourites);
    }
    if (favGenreFilter) {
        favGenreFilter.addEventListener('change', renderFavourites);
    }


    // Restore search state from URL if exists
    const url = new URL(window.location.href);
    const q = url.searchParams.get('q');
    if (q && searchInput) {
        searchInput.value = q;
        const filters = {
            minYear: url.searchParams.get('minYear') ? parseInt(url.searchParams.get('minYear'), 10) : null,
            minRating: url.searchParams.get('minRating') ? parseFloat(url.searchParams.get('minRating')) : null,
            sort: url.searchParams.get('sort') || 'popularity',
            genreId: url.searchParams.get('genre') ? parseInt(url.searchParams.get('genre'), 10) : null
        };
        showPage('search');
        searchMovies(q, 1, filters);
    } else {
        // Default page on load = search
        showPage('search');
    }
});
