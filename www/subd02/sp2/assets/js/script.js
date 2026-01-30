class WeatherApp {
    constructor() {
        this.geoApiUrl = "https://geocoding-api.open-meteo.com/v1/search";
        this.weatherApiUrl = "https://api.open-meteo.com/v1/forecast";
        this.maxSuggestions = 50;

        this.selectors = {
            searchInput: "#city-input",
            locateBtn: "#locate-btn",
            mainContent: "#main-content",
            favList: "#fav-list",
            alertContainer: "#alert-container"
        };

        this.weatherParams = {
            current: "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,wind_speed_10m",
            daily: "temperature_2m_min,temperature_2m_max,precipitation_probability_mean",
            hourly: "temperature_2m,precipitation_probability",
            timezone: "auto"
        };

        this.charts = {
            daily: null,
            hourly: null
        };
        this.chartMode = 'temperature';

        this.selectedCity = null;
        this.lastWeatherData = null;

        this.isLoading = false;
        this.sortState = 'default';

        this.elements = {
            searchInput: $(this.selectors.searchInput),
            locateBtn: $(this.selectors.locateBtn),
            mainContent: $(this.selectors.mainContent),
            favList: $(this.selectors.favList),
            alertContainer: $(this.selectors.alertContainer),
            menuToggle: $("#menu-toggle"),
            btnSearch: $(".btn-search"),
            searchWrapper: $(".search-wrapper"),
            btnMenu: $(".btn-menu"),
            aside: $("aside"),
            menuOverlay: $(".menu-overlay"),
            btnClose: $("#btn-close"),
            sortBtn: $("#sort-btn"),
            sortIcon: $("#sort-btn i"),
            confirmModal: $("#confirm-modal"),
            confirmYes: $("#confirm-yes"),
            confirmCancel: $("#confirm-cancel"),
            confirmMessage: $("#confirm-message")
        };

        this.init();
    }

    init() {
        this.initSearch();
        this.bindEvents();
        this.renderFavoritesList();
        this.loadStateFromUrl();
    }

    bindEvents() {
        this.elements.locateBtn.on("click", () => {
            this.handleGeoLocation();
        });

        this.elements.btnSearch.on("click", () => {
            this.manualSearch();
        });

        this.elements.searchInput.on("keypress", (e) => {
            if (e.which === 13) {
                this.manualSearch();
                e.preventDefault();
                this.elements.searchInput.autocomplete("close");
            }
        });

        window.addEventListener("popstate", () => {
            this.loadStateFromUrl();
        });

        $(document).on("click", "#favorite-btn", () => {
            this.toggleFavorite();
        });

        const app = this;

        $(document).on("click", ".fav-item", function (e) {
            if ($(e.target).closest(".btn-remove-fav").length > 0) return;

            const selectedCityLabel = $(this).data("label");
            const selectedCityData = app.getFavorites().find(city => city.label === selectedCityLabel);

            app.handleCitySelect(selectedCityData);
            app.closeMenu();
        });

        $(document).on("click", ".btn-remove-fav", function (e) {
            e.stopPropagation();
            const li = $(this).closest(".fav-item");
            const cityLabel = li.data("label");

            app.showConfirmModal(`Are you sure you want to remove ${cityLabel} from favorites?`, () => {
                let favorites = app.getFavorites();
                favorites = favorites.filter(city => city.label !== cityLabel);
                localStorage.setItem("favorites", JSON.stringify(favorites));

                app.renderFavoritesList();
                app.showAlert(`Removed ${cityLabel} from favorites.`);

                if (app.selectedCity && app.selectedCity.label === cityLabel) {
                    $(".btn-fav i").removeClass("fa-solid").removeClass("favorite").addClass("fa-regular");
                }
            });
        });

        $(document).on("click", ".chart-tab", (e) => {
            if (this.isLoading) return;

            const target = $(e.currentTarget);
            const mode = target.data("mode");

            this.chartMode = mode;

            $(".chart-tab").removeClass("active");
            target.addClass("active");

            if (this.lastWeatherData) {
                this.renderCharts(this.lastWeatherData);
            }
        });

        this.elements.menuToggle.on("click", () => {
            this.elements.aside.addClass("active");
            this.elements.menuOverlay.addClass("active");
            $("body").css("overflow", "hidden");
        });

        this.elements.menuOverlay.on("click", () => {
            this.closeMenu();
        });

        this.elements.btnClose.on("click", () => {
            this.closeMenu();
        });

        this.elements.sortBtn.on("click", () => {
            this.toggleSort();
        });
    }

    loadStateFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        const cityParam = urlParams.get('city');

        if (cityParam) {
            this.fetchCities(cityParam, (results) => {
                if (results && results.length > 0) {
                    const bestMatch = results[0];
                    this.handleCitySelect(bestMatch, false);
                }
            });
        }
    }

    showAlert(message) {
        const $container = this.elements.alertContainer;
        const alertHtml = `
            <div class="alert">
                <i class="fa-solid fa-circle-info"></i>
                <span>${message}</span>
            </div>
        `;

        const $alert = $(alertHtml).appendTo($container);

        setTimeout(() => {
            $alert.css('animation', 'fadeOut 0.3s forwards');
            setTimeout(() => {
                $alert.remove();
            }, 300);
        }, 2000);
    }

    handleGeoLocation() {
        if (!navigator.geolocation) {
            this.showAlert("Your browser doesn't support geolocation");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;

                const locationData = {
                    label: "Your location",
                    lat: lat,
                    lon: lon
                };
                this.handleCitySelect(locationData);
            },
            (error) => {
                console.warn("Error: ", error);
                this.showAlert("Location access denied or unavailable.");
            }
        );
    }

    manualSearch() {
        const term = this.elements.searchInput.val();

        if (term.length < 2) {
            this.showAlert("Enter at least 2 characters");
            return;
        }

        this.fetchCities(term, (results) => {
            if (results && results.length > 0) {
                const bestMatch = results[0];
                this.handleCitySelect(bestMatch);
                this.elements.searchInput.autocomplete("close");
            } else {
                this.showAlert("City '" + term + "' wasn't found.");
            }
        });
    }

    initSearch() {
        const $input = this.elements.searchInput;
        if ($input.length === 0) return;

        const app = this;

        $input.autocomplete({
            minLength: 2,
            delay: 300,
            source: (request, response) => {
                this.fetchCities(request.term, response);
            },
            select: function (event, ui) {
                $(this).val(ui.item.label);
                app.handleCitySelect(ui.item);
                return false;
            }
        });

        const instance = $input.autocomplete("instance");
        if (instance) {
            instance._renderItem = (ul, item) => {
                return this.renderSearchItem(ul, item);
            };
        }
    }

    fetchCities(term, responseCallback) {
        $.ajax({
            url: this.geoApiUrl,
            dataType: "json",
            data: {
                name: term,
                count: this.maxSuggestions,
            },
            success: (data) => {
                if (!data.results) {
                    responseCallback([]);
                    return;
                }
                const formattedData = data.results.map(item => ({
                    label: item.name,
                    lat: item.latitude,
                    lon: item.longitude,
                    country: item.country,
                    admin1: item.admin1
                }));
                responseCallback(formattedData);
            },
            error: (err) => {
                console.error("Geocoding failed", err);
                responseCallback([]);
            }
        });
    }

    renderSearchItem(ul, item) {
        let locationText = item.label;
        if (item.admin1) locationText += `, <small>${item.admin1}</small>`;
        if (item.country) locationText += ` <span class="suggestion-country">(${item.country})</span>`;

        return $("<li>")
            .append(`<div>${locationText}</div>`)
            .appendTo(ul);
    }

    handleCitySelect(cityData, updateHistory = true) {
        if (this.isLoading) {
            return;
        }

        this.selectedCity = cityData;
        this.elements.searchInput.val(cityData.label);

        if (updateHistory) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('city', cityData.label);
            window.history.pushState({ city: cityData.label }, null, newUrl);
        }

        this.getWeather(cityData);
    }

    getWeather(cityData) {
        this.setLoadingState(true);

        this.elements.mainContent.html(`
            <div class="spinner-container">
                <i class="fa-solid fa-spinner fa-spin spinner"></i>
            </div>
        `);

        const params = {
            latitude: cityData.lat,
            longitude: cityData.lon,
            forecast_days: 7,
            ...this.weatherParams
        };

        $.ajax({
            url: this.weatherApiUrl,
            dataType: "json",
            data: params,
            success: (data) => {
                this.lastWeatherData = data;
                this.renderWeather(cityData, data);
                this.renderCharts(data);
            },
            error: (xhr, status, error) => {
                this.showAlert("Unable to load data");
            },
            complete: () => {
                this.setLoadingState(false);
            }
        })
    }

    renderWeather(cityData, apiData) {
        const current = apiData.current;
        const units = apiData.current_units;
        const dateString = apiData.current.time.split('T')[1];

        let favButtonHtml = '';
        let locationCountry = '';
        if (cityData.label != "Your location") {
            const isFav = this.isFavorite(cityData.label);
            const iconClass = isFav ? "fa-solid favorite" : "fa-regular";
            favButtonHtml = `
                <button class="btn-fav" id="favorite-btn" title="Add to favorites">
                    <i class="${iconClass} fa-heart"></i>
                </button>
            `;

            locationCountry = `, <small>${cityData.country}</small>`;
        }

        const html = `
            <section class="card">
                <div class="weather-header">
                    <div class="city-headline">
                        <h2>${cityData.label}${locationCountry}</h2>
                        <span class="date-info">${dateString}</span>
                    </div>
                    ${favButtonHtml}
                </div>

                <div class="weather-grid">
                    <div class="weather-detail-item">
                        <div class="weather-icon-box"><i class="fa-solid fa-temperature-three-quarters"></i></div>
                        <div class="weather-info">
                            <h4>Temperature</h4>
                            <p>${current.temperature_2m} ${units.temperature_2m}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-icon-box"><i class="fa-solid fa-person-rays"></i></div>
                        <div class="weather-info">
                            <h4>Feels Like</h4>
                            <p>${current.apparent_temperature} ${units.apparent_temperature}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-icon-box"><i class="fa-solid fa-droplet"></i></div>
                        <div class="weather-info">
                            <h4>Precipitation</h4>
                            <p>${current.precipitation} ${units.precipitation}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-icon-box"><i class="fa-solid fa-wind"></i></div>
                        <div class="weather-info">
                            <h4>Wind Speed</h4>
                            <p>${current.wind_speed_10m} ${units.wind_speed_10m}</p>
                        </div>
                    </div>
                </div>
            </section>

            <div class="chart-controls">
                <button class="chart-tab ${this.chartMode === 'temperature' ? 'active' : ''}" data-mode="temperature">Temperature</button>
                <button class="chart-tab ${this.chartMode === 'precipitation' ? 'active' : ''}" data-mode="precipitation">Precipitation</button>
            </div>

            <section class="card">
                <h3 class="chart-header">24 Hour Forecast</h3>
                <div class="chart-placeholder">
                    <canvas id="hourly-chart"></canvas>
                </div>
            </section>
            <section class="card">
                <h3 class="chart-header">7 Day Forecast</h3>
                <div class="chart-placeholder">
                    <canvas id="daily-chart"></canvas>
                </div>
            </section>
        `;
        this.elements.mainContent.html(html);
    }

    renderCharts(apiData) {
        const currentHour = parseInt(apiData.current.time.split('T')[1].split(':')[0]);
        const hourlyTime = apiData.hourly.time.slice(currentHour, currentHour + 24).map(t => t.split('T')[1]);
        const dailyTime = apiData.daily.time.map(t => new Date(t).toLocaleDateString('en-US', { weekday: 'short' }));

        const colorBlue = '#2563eb';
        const colorPrecip = 'rgba(131, 171, 234, 1)';

        let hourlyDataset, dailyDataset;
        let yAxisLabel;
        let yMin = undefined;
        let yMax = undefined;

        if (this.chartMode === 'temperature') {
            yAxisLabel = '°C';
            const hourlyTemp = apiData.hourly.temperature_2m.slice(currentHour, currentHour + 24);
            hourlyDataset = [
                {
                    type: 'line',
                    label: 'Temperature (°C)',
                    data: hourlyTemp,
                    order: 1,
                    yAxisID: 'y',
                    borderColor: colorBlue,
                    backgroundColor: colorBlue,
                    borderWidth: 3,
                    tension: 0.3
                }
            ];

            const dailyData = apiData.daily.time.map((date, index) => [apiData.daily.temperature_2m_min[index], apiData.daily.temperature_2m_max[index]]);
            dailyDataset = [
                {
                    type: 'bar',
                    label: 'Temperature (°C)',
                    data: dailyData, order: 1,
                    yAxisID: 'y',
                    backgroundColor: colorBlue,
                    barThickness: 20
                }
            ];
        }
        else if (this.chartMode === 'precipitation') {
            yAxisLabel = '%';
            yMin = 0;
            yMax = 100;

            const hourlyPrec = apiData.hourly.precipitation_probability.slice(currentHour, currentHour + 24);
            hourlyDataset = [
                {
                    type: 'line', label: 'Precipitation (%)', data: hourlyPrec, order: 2, yAxisID: 'y',
                    borderColor: colorPrecip, backgroundColor: colorPrecip, stepped: true, pointStyle: false, fill: 'start'
                }
            ];

            const dailyPrecMean = apiData.daily.precipitation_probability_mean;
            dailyDataset = [
                {
                    type: 'line', label: 'Precipitation (%)', data: dailyPrecMean, order: 2, yAxisID: 'y',
                    backgroundColor: colorPrecip, borderColor: colorPrecip, stepped: true, fill: 'start', pointStyle: false
                }
            ];
        }

        const hourlyChart = document.getElementById('hourly-chart');
        const dailyChart = document.getElementById('daily-chart');

        const yScalesConfig = {
            position: 'left',
            ticks: { callback: v => `${v}${yAxisLabel}` },
            min: yMin,
            max: yMax
        };

        if (hourlyChart) {
            if (this.charts.hourly) {
                this.charts.hourly.destroy();
            }

            this.charts.hourly = new Chart(hourlyChart, {
                data: {
                    labels: hourlyTime,
                    datasets: hourlyDataset
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false }, offset: false },
                        y: yScalesConfig
                    },
                    interaction: { intersect: false, mode: 'index' }
                }
            });
        }

        if (dailyChart) {
            if (this.charts.daily) {
                this.charts.daily.destroy();
            }

            this.charts.daily = new Chart(dailyChart, {
                data: {
                    labels: dailyTime,
                    datasets: dailyDataset
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false } },
                        y: yScalesConfig
                    },
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: ctx => {
                                    if (Array.isArray(ctx.raw)) {
                                        return `Min: ${ctx.raw[0]}${yAxisLabel} Max: ${ctx.raw[1]}${yAxisLabel}`;
                                    }
                                    return `${ctx.dataset.label}: ${ctx.raw}${yAxisLabel}`;
                                }
                            }, yAlign: 'center'
                        }
                    }
                }
            });
        }
    }

    getFavorites() {
        const favorites = localStorage.getItem("favorites");
        return favorites ? JSON.parse(favorites) : [];
    }

    isFavorite(cityLabel) {
        const favorites = this.getFavorites();
        return favorites.some(city => city.label === cityLabel);
    }

    toggleFavorite() {
        let favorites = this.getFavorites();
        const existingIndex = favorites.findIndex(city => city.label === this.selectedCity.label);

        if (existingIndex === -1) {
            favorites.push(this.selectedCity);
            $(".btn-fav i").removeClass("fa-regular").addClass("fa-solid").addClass("favorite");
            this.showAlert("Added to favorites");
        } else {
            favorites.splice(existingIndex, 1);
            $(".btn-fav i").removeClass("fa-solid").removeClass("favorite").addClass("fa-regular");
            this.showAlert("Removed from favorites");
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));
        this.renderFavoritesList();
    }

    renderFavoritesList() {
        const rawFavorites = this.getFavorites();
        let displayList = [...rawFavorites];

        if (this.sortState === 'asc') {
            displayList.sort((a, b) => a.label.localeCompare(b.label));
        }
        else if (this.sortState === 'desc') {
            displayList.sort((a, b) => b.label.localeCompare(a.label));
        }

        this.elements.favList.empty();

        let favoritesHtml = '';
        displayList.forEach(city => {
            const li = `
                <li class="fav-item" data-label="${city.label}">
                    <span class="fav-name">${city.label}</span>
                    <button class="btn-remove-fav" title="Remove">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </li>
            `;
            favoritesHtml += li;
        });

        this.elements.favList.append(favoritesHtml);
    }

    closeMenu() {
        this.elements.aside.removeClass("active");
        this.elements.menuOverlay.removeClass("active");
        $("body").css("overflow", "");
    }

    setLoadingState(loading) {
        this.isLoading = loading;

        const elementsToDisable = this.elements.favList
            .add(this.elements.searchWrapper)
            .add(this.elements.btnMenu)
            .add(this.elements.sortBtn)
            .add('.chart-tab');

        if (loading) {
            elementsToDisable.addClass('ui-disabled');
        }
        else {
            elementsToDisable.removeClass('ui-disabled');
        }
    }

    toggleSort() {
        const icon = this.elements.sortIcon;

        if (this.sortState === 'default') {
            this.sortState = 'asc';
            icon.attr("class", "fa-solid fa-arrow-down-a-z");
            this.showAlert("Sorted: A-Z");
        }
        else if (this.sortState === 'asc') {
            this.sortState = 'desc';
            icon.attr("class", "fa-solid fa-arrow-up-a-z");
            this.showAlert("Sorted: Z-A");
        }
        else {
            this.sortState = 'default';
            icon.attr("class", "fa-regular fa-clock");
            this.showAlert("Sorted: By time added");
        }

        this.renderFavoritesList();
    }

    showConfirmModal(message, onConfirmCallback) {
        const modal = this.elements.confirmModal;
        const yesBtn = this.elements.confirmYes;
        const cancelBtn = this.elements.confirmCancel;
        const msgEl = this.elements.confirmMessage;

        msgEl.text(message);
        modal.addClass("active");

        yesBtn.off("click");
        cancelBtn.off("click");

        yesBtn.on("click", () => {
            onConfirmCallback();
            modal.removeClass("active");
        });

        cancelBtn.on("click", () => {
            modal.removeClass("active");
        });
    }
}

$(document).ready(function () {
    new WeatherApp();
});