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
        folderPage: 1,
        currentUrl: "",
        currentType: "",
        currentFolderView: null,
        lastSelectedFolder: "Oblíbené",
        movieGenres: [],
        tvGenres: [],
        folders: {},
        userReviews: {},
        pendingModalAction: null,
        renderedIds: new Set()
    },

    elements: {},

    init: async function () {
        this.cacheDom();
        this.loadLocalStorage();
        this.bindEvents();
        this.fillFilterYears();

        await this.fetchGenres();

        this.renderFolders();

        window.addEventListener("hashchange", () => this.handleRouting());
        this.handleRouting();
    },

    cacheDom: function () {
        const e = this.elements;
        
        e.loader = document.getElementById("loader");
        e.mainContent = document.getElementById("homepage-sections");
        e.categoryView = document.getElementById("category-view");
        e.detailContainer = document.getElementById("detail-container");
        e.resultsContainer = document.getElementById("results-container");

        e.foldersList = document.getElementById("folders-list");
        e.searchInput = document.getElementById("search-input");
        e.searchForm = document.getElementById("search-form");
        e.sectionTitle = document.getElementById("section-title");

        e.loadMoreBtn = document.getElementById("load-more-btn");
        e.filterBar = document.getElementById("filter-bar");
        e.filterGenre = document.getElementById("filter-genre");
        e.filterYear = document.getElementById("filter-year");
        e.filterSort = document.getElementById("filter-sort");
        e.filterBtnFilter = document.getElementById("btn-apply-filters"); 

        e.logo = document.getElementById("logo");

        e.modalOverlay = document.getElementById("modal-overlay");
        e.modalTitle = document.getElementById("modal-title");
        e.modalBody = document.getElementById("modal-body");
        e.modalBtnConfirm = document.getElementById("modal-btn-confirm");
        e.modalBtnCancel = document.getElementById("modal-btn-cancel");

        e.addFolderForm = document.getElementById("add-folder-form");
        e.newFolderName = document.getElementById("new-folder-name");

        e.folderSelect = document.getElementById("folder-select");
        e.pageWrapper = document.getElementById("pagination-wrapper");
        
    },

    loadLocalStorage: function () {
        this.state.folders = JSON.parse(localStorage.getItem("movieExplorerFolders")) || {};
        if (!this.state.folders["Oblíbené"]) {
            this.state.folders["Oblíbené"] = [];
        }
        this.state.userReviews = JSON.parse(localStorage.getItem("movieExplorerReviews")) || {};
        this.state.lastSelectedFolder = localStorage.getItem("movieExplorerLastFolder") || "Oblíbené";
    },

    bindEvents: function () {
        const e = this.elements;

        document.body.addEventListener("click", (ev) => {
            const target = ev.target;

            const navBtn = target.closest(".js-navigate");
            if (navBtn) {
                ev.preventDefault();
                const href = navBtn.dataset.href;
                if (href) location.hash = href;
                return;
            }

            const addBtn = target.closest(".js-open-folder-selector");
            if (addBtn) {
                const id = parseInt(addBtn.dataset.id);
                const title = addBtn.dataset.title;
                const type = addBtn.dataset.type;
                this.openFolderSelector(id, title, type);
                return;
            }

            const removeBtn = target.closest(".js-remove-from-folder");
            if (removeBtn) {
                const id = parseInt(removeBtn.dataset.id);
                const folder = removeBtn.dataset.folder;
                ev.stopPropagation();
                this.removeFromFolder(id, folder);
                return;
            }

            const delFolderBtn = target.closest(".js-delete-folder");
            if (delFolderBtn) {
                const name = delFolderBtn.dataset.name;
                ev.stopPropagation();
                this.deleteFolder(name);
                return;
            }

            const folderItem = target.closest(".folder-item");
            if (folderItem && !target.closest(".js-delete-folder")) {
                const folderName = folderItem.dataset.name;
                location.hash = `#folder/${encodeURIComponent(folderName)}`;
                return;
            }
        });

        document.body.addEventListener("submit", (ev) => {
            if (ev.target.classList.contains("js-review-form")) {
                ev.preventDefault();
                const id = ev.target.dataset.id;
                this.addReview(id);
            }
        });

        e.searchForm.addEventListener("submit", (ev) => {
            ev.preventDefault();
            const query = e.searchInput.value.trim();
            if (query) location.hash = `search?q=${encodeURIComponent(query)}`;
        });

        e.loadMoreBtn.addEventListener("click", () => {
            if (this.state.currentFolderView) {
                this.state.folderPage++;
                this.fetchMoreFolderResults();
            } else {
                this.state.currentPage++;
                this.fetchMoreResults();
            }
        });

        e.addFolderForm.addEventListener("submit", (ev) => {
            ev.preventDefault();
            this.createFolder();
        });

        e.filterBtnFilter.addEventListener("click", () => this.applyFilters());

        e.logo.addEventListener("click", () => {
            if (!location.hash || location.hash === "#") {
                this.renderHomepage();
            } else {
                location.hash = "";
            }
        });

        e.modalBtnCancel.addEventListener("click", () => this.ui.hideModal());
        e.modalBtnConfirm.addEventListener("click", () => {
            if (this.state.pendingModalAction) this.state.pendingModalAction();
            this.ui.hideModal();
        });
    },

    getData: async function (endpoint) {
        const separator = endpoint.includes("?") ? "&" : "?";
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
        const decodedHash = decodeURIComponent(hash);

        document.querySelectorAll("nav a").forEach(a => {
            a.classList.remove("active");
            const href = a.getAttribute("href");
            if (!href) return;
            if (decodedHash === href || (decodedHash.includes("?") && decodedHash.split("?")[0] === href)) {
                a.classList.add("active");
            }
        });

        this.ui.hideAllSections();
        this.ui.toggleLoader(true);

        this.state.currentFolderView = null;
        if (!hash.startsWith("#detail/")) {
            this.state.currentPage = 1;
            this.state.folderPage = 1;
        }

        if (!hash || hash === "#") {
            this.renderHomepage();
        } else if (hash.startsWith("#movies")) {
            this.showCategory("movie", "Populární filmy");
        } else if (hash.startsWith("#series")) {
            this.showCategory("tv", "Populární seriály");
        } else if (hash.startsWith("#people")) {
            this.showCategory("person", "Osobnosti");
        } else if (hash.startsWith("#search")) {
            const query = new URLSearchParams(hash.split("?")[1]).get("q");
            this.showSearch(query);
        } else if (hash.startsWith("#folder/")) {
            const folderName = decodeURIComponent(hash.split("/")[1]);
            this.displayFolderContent(folderName);
        } else if (hash.startsWith("#detail/")) {
            const parts = hash.split("/");
            this.fetchDetail(parts[2], parts[1]);
        }
    },

    renderHomepage: async function () {
        this.elements.mainContent.innerHTML = "";
        this.elements.mainContent.classList.remove("hidden");
        this.elements.filterBar.classList.add("hidden");

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
                    .join("");

                return `
                    <div class="home-row">
                        <h2>${row.title}</h2>
                        <div class="row-scroll">${cardsHtml}</div>
                    </div>`;
            }).join("");

            this.elements.mainContent.innerHTML = fullHtml;

        } catch (err) {
            console.error(err);
            this.elements.mainContent.innerHTML = "<p>Chyba načítání dat.</p>";
        } finally {
            this.ui.toggleLoader(false);
        }
    },

    isInAnyFolder: function (id) {
        for (const folderName in this.state.folders) {
            if (this.state.folders[folderName].some(item => item.id === id)) {
                return true;
            }
        }
        return false;
    },

    getFolderCount: function (id) {
        let count = 0;
        for (const folderName in this.state.folders) {
            if (this.state.folders[folderName].some(item => item.id === id)) {
                count++;
            }
        }
        return count;
    },

    createCard: function (item, type, folderName = null) {
        const isPerson = type === "person" || item.media_type === "person";
        const title = this.escapeHtml(item.title || item.name);
        const id = item.id;

        const imagePath = item.poster_path || item.profile_path;
        const imgUrl = imagePath ? `https://image.tmdb.org/t/p/w500${imagePath}` : this.config.placeholderImg;

        const targetType = isPerson ? "person" : (item.media_type || type);

        const iconPlus = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`;
        const iconTrash = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>`;
        const iconCheck = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg>`;

        let actionButton = "";
        let savedIndicator = "";

        if (!isPerson) {
            const savedCount = this.getFolderCount(id);

            if (savedCount > 0 && !folderName) {
                savedIndicator = `<div class="saved-indicator" title="Uloženo v ${savedCount} složkách">${savedCount}</div>`;
            }

            if (folderName) {
                actionButton = `<button class="add-btn btn-danger js-remove-from-folder" data-id="${id}" data-folder="${this.escapeHtml(folderName)}" title="Odstranit">${iconTrash}</button>`;
            } else {
                actionButton = `<button class="add-btn js-open-folder-selector" data-id="${id}" data-title="${title}" data-type="${targetType}" title="Přidat do složky">${iconPlus}</button>`;
            }
        }

        return `
            <div class="movie-card">
                ${savedIndicator}
                <img src="${imgUrl}" alt="${title}" loading="lazy" class="js-navigate" data-href="#detail/${targetType}/${id}">
                <div class="movie-card-content">
                    <h3 class="js-navigate" data-href="#detail/${targetType}/${id}">${title}</h3>
                    <div class="card-buttons">
                        <button class="detail-btn js-navigate" data-href="#detail/${targetType}/${id}">Detail</button>
                        ${actionButton}
                    </div>
                </div>
            </div>
        `;
    },

    fetchDetail: async function (id, type) {
        const lang = type === "person" ? "en-US" : "cs";
        const append = type === "person" ? "combined_credits" : "videos,credits";

        try {
            const data = await this.getData(`/${type}/${id}?language=${lang}&append_to_response=${append}&include_video_language=cs,en`);
            this.renderDetail(data, type);
        } catch (err) {
            console.error(err);
            this.elements.detailContainer.innerHTML = "<p>Detail nelze načíst.</p>";
            this.elements.detailContainer.classList.remove("hidden");
        } finally {
            this.ui.toggleLoader(false);
        }
    },

    renderDetail: function (data, type) {
        const container = this.elements.detailContainer;
        container.innerHTML = "";
        container.classList.remove("hidden");

        if (type === "person") {
            this.renderPersonDetail(data, container);
        } else {
            this.renderMovieDetail(data, container);
        }
    },

    renderPersonDetail: function (data, container) {
        const birthday = data.birthday ? moment(data.birthday).format("D. M. YYYY") : "Neznámo";
        const projects = data.combined_credits?.cast.slice(0, 9)?.map(p => {
            const mediaType = p.media_type || "movie";
            return `<li><a href="#detail/${mediaType}/${p.id}" class="js-navigate" data-href="#detail/${mediaType}/${p.id}">${p.title || p.name}</a></li>`;
        }).join("") || "";
        const img = data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : this.config.placeholderImg;

        container.innerHTML = `
            <div class="content-header person-detail">
                <div class="main-poster"><img src="${img}" alt="${data.name}"></div>
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
        const director = data.credits?.crew?.find(p => p.job === "Director")?.name || "Neuveden";
        const cast = data.credits?.cast?.slice(0, 5).map(c => `<li>${c.name}</li>`).join("") || "";
        const vids = data.videos?.results || [];
        const video = vids.find(v => v.site === "YouTube" && v.type === "Trailer") || vids.find(v => v.site === "YouTube");
        const date = data.release_date || data.first_air_date;
        const duration = data.runtime ? `${data.runtime} min` : "N/A";
        const img = data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : this.config.placeholderImg;
        const status = this.config.statusMap[data.status] || data.status;
        const title = this.escapeHtml(data.title || data.name);
        const mediaType = data.title ? "movie" : "tv";

        const reviewCount = (this.state.userReviews[data.id] || []).length;

        container.innerHTML = `
            <div class="content-header">
                <div class="main-poster"><img src="${img}" alt="${title}"></div>
                <div class="main-info">
                    <div class="title-row">
                        <h1>${title}</h1>
                        <span class="rating-badge">${data.vote_average?.toFixed(1) || "-"}</span>
                    </div>
                    <div class="meta-tags"><span>${date ? moment(date).format("D. M. YYYY") : "N/A"}</span> | <span>${duration}</span></div>
                    <p><strong>Žánr:</strong> ${data.genres?.map(g => g.name).join(", ")}</p>
                    <p><strong>Stav:</strong> ${status}</p>
                    <p class="short-desc">${data.overview || "Popis chybí."}</p>
                    <div class="action-buttons">
                        <button class="save-btn btn btn-primary js-open-folder-selector" data-id="${data.id}" data-title="${title}" data-type="${mediaType}">Uložit do složky</button>
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
                    ${video ? `<iframe src="https://www.youtube.com/embed/${video.key}" frameborder="0" title="Trailer" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>` : `<div class="no-video">Video není k dispozici</div>`}
                </div>
            </div>
            <div class="reviews-container">
                <h3>Recenze <span id="review-count-${data.id}" class="review-count-badge">(${reviewCount})</span></h3>
                
                <form class="add-review-box js-review-form" data-id="${data.id}">
                    <input type="text" id="rev-input-${data.id}" placeholder="Váš názor..." required>
                    <button type="submit" class="btn btn-primary">Odeslat</button>
                </form>
                <div id="reviews-list-${data.id}">${this.renderReviews(data.id)}</div>
            </div>`;
    },

    renderReviews: function (id) {
        const reviews = this.state.userReviews[id] || [];
        if (reviews.length === 0) return "<p>Žádné recenze.</p>";

        return reviews.map(r => {
            let displayDate = "";

            if (r.isoDate) {
                displayDate = moment(r.isoDate).format("D. M. YYYY HH:mm:ss");
            } else {
                displayDate = r.date || "Neznámé datum";
            }

            return `<div class="enhanced-review">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <strong>Uživatel</strong>
                    <span class="review-date" style="font-size: 0.85em; color: #666;">${displayDate}</span>
                </div>
                <p style="margin:0;">${this.escapeHtml(r.text)}</p>
            </div>`;
        }).join("");
    },

    addReview: function (id) {
        const input = document.getElementById(`rev-input-${id}`);
        const reviewList = document.getElementById(`reviews-list-${id}`);
        const countBadge = document.getElementById(`review-count-${id}`);
        
        if (!input) return;

        const text = input.value.trim();
        if (text) {
            if (!this.state.userReviews[id]) this.state.userReviews[id] = [];
            
            const now = new Date();

            this.state.userReviews[id].unshift({
                text: text,
                isoDate: now.toISOString(),
                date: now.toLocaleDateString("cs-CZ") 
            });

            localStorage.setItem("movieExplorerReviews", JSON.stringify(this.state.userReviews));
            
            reviewList.innerHTML = this.renderReviews(id);
            
            if (countBadge) {
                const newCount = this.state.userReviews[id].length;
                countBadge.textContent = `(${newCount})`;
            }

            input.value = "";
        }
    },

    renderFolders: function () {
        const list = this.elements.foldersList;
        list.innerHTML = "";

        Object.keys(this.state.folders).forEach(name => {
            const isDefault = name === "Oblíbené";
            const deleteBtn = isDefault ? "" : `<span class="js-delete-folder" data-name="${this.escapeHtml(name)}" style="color:red; cursor:pointer; padding: 0 10px;" title="Smazat složku">✕</span>`;

            const div = document.createElement("div");
            div.className = "folder-item";
            div.dataset.name = name;

            div.innerHTML = `<span class="folder-name-span">${this.escapeHtml(name)} (${this.state.folders[name].length})</span>${deleteBtn}`;
            list.appendChild(div);
        });
        localStorage.setItem("movieExplorerFolders", JSON.stringify(this.state.folders));
    },

    createFolder: function () {
        const input = this.elements.newFolderName;
        const name = input.value.trim();
        if (name && !this.state.folders[name]) {
            this.state.folders[name] = [];
            input.value = "";
            this.renderFolders();
            this.ui.showAlert(`Složka "${name}" byla vytvořena.`);
        } else if (this.state.folders[name]) {
            this.ui.showAlert("Složka již existuje.");
        }
    },

    deleteFolder: function (name) {
        this.ui.showConfirm(`Opravdu smazat složku "${name}"?`, () => {
            delete this.state.folders[name];
            if (this.state.lastSelectedFolder === name) {
                this.state.lastSelectedFolder = "Oblíbené";
                localStorage.setItem("movieExplorerLastFolder", "Oblíbené");
            }
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

    openFolderSelector: function (id, title, type) {
        const options = Object.keys(this.state.folders)
            .map(f => `<option value="${f}" ${f === this.state.lastSelectedFolder ? "selected" : ""}>${f}</option>`)
            .join("");

        const html = `
            <label for="folder-select">Vyberte složku:</label>
            <select id="folder-select" class="modal-input">${options}</select>
        `;

        this.ui.showModal("Uložit do složky", html, () => {
            const select = document.getElementById ("folder-select");
            const targetFolder = select.value;

            this.state.lastSelectedFolder = targetFolder;
            localStorage.setItem("movieExplorerLastFolder", targetFolder);

            if (targetFolder && this.state.folders[targetFolder]) {
                if (!this.state.folders[targetFolder].find(f => f.id === id)) {
                    this.state.folders[targetFolder].push({ id, title, type: type || "movie"});
                    this.renderFolders();

                    const activeCard = document.querySelector(`button[data-id="${id}"]`)?.closest(".movie-card");
                    if (activeCard) {
                        let indicator = activeCard.querySelector(".saved-indicator");
                        const newCount = this.getFolderCount(id);

                        if (!indicator) {
                            indicator = document.createElement("div");
                            indicator.className = "saved-indicator";
                            activeCard.appendChild(indicator);
                        }
                        indicator.textContent = newCount;
                        indicator.title = `Uloženo v ${newCount} složkách`;
                    }

                    setTimeout(() => {
                        this.ui.showAlert(`Položka "${title}" byla přidána do složky "${targetFolder}".`);
                    }, 200); 

                } else {
                    setTimeout(() => {
                        this.ui.showAlert(`Titul už ve složce "${targetFolder}" je.`);
                    }, 200);
                }
            }
        });
    },

    displayFolderContent: async function (folderName) {
        const items = this.state.folders[folderName] || [];
        this.state.currentFolderView = folderName;
        this.state.folderPage = 1;

        this.elements.sectionTitle.textContent = `Složka: ${folderName}`;
        this.elements.categoryView.classList.remove("hidden");
        this.elements.filterBar.classList.add("hidden");

        this.elements.resultsContainer.innerHTML = "";

        if (items.length === 0) {
            this.elements.resultsContainer.innerHTML = "<p>Složka je prázdná.</p>";
            this.elements.loadMoreBtn.classList.add("hidden");
            this.ui.toggleLoader(false);
            return;
        }

        await this.fetchMoreFolderResults();
    },

    fetchMoreFolderResults: async function () {
        this.ui.toggleButtonLoader(true);
        this.elements.loadMoreBtn.classList.add("hidden");

        this.elements.resultsContainer.innerHTML = "";
        window.scrollTo({ top: 0, behavior: "smooth" });

        const folderName = this.state.currentFolderView;
        const allItems = this.state.folders[folderName] || [];

        const PAGE_SIZE = 20;
        const start = (this.state.folderPage - 1) * PAGE_SIZE;
        const end = start + PAGE_SIZE;
        const itemsToLoad = allItems.slice(start, end);

        if (itemsToLoad.length === 0 && allItems.length > 0 && this.state.folderPage > 1) {
             this.ui.toggleButtonLoader(false);
             return;
        }

        const promises = itemsToLoad.map(item => {
            if (item.type) {
                return this.getData(`/${item.type}/${item.id}?language=cs`).catch(e => null);
            } else {
                return this.getData(`/movie/${item.id}?language=cs`)
                    .catch(() => this.getData(`/tv/${item.id}?language=cs`))
                    .catch(e => null);
            }
        });

        const results = await Promise.all(promises);
        const validResults = results.filter(r => r !== null);

        const html = validResults.map(data =>
            this.createCard(data, data.title ? "movie" : "tv", folderName)
        ).join("");

        this.elements.resultsContainer.insertAdjacentHTML("beforeend", html);

        this.renderPaginationControls(allItems.length);

        this.ui.toggleButtonLoader(false);
        this.ui.toggleLoader(false);
    },

    renderPaginationControls: function (totalCountOrPages) {
        let paginationWrapper = e.pageWrapper;
        if (!paginationWrapper) {
            paginationWrapper = document.createElement("div");
            paginationWrapper.id = "pagination-wrapper";
            paginationWrapper.className = "pagination-wrapper";
            this.elements.loadMoreBtn.parentElement.appendChild(paginationWrapper);
        }
        paginationWrapper.innerHTML = "";

        const isFolder = !!this.state.currentFolderView;
        let currentPage, step, hasNext;

        if (isFolder) {
            currentPage = this.state.folderPage;
            step = 1;
            const maxPage = Math.ceil(totalCountOrPages / 20);
            hasNext = currentPage < maxPage;
        } else {
            currentPage = this.state.currentPage;
            step = (this.state.currentType === "person" && this.elements.filterSort.value === "name.asc") ? 10 : 1;
            hasNext = currentPage + step <= totalCountOrPages && currentPage < 500;
        }

        if (currentPage > 1) {
            const prevBtn = document.createElement("button");
            prevBtn.className = "btn btn-secondary";
            prevBtn.textContent = "« Předchozí";
            prevBtn.onclick = () => {
                if (isFolder) {
                    this.state.folderPage--;
                    this.fetchMoreFolderResults();
                } else {
                    this.state.currentPage = Math.max(1, this.state.currentPage - step);
                    this.fetchMoreResults();
                }
            };
            paginationWrapper.appendChild(prevBtn);
        }

        const pageInfo = document.createElement("span");
        pageInfo.className = "page-info";
        const displayPage = isFolder ? currentPage : Math.ceil(currentPage / step);
        pageInfo.textContent = ` Strana ${displayPage} `;
        paginationWrapper.appendChild(pageInfo);

        if (hasNext) {
            const nextBtn = document.createElement("button");
            nextBtn.className = "btn btn-primary";
            nextBtn.textContent = "Další »";
            nextBtn.onclick = () => {
                if (isFolder) {
                    this.state.folderPage++;
                    this.fetchMoreFolderResults();
                } else {
                    this.state.currentPage += step;
                    this.fetchMoreResults();
                }
            };
            paginationWrapper.appendChild(nextBtn);
        }
    },

    fetchMoreResults: async function (reset = false) {
        this.ui.toggleButtonLoader(true);
        
        if (reset) {
            this.state.currentPage = 1;
            this.elements.resultsContainer.innerHTML = "";
            this.state.renderedIds = new Set(); 
        }

        try {
            let resultsToRender = [];
            let hasMorePages = true;

            if (this.state.currentType === "person" && this.elements.filterSort.value === "name.asc") {
                
                const promises = [];
                const batchSize = 10; 
                const startPage = this.state.currentPage;

                for (let i = 0; i < batchSize; i++) {
                    promises.push(this.getData(`${this.state.currentUrl}&page=${startPage + i}`));
                }

                const responses = await Promise.all(promises);
                
                responses.forEach(data => {
                    if (data.results) resultsToRender.push(...data.results);
                });

                this.state.currentPage += batchSize;
                
                resultsToRender.sort((a, b) => a.name.localeCompare(b.name));

                const lastResponse = responses[responses.length - 1];
                hasMorePages = lastResponse && lastResponse.page < lastResponse.total_pages;

            } else {
                const data = await this.getData(`${this.state.currentUrl}&page=${this.state.currentPage}`);
                resultsToRender = data.results;
                hasMorePages = data.page < data.total_pages;
                
                if (this.elements.filterSort.value === "name.asc" || this.elements.filterSort.value === "title.asc") {
                     resultsToRender.sort((a, b) => {
                         const nameA = a.title || a.name;
                         const nameB = b.title || b.name;
                         return nameA.localeCompare(nameB);
                     });
                }
            }

            const uniqueResults = resultsToRender.filter(item => {
                if (this.state.renderedIds.has(item.id)) {
                    return false; 
                }
                this.state.renderedIds.add(item.id); 
                return true; 
            });

            const html = uniqueResults.map(item => this.createCard(item, this.state.currentType)).join("");
            this.elements.resultsContainer.insertAdjacentHTML("beforeend", html);

            if (hasMorePages) {
                this.elements.loadMoreBtn.classList.remove("hidden");
            } else {
                this.elements.loadMoreBtn.classList.add("hidden");
            }

        } catch (err) {
            console.error(err);
        } finally {
            this.ui.toggleLoader(false);
            this.ui.toggleButtonLoader(false);
        }
    },

    showCategory: async function (type, title) {
        this.state.currentType = type;
        this.state.currentUrl = type === "person"
            ? `/person/popular?language=cs`
            : `/discover/${type}?language=cs`;

        this.elements.sectionTitle.textContent = title;
        this.elements.categoryView.classList.remove("hidden");
        this.elements.filterBar.classList.remove("hidden");
        this.updateFilterUI(type);

        await this.fetchMoreResults(true);
    },

    showSearch: async function (query) {
        this.state.currentType = "multi";
        this.state.currentUrl = `/search/multi?language=cs&query=${encodeURIComponent(query)}`;

        this.elements.sectionTitle.textContent = `Hledání: ${query}`;
        this.elements.categoryView.classList.remove("hidden");
        this.elements.filterBar.classList.add("hidden");

        await this.fetchMoreResults(true);
    },

    fetchMoreResults: async function (reset = false) {
        this.ui.toggleButtonLoader(true);
        
        if (reset) {
            this.state.currentPage = 1;
            this.elements.resultsContainer.innerHTML = "";
            
            if (!this.state.renderedIds) {
                this.state.renderedIds = new Set();
            } else {
                this.state.renderedIds.clear(); 
            }
        }

        if (!this.state.renderedIds) this.state.renderedIds = new Set();

        try {
            let resultsToRender = [];
            let hasMorePages = true;

            if (this.state.currentType === "person" && this.elements.filterSort.value === "name.asc") {
                
                const promises = [];
                const batchSize = 10; 
                const startPage = this.state.currentPage;

                for (let i = 0; i < batchSize; i++) {
                    promises.push(this.getData(`${this.state.currentUrl}&page=${startPage + i}`));
                }

                const responses = await Promise.all(promises);
                
                responses.forEach(data => {
                    if (data.results) resultsToRender.push(...data.results);
                });

                this.state.currentPage += batchSize;
                
                resultsToRender.sort((a, b) => a.name.localeCompare(b.name));

                const lastResponse = responses[responses.length - 1];
                hasMorePages = lastResponse && lastResponse.page < lastResponse.total_pages;

            } else {
                const data = await this.getData(`${this.state.currentUrl}&page=${this.state.currentPage}`);
                resultsToRender = data.results;
                hasMorePages = data.page < data.total_pages;
                
                if (this.elements.filterSort.value === "name.asc" || this.elements.filterSort.value === "title.asc") {
                     resultsToRender.sort((a, b) => {
                         const nameA = a.title || a.name;
                         const nameB = b.title || b.name;
                         return nameA.localeCompare(nameB);
                     });
                }
            }

            const uniqueResults = [];
            
            for (const item of resultsToRender) {
                const safeId = String(item.id);

                if (!this.state.renderedIds.has(safeId)) {
                    this.state.renderedIds.add(safeId);
                    uniqueResults.push(item);
                }
            }

            const html = uniqueResults.map(item => this.createCard(item, this.state.currentType)).join("");
            this.elements.resultsContainer.insertAdjacentHTML("beforeend", html);

            if (hasMorePages) {
                this.elements.loadMoreBtn.classList.remove("hidden");
            } else {
                this.elements.loadMoreBtn.classList.add("hidden");
            }

        } catch (err) {
            console.error(err);
        } finally {
            this.ui.toggleLoader(false);
            this.ui.toggleButtonLoader(false);
        }
    },

    fillFilterYears: function () {
        const currentYear = new Date().getFullYear() + 1;
        let opts = "<option value=>Všechny roky</option>";
        for (let y = currentYear; y >= 1980; y--) opts += `<option value="${y}">${y}</option>`;
        this.elements.filterYear.innerHTML = opts;
    },

    updateFilterUI: function (type) {
        const e = this.elements;
        e.filterSort.innerHTML = "";

        if (type === "person") {
            e.filterGenre.classList.add("hidden");
            e.filterYear.classList.add("hidden");
            e.filterSort.innerHTML = "<option value=popularity.desc>Nejpopulárnější</option><option value=name.asc>Abecedně (A-Z)</option>";
        } else {
            e.filterGenre.classList.remove("hidden");
            e.filterYear.classList.remove("hidden");

            const genres = type === "movie" ? this.state.movieGenres : this.state.tvGenres;
            e.filterGenre.innerHTML = "<option value=''>Všechny žánry</option>" + genres.map(g => `<option value="${g.id}">${g.name}</option>`).join("");

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

        if (type === "person") {
            this.state.currentUrl = `/person/popular?language=cs`;
        } else {
            let url = `/discover/${type}?language=cs&sort_by=${sort}`;
            if (genre) url += `&with_genres=${genre}`;
            if (year) url += type === "movie" ? `&primary_release_year=${year}` : `&first_air_date_year=${year}`;
            this.state.currentUrl = url;
        }

        this.fetchMoreResults(true);
    },

    ui: {
        toggleLoader: function (show) {
            const loader = App.elements.loader;
            if (show) loader.classList.remove("hidden");
            else loader.classList.add("hidden");
        },

        toggleButtonLoader: function (show) {
            const btn = App.elements.loadMoreBtn;
            if (show) {
                btn.innerHTML = "<div class=btn-spinner></div> Načítání...";
                btn.disabled = true;
            } else {
                btn.innerHTML = "Načíst další";
                btn.disabled = false;
            }
        },

        hideAllSections: function () {
            App.elements.mainContent.classList.add("hidden");
            App.elements.categoryView.classList.add("hidden");
            App.elements.detailContainer.classList.add("hidden");
            App.elements.filterBar.classList.add("hidden");
        },

        showModal: function (title, bodyHtml, confirmCallback = null, showCancel = true) {
            const e = App.elements;
            e.modalTitle.textContent = title;
            e.modalBody.innerHTML = bodyHtml;
            App.state.pendingModalAction = confirmCallback;

            e.modalBtnCancel.style.display = showCancel ? "block" : "none";
            e.modalOverlay.classList.remove("hidden");
        },
        hideModal: function () {
            App.elements.modalOverlay.classList.add("hidden");
            App.state.pendingModalAction = null;
        },
        showAlert: function (msg) {
            this.showModal("Info", `<p>${msg}</p>`, null, false);
        },
        showConfirm: function (msg, onConfirm) {
            this.showModal("Potvrzení", `<p>${msg}</p>`, onConfirm, true);
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

document.addEventListener("DOMContentLoaded", () => {
    App.init();
});