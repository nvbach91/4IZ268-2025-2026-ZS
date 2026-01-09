import {useEffect, useState} from "react";
import useStoreSettings from "../store/useStoreSettings.jsx";
import {fetchWeatherData} from "../services/weatherService.js";
import {EMPTY_WEATHER_DATA} from "../utils/formatWeatherData.js";

export default function useWeatherFetch(location) {
    const [weatherData, setWeatherData] = useState(EMPTY_WEATHER_DATA);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!location) {
            setWeatherData(EMPTY_WEATHER_DATA);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const data = await fetchWeatherData(location);
                if (data) {
                    setWeatherData(data);
                }
            } catch (error) {
                console.error("Error fetching weather data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [location?.latitude, location?.longitude]);

    return {weatherData, isLoading};
}

export function useCurrentLocationWeather() {
    const currentLocation = useStoreSettings((state) => state.settings.location);
    return useWeatherFetch(currentLocation);
}
