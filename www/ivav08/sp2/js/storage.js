const STORAGE_KEY = 'memeFavorites';

export function getFavorites() {
    const favs = localStorage.getItem(STORAGE_KEY);
    return favs ? JSON.parse(favs) : [];
}

export function saveFavorite(memeObj) {
    const favorites = getFavorites();
    favorites.push(memeObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}

export function updateFavorite(memeObj) {
    const favorites = getFavorites();
    const index = favorites.findIndex(m => m.uniqueId === memeObj.uniqueId);
    if (index !== -1) {
        favorites[index] = memeObj;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    }
}

export function removeFavorite(uniqueId) {
    let favorites = getFavorites();
    favorites = favorites.filter(m => m.uniqueId !== uniqueId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
}