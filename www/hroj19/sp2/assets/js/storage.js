// storage key used for persisting favourites in localStorage
const storageKey = "cocktailExplorer.favourites";

// loads favourite cocktail IDs from localStorage
// if nothing is stored yet or an error occurs, it returns an empty array
export function loadFavourites() {
  try {
    const raw = localStorage.getItem(storageKey); // raw string value from lS
    const arr = raw ? JSON.parse(raw) : []; // convert json to JS value; if nothing return empty array
    if (!Array.isArray(arr)) return [];

    if (arr.length && typeof arr[0] === "string") {
      return arr.map((id) => ({ idDrink: String(id), strDrink: "", strDrinkThumb: "" }));
    }

    // normalize objects
    return arr
      .filter((x) => x && x.idDrink)
      .map((x) => ({
        idDrink: String(x.idDrink),
        strDrink: String(x.strDrink || ""),
        strDrinkThumb: String(x.strDrinkThumb || ""),
      }));
  } catch {
    return []; // if error occurs return empty array
  }
}

// saves current list of fav cocktail IDs to lS
export function saveFavourites(favIds) {
  localStorage.setItem(storageKey, JSON.stringify(favIds));
}
