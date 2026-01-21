import { saveOrder } from "./storage.js";

export const appContainer = $('#app');

export const categoryContainer = $('#categories');
export let categoryList = [];

export const buttonSearch = $('#button-search');
export const buttonApply = $('#button-apply');

export const button2Watch = $('#button-2watch');
export const buttonSeen = $('#button-seen');

export const filtersContainer = $('#filters');

export const buttonOrderRelevance = $('#button-order-relevance');
export const buttonOrderNewest = $('#button-order-newest');
export const buttonOrderRating = $('#button-order-rating');
export const buttonOrderPopularity = $('#button-order-popularity');

export const formSearch = $('#form-search');

export const emptyCategoryList = () => {
    categoryList = [];
};

export const OrderEnum = Object.freeze({
    RELEVANCE: "",
    NEWEST: "sort=-startDate",
    RATING: "sort=-averageRating",
    POPULARITY: "sort=-favoritesCount"
});

export let order = OrderEnum.RELEVANCE;

export const setOrder = (value) => {
    order = value;
};

export const loadingImg = $(`
    <div class="flex-row centered-content">
        <img src="./assets/img/loading.gif" alt="Loading...">
    </div>
`);