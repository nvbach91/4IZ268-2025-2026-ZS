// Cocktail Explorer - Semestrální práce SP2 - 4IT218 Webové technologie
// autor: Adam Švarc 

// Konstanta pro databázi drinků
const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1/';

// Ukládání stavu aplikace do LocalStorage 
const state = {
    favorites: JSON.parse(localStorage.getItem('cocktail_favorites')) || [],
    currentView: 'home',
    cache: new Map(),
    removedFromFavorites: [],
    collectionFilter: 'all',
    collectionSort: 'a-z'
};

// HTML elementy pro manipulaci, volají se až po renderu
const DOM = {};

const initDOM = () => {
    DOM.app = document.getElementById('app');
};

// Vyčištění a spojení ingrediencí (a jejich množství) z API do jednoho pole
const formatIngredients = (drink) => {
    let ingredients = [];
    // API mi vrací ingredience v 15 samostatných polích, proto používám cyklus
    for (let i = 1; i <= 15; i++) {
        const ingredient = drink[`strIngredient${i}`];
        const measure = drink[`strMeasure${i}`];
        // Pokud ingredience existuje, spojím ji s množstvím a přidám
        if (ingredient) {
            ingredients.push(`${measure ? measure : ''} ${ingredient}`.trim());
        }
    }
    return ingredients;
};

// Uložení akuálálního seznamu oblíbených drinků do LocalStorage
const saveFavorites = () => {
    // Převádí pole na JSON pro uložení
    localStorage.setItem('cocktail_favorites', JSON.stringify(state.favorites));
};

// Přidá nebo odebere drink z oblíbených
const toggleFavorite = (id, event) => {
    if (event) event.stopPropagation();

    // Odebrání drinku, pokud už je v oblíbených
    if (state.favorites.includes(id)) {
        // Filtrace seznamu, tak aby zůstalo vše kromě ID
        state.favorites = state.favorites.filter(fav => fav !== id);
        if (state.currentView === 'favorites' && !state.removedFromFavorites.includes(id)) {
            state.removedFromFavorites.push(id);
        }
    } else {
        // Přidání drinku do oblíbených, pokud tam není
        state.favorites.push(id);
        state.removedFromFavorites = state.removedFromFavorites.filter(fav => fav !== id);
    }
    // Aktualizuje seznam v LocalStorage
    saveFavorites();
    // Překreslí UI - změní srdíčko
    render();
};

// Kontrola jestli je drink v oblíbených
const isFavorite = (id) => state.favorites.includes(id);

// Main funkce pro stahování dat
// async -> fce běží asynchronně, await -> počká na výsledek (odpověď serveru)
const fetchApi = async (endpoint) => {
    // Kontrola cache - pokud už mám data v cache, vrátím je
    if (state.cache.has(endpoint)) {
        return state.cache.get(endpoint);
    }

    // Stažení dat
    try {
        const res = await fetch(`${API_BASE}${endpoint}`);
        // Převod odpovědi na JSON
        const data = await res.json();
        // Uložení do cache
        state.cache.set(endpoint, data);
        return data;
    } catch (error) {
        // Pokud nastane chyba, vypíše ji do konzole
        console.error("API Error:", error);
        return null;
    }
};

// Funkce pro vyhledávání drinků podle názvu
const searchCocktails = async (query) => {
    const data = await fetchApi(`search.php?s=${query}`);
    // Pokud data dorazila, vrátím seznam drinků, jinak vrátím prázdné pole
    return data ? data.drinks : [];
};

// Funkce pro získání detailů drinku podle ID
const getCocktailById = async (id) => {
    const data = await fetchApi(`lookup.php?i=${id}`);
    // Pokud data dorazila, vrátím první drink, jinak vrátím null
    return data && data.drinks ? data.drinks[0] : null;
};

