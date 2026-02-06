document.addEventListener("DOMContentLoaded", () => {

    let map = null;
    let isProcessing = false;
    let searchTimeout = null;

    const STORAGE_KEY = "pinsData";
    const LISTS_STORAGE_KEY = "travelListsData";
    const sectionMap = document.getElementById("section-map");
    const appContainer = document.getElementById("App");
    const searchForm = document.getElementById("search-form");
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");
    const navCountTrips = document.getElementById("nav-count-trips");
    const navCountLists = document.getElementById("nav-count-lists");
    const mapSpinner = document.getElementById("map-spinner");

    let pinsData = [];
    let listsData = [];
    let activeListIds = [];
    let markersById = {};

    const createId = () => `pin_${self.crypto.randomUUID()}`;

    const showAlert = (message, type = "warning") => {
        const icon = type === "danger" ? "error" : type;
        Swal.fire({
            toast: true,
            position: 'top-end',
            icon: icon,
            title: message,
            showConfirmButton: false,
            timer: 2500,
            timerProgressBar: true
        });
    };

    const updateNavCounts = () => {
        if (navCountTrips) navCountTrips.textContent = `(${pinsData.length})`;

        if (navCountLists) {
            const customListsCount = listsData.filter(l => l.id !== "list_default").length;
            navCountLists.textContent = `(${customListsCount})`;
        }
    };

    //LOCAL STORAGE
    const loadData = () => {
        pinsData = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        listsData = JSON.parse(localStorage.getItem(LISTS_STORAGE_KEY)) || [{ id: "list_default", name: "Výchozí seznam" }];
        updateNavCounts();
    };

    const saveData = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsData));
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(listsData));
    };

    //DATA
    const addPinData = (pin) => {
        pinsData.push(pin);
        saveData();
        updateNavCounts();
    };

    const removePinData = (id) => {
        if (markersById[id]) {
            map.removeLayer(markersById[id]);
            delete markersById[id];
        }
        pinsData = pinsData.filter(p => p.id !== id);
        saveData();
        updateNavCounts();
    };

    const togglePinInList = (pinId, listId) => {
        const pin = pinsData.find(p => p.id === pinId);
        if (!pin) return;
        if (pin.listIds.includes(listId)) {
            pin.listIds = pin.listIds.filter(id => id !== listId);
            if (pin.listIds.length === 0) pin.listIds.push("list_default");
        } else {
            if (pin.listIds.length === 1 && pin.listIds[0] === "list_default") {
                pin.listIds = [listId];
            } else {
                pin.listIds.push(listId);
            }
        }
        saveData();
    };

    const getPinBadgesHtml = (pin) => {
        return listsData
            .filter(l => pin.listIds.includes(l.id) && l.id !== "list_default")
            .map(l => `<span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill me-1">${l.name}</span>`)
            .join("");
    };

    //MAP
    const addMarker = (pin) => {
        const marker = L.marker([pin.lat, pin.lng]).addTo(map);
        markersById[pin.id] = marker;
        const popupHtml = `
            <div class="text-center">
                <strong>${pin.location}</strong><br>
                <small>${pin.country || ""}</small>
                <button class="btn btn-sm btn-danger w-100 mt-2 btn-delete-marker" data-id="${pin.id}">Smazat</button>
            </div>
        `;
        marker.bindPopup(popupHtml);
    };

    const handleLocationAdd = async (lat, lng) => {
        if (isProcessing) return;
        isProcessing = true;
        if (mapSpinner) mapSpinner.classList.remove("d-none");
        try {
            const exists = pinsData.some(p => Math.abs(p.lat - lat) < 0.0001 && Math.abs(p.lng - lng) < 0.0001);
            if (exists) {
                showAlert("Tady už bod máš.");
                return;
            }
            const res = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const addr = res.data.address || {};
            const displayName = res.data.display_name;
            const name = displayName ? displayName.split(",")[0] : "Označené místo";
            const newPin = {
                id: createId(),
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                location: name,
                country: addr.country,
                note: "",
                listIds: ["list_default"]
            };
            addPinData(newPin);
            addMarker(newPin);
            setTimeout(() => {
                if (markersById[newPin.id]) markersById[newPin.id].openPopup();
            }, 100);
        } catch (err) {
            showAlert("Nepodařilo se získat adresu místa.", "danger");
        } finally {
            isProcessing = false;
            if (mapSpinner) mapSpinner.classList.add("d-none");
        }
    };

    const initMap = () => {
        map = L.map("map").setView([49.8, 15.5], 7);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
            attribution: "© OpenStreetMap"
        }).addTo(map);

        pinsData.forEach(pin => addMarker(pin));

        map.on("click", async (e) => {
            await handleLocationAdd(e.latlng.lat, e.latlng.lng);
        });

        map.on("popupopen", (e) => {
            const btn = e.popup._contentNode.querySelector(".btn-delete-marker");
            if (btn) {
                btn.onclick = () => {
                    Swal.fire({
                        title: 'Opravdu smazat?',
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: 'red',
                        cancelButtonColor: 'blue',
                        confirmButtonText: 'Ano, smazat!',
                        cancelButtonText: 'Zrušit'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            removePinData(btn.dataset.id);
                            Swal.fire(
                                'Smazáno!',
                                'Místo bylo odstraněno.',
                                'success'
                            )
                        }
                    })
                };
            }
        });
    };

    //SEARCH
    const searchLocation = async () => {
        const query = searchInput.value.trim();
        if (!query) {
            searchResults.innerHTML = "";
            return;
        }

        searchResults.innerHTML = '<div class="list-group-item text-muted small"><span class="spinner-border spinner-border-sm me-2"></span>Hledám...</div>';

        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: { q: query, format: "json", addressdetails: 1, limit: 5 }
            });

            if (res.data.length === 0) {
                searchResults.innerHTML = '<div class="list-group-item text-muted small">Nic nenalezeno</div>';
                return;
            }

            const htmlContent = res.data.map(place => {
                const displayName = place.display_name;
                const mainName = displayName.split(",")[0];
                const detailName = displayName.substring(displayName.indexOf(",") + 1);
                return `
                <button class="list-group-item list-group-item-action btn-select-search-result" 
                    data-lat="${place.lat}" 
                    data-lon="${place.lon}">
                    <div class="d-flex align-items-center pointer-events-none">
                        <i class="bi bi-geo-alt me-2 text-danger"></i>
                        <div class="text-truncate">
                            <strong>${mainName}</strong>
                            <small class="d-block text-muted text-truncate search-result-subtext">${detailName}</small>
                        </div>
                    </div>
                </button>
                `;
            }).join("");
            searchResults.innerHTML = htmlContent;

        } catch (err) {
            searchResults.innerHTML = '<div class="list-group-item text-danger small">Chyba při hledání</div>';
        }
    };

    //TRIPS
    const getTripsView = () => {
        if (pinsData.length === 0) return `<div class="text-center py-5 text-muted"><h4>Zatím žádné destinace k navštívení</h4><p>Klikni do mapy nebo použij hledání pro přidání prvního cíle.</p></div>`;
        return `
            <div class="row g-3">
                ${pinsData.map(pin => {
            const customLists = listsData.filter(l => l.id !== "list_default");
            let listsDropdown = customLists.length > 0
                ? customLists.map(l => {
                    const active = pin.listIds.includes(l.id);
                    return `<li><button class="dropdown-item btn-toggle-list" data-pin="${pin.id}" data-list="${l.id}">
                                <i class="bi ${active ? 'bi-check-square-fill text-primary' : 'bi-square text-muted'} me-2"></i>${l.name}
                            </button></li>`;
                }).join("")
                : `<li><span class="dropdown-item-text text-muted small">Nemáš vlastní seznamy</span></li>`;

            const badges = getPinBadgesHtml(pin);

            return `
                    <div class="col-md-6 col-lg-4">
                        <div class="card h-100 shadow-sm border-0">
                            <div class="card-body">
                                <div class="d-flex justify-content-between mb-2">
                                    <h5 class="card-title mb-0 btn-locate-pin" data-id="${pin.id}" title="Ukázat na mapě">${pin.location}</h5>
                                    <div class="dropdown">
                                        <button class="btn btn-light btn-sm rounded-circle" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                                        <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                            <li><h6 class="dropdown-header">Seznamy</h6></li>
                                            ${listsDropdown}
                                            <li><hr class="dropdown-divider"></li>
                                            <li><button class="dropdown-item text-danger btn-delete-trip" data-id="${pin.id}"><i class="bi bi-trash me-2"></i>Smazat</button></li>
                                        </ul>
                                    </div>
                                </div>
                                <small class="text-muted d-block mb-2">${pin.country || "Svět"}</small>
                                <textarea class="form-control bg-light border-0 small mb-2 input-note" data-id="${pin.id}" rows="2" placeholder="Poznámka...">${pin.note || ""}</textarea>
                                <div class="mt-2">${badges}</div>
                            </div>
                        </div>
                    </div>`;
        }).join("")}
            </div>
        `;
    };

    //Lists
    const renderListItems = (pins, listId) => {
        if (pins.length === 0) return '<small class="text-muted">Prázdný seznam</small>';
        return pins.map(p => `
            <div class="d-flex justify-content-between align-items-center py-1 border-bottom">
                <span class="btn-locate-pin" data-id="${p.id}" title="Ukázat na mapě">${p.location}</span>
                <button class="btn btn-sm text-danger btn-remove-from-list" data-pin="${p.id}" data-list="${listId}"><i class="bi bi-x-lg"></i></button>
            </div>
        `).join("");
    };

    const getListsView = () => {
        const customLists = listsData.filter(l => l.id !== "list_default");

        const listHtml = customLists.map(list => {

            const isOpen = activeListIds.includes(list.id);
            const pinsInList = pinsData.filter(p => p.listIds.includes(list.id));
            const listContentHtml = isOpen ? renderListItems(pinsInList, list.id) : "";

            return `
            <div class="list-group-item p-0 mb-3 border-0 shadow-sm">
                <div class="d-flex justify-content-between align-items-center p-3 bg-white border rounded btn-toggle-accordion" data-id="${list.id}">
                    <span class="fw-bold"><i class="bi ${isOpen ? 'bi-folder2-open' : 'bi-folder2'} me-2 text-primary"></i>${list.name}</span>
                    <div>
                        <span class="badge bg-secondary rounded-pill me-2">${pinsInList.length}</span>
                        <button class="btn btn-sm btn-outline-danger border-0 btn-delete-list" data-id="${list.id}"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
                <div class="list-content ${isOpen ? '' : 'd-none'} bg-light p-3 border-top" data-id="${list.id}">
                    ${listContentHtml}
                </div>
            </div>`;
        }).join("");

        return `
            <div class="card p-4 shadow-sm mb-4 border-0 bg-white">
                <label class="form-label fw-bold text-muted small">Vytvořit nový seznam</label>
                <form id="add-list-form" class="input-group">
                    <input type="text" id="new-list-name" class="form-control" placeholder="Např. Dovolená 2024...">
                    <button type="submit" class="btn btn-primary px-4 fw-bold">Vytvořit</button>
                </form>
            </div>
            <div class="list-group bg-transparent">${listHtml || '<p class="text-center text-muted mt-3">Žádné vlastní seznamy.</p>'}</div>
        `;
    };

    const handleListSubmit = (e) => {
        e.preventDefault();

        const input = document.getElementById("new-list-name");
        const newName = input.value.trim();

        if (!newName) {
            showAlert("Musíš zadat název seznamu.", "danger");
            return;
        }

        const exists = listsData.some(l => l.name.toLowerCase() === newName.toLowerCase());
        if (exists) {
            showAlert("Tento seznam už existuje.", "warning");
            return;
        }

        listsData.push({
            id: `list_${self.crypto.randomUUID()}`,
            name: newName
        });
        saveData();
        updateNavCounts();
        router();

        input.value = "";
    };

    //ROUTER
    const router = () => {
        const hash = window.location.hash || "#section-map";
        document.querySelectorAll(".nav-link").forEach(l => l.classList.remove("active"));
        const activeLink = document.querySelector(`.nav-link[data-link="${hash.replace('#', '')}"]`);
        if (activeLink) activeLink.classList.add("active");

        if (hash === "#section-map") {
            sectionMap.classList.remove("d-none");
            appContainer.classList.add("d-none");
            if (map) setTimeout(() => map.invalidateSize(), 100);
        } else {
            sectionMap.classList.add("d-none");
            appContainer.classList.remove("d-none");
            if (hash === "#section-trips") appContainer.innerHTML = getTripsView();
            else if (hash === "#section-lists") {
                appContainer.innerHTML = getListsView();
                const form = document.getElementById("add-list-form");
                if (form) form.addEventListener("submit", handleListSubmit);
            }
        }
    };

    //EVENT LISTENERS
    searchInput.addEventListener("input", (e) => {
        clearTimeout(searchTimeout);
        if (e.target.value.trim() === "") {
            searchResults.innerHTML = "";
            return;
        }
        searchTimeout = setTimeout(() => {
            searchLocation();
        }, 350);
    });

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        clearTimeout(searchTimeout);
        searchLocation();
    });


    document.body.addEventListener("click", (e) => {
        const t = e.target;

        if (t.classList.contains("nav-link")) {
            e.preventDefault();
            window.location.hash = t.dataset.link;
        }

        if (t.closest(".btn-delete-trip")) {
            const id = t.closest(".btn-delete-trip").dataset.id;
            Swal.fire({
                title: 'Opravdu smazat?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'red',
                cancelButtonColor: 'blue',
                confirmButtonText: 'Ano, smazat!',
                cancelButtonText: 'Ne'
            }).then((result) => {
                if (result.isConfirmed) {
                    removePinData(id);
                    router();
                    Swal.fire(
                        'Smazáno!',
                        'Destinace byla odstraněna.',
                        'success'
                    )
                }
            })
        }

        if (t.closest(".btn-toggle-list")) {
            e.preventDefault();
            e.stopPropagation();
            const btn = t.closest(".btn-toggle-list");
            togglePinInList(btn.dataset.pin, btn.dataset.list);
            const pin = pinsData.find(p => p.id === btn.dataset.pin);
            const isActive = pin.listIds.includes(btn.dataset.list);
            const icon = btn.querySelector("i");
            if (isActive) {
                icon.className = "bi bi-check-square-fill text-primary me-2";
            } else {
                icon.className = "bi bi-square text-muted me-2";
            }
            const cardBody = btn.closest(".card-body");
            const badgesContainer = cardBody.querySelector(".mt-2");
            if (badgesContainer) {
                badgesContainer.innerHTML = getPinBadgesHtml(pin);
            }
        }

        if (t.closest(".btn-toggle-accordion") && !t.closest(".btn-delete-list")) {
            const btn = t.closest(".btn-toggle-accordion");
            const id = btn.dataset.id;
            const contentDiv = btn.parentElement.querySelector(`.list-content[data-id="${id}"]`);
            const icon = btn.querySelector("i");

            if (activeListIds.includes(id)) {
                activeListIds = activeListIds.filter(listId => listId !== id);
                contentDiv.classList.add("d-none");
                icon.className = "bi bi-folder2 me-2 text-primary";
            } else {
                activeListIds.push(id);
                contentDiv.classList.remove("d-none");
                icon.className = "bi bi-folder2-open me-2 text-primary";

                if (contentDiv.innerHTML.trim() === "") {
                    const pinsInList = pinsData.filter(p => p.listIds.includes(id));
                    contentDiv.innerHTML = renderListItems(pinsInList, id);
                }
            }
        }

        if (t.closest(".btn-delete-list")) {
            e.stopPropagation();
            const id = t.closest(".btn-delete-list").dataset.id;

            Swal.fire({
                title: 'Opravdu smazat tento seznam?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: 'red',
                cancelButtonColor: 'blue',
                confirmButtonText: 'Ano, smazat!',
                cancelButtonText: 'Zrušit'
            }).then((result) => {
                if (result.isConfirmed) {
                    pinsData.forEach(p => {
                        p.listIds = p.listIds.filter(lid => lid !== id);
                        if (p.listIds.length === 0) p.listIds.push("list_default");
                    });
                    listsData = listsData.filter(l => l.id !== id);
                    saveData();
                    updateNavCounts();
                    router();
                    Swal.fire(
                        'Smazáno!',
                        'Seznam byl odstraněn.',
                        'success'
                    )
                }
            })
        }

        if (t.closest(".btn-remove-from-list")) {
            const btn = t.closest(".btn-remove-from-list");
            togglePinInList(btn.dataset.pin, btn.dataset.list);
            router();
        }

        if (t.closest(".btn-select-search-result")) {
            const btn = t.closest(".btn-select-search-result");
            const lat = parseFloat(btn.dataset.lat);
            const lon = parseFloat(btn.dataset.lon);

            map.setView([lat, lon], 14);
            handleLocationAdd(lat, lon);

            document.getElementById("search-results").innerHTML = "";
            document.getElementById("search-input").value = "";
        }

        if (t.classList.contains("btn-locate-pin")) {
            const id = t.dataset.id;
            const pin = pinsData.find(p => p.id === id);

            if (pin) {
                window.location.hash = "section-map";

                setTimeout(() => {
                    if (map) {
                        map.invalidateSize();
                        map.flyTo([pin.lat, pin.lng], 14, {
                            animate: true,
                            duration: 1.5
                        });

                        setTimeout(() => {
                            if (markersById[pin.id]) {
                                markersById[pin.id].openPopup();
                            }
                        }, 1600);
                    }
                }, 100);
            }
        }
    });

    document.addEventListener("change", (e) => {
        if (e.target.classList.contains("input-note")) {
            const pin = pinsData.find(p => p.id === e.target.dataset.id);
            if (pin) { pin.note = e.target.value; saveData(); }
        }
    });

    loadData();
    initMap();
    window.addEventListener("hashchange", router);
    router();
});