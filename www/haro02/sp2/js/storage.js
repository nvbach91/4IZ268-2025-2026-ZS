export const Storage = {
    getFavorites() {
        return JSON.parse((localStorage.getItem('favorite-songs') || "[]"));
    },

    saveToFavorites(song) {
        const favorites = Storage.getFavorites()
        favorites.push(song);
        localStorage.setItem('favorite-songs', JSON.stringify(favorites));
    },

    excludeFromFavorites(song) {
        const newSaved = Storage.getFavorites().filter(stored => stored._id !== song._id);
        localStorage.setItem('favorite-songs', JSON.stringify(newSaved));
    },

    isFavorite(song) {
        return Storage.getFavorites().some(stored => stored._id === song._id);
    }
}
