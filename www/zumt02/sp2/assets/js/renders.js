import { appContainer, categoryContainer, categoryList, emptyCategoryList } from "./elements.js";

const getStudio = async (link) => {
    try {
        const resp = await axios.get(link);
        for (const production of resp.data.data) {
            const { attributes, relationships } = production;
            if (attributes.role === "studio") {
                const respStudio = await axios.get(relationships.company.links.related);
                return respStudio.data.data.attributes.name;
            }
        }
    } catch (e) {
        console.error("Axios error:", e);
    }

    return "unknown";
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

const renderNav = (classType, links) => {
    const navbar = $(`
    <nav class="flex-row centered-content ${classType}">
      <button class="button-first">first</button>
      <button class="button-prev">previous</button>
      <button class="button-next">next</button>
      <button class="button-last">last</button>
    </nav>
  `);
    navbar.find(".button-first").on("click", () => {
        makeRequest(links.first);
    });

    if (typeof links.prev === "undefined") {
        navbar.find(".button-prev").remove();
    } else {
        navbar.find(".button-prev").on("click", () => {
            makeRequest(links.prev);
        });
    }

    if (typeof links.next === "undefined") {
        navbar.find(".button-next").remove();
    } else {
        navbar.find(".button-next").on("click", () => {
            makeRequest(links.next);
        });
    }

    navbar.find(".button-last").on("click", () => {
        makeRequest(links.last);
    });

    return navbar;
};

export const renderAnime = async (resp) => {
    if (resp === null) {
        return;
    }

    appContainer.empty();
    const animeList = resp.data.data;
    const studioPromises = animeList.map(anime =>
        getStudio(anime.relationships.productions.links.related)
    );

    const studios = await Promise.all(studioPromises);

    let index = 0;
    const animeElements = [];

    animeElements.push(renderNav("page-nav-top", resp.data.links));

    for (const anime of animeList) {
        const { attributes } = anime;
        const { canonicalTitle, posterImage, averageRating, description, episodeCount, startDate, status, subtype } = attributes;
        const { small } = posterImage;
        const studio = studios[index];
        index++;

        //console.log(canonicalTitle);
        const animeElement = $(`
        <div class="anime">
            <h2>${canonicalTitle}</h2>
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
                <div>Rating: ***** ${averageRating}%</div>
            </div>
            <div class="flex-col anime-desc">
                <p>${description}</p>
                <div class="flex-row">
                <button id="button-add-2watch">Add to my To Watch list</button>
                <button id="button-add-seen">Add to Seen</button>
                </div>
            </div>
            </div>
        </div>
        `);
        animeElements.push(animeElement);
    };

    animeElements.push(renderNav("page-nav-bottom", resp.data.links));

    appContainer.append(animeElements);
};

export const renderCategories = async (resp) => {
    if (resp === null) {
        return;
    }

    emptyCategoryList();
    const categoryElements = [];
    for (const category of resp.data.data) {
        const categoryElement = $(`
        <div>
            <input class="category" id="${category.attributes.slug}" type="checkbox">
            <label>${category.attributes.title}</label>
        </div>
        `);
        //console.log(categoryElement.find(".category").attr("id"));
        categoryList.push(categoryElement.find(".category"));
        categoryElements.push(categoryElement);
    }
    categoryContainer.append(categoryElements);
};