// Funkce pro zpracování vyhledávání
const handleSearch = async (query) => {
    // Uložení posledního vyhledávacího dotazu do stavu
    state.lastSearchInput = query;
    if (!query.trim()) {
        state.searchResults = null; // Vymažu výsledky
        window.location.hash = '';  // Vrátím se na homepage
        render();                   // Překreslím web
        return;                     // Konec funkce
    }

    // Pokud uživatel hledá, vymažu hash pro návrat na homepage s výsledky
    if (window.location.hash !== '') {
        window.location.hash = '';
    }

    // Volání API pro vyhledání drinků
    const drinks = await searchCocktails(query);
    // Uložení výsledků do stavu appky
    state.searchResults = drinks;
    // Vykreslí obrazovku
    render();
};

// Pomocné funkce pro hledání
const handleSearchClick = () => {
    // Získání hodnoty z vyhledávacího pole
    const searchInput = document.getElementById('search-input');
    // Pokud pole existuje, zavolám hledání
    if (searchInput) {
        handleSearch(searchInput.value);
    }
};

// Hledání po stisku Enter
const handleSearchKeydown = (event) => {
    if (event.key === 'Enter') {
        handleSearch(event.target.value);
    }
};

// Navigační funkce
const navigateHome = () => {
    window.location.hash = '';
};

// Navigace na oblíbené drinky
const navigateFavorites = () => {
    window.location.hash = 'favorites';
};

// Navigace na detail drinku
const navigateToDetail = (id) => {
    window.location.hash = `details/${id}`;
};

// Navigace zpět v historii
const goBack = () => {
    history.back();
};

// Funkce pro filtrování a řazení v oblíbených
const handleFilterChange = (event) => {
    state.collectionFilter = event.target.value;
    render();
};

// Přepínání řazení A-Z v oblíbených
const handleSortToggle = () => {
    state.collectionSort = state.collectionSort === 'a-z' ? 'z-a' : 'a-z';
    render();
};

// UI komponenty

// Header
const Header = () => `
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
        <div class="max-w-4xl mx-auto px-4 flex justify-between items-center">
            <h1 id="home-title" class="text-xl font-bold tracking-tight cursor-pointer hover:opacity-70 transition-opacity">
                Cocktail Explorer
            </h1>
            <div class="flex items-center gap-4">
                <div class="relative group flex items-center gap-2">
                    <div class="relative">
                        <input type="text" 
                            id="search-input"
                            placeholder="Search..." 
                            class="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all w-48 placeholder-gray-400 text-gray-800"
                        >
                        <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                    </div>
                    <button id="search-btn" class="px-3 py-2 bg-gray-900 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors">
                        Search
                    </button>
                </div>
                <button id="favorites-btn" class="text-gray-400 hover:text-red-500 transition-colors ${state.currentView === 'favorites' ? 'text-red-500' : ''}">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
        </div>
    </header>
`;

// Karta drinku
const CocktailCard = (drink) => `
    <div class="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-fade-in" data-drink-id="${drink.idDrink}">
        <div class="aspect-square overflow-hidden rounded-lg bg-gray-50 mb-4 relative">
            <img src="${drink.strDrinkThumb}/preview" alt="${drink.strDrink}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <button class="favorite-btn absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors" data-drink-id="${drink.idDrink}">
                <i class="${isFavorite(drink.idDrink) ? 'fa-solid text-red-500' : 'fa-regular text-gray-400'} fa-heart text-sm"></i>
            </button>
        </div>
        <h3 class="font-medium text-gray-900 truncate">${drink.strDrink}</h3>
        <p class="text-xs text-gray-500 mt-1">${drink.strCategory}</p>
    </div>
`;

// Detail drinku
const DetailView = (drink) => {
    const ingredients = formatIngredients(drink);

    return `
    <div class="animate-fade-in max-w-4xl mx-auto px-4 pb-12">
        <button id="back-btn" class="mb-6 text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back
        </button>
        
        <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div class="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 shadow-sm relative">
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="w-full h-full object-cover">
                 <button class="favorite-btn absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors" data-drink-id="${drink.idDrink}">
                    <i class="${isFavorite(drink.idDrink) ? 'fa-solid text-red-500' : 'fa-regular text-gray-400'} fa-heart text-lg"></i>
                </button>
            </div>
            
            <div class="pt-2">
                <span class="inline-block px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600 mb-4 tracking-wide">${drink.strCategory} • ${drink.strAlcoholic}</span>
                <h1 class="text-4xl font-light tracking-tight text-gray-900 mb-6">${drink.strDrink}</h1>
                
                <div class="space-y-8">
                    <div>
                        <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Ingredients</h3>
                        <ul class="space-y-2">
                            ${ingredients.map(ing => `
                                <li class="flex items-center gap-3 text-gray-700">
                                    <span class="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                    ${ing}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">Instructions</h3>
                        <p class="text-gray-600 leading-relaxed font-light">${drink.strInstructions}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
};

