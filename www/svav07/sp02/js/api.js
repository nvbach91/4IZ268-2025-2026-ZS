/**
 * API Module
 * Wraps Axios to fetch data from RAWG.
 */

const API_KEY = '3e8993a8e6534514812b5f0784832a1e';
const BASE_URL = 'https://api.rawg.io/api';

// Create Axios Instance
const apiClient = axios.create({
    baseURL: BASE_URL,
    params: {
        key: API_KEY
    }
});

// Interceptor for Error Handling (Simple logging for now)
apiClient.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        return Promise.reject(error);
    }
);

export const API = {
    /**
     * Get Games with Filters
     * @param {Object} params - { search, genres, platforms, dates, ordering }
     */
    async getGames(params = {}) {
        const query = {
            page_size: 20,
            ...params
        };
        const response = await apiClient.get('/games', { params: query });
        return response.data;
    },

    /**
     * Get Single Game Details
     * @param {string|number} id
     */
    async getGameDetails(id) {
        const response = await apiClient.get(`/games/${id}`);
        return response.data;
    },

    /**
     * Get Genres List (Cached)
     */
    async getGenres() {
        const cached = localStorage.getItem('rawg_genres');
        if (cached) return JSON.parse(cached);

        const response = await apiClient.get('/genres');
        localStorage.setItem('rawg_genres', JSON.stringify(response.data));
        return response.data;
    },

    /**
     * Get Platforms List (Cached)
     */
    async getParentPlatforms() {
        const cached = localStorage.getItem('rawg_platforms');
        if (cached) return JSON.parse(cached);

        const response = await apiClient.get('/platforms/lists/parents');
        localStorage.setItem('rawg_platforms', JSON.stringify(response.data));
        return response.data;
    }
};
