let map;

const STORAGE_KEY = "pinsData";

let pinsData = [];
let markersById = {};

const createId = () => {
    return "pin_" + Date.now() + "_" + Math.floor(Math.random() * 100000);
};

const loadPinsFromStorage = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    pinsData = saved ? JSON.parse(saved) : [];
};

const savePinsToStorage = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pinsData));
};

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

    marker.on("click", () => {
        removePin(pin.id);
    });
};

const renderPins = () => {
    pinsData.forEach((pin) => {
        addMarkerForPin(pin);
    });
};

const addPin = (lat, lng) => {
    const pin = {
        id: createId(),
        lat: lat,
        lng: lng
    };

    pinsData.push(pin);
    savePinsToStorage();
    addMarkerForPin(pin);
};

const initMap = () => {
    map = L.map("map").setView([50.08, 14.43], 5);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    loadPinsFromStorage();
    renderPins();

    map.on("click", (e) => {
        console.log("Klik na mapu:", e.latlng);
        addPin(e.latlng.lat, e.latlng.lng);
    });
};

$(document).ready(() => {
    initMap();
});