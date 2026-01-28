import { showToast } from './utils.js';
import * as API from './api.js';
import * as State from './state.js';
import * as View from './views.js';







//                                                  SEARCHING GAMES

/// hledani v search inputu 
const handleSearch = async () => {
    const query = $('#search-input').val().trim();
    const $resultsContainer = $('#game-results');

    if (query.length < 2) {
        showToast('Zadejte alespoň 2 znaky.', 'error');
        return;
    }

    if (/[<>]/.test(query)) {
        showToast('Vstup obsahuje nepovolené znaky.', 'error');
        return;
    }

    View.renderLoader($resultsContainer);

    try {
        const response = await API.fetchGames(query);
        //callback pro view.js 
        View.renderGameGrid(response.results, $resultsContainer, false, loadGameDetail);
    } catch (error) {
        console.error('API Error:', error);
        $resultsContainer.html('<p class="error">Chyba při komunikaci se serverem.</p>');
        showToast('Chyba při stahování dat.', 'error');
    }
};








//                                                  GENEROVANI DETAILNIHO OKNA HRY 

// dotaz na server na potrebne data 
const loadGameDetail = async (gameId) => {
    const $container = $('#app');
    View.renderLoader($container);

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
    const $container = $('#app');
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
    View.renderDetailHTML(gameData, $container, isSaved, onBack, onToggle);
};







//                                                       ROUTER - prekresleni divu app podle navigace 

const router = (viewName) => {
    State.setCurrentView(viewName);
    View.updateNavState(viewName);

    const $appContainer = $('#app');

    if (viewName === 'search') {
        View.renderSearchView($appContainer);

        // listenery na talcitka v search view
        $('#btn-search').on('click', handleSearch);
        $('#search-input').on('keypress', (e) => {
            if (e.which === 13) handleSearch();
        });

    } else if (viewName === 'backlog') {
        // Získáme data ze State a pošleme je do View
        // Předáme také funkci loadGameDetail, aby fungovalo klikání na karty
        View.renderBacklogView($appContainer, State.getBacklog(), loadGameDetail);
    }
};

//                                      INICIALIZACE             

const init = () => {
    console.log('App: Initializing modules...');

    // Načtení dat
    State.initStorage();
    View.updateNavCounter(State.getBacklog().length);

    // Navigace
    $('#nav-search').on('click', () => router('search'));
    $('#nav-backlog').on('click', () => router('backlog'));

    // Start
    router('search');
};

// Spuštění
$(document).ready(init);