export default class Anime {
    constructor(data, userDefaults = {}) {
        // Data from API
        this.mal_id = data.mal_id;
        this.title = data.title;
        // Handle different image formats from Jikan API v4
        this.image_url = data.images?.jpg?.image_url || data.image_url || 'https://placehold.co/100x150?text=No+Image';
        this.episodes = data.episodes || '?';
        this.score = data.score || 'N/A';
        this.genres = data.genres || [];

        // User specific data
        this.userStatus = userDefaults.userStatus || 'plan_to_watch'; // plan_to_watch, watching, completed
        this.watchedEpisodes = userDefaults.watchedEpisodes || 0;
    }

    /**
     * Create an Anime instance from API response
     */
    static fromApi(apiData) {
        return new Anime(apiData);
    }

    /**
     * Create an Anime instance from LocalStorage
     */
    static fromStorage(storedData) {
        // Reconstruct with stored user data
        return new Anime(storedData, {
            userStatus: storedData.userStatus,
            watchedEpisodes: storedData.watchedEpisodes
        });
    }
}
