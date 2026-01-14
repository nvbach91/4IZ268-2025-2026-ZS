const apiKey = "4cc683cccd309160bfdd083d263d0612";
console.log('canvas:', document.getElementById('forecastChart'));

// element selection using jQuery
const city = $("#city");
const degrees = $("#degrees");
const weatherImg = $("#weatherImg");
const weather = $("#weather");
const descriptionContainer = $("#description");
const feels_like = $("#feels_like");
const visibility = $("#visibility");
const humidity = $("#humidity");
const wind = $("#wind");
const sunset = $("#sunset");
const sunrise = $("#sunrise");
const forecastContainer = $("#oneDayForecast");
const oneDayCardsContainer = $("#oneDayForecastCards");
const fiveDayFc = $("#fiveDayForecast");
const selDayContainer = $("#selectedDayForecast");
const myLocationBtn = $("#myLocation");
const headerSelDay = $("#headerSelDay");
const headerFiveDays = $("#headerFiveDays");
const headerOneDay = $("#headerOneDay");
const errorMessage = $("#errorMessage");





// promenna grafu 
let temperatureChart = null;

let clickedDay = null;

const btn = document.getElementById("searchBtn");

// zavolani funkce pro zruseni /index.html z URL
const deleteIndexFromURL = () => {
    if (window.location.pathname.endsWith('/index.html')) {
        window.history.replaceState({}, '', window.location.pathname.replace('/index.html', '/'));
    }
}
deleteIndexFromURL();

btn.addEventListener("click", async () => {
    const mesto = document.getElementById("cityInput").value;
    errorMessage.empty();
    oneDayCardsContainer.removeClass("error-text");

    if (!mesto) {
        const errorMsg = $('<h4 class="text-danger text-center mb-3">Zadejte název města</h4>');
        errorMessage.append(errorMsg);
        return;
    }

    console.log("Hledané město:", mesto);
    showLoader();
    const data = await getForecastData(mesto);
    

    if (!data) {
        const errorMsg = $('<h4 class="text-danger text-center mb-3">Předpověď pro zadané město není k dispozici</h4>');
        errorMessage.append(errorMsg);
        city.text("");
        degrees.text("");
        weatherImg.empty();
        weather.text("");
        feels_like.text("");
        visibility.text("");
        humidity.text("");
        wind.text("");
        sunrise.text("");
        sunset.text("");
        fiveDayFc.empty();
        selDayContainer.empty();
        headerSelDay.empty();
        headerFiveDays.empty();
        headerOneDay.empty();
        hideLoader();
        return;
    }
    if (data) {
        getWeather(mesto);
        oneDayForecast(data);
        oneDayCards(data);
        fiveDayForecast(data);
        selDayContainer.empty();
        headerSelDay.empty();
        localStorage.setItem('lastCity', mesto);
        hideLoader();
        updateHistory(mesto);
    }

   
});

myLocationBtn.on("click", async () => {
    cityInput.value = "";
    errorMessage.empty();
    oneDayCardsContainer.removeClass("error-text");
    showLoader();
    const mesto = await getCityLocation();
    const data = await getForecastData(mesto);
    if (!data) {
        const errorMsg = $('<h4 class="text-danger text-center mb-3">Nelze načíst předpověď pro aktuální polohu</h4>');
        errorMessage.append(errorMsg);
        hideLoader();
        return;
    }
    getWeather(mesto);
    oneDayForecast(data);
    fiveDayForecast(data);
    oneDayCards(data);
    localStorage.setItem('lastCity', mesto);
    hideLoader();
    updateHistory(mesto);
});

const getCityLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser."));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const limit = 1;
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    console.log(`Latitude: ${lat}, Longitude: ${lon}`);
                    
                    //const url = `http://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=${limit}&appid=${apiKey}`;
                    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=cz`;
                    const resp = await fetch(url);
                    if (!resp.ok) {
                        throw new Error(`Chyba: ${resp.status}`);
                    }
                    
                    const data = await resp.json();
                    console.log('Reverse geocoding data:', data);
                    const mesto = data.name; // divne nazvy jeste nevim, ktery url viz vyse pouziju
                    
                    if (!mesto) {
                        throw new Error("Město nebylo nalezeno.");
                    }
                    
                    console.log('Mesto from reverse geocoding:', mesto);
                    resolve(mesto); // vraceno mesto
                    
                } catch (chyba) {
                    console.error(chyba);
                    reject(chyba);
                }
            },
            (error) => {
                // Error pro geolokaci
                console.error("Geolocation error:", error);
                reject(error);
            }
        );
    });
}

async function getWeather(mesto) {

    const url = `https://api.openweathermap.org/data/2.5/weather?q=${mesto}&appid=${apiKey}&units=metric&lang=cz`;
   // const cityName = await getLocalNameOfCity(mesto);
    try {
        const odpoved = await fetch(url);
       
        
        if (!odpoved.ok) {
            throw new Error(`Chyba: ${odpoved.status}`);
        }
        
        const data = await odpoved.json();
        
        
        console.log('predpoved pro mesto:', data); 
        
       
        city.text(`${data.name}, ${data.sys.country}`);
        degrees.text(`${Math.round(data.main.temp)}°C`);

        const iconCode = data.weather[0].icon;
        const icon = getIcon(iconCode);
        weatherImg.html(`<img src="${icon}" alt="Weather Icon" />`);

        const description = data.weather[0].description;
        const descriptionCapitalized = capitalizeFirstLetter(description);
        weather.text(descriptionCapitalized);
        feels_like.text(`Pocitová teplota: ${Math.round(data.main.feels_like)}°C`);
        
        const visibilityMeters = data.visibility;
        let visibilityText = "";
        if (visibilityMeters >= 10000) {
            visibilityText = "Výborná";
        } else if (visibilityMeters >= 5000) {
            visibilityText = "Dobrá";
        } else if (visibilityMeters >= 2000) {
            visibilityText = "Střední";
        } else if (visibilityMeters >= 1000) {
            visibilityText = "Špatná";
        } else {
            visibilityText = "Velmi špatná";
        }
        visibility.text(`Viditelnost: ${visibilityText}`);

        humidity.text(`Vlhkost: ${data.main.humidity}%`);
        wind.text(`Vítr: ${Math.round(data.wind.speed)} m/s`);
        sunrise.text(`Východ: ${new Date(data.sys.sunrise * 1000).toLocaleTimeString('cs-CZ', {hour: '2-digit', minute:'2-digit'})}`);
        sunset.text(`Západ: ${new Date(data.sys.sunset * 1000).toLocaleTimeString('cs-CZ', {hour: '2-digit', minute:'2-digit'})}`);
        
    } catch (chyba) {
        console.error(chyba);

    }
}

const getForecastData = async (city) => {
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric&lang=cz`;

    try {
        forecastContainer.empty();
        const resp = await fetch(url);
        if (!resp.ok) {
            throw new Error(`Chyba: ${resp.status}`);
        }
        const data = await resp.json();
        console.log(data);
      
        return data;

    } catch (chyba) {
        console.error(chyba);
        forecastContainer.text("Nebylo možné získat data o předpovědi.");
        oneDayCardsContainer.addClass("error-text");
        oneDayCardsContainer.text("Nebylo možné získat data o předpovědi.");
    }

}  

const oneDayForecast = async (data) => {
    
    try {

        //forecastContainer.empty();

        headerOneDay.empty();
        const header = $('<h4 class="mb-3">Předpověď na 24 hodin</h4>');
        headerOneDay.append(header);

        const canvas = $('<canvas>', {
            id: 'forecastChart',
            width: 600,
            height: 300
        });
        forecastContainer.append(canvas);
       
        const graphData = [];

        // Vykreslení předpovědi pro 3 hodinove intervaly
        dayForecastArray = data.list.slice(0, 8); // Prvních 8 záznamů (3 hodiny * 8 = 24 hodin)
        dayForecastArray.forEach(forecast => {

            const forecastTime = new Date(forecast.dt * 1000);
            const hours = forecastTime.getHours().toString().padStart(2, '0');
            const minutes = forecastTime.getMinutes().toString().padStart(2, '0');
            const timeString = `${hours}:${minutes}`;
            const tempCelsius = forecast.main.temp 

            graphData.push({ x: timeString, y: tempCelsius });
        });

        console.log(graphData);

        // Pokud graf existuje, znic
        if (temperatureChart) {
            temperatureChart.destroy();
            temperatureChart = null;
        }

        const canvasTempChart = canvas.get(0).getContext('2d');
        // Vykresleni grafu pomocí Chart.js
        temperatureChart = new Chart(
            canvasTempChart,
            {
                type: 'line',
                data: {
                    labels: graphData.map(point => point.x),
                    datasets: [
                        {
                            label: 'Teplota (°C)',
                            data: graphData.map(point => point.y),
                        }
                    ]
                },
                options: {
                    responsive: false,
                    plugins: {
                        tooltip: {
                            callbacks:{
                                label: function(context) {
                                    return `Teplota: ${Math.round(context.parsed.y)}°C`;
                                },
                                // Pocitova teplota v tooltipu
                                afterLabel: function(context) {
                                    const index = context.dataIndex;
                                    const forecast = dayForecastArray[index];
                                    const description = forecast.weather[0].description;
                                    const capitalizedDescription = description.charAt(0).toUpperCase() + description.slice(1);
                                    return [capitalizedDescription];
                                }
                            }
                        }
                    },
                    scales: {
                        y: {
                            title: {
                                display: true,
                                text: 'Teplota (°C)'
                            }
                        }
                    }
                }
            }
        );
    }
    catch (chyba) {
        console.error(chyba);
       // forecastContainer.text("Forecast data could not be retrieved.");
    }
}

const oneDayCards = (data) => {
    oneDayCardsContainer.empty();
    const dayForecastData = data.list.slice(0, 8); // Prvních 8 záznamů = 24 hodin 
    generateDailyForecast(dayForecastData, oneDayCardsContainer); 
}

const fiveDayForecast = async (data) => {

    fiveDayFc.empty();
    headerFiveDays.empty();
    
    const dailyForecast = data.list.filter(item => item.dt_txt.endsWith("12:00:00"));
    console.log(dailyForecast);

    const header = $(`<h4>Předpověď na další dny</h4>`);
    headerFiveDays.append(header);

    dailyForecast.forEach(day => {
        const date = new Date(day.dt * 1000);
        const dayName = date.toLocaleDateString('cs-CZ', { 
            weekday: 'long', 
            day: 'numeric',
            month: 'numeric'
        });
        const temp = Math.round(day.main.temp);
        const description = day.weather[0].description;
        const descriptionCapitalized = capitalizeFirstLetter(description);
        const iconCode = day.weather[0].icon;
        const icon = getIcon(iconCode);

        const dayCard = $(`
            <div class="forecast-day clickable">
                <div class="day-name">${dayName}</div>
                <div class="day-temp">${temp}°C</div>
                 <img src="${icon}" alt="${descriptionCapitalized}" width="60" height="60">
                <div class="day-weather">${descriptionCapitalized}</div>
                <div class="bi bi-chevron-down"></div>
            </div>
        `)

        dayCard.on('click', () => {
            const isActive = dayCard.hasClass('active');

            fiveDayFc.find('.forecast-day').removeClass('active');

            if(isActive) {
                selDayContainer.slideUp();
                headerSelDay.slideUp();
                selDayContainer.empty();
                headerSelDay.empty();
                clickedDay = null;
            }
            else {
                dayCard.addClass('active');
                selDayContainer.empty();
                headerSelDay.empty();
                selectedDayForecast(data, day.dt_txt.split(' ')[0]);
                selDayContainer.slideDown();
                headerSelDay.slideDown();
                clickedDay = day.dt_txt.split(' ')[0];
            }

           
        });

        fiveDayFc.append(dayCard);
    });

    if (clickedDay) {
        // Najit kartu se stejnym datem
        const matchingCard = fiveDayFc.find('.forecast-day').filter(function() {
            const cardDayName = $(this).find('.day-name').text();
            
            // Porovnat datum z vybraneho dne s kartou
            const selectedDate = new Date(clickedDay + 'T12:00:00');
            const selectedDayName = selectedDate.toLocaleDateString('cs-CZ', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'numeric'
            });
            
            return cardDayName === selectedDayName;
        });

        if (matchingCard.length > 0) {
            // Automaticky klikni na odpovidajici kartu. A timeout pro nacteni DOMU
            setTimeout(() => {
                matchingCard.first().click();
            }, 100);
        } else {
            // Pokud vybrany den neni, tak clicked day null
            clickedDay = null;
        }
    }

}

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const getIcon = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

// Karticky, kdyz kliknu na den ve fiveDayForecast
const selectedDayForecast = (data, day) => {

    selDayContainer.empty();
    headerSelDay.empty();
    const dayForecast = data.list.filter(item => item.dt_txt.startsWith(day));
    console.log(dayForecast);

    const date = new Date(dayForecast[0].dt * 1000);
    const dayName = date.toLocaleDateString('cs-CZ', { 
            weekday: 'long', 
            day: 'numeric',
            month: 'numeric'
        });
    const header = $(`<h4>Detailní předpověď: ${dayName}</h4>`);
    headerSelDay.append(header);
    
    generateDailyForecast(dayForecast, selDayContainer);
    
}

const generateDailyForecast = (dayForecast, container) => {
    dayForecast.forEach(hour => {
       
        const hourDate = new Date(hour.dt * 1000);
        const temp = Math.round(hour.main.temp);
        const description = hour.weather[0].description;
        const descriptionCapitalized = capitalizeFirstLetter(description);
        const iconCode = hour.weather[0].icon;
        const icon = getIcon(iconCode);

        const dayCard = $(`
            <div class="forecast-day">
                <div class="day-time">${hourDate.getHours().toString().padStart(2, '0')}:00</div>
                <div class="day-temp">${temp}°C</div>
                 <img src="${icon}" alt="${descriptionCapitalized}" width="60" height="60">
                <div class="day-weather">${descriptionCapitalized}</div>
            </div>
        `);

        container.append(dayCard);
    });
}

$(document).ready(async () => {
    setupAutoComplete();
    try {

        const loadedFromURL = await loadFromURL();
        if (!loadedFromURL) {
            const lastCity = localStorage.getItem('lastCity');
            if(lastCity) {
                console.log('Nacitam posledni mesto:', lastCity);
                $("#cityInput").val(lastCity);
                showLoader();
                const data = await getForecastData(lastCity);
                getWeather(lastCity);
                oneDayForecast(data);
                oneDayCards(data);
                fiveDayForecast(data);
                hideLoader();
                const url = new URL(window.location);
                url.searchParams.set('city', lastCity);
                window.history.replaceState({ city: lastCity }, '', url);
            }
            else {
                console.log('Nacteni mesta z geolokace');
                showLoader();
                const mesto = await getCityLocation();
                const data = await getForecastData(mesto);
                getWeather(mesto);            
                oneDayForecast(data);
                oneDayCards(data);
                fiveDayForecast(data);
                hideLoader();
                updateHistory(mesto);
            }
            
        }
    }
    catch (chyba) {
        hideLoader();
        console.error(chyba);
    }
    
});

$(document).ready(() => {


    const chartTab = $('#chart-tab');
    const cardsTab = $('#cards-tab');
    const graphCol = $('.col-lg-6').first(); // Sloupec s grafem a kartami
    const weatherCol = $('.col-lg-6').last(); // Druhy sloupec pocasi
    cardsTab.on('click', () => {
        // Rozsgraf na celou šířku
        graphCol.removeClass('col-lg-6').addClass('col-lg-8');
        // Skryj aktualni pocasi
        weatherCol.removeClass('col-lg-6').addClass('col-lg-4');
    });

    // Pri kliknuti na teplotni graf
    chartTab.on('click', () => {
        // Puvodni layout
        graphCol.removeClass('col-lg-8').addClass('col-lg-6');
        // Rozsireny layout
        weatherCol.removeClass('col-lg-4').addClass('col-lg-6');
    });
});


const showLoader = () => {
    const loader = $(`
        <div id="loader" class="text-center my-5">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Načítání...</span>
            </div>
            <p class="mt-3">Načítám data...</p>
        </div>
    `);
    errorMessage.append(loader);
}

const hideLoader = () => {
    $("#loader").remove();
}

const setupAutoComplete = () => {
    const cityInput = $("#cityInput");
    let timeout;

    const dropdown = $('<div id="cityAutocomplete" class="list-group position-absolute w-100" style="display: none;"></div>');
    cityInput.parent().css('position', 'relative').append(dropdown);

    cityInput.on('input', function() {
        const query = $(this).val().trim();
        if (query.length < 2) {
            dropdown.empty().hide();
            return;
        }
        clearTimeout(timeout);
        timeout = setTimeout(async () => {
            try {
                const limit = 5;
                const url = `https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=${limit}&appid=${apiKey}`;
                
                const resp = await fetch(url);
                const cities = await resp.json();

                dropdown.empty();
                if (cities.length === 0) {
                    dropdown.hide();
                    return;
                }

                // odstraneni duplicitnich polozek
                const uniqueCities = [];
                const set = new Set();
                cities.forEach(city => {
                    const key = `${city.name},${city.country}`;
                    if (!set.has(key)) {
                        set.add(key);
                        uniqueCities.push(city);
                    }
                });

                uniqueCities.forEach(city => {
                    const cityName = `${city.name}, ${city.country}`;
                    const item = $(`
                        <button type="button" class="list-group-item list-group-item-action">
                            <i class="bi bi-geo-alt"></i> ${cityName}
                        </button>
                    `);
                    item.on('click', () => {
                         // Kdyz je nazev s pomlckou, tak vzit jen prvni cast
                        const cityNameClean = city.name.split(' - ')[0];
                        cityInput.val(`${cityNameClean}, ${city.country}`);
                        dropdown.empty().hide();
                        btn.click(); // Stimulace kliknuti na tlacitko hledat
                    });

                    dropdown.append(item);
                });
                dropdown.show();
            }
            catch (chyba) {
                console.error(chyba);
            }
        }, 300); // Zpozdeni 300ms
    });

    $(document).on('click', function(event) {
        if (!$(event.target).closest('#cityInput, #cityAutocomplete').length) {
            dropdown.hide();
        }
    });

    cityInput.on('keydown', function(event) {
        if (event.key === 'Escape') {
            dropdown.hide();
        }
    });
}


// Dopredu a zpet sipky

// Funkce pro aktualizaci URL a history
const updateHistory = (mesto) => {
    const url = new URL(window.location);
    url.searchParams.set('city', mesto);
    window.history.pushState({ city: mesto }, '', url);
}

// Pri nacteni z URL parametru
const loadFromURL = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const cityFromURL = urlParams.get('city');
    
    if (cityFromURL) {
        console.log('Nacitam mesto z URL:', cityFromURL);
        errorMessage.empty();
        $("#cityInput").val(cityFromURL);
        showLoader();
        
        const data = await getForecastData(cityFromURL);
        hideLoader();
        
        if (data) {
            getWeather(cityFromURL);
            oneDayForecast(data);
            oneDayCards(data);
            fiveDayForecast(data);
            localStorage.setItem('lastCity', cityFromURL);
        }
        return true;
    }
    return false;
}

// Event listener pro tlačítko tam/zpet
window.addEventListener('popstate', async (event) => {
    if (event.state && event.state.city) {
        console.log('Zpet na mesto:', event.state.city);
        errorMessage.empty();
        $("#cityInput").val(event.state.city);
        showLoader();
        
        const data = await getForecastData(event.state.city);
        hideLoader();
        
        if (data) {
            getWeather(event.state.city);
            oneDayForecast(data);
            oneDayCards(data);
            fiveDayForecast(data);
        }
    }
});

// Umozneni kliknut enter pro hledani
$(document).on('keydown', function(event) {
    if (event.key ==='Enter') {
        btn.click();
    }
});








