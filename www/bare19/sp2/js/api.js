/* načtení výchozích úkolů z DummyJSON API */
export async function fetchTodos(limit = 30) {
  const res = await fetch(`https://dummyjson.com/todos?limit=${encodeURIComponent(limit)}`, { cache: "no-store" });
  if (!res.ok) throw new Error("Nepodařilo se načíst todos z DummyJSON.");
  const data = await res.json();
  return data.todos;
}

/* aktuální počasí (používám jen do hlavičky aplikace) */
export async function fetchWeather(latitude = 50.08, longitude = 14.43) {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}` +
    `&current_weather=true`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Nepodařilo se načíst počasí z Open-Meteo.");
  const data = await res.json();
  return data.current_weather;
}

/* denní předpověď pro konkrétní datum (používá se u outdoor úkolů) */
export async function fetchDailyForecast(dateISO, latitude = 50.08, longitude = 14.43) {
  if (!dateISO) return null;

  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${encodeURIComponent(latitude)}` +
    `&longitude=${encodeURIComponent(longitude)}` +
    `&daily=temperature_2m_min,temperature_2m_max,precipitation_sum,weathercode` +
    `&timezone=auto` +
    `&start_date=${encodeURIComponent(dateISO)}` +
    `&end_date=${encodeURIComponent(dateISO)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return null;

  const data = await res.json();
  const d = data?.daily;
  if (!d?.time?.length) return null;

  return {
    date: d.time[0],
    tmin: d.temperature_2m_min?.[0],
    tmax: d.temperature_2m_max?.[0],
    rain: d.precipitation_sum?.[0],
    code: d.weathercode?.[0]
  };
}
