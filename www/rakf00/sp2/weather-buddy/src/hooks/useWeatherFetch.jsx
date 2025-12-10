import {useEffect, useState} from 'react';
import useStoreSettings from "../store/useStoreSettings.jsx";
import {fetchWeatherData} from "../services/weatherService.js";

export default function useWeatherFetch() {

    const currentLocation = useStoreSettings(state => state.settings.location);

    const [weatherData, setWeatherData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
            const fetchData = async () => {
                setIsLoading(true);
                const data = await fetchWeatherData(currentLocation);
                setWeatherData(data);
                setIsLoading(false);
                console.log(data);
            }

            fetchData();
        }, [currentLocation]
    );


    return {weatherData, isLoading};
}
