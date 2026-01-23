// Base URL for TheCocktailDB API
const BASE_URL = "https://www.thecocktaildb.com/api/json/v1/1";

// NAME search
// returns full objects or null
export async function searchByName(query) {
    const url = `${BASE_URL}/search.php?s=${encodeURIComponent(query)}`;

    // http request to api
    const res = await fetch(url);

    // request success check
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json(); // json to js object convert
}

// INGREDIENT search
export async function searchByIngredient(ingredient) {
    const url = `${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json(); // simplified cocktail objects
}

// RANDOM search
export async function getRandomCocktail() {
    const url = `${BASE_URL}/random.php`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json(); // usually returns one drink in the array
}

// FULL DETAIL fetch
// after results item is clicked
export async function lookupById(idDrink) {
    const url = `${BASE_URL}/lookup.php?i=${encodeURIComponent(idDrink)}`;

    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`);
    }

    return res.json(); // detail
}
