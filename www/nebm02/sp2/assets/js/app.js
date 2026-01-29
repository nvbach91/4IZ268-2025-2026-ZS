const App = {};

App.API_KEY = '4b5688b310c74e3b8923ae84df6178a8';
App.BASE_API_URL = 'https://api.rawg.io/api/games';
App.LOCAL_STORAGE_KEY = 'myGames';

//Main selectors
const htmlBody = $('html, body');
const searchResults = $('#search-results');
const libraryList = $('#library-list');
const searchInput = $('#search-input');
const searchOrdering = $('#search-ordering');
const spinner = $('#loading-spinner');
const tagCheckboxes = $('.tag-checkbox input');
const searchBtn = $('#search-btn');
const platformInputs = $('#filter-platforms input');
const genreInputs = $('#filter-genres input');
const libraryCountSubtitle = $('#library-count');
const paginationNumbers = $('#pagination-numbers');
const libraryFilterStatus = $('#lib-filter-status');
const librarySortOrder = $('#lib-sort-order');

//Navigation selectors
const navSearch = $('#nav-search');
const navLibrary = $('#nav-library');
const sectionSearch = $('#section-search');
const sectionLibrary = $('#section-library');

//Pagination selectors
const pagination = $('#pagination-controls');
const pagination_prev = $('#prev-page');
const pagination_next = $('#next-page');
const pagination_text = $('#current-page-display');

// Modal selectors
const modal = $('#game-modal');
const modalForm = $('#modal-form');
const modalTitle = $('#modal-title');
const modalImg = $('#modal-img');
const modalDescription = $('#modal-description');
const modalPlatforms = $('#modal-platforms');
const modalReleased = $('#modal-released');
const modalMetacritic = $('#modal-metacritic');
const modalStatus = $('#modal-status');
const modalRating = $('#modal-rating');
const modalDate = $('#modal-date');
const modalNote = $('#modal-note');
const modalDeleteBtn = $('#btn-delete-modal');
const modalGameId = $('#modal-game-id');
const modalGameName = $('#modal-game-name');
const modalGameImg = $('#modal-game-img');
const modalBtnDelete = $('#btn-delete-modal');
const modalBtnCancel = $('#btn-cancel-modal');
const modalCloseButton = $('#close-modal');


App.searchState = {
    searchedGame: '',
    platform: '',
    genre: '',
    ordering: '',
    page: 1,
    page_size: 10
};


App.libraryState = {
    status: 'all',
    sortBy: 'rating-desc'
};

App.currentView = 'search';

/**
 * Updates the search state with new parameters from user search
 * @param {string} searchedGame searched game name
 * @param {string} platform platforms from checkboxes formatted for API
 * @param {string} genre  genres from checkboxes formatted for API
 * @param {string} ordering ordering selected from dropdown
 * @param {number} page page number
 * @param {number} page_size number of games per page
 */
App.updateSearchState = (searchedGame, platform, genre, ordering, page, page_size) => {
    App.searchState = {
        searchedGame: searchedGame,
        platform: platform,
        genre: genre,
        ordering: ordering,
        page: page,
        page_size: page_size
    };
}

/**
 * Fetches games from api with or without parameters based on search state
 * @returns data from api
 */
App.fetchGames = async () => {
    let url = `${App.BASE_API_URL}?key=${App.API_KEY}&search=${encodeURIComponent(App.searchState.searchedGame)}&page_size=${App.searchState.page_size}&page=${App.searchState.page}`;

    if (App.searchState.platform) url += `&platforms=${App.searchState.platform}`;
    if (App.searchState.genre) url += `&genres=${App.searchState.genre}`;
    if (App.searchState.ordering) url += `&ordering=${App.searchState.ordering}`;

    return $.ajax({
        url: url,
        method: 'GET'
    });
};

/**
 * Fetches detailed information about a game by its ID
 * @param {number} id 
 * @returns data from api about specific game
 */
