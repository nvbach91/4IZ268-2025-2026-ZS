/**
 * Discover View
 */
import { API } from '../api.js';
import { appStore } from '../store.js';
import { UI } from '../ui.js';
import { Router } from '../router.js';

const MAX_PAGES = 5; // --- Manual limit to avoid excessive requests ---

let state = {
    page: 1,
    loading: false,
    hasMore: true,
    filters: {
        search: '',
        genre: '',
        platform: '',
        year: '',
        ordering: '-added' // Default popular
    }
};

let observer; // For Infinite Scroll


export async function renderDiscover(param) {
    const app = document.getElementById('app');

    // Reset State on fresh render
    state = {
        page: 1,
        loading: false,
        hasMore: true,
        filters: {
            search: param ? decodeURIComponent(param) : '',
            genre: '',
            platform: '',
            year: '',
            ordering: '-added'
        }
    };

    // Update Global Search Input to match URL param if present
    const globalSearch = document.getElementById('global-search');
    if (globalSearch && state.filters.search) {
        globalSearch.value = state.filters.search;
    }

    // Generate Year Options (2026 down to 1972)
    let yearOptions = '<option value="">All Years</option>';
    for (let y = 2026; y >= 1972; y--) {
        yearOptions += `<option value="${y}">${y}</option>`;
    }

    app.innerHTML = `
        <section aria-label="Game Filters" class="d-flex flex-column flex-xl-row justify-content-between align-items-xl-center mb-4 gap-3">
            <h2 class="section-title mb-0">Discover Games</h2>
            
            <div class="d-flex gap-2 flex-wrap flex-grow-1 justify-content-xl-end">
                <!-- Sorting -->
                <select id="sort-select" class="form-select w-auto bg-dark text-light border-secondary">
                    <option value="-added">🔥 Popularity</option>
                    <option value="-rating">Rating (High to Low)</option>
                    <option value="rating">Rating (Low to High)</option>
                    <option value="-released">Newest First</option>
                    <option value="released">Oldest First</option>
                </select>

                <!-- Filters -->
                <select id="genre-select" class="form-select w-auto bg-dark text-light border-secondary">
                    <option value="">All Genres</option>
                </select>
                <select id="platform-select" class="form-select w-auto bg-dark text-light border-secondary">
                    <option value="">All Platforms</option>
                </select>
                <select id="year-select" class="form-select w-auto bg-dark text-light border-secondary">
                    ${yearOptions}
                </select>
            </div>
        </section>

        <div id="games-grid" class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mb-4"></div>
        
        <!-- Infinite Scroll Sentinel -->
        <div id="sentinel" class="text-center py-4">
            <div class="spinner-border text-primary d-none" role="status"></div>
        </div>
    `;

    const grid = document.getElementById('games-grid');
    UI.showLoader('games-grid');

    try {
        // Parallel init: Fetch Games + Fetch Filters
        const filtersPromise = Promise.all([
            API.getGenres(),
            API.getParentPlatforms()
        ]).then(([genres, platforms]) => {
            const genreSel = document.getElementById('genre-select');
            genres.results.forEach(g => {
                const opt = document.createElement('option');
                opt.value = g.slug;
                opt.textContent = g.name;
                genreSel.appendChild(opt);
            });

            const platSel = document.getElementById('platform-select');
            platforms.results.forEach(p => {
                const opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.name;
                platSel.appendChild(opt);
            });
        });

        // Initial Load
        await loadGames(true); // true = reset grid

        // Wait for filters to populate UI
        await filtersPromise;

        // Setup Event Listeners
        setupListeners();
        setupInfiniteScroll();

    } catch (error) {
        console.error(error);
        grid.innerHTML = '<div class="alert alert-danger">Failed to load games.</div>';
    }
}


