const API_KEY = '3e8993a8e6534514812b5f0784832a1e';
const BASE_URL = 'https://api.rawg.io/api';

// State
let currentPage = 'discover';

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const route = e.target.getAttribute('data-route');
            navigateTo(route);
        });
    });

    // Global Search Handling
    const globalSearch = document.getElementById('global-search');
    if (globalSearch) {
        globalSearch.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                navigateTo('discover');
                fetchGames(e.target.value);
            }
        });
    }

    navigateTo('discover');
});

function navigateTo(pageId) {
    currentPage = pageId;

    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-route="${pageId}"]`)?.classList.add('active');

    const main = document.getElementById('main-content');
    main.innerHTML = '';

    if (pageId === 'discover') {
        renderDiscover(main);
    } else if (pageId === 'dashboard') {
        renderDashboard(main);
    } else if (pageId === 'library') {
        renderLibrary(main);
    }
}

// --- VIEWS ---

function renderDiscover(container) {
    container.innerHTML = `
        <div class="filters">
            <input type="text" id="searchInput" placeholder="Search..." style="margin-right: 10px; padding: 5px;">
            <select id="platformFilter" style="padding: 5px;">
                <option value="">All Platforms</option>
                <option value="4">PC</option>
                <option value="187">PlayStation 5</option>
                <option value="1">Xbox One</option>
            </select>
        </div>
        <div id="games-grid" class="grid-container">
            <div class="loading">Loading...</div>
        </div>
    `;

    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') fetchGames(e.target.value, document.getElementById('platformFilter').value);
    });
    document.getElementById('platformFilter').addEventListener('change', (e) => {
        fetchGames(document.getElementById('searchInput').value, e.target.value);
    });

    fetchGames();
}

function renderDashboard(container) {
    const lib = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    const favorites = lib.filter(g => g.isFavorite).length;

    container.innerHTML = `
        <div class="stats-row">
            <div class="stat-box">Games: <span id="total-games">${lib.length}</span></div>
            <div class="stat-box">Favorites: <span id="total-favs">${favorites}</span></div>
            <div class="stat-box">Status: Online</div>
        </div>
        
        <h3>Recently Added</h3>
        <div class="recent-row">
            <div class="game-card-small">
                <div class="placeholder-img"></div>
                <p>GTA V</p>
            </div>
            <div class="game-card-small">
                <div class="placeholder-img"></div>
                <p>Cyberpunk</p>
            </div>
            <div class="game-card-small">
                <div class="placeholder-img"></div>
                <p>Call of Duty</p>
            </div>
            <div class="game-card-small">
                <div class="placeholder-img"></div>
                <p>Battlefield</p>
            </div>
        </div>

        <h3>Favorite Showcase</h3>
        <div class="fav-showcase">
            <div class="showcase-main">
                <div class="placeholder-img-large"></div>
                <p>No Game Selected</p>
            </div>
        </div>
    `;
}

function renderLibrary(container) {
    container.innerHTML = `
        <div class="filters">
            <span>My Saved Games</span>
        </div>
        <div id="library-grid" class="grid-container"></div>
    `;
    loadLibrary();
}

// --- LOGIC ---

async function fetchGames(search = '', platform = '') {
    const grid = document.getElementById('games-grid');
    if (!grid) return;

    grid.innerHTML = '<div class="loading">Loading...</div>';

    try {
        let url = `${BASE_URL}/games?key=${API_KEY}&page_size=28`;
        if (search) url += `&search=${search}`;
        if (platform) url += `&platforms=${platform}`;

        const response = await fetch(url);
        const data = await response.json();

        if (currentPage !== 'discover') return;
        grid.innerHTML = '';

        if (data.results.length === 0) {
            grid.innerHTML = '<p>No games found.</p>';
            return;
        }

        data.results.forEach(game => {
            const card = document.createElement('div');
            card.className = 'game-card';
            const bgImage = game.background_image ? game.background_image : '';

            card.innerHTML = `
                <img src="${bgImage}" class="game-img" alt="${game.name}">
                <div class="game-info">
                    <h4>${game.name}</h4>
                    <p>Rating: ${game.rating}</p>
                    <button class="add-btn" onclick="addToLibrary(${game.id}, '${game.name.replace(/'/g, "\\'")}', '${bgImage}')">Add to Library</button>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Error:", error);
        grid.innerHTML = '<p>Error loading games.</p>';
    }
}

window.addToLibrary = addToLibrary;
window.toggleFavorite = toggleFavorite;
window.removeFromLibrary = removeFromLibrary;

function addToLibrary(id, name, image) {
    let lib = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    if (lib.find(g => g.id === id)) {
        alert('Game already in library!');
        return;
    }
    lib.push({ id, name, image, isFavorite: false });
    localStorage.setItem('myGameLibrary', JSON.stringify(lib));
    alert(`${name} added to library!`);
}

function loadLibrary() {
    const grid = document.getElementById('library-grid');
    if (!grid) return;

    const lib = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    grid.innerHTML = '';

    if (lib.length === 0) {
        grid.innerHTML = '<p>Your library is empty.</p>';
        return;
    }

    lib.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        const favText = game.isFavorite ? '★ Unfavorite' : '☆ Favorite';
        card.innerHTML = `
            <img src="${game.image}" class="game-img" alt="${game.name}">
            <div class="game-info">
                <h4>${game.name}</h4>
                <button class="add-btn" onclick="toggleFavorite(${game.id})">${favText}</button>
                <button class="add-btn" onclick="removeFromLibrary(${game.id})" style="background: #ff4444;">Remove</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function toggleFavorite(id) {
    let lib = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    const game = lib.find(g => g.id === id);
    if (game) {
        game.isFavorite = !game.isFavorite;
        localStorage.setItem('myGameLibrary', JSON.stringify(lib));
        loadLibrary();
    }
}

function removeFromLibrary(id) {
    let lib = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    lib = lib.filter(g => g.id !== id);
    localStorage.setItem('myGameLibrary', JSON.stringify(lib));
    loadLibrary();
}
