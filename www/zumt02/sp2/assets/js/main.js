import { buttonSearch, button2Watch, buttonSeen, buttonOrderRelevance, buttonOrderNewest, buttonOrderRating, buttonOrderPopularity, OrderEnum, setOrder, filtersContainer, appContainer, loadingImg, buttonApply, buttonRated } from "./elements.js";
import { deselectOrder, renderAnime, renderCategories, renderList } from "./renders.js";
import { getAnime, getCategories, getSelectedCategories } from "./network.js";
import { cleanParams, get2Watch, getRatings, getSeen, loadCategories, loadList, loadOrder, loadSearch, push2WatchToURL, pushRatedToURL, pushSeenToURL, saveCategories, saveOrder, saveSearch } from "./storage.js";

const preload = loadingImg;

const search = async () => {
  cleanParams();
  saveSearch(true);
  saveCategories(getSelectedCategories(), true);
  saveOrder(true);

  filtersContainer.show();
  renderAnime(await getAnime());
};

buttonSearch.on('click', (e) => {
  e.preventDefault();
  search();
});

buttonApply.on('click', () => {
  search();
});

button2Watch.on('click', async () => {
  const toWatch = get2Watch();
  //console.log(toWatch);
  push2WatchToURL();

  filtersContainer.hide();
  renderList(toWatch, 0, 10);
});

buttonSeen.on('click', async () => {
  const seen = getSeen();
  //console.log(seen);
  pushSeenToURL();

  filtersContainer.hide();
  renderList(seen, 0, 10);
});

buttonRated.on('click', async () => {
  const ratings = getRatings();
  const ratedAnimes = Array.from(ratings.values()).map(r => r.anime);
  //console.log(ratedAnimes);
  pushRatedToURL();

  filtersContainer.hide();
  renderList(ratedAnimes, 0, 10);
});

buttonOrderRelevance.on('click', () => {
  setOrder(OrderEnum.RELEVANCE);
  deselectOrder();
  buttonOrderRelevance.addClass("order-selected");
  search();
});

buttonOrderNewest.on('click', () => {
  setOrder(OrderEnum.NEWEST);
  deselectOrder();
  buttonOrderNewest.addClass("order-selected");
  search();
});

buttonOrderRating.on('click', () => {
  setOrder(OrderEnum.RATING);
  deselectOrder();
  buttonOrderRating.addClass("order-selected");
  search();
});

buttonOrderPopularity.on('click', () => {
  setOrder(OrderEnum.POPULARITY);
  deselectOrder();
  buttonOrderPopularity.addClass("order-selected");
  search();
});

const initialCategories = loadCategories();
const initialOrder = loadOrder();

saveCategories(initialCategories);
saveOrder(initialOrder);

appContainer.append(loadingImg);
renderCategories(await getCategories());
renderAnime(await getAnime());

window.addEventListener('popstate', async () => {
  //console.log("popstate");
  appContainer.empty();
  appContainer.append(loadingImg);
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

    case 'rated':
      filtersContainer.hide();
      const ratings = getRatings();
      const ratedAnimes = Array.from(ratings.values()).map(r => r.anime);
      renderList(ratedAnimes, 0, 10);
      break;

    default:
      filtersContainer.show();
      renderCategories(await getCategories());
      renderAnime(await getAnime());
      break;
  }
});