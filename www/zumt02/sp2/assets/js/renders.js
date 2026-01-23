import { appContainer, button2Watch, buttonOrderNewest, buttonOrderPopularity, buttonOrderRating, buttonOrderRelevance, buttonRated, buttonSeen, categoryContainer, categoryList, emptyCategoryList, loadingImg, order, OrderEnum } from "./elements.js";
import { getAnimeById, makeRequest } from "./network.js";
import { addRating, get2Watch, getRatings, getSeen, loadCategories, loadOrder, removeFrom2Watch, removeFromSeen, saveTo2Watch, saveToSeen } from "./storage.js";

const getStudioName = (mediaProductions, studios, producers, index) => {
    let i = 0;
    for (const studio of studios) {
        if (i > index) return "unknown";
        const production = mediaProductions.find(resource => resource.id === studio.id);
        if (production != undefined) {
            //console.log(`Found studio ${studio.id} matching production ${production.id}`);
            //console.log(studio);
            //console.log(studio.relationships.company.data.id);
            const producer = producers.find(resource => resource.id === studio.relationships.company.data.id);
            //console.log(producer);
            if (producer != undefined) {
                return producer.attributes.name;
            } else {
                "unknown";
            }
        }
        i++;
    }
    return "unknown";
};

const getStudios = (included) => {
    if (included === undefined) {
        return new Array();
    }
    const studioProductions = included.filter(
        resource => resource.type === "mediaProductions" && resource.attributes.role === "studio"
    );

    //console.log("Studios:");
    //console.log(studioProductions);
    return studioProductions;
};

const getProducers = (included) => {
    if (included === undefined) {
        return new Array();
    }
    const producers = included.filter(
        resource => resource.type === "producers"
    );

    //console.log("Producers:");
    //console.log(producers);
    return producers;
};

const formatSeason = (startDate) => {
    if (!startDate) return "Unknown";

    const [year, month] = startDate.split("-").map(Number);

    let season;
    if (month >= 3 && month <= 5) season = "Spring";
    else if (month >= 6 && month <= 8) season = "Summer";
    else if (month >= 9 && month <= 11) season = "Fall";
    else season = "Winter";

    return `${season} ${year}`;
};

const printStars = (rating) => {
    const i = rating / 20;
    let stars = "";
    for (let index = 0; index < i; index++) {
        stars += '<i class="fas fa-star"></i>';
    }
    for (let index = 0; index < 5 - i; index++) {
        stars += " ";
    }
    return stars;
}

const renderNav = (classType, links) => {
    if (typeof links === "undefined") {
        return null;
    };

    const navbar = $(`
    <nav class="flex-row centered-content ${classType}">
      <button class="button-first">first</button>
      <button class="button-prev">previous</button>
      <button class="button-next">next</button>
      <button class="button-last">last</button>
    </nav>
    `);

    navbar.find(".button-first").on("click", async () => {
        appContainer.empty();
        appContainer.append(loadingImg.clone());
        renderAnime(await makeRequest(links.first));
    });

    if (typeof links.prev === "undefined") {
        navbar.find(".button-prev").remove();
    } else {
        navbar.find(".button-prev").on("click", async () => {
            appContainer.empty();
            appContainer.append(loadingImg.clone());
            renderAnime(await makeRequest(links.prev));
        });
    }

    if (typeof links.next === "undefined") {
        navbar.find(".button-next").remove();
    } else {
        navbar.find(".button-next").on("click", async () => {
            appContainer.empty();
            appContainer.append(loadingImg.clone());
            renderAnime(await makeRequest(links.next));
        });
    }

    navbar.find(".button-last").on("click", async () => {
        appContainer.empty();
        appContainer.append(loadingImg.clone());
        renderAnime(await makeRequest(links.last));
    });

    return navbar;
};

const update2WatchCount = (toWatch) => {
    button2Watch.text(`To Watch (${toWatch.length})`);
}

const updateSeenCount = (seen) => {
    buttonSeen.text(`Seen (${seen.length})`);
}

const updateRatedCount = (rated) => {
    buttonRated.text(`Rated (${rated.size})`);
}

const clickBehaviour2Watch = (toWatch, anime, button2Watch, buttonSeen) => {
    button2Watch.off();
    //console.log(toWatch);
    //console.log(anime);
    //console.log(toWatch.some(a => a.id === anime.id));
    if (toWatch.some(a => a.id === anime.id)) {
        button2Watch.text("Remove from To Watch list");
        button2Watch.on("click", () => {
            removeFrom2Watch(anime);
            button2Watch.text("Add to my To Watch list");
            button2Watch.on("click", clickBehaviour2Watch(get2Watch(), anime, button2Watch, buttonSeen));
        });
    } else {
        button2Watch.text("Add to my To Watch list");
        button2Watch.on("click", () => {
            saveTo2Watch(anime);
            button2Watch.text("Remove from To Watch list");
            clickBehaviourSeen(getSeen(), anime, buttonSeen, button2Watch);
            button2Watch.on("click", clickBehaviour2Watch(get2Watch(), anime, button2Watch, buttonSeen));
        });
    }
    update2WatchCount(toWatch);
};

