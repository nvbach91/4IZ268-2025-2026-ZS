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

import { buttonSearch, button2Watch, buttonSeen, buttonOrderRelevance, buttonOrderNewest, buttonOrderRating, buttonOrderPopularity, OrderEnum, setOrder } from "./elements.js";
import { renderAnime, renderCategories } from "./renders.js";
import { getAnime, getCategories } from "./network.js";

buttonSearch.on('click', async (e) => {
  e.preventDefault();

  renderAnime(await getAnime());  
});

button2Watch.on('click', async () => {

});

buttonSeen.on('click', async () => {

});

const deselectOrder = () => {
  buttonOrderRelevance.removeClass("order-selected");
  buttonOrderNewest.removeClass("order-selected");
  buttonOrderRating.removeClass("order-selected");
  buttonOrderPopularity.removeClass("order-selected");
};

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

renderAnime(await getAnime());
renderCategories(await getCategories());