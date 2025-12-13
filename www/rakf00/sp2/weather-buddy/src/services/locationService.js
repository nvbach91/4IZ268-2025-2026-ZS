import axios from "axios";

const API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const searchLocations = async (cityName) => {
    try {
        const response = await axios.get(API_URL, {
            params: {
                name: cityName, count: 5, language: 'en',
            },
        });

        if (!response.data.results) {
            return [];
        }

        const filteredData = response.data.results.map(location => ({
            id: location.id,
            name: location.name,
            country: location.country,
            latitude: location.latitude,
            longitude: location.longitude,
            timezone: location.timezone,
        }));
        return filteredData || [];
    } catch (error) {
        console.error("Error fetching location data:", error);
        return [];
    }
}