App.fetchGameDetails = async (id) => {
    return $.ajax({
        url: `${App.BASE_API_URL}/${id}?key=${App.API_KEY}`,
        method: 'GET'
    });
};

/**
 * Generates pagination coresponding to total items found
 * @param {number} totalItems Total number of games found
 */
App.renderPagination = (totalItems) => {
    paginationNumbers.empty();

    const paginationHardCap = 500;

    const realTotalPages = Math.ceil(totalItems / App.searchState.page_size);
    const totalPages = Math.min(realTotalPages, paginationHardCap);

    const currentPage = App.searchState.page;

    if (totalPages <= 1) return;
    let paginationElements = [];
    const range = 2;
    paginationElements.push(App.createPaginationButton(1));

    if (currentPage - range > 2) {
        paginationElements.push('<span class="pagination-dots">...</span>');
    }

    let start = Math.max(2, currentPage - range);
    let end = Math.min(totalPages - 1, currentPage + range);

    for (let i = start; i <= end; i++) {
        paginationElements.push(App.createPaginationButton(i));
    }

    if (currentPage + range < totalPages - 1) {
        paginationElements.push('<span class="pagination-dots">...</span>');
    }

    if (totalPages > 1) {
        paginationElements.push(App.createPaginationButton(totalPages));
    }

    paginationNumbers.append(paginationElements);
};

/**
 * Creates a pagination button element
 * @param {number} pageNumber Page number
 * @returns button element
 */
App.createPaginationButton = (pageNumber) => {
    const btn = $(`<div class="page-number ${pageNumber === App.searchState.page ? 'active' : ''}">${pageNumber}</div>`);
    btn.click(() => {
        if (pageNumber !== App.searchState.page) {
            App.searchState.page = pageNumber;
            App.updateUrl();
            App.executeSearch();
        }
    });
    return btn;
};

/**
 * Displays search results in the search results section in html
 * @param {Array} games 
 * @returns returns nothing if no games were found, otherwise displays found games
 */
App.displaySearchResults = (games) => {
    searchResults.empty();
    if (!games || games.length === 0) {
        searchResults.html(`
            <div class="empty-state">
                <i class="fa-solid fa-ghost"></i><br>
                We couldn't find any games matching your search.
            </div>
        `);
        return;
    }

    let gamesList = [];

    $.each(games, function (i, game) {
        const optimizedImage = App.getOptimizedImageUrl(game.background_image);

        const gameItem = $(`
            <div class="game-card">
                <div class="img-container">
                    <img>
                    <div class="game-overlay">
                        <span class="click-hint">Add to library</span>
                    </div>
                </div>
                <h3 class="game-title"></h3>
            </div>`);

        gameItem.attr('data-id', game.id);
        gameItem.attr('data-name', game.name);
        gameItem.attr('data-original-img', game.background_image);

        gameItem.find('img').attr('src', optimizedImage);
        gameItem.find('img').attr('alt', game.name);
        gameItem.find('h3').text(game.name);

        gamesList.push(gameItem);
    });

    searchResults.append(gamesList);
};

/**
 * Executes the search based on current search state and calls displaySearchResults function
 */
App.executeSearch = async () => {
    searchResults.empty();
    spinner.show();
    pagination.addClass('hidden');

    try {
        const data = await App.fetchGames();
        App.displaySearchResults(data.results);

        pagination.removeClass('hidden');

        App.renderPagination(data.count);

        pagination_prev.prop('disabled', App.searchState.page === 1);

        if (data.next) {
            pagination_next.prop('disabled', false);
        } else {
            pagination_next.prop('disabled', true);
        }

        if (data.results.length === 0) {
            pagination.addClass('hidden');
        }

    } catch (err) {
        console.error(err);
        App.showToast('There was an error fetching data.', 'error');
    } finally {
        spinner.hide();
        if (App.searchState.page > 1) {
            htmlBody.animate({
                scrollTop: sectionSearch.offset().top
            }, 500);
        }
    }
};

