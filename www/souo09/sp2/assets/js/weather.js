// Weather API integration with OpenWeather

import { elements, toggleSpinner } from './elements.js';
import { formatDate } from './date.js';
import { OPENWEATHER_API_KEY } from './config.js';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0/direct';
const ONECALL_DAY_SUMMARY_URL = 'https://api.openweathermap.org/data/3.0/onecall/day_summary';

const buildGeoUrl = (cityName) => {
  const params = new URLSearchParams({
    q: cityName,
    limit: '1',
    appid: OPENWEATHER_API_KEY,
  });

  return `${GEO_BASE_URL}?${params.toString()}`;
};

const buildDaySummaryUrl = (lat, lon, date) => {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    date,
    appid: OPENWEATHER_API_KEY,
    units: 'metric',
  });

  return `${ONECALL_DAY_SUMMARY_URL}?${params.toString()}`;
};

export const fetchWeatherForPlace = async (placeName, arrivalDate) => {
  if (!placeName) {
    elements.weatherResult.textContent = 'Cannot load weather: destination name is missing.';
    return;
  }

  if (!arrivalDate) {
    elements.weatherResult.textContent = 'Cannot load weather: arrival date is missing.';
    return;
  }

  if (!OPENWEATHER_API_KEY) {
    elements.weatherResult.textContent = 'Weather API key is not configured.';
    return;
  }

  try {
    toggleSpinner(true);
    elements.weatherResult.textContent = 'Loading arrival-day forecast...';

    // 1) Geocode city -> lat/lon
    const geoResponse = await fetch(buildGeoUrl(placeName));
    if (!geoResponse.ok) {
      elements.weatherResult.textContent = 'Failed to find this destination on the map.';
      return;
    }

    const geoData = await geoResponse.json();
    if (!Array.isArray(geoData) || !geoData.length) {
      elements.weatherResult.textContent = 'Could not find coordinates for this destination. Try adding a country code, e.g. "New York,US".';
      return;
    }

    const { lat, lon, name, country } = geoData[0];

    // 2) Fetch daily aggregated forecast for the specific arrival date
    const summaryResponse = await fetch(buildDaySummaryUrl(lat, lon, arrivalDate));

    if (!summaryResponse.ok) {
      let message = 'Failed to load weather for this destination.';
      try {
        const errorData = await summaryResponse.json();
        if (errorData?.message) {
          message = `Failed to load weather: ${errorData.message}.`;
        }
      } catch {
        // ignore JSON parse errors for non-OK responses, generic error message
      }
      elements.weatherResult.textContent = message;
      return;
    }

    const summary = await summaryResponse.json();

    const tempMin = summary?.temperature?.min;
    const tempMax = summary?.temperature?.max;
    const totalPrecipitation = summary?.precipitation?.total;

    const resolvedName = name || placeName;
    const locationLabel = country ? `${resolvedName}, ${country}` : resolvedName;
    const europeanDate = formatDate(arrivalDate);

    elements.weatherResult.innerHTML = `
      <div class="weather-card">
        <div class="weather-card-main">
          <div class="weather-location">Daily forecast for ${locationLabel}</div>
          <div class="weather-date">${europeanDate}</div>
        </div>
        <div class="weather-extra">
          ${
            typeof tempMin === 'number' && typeof tempMax === 'number'
              ? `<span>Min / Max: ${Math.round(tempMin)} °C / ${Math.round(tempMax)} °C</span>`
              : ''
          }
          ${
            typeof totalPrecipitation === 'number'
              ? `<span>Total precipitation: ${totalPrecipitation.toFixed(1)} mm</span>`
              : ''
          }
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error while fetching weather', error);
    elements.weatherResult.textContent = 'An error occurred while loading weather data.';
  } finally {
    toggleSpinner(false);
  }
};