const clickBehaviourSeen = (seen, anime, buttonSeen, button2Watch) => {
    buttonSeen.off();
    if (seen.some(a => a.id === anime.id)) {
        buttonSeen.text("Remove from Seen");
        buttonSeen.on("click", () => {
            removeFromSeen(anime);
            buttonSeen.text("Add to Seen");
            buttonSeen.on("click", clickBehaviourSeen(getSeen(), anime, buttonSeen, button2Watch));
        });
    } else {
        buttonSeen.text("Add to Seen");
        buttonSeen.on("click", () => {
            saveToSeen(anime);
            buttonSeen.text("Remove from Seen");
            clickBehaviour2Watch(get2Watch(), anime, button2Watch, buttonSeen);
            buttonSeen.on("click", clickBehaviourSeen(getSeen(), anime, buttonSeen, button2Watch));
        });
    }
    updateSeenCount(seen);
};

const clickBehaviourStars = (animeElement, anime, myRatings) => {
    let stars = myRatings.get(anime.id)?.stars;
    for (let index = 1; index <= 5; index++) {
        const button = animeElement.find(`#${anime.id}-${index}-star`);
        button.removeClass("star-glowing");
        button.off();
        button.on("click", () => {
            //console.log(`Click! add rating ${id}-${index}`);
            addRating(anime, index);
            //console.log(id + "-" + getRatings().get(id));
            clickBehaviourStars(animeElement, anime, getRatings());
        });
    }
    if (stars != undefined) {
        for (let index = 1; index <= stars; index++) {
            const button = animeElement.find(`#${anime.id}-${index}-star`);
            button.addClass("star-glowing");
        }
    }
    updateRatedCount(myRatings);
};

const renderAnimeDetail = (anime, studio, toWatch, seen, myRatings, resp) => {
    const { id, attributes } = anime;
    const { canonicalTitle, posterImage, averageRating, description, episodeCount, startDate, status, subtype, titles } = attributes;
    const { small, tiny } = posterImage;

    //console.log(canonicalTitle);
    const animeElement = $(`
    <div class="anime">
        <h2>${canonicalTitle}</h2>
        <h3>${(titles.en && titles.en !== canonicalTitle) ? titles.en : ""}</h3>
        <h3>${titles.ja_jp ? titles.ja_jp : ""}</h3>
        <h3>Season: ${formatSeason(startDate)}</h3>
        <div class="flex-row">
            <div class="flex-col">
                <img src="${small}" alt="poster image">
                <div class="flex-row">
                <div>${subtype.toUpperCase()}</div>
                <div>${status.toUpperCase()}</div>
                </div>
                <div>Episodes: ${episodeCount ? episodeCount : "unknown"}</div>
                <div>Studio: ${studio}</div>
                <div>Rating: ${printStars(averageRating)} ${averageRating ? (averageRating + " %") : "No ratings"}</div>
            </div>
            <div class="flex-col anime-desc">
                <p>${description}</p>
                <div class="flex-row">
                    <button id="${id}-button-add-2watch">Add to my To Watch list</button>
                    <button id="${id}-button-add-seen">Add to Seen</button>
                    <div>
                        <label>My rating: </label>
                        <button id="${id}-1-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-2-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-3-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-4-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-5-star"><i class="fas fa-star"></i></button>
                    </div>
                </div>
                <div class="flex-row">
                    <button id="${id}-button-go-back">Go back</button>
                </div>
            </div>
        </div>
    </div>
    `);
    const button2Watch = animeElement.find(`#${id}-button-add-2watch`);
    const buttonSeen = animeElement.find(`#${id}-button-add-seen`);
    clickBehaviour2Watch(toWatch, { id, canonicalTitle, tiny, averageRating }, button2Watch, buttonSeen);
    clickBehaviourSeen(seen, { id, canonicalTitle, tiny, averageRating }, buttonSeen, button2Watch);
    clickBehaviourStars(animeElement, { id, canonicalTitle, tiny, averageRating }, myRatings);
    const buttonGoBack = animeElement.find(`#${id}-button-go-back`);
    buttonGoBack.on("click", () => {
        appContainer.empty();
        renderAnime(resp);
    });
    return animeElement;
};

const renderAnimeSmall = (anime, studios, producers, toWatch, seen, myRatings, index, resp) => {
    const { id, attributes, relationships } = anime;
    const { canonicalTitle, posterImage, averageRating } = attributes;
    const { tiny } = posterImage;
    const studio = getStudioName(relationships.productions.data, studios, producers, index);
    index++;

    //console.log(canonicalTitle);
    const animeElement = $(`
    <div class="anime">
        <div class="flex-row">
            <div class="flex-col">
                <img src="${tiny}" alt="poster image">
                <button id="${id}-button-detail">View Detail</button>
            </div>
            <div class="flex-col">
                <h2>${canonicalTitle}</h2>
                <div>Rating: ${printStars(averageRating)} ${averageRating ? (averageRating + " %") : "No ratings"}</div>
            </div>
        </div>
        <br>
    </div>
    `);
    const buttonDetail = animeElement.find(`#${id}-button-detail`);
    buttonDetail.on("click", () => {
        appContainer.empty();
        appContainer.append(renderAnimeDetail(anime, studio, toWatch, seen, myRatings, resp));
    });

    return animeElement;
};

export const renderAnime = async (resp) => {
    if (resp === null) {
        return;
    }

    const animeList = resp.data.data;
    const studios = getStudios(resp.data.included);
    const producers = getProducers(resp.data.included);

    const toWatch = get2Watch();
    const seen = getSeen();
    const myRatings = getRatings();
    //console.log(myRatings);

    update2WatchCount(toWatch);
    updateSeenCount(seen);
    updateRatedCount(myRatings);

    let index = 0;
    const animeElements = [];

    animeElements.push(renderNav("page-nav-top", resp.data.links));

    for (const anime of animeList) {
        
        animeElements.push(renderAnimeSmall(anime, studios, producers, toWatch, seen, myRatings, index, resp));
    };

    animeElements.push(renderNav("page-nav-bottom", resp.data.links));

    appContainer.empty();
    appContainer.append(animeElements);
};

export const deselectOrder = () => {
    buttonOrderRelevance.removeClass("order-selected");
    buttonOrderNewest.removeClass("order-selected");
    buttonOrderRating.removeClass("order-selected");
    buttonOrderPopularity.removeClass("order-selected");
};

export const renderCategories = async (resp) => {
    if (resp === null) {
        return;
    }

    emptyCategoryList();
    const selectedCategories = loadCategories();
    loadOrder();
    deselectOrder();
    switch (order) {
        case OrderEnum.POPULARITY:
            buttonOrderPopularity.addClass("order-selected");
            break;

        case OrderEnum.RATING:
            buttonOrderRating.addClass("order-selected");
            break;

        case OrderEnum.NEWEST:
            buttonOrderNewest.addClass("order-selected");
            break;

        default:
            buttonOrderRelevance.addClass("order-selected");
            break;
    }

    //console.log("Loaded: ", selectedCategories);
    const categoryElements = [];
    for (const category of resp.data.data) {
        const categoryElement = $(`
        <div>
            <input class="category" id="${category.attributes.slug}" type="checkbox">
            <label>${category.attributes.title}</label>
        </div>
        `);
        if (selectedCategories.includes(category.attributes.slug)) {
            categoryElement.find('input.category').prop('checked', true);
        }
        //console.log(categoryElement.find(".category").attr("id"));
        categoryList.push(categoryElement.find(".category"));
        categoryElements.push(categoryElement);
    }
    categoryContainer.empty();
    categoryContainer.append(categoryElements);
};

const renderNavId = (classType, list, from) => {
    if (typeof list === "undefined") {
        return null;
    };

    const navbar = $(`
    <nav class="flex-row centered-content ${classType}">
      <button class="button-first">first</button>
      <button class="button-prev">previous</button>
      <button class="button-next">next</button>
      <button class="button-last">last</button>
    </nav>
    `);

    navbar.find(".button-first").on("click", async () => {
        renderList(list, 0, 10);
    });

    if (from < 10) {
        navbar.find(".button-prev").remove();
    } else {
        navbar.find(".button-prev").on("click", async () => {
            renderList(list, from - 10, from);
        });
    }

    if (from + 10 > list.length) {
        navbar.find(".button-next").remove();
    } else {
        navbar.find(".button-next").on("click", async () => {
            renderList(list, from + 10, from + 20);
        });
    }

    navbar.find(".button-last").on("click", async () => {
        const last = list.length;
        if (last < 0) {
            last = 0;
        }
        const start = Math.max(0, Math.floor(last / 10) * 10);
        if (start < 0) {
            start = 0;
        }
        //console.log(`${start} - ${last}`);
        renderList(list, start, last);
    });

    return navbar;
};

const renderAnimeDetailById = (resp, list, from, to) => {
    const anime = resp.data.data;
    const { id, attributes } = anime;
    const { canonicalTitle, posterImage, averageRating, description, episodeCount, startDate, status, subtype, titles } = attributes;
    const { small, tiny } = posterImage;

    const studios = getStudios(resp.data.included);
    const producers = getProducers(resp.data.included);
    const studio = getStudioName(resp.data.data.relationships.productions.data, studios, producers, 0);

    const toWatch = get2Watch();
    const seen = getSeen();
    const myRatings = getRatings();

    //console.log(canonicalTitle);
    const animeElement = $(`
    <div class="anime">
        <h2>${canonicalTitle}</h2>
        <h3>${(titles.en && titles.en !== canonicalTitle) ? titles.en : ""}</h3>
        <h3>${titles.ja_jp ? titles.ja_jp : ""}</h3>
        <h3>Season: ${formatSeason(startDate)}</h3>
        <div class="flex-row">
            <div class="flex-col">
                <img src="${small}" alt="poster image">
                <div class="flex-row">
                <div>${subtype.toUpperCase()}</div>
                <div>${status.toUpperCase()}</div>
                </div>
                <div>Episodes: ${episodeCount ? episodeCount : "unknown"}</div>
                <div>Studio: ${studio}</div>
                <div>Rating: ${printStars(averageRating)} ${averageRating ? (averageRating + " %") : "No ratings"}</div>
            </div>
            <div class="flex-col anime-desc">
                <p>${description}</p>
                <div class="flex-row">
                    <button id="${id}-button-add-2watch">Add to my To Watch list</button>
                    <button id="${id}-button-add-seen">Add to Seen</button>
                    <div>
                        <label>My rating: </label>
                        <button id="${id}-1-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-2-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-3-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-4-star"><i class="fas fa-star"></i></button>
                        <button id="${id}-5-star"><i class="fas fa-star"></i></button>
                    </div>
                </div>
                <div class="flex-row">
                    <button id="${id}-button-go-back">Go back</button>
                </div>
            </div>
        </div>
    </div>
    `);
    const button2Watch = animeElement.find(`#${id}-button-add-2watch`);
    const buttonSeen = animeElement.find(`#${id}-button-add-seen`);
    clickBehaviour2Watch(toWatch, { id, canonicalTitle, tiny, averageRating }, button2Watch, buttonSeen);
    clickBehaviourSeen(seen, { id, canonicalTitle, tiny, averageRating }, buttonSeen, button2Watch);
    clickBehaviourStars(animeElement, { id, canonicalTitle, tiny, averageRating }, myRatings);
    const buttonGoBack = animeElement.find(`#${id}-button-go-back`);
    buttonGoBack.on("click", () => {
        appContainer.empty();
        renderList(list, from, to);
    });
    return animeElement;
};

export const renderList = async (list, from, to) => {
    appContainer.empty();
    if (!list?.length) {
        return;
    }
    const listSlice = list.slice(from, to);
    //console.log(listSlice);
    /*const animePromises = listSlice.map(id => getAnimeById(id));
    const animes = await Promise.all(animePromises);
    const merged = mergeAxiosJsonApiResponses(animes);
    //console.log(merged);
    renderAnime(merged);*/
    const animeElements = [];
    for (const anime of listSlice) {
        const {  id, canonicalTitle, tiny, averageRating } = anime;
        const animeElement = $(`
        <div class="anime">
            <div class="flex-row">
                <div class="flex-col">
                    <img src="${tiny}" alt="poster image">
                    <button id="${id}-button-detail">View Detail</button>
                </div>
                <div class="flex-col">
                    <h2>${canonicalTitle}</h2>
                    <div>Rating: ${printStars(averageRating)} ${averageRating ? (averageRating + " %") : "No ratings"}</div>
                </div>
            </div>
            <br>
        </div>
        `);
        const buttonDetail = animeElement.find(`#${id}-button-detail`);
        buttonDetail.on("click", async () => {
            appContainer.empty();
            appContainer.append(loadingImg.clone());
            const resp = await getAnimeById(id);
            appContainer.empty();

            update2WatchCount(get2Watch());
            updateSeenCount(getSeen());
            appContainer.append(renderAnimeDetailById(resp, list, from, to));
        });
        animeElements.push(animeElement);
    }
    appContainer.empty();
    appContainer.append(animeElements);
    appContainer.prepend(renderNavId("page-nav-top", list, from));
    appContainer.append(renderNavId("page-nav-bottom", list, from));
};

/*const mergeAxiosJsonApiResponses = (responses) => {
    return {
        data: {
            data: responses.flatMap(r => r.data.data),
            included: Object.values(
                Object.fromEntries(
                    responses
                        .flatMap(r => r.data.included ?? [])
                        .map(r => [`${r.type}:${r.id}`, r])
                )
            )
        }
    };
};*/