async function loadGames(reset = false) {
    if (state.loading || (!state.hasMore && !reset)) return;

    const sentinel = document.getElementById('sentinel');
    const grid = document.getElementById('games-grid');

    if (reset) {
        grid.innerHTML = '';
        state.page = 1;
        state.hasMore = true;
        // Restore sentinel spinner if it was overwritten by text
        if (sentinel) {
            sentinel.innerHTML = '<div class="spinner-border text-primary d-none" role="status"></div>';
        }
    }

    state.loading = true;
    const spinner = sentinel?.querySelector('.spinner-border');
    if (spinner) spinner.classList.remove('d-none');

    // Build Query
    const query = {
        page: state.page,
        ordering: state.filters.ordering,
        page_size: 20 // --- Consistent page size ---
    };

    if (state.filters.search) query.search = state.filters.search;
    if (state.filters.genre) query.genres = state.filters.genre;
    if (state.filters.platform) query.parent_platforms = state.filters.platform;
    if (state.filters.year) query.dates = `${state.filters.year}-01-01,${state.filters.year}-12-31`;

    try {
        const data = await API.getGames(query);

        // Handle Results
        if (data.results.length === 0 && reset) {
            grid.innerHTML = '<p class="text-muted text-center w-100">No games found.</p>';
            state.hasMore = false;
        } else {
            // Append Cards Batch
            const fragment = document.createDocumentFragment();
            data.results.forEach(game => {
                const isSaved = appStore.has(game.id);
                const col = UI.createCard(game, isSaved);

                col.querySelector('.game-card').addEventListener('click', (e) => {
                    if (e.target.closest('.add-btn')) return;
                    Router.navigate(`game/${game.id}`);
                });

                const btn = col.querySelector('.add-btn');
                if (btn) {
                    btn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        if (appStore.add(game)) {
                            UI.showToast(`${game.name} added!`);
                            btn.parentElement.innerHTML = `<span class="badge bg-success w-100 py-2"><i class="bi bi-check"></i> In Library</span>`;
                        }
                    });
                }
                fragment.appendChild(col);
            });
            grid.appendChild(fragment);

            // --- This is where i limit load ammount ---
            if (data.next) {
                if (state.page >= MAX_PAGES) {
                    state.hasMore = false;
                    sentinel.innerHTML = '<p class="text-muted small">You\'ve reached the end. (100 games max)</p>';
                } else {
                    state.page++;
                }
            } else {
                state.hasMore = false;
                sentinel.innerHTML = '<p class="text-muted small">That\'s all games there are.</p>';
            }
        }
    } catch (e) {
        console.error(e);
        UI.showToast('Error loading games', 'danger');
    } finally {
        state.loading = false;
        if (spinner) spinner.classList.add('d-none');
    }
}

function setupListeners() {
    const handleChange = () => {
        state.filters.genre = document.getElementById('genre-select').value;
        state.filters.platform = document.getElementById('platform-select').value;
        state.filters.year = document.getElementById('year-select').value;
        state.filters.ordering = document.getElementById('sort-select').value;

        // Check global search too in case it changed
        const globalSearch = document.getElementById('global-search');
        state.filters.search = globalSearch ? globalSearch.value.trim() : '';

        loadGames(true);
    };

    ['genre-select', 'platform-select', 'year-select', 'sort-select'].forEach(id => {
        document.getElementById(id).addEventListener('change', handleChange);
    });

    // Global Search integration when already on page
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.removeEventListener('search-trigger', handleChange);
        if (globalSearch._searchHandler) {
            globalSearch.removeEventListener('search-trigger', globalSearch._searchHandler);
        }
        globalSearch._searchHandler = handleChange;
        globalSearch.addEventListener('search-trigger', handleChange);
    }
}

function setupInfiniteScroll() {
    const sentinel = document.getElementById('sentinel');
    if (observer) observer.disconnect();

    observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && state.hasMore && !state.loading) {
            loadGames(false);
        }
    }, { rootMargin: '200px' }); // Load before user hits bottom

    if (sentinel) observer.observe(sentinel);
}
