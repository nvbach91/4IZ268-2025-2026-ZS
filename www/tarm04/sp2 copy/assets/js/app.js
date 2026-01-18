import * as API from './api.js';
import * as DOM from './dom.js';
import * as Storage from './storage.js';

const state = {
    allCountries: [],
    filteredCountries: [],
    favorites: [],
    isShowingFavorites: false,
    currentPage: 1,
    itemsPerPage: 12
};

async function init() {
    DOM.elements.themeToggle.addEventListener('click', toggleTheme);
    initTheme();

    state.favorites = Storage.getFavorites();

    bindEvents();

    window.addEventListener('hashchange', handleRouting);
    handleRouting();
}

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

async function fetchAllData() {
    if (state.allCountries.length > 0) return;

    DOM.toggleLoader(true);
    try {
        state.allCountries = await API.fetchAllCountries();
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
    state.currentPage = 1;
    updateGridView();
}

function updateGridView() {
    const totalPages = Math.ceil(state.filteredCountries.length / state.itemsPerPage);

    if (state.currentPage > totalPages) state.currentPage = 1;

    const startIndex = (state.currentPage - 1) * state.itemsPerPage;
    const endIndex = startIndex + state.itemsPerPage;
    const pageItems = state.filteredCountries.slice(startIndex, endIndex);

    DOM.renderGrid(pageItems, state.favorites, state.isShowingFavorites);
    DOM.renderPagination(state.currentPage, totalPages, (newPage) => {
        state.currentPage = newPage;
        updateGridView();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // render stats
    DOM.renderStats(state.filteredCountries);
}

function toggleFavorite(code) {
    const index = state.favorites.indexOf(code);
    if (index === -1) {
        state.favorites.push(code);
    } else {
        state.favorites.splice(index, 1);
    }
    Storage.saveFavorites(state.favorites);

    if (!DOM.elements.detail.classList.contains('hidden')) {
        const isFav = state.favorites.includes(code);
        DOM.updateFavoriteButton(isFav);
    } else {
        updateGridView();
    }
}

function goHome() {
    if (!state.isShowingFavorites) {
        DOM.elements.searchInput.value = '';
        DOM.elements.regionFilter.value = '';
    }
    window.location.hash = '';
}

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

function showHomeView() {
    DOM.elements.detail.classList.add('hidden');
    DOM.elements.controls.classList.remove('hidden');
    DOM.elements.grid.classList.remove('hidden');
    DOM.elements.pagination.classList.remove('hidden');
    DOM.elements.statsContainer.classList.remove('hidden');
    window.scrollTo(0, 0);
}

async function showDetailView(code) {
    DOM.toggleLoader(true);
    DOM.elements.statsContainer.classList.add('hidden'); 
    DOM.elements.grid.classList.add('hidden');
    DOM.elements.controls.classList.add('hidden');
    DOM.elements.pagination.classList.add('hidden');
    DOM.elements.detail.classList.add('hidden');

    try {
        let country = state.allCountries.find(c => c.cca3 === code);

        if (!country || !('borders' in country)) {
            country = await API.fetchCountryDetail(code);
        }

        DOM.renderDetail(country, state.favorites, toggleFavorite, state.allCountries);
        DOM.elements.detail.classList.remove('hidden');

    } catch (error) {
        DOM.showError(error.message);
    } finally {
        DOM.toggleLoader(false);
    }
}

async function handleRouting() {
    const hash = window.location.hash;

    if (!hash || hash === '#') {
        showHomeView();
        await fetchAllData();
        filterData();
    }
    else if (hash.startsWith('#country/')) {
        const code = hash.split('/')[1];
        
        await fetchAllData(); 
        showDetailView(code);
    }
}

function bindEvents() {
    let timeout;
    DOM.elements.searchInput.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(filterData, 300);
    });

    DOM.elements.regionFilter.addEventListener('change', filterData);

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

    // klickkkkkkk
    DOM.elements.statsContainer.addEventListener('click', (e) => {
        const tag = e.target.closest('.stat-tag');
        if (tag) {
            const region = tag.dataset.region;
            
          
            if (region && region !== 'Ostatní') {
                DOM.elements.regionFilter.value = region;
            } else {
                DOM.elements.regionFilter.value = "";
            }
            
          
            DOM.elements.regionFilter.dispatchEvent(new Event('change'));
        }
    });
}

document.addEventListener('DOMContentLoaded', init);