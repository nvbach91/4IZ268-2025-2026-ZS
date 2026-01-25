export default class ApiService {
    constructor() {
        this.baseUrl = "https://api.jikan.moe/v4";
    }

    async searchAnime(query) {
        const res = await fetch(`${this.baseUrl}/anime?q=${query}`);
        const json = await res.json();
        return json.data;
    }

    async getAnimeDetail(id) {
        const res = await fetch(`${this.baseUrl}/anime/${id}`);
        const json = await res.json();
        return json.data;
    }
}
