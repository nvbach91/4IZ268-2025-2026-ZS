export function formatWeatherData(data) {
    return {
        current: {
            temperature: data.current.temperature_2m,
            humidity: data.current.relative_humidity_2m,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
        },
        //odebírám aktulní hodinu aby předpověd byla na další hodinu ...
        // api nedovoluje vzít o hodinu víc než je takže z api beru předpověd na 13h a první hodinu dávám pryč
        hourly: data.hourly.time.slice(1).map((time, i) => ({
            time: new Date(time).getHours() + ':00',
            temperature: data.hourly.temperature_2m[i+1],
            weatherCode: data.hourly.weather_code[i+1],
        })),

        daily: data.daily.time.slice(1).map((date, i) => ({
            date: date,
            temperatureMax: Math.round(data.daily.temperature_2m_max[i+1]),
            temperatureMin: Math.round(data.daily.temperature_2m_min[i+1]),
            weatherCode: data.daily.weather_code[i],
        })),

    }
}

export const EMPTY_WEATHER_DATA = {
    // data pro WeatherInfoCard
    current: {
        temperature: null,
        humidity: null,
        windSpeed: null,
        weatherCode: null,
        hourly: [], //data pro Slider
    },
    daily: [], // data pro SideBar
};
