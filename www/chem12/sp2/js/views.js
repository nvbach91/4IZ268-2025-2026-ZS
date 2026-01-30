


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
export const renderSearchView = ($container, initialQuery = '', initialResults = [], genres = [], platforms = [], onSearch, onCardClick, checkIfSaved, onQuickToggle) => {
    
    
    const genresOptions = genres.map(g =>  `<option value="${g.slug}">${g.name}</option>`).join('');

    
    const platformsOptions = platforms.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    
    
    
    const html = `
        <section class="search-section">
            <h2> Vyhledat hru</h2>
            <div class="options">
            <select id="filter-genre" is="genre-filter">
            <option value="">-- Všechny žánry --</option>
            ${genresOptions}
            </select>
            <select id="filter-platform" is="platform-filter">
            <option value="">-- Všechny platformy --</option>
            ${platformsOptions}
            </select>
            </div>

            <div class="search-box">
                <input type="text" id="search-input" value="${initialQuery}" placeholder="Zadejte název hry (min. 2 znaky)..." aria-label="Hledat hru">
                <button id="btn-search" class="btn-primary">Hledat</button>
            </div>
        </section>
        <section id="game-results" aria-live="polite">
            <p class="search-hint-muted-text">Zadejte název hry a objevte nové tituly.</p>
        </section>
    `;
    $container.html(html);

   if (initialResults && initialResults.length > 0) {
        renderGameGrid(initialResults, $('#game-results'), false, onCardClick, checkIfSaved,  onQuickToggle);
    } else {
        $('#game-results').html('<p class="search-hint-muted-text">Zadejte název hry a objevte nové tituly.</p>');
    }
};


// html na backlog view
export const renderBacklogView = ($container, games, onCardClick, onSaveData) => {

    const html = `
        <section>
            <h2> Můj Herní Backlog</h2>
            <div id="backlog-list"></div>
        </section>`


    $container.html(html);

    renderGameGrid(games, $('#backlog-list'), true, onCardClick);
};




//html na grid her 
export const renderGameGrid = (games, $target, isBacklog = false, onCardClick, checkIfSaved, onQuickToggle) => {
    if (!games || games.length === 0) {
        $target.html(`<p>${isBacklog ? 'Váš backlog je prázdný.' : 'Nebyly nalezeny žádné hry.'}</p>`);
        return;
    }

    const cardsHtml = games.map(createGameCardHTML).join('');
    const $grid = $(`<div class="games-grid">${cardsHtml}</div>`);
    $target.html($grid);


if (checkIfSaved && onQuickToggle) {
        games.forEach(game => {
            const isSaved = checkIfSaved(game.id);
            
            const $card = $grid.find(`.game-card[data-id="${game.id}"]`);
            
            
            const btnIcon = isSaved ? '-' : '+';

            const $btn = $(`<button id="button-card-add-remove">${btnIcon}</button>`);

$btn.on('click', (e) => {
                e.stopPropagation();
                onQuickToggle(game); 
            });

            $card.append($btn);
        });
    }   

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
    const metacritic = game.metacritic ? `${game.metacritic}` : 'N/A';
    const playtime = game.playtime ? `${game.playtime} hod.` : 'N/A';
    const platformy = game.platforms ? game.platforms.map(p => p.platform.name).join(', ') : 'N/A';

const websiteHtml = game.website 
        ? `<a href="${game.website}" target="_blank" rel="noopener noreferrer" class="website-link">${game.website}</a>` 
        : '<span class="text-muted">Web není uveden</span>';


    const html = `
        <button class="btn-back">← Zpět</button>
        <article class="game-detail">
            <div class="detail-header">
                <h2>${game.name}</h2>
                <img src="${image}" alt="${game.name}">
            </div>
            <div class="detail-info">
                <p><strong>Platformy:</strong> ${platformy}</p>
                <p><strong>Vydáno:</strong> ${released}</p>
                <p><strong class="meta-tag">Metacritic:</strong> ${metacritic}</p>
                <p><strong class="meta-tag">Hraní:</strong> ${playtime}</p>
                <p><strong>Hodnocení:</strong>  ${game.rating} / 5</p>
                <p><strong>Web:</strong> ${websiteHtml}</p>
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
    $(`nav button`).removeClass('active');
    $(`#nav-${viewName}`).addClass('active');
};