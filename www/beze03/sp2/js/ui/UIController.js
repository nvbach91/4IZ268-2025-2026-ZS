import Anime from '../models/Anime.js';
import Mustache from 'https://cdn.jsdelivr.net/npm/mustache@4.2.0/mustache.mjs';

export default class UIController {
    constructor() {
        this.searchResultsContainer = document.getElementById('search-results');
        this.myListContainer = document.getElementById('my-anime-list');

        // View Elements
        this.viewSearch = document.getElementById('view-search');
        this.viewList = document.getElementById('view-list');
        this.navSearch = document.getElementById('nav-search');
        this.navList = document.getElementById('nav-list');

        // Bind Nav Events
        this.navSearch.addEventListener('click', () => this.switchView('search'));
        this.navList.addEventListener('click', () => this.switchView('list'));

        // Modal Elements
        this.modal = document.getElementById('anime-modal');
        this.modalBody = document.getElementById('modal-body');
        this.closeBtn = document.querySelector('.close-modal');

        // Mustache Templates
        this.animeCardTemplate = document.getElementById('anime-card-template').innerHTML;
        this.myListCardTemplate = document.getElementById('my-list-card-template').innerHTML;
        this.modalDetailTemplate = document.getElementById('modal-detail-template').innerHTML;

        // Pagination indices
        this.itemsPerPage = 7;
        this.currentSearchPage = 1;
        this.currentListPage = 1;
        this.totalSearchResults = 0;
        this.totalListItems = 0;
        this.onListViewSwitch = false;

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

    switchView(viewName) {
        if (viewName === 'search') {
            this.viewSearch.classList.remove('hidden');
            this.viewList.classList.add('hidden');
            this.navSearch.classList.add('active');
            this.navList.classList.remove('active');
            this.myListContainer.innerHTML = '';
        } else if (viewName === 'list') {
            this.viewSearch.classList.add('hidden');
            this.viewList.classList.remove('hidden');
            this.navSearch.classList.remove('active');
            this.navList.classList.add('active');
            if (this.onListViewSwitch) this.onListViewSwitch();
        }
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

        this.totalSearchResults = apiDataList.length;
        this.currentSearchPage = 1;
        this.searchResultsData = apiDataList;
        this.currentOnAdd = onAdd;
        this.currentOnDetail = onDetail;

        this.renderSearchPage(onAdd, onDetail);
    }


    renderSearchPage(onAdd, onDetail) {
        const startIndex = (this.currentSearchPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.searchResultsData.slice(startIndex, endIndex);

        const fragment = document.createDocumentFragment();

        pageData.forEach(data => {
            const anime = Anime.fromApi(data);
            const cardHtml = Mustache.render(this.animeCardTemplate, anime);

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = cardHtml;
            const card = tempDiv.firstElementChild;

            if (onDetail) {
                const triggerDetail = () => onDetail(anime.mal_id);
                card.querySelector('.anime-img').addEventListener('click', triggerDetail);
                card.querySelector('h3').addEventListener('click', triggerDetail);
            }

            const btn = card.querySelector('button.action-btn');
            btn.addEventListener('click', () => {
                onAdd(anime);
                btn.textContent = 'Přidáno';
                btn.disabled = true;
            });

            const genreTags = card.querySelectorAll('button.genre-tag');
            genreTags.forEach(tag => {
                tag.addEventListener('click', () => { 
                    const genreId = tag.dataset.genreId;
                    if (this.onGenreClick) this.onGenreClick(genreId);
                });
            });

            fragment.appendChild(card);
        });

        this.searchResultsContainer.innerHTML = '';
        this.searchResultsContainer.appendChild(fragment);

        this.appendPaginationControls(this.searchResultsContainer, 'search');
    }

    renderStatusCounts(counts) {
        document.getElementById('count-watching').textContent = counts.watching;
        document.getElementById('count-completed').textContent = counts.completed;
        document.getElementById('count-plan').textContent = counts.plan_to_watch;
        document.getElementById('count-total').textContent = counts.total;
    }

    /**
     * Render user's anime list
     * @param {Array} animeList 
     * @param {Object} callbacks 
     * @param {Function} onDetailCallback
     */
    renderMyList(animeList, callbacks, onDetailCallback) {
        // Ulož data a callbacky pro stránkování
        this.myListData = animeList;
        this.currentMyListCallbacks = callbacks;
        this.currentMyListDetailCallback = onDetailCallback;
        this.totalListItems = animeList.length;
        this.currentListPage = 1;

        this.renderMyListPage();
    }

    renderMyListPage() {
        this.myListContainer.innerHTML = '';

        if (this.myListData.length === 0) {
            this.myListContainer.innerHTML = '<p class="placeholder-text">Váš seznam je prázdný.</p>';
            return;
        }

        const startIndex = (this.currentListPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.myListData.slice(startIndex, endIndex);

        const fragment = document.createDocumentFragment();

        pageData.forEach(anime => {
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
            const triggerDetail = () => this.currentMyListDetailCallback(anime.mal_id);
            card.querySelector('.anime-img').addEventListener('click', triggerDetail);
            card.querySelector('h3').addEventListener('click', triggerDetail);

            // Event Listeners
            const statusSelect = card.querySelector('.status-select');
            const episodesInput = card.querySelector('.episodes-input');

            statusSelect.addEventListener('change', (e) => {
                const newStatus = e.target.value;
                card.className = `anime-card status-${newStatus}`;
                if (newStatus === 'completed' && anime.episodes !== '?') {
                    const maxEps = parseInt(anime.episodes);
                    if (!isNaN(maxEps)) {
                        episodesInput.value = maxEps;
                        this.currentMyListCallbacks.onUpdateEpisodes(anime.mal_id, maxEps);
                    }
                }
                this.currentMyListCallbacks.onUpdateStatus(anime.mal_id, newStatus);
            });

            episodesInput.addEventListener('input', (e) => {
                let newVal = parseInt(e.target.value);
                if (isNaN(newVal) || newVal < 0) {
                    newVal = 0;
                }
                if (anime.episodes !== '?') {
                    const maxEps = parseInt(anime.episodes);
                    if (!isNaN(maxEps) && newVal > maxEps) {
                        newVal = maxEps;
                    }
                }
                if (parseInt(e.target.value) !== newVal) {
                    e.target.value = newVal;
                }
                this.currentMyListCallbacks.onUpdateEpisodes(anime.mal_id, newVal);

                const maxEps = parseInt(anime.episodes);
                if (newVal === maxEps && anime.userStatus !== 'completed') {
                    statusSelect.value = 'completed';
                    card.className = 'anime-card status-completed';
                    this.currentMyListCallbacks.onUpdateStatus(anime.mal_id, 'completed');
                } else if (newVal === 0 && anime.userStatus !== 'plan_to_watch') {
                    statusSelect.value = 'plan_to_watch';
                    card.className = 'anime-card status-plan_to_watch';
                    this.currentMyListCallbacks.onUpdateStatus(anime.mal_id, 'plan_to_watch');
                } else if (newVal > 0 && newVal < maxEps && anime.userStatus !== 'watching') {
                    statusSelect.value = 'watching';
                    card.className = 'anime-card status-watching';
                    this.currentMyListCallbacks.onUpdateStatus(anime.mal_id, 'watching');
                }
            });

            const removeBtn = card.querySelector('.remove-btn');
            removeBtn.addEventListener('click', () => {
                Swal.fire({
                    title: 'Opravdu odstranit?',
                    text: `Chcete odstranit "${anime.title}" ze seznamu?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Ano, odstranit',
                    cancelButtonText: 'Zrušit'
                }).then((result) => {
                    if (result.isConfirmed) {
                        this.currentMyListCallbacks.onRemove(anime.mal_id);
                        Swal.fire(
                            'Odstraněno!',
                            'Anime bylo odebráno ze seznamu.',
                            'success'
                        );
                    }
                });
            });

            fragment.appendChild(card);
        });

        this.myListContainer.appendChild(fragment);
        this.appendPaginationControls(this.myListContainer, 'list');
    }

    appendPaginationControls(container, type) {
        const totalPages = type === 'search'
            ? Math.ceil(this.totalSearchResults / this.itemsPerPage)
            : Math.ceil(this.totalListItems / this.itemsPerPage);

        const currentPage = type === 'search' ? this.currentSearchPage : this.currentListPage;

        if (totalPages <= 1) return;

        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination-controls';

        if (currentPage > 1) {
            const prevBtn = document.createElement('button');
            prevBtn.textContent = 'Předchozí';
            prevBtn.addEventListener('click', () => this.goToPage(currentPage - 1, type));
            paginationDiv.appendChild(prevBtn);
        }

        if (currentPage < totalPages) {
            const nextBtn = document.createElement('button');
            nextBtn.textContent = 'Další';
            nextBtn.addEventListener('click', () => this.goToPage(currentPage + 1, type));
            paginationDiv.appendChild(nextBtn);
        }

        container.appendChild(paginationDiv);
    }

    goToPage(pageNum, viewType) {
        if (viewType === 'search') {
            this.currentSearchPage = pageNum;
            this.renderSearchPage(this.currentOnAdd, this.currentOnDetail);
        } else {
            this.currentListPage = pageNum;
            this.renderMyListPage(this.currentOnRemove, this.currentOnStatusUpdate, this.currentOnEpisodeUpdate, this.currentOnDetail);
        }
    }

    showLoading() {
        this.searchResultsContainer.innerHTML = `
            <div class="spinner-container">
                <div class="spinner"></div>
            </div>
        `;
    }

    showError(message) {
        this.searchResultsContainer.innerHTML = `<p class="placeholder-text error">${message}</p>`;
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
