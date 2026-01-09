const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1/';

const DOM = {
    app: document.getElementById(''),
    searchInput: document.getElementById(''),
    searchIcon: document.getElementById(''),
};

const state = {
    searchResults: []
};

const fetchApi = async (endpoint) => {
    try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("Chyba při stahování:", error);
        return null;
    }
};

const searchCocktails = async (query) => {
    const data = await fetchApi(`search.php?s=${query}`);
    state.searchResults = data ? data.drinks : [];
    return state.searchResults;
};

const getCocktailById = async (id) => {
    const data = await fetchApi(`lookup.php?i=${id}`);
    return data && data.drinks ? data.drinks[0] : null;
};

const render = () => {
    console.log('Zatím jen testuju, jestli se volá render...');
    console.log('Aktuální data:', state.searchResults);
};

window.addEventListener('hashchange', render);
window.addEventListener('load', render);