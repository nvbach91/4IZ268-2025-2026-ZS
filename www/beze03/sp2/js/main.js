import ApiService from './api.js';
import AnimeList from './models/AnimeList.js';
import UIController from './ui/UIController.js';

// Initialize modules
const apiService = new ApiService();
const animeList = new AnimeList();
const uiController = new UIController();

// Load saved data on startup
document.addEventListener('DOMContentLoaded', () => {
    animeList.load();
    refreshMyList();
});

// Search Form Handler
const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');

searchForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();

    if (!query) return;

    uiController.showLoading();

    try {
        const results = await apiService.searchAnime(query);
        uiController.renderSearchResults(results, handleAddToMyList, handleShowDetail);
    } catch (error) {
        console.error(error);
        uiController.showError(`Chyba: ${error.message}`);
    }
});

// Handlers for List Interactions

/**
 * Handle adding a new anime to the list
 * @param {Anime} anime - The anime object to add
 */
function handleAddToMyList(anime) {
    if (animeList.exists(anime.mal_id)) {
        alert('Toto anime už máš v seznamu.');
        return;
    }
    animeList.add(anime);
    refreshMyList();
}

/**
 * Handle showing anime details
 * @param {number} id - Anime ID
 */
async function handleShowDetail(id) {
    uiController.showModalLoading();
    try {
        const data = await apiService.getAnimeDetail(id);
        uiController.openModal(data);
    } catch (error) {
        alert('Nepodařilo se načíst detaily.');
        uiController.closeModal(); // Close if error
    }
}

/**
 * Handle removing an anime
 * @param {number} id - Anime ID
 */
function handleRemove(id) {
    animeList.remove(id);
    refreshMyList();
}

/**
 * Handle status update
 * @param {number} id - Anime ID
 * @param {string} newStatus 
 */
function handleUpdateStatus(id, newStatus) {
    animeList.update(id, { userStatus: newStatus });
    const currentFilter = statusFilter.value;
    if (currentFilter !== 'all' && currentFilter !== newStatus) {
        refreshMyList();
    }
}

/**
 * Handle episodes update
 * @param {number} id - Anime ID
 * @param {number} newCount 
 */
function handleUpdateEpisodes(id, newCount) {
    animeList.update(id, { watchedEpisodes: newCount });
}

// Filter Handler
const statusFilter = document.getElementById('status-filter');
statusFilter.addEventListener('change', () => {
    refreshMyList();
});

/**
 * Refresh the My List UI
 */
function refreshMyList() {
    const filterValue = statusFilter.value;
    let list = animeList.getAll();

    if (filterValue !== 'all') {
        list = list.filter(anime => anime.userStatus === filterValue);
    }

    uiController.renderMyList(list, {
        onRemove: handleRemove,
        onUpdateStatus: handleUpdateStatus,
        onUpdateEpisodes: handleUpdateEpisodes
    }, handleShowDetail);
}
