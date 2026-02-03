document.addEventListener("DOMContentLoaded", () => {

    let map;
    let isProcessing = false;

    const STORAGE_KEY = "pinsData";
    const LISTS_STORAGE_KEY = "travelListsData";

    let pinsData = [];
    let listsData = [];
    let markersById = {};

    const createId = () => {
        return "pin_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
    };

    // STORAGE

    const loadPinsFromStorage = () => {
        const saved = localStorage.getItem(STORAGE_KEY);
        pinsData = saved ? JSON.parse(saved) : [];
    };

    const savePinsToStorage = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsData));
    };

    const saveListsToStorage = () => {
        localStorage.setItem(LISTS_STORAGE_KEY, JSON.stringify(listsData));
    };

    const loadListsFromStorage = () => {
        const saved = localStorage.getItem(LISTS_STORAGE_KEY);
        listsData = saved ? JSON.parse(saved) : [
            { id: "list_default", name: "Výchozí seznam" }
        ];
    };

    // MAP

    const removePin = (pinId) => {
        const marker = markersById[pinId];
        if (marker) {
            map.removeLayer(marker);
            delete markersById[pinId];
        }

        pinsData = pinsData.filter((p) => p.id !== pinId);
        savePinsToStorage();
    };

    const addMarkerForPin = (pin) => {
        const marker = L.marker([pin.lat, pin.lng]).addTo(map);
        markersById[pin.id] = marker;

        const popupContent = `
            <div style="text-align: center; min-width: 160px;">
                <strong style="font-size: 1.1rem; color: #0d6efd;">${pin.location}</strong>
                <div class="text-muted small mb-1">${pin.country}</div>
                <button class="btn btn-danger btn-sm btn-delete-marker w-100" data-id="${pin.id}">
                    <i class="bi bi-trash"></i> Smazat
                </button>
            </div>
        `;

        marker.bindPopup(popupContent);
    };

    const openPin = (pinId) => {
        const marker = markersById[pinId];
        if (marker) {
            marker.openPopup();
        }
    };

    const renderPins = () => {
        pinsData.forEach((pin) => {
            addMarkerForPin(pin);
        });
    };

    const addPin = async (lat, lng, listId = "list_default") => {
        if (isProcessing) return;

        const isDuplicate = pinsData.some(p =>
            Math.abs(p.lat - lat) < 0.01 && Math.abs(p.lng - lng) < 0.01
        );

        if (isDuplicate) {
            showAlert("Tady už pin máš. Zkus to o kousek dál.");
            return;
        }

        isProcessing = true;

        try {
            const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                params: {
                    lat: lat,
                    lon: lng,
                    format: "json",
                    addressdetails: 1
                }
            });

            const address = response.data.address || {};
            const locationName = address.tourism || address.amenity || address.historic || 
                                 address.road || address.city || address.town || 
                                 address.village || "Neznámá lokalita";
            const country = address.country || "";

            const pin = {
                id: createId(),
                lat: lat,
                lng: lng,
                location: locationName,
                country: country,
                listId: listId,
                note: ""
            };

            pinsData.push(pin);
            savePinsToStorage();
            addMarkerForPin(pin);
            openPin(pin.id);

        } catch (error) {
            showAlert("Nepodařilo se zjistit název místa, ale pin byl přidán.", "danger");
        } finally {
            setTimeout(() => {
                isProcessing = false;
            }, 500);
        }
    };

    const initMap = () => {
        map = L.map("map").setView([50.08, 14.43], 5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 18,
            attribution: "&copy; OpenStreetMap contributors"
        }).addTo(map);

        renderPins();

        map.on("click", (e) => {
            addPin(e.latlng.lat, e.latlng.lng);
        });
        
        map.on("popupopen", (e) => {
            const deleteBtn = e.popup._contentNode.querySelector(".btn-delete-marker");
            if (deleteBtn) {
                deleteBtn.addEventListener("click", () => {
                    const pinId = deleteBtn.dataset.id;
                    removePin(pinId);
                });
            }
        });
    };

    // NAV

    const initNavigation = () => {
        document.querySelectorAll(".nav-link").forEach(link => {
            link.addEventListener("click", (e) => {
                const targetSectionId = e.currentTarget.dataset.link;
                if (!targetSectionId) return;

                e.preventDefault();
                window.location.hash = targetSectionId;
            });
        });

        window.addEventListener("hashchange", handleNavigation);
        handleNavigation();
    };

    const handleNavigation = () => {
        const hash = window.location.hash || "#section-map";
        const targetSectionId = hash.replace("#", "");

        document.querySelectorAll(".page-section").forEach(sec => sec.classList.add("d-none"));
        const targetEl = document.getElementById(targetSectionId);
        if (targetEl) targetEl.classList.remove("d-none");

        document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));
        const activeLink = document.querySelector(`.nav-link[data-link="${targetSectionId}"]`);
        if (activeLink) activeLink.classList.add("active");

        if (targetSectionId === "section-map" && map) {
            setTimeout(() => map.invalidateSize(), 200);
        }
        if (targetSectionId === "section-trips") {
            renderTripsList();
        }
        if (targetSectionId === "section-lists") {
            showLists();
        }
    };

    // CREATE TRIPS

    const createTripCard = (pin) => {
        let listItemsHtml = "";
        const customLists = listsData.filter(l => l.id !== "list_default");

        if (customLists.length > 0) {
            listItemsHtml += `<li><h6 class="dropdown-header">Přidat do / Odebrat</h6></li>`;
            listItemsHtml += customLists.map(list => {
                const isActive = pin.listId === list.id;
                const btnClass = isActive ? "active" : "";
                const icon = isActive ? '<i class="bi bi-check-lg me-2"></i>' : '<i class="bi bi-folder2 me-2"></i>';

                return `
                    <li>
                        <button class="dropdown-item btn-move-pin ${btnClass}" data-id="${pin.id}" data-list="${list.id}">
                            ${icon}${list.name}
                        </button>
                    </li>
                `;
            }).join("");
            listItemsHtml += `<li><hr class="dropdown-divider"></li>`;
        } else {
            listItemsHtml += `<li><span class="dropdown-item-text text-muted small">Nemáš žádné seznamy</span></li><li><hr class="dropdown-divider"></li>`;
        }

        return `
            <div class="col-md-4 col-sm-6">
                <div class="card h-100 shadow-sm border-0 trip-card">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h5 class="card-title fw-bold text-dark mb-0">${pin.location}</h5>
                                <small class="text-muted"><i class="bi bi-geo-alt-fill text-danger me-1"></i>${pin.country || "Svět"}</small>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-light btn-sm rounded-circle" type="button" data-bs-toggle="dropdown">
                                    <i class="bi bi-three-dots-vertical"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                    ${listItemsHtml}
                                    <li>
                                        <button class="dropdown-item text-danger btn-delete-trip" data-id="${pin.id}">
                                            <i class="bi bi-trash me-2"></i>Smazat výlet
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div class="mt-3 flex-grow-1">
                            <label class="small text-muted fw-bold mb-1">Poznámka:</label>
                            <textarea class="form-control bg-light border-0 input-pin-note" 
                                      data-id="${pin.id}" 
                                      style="resize: none; font-size: 0.9rem; border-radius: 8px;" 
                                      rows="3" 
                                      placeholder="Např. musím vidět...">${pin.note || ""}</textarea>
                        </div>
                        ${pin.listId !== "list_default" 
                            ? `<div class="mt-3 pt-2 border-top">
                                 <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill">
                                    <i class="bi bi-folder-fill me-1"></i>${listsData.find(l => l.id === pin.listId)?.name || "Seznam"}
                                 </span>
                               </div>` 
                            : ""}
                    </div>
                </div>
            </div>
        `;
    };

    const renderTripsList = () => {
        const tripsContainer = document.getElementById("trips-list");
        if (pinsData.length === 0) {
            tripsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-map text-muted" style="font-size: 48px;"></i>
                    <h4 class="text-muted mt-3">Zatím žádné výlety</h4>
                    <p class="text-muted">Klikni do mapy nebo použij hledání pro přidání prvního cíle.</p>
                </div>
            `;
            return;
        }
        tripsContainer.innerHTML = pinsData.map(pin => createTripCard(pin)).join("");
    };

    const updatePinNote = (pinId, newNote) => {
        const pin = pinsData.find(p => p.id === pinId);
        if (pin) {
            pin.note = newNote;
            savePinsToStorage();
        }
    };

    // SEARCH

    const searchLocation = async () => {
        const searchInput = document.getElementById("search-input");
        const query = searchInput.value.trim();
        const resultsContainer = document.getElementById("search-results");
        const loader = document.getElementById("search-loader");

        if (!query) return;
        
        loader.classList.remove("d-none");
        resultsContainer.innerHTML = "";

        try {
            const response = await axios.get("https://nominatim.openstreetmap.org/search", {
                params: { q: query, format: "json", addressdetails: 1, limit: 5 }
            });

            if (response.data.length === 0) {
                // Zde musíme escapovat vnitřní uvozovky, pokud chceme vnější dvojité
                resultsContainer.innerHTML = "<div class=\"alert alert-warning\">Nic jsme nenašli.</div>";
                return;
            }

            resultsContainer.innerHTML = response.data.map(place => `
                <button class="list-group-item list-group-item-action btn-select-location" 
                    data-lat="${place.lat}" 
                    data-lon="${place.lon}">
                    <i class="bi bi-geo-alt"></i> ${place.display_name}
                </button>
            `).join("");

        } catch (error) {
            resultsContainer.innerHTML = "<div class=\"alert alert-danger\">Chyba komunikace s API.</div>";
        } finally {
            loader.classList.add("d-none");
        }
    };

    const selectLocation = (lat, lng) => {
        window.location.hash = "section-map";
        map.setView([lat, lng], 13);
        addPin(lat, lng, "list_default");

        document.getElementById("search-results").innerHTML = "";
        document.getElementById("search-input").value = "";
    };

    // LISTS

    const showLists = () => {
        const container = document.getElementById("lists-container");
        const customLists = listsData.filter(list => list.id !== "list_default");

        if (customLists.length === 0) {
            container.innerHTML = "<p class=\"text-muted text-center py-3\">Zatím nemáš žádné vlastní seznamy.</p>";
            return;
        }

        container.innerHTML = customLists.map(list => {
            const pinsInList = pinsData.filter(pin => pin.listId === list.id);
            const pinsHtml = pinsInList.length > 0 
                ? pinsInList.map(pin => `
                    <li class="d-flex justify-content-between align-items-center mb-2">
                        <span><i class="bi bi-geo-alt small me-2"></i>${pin.location}</span>
                        <button class="btn btn-sm text-danger btn-remove-from-list" data-id="${pin.id}">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </li>
                `).join("")
                : "<li class=\"text-muted small\">Tento seznam je prázdný.</li>";

            return `
                <div class="list-group-item p-0 border-bottom">
                    <div class="d-flex justify-content-between align-items-center p-3 btn-list-toggle" 
                         style="cursor: pointer;" data-target="details-${list.id}">
                        <span class="fw-bold"><i class="bi bi-folder2-open me-2 text-primary"></i>${list.name}</span>
                        <div>
                            <span class="badge bg-secondary rounded-pill me-2">${pinsInList.length}</span>
                            <button class="btn btn-sm btn-outline-danger border-0 btn-delete-list" data-id="${list.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div id="details-${list.id}" class="bg-light p-3 d-none border-top">
                        <ul class="list-unstyled mb-0">${pinsHtml}</ul>
                    </div>
                </div>
            `;
        }).join("");
    };

    const addList = () => {
        const input = document.getElementById("list-name-input");
        const name = input.value.trim();
        
        if (!name) {
            showAlert("Musíš zadat název seznamu.");
            return;
        }

        if (name.length > 40) {
            showAlert("Název seznamu je příliš dlouhý (max 40 znaků).");
            return;
        }

        const isDuplicate = listsData.some(list => list.name && list.name.toLowerCase() === name.toLowerCase());
        if (isDuplicate) {
            showAlert("Tento seznam už existuje.");
            return;
        }

        listsData.push({ id: "list_" + Date.now(), name: name });
        saveListsToStorage();
        showLists();
        input.value = "";
    };

    const deleteList = (listId) => {
        if (listId === "list_default") return;
        pinsData.forEach(pin => {
            if (pin.listId === listId) pin.listId = "list_default";
        });
        listsData = listsData.filter(list => list.id !== listId);
        savePinsToStorage();
        saveListsToStorage();
        showLists();
    };

    const movePinToList = (pinId, newListId) => {
        const pin = pinsData.find(p => p.id === pinId);
        if (pin) {
            pin.listId = newListId;
            savePinsToStorage();
        }
    };

    const showAlert = (message, type = "warning") => {
        const container = document.getElementById("alert-container");
        const div = document.createElement("div");
        div.className = `alert alert-${type} alert-dismissible fade show shadow`;
        div.role = "alert";
        div.innerHTML = `
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        container.appendChild(div);

        setTimeout(() => {
            if (div && div.parentNode) {
                const bsAlert = bootstrap.Alert.getOrCreateInstance(div);
                bsAlert.close();
            }
        }, 3000);
    };

    // INIT

    loadListsFromStorage();
    loadPinsFromStorage();
    initMap(); 
    initNavigation();

    document.getElementById("search-form").addEventListener("submit", (e) => {
        e.preventDefault();
        searchLocation();
    });

    document.getElementById("add-list-button").addEventListener("click", addList);

    document.getElementById("search-results").addEventListener("click", (e) => {
        const target = e.target.closest(".btn-select-location");
        if (target) {
            selectLocation(target.dataset.lat, target.dataset.lon);
        }
    });

    document.getElementById("trips-list").addEventListener("click", (e) => {
        const deleteBtn = e.target.closest(".btn-delete-trip");
        if (deleteBtn) {
            removePin(deleteBtn.dataset.id);
            renderTripsList();
            return;
        }

        const moveBtn = e.target.closest(".btn-move-pin");
        if (moveBtn) {
            const pinId = moveBtn.dataset.id;
            const targetListId = moveBtn.dataset.list;
            const pin = pinsData.find(p => p.id === pinId);
            if (!pin) return;
            const newListId = (pin.listId === targetListId) ? "list_default" : targetListId;
            movePinToList(pinId, newListId);
            renderTripsList();
        }
    });

    document.getElementById("trips-list").addEventListener("change", (e) => {
        if (e.target.classList.contains("input-pin-note")) {
            updatePinNote(e.target.dataset.id, e.target.value);
        }
    });

    document.getElementById("lists-container").addEventListener("click", (e) => {
        const toggleBtn = e.target.closest(".btn-list-toggle");
        const deleteListBtn = e.target.closest(".btn-delete-list");
        const removePinBtn = e.target.closest(".btn-remove-from-list");

        if (toggleBtn && !deleteListBtn) {
            const targetId = toggleBtn.dataset.target;
            document.getElementById(targetId).classList.toggle("d-none");
        } else if (deleteListBtn) {
            e.stopPropagation();
            deleteList(deleteListBtn.dataset.id);
        } else if (removePinBtn) {
            movePinToList(removePinBtn.dataset.id, "list_default");
            showLists();
        }
    });
});