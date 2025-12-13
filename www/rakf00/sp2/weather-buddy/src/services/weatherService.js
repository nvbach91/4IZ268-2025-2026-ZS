import axios from "axios";
import {formatWeatherData} from "../utils/formatWeatherData";

const API_URL = "https://api.open-meteo.com/v1/forecast?daily=weather_code,temperature_2m_max,temperature_2m_min&hourly=temperature_2m,weather_code&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&timezone=auto&forecast_days=7&wind_speed_unit=ms&forecast_hours=13&past_hours=0";

export const fetchWeatherData = async (location) => {
    try {
        const response = await axios.get(API_URL, {
            params: {
                latitude: location.latitude,
                longitude: location.longitude,
            }
        });

        console.log(response.data);
        return formatWeatherData(response.data);
    } catch
        (error) {
        console.error("Error fetching weather data:", error);
    }
}

