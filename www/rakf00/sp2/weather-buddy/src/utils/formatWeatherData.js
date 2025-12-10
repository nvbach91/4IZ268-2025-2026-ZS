export function formatWeatherData(data){
    return {
        info:{
            temperature: data.current.temperature_2m,
            precipitation: data.current.precipitation,
            windSpeed: data.current.wind_speed_10m,
            weatherCode: data.current.weather_code,
        },
        hourly:{
            temperature: data.hourly.temperature_2m,
            weatherCode: data.hourly.weather_code,
        },
        daily:{
            temperatureMax: data.daily.temperature_2m_max,
            temperatureMin: data.daily.temperature_2m_min,
            weatherCode: data.daily.weather_code,
        }
    }
}