// Prázdný stav - homepage
const EmptyState = (message = "Start your search to find the perfect cocktail.") => `
    <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
            <i class="fa-solid fa-martini-glass-citrus text-2xl"></i>
        </div>
        <p class="text-gray-500 font-light max-w-md mx-auto">${message}</p>
    </div>
`;

// Statistika v oblíbených
const CollectionStats = (drinks) => {
    // Celkový počet drinků
    const totalCount = drinks.length;
    // Počet unikátních kategorií
    const categories = [...new Set(drinks.map(d => d.strCategory))].length;
    // Průměrný počet ingrediencí na drink
    const avgIngredients = Math.round(drinks.reduce((sum, drink) => {
        let count = 0;
        for (let i = 1; i <= 15; i++) {
            if (drink[`strIngredient${i}`]) count++;
        }
        return sum + count;
    }, 0) / drinks.length) || 0;

    // Vykreslení statistik
    return `
        <div class="grid grid-cols-3 gap-4 mb-6 px-4">
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-gray-900">${totalCount}</p>
                <p class="text-xs text-gray-500">Total Favorites</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-gray-900">${categories}</p>
                <p class="text-xs text-gray-500">Categories</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-4 text-center">
                <p class="text-2xl font-bold text-gray-900">${avgIngredients}</p>
                <p class="text-xs text-gray-500">Avg. Ingredients</p>
            </div>
        </div>
    `;
};

// Prvky pro filtraci a řazení v oblíbených
const CollectionControls = (drinks) => {
    // Získání unikátních kategorií - abecedně seřazené
    const categories = [...new Set(drinks.map(d => d.strCategory))].sort();
    // Vytvoření HTML pro možnost výběru kategorií
    const categoryOptions = categories.map(cat =>
        `<option value="${cat}" ${state.collectionFilter === cat ? 'selected' : ''}>${cat}</option>`
    ).join('');

    // Vykreslení prvků
    return `
        <div class="flex items-center justify-between mb-6 px-4">
            <div class="flex items-center gap-2">
                <label for="filter-type" class="text-sm text-gray-500">Filter:</label>
                <select id="filter-type" class="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black">
                    <option value="all" ${state.collectionFilter === 'all' ? 'selected' : ''}>All</option>
                    ${categoryOptions}
                </select>
            </div>
            <button id="sort-toggle" class="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm hover:bg-gray-100 transition-colors">
                <i class="fa-solid fa-arrow-${state.collectionSort === 'a-z' ? 'down' : 'up'}-a-z"></i>
                ${state.collectionSort === 'a-z' ? 'A-Z' : 'Z-A'}
            </button>
        </div>
    `;
};

