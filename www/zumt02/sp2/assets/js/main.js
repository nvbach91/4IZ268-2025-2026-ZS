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

import { buttonSearch, button2Watch, buttonSeen, buttonOrderRelevance, buttonOrderNewest, buttonOrderRating, buttonOrderPopularity, OrderEnum, setOrder, filtersContainer, appContainer, loadingImg } from "./elements.js";
import { deselectOrder, renderAnime, renderCategories, renderIdList } from "./renders.js";
import { getAnime, getCategories, getSelectedCategories } from "./network.js";
import { cleanParams, get2Watch, getSeen, loadCategories, loadList, loadOrder, loadSearch, push2WatchToURL, pushSeenToURL, saveCategories, saveOrder, saveSearch } from "./storage.js";

const preload = loadingImg;

buttonSearch.on('click', async (e) => {
  e.preventDefault();
  cleanParams();
  saveSearch(true);
  saveCategories(getSelectedCategories(), true);
  saveOrder(true);

  filtersContainer.show();
  renderAnime(await getAnime());
});

button2Watch.on('click', async () => {
  const toWatch = get2Watch();
  //console.log(toWatch);
  push2WatchToURL();

  filtersContainer.hide();
  renderIdList(toWatch, 0, 10);
});

buttonSeen.on('click', async () => {
  const seen = getSeen();
  //console.log(seen);
  pushSeenToURL();

  filtersContainer.hide();
  renderIdList(seen, 0, 10);
});

buttonOrderRelevance.on('click', () => {
  setOrder(OrderEnum.RELEVANCE);
  deselectOrder();
  buttonOrderRelevance.addClass("order-selected");
});

buttonOrderNewest.on('click', () => {
  setOrder(OrderEnum.NEWEST);
  deselectOrder();
  buttonOrderNewest.addClass("order-selected");
});

buttonOrderRating.on('click', () => {
  setOrder(OrderEnum.RATING);
  deselectOrder();
  buttonOrderRating.addClass("order-selected");
});

buttonOrderPopularity.on('click', () => {
  setOrder(OrderEnum.POPULARITY);
  deselectOrder();
  buttonOrderPopularity.addClass("order-selected");
});

const initialCategories = loadCategories();
const initialOrder = loadOrder();

saveCategories(initialCategories);
saveOrder(initialOrder);

appContainer.append(loadingImg);
renderCategories(await getCategories());
renderAnime(await getAnime());

window.addEventListener('popstate', async () => {
  console.log("popstate");
  appContainer.empty();
  appContainer.append(loadingImg);
  //loadOrder();
  //loadCategories();
  loadSearch();

  switch (loadList()) {
    case 'seen':
      filtersContainer.hide();
      const seen = getSeen();
      renderIdList(seen, 0, 10);
      break;

    case 'toWatch':
      filtersContainer.hide();
      const toWatch = get2Watch();
      renderIdList(toWatch, 0, 10);
      break;

    default:
      filtersContainer.show();
      renderCategories(await getCategories());
      renderAnime(await getAnime());
      break;
  }
});