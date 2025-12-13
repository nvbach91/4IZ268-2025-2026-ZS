

const App = {
   
    baseUrl: 'https://api.rawg.io/api/',
    apiKey: '5870dfaeaaec4391a08ca9e06baeca89', 

   
    state: {
        view: 'search', 
        backlog: [] 
    },

    
    init: () => {
        console.log('App: Startuji...');
        
       
        const storedBacklog = localStorage.getItem('myGameBacklog');
        if (storedBacklog) {
            App.state.backlog = JSON.parse(storedBacklog);
            
            $('#nav-backlog').text(`Můj Backlog (${App.state.backlog.length})`);
        }

        
        $('#nav-search').on('click', () => App.switchView('search'));
        $('#nav-backlog').on('click', () => App.switchView('backlog'));

        
        App.renderSearch();
    },

    
    switchView: (viewName) => {
        App.state.view = viewName;
        $('nav button').removeClass('active');
        $(`#nav-${viewName}`).addClass('active');

        if (viewName === 'search') {
            App.renderSearch();
        } else if (viewName === 'backlog') {
            App.renderBacklog();
        }
    },

    
    renderSearch: () => {
        const html = `
            <h2>Vyhledat hru</h2>
            <div class="search-box">
                <input type="text" id="search-input" placeholder="Zadejte název hry (např. Witcher)...">
                <button id="btn-search">Hledat</button>
            </div>
            <div id="game-list-container"></div>
        `;
        $('#app').html(html);

        
        $('#search-input').on('keypress', (e) => {
            if (e.which === 13) App.handleSearch();
        });
        $('#btn-search').on('click', App.handleSearch);
    },

    handleSearch: () => {
        const query = $('#search-input').val().trim();
        
        
        if (!query) {
            alert('Prosím, zadejte název hry.');
            return;
        }

        $('#game-list-container').html('<div class="spinner"></div>');

        $.ajax({
            url: `${App.baseUrl}games`,
            method: 'GET',
            data: {
                key: App.apiKey,
                search: query,
                page_size: 12 
            },
            success: (response) => {
               
                App.renderGameCards(response.results, '#game-list-container');
            },
            error: (err) => {
                console.error(err);
                $('#game-list-container').html('<p class="error">Chyba při komunikaci s API.</p>');
            }
        });
    },

    
    renderGameCards: (gamesArray, targetSelector) => {
        if (!gamesArray || gamesArray.length === 0) {
            $(targetSelector).html('<p>Nebyly nalezeny žádné hry.</p>');
            return;
        }

        const grid = $('<div class="games-grid"></div>');

        gamesArray.forEach(game => {
  
            const image = game.background_image ? game.background_image : 'https://via.placeholder.com/300x200?text=No+Image';
            
    
            const releaseDate = game.released ? dayjs(game.released).format('DD. MM. YYYY') : 'Neznámé datum';

            const card = $(`
                <div class="game-card" data-id="${game.id}">
                    <img src="${image}" alt="${game.name}">
                    <div class="game-info">
                        <h3>${game.name}</h3>
                        <div class="game-meta">Vydáno: ${releaseDate}</div>
                        <div class="game-meta">⭐ ${game.rating} / 5</div>
                    </div>
                </div>
            `);

           
            card.on('click', () => App.loadGameDetail(game.id));
            grid.append(card);
        });

        $(targetSelector).html(grid);
    },


    loadGameDetail: (gameId) => {
     
        $('#app').html('<div class="spinner"></div>');

  
        $.ajax({
            url: `${App.baseUrl}games/${gameId}`,
            method: 'GET',
            data: { key: App.apiKey },
            success: (game) => {
                App.renderDetailView(game);
            },
            error: () => {
                $('#app').html('<p>Nepodařilo se načíst detail hry.</p>');
            }
        });
    },

    renderDetailView: (game) => {
        const image = game.background_image ? game.background_image : 'https://via.placeholder.com/600x400';
        const description = game.description_raw ? game.description_raw : 'Popis není k dispozici.';
        
       
        const isInBacklog = App.state.backlog.some(g => g.id === game.id);

        const html = `
            <button class="btn-back" id="btn-back">zpět</button>
            <div class="game-detail">
                <div class="detail-header">
                    <h2>${game.name}</h2>
                    <img src="${image}" alt="${game.name}">
                </div>
                <div class="detail-info">
                    <p><strong>Vydáno:</strong> ${game.released}</p>
                    <p><strong>Web:</strong> <a href="${game.website}" target="_blank">${game.website}</a></p>
                    <p>${description.substring(0, 500)}...</p>
                </div>
                
                <div class="actions">
                    ${isInBacklog 
                        ? `<button class="btn-remove" id="action-remove">Odebrat z Backlogu</button>`
                        : `<button class="btn-add" id="action-add">Pridat do Backlogu</button>`
                    }
                </div>
            </div>
        `;

        $('#app').html(html);

        $('#btn-back').on('click', () => {
           
        });

       
        $('#action-add').on('click', () => App.addToBacklog(game));
        $('#action-remove').on('click', () => App.removeFromBacklog(game.id));
    },


    addToBacklog: (gameFullData) => {
        
        const gameToSave = {
            id: gameFullData.id,
            name: gameFullData.name,
            background_image: gameFullData.background_image,
            released: gameFullData.released,
            rating: gameFullData.rating
        };

        App.state.backlog.push(gameToSave);
        App.saveBacklog();
        alert('Hra byla přidána do backlogu!');
        App.renderDetailView(gameFullData);
    },

    removeFromBacklog: (gameId) => {
        App.state.backlog = App.state.backlog.filter(g => g.id !== gameId);
        App.saveBacklog();
        alert('Hra byla odebrána.');
        
       
        if ($('.game-detail').length) {
           
             App.switchView('backlog');
        } else {
             App.renderBacklog();
        }
    },

    saveBacklog: () => {
        localStorage.setItem('myGameBacklog', JSON.stringify(App.state.backlog));
        $('#nav-backlog').text(`Můj Backlog (${App.state.backlog.length})`);
    },

    renderBacklog: () => {
        const html = `
            <h2>Můj Herní Backlog</h2>
            <div id="backlog-container"></div>
        `;
        $('#app').html(html);

       
        App.renderGameCards(App.state.backlog, '#backlog-container');
    }
};


$(document).ready(() => {
    App.init();
});