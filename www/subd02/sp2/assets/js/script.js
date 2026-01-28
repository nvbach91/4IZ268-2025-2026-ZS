class WeatherApp {
    constructor() {
        this.geoApiUrl = "https://geocoding-api.open-meteo.com/v1/search";
        this.weatherApiUrl = "https://api.open-meteo.com/v1/forecast";
        this.maxSuggestions = 5;

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

        this.selectedCity = null;
        this.init();
    }

    init() {
        this.initSearch();
        this.bindEvents();
        this.renderFavoritesList();
        this.loadStateFromUrl();
    }

    bindEvents() {
        $(this.selectors.locateBtn).on("click", () => {
            this.handleGeoLocation();
        });

        $(".btn-search").on("click", () => {
            this.manualSearch();
        });

        $(this.selectors.searchInput).on("keypress", (e) => {
            if (e.which === 13) {
                this.manualSearch();
                e.preventDefault();
                $(this.selectors.searchInput).autocomplete("close");
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

            let favorites = app.getFavorites();
            favorites = favorites.filter(city => city.label !== cityLabel);
            localStorage.setItem("favorites", JSON.stringify(favorites));

            app.renderFavoritesList();
            app.showAlert(`Removed ${cityLabel} from favorites`);

            if (app.selectedCity && app.selectedCity.label === cityLabel) {
                $(".btn-fav i").removeClass("fa-solid").removeClass("favorite").addClass("fa-regular");
            }
        });

        $("#menu-toggle").on("click", () => {
            $("aside").addClass("active");
            $(".menu-overlay").addClass("active");
            $("body").css("overflow", "hidden");
        });

        $(".menu-overlay").on("click", () => {
            this.closeMenu();
        });

        $("#btn-close").on("click", () => {
            this.closeMenu();
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
        const $container = $(this.selectors.alertContainer);
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
        const term = $(this.selectors.searchInput).val();

        if (term.length < 2) {
            this.showAlert("Enter at least 2 characters");
            return;
        }

        this.fetchCities(term, (results) => {
            if (results && results.length > 0) {
                const bestMatch = results[0];
                this.handleCitySelect(bestMatch);
                $(this.selectors.searchInput).autocomplete("close");
            } else {
                this.showAlert("City '" + term + "' wasn't found.");
            }
        });
    }

    initSearch() {
        const $input = $(this.selectors.searchInput);
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
        this.selectedCity = cityData;
        $(this.selectors.searchInput).val(cityData.label);

        if (updateHistory) {
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('city', cityData.label);
            window.history.pushState({ city: cityData.label }, null, newUrl);
        }

        this.getWeather(cityData);
    }

    getWeather(cityData) {
        $(this.selectors.mainContent).html(`
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
                this.renderWeather(cityData.label, data);
                this.renderCharts(data);
            },
            error: (xhr, status, error) => {
                this.showAlert("Unable to load data");
            }
        })
    }

    renderWeather(cityName, apiData) {
        const current = apiData.current;
        const units = apiData.current_units;
        const dateString = apiData.current.time.split('T')[1];

        let favButtonHtml = '';
        if (cityName != "Your location") {
            const isFav = this.isFavorite(cityName);
            const iconClass = isFav ? "fa-solid favorite" : "fa-regular";
            favButtonHtml = `
                <button class="btn-fav" id="favorite-btn" title="Add to favorites">
                    <i class="${iconClass} fa-heart"></i>
                </button>
            `;
        }

        const html = `
            <section class="card">
                <div class="weather-header">
                    <div class="city-headline">
                        <h2>${cityName}</h2>
                        <span class="date-info">${dateString}</span>
                    </div>
                    ${favButtonHtml}
                </div>

                <div class="weather-grid">
                    <div class="weather-detail-item">
                        <div class="weather-icon-box">
                            <i class="fa-solid fa-temperature-three-quarters"></i>
                        </div>
                        <div class="weather-info">
                            <h4>Temperature</h4>
                            <p>${current.temperature_2m} ${units.temperature_2m}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-icon-box">
                            <i class="fa-solid fa-person-rays"></i>
                        </div>
                        <div class="weather-info">
                            <h4>Feels Like</h4>
                            <p>${current.apparent_temperature} ${units.apparent_temperature}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-icon-box">
                            <i class="fa-solid fa-droplet">
                        </i></div>
                        <div class="weather-info">
                            <h4>Precipitation</h4>
                            <p>${current.precipitation} ${units.precipitation}</p>
                        </div>
                    </div>
                    <div class="weather-detail-item">
                        <div class="weather-icon-box">
                            <i class="fa-solid fa-wind"></i>
                        </div>
                        <div class="weather-info">
                            <h4>Wind Speed</h4>
                            <p>${current.wind_speed_10m} ${units.wind_speed_10m}</p>
                        </div>
                    </div>
                </div>
            </section>
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
        $(this.selectors.mainContent).html(html);
    }

    renderCharts(apiData) {
        const currentHour = parseInt(apiData.current.time.split('T')[1].split(':')[0]);
        const hourlyTime = apiData.hourly.time.slice(currentHour, currentHour + 24).map(t => t.split('T')[1]);
        const hourlyTemp = apiData.hourly.temperature_2m.slice(currentHour, currentHour + 24);
        const hourlyPrec = apiData.hourly.precipitation_probability.slice(currentHour, currentHour + 24);

        const dailyTime = apiData.daily.time.map(t => new Date(t).toLocaleDateString('en-US', { weekday: 'short' }));
        const dailyData = apiData.daily.time.map((date, index) => [apiData.daily.temperature_2m_min[index], apiData.daily.temperature_2m_max[index]]);
        const dailyPrecMean = apiData.daily.precipitation_probability_mean;

        const colorBlue = '#2563eb';
        const colorPrecip = 'rgba(131, 171, 234, 1)';

        const hourlyChart = document.getElementById('hourly-chart');
        const dailyChart = document.getElementById('daily-chart');

        if (hourlyChart) {
            if (this.charts.hourly) this.charts.hourly.destroy();
            this.charts.hourly = new Chart(hourlyChart, {
                data: {
                    labels: hourlyTime,
                    datasets: [
                        {
                            type: 'line', label: 'Temperature (°C)', data: hourlyTemp, order: 1, yAxisID: 'y',
                            borderColor: colorBlue, backgroundColor: colorBlue, borderWidth: 3, tension: 0.3,
                        },
                        {
                            type: 'line', label: 'Precipitation (%)', data: hourlyPrec, order: 2, yAxisID: 'y1',
                            borderColor: colorPrecip, backgroundColor: colorPrecip, stepped: true, pointStyle: false, fill: 'start'
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false }, offset: false },
                        y: { position: 'left', ticks: { callback: v => `${v}°C` } },
                        y1: { grid: { display: false }, position: 'right', min: 0, max: 100, ticks: { callback: v => `${v}%` } }
                    },
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: ctx => ctx.dataset.label.includes('Temperature') ? `Temperature: ${ctx.raw}°C` : `Precipitation: ${ctx.raw}%`
                            }, yAlign: 'center'
                        }
                    }
                }
            });
        }

        if (dailyChart) {
            if (this.charts.daily) this.charts.daily.destroy();
            this.charts.daily = new Chart(dailyChart, {
                data: {
                    labels: dailyTime,
                    datasets: [
                        {
                            type: 'bar', label: 'Temperature (°C)', data: dailyData, order: 1, yAxisID: 'y', backgroundColor: colorBlue, barThickness: 20,
                        },
                        {
                            type: 'line', label: 'Precipitation (%)', data: dailyPrecMean, order: 2, yAxisID: 'y1',
                            backgroundColor: colorPrecip, borderColor: colorPrecip, stepped: true, fill: 'start', pointStyle: false
                        }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        x: { grid: { display: false } },
                        y: { position: 'left', ticks: { callback: v => `${v}°C` } },
                        y1: { grid: { display: false }, position: 'right', min: 0, max: 100, ticks: { callback: v => `${v}%` } }
                    },
                    interaction: { intersect: false, mode: 'index' },
                    plugins: {
                        tooltip: {
                            callbacks: {
                                label: ctx => ctx.dataset.label.includes('Temperature') ? `Temperature: Min: ${ctx.raw[0]}°C Max: ${ctx.raw[1]}°C` : `Precipitation: ${ctx.raw}%`
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
        const favorites = this.getFavorites();
        $(this.selectors.favList).empty();
        favorites.forEach(city => {
            const li = `
                <li class="fav-item" data-label="${city.label}">
                    <span class="fav-name">${city.label}</span>
                    <button class="btn-remove-fav" title="Remove">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </li>
            `;
            $(this.selectors.favList).append(li);
        });
    }

    closeMenu() {
        $("aside").removeClass("active");
        $(".menu-overlay").removeClass("active");
        $("body").css("overflow", "");
    }
}

$(document).ready(function () {
    new WeatherApp();
});