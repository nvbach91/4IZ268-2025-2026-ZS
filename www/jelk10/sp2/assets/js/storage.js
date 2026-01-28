export let selectedPlatforms = []
window.selectedPlatforms = selectedPlatforms
export let selectedGenres = []
window.selectedGenres = selectedGenres

/**
 * Removes a movie from favorites in localStorage
 * @param {number} movie_id 
 */
export const removeFromFavorites = (movie_id) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || []
    const index = favorites.indexOf(movie_id)
    if (index > -1) {
        favorites.splice(index, 1)
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }
}

/**
 * Adds a movie to favorites in localStorage
 * @param {number} movie_id 
 */
export const addToFavorites = (movie_id) => {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || []
    if (!favorites.includes(movie_id)) {
        favorites.push(movie_id)
        localStorage.setItem('favorites', JSON.stringify(favorites))
    }
}

/**
 * Clears all favorite movies from localStorage
 */
export const clearFavorites = () => {
    console.log('Clearing favorites')
    localStorage.removeItem('favorites')
}

/**
 * Gets the list of favorite movie IDs from localStorage
 * @returns {Array} Array of favorite movie IDs
 */
export const getFavorites = () => {
    return JSON.parse(localStorage.getItem('favorites')) || []
}

/**
 * Sets the preferred language in localStorage
 * @param {string} language 
 */
export const setLanguage = (language) => {
    localStorage.setItem('preferredLanguage', language.split(' ')[1]);
}

/**
 * Sets the preferred region in localStorage
 * @param {string} region 
 */
export const setRegion = (region) => {
    localStorage.setItem('preferredRegion', region.split(' ')[1]);
}

/**
 * Gets the preferred language code for API requests
 * @returns {string} Language code
 */
export const getLanguage = () => {
    const lang = localStorage.getItem('preferredLanguage')
    switch (lang) {
        case 'CZ':
            return 'cs-CZ'
        case 'EN':
            return 'en-US'
        case 'DE':
            return 'de-DE'
        default:
            return 'en-US'
    }
}

/**
 * Gets the preferred region code for API requests
 * @returns {string} Region code
 */
export const getRegion = () => {
    const region = localStorage.getItem('preferredRegion')
    switch (region) {
        case 'CZ':
            return 'CZ'
        case 'US':
            return 'US'
        case 'DE':
            return 'DE'
        default:
            return 'US'
    }
}

/**
 * Adds a movie to the seen movies list in localStorage
 * @param {number} movie_id 
 */
export const addSeenMovie = (movie_id) => {
    let seenMovies = JSON.parse(localStorage.getItem('seenMovies')) || []
    if (!seenMovies.includes(movie_id)) {
        seenMovies.push(movie_id)
        localStorage.setItem('seenMovies', JSON.stringify(seenMovies))
    }
}

/**
 * Gets the list of seen movie IDs from localStorage
 * @returns {Array} Array of seen movie IDs
 */
export const getSeenMovies = () => {
    return JSON.parse(localStorage.getItem('seenMovies')) || []
}