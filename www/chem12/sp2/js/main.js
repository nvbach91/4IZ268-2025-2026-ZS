import { showToast } from './utils.js';
import * as API from './api.js';
import * as State from './state.js';
import * as View from './views.js';



export const $elements = {
    app: $('#app'),
    navSearch: $('#nav-search'),
    navBacklog: $('#nav-backlog'),
    toastContainer: $('#toast-container'),
};


// tlacitko na carte pridat odebrat ve vyhledavani 

const handleQuickToggle = (game) => {
    // Zjistíme, jestli už hru máme
    if (State.isInBacklog(game.id)) {
        State.removeFromBacklog(game.id);
        showToast(`Hra "${game.name}" odebrána.`, 'info');
    } else {
        State.addToBacklog(game);
        showToast(`Hra "${game.name}" přidána!`, 'success');
    }
    
    
    View.updateNavCounter(State.getBacklog().length);

const lastSearch = State.getLastSearch();
    if (lastSearch.results.length > 0) {
        View.renderGameGrid( lastSearch.results, $('#game-results'), false, loadGameDetail, State.isInBacklog, handleQuickToggle);
    }
};


//                                                  SEARCHING GAMES

/// hledani v search inputu 
const handleSearch = async () => {
    const query = $('#search-input').val().trim();
    const $resultsContainer = $('#game-results');

    const selectedGenre = $('#filter-genre').val();    
    const selectedPlatform = $('#filter-platform').val();

    const filters = {
        genre: selectedGenre,
        platforms: selectedPlatform
    };

    const isFilterActive = selectedGenre || selectedPlatform;


    if (query.length < 2 && !isFilterActive) {
        showToast('Zadejte alespoň 2 znaky.', 'error');
        return;
    }

    if (/[<>]/.test(query)) {
        showToast('Vstup obsahuje nepovolené znaky.', 'error');
        return;
    }

    View.renderLoader($resultsContainer);

    try {
        const response = await API.fetchGames(query, filters);


View.renderGameGrid( response.results, $('#game-results'), false, loadGameDetail, (id) => State.isInBacklog(id), handleQuickToggle );

        // ulozeni posledniho hledani do stavu
        State.setLastSearch(query, response.results);



        //callback pro view.js 
        View.renderGameGrid(response.results, $resultsContainer, false, loadGameDetail, State.isInBacklog, handleQuickToggle);
    } catch (error) {
        console.error('API Error:', error);
        $resultsContainer.html('<p class="error">Chyba při komunikaci se serverem.</p>');
        showToast('Chyba při stahování dat.', 'error');
    }
};



//filtry 
let loadedGenres = [];
let loadedPlatforms = [];





//                                                  GENEROVANI DETAILNIHO OKNA HRY 

// dotaz na server na potrebne data 
const loadGameDetail = async (gameId) => {
    
    View.renderLoader($elements.app);

    try {
        const gameData = await API.fetchGameDetail(gameId);
        renderDetail(gameData);
    } catch (error) {
        console.error(error);
        showToast('Detail hry se nepodařilo načíst.', 'error');
        router('search');
    }
};


//  generovani okna a nastaveni funkci pro tlacitka
const renderDetail = (gameData) => {
    
    const isSaved = State.isInBacklog(gameData.id);

    // funkce pro  tlacitko Back
    const onBack = () => router(State.getCurrentView());

    // funkce pro tlacitko Přidat/Odebrat
    const onToggle = () => {
        if (isSaved) {
            State.removeFromBacklog(gameData.id);
            showToast('Hra byla odebrána.', 'info');
        } else {
            State.addToBacklog(gameData);
            showToast('Hra byla přidána do backlogu.', 'success');
        }

        //  UI prekres tlacitka s poctem hr a obnovit okno detailu 
        View.updateNavCounter(State.getBacklog().length);
        renderDetail(gameData);
    };
    // generovani samotneho okna s detaily hry 
    View.renderDetailHTML(gameData, $elements.app, isSaved, onBack, onToggle);
};


//                                                       ROUTER - prekresleni divu app podle navigace 

const router = (viewName) => {
    State.setCurrentView(viewName);
    View.updateNavState(viewName);

   

    if (viewName === 'search') {
        const lastSearch = State.getLastSearch();
        View.renderSearchView($elements.app, lastSearch.query, lastSearch.results, loadedGenres, loadedPlatforms, handleSearch, loadGameDetail, State.isInBacklog, handleQuickToggle);

        // listenery na talcitka v search view
        $('#btn-search').on('click', handleSearch);
        $('#search-input').on('keypress', (e) => {
            if (e.which === 13) handleSearch();
        });
        $('#filter-genre').on('change', handleSearch);
        $('#filter-platform').on('change', handleSearch);

    } else if (viewName === 'backlog') {
        // Získáme data ze State a pošleme je do View
        // Předáme také funkci loadGameDetail, aby fungovalo klikání na karty
        View.renderBacklogView($elements.app, State.getBacklog(), loadGameDetail);
    }
};

//                                      INICIALIZACE             

const init = async() => {
    console.log('App: Initializing modules...');

    // Načtení dat
    State.initStorage();
    View.updateNavCounter(State.getBacklog().length);


try {
        // Použijeme Promise.all, aby se stáhly oba seznamy najednou (rychlejší)
        const [genresData, platformsData] = await Promise.all([
            API.fetchGenres(),
            API.fetchPlatforms()
        ]);
        
        loadedGenres = genresData.results;
        loadedPlatforms = platformsData.results;
        console.log('Filtry načteny:', loadedGenres.length, 'žánrů');
    } catch (error) {
        console.error('Chyba při načítání filtrů:', error);
        showToast('Nepodařilo se načíst filtry.', 'error');
    }


    // Navigace
    $('#nav-search').on('click', () => router('search'));
    $('#nav-backlog').on('click', () => router('backlog'));

    // Start
    router('search');
};

// Spuštění
$(document).ready(init);