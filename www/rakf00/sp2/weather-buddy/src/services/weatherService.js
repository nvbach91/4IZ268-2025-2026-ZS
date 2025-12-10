import axios from "axios";

const API_URL = "https://api.open-meteo.com/v1/forecast";

export const fetchWeatherData = async (location) => {
    try {
        const response = await axios.get(API_URL, {
            params: {
                latitude: location.latitude,
                longitude: location.longitude,
                current: "temperature_2m,precipitation,wind_speed_10m,weather_code",
                wind_speed_unit: "ms",
                timezone: "auto",
            }
        });

        const data = response.data.current;

        return {
            temperature: data.temperature_2m,
            precipitation: data.precipitation,
            windSpeed: data.wind_speed_10m,
            weatherCode: data.weather_code,
        }
    } catch
        (error) {
        console.error("Error fetching weather data:", error);
    }
}

