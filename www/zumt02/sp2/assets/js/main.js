/*var request = new XMLHttpRequest();

request.open('GET', 'https://kitsu.io/api/edge/anime');

request.onreadystatechange = function () {
  if (this.readyState === 4) {
    console.log('Status:', this.status);
    console.log('Headers:', this.getAllResponseHeaders());
    console.log('Body:', this.responseText);
  }
};

request.send();*/

const appContainer = $('#app');
const buttonSearch = $('#button-search');
const button2Watch = $('#button-2watch');
const buttonSeen = $('#button-seen');
const formSearch = $('#form-search');

const assembleQuery = () => {
  const formData = new FormData(formSearch.get(0));
  let searchString = formData.get('searchField');
  if (searchString !== "") {
    searchString = searchString.replaceAll(" ", "%20");
    return `?filter%5Btext%5D=${searchString}`;
  }
  return "";
};

const makeRequest = async (url) => {
  try {
    //console.log(url);
    const resp = await axios.get(url);
    //console.log("Status:", resp.status);
    //console.log("Headers:", resp.headers);
    //console.log("Body:", resp.data);
    //console.log(resp.data.data);
    renderAnime(resp);
  } catch (e) {
    console.error("Axios error:", e);
  }
};

buttonSearch.on('click', async (e) => {
  e.preventDefault();

  const query = assembleQuery();
  //console.log(query);
  await makeRequest(`https://kitsu.io/api/edge/anime${query}`);
});

button2Watch.on('click', async () => {

});

buttonSeen.on('click', async () => {

});

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

const renderAnime = async (resp) => {
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
    const { id, type, links, relationships, attributes } = anime;
    const { canonicalTitle, posterImage, averageRating, description, episodeCount, startDate, status, subtype } = attributes;
    const { small } = posterImage;
    const { productions } = relationships;
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