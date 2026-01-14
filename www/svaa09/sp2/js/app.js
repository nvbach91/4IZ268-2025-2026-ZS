// Cocktail Explorer - Semestrální práce SP2 - 4IT218 Webové technologie
// autor: Adam Švarc 

// Konstanta pro databázi drinků
const API_BASE = 'https://www.thecocktaildb.com/api/json/v1/1/';

// HTML elementy pro manipulaci, volají se až po renderu
const DOM = {
    app: document.getElementById('app'),
    searchInput: document.getElementById('search-input'),
    searchIcon: document.getElementById('search-icon'),
    favoritesBtn: document.getElementById('favorites-btn'),
    homeBtn: document.getElementById('home-btn')
};

// Ukládání stavu aplikace do LocalStorage 
const state = {
    favorites: JSON.parse(localStorage.getItem('cocktail_favorites')) || [],
    currentView: 'home',
    cache: new Map()
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
    } else {
        // Přidání drinku do oblíbených, pokud tam není
        state.favorites.push(id);
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

// UI komponenty
const Header = () => `
    <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 py-4 mb-8">
        <div class="max-w-4xl mx-auto px-4 flex justify-between items-center">
            <h1 class="text-xl font-bold tracking-tight cursor-pointer hover:opacity-70 transition-opacity" onclick="window.location.hash=''">
                Cocktail Explorer
            </h1>
            <div class="flex items-center gap-4">
                <div class="relative group">
                    <input type="text" 
                        id="search-input"
                        placeholder="Search..." 
                        class="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-black transition-all w-48 placeholder-gray-400 text-gray-800"
                        onkeydown="if(event.key === 'Enter') handleSearch(this.value)"
                    >
                    <i class="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
                </div>
                <button onclick="window.location.hash='favorites'" class="text-gray-400 hover:text-red-500 transition-colors ${state.currentView === 'favorites' ? 'text-red-500' : ''}">
                    <i class="fa-solid fa-heart"></i>
                </button>
            </div>
        </div>
    </header>
`;

const CocktailCard = (drink) => `
    <div class="group bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all cursor-pointer animate-fade-in" onclick="window.location.hash='details/${drink.idDrink}'">
        <div class="aspect-square overflow-hidden rounded-lg bg-gray-50 mb-4 relative">
            <img src="${drink.strDrinkThumb}/preview" alt="${drink.strDrink}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy">
            <button onclick="toggleFavorite('${drink.idDrink}', event)" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-sm flex items-center justify-center hover:bg-white transition-colors">
                <i class="${isFavorite(drink.idDrink) ? 'fa-solid text-red-500' : 'fa-regular text-gray-400'} fa-heart text-sm"></i>
            </button>
        </div>
        <h3 class="font-medium text-gray-900 truncate">${drink.strDrink}</h3>
        <p class="text-xs text-gray-500 mt-1">${drink.strCategory}</p>
    </div>
`;

const DetailView = (drink) => {
    const ingredients = formatIngredients(drink);

    return `
    <div class="animate-fade-in max-w-4xl mx-auto px-4 pb-12">
        <button onclick="history.back()" class="mb-6 text-sm text-gray-500 hover:text-black transition-colors flex items-center gap-2">
            <i class="fa-solid fa-arrow-left"></i> Back
        </button>
        
        <div class="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
            <div class="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 shadow-sm relative">
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}" class="w-full h-full object-cover">
                 <button onclick="toggleFavorite('${drink.idDrink}', event)" class="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors">
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

const EmptyState = (message = "Start your search to find the perfect cocktail.") => `
    <div class="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div class="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4 text-gray-300">
            <i class="fa-solid fa-martini-glass-citrus text-2xl"></i>
        </div>
        <p class="text-gray-500 font-light max-w-md mx-auto">${message}</p>
    </div>
`;

// Proměnná pro uložení naposledy stažených dat
let currentRenderData = null;

// Hlavní renderovací funkce
const render = async () => {
    const app = document.getElementById('app');
    const hash = window.location.hash;

    // Header
    let content = Header();

    content += `<main class="mx-auto max-w-5xl">`;

    // Rozcestník podle hash v URL
    if (!hash || hash === '#') {
        // Homepage 
        state.currentView = 'home';
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
        if (state.favorites.length === 0) {
            content += EmptyState("You haven't saved any cocktails yet.");
        } else {
            content += `<div class="p-6"><h2 class="text-2xl font-light mb-8 text-center">Your Collection</h2>`;
            content += `<div class="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">`;

            // Stažení detailů vykreslení karty
            const favDrinks = [];
            for (const id of state.favorites) {
                const drink = await getCocktailById(id);
                if (drink) favDrinks.push(drink);
            }

            content += favDrinks.map(CocktailCard).join('');
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
    app.innerHTML = content;

    // Čistka a obnovení hodnoty vyhledávacího pole
    const searchInput = document.getElementById('search-input');
    if (searchInput && state.lastSearchInput) {
        searchInput.value = state.lastSearchInput;
        searchInput.focus();
    }
};

// Funkce pro zpracování vyhledávání
window.handleSearch = async (query) => {
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
    // Vykraslí obrazovku
    render();
};

// Inicializace aplikace

// Spustí fcy render když se mi strána poprvé načte nebo když se změní hash v URL
window.addEventListener('hashchange', render);
window.addEventListener('load', render);