// Hlavní renderovací funkce TODO
const render = async () => {
    const hash = window.location.hash;

    // Header
    let content = Header();

    content += `<main class="mx-auto max-w-5xl">`;

    // Rozcestník podle hash v URL
    if (!hash || hash === '#') {
        // Homepage 
        state.currentView = 'home';
        state.removedFromFavorites = [];
        if (state.searchResults) {
            // Pokud mám výsledky hledání, vykreslím mřížku s kartami drinků
            content += `
                <div class="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
                    ${state.searchResults.map(CocktailCard).join('')}
                </div>
            `;
        } else {
            // Zobrazím prázdný stav
            content += EmptyState();
        }

    } else if (hash.startsWith('#details/')) {
        // Detail drinku
        state.currentView = 'details';
        state.removedFromFavorites = [];
        const id = hash.split('/')[1]; // Získání ID z konce URL
        const drink = await getCocktailById(id); // stažení detailů drinku
        if (drink) {
            content += DetailView(drink);
        } else {
            content += EmptyState("Cocktail not found.");
        }
    } else if (hash === '#favorites') {
        // Oblíbené drinky
        state.currentView = 'favorites';
        const displayIds = [...new Set([...state.favorites, ...state.removedFromFavorites])];

        // Prázdný stav
        if (displayIds.length === 0) {
            content += EmptyState("You haven't saved any cocktails yet.");        
        } else {
            content += `<div class="p-6"><h2 class="text-2xl font-light mb-8 text-center">Your Collection</h2>`;

            // Stažení dat pro všechny oblíbené drinky
            let favDrinks = [];
            for (const id of displayIds) {
                const drink = await getCocktailById(id);
                if (drink) favDrinks.push(drink);
            }

            // Vložení statistik a ovládacích prvků
            content += CollectionStats(favDrinks);
            content += CollectionControls(favDrinks);

            // Logika filtrování podle kategorie
            let filteredDrinks = favDrinks;
            if (state.collectionFilter !== 'all') {
                filteredDrinks = favDrinks.filter(d => d.strCategory === state.collectionFilter);
            }

            // Logika řazení abecedně
            filteredDrinks.sort((a, b) => {
                if (state.collectionSort === 'a-z') {
                    return a.strDrink.localeCompare(b.strDrink);
                } else {
                    return b.strDrink.localeCompare(a.strDrink);
                }
            });

            content += `<div class="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">`;
            content += filteredDrinks.map(CocktailCard).join('');
            content += `</div></div>`;
        }
    }

    content += `</main>`;

    // Footer
    content += `
        <footer class="mt-20 py-8 text-center text-xs text-gray-300 border-t border-gray-50">
            <p>&copy; 2025 Cocktail Explorer</p>
        </footer>
    `;

    // Vložení obsahu do hlavního elementu
    DOM.app.innerHTML = content;

    // Čistka a obnovení hodnoty vyhledávacího pole
    const searchInput = document.getElementById('search-input');
    if (searchInput && state.lastSearchInput) {
        searchInput.value = state.lastSearchInput;
        searchInput.focus();
    }

    attachEventListeners();
};

// Připojení interakcí k DOM elementům -> Odstranění inline javascriptu
const attachEventListeners = () => {
    // Získání referencí na prvky
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    const favoritesBtn = document.getElementById('favorites-btn');
    const homeTitle = document.getElementById('home-title');
    const backBtn = document.getElementById('back-btn');
    const filterType = document.getElementById('filter-type');
    const sortToggle = document.getElementById('sort-toggle');

    if (searchInput) {
        searchInput.addEventListener('keydown', handleSearchKeydown);
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearchClick);
    }

    if (favoritesBtn) {
        favoritesBtn.addEventListener('click', navigateFavorites);
    }

    if (homeTitle) {
        homeTitle.addEventListener('click', navigateHome);
    }

    if (backBtn) {
        backBtn.addEventListener('click', goBack);
    }

    // Filtrace a řazení v oblíbených
    if (filterType) {
        filterType.addEventListener('change', handleFilterChange);
    }

    if (sortToggle) {
        sortToggle.addEventListener('click', handleSortToggle);
    }

    // Připojení srdíčka na každou kartu drinku
    const favoriteButtons = document.querySelectorAll('.favorite-btn');
    favoriteButtons.forEach(btn => {
        btn.addEventListener('click', (event) => {
            event.stopPropagation(); // Zabrání prokliknutí se na detail
            const drinkId = btn.dataset.drinkId; // Získání ID drinku
            toggleFavorite(drinkId, event);
        });
    });

    // Připojení kliknutí na kartu pro navigaci na detail
    const drinkCards = document.querySelectorAll('[data-drink-id]:not(.favorite-btn)');
    drinkCards.forEach(card => {
        card.addEventListener('click', () => {
            const drinkId = card.dataset.drinkId;
            navigateToDetail(drinkId);
        });
    });
};

// Inicializace aplikace

// Spustí fcy render když se mi strána poprvé načte nebo když se změní hash v URL
window.addEventListener('hashchange', render);
window.addEventListener('DOMContentLoaded', () => {
    initDOM();
    render();
});