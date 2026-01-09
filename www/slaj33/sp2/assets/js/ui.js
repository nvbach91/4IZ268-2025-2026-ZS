import {resultContainer, savedContainer, detailImage, detailType, detailTitle, detailSubtitle, detailMeta, trackCoverImage, trackTitle, trackArtist, trackISRC, playlistContainer
} from "./const.js"
//vykresleni vysledku na stranku

export function createCardHTML(item, type) {
    if (type === "track") {
        let imageUrl = "https://placehold.co/100x100?text=No+Img"
        if (item.album && item.album.images && item.album.images.length > 0) {
            imageUrl = item.album.images[0].url;
        }

        const artistNames = item.artists.map(artist => artist.name).join(", ");

        const isrc = item.external_ids?.isrc || "";

        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("result-card");

        cardWrapper.innerHTML = `
                <div class="result-image">
                    <img src="${imageUrl}"
                        class="img-thumbnail" alt="${item.name}">
                </div>
                <div class="result-info">
                    <h1>${item.name}</h1>
                    <h2>${artistNames}</h2>
                    <button class="btn btn-warning detail-button" data-id=${item.id} data-action="detail">Detail</button>
                    <br>
                    <button class="btn btn-dark save-button" data-id=${item.id} data-action="save">Uložit</button>
                    <button type="button" class="btn btn-warning" data-id=${item.id} data-isrc="${isrc}" data-action="copy">Zkopírovat ISRC kód</button>
                </div>

                `;
        return (cardWrapper);
    }

    if (type === "album") {
        let imageUrl = "https://placehold.co/100x100?text=No+Img"
        if (item.images && item.images.length > 0) {
            imageUrl = item.images[0].url;
        }

        const artistNames = item.artists.map(artist => artist.name).join(", ");

        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("result-card");

        cardWrapper.innerHTML = `
                <div class="result-image">
                    <img src="${imageUrl}"
                        class="img-thumbnail" alt="${item.name}">
                </div>
                <div class="result-info">
                    <h1>${item.name}</h1>
                    <h2>${artistNames}</h2>
                    <button class="btn btn-warning detail-button" data-id=${item.id} data-action="detail">Detail</button>
                    <br>
                    <button class="btn btn-dark save-button" data-id=${item.id} data-action="save">Uložit</button>                    
                </div>

                `;
        return (cardWrapper);
    }

    if (type === "artist") {

        let imageUrl = (item.images && item.images.length > 0)
            ? item.images[0].url
            : "https://placehold.co/100x100?text=No+Img";

        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("result-card");

        cardWrapper.innerHTML = `
                <div class="result-image">
                    <img src="${imageUrl}"
                        class="img-thumbnail" alt="Result Image">
                </div>
                <div class="result-info">
                    <h1>${item.name}</h1>
                    <h2>${item.type}</h2>
                    <button class="btn btn-warning detail-button" data-id=${item.id} data-action="detail">Detail</button>
                    <br>
                    <button class="btn btn-dark save-button" data-id=${item.id} data-action="save">Uložit</button>
                </div>
                `;
        return (cardWrapper);
    }

    if (type === "playlist") {
        if (!item) return;

        let imageUrl = "https://placehold.co/100x100?text=No+Img"
        if (item.images && item.images.length > 0) {
            imageUrl = item.images[0].url;
        }


        const cardWrapper = document.createElement("div");
        cardWrapper.classList.add("result-card");

        cardWrapper.innerHTML = `
                <div class="result-image">
                    <img src="${imageUrl}"
                        class="img-thumbnail" alt="${item.name}">
                </div>
                <div class="result-info">
                    <h1>${item.name}</h1>
                    <h2>Majitel: ${item.owner.display_name}</h2>
                    <h3>Počet skladeb: ${item.tracks.total}</h3>
                    <button class="btn btn-warning detail-button" data-id=${item.id} data-action="detail">Detail</button>
                    <br>
                    <button class="btn btn-dark save-button" data-id=${item.id} data-action="save">Uložit</button>                    
                </div>

                `;
        return (cardWrapper);
    }
}


//vysledky z vyhledavani
export function showSearchResults(data, type) {
    resultContainer.innerHTML = "";
    console.log("vykreslvani vysledku")

    if (!data) {
        console.warn("Žádná data k zobrazení");
        resultContainer.innerHTML = "<p>Žádné výsledky</p>";
        return;
    }

    const items = data[`${type}s`].items;

    if (!items || items.length === 0) {
        resultContainer.innerHTML = "<p>Žádné výsledky.</p>";
        return;
    }

    const fragment = document.createDocumentFragment();

    items.forEach(item => {
        if (!item) return;

        const card = createCardHTML(item, type);

        fragment.appendChild(card);
    });

    resultContainer.appendChild(fragment);
}


