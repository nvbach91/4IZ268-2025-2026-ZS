// Počasí API

import { OPENWEATHER_API_KEY, OPENWEATHER_BASE } from '../config/config.js';

// Normální zpřesnění dat počasí
function normalizeWeatherData(data) {
  return {
    city: data.name || '',
    country: data.sys?.country || '',
    temp: data.main?.temp ?? null,
    feels_like: data.main?.feels_like ?? null,
    humidity: data.main?.humidity ?? null,
    description: data.weather?.[0]?.description || '',
    icon: data.weather?.[0]?.icon || null,
    timestamp: Date.now()
  };
}

// Načítání počasí
export async function getWeatherForCity(city) {
  if (!city) {
    throw new Error('Zadej město.');
  }

  const url = `${OPENWEATHER_BASE}/weather?q=${encodeURIComponent(
    city
  )}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=cz`;

  let response;
  try {
    response = await fetch(url);
  } catch (networkError) {
    console.error('Network error:', networkError);
    throw new Error('Nelze se připojit k API. Zkontroluj internet.');
  }

  if (!response.ok) {
    // OpenWeatherMap vrací kódy 400/404 když město nenalezeno
    const text = await response.text();
    console.warn('API error response:', text);

    if (response.status === 404) {
      throw new Error('Město nebylo nalezeno. Zkus jiné.');
    }

    throw new Error('Chyba při načítání počasí (API).');
  }

  const json = await response.json();
  return normalizeWeatherData(json);
}
