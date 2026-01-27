import {History} from "./history.js";
import {Logic} from "./logic.js";
import {Elements} from "./elements.js";


Elements.searchInput.on('keypress', async (e) => {
    if (e.which === 13) {
        History.pushUrlState("search", Elements.searchInput.val(), null, null);
        await Logic.findUserAndSongs();
    }
});

Elements.findTopSongsButton.on('click', async () => {
    History.pushUrlState("top", Elements.searchInput.val(), null, null);
    await Logic.findTopSongs();
});

Elements.findUserAndSongsButton.on('click', async () => {
    History.pushUrlState("search", Elements.searchInput.val(), null, null);
    await Logic.findUserAndSongs();
});

Elements.findFavoriteSongsButton.on('click', async () => {
    History.pushUrlState("favorites", Elements.searchInput.val(), null, null);
    await Logic.findFavoriteSongs();
});

export const displayUserSongsWithHistoryRecord = async (id, name) => {
    History.pushUrlState("user", Elements.searchInput.val(), id, name);
    await Logic.displayUserSongs(id, name);
};

$(window).on('popstate', async () => {
    await Logic.init();
});
Logic.init();
