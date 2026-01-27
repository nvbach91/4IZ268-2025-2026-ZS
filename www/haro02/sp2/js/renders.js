import {Elements} from "./elements.js";
import {Storage} from "./storage.js";
import {History} from "./history.js";
import {displayUserSongsWithHistoryRecord} from "./main.js";


export const Renders = {

    renderUsers(users) {
        const elements = [];
        users.forEach((user) => {
            const element = Renders.renderUser(user);
            elements.push(element);
        });
        Elements.userListContainer.append(elements);
    },

    renderUser(user) {
        const {_id, name} = user;
        const userElement = $(`
            <div class="entity-row">
                <div class="entity-name">User: ${name}</div>
                <button class="show-user-songs">Show user's songs</button>
            </div>
        `);
        userElement.find('.show-user-songs').on('click', async () => {
            await displayUserSongsWithHistoryRecord(_id, name);
        });
        return userElement;
    },

    renderSongs(songs) {
        const elements = [];
        songs.forEach((song) => {
            const element = Renders.renderSong(song);
            elements.push(element);
        });
        Elements.songListContainer.append(elements);
    },

    renderSong(song) {
        const {name, img} = song;
        const element = $(`
            <div class="entity-row">
                <img src="${img}" width="64" height="64" alt="photo of ${name}">
                <div class="entity-name">Song: ${name}</div>
                <button class="show-detail">Details</button>
            </div>
        `);
        const showDetailsButton = element.find('.show-detail');
        showDetailsButton.on('click', () => {
            History.pushSongDetailsState(song);
            Renders.renderSongDetails(song);
        });
        return element;
    },

    renderSongDetails(song) {
        const {uId, uNm, name, eId} = song;
        const element = $(`
            <div class="details-content">
                <div class="top-actions">
                    <button class="close-details">X Close</button>
                 </div>
                <div class="song-title">Song: ${name}, added by ${uNm}</div>
                <button class="show-user-songs">Show ${uNm}'s other songs</button>
            </div>
        `);

        element.find('.show-user-songs').on('click', async () => {
            await displayUserSongsWithHistoryRecord(uId, uNm);
        });
        element.find('.close-details').on('click', () => {
            History.pushSongDetailsState(null);
            element.remove();
        });

        const favoriteBtn = Renders.renderFavoriteButton(song);
        element.find('.top-actions').append(favoriteBtn);
        element.append(Renders.renderSongPlayButton(eId, name));

        Elements.songDetailsContainer.empty();
        Elements.songDetailsContainer.append(element);
    },

    renderFavoriteButton(song) {
        let button;
        if (Storage.isFavorite(song)) {
            const removeFavoriteButton = $(`<button class="remove-favorite">Remove from favorites</button>`)
            removeFavoriteButton.on('click', (event) => {
                Storage.excludeFromFavorites(song);
                $(event.currentTarget).replaceWith(Renders.renderFavoriteButton(song));
                Renders.displayText("Song has been removed from favorites");
            });
            button = removeFavoriteButton;
        } else {
            const addFavoriteButton = $(`<button class="add-favorite">Add to favorites</button>`)
            addFavoriteButton.on('click', (event) => {
                Storage.saveToFavorites(song);
                $(event.currentTarget).replaceWith(Renders.renderFavoriteButton(song));
                Renders.displayText("Song has been added to favorites");
            });
            button = addFavoriteButton;
        }
        return button;
    },

    // https://openwhyd.github.io/openwhyd/API.html#formats-and-appendix
    renderSongPlayButton(eId, name) {
        const parts = eId.split('/');
        const type = parts[1];
        const identifier = parts.slice(2).join('/');

        let player;
        switch (type) {
            case 'yt': ///yt/eXZ_L6zJn1c
                player = $(`
            <iframe width="500" height="500" src="https://www.youtube.com/embed/${identifier}" title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
            `);
                break;
            case 'dz': ///dz/254694
                player = $(`
            <iframe title="deezer-widget" src="https://widget.deezer.com/widget/auto/track/${identifier}" width="500" height="500"
                allowtransparency="true" allow="encrypted-media; clipboard-write"></iframe>
            `);
                break;
            default: // /bc/.. ,/fi/..., /dm..., /vi/, /sc
                player = $(`<a href="https://www.google.com/search?q=${encodeURIComponent(name)}" target="_blank">
                Google "${name}"
            </a>`);
        }
        return player;
    },

    clearContainers() {
        Elements.songListContainer.empty();
        Elements.userListContainer.empty();
        Elements.songDetailsContainer.empty();
    },

    displayText(text) {
        Elements.infoContainer.text(text);
    },

    displaySpinner() {
        Elements.spinner.show();
    },

    hideSpinner() {
        Elements.spinner.hide();
    }
}