import { appContainer, buttonOrderNewest, buttonOrderPopularity, buttonOrderRating, buttonOrderRelevance, categoryContainer, categoryList, emptyCategoryList, loadingImg, order, OrderEnum } from "./elements.js";
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

const clickBehaviour2Watch = (toWatch, id, button2Watch) => {
    button2Watch.off();
    if (toWatch.includes(id)) {
        button2Watch.text("Remove from To Watch list");
        button2Watch.on("click", () => {
            removeFrom2Watch(id);
            button2Watch.text("Add to my To Watch list");
            button2Watch.on("click", clickBehaviour2Watch(get2Watch(), id, button2Watch));
        });
    } else {
        button2Watch.text("Add to my To Watch list");
        button2Watch.on("click", () => {
            saveTo2Watch(id);
            button2Watch.text("Remove from To Watch list");
            button2Watch.on("click", clickBehaviour2Watch(get2Watch(), id, button2Watch));
        });
    }
};

const clickBehaviourSeen = (seen, id, buttonSeen, button2Watch) => {
    buttonSeen.off();
    if (seen.includes(id)) {
        buttonSeen.text("Remove from Seen");
        buttonSeen.on("click", () => {
            removeFromSeen(id);
            buttonSeen.text("Add to Seen");
            buttonSeen.on("click", clickBehaviourSeen(getSeen(), id, buttonSeen, button2Watch));
        });
    } else {
        buttonSeen.text("Add to Seen");
        buttonSeen.on("click", () => {
            saveToSeen(id);
            buttonSeen.text("Remove from Seen");
            clickBehaviour2Watch(get2Watch(), id, button2Watch);
            buttonSeen.on("click", clickBehaviourSeen(getSeen(), id, buttonSeen, button2Watch));
        });
    }
};

const clickBehaviourStars = (animeElement, id, myRatings) => {
    let stars = myRatings.get(id);
    for (let index = 1; index <= 5; index++) {
        const button = animeElement.find(`#${id}-${index}-star`);
        button.removeClass("star-glowing");
        button.off();
        button.on("click", () => {
            //console.log(`Click! add rating ${id}-${index}`);
            addRating(id, index);
            //console.log(id + "-" + getRatings().get(id));
            clickBehaviourStars(animeElement, id, getRatings());
        });
    }
    if (stars != undefined) {
        for (let index = 1; index <= stars; index++) {
            const button = animeElement.find(`#${id}-${index}-star`);
            button.addClass("star-glowing");
        }
    }
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

    let index = 0;
    const animeElements = [];

    animeElements.push(renderNav("page-nav-top", resp.data.links));

    for (const anime of animeList) {
        const { id, attributes, relationships } = anime;
        const { canonicalTitle, posterImage, averageRating, description, episodeCount, startDate, status, subtype, titles } = attributes;
        const { small } = posterImage;
        const studio = getStudioName(relationships.productions.data, studios, producers, index);
        index++;

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
                <div>Episodes: ${episodeCount}</div>
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
            </div>
            </div>
        </div>
        `);
        const button2Watch = animeElement.find(`#${id}-button-add-2watch`);
        clickBehaviour2Watch(toWatch, id, button2Watch);
        const buttonSeen = animeElement.find(`#${id}-button-add-seen`);
        clickBehaviourSeen(seen, id, buttonSeen, button2Watch);
        clickBehaviourStars(animeElement, id, myRatings);
        animeElements.push(animeElement);
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

const renderNavId = (classType, idList, from) => {
    if (typeof idList === "undefined") {
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
        renderIdList(idList, 0, 10);
    });

    if (from < 10) {
        navbar.find(".button-prev").remove();
    } else {
        navbar.find(".button-prev").on("click", async () => {
            renderIdList(idList, from - 10, from);
        });
    }

    if (from + 10 > idList.length) {
        navbar.find(".button-next").remove();
    } else {
        navbar.find(".button-next").on("click", async () => {
            renderIdList(idList, from + 10, from + 20);
        });
    }

    navbar.find(".button-last").on("click", async () => {
        const last = idList.length;
        if (last < 0) {
            last = 0;
        }
        const start = Math.max(0, Math.floor(last / 10) * 10);
        if (start < 0) {
            start = 0;
        }
        //console.log(`${start} - ${last}`);
        renderIdList(idList, start, last);
    });

    return navbar;
};

export const renderIdList = async (idList, from, to) => {
    appContainer.empty();
    if (!idList?.length) {
        return;
    }
    const idListSlice = idList.slice(from, to);
    const animePromises = idListSlice.map(id => getAnimeById(id));
    const animes = await Promise.all(animePromises);
    const merged = mergeAxiosJsonApiResponses(animes);
    //console.log(merged);
    renderAnime(merged);
    appContainer.prepend(renderNavId("page-nav-top", idList, from));
    appContainer.append(renderNavId("page-nav-bottom", idList, from));
};

const mergeAxiosJsonApiResponses = (responses) => {
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
};