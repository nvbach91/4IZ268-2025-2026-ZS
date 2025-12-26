import { categoryList, formSearch, order, OrderEnum } from "./elements.js";

export const makeRequest = async (url) => {
    let resp = null;
    try {
        //console.log(url);
        resp = await axios.get(url);
        //console.log("Status:", resp.status);
        //console.log("Headers:", resp.headers);
        //console.log("Body:", resp.data);
        //console.log(resp.data.data);
    } catch (e) {
        console.error("Axios error:", e);
    }
    return resp;
};

const getSelectedCategories = () => {
    const categories = [];
    for (const category of categoryList) {
        if (category.is(":checked")) {
            categories.push(category.attr("id"));
        }
    }
    return categories;
};

const assembleQuery = () => {
    let returnString = "";
    const formData = new FormData(formSearch.get(0));
    let searchString = formData.get('searchField');
    if (searchString !== "") {
        searchString = searchString.replaceAll(" ", "%20");
        returnString = `filter%5Btext%5D=${searchString}`;
    }
    const selectedCategories = getSelectedCategories();
    for (const category of selectedCategories) {
        if (returnString !== "") {
            returnString += "&";
        }
        returnString += `filter%5Bcategories%5D=${category}`;
    }
    if (returnString !== "") {
        returnString += "&";
    }
    returnString += order;
    if (returnString !== "") {
        returnString = "?" + returnString;
    }
    return returnString;
};

export const getAnime = async () => {
    const query = assembleQuery();
    //console.log(query);
    return await makeRequest(`https://kitsu.io/api/edge/anime${query}`);
};

export const getCategories = async () => {
    return await makeRequest('https://kitsu.io/api/edge/categories?page%5Blimit%5D=56&page%5Boffset%5D=0&sort=-totalMediaCount');
}; 