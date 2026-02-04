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
            const response = await fetch(`${this.baseUrl}/anime?q=${encodeURIComponent(query)}&limit=25`);
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
}
