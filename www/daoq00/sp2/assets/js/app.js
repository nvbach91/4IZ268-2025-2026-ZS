const App = {
    config: {
        apiKey: "326b98640ed09907466734c1beb26b86",
        baseUrl: "https://api.themoviedb.org/3",
        placeholderImg: "https://placehold.co/500x750?text=Obrázek+nedostupný&font=roboto",
        statusMap: {
            "Rumored": "Spekuluje se", "Planned": "Plánováno", "In Production": "V produkci",
            "Post Production": "Post-produkce", "Released": "Vydáno", "Canceled": "Zrušeno",
            "Ended": "Ukončeno", "Returning Series": "Stále běží", "Pilot": "Pilot"
        }
    },

    state: {
        currentPage: 1,
        currentUrl: "",
        currentType: "",
        movieGenres: [],
        tvGenres: [],
        folders: {},
        userReviews: {},
        pendingModalAction: null
    },

    elements: {},

    init: async function () {
        this.cacheDom();
        this.loadLocalStorage();
        this.bindEvents();
        this.fillFilterYears();

        await this.fetchGenres();

        this.renderFolders();

        window.addEventListener('hashchange', () => this.handleRouting());
        this.handleRouting();
    },

    cacheDom: function () {
        const e = this.elements;
        e.loader = document.getElementById('loader');
        e.mainContent = document.getElementById('homepage-sections');
        e.categoryView = document.getElementById('category-view');
        e.detailContainer = document.getElementById('detail-container');
        e.resultsContainer = document.getElementById('results-container');

        e.foldersList = document.getElementById('folders-list');
        e.searchInput = document.getElementById('search-input');
        e.searchForm = document.getElementById('search-form');
        e.sectionTitle = document.getElementById('section-title');

        e.loadMoreBtn = document.getElementById('load-more-btn');
        e.filterBar = document.getElementById('filter-bar');
        e.filterGenre = document.getElementById('filter-genre');
        e.filterYear = document.getElementById('filter-year');
        e.filterSort = document.getElementById('filter-sort');

        e.modalOverlay = document.getElementById('modal-overlay');
        e.modalTitle = document.getElementById('modal-title');
        e.modalBody = document.getElementById('modal-body');
        e.modalBtnConfirm = document.getElementById('modal-btn-confirm');
        e.modalBtnCancel = document.getElementById('modal-btn-cancel');
    },

    loadLocalStorage: function () {
        this.state.folders = JSON.parse(localStorage.getItem('movieExplorerFolders')) || {};
        if (!this.state.folders["Oblíbené"]) {
            this.state.folders["Oblíbené"] = [];
        }
        this.state.userReviews = JSON.parse(localStorage.getItem('movieExplorerReviews')) || {};
    },

    bindEvents: function () {
        const e = this.elements;

        document.body.addEventListener('click', (ev) => {
            const target = ev.target;
            const navBtn = target.closest('.js-navigate');
            if (navBtn) {
                const href = navBtn.dataset.href;
                if (href) location.hash = href;
                return;
            }
            const addBtn = target.closest('.js-open-folder-selector');
            if (addBtn) {
                const id = parseInt(addBtn.dataset.id);
                const title = addBtn.dataset.title;
                this.openFolderSelector(id, title);
                return;
            }
            const removeBtn = target.closest('.js-remove-from-folder');
            if (removeBtn) {
                const id = parseInt(removeBtn.dataset.id);
                const folder = removeBtn.dataset.folder;
                this.removeFromFolder(id, folder);
                return;
            }
            const delFolderBtn = target.closest('.js-delete-folder');
            if (delFolderBtn) {
                const name = delFolderBtn.dataset.name;
                ev.stopPropagation();
                this.deleteFolder(name);
                return;
            }
            const reviewBtn = target.closest('.js-add-review');
            if (reviewBtn) {
                const id = reviewBtn.dataset.id;
                this.addReview(id);
                return;
            }
        });

        e.searchForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const query = e.searchInput.value.trim();
            if (query) location.hash = `search?q=${encodeURIComponent(query)}`;
        });

        e.loadMoreBtn.addEventListener('click', () => {
            this.state.currentPage++;
            this.fetchMoreResults();
        });

        document.getElementById('add-folder-btn').addEventListener('click', () => this.createFolder());
        document.getElementById('btn-apply-filters').addEventListener('click', () => this.applyFilters());

        document.getElementById('logo').addEventListener('click', () => {
            if (!location.hash || location.hash === "#") {
                this.renderHomepage();
            } else {
                location.hash = "";
            }
        });

        e.modalBtnCancel.addEventListener('click', () => this.ui.hideModal());
        e.modalBtnConfirm.addEventListener('click', () => {
            if (this.state.pendingModalAction) this.state.pendingModalAction();
            this.ui.hideModal();
        });
    },

    getData: async function (endpoint) {
        const separator = endpoint.includes('?') ? '&' : '?';
        const url = `${this.config.baseUrl}${endpoint}${separator}api_key=${this.config.apiKey}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        return await response.json();
    },

    fetchGenres: async function () {
        try {
            const [movieData, tvData] = await Promise.all([
                this.getData(`/genre/movie/list?language=cs`),
                this.getData(`/genre/tv/list?language=cs`)
            ]);
            this.state.movieGenres = movieData.genres;
            this.state.tvGenres = tvData.genres;
        } catch (err) {
            console.error("Chyba při stahování žánrů:", err);
        }
    },

    handleRouting: function () {
        const hash = location.hash;
        this.ui.hideAllSections();
        this.ui.toggleLoader(true);

        if (!hash.startsWith("#detail/")) this.state.currentPage = 1;

        if (!hash || hash === "#") {
            this.renderHomepage();
        } else if (hash.startsWith("#movies")) {
            this.showCategory("movie", "Populární filmy");
        } else if (hash.startsWith("#series")) {
            this.showCategory("tv", "Populární seriály");
        } else if (hash.startsWith("#people")) {
            this.showCategory("person", "Osobnosti");
        } else if (hash.startsWith("#search")) {
            const query = new URLSearchParams(hash.split('?')[1]).get('q');
            this.showSearch(query);
        } else if (hash.startsWith("#folder/")) {
            const folderName = decodeURIComponent(hash.split('/')[1]);
            this.displayFolderContent(folderName);
        } else if (hash.startsWith("#detail/")) {
            const parts = hash.split('/');
            this.fetchDetail(parts[2], parts[1]);
        }
    },

    renderHomepage: async function () {
        this.elements.mainContent.innerHTML = "";
        this.elements.mainContent.classList.remove('hidden');
        this.elements.filterBar.classList.add('hidden');

        const rows = [
            { title: "Populární filmy", type: "movie", url: "/movie/popular" },
            { title: "Populární seriály", type: "tv", url: "/tv/popular" },
            { title: "Osobnosti", type: "person", url: "/person/popular" }
        ];

        try {
            const promises = rows.map(async row => {
                const data = await this.getData(`${row.url}?language=cs`);
                return { ...row, results: data.results };
            });

            const results = await Promise.all(promises);

            const fullHtml = results.map(row => {
                const cardsHtml = row.results.slice(0, 9)
                    .map(item => this.createCard(item, row.type))
                    .join('');

                return `
                    <div class="home-row">
                        <h2>${row.title}</h2>
                        <div class="row-scroll">${cardsHtml}</div>
                    </div>`;
            }).join('');

            this.elements.mainContent.innerHTML = fullHtml;

        } catch (err) {
            console.error(err);
            this.elements.mainContent.innerHTML = "<p>Chyba načítání dat.</p>";
        } finally {
            this.ui.toggleLoader(false);
        }
    },

    createCard: function (item, type, folderName = null) {
        const isPerson = type === 'person' || item.media_type === 'person';
        const title = this.escapeHtml(item.title || item.name);

        const imagePath = item.poster_path || item.profile_path;
        const imgUrl = imagePath ? `https://image.tmdb.org/t/p/w500${imagePath}` : this.config.placeholderImg;

        const targetType = isPerson ? 'person' : (item.media_type || type);

        const iconPlus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        const iconTrash = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;

        let actionButton = '';
        if (!isPerson) {
            if (folderName) {
                actionButton = `<button class="add-btn btn-danger js-remove-from-folder" data-id="${item.id}" data-folder="${this.escapeHtml(folderName)}">${iconTrash}</button>`;
            } else {
                actionButton = `<button class="add-btn js-open-folder-selector" data-id="${item.id}" data-title="${title}">${iconPlus}</button>`;
            }
        }
        return `
            <div class="movie-card">
                <img src="${imgUrl}" alt="${title}" loading="lazy">
                <div class="movie-card-content">
                    <h3>${title}</h3>
                    <div class="card-buttons">
                        <button class="detail-btn js-navigate" data-href="#detail/${targetType}/${item.id}">Detail</button>
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;
    },

    fetchDetail: async function (id, type) {
        const lang = type === 'person' ? 'en-US' : 'cs';
        const append = type === 'person' ? 'combined_credits' : 'videos,credits';

        try {
            const data = await this.getData(`/${type}/${id}?language=${lang}&append_to_response=${append}&include_video_language=cs,en`);
            this.renderDetail(data, type);
        } catch (err) {
            console.error(err);
            this.elements.detailContainer.innerHTML = "<p>Detail nelze načíst.</p>";
            this.elements.detailContainer.classList.remove('hidden');
        } finally {
            this.ui.toggleLoader(false);
        }
    },

    renderDetail: function (data, type) {
        const container = this.elements.detailContainer;
        container.innerHTML = "";
        container.classList.remove('hidden');

        if (type === 'person') {
            this.renderPersonDetail(data, container);
        } else {
            this.renderMovieDetail(data, container);
        }
    },

    renderPersonDetail: function (data, container) {
        const birthday = data.birthday ? moment(data.birthday).format('D. M. YYYY') : "Neznámo";
        const projects = data.combined_credits?.cast?.slice(0, 10).map(p => `<li>${p.title || p.name}</li>`).join('') || "";
        const img = data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : this.config.placeholderImg;

        container.innerHTML = `
            <div class="content-header person-detail">
                <div class="main-poster"><img src="${img}"></div>
                <div class="main-info">
                    <h1>${data.name}</h1>
                    <p><strong>Datum narození:</strong> ${birthday}</p>
                    <p><strong>Místo:</strong> ${data.place_of_birth || "Neznámo"}</p>
                    <h3>Biografie</h3>
                    <p class="bio-text">${data.biography || "Není k dispozici."}</p>
                </div>
                <div class="side-cast"><h3>Známé role:</h3><ul>${projects}</ul></div>
            </div>`;
    },

    renderMovieDetail: function (data, container) {
        const director = data.credits?.crew?.find(p => p.job === 'Director')?.name || "Neuveden";
        const cast = data.credits?.cast?.slice(0, 5).map(c => `<li>${c.name}</li>`).join('') || "";

        const vids = data.videos?.results || [];
        const video = vids.find(v => v.site === 'YouTube' && v.type === 'Trailer') || vids.find(v => v.site === 'YouTube');

        const date = data.release_date || data.first_air_date;
        const duration = data.runtime ? `${data.runtime} min` : "N/A";
        const img = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : this.config.placeholderImg;
        const status = this.config.statusMap[data.status] || data.status;
        const title = this.escapeHtml(data.title || data.name);

        container.innerHTML = `
            <div class="content-header">
                <div class="main-poster"><img src="${img}"></div>
                <div class="main-info">
                    <div class="title-row">
                        <h1>${title}</h1>
                        <span class="rating-badge">${data.vote_average?.toFixed(1) || '-'}</span>
                    </div>
                    <div class="meta-tags"><span>${date ? moment(date).format('D. M. YYYY') : 'N/A'}</span> | <span>${duration}</span></div>
                    <p><strong>Žánr:</strong> ${data.genres?.map(g => g.name).join(', ')}</p>
                    <p><strong>Stav:</strong> ${status}</p>
                    <p class="short-desc">${data.overview || "Popis chybí."}</p>
                    <div class="action-buttons">
                        <button class="save-btn btn btn-primary js-open-folder-selector" data-id="${data.id}" data-title="${title}">Uložit do složky</button>
                    </div>
                </div>
                <div class="side-cast"><h3>Hrají:</h3><ul>${cast}</ul></div>
            </div>
            <div class="content-body">
                <div class="full-description">
                    <h3>Režie: ${director}</h3>
                    <p>${data.overview}</p>
                </div>
                <div class="video-player">
                    ${video ? `<iframe src="https://www.youtube.com/embed/${video.key}" frameborder="0" allowfullscreen></iframe>` : `<div class="no-video">Video není k dispozici</div>`}
                </div>
            </div>
            <div class="reviews-container">
                <h3>Recenze</h3>
                <div class="add-review-box">
                    <input type="text" id="rev-input-${data.id}" placeholder="Váš názor...">
                    <button class="btn btn-primary js-add-review" data-id="${data.id}">Odeslat</button>
                </div>
                <div id="reviews-list-${data.id}">${this.renderReviews(data.id)}</div>
            </div>`;
    },

    renderReviews: function (id) {
        const reviews = this.state.userReviews[id] || [];
        if (reviews.length === 0) return "<p>Žádné recenze.</p>";
        return reviews.map(r => `<div class="enhanced-review"><strong>Uživatel (${r.date})</strong><p>${this.escapeHtml(r.text)}</p></div>`).join('');
    },

    addReview: function (id) {
        const input = document.getElementById(`rev-input-${id}`);
        const text = input.value.trim();
        if (text) {
            if (!this.state.userReviews[id]) this.state.userReviews[id] = [];
            this.state.userReviews[id].unshift({ text, date: new Date().toLocaleDateString('cs-CZ') });
            localStorage.setItem('movieExplorerReviews', JSON.stringify(this.state.userReviews));
            document.getElementById(`reviews-list-${id}`).innerHTML = this.renderReviews(id);
            input.value = '';
        }
    },

    renderFolders: function () {
        const list = this.elements.foldersList;
        list.innerHTML = "";

        Object.keys(this.state.folders).forEach(name => {
            const isDefault = name === "Oblíbené";
            const deleteBtn = isDefault ? '' : `<span class="js-delete-folder" data-name="${this.escapeHtml(name)}" style="color:red; cursor:pointer; padding: 0 10px;">✕</span>`;

            const div = document.createElement('div');
            div.className = "folder-item";
            div.innerHTML = `<span class="js-navigate" data-href="#folder/${encodeURIComponent(name)}">${this.escapeHtml(name)} (${this.state.folders[name].length})</span>${deleteBtn}`;
            list.appendChild(div);
        });
        localStorage.setItem('movieExplorerFolders', JSON.stringify(this.state.folders));
    },

    createFolder: function () {
        const input = document.getElementById('new-folder-name');
        const name = input.value.trim();
        if (name && !this.state.folders[name]) {
            this.state.folders[name] = [];
            input.value = '';
            this.renderFolders();
        } else if (this.state.folders[name]) {
            this.ui.showAlert("Složka již existuje.");
        }
    },

    deleteFolder: function (name) {
        this.ui.showConfirm(`Opravdu smazat složku "${name}"?`, () => {
            delete this.state.folders[name];
            this.renderFolders();
            if (location.hash.includes(encodeURIComponent(name))) location.hash = "";
        });
    },

    removeFromFolder: function (id, folderName) {
        this.ui.showConfirm("Odstranit titul ze složky?", () => {
            this.state.folders[folderName] = this.state.folders[folderName].filter(i => i.id !== id);
            this.renderFolders();
            this.displayFolderContent(folderName);
        });
    },

    openFolderSelector: function (id, title) {
        this.ui.showPrompt("Název složky (např. Oblíbené):", "Oblíbené", (targetFolder) => {
            if (!targetFolder) return;

            if (this.state.folders[targetFolder]) {
                if (!this.state.folders[targetFolder].find(f => f.id === id)) {
                    this.state.folders[targetFolder].push({ id, title });
                    this.renderFolders();
                    this.ui.showAlert("Uloženo!");
                } else {
                    this.ui.showAlert("Titul už ve složce je.");
                }
            } else {
                this.ui.showAlert("Složka neexistuje.");
            }
        });
    },

    displayFolderContent: async function (folderName) {
        const items = this.state.folders[folderName] || [];
        this.elements.sectionTitle.textContent = `Složka: ${folderName}`;
        this.elements.categoryView.classList.remove('hidden');
        this.elements.filterBar.classList.add('hidden');
        this.elements.loadMoreBtn.classList.add('hidden');

        const container = this.elements.resultsContainer;
        container.innerHTML = "";

        if (items.length === 0) {
            container.innerHTML = "<p>Složka je prázdná.</p>";
            this.ui.toggleLoader(false);
            return;
        }

        const promises = items.map(item =>
            this.getData(`/movie/${item.id}?language=cs`)
                .catch(() => this.getData(`/tv/${item.id}?language=cs`))
                .catch(e => null)
        );

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null);

        container.innerHTML = validResults.map(data =>
            this.createCard(data, data.title ? 'movie' : 'tv', folderName)
        ).join('');

        this.ui.toggleLoader(false);
    },

    showCategory: async function (type, title) {
        this.state.currentType = type;
        this.state.currentUrl = type === 'person'
            ? `/person/popular?language=cs`
            : `/discover/${type}?language=cs`;

        this.elements.sectionTitle.textContent = title;
        this.elements.categoryView.classList.remove('hidden');
        this.elements.filterBar.classList.remove('hidden');
        this.updateFilterUI(type);

        await this.fetchMoreResults(true);
    },

    showSearch: async function (query) {
        this.state.currentType = "multi";
        this.state.currentUrl = `/search/multi?language=cs&query=${encodeURIComponent(query)}`;

        this.elements.sectionTitle.textContent = `Hledání: ${query}`;
        this.elements.categoryView.classList.remove('hidden');
        this.elements.filterBar.classList.add('hidden');

        await this.fetchMoreResults(true);
    },

    fetchMoreResults: async function (reset = false) {
        if (reset) {
            this.state.currentPage = 1;
            this.elements.resultsContainer.innerHTML = "";
        }

        try {
            const data = await this.getData(`${this.state.currentUrl}&page=${this.state.currentPage}`);

            if (this.state.currentType === 'person' && this.elements.filterSort.value === 'name.asc') {
                data.results.sort((a, b) => a.name.localeCompare(b.name));
            }

            const html = data.results.map(item => this.createCard(item, this.state.currentType)).join('');
            this.elements.resultsContainer.insertAdjacentHTML('beforeend', html);

            if (data.page < data.total_pages) {
                this.elements.loadMoreBtn.classList.remove('hidden');
            } else {
                this.elements.loadMoreBtn.classList.add('hidden');
            }
        } catch (err) {
            console.error(err);
        } finally {
            this.ui.toggleLoader(false);
        }
    },

    fillFilterYears: function () {
        const currentYear = new Date().getFullYear() + 1;
        let opts = '<option value="">Všechny roky</option>';
        for (let y = currentYear; y >= 1980; y--) opts += `<option value="${y}">${y}</option>`;
        this.elements.filterYear.innerHTML = opts;
    },

    updateFilterUI: function (type) {
        const e = this.elements;
        e.filterSort.innerHTML = "";

        if (type === 'person') {
            e.filterGenre.classList.add('hidden');
            e.filterYear.classList.add('hidden');
            e.filterSort.innerHTML = '<option value="popularity.desc">Nejpopulárnější</option><option value="name.asc">Abecedně (A-Z)</option>';
        } else {
            e.filterGenre.classList.remove('hidden');
            e.filterYear.classList.remove('hidden');

            const genres = type === 'movie' ? this.state.movieGenres : this.state.tvGenres;
            e.filterGenre.innerHTML = '<option value="">Všechny žánry</option>' + genres.map(g => `<option value="${g.id}">${g.name}</option>`).join('');

            e.filterSort.innerHTML = `
                <option value="popularity.desc">Nejpopulárnější</option>
                <option value="vote_average.desc">Nejlépe hodnocené</option>
                <option value="primary_release_date.desc">Nejnovější</option>
            `;
        }
    },

    applyFilters: function () {
        this.state.currentPage = 1;
        const genre = this.elements.filterGenre.value;
        const year = this.elements.filterYear.value;
        const sort = this.elements.filterSort.value;
        const type = this.state.currentType;

        if (type === 'person') {
            this.state.currentUrl = `/person/popular?language=cs`;
        } else {
            let url = `/discover/${type}?language=cs&sort_by=${sort}`;
            if (genre) url += `&with_genres=${genre}`;
            if (year) url += type === 'movie' ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`;
            this.state.currentUrl = url;
        }

        this.fetchMoreResults(true);
    },

    ui: {
        toggleLoader: function (show) {
            const loader = App.elements.loader;
            if (show) loader.classList.remove('hidden');
            else loader.classList.add('hidden');
        },

        hideAllSections: function () {
            App.elements.mainContent.classList.add('hidden');
            App.elements.categoryView.classList.add('hidden');
            App.elements.detailContainer.classList.add('hidden');
            App.elements.filterBar.classList.add('hidden');
        },

        showModal: function (title, bodyHtml, confirmCallback = null, showCancel = true) {
            const e = App.elements;
            e.modalTitle.textContent = title;
            e.modalBody.innerHTML = bodyHtml;
            App.state.pendingModalAction = confirmCallback;

            e.modalBtnCancel.style.display = showCancel ? 'block' : 'none';
            e.modalOverlay.classList.remove('hidden');
        },
        hideModal: function () {
            App.elements.modalOverlay.classList.add('hidden');
            App.state.pendingModalAction = null;
        },
        showAlert: function (msg) {
            this.showModal("Info", `<p>${msg}</p>`, null, false);
        },
        showConfirm: function (msg, onConfirm) {
            this.showModal("Potvrzení", `<p>${msg}</p>`, onConfirm, true);
        },
        showPrompt: function (label, defaultValue, onConfirm) {
            const html = `<label>${label}</label><input type="text" id="modal-prompt-input" class="modal-input" value="${defaultValue}">`;
            this.showModal("Zadejte hodnotu", html, () => {
                const val = document.getElementById('modal-prompt-input').value.trim();
                onConfirm(val);
            }, true);
        }
    },

    escapeHtml: function (text) {
        if (!text) return "";
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});