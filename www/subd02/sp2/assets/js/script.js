const WeatherApp = {
    config: {
        geoApiUrl: "https://geocoding-api.open-meteo.com/v1/search",
        weatherApiUrl: "https://api.open-meteo.com/v1/forecast",
        maxSuggestions: 5,
        selectors: {
            searchInput: "#city-input",
            locateBtn: "#locate-btn",
            dateInfo: ".date-info",
        }
    },

    init: function () {
        console.log("App initialized.");
        this.initSearch();
        this.bindEvents();
    },

    bindEvents: function () {
        const self = this;

        $(this.config.selectors.locateBtn).on("click", function () {
            self.handleGeoLocation();
        });
    },

    handleGeoLocation: function () {
        console.log("Geoloc click");
        const self = this;

        if (!navigator.geolocation) {
            alert("Your browser doesnt support geolocation");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                console.log(lat, lon);

                const locationData = {
                    lat: lat,
                    lon: lon
                };

                self.handleCitySelect(locationData);
            },
            function (error) {
                console.log("Error: ", error);
            }
        );
    },

    initSearch: function () {
        const self = this;
        const $input = $(this.config.selectors.searchInput);

        if ($input.length === 0) {
            return;
        }

        $input.autocomplete({
            minLength: 2,
            delay: 300,
            source: function (request, response) {
                self.fetchCities(request.term, response);
            },
            select: function (event, ui) {
                $(this).val(ui.item.city);
                self.handleCitySelect(ui.item);
                return false;
            }
        });

        const instance = $input.autocomplete("instance");

        if (instance) {
            instance._renderItem = function (ul, item) {
                return self.renderSearchItem(ul, item);
            };
        } else {
            console.warn("Failed to obtain autocomplete instance");
        }
    },

    fetchCities: function (term, responseCallback) {
        $.ajax({
            url: this.config.geoApiUrl,
            dataType: "json",
            data: {
                name: term,
                count: this.config.maxSuggestions,
            },
            success: function (data) {
                if (!data.results) {
                    responseCallback([]);
                    return;
                }

                const formattedData = data.results.map(item => ({
                    city: item.name,
                    value: item.name,
                    lat: item.latitude,
                    lon: item.longitude,
                    country: item.country,
                    admin1: item.admin1
                }));

                responseCallback(formattedData);
            },
            error: function (err) {
                console.error("Geocoding failed", err);
                responseCallback([]);
            }
        });
    },

    renderSearchItem: function (ul, item) {
        let locationText = item.city;
        if (item.admin1) locationText += `, <small>${item.admin1}</small>`;
        if (item.country) locationText += ` <span class="suggestion-country">(${item.country})</span>`;

        return $("<li>")
            .append(`<div>${locationText}</div>`)
            .appendTo(ul);
    },

    handleCitySelect: function (cityData) {
        console.log("Selected:", cityData);

        $(this.config.selectors.cityName).text(cityData.label);
        $(this.config.selectors.dateInfo).text("Loading data...");

        setTimeout(() => {
            $(this.config.selectors.dateInfo).text(
                `Weather loaded for coordinates: ${cityData.lat}, ${cityData.lon}`
            );
        }, 500);
    }
};

$(document).ready(function () {
    WeatherApp.init();
});
