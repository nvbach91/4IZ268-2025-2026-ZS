import Anime from '../models/Anime.js';
import Mustache from 'https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.mjs';

export default class UIController {
    constructor() {
        this.searchResultsContainer = document.getElementById('search-results');
        this.myListContainer = document.getElementById('my-anime-list');

        // Modal Elements
        this.modal = document.getElementById('anime-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.querySelector('.close-modal');

        // Mustache Templates
        this.animeCardTemplate = document.getElementById('anime-card-template').innerHTML;
        this.myListCardTemplate = document.getElementById('my-list-card-template').innerHTML;
        this.modalDetailTemplate = document.getElementById('modal-detail-template').innerHTML;

        this.closeBtn.addEventListener('click', () => this.closeModal());
        window.addEventListener('click', (e) => {
            if (e.target === this.modal) this.closeModal();
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    /**
     * Render search results
     * @param {Array} apiDataList 
     * @param {Function} onAdd 
     * @param {Function} onDetail Click handler
     */
    renderSearchResults(apiDataList, onAdd, onDetail) {
        this.searchResultsContainer.innerHTML = '';

        if (!apiDataList || apiDataList.length === 0) {
            this.searchResultsContainer.innerHTML = '<p class="placeholder-text">Žádné výsledky nenalezeny.</p>';
            return;
        }

        apiDataList.forEach(data => {
            const anime = Anime.fromApi(data);
            const cardHtml = Mustache.render(this.animeCardTemplate, anime);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHtml;
            const card = tempDiv.firstElementChild;

            // Click on Image or Title -> Details (if onDetail is provided)
            if (onDetail) {
                const triggerDetail = () => onDetail(anime.mal_id);
                card.querySelector('.anime-img').addEventListener('click', triggerDetail);
                card.querySelector('h3').addEventListener('click', triggerDetail);
            }

            const btn = card.querySelector('button');
            btn.addEventListener('click', () => {
                onAdd(anime);
                btn.textContent = 'Přidáno';
                btn.disabled = true;
            });

            this.searchResultsContainer.appendChild(card);
        });
    }

    /**
     * Render user's anime list
     * @param {Array} animeList 
     * @param {Object} callbacks 
     * @param {Function} onDetailCallback
     */
    renderMyList(animeList, callbacks, onDetailCallback) {
        this.myListContainer.innerHTML = '';

        if (animeList.length === 0) {
            this.myListContainer.innerHTML = '<p class="placeholder-text">Váš seznam je prázdný.</p>';
            return;
        }

        animeList.forEach(anime => {
            // Prepare data for Mustache (handle logic outside template)
            const statusOptions = [
                { value: 'watching', label: 'Sleduji', selected: anime.userStatus === 'watching' },
                { value: 'completed', label: 'Dokončeno', selected: anime.userStatus === 'completed' },
                { value: 'plan_to_watch', label: 'Chci vidět', selected: anime.userStatus === 'plan_to_watch' }
            ];

            const viewData = {
                ...anime,
                statusOptions: statusOptions,
                maxEpisodes: anime.episodes !== '?' ? anime.episodes : 9999
            };

            const cardHtml = Mustache.render(this.myListCardTemplate, viewData);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHtml;
            const card = tempDiv.firstElementChild;

            // Click on Image or Title -> Details
            const triggerDetail = () => onDetailCallback(anime.mal_id);
            card.querySelector('.anime-img').addEventListener('click', triggerDetail);
            card.querySelector('h3').addEventListener('click', triggerDetail);

            // Event Listeners
            const statusSelect = card.querySelector('.status-select');
            const episodesInput = card.querySelector('.episodes-input');

            statusSelect.addEventListener('change', (e) => {
                const newStatus = e.target.value;
                // Instant visual update
                card.className = `anime-card status-${newStatus}`;

                // Status -> Episodes
                if (newStatus === 'completed' && anime.episodes !== '?') {
                    const maxEps = parseInt(anime.episodes);
                    if (!isNaN(maxEps)) {
                        episodesInput.value = maxEps;
                        // Trigger update for episodes too
                        callbacks.onUpdateEpisodes(anime.mal_id, maxEps);
                    }
                }

                callbacks.onUpdateStatus(anime.mal_id, newStatus);
            });

            episodesInput.addEventListener('input', (e) => {
                const newVal = parseInt(e.target.value);

                callbacks.onUpdateEpisodes(anime.mal_id, newVal);

                // Episodes -> Status
                if (anime.episodes !== '?') {
                    const maxEps = parseInt(anime.episodes);
                    if (!isNaN(maxEps)) {
                        if (newVal === maxEps && anime.userStatus !== 'completed') {
                            // Completed logic
                            statusSelect.value = 'completed';
                            card.className = 'anime-card status-completed';
                            callbacks.onUpdateStatus(anime.mal_id, 'completed');
                        } else if (newVal === 0 && anime.userStatus !== 'plan_to_watch') {
                            // 0 Episodes -> Plan to Watch
                            statusSelect.value = 'plan_to_watch';
                            card.className = 'anime-card status-plan_to_watch';
                            callbacks.onUpdateStatus(anime.mal_id, 'plan_to_watch');
                        } else if (newVal > 0 && newVal < maxEps && anime.userStatus !== 'watching') {
                            // In-between -> Watching
                            statusSelect.value = 'watching';
                            card.className = 'anime-card status-watching';
                            callbacks.onUpdateStatus(anime.mal_id, 'watching');
                        }
                    }
                }
            });

            const removeBtn = card.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => {
                if (confirm(`Opravdu chcete odstranit "${anime.title}" ze seznamu?`)) {
                    callbacks.onRemove(anime.mal_id);
                }
            });

            this.myListContainer.appendChild(card);
        });
    }

    showLoading() {
        this.searchResultsContainer.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        `;
    }

    showError(message) {
        this.searchResultsContainer.innerHTML = `<p class="placeholder-text" style="color: red;">${message}</p>`;
    }

    // Modal Methods
    showModalLoading() {
        this.modalBody.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        `;
        this.modal.classList.remove('hidden');
    }

    openModal(data) {
        // Prepare data for view
        const viewData = {
            ...data,
            large_image_url: data.images.jpg.large_image_url,
            episodes: data.episodes || '?',
            score: data.score || 'N/A',
            year: data.year || 'N/A',
            status: data.status,
            type: data.type,
            synopsis: data.synopsis || 'Popis není k dispozici.',
            genres: data.genres,
            trailer_url: data.trailer?.embed_url ? data.trailer.embed_url.replace('autoplay=1', 'autoplay=0') : null,
            url: data.url
        };

        const modalHtml = Mustache.render(this.modalDetailTemplate, viewData);
        this.modalBody.innerHTML = modalHtml;
        this.modal.classList.remove('hidden');
    }

    closeModal() {
        this.modal.classList.add('hidden');
        this.modalBody.innerHTML = '';
    }
}