/**
 * Fetches library data from localStorage
 * @returns library data as array if found or empty array
 */
App.getLibraryData = () => {
    try {
        return JSON.parse(localStorage.getItem(App.LOCAL_STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
};

/**
 * Renders games from localStorage library to the library section in html   
 * @returns returns nothing if no games in library were found, otherwise displays games from library
 */
App.renderLibrary = () => {
    const library = App.getLibraryData();
    libraryList.empty();

    pagination.addClass('hidden');

    const filtredLibrary = App.filterSortLibrary(library);

    if (filtredLibrary.length === 0) {
        if (library.length > 0) {
            libraryList.html(`
                <div class="empty-state">
                    <i class="fa-solid fa-filter"></i><br>
                    No games match these filters.
                </div>
            `);
        } else {
            libraryList.html(`
                <div class="empty-state">
                    <i class="fa-solid fa-gamepad"></i><br>
                    It's so empty here. <br> Add some games to your library!
                </div>
            `);
        }
        return;
    }

    let libraryItems = [];

    $.each(filtredLibrary, function (i, game) {
        const optimizedImage = App.getOptimizedImageUrl(game.image);

        let badge = '';
        if (game.rating) {
            badge = `<div class="rating-badge badge">${game.rating}</div>`;
        }

        const gameItem = $(`
            <div class="game-card">
                <div class="img-container">
                    <img>
                    <div class="game-overlay">
                        <span class="click-hint">Edit</span>
                    </div>
                </div>
                <h3 class="game-title"></h3>
            </div>
        `);

        gameItem.attr('data-id', game.id);
        gameItem.attr('data-name', game.name);
        gameItem.attr('data-img', game.image);

        gameItem.find('img').attr('src', optimizedImage);
        gameItem.find('img').attr('alt', game.name);
        gameItem.find('h3').text(game.name);

        gameItem.find('img').after(badge);

        libraryItems.push(gameItem);
    });
    libraryCountSubtitle.text(`Showing ${filtredLibrary.length} game${filtredLibrary.length !== 1 ? 's' : ''} (Total: ${library.length}).`);
    libraryList.append(libraryItems);
};

/**
 * Filters and sorts library data based on App.libraryState
 * @param {Array} games Raw library data
 * @returns {Array} Processed data
 */
App.filterSortLibrary = (games) => {
    let result = [...games];

    if (App.libraryState.status !== 'all') {
        result = result.filter(game => game.status === App.libraryState.status);
    }

    result.sort((a, b) => {
        switch (App.libraryState.sortBy) {
            case 'rating-desc':
                return (b.rating || -1) - (a.rating || -1);

            case 'rating-asc':
                return (a.rating || -1) - (b.rating || -1);

            case 'finished-desc':
                const dateA = a.dateFinished ? new Date(a.dateFinished).getTime() : 0;
                const dateB = b.dateFinished ? new Date(b.dateFinished).getTime() : 0;
                return dateB - dateA;

            case 'finished-asc':
                const dateA2 = a.dateFinished ? new Date(a.dateFinished).getTime() : Infinity;
                const dateB2 = b.dateFinished ? new Date(b.dateFinished).getTime() : Infinity;
                return dateA2 - dateB2;
        }
    });

    return result;
};

/**
 * Adds or updates a game in the library
 * @param {*} gameObj game object to be added or updated in library 
 */
App.addToLibrary = (gameObj) => {
    let library = App.getLibraryData();

    const index = library.findIndex(g => g.id == gameObj.id);

    if (index !== -1) {
        library[index] = gameObj;
        App.showToast(`Record for game: "${gameObj.name}" was updated.`, 'success');
    } else {
        library.push(gameObj);
        App.showToast(`Game: "${gameObj.name}" was added to your library!`, 'success');
    }

    localStorage.setItem(App.LOCAL_STORAGE_KEY, JSON.stringify(library));

    App.closeModal();

    if (!sectionLibrary.hasClass('hidden')) {
        App.renderLibrary();
    }
};

/**
 * Removes game from library by its ID
 * @param {*} id id of the game to be removed
 */
App.removeFromLibrary = (id) => {
    let library = App.getLibraryData();

    const newLibrary = library.filter(game => game.id != id);
    localStorage.setItem(App.LOCAL_STORAGE_KEY, JSON.stringify(newLibrary));

    App.closeModal();

    if (!sectionLibrary.hasClass('hidden')) {
        App.renderLibrary();
    }

    App.showToast('Game removed from library.', 'success');
};


/**
 * Opens modal window with game details and fills form if game is in library
 * @param {*} gameData  game data (id, name, image)
 */
App.openModal = async (gameData) => {

    modalTitle.text(gameData.name);

    modalImg.attr('src', gameData.image);

    modalGameId.val(gameData.id);
    modalGameName.val(gameData.name);
    modalGameImg.val(gameData.image);

    modalDescription.html('<div class="loader loaderModal"></div>');
    modalPlatforms.empty();
    modalReleased.text('Checking date...');
    modalMetacritic.text('-');

    const library = App.getLibraryData();
    const existingGame = library.find(g => g.id == gameData.id);

    if (existingGame) {
        modalStatus.val(existingGame.status);
        modalRating.val(existingGame.rating);
        modalDate.val(existingGame.dateFinished || '');
        modalNote.val(existingGame.note);
        modalDeleteBtn.removeClass('hidden');
    } else {
        modalStatus.val('want-to-play');
        modalRating.val('');
        modalDate.val('');
        modalNote.val('');
        modalDeleteBtn.addClass('hidden');
    }

    modal.removeClass('hidden');

    try {
        const details = await App.fetchGameDetails(gameData.id);

        modalDescription.html(details.description || 'Description is not available.');

        modalReleased.html(`<i class="fa-regular fa-calendar"></i> ${details.released || 'N/A'}`);

        const meta = details.metacritic ? details.metacritic : '-';
        modalMetacritic.empty();
        const icon = $('<i>').addClass('fa-solid fa-star');
        modalMetacritic.append(icon);
        modalMetacritic.append(document.createTextNode(` ${meta}`));

        modalMetacritic.css('color', '');

        if (meta !== '-') {
            if (meta > 70) {
                modalMetacritic.css('color', '#28a745');
            } else if (meta >= 50) {
                modalMetacritic.css('color', '#ffc107');
            } else {
                modalMetacritic.css('color', '#dc3545');
            }
        } else {
            modalMetacritic.css('color', '#6c757d');
        }

        if (details.platforms) {
            const badges = details.platforms.map(p =>
                `<span class="platform-badge">${p.platform.name}</span>`
            ).join('');
            modalPlatforms.html(badges);
        }
    } catch (err) {
        console.error("Loading description was not succesfull", err);
        modalDescription.text("Description is not available.");
    }
};

/**
 * Closes the game description modal window
 */
App.closeModal = () => {
    modal.addClass('hidden');
};

/**
 * Dynamically change how many games apear on page based on screen size
 * @return {[Number]}      Number of games per page
 */
App.getDynamicPageSize = () => {
    const width = $(window).width();
    if (width > 1600) return 24;
    if (width > 1200) return 20;
    if (width > 768) return 15;
    return 10;
};

/**
 * Shows toast notification using SweetAlert2
 * @param  {[String]} message  Message to display
 * @param  {[String]} type     Type of alert window: 'success', 'error', 'info', 'warning'
 */
App.showToast = (message, type = 'info') => {
    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true
    });
};

/**
 * Updates the browser URL based on current search state
 */
App.updateUrl = () => {
    const params = new URLSearchParams();

    if (App.currentView === 'library') {
        params.set('view', 'library');
    } else {
        if (App.searchState.searchedGame) params.set('search', App.searchState.searchedGame);
        if (App.searchState.platform) params.set('platforms', App.searchState.platform);
        if (App.searchState.genre) params.set('genres', App.searchState.genre);
        if (App.searchState.ordering) params.set('ordering', App.searchState.ordering);
        if (App.searchState.page > 1) params.set('page', App.searchState.page);
    }

    const queryString = params.toString();
    const newUrl = queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname;

    window.history.pushState(App.searchState, '', newUrl);
};

/**
 * Reads URL parameters and restores the application state
 * @return nothing
 */
App.loadStateFromUrl = () => {
    const params = new URLSearchParams(window.location.search);

    const view = params.get('view');


    if (view === 'library') {
        App.currentView = 'library';

        sectionSearch.hide();
        sectionLibrary.removeClass('hidden');
        navLibrary.addClass('active');
        navSearch.removeClass('active');

        App.renderLibrary();
        return;
    }

    App.currentView = 'search';

    sectionSearch.show();
    sectionLibrary.addClass('hidden');
    navSearch.addClass('active');
    navLibrary.removeClass('active');

    const searchedGame = params.get('search') || '';
    const platform = params.get('platforms') || '';
    const genre = params.get('genres') || '';
    const ordering = params.get('ordering') || '';
    const page = parseInt(params.get('page')) || 1;

    searchInput.val(searchedGame);
    searchOrdering.val(ordering);

    tagCheckboxes.prop('checked', false);

    if (platform) {
        platform.split(',').forEach(id => platformInputs.filter(`[value="${id}"]`).prop('checked', true));
    }
    if (genre) {
        genre.split(',').forEach(id => genreInputs.filter(`[value="${id}"]`).prop('checked', true));
    }

    if (!searchedGame && !platform && !genre && !ordering && page === 1) {
        App.resetToEmptyState(false);
        return;
    }

    App.updateSearchState(searchedGame, platform, genre, ordering, page, App.getDynamicPageSize());
    App.executeSearch();
};

/**
 * Helper function to optimize image URL from RAWG
 * @param {string} url Original image URL
 * @returns {string} Optimized image URL
 */
App.getOptimizedImageUrl = (url) => {
    if (!url) return 'https://placehold.net/default.svg';

    if (url.includes('media.rawg.io')) {
        return url.replace('/media/', '/media/crop/600/400/');
    }

    return url;
};

/**
 * Clears search results, resets state/URL and shows empty state message
 * @param {boolean} updateUrl - whether to push new state to history (default true)
 */
App.resetToEmptyState = (updateUrl = true) => {
    App.searchState.searchedGame = '';
    App.searchState.platform = '';
    App.searchState.genre = '';

    if (updateUrl) {
        App.updateUrl();
    }

    searchResults.empty();
    searchResults.html(`
        <div class="empty-state">
            <i class="fa-solid fa-ghost"></i><br>
            It's a bit empty here...<br>
            Try searching for a game!
        </div>
    `);
    pagination.addClass('hidden');
};

/**
 * Initializes event listeners and app functionality
 */
App.init = () => {

    // Search by enter
    searchInput.on('keypress', function (e) {
        if (e.which === 13) {
            searchBtn.click();
        }
    });

    // Search function call and passing params from form
    searchBtn.click((e) => {
        e.preventDefault();

        App.currentView = 'search';

        let platforms = platformInputs.filter(':checked').map(function () {
            return this.value;
        }).get();

        let genres = genreInputs.filter(':checked').map(function () {
            return this.value;
        }).get();
        const searchedTerm = searchInput.val().trim();
        let ordering = searchOrdering.val();
        if (!searchedTerm && !ordering) {
            ordering = '-added';
            searchOrdering.val(ordering);
        }
        App.updateSearchState(searchedTerm, platforms.join(','), genres.join(','), searchOrdering.val(), 1, App.getDynamicPageSize());
        if (App.searchState.searchedGame || App.searchState.platform || App.searchState.genre) {
            App.updateUrl();
            App.executeSearch();
        } else {
            App.showToast('Please search for a game or select a filter.', 'info');
        }
    });

    //Pagination - next
    pagination_next.click(() => {
        App.searchState.page++;
        App.updateUrl();
        App.executeSearch();
    });

    //Pagination - prev
    pagination_prev.click(() => {
        App.searchState.page--;
        App.updateUrl();
        App.executeSearch();
    });

    // search when ordering changes
    searchOrdering.change(function () {
        searchBtn.click();
    });

    // search when any tag changes
    tagCheckboxes.change(function () {
        const hasText = searchInput.val().trim().length > 0;
        const hasCheckedTags = tagCheckboxes.is(':checked');

        if (!hasText && !hasCheckedTags) {
            App.resetToEmptyState();
        } else {
            searchBtn.click();
        }
    });
    // filter library when status changes
    libraryFilterStatus.change(function () {
        App.libraryState.status = $(this).val();
        App.renderLibrary();
    });
    // sort library when order changes
    librarySortOrder.change(function () {
        App.libraryState.sortBy = $(this).val();
        App.renderLibrary();
    });

    // delete results and show empty state when input is cleared
    searchInput.on('input', function () {
        if ($(this).val().trim().length === 0) {
            App.resetToEmptyState();
        }
    });

    // Handle browser navigation (back/forward)
    $(window).on("popstate", (event) => {
        App.loadStateFromUrl();
        App.closeModal();
    });

    // Open modal when clicking on a game card
    $(document).on('click', '.game-card', function () {
        const id = $(this).attr('data-id');
        const name = $(this).attr('data-name');

        let image = $(this).attr('data-original-img') || $(this).attr('data-img') || $(this).find('img').attr('src');

        App.openModal({
            id: id,
            name: name,
            image: image
        });
    });

    // Modal form submit
    modalForm.on('submit', function (e) {
        e.preventDefault();

        const gameObj = {
            id: modalGameId.val(),
            name: modalGameName.val(),
            image: modalGameImg.val(),
            status: modalStatus.val(),
            rating: modalRating.val(),
            dateFinished: modalDate.val(),
            note: modalNote.val()
        };

        App.addToLibrary(gameObj);
    });

    // Delete from library
    modalBtnDelete.click(function () {
        Swal.fire({
            title: 'Are you sure?',
            text: "This action is irreversible!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Yes, delete',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                const id = modalGameId.val();
                App.removeFromLibrary(id);
            }
        });
    });

    //Modal close via button
    modalBtnCancel.click(function () {
        App.closeModal();
    });

    //Modal close via X button
    modalCloseButton.click(function () {
        App.closeModal();
    });

    //Modal close via outside click
    $(window).click(function (e) {
        if ($(e.target).is(modal)) {
            App.closeModal();
        }
    });

    // Show search when clicked in nav
    navSearch.click(function () {
        if (App.currentView !== 'search') {
            App.currentView = 'search';

            sectionSearch.show();
            sectionLibrary.addClass('hidden');
            $(this).addClass('active');
            navLibrary.removeClass('active');
            if (App.searchState.searchedGame || App.searchState.platform || App.searchState.genre) {
                pagination.removeClass('hidden');
            }

            App.updateUrl();
        }
    });

    // Show library when clicked in nav
    navLibrary.click(function () {
        if (App.currentView !== 'library') {
            App.currentView = 'library';

            sectionSearch.hide();
            sectionLibrary.removeClass('hidden');
            $(this).addClass('active');
            navSearch.removeClass('active');

            App.updateUrl();
            App.renderLibrary();
        }
    });

    // Load state from URL on app start
    App.loadStateFromUrl();
};

$(document).ready(() => {
    App.init();
});