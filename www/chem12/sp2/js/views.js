



// html na jednotlivou karticku hry 
const createGameCardHTML = (game) => {
    const image = game.background_image || 'https://via.placeholder.com/300x200?text=No+Image';
    const year = game.released ? dayjs(game.released).format('YYYY') : '----';

    return `
        <article class="game-card" data-id="${game.id}">
            <img src="${image}" alt="${game.name}" loading="lazy">
            <div class="game-info">
                <h3>${game.name}</h3>
                <div class="meta-tag"> ${year}</div>
                <div class="meta-tag"> ${game.rating || 0}</div>
            </div>
        </article>
    `;
};




// html na search view 
export const renderSearchView = ($container) => {
    const html = `
        <section class="search-section">
            <h2> Vyhledat hru</h2>
            <div class="search-box">
                <input type="text" id="search-input" placeholder="Zadejte název hry (min. 2 znaky)..." aria-label="Hledat hru">
                <button id="btn-search" class="btn-primary">Hledat</button>
            </div>
        </section>
        <section id="game-results" aria-live="polite">
            <p class="search-hint-muted-text">Zadejte název hry a objevte nové tituly.</p>
        </section>
    `;
    $container.html(html);
};




// html na backlog view
export const renderBacklogView = ($container, games, onCardClick) => {
    const html = `
        <section>
            <h2> Můj Herní Backlog</h2>
            <div id="backlog-list"></div>
        </section>
    `;
    $container.html(html);

    // generovani gridu s kartami her 
    renderGameGrid(games, $('#backlog-list'), true, onCardClick);
};




//html na grid her 
export const renderGameGrid = (games, $target, isBacklog = false, onCardClick) => {
    if (!games || games.length === 0) {
        $target.html(`<p>${isBacklog ? 'Váš backlog je prázdný.' : 'Nebyly nalezeny žádné hry.'}</p>`);
        return;
    }

    const cardsHtml = games.map(createGameCardHTML).join('');
    const $grid = $(`<div class="games-grid">${cardsHtml}</div>`);
    $target.html($grid);

    //callbacki na funkce s parametrem id hry 
    $grid.on('click', '.game-card', function () {
        const id = $(this).data('id');
        if (onCardClick) onCardClick(id);
    });
};




// html na detail hry 
export const renderDetailHTML = (game, $container, isSaved, onBack, onToggle) => {
    const image = game.background_image || 'https://via.placeholder.com/600x400?text=No+Image';
    const released = game.released ? dayjs(game.released).format('DD. MM. YYYY') : 'Neznámé datum';
    const description = game.description_raw ? game.description_raw.substring(0, 800) + '...' : 'Popis není k dispozici.';

    const html = `
        <button class="btn-back">← Zpět</button>
        <article class="game-detail">
            <div class="detail-header">
                <h2>${game.name}</h2>
                <img src="${image}" alt="${game.name}">
            </div>
            <div class="detail-info">
                <p><strong>Vydáno:</strong> ${released}</p>
                <p><strong>Hodnocení:</strong>  ${game.rating} / 5</p>
                <p><strong>Web:</strong> <a href="${game.website}" target="_blank" rel="noopener noreferrer">${game.website || 'Není'}</a></p>
                <hr>
                <p class="description">${description}</p>
            </div>
            
            <div class="actions">
                <button id="action-toggle" class="${isSaved ? 'btn-remove' : 'btn-add'}">
                    ${isSaved ? ' Odebrat z Backlogu' : ' Přidat do Backlogu'}
                </button>
            </div>
        </article>
    `;

    $container.html(html);

    // Navěšení akcí na tlačítka
    $('.btn-back').on('click', onBack);
    $('#action-toggle').on('click', onToggle);
};



// html na loader
export const renderLoader = ($container) => {
    $container.html('<div class="spinner"></div>');
};


// html na navigacni tlacitko s poctem her v backlogu
export const updateNavCounter = (count) => {
    $('#nav-backlog').text(`Můj Backlog (${count})`);
};



// aktualizace aktivniho tlacitka v navigaci
export const updateNavState = (viewName) => {
    $('nav button').removeClass('active');
    $(`#nav-${viewName}`).addClass('active');
};