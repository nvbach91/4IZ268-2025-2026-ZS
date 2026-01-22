// storage key used for persisting favourites in localStorage
const storageKey = "cocktailExplorer.favourites";

// loads favourite cocktail IDs from localStorage
// if nothing is stored yet or an error occurs, it returns an empty array
export function loadFavourites() {
  try {
    const raw = localStorage.getItem(storageKey); // raw string value from lS
    const arr = raw ? JSON.parse(raw) : []; // convert json to JS value; if nothing return empty array
    return Array.isArray(arr) ? arr : []; // prevents errors in case of invalid data - is array really an array?
  } catch {
    return []; // if error occurs return empty array
  }
}

// saves current list of fav cocktail IDs to lS
export function saveFavourites(favIds) {
  localStorage.setItem(storageKey, JSON.stringify(favIds));
}
