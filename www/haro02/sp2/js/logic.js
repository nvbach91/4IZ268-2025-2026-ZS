import {Elements} from "./elements.js";
import {Renders} from "./renders.js";
import {Network} from "./network.js";
import {Storage} from "./storage.js";
import {History} from "./history.js";

export const Logic = {

    async findTopSongs() {
        Renders.clearContainers();
        Renders.displaySpinner();

        try {
            const songs = await Network.findTopRatedSongs();
            Renders.renderSongs(songs);

            Renders.displayText(`Found top songs`);
        } catch (err) {
            Renders.displayText(`Error finding top songs`);
        } finally {
            Renders.hideSpinner();
        }
    },

    async findUserAndSongs() {
        Renders.clearContainers();
        Renders.displaySpinner();

        const query = Elements.searchInput.val();
        try {
            const resp = await Network.findCombinedUsersAndSongs(query);
            Renders.renderUsers(resp.users, Logic.displayUserSongs);
            Renders.renderSongs(resp.songs);

            Renders.displayText(`Found results for query "${query}"`);
        } catch (err) {
            Renders.displayText(`Error finding results for query "${query}"`);
        } finally {
            Renders.hideSpinner();
        }
    },

    async displayUserSongs(id, name) {
        Renders.clearContainers();
        Renders.displaySpinner();
        try {
            const songs = await Network.findUserSongs(id);
            Renders.renderSongs(songs);

            Renders.displayText(`Found songs for "${name}"`);
        } catch (err) {
            Renders.displayText(`Error finding songs for "${name}"`);
        } finally {
            Renders.hideSpinner();
        }
    },

    async findFavoriteSongs() {
        Renders.clearContainers();
        Renders.displaySpinner();
        try {
            const favoriteSongs = Storage.getFavorites();
            Renders.renderSongs(favoriteSongs);

            Renders.displayText(`Found favorite songs`);
        } catch (err) {
            Renders.displayText(`Error finding favorite songs`);
        } finally {
            Renders.hideSpinner();
        }
    },

    async init() {
        const {mode, query, userId, userName, song} = History.getUrlState();
        Elements.searchInput.val(query);

        switch (mode) {
            case 'favorites':
                await Logic.findFavoriteSongs();
                break;
            case 'top':
                await Logic.findTopSongs();
                break;
            case 'search':
                await Logic.findUserAndSongs();
                break;
            case 'user':
                await Logic.displayUserSongs(userId, userName);
                break;
            case 'none':
                break;
        }

        if (song !== null) {
            Renders.renderSongDetails(song);
        }
    }
}
