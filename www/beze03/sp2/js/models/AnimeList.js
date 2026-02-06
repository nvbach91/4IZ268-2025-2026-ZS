import Anime from './Anime.js';

export default class AnimeList {
    constructor() {
        this.animes = [];
        this.storageKey = 'anime_tracker_list';
    }

    /**
     * Load data from localStorage
     */
    load() {
        const data = localStorage.getItem(this.storageKey);
        if (data) {
            const parsed = JSON.parse(data);
            this.animes = parsed.map(item => Anime.fromStorage(item));
        }
    }

    /**
     * Save data to localStorage
     */
    save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.animes));
    }

    /**
     * Add anime to list
     */
    add(anime) {
        if (!this.exists(anime.mal_id)) {
            this.animes.push(anime);
            this.save();
        }
    }

    /**
     * Remove anime from list
     */
    remove(mal_id) {
        this.animes = this.animes.filter(a => a.mal_id !== mal_id);
        this.save();
    }

    /**
     * Update anime details
     */
    update(mal_id, updates) {
        const anime = this.animes.find(a => a.mal_id === mal_id);
        if (anime) {
            if (updates.userStatus !== undefined) anime.userStatus = updates.userStatus;
            if (updates.watchedEpisodes !== undefined) anime.watchedEpisodes = parseInt(updates.watchedEpisodes);
            this.save();
        }
    }

    /**
     * Check if anime exists in list
     */
    exists(mal_id) {
        return this.animes.some(a => a.mal_id === mal_id);
    }

    /**
     * Get all anime
     */
    getAll() {
        return this.animes;
    }

    getCounts() {
        const counts = { watching: 0, completed: 0, plan_to_watch: 0, total: this.animes.length };
        this.animes.forEach(a => {
            const s = a.userStatus || 'plan_to_watch';
            if (s === 'watching') counts.watching++;
            else if (s === 'completed') counts.completed++;
            else if (s === 'plan_to_watch') counts.plan_to_watch++;
        });
        return counts;
    }
}
