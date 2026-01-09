/**
 * Library View
 */
import { appStore } from '../store.js';
import { UI } from '../ui.js';
import { Router } from '../router.js';

export function renderLibrary() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="section-title">My Library</h2>
            <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="fav-toggle">
                <label class="form-check-label" for="fav-toggle">Show Favorites Only</label>
            </div>
        </div>
        <div id="lib-grid" class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4"></div>
    `;

    const grid = document.getElementById('lib-grid');
    const toggle = document.getElementById('fav-toggle');

    const render = (showFavs) => {
        const library = appStore.getLibrary();
        const games = showFavs ? library.filter(g => g.isFavorite) : library;

        grid.innerHTML = '';
        if (games.length === 0) {
            grid.innerHTML = '<p class="text-center w-100 text-muted">No games found in collection.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        games.forEach(game => {
            // Create custom card for library (with Remove button)
            const col = document.createElement('div');
            col.className = 'col';
            const date = game.released ? dayjs(game.released).format('MMM D, YYYY') : 'N/A';

            col.innerHTML = `
                <div class="card game-card h-100">
                    <img src="${game.background_image}" class="card-img-top library-card-img" alt="${game.name}">
                    <div class="card-body">
                        <h5 class="card-title text-truncate">${game.name}</h5>
                        <p class="small text-muted">${date}</p>
                        
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-sm ${game.isFavorite ? 'btn-danger' : 'btn-outline-danger'} flex-grow-1 fav-btn">
                                ${game.isFavorite ? '♥' : '♡'}
                            </button>
                            <button class="btn btn-sm btn-outline-secondary remove-btn">Remove</button>
                        </div>
                    </div>
                </div>
            `;

            // Listeners
            col.querySelector('.game-card').addEventListener('click', (e) => {
                if (e.target.closest('button')) return;
                Router.navigate(`game/${game.id}`);
            });

            col.querySelector('.fav-btn').addEventListener('click', function () {
                const newState = appStore.toggleFavorite(game.id);

                // If we are showing favorites only and it's no longer a favorite -> Remove it
                if (toggle.checked && !newState) {
                    col.remove();
                    // If grid is empty now, show empty message
                    if (grid.children.length === 0) {
                        grid.innerHTML = '<p class="text-center w-100 text-muted">No games found in collection.</p>';
                    }
                    return;
                }

                // Update Button UI directly
                const btn = this;
                if (newState) {
                    btn.classList.remove('btn-outline-danger');
                    btn.classList.add('btn-danger');
                    btn.textContent = '♥';
                } else {
                    btn.classList.remove('btn-danger');
                    btn.classList.add('btn-outline-danger');
                    btn.textContent = '♡';
                }
            });

            col.querySelector('.remove-btn').addEventListener('click', () => {
                UI.showConfirmModal(
                    'Remove Game',
                    `Are you sure you want to remove ${game.name} from your library?`,
                    () => {
                        appStore.remove(game.id);
                        col.remove(); // -- Fix for rerendering --
                        // If grid is empty now, show empty message
                        if (grid.children.length === 0) {
                            grid.innerHTML = '<p class="text-center w-100 text-muted">No games found in collection.</p>';
                        }
                        UI.showToast('Game removed');
                    }
                );
            });

            fragment.appendChild(col);
        });
        grid.appendChild(fragment);
    };

    toggle.addEventListener('change', (e) => render(e.target.checked));
    render(false);
}
