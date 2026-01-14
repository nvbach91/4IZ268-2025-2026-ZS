// Download favorite places from localStorage
export function getFavorites() {
    const stored = localStorage.getItem('favorites');
    if (stored) {
        try {
            return JSON.parse(stored);
        } catch (e) {
            console.error('Chyba při čtení oblíbených', e);
            return [];
        }
    }
    return [];
}
// Save favotites to local
export function saveFavorites(favorites) {
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

// Will save dark and light mode
export function getTheme() {
    return localStorage.getItem('theme');
}

export function saveTheme(theme) {
    localStorage.setItem('theme', theme);
}