/**
 * Store Module
 * Manages LocalStorage for My Library.
 */

const STORAGE_KEY = 'sp02_library';

class Store {
    constructor() {
        this.library = this._load();
    }

    _load() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (e) {
            console.error('Failed to load library:', e);
            return [];
        }
    }

    _save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.library));
    }

    /**
     * Get all games in library
     */
    getLibrary() {
        return this.library;
    }

    /**
     * Add game to library
     * @param {Object} game - Minimal game info
     */
    add(game) {
        if (this.has(game.id)) return false;

        const item = {
            id: game.id,
            name: game.name,
            background_image: game.background_image,
            rating: game.rating,
            released: game.released,
            isFavorite: false,
            addedAt: new Date().toISOString()
        };

        this.library.unshift(item);
        this._save();
        return true;
    }

    /**
     * Remove game from library
     */
    remove(id) {
        this.library = this.library.filter(g => g.id !== id);
        this._save();
    }

    /**
     * Toggle Favorite status
     */
    toggleFavorite(id) {
        const game = this.library.find(g => g.id === id);
        if (game) {
            game.isFavorite = !game.isFavorite;
            this._save();
            return game.isFavorite;
        }
        return false;
    }

    /**
     * Check if game is in library
     */
    has(id) {
        return this.library.some(g => g.id === id);
    }

    /**
     * Get User Profile
     */
    getProfile() {
        const stored = localStorage.getItem('sp02_profile');
        return stored ? JSON.parse(stored) : {
            name: 'Player',
            icon: 'bi-controller',
            color: '#00e676' // Default Green
        };
    }

    /**
     * Save User Profile
     */
    saveProfile(profile) {
        localStorage.setItem('sp02_profile', JSON.stringify(profile));
    }
}

export const appStore = new Store();
