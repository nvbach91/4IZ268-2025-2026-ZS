import {useEffect, useState} from 'react';
import useStoreSettings from "../store/useStoreSettings.jsx";
import {fetchWeatherData} from "../services/weatherService.js";
import {EMPTY_WEATHER_DATA} from "../utils/formatWeatherData.js";

export default function useWeatherFetch() {

    const currentLocation = useStoreSettings(state => state.settings.location);

    const [weatherData, setWeatherData] = useState(EMPTY_WEATHER_DATA);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
            const fetchData = async () => {
                setIsLoading(true);
                const data = await fetchWeatherData(currentLocation);
                setWeatherData(data);
                console.log(data);
                setIsLoading(false);
            }

            fetchData();
        }, [currentLocation]
    );


    return {weatherData, isLoading};
}
