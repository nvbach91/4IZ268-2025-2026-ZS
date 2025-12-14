const App = {};

App.API_KEY = '4b5688b310c74e3b8923ae84df6178a8';
App.BASE_API_URL = 'https://api.rawg.io/api/games';
App.LOCAL_STORAGE_KEY = 'myGames';

const searchResults = $('#search-results');
const libraryList = $('#library-list');
const searchInput = $('#search-input');
const spinner = $('#loading-spinner');
const sectionSearch = $('#section-search');
const sectionLibrary = $('#section-library');
const navSearch = $('#nav-search');
const navLibrary = $('#nav-library');

App.fetchGames = async (query) => {
    return $.ajax({
        url: `${App.BASE_API_URL}?key=${App.API_KEY}&search=${query}&page_size=15`,
        method: 'GET'
    });
};

App.displaySearchResults = (games) => {
    searchResults.empty();

    if (!games || games.length === 0) {
        searchResults.html(`
            <div class="empty-state">
                <i class="fa-solid fa-ghost"></i><br>
                Taková hra tu není. Zkuste to znovu!
            </div>
        `);
        return;
    }

    const gamesList = [];

    $.each(games, function (i, game) {
        const image = game.background_image;

        const gameItem = $(`
            <div class="game-card">
                <img src="${image}">
                <div class="game-overlay">
                <h3 class="game-title"></h3> <span class="click-hint">Klikni pro přidání</span>
                </div>
            </div>`);

        gameItem.attr('data-id', game.id);
        gameItem.attr('data-name', game.name);

        gameItem.find('.game-title').text(game.name);

        gamesList.push(gameItem);
    });

    searchResults.append(gamesList);
};

App.renderLibrary = () => {
    //TODO
};

App.getLibraryData = () => {
    //TODO
};

App.addToLibrary = (gameObj) => {
    //TODO
};

App.removeFromLibrary = (id) => {
    //TODO
};

App.handleGameClick = (gameData) => {
    //TODO
};

App.init = () => {

    $('#search-btn').click(async (e) => {
        e.preventDefault();
        const query = searchInput.val();

        if (query.trim()) {
            searchResults.empty();
            spinner.show();

            try {
                const data = await App.fetchGames(query);
                App.displaySearchResults(data.results);
            } catch (err) {
                console.error(err);
                searchResults.html('<p class="error-msg">Chyba při vyhledávání.</p>');
            } finally {
                spinner.hide();
            }
        }
    });

    navSearch.click(function () {
        sectionSearch.show();
        sectionLibrary.addClass('hidden');
        $(this).addClass('active');
        navLibrary.removeClass('active');
    });

    navLibrary.click(function () {
        sectionSearch.hide();
        sectionLibrary.removeClass('hidden');
        $(this).addClass('active');
        navSearch.removeClass('active');
        App.renderLibrary();
    });
};

$(document).ready(() => {
    App.init();
});