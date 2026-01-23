// main app logic
import { searchByName, searchByIngredient, getRandomCocktail, lookupById } from "./api.js";
import { loadFavourites, saveFavourites } from "./storage.js";
import {
  showResultsMessage,
  showDetailMessage,
  setResultsLoading,
  setDetailLoading,
  showResultsInfo,
  clearResultsInfo,
  renderDetail,
} from "./ui.js";

// App object keeps the main runtime state of the application
const App = {
  favourites: [], // stored cocktail IDs
  viewMode: "search", // "search" | "favourites"
  lastResults: [], // last rendered results
  lastSearchResults: [], // remembers last search/random results (so we can return after favourites)
  lastSearchState: null, // optional: remembers last search params (q/mode/type)
  isRestoring: false, // prevents pushState when restoring from history
  lastResultsInfo: "",
  sortMode: "default", // "default" | "az" | "za"
  detailLang: "en", // "en" | "es" | "de" | "fr" | "it"

  init() {
    // load favs from lS
    App.favourites = loadFavourites();

    // DOM cache (elements exist from the start; do not query repeatedly)
    App.els = {
      form: document.getElementById("searchForm"),
      randomBtn: document.getElementById("randomBtn"),
      favouritesBtn: document.getElementById("favouritesBtn"),
      queryInput: document.getElementById("queryInput"),
      results: document.getElementById("results"),
      detail: document.getElementById("detail"),
      resultsInfo: document.getElementById("resultsInfo"),
    };

    const { form, randomBtn, favouritesBtn } = App.els;

    // placeholders (empty state)
    showResultsMessage("Search a drink to get a result", "fa-circle-question");
    showDetailMessage("Select a cocktail from the results to see details.", "fa-wine-glass");

    // SORT control (in Results header)
    App.mountSortControl();

    // ---- EVENTS ----

    // SUBMIT SEARCH (name/ingredient)
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      App.viewMode = "search"; // always switch back to search view
      App.updateFavouritesButton();

      const searchData = App.readFormsearchData(); // read current form settings (query, alcFilter)

      // placeholder validation
      if (!searchData.query) {
        showResultsMessage("Search a drink to get a result", "fa-circle-question");
        return;
      }

      try {
        // RESULTS show spinner
        setResultsLoading(true);

        // choose API endmode based on search mode
        let data;
        if (searchData.searchMode === "ingredient") {
          data = await searchByIngredient(searchData.query);
        } else {
          data = await searchByName(searchData.query);
        }

        const rawDrinks = data.drinks || []; // {drinks: null} when nothing is found

        // apply type filter (if possible)
        const filtered = App.applyTypeFilter(rawDrinks, searchData.alcoholFilter);

        // RESULTS header - ingredient search is limited = filters dont work
        const countText = `Found ${filtered.length} drinks`;

        if (searchData.searchMode === "ingredient" && searchData.alcoholFilter !== "all") {
          App.lastResultsInfo =
            `Type filter can't be applied to ingredient search results (API returns limited data). ${countText}`;
        } else {
          App.lastResultsInfo = countText;
        }

        showResultsInfo(App.lastResultsInfo);

        App.lastResults = filtered; // store results
        App.lastSearchResults = filtered; // keep copy for returning from favourites
        App.lastSearchState = {
          query: searchData.query,
          searchMode: searchData.searchMode,
          alcoholFilter: searchData.alcoholFilter,
        };
        App.renderResults(App.lastResults); // render results list

        // store search state into URL + browser history
        if (!App.isRestoring) {
          App.setUrlState(
            {
              query: searchData.query,
              searchMode: searchData.searchMode,
              alcoholFilter: searchData.alcoholFilter,
              viewMode: "search",
            },
            { replace: false }
          );
        }

        // keep DETAIL placeholder until user clicks on an item
        showDetailMessage("Select a cocktail from the results to see details.", "fa-wine-glass");
      } catch (err) {
        console.error(err);
        showResultsMessage("Failed to load results.", "fa-triangle-exclamation");
      } finally {
        setResultsLoading(false); // hide results spinner
      }
    });

    // RANDOM SEARCH
    randomBtn.addEventListener("click", async () => {
      try {
        // loading spinners in both panels
        setResultsLoading(true);
        setDetailLoading(true);

        // stays in search view
        App.viewMode = "search";
        App.updateFavouritesButton();

        // store current form state to URL
        const s = App.readFormsearchData();
        if (!App.isRestoring) {
          App.setUrlState(
            {
              query: s.query,
              searchMode: s.searchMode,
              alcoholFilter: s.alcoholFilter,
              viewMode: "search",
            },
            { replace: false }
          );
        }

        // API returns one random drink (one item in RESULTS)
        const data = await getRandomCocktail();
        const drink = data.drinks?.[0];

        if (!drink) {
          showDetailMessage("Random drink not found.", "fa-triangle-exclamation");
          return;
        }

        // apply current Type filter to random drink
        const { alcoholFilter } = App.readFormsearchData();
        const filtered = App.applyTypeFilter([drink], alcoholFilter);

        // placeholder if nothing is found
        if (filtered.length === 0) {
          showResultsMessage("No random drink matches the selected Type.", "fa-face-frown");
          showDetailMessage("Try changing the Type filter.", "fa-wine-glass");
          return;
        }

        App.lastResultsInfo = `Found ${filtered.length} drinks`;
        showResultsInfo(App.lastResultsInfo);


        // keep random drink as the only "results list" item
        App.lastResults = filtered;
        App.lastSearchResults = filtered; // treat random as "search result"
        App.lastSearchState = {
          query: s.query, // can be empty, but that's fine
          searchMode: s.searchMode,
          alcoholFilter: s.alcoholFilter,
        };
        App.renderResults(App.lastResults)
        renderDetail(filtered[0]);
      } catch (err) {
        console.error(err);
        showDetailMessage("Failed to load random drink.", "fa-triangle-exclamation");
      } finally {
        setResultsLoading(false);
        setDetailLoading(false);
      }
    });

    // FAVOURITES BUTTON: toggle Search view - Favourites view
    favouritesBtn.addEventListener("click", async () => {
      App.viewMode = App.viewMode === "favourites" ? "search" : "favourites";
      App.updateFavouritesButton();

      // store view mode in URL
      const s = App.readFormsearchData();
      if (!App.isRestoring) {
        App.setUrlState(
          {
            query: s.query,
            searchMode: s.searchMode,
            alcoholFilter: s.alcoholFilter,
            viewMode: App.viewMode,
          },
          { replace: false }
        );
      }

      // render results or favourites
      await App.renderCurrentView();
      App.updateResultsInfo();
    });


    // ---- URL STATE (on load) ----
    const urlState = App.getUrlState(); // read state from URL query params (q/mode/type/view)

    history.replaceState(urlState, "", window.location.href); // first history object has an entry too

    App.isRestoring = true; // pushing new history entries forbidden

    App.applyUrlStateToForm(urlState); // apply url state to controls

    // apply view mode and render correct view
    App.viewMode = urlState.viewMode;
    App.updateFavouritesButton();

    if (App.viewMode === "favourites") {
      App.renderCurrentView();
    } else if (urlState.query) {
      // triggers the same submit handler as normal user search
      form.requestSubmit();
    }

    App.isRestoring = false;

    // ---- BROWSER BACK/FORWARD ----
    window.addEventListener("popstate", (e) => {
      App.isRestoring = true; // restore  UI from history state

      const s = e.state || App.getUrlState();
      App.applyUrlStateToForm(s); // restore form inputs

      // restore view mode
      App.viewMode = s.viewMode;
      App.updateFavouritesButton();

      // re-render  based on restored state
      if (App.viewMode === "favourites") {
        App.renderCurrentView();
      } else if (s.query) {
        form.requestSubmit();
      } else {
        // empty state
        showResultsMessage("Search a drink to get a result", "fa-circle-question");
        showDetailMessage("Select a cocktail from the results to see details.", "fa-wine-glass");
      }

      App.isRestoring = false;
    });
  },

  // ---- FORM STATE ----
  // reads search input + radio values and returns them as one object
  readFormsearchData() {
    const query = (App.els.queryInput?.value || "").trim();
    const searchMode = document.querySelector("input[name=\"searchMode\"]:checked")?.value;
    const alcoholFilter = document.querySelector("input[name=\"alcoholFilter\"]:checked")?.value;
    return { query, searchMode, alcoholFilter };
  },

  // reads URL query params and converts them into a safe state object
  getUrlState() {
    const url = new URL(window.location.href);

    const query = (url.searchParams.get("q") || "").trim();
    const searchModeRaw = url.searchParams.get("mode") || "name";
    const alcoholFilterRaw = url.searchParams.get("type") || "all";
    const viewModeRaw = url.searchParams.get("view") || "search";

    // sanitize values (only allow known options)
    const searchMode = searchModeRaw === "ingredient" ? "ingredient" : "name";
    const alcoholFilter = ["all", "alc", "non-alc"].includes(alcoholFilterRaw) ? alcoholFilterRaw : "all";
    const viewMode = viewModeRaw === "favourites" ? "favourites" : "search";

    return { query, searchMode, alcoholFilter, viewMode };
  },

  // writes current app state into URL and browser history
  // using pushState so Back/Forward can restore the state
  setUrlState({ query, searchMode, alcoholFilter, viewMode }, { replace = false } = {}) {
    const url = new URL(window.location.href);

    // q: store only if not empty (otherwise remove from URL)
    if (query && query.trim()) url.searchParams.set("q", query.trim());
    else url.searchParams.delete("q");

    url.searchParams.set("mode", searchMode || "name");
    url.searchParams.set("type", alcoholFilter || "all");
    url.searchParams.set("view", viewMode || "search");

    // store the same snapshot into history.state (used in popstate)
    const stateObj = { query: query?.trim() || "", searchMode, alcoholFilter, viewMode };

    if (replace) history.replaceState(stateObj, "", url.toString());
    else history.pushState(stateObj, "", url.toString());
  },

  // updates the form controls based on a given state object
  applyUrlStateToForm(s) {
    const input = App.els.queryInput;
    if (input) input.value = s.query || "";

    // searchMode radios
    document.querySelectorAll('input[name="searchMode"]').forEach((r) => {
      r.checked = r.value === s.searchMode;
    });

    // type radios
    document.querySelectorAll('input[name="alcoholFilter"]').forEach((r) => {
      r.checked = r.value === s.alcoholFilter;
    });
  },

  // ---- FILTER ----
  // filters drinks by "alcoholic / non-alcoholic"
  applyTypeFilter(drinks, alcoholFilter) {
    if (!drinks || drinks.length === 0) return [];
    if (!alcoholFilter || alcoholFilter === "all") return drinks;

    // ingredient search returns simplified objects without strAlcoholic -> cannot filter reliably
    const hasAlcoholInfo = drinks.some((d) => typeof d.strAlcoholic === "string");
    if (!hasAlcoholInfo) return drinks;

    // normalize strings for safer comparison
    const norm = (s) => String(s).toLowerCase().replace(/[_\s-]+/g, "");

    if (alcoholFilter === "non-alc") {
      return drinks.filter((d) => norm(d.strAlcoholic) === "nonalcoholic");
    }

    if (alcoholFilter === "alc") {
      // treat everything that is not "Non alcoholic" as alcoholic (includes "Optional alcohol")
      return drinks.filter((d) => norm(d.strAlcoholic) !== "nonalcoholic");
    }

    return drinks;
  },

  // ---- RESULTS UI ----
  // renders list of result items into the Results panel
  renderResults(drinks) {
    const resultsEl = App.els.results;
    const sorted = App.getSortedResults(drinks);

    // remove centering used for placeholders/spinners
    resultsEl.classList.remove("d-flex", "flex-column", "align-items-center", "justify-content-center", "text-center");
    resultsEl.innerHTML = "";

    if (!sorted || sorted.length === 0) {
      showResultsMessage("No results found.", "fa-face-frown");
      return;
    }

    const list = document.createElement("div");
    list.className = "list-group";

    sorted.forEach((drink) => {
      list.appendChild(App.createResultItem(drink));
    });

    resultsEl.appendChild(list);
  },

  // creates one clickable result row (with favourite star button)
  createResultItem(drink) {
    const rowBtn = document.createElement("button");
    rowBtn.type = "button";
    rowBtn.className = "list-group-item list-group-item-action d-flex align-items-center gap-2";

    // star icon depends on whether the drink is in favourites
    const favIconClass = App.isFavourite(drink.idDrink) ? "fa-solid" : "fa-regular";

    rowBtn.innerHTML = `
      <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" width="48" height="48"
           class="object-fit-cover border rounded">
      <div class="flex-grow-1 text-start">
        <div class="fw-semibold">${drink.strDrink}</div>
        <div class="text-muted small">ID: ${drink.idDrink}</div>
      </div>

      <button type="button" class="btn btn-sm btn-link p-0 text-warning fav-btn" aria-label="Toggle favourite">
        <i class="${favIconClass} fa-star"></i>
      </button>
    `;

    // click handler for row:
    // - click on star toggles favourite
    // - click elsewhere loads detail
    rowBtn.addEventListener("click", async (e) => {
      const favBtn = e.target.closest(".fav-btn");

      if (favBtn) {
        e.stopPropagation(); // do not open detail when clicking star
        App.handleToggleFavourite(drink);

        // if we are in favourites view, update the list (removed item should disappear)
        if (App.viewMode === "favourites") {
          await App.showFavouritesView();
        }
        return;
      }

      // click outside star -> load full deta
      await App.loadAndRenderDetail(drink.idDrink);
    });

    return rowBtn;
  },

  async loadAndRenderDetail(idDrink) {
    try {
      setDetailLoading(true);

      const data = await lookupById(idDrink);
      const drink = data.drinks?.[0];

      if (!drink) {
        showDetailMessage("Drink detail not found.", "fa-triangle-exclamation");
        return;
      }

      App.renderDetailWithFav(drink);

      App.detailLang = "en";
      App.renderDetailWithFav(drink);


    } catch (err) {
      console.error(err);
      showDetailMessage("Failed to load detail.", "fa-triangle-exclamation");
    } finally {
      setDetailLoading(false);
    }
  },

  // ---- FAVOURITES ----
  // checks if a cocktail ID is stored in favourites
  isFavourite(idDrink) {
    const id = String(idDrink);
    return App.favourites.some((f) => f.idDrink === id);
  },


  // toggles favourite on/off and persists it to localStorage
  toggleFavourite(drinkOrId) {
    const id = String(drinkOrId?.idDrink ?? drinkOrId);

    const idx = App.favourites.findIndex((f) => f.idDrink === id);

    if (idx !== -1) {
      App.favourites.splice(idx, 1);
    } else {
      // when adding, store minimal data if available
      const toSave = {
        idDrink: id,
        strDrink: String(drinkOrId?.strDrink || ""),
        strDrinkThumb: String(drinkOrId?.strDrinkThumb || ""),
      };
      App.favourites.push(toSave);
    }

    saveFavourites(App.favourites);
    App.updateFavouritesButton();
    App.updateResultsInfo();
  },


  // renders either Search view or Favourites view based on current state
  async renderCurrentView() {
    if (App.viewMode === "favourites") {
      await App.showFavouritesView();
    } else {
      // in search view we show last results if they exist, otherwise placeholder
      if (App.lastSearchResults.length > 0) {
        App.lastResults = App.lastSearchResults; // restore previous search list
        App.renderResults(App.lastResults);

        if (App.lastResultsInfo) {
          showResultsInfo(App.lastResultsInfo);
        }
      } else {
        showResultsMessage("Search a drink to get a result", "fa-circle-question");
      }
      // detail is always reset to placeholder when switching views
      showDetailMessage("Select a cocktail from the results to see details.", "fa-wine-glass");
    }
    App.updateFavouritesButton();
  },

  // loads full drink objects for all favourites and renders them in Results panel
  async showFavouritesView() {
    if (!App.favourites.length) {
      showResultsMessage("No favourites yet.", "fa-star");
      showDetailMessage("Select a favourite to see details.", "fa-wine-glass");
      return;
    }

    try {
      setResultsLoading(true);

      // favourites store only IDs -> we fetch each full object by lookup endpoint
      const drinks = App.favourites.map((f) => ({
        idDrink: f.idDrink,
        strDrink: f.strDrink || `ID: ${f.idDrink}`,
        strDrinkThumb: f.strDrinkThumb || "",
      }));

      App.lastResults = drinks;
      App.renderResults(App.lastResults);
      showDetailMessage("Select a cocktail from the results to see details.", "fa-wine-glass");
    } catch (err) {
      console.error(err);
      showResultsMessage("Failed to load favourites.", "fa-triangle-exclamation");
    } finally {
      setResultsLoading(false);
    }
  },

  // visual feedback for favourites button (active when favourites view is selected)
  updateFavouritesButton() {
    const btn = App.els.favouritesBtn;
    if (!btn) return;

    const isFavView = App.viewMode === "favourites";
    btn.classList.toggle("is-active", isFavView);

    // switch icon style (solid vs regular)
    const icon = btn.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-solid", isFavView);
      icon.classList.toggle("fa-regular", !isFavView);
    }
  },

  updateResultsInfo() {
    if (App.viewMode === "favourites") {
      showResultsInfo(`Favourite drinks: ${App.favourites.length}`);
      return;
    }

    // search view
    if (App.lastResultsInfo) {
      showResultsInfo(App.lastResultsInfo);
    } else {
      clearResultsInfo();
    }
  },

  getSortedResults(drinks) {
    if (!Array.isArray(drinks)) return [];
    if (App.sortMode === "default") return drinks;

    const copy = [...drinks];
    copy.sort((a, b) => String(a.strDrink || "").localeCompare(String(b.strDrink || ""), undefined, { sensitivity: "base" }));

    if (App.sortMode === "za") copy.reverse();
    return copy;
  },

  mountSortControl() {
    const infoEl = document.getElementById("resultsInfo");
    if (!infoEl) return;

    const parent = infoEl.parentElement;
    if (!parent) return;

    if (parent.querySelector(".sort-select")) return;

    const wrap = document.createElement("div");
    wrap.className = "d-flex align-items-center gap-2 ms-auto";

    const label = document.createElement("span");
    label.className = "small text-muted";
    label.textContent = "Sort:";

    const select = document.createElement("select");
    select.className = "form-select form-select-sm w-auto sort-select";
    select.innerHTML = `
    <option value="default">Default</option>
    <option value="az">A–Z</option>
    <option value="za">Z–A</option>
  `;

    select.value = App.sortMode;

    select.addEventListener("change", () => {
      App.sortMode = select.value;

      if (App.viewMode === "search" || App.viewMode === "favourites") {
        App.renderResults(App.lastResults);
      }
    });

    wrap.appendChild(label);
    wrap.appendChild(select);

    parent.appendChild(wrap);
  },

  handleToggleFavourite(idDrink, drinkForDetail = null) {
    App.toggleFavourite(idDrink);

    if (App.lastResults?.length) {
      App.renderResults(App.lastResults);
    }

    if (drinkForDetail) {
      App.renderDetailWithFav(drinkForDetail);
    }
  },

  renderDetailWithFav(drink) {
    renderDetail(drink, {
      isFavourite: App.isFavourite,
      onToggleFavourite: (id) => App.handleToggleFavourite(id, drink),

      lang: App.detailLang,
      onChangeLang: (lang) => {
        App.detailLang = lang;
        App.renderDetailWithFav(drink); // jen re-render detailu, žádné API
      },
    });
  },


};

// start the app after module is loaded
App.init();
