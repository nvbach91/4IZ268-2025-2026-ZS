const MapController = (() => {
    let map = null;
    let routeLayer = null;
    let currentContainer = null;

    const ACTIVITY_COLORS = {
        Run: '#FC4C02',
        Ride: '#2E86DE',
        Walk: '#6ABF69',
        Hike: '#8E6BBE',
        Swimming: '#26C6DA',
        TrailRun: '#F57C00',
        MountainBikeRide: '#1565C0',
        Workout: '#E53973'
    };
    const DEFAULT_COLOR = '#757575';

    function init(containerId, defaultCenter = [50.0755, 14.4378], defaultZoom = 12) {
        if (map) {
            map.remove();
        }

        currentContainer = containerId;
        map = L.map(containerId).setView(defaultCenter, defaultZoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        routeLayer = L.featureGroup().addTo(map);
    }

    function moveToContainer(containerId) {
        if (!map || !containerId || currentContainer === containerId) return;

        const center = map.getCenter();
        const zoom = map.getZoom();

        map.remove();

        currentContainer = containerId;
        map = L.map(containerId).setView(center, zoom);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

        const existingLayers = routeLayer ? routeLayer.getLayers() : [];
        routeLayer = L.featureGroup().addTo(map);
        existingLayers.forEach(layer => {
            routeLayer.addLayer(layer);
        });

        setTimeout(() => map.invalidateSize(), 0);
    }

    function clearMap() {
        if (routeLayer) {
            routeLayer.clearLayers();
        }
    }

    function addPolyline(encodedPolyline, options = {}) {
        try {
            const defaultOptions = {
                color: DEFAULT_COLOR,
                weight: 2,
                opacity: 0.6,
                ...options
            };

            const coords = L.polyline(polyline.decode(encodedPolyline), defaultOptions);

            if (routeLayer) {
                coords.addTo(routeLayer);
            }

            return coords;
        } catch (error) {
            console.error('Error adding polyline:', error);
            return null;
        }
    }

    function drawActivities(activities = true) {
        clearMap();
        const polylines = [];

        activities.forEach(activity => {
            if (!activity.map || !activity.map.summary_polyline) {
                return;
            }

            const polyline = addPolyline(activity.map.summary_polyline, {
                color: getColorForActivityType(activity.type),
                weight: 3,
                opacity: 0.65
            });

            if (polyline) {
                polyline.activityId = activity.id;
                polylines.push(polyline);
            }
        });

        if (polylines.length > 0) {
            fitToRoutes();
        }

        return polylines;
    }

    function fitToRoutes() {
        if (!routeLayer && map) return;

        const bounds = routeLayer.getBounds();
        if (!bounds.isValid()) return;

        map.invalidateSize();
        map.fitBounds(bounds, {padding: [50, 50]});
    }

    function getColorForActivityType(type) {
        return ACTIVITY_COLORS[type] || DEFAULT_COLOR;
    }

    function invalidateSize() {
        if (map) {
            map.invalidateSize();
        }
    }

    return {
        init,
        moveToContainer,
        clearMap,
        addPolyline,
        drawActivities,
        fitToRoutes,
        getColorForActivityType,
        invalidateSize,
    };
})();
