// Open-Meteo Geocoding API – search for official place names

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

export const searchPlaces = async (query, options = {}) => {
  const trimmed = (query || '').trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: String(options.count ?? 10),
    language: options.language ?? 'en',
  });
  const url = `${GEOCODING_URL}?${params.toString()}`;

  const response = await fetch(url);
  if (!response.ok) return [];
  const data = await response.json();
  if (!data?.results || !Array.isArray(data.results)) return [];
  return data.results;
};

/** Display label for a result: "Name, Country" */
export const placeLabel = (result) => {
  const name = result.name || '';
  const country = result.country || '';
  return country ? `${name}, ${country}` : name;
};
