export default class ApiService {
    constructor() {
        this.baseUrl = 'https://api.jikan.moe/v4';
    }

    /**
     * Search for anime by query
     * @param {string} query 
     * @returns {Promise<Array>} List of anime
     */
    async searchAnime(query) {
        try {
            const response = await fetch(`${this.baseUrl}/anime?q=${encodeURIComponent(query)}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Failed to fetch anime:', error);
            throw error;
        }
    }

    /**
     * Get full details for a specific anime
     * @param {number} id 
     * @returns {Promise<Object>}
     */
    async getAnimeDetail(id) {
        try {
            const response = await fetch(`${this.baseUrl}/anime/${id}/full`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Failed to fetch anime details:', error);
            throw error;
        }
    }

    /**
    * Get all anime by genre
    * @param {number} genreId - Genre ID
    * @returns {Promise<Array>}
    */
    async searchByGenre(genreId) {
        try {
            const response = await fetch(`${this.baseUrl}/anime?genres=${genreId}`);
            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }
            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Failed to fetch by genre:', error);
            throw error;
        }
    }
}


