import axios from "axios";

const API_URL = "https://geocoding-api.open-meteo.com/v1/search";

export const searchLocations = async (cityName) => {
    try {
        const response = await axios.get(API_URL, {
            params: {
                name: cityName,
                count: 5,
                language: 'en',
            },
        });
        console.log(response);
        return response.data.results || [];
    } catch (error) {
        console.error("Error fetching location data:", error);
        return [];
    }
}