//vykresleni stranky s ulozenymi skladbami
// ui.js

export function showSaved() {
    savedContainer.innerHTML = "";

    const tracks = JSON.parse(localStorage.getItem("saved_tracks")) || [];
    const albums = JSON.parse(localStorage.getItem("saved_albums")) || [];
    const playlists = JSON.parse(localStorage.getItem("saved_playlists")) || [];
    const artists = JSON.parse(localStorage.getItem("saved_artists")) || [];

    if (!tracks.length && !albums.length && !playlists.length && !artists.length) {
        savedContainer.innerHTML = "<p class='text-white'>Zatím nemáte žádné uložené položky.</p>";
        return;
    }

    const fragment = document.createDocumentFragment();

    const appendSection = (title, items) => {
        if (items.length === 0) return;

    
        items.forEach(item => {
            const card = createCardHTML(item, item.type);
            
            const saveBtn = card.querySelector(".save-button");
            if (saveBtn) {
                saveBtn.innerText = "Odstranit";
                saveBtn.classList.replace("btn-dark", "btn-danger");
                saveBtn.dataset.action = "remove";
            }

            fragment.appendChild(card);
        });
    };

    appendSection("Skladby", tracks);
    appendSection("Alba", albums);
    appendSection("Playlisty", playlists);
    appendSection("Interpreti", artists);

    savedContainer.appendChild(fragment);
}


//doplneni hodnot do playlistu a alba
export function renderDetails(result) {
    let cover = "https://placehold.co/200x200?text=No+Img";
    if (result.images && result.images.length > 0) {
        cover = result.images[0].url;
    }

    let subtitleText = "";
    if (result.type === "album") {
        subtitleText = result.artists.map(artist => artist.name).join(", ");
    } else if (result.type === "playlist") {
        subtitleText = `Autor: ${result.owner.display_name}`;
    }

    detailImage.src = cover;
    detailTitle.innerText = result.name;
    detailSubtitle.innerText = subtitleText;
    detailType.innerText = result.type === "album" ? "Album" : "Playlist";
    detailMeta.innerText = `${result.tracks.total} skladeb`;

    playlistContainer.innerHTML = "";

    const savedItems = JSON.parse(localStorage.getItem("saved_items")) || [];

    const items = result.tracks.items;

    const fragment = document.createDocumentFragment();

    items.forEach((item, index) => {
        if (!item) return;

        const track = item.track ? item.track : item;

        if (!track || !track.name) return;

        //tlacitka pro ulozeni atd
        const isSaved = savedItems.some(saved => saved.id === track.id);
        const saveButtonHTML = isSaved
            ? `<button class="btn btn-sm btn-danger" data-id="${track.id}" data-action="remove">Odstranit</button>`
            : `<button class="btn btn-sm btn-dark" data-id="${track.id}" data-action="save">Uložit</button>`;
        const isrcCode = track.external_ids?.isrc || "";
        const copyButtonHTML = isrcCode
            ? `<button class="btn btn-sm btn-warning" data-id="${track.id}" data-isrc="${isrcCode}" data-action="copy">ISRC</button>`
            : ""

        const row = document.createElement("div");

        row.className = "list-group-item bg-warning text-dark d-flex justify-content-between align-items-center mb-1 rounded";

        row.innerHTML = `
            <div class="d-flex align-items-center text-truncate">
                <span class="text-dark fw-bold me-3">${index + 1}</span>
                <div class="text-truncate">
                    <div class="fw-bold text-truncate">${track.name}</div>
                    <div class="small text-dark opacity-75 text-truncate">${track.artists.map(a => a.name).join(", ")}</div>
                </div>
            </div>
            
            <div class="btn-group" role="group">
                <button class="btn btn-sm btn-outline-dark" data-id="${track.id}" data-action="detail">Detail</button>
                
                ${saveButtonHTML}

                ${copyButtonHTML}
            </div>
        `;

        fragment.appendChild(row);
    });
    playlistContainer.appendChild(fragment);
}


//doplneni hodnot pro detailni zobrazeni jednotlive skladby
export function renderTrackDetail(trackData, audioFeatures) {
    let cover = "https://placehold.co/200x200?text=No+Img";
    if (trackData.album.images && trackData.album.images.length > 0) {
        cover = trackData.album.images[0].url;
    }

    let subtitleText = "";
    subtitleText = trackData.artists.map(artist => artist.name).join(", ");

    trackCoverImage.src = cover;
    trackTitle.innerText = trackData.name;
    trackArtist.innerText = subtitleText;
    trackISRC.innerText = `ISRC: ${trackData.external_ids.isrc}`
}