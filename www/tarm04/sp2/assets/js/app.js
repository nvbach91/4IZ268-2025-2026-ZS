import * as API from './api.js';
import * as DOM from './dom.js';
import * as Storage from './storage.js';

//App State
const state = {
    allCountries: [],
    filteredCountries: [],
    favorites: [],
    isShowingFavorites: false,
    currentPage: 1,
    itemsPerPage: 12 // only 12 items per page  
};

// Initialization
async function init() {
    DOM.elements.themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    state.favorites = Storage.getFavorites();

    bindEvents();


    window.addEventListener('hashchange', handleRouting);
    handleRouting();
}

//Dark/Light Mode logic
function initTheme() {
    const storedTheme = Storage.getTheme();
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
        document.documentElement.classList.add('dark');
        updateThemeIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateThemeIcon(false);
    }
}

function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    Storage.saveTheme(isDark ? 'dark' : 'light');
    updateThemeIcon(isDark);
}

function updateThemeIcon(isDark) {
    const icon = DOM.elements.themeToggle.querySelector('i');
    if (isDark) {
        icon.className = 'fas fa-sun';
        icon.style.color = '#fbbf24';
    } else {
        icon.className = 'fas fa-moon';
        icon.style.color = '';
    }
}

//Data & Filtering
async function fetchAllData() {
    if (state.allCountries.length > 0) return;

    DOM.toggleLoader(true);
    try {
        state.allCountries = await API.fetchAllCountries();
        // abcd...sort
        state.allCountries.sort((a, b) => a.name.common.localeCompare(b.name.common));
        state.filteredCountries = [...state.allCountries];
        updateGridView();
    } catch (error) {
        console.error(error);
        DOM.showError('Chyba při stahování dat. Zkuste to později.');
    } finally {
        DOM.toggleLoader(false);
    }
}

function filterData() {
    const searchText = DOM.elements.searchInput.value.trim().toLowerCase();
    const region = DOM.elements.regionFilter.value;

    state.filteredCountries = state.allCountries.filter(country => {
        const matchesSearch = country.name.common.toLowerCase().includes(searchText);
        const matchesRegion = region === '' || country.region === region;
        const matchesFav = state.isShowingFavorites ? state.favorites.includes(country.cca3) : true;

        return matchesSearch && matchesRegion && matchesFav;
    });
    // Reset to page 1 when filtering
    state.currentPage = 1;
    updateGridView();
}

function updateGridView() {
    // Pagination logic
    const totalPages = Math.ceil(state.filteredCountries.length / state.itemsPerPage);

    // Handle after clearing filters
    if (state.currentPage > totalPages) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageItems = state.filteredCountries.slice(startIndex, endIndex);

    DOM.renderGrid(pageItems, state.favorites, state.isShowingFavorites);
    DOM.renderPagination(state.currentPage, totalPages, (newPage) => {
        state.currentPage = newPage;
        updateGridView();
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// Favorites logic
function toggleFavorite(code) {
    const index = state.favorites.indexOf(code);
    if (index === -1) {
        state.favorites.push(code);
    } else {
        state.favorites.splice(index, 1);
    }
    Storage.saveFavorites(state.favorites);

    // Show detail view update
    if (!DOM.elements.detail.classList.contains('hidden')) {
        const country = state.allCountries.find(c => c.cca3 === code);
        DOM.renderDetail(country, state.favorites, toggleFavorite, state.allCountries);
    } else {
        //If in grid view, just update the grid
        updateGridView();
    }
}
// Toggle between all countries and favorites view
function toggleFavoritesView() {
    state.isShowingFavorites = !state.isShowingFavorites;

    if (state.isShowingFavorites) {
        DOM.elements.showFavBtn.classList.add('active-filter');
        DOM.elements.searchInput.value = '';
        DOM.elements.regionFilter.value = '';
    } else {
        DOM.elements.showFavBtn.classList.remove('active-filter');
    }

    if (!DOM.elements.grid.classList.contains('hidden')) {
        filterData();
    } else {
        goHome();
    }
}

// Event Listeners
function bindEvents() {

    let timeout;
    DOM.elements.searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(filterData, 300);
    });

    DOM.elements.regionFilter.addEventListener('change', filterData);

    // Click on country card to go to detail
    DOM.elements.grid.addEventListener('click', (e) => {
        const card = e.target.closest('.country-card');
        const favBtn = e.target.closest('.card-fav-icon');

        if (card && !favBtn) {
            const code = card.dataset.code;
            window.location.hash = `country/${code}`;
        }
    });

    DOM.elements.logoLink.addEventListener('click', goHome);
    DOM.elements.backButton.addEventListener('click', goHome);
    DOM.elements.showFavBtn.addEventListener('click', toggleFavoritesView);
}

// Routing with hash
async function handleRouting() {
    const hash = window.location.hash;

    if (!hash || hash === '#') {
        showHomeView();
        await fetchAllData();
        // Apply filters (if returning from detail view and filter is active)
        filterData();
    }
    else if (hash.startsWith('#country/')) {
        const code = hash.split('/')[1];
        await fetchAllData(); // Zajistíme, že máme data
        showDetailView(code);
    }
}

function showHomeView() {
    DOM.elements.detail.classList.add('hidden');
    DOM.elements.controls.classList.remove('hidden');
    DOM.elements.grid.classList.remove('hidden');
    DOM.elements.pagination.classList.remove('hidden');
    window.scrollTo(0, 0);
}

function goHome() {
    // Reset filters if we were in detail view, but not if just switch favorites
    if (!state.isShowingFavorites) {
        DOM.elements.searchInput.value = '';
        DOM.elements.regionFilter.value = '';
    }
    window.location.hash = '';
}

async function showDetailView(code) {
    DOM.toggleLoader(true);
    // Hide grid and show detail
    DOM.elements.grid.classList.add('hidden');
    DOM.elements.controls.classList.add('hidden');
    DOM.elements.pagination.classList.add('hidden');
    DOM.elements.detail.classList.remove('hidden');

    try {
        let country = state.allCountries.find(c => c.cca3 === code);

        // If we don't have full data like missing borders, fetch it
        if (!country || !('borders' in country)) {
            country = await API.fetchCountryDetail(code);
        }

        DOM.renderDetail(country, state.favorites, toggleFavorite, state.allCountries);
    } catch (error) {
        DOM.showError(error.message);
    } finally {
        DOM.toggleLoader(false);
    }
}

// And here we goooo
document.addEventListener('DOMContentLoaded